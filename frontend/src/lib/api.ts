import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

function readToken(key: string): string | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(key)
  if (!v || v === 'null' || v === 'undefined' || v.trim() === '') return null
  return v
}

function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

apiClient.interceptors.request.use((config) => {
  const token = readToken('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Single-flight refresh lock — prevents race condition where two parallel
//    401s both try to use the same (soon-to-be-rotated) refresh token ────────
let refreshPromise: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  const rt = readToken('refreshToken')
  if (!rt) { clearTokens(); return null }
  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: rt })
    const { accessToken, refreshToken: nr } = res.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', nr)
    return accessToken
  } catch {
    clearTokens()
    return null
  }
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      // Reuse an in-flight refresh instead of starting a second one
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => { refreshPromise = null })
      }
      const newToken = await refreshPromise

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      }
    }
    return Promise.reject(error)
  }
)

export const api = {
  get:    <T>(url: string, params?: object) => apiClient.get<{ success: boolean; data: T }>(url, { params }).then(r => r.data.data),
  post:   <T>(url: string, data?: object)   => apiClient.post<{ success: boolean; data: T; message: string }>(url, data).then(r => r.data),
  put:    <T>(url: string, data?: object)   => apiClient.put<{ success: boolean; data: T }>(url, data).then(r => r.data.data),
  patch:  <T>(url: string, data?: object)   => apiClient.patch<{ success: boolean; data: T }>(url, data).then(r => r.data.data),
  delete: (url: string)                     => apiClient.delete(url).then(r => r.data),
}

export default apiClient

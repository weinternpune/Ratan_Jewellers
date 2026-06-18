import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach token (admin first, then customer) ────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('adminAccessToken') ||
      localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: auto-refresh on 401 ────────────────────────────────────────────
apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const isAdmin = !!localStorage.getItem('adminRefreshToken')
        const rt = localStorage.getItem('adminRefreshToken') || localStorage.getItem('refreshToken')
        if (rt) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: rt })
          const { accessToken, refreshToken: nr } = res.data.data
          localStorage.setItem(isAdmin ? 'adminAccessToken' : 'accessToken', accessToken)
          localStorage.setItem(isAdmin ? 'adminRefreshToken' : 'refreshToken', nr)
          original.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(original)
        }
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        if (typeof window !== 'undefined') {
          window.location.href = window.location.pathname.startsWith('/admin')
            ? '/admin/login'
            : '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const api = {
  get:    <T>(url: string, params?: object) =>
    apiClient.get<{ success: boolean; data: T }>(url, { params }).then(r => r.data.data),
  post:   <T>(url: string, data?: object) =>
    apiClient.post<{ success: boolean; data: T; message: string }>(url, data).then(r => r.data),
  put:    <T>(url: string, data?: object) =>
    apiClient.put<{ success: boolean; data: T }>(url, data).then(r => r.data.data),
  patch:  <T>(url: string, data?: object) =>
    apiClient.patch<{ success: boolean; data: T }>(url, data).then(r => r.data.data),
  delete: (url: string) => apiClient.delete(url).then(r => r.data),
}

// Helper for raw fetch() calls
export const getAuthHeader = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('adminAccessToken') || localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export default apiClient

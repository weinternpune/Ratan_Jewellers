import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* -------------------------------------------------------------------------- */
/* Token Helpers                                                              */
/* -------------------------------------------------------------------------- */

const TOKEN_KEYS = {
  access: 'accessToken',
  refresh: 'refreshToken',

  // Legacy keys kept for backward compatibility
  adminAccess: 'adminAccessToken',
  adminRefresh: 'adminRefreshToken',
  ratanAccess: 'ratan_access_token',
  ratanRefresh: 'ratan_refresh_token',
}

export function readAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.access)
}

export function readRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.refresh)
}

export function writeTokens(
  accessToken: string,
  refreshToken: string
): void {
  if (typeof window === 'undefined') return

  // Canonical keys
  localStorage.setItem(TOKEN_KEYS.access, accessToken)
  localStorage.setItem(TOKEN_KEYS.refresh, refreshToken)

  // Legacy compatibility keys
  localStorage.setItem(TOKEN_KEYS.adminAccess, accessToken)
  localStorage.setItem(TOKEN_KEYS.adminRefresh, refreshToken)
  localStorage.setItem(TOKEN_KEYS.ratanAccess, accessToken)
  localStorage.setItem(TOKEN_KEYS.ratanRefresh, refreshToken)
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return

  Object.values(TOKEN_KEYS).forEach((key) =>
    localStorage.removeItem(key)
  )
}

/* -------------------------------------------------------------------------- */
/* Request Interceptor                                                        */
/* -------------------------------------------------------------------------- */

apiClient.interceptors.request.use((config) => {
  const token = readAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* -------------------------------------------------------------------------- */
/* Refresh Logic                                                              */
/* -------------------------------------------------------------------------- */

let refreshPromise: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  const refreshToken = readRefreshToken()

  if (!refreshToken) {
    clearTokens()
    return null
  }

  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    })

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = res.data.data

    writeTokens(accessToken, newRefreshToken)

    return accessToken
  } catch {
    clearTokens()
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* Response Interceptor                                                       */
/* -------------------------------------------------------------------------- */

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null
        })
      }

      const newToken = await refreshPromise

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

/* -------------------------------------------------------------------------- */
/* API Helpers                                                                */
/* -------------------------------------------------------------------------- */

export const api = {
  get: <T>(url: string, params?: object) =>
    apiClient
      .get<{ success: boolean; data: T }>(url, { params })
      .then((r) => r.data.data),

  post: <T>(url: string, data?: object) =>
    apiClient
      .post<{ success: boolean; data: T; message: string }>(url, data)
      .then((r) => r.data),

  put: <T>(url: string, data?: object) =>
    apiClient
      .put<{ success: boolean; data: T }>(url, data)
      .then((r) => r.data.data),

  patch: <T>(url: string, data?: object) =>
    apiClient
      .patch<{ success: boolean; data: T }>(url, data)
      .then((r) => r.data.data),

  delete: (url: string) =>
    apiClient.delete(url).then((r) => r.data),
}

export default apiClient

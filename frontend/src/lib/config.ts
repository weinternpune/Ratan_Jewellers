/**
 * Global Configuration
 * Centralized configuration for API URLs and other environment-specific settings
 */

// Determine if we're in browser or server
const isBrowser = typeof window !== 'undefined'

/**
 * Get the API URL with multiple fallback strategies
 * 1. Check NEXT_PUBLIC_API_URL from .env.local
 * 2. If in browser, try to construct from window.location
 * 3. Fallback to localhost:5000
 */
function getApiUrl(): string {
  // First priority: Environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // Second priority: Browser detection (production scenario)
  if (isBrowser) {
    const { protocol, hostname } = window.location
    
    // If running on localhost, use default backend port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api'
    }
    
    // If on a real domain, assume backend is on same domain with /api path
    // Example: https://ratanjewellers.com/api
    return `${protocol}//${hostname}/api`
  }

  // Final fallback: Default localhost
  return 'http://localhost:5000/api'
}

/**
 * Get the base backend URL (without /api)
 * Used for OAuth redirects and other non-API endpoints
 */
function getBackendUrl(): string {
  const apiUrl = getApiUrl()
  return apiUrl.replace('/api', '')
}

// Export configured URLs
export const API_URL = getApiUrl()
export const BACKEND_URL = getBackendUrl()

// Export configuration object
export const config = {
  apiUrl: API_URL,
  backendUrl: BACKEND_URL,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Log configuration in development (only in browser)
if (isBrowser && config.isDevelopment) {
  console.log('🔧 Frontend Configuration:', {
    'API URL': config.apiUrl,
    'Backend URL': config.backendUrl,
    'Environment': process.env.NODE_ENV,
    'Has .env.local': !!process.env.NEXT_PUBLIC_API_URL,
  })
}

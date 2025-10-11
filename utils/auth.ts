// utils/auth.ts
// Simple authentication utility for handling JWT tokens

let refreshPromise: Promise<boolean> | null = null
let refreshTimeout: NodeJS.Timeout | null = null

// Token storage functions
export function getAccessToken(): string | null {
  return localStorage.getItem("access")
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh")
}

export function getTokenExp(): string | null {
  return localStorage.getItem("exp")
}

export function getUserData(): any {
  const userData = localStorage.getItem("user")
  return userData ? JSON.parse(userData) : null
}

// Store tokens and user data from login response
export function storeAuthData(response: any): void {
  console.log('storeAuthData called with:', response)
  
  // Handle both response structures:
  // 1. Direct tokens: response.access, response.refresh, response.exp
  // 2. Nested tokens: response.data.access, response.data.refresh, response.data.exp
  
  const accessToken = response.access || response.data?.access
  const refreshToken = response.refresh || response.data?.refresh
  const expiration = response.exp || response.data?.exp
  
  if (!accessToken || !refreshToken || !expiration) {
    console.error('storeAuthData: Missing required tokens in response:', {
      hasAccess: !!accessToken,
      hasRefresh: !!refreshToken,
      hasExp: !!expiration,
      response: response
    })
    return
  }
  
  localStorage.setItem("access", accessToken)
  localStorage.setItem("refresh", refreshToken)
  localStorage.setItem("exp", expiration)
  
  // Handle user data - check both locations
  const userData = response.data || response.user
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData))
    
    // Store is_staff separately for quick access
    if (userData.is_staff !== undefined) {
      localStorage.setItem("is_staff", userData.is_staff.toString())
    }
  }
  
  // Also check if is_staff is directly in the response
  if (response.is_staff !== undefined) {
    localStorage.setItem("is_staff", response.is_staff.toString())
  }
  
  console.log('Auth data stored in localStorage:', {
    access: localStorage.getItem("access"),
    refresh: localStorage.getItem("refresh"),
    exp: localStorage.getItem("exp"),
    user: localStorage.getItem("user"),
    is_staff: localStorage.getItem("is_staff")
  })
  
  // Dispatch custom event to notify components of auth state change
  if (typeof window !== 'undefined') {
    console.log('Dispatching authStateChanged event')
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated: true } 
    }))
  }
}

// Clear all auth data
export function clearAuthData(): void {
  console.log('clearAuthData called - Stack trace:', new Error().stack)
  
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("exp")
  localStorage.removeItem("user")
  localStorage.removeItem("is_staff")
  
  // Dispatch custom event to notify components of auth state change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated: false } 
    }))
  }
}

// Check if access token is expired
export function isAccessTokenExpired(): boolean {
  const exp = getTokenExp()
  if (!exp) {
    console.log('isAccessTokenExpired: No expiration time found')
    return true
  }
  
  const expDate = new Date(exp)
  const now = new Date()
  
  // Consider expired 1 minute before actual expiration to be safe
  const isExpired = expDate.getTime() - 60000 <= now.getTime()
  
  console.log('isAccessTokenExpired:', {
    exp: exp,
    expDate: expDate.toISOString(),
    now: now.toISOString(),
    timeUntilExpiry: expDate.getTime() - now.getTime(),
    timeUntilExpiryMinutes: Math.round((expDate.getTime() - now.getTime()) / 60000),
    isExpired
  })
  
  return isExpired
}

// Check if refresh token is expired
export function isRefreshTokenExpired(): boolean {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    console.log('isRefreshTokenExpired: No refresh token')
    return true
  }
  
  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(refreshToken.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    const now = Date.now()
    
    const isExpired = exp <= now
    console.log('isRefreshTokenExpired:', {
      exp: new Date(exp).toISOString(),
      now: new Date(now).toISOString(),
      isExpired,
      timeUntilExpiry: exp - now
    })
    
    return isExpired
  } catch (error) {
    console.error('Error decoding refresh token:', error)
    console.log('Refresh token that failed to decode:', refreshToken.substring(0, 50) + '...')
    return true
  }
}

// Check if user has any authentication data (for initial state check)
export function hasAuthData(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const accessToken = getAccessToken()
  
  const result = !!accessToken
  console.log('hasAuthData check:', { accessToken: !!accessToken, result })
  return result
}

// Validate token format and structure - More lenient approach
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    console.log('isValidTokenFormat: Invalid token type or empty')
    return false
  }
  
  // JWT tokens should have 3 parts separated by dots
  const parts = token.split('.')
  if (parts.length !== 3) {
    console.log('isValidTokenFormat: Token does not have 3 parts:', parts.length)
    return false
  }
  
  // Basic validation - just check if parts exist and are not empty
  const hasValidParts = parts.every((part, index) => {
    if (!part || part.length === 0) {
      console.log(`isValidTokenFormat: Part ${index} is empty`)
      return false
    }
    return true
  })
  
  if (!hasValidParts) {
    console.log('isValidTokenFormat: Token has empty parts')
    return false
  }
  
  // Optional: Try to decode header and payload (parts 0 and 1) for basic validation
  // But don't fail if signature (part 2) has issues
  try {
    // Validate header (part 0)
    if (parts[0]) {
      try {
        atob(parts[0])
        console.log('isValidTokenFormat: Header decoded successfully')
      } catch (error) {
        console.warn('isValidTokenFormat: Header decoding failed, but continuing:', error)
      }
    }
    
    // Validate payload (part 1)
    if (parts[1]) {
      try {
        atob(parts[1])
        console.log('isValidTokenFormat: Payload decoded successfully')
      } catch (error) {
        console.warn('isValidTokenFormat: Payload decoding failed, but continuing:', error)
      }
    }
    
    console.log('isValidTokenFormat: Token format is valid (lenient check)')
    return true
  } catch (error) {
    console.warn('isValidTokenFormat: Token validation warning, but allowing:', error)
    return true // Be lenient - don't fail on decoding issues
  }
}

// Enhanced authentication check with token validation
export function isAuthenticated(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false
  }

  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  
  console.log('isAuthenticated check:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken
  })
  
  if (!accessToken) {
    console.log('isAuthenticated: No access token')
    return false
  }
  
  // For initial login, be more lenient with token validation
  // Check if we have both tokens (indicating recent login)
  const hasBothTokens = !!(accessToken && refreshToken)
  
  if (hasBothTokens) {
    // During login process, be more lenient
    console.log('isAuthenticated: Both tokens present, using lenient validation')
    
    // Basic format check - just ensure it has 3 parts
    const parts = accessToken.split('.')
    if (parts.length === 3) {
      console.log('isAuthenticated: Token has correct structure, allowing access')
      return true
    }
  }
  
  // Validate token format for existing sessions
  const accessValid = isValidTokenFormat(accessToken)
  
  console.log('isAuthenticated token validation:', {
    accessValid,
    hasBothTokens
  })
  
  if (!accessValid) {
    console.log('isAuthenticated: Invalid token format')
    // Don't clear tokens immediately, let smartFetch handle it
    return false
  }
  
  // Check if access token is expired
  const accessExpired = isAccessTokenExpired()
  console.log('isAuthenticated access token check:', {
    accessExpired
  })
  
  if (accessExpired) {
    console.log('isAuthenticated: Access token expired, but allowing access - smartFetch will handle refresh')
    // Don't clear tokens here, let smartFetch handle the refresh
    return true
  }
  
  console.log('isAuthenticated: All checks passed, user is authenticated')
  return true
}

// More lenient authentication check for initial state
export function isAuthenticatedLenient(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false
  }

  const accessToken = getAccessToken()
  
  // Just check if access token exists, don't validate format or expiration
  const result = !!accessToken
  console.log('isAuthenticatedLenient check:', { accessToken: !!accessToken, result })
  return result
}

// Refresh access token using refresh token
export async function refreshAccessTokenInBackground(): Promise<boolean> {
  // Prevent multiple simultaneous refresh attempts
  if (refreshPromise) {
    console.log('Refresh already in progress, waiting...')
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      // Validate refresh token format before attempting refresh - but be lenient
      if (!isValidTokenFormat(refreshToken)) {
        console.warn('Refresh token format validation failed, but attempting refresh anyway')
        // Don't throw error immediately - let the server decide
      }

      // Check if refresh token is expired
      if (isRefreshTokenExpired()) {
        throw new Error("Refresh token has expired")
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      if (!baseUrl) {
        throw new Error("Base URL not configured")
      }

      console.log('Attempting token refresh...')
      const response = await fetch(`${baseUrl}/v1/api/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Token refresh failed: ${response.status} - ${errorText}`)
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      
      // Validate response data
      if (!data.access || !data.refresh || !data.exp) {
        throw new Error("Invalid refresh response format")
      }
      
      // Store new tokens
      localStorage.setItem("access", data.access)
      localStorage.setItem("refresh", data.refresh)
      localStorage.setItem("exp", data.exp)
      
      console.log('Token refresh successful')
      
      // Dispatch auth state change event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
          detail: { isAuthenticated: true, refreshed: true } 
        }))
      }
      
      // Schedule next refresh
      scheduleNextRefresh()
      
      return true
    } catch (error) {
      console.error("Token refresh failed:", error)
      
      // If refresh fails, clear auth data and redirect to login
      clearAuthData()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        console.log('Redirecting to login due to refresh failure')
        window.location.href = '/login'
      }
      
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// Schedule next token refresh
export function scheduleNextRefresh(): void {
  // Clear existing timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout)
    refreshTimeout = null
  }

  const exp = getTokenExp()
  if (!exp) {
    console.log('No expiration time available, cannot schedule refresh')
    return
  }

  const expDate = new Date(exp)
  const now = new Date()
  
  // Refresh 5 minutes before expiration
  const timeUntilRefresh = Math.max(0, expDate.getTime() - now.getTime() - 300000)
  
  console.log(`Scheduling next refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`)
  
  if (timeUntilRefresh > 0) {
    refreshTimeout = setTimeout(() => {
      console.log('Scheduled refresh triggered')
      refreshAccessTokenInBackground()
    }, timeUntilRefresh)
  } else {
    console.log('Token expires soon, refreshing immediately')
    refreshAccessTokenInBackground()
  }
}

// Start background token refresh system - DISABLED
export function startBackgroundTokenRefresh(): void {
  console.log('startBackgroundTokenRefresh called - DISABLED (refresh only on 401 errors)')
  // Background refresh is disabled - tokens will only be refreshed on 401 errors
}

// Stop background token refresh
export function stopBackgroundTokenRefresh(): void {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout)
    refreshTimeout = null
  }
  refreshPromise = null
}

// Smart fetch function that handles authentication automatically
export async function smartFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Get current tokens
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  
  // If no access token available, throw a clear error
  if (!accessToken) {
    console.error('smartFetch: No access token available', { 
      hasAccessToken: !!accessToken,
      url 
    })
    throw new Error("No access token available")
  }

  // Validate token format before making request - but don't clear tokens immediately
  if (!isValidTokenFormat(accessToken)) {
    console.error('smartFetch: Invalid token format', { url })
    // Don't clear tokens immediately - let the server response determine if we should
    // The server will return 401 if the token is truly invalid
    console.warn('smartFetch: Proceeding with potentially invalid token, server will validate')
  }

  // Make request with access token
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    ...options.headers,
  }

  console.log('smartFetch: Making request with token', { url, hasToken: !!accessToken })

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Log response details for debugging
  console.log('smartFetch: Response received', { 
    url, 
    status: response.status, 
    statusText: response.statusText 
  })

  // If we get 401, try to refresh token and retry once
  if (response.status === 401 && refreshToken && !isRefreshTokenExpired()) {
    console.log('smartFetch: Got 401, attempting token refresh...')
    const refreshed = await refreshAccessTokenInBackground()
    if (refreshed) {
      const newAccessToken = getAccessToken()
      if (newAccessToken) {
        const retryHeaders = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${newAccessToken}`,
          ...options.headers,
        }
        
        console.log('smartFetch: Retrying request with new token')
        const retryResponse = await fetch(url, {
          ...options,
          headers: retryHeaders,
        })
        
        console.log('smartFetch: Retry response received', { 
          url, 
          status: retryResponse.status, 
          statusText: retryResponse.statusText 
        })
        
        return retryResponse
      }
    } else {
      // Refresh failed, redirect to login
      console.log('smartFetch: Token refresh failed, redirecting to login')
      clearAuthData()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }

  return response
}

// Check if user has staff privileges
export function isStaff(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  // First check direct is_staff field in localStorage
  const directStaffStatus = localStorage.getItem("is_staff")
  if (directStaffStatus !== null) {
    const isStaffDirect = directStaffStatus === 'true'
    console.log('isStaff check (direct):', { 
      directStaffStatus, 
      isStaffDirect 
    })
    return isStaffDirect
  }
  
  // Fallback to user data
  const userData = getUserData()
  if (!userData) {
    console.log('isStaff: No user data found')
    return false
  }
  
  const hasStaffPrivileges = userData.is_staff === true
  console.log('isStaff check (userData):', { 
    userData: userData, 
    is_staff: userData.is_staff, 
    hasStaffPrivileges 
  })
  
  return hasStaffPrivileges
}

// Check if user is authenticated AND has staff privileges
export function isAuthenticatedStaff(): boolean {
  const isAuth = isAuthenticated()
  const isStaffUser = isStaff()
  
  console.log('isAuthenticatedStaff check:', { 
    isAuth, 
    isStaffUser, 
    result: isAuth && isStaffUser 
  })
  
  return isAuth && isStaffUser
}

// Debug function to check all auth-related data
export function debugAuthState(): void {
  if (typeof window === 'undefined') {
    console.log('debugAuthState: Not in browser environment')
    return
  }
  
  console.log('=== AUTH DEBUG STATE ===')
  console.log('Access Token:', localStorage.getItem("access") ? 'Present' : 'Missing')
  console.log('Refresh Token:', localStorage.getItem("refresh") ? 'Present' : 'Missing')
  console.log('Expiration:', localStorage.getItem("exp"))
  console.log('User Data:', localStorage.getItem("user"))
  console.log('Is Staff:', localStorage.getItem("is_staff"))
  console.log('isAuthenticated():', isAuthenticated())
  console.log('isStaff():', isStaff())
  console.log('isAuthenticatedStaff():', isAuthenticatedStaff())
  console.log('========================')
}

// Legacy function for backward compatibility
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return smartFetch(url, options)
}

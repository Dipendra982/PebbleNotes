/**
 * Centralized Authentication Utilities
 * Simple and secure token management
 */

const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000`;
const SESSION_KEY = 'pebble_session';

/**
 * Get current user session (user + token)
 */
export const getSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

/**
 * Save user session
 */
export const setSession = (user, token) => {
  try {
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    return null;
  }
};

/**
 * Clear session (logout)
 */
export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
};

/**
 * Get auth token
 */
export const getToken = () => {
  const session = getSession();
  return session?.token || null;
};

/**
 * Secure fetch wrapper with automatic token injection
 */
export const authFetch = async (url, options = {}) => {
  const token = getToken();
  
  // Build full URL if relative
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  // Add Authorization header
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add Content-Type for JSON bodies
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });
    
    // Handle auth errors
    if (response.status === 401 || response.status === 403) {
      const data = await response.json().catch(() => ({}));
      
      // If token is invalid/expired, clear session and redirect to login
      if (data.error?.includes('token') || data.error?.includes('Invalid') || data.error?.includes('Access')) {
        clearSession();
        window.location.href = '/#/signin';
        throw new Error('Session expired. Please sign in again.');
      }
    }
    
    return response;
  } catch (error) {
    console.error('Auth fetch error:', error);
    throw error;
  }
};

/**
 * Verify current session is valid
 */
export const verifySession = async () => {
  const session = getSession();
  if (!session || !session.token) {
    return null;
  }
  
  try {
    const response = await authFetch('/api/auth/me');
    if (!response.ok) {
      clearSession();
      return null;
    }
    
    const user = await response.json();
    // Update session with fresh user data
    setSession(user, session.token);
    return user;
  } catch {
    clearSession();
    return null;
  }
};

/**
 * Make avatar URL absolute
 */
export const makeAbsoluteUrl = (url) => {
  if (!url) return url;
  if (typeof url === 'string' && url.startsWith('/uploads')) {
    return `${API_BASE}${url}`;
  }
  return url;
};

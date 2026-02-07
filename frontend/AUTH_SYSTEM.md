# Authentication System Documentation

## Overview
Simple and secure JWT-based authentication system for PebbleNotes.

## Features
✅ **Centralized Token Management** - All auth logic in one place (`authUtils.js`)
✅ **Automatic Token Injection** - No need to manually add Authorization headers
✅ **Session Validation** - Verifies token on app startup
✅ **Auto-Redirect on Expired Token** - Redirects to login if token is invalid
✅ **Secure Storage** - Tokens stored in localStorage with user data
✅ **Consistent URL Handling** - Automatic conversion of relative avatar/upload URLs

## Core Functions

### `getSession()`
Returns current user session with token
```javascript
const session = getSession();
// Returns: { id, name, email, role, avatar, token } or null
```

### `setSession(user, token)`
Saves user session securely
```javascript
setSession(user, token);
```

### `clearSession()`
Logout - clears stored session
```javascript
clearSession();
```

### `getToken()`
Get just the JWT token
```javascript
const token = getToken();
```

### `authFetch(url, options)`
**USE THIS for all authenticated API calls**
Automatically adds Authorization header and handles auth errors
```javascript
// Instead of:
fetch('http://localhost:4000/api/users/profile', {
  headers: { Authorization: `Bearer ${token}` }
})

// Use:
authFetch('/api/users/profile')

// With POST/PUT:
authFetch('/api/users/profile', {
  method: 'PUT',
  body: JSON.stringify({ name: 'New Name' })
})
```

### `verifySession()`
Validates current token with backend
```javascript
const user = await verifySession();
if (user) {
  // Token is valid, user data refreshed
} else {
  // Token invalid, session cleared
}
```

### `makeAbsoluteUrl(url)`
Converts relative upload URLs to absolute URLs
```javascript
const avatarUrl = makeAbsoluteUrl(user.avatar);
// '/uploads/avatars/...' → 'http://localhost:4000/uploads/avatars/...'
```

## Usage Examples

### Login
```javascript
import { setSession } from '../authUtils';

const handleLogin = async () => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const { user, token } = await res.json();
  setSession(user, token);
  navigate('/dashboard');
};
```

### Logout
```javascript
import { clearSession } from '../authUtils';

const handleLogout = () => {
  clearSession();
  navigate('/signin');
};
```

### Protected API Call
```javascript
import { authFetch } from '../authUtils';

const updateProfile = async () => {
  const res = await authFetch('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify({ name: newName })
  });
  const data = await res.json();
};
```

### Check Auth Status
```javascript
import { getSession } from '../authUtils';

useEffect(() => {
  const session = getSession();
  if (!session) {
    navigate('/signin');
  }
}, []);
```

## Security Features

1. **Token Expiration Handling**: Automatically detects expired/invalid tokens (401/403 responses)
2. **Auto-Redirect**: Redirects to login when token is invalid
3. **Session Validation**: Verifies token on app startup
4. **Secure Storage**: Uses localStorage (sufficient for college project)

## Migration Notes

### Old Code
```javascript
// ❌ Old way
const session = getStore.session();
const token = session?.token;
fetch('http://localhost:4000/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### New Code
```javascript
// ✅ New way
import { authFetch } from '../authUtils';
authFetch('/api/endpoint')
```

## Files Updated

- ✅ `frontend/authUtils.js` - New centralized auth utilities
- ✅ `frontend/App.jsx` - Session validation on mount
- ✅ `frontend/pages/Login.jsx` - Uses setSession
- ✅ `frontend/pages/Profile.jsx` - Uses authFetch
- ✅ `frontend/pages/Dashboard.jsx` - Uses authFetch
- ✅ `frontend/pages/NoteDetail.jsx` - Uses authFetch
- ✅ `frontend/components/Navbar.jsx` - Uses makeAbsoluteUrl

## Backend Token Flow

1. User signs in → Backend generates JWT
2. Frontend stores JWT in session
3. All authenticated requests include JWT in Authorization header
4. Backend validates JWT on each request
5. If JWT invalid → Backend returns 401/403
6. Frontend clears session and redirects to login

## Testing

1. **Sign Up**: Create account → Should receive verification email
2. **Sign In**: Login → Should set session and redirect to dashboard
3. **Protected Routes**: Access dashboard/profile → Should work with valid session
4. **Token Expiry**: Wait for token to expire → Should auto-redirect to login
5. **Logout**: Click logout → Should clear session and redirect

## Notes

- Token stored in localStorage (sufficient for college project scope)
- Session validated once on app startup
- Auto-redirect on auth errors prevents blank screens
- All avatar/upload URLs automatically converted to absolute URLs

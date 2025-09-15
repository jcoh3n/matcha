const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  // User endpoints
  getUsers: () => fetch(`${API_BASE_URL}/api/users`),
  getUser: (id: string) => fetch(`${API_BASE_URL}/api/users/${id}`),
  
  // Auth endpoints
  login: (credentials: { email: string; password: string }) => 
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }),
    
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => 
    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),
    
  logout: (token: string) => 
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }),
    
  refresh: (refreshToken: string) => 
    fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    }),
    
  getCurrentUser: (token: string) => 
    fetch(`${API_BASE_URL}/api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    
  // Discovery endpoints
  getDiscoveryUsers: (token: string, limit?: number, offset?: number) => 
    fetch(`${API_BASE_URL}/api/discovery?limit=${limit || 20}&offset=${offset || 0}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    
  getRandomUsers: (token: string, limit?: number) => 
    fetch(`${API_BASE_URL}/api/discovery/random?limit=${limit || 9}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    
  searchUsers: (token: string, query: string, limit?: number, offset?: number) => 
    fetch(`${API_BASE_URL}/api/discovery/search?query=${encodeURIComponent(query)}&limit=${limit || 20}&offset=${offset || 0}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    
  // Profile endpoints
  completeOnboarding: (token: string, profileData: any) => 
    fetch(`${API_BASE_URL}/api/onboarding/complete`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })
};
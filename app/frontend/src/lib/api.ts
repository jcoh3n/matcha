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
    
  getFilteredUsers: (
    token: string, 
    filters: { 
      ageMin?: number; 
      ageMax?: number; 
      distance?: number; 
      tags?: string[]; 
      sortBy?: string; 
      sortOrder?: string;
      fameRating?: number;
    },
    limit?: number, 
    offset?: number
  ) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (filters.ageMin) params.append('ageMin', filters.ageMin.toString());
    if (filters.ageMax) params.append('ageMax', filters.ageMax.toString());
    if (filters.distance) params.append('distance', filters.distance.toString());
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.fameRating) params.append('fameRating', filters.fameRating.toString());
    
    return fetch(`${API_BASE_URL}/api/discovery/filtered?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
    
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
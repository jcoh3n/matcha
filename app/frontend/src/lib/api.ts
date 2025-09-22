import { authService } from "@/services/authService";
import { config, API_ENDPOINTS } from "@/config/api";

export const api = {
  // User endpoints
  getUsers: () => authService.authenticatedFetch(API_ENDPOINTS.USERS),
  getUser: (id: string) => authService.authenticatedFetch(API_ENDPOINTS.USER(id)),
  
  // Auth endpoints
  login: (credentials: { email: string; password: string }) => 
    fetch(`${config.apiUrl}${API_ENDPOINTS.AUTH_LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }),
    
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => 
    fetch(`${config.apiUrl}${API_ENDPOINTS.AUTH_REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),
    
  logout: (token: string) => 
    fetch(`${config.apiUrl}${API_ENDPOINTS.AUTH_LOGOUT}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }),
    
  refresh: (refreshToken: string) => 
    fetch(`${config.apiUrl}${API_ENDPOINTS.AUTH_REFRESH}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    }),
    
  getCurrentUser: () => 
    authService.authenticatedFetch(API_ENDPOINTS.CURRENT_USER),
    
  // Discovery endpoints
  getDiscoveryUsers: (limit?: number, offset?: number) => 
    authService.authenticatedFetch(`${API_ENDPOINTS.DISCOVERY}?limit=${limit || 20}&offset=${offset || 0}`),
    
  getRandomUsers: (limit?: number) => 
    authService.authenticatedFetch(`${API_ENDPOINTS.DISCOVERY_RANDOM}?limit=${limit || 9}`),
    
  searchUsers: (query: string, limit?: number, offset?: number) => 
    authService.authenticatedFetch(`${API_ENDPOINTS.DISCOVERY_SEARCH}?query=${encodeURIComponent(query)}&limit=${limit || 20}&offset=${offset || 0}`),
    
  getFilteredUsers: (
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
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    if (filters.ageMin) params.append("ageMin", filters.ageMin.toString());
    if (filters.ageMax) params.append("ageMax", filters.ageMax.toString());
    if (filters.distance)
      params.append("distance", filters.distance.toString());
    if (filters.tags) params.append("tags", filters.tags.join(","));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.fameRating)
      params.append("fameRating", filters.fameRating.toString());

    return authService.authenticatedFetch(`${API_ENDPOINTS.DISCOVERY}/filtered?${params.toString()}`);
  },
  
  passUser: (userId: string | number) => 
    authService.authenticatedFetch(`/api/profiles/${userId}/pass`, {
      method: 'POST'
    }),
    
  // Profile endpoints
  completeOnboarding: (profileData: any) => 
    authService.authenticatedFetch(API_ENDPOINTS.ONBOARDING_COMPLETE, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    }),
    
  // Notification endpoints
  getNotifications: () => 
    authService.authenticatedFetch(API_ENDPOINTS.NOTIFICATIONS),
    
  markNotificationAsRead: (id: number) => 
    authService.authenticatedFetch(API_ENDPOINTS.NOTIFICATION_READ(id), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      }
    }),
    
  markAllNotificationsAsRead: () => 
    authService.authenticatedFetch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      }
    }),
    
  // Messages endpoints
  sendMessage: (messageData: { receiverId: number; content: string }) => 
    authService.authenticatedFetch(API_ENDPOINTS.MESSAGES, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    }),
    
  getConversation: (userId: number) => 
    authService.authenticatedFetch(API_ENDPOINTS.MESSAGE_CONVERSATION(userId)),
    
  getUnreadMessagesCount: () => 
    authService.authenticatedFetch(API_ENDPOINTS.MESSAGES_UNREAD_COUNT)
};

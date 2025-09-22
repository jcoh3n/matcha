// Environment variables validation
const validateEnv = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not defined in environment variables');
  }
  
  return {
    apiUrl
  };
};

// Get validated environment variables
export const config = validateEnv();

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: '/api/users',
  USER: (id: string) => `/api/users/${id}`,
  CURRENT_USER: '/api/me',
  
  // Auth endpoints
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_RESEND_VERIFICATION: '/api/auth/resend-verification',
  
  // Discovery endpoints
  DISCOVERY: '/api/discovery',
  DISCOVERY_RANDOM: '/api/discovery/random',
  DISCOVERY_SEARCH: '/api/discovery/search',
  
  // Profile endpoints
  ONBOARDING_COMPLETE: '/api/onboarding/complete',
  
  // Notification endpoints
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_READ: (id: number) => `/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',
  
  // Messages endpoints
  MESSAGES: '/api/messages',
  MESSAGE_CONVERSATION: (userId: number) => `/api/messages/${userId}`,
  MESSAGES_UNREAD_COUNT: '/api/messages/unread/count'
};
import { api } from "@/lib/api";
import { config, API_ENDPOINTS } from "@/config/api";

class AuthService {
  private isRefreshing = false;
  private refreshSubscribers: Array<() => void> = [];

  // Get tokens from localStorage
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  // Set tokens in localStorage
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  // Clear tokens from localStorage
  clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  // Subscribe to token refresh
  subscribeTokenRefresh(callback: () => void): void {
    this.refreshSubscribers.push(callback);
  }

  // Notify all subscribers that token has been refreshed
  onTokenRefreshed(): void {
    this.refreshSubscribers.forEach(callback => callback());
    this.refreshSubscribers = [];
  }

  // Refresh tokens
  async refreshTokens(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await api.refresh(refreshToken);
      
      if (!response.ok) {
        throw new Error("Token refresh failed");
      }
      
      const data = await response.json();
      
      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
        this.onTokenRefreshed();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      this.clearTokens();
      return false;
    }
  }

  // Make an authenticated request with automatic token refresh
  async authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      throw new Error("No access token available");
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${accessToken}`
    };

    const url = `${config.apiUrl}${endpoint}`;

    // Make the request
    let response = await fetch(url, {
      ...options,
      headers
    });

    // If we get a 401, try to refresh the token
    if (response.status === 401) {
      // If we're already refreshing, wait for it to complete
      if (this.isRefreshing) {
        return new Promise((resolve) => {
          this.subscribeTokenRefresh(async () => {
            const newAccessToken = this.getAccessToken();
            const newHeaders = {
              ...options.headers,
              "Authorization": `Bearer ${newAccessToken}`
            };
            
            const newResponse = await fetch(url, {
              ...options,
              headers: newHeaders
            });
            
            resolve(newResponse);
          });
        });
      }

      // Set refreshing flag
      this.isRefreshing = true;

      // Try to refresh the token
      const refreshed = await this.refreshTokens();
      
      // Reset refreshing flag
      this.isRefreshing = false;

      if (refreshed) {
        // Retry the original request with the new token
        const newAccessToken = this.getAccessToken();
        const newHeaders = {
          ...options.headers,
          "Authorization": `Bearer ${newAccessToken}`
        };
        
        response = await fetch(url, {
          ...options,
          headers: newHeaders
        });
      } else {
        // If refresh failed, clear tokens and redirect to login
        this.clearTokens();
        window.location.href = "/auth/login";
      }
    }

    return response;
  }
}

export const authService = new AuthService();
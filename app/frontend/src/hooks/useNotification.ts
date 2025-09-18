import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Notification {
  id: number;
  userId: number;
  fromUserId?: number;
  type: "LIKE" | "VISIT" | "MATCH" | "MESSAGE" | "UNLIKE";
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock auth hook - replace with actual auth implementation
function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  
  return { token, user, setUser, setToken };
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token, user } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      if (!token) return;
      
      const response = await api.getNotifications(token);
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: number) => {
    try {
      if (!token) return;
      
      await api.markNotificationAsRead(token, id);
      
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!token) return;
      
      await api.markAllNotificationsAsRead(token);
      
      setNotifications(notifications.map(notification => 
        ({ ...notification, read: true })
      ));
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Refresh notifications periodically
  useEffect(() => {
    if (token) {
      fetchNotifications();
      
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [token]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
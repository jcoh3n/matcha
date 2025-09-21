import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import io from "socket.io-client";

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

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Get user ID from localStorage
  const getUserId = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return null;
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const token = getToken();
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
      const token = getToken();
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
      const token = getToken();
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

  // Add a new notification to the list
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Set up Socket.IO connection
  useEffect(() => {
    const token = getToken();
    const userId = getUserId();
    
    if (token && userId) {
      // Create Socket.IO connection
      const wsUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const socket = io(wsUrl, {
        transports: ["websocket"],
        auth: {
          token: token
        }
      });
      
      socket.on("connect", () => {
        console.log("Socket.IO connected");
        // Authenticate the user
        socket.emit("authenticate", { userId });
      });
      
      socket.on("notification", (data) => {
        console.log("Received real-time notification:", data);
        // Add new notification to the list
        addNotification(data);
      });
      
      socket.on("message", (data) => {
        console.log("Received real-time message:", data);
        // We could handle real-time messages here if needed
        // For now, we'll just trigger a notification
        if (data.senderId !== getUserId()) {
          addNotification({
            id: Date.now(),
            userId: getUserId(),
            fromUserId: data.senderId,
            type: "MESSAGE",
            content: `New message from ${data.senderName}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
      });
      
      socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
      });
      
      return () => {
        socket.close();
      };
    }
  }, []);

  // Refresh notifications periodically
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchNotifications();
      
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
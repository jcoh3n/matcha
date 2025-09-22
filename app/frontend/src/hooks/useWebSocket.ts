import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

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

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Get user ID and token from localStorage
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        const userId = user.id;
        
        // Create Socket.IO connection
        const wsUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const newSocket = io(wsUrl, {
          transports: ["websocket"],
          auth: {
            token: token
          }
        });
        
        setSocket(newSocket);
        
        newSocket.on("connect", () => {
          console.log("Socket.IO connected");
          setIsConnected(true);
          
          // Authenticate the user
          newSocket.emit("authenticate", { userId });
        });
        
        newSocket.on("notification", (data) => {
          console.log("Received notification:", data);
          // Add new notification to the list
          setNotifications(prev => [data, ...prev]);
        });
        
        newSocket.on("disconnect", () => {
          console.log("Socket.IO disconnected");
          setIsConnected(false);
        });
        
        newSocket.on("connect_error", (error) => {
          console.error("Socket.IO connection error:", error);
        });
        
        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error("Error setting up Socket.IO connection:", error);
      }
    }
  }, []);

  return { isConnected, notifications, socket };
}
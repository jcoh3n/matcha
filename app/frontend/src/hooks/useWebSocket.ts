import { useState, useEffect, useRef } from "react";

interface Notification {
  id: number;
  userId: number;
  fromUserId?: number;
  type: "LIKE" | "VISIT" | "MATCH" | "MESSAGE" | "UNLIKE";
  content: string;
  read: boolean;
  createdAt: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Get user ID from localStorage or other auth mechanism
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      // Create WebSocket connection
      const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:3000').replace('http', 'ws');
      ws.current = new WebSocket(`${wsUrl}/socket.io/?EIO=4&transport=websocket`);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Authenticate the user
        ws.current?.send(JSON.stringify({
          type: 'authenticate',
          data: { userId: parseInt(userId) }
        }));
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            // Add new notification to the list
            setNotifications(prev => [data.data, ...prev]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
    
    // Clean up WebSocket connection
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return { isConnected, notifications };
}
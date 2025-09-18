import { useState, useEffect } from "react";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotification } from "@/hooks/useNotification";
import { useWebSocket } from "@/hooks/useWebSocket";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications: apiNotifications, markAsRead, markAllAsRead } = useNotification();
  const { notifications: wsNotifications } = useWebSocket();
  
  // Combine API and WebSocket notifications
  const allNotifications = [...wsNotifications, ...apiNotifications];

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const panel = document.getElementById("notification-panel");
      const bell = document.getElementById("notification-bell");
      
      if (
        isOpen &&
        panel &&
        bell &&
        !panel.contains(event.target as Node) &&
        !bell.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="notification-panel"
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        {allNotifications.some((n) => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
            className="text-xs"
          >
            Tout marquer comme lu
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-96">
        <div className="p-2">
          {allNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune notification
            </div>
          ) : (
            allNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                type={notification.type}
                content={notification.content}
                read={notification.read}
                createdAt={notification.createdAt}
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
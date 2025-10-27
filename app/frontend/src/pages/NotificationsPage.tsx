import { useNotification } from "@/hooks/useNotification";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (id: number, fromUserId?: number) => {
    // Mark notification as read
    markAsRead(id);
    
    // Navigate to user profile if fromUserId exists
    if (fromUserId) {
      navigate(`/profiles/${fromUserId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6">
      <h1 className="font-montserrat text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 sm:mb-6">
        Notifications
      </h1>
      <div className="rounded-2xl sm:rounded-3xl card-shadow border-0 bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6">
          <h2 className="font-display text-xl">Notifications</h2>
          {notifications.some((n) => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs text-muted-foreground hover:text-foreground transition-smooth h-8 px-3"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-200px)] sm:h-96">
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            {notifications.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  fromUserId={notification.fromUserId}
                  type={notification.type}
                  content={notification.content}
                  read={notification.read}
                  createdAt={notification.createdAt}
                  onMarkAsRead={markAsRead}
                  onClick={() => handleNotificationClick(notification.id, notification.fromUserId)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

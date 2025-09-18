import { useNotification } from "@/hooks/useNotification";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-montserrat text-3xl font-extrabold tracking-tight mb-6">
        Notifications
      </h1>
      <div className="rounded-3xl card-shadow border-0 bg-white">
        <div className="flex flex-row items-center justify-between p-6">
          <h2 className="font-display text-xl">Notifications</h2>
          {notifications.some((n) => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs text-muted-foreground hover:text-foreground transition-smooth"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          <div className="space-y-4 p-2">
            {notifications.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
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
    </div>
  );
}

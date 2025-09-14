import { useState } from "react";
import {
  NotificationCenter,
  NotificationItem,
} from "@/components/ui/notification-center";

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: "1",
      type: "match",
      user: "Emma",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: "like",
      user: "Marcus",
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: "3",
      type: "message",
      user: "Sophie",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-montserrat text-3xl font-extrabold tracking-tight mb-6">
        Notifications
      </h1>
      <NotificationCenter
        items={items}
        onMarkAll={() => setItems((i) => i.map((n) => ({ ...n, read: true })))}
      />
    </div>
  );
}

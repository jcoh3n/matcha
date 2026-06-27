import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NotificationItemProps {
  id: number;
  fromUserId?: number;
  type: "LIKE" | "VISIT" | "MATCH" | "MESSAGE" | "UNLIKE";
  content: string;
  read: boolean;
  createdAt: string;
  onMarkAsRead: (id: number) => void;
  onClick?: () => void;
}

export function NotificationItem({
  id,
  fromUserId,
  type,
  content,
  read,
  createdAt,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case "LIKE":
        return "❤️";
      case "VISIT":
        return "👀";
      case "MATCH":
        return "💕";
      case "MESSAGE":
        return "💬";
      case "UNLIKE":
        return "💔";
      default:
        return "🔔";
    }
  };

  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: enUS,
    });
  };

  return (
    <Card
      className={`p-4 mb-2 flex items-start gap-3 cursor-pointer ${read ? "bg-white" : "bg-primary/5"}`}
      onClick={onClick}
    >
      <div className="text-xl">{getIcon()}</div>
      <div className="flex-1">
        <p className={`${read ? "text-foreground" : "text-foreground font-medium"}`}>
          {content}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{getTimeAgo()}</p>
      </div>
      {!read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(id);
          }}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}
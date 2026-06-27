import { Compass, Search, MessageCircle, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type NavKey =
  | "discover"
  | "matches"
  | "messages"
  | "profile"
  | "notifications"
  | "search";

interface FooterProps {
  currentPage?: NavKey;
  notificationCount?: number;
  messageCount?: number;
  onNavigate?: (page: string) => void;
}

export function Footer({
  currentPage = "discover",
  notificationCount = 0,
  messageCount = 0,
  onNavigate,
}: FooterProps) {
  const navigate = useNavigate();

  const navItems: { id: NavKey; icon: typeof Compass; label: string; badge?: number }[] = [
    { id: "discover", icon: Compass, label: "Discover" },
    { id: "search", icon: Search, label: "Search" },
    { id: "messages", icon: MessageCircle, label: "Messages", badge: messageCount },
    { id: "notifications", icon: Bell, label: "Notifications", badge: notificationCount },
    { id: "profile", icon: User, label: "Profile" },
  ];

  const handleNavigation = (id: string) => {
    if (onNavigate) onNavigate(id);
    else navigate(`/${id}`);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-smooth",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] leading-none h-4 min-w-[16px] px-1 font-semibold">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}

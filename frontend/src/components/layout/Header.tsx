import { Bell, MessageCircle, Heart, Compass, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  currentPage?:
    | "discover"
    | "matches"
    | "messages"
    | "profile"
    | "notifications"
    | "search";
  notificationCount?: number;
  messageCount?: number;
  onNavigate?: (page: string) => void;
}

export function Header({
  currentPage = "discover",
  notificationCount = 0,
  messageCount = 0,
  onNavigate,
}: HeaderProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: "discover", icon: Compass, label: "Discover", path: "/discover" },
    { id: "matches", icon: Heart, label: "Matches", path: "/matches" },
    {
      id: "messages",
      icon: MessageCircle,
      label: "Messages",
      path: "/messages",
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
    },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-border/40">
      <div className="container mx-auto h-16 flex items-center">
        <button
          onClick={() => navigate("/discover")}
          className="font-montserrat font-extrabold text-xl tracking-tight text-black select-none"
        >
          Matcha
        </button>
        <nav className="flex-1 flex justify-center gap-8 font-montserrat text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const showBadge =
              (item.id === "messages" && messageCount > 0) ||
              (item.id === "matches" && notificationCount > 0);
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate?.(item.id);
                  navigate(item.path);
                }}
                className={cn(
                  "relative inline-flex items-center gap-2 font-medium px-1 pb-1 transition-colors",
                  isActive
                    ? "text-black after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary"
                    : "text-neutral-500 hover:text-black"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {showBadge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full flex items-center justify-center"
                  >
                    {item.id === "messages" ? messageCount : notificationCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/notifications")}
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 transition"
          >
            <Bell className="w-5 h-5 text-neutral-700" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded-full flex items-center justify-center"
              >
                {notificationCount}
              </Badge>
            )}
          </button>
        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 backdrop-blur bg-white/85">
        <nav className="flex justify-around py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate?.(item.id);
                  navigate(item.path);
                }}
                className={cn(
                  "flex flex-col items-center gap-0.5 p-2 rounded-xl text-[11px] transition",
                  isActive
                    ? "text-black font-medium"
                    : "text-neutral-500 hover:text-black"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

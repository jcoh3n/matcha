import {
  Compass,
  Search as SearchIcon,
  MessageCircle,
  Bell,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type NavKey =
  | "discover"
  | "matches"
  | "messages"
  | "profile"
  | "notifications"
  | "search";

interface HeaderProps {
  currentPage?: NavKey;
  notificationCount?: number;
  messageCount?: number;
  onNavigate?: (page: string, query?: string) => void;
  onLogout?: () => void;
}

export function Header({
  currentPage = "discover",
  notificationCount = 0,
  messageCount = 0,
  onNavigate,
  onLogout,
}: HeaderProps) {
  const navigate = useNavigate();

  const go = (page: string) => {
    if (onNavigate) onNavigate(page);
    else navigate(`/${page}`);
  };

  const navItems: { id: NavKey; label: string; icon: typeof Compass; badge?: number }[] = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "search", label: "Search", icon: SearchIcon },
    { id: "messages", label: "Messages", icon: MessageCircle, badge: messageCount },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notificationCount },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur-md border-b border-border">
      <button
        onClick={() => go("discover")}
        className="flex items-center gap-2"
        aria-label="Matcha — accueil"
      >
        <img src="/matcha.svg" alt="Matcha" className="h-7 w-auto" />
        <span className="text-lg font-semibold tracking-tight">matcha</span>
      </button>

      <ul className="flex items-center gap-1">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const active = currentPage === id;
          return (
            <li key={id}>
              <button
                onClick={() => go(id)}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-smooth",
                  active
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {badge ? (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] leading-none h-4 min-w-[16px] px-1 font-semibold">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span className="hidden lg:inline">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => onLogout?.()}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-muted-foreground hover:text-destructive hover:bg-secondary/60 transition-smooth"
        aria-label="Log out"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden lg:inline">Log out</span>
      </button>
    </nav>
  );
}

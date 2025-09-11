import { Bell, MessageCircle, Heart, Compass, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

  // Log when component mounts and when props change
  useEffect(() => {
    console.log("Header component mounted/updated");
    console.log("onLogout prop:", onLogout);
  }, [onLogout]);

  const handleLogout = () => {
    console.log("Logout button clicked in Header");
    console.log("onLogout function:", onLogout);
    if (onLogout) {
      console.log("Calling onLogout function");
      onLogout();
    } else {
      console.log("No onLogout function provided");
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5 text-black">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold tracking-tight font-montserrat">
          Matcha
        </span>
      </div>
      <ul className="hidden md:flex items-center gap-8 font-medium font-montserrat">
        <li>
          <button
            onClick={() => {
              if (onNavigate) onNavigate("messages");
              else navigate("/messages");
            }}
            className="relative flex items-center gap-2 hover:opacity-80 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Messages</span>
            {messageCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/90 text-white text-[10px] leading-none h-4 min-w-[16px] px-1 font-semibold">
                {messageCount > 99 ? "99+" : messageCount}
              </span>
            )}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              if (onNavigate) onNavigate("notifications");
              else navigate("/notifications");
            }}
            className="relative flex items-center gap-2 hover:opacity-80 transition"
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {notificationCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[#FF6F61] text-white text-[10px] leading-none h-4 min-w-[16px] px-1 font-semibold">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>
        </li>
        <li>
          <button className="hover:opacity-80 transition">Langue</button>
        </li>
        {/* Simple logout button with icon */}
        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </li>
      </ul>
      {/* Mobile: icons only */}
      <div className="md:hidden flex items-center gap-4">
        <button
          onClick={() =>
            onNavigate ? onNavigate("messages") : navigate("/messages")
          }
          className="relative p-2 rounded-full border border-white/30 hover:bg-white/10 transition"
          aria-label="Messages"
        >
          <MessageCircle className="w-5 h-5" />
          {messageCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-white text-[10px] leading-none h-4 min-w-[16px] px-1 font-semibold">
              {messageCount > 99 ? "99+" : messageCount}
            </span>
          )}
        </button>
        <button
          onClick={() =>
            onNavigate
              ? onNavigate("notifications")
              : navigate("/notifications")
          }
          className="relative p-2 rounded-full border border-white/30 hover:bg-white/10 transition"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-[#FF6F61] text-white text-[10px] leading-none h-4 min-w-[16px] px-1 font-semibold">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>
        {/* Mobile logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

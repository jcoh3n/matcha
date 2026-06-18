import { MessageCircle, Bell, Search, User, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FooterProps {
  currentPage?:
    | "discover"
    | "matches"
    | "messages"
    | "profile"
    | "notifications"
    | "search";
  onNavigate?: (page: string) => void;
}

export function Footer({ currentPage = "discover", onNavigate }: FooterProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
    { id: "search", icon: Search, label: "Search", path: "/search" },
    { id: "discover", icon: Coffee, label: "Match", path: "/discover" },
    { id: "messages", icon: MessageCircle, label: "Chat", path: "/messages" },
    { id: "notifications", icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  const handleNavigation = (path: string | null, id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path, item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
              currentPage === item.id
                ? "text-[#7FB77E]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            aria-label={item.label}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}

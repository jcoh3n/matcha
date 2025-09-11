import { Heart, MessageCircle, Compass, User, Search } from "lucide-react";
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
    { id: "discover", icon: Compass, label: "Discover", path: "/discover" },
    { id: "matches", icon: Heart, label: "Matches", path: "/matches" },
    {
      id: "messages",
      icon: MessageCircle,
      label: "Messages",
      path: "/messages",
    },
    { id: "search", icon: Search, label: "Search", path: "/search" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  const handleNavigation = (path: string, id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-green border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path, item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
              currentPage === item.id
                ? "text-primary bg-primary/10"
                : "text-gray-500 hover:text-gray-700"
            }`}
            aria-label={item.label}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}

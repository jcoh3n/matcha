import React from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MobileHeaderProps {
  currentPage?:
    | "discover"
    | "matches"
    | "messages"
    | "profile"
    | "notifications"
    | "search";
  onNavigate?: (page: string) => void;
  onFilterClick?: () => void;
}

export function MobileHeader({
  currentPage = "discover",
  onNavigate,
  onFilterClick,
}: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigate(`/${page}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 bg-transparent shadow-none">
      <div className="flex items-center gap-2 h-full">
        <button 
          onClick={() => navigate('/discover')}
          className="h-full flex items-center"
        >
          {/* Matcha logo in header */}
          <img 
            src="/matcha.svg" 
            alt="Matcha Logo" 
            className="h-8 w-auto"
          />
        </button>
      </div>

      {/* Only show filter icon on discover page */}
      {currentPage === "discover" && (
        <button
          onClick={onFilterClick}
          className="p-2 rounded-full hover:bg-white/20 transition-colors text-gray-700"
          aria-label="Filters"
        >
          <Filter className="w-6 h-6" />
        </button>
      )}

      {/* Empty space when not on discover page to maintain layout */}
      {currentPage !== "discover" && <div className="w-10" />}
    </nav>
  );
}
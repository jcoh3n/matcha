import { ReactNode, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import { api } from "@/lib/api";

type NavKey =
  | "discover"
  | "matches"
  | "messages"
  | "profile"
  | "notifications"
  | "search";

interface AppShellProps {
  children: ReactNode;
  current?: NavKey;
  onLogout?: () => void;
  /** If true, content area spans entire viewport width (no Tailwind container constraint) */
  fullWidth?: boolean;
}

export function AppShell({
  children,
  current,
  onLogout,
  fullWidth,
}: AppShellProps) {
  const navigate = useNavigate();

  const handleNavigation = (page: string, query?: string) => {
    console.log("AppShell navigation:", page, query);
    if (page === "search" && query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else if (page === "profile" && query) {
      navigate(`/profile/${query}`);
    } else {
      navigate(`/${page}`);
    }
  };
  const { unreadCount } = useNotification();
  const [messageCount, setMessageCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    const fetchMessageCount = async () => {
      try {
        const response = await api.getUnreadMessagesCount();
        if (response.ok) {
          const data = await response.json();
          setMessageCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching message count:", error);
      }
    };

    fetchMessageCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMessageCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // State for filter sidebar (to pass to mobile header)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const openFilterSidebar = () => {
    setIsFilterSidebarOpen(true);
    // We'll handle the actual sidebar in the DiscoverPage
    if (current === 'discover') {
      // Navigate to discover page if not already there
      if (window.location.pathname !== '/discover') {
        navigate('/discover');
      }
      // We'll let the DiscoverPage handle the sidebar opening
      const event = new CustomEvent('openFilterSidebar');
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="w-full flex flex-col relative bg-white">
      {/* Mobile Header - Only show on mobile screens */}
      <div className="md:hidden">
        <MobileHeader
          currentPage={current}
          onNavigate={handleNavigation}
          onFilterClick={openFilterSidebar}
        />
      </div>
      
      {/* Desktop Header - Only show on medium and larger screens */}
      <div className="hidden md:block">
        <Header
          currentPage={current}
          notificationCount={unreadCount}
          messageCount={messageCount}
          onLogout={onLogout}
          onNavigate={handleNavigation}
        />
      </div>

      {/* Main content with appropriate top padding for mobile vs desktop */}
      <main className={`w-full min-h-[calc(100vh-4rem)] ${current ? 'pb-20 md:pb-0' : ''} pt-16 md:pt-16 flex justify-center items-center`}>
        {children}
      </main>
      
      {/* Mobile Footer - Only show on mobile screens */}
      <div className="md:hidden">
        <Footer 
          currentPage={current} 
          onNavigate={handleNavigation}
        />
      </div>
    </div>
  );
}

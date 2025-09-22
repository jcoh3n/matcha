import { ReactNode, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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

  return (
    <div className="w-full flex flex-col relative bg-transparent">
      <Header
        currentPage={current}
        notificationCount={unreadCount}
        messageCount={messageCount}
        onLogout={onLogout}
        onNavigate={handleNavigation}
      />
      <div
        className={`w-full min-h-[80vh]
        } flex justify-center items-center`}
      >
        {children}
      </div>
      {/* <Footer currentPage={current} /> */}
    </div>
  );
}

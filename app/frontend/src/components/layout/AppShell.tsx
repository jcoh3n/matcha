import { ReactNode, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
    <div className="min-h-screen w-full flex flex-col relative bg-transparent">
      <Header
        currentPage={current}
        notificationCount={unreadCount}
        messageCount={messageCount}
        onLogout={onLogout}
      />
      <div
        className={`flex-1 w-full ${
          fullWidth ? "px-0" : "container mx-auto px-4"
        } mt-20 mb-20 py-10 md:mb-0`}
      >
        {children}
      </div>
      {/* <Footer currentPage={current} /> */}
    </div>
  );
}

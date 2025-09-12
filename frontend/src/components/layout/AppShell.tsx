import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
  return (
    <div className="min-h-screen w-full flex flex-col relative bg-transparent">
      <Header
        currentPage={current}
        notificationCount={3}
        messageCount={2}
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

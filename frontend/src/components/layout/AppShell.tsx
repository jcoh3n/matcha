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
}

export function AppShell({ children, current }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col relative bg-transparent">
      <Header currentPage={current} notificationCount={3} messageCount={2} />
      <div className="flex-1 w-full container mx-auto mt-20 mb-20 px-4 py-10 md:mb-0">
        {children}
      </div>
      {/* <Footer currentPage={current} /> */}
    </div>
  );
}

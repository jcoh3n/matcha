import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Sun, Moon } from "lucide-react";

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
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <Header currentPage={current} notificationCount={3} messageCount={2} />
      <div className="flex-1 w-full container mx-auto mt-20 px-4 py-10">
        {children}
      </div>
    </div>
  );
}

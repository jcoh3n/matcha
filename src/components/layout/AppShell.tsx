import { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { BrutalButton } from '@/components/ui/brutal-button'
import { Sun, Moon } from 'lucide-react'

type NavKey = 'discover' | 'matches' | 'messages' | 'profile' | 'notifications' | 'search'
interface AppShellProps {
  children: ReactNode
  current?: NavKey
}

export function AppShell({ children, current }: AppShellProps) {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-warm">
      <Header currentPage={current}
        notificationCount={3}
        messageCount={2}
      />
      <div className="flex-1 w-full container mx-auto px-4 py-10">
          <div className="flex justify-end mb-4">
            <BrutalButton variant="ghost" size="sm" onClick={toggleTheme} className="gap-1">
              <Sun className="w-4 h-4 dark:hidden" />
              <Moon className="w-4 h-4 hidden dark:inline" />
              <span className="text-xs">Theme</span>
            </BrutalButton>
          </div>
        {children}
      </div>
    </div>
  )
}

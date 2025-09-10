import { useState } from "react"
import { Search, Bell, MessageCircle, User, Heart, Compass } from "lucide-react"
import { BrutalButton } from "@/components/ui/brutal-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface HeaderProps {
  currentPage?: 'discover' | 'matches' | 'messages' | 'profile'
  notificationCount?: number
  messageCount?: number
  onNavigate?: (page: string) => void
}

export function Header({ currentPage = 'discover', notificationCount = 0, messageCount = 0, onNavigate }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  const navItems = [
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'matches', icon: Heart, label: 'Matches' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
          <h1 className="font-display text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Web Matcha
          </h1>
        </div>

        {/* Search Bar */}
        <div className={cn(
          "flex-1 max-w-md mx-8 transition-smooth",
          searchOpen ? "scale-105" : ""
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles, tags..."
              className="pl-10 rounded-2xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary transition-smooth"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              const showBadge = (item.id === 'messages' && messageCount > 0) || 
                              (item.id === 'matches' && notificationCount > 0)

              return (
                <BrutalButton
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "relative transition-smooth",
                    isActive && "scale-105"
                  )}
                  onClick={() => onNavigate?.(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs rounded-full animate-bounce-in"
                    >
                      {item.id === 'messages' ? messageCount : notificationCount}
                    </Badge>
                  )}
                </BrutalButton>
              )
            })}
          </nav>

          {/* Notifications */}
          <BrutalButton variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs rounded-full animate-pulse"
              >
                {notificationCount}
              </Badge>
            )}
          </BrutalButton>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-background/95 backdrop-blur">
        <nav className="container mx-auto px-4 py-2 flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            const showBadge = (item.id === 'messages' && messageCount > 0) || 
                            (item.id === 'matches' && notificationCount > 0)

            return (
              <button
                key={item.id}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-smooth",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onNavigate?.(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs rounded-full"
                  >
                    {item.id === 'messages' ? messageCount : notificationCount}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
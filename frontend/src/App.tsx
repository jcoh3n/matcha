import { useState } from "react"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage"
import { DiscoverPage } from "./pages/DiscoverPage"
import NotFound from "./pages/NotFound";
import { MatchesPage } from "@/pages/MatchesPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { SearchPage } from "@/pages/SearchPage";
import HealthTestPage from "./pages/HealthTestPage";
import { AppShell } from "@/components/layout/AppShell";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAuth = (type: 'login' | 'register') => {
    console.log(`${type} attempted`)
    // In a real app, this would handle actual authentication
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/health-test" element={<HealthTestPage />} />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <AppShell current="discover"><DiscoverPage /></AppShell>
                ) : (
                  <LandingPage onAuth={handleAuth} />
                )
              }
            />
            {isAuthenticated && (
              <>
                <Route path="/discover" element={<AppShell current="discover"><DiscoverPage /></AppShell>} />
                <Route path="/matches" element={<AppShell current="matches"><MatchesPage /></AppShell>} />
                <Route path="/messages" element={<AppShell current="messages"><MessagesPage /></AppShell>} />
                <Route path="/profile" element={<AppShell current="profile"><ProfilePage onLogout={handleLogout} /></AppShell>} />
                <Route path="/notifications" element={<AppShell current="notifications"><NotificationsPage /></AppShell>} />
                <Route path="/search" element={<AppShell current="search"><SearchPage /></AppShell>} />
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App;

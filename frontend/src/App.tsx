import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import NotFound from "./pages/NotFound";
import { MatchesPage } from "@/pages/MatchesPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { SearchPage } from "@/pages/SearchPage";
import HealthTestPage from "./pages/HealthTestPage";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (accessToken && user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log("handleLogout called in App component");
    // Make API call to logout
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      console.log("Making API call to logout with token:", accessToken);
      fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          console.log("Logout API response:", response);
        })
        .catch((error) => {
          console.error("Logout API error:", error);
        });
    }

    // Clear localStorage
    console.log("Clearing localStorage");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Update state
    console.log("Setting isAuthenticated to false");
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/health-test" element={<HealthTestPage />} />
            <Route
              path="/auth/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
            <Route path="/auth/register" element={<SignupPage />} />
            <Route
              path="/auth/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <AppShell
                    current="discover"
                    onLogout={handleLogout}
                    fullWidth
                  >
                    <DiscoverPage />
                  </AppShell>
                ) : (
                  <LandingPage />
                )
              }
            />
            {isAuthenticated ? (
              <>
                <Route
                  path="/discover"
                  element={
                    <AppShell
                      current="discover"
                      onLogout={handleLogout}
                      fullWidth
                    >
                      <DiscoverPage />
                    </AppShell>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <AppShell current="matches" onLogout={handleLogout}>
                      <MatchesPage />
                    </AppShell>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <AppShell current="messages" onLogout={handleLogout}>
                      <MessagesPage />
                    </AppShell>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <AppShell current="profile" onLogout={handleLogout}>
                      <ProfilePage onLogout={handleLogout} />
                    </AppShell>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <AppShell current="notifications" onLogout={handleLogout}>
                      <NotificationsPage />
                    </AppShell>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <AppShell current="search" onLogout={handleLogout}>
                      <SearchPage />
                    </AppShell>
                  }
                />
              </>
            ) : (
              // Redirect all authenticated routes to landing page when not authenticated
              <>
                <Route path="/discover" element={<LandingPage />} />
                <Route path="/matches" element={<LandingPage />} />
                <Route path="/messages" element={<LandingPage />} />
                <Route path="/profile" element={<LandingPage />} />
                <Route path="/notifications" element={<LandingPage />} />
                <Route path="/search" element={<LandingPage />} />
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

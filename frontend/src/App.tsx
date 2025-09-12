import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import NotFound from "./pages/NotFound";
import { MatchesPage } from "./pages/MatchesPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SearchPage } from "./pages/SearchPage";
import { HealthPage } from "./pages/HealthPage";
import { AppShell } from "./components/layout/AppShell";
import { HealthTestPage } from "./pages/HealthTestPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { Home } from "./pages/Home";

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
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Home onLogout={handleLogout} />
                ) : (
                  <LandingPage />
                )
              }
            />
            {/** canonical auth routes under /auth */}
            <Route path="/health" element={<HealthPage />} />
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
            {/** discover route is handled below based on auth state */}
            {isAuthenticated ? (
              <>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route
                  path="/discover"
                  element={<Home onLogout={handleLogout} />}
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <AppShell current="matches" onLogout={handleLogout}>
                        <MatchesPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <AppShell current="messages" onLogout={handleLogout}>
                        <MessagesPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppShell current="profile" onLogout={handleLogout}>
                        <ProfilePage onLogout={handleLogout} />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <AppShell current="notifications" onLogout={handleLogout}>
                        <NotificationsPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <AppShell current="search" onLogout={handleLogout}>
                        <SearchPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
              </>
            ) : (
              // Redirect all authenticated routes to landing page when not authenticated
              <>
                <Route path="/onboarding" element={<LandingPage />} />
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


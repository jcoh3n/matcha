import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { DiscoverPage } from "./DiscoverPage";
import { AppShell } from "@/components/layout/AppShell";

interface HomeProps {
  onLogout?: () => void;
}

export function Home({ onLogout }: HomeProps) {
  const { isLoading, hasCompletedOnboarding } = useOnboardingStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !hasCompletedOnboarding) {
      // Redirect to onboarding if not completed
      navigate("/onboarding");
    }
  }, [isLoading, hasCompletedOnboarding, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!hasCompletedOnboarding) {
    // This should not be reached due to the redirect, but just in case
    return null;
  }

  return (
    <AppShell current="discover" onLogout={onLogout} fullWidth>
      <DiscoverPage />
    </AppShell>
  );
}
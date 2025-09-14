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

  // We're removing the automatic redirect to onboarding
  // Users can access the home page even if onboarding is not complete

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  // If onboarding is not complete, we still show the discover page
  // but the user will be prompted to complete onboarding when they try to interact
  return (
    <AppShell current="discover" onLogout={onLogout} fullWidth>
      <DiscoverPage />
    </AppShell>
  );
}
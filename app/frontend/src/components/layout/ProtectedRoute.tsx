import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { OnboardingPage } from "@/pages/OnboardingPage";

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean; // New prop to control onboarding requirement
}

export function ProtectedRoute({ 
  children, 
  requireOnboarding = true // By default, require onboarding
}: ProtectedRouteProps) {
  const { isLoading, hasCompletedOnboarding } = useOnboardingStatus();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  // If onboarding is required and not completed, show onboarding
  if (requireOnboarding && !hasCompletedOnboarding) {
    return <OnboardingPage />;
  }

  return <>{children}</>;
}
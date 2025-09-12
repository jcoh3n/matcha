import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { OnboardingPage } from "@/pages/OnboardingPage";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, hasCompletedOnboarding } = useOnboardingStatus();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingPage />;
  }

  return <>{children}</>;
}
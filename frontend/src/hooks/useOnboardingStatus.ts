import { useState, useEffect } from "react";

export function useOnboardingStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setIsLoading(false);
          setHasCompletedOnboarding(false);
          return;
        }

        // Fetch user profile to check if onboarding is complete
        const response = await fetch("http://localhost:3000/api/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          setIsLoading(false);
          setHasCompletedOnboarding(false);
          return;
        }

        const userData = await response.json();
        
        // Check if user has completed onboarding
        // A user has completed onboarding if they have a profile with bio, gender, etc.
        if (userData.profile && userData.profile.bio && userData.profile.gender) {
          // Onboarding is complete
          setHasCompletedOnboarding(true);
        } else {
          // Onboarding is not complete
          setHasCompletedOnboarding(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // In case of error, we'll assume onboarding is not completed
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  return { isLoading, hasCompletedOnboarding };
}
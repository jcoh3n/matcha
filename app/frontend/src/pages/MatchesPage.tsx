import { useState, useEffect } from "react";
import { ProfileCard } from "@/components/ui/profile-card";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string | null;
  profile: {
    birthDate?: string | null;
    gender?: string | null;
    orientation?: string | null;
    bio?: string;
    fameRating?: number;
  };
  location?: {
    city?: string | null;
    country?: string | null;
  };
  distanceKm?: number | null;
}

// Calculate age from birth date
const calculateAge = (birthDate?: string | null) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Transform API user data to match ProfileCard expectations
const transformUserForProfileCard = (user: UserProfile) => {
  const city = user.location?.city ?? "";
  const country = user.location?.country ?? "";
  const locationStr =
    city || country ? `${city}${city && country ? ", " : ""}${country}` : "";
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    age: calculateAge(user.profile?.birthDate || null),
    images: user.profilePhotoUrl ? [user.profilePhotoUrl] : [],
    bio: user.profile?.bio || "",
    location: locationStr,
    distance: user.distanceKm ?? 0,
    tags: [],
    fame: user.profile?.fameRating || 0,
    isOnline: Math.random() > 0.5,
    orientation: user.profile?.orientation || "straight",
    gender: user.profile?.gender || "female",
  };
};

export function MatchesPage() {
  const [matches, setMatches] = useState<
    ReturnType<typeof transformUserForProfileCard>[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Fetch matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await api.getMatchesUser(token, 18, 0);

      if (response.ok) {
        const users: UserProfile[] = await response.json();
        const transformedUsers = users.map(transformUserForProfileCard);
        setMatches(transformedUsers);
      } else {
        console.error("Failed to fetch matches");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial matches
  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading matches...</div>;
  }

  return (
    <div>
      <h1 className="font-montserrat text-3xl font-extrabold tracking-tight mb-6">
        Your Matches
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((m) => (
          <ProfileCard key={m.id} user={m} variant="grid" />
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { ProfileCard } from "@/components/ui/profile-card";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  profile: {
    birthDate?: string;
    gender?: string;
    orientation?: string;
    bio?: string;
    fameRating?: number;
  };
  location?: {
    city?: string;
    country?: string;
  };
}

// Calculate age from birth date
const calculateAge = (birthDate?: string) => {
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
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    age: calculateAge(user.profile?.birthDate),
    images: user.profilePhotoUrl ? [user.profilePhotoUrl] : [],
    bio: user.profile?.bio || "",
    location: user.location ? `${user.location.city}, ${user.location.country}` : "",
    distance: Math.floor(Math.random() * 20) + 1, // Placeholder - would be calculated based on user location
    tags: [], // Would be populated with user tags
    fame: user.profile?.fameRating || 0,
    isOnline: Math.random() > 0.5, // Placeholder
    orientation: user.profile?.orientation || "straight",
    gender: user.profile?.gender || "female",
    matchPercent: Math.floor(Math.random() * 40) + 60 // Higher match percentage for matches page
  };
};

export function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
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

      // For now, we'll use random users as matches
      // In a real implementation, this would be actual matches
      const response = await api.getRandomUsers(token, 6);
      
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

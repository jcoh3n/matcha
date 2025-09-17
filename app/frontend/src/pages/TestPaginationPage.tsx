import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from "@/components/ui/profile-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function TestPaginationPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      matchPercent: Math.floor(Math.random() * 60) + 20 // Placeholder match percentage
    };
  };

  const fetchProfiles = async (fetchOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please log in first.");
        return;
      }

      console.log(`Fetching profiles with offset: ${fetchOffset}`);
      const response = await api.getDiscoveryUsers(token, 6, fetchOffset);
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        console.log("Received users:", users);
        const transformedUsers = users.map(transformUserForProfileCard);
        console.log("Transformed users:", transformedUsers);
        
        if (fetchOffset === 0) {
          setProfiles(transformedUsers);
        } else {
          setProfiles(prev => [...prev, ...transformedUsers]);
        }
        
        setHasMore(users.length === 6); // If we got less than 6 results, there are no more
        setOffset(fetchOffset + users.length);
      } else {
        setError(`Failed to fetch profiles: ${response.status}`);
        console.error("Failed to fetch profiles", response.status, response.statusText);
      }
    } catch (error) {
      setError("Error fetching profiles: " + (error as Error).message);
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchProfiles(offset);
    }
  };

  // Load initial profiles
  useEffect(() => {
    fetchProfiles(0);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test de Pagination</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Profils avec Pagination</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              user={profile}
              variant="grid"
            />
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7FB77E]"></div>
          <p className="mt-2 text-muted-foreground">Chargement de plus de profils...</p>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="text-center py-4">
          <Button 
            onClick={loadMore}
            className="px-6 py-2 bg-[#7FB77E] text-white rounded-lg hover:bg-[#6FA76E]"
          >
            Charger plus de profils
          </Button>
        </div>
      )}
      
      {!hasMore && profiles.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          Tous les profils ont été chargés
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { ProfileCard } from "@/components/ui/profile-card";
import { Input } from "@/components/ui/input";
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

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

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

  const fetchUsers = async (searchQuery = "", fetchOffset = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = searchQuery 
        ? await api.searchUsers(token, searchQuery, 20, fetchOffset)
        : await api.getRandomUsers(token, 20);
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        if (fetchOffset === 0) {
          setResults(users);
        } else {
          setResults(prev => [...prev, ...users]);
        }
        setHasMore(users.length === 20); // If we got less than 20 results, there are no more
        setOffset(fetchOffset + users.length);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (q: string) => {
    setQuery(q);
    setOffset(0);
    setHasMore(true);
    fetchUsers(q, 0);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchUsers(query, offset);
    }
  };

  // Load initial users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || !hasMore || loading) {
        return;
      }
      loadMore();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, offset, query]);

  return (
    <div>
      <h1 className="font-montserrat text-3xl font-extrabold tracking-tight mb-6">
        Search
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search profiles..."
            className="h-12 rounded-full pl-5 bg-muted/40 border border-border/40 focus-visible:ring-0"
          />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading profiles...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((user) => (
            <ProfileCard
              key={user.id}
              user={transformUserForProfileCard(user)}
              variant="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}

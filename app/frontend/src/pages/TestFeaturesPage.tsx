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
  tags?: string[];
}

export default function TestFeaturesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"fame" | "age" | "distance" | "tags">("fame");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      images: user.profilePhotoUrl ? [user.profilePhotoUrl] : ["https://randomuser.me/api/portraits/women/1.jpg"],
      bio: user.profile?.bio || "",
      location: user.location ? `${user.location.city}, ${user.location.country}` : "Paris, France",
      distance: Math.floor(Math.random() * 20) + 1,
      tags: user.tags || ["Photography", "Travel", "Foodie"],
      fame: user.profile?.fameRating || Math.floor(Math.random() * 500),
      isOnline: Math.random() > 0.5,
      orientation: user.profile?.orientation || "straight",
      gender: user.profile?.gender || "female",
      matchPercent: Math.floor(Math.random() * 60) + 20
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please log in first.");
        return;
      }

      console.log(`Fetching users sorted by ${sortBy} ${sortOrder}`);
      const response = await api.getFilteredUsers(
        token,
        {
          sortBy,
          sortOrder
        },
        6,
        0
      );
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        console.log("Received users:", users);
        const transformedUsers = users.map(transformUserForProfileCard);
        console.log("Transformed users:", transformedUsers);
        setUsers(transformedUsers);
      } else {
        setError(`Failed to fetch users: ${response.status}`);
        console.error("Failed to fetch users", response.status, response.statusText);
      }
    } catch (error) {
      setError("Error fetching users: " + (error as Error).message);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial users
  useEffect(() => {
    fetchUsers();
  }, [sortBy, sortOrder]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test des Fonctionnalités</h1>
      
      <div className="mb-6 p-4 bg-card rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Options de Tri</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trier par:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded p-2"
            >
              <option value="fame">Fame Rating</option>
              <option value="age">Âge</option>
              <option value="distance">Distance</option>
              <option value="tags">Tags</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ordre:</label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="border rounded p-2"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
          <button 
            onClick={fetchUsers}
            className="self-end px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Appliquer
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Résultats ({users.length} utilisateurs)</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7FB77E]"></div>
            <p className="mt-2 text-muted-foreground">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <ProfileCard
                key={user.id}
                user={user}
                variant="grid"
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Détails des Utilisateurs</h2>
        <div className="space-y-4">
          {users.map((user, index) => (
            <div key={user.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{user.name}, {user.age} ans</h3>
                  <p className="text-sm text-muted-foreground">{user.location}</p>
                  <p className="text-sm">Distance: {user.distance} km</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium">Fame Rating:</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {user.fame}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.isOnline ? "En ligne" : "Hors ligne"}
                  </span>
                </div>
              </div>
              
              {user.tags && user.tags.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.tags.map((tag: string, tagIndex: number) => (
                      <span 
                        key={tagIndex} 
                        className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
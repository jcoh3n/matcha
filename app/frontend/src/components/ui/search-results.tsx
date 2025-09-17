import { useState, useRef, useEffect } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { ProfileCard } from "@/components/ui/profile-card";
import { X } from "lucide-react";

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

interface SearchResultsProps {
  className?: string;
  onNavigate?: (page: string, query?: string) => void;
}

export function SearchResults({ className, onNavigate }: SearchResultsProps) {
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSearchResults = (results: UserProfile[]) => {
    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  const handleSearchSubmit = (query: string) => {
    if (onNavigate) {
      onNavigate("search", query);
    }
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchContainerRef} className={className}>
      <SearchBar 
        onSearch={handleSearchSubmit}
        onResults={handleSearchResults}
        placeholder="Rechercher des profils..."
        className="w-full"
      />
      
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-medium">Résultats de recherche</h3>
            <button 
              onClick={() => setShowResults(false)}
              className="p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-2">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.slice(0, 5).map((user) => (
                  <div 
                    key={user.id} 
                    className="cursor-pointer hover:bg-muted rounded-lg p-2 transition-colors"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate("profile", user.id);
                      }
                      setShowResults(false);
                    }}
                  >
                    <ProfileCard
                      user={transformUserForProfileCard(user)}
                      variant="compact"
                    />
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <div className="p-3 text-center border-t border-border">
                    <button 
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate("search", ""); // Navigate to full search page
                        }
                        setShowResults(false);
                      }}
                      className="text-primary hover:underline"
                    >
                      Voir tous les résultats ({searchResults.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
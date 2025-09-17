import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Settings,
  X,
  RefreshCcw,
  Sparkles,
  Check,
  XCircle,
  Info,
  MapPin,
  Star,
  Clock,
  Briefcase,
  Heart,
  ThumbsDown,
} from "lucide-react";
import { ProfileCard } from "@/components/ui/profile-card";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Header } from "@/components/layout/Header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

interface Filters {
  ageRange: [number, number];
  distance: number;
  tags: string[];
  sortBy?: 'fame' | 'distance' | 'age' | 'tags';
  sortOrder?: 'asc' | 'desc';
  fameRating?: number;
}

const availableTags = [
  "Art",
  "Coffee",
  "Hiking",
  "Foodie",
  "Photography",
  "Tech",
  "Music",
  "Guitar",
  "Travel",
  "Yoga",
  "Mindfulness",
  "Nature",
  "Cooking",
  "Dogs",
  "Design",
  "Fitness",
  "Climbing",
  "Adventure",
  "Science",
];

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

export function DiscoverPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    ageRange: [18, 35],
    distance: 50,
    tags: [],
    fameRating: 0
  });
  const [peers, setPeers] = useState<any[]>([]);
  const [activePeerId, setActivePeerId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch users for discovery with pagination
  const fetchDiscoveryUsers = async (offset = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      console.log("Fetching discovery users...");
      const response = await api.getDiscoveryUsers(token, 8, offset);
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        console.log("Received users:", users);
        const transformedUsers = users.map(transformUserForProfileCard);
        console.log("Transformed users:", transformedUsers);
        
        if (offset === 0) {
          // Replace profiles for initial load
          setProfiles(transformedUsers);
          setPeers(transformedUsers);
        } else {
          // Append profiles for pagination
          setProfiles(prev => [...prev, ...transformedUsers]);
          setPeers(prev => [...prev, ...transformedUsers]);
        }
        
        if (transformedUsers.length > 0 && offset === 0) {
          setActivePeerId(transformedUsers[0].id);
        } else if (transformedUsers.length === 0 && offset === 0) {
          console.log("No users found for discovery");
        }
      } else {
        console.error("Failed to fetch discovery users", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching discovery users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if profile is complete
  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          return;
        }

        const response = await fetch("http://localhost:3000/api/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          // Check if essential profile fields are filled
          console.log("User data:", userData);
          console.log("Profile data:", userData.profile);
          if (
            !userData.profile ||
            !userData.profile.bio ||
            !userData.profile.gender ||
            !userData.profile.orientation ||
            !userData.profile.birthDate
          ) {
            navigate("/onboarding");
          }
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
      }
    };

    checkProfileCompletion();
  }, [navigate]);

  // Load initial profiles
  useEffect(() => {
    fetchDiscoveryUsers();
  }, []);

  const currentProfile = profiles[currentIndex];

  const handleLike = (userId: string) => {
    console.log(`Liked user: ${userId}`);
    console.log(`Current index: ${currentIndex}, Profiles length: ${profiles.length}`);
    // Add like animation and move to next profile
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
        console.log(`Moved to next profile, new index: ${currentIndex + 1}`);
      } else {
        // Load more profiles
        console.log("No more profiles, fetching new ones");
        fetchDiscoveryUsers(profiles.length);
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const handlePass = (userId: string) => {
    console.log(`Passed user: ${userId}`);
    console.log(`Current index: ${currentIndex}, Profiles length: ${profiles.length}`);
    // Add pass animation and move to next profile
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
        console.log(`Moved to next profile, new index: ${currentIndex + 1}`);
      } else {
        // Load more profiles
        console.log("No more profiles, fetching new ones");
        fetchDiscoveryUsers(profiles.length);
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const applyFilters = async (offset = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      console.log("Fetching filtered users with filters:", filters);
      const response = await api.getFilteredUsers(
        token,
        {
          ageMin: filters.ageRange[0],
          ageMax: filters.ageRange[1],
          distance: filters.distance,
          tags: filters.tags,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          fameRating: filters.fameRating
        },
        8,
        offset
      );
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        console.log("Received filtered users:", users);
        const transformedUsers = users.map(transformUserForProfileCard);
        console.log("Transformed filtered users:", transformedUsers);
        
        if (offset === 0) {
          // Replace profiles for initial load
          setProfiles(transformedUsers);
          setPeers(transformedUsers);
        } else {
          // Append profiles for pagination
          setProfiles(prev => [...prev, ...transformedUsers]);
          setPeers(prev => [...prev, ...transformedUsers]);
        }
        
        if (transformedUsers.length > 0 && offset === 0) {
          setActivePeerId(transformedUsers[0].id);
        } else if (transformedUsers.length === 0 && offset === 0) {
          console.log("No users found for discovery with applied filters");
        }
      } else {
        console.error("Failed to fetch filtered users", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    } finally {
      setLoading(false);
      if (offset === 0) {
        setCurrentIndex(0);
      }
    }
  };

  if (loading) {
    return <div className="w-full min-h-screen flex items-center justify-center">Loading profiles...</div>;
  }

  return (
    <div className="w-full min-h-screen font-poppins">
      {/* Desktop / large screens: split screen */}
      <div className="hidden lg:flex w-full min-h-[90vh] relative ">
        {/* Central vertical divider */}
        <div className="absolute inset-y-0 left-[40%] -translate-x-1/2 w-[3px] bg-gradient-to-b from-transparent via-black/60 to-transparent rounded-full pointer-events-none" />
        {/* LEFT HALF: Chat / Matches sidebar */}
         <div className="w-3/5 flex flex-col p-8 flex items-center justify-center ">
          <div className="w-[50%] mt-20 min-h-full">
            {/* Filter Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Filter className="w-6 h-6 text-[#7FB77E]" />
                Match With:
              </h2>
            </div>

            {/* Filter Card */}
            <div className="min-h-full overflow-hidden font-poppins">
              <div className="p-6 border-b border-gray-100">
                <div className="space-y-6">
                  {/* Age Range Filter */}
                  <div >
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-2xl  font-semibold text-gray-700 flex items-center gap-2">
                        Age
                      </label>
                      <span className="text-2xl font-semibold text-gray-600 px-2 py-1 rounded">
                        {filters.ageRange[0]} - {filters.ageRange[1]} ans
                      </span>
                    </div>
                    <div className="px-2 flex flex-row items-center gap-6">
                      <span className="text-xl font-semibold underline">18</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min={18}
                          max={99}
                          value={filters.ageRange[0]}
                          onChange={e =>
                            setFilters(f => ({
                              ...f,
                              ageRange: [Number(e.target.value), f.ageRange[1]],
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7FB77E] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#7FB77E] [&::-webkit-slider-runnable-track]:bg-[#7FB77E] [&::-moz-range-track]:bg-[#7FB77E]"
                        />
                        <input
                          type="range"
                          min={filters.ageRange[0]}
                          max={99}
                          value={filters.ageRange[1]}
                          onChange={e =>
                            setFilters(f => ({
                              ...f,
                              ageRange: [f.ageRange[0], Number(e.target.value)],
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7FB77E] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#7FB77E] [&::-webkit-slider-runnable-track]:bg-[#7FB77E] [&::-moz-range-track]:bg-[#7FB77E]"
                        />
                      </div>
                      <span className="text-xl font-semibold underline">99</span>
                    </div>
                  </div>
                  
                  {/* Distance Filter */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
                        Distance
                      </label>
                      <span className="text-2xl font-semibold text-gray-600 px-2 py-1 rounded">
                        {filters.distance} km
                      </span>
                    </div>
                    <div className="px-2 flex flex-row items-center gap-6">
                      <span className="text-xl font-semibold underline">1 km</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min={1}
                          max={100}
                          value={filters.distance}
                          onChange={e =>
                            setFilters(f => ({
                              ...f,
                              distance: Number(e.target.value),
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7FB77E] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#7FB77E] [&::-webkit-slider-runnable-track]:bg-[#7FB77E] [&::-moz-range-track]:bg-[#7FB77E]"
                        />
                      </div>
                      <span className="text-xl font-semibold underline">100 km</span>
                    </div>
                  </div>
                  
                  {/* Fame Rating Filter */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
                        Fame Rating
                      </label>
                      <span className="text-2xl font-semibold text-gray-600 px-2 py-1 rounded">
                        {filters.fameRating ?? 0}%
                      </span>
                    </div>
                    <div className="px-2 flex flex-row items-center gap-6">
                      <span className="text-xl font-semibold underline">0%</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={filters.fameRating ?? 0}
                          onChange={e =>
                            setFilters(f => ({
                              ...f,
                              fameRating: Number(e.target.value),
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7FB77E] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#7FB77E] [&::-webkit-slider-runnable-track]:bg-[#7FB77E] [&::-moz-range-track]:bg-[#7FB77E]"
                        />
                      </div>
                        <span className="text-xl font-semibold underline ml-2">100%</span>
                    </div>
                  </div>
                  
                  {/* Tags Filter */}
                  <div>
                    <label className="text-2xl font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      Centres d'intérêt
                      {filters.tags.length > 0 && (
                        <span className="text-xs font-medium text-white bg-[#7FB77E] px-2 py-0.5 rounded-full">
                          {filters.tags.length} sélectionné{filters.tags.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full border text-sm transition-all duration-200 flex items-center gap-1 ${
                            filters.tags.includes(tag)
                              ? "bg-[#7FB77E] text-white border-[#7FB77E] shadow-inner"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                          }`}
                        >
                          {filters.tags.includes(tag) ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <span className="w-3 h-3 rounded-full border border-gray-400"></span>
                          )}
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sorting Options */}
                  <div>
                    <label className="text-2xl font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      Trier par
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setFilters(f => ({ ...f, sortBy: 'fame', sortOrder: 'desc' }))}
                        className={`px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                          filters.sortBy === 'fame'
                            ? "bg-[#7FB77E] text-white border-[#7FB77E]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">Popularité</div>
                        <div className="text-sm opacity-80">Note de célébrité</div>
                      </button>
                      <button
                        onClick={() => setFilters(f => ({ ...f, sortBy: 'distance', sortOrder: 'asc' }))}
                        className={`px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                          filters.sortBy === 'distance'
                            ? "bg-[#7FB77E] text-white border-[#7FB77E]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">Distance</div>
                        <div className="text-sm opacity-80">Plus proche d'abord</div>
                      </button>
                      <button
                        onClick={() => setFilters(f => ({ ...f, sortBy: 'age', sortOrder: 'asc' }))}
                        className={`px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                          filters.sortBy === 'age'
                            ? "bg-[#7FB77E] text-white border-[#7FB77E]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">Âge</div>
                        <div className="text-sm opacity-80">Plus jeune d'abord</div>
                      </button>
                      <button
                        onClick={() => setFilters(f => ({ ...f, sortBy: 'tags', sortOrder: 'desc' }))}
                        className={`px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                          filters.sortBy === 'tags'
                            ? "bg-[#7FB77E] text-white border-[#7FB77E]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">Intérêts</div>
                        <div className="text-sm opacity-80">Plus d'intérêts communs</div>
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => applyFilters(0)}
                    className="w-full py-3 rounded-xl bg-[#7FB77E] text-white font-semibold shadow-lg hover:bg-[#6FA76E] transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    Appliquer les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT HALF: Profile Card (80% width inner wrapper) */}
        <div className="ml-auto w-[90%] flex flex-col justify-center p-8 ">
          {currentProfile ? (
            <div className="w-[100%] ml-auto">
              <div className="rounded-xl overflow-hidden shadow-soft bg-white flex flex-col lg:flex-row transition-all duration-300">
                <div className="relative w-full lg:w-1/2 h-[520px] lg:h-[700px] shrink-0">
                  <img
                    src={'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMVFRUVFxUVFxUVFRUXGBUWFxUWFxcVFxcaHyggGBolGxUXITEhJikrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lICUtLS0tLS0rLS8tLS0tLy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAQMAwgMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAAAwQFBgcCAQj/xABPEAABAwIDAwYKBQgHBwUAAAABAAIDBBEFEiExQVEGE2FxgZEHFCJCUpKhscHRIzJT0vAVM0NicpOisiQlY3OC4fEWF0RUo7PCNGSDw+L/xAAaAQACAwEBAAAAAAAAAAAAAAAAAwECBAUG/8QAMhEAAgIBAgUDAgQFBQAAAAAAAAECEQMSIQQTMUFRFGGBIjIjUqHwBXHC0eEkQpGxwf/aAAwDAQACEQMRAD8A2tCEIAEIQgAQhCABCEIAEIQgAQhCABCEIAEIQgAQhCABCEIAEIQgAQhCABCEIAEL5of4WsZG2Zo66eL7q4Phfxj7dn7iH7qiy2ln00hfN+H+FfFn3zTssP7CH7qQ/wB72L30nZb+4h+6iyVBn0uhfNh8LWL/APMM/cQ/dXL/AAt4uP8AiGfuIfuo1FuVI+lUL52h8KeKiIvdO29tPoYuzzU0HhZxe1+fZ+4h+6o1IjlSPpRC+bW+FzFt87f3EPyTug8KWKyO/PssBr9DF2eajUieVI+h0L53rfCpigkyNnZpt+hiOp/wpdnhQxPKXGdvAfQxbeP1UKSash42nR9AoXznTeFPFnO1qGBo1P0EP3UlJ4V8XvpOy39xD91TZHLZ9IoXzvQ+FDFnAl07LbvoYu0/VTebwuYpmIbOzKNPzMWv8KjUronlurPpBC+dIvCvihdrUMDf7mL7q6d4VsU1PPsA3DmYu/6qmyHBn0ShfPFN4UMVyl76htt30MI04/VTI+FvF9Tz7AN30EX3UJg8bSs+lEL5vg8KuLk61DLf3EOv8KSm8LuLXsKhlv7iH7qLI0OrPpVC+aP97mL2v4wz9xD91KU3hUxuQ2ZK13TzENh1nLZSGln0mhfP45c49/zMH7mP7iFTXHyTyp+CqUs8TvPb1HT2FPJMIheNWDrGh9m1U1jUsypezVriOokKjg+zHqa7otUfJpoBDHlt77RmHwUXJyVnbqMrwODrHudb3rqHHp4wCXB1/SHyspSm5XM8+MjpYfgbe9U/ERdaGVepo5GHymOb1ggd+xIM1IC0KPHKZ/6QDoeCPadF5LhMEhzARn9Ztve1HNrqiXjvoym4lJZrWDrP4/GxNBwVsq+S7HG4e5p6QHD4H2qKqeTcw2ZX9Rse4/NSskfIaWiJlGil6ICKLMdtsx6zsHuCYsoJGvGdjmjabg2PRfYu8WqL2YOs/BWe+wXW4yzkkuO0m5UngeEVNXJzNPE6R2020awek9x0YNN5Ci2raPBtdlKxrNA7y3WFi9xG1x32Gg6AlcTnWGGqiceN5OgzwjwNy5f6RVxRk7WRMdIerO4tAPYVLnwK0hGlZNfjljt3W+Ku8F9Op3vanbWFYIfxCcuwSxVtZk2M+CCoay1NUwy2814dEbcBq8E9ZCzjE8InpHGCeJ0Uh3OA1HFjhcOHS0kL6Zlvr1/AKkeElnO0rmuALmeXG62rHDU5TuuBY9fQFMP4jWTTKPUlcPKS2ZiM0AboDqBdx+Fl5RQF7rEaDU/JJteSQBrc956U+ll5plh9Y7+neV1WxMV5EsTqLnINg2/JNo48xsP9Ak2xFxAG0m3WVO0mGOAsNL7z8kNqCIpzZFVkgaMrf9ElR4dJJ9VunpHQf5qz02ExM8o+URqXPt38AnLaku/NtL/1vqs9Y7ewFL5v5RvJv7iMosAYD5flnhsb3b1K8/HH5A1I8xjcxHYPqjpNgmxIsTNJpcjKx2Rva8kEntHUm8Ve4+TSxFwMkcQyNs3nJQebbcja7m3m1hsPlKlSl1LNxh0HpxB/2Du17PmhO34XTtJbJi1M2Rps9ojmcGvGjmh3OeUAbi+9CrpX7sjnfvYpMVMR0pvPEb6hL01cQLEX4G/vXTagOPlacCL9xWqmZ/paCvGjQkYmKSinYTa/foD2lKeLsOrbdNj8lXVXUY430ZEzabEvG5zWB1yHbje3uS1RRX2Inp3EAbgi7ISaF6bHKhvnkjgfK9+vtT+HlSfPYOsEj2G6hzCQNiaStvYcdFVwiyVOSLiMchePOb1jTvF03lpYZNRlceI2+zVV6rGUBg7epcNuN6qsddC7yeSalwdg1z5BvLrWA4q8ckeXGHUzGQu50hoAMpaRfTaGAGw7Ss8w6OSZzYgXEuIsNu4m4BIG7eQBtJABIs1f4P3GmNTTyB7QS3M2eOeMkW8lz2MZzR1tfy232uaNUSwrIqnuRzNP27WbLUY5TRwmpDw6JrDIHN1zNIDhl6TwWX13hmrXE8xFDCzdn8o9ZUTyegmkwmqJzWilyZTfTyWuc226xOzpUfybgpoqd9ZUjM0Scy0ZGSFz8ubJGyUGO4b5TnyNcACwNaXONs/C4VCckXzadCl1LfgnhRq3uAmZFM3fk8lw6t1+g+xWDlNVsmpXSMvZzSdRYg2N2uG4jgoKDD6CvppJaRxfJAxkszRTww1MOZt80T4IomVAblcHRua7NbyXNOUlKhxN0lHIxxa57AWlzNWv8nR7TvBFiOghJ4/B0nXc0cFKMrS2ZmlHFbyyNbaBKQ4W+V2Z5yjcBqbe4J0G2129CSqK2a1mNy9OhK6Ck30Mril1JWkomMsGt173FKVVQ5ri2zWWAuXeUdeDWqP5HlxqXF1yTG7U39NnFWrBsMp3uqpKmNr4mS5ZHySljYYXQvcXtaCM0heGtbtOoslS2f1E66jaK/TvD9WRyVDvKscucZmMdIQ0CzAcjXGwOaw2FSlBRNls6pqREDD4wIYm87K+HmXTE3cAxlmtI1adRa+qfUNdK2poXMkkeIqYyGIx5IIpfyUZY2B4+u915HHeA6w2FM8exGkbXNlY8Cnkw57W5RmyGaOcMiLW/VIzAWNrb1Z+EuwrW33GtPh8BniMbXOZPh1W4GU53l4NSzObkhrsrG/V0BvZXt89Kz+l3DXRyYc2pBsMjmN5uKY33GGq2/qW2grP6TEZ2UUcRw+TnS2Smp6tzZW2ZUvLnRsaW5XPJe4NdfY7oN5NvJOonqmtqamMx1LHxSOpJAWtkpYmlkUwy2JblYTt2HUKuT3dfv8AsVXgTdyPq2nKynoZGjRsjz5T2jQPdr9YjU9a8UYeTkMf0ctO4yM8h5HOkF7dHEEG1rg7EJi1/nX/AB/kj6fH6lSa1LMYumNTiONaGxVCLY0tHGRsuOpOY4U6jplVyLKJH5HXDrm41B3pV1U/aA0HjlBv/hddvsT2SmsNiblg3+3RVtMt9SOH1IIvlIPDd02O234udqTdkuHA9hBu32WPWP8AJKGNJviRSDWwMAccxs6+lxfS27XUce1eSUyScxeB5AtfTgp0+CeYu46pmuDZQzRzo3NvssDbNruu27Op5Vs8EdUaWSeaocRTcy+NzZCRGXyOj1c06AZY7Xtd2jQHbEt4P8DoamF7al7o5y/NG9rsjmMAygsOw3dnv1dCnqnk5QUWV7ppayUECFkrs9nuIAyRgWLibbb62SJcQoNxfUdHDrSJfkNhTWYXM3K4NmqZXAPHlZfJa3MDqDZguDrx1VA5b4GIWNpMwYBI+oiMpDWvEjGMeGPNmkDKy4JDmkHRzSCtdwmFxoImAt51xc97c7TZ73Oc4ZgbGxJFxwVcx/lBDCRSYlAxzSM7cwbIxwvbM062III3EdovljlkszlW1dvI5QTg4p9+hTfBpHLA6WOC0007Q0sgex5Ebb7ZG3ZC0l2r3ncLNcdDcsV5FMoqWRzXAuLS57WizAbatjG0MGwAkmw1N0rh/LzDaWPLTRxxjbZjWtBPE22lVLlX4R3VDXRsGjtCegqc+Tmx0xTsnBjnjnq6Iz01ZXsda0m2t0hI1cNGUabVtUVRmcnZaOS8gMxAOuQ6dF2p5V4HU1fPQRNjymaN+eSZrLyBk7WwsadXOcHEi3oqH5Dj+k//ABv/AJmKy1uLNpWTy80yWRlTTmHOTlikLKstmyj65blNgdLkHcEqVqe3j/0u3eP5OYMKlqKemjqcQewR+KF9OG5GQ0sxFPGcwABlyusS69hIb7717l7hQp3sAon0WaN12GYTMflcQHMfc65cuYX2kaDaZV2MU8lMHMbJUTyx0UE9OWPDGtpXh73OlGhEnNtAtqAXEppygeypEEVPGKemhEojDpDM4ulcHSuL4wWNFwAGkj6vTpaOpSM9X0NExOtbFK6QzvlBrcObO17iI6JrWtkaWg7nEi7hYa8Qb16Cmbh8RpquRkckkmIzgZxpFJS8xESRsc9wu0bbDiLKIkoZp3SvkfKef5vnWi0TH800NiDoxmEjQBf64112pzR8mmtA0jaR6Lc26wN33e227K8JKcIKnIesOSW6RMUPhephGwS0znS5G844c3Zz7DMRc3sTdCRbg5sPLk/eS/FxQlf6cb6fKZuxidwsXMUafQRLe2Y4o6hiUrR0mZJ0sF1bMBoLkaLPkyUPhAZN5Ouc24Cby4S530TrCTZE91rOP2Lydx81246HQ+TtWEYXEIxpc21vZVvlvgEeUuaR+zvS6nWrsGuN0YrNT2Ja5ga4Egi2VwI0INrapqyHQ9ZV6xah5+Myf8RE28n9tE3TnOmRo28RrtBVVihu09ZTozKuOxFyRJu6JSssSbSRp6kJcRzhTxKwUxdkfmLqaUmwbI8AOgkO6OTK2zvNeLnRziOOT2ETVNTKyR72SU7XuyEkSc6wlobxblcNT0Ab0yMd9CpXlPSlxhqgXCSaBrzIDYukiLqaXXieaa48S88VWaVX3G4ZO9PYrFL4y97YY+cc9zsjWNJzFx0ygBbJgvg/p4cOf+V5mMkeQ4OdKL04As1rHE2LrkkgXB0Gtlj1G2HODO55ZfyhHlDiN4BIIHXZXLA4KaqmEdBh7Y7fXqJ3vnLBvLWOPNh3AkHsVZaUhmmcnsynVcAbI4RPdJEHEMkLC3O0b7L2n2haXy/pImxtjYBdotxJ6Sd5WeU8RDknHnU0aZYXChqZN9uGl/YgOZrqRssSLi2twbb9nRoVxZeFq2qKOY5uyw8ibeM6G94n9/k3Hs9ymsVwpr5nONri1jkYTsva7wd5OwAqD5Cj+lj+7k9wVvrB9I7qHuWPiJOE7Xg28MlONPyRQpoomMdO8ngXZnWcRfyNC5vYVweUEQvzcT3H0nWYD1k3d7Etyib9BF+0P5HKvsaq41zFcmNyvlSqCRJV+N1AsGljMzWuuG3Ivuu42NuNlET1Esl+clkeDuLyG+qLD2JzVkeT+wPeVxFRSv8AqxvcOIabd+xNhGEV0ETnOT6ml4Q76CH+7j/kC8TTDqjLFG12haxgI4ENAIQszas1JOjPIWKTpYk0hapOkC0zkYoIlcPp1c8FiAsqpQuVjoKiywZWzQuhe6SrsEzxhwe3VRMNau5au4Uc16aFaN7IijpctTE4faN7ibEdoJCqFdRBskzWizWzTNA4BshAHsV7pTeaP9tn8wVXqW3fOf7eo/7rkzHLayzW5V6inTCWNWGqiUZPEtMJipRIZ7FOY+62GUMo/Rz1UJ6niOW3sPeoyViksWH9S/s4i09j6Rzb9V2W7CnrdCeklRBYSyldIHTfV2lu4q/z8u6eGIRU0bW6Wsxtll9JQOedFccE5OMZ5TtT0rHxGhfc/g6eC5f7fk8+lqCZJL68VGVtPlKt1VIALBcw4HT1NHLKJXCductaLZPJGjXC19eN9NO3Ljyb+Ea8iSiZkAgher1d1dDzsupN8h9KsfsSfyq2VbvpHdQ9yqnIsf0kfsSfyq01ekh6h7lh4v7vg38F0OKul52NjSbWIdoL7iLe1NPyfSxfnHj/ABvDfdZNuVV/FQ5ri2xbsJFwdLG27VQeIU7PybTPDGh5mmDnhoDnC7rBztpAsErFBuOzrcfnnGMt426LNJjtHCARexBylsbvKANjleQA4A3G3am2KcrTG2N/i78szS9he9ozNBtezcxHUVE8pG/1fhx4MlHe8n4JPlTrR4cf7F47nBNWCDq7e9CJcRPtS2smqetqJGteBCA8BwBD9A4Xtt6V6ozDsRAijF9jGDuaEJ3p8XgR6rN5OIZApCmmCQpcPcfx+PwRxT+LDis08iNEcTHtPUDipSmqulRsGHu4J9HRELNOURyxsloavpS/jaiRCQuXZt10rZkOBYMIqAaiIf2jP5gq9E+/Oa7ZZj3yOUlgNI5tTA6Q5fpY7NP1j5Y3bh0lVdmY5jxc897inQqhen6h5VKOnavHvcOKTdNdOjsUmmMpmJec3oK1vosopR0WrJ4ye6cJOUpJjswr4/8A2UTu1tVRyD2OK1wZnkhbkvGA0HqVkdJtVTwSfK0BTscl1yeITc2zu8PXLQlWSk3/ABwSvg8nDpaiF3EOHURY+5ITt0P44JjyNpZnYjaFtzkc5+oADBa5JPSQO1TjipRkvYjM6p+5W6iHK9zfRc5vcSPgk7KTx9gFTMB9o49pNz7SUwsuzjlcUzgZI1N/zJfkhpUj9h/uVkqj9Ieoe5VrkqbVDf2ZP5SrDVn6Q9QWTifu+DZwnQZcpP8A0na33qIrG3wun6KiUexx+KfYxVB0D49btynoNybW7imE5/q2MejUv9sd/iowqo/IziHc/hnuO64dQngZR/1H/JJcodaCg6Gyj+Mj4LrFHf1bSdEk3/clSWLuvh9H0OmH/Uenr+r+5mf9JCxz2AHABCbIWijPZo9Jyki9C23ZHs1Nv0m649UKRh5RQ+gPVI/8j+AFTatoErwNAHEd2i7jeudLBFnQXETujQIOUVPvaB2v+6U9jx6mPo97/ixZ5HIncR48L+xZ5cNEaszZfxilKf8AIs/8iEzqsbp2g5M+bgMo/iBPsVNE6UY66quHSDmlq5P4k51TD5IAMsfXq8b96h6PFoWsDSwk3drfbdxI3cCnuDSgTwdEsX87VB4NA18TXH8aqyjGmDT1bD6XEYD5rvYmck8O4O9i6qKVt9iazQAA9AV46fciSl7HM0ke6/sUfWh0dRUW2Pp2s/wh8Df/AKwvZX6KS5Y0T45rublD6ZhadPKGUuJFv1h7FqjcdjLtLd9hhQRiwU5TWAVcw6XcpmKVYsydnVwtaRzPsKf8gXCIV9Sf0cTGA/tZ3OH8LFDTzaKUrqKWkwh/ONyvqpQ/KfrCOzGtzDdexNulVxxdMOIa0ooUshc4uO1xJPWTcrwBdNCcQMG8LrpUqODJ27HvJyO07T0P/kcp2pd9If2R8UzwxsbXAgNBA0IOurT8Lp3WQOzAjzmjbu2rLn6mzhehGmiEgcLkZrAka6NJ+aWbhDDBzBc7LzhlzDKDctDbagi2i9bhxubu220F+1OGYU3e7+H/ADStTXRmlxi92jiTCYOZjgeSWRlxbd1jdxJNy23pFJyUlLzbIiWFjCS1rn3sXEk79dSUszCo26XPcLpyzC4huee3T2WUan5YaYLsRPidF6EPsQpr8lw/Zn1nrxTrflkaYeEVSrAM8v7b/eu2QhJVrTz0jraOc4i3Ak2XrM3Ap97Iy1uxy0NSzX69nwSEULzbQ9yXjp36+SdhGxLdDF/ISa9Oad+qRFE/0SlYqZ4809yhtUCTsl8Gm+ni6HsPcQfgmHJ+QinZ1H3lOMHaWzMJBAGY6jg0lROHTSiNoYy7baHKSlabTSG6qabJaR5ukKqTyT1JB75z+j/hK4ljkIIynUcDtshQ8hLIn0I57k+xLFJZYiyXV9P9G1+hBhnex7bHjlzC/B5XNJhM0j2xtYczjYX0A4knc0C5J4AqS5dMjhYyjpxfm7STP3ucNl+no3WtuWqU1sl1MuJbu+hCUYUnCVWWYll0ynvUzDUvazOWaZc+jtbWvstwSMmORvx5oJUSDqsQnnCA4t1a12zNuLuIB1tvtZIcosZnnZDDK58kxAe8Wubu1a3KN+U7AFE1GMZxnEbrA6E2IuNl0gIpXEvOYueDdxvch7S069LXEdRV8WKvuF8RnVfSdsp3jzHeqV2Yn+g7uKeUfPWNyAAAG6C5sN/sSDqupPAdTB8Vo1u6MPLjV7hRc417SQQBe9+oqZx+vGaLmpLtDbPI3kN6R0BQ9LzzngOvYmx0A9y7qqPLJzQcXXeQCf1joOwEDsS5q3bGYmkqRMYtGWSUsTHOBkLQ83N3EujbfU6bXbE9czNiBiBORrWktzG35su48S1I1zs+LQMGxjb26QyWT4NXeBSc5ilS7zWtIPW10cY/ld3JbW3wNUqZ5hEHO1szdrGZ/J80EObHa3aT2LzknA2WedxAcGufa+oAdK61h1NRyGqc0ldNuBDgf2nTvP8AKE35DS5IKmX0W/yMe/8A8lGlqydSZSpJg4l3pEnv1QmTToELToM+tmu0stIPMCkoaukH6MdyzUVh4pVmIEbwsT4W+5oXEI1Wnq6P7IdyeR1lH9m3uHyWTMxM3227kr+WX8fil+kJ5yNZGIUg2Rt7v8kHGaYbGN7h8llBxl3FcnGHcfx3o9IRzEaDjclLUNyuLmWvrGWtPeWlR2C1poo+ZjyTxtJLBMMr2gkuI5xoIcLnS7e21rUo4keK8diJ4lMXDtLT2KvJE0T/AG5h2Ppi08crXjsLdbdYC9/2xpjsYy/SAPes1dWEqT5MYV43OGEfRt8qQ6izb2DQdznHQcBmPmlHpYdXsRzfBoVfjDY6Y1BaGaXYAAC6/wBXs87sbxVQo8RaIHscAXSB7nk6kueLbegWHYmvhAxkPmELLc3HuGy42WG4abOgKtsnJsAdtgowcPcW/P8A0Wy5NNRGGO0eTK7c5t+1WuaqiyFttMpb/DZNuVVHGaeMska+zbnKdl1AOnNloh+JHfsGb8OVruT35KAob77ZvinFPigDGtt9VrR3ABTVTSAULPKaSWbAdb5dlln7ZjxS8N5HK/Jfiqgo14LHLVh2vBMzWE7AT1aqL8Yqbktkdbdc396csxusbpzg7b/NO5dMRruKJGiklL2/RyEXvfI62mu2y9lA59sjrjI9r8pFs2VwNtdmxcU/KStG1sbuwJU8pqjzqdp6j/kqyUr2X6lo6Ut2OaWpaKt1SdQRYNAFx5LW7b8Ae9eYNLzT6l5Os2rbX0N5HeVw1e3ZfYUzfyhafr0r+yxQ3GqM/Wjew9TvgFWpeC1x8jjk8PF6SoiLgZJc4blzW1jytuSBvJXOEDm6KpiJHOSZw0C9iHRMaNdg1zLlmIUB/SEdef4lKjxR2jagesf81Lk97RCiuxUfyJP6I9ZvzQrl4nD9v/F/+EJnOZTkop3PWXTZkxD1006rRpMtkiyXilGz6KOD16x6rpLWSBmO66RdKUjzvT+O3sXjZB+P9EUFi7JiujKkmlDjZFAOoQXENaCXOIaANSSTYAcSSQFp0jG4ZQEXHOyavcDteRY2/Vb9VvafOKi/B3geW1VKAHEXjB8xhGsh6SCbcAb+cLQvL/GHVE+RoJa21gAToNmztPasOafMnyo/Jrw49MeZL4Ks+UucXHUk3K9DkqzD5Tsjf6pHvThuDzn9Ge0tHxW5UtjI7btiAjvmtsIv3i9vamblMMhLA5rhYgDeD5o3hcU2DF4Ds41F7Na55HQbb0qMlqZpyxuEWJ4YHOIAJsmM4yuI4EjuU3TU/Muc29yANS0tvcA7DsXUeFB4DzGXZtbl5A28AFWEkpstmjeKJHh7uauzbYfHZ0pm7MTv7VMuhDSWWtsFrk2uOJ60k7ksze93YB8ldSim7ESi2lRFxzBp1eB/iB9xSIxOTNo85ez4qUqcCiY1x8okAnU9HQAq47QpkdMijcok1DiTidSN27rTgYhrYgFQMb0qHqrxovHKTHjsZ2sHsK8vTu2sHd8lClyA9RoJ5nsTHMUvD+ZCh+dKEaX5DXHwdNCXbRyG2Vjjfg0u9yslPm3Bjepv+iexiQ+e4dQb8QUPLRVYkytwcnqlxsIj1lzW+8hSUfJGq2kxNH6zz8GlT0NO0/Wkffoe4e42TluFRnXUni7VKeZjFiRXByVF/pKyFnQLHs1c1Ls5MUo21Ezz+owAd5aR7VYBRHYBbsHvSrMIkO8d6q80vJPLiQkeCUg0EUrulzvuke5PcPwWAu1p48uwXLnZnaaEEbBtOvAb1JuwwMBL3bNSQEnTzZRn2cBwG7t3pGXM4rZ7j8OFTfTYd8psWEMJaD5RF3H4fFVnDIXsZq9wLjncAG7SBpcgnQABIzzGpqLHVjPKd0+iO/XsKfyyWUcPDTG+7LcTLfSjsji5x/xH4LkMj4A9Yv70wmrEzlxKy0qDZl1JHWLgc4bbCxvvcPgpfB6oCGMcGNG3gFF08bpWc5bTyhfjbh23UG7E3M8nhooUbbiOk6xxkT+LvvK4/qt+KncLe3mYgfQZ7QCqhh8rpWudwNvZf4pxR4iRYcNO5RodtEyl+HFj/EKKQ1DnNYS0ltjpa2VoPTuKXrqWqN+bETh+q4h3c9oCfUFXdS0QUOVC6tGcV9NVj85HMBxEeYdpjNlCuY0k6tvwvY/xAe9bbGVxU0UUn5yNr/2mg+9XjxCXYXLE33MUFP0HrsSO8XXOXh7CD8brVankZQvNxGWHjG5zbdmz2KIreQf2dS63CVjZPbpbuTlngxfLkjP3N/BuPeFyQf8ARWWq5IVceoZG8f2chaT2OsFD1VDKz85FIzpdHcesLJikn0ZRpoj0JbO30m/9RCsFl4jACfQdCaxPTuN3ALAzWh3Cw8FIw07uNupRkDyN6k4JOlVaJsdxRn8WT6CLpTSB5J2p1iZkFNMYReXm35Lbc+U2t032dNlWiGyuY1XB8hjYfIjPlG/1njb2DUdd+hQGNYllbYKBo8as3KQQRp3J7glSx04lkBcI7FjBtfJ5nYDr1gcSo9PJz+roa454Qx/SWHDsNMMQDh5bvKf0E+b2DTvTWrbx96mGUNfU/ohAzjITm7G7e8BOcHwKlbK8TSCofG4MdHISxgeQHAZT+c8k30BA322p9pbsxW5soshL3ZGAvedjWAucepo1Kt/JnwXTS2lryaaHbzWnPSDp3RDZqbu26DQrRaKtdCLBrIY2+a0C5G4WBLWDqLuxVzlDy3gId9Je23s3KHxKS+lbguGlJ79BryzqoAwRQsbHHGMsbWAANH4ue1Y9i0dnX61ajT19ac8UJ5s/Ve8hjSNxF9XDpAU5yS5CP8ZbNXGMxQ+WImku5yQEZWvuAMm8jW9rbyjEnB65vqOyzxvHy4bj7k9yQEWHNLx9NIBIQdMuYEhhHEAtB6QVQpaVzJXC1tVu9VKHXud/vVM5Qcn80jXtAscwd+0MtvZm7lnx5/xW33LuF4lHwVnCgrRRx6JGlwgNUoyMhMySszpUKRRAJR7Quc9lzI7vtfYQANNcxFjtG9KSbJsMnQk5YwF44ke7U7+HXquZidb7vht7t/BTpYWhB/41Td5XcoNiRfQE68Bt7RwTCpe5p1330uL6Eg3sdNQRrwVqZNo6NLH6LPVCE08ZK8U2wpEHHIOKexSabV9Cfk+H7GP92z5I8Qh+yj9RvyWx4Pcyc/2MDjksnsNT0hbf4hD9lH6jfkvfEYvso/Ub8lHp/ct6heDIqaVulyNO9L4nO90LmRS808jSQDMW666XG7TtWriji+zZ6jfkjxOP7NnqN+Sj0z8kPOvB82nkM58hfLVueXG7jku53W5zjr3q4cn8KpqUfRMBfvlcQ556M3mjoFgti8Tj+zZ6jfkjxSP7NnqN+SZLHN7X+hRZIrsZyzEekd6gsfwOGoJlBLKjK0MkzPIblPoAgbLjtWyeKR/Zs9VvyR4pH9mz1W/JUXDtdyed7GIswWte3JLWjJsORhuR1kgA96eYdySoYiDzfOOHnSuL7njlPkX/AMK2LxWP0Geq35L3xZnoM9VvyU8hro6+C0uIcvu3M5rKtscb5HHyY2ueddzQT8FUsW5d0krY2Me9jc8bnkDNZgcC+4G0Eadq3PxdnoN9ULhtFEL2jjF9tmNF+vRV9Kn9zJjxOnojAq/lRHJ46GSyOM7ovFwyJ5zFn1sh812w2sdikaTGKiaWRzIZWRySU5LpLMDREAJPIdZxLm2Fxpcda24UsfoM9VvyR4rH6DPVb8lPpYl/Wy8GZSSt6E1kqwN61fxSP7Nnqt+S88Ti+zZ6jfkqekfkX6heDHn4h03XDqu+/aLG1tRa2p36LY/Eovs4/Ub8keIxfZR+o35KVwrXRhz14McdWm/1r2+II7dHELl1Y4a5t5O7ft/0Wy+JRfZx+o35I8Ri+yj9RvyU+nl+YOfHwYe+rJ0DyLW322CwvbbpxTaSUnab7dtr6kk+0k9pW8+IxfZR+o35I8Ri+yj9RvyU+nfkOevBgWZC33xGL7KP1G/JCPT+4eoXgcIQhajMCEIQAIQhAAhCEACEIQAIQhAAhCEACEIQAIQhAAhCEACEIQAIQhAAhCEACEIQAIQhAAhCEACEIQAIQhAAhCEACEIQAIQhAAhCEACEIQAIQhAAhCEACEIQB//Z'}
                    alt={currentProfile.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="w-full  flex flex-col p-6 lg:p-8 gap-4 bg-[#9ed09d]">
                  <div className="flex flex-col space-y-3 items-start  py-40">
                    <h2 className="font-poppins text-3xl lg:text-7xl font-bold tracking-tight text-black/70 drop-shadow-xl">
                      {currentProfile.name}, {currentProfile.age}
                    </h2>
                    <p className="flex items-center gap-2 text-black/80 text-lg mt-40 font-inter lg:text-xl font-medium">
                      <span>
                        {currentProfile.distance.toFixed(1)} km •{" "}
                        {currentProfile.location}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2 pt-10">
                      {currentProfile.tags.slice(0, 4).map((t: string) => (
                        <span
                          key={t}
                          className="px-3 py-1.5 font-poppins rounded-full bg-white/15 backdrop-blur-sm text-black/80 text-[14px] font-inter font-bold transition-colors hover:bg-white/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {typeof currentProfile.matchPercent === "number" && (
                      <div className="flex gap-2 pt-1">
                        <span className="px-3 py-1 rounded-full bg-[#7FB77E] text-black/8ext-[22px] font-poppins font-bold shadow-sm">
                          {currentProfile.matchPercent}% match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Action bar desktop */}
              <div className="mt-8 flex items-center justify-center gap-8">
                <button
                  onClick={() => handlePass(currentProfile.id)}
                  aria-label="Passer le profil"
                  className="group relative px-10 py-4 rounded-xl font-montserrat text-sm tracking-widest font-semibold bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-[0_4px_0_0_rgba(0,0,0,0.12)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_0_0_rgba(0,0,0,0.1)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300/50"
                >
                  <ThumbsDown className="w-5 h-5 mr-2 inline-block opacity-70 group-hover:opacity-100 transition" />
                  PASS
                </button>
                <button
                  onClick={() => handleLike(currentProfile.id)}
                  aria-label="Aimer le profil"
                  className="group relative px-12 py-4 rounded-xl font-montserrat text-sm tracking-widest font-semibold bg-gradient-to-r from-[#7FB77E] via-[#6FA76E] to-[#5d8f5c] text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_0_0_rgba(0,0,0,0.12)] focus:outline-none focus:ring-4 focus:ring-[#7FB77E]/40 transition-all duration-200"
                >
                  <Heart className="w-5 h-5 mr-2 inline-block animate-pulse group-hover:animate-none" />
                  SMASH
                </button>
              </div>
            </div>
          ) : (
            <div className="text-lg font-medium text-muted-foreground">
              Aucun profil
            </div>
          )}
          {loading && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7FB77E]"></div>
              <p className="mt-2 text-muted-foreground">Chargement de plus de profils...</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout (unchanged basic card with sheet trigger) */}
      <div className="lg:hidden px-4 py-6">
        <header className="w-full flex items-center justify-between mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <BrutalButton
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Filter className="w-4 h-4" />
                {filters.tags.length > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0 ml-1">
                    {filters.tags.length}
                  </span>
                )}
              </BrutalButton>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-montserrat text-xl font-semibold tracking-tight">
                  Filtres
                </SheetTitle>
              </SheetHeader>
              {/* Could replicate filter controls here if needed */}
            </SheetContent>
          </Sheet>
        </header>
        {currentProfile && (
          <div>
            <div className="rounded-xl overflow-hidden shadow-soft bg-white flex flex-col transition-all duration-300">
              <div className="relative w-full h-[420px]">
                <img
                  src={currentProfile.images[1] || "https://randomuser.me/api/portraits/women/3.jpg"}
                  alt={currentProfile.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-montserrat text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                onClick={() => handlePass(currentProfile.id)}
                aria-label="Passer le profil"
                className="group relative flex-1 max-w-[180px] px-6 py-3 rounded-xl font-montserrat text-xs tracking-widest font-semibold bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-[0_3px_0_0_rgba(0,0,0,0.12)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_0_0_rgba(0,0,0,0.1)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300/50"
              >
                <ThumbsDown className="w-4 h-4 mr-1.5 inline-block opacity-70 group-hover:opacity-100 transition" />
                PASS
              </button>
              <button
                onClick={() => handleLike(currentProfile.id)}
                aria-label="Aimer le profil"
                className="group relative flex-1 max-w-[180px] px-6 py-3 rounded-xl font-montserrat text-xs tracking-widest font-semibold bg-gradient-to-r from-[#7FB77E] via-[#6FA76E] to-[#5d8f5c] text-white shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_0_0_rgba(0,0,0,0.12)] focus:outline-none focus:ring-4 focus:ring-[#7FB77E]/40 transition-all duration-200"
              >
                <Heart className="w-4 h-4 mr-1.5 inline-block" />
                SMASH
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

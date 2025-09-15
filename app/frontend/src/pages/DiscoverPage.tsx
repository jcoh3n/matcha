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

  // Fetch users for discovery
  const fetchDiscoveryUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      console.log("Fetching discovery users...");
      const response = await api.getRandomUsers(token, 8);
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        console.log("Received users:", users);
        const transformedUsers = users.map(transformUserForProfileCard);
        console.log("Transformed users:", transformedUsers);
        setProfiles(transformedUsers);
        setPeers(transformedUsers);
        if (transformedUsers.length > 0) {
          setActivePeerId(transformedUsers[0].id);
        } else {
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
        fetchDiscoveryUsers();
        setCurrentIndex(0);
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
        fetchDiscoveryUsers();
        setCurrentIndex(0);
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

  const applyFilters = async () => {
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
        8
      );
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        console.log("Received filtered users:", users);
        const transformedUsers = users.map(transformUserForProfileCard);
        console.log("Transformed filtered users:", transformedUsers);
        setProfiles(transformedUsers);
        setPeers(transformedUsers);
        if (transformedUsers.length > 0) {
          setActivePeerId(transformedUsers[0].id);
        } else {
          console.log("No users found for discovery with applied filters");
        }
      } else {
        console.error("Failed to fetch filtered users", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    } finally {
      setLoading(false);
      setCurrentIndex(0);
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
                    onClick={applyFilters}
                    className="w-full py-3 rounded-xl bg-[#7FB77E] text-white font-semibold shadow-lg hover:bg-[#6FA76E] transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    <Sparkles className="w-5 h-5" />
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
                    src={currentProfile.images[0] || "https://randomuser.me/api/portraits/women/2.jpg"}
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
                      <MapPin className="w-4 h-4 lg:w-8 lg:h-8" />
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

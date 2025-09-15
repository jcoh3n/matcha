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
import { ProfileListItem } from "@/components/profile/ProfileListItem";
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

  const applyFilters = () => {
    // In a real app, this would filter profiles from the backend
    fetchDiscoveryUsers();
    setCurrentIndex(0);
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
        <div className="w-3/5 flex flex-col p-8 ">
          <div className="w-[90%] mr-auto  min-h-full">
            {/* Top identity */}

            {/* Tabs */}

            {/* List */}
            <div className="rounded-3xl bg-white border min-h-full border-gray-200 shadow-xl overflow-hidden">
              <ul className="max-h-[100vh] overflow-y-auto divide-y divide-gray-100">
                {peers.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setActivePeerId(p.id)}
                      className={`w-full flex items-center gap-4 p-4 text-left transition ${
                        activePeerId === p.id
                          ? "bg-gray-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="relative inline-flex">
                        <img
                          src={p.images[0] || "https://randomuser.me/api/portraits/women/1.jpg"}
                          alt={""}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <span className="absolute inset-0 rounded-full ring-4 ring-yellow-300/70"></span>
                      </span>
                      <div>
                        <p className="font-semibold leading-tight">{p.name}</p>
                        <p className="text-[22px] text-gray-500">
                          Expires in {Math.round(Math.random() * 48) + 1}{" "}
                          {Math.random() > 0.5 ? "hours" : "days"}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* RIGHT HALF: Profile Card (80% width inner wrapper) */}
        <div className="ml-auto w-[90%] flex flex-col justify-center p-8 ">
          {currentProfile ? (
            <div className="w-[100%] ml-auto">
              {/* Make the profile card clickable */}
              <div 
                className="rounded-xl overflow-hidden shadow-soft bg-white flex flex-col lg:flex-row transition-all duration-300 cursor-pointer hover:shadow-lg"
                onClick={() => handleProfileClick(currentProfile.id)}
              >
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
            {/* Make the profile card clickable */}
            <div 
              className="rounded-xl overflow-hidden shadow-soft bg-white flex flex-col transition-all duration-300 cursor-pointer hover:shadow-lg"
              onClick={() => handleProfileClick(currentProfile.id)}
            >
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

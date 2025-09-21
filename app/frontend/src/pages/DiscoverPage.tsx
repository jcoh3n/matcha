import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Heart,
  ThumbsDown,
  X,
  Star,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react";
import { api } from "@/lib/api";
import { likeUser as likeUserApi } from "@/services/profileService";

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
  distanceKm?: number | null;
}

interface Filters {
  ageRange: [number, number];
  distance: number;
  tags: string[];
  sortBy?: "fame" | "distance" | "age" | "tags";
  sortOrder?: "asc" | "desc";
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
    location: user.location
      ? `${user.location.city}, ${user.location.country}`
      : "",
    distance: typeof user.distanceKm === "number" ? user.distanceKm : 0,
    tags: user.tags || [],
    fameRating: user.profile?.fameRating || 0,
    isOnline: Math.random() > 0.5, // Placeholder
    orientation: user.profile?.orientation || "straight",
    gender: user.profile?.gender || "female",
  };
};

type CardUser = ReturnType<typeof transformUserForProfileCard>;

export function DiscoverPage() {
  const [profiles, setProfiles] = useState<CardUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    ageRange: [18, 35],
    distance: 50,
    tags: [],
    fameRating: 0,
  });
  const [peers, setPeers] = useState<CardUser[]>([]);
  const [activePeerId, setActivePeerId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState<"left" | "right" | null>(
    null
  );
  const navigate = useNavigate();

  const handleProfileClick = (profileId: string) => {
    navigate(`/profiles/${profileId}`);
  };

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
          setProfiles((prev) => [...prev, ...transformedUsers]);
          setPeers((prev) => [...prev, ...transformedUsers]);
        }
        if (transformedUsers.length > 0 && offset === 0) {
          setActivePeerId(transformedUsers[0].id);
        } else if (transformedUsers.length === 0 && offset === 0) {
          console.log("No users found for discovery");
        }
      } else {
        console.error(
          "Failed to fetch discovery users",
          response.status,
          response.statusText
        );
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

  const moveToNextProfile = useCallback(() => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      console.log(`Moved to next profile, new index: ${currentIndex + 1}`);
    } else {
      // Load more profiles
      console.log("No more profiles, fetching new ones");
      fetchDiscoveryUsers(profiles.length);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, profiles.length]);

  const handleLike = useCallback(
    async (userId: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Create like server-side so mutual likes can form a match
          await likeUserApi(Number(userId), token);
        }
      } catch (e) {
        console.error("Failed to like user", e);
      } finally {
        // Add like animation then proceed to next profile
        setSwipeAnimation("right");
        setTimeout(() => {
          setSwipeAnimation(null);
          moveToNextProfile();
        }, 300);
      }
    },
  [moveToNextProfile]
  );

  const handlePass = useCallback(
    async (userId: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          await fetch(`http://localhost:3000/api/profiles/${userId}/pass`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (e) {
        console.error("Failed to record pass", e);
      } finally {
        setSwipeAnimation("left");
        setTimeout(() => {
          setSwipeAnimation(null);
          moveToNextProfile();
        }, 300);
      }
    },
  [moveToNextProfile]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isFilterSidebarOpen) return; // Don't handle keyboard when sidebar is open

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (currentProfile) {
          handlePass(currentProfile.id);
        }
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (currentProfile) {
          handleLike(currentProfile.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentProfile, handleLike, handlePass, isFilterSidebarOpen]);

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
          fameRating: filters.fameRating,
        },
        8,
        offset
      );
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        console.log("Received filtered users:", users);
        // Transform; backend already filters/sorts, client sort remains as fallback
        const transformedUsers = users.map(transformUserForProfileCard);
        console.log("Transformed filtered users:", transformedUsers);
        if (offset === 0) {
          // Replace profiles for initial load
          setProfiles(transformedUsers);
          setPeers(transformedUsers);
        } else {
          // Append profiles for pagination
          setProfiles((prev) => [...prev, ...transformedUsers]);
          setPeers((prev) => [...prev, ...transformedUsers]);
        }
        if (transformedUsers.length > 0 && offset === 0) {
          setActivePeerId(transformedUsers[0].id);
        } else if (transformedUsers.length === 0 && offset === 0) {
          console.log("No users found for discovery with applied filters");
        }
      } else {
        console.error(
          "Failed to fetch filtered users",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    } finally {
      setLoading(false);
      if (offset === 0) {
        setCurrentIndex(0);
      }
      setIsFilterSidebarOpen(false); // Fermer la sidebar après application des filtres
    }
  };

  const resetFilters = () => {
    setFilters({
      ageRange: [18, 35],
      distance: 50,
      tags: [],
      fameRating: 0,
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        Loading profiles...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center font-poppins px-2 md:px-0">
      {/* Overlay pour la sidebar */}
      {isFilterSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFilterSidebarOpen(false)}
        />
      )}

      {/* Filter Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isFilterSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filtres</h2>
            <button
              onClick={() => setIsFilterSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Age Range */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <label className="font-semibold text-gray-700">Âge</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="18"
                max="60"
                value={filters.ageRange[0]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    ageRange: [parseInt(e.target.value), prev.ageRange[1]],
                  }))
                }
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-center">
                {filters.ageRange[0]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="18"
                max="60"
                value={filters.ageRange[1]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    ageRange: [prev.ageRange[0], parseInt(e.target.value)],
                  }))
                }
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-center">
                {filters.ageRange[1]}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {filters.ageRange[0]} - {filters.ageRange[1]} ans
            </div>
          </div>

          {/* Distance */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-600" />
              <label className="font-semibold text-gray-700">Distance</label>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={filters.distance}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  distance: parseInt(e.target.value),
                }))
              }
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-2">
              {filters.distance} km maximum
            </div>
          </div>

          {/* Fame Rating */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-gray-600" />
              <label className="font-semibold text-gray-700">
                Note de popularité
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.fameRating || 0}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  fameRating: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-2">
              {filters.fameRating} étoiles minimum
            </div>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="font-semibold text-gray-700 mb-3 block">
              Trier par
            </label>
            <select
              value={filters.sortBy || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as
                    | "fame"
                    | "distance"
                    | "age"
                    | "tags"
                    | undefined,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FB77E]"
            >
              <option value="">Aucun tri</option>
              <option value="age">Âge</option>
              <option value="distance">Distance</option>
              <option value="fame">Popularité</option>
              <option value="tags">Intérêts communs</option>
            </select>
            {filters.sortBy && (
              <select
                value={filters.sortOrder || "asc"}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: e.target.value as "asc" | "desc",
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#7FB77E]"
              >
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </select>
            )}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-600" />
              <label className="font-semibold text-gray-700">Intérêts</label>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.tags.includes(tag)
                      ? "bg-[#7FB77E] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {filters.tags.length > 0 && (
              <div className="text-sm text-gray-500 mt-2">
                {filters.tags.length} intérêt(s) sélectionné(s)
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => applyFilters()}
              className="w-full py-3 bg-[#7FB77E] text-white rounded-lg font-semibold hover:bg-[#6FA76E] transition-colors"
            >
              Appliquer les filtres
            </button>
            <button
              onClick={resetFilters}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Desktop / large screens: split screen */}
      <div className="flex w-5/6 mx-auto relative">
        <div className="w-full mx-auto flex items-center flex-col justify-center px-2">
          {/* Filter button */}
          <Filter
            className="cursor-pointer mr-auto mb-10 hover:text-[#7FB77E] transition-colors"
            onClick={() => setIsFilterSidebarOpen(true)}
          />

          {currentProfile ? (
            <>
              <div className="w-[100%]">
                {/* Make the profile card clickable with animation */}
                <div
                  className={`rounded-xl overflow-hidden shadow-soft bg-white flex flex-row lg:flex-row transition-all duration-300 cursor-pointer hover:shadow-lg w-full lg:max-w-5xl mx-auto ${
                    swipeAnimation === "left"
                      ? "transform -translate-x-full opacity-50 -rotate-12"
                      : swipeAnimation === "right"
                      ? "transform translate-x-full opacity-50 rotate-12"
                      : "transform translate-x-0 opacity-100 rotate-0"
                  }`}
                  onClick={() => handleProfileClick(currentProfile.id)}
                >
                  <div className="relative w-5/6 bg-[#9ed09d]">
                    <img
                      src={
                        currentProfile.images[0] ||
                        "https://randomuser.me/api/portraits/women/2.jpg"
                      }
                      alt={currentProfile.name}
                      className="inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full flex flex-col p-6 lg:p-8 gap-4 bg-[#9ed09d]">
                    <div className="flex flex-col space-y-3 items-start py-10 lg:py-40">
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
                    </div>
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
              {/* Keyboard hints */}
              <div className="mt-4 text-center text-sm text-gray-500">
                Utilisez ← pour PASS et → pour SMASH
              </div>
            </>
          ) : (
            <div className="text-lg font-medium text-muted-foreground">
              Aucun profil
            </div>
          )}
          {loading && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7FB77E]"></div>
              <p className="mt-2 text-muted-foreground">
                Chargement de plus de profils...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

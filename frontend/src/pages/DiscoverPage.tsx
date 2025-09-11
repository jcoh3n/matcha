import { useState } from "react";
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
} from "lucide-react";
import { ProfileCard } from "@/components/ui/profile-card";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Header } from "@/components/layout/Header";
import { getRandomProfiles, type MockProfile } from "@/data/mockProfiles";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

// Removed emoji mapping for cleaner design

export function DiscoverPage() {
  const [profiles, setProfiles] = useState<MockProfile[]>(getRandomProfiles(8));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    ageRange: [18, 35],
    distance: 50,
    tags: [],
  });

  const currentProfile = profiles[currentIndex];

  const handleLike = (userId: string) => {
    console.log(`Liked user: ${userId}`);
    // Add like animation and move to next profile
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Load more profiles or show no more profiles message
        setProfiles(getRandomProfiles(8));
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handlePass = (userId: string) => {
    console.log(`Passed user: ${userId}`);
    // Add pass animation and move to next profile
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Load more profiles
        setProfiles(getRandomProfiles(8));
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
    setProfiles(getRandomProfiles(8));
    setCurrentIndex(0);
  };

  return (
    <div className="w-full min-h-screen relative font-poppins flex justify-center">
      {/* Grid layout centered */}
      <div className="grid gap-8 xl:gap-12 px-4 md:px-8 py-8 grid-cols-1 lg:grid-cols-[320px_auto] justify-center items-start mt-40">
        {/* Filters (desktop) */}
        <aside className="hidden lg:flex flex-col gap-8 w-full mt-10 ">
          <div className="rounded-xl border-0 bg-white shadow-sm p-6 w-full">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-montserrat font-semibold text-lg text-gray-800">
                Filtres
              </h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium text-gray-600">
                  Intérêts
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filters.tags.includes(tag)
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      } `}
                    >
                      {tag}
                      {filters.tags.includes(tag) && (
                        <X className="w-3 h-3 ml-1.5 inline-block opacity-70" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  onClick={applyFilters}
                  className="flex-1 h-11 rounded-lg bg-[#7FB77E] text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#6FA76E] active:scale-[0.98]"
                >
                  Appliquer
                </button>
                <button
                  onClick={() =>
                    setFilters({ ageRange: [18, 35], distance: 50, tags: [] })
                  }
                  className="flex-1 h-11 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main swipe area */}
        <div className="flex flex-col items-center w-full ">
          <header className="w-full flex items-center justify-between mb-6 lg:mb-8">
            <div className="lg:hidden">
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
                  {/* ...mobile filters unchanged for brevity... */}
                </SheetContent>
              </Sheet>
            </div>
          </header>

          {currentProfile ? (
            <div className="w-full mx-auto">
              {/* Split card */}
              <div className="rounded-xl overflow-hidden shadow-soft bg-white flex flex-col lg:flex-row transition-all duration-300 max-w-[900px] mx-auto">
                {/* LEFT (image 50%) */}
                <div className="relative w-full lg:w-1/2 h-[420px] lg:h-[600px] shrink-0">
                  <img
                    src={currentProfile.images[0]}
                    alt={currentProfile.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  {/* Overlay info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <div className="space-y-3">
                      <h2 className="font-montserrat text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                        {currentProfile.name}, {currentProfile.age}
                      </h2>
                      <p className="flex items-center gap-2 text-white/90 text-sm font-medium">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {currentProfile.distance.toFixed(1)} km •{" "}
                          {currentProfile.location}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {currentProfile.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1.5 font-poppins rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[11px] font-medium transition-colors hover:bg-white/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {typeof currentProfile.matchPercent === "number" && (
                        <div className="flex gap-2 pt-1">
                          <span className="px-3 py-1 rounded-full bg-[#7FB77E] text-white text-[11px] font-poppins font-bold shadow-sm">
                            {currentProfile.matchPercent}% match
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* RIGHT (summary) */}
                <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-8 gap-6 bg-primary">
                  {/* Bio */}
                  <div className="space-y-3 text-center">
                    <h3 className="font-montserrat t font-bold text-lg lg:text-xl text-white font-poppins  tracking-tight">
                      À propos
                    </h3>
                    <p className="text-sm lg:text-lg leading-relaxed text-white font-poppins font-semibold font-poppins  line-clamp-5">
                      Passionné(e) par {currentProfile.tags[0]?.toLowerCase()}{" "}
                      et{" "}
                      {currentProfile.tags[1]?.toLowerCase() ||
                        "les rencontres"}
                      . Toujours partant(e) pour créer des connexions
                      authentiques et vivre des expériences mémorables.
                    </p>
                  </div>
                  {/* Details list */}

                  <div className="mt-auto pt-2">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handlePass(currentProfile.id)}
                        className="w-16 h-16 rounded-full bg-[#FF6F61]/10 text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                        aria-label="Passer"
                      >
                        <X className="w-8 h-8" />
                      </button>
                      <button
                        onClick={() => handleLike(currentProfile.id)}
                        className="w-20 h-20 rounded-full bg-gradient-to-b from-[#7FB77E] to-[#6FA76E] text-white flex items-center justify-center shadow-lg shadow-[#7FB77E]/30 transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-[1.05]"
                        aria-label="Aimer"
                      >
                        <Check className="w-10 h-10" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-lg font-medium text-muted-foreground">
              Aucun profil
            </div>
          )}
        </div>

        {/* Mobile fixed buttons */}
      </div>
      {currentProfile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4 bg-gradient-to-t from-[#F9FAFB] to-transparent pt-16">
          <button
            onClick={() => handlePass(currentProfile.id)}
            className="w-14 h-14 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={() => handleLike(currentProfile.id)}
            className="w-16 h-16 rounded-full bg-[#7FB77E] hover:bg-[#6FA76E] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Check className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}

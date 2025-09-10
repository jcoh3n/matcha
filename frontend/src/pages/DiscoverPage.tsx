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
    <div className="h-screen w-full  relative font-inter">
      {/* Grid layout: left filters (desktop), center large card */}
      <div className="grid gap-8 xl:gap-12 mx-auto px-4 md:px-8 py-6 grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Filters (desktop) */}
        <aside className="hidden lg:flex flex-col gap-8 sticky top-24 self-start w-full">
          <div className="rounded-xl border-0 bg-white shadow-sm p-6 space-y-6 w-full">
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
        <div className="flex flex-col items-center">
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
            <div className=" max-w-4xl mx-auto">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm">
                {/* Photo principale */}
                <img
                  src={currentProfile.images[0]}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                {/* Infos profil */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <div className="flex justify-between items-end gap-4">
                    <div className="space-y-2">
                      <h2 className="font-montserrat text-3xl lg:text-4xl font-bold tracking-tight text-white">
                        {currentProfile.name}, {currentProfile.age}
                      </h2>
                      <p className="flex items-center gap-1.5 text-white/90 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {currentProfile.distance.toFixed(1)} km •{" "}
                          {currentProfile.location}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {currentProfile.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-[2px] text-white/90 text-xs font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {typeof currentProfile.matchPercent === "number" && (
                        <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-[2px] text-white text-xs font-medium">
                          {currentProfile.matchPercent}% Match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons Like/Pass */}
              <div className="flex items-center justify-center gap-4 mt-6">
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
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-lg font-medium text-muted-foreground">
              Aucun profil
            </div>
          )}

          {/* Action buttons */}

          {/* Progress bar */}
          <div className="mt-8 w-full max-w-3xl mx-auto px-4">
            <div className="h-0.5 w-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-[#7FB77E] transition-all duration-300 ease-out"
                style={{
                  width: `${((currentIndex + 1) / profiles.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile fixed buttons */}
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
    </div>
  );
}

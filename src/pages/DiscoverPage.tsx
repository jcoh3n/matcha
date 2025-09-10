import { useState } from "react"
import { Filter, Settings, X } from "lucide-react"
import { ProfileCard } from "@/components/ui/profile-card"
import { BrutalButton } from "@/components/ui/brutal-button"
import { Header } from "@/components/layout/Header"
import { getRandomProfiles, type MockProfile } from "@/data/mockProfiles"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Filters {
  ageRange: [number, number]
  distance: number
  tags: string[]
}

const availableTags = [
  "Art", "Coffee", "Hiking", "Foodie", "Photography", "Tech", "Music", 
  "Guitar", "Travel", "Yoga", "Mindfulness", "Nature", "Cooking", 
  "Dogs", "Design", "Fitness", "Climbing", "Adventure", "Science"
]

export function DiscoverPage() {
  const [profiles, setProfiles] = useState<MockProfile[]>(getRandomProfiles(8))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filters, setFilters] = useState<Filters>({
    ageRange: [18, 35],
    distance: 50,
    tags: []
  })

  const currentProfile = profiles[currentIndex]

  const handleLike = (userId: string) => {
    console.log(`Liked user: ${userId}`)
    // Add like animation and move to next profile
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Load more profiles or show no more profiles message
        setProfiles(getRandomProfiles(8))
        setCurrentIndex(0)
      }
    }, 300)
  }

  const handlePass = (userId: string) => {
    console.log(`Passed user: ${userId}`)
    // Add pass animation and move to next profile
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Load more profiles
        setProfiles(getRandomProfiles(8))
        setCurrentIndex(0)
      }
    }, 300)
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const applyFilters = () => {
    // In a real app, this would filter profiles from the backend
    setProfiles(getRandomProfiles(8))
    setCurrentIndex(0)
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header 
        currentPage="discover"
        notificationCount={3}
        messageCount={2}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Discover</h1>
            <p className="text-muted-foreground">
              {profiles.length - currentIndex} profiles nearby
            </p>
          </div>

          {/* Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <BrutalButton variant="outline" size="lg">
                <Filter className="w-5 h-5" />
                Filters
                {filters.tags.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {filters.tags.length}
                  </Badge>
                )}
              </BrutalButton>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl font-bold">
                  Filters
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-8 mt-8">
                {/* Age Range */}
                <div className="space-y-4">
                  <Label className="font-semibold">Age Range</Label>
                  <div className="px-4">
                    <Slider
                      value={filters.ageRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
                      max={60}
                      min={18}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{filters.ageRange[0]} years</span>
                      <span>{filters.ageRange[1]} years</span>
                    </div>
                  </div>
                </div>

                {/* Distance */}
                <div className="space-y-4">
                  <Label className="font-semibold">Maximum Distance</Label>
                  <div className="px-4">
                    <Slider
                      value={[filters.distance]}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      {filters.distance} km
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <Label className="font-semibold">Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-smooth rounded-full ${
                          filters.tags.includes(tag) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        {filters.tags.includes(tag) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Apply Filters */}
                <BrutalButton 
                  variant="hero" 
                  className="w-full"
                  onClick={applyFilters}
                >
                  Apply Filters
                </BrutalButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Profile Discovery */}
        {currentProfile ? (
          <div className="max-w-md mx-auto">
            <ProfileCard
              user={currentProfile}
              variant="discovery"
              onLike={handleLike}
              onPass={handlePass}
              className="animate-scale-in"
            />

            {/* Progress Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {profiles.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-smooth ${
                    index <= currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Settings className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">No more profiles</h2>
            <p className="text-muted-foreground mb-8">
              Try adjusting your filters or check back later for new matches!
            </p>
            <BrutalButton variant="hero" onClick={() => {
              setProfiles(getRandomProfiles(8))
              setCurrentIndex(0)
            }}>
              Load More Profiles
            </BrutalButton>
          </div>
        )}
      </main>
    </div>
  )
}
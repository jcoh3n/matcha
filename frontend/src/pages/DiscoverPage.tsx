import { useState } from "react"
import { Filter, Settings, X, RefreshCcw, Sparkles } from "lucide-react"
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
    <div className="relative">
      {/* Gradient backdrop accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.25),transparent_60%),radial-gradient(circle_at_85%_80%,hsl(var(--accent)/0.25),transparent_65%)]" />

      <div className="grid lg:grid-cols-[300px_1fr] gap-10">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block self-start sticky top-24 space-y-8">
          <div className="glass-card p-6 rounded-3xl space-y-8 gradient-ring">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Filters</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wide">Age Range</Label>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
                  max={60}
                  min={18}
                  step={1}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{filters.ageRange[0]} yrs</span>
                  <span>{filters.ageRange[1]} yrs</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wide">Distance</Label>
                <Slider
                  value={[filters.distance]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                  max={100}
                  min={1}
                  step={1}
                />
                <div className="text-[10px] text-muted-foreground text-right">{filters.distance} km</div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wide">Interests</Label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.slice(0,14).map(tag => (
                    <button
                      key={tag}
                      onClick={()=>toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-smooth border ${filters.tags.includes(tag)?'bg-primary text-primary-foreground border-primary':'bg-muted/30 hover:bg-muted/60'} backdrop-blur brutal-shadow/10`}
                    >
                      {tag}
                      {filters.tags.includes(tag) && <X className="inline w-3 h-3 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
              <BrutalButton variant="hero" className="w-full h-11" onClick={applyFilters}>
                Apply <Sparkles className="w-4 h-4" />
              </BrutalButton>
              <BrutalButton variant="outline" className="w-full h-11" onClick={()=>setFilters({ageRange:[18,35],distance:50,tags:[]})}>
                Reset
                <RefreshCcw className="w-4 h-4" />
              </BrutalButton>
            </div>
          </div>
        </aside>

        <main className="pb-24">
          {/* Mobile header actions */}
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <div>
              <h1 className="font-display text-4xl font-black leading-none mb-3">Discover</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" /> Smart feed
                </span>
                <span className="w-1 h-1 rounded-full bg-muted"></span>
                {profiles.length - currentIndex} profiles left
              </p>
            </div>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <BrutalButton variant="outline" size="sm" className="rounded-full">
                    <Filter className="w-4 h-4" />
                    {filters.tags.length>0 && <span className="text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0 ml-1">{filters.tags.length}</span>}
                  </BrutalButton>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-display text-xl font-bold">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-8 mt-8 pb-8">
                    <div className="space-y-4">
                      <Label className="font-semibold text-sm">Age Range</Label>
                      <Slider value={filters.ageRange} onValueChange={(v)=>setFilters(p=>({...p,ageRange:v as [number,number]}))} max={60} min={18} step={1} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{filters.ageRange[0]} yrs</span>
                        <span>{filters.ageRange[1]} yrs</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="font-semibold text-sm">Distance</Label>
                      <Slider value={[filters.distance]} onValueChange={(v)=>setFilters(p=>({...p,distance:v[0]}))} max={100} min={1} step={1} />
                      <div className="text-xs text-muted-foreground text-right">{filters.distance} km</div>
                    </div>
                    <div className="space-y-4">
                      <Label className="font-semibold text-sm">Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={filters.tags.includes(tag)?'default':'outline'}
                            className={`cursor-pointer rounded-full ${filters.tags.includes(tag)?'bg-primary text-primary-foreground':'hover:bg-muted'}`}
                            onClick={()=>toggleTag(tag)}
                          >{tag}{filters.tags.includes(tag)&&<X className="w-3 h-3 ml-1" />}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <BrutalButton variant="hero" className="flex-1" onClick={applyFilters}>Apply</BrutalButton>
                      <BrutalButton variant="outline" className="flex-1" onClick={()=>setFilters({ageRange:[18,35],distance:50,tags:[]})}>Reset</BrutalButton>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Card stack / main content */}
          {currentProfile ? (
            <div className="max-w-xl mx-auto">
              <ProfileCard
                user={currentProfile}
                variant="discovery"
                onLike={handleLike}
                onPass={handlePass}
                className="animate-scale-in"
              />
              <div className="mt-10">
                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all" style={{width: `${((currentIndex+1)/profiles.length)*100}%`}} />
                </div>
                <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>{currentIndex+1} / {profiles.length}</span>
                  <span>Discover Feed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-28 h-28 rounded-[2rem] bg-muted/30 flex items-center justify-center mx-auto mb-8 gradient-ring">
                <Settings className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">No more profiles</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">Adjust filters or come back later—new people join every hour.</p>
              <BrutalButton variant="hero" onClick={()=>{setProfiles(getRandomProfiles(8));setCurrentIndex(0)}} className="px-8">Reload Feed</BrutalButton>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
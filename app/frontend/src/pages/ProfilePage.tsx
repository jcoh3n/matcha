import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, LogOut, ChevronLeft, Heart, Eye } from "lucide-react";
import { MatchPercentage } from "@/components/ui/match-percentage";
import { OrientationBadge } from "@/components/ui/orientation-badge";
import { OnlineStatus } from "@/components/ui/online-status";
import { ViewerLikersSection } from "@/components/ui/viewer-likers-section";
import { useProfile } from "@/hooks/useProfile";
import "@/pages/profile-styles.css";

export function ProfilePage({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const {
    profile,
    loading,
    fetchProfile
  } = useProfile(accessToken);

  useEffect(() => {
    if (!accessToken) {
      console.log("No access token found, calling onLogout");
      onLogout?.();
    }
  }, [accessToken, onLogout]);

  // Load profile when component mounts
  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken, fetchProfile]);

  // Add smooth scroll behavior to the document when component mounts
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.removeProperty('scroll-behavior');
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Error loading profile</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Get profile photo or use a placeholder
  const profilePhoto = profile.photos?.find((photo: any) => photo.isProfile) ||
                      profile.photos?.[0] ||
                      null;
  const otherPhotos = profile.photos?.filter((photo: any) => photo !== profilePhoto) || [];

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const age = profile.profile?.birthDate ? calculateAge(profile.profile.birthDate) : null;
  const bio = profile.profile?.bio || "No bio available";
  const tags = profile.tags?.map((tag: any) => tag.name) || [];
  const location = profile.location ?
    `${profile.location.city || 'Unknown City'}, ${profile.location.country || 'Unknown Country'}` :
    "Location not set";
  const orientation = profile.profile?.orientation || "Not specified";
  const isOnline = true; // This would come from the backend in a real implementation
  const matchPercent = profile.profile?.fameRating || Math.floor(Math.random() * 40) + 60;

  // Function to handle image URLs - use placeholder if blob URL is not accessible
  const getImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face";

    // If it's a blob URL, use a placeholder instead
    if (url.startsWith('blob:')) {
      return "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face";
    }

    return url;
  };

  return (
    <div className="min-h-screen bg-background pb-16">


      {/* Profile photo positioned prominently */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex justify-center">
          <div className="relative">
            {profilePhoto ? (
              <img
                src={getImageUrl(profilePhoto.url)}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-background object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-background bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No photo</span>
              </div>
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 bg-background rounded-full p-1.5 border border-border">
              <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile info section */}
      <div className="mt-16 px-4 max-w-4xl mx-auto space-y-6">
        {/* Name, age, location, stats */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">
              {profile.username}
              {age && `, ${age}`}
            </h1>
            <MatchPercentage value={matchPercent} compact={true} />
            {/* Discrete edit button relocated as requested */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile/edit")}
              className="rounded-full w-8 h-8 flex-shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            {location}
          </p>
          
          <div className="flex justify-center items-center gap-3 pt-1 flex-wrap">
            <OrientationBadge value={orientation} />
            <OnlineStatus online={isOnline} lastSeen={null} />
          </div>
        </div>

        {/* Two-column layout on desktop for bio and interests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio section */}
          <div className="bg-card rounded-2xl p-4 border border-border/30 animate-slide-up">
            <h2 className="font-semibold text-lg mb-2">About Me</h2>
            <p className="text-muted-foreground leading-relaxed">
              {bio}
            </p>
          </div>

          {/* Interests section */}
          {tags.length > 0 && (
            <div className="bg-card rounded-2xl p-4 border border-border/30 animate-slide-up">
              <h2 className="font-semibold text-lg mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2 custom-scrollbar">
                {tags.map((tag: string, index: number) => (
                  <span 
                    key={tag} 
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm transition-transform hover:scale-105"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional photos - centered on mobile, left-aligned on desktop */}
        {otherPhotos.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border/30 animate-slide-up">
            <h2 className="font-semibold text-lg mb-3">Photos</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {otherPhotos.map((photo: any, i: number) => (
                <div 
                  key={photo.id} 
                  className="aspect-square rounded-xl overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={getImageUrl(photo.url)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Who viewed / liked me section */}
        {accessToken && (
          <div className="bg-card rounded-2xl p-4 border border-border/30 animate-slide-up">
            <ViewerLikersSection accessToken={accessToken} />
          </div>
        )}

        {/* Discrete logout button at the very bottom */}
        {onLogout && (
          <div className="pt-6 px-4 animate-fade-in">
            <Button
              variant="ghost"
              className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 py-6 rounded-xl"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
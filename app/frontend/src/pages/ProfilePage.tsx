import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { MatchPercentage } from "@/components/ui/match-percentage";
import { OrientationBadge } from "@/components/ui/orientation-badge";
import { OnlineStatus } from "@/components/ui/online-status";
import { useProfile } from "@/hooks/useProfile";

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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-64">Error loading profile</div>;
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/profile/edit")}
          className="flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Modifier le profil
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="surface-solid overflow-hidden rounded-2xl">
            {profilePhoto ? (
              <img
                src={getImageUrl(profilePhoto.url)}
                alt={profile.username}
                className="w-full h-72 object-cover"
              />
            ) : (
              <div className="w-full h-72 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No profile photo</span>
              </div>
            )}
          </div>
          {otherPhotos.length > 0 && (
            <div className="flex gap-2">
              {otherPhotos.map((photo: any, i: number) => (
                <img
                  key={photo.id}
                  src={getImageUrl(photo.url)}
                  className="w-20 h-20 object-cover rounded-2xl border border-border/40"
                />
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-montserrat text-4xl font-extrabold tracking-tight">
                {profile.username}{age && `, ${age}`}
              </h1>
              <p className="text-muted-foreground mt-1">{location}</p>
              <div className="mt-2 flex items-center gap-3">
                <OrientationBadge value={orientation} />
                <OnlineStatus online={isOnline} lastSeen={null} />
              </div>
            </div>
            <MatchPercentage value={matchPercent} />
          </div>
          <section>
            <h2 className="font-montserrat text-xl font-semibold mb-2">Bio</h2>
            <p className="text-sm leading-relaxed surface p-4">{bio}</p>
          </section>
          {tags.length > 0 && (
            <section>
              <h2 className="font-montserrat text-xl font-semibold mb-2">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

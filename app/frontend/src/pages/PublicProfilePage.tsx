import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, UserX, Flag, MessageCircle } from "lucide-react";
import { OnlineStatus } from "@/components/ui/online-status";
import { OrientationBadge } from "@/components/ui/orientation-badge";
import { Tag } from "@/components/ui/tag";
import { getPublicProfile } from "@/services/profileService";
import { useSocialInteractions } from "@/hooks/useSocialInteractions";

interface PublicProfile {
  id: number;
  username: string;
  age: number | null;
  bio: string;
  tags: { id: number; name: string }[];
  photos: { id: number; url: string; isProfile: boolean }[];
  fameRating: number;
  distance: number | null;
  isOnline: boolean;
  lastSeen: string;
  isLiked: boolean;
  isLikedByUser: boolean;
  isMatch: boolean;
  isBlocked: boolean;
}

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const accessToken = localStorage.getItem("accessToken");
  const {
    loading: socialLoading,
    toggleLike,
    toggleBlock,
    reportProfile,
  } = useSocialInteractions(accessToken);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || !accessToken) return;
      
      try {
        setLoading(true);
        const profileData = await getPublicProfile(parseInt(id), accessToken);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        navigate("/discover");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, accessToken, navigate, toast]);

  const handleLike = async () => {
    if (!profile || !accessToken) return;
    
    try {
      const result = await toggleLike(profile.id, profile.isLiked);
      if (result.success && result.data) {
        setProfile({
          ...profile,
          isLiked: result.data.isLiked,
          isMatch: result.data.isMatch,
        });
        
        toast({
          title: "Success",
          description: result.data.message,
        });
      }
    } catch (error) {
      console.error("Error liking/unliking user:", error);
    }
  };

  const handleBlock = async () => {
    if (!profile || !accessToken) return;
    
    try {
      const result = await toggleBlock(profile.id, profile.isBlocked);
      if (result.success && result.data) {
        setProfile({
          ...profile,
          isBlocked: result.data.isBlocked,
        });
        
        toast({
          title: "Success",
          description: result.data.message,
        });
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
    }
  };

  const handleReport = async () => {
    if (!profile || !accessToken) return;
    
    // In a real app, you would show a dialog to get the reason
    const reason = prompt("Please provide a reason for reporting this user:");
    if (!reason) return;
    
    try {
      const result = await reportProfile(profile.id, reason);
      if (result.success) {
        toast({
          title: "Reported",
          description: "User has been reported successfully",
        });
      }
    } catch (error) {
      console.error("Error reporting user:", error);
    }
  };

  // Function to handle image URLs - use placeholder if blob URL is not accessible
  const getImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face";
    
    // If it's a blob URL, use a placeholder instead
    if (url.startsWith('blob:')) {
      return "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face";
    }
    
    return url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">The requested profile could not be found.</p>
        </div>
      </div>
    );
  }

  // Get profile photo or use a placeholder
  const profilePhoto = profile.photos.find(photo => photo.isProfile) || profile.photos[0] || null;
  const otherPhotos = profile.photos.filter(photo => photo !== profilePhoto);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Photos */}
        <div className="md:col-span-1 space-y-4">
          <div className="surface-solid overflow-hidden rounded-2xl">
            {profilePhoto ? (
              <img
                src={getImageUrl(profilePhoto.url)}
                alt={`${profile.username}'s profile`}
                className="w-full h-72 object-cover"
              />
            ) : (
              <div className="w-full h-72 bg-gray-200 flex items-center justify-center">
                <UserX className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {otherPhotos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {otherPhotos.map((photo) => (
                <img
                  key={photo.id}
                  src={getImageUrl(photo.url)}
                  className="w-20 h-20 object-cover rounded-2xl border border-border/40 flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-montserrat text-4xl font-extrabold tracking-tight">
                {profile.username}{profile.age && `, ${profile.age}`}
              </h1>
              {profile.distance !== null && (
                <p className="text-muted-foreground mt-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.distance} km away
                </p>
              )}
              <div className="mt-2 flex items-center gap-3">
                {profile.profile?.orientation && (
                  <OrientationBadge value={profile.profile.orientation} />
                )}
                <OnlineStatus online={profile.isOnline} lastSeen={profile.lastSeen} />
              </div>
            </div>
            
            {profile.fameRating !== undefined && (
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">
                {profile.fameRating}% match
              </div>
            )}
          </div>

          {/* Bio */}
          <section>
            <h2 className="font-montserrat text-xl font-semibold mb-2">Bio</h2>
            <p className="text-sm leading-relaxed surface p-4">
              {profile.bio || "No bio available"}
            </p>
          </section>

          {/* Tags */}
          {profile.tags.length > 0 && (
            <section>
              <h2 className="font-montserrat text-xl font-semibold mb-2">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <Tag key={tag.id} variant="interest">
                    {tag.name}
                  </Tag>
                ))}
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              variant={profile.isLiked ? "default" : "outline"}
              size="lg"
              onClick={handleLike}
              disabled={socialLoading}
              className="flex-1 min-w-[120px]"
            >
              <Heart className={`w-5 h-5 mr-2 ${profile.isLiked ? "fill-current" : ""}`} />
              {profile.isLiked ? "Liked" : "Like"}
            </Button>
            
            {profile.isMatch && (
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/messages")}
                className="flex-1 min-w-[120px] bg-green-500 hover:bg-green-600"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleBlock}
              disabled={socialLoading}
              className="flex-1 min-w-[120px]"
            >
              <UserX className="w-5 h-5 mr-2" />
              {profile.isBlocked ? "Unblock" : "Block"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleReport}
              disabled={socialLoading}
              className="flex-1 min-w-[120px]"
            >
              <Flag className="w-5 h-5 mr-2" />
              Report
            </Button>
          </div>
          
          {/* Match Badge */}
          {profile.isMatch && (
            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
              <Heart className="w-6 h-6 text-green-500 fill-current mx-auto mb-2" />
              <p className="font-bold text-green-700">It's a match! You and {profile.username} like each other.</p>
            </div>
          )}
          
          {/* Liked By Badge */}
          {profile.isLikedByUser && !profile.isLiked && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg text-center">
              <Heart className="w-6 h-6 text-blue-500 fill-current mx-auto mb-2" />
              <p className="font-bold text-blue-700">{profile.username} likes you!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
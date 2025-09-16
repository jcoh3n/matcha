import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MapPin, 
  UserX, 
  Flag, 
  MessageCircle, 
  Calendar, 
  Users, 
  Eye,
  Star,
  Clock,
  Briefcase,
  GraduationCap,
  Wine,
  Smile,
  Globe
} from "lucide-react";
import { OnlineStatus } from "@/components/ui/online-status";
import { OrientationBadge } from "@/components/ui/orientation-badge";
import { Tag } from "@/components/ui/tag";
import { getPublicProfile } from "@/services/profileService";
import { useSocialInteractions } from "@/hooks/useSocialInteractions";

interface PublicProfile {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
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
  interests?: string[];
  occupation?: string;
  education?: string;
  drinking?: string;
  smoking?: string;
  children?: string;
  lastConnection?: string;
  viewsCount?: number;
  likedCount?: number;
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
        console.log("Profile data received:", profileData); // Debug log
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

  // Calculate age from birth date
  const calculateAge = (birthDate?: string) => {
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
  
  // Debug log to see what fields are available
  console.log("Profile fields:", Object.keys(profile));
  
  // Calculate age from birth date
  const age = calculateAge(profile.profile?.birthDate);
  
  // Format location
  const locationString = profile.location 
    ? `${profile.location.city || 'Unknown City'}, ${profile.location.country || 'Unknown Country'}`
    : "Location not set";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Photos - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Profile Photo */}
          <div className="surface-solid overflow-hidden rounded-2xl">
            {profilePhoto ? (
              <img
                src={getImageUrl(profilePhoto.url)}
                alt={`${profile.username}'s profile`}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <UserX className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Additional Photos */}
          {otherPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {otherPhotos.slice(0, 6).map((photo) => (
                <img
                  key={photo.id}
                  src={getImageUrl(photo.url)}
                  className="w-full h-24 object-cover rounded-2xl border border-border/40"
                />
              ))}
              {otherPhotos.length > 6 && (
                <div className="relative">
                  <img
                    src={getImageUrl(otherPhotos[6].url)}
                    className="w-full h-24 object-cover rounded-2xl border border-border/40"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{otherPhotos.length - 6}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Profile Stats */}
          <div className="surface p-4 rounded-2xl">
            <h3 className="font-montserrat text-lg font-semibold mb-3">Profile Stats</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Views
                </span>
                <span className="font-medium">{profile.viewsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Likes
                </span>
                <span className="font-medium">{profile.likedCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Fame Rating
                </span>
                <span className="font-medium">{profile.fameRating || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details - Center Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header with Name, Age, Location */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-montserrat text-4xl font-extrabold tracking-tight">
                {profile.firstName && profile.lastName 
                  ? `${profile.firstName} ${profile.lastName}` 
                  : profile.firstName 
                    ? profile.firstName 
                    : profile.lastName 
                      ? profile.lastName 
                      : profile.username || 'User'}
                {age && `, ${age}`}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {locationString}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {profile.profile?.orientation && (
                  <OrientationBadge value={profile.profile.orientation} />
                )}
                <OnlineStatus online={profile.isOnline} lastSeen={profile.lastSeen} />
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {profile.fameRating !== undefined && (
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg">
                  {profile.fameRating}% match
                </div>
              )}
              {profile.distance !== null && (
                <div className="mt-2 text-muted-foreground flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {profile.distance} km away
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <section className="surface p-6 rounded-2xl">
            <h2 className="font-montserrat text-xl font-semibold mb-3 flex items-center">
              <Smile className="w-5 h-5 mr-2" />
              About Me
            </h2>
            <p className="text-sm leading-relaxed">
              {profile.bio || "No bio available"}
            </p>
          </section>

          {/* Personal Information */}
          <section className="surface p-6 rounded-2xl">
            <h2 className="font-montserrat text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.profile?.gender && (
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{profile.profile.gender}</p>
                  </div>
                </div>
              )}
              
              {profile.profile?.birthDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Birth Date</p>
                    <p className="font-medium">
                      {new Date(profile.profile.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {profile.occupation && (
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{profile.occupation}</p>
                  </div>
                </div>
              )}
              
              {profile.education && (
                <div className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Education</p>
                    <p className="font-medium">{profile.education}</p>
                  </div>
                </div>
              )}
              
              {profile.drinking && (
                <div className="flex items-center">
                  <Wine className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Drinking</p>
                    <p className="font-medium capitalize">{profile.drinking}</p>
                  </div>
                </div>
              )}
              
              {profile.profile?.orientation && (
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Orientation</p>
                    <p className="font-medium capitalize">{profile.profile.orientation}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Interests */}
          {profile.tags.length > 0 && (
            <section className="surface p-6 rounded-2xl">
              <h2 className="font-montserrat text-xl font-semibold mb-3">
                Interests & Hobbies
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <Tag key={tag.id} variant="interest" className="text-base px-3 py-1.5">
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
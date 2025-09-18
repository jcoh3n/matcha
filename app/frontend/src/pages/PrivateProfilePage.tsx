import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TagSelector } from "@/components/ui/tag-selector";
import { PhotoUploader } from "@/components/ui/photo-uploader";
import { LocationSelector } from "@/components/ui/location-selector";
import { useProfile } from "@/hooks/useProfile";

export function PrivateProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const accessToken = localStorage.getItem('accessToken');
  
  const {
    profile,
    loading,
    updating,
    fetchProfile,
    updateProfileData,
    addProfilePhoto,
    setAsProfilePhoto,
    removePhoto,
    updateProfileLocation,
    updateUserTags
  } = useProfile(accessToken);

  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<{ id?: number; url: string; isProfile: boolean }[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    method: 'GPS' | 'IP' | 'MANUAL';
  } | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!accessToken) {
      navigate("/auth/login");
    }
  }, [accessToken, navigate]);

  // Load profile data when component mounts or when profile changes
  useEffect(() => {
    if (profile) {
      // Populate form fields with profile data
      setBio(profile.profile?.bio || "");
      setGender(profile.profile?.gender || "");
      setOrientation(profile.profile?.orientation || "");
      setBirthDate(profile.profile?.birthDate ? profile.profile.birthDate.split('T')[0] : "");
      setSelectedTags(profile.tags?.map((tag: any) => tag.name) || []);
      
      // Process photos to handle blob URLs
      const processedPhotos = (profile.photos || []).map(photo => ({
        ...photo,
        url: photo.url.startsWith('blob:') ? 
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face" : 
          photo.url
      }));
      setPhotos(processedPhotos);
      setLocation(profile.location || null);
    }
  }, [profile]);

  // Fetch profile when accessToken changes
  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken, fetchProfile]);

  const handleSaveProfile = async () => {
    if (!bio || !gender || !orientation || !birthDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir toutes les informations de base.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update basic profile information
      const profileResult = await updateProfileData({
        bio,
        gender,
        orientation,
        birthDate
      });

      if (!profileResult.success) {
        throw new Error("Failed to update profile");
      }

      // Update tags
      const tagsResult = await updateUserTags(selectedTags);
      
      if (!tagsResult.success) {
        throw new Error("Failed to update tags");
      }

      // Update location if it exists
      if (location) {
        const locationResult = await updateProfileLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
          method: location.method
        });
        
        if (!locationResult.success) {
          throw new Error("Failed to update location");
        }
      }

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour avec succès."
      });
      
      // Redirect to profile page after successful update
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de votre profil.",
        variant: "destructive"
      });
    }
  };

  const handlePhotosChange = async (newPhotos: { id?: number; url: string; isProfile: boolean }[]) => {
    try {
      // Determine what changed
      const addedPhotos = newPhotos.filter(photo => 
        !photos.find(p => p.url === photo.url)
      );
      
      const removedPhotos = photos.filter(photo => 
        !newPhotos.find(p => p.url === photo.url)
      );
      
      const profilePhotoChanges = newPhotos.filter(photo => 
        photo.isProfile && !photos.find(p => p.id === photo.id && p.isProfile)
      );

      // Handle added photos
      for (const photo of addedPhotos) {
        // Skip blob URLs as they can't be saved to the backend
        if (photo.url.startsWith('blob:')) {
          continue;
        }
        
        const result = await addProfilePhoto({
          url: photo.url,
          isProfile: photo.isProfile
        });
        
        if (result.success && result.data) {
          // Update the photo with its ID from the backend
          photo.id = result.data.id;
        }
      }

      // Handle removed photos
      for (const photo of removedPhotos) {
        if (photo.id) {
          await removePhoto(photo.id);
        }
      }

      // Handle profile photo changes
      for (const photo of profilePhotoChanges) {
        if (photo.id) {
          await setAsProfilePhoto(photo.id);
        }
      }

      setPhotos(newPhotos);
    } catch (error) {
      console.error('Error handling photos:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour des photos.",
        variant: "destructive"
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Modifier votre profil</CardTitle>
            <CardDescription className="text-center">
              Mettez à jour vos informations pour améliorer vos correspondances
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Biographie
                </label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous de vous..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium">
                    Genre
                  </label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="orientation" className="text-sm font-medium">
                    Orientation
                  </label>
                  <Select value={orientation} onValueChange={setOrientation} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Hétérosexuel</SelectItem>
                      <SelectItem value="gay">Homosexuel</SelectItem>
                      <SelectItem value="lesbian">Lesbienne</SelectItem>
                      <SelectItem value="bisexual">Bisexuel</SelectItem>
                      <SelectItem value="pansexual">Pansexuel</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="birthDate" className="text-sm font-medium">
                  Date de naissance
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Centres d'intérêt</h3>
              <p className="text-sm text-muted-foreground">
                Mettez à jour vos centres d'intérêt pour améliorer vos correspondances
              </p>
              <TagSelector 
                selectedTags={selectedTags} 
                onTagsChange={setSelectedTags} 
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Photos</h3>
              <p className="text-sm text-muted-foreground">
                Gérez vos photos. La photo de profil sera celle qui apparaîtra en premier.
              </p>
              <PhotoUploader 
                photos={photos.map(photo => ({
                  ...photo,
                  url: getImageUrl(photo.url)
                }))} 
                onPhotosChange={handlePhotosChange} 
                maxPhotos={5} 
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Localisation</h3>
              <p className="text-sm text-muted-foreground">
                Mettez à jour votre localisation pour trouver des correspondances à proximité
              </p>
              <LocationSelector 
                onLocationChange={setLocation} 
                initialLocation={location || undefined}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
              disabled={updating}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveProfile} 
              disabled={updating}
            >
              {updating ? "Enregistrement en cours..." : "Enregistrer les modifications"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
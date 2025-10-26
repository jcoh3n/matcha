import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getCurrentUserProfile,
  updateProfile,
  addPhoto,
  setProfilePhoto,
  deletePhoto,
  updateLocation,
  getUserTags,
  addUserTags,
  getProfileViewers,
  getProfileLikers
} from "@/services/profileService";

export const useProfile = (accessToken: string | null) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const profileData = await getCurrentUserProfile(accessToken);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [accessToken, fetchProfile]);

  const updateProfileData = async (data: any) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setUpdating(true);
      const updatedProfile = await updateProfile(data, accessToken);
      setProfile({
        ...profile,
        profile: updatedProfile
      });
      return { success: true, data: updatedProfile };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  const addProfilePhoto = async (photoData: { url: string; isProfile?: boolean }) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setUpdating(true);
      const newPhoto = await addPhoto(photoData, accessToken);
      
      // Update profile with new photo
      setProfile({
        ...profile,
        photos: [...(profile?.photos || []), newPhoto]
      });
      
      return { success: true, data: newPhoto };
    } catch (error) {
      console.error("Error adding photo:", error);
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  const setAsProfilePhoto = async (photoId: number) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setUpdating(true);
      const updatedPhoto = await setProfilePhoto(photoId, accessToken);
      
      // Update profile photos - set isProfile flag on selected photo and unset on others
      const updatedPhotos = (profile?.photos || []).map((photo: any) => ({
        ...photo,
        isProfile: photo.id === photoId
      }));
      
      setProfile({
        ...profile,
        photos: updatedPhotos
      });
      
      return { success: true, data: updatedPhoto };
    } catch (error) {
      console.error("Error setting profile photo:", error);
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  const removePhoto = async (photoId: number) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setUpdating(true);
      await deletePhoto(photoId, accessToken);
      
      // Update profile photos - remove the deleted photo
      const updatedPhotos = (profile?.photos || []).filter((photo: any) => photo.id !== photoId);
      
      setProfile({
        ...profile,
        photos: updatedPhotos
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error removing photo:", error);
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  const updateProfileLocation = async (locationData: any) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setUpdating(true);
      const updatedLocation = await updateLocation(locationData, accessToken);
      
      setProfile({
        ...profile,
        location: updatedLocation
      });
      
      return { success: true, data: updatedLocation };
    } catch (error) {
      console.error("Error updating location:", error);
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  const fetchUserTags = async () => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      const tags = await getUserTags(accessToken);
      return { success: true, data: tags };
    } catch (error) {
      console.error("Error fetching user tags:", error);
      return { success: false, error };
    }
  };

  const updateUserTags = async (tags: string[]) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setUpdating(true);
      await addUserTags(tags, accessToken);
      
      // Refresh profile to get updated tags
      await fetchProfile();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating tags:", error);
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  // Get profile viewers
  const getProfileViewersData = async () => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      const viewers = await getProfileViewers(accessToken);
      return { success: true, data: viewers };
    } catch (error) {
      console.error("Error fetching profile viewers:", error);
      return { success: false, error };
    }
  };

  // Get profile likers
  const getProfileLikersData = async () => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      const likers = await getProfileLikers(accessToken);
      return { success: true, data: likers };
    } catch (error) {
      console.error("Error fetching profile likers:", error);
      return { success: false, error };
    }
  };

  return {
    profile,
    loading,
    updating,
    fetchProfile,
    updateProfileData,
    addProfilePhoto,
    setAsProfilePhoto,
    removePhoto,
    updateProfileLocation,
    fetchUserTags,
    updateUserTags,
    getProfileViewersData,
    getProfileLikersData
  };
};
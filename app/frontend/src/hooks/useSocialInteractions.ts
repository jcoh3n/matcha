import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  likeUser, 
  unlikeUser, 
  blockUser, 
  unblockUser, 
  reportUser 
} from "@/services/profileService";

export const useSocialInteractions = (accessToken: string | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const likeProfile = async (userId: number) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setLoading(true);
      const result = await likeUser(userId, accessToken);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error liking user:", error);
      toast({
        title: "Error",
        description: "Failed to like user",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const unlikeProfile = async (userId: number) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setLoading(true);
      const result = await unlikeUser(userId, accessToken);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error unliking user:", error);
      toast({
        title: "Error",
        description: "Failed to unlike user",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (userId: number, isLiked: boolean) => {
    return isLiked ? unlikeProfile(userId) : likeProfile(userId);
  };

  const blockProfile = async (userId: number) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setLoading(true);
      const result = await blockUser(userId, accessToken);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const unblockProfile = async (userId: number) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setLoading(true);
      const result = await unblockUser(userId, accessToken);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId: number, isBlocked: boolean) => {
    return isBlocked ? unblockProfile(userId) : blockProfile(userId);
  };

  const reportProfile = async (userId: number, reason: string) => {
    if (!accessToken) return { success: false, error: "No access token" };
    
    try {
      setLoading(true);
      const result = await reportUser(userId, reason, accessToken);
      toast({
        title: "Reported",
        description: "User has been reported successfully",
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Error reporting user:", error);
      toast({
        title: "Error",
        description: "Failed to report user",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    likeProfile,
    unlikeProfile,
    toggleLike,
    blockProfile,
    unblockProfile,
    toggleBlock,
    reportProfile,
  };
};
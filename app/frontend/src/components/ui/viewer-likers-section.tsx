import { useState, useEffect } from 'react';
import { Heart, Eye, Calendar, MapPin, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnlineStatus } from '@/components/ui/online-status';
import { getProfileViewers, getProfileLikers } from '@/services/profileService';
import { useNavigate } from 'react-router-dom';

interface ViewerLiker {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  bio?: string;
  photos: Array<{
    id: number;
    url: string;
    isProfile: boolean;
  }>;
  fameRating?: number;
  distance?: number;
  location?: {
    city?: string;
    country?: string;
  };
  isOnline: boolean;
  lastSeen?: string;
  isLiked?: boolean;
  isLikedByUser?: boolean;
  isMatch?: boolean;
  viewedAt?: string;
  likedAt?: string;
}

interface ViewerLikersSectionProps {
  accessToken: string;
}

export function ViewerLikersSection({ accessToken }: ViewerLikersSectionProps) {
  const [viewers, setViewers] = useState<ViewerLiker[]>([]);
  const [likers, setLikers] = useState<ViewerLiker[]>([]);
  const [activeTab, setActiveTab] = useState<'viewers' | 'likers'>('viewers');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchViewersAndLikers();
  }, [accessToken]);

  const fetchViewersAndLikers = async () => {
    try {
      setLoading(true);
      const [viewersData, likersData] = await Promise.all([
        getProfileViewers(accessToken),
        getProfileLikers(accessToken)
      ]);

      setViewers(viewersData);
      setLikers(likersData);
    } catch (error) {
      console.error('Error fetching viewers and likers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePhoto = (photos: ViewerLiker['photos']) => {
    const profilePhoto = photos?.find(photo => photo.isProfile) || photos?.[0];
    return profilePhoto ? profilePhoto.url : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Who viewed / liked me</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const activeData = activeTab === 'viewers' ? viewers : likers;
  const emptyMessage = activeTab === 'viewers' 
    ? "Aucun utilisateur n'a consulté votre profil récemment." 
    : "Aucun utilisateur ne vous a liké récemment.";

  return (
    <Card className="w-full border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span>Who viewed / liked me</span>
          <Badge variant="secondary" className="text-xs">
            {activeTab === 'viewers' ? `${viewers.length} vues` : `${likers.length} likes`}
          </Badge>
        </CardTitle>
        
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'viewers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('viewers')}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Vus ({viewers.length})
          </Button>
          <Button
            variant={activeTab === 'likers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('likers')}
            className="flex items-center gap-1"
          >
            <Heart className="w-4 h-4" />
            Likés ({likers.length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {activeData.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {activeData.slice(0, 5).map((person) => (
              <div 
                key={person.id} 
                className="flex items-center gap-4 p-3 rounded-xl border border-border/40 hover:bg-accent transition-colors cursor-pointer"
                onClick={() => handleViewProfile(person.id)}
              >
                <img
                  src={getProfilePhoto(person.photos)}
                  alt={person.username}
                  className="w-14 h-14 rounded-full object-cover border border-border"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">
                      {person.username}
                      {person.age && `, ${person.age}`}
                    </h3>
                    <OnlineStatus online={person.isOnline} lastSeen={person.lastSeen} size="sm" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {person.location?.city ? `${person.location.city}, ` : ''}
                    {person.location?.country || ''}
                    {person.distance ? ` • ${person.distance} km` : ''}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {person.isMatch && (
                      <Badge variant="secondary" className="text-xs">
                        Match
                      </Badge>
                    )}
                    {person.isLikedByUser && !person.isMatch && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                        Vous a liké
                      </Badge>
                    )}
                    {person.viewedAt && activeTab === 'viewers' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Vu {formatDate(person.viewedAt)}
                      </div>
                    )}
                    {person.likedAt && activeTab === 'likers' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Liké {formatDate(person.likedAt)}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
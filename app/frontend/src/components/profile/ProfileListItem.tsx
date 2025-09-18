import { Heart, MapPin } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { useNavigate } from "react-router-dom";

interface ProfileListItemProps {
  id: number;
  name: string;
  age: number;
  location: string;
  interests: string[];
  matchPercentage: number;
  isOnline: boolean;
  imageUrl: string;
}

export function ProfileListItem({
  id,
  name,
  age,
  location,
  interests,
  matchPercentage,
  isOnline,
  imageUrl,
}: ProfileListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profiles/${id}`);
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

  return (
    <div 
      className="card interactive-card"
      onClick={handleClick}
    >
      <div className="relative">
        <img 
          src={getImageUrl(imageUrl)} 
          alt={name} 
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-3 right-3">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
          <Heart className="w-4 h-4 text-primary fill-current mr-1" />
          <span className="text-sm font-bold text-primary">{matchPercentage}%</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">
            {name}, {age}
          </h3>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {interests.slice(0, 3).map((interest, index) => (
            <Tag key={index} variant="interest" className="text-xs px-2 py-0.5">
              {interest}
            </Tag>
          ))}
          {interests.length > 3 && (
            <Tag variant="default" className="text-xs px-2 py-0.5">
              +{interests.length - 3}
            </Tag>
          )}
        </div>
      </div>
    </div>
  );
}
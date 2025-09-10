import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Star } from "lucide-react"
import { BrutalButton } from "./brutal-button"

interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    id: string
    name: string
    age: number
    images: string[]
    bio?: string
    location: string
    distance?: number
    tags: string[]
    fame: number
    isOnline?: boolean
  }
  onLike?: (userId: string) => void
  onPass?: (userId: string) => void
  variant?: "discovery" | "grid" | "compact"
}

const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ className, user, onLike, onPass, variant = "discovery", ...props }, ref) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

    const handleLike = () => onLike?.(user.id)
    const handlePass = () => onPass?.(user.id)

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % user.images.length)
    }

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + user.images.length) % user.images.length)
    }

    if (variant === "compact") {
      return (
        <Card ref={ref} className={cn("interactive-card rounded-3xl overflow-hidden", className)} {...props}>
          <div className="relative h-32">
            <img
              src={user.images[0]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            {user.isOnline && (
              <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{user.name}, {user.age}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {user.distance}km away
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-xs font-medium">{user.fame}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card 
        ref={ref} 
        className={cn(
          "interactive-card overflow-hidden animate-scale-in",
          variant === "grid" ? "rounded-3xl" : "rounded-3xl max-w-sm mx-auto",
          className
        )} 
        {...props}
      >
        <div className="relative">
          <div 
            className={cn(
              "relative overflow-hidden",
              variant === "grid" ? "h-64" : "h-96"
            )}
          >
            <img
              src={user.images[currentImageIndex]}
              alt={`${user.name} photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-smooth"
            />
            
            {/* Navigation dots */}
            {user.images.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                {user.images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-smooth",
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Image navigation */}
            {user.images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-smooth"
                  onClick={prevImage}
                >
                  ←
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-smooth"
                  onClick={nextImage}
                >
                  →
                </button>
              </>
            )}

            {/* Online indicator */}
            {user.isOnline && (
              <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Profile info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-display text-2xl font-bold mb-1">
                  {user.name}, {user.age}
                </h2>
                <p className="text-sm text-white/90 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4" />
                  {user.distance ? `${user.distance}km away` : user.location}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{user.fame}</span>
              </div>
            </div>

            {user.bio && (
              <p className="text-sm text-white/90 mb-3 line-clamp-2">{user.bio}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {user.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-0 rounded-full text-xs">
                  {tag}
                </Badge>
              ))}
              {user.tags.length > 3 && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0 rounded-full text-xs">
                  +{user.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons - only for discovery variant */}
        {variant === "discovery" && onLike && onPass && (
          <CardContent className="p-6">
            <div className="flex gap-4 justify-center">
              <BrutalButton 
                variant="outline" 
                size="lg" 
                onClick={handlePass}
                className="flex-1 max-w-32"
              >
                Pass
              </BrutalButton>
              <BrutalButton 
                variant="hero" 
                size="lg" 
                onClick={handleLike}
                className="flex-1 max-w-32"
              >
                <Heart className="w-5 h-5" />
                Like
              </BrutalButton>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }
)
ProfileCard.displayName = "ProfileCard"

export { ProfileCard }
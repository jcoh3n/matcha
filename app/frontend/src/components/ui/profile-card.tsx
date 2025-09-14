import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, X } from "lucide-react";

interface ProfileCardUser {
  id: string;
  name: string;
  age: number;
  images: string[];
  location: string;
  distance?: number;
  bio?: string; // kept for other variants
  tags?: string[]; // kept for other variants
  isOnline?: boolean;
}

interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  user: ProfileCardUser;
  onLike?: (userId: string) => void;
  onPass?: (userId: string) => void;
  variant?: "discovery" | "grid" | "compact";
}

const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  (
    { className, user, onLike, onPass, variant = "discovery", ...props },
    ref
  ) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    const handleLike = () => onLike?.(user.id);
    const handlePass = () => onPass?.(user.id);
    const goTo = (i: number) => setCurrentImageIndex(i);
    const nextImage = () => goTo((currentImageIndex + 1) % user.images.length);
    const prevImage = () =>
      goTo((currentImageIndex - 1 + user.images.length) % user.images.length);

    // Discovery (split) variant
    if (variant === "discovery") {
      return (
        <Card
          ref={ref}
          className={cn(
            "rounded-3xl max-w-4xl mx-auto bg-white shadow-soft animate-scale-in overflow-hidden",
            className
          )}
          {...props}
        >
          <div className="flex flex-col md:flex-row h-[480px] md:h-[520px]">
            {/* Left: Photo (50%) */}
            <div className="relative w-full md:w-1/2 h-1/2 md:h-full">
              <img
                src={user.images[0]}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Right: Minimal info (50%) */}
            <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-12 font-montserrat bg-white">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
                {user.name}, {user.age}
              </h2>
              <p className="mt-6 flex items-center gap-2 text-sm md:text-base text-neutral-600 font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                {user.distance ? `${user.distance} km away` : user.location}
              </p>
              {(onLike || onPass) && (
                <div className="mt-10 flex items-center gap-8">
                  {onPass && (
                    <button
                      onClick={handlePass}
                      className="w-16 h-16 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 shadow-sm flex items-center justify-center transition active:scale-95"
                      aria-label="Pass"
                    >
                      <X className="w-7 h-7" />
                    </button>
                  )}
                  {onLike && (
                    <button
                      onClick={handleLike}
                      className="w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg flex items-center justify-center transition active:scale-95"
                      aria-label="Like"
                    >
                      <Heart className="w-8 h-8" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }

    // Compact variant: tiny version
    if (variant === "compact") {
      return (
        <Card
          ref={ref}
          className={cn("rounded-3xl overflow-hidden w-56", className)}
          {...props}
        >
          <div className="relative h-32">
            <img
              src={user.images[0]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 font-montserrat">
            <h3 className="font-semibold text-sm">
              {user.name}, {user.age}
            </h3>
            <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {user.distance ? `${user.distance} km` : user.location}
            </p>
          </div>
        </Card>
      );
    }

    // Grid variant (gallery style)
    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-3xl overflow-hidden interactive-card",
          className,
          "h-72 relative"
        )}
        {...props}
      >
        <img
          src={user.images[currentImageIndex]}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        {user.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {user.images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "w-2 h-2 rounded-full",
                  i === currentImageIndex ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white font-montserrat">
          <h3 className="text-lg font-semibold">
            {user.name}, {user.age}
          </h3>
          <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {user.distance ? `${user.distance} km` : user.location}
          </p>
        </div>
      </Card>
    );
  }
);
ProfileCard.displayName = "ProfileCard";

export { ProfileCard };

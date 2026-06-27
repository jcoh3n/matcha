import { X, Heart } from "lucide-react";

interface MatchButtonsProps {
  onPass: () => void;
  onSmash: () => void;
}

export function MatchButtons({ onPass, onSmash }: MatchButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        className="w-14 h-14 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary-muted shadow-soft flex items-center justify-center transition-smooth active:scale-95"
        onClick={onPass}
        aria-label="Pass"
      >
        <X className="w-7 h-7" />
      </button>
      <button
        className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-soft hover:shadow-card flex items-center justify-center transition-smooth active:scale-95"
        onClick={onSmash}
        aria-label="Like"
      >
        <Heart className="w-7 h-7 fill-current" />
      </button>
    </div>
  );
}

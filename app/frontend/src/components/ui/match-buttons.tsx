import { X, Heart } from "lucide-react";

interface MatchButtonsProps {
  onPass: () => void;
  onSmash: () => void;
}

export function MatchButtons({ onPass, onSmash }: MatchButtonsProps) {
  return (
    <div className="match-buttons">
      <button 
        className="match-btn btn-pass" 
        onClick={onPass}
        aria-label="Passer"
      >
        <X className="w-8 h-8" />
      </button>
      <button 
        className="match-btn btn-smash" 
        onClick={onSmash}
        aria-label="Aimer"
      >
        <Heart className="w-8 h-8 fill-current" />
      </button>
    </div>
  );
}
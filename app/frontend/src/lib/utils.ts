import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fame rating is stored on a 0-1000 scale in the backend. Present it to users
// as a 0-100 score so the value (and the filter sliders) are intuitive.
export const FAME_MAX = 1000;
export const FAME_SCORE_MAX = 100;

export function fameScore(raw?: number | null): number {
  if (!raw || raw < 0) return 0;
  return Math.round(Math.min(raw, FAME_MAX) / (FAME_MAX / FAME_SCORE_MAX));
}

// Convert a 0-100 UI score back to the raw 0-1000 scale for backend filtering.
export function fameScoreToRaw(score?: number | null): number {
  if (!score || score < 0) return 0;
  return Math.round(Math.min(score, FAME_SCORE_MAX) * (FAME_MAX / FAME_SCORE_MAX));
}

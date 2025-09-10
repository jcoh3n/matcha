import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface FameRatingProps {
  value: number // 0 - 100
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FameRating({ value, className, size = 'md' }: FameRatingProps) {
  const stars = 5
  const percentage = Math.min(Math.max(value, 0), 100)
  const filledStars = Math.round((percentage / 100) * stars)
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={cn("flex items-center gap-1", className)} title={`Fame rating: ${percentage}%`}>
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className={cn(sizes[size], i < filledStars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40')} />
      ))}
      <span className="text-xs font-medium text-muted-foreground ml-1">{percentage}%</span>
    </div>
  )
}

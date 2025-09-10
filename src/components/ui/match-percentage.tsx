import { cn } from "@/lib/utils"

interface MatchPercentageProps {
  value: number // 0-100
  compact?: boolean
  className?: string
}

export function MatchPercentage({ value, compact, className }: MatchPercentageProps) {
  const pct = Math.min(Math.max(value, 0), 100)
  const size = compact ? 40 : 56
  const radius = 54
  const circumference = Math.PI * 2 * radius
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} title={`Match: ${pct}%`}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="rotate-[-90deg]">
        <circle cx="60" cy="60" r={radius} stroke="hsl(var(--muted))" strokeWidth="12" fill="none" className="opacity-30" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold rotate-[90deg] text-foreground">{pct}%</span>
    </div>
  )
}

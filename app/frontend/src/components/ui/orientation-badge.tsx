import { Badge } from "@/components/ui/badge"

type KnownOrientation = 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'pansexual'

interface OrientationBadgeProps {
  value: string
}

const labels: Record<KnownOrientation, string> = {
  straight: 'Hetero',
  gay: 'Gay',
  lesbian: 'Lesbian',
  bisexual: 'Bi',
  pansexual: 'Pan'
}

const colors: Record<KnownOrientation, string> = {
  straight: 'bg-primary text-primary-foreground',
  gay: 'bg-accent text-accent-foreground',
  lesbian: 'bg-secondary text-secondary-foreground',
  bisexual: 'bg-muted text-foreground',
  pansexual: 'bg-card text-foreground border'
}

// Normalize backend variants (e.g. "hetero", "bi") to the known set.
function normalize(value: string): KnownOrientation | null {
  const v = value.toLowerCase()
  if (v === 'hetero' || v === 'heterosexual' || v === 'straight') return 'straight'
  if (v === 'gay' || v === 'homosexual') return 'gay'
  if (v === 'lesbian') return 'lesbian'
  if (v === 'bi' || v === 'bisexual') return 'bisexual'
  if (v === 'pan' || v === 'pansexual') return 'pansexual'
  return null
}

export function OrientationBadge({ value }: OrientationBadgeProps) {
  const key = normalize(value)
  const color = key ? colors[key] : 'bg-muted text-foreground'
  const label = key ? labels[key] : value

  return (
    <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border-0 ${color}`}>{label}</Badge>
  )
}

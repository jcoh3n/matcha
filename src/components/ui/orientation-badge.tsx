import { Badge } from "@/components/ui/badge"

interface OrientationBadgeProps {
  value: 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'pansexual'
}

const labels: Record<OrientationBadgeProps['value'], string> = {
  straight: 'Hetero',
  gay: 'Gay',
  lesbian: 'Lesbian',
  bisexual: 'Bi',
  pansexual: 'Pan'
}

export function OrientationBadge({ value }: OrientationBadgeProps) {
  const color = {
    straight: 'bg-primary text-primary-foreground',
    gay: 'bg-accent text-accent-foreground',
    lesbian: 'bg-secondary text-secondary-foreground',
    bisexual: 'bg-muted text-foreground',
    pansexual: 'bg-card text-foreground border'
  }[value]

  return (
    <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border-0 ${color}`}>{labels[value]}</Badge>
  )
}

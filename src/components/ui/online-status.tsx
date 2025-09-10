import { cn } from "@/lib/utils"

interface OnlineStatusProps {
  online?: boolean
  lastSeen?: string // ISO string
  className?: string
}

export function OnlineStatus({ online, lastSeen, className }: OnlineStatusProps) {
  const label = online ? 'Online' : lastSeen ? `Last seen ${relativeTime(lastSeen)}` : 'Offline'
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className={cn("w-2.5 h-2.5 rounded-full", online ? 'bg-green-500 animate-pulse' : 'bg-muted')} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

function relativeTime(dateIso: string) {
  const diff = Date.now() - new Date(dateIso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Eye, MessageCircle, UserMinus } from "lucide-react"

export interface NotificationItem {
  id: string
  type: 'like' | 'match' | 'unlike' | 'view' | 'message'
  user: string
  createdAt: string
  read?: boolean
}

interface NotificationCenterProps {
  items: NotificationItem[]
  onMarkAll?: () => void
}

export function NotificationCenter({ items, onMarkAll }: NotificationCenterProps) {
  const icons = {
    like: Heart,
    match: Heart,
    unlike: UserMinus,
    view: Eye,
    message: MessageCircle
  }
  const labels: Record<NotificationItem['type'], string> = {
    like: 'liked you',
    match: "it's a match!",
    unlike: 'removed their like',
    view: 'viewed your profile',
    message: 'sent you a message'
  }

  return (
    <Card className="rounded-3xl card-shadow border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl">Notifications</CardTitle>
        <button onClick={onMarkAll} className="text-xs text-muted-foreground hover:text-foreground transition-smooth">Mark all read</button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">No notifications</div>
        )}
        {items.map(n => {
          const Icon = icons[n.type]
          return (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-smooth">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary text-primary-foreground brutal-shadow">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm"><span className="font-semibold">{n.user}</span> {labels[n.type]}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <Badge variant="destructive" className="text-[10px] px-2 py-0 rounded-full">NEW</Badge>}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function timeAgo(dateIso: string) {
  const diff = Date.now() - new Date(dateIso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return mins + 'm'
  const hrs = Math.floor(mins/60)
  if (hrs < 24) return hrs + 'h'
  const days = Math.floor(hrs/24)
  return days + 'd'
}

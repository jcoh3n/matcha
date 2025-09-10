import { useEffect, useRef, useState } from "react"
import { BrutalButton } from "@/components/ui/brutal-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface ChatMessage {
  id: string
  from: string
  to: string
  body: string
  createdAt: string
  pending?: boolean
}

interface ChatProps {
  selfId: string
  peerId: string
  initialMessages?: ChatMessage[]
  onSend?: (body: string) => Promise<void> | void
}

// Simulated realtime via interval (10s) – placeholder for WebSocket
export function Chat({ selfId, peerId, initialMessages = [], onSend }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      // Fake incoming message
      setMessages(prev => ([...prev, {
        id: crypto.randomUUID(),
        from: peerId,
        to: selfId,
        body: randomReply(),
        createdAt: new Date().toISOString()
      }]))
    }, 10000) // 10s
    return () => clearInterval(id)
  }, [peerId, selfId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      from: selfId,
      to: peerId,
      body: input.trim(),
      createdAt: new Date().toISOString(),
      pending: true
    }
    setMessages(m => [...m, optimistic])
    setInput("")
    try {
      await onSend?.(optimistic.body)
    } finally {
      setMessages(m => m.map(msg => msg.id === optimistic.id ? { ...msg, pending: false } : msg))
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-card card-shadow">
        {messages.map(m => {
          const mine = m.from === selfId
          return (
            <div key={m.id} className={cn("max-w-xs rounded-2xl px-4 py-2 text-sm shadow-sm", mine ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted/60 backdrop-blur')}> 
              <p>{m.body}</p>
              <div className="mt-1 text-[10px] opacity-70 flex justify-end gap-1">
                <span>{formatTime(m.createdAt)}</span>
                {m.pending && <span>…</span>}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={(e)=>{e.preventDefault();handleSend();}} className="mt-4 flex gap-2">
        <Input value={input} onChange={e=>setInput(e.target.value)} placeholder="Message" className="rounded-2xl h-12" />
        <BrutalButton type="submit" variant="hero" className="h-12 px-6">Send</BrutalButton>
      </form>
    </div>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function randomReply() {
  const replies = [
    '🙂',
    'Tell me more! ☕',
    'Nice! 💬',
    'Sounds great 🌿',
    '👍',
  ]
  return replies[Math.floor(Math.random()*replies.length)]
}

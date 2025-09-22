import { useEffect, useRef, useState } from "react"
import { BrutalButton } from "@/components/ui/brutal-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

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

export function Chat({ selfId, peerId, initialMessages = [], onSend }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Get token from localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")
    setToken(accessToken)
    
    // Load conversation history
    if (accessToken) {
      loadConversation(accessToken)
    }
  }, [peerId])

  const loadConversation = async (accessToken: string) => {
    try {
      const response = await api.getConversation(accessToken, parseInt(peerId))
      if (response.ok) {
        const conversation = await response.json()
        const formattedMessages = conversation.map((msg: any) => ({
          id: msg.id.toString(),
          from: msg.senderId.toString(),
          to: msg.receiverId.toString(),
          body: msg.content,
          createdAt: msg.createdAt
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !token) return
    
    const optimistic: ChatMessage = {
      id: Date.now().toString(),
      from: selfId,
      to: peerId,
      body: input.trim(),
      createdAt: new Date().toISOString(),
      pending: true
    }
    
    setMessages(m => [...m, optimistic])
    setInput("")
    
    try {
      const response = await api.sendMessage(token, {
        receiverId: parseInt(peerId),
        content: input.trim()
      })
      
      if (response.ok) {
        const savedMessage = await response.json()
        // Replace optimistic message with saved message
        setMessages(m => m.map(msg => 
          msg.id === optimistic.id 
            ? { ...msg, id: savedMessage.id.toString(), pending: false } 
            : msg
        ))
      } else {
        // Remove optimistic message on error
        setMessages(m => m.filter(msg => msg.id !== optimistic.id))
        console.error("Failed to send message")
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(m => m.filter(msg => msg.id !== optimistic.id))
      console.error("Error sending message:", error)
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

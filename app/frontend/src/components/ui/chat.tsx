import { useEffect, useRef, useState } from "react"
import { BrutalButton } from "@/components/ui/brutal-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import io from 'socket.io-client'

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
  const socketRef = useRef<any>(null)

  // Get token from localStorage and setup WebSocket connection
  useEffect(() => {
    console.log('[DEBUG Frontend] Chat component mounted for peerId:', peerId, 'selfId:', selfId);
    const accessToken = localStorage.getItem("accessToken")
    setToken(accessToken)
    
    // Load conversation history
    if (accessToken) {
      console.log('[DEBUG Frontend] Loading conversation history for peerId:', peerId);
      loadConversation(accessToken)
    } else {
      console.error('[DEBUG Frontend] No access token found');
    }
    
    // Initialize WebSocket connection
    console.log('[DEBUG Frontend] Initializing WebSocket connection to:', import.meta.env.VITE_API_URL || 'http://localhost:3000');
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
    
    socketRef.current = socket;
    
    // Authenticate the socket connection with the user ID
    if (selfId) {
      console.log('[DEBUG Frontend] Authenticating socket with userId:', selfId);
      socket.emit('authenticate', { userId: selfId });
    }
    
    // Create a stable handler function to avoid recreating on each render
    const handleMessage = (data) => {
      console.log('[DEBUG Frontend] Received WebSocket message:', data);
      // Convert IDs to strings for consistent comparison
      const receiverIdStr = String(data.receiverId);
      const senderIdStr = String(data.senderId);
      const selfIdStr = String(selfId);
      const peerIdStr = String(peerId);
      
      console.log('[DEBUG Frontend] ID comparison - receiverId:', receiverIdStr, '=== selfId:', selfIdStr, 'is', receiverIdStr === selfIdStr);
      console.log('[DEBUG Frontend] ID comparison - senderId:', senderIdStr, '=== peerId:', peerIdStr, 'is', senderIdStr === peerIdStr);
      
      // Only add the message if it's for our current chat (to us from our peer)
      if (receiverIdStr === selfIdStr && senderIdStr === peerIdStr) {
        console.log('[DEBUG Frontend] Adding message from peer to chat:', data.senderId);
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(msg => 
            msg.body === data.content && 
            msg.from === senderIdStr && 
            msg.createdAt === (data.timestamp || new Date().toISOString())
          );
          
          if (messageExists) {
            console.log('[DEBUG Frontend] Message already exists, skipping');
            return prev;
          }
          
          const newMessage: ChatMessage = {
            id: Date.now().toString(), // Generate a temporary ID
            from: senderIdStr,
            to: receiverIdStr,
            body: data.content,
            createdAt: data.timestamp || new Date().toISOString()
          };
          
          console.log('[DEBUG Frontend] Adding new message to messages state');
          return [...prev, newMessage];
        });
      } else {
        console.log('[DEBUG Frontend] Message not for current peer, ignoring. Expected receiver:', selfIdStr, 'sender:', peerIdStr, 'Got receiver:', receiverIdStr, 'sender:', senderIdStr);
      }
    };
    
    // Listen for incoming messages
    socket.on('message', handleMessage);
    
    socket.on('connect', () => {
      console.log('[DEBUG Frontend] WebSocket connected with id:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('[DEBUG Frontend] WebSocket disconnected');
    });
    
    // Cleanup function - remove listeners before disconnecting
    return () => {
      console.log('[DEBUG Frontend] Cleaning up WebSocket listeners and disconnecting');
      socket.off('message', handleMessage);
      socket.disconnect();
    };
  }, [selfId, peerId])

  const loadConversation = async (accessToken: string) => {
    console.log('[DEBUG Frontend] Loading conversation with peerId:', peerId);
    try {
      // Use the updated API call that handles authentication automatically
      const response = await api.getConversation(parseInt(peerId))
      console.log('[DEBUG Frontend] getConversation API response:', response.status, response.ok);
      
      if (response.ok) {
        const conversation = await response.json()
        console.log('[DEBUG Frontend] Loaded', conversation.length, 'messages from API');
        const formattedMessages = conversation.map((msg: any) => ({
          id: msg.id.toString(),
          from: msg.senderId.toString(),
          to: msg.receiverId.toString(),
          body: msg.content,
          createdAt: msg.createdAt
        }))
        console.log('[DEBUG Frontend] Setting formatted messages:', formattedMessages.length);
        setMessages(formattedMessages)
      } else {
        console.error('[DEBUG Frontend] Failed to load conversation, response:', await response.text());
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !token) {
      console.log('[DEBUG Frontend] Cannot send message - missing input or token:', { input: input.trim(), hasToken: !!token });
      return;
    }
    
    console.log('[DEBUG Frontend] Sending message:', { content: input.trim(), to: peerId, from: selfId });
    
    const optimistic: ChatMessage = {
      id: Date.now().toString(),
      from: selfId,
      to: peerId,
      body: input.trim(),
      createdAt: new Date().toISOString(),
      pending: true
    }
    
    console.log('[DEBUG Frontend] Adding optimistic message:', optimistic);
    setMessages(m => [...m, optimistic])
    setInput("")
    
    try {
      const response = await api.sendMessage({
        receiverId: parseInt(peerId),
        content: input.trim()
      })
      
      console.log('[DEBUG Frontend] sendMessage API response:', response.status, response.ok);
      
      if (response.ok) {
        const savedMessage = await response.json()
        console.log('[DEBUG Frontend] Message saved successfully:', savedMessage);
        // Replace optimistic message with saved message
        setMessages(m => m.map(msg => 
          msg.id === optimistic.id 
            ? { ...msg, id: savedMessage.id.toString(), pending: false } 
            : msg
        ))
      } else {
        // Remove optimistic message on error
        setMessages(m => m.filter(msg => msg.id !== optimistic.id))
        console.error("Failed to send message, response:", await response.text())
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(m => m.filter(msg => msg.id !== optimistic.id))
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] max-h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-card card-shadow max-h-[70%]">
        {messages.map(m => {
          const mine = String(m.from) === String(selfId)
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
      <form onSubmit={(e)=>{e.preventDefault();handleSend();}} className="mt-auto pt-4 flex gap-2">
        <Input value={input} onChange={e=>setInput(e.target.value)} placeholder="Message" className="rounded-2xl h-12 flex-1" />
        <BrutalButton type="submit" variant="hero" className="h-12 px-6">Send</BrutalButton>
      </form>
    </div>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

import { useState } from 'react'
import { Chat, ChatMessage } from '@/components/ui/chat'
import { getRandomProfiles } from '@/data/mockProfiles'

export function MessagesPage() {
  const peers = getRandomProfiles(4)
  const [activePeer, setActivePeer] = useState(peers[0])
  const [history] = useState<Record<string, ChatMessage[]>>({})

  return (
    <div className="grid md:grid-cols-4 gap-8">
      <aside className="md:col-span-1 space-y-3">
        <h2 className="font-display text-xl font-bold mb-2">Chats</h2>
        {peers.map(p => (
          <button key={p.id} onClick={()=>setActivePeer(p)} className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-smooth ${activePeer.id===p.id ? 'bg-primary text-primary-foreground' : 'bg-card/70 hover:bg-card card-shadow'}`}>
            <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-xl" />
            <div>
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-[10px] opacity-70">{Math.round(Math.random()*10+1)} new</p>
            </div>
          </button>
        ))}
      </aside>
      <section className="md:col-span-3 min-h-[60vh]">
        <h1 className="font-display text-2xl font-bold mb-4">Chat with {activePeer.name}</h1>
        <Chat selfId="self" peerId={activePeer.id} initialMessages={history[activePeer.id] || []} />
      </section>
    </div>
  )
}

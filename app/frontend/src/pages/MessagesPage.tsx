import { useState, useEffect } from "react";
import { Chat, ChatMessage } from "@/components/ui/chat";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  profile: {
    birthDate?: string;
    gender?: string;
    orientation?: string;
    bio?: string;
    fameRating?: number;
  };
  location?: {
    city?: string;
    country?: string;
  };
}

// Transform API user data to match chat expectations
const transformUserForChat = (user: UserProfile) => {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    images: user.profilePhotoUrl ? [user.profilePhotoUrl] : [],
    bio: user.profile?.bio || "",
    location: user.location ? `${user.location.city}, ${user.location.country}` : "",
    // Add other properties as needed
  };
};

export function MessagesPage() {
  const [peers, setPeers] = useState<any[]>([]);
  const [activePeer, setActivePeer] = useState<any>(null);
  const [history, setHistory] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch chat peers
  const fetchChatPeers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      //for now uses matches users as chat peers

      const response = await api.get
      
      if (response.ok) {
        const users: UserProfile[] = await response.json();
        const transformedUsers = users.map(transformUserForChat);
        setPeers(transformedUsers);
        if (transformedUsers.length > 0) {
          setActivePeer(transformedUsers[0]);
        }
      } else {
        console.error("Failed to fetch chat peers");
      }
    } catch (error) {
      console.error("Error fetching chat peers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial chat peers
  useEffect(() => {
    fetchChatPeers();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading chats...</div>;
  }

  return (
    <div className="grid md:grid-cols-4 gap-8">
      <aside className="md:col-span-1 space-y-3">
        <h2 className="font-montserrat text-xl font-semibold mb-2">Chats</h2>
        {peers.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePeer(p)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-smooth ${
              activePeer && activePeer.id === p.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "surface hover:bg-card/80"
            }`}
          >
            <img
              src={p.images[0] || "https://randomuser.me/api/portraits/women/4.jpg"}
              alt={p.name}
              className="w-10 h-10 object-cover rounded-xl"
            />
            <div>
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-[10px] opacity-70">
                {Math.round(Math.random() * 10 + 1)} new
              </p>
            </div>
          </button>
        ))}
      </aside>
      <section className="md:col-span-3 min-h-[60vh]">
        {activePeer ? (
          <>
            <h1 className="font-montserrat text-2xl font-bold tracking-tight mb-4">
              Chat with {activePeer.name}
            </h1>
            <Chat
              selfId="self"
              peerId={activePeer.id}
              initialMessages={history[activePeer.id] || []}
            />
          </>
        ) : (
          <div className="text-center py-8">Select a chat to start messaging</div>
        )}
      </section>
    </div>
  );
}

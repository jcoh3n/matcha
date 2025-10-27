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
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: string;
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
    lastMessage: user.lastMessage, // Include last message info if available
    // Add other properties as needed
  };
};

export function MessagesPage() {
  const [peers, setPeers] = useState<any[]>([]);
  const [activePeer, setActivePeer] = useState<any>(null);
  const [history, setHistory] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(false);
  const [selfId, setSelfId] = useState<string>("");

  // Fetch current user info and chat peers
  const fetchUserData = async () => {
    console.log('[DEBUG Frontend] fetchUserData called');
    setLoading(true);
    try {
      // Get current user info to get the user ID
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      console.log('[DEBUG Frontend] Getting current user info');
      // Get current user to get the ID
      const userResponse = await api.getCurrentUser();
      console.log('[DEBUG Frontend] getCurrentUser response:', userResponse.status, userResponse.ok);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('[DEBUG Frontend] Current user data:', userData.id);
        setSelfId(userData.id.toString()); // Set the current user ID as string to match message format
      } else {
        console.error("Failed to fetch current user");
        return;
      }

      // Use conversations endpoint to get users we can chat with (mutual matches)
      console.log('[DEBUG Frontend] Fetching conversations');
      const response = await api.getConversations();
      console.log('[DEBUG Frontend] getConversations response:', response.status, response.ok); 
      
      if (response.ok) {
        const conversations = await response.json();
        console.log('[DEBUG Frontend] Received', conversations.length, 'conversations from API');
        
        // Transform conversations to match the expected format for the UI
        const formattedConversations = conversations.map(conv => ({
          id: conv.id,
          name: `${conv.firstName} ${conv.lastName}`,
          images: conv.profilePhotoUrl ? [conv.profilePhotoUrl] : [],
          bio: conv.profile?.bio || "",
          location: conv.location ? `${conv.location.city}, ${conv.location.country}` : "",
          lastMessage: conv.lastMessage
        }));
        
        console.log('[DEBUG Frontend] Setting', formattedConversations.length, 'formatted conversations as peers');
        setPeers(formattedConversations);
        if (formattedConversations.length > 0) {
          console.log('[DEBUG Frontend] Setting first peer as active:', formattedConversations[0].name);
          setActivePeer(formattedConversations[0]);
        } else {
          console.log('[DEBUG Frontend] No conversations found - no peers to display');
        }
      } else {
        console.error("Failed to fetch conversations");
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial chat peers
  useEffect(() => {
    fetchUserData();
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
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{p.name}</p>
              {p.lastMessage && (
                <p className="text-[10px] opacity-70 truncate">
                  {p.lastMessage.senderId === p.id ? 'You: ' : ''}
                  {p.lastMessage.content.substring(0, 30)}{p.lastMessage.content.length > 30 ? '...' : ''}
                </p>
              )}
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
              selfId={selfId}
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

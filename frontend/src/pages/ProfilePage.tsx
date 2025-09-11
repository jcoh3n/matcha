import { useEffect, useState } from "react";
import { BrutalButton } from "@/components/ui/brutal-button";
import { MatchPercentage } from "@/components/ui/match-percentage";
import { OrientationBadge } from "@/components/ui/orientation-badge";
import { OnlineStatus } from "@/components/ui/online-status";

interface ProfilePageProps {
  onLogout?: () => void;
}

interface UserProfile {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  console.log("ProfilePage rendered with onLogout:", onLogout);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          console.log("No access token found, calling onLogout");
          onLogout?.();
          return;
        }

        const response = await fetch('http://localhost:3000/api/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token might be expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('accessToken', refreshData.accessToken);
              
              // Retry fetching user profile
              const retryResponse = await fetch('http://localhost:3000/api/me', {
                headers: {
                  'Authorization': `Bearer ${refreshData.accessToken}`,
                },
              });

              if (retryResponse.ok) {
                const userData = await retryResponse.json();
                setUser(userData);
              } else {
                console.log("Retry failed, calling onLogout");
                onLogout?.();
              }
            } else {
              console.log("Refresh failed, calling onLogout");
              onLogout?.();
            }
          } else {
            console.log("No refresh token found, calling onLogout");
            onLogout?.();
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        console.log("Error occurred, calling onLogout");
        onLogout?.();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [onLogout]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-64">Error loading profile</div>;
  }

  // For now, we'll use mock data for the profile images and other details
  // In a real app, this would come from the backend
  const mockImages = [
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"
  ];

  const mockBio = "Art student who loves coffee shops and weekend hikes. Always up for trying new restaurants! 🎨☕";
  const mockTags = ["Art", "Coffee", "Hiking", "Foodie", "Photography"];
  const mockLocation = "Paris, France";
  const mockAge = 24;
  const mockOrientation = "straight";
  const mockIsOnline = true;
  const mockMatchPercent = 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="surface-solid overflow-hidden">
            <img
              src={mockImages[0]}
              alt={user.firstName}
              className="w-full h-72 object-cover"
            />
          </div>
          <div className="flex gap-2">
            {mockImages.slice(1).map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-20 h-20 object-cover rounded-2xl border border-border/40"
              />
            ))}
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-montserrat text-4xl font-extrabold tracking-tight">
                {user.firstName} {user.lastName}, {mockAge}
              </h1>
              <p className="text-muted-foreground mt-1">{mockLocation}</p>
              <div className="mt-2 flex items-center gap-3">
                <OrientationBadge value={mockOrientation} />
                <OnlineStatus online={mockIsOnline} lastSeen={null} />
              </div>
            </div>
            <MatchPercentage value={mockMatchPercent} />
          </div>
          <section>
            <h2 className="font-montserrat text-xl font-semibold mb-2">Bio</h2>
            <p className="text-sm leading-relaxed surface p-4">{mockBio}</p>
          </section>
          <section>
            <h2 className="font-montserrat text-xl font-semibold mb-2">
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {mockTags.map((t) => (
                <span key={t} className="tag-pill">
                  {t}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

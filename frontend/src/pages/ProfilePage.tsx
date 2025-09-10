import { BrutalButton } from "@/components/ui/brutal-button";
import { getRandomProfiles } from "@/data/mockProfiles";
import { MatchPercentage } from "@/components/ui/match-percentage";
import { OrientationBadge } from "@/components/ui/orientation-badge";
import { OnlineStatus } from "@/components/ui/online-status";

interface ProfilePageProps {
  onLogout?: () => void;
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const me = { ...getRandomProfiles(1)[0], matchPercent: 100 };
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="surface-solid overflow-hidden">
            <img
              src={me.images[0]}
              alt={me.name}
              className="w-full h-72 object-cover"
            />
          </div>
          <div className="flex gap-2">
            {me.images.slice(1).map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-20 h-20 object-cover rounded-2xl border border-border/40"
              />
            ))}
          </div>
          <BrutalButton variant="outline" className="w-full" onClick={onLogout}>
            Logout
          </BrutalButton>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-montserrat text-4xl font-extrabold tracking-tight">
                {me.name}, {me.age}
              </h1>
              <p className="text-muted-foreground mt-1">{me.location}</p>
              <div className="mt-2 flex items-center gap-3">
                <OrientationBadge value={me.orientation} />
                <OnlineStatus online={me.isOnline} lastSeen={me.lastSeen} />
              </div>
            </div>
            <MatchPercentage value={me.matchPercent} />
          </div>
          <section>
            <h2 className="font-montserrat text-xl font-semibold mb-2">Bio</h2>
            <p className="text-sm leading-relaxed surface p-4">{me.bio}</p>
          </section>
          <section>
            <h2 className="font-montserrat text-xl font-semibold mb-2">
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {me.tags.map((t) => (
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

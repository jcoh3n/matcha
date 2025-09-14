import { useState } from "react";
import { getRandomProfiles, MockProfile } from "@/data/mockProfiles";
import { ProfileCard } from "@/components/ui/profile-card";

export function MatchesPage() {
  const [matches] = useState<MockProfile[]>(
    getRandomProfiles(6).map((p) => ({
      ...p,
      matchPercent: Math.round(Math.random() * 40) + 60,
    }))
  );

  return (
    <div>
      <h1 className="font-montserrat text-3xl font-extrabold tracking-tight mb-6">
        Your Matches
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((m) => (
          <ProfileCard key={m.id} user={m} variant="grid" />
        ))}
      </div>
    </div>
  );
}

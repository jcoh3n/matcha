import { useState } from 'react'
import { getRandomProfiles, MockProfile } from '@/data/mockProfiles'
import { ProfileCard } from '@/components/ui/profile-card'
import { Input } from '@/components/ui/input'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MockProfile[]>(getRandomProfiles(9))

  const onSearch = (q: string) => {
    setQuery(q)
    setResults(getRandomProfiles(9).filter(p => p.name.toLowerCase().includes(q.toLowerCase())))
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Input value={query} onChange={e=>onSearch(e.target.value)} placeholder="Search profiles..." className="h-12 rounded-2xl pl-4" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(r => <ProfileCard key={r.id} user={{ ...r, matchPercent: Math.round(Math.random()*60)+20 }} variant="grid" />)}
      </div>
    </div>
  )
}

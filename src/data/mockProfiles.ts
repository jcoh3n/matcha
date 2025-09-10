export interface MockProfile {
  id: string
  name: string
  age: number
  images: string[]
  bio: string
  location: string
  distance: number
  tags: string[]
  fame: number
  isOnline: boolean
  lastSeen?: string
  orientation: 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'pansexual'
  gender: 'male' | 'female' | 'non-binary' | 'other'
}

export const mockProfiles: MockProfile[] = [
  {
    id: "1",
    name: "Emma",
    age: 24,
    images: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Art student who loves coffee shops and weekend hikes. Always up for trying new restaurants! 🎨☕",
    location: "Paris, France",
    distance: 2.5,
    tags: ["Art", "Coffee", "Hiking", "Foodie", "Photography"],
    fame: 4.2,
    isOnline: true,
    orientation: 'straight',
    gender: 'female'
  },
  {
    id: "2",
    name: "Marcus",
    age: 28,
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Tech entrepreneur by day, guitarist by night. Looking for someone to share adventures with 🎸✨",
    location: "London, UK", 
    distance: 5.2,
    tags: ["Tech", "Music", "Guitar", "Entrepreneur", "Travel"],
    fame: 4.7,
    isOnline: false,
    lastSeen: "2 hours ago",
    orientation: 'straight',
    gender: 'male'
  },
  {
    id: "3",
    name: "Sophie",
    age: 26,
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Yoga instructor and mindfulness coach. Love connecting with nature and positive vibes only 🧘‍♀️🌿",
    location: "Amsterdam, NL",
    distance: 1.8,
    tags: ["Yoga", "Mindfulness", "Nature", "Health", "Spirituality"],
    fame: 4.5,
    isOnline: true,
    orientation: 'bisexual',
    gender: 'female'
  },
  {
    id: "4",
    name: "Alex",
    age: 31,
    images: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Chef passionate about sustainable cuisine. Dog dad to a golden retriever named Biscuit 👨‍🍳🐕",
    location: "Berlin, Germany",
    distance: 8.7,
    tags: ["Cooking", "Sustainability", "Dogs", "Chef", "Food"],
    fame: 4.8,
    isOnline: false,
    lastSeen: "1 day ago",
    orientation: 'straight',
    gender: 'male'
  },
  {
    id: "5",
    name: "Maya",
    age: 29,
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Digital nomad and freelance designer. Currently exploring Europe, next stop: who knows? 🌍💻",
    location: "Barcelona, Spain",
    distance: 12.3,
    tags: ["Design", "Travel", "Freelancer", "Digital Nomad", "Adventure"],
    fame: 4.3,
    isOnline: true,
    orientation: 'pansexual',
    gender: 'female'
  },
  {
    id: "6",
    name: "Liam",
    age: 25,
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Fitness trainer and rock climbing enthusiast. Always looking for a climbing partner! 🧗‍♂️💪",
    location: "Dublin, Ireland",
    distance: 3.4,
    tags: ["Fitness", "Climbing", "Sports", "Outdoors", "Adventure"],
    fame: 4.1,
    isOnline: false,
    lastSeen: "5 hours ago",
    orientation: 'gay',
    gender: 'male'
  },
  {
    id: "7",
    name: "Zara",
    age: 27,
    images: [
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Marine biologist with a passion for ocean conservation. Scuba diving is my meditation 🐠🌊",
    location: "Nice, France",
    distance: 6.8,
    tags: ["Marine Biology", "Scuba Diving", "Conservation", "Ocean", "Science"],
    fame: 4.6,
    isOnline: true,
    orientation: 'lesbian',
    gender: 'female'
  },
  {
    id: "8",
    name: "Kai",
    age: 30,
    images: [
      "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=600&fit=crop&crop=face"
    ],
    bio: "Photographer capturing life's beautiful moments. Coffee addict and vintage camera collector 📸☕",
    location: "Copenhagen, Denmark",
    distance: 4.7,
    tags: ["Photography", "Coffee", "Vintage", "Art", "Creative"],
    fame: 4.4,
    isOnline: false,
    lastSeen: "3 hours ago",
    orientation: 'bisexual',
    gender: 'non-binary'
  }
]

export const getRandomProfiles = (count: number = 10): MockProfile[] => {
  const shuffled = [...mockProfiles].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, mockProfiles.length))
}
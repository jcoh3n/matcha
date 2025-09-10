import { useState } from "react"
import { Heart, Sparkles, Shield, Users, ArrowRight, Eye, EyeOff } from "lucide-react"
import { BrutalButton } from "@/components/ui/brutal-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import heroImage from "@/assets/hero-image.jpg"

interface LandingPageProps {
  onAuth?: (type: 'login' | 'register') => void
}

export function LandingPage({ onAuth }: LandingPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const features = [
    {
      icon: Sparkles,
      title: "Smart Matching",
      description: "AI-powered algorithm that learns your preferences for better connections"
    },
    {
      icon: Shield,
      title: "Secure & Private", 
      description: "End-to-end encryption and verified profiles for your safety"
    },
    {
      icon: Users,
      title: "Real Connections",
      description: "Quality over quantity - meaningful matches with compatible people"
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAuth?.(authMode)
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-3xl flex items-center justify-center brutal-shadow">
                    <Heart className="w-7 h-7 text-primary-foreground fill-current" />
                  </div>
                  <h1 className="font-display text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Web Matcha
                  </h1>
                </div>
                
                <h2 className="font-display text-5xl lg:text-7xl font-black text-foreground leading-tight">
                  Find Your
                  <span className="block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                    Perfect Match
                  </span>
                </h2>
                
                <p className="text-xl text-muted-foreground max-w-lg">
                  Discover meaningful connections with our intelligent matching system. 
                  Join thousands of people finding real love every day.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-primary">500K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-primary">85%</div>
                  <div className="text-sm text-muted-foreground">Match Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-primary">12K+</div>
                  <div className="text-sm text-muted-foreground">Success Stories</div>
                </div>
              </div>
            </div>

            {/* Right Content - Auth Form */}
            <div className="animate-slide-up">
              <Card className="rounded-3xl card-shadow border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="font-display text-2xl font-bold text-center">
                    Start Your Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
                    <TabsList className="grid grid-cols-2 w-full rounded-2xl bg-muted/50">
                      <TabsTrigger value="login" className="rounded-xl font-semibold">Login</TabsTrigger>
                      <TabsTrigger value="register" className="rounded-xl font-semibold">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login" className="space-y-6 mt-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="your@email.com"
                            className="rounded-2xl h-12 bg-muted/50 border-0"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input 
                              id="password" 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="rounded-2xl h-12 bg-muted/50 border-0 pr-12"
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <BrutalButton type="submit" variant="hero" className="w-full">
                          Sign In
                          <ArrowRight className="w-5 h-5" />
                        </BrutalButton>
                      </form>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-6 mt-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input 
                              id="firstName" 
                              placeholder="Emma"
                              className="rounded-2xl h-12 bg-muted/50 border-0"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input 
                              id="lastName" 
                              placeholder="Smith"
                              className="rounded-2xl h-12 bg-muted/50 border-0"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            placeholder="emma_s"
                            className="rounded-2xl h-12 bg-muted/50 border-0"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registerEmail">Email</Label>
                          <Input 
                            id="registerEmail" 
                            type="email" 
                            placeholder="your@email.com"
                            className="rounded-2xl h-12 bg-muted/50 border-0"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registerPassword">Password</Label>
                          <div className="relative">
                            <Input 
                              id="registerPassword" 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="rounded-2xl h-12 bg-muted/50 border-0 pr-12"
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <BrutalButton type="submit" variant="hero" className="w-full">
                          Create Account
                          <ArrowRight className="w-5 h-5" />
                        </BrutalButton>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="text-center mt-6 text-sm text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Hero Image Background */}
        <div className="absolute inset-0 -z-10">
          <img 
            src={heroImage} 
            alt="People connecting" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-primary/20"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="font-display text-4xl font-bold mb-4">
              Why Choose Web Matcha?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've reimagined online dating with cutting-edge technology and a focus on genuine connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={feature.title}
                  className={`rounded-3xl border-0 card-shadow bg-card/80 backdrop-blur-sm interactive-card animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 brutal-shadow">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="font-display text-xl font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
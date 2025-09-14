import { useLocation, Link } from "react-router-dom"
import { useEffect } from "react"
import { BrutalButton } from "@/components/ui/brutal-button"

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error("404 route:", location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/20">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.25),transparent_60%),radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.25),transparent_65%)]" />
      <div className="relative z-10 glass-card p-12 max-w-lg text-center gradient-ring">
        <h1 className="text-8xl font-black font-display bg-gradient-to-tr from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 leading-none">404</h1>
        <p className="text-xl font-medium text-muted-foreground mb-2">Page introuvable</p>
        <p className="text-sm text-muted-foreground mb-8">Aucune page ne correspond à <span className="font-mono break-all">{location.pathname}</span></p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <BrutalButton asChild variant="hero" className="px-10">
            <Link to="/">Accueil</Link>
          </BrutalButton>
          <BrutalButton asChild variant="outline">
            <Link to="/discover">Découvrir</Link>
          </BrutalButton>
        </div>
      </div>
    </div>
  )
}

export default NotFound

import { ArrowRight } from "lucide-react";
import { FooterSection } from "@/components/ui/footer-section";

interface LandingPageProps {
  onAuth?: (type: "login" | "register") => void;
}

export function LandingPage({ onAuth }: LandingPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-hidden bg-transparent">
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Background image full screen */}
        <div className="absolute inset-0 -z-20">
          <img
            src="/matcha_bg.png"
            alt="matcha background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-brightness-[.85]" />
        </div>

        {/* Transparent navigation */}
        <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight font-montserrat">
              Matcha
            </span>
          </div>
          <ul className="hidden md:flex items-center gap-8 font-medium font-montserrat">
            <li>
              <button className="hover:opacity-80 transition">
                En savoir plus
              </button>
            </li>
            <li>
              <a href="/health-test" className="hover:opacity-80 transition">
                Health Test
              </a>
            </li>
            <li>
              <button className="hover:opacity-80 transition">Langue</button>
            </li>
            <li>
              <button
                onClick={() => onAuth?.("login")}
                className="font-semibold px-5 py-2 rounded-full border border-white/30 hover:bg-gradient-to-b from-primary to-primary/70"
              >
                Connexion
              </button>
            </li>
          </ul>
          {/* Mobile simple login */}
          <div className="md:hidden">
            <button
              onClick={() => onAuth?.("login")}
              className="font-semibold px-4 py-2 rounded-full border border-white/30 text-sm hover:bg-gradient-to-b from-primary to-primary/70"
            >
              Connexion
            </button>
          </div>
        </nav>

        {/* Central CTA */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 pt-40 md:pt-80 pb-40">
          <h1 className="font-montserrat text-5xl md:text-7xl font-extrabold leading-[1.05] text-white drop-shadow-sm">
            Find your Matcha
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-xl text-white/90 font-montserrat">
            Crée des connexions authentiques. Une nouvelle façon élégante de
            rencontrer des personnes compatibles.
          </p>

          <button
            onClick={() => onAuth?.("register")}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-primary to-primary/70 px-10 py-4 text-lg font-bold font-montserrat text-primary-foreground tracking-wide hover:from-primary/90 hover:to-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 transition-colors shadow-lg shadow-black/30"
          >
            Créer un compte
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}

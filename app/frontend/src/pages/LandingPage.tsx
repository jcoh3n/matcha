import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-hidden bg-white">
      {/* Navigation with clean design */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5 text-gray-800">
        <div className="flex items-center gap-2">
          <img 
            src="/logo-matcha.png" 
            alt="Matcha Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-2xl font-extrabold tracking-tight font-montserrat ml-2">
            Matcha
          </span>
        </div>
        <div className="hidden md:block">
          <Link
            to="/auth/login"
            className="font-semibold px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Connexion
          </Link>
        </div>
        {/* Mobile login button */}
        <div className="md:hidden">
          <Link
            to="/auth/login"
            className="font-semibold px-4 py-2 rounded-full border border-gray-300 text-sm hover:bg-gray-100 transition-colors"
          >
            Connexion
          </Link>
        </div>
      </nav>

      {/* Main content with centered layout */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full max-w-6xl">
          {/* Text content */}
          <div className="text-center md:text-left max-w-lg">
            <h1 className="font-montserrat text-4xl md:text-6xl font-extrabold leading-[1.1] text-gray-900 mb-6">
              MATCHA
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-700 font-montserrat leading-relaxed">
              Crée des connexions authentiques. Une nouvelle façon élégante de
              rencontrer des personnes compatibles.
            </p>

            <Link
              to="/auth/register"
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-green-500 to-green-600 px-10 py-4 text-lg font-bold font-montserrat text-white tracking-wide hover:from-green-600 hover:to-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/70 transition-colors shadow-lg shadow-green-500/20 block mx-auto md:mx-0"
            >
              Créer un compte
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="mt-4 text-sm text-gray-500">
              Rejoignez notre communauté aujourd'hui
            </p>
          </div>

          {/* Loader component */}
          <div className="relative w-full max-w-md h-80 flex items-center justify-center">
            <Loader />
          </div>
        </div>
      </div>
    </div>
  );
}

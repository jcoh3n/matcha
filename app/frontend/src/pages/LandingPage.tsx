import { Link } from "react-router-dom";
import Loader from "@/components/Loader";

export function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-end px-4 py-4">
        <Link
          to="/auth/login"
          className="font-semibold px-4 py-2 rounded-full border border-border hover:bg-secondary transition text-sm"
        >
          Se Connecter
        </Link>
      </nav>

      {/* CONTENU CENTRÉ */}
      <div className="flex flex-1 items-center justify-center px-4 py-4">
        <div className="flex flex-col items-center text-center w-full max-w-screen-lg">

          {/* LOGO */}
          <img
            src="/matcha.svg"
            alt="Matcha"
            className="w-[65vw] max-w-[380px] h-auto object-contain mt-16 md:mt-24"
          />

          {/* TEXTE */}
          <p className="text-foreground font-montserrat font-normal text-sm sm:text-base mt-3 max-w-[85%] md:max-w-[320px]">
            Parce que le meilleur Matcha, c'est celui qu'on partage.
          </p>

          {/* ZONE MACHINE */}
          <div className="relative w-full max-w-[480px] aspect-[3/2] sm:aspect-[5/3] mt-4 sm:mt-6 flex items-center justify-center">
            <Loader />

            {/* Texte Matcha dans la tasse - hidden on mobile, visible on desktop */}
            <img
              src="/matcha.svg"
              alt="Matcha Text"
              className="absolute z-20 w-12 sm:w-16 top-[70%] left-1/2 -translate-x-1/2 hidden md:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { SearchResults } from "@/components/ui/search-results";
import { useNavigate } from "react-router-dom";

export default function TestSearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigation = (page: string, query?: string) => {
    console.log("Navigate to:", page, "with query:", query);
    if (page === "search" && query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else if (page === "profile" && query) {
      navigate(`/profile/${query}`);
    } else {
      navigate(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Test de la barre de recherche</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recherche dans le header</h2>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="mb-4">La barre de recherche est maintenant intégrée dans le header.</p>
            <p>Essayez de taper un nom ou un prénom dans la barre de recherche du header pour voir les résultats en temps réel.</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Composant de recherche autonome</h2>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="max-w-md mx-auto">
              <SearchResults onNavigate={handleNavigation} />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="bg-card border border-border rounded-lg p-6">
            <ul className="list-disc pl-5 space-y-2">
              <li>Tapez un nom ou un prénom dans la barre de recherche</li>
              <li>Les résultats s'afficheront automatiquement en dessous</li>
              <li>Cliquez sur un résultat pour aller sur le profil de l'utilisateur</li>
              <li>Cliquez sur "Voir tous les résultats" pour accéder à la page de recherche complète</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
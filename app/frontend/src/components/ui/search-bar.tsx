import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

// Fonction de debounce personnalisée
function debounce<Func extends (...args: any[]) => any>(
  func: Func,
  wait: number
): (...args: Parameters<Func>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<Func>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  profile: {
    birthDate?: string;
    gender?: string;
    orientation?: string;
    bio?: string;
    fameRating?: number;
    lastActive?: string;
  };
  location?: {
    city?: string;
    country?: string;
  };
}

interface SearchBarProps extends React.ComponentProps<"input"> {
  onSearch?: (value: string) => void;
  placeholder?: string;
  onResults?: (results: UserProfile[]) => void;
  debounceDelay?: number;
  showSpinner?: boolean; // Nouvelle prop pour contrôler l'affichage du spinner
}

export function SearchBar({
  className,
  onSearch,
  placeholder = "Rechercher...",
  onResults,
  debounceDelay = 300,
  showSpinner = true, // Par défaut, le spinner est activé
  ...props
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length === 0) {
        onResults?.([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          onResults?.([]);
          return;
        }

        const response = await api.searchUsers(token, query);
        if (response.ok) {
          const results: UserProfile[] = await response.json();
          console.log("Search API response:", results);
          onResults?.(results);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch search results:", response.status, errorText);
          onResults?.([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        onResults?.([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceDelay),
    [onResults, debounceDelay]
  );

  // Effet pour déclencher la recherche quand la valeur change
  useEffect(() => {
    debouncedSearch(searchValue);
  }, [searchValue, debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="search"
        placeholder={placeholder}
        className={cn("pl-10 pr-4 py-2 w-full md:w-64", className)}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        {...props}
      />
      {isLoading && showSpinner && ( // N'afficher le spinner que si showSpinner est true
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </form>
  );
}
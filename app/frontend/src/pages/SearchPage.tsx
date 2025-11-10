import { useState, useEffect, useCallback, useRef, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface UserProfile {
  id: number | string;
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

export function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search suggestions as user types (only username)
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        setIsLoading(false);
        return;
      }

      // Use the existing search API but only for usernames
      const response = await api.searchUsers(searchQuery, 5, 0); // Get top 5 suggestions

      if (response.ok) {
        const data = await response.json();
        // Check if response has pagination structure and extract data if needed
        const users: UserProfile[] = Array.isArray(data) ? data : (data.data || []);
        setSuggestions(users);
        setShowSuggestions(true);
      } else {
        console.error("Failed to fetch suggestions");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input changes with debouncing for suggestions
  useEffect(() => {
    if (query.length >= 1) {
      // Use a timeout to simulate debounce for suggestions
      const timer = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, fetchSuggestions]);

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    }
  };

  const handleSuggestionClick = (user: UserProfile) => {
    // Redirect to the user's profile page
    navigate(`/profiles/${user.id}`);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setQuery(""); // Clear the search after selection
  };

  // Load initial state based on URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setQuery(q);
  }, [location.search]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="font-montserrat text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3">
          Search Users
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md sm:max-w-lg mx-auto">
          Find users by typing their username
        </p>
      </div>
      
      <div className="w-full relative">
        {/* Search input container - maintains fixed position */}
        <div className="relative mb-3">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by username..."
            className="h-12 sm:h-14 w-full rounded-full pl-5 sm:pl-6 pr-10 sm:pr-12 text-base sm:text-lg bg-white/90 backdrop-blur-sm border-2 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/70 shadow-lg shadow-primary/10 transition-all duration-300"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Static text that remains in fixed position */}
        <div className="h-6 mb-4 text-xs sm:text-sm text-muted-foreground text-center flex items-center justify-center">
          {query ? (
            <span>Searching for "{query}"...</span>
          ) : (
            <span>Start typing a username to search</span>
          )}
        </div>
        
        {/* Suggestions dropdown - absolutely positioned without affecting layout */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-border/30 max-h-80 overflow-y-auto"
          >
            <div className="py-2">
              {suggestions.map((user, index) => (
                <div
                  key={`${user.id}-${index}`}
                  className={`px-4 py-3 flex items-center space-x-3 cursor-pointer transition-colors duration-150 ${
                    index === selectedSuggestionIndex 
                      ? "bg-primary/10 border-l-4 border-primary" 
                      : "hover:bg-muted/40"
                  }`}
                  onClick={() => handleSuggestionClick(user)}
                >
                  <div className="flex-shrink-0">
                    {user.profilePhotoUrl ? (
                      <img 
                        src={user.profilePhotoUrl} 
                        alt={user.username} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.username}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content area that doesn't affect search bar position */}
      {!showSuggestions && !query && (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Find Connections</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Type a username in the search box above to find other users
          </p>
        </div>
      )}

      {/* Fixed: Only show 'No users found' message when query is present and suggestions are empty */}
      {!showSuggestions && query && suggestions.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-muted/30 to-border mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xs sm:max-w-md mx-auto">
            We couldn't find any users matching "<span className="font-semibold">{query}</span>". Try a different username.
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all available tags from the backend
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tags');
        if (response.ok) {
          const tagsData = await response.json();
          setAllTags(tagsData.map((tag: { name: string }) => tag.name));
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = allTags
      .filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag)
      )
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filtered);
  }, [inputValue, selectedTags, allTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && inputValue === "" && selectedTags.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInputValue("");
    setSuggestions([]);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionClick = (tag: string) => {
    addTag(tag);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
        {selectedTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedTags.length === 0 ? "Ajoutez vos centres d'intérêt..." : ""}
          className="flex-1 border-0 focus-visible:ring-0 p-0 h-auto min-w-[100px]"
        />
      </div>
      
      {suggestions.length > 0 && (
        <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((tag) => (
            <div
              key={tag}
              className="px-3 py-2 hover:bg-accent cursor-pointer"
              onClick={() => handleSuggestionClick(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
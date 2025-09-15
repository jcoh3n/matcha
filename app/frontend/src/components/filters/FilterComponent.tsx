import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  distance: number[];
  age: number[];
  fameRating: number[];
  tags: string[];
}

export interface FilterComponentProps {
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  onFilterChange = () => {},
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterState>({
    distance: initialFilters.distance || [0, 100],
    age: initialFilters.age || [18, 65],
    fameRating: initialFilters.fameRating || [0, 5],
    tags: initialFilters.tags || []
  });

  const [tagInput, setTagInput] = useState('');

  const predefinedTags = [
    'Photography', 'Travel', 'Music', 'Sports', 'Art', 'Technology',
    'Cooking', 'Reading', 'Gaming', 'Fitness', 'Movies', 'Dancing'
  ];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleDistanceChange = (value: number[]) => {
    updateFilters({ distance: value });
  };

  const handleAgeChange = (value: number[]) => {
    updateFilters({ age: value });
  };

  const handleFameRatingChange = (value: number[]) => {
    updateFilters({ fameRating: value });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      distance: [0, 100],
      age: [18, 65],
      fameRating: [0, 5],
      tags: []
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setTagInput('');
  };

  return (
    <Card className="w-full bg-background border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Distance */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Distance: {filters.distance[0]} - {filters.distance[1]} km
          </Label>
          <Slider
            value={filters.distance}
            onValueChange={handleDistanceChange}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Âge */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Âge: {filters.age[0]} - {filters.age[1]} ans
          </Label>
          <Slider
            value={filters.age}
            onValueChange={handleAgeChange}
            max={80}
            min={18}
            step={1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Célébrité */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Note de célébrité: {filters.fameRating[0]} - {filters.fameRating[1]}
          </Label>
          <Slider
            value={filters.fameRating}
            onValueChange={handleFameRatingChange}
            max={5}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Tags</Label>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1"
            />
            <Button
              onClick={() => addTag(tagInput.trim())}
              size="sm"
              disabled={!tagInput.trim() || filters.tags.includes(tagInput.trim())}
            >
              Ajouter
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tags populaires :</Label>
            <div className="flex flex-wrap gap-1">
              {predefinedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    if (filters.tags.includes(tag)) {
                      removeTag(tag);
                    } else {
                      addTag(tag);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {filters.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tags sélectionnés :</Label>
              <div className="flex flex-wrap gap-1">
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="default" className="text-xs">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0 text-xs hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                      aria-label={`Retirer ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterComponent;
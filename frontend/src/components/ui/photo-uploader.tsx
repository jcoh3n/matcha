import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PhotoUploaderProps {
  photos: { id?: number; url: string; isProfile: boolean }[];
  onPhotosChange: (photos: { id?: number; url: string; isProfile: boolean }[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "La taille de l'image ne doit pas dépasser 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // In a real app, you would upload the file to your backend here
      // For now, we'll create a preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Add the new photo
      const newPhoto = {
        url: previewUrl,
        isProfile: false
      };
      
      const newPhotos = [...photos, newPhoto];
      
      // If this is the first photo, set it as profile photo by default
      if (newPhotos.length === 1) {
        newPhotos[0].isProfile = true;
      }
      
      onPhotosChange(newPhotos);
      
      toast({
        title: "Succès",
        description: "Photo ajoutée avec succès."
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de la photo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const removedPhoto = newPhotos.splice(index, 1)[0];
    
    // If the removed photo was the profile photo, set the first photo as profile
    if (removedPhoto.isProfile && newPhotos.length > 0) {
      newPhotos[0].isProfile = true;
    }
    
    onPhotosChange(newPhotos);
    
    // Revoke the preview URL to free memory
    if (removedPhoto.url.startsWith('blob:')) {
      URL.revokeObjectURL(removedPhoto.url);
    }
  };

  const setAsProfile = (index: number) => {
    const newPhotos = photos.map((photo, i) => ({
      ...photo,
      isProfile: i === index
    }));
    
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {photos.map((photo, index) => (
          <Card key={index} className="relative w-32 h-32">
            <CardContent className="p-0 h-full">
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              {photo.isProfile && (
                <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Profil
                </div>
              )}
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 rounded-full"
                  onClick={() => setAsProfile(index)}
                  disabled={photo.isProfile}
                >
                  <Star className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6 rounded-full"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {photos.length < maxPhotos && (
          <Card className="w-32 h-32 flex items-center justify-center border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
               onClick={handleFileSelect}>
            <CardContent className="p-0 flex flex-col items-center justify-center text-muted-foreground">
              <Upload className="h-6 w-6" />
              <span className="text-xs mt-1">Ajouter</span>
            </CardContent>
          </Card>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading || photos.length >= maxPhotos}
      />
      
      <div className="text-sm text-muted-foreground">
        {photos.length} / {maxPhotos} photos ajoutées
        {photos.length > 0 && !photos.some(p => p.isProfile) && (
          <p className="text-muted-foreground italic mt-1">La première photo sera utilisée comme photo de profil.</p>
        )}
      </div>
    </div>
  );
}
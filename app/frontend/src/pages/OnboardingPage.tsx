import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TagSelector } from "@/components/ui/tag-selector";
import { PhotoUploader } from "@/components/ui/photo-uploader";
import { LocationSelector } from "@/components/ui/location-selector";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<{ url: string; isProfile: boolean }[]>(
    []
  );
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    method: "GPS" | "IP" | "MANUAL";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/auth/login");
    }
  }, [navigate]);

  const nextStep = () => {
    if (step === 2 && selectedTags.length < 3) {
      toast({
        title: "Ajoutez des centres d'intérêt",
        description: "Veuillez sélectionner au moins 3 tags.",
        variant: "destructive",
      });
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    if (!bio || !gender || !orientation || !birthDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir toutes les informations de base.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }

    if (photos.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins une photo.",
        variant: "destructive",
      });
      setStep(3);
      return;
    }

    if (!location) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier votre localisation.",
        variant: "destructive",
      });
      setStep(4);
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      // Complete onboarding with all data at once
      const onboardingData = {
        bio,
        gender,
        orientation,
        birthDate,
        tags: selectedTags,
        photos,
        location,
      };

      let response = await fetch(
        "http://localhost:3000/api/onboarding/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(onboardingData),
        }
      );

      // If the request failed due to token expiration, try to refresh the token
      if (!response.ok && response.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResponse = await fetch(
            "http://localhost:3000/api/auth/refresh",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            }
          );

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem("accessToken", refreshData.accessToken);

            // Retry the onboarding request with the new token
            response = await fetch(
              "http://localhost:3000/api/onboarding/complete",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${refreshData.accessToken}`,
                },
                body: JSON.stringify(onboardingData),
              }
            );
          } else {
            throw new Error("Failed to refresh token");
          }
        } else {
          throw new Error("No refresh token available");
        }
      }

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Get the response data
      const data = await response.json();

      // Update user data in localStorage
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Show success message
      toast({
        title: "Profil complété",
        description: "Vos informations ont été enregistrées avec succès.",
      });

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de l'enregistrement de vos informations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Complétez votre profil
            </CardTitle>
            <CardDescription className="text-center">
              Ces informations nous aideront à vous trouver des correspondances
              pertinentes
            </CardDescription>

            {/* Progress indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 w-12 rounded-full ${
                      s <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Biographie
                  </label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="gender" className="text-sm font-medium">
                      Genre
                    </label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="orientation"
                      className="text-sm font-medium"
                    >
                      Orientation
                    </label>
                    <Select
                      value={orientation}
                      onValueChange={setOrientation}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straight">Hétérosexuel</SelectItem>
                        <SelectItem value="gay">Homosexuel</SelectItem>
                        <SelectItem value="lesbian">Lesbienne</SelectItem>
                        <SelectItem value="bisexual">Bisexuel</SelectItem>
                        <SelectItem value="pansexual">Pansexuel</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="birthDate" className="text-sm font-medium">
                    Date de naissance
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Centres d'intérêt</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez vos centres d'intérêt pour améliorer vos
                  correspondances (minimum 3)
                </p>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
                <p
                  className={`text-sm ${
                    selectedTags.length < 3
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {selectedTags.length < 3
                    ? `Encore ${3 - selectedTags.length} à sélectionner`
                    : "Parfait, vous pouvez continuer"}
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Photos</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez jusqu'à 5 photos. La photo de profil sera celle qui
                  apparaîtra en premier.
                </p>
                <PhotoUploader
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={5}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Localisation</h3>
                <p className="text-sm text-muted-foreground">
                  Nous utilisons votre localisation pour trouver des
                  correspondances à proximité
                </p>
                <LocationSelector onLocationChange={setLocation} />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || isLoading}
            >
              Précédent
            </Button>

            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={isLoading || (step === 2 && selectedTags.length < 3)}
              >
                Suivant
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Enregistrement en cours..." : "Terminer"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

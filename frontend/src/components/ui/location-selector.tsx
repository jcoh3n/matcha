import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Wifi, Navigation } from "lucide-react";

interface LocationSelectorProps {
  onLocationChange: (location: { 
    latitude: number; 
    longitude: number; 
    city?: string; 
    country?: string;
    method: 'GPS' | 'IP' | 'MANUAL'
  }) => void;
}

export function LocationSelector({ onLocationChange }: LocationSelectorProps) {
  const [locationMethod, setLocationMethod] = useState<'GPS' | 'IP' | 'MANUAL'>('GPS');
  const [manualLocation, setManualLocation] = useState({ city: '', country: '' });
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  // Try to get location from IP on component mount
  useEffect(() => {
    detectLocationFromIP();
  }, []);

  const detectLocationFromIP = async () => {
    setIsDetecting(true);
    try {
      // In a real app, you would call your backend API to get location from IP
      // For now, we'll use a mock response
      setTimeout(() => {
        const mockLocation = {
          latitude: 48.8566,
          longitude: 2.3522,
          city: "Paris",
          country: "France",
          method: "IP" as const
        };
        
        onLocationChange(mockLocation);
        setIsDetecting(false);
        
        toast({
          title: "Localisation détectée",
          description: `Localisation détectée : ${mockLocation.city}, ${mockLocation.country}`
        });
      }, 1000);
    } catch (error) {
      console.error('IP location error:', error);
      setIsDetecting(false);
      
      toast({
        title: "Localisation non détectée",
        description: "Impossible de détecter votre localisation par IP. Veuillez utiliser une autre méthode.",
        variant: "destructive"
      });
    }
  };

  const detectLocationFromGPS = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you would reverse geocode the coordinates to get city/country
        // For now, we'll use mock data
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: "Localisation GPS",
          country: "",
          method: "GPS" as const
        };
        
        onLocationChange(location);
        setIsDetecting(false);
        
        toast({
          title: "Localisation GPS",
          description: "Votre position a été détectée avec succès."
        });
      },
      (error) => {
        console.error('GPS location error:', error);
        setIsDetecting(false);
        
        toast({
          title: "Erreur GPS",
          description: "Impossible d'obtenir votre position GPS. Veuillez réessayer ou utiliser une autre méthode.",
          variant: "destructive"
        });
      }
    );
  };

  const handleManualLocationSubmit = () => {
    if (!manualLocation.city || !manualLocation.country) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs de localisation.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you would geocode the city/country to get coordinates
    // For now, we'll use mock coordinates
    const location = {
      latitude: 0,
      longitude: 0,
      city: manualLocation.city,
      country: manualLocation.country,
      method: "MANUAL" as const
    };
    
    onLocationChange(location);
    
    toast({
      title: "Localisation enregistrée",
      description: `Localisation enregistrée : ${manualLocation.city}, ${manualLocation.country}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          type="button"
          variant={locationMethod === 'GPS' ? 'default' : 'outline'}
          onClick={() => {
            setLocationMethod('GPS');
            detectLocationFromGPS();
          }}
          disabled={isDetecting}
          className="h-24 flex flex-col items-center justify-center gap-2"
        >
          <Navigation className="h-6 w-6" />
          <span>GPS</span>
        </Button>
        
        <Button
          type="button"
          variant={locationMethod === 'IP' ? 'default' : 'outline'}
          onClick={() => {
            setLocationMethod('IP');
            detectLocationFromIP();
          }}
          disabled={isDetecting}
          className="h-24 flex flex-col items-center justify-center gap-2"
        >
          <Wifi className="h-6 w-6" />
          <span>Adresse IP</span>
        </Button>
        
        <Button
          type="button"
          variant={locationMethod === 'MANUAL' ? 'default' : 'outline'}
          onClick={() => setLocationMethod('MANUAL')}
          className="h-24 flex flex-col items-center justify-center gap-2"
        >
          <MapPin className="h-6 w-6" />
          <span>Manuelle</span>
        </Button>
      </div>

      {locationMethod === 'MANUAL' && (
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Localisation manuelle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={manualLocation.city}
                onChange={(e) => setManualLocation({...manualLocation, city: e.target.value})}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={manualLocation.country}
                onChange={(e) => setManualLocation({...manualLocation, country: e.target.value})}
                placeholder="France"
              />
            </div>
          </div>
          <Button onClick={handleManualLocationSubmit}>Enregistrer la localisation</Button>
        </div>
      )}

      {isDetecting && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2">Détection de votre localisation en cours...</p>
        </div>
      )}
    </div>
  );
}
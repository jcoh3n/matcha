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
      // For demonstration, we'll use a real IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data && data.latitude && data.longitude) {
        const location = {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || '',
          country: data.country_name || '',
          method: "IP" as const
        };
        
        onLocationChange(location);
        setIsDetecting(false);
        
        toast({
          title: "Localisation détectée",
          description: `Localisation détectée : ${location.city || 'Inconnu'}, ${location.country || 'Inconnu'}`
        });
      } else {
        throw new Error('Invalid response from IP geolocation service');
      }
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
      async (position) => {
        try {
          // Reverse geocode the coordinates to get city/country
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Matcha/1.0 (https://github.com/your-repo/matcha)'
              }
            }
          );
          const data = await response.json();
          
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: data?.address?.city || data?.address?.town || data?.address?.village || '',
            country: data?.address?.country || '',
            method: "GPS" as const
          };
          
          onLocationChange(location);
          setIsDetecting(false);
          
          toast({
            title: "Localisation GPS",
            description: `Votre position a été détectée : ${location.city || 'Inconnu'}, ${location.country || 'Inconnu'}`
          });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          // Fallback to coordinates only
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: "",
            country: "",
            method: "GPS" as const
          };
          
          onLocationChange(location);
          setIsDetecting(false);
          
          toast({
            title: "Localisation GPS",
            description: "Votre position a été détectée avec succès (adresse non disponible)."
          });
        }
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

  const handleManualLocationSubmit = async () => {
    if (!manualLocation.city || !manualLocation.country) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs de localisation.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Geocode the city/country to get coordinates
      const query = `${manualLocation.city}, ${manualLocation.country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Matcha/1.0 (https://github.com/your-repo/matcha)'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const location = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          city: manualLocation.city,
          country: manualLocation.country,
          method: "MANUAL" as const
        };
        
        onLocationChange(location);
        
        toast({
          title: "Localisation enregistrée",
          description: `Localisation enregistrée : ${manualLocation.city}, ${manualLocation.country}`
        });
      } else {
        throw new Error('No results found for the provided location');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Erreur de géocodage",
        description: "Impossible de trouver les coordonnées pour cette localisation. Veuillez vérifier et réessayer.",
        variant: "destructive"
      });
    }
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
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token from URL params
        const token = searchParams.get('token');
        
        // In a real app, you would make an API call to verify the token
        // For now, we'll simulate the verification process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (token) {
          // Simulate successful verification
          setIsVerified(true);
          toast({
            title: "Email vérifié",
            description: "Votre email a été vérifié avec succès."
          });
        } else {
          // Simulate error - no token provided
          setError("Lien de vérification invalide");
        }
      } catch (error) {
        setError("Une erreur s'est produite lors de la vérification de votre email.");
        toast({
          title: "Erreur de vérification",
          description: "Une erreur s'est produite. Veuillez réessayer.",
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Vérification d'email</CardTitle>
          <CardDescription className="text-center">
            {isVerifying ? "Vérification de votre email en cours..." : 
             isVerified ? "Votre email a été vérifié avec succès !" : 
             error || "Une erreur s'est produite"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Veuillez patienter...</p>
            </div>
          ) : isVerified ? (
            <div className="space-y-4">
              <div className="text-5xl text-green-500">✓</div>
              <p className="text-muted-foreground">
                Merci d'avoir vérifié votre adresse email. Vous pouvez maintenant vous connecter à votre compte.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-5xl text-red-500">✗</div>
              <p className="text-muted-foreground">
                {error || "Impossible de vérifier votre email. Le lien peut être expiré ou invalide."}
              </p>
            </div>
          )}
        </CardContent>
        {!isVerifying && (
          <CardFooter className="flex flex-col space-y-4">
            <Link to="/auth/login" className="w-full">
              <Button className="w-full">
                {isVerified ? "Se connecter" : "Retenter la vérification"}
              </Button>
            </Link>
            <div className="text-sm text-center">
              <Link to="/auth/login" className="text-primary hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
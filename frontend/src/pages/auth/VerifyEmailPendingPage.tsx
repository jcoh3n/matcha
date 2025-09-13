import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export function VerifyEmailPendingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || "your email address";

  const handleResendEmail = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      toast({
        title: "Succès",
        description: data.message || "L'email de vérification a été renvoyé avec succès.",
      });
    } catch (error) {
      console.error('Resend verification email error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de l'email de vérification. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Vérifiez votre email</CardTitle>
          <CardDescription className="text-center">
            Presque terminé ! Nous avons envoyé un email de vérification à {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification pour activer votre compte.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Si vous n'avez pas reçu l'email, vérifiez votre dossier spam ou cliquez sur le bouton ci-dessous pour le renvoyer.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={handleResendEmail} variant="outline" className="w-full">
            Renvoyer l'email de vérification
          </Button>
          <Button onClick={() => navigate("/login")} className="w-full">
            Aller à la page de connexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
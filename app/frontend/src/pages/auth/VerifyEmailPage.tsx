import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setVerificationStatus('verifying');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      // Try to parse JSON, but handle case where response might be empty
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        data = {};
      }
      
      if (response.ok) {
        setVerificationStatus('success');
        toast({
          title: "Succès",
          description: data.message || "Votre email a été vérifié avec succès !",
        });
      } else {
        setVerificationStatus('error');
        toast({
          title: "Erreur",
          description: data.message || "Échec de la vérification de l'email",
          variant: "destructive",
        });
      }
    } catch (error) {
      setVerificationStatus('error');
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la vérification de votre email",
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async () => {
    // In a real implementation, you would prompt for the user's email
    // For now, we'll just show a message
    toast({
      title: "Information",
      description: "Veuillez utiliser le formulaire de connexion pour renvoyer un email de vérification.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Vérification d'email</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'idle' && "Vérification du jeton..."}
            {verificationStatus === 'verifying' && "Vérification de votre email..."}
            {verificationStatus === 'success' && "Email vérifié avec succès !"}
            {verificationStatus === 'error' && "Échec de la vérification de l'email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === 'idle' && (
            <div className="text-center">
              <p>Vérification de votre jeton de vérification...</p>
            </div>
          )}
          
          {verificationStatus === 'verifying' && (
            <div className="text-center">
              <p>Veuillez patienter pendant que nous vérifions votre adresse email...</p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="text-center space-y-4">
              <p>Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter à votre compte.</p>
              <Button onClick={() => navigate('/auth/login')} className="w-full">
                Aller à la connexion
              </Button>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="text-center space-y-4">
              <p>Une erreur s'est produite lors de la vérification de votre email. Le lien de vérification a peut-être expiré.</p>
              <Button onClick={handleResendEmail} variant="outline" className="w-full">
                Renvoyer l'email de vérification
              </Button>
              <Button onClick={() => navigate('/auth/login')} className="w-full">
                Aller à la connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
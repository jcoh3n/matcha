import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call here
      console.log("Password reset request for:", email);
      
      // Show success message
      setIsSent(true);
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation a été envoyé à votre adresse."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSent ? "Vérifiez votre email" : "Mot de passe oublié"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSent
              ? "Un lien de réinitialisation a été envoyé à votre adresse email."
              : "Entrez votre adresse email pour recevoir un lien de réinitialisation"}
          </CardDescription>
        </CardHeader>
        {isSent ? (
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Veuillez vérifier votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
            </p>
            <div className="mt-6">
              <Link to="/auth/login">
                <Button variant="outline">Retour à la connexion</Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
              <div className="text-sm text-center">
                <Link to="/auth/login" className="text-primary hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
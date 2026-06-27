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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        toast({
          title: "Email sent",
          description: data.message || "The verification email has been sent again.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Could not send the verification email. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not send the verification email. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            Almost done! We sent a verification email to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            Please check your inbox and click the verification link to activate your account.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            If you didn't receive the email, check your spam folder or click the button below to resend it.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={handleResendEmail} variant="outline" className="w-full">
            Resend verification email
          </Button>
          <Button onClick={() => navigate("/auth/login")} className="w-full">
            Go to sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

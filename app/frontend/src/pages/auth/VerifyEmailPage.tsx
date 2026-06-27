import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setVerificationStatus("verifying");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        setVerificationStatus("success");
        toast({
          title: "Email verified",
          description: data.message || "Your email has been verified successfully!",
        });
      } else {
        setVerificationStatus("error");
        toast({
          title: "Verification failed",
          description: data.message || "We couldn't verify your email.",
          variant: "destructive",
        });
      }
    } catch {
      setVerificationStatus("error");
      toast({
        title: "Verification failed",
        description: "Something went wrong while verifying your email.",
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async () => {
    toast({
      title: "Heads up",
      description: "Please use the sign-in form to resend a verification email.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email verification</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === "idle" && "Checking token..."}
            {verificationStatus === "verifying" && "Verifying your email..."}
            {verificationStatus === "success" && "Email verified successfully!"}
            {verificationStatus === "error" && "Email verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === "idle" && (
            <div className="text-center">
              <p>Checking your verification token...</p>
            </div>
          )}

          {verificationStatus === "verifying" && (
            <div className="text-center">
              <p>Please wait while we verify your email address...</p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="text-center space-y-4">
              <p>Your email has been verified successfully. You can now sign in to your account.</p>
              <Button onClick={() => navigate("/auth/login")} className="w-full">
                Go to sign in
              </Button>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="text-center space-y-4">
              <p>Something went wrong while verifying your email. The verification link may have expired.</p>
              <Button onClick={handleResendEmail} variant="outline" className="w-full">
                Resend verification email
              </Button>
              <Button onClick={() => navigate("/auth/login")} className="w-full">
                Go to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

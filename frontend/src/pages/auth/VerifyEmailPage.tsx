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
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Handle non-JSON responses or errors
        const errorText = await response.text();
        console.error('Email verification error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
          title: "Success",
          description: data.message || "Email verified successfully!",
        });
      } else {
        setVerificationStatus('error');
        toast({
          title: "Error",
          description: data.message || "Failed to verify email",
          variant: "destructive",
        });
      }
    } catch (error) {
      setVerificationStatus('error');
      toast({
        title: "Error",
        description: "An error occurred while verifying your email",
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async () => {
    // In a real implementation, you would prompt for the user's email
    // For now, we'll just show a message
    toast({
      title: "Info",
      description: "In a real implementation, you would be prompted to enter your email to resend the verification.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Email</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'idle' && "Checking verification token..."}
            {verificationStatus === 'verifying' && "Verifying your email..."}
            {verificationStatus === 'success' && "Email verified successfully!"}
            {verificationStatus === 'error' && "Failed to verify email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === 'idle' && (
            <div className="text-center">
              <p>Checking your verification token...</p>
            </div>
          )}
          
          {verificationStatus === 'verifying' && (
            <div className="text-center">
              <p>Please wait while we verify your email address...</p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="text-center space-y-4">
              <p>Your email has been successfully verified. You can now log in to your account.</p>
              <Button onClick={() => navigate('/auth/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="text-center space-y-4">
              <p>There was an error verifying your email. The verification link may have expired.</p>
              <Button onClick={handleResendEmail} variant="outline" className="w-full">
                Resend Verification Email
              </Button>
              <Button onClick={() => navigate('/auth/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
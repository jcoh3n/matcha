import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState<{ status: string; timestamp: string; service: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3000/health");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
          <CardDescription>Backend API Status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center">Checking health...</p>
          ) : error ? (
            <div className="space-y-2">
              <p className="text-red-500">Error: {error}</p>
              <Button onClick={checkHealth}>Retry</Button>
            </div>
          ) : healthStatus ? (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className="text-green-500 font-medium">{healthStatus.status}</span>
              </p>
              <p>
                <span className="font-medium">Service:</span> {healthStatus.service}
              </p>
              <p>
                <span className="font-medium">Timestamp:</span>{" "}
                {new Date(healthStatus.timestamp).toLocaleString()}
              </p>
              <Button onClick={checkHealth} className="mt-4">
                Refresh
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

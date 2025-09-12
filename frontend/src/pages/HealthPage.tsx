import { HealthCheck } from "@/components/HealthCheck";

export function HealthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Matcha System Status</h1>
        <HealthCheck />
      </div>
    </div>
  );
}
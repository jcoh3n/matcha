import React, { useState, useEffect } from 'react';
import { checkBackendHealth, HealthStatus } from '../services/healthService';

const HealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const status = await checkBackendHealth();
        setHealthStatus(status);
        setError(null);
      } catch (err) {
        setError('Failed to connect to backend');
        setHealthStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthStatus();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Checking health...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <h3 className="font-bold">Health Check Failed</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (healthStatus) {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded-lg">
        <h3 className="font-bold">Backend Health Status</h3>
        <p>Status: {healthStatus.status}</p>
        <p>Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}</p>
        <p>Uptime: {Math.floor(healthStatus.uptime)} seconds</p>
      </div>
    );
  }

  return null;
};

export default HealthCheck;
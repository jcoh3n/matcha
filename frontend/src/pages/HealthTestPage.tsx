import React from 'react';
import HealthCheck from '../components/HealthCheck';

const HealthTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Health Check Test</h1>
        <HealthCheck />
      </div>
    </div>
  );
};

export default HealthTestPage;
import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  subMessage,
}) => {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="mt-4">{message}</p>
        {subMessage && <p className="text-sm text-gray-400 mt-2">{subMessage}</p>}
      </div>
    </div>
  );
};


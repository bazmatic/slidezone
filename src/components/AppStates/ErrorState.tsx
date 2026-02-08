import React from 'react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onSecondaryAction,
  secondaryActionLabel,
}) => {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <div className="space-y-2">
          {onRetry && (
            <Button onClick={onRetry} className="mr-2">
              Retry
            </Button>
          )}
          {onSecondaryAction && secondaryActionLabel && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { PANEL_CLASS, DIALOG_FOOTER_CLASS } from '@/constants/dialogStyles';
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
      <div className={`${PANEL_CLASS} w-full max-w-md mx-4 text-center`}>
        <p className="text-red-400 mb-4">{error}</p>
        {(onRetry || (onSecondaryAction && secondaryActionLabel)) && (
          <div className={DIALOG_FOOTER_CLASS}>
            {onSecondaryAction && secondaryActionLabel && (
              <Button variant="secondary" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
            {onRetry && <Button variant="primary" onClick={onRetry}>Retry</Button>}
          </div>
        )}
      </div>
    </div>
  );
};


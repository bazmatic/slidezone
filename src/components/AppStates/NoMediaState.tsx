import React from 'react';
import { Button } from '../ui/Button';

interface NoMediaStateProps {
  message?: string;
  subMessage?: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  selectedFolder?: string | null;
}

export const NoMediaState: React.FC<NoMediaStateProps> = ({
  message = 'No media files found',
  subMessage,
  onPrimaryAction,
  primaryActionLabel,
  onSecondaryAction,
  secondaryActionLabel,
  selectedFolder,
}) => {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="text-center">
        <p className="mb-4">{message}</p>
        {subMessage && <p className="text-sm text-gray-400 mb-4">{subMessage}</p>}
        {selectedFolder && (
          <p className="text-sm text-gray-400 mb-4">
            Selected folder: {selectedFolder}
          </p>
        )}
        {(onPrimaryAction || onSecondaryAction) && (
          <div className="space-y-2">
            {onPrimaryAction && primaryActionLabel && (
              <Button onClick={onPrimaryAction} className="mr-2">
                {primaryActionLabel}
              </Button>
            )}
            {onSecondaryAction && secondaryActionLabel && (
              <Button variant="secondary" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


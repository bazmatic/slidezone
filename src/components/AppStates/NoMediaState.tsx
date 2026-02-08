import React from 'react';
import { PANEL_CLASS, DIALOG_FOOTER_CLASS } from '@/constants/dialogStyles';
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
      <div className={`${PANEL_CLASS} w-full max-w-md mx-4 text-center`}>
        <p className="mb-4">{message}</p>
        {subMessage && <p className="text-sm text-gray-400 mb-4">{subMessage}</p>}
        {selectedFolder && (
          <p className="text-sm text-gray-400 mb-4">
            Selected folder: {selectedFolder}
          </p>
        )}
        {(onPrimaryAction || onSecondaryAction) && (
          <div className={DIALOG_FOOTER_CLASS}>
            {onSecondaryAction && secondaryActionLabel && (
              <Button variant="secondary" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
            {onPrimaryAction && primaryActionLabel && (
              <Button variant="primary" onClick={onPrimaryAction}>
                {primaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


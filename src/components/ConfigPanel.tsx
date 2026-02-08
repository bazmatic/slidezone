import React, { useState } from 'react';
import { SlideshowConfig } from '@/types/media';
import { DEFAULT_VIDEO_DISPLAY_SECONDS } from '@/constants/config';
import {
  LABEL_CLASS,
  LABEL_INLINE_CLASS,
  INPUT_CLASS,
  CHECKBOX_CLASS,
  DIALOG_FOOTER_CLASS,
} from '@/constants/dialogStyles';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ConfigPanelProps {
  config: SlideshowConfig;
  onConfigChange: (config: SlideshowConfig) => void;
  isOpen: boolean;
  onClose: () => void;
  isElectron?: boolean;
  selectedFolder?: string | null;
  onChangeFolder?: () => void;
  onClearSavedFolder?: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onConfigChange,
  isOpen,
  onClose,
  isElectron = false,
  selectedFolder,
  onChangeFolder,
  onClearSavedFolder,
}) => {
  const [localConfig, setLocalConfig] = useState<SlideshowConfig>(config);

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(config);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Slideshow Settings">

        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Photo Display Time (seconds)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={localConfig.photoDisplaySeconds}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                photoDisplaySeconds: parseInt(e.target.value) || 5
              }))}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Video Display Time (seconds)</label>
            <input
              type="number"
              min="1"
              max="300"
              value={localConfig.videoDisplaySeconds}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                videoDisplaySeconds: parseInt(e.target.value) || DEFAULT_VIDEO_DISPLAY_SECONDS
              }))}
              disabled={localConfig.playVideoToEnd}
              className={INPUT_CLASS}
            />
            <p className="text-xs text-gray-400 mt-1">Ignored when “Play videos to end” is on.</p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="playVideoToEnd"
              checked={localConfig.playVideoToEnd}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                playVideoToEnd: e.target.checked
              }))}
              className={CHECKBOX_CLASS}
            />
            <label htmlFor="playVideoToEnd" className={LABEL_INLINE_CLASS}>
              Play videos to end before next item
            </label>
          </div>

          <div>
            <label className={LABEL_CLASS}>Transition Duration (milliseconds)</label>
            <input
              type="number"
              min="0"
              max="3000"
              step="100"
              value={localConfig.transitionDuration}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                transitionDuration: parseInt(e.target.value) || 1000
              }))}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableKenBurns"
              checked={localConfig.enableKenBurns}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                enableKenBurns: e.target.checked
              }))}
              className={CHECKBOX_CLASS}
            />
            <label htmlFor="enableKenBurns" className={LABEL_INLINE_CLASS}>
              Enable Ken Burns Effect
            </label>
          </div>

          {localConfig.enableKenBurns && (
            <div>
              <label className={LABEL_CLASS}>Ken Burns Duration (milliseconds)</label>
              <input
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={localConfig.kenBurnsDuration}
                onChange={(e) => setLocalConfig(prev => ({
                  ...prev,
                  kenBurnsDuration: parseInt(e.target.value) || 5000
                }))}
                className={INPUT_CLASS}
              />
            </div>
          )}

          {isElectron && (
            <>
              <div className="border-t border-gray-600 pt-4 mt-4">
                <label className={LABEL_CLASS}>Media folder</label>
                <p className="text-sm bg-gray-700/50 border border-gray-600 rounded px-3 py-2 break-all text-gray-300 mb-3">
                  {selectedFolder ?? 'No folder selected'}
                </p>
                <div className="flex gap-2">
                  {onChangeFolder && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onChangeFolder();
                        onClose();
                      }}
                    >
                      Change folder
                    </Button>
                  )}
                  {onClearSavedFolder && (
                    <Button
                      variant="danger"
                      onClick={async () => {
                        await onClearSavedFolder();
                        onClose();
                      }}
                    >
                      Clear saved folder
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className={DIALOG_FOOTER_CLASS}>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleSave} className="!bg-blue-500 hover:!bg-blue-400 !bg-opacity-100 text-white font-semibold">
            Save
          </Button>
        </div>
    </Modal>
  );
};

export default ConfigPanel; 
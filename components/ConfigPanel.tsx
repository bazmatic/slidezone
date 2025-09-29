'use client';

import React, { useState } from 'react';
import { SlideshowConfig } from '@/types/media';

interface ConfigPanelProps {
  config: SlideshowConfig;
  onConfigChange: (config: SlideshowConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onConfigChange,
  isOpen,
  onClose,
}) => {
  const [localConfig, setLocalConfig] = useState<SlideshowConfig>(config);

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Slideshow Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Photo Display Time (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={localConfig.photoDisplaySeconds}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                photoDisplaySeconds: parseInt(e.target.value) || 5
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Display Time (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={localConfig.videoDisplaySeconds}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                videoDisplaySeconds: parseInt(e.target.value) || 10
              }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transition Duration (milliseconds)
            </label>
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="enableKenBurns" className="text-sm font-medium text-gray-300">
              Enable Ken Burns Effect
            </label>
          </div>

          {localConfig.enableKenBurns && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ken Burns Duration (milliseconds)
              </label>
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel; 
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ChromecastDevice {
  id: string;
  name: string;
  friendlyName: string;
}

interface ChromecastControlsProps {
  onCastStart?: (deviceId: string) => void;
  onCastStop?: () => void;
  onMediaCast?: (mediaUrl: string, mediaType: string) => void;
  currentMediaUrl?: string;
  currentMediaType?: string;
}

export default function ChromecastControls({
  onCastStart,
  onCastStop,
  onMediaCast,
  currentMediaUrl,
  currentMediaType
}: ChromecastControlsProps) {
  const [devices, setDevices] = useState<ChromecastDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  // Check if Chromecast API is available
  const isChromecastAvailable = typeof window !== 'undefined' && 
    window.electronAPI && 
    typeof window.electronAPI.getChromecastDevices === 'function';

  const scanForDevices = useCallback(async () => {
    if (!isChromecastAvailable) return;
    
    setIsScanning(true);
    setError('');
    
    try {
      const result = await window.electronAPI.getChromecastDevices();
      if (result.success) {
        setDevices(result.devices || []);
      } else {
        setError(result.error || 'Failed to scan for devices');
      }
    } catch (err) {
      setError('Error scanning for Chromecast devices');
      console.error('Error scanning for devices:', err);
    } finally {
      setIsScanning(false);
    }
  }, [isChromecastAvailable]);

  useEffect(() => {
    if (isChromecastAvailable) {
      scanForDevices();
    }
  }, [isChromecastAvailable, scanForDevices]);

  const startSession = async () => {
    if (!selectedDevice || !isChromecastAvailable) return;
    
    try {
      const result = await window.electronAPI.startChromecastSession(selectedDevice);
      if (result.success) {
        setIsConnected(true);
        onCastStart?.(selectedDevice);
        setError('');
      } else {
        setError(result.error || 'Failed to start session');
      }
    } catch (err) {
      setError('Error starting Chromecast session');
      console.error('Error starting session:', err);
    }
  };

  const stopSession = async () => {
    if (!isChromecastAvailable) return;
    
    try {
      const result = await window.electronAPI.stopChromecastSession();
      if (result.success) {
        setIsConnected(false);
        onCastStop?.();
        setError('');
      } else {
        setError(result.error || 'Failed to stop session');
      }
    } catch (err) {
      setError('Error stopping Chromecast session');
      console.error('Error stopping session:', err);
    }
  };

  const castCurrentMedia = async () => {
    if (!currentMediaUrl || !currentMediaType || !isChromecastAvailable) return;
    
    try {
      const result = await window.electronAPI.castMedia(currentMediaUrl, currentMediaType);
      if (result.success) {
        onMediaCast?.(currentMediaUrl, currentMediaType);
        setError('');
      } else {
        setError(result.error || 'Failed to cast media');
      }
    } catch (err) {
      setError('Error casting media');
      console.error('Error casting media:', err);
    }
  };

  if (!isChromecastAvailable) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          Chromecast functionality is not available. Make sure you&apos;re running the Electron app.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Chromecast Controls</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Device Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Chromecast Device
          </label>
          <div className="flex gap-2">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isScanning}
            >
              <option value="">Select a device...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.friendlyName || device.name}
                </option>
              ))}
            </select>
            <button
              onClick={scanForDevices}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isScanning ? 'Scanning...' : 'Scan'}
            </button>
          </div>
        </div>

        {/* Connection Controls */}
        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={startSession}
              disabled={!selectedDevice}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Media Casting */}
        {isConnected && currentMediaUrl && (
          <div>
            <button
              onClick={castCurrentMedia}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Cast Current Media
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Casting: {currentMediaType} - {currentMediaUrl.split('/').pop()}
            </p>
          </div>
        )}

        {/* Status */}
        <div className="text-sm">
          <p className="text-gray-600">
            Status: {isConnected ? (
              <span className="text-green-600 font-medium">Connected</span>
            ) : (
              <span className="text-gray-500">Disconnected</span>
            )}
          </p>
          {devices.length > 0 && (
            <p className="text-gray-600">
              Found {devices.length} device(s)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


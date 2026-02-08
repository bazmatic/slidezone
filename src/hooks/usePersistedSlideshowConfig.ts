import { useState, useEffect, useCallback } from 'react';
import { SlideshowConfig } from '@/types/media';
import { DEFAULT_CONFIG, SLIDESHOW_SETTINGS_STORAGE_KEY } from '@/constants/config';
import { platformService } from '@/services/PlatformService';

function mergeWithDefaults(partial: Partial<SlideshowConfig> | null): SlideshowConfig {
  if (!partial || typeof partial !== 'object') return { ...DEFAULT_CONFIG };
  return {
    ...DEFAULT_CONFIG,
    ...partial,
  };
}

function loadFromStorage(): Promise<SlideshowConfig> {
  const electron = platformService.getElectronService();
  if (electron) {
    return electron.getSlideshowSettings().then((saved) => mergeWithDefaults(saved));
  }
  try {
    const raw = localStorage.getItem(SLIDESHOW_SETTINGS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<SlideshowConfig>) : null;
    return Promise.resolve(mergeWithDefaults(parsed));
  } catch {
    return Promise.resolve({ ...DEFAULT_CONFIG });
  }
}

function saveToStorage(config: SlideshowConfig): void {
  const electron = platformService.getElectronService();
  if (electron) {
    electron.setSlideshowSettings(config);
    return;
  }
  try {
    localStorage.setItem(SLIDESHOW_SETTINGS_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function usePersistedSlideshowConfig(): {
  config: SlideshowConfig;
  setConfig: (config: SlideshowConfig) => void;
  isLoaded: boolean;
} {
  const [config, setConfigState] = useState<SlideshowConfig>(() => ({ ...DEFAULT_CONFIG }));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage().then((loaded) => {
      setConfigState(loaded);
      setIsLoaded(true);
    });
  }, []);

  const setConfig = useCallback((newConfig: SlideshowConfig) => {
    setConfigState(newConfig);
    saveToStorage(newConfig);
  }, []);

  return { config, setConfig, isLoaded };
}

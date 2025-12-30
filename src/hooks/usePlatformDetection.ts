import { useState, useEffect } from 'react';
import { platformService } from '@/services/PlatformService';

export function usePlatformDetection() {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const checkElectron = () => {
      const isElectronEnv = platformService.isElectron();
      setIsElectron(isElectronEnv);
      setIsInitialized(true);
    };

    // Try immediately and also after a short delay
    checkElectron();
    const timeoutId = setTimeout(checkElectron, 100);
    
    // Fallback: if still not initialized after 2 seconds, assume Electron mode
    const fallbackTimeoutId = setTimeout(() => {
      if (!isInitialized) {
        setIsElectron(true);
        setIsInitialized(true);
      }
    }, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeoutId);
    };
  }, [isInitialized]);

  return { isElectron, isInitialized };
}


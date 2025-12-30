import { platformService } from '@/services/PlatformService';

export function isElectron(): boolean {
  return platformService.isElectron();
}

export function detectPlatform(): 'electron' | 'web' {
  return isElectron() ? 'electron' : 'web';
}


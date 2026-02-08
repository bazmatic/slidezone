import { ElectronService } from './ElectronService';
import { MediaService } from './MediaService';
import { ElectronServiceImpl } from './implementations/ElectronServiceImpl';
import { WebMediaServiceImpl } from './implementations/WebMediaServiceImpl';

class PlatformService {
  private electronService: ElectronService | null = null;
  private mediaService: MediaService | null = null;

  getElectronService(): ElectronService | null {
    if (!this.electronService) {
      const service = new ElectronServiceImpl();
      if (service.isAvailable()) {
        this.electronService = service;
      }
    }
    return this.electronService;
  }

  getMediaService(): MediaService {
    if (!this.mediaService) {
      this.mediaService = new WebMediaServiceImpl();
    }
    return this.mediaService;
  }

  isElectron(): boolean {
    return this.getElectronService() !== null;
  }
}

export const platformService = new PlatformService();


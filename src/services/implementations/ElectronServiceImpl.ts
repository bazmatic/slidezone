import { ElectronService } from '../ElectronService';
import { MediaFile, SlideshowConfig } from '@/types/media';

export class ElectronServiceImpl implements ElectronService {
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  async selectFolder(): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error('Electron API is not available');
    }
    return window.electronAPI!.selectFolder();
  }

  async readMediaFolder(folderPath: string): Promise<{
    success: boolean;
    files: MediaFile[];
    count: number;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      throw new Error('Electron API is not available');
    }
    console.log(`[ElectronServiceImpl] readMediaFolder called with: ${folderPath}`);
    const result = await window.electronAPI!.readMediaFolder(folderPath);
    console.log(`[ElectronServiceImpl] readMediaFolder result: success=${result.success}, count=${result.count || result.files?.length || 0}`);
    return result;
  }

  async getSavedFolder(): Promise<string | undefined> {
    if (!this.isAvailable()) {
      throw new Error('Electron API is not available');
    }
    return window.electronAPI!.getSavedFolder();
  }

  async clearSavedFolder(): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Electron API is not available');
    }
    return window.electronAPI!.clearSavedFolder();
  }

  async openInFinder(filePath: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Electron API is not available'
      };
    }
    
    if (window.electronAPI!.openInFinder) {
      return window.electronAPI!.openInFinder(filePath);
    }
    
    return {
      success: false,
      error: 'openInFinder is not available'
    };
  }

  getSplashUrl(): string {
    return window.electronAPI?.getSplashUrl?.() ?? '';
  }

  async getSlideshowSettings(): Promise<SlideshowConfig | null> {
    if (!this.isAvailable()) return null;
    return window.electronAPI!.getSlideshowSettings();
  }

  async setSlideshowSettings(settings: SlideshowConfig): Promise<void> {
    if (!this.isAvailable()) return;
    await window.electronAPI!.setSlideshowSettings(settings);
  }
}


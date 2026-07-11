import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private static readonly STORAGE_KEY = 'app_language';
  private static readonly DEFAULT_LANGUAGE: AppLanguage = 'fr';

  readonly supportedLanguages: readonly AppLanguage[] = ['fr', 'en'];

  constructor(private readonly translate: TranslateService) {}

  init(): void {
    this.translate.addLangs([...this.supportedLanguages]);
    this.translate.setFallbackLang(LanguageService.DEFAULT_LANGUAGE);

    const language = this.resolveInitialLanguage();
    this.applyLanguage(language);
  }

  getCurrentLanguage(): AppLanguage {
    const current = this.translate.getCurrentLang();
    return this.isSupported(current) ? current : LanguageService.DEFAULT_LANGUAGE;
  }

  setLanguage(language: AppLanguage): void {
    if (!this.isSupported(language)) {
      return;
    }

    try {
      localStorage.setItem(LanguageService.STORAGE_KEY, language);
    } catch {
      // localStorage may be unavailable (private mode); ignore.
    }

    this.applyLanguage(language);
  }

  private applyLanguage(language: AppLanguage): void {
    this.translate.use(language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }

  private resolveInitialLanguage(): AppLanguage {
    const stored = this.readStoredLanguage();
    if (stored) {
      return stored;
    }

    // Auto-detect the device/browser language: French stays French,
    // anything else falls back to English.
    const browserLang = this.translate.getBrowserLang();
    return browserLang?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  private readStoredLanguage(): AppLanguage | null {
    try {
      const stored = localStorage.getItem(LanguageService.STORAGE_KEY);
      return this.isSupported(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  private isSupported(language: string | null | undefined): language is AppLanguage {
    return !!language && this.supportedLanguages.includes(language as AppLanguage);
  }
}

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const STORAGE_KEY = 'gs-theme';

/** Light/dark switch. With no saved choice the page follows the visitor's system setting. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Re-applies a saved choice. index.html also does this inline to avoid a flash on load. */
  restore(): void {
    if (!this.isBrowser) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') this.doc.documentElement.dataset['theme'] = saved;
    } catch {
      /* storage can be blocked; the system theme still applies */
    }
  }

  toggle(): void {
    if (!this.isBrowser) return;
    const root = this.doc.documentElement;
    const isDark = getComputedStyle(root).colorScheme.includes('dark');
    const next = isDark ? 'light' : 'dark';
    root.dataset['theme'] = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }
}

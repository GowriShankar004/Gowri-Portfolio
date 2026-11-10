import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Owns GSAP, ScrollTrigger and Lenis smooth scrolling.
 *
 * Nothing runs on the server or for visitors who ask for reduced motion: the prerendered
 * page is complete without JavaScript, and motion only layers on top of it in the browser.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly doc = inject(DOCUMENT);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private lenis: Lenis | null = null;
  private started = false;
  enabled = false;

  get reducedMotion(): boolean {
    return this.isBrowser && typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  get finePointer(): boolean {
    return this.isBrowser && typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;
  }

  /** Call once, after the first render in the browser. */
  start(): void {
    if (!this.isBrowser || this.started) return;
    this.started = true;
    const root = this.doc.documentElement;
    root.classList.add('js');
    // Animations need matchMedia (missing in test DOMs) and are skipped when visitors ask for less motion.
    if (this.reducedMotion || typeof matchMedia !== 'function') return;

    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('gsap');
    this.enabled = true;

    this.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(this.raf);
    gsap.ticker.lagSmoothing(0);
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  /** Jumps straight to a section (used behind the page-transition curtain). */
  jumpTo(target: HTMLElement | 'top', offset = -70): void {
    if (!this.isBrowser) return;
    const root = this.doc.documentElement;
    root.style.scrollBehavior = 'auto';
    if (this.lenis) {
      if (target === 'top') {
        this.lenis.scrollTo(0, { immediate: true, force: true });
        return void (root.style.scrollBehavior = '');
      }
      // Lenis already subtracts the section's CSS scroll-margin-top, so add it back to keep `offset` exact.
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      this.lenis.scrollTo(target, { immediate: true, force: true, offset: offset + margin });
    } else if (target === 'top') {
      scrollTo(0, 0);
    } else {
      target.scrollIntoView();
    }
    root.style.scrollBehavior = '';
  }

  destroy(): void {
    gsap.ticker.remove(this.raf);
    this.lenis?.destroy();
    this.lenis = null;
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  private readonly raf = (time: number): void => this.lenis?.raf(time * 1000);
}

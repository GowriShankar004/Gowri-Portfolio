import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MotionService } from './motion.service';

export type SectionId = 'top' | 'about' | 'work' | 'projects' | 'skills' | 'education' | 'contact';

/** Plays the curtain and resolves once the section underneath should be revealed. */
export type CurtainPlayer = (label: string, counter: string, swap: () => void) => Promise<void>;

const ORDER: SectionId[] = ['about', 'work', 'projects', 'skills', 'education', 'contact'];
const LABELS: Record<SectionId, string> = {
  top: 'Hello.',
  about: 'About.',
  work: 'Experience.',
  projects: 'Projects.',
  skills: 'Skills.',
  education: 'Education.',
  contact: 'Contact.',
};

/** In-page navigation: every nav link travels through the gradient curtain. */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly doc = inject(DOCUMENT);
  private readonly motion = inject(MotionService);
  private curtain: CurtainPlayer | null = null;
  private busy = false;

  readonly order = ORDER;

  registerCurtain(player: CurtainPlayer): void {
    this.curtain = player;
  }

  /** Returns false when the browser should follow the plain #anchor instead. */
  travel(id: SectionId): boolean {
    const el = id === 'top' ? 'top' : this.doc.getElementById(id);
    if (!el || !this.curtain || !this.motion.enabled) return false;
    if (this.busy) return true;
    this.busy = true;
    const i = ORDER.indexOf(id);
    const counter = i < 0 ? '00 / home' : `0${i + 1} / 0${ORDER.length}`;
    // The pinned projects gallery starts at the very top of its section, so it needs no nav offset.
    const offset = el !== 'top' && el.classList.contains('hs') ? 0 : -70;
    this.curtain(LABELS[id], counter, () => this.motion.jumpTo(el, offset)).finally(() => (this.busy = false));
    return true;
  }
}

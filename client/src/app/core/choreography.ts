import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll choreography for the whole page, one function per section.
 *
 * Runs once in the browser after the first render, inside a gsap.context scoped to the page,
 * so a single revert() removes every tween, ScrollTrigger and pin. Only called when motion is on.
 */

const EASE = 'power3.out';
const once = (trigger: gsap.DOMTarget) => ({ trigger, start: 'top 86%', once: true });

export function setupChoreography(page: HTMLElement): () => void {
  const ctx = gsap.context(() => {
    // The projects pin is created first so every trigger further down measures the extra scroll it adds.
    const mm = projects(page);
    hero();
    sectionHeads(page);
    manifesto();
    about();
    experience(page);
    skills(page);
    roadmap();
    education();
    contact();
    ghosts(page);
    ambient(page);
    return () => mm.revert();
  }, page);
  return () => ctx.revert();
}

/** Projects: a pinned horizontal gallery on large screens, a simple rise-in list on phones. */
function projects(page: HTMLElement): gsap.MatchMedia {
  const section = page.querySelector<HTMLElement>('#projects')!;
  const track = section.querySelector<HTMLElement>('.grid')!;
  const cards = [...track.querySelectorAll<HTMLElement>('.proj')];
  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px) and (min-height: 640px)', () => {
    section.classList.add('hs');
    const fillBar = section.querySelector<HTMLElement>('.hbar i')!;
    const bigword = section.querySelector<HTMLElement>('.bigword')!;
    gsap.set(bigword, { yPercent: -50 });

    const distance = () => {
      const cs = getComputedStyle(section);
      const inner = section.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      return Math.max(0, track.scrollWidth - inner);
    };

    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onEnter: () => cards.forEach(c => c.classList.add('in')),
        onUpdate: self => gsap.set(fillBar, { scaleX: self.progress }),
      },
    });

    gsap.fromTo(bigword, { xPercent: -45 }, {
      xPercent: 5,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + distance(), scrub: 1.2, invalidateOnRefresh: true },
    });

    cards.forEach(card =>
      gsap.from(card, {
        opacity: 0.15, scale: 0.86, rotateY: -14, transformPerspective: 1200, transformOrigin: '0% 50%', ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 100%', end: 'left 62%', scrub: true },
      }),
    );

    return () => section.classList.remove('hs');
  });

  mm.add('(max-width: 899px), (max-height: 639px)', () => {
    cards.forEach(card =>
      gsap.from(card, {
        y: 70, opacity: 0, duration: 1, ease: EASE, clearProps: 'transform,opacity',
        scrollTrigger: { ...once(card), onEnter: () => card.classList.add('in') },
      }),
    );
  });

  return mm;
}

/** Hero: plays in on load, then drifts apart as you scroll away. */
function hero(): void {
  gsap.from('.hero .status, .hero .typed, .hero .lede, .hero .cta', {
    y: 26, opacity: 0, duration: 1, ease: EASE, stagger: 0.09, delay: 0.3, clearProps: 'transform,opacity',
  });
  gsap.from('#me .frame', { clipPath: 'inset(100% 0% 0% 0% round 30px)', duration: 1.4, ease: 'expo.out', delay: 0.15, clearProps: 'clipPath' });
  gsap.from('#me .fl', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(2.2)', stagger: 0.1, delay: 0.9, clearProps: 'transform,opacity' });
  gsap.from('#me .badge', { opacity: 0, duration: 0.8, delay: 1.3 });
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .to('.hero > div:first-child', { y: -90, opacity: 0.1, ease: 'none' }, 0)
    .to('#me', { y: 110, scale: 0.9, rotate: -3, ease: 'none' }, 0);
}

/** Section headings rise word by word (CSS transition keyed on .in) and their ledes fade up. */
function sectionHeads(page: HTMLElement): void {
  page.querySelectorAll<HTMLElement>('.sec-head, .contact').forEach(el =>
    ScrollTrigger.create({ ...once(el), onEnter: () => el.classList.add('in') }),
  );
  page.querySelectorAll<HTMLElement>('.sec-head p').forEach(p =>
    gsap.from(p, { y: 24, opacity: 0, duration: 0.9, delay: 0.25, ease: EASE, clearProps: 'transform,opacity', scrollTrigger: once(p) }),
  );
}

/** Manifesto: each word lights up as you read down the page. */
function manifesto(): void {
  gsap.to('.mf .mw', { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.manifesto', start: 'top 78%', end: 'bottom 50%', scrub: 0.6 } });
  gsap.from('.mf-sign', { y: 20, opacity: 0, duration: 0.8, ease: EASE, clearProps: 'transform,opacity', scrollTrigger: once('.mf-sign') });
}

/** About: stat cards flip up, the chat window glides in. */
function about(): void {
  gsap.from('.stat', {
    rotateX: -70, y: 40, opacity: 0, transformPerspective: 800, transformOrigin: '50% 100%',
    duration: 1, ease: EASE, stagger: 0.1, clearProps: 'transform,opacity', scrollTrigger: once('.stats'),
  });
  gsap.from('.window', { x: 90, opacity: 0, duration: 1.1, ease: EASE, clearProps: 'transform,opacity', scrollTrigger: once('.window') });
}

/** Experience: each role slides in, then its badge pops and its bullet points follow. */
function experience(page: HTMLElement): void {
  page.querySelectorAll<HTMLElement>('.job').forEach(job =>
    gsap.timeline({ scrollTrigger: { trigger: job, start: 'top 88%', once: true } })
      .from(job, { x: 110, opacity: 0, duration: 1, ease: EASE, clearProps: 'transform,opacity' })
      .from(job.querySelectorAll('.type, .now'), { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.1, clearProps: 'transform,opacity' }, '-=0.55')
      .from(job.querySelectorAll('li'), { x: 30, opacity: 0, duration: 0.6, ease: EASE, stagger: 0.09, clearProps: 'transform,opacity' }, '-=0.5'),
  );
}

/** Skills: each group rises, then its logos pop in one by one. */
function skills(page: HTMLElement): void {
  page.querySelectorAll<HTMLElement>('.sk').forEach((group, i) =>
    gsap.timeline({ scrollTrigger: once(group), delay: (i % 4) * 0.08 })
      .from(group, { y: 60, opacity: 0, duration: 0.9, ease: EASE, clearProps: 'transform,opacity' })
      .from(group.querySelectorAll('.pills span'), { scale: 0.3, opacity: 0, duration: 0.5, ease: 'back.out(2.6)', stagger: 0.045, clearProps: 'transform,opacity' }, '-=0.5'),
  );
}

/** Roadmap: the rail draws across with the scroll and the steps light up in order. */
function roadmap(): void {
  gsap.fromTo('.rline', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.road', start: 'top 80%', end: 'center 45%', scrub: 0.8 } });
  gsap.from('.step', { y: 40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.15, clearProps: 'transform,opacity', scrollTrigger: once('.road') });
}

/** Education: cards swing open like pages. */
function education(): void {
  gsap.from('.ed', {
    rotateY: -40, x: -40, opacity: 0, transformPerspective: 1000, transformOrigin: '0% 50%',
    duration: 1.1, ease: EASE, stagger: 0.14, clearProps: 'transform,opacity', scrollTrigger: once('.edu'),
  });
}

/** Contact: the card opens out of a smaller frame and its heading rises with the scroll. */
function contact(): void {
  gsap.fromTo('.contact', { clipPath: 'inset(10% 6% 10% 6% round 26px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 26px)', ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top 95%', end: 'top 45%', scrub: 0.6 },
  });
  gsap.from('.contact h2 .w > span', {
    yPercent: 110, rotate: 5, opacity: 0, ease: 'none', stagger: 0.12,
    scrollTrigger: { trigger: '.contact', start: 'top 88%', end: 'top 30%', scrub: 0.6 },
  });
}

/** Giant outlined section numbers drift slower than the page. */
function ghosts(page: HTMLElement): void {
  page.querySelectorAll<HTMLElement>('.ghost').forEach(ghost =>
    gsap.fromTo(ghost, { yPercent: 35 }, {
      yPercent: -45, ease: 'none',
      scrollTrigger: { trigger: ghost.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    }),
  );
}

/** The background light drifts and shifts colour over the whole page. */
function ambient(page: HTMLElement): void {
  const [b1, b2, b3] = [...page.querySelectorAll<HTMLElement>('#amb i')];
  gsap.timeline({ scrollTrigger: { start: 0, end: 'max', scrub: 1.5 } })
    .to(b1, { x: '30vw', y: '70vh', opacity: 0.07, ease: 'none' }, 0)
    .to(b2, { x: '-35vw', y: '-15vh', ease: 'none' }, 0)
    .to(b3, { opacity: 0.16, y: '-30vh', ease: 'none' }, 0);
}

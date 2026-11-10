# Gowri Shankar Duvvu · Portfolio

Personal portfolio of **Gowri Shankar Duvvu**, Software Engineer at datanitiv (.NET, Angular, SQL), on the path to AI development.

The site is built in the same stack it describes: an **Angular** frontend now, and a **.NET** Web API next.

| Folder | What it is | Status |
|---|---|---|
| [`client/`](client) | Angular 22 single-page site, prerendered to static HTML | ✅ Phase 1 |
| `api/` | .NET 10 Web API: contact form (MailKit) and an AI "Ask Gowri" chat | 🔜 Phase 2 |

## Tech stack

- **Angular 22**: standalone components, signals, zoneless change detection, `OnPush` everywhere, new control flow (`@for`, `@if`, `@switch`)
- **Static prerendering** (`@angular/ssr`, `outputMode: static`): every word is in the HTML before any JavaScript runs, so search engines and link previews see the real content
- **TypeScript 6**, strict mode
- **GSAP 3 + ScrollTrigger**: scroll choreography, including a pinned horizontal projects gallery
- **Lenis**: smooth scrolling
- **Vitest** unit tests, **angular-eslint** linting
- Hand-written CSS design tokens with light and dark themes; no UI framework

## Run it

```bash
cd client
npm install
npm start          # dev server on http://localhost:4200
npm run build      # static site in client/dist/client/browser
npm test           # unit tests
npm run lint
npm run typecheck
```

## How the client is organised

```
client/src/
├── app/
│   ├── data/portfolio.data.ts     ← all content lives here (jobs, projects, skills, ...)
│   ├── models/                    ← typed interfaces for that content
│   ├── core/
│   │   ├── motion.service.ts      ← GSAP, ScrollTrigger and Lenis lifecycle
│   │   ├── choreography.ts        ← every scroll animation, one function per section
│   │   ├── navigation.service.ts  ← in-page navigation through the curtain transition
│   │   ├── theme.service.ts       ← light / dark switch
│   │   └── toast.service.ts
│   ├── sections/                  ← one component per page section (hero, about, projects, ...)
│   ├── layout/                    ← page-wide pieces: curtain, back-to-top, ambient light, toast
│   ├── shared/                    ← section heading, icons, count-up and pointer directives
│   └── pages/home/                ← composes the sections
├── styles/                        ← design tokens, base styles and one partial per section
└── index.html                     ← SEO meta, Open Graph and JSON-LD Person schema
```

### Design decisions

- **Content is data.** To add a project, job or certification, edit `portfolio.data.ts`. No template changes are needed.
- **Motion is a layer, not a requirement.** Animations start only in the browser, after the first render. They are skipped for visitors who turn on *reduce motion*, and if a library fails the page is still complete.
- **One place for scroll animations.** `choreography.ts` runs inside a single `gsap.context`, so one `revert()` cleans up every tween, trigger and pin.
- **Layout-neutral components.** Section components use `display: contents` hosts, so Angular's element wrappers never change the CSS grid and flex layouts.

## Deploy

The build is plain static files, so any static host works:

- **Vercel / Netlify:** root directory `client`, build command `npm run build`, output `dist/client/browser`
- **GitHub Pages:** publish `client/dist/client/browser`

## Roadmap

- [x] Phase 1: Angular frontend with full motion design
- [ ] Phase 2: .NET 10 Web API with a working contact form (MailKit/SMTP) and an AI-powered "Ask Gowri" chat
- [ ] Certifications and achievements sections

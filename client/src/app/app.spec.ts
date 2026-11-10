import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { HomePage } from './pages/home/home.page';
import { CHAT, JOBS, PROJECTS, SECTIONS, SKILL_GROUPS } from './data/portfolio.data';

describe('App', () => {
  it('creates the app shell', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] }).compileComponents();
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });
});

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HomePage] }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  });

  it('renders every section the nav links to', () => {
    for (const id of ['about', 'work', 'projects', 'skills', 'education', 'contact']) {
      expect(page.querySelector(`#${id}`), id).not.toBeNull();
    }
  });

  it('renders one card per job, project and skill group', () => {
    expect(page.querySelectorAll('.job').length).toBe(JOBS.length);
    expect(page.querySelectorAll('.proj').length).toBe(PROJECTS.length);
    expect(page.querySelectorAll('.sk').length).toBe(SKILL_GROUPS.length);
  });

  it('marks only the current role as full-time', () => {
    const fullTime = page.querySelectorAll('.job.ft');
    expect(fullTime.length).toBe(1);
    expect(fullTime[0].textContent).toContain('Software Engineer');
  });

  it('keeps headings readable to screen readers while splitting them into words', () => {
    const h2 = page.querySelector('#projects h2')!;
    expect(h2.getAttribute('aria-label')).toBe("Things I've built.");
    expect(h2.querySelectorAll('.w').length).toBe(3);
  });

  it('answers a different question when a chip is clicked', async () => {
    const chip = [...page.querySelectorAll<HTMLButtonElement>('.chip')].find(c => c.textContent?.includes('Why AI?'))!;
    chip.click();
    await fixture.whenStable();
    expect(page.querySelector('.q')?.textContent).toBe('Why AI?');
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('portfolio data', () => {
  it('gives every project somewhere to go', () => {
    for (const p of PROJECTS) expect(p.url ?? p.links?.length, p.name).toBeTruthy();
  });

  it('numbers the sections in page order', () => {
    expect(Object.values(SECTIONS).map(s => s.index)).toEqual([1, 2, 3, 4, 5]);
  });

  it('has unique chat keys', () => {
    expect(new Set(CHAT.map(c => c.key)).size).toBe(CHAT.length);
  });
});

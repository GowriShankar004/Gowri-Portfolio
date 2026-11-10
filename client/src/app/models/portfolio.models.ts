/** A run of text inside a heading; `grad` renders it with the brand gradient. */
export interface TextPart {
  text: string;
  grad?: boolean;
}

export interface SectionHead {
  id: string;
  /** Position in the page, shown as the giant outlined numeral and in the page-transition curtain. */
  index: number;
  eyebrow: string;
  title: TextPart[];
  lede: string;
}

export interface Stat {
  value: number;
  label: string;
}

export interface ChatAnswer {
  key: string;
  question: string;
  answer: string;
}

export type EmploymentType = 'Full-time' | 'Internship';

export interface Job {
  title: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  type: EmploymentType;
  current?: boolean;
  highlights: string[];
}

export type ProjectAccent = 'mint' | 'violet' | 'coral';
export type ProjectSize = 'feature' | 'wide' | 'regular' | 'client';

export interface ProjectLink {
  label: string;
  url: string;
  primary?: boolean;
}

export interface Project {
  name: string;
  kind: string;
  accent: ProjectAccent;
  size: ProjectSize;
  summary: string;
  details?: string;
  tags: string[];
  /** The whole card links here unless `links` is set. */
  url?: string;
  links?: ProjectLink[];
  /** Steps of the agent flow diagram (AI project only). */
  flow?: string[];
  /** Lines of the example terminal run (AI project only). */
  log?: { kind: 'prompt' | 'step' | 'done'; text: string }[];
  image?: { src: string; alt: string; width: number; height: number };
}

/** A skill shows either a logo from /public/icons or a built-in line glyph. */
export type SkillGlyph = 'api' | 'mail' | 'db' | 'join' | 'chart' | 'spark' | 'fn' | 'bolt' | 'doc';

export interface Skill {
  name: string;
  logo?: string;
  glyph?: SkillGlyph;
  /** Dark logos (GitHub, Django) are lightened in dark mode. */
  invertInDark?: boolean;
}

export interface SkillGroup {
  name: string;
  color: string;
  skills: Skill[];
}

export type RoadmapState = 'done' | 'now' | 'next' | 'goal';

export interface RoadmapStep {
  state: RoadmapState;
  label: string;
  title: string;
  text: string;
}

export interface Education {
  years: string;
  title: string;
  field: string;
  school: string;
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  lede: string;
  typedRoles: [verb: string, rest: string][];
  heroChips: string[];
  marquee: { text: string; strong?: boolean }[];
  manifesto: TextPart[];
}

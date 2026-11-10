/**
 * Writes the site's content as Markdown for the API's "Ask Gowri" chat, so the AI only
 * knows what the portfolio itself says. Run after editing portfolio.data.ts:
 *
 *   npm run export:profile
 *
 * Output is deterministic (no timestamps), which keeps the API's cached system prompt stable.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  CHAT,
  EDUCATION,
  JOBS,
  PROFILE,
  PROJECTS,
  ROADMAP,
  SKILL_GROUPS,
  STATS,
} from '../src/app/data/portfolio.data.ts';

const out = fileURLToPath(new URL('../../api/Portfolio.Api/Knowledge/profile.md', import.meta.url));
const text = (parts: { text: string }[]) => parts.map(p => p.text).join(' ');

const md = [
  `# ${PROFILE.name}`,
  '',
  `${PROFILE.role} at ${PROFILE.company}, ${PROFILE.location}.`,
  PROFILE.lede,
  '',
  text(PROFILE.manifesto),
  '',
  `- Email: ${PROFILE.email}`,
  `- GitHub: ${PROFILE.github}`,
  `- LinkedIn: ${PROFILE.linkedin}`,
  '',
  '## At a glance',
  ...STATS.map(s => `- ${s.value}: ${s.label}`),
  '',
  '## Experience',
  ...JOBS.flatMap(j => [
    '',
    `### ${j.title}, ${j.company}${j.location ? ` (${j.location})` : ''}`,
    `${j.start} – ${j.end} · ${j.type}`,
    ...j.highlights.map(h => `- ${h}`),
  ]),
  '',
  '## Projects',
  ...PROJECTS.flatMap(p => [
    '',
    `### ${p.name} (${p.kind})`,
    p.summary,
    ...(p.details ? [p.details] : []),
    `Tech: ${p.tags.join(', ')}`,
    ...(p.url ? [`Link: ${p.url}`] : []),
    ...(p.links ?? []).map(l => `${l.label}: ${l.url}`),
  ]),
  '',
  '## Skills',
  ...SKILL_GROUPS.map(g => `- ${g.name}: ${g.skills.map(s => s.name).join(', ')}`),
  '',
  '## Roadmap to AI developer',
  ...ROADMAP.map(r => `- ${r.label}: ${r.title}. ${r.text}`),
  '',
  '## Education',
  ...EDUCATION.map(e => `- ${e.years}: ${e.title}, ${e.field}, ${e.school}`),
  '',
  '## Answers written by Gowri (use as tone and facts reference)',
  ...CHAT.flatMap(c => ['', `**${c.question}**`, c.answer]),
  '',
].join('\n');

writeFileSync(out, md);
console.log(`Wrote ${out} (${md.length} chars)`);

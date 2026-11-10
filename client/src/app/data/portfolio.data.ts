import type {
  ChatAnswer,
  Education,
  Job,
  Profile,
  Project,
  RoadmapStep,
  SectionHead,
  SkillGroup,
  Stat,
} from '../models/portfolio.models';

/**
 * Every word on the site lives here. Update this file to change the content;
 * the components only decide how it looks and moves.
 */

export const PROFILE: Profile = {
  name: 'Gowri Shankar Duvvu',
  firstName: 'Gowri',
  lastName: 'Shankar.',
  role: 'Software Engineer',
  company: 'datanitiv',
  location: 'Hyderabad',
  email: 'gowrishankarduvvu@gmail.com',
  github: 'https://github.com/GowriShankar004',
  linkedin: 'https://www.linkedin.com/in/gowrishankarduvvu14',
  lede: "I ship enterprise features across the UI and API layers, and I'm now training toward the next layer: AI. I love turning manual work into automated solutions.",
  typedRoles: [
    ['I build', '.NET APIs and Angular apps'],
    ['I query', 'SQL until the data makes sense'],
    ['I automate', 'the boring manual work'],
    ["I'm training", 'toward AI development'],
  ],
  heroChips: ['C# · .NET', 'Python', 'Angular', 'LLM agents', 'SQL'],
  marquee: [
    { text: '.NET', strong: true },
    { text: 'C#' },
    { text: 'Angular', strong: true },
    { text: 'TypeScript' },
    { text: 'SQL', strong: true },
    { text: 'REST APIs' },
    { text: 'Python', strong: true },
    { text: 'Django' },
    { text: 'OpenAI agents', strong: true },
    { text: 'Salesforce' },
    { text: 'Power BI' },
    { text: 'Arduino' },
  ],
  manifesto: [
    { text: 'I build enterprise software with' },
    { text: '.NET,', grad: true },
    { text: 'Angular', grad: true },
    { text: 'and' },
    { text: 'SQL,', grad: true },
    { text: "and I turn manual work into automated solutions. Now I'm training for the next layer: software that thinks, as an" },
    { text: 'AI developer.', grad: true },
  ],
};

export const SECTIONS: Record<'about' | 'work' | 'projects' | 'skills' | 'education', SectionHead> = {
  about: {
    id: 'about',
    index: 1,
    eyebrow: 'About',
    title: [{ text: 'Ask my portfolio' }, { text: 'anything.', grad: true }],
    lede: 'Pick a question and the answer streams in, the way an AI assistant would reply.',
  },
  work: {
    id: 'work',
    index: 2,
    eyebrow: 'Experience',
    title: [{ text: 'Five internships. One full-time role.' }],
    lede: 'From networking labs and embedded sensors to enterprise software. Every step added a layer.',
  },
  projects: {
    id: 'projects',
    index: 3,
    eyebrow: 'Projects',
    title: [{ text: "Things I've" }, { text: 'built.', grad: true }],
    lede: 'An AI agent, a website for a paying client, an embedded safety system, a data analysis of a national election, and the web apps where it all started.',
  },
  skills: {
    id: 'skills',
    index: 4,
    eyebrow: 'Skills',
    title: [{ text: 'The stack today.' }],
    lede: 'Strong on enterprise web development, growing fast in Python and AI.',
  },
  education: {
    id: 'education',
    index: 5,
    eyebrow: 'Education',
    title: [{ text: 'Where it started.' }],
    lede: 'An engineering path in electrical, electronics and communications, from diploma to degree.',
  },
};

export const STATS: Stat[] = [
  { value: 5, label: 'Internships before going full-time' },
  { value: 7, label: 'Projects built, from AI agents to IoT' },
  { value: 2, label: 'Engineering qualifications, B.Tech and Diploma' },
  { value: 2020, label: 'First tech internship, with Cisco' },
];

export const CHAT: ChatAnswer[] = [
  {
    key: 'who',
    question: 'Who is Gowri?',
    answer:
      "I'm Gowri Shankar Duvvu, a Software Engineer at datanitiv in Hyderabad. I work across the UI and API layers of enterprise applications with .NET, C#, Angular and SQL, building features, fixing defects and integrating APIs. I started in hardware and networking, moved into software, and now I'm building toward AI development.",
  },
  {
    key: 'stack',
    question: "What's your stack?",
    answer:
      'Backend: .NET, C# and REST APIs. Frontend: Angular, TypeScript, JavaScript, HTML and CSS. Data: SQL, PL/SQL, database design and Power BI. On the side: Python and Django, Salesforce (Apex and Visualforce), Arduino C/C++ and Git for everything.',
  },
  {
    key: 'ai',
    question: 'Why AI?',
    answer:
      "Because the most useful software is starting to think. I've already built an agent with OpenAI function calling that reads files, summarises them and writes results back through an async message broker. Next on my roadmap: retrieval-augmented generation, ML fundamentals, and bringing AI features into the .NET and Angular products I already build.",
  },
  {
    key: 'journey',
    question: 'Your journey?',
    answer:
      'Cisco Networking Academy in 2020, a diploma and a B.Tech in electronics and communications, then Salesforce development, frontend work at SmartInternz, an embedded driver-safety system at HMI Engineering, and an internship at datanitiv that turned into a full-time Software Engineer role in 2026.',
  },
  {
    key: 'hire',
    question: 'Can we work together?',
    answer:
      "Yes. I'm open to collaborating on full-stack and AI projects. The fastest way to reach me is email at gowrishankarduvvu@gmail.com, or connect with me on LinkedIn. Scroll to the bottom for both.",
  },
];

export const JOBS: Job[] = [
  {
    title: 'Software Engineer',
    company: 'datanitiv',
    location: 'Hyderabad',
    start: 'Aug 2026',
    end: 'Present',
    type: 'Full-time',
    current: true,
    highlights: [
      'Build and enhance enterprise applications across UI and API layers with .NET/C# and Angular/TypeScript.',
      'Implement features, fix defects, work with SQL and databases, and integrate APIs.',
      'Ship through Git-based, task-driven workflows alongside the development team.',
    ],
  },
  {
    title: 'Software Development Intern',
    company: 'datanitiv',
    start: 'May 2026',
    end: 'Jul 2026',
    type: 'Internship',
    highlights: [
      'Built and maintained UI components and backend APIs with .NET/C#, Angular and SQL.',
      'Debugged, tested and enhanced features under code review and task tracking.',
      'Learned the full SDLC in a team setting, which led to a full-time offer.',
    ],
  },
  {
    title: 'Software Intern',
    company: 'HMI Engineering Solutions',
    start: 'Dec 2023',
    end: 'Apr 2024',
    type: 'Internship',
    highlights: [
      'Engineered an Arduino Uno control system that monitors driver behaviour and vehicle position in real time.',
      'Detected drowsiness from eye-blink patterns, head movement and posture using IR sensors and accelerometers.',
      'Integrated GPS tracking and GSM alerts that message emergency contacts when danger is detected.',
    ],
  },
  {
    title: 'Frontend Developer Intern',
    company: 'SmartInternz',
    location: 'Visakhapatnam',
    start: 'Aug 2023',
    end: 'Nov 2023',
    type: 'Internship',
    highlights: ['Built responsive web interfaces with HTML, CSS and JavaScript.'],
  },
  {
    title: 'Salesforce Developer Intern',
    company: 'Salesforce',
    start: 'Apr 2023',
    end: 'May 2023',
    type: 'Internship',
    highlights: [
      'Created custom objects, fields, workflows, Apex code and Visualforce pages for business requirements.',
      'Configured automations, validation rules and reports; unit tested and debugged customisations.',
    ],
  },
  {
    title: 'Network Engineer Intern',
    company: 'Cisco Networking Academy',
    start: 'Oct 2020',
    end: 'Apr 2021',
    type: 'Internship',
    highlights: ['Learned networking fundamentals: the first step into tech.'],
  },
];

export const PROJECTS: Project[] = [
  {
    name: 'Coflowence AI Agent',
    kind: 'AI · Featured',
    accent: 'violet',
    size: 'feature',
    url: 'https://github.com/GowriShankar004/Coflowence_ai-agent-project',
    summary:
      'An AI agent built on OpenAI function calling. It reads a file, plans its approach, summarises the content and writes the summary back to disk, with every step streamed through an asynchronous message broker to a colour-coded terminal UI.',
    flow: ['prompt', 'read_from_file()', 'LLM summary', 'write_to_file()'],
    log: [
      { kind: 'prompt', text: 'uv run main.py' },
      { kind: 'step', text: 'read_from_file("function_calling.md")' },
      { kind: 'step', text: 'summarising with the LLM…' },
      { kind: 'step', text: 'write_to_file("function_calling_summary.md")' },
      { kind: 'done', text: 'summary saved · run logged' },
    ],
    details:
      'Debugged the broken tool call so the agent could write its output reliably, with structured logs to trace every function call.',
    tags: ['Python 3.12', 'OpenAI API', 'Function calling', 'Async broker', 'uv'],
  },
  {
    name: 'Wedding Invitation Website',
    kind: 'Freelance · Client project',
    accent: 'coral',
    size: 'client',
    summary:
      'A digital wedding invitation built for a client. Guests tap to open it, then scroll through the muhurtham details, a live countdown, a photo gallery, dinner plans and the venue map. Mobile-first, with soft motion throughout.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vercel'],
    links: [
      { label: 'View live site', url: 'https://sandeep-jhansi.vercel.app/', primary: true },
      { label: 'Code', url: 'https://github.com/GowriShankar004/Sandeep-Jhansi' },
    ],
    image: {
      src: 'images/wedding-invitation.jpg',
      alt: 'Opening screen of the wedding invitation website',
      width: 800,
      height: 608,
    },
  },
  {
    name: 'Safe Drive Guardian',
    kind: 'Embedded · IoT',
    accent: 'coral',
    size: 'regular',
    url: 'https://github.com/GowriShankar004/Safe-Drive-Gaurdian-Project',
    summary:
      'Detects alcohol (MQ-3) and drowsiness (eye-blink IR) in real time, then sends GSM alerts with live GPS location.',
    tags: ['Arduino UNO', 'C/C++', 'GPS', 'GSM'],
  },
  {
    name: 'Election Results 2024',
    kind: 'Data · Analytics',
    accent: 'mint',
    size: 'regular',
    url: 'https://github.com/GowriShankar004/SQL-Project',
    summary:
      'SQL analysis of party-wise, state-wise and constituency-wise results, visualised in a Power BI dashboard.',
    tags: ['SQL', 'Power BI', 'Excel'],
  },
  {
    name: 'E-Commerce Website',
    kind: 'Web · Frontend',
    accent: 'mint',
    size: 'wide',
    url: 'https://github.com/GowriShankar004/E-Commerce-Website',
    summary: 'A multi-page store with login, product listings with image zoom, cart, payment and contact pages.',
    tags: ['HTML', 'CSS', 'JavaScript', 'jQuery'],
  },
  {
    name: 'Online Store with Checkout',
    kind: 'Web · Full stack',
    accent: 'coral',
    size: 'wide',
    url: 'https://github.com/GowriShankar004/HTML-SQL-CSS-JS-project',
    summary: 'A storefront with cart, checkout and order pages, backed by SQL for product and order data.',
    tags: ['HTML', 'CSS', 'JavaScript', 'SQL'],
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    name: 'Backend',
    color: 'var(--mint)',
    skills: [
      { name: '.NET', logo: 'dotnetcore' },
      { name: 'C#', logo: 'csharp' },
      { name: 'REST APIs', glyph: 'api' },
      { name: 'Node.js', logo: 'nodejs' },
      { name: 'MailKit / SMTP', glyph: 'mail' },
    ],
  },
  {
    name: 'Frontend',
    color: 'var(--violet)',
    skills: [
      { name: 'Angular', logo: 'angular' },
      { name: 'TypeScript', logo: 'typescript' },
      { name: 'JavaScript', logo: 'javascript' },
      { name: 'HTML', logo: 'html5' },
      { name: 'CSS', logo: 'css3' },
    ],
  },
  {
    name: 'Data',
    color: 'var(--coral)',
    skills: [
      { name: 'SQL Server', logo: 'microsoftsqlserver' },
      { name: 'PL/SQL', logo: 'oracle' },
      { name: 'Database design', glyph: 'db' },
      { name: 'Joins and queries', glyph: 'join' },
      { name: 'Power BI', glyph: 'chart' },
    ],
  },
  {
    name: 'AI and Python',
    color: 'var(--violet)',
    skills: [
      { name: 'Python', logo: 'python' },
      { name: 'Django', logo: 'django', invertInDark: true },
      { name: 'OpenAI API', glyph: 'spark' },
      { name: 'Function calling', glyph: 'fn' },
      { name: 'Automation', glyph: 'bolt' },
    ],
  },
  {
    name: 'Platforms and tools',
    color: 'var(--faint)',
    skills: [
      { name: 'Git', logo: 'git' },
      { name: 'GitHub', logo: 'github', invertInDark: true },
      { name: 'Salesforce (Apex)', logo: 'salesforce' },
      { name: 'Arduino', logo: 'arduino' },
      { name: 'Microsoft Office', glyph: 'doc' },
    ],
  },
];

export const ROADMAP: RoadmapStep[] = [
  { state: 'done', label: 'Done', title: 'Full-stack foundation', text: '.NET, Angular and SQL in production at datanitiv.' },
  { state: 'now', label: 'Now', title: 'Python and LLM agents', text: 'OpenAI function calling, tool use and automation in Python.' },
  { state: 'next', label: 'Next', title: 'RAG and ML basics', text: 'Retrieval, embeddings and machine-learning fundamentals.' },
  { state: 'goal', label: 'Goal', title: 'AI developer', text: 'Building AI features into scalable products end to end.' },
];

export const EDUCATION: Education[] = [
  {
    years: '2021 – 2025',
    title: 'Bachelor of Technology',
    field: 'Electrical, Electronics and Communications Engineering',
    school: 'Visakha Institute of Engineering and Technology, Visakhapatnam',
  },
  {
    years: '2018 – 2021',
    title: 'Polytechnic Diploma',
    field: 'Electrical, Electronics and Communications Engineering',
    school: 'Govt. Polytechnic College, Pendurthi',
  },
  {
    years: '2012 – 2018',
    title: 'Schooling',
    field: 'Secondary education',
    school: 'Gloria English Medium School',
  },
];

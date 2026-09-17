/**
 * Every piece of page copy, imported by the components that render it and by the
 * terminal API. Short interface labels (tooltips, dialog titles) stay beside the
 * markup they label.
 */
export const SITE = {
  name: 'David Koen',
  title: 'David Koen',
  tagline: 'Tech Enthusiast',
  description:
    'Digital Project Manager and Web Developer based in South Africa. In web since 2017, pairing hands-on frontend and backend development with sprint planning, scope and estimation, and delivery ownership from brief through launch.',
  locale: 'en_ZA',
  location: 'South Africa',
} as const;

export const REPO_URL = 'https://github.com/TheDavidKoen/temp-site';

export const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
] as const;

export const SOCIAL_LINKS = [
  { href: 'https://github.com/TheDavidKoen', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/davidkoen/', label: 'LinkedIn' },
  { href: 'https://codepen.io/codepen-bragi', label: 'CodePen' },
] as const;

export const INTRO = {
  lede: 'I lead delivery without losing the technical thread. I translate between marketing, design and engineering, and I plan work in stages across a project’s full scope.',
  primary: { href: '#experience', label: 'View experience' },
  secondary: { href: '#contact', label: 'How I fit in' },
} as const;

export const ABOUT = {
  lead: 'Most projects don’t fail on code. They fail on the handoffs, the brief that lost a requirement, the estimate nobody stress-tested, the dependency nobody flagged until it blocked three people.',
  body: 'I’ve spent years on the building side of those handoffs: agency client work, in-house maintenance cycles, internal frameworks, and a year teaching developers how to structure work they hadn’t met yet. That background means I can read an engineering estimate, ask the question that surfaces the hidden dependency, and explain the answer to a marketing stakeholder without either side losing the thread.',
  facts: [
    { label: 'Based in', value: SITE.location },
    { label: 'Currently', value: 'Web Developer Lead' },
    { label: 'Professionally in web since', value: '2017' },
  ],
} as const;

export const MARQUEE_PHRASES = [
  SITE.tagline,
  'Coffee Lover',
  'JRR Tolkien Nerd',
  'Book Worm',
  'Cinema Junkie',
  'YNWA',
] as const;

export const INTRO_FIELD = [
  'AGILE',
  'PLANNING',
  'SCOPE',
  'ESTIMATION',
  'ROADMAP',
  'DEADLINE',
  'COLLABORATION',
  'BRIEF',
  'LAUNCH',
  'SUPPORT',
  'DELIVERY',
  'CADENCE',
  'HANDOFF',
  'CODE',
  'REVIEW',
  'GIT',
  'BRANCHING',
  'CI/CD',
  'DEPLOYMENT',
  'QA',
  'TESTING',
  'SPA',
  'SSR',
  'COMPONENTS',
  'RESPONSIVE',
  'DESIGN',
  'SYSTEMS',
  'SEO',
  'PERFORMANCE',
  'REST',
  'API',
  'FLUX',
  'AUTH',
  'ACCESS',
  'SQL',
  'NOSQL',
  'DATABASE',
  'SPRING',
  'DJANGO',
  'NODE',
  'WORDPRESS',
  'THEMES',
  'PLUGINS',
  'FRONTEND',
  'BACKEND',
  'ARCHITECTURE',
  'MAINTENANCE',
  'MARKETING',
  'DESIGNERS',
  'ENGINEERS',
  'TRAINING',
  'MENTORING',
] as const;

export const SKILL_GROUPS = [
  {
    title: 'Delivery & process',
    items: [
      'Agile delivery and sprint planning',
      'Scope definition and estimation',
      'Roadmap and release ownership',
      'Risk, dependency and blocker tracking',
      'Cross-functional stakeholder management',
    ],
  },
  {
    title: 'Engineering practice',
    items: [
      'Peer code review and pull request workflow',
      'Git branching and merge strategy',
      'CI/CD pipelines and automated deployment',
      'Automated and manual QA',
      'Technical documentation and decision records',
    ],
  },
  {
    title: 'Frontend architecture',
    items: [
      'SPA, SSR and static site generation',
      'Component-driven architecture',
      'Responsive design systems',
      'SEO, Core Web Vitals and performance budgets',
      'Unidirectional data flow (Flux)',
    ],
  },
  {
    title: 'Backend & data',
    items: [
      'RESTful API design',
      'Authentication, sessions and access control',
      'SQL and NoSQL data modelling',
      'Serverless and edge runtimes',
    ],
  },
] as const;

export const EXPERIENCE_NARRATIVE = [
  'I began my career in web and software development in 2017, starting as a WordPress Developer Intern. Since then, I have worked in a variety of roles, including as a Coding Facilitator position, teaching foundational coding and computer literacy skills to both professionals and aspiring professionals.',
  'I have a strong interest in the continually evolving technology and software ecosystem. This has driven me to build a professional network that keeps me informed of emerging trends and industry best practices.',
  'Through this experience, I have developed a solid understanding of what it takes to build functional digital products and services, along with the ability to translate that technical knowledge for non-technical stakeholders and to lead productive discussions with cross-functional teams.',
  'As AI-driven tools continue to reshape how consumers and professionals work, I’ve embraced this shift while remaining committed to continuous skill development, so that I stay among those directing this technological transformation rather than merely riding its wave.',
] as const;

export const WORK = {
  lead: 'Through the years I have planned, developed, deployed and maintained countless web-related products. As someone who has a personal passion for art in its many mediums, I find it fascinating and exciting to hone an individual’s identity into their production.',
  body: 'Below should hopefully give an idea of my work.',
  repoLabel: 'GitHub',
  liveLabel: 'View project',
  pendingNote: 'Still in the pipeline. Watch this space for developments.',
} as const;

/* slug names the logo pair in src/assets/work. A project without live shows
   WORK.pendingNote in place of a link. */
interface Project {
  readonly slug: string;
  readonly name: string;
  readonly description: readonly string[];
  readonly repo: string;
  readonly live?: string;
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'missed-mix',
    name: 'Missed Mix',
    description: [
      'Missed Mix is an idea for a music application that encourages people to meet through nothing more, or less, than one another’s music taste.',
      'The Spotify Web API supplies the catalogue, so a profile is built from real songs, artists and albums. From there a server-side state machine, held in MongoDB and gated by signed sessions, keeps the messaging portal between two accounts sealed until both have made the handshake.',
    ],
    repo: 'https://github.com/TheDavidKoen/missed-mix',
    live: 'https://missed-mix.pages.dev/',
  },
  {
    slug: 'vanesse',
    name: 'Vanessë',
    description: [
      'Vanessë is a custom, open-source VS Code theme that uses beautiful colour tones to make an IDE that is relaxing to work with.',
      'Its lemon, lime, violet and blue tones sit on a deep night sky, with 82 matching file icons. Every colour is generated from TypeScript and tested against WCAG AA contrast in CI, so the palette stays easy on the eyes through longer code sprints.',
    ],
    repo: 'https://github.com/TheDavidKoen/vanesse',
    live: 'https://open-vsx.org/extension/davidkoen/vanesse',
  },
  {
    slug: 'deadwax',
    name: 'Deadwax',
    description: [
      'Deadwax is an idea for an agentic music librarian built with LangChain and Google Gemini. It answers natural-language questions about a personal listening history and assembles playlists against hard constraints.',
      'It is still a work in progress, and the vision is a platform that builds playlists for users based on their prompts.',
    ],
    repo: 'https://github.com/TheDavidKoen/deadwax',
  },
];

const EMAIL = 'DavidoDawie@gmail.com';

export const CONTACT = {
  email: EMAIL,
  mailto: `mailto:${EMAIL}?subject=${encodeURIComponent('DK Contact')}`,
  heading: 'Looking for someone who can hold both sides of the brief',
  body: 'I bring a strong working knowledge of the requirements and standards needed to deliver a digital product with industry-competitive, technically sound UX. Whether you already have a clear role in mind for me on your project, or you’re looking for guidance on how to get your team or project off the ground, I’d welcome the opportunity to talk through it.',
  cta: 'Let’s get in touch',
} as const;

interface StackEntry {
  readonly layer: string;
  readonly choice: string;
  readonly logo: string;
  readonly why: string;
  readonly adr?: string;
}

export const STACK: readonly StackEntry[] = [
  {
    layer: 'Framework',
    choice: 'Astro',
    logo: '/astro.svg',
    why: 'Every page is prerendered to static HTML at build time, with almost no JavaScript attached. That is what keeps it quick on a weak connection.',
    adr: '0001-astro-over-nextjs',
  },
  {
    layer: 'Styling',
    choice: 'Tailwind CSS',
    logo: '/tailwindcss.svg',
    why: 'The styling framework I build with. Utility-first, popular, well documented, and flexible.',
    adr: '0004-tailwind-v4-without-sass',
  },
  {
    layer: 'Motion',
    choice: 'CSS animation',
    logo: '/css.svg',
    why: 'Scroll-driven animations written in plain CSS rather than pulled in from a library. They run off the main thread, so scrolling stays smooth and there is nothing extra to download.',
    adr: '0007-css-scroll-animations-over-gsap',
  },
  {
    layer: '3D',
    choice: 'Three.js',
    logo: '/threedotjs.svg',
    why: 'Renders the WebGL scenes. Lazy loaded only once you scroll near it, and skipped entirely on low-memory devices or when reduced motion is set.',
  },
  {
    layer: 'API',
    choice: 'Cloudflare Functions',
    logo: '/cloudflarepages.svg',
    why: 'Serverless functions at the edge, powering the terminal behind the other button up there. Nothing to provision, nothing to keep alive. It answers your own terminal too: curl "https://davidkoen.is-a.dev/api/cli?cmd=whoami" reads this same CV.',
    adr: '0011-signed-session-tokens',
  },
  {
    layer: 'Hosting',
    choice: 'Cloudflare Pages',
    logo: '/cloudflarepages.svg',
    why: 'Static hosting on Cloudflare’s CDN. Assets serve from whichever edge location is nearest, so load times hold up wherever the site is opened from.',
    adr: '0002-cloudflare-pages-over-workers',
  },
  {
    layer: 'Language',
    choice: 'TypeScript',
    logo: '/typescript.svg',
    why: 'Everything here is written in TypeScript. Static types catch a whole class of mistakes at build time rather than in production.',
    adr: '0006-pin-typescript-6',
  },
  {
    layer: 'Quality gates',
    choice: 'Automated checks',
    logo: '/lighthouse.svg',
    why: 'Every pull request runs CI before it can merge: formatting, type checks, a Lighthouse audit, and a performance budget that fails the build if the critical path grows past 50 KB.',
  },
];

export const TOOLS = [
  { name: 'Git', logo: '/git.svg' },
  { name: 'GitHub Actions', logo: '/githubactions.svg' },
  { name: 'Docker', logo: '/docker.svg' },
  { name: 'Cloudflare', logo: '/cloudflare.svg' },
  { name: 'PostgreSQL', logo: '/postgresql.svg' },
  { name: 'MongoDB Atlas', logo: '/mongodb.svg' },
  { name: 'Firebase', logo: '/firebase.svg' },
  { name: 'Postman', logo: '/postman.svg' },
  { name: 'Lighthouse CI', logo: '/lighthouse.svg' },
  { name: 'Figma', logo: '/figma.svg' },
  { name: 'Jira', logo: '/jira.svg' },
  { name: 'Monday.com', logo: '/monday.svg' },
  { name: 'Slack', logo: '/slack.svg' },
] as const;

export const HERO_QUOTE = {
  text: 'He that breaks a thing to find out what it is has left the path of wisdom.',
  attribution: 'Gandalf the Grey',
} as const;

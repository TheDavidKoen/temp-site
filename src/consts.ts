/**
 * Every piece of site content. Components read from here and never hardcode copy.
 */
export const SITE = {
  name: 'David Koen',
  title: 'David Koen',
  description:
    'Digital Project Manager and Web Developer based in South Africa. In web since 2017, pairing hands-on frontend and backend development with sprint planning, scope and estimation, and delivery ownership from brief through launch.',
  locale: 'en_ZA',
  location: 'South Africa',
} as const;

export const CONTACT_EMAIL = 'DavidoDawie@gmail.com';
const CONTACT_SUBJECT = 'DK Contact';
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`;

export const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
] as const;

export const SOCIAL_LINKS = [
  { href: 'https://github.com/TheDavidKoen', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/davidkoen/', label: 'LinkedIn' },
  { href: 'https://codepen.io/codepen-bragi', label: 'CodePen' },
] as const;

export const MARQUEE_PHRASES = [
  'Tech Enthusiast',
  'Coffee Lover',
  'JRR Tolkien Nerd',
  'Book Reader',
  'Cinema Junkie',
  'YNWA',
] as const;

export const INTRO_FIELD = [
  'AGILE',
  'SPRINT',
  'PLANNING',
  'SCOPE',
  'ESTIMATION',
  'ROADMAP',
  'DEADLINE',
  'OWNERSHIP',
  'STAKEHOLDER',
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
  'DOCUMENTATION',
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
  'STANDARDS',
  'TICKETING',
  'REMOTE',
  'JOHANNESBURG',
  'CAPE TOWN',
  'SINCE 2017',
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
      'WCAG accessibility standards',
    ],
  },
  {
    title: 'Backend & data',
    items: [
      'RESTful API design',
      'Unidirectional data flow (Flux)',
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
    why: 'Renders the WebGL scenes in the hero and the ghost further down the page. Lazy loaded only once you scroll near it, and skipped entirely on low-memory devices or when reduced motion is set.',
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

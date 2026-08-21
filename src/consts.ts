export const SITE = {
  name: 'David Koen',
  title: 'David Koen — Digital Project Manager & Web Developer',
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

/* Rendered in DOM order into a wrapped flex row, which reads top-left to
   bottom-right — the intro's index-based stagger relies on that to produce its
   reading-order sweep. Reordering this array reorders the sweep. */
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
    title: 'Delivery & stakeholders',
    items: [
      'Agile sprint planning',
      'Scope and estimation',
      'Roadmap and deadline ownership',
      'Cross-functional collaboration',
    ],
  },
  {
    title: 'Engineering practice',
    items: [
      'Peer code review',
      'Git branching strategy',
      'CI/CD deployment',
      'Automated and manual QA',
      'Technical documentation',
    ],
  },
  {
    title: 'Frontend architecture',
    items: [
      'SPA and SSR',
      'Component-based design',
      'Responsive design systems',
      'SEO and performance optimisation',
    ],
  },
  {
    title: 'Backend & data',
    items: [
      'RESTful API design',
      'Unidirectional data flow (Flux)',
      'Authentication and access control',
      'SQL and NoSQL database management',
    ],
  },
] as const;

export const EXPERIENCE_NARRATIVE = [
  'I began my career in web and software development in 2017, starting as a WordPress Developer Intern. Since then, I have worked in a variety of roles, including as a Coding Facilitator position, teaching foundational coding and computer literacy skills to both professionals and aspiring professionals.',
  'I have a strong interest in the continually evolving technology and software ecosystem. This has driven me to build a professional network that keeps me informed of emerging trends and industry best practices.',
  'Through this experience, I have developed a solid understanding of what it takes to build functional digital products and services, along with the ability to translate that technical knowledge for non-technical stakeholders and to lead productive discussions with cross-functional teams.',
  'As AI-driven tools continue to reshape how consumers and professionals work, I’ve embraced this shift while remaining committed to continuous skill development, so that I stay among those directing this technological transformation rather than merely riding its wave.',
] as const;

export const SITE = {
  name: 'David Koen',
  title: 'David Koen — Digital Project Manager & Web Developer',
  description:
    'Web professional since 2017, bridging development and delivery. Frontend architecture, technical documentation, and project ownership from brief through launch.',
  locale: 'en_ZA',
  location: 'South Africa',
} as const;

export const CONTACT_EMAIL = 'CHANGE-ME@example.com';

export const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
] as const;

export const SOCIAL_LINKS = [
  { href: 'https://github.com/TheDavidKoen', label: 'GitHub' },
  { href: 'https://linkedin.com/in/CHANGE-ME', label: 'LinkedIn' },
  { href: 'https://codepen.io/CHANGE-ME', label: 'CodePen' },
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

/* Delivery leads the list deliberately: the audience is hiring managers for
   project-management roles, not engineering leads. */
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

export const EXPERIENCE = [
  {
    role: 'Web Developer Lead',
    company: 'Lyons Presentation Group',
    location: 'Remote',
    period: '08/2025 — Present',
    summary:
      'Lead web development alongside designers and marketers, building custom CMS themes and plugins and ensuring solid SEO, from brief through launch and ongoing support.',
  },
  {
    role: 'Code Trainer & Facilitator',
    company: 'Code College ZA',
    location: 'Johannesburg',
    period: '01/2025 — 08/2025',
    summary:
      'Taught aspiring developers through hands-on development work, structuring complex material into workable lessons, reviewing their code and holding the group to professional standards.',
  },
  {
    role: 'Software Engineer Intern',
    company: 'Compuways',
    location: 'Johannesburg',
    period: '01/2024 — 12/2024',
    summary:
      'Maintained internal frameworks in Spring, Django and Node.js, coordinating with the team via GitHub and Discord.',
  },
  {
    role: 'Web Developer',
    company: 'WebsiteDesign.co.za',
    location: 'Remote',
    period: '10/2021 — 11/2022',
    summary:
      'Delivered and maintained client sites in an agency, where team fluidity and deadline planning were vital, turning design handoffs into reliable, responsive builds.',
  },
  {
    role: 'Web Developer',
    company: 'Profloat',
    location: 'Cape Town',
    period: '03/2020 — 07/2021',
    summary:
      'Kept the company web presence dependable through planned maintenance cycles, working closely with marketers and IT staff, and extending the same standard to sister companies.',
  },
  {
    role: 'Web Developer Intern',
    company: 'Inkfish',
    location: 'Remote',
    period: '09/2019 — 03/2020',
    summary:
      'Learned to develop, host and keep websites competitive with SEO, working inside a professional ticketing and time-logging system.',
  },
] as const;

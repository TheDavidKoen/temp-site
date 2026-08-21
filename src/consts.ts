export const SITE = {
  name: 'David Koen',
  title: 'David Koen — Digital Project Manager & Web Developer',
  description:
    'Web professional since 2017, bridging development and delivery. Frontend architecture, technical documentation, and project ownership from brief through launch.',
  locale: 'en_ZA',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const SOCIAL_LINKS = [
  { href: 'https://github.com/TheDavidKoen', label: 'GitHub' },
  { href: 'https://linkedin.com/in/CHANGE-ME', label: 'LinkedIn' },
  { href: 'https://codepen.io/CHANGE-ME', label: 'CodePen' },
] as const;

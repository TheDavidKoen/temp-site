# Changelog

All notable changes to this site are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-09-21

### Added

- The single-page portfolio: hero, introduction, about, skills, experience, work and contact
- The Work section: project cards that expand to a description and links, beside a pinned introduction
- A terminal at `/api/cli` that serves the CV to the page, to `curl` and as JSON, with a deduction game behind signed session cookies
- Lazy-loaded Three.js scenes beside the introduction and the contact section
- Scroll-driven animation in native CSS
- Dark mode, saved per browser and switched with a pixel dissolve
- A tech stack sheet with the reasoning and decision record behind each choice
- Security headers with a hash-based Content Security Policy, generated on every build
- CI with type checks, Biome, a performance budget, a dependency audit and Lighthouse, plus tagged GitHub releases

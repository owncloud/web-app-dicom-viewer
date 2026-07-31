# agents.md — web-app-dicom-viewer

## Repository Overview

An ownCloud Web extension for previewing DICOM medical images and metadata in the browser. Built on cornerstone3D, it provides image manipulation tools (zoom, rotate, flip, invert) and responsive metadata display.

- **Classification:** oCIS
- **Activity Status:** Active
- **License:** AGPL-3.0
- **Language:** TypeScript, Vue.js

## Architecture & Key Paths

- `src/` — Extension source code (Vue components, TypeScript logic)
- `public/` — Static assets
- `tests/` — Unit tests (Vitest) and e2e tests (Cucumber/Playwright)
- `docker/` — Docker configuration
- `dev/` — Development environment configuration
- `l10n/` — Localization files
- `Dockerfile` — Container image for the extension
- `package.json` — Dependencies and scripts
- `vite.config.ts` — Vite build configuration
- `vitest.config.ts` — Vitest test configuration
- `docker-compose.yml` — Development environment with oCIS
- `dicom-viewer.yml` — Deployment config for oCIS deployment examples
- `extension.d.ts` — TypeScript type definitions

## Development Conventions

- TypeScript/Vue.js with Vite build tooling
- Prettier for code formatting
- Issue and PR templates available
- Docker Compose for local development
- SonarCloud for quality analysis

## Build & Test Commands

```bash
pnpm install                # Install dependencies
pnpm build                  # Production build
pnpm build:w                # Build with watch (development)
pnpm build:prod             # Production build with PRODUCTION flag
pnpm test                   # Run unit tests (Vitest)
pnpm coverage               # Run tests with coverage report
pnpm lint                   # Run ESLint
pnpm test:e2e               # Run e2e tests (Cucumber)
docker compose up           # Start development oCIS server
```

## Important Constraints

- **AGPL-3.0 copyleft license:** The OSPO Apache 2.0 migration requires auditing this copyleft license.
- **cornerstone3D dependency:** Image rendering uses the MIT-licensed cornerstone3D library.
- **oCIS version requirements:** Requires oCIS >= 6.2.x and Web >= 9.x.x.
- **Architecture support:** Docker images only support `amd64`.
- **Docker image:** Published as `registry.owncloud.com/internal/web-app-dicom-viewer`.


## OSPO Policy Constraints

### GitHub Actions
- **Only** use actions owned by `owncloud`, created by GitHub (`actions/*`), verified on the GitHub Marketplace, or verified by the ownCloud Maintainers.
- Pin all actions to their full commit SHA (not tags): `uses: actions/checkout@<SHA> # vX.Y.Z`
- Never introduce actions from unverified third parties.

### Dependency Management
- Dependabot is configured for automated dependency updates.
- Review and merge Dependabot PRs as part of regular maintenance.
- Do not introduce new dependencies without discussion in an issue first.

### Git Workflow
- **Rebase policy**: Always rebase; never create merge commits. Use `git pull --rebase` and `git rebase` before pushing.
- **Signed commits**: All commits **must** be PGP/GPG signed (`git commit -S -s`).
- **DCO sign-off**: Every commit needs a `Signed-off-by` line (`git commit -s`).
- **Conventional Commits & Squash Merge**: Use the [Conventional Commits](https://www.conventionalcommits.org/) format where the repository enforces it. Many repos use squash merge, where the PR title becomes the commit message on the default branch — apply Conventional Commits format to PR titles as well. A reusable GitHub Actions workflow enforces this.

## Context for AI Agents

- This is an oCIS Web extension, not an OC10 app.
- The `src/` directory contains Vue components for DICOM rendering and metadata display.
- The `dicom-viewer.yml` file is the deployment configuration for oCIS deployment examples.
- Development requires Docker Compose for the oCIS backend.
- The extension registers as a file handler for `.dcm` files and related MIME types.

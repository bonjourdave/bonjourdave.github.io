# Requirements Document

## Introduction

A static personal portfolio landing page for an ML/AI professional on GitHub. The site serves as a first-impression hub for recruiters, collaborators, and link-share recipients. It displays a personal bio and a curated gallery of GitHub repositories, fetched from the GitHub API at build time and deployed automatically to GitHub Pages on every push to `main`.

The system subject used throughout this document is **Portfolio Site**.

---

## Requirements

### Requirement 1: Bio Section

**Objective:** As a visitor, I want to read a brief bio of the portfolio owner, so that I can quickly understand who they are and their professional focus.

#### Acceptance Criteria

1. The Portfolio Site shall render a bio section on the landing page containing the owner's name, a short professional summary (ML/AI focus), and any relevant contact or social links.
2. The Portfolio Site shall display a profile picture at the top of the bio section, fetched from the GitHub API (`avatar_url`) at build time.
3. If a profile picture cannot be fetched, the Portfolio Site shall render a fallback placeholder in place of the image without breaking the layout.
4. The Portfolio Site shall display the bio section above the project gallery so that visitors encounter it first.
5. The Portfolio Site shall render the bio content as static HTML — no client-side data fetching is required for this section.
6. When a social/contact link is present in the bio, the Portfolio Site shall render it as an accessible anchor element opening in a new tab with `rel="noopener noreferrer"`.

---

### Requirement 2: Project Gallery

**Objective:** As a visitor, I want to browse a gallery of the owner's GitHub projects with thumbnails, descriptions, and links, so that I can quickly assess their work and navigate to repos of interest.

#### Acceptance Criteria

1. The Portfolio Site shall render a project gallery section containing one card per featured repository.
2. The Portfolio Site shall display each project card with at minimum: the repository name, a short description, the primary language, and a direct link to the repository on GitHub.
3. Where a repository has a social preview image (Open Graph image) available, the Portfolio Site shall display it as a thumbnail on the project card.
4. If a repository has no description, the Portfolio Site shall render a placeholder string (e.g., "No description provided") rather than an empty element.
5. The Portfolio Site shall render repository links as accessible anchor elements that open in a new tab with `rel="noopener noreferrer"`.
6. The Portfolio Site shall display projects in a responsive grid layout that adapts gracefully from mobile (single column) to desktop (multi-column) viewports.

---

### Requirement 3: Build-Time GitHub Data Fetch

**Objective:** As the site owner, I want repository data fetched from the GitHub API at build time, so that the gallery is always current without requiring client-side API calls or exposing secrets.

#### Acceptance Criteria

1. When the build process runs, the Portfolio Site build system shall fetch the owner's public repositories from the GitHub REST API using the `GITHUB_PAT` environment variable for authentication.
2. The Portfolio Site build system shall read the target GitHub username from the `PUBLIC_GITHUB_USERNAME` environment variable.
3. The Portfolio Site build system shall fetch repository metadata including: name, description, primary language, HTML URL, and Open Graph / social preview image URL.
4. If the GitHub API returns an error during the build, the Portfolio Site build system shall fail the build with a descriptive error message rather than producing a silently empty gallery.
5. The Portfolio Site shall never expose the `GITHUB_PAT` value in any rendered HTML, JavaScript bundle, or client-accessible resource.
6. While the build is running, the Portfolio Site build system shall respect GitHub API rate limits by using authenticated requests (authenticated requests receive a higher rate limit than anonymous ones).

---

### Requirement 4: Performance and Static Delivery

**Objective:** As a visitor, I want the page to load quickly with no unnecessary JavaScript, so that I get a fast, accessible experience regardless of device or connection speed.

#### Acceptance Criteria

1. The Portfolio Site shall be delivered as pre-rendered static HTML with no client-side JavaScript required for initial render or core content display.
2. The Portfolio Site shall achieve a Lighthouse Performance score of 90 or above on desktop.
3. The Portfolio Site shall ship zero JavaScript to the browser for components that have no interactivity requirement.
4. The Portfolio Site shall serve all pages with valid, well-formed HTML5.

---

### Requirement 5: Accessibility

**Objective:** As a visitor using assistive technology, I want the portfolio to be navigable and understandable, so that the content is accessible to all users.

#### Acceptance Criteria

1. The Portfolio Site shall include a descriptive `<title>` element and `<meta name="description">` tag on the index page.
2. The Portfolio Site shall use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`) to structure content.
3. The Portfolio Site shall provide meaningful `alt` text for all images, including project thumbnails.
4. The Portfolio Site shall achieve a Lighthouse Accessibility score of 90 or above.
5. The Portfolio Site shall be keyboard-navigable: all interactive elements (links, buttons) are reachable and operable via keyboard alone.

---

### Requirement 6: Responsive Design and Visual Presentation

**Objective:** As a visitor on any device, I want the site to look polished and professional in any lighting environment, so that it reflects well on the portfolio owner.

#### Acceptance Criteria

1. The Portfolio Site shall be fully responsive, rendering correctly on viewport widths from 320 px (mobile) to 1440 px (wide desktop).
2. The Portfolio Site shall include a `<meta name="viewport">` tag set to `width=device-width, initial-scale=1` to ensure correct scaling on mobile browsers.
3. The Portfolio Site shall use touch-friendly tap targets (minimum 44 × 44 px) for all interactive elements on mobile viewports.
4. The Portfolio Site shall support dark mode: when the visitor's OS/browser preference is `prefers-color-scheme: dark`, the Portfolio Site shall render an alternative dark color palette automatically.
5. When the visitor's OS/browser preference is `prefers-color-scheme: light` (or no preference is set), the Portfolio Site shall render the default light color palette.
6. The Portfolio Site shall apply a consistent visual design using Tailwind CSS utility classes throughout, using Tailwind's `dark:` variant for dark-mode overrides.
7. The Portfolio Site shall include a favicon.
8. Where an Open Graph meta image is configured, the Portfolio Site shall include appropriate `<meta property="og:*">` tags so that link previews render correctly on social platforms and messaging apps.

---

### Requirement 7: Build and Deployment Pipeline

**Objective:** As the site owner, I want the site to build and deploy automatically on every push to `main`, so that the portfolio is always up to date without manual intervention.

#### Acceptance Criteria

1. When a commit is pushed to the `main` branch, the CI/CD workflow shall trigger an automated build and deploy to GitHub Pages.
2. The Portfolio Site build system shall use `npm ci` for dependency installation to ensure reproducible builds.
3. When the build produces output in the `dist/` directory, the CI/CD workflow shall deploy that directory to GitHub Pages.
4. If the `npm run build` command exits with a non-zero code, the CI/CD workflow shall fail and not deploy.
5. The CI/CD workflow shall run `npm audit --audit-level=high --omit=dev` and fail the build if any high-severity vulnerabilities are found in production dependencies.
6. The Portfolio Site build system shall require `GITHUB_PAT` and `PUBLIC_GITHUB_USERNAME` to be available as CI secrets at build time.

# Implementation Plan

## Dependency Map

```
Task 1 (foundation)
  → Task 2 (data utility)   ─ parallel with ─   Task 3 (P) (base layout)
       → Task 4 (P) (bio)   ─ parallel with ─   Task 5 (P) (project card)
                                                  → Task 6 (gallery)
                                                       ↘
                                               Task 7 (page composition)
                                                  → Task 8 (quality verification)
```

---

- [x] 1. Set up the Astro project foundation

- [x] 1.1 Configure Astro with Tailwind CSS v4
  - Wire the `@tailwindcss/vite` plugin into the Astro build configuration (as a Vite plugin, not an Astro integration)
  - Confirm `npm run dev` starts the dev server and `npm run build` completes without errors
  - Verify installed dependencies match the lockfile (`npm ci` should succeed from a clean state)
  - _Requirements: 4.1, 4.3, 6.6_

- [x] 1.2 Create the global styles entry point
  - Add a CSS file that imports Tailwind's base layers with `@import "tailwindcss"`
  - No additional Tailwind config file is needed; dark-mode variants work automatically via `prefers-color-scheme`
  - _Requirements: 6.4, 6.5, 6.6_

- [x] 1.3 Enable TypeScript strict mode
  - Set `strict: true` (or Astro's strictest preset) in the project's TypeScript configuration
  - Ensure the Astro type-checking environment uses strict null checks
  - _Requirements: 4.1_

- [x] 1.4 Add a placeholder favicon
  - Place a favicon file in the static assets directory so the build references a real file rather than a 404
  - _Requirements: 6.7_

---

- [x] 2. Build the GitHub API data utility

- [x] 2.1 Implement user profile fetching
  - Create a build-time function that retrieves the owner's display name, bio, avatar image URL, GitHub profile URL, and optional blog/website URL from the GitHub Users API endpoint
  - Authenticate every request using the PAT passed as an argument; use the `Authorization: Bearer` header format
  - Never include the PAT value in error messages, return values, or logs
  - Throw a descriptive error (including the HTTP status code) if the API returns a non-success response, so the build fails loudly
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 2.2 Implement public repository fetching with filtering and sorting
  - Create a build-time function that retrieves the owner's public repositories, sorted by last-updated date (newest first), requesting up to 100 results per page
  - Filter the response to exclude forked repositories, then cap the final list at 12 entries
  - Map each entry to the fields needed by the project card: name, description, primary language, repository URL, and social preview image URL — all of which may be null except name and URL
  - Throw a descriptive error on any API failure
  - Note: `social_preview_image_url` is not returned by the GitHub REST API repos endpoint; field is set to `null` and will gracefully render text-only cards
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

---

- [x] 3. (P) Create the base layout shell
  _(Can run in parallel with Task 2 — no shared files or data dependency)_

- [x] 3.1 Build the HTML document shell
  - Implement a layout component that wraps page content in a valid HTML5 document structure
  - Include a configurable page title and meta description driven by props
  - Use semantic landmark elements (`<header>`, `<main>`, `<footer>`) for the top-level page regions
  - Import the global stylesheet so Tailwind utilities apply to all pages
  - _Requirements: 4.4, 5.1, 5.2_

- [x] 3.2 Add responsive and social meta configuration
  - Include `<meta name="viewport" content="width=device-width, initial-scale=1">` for correct mobile scaling
  - Add Open Graph meta tags (title, description, image) when an OG image URL prop is provided
  - Link the favicon from the static assets directory
  - _Requirements: 6.2, 6.7, 6.8_

---

- [x] 4. (P) Build the bio section component
  _(Can start after Tasks 2 and 3 complete; runs in parallel with Task 5 — different component files)_

- [x] 4.1 Render the owner's profile picture
  - Display the avatar image from the GitHub API at the top of the bio section
  - Provide a styled background-color placeholder in the same dimensions as a fallback when the image does not load — no JavaScript required
  - Include meaningful alt text (owner name or username)
  - _Requirements: 1.2, 1.3, 5.3_

- [x] 4.2 Render the owner's name, bio summary, and social links
  - Display the owner's display name; fall back to their GitHub username when the display name is null
  - Render the bio text below the name; omit the element if bio is null
  - Display social and contact links as accessible anchor elements that open in a new tab using `target="_blank" rel="noopener noreferrer"`
  - Ensure all link elements meet the minimum 44 × 44 px touch target size on mobile via padding
  - Use Tailwind's `dark:` variant to apply dark-mode-appropriate text and background colors
  - _Requirements: 1.1, 1.4, 1.5, 1.6, 5.2, 5.5, 6.3, 6.4, 6.5, 6.6_

---

- [x] 5. (P) Build the project card component
  _(Can start after Task 2 completes; runs in parallel with Task 4 — different component files)_

- [x] 5.1 Render core card content
  - Display the repository name as the card heading
  - Display the description text; when the description is null, render "No description provided" as a placeholder
  - Display the primary language badge when the language field is non-null; omit it entirely when null
  - Render the repository name/heading as an accessible anchor link pointing to the GitHub repo, opening in a new tab with `rel="noopener noreferrer"`
  - Ensure the clickable area meets the 44 × 44 px minimum touch target on mobile
  - _Requirements: 2.2, 2.4, 2.5, 5.5, 6.3_

- [x] 5.2 Add conditional social preview thumbnail
  - When `social_preview_image_url` is non-null, display it as a thumbnail image above the card content
  - When `social_preview_image_url` is null, render nothing in the thumbnail slot — do not emit a broken `<img>` element
  - Include a meaningful `alt` attribute that identifies the repository
  - Apply dark-mode-aware card background and border colors using Tailwind's `dark:` variant
  - _Requirements: 2.3, 5.3, 6.4, 6.5, 6.6_

---

- [x] 6. Build the project gallery layout
  _(Starts after Task 5 completes)_

- [x] 6.1 Implement the responsive project grid
  - Render one project card per repository entry in a CSS grid
  - Use a single-column layout on mobile (< 640 px), two columns on medium viewports (≥ 640 px), and three columns on wide viewports (≥ 1024 px)
  - Apply dark-mode-compatible section background and spacing using Tailwind's `dark:` variant
  - Accept the filtered, sorted repository list as a prop and iterate to render cards
  - _Requirements: 2.1, 2.6, 6.1, 6.4, 6.6_

---

- [x] 7. Compose the landing page and wire all data
  _(Starts after Tasks 3, 4, and 6 are all complete)_

- [x] 7.1 Fetch GitHub data at build time and pass to components
  - In the page's build-time code, read the GitHub username from `PUBLIC_GITHUB_USERNAME` and the PAT from `GH_PAT` using the Astro environment variable API
  - Call the user profile fetch and repos fetch functions; await both results
  - Pass the profile data to the bio component and the repository list to the gallery component
  - Wrap the full page in the base layout, providing the page title, description, and OG image (use the owner's avatar as the OG image)
  - Verify that `npm run build` completes without errors against the real GitHub API when the environment variables are set
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 4.1, 4.3, 7.1, 7.2, 7.3, 7.4_

- [x] 7.2 Confirm the build output is correct and secure
  - Inspect the rendered HTML in `dist/` and verify the bio section appears above the gallery
  - Confirm the `GH_PAT` value is absent from all output files (HTML, any emitted CSS/JS)
  - Confirm zero JavaScript files are emitted for the main page bundle
  - Confirm all anchor elements use `target="_blank" rel="noopener noreferrer"`
  - _Requirements: 1.4, 3.5, 4.1, 4.3, 5.5_

---

- [ ] 9. Enhance project card presentation
  _(New requirements added post-implementation)_

- [x] 9.1 Add placeholder thumbnail for repos without a social preview image
  - When `social_preview_image_url` is null, render a styled placeholder block in the same 2:1 aspect-ratio slot
  - The placeholder shall display the repository name centred over a subtle background so the card has visual weight matching cards with real thumbnails
  - Apply dark-mode-aware colors using Tailwind's `dark:` variant
  - _Requirements: 2.4_

- [ ] 9.2 Truncate long descriptions to three lines
  - Apply CSS `line-clamp-3` (Tailwind utility) to the description paragraph so all cards share a consistent height
  - No JavaScript required — the truncation is purely presentational via CSS `overflow: hidden` + `-webkit-line-clamp`
  - _Requirements: 2.6_

---

- [ ] 8. Verify quality and accessibility
  _(Starts after Task 7 completes)_

- [x] 8.1 Check responsive behavior and dark mode
  - Preview the built site and verify the layout renders correctly at 320 px, 768 px, and 1440 px viewport widths (single column → two column → three column)
  - Toggle the OS/browser dark mode preference and confirm the color palette switches automatically without a page reload or JavaScript
  - Tab through the entire page with keyboard only and confirm all links and interactive elements are reachable and visually focused
  - _Requirements: 5.5, 6.1, 6.3, 6.4, 6.5_

- [ ]* 8.2 Run Lighthouse audits
  - Run a Lighthouse desktop audit against the production build and confirm Performance score ≥ 90
  - Run a Lighthouse desktop audit and confirm Accessibility score ≥ 90
  - Address any flagged issues (missing alt text, low-contrast colors, missing ARIA labels)
  - _Requirements: 4.2, 5.4_

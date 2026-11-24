<p align="center"><img src="website/logo.svg" width="100" alt="RepoOps logo"></p>

# RepoOps

Policy-governed AI-assisted GitHub repository maintenance, designed for autonomous audits, issue remediation and safe pull requests.

[Project website](https://ankitparekh007.github.io/repoOps/) · [Documentation](https://ankitparekh007.github.io/repoOps/docs/) · [Roadmap](ROADMAP.md) · [Issues](https://github.com/AnkitParekh007/repoOps/issues)

## Current developer preview
- Read-only audit CLI and 15-day scheduled due checks.
- Evidence-backed issue planning and opt-in live publishing.
- Bounded missing-README remediation API.
- OpenAI proposal-only adapter, configured upstream release signals and local feedback log.
- Portfolio CLI and pure merge policy predicate.

General sandboxed coding, independent live review and automatic merging are not yet operational. See [operations](docs/operations.md) for limitations.

## Quick start
Node.js 22+; no package dependencies.

```sh
npm test
npm run audit -- AnkitParekh007/repoOps
node src/portfolio.mjs repoops.example.json
```

Start in observe mode. For private repositories use a scoped read-only GITHUB_TOKEN. Never commit credentials. See [scheduling](docs/scheduling.md), [triage](docs/triage.md) and [ROADMAP.md](ROADMAP.md).

## Support
[Buy me a coffee](https://buymeacoffee.com/ankitparekh) · [GitHub Sponsors](https://github.com/sponsors/AnkitParekh007)

## React project website
The original static website in `website/` is retained for parity tests and rollback. The new React 18 + Vite app lives in `website-react/`; the root maintenance CLI is unchanged.

```sh
cd website-react
npm install
npm run dev
npm run build
npm test
npm run preview
```

Open the local Vite URL under /repoOps/. Production output is `website-react/dist/`. GitHub Actions builds, tests and deploys it to https://ankitparekh007.github.io/repoOps/ using the existing Pages Actions source. The workflow retains its artifact readiness check. The build emits full static HTML for each existing page, a 404 page, robots.txt, sitemap.xml and PNG social preview. To run browser tests, install Chromium with `npx playwright install chromium` and run `npm run test:browser`.

Edit page metadata and the public page registry in `website-react/src/data/site.js`; update page components in `src/pages/`, shared components in `src/components/`, routes in `src/App.jsx`, and search keywords in `src/data/search.js`. For a new page, register its URL and metadata and add a static parity/SEO test. Public routes use clean directory URLs (/features/, /docs/, /about/, /contact/). Legacy .html URLs redirect to the new routes, preserving query strings and documentation fragments. Set VITE_SITE_URL only to a valid HTTPS RepoOps project URL with matching base path. Rollback by reverting the migration PR, restoring the prior static Pages workflow. Dependency versions are pinned directly; generate and commit a package lock before treating installation as fully reproducible.

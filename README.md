<p align="center"><img src="website/logo.svg" width="100" alt="RepoOps logo"></p>

# RepoOps

Policy-governed AI-assisted GitHub repository maintenance, designed for autonomous audits, issue remediation and safe pull requests.

[Project website](https://ankitparekh007.github.io/repoOps/) · [Documentation](https://ankitparekh007.github.io/repoOps/docs.html) · [Roadmap](ROADMAP.md) · [Issues](https://github.com/AnkitParekh007/repoOps/issues)

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

# RepoOps

Policy-governed autonomous GitHub repository maintenance.

## Current implementation: Phase 1
Read-only repository audit CLI, conventional community file checks, stable finding fingerprints, 15-day audit due calculation, fail-closed action policy, and unit tests. This is not yet an autonomous maintainer.

## Run
Requires Node.js 22+; no package dependencies.

```sh
npm test
npm run audit -- AnkitParekh007/repoOps
```

For private repositories, supply a repository-scoped read-only token through GITHUB_TOKEN in your environment. Never commit credentials. Reports are printed to stdout; API errors and truncated trees fail without reporting success.

## Roadmap
1. Read-only foundation
2. Persistent scheduler and deeper scanners
3. Evidence-backed issue triage and deduplication
4. Sandboxed provider adapters and implementation
5. Independent review and policy-controlled merges
6. Trend intelligence and documentation maintenance
7. Learning, dashboard and release readiness

No automated issue creation, code modification, AI execution, scheduling or merging is enabled in Phase 1.

# RepoOps roadmap

RepoOps is a public developer preview. Priorities are ordered by safety and operational dependencies; no release dates are promised.

## Foundation — shipped
- Read-only repository metadata and conventional-file audits, commit-anchored evidence.
- Daily due check for a 15-day audit interval; artifact-backed checkpoints.
- Deterministic issue planning and fingerprint deduplication.
- Opt-in issue publishing, bounded README remediation API, proposal-only OpenAI adapter, upstream release signals, merge predicate, local feedback and portfolio CLI. Live end-to-end validation is still outstanding.

## P0 — Safe operational pilot
- [Harden publishing and interrupted-write recovery](https://github.com/AnkitParekh007/repoOps/issues/14).
- [Independent review and guarded automatic merge](https://github.com/AnkitParekh007/repoOps/issues/15).
- [Production readiness and deployment verification](https://github.com/AnkitParekh007/repoOps/issues/21).
- Resource pack: GitHub App setup, least-privilege permissions matrix, dry-run walkthrough, incident and rollback runbooks, sample audit report.

## P1 — Expand maintenance capabilities
- [Sandboxed coding providers](https://github.com/AnkitParekh007/repoOps/issues/16): provider contract, Codex/Claude/local model setup, execution budgets.
- [Scanner packs](https://github.com/AnkitParekh007/repoOps/issues/17): dependency, secrets, static analysis, accessibility and CI health; scanner adapter guide and fixture repositories.
- [Trend and documentation intelligence](https://github.com/AnkitParekh007/repoOps/issues/18): official sources, compatibility and license checks, documentation consistency examples.
- [Feedback learning](https://github.com/AnkitParekh007/repoOps/issues/19): outcome schema, example traces, evaluation and regression corpus.

## P2 — Portfolio experience and resource library
- [Dashboard and developer resources](https://github.com/AnkitParekh007/repoOps/issues/20): accessible portfolio UI, configuration recipes, sample reports, reusable maintenance policies, provider comparison and troubleshooting guide.
- Expand documentation with onboarding tutorials, architecture diagrams, scanner authoring guide, PR templates, security FAQ and contributor exercises.

## Release gate
A stable release requires a verified disposable-repository pilot, independent review, negative authorization tests, recovery exercises, browser accessibility and a documented threat model. Roadmap items describe planned capabilities, not existing guarantees.

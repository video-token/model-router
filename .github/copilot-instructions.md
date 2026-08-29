# Model Router Development Instructions

## Project

Model Router is an open-source, self-hosted AI model routing infrastructure.

Core principle:

> Hub discovers. Router connects. Applications create.

The public Model Router Hub discovers and evaluates Providers.

The private self-hosted Model Router stores user-owned credentials, selects channels, routes requests, handles failover, and records execution results.

Applications such as ArcReel, xiaofei, AIYT9, OpenMontage and other AI applications call the user's private Model Router.

video-token.com must never be required in the production model-request path.

---

## Architecture Rules

Use:

- Node.js 24+
- NestJS 11
- TypeScript
- TypeORM 0.3.x
- class-validator
- class-transformer
- SQLite for v0.1
- Jest
- GitHub Actions

Follow the existing repository structure and architecture documents.

Before implementing a feature, read:

- docs/ARCHITECTURE-v0.1.md
- docs/API-CONTRACT-v0.1.md
- docs/DATA-MODEL-v0.1.md
- docs/SECURITY-v0.1.md

Do not invent a competing architecture without updating the design documents first.

---

## Database Rules

Database schema changes MUST use TypeORM migrations.

Never enable:

synchronize: true

Production schema changes must be explicit and reversible.

Every migration should implement both:

- up()
- down()

SQLite database files must never be committed.

---

## Credential Security

Provider API Keys are user-owned secrets.

Never:

- store Provider API Keys in plaintext
- return complete Provider API Keys from APIs
- write Provider API Keys to logs
- send Provider API Keys to video-token.com
- expose Provider credentials to applications

Credentials must be encrypted at rest.

API responses must return only masked credential information.

Application tokens must be stored as hashes when possible.

---

## Provider and Registry Rules

Public Provider metadata comes from model-router-registry or manual Router configuration.

Provider-declared facts and benchmark results are separate concepts.

Providers must not be able to self-declare:

- benchmark score
- ranking
- success rate
- latency ranking
- stability score
- Verified status
- Recommended status

---

## Routing Model

A usable Channel is conceptually:

Provider
+ Credential
+ Endpoint
+ Canonical Model
+ Provider Model Mapping
= Channel

Applications should depend on canonical model IDs rather than Provider-specific upstream model names.

Planned routing strategies include:

- fixed
- cheapest
- fastest
- stable
- balanced

Failover must be bounded.

Do not create infinite retries.

---

## API Rules

Global API prefix:

/v1

Administration APIs belong under:

/v1/admin/

Application-facing generation APIs must follow the existing API contract.

Async jobs use:

- queued
- running
- succeeded
- failed

Do not silently convert failures into successful results.

---

## Testing Rules

Every feature must include tests.

Before opening a PR, ensure:

npm run typecheck
npm test -- --runInBand
npm run build

All three must pass.

Database features should test real migrations and SQLite behavior rather than relying on synchronize:true.

Persistence features should include restart/persistence tests where appropriate.

---

## Git Rules

Never modify main directly.

For every feature:

1. Create a feature branch from latest main.
2. Implement one bounded feature.
3. Add or update tests.
4. Open a pull request.
5. Wait for GitHub Actions.
6. Merge only when required checks pass.

Do not bypass branch protection.

Do not force push main.

---

## Scope Discipline

Keep each pull request focused.

Do not refactor unrelated modules during a feature task.

Do not add speculative abstractions that are not required by the current contract.

Prefer simple, explicit code over hidden magic.

The Router must remain independently usable even when the public Hub is unavailable.

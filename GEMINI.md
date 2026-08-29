# Model Router Gemini Instructions

Before making any code changes, read and follow:

- `.github/copilot-instructions.md`
- `docs/ARCHITECTURE-v0.1.md`
- `docs/API-CONTRACT-v0.1.md`
- `docs/DATA-MODEL-v0.1.md`
- `docs/SECURITY-v0.1.md`

The rules in those files are authoritative.

## Core Principle

Hub discovers. Router connects. Applications create.

The self-hosted Model Router must remain usable when video-token.com is unavailable.

## Development Rules

- Never modify `main` directly.
- Keep each task narrowly scoped.
- Use NestJS 11, TypeScript and TypeORM.
- SQLite schema changes must use migrations.
- Never enable `synchronize: true`.
- Never store Provider API keys in plaintext.
- Never expose complete credentials in APIs or logs.
- Never commit secrets.
- Add tests for every feature.
- Do not silently convert failures into success.

Before completing any coding task, run:

1. `npm run typecheck`
2. `npm test -- --runInBand`
3. `npm run build`

All must pass.

When a task requires substantial code changes, create a plan first and wait for approval when the workflow requests it.

# AI Interview Copilot

Monorepo scaffold for AI Interview Copilot.

This repository currently contains project structure, shared configuration, environment examples, Docker placeholders, and architecture documentation only. It intentionally does not include application code or business logic.

## Workspace Layout

```txt
frontend/   User-facing web client placeholder
backend/    API and realtime services placeholder
ai-engine/  AI orchestration and model integration placeholder
shared/     Shared types, configs, and contracts placeholder
docs/       Architecture and planning docs
docker/     Docker and local infrastructure placeholders
```

## Requirements

- Node.js 20+
- npm 10+

## Scripts

```sh
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm run test
npm run clean
```

Workspace scripts are placeholders until implementation begins.

## Environment

Copy `.env.example` files before local development:

```sh
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp ai-engine/.env.example ai-engine/.env
cp shared/.env.example shared/.env
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Plan](docs/api.md)
- [Deployment Plan](docs/deployment.md)
- [Risks](docs/risks.md)

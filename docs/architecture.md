# Architecture

## Overview

AI Interview Copilot is planned as an npm-workspaces monorepo with separate workspaces for the user interface, backend services, AI engine, and shared contracts.

## Monorepo Structure

```txt
frontend/   Web client
backend/    API, auth, realtime, persistence, billing
ai-engine/  Transcription, retrieval, coaching, evaluation, model routing
shared/     Shared types, contracts, config, protocol definitions
docs/       Architecture documentation
docker/     Container and local infrastructure placeholders
```

## Frontend Modules

- Authentication and onboarding
- Dashboard
- Interview setup
- Live session interface
- Audio capture controls
- Transcript viewer
- Suggestion panel
- Practice mode
- Feedback reports
- Settings and billing

## Backend Modules

- Auth and session validation
- User and organization management
- Resume and job description management
- Interview lifecycle management
- Transcript persistence
- Suggestion persistence
- Realtime session coordination
- Usage metering
- Billing webhooks
- Audit logging

## AI Engine Modules

- Streaming transcription
- Speaker handling
- Transcript normalization
- Question detection
- Context retrieval
- Answer suggestion generation
- Follow-up prediction
- Coaching signals
- Post-interview evaluation
- Safety and privacy filters
- Provider abstraction

## Data Storage

Planned storage components:

- PostgreSQL for application data
- pgvector or a vector database for retrieval
- Redis for realtime session state, queues, rate limits, and pub/sub
- Object storage for uploaded files and generated artifacts

## Realtime Flow

```txt
Frontend audio stream
  -> Realtime backend
  -> Transcription service
  -> Question detection
  -> Context retrieval
  -> Suggestion generation
  -> Safety filter
  -> Frontend suggestion stream
```

## Non-Goals For Scaffold

- No application business logic
- No UI implementation
- No API implementation
- No AI provider integration
- No database migrations

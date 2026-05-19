# API Plan

This document lists planned API surface only. No endpoints are implemented in this scaffold.

## Auth And User

- `GET /api/me`
- `PATCH /api/me`
- `GET /api/organizations`
- `POST /api/organizations`

## Resumes

- `GET /api/resumes`
- `POST /api/resumes`
- `GET /api/resumes/:id`
- `PATCH /api/resumes/:id`
- `DELETE /api/resumes/:id`
- `POST /api/resumes/:id/parse`

## Jobs

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:id`
- `PATCH /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `POST /api/jobs/:id/parse`

## Interviews

- `GET /api/interviews`
- `POST /api/interviews`
- `GET /api/interviews/:id`
- `PATCH /api/interviews/:id`
- `DELETE /api/interviews/:id`
- `POST /api/interviews/:id/start`
- `POST /api/interviews/:id/end`
- `GET /api/interviews/:id/transcript`
- `GET /api/interviews/:id/suggestions`
- `GET /api/interviews/:id/feedback`

## Realtime

- `POST /api/realtime/token`
- `POST /api/realtime/sessions`
- `POST /api/realtime/sessions/:id/end`

## AI

- `POST /api/ai/suggest-answer`
- `POST /api/ai/evaluate-answer`
- `POST /api/ai/generate-followups`
- `POST /api/ai/practice-question`

## Billing

- `GET /api/billing/subscription`
- `POST /api/billing/checkout`
- `POST /api/billing/portal`
- `POST /api/webhooks/billing`

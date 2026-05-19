# Deployment Plan

## Development

- Frontend served locally
- Backend served locally
- AI engine run as local workspace service or worker
- PostgreSQL via Docker
- Redis via Docker

## Staging

- Frontend on Vercel or Cloudflare Pages
- Backend as containerized service
- AI engine as worker service
- Managed PostgreSQL
- Managed Redis
- Object storage for uploads

## Production

- Frontend CDN deployment
- Backend API behind load balancer
- Dedicated realtime service
- Separate AI worker pool
- Managed PostgreSQL with backups
- Managed Redis
- Centralized logs, metrics, tracing, and alerts

## CI/CD

- Install dependencies
- Run formatting checks
- Run linting
- Run tests once implemented
- Build workspaces once implemented
- Validate Docker configs once implemented

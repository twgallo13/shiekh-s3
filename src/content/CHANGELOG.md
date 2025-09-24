# Changelog

## v0.6.0 - Stability & Monitoring

### Added
- **Error Boundaries**: Added `error.tsx` and `global-error.tsx` for graceful error handling
- **Request Audit Sampling**: Middleware for sampled request auditing with configurable rate via `AUDIT_SAMPLE_RATE`
- **Metrics Endpoint**: `/api/metrics` endpoint for basic application metrics (hits, errors, active timers)
- **Deterministic CI**: Updated CI workflow to use Node.js 20 and ensure proper build order
- **Debug Error Page**: Test-only `/debug/throw` page for error boundary testing

### Technical Details
- Middleware skips static assets, health checks, and metrics endpoints
- Metrics are in-memory counters for basic monitoring
- Error boundaries provide user-friendly error recovery
- CI now uses `npm ci` for deterministic builds

## v0.1.0 - Initial Bootstrap

### Added
- Next.js 14 application with App Router
- TypeScript configuration with strict mode
- Tailwind CSS v3 for styling
- Prisma ORM with SQLite database
- Basic authentication and role system
- Health check and audit logging APIs
- Unit and e2e testing setup
- GitHub Actions CI/CD pipeline

# Changelog

## v0.7.0 - Domain Events & Approval Hooks

### Added
- **Domain Events Bus**: Lightweight in-process event system with auditable events
- **Approval API**: `/api/approvals` endpoint with RBAC for approval workflows
- **Event Emitters**: Forecast and approval event emitters for business logic integration
- **Console Logging**: Development-only event logging for debugging
- **Event Types**: ForecastRunStarted, ReplenishmentDraftCreated, ForecastRunCompleted, ApprovalRequested, ApprovalGranted, ApprovalDenied

### Technical Details
- All events are automatically audited via existing audit system
- Event listeners are safe - failures don't break the main flow
- Approval API enforces role-based access control (ADMIN/FM for grant/deny)
- No database schema changes - events are audited only
- Console logging only active in development environment

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

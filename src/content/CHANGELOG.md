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

## v1.1.0 - Approval Auto-Timeouts

### Added
- **In-Process TTL Management**: Automatic timeout handling for approval requests
- **Event-Driven Timeouts**: `ApprovalRequested` starts TTL timer, `ApprovalGranted`/`ApprovalDenied` cancel it
- **Auto-Denial on Timeout**: System emits `ApprovalDenied` with `reason="timeout"` when TTL expires
- **Configurable TTL**: Timeout duration configurable via `NEXT_PUBLIC_APPROVAL_TTL_MS` environment variable

### Technical Details
- Default TTL: 24 hours (86,400,000 milliseconds)
- Timer management uses in-process Map with automatic cleanup
- Timeout events are automatically audited via existing events bus
- No database schema changes - purely in-memory timer management
- Safe error handling prevents timer failures from breaking main application flow

## v1.0.2 - Documentation: Audit API & UI

### Added
- **Audit API Documentation**: Added comprehensive documentation for `GET /api/audit` endpoint
- **Audit UI Documentation**: Documented `/audit` page with filters and pagination functionality
- **API Specification**: Complete documentation of headers, query parameters, and response format

### Technical Details
- Audit API supports filtering by actorUserId, actorRole, correlationId, from, to
- Pagination with configurable limit (default 50, max 100) and offset
- Observability headers (X-Trace-Id, Idempotency-Key) echoed back by API
- RBAC enforcement: Admin/FM only access with standardized error messages per Section 7

## v0.9.3 - Documentation Update: Approvals & Audit

### Added
- **Error Model Documentation**: Updated `docs/events-approvals.md` with standardized error envelope specification
- **Role-aware CTAs Documentation**: Documented Approve/Deny button behavior and role resolution
- **Audit Peek Documentation**: Added documentation for the new `/audit` page functionality

### Technical Details
- Error envelope follows spec with codes: AUTH_002, VAL_002, SYS_001
- Observability headers (X-Trace-Id, Idempotency-Key) are echoed back by the API
- Role-aware UI components with fallback to x-role cookie
- Audit page with non-breaking implementation and ADMIN/FM access control

## v0.8.4 - Enhanced Dev Diagnostics

### Added
- **Pretty-Print Event Logging**: Console listeners now format JSON payloads with proper indentation for better readability
- **Error-Safe Logging**: Fallback handling for non-serializable payloads in development mode
- **Improved Debugging**: Enhanced developer experience with structured event output

### Technical Details
- Event payloads are now pretty-printed with 2-space indentation using `JSON.stringify(payload, null, 2)`
- Safe error handling prevents console logging failures from breaking the main application flow
- Development-only feature that doesn't impact production performance

## v0.8.2 - UI Feedback for Approvals

### Added
- **Approval Status UI**: Created `/approvals` page with Tailwind alert banners for approval feedback
- **Role-Based Access**: UI visibility controlled by RBAC (ADMIN/FM/DM can view approvals)
- **Status Indicators**: Green for granted, red for denied, blue for pending approvals
- **API Integration**: Displays approval metadata and timestamps

### Technical Details
- Approval status banners with appropriate color coding and icons
- Access control enforced at UI level matching Section 12 RBAC spec
- Mock data structure ready for real approval data integration
- API information section for developer reference

## v0.7.4 - Documentation & Developer Notes

### Added
- **Developer Documentation**: Created `docs/events-approvals.md` with comprehensive guide for events bus and approvals API usage
- **Section 17 Compliance**: Updated documentation to align with structure.md developer notes requirements

### Technical Details
- Events bus and approvals API usage documented for developers
- Clear RBAC guidelines and API endpoint specifications
- Development mode diagnostics and console logging explained

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

# Events Bus & Approvals API

## Overview
All domain events (forecast, replenishment, approvals) are emitted through `src/lib/events.ts`.

## Auditing
Every event is logged via `src/lib/audit.ts` (`audit.log("SYSTEM", EventName, payload)`).

## Approvals API
- POST `/api/approvals`
- Actions: `request`, `grant`, `deny`
- RBAC: only ADMIN/FM may grant/deny

## Workflow Integration

### Forecasts
- Emits `ForecastRunStarted` and `ForecastRunCompleted` with metadata.

### Replenishment
- Emits `ReplenishmentDraftCreated` after draft save.

### Approvals
- Emits `ApprovalRequested`, `ApprovalGranted`, `ApprovalDenied`.

All events are audited automatically.

## Approvals — Error Model & Headers
All errors from `/api/approvals` follow the spec envelope:
```json
{
  "error": {
    "code": "AUTH_002 | VAL_002 | SYS_001",
    "message": "string",
    "details": {}
  }
}
```

If the client provides X-Trace-Id and Idempotency-Key, the API echoes them back in the response headers.

## Role-aware CTAs
The approvals page renders Approve/Deny buttons only for ADMIN and FM. Role is resolved by guards if present, else via x-role cookie.

## Audit Peek
/audit displays recent entries when an audit reader is available (audit.list or audit.recent). Access restricted to ADMIN/FM. No DB changes.

## Audit API (Read-only)
- **Endpoint:** `GET /api/audit`
- **Roles:** Admin, FM
- **Headers:** `X-Trace-Id`, `Idempotency-Key` (echoed), standard error envelope.
- **Query Parameters:** `actorUserId`, `actorRole`, `correlationId`, `from`, `to`, `limit` (default 50, max 100), `offset`.
- **Response:** `{ totalCount, hasMore, items: [...] }`

## Audit UI
- Page `/audit` provides filters and pagination matching the API.
- RBAC: visible to Admin/FM only.
- Shows standardized error messages per Section 7.

## Approval Auto-Timeouts
- On `ApprovalRequested`, a TTL timer is scheduled in-process.
- On `ApprovalGranted` or `ApprovalDenied`, the timer (if any) is canceled.
- If TTL expires, the system emits `ApprovalDenied` with `reason: "timeout"` and audits the action automatically via the events bus.
- Configure TTL using `NEXT_PUBLIC_APPROVAL_TTL_MS` (milliseconds). Defaults to 86,400,000 (24h).

## Development
In dev mode, listeners in `src/lib/listeners/log-to-console.ts` log events to console for diagnostics.

## Dashboard UI Features
- Quick Approvals (request, grant/deny by role)
- Recent Audit table (Admin/FM)
- Forecast Demo + Replenishment Draft Demo
- Events Monitor (dev-only)
- History widgets (forecasts, replenishments)
- Role Switcher (dev-only)
- User Profile card (role + version)
- Notifications banner (dev-only)
- Dark Mode toggle

# Shiekh S3 — Master Specification (v14.0.0)

# 

---

## 1. Project Overview & Strategic Goals

### 1.1 Purpose

Shiekh S3 is the **authoritative supply management platform** for all non-merchandise supplies across the Shiekh retail and warehouse network. It replaces fragmented spreadsheets, ad-hoc ordering, and inconsistent warehouse practices with a unified system of **hierarchy, accountability, and control**.

The platform governs **products, locations, orders, receiving, warehouse operations, store fulfillment, finance hooks, and analytics**. All actions are **auditable**, bound by **role-based access**, and designed to eliminate ambiguity in authority.

---

### 1.2 Authority Model (Doctrine)

- **Admins = “Gods”**
    - Unrestricted authority.
    - Can create and destroy anything, including roles, products, locations, orders, finance mappings.
    - Can impersonate users (still logged in audit).
- **Facility Managers (FMs) = “Spiritual Leaders”**
    - Global logistics leaders.
    - Almost unlimited authority: can create/update/delete products and locations, approve orders, assign vendors, resolve variances, approve adjustments, trigger cycle counts.
    - **Restriction:** Cannot create Admins.
- **Warehouse Supervisors (WHS) = Trusted Managers**
    - Run the warehouse floor.
    - Create/update/delete products and locations.
    - Full control of receiving, put-away, picking, packing, and shipping.
    - Add product images, assign UPC aliases, move stock across locations.
    - Support FMs directly as their operational right hand.
- **District Managers (DMs)**
    - Oversee assigned stores.
    - Approve restricted store requests, monitor compliance, review KPIs.
    - Cannot see vendor costs, cannot CUD products or locations.
- **Store Managers (SMs)**
    - Manage store-level supplies.
    - Can browse catalog, request supplies (if enabled), and receive inbound transfers.
    - Can only “Receive All” or “Report Problem” with photos.
    - No CUD authority on products or locations.
- **Assistant Managers (AMs)**
    - Same as SM, except cannot submit restricted requests.

---

### 1.3 Strategic Goals

1. **Absolute Hierarchy Enforcement**
    - Admin > FM > WHS > DM > SM > AM.
    - System enforces least privilege at every endpoint.
    - CUD authority on products and locations restricted to Admin, FM, WHS only.
2. **Predictive & Capacity-Aware Replenishment**
    - System computes reorder points and order-up-to levels per store × product.
    - Order suggestions respect lead time, review period (ship cadence), safety stock, case packs, MOQs, and **store maximum capacity per product**.
3. **Warehouse as First-Class Domain**
    - Dedicated WHS dashboard.
    - Full CRUD on locations.
    - Products can live in multiple locations at once.
    - Receiving → Receiving Location → Put-away → Permanent locations.
    - Mobile Zebra workflows for picking, packing, and shipping with tracking required.
4. **Product Master Integrity**
    - All users can view catalog.
    - Only Admin/FM/WHS can CUD products.
    - UPCs are optional, multiple aliases allowed, never primary keys.
    - Product images and vendor mappings centrally governed.
5. **Auditability & Governance**
    - Every movement and action is logged immutably: who, what, when, where, why, correlationId.
    - Negative stock movements prohibited.
    - Variances always require photo + notes.
    - MFA required for high-risk overrides (FM/Admin).
6. **Finance Discipline**
    - Automatic accruals at receipt.
    - Vendor credits/debits and write-offs tied to variance outcomes.
    - GL mapping and budget enforcement built in.
    - Cost visibility restricted by role (only Admin/FM/Cost Analyst see all).
7. **Labor Accountability**
    - Telemetry automatically computes picks/hour, pack time, cycle count accuracy, receiving throughput, scan mismatch rate.
    - Threshold breaches generate alerts and feed weekly scorecards.

---

### 1.4 Success Criteria

- **Stockouts of critical SKUs** ≤ 0.5% monthly.
- **Forecast service level** ≥ 90% with ≤ 10% overstock vs. store capacity.
- **Cycle count accuracy** ≥ 98%.
- **Warehouse pick rate** median ≥ 5 picks/hour.
- **All warehouse shipments** have tracking numbers; zero exceptions.
- **Accruals posted** within 24h of receipt; accrual aging ≤ 14 days at 95th percentile.
- **Security compliance**: 100% RBAC review quarterly; no critical findings in audits.

---

### 1.5 Non-Goals

- No dock scheduling or carrier appointment management.
- No consumer-facing portals.
- No use of UPC as a required field anywhere.

---

✅ Section 1 is complete.

Would you like me to proceed to **Section 2: Role Matrix & Use Cases** under this fresh reset?

### You said:

next

### ChatGPT said:

# 2. Role Matrix & Use Cases

This section defines each role, its **scope**, **permissions**, **restrictions**, and **use cases**. Roles are hierarchical and enforced in all APIs and UIs.

---

## 2.1 Role Authority Table

| Role | Scope | Permissions | Restrictions | Escalation Path |
| --- | --- | --- | --- | --- |
| **Admin (God)** | System-wide | • Create/update/delete (CUD) products• CUD warehouse locations• Manage all orders, variances, shipments• Create/destroy users and roles• Full vendor/cost visibility• Configure finance mappings, budgets, policies• Impersonate users (logged as impersonation)• Override any action | None | N/A |
| **Facility Manager (FM, Spiritual Leader)** | Global (all warehouses, all stores) | • CUD products and locations• Approve/override vendors, fulfillment methods, cadence (MFA + reasonCode)• Approve/deny variances• Approve inventory adjustments• Trigger cycle counts• Full cost visibility• Final approval authority on POs/TOs• Authorize finance postings (credits/debits/write-offs) | Cannot create Admins or change Admin policies | N/A |
| **Warehouse Supervisor (WHS, Trusted Manager)** | Assigned warehouse(s) | • CUD products (with images, UPC aliases)• CUD locations• Run full receiving workflow (check-in, put-away)• Execute picking, packing, shipping (tracking required)• Move stock across locations• Quarantine items• Initiate inventory adjustments (pending FM approval) | Cannot override FM approvalsCannot see finance budgets or GL mappings | → FM |
| **District Manager (DM)** | Assigned district (multiple stores) | • Approve restricted store requests• Monitor compliance KPIs• View district dashboards (without costs)• Escalate unresolved variances to FM | Cannot CUD products or locationsCannot see vendor costs | → FM |
| **Store Manager (SM)** | Single store | • Browse catalog• Place supply requests (if enabled)• Receive inbound transfers (TOs)• “Receive All” or “Report Problem” (photo required)• Escalate unresolved variances to DM | Cannot CUD products or locationsNo vendor/cost visibility | → DM → FM |
| **Assistant Manager (AM)** | Single store | • Same as SM except cannot request restricted items | Cannot CUD products or locationsNo vendor/cost visibility | → SM → DM |
| **Cost Analyst** | Cross-org (finance scope) | • Read-only access: costs, GL mappings, budgets• Validate accruals, credits, write-offs | Cannot CUD products, locations, or orders | → FM |
| **AI Agent** | System-wide, policy-bound | • Forecast demand• Compute reorder points and order-up-to levels• Generate draft POs and TOs• Flag anomalies (usage, SLA breaches)• Send reminders for approvals | Cannot approveCannot override FM decisions | → FM |

---

## 2.2 Use Case Catalog by Role

### Admin

- Provision new FM, WHS, DM, SM, AM, Cost Analyst accounts.
- Delete/retire products or locations (MFA required).
- View and impersonate any role (with audit entry).
- Configure global policies (label printing, variance escalation thresholds).
- Oversee immutable audit logs.

### Facility Manager (FM)

- Review AI-generated replenishment POs.
- Approve, override, or split vendors (MFA + reasonCode).
- Resolve variances and post finance outcomes (credits, write-offs).
- Trigger cycle counts (by section/product).
- Approve WHS-submitted adjustments.
- Manage global catalogs and locations.
- Final authority on order approvals.

### Warehouse Supervisor (WHS)

- Manage warehouse dashboard: orders, tasks, locations, movements.
- Run receiving: scan UPC, assign aliases, generate labels, put-away stock.
- Execute picking: scan bin → scan SKU → confirm qty.
- Execute packing: cartonize, weigh, print labels.
- Execute shipping: enter **tracking number** (mandatory).
- Move stock between locations or into quarantine.
- Upload/update product images.
- Propose inventory adjustments (requires FM approval).

### District Manager (DM)

- Review and approve restricted store requests.
- Monitor district KPIs: variance rate, on-time receipts, SLA compliance.
- Escalate unresolved variances to FM.
- Enforce store compliance policies.

### Store Manager (SM)

- Browse catalog and request supplies (if enabled).
- Receive inbound TOs: “Receive All” or “Report Problem” (with photo).
- File variances (short, damaged, wrong item).
- Escalate unresolved variances to DM.

### Assistant Manager (AM)

- Perform same store receiving and variance workflows as SM.
- Cannot submit restricted item requests.

### Cost Analyst

- Review variance cost impact, accruals, and write-offs.
- Validate GL code mappings and budgets.
- Monitor budget utilization KPIs.
- Escalate discrepancies to FM.

### AI Agent

- Run nightly forecasting: compute ADU, safety stock, reorder point, order-up-to.
- Generate draft POs/TOs for FM review.
- Detect anomalies: sudden usage spikes, SLA breaches.
- Push notifications for pending approvals or escalation deadlines.

---

✅ Section 2 is complete.

Shall I move on to **Section 3: Core Workflows & Escalation Paths**, where we’ll explicitly define replenishment, PO/TO lifecycle, receiving, variance handling, warehouse pick/pack/ship, cycle counts, and finance flows — all bound by the hierarchy above?

### You said:

next

### ChatGPT said:

# 3. Core Workflows & Escalation Paths

All workflows in Shiekh S3 are **explicit, hierarchical, and auditable**. Every state change is bound to a role, produces immutable audit entries, and enforces the authority model (Admin > FM > WHS > DM > SM > AM).

---

## 3.1 Predictive Replenishment (AI → FM)

**Trigger:** Nightly AI forecasting job.

**Steps:**

1. For each **Store × Product**, compute:
    - **ADU** (average daily usage).
    - **ROP** (reorder point): `ROP = (leadTime × ADU) + safetyStock`.
    - **Order-Up-To (S)**: `(leadTime + reviewPeriod) × ADU + safetyStock`.
    - Respect **maxCapacityUnits**, case packs, MOQs.
2. Generate draft **POs grouped by vendor**.
3. AI Agent attaches "Why Panel": ADU, lead time, seasonality, safety stock, vendor ranking.
4. **FM review required**: approve, override vendor, adjust cadence (**MFA + reasonCode**).
5. Approved POs move to **OPEN** state.

**Escalation:**

- FM must act within 24h; at 72h, Admin is alerted.

### 3.1.1 Forecasting Implementation Approach

The **MVP forecasting engine** uses a **simple 30-day moving average** to compute ADU (Average Daily Usage) for each Store × Product combination. This approach is chosen for three key reasons:

- **Simple**: Easy to understand and debug; no black-box algorithms
- **Explainable**: Managers can verify the calculation manually if needed
- **Stable**: Resistant to outliers and provides consistent, predictable results

The forecasting system will generate **draft POs for FM approval** based on calculated reorder points and order-up-to levels, ensuring human oversight of all replenishment decisions.

**Long-Cycle Items**: For quarterly or yearly replenishments, the same ADU × lead time logic applies. Draft POs will only appear at the appropriate time intervals (e.g., quarterly review cycles), avoiding spam notifications for items with extended replenishment periods.

**Edge Case Note**: For new products with no usage history, the system falls back to a configurable `seedADU` value or prompts for manual FM input. These draft POs are flagged with a warning: "NEW PRODUCT - No historical data available."

### 3.1.2 Technical Note: Pluggable Provider Architecture

The forecasting system implements a **pluggable provider architecture** to support future algorithmic enhancements:

- **Default Provider**: `moving_average_v1` (30-day moving average)
- **Future Providers**: ARIMA, Prophet, MLFlow models, or custom algorithms can be swapped in without system redesign
- **Provider Registry**: Centralized configuration allows switching forecasting methods per product category or store tier
- **A/B Testing**: Multiple providers can run in parallel for comparison and gradual rollout

### 3.1.3 TODO: HUMAN INPUT REQUIRED

The following forecasting parameters require business stakeholder input before implementation:

- [ ]  **Safety Stock Policy**: Minimum safety stock levels by product category and store tier
- [ ]  **Stockout-Aware Demand Correction**: How to adjust demand when historical data includes stockout periods
- [ ]  **Vendor SLA Weighting**: How vendor delivery performance should influence reorder point calculations
- [ ]  **Holiday Uplift Adjustments**: Seasonal demand multipliers for major shopping periods (Black Friday, back-to-school, etc.)
- [ ]  **seedADU Configuration**: Default ADU values for new products by category
- [ ]  **Review Period Cadence**: Ship frequency overrides by vendor or product category

### 3.1.4 Implementation Checklist

**Forecast Job Schedule:**

- [ ]  Nightly execution at 2:00 AM UTC
- [ ]  Retry logic with exponential backoff
- [ ]  Timeout handling (≤60 minutes max runtime)

**Provider Registry:**

- [ ]  Plugin interface for forecasting algorithms
- [ ]  Configuration management for provider selection
- [ ]  Fallback to `moving_average_v1` on provider failure

**Canonical Events:**

- [ ]  `ForecastRunStarted` — forecasting job initiated
- [ ]  `ReplenishmentDraftCreated` — draft PO generated for FM review
- [ ]  `ForecastRunCompleted` — forecasting job finished successfully

**RBAC Controls:**

- [ ]  AI_AGENT role can create draft POs only
- [ ]  FM role required for PO approval
- [ ]  Admin role can configure forecasting providers and parameters

**Observability Metrics:**

- [ ]  Forecast accuracy tracking (predicted vs. actual consumption)
- [ ]  Job execution time and success/failure rates
- [ ]  Draft PO approval rates and override patterns

---

## 3.2 Store-Initiated Requests (Optional)

**Trigger:** SM adds items from catalog.

**Steps:**

1. System creates request: `status=PENDING_DM`.
2. **DM approves/denies**.
3. If approved → escalates to FM for final fulfillment.
4. If denied → closed with immutable reasonCode.

**Escalation:**

- DM inactivity >48h escalates to FM.
- FM decision is final.

---

## 3.3 Purchase Orders (POs)

**Scope:** Vendor-facing documents.

**Steps:**

1. AI/FM creates POs.
2. **FM review**: vendor, cadence, notes.
3. Status transitions:
    - `OPEN → DISPATCHED → IN_TRANSIT → RECEIVED_PARTIAL | RECEIVED_COMPLETE → CLOSED`.
4. Vendor API/EDI integration with retries + fallback vendor logic.

**Escalation:**

- Vendor SLA breach triggers alert + vendor switch.
- FM notified on repeated API failures.

---

## 3.4 Transfer Orders (TOs)

**Scope:** Store-facing transfers from warehouse.

**Steps:**

1. Generated automatically after warehouse receiving or stock allocation.
2. Status lifecycle: `PENDING → IN_TRANSIT → RECEIVED → CLOSED`.
3. SM actions:
    - **Receive All** → TO closed.
    - **Report Problem** → variance created.
4. If untouched for 14 days → auto-closed as `RECEIVED_COMPLETE`.

---

## 3.5 Warehouse Receiving (WHS)

**Steps:**

1. WHS opens PO in Zebra device.
2. Scan product:
    - If UPC alias matches → auto-accept.
    - If unknown → WHS may add alias (optional).
    - If no UPC → manual select; system may generate SKU/lotId and prompt label print.
3. Received stock placed in **Receiving Location (buffer)**.
4. WHS executes **Put-away** → assign to permanent location(s) with quantities.
5. Variances logged (`SHORT_SHIP | WRONG_ITEM | DAMAGED`) with photo + notes.
6. **FM approves** variance dispositions → posts `InventoryAdjustment`, `VendorCredit`, or `WriteOff`.

---

## 3.6 Store Receiving (SM/AM)

**Steps:**

1. Store dashboard displays inbound TO.
2. SM/AM chooses:
    - **Receive All** → closes TO.
    - **Report Problem** → must attach photo.
3. Variance escalates to FM.
4. Auto-close after 14 days if no action.

---

## 3.7 Variance Handling (FM final authority)

**Types:**

- **SHORT_SHIP**: FM accept → adjust stock + vendor credit.
- **WRONG_ITEM**: FM accept → quarantine stock.
- **DAMAGED**:
    - FM accept → choose replacement now (new TO), next shipment, or write-off (usable/unusable).
    - FM deny → stock remains.

**All outcomes emit events**: `VarianceAccepted`, `VarianceDisputed`, `InventoryAdjustmentRequested`.

---

## 3.8 Warehouse Execution — Pick / Pack / Ship (WHS)

**Trigger:** Order `APPROVED_FOR_FULFILLMENT` with `fulfillmentMethod=WAREHOUSE_DEFAULT`.

**Steps:**

1. **Pick:**
    - System creates PickTasks.
    - WHS scans **location → SKU → qty**.
    - Mismatch = hard stop. Short pick = auto variance.
2. **Pack:**
    - Completed picks aggregated.
    - WHS packs cartons, records weight/dimensions.
    - Labels generated (ZPL/PDF).
3. **Ship:**
    - WHS must enter **trackingNumber**.
    - Status: `LABEL_CREATED → DISPATCHED → IN_TRANSIT → DELIVERED`.
    - Direct-Ship bypasses warehouse; vendor tracking attached.

**Escalation:** Missing tracking number = block release + CRITICAL alert.

---

## 3.9 Cycle Counts (FM/Admin triggered, WHS executed)

**Steps:**

1. FM/Admin schedules cycle count (by section or product).
2. WHS executes: scan location → scan SKU → enter countedQty.
3. Variance auto-calculated = countedQty − systemQty.
4. FM reviews → approve/deny.
5. Approved → posts `InventoryAdjustment`.
6. Status lifecycle: `PENDING → IN_PROGRESS → COMPLETED → CLOSED`.

**Escalation:**

- No activity after 24h = reminder to WHS + FM.
- Variance >2% or ±N units = HIGH_VARIANCE → FM alert.

---

## 3.10 Finance Integration (automatic)

**Events emitted:**

- `AccrualPosted` — at receipt (or ASN per policy).
- `VendorCreditIssued` — from variance accept.
- `WriteOffPosted` — from unusable damage.
- `BudgetThresholdBreached` — ≥90% of store/district cap.

**Steps:**

1. Warehouse/store receiving → system posts accrual.
2. FM variance decision → credit, debit, or write-off event.
3. Cost Analyst validates GL mapping and budget alignment.

---

✅ Section 3 is complete.

Do you want me to continue to **Section 4: Technical Architecture & Deployment** (covering components, hosting, integrations, devices, and data stores) under the same strict clarity?

### You said:

next

### ChatGPT said:

# 4. Technical Architecture & Deployment

This section defines the system architecture of **Shiekh S3**. It is precise and enforceable: every component, integration, and device is identified, with no ambiguity.

---

## 4.1 System Components

- **Application Layer**
    - Web and mobile-first PWA.
    - Zebra Android devices supported with offline queue and scan-first flows.
    - Role-based dashboards (Admin, FM, WHS, DM, SM, AM).
- **API Gateway**
    - Single entry point for all clients.
    - Enforces authentication (SSO/OIDC, short-lived JWTs).
    - Validates headers: `Authorization`, `Idempotency-Key`, `X-Trace-Id`, `X-User-Role`.
    - Rejects all unauthenticated traffic.
- **Core Services**
    - **Catalog Service**: governs products, aliases, images, vendor maps.
    - **Warehouse Service**: handles locations, receiving, put-away, picking, packing, shipping.
    - **Order Service**: governs PO and TO lifecycle.
    - **Variance Service**: enforces variance rules, escalations, FM approval.
    - **Finance Service**: accruals, vendor credits, write-offs, GL mapping.
    - **Analytics Service**: KPI computation, roll-ups, forecasting telemetry.
    - **Auth & RBAC Service**: issues JWTs, enforces least privilege.
    - **Audit Service**: immutable ledger for every action, stores correlationId, reasonCode, actorRole.
        - **"Why Panel" Explainability**: Every forecasted suggestion must include complete inputs, calculations, and adjustments so managers can understand why a number was suggested. Includes ADU computation, lead time factors, safety stock reasoning, case pack rounding, MOQ enforcement, vendor selection logic, and capacity constraints.
    - **Notification Service**: sends alerts (approval timeouts, variance escalations, KPI breaches).
- **Database Layer**
    - **PostgreSQL** (relational, ACID-compliant).
    - Separate schemas per domain: `catalog`, `warehouse`, `orders`, `finance`, `audit`.
    - All changes are **append-only** with soft-delete flags for reference integrity.
- **Event Bus**
    - **Kafka** (or equivalent).
    - All events (`OrderCreated`, `VarianceReported`, `AccrualPosted`, `ScanEvent`, etc.) published and consumed asynchronously.
    - Guarantees at-least-once delivery with idempotent consumers.

---

## 4.2 Hosting & Deployment

- **Cloud Hosting**: Deployed on managed Kubernetes cluster.
- **Regions**: Single primary region with multi-AZ replication.
- **Containers**: Each service packaged as Docker image; CI/CD pipeline enforces signed builds.
- **Secrets**: Managed by Vault; rotation quarterly.
- **Storage**:
    - Databases on encrypted block storage (AES-256 at rest).
    - Object storage (S3-compatible) for product images, label PDFs/ZPLs.
- **Networking**:
    - Private VPC; no public database endpoints.
    - API Gateway is the only internet-facing entry point.

---

## 4.3 Devices

- **Zebra Scanners (Android)**
    - Supported models: TC21, TC26, TC52, TC57.
    - Run mobile PWA in kiosk mode.
    - Scans validated in real-time via WebSocket.
    - Offline-first: queued scans synced on reconnect.
- **Printers**
    - Zebra label printers, ZPL format.
    - Label templates: 1″ × 2.25″, with product name, SKU/lotId, optional UPC, date, bin code.
- **Desktop/Web Clients**
    - FM/Admin/DM primary access on web browser.
    - SM/AM access via mobile web app.

---

## 4.4 Integrations

- **Vendors**
    - API/EDI integration for PO dispatch and ASN ingestion.
    - Retry with exponential backoff.
    - SLA monitoring built in; fallback vendor logic enforced.
- **Finance/ERP**
    - Outbound events for accruals, credits, write-offs (`AccrualPosted`, `VendorCreditIssued`, `WriteOffPosted`).
    - GL mapping maintained internally; exportable to ERP.
- **Identity Provider**
    - SSO/OIDC integration (Azure AD or equivalent).
    - Short-lived JWTs (≤60m).
    - MFA required for FM/Admin sensitive actions.

---

## 4.5 Data Stores

- **Catalog**: Products, vendor maps, UPC aliases, images.
- **Warehouse**: Locations, stock movements, cycle counts, pick/pack/ship tasks.
- **Orders**: POs, TOs, line items, status transitions.
- **Finance**: Accruals, credits, debits, write-offs, GL links.
- **Audit**: Immutable log of all actions.
- **Analytics**: KPI snapshots, forecasts, anomaly detections.

---

## 4.6 Deployment Model

- **CI/CD Pipeline**
    - Git-based source control.
    - Automated tests (unit, integration, acceptance) must pass before deploy.
    - Blue/green deployments for zero downtime.
- **Monitoring**
    - Centralized logs (ELK or equivalent).
    - Metrics exported to Prometheus/Grafana.
    - Alert rules: service downtime, error rate >1%, lag in event bus.

---

✅ Section 4 is complete.

Would you like me to continue with **Section 5: Master Schemas** (Orders, LineItems, Variances, Products, Stores, Users, Vendors, Shipments, Warehouse Tasks, Inventory, Movements) — all formalized in JSON Schema format?

### You said:

next

### ChatGPT said:

# 5. Master Schemas

This section defines **canonical JSON Schemas** for all Shiekh S3 entities. These schemas are the single source of truth. They are **strict, immutable, and versioned**. All API contracts and database models must conform.

---

## 5.1 Products

```json
{
  "$id": "s3.product",
  "type": "object",
  "required": [
    "productId",
    "sku",
    "name",
    "category",
    "unitOfMeasure",
    "itemsPerUnit",
    "vendorMap",
    "isActive",
    "createdAt",
    "updatedAt"
  ],
  "properties": {
    "productId": {"type": "string", "format": "uuid"},
    "sku": {"type": "string"},
    "name": {"type": "string"},
    "category": {"type": "string"},
    "equivalentUnit": {"type": "string"},
    "unitOfMeasure": {
      "type": "string",
      "enum": ["Case", "Each", "Pack", "Box", "Roll", "Unit"]
    },
    "itemsPerUnit": {"type": "integer", "minimum": 1},
    "barcodeAliases": {
      "type": "array",
      "items": {"type": "string"},
      "uniqueItems": true},
    "images": {"type": "array", "items": {"type": "string"}},
    "vendorMap": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["vendorId", "costPerItem", "leadTimeDays"],
        "properties": {
          "vendorId": {"type": "string", "format": "uuid"},
          "vendorSku": {"type": ["string", "null"]},
          "costPerItem": {"type": "string"},
          "leadTimeDays": {"type": "integer", "minimum": 0},
          "preferred": {"type": "boolean", "default": false}
        },
        "additionalProperties": false}
    },
    "isActive": {"type": "boolean", "default": true},
    "createdAt": {"type": "string", "format": "date-time"},
    "updatedAt": {"type": "string", "format": "date-time"}
  },
  "additionalProperties": false}

```

---

## 5.2 Warehouse Locations

```json
{
  "$id": "s3.location",
  "type": "object",
  "required": [
    "locationId",
    "code",
    "zone",
    "aisle",
    "bay",
    "level",
    "bin",
    "capacityUnits",
    "isActive"
  ],
  "properties": {
    "locationId": {"type": "string", "format": "uuid"},
    "code": {"type": "string"},
    "zone": {"type": "string"},
    "aisle": {"type": "string"},
    "bay": {"type": "string"},
    "level": {"type": "string"},
    "bin": {"type": "string"},
    "capacityUnits": {"type": "integer", "minimum": 0},
    "isActive": {"type": "boolean"}
  },
  "additionalProperties": false}

```

---

## 5.3 Orders (POs, TOs)

```json
{
  "$id": "s3.order",
  "type": "object",
  "required": [
    "orderId",
    "orderType",
    "status",
    "createdBy",
    "createdAt",
    "lineItems"
  ],
  "properties": {
    "orderId": {"type": "string", "format": "uuid"},
    "orderType": {"type": "string", "enum": ["PO", "TO"]},
    "status": {
      "type": "string",
      "enum": [
        "PENDING",
        "OPEN",
        "DISPATCHED",
        "IN_TRANSIT",
        "RECEIVED_PARTIAL",
        "RECEIVED_COMPLETE",
        "CLOSED"
      ]
    },
    "vendorId": {"type": ["string", "null"], "format": "uuid"},
    "fromWarehouseId": {"type": ["string", "null"], "format": "uuid"},
    "toStoreId": {"type": ["string", "null"], "format": "uuid"},
    "createdBy": {"type": "string", "format": "uuid"},
    "lineItems": {
      "type": "array",
      "items": {"$ref": "s3.lineItem"}
    },
    "createdAt": {"type": "string", "format": "date-time"},
    "updatedAt": {"type": "string", "format": "date-time"}
  },
  "additionalProperties": false}

```

---

## 5.4 Line Items

```json
{
  "$id": "s3.lineItem",
  "type": "object",
  "required": ["lineItemId", "productId", "qtyOrdered"],
  "properties": {
    "lineItemId": {"type": "string", "format": "uuid"},
    "productId": {"type": "string", "format": "uuid"},
    "qtyOrdered": {"type": "integer", "minimum": 1},
    "qtyReceived": {"type": "integer", "default": 0},
    "qtyShipped": {"type": "integer", "default": 0},
    "status": {
      "type": "string",
      "enum": ["OPEN", "PARTIAL", "COMPLETE", "VARIANCE_HELD"]
    },
    "notes": {"type": ["string", "null"]}
  },
  "additionalProperties": false}

```

---

## 5.5 Variances

```json
{
  "$id": "s3.variance",
  "type": "object",
  "required": [
    "varianceId",
    "lineItemId",
    "type",
    "reportedBy",
    "status",
    "createdAt"
  ],
  "properties": {
    "varianceId": {"type": "string", "format": "uuid"},
    "lineItemId": {"type": "string", "format": "uuid"},
    "type": {
      "type": "string",
      "enum": ["SHORT_SHIP", "WRONG_ITEM", "DAMAGED", "PICK_SHORTAGE"]
    },
    "photoUrls": {"type": "array", "items": {"type": "string"}},
    "notes": {"type": ["string", "null"]},
    "reportedBy": {"type": "string", "format": "uuid"},
    "status": {
      "type": "string",
      "enum": ["PENDING", "APPROVED", "REJECTED", "CLOSED"]
    },
    "approvedBy": {"type": ["string", "null"], "format": "uuid"},
    "createdAt": {"type": "string", "format": "date-time"},
    "updatedAt": {"type": "string", "format": "date-time"}
  },
  "additionalProperties": false}

```

---

## 5.6 Users

```json
{
  "$id": "s3.user",
  "type": "object",
  "required": ["userId", "role", "name", "email", "isActive"],
  "properties": {
    "userId": {"type": "string", "format": "uuid"},
    "role": {
      "type": "string",
      "enum": ["ADMIN", "FM", "WHS", "DM", "SM", "AM", "COST_ANALYST", "AI_AGENT"]
    },
    "name": {"type": "string"},
    "email": {"type": "string", "format": "email"},
    "phone": {"type": ["string", "null"]},
    "assignedWarehouseIds": {"type": "array", "items": {"type": "string", "format": "uuid"}},
    "assignedStoreIds": {"type": "array", "items": {"type": "string", "format": "uuid"}},
    "isActive": {"type": "boolean"},
    "createdAt": {"type": "string", "format": "date-time"},
    "updatedAt": {"type": "string", "format": "date-time"}
  },
  "additionalProperties": false}

```

---

## 5.7 Vendors

```json
{
  "$id": "s3.vendor",
  "type": "object",
  "required": ["vendorId", "name", "isActive"],
  "properties": {
    "vendorId": {"type": "string", "format": "uuid"},
    "name": {"type": "string"},
    "contacts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string", "format": "email"},
          "phone": {"type": "string"}
        }
      }
    },
    "isActive": {"type": "boolean"},
    "createdAt": {"type": "string", "format": "date-time"},
    "updatedAt": {"type": "string", "format": "date-time"}
  },
  "additionalProperties": false}

```

---

## 5.8 Shipments

```json
{
  "$id": "s3.shipment",
  "type": "object",
  "required": ["shipmentId", "orderId", "carrier", "trackingNumber", "status", "createdAt"],
  "properties": {
    "shipmentId": {"type": "string", "format": "uuid"},
    "orderId": {"type": "string", "format": "uuid"},
    "carrier": {"type": "string"},
    "trackingNumber": {"type": "string"},
    "labels": {"type": "array", "items": {"type": "string"}},
    "status": {"type": "string", "enum": ["LABEL_CREATED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"]},
    "directShip": {"type": "boolean", "default": false},
    "createdAt": {"type": "string", "format": "date-time"},
    "updatedAt": {"type": "string", "format": "date-time"}
  },
  "additionalProperties": false}

```

---

## 5.9 Movements (Immutable Ledger)

```json
{
  "$id": "s3.movement",
  "type": "object",
  "required": [
    "movementId",
    "productId",
    "qty",
    "motive",
    "actorUserId",
    "actorRole",
    "timestamp"
  ],
  "properties": {
    "movementId": {"type": "string", "format": "uuid"},
    "productId": {"type": "string", "format": "uuid"},
    "fromLocationId": {"type": ["string", "null"], "format": "uuid"},
    "toLocationId": {"type": ["string", "null"], "format": "uuid"},
    "qty": {"type": "integer"},
    "motive": {
      "type": "string",
      "enum": [
        "RECEIVING",
        "PUTAWAY",
        "PICK",
        "PACK",
        "SHIP",
        "ADJUSTMENT",
        "QUARANTINE",
        "RELOCATION"
      ]
    },
    "actorUserId": {"type": "string", "format": "uuid"},
    "actorRole": {
      "type": "string",
      "enum": ["ADMIN", "FM", "WHS", "DM", "SM", "AM"]
    },
    "deviceId": {"type": ["string", "null"], "format": "uuid"},
    "correlationId": {"type": ["string", "null"]},
    "reasonCode": {"type": ["string", "null"]},
    "timestamp": {"type": "string", "format": "date-time"}
  },
  "additionalProperties": false}

```

# 6. Business Rules & Logic

This section establishes the **non-negotiable business rules** that govern Shiekh S3. All services, UIs, and APIs must enforce these rules consistently. They encode hierarchy, product integrity, inventory discipline, and finance accountability.

---

## 6.1 Role & Authority Enforcement

1. **Admin supremacy:** Admin can perform all actions without restriction.
2. **FM authority:** FM has global power but cannot create Admins or change Admin policies.
3. **WHS authority:** WHS can CUD products and locations, but cannot override FM approvals or see financial budgets.
4. **DM authority:** DM approves restricted store requests; no CUD product/location; no vendor cost visibility.
5. **SM/AM scope:** SM/AM can only receive and report problems; no visibility to vendor costs; no CUD product/location.
6. **AI Agent boundaries:** AI can forecast and generate draft orders but cannot approve or override.

---

## 6.2 Product & Catalog Governance

1. **Catalog visibility:** All roles can view products.
2. **CUD restriction:** Only Admin, FM, WHS can create, update, or delete products.
3. **UPC rules:**
    - UPCs are optional aliases, never primary keys.
    - A product may have multiple UPCs.
    - WHS may add UPCs at receiving; optional, not required.
4. **Vendor mapping:**
    - Each product must have ≥1 vendor with cost and leadTimeDays.
    - FM/ADMIN can override vendor preference with MFA + reasonCode.
5. **Enable/disable products:** Allowed only when required fields are populated; all changes logged with reasonCode.
6. **Immutability:** Product history is append-only; edits create new versions.

---

## 6.3 Orders & Fulfillment

1. **POs (Purchase Orders):**
    - Generated by AI or FM.
    - Vendor chosen by deterministic rules: lowest landed cost → shortest lead time → preferred vendor.
    - FM override requires MFA + reasonCode.
    - Status lifecycle: `OPEN → DISPATCHED → IN_TRANSIT → RECEIVED_PARTIAL/RECEIVED_COMPLETE → CLOSED`.
2. **TOs (Transfer Orders):**
    - Generated from warehouse stock.
    - Store Managers may only “Receive All” or “Report Problem.”
    - Auto-closed as RECEIVED_COMPLETE if untouched for 14 days.
3. **Store Requests:**
    - Optional feature.
    - Flow: SM → DM → FM.
    - DM inactivity after 48h escalates to FM.
    - FM decision is final.

---

## 6.4 Receiving & Variance Rules

1. **Receiving (Warehouse):**
    - All receipts enter “Receiving Location.”
    - WHS must put-away into permanent locations.
    - Unknown UPCs may be added as aliases but not required.
    - Labels optional but logged if printed or skipped.
2. **Receiving (Store):**
    - SM/AM actions limited to “Receive All” or “Report Problem.”
    - Variances require photo + notes.
3. **Variance Handling:**
    - Variance types: SHORT_SHIP, WRONG_ITEM, DAMAGED, PICK_SHORTAGE.
    - Variances always require photo + notes.
    - FM is final authority on disposition.
    - Outcomes must trigger:
        - `InventoryAdjustment` (adjust stock).
        - `VendorCreditIssued` or `WriteOffPosted` (finance).
    - All decisions logged with immutable audit entry.

---

## 6.5 Inventory Discipline

1. **Movement ledger:**
    - Every change in inventory posts a Movement record (immutable).
    - Movement motives: RECEIVING, PUTAWAY, PICK, PACK, SHIP, ADJUSTMENT, QUARANTINE, RELOCATION.
    - Negative stock not permitted unless resulting balance ≥0.
2. **Cycle counts:**
    - Scheduled by FM/Admin.
    - Executed by WHS via Zebra.
    - Variance auto-calculated = countedQty − systemQty.
    - Variance >2% flagged as HIGH_VARIANCE.
    - FM must approve/deny adjustments.
3. **Quarantine handling:**
    - Quarantine is always a physical location, not a flag.
    - Damaged/incorrect items moved into quarantine until FM resolves.

---

## 6.6 Finance & Compliance Rules

1. **Accruals:**
    - Posted automatically at receipt (or ASN if configured).
    - GL codes mapped per product category.
2. **Credits & Write-offs:**
    - FM-approved variances trigger vendor credit or write-off event.
    - Write-offs marked usable/unusable; unusable removed from sellable stock.
3. **Budget enforcement:**
    - Cost Analyst and Admin can configure district caps.
    - When ≥90% of budget reached, system emits BudgetThresholdBreached event.
4. **Compliance:**
    - All actions log `actorRole`, `actorUserId`, `reasonCode`, `correlationId`.
    - MFA required for destructive or financial overrides.
    - Audit logs immutable and queryable by Admin at any time.

---

## 6.7 Escalation Logic

1. **Approval timeouts:**
    - Store requests: DM inactivity >48h → escalate to FM.
    - Replenishment POs: FM inactivity >72h → escalate to Admin.
2. **Variance escalation:**
    - If unresolved after 7 days → escalate to FM (if DM/SM initiated).
    - FM decision is final; Admin can only override via impersonation.
3. **Shipment enforcement:**
    - Warehouse shipments cannot be closed without a tracking number.
    - Direct-Ship exceptions: vendor tracking attached automatically.

---

## 6.8 Labor Metrics (enforced via Telemetry)

1. **Pick Rate:** Median ≥ 5 picks/hour.
2. **Receiving Throughput:** ≥ 15 lines/hour per WHS.
3. **Cycle Accuracy:** ≥ 98%.
4. **Scan Mismatch Rate:** ≤ 2% per shift.
5. **Dock-to-Stock Time:** ≤ 4 hours average from receipt to put-away.

Breach of thresholds generates alerts to FM and logs KPI breach events.

---

✅ Section 6 is complete.

Shall I continue with **Section 7: API Contracts** (strict schemas, RBAC rules, headers, idempotency, error models, pagination)?

### You said:

next

### ChatGPT said:

# 7. API Contracts

All Shiekh S3 APIs are **strict**, **idempotent**, and **role-aware**. Every request is authenticated, authorized, logged, and bound by RBAC.

---

## 7.1 General Requirements

- **Base Path:** `/api/v1`
- **Content-Type:** `application/json`
- **Auth:** OIDC → JWT (≤60m lifetime)
- **Required Headers (all endpoints):**
    - `Authorization: Bearer <jwt>`
    - `Idempotency-Key: <uuid>` — prevents duplicate operations
    - `X-Trace-Id: <uuid>` — for distributed tracing
    - `X-User-Role: <role>` — for RBAC validation
- **Common Error Model:**
    
    ```json
    {
      "error": {
        "code": "string",
        "message": "string", 
        "details": {}
      }
    }
    ```
    
- **Pagination Rules:**
    - Query Parameters: `?limit=50&offset=0`
    - Default limit: 50, max limit: 100
    - Response includes `totalCount` and `hasMore`
- **RBAC Enforcement:**
    - Requests outside role scope return **403 Forbidden**
    - Admin always permitted for all endpoints

---

## 7.2 Orders API

### Create Order

**POST** `/orders`

- **Roles:** Admin, FM, AI_AGENT (draft only)
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["orderType", "lineItems"],
  "properties": {
    "orderType": {"type": "string", "enum": ["PO", "TO"]},
    "vendorId": {"type": "string", "format": "uuid"},
    "fromWarehouseId": {"type": "string", "format": "uuid"},
    "toStoreId": {"type": "string", "format": "uuid"},
    "lineItems": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["productId", "qtyOrdered"],
        "properties": {
          "productId": {"type": "string", "format": "uuid"},
          "qtyOrdered": {"type": "integer", "minimum": 1},
          "notes": {"type": "string"}
        }
      }
    },
    "notes": {"type": "string"}
  }
}
```

- **Response:** Created order with generated orderId

### Get Orders

**GET** `/orders`

- **Roles:** All
- **Query Parameters:** `status`, `type`, `vendorId`, `storeId`, `limit`, `offset`
- **Response:** Paginated list of orders

### Approve Order

**POST** `/orders/{orderId}/approve`

- **Roles:** FM, Admin (MFA required)
- **Request Schema:**

```json
{
  "type": "object",
  "properties": {
    "reasonCode": {"type": "string"},
    "notes": {"type": "string"},
    "vendorOverride": {"type": "string", "format": "uuid"}
  }
}
```

### Return Order

**POST** `/orders/{orderId}/return`

- **Roles:** FM, Admin (MFA required)
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["reasonCode"],
  "properties": {
    "reasonCode": {"type": "string"},
    "notes": {"type": "string"}
  }
}
```

---

## 7.3 Variances API

### Report Variance

**POST** `/variances`

- **Roles:** SM, AM, WHS
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["lineItemId", "type", "photoUrls"],
  "properties": {
    "lineItemId": {"type": "string", "format": "uuid"},
    "type": {"type": "string", "enum": ["SHORT_SHIP", "WRONG_ITEM", "DAMAGED", "PICK_SHORTAGE"]},
    "photoUrls": {"type": "array", "items": {"type": "string"}},
    "notes": {"type": "string"},
    "qtyVariance": {"type": "integer"}
  }
}
```

### Get Variances

**GET** `/variances`

- **Roles:** FM, Admin, DM (district scope), SM/AM (store scope)
- **Query Parameters:** `status`, `type`, `storeId`, `limit`, `offset`
- **Response:** Paginated list of variances

### Approve Variance

**POST** `/variances/{varianceId}/approve`

- **Roles:** FM, Admin (MFA required)
- **Request Schema:**

```json
{
  "type": "object", 
  "required": ["disposition"],
  "properties": {
    "disposition": {"type": "string", "enum": ["ADJUST_STOCK", "VENDOR_CREDIT", "WRITE_OFF"]},
    "reasonCode": {"type": "string"},
    "notes": {"type": "string"},
    "usable": {"type": "boolean", "default": true}
  }
}
```

### Return Variance

**POST** `/variances/{varianceId}/return`

- **Roles:** FM, Admin (MFA required)
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["reasonCode"],
  "properties": {
    "reasonCode": {"type": "string"},
    "notes": {"type": "string"}
  }
}
```

---

## 7.4 Products API

### Create Product

**POST** `/products`

- **Roles:** Admin, FM, WHS
- **Request:** Conforms to `s3.product` schema (Section 5.1)

### Update Product

**PUT** `/products/{productId}`

- **Roles:** Admin, FM, WHS

### Get Products

**GET** `/products`

- **Roles:** All
- **Query Parameters:** `category`, `isActive`, `vendorId`, `limit`, `offset`

---

## 7.5 Receiving API

### Warehouse Check-in

**POST** `/receiving/{poId}/checkin`

- **Roles:** WHS
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["lineItemId", "qtyReceived"],
  "properties": {
    "lineItemId": {"type": "string", "format": "uuid"},
    "qtyReceived": {"type": "integer", "minimum": 0},
    "barcodeScanned": {"type": "string"},
    "locationId": {"type": "string", "format": "uuid"},
    "photoUrls": {"type": "array", "items": {"type": "string"}},
    "notes": {"type": "string"}
  }
}
```

### Store Receiving

**POST** `/receiving/{toId}/store`

- **Roles:** SM, AM
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["action"],
  "properties": {
    "action": {"type": "string", "enum": ["RECEIVE_ALL", "REPORT_PROBLEM"]},
    "photoUrls": {"type": "array", "items": {"type": "string"}},
    "notes": {"type": "string"}
  }
}
```

---

## 7.6 Warehouse Operations API

### Pick Task Scan

**POST** `/pick-tasks/{taskId}/scan`

- **Roles:** WHS
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["barcode", "locationScanned"],
  "properties": {
    "barcode": {"type": "string"},
    "locationScanned": {"type": "string"},
    "qtyPicked": {"type": "integer", "minimum": 0}
  }
}
```

### Create Shipment

**POST** `/shipments`

- **Roles:** WHS
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["orderId", "carrier", "trackingNumber"],
  "properties": {
    "orderId": {"type": "string", "format": "uuid"},
    "carrier": {"type": "string"},
    "trackingNumber": {"type": "string"},
    "directShip": {"type": "boolean", "default": false},
    "labels": {"type": "array", "items": {"type": "string"}}
  }
}
```

---

## 7.7 Inventory Adjustments API

### Propose Adjustment

**POST** `/inventory/adjustments`

- **Roles:** WHS
- **Request Schema:**

```json
{
  "type": "object",
  "required": ["productId", "locationId", "qtyAdjustment", "reason"],
  "properties": {
    "productId": {"type": "string", "format": "uuid"},
    "locationId": {"type": "string", "format": "uuid"}, 
    "qtyAdjustment": {"type": "integer"},
    "reason": {"type": "string", "enum": ["CYCLE_COUNT", "DAMAGE", "FOUND", "LOST"]},
    "notes": {"type": "string"}
  }
}
```

### Approve Adjustment

**POST** `/inventory/adjustments/{adjustmentId}/approve`

- **Roles:** FM, Admin (MFA required)
- **Request Schema:**

```json
{
  "type": "object",
  "properties": {
    "reasonCode": {"type": "string"},
    "notes": {"type": "string"}
  }
}
```

---

## 7.8 Audit & Compliance API

### Get Audit Log

**GET** `/audit`

- **Roles:** Admin, FM
- **Query Parameters:** `actorUserId`, `actorRole`, `correlationId`, `from`, `to`, `limit`, `offset`

### Get Compliance Events

**GET** `/compliance/events`

- **Roles:** Admin, FM, WHS
- **Query Parameters:** `type`, `status`, `warehouseId`, `limit`, `offset`

---

## 7.9 Error Codes

- **AUTH_001:** Invalid or expired JWT token
- **AUTH_002:** Insufficient privileges for operation
- **VAL_001:** Request validation failed
- **VAL_002:** Required field missing
- **BIZ_001:** Business rule violation
- **BIZ_002:** Workflow state invalid
- **SYS_001:** Internal server error
- **SYS_002:** Service temporarily unavailable

# 8. UI/UX Contracts

The Shiekh S3 user interface is **role-based** with **standardized routes, RBAC visibility, and consistent UX states** across all user types and devices.

---

## 8.1 Core Routes

### /dashboard

- **RBAC Visibility:** All roles (role-specific content)
- **Metadata Rules:** Show pending tasks count, recent activity, KPI alerts
- **UX States:**
    - **Loading:** Skeleton placeholders for metrics cards
    - **Empty:** "No pending tasks" with onboarding suggestions
    - **Error:** Connectivity issue banner with retry button

### /products

- **RBAC Visibility:** All roles (view); Admin/FM/WHS (edit)
- **Metadata Rules:** Filter by category, active status; search by SKU/name
- **UX States:**
    - **Loading:** Table skeleton with 10 placeholder rows
    - **Empty:** "No products found" with "Add Product" button (if authorized)
    - **Error:** "Unable to load products" with detailed error code

### /orders

- **RBAC Visibility:** All roles (scoped by store/district/warehouse)
- **Metadata Rules:** Filter by status, type (PO/TO), date range
- **UX States:**
    - **Loading:** Order cards with shimmer animation
    - **Empty:** "No orders match criteria" with filter reset option
    - **Error:** Network timeout message with offline indicator

### /orders/new

- **RBAC Visibility:** Admin, FM, AI_AGENT (draft only)
- **Metadata Rules:** Vendor selection required for PO; warehouse required for TO
- **UX States:**
    - **Loading:** Form fields disabled during submission
    - **Empty:** Clean form with guided field completion
    - **Error:** Field-level validation errors with correction hints

### /approvals

- **RBAC Visibility:** DM, FM, Admin only
- **Metadata Rules:** Show approval type, urgency, time pending
- **UX States:**
    - **Loading:** Approval queue with loading indicators
    - **Empty:** "No pending approvals" with celebratory message
    - **Error:** Permission denied for unauthorized access

### /variances

- **RBAC Visibility:** FM/Admin (all); DM (district); SM/AM (store); WHS (warehouse)
- **Metadata Rules:** Group by status, type, cost impact
- **UX States:**
    - **Loading:** Variance list with status badges loading
    - **Empty:** "No variances reported" with reporting guidelines
    - **Error:** Data sync failure with manual refresh option

---

## 8.2 Global Navigation

- **Version Badge:** Display current S3 version (v14.0.0) in footer
- **Breadcrumbs:** Full navigation path with clickable segments
- **User Menu:** Role badge, settings, logout, impersonation (Admin only)
- **Notification Bell:** Real-time alerts for approvals, variances, system events

---

## 8.3 Accessibility Standards

- **aria-current:** Applied to active navigation items and current page indicators
- **Keyboard Navigation:** Tab order follows logical flow; all actions accessible via keyboard
- **Screen Reader Labels:** Descriptive labels for all interactive elements
- **Focus Management:** Visible focus indicators; focus trapped in modals
- **Color Contrast:** 4.5:1 minimum ratio for text; 3:1 for UI elements

---

## 8.4 UI State Examples

### Dashboard Loading State

```json
{
  "route": "/dashboard",
  "state": "loading",
  "data": {
    "pendingTasks": null,
    "recentActivity": [],
    "kpiAlerts": null,
    "showSkeleton": true,
    "estimatedLoadTime": "1.2s"
  },
  "meta": {
    "title": "Dashboard - Loading...",
    "breadcrumbs": ["Dashboard"]
  }
}
```

### Approvals Error State

```json
{
  "route": "/approvals",
  "state": "error",
  "data": {
    "approvals": [],
    "errorCode": "AUTH_002",
    "errorMessage": "Insufficient privileges for operation",
    "retryAvailable": false
  },
  "meta": {
    "title": "Access Denied - Approvals",
    "breadcrumbs": ["Dashboard", "Approvals"],
    "showReturnButton": true
  }
}
```

# 9. Events & Telemetry Contract

Shiekh S3 operates as an **event-driven system**. Every significant action, state change, or anomaly generates a canonical event. Events are immutable, idempotent, and routed through the Event Bus for downstream consumers.

---

## 9.1 Canonical Events

### OrderCreated

- **Trigger:** New order submitted via API or AI Agent
- **Role Visibility:** Admin, FM, WHS, DM (district scope), SM/AM (store scope)
- **JSON Payload Schema:**

```json
{
  "eventId": "uuid",
  "orderId": "uuid",
  "orderType": "PO|TO",
  "createdBy": "uuid", 
  "vendorId": "uuid|null",
  "lineItemCount": "integer",
  "totalValue": "decimal",
  "timestamp": "date-time"
}
```

### OrderApproved

- **Trigger:** FM/Admin approves order via `/orders/{orderId}/approve`
- **Role Visibility:** Admin, FM, Cost Analyst
- **JSON Payload Schema:**

```json
{
  "eventId": "uuid",
  "orderId": "uuid",
  "approvedBy": "uuid",
  "reasonCode": "string|null", 
  "vendorOverride": "uuid|null",
  "timestamp": "date-time"
}
```

### OrderReturned

- **Trigger:** FM/Admin returns order via `/orders/{orderId}/return`
- **Role Visibility:** Admin, FM, Cost Analyst
- **JSON Payload Schema:**

```json
{
  "eventId": "uuid",
  "orderId": "uuid",
  "returnedBy": "uuid",
  "reasonCode": "string",
  "notes": "string|null",
  "timestamp": "date-time"
}
```

### VarianceReported

- **Trigger:** SM/AM/WHS reports variance via `/variances`
- **Role Visibility:** Admin, FM, DM (district scope), SM/AM (store scope), WHS (warehouse scope)
- **JSON Payload Schema:**

```json
{
  "eventId": "uuid", 
  "varianceId": "uuid",
  "lineItemId": "uuid",
  "type": "SHORT_SHIP|WRONG_ITEM|DAMAGED|PICK_SHORTAGE",
  "reportedBy": "uuid",
  "qtyVariance": "integer",
  "photoCount": "integer",
  "timestamp": "date-time"
}
```

### VarianceResolved

- **Trigger:** FM/Admin resolves variance via `/variances/{varianceId}/approve` or `/variances/{varianceId}/return`
- **Role Visibility:** Admin, FM, Cost Analyst
- **JSON Payload Schema:**

```json
{
  "eventId": "uuid",
  "varianceId": "uuid", 
  "status": "APPROVED|REJECTED",
  "approvedBy": "uuid",
  "disposition": "ADJUST_STOCK|VENDOR_CREDIT|WRITE_OFF|null",
  "reasonCode": "string",
  "timestamp": "date-time"
}
```

### FinancialReconciliationQueued

- **Trigger:** System queues financial posting after variance resolution
- **Role Visibility:** Admin, FM, Cost Analyst
- **JSON Payload Schema:**

```json
{
  "eventId": "uuid",
  "reconciliationId": "uuid",
  "varianceId": "uuid",
  "type": "VENDOR_CREDIT|WRITE_OFF|ADJUSTMENT", 
  "amount": "decimal",
  "timestamp": "date-time"
}
```

### FinancialReconciliationPosted

- **Trigger:** Financial posting completed to GL/ERP system
- **Role Visibility:** Admin, FM, Cost Analyst
- **JSON Payload Schema:**

```json
{
  "eventId": "uuid",
  "reconciliationId": "uuid",
  "glCode": "string",
  "amount": "decimal",
  "externalTransactionId": "string|null",
  "timestamp": "date-time"
}
```

---

## 9.2 Telemetry & Monitoring

### Audit Log Retention

- **Hot + Warm Storage:** 13 months total (PostgreSQL + object store)
- **Cold Storage:** ≥7 years in compliance archive
- **Automated Purging:** Monthly cleanup of expired records

### Monitoring Thresholds

- **Pick Rate:** Alert when <5 picks/hour per WHS
- **Cycle Accuracy:** Alert when <98% accuracy per cycle count
- **Variance Backlog:** Alert when unresolved variances >7 days

### Alert Triggers

- **SLA Breaches:** Vendor delivery delays, approval timeouts
- **Missing Tracking Numbers:** Warehouse shipments without tracking
- **Unresolved Variances:** FM approval pending >72 hours

### You said:

next

### ChatGPT said:

# 11. Analytics & KPIs

This section defines **role-based dashboards** and **performance metrics** that provide each role with the KPI visibility required for effective decision-making within their scope of authority.

---

## 11.1 Role-Based Dashboards

### Store Manager (SM)

- **Store Sales %** — Sales performance relative to targets
- **Variance Rate** — (Total variances ÷ total receipts) × 100
- **Fill Rate** — (Orders fulfilled ÷ orders requested) × 100

### District Manager (DM)

- **District Compliance %** — Stores meeting operational standards within district
- **Budget Utilization** — (Actual spend ÷ allocated budget) × 100
- **Variance Rate** — Aggregated variance rate across all stores in district

### Facility Manager (FM)

- **Variance Cost Impact** — Total financial impact of all variances
- **SLA Breaches** — Vendor delivery performance vs committed SLAs
- **Vendor Scorecards** — Performance ratings across cost, quality, delivery metrics

### Admin

- **Global KPIs Rollup** — System-wide aggregation of all performance metrics
- **Cross-Role Compliance** — RBAC adherence, audit completeness, security metrics

### Cost Analyst

- **DSO** — Days Sales Outstanding for variance reconciliation
- **Reconciliation Time** — Average days from variance to financial resolution
- **Disputed Variance %** — (Disputed variances ÷ total variances) × 100

---

## 11.2 Operational KPIs

### PO Cycle Time

- **Formula:** `avg(PO approval → order dispatch)`
- **Unit:** Days
- **Target:** ≤2 days average
- **Role Visibility:** Admin, FM, DM

### Pick Accuracy %

- **Formula:** `(correct picks ÷ total picks) × 100`
- **Unit:** Percentage
- **Target:** ≥98%
- **Role Visibility:** Admin, FM, WHS

### On-Time Delivery %

- **Formula:** `(orders on/before due date ÷ total orders) × 100`
- **Unit:** Percentage
- **Target:** ≥95%
- **Role Visibility:** Admin, FM, DM

### Variance Cost/Store

- **Formula:** `Σ(varianceQty × costPerItem)`
- **Unit:** USD
- **Target:** ≤$500 per store per month
- **Role Visibility:** Admin, FM, DM, Cost Analyst

---

## 11.3 Financial KPIs

### DSO (Days Sales Outstanding)

- **Formula:** `Σ(outstanding credits ÷ total credits) × days in period`
- **Unit:** Days
- **Target:** ≤7 days
- **Role Visibility:** Admin, FM, Cost Analyst

### Reconciliation Time

- **Formula:** `avg(variance reportedAt → variance resolvedAt)`
- **Unit:** Days
- **Target:** ≤3 days median
- **Role Visibility:** Admin, FM, Cost Analyst

### Disputed Variance %

- **Formula:** `(disputed variance count ÷ total variance count) × 100`
- **Unit:** Percentage
- **Target:** ≤5%
- **Role Visibility:** Admin, FM, Cost Analyst

---

## 11.4 KPI Payload Schema

All KPI metrics follow this standardized JSON format for consistency across the Analytics Service:

```json
{
  "metricId": "poCycleTime",
  "value": 3.2,
  "unit": "days", 
  "roleVisibility": ["ADMIN", "FM", "DM"],
  "timestamp": "2024-09-24T02:15:30Z",
  "scope": {
    "storeId": "uuid|null",
    "districtId": "uuid|null", 
    "warehouseId": "uuid|null"
  },
  "threshold": {
    "target": 2.0,
    "warning": 3.0,
    "critical": 5.0
  },
  "trend": {
    "direction": "UP|DOWN|STABLE",
    "changePercent": 15.2
  }
}
```

---

✅ Section 11 is complete.

Do you want me to continue with **Section 12: Imports & Data Pipelines** (CSV ingestion, validation, master data sync, telemetry capture)?

### You said:

next

### ChatGPT said:

# 12. Imports & Data Pipelines

Shiekh S3 depends on **validated master data** with **centralized imports** and **streaming pipelines** to ensure data integrity across all workflows.

---

## 12.1 Supported Formats

- **CSV** — Primary format with UTF-8 encoding
- **Excel** — XLSX files auto-converted to CSV during processing
- **File Size Limits:** Max 50MB per file; max 100,000 rows per import
- **Encoding Requirements:** UTF-8 with BOM support; reject files with encoding issues

---

## 12.2 Validation Framework

### Schema Checks

- **Field Validation:** All columns validated against Section 5 master schemas
- **Required Fields:** Missing required fields cause row rejection
- **Data Types:** String length limits, numeric ranges, UUID format validation
- **Business Rules:** Cross-field validation (e.g., leadTimeDays > 0, valid role assignments)

### Duplicate Detection

- **Primary Key Conflicts:** SKU duplicates, userId conflicts, locationId overlaps
- **Fuzzy Matching:** Detect near-duplicate product names, vendor names within 85% similarity
- **Conflict Resolution:** First valid record wins; subsequent duplicates logged as warnings

### Row-Level Error Logging

```json
{
  "rowNumber": 42,
  "errorType": "VALIDATION_FAILED", 
  "field": "leadTimeDays",
  "expectedType": "integer",
  "actualValue": "next week",
  "errorMessage": "Invalid lead time format"
}
```

---

## 12.3 Data Pipelines Architecture

### Nightly Syncs + Streaming

- **Batch Processing:** Nightly master data sync at 2:00 AM UTC
- **Streaming Events:** Real-time processing of orders, variances, shipments
- **Change Data Capture:** Incremental updates only for modified records
- **Backpressure Handling:** Queue overflow triggers batch processing fallback

### ETL Staging → Warehouse

- **Staging Layer:** Raw imports land in `staging` schema for validation
- **Transformation Rules:** Data normalization, field mapping, business rule application
- **Load Process:** Validated data promoted to `production` schema
- **Rollback Capability:** Failed loads can be reverted to previous state

### Pipeline Flow

1. **Ingestion** → Raw data captured from CSV/Excel uploads
2. **Validation** → Schema checks, duplicate detection, business rules
3. **Staging** → Clean data stored in staging tables
4. **Transformation** → Apply business logic, enrich with metadata
5. **Load** → Promote to production with transaction integrity
6. **Audit** → Log all pipeline activities with full traceability

---

## 12.4 Audit & Tracking

Every import logged with complete metadata:

```json
{
  "importId": "uuid",
  "userId": "uuid",
  "fileId": "uuid", 
  "fileName": "products_2024-09-24.csv",
  "rowCounts": {
    "total": 1250,
    "valid": 1240, 
    "invalid": 10,
    "duplicates": 5
  },
  "processingTime": "00:02:34",
  "timestamp": "2024-09-24T02:15:30Z",
  "status": "COMPLETED_WITH_WARNINGS"
}
```

### Audit Trail Requirements

- **File Retention:** Original files stored 13 months in object storage
- **Processing Logs:** Detailed pipeline execution logs retained 2 years
- **Error Reports:** Downloadable error summaries with correction guidance
- **Data Lineage:** Full traceability from source file to production records

---

## 12.5 Error Handling & Recovery

### Invalid Row Quarantine

- **Quarantine Process:** Invalid rows isolated in `quarantine` tables
- **Manual Review:** Admin/FM can review and correct quarantined data
- **Reprocessing:** Corrected rows can be resubmitted through validation pipeline
- **Expiration:** Quarantined data auto-purged after 90 days if unresolved

### Summary Report Generation

```json
{
  "importSummary": {
    "status": "PARTIAL_SUCCESS",
    "successRate": 95.2,
    "errors": [
      {"type": "DUPLICATE_SKU", "count": 3},
      {"type": "INVALID_VENDOR", "count": 7}
    ],
    "warnings": [
      {"type": "MISSING_UPC", "count": 45}
    ],
    "nextSteps": [
      "Review quarantined records at /imports/{importId}/quarantine",
      "Contact vendors for missing UPC codes",
      "Resubmit corrected file if needed"
    ]
  }
}
```

### Recovery Procedures

- **Failed Imports:** Automatic rollback of partial transactions
- **Corrupted Data:** Point-in-time recovery from staging snapshots
- **Pipeline Failures:** Dead letter queues with manual intervention triggers
- **Performance Degradation:** Auto-scaling and load balancing for high-volume imports

# 13. Security, Governance, & Compliance

This section establishes the **non-negotiable controls** that protect data integrity, enforce hierarchy, and guarantee compliance with operational, financial, and regulatory standards.

---

## 13.1 Authentication & Authorization

- **SSO / OIDC** — all users authenticate via enterprise identity provider.
- **JWT Tokens** — short-lived (≤60m), refresh tokens rotate automatically.
- **MFA** — mandatory for Admin and FM destructive or financial actions (e.g., deleting products/locations, approving adjustments, overriding vendors, posting credits/write-offs).
- **RBAC Enforcement** — every endpoint validates `X-User-Role` against RBAC matrix (see Section 2).
- **Impersonation** — Admin may impersonate, but audit logs must tag action as `IMPERSONATION via ADMIN`.

---

## 13.2 Data Security

- **Encryption in Transit:** TLS 1.2+ required for all connections.
- **Encryption at Rest:** AES-256 encryption for all databases and object storage.
- **Secrets Management:** All credentials stored in Vault; rotated quarterly.
- **No Public Endpoints:** API Gateway is the only internet-facing component. Databases and services run in private VPC.
- **PII Minimization:** Only store name, work email, and phone when necessary.

---

## 13.3 Governance & Audit

- **Immutable Audit Log:** All mutating actions write to `audit_log` with actorUserId, actorRole, timestamp, reasonCode, correlationId.
- **Retention Policy:**
    - Hot storage: 90 days (Postgres).
    - Warm storage: 1 year (object store).
    - Cold storage: ≥7 years (compliance archive).
- **Querying:** Admin/FM may query audit logs by user, role, action, correlationId, or date range.
- **Non-Repudiation:** Logs cryptographically signed; tamper-evident.

---

## 13.4 Compliance Domains

### Financial

- **Accruals, vendor credits, and write-offs** all tied to immutable audit entries.
- **GL mappings** controlled by Admin; validated by Cost Analyst.
- **Budget enforcement** generates BudgetThresholdBreached events when ≥90%.

### Operational (OSHA)

- **ComplianceEvent** logged for hazards (spills, unsafe equipment).
- WHS/FM required to acknowledge and resolve within SLA.

### Data (PCI/GDPR-lite)

- **No cardholder or sensitive PII** stored in Shiekh S3.
- Zebra handhelds transmit only supply data; no PAN or financial identifiers.
- Data deletion requests (users) respected within 30 days.

---

## 13.5 Access Control

- **Least Privilege:** Users see only what their role requires.
- **Cost Visibility:** Only Admin, FM, Cost Analyst may see vendor costs.
- **Store Restrictions:** SM/AM limited to their store; DM limited to their district; WHS limited to assigned warehouses.
- **Vendor Restrictions:** Vendor-facing integrations isolated; no vendor sees internal costs beyond agreed POs.

---

## 13.6 Monitoring & Alerts

- **Security Alerts:**
    - Unauthorized access attempts (>3 failures) → lock account, alert Admin.
    - Token misuse (replay, expired use) → revoke, alert Admin.
- **Compliance Alerts:**
    - OSHA hazard unresolved >24h → escalate to FM.
    - Financial posting not reconciled within 7 days → escalate to Admin.
- **Operational Alerts:**
    - Missing tracking number on warehouse shipment → block release, CRITICAL alert.

---

## 13.7 Policy Reviews

- **Quarterly Security Review:** All RBAC, MFA, and audit policies reviewed by Admin.
- **Annual Compliance Audit:** External audit of OSHA adherence, audit log integrity, and finance workflows.
- **Secrets Rotation:** All shared creds rotated quarterly.

---

# 14. Accessibility & Performance Budgets

This section defines the **hard performance budgets** and **accessibility standards** for Shiekh S3. These are binding requirements, not guidelines.

---

## 14.1 Accessibility Standards

- **WCAG Compliance:** All UIs must meet WCAG 2.1 AA.
- **Touch Targets:** Minimum 44×44 px on mobile.
- **Contrast Ratio:** ≥ 4.5:1 for text; ≥ 3:1 for large text/icons.
- **Screen Reader Support:** All interactive elements labeled; ARIA roles used consistently.
- **Keyboard Navigation:** Full functionality must be operable without a mouse.
- **Language Toggle:** Manual switch between English and Spanish; auto-detect browser language at login.
- **Error Messaging:** Plain language; error + resolution path provided.

---

## 14.2 Performance Budgets

### Mobile (Zebra Devices)

- **Time to Interactive (TTI):** ≤150 ms.
- **Offline Queue:** Must handle ≥50 scans buffered.
- **Memory Footprint:** ≤200 MB per session.
- **Battery Efficiency:** Continuous scan mode must not reduce battery life by >20% in an 8-hour shift.

### Web/Desktop

- **TTI:** ≤200 ms for dashboards.
- **Page Weight:** ≤1 MB initial payload; lazy load non-critical assets.
- **API Latency:** ≤300 ms p95 per request.
- **Error Rate:** <1% per 10,000 requests.

---

## 14.3 Network Resilience

- **Offline Support:**
    - Zebra devices must survive ≥30 minutes offline.
    - Offline queues auto-resync with exact-once guarantees.
- **Retry Policy:**
    - Network retries with exponential backoff.
    - Max 5 retries; after that → offline queue until reconnect.

---

## 14.4 Label Printing

- **Printers Supported:** Zebra (ZPL).
- **Template:** 1″ × 2.25″; includes product name, SKU/lotId, optional UPC, date, bin code.
- **Print/Skip Logging:** Every label print or skip logged in audit.
- **Throughput:** Must generate ≥30 labels/minute.

---

## 14.5 Monitoring & SLA

- **System Uptime:** ≥99.9% monthly.
- **Event Bus Lag:** ≤5 seconds p95.
- **KPI Recalculation:** Nightly; ≤60 minutes full recompute.
- **Scan Validation:** ≤100 ms per scan roundtrip (online).

---

# 15. Operations & Maintenance

This section establishes the **operational standards** for running Shiekh S3, including SLAs, runbooks, patching cadence, device management, and incident response.

---

## 15.1 SLA & SLO Table

| Domain | SLA | SLO Target | Breach Action |
| --- | --- | --- | --- |
| **System Uptime** | ≥99.9% monthly | ≤43m downtime/month | Escalate to Admin; root cause report in 48h |
| **API Latency** | ≤300ms p95 | ≤250ms avg | Alert DevOps if exceeded 15m |
| **Event Bus Lag** | ≤5s p95 | ≤3s avg | Restart lagging consumer group |
| **KPI Recalculation** | Nightly ≤60m | ≤45m | Trigger pipeline rerun |
| **Import Processing** | ≤30m/file | ≤10m typical | Retry pipeline; notify Admin |
| **Variance Resolution** | ≤7 days | ≤3 days median | Escalate to FM |
| **Finance Posting** | ≤24h from event | ≤12h typical | Alert FM + Cost Analyst |

---

## 15.2 Runbooks

- **Service Restart:** Kubernetes rolling restart; blue/green enforced.
- **Event Bus Lag:** Check Kafka lag metrics; reassign partitions; replay events idempotently.
- **Import Errors:** Rerun with corrected file; invalid rows isolated in error report.
- **Variance Backlog:** Auto-reminder to FM every 48h; escalate to Admin at 7 days.
- **Shipment Missing Tracking:** Block release; FM notified; Admin escalated at 4h unresolved.

---

## 15.3 Patch & Release Policy

- **Security Patches:** Applied within 7 days of CVE disclosure.
- **Feature Releases:** Bi-weekly; controlled via CI/CD pipeline.
- **Secrets Rotation:** Quarterly (Vault enforced).
- **OS & Device Firmware:** Updated semi-annually; MDM enforces Zebra scanner patches.

---

## 15.4 Device Provisioning & Management

- **Zebra Devices (TC21/26/52/57):**
    - Configured via MDM (Mobile Device Management).
    - Kiosk mode: Shiekh S3 PWA only.
    - Offline cache size: ≥1,000 scans.
    - Certificates pre-installed; auto-renew via MDM.
- **Label Printers (Zebra, ZPL):**
    - Config managed centrally.
    - Test print required at onboarding.
    - Error reporting integrated into Notification Service.

---

## 15.5 Incident Response

- **Severity Levels:**
    - Sev 1 — System outage, API >50% errors, event bus stalled.
    - Sev 2 — KPI miscalculation, partial warehouse outage, import pipeline down.
    - Sev 3 — Single store disruption, variance backlog beyond SLA.
- **Response Times:**
    - Sev 1 — 15m acknowledgement, 2h resolution target.
    - Sev 2 — 1h acknowledgement, 8h resolution target.
    - Sev 3 — 4h acknowledgement, 48h resolution target.
- **Escalation:**
    - WHS → FM → Admin (ops authority chain).
    - Automated pager alerts for Sev 1 + Sev 2.

---

## 15.6 Monitoring & Reporting

- **Logs:** Centralized ELK stack; searchable by correlationId, userId, or role.
- **Metrics:** Prometheus + Grafana dashboards.
- **Alerts:** Pushed to Notification Service and Ops Pager.
- **Weekly Ops Report:** Auto-generated; includes uptime, SLA compliance, variance backlog, KPI breach summary.

---

# 16. Migration & Rollback Plan

This section defines the **process for introducing Shiekh S3 into production** and the safeguards to return to a stable state if needed. Migration is treated as a controlled, auditable event with staged rollout.

---

## 16.1 Migration Principles

1. **Incremental Adoption:** Roll out by facility and district, not all at once.
2. **Parallel Safety:** Legacy systems remain read-only available until migration stable.
3. **Data Fidelity:** All migrated data validated against master schemas before commit.
4. **Rollback First:** Every migration step must include a defined rollback path.
5. **Audit Everything:** All migration actions logged with correlationId and actor.

---

## 16.2 Pre-Migration Tasks

- **Data Audit:** Verify existing product, store, vendor, and user data for completeness.
- **Schema Seeding:** Ensure product master, contact/store master, and vendor master seeded in Shiekh S3.
- **Warehouse Locations:** Pre-provision zones, aisles, bays, bins with capacity limits.
- **Device Provisioning:** Zebra scanners configured via MDM; test connectivity + offline sync.
- **Printer Setup:** Zebra printers tested with sample labels.

---

## 16.3 Migration Steps

1. **Pilot Facility Rollout**
    - Enable Shiekh S3 for one warehouse.
    - Migrate all products, vendors, store mappings.
    - Run warehouse operations (receiving, pick, pack, ship, cycle count) exclusively on Shiekh S3.
2. **District Rollout**
    - Gradually enable for stores in one DM district.
    - Train SM/AM on receiving & variance workflows.
    - DM dashboards validated for KPIs + compliance.
3. **Global Enablement**
    - Enable across all warehouses + stores.
    - Legacy system set to read-only mode.
    - All new orders, variances, and adjustments flow through Shiekh S3 only.

---

## 16.4 Rollback Plan

- **Trigger:** Sev 1 incidents (system outage, >50% API error rate, critical data corruption).
- **Scope:** Rollback applies per facility/district.
- **Actions:**
    - Disable Shiekh S3 endpoints for facility/district.
    - Reactivate legacy workflows temporarily.
    - Replay events from archived queue into legacy if needed.
- **Validation:** Confirm rollback complete via reconciled counts + variances.

---

## 16.5 Data Migration Validation

- **Row Counts:** Pre vs post import.
- **Checksum Verification:** File-level and row-level hashes.
- **Spot Check:** Random sample validation of products, orders, vendors.
- **Cycle Count:** Post-migration warehouse cycle count required before go-live.

---

## 16.6 Post-Migration Monitoring

- **30-Day Watch:** Enhanced alerting on variances, KPI breaches, and receiving throughput.
- **User Feedback:** Daily WHS/FM/SM feedback logs.
- **FM Sign-Off:** Each facility migration requires FM approval.
- **Admin Finalization:** Only Admin may certify full migration complete.

---

## 16.7 Rollback Safeguards

- **Versioned Snapshots:** Database snapshots taken before each migration step.
- **Feature Flags:** Enable/disable modules (imports, warehouse ops, store requests).
- **Toggle Kill-Switch:** Admin-only command to globally pause Shiekh S3 write endpoints.
- **Event Replay:** All events stored idempotently; replay possible into restored DB.

---

# 17. Acceptance Tests & Validation Rules

This section defines the **canonical acceptance tests** and **validation rules** that must pass before any Shiekh S3 release is considered production-ready. Tests are grouped by domain and must be automated in CI/CD pipelines.

---

## 17.1 General Rules

- **Immutable Results:** All acceptance tests log immutable results with timestamp, buildId, and correlationId.
- **Blocking Failures:** Any failed acceptance test blocks release.
- **Coverage Requirement:** 100% coverage of workflows listed in Section 3 (Core Workflows & Escalation Paths).
- **Role-Aware Validation:** All tests executed with role-specific tokens to ensure RBAC enforcement.

---

## 17.2 Core Workflow Tests

- **AT-ORD-01: Auto Replenishment**
    - Trigger: AI forecasts reorder need.
    - Expected: Draft PO created with correct vendor, ROP logic applied, FM approval required.
- **AT-ORD-02: Store Request Escalation**
    - Trigger: SM submits restricted request.
    - Expected: DM approval required; timeout escalates to FM after 48h.
- **AT-REC-01: Store Receiving**
    - Trigger: TO arrives.
    - Expected: SM can “Receive All” or “Report Problem.” Untouched TO auto-closes after 14 days.
- **AT-REC-02: Warehouse Receiving (UPC Alias)**
    - Trigger: WHS scans unknown UPC.
    - Expected: System prompts alias mapping; receipt continues.
- **AT-VAR-01: Variance Approval**
    - Trigger: Variance reported.
    - Expected: FM decision required; outcome logged with photos + reasonCode.

---

## 17.3 Warehouse Ops Tests

- **AT-W-01: Cycle Count Request**
    - Trigger: FM schedules cycle count.
    - Expected: WA mobile receives task; status=PENDING.
- **AT-W-02: Cycle Count Execution**
    - Trigger: WA completes counts.
    - Expected: Variances auto-computed; CycleCountResult created.
- **AT-W-03: Inventory Adjustment Approval**
    - Trigger: FM verifies cycle count.
    - Expected: InventoryAdjustment posted; audit log created.
- **AT-W-04: Pick Scan Mismatch**
    - Trigger: WA scans incorrect bin.
    - Expected: ScanEvent=MISMATCH; cannot proceed until resolved.
- **AT-W-05: Shipment Creation**
    - Trigger: WA ships order.
    - Expected: Shipment requires trackingNumber; ShipmentDispatched emitted.
- **AT-W-06: Direct-Ship Item**
    - Trigger: LineItem flagged `fulfillmentMethod=DIRECT_SHIP`.
    - Expected: No WA tasks; vendor tracking attached automatically.

---

## 17.4 Finance & Compliance Tests

- **AT-FIN-01: Vendor Credit Posting**
    - Trigger: FM approves SHORT_SHIP variance.
    - Expected: VendorCreditIssued event; Finance ledger updated.
- **AT-FIN-02: Write-Off Posting**
    - Trigger: FM marks item “Damaged – Unusable.”
    - Expected: WriteOffPosted event; GL code applied.
- **AT-FIN-03: Budget Threshold Alert**
    - Trigger: Spend ≥90% of district budget.
    - Expected: BudgetThresholdBreached event; alert to DM/FM.
- **AT-COMP-01: OSHA Hazard Logging**
    - Trigger: WHS reports hazard.
    - Expected: ComplianceEvent created; FM notified.

---

## 17.5 KPI & Forecasting Tests

- **AT-KPI-01: Cycle Accuracy KPI**
    - Trigger: CycleCountCompleted.
    - Expected: KPI recomputed; accuracy ≥98% threshold enforced.
- **AT-KPI-02: Pick Rate KPI**
    - Trigger: PickTaskCompleted (hourly).
    - Expected: Picks/hour ≥5 or LaborSnapshot alert generated.
- **AT-FCST-01: Forecast Draft PO**
    - Trigger: OnHand ≤ ROP.
    - Expected: Draft PO created; vendor choice logic correct.
- **AT-FCST-02: Forecast Error Tracking**
    - Trigger: Forecast vs actual demand diverges >10%.
    - Expected: ForecastAccuracy event logged; Admin alerted if persistent.

---

## 17.6 Validation Rules

- **Schema Validation:** All imports and API payloads validated against Section 5 schemas.
- **Idempotency Validation:** Duplicate requests with same `Idempotency-Key` must not duplicate records.
- **RBAC Validation:** Each role denied when accessing unauthorized endpoints.
- **Audit Completeness:** Every Create/Update/Delete action logged with correlationId + reasonCode (if required).
- **Performance Validation:** Zebra TTI ≤150ms; API latency ≤300ms p95.

---

# 18. Work Order & Gatekeeping

This section defines the **mandatory gatekeeping process** for all Shiekh S3 development and implementation activities.

---

## 18.1 Build Order (Sequential & Mandatory)

**All development must follow this exact sequence:**

**Baseline → API → UI → Chrome → Docs → Analytics/ML**

No phase may begin until the previous phase passes all Definition of Done criteria.

---

## 18.2 Definition of Done

Every phase must satisfy these **non-negotiable requirements** before progression:

### Auth/Environment Validated

- [ ]  SSO/OIDC integration functional with ≤60m JWT lifetime
- [ ]  MFA enforced for Admin/FM destructive actions
- [ ]  All environments (dev/staging/prod) deployed and accessible
- [ ]  Database migrations applied with zero data loss

### Endpoints Emit Canonical Events

- [ ]  Every CRUD operation emits corresponding Section 9 canonical events
- [ ]  Event bus lag ≤5 seconds p95
- [ ]  All endpoints return proper Section 7 error codes
- [ ]  Idempotency-Key validation working on all mutation endpoints

### UI RBAC Rules Enforced

- [ ]  Role-based route visibility enforced (Admin/FM/WHS/DM/SM/AM)
- [ ]  Cost visibility restricted to Admin/FM/Cost Analyst only
- [ ]  Store/district/warehouse scoping working correctly
- [ ]  All Section 8 UX states (loading/empty/error) implemented

### Dashboards Visible Per Role

- [ ]  Role-specific KPIs displaying correctly
- [ ]  Real-time alerts for approval timeouts and variance escalations
- [ ]  Performance metrics meeting Section 14 budgets
- [ ]  Audit trail queryable by Admin/FM with proper filtering

---

## 18.3 Prompt Rules for AI Builders

### Mandatory Reading Requirement

**All AI builders must read v14.0.0 Master Spec first.**

No exceptions. Complete specification review required before any code contribution, documentation, or implementation guidance.

### Version Declaration Requirement

**All outputs must declare current version in UI header.**

Every generated interface, document, or code artifact must prominently display "Shiekh S3 Master Specification v14.0.0" in headers, footers, or version badges.

### Sequential Work Requirement

**Work section by section only; no skipping or guessing.**

1. **Complete Section-by-Section:** Finish each specification section completely before moving to next
2. **No Cross-Section Dependencies:** Do not reference incomplete sections
3. **Specification Adherence:** Every implementation decision must cite specific section numbers
4. **Schema Compliance:** All JSON payloads must validate against Section 5 master schemas
5. **Role Awareness:** Every feature must account for Admin/FM/WHS/DM/SM/AM hierarchy

### Enforcement Standards

- **Audit Logging:** Every user action must generate immutable audit entry with correlationId
- **Error Handling:** Use Section 7.9 error codes consistently
- **Event Publishing:** Follow Section 9 event schemas exactly
- **RBAC Enforcement:** Validate role permissions at every API endpoint

---

# 19. Release Notes & Changelog

This section consolidates the evolution of the Shiekh S3 (formerly SupplySync) specification across all historical versions (v2.x → v13.x), culminating in the **canonical Master Specification v14.0.0**.

---

## 19.1 Historical Versions

### v2.x – v5.x (Foundations)

- Early SupplySync prototypes.
- Introduced product master, ordering, and variance workflows.
- Basic role hierarchy (SM, DM, FM, Admin).
- Weak enforcement of audit and RBAC.

### v6.x – v8.x (ERP Baseline)

- Formalized product schemas: `needType`, `equivalentUnit`, `purchaseUnit`.
- Vendor mapping with costs and lead times.
- Receiving workflows: SM “Receive All” or “Report Problem.”
- Variance handling (short, damaged, wrong).
- Immutable audit logs introduced.

### v9.x (Governance & Telemetry)

- Unified audit & telemetry envelopes.
- Escalation events defined (timeouts, SLA breaches).
- Contacts/stores master and supplies master polished.
- Security tightened: least privilege RBAC, cost visibility restrictions.

### v10.0 – v10.2 (SupplySync ERP)

- Automated replenishment forecasting using AI Agent.
- Store-initiated ad-hoc requests with DM/FM approval flow.
- Variance workflows hardened (FM final authority).
- Purchasing resiliency: retry + fallback vendors.
- Governance logs standardized: actor, role, reasonCode, correlationId.

### v10.3 (Warehouse Ops Extensions)

- Warehouse Associate (WHS) role introduced.
- Mobile-first workflows: receiving, pick/pack/ship, cycle counts.
- Zebra scan-first flows with offline queueing.
- Schemas added: CycleCountRequest, CycleCountResult, InventoryAdjustment, PickTask, PackTask, Shipment.
- Telemetry expanded with labor KPIs and scan events.
- Acceptance tests AT-W-01 → AT-W-08 defined.
- Performance budgets for Zebra devices established.

### v11.x – v12.x (Finance & Compliance)

- Finance hooks: GL coding, accruals, vendor credits, write-offs.
- Budget thresholds with district caps.
- OSHA compliance events logged.
- PII minimization policies added.
- Enhanced escalation (budget breaches, unresolved compliance).

### v13.x (Unified Governance)

- Analytics Service centralized KPI definitions.
- Forecasting accuracy feedback loop introduced.
- Warehouse compliance tightened: trackingNumber mandatory for shipments.
- Full role/district/store scoping formalized.
- Admin/FM authority expanded with MFA overrides.

---

## 19.2 v14.0.0 – Canonical Master Specification

This document (Sections 1 → 19) consolidates **all historical content**, resolves conflicts, and restores any dropped domains.

- **Role Hierarchy:** Admin (all-powerful), FM (almost all-powerful), WHS (trusted warehouse managers), DM/SM/AM (restricted scopes).
- **Core Workflows:** Ordering, receiving, variances, cycle counts, pick/pack/ship, forecasting, financial posting, compliance.
- **Warehouse Ops:** Dedicated WHS dashboard, full location management, Zebra mobile-first flows, label printing, mandatory tracking numbers.
- **Products:** UPCs optional, stored as aliases, never primary keys; products may exist in multiple warehouse locations.
- **Finance & Compliance:** GL hooks, accruals, credits, write-offs, OSHA hazard tracking.
- **Telemetry & KPIs:** Centralized Analytics Service; unified event catalog; labor metrics, variance rates, fill rates, forecast accuracy.
- **Security:** OIDC + MFA; least privilege enforced by RBAC; immutable audit trail; encryption in transit/at rest.
- **Accessibility & Performance:** WCAG 2.1 AA compliance; Zebra TTI ≤150ms; offline queues ≤1,000 scans.
- **Operations & Maintenance:** SLA/SLO enforcement, patch cadence, incident response protocols.
- **Migration & Rollback:** Staged rollout (pilot → district → global); rollback safeguards with snapshots and event replay.
- **Acceptance Tests:** Canonical set spanning ordering, receiving, warehouse ops, finance, KPIs, compliance.
- **Gatekeeping:** Work orders gated by FM/Admin approval with mandatory reasonCodes and MFA for destructive actions.

---

## 19.3 Final Declaration

As of **v14.0.0**, this specification is the **single canonical Master Specification** for Shiekh S3.

- All prior versions (v2.x → v13.x) are superseded.
- No content is optional or tentative.
- This document is complete, internally consistent, and authoritative.

---
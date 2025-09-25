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

## v9.3.0 - Docs Anchor Checker (dev-only)

### Added
- **Docs Anchor Checker**: Development-only tool for validating documentation anchor links against structure.md
- **Docs Anchors API**: Server endpoint for extracting and validating documentation anchors
- **Docs Lint Panel**: Floating development panel with keyboard toggle (Alt+Shift+D)
- **Docs Lint Page**: Comprehensive dashboard for documentation link validation
- **Anchor Validation**: Real-time validation of /docs# links with fix suggestions

### Technical Details
- **Docs Anchors API** (`src/app/api/meta/docs-anchors/route.ts`):
  - **Development Only**: Endpoint restricted to development environment with X-Dev-Only header
  - **Structure.md Parsing**: Reads public/docs/structure.md and extracts H1-H4 headings
  - **Anchor Generation**: Slugifies headings to create valid anchor identifiers
  - **GET Endpoint**: Returns all valid anchors with metadata and cache control
  - **POST Endpoint**: Validates a list of anchor links against structure.md
  - **Error Handling**: Comprehensive error handling with detailed error messages
  - **Cache Control**: No-cache headers to ensure fresh data in development
- **Docs Anchors Library** (`src/lib/dev/docsAnchors.ts`):
  - **Client-Side Validation**: Complete validation system for documentation links
  - **Caching System**: 5-minute cache for anchors to avoid repeated API calls
  - **Link Extraction**: Scans codebase for /docs# links with file and line information
  - **Validation Results**: Comprehensive results with valid/invalid link categorization
  - **Fix Commands**: Generates fix commands for invalid links
  - **Anchor Suggestions**: Provides suggestions for similar anchors
  - **Mock Data**: Development mock data for testing and demonstration
  - **Cache Management**: Clear cache functionality with status tracking
- **Docs Lint Panel** (`src/components/dev/DocsLintPanel.tsx`):
  - **Floating Panel**: Draggable, resizable panel with keyboard toggle (Alt+Shift+D)
  - **Real-Time Validation**: Live validation of documentation links
  - **Invalid Link Display**: Lists invalid links with file hints and context
  - **Fix Commands**: Copy fix commands to clipboard for easy resolution
  - **Deep Linking**: Open documentation at specific anchors
  - **Anchor Suggestions**: Show similar anchors for invalid links
  - **Cache Management**: Clear cache functionality with visual feedback
  - **Privacy Notice**: Clear indication of development-only functionality
- **Docs Lint Page** (`src/app/dev/docs-lint/page.tsx`):
  - **Comprehensive Dashboard**: Full-featured validation dashboard
  - **Statistics Display**: Real-time statistics for links used, defined, invalid, and unused
  - **Invalid Links Panel**: Detailed view of all invalid links with actions
  - **Unused Anchors Panel**: View of anchors defined but not referenced
  - **Bulk Actions**: Copy all fix commands and clear cache functionality
  - **Cache Status**: Real-time cache status with age display
  - **Development Notice**: Clear indication of development-only functionality
  - **Responsive Design**: Mobile-friendly layout with proper spacing
- **Anchor Validation System**:
  - **Heading Extraction**: Extracts H1-H4 headings from structure.md
  - **Slug Generation**: Converts headings to valid anchor identifiers
  - **Link Scanning**: Scans codebase for /docs# links with context
  - **Validation Logic**: Validates links against extracted anchors
  - **Error Reporting**: Detailed error reporting with file and line information
  - **Fix Suggestions**: Provides actionable fix commands
- **Development Features**:
  - **Keyboard Shortcuts**: Alt+Shift+D to toggle floating panel
  - **Drag and Drop**: Draggable panel with visual feedback
  - **Tooltips**: Comprehensive tooltips for all actions
  - **Modal Dialogs**: Anchor suggestions modal with click-to-open
  - **Clipboard Integration**: Copy fix commands and suggestions
  - **Cache Management**: Visual cache status and clear functionality
- **User Experience**:
  - **Visual Indicators**: Color-coded badges for different link states
  - **Context Information**: File, line, and context for each invalid link
  - **Action Buttons**: Quick actions for each invalid link
  - **Bulk Operations**: Copy all fix commands for batch processing
  - **Real-Time Updates**: Live updates as validation runs
  - **Error Prevention**: Clear error messages and recovery options
- **Security and Privacy**:
  - **Development Only**: All functionality gated by NODE_ENV check
  - **Local Processing**: All validation runs client-side
  - **No External Data**: No data transmitted to external services
  - **Cache Privacy**: Cache stored locally with no external access
  - **Error Handling**: Graceful error handling with no data leakage
- **Performance Optimizations**:
  - **Caching System**: 5-minute cache to reduce API calls
  - **Lazy Loading**: Components loaded only when needed
  - **Efficient Scanning**: Optimized link scanning with minimal overhead
  - **Debounced Updates**: Prevents excessive re-renders
  - **Memory Management**: Proper cleanup of event listeners and intervals
- **Future Enhancements**:
  - **File System Integration**: Real file system scanning for production use
  - **CI/CD Integration**: Automated validation in build pipelines
  - **Advanced Filtering**: Filter by file type, severity, or other criteria
  - **Export Functionality**: Export validation reports for documentation
  - **Integration Testing**: Automated testing of documentation links
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation throughout
  - **Type Definitions**: Full TypeScript support with proper interfaces
  - **Usage Examples**: Clear examples and patterns for validation
  - **Error Messages**: Detailed error messages with recovery suggestions
  - **API Reference**: Well-documented function signatures and parameters
- No schema or server changes - purely client-side development tooling

## v9.2.0 - Compliance Triage Board

### Added
- **Compliance Triage Board**: RBAC-scoped drag-and-drop board for managing compliance items
- **Triage Store**: Client-side store with localStorage persistence for compliance triage items
- **Triage Board Component**: Interactive board with drag-and-drop, keyboard navigation, and SLA tracking
- **Compliance Triage Page**: Full-featured triage page with import functionality and print view
- **Print Support**: Print-friendly triage board with comprehensive print styles

### Technical Details
- **Triage Store** (`src/lib/compliance/triageStore.ts`):
  - **Client-Side Storage**: localStorage-based persistence with key "s3:comp:triage"
  - **Item Management**: Complete CRUD operations for triage items with audit trail
  - **SLA Tracking**: Automatic SLA deadline calculation based on severity (CRITICAL: 4h, HIGH: 24h, MEDIUM: 72h, LOW: 168h)
  - **Status Workflow**: NEW → INVESTIGATING → BLOCKED → RESOLVED with validation
  - **Action Logging**: All actions logged with correlation IDs for governance trace
  - **Mock Data**: Comprehensive mock compliance events for development testing
  - **Statistics**: Real-time statistics calculation for dashboard metrics
  - **Import Functionality**: Import from compliance events API with mapping and validation
- **Triage Board Component** (`src/components/ui/TriageBoard.tsx`):
  - **Drag & Drop**: Full drag-and-drop functionality with visual feedback
  - **Keyboard Navigation**: Arrow key navigation for accessibility compliance
  - **SLA Tooltips**: Hover tooltips showing SLA deadlines and status
  - **Status Columns**: Four-column layout (NEW, INVESTIGATING, BLOCKED, RESOLVED)
  - **Item Cards**: Rich item cards with severity, priority, and SLA information
  - **Deep Linking**: Click-to-open functionality for items with href links
  - **Annotation System**: Add notes and annotations to triage items
  - **Accessibility**: ARIA labels, screen reader support, and keyboard navigation
  - **Visual Indicators**: Color-coded severity and priority badges with overdue highlighting
- **Compliance Triage Page** (`src/app/compliance/triage/page.tsx`):
  - **RBAC Protection**: Access restricted to Admin, FM, and WHS roles
  - **Statistics Dashboard**: Real-time metrics showing total items, new items, investigating, and overdue
  - **Import from API**: Mock API integration for importing compliance events
  - **Print View**: Print-friendly board layout with comprehensive print styles
  - **Clear All**: Bulk clear functionality with confirmation dialog
  - **Permission Denied**: Proper error state for unauthorized users
  - **Development Notice**: Clear indication of development-only functionality
- **Print Styles** (`src/styles/print.css`):
  - **Board Layout**: Print-optimized triage board with proper page breaks
  - **Item Styling**: Clean, professional item cards for print output
  - **Grid Layout**: Single-column layout for print with proper spacing
  - **Interactive Elements**: Hidden buttons and interactive elements for print
  - **SLA Information**: Print-friendly SLA deadline display
  - **Statistics**: Print-optimized statistics and summary information
  - **Page Breaks**: Intelligent page break handling to avoid awkward splits
- **Compliance Item Types**:
  - **COMPLIANCE_VIOLATION**: Safety protocol violations and regulatory breaches
  - **AUDIT_FINDING**: Inventory discrepancies and audit findings
  - **REGULATORY_ALERT**: Environmental compliance and regulatory notifications
  - **SECURITY_INCIDENT**: Unauthorized access attempts and security breaches
  - **DATA_BREACH**: Data security incidents and privacy violations
  - **PROCESS_DEVIATION**: Quality control bypasses and process violations
- **Severity Levels**:
  - **CRITICAL**: 4-hour SLA, immediate attention required
  - **HIGH**: 24-hour SLA, urgent resolution needed
  - **MEDIUM**: 72-hour SLA, standard resolution timeline
  - **LOW**: 168-hour SLA (1 week), routine resolution
- **Priority Levels**:
  - **URGENT**: Highest priority, immediate action required
  - **HIGH**: High priority, quick resolution needed
  - **MEDIUM**: Standard priority, normal resolution timeline
  - **LOW**: Low priority, routine resolution
- **SLA Management**:
  - **Automatic Calculation**: SLA deadlines calculated based on severity and creation time
  - **Status Tracking**: Overdue, warning, and on-time status indicators
  - **Visual Alerts**: Color-coded indicators for SLA status
  - **Tooltip Information**: Detailed SLA information on hover
- **User Experience**:
  - **Intuitive Interface**: Clear visual hierarchy with drag-and-drop functionality
  - **Real-Time Updates**: Immediate feedback for all actions
  - **Accessibility**: Full keyboard navigation and screen reader support
  - **Visual Feedback**: Clear indicators for drag states and item status
  - **Error Prevention**: Confirmation dialogs for destructive actions
- **Security Features**:
  - **RBAC Enforcement**: Role-based access control for triage board access
  - **Audit Trail**: Complete logging of all triage actions with correlation IDs
  - **Data Privacy**: All data stored locally, no external transmission
  - **Development Only**: All functionality gated by NODE_ENV check
- **Performance Optimizations**:
  - **Client-Side Processing**: All triage logic runs in the browser
  - **Efficient Storage**: Optimized localStorage usage with error handling
  - **Lazy Loading**: Components loaded only when needed
  - **Minimal Re-renders**: Optimized React state management
- **Future Enhancements**:
  - **API Integration**: Ready for server-side triage management
  - **Advanced Filtering**: Can be extended with complex filter options
  - **Notification System**: Foundation for real-time compliance alerts
  - **Reporting**: Framework for compliance reporting and analytics
  - **Workflow Automation**: Can be extended with automated triage rules
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation throughout
  - **Type Definitions**: Full TypeScript support with proper interfaces
  - **Usage Examples**: Clear examples and patterns for triage operations
  - **Error Handling**: Detailed error messages and validation feedback
  - **API Reference**: Well-documented function signatures and parameters
- No schema or server changes - purely client-side development tooling

## v9.1.0 - Orders Vendor Split (dev-only UI)

### Added
- **Orders Vendor Split UI**: Development-only vendor split functionality for orders with MFA-gated overrides
- **Vendor Split Logic**: Pure client helper for splitting orders across vendors with cost optimization
- **Vendor Split Modal**: Interactive modal with editable vendor assignments and role-scoped cost visibility
- **Order Detail Page**: New order detail page with vendor split integration
- **MFA Integration**: Vendor split overrides require MFA verification with audit logging

### Technical Details
- **Vendor Split Logic** (`src/lib/orders/vendorSplit.ts`):
  - **Mock Vendor Database**: Development-only vendor data with lead times, costs, and reliability scores
  - **Cost Optimization**: Algorithm prioritizes lowest landed cost, shortest lead time, and preferred vendors
  - **Vendor Scoring**: Weighted scoring system considering cost (40%), lead time (30%), reliability (20%), and preferred status (10%)
  - **Split Generation**: Automatically groups order lines by optimal vendor with detailed rationale
  - **Impact Calculation**: Real-time calculation of cost and lead time changes when switching vendors
  - **Validation**: Comprehensive validation of vendor split proposals with error reporting
  - **Sample Data**: Mock SKU-to-vendor mappings and vendor information for development testing
- **Vendor Split Modal** (`src/app/orders/[id]/VendorSplit.tsx`):
  - **Interactive Interface**: Table showing current vs proposed vendor groups with editable vendor assignments
  - **Role-Based Visibility**: Cost information hidden for users without Admin/FM/Cost Analyst roles
  - **Unsaved Changes Guard**: Prevents accidental loss of modifications with confirmation dialog
  - **MFA Integration**: "Apply Split (Override)" button triggers MFA modal for high-risk actions
  - **Real-Time Updates**: Dynamic recalculation of costs and lead times when vendors are changed
  - **Summary Statistics**: Overview of total groups, savings, and average lead time
  - **Line Item Details**: Expandable view of individual SKUs and quantities per vendor group
  - **Rationale Display**: Clear explanation of why each vendor was selected
- **Order Detail Page** (`src/app/orders/[id]/page.tsx`):
  - **Order Information**: Complete order details including customer info, summary, and timestamps
  - **Order Items Table**: Detailed table of SKUs, descriptions, quantities, and costs
  - **Vendor Split Button**: Secondary button for accessing vendor split functionality
  - **RBAC Integration**: Vendor split button only visible to FM and Admin roles
  - **Development Guard**: Button shows "Not available yet" tooltip in production
  - **Mock Data**: Realistic order data for development and testing
- **Security Integration**:
  - **High-Risk Action**: Vendor split overrides classified as CRITICAL risk requiring MFA
  - **Audit Logging**: All vendor split actions logged with correlation ID and reason codes
  - **RBAC Enforcement**: Cost visibility and override permissions based on user roles
  - **MFA Requirements**: Multi-factor authentication required for all vendor split overrides
  - **Reason Code Validation**: Required reason codes for vendor override actions
- **Action Buttons Integration** (`src/components/ui/ActionButtons.tsx`):
  - **Vendor Split Action**: New action configuration for vendor split operations
  - **MFA Flow**: Integrated MFA modal for vendor split overrides
  - **Error Handling**: Comprehensive error handling with user-friendly messages
  - **Loading States**: Visual feedback during MFA verification and action execution
- **Development Features**:
  - **Mock Vendor Data**: Comprehensive vendor database with realistic cost and lead time data
  - **SKU Mapping**: Mock SKU-to-vendor mappings for testing different scenarios
  - **Cost Calculations**: Realistic landed cost calculations including shipping and base costs
  - **Console Logging**: Detailed logging of vendor split payloads for audit parity
  - **No Network Writes**: All operations are client-side with console logging for development
- **User Experience**:
  - **Intuitive Interface**: Clear visual hierarchy with cards, tables, and action buttons
  - **Real-Time Feedback**: Immediate updates when vendors are changed
  - **Cost Transparency**: Clear display of cost savings and lead time impacts
  - **Permission Awareness**: Users see appropriate information based on their role
  - **Error Prevention**: Validation and confirmation dialogs prevent accidental actions
- **Performance Optimizations**:
  - **Client-Side Processing**: All vendor split logic runs in the browser
  - **Efficient Calculations**: Optimized algorithms for vendor scoring and cost calculations
  - **Lazy Loading**: Modal content loaded only when needed
  - **Minimal Re-renders**: Optimized React state management for smooth interactions
- **Security Features**:
  - **Development Only**: All vendor split functionality gated by NODE_ENV check
  - **MFA Protection**: Critical vendor overrides require multi-factor authentication
  - **Audit Trail**: Complete logging of all vendor split actions and decisions
  - **Role-Based Access**: Granular permissions for cost visibility and override actions
  - **Data Privacy**: No sensitive data transmitted externally in development mode
- **Future Enhancements**:
  - **API Integration**: Ready for server-side vendor split implementation
  - **Advanced Algorithms**: Can be extended with more sophisticated optimization logic
  - **Vendor Management**: Foundation for vendor preference and performance tracking
  - **Cost Analytics**: Framework for vendor cost analysis and reporting
  - **Approval Workflows**: Can be extended with multi-level approval processes
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation throughout
  - **Type Definitions**: Full TypeScript support with proper interfaces
  - **Usage Examples**: Clear examples and patterns for vendor split operations
  - **Error Handling**: Detailed error messages and validation feedback
  - **API Reference**: Well-documented function signatures and parameters
- No schema or server changes - purely client-side development tooling

## v9.0.0 - Dev Schema-Conformance Overlay (Section 7)

### Added
- **Dev Schema-Conformance Overlay**: Development-only schema validation overlay for Section 7 API contracts
- **JSON Schema Validation**: Comprehensive JSON schemas for orders, variances, approvals, and audit endpoints
- **Schema Validation Checker**: Minimal JSON Schema validator with §7.9 error code mapping
- **HTTP Client Integration**: Automatic request/response validation in http.ts with dev-only hooks
- **Schema Overlay UI**: Draggable panel with validation results, diff views, and sample payloads

### Technical Details
- **JSON Schemas** (`src/lib/schemas/`):
  - **Orders Schemas** (`orders.ts`): Complete schemas for GET/POST /orders, POST /orders/{id}/approve endpoints
  - **Variances Schemas** (`variances.ts`): Schemas for GET/POST /variances, POST /variances/{id}/approve endpoints
  - **Approvals Schemas** (`approvals.ts`): Schemas for GET/POST /approvals, POST /approvals/{id}/approve, GET /audit endpoints
  - **Common Fields** (`index.ts`): Shared field definitions (id, timestamp, correlationId, actorUserId, etc.)
  - **Response Wrappers**: Standard response wrapper schemas with success, data, error, and meta fields
  - **Pagination Schema**: Consistent pagination structure across all list endpoints
  - **Error Response Schema**: Standardized error response format aligned to §7.9 codes
- **Schema Validation Checker** (`src/lib/dev/schemaCheck.ts`):
  - **Minimal Validator**: Lightweight JSON Schema validator without external dependencies
  - **§7.9 Error Mapping**: Maps validation failures to VAL_001 (bad type), VAL_002 (missing field), BIZ_002 (invalid state)
  - **Endpoint Mapping**: Maps endpoint identifiers to appropriate request/response schemas
  - **Type Validation**: Validates object, array, string, number, boolean types with constraints
  - **Format Validation**: Supports date-time, email, URI format validation
  - **Pattern Matching**: Regex pattern validation for IDs, codes, and structured strings
  - **Enum Validation**: Validates against allowed enum values
  - **Range Validation**: Min/max value and length validation
  - **Sample Generation**: Creates sample payloads from schema definitions
- **Schema Overlay Component** (`src/components/dev/SchemaOverlay.tsx`):
  - **Draggable Panel**: Resizable, draggable overlay with keyboard toggle (Alt+Shift+S)
  - **Validation Results**: Lists recent requests/responses with pass/fail badges
  - **Diff View**: Clicking entries expands detailed validation error information
  - **Sample Payloads**: "Copy sample payload" button for generating test data
  - **Documentation Links**: "Open Docs" button linking to /docs#7-API-Contracts
  - **Local Storage**: Persists validation entries across browser sessions
  - **Privacy Note**: Clear indication that no data is transmitted externally
  - **Entry Management**: Clear all entries functionality with confirmation
- **HTTP Client Integration** (`src/lib/client/http.ts`):
  - **Automatic Validation**: Validates outgoing requests and incoming responses for known endpoints
  - **Endpoint Extraction**: Intelligently extracts endpoint identifiers from URLs and methods
  - **Path Parameter Handling**: Replaces numeric IDs, UUIDs, and other patterns with {id} placeholders
  - **Dev-Only Execution**: All validation logic is gated by `process.env.NODE_ENV === 'development'`
  - **Error Logging**: Console warnings for validation failures with detailed error information
  - **Callback Integration**: Connects validation results to the overlay component
  - **Zero Production Impact**: No runtime overhead or code execution in production builds
- **Layout Integration** (`src/app/layout.tsx`):
  - **SchemaOverlayProvider**: Development-only provider for schema overlay functionality
  - **Portal Mounting**: Overlay is mounted as a portal and hidden by default
  - **Provider Chain**: Integrated into the existing provider hierarchy
- **Schema Coverage**:
  - **Orders API**: GET /orders, GET /orders/{id}, POST /orders, POST /orders/{id}/approve
  - **Variances API**: GET /variances, GET /variances/{id}, POST /variances, POST /variances/{id}/approve
  - **Approvals API**: GET /approvals, GET /approvals/{id}, POST /approvals, POST /approvals/{id}/approve
  - **Audit API**: GET /audit with comprehensive audit entry schemas
  - **Request Schemas**: All POST endpoints have corresponding request body schemas
  - **Response Schemas**: All endpoints have standardized response wrapper schemas
- **Validation Features**:
  - **Type Safety**: Full TypeScript support with proper interfaces and type definitions
  - **Error Mapping**: Validation errors mapped to §7.9 error codes for consistency
  - **Path Tracking**: Detailed error paths for nested object validation
  - **Expected vs Actual**: Clear comparison between expected and actual values
  - **Code Descriptions**: Human-readable descriptions for all validation error codes
  - **Sample Generation**: Automatic generation of sample payloads for testing
- **Developer Experience**:
  - **Real-Time Validation**: Immediate feedback on API request/response conformance
  - **Visual Indicators**: Clear pass/fail badges with error counts
  - **Detailed Inspection**: Expandable error details with path and value information
  - **Sample Data**: Easy access to sample payloads for testing and development
  - **Documentation Integration**: Direct links to API documentation
  - **Keyboard Shortcuts**: Alt+Shift+S to toggle overlay visibility
  - **Persistent Storage**: Validation history preserved across browser sessions
- **Performance Optimizations**:
  - **Lazy Loading**: Schema validation modules loaded only in development
  - **Tree Shaking**: All schema code is tree-shaken in production builds
  - **Minimal Overhead**: Lightweight validator with no external dependencies
  - **Efficient Storage**: Limited to 50 most recent validation entries
  - **Conditional Execution**: All validation logic gated by environment checks
- **Security and Privacy**:
  - **Development Only**: No validation code executes in production
  - **Local Storage**: All validation data stored locally, never transmitted
  - **Privacy Notice**: Clear indication that no external data transmission occurs
  - **RBAC Respect**: Validation respects existing role-based access controls
- **Error Handling**:
  - **Graceful Degradation**: Validation failures don't break application functionality
  - **Console Logging**: Detailed error information logged for debugging
  - **Error Recovery**: Validation errors are caught and handled gracefully
  - **Fallback Behavior**: Unknown endpoints are handled without validation
- **Future Enhancements**:
  - **Additional Endpoints**: Easy to add schemas for new API endpoints
  - **Custom Validators**: Extensible validation system for custom business rules
  - **Export Functionality**: Can be extended to export validation reports
  - **Integration Testing**: Schemas can be used for automated API testing
  - **Documentation Generation**: Schemas can generate API documentation
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation throughout
  - **Type Definitions**: Clear interfaces and type safety
  - **Usage Examples**: Clear examples and patterns for schema definition
  - **Error Codes**: Complete mapping of validation errors to §7.9 codes
  - **API Reference**: Well-documented function signatures and parameters
- No schema or server changes - purely client-side development tooling

## v8.8.0 - Print-to-PDF: Audit & Approvals

### Added
- **Structured Print-to-PDF**: Comprehensive print functionality for Audit and Approvals with provenance and signatures
- **PrintFrame Component**: Standard print shell with header, footer, and page-break rules
- **Provenance Component**: Provenance block with filters, role, correlation ID, and SHA1 hash verification
- **Approvals Print Page**: New print-friendly approvals page with RBAC restrictions
- **Enhanced Print Styles**: Extended CSS with @page rules, running headers/footers, and page-break utilities

### Technical Details
- **PrintFrame Component** (`src/components/print/PrintFrame.tsx`):
  - **Standard Print Shell**: Top header with logo, "Shiekh S3 Master Specification v14.0.0", current role, timestamp
  - **Footer**: Page X of Y, build hash (from APP_VERSION), and contact line
  - **Consistent Margins**: Yields consistent margins and page-break rules for all print documents
  - **Print-Specific Styles**: Optimized styling for both screen preview and actual printing
  - **Page Break Controls**: Built-in utilities for controlling page breaks and avoiding awkward splits
- **Provenance Component** (`src/components/print/Provenance.tsx`):
  - **Provenance Block**: Renders filters (key=value chips), effectiveRole, actorUserId, correlationId
  - **SHA1 Hash**: Generates SHA1 hash of (filters + timestamp + route) for verification
  - **QR Code**: Small QR (data URL) that encodes the provenance JSON for quick verification
  - **Print Optimization**: Compact layout optimized for print with proper page-break avoidance
  - **Data Integrity**: Ensures document authenticity and traceability
- **Audit Print Page Augmentation** (`src/app/audit/print/page.tsx`):
  - **PrintFrame Integration**: Uses PrintFrame and Provenance components for consistent layout
  - **Compact Signatures**: Added signatures row with "Prepared by", "Reviewed by", "Approved by" fields
  - **Page Break Control**: Long tables avoid row breaks with `page-break-inside: avoid`
  - **Enhanced Layout**: Improved spacing and typography for professional print output
  - **Important Notes**: Added compliance and confidentiality notes for audit documents
- **Approvals Print Page** (`src/app/(app)/approvals/print/page.tsx`):
  - **New Print Page**: Mirrors approvals list with columns: requestId, type, urgency, submittedAt, pendingTime, status
  - **RBAC Protection**: Page only accessible to DM/FM/Admin roles with proper error handling
  - **Print View Button**: Added "Print View" button on main approvals page that routes to print with current filters
  - **Summary Statistics**: Added summary section with pending/approved/returned counts and total amounts
  - **Filter Integration**: Preserves current filters when opening print view
  - **Professional Layout**: Clean, structured layout optimized for PDF generation
- **Enhanced Print Styles** (`src/styles/print.css`):
  - **@page Rules**: Size auto with margin tuned for A4/Letter with running header/footer using CSS counters
  - **Page Break Utilities**: `.break-before`, `.avoid-break`, `.break-inside-avoid` utilities for precise control
  - **Running Headers/Footers**: CSS-generated headers and footers with page numbers and build information
  - **Table Optimization**: Enhanced table styling with proper page-break controls and header repetition
  - **Component Styles**: Specific styles for PrintFrame, Provenance, signatures, and summary sections
  - **Print-Specific Typography**: Optimized font sizes, spacing, and colors for print output
- **Print Integration Features**:
  - **Auto-Print**: Pages automatically trigger print dialog when loaded
  - **Filter Preservation**: Current filters are passed to print pages via URL parameters
  - **RBAC Integration**: Print pages respect role-based access control
  - **Deep Linking**: Print pages can be accessed directly with specific filter parameters
  - **Professional Output**: Clean, professional layout suitable for official documentation
- **Print Frame Features**:
  - **Header Section**: Company logo, specification version, report title, and timestamp
  - **Footer Section**: Page numbering, build hash, and contact information
  - **Content Area**: Properly spaced content area with consistent margins
  - **Page Break Management**: Intelligent page break handling to avoid awkward splits
  - **Print Optimization**: Optimized for both screen preview and actual printing
- **Provenance Features**:
  - **Filter Display**: Shows all active filters in key=value format
  - **Role Information**: Displays current user role and permissions
  - **Correlation Tracking**: Unique correlation ID for document tracking
  - **Hash Verification**: SHA1 hash for document integrity verification
  - **QR Code**: Quick verification via QR code containing provenance data
  - **Timestamp**: Precise timestamp of document generation
- **Audit Print Features**:
  - **Comprehensive Tables**: Full audit and compliance event tables with all relevant columns
  - **Filter Summary**: Clear display of applied filters and report parameters
  - **Signatures Section**: Professional signature blocks for approval workflow
  - **Important Notes**: Compliance and confidentiality notices
  - **Page Break Control**: Tables avoid breaking across pages inappropriately
- **Approvals Print Features**:
  - **Request Details**: Complete approval request information with status and urgency
  - **Summary Statistics**: Overview of pending, approved, and returned requests
  - **Amount Totals**: Financial summary with total amounts
  - **Status Indicators**: Clear visual indicators for request status and urgency
  - **Professional Layout**: Clean, structured layout for official documentation
- **Print Style Enhancements**:
  - **Page Setup**: Optimized margins and page size for A4/Letter formats
  - **Typography**: Print-optimized font sizes and spacing
  - **Color Handling**: Proper color conversion for black and white printing
  - **Table Styling**: Enhanced table borders, spacing, and readability
  - **Badge Styling**: Print-friendly status and urgency indicators
  - **Signature Blocks**: Professional signature areas with proper spacing
- **Accessibility Features**:
  - **Screen Reader Support**: Proper semantic structure for assistive technologies
  - **Print Accessibility**: Optimized for screen readers and print accessibility
  - **Color Contrast**: High contrast for better readability in print
  - **Font Sizing**: Appropriate font sizes for readability
- **Performance Optimizations**:
  - **Lazy Loading**: Print pages load efficiently with minimal overhead
  - **CSS Optimization**: Efficient print styles with minimal impact on screen rendering
  - **Memory Management**: Proper cleanup and resource management
- **Security Features**:
  - **RBAC Protection**: Role-based access control for print pages
  - **Data Integrity**: Provenance verification and correlation tracking
  - **Audit Trail**: All print actions are logged and traceable
  - **Confidentiality**: Proper handling of sensitive information in print output
- **User Experience**:
  - **Seamless Integration**: Print functionality integrates smoothly with existing workflows
  - **Filter Preservation**: Current filters are maintained when opening print view
  - **Professional Output**: High-quality print output suitable for official use
  - **Easy Access**: Simple button to access print view from main pages
- **Future Enhancements**:
  - **PDF Generation**: Can be extended with server-side PDF generation
  - **Email Integration**: Print pages can be extended for email distribution
  - **Template System**: Flexible template system for different document types
  - **Batch Printing**: Support for printing multiple documents at once
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **Usage Examples**: Clear examples and patterns
  - **Print Guidelines**: Best practices for print document design
  - **Accessibility Notes**: Guidelines for print accessibility
- No schema or server changes - purely client-side print functionality

## v8.9.0 - Budget-Breach Alerts (UI)

### Added
- **Budget-Breach Alerts**: Comprehensive alerting system with toast notifications and notification bell
- **Toast Notifications**: Top-right toasts with auto-dismiss and accessibility features
- **Notification Bell**: Unread count indicator with alert panel and deep-linking
- **Alert Event Bus**: Tiny event bus for managing alerts with RBAC visibility
- **Deep-Linking**: Alert actions navigate to relevant routes with query parameters

### Technical Details
- **Alerts Event Bus** (`src/lib/alerts/bus.ts`):
  - **Event Management**: Tiny event bus with alert types (BudgetThresholdBreached, ComplianceAlert)
  - **Severity Levels**: WARN and CRITICAL severity with appropriate styling
  - **RBAC Integration**: Role-based alert visibility (budget alerts for Admin, FM, Cost Analyst)
  - **Local Storage**: Persistent alert storage with automatic cleanup
  - **React Hooks**: useAlerts() and useFilteredAlerts() for component integration
  - **Utility Functions**: AlertUtils for creating common alert types
- **Toast Notifications** (`src/components/ui/ToastHost.tsx`):
  - **Top-Right Positioning**: Fixed position toasts with proper z-index
  - **Auto-Dismiss**: 8-second auto-dismiss for WARN alerts, manual dismiss for CRITICAL
  - **Accessibility**: role="status" aria-live="polite" with proper ARIA labels
  - **Cap Management**: Maximum 3 visible toasts with overflow handling
  - **Deep-Linking**: "View Details" buttons navigate to relevant routes
  - **Severity Styling**: Color-coded toasts based on alert severity
- **Notification Bell** (`src/components/ui/NotificationBell.tsx`):
  - **Unread Count**: Badge showing number of unread alerts
  - **Alert Panel**: Dropdown panel with recent alerts and actions
  - **Deep-Linking**: Clicking alerts navigates via href to target routes
  - **Mark as Read**: Individual and bulk mark-as-read functionality
  - **Time Formatting**: Relative time display (e.g., "2h ago", "1d ago")
  - **Severity Indicators**: Visual indicators for alert severity levels
- **KPI Registry Integration** (`src/lib/kpi/registry.ts`):
  - **Budget Breach Detection**: Automatic detection when KPI values cross thresholds
  - **Alert Emission**: Dynamic alert creation when budget thresholds are breached
  - **Deep-Link Mapping**: Route mapping for different KPI types
  - **Threshold Checking**: ≥90% budget threshold checking per §6.6 specification
  - **Circular Dependency Prevention**: Dynamic imports to avoid circular dependencies
- **Main Page Integration** (`src/app/page.tsx`):
  - **ToastHost Mount**: Global toast notification system
  - **Notification Bell**: Integrated with StatusBar for easy access
  - **Alert Feed**: Unified alert feed between toast and bell components
  - **RBAC Filtering**: Role-based alert visibility throughout the system
- **Alert Types**:
  - **BudgetThresholdBreached**: Triggered when budget KPIs exceed thresholds
  - **ComplianceAlert**: General compliance and system alerts
  - **Severity Levels**: WARN (yellow) and CRITICAL (red) with appropriate styling
  - **Correlation IDs**: Unique identifiers for tracking and debugging
- **Deep-Linking System**:
  - **Route Mapping**: KPI-specific routes with query parameters
  - **Query Parameters**: Filter and status parameters for targeted navigation
  - **Fallback Routes**: Default dashboard route for unmapped alerts
  - **Navigation Integration**: Seamless integration with Next.js router
- **RBAC Integration**:
  - **Budget Alerts**: Visible only to Admin, FM, and Cost Analyst roles
  - **Compliance Alerts**: Visible to all roles
  - **Role Filtering**: Automatic filtering based on user's effective role
  - **Permission Checks**: Proper permission validation for alert visibility
- **Accessibility Features**:
  - **Screen Reader Support**: Proper ARIA labels and live regions
  - **Keyboard Navigation**: Full keyboard support for all interactions
  - **Focus Management**: Proper focus handling and escape key support
  - **Color Contrast**: WCAG AA compliant color schemes
  - **Semantic HTML**: Proper semantic structure for assistive technologies
- **Performance Optimizations**:
  - **Event Bus Efficiency**: Minimal re-renders with optimized state management
  - **Local Storage**: Efficient storage with automatic cleanup
  - **Dynamic Imports**: Lazy loading to prevent circular dependencies
  - **Memory Management**: Proper cleanup and resource management
- **User Experience**:
  - **Visual Feedback**: Clear severity indicators and status updates
  - **Auto-Dismiss**: Smart auto-dismiss behavior based on severity
  - **Bulk Actions**: Mark all as read functionality
  - **Time Context**: Relative time display for better context
  - **Action Buttons**: Clear action buttons for dismissing and viewing details
- **Development Features**:
  - **Mock Alerts**: Client-side alert generation for development
  - **Debug Information**: Console logging for development debugging
  - **Type Safety**: Full TypeScript support with proper interfaces
  - **Error Handling**: Graceful error handling and recovery
- **Production Readiness**:
  - **Error Boundaries**: Proper error handling and recovery
  - **Performance**: Optimized for production use
  - **Security**: Role-based access control
  - **Scalability**: Efficient algorithms for large alert volumes
  - **Maintainability**: Clean, documented code structure
- **Future Enhancements**:
  - **Real-Time Updates**: Can be extended with WebSocket integration
  - **Alert Categories**: Additional alert types and categories
  - **Notification Preferences**: User-configurable notification settings
  - **Alert History**: Extended alert history and archiving
  - **Integration Points**: Ready for backend notification service integration
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **Type Definitions**: Clear interfaces and type safety
  - **Usage Examples**: Clear examples and patterns
  - **API Documentation**: Well-documented function signatures
  - **Error Handling**: Clear error messages and recovery paths
- No schema or server changes - purely client-side alerting system

## v8.5.0 - Approvals Next-Pending Loop + Sticky Filters

### Added
- **Next-Pending Loop**: Keyboard shortcuts (N/Shift+N) for navigating pending approvals
- **Sticky Filters**: Persistent filters with role-based localStorage and URL deep linking
- **Deterministic Ordering**: Pending-first ordering with urgency and creation date sorting
- **Auto-Advance**: Automatic navigation to next pending approval after actions
- **Approval Detail Page**: Comprehensive approval details with action buttons

### Technical Details
- **Sticky Filters Hook** (`src/lib/hooks/useStickyFilters.ts`):
  - **Role-Based Persistence**: localStorage keys with role-specific storage (`s3:approvals:filters:<role>`)
  - **URL Deep Linking**: Filter state synchronized with URL parameters
  - **Filter Management**: Status and urgency filters with chip-based UI
  - **Utility Functions**: Filter application, counts, and color coding
  - **Type Safety**: Full TypeScript support with proper interfaces
- **Approvals Ordering** (`src/lib/approvals/ordering.ts`):
  - **Deterministic Sorting**: Pending-first with urgency and creation date priority
  - **Navigation Utilities**: Next/previous pending index calculation
  - **Statistics**: Comprehensive approval statistics and filtering
  - **Type Definitions**: Proper ApprovalItem interface and utility types
  - **Performance**: Efficient sorting and filtering algorithms
- **ApprovalsList Component** (`src/components/ui/ApprovalsList.tsx`):
  - **Keyboard Navigation**: N for next pending, Shift+N for previous pending
  - **Auto-Advance**: Automatic navigation after approve/return actions
  - **Visual Indicators**: Clear status badges and urgency indicators
  - **Action Buttons**: Approve/return with loading states and error handling
  - **Statistics Display**: Real-time counts and status summaries
- **Approvals Page** (`src/app/(app)/approvals/page.tsx`):
  - **Filter Integration**: Sticky filters with toolbar and chip display
  - **Counts Header**: Pending, approved today, returned today statistics
  - **Role-Based Access**: Proper RBAC with access control
  - **Mock Data**: Comprehensive test data for development
  - **Responsive Design**: Mobile-friendly layout with proper spacing
- **Approval Detail Page** (`src/app/(app)/approvals/[id]/page.tsx`):
  - **Comprehensive Details**: Full approval information with attachments
  - **Action Integration**: Approve/return with event bubbling
  - **Navigation**: Back button and breadcrumb navigation
  - **Loading States**: Proper loading and error handling
  - **Event System**: Custom events for parent component communication
- **Filter System**:
  - **Status Filtering**: PENDING, APPROVED, RETURNED status filtering
  - **Urgency Filtering**: HIGH, MEDIUM, LOW urgency filtering
  - **Combined Filters**: Multiple filter criteria with AND logic
  - **Clear Filters**: Easy filter reset with single button
  - **Filter Chips**: Visual representation of active filters
- **Keyboard Shortcuts**:
  - **N Key**: Navigate to next pending approval
  - **Shift+N**: Navigate to previous pending approval
  - **Context Awareness**: Only active when not in input fields
  - **Visual Feedback**: Toast notifications for navigation actions
  - **Wrap-Around**: Seamless navigation between first and last items
- **Auto-Advance System**:
  - **Post-Action Navigation**: Automatic advance after approve/return
  - **Filter Respect**: Only advances to approvals matching current filters
  - **Smart Selection**: Maintains context and scroll position
  - **Error Handling**: Graceful handling of navigation failures
  - **User Control**: Optional auto-advance with manual override
- **Ordering Algorithm**:
  - **Priority 1**: Status (PENDING first, then RETURNED, then APPROVED)
  - **Priority 2**: Urgency (HIGH first, then MEDIUM, then LOW)
  - **Priority 3**: Creation Date (older first for pending items)
  - **Deterministic**: Consistent ordering across sessions
  - **Performance**: Efficient sorting with minimal re-renders
- **State Management**:
  - **Local Storage**: Persistent filter state across sessions
  - **URL Synchronization**: Deep linking with filter parameters
  - **Role-Based**: Different filter sets per user role
  - **Validation**: Proper type checking and error handling
  - **Cleanup**: Automatic cleanup of invalid or expired data
- **User Experience**:
  - **Visual Feedback**: Clear status indicators and progress states
  - **Keyboard Navigation**: Full keyboard support for power users
  - **Responsive Design**: Works on all screen sizes
  - **Accessibility**: Proper ARIA labels and keyboard navigation
  - **Performance**: Optimized rendering and minimal re-renders
- **Integration Points**:
  - **Role Provider**: Integration with existing role system
  - **Toast System**: Integration with notification system
  - **Router**: Deep linking and navigation integration
  - **Event System**: Custom events for component communication
  - **API Layer**: Ready for real API integration
- **Development Features**:
  - **Mock Data**: Comprehensive test data for development
  - **Error Simulation**: Proper error handling and recovery
  - **Loading States**: Realistic loading and processing states
  - **Debug Information**: Console logging for development
  - **Type Safety**: Full TypeScript support throughout
- **Production Readiness**:
  - **Error Boundaries**: Proper error handling and recovery
  - **Performance**: Optimized for production use
  - **Security**: Role-based access control
  - **Scalability**: Efficient algorithms for large datasets
  - **Maintainability**: Clean, documented code structure
- **Future Enhancements**:
  - **Bulk Actions**: Can be extended with bulk approve/return
  - **Advanced Filters**: Date range, user, and custom filters
  - **Search**: Full-text search across approval details
  - **Notifications**: Real-time updates and notifications
  - **Analytics**: Approval metrics and reporting
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **Type Definitions**: Clear interfaces and type safety
  - **Usage Examples**: Clear examples and patterns
  - **API Documentation**: Well-documented function signatures
  - **Error Handling**: Clear error messages and recovery paths
- No schema or server changes - purely client-side enhancements

## v8.4.0 - Version Guard (dev-only)

### Added
- **Dev-Only Version Guard**: Verifies consistency between version.ts and CHANGELOG.md
- **Version HUD**: Development-only interface for version checking and management
- **API Route**: /api/meta/changelog endpoint for reading changelog version
- **Status Bar Integration**: Clickable version indicator in development mode
- **Keyboard Shortcut**: Ctrl+Alt+V to trigger version check

### Technical Details
- **API Route** (`src/app/api/meta/changelog/route.ts`):
  - **Dev-Only Access**: Only available in development environment
  - **File System Reading**: Reads CHANGELOG.md from src/content/ directory
  - **Version Extraction**: Uses regex to extract top version (## vX.Y.Z pattern)
  - **Error Handling**: Clear error messages for missing or malformed changelog
  - **Response Headers**: X-Dev-Only header for development identification
  - **Caching**: No-cache headers to ensure fresh data
- **Version Guard Library** (`src/lib/dev/versionGuard.ts`):
  - **Version Comparison**: Compares APP_VERSION with changelog version
  - **Caching System**: 30-second cache to minimize API calls
  - **Error Handling**: Network error handling and graceful degradation
  - **Version Analysis**: Determines if app version is newer/older than changelog
  - **Guidance System**: Provides fix suggestions for version mismatches
  - **Keyboard Integration**: Ctrl+Alt+V shortcut for manual version checks
- **Version HUD Component** (`src/components/dev/VersionHUD.tsx`):
  - **Development-Only**: Only renders in development environment
  - **Lazy Loading**: Minimal idle cost with fetch on first open
  - **Status Display**: Clear visual indicators for version match/mismatch/error
  - **Action Buttons**: Check version, force check, open changelog, copy versions
  - **Error Handling**: User-friendly error messages with guidance
  - **Accessibility**: Full keyboard navigation and screen reader support
- **Status Bar Integration** (`src/components/ui/StatusBar.tsx`):
  - **Development Indicator**: Small clickable "🔍 Version" button
  - **Tooltip**: Clear description of version checking functionality
  - **HUD Integration**: Seamless integration with VersionHUD component
  - **Conditional Rendering**: Only shows in development mode
- **Version Management**:
  - **Consistency Checking**: Ensures version.ts matches CHANGELOG.md top entry
  - **Mismatch Detection**: Identifies when versions are out of sync
  - **Fix Guidance**: Provides clear instructions for resolving mismatches
  - **Audit Trail**: Timestamps and detailed comparison information
- **Development Experience**:
  - **Minimal Overhead**: Lazy loading and caching to avoid performance impact
  - **Keyboard Shortcuts**: Ctrl+Alt+V for quick version checking
  - **Visual Feedback**: Clear status indicators and error messages
  - **Easy Access**: One-click access from status bar
- **Error Handling**:
  - **File System Errors**: Graceful handling of missing or unreadable files
  - **Network Errors**: Proper error handling for API failures
  - **Parse Errors**: Clear guidance for malformed changelog entries
  - **User Guidance**: Specific instructions for fixing common issues
- **Production Safety**:
  - **Dev-Only**: All functionality completely disabled in production
  - **No Impact**: Zero overhead or code execution in production builds
  - **API Protection**: 404 responses for production requests
  - **Tree Shaking**: All dev-only code can be eliminated in production
- **Accessibility**:
  - **Keyboard Navigation**: Full keyboard support for all interactions
  - **Screen Reader**: Proper ARIA labels and descriptions
  - **Focus Management**: Proper focus handling and escape key support
  - **Error Announcements**: Screen reader announcements for errors
- **Performance**:
  - **Caching**: 30-second cache to minimize redundant API calls
  - **Lazy Loading**: Version check only runs when needed
  - **Minimal Re-renders**: Optimized state management
  - **Efficient Parsing**: Fast regex-based version extraction
- **Integration Points**:
  - **Status Bar**: Seamless integration with existing status bar
  - **Keyboard System**: Integration with global keyboard shortcuts
  - **File System**: Direct access to changelog file
  - **Version System**: Integration with existing version management
- **Future Enhancements**:
  - **Auto-Check**: Can be extended with automatic version checking
  - **Git Integration**: Can be extended with git-based version detection
  - **CI/CD Integration**: Can be extended with build-time version validation
  - **Team Notifications**: Can be extended with team-wide version alerts
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **User Guidance**: Clear instructions and help text
  - **Error Messages**: Specific guidance for common issues
  - **Development Notes**: Clear development and testing instructions
- No schema or server changes - purely client-side development tool

## v8.3.0 - MFA Gate for High-Risk Actions (UI + http.ts hook)

### Added
- **MFA Gate UI**: Secure modal for high-risk actions requiring multi-factor authentication
- **High-Risk Action Security**: Comprehensive security library for action classification and validation
- **HTTP Client with MFA Support**: Enhanced fetch wrapper with MFA headers and error handling
- **Action Buttons Component**: Reusable component for high-risk operations with MFA flow
- **Development Simulator**: Auto-fill MFA for testing with localStorage flag

### Technical Details
- **High-Risk Security Library** (`src/lib/security/highRisk.ts`):
  - **Action Classification**: Enum for high-risk actions (APPROVE_ORDER, RETURN_ORDER, APPROVE_VARIANCE, RETURN_VARIANCE, VENDOR_OVERRIDE)
  - **MFA Requirements**: All high-risk actions require MFA verification
  - **Risk Assessment**: HIGH/CRITICAL risk levels with detailed impact analysis
  - **Reason Code Validation**: Required reason codes for each action type
  - **Audit Trail**: Correlation ID generation and audit message formatting
  - **RBAC Integration**: Role-based permission checks for high-risk actions
- **MFA Modal Component** (`src/components/ui/MfaModal.tsx`):
  - **Secure Authentication**: 6-digit OTP input with validation
  - **Reason Code Selection**: Dropdown with action-specific reason codes
  - **Accessibility**: Full WCAG AA compliance with focus trap, ARIA labels, and keyboard navigation
  - **Error Handling**: Clear error messages with retry capability
  - **Security Notice**: User education about audit logging and session timeout
  - **Development Mode**: Auto-fill capability for testing (localStorage flag)
- **HTTP Client Enhancement** (`src/lib/client/http.ts`):
  - **MFA Header Support**: Automatic injection of X-MFA-Token and X-MFA-OTP headers
  - **Error Code Mapping**: HTTP status to §7.9 error code mapping (401→AUTH_001, 403→AUTH_002, etc.)
  - **MFA Error Detection**: Automatic detection of AUTH_002 with mfaRequired flag
  - **Correlation ID**: Automatic generation and tracking for audit trails
  - **Type Safety**: Full TypeScript support with proper error typing
  - **Network Resilience**: Proper error wrapping and network failure handling
- **Action Buttons Component** (`src/components/ui/ActionButtons.tsx`):
  - **High-Risk Action Flow**: Automatic MFA modal trigger for sensitive operations
  - **Visual Indicators**: Risk level badges and appropriate button variants
  - **Success/Error Handling**: Toast notifications with correlation IDs
  - **Loading States**: Proper loading indicators during action execution
  - **Predefined Actions**: Common action configurations for orders and variances
  - **Development Integration**: Auto-fill support with visual indicators
- **Security Features**:
  - **MFA Token Management**: Secure token and OTP handling
  - **Session Timeout**: Configurable timeout based on action risk level
  - **Audit Logging**: Comprehensive logging with correlation IDs
  - **Role-Based Access**: Integration with existing RBAC system
  - **Input Validation**: OTP format validation and reason code verification
- **Error Handling**:
  - **Typed Errors**: Proper error typing with MfaRequiredError interface
  - **Error Recovery**: Clear error messages with retry mechanisms
  - **Fallback Behavior**: Graceful degradation when backend doesn't support MFA
  - **User Guidance**: Clear instructions for error resolution
- **Development Experience**:
  - **Auto-Fill Simulator**: localStorage flag for automatic MFA completion
  - **Visual Indicators**: Clear development mode notifications
  - **Testing Support**: Easy testing of MFA flows without real tokens
  - **Debug Information**: Correlation IDs in all success/error messages
- **Accessibility**:
  - **WCAG AA Compliance**: Full accessibility support per §14.1
  - **Keyboard Navigation**: Complete keyboard support for all interactions
  - **Screen Reader**: Proper ARIA labels and descriptions
  - **Focus Management**: Focus trap and proper focus handling
  - **Error Announcements**: Screen reader announcements for errors
- **Integration Points**:
  - **Toast System**: Integration with existing toast notification system
  - **Role Provider**: Integration with role-based access control
  - **HTTP Client**: Seamless integration with existing API calls
  - **Error Boundaries**: Proper error boundary integration
- **Production Safety**:
  - **No JWT Changes**: MFA headers are additive, no existing auth changes
  - **Backward Compatibility**: Works even if backend doesn't support MFA
  - **Graceful Degradation**: Friendly error messages for unsupported backends
  - **Security First**: All high-risk actions require MFA by default
- **Audit and Governance**:
  - **Correlation IDs**: Every action tracked with unique correlation ID
  - **Audit Messages**: Structured audit messages for compliance
  - **Reason Codes**: Required business justification for all actions
  - **Risk Assessment**: Detailed risk analysis for each action type
- **Performance**:
  - **Lazy Loading**: MFA modal only loads when needed
  - **Efficient State**: Minimal re-renders with optimized state management
  - **Network Optimization**: Efficient HTTP client with proper error handling
  - **Memory Management**: Proper cleanup and resource management
- **Browser Compatibility**:
  - **Modern Browsers**: Optimized for modern browser APIs
  - **Fallback Support**: Graceful degradation for older browsers
  - **Input Validation**: Client-side validation with server-side verification
  - **Error Handling**: Consistent error handling across all browsers
- **Security Considerations**:
  - **Token Security**: Secure handling of MFA tokens and OTPs
  - **Session Management**: Proper session timeout and cleanup
  - **Input Sanitization**: Proper validation and sanitization of all inputs
  - **Audit Trail**: Comprehensive logging for security monitoring
- **Future Enhancements**:
  - **Biometric Support**: Can be extended with biometric authentication
  - **Hardware Tokens**: Support for hardware-based MFA tokens
  - **Risk-Based MFA**: Dynamic MFA requirements based on risk assessment
  - **Multi-Channel**: Support for SMS, email, and app-based MFA
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **User Guidance**: Clear instructions and help text
  - **Security Notes**: Proper security guidance and warnings
  - **Development Notes**: Clear development and testing instructions
- No schema or server changes - purely client-side MFA gate with http.ts support

## v7.7.0 - Zebra Perf HUD (Development Only)

### Added
- **Development-Only Performance HUD**: Real-time performance monitoring with draggable overlay
- **Performance Metrics**: TTI, client fetch p95, React commits, dropped frames, memory estimate
- **Threshold Monitoring**: PASS/WARN/FAIL status badges aligned to §14 budgets and DoD targets
- **Keyboard Shortcut**: Alt+Shift+P to toggle HUD visibility
- **Lazy Initialization**: Zero work when closed, observers only start when opened

### Technical Details
- **Performance Monitoring** (`src/lib/perf/hud.ts`):
  - **Lightweight Implementation**: Uses PerformanceObserver and performance.now()
  - **TTI Proxy**: Navigation start to hydration end for Time to Interactive measurement
  - **Client Fetch Tracking**: P95 calculation from sampled fetch durations
  - **React Commit Counting**: Tracks React render commits for performance analysis
  - **Frame Drop Detection**: Approximate dropped frames using long task observer
  - **Memory Estimation**: Memory usage estimate with fallback for unsupported browsers
- **PerfHUD Component** (`src/components/dev/PerfHUD.tsx`):
  - **Draggable Overlay**: Small, movable performance display window
  - **Real-Time Updates**: Live metrics with status badges and color coding
  - **Status Indicators**: PASS (green), WARN (yellow), FAIL (red) based on thresholds
  - **Development Only**: Only renders when NODE_ENV === "development"
  - **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance Thresholds**:
  - **TTI Target**: ≤150ms (PASS: ≤100ms, WARN: ≤150ms, FAIL: >200ms)
  - **API P95 Target**: ≤300ms (PASS: ≤200ms, WARN: ≤300ms, FAIL: >500ms)
  - **React Commits**: ≤20 (PASS: ≤10, WARN: ≤20, FAIL: >50)
  - **Dropped Frames**: ≤5 (PASS: 0, WARN: ≤5, FAIL: >15)
- **PerfHUD Provider** (`src/components/providers/PerfHUDProvider.tsx`):
  - **Keyboard Shortcut**: Alt+Shift+P to toggle HUD visibility
  - **Tiny Header Button**: Small "P" button in top-right corner for easy access
  - **Lazy Initialization**: Performance observers only start when HUD is opened
  - **Zero Overhead**: No performance impact when HUD is closed
- **Integration Points**:
  - **Layout Integration**: Added to root layout with proper provider hierarchy
  - **Development Only**: Completely disabled in production builds
  - **Keyboard Events**: Global keyboard listener for Alt+Shift+P shortcut
  - **Performance API**: Uses standard Web Performance API for measurements
- **Metrics Tracking**:
  - **Navigation Timing**: Uses PerformanceNavigationTiming for TTI calculation
  - **Long Task Observer**: Detects tasks >50ms that may cause frame drops
  - **Frame Monitoring**: requestAnimationFrame-based frame timing analysis
  - **Memory API**: Uses performance.memory when available for memory estimates
  - **Fetch Sampling**: Tracks client-side data fetch durations for p95 calculation
- **Status Badge System**:
  - **Color Coding**: Green (PASS), Yellow (WARN), Red (FAIL), Gray (UNKNOWN)
  - **Threshold Comparison**: Real-time comparison against §14 budget targets
  - **Visual Indicators**: Clear status badges with metric values and units
  - **DoD Alignment**: Targets aligned to Definition of Done performance criteria
- **User Experience**:
  - **Draggable Interface**: Click and drag to move HUD anywhere on screen
  - **Compact Design**: Small footprint that doesn't interfere with development
  - **Real-Time Updates**: Live metrics that update as performance changes
  - **Easy Toggle**: Multiple ways to show/hide (keyboard shortcut, button, close button)
- **Performance Considerations**:
  - **Lazy Loading**: Observers only initialized when HUD is opened
  - **Efficient Updates**: Minimal re-renders with optimized state management
  - **Memory Management**: Proper cleanup when HUD is closed
  - **No Production Impact**: Zero overhead in production builds
- **Development Workflow**:
  - **Real-Time Monitoring**: See performance impact of code changes immediately
  - **Budget Compliance**: Visual feedback on §14 budget adherence
  - **DoD Validation**: Ensure performance meets Definition of Done criteria
  - **Debugging Aid**: Identify performance regressions during development
- **Browser Compatibility**:
  - **Performance API**: Uses standard Web Performance API with fallbacks
  - **Observer Support**: Graceful degradation when PerformanceObserver unavailable
  - **Memory API**: Fallback estimation when performance.memory not supported
  - **Modern Browsers**: Optimized for modern browser performance APIs
- **Security Considerations**:
  - **Development Only**: Completely disabled in production environments
  - **No Data Collection**: All metrics stay local, no external transmission
  - **Minimal Surface**: Small code footprint with limited attack surface
  - **Standard APIs**: Uses only standard browser performance APIs
- **Accessibility**:
  - **Keyboard Navigation**: Full keyboard support for all interactions
  - **Screen Reader**: Proper ARIA labels and descriptions
  - **High Contrast**: Clear visual indicators with good contrast ratios
  - **Focus Management**: Proper focus handling for draggable interface
- **Future Enhancements**:
  - **Custom Thresholds**: Can be extended with user-configurable thresholds
  - **Historical Data**: Can be extended with performance trend tracking
  - **Export Functionality**: Can be extended with performance report export
  - **Integration**: Can be extended with CI/CD performance monitoring
- **Compliance**:
  - **§14 Budgets**: Aligned to specification performance budget requirements
  - **DoD Targets**: Meets Definition of Done performance criteria
  - **Development Standards**: Follows development best practices
  - **Performance Standards**: Implements proper performance monitoring patterns
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **User Guidance**: Clear instructions for keyboard shortcuts and usage
  - **Threshold Documentation**: Clear explanation of performance targets
  - **Development Notes**: Guidance for development workflow integration
- No schema or server changes - purely client-side development performance monitoring

## v7.8.0 - Printable Audit Views (Admin/FM)

### Added
- **Admin/FM Audit Views**: Comprehensive audit and compliance views with RBAC restrictions
- **Printable Layout**: Clean print-friendly layouts with minimal chrome and proper formatting
- **Audit Table Component**: Full-featured audit log with filtering, export, and print capabilities
- **Compliance Table Component**: Compliance events tracking with status indicators and filtering
- **Print Styles**: Dedicated CSS for professional printing with proper page breaks and formatting

### Technical Details
- **AuditTable Component** (`src/components/ui/AuditTable.tsx`):
  - **RBAC Protection**: Only accessible to Admin and Finance Manager roles
  - **Comprehensive Columns**: timestamp, actorUserId, actorRole, action, correlationId, reasonCode, details
  - **Advanced Filtering**: Date range, actor filters, correlation ID search
  - **Export Capabilities**: CSV export with proper formatting
  - **Print Integration**: Direct print functionality with clean layout
  - **UX States**: Loading skeletons, empty states, error handling per §8
- **ComplianceTable Component** (`src/components/ui/ComplianceTable.tsx`):
  - **RBAC Protection**: Only accessible to Admin and Finance Manager roles
  - **Compliance Tracking**: timestamp, type, status, warehouseId, details
  - **Status Indicators**: Color-coded status badges (PASSED/FAILED/WARNING)
  - **Type Classification**: Safety, inventory, environmental, security, quality, fire safety, documentation
  - **Filtering Options**: Type, status, warehouse ID, pagination controls
  - **Export Integration**: CSV export for compliance reporting
- **Audit Page** (`src/app/audit/page.tsx`):
  - **Tabbed Interface**: Separate tabs for Audit Log and Compliance Events
  - **RBAC Enforcement**: Permission denied page for unauthorized roles
  - **Print Integration**: Print View buttons for both tabs
  - **Information Footer**: Audit data governance information per §13.3
  - **Navigation**: Proper back navigation and role-based access
- **Print Page** (`src/app/audit/print/page.tsx`):
  - **Minimal Chrome**: Clean print layout with logo, title, and filter summary
  - **Auto-Print**: Automatically triggers print dialog when page loads
  - **Filter Preservation**: Maintains filter state from main audit page
  - **Professional Layout**: Proper headers, footers, and page formatting
  - **Data Integrity**: Same data sources as main audit page
- **Print Styles** (`src/styles/print.css`):
  - **Media Queries**: Comprehensive @media print rules for clean printing
  - **Element Hiding**: Hides navigation, toolbars, and interactive elements
  - **Table Formatting**: Proper table borders, spacing, and page breaks
  - **Typography**: Print-optimized fonts and sizing
  - **Page Layout**: Proper margins, headers, and footers
- **RBAC Implementation**:
  - **Role Restrictions**: Only Admin and Finance Manager roles can access
  - **Permission Checks**: Component-level and page-level access control
  - **Error States**: Proper permission denied messages with navigation
  - **Role Context**: Integrates with existing role simulation system
- **Data Structure**:
  - **Audit Entries**: Comprehensive audit trail with all required fields
  - **Compliance Events**: Regulatory compliance tracking with status indicators
  - **Mock Data**: Realistic sample data for development and testing
  - **Filtering Logic**: Client-side filtering with proper data types
- **Export Functionality**:
  - **CSV Generation**: Proper CSV formatting with headers and data sanitization
  - **File Naming**: Automatic filename generation with timestamps
  - **Data Integrity**: Preserves all audit and compliance data
  - **Error Handling**: Graceful handling of export failures
- **Print Functionality**:
  - **Clean Layout**: Minimal chrome with essential information only
  - **Professional Formatting**: Proper headers, footers, and page breaks
  - **Table Optimization**: Print-friendly table layouts with proper spacing
  - **Auto-Print**: Automatic print dialog triggering
- **UX States (per §8)**:
  - **Loading States**: Skeleton loaders for data fetching
  - **Empty States**: Clear messages when no data is available
  - **Error States**: Proper error handling with retry options
  - **Permission States**: Clear permission denied messages
- **Accessibility**:
  - **Keyboard Navigation**: Full keyboard support for all interactions
  - **Screen Reader**: Proper ARIA labels and descriptions
  - **High Contrast**: Print-friendly contrast ratios
  - **Focus Management**: Proper focus handling for interactive elements
- **Security Considerations**:
  - **Role-Based Access**: Strict RBAC enforcement at component and page level
  - **Data Protection**: Audit data treated as sensitive information
  - **Print Security**: Print layouts include confidentiality notices
  - **Access Logging**: All access attempts are logged for security
- **Compliance Features**:
  - **§13.3 Governance**: Immutable audit data with proper retention notices
  - **Regulatory Compliance**: Compliance event tracking for regulatory requirements
  - **Data Integrity**: All audit entries are permanent and cannot be modified
  - **Retention Policies**: Clear data retention information
- **Performance**:
  - **Client-Side Filtering**: Efficient filtering without server requests
  - **Lazy Loading**: Data loaded only when needed
  - **Print Optimization**: Optimized layouts for fast printing
  - **Memory Management**: Proper cleanup and resource management
- **Browser Compatibility**:
  - **Print Support**: Works with all modern browser print functionality
  - **CSS Print Media**: Proper @media print rule implementation
  - **Table Rendering**: Consistent table rendering across browsers
  - **Export Support**: Standard CSV download functionality
- **Integration Points**:
  - **Role System**: Integrates with existing role simulation and context
  - **Navigation**: Proper routing and navigation integration
  - **Styling**: Consistent with existing design system
  - **Data Layer**: Ready for real API integration
- **Future Enhancements**:
  - **Real API Integration**: Ready for server-side audit data
  - **Advanced Filtering**: Can be extended with more complex filters
  - **Scheduled Reports**: Can be extended with automated reporting
  - **Audit Analytics**: Can be extended with audit data analysis
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **User Guidance**: Clear instructions and help text
  - **Compliance Notes**: Proper governance and retention information
  - **Print Instructions**: Clear print functionality guidance
- No schema or server changes - purely client-side audit and compliance views

## v7.5.0 - Acceptance-Test Harness (Dev-Only)

### Added
- **Development-Only Test Harness**: In-browser acceptance test runner for §17 scenarios
- **Test Scenario Registry**: Sample scenarios mapping to §17 specification test suites
- **Acceptance Test Panel**: Collapsible UI panel for running tests and viewing results
- **Block Release Flag**: Automatic flagging when tests fail (prepares for §18 gatekeeping)
- **Console Logging**: Immutable test results with timestamps, build IDs, and correlation IDs

### Technical Details
- **Test Runner** (`src/lib/tests/acceptance/runner.ts`):
  - **Development Only**: Only enabled when `NODE_ENV === "development"`
  - **Sequential Execution**: Runs scenarios sequentially with correlation ID generation
  - **Console Logging**: Logs immutable results with timestamps and build IDs
  - **Block Release Flag**: Emits "blockRelease" flag when any scenario fails
  - **No Network Writes**: Pure client-side execution with no external dependencies
- **Test Scenarios** (`src/lib/tests/acceptance/scenarios.sample.ts`):
  - **§17 Mapping**: Scenarios map to §17 specification test suites
  - **UI Flow Simulation**: Simulates user interactions and UI flows
  - **Sample Scenarios**: AT-ORD-01, AT-REC-02, AT-VAR-01, AT-FIN-03, etc.
  - **Async Operations**: Proper async/await patterns for realistic test simulation
  - **Error Handling**: Comprehensive error handling and logging
- **Acceptance Panel** (`src/components/dev/AcceptancePanel.tsx`):
  - **Development Only**: Only renders when `NODE_ENV === "development"`
  - **Collapsible Interface**: Expandable/collapsible panel to save space
  - **Test Controls**: "Run All Tests" button with loading states
  - **Results Display**: Per-scenario status (PENDING/PASS/FAIL) with re-run capability
  - **Last Run Metadata**: Shows timestamp, build ID, and block release status
- **Available Test Scenarios**:
  - **AT-ORD-01**: Auto Replenishment Flow
  - **AT-REC-02**: Warehouse UPC Alias Management
  - **AT-VAR-01**: Variance Approval Workflow
  - **AT-FIN-03**: Budget Threshold Alert System
  - **AT-AUD-01**: Audit Trail Verification
  - **AT-ROLE-01**: Role-Based Access Control
  - **AT-KPI-01**: KPI Dashboard Verification
  - **AT-TABLE-01**: Data Table Command Actions
- **Test Execution Features**:
  - **Sequential Processing**: Tests run one at a time to avoid conflicts
  - **Correlation IDs**: Unique identifiers for each test run
  - **Build IDs**: Unique build identifiers for test runs
  - **Duration Tracking**: Measures and reports test execution time
  - **Error Capture**: Captures and reports test failures with details
- **UI Simulation**:
  - **Click Simulation**: Simulates button clicks and UI interactions
  - **Input Simulation**: Simulates form input and data entry
  - **Wait Simulation**: Simulates waiting for UI state changes
  - **Navigation Simulation**: Simulates page navigation and routing
- **Results Management**:
  - **Status Tracking**: PENDING, PASS, FAIL status for each scenario
  - **Result Persistence**: Results maintained in component state
  - **Re-run Capability**: Individual test re-execution
  - **Visual Indicators**: Color-coded status badges and indicators
- **Development Workflow**:
  - **Console Integration**: Detailed logging to browser console
  - **Build Integration**: Ready for CI/CD integration
  - **Gatekeeping Preparation**: Foundation for §18 gatekeeping enforcement
  - **Test Coverage**: Covers major application workflows
- **Security Considerations**:
  - **Development Only**: Completely disabled in production builds
  - **No External Calls**: No network requests or external dependencies
  - **Client-Side Only**: All execution happens in browser
  - **No Data Persistence**: Results not persisted beyond session
- **Performance**:
  - **Lazy Loading**: Scenarios loaded only when needed
  - **Efficient Execution**: Minimal overhead during test runs
  - **Memory Management**: Proper cleanup and resource management
- **Accessibility**:
  - **Keyboard Navigation**: Full keyboard support for test controls
  - **Screen Reader**: Proper ARIA labels and descriptions
  - **Visual Feedback**: Clear status indicators and loading states
- **Integration Points**:
  - **Dashboard Integration**: Panel integrated into main dashboard
  - **Role System**: Tests respect role-based access control
  - **UI Components**: Tests interact with existing UI components
  - **State Management**: Tests work with existing application state
- **Future Enhancements**:
  - **Real Test Integration**: Ready for integration with real test infrastructure
  - **CI/CD Pipeline**: Foundation for automated testing in CI/CD
  - **Test Reporting**: Can be extended with detailed reporting
  - **Test Data Management**: Ready for test data setup and teardown
- **Compliance**:
  - **§17 Specification**: Maps to §17 test suite requirements
  - **§18 Gatekeeping**: Prepares for §18 gatekeeping enforcement
  - **Development Standards**: Follows development best practices
  - **Testing Standards**: Implements proper testing patterns
- **Documentation**:
  - **Inline Comments**: Comprehensive code documentation
  - **Console Output**: Detailed execution logs for debugging
  - **UI Help**: Clear instructions and warnings in the panel
  - **Scenario Descriptions**: Clear scenario titles and purposes
- No schema or server changes - purely client-side development testing tool

## v7.4.0 - KPI Mini-Widgets (Role-Aware)

### Added
- **Role-Aware KPI Widgets**: Compact KPI displays based on user role
- **Threshold-Based Coloring**: Visual indicators for target, warning, and critical thresholds
- **Trend Indicators**: Arrow indicators showing performance trends
- **Sparkline Visualizations**: Mini charts showing historical data trends
- **Accessibility Features**: ARIA live regions and screen reader support

### Technical Details
- **KPI Registry** (`src/lib/kpi/registry.ts`):
  - **Role-Specific KPIs**: 3 KPIs per role following §11 specification examples
  - **Threshold Configuration**: Target, warning, and critical thresholds for each KPI
  - **Mock Data**: Client-side mock values with realistic data ranges
  - **Formatting Utilities**: Proper value formatting for different units (currency, percentages, days)
  - **Color Logic**: Threshold-based color determination (neutral/warn/critical)
- **KPI Mini Component** (`src/components/ui/KpiMini.tsx`):
  - **Compact Design**: Small card format with essential information
  - **Threshold Coloring**: Background and border colors based on performance thresholds
  - **Trend Arrows**: Visual indicators for up/down/stable trends
  - **Sparkline Charts**: Mini bar charts showing historical data progression
  - **Accessibility**: role="status", aria-live="polite", and screen reader support
- **Role-Specific KPI Sets**:
  - **SM (Store Manager)**: Store Sales %, Variance Rate, Fill Rate
  - **DM (Department Manager)**: District Compliance %, Budget Utilization, Variance Rate
  - **FM (Finance Manager)**: Variance Cost Impact, SLA Breaches, Vendor Scorecards
  - **ADMIN**: Global KPIs Rollup, Cross-Role Compliance, On-Time Delivery %
  - **COST_ANALYST**: DSO, Reconciliation Time, Disputed Variance %
  - **WHS (Warehouse Supervisor)**: Warehouse Efficiency, Inventory Accuracy, Order Fulfillment Time
  - **AM (Area Manager)**: Area Performance, Store Compliance Rate, Area Variance
- **Threshold System**:
  - **Target Threshold**: Optimal performance level (green/neutral)
  - **Warning Threshold**: Performance concern (yellow/warn)
  - **Critical Threshold**: Performance issue (red/critical)
  - **Dynamic Coloring**: Background and border colors change based on current value
- **Data Visualization**:
  - **Sparkline Charts**: Mini bar charts showing 7-day data progression
  - **Trend Arrows**: Directional indicators (↗ ↘ →) for performance trends
  - **Color Coding**: Consistent color scheme across all visual elements
- **Value Formatting**:
  - **Currency**: Proper USD formatting with commas ($125,000)
  - **Percentages**: Decimal precision with % symbol (87.3%)
  - **Time Units**: Days and hours with decimal precision (28.5 days)
  - **Ratings**: Score out of 5 format (4.2/5)
  - **Counts**: Simple integer display (3 count)
- **Accessibility Features**:
  - **ARIA Live Regions**: role="status" and aria-live="polite" for value updates
  - **Screen Reader Support**: Comprehensive labels and descriptions
  - **Keyboard Navigation**: Full keyboard accessibility
  - **High Contrast**: Support for high contrast mode
  - **Semantic Markup**: Proper heading hierarchy and structure
- **Integration Points**:
  - **Role Context**: Integrates with existing role simulation system
  - **Dashboard Layout**: Responsive grid layout (1/2/3 columns based on screen size)
  - **Loading States**: Graceful handling when no KPIs available for role
  - **Performance**: Efficient rendering with minimal re-renders
- **User Experience**:
  - **Role Awareness**: Only shows KPIs relevant to current user role
  - **Visual Hierarchy**: Clear information hierarchy with proper typography
  - **Responsive Design**: Adapts to different screen sizes
  - **Consistent Styling**: Matches existing dashboard design patterns
- **Data Structure**:
  - **§11 Compliance**: Follows specification format with metricId, value, unit, roleVisibility
  - **Threshold Configuration**: target, warn, critical thresholds for each KPI
  - **Trend Data**: Historical sparkline data for visualization
  - **Role Visibility**: Array of roles that can see each KPI
- **Performance Considerations**:
  - **Client-Side Only**: No server requests, all data is mock/local
  - **Efficient Rendering**: Minimal DOM updates and re-renders
  - **Memory Management**: Proper cleanup and optimization
- **Browser Compatibility**:
  - **Modern Browsers**: Uses standard CSS Grid and Flexbox
  - **Responsive Design**: Works on all screen sizes
  - **Print Support**: Proper styling for print media
- **Development Benefits**:
  - **Code Reuse**: Centralized KPI logic and formatting
  - **Maintainability**: Easy to add new KPIs or modify existing ones
  - **Consistency**: Uniform KPI display across all roles
  - **Extensibility**: Easy to extend with real data sources
- **Compliance**:
  - **§11 Specification**: Follows KPI format and structure requirements
  - **Section 8 (UX)**: Maintains loading/empty/error semantics
  - **Section 14 (a11y)**: Meets accessibility requirements
  - **Role-Based Access**: Respects role visibility settings
- **Future Enhancements**:
  - **Real Data Integration**: Ready for server-side KPI data
  - **Interactive Features**: Can be extended with drill-down capabilities
  - **Customization**: Role-specific KPI customization options
  - **Historical Data**: Can be extended with longer-term trend data
- No schema or server changes - purely client-side KPI display components

## v7.3.0 - Data Table Command Actions (RBAC + A11y)

### Added
- **Standardized Table Actions**: RBAC-aware command actions for all data tables
- **Keyboard Shortcuts**: R (Refresh), E (Export), C (Clear Filters), P (Print)
- **Accessibility Features**: Proper ARIA roles, focus management, and keyboard navigation
- **Role-Based Access Control**: Actions shown/hidden based on effective role
- **Unified Table Interface**: Consistent action patterns across Events and Audit tables

### Technical Details
- **TableActions Component** (`src/components/ui/TableActions.tsx`):
  - **RBAC Integration**: Consumes role context to show/hide actions based on permissions
  - **Keyboard Shortcuts**: Tooltips show hotkeys (R/E/C/P) for each action
  - **Disabled States**: Actions disabled when not available or data is loading
  - **Accessibility**: Proper ARIA labels, role="toolbar", and focus management
  - **Icon Support**: Visual icons for each action with responsive text labels
- **DataTable Component** (`src/components/ui/DataTable.tsx`):
  - **Standardized Interface**: Unified table component with built-in actions
  - **Action Handlers**: Refresh, Export (CSV), Clear Filters, and Print functionality
  - **Keyboard Integration**: Global keyboard shortcuts for table actions
  - **Loading States**: Proper loading, error, and empty state handling
  - **Print Support**: Dedicated print window with proper styling
- **RBAC Permissions**:
  - **Refresh**: Available to ANON, USER, ADMIN, FM, VIEWER roles
  - **Export**: Available to USER, ADMIN, FM, VIEWER roles (requires authentication)
  - **Clear Filters**: Available to USER, ADMIN, FM, VIEWER roles
  - **Print**: Available to ANON, USER, ADMIN, FM, VIEWER roles
- **Keyboard Shortcuts**:
  - **R**: Refresh table data
  - **E**: Export visible rows as CSV
  - **C**: Clear all filters and sorts
  - **P**: Print table in new window
  - **Context Aware**: Only active when not in input fields
- **Accessibility Features**:
  - **ARIA Roles**: Proper toolbar and table roles
  - **Focus Management**: Logical tab order and focus indicators
  - **Keyboard Navigation**: Full keyboard support for all actions
  - **Screen Reader**: Proper labeling and descriptions
  - **High Contrast**: Support for high contrast mode
- **Export Functionality**:
  - **CSV Generation**: Client-side CSV export of visible table data
  - **Data Sanitization**: Proper handling of complex data types
  - **File Naming**: Automatic filename generation with timestamps
  - **Error Handling**: Graceful handling of export failures
- **Print Functionality**:
  - **New Window**: Opens print dialog in new window
  - **Styled Output**: Proper CSS styling for print layout
  - **Table Formatting**: Clean table formatting for print
  - **Header Information**: Includes table title and metadata
- **Integration Points**:
  - **Events Table**: Replaced custom table with DataTable component
  - **Audit Table**: Replaced custom table with DataTable component
  - **Role Context**: Integrates with existing role simulation system
  - **Toast System**: Uses existing toast notifications for feedback
- **User Experience**:
  - **Consistent Interface**: Same actions available across all tables
  - **Visual Feedback**: Clear disabled states and loading indicators
  - **Tooltip Help**: Hover tooltips show keyboard shortcuts
  - **Responsive Design**: Actions adapt to screen size
- **Performance**:
  - **Client-Side Processing**: Export and print operations are client-side
  - **Efficient Rendering**: Minimal re-renders with proper React patterns
  - **Memory Management**: Proper cleanup of event listeners
- **Error Handling**:
  - **Graceful Degradation**: Actions disabled when data unavailable
  - **User Feedback**: Clear error messages and loading states
  - **Fallback Behavior**: Safe defaults when actions fail
- **Security Considerations**:
  - **Role-Based Access**: Actions respect user permissions
  - **Client-Side Only**: No server-side changes required
  - **Data Sanitization**: Export data is properly sanitized
- **Browser Compatibility**:
  - **Modern Browsers**: Uses standard web APIs
  - **Print Support**: Works with browser print functionality
  - **Download Support**: Uses standard download mechanisms
- **Development Benefits**:
  - **Code Reuse**: Standardized table actions across components
  - **Maintainability**: Centralized action logic
  - **Consistency**: Uniform user experience across tables
  - **Accessibility**: Built-in accessibility features
- **Compliance**:
  - **Section 8 (UX)**: Follows UX guidelines for table interactions
  - **Section 14 (a11y)**: Meets accessibility requirements
  - **Keyboard Parity**: Same actions available via keyboard and mouse
  - **RBAC Integration**: Respects role-based access control
- No schema or server changes - purely client-side table enhancements

## v7.2.0 - Embedded Docs Viewer (structure.md)

### Added
- **Embedded Documentation Viewer**: Read-only reference viewer for master specification
- **Markdown Rendering**: GitHub-flavored markdown with table of contents and anchors
- **Accessibility Features**: Skip-to-content links, focus outlines, high contrast support
- **Single Source of Truth**: Direct access to structure.md specification
- **Read-Only Interface**: No editing capabilities, pure reference viewer

### Technical Details
- **MarkdownViewer Component** (`src/components/ui/MarkdownViewer.tsx`):
  - **GitHub-Flavored Markdown**: Supports headers, lists, code blocks, links, and formatting
  - **Table of Contents**: Auto-generated TOC with in-page anchor links
  - **Accessibility**: Proper heading hierarchy, skip-to-content links, focus management
  - **Responsive Design**: Works on all screen sizes with proper typography
  - **Dark Mode Support**: Full dark mode compatibility with proper contrast
- **Docs Page** (`src/app/docs/page.tsx`):
  - **Specification Banner**: Clear identification as "Shiekh S3 Master Specification v14.0.0"
  - **Single Source of Truth**: Emphasizes this is the authoritative reference
  - **Error Handling**: Graceful loading states and error recovery
  - **Navigation**: Easy return to dashboard with breadcrumb navigation
  - **Read-Only Notice**: Clear indication that this is a reference viewer only
- **File Structure**:
  - **Public Assets**: `structure.md` copied to `public/docs/structure.md` for runtime access
  - **Route Structure**: `/docs` route provides clean URL for documentation access
  - **Build Integration**: File copying ensures docs are available at runtime
- **Accessibility Features**:
  - **Skip Links**: Skip-to-content link for keyboard navigation
  - **Heading Hierarchy**: Proper H1-H6 structure with IDs for anchors
  - **Focus Management**: Visible focus outlines and keyboard navigation
  - **High Contrast**: Support for high contrast mode preferences
  - **Screen Reader**: Proper semantic markup and ARIA labels
- **Visual Design**:
  - **Typography**: Clean, readable typography with proper line spacing
  - **Code Highlighting**: Syntax highlighting for code blocks and inline code
  - **Link Styling**: Clear link styling with hover and focus states
  - **Table of Contents**: Sticky TOC with proper indentation for hierarchy
- **User Experience**:
  - **Quick Access**: One-click access from dashboard toolbar
  - **New Tab Opening**: Opens in new tab to preserve dashboard state
  - **Loading States**: Clear loading indicators and error messages
  - **Responsive Layout**: Works well on desktop and mobile devices
- **Technical Implementation**:
  - **Client-Side Rendering**: Markdown parsed and rendered on client
  - **Fetch API**: Uses standard fetch to load markdown content
  - **Error Boundaries**: Graceful error handling with retry functionality
  - **Performance**: Efficient markdown parsing with minimal re-renders
- **Content Features**:
  - **Header Anchors**: All headers get automatic ID anchors for linking
  - **Code Blocks**: Proper syntax highlighting and formatting
  - **Lists**: Support for both ordered and unordered lists
  - **Links**: External and internal link support
  - **Emphasis**: Bold and italic text formatting
- **Integration Points**:
  - **Dashboard Toolbar**: "Docs" button for easy access
  - **Command Palette**: Can be accessed via command palette navigation
  - **Global Availability**: Available from any page in the application
- **Security Considerations**:
  - **Read-Only**: No editing capabilities, pure reference viewer
  - **Local Content**: Content served from public directory, no external dependencies
  - **No Script Execution**: Markdown content is sanitized and safe
- **Browser Compatibility**:
  - **Modern Browsers**: Uses standard web APIs with fallbacks
  - **Mobile Support**: Responsive design works on all devices
  - **Print Support**: Proper print styling for documentation
- **Performance**:
  - **Lazy Loading**: Content loaded only when page is accessed
  - **Efficient Parsing**: Simple markdown parser with minimal overhead
  - **Caching**: Browser caching for repeated access
- **Maintenance**:
  - **Auto-Update**: Content updates when structure.md is updated
  - **Version Tracking**: Shows app version for reference
  - **Last Updated**: Displays when documentation was last accessed
- **Development Workflow**:
  - **Spec Reference**: Quick access to master specification during development
  - **QA Reference**: Easy access to requirements and specifications
  - **Team Collaboration**: Shared reference for all team members
- **Compliance**:
  - **Section 8 (UX)**: Follows UX guidelines for documentation access
  - **Section 14 (a11y)**: Meets accessibility requirements
  - **Release §19**: Reinforces single source of truth principle
  - **Prompt Rules §18.3**: Maintains specification as authoritative reference
- No schema or server changes - purely client-side documentation viewer

## v7.1.0 - Role Simulation Toggle (Development Only)

### Added
- **Development-Only Role Simulation**: Client-side role switching for QA testing
- **Role Simulation Switcher**: Dropdown in StatusBar to simulate different roles
- **Role Context Provider**: Global role context for UI components
- **Simulation Indicator**: Visual indicator when role simulation is active
- **Preserved Server Authority**: No changes to API calls or server-side authentication

### Technical Details
- **Role Simulation Utility** (`src/lib/dev/roleSim.ts`):
  - **Development Only**: Only active when `process.env.NODE_ENV === "development"`
  - **localStorage Persistence**: Stores simulated role in "dev:simRole" key
  - **Type Safety**: TypeScript support with SimulatableRole union type
  - **Fallback Behavior**: Returns real role if no simulation is set
  - **NO-OP in Production**: Completely disabled in production builds
- **RoleSimSwitcher Component** (`src/components/ui/RoleSimSwitcher.tsx`):
  - **Development Only**: Only renders in development environment
  - **Role Dropdown**: Select from ADMIN, FM, WHS, DM, SM, AM, COST_ANALYST
  - **Simulation Indicator**: Shows "Simulating: <ROLE>" pill when active
  - **Event System**: Emits custom events to trigger UI re-renders
  - **Real Role Option**: Option to return to actual role
- **Role Context Provider** (`src/components/providers/RoleProvider.tsx`):
  - **Effective Role**: Provides simulated role in dev, real role in production
  - **Real Role Access**: Always provides access to actual role from cookies
  - **Event Listening**: Responds to role simulation changes
  - **Context API**: React Context for global role access
- **StatusBar Integration**:
  - **Role Switcher**: Added to StatusBar for easy access
  - **Visual Integration**: Seamlessly integrated with existing StatusBar design
  - **Development Only**: Only visible in development environment
- **Available Roles for Simulation**:
  - **ADMIN**: Full administrative access
  - **FM**: Finance Manager role
  - **WHS**: Warehouse Supervisor role
  - **DM**: Department Manager role
  - **SM**: Store Manager role
  - **AM**: Area Manager role
  - **COST_ANALYST**: Cost Analyst role
- **Security Guardrails**:
  - **Client-Side Only**: No server-side authentication changes
  - **API Preservation**: All API calls continue to use real role
  - **Header Preservation**: No JWT or authorization header changes
  - **Production Safety**: Completely disabled in production builds
- **User Experience**:
  - **QA Testing**: Enables quick role switching for testing different permissions
  - **Visual Feedback**: Clear indication when simulation is active
  - **Easy Reset**: Simple option to return to real role
  - **Non-Intrusive**: Small, unobtrusive UI element
- **Technical Implementation**:
  - **Event-Driven Updates**: Custom events trigger UI re-renders
  - **Context Integration**: Role context provides effective role to components
  - **localStorage Management**: Safe localStorage operations with error handling
  - **Performance**: Minimal overhead, only active in development
- **Development Workflow**:
  - **QA Testing**: Test different role permissions without server changes
  - **UI Development**: See how UI behaves with different roles
  - **Permission Testing**: Verify RBAC gates work correctly
  - **Quick Switching**: Rapid role changes for comprehensive testing
- **Production Safety**:
  - **Zero Impact**: No code execution in production builds
  - **Server Authority Preserved**: All server-side authentication unchanged
  - **Security Maintained**: No way to bypass real authentication
  - **Performance**: No production performance impact
- **Integration Points**:
  - **Command Palette**: Role simulation affects available commands
  - **RBAC Gates**: UI components can use effective role for permissions
  - **StatusBar**: Integrated seamlessly with existing status information
  - **Global Context**: Available throughout the application
- **Error Handling**:
  - **localStorage Safety**: Graceful handling of localStorage unavailability
  - **Role Validation**: Only valid roles can be set for simulation
  - **Fallback Behavior**: Always falls back to real role if simulation fails
- **Accessibility**:
  - **Keyboard Navigation**: Dropdown is fully keyboard accessible
  - **Screen Reader Support**: Proper labeling and descriptions
  - **Visual Indicators**: Clear visual feedback for simulation state
- **Browser Compatibility**:
  - **localStorage Support**: Uses localStorage with fallback handling
  - **Event System**: Uses standard CustomEvent API
  - **Context API**: Uses React Context for state management
- **Testing Benefits**:
  - **Rapid QA**: Quick role switching for comprehensive testing
  - **Permission Verification**: Test all RBAC scenarios easily
  - **UI Validation**: See how UI adapts to different roles
  - **Development Efficiency**: Faster development and testing cycles
- No schema or server changes - purely client-side development tool

## v7.0.0 - Global Command Palette (⌘K / Ctrl+K)

### Added
- **Global Command Palette**: Universal search and action interface accessible via ⌘K/Ctrl+K
- **RBAC-Aware Commands**: Role-based access control for navigation and actions
- **Fuzzy Search**: Intelligent search across commands with fuzzy matching
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, and Escape
- **Accessibility**: ARIA-compliant dialog with focus trap and screen reader support

### Technical Details
- **Command Registry** (`src/lib/search/registry.ts`):
  - **RBAC Integration**: Commands filtered based on user role (ANON, USER, ADMIN, FM, VIEWER)
  - **Command Types**: Navigation commands (routes) and action commands (functions)
  - **Fuzzy Search**: Intelligent matching across labels, descriptions, and hotkeys
  - **Type Safety**: Full TypeScript support with Command interface
- **CommandPalette Component** (`src/components/ui/CommandPalette.tsx`):
  - **Modal Dialog**: ShadCN-style modal with backdrop and focus trap
  - **Search Interface**: Real-time search with instant filtering
  - **Keyboard Navigation**: Arrow keys for selection, Enter to execute, Escape to close
  - **Visual Design**: Clean list with command types, descriptions, and hotkeys
  - **Accessibility**: Proper ARIA roles, labels, and keyboard support
- **Global Integration** (`src/components/providers/CommandPaletteProvider.tsx`):
  - **Keyboard Shortcuts**: ⌘K (Mac) / Ctrl+K (Windows/Linux) to open
  - **Event System**: Custom events for command execution
  - **Action Mapping**: Commands mapped to existing dashboard functionality
  - **Performance**: Lazy loading - no heavy work until opened
- **Available Commands**:
  - **Navigation**: Dashboard, Products, Orders, Approvals, Variances, Changelog
  - **Actions**: Refresh, Export, Fullscreen, Clear filters, Print, Toggle theme, Start tour, Shortcuts, About
  - **RBAC Filtering**: Only shows commands user has permission to access
- **User Experience**:
  - **Universal Access**: Available from any page via keyboard shortcut
  - **Quick Discovery**: Search and execute commands without navigating UI
  - **Visual Feedback**: Clear command types with color coding and descriptions
  - **Keyboard First**: Optimized for keyboard users with full navigation support
- **Technical Implementation**:
  - **Event-Driven Architecture**: Custom events for loose coupling between components
  - **Role Detection**: Automatic role detection from cookies
  - **Search Algorithm**: Fuzzy matching with multiple search criteria
  - **State Management**: Local state with proper cleanup and error handling
- **Accessibility Features**:
  - **ARIA Compliance**: Proper dialog, listbox, and option roles
  - **Focus Management**: Focus trap and proper focus restoration
  - **Screen Reader Support**: Descriptive labels and announcements
  - **Keyboard Navigation**: Full keyboard accessibility
- **Performance Considerations**:
  - **Lazy Loading**: Commands loaded only when palette opens
  - **Efficient Search**: Optimized fuzzy matching algorithm
  - **Event Cleanup**: Proper event listener cleanup to prevent memory leaks
  - **Minimal Re-renders**: Optimized state updates and effect dependencies
- **Integration Points**:
  - **Dashboard Actions**: Wired to existing dashboard functionality
  - **Navigation**: Integrated with Next.js router for page navigation
  - **Toolbar Integration**: Added search hint button with tooltip
  - **Global Availability**: Available from any page in the application
- **RBAC Implementation**:
  - **Role-Based Filtering**: Commands filtered by user role
  - **Permission Mapping**: Each command specifies required roles
  - **Dynamic Updates**: Commands update when user role changes
  - **Security**: No unauthorized commands exposed to users
- **Search Features**:
  - **Fuzzy Matching**: Intelligent search across multiple fields
  - **Real-time Results**: Instant filtering as user types
  - **Multiple Criteria**: Search by label, description, or hotkey
  - **Case Insensitive**: Search works regardless of case
- **Visual Design**:
  - **Modern Interface**: Clean, modern design matching application theme
  - **Command Types**: Visual indicators for navigation vs action commands
  - **Hotkey Display**: Keyboard shortcuts shown for quick reference
  - **Responsive Layout**: Works on different screen sizes
- **Error Handling**:
  - **Graceful Degradation**: Fallback behavior if commands fail to load
  - **Safe Execution**: Commands execute safely with error boundaries
  - **User Feedback**: Clear feedback for command execution
- **Browser Compatibility**:
  - **Cross-Platform**: Works on Mac (⌘K) and Windows/Linux (Ctrl+K)
  - **Modern Browsers**: Uses modern web APIs with fallbacks
  - **Keyboard Support**: Full keyboard accessibility across browsers
- Major version bump - significant new functionality with global command interface

## v6.5.0 - Cards Grid Layout Option

### Added
- **Dashboard Grid Layout**: Toggle between stack and grid layouts for dashboard cards
- **Layout Preference Hook**: Custom hook for managing layout preferences with localStorage persistence
- **Responsive Grid**: 2-column grid on large screens, single column on smaller screens

### Technical Details
- **useLayoutPref Hook** (`src/lib/hooks/useLayoutPref.ts`):
  - **Type Safety**: TypeScript support with "grid" | "stack" union type
  - **localStorage Integration**: Persists layout preference across sessions
  - **Error Handling**: Graceful fallback to "stack" if localStorage is unavailable
  - **React Hook Pattern**: Standard useState/useEffect pattern for state management
- **Layout Toggle**:
  - **Dropdown Select**: Replaced compact/roomy toggle with grid/stack options
  - **Default Value**: Defaults to "stack" layout for backward compatibility
  - **Real-time Updates**: Layout changes immediately when preference is updated
  - **Persistent Choice**: User's layout preference is remembered across sessions
- **Grid Layout Implementation**:
  - **Tailwind Grid Classes**: Uses `grid grid-cols-1 lg:grid-cols-2 gap-4` for responsive grid
  - **Responsive Design**: Single column on mobile, 2 columns on large screens
  - **Automatic Card Arrangement**: Cards automatically arrange themselves in grid
  - **Consistent Spacing**: Maintains proper spacing between cards in both layouts
- **Stack Layout**:
  - **Vertical Stacking**: Traditional single-column layout with `space-y-4`
  - **Full Width Cards**: Cards take full width of container
  - **Consistent Spacing**: Maintains vertical spacing between cards
- **User Experience**:
  - **Easy Toggle**: Simple dropdown to switch between layouts
  - **Immediate Feedback**: Layout changes instantly when preference is updated
  - **Responsive Behavior**: Grid automatically adapts to screen size
  - **Persistent Preference**: Layout choice is remembered across browser sessions
- **Technical Implementation**:
  - **Hook Integration**: Replaced manual localStorage handling with custom hook
  - **Type Safety**: Proper TypeScript types for layout preferences
  - **State Management**: Clean separation of layout preference logic
  - **Performance**: Minimal re-renders when layout preference changes
- **Visual Design**:
  - **Responsive Grid**: Cards arrange in 2 columns on large screens
  - **Mobile Friendly**: Single column layout on smaller screens
  - **Consistent Spacing**: Proper gap between cards in grid layout
  - **Smooth Transitions**: Layout changes are immediate and smooth
- **Backward Compatibility**:
  - **Default Stack**: Maintains existing single-column layout as default
  - **No Breaking Changes**: Existing functionality remains unchanged
  - **Gradual Adoption**: Users can opt into grid layout when desired
- **Accessibility**:
  - **Keyboard Navigation**: Layout toggle is fully keyboard accessible
  - **Screen Reader Support**: Proper labeling for layout options
  - **Responsive Design**: Works well with assistive technologies
- No schema or navigation changes - purely layout enhancement

## v6.4.0 - Color Contrast Check (Dev-only)

### Added
- **Dev-only Color Contrast Check**: WCAG 2.1 AA compliance checking in StatusBar
- **Contrast Utility**: Comprehensive contrast checking utility with Tailwind color support
- **Low Contrast Warning**: Visual warning badge when contrast fails accessibility standards

### Technical Details
- **Contrast Utility** (`src/lib/utils/contrast.ts`):
  - **WCAG 2.1 AA Compliance**: Implements proper contrast ratio calculations
  - **Hex to RGB Conversion**: Converts hex colors to RGB values for calculations
  - **Relative Luminance**: Calculates relative luminance using WCAG formulas
  - **Contrast Ratio**: Computes contrast ratios between foreground and background colors
  - **Tailwind Color Support**: Built-in mapping for common Tailwind color tokens
- **StatusBar Integration**:
  - **Development Only**: Contrast check only runs in development environment
  - **Real-time Monitoring**: Checks contrast when theme changes
  - **Automatic Detection**: Monitors text-gray-600 against current background
  - **Visual Warning**: Shows "⚠ Low Contrast" badge when contrast fails
- **Contrast Checking Logic**:
  - **Threshold**: Uses 4.5:1 ratio (WCAG 2.1 AA for normal text)
  - **Color Resolution**: Supports both hex colors and Tailwind tokens
  - **Theme Awareness**: Checks contrast against appropriate background for light/dark themes
  - **Error Handling**: Gracefully handles contrast calculation failures
- **Visual Design**:
  - **Warning Badge**: Yellow background with warning icon and text
  - **Conditional Display**: Only shows when contrast fails and in development
  - **Consistent Styling**: Matches StatusBar design patterns
  - **Non-intrusive**: Small badge that doesn't interfere with existing UI
- **Technical Implementation**:
  - **State Management**: Added `hasLowContrast` state to StatusBar component
  - **Effect Hooks**: useEffect monitors theme changes and runs contrast checks
  - **Interval Checking**: Periodic re-checking to catch dynamic changes
  - **Environment Detection**: Uses `process.env.NODE_ENV` for development-only behavior
- **Accessibility Features**:
  - **WCAG Compliance**: Implements proper WCAG 2.1 AA contrast standards
  - **Color Token Support**: Works with Tailwind's color system
  - **Real-time Feedback**: Immediate visual feedback when contrast issues are detected
  - **Developer Tool**: Helps developers identify and fix contrast issues during development
- **Performance Considerations**:
  - **Development Only**: No performance impact in production builds
  - **Efficient Calculations**: Optimized contrast ratio calculations
  - **Minimal Re-renders**: Only updates state when contrast status changes
  - **Error Boundaries**: Safe error handling prevents crashes
- **Tailwind Color Support**:
  - **Comprehensive Mapping**: Supports common Tailwind color tokens
  - **Hex Resolution**: Converts Tailwind tokens to hex values
  - **Extensible**: Easy to add new color tokens as needed
  - **Fallback Handling**: Gracefully handles unknown color tokens
- No schema or navigation changes - purely developer experience enhancement

## v6.3.0 - Keyboard Shortcuts Help Modal

### Added
- **Keyboard Shortcuts Help Modal**: Modal displaying all available keyboard shortcuts
- **Shortcuts Toolbar Button**: Easy access to keyboard shortcuts reference
- **Accessible Design**: Keyboard navigation support and proper ARIA labels

### Technical Details
- **ShortcutsModal Component** (`src/components/ui/ShortcutsModal.tsx`):
  - **Modal Integration**: Uses existing Modal component for consistent styling
  - **Shortcut List**: Displays all active keyboard shortcuts with descriptions
  - **Visual Design**: Clean layout with keyboard key styling using `<kbd>` elements
  - **Accessibility**: Proper keyboard navigation and screen reader support
- **Available Shortcuts**:
  - **R** — Refresh dashboard data
  - **E** — Export current view to JSON/CSV
  - **F** — Toggle fullscreen mode
  - **C** — Clear all filters and search terms
  - **P** — Print current page
  - **G** — Navigate to Approvals page
  - **D** — Return to Dashboard
- **User Experience**:
  - **Quick Reference**: Easy access to all keyboard shortcuts in one place
  - **Visual Clarity**: Clear distinction between shortcut keys and descriptions
  - **Consistent Styling**: Matches existing modal design patterns
  - **Helpful Context**: Additional information about shortcut functionality
- **Technical Implementation**:
  - **State Management**: Added `shortcutsOpen` state to Dashboard component
  - **Modal Integration**: Uses existing Modal component infrastructure
  - **Toolbar Integration**: Added "Shortcuts" button to main toolbar
  - **Event Handling**: Proper open/close state management
- **Visual Design**:
  - **Keyboard Styling**: `<kbd>` elements with proper styling for keyboard keys
  - **Layout**: Clean two-column layout with descriptions and keys
  - **Typography**: Consistent text sizing and spacing
  - **Border Styling**: Subtle borders and spacing for visual separation
- **Accessibility Features**:
  - **Keyboard Navigation**: Full keyboard support for modal interaction
  - **Screen Reader Support**: Proper ARIA labels and semantic HTML
  - **Focus Management**: Proper focus handling when modal opens/closes
  - **Semantic Markup**: Uses appropriate HTML elements for keyboard keys
- **Integration**:
  - **Toolbar Button**: Added "Shortcuts" button alongside other utility buttons
  - **Modal State**: Integrated with existing modal state management pattern
  - **Consistent UX**: Follows same interaction patterns as other modals
- No schema or navigation changes - purely user experience enhancement

## v6.2.0 - Demo Tour Overlay

### Added
- **Demo Tour Overlay**: Interactive tour walking users through key dashboard features
- **First-Time Auto-Open**: Tour automatically opens for first-time visitors
- **localStorage Persistence**: "Seen" flag prevents tour from showing again
- **Start Tour Button**: Toolbar button to reset and restart the tour

### Technical Details
- **DemoTour Component** (`src/components/app/DemoTour.tsx`):
  - **Step-Based Navigation**: 5-step tour covering all major dashboard features
  - **Interactive Controls**: Back/Next/Finish buttons with proper state management
  - **Skip Functionality**: Users can skip the tour at any time
  - **Progress Indicator**: Shows current step and total steps
- **Tour Content**:
  - **Welcome**: Overview of dashboard capabilities
  - **Approvals**: Quick Approvals functionality and batch operations
  - **Forecasts & Replenishments**: Demo actions and event generation
  - **Events & Audit**: Monitoring, filtering, pagination, and export features
  - **Toolbar & Settings**: Theme, settings, and utility functions
- **User Experience**:
  - **Overlay Design**: Full-screen overlay with semi-transparent backdrop
  - **Modal Dialog**: Centered modal with clear typography and spacing
  - **Easy Navigation**: Intuitive back/next navigation with disabled states
  - **Quick Exit**: Click backdrop or Skip button to exit tour
- **Persistence & Reset**:
  - **localStorage Integration**: Stores "tourSeen" flag to prevent re-showing
  - **Start Tour Button**: Removes flag and reloads page to restart tour
  - **Error Safety**: Try/catch blocks for safe localStorage operations
  - **Automatic Detection**: Checks localStorage on component mount
- **Technical Implementation**:
  - **State Management**: Uses useState for tour open state and current step
  - **Effect Hooks**: useEffect checks localStorage on component mount
  - **Navigation Logic**: Simple step increment/decrement with boundary checks
  - **Component Integration**: Mounted at page root for global availability
- **Visual Design**:
  - **High Z-Index**: Ensures tour appears above all other content
  - **Responsive Layout**: Works on different screen sizes with max-width constraint
  - **Consistent Styling**: Uses existing Button components and design patterns
  - **Clear Typography**: Proper heading hierarchy and readable text
- **Performance**:
  - **Conditional Rendering**: Only renders when tour is open
  - **Minimal Overhead**: Lightweight component with no unnecessary re-renders
  - **Efficient State**: Simple state management with minimal complexity
- No schema or navigation changes - purely user onboarding enhancement

## v6.1.0 - Batch Approvals

### Added
- **Batch Approval Support**: Quick Approvals now supports comma-separated target IDs for batch operations
- **Batch Confirmation Dialog**: Confirmation dialog for batch operations with target list display
- **Progress Feedback**: Toast notifications showing batch operation progress and results
- **Safety Limits**: Maximum 50 IDs per batch operation to prevent abuse

### Technical Details
- **Batch ID Processing**:
  - **Comma Separation**: Input field accepts comma-separated target IDs
  - **ID Normalization**: Trims whitespace and filters empty values
  - **Safety Cap**: Limits to maximum 50 IDs per batch operation
  - **Real-time Processing**: Uses useMemo to process IDs as user types
- **Batch Operation Functions**:
  - **actOne Function**: Handles individual approval operations with proper error handling
  - **actBatch Function**: Processes multiple IDs sequentially with progress tracking
  - **Error Handling**: Continues processing even if individual operations fail
  - **Progress Tracking**: Counts successful operations and reports results
- **UI Integration**:
  - **Smart Button Behavior**: Single ID uses existing flow, multiple IDs trigger batch confirmation
  - **Batch Confirmation Dialog**: Shows action type and list of target IDs
  - **Helper Text**: Added tip about comma-separated IDs for batch operations
  - **Consistent Styling**: Batch operations use same button styling and behavior
- **User Experience**:
  - **Seamless Integration**: Batch functionality works alongside existing single-ID operations
  - **Clear Feedback**: Toast notifications show batch progress and completion status
  - **Confirmation Required**: Batch operations require explicit confirmation to prevent accidents
  - **Visual Clarity**: Confirmation dialog clearly shows which IDs will be processed
- **Technical Implementation**:
  - **State Management**: Added `batchConfirmOpen` and `batchKind` state variables
  - **API Integration**: Uses existing `/api/approvals` endpoint for individual operations
  - **Error Safety**: Proper error handling with fallback responses
  - **Performance**: Sequential processing to avoid overwhelming the API
- **Safety Features**:
  - **ID Limit**: Maximum 50 IDs per batch to prevent system overload
  - **Confirmation Required**: All batch operations require explicit user confirmation
  - **Error Resilience**: Individual failures don't stop the entire batch operation
  - **Progress Reporting**: Clear feedback on successful vs failed operations
- No schema or navigation changes - purely functional enhancement for batch operations

## v6.0.0 - About Modal

### Added
- **About Modal**: Information modal displaying app version, role, theme, and summary
- **Toolbar Integration**: About button added to Dashboard toolbar for easy access
- **Real-time Information**: Modal shows current role and theme state when opened
- **App Summary**: Brief description of app features and capabilities

### Technical Details
- **AboutModal Component** (`src/components/app/AboutModal.tsx`):
  - **Modal Integration**: Uses existing Modal component for consistent styling
  - **Dynamic Information**: Shows current app version, role, and theme
  - **Real-time Updates**: Role and theme information updates when modal opens
  - **App Summary**: Includes brief description of app features and capabilities
- **Dashboard Integration**:
  - **About Button**: Added to toolbar alongside Settings button
  - **State Management**: `aboutOpen` state controls modal visibility
  - **Modal Placement**: Positioned after Settings Modal in component tree
  - **Consistent Styling**: Button matches other toolbar controls with outline variant
- **Information Display**:
  - **Version**: Shows current `APP_VERSION` constant
  - **Role**: Displays current role from x-role cookie
  - **Theme**: Shows current theme (light/dark) based on document.body class
  - **Summary**: Brief description of app features and capabilities
- **User Experience**:
  - **Easy Access**: About button always visible in toolbar
  - **Quick Information**: Modal provides essential app information at a glance
  - **Consistent Design**: Modal follows existing design patterns
  - **Non-Intrusive**: Modal can be easily dismissed with backdrop click or close button
- **Technical Implementation**:
  - **Component Structure**: Clean, focused component with minimal dependencies
  - **State Management**: Uses useState for role and theme tracking
  - **Effect Hooks**: useEffect updates information when modal opens
  - **Cookie Integration**: Reuses existing `getRoleFromCookie()` helper function
- **Performance**:
  - **Lazy Loading**: Information only updates when modal is opened
  - **Minimal Overhead**: Lightweight component with no unnecessary re-renders
  - **Efficient Updates**: Only fetches role and theme when needed
- No schema or navigation changes - purely informational enhancement

## v5.9.0 - Persistent Column Width for Payload Cells

### Added
- **Payload Column Width Selector**: Choose payload column width (30%, 50%, 70%) for Audit & Events tables
- **localStorage Persistence**: Column width preference is saved and restored across sessions
- **CSS Variable Integration**: Uses CSS custom property for dynamic column width control
- **Table Layout Optimization**: Fixed table layout prevents layout jumps when widths change

### Technical Details
- **CSS Variable System**:
  - **Root Variable**: `--payload-col-w: 50%` defined in `:root` with 50% default
  - **Table Layout**: `.table-fixed` class with `table-layout: fixed` for consistent width application
  - **Dynamic Updates**: CSS variable updated via JavaScript for real-time width changes
  - **Theme Integration**: Variable works with both light and dark themes
- **State Management**:
  - **payloadW State**: Tracks selected width with localStorage initialization
  - **Default Value**: 50% width as default with fallback to localStorage
  - **Error Safety**: Try/catch blocks for safe localStorage operations
  - **Persistence**: useEffect hook saves preference and applies CSS variable
- **UI Controls**:
  - **Width Selector**: Small select dropdown in both Events and Audit card headers
  - **Options**: 30%, 50%, and 70% width options for different use cases
  - **Accessibility**: Proper aria-label for screen reader support
  - **Consistent Styling**: Matches other header controls with border and padding
- **Table Integration**:
  - **Fixed Layout**: Both tables use `table-fixed` class for consistent width behavior
  - **Column Styling**: Payload columns use `style={{ width: "var(--payload-col-w)" }}`
  - **Header and Body**: Both `<th>` and `<td>` elements use the same width variable
  - **Layout Stability**: Fixed layout prevents content from causing width changes
- **User Experience**:
  - **Persistent Preference**: Column width choice is remembered across browser sessions
  - **Immediate Effect**: Width changes apply instantly when selection is made
  - **Flexible Options**: Three width options accommodate different payload sizes
  - **Consistent Application**: Same width setting applies to both Events and Audit tables
- **Performance**:
  - **Efficient Updates**: CSS variable changes with minimal re-renders
  - **No Layout Thrashing**: Fixed table layout prevents layout recalculations
  - **Minimal Overhead**: Simple state management with localStorage persistence
- **Technical Implementation**:
  - **CSS Custom Properties**: Uses CSS variables for dynamic styling
  - **DOM Manipulation**: `document.documentElement.style.setProperty()` for variable updates
  - **Error Handling**: Safe localStorage and DOM operations with try/catch blocks
  - **State Synchronization**: useEffect ensures CSS variable stays in sync with state
- No schema or navigation changes - purely UI enhancement for better table layout control

## v5.8.0 - Quick Theme Switcher in Status Bar

### Added
- **Theme Toggle Button**: Quick theme switcher button in Status Bar for instant Dark/Light mode switching
- **localStorage Persistence**: Theme preference is automatically saved and restored across sessions
- **Real-time Theme Detection**: Status Bar button shows current theme state and updates automatically
- **MutationObserver Integration**: Monitors DOM changes to keep theme state in sync

### Technical Details
- **Theme Toggle Function**:
  - **toggleDark Function**: Handles theme switching by toggling "dark" class on document.body
  - **localStorage Integration**: Automatically saves theme preference ("light" or "dark")
  - **Error Safety**: Wrapped in try/catch blocks for safe localStorage operations
  - **Immediate Effect**: Theme changes instantly when button is clicked
- **Status Bar Integration**:
  - **Theme State**: `theme` state tracks current theme ("light" or "dark")
  - **Button Display**: Shows "Theme: light" or "Theme: dark" based on current state
  - **Click Handler**: Calls toggleDark() and updates theme state immediately
  - **Accessibility**: Includes aria-label and title attributes for screen readers
- **Real-time Synchronization**:
  - **MutationObserver**: Monitors document.body class changes for theme updates
  - **Automatic Updates**: Theme state updates when theme is changed elsewhere
  - **Cleanup**: Proper observer disconnection on component unmount
  - **Initialization**: Reads current theme state on component mount
- **User Experience**:
  - **Quick Access**: Theme toggle always visible in Status Bar
  - **Visual Feedback**: Button text shows current theme state
  - **Persistent Preference**: Theme choice is remembered across browser sessions
  - **Consistent Styling**: Button matches Status Bar design with border and padding
- **Performance**:
  - **Efficient Updates**: Only updates theme state when DOM class changes
  - **Minimal Overhead**: Lightweight MutationObserver with proper cleanup
  - **No Side Effects**: Only affects theme state and localStorage
- **Technical Implementation**:
  - **State Management**: Uses useState for theme tracking
  - **Effect Hooks**: useEffect for MutationObserver setup and cleanup
  - **DOM Manipulation**: Direct class manipulation for immediate theme changes
  - **Error Handling**: Safe localStorage operations with try/catch blocks
- No schema or navigation changes - purely UI enhancement for better theme accessibility

## v5.7.0 - Auto-scroll to Newest Events

### Added
- **Auto-scroll Toggle**: Optional auto-scroll to newest Events rows on refresh
- **localStorage Persistence**: Auto-scroll preference is saved and restored across sessions
- **Scroll Container Reference**: Direct DOM manipulation for precise scroll control
- **Events Header Integration**: Toggle added to Events card header for easy access

### Technical Details
- **Auto-scroll State Management**:
  - **State Variable**: `autoScrollEvents` state with `true` as default value
  - **localStorage Integration**: Preference is saved automatically when changed
  - **Initialization**: Reads from localStorage on component mount with fallback
  - **Persistence**: useEffect hook saves preference changes to localStorage
- **Scroll Control Implementation**:
  - **useRef Hook**: `evScrollRef` for direct access to Events table scroll container
  - **Scroll Logic**: Sets `scrollTop = 0` to scroll to newest rows (top of table)
  - **Conditional Execution**: Only scrolls when auto-scroll is enabled and ref exists
  - **Integration Point**: Added to `loadEvents()` function after successful data fetch
- **UI Integration**:
  - **Toggle Control**: Small checkbox in Events card header labeled "Auto-scroll"
  - **Consistent Styling**: Matches other header controls with text-xs and flex layout
  - **Immediate Effect**: Auto-scroll behavior changes instantly when toggle is used
  - **Visual Feedback**: Checkbox state clearly indicates current auto-scroll setting
- **User Experience**:
  - **Persistent Preference**: Auto-scroll choice is remembered across browser sessions
  - **Optional Behavior**: Users can disable auto-scroll if they prefer manual scrolling
  - **Newest First**: Always scrolls to top where newest events appear
  - **Non-Intrusive**: Toggle is small and doesn't interfere with other controls
- **Performance**:
  - **Efficient Scrolling**: Direct DOM manipulation with minimal overhead
  - **Conditional Execution**: Only performs scroll operation when needed
  - **No Side Effects**: Only affects scroll position, no other functionality
- **Technical Implementation**:
  - **Ref Attachment**: `evScrollRef` attached to Events table scroll container
  - **Scroll Timing**: Executes after `setEvRows()` to ensure DOM is updated
  - **Error Safety**: Wrapped in try/catch for localStorage operations
  - **Default Behavior**: Auto-scroll enabled by default for better user experience
- No schema or navigation changes - purely UI enhancement for better event monitoring

## v5.6.0 - Saved Layout Preference

### Added
- **Layout Preference Toggle**: Switch between compact and roomy layout modes
- **localStorage Persistence**: Layout preference is saved and restored across sessions
- **Dynamic Layout Classes**: Text size and spacing adjust based on selected preference
- **Toolbar Integration**: Layout toggle added to the main toolbar for easy access

### Technical Details
- **Layout State Management**:
  - **State Variable**: `layoutPref` state with "roomy" as default value
  - **localStorage Integration**: Preference is saved automatically when changed
  - **Initialization**: Reads from localStorage on component mount with fallback
  - **Persistence**: useEffect hook saves preference changes to localStorage
- **Layout Toggle Control**:
  - **Select Dropdown**: Small select element in toolbar with two options
  - **Options**: "Roomy layout" and "Compact layout" for clear user choice
  - **Immediate Effect**: Layout changes instantly when selection is made
  - **Consistent Styling**: Matches other toolbar controls with border and padding
- **Dynamic Layout Classes**:
  - **Main Element**: Applied to root `<main>` element for global effect
  - **Compact Mode**: `text-xs space-y-2` for smaller text and tighter spacing
  - **Roomy Mode**: `text-sm space-y-4` for larger text and more generous spacing
  - **Conditional Application**: Uses template literal with ternary operator
- **User Experience**:
  - **Persistent Preference**: Layout choice is remembered across browser sessions
  - **Instant Feedback**: Layout changes immediately when toggle is used
  - **Clear Options**: Descriptive labels make the choice obvious
  - **Global Effect**: Affects entire dashboard layout consistently
- **Performance**:
  - **Efficient Updates**: Only re-renders when layout preference changes
  - **Minimal Overhead**: Simple state management with localStorage persistence
  - **No Side Effects**: Only affects visual layout, no functional changes
- No schema or navigation changes - purely UI layout preference enhancement

## v5.5.0 - Collapsible Payloads

### Added
- **CollapsibleJson Component**: Collapsible JSON payload cells with show/hide toggle
- **Reduced Visual Noise**: JSON payloads are hidden by default to reduce table clutter
- **Copy Functionality**: Integrated copy button for easy JSON payload copying
- **User Control**: Toggle to show/hide JSON content as needed

### Technical Details
- **CollapsibleJson Component** (`src/components/ui/CollapsibleJson.tsx`):
  - **Toggle State**: Uses `useState` to manage show/hide state
  - **Compact Design**: Small, unobtrusive component with border and background
  - **Copy Integration**: Includes CopyButton for easy JSON copying
  - **Conditional Rendering**: Only shows JSON content when expanded
- **Dashboard Integration**:
  - **Events Table**: Replaced raw JSON output with CollapsibleJson component
  - **Audit Table**: Replaced raw JSON output with CollapsibleJson component
  - **Consistent Styling**: Same component used across both tables
  - **Preserved Functionality**: All existing copy functionality maintained
- **User Experience**:
  - **Reduced Clutter**: Tables are much cleaner with collapsed payloads
  - **On-Demand Viewing**: Users can expand payloads only when needed
  - **Easy Copying**: Copy button always available for JSON data
  - **Visual Feedback**: Clear "Show/Hide JSON" button with blue underline styling
- **Visual Design**:
  - **Compact Layout**: Small component that doesn't take up excessive space
  - **Clear Controls**: Blue underlined button for show/hide action
  - **Consistent Styling**: Matches existing table design patterns
  - **Readable JSON**: Proper formatting with whitespace and line breaks when expanded
- **Performance**:
  - **Conditional Rendering**: JSON is only rendered when expanded
  - **Minimal Overhead**: Simple state management with no complex logic
  - **Efficient Updates**: Only re-renders when toggle state changes
- No schema or navigation changes - purely UI enhancement for better table readability

## v5.4.0 - Inline Timestamps Toggle

### Added
- **Timestamp Format Toggle**: Switch between ISO timestamps and relative "time ago" format
- **Relative Time Hook**: Custom hook for calculating and updating relative timestamps
- **Real-Time Updates**: Relative timestamps update automatically every minute
- **User Preference**: Toggle checkbox to switch between timestamp formats

### Technical Details
- **useRelativeTime Hook** (`src/lib/client/useRelativeTime.ts`):
  - **Time Calculation**: Converts timestamps to human-readable relative format
  - **Auto Updates**: Refreshes every 60 seconds to keep relative times current
  - **Format Options**: "just now", "5m ago", "2h ago", "3d ago" formats
  - **Type Safety**: Handles both number and string timestamp inputs
- **Dashboard Integration**:
  - **Toggle Checkbox**: Small checkbox labeled "Relative time" near the toolbar
  - **State Management**: `useRelative` state controls timestamp format
  - **Dual Format Support**: Seamlessly switches between ISO and relative formats
  - **Consistent Application**: Applied to both Events and Audit tables
- **Timestamp Rendering**:
  - **Events Table**: Uses `useRelativeTime(e.ts)` when relative mode is enabled
  - **Audit Table**: Uses `useRelativeTime(e.ts)` when relative mode is enabled
  - **Fallback Handling**: Graceful handling of null/undefined timestamps
  - **Type Conversion**: Proper handling of both numeric and string timestamps
- **User Experience**:
  - **Instant Toggle**: Immediate format change when checkbox is toggled
  - **Live Updates**: Relative timestamps update automatically in real-time
  - **Intuitive Format**: Human-readable relative times (e.g., "2h ago", "just now")
  - **Consistent Display**: Same format applied across all timestamp columns
- **Performance**:
  - **Efficient Updates**: Only updates every 60 seconds to minimize re-renders
  - **Memory Management**: Proper cleanup of intervals on component unmount
  - **Minimal Overhead**: Lightweight calculation with no external dependencies
- No schema or navigation changes - purely UI enhancement for better timestamp readability

## v5.3.0 - Clear Events Buffer

### Added
- **Clear Events Action**: Dev-only action to wipe the in-process dev events ring buffer
- **API Endpoint**: Simple POST endpoint to clear the events buffer
- **Dashboard Integration**: Clear Events button added to the toolbar
- **Real-Time Feedback**: Toast notifications for success/error states

### Technical Details
- **Buffer Management** (`src/lib/dev-events-buffer.ts`):
  - **clearDevEvents Function**: Simple function that sets buffer length to 0
  - **Memory Efficient**: Clears buffer without creating new array
  - **Thread Safe**: Direct array length manipulation for immediate clearing
- **API Endpoint** (`src/app/api/dev-events/clear/route.ts`):
  - **POST Route**: Simple endpoint that calls clearDevEvents and returns success
  - **No Parameters**: No request body or query parameters needed
  - **JSON Response**: Returns `{ ok: true }` on successful clearing
- **Dashboard Integration**:
  - **Toolbar Button**: Added "Clear Events" button to the end of the toolbar
  - **Error Handling**: Try/catch blocks with proper error handling
  - **Toast Feedback**: Success ("Events cleared") and error ("Could not clear events") messages
  - **Auto Refresh**: Automatically refreshes Events Monitor after clearing
- **User Experience**:
  - **One-Click Action**: Simple button click to clear all events
  - **Immediate Feedback**: Toast notifications confirm action success/failure
  - **Visual Update**: Events Monitor refreshes to show empty state
  - **Dev-Only**: Intended for development use to reset event buffer
- **Performance**:
  - **Fast Operation**: Immediate buffer clearing with no processing delay
  - **Memory Efficient**: Direct array manipulation without object creation
  - **No Side Effects**: Only affects the dev events buffer, no other data
- No schema or navigation changes - purely development tooling enhancement

## v5.2.0 - Compact Toolbar

### Added
- **Toolbar Component**: Reusable toolbar component for grouping common actions
- **Compact Action Cluster**: Grouped common Dashboard actions (Settings, Print, Share, Reset, Seed) into a single toolbar
- **Consistent Spacing**: Uniform gap spacing between toolbar buttons
- **Responsive Layout**: Flex-wrap ensures proper display on smaller screens

### Technical Details
- **Toolbar Component** (`src/components/ui/Toolbar.tsx`):
  - **Flex Layout**: Uses `flex flex-wrap items-center gap-2` for consistent spacing
  - **Responsive Design**: Flex-wrap ensures buttons wrap properly on smaller screens
  - **Reusable**: Generic component that accepts children for any button combination
  - **Consistent Spacing**: 2-unit gap between buttons for uniform appearance
- **Dashboard Integration**:
  - **Action Grouping**: Consolidated 6 common actions into a single toolbar
  - **Button Order**: Toggle Dark Mode, Settings, Print, Share Snapshot, Reset Dashboard, Seed Demo Data
  - **Consistent Styling**: All buttons use `variant="outline"` for uniform appearance
  - **Preserved Functionality**: All existing button functionality maintained
- **User Experience**:
  - **Cleaner Layout**: Reduced visual clutter with grouped actions
  - **Better Organization**: Related actions grouped together logically
  - **Consistent Spacing**: Uniform gaps between all toolbar buttons
  - **Responsive**: Toolbar adapts to different screen sizes with flex-wrap
- **Visual Design**:
  - **Compact Layout**: More efficient use of vertical space
  - **Consistent Styling**: All buttons follow the same design pattern
  - **Clear Hierarchy**: Toolbar provides clear visual grouping of actions
- No schema or navigation changes - purely UI organization enhancement

## v5.1.0 - Sticky Headers

### Added
- **Sticky Table Headers**: Table headers remain visible when scrolling through Events and Audit data
- **Improved Data Scanning**: Headers stay in view making it easier to understand column data
- **Theme-Aware Styling**: Sticky headers use theme variables for consistent appearance

### Technical Details
- **CSS Sticky Headers** (`src/app/globals.css`):
  - **Position Sticky**: Headers stick to top of scroll container when scrolling
  - **Theme Integration**: Uses `var(--card-bg)` and `var(--card-border)` for consistent theming
  - **Z-Index Layering**: Proper z-index ensures headers stay above table content
  - **Border Styling**: Bottom border on sticky headers for visual separation
- **Table Container Integration**:
  - **Existing Classes**: Leverages existing `table-scroll` class on Events and Audit tables
  - **No Logic Changes**: Pure CSS enhancement with no JavaScript modifications
  - **Responsive Design**: Works with existing `overflow-x-auto` for horizontal scrolling
- **User Experience**:
  - **Better Data Navigation**: Headers always visible when scrolling through large datasets
  - **Improved Readability**: Column labels remain accessible during data review
  - **Consistent Theming**: Sticky headers match light/dark theme automatically
  - **Performance**: CSS-only solution with no JavaScript overhead
- **Visual Design**:
  - **Seamless Integration**: Headers blend naturally with existing table styling
  - **Theme Consistency**: Background and border colors match current theme
  - **Clear Separation**: Bottom border provides visual distinction from content
- No schema or navigation changes - purely UI enhancement for better data scanning

## v5.0.0 - Demo Data Seeder

### Added
- **Demo Data Seeder API**: Endpoint to emit a small, fixed batch of mixed events
- **Dashboard Seeder Button**: One-click button to trigger demo data generation
- **Mixed Event Types**: Generates approvals, forecasts, and replenishment events
- **Real-Time Integration**: Automatically refreshes Events and Audit data after seeding

### Technical Details
- **Demo Seed API** (`src/app/api/demo-seed/route.ts`):
  - **Approval Events**: Generates 2 approval requests (1 granted, 1 denied)
  - **Forecast Events**: Generates forecast start and completion with 150ms delay
  - **Replenishment Events**: Generates 1 replenishment draft with sample items
  - **Event Count**: Emits exactly 6 events per seeding operation
  - **Unique IDs**: Uses timestamp-based IDs to prevent conflicts
  - **Error Handling**: Proper error responses with SYS_001 error code
- **Dashboard Integration**:
  - **Seed Button**: Added to User Profile section beside Settings/Reset buttons
  - **Loading State**: Shows "Seeding…" during operation with disabled state
  - **Toast Feedback**: Success/error notifications for seeding operations
  - **Auto Refresh**: Automatically refreshes Events Monitor and Audit data after seeding
- **Event Generation**:
  - **ApprovalRequested**: 2 requests with unique target IDs and notes
  - **ApprovalGranted**: 1 grant by SYSTEM for first request
  - **ApprovalDenied**: 1 denial by SYSTEM for second request with reason
  - **ForecastRunStarted**: Start event with 7-day horizon and 3 items
  - **ForecastRunCompleted**: Completion event with result summary
  - **ReplenishmentDraftCreated**: Draft with 2 sample SKUs and quantities
- **User Experience**:
  - **One-Click Operation**: Simple button click to generate demo data
  - **Visual Feedback**: Clear loading states and success/error messages
  - **Immediate Results**: Events appear in real-time in Events Monitor and Audit
  - **Non-Destructive**: Demo data doesn't interfere with existing data
- **Performance**:
  - **Fast Generation**: 150ms delay only for forecast completion simulation
  - **Efficient Processing**: Minimal server processing with direct event emission
  - **Memory Safe**: No large data structures or memory leaks
- No schema or navigation changes - purely demo data generation enhancement

## v4.6.0 - Export CSV

### Added
- **CSV Export Functionality**: Export filtered Events and Audit data as CSV files
- **Union-Friendly Format**: Single CSV format that works for both Events and Audit data
- **Proper CSV Escaping**: Handles quotes, commas, and special characters correctly
- **Filter Integration**: Exports currently visible/filtered rows, not all data

### Technical Details
- **downloadCsv Utility** (`src/lib/client/downloadCsv.ts`):
  - **CSV Formatting**: Proper CSV escaping with double quotes for values containing commas/quotes
  - **Union Schema**: Single column set that works for both Events and Audit data
  - **Column Mapping**: Maps data fields to consistent CSV columns (ts, actor, actorRole, action, name, payload)
  - **Timestamp Handling**: Converts numeric timestamps to ISO strings for readability
  - **Fallback Values**: Handles missing fields with empty strings or JSON fallbacks
- **CSV Export Buttons**:
  - **Events Export**: Exports `evSlice` (paginated/filtered events) as `events-{id}.csv`
  - **Audit Export**: Exports `auSlice` (paginated/filtered audit entries) as `audit-{id}.csv`
  - **Unique Filenames**: Uses `safeId()` to generate unique filenames for each export
  - **Button Placement**: Added beside existing Export JSON buttons in card headers
- **Data Processing**:
  - **Field Extraction**: Extracts relevant fields from each row type
  - **Type Safety**: Handles different data types (strings, numbers, objects)
  - **JSON Serialization**: Converts complex payloads to JSON strings for CSV compatibility
  - **Empty Handling**: Graceful handling of null/undefined values
- **User Experience**:
  - **One-Click Export**: Simple button click to download CSV file
  - **Filtered Data**: Exports only currently visible/filtered rows
  - **Standard Format**: CSV format compatible with Excel, Google Sheets, etc.
  - **Consistent Naming**: Clear filename indication of content type and timestamp
- **Performance**:
  - **Client-Side Processing**: No server requests needed for CSV generation
  - **Efficient Blob Creation**: Uses Blob API for memory-efficient file creation
  - **Automatic Cleanup**: Proper cleanup of object URLs to prevent memory leaks
- No schema or navigation changes - purely data export enhancement

## v4.7.0 - Pagination Controls

### Added
- **Client-Side Pagination**: Simple pagination controls for Events and Audit tables
- **Filter Integration**: Pagination works with filtered data, not just raw data
- **Configurable Page Sizes**: Users can choose from 10, 20, 25, 50, or 100 items per page
- **Navigation Controls**: First, Previous, Next, and Last page buttons
- **Page Information**: Shows current page, total pages, and item counts

### Technical Details
- **Events Pagination**:
  - **Page Size**: Default 20 items per page, configurable (10, 20, 50, 100)
  - **Page State**: `evPage` tracks current page index (0-based)
  - **Filter Integration**: Pagination works on filtered results (`evSlice`)
  - **Auto Reset**: Page resets to 0 when filter changes
- **Audit Pagination**:
  - **Page Size**: Default 25 items per page, configurable (10, 25, 50, 100)
  - **Page State**: `auPage` tracks current page index (0-based)
  - **Filter Integration**: Pagination works on filtered results (`auSlice`)
  - **Auto Reset**: Page resets to 0 when filter changes
- **Pagination Calculations**:
  - **Total Count**: Calculated from filtered arrays
  - **Slice Generation**: `slice(page * pageSize, page * pageSize + pageSize)`
  - **Page Count**: `Math.ceil(total / pageSize)`
  - **Boundary Handling**: Proper handling of edge cases and empty data
- **UI Controls**:
  - **Page Size Selector**: Dropdown to change items per page
  - **Navigation Buttons**: First, Previous, Next, Last with proper disabled states
  - **Page Information**: Shows "Page X / Y" and "items / total" counts
  - **Responsive Design**: Compact layout that works on smaller screens
- **State Management**:
  - **Page State**: Separate state for Events and Audit pagination
  - **Page Size State**: Configurable page sizes with localStorage persistence
  - **Filter Integration**: Pagination resets when filters change
  - **Performance**: Efficient slicing without unnecessary re-renders
- **User Experience**:
  - **Intuitive Controls**: Standard pagination patterns users expect
  - **Visual Feedback**: Disabled states for navigation buttons
  - **Flexible Sizing**: Multiple page size options for different use cases
  - **Filter Awareness**: Pagination automatically adjusts to filtered results
- No schema or navigation changes - purely client-side pagination enhancement

## v4.4.0 - Status Bar

### Added
- **Compact Status Bar**: Live status information at the top of the Dashboard
- **Live Clock**: Real-time clock that updates every second
- **Role Display**: Shows current user role from cookie
- **Version Display**: Shows current application version
- **Event Count**: Displays current number of captured events

### Technical Details
- **StatusBar Component** (`src/components/ui/StatusBar.tsx`):
  - Live clock with 1-second update interval using `useInterval`
  - Role detection from x-role cookie with fallback to "ANON"
  - Version display from `APP_VERSION` constant
  - Event count passed as prop from Dashboard
  - Compact design with emoji icons for visual clarity
- **Real-Time Updates**:
  - **Clock**: Updates every second using `useInterval` hook
  - **Role**: Detected on component mount and updates when needed
  - **Event Count**: Reactive to changes in events data
  - **Version**: Static display of current application version
- **UI Design**:
  - **Compact Layout**: Small text with flex-wrap for responsive design
  - **Visual Icons**: Emoji icons for quick visual identification
  - **Gray Text**: Subtle styling that doesn't interfere with main content
  - **Responsive**: Flex-wrap ensures proper display on smaller screens
- **Information Display**:
  - **🕒 Clock**: Current time in locale format
  - **👤 Role**: Current user role (ANON, FM, ADMIN, etc.)
  - **🏷️ Version**: Application version number
  - **📡 Events**: Current count of captured events
- **Integration**:
  - **Dashboard Integration**: Added at top of main content area
  - **Event Count**: Passed from Dashboard's `evRows` state
  - **Consistent Styling**: Matches Dashboard's design language
  - **Non-Intrusive**: Small, unobtrusive design
- **Performance**:
  - **Efficient Updates**: Only clock updates every second
  - **Minimal Re-renders**: Other data updates only when needed
  - **Lightweight**: Small component with minimal overhead
- No schema or navigation changes - purely informational enhancement

## v4.2.0 - Reset Dashboard

### Added
- **Reset Dashboard Action**: Safe soft reset functionality with confirmation
- **Local State Clearing**: Clears filters, settings, and theme preferences
- **Data Refresh**: Reloads audit and events data after reset
- **Confirmation Dialog**: Prevents accidental resets with clear messaging

### Technical Details
- **Reset Functionality**:
  - **Local Storage Cleanup**: Removes `pollMs` and `theme` from localStorage
  - **Filter Clearing**: Resets Events and Audit search filters to empty strings
  - **Theme Reset**: Removes dark mode class from document body
  - **Data Reload**: Triggers refresh of audit and events data
  - **Error Handling**: Safe try/catch blocks prevent reset failures
- **UI Integration**:
  - **Reset Button**: Added to User Profile section next to Settings button
  - **Confirmation Dialog**: Uses existing ConfirmDialog component
  - **Clear Messaging**: Explains what the reset will do
  - **Consistent Styling**: Matches existing button and dialog patterns
- **State Management**:
  - **resetOpen**: Boolean state for dialog visibility
  - **softReset Function**: Handles all reset logic safely
  - **Proper Cleanup**: Dialog state is reset after action completion
- **User Experience**:
  - **Clear Intent**: Button clearly labeled "Reset Dashboard"
  - **Confirmation Required**: Prevents accidental resets
  - **Comprehensive Reset**: Clears all local UI state and preferences
  - **Data Refresh**: Ensures fresh data after reset
- **Safety Features**:
  - **Confirmation Dialog**: User must explicitly confirm reset action
  - **Safe Implementation**: Error handling prevents reset failures
  - **Reversible**: Easy to cancel if clicked by mistake
  - **Non-Destructive**: Only clears local state, no server data affected
- **Reset Scope**:
  - **Local Settings**: Poll interval and theme preferences
  - **Search Filters**: Events and Audit table filters
  - **UI State**: Dark mode and other visual preferences
  - **Data Refresh**: Reloads current audit and events data
- No schema or navigation changes - purely local state management enhancement

## v4.0.0 - Confirm Dialogs

### Added
- **ConfirmDialog Component**: Minimal confirmation dialog for critical actions
- **Approval Confirmations**: Require confirmation before Approve/Deny actions
- **Safety Measures**: Prevent accidental approval/denial of targets
- **Reusable Component**: Ready for future use with Reset Dashboard and other actions

### Technical Details
- **ConfirmDialog Component** (`src/components/ui/ConfirmDialog.tsx`):
  - Modal overlay with backdrop click to cancel
  - Centered dialog with proper z-index layering
  - Configurable title, message, and button text
  - Danger variant for confirm button to indicate critical action
  - Outline variant for cancel button
  - Proper accessibility with backdrop dismissal
- **Approval Flow Integration**:
  - **Approve Button**: Opens confirmation dialog before granting approval
  - **Deny Button**: Opens confirmation dialog before denying approval
  - **Dynamic Content**: Dialog title and message change based on action type
  - **Target Display**: Shows the specific target ID being acted upon
  - **Existing Handler**: Reuses existing `act()` function after confirmation
- **State Management**:
  - **confirmOpen**: Boolean state for dialog visibility
  - **confirmKind**: Tracks whether user is confirming "grant" or "deny"
  - **Proper Cleanup**: Dialog state is reset after action completion
- **User Experience**:
  - **Clear Messaging**: "Are you sure you want to approve/deny target {id}?"
  - **Visual Feedback**: Bold text for action type and code formatting for target ID
  - **Easy Cancellation**: Click backdrop or Cancel button to abort
  - **Consistent Styling**: Matches existing modal design patterns
- **Safety Features**:
  - **Prevents Accidents**: No direct approval/denial without confirmation
  - **Clear Intent**: User must explicitly confirm their action
  - **Reversible**: Easy to cancel if clicked by mistake
  - **Audit Trail**: Confirmed actions still go through existing audit system
- **Future Ready**:
  - **Reusable Component**: Can be used for Reset Dashboard and other critical actions
  - **Flexible API**: Configurable title, message, and button text
  - **Consistent Pattern**: Establishes confirmation pattern for other features
- No schema or navigation changes - purely safety enhancement

## v4.1.0 - Help Tooltips

### Added
- **Lightweight Tooltip Component**: CSS-only tooltips with hover interactions
- **Contextual Help**: Tooltips on key controls explaining their functionality
- **User Guidance**: Helpful hints for buttons, inputs, and interactive elements
- **Accessibility**: Proper tooltip positioning and hover states

### Technical Details
- **Tooltip Component** (`src/components/ui/Tooltip.tsx`):
  - CSS-only implementation using Tailwind classes
  - Hover-triggered tooltips with smooth opacity transitions
  - Proper positioning with absolute positioning and transforms
  - Black background with white text for high contrast
  - Non-intrusive design that doesn't interfere with interactions
- **Tooltip Integration**:
  - **Approval Controls**: Tooltips on Request, Approve, and Deny buttons
  - **Input Fields**: Tooltips on Target ID input and filter inputs
  - **Demo Actions**: Tooltips on Start Forecast and Create Draft buttons
  - **Export Functions**: Tooltips on Export JSON buttons
  - **Search Filters**: Tooltips on Events and Audit filter inputs
- **User Experience**:
  - **Contextual Help**: Clear explanations of what each control does
  - **Hover Interaction**: Tooltips appear on hover and disappear on mouse leave
  - **Non-Blocking**: Tooltips don't interfere with normal interactions
  - **Consistent Styling**: Uniform tooltip appearance across all controls
- **Accessibility**:
  - **High Contrast**: Black background with white text for readability
  - **Proper Positioning**: Tooltips positioned above elements to avoid overlap
  - **Smooth Transitions**: Opacity transitions for smooth appearance/disappearance
  - **Non-Intrusive**: Tooltips don't block or interfere with other UI elements
- **Performance**:
  - **CSS-Only**: No JavaScript animations or complex state management
  - **Lightweight**: Minimal overhead with pure CSS hover states
  - **Efficient**: No re-renders or performance impact on interactions
- No schema or navigation changes - purely user experience enhancement

## v3.8.0 - Export to JSON

### Added
- **Export JSON Buttons**: Download buttons for Events and Audit tables to export currently visible rows
- **Filtered Export**: Exports only the currently filtered/visible rows, not the entire dataset
- **Unique Filenames**: Uses safeId() to generate unique filenames for each export
- **Formatted JSON**: Pretty-printed JSON with proper indentation for readability

### Technical Details
- **downloadJson Utility** (`src/lib/client/downloadJson.ts`):
  - Creates downloadable JSON files using Blob API
  - Pretty-prints JSON with 2-space indentation
  - Generates unique filenames with timestamp-based IDs
  - Proper cleanup of object URLs to prevent memory leaks
- **Export Implementation**:
  - **Events Export**: Downloads filtered events as `events-{id}.json`
  - **Audit Export**: Downloads filtered audit entries as `audit-{id}.json`
  - **Filtered Data**: Only exports currently visible rows after applying search filters
  - **Real-Time Export**: Exports current view state, including any active filters
- **UI Integration**:
  - **Events Monitor**: Export button in card header beside filter and refresh
  - **Audit Table**: Export button in card header beside filter and refresh
  - **Button Styling**: Outline variant for secondary action appearance
  - **Consistent Layout**: Maintains existing header layout and spacing
- **File Management**:
  - **Automatic Download**: Triggers browser download without server interaction
  - **Unique Names**: Each export gets a unique filename to prevent overwrites
  - **JSON Format**: Standard JSON format for easy import into other tools
  - **Memory Efficient**: Proper cleanup of blob URLs after download
- **User Experience**:
  - One-click export of current view
  - Exports only relevant filtered data
  - Clear filename indication of content type
  - No server requests or loading states needed
- No schema or navigation changes - purely data export enhancement

## v3.7.0 - Mini Search Filters

### Added
- **Client-Side Search Filters**: Lightweight text filter inputs for Events and Audit tables
- **Debounced Input**: 250ms debounce to prevent excessive filtering during typing
- **Real-Time Filtering**: Instant filtering of table rows as user types
- **JSON-Based Search**: Searches across all fields by converting rows to JSON strings

### Technical Details
- **useDebouncedValue Hook** (`src/lib/client/useDebouncedValue.ts`):
  - Generic hook for debouncing any value type
  - Configurable delay (default 250ms)
  - Automatic cleanup of timeouts
  - Prevents excessive re-renders during typing
- **Filter Implementation**:
  - **Events Filter**: Filters by event name, timestamp, and payload content
  - **Audit Filter**: Filters by actor, role, action, timestamp, and payload content
  - **Case-Insensitive**: All filtering is case-insensitive for better usability
  - **JSON String Search**: Converts entire row objects to JSON for comprehensive search
- **UI Integration**:
  - **Events Monitor**: Filter input in card header (w-48 width)
  - **Audit Table**: Filter input in card header (w-56 width)
  - **Placeholder Text**: Clear placeholder text ("Filter events…", "Filter audit…")
  - **Accessibility**: Proper aria-labels for screen readers
- **Performance**:
  - Client-side filtering (no server requests)
  - Debounced input prevents excessive filtering
  - Efficient JSON string conversion
  - No impact on data loading or API calls
- **User Experience**:
  - Instant visual feedback as user types
  - Smooth filtering without lag
  - Clear visual indication of filtered results
  - Maintains existing table functionality
- No schema or navigation changes - purely client-side filtering enhancement

## v3.6.0 - Copy JSON Controls

### Added
- **Copy JSON Button**: Small copy button for payload cells in Events and Audit tables
- **Clipboard API Integration**: Modern clipboard API with graceful fallback
- **Toast Feedback**: Success/error notifications for copy operations
- **Enhanced Data Access**: Easy copying of JSON payloads for debugging and analysis

### Technical Details
- **CopyButton Component** (`src/components/ui/CopyButton.tsx`):
  - Modern Clipboard API with fallback to legacy `document.execCommand`
  - Loading state with visual feedback (shows "…" when busy)
  - Toast notifications for success/failure feedback
  - Disabled state during copy operations
- **Table Integration**:
  - **Events Monitor**: Added copy button to payload cells with header row
  - **Audit Table**: Added copy button to payload cells with header row
  - **Layout**: Header row with "Payload" label and copy button
  - **Content**: JSON payload displayed in pre-wrap div below header
- **User Experience**:
  - Small, unobtrusive copy buttons
  - Clear visual feedback during copy operations
  - Toast notifications confirm successful copies
  - Graceful error handling for copy failures
- **Accessibility**:
  - Proper button semantics
  - Disabled state during operations
  - Clear visual feedback
- No schema or navigation changes - purely data access enhancement

## v3.5.0 - Settings Modal

### Added
- **Settings Modal**: Minimal modal for adjusting Dashboard preferences
- **Configurable Poll Interval**: Adjustable events polling frequency (500ms minimum)
- **Dark Mode Toggle**: Quick access to theme switching within settings
- **localStorage Persistence**: Settings are saved locally in browser

### Technical Details
- **Modal Component** (`src/components/ui/Modal.tsx`):
  - Fixed overlay with backdrop click to close
  - Centered modal with proper z-index layering
  - Accessible close button with aria-label
  - Responsive design with max-width constraint
- **Settings Features**:
  - **Poll Interval Control**: Number input with 500ms minimum, 100ms step increments
  - **Theme Toggle**: Reuses existing dark mode functionality
  - **localStorage Integration**: Automatically saves and restores poll interval setting
- **Dashboard Integration**:
  - Settings button added to User Profile section
  - Modal state management with React hooks
  - Dynamic polling interval updates without page refresh
  - Settings persist across browser sessions
- **User Experience**:
  - Clean, minimal settings interface
  - Clear labeling and helpful text
  - Immediate effect of setting changes
  - Non-intrusive modal design
- No schema or navigation changes - purely user preference enhancement

## v3.4.0 - Dashboard Keyboard Shortcuts

### Added
- **Keyboard Shortcuts**: Handy hotkeys for common Dashboard actions
- **useHotkeys Hook**: Reusable React hook for keyboard event handling
- **Shortcut Help Legend**: Visual reference for available keyboard shortcuts
- **Enhanced Productivity**: Faster access to Dashboard functions via keyboard

### Technical Details
- **useHotkeys Hook** (`src/lib/client/useHotkeys.ts`):
  - Handles keyboard event normalization and binding
  - Supports modifier keys (Ctrl, Shift, Alt, Meta)
  - Automatic cleanup on component unmount
  - Configurable enable/disable functionality
- **Keyboard Shortcuts**:
  - `R`: Refresh audit data with toast confirmation
  - `E`: Refresh events monitor with toast confirmation
  - `F`: Start forecast demo
  - `C`: Create replenishment draft
  - `P`: Request approval (requires target ID)
  - `G`: Grant approval (requires ADMIN/FM role and target ID)
  - `D`: Deny approval (requires ADMIN/FM role and target ID)
- **Integration**:
  - Exposed `loadEvents` function to window for keyboard access
  - All shortcuts prevent default browser behavior
  - Role-based shortcuts respect existing RBAC logic
  - Toast notifications provide feedback for refresh actions
- **Help Legend**: Added compact shortcut reference at bottom of Dashboard
- No schema or navigation changes - purely productivity enhancement

## v3.3.0 - Compact Table Styles

### Added
- **Compact Table Design**: Reduced padding for more efficient space usage in data tables
- **Scrollable Table Bodies**: Fixed height containers with vertical scrolling for large datasets
- **Improved Payload Wrapping**: Better handling of long JSON payloads with proper word breaking
- **Enhanced Readability**: Optimized table layout for better data consumption

### Technical Details
- **CSS Classes Added**:
  - `.table-compact`: Reduced cell padding from `0.5rem 0.75rem` to `0.375rem 0.5rem`
  - `.table-scroll`: Fixed max-height of 360px with vertical scrolling
  - `.pre-wrap`: Proper text wrapping with `white-space: pre-wrap` and `word-break: break-word`
- **Table Updates**:
  - Events Monitor table: Added `table-compact` class and `table-scroll` wrapper
  - Recent Audit table: Added `table-compact` class and `table-scroll` wrapper
  - Payload cells: Replaced `whitespace-pre-wrap break-words` with `pre-wrap` class
- **Layout Improvements**:
  - Tables now have consistent compact spacing across all data tables
  - Long JSON payloads wrap properly without breaking table layout
  - Scrollable containers prevent tables from taking up excessive vertical space
  - Horizontal scrolling maintained for wide tables
- No schema or navigation changes - purely UI layout enhancement

## v3.2.0 - Microcopy Improvements

### Added
- **Clearer Card Titles**: Updated section titles for better clarity and consistency
- **Improved Button Labels**: Simplified and more intuitive button text
- **Contextual Empty States**: Targeted empty state messages with actionable guidance
- **Friendlier Toast Messages**: Human-readable success and error notifications

### Technical Details
- **Card Title Updates**:
  - "Quick Approvals" → "Approvals (Demo)"
  - "Forecast Demo" → "Forecasts (Demo)"
  - "Replenishment Draft Demo" → "Replenishments (Demo)"
  - "Events Monitor (dev)" → "Events (Dev Monitor)"
- **Button Label Improvements**:
  - "Request Approval" → "Request"
  - "Run Forecast" → "Start Forecast"
  - "Approve"/"Deny" unchanged for clarity
- **Empty State Enhancements**:
  - Events: "No events captured. Perform an action to see live events."
  - Forecasts: "No completed forecasts. Use 'Start Forecast' above."
  - Replenishments: "No drafts yet. Use 'Create Draft' above."
  - Audit: "No audit entries yet. Trigger an action above, then refresh."
- **Toast Message Improvements**:
  - Success: "Approval requested." / "Approval granted." / "Approval denied." / "Forecast completed." / "Draft created."
  - Error: "Couldn't request approval." / "Couldn't start forecast." / "Couldn't create draft."
- No schema or navigation changes - purely user experience enhancement

## v3.0.0 - Theme Polish

### Added
- **Theme Tokens**: Centralized CSS custom properties for card backgrounds, borders, and text colors
- **Dark Mode Refinements**: Improved contrast and consistency across all UI components
- **Empty State Styling**: Theme-aware styling for empty states and placeholder content
- **Table Styling**: Consistent table padding and width styling

### Technical Details
- Added CSS custom properties: `--card-bg`, `--card-border`, `--text-main` for light and dark modes
- Light mode: `--card-bg: #ffffff`, `--card-border: #e5e7eb`, `--text-main: #111827`
- Dark mode: `--card-bg: #1f2937`, `--card-border: #374151`, `--text-main: #e5e7eb`
- Updated `.bg-white` and `.border` classes to use theme variables with `!important`
- Added `.empty-state` class for consistent empty state styling across components
- Enhanced table styling with consistent padding (`0.5rem 0.75rem`) and full width
- Replaced hardcoded `bg-gray-50` classes with theme-aware `.empty-state` class
- Improved dark mode contrast for cards, tables, and interactive elements
- No schema or navigation changes - purely visual theme enhancement

## v2.9.0 - Gentle Error Guards

### Added
- **Error State Management**: Added error state variables for Events Monitor and System Health sections
- **User-Friendly Error Messages**: Gentle error messages with consistent styling and helpful text
- **Graceful Error Handling**: Try/catch blocks around all Dashboard data fetchers
- **Error Display**: Red error banners with clear messaging for failed data loads

### Technical Details
- Added `evError` state for Events Monitor error handling
- Added `healthError` state for System Health error handling
- Enhanced `loadEvents()` function with proper error handling and user-friendly messages
- Enhanced `fetchHealth()` function with error state management
- Error messages display: "Could not load events. Please try again." and "Could not load health data. Please try again."
- Error banners use consistent red styling: `bg-red-50 border-red-200 text-red-800`
- Maintains existing functionality while adding gentle error recovery
- No schema or navigation changes - purely error handling enhancement

## v2.8.0 - Accessibility Improvements

### Added
- **Skip Link**: Added skip-to-content link for keyboard navigation
- **ARIA Labels**: Added descriptive aria-labels to all interactive buttons
- **Focus Indicators**: Strengthened focus ring visibility for better keyboard navigation
- **Semantic Structure**: Added proper main element ID for skip link targeting

### Technical Details
- Added skip link in layout.tsx with `sr-only focus:not-sr-only` classes for screen reader accessibility
- Added `id="main"` to main dashboard element for skip link targeting
- Added aria-labels to all buttons: "Request approval", "Approve target", "Deny target", "Run forecast demo", "Create replenishment draft", "Refresh events monitor", "Refresh system health", "Refresh audit data"
- Enhanced focus styles with `:focus-visible` selector using blue outline (#2563eb) with 2px offset
- Improved keyboard navigation experience for users with disabilities
- No schema or navigation changes - purely accessibility enhancement

## v2.7.0 - Skeleton Loaders

### Added
- **Skeleton Component**: Reusable skeleton loader with pulse animation for loading states
- **Loading States**: Added skeleton loaders to Audit and Events Monitor sections
- **Perceived Performance**: Improved user experience during data fetching operations
- **Visual Feedback**: Clear indication when data is being loaded

### Technical Details
- Created `src/components/ui/Skeleton.tsx` with Tailwind animate-pulse and gray background
- Added skeleton loading to Events Monitor when `evBusy` is true
- Added skeleton loading to Recent Audit when `loadingAudit` is true
- Skeleton loaders show 3 placeholder rows with consistent height (h-5)
- Maintains existing loading states while adding visual skeleton feedback
- No schema or navigation changes - purely user experience enhancement

## v2.6.0 - Toast Notifications

### Added
- **Toast System**: Lightweight, non-blocking notification system for user feedback
- **Context Provider**: React context-based toast management with automatic cleanup
- **Action Integration**: Wired toasts into all dashboard actions (Approvals, Forecast, Replenishment)
- **Visual Feedback**: Success (green) and error (red) toast notifications with auto-dismiss

### Technical Details
- Created `src/components/ui/ToastHost.tsx` with React context and useToast hook
- Toast notifications appear in top-right corner with 3.5-second auto-dismiss
- Maximum 5 toasts displayed simultaneously with proper stacking
- Integrated into layout.tsx to provide toast context to entire application
- Added toast calls to all action functions: act(), runForecast(), createReplDraft()
- Maintains existing status banners while adding non-blocking toast notifications
- No schema or navigation changes - purely user experience enhancement

## v2.5.0 - UI Primitives & Refactor

### Added
- **UI Primitives**: Created reusable Card, Button, and Badge components for consistent styling
- **Component Library**: Modular UI components with proper TypeScript types and variants
- **Dashboard Refactor**: Refactored all dashboard sections to use new UI primitives
- **Consistent Styling**: Standardized button variants (primary, success, danger, outline)

### Technical Details
- Created `src/components/ui/Card.tsx` with Card, CardHeader, CardTitle, CardContent components
- Created `src/components/ui/Button.tsx` with variant support and proper accessibility
- Created `src/components/ui/Badge.tsx` for consistent badge styling
- Refactored all dashboard sections to use Card components instead of raw sections
- Updated all buttons to use Button component with appropriate variants
- Maintained all existing functionality while improving code organization
- No schema or navigation changes - purely UI component enhancement

## v2.4.0 - Documentation Update

### Added
- **Dashboard UI Features Overview**: Comprehensive documentation of all dashboard widgets and features
- **Developer Reference**: Updated developer docs with complete UI feature list
- **Feature Documentation**: Clear overview of Quick Approvals, Audit tables, Demo widgets, and more

### Technical Details
- Added "Dashboard UI Features" section to `docs/events-approvals.md`
- Documented all dashboard widgets: Quick Approvals, Recent Audit, Forecast Demo, Replenishment Draft Demo
- Listed development tools: Events Monitor, Role Switcher, Notifications banner
- Included user features: User Profile card, Dark Mode toggle
- No schema or navigation changes - purely documentation enhancement

## v2.3.0 - Dark Mode Toggle

### Added
- **Dark Mode Toggle**: Client-side dark mode switch with localStorage persistence
- **Theme Persistence**: Remembers user's theme preference across sessions
- **Instant Toggle**: Immediate theme switching without page reload
- **Visual Feedback**: Clear button to toggle between light and dark modes

### Technical Details
- Added `toggleDark()` function to manage theme state and localStorage
- Integrated theme initialization script in layout.tsx for immediate dark mode on page load
- Added dark mode CSS classes: `body.dark`, `body.dark .bg-white`, `body.dark .border`
- Toggle button placed in User Profile section for easy access
- Uses localStorage to persist theme choice between sessions
- No schema or navigation changes - purely client-side theme enhancement

## v2.2.0 - Dev Notifications Banner

### Added
- **Dev Notifications Banner**: Real-time banner showing the last captured event name and timestamp
- **Event Polling**: Polls `/api/dev-events` every 5 seconds to get the most recent event
- **Visual Feedback**: Indigo banner with white text for clear visibility
- **Development Tool**: Helps developers track event flow and system activity

### Technical Details
- Added `lastEvent` state to track the most recent event information
- Integrated polling logic into existing useEffect hook with 5-second interval
- Banner displays event name and formatted timestamp (e.g., "ForecastRunStarted at 2:30:45 PM")
- Uses existing `/api/dev-events` endpoint with `limit=1&offset=0` parameters
- Banner only appears when events are available (conditional rendering)
- No schema or navigation changes - purely development tooling enhancement

## v2.1.0 - User Profile Dashboard

### Added
- **User Profile Card**: Dashboard widget showing current user role and application version
- **Role Display**: Shows current role from x-role cookie (ANON, FM, ADMIN)
- **Version Display**: Shows current application version for reference
- **Context Information**: Provides user context at the top of the dashboard

### Technical Details
- Added User Profile card at the top of the dashboard for immediate context
- Displays role from existing `getRoleFromCookie()` helper function
- Shows application version from `APP_VERSION` constant
- Consistent card styling matching other dashboard widgets
- No schema or navigation changes - purely informational enhancement

## v2.0.0 - Theme Foundation

### Added
- **Theme Foundation**: Consistent color scheme and styling across the application
- **CSS Variables**: Primary, success, and danger color variables for consistent theming
- **Button Styling**: Standardized button colors with hover states
- **Card Consistency**: Uniform card styling with consistent borders and shadows

### Technical Details
- Added CSS custom properties for primary (#4f46e5), success (#059669), and danger (#dc2626) colors
- Updated all dashboard buttons to use theme variables with hover states
- Applied consistent card styling: `rounded-lg border bg-white p-4 shadow-sm`
- Primary buttons use indigo theme, success buttons use emerald theme, danger buttons use red theme
- No schema or navigation changes - purely visual consistency improvements

## v1.9.0 - System Health Dashboard

### Added
- **System Health Card**: Dashboard widget showing API health status from `/api/health`
- **Health Data Display**: Pretty-printed JSON view of health endpoint response
- **Manual Refresh**: Button to manually refresh health data on demand
- **Error Handling**: Graceful handling of health API failures

### Technical Details
- Added `fetchHealth()` function for calling `/api/health` endpoint
- Health data loaded automatically on dashboard initialization
- JSON formatting with proper indentation and overflow handling
- Error-safe implementation with fallback to null state
- No schema or navigation changes - purely monitoring enhancement

## v1.8.0 - Audit Drilldown Page

### Added
- **Audit Detail Page**: Standalone page at `/audit/{id}` for viewing individual audit entries
- **Full JSON Display**: Complete audit entry details in formatted JSON view
- **Dynamic Routing**: Uses Next.js dynamic route parameters for audit entry IDs
- **Loading State**: Simple loading indicator while fetching audit data

### Technical Details
- Created `src/app/audit/[id]/page.tsx` with dynamic route parameter handling
- Client-side data fetching from existing `/api/audit` endpoint
- Pretty-printed JSON display with proper formatting and overflow handling
- Error-safe implementation with graceful loading and error states
- No schema or navigation changes - purely UI enhancement for audit exploration

## v1.7.0 - Dev Role Switcher

### Added
- **Quick Role Switcher**: Tiny dev-only role switcher on Dashboard for testing RBAC
- **Cookie Management**: Sets `x-role` cookie with 1-year expiration
- **Instant Switching**: Page reloads automatically after role change
- **Three Roles**: ANON, FM, and ADMIN role options for testing

### Technical Details
- Added `setRoleCookie()` helper function for cookie management
- Role switcher integrated into Quick Approvals section header
- Compact button layout with clear role labels
- Automatic page reload ensures immediate RBAC effect
- No schema or navigation changes - purely development tooling enhancement

## v1.6.0 - Dashboard History Widgets

### Added
- **Recent Forecasts Table**: Small dashboard widget showing last 5 completed forecasts
- **Recent Replenishments Table**: Small dashboard widget showing last 5 created drafts
- **Audit API Integration**: Uses existing `/api/audit` endpoint with client-side filtering
- **History Display**: Compact list format with timestamps and summary data

### Technical Details
- Created `fetchAuditByAction()` helper for filtering audit entries by action type
- Client-side filtering ensures compatibility with existing audit API
- Recent Forecasts shows completion timestamps and result summaries
- Recent Replenishments shows creation timestamps, draft IDs, and item counts
- Dashboard now includes seven functional widgets: Quick Approvals, Forecast Demo, Replenishment Draft Demo, Events Monitor, Recent Forecasts, Recent Replenishments, and Recent Audit
- No schema or navigation changes - purely UI enhancements using existing data

## v1.5.0 - Dev Events Monitor Integration

### Added
- **Dev Events Monitor**: In-process ring buffer for capturing and displaying events in development
- **Events Buffer**: 200-event ring buffer with automatic overflow management
- **Read API**: `/api/dev-events` endpoint for accessing captured events with pagination
- **Dashboard Panel**: Real-time Events Monitor card with 2-second polling and manual refresh

### Technical Details
- Created `src/lib/dev-events-buffer.ts` with ring buffer implementation (max 200 events)
- Created `src/lib/listeners/dev-capture.ts` for automatic event capture (dev-only)
- Events Monitor polls `/api/dev-events` every 2 seconds for real-time updates
- Captures all major events: ForecastRunStarted/Completed, ReplenishmentDraftCreated, ApprovalRequested/Granted/Denied
- Dashboard now includes five functional widgets: Quick Approvals, Forecast Demo, Replenishment Draft Demo, Events Monitor, and Recent Audit
- No schema or navigation changes - purely development tooling enhancements

## v1.4.0 - Replenishment Draft Demo Integration

### Added
- **Replenishment Draft Demo Card**: Interactive replenishment draft creation directly on the dashboard
- **Event Integration**: Emits `ReplenishmentDraftCreated` event via in-process events bus
- **Real-Time Feedback**: Success/error messages and loading states for draft creation
- **Audit Integration**: Automatically refreshes Recent Audit table after draft creation

### Technical Details
- Created `/api/replenishment-demo` endpoint with configurable items and delay
- Replenishment demo simulates 0.5-second processing with 3 sample SKUs
- Events are automatically audited and visible in console (development mode)
- Dashboard now includes four functional widgets: Quick Approvals, Forecast Demo, Replenishment Draft Demo, and Recent Audit
- No schema or navigation changes - purely UI and event integration enhancements

## v1.3.0 - Forecast Demo Integration

### Added
- **Forecast Demo Card**: Interactive forecast simulation directly on the dashboard
- **Event Integration**: Emits `ForecastRunStarted` and `ForecastRunCompleted` events via in-process events bus
- **Real-Time Feedback**: Success/error messages and loading states for forecast operations
- **Audit Integration**: Automatically refreshes Recent Audit table after forecast completion

### Technical Details
- Created `/api/forecast-demo` endpoint with configurable delay and parameters
- Forecast demo simulates 1-second processing with 7-day horizon and 5 items
- Events are automatically audited and visible in console (development mode)
- Dashboard now includes three functional widgets: Quick Approvals, Forecast Demo, and Recent Audit
- No schema or navigation changes - purely UI and event integration enhancements

## v1.2.1 - Hotfix: UUID & Hydration Stability

### Fixed
- **Safe UUID Generation**: Replaced direct `crypto.randomUUID()` calls with cross-browser compatible helper
- **Hydration Stability**: Added `suppressHydrationWarning` to body element to prevent SSR/CSR mismatches
- **Browser Compatibility**: UUID generation now works across all browser versions with fallback strategies

### Technical Details
- Created `src/lib/safe-id.ts` with progressive fallback: crypto.randomUUID() → crypto.getRandomValues() → timestamp-based
- Updated all API calls in dashboard and approval components to use safe UUID generation
- Layout hydration warnings suppressed to prevent development overlay errors from browser extensions
- No functional changes - purely stability and compatibility improvements

## v1.2.0 - Dashboard Widgets

### Added
- **Quick Approvals Widget**: Interactive approval management directly on the dashboard
- **Recent Audit Widget**: Live audit data display with refresh functionality
- **Role-Based UI**: Approve/Deny buttons visible only to ADMIN/FM roles
- **Real-Time Feedback**: Success/error messages and loading states for all operations

### Technical Details
- Dashboard now serves as the main landing page with functional widgets
- Quick Approvals widget includes input field and role-aware action buttons
- Recent Audit widget displays latest 10 entries with refresh capability
- All widgets use existing APIs with proper error handling and observability headers
- No schema or navigation changes - purely UI enhancements

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

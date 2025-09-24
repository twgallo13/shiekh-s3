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

# Requirements Document - Sprint 2: Dashboard Web

## Introduction

This document specifies the requirements for a web-based dashboard that visualizes the predictive maintenance system's data. The dashboard provides real-time monitoring of machine fleet status, alerts, system metrics, and intervention history. It consumes data from the existing REST API backend (Sprint 1) and implements basic threshold-based alerting before the AI analysis component (Sprint 3).

## Glossary

- **Dashboard**: The web application interface for monitoring and managing the predictive maintenance system
- **Fleet**: The collection of all monitored machines in the system
- **Alert**: A notification generated when system metrics exceed defined thresholds
- **System_Metrics**: CPU, memory, disk usage, and temperature measurements collected from machines
- **SMART_Data**: Self-Monitoring, Analysis and Reporting Technology data from hard drives
- **Machine**: A monitored computer or server in the fleet
- **Agent**: The Python data collection service running on each machine (Sprint 1)
- **Backend_API**: The REST API service at http://localhost:3000 (Sprint 1)
- **Intervention**: A maintenance action recorded in the system
- **Threshold**: A predefined limit that triggers an alert when exceeded (CPU > 90%, Memory > 90%, Disk > 90%)
- **Real_Time_Update**: Data refresh mechanism that updates the UI without manual page reload
- **Time_Range**: A user-selectable period for viewing historical data

## Requirements

### Requirement 1: Fleet Status Visualization

**User Story:** As a system administrator, I want to view the global status of all machines in the fleet, so that I can quickly assess the overall health of the infrastructure.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE Dashboard SHALL display a list of all machines from the Backend_API
2. WHEN displaying each machine, THE Dashboard SHALL show machine name, IP address, operating system, and current status
3. WHEN a machine has active alerts, THE Dashboard SHALL display a visual indicator (color-coded status badge)
4. THE Dashboard SHALL categorize machines by status: healthy (green), warning (yellow), critical (red), offline (gray)
5. WHEN the user clicks on a machine, THE Dashboard SHALL navigate to a detailed view of that machine's metrics

### Requirement 2: Real-Time Data Updates

**User Story:** As a system administrator, I want the dashboard to automatically refresh with the latest data, so that I can monitor the fleet without manually reloading the page.

#### Acceptance Criteria

1. WHEN the dashboard is active, THE Dashboard SHALL poll the Backend_API for updated data at regular intervals
2. THE Dashboard SHALL refresh machine status data every 30 seconds
3. THE Dashboard SHALL refresh alert data every 15 seconds
4. WHEN new data is received, THE Dashboard SHALL update the UI without disrupting the user's current view
5. WHEN the Backend_API is unreachable, THE Dashboard SHALL display a connection error indicator

### Requirement 3: Alert Display and Management

**User Story:** As a system administrator, I want to see all active alerts and their details, so that I can prioritize and respond to critical issues.

#### Acceptance Criteria

1. THE Dashboard SHALL display a dedicated alerts section showing all active alerts
2. WHEN displaying alerts, THE Dashboard SHALL show alert severity, machine name, metric type, current value, threshold value, and timestamp
3. THE Dashboard SHALL sort alerts by severity (critical first) and then by timestamp (newest first)
4. WHEN an alert is resolved (metric returns below threshold), THE Dashboard SHALL automatically remove it from the active alerts list
5. THE Dashboard SHALL provide a filter to view alerts by severity level (all, critical, warning)
6. THE Dashboard SHALL provide a filter to view alerts by machine

### Requirement 4: Threshold-Based Alert Generation

**User Story:** As a system administrator, I want the system to automatically generate alerts when metrics exceed safe thresholds, so that I can be notified of potential issues before they cause failures.

#### Acceptance Criteria

1. WHEN CPU usage exceeds 90%, THE Dashboard SHALL generate a critical alert
2. WHEN memory usage exceeds 90%, THE Dashboard SHALL generate a critical alert
3. WHEN disk usage exceeds 90%, THE Dashboard SHALL generate a warning alert
4. WHEN SMART_Data status is not "GOOD", THE Dashboard SHALL generate a critical alert
5. WHEN temperature exceeds 80°C, THE Dashboard SHALL generate a warning alert
6. THE Dashboard SHALL evaluate thresholds on each data refresh cycle
7. THE Dashboard SHALL not generate duplicate alerts for the same condition on the same machine

### Requirement 5: System Metrics Visualization

**User Story:** As a system administrator, I want to view current and historical system metrics in graphical format, so that I can identify trends and patterns in machine performance.

#### Acceptance Criteria

1. THE Dashboard SHALL display real-time charts for CPU usage, memory usage, disk usage, and temperature
2. WHEN displaying metrics, THE Dashboard SHALL use appropriate chart types (line charts for time-series data, gauge charts for current values)
3. THE Dashboard SHALL allow users to select a Time_Range for historical data (last hour, last 24 hours, last 7 days, last 30 days)
4. WHEN a Time_Range is selected, THE Dashboard SHALL fetch and display historical data from the Backend_API
5. THE Dashboard SHALL display metrics with appropriate units (percentage for CPU/memory/disk, Celsius for temperature)
6. WHEN hovering over chart data points, THE Dashboard SHALL display exact values and timestamps

### Requirement 6: Machine Detail View

**User Story:** As a system administrator, I want to view detailed information about a specific machine, so that I can investigate issues and monitor individual machine performance.

#### Acceptance Criteria

1. WHEN a machine is selected, THE Dashboard SHALL display a detailed view with all available information
2. THE Dashboard SHALL display current System_Metrics values with visual indicators
3. THE Dashboard SHALL display SMART_Data status and attributes
4. THE Dashboard SHALL display historical metrics charts for the selected machine
5. THE Dashboard SHALL display all alerts associated with the selected machine
6. THE Dashboard SHALL provide a navigation mechanism to return to the fleet overview

### Requirement 7: Intervention History

**User Story:** As a system administrator, I want to view the history of maintenance interventions, so that I can track what actions have been taken on each machine.

#### Acceptance Criteria

1. THE Dashboard SHALL display a list of all recorded interventions
2. WHEN displaying interventions, THE Dashboard SHALL show machine name, intervention type, description, technician name, and timestamp
3. THE Dashboard SHALL allow filtering interventions by machine
4. THE Dashboard SHALL allow filtering interventions by date range
5. THE Dashboard SHALL sort interventions by timestamp (newest first)

### Requirement 8: Authentication and Authorization

**User Story:** As a system administrator, I want the dashboard to require authentication, so that only authorized users can access the monitoring system.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses the Dashboard, THE Dashboard SHALL display a login page
2. WHEN a user submits valid credentials, THE Dashboard SHALL obtain a Bearer token from the Backend_API
3. THE Dashboard SHALL include the Bearer token in all API requests
4. WHEN the token expires, THE Dashboard SHALL redirect the user to the login page
5. THE Dashboard SHALL provide a logout function that clears the authentication token

### Requirement 9: Responsive Design

**User Story:** As a system administrator, I want the dashboard to work on both desktop and tablet devices, so that I can monitor the system from different locations and devices.

#### Acceptance Criteria

1. THE Dashboard SHALL adapt its layout for screen widths from 768px (tablet) to 1920px (desktop)
2. WHEN displayed on a tablet, THE Dashboard SHALL reorganize components into a single-column layout where appropriate
3. THE Dashboard SHALL maintain readability and usability across all supported screen sizes
4. THE Dashboard SHALL use touch-friendly controls with minimum 44px touch targets on tablet devices

### Requirement 10: API Integration

**User Story:** As a developer, I want the dashboard to properly integrate with the existing Backend_API, so that it can retrieve and display all necessary data.

#### Acceptance Criteria

1. THE Dashboard SHALL consume the GET /api/machines endpoint to retrieve machine list
2. THE Dashboard SHALL consume the GET /api/machines/:id endpoint to retrieve machine details
3. THE Dashboard SHALL consume the GET /api/metrics endpoint to retrieve system metrics
4. THE Dashboard SHALL consume the GET /api/metrics/history endpoint with query parameters for historical data
5. THE Dashboard SHALL consume the GET /api/smart endpoint to retrieve SMART data
6. THE Dashboard SHALL handle API errors gracefully and display user-friendly error messages
7. WHEN the Backend_API returns an error, THE Dashboard SHALL log the error and display an appropriate message to the user

### Requirement 11: Performance and Optimization

**User Story:** As a system administrator, I want the dashboard to load quickly and respond smoothly, so that I can efficiently monitor the system without delays.

#### Acceptance Criteria

1. THE Dashboard SHALL load the initial view within 2 seconds on a standard broadband connection
2. THE Dashboard SHALL cache API responses appropriately to minimize redundant requests
3. WHEN displaying large datasets, THE Dashboard SHALL implement pagination or virtualization
4. THE Dashboard SHALL debounce user input for filters and search functions
5. THE Dashboard SHALL lazy-load chart libraries and heavy components

### Requirement 12: User Interface Components

**User Story:** As a system administrator, I want a modern and intuitive user interface, so that I can easily navigate and use the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL use Material-UI or a similar modern React UI framework
2. THE Dashboard SHALL provide a navigation menu with sections: Fleet Overview, Alerts, Metrics, Interventions
3. THE Dashboard SHALL use consistent color coding: green (healthy), yellow (warning), red (critical), gray (offline)
4. THE Dashboard SHALL display loading indicators during data fetches
5. THE Dashboard SHALL provide visual feedback for user interactions (button clicks, form submissions)
6. THE Dashboard SHALL use icons to enhance visual communication and reduce text clutter

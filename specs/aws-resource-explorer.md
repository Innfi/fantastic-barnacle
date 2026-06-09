# AWS Resource Explorer — Feature Spec

## Overview

Web UI feature for listing AWS resources across services/regions, searching/filtering them, and exporting results as CSV or XLSX.

---

## 1. Resource Fetching

### 1.1 Supported Resource Types (MVP)

| Service | Resource |
|---------|----------|
| EC2 | Instances, Security Groups, VPCs, Subnets, EIPs |
| S3 | Buckets |
| RDS | DB Instances, Clusters |
| Lambda | Functions |
| IAM | Users, Roles, Policies |
| EKS | Clusters |
| ELB | Load Balancers (ALB/NLB) |

### 1.2 Data Source

- AWS SDK (via backend service) or AWS Resource Explorer 2.0 API
- Credentials: IAM role assumed by backend (no user-supplied keys)
- Minimum IAM permissions: `ReadOnlyAccess` managed policy

### 1.3 Fetch Behavior

- Fetch triggered on: page load, manual refresh, filter/region change
- Backend paginates all AWS API responses before returning to client
- Response shape per resource:

```ts
interface ResourceItem {
  id: string;           // ARN or service-specific ID
  name: string;         // tag:Name or id fallback
  type: string;         // e.g. "ec2:instance"
  region: string;
  accountId: string;
  status?: string;      // service-dependent
  tags: Record<string, string>;
  createdAt?: string;   // ISO 8601
  raw: Record<string, unknown>; // full API response
}
```

- `raw` excluded from export/table by default; available on row expand
- Cache TTL: 60 seconds (stale-while-revalidate)
- Max resources per response: 10,000 (hard limit; warn user if hit)

### 1.4 Multi-Account / Multi-Region

- Region selector: multi-select dropdown, default = all enabled regions
- Account selector: shown only when AWS Organizations access configured
- Fetches run in parallel per region; merged and deduped by ARN

### 1.5 Error Handling

| Condition | Behavior |
|-----------|----------|
| Missing permission for resource type | Skip type, show warning banner |
| Region unreachable / timeout | Skip region, flag in UI |
| Credential expiry | 401 response → redirect to re-auth |
| Partial failure | Return fetched data, surface errors inline |

---

## 2. Search & Filter

### 2.1 Search Bar

- Full-text search across: `id`, `name`, `type`, `status`, tag keys+values
- Client-side for ≤ 2,000 rows; server-side beyond that
- Debounce: 300 ms
- Highlight matched text in results

### 2.2 Filters

| Filter | Type | Notes |
|--------|------|-------|
| Resource type | Multi-select | Grouped by service |
| Region | Multi-select | |
| Account | Multi-select | Hidden if single account |
| Status | Multi-select | Values dynamic per type |
| Tag key/value | Key-value pair input | Add multiple |
| Created after/before | Date range picker | |

- Filters composable with AND logic
- Active filter count shown on filter panel toggle button
- "Clear all" resets to defaults

### 2.3 Sort

- Sort by: name, type, region, status, createdAt
- Default sort: name ASC
- Server-side sort when > 2,000 rows

### 2.4 Pagination

- Default page size: 50
- Options: 25, 50, 100, 250
- Show total count and current range (`Showing 51–100 of 4,382`)

---

## 3. Export (CSV / XLSX)

### 3.1 Scope

- Exports current filtered + sorted result set (not full unfiltered list)
- Max export rows: 50,000 (reject with user-facing error beyond limit)

### 3.2 Columns Exported

Default columns:

| Column | Source |
|--------|--------|
| ID | `id` |
| Name | `name` |
| Type | `type` |
| Region | `region` |
| Account ID | `accountId` |
| Status | `status` |
| Created At | `createdAt` |
| Tags | flattened as `tag:<key>` columns |

- User can configure included columns before export (checkbox panel)
- Column order matches visible table column order

### 3.3 CSV Format

- Encoding: UTF-8 with BOM (Excel compatibility)
- Delimiter: comma
- Header row: always included
- Filename: `aws-resources-<timestamp>.csv`
- Tags flattened: one column per unique tag key in result set

### 3.4 XLSX Format

- Library: `ExcelJS` (backend) or `SheetJS` (client-side)
- Sheet name: `Resources`
- Header row: bold, frozen
- Auto column width
- No formulas or macros
- Filename: `aws-resources-<timestamp>.xlsx`

### 3.5 Export Flow

```
User clicks Export
  → Select format (CSV / XLSX)
  → (Optional) configure columns
  → Click Confirm
  → Backend generates file from current filtered result
  → File streamed to browser as download
  → Toast: "Export complete — 1,234 rows"
```

- Export button disabled while fetch in progress
- Large exports (> 5,000 rows): show progress indicator
- Export includes data visible to user's IAM permissions only

---

## 4. UI Components

### 4.1 Resource Table

- Virtualized list for performance (react-virtual or ag-grid)
- Columns: resizable, reorderable
- Row click → slide-over panel with full resource detail + raw JSON
- Row checkbox → bulk actions (export selection only)

### 4.2 Toolbar

```
[Search bar              ] [Filters ▼] [Regions ▼] [Refresh] [Export ▼]
```

### 4.3 Status Indicators

- Loading: skeleton rows
- Empty state: "No resources match your filters" with clear-filters CTA
- Error state: inline alert with retry button

---

## 5. Backend API

### `GET /api/resources`

Query params:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `types` | string[] | all | resource type filter |
| `regions` | string[] | all | |
| `accounts` | string[] | all | |
| `status` | string[] | all | |
| `tags` | `key:value`[] | — | |
| `search` | string | — | full-text |
| `sort` | string | `name:asc` | `field:asc\|desc` |
| `page` | int | 1 | |
| `pageSize` | int | 50 | max 250 |

Response:

```json
{
  "data": [ ResourceItem ],
  "total": 4382,
  "page": 1,
  "pageSize": 50,
  "errors": [
    { "region": "ap-southeast-2", "type": "rds:cluster", "message": "..." }
  ]
}
```

### `GET /api/resources/export`

Same query params as above, plus:

| Param | Type | Notes |
|-------|------|-------|
| `format` | `csv` \| `xlsx` | required |
| `columns` | string[] | subset of default columns |

Returns: binary file stream with `Content-Disposition: attachment`

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Initial load (< 1,000 resources) | < 2s |
| Initial load (1,000–10,000 resources) | < 5s |
| Export generation (≤ 10,000 rows) | < 10s |
| UI remains responsive during fetch | scroll/filter unblocked |
| Audit log | all fetches and exports logged with user + timestamp |

---

## 7. Out of Scope (v1)

- Resource modification / deletion from UI
- Cost data / billing integration
- Compliance checks
- Real-time change streaming
- Resource graph / dependency view

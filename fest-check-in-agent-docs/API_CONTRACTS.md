# API and RPC Contracts

These are proposed contracts. Keep frontend types, Edge Function schemas
and database function return types aligned.

## 1. Common rules

-   JSON request/response.
-   Authenticated requests use Supabase session.
-   Validate all fields and reject unknown or malformed critical fields.
-   Use stable machine-readable `status` values.
-   Never return secrets or stack traces.
-   All timestamps returned by server are ISO-8601 UTC.
-   Use a stable `scan_id` for retries.

## 2. `create-ticket` Edge Function

### Request

``` json
{
  "event_id": "uuid"
}
```

### Success

``` json
{
  "success": true,
  "ticket": {
    "id": "uuid",
    "event_id": "uuid",
    "token_version": 1,
    "created_at": "2026-11-06T10:00:00Z"
  },
  "qr_token": "base64url(payload).base64url(signature)"
}
```

### Errors

-   `401 unauthorized`
-   `400 invalid_request`
-   `403 registration_closed`
-   `409 ticket_revoked`
-   `500 internal_error`

The endpoint authenticates the attendee, verifies registration state,
creates or retrieves the attendee's unique ticket and signs a canonical
payload. It must not return private key material.

## 3. `check-in` Edge Function and internal admission function

The authenticated client calls the `check-in` Edge Function with the
signed token, event, gate and stable scan ID. The function validates the
Supabase session and token signature, then calls the internal atomic
database function using its service-role client. It derives the
volunteer ID from the verified session; it must not accept a caller ID
from the request body.

Only `service_role` may execute the internal database function. The
function must verify the volunteer's event/gate assignment, event state,
ticket association and revocation state, and must perform idempotency,
admission and audit writes in one transaction. Revoke execution from
`anon` and `authenticated`; do not expose this function as a
client-callable RPC.

The public Edge Function validates request shape, token size and UUIDs,
and returns generic client-facing errors. Browser signature checks are
only a performance optimization.

### Request

``` json
{
  "token": "base64url(payload).base64url(signature)",
  "event_id": "uuid",
  "gate_id": "uuid",
  "scan_id": "uuid",
  "scanner_id": "installation-id"
}
```

### Success

``` json
{
  "status": "accepted",
  "scan_id": "uuid",
  "ticket_id": "uuid",
  "attendee_name": "Example Student",
  "checked_in_at": "2026-11-06T10:00:00Z"
}
```

### Duplicate

``` json
{
  "status": "already_used",
  "scan_id": "uuid",
  "ticket_id": "uuid"
}
```

### Other statuses

-   `invalid`
-   `wrong_event`
-   `revoked`
-   `unauthorized`
-   `duplicate_scan`

Same `scan_id` must return the original outcome, not create a new
attempt.

## 4. `sync-checkins` Edge Function

### Request

``` json
{
  "event_id": "uuid",
  "gate_id": "uuid",
  "scans": [
    {
      "scan_id": "uuid",
      "token": "signed-ticket-token",
      "local_scanned_at": "2026-11-06T10:00:00Z"
    }
  ]
}
```

### Response

``` json
{
  "processed": 1,
  "results": [
    {
      "scan_id": "uuid",
      "status": "accepted",
      "ticket_id": "uuid",
      "server_checked_in_at": "2026-11-06T10:01:00Z"
    }
  ]
}
```

The function validates the authenticated volunteer's assignment,
validates each token independently, invokes the same restricted
transactional database logic, and returns a result for every item. A
batch-level failure must not cause the client to discard unprocessed
items.

## 5. `revoke-ticket` Edge Function

### Request

``` json
{
  "ticket_id": "uuid"
}
```

An authenticated organizer may revoke a ticket for an event they own.
The function verifies event ownership, sets `revoked_at` once and records
the action in the audit trail. It returns `success` and the revocation
timestamp; unauthorized callers receive a generic `403 forbidden`. The
operation must not expose direct ticket updates to clients.

## 6. Ticket registry endpoint

The implementation may use a paginated authenticated query or Edge
Function.

### Query inputs

-   `event_id`
-   `cursor`
-   bounded `limit`

### Response

-   event ID
-   registry version
-   generated timestamp
-   tickets page
-   next cursor

Only authorized volunteers may download the registry. Use pagination and
avoid exposing unnecessary attendee data.

## 7. Attendance and export

Organizer-only queries: - registration count - successful check-in
count - remaining registered count - gate breakdown - recent scan
attempts - unresolved sync conflicts

CSV export must include only permitted fields and protect against
spreadsheet formula injection.

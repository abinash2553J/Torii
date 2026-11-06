# System Architecture

## 1. Overview

Fest Check-in is a React PWA backed by Supabase. The browser handles
presentation, camera scanning, local signature verification and offline
persistence. Supabase Auth identifies users. PostgreSQL is authoritative
for online admission. Edge Functions perform trusted ticket issuance and
offline batch synchronization.

## 2. Components

### Frontend

-   React + Vite + TypeScript.
-   Tailwind CSS.
-   Router and role-aware route guards.
-   QR decoder / camera adapter.
-   `@noble/ed25519` for portable browser signature verification.
-   IndexedDB for registry and scan queue.
-   Service worker for application-shell caching.

### Supabase

-   Auth: email OTP / magic link.
-   PostgreSQL: users, events, tickets, gates, assignments, check-ins
    and audit attempts.
-   RPC: atomic online check-in.
-   Edge Function: create/sign ticket.
-   Edge Function: synchronize offline scans.
-   RLS: data access enforcement.

### Deployment

-   Frontend: Vercel or equivalent HTTPS static hosting.
-   Backend: Supabase project.
-   Secrets: Supabase Edge Function secrets / secure deployment secret
    store.

## 3. Trust boundaries

1.  Browser input is untrusted.
2.  QR token payload is untrusted until signature verification.
3.  A valid signature proves issuance integrity, not current ticket
    status or presenter identity.
4.  Browser registry is a cached snapshot and may be stale.
5.  Online database transaction is authoritative for admission.
6.  Edge Function private key is trusted and must never be exposed to
    the client.
7.  Client-provided scanner IDs and timestamps are metadata, not proof
    of device identity or authoritative time.

## 4. Online scan flow

1.  Camera decoder returns QR token.
2.  Client parses token using strict size and format limits.
3.  Client may verify the Ed25519 signature as a fast rejection check.
4.  Create a stable `scan_id` and call the authenticated `check-in` Edge
    Function with the signed token.
5.  Edge Function verifies the user session and token signature.
6.  Edge Function invokes the service-role-only atomic database function
    with the verified caller ID and validated ticket claims.
7.  Database function validates assignment, event, ticket and revocation
    state, then writes the check-in and audit outcome transactionally.
8.  Client renders the authoritative result.

Client-side signature verification is optional and is not an
authorization boundary. Clients cannot call the internal admission
function.

## 5. Offline scan flow

1.  Volunteer authenticates and pre-syncs registry.
2.  Registry pages are validated and stored in IndexedDB.
3.  Scanner verifies ticket signature locally.
4.  Scanner checks event ID, token version, cached revocation state and
    local prior scans.
5.  Scanner creates a unique `scan_id` and stores a provisional record
    transactionally in IndexedDB.
6.  UI displays provisional status.
7.  Connectivity returns; sync manager submits pending records.
8.  Server independently verifies the signed token and current ticket
    state.
9.  Server uses `scan_id` for idempotency and `ticket_id` uniqueness for
    admission.
10. Server returns accepted, duplicate, revoked, invalid or conflict
    outcome.
11. Client marks queue record synchronized or conflict.

## 6. Why an internal database function

The Edge Function is required to verify token authenticity before
admission. It calls one short, indexed, transactional database function
that is not executable by browser clients. That function independently
enforces assignment, event state and ticket state.

Measure QR decode time, signature verification time, Edge Function
latency, database execution time and total scan-to-result time.

Do not promise sub-second performance under all network conditions; use
measured p50/p95 results.

## 7. Why Edge Functions remain

Use trusted Edge Functions for: - Ticket creation and signing, because
the private key must remain server-side. - Bulk sync, because it needs
strict per-item validation, reconciliation and structured responses. -
Other operations that require secrets or privileged orchestration.

Never place service-role credentials in the browser.

## 8. Offline limitation

Two fully disconnected devices cannot coordinate. They may both
provisionally accept the same ticket. The server can accept at most one
during reconciliation and mark the other as a conflict.

Optional home-gate assignment can reduce accidental conflicts:
`home_gate = deterministic_hash(event_id || ticket_id) mod gate_count`.
It is a workflow policy only. It does not provide a security guarantee
and should not be used to claim global exactly-once offline admission.

## 9. PWA requirements

-   HTTPS.
-   Web app manifest and icons.
-   Service worker caches application shell and required static assets.
-   Do not cache authenticated API responses indiscriminately.
-   IndexedDB persists registry and queue.
-   Handle storage quota and eviction.
-   Provide a manual sync action.
-   Do not assume Background Sync is available on iOS.
-   Resume synchronization when the app is opened and connectivity is
    available.

## 10. Observability

Record: - Scan outcome. - Event, gate and scanner installation
identifiers. - Server timestamp. - Sync source and conflict reason. -
RPC / sync latency where appropriate.

Avoid logging QR tokens, private keys, access tokens or unnecessary
personal data.

# AGENTS.md --- Instructions for Coding Agents

You are working on **Fest Check-in**, a mobile-first PWA for
registration, signed QR tickets, volunteer check-in and event
attendance.

## 1. Source of truth

Before coding, read:

-   `README.md`
-   `PRD.md`
-   `design.md`
-   `ARCHITECTURE.md`
-   `DATA_MODEL.md`
-   `SECURITY.md`
-   `OFFLINE_AND_SYNC.md`
-   `API_CONTRACTS.md`
-   `TEST_PLAN.md`

When documents conflict, do not guess. Prefer the security and
data-integrity requirements, then raise the conflict and propose a
documented decision. Update `DECISIONS.md` when an architectural
decision is approved.

## 2. Product constraints

-   MVP supports one event at a time.
-   Attendee registration is open while the event is accepting
    registrations.
-   Attendee and volunteer authentication uses Supabase email OTP /
    magic link.
-   Organizer, volunteer and attendee permissions are distinct.
-   Online ticket admission must be atomic at the database.
-   A ticket can have at most one successful check-in per event.
-   `scan_id` makes scan submission idempotent.
-   Rejected attempts and synchronization conflicts belong in
    `scan_attempts`, not `check_ins`.
-   Offline scans are provisional until reconciled by the server.
-   Each scanner must pre-sync the event's ticket registry before
    offline use.
-   The registry is a snapshot; it cannot know about revocations made
    after disconnection.
-   Never claim global exactly-once admission across fully disconnected
    scanners.
-   Do not add payments, messaging integrations, multi-event
    organization, or a venue-local server to the MVP without approval.

## 3. Security rules --- non-negotiable

-   Never expose Supabase service-role credentials or the ticket-signing
    private key in browser code, source control, logs or client-visible
    errors.
-   Only trusted server-side code may sign tickets.
-   The browser may verify signatures for fast rejection, but the
    database must independently verify ticket existence, event
    association, revocation state and volunteer authorization before
    online admission.
-   Never trust client-provided attendee identity, role, gate
    assignment, ticket status or scan timestamp.
-   Use database constraints and transactions for admission correctness;
    frontend checks are not a substitute.
-   Enforce Row Level Security on exposed tables.
-   Restrict RPC execution privileges. Use a fixed `search_path` in
    `SECURITY DEFINER` functions and fully qualify table names.
-   Validate request bodies, UUIDs, event state, token format and
    payload sizes.
-   Use generic client-facing errors; do not return secrets or stack
    traces.
-   Record security-relevant outcomes in an audit trail without storing
    unnecessary personal information.
-   Do not add a service-role key to Vite environment variables.
    Vite-exposed variables are public.

## 4. Engineering practices

-   Use TypeScript strict mode.
-   Prefer small, typed modules and explicit service boundaries.
-   Keep UI components separate from database and cryptographic logic.
-   Centralize QR token parsing, canonical serialization and signature
    verification.
-   Use one canonical token format across issuer and verifier.
-   Make time handling explicit and use server timestamps for
    authoritative online admission.
-   Use migrations for schema changes; do not rely on manual
    dashboard-only schema edits.
-   Add tests with each feature. Never mark a task complete based only
    on a successful manual happy path.
-   Avoid `any`; if unavoidable, explain why and narrow it at the
    boundary.
-   Handle loading, empty, error, offline, stale-registry and
    permission-denied states.
-   Ensure camera tracks stop when the scanner is closed or the page is
    backgrounded.
-   Avoid duplicate camera decode callbacks and concurrent submissions
    for one scan session.
-   Keep accessibility, keyboard navigation and visible focus states in
    scope.

## 5. UI and design rules

Follow `design.md`. Key principles:

-   Editorial cream-and-forest-green visual identity.
-   Attendee and organizer experiences use a light surface.
-   Scanner uses a high-contrast, distraction-free interface.
-   Status must never rely on color alone; include text and an
    icon/label.
-   Large touch targets for volunteers.
-   Do not show a green "confirmed" state for an offline provisional
    admission.
-   Always label offline admission as **PROVISIONAL**.
-   Make registry freshness and pending sync count visible.

## 6. Definition of done

A change is complete only when:

1.  Acceptance criteria are met.
2.  Relevant automated tests pass.
3.  Security and authorization implications are reviewed.
4.  Loading, empty, error and offline states are handled.
5.  Documentation and API contracts are updated if behavior changed.
6.  No secrets or generated build artifacts are committed.
7.  The final response summarizes files changed, tests run and known
    limitations.

## 7. Working method

For each task:

1.  Inspect the existing repository before changing it.
2.  Identify the relevant requirements and dependencies.
3.  State a short implementation plan.
4.  Implement the smallest coherent vertical slice.
5.  Add or update tests.
6.  Run lint, typecheck and relevant tests.
7.  Report failures honestly; do not claim tests passed if they were not
    run.

Do not rewrite unrelated modules or introduce a new framework without
approval.

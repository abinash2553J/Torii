# Architecture Decisions and Open Questions

## 1. Accepted decisions

  -----------------------------------------------------------------------
  ID                      Decision                Rationale
  ----------------------- ----------------------- -----------------------
  D-001                   React + Vite +          Fast PWA development
                          TypeScript              and typed frontend

  D-002                   Supabase                Managed Auth,
                                                  PostgreSQL and Edge
                                                  Functions

  D-003                   Email OTP / magic link  Low-friction
                                                  authentication

  D-004                   Open registration while Simple college-event
                          enabled                 registration

  D-005                   One event at a time for Keep scope manageable
                          MVP                     

  D-006                   Single-device offline   Fits 3--5 week delivery
                          first                   target

  D-007                   Pre-synced ticket       Offline ticket lookup
                          registry                and attendee display

  D-008                   `@noble/ed25519` in     Consistent verification
                          browser                 across supported
                                                  browsers

  D-009                   Postgres atomic         Database enforces
                          admission               online ticket
                                                  uniqueness

  D-010                   Unique ticket ID and    Admission uniqueness
                          scan ID                 and idempotent retries

  D-011                   Separate scan audit     Preserve rejected and
                          table                   conflicting outcomes

  D-012                   Offline results are     Disconnected scanners
                          provisional             cannot coordinate
                                                  globally

  D-013                   Vercel + Supabase       Simple managed
                          deployment              deployment
  -----------------------------------------------------------------------

### Additional accepted decisions (2026-11-06)

-   **D-014:** Online check-in uses an authenticated Edge Function to
    verify the signed token. Only that trusted path can invoke the
    service-role-only atomic database function.
-   **D-015:** Store each pending scan's signed token in IndexedDB with
    the scan and queue entry; retain it until a final server outcome is
    stored.
-   **D-016:** Organizer ticket revocation is in the MVP. Store
    `revoked_at`; do not add ticket reissue to MVP.

## 3. Online check-in trust boundary

The online scanner submits the signed token to an authenticated Edge
Function. The function validates the caller's Supabase session and
verifies the token signature before invoking a database function that
only `service_role` can execute. It passes the caller ID derived from
the verified session, never a client-supplied identity. The database
function checks that caller's event/gate assignment and current ticket
state, then records the result atomically.

The Edge Function is the only public online check-in path. The
service-role-only database function must use a fixed `search_path`,
fully qualify table names, validate all inputs and enforce all admission
constraints itself. Client-side signature verification remains an
optional fast rejection only.

## 4. Other open questions

-   What attendee fields are essential: name only, or name and email?
-   How long should attendee and scan data be retained after the event?
-   Should registration close automatically at event start?
-   What freshness threshold should trigger a stale registry warning?
-   Is home-gate assignment required for the first dry run?
-   What exact iPhone and Android OS versions are in the target test
    fleet?
-   What is the organizer's recovery process if a volunteer loses their
    phone?

## 5. Decision process

When an open question is answered: 1. Record the decision and date. 2.
Update the relevant specification. 3. Update API, schema and tests if
affected. 4. Keep old behavior documented only where needed for
migration context.

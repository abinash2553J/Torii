# Product Requirements Document (PRD)

## Fest Check-in

**Status:** Baseline product specification\
**Target:** 3--5 week MVP\
**Primary platform:** Mobile-first Progressive Web App\
**Initial deployment:** One college event, approximately 50--100
attendees for the first dry run

## 1. Product summary

Fest Check-in is a QR-ticket registration and entry-management
application for college events. Attendees register and receive a unique
signed QR ticket. Volunteers scan tickets at event gates using phone
cameras. Organizers monitor successful admissions, registrations and
scan outcomes.

The system must work reliably online and provide a limited offline
workflow when a scanner loses internet connectivity.

## 2. Problem statement

College event entry is often managed with manual lists or informal
ticket checks. These approaches make it difficult to prevent duplicate
entry, coordinate multiple gates, maintain accurate attendance and
continue checking tickets during network interruptions.

Fest Check-in provides a consistent ticket identity, fast gate workflow,
server-enforced duplicate prevention and offline scan queuing.

## 3. Goals

1.  Allow an attendee to register and receive a unique QR ticket.
2.  Let an authorized volunteer scan a ticket using a phone camera.
3.  Return a clear result quickly, targeting under one second for the
    normal online path under reasonable network conditions.
4.  Ensure that simultaneous online scans of one ticket result in at
    most one successful admission.
5.  Allow a scanner to validate and queue scans offline using a
    pre-synced event registry.
6.  Synchronize queued scans and surface conflicts clearly.
7.  Give organizers attendance counts, scan history and CSV export.

## 4. Non-goals for MVP

-   Payment collection or refunds.
-   WhatsApp, SMS or email delivery integrations beyond authentication
    email.
-   Multi-event organization management.
-   Complex ticket tiers, transfers, resale or waitlists.
-   Venue-local server / LAN coordination.
-   A guarantee of global duplicate prevention across fully disconnected
    devices.
-   Native iOS or Android applications.
-   Facial recognition or biometric identity verification.

## 5. Users and roles

### Attendee

-   Registers for an active event.
-   Views their ticket and QR code.
-   Sees event details and ticket status.

### Volunteer

-   Authenticates with email OTP.
-   Uses an assigned gate.
-   Scans tickets and sees clear outcomes.
-   Pre-syncs the ticket registry.
-   Uses offline mode and resolves sync status.

### Organizer

-   Creates and configures the event.
-   Opens or closes registration.
-   Creates gates and assigns volunteers.
-   Monitors registration and attendance.
-   Reviews invalid scans and offline conflicts.
-   Exports attendance.

An organizer may also act as a volunteer only if explicitly assigned. Do
not infer permissions from the UI.

## 6. MVP user journeys

### 6.1 Registration and ticket issue

1.  Attendee opens the event registration link.
2.  Attendee authenticates using email OTP / magic link.
3.  Attendee confirms registration details.
4.  Backend verifies that registration is open.
5.  Backend creates or returns one ticket per attendee per event.
6.  Backend signs a canonical ticket payload.
7.  Attendee sees a digital ticket with QR code and event details.

### 6.2 Online gate check-in

1.  Volunteer signs in.
2.  Volunteer selects their assigned event and gate.
3.  Scanner requests camera access after a user gesture.
4.  QR is decoded and signature-checked locally.
5.  Client submits the scan to the atomic check-in RPC.
6.  Database validates authorization and ticket state.
7.  One transaction records the first successful check-in.
8.  UI shows accepted, already used, revoked, invalid or unauthorized.

### 6.3 Offline gate check-in

1.  While online, volunteer downloads the event ticket registry.
2.  Scanner stores ticket IDs, attendee names, event IDs, versions and
    revocation state in IndexedDB.
3.  Scanner shows registry timestamp and cached ticket count.
4.  If internet is lost, scanner verifies token signature and checks the
    local registry.
5.  It checks this device's local scan history.
6.  A locally valid scan is stored durably and shown as **PROVISIONAL
    --- NOT YET SYNCED**.
7.  When online returns, queued scans are submitted in batches.
8.  Server reconciles ticket uniqueness and scan idempotency.
9.  Conflicts are surfaced to the organizer and scanner.

## 7. Functional requirements

### FR-01 Authentication

-   Use Supabase email OTP / magic link.
-   Support attendee, volunteer and organizer access.
-   Enforce authorization server-side and through RLS.

### FR-02 Event setup

-   Organizer can create one active event for the MVP.
-   Event has name, description, venue, start/end times and registration
    state.
-   Organizer can create gates and assign volunteers.

### FR-03 Registration

-   Registration is open to users with the event link while enabled.
-   One attendee can have at most one ticket for the event.
-   Registration must be rejected when disabled or outside the
    configured registration window.

### FR-04 Signed ticket

-   Each ticket has an unpredictable UUID.
-   Ticket payload contains ticket ID, event ID, token version and
    issued-at timestamp.
-   Backend signs payload using Ed25519.
-   Private signing key never reaches the browser.
-   Revocation or reissue increments token version or marks the ticket
    revoked.
-   An organizer can revoke a ticket; reissue is not part of the MVP.

### FR-05 Scanner

-   Uses phone rear camera where available.
-   Camera starts only after a user action.
-   Video is inline on iOS (`playsinline`).
-   Camera tracks stop on exit/background as appropriate.
-   Scanner prevents duplicate decode callbacks while one scan is
    processing.

### FR-06 Online admission

-   Client verifies signature before network submission.
-   Database independently verifies ticket state and volunteer
    authorization.
-   Admission is an atomic database operation.
-   A ticket can have at most one successful check-in.
-   Scan submission is idempotent by `scan_id`.
-   Server timestamp is authoritative.

### FR-07 Offline registry

-   Volunteer can download a paginated event ticket registry before
    going offline.
-   Registry includes ticket ID, attendee display name, event ID, token
    version and revocation state.
-   Registry freshness is displayed.
-   Offline validation must not imply knowledge of changes made after
    last sync.

### FR-08 Offline scan queue

-   Offline scans are durably stored in IndexedDB.
-   Store the signed token with each pending scan so retries survive reload.
-   Each scan has a client-generated UUID `scan_id`.
-   Same-device duplicate scans are rejected locally.
-   Offline accepted results are provisional.
-   Queue survives reloads and browser restarts where storage is
    retained.

### FR-09 Synchronization

-   Upload scans in batches.
-   Retries must be idempotent.
-   Server validates each scan and resolves ticket uniqueness.
-   Server records conflicts and returns per-scan outcomes.
-   Client updates local status after response.
-   Failed items remain queued with retryable state; permanent conflicts
    are not retried indefinitely.

### FR-10 Organizer dashboard

-   Show registered count, successful admissions and remaining
    registered attendees.
-   Show recent scan activity and outcomes.
-   Show pending/conflict counts for offline sync.
-   Export successful admissions to CSV.
-   Restrict dashboard data to authorized organizers.

## 8. Non-functional requirements

-   **Performance:** normal online scan path targets under one second
    where network and service conditions permit. Measure client
    verification, RPC latency and total latency separately.
-   **Reliability:** database constraints, not client state, enforce
    online uniqueness.
-   **Compatibility:** current Android Chrome and iOS Safari; test
    installed iOS home-screen PWA separately.
-   **Offline:** core scanner shell and local registry must be available
    after successful pre-sync and caching.
-   **Security:** private key isolation, RLS, least privilege, input
    validation and auditability.
-   **Usability:** volunteer can understand each outcome immediately
    without reading technical details.
-   **Accessibility:** visible text labels, adequate contrast, focus
    states and non-color status indicators.
-   **Privacy:** collect only necessary attendee information and
    restrict exports.

## 9. Acceptance criteria

1.  A valid registered ticket can be issued and displayed.
2.  A modified QR payload fails signature verification.
3.  A ticket for another event is rejected.
4.  A revoked ticket is rejected when revocation state is available to
    the validating path.
5.  Two simultaneous online scans of the same ticket produce exactly one
    successful check-in.
6.  Repeating the same `scan_id` does not create another admission or
    audit event.
7.  A different `scan_id` for an already-used ticket returns
    already-used.
8.  A scanner can pre-sync the registry and display its timestamp.
9.  A valid offline scan is queued and labeled provisional.
10. Reloading the app does not silently discard queued scans.
11. Sync resolves duplicates and exposes conflicts.
12. Camera works on Android Chrome, iOS Safari and installed iOS PWA
    mode.
13. CSV export matches successful check-ins.
14. Dry run covers 50--100 participants and two scanner devices.

## 10. Success metrics

-   Registration completion rate.
-   Median and p95 scan-to-result latency.
-   Successful check-in count versus registered count.
-   Duplicate online admission count (must be zero).
-   Offline queue synchronization completion rate.
-   Number of unresolved sync conflicts.
-   Camera startup success rate by browser.
-   CSV reconciliation accuracy.

## 11. Assumptions and constraints

-   Initial event has approximately 50--100 participants.
-   Volunteers have modern smartphones and can pre-sync before doors
    open.
-   HTTPS is available in production.
-   Internet may be unavailable during the event.
-   The initial offline guarantee is per device, not global across
    disconnected devices.
-   The attendee's displayed name is used for lightweight visual
    confirmation; it is not identity proof.

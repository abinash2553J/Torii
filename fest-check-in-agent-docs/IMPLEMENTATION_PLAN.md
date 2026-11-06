# Implementation Plan and Engineering Backlog

## 1. Delivery target

3--5 weeks. Prefer five weeks because offline sync and cross-browser
camera testing require real-device validation.

## 2. Milestones

### M1 --- Foundation

-   [ ] Create React + Vite + TypeScript app.
-   [ ] Configure Tailwind and component conventions.
-   [ ] Add Supabase client and environment validation.
-   [ ] Configure email OTP.
-   [ ] Add role-aware routing.
-   [ ] Add database migrations and RLS baseline.
-   [ ] Add lint, typecheck and test scripts.

**Exit:** authenticated users and secure baseline database exist.

### M2 --- Event and ticketing

-   [ ] Event setup for one event.
-   [ ] Registration open/close control.
-   [ ] Gate creation and volunteer assignment.
-   [ ] Attendee registration.
-   [ ] Ticket issuance Edge Function.
-   [ ] Ed25519 key management.
-   [ ] Canonical token encoding and versioning.
-   [ ] Ticket QR page.
-   [ ] Organizer ticket revocation using `revoked_at`.
-   [ ] Unit tests and crypto test vectors.

**Exit:** attendee can register and receive a verifiable signed ticket.

### M3 --- Online scanner

-   [ ] Camera permission/start/stop lifecycle.
-   [ ] QR decode.
-   [ ] Browser signature verification.
-   [ ] Atomic check-in implementation.
-   [ ] Authenticated `check-in` Edge Function verifies the token and
    calls a service-role-only atomic database function.
-   [ ] Scan ID idempotency.
-   [ ] Audit attempts.
-   [ ] Accepted/duplicate/invalid/revoked/wrong-event UI.
-   [ ] Concurrent scan integration test.

**Exit:** two online devices cannot admit one ticket twice.

### M4 --- Offline

-   [ ] Service worker and PWA manifest.
-   [ ] IndexedDB schema and versioning.
-   [ ] Paginated pre-sync registry.
-   [ ] Registry freshness display.
-   [ ] Offline local validation.
-   [ ] Durable local queue.
-   [ ] Persist each signed token with its scan until a final sync result
    is stored.
-   [ ] Batch sync Edge Function.
-   [ ] Idempotent reconciliation.
-   [ ] Conflict UI and organizer view.
-   [ ] Reload / airplane-mode tests.

**Exit:** one device scans offline and synchronizes reliably;
cross-device conflicts are visible.

### M5 --- Dashboard and dry run

-   [ ] Organizer overview.
-   [ ] Attendance metrics and gate breakdown.
-   [ ] Scan attempts and conflicts.
-   [ ] CSV export.
-   [ ] Responsive and accessibility QA.
-   [ ] Android Chrome testing.
-   [ ] iOS Safari testing.
-   [ ] Installed iOS PWA testing.
-   [ ] 50--100-person dry run.
-   [ ] Deployment and operational checklist.

**Exit:** MVP is ready for a small real event.

## 3. Recommended implementation order

1.  Database schema, RLS and transaction design.
2.  Ticket signing and verification.
3.  Ticket registration UI.
4.  Atomic online admission.
5.  Scanner camera lifecycle.
6.  Offline registry and queue.
7.  Sync and conflict resolution.
8.  Dashboard and export.

This order validates the core integrity assumptions before spending time
on dashboard polish.

## 4. Issue sizing

Use small vertical-slice issues. Each issue should include: - User or
system outcome. - Relevant requirement IDs. - Dependencies. - Acceptance
criteria. - Tests required. - Security implications.

## 5. Release checklist

-   [ ] Supabase production project configured.
-   [ ] Private key set only in trusted secret store.
-   [ ] Public key configured in frontend.
-   [ ] RLS enabled and tested.
-   [ ] Edge Function secrets verified.
-   [ ] HTTPS deployment verified.
-   [ ] PWA install and cache verified.
-   [ ] Camera tested on target devices.
-   [ ] Registry downloaded before event.
-   [ ] Volunteer gate assignments checked.
-   [ ] Manual sync path tested.
-   [ ] CSV export checked.
-   [ ] Event organizer knows offline limitations.

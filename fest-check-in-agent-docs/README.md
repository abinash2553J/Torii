# Fest Check-in --- Agent Documentation Pack

This documentation pack is the source of truth for planning and
implementing Fest Check-in, a QR-ticket registration and event-entry PWA
for a single college event.

## Read in this order

1.  [`AGENTS.md`](AGENTS.md) --- instructions for coding agents; read
    before changing code.
2.  [`PRD.md`](PRD.md) --- product goals, users, scope, requirements and
    acceptance criteria.
3.  [`design.md`](design.md) --- visual system, interaction patterns and
    screen specifications.
4.  [`ARCHITECTURE.md`](ARCHITECTURE.md) --- system boundaries, runtime
    flows and architectural decisions.
5.  [`DATA_MODEL.md`](DATA_MODEL.md) --- relational schema, constraints,
    RLS and transaction expectations.
6.  [`SECURITY.md`](SECURITY.md) --- threat model, trust boundaries and
    security requirements.
7.  [`OFFLINE_AND_SYNC.md`](OFFLINE_AND_SYNC.md) --- offline registry,
    provisional admission and reconciliation.
8.  [`API_CONTRACTS.md`](API_CONTRACTS.md) --- proposed Edge Function
    and RPC contracts.
9.  [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) --- milestones,
    backlog and dependency order.
10. [`TEST_PLAN.md`](TEST_PLAN.md) --- unit, integration, browser and
    event dry-run tests.
11. [`DECISIONS.md`](DECISIONS.md) --- decisions made and unresolved
    questions.

## Product defaults

-   Frontend: React, Vite, TypeScript, Tailwind CSS.
-   Backend: Supabase Auth, PostgreSQL and Edge Functions.
-   Authentication: email OTP / magic link.
-   Registration: open to anyone with the event link while registration
    is enabled.
-   Product scope: one event at a time for the MVP.
-   Offline scope: single-device offline scanning first, with pre-synced
    ticket registry.
-   QR signatures: Ed25519, with browser verification through
    `@noble/ed25519`.
-   Online admission: authenticated Edge Function verifies the signed
    token, then invokes a service-role-only atomic Postgres function.
-   Ticket issuance, online check-in and bulk offline sync: trusted Edge
    Functions.
-   Deployment: Vercel + Supabase.
-   PWA: installable; scanner must be tested in iOS Safari and installed
    iOS home-screen mode.

## Important engineering truth

A disconnected scanner cannot know whether another disconnected scanner
has accepted the same ticket. Offline acceptance is therefore
**provisional**. The MVP can prevent repeat scans on the same device and
reconcile cross-device conflicts after connectivity returns. A
venue-local coordination server or another shared coordination mechanism
is required for a stronger multi-device offline guarantee.

## Status and change control

These documents describe the intended product and proposed contracts.
They are not evidence that implementation exists. Update documentation
when a decision or contract changes. Do not silently weaken acceptance
criteria to make tests pass.

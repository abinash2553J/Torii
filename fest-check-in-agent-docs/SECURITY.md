# Security Requirements and Threat Model

## 1. Assets to protect

-   Ticket-signing private key.
-   Attendee personal information.
-   Event and volunteer configuration.
-   Admission integrity.
-   Check-in and audit records.
-   Supabase credentials and user sessions.

## 2. Threats and mitigations

  -----------------------------------------------------------------------
  Threat                              Mitigation
  ----------------------------------- -----------------------------------
  Forged QR                           Ed25519 signature verification

  Modified ticket payload             Canonical payload bytes and
                                      signature

  Copied valid QR                     Database uniqueness on ticket ID

  Simultaneous online scans           Atomic transaction and unique
                                      constraint

  Replayed sync request               Unique scan ID and idempotent
                                      processing

  Unauthorized volunteer              Server-side event/gate assignment
                                      check

  Attendee reads another ticket       RLS and owner-scoped query

  Organizer reads another event       Ownership checks and RLS

  Revoked ticket scanned offline      Pre-synced revocation snapshot;
                                      warn that later revocations may be
                                      unknown

  Stolen browser session              Supabase session controls, sign-out
                                      and least privilege

  Malicious QR payload                Strict parser, length limits and no
                                      arbitrary URL navigation

  CSV formula injection               Escape spreadsheet formula-leading
                                      values

  Secret leakage                      Server-only secret storage and log
                                      redaction
  -----------------------------------------------------------------------

## 3. Cryptographic rules

-   Use Ed25519.
-   Generate and store private key only in trusted server secret
    storage.
-   Publish only the public verification key to the client.
-   Define one canonical serialization format. JSON property ordering
    and encoding must not vary between issuer and verifier.
-   Version the token format and signing key identifier so key rotation
    is possible.
-   Verify signature before trusting payload fields.
-   Verify event ID and token version against ticket record / cached
    registry.
-   A signature proves the issuer signed the payload; it does not prove
    ticket is unrevoked or presenter is the attendee.

## 4. Browser verification

Use a maintained portable implementation such as `@noble/ed25519` rather
than depending on inconsistent WebCrypto Ed25519 support across target
iOS versions.

Pin a tested package version in the lockfile. Follow the library's
documented API and test vectors. Do not copy unreviewed cryptographic
code.

## 5. Database authorization

-   RPC validates authenticated user and assignment.
-   Service-role operations remain server-side.
-   RLS enabled on all exposed tables.
-   Public registration only permits intended event registration
    operations.
-   Volunteer cannot change event, gate or attendee identity through
    request parameters.
-   Organizer actions are scoped to owned event.
-   Private signing key is never returned by any endpoint.

## 6. Privacy

-   Collect only attendee fields needed for event operation.
-   Display attendee name to authorized gate volunteers.
-   Avoid exposing email to volunteers unless required.
-   Limit retention of scan attempt details.
-   Protect exports and avoid public attendance lists.
-   Define an event data deletion/retention policy before production
    use.

## 7. Security testing

-   Alter each signed payload field and verify rejection.
-   Test invalid signature and malformed token.
-   Test wrong event and revoked ticket.
-   Test volunteer on unassigned gate.
-   Test attendee access to another attendee's ticket.
-   Test organizer access to another organizer's event.
-   Test simultaneous scans and replayed scan IDs.
-   Inspect frontend bundles for secrets.
-   Verify RLS with direct API calls, not only the UI.

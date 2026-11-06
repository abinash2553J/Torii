# Offline Mode and Synchronization Specification

## 1. Guarantee boundary

MVP offline support guarantees: - The app shell can load after it has
been cached. - A scanner can use a previously downloaded event
registry. - A device can reject repeat scans already stored on that same
device. - Valid local scans are persisted and queued. - The server
reconciles queued scans after connectivity returns.

MVP does **not** guarantee: - Global duplicate prevention across two
fully disconnected scanners. - Awareness of revocations made after the
last registry sync. - Background synchronization on every browser,
especially iOS. - Permanent storage if the user clears site data or the
browser evicts storage.

Every offline acceptance is provisional.

## 2. Registry content

Each scanner downloads a paginated registry containing: - event ID -
ticket ID - attendee display name - token version - revoked state /
revocation timestamp - registry version or generated-at timestamp

Only include fields required for local validation and gate operation.
Protect cached attendee data and clear it on sign-out or when the event
is no longer assigned.

## 3. Registry sync

1.  Authenticate volunteer.
2.  Verify assignment to event and gate.
3.  Request registry metadata/version.
4.  Download pages.
5.  Validate response schema.
6.  Write pages into a staging registry.
7.  Verify completion and expected count/checksum if implemented.
8.  Atomically promote staging registry to active registry.
9.  Store sync timestamp and version.
10. Display cached ticket count and freshness.

Do not replace a known-good registry with a partially downloaded
registry.

## 4. Local scan transaction

For each decoded QR: 1. Parse and verify signature. 2. Match event ID.
3. Look up ticket ID in active registry. 4. Verify token version and
cached revocation state. 5. Check local scan store for ticket ID. 6.
Generate `scan_id`. 7. Persist scan record and queue item in one
IndexedDB transaction, including the exact signed token. 8. Show
provisional state.

If local persistence fails, do not show provisional acceptance. Show an
actionable storage error.

## 5. IndexedDB stores

### `registry_meta`

-   event ID
-   registry version
-   synced at
-   record count
-   schema version

### `cached_tickets`

-   compound key `(event_id, ticket_id)`
-   attendee display name
-   token version
-   revoked state

### `local_scans`

-   `scan_id`
-   ticket ID
-   event ID
-   gate ID
-   scanner installation ID
-   local attempted time
-   signed ticket token, retained until a final server outcome is stored
-   state: pending / syncing / accepted / conflict / rejected

### `sync_queue`

-   `scan_id`
-   reference to the matching `local_scans` record
-   attempt count
-   next retry time
-   last error category

## 6. Sync request behavior

-   Batch records with a bounded batch size.
-   Every item has stable `scan_id`.
-   Server validates signed token and current ticket state.
-   Server checks if scan ID has already been processed.
-   Server attempts admission using ticket uniqueness.
-   Return one outcome per scan.
-   Retrying a batch must not create duplicate admissions or duplicate
    audit outcomes.
-   Do not drop records on timeout; retry with the same scan ID.
-   Keep the token until the matching final outcome is saved locally,
    then clear the token while retaining the outcome record.
-   Use bounded exponential backoff with jitter while the app is active.
-   Provide a manual sync action.

## 7. Conflict outcomes

Possible outcomes: - `accepted`: this scan created the successful
check-in. - `already_used`: ticket was already admitted by another
scan. - `revoked`: current server state says ticket is revoked. -
`invalid`: signature or token invalid. - `wrong_event`: ticket belongs
to another event. - `unauthorized`: scanner is not assigned to
gate/event. - `duplicate_scan`: same scan ID was already processed;
return its original outcome. - `sync_conflict`: reconciliation requires
organizer review under defined business rules.

Keep the original provisional record and final server outcome for
auditability.

## 8. Staleness UX

Always display: - Last registry sync time. - Number of cached tickets. -
Online/offline state. - Pending scan count. - Conflict count.

If registry exceeds the configured freshness threshold, warn the
volunteer before scanning offline. Do not silently imply the cache is
current.

## 9. Home-gate option

Optional mitigation for cross-device offline conflicts: -
Deterministically assign each ticket to one gate based on event ID and
ticket ID. - Scanner checks that the active gate matches the assigned
home gate. - Explain assignment before the event and train volunteers.

This only reduces accidental collisions if all scanners follow the rule.
It is not a cryptographic or globally coordinated guarantee. Keep it out
of the first implementation unless the product owner explicitly
prioritizes it.

## 10. iOS considerations

-   Test Safari and installed home-screen PWA independently.
-   Do not depend on Background Sync.
-   Sync on app open, foreground and manual request when online.
-   Handle IndexedDB transaction errors and quota limits.
-   Do not assume service worker or camera remains active in background.

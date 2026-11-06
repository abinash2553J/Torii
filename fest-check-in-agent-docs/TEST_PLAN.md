# Test Plan

## 1. Test layers

-   Unit: token parsing, canonical serialization, signature
    verification, local registry checks and state reducers.
-   Integration: RPC transaction, uniqueness, RLS, Edge Functions and
    sync batches.
-   End-to-end: registration, ticket display, camera scanning and
    dashboard.
-   Device/browser: Android Chrome, iOS Safari and installed iOS PWA.
-   Dry run: 50--100 test participants and two or more scanner devices.

## 2. Critical security and correctness cases

  -----------------------------------------------------------------------
  ID                      Scenario                Expected
  ----------------------- ----------------------- -----------------------
  T-01                    Valid signed token      Signature passes

  T-02                    Modified payload        Signature fails

  T-03                    Modified signature      Signature fails

  T-04                    Malformed / oversized   Safe rejection
                          token                   

  T-05                    Ticket for another      Wrong-event rejection
                          event                   

  T-06                    Revoked ticket          Revoked rejection

  T-07                    Unassigned volunteer    Unauthorized

  T-08                    Two simultaneous online Exactly one accepted
                          scans                   

  T-09                    Same scan ID retried    Original outcome
                                                  returned

  T-10                    Different scan ID for   Already used
                          used ticket             

  T-11                    Offline repeated scan   Local duplicate
                          on same device          rejection

  T-12                    Offline scan followed   Pending scan persists
                          by reload               

  T-13                    Offline registry is     Warning displayed
                          stale                   

  T-14                    Ticket revoked after    Limitation disclosed;
                          last registry sync      server rejects on sync

  T-15                    Same ticket accepted    One server admission;
                          provisionally on two    other conflict
                          disconnected devices    

  T-16                    Partial sync batch      Unprocessed records
                          failure                 remain queued

  T-17                    CSV cell begins with    Export safely escaped
                          formula character       

  T-18                    Organizer revokes a     Server rejects later
                          ticket                  scans
  -----------------------------------------------------------------------

## 3. Concurrency test

-   Create one valid ticket.
-   Authenticate two volunteers assigned to valid gates.
-   Submit different scan IDs concurrently.
-   Assert one `check_ins` row exists.
-   Assert exactly one accepted outcome and one already-used outcome.
-   Repeat many times to exercise race timing.

Do not test concurrency only by sequentially calling the RPC twice.

## 4. Offline test

1.  Pre-sync registry.
2.  Confirm ticket count and timestamp.
3.  Enable airplane mode.
4.  Scan a valid ticket.
5.  Verify provisional state.
6.  Scan it again on same device and verify local duplicate.
7.  Reload app and verify queue persists.
8.  Restore connectivity.
9.  Sync.
10. Verify server result and local queue state.

## 5. Browser/device matrix

  -----------------------------------------------------------------------
  Platform                Browser / mode          Required checks
  ----------------------- ----------------------- -----------------------
  Android                 Chrome browser          Camera, QR decode,
                                                  online/offline

  Android                 Installed PWA           Camera, reload,
                                                  IndexedDB

  iPhone                  Safari                  Inline video, camera
                                                  permission, scan

  iPhone                  Home-screen PWA         Camera, safe areas,
                                                  IndexedDB, foreground
                                                  sync

  Desktop                 Chrome                  Organizer dashboard and
                                                  ticket admin
  -----------------------------------------------------------------------

Test camera denial, no camera, camera already in use,
background/foreground transitions and switching cameras.

## 6. Performance measurements

Measure: - Camera startup time. - QR decode time. - Signature
verification time. - RPC latency. - Total scan-to-result latency. - p50
and p95 under realistic Wi-Fi/mobile data conditions.

The target is under one second for normal online scans where network
conditions permit. Report actual results rather than asserting a
universal guarantee.

## 7. Dry-run checklist

-   [ ] 50--100 attendee test records created.
-   [ ] Two scanner phones assigned to separate gates.
-   [ ] Volunteers trained on provisional offline status.
-   [ ] Same ticket scanned simultaneously online.
-   [ ] Invalid QR tested.
-   [ ] Wrong-event ticket tested.
-   [ ] Airplane mode enabled and offline scans performed.
-   [ ] Same-device duplicate tested.
-   [ ] Reconnection and batch sync tested.
-   [ ] Cross-device offline conflict demonstrated and explained.
-   [ ] Dashboard totals reconciled.
-   [ ] CSV exported and compared with actual admitted test records.

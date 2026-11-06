# Fest Check-in --- Design System & UX Specification

**Status:** Visual and interaction baseline\
**Design direction:** Editorial, confident, calm, operationally clear\
**Primary reference:** The Fest Check-in brief's cream paper,
forest-green, lime accent and subtle grid aesthetic.

## 1. Design principles

1.  **Fast at the gate:** scanning and result recognition take priority
    over decoration.
2.  **Clear status:** accepted, rejected and provisional states must be
    unmistakable.
3.  **Low cognitive load:** volunteers work under time pressure and may
    be outdoors.
4.  **Trustworthy:** event and attendee details are legible and
    consistent.
5.  **Responsive:** attendee and organizer screens work on mobile;
    organizer dashboard adapts to desktop.
6.  **Accessible:** status is communicated with text, icon and color,
    never color alone.

## 2. Brand direction

The interface should feel like a thoughtfully designed college-festival
tool rather than a generic enterprise admin template.

### Visual character

-   Warm off-white paper-like backgrounds.
-   Deep forest-green primary surfaces.
-   Muted sage and lime highlights.
-   Subtle grid texture used sparingly.
-   Strong sans-serif typography paired with an optional restrained
    editorial serif/italic accent.
-   Thin borders, moderate corner radii and generous spacing.
-   Avoid excessive gradients, glassmorphism, neon colors and ornamental
    animations.

## 3. Design tokens

### Colors

  Token               Hex         Usage
  ------------------- ----------- ---------------------------------
  `--background`      `#F5F4EC`   Main light canvas
  `--surface`         `#FFFFFF`   Cards and panels
  `--surface-muted`   `#EAEDE3`   Secondary surfaces
  `--primary`         `#123D32`   Brand and primary actions
  `--primary-hover`   `#0D3027`   Hover/pressed
  `--accent`          `#C7DC79`   Highlights and selected accents
  `--text`            `#17251F`   Main text
  `--text-muted`      `#66736B`   Supporting text
  `--border`          `#D9DED3`   Dividers and outlines
  `--success`         `#16834A`   Accepted state
  `--success-bg`      `#E5F4E9`   Accepted background
  `--danger`          `#C93636`   Rejected state
  `--danger-bg`       `#FCEAEA`   Rejected background
  `--warning`         `#94620B`   Provisional / warning state
  `--warning-bg`      `#FFF3D6`   Provisional background
  `--scanner-bg`      `#0D211B`   Scanner shell

Do not use the accent lime as small body text on a white background.
Check contrast for every text/background pairing.

### Typography

-   Primary: Inter, Geist Sans or a similar highly legible sans-serif.
-   Editorial accent: a restrained serif italic for occasional hero
    emphasis only.
-   Use tabular numerals for counters and timestamps.
-   Suggested scale: 12, 14, 16, 20, 24, 32, 40, 48 px.
-   Body text: 14--16 px.
-   Scanner result title: 28--36 px, bold.
-   Dashboard metric: 28--40 px.

### Spacing and shape

-   Base spacing unit: 4 px.
-   Common page padding: 24 px desktop, 16--20 px mobile.
-   Card radius: 16 px.
-   Button radius: 10--12 px.
-   Input height: 44--48 px minimum.
-   Touch targets: aim for at least 44 × 44 px.
-   Use borders for structure; reserve shadows for floating layers.

## 4. Application surfaces

### 4.1 Attendee experience --- light theme

Purpose: registration, event details and ticket access.

Layout: - Compact brand header. - Event name, venue and date near top. -
Clear registration form with minimal fields. - Confirmation state after
registration. - Ticket card with attendee name, event name, ticket
reference and prominent QR. - Explain that screenshots or copies of a QR
do not make it reusable.

Ticket card: - High contrast QR on a quiet white area. - Keep a quiet
zone around the QR code. - Do not place decorative artwork over the
QR. - Show a human-readable short ticket reference as fallback support
information. - Show revoked/used status when known from server.

### 4.2 Volunteer scanner --- dark operational theme

Purpose: rapid, reliable gate check-in.

Layout: - Dark forest background. - Header with event, gate and
connection status. - Large camera viewport centered. - Clear scan frame
and concise camera instructions. - Persistent bottom status strip with
registry freshness and pending sync count. - Recent scan result
accessible without obscuring camera.

Scanner controls: - Start camera button before requesting permission. -
Camera switch when multiple cameras are available. - Torch toggle only
when supported. - Manual retry / camera permission guidance. - Stop
camera on leaving scanner.

### 4.3 Result states

#### Accepted --- online

-   Green success surface.
-   Check icon and text: **ENTRY ACCEPTED**.
-   Attendee name and event.
-   Gate and server-confirmed time.
-   Return to scanning automatically after a short, controlled interval
    or explicit action.
-   Do not obscure the result before a volunteer can read it.

#### Already used

-   Red surface.
-   Text: **ALREADY USED**.
-   Show original check-in time/gate only if the volunteer is authorized
    to see it.

#### Invalid ticket

-   Red surface.
-   Text: **INVALID TICKET**.
-   Avoid exposing cryptographic details.

#### Wrong event

-   Red surface.
-   Text: **WRONG EVENT**.

#### Revoked

-   Red surface.
-   Text: **TICKET REVOKED**.

#### Offline provisional

-   Amber surface, never green.
-   Text: **PROVISIONAL --- NOT YET SYNCED**.
-   Show attendee name if registry match exists.
-   Show a persistent offline indicator and queue count.
-   Explain that another disconnected scanner may have accepted the same
    ticket.

#### Sync conflict

-   Red/amber conflict surface.
-   Text: **CONFLICT --- REVIEW REQUIRED**.
-   Do not silently convert a provisional scan into an accepted
    admission.

### 4.4 Organizer dashboard --- light theme

Purpose: operational overview and event control.

Recommended hierarchy: 1. Event header and event status. 2. Metric
cards: registered, checked in, remaining, pending conflicts. 3.
Attendance progress visualization. 4. Recent check-in activity. 5.
Gate-level breakdown. 6. Scan attempts and conflict review. 7. Volunteer
and gate management. 8. CSV export.

Avoid decorative charts that do not help an organizer make a decision.
Include empty states for a new event.

## 5. Navigation and information architecture

### Attendee

-   Event registration
-   My ticket
-   Ticket details

### Volunteer

-   Assigned event/gate
-   Scanner
-   Recent scans
-   Offline registry and sync status

### Organizer

-   Event overview
-   Attendance
-   Scan attempts / conflicts
-   Gates and volunteers
-   Export

Hide navigation items the current role cannot access, but enforce all
permissions on the server.

## 6. Interaction behavior

-   Buttons show disabled/loading states during submissions.
-   Prevent double-submit for registration and scan requests.
-   Scanner must not process the same visible QR repeatedly while a
    request is pending.
-   Use concise toast messages for non-critical events; use a full
    result state for admission decisions.
-   Confirm destructive actions such as revoking a ticket or closing
    registration.
-   Show a clear empty state when there are no registrations or scans.
-   Use skeletons only when they improve perceived loading; do not use
    indefinite spinners.
-   Respect reduced-motion preferences.
-   Provide focus outlines and keyboard-operable controls.

## 7. Responsive behavior

-   Design mobile-first.
-   Attendee registration and ticket pages should fit common phone
    widths without horizontal scrolling.
-   Scanner uses the available viewport and respects safe-area insets.
-   On small screens, keep event/gate and connection state visible
    without shrinking the camera viewport excessively.
-   Organizer tables may become stacked cards on mobile; CSV export
    remains available.
-   Desktop organizer dashboard uses a sidebar or compact top
    navigation.

## 8. Camera and iOS requirements

-   Serve over HTTPS.
-   Request camera permission only after a user gesture.
-   Set video `playsInline` / `playsinline`.
-   Prefer the environment-facing camera where supported.
-   Handle permission denial, no camera, camera already in use and
    unsupported browser.
-   Test in iOS Safari and installed home-screen PWA mode separately.
-   Stop all media tracks when the scanner unmounts or is no longer
    active.
-   Do not assume background camera scanning is supported.

## 9. Accessibility

-   Meet WCAG AA contrast targets where practical.
-   Pair color with icon and explicit status text.
-   Use semantic headings, labels and buttons.
-   Ensure focus order is logical.
-   Announce scan outcomes to assistive technology without repeatedly
    interrupting.
-   Do not rely on sound or vibration as the only feedback.
-   Respect reduced motion and text scaling.

## 10. Design QA checklist

-   [ ] Attendee can identify event and ticket at a glance.
-   [ ] QR is large, sharp and has a quiet zone.
-   [ ] Volunteer can distinguish accepted, rejected and provisional
    states instantly.
-   [ ] Offline state is never styled as confirmed admission.
-   [ ] Registry freshness and pending queue count are visible.
-   [ ] All controls have loading/disabled/error states.
-   [ ] Mobile layouts have no horizontal overflow.
-   [ ] Camera permission and failure states are designed.
-   [ ] iOS safe areas and inline video are handled.
-   [ ] Color contrast and keyboard focus are checked.

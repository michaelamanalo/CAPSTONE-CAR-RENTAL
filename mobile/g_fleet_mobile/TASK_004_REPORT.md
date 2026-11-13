# Task 004 — Vehicle Details UI

Date: November 8, 2026 (Asia/Manila)
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Outcome

Implemented a dedicated customer Vehicle Details screen. Selecting any Task 003
sample vehicle now opens its matching make/model, category, illustrative PHP
daily price, vehicle illustration placeholder, and explicit sample-data notice.
The screen uses the existing Material 3 light/dark themes, typography, spacing,
and button styles. Content scrolls and is constrained to the existing 720-logical-
pixel dashboard maximum width.

Book This Vehicle opens an informational booking-preview dialog. It says booking
will be available in a future task and no booking/reservation has been created.
No bookings, availability queries, reservations, payments, real authentication,
or backend integrations were implemented. Task 005 was not started.

## Inspection and prior work

Verified FLUTTER-FRESH-START before edits and again during verification. No AGENTS.md
or nested AGENTS.md was found. Inspected architecture, route table, themes,
dashboard, sample model/data, and demo lifecycle. Reviewed README and reports
for Tasks 001, 002, 002.1, and 003.

The previous tasks' uncommitted changes were preserved. Task 004 did not change
the sample vehicle dataset/model, demo-session implementation, auth screens,
auth validation, theme implementation, dependencies, or Android configuration.
Existing modified/untracked files from earlier tasks remain in git status and
must not be mistaken for new Task 004 changes.

## Files created and modified

Created:

- `lib/features/vehicles/presentation/vehicle_details_screen.dart`: scrollable
  vehicle details, sample disclaimer, debug-only DEMO chip, booking-preview dialog.
- `lib/features/vehicles/presentation/widgets/vehicle_summary.dart`: extracts the
  existing card summary into one widget shared by cards and Details, including
  vehicle icon, make/model, category, PHP price formatting, and sample labels.
- `test/vehicle_details_test.dart`: fourteen widget tests covering card mapping,
  routing, Back/state, demo lifecycle, booking preview, layouts, invalid arguments.
- `docs/superpowers/plans/2026-11-08-task-004.md`: implementation/verification plan.
- `TASK_004_REPORT.md`: this report.

Modified:

- `lib/app/router/app_router.dart`: adds `/vehicle-details`, validates typed
  arguments, builds Details or a recoverable missing-selection notice.
- `lib/features/home/presentation/home_screen.dart`: handles selection, unfocuses
  the primary focused field, and pushes Details with vehicle/demo display context.
- `lib/features/home/presentation/widgets/vehicle_dashboard.dart`: forwards each
  existing vehicle through a selection callback, preserving local filter state.
- `lib/features/home/presentation/widgets/vehicle_card.dart`: replaces the old
  informational dialog with the selection callback; uses shared VehicleSummary;
  updates the visible affordance to View details.
- `test/home_screen_test.dart`: replaces the obsolete card-selection dialog test
  with card-to-Details navigation and Back-to-dashboard assertions.
- `README.md`: current structure, route/data flow, behavior, test count, limits.

No dependencies added or upgraded. `pubspec.yaml` and `pubspec.lock` are unchanged.
No historical task reports were rewritten.

## Routing and data-passing decisions

Navigation continues to use Flutter Navigator and AppRouter's centralized named
route map. Home pushes `AppRouter.vehicleDetails` (`/vehicle-details`) with the
typed Dart record `({SampleVehicle vehicle, bool isDemo})`.

The vehicle is the exact existing immutable object selected from
`home/data/sample_vehicles.dart`. The dataset is neither duplicated nor moved.
Details consumes that object; it does not look up a default vehicle. All four
card destinations are tested against independent literal model/category/price
expectations. There is no new repository, service, state-management abstraction,
or routing package.

The isDemo field is display context only. Home, the route builder, and Details
apply debug checks. It carries no customer identity, authentication proof,
permissions, token, or session ownership. Missing/null or malformed arguments
show No vehicle selected with Back available, rather than crashing or silently
displaying another vehicle.

## Details content and booking preview

Details shows the existing make/model, temporary category, and whole-peso sample
daily rate, with the same labels and Material icon placeholder as the dashboard.
VehicleSummary keeps illustration and price formatting consistent in both places.
The screen explicitly states that vehicle information/prices are illustrative
and that real availability and booking are not connected.

No approved specifications were found, so seating, fuel, transmission, mileage,
availability, and other unverified fleet information were not added. No external
images, image dependencies, or remote image fetching were introduced.

Book This Vehicle is a prominent full-width FilledButton inside the scrollable
content. Its dialog is scrollable for small screens/large text and has a Got it
action. Dismissal leaves the selected Details screen unchanged. This creates no
booking state, reservation, transaction, backend request, or route into Task 005.

## Dashboard state and demo compatibility

Details is pushed above the existing Home route. Home stays mounted; the original
search controller, selected category, scroll position, selected tab, and demo
session remain owned by the same widgets. Both app-bar Back and Android/system
Back pop Details and restore that state. Tests also verify preserving a selected
Messages tab when Details is pushed programmatically; ordinary card entry remains
from the Home tab.

Before navigation, Home unfocuses `FocusManager.instance.primaryFocus`. The first
implementation unfocused Home's scope; Flutter then restored the search field on
Back and scrolled it into view. Diagnostics showed an offset change from 628 to
256 while the field regained focus. Unfocusing the field itself clears that focus
history and preserves the 628 offset. Both Back tests now cover this regression.
Temporary diagnostic prints were removed.

In demo mode, Details shows a compact DEMO indicator. Name, fictional email, and
Exit Demo remain in Profile only. Returning from Details retains the same active
session object; Profile Exit Demo still clears it and returns to Login. Removing
the whole app while Details is open also clears the session through Home disposal.
Details itself never creates, clears, persists, or authenticates a session.

All existing debug-only entry, constructor, route, and Home display restrictions
are retained. Landing > Continue > Home > Details remains unauthenticated with
no DEMO chip. No guards, redirects, real accounts, or authentication integration.

## Automated verification

| Command/check | Actual result |
| --- | --- |
| `flutter pub get` | Passed: dependencies resolved |
| `dart format lib test` | Passed: final run 24 files, 0 changed |
| `flutter analyze` | Passed: no issues found |
| `flutter test` | Passed: all 56 tests |
| `git diff --check` | Passed: no whitespace errors |
| Independent read-only implementation review | No actionable findings |

The 56 tests comprise 22 auth tests, 3 foundation/theme tests, 7 existing demo
tests, 10 dashboard tests, and 14 new Details tests. This is 14 additional tests
over Task 003's 42-test baseline. Existing Task 001–003 regressions continue to
pass, with only the intentionally superseded card-dialog assertion updated.

New coverage:

- Each of four sample cards opens its correct name, category, and PHP rate.
- Sample labels, disclaimer, placeholder semantics, and unauthenticated display.
- App-bar and system Back preserve query, category, nonzero scroll, and Home tab.
- A programmatically selected non-Home tab is retained when Details is popped.
- Booking preview message/dismissal leaves Details in place.
- 320x568 display, 2x text, both themes: scrolling, reachable booking action,
  reachable dialog dismissal, visible DEMO, and Back without layout exceptions.
- Demo Details preserves the exact session, Profile identity, and exit cleanup.
- App removal from Details clears the original session.
- Null/malformed route arguments show a recoverable notice and return safely.

The layout tests enter the debug demo flow at normal test display settings, then
apply the small-screen/large-text settings on Details. This isolates the new
screen's layout from the pre-existing Login issue noted below. Existing auth
360x640 keyboard tests remain unchanged.

Tests were added first: the focused run against the previous implementation
finished with 9 passing and 15 failing tests because Details/navigation did not
exist. The first implementation run passed 54/56, exposing the focus/scroll
regression above. Both Back tests pass after its fix. A separate stress run that
entered Login at 320x568/2x exposed an existing auth branding-row overflow; Details
itself passed the same settings after entering the demo route normally.
An unused test import was removed following analysis; final analysis is clean.

Pub reports five package versions newer than the existing constraints allow;
no upgrades were made. Git emits LF-to-CRLF conversion warnings, without
whitespace-check failures.

## Known limitations and unresolved issues

- Physical Android 12 testing and profile/release APK verification have not been
  performed by the agent. Automated widget tests do not replace those checks.
- **Existing Login accessibility issue:** at 320 logical pixels wide and 2x text,
  `auth/presentation/widgets/auth_layout.dart:37` has a branding Row overflow
  (96 pixels observed). This predates Task 004; auth files were not changed.
  A later scoped auth accessibility fix should make that row wrap or flex.
- No unresolved Task 004 analysis, layout, or automated-test failures remain.
- Vehicles, categories, and prices remain temporary frontend examples requiring
  approved business data before integration. No verified specifications exist.
- Booking is informational only; availability, payments, and persistence are absent.
- State is retained for the current Home visit, not across app restarts.
- Invalid-argument fallback intentionally displays no vehicle/booking action.

## Scope confirmation

All task edits are inside `mobile/g_fleet_mobile/`. No database records, backend
services, Supabase integration, real authentication, availability logic, booking
operations, payment processing, tracking/maps, notifications, messaging, real
profiles, admin/staff interfaces, or web files were added or modified.

No commits, pushes, merges, or branch changes occurred. Existing work remains
uncommitted on FLUTTER-FRESH-START. Task 005 was not started.

## Android 12 manual verification checklist

From the repository root, connect and authorize the owner's Android device:

```powershell
cd mobile/g_fleet_mobile
flutter run -d 35a01127
```

For another device, substitute its ID from `flutter devices`. If a debug run is
already active, use uppercase `R` in that run's terminal for a hot restart.

1. Landing > Continue: verify the dashboard still opens without DEMO. Confirm
   search, categories, sample prices, and four sample cards remain functional.
2. Open each card and check the matching data: Vios / Sedan / PHP 1,800; City /
   Sedan / PHP 2,000; Innova / MPV / PHP 3,000; Montero Sport / SUV / PHP 3,500
   per day. Check the shared icon placeholder and sample-data disclaimer.
3. Confirm Details contains no seating, transmission, fuel, mileage, real
   availability, or other unverified specifications.
4. Tap Book This Vehicle. Verify the future-task/no-booking message; dismiss
   with Got it. Repeat and dismiss with Android Back: remain on the same Details.
5. Use the app-bar Back button from Details. Confirm it returns to Home. Repeat
   using Android Back, with no duplicate Home or Landing route.
6. Choose Sedan and search ` o `. Scroll to Honda City; open it. Return with
   app-bar Back and verify the exact query, category, scroll, and Home tab remain.
   Repeat with Android Back. Check that the search keyboard does not reopen or
   drag the dashboard back to the search field on return.
7. Change among Bookings/Messages/Profile and Home, confirming selected tabs,
   placeholder notices, filters, and scroll remain intact. Open another vehicle
   and return; the dashboard must still work normally.
8. Return to Landing > Login > Continue as Demo Customer with empty fields.
   Open Details and confirm DEMO remains visible, with no name/email/exit there.
9. Back to Home: DEMO must remain and filtering must still work. Profile must
   still show Alex Demo, customer@example.invalid, and Exit Demo. Exit Demo must
   return to Login and clear demo state. Landing > Continue > Details must have
   no DEMO or identity.
10. Repeat demo Details with Android Back and app-bar Back. Leaving Home afterward
    must still return to Login; another demo visit must start a fresh identity.
11. Repeat Details checks in light and dark themes and enlarged Android text.
    Check long Montero Sport text, PHP rate, disclaimer, scrolling, reachable
    Book This Vehicle and Got it, and DEMO visibility. For the known Login issue,
    enter demo at normal text size before increasing text to 2x on Details.
12. Smoke-test existing Login, Registration, Forgot Password, form errors,
    password toggles, informational valid submissions, and Landing/Back navigation.
13. Optional profile/release verification, stopping the current run first:
    `flutter run --profile -d 35a01127`, then separately
    `flutter run --release -d 35a01127`. Confirm demo entry is absent, while
    Landing > Continue > Details and Back work. These builds were not run by
    the agent.

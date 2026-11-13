# Task 008 — Booking Details

Status: COMPLETE — implementation and automated verification passed.
Date: November 9, 2026 (Asia/Manila)
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Features implemented

Replaced My Bookings' temporary dialog with a dedicated Booking Details screen.
The selected existing local booking is resolved by stable ID and displays:

- Reference and unchanged Local mock status.
- Selected vehicle make/model and temporary sample category.
- Pickup and return date/time and both temporary locations.
- Stored elapsed rental duration, billed days, and estimated PHP total.
- Illustrative daily rental rate from the original immutable sample vehicle.
- Explicit mock-data, non-reservation, non-payment and non-handover disclaimer.
- Schedule-only time remaining until pickup/return, or return-time-passed notice.

Missing/malformed IDs and records cleared while open display Booking Unavailable
with an explanation and safe Back action. Stale fields are removed immediately
on normal store clearing notifications. No booking operations/status changes.

Task 008 only was implemented. Task 009 remains NOT STARTED. Physical Android
testing remains intentionally deferred until Tasks 005–009 are implemented.

## Initial inspection and preserved work

Verified FLUTTER-FRESH-START before edits; no AGENTS.md or nested instructions
were found. Read BATCH_01_PROGRESS.md, original batch requirements, Task 005/006/007
reports, current models/store/scope, list/cards, routes, summaries and tests.
Saved the latest scoped Task 008 brief for interruption recovery.

Existing uncommitted work is preserved. No reimplementation of prior tasks.
BookingStore, BookingScope, LocalBooking/BookingDraft, RentalPricing, form,
confirmation logic, sample vehicle data, demo authentication and Profile remain
unchanged. Prior tasks' files still appear in git status independently of Task 008.

## Files created

- `lib/features/bookings/domain/rental_schedule.dart`: pure schedule phase and
  remaining-duration calculation, without status mutation or Flutter dependency.
- `lib/features/bookings/presentation/booking_details_screen.dart`: ID lookup,
  reactive unavailable state, stored data display, timer and lifecycle management.
- `test/rental_schedule_test.dart`: eight pure calculation/boundary tests.
- `test/booking_details_test.dart`: fifteen Details/summary/navigation/lifecycle tests.
- `docs/TASK_008_REQUIREMENTS.md`: original scoped brief.
- `docs/superpowers/plans/2026-11-09-task-008.md`: scoped implementation plan.
- `TASK_008_REPORT.md`: this report.

## Files modified

- `lib/app/router/app_router.dart`: centralized named `/booking-details` route,
  typed ID/display arguments and safe fallback for invalid arguments.
- `lib/features/bookings/presentation/widgets/booking_card.dart`: replaces the
  informational dialog with ID-based route push and View booking details label.
- `lib/features/bookings/presentation/my_bookings_screen.dart`: forwards the
  existing demo display flag to cards; list ordering/data behavior unchanged.
- `lib/features/home/presentation/home_screen.dart`: passes existing active-demo
  display context into My Bookings; no session ownership or tab changes.
- `lib/features/bookings/presentation/widgets/booking_summary.dart`: optional
  RentalQuote snapshot; original default draft calculation remains for the form.
- `lib/features/bookings/presentation/booking_review_screen.dart`: saved success
  summary now explicitly uses the saved booking quote; confirmation logic unchanged.
- `test/my_bookings_test.dart`: replaces superseded dialog expectations with
  Details/Back/unavailable checks, preserving list/scroll/clearing/layout coverage.
- `README.md`, `BATCH_01_PROGRESS.md`, and the batch plan completion checkbox.

No dependencies, manifest/lockfile, Android configuration or historical reports
were changed. No backend, database or web files were modified.

## Navigation and lookup

BookingCard pushes AppRouter.bookingDetails using the existing named-route map
and `({String bookingId, bool isDemo})` arguments. It passes the ID, not another
booking collection or copied record. The display flag is debug-gated and confers
no identity, authentication, roles or permissions.

Details subscribes to the existing BookingStore and calls findById for current
data on every build. Store notifications refresh the lookup. Unknown IDs, empty
or malformed arguments, and a cleared store show Booking Unavailable without
reference/model/price/schedule fields from the old record. Back to My Bookings
pops the current route; app-bar and Android Back work normally as well.

The existing Home/IndexedStack remains mounted underneath Details. Back returns
to tab 1 with the same booking collection and nonzero list scroll position. No
duplicate Home route or new navigation stack is created. The existing dashboard
query/category/scroll behavior and confirmation result chain are retained.

## Stored pricing

Details passes LocalBooking.quote into BookingSummary. Its elapsed duration,
billed days and total are displayed from the stored snapshot, without invoking
a fresh rental-price calculation. The displayed daily sample rate is the original
vehicle's immutable dailyRatePesos, formatted with the existing formatPesos helper.
The schedule and temporary locations come from the original BookingDraft.

BookingSummary's optional snapshot preserves existing consumers: the form still
uses its original draft-based quote, while confirmed Review success and Details
explicitly use the stored quote. A focused widget test supplies an independent
quote and proves that duration/days/total are not recomputed from the draft.
RentalPricing and all billing assumptions remain unchanged.

## Countdown rules and lifecycle

RentalSchedule.evaluate uses only pickup, returnAt and an explicit now:

| Local time | Phase and indication |
| --- | --- |
| Before pickup | Time remaining until scheduled pickup |
| At pickup, before return | Time remaining until scheduled return |
| At or after return | Scheduled return time has passed |

The helper returns exact nonnegative remaining duration and rejects nonpositive
schedule intervals. UI display rounds a positive fraction of a minute upward and
formats days/hours/minutes. It labels this Schedule only and explicitly says no
collection or return is confirmed. Local mock status is never changed.

A single one-minute Timer belongs to the Details widget. Each tick reads the
device clock again. The timer stops for missing records or a passed return time,
is cancelled when the app is not resumed, and refreshes immediately on resume.
Disposal cancels the timer, removes the store listener and removes the lifecycle
observer. There is no background service, network request or automatic booking
activation/approval/completion behavior.

## Automated verification results

| Command/check | Actual result |
| --- | --- |
| `flutter pub get` | Passed: dependencies resolved |
| `dart format lib test` | Passed: 45 files, final run 0 changed |
| `flutter analyze` | Passed: no issues found |
| Focused schedule/Details suites | Passed: all 23 tests |
| `flutter test` | Passed: all 114 tests |
| `git diff --check` | Passed: no whitespace errors |
| Independent read-only review | No actionable findings |

The previous 91 Task 001–007 tests remain, with obsolete dialog assertions adapted
to the approved Details behavior. Eight schedule tests and fifteen Details tests
bring the total to 114. Tests were added first and initially failed for the absent
schedule API and stored-quote parameter before implementation.

Coverage includes two distinct booking IDs/vehicle selection, every required
field, stored quote override, app-bar/system Back preserving tab/collection/nonzero
scroll, no duplicate Home route, null/wrong-type/unknown IDs, live store clearing,
all schedule phases, exact pickup/return and one-microsecond boundaries, invalid
interval, unchanged Local mock status, app removal/timer disposal, demo return/
Profile exit cleanup, guest no-DEMO behavior, and 320x568/2x text in both themes.

The app-removal test advances a refresh interval, removes the widget tree, then
advances two more minutes without disposed-state errors. Pause/resume cancellation
and timer stopping on a subsequently crossed return boundary were reviewed in
code; those specific lifecycle transitions are not directly time-injected widget
tests. The pure phase/boundary calculations and initially passed-return state are
tested. No device verification is claimed.

One initial analyzer style suggestion was corrected; final analysis is clean.
Pub reports five newer packages outside current constraints; no upgrades were
performed. Git emits LF-to-CRLF warnings without whitespace-check failures.

## Known limitations

- Android 12 and profile/release validation remain deferred/not performed.
- Records are in-memory local examples and disappear at Home visit termination.
- Countdown uses the device clock/local schedule. It refreshes at minute granularity;
  a boundary display may lag by up to one refresh interval while foregrounded.
- No real reservation, vehicle collection/return, staff approval, cancellation,
  payment, tracking, or status transition exists.
- Existing Login 320px/2x branding-row overflow remains documented in Task 004.
  Details layout tests enter demo normally before resizing/enlarging text.
- No unresolved Task 008 analysis or automated-test failures remain.

## Android 12 manual checklist (deferred)

When the owner performs the combined Tasks 005–009 device checks:

```powershell
cd mobile/g_fleet_mobile
flutter run -d 35a01127
```

Substitute the connected device ID if different. Hot restart an existing debug
run with uppercase R to start with empty local state.

1. Create two local mock bookings using different vehicles/schedules. In My
   Bookings, tap each card and verify its corresponding reference and vehicle.
2. Check category, Local mock status, pickup/return dates/times and both sample
   locations. Verify elapsed duration, billed days, sample daily PHP rate and
   stored total match Review and the list. Confirm the mock/non-reservation notice.
3. Scroll through multiple list cards before opening Details. Use app-bar Back,
   then repeat with Android Back. Check same My Bookings tab, records and exact
   scroll position; leaving Home afterward should return to its original entry.
4. Observe time until scheduled pickup. At/after pickup, confirm the indicator
   switches to time until scheduled return; at/after return, it says the scheduled
   time passed. Allow up to one minute for refresh. Status must remain Local mock
   throughout, without collected/activated/returned/approved/payment claims.
5. Background and resume the app while Details is open; confirm the schedule
   refreshes on resume. Leave/reopen Details and check normal Back behavior.
6. Automated tests cover unknown/malformed IDs and clearing while open. If using
   a debugger to clear the local store with endVisit(), verify Booking Unavailable,
   absence of old reference/price/model, and safe return to the empty list.
7. Repeat through Demo Customer Login. DEMO must remain on Details, while identity
   and Exit Demo remain Profile-only. Back, Profile > Exit Demo, and re-entry must
   still clear/isolate all local booking records.
8. Repeat Details and unavailable-state checks in light/dark themes, on a small
   viewport and enlarged text. Scroll to all pricing/schedule fields; check Back
   and unavailable-state action remain reachable and no overflow occurs.
9. Smoke-test prior form validation, Review/Edit, duplicate-safe confirmation,
   My Bookings ordering/empty browse, dashboard filters/scroll, auth controls and
   Landing navigation. No pricing/status or guest/demo behavior should change.

## Task 009 dependencies and stop point

Task 009 remains NOT STARTED. Its eventual Profile implementation must preserve
the existing Profile-only demo identity/Exit Demo and Home-visit booking cleanup.
BookingStore/BookingScope and existing session ownership remain available; no
new account/profile persistence is authorized. Wait for a separate scoped request.
The verified resume checkpoint is BATCH_01_PROGRESS.md.

All task changes stay inside mobile/g_fleet_mobile/. No backend/database
operations, web edits, real reservations/payments, commits, pushes, merges, branch
switches or Task 009 implementation occurred. Prior uncommitted work is intact.

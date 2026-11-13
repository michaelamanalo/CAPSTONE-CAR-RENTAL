# Batch 01 — Tasks 005–009

Status: COMPLETE — implementation and automated verification passed.
Final verification: November 13, 2026 (Asia/Manila).
Branch: FLUTTER-FRESH-START. Scope: mobile/g_fleet_mobile/ only.
Physical Android testing and owner approval remain pending.

## Delivered behavior

| Task | Delivered |
| --- | --- |
| 005 | Local vehicle booking form, date/time/location validation, sample rental estimate |
| 006 | Review/Edit, duplicate-safe in-memory confirmation, stable MOCK reference and success |
| 007 | Reactive newest-first My Bookings, empty browse action and stored-quote cards |
| 008 | ID-based Booking Details, safe unavailable state and schedule-only countdown |
| 009 | Guest/demo Profile, safe existing auth entry, Bookings shortcut and Exit Demo |

Vehicle Details opens the existing form for the selected immutable sample
vehicle. Temporary billing rounds positive elapsed time up to started 24-hour
periods at the sample daily rate, without fees. Future pickup, later return and
both temporary locations are required. Locations are Sample branch A/B, with
no real addresses or availability claims. Review/Edit preserves form selections.

GFleetApp owns one BookingStore ChangeNotifier, exposed above Navigator through
BookingScope. Home starts a visit; ending it or exiting demo clears its records.
App disposal clears the store too. Immutable LocalBooking snapshots retain their
draft and quote. Confirming the same draft object returns its original record;
stable MOCK IDs increment within the app instance. Visit tokens reject stale
writes and prevent older Home disposal from clearing a newer visit. There is no
database/device persistence or customer identity in the store.

Successful confirmation returns through Review → Form → Vehicle Details → the
same Home, selecting Bookings. The list reacts to store notifications and sorts
newest-created first, with stable ID ties. Details passes only ID/display context
through the existing named route, re-reads findById, and drops stale fields when
the record is cleared. Stored pricing is displayed without recalculation.
Back preserves the mounted list/tab/scroll. Countdown indicates time until the
scheduled pickup/return or that return time passed; it never changes Local mock
status or implies actual collection/return. Its timer pauses/resumes/disposes with
the screen and app lifecycle.

Guest Profile has no fictional identity. Login/Register end preview Home and
clear its records before opening existing auth routes, avoiding nested Home
owners. Register keeps Login below it. Demo Profile alone shows Alex Demo,
customer@example.invalid and Exit Demo; exiting clears identity/bookings and
returns Login. All existing debug gates remain. My Bookings switches tabs without
duplicating routes or losing catalog state. Settings/support are unavailable.
AuthLayout's brand text uses Flexible to correct the earlier 320px/2x overflow.

## Files delivered

Created product files (relative to lib/):

- core/utils/format_pesos.dart.
- features/bookings/domain/{booking_draft,rental_pricing,local_booking,rental_schedule}.dart.
- features/bookings/data/booking_store.dart.
- features/bookings/presentation/{booking_scope,booking_form_screen,
  booking_review_screen,my_bookings_screen,booking_details_screen}.dart.
- features/bookings/presentation/widgets/{booking_page,booking_summary,booking_card}.dart.
- features/profile/presentation/customer_profile_screen.dart.

Modified existing product files: lib/app/app.dart, lib/app/router/app_router.dart,
lib/features/home/presentation/home_screen.dart,
lib/features/vehicles/presentation/vehicle_details_screen.dart, and
lib/features/auth/presentation/widgets/auth_layout.dart.

Created tests: test/{rental_pricing,booking_form,booking_store,booking_review,
my_bookings,rental_schedule,booking_details,customer_profile}_test.dart.
Updated existing test/home_screen_test.dart and test/vehicle_details_test.dart
for approved behavior/formatting. Earlier task changes remain uncommitted and
preserved; the complete repository status also includes pre-batch files.

Documentation: README.md, BATCH_01_PROGRESS.md, BATCH_01_REPORT.md,
TASK_005_REPORT.md through TASK_009_REPORT.md, saved requirements under docs/,
and scoped implementation plans under docs/superpowers/plans/. Individual reports
provide the per-task file inventory and verification history. Historical reports
remain as written at their respective checkpoints.

## Actual verification

| Check | Final result |
| --- | --- |
| flutter pub get | Passed |
| dart format lib test | Passed: 47 files, 0 changed |
| flutter analyze | Passed: no issues found |
| flutter test test/customer_profile_test.dart | Passed: 18 tests |
| flutter test | Passed: all 132 tests |
| git diff --check | Passed |
| Final independent read-only Task 009 review | No actionable findings |

Saved full-suite checkpoints: Task 005: 65; 006: 80; 007: 91; 008: 114;
009: 132. Final full tests cover all prior regressions. New tests span pricing
boundaries, form validation/Edit, duplicate confirmation and navigation, stable
IDs/notifications, cleanup/stale visits, list sorting/browse/state retention,
Details lookup/unavailable states/stored quotes, schedule boundaries/timer disposal,
guest/demo auth navigation, Profile-only identity and narrow/large-text layouts.
Five newer packages were reported outside constraints; no upgrades. LF-to-CRLF
warnings did not fail whitespace checks. No unresolved automated failures remain.

## Known limits

Android 12 device testing and profile/release builds remain pending. Widget tests
run in debug; non-debug demo gates were inspected, not device-validated. Schedule
countdown uses device time, refreshes each minute, and may lag a boundary by that
interval. Pause/resume and subsequently crossed return-boundary timer transitions
were inspected but are not directly time-injected widget tests. Records/IDs are
local examples, lost when a visit/app ends, not production reservation references.
All billing/categories/locations/status remain temporary frontend assumptions.
No cancellation, payments, approvals, real authentication or booking operations.

## Combined Android 12 checklist — pending owner execution

From the repository root, with the device authorized:

```powershell
cd mobile/g_fleet_mobile
flutter devices
flutter run -d 35a01127
```

Substitute the connected device ID. Hot restart an existing debug run with R for
fresh state. Record device/build, theme/text size and any failed step.

1. Landing → Continue: check guest dashboard without DEMO. Exercise search,
   categories and scrolling; open the correct Vehicle Details and use both Back
   methods. Verify filters/scroll survive and only approved sample fields appear.
2. Book This Vehicle: reject missing dates/times/locations, past pickup and return
   before/equal pickup. Select future pickup and later return plus both branches.
   Verify estimate at 24 hours and just over 24 hours: one and two billed days.
3. Review every vehicle/schedule/location/duration/rate/total and mock disclaimer.
   Edit and unconfirmed Back must retain inputs without saving. Change a selection
   and review again; confirm the changed information.
4. Confirm rapidly: expect one success reference, Local mock and no actual
   reservation/payment claim. View My Bookings and both success Back methods must
   reach the same Home Bookings tab without pending forms or duplicate Home.
5. Create multiple examples: verify distinct stable references, newest-first list,
   stored estimates and scrolling. Empty My Bookings must offer Browse Sample
   Vehicles; that and Profile's shortcut switch tabs without losing catalog state.
6. Open different booking cards: verify matching IDs, vehicles, schedules,
   locations, stored duration/days/total and sample rate. Scroll list first, then
   check app-bar/Android Back preserve its exact position and selected tab.
7. Observe countdown before pickup, during schedule and after return (allow one
   minute refresh). Local mock must never change or imply collection/return.
   Background/resume and reopen Details: refresh and Back must remain safe.
   Automated tests cover malformed IDs/clear-while-open; optionally clear store
   with a debugger and verify unavailable state contains no stale record fields.
8. Guest Profile: verify avatar, unauthenticated explanation, no identity/DEMO,
   Login/Register, Bookings shortcut and unavailable settings/support. Login Back
   returns Landing; Register Back returns Login then Landing. Re-enter preview:
   old bookings must be gone. Auth submissions remain informational.
9. From guest Profile Login, enter Demo Customer without credentials: only one
   Home should exist. Create records. DEMO stays visible on customer screens;
   Alex Demo/email/Exit appear only in Profile. Exit returns Login; re-enter demo
   and confirm empty bookings/fresh session. Rapid Exit must not pop past Login.
10. Leave guest/demo Home using app-bar Back and Android Back; re-entry must be
    empty. Smoke-test Registration/Forgot Password validation and visibility,
    dashboard/card behavior, Review/Edit and all bottom destinations.
11. Repeat relevant steps in light/dark modes, enlarged Android text and small
    viewport, with keyboard open. Scroll to every form/Profile action. Check
    branding wraps without overflow, readable estimates and reachable Back/Exit.
12. Optional, stopping debug first: run flutter run --profile -d 35a01127 and then
    flutter run --release -d 35a01127. Demo entry/identity must be absent; Landing
    preview and guest Profile/auth routes must remain usable. These builds have
    not been performed by the agent.

## Scope confirmation and stop

All task edits are within mobile/g_fleet_mobile/. No backend/database operations,
web changes, Supabase/Firebase integration, real reservations/payments, external
images, new dependencies or device persistence occurred. Existing uncommitted
work is intact. No commits, pushes, merges or branch switches occurred. Tasks
005–009 are complete for automated verification; Task 010 was not started.
Stop for owner review and physical Android testing.

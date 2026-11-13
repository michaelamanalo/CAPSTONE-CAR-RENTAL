# Task 005 — Booking Form

Status: COMPLETE — implementation and relevant tests passed.
Date: November 8, 2026 (Asia/Manila)
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Implementation

Vehicle Details now opens a local booking form for the selected existing sample
vehicle. The form includes vehicle summary, separate pickup/return date and time
pickers, explicitly temporary pickup/return location selections, elapsed duration,
billed days, estimated PHP total, validation, and Continue to Review.

No approved billing/location rules were found. Temporary billing rounds positive
elapsed time up to started 24-hour periods at the existing sample daily rate,
with no taxes, deposits, discounts, or other fees. Pickup must be in the future;
return must follow pickup. Dates/times and both temporary locations are required.
Locations are Sample branch A and Sample branch B, without real addresses.
The date-picker UI supports today through December 31 five years ahead; this is
a temporary picker range, not an approved rental-policy limit.

## Files created

- lib/core/utils/format_pesos.dart
- lib/features/bookings/domain/rental_pricing.dart
- lib/features/bookings/domain/booking_draft.dart
- lib/features/bookings/presentation/booking_form_screen.dart
- lib/features/bookings/presentation/widgets/booking_page.dart
- lib/features/bookings/presentation/widgets/booking_summary.dart
- test/rental_pricing_test.dart
- test/booking_form_test.dart
- docs/BATCH_01_REQUIREMENTS.md (original batch brief)
- docs/superpowers/plans/2026-11-08-batch-01.md
- BATCH_01_PROGRESS.md
- TASK_005_REPORT.md

## Files modified

- lib/app/router/app_router.dart: booking-form and booking-review routes with
  typed argument validation/fallback notices.
- lib/features/vehicles/presentation/vehicle_details_screen.dart: Book This Vehicle
  now opens the form instead of the superseded informational dialog.
- test/vehicle_details_test.dart: updates only superseded booking-dialog checks
  to cover form navigation/Back and reachable controls at enlarged text.

## Verification

- Tests were written first and failed for missing pricing API/form navigation.
- Focused `flutter test test/rental_pricing_test.dart test/booking_form_test.dart`:
  passed all 9 tests (6 pricing tests and 3 form tests).
- `flutter test`: passed all 65 tests after adapting obsolete dialog assertions.
- `dart format lib test`: completed successfully during this task.
- Full batch pub get/analyze/final format/diff checks remain pending.

Pricing tests cover partial-day, exact-day, over-day, and two-day boundaries,
invalid duration/rate, and invalid schedules. Widget tests cover selected-vehicle
entry, missing-input validation, estimate, and form state retained after Back.
The prior Task 001–004 regression suite continues passing.

## Dependencies and remaining work

Task 006 is NOT STARTED. Booking Review is currently an explicit placeholder
stating that local review will be added in Task 006. Returning from it preserves
the form. No booking records/store or confirmation has been implemented yet.
This placeholder is an intermediate batch checkpoint, not the completed batch.
Tasks 007–009 are NOT STARTED. See BATCH_01_PROGRESS.md for exact resume steps.

No dependencies, backend/database operations, web changes, commits, pushes,
merges, or branch switches. No physical Android testing was performed.
Existing Login overflow at 320px/2x text remains documented in Task 004.

## Android manual checks (pending)

Run `flutter run -d 35a01127` from mobile/g_fleet_mobile/.
Open a vehicle, tap Book This Vehicle, submit empty inputs, then choose future
pickup and later return date/time and both sample locations. Check temporary
billing and estimate. Continue to the interim Review placeholder and Back;
verify selections/estimate remain. Back again returns to the same vehicle and
dashboard. Repeat in demo mode (DEMO on form), light/dark mode, and enlarged text.

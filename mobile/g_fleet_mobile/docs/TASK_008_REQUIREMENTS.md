# G-FLEET — TASK 008: BOOKING DETAILS

Project: G-FLEET Car Rental Management System
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Objective

Implement Task 008 — Booking Details.

Replace the temporary informational dialog in My Bookings with a dedicated Booking Details screen displaying information about the selected local mock booking.

Tasks 005, 006, and 007 are already implemented and automated-test verified.

Implement Task 008 only.

Physical Android testing will be performed after Tasks 005–009 are implemented.

## 1. Initial Inspection

Before modifying code:

1. Read AGENTS.md and applicable nested instructions, if present.
2. Verify the current branch is FLUTTER-FRESH-START. Stop if different.
3. Read BATCH_01_PROGRESS.md and docs/BATCH_01_REQUIREMENTS.md.
4. Read TASK_005_REPORT.md, TASK_006_REPORT.md, and TASK_007_REPORT.md.
5. Inspect the current booking models, BookingStore, BookingScope, My Bookings screen, booking cards, navigation routes, and existing tests.
6. Preserve all uncommitted work and existing functionality.

Do not reimplement previous tasks.

## 2. Dedicated Booking Details Screen

Implement a dedicated Booking Details screen.

Display:

- Booking reference.
- Selected vehicle make, model, and category.
- Booking status: Local mock.
- Pickup date and time.
- Return date and time.
- Pickup location.
- Return location.
- Elapsed rental duration.
- Billed rental days.
- Illustrative daily rental rate.
- Estimated total rental cost.
- Explicit mock-data and non-reservation disclaimer.

Reuse the existing LocalBooking, BookingDraft, and pricing quote.

Do not recalculate or alter stored booking pricing.

## 3. Navigation

When a customer taps a booking card in My Bookings:

1. Open the Booking Details screen for that booking.
2. Use its stable local booking ID for lookup.
3. Display the correct record even when multiple bookings exist.
4. Support app-bar Back and Android system Back.
5. Return to the same My Bookings tab.
6. Preserve the booking list and scroll position.
7. Do not create duplicate Home routes.

Replace the Task 007 temporary informational dialog.

Use the existing named-route architecture where appropriate.

## 4. Missing or Cleared Booking Handling

Booking records exist only in memory.

If the requested booking ID is missing or the booking store is cleared while Booking Details is open:

- Display a clear Booking Unavailable state.
- Explain that the local mock booking is no longer available.
- Provide safe navigation back.
- Do not crash.
- Do not display stale booking information.

Use the existing BookingStore.findById lookup.

## 5. Rental Schedule Countdown

Implement a countdown or schedule indicator only when meaningful.

Requirements:

- Derive it exclusively from the locally selected pickup and return times.
- Before pickup: show time remaining until the scheduled pickup.
- Between pickup and return: show time remaining until scheduled return, clearly labeled as schedule-based only.
- After return: show that the scheduled return time has passed.
- Never imply the vehicle was actually collected, activated, returned, or approved.
- Do not automatically change the booking's Local mock status.

Prefer a lightweight, testable countdown calculation.

If a periodic UI refresh is used, manage timers correctly and dispose of them when the screen closes.

Avoid unnecessary background processing.

## 6. Design and UX

Follow the existing G-FLEET Material 3 styling.

Use:

- Consistent typography and spacing.
- Clear booking reference and status.
- Readable date/time formatting.
- Clear pricing breakdown.
- Responsive and scrollable layout.
- Light/dark mode compatibility.
- Accessible controls.
- Explicit sample-data disclaimers.

Do not introduce unrelated redesigns.

## 7. Architecture

Reuse existing:

- BookingStore
- BookingScope
- LocalBooking
- BookingDraft
- RentalPricing
- BookingSummary
- Existing formatting helpers
- Existing app router

Keep schedule countdown calculations separate from presentation when practical.

Do not introduce a second booking store or unnecessary dependencies.

## 8. Testing

Add focused automated tests for:

1. Correct booking selected by ID.
2. Booking reference.
3. Vehicle information.
4. Pickup and return schedule.
5. Locations.
6. Rental duration and billed days.
7. Estimated price.
8. Local mock status and disclaimer.
9. Navigation from My Bookings.
10. App-bar and Android Back behavior.
11. Missing booking ID.
12. Booking removed while details are open.
13. Countdown before pickup.
14. Countdown during scheduled rental.
15. Countdown after return.
16. Countdown boundary conditions.
17. Light/dark themes and small-screen accessibility.
18. Existing Task 001–007 regressions.

Run:

flutter pub get
dart format lib test
flutter analyze
flutter test
git diff --check

Report actual results.

## 9. Documentation

Create TASK_008_REPORT.md.

Update BATCH_01_PROGRESS.md:

- Task 005 — COMPLETE
- Task 006 — COMPLETE
- Task 007 — COMPLETE
- Task 008 — COMPLETE only after automated verification passes
- Task 009 — NOT STARTED

Update README.md where necessary.

The report must include:

- Features implemented.
- Files created and modified.
- Navigation behavior.
- Booking lookup and missing-record handling.
- Countdown calculation rules.
- Test counts and actual results.
- Known limitations.
- Android 12 manual testing checklist.
- Task 009 dependencies.
- Confirmation that no backend/database operations occurred.
- Confirmation that no web files changed.

## 10. Interruption Recovery

Maintain BATCH_01_PROGRESS.md throughout implementation.

If execution is interrupted:

1. Preserve completed code.
2. Update the progress checkpoint.
3. Record completed and incomplete work.
4. Record actual test results.
5. Provide exact resume instructions.
6. Do not mark Task 008 complete unless its implementation and tests pass.

If execution stops unexpectedly, the saved checkpoint must support resuming without reimplementing verified work.

## 11. Restrictions

Do not:

- Implement Task 009.
- Modify backend or web files.
- Perform database operations.
- Integrate Supabase or Firebase.
- Implement real booking approval, activation, payment, cancellation, or tracking.
- Change pricing rules.
- Add unnecessary dependencies.
- Discard uncommitted work.
- Commit, push, merge, or switch branches.

## Final Instructions

Complete Task 008 only.

Run automated verification and create TASK_008_REPORT.md.

Do not begin Task 009.

Physical Android testing remains deferred until Tasks 005–009 are implemented.

Return the implementation report for review.
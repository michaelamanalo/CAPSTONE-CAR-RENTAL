# G-FLEET — TASK 007: MY BOOKINGS

Project: G-FLEET Car Rental Management System
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Objective

Implement Task 007 — My Bookings.

Replace the existing Bookings tab placeholder with a functional customer booking list connected to the in-memory BookingStore created in Task 006.

Task 005 and Task 006 are already implemented and have passed their automated tests.

Implement Task 007 only. Do not implement Tasks 008 or 009.

Physical Android testing for Tasks 005–009 will be performed together after implementation of all five tasks.

## 1. Initial Inspection

Before modifying code:

1. Read AGENTS.md and applicable nested instructions, if present.
2. Verify the current branch is FLUTTER-FRESH-START. Stop if different.
3. Read BATCH_01_PROGRESS.md.
4. Read docs/BATCH_01_REQUIREMENTS.md.
5. Read TASK_005_REPORT.md and TASK_006_REPORT.md.
6. Inspect the existing Home screen, bottom navigation, booking models, BookingStore, BookingScope, and confirmation navigation.
7. Inspect existing tests and uncommitted changes.
8. Preserve existing architecture and functionality.

Do not reimplement Tasks 005 or 006.

## 2. My Bookings Screen

Replace the Bookings tab placeholder with a functional booking list.

Display locally confirmed mock bookings from the existing BookingStore.

Each booking card should display:

- Booking reference, such as MOCK-000001.
- Vehicle make and model.
- Pickup date and time.
- Return date and time.
- Estimated rental cost.
- Booking status: Local mock.
- Clear indication that the booking is not a real reservation.

Use the existing booking model and pricing quote.

Do not duplicate booking data or introduce a separate booking collection.

## 3. Empty State

When no bookings exist, display a clear empty state.

Include:

- Appropriate icon.
- "No bookings yet" heading.
- Brief explanation.
- An action to browse available sample vehicles.

The browse action should switch to the existing Home tab without creating a new Home route.

Do not seed fake reservations automatically.

## 4. Booking List Behavior

Requirements:

1. Newly confirmed mock bookings must appear immediately.
2. The list must respond to BookingStore ChangeNotifier updates.
3. Display the most recently created booking first.
4. Use stable booking IDs as widget keys where appropriate.
5. Support scrolling through multiple bookings.
6. Preserve the existing bottom navigation.
7. Preserve the Home dashboard's search, category, and scroll state.
8. Handle booking-store clearing without displaying stale records.

Do not introduce unnecessary state-management dependencies.

## 5. Booking Selection

Booking cards should be visibly interactive.

Task 008 will implement the dedicated Booking Details screen.

For Task 007, tapping a booking should display a temporary informational dialog containing the selected booking reference and explaining that detailed booking information will be available in Task 008.

Do not build the Booking Details route yet.

Do not implement booking cancellation, editing, payment, or status changes.

## 6. Booking Status

Use the existing Local mock status.

Do not invent approval, activation, completion, cancellation, or payment statuses.

If the interface includes a status filter, it must only use statuses actually supported by the existing booking model.

Prefer omitting status filters until real booking statuses are implemented.

## 7. Demo and Guest Compatibility

Preserve the existing demo customer functionality.

Requirements:

- Demo login remains debug-only.
- DEMO indicator remains visible where previously established.
- Demo identity remains Profile-only.
- Exit Demo clears the local booking records.
- Guest preview must not display a fictional authenticated customer.
- Mock bookings must not survive Home visit termination.
- Re-entering Home must begin with an empty booking list.

Do not modify real authentication behavior.

## 8. Design and Accessibility

Follow the established G-FLEET Material 3 theme.

Support:

- Light and dark modes.
- Small Android displays.
- Larger accessibility text.
- Scrollable booking cards.
- Readable dates and prices.
- Consistent spacing.
- Clear empty states.
- Accessible buttons and touch targets.

Avoid unnecessary visual complexity.

## 9. Architecture

Use the existing feature-first structure.

Reuse:

- LocalBooking
- BookingStore
- BookingScope
- Existing peso formatting utilities
- Existing theme tokens
- Existing Home navigation shell

Keep the booking list presentation separate from booking-store logic.

Do not create a new repository, backend service, or persistence layer.

## 10. Testing

Add meaningful automated tests covering:

1. Empty booking list.
2. Browse Vehicles action.
3. Correct booking reference and vehicle details.
4. Correct pickup/return schedule.
5. Correct estimated price.
6. Local mock status.
7. Multiple bookings displayed newest first.
8. Immediate UI updates after confirmation.
9. Booking card informational dialog.
10. Booking-store clearing.
11. Demo exit and re-entry isolation.
12. Guest preview compatibility.
13. Light/dark themes and small-screen layouts.
14. Existing Task 001–006 regression behavior.

Run:

flutter pub get
dart format lib test
flutter analyze
flutter test
git diff --check

Report actual results.

## 11. Documentation

Create TASK_007_REPORT.md.

Update BATCH_01_PROGRESS.md:

- Task 005 — COMPLETE
- Task 006 — COMPLETE (automated verification; Android testing pending)
- Task 007 — COMPLETE only after implementation and automated tests pass
- Task 008 — NOT STARTED
- Task 009 — NOT STARTED

Update README.md where necessary.

The report must include:

- Implemented features.
- Files created and modified.
- BookingStore integration.
- Navigation behavior.
- Automated test count and results.
- Known limitations.
- Android 12 manual testing instructions.
- Dependencies for Task 008.
- Confirmation that no backend/database operations occurred.
- Confirmation that no web files changed.

## 12. Interruption Recovery

Maintain BATCH_01_PROGRESS.md throughout development.

If usage, context, or execution resources become insufficient:

1. Stop starting new work.
2. Preserve existing code.
3. Save the latest progress checkpoint.
4. Record completed and incomplete work.
5. Record actual test results.
6. Provide exact instructions for resuming Task 007.
7. Do not mark Task 007 complete unless its implementation and automated tests pass.

If execution ends unexpectedly, the saved checkpoint should allow recovery without repeating verified work.

Do not claim knowledge of remaining usage unless it is actually available.

## 13. Restrictions

Do not:

- Implement Task 008 or 009.
- Modify backend or web files.
- Perform database operations.
- Integrate Supabase or Firebase.
- Implement real reservations or payments.
- Change existing booking pricing rules.
- Introduce unnecessary dependencies.
- Discard uncommitted changes.
- Commit, push, merge, or switch branches.

## Final Instructions

Complete Task 007 only.

Run the required automated verification.

Create TASK_007_REPORT.md and update BATCH_01_PROGRESS.md.

Do not begin Task 008.

Physical Android testing is intentionally deferred until Tasks 005–009 are implemented.

Return the Task 007 implementation report for review.
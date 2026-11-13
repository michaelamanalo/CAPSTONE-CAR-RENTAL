# G-FLEET — TASK 009: CUSTOMER PROFILE

Project: G-FLEET Car Rental Management System
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Objective

Implement Task 009 — Customer Profile.

Replace the existing Profile tab placeholder with a functional customer-facing profile screen while preserving all existing demo-session behavior.

Tasks 005–008 are already implemented and automated-test verified.

Implement Task 009 only.

Physical Android testing for Tasks 005–009 will be performed together after Task 009 is completed.

## 1. Initial Inspection

Before modifying code:

1. Read AGENTS.md and applicable nested instructions, if present.
2. Verify the current branch is FLUTTER-FRESH-START. Stop if different.
3. Read BATCH_01_PROGRESS.md and docs/BATCH_01_REQUIREMENTS.md.
4. Read TASK_002_1_REPORT.md and TASK_005_REPORT.md through TASK_008_REPORT.md.
5. Inspect the existing Home/Profile tab, demo session implementation, authentication screens, BookingStore, BookingScope, navigation, and tests.
6. Identify existing session ownership and cleanup behavior.
7. Preserve all existing functionality and uncommitted work.

Do not reimplement previous tasks.

## 2. Customer Profile Screen

Replace the existing Profile placeholder with a dedicated customer-facing profile interface.

Follow the established G-FLEET Material 3 styling.

The Profile screen must distinguish between:

- Unauthenticated guest preview.
- Debug-only Demo Customer session.

Do not invent real authenticated user accounts.

## 3. Guest Profile

For unauthenticated Home preview:

Display:

- Guest profile heading.
- Clear explanation that the user is browsing without signing in.
- Appropriate guest/avatar icon.
- Login action.
- Registration action.
- Informational account-related sections where appropriate.

Do not display fictional customer names, emails, phone numbers, addresses, or account details.

Do not claim the guest has an authenticated session.

Login and Registration actions must use existing routes and preserve safe navigation.

## 4. Demo Customer Profile

For the existing debug-only Demo Customer session:

Display the established demo identity:

- Name: Alex Demo.
- Email: customer@example.invalid.
- Clear Demo Customer indicator.
- Explanation that this is a temporary local demonstration account.

Preserve the existing Exit Demo action.

Exit Demo must:

1. Clear the demo session.
2. Clear local booking records.
3. Return to Login.
4. Prevent stale demo identity from appearing afterward.
5. Ensure a new demo session starts with an empty booking list.

Do not change the established demo credentials or identity.

## 5. Profile Sections

Provide a clean, customer-oriented profile layout.

Recommended sections:

- Account information.
- My Bookings shortcut.
- Account settings.
- Help and support information.

Only implement actions that can work correctly with existing frontend functionality.

My Bookings shortcut should switch to the existing Bookings tab without creating a duplicate Home route.

For unsupported features, display a clear "Not available in this demo" message or omit them.

Do not create fake settings persistence, customer records, customer support interactions, or account editing functionality.

## 6. Session and Navigation Compatibility

Preserve:

- Existing debug-only demo login.
- DEMO indicator on appropriate customer screens.
- Profile-only demo identity.
- Existing Login, Registration, and Forgot Password flows.
- Existing Home visit lifecycle.
- BookingStore cleanup.
- Bottom navigation.
- Dashboard search, category, and scroll state.
- Android Back behavior.

Do not introduce a second authentication or session-management system.

Do not change the booking store's ownership or reset logic unless necessary to correct a verified issue.

## 7. Design and Accessibility

Follow existing Material 3 styling.

Support:

- Light and dark themes.
- Responsive layouts.
- Small Android screens.
- Enlarged accessibility text.
- Scrollable content.
- Clear section hierarchy.
- Accessible buttons and touch targets.
- Consistent typography and spacing.

Use existing theme tokens and reusable widgets where appropriate.

Avoid unnecessary dependencies or unrelated redesigns.

## 8. Testing

Add focused automated tests covering:

1. Guest Profile state.
2. No fictional guest identity.
3. Guest Login navigation.
4. Guest Registration navigation.
5. Demo Profile identity.
6. Demo indicator.
7. Exit Demo returning to Login.
8. BookingStore cleanup after Exit Demo.
9. Empty bookings after demo re-entry.
10. My Bookings shortcut.
11. Bottom navigation preservation.
12. Home dashboard state preservation.
13. Debug-only demo restrictions.
14. Light/dark themes.
15. Small-screen and enlarged-text layouts.
16. Existing Task 001–008 regressions.

Run:

flutter pub get
dart format lib test
flutter analyze
flutter test
git diff --check

Report actual results.

## 9. Documentation

Create TASK_009_REPORT.md.

Update BATCH_01_PROGRESS.md:

- Task 005 — COMPLETE
- Task 006 — COMPLETE
- Task 007 — COMPLETE
- Task 008 — COMPLETE
- Task 009 — COMPLETE only after automated verification passes

Update README.md where necessary.

Create or finalize BATCH_01_REPORT.md summarizing Tasks 005–009.

The reports must include:

- Features implemented.
- Files created and modified.
- Customer Profile behavior.
- Guest/demo session behavior.
- BookingStore cleanup.
- Automated test count and results.
- Known limitations.
- Combined Android 12 manual testing checklist for Tasks 005–009.
- Confirmation that no backend/database operations occurred.
- Confirmation that no web files changed.
- Confirmation that no commits, pushes, merges, or branch changes occurred.

## 10. Interruption Recovery

Maintain BATCH_01_PROGRESS.md throughout implementation.

If execution resources become insufficient:

1. Preserve completed code.
2. Save the latest checkpoint.
3. Record completed and incomplete work.
4. Record actual verification results.
5. Provide exact resume instructions.
6. Do not mark Task 009 complete unless implementation and automated tests pass.

If execution stops unexpectedly, the checkpoint must allow a future Codex session to resume safely.

## 11. Restrictions

Do not:

- Implement Task 010.
- Modify backend or web files.
- Perform database operations.
- Integrate Supabase or Firebase.
- Implement real profile editing or account persistence.
- Introduce fake customer account data.
- Implement unsupported account settings or customer support services.
- Change booking pricing or status rules.
- Discard uncommitted changes.
- Commit, push, merge, or switch branches.

## Final Instructions

Complete Task 009 only.

Run automated verification.

Create TASK_009_REPORT.md and finalize BATCH_01_REPORT.md.

Do not begin Task 010.

Physical Android testing remains deferred until Task 009 is implemented.

Return the implementation report for review.
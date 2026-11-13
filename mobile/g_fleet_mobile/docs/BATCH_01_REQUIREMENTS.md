# G-FLEET — BATCH 01: TASKS 005–009

Project: G-FLEET Car Rental Management System  
Branch: FLUTTER-FRESH-START  
Scope: `mobile/g_fleet_mobile/` only  
Reasoning level: Light (Low), with correctness prioritized over speed.

## Objective

Implement the complete customer-facing rental booking frontend workflow in one development batch.

Tasks:

- 005 — Booking Form
- 006 — Booking Confirmation
- 007 — My Bookings
- 008 — Booking Details
- 009 — Customer Profile

All functionality must remain local and frontend-only until backend integration is authorized.

**Important:** This batch must support interruption recovery. If execution stops because of usage limits, context exhaustion, or another interruption, previously completed work must remain recoverable through persistent progress reports.

## 1. Initial Inspection

Before implementation:

1. Read `AGENTS.md` and applicable nested instructions, if present.
2. Verify the current branch is `FLUTTER-FRESH-START`; stop if different.
3. Inspect the entire relevant Flutter architecture and existing functionality.
4. Review `README.md` and `TASK_001` through `TASK_004` reports, including `TASK_002_1_REPORT.md`.
5. Review available capstone requirements and project documentation for booking workflows, statuses, pricing, and customer roles.
6. Identify any business rules that are not approved or documented.
7. Preserve existing functionality and uncommitted work.
8. Inspect any existing Batch 01 progress file before starting, so previously completed work is not repeated.

Do not commit, push, merge, or switch branches.

## 2. Task 005 — Booking Form

Replace the Vehicle Details booking-preview dialog with navigation to a functional local booking form.

Include:

- Selected vehicle summary.
- Pickup date and time.
- Return date and time.
- Pickup and return locations only if supported by approved project requirements; otherwise clearly label temporary selections.
- Rental duration.
- Estimated rental cost.
- Input validation.
- Continue to Review action.

Use the existing illustrative daily prices.

Keep pricing calculations centralized and testable.

If no approved rental billing policy exists, use a clearly labeled temporary daily-rate calculation and document the assumptions.

Do not implement taxes, deposits, discounts, penalties, or other unapproved fees.

## 3. Task 006 — Booking Confirmation

Implement a review screen displaying:

- Selected vehicle.
- Pickup/return schedule.
- Rental duration.
- Estimated cost.
- Sample-data notice.

Allow the customer to return to editing without losing form input.

Confirming must create a local mock booking record only.

Show a success state with a route to My Bookings.

Prevent duplicate confirmation from repeated taps.

Do not submit data to any backend.

## 4. Task 007 — My Bookings

Replace the Bookings placeholder with a functional customer booking screen.

Display locally created bookings and clearly labeled sample reservations where appropriate.

Support appropriate booking status categories, subject to available project requirements.

Provide an empty state when no bookings exist.

Each booking must open its corresponding Booking Details screen.

Bookings created during the current app session must appear immediately.

## 5. Task 008 — Booking Details

Implement a dedicated Booking Details screen.

Display:

- Booking reference.
- Vehicle information.
- Pickup and return schedule.
- Estimated cost.
- Booking status.
- Relevant countdown when applicable.

Do not fabricate GPS tracking, payment completion, staff approval, or real rental activation.

If cancellation is implemented, restrict it to local mock bookings and clearly document its temporary behavior.

Do not introduce automatic status changes that imply real-world approval or vehicle handover.

## 6. Task 009 — Customer Profile

Replace the Profile placeholder with a customer-facing profile screen.

Preserve Task 002.1 demo-session behavior:

- Demo identity appears only in Profile.
- Exit Demo clears the demo session and returns to Login.
- DEMO indicator remains visible on appropriate screens.
- Demo login remains debug-only.

For unauthenticated preview mode, do not fabricate a logged-in customer.

Display a suitable guest state.

Do not implement real profile editing or account persistence.

## 7. Shared State and Architecture

Use the existing feature-first structure.

Create a lightweight in-memory booking store shared by booking form, confirmation, My Bookings, and Booking Details.

Prefer Flutter's existing state-management primitives unless a dependency is clearly justified.

The booking store must:

- Hold mock bookings for the current app session.
- Notify relevant screens when bookings change.
- Avoid duplicate submissions.
- Support retrieving bookings by stable local identifiers.
- Reset appropriately when the customer session ends.
- Never persist credentials or sensitive information.

Keep booking models, pricing calculations, and presentation separate.

Do not create a full production backend architecture prematurely.

## 8. Preserve Existing Features

Do not break:

- Landing and Home preview.
- Login, Registration, Forgot Password.
- Demo Customer Login.
- Existing vehicle catalog and filters.
- Vehicle Details.
- Light/dark themes.
- Bottom navigation.
- Android Back navigation.
- Dashboard scroll/filter/tab state.
- Existing tests.

## 9. Design and UX

Follow established G-FLEET Material 3 styling.

Use:

- Responsive layouts.
- Clear validation messages.
- Consistent spacing and typography.
- Loading-free local interactions.
- Appropriate empty and success states.
- Explicit mock-data disclaimers.
- Accessible controls and readable text.

Ensure navigation between booking form, review, success, My Bookings, and Booking Details works coherently.

## 10. Restrictions

Do NOT implement:

- Supabase or Firebase integration.
- Real vehicle availability.
- Actual reservation submission.
- Payment processing.
- Staff approval.
- GPS/maps.
- Real notifications.
- Messaging backend.
- Admin/staff mobile screens.
- Database migrations or records.

Do not modify the web application.

Do not add unnecessary dependencies.

Do not modify unrelated files or overwrite previous task implementations.

## 11. Development Workflow

Implement Tasks 005–009 sequentially within this batch.

Before implementing each task:

1. Inspect the relevant existing code.
2. Identify dependencies on previously completed tasks.
3. Review the latest progress checkpoint.
4. Confirm that the planned changes preserve existing functionality.

After each task:

1. Run relevant focused tests.
2. Fix regressions before proceeding.
3. Verify navigation and shared booking state.
4. Update the persistent progress report.
5. Mark the task COMPLETE only when implementation and relevant tests pass.
6. Record any unresolved limitations.

Do not skip verification to complete more tasks.

After the entire batch:

1. Run `flutter pub get`.
2. Run `dart format lib test`.
3. Run `flutter analyze`.
4. Run `flutter test`.
5. Run `git diff --check`.
6. Perform a read-only review of the final changes.

Report actual results, not assumptions.

## 12. Persistent Progress Tracking

Before writing implementation code, create:

`BATCH_01_PROGRESS.md`

This file must be maintained throughout development.

It must contain:

### Batch Status

- Current task.
- Overall batch status.
- Last successfully completed checkpoint.
- Last verified test results.

### Task Status

Track each task using these exact values:

- COMPLETE — Implementation finished and relevant tests passed.
- IN PROGRESS — Implementation started but not fully verified.
- NOT STARTED — No implementation work performed.
- BLOCKED — Cannot proceed because of an unresolved issue.

Track:

- Task 005
- Task 006
- Task 007
- Task 008
- Task 009

### Implementation Details

Record:

- Completed functionality.
- Files created.
- Files modified.
- Architecture decisions.
- Dependencies between tasks.
- Outstanding work.
- Known bugs and limitations.
- Tests performed and their actual results.
- Exact next steps for resuming development.

Update `BATCH_01_PROGRESS.md`:

1. Before starting each task.
2. After significant implementation milestones.
3. After focused tests.
4. After completing each task.
5. Before intentionally stopping work.

Never rely solely on the final chat response to preserve progress.

## 13. Token/Usage Limit Recovery Protocol

This batch may be interrupted because of Codex usage limits, context limits, execution failures, or other resource restrictions.

The implementation must remain recoverable.

### 13.1 Early Interruption Detection

If you detect that remaining resources may be insufficient to complete the batch:

1. Do not start another task.
2. Finish or safely pause the current operation.
3. Preserve all completed code.
4. Update `BATCH_01_PROGRESS.md`.
5. Record which tasks are complete, incomplete, or blocked.
6. Run relevant tests if resources permit.
7. Report the current implementation state before stopping, if possible.

Do not claim to know the exact remaining token or usage allowance unless that information is actually available.

Do not repeatedly retry failing operations without identifying the cause.

### 13.2 Unexpected Interruption Protection

Because usage exhaustion may terminate execution without allowing a final response:

- Save progress continuously rather than only at the end.
- Update the progress file after each meaningful milestone.
- Record partially completed work accurately.
- Never mark untested work as complete.
- Ensure the progress file contains sufficient information for a new Codex session to resume.
- Preserve existing files and uncommitted changes.

If execution stops abruptly, the latest saved checkpoint must represent the last known state.

### 13.3 Required Interruption Report

If unable to complete all five tasks, provide this report if execution resources remain:

# BATCH 01 — INTERRUPTED

**Reason for interruption:**  
State the actual known reason. If unknown, report "Unknown / execution interrupted."

**Task Status:**

- Task 005 — COMPLETE / IN PROGRESS / NOT STARTED / BLOCKED
- Task 006 — COMPLETE / IN PROGRESS / NOT STARTED / BLOCKED
- Task 007 — COMPLETE / IN PROGRESS / NOT STARTED / BLOCKED
- Task 008 — COMPLETE / IN PROGRESS / NOT STARTED / BLOCKED
- Task 009 — COMPLETE / IN PROGRESS / NOT STARTED / BLOCKED

**Completed Work:**  
Describe implemented and verified functionality.

**Incomplete Work:**  
Describe missing functionality, partial implementations, and unresolved issues.

**Files Created or Modified:**  
List all relevant files.

**Verification Results:**  
Report actual commands, passing/failing tests, and tests not yet executed.

**Known Issues:**  
Identify any regressions, implementation risks, or blockers.

**Resume Instructions:**  
Identify the first incomplete task and provide exact steps to continue without repeating completed work.

### 13.4 Interruption Restrictions

If interrupted:

- Do not discard completed work.
- Do not reset the working tree.
- Do not overwrite verified implementations unnecessarily.
- Do not automatically restart the batch from Task 005.
- Do not mark unfinished tasks as complete.
- Do not commit, push, merge, or switch branches.
- Do not modify backend or web files.

### 13.5 Resume Compatibility

A future Codex session must be able to resume using only:

1. The original Batch 01 requirements.
2. `BATCH_01_PROGRESS.md`.
3. The current repository files.
4. Existing task reports and tests.

Do not depend on information that exists only in the current chat context.

## 14. Documentation

Create:

- `TASK_005_REPORT.md`
- `TASK_006_REPORT.md`
- `TASK_007_REPORT.md`
- `TASK_008_REPORT.md`
- `TASK_009_REPORT.md`
- `BATCH_01_PROGRESS.md`
- `BATCH_01_REPORT.md`

Update `README.md`.

Create individual task reports as their respective tasks are completed. Do not postpone all documentation until the end.

The consolidated batch report must include:

1. Completed features.
2. Files created and modified.
3. Shared booking architecture.
4. Booking workflow explanation.
5. Pricing assumptions.
6. Automated test count and results.
7. Known issues and limitations.
8. Android 12 manual testing checklist.
9. Confirmation that no backend/database operations occurred.
10. Confirmation that no web files changed.
11. Confirmation that no commits, pushes, merges, or branch changes occurred.
12. Any interrupted or resumed development stages.

Do not begin Task 010 or any subsequent batch.

## 15. Acceptance Criteria

The batch is ready for owner testing when a user can:

1. Open a vehicle.
2. Start a mock booking.
3. Enter valid rental dates.
4. Review the booking.
5. Confirm it locally.
6. See the booking in My Bookings.
7. Open Booking Details.
8. View a coherent booking status and schedule.
9. Navigate to Profile.
10. Exit Demo without retaining demo booking data.

All existing regression tests must continue passing.

All five tasks must have status COMPLETE in `BATCH_01_PROGRESS.md`.

The full automated verification suite must pass.

Physical Android testing remains pending until the project owner performs it.

## 16. Final Response Requirements

### If all tasks are completed

Respond with:

# BATCH 01 — IMPLEMENTATION COMPLETE

Include:

- Task 005–009 completion status.
- Summary of implemented functionality.
- Files created and modified.
- Shared booking architecture.
- Final automated test count.
- Flutter analysis results.
- Known limitations.
- Android manual testing instructions.
- Location of `BATCH_01_REPORT.md`.

Do not claim physical Android testing passed unless it was actually performed.

### If the batch is interrupted

Respond using the interruption report format from Section 13.3.

Ensure `BATCH_01_PROGRESS.md` is updated before stopping whenever possible.

### If all work is complete but tests fail

Do not report successful completion.

Report the failing tests, affected tasks, unresolved issues, and required corrections.

## Final Instructions

Prioritize correctness, test coverage, and preservation of existing functionality over implementation speed.

Use the existing architecture and avoid unnecessary abstractions.

Implement Tasks 005–009 sequentially within this batch.

Maintain persistent checkpoints throughout development.

Do not commit, push, merge, or switch branches.

Do not perform database operations.

Do not modify web files.

Do not begin Task 010.

Complete Batch 01 only.
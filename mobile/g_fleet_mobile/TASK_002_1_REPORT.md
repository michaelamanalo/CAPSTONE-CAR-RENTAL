# Task 002.1 - Development-only demo customer login

Date: November 7, 2026
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Implementation

Login now offers a secondary OutlinedButton labeled **Continue as Demo Customer**
in debug builds. No credentials or form validation are required for this separate
demo action. It opens the existing `/home` route with an in-memory
`DemoCustomerSession` containing only fictional customer data:

- Name: Alex Demo
- Email: customer@example.invalid

Home displays a **DEMO** chip, the fictional identity, a no-backend-access message,
and **Exit demo**. Exit clears the identity and pops back to Login. Returning via
Back also clears the identity when the navigation future completes; Home disposal
clears it when the route or app is removed. Re-entry creates a new session object.
There is no global session state or persistence.

The button, entry handler, route handling, and demo display all check `kDebugMode`.
The session constructor throws `UnsupportedError` outside debug mode, rather than
relying on an assertion that disappears in production. Profile/release code cannot
start a demo identity. This object is a UI helper only: it supplies no tokens,
permissions, admin/staff roles, or authenticated-user status. It must never be
used to satisfy future backend authentication checks.

Landing > Continue > Home remains the original preview flow, with no demo
identity, DEMO indicator, or Exit demo action. Real Login, Registration, and
Forgot Password still validate input and show backend-not-connected notices.
Task 003 was not implemented.

## Files

Modified:

- `lib/features/auth/presentation/login_screen.dart`: debug-only demo button and
  entry handler, with cleanup after navigation returns.
- `lib/app/router/app_router.dart`: accepts a demo session argument for Home
  only in debug mode; route names and other destinations are unchanged.
- `lib/features/home/presentation/home_screen.dart`: demo identity display,
  explicit exit, and disposal cleanup.
- `README.md`: demo behavior, lifecycle, safeguards, and manual checks.

Created:

- `lib/features/auth/demo/demo_customer_session.dart`: small debug-only identity
  holder with an idempotent clear operation.
- `test/demo_customer_test.dart`: five widget tests.
- `TASK_002_1_REPORT.md`: this report.

No dependencies were added. The theme, package manifest/lockfile, existing tests,
and existing form-validation rules were preserved.

## Verification

| Check | Result |
| --- | --- |
| `flutter pub get` | Passed |
| `flutter analyze` | Passed: no issues found |
| `flutter test` | Passed: all 30 tests |
| `git diff --check` | Passed |
| Independent read-only code review | No actionable findings |

The five new tests cover debug button availability and Home entry without
credentials, DEMO/identity display, Exit cleanup, Back cleanup and fresh re-entry,
app removal cleanup, and isolation of the existing Home preview. All 25 Task 001
and Task 002 tests continue passing, including form validation and keyboard/theme
checks.

Tests run in debug mode. Profile/release gating was reviewed in code; no profile
or release APK was built or device-tested for this task. Physical-device
verification of Task 002.1 remains pending.

The initial sandboxed test command stalled without diagnostic output and was
cancelled. It ran after allowing SDK-cache access outside the workspace. The
test-first run then failed with `The getter 'demoSession' isn't defined for the
type 'HomeScreen'` before implementation; that expected missing API was added and
the final suite passes. Pub reports five packages with newer versions outside
existing constraints. Git emits LF-to-CRLF conversion warnings. No unresolved
analysis or test errors remain.

## Scope and remaining limits

No database operations, policies, backend sessions, tokens, credential storage,
or real backend permissions were created or modified. No Supabase integration,
authentication framework, or future production-auth bypass was introduced.
No web files or Android build configuration changed. No commits, pushes, merges,
or branch switches occurred.

Only the existing Home placeholder is available. Demo identity ownership is scoped
to that Home visit; sharing it with future customer screens would need an explicit
development-only design when those screens exist. Normal authentication remains
unconnected.

## Android 12 manual verification

From the repository root:

```powershell
cd mobile/g_fleet_mobile
flutter run -d 35a01127
```

If a debug run is already active, press uppercase `R` in its terminal to hot
restart and reset navigation.

1. On Landing, tap Continue. Verify Home has no DEMO indicator or Exit demo.
   Use Android Back to return.
2. Open Login, leave the fields empty, and tap Continue as Demo Customer.
   Scroll down if necessary. Verify Home shows DEMO, Alex Demo, the fictional
   email, and the no-backend-access message.
3. Tap Exit demo. Verify Login returns. Go back to Landing, then Continue;
   verify that preview Home has no demo identity.
4. Re-enter demo mode, then leave using the app-bar Back arrow. Repeat with
   Android Back. Both should return to Login; another preview visit must not
   retain demo identity.
5. Confirm ordinary Login/Registration validation and backend notices still
   work. Check the new demo action in light/dark mode and with the keyboard open.
6. Optional build-mode verification: run `flutter run --profile -d 35a01127`
   and `flutter run --release -d 35a01127` separately. On Login, verify Continue
   as Demo Customer is absent in both modes. Stop the current run before
   starting the next one. These checks have not been performed by the agent.

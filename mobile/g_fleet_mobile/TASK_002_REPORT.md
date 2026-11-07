# Task 002 implementation and handoff

Date: November 7, 2026  
Project: G-FLEET / CAPSTONE-CAR-RENTAL  
Branch: FLUTTER-FRESH-START  
Scope: mobile/g_fleet_mobile/ only

## Outcome

Customer Login, Registration, and Forgot Password UI is implemented and ready
for owner testing. Forms use a consistent Material 3 design with a temporary
blue accent, rounded inputs/buttons, and system light/dark themes. Valid
submissions display informational notices only. No actual authentication exists.

Task 001's Continue-to-Home flow remains intact. Task 003 was not started.

## Created files and authentication structure

```text
lib/features/auth/presentation/
  auth_validators.dart
  login_screen.dart
  registration_screen.dart
  forgot_password_screen.dart
  widgets/
    auth_layout.dart
    password_field.dart
test/
  auth_ui_test.dart
TASK_002_REPORT.md
```

- `auth_validators.dart`: shared, temporary frontend rules.
- Screens: local form state and submit handlers, without services or repositories.
- `auth_layout.dart`: scrollable, width-constrained form layout, branding, and
  informational backend notices.
- `password_field.dart`: reusable obscured field with independent accessible
  show/hide control. Registration disposes its password controller on removal.
- `auth_ui_test.dart`: 22 new widget tests.

Files modified for Task 002:

- `lib/app/router/app_router.dart`: added three auth route names and builders.
- `lib/app/theme/app_theme.dart`: blue seed, shared spacing tokens, rounded
  themed input and primary-button styles for both brightness modes.
- `lib/features/home/presentation/landing_screen.dart`: separate Login link;
  existing Continue action still pushes Home.
- `README.md`: auth structure, routes, validation, limitations, and manual checks.

The pre-existing uncommitted Task 001 work was preserved. Its `main.dart`, app
configuration, Home screen, shared placeholder layout, widget tests, and report
were not rewritten for Task 002. No dependencies were added; `pubspec.yaml` and
`pubspec.lock` remain unchanged.

## Navigation

| Route | Screen | Flow |
| --- | --- | --- |
| `/` | Landing | Continue to `/home`; Login to `/login` |
| `/home` | Existing Home placeholder | Back to Landing |
| `/login` | Login | Create an account to `/register`; Forgot password? to `/forgot-password` |
| `/register` | Registration | Back to Login link and normal Back pop the current route |
| `/forgot-password` | Recovery | Back to Login link and normal Back pop the current route |

Flutter's existing named-route Navigator remains in use. Back links preserve
the previous Login instance and its in-memory input. No auth guards, redirects,
protected-route logic, or session persistence were introduced. Home remains an
unprotected placeholder, not proof of authentication.

## Validation and submission behavior

No approved registration schema or password policy was found in existing project
documentation. The temporary registration schema uses only Full name, Email
address, Password, and Confirm password.

- All required fields reject empty or whitespace-only input.
- Email ignores surrounding whitespace for a basic `local@domain.suffix` check.
  This does not verify that an address exists or can receive mail.
- Login requires a nonblank password; it does not impose the registration length
  rule on existing-account input.
- Registration requires a password of at least eight Unicode code points. This
  is a documented temporary frontend rule pending an approved password policy.
  No uppercase, digit, or symbol requirement is imposed.
- Confirmation must match exactly. Passwords are not trimmed or normalized for
  length or comparison.
- Invalid submission produces field-specific errors and no backend notice.
- Valid Login or Create Account submission shows: "Authentication will be
  available after backend integration."
- Valid Reset Password submission shows: "Password recovery is not connected
  yet. No reset email has been sent."

Valid submissions remain on their form. No accounts, sessions, tokens, or reset
requests are created. Input exists only in widget memory while the relevant
screen remains mounted. No logging or local persistence of credentials was added.

## Verification results

| Command / check | Result |
| --- | --- |
| `flutter pub get` | Passed |
| `dart format lib test` | Passed; final run required no changes |
| `flutter analyze` | Passed: no issues found |
| `flutter test` | Passed: all 25 tests (22 new auth tests + 3 Task 001 tests) |
| `git diff --check` | Passed |
| Independent read-only code review | No actionable findings |

Coverage includes rendering, required/whitespace input, invalid email, temporary
password length, mismatch, visibility controls, navigation and back-stack
behavior, informational valid submissions, and 360x640 viewports with a simulated
280-pixel keyboard inset in both themes. Existing startup, Home navigation, and
system-theme tests continue passing.

During test-first implementation, the initial auth tests failed because the
Login entry did not yet exist (`Bad state: No element`). A later whitespace
test failed with `Expected: exactly one matching candidate` for the missing
password-required error. Both were resolved; the final full suite is green.
An initial invocation from the repository root produced no diagnostic output
and was cancelled; completed test commands ran from the Flutter project directory.

Pub still reports five packages with newer releases outside existing dependency
constraints. Git emits LF-to-CRLF conversion warnings. No dependency upgrades
were made and neither message blocked verification.

## Scope and limitations

- No database operations, backend calls, Supabase/Firebase clients, mock auth
  services, or repository scaffolding were added.
- No web application files or Android configuration files were modified.
- No social login, biometric authentication, OTP, rental, or other features
  were implemented.
- No branches were switched and no commits, pushes, or merges were made.
- No unresolved implementation errors were observed in analysis or tests.
- Authentication remains UI only. The registration schema and password rule
  require approval before backend integration.
- Task 002 was not run on the physical device by the coding agent. The owner's
  earlier Android 12 success report applies to Task 001. Simulated keyboard
  tests do not replace checking the actual Android keyboard and system Back.
- No separate release APK build verification was performed.

## Exact owner testing steps: Android 12

1. Keep the 220333QL connected with USB debugging authorized. From the repository
   root run:

   ```powershell
   cd mobile/g_fleet_mobile
   flutter run -d 35a01127
   ```

   If a Flutter run is already active, press `R` in its terminal for a hot restart
   to reset navigation and load the updated foundation.
2. Confirm Landing shows Continue and Login. Tap Continue, verify Home, and use
   Android Back to return to Landing.
3. Tap Login. Submit empty fields; check both errors. Try a malformed email and
   check its error. Enter a password and toggle Show/Hide password.
4. Enter a well-formed email and a nonblank password. Tap Login. Confirm the
   backend-integration notice appears and the screen does not navigate to Home.
5. Tap Create an account. Submit empty fields. Enter a full name and well-formed
   email; try a password shorter than eight characters, then a mismatched
   confirmation. Check field errors and both independent password toggles.
6. Enter a password of at least eight characters with an identical confirmation.
   Tap Create Account. Confirm only the backend-integration notice appears.
7. Tap Back to Login. Confirm the existing Login screen is restored. Open Forgot
   password?, submit empty and malformed email values, then a well-formed email.
   Verify the notice explicitly says no reset email was sent.
8. Test Back to Login, app-bar Back, and Android Back for registration and
   recovery. From Login, Back should return to Landing without duplicate Login
   screens.
9. On each form, open the keyboard and scroll to all fields and the action
   button. Repeat with validation errors visible; verify no overflow and that
   buttons remain reachable.
10. Repeat the auth screens in the phone's light and dark modes, checking text,
    borders, error messages, and button readability.

## Suggested planning handoff

> Task 002 Authentication UI is complete. Review TASK_002_REPORT.md. Analysis
> passes and all 25 widget tests pass. The implementation has no backend or
> session persistence and preserves Task 001 navigation. I will provide the
> Android 12 manual-test results separately. Do not treat authentication as
> connected or begin Task 003 without a scoped request.

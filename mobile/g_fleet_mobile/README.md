# G-FLEET mobile

Flutter frontend foundation and customer authentication UI for the G-FLEET car
rental system. Authentication services and backend integration are not implemented.

## Run and verify

Use Flutter with Dart compatible with `sdk: ^3.13.2` in `pubspec.yaml`.
From the repository root:

```sh
cd mobile/g_fleet_mobile
flutter pub get
flutter run
flutter analyze
flutter test
```

For Android, configure the Android SDK and Java 17 as required by the existing
Gradle setup. Use `flutter devices`, then `flutter run -d <device-id>` to select
an Android 12 (API 31) emulator or connected device. Android build settings are
unchanged. The owner confirmed Task 001 runs on Android 12; Task 002 still needs
owner testing on that device.

## Architecture

```text
lib/
  main.dart                         # Starts GFleetApp only
  app/
    app.dart                        # MaterialApp configuration
    router/app_router.dart          # Route names and screen builders
    theme/app_theme.dart            # Material 3 themes and temporary tokens
  core/
    widgets/placeholder_page.dart   # Shared temporary screen layout
  features/
    auth/presentation/
      auth_validators.dart          # Temporary frontend validation rules
      login_screen.dart
      registration_screen.dart
      forgot_password_screen.dart
      widgets/
        auth_layout.dart            # Scrollable layout and informational notice
        password_field.dart         # Independent show/hide control
    home/presentation/
      landing_screen.dart           # Initial placeholder
      home_screen.dart              # Navigation destination placeholder
test/
  auth_ui_test.dart                  # Forms, validation, navigation, keyboard
  widget_test.dart                   # Startup, forward/back, system themes
```

The app follows system light/dark mode. Update the temporary blue seed color,
spacing, and rounded control styles in `AppTheme` when branding is finalized;
widgets use the theme for typography and colors. Landing and Home remain
temporary placeholders. Auth screens are frontend-only forms.

Navigation uses Flutter's built-in Navigator and a centralized route table.
`Continue` pushes `/home`; the app-bar or Android Back action returns to `/`.
Add route names and builders in `AppRouter`. There are no authentication redirects
or role checks. No routing or state-management dependency is needed for this
small mobile-only flow. Reconsider `MaterialApp.router` with `go_router` when
nested navigation or URL/deep-link requirements arrive.

## Customer authentication UI (Task 002)

| Route | Screen | Navigation |
| --- | --- | --- |
| `/` | Landing | Continue to Home; separate Login entry |
| `/home` | Home placeholder | Back to Landing |
| `/login` | Login | Registration, Forgot Password, Back to Landing |
| `/register` | Registration | Back to Login |
| `/forgot-password` | Password recovery | Back to Login |

Auth links push routes; app-bar Back, Android Back, and the explicit Back to Login
links pop the current screen. Returning to Login preserves its in-memory input
without adding another Login route. These are local navigation flows; there are
no guards, sessions, or protected routes. Continue still opens the original Home
placeholder and does not represent an authenticated session.

No approved registration schema or password policy was found in the repository.
The temporary registration fields are Full name, Email address, Password, and
Confirm password. Validation is centralized in `auth_validators.dart`:

- Required fields reject empty or whitespace-only input.
- Email validation ignores surrounding whitespace and checks a basic
  `local@domain.suffix` format, not deliverability.
- Login requires a nonblank password, with no registration length rule applied.
- Registration requires at least eight Unicode code points in the password.
  This is a temporary frontend rule, not an approved security policy. No
  uppercase, number, or symbol rule is imposed.
- Confirmation must match the original password exactly; passwords are not
  trimmed or normalized for length or comparison.

Invalid submissions display field-specific errors. Each password field has its
own accessible visibility toggle. Forms use local widget state and a scrollable,
width-constrained layout so fields and buttons remain reachable with the keyboard
open. No repository, authentication service, or state-management package is added.

Valid Login/Create Account submissions only show:
“Authentication will be available after backend integration.” Valid recovery
submissions show: “Password recovery is not connected yet. No reset email has
been sent.” They do not navigate to Home, create an account/session, send a reset
email, call an API, or log/store credentials. Inputs exist only in widget memory
while the relevant screen remains mounted; no local persistence is configured.

## Adding future features

Organize `vehicles`, `bookings`, `tracking`, `messages`, `sos`, and `profile`
under `lib/features/` alongside `auth` and `home`. Create directories when implementation
starts, rather than checking in empty scaffolding:

- `presentation/`: screens, feature widgets, and presentation state.
- `domain/`: business rules and repository contracts, independent of widgets.
- `data/`: repository implementations, data sources, and feature-specific models.

Keep business rules and data access out of widgets. Introduce repository
abstractions when a feature actually depends on data, then inject implementations
at the app composition boundary. Add state management only when real state needs
justify it.

Shared code belongs in `core/widgets`, `core/constants`, `core/errors`, or
`core/utils` when there is an actual reusable implementation. Keep visual tokens
in the app theme. Reserve top-level `data/models`, `data/repositories`, and
`data/mock` for data genuinely shared across features; prefer feature-local data
otherwise. These unused locations are documented, not populated with placeholder
classes or files.

No database, backend APIs, stored credentials, authentication services, rental
logic, location services, messaging, SOS, notifications, or mock business data
are included.

## Manual smoke check

1. Run on an Android 12 device or emulator and confirm the welcome screen opens.
2. Tap Continue and confirm the Home placeholder appears.
3. Use the app-bar Back arrow, then repeat using Android Back; both return home
   to the welcome screen.
4. Change the device between light and dark mode and confirm both screens follow.
5. From Landing, tap Login. Submit empty fields, then an invalid email. Check
   field errors and toggle password visibility.
6. Open Create an account. Check required fields, a password shorter than eight
   characters, and a mismatched confirmation. Test both visibility controls.
7. Submit valid Login and registration forms. Confirm only the backend notice
   appears and the app stays on the form.
8. Open Forgot password? and test empty, invalid, and valid email input. Confirm
   the valid notice explicitly says no reset email was sent.
9. Test Back to Login links, app-bar Back, and Android Back. Open the keyboard
   and scroll each form to its action button, including with validation errors.
10. Repeat auth checks in dark mode. On the owner's connected device, use
    `flutter run -d 35a01127` from this directory.

Widget tests cover startup, forward/back navigation, both system themes, auth
rendering and validation, informational submissions, password visibility, and
360x640 keyboard layouts in both themes.
They do not replace a physical-device test or Android APK build.

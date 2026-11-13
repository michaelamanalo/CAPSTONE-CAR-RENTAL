# G-FLEET mobile

Flutter frontend foundation, customer authentication UI, and sample vehicle
dashboard and vehicle details for G-FLEET. Authentication services and backend
integration are not implemented.

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
unchanged. The owner confirmed Task 001 and Task 002 Android manual testing.
Tasks 003 and 004 still need owner testing on that device.

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
    auth/demo/
      demo_customer_session.dart    # Debug-only, route-scoped fictional identity
    auth/presentation/
      auth_validators.dart          # Temporary frontend validation rules
      login_screen.dart
      registration_screen.dart
      forgot_password_screen.dart
      widgets/
        auth_layout.dart            # Scrollable layout and informational notice
        password_field.dart         # Independent show/hide control
    home/
      data/sample_vehicles.dart     # Immutable fictional sample collection/model
      presentation/
        landing_screen.dart         # Initial welcome screen
        home_screen.dart            # Customer tabs and demo lifecycle
        widgets/
          vehicle_dashboard.dart    # Local search/category state and results
          vehicle_card.dart         # Interactive sample card and selection callback
    vehicles/presentation/
      vehicle_details_screen.dart   # Selected sample, disclaimer, booking preview
      widgets/vehicle_summary.dart  # Shared card/details illustration and labels
    bookings/
      domain/booking_draft.dart     # Existing immutable form inputs
      domain/rental_pricing.dart    # Temporary started-24-hour billing
      domain/local_booking.dart     # Immutable local confirmation snapshot
      domain/rental_schedule.dart   # Pure schedule phase/countdown calculation
      data/booking_store.dart       # ChangeNotifier, Home-visit records and IDs
      presentation/
        booking_scope.dart          # App-owned store above Navigator
        booking_form_screen.dart    # Schedule and temporary locations (Task 005)
        booking_review_screen.dart  # Edit, confirm locally, success (Task 006)
        my_bookings_screen.dart     # Live local booking list and empty state
        booking_details_screen.dart # ID lookup, stored quote, schedule indicator
        widgets/booking_card.dart   # Stored record summary and Details entry
        widgets/booking_page.dart   # Shared scrolling/themed layout and DEMO
        widgets/booking_summary.dart # Schedule, duration and estimate
test/
  auth_ui_test.dart                  # Forms, validation, navigation, keyboard
  demo_customer_test.dart            # Demo entry, cleanup, and preview isolation
  home_screen_test.dart              # Dashboard, filtering, tabs, responsive themes
  vehicle_details_test.dart          # Card destinations, Back/state, demo, layouts
  booking_form_test.dart             # Form validation, pricing display and edit state
  rental_pricing_test.dart           # Temporary billing boundaries and schedules
  booking_store_test.dart            # Stable IDs, deduplication, reset and stale visits
  booking_review_test.dart           # Review/edit/success, navigation and lifecycle
  my_bookings_test.dart              # Live list, sorting, clearing, browsing and layouts
  rental_schedule_test.dart          # Schedule phases and exact boundaries
  booking_details_test.dart          # Details lookup, quote, Back, timer and layouts
  widget_test.dart                   # Startup, forward/back, system themes
```

The app follows system light/dark mode. Update the temporary blue seed color,
spacing, and rounded control styles in `AppTheme` when branding is finalized;
widgets use the theme for typography and colors. Landing remains the welcome
screen; Home displays a sample vehicle dashboard. Auth screens are frontend-only
forms.

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
| `/home` | Customer dashboard | Back to Landing (preview) or Login (demo) |
| `/vehicle-details` | Selected sample vehicle | Back to the existing dashboard state |
| `/booking-form` | Local booking inputs | Continue to Review; Back to Details |
| `/booking-review` | Review/local success | Edit to Form; success returns to My Bookings tab |
| `/booking-details` | Local booking by stable ID | Back to the same My Bookings tab/scroll |
| `/login` | Login | Registration, Forgot Password, Back to Landing |
| `/register` | Registration | Back to Login |
| `/forgot-password` | Password recovery | Back to Login |

Auth links push routes; app-bar Back, Android Back, and the explicit Back to Login
links pop the current screen. Returning to Login preserves its in-memory input
without adding another Login route. These are local navigation flows; there are
no guards, backend sessions, or protected routes. Continue opens the Home
dashboard preview and does not represent an authenticated session.

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

## Development-only demo customer (Task 002.1)

In Flutter **debug builds only**, Login offers a secondary **Continue as Demo
Customer** button. It needs no email/password and opens the existing `/home`
screen with a route-scoped `DemoCustomerSession`. A compact **DEMO** chip stays
visible in the app bar on every customer tab. Only **Profile** displays the
fictional name Alex Demo, `customer@example.invalid`, the no-backend-access
notice, and **Exit Demo**. Vehicle Details also displays the compact DEMO chip
during a demo visit; it receives a display flag, without owning the session.

Exit Demo returns to Login and clears the identity. App-bar/Android Back also
clears it; Home disposal clears it if the route or app is removed. Every new demo
visit gets its own in-memory identity. Landing's Continue flow still opens Home
without demo data or an Exit demo action. No global or persistent auth state is
introduced.

The button, entry handler, route handling, and Home demo display use `kDebugMode`.
Creating a demo identity outside debug mode throws `UnsupportedError`; profile
and release builds cannot start a demo session. This helper grants no backend
permissions and must never satisfy a future production authentication check.
Real Login/Registration submissions remain informational only. No real account,
token, backend session, privileged role, or stored credential is created.

To verify on the owner's Android device, run `flutter run -d 35a01127`, then
Landing > Login > Continue as Demo Customer. Check DEMO across all tabs and
Profile's identity details and Exit Demo,
repeat using Android Back, then verify Landing > Continue has no DEMO indicator.
If testing build modes manually, `flutter run --profile -d 35a01127` and
`flutter run --release -d 35a01127` should show no demo entry on Login. Automated
widget tests run in debug mode; profile/release APKs were not built for this task.

## Customer Home (Task 003)

Home provides local make/model search, category filters, sample cards, and a
persistent Home / Bookings / Messages / Profile navigation bar. Bookings now
displays the Task 007 local list; Profile provides the Task 009 guest/demo UI.
Messages remains an informational preview.
Search, category, and scroll state
survive tab switching within the visit; they reset when the Home route is removed.
Tab changes dismiss the keyboard. Back leaves Home for its entry screen.

`home/data/sample_vehicles.dart` holds four immutable examples with make, model,
category, and whole-peso illustrative daily rate. No approved taxonomy or fleet
specifications were found, so Sedan, SUV, and MPV are temporary categories.
The examples are Toyota Vios (PHP 1,800), Honda City (PHP 2,000), Toyota Innova
(PHP 3,000), and Mitsubishi Montero Sport (PHP 3,500) per day. None are business
fleet records, real quotes, or availability claims. Cards and the dashboard label
this explicitly. Local Material icons serve as image placeholders; no external
images, assets, or network calls were added. Unapproved specifications such as
seating and transmission are omitted.

Search ignores case and surrounding whitespace and matches the combined make
and model. Category and search apply together. Clear search retains the current
category. Empty results offer guidance. Card selection now opens Vehicle Details
(Task 004). Tasks 005/006 now provide local form, review, and mock confirmation.

Layout uses a scrollable single column constrained to 720 logical pixels, wrapping
chips, and existing Material theme tokens. Automated tests exercise a 360x640
phone, 280-pixel keyboard inset, and 1.5x text in both themes. No repositories,
services, routing packages, state-management packages, or dependencies were added.
See `TASK_003_REPORT.md` for verification and device checks.

## Vehicle Details (Task 004)

Tapping a card pushes the centralized `/vehicle-details` named route with a
typed record `({SampleVehicle vehicle, bool isDemo})`. The original vehicle object
comes from the existing Home dataset; no records or sample collection are copied.
Missing or malformed arguments display a recoverable No vehicle selected notice.

The screen shows make/model, temporary sample category, illustrative PHP daily
price, the shared Material vehicle placeholder, and a clear sample-data disclaimer.
No seating, fuel, transmission, mileage, or availability specifications are added.
Cards and Details share `VehicleSummary` to keep prices and illustration consistent.

Book This Vehicle now opens the local booking form (Task 005). Review and
confirmation (Task 006) create only an in-memory mock record, with no actual
reservation, backend, availability, or payment operation.

Details is pushed above Home, leaving its query, category, scroll, selected tab,
and demo session intact. Both app-bar Back and Android Back pop Details to the
same dashboard. The focused search field is unfocused before navigation so it
does not scroll itself into view on return. Identity and Exit Demo stay in Profile;
Home retains responsibility for demo cleanup. All debug-only gates remain.

The screen uses existing theme tokens, a 720-pixel content limit, and a scrollable
layout. Tests exercise 320x568 with 2x text in both themes, including DEMO and the
booking entry. A Login branding-row overflow found during Task 004 stress testing
was corrected in Task 009 by making the brand text flexible. Details layout tests
enter demo first, then apply these display settings on Details. See
`TASK_004_REPORT.md` for results, known limitations, and Android 12 checks.

## Booking form and confirmation (Tasks 005/006)

The existing form collects pickup/return dates/times and explicitly temporary
Sample branch A/B locations. Pickup must be future and return later than pickup.
Pricing remains centralized in RentalPricing: each started elapsed 24-hour period
uses the sample daily rate, without extra fees. These are temporary assumptions,
not approved business policies. Review reuses BookingSummary for the selected
vehicle, schedule, locations, elapsed duration, billed days, and estimated PHP cost.
Edit Booking or Back before confirming preserves the mounted form's values.

GFleetApp owns BookingStore (ChangeNotifier), exposed by BookingScope above the
Navigator. Home starts a visit and clears its records on Back, removal, or Exit
Demo; app disposal also clears the store. No data goes to device storage or a
backend. There are no seeded reservations or customer credentials in the store.

Confirm Mock Booking validates the schedule/locations again and saves an immutable
LocalBooking snapshot with a stable MOCK-000001-style reference and Local mock
status. Confirming the same draft object again returns its existing record without
another notification. References increment during the app instance and are not
global identifiers. A visit token rejects confirmations from an ended visit.

Success shows the reference and a View My Bookings action. Success button/Back
actions return true through the existing Review → Form → Details → Home stack;
Home selects the Task 007 live Bookings list. Task 008 adds ID-based Details.
Task 009 provides guest/demo Profile. Cancellation, staff approval, and actual
reservations remain unavailable.

Only Profile shows the fictional demo identity and Exit Demo. Existing debug
restrictions remain; Review/success use the shared compact DEMO chip. Guest
preview can create local examples without implying authentication. See
`TASK_006_REPORT.md` for checks/manual instructions and `BATCH_01_PROGRESS.md`
for the saved completion checkpoint. Android testing remains pending.

## My Bookings (Task 007)

The Bookings tab listens to the existing BookingStore via ListenableBuilder and
shows its confirmed LocalBooking records immediately. Cards show reference,
vehicle make/model, pickup and return schedule, stored estimated PHP quote,
Local mock status, and Not a real reservation. There is no separate collection,
seeded data, new booking status, status filter, or pricing change.

A derived presentation snapshot sorts creation time descending, with descending
stable ID as a tie-break. Cards use their booking IDs as widget keys. A lazy list
supports multiple records and retains the existing bottom navigation. Empty state
provides Browse Sample Vehicles, which selects the existing Home tab without a
route push or losing the dashboard's query/category/scroll state.

Cards now open the Task 008 Booking Details route by stable ID. No booking
operations exist. Store clearing updates both the list and open Details,
removing stale records/references. Existing Home-visit and demo-exit
cleanup remain unchanged; re-entry is empty. Guest preview invents no identity,
and demo identity stays Profile-only with the existing DEMO chip/debug gates.

See TASK_007_REPORT.md for actual results and the Android 12 checklist. Physical
Android testing for Tasks 005–009 remains pending owner verification; the combined
checklist is in BATCH_01_REPORT.md.

## Booking Details (Task 008)

Cards push `/booking-details` with `({String bookingId, bool isDemo})`. Details
looks up the current LocalBooking with BookingStore.findById and listens to store
changes; it never owns a second booking snapshot/store. Missing or malformed IDs
and cleared records display Booking Unavailable with a safe Back action. Both
app-bar and Android Back preserve the existing Bookings tab, records and scroll.

Details shows reference, make/model/category, Local mock status, both schedules
and temporary locations, stored elapsed duration/billed days/total, illustrative
daily rate, and a non-reservation disclaimer. BookingSummary now accepts an
optional stored RentalQuote; Details and saved Review success pass that snapshot,
while the existing form retains its original pricing behavior.

RentalSchedule computes only before-pickup, scheduled-window, and return-time-
passed phases. At pickup it switches to time until scheduled return; at return
it shows that the scheduled time has passed. No booking status or real handover
is inferred. Remaining time is shown in days/hours/rounded-up minutes. The UI
refreshes once per minute while relevant, pauses when the app is not resumed,
refreshes on resume, and cancels its timer/listener on disposal. Missing records
and past-return schedules stop the timer. Boundary display may lag up to one
refresh interval; all timing uses the device clock/local schedule.

DEMO stays debug-only on Details; name/email/Exit Demo remain Profile-only. No
pricing rules, real status transitions, backend calls or dependencies were added.
See TASK_008_REPORT.md for results, limits and the deferred Android checklist.

## Customer Profile (Task 009)

Profile distinguishes guest preview from the existing debug-only demo session.
Guests see no invented identity and can open the existing Login or Registration
screens. Those actions end the preview Home visit and clear its local bookings;
Registration keeps Login underneath for Back navigation. No hidden Home or second
session owner remains. Repeated queued navigation callbacks leave only once.

Demo Profile shows Alex Demo, customer@example.invalid, the temporary-account
notice and Exit Demo. Exit clears identity and local bookings and returns to
Login; re-entry starts empty. DEMO remains visible across customer screens while
identity stays Profile-only. Existing debug gates and auth behavior are unchanged.

My Bookings selects the existing tab, preserving catalog query/category/scroll.
Settings and support are explicitly unavailable, with no persistence or services.
The scrollable layout and guest auth entry are tested at 320x568 with 2x text in
both themes. AuthLayout's brand text now uses Flexible to avoid the previously
documented overflow. See TASK_009_REPORT.md and BATCH_01_REPORT.md for handoff.

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
logic, location services, messaging, SOS, or notifications are included. The
debug-only demo identity is fictional UI data with no backend access.

## Manual smoke check

1. Run on an Android 12 device or emulator and confirm the welcome screen opens.
2. Tap Continue and confirm the sample vehicle dashboard appears without DEMO.
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
Task 003 adds sample-card rendering/prices, filtering/clear/empty results,
informational selection, tab/scroll state retention, Profile-only demo identity,
persistent DEMO, and system Back cleanup. Task 004 adds card-to-details mapping,
Back/state retention, booking preview, invalid route input, details layouts, and
demo lifecycle regression coverage. Tasks 005/006 add pricing/form tests and
review/store/cleanup regressions. Task 007 adds 11 list/browse/order/notification/
selection/clearing/isolation/layout tests. Task 008 adds 8 schedule and 15 Details
tests. Task 009 adds 18 guest/demo Profile, navigation, cleanup and accessibility
tests. See TASK_009_REPORT.md for the final full-suite result.
They do not replace a physical-device test or Android APK build.

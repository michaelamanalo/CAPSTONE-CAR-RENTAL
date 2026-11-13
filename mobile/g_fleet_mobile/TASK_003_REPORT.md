# Task 003 — Customer Home screen

Date: November 8, 2026 (Asia/Manila)
Branch: FLUTTER-FRESH-START
Scope: mobile/g_fleet_mobile/ only

## Outcome

Replaced the Home placeholder with a Material 3 customer dashboard: G-FLEET
branding, welcome/introduction, prominent sample-data notice, local search,
category chips, and four interactive sample vehicle cards. The layout uses a
scrollable single column, wrapping chips, theme colors/typography, and a
centralized 720-logical-pixel maximum content width.

Persistent bottom navigation provides Home, Bookings, Messages, and Profile.
The latter three show clearly identified previews without business logic.
Task 003 is ready for owner testing; physical Android 12 validation remains
pending. Task 004 was not started.

## Initial inspection and preserved work

Verified FLUTTER-FRESH-START before edits. No AGENTS.md or nested AGENTS.md was
found. Reviewed the existing architecture, theme, router, Landing/Home, auth
screens, README, Task 001/002 reports, and Task 002.1 report/implementation.
The repository contained no approved vehicle taxonomy, fleet specifications,
or suitable licensed vehicle image assets.

Existing uncommitted Task 002.1 work was retained. In particular,
`lib/features/auth/demo/demo_customer_session.dart`,
`lib/features/auth/presentation/login_screen.dart`,
`lib/app/router/app_router.dart`, and `TASK_002_1_REPORT.md` were not changed by
Task 003. Their appearance in git status predates this implementation.
The previous 30-test baseline passed before Task 003.

## Files created or modified

Created:

- `lib/features/home/data/sample_vehicles.dart`: immutable sample vehicle model,
  four sample entries, and temporary categories.
- `lib/features/home/presentation/widgets/vehicle_dashboard.dart`: local search
  controller/category state, header, sample notice, filters, cards, empty state.
- `lib/features/home/presentation/widgets/vehicle_card.dart`: vehicle icon
  placeholder, descriptive text, sample rate, and informational selection dialog.
- `test/home_screen_test.dart`: ten dashboard widget tests.
- `docs/superpowers/plans/2026-11-08-task-003.md`: implementation/verification plan.
- `TASK_003_REPORT.md`: this complete handoff.

Modified:

- `lib/features/home/presentation/home_screen.dart`: customer tab shell,
  persistent app-bar DEMO indicator, Profile-only demo identity/exit, placeholders.
- `lib/app/theme/app_theme.dart`: centralized dashboard maximum width token.
- `test/demo_customer_test.dart`: adapted five existing demo tests and added two
  tests for persistent DEMO/Profile-only identity and system Back from Profile.
- `test/widget_test.dart`: startup/forward/back checks now assert dashboard entry.
- `test/auth_ui_test.dart`: valid auth submissions assert that HomeScreen is
  absent, avoiding an obsolete placeholder-copy assertion. All form checks remain.
- `README.md`: architecture, sample data, Home behavior, demo changes, verification.
- `docs/TASK_003_DESIGN.md`: updated the previously created design to reflect the
  owner's approved compact DEMO / Profile-only identity adjustment.

No package manifest/lockfile or Android build configuration changes. No
dependencies were added or upgraded.

## Mock data and temporary decisions

`SampleVehicle` contains final `make`, `model`, `category`, and
`dailyRatePesos` fields, with a derived combined name. The collection and category
list are const, feature-local data independent of presentation widgets.

| Example | Temporary category | Illustrative PHP/day |
| --- | --- | --- |
| Toyota Vios | Sedan | 1,800 |
| Honda City | Sedan | 2,000 |
| Toyota Innova | MPV | 3,000 |
| Mitsubishi Montero Sport | SUV | 3,500 |

These are frontend examples, not approved fleet records, real quotes, or
availability claims. A prominent dashboard notice says so; cards label sample
vehicles and illustrative prices. Seating/transmission/fuel specifications are
omitted because no approved requirements were available. Categories are explicitly
documented as temporary. Existing Material vehicle icons provide consistent image
placeholders; no remote image fetching or new image assets were introduced.

## Search, categories, and vehicle selection

Search trims surrounding whitespace, ignores case, and checks the combined make
and model. The selected category and query must both match. All removes the
category restriction. Clear search empties the query while retaining category.
Whitespace-only search behaves like an empty query.

No matches displays an empty state with guidance to change the query or category.
Cards respond to tapping anywhere on the card and display an informational dialog
identifying the selected sample. It explicitly states that vehicle details and
booking are unavailable and prices/availability are not connected. Got it closes
the dialog. No details route or booking workflow was created.

## Navigation and Task 002.1 compatibility

The existing `/home` route and `HomeScreen(demoSession: ...)` API are preserved.
Flutter NavigationBar and an IndexedStack manage four tabs without extra routes.
The dashboard retains its controller, category, and scroll position when switching
tabs. Selection is local to the Home visit and resets on re-entry. Tab switching
dismisses focus/the keyboard. Back leaves the Home route for its entry screen.

During a debug demo visit, a compact DEMO chip remains in the app bar on every
tab. Alex Demo, `customer@example.invalid`, the no-backend-access notice, and
Exit Demo are visible only in Profile. Exit Demo clears the original session
and pops Home, restoring Login. Existing navigation-finally and dispose cleanup
remain intact; app-bar Back, Android/system Back, and removing the app also clear
the session. Re-entry creates a fresh identity. No global session or persistence
was introduced.

Existing debug-only checks in the login button, login handler, router, session
constructor, and Home display are preserved. The constructor still throws outside
debug mode. This helper grants no backend authentication, tokens, roles, or
permissions. No real authentication was implemented or rewritten.

Landing > Continue > Home remains an unauthenticated preview with working search,
filters, cards, and tabs. It has no DEMO chip, fictional identity, or Exit Demo,
including in Profile. Auth validation, password visibility, and informational
submission behavior remain intact.

## Verification results

| Command/check | Actual result |
| --- | --- |
| `flutter pub get` | Passed; dependencies resolved |
| `dart format lib test` | Passed; final run: 21 files, 0 changed |
| `flutter analyze` | Passed: no issues found |
| `flutter test` | Passed: all 42 tests |
| `git diff --check` | Passed; no whitespace errors |
| Independent read-only code review, including final layout fix | No actionable findings |

The final 42 tests comprise 22 auth tests, 3 foundation/theme tests, 7 demo tests,
and 10 dashboard tests. This is 12 additional tests over the Task 002.1 baseline.
Coverage includes sample cards/prices, make/model search and normalization,
category filtering, combined filtering, clear behavior, empty results, dialog
selection/dismissal, navigation placeholders, preserved filters and scroll,
unauthenticated preview, demo entry without credentials, Profile-only identity
and Exit Demo, persistent DEMO across tabs, exit/back/removal cleanup, fresh
re-entry, and existing auth behavior.

Small-phone tests exercise 360x640 logical pixels with a simulated 280-pixel
keyboard inset and 1.5x text in both light and dark themes, checking reachable
content and layout exceptions. They are widget tests, not device validation.

Tests were added before dashboard implementation. The initial focused run failed
as expected against missing dashboard/search/tabs/Profile behavior (2 passed,
15 failed). The first implementation passed all 42 tests at default text size.
Extending the small-phone tests to 1.5x text exposed a one-pixel overflow in the
card's preview-label row in both themes. Constraining that label with Flexible
fixed it; the focused tests and final full 42-test suite passed. An initial
analysis style suggestion for optional collection children was corrected to
use a null-aware element; final analysis is clean.

Pub reports five newer package versions outside existing constraints; no upgrade
was attempted. Git emits LF-to-CRLF conversion warnings; these are not whitespace
check failures. No unresolved analysis or automated-test failures remain.

## Remaining limits and scope confirmation

- Task 003 has not been run on the physical Android 12 device by the agent.
- Profile/release APKs were not built or device-tested. Debug restrictions were
  inspected in code; widget tests run in debug mode.
- Categories, vehicles, and prices need approved business data before integration.
- Vehicle illustrations are intentional placeholders. Details, bookings,
  messaging, and profiles remain unavailable.
- Tab/filter/scroll state lasts for the current Home visit only.
- No database records, backend services, Supabase/Firebase clients, network
  operations, credentials, tokens, or real availability were added or modified.
- No booking, payment, tracking, notifications, messaging, or profile business
  logic was implemented.
- No web files or unrelated features were modified.
- All task edits are within mobile/g_fleet_mobile/.
- No commits, pushes, merges, branch switches, or Task 004 work occurred.

## Android 12 manual testing

From the repository root, with the owner's device connected and authorized:

```powershell
cd mobile/g_fleet_mobile
flutter run -d 35a01127
```

If an existing debug run is active, use uppercase `R` in its terminal to hot
restart and reset navigation before testing.

1. From Landing, tap Continue. Confirm branding, welcome, the sample-data notice,
   search, categories, and four sample cards. Confirm no DEMO chip or identity.
2. Scroll all cards. Check model, category, readable PHP daily rate, illustrative
   price label, icon placeholder, and visible preview affordance.
3. Search `  tOyOtA  `: expect Vios and Innova. Search `vios`: expect Vios only.
   Clear: expect all vehicles. Search an unknown name: check empty-state guidance.
4. Choose Sedan: expect Vios and City. Search Toyota: expect Vios only. Clear:
   expect the two sedans. Check SUV (Montero Sport), MPV (Innova), and All.
5. Select a card. Confirm the selected model and explicit informational dialog;
   Got it returns to the dashboard with no booking or details navigation.
6. Enter a query and category, visit Bookings/Messages/Profile, and return Home.
   Confirm placeholder notices, selected navigation destination, preserved query
   and category, and keyboard dismissal on tab changes. Scroll down, change tabs,
   and return to confirm preserved scroll position.
7. In preview Profile, confirm no fictional identity or Exit Demo. Use app-bar
   Back to Landing; repeat Continue and Android Back.
8. Open Login, leave credentials empty, and tap Continue as Demo Customer.
   Confirm the new dashboard opens without validation errors. Exercise filtering.
9. Visit every tab: DEMO must remain visible. Name, email, and Exit Demo must
   appear only in Profile. Verify no-backend-access text there.
10. In Profile, tap Exit Demo: confirm Login returns. Go Back to Landing and
    Continue: confirm no DEMO or identity, including in Profile.
11. Re-enter demo and leave via app-bar Back, then repeat using Android Back
    from Profile. Both return to Login. Re-entry must show a fresh demo identity.
12. Check Login, Registration, and Forgot Password validation and password
    visibility. Valid submissions must remain informational and stay on the form.
13. Repeat dashboard and demo checks in light/dark modes, with the keyboard open,
    and with enlarged Android text. Scroll to all controls and cards; check for
    overflow, readability, and reachable Profile Exit Demo.
14. Optional build-mode verification, stopping the current run first: run
    `flutter run --profile -d 35a01127`, then separately
    `flutter run --release -d 35a01127`. Confirm Demo Customer Login is absent
    and Landing > Continue still opens the unauthenticated dashboard. These
    build-mode checks have not been performed by the agent.

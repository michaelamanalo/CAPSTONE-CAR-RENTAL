# Task 003 proposed design

Scope: customer Home frontend only, inside `mobile/g_fleet_mobile/`.
No commits, branch changes, backend integration, or Task 004 work.

## Intent and layout

Replace Home's placeholder with a Material 3 customer dashboard using the
existing blue seed, theme typography, spacing, and system light/dark modes.
Keep the app-bar Back action and G-FLEET branding. Use a scrollable body with
a welcome heading, introduction, prominent sample-data notice, search field
with clear action, wrapping category chips, and interactive vehicle cards.
Constrain content width on larger displays; use a single readable column on
phones. Cards use consistent local Material vehicle icons as placeholders.

## Sample data and behavior

No approved vehicle taxonomy or vehicle specification documentation was found.
Use temporary Sedan, SUV, and MPV categories plus an All filter. Store a small
immutable sample collection and simple vehicle model separately from widgets
under the Home feature's data directory. Proposed examples: Toyota Vios,
Honda City, Toyota Innova, and Mitsubishi Montero Sport, with illustrative
daily PHP prices. Show category and model; omit unapproved specifications
such as seating and transmission rather than imply verified fleet details.
Label the collection and prices as sample data with no real availability.

Search trims input and matches vehicle make/name/model without case sensitivity.
Apply category and search together. An empty state explains that no sample
vehicles match. Clearing search retains the selected category. Selecting a
card opens an informational dialog saying details and booking are unavailable.

## Navigation and demo compatibility

Use a persistent Material NavigationBar: Home, Bookings, Messages, Profile.
Other tabs show explicitly labeled temporary placeholders. Keep tab selection,
search text, category, and Home scroll position in local widget state during
the visit. No nested route stacks, guards, or navigation dependency are needed.

Preserve HomeScreen's existing demoSession API and cleanup on disposal/exit.
Keep a compact DEMO chip in the app bar across all tabs. Place Alex Demo,
the fictional email, no-backend-access notice, and Exit Demo in Profile only.
This reflects the owner's approved adjustment. Keep all existing
debug gates in Login, routing, session construction, and Home display.
Preview entry has no customer identity or demo controls. Back returns to the
entry screen; Exit demo returns to Login and clears the session.

## Approaches

Recommended: retain the existing stateful Home route and add feature-local
data and small presentation widgets. This preserves session ownership and
requires no routing or authentication changes.

Alternative: separate named routes per tab. This adds route/session ownership
and back-stack complexity without a Task 003 requirement, so it is not proposed.

## Verification and delivery

Update tests that currently assert the old placeholder copy. Add meaningful
widget coverage for cards, search/clear, categories, combined filters, empty
results, informational selection, tab state retention, placeholders, and small
phone layouts with keyboard in both themes. Extend demo regression coverage
to the dashboard and tab switching, including persistent DEMO and exit cleanup.
Retain authentication validation and Landing/Back regression coverage.

Run flutter pub get, flutter analyze, flutter test, formatting, and diff checks.
Update README.md and create TASK_003_REPORT.md with actual command results,
test count, file list, limitations, and Android 12 manual checks. Physical-device
and profile/release checks will be reported as pending unless actually run.
No dependencies, external images, database operations, or web changes.

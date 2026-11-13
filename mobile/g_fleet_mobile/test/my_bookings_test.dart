import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'booking_form_test.dart' show tapVisible;
import 'booking_review_test.dart' show currentStore;
import 'booking_store_test.dart' show exampleDraft;
import 'demo_customer_test.dart' show openDemo;
import 'home_screen_test.dart' show openHome, chooseTab, chooseCategory;
import 'vehicle_details_test.dart' show dashboardScroll;

Future<void> openBookings(WidgetTester tester) async {
  await openHome(tester);
  await chooseTab(tester, 'Bookings');
}

void main() {
  testWidgets(
    'Guest Bookings is empty and Browse Vehicles uses the same Home route',
    (tester) async {
      await openBookings(tester);
      expect(find.text('My Bookings'), findsOneWidget);
      expect(find.text('No bookings yet'), findsOneWidget);
      expect(currentStore(tester).bookings, isEmpty);
      expect(find.text('DEMO'), findsNothing);
      expect(find.text('Alex Demo'), findsNothing);
      expect(find.text('customer@example.invalid'), findsNothing);
      await tapVisible(tester, find.text('Browse Sample Vehicles'));
      expect(find.text('Find your next ride'), findsOneWidget);
      expect(
        tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
        0,
      );
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Welcome to G-FLEET'), findsOneWidget);
    },
  );

  testWidgets(
    'Booking cards use the stored reference, vehicle, schedule, quote and Local mock status',
    (tester) async {
      await openBookings(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await tester.pumpAndSettle();
      expect(find.text('Reference: MOCK-000001'), findsOneWidget);
      expect(find.text('Toyota Vios'), findsOneWidget);
      expect(find.textContaining('January 2, 2040'), findsOneWidget);
      expect(find.textContaining('9:30 AM'), findsOneWidget);
      expect(find.textContaining('January 3, 2040'), findsOneWidget);
      expect(find.textContaining('3:45 PM'), findsOneWidget);
      expect(find.text('Estimated total: ₱3,600'), findsOneWidget);
      expect(find.text('Status: Local mock'), findsOneWidget);
      expect(find.text('Not a real reservation.'), findsOneWidget);
      expect(find.byKey(const ValueKey('MOCK-000001')), findsOneWidget);
      expect(find.text('No bookings yet'), findsNothing);
    },
  );

  testWidgets('Newest creation time is first with stable ID ordering on ties', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(800, 2400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await openBookings(tester);
    final store = currentStore(tester);
    for (final year in [2031, 2033, 2032, 2033]) {
      store.confirm(
        exampleDraft(),
        visitId: store.visitId,
        now: DateTime(year),
      );
    }
    await tester.pumpAndSettle();
    final tops = [
      for (final id in [
        'MOCK-000004',
        'MOCK-000002',
        'MOCK-000003',
        'MOCK-000001',
      ])
        tester.getTopLeft(find.byKey(ValueKey(id))).dy,
    ];
    expect(tops[0], lessThan(tops[1]));
    expect(tops[1], lessThan(tops[2]));
    expect(tops[2], lessThan(tops[3]));
    expect(store.bookings.map((b) => b.id), [
      'MOCK-000001',
      'MOCK-000002',
      'MOCK-000003',
      'MOCK-000004',
    ]);
  });

  testWidgets(
    'List reacts to a new confirmation without a tab or route change',
    (tester) async {
      await openBookings(tester);
      final store = currentStore(tester);
      expect(find.text('No bookings yet'), findsOneWidget);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await tester.pumpAndSettle();
      expect(find.text('Reference: MOCK-000001'), findsOneWidget);
      expect(
        tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
        1,
      );
      expect(find.byType(NavigationBar), findsOneWidget);
    },
  );

  testWidgets(
    'Selected booking opens its ID-based Details and returns to the list',
    (tester) async {
      await openBookings(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await tester.pumpAndSettle();
      await tapVisible(tester, find.byKey(const ValueKey('MOCK-000002')));
      expect(find.text('Booking details'), findsOneWidget);
      expect(find.text('Reference: MOCK-000002'), findsOneWidget);
      expect(find.textContaining('MOCK-000001'), findsNothing);
      await tester.binding.handlePopRoute();
      await tester.pumpAndSettle();
      expect(find.text('Booking details'), findsNothing);
      expect(find.text('Reference: MOCK-000002'), findsOneWidget);
      expect(
        tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
        1,
      );
    },
  );

  testWidgets(
    'Clearing store removes stale cards and open Details information',
    (tester) async {
      await openBookings(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await tester.pumpAndSettle();
      await tapVisible(tester, find.byKey(const ValueKey('MOCK-000001')));
      store.endVisit();
      await tester.pumpAndSettle();
      expect(
        find.text('This local mock booking is no longer available.'),
        findsOneWidget,
      );
      expect(find.textContaining('MOCK-000001'), findsNothing);
      expect(find.text('Booking Unavailable'), findsOneWidget);
      await tapVisible(tester, find.text('Back to My Bookings'));
      expect(find.text('No bookings yet'), findsOneWidget);
      expect(find.byKey(const ValueKey('MOCK-000001')), findsNothing);
    },
  );

  testWidgets('Guest Home termination and re-entry starts with an empty list', (
    tester,
  ) async {
    await openBookings(tester);
    final store = currentStore(tester);
    store.confirm(exampleDraft(), visitId: store.visitId);
    await tester.pumpAndSettle();
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(store.bookings, isEmpty);
    await tapVisible(tester, find.text('Continue'));
    await chooseTab(tester, 'Bookings');
    expect(find.text('No bookings yet'), findsOneWidget);
    expect(find.textContaining('MOCK-000001'), findsNothing);
  });

  testWidgets(
    'Demo exit clears displayed records and re-entry keeps identity Profile-only',
    (tester) async {
      await openDemo(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await chooseTab(tester, 'Bookings');
      expect(find.text('Reference: MOCK-000001'), findsOneWidget);
      expect(find.text('DEMO').hitTestable(), findsOneWidget);
      expect(find.text('Alex Demo'), findsNothing);
      await chooseTab(tester, 'Profile');
      await tapVisible(tester, find.text('Exit Demo'));
      expect(store.bookings, isEmpty);
      expect(find.text('Welcome back'), findsOneWidget);
      await tapVisible(tester, find.text('Continue as Demo Customer'));
      await chooseTab(tester, 'Bookings');
      expect(find.text('No bookings yet'), findsOneWidget);
      expect(find.textContaining('MOCK-000001'), findsNothing);
      expect(find.text('DEMO').hitTestable(), findsOneWidget);
    },
  );

  testWidgets('Browse preserves dashboard query, category and nonzero scroll', (
    tester,
  ) async {
    await openHome(tester);
    await chooseCategory(tester, 'Sedan');
    await tester.enterText(find.byType(TextField), ' o ');
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Honda City'));
    await tester.pumpAndSettle();
    final offset = dashboardScroll(tester).position.pixels;
    expect(offset, greaterThan(0));
    await chooseTab(tester, 'Bookings');
    await tapVisible(tester, find.text('Browse Sample Vehicles'));
    expect(dashboardScroll(tester).position.pixels, closeTo(offset, 0.1));
    expect(
      tester.widget<TextField>(find.byType(TextField)).controller!.text,
      ' o ',
    );
    expect(
      tester
          .widget<ChoiceChip>(find.widgetWithText(ChoiceChip, 'Sedan'))
          .selected,
      isTrue,
    );
    expect(find.text('Honda City').hitTestable(), findsOneWidget);
  });

  for (final brightness in Brightness.values) {
    testWidgets(
      'Multiple bookings and Details work at 320px/2x text in ${brightness.name}',
      (tester) async {
        await openDemo(tester);
        final store = currentStore(tester);
        for (var i = 0; i < 12; i++) {
          store.confirm(exampleDraft(), visitId: store.visitId);
        }
        await chooseTab(tester, 'Bookings');
        tester.view.physicalSize = const Size(320, 568);
        tester.view.devicePixelRatio = 1;
        tester.platformDispatcher.textScaleFactorTestValue = 2;
        tester.platformDispatcher.platformBrightnessTestValue = brightness;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
        addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
        await tester.pumpAndSettle();
        final scrollable = find
            .descendant(
              of: find.byKey(const PageStorageKey('my-bookings')),
              matching: find.byType(Scrollable),
            )
            .first;
        final lastCard = find.byKey(const ValueKey('MOCK-000001'));
        final action = find.descendant(
          of: lastCard,
          matching: find.text('View booking details'),
        );
        for (
          var attempt = 0;
          attempt < 100 && action.hitTestable().evaluate().isEmpty;
          attempt++
        ) {
          await tester.drag(scrollable, const Offset(0, -300));
          await tester.pumpAndSettle();
        }
        expect(action.hitTestable(), findsOneWidget);
        await tester.tap(action);
        await tester.pumpAndSettle();
        expect(find.text('Booking details'), findsOneWidget);
        await tester.pageBack();
        await tester.pumpAndSettle();
        expect(find.text('DEMO').hitTestable(), findsOneWidget);
        expect(
          Theme.of(tester.element(find.byType(NavigationBar))).brightness,
          brightness,
        );
        expect(tester.takeException(), isNull);
      },
    );
  }
}

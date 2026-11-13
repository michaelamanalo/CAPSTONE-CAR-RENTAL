import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/features/bookings/domain/booking_draft.dart';
import 'package:g_fleet_mobile/features/bookings/domain/rental_pricing.dart';
import 'package:g_fleet_mobile/features/bookings/presentation/widgets/booking_summary.dart';
import 'package:g_fleet_mobile/features/home/data/sample_vehicles.dart';

import 'booking_form_test.dart' show tapVisible;
import 'booking_review_test.dart' show currentStore;
import 'booking_store_test.dart' show exampleDraft;
import 'demo_customer_test.dart' show openDemo;
import 'home_screen_test.dart' show chooseTab;
import 'my_bookings_test.dart' show openBookings;

Finder get bookingScroll => find
    .descendant(
      of: find.byKey(const PageStorageKey('my-bookings')),
      matching: find.byType(Scrollable),
    )
    .first;

Future<void> openStoredBooking(WidgetTester tester, String id) async {
  final action = find.descendant(
    of: find.byKey(ValueKey(id)),
    matching: find.text('View booking details'),
  );
  for (
    var attempt = 0;
    attempt < 100 && action.hitTestable().evaluate().isEmpty;
    attempt++
  ) {
    await tester.drag(bookingScroll, const Offset(0, -300));
    await tester.pumpAndSettle();
  }
  expect(action.hitTestable(), findsOneWidget);
  await tester.tap(action);
  await tester.pumpAndSettle();
}

void main() {
  testWidgets(
    'Card opens the correct ID with full vehicle, schedule and stored pricing',
    (tester) async {
      await openBookings(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      store.confirm(
        BookingDraft(
          vehicle: sampleVehicles[1],
          pickup: DateTime(2040, 1, 2, 9, 30),
          returnAt: DateTime(2040, 1, 3, 15, 45),
          pickupLocation: 'Sample branch B',
          returnLocation: 'Sample branch A',
        ),
        visitId: store.visitId,
      );
      await tester.pumpAndSettle();
      await openStoredBooking(tester, 'MOCK-000002');
      expect(find.text('Booking details'), findsOneWidget);
      expect(find.text('Reference: MOCK-000002'), findsOneWidget);
      expect(find.textContaining('MOCK-000001'), findsNothing);
      expect(find.text('Honda City'), findsOneWidget);
      expect(find.text('Category: Sedan'), findsOneWidget);
      expect(find.textContaining('January 2, 2040'), findsOneWidget);
      expect(find.textContaining('9:30 AM'), findsOneWidget);
      expect(find.textContaining('January 3, 2040'), findsOneWidget);
      expect(find.textContaining('3:45 PM'), findsOneWidget);
      expect(
        find.text('Pickup location (temporary): Sample branch B'),
        findsOneWidget,
      );
      expect(
        find.text('Return location (temporary): Sample branch A'),
        findsOneWidget,
      );
      expect(find.text('Rental duration: 30h 15m'), findsOneWidget);
      expect(find.text('Billed duration: 2 days'), findsOneWidget);
      expect(find.text('Illustrative daily rate: ₱2,000'), findsOneWidget);
      expect(find.text('Estimated total: ₱4,000'), findsOneWidget);
      expect(find.text('Status: Local mock'), findsOneWidget);
      expect(find.textContaining('Not a real reservation'), findsOneWidget);
      expect(find.text('DEMO'), findsNothing);
      await tester.pageBack();
      await tester.pumpAndSettle();
    },
  );

  testWidgets(
    'BookingSummary uses a supplied stored quote without recomputing it',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: BookingSummary(
              draft: exampleDraft(),
              quote: const RentalQuote(Duration(hours: 48), 7, 12345),
            ),
          ),
        ),
      );
      expect(find.text('Rental duration: 48h 0m'), findsOneWidget);
      expect(find.text('Billed duration: 7 days'), findsOneWidget);
      expect(find.text('Estimated total: ₱12,345'), findsOneWidget);
      expect(find.text('Estimated total: ₱3,600'), findsNothing);
    },
  );

  for (final systemBack in [false, true]) {
    testWidgets(
      '${systemBack ? 'System' : 'App-bar'} Back keeps My Bookings list, tab and scroll',
      (tester) async {
        await openBookings(tester);
        final store = currentStore(tester);
        for (var i = 0; i < 8; i++) {
          store.confirm(exampleDraft(), visitId: store.visitId);
        }
        await tester.pumpAndSettle();
        // Move to the oldest card with real gestures before opening Details.
        final action = find.descendant(
          of: find.byKey(const ValueKey('MOCK-000001')),
          matching: find.text('View booking details'),
        );
        for (
          var i = 0;
          i < 100 && action.hitTestable().evaluate().isEmpty;
          i++
        ) {
          await tester.drag(bookingScroll, const Offset(0, -300));
          await tester.pumpAndSettle();
        }
        final offset = tester
            .state<ScrollableState>(bookingScroll)
            .position
            .pixels;
        expect(offset, greaterThan(0));
        await tester.tap(action);
        await tester.pumpAndSettle();
        expect(find.text('Booking details'), findsOneWidget);
        if (systemBack) {
          await tester.binding.handlePopRoute();
        } else {
          await tester.pageBack();
        }
        await tester.pumpAndSettle();
        expect(
          tester
              .widget<NavigationBar>(find.byType(NavigationBar))
              .selectedIndex,
          1,
        );
        expect(
          tester.state<ScrollableState>(bookingScroll).position.pixels,
          closeTo(offset, 0.1),
        );
        expect(store.bookings.length, 8);
        expect(action.hitTestable(), findsOneWidget);
        await tester.pageBack();
        await tester.pumpAndSettle();
        expect(find.text('Welcome to G-FLEET'), findsOneWidget);
      },
    );
  }

  for (final arguments in [null, 17, (bookingId: 'missing', isDemo: false)]) {
    testWidgets(
      'Missing or malformed ID $arguments displays safe unavailable state',
      (tester) async {
        await openBookings(tester);
        Navigator.of(tester.element(find.byType(NavigationBar)))
            .pushNamed('/booking-details', arguments: arguments);
        await tester.pumpAndSettle();
        expect(find.text('Booking Unavailable'), findsOneWidget);
        expect(
          find.text('This local mock booking is no longer available.'),
          findsOneWidget,
        );
        await tapVisible(tester, find.text('Back to My Bookings'));
        expect(find.text('No bookings yet'), findsOneWidget);
        expect(
          tester
              .widget<NavigationBar>(find.byType(NavigationBar))
              .selectedIndex,
          1,
        );
        expect(tester.takeException(), isNull);
      },
    );
  }

  testWidgets('Store clearing while Details is open removes all stale fields', (
    tester,
  ) async {
    await openBookings(tester);
    final store = currentStore(tester);
    store.confirm(exampleDraft(), visitId: store.visitId);
    await tester.pumpAndSettle();
    await openStoredBooking(tester, 'MOCK-000001');
    store.endVisit();
    await tester.pumpAndSettle();
    expect(find.text('Booking Unavailable'), findsOneWidget);
    expect(find.textContaining('MOCK-000001'), findsNothing);
    expect(find.text('Toyota Vios'), findsNothing);
    expect(find.textContaining('₱3,600'), findsNothing);
    await tapVisible(tester, find.text('Back to My Bookings'));
    expect(find.text('No bookings yet'), findsOneWidget);
  });

  for (final phase in ['pickup', 'return', 'passed']) {
    testWidgets(
      'Details shows schedule-only $phase indicator without changing Local mock',
      (tester) async {
        await openBookings(tester);
        final store = currentStore(tester);
        final now = DateTime.now();
        final pickup = phase == 'pickup'
            ? now.add(const Duration(hours: 1))
            : now.subtract(const Duration(hours: 1));
        final returnAt = phase == 'passed'
            ? now.subtract(const Duration(minutes: 30))
            : now.add(const Duration(hours: 2));
        final booking = store.confirm(
          exampleDraft(pickup: pickup, returnAt: returnAt),
          visitId: store.visitId,
          now: pickup.subtract(const Duration(minutes: 1)),
        );
        await tester.pumpAndSettle();
        await openStoredBooking(tester, booking.id);
        expect(
          find.textContaining(switch (phase) {
            'pickup' => 'Until scheduled pickup:',
            'return' => 'Until scheduled return:',
            _ => 'Scheduled return time has passed.',
          }),
          findsOneWidget,
        );
        expect(find.textContaining('Schedule only'), findsOneWidget);
        expect(booking.status, 'Local mock');
        await tester.pageBack();
        await tester.pumpAndSettle();
      },
    );
  }

  testWidgets(
    'Closing app with Details open cancels refresh and clears local records',
    (tester) async {
      await openBookings(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await tester.pumpAndSettle();
      await openStoredBooking(tester, 'MOCK-000001');
      await tester.pump(const Duration(minutes: 1));
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump(const Duration(minutes: 2));
      expect(store.bookings, isEmpty);
      expect(tester.takeException(), isNull);
    },
  );

  for (final brightness in Brightness.values) {
    testWidgets(
      'Demo Booking Details scrolls at 320px/2x in ${brightness.name}',
      (tester) async {
        await openDemo(tester);
        final store = currentStore(tester);
        store.confirm(exampleDraft(), visitId: store.visitId);
        await chooseTab(tester, 'Bookings');
        await openStoredBooking(tester, 'MOCK-000001');
        tester.view.physicalSize = const Size(320, 568);
        tester.view.devicePixelRatio = 1;
        tester.platformDispatcher.textScaleFactorTestValue = 2;
        tester.platformDispatcher.platformBrightnessTestValue = brightness;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
        addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
        await tester.pumpAndSettle();
        expect(find.text('DEMO').hitTestable(), findsOneWidget);
        expect(find.text('Alex Demo'), findsNothing);
        await tester.ensureVisible(find.text('Estimated total: ₱3,600'));
        await tester.pumpAndSettle();
        expect(
          find.text('Estimated total: ₱3,600').hitTestable(),
          findsOneWidget,
        );
        expect(
          Theme.of(tester.element(find.byType(Scaffold))).brightness,
          brightness,
        );
        expect(tester.takeException(), isNull);
        await tester.pageBack();
        await tester.pumpAndSettle();
      },
    );
  }

  testWidgets(
    'Returning from demo Details preserves Profile exit and session isolation',
    (tester) async {
      await openDemo(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await chooseTab(tester, 'Bookings');
      await openStoredBooking(tester, 'MOCK-000001');
      expect(find.text('DEMO'), findsOneWidget);
      expect(find.text('Exit Demo'), findsNothing);
      await tester.pageBack();
      await tester.pumpAndSettle();
      await chooseTab(tester, 'Profile');
      await tapVisible(tester, find.text('Exit Demo'));
      expect(store.bookings, isEmpty);
      expect(find.text('Welcome back'), findsOneWidget);
    },
  );
}

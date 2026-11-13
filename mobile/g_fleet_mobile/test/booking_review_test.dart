import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/features/bookings/data/booking_store.dart';
import 'package:g_fleet_mobile/features/bookings/presentation/booking_scope.dart';

import 'booking_form_test.dart'
    show openBookingForm, fillBookingForm, tapVisible;
import 'booking_store_test.dart' show exampleDraft;
import 'demo_customer_test.dart' show openDemo;
import 'home_screen_test.dart' show openHome, chooseTab;
import 'vehicle_details_test.dart' show openVehicle;

BookingStore currentStore(WidgetTester tester) =>
    BookingScope.read(tester.element(find.byType(Scaffold).first));

Future<void> openReview(WidgetTester tester, {bool demo = false}) async {
  if (demo) {
    await openDemo(tester);
    await openVehicle(tester, 'Toyota Vios');
    await tapVisible(tester, find.text('Book This Vehicle'));
  } else {
    await openBookingForm(tester);
  }
  await fillBookingForm(tester);
  await tapVisible(tester, find.text('Continue to Review'));
}

void main() {
  testWidgets(
    'Review displays selected vehicle, exact schedule, locations and estimate',
    (tester) async {
      await openHome(tester);
      Navigator.of(tester.element(find.byType(NavigationBar))).pushNamed(
        '/booking-review',
        arguments: (draft: exampleDraft(), isDemo: false),
      );
      await tester.pumpAndSettle();
      expect(find.text('Review booking'), findsOneWidget);
      expect(find.text('Toyota Vios'), findsOneWidget);
      expect(find.textContaining('January 2, 2040'), findsOneWidget);
      expect(find.textContaining('9:30 AM'), findsOneWidget);
      expect(find.textContaining('January 3, 2040'), findsOneWidget);
      expect(find.textContaining('3:45 PM'), findsOneWidget);
      expect(
        find.text('Pickup location (temporary): Sample branch A'),
        findsOneWidget,
      );
      expect(
        find.text('Return location (temporary): Sample branch B'),
        findsOneWidget,
      );
      expect(find.text('Rental duration: 30h 15m'), findsOneWidget);
      expect(find.text('Billed duration: 2 days'), findsOneWidget);
      expect(find.text('Estimated total: ₱3,600'), findsOneWidget);
      expect(find.textContaining('No actual reservation'), findsOneWidget);
      expect(currentStore(tester).bookings, isEmpty);
    },
  );
  testWidgets(
    'Edit Booking preserves every form selection without saving a booking',
    (tester) async {
      await openReview(tester);
      await tapVisible(tester, find.text('Edit Booking'));
      expect(find.text('Booking form'), findsOneWidget);
      expect(find.text('Sample branch A'), findsNWidgets(2));
      expect(find.textContaining('Choose date'), findsNothing);
      expect(find.textContaining('Choose time'), findsNothing);
      expect(find.text('Estimated total: ₱1,800'), findsOneWidget);
      expect(currentStore(tester).bookings, isEmpty);
      await tapVisible(tester, find.text('Continue to Review'));
      expect(find.text('Review booking'), findsOneWidget);
    },
  );
  testWidgets('Repeated taps confirm once and success opens My Bookings', (
    tester,
  ) async {
    await openReview(tester);
    final store = currentStore(tester);
    await tester.ensureVisible(find.text('Confirm Mock Booking'));
    await tester.tap(find.text('Confirm Mock Booking'));
    await tester.tap(find.text('Confirm Mock Booking'));
    await tester.pumpAndSettle();
    expect(find.text('Mock booking saved'), findsOneWidget);
    expect(find.text('Reference: MOCK-000001'), findsOneWidget);
    expect(store.bookings.length, 1);
    expect(find.text('Confirm Mock Booking'), findsNothing);
    await tapVisible(tester, find.text('View My Bookings'));
    expect(find.text('My Bookings'), findsOneWidget);
    expect(find.text('Reference: MOCK-000001'), findsOneWidget);
    expect(find.text('Toyota Vios'), findsOneWidget);
    expect(
      tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
      1,
    );
    expect(store.bookings.length, 1);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Welcome to G-FLEET'), findsOneWidget);
    expect(store.bookings, isEmpty);
    await tapVisible(tester, find.text('Continue'));
    expect(currentStore(tester).bookings, isEmpty);
  });
  testWidgets('System Back after success follows the same return contract', (
    tester,
  ) async {
    await openReview(tester);
    await tapVisible(tester, find.text('Confirm Mock Booking'));
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(find.text('My Bookings'), findsOneWidget);
    expect(currentStore(tester).bookings.length, 1);
  });
  testWidgets(
    'Queued success callbacks return once without popping Home or clearing records',
    (tester) async {
      await openReview(tester);
      final store = currentStore(tester);
      await tapVisible(tester, find.text('Confirm Mock Booking'));
      // Exercise already-queued actions even after the outgoing route stops hit testing.
      final action = tester
          .widget<FilledButton>(
            find.widgetWithText(FilledButton, 'View My Bookings'),
          )
          .onPressed!;
      action();
      action();
      await tester.pumpAndSettle();
      expect(find.text('My Bookings'), findsOneWidget);
      expect(store.bookings.length, 1);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Demo review keeps DEMO and Profile exit clears bookings and identity',
    (tester) async {
      await openReview(tester, demo: true);
      final store = currentStore(tester);
      expect(find.text('DEMO').hitTestable(), findsOneWidget);
      expect(find.text('Alex Demo'), findsNothing);
      await tapVisible(tester, find.text('Confirm Mock Booking'));
      expect(find.text('DEMO').hitTestable(), findsOneWidget);
      await tapVisible(tester, find.text('View My Bookings'));
      await chooseTab(tester, 'Profile');
      expect(find.text('Alex Demo'), findsOneWidget);
      await tapVisible(tester, find.text('Exit Demo'));
      expect(find.text('Welcome back'), findsOneWidget);
      expect(store.bookings, isEmpty);
      await tapVisible(tester, find.text('Continue as Demo Customer'));
      expect(currentStore(tester).bookings, isEmpty);
    },
  );
  testWidgets('Removing app during confirmed review clears mock records', (
    tester,
  ) async {
    await openReview(tester, demo: true);
    final store = currentStore(tester);
    await tapVisible(tester, find.text('Confirm Mock Booking'));
    expect(store.bookings.length, 1);
    await tester.pumpWidget(const SizedBox.shrink());
    expect(store.bookings, isEmpty);
  });
  testWidgets('Review rejects missing route data and Back remains usable', (
    tester,
  ) async {
    await openHome(tester);
    Navigator.of(tester.element(find.byType(NavigationBar)))
        .pushNamed('/booking-review');
    await tester.pumpAndSettle();
    expect(find.text('No booking draft selected'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byType(NavigationBar), findsOneWidget);
  });
  for (final brightness in Brightness.values) {
    testWidgets(
      'Review and success scroll at 320px and 2x text in ${brightness.name}',
      (tester) async {
        await openReview(tester, demo: true);
        tester.view.physicalSize = const Size(320, 568);
        tester.view.devicePixelRatio = 1;
        tester.platformDispatcher.textScaleFactorTestValue = 2;
        tester.platformDispatcher.platformBrightnessTestValue = brightness;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
        addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
        await tester.pumpAndSettle();
        await tapVisible(tester, find.text('Confirm Mock Booking'));
        expect(find.text('Mock booking saved'), findsOneWidget);
        expect(find.text('DEMO').hitTestable(), findsOneWidget);
        await tester.ensureVisible(find.text('View My Bookings'));
        expect(find.text('View My Bookings').hitTestable(), findsOneWidget);
        expect(
          Theme.of(tester.element(find.byType(Scaffold))).brightness,
          brightness,
        );
        expect(tester.takeException(), isNull);
      },
    );
  }
}

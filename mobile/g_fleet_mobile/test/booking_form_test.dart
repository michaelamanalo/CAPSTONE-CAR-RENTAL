import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'home_screen_test.dart' show openHome;
import 'vehicle_details_test.dart' show openVehicle;

Future<void> tapVisible(WidgetTester tester, Finder finder) async {
  await tester.ensureVisible(finder);
  await tester.tap(finder);
  await tester.pumpAndSettle();
}

Future<void> openBookingForm(WidgetTester tester) async {
  await openHome(tester);
  await openVehicle(tester, 'Toyota Vios');
  await tapVisible(tester, find.text('Book This Vehicle'));
}

Future<void> fillBookingForm(WidgetTester tester) async {
  for (final key in [
    'pickup-date',
    'pickup-time',
    'return-date',
    'return-time',
  ]) {
    await tapVisible(tester, find.byKey(ValueKey(key)));
    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();
  }
  for (final key in ['pickup-location', 'return-location']) {
    await tapVisible(tester, find.byKey(ValueKey(key)));
    await tester.tap(find.text('Sample branch A').last);
    await tester.pumpAndSettle();
  }
}

void main() {
  testWidgets('Details opens local booking form for selected vehicle', (
    tester,
  ) async {
    await openBookingForm(tester);
    expect(find.text('Booking form'), findsOneWidget);
    expect(find.text('Toyota Vios'), findsOneWidget);
    expect(find.textContaining('Temporary billing'), findsOneWidget);
    expect(find.text('Continue to Review'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Vehicle details'), findsOneWidget);
  });
  testWidgets('Missing schedule is rejected without leaving form', (
    tester,
  ) async {
    await openBookingForm(tester);
    await tapVisible(tester, find.text('Continue to Review'));
    expect(
      find.text('Choose pickup and return dates and times.'),
      findsOneWidget,
    );
    expect(find.text('Booking form'), findsOneWidget);
  });
  testWidgets(
    'Complete form calculates estimate and continues with input preserved',
    (tester) async {
      await openBookingForm(tester);
      await fillBookingForm(tester);
      expect(find.text('Billed duration: 1 day'), findsOneWidget);
      expect(find.text('Estimated total: ₱1,800'), findsOneWidget);
      await tapVisible(tester, find.text('Continue to Review'));
      expect(find.text('Review booking'), findsOneWidget);
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Booking form'), findsOneWidget);
      expect(find.text('Estimated total: ₱1,800'), findsOneWidget);
      expect(find.text('Sample branch A'), findsNWidgets(2));
    },
  );
}

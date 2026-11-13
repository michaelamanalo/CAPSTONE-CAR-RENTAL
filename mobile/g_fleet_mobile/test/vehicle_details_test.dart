import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/features/home/data/sample_vehicles.dart';
import 'package:g_fleet_mobile/features/home/presentation/home_screen.dart';

import 'home_screen_test.dart' show openHome, chooseCategory, chooseTab;
import 'demo_customer_test.dart' show openDemo, tapText;

Future<void> openVehicle(WidgetTester tester, String name) async {
  final cardName = find.text(name);
  await tester.ensureVisible(cardName);
  await tester.tap(cardName);
  await tester.pumpAndSettle();
}

ScrollableState dashboardScroll(WidgetTester tester) =>
    tester.state<ScrollableState>(
      find
          .descendant(
            of: find.byKey(const PageStorageKey('vehicle-dashboard')),
            matching: find.byType(Scrollable),
          )
          .first,
    );

void main() {
  for (final example in [
    (name: 'Toyota Vios', category: 'Sedan', price: '₱1,800 / day'),
    (name: 'Honda City', category: 'Sedan', price: '₱2,000 / day'),
    (name: 'Toyota Innova', category: 'MPV', price: '₱3,000 / day'),
    (name: 'Mitsubishi Montero Sport', category: 'SUV', price: '₱3,500 / day'),
  ]) {
    testWidgets('${example.name} card opens its matching sample details', (
      tester,
    ) async {
      await openHome(tester);
      await openVehicle(tester, example.name);
      expect(find.text('Vehicle details'), findsOneWidget);
      expect(find.text(example.name), findsOneWidget);
      expect(find.text('${example.category} • Sample vehicle'), findsOneWidget);
      expect(find.text(example.price), findsOneWidget);
      expect(find.text('Illustrative price'), findsOneWidget);
      expect(
        find.bySemanticsLabel('Vehicle image placeholder'),
        findsOneWidget,
      );
      expect(find.textContaining('Sample data only.'), findsOneWidget);
      expect(find.text('Book This Vehicle'), findsOneWidget);
      expect(find.text('DEMO'), findsNothing);
      expect(find.byType(NavigationBar), findsNothing);
      expect(tester.takeException(), isNull);
    });
  }

  for (final systemBack in [false, true]) {
    testWidgets(
      '${systemBack ? 'System' : 'App-bar'} Back preserves dashboard filters, scroll and tab',
      (tester) async {
        await openHome(tester);
        await chooseCategory(tester, 'Sedan');
        await tester.enterText(find.byType(TextField), ' o ');
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.text('Honda City'));
        await tester.pumpAndSettle();
        final offset = dashboardScroll(tester).position.pixels;
        expect(offset, greaterThan(0));
        await openVehicle(tester, 'Honda City');
        if (systemBack) {
          await tester.binding.handlePopRoute();
        } else {
          await tester.pageBack();
        }
        await tester.pumpAndSettle();
        expect(find.byType(NavigationBar), findsOneWidget);
        expect(
          tester
              .widget<NavigationBar>(find.byType(NavigationBar))
              .selectedIndex,
          0,
        );
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
        expect(find.text('Toyota Innova'), findsNothing);
        expect(find.text('Honda City').hitTestable(), findsOneWidget);
        expect(tester.testTextInput.isVisible, isFalse);
      },
    );
  }

  testWidgets('Popping Details preserves a previously selected non-Home tab', (
    tester,
  ) async {
    await openHome(tester);
    await chooseTab(tester, 'Messages');
    Navigator.of(tester.element(find.byType(NavigationBar))).pushNamed(
      '/vehicle-details',
      arguments: (vehicle: sampleVehicles.first, isDemo: false),
    );
    await tester.pumpAndSettle();
    expect(find.text('Vehicle details'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Messages preview'), findsOneWidget);
    expect(
      tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
      2,
    );
  });

  testWidgets(
    'Book This Vehicle opens a local form and Back returns to Details',
    (tester) async {
      await openHome(tester);
      await openVehicle(tester, 'Toyota Vios');
      await tester.ensureVisible(find.text('Book This Vehicle'));
      await tester.tap(find.text('Book This Vehicle'));
      await tester.pumpAndSettle();
      expect(find.text('Booking form'), findsOneWidget);
      expect(find.textContaining('Local mock booking only.'), findsOneWidget);
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.byType(AlertDialog), findsNothing);
      expect(find.text('Vehicle details'), findsOneWidget);
      expect(find.text('Toyota Vios'), findsOneWidget);
    },
  );

  for (final brightness in Brightness.values) {
    testWidgets(
      'Details scrolls on a small phone with large text in ${brightness.name}',
      (tester) async {
        await openDemo(tester);
        await openVehicle(tester, 'Mitsubishi Montero Sport');
        tester.view.physicalSize = const Size(320, 568);
        tester.view.devicePixelRatio = 1;
        tester.platformDispatcher.platformBrightnessTestValue = brightness;
        tester.platformDispatcher.textScaleFactorTestValue = 2;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
        addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
        await tester.pumpAndSettle();
        expect(find.text('DEMO').hitTestable(), findsOneWidget);
        expect(
          Theme.of(tester.element(find.byType(Scaffold))).brightness,
          brightness,
        );
        await tester.ensureVisible(find.text('Book This Vehicle'));
        await tester.pumpAndSettle();
        expect(find.text('Book This Vehicle').hitTestable(), findsOneWidget);
        await tester.tap(find.text('Book This Vehicle'));
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.text('Continue to Review'));
        expect(find.text('Continue to Review').hitTestable(), findsOneWidget);
        await tester.pageBack();
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        await tester.pageBack();
        await tester.pumpAndSettle();
        expect(find.byType(NavigationBar), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );
  }

  testWidgets(
    'Demo Details retains DEMO and original session until Profile exit',
    (tester) async {
      await openDemo(tester);
      final session = tester
          .widget<HomeScreen>(find.byType(HomeScreen))
          .demoSession!;
      await openVehicle(tester, 'Toyota Innova');
      expect(find.text('Vehicle details'), findsOneWidget);
      expect(find.text('DEMO').hitTestable(), findsOneWidget);
      expect(find.text('Alex Demo'), findsNothing);
      expect(find.text('customer@example.invalid'), findsNothing);
      expect(find.text('Exit Demo'), findsNothing);
      expect(session.customer, isNotNull);
      await tester.binding.handlePopRoute();
      await tester.pumpAndSettle();
      expect(
        identical(
          tester.widget<HomeScreen>(find.byType(HomeScreen)).demoSession,
          session,
        ),
        isTrue,
      );
      expect(session.customer, isNotNull);
      expect(find.text('DEMO'), findsOneWidget);
      await chooseTab(tester, 'Profile');
      expect(find.text('Alex Demo'), findsOneWidget);
      await tapText(tester, 'Exit Demo');
      expect(session.customer, isNull);
      expect(find.text('Welcome back'), findsOneWidget);
    },
  );

  testWidgets(
    'Removing the app from Details still clears the Home demo session',
    (tester) async {
      await openDemo(tester);
      final session = tester
          .widget<HomeScreen>(find.byType(HomeScreen))
          .demoSession!;
      await openVehicle(tester, 'Toyota Vios');
      expect(find.text('Vehicle details'), findsOneWidget);
      await tester.pumpWidget(const SizedBox.shrink());
      expect(session.customer, isNull);
    },
  );

  for (final arguments in [null, 'not a vehicle']) {
    testWidgets('Invalid Details argument $arguments is recoverable', (
      tester,
    ) async {
      await openHome(tester);
      Navigator.of(tester.element(find.byType(NavigationBar)))
          .pushNamed('/vehicle-details', arguments: arguments);
      await tester.pumpAndSettle();
      expect(find.text('No vehicle selected'), findsOneWidget);
      expect(find.text('Book This Vehicle'), findsNothing);
      expect(tester.takeException(), isNull);
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.byType(NavigationBar), findsOneWidget);
    });
  }
}

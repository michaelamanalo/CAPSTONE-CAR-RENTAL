import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/app/app.dart';

Future<void> openHome(WidgetTester tester) async {
  await tester.pumpWidget(const GFleetApp());
  await tester.tap(find.text('Continue'));
  await tester.pumpAndSettle();
}

Future<void> chooseCategory(WidgetTester tester, String name) async {
  final chip = find.widgetWithText(ChoiceChip, name);
  await tester.ensureVisible(chip);
  await tester.tap(chip);
  await tester.pumpAndSettle();
}

Future<void> chooseTab(WidgetTester tester, String name) async {
  await tester.tap(
    find.descendant(of: find.byType(NavigationBar), matching: find.text(name)),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('Home renders sample cards with illustrative PHP prices', (
    tester,
  ) async {
    await openHome(tester);
    expect(find.text('G-FLEET'), findsOneWidget);
    expect(find.text('Find your next ride'), findsOneWidget);
    expect(find.textContaining('Sample vehicles and prices'), findsOneWidget);
    for (final name in [
      'Toyota Vios',
      'Honda City',
      'Toyota Innova',
      'Mitsubishi Montero Sport',
    ]) {
      await tester.ensureVisible(find.text(name));
      expect(find.text(name).hitTestable(), findsOneWidget);
    }
    expect(find.text('₱1,800 / day'), findsOneWidget);
    expect(find.text('₱2,000 / day'), findsOneWidget);
    expect(find.text('₱3,000 / day'), findsOneWidget);
    expect(find.text('₱3,500 / day'), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Search matches make and model ignoring case and surrounding spaces',
    (tester) async {
      await openHome(tester);
      await tester.enterText(find.byType(TextField), '  tOyOtA  ');
      await tester.pump();
      expect(find.text('Toyota Vios'), findsOneWidget);
      expect(find.text('Toyota Innova'), findsOneWidget);
      expect(find.text('Honda City'), findsNothing);
      await tester.enterText(find.byType(TextField), 'vIoS');
      await tester.pump();
      expect(find.text('Toyota Vios'), findsOneWidget);
      expect(find.text('Toyota Innova'), findsNothing);
      await tester.enterText(find.byType(TextField), '   ');
      await tester.pump();
      expect(find.text('Honda City'), findsOneWidget);
    },
  );

  testWidgets('Categories filter vehicles and All restores the collection', (
    tester,
  ) async {
    await openHome(tester);
    await chooseCategory(tester, 'SUV');
    expect(find.text('Mitsubishi Montero Sport'), findsOneWidget);
    expect(find.text('Toyota Vios'), findsNothing);
    await chooseCategory(tester, 'MPV');
    expect(find.text('Toyota Innova'), findsOneWidget);
    expect(find.text('Mitsubishi Montero Sport'), findsNothing);
    await chooseCategory(tester, 'All');
    expect(find.text('Toyota Vios'), findsOneWidget);
    expect(find.text('Mitsubishi Montero Sport'), findsOneWidget);
  });

  testWidgets('Search intersects category and clear keeps the category', (
    tester,
  ) async {
    await openHome(tester);
    await chooseCategory(tester, 'Sedan');
    await tester.enterText(find.byType(TextField), 'Toyota');
    await tester.pump();
    expect(find.text('Toyota Vios'), findsOneWidget);
    expect(find.text('Toyota Innova'), findsNothing);
    expect(find.text('Honda City'), findsNothing);
    await tester.ensureVisible(find.byTooltip('Clear search'));
    await tester.tap(find.byTooltip('Clear search'));
    await tester.pump();
    expect(find.text('Honda City'), findsOneWidget);
    expect(find.text('Toyota Innova'), findsNothing);
    expect(
      tester.widget<TextField>(find.byType(TextField)).controller!.text,
      isEmpty,
    );
  });

  testWidgets('No matches shows empty state and clear recovers results', (
    tester,
  ) async {
    await openHome(tester);
    await tester.enterText(find.byType(TextField), 'unlisted vehicle');
    await tester.pump();
    expect(find.text('No sample vehicles found'), findsOneWidget);
    expect(find.text('Toyota Vios'), findsNothing);
    await tester.tap(find.byTooltip('Clear search'));
    await tester.pump();
    expect(find.text('No sample vehicles found'), findsNothing);
    expect(find.text('Toyota Vios'), findsOneWidget);
  });

  testWidgets('Card selection opens details and Back restores Home', (
    tester,
  ) async {
    await openHome(tester);
    await tester.ensureVisible(find.text('Toyota Vios'));
    await tester.tap(find.text('Toyota Vios'));
    await tester.pumpAndSettle();
    expect(find.text('Vehicle details'), findsOneWidget);
    expect(find.text('Book This Vehicle'), findsOneWidget);
    expect(find.byType(NavigationBar), findsNothing);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byType(AlertDialog), findsNothing);
    expect(find.byType(NavigationBar), findsOneWidget);
  });

  testWidgets(
    'Tabs show My Bookings and remaining previews while preserving Home filters',
    (tester) async {
      await openHome(tester);
      await chooseCategory(tester, 'Sedan');
      await tester.enterText(find.byType(TextField), 'City');
      await tester.pump();
      for (final name in ['Bookings', 'Messages', 'Profile']) {
        await chooseTab(tester, name);
        expect(
          find.text(switch (name) {
            'Bookings' => 'My Bookings',
            'Profile' => 'Customer Profile',
            _ => '$name preview',
          }),
          findsOneWidget,
        );
        expect(find.text('Find your next ride'), findsNothing);
        expect(find.byType(NavigationBar), findsOneWidget);
        expect(find.text('Alex Demo'), findsNothing);
        expect(find.text('Exit Demo'), findsNothing);
      }
      await chooseTab(tester, 'Home');
      expect(find.text('Honda City'), findsOneWidget);
      expect(find.text('Toyota Vios'), findsNothing);
      expect(
        tester.widget<TextField>(find.byType(TextField)).controller!.text,
        'City',
      );
      expect(
        tester
            .widget<ChoiceChip>(find.widgetWithText(ChoiceChip, 'Sedan'))
            .selected,
        isTrue,
      );
      expect(tester.testTextInput.isVisible, isFalse);
    },
  );

  testWidgets('Home keeps its scroll position across tabs', (tester) async {
    await openHome(tester);
    await tester.ensureVisible(find.text('Mitsubishi Montero Sport'));
    await tester.pumpAndSettle();
    final before = tester.getTopLeft(find.text('Mitsubishi Montero Sport'));
    await chooseTab(tester, 'Messages');
    await chooseTab(tester, 'Home');
    expect(tester.getTopLeft(find.text('Mitsubishi Montero Sport')), before);
    expect(find.text('Mitsubishi Montero Sport').hitTestable(), findsOneWidget);
  });

  for (final brightness in Brightness.values) {
    testWidgets('Home fits a small phone and keyboard in ${brightness.name}', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(360, 640);
      tester.view.devicePixelRatio = 1;
      tester.platformDispatcher.platformBrightnessTestValue = brightness;
      tester.platformDispatcher.textScaleFactorTestValue = 1.5;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      addTearDown(tester.view.resetViewInsets);
      addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
      await openHome(tester);
      expect(
        Theme.of(tester.element(find.byType(NavigationBar))).brightness,
        brightness,
      );
      await tester.showKeyboard(find.byType(TextField));
      tester.view.viewInsets = const FakeViewPadding(bottom: 280);
      await tester.enterText(find.byType(TextField), 'Vios');
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Toyota Vios'));
      await tester.pumpAndSettle();
      expect(find.text('Toyota Vios').hitTestable(), findsOneWidget);
      expect(tester.takeException(), isNull);
      await chooseTab(tester, 'Profile');
      expect(find.text('Customer Profile'), findsOneWidget);
      expect(tester.testTextInput.isVisible, isFalse);
      expect(tester.takeException(), isNull);
    });
  }
}

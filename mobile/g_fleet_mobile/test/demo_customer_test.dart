import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/app/app.dart';
import 'package:g_fleet_mobile/features/home/presentation/home_screen.dart';

Future<void> tapText(WidgetTester tester, String text) async {
  final target = find.text(text);
  await tester.ensureVisible(target);
  await tester.tap(target);
  await tester.pumpAndSettle();
}

Future<void> openDemo(WidgetTester tester) async {
  await tester.pumpWidget(const GFleetApp());
  await tapText(tester, 'Login');
  await tapText(tester, 'Continue as Demo Customer');
}

void main() {
  testWidgets(
    'Debug login offers a secondary demo button without credentials',
    (tester) async {
      expect(kDebugMode, isTrue);
      await tester.pumpWidget(const GFleetApp());
      await tapText(tester, 'Login');
      expect(
        find.widgetWithText(OutlinedButton, 'Continue as Demo Customer'),
        findsOneWidget,
      );
      await tapText(tester, 'Continue as Demo Customer');
      expect(find.byType(HomeScreen), findsOneWidget);
      expect(find.text('Find your next ride'), findsOneWidget);
      expect(find.text('DEMO'), findsOneWidget);
      expect(find.text('Alex Demo'), findsNothing);
      expect(find.text('customer@example.invalid'), findsNothing);
      expect(find.text('Exit Demo'), findsNothing);
      await tapText(tester, 'Profile');
      expect(find.text('Alex Demo'), findsOneWidget);
      expect(find.text('customer@example.invalid'), findsOneWidget);
      expect(find.text('Enter your email address.'), findsNothing);
      expect(find.text('Enter your password.'), findsNothing);
    },
  );

  testWidgets('Exit demo returns to Login and clears the identity', (
    tester,
  ) async {
    await openDemo(tester);
    final session = tester
        .widget<HomeScreen>(find.byType(HomeScreen))
        .demoSession!;
    expect(session.customer, isNotNull);
    await tapText(tester, 'Profile');
    await tapText(tester, 'Exit Demo');
    expect(session.customer, isNull);
    expect(find.text('DEMO'), findsNothing);
    expect(find.text('Welcome back'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    await tapText(tester, 'Continue');
    expect(find.text('Find your next ride'), findsOneWidget);
    expect(find.text('DEMO'), findsNothing);
    expect(find.text('Alex Demo'), findsNothing);
    expect(
      tester.widget<HomeScreen>(find.byType(HomeScreen)).demoSession,
      isNull,
    );
  });

  testWidgets('Back clears demo identity and re-entry creates a fresh visit', (
    tester,
  ) async {
    await openDemo(tester);
    final first = tester
        .widget<HomeScreen>(find.byType(HomeScreen))
        .demoSession!;
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(first.customer, isNull);
    expect(find.text('Welcome back'), findsOneWidget);
    await tapText(tester, 'Continue as Demo Customer');
    final second = tester
        .widget<HomeScreen>(find.byType(HomeScreen))
        .demoSession!;
    expect(identical(first, second), isFalse);
    expect(second.customer, isNotNull);
    expect(first.customer, isNull);
  });

  testWidgets('Removing the app clears an active demo identity', (
    tester,
  ) async {
    await openDemo(tester);
    final session = tester
        .widget<HomeScreen>(find.byType(HomeScreen))
        .demoSession!;
    await tester.pumpWidget(const SizedBox.shrink());
    expect(session.customer, isNull);
  });

  testWidgets('Landing preview has no demo identity or exit action', (
    tester,
  ) async {
    await tester.pumpWidget(const GFleetApp());
    await tapText(tester, 'Continue');
    expect(find.text('Find your next ride'), findsOneWidget);
    expect(find.text('DEMO'), findsNothing);
    expect(find.text('Exit Demo'), findsNothing);
    await tapText(tester, 'Profile');
    expect(find.text('Alex Demo'), findsNothing);
    expect(find.text('customer@example.invalid'), findsNothing);
    expect(find.text('Exit Demo'), findsNothing);
    expect(
      tester.widget<HomeScreen>(find.byType(HomeScreen)).demoSession,
      isNull,
    );
  });

  testWidgets(
    'Demo badge persists across tabs while identity stays in Profile',
    (tester) async {
      await openDemo(tester);
      await tester.enterText(find.byType(TextField), 'Vios');
      await tester.pumpAndSettle();
      expect(find.text('Toyota Vios'), findsOneWidget);
      expect(find.text('Honda City'), findsNothing);
      for (final tab in ['Bookings', 'Messages', 'Profile', 'Home']) {
        await tapText(tester, tab);
        expect(find.text('DEMO').hitTestable(), findsOneWidget);
        expect(
          find.text('Alex Demo'),
          tab == 'Profile' ? findsOneWidget : findsNothing,
        );
        expect(
          find.text('Exit Demo'),
          tab == 'Profile' ? findsOneWidget : findsNothing,
        );
      }
      expect(find.text('Toyota Vios'), findsOneWidget);
      expect(find.text('Honda City'), findsNothing);
    },
  );

  testWidgets(
    'System Back from demo Profile clears identity and restores Login',
    (tester) async {
      await openDemo(tester);
      final session = tester
          .widget<HomeScreen>(find.byType(HomeScreen))
          .demoSession!;
      await tapText(tester, 'Profile');
      await tester.binding.handlePopRoute();
      await tester.pumpAndSettle();
      expect(session.customer, isNull);
      expect(find.text('Welcome back'), findsOneWidget);
      expect(find.text('DEMO'), findsNothing);
    },
  );
}

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/features/home/presentation/home_screen.dart';

import 'booking_form_test.dart' show tapVisible;
import 'booking_review_test.dart' show currentStore;
import 'booking_store_test.dart' show exampleDraft;
import 'demo_customer_test.dart' show openDemo;
import 'home_screen_test.dart' show openHome, chooseTab, chooseCategory;
import 'vehicle_details_test.dart' show dashboardScroll;

Future<void> openProfile(WidgetTester tester, {bool demo = false}) async {
  if (demo) {
    await openDemo(tester);
  } else {
    await openHome(tester);
  }
  await chooseTab(tester, 'Profile');
}

void main() {
  testWidgets(
    'Guest Profile explains preview without fabricating customer data',
    (tester) async {
      await openProfile(tester);
      expect(find.text('Customer Profile'), findsOneWidget);
      expect(find.text('Guest profile'), findsOneWidget);
      expect(find.textContaining('without signing in'), findsOneWidget);
      expect(find.bySemanticsLabel('Guest avatar'), findsOneWidget);
      expect(find.text('Alex Demo'), findsNothing);
      expect(find.text('customer@example.invalid'), findsNothing);
      expect(find.text('DEMO'), findsNothing);
      expect(find.text('Exit Demo'), findsNothing);
      expect(find.text('Login'), findsOneWidget);
      expect(find.text('Register'), findsOneWidget);
      expect(find.text('My Bookings'), findsOneWidget);
    },
  );

  for (final action in ['Login', 'Register']) {
    testWidgets(
      'Guest $action uses existing auth routes without a hidden Home visit',
      (tester) async {
        await openProfile(tester);
        final store = currentStore(tester);
        store.confirm(exampleDraft(), visitId: store.visitId);
        await tapVisible(tester, find.text(action));
        expect(
          find.text(action == 'Login' ? 'Welcome back' : 'Create your account'),
          findsOneWidget,
        );
        expect(find.byType(HomeScreen, skipOffstage: false), findsNothing);
        expect(store.bookings, isEmpty);
        if (action == 'Register') {
          await tapVisible(tester, find.text('Back to Login'));
          expect(find.text('Welcome back'), findsOneWidget);
        }
        await tester.pageBack();
        await tester.pumpAndSettle();
        expect(find.text('Welcome to G-FLEET'), findsOneWidget);
        await tapVisible(tester, find.text('Continue'));
        expect(currentStore(tester).bookings, isEmpty);
        expect(
          () => store.confirm(exampleDraft(), visitId: store.visitId),
          returnsNormally,
        );
      },
    );

    testWidgets('Queued guest $action callbacks navigate only once', (
      tester,
    ) async {
      await openProfile(tester);
      final button = tester.widget<ButtonStyleButton>(
        find.widgetWithText(
          action == 'Login' ? FilledButton : OutlinedButton,
          action,
        ),
      );
      button.onPressed!();
      button.onPressed!();
      await tester.pumpAndSettle();
      expect(
        find.text(action == 'Login' ? 'Welcome back' : 'Create your account'),
        findsOneWidget,
      );
      if (action == 'Register') {
        await tester.pageBack();
        await tester.pumpAndSettle();
      }
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Welcome to G-FLEET'), findsOneWidget);
      expect(find.byType(HomeScreen, skipOffstage: false), findsNothing);
    });
  }

  testWidgets(
    'Guest Profile Login can enter and exit demo without nested sessions',
    (tester) async {
      await openProfile(tester);
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await tapVisible(tester, find.text('Login'));
      await tapVisible(tester, find.text('Continue as Demo Customer'));
      expect(store.bookings, isEmpty);
      expect(find.byType(HomeScreen, skipOffstage: false), findsOneWidget);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await chooseTab(tester, 'Profile');
      await tapVisible(tester, find.text('Exit Demo'));
      expect(store.bookings, isEmpty);
      expect(find.text('Welcome back'), findsOneWidget);
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Welcome to G-FLEET'), findsOneWidget);
    },
  );

  testWidgets(
    'Debug demo Profile uses the established identity and Profile-only controls',
    (tester) async {
      expect(kDebugMode, isTrue);
      await openProfile(tester, demo: true);
      expect(find.text('Demo Customer'), findsOneWidget);
      expect(find.text('Alex Demo'), findsOneWidget);
      expect(find.text('customer@example.invalid'), findsOneWidget);
      expect(
        find.textContaining('Temporary local demonstration'),
        findsOneWidget,
      );
      expect(find.text('DEMO').hitTestable(), findsOneWidget);
      expect(find.text('Login'), findsNothing);
      expect(find.text('Register'), findsNothing);
      for (final tab in ['Home', 'Bookings', 'Messages']) {
        await chooseTab(tester, tab);
        expect(find.text('DEMO').hitTestable(), findsOneWidget);
        expect(find.text('Alex Demo'), findsNothing);
        expect(find.text('customer@example.invalid'), findsNothing);
        expect(find.text('Exit Demo'), findsNothing);
      }
    },
  );

  testWidgets(
    'Profile Exit Demo clears identity and records and re-entry has empty bookings',
    (tester) async {
      await openProfile(tester, demo: true);
      final session = tester
          .widget<HomeScreen>(find.byType(HomeScreen))
          .demoSession!;
      final store = currentStore(tester);
      store.confirm(exampleDraft(), visitId: store.visitId);
      await tapVisible(tester, find.text('My Bookings'));
      expect(find.text('Reference: MOCK-000001'), findsOneWidget);
      await chooseTab(tester, 'Profile');
      await tapVisible(tester, find.text('Exit Demo'));
      expect(session.customer, isNull);
      expect(store.bookings, isEmpty);
      expect(find.text('Welcome back'), findsOneWidget);
      expect(find.text('Alex Demo'), findsNothing);
      await tapVisible(tester, find.text('Continue as Demo Customer'));
      await chooseTab(tester, 'Bookings');
      expect(find.text('No bookings yet'), findsOneWidget);
      await chooseTab(tester, 'Profile');
      final fresh = tester
          .widget<HomeScreen>(find.byType(HomeScreen))
          .demoSession!;
      expect(identical(fresh, session), isFalse);
      expect(find.text('Alex Demo'), findsOneWidget);
    },
  );

  testWidgets('Queued Exit Demo callbacks return to Login only once', (
    tester,
  ) async {
    await openProfile(tester, demo: true);
    final store = currentStore(tester);
    store.confirm(exampleDraft(), visitId: store.visitId);
    final exit = tester
        .widget<OutlinedButton>(
          find.widgetWithText(OutlinedButton, 'Exit Demo'),
        )
        .onPressed!;
    exit();
    exit();
    await tester.pumpAndSettle();
    expect(find.text('Welcome back'), findsOneWidget);
    expect(store.bookings, isEmpty);
    expect(find.byType(HomeScreen, skipOffstage: false), findsNothing);
  });

  testWidgets(
    'Profile Bookings shortcut preserves bottom navigation and Home filter/scroll state',
    (tester) async {
      await openHome(tester);
      await chooseCategory(tester, 'Sedan');
      await tester.enterText(find.byType(TextField), ' o ');
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Honda City'));
      await tester.pumpAndSettle();
      final offset = dashboardScroll(tester).position.pixels;
      expect(offset, greaterThan(0));
      await chooseTab(tester, 'Profile');
      await tapVisible(tester, find.text('My Bookings'));
      expect(find.text('No bookings yet'), findsOneWidget);
      expect(
        tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
        1,
      );
      await chooseTab(tester, 'Home');
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
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Welcome to G-FLEET'), findsOneWidget);
    },
  );

  for (final demo in [false, true]) {
    for (final brightness in Brightness.values) {
      testWidgets(
        '${demo ? 'Demo' : 'Guest'} Profile scrolls at 320px/2x in ${brightness.name}',
        (tester) async {
          await openProfile(tester, demo: demo);
          tester.view.physicalSize = const Size(320, 568);
          tester.view.devicePixelRatio = 1;
          tester.platformDispatcher.textScaleFactorTestValue = 2;
          tester.platformDispatcher.platformBrightnessTestValue = brightness;
          addTearDown(tester.view.resetPhysicalSize);
          addTearDown(tester.view.resetDevicePixelRatio);
          addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
          addTearDown(
            tester.platformDispatcher.clearPlatformBrightnessTestValue,
          );
          await tester.pumpAndSettle();
          for (final label in [
            'My Bookings',
            if (demo) 'Exit Demo' else ...['Login', 'Register'],
          ]) {
            await tester.ensureVisible(find.text(label));
            await tester.pumpAndSettle();
            expect(find.text(label).hitTestable(), findsOneWidget);
          }
          expect(
            Theme.of(tester.element(find.byType(NavigationBar))).brightness,
            brightness,
          );
          expect(tester.takeException(), isNull);
          expect(find.text('DEMO'), demo ? findsOneWidget : findsNothing);
        },
      );
    }
  }

  for (final action in ['Login', 'Register']) {
    for (final brightness in Brightness.values) {
      testWidgets(
        'Guest $action entry remains usable at 320px/2x in ${brightness.name}',
        (tester) async {
          await openProfile(tester);
          tester.view.physicalSize = const Size(320, 568);
          tester.view.devicePixelRatio = 1;
          tester.platformDispatcher.textScaleFactorTestValue = 2;
          tester.platformDispatcher.platformBrightnessTestValue = brightness;
          addTearDown(tester.view.resetPhysicalSize);
          addTearDown(tester.view.resetDevicePixelRatio);
          addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
          addTearDown(
            tester.platformDispatcher.clearPlatformBrightnessTestValue,
          );
          await tester.pumpAndSettle();
          await tapVisible(tester, find.text(action));
          final submit = find.widgetWithText(
            FilledButton,
            action == 'Login' ? 'Login' : 'Create Account',
          );
          await tester.ensureVisible(submit);
          await tester.pumpAndSettle();
          expect(submit.hitTestable(), findsOneWidget);
          expect(tester.takeException(), isNull);
          if (action == 'Register') {
            await tester.pageBack();
            await tester.pumpAndSettle();
          }
          await tester.pageBack();
          await tester.pumpAndSettle();
          expect(find.text('Welcome to G-FLEET'), findsOneWidget);
          expect(tester.takeException(), isNull);
        },
      );
    }
  }
}

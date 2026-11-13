import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/app/app.dart';
import 'package:g_fleet_mobile/features/home/presentation/home_screen.dart';

Finder field(String label) => find.widgetWithText(TextFormField, label);

Future<void> tapText(WidgetTester tester, String text) async {
  final target = find.text(text).last;
  await tester.ensureVisible(target);
  await tester.tap(target);
  await tester.pumpAndSettle();
}

Future<void> openLogin(WidgetTester tester) async {
  await tester.pumpWidget(const GFleetApp());
  await tapText(tester, 'Login');
}

Future<void> openForm(WidgetTester tester, String screen) async {
  await openLogin(tester);
  if (screen == 'registration') await tapText(tester, 'Create an account');
  if (screen == 'recovery') await tapText(tester, 'Forgot password?');
}

Future<void> fillRegistration(
  WidgetTester tester, {
  String password = 'pass1234',
  String confirmation = 'pass1234',
}) async {
  await tester.enterText(field('Full name'), 'Test Customer');
  await tester.enterText(field('Email address'), 'customer@example.com');
  await tester.enterText(field('Password'), password);
  await tester.enterText(field('Confirm password'), confirmation);
}

void main() {
  testWidgets('Login renders branding and customer form', (tester) async {
    await openLogin(tester);
    expect(find.text('G-FLEET'), findsOneWidget);
    expect(find.text('Welcome back'), findsOneWidget);
    expect(field('Email address'), findsOneWidget);
    expect(field('Password'), findsOneWidget);
    expect(find.text('Forgot password?'), findsOneWidget);
    expect(find.text('Create an account'), findsOneWidget);
  });

  testWidgets('Login rejects empty fields', (tester) async {
    await openLogin(tester);
    await tapText(tester, 'Login');
    expect(find.text('Enter your email address.'), findsOneWidget);
    expect(find.text('Enter your password.'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Login rejects malformed email', (tester) async {
    await openLogin(tester);
    await tester.enterText(field('Email address'), 'invalid-email');
    await tester.enterText(field('Password'), 'some-password');
    await tapText(tester, 'Login');
    expect(find.text('Enter a valid email address.'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Login rejects whitespace-only required fields', (tester) async {
    await openLogin(tester);
    await tester.enterText(field('Email address'), '   ');
    await tester.enterText(field('Password'), '   ');
    await tapText(tester, 'Login');
    expect(find.text('Enter your email address.'), findsOneWidget);
    expect(find.text('Enter your password.'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Login password can be revealed and hidden', (tester) async {
    await openLogin(tester);
    await tester.enterText(field('Password'), 'temporary-password');
    TextField password() => tester.widget<TextField>(
      find.descendant(of: field('Password'), matching: find.byType(TextField)),
    );
    expect(password().obscureText, isTrue);
    await tester.tap(find.byTooltip('Show password'));
    await tester.pump();
    expect(password().obscureText, isFalse);
    expect(password().controller!.text, 'temporary-password');
    await tester.tap(find.byTooltip('Hide password'));
    await tester.pump();
    expect(password().obscureText, isTrue);
  });

  testWidgets('Registration renders the four temporary fields', (tester) async {
    await openForm(tester, 'registration');
    expect(find.text('Create your account'), findsOneWidget);
    for (final label in [
      'Full name',
      'Email address',
      'Password',
      'Confirm password',
    ]) {
      expect(field(label), findsOneWidget);
    }
  });

  testWidgets('Registration rejects empty fields', (tester) async {
    await openForm(tester, 'registration');
    await tapText(tester, 'Create Account');
    for (final error in [
      'Enter your full name.',
      'Enter your email address.',
      'Enter your password.',
      'Confirm your password.',
    ]) {
      expect(find.text(error), findsOneWidget);
    }
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Registration rejects malformed email', (tester) async {
    await openForm(tester, 'registration');
    await fillRegistration(tester);
    await tester.enterText(field('Email address'), 'customer@');
    await tapText(tester, 'Create Account');
    expect(find.text('Enter a valid email address.'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Registration rejects mismatched passwords', (tester) async {
    await openForm(tester, 'registration');
    await fillRegistration(tester, confirmation: 'different-password');
    await tapText(tester, 'Create Account');
    expect(find.text('Passwords do not match.'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Registration applies temporary eight character minimum', (
    tester,
  ) async {
    await openForm(tester, 'registration');
    await fillRegistration(tester, password: 'short', confirmation: 'short');
    await tapText(tester, 'Create Account');
    expect(find.text('Use at least 8 characters.'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Registration password toggles are independent', (tester) async {
    await openForm(tester, 'registration');
    await tester.ensureVisible(find.byTooltip('Show password'));
    await tester.tap(find.byTooltip('Show password'));
    await tester.pump();
    bool hidden(String label) => tester
        .widget<TextField>(
          find.descendant(of: field(label), matching: find.byType(TextField)),
        )
        .obscureText;
    expect(hidden('Password'), isFalse);
    expect(hidden('Confirm password'), isTrue);
    await tester.ensureVisible(find.byTooltip('Show confirm password'));
    await tester.tap(find.byTooltip('Show confirm password'));
    await tester.pump();
    expect(hidden('Confirm password'), isFalse);
  });

  testWidgets('Recovery rejects empty and malformed email', (tester) async {
    await openForm(tester, 'recovery');
    await tapText(tester, 'Reset Password');
    expect(find.text('Enter your email address.'), findsOneWidget);
    await tester.enterText(field('Email address'), 'wrong');
    await tapText(tester, 'Reset Password');
    expect(find.text('Enter a valid email address.'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
  });

  testWidgets('Auth links and back preserve one Login route and its input', (
    tester,
  ) async {
    await openLogin(tester);
    await tester.enterText(field('Email address'), 'customer@example.com');
    await tapText(tester, 'Create an account');
    await tapText(tester, 'Back to Login');
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('customer@example.com'), findsOneWidget);
    await tapText(tester, 'Forgot password?');
    await tapText(tester, 'Back to Login');
    expect(find.text('Welcome back'), findsOneWidget);
    await tapText(tester, 'Create an account');
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Welcome back'), findsOneWidget);
    await tapText(tester, 'Forgot password?');
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Welcome back'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Welcome to G-FLEET'), findsOneWidget);
  });

  for (final screen in ['login', 'registration', 'recovery']) {
    testWidgets('Valid $screen submission shows honest backend notice', (
      tester,
    ) async {
      await openForm(tester, screen);
      if (screen == 'registration') {
        await fillRegistration(tester);
      } else {
        await tester.enterText(
          field('Email address'),
          ' customer@example.com ',
        );
        if (screen == 'login') await tester.enterText(field('Password'), 'x');
      }
      await tapText(tester, switch (screen) {
        'registration' => 'Create Account',
        'recovery' => 'Reset Password',
        _ => 'Login',
      });
      expect(
        find.text(
          screen == 'recovery'
              ? 'Password recovery is not connected yet. No reset email has been sent.'
              : 'Authentication will be available after backend integration.',
        ),
        findsOneWidget,
      );
      expect(find.byType(HomeScreen), findsNothing);
      expect(find.text('Welcome to G-FLEET'), findsNothing);
    });

    for (final brightness in Brightness.values) {
      testWidgets(
        '$screen fits small screen with keyboard in ${brightness.name}',
        (tester) async {
          tester.view.physicalSize = const Size(360, 640);
          tester.view.devicePixelRatio = 1;
          tester.platformDispatcher.platformBrightnessTestValue = brightness;
          addTearDown(tester.view.resetPhysicalSize);
          addTearDown(tester.view.resetDevicePixelRatio);
          addTearDown(tester.view.resetViewInsets);
          addTearDown(
            tester.platformDispatcher.clearPlatformBrightnessTestValue,
          );
          await openForm(tester, screen);
          await tester.showKeyboard(field('Email address'));
          tester.view.viewInsets = const FakeViewPadding(bottom: 280);
          await tester.pumpAndSettle();
          final button = find.byType(FilledButton);
          await tester.ensureVisible(button);
          await tester.pumpAndSettle();
          expect(button.hitTestable(), findsOneWidget);
          expect(tester.takeException(), isNull);
          final context = tester.element(find.byType(Form));
          expect(Theme.of(context).brightness, brightness);
        },
      );
    }
  }
}

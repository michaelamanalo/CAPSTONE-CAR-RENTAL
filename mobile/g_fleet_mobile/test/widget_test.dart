import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/main.dart' as entry;

void main() {
  testWidgets(
    'Startup opens landing and supports forward and back navigation',
    (tester) async {
      entry.main();
      await tester.pumpAndSettle();

      expect(find.text('Welcome to G-FLEET'), findsOneWidget);
      await tester.tap(find.widgetWithText(FilledButton, 'Continue'));
      await tester.pumpAndSettle();
      expect(find.text('Find your next ride'), findsOneWidget);

      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Welcome to G-FLEET'), findsOneWidget);
      expect(find.text('Find your next ride'), findsNothing);
    },
  );

  for (final brightness in Brightness.values) {
    testWidgets('Uses Material 3 with system ${brightness.name} theme', (
      tester,
    ) async {
      tester.platformDispatcher.platformBrightnessTestValue = brightness;
      addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
      entry.main();
      await tester.pumpAndSettle();

      final context = tester.element(find.byType(Scaffold));
      expect(Theme.of(context).brightness, brightness);
      expect(Theme.of(context).useMaterial3, isTrue);
    });
  }
}

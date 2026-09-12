import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/main.dart';

void main() {
  testWidgets('shows the G-FLEET home screen', (WidgetTester tester) async {
    await tester.pumpWidget(const GFleetApp());

    expect(find.text('G-FLEET'), findsOneWidget);
    expect(find.text('Welcome'), findsOneWidget);
  });
}

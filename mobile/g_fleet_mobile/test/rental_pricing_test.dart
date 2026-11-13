import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/features/bookings/domain/rental_pricing.dart';

void main() {
  final pickup = DateTime(2030, 1, 1, 9);
  for (final item in [
    (minutes: 1, days: 1, cost: 1800),
    (minutes: 1440, days: 1, cost: 1800),
    (minutes: 1441, days: 2, cost: 3600),
    (minutes: 2880, days: 2, cost: 3600),
  ]) {
    test('Temporary pricing for ${item.minutes} minutes', () {
      final quote = RentalPricing.calculate(
        pickup,
        pickup.add(Duration(minutes: item.minutes)),
        1800,
      );
      expect(quote.billedDays, item.days);
      expect(quote.totalPesos, item.cost);
    });
  }
  test('Reject zero or negative duration and nonpositive rate', () {
    expect(
      () => RentalPricing.calculate(pickup, pickup, 1800),
      throwsArgumentError,
    );
    expect(
      () => RentalPricing.calculate(
        pickup,
        pickup.subtract(const Duration(hours: 1)),
        1800,
      ),
      throwsArgumentError,
    );
    expect(
      () => RentalPricing.calculate(
        pickup,
        pickup.add(const Duration(days: 1)),
        0,
      ),
      throwsArgumentError,
    );
  });
  test('Schedule rejects pickup now/past and return before pickup', () {
    expect(
      RentalPricing.validateSchedule(
        pickup,
        pickup.add(const Duration(days: 1)),
        pickup,
      ),
      isNotNull,
    );
    expect(
      RentalPricing.validateSchedule(
        pickup.add(const Duration(days: 1)),
        pickup,
        pickup,
      ),
      isNotNull,
    );
    expect(
      RentalPricing.validateSchedule(
        pickup.add(const Duration(days: 1)),
        pickup.add(const Duration(days: 2)),
        pickup,
      ),
      isNull,
    );
  });
}

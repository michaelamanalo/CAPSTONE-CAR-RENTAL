import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/features/bookings/domain/rental_schedule.dart';

void main() {
  final pickup = DateTime(2040, 1, 2, 9);
  final returnAt = pickup.add(const Duration(days: 1));
  for (final example in [
    (
      name: 'before pickup',
      now: pickup.subtract(const Duration(hours: 1)),
      phase: SchedulePhase.pickupPending,
      remaining: const Duration(hours: 1),
    ),
    (
      name: 'at pickup',
      now: pickup,
      phase: SchedulePhase.returnPending,
      remaining: const Duration(days: 1),
    ),
    (
      name: 'during scheduled window',
      now: pickup.add(const Duration(hours: 12)),
      phase: SchedulePhase.returnPending,
      remaining: const Duration(hours: 12),
    ),
    (
      name: 'at return',
      now: returnAt,
      phase: SchedulePhase.returnPassed,
      remaining: Duration.zero,
    ),
    (
      name: 'after return',
      now: returnAt.add(const Duration(hours: 1)),
      phase: SchedulePhase.returnPassed,
      remaining: Duration.zero,
    ),
    (
      name: 'just before pickup',
      now: pickup.subtract(const Duration(microseconds: 1)),
      phase: SchedulePhase.pickupPending,
      remaining: const Duration(microseconds: 1),
    ),
    (
      name: 'just before return',
      now: returnAt.subtract(const Duration(microseconds: 1)),
      phase: SchedulePhase.returnPending,
      remaining: const Duration(microseconds: 1),
    ),
  ]) {
    test('Schedule ${example.name}', () {
      final result = RentalSchedule.evaluate(
        pickup: pickup,
        returnAt: returnAt,
        now: example.now,
      );
      expect(result.phase, example.phase);
      expect(result.remaining, example.remaining);
    });
  }
  test('Schedule rejects a nonpositive interval', () {
    expect(
      () => RentalSchedule.evaluate(
        pickup: pickup,
        returnAt: pickup,
        now: pickup,
      ),
      throwsArgumentError,
    );
  });
}

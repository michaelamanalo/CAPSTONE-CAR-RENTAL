enum SchedulePhase { pickupPending, returnPending, returnPassed }

/// Schedule arithmetic only. Never changes booking status or proves handover.
abstract final class RentalSchedule {
  static ({SchedulePhase phase, Duration remaining}) evaluate({
    required DateTime pickup,
    required DateTime returnAt,
    required DateTime now,
  }) {
    if (!returnAt.isAfter(pickup)) {
      throw ArgumentError('Return must follow pickup.');
    }
    if (now.isBefore(pickup)) {
      return (
        phase: SchedulePhase.pickupPending,
        remaining: pickup.difference(now),
      );
    }
    if (now.isBefore(returnAt)) {
      return (
        phase: SchedulePhase.returnPending,
        remaining: returnAt.difference(now),
      );
    }
    return (phase: SchedulePhase.returnPassed, remaining: Duration.zero);
  }
}

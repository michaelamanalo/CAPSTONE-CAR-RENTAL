class RentalQuote {
  const RentalQuote(this.elapsed, this.billedDays, this.totalPesos);
  final Duration elapsed;
  final int billedDays;
  final int totalPesos;
}

abstract final class RentalPricing {
  // Temporary: bill each started 24-hour period. No extra fees.
  static RentalQuote calculate(
    DateTime pickup,
    DateTime returnAt,
    int dailyRatePesos,
  ) {
    final elapsed = returnAt.difference(pickup);
    if (elapsed <= Duration.zero || dailyRatePesos <= 0) {
      throw ArgumentError('Positive duration and daily rate are required.');
    }
    final days =
        (elapsed.inMicroseconds + Duration.microsecondsPerDay - 1) ~/
        Duration.microsecondsPerDay;
    return RentalQuote(elapsed, days, days * dailyRatePesos);
  }

  static String? validateSchedule(
    DateTime pickup,
    DateTime returnAt,
    DateTime now,
  ) {
    if (!pickup.isAfter(now)) return 'Pickup must be in the future.';
    if (!returnAt.isAfter(pickup)) return 'Return must be after pickup.';
    return null;
  }
}

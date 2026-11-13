import 'package:flutter/foundation.dart';

import '../domain/booking_draft.dart';
import '../domain/local_booking.dart';
import '../domain/rental_pricing.dart';

/// App-owned memory, with records restricted to a single Home visit.
class BookingStore extends ChangeNotifier {
  final _confirmed = Map<BookingDraft, LocalBooking>.identity();
  int _nextId = 1;
  int _visitId = 0;
  bool _active = false;

  int get visitId => _visitId;
  List<LocalBooking> get bookings => List.unmodifiable(_confirmed.values);

  // Called only when Home mounts, before visit consumers are built.
  int startVisit() {
    _confirmed.clear();
    _active = true;
    return ++_visitId;
  }

  void endVisit({int? visitId, bool notify = true}) {
    if (visitId != null && visitId != _visitId) return;
    final changed = _confirmed.isNotEmpty;
    _confirmed.clear();
    _active = false;
    if (changed && notify) notifyListeners();
  }

  LocalBooking? findById(String id) {
    for (final booking in _confirmed.values) {
      if (booking.id == id) return booking;
    }
    return null;
  }

  static String? validationError(BookingDraft draft, DateTime now) {
    final scheduleError = RentalPricing.validateSchedule(
      draft.pickup,
      draft.returnAt,
      now,
    );
    if (scheduleError != null) return scheduleError;
    if (draft.vehicle.dailyRatePesos <= 0) {
      return 'A positive sample rate is required.';
    }
    if (!temporaryLocations.contains(draft.pickupLocation) ||
        !temporaryLocations.contains(draft.returnLocation)) {
      return 'Select temporary pickup and return locations.';
    }
    return null;
  }

  LocalBooking confirm(
    BookingDraft draft, {
    required int visitId,
    DateTime? now,
  }) {
    if (!_active || visitId != _visitId) {
      throw StateError(
        'This Home visit has ended. Start a new local booking from Home.',
      );
    }
    final existing = _confirmed[draft];
    if (existing != null) return existing;
    final createdAt = now ?? DateTime.now();
    final error = validationError(draft, createdAt);
    if (error != null) throw ArgumentError(error);
    final booking = LocalBooking(
      id: 'MOCK-${(_nextId++).toString().padLeft(6, '0')}',
      draft: draft,
      quote: draft.quote,
      createdAt: createdAt,
    );
    _confirmed[draft] = booking;
    notifyListeners();
    return booking;
  }

  @override
  void dispose() {
    endVisit(notify: false);
    super.dispose();
  }
}

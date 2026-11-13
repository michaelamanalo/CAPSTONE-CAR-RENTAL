import 'booking_draft.dart';
import 'rental_pricing.dart';

/// A local UI example, never proof of a reservation, payment, or approval.
class LocalBooking {
  const LocalBooking({
    required this.id,
    required this.draft,
    required this.quote,
    required this.createdAt,
  });
  final String id;
  final BookingDraft draft;
  final RentalQuote quote;
  final DateTime createdAt;
  String get status => 'Local mock';
}

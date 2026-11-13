import '../../home/data/sample_vehicles.dart';
import 'rental_pricing.dart';

const temporaryLocations = ['Sample branch A', 'Sample branch B'];

/// Immutable local input, never a reservation or real customer record.
class BookingDraft {
  const BookingDraft({
    required this.vehicle,
    required this.pickup,
    required this.returnAt,
    required this.pickupLocation,
    required this.returnLocation,
  });
  final SampleVehicle vehicle;
  final DateTime pickup;
  final DateTime returnAt;
  final String pickupLocation;
  final String returnLocation;

  RentalQuote get quote =>
      RentalPricing.calculate(pickup, returnAt, vehicle.dailyRatePesos);
}

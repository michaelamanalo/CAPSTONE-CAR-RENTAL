/// Frontend examples only. These are not fleet records or business prices.
class SampleVehicle {
  const SampleVehicle({
    required this.make,
    required this.model,
    required this.category,
    required this.dailyRatePesos,
  });

  final String make;
  final String model;
  final String category;
  final int dailyRatePesos;

  String get name => '$make $model';
}

// Temporary categories pending an approved fleet taxonomy.
const sampleVehicleCategories = ['Sedan', 'SUV', 'MPV'];

const sampleVehicles = [
  SampleVehicle(
    make: 'Toyota',
    model: 'Vios',
    category: 'Sedan',
    dailyRatePesos: 1800,
  ),
  SampleVehicle(
    make: 'Honda',
    model: 'City',
    category: 'Sedan',
    dailyRatePesos: 2000,
  ),
  SampleVehicle(
    make: 'Toyota',
    model: 'Innova',
    category: 'MPV',
    dailyRatePesos: 3000,
  ),
  SampleVehicle(
    make: 'Mitsubishi',
    model: 'Montero Sport',
    category: 'SUV',
    dailyRatePesos: 3500,
  ),
];

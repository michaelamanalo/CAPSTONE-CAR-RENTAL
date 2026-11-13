import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';
import '../../../home/data/sample_vehicles.dart';

/// Shared sample presentation; the dataset remains owned by the Home feature.
class VehicleSummary extends StatelessWidget {
  const VehicleSummary({super.key, required this.vehicle});

  final SampleVehicle vehicle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Sample rates are whole pesos; no currency dependency is needed.
    final price = vehicle.dailyRatePesos.toString().replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+$)'),
      (match) => '${match[1]},',
    );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppTheme.smallSpacing,
      children: [
        Container(
          height: 104,
          width: double.infinity,
          decoration: BoxDecoration(
            color: theme.colorScheme.secondaryContainer,
            borderRadius: BorderRadius.circular(AppTheme.controlRadius),
          ),
          child: Icon(
            Icons.directions_car_outlined,
            size: 64,
            color: theme.colorScheme.onSecondaryContainer,
            semanticLabel: 'Vehicle image placeholder',
          ),
        ),
        Text(vehicle.name, style: theme.textTheme.titleLarge),
        Text('${vehicle.category} • Sample vehicle'),
        Text('₱$price / day', style: theme.textTheme.titleMedium),
        const Text('Illustrative price'),
      ],
    );
  }
}

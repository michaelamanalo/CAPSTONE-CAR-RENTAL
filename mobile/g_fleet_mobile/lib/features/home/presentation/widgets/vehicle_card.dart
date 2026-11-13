import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';
import '../../../vehicles/presentation/widgets/vehicle_summary.dart';
import '../../data/sample_vehicles.dart';

class VehicleCard extends StatelessWidget {
  const VehicleCard({
    super.key,
    required this.vehicle,
    required this.onSelected,
  });

  final SampleVehicle vehicle;
  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onSelected,
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.fieldSpacing),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: AppTheme.smallSpacing,
            children: [
              VehicleSummary(vehicle: vehicle),
              Row(
                children: [
                  Flexible(
                    child: Text(
                      'View details',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppTheme.smallSpacing),
                  const Icon(Icons.arrow_forward, size: 18),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

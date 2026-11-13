import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../app/theme/app_theme.dart';
import '../../../app/router/app_router.dart';
import '../../home/data/sample_vehicles.dart';
import 'widgets/vehicle_summary.dart';

class VehicleDetailsScreen extends StatelessWidget {
  const VehicleDetailsScreen({
    super.key,
    required this.vehicle,
    this.isDemo = false,
  });

  final SampleVehicle vehicle;

  /// Display context only. No identity, permissions, or session ownership.
  final bool isDemo;

  Future<void> _startBooking(BuildContext context) async {
    final confirmed = await Navigator.of(context).pushNamed(
      AppRouter.bookingForm,
      arguments: (vehicle: vehicle, isDemo: kDebugMode && isDemo),
    );
    if (context.mounted && confirmed == true) Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vehicle details'),
        actions: [
          if (kDebugMode && isDemo)
            const Padding(
              padding: EdgeInsets.only(right: AppTheme.fieldSpacing),
              child: Chip(
                label: Text('DEMO'),
                visualDensity: VisualDensity.compact,
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.pagePadding),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: AppTheme.dashboardMaxWidth,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: AppTheme.sectionSpacing,
                children: [
                  Text('G-FLEET', style: theme.textTheme.titleMedium),
                  VehicleSummary(vehicle: vehicle),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppTheme.fieldSpacing),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.tertiaryContainer,
                      borderRadius: BorderRadius.circular(
                        AppTheme.controlRadius,
                      ),
                    ),
                    child: Text(
                      'Sample data only. Vehicle information and prices are illustrative. '
                      'No real availability or booking.',
                      style: TextStyle(
                        color: theme.colorScheme.onTertiaryContainer,
                      ),
                    ),
                  ),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => _startBooking(context),
                      child: const Text(
                        'Book This Vehicle',
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

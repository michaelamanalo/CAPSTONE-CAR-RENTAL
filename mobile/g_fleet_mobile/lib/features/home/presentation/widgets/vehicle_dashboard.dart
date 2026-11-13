import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';
import '../../data/sample_vehicles.dart';
import 'vehicle_card.dart';

class VehicleDashboard extends StatefulWidget {
  const VehicleDashboard({super.key, required this.onVehicleSelected});

  final ValueChanged<SampleVehicle> onVehicleSelected;

  @override
  State<VehicleDashboard> createState() => _VehicleDashboardState();
}

class _VehicleDashboardState extends State<VehicleDashboard> {
  final _search = TextEditingController();
  String _category = 'All';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final query = _search.text.trim().toLowerCase();
    final vehicles = sampleVehicles
        .where(
          (vehicle) =>
              (_category == 'All' || vehicle.category == _category) &&
              vehicle.name.toLowerCase().contains(query),
        )
        .toList();
    return SingleChildScrollView(
      key: const PageStorageKey('vehicle-dashboard'),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.all(AppTheme.pagePadding),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppTheme.dashboardMaxWidth,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: AppTheme.fieldSpacing,
            children: [
              Text('Welcome to G-FLEET', style: theme.textTheme.titleMedium),
              Text(
                'Find your next ride',
                style: theme.textTheme.headlineMedium,
              ),
              const Text(
                'Explore vehicles for your next journey. Search by make or model to get started.',
              ),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppTheme.fieldSpacing),
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiaryContainer,
                  borderRadius: BorderRadius.circular(AppTheme.controlRadius),
                ),
                child: Text(
                  'Sample vehicles and prices only. No real availability or booking.',
                  style: TextStyle(
                    color: theme.colorScheme.onTertiaryContainer,
                  ),
                ),
              ),
              TextField(
                controller: _search,
                onChanged: (_) => setState(() {}),
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => FocusScope.of(context).unfocus(),
                decoration: InputDecoration(
                  labelText: 'Search vehicles',
                  hintText: 'Make or model',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _search.text.isEmpty
                      ? null
                      : IconButton(
                          tooltip: 'Clear search',
                          onPressed: () => setState(_search.clear),
                          icon: const Icon(Icons.close),
                        ),
                ),
              ),
              Text('Categories', style: theme.textTheme.titleMedium),
              Wrap(
                spacing: AppTheme.smallSpacing,
                runSpacing: AppTheme.smallSpacing,
                children: [
                  for (final category in ['All', ...sampleVehicleCategories])
                    ChoiceChip(
                      label: Text(category),
                      selected: _category == category,
                      onSelected: (_) => setState(() => _category = category),
                    ),
                ],
              ),
              Text(
                '${vehicles.length} sample vehicle${vehicles.length == 1 ? '' : 's'}',
                style: theme.textTheme.titleMedium,
              ),
              if (vehicles.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(
                    vertical: AppTheme.sectionSpacing,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    spacing: AppTheme.smallSpacing,
                    children: [
                      Icon(Icons.search_off, size: 40),
                      Text('No sample vehicles found'),
                      Text(
                        'Try another make or model, or choose a different category.',
                      ),
                    ],
                  ),
                ),
              for (final vehicle in vehicles)
                VehicleCard(
                  vehicle: vehicle,
                  onSelected: () => widget.onVehicleSelected(vehicle),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

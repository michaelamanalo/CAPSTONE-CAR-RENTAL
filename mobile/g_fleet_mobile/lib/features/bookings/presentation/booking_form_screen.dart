import 'package:flutter/material.dart';

import '../../../app/router/app_router.dart';
import '../../home/data/sample_vehicles.dart';
import '../../vehicles/presentation/widgets/vehicle_summary.dart';
import '../domain/booking_draft.dart';
import '../domain/rental_pricing.dart';
import 'widgets/booking_page.dart';
import 'widgets/booking_summary.dart';

class BookingFormScreen extends StatefulWidget {
  const BookingFormScreen({
    super.key,
    required this.vehicle,
    this.isDemo = false,
  });
  final SampleVehicle vehicle;
  final bool isDemo;
  @override
  State<BookingFormScreen> createState() => _BookingFormScreenState();
}

class _BookingFormScreenState extends State<BookingFormScreen> {
  DateTime? _pickupDate, _returnDate;
  TimeOfDay? _pickupTime, _returnTime;
  String? _pickupLocation, _returnLocation, _error;
  bool _reviewOpen = false;

  DateTime? _combine(DateTime? date, TimeOfDay? time) =>
      date == null || time == null
      ? null
      : DateTime(date.year, date.month, date.day, time.hour, time.minute);
  DateTime? get _pickup => _combine(_pickupDate, _pickupTime);
  DateTime? get _returnAt => _combine(_returnDate, _returnTime);

  BookingDraft _draft() => BookingDraft(
    vehicle: widget.vehicle,
    pickup: _pickup!,
    returnAt: _returnAt!,
    pickupLocation: _pickupLocation!,
    returnLocation: _returnLocation!,
  );

  Future<void> _pickDate(bool pickup) async {
    final now = DateTime.now();
    final firstDate = DateUtils.dateOnly(now);
    final proposed = pickup
        ? (_pickupDate ?? firstDate.add(const Duration(days: 1)))
        : (_returnDate ??
              (_pickupDate ?? firstDate).add(const Duration(days: 1)));
    final chosen = await showDatePicker(
      context: context,
      firstDate: firstDate,
      lastDate: DateTime(now.year + 5, 12, 31),
      initialDate: proposed.isBefore(firstDate) ? firstDate : proposed,
    );
    if (!mounted || chosen == null) return;
    setState(() {
      if (pickup) {
        _pickupDate = chosen;
      } else {
        _returnDate = chosen;
      }
      _error = null;
    });
  }

  Future<void> _pickTime(bool pickup) async {
    final chosen = await showTimePicker(
      context: context,
      initialTime:
          (pickup ? _pickupTime : _returnTime) ??
          const TimeOfDay(hour: 9, minute: 0),
    );
    if (!mounted || chosen == null) return;
    setState(() {
      if (pickup) {
        _pickupTime = chosen;
      } else {
        _returnTime = chosen;
      }
      _error = null;
    });
  }

  Future<void> _review() async {
    if (_reviewOpen) return;
    String? error;
    if (_pickup == null || _returnAt == null) {
      error = 'Choose pickup and return dates and times.';
    } else {
      error = RentalPricing.validateSchedule(
        _pickup!,
        _returnAt!,
        DateTime.now(),
      );
      if (error == null &&
          (_pickupLocation == null || _returnLocation == null)) {
        error = 'Select temporary pickup and return locations.';
      }
    }
    setState(() => _error = error);
    if (error != null) return;
    FocusManager.instance.primaryFocus?.unfocus();
    _reviewOpen = true;
    try {
      final confirmed = await Navigator.of(context).pushNamed(
        AppRouter.bookingReview,
        arguments: (draft: _draft(), isDemo: widget.isDemo),
      );
      if (mounted && confirmed == true) Navigator.of(context).pop(true);
    } finally {
      _reviewOpen = false;
    }
  }

  @override
  Widget build(BuildContext context) => BookingPage(
    title: 'Booking form',
    isDemo: widget.isDemo,
    children: [
      VehicleSummary(vehicle: widget.vehicle),
      const Text(
        'Local mock booking only. No availability is checked or reserved.',
      ),
      const Text(
        'Temporary billing: each started 24-hour period uses the sample daily rate. No extra fees.',
      ),
      for (final pickup in [true, false]) ...[
        OutlinedButton.icon(
          key: ValueKey(pickup ? 'pickup-date' : 'return-date'),
          onPressed: () => _pickDate(pickup),
          icon: const Icon(Icons.calendar_today),
          label: Text(
            '${pickup ? 'Pickup' : 'Return'} date: ${(pickup ? _pickupDate : _returnDate) == null ? 'Choose date' : MaterialLocalizations.of(context).formatMediumDate((pickup ? _pickupDate : _returnDate)!)}',
          ),
        ),
        OutlinedButton.icon(
          key: ValueKey(pickup ? 'pickup-time' : 'return-time'),
          onPressed: () => _pickTime(pickup),
          icon: const Icon(Icons.schedule),
          label: Text(
            '${pickup ? 'Pickup' : 'Return'} time: ${(pickup ? _pickupTime : _returnTime)?.format(context) ?? 'Choose time'}',
          ),
        ),
      ],
      for (final pickup in [true, false])
        DropdownButtonFormField<String>(
          key: ValueKey(pickup ? 'pickup-location' : 'return-location'),
          initialValue: pickup ? _pickupLocation : _returnLocation,
          isExpanded: true,
          decoration: InputDecoration(
            labelText: '${pickup ? 'Pickup' : 'Return'} location (temporary)',
          ),
          items: [
            for (final location in temporaryLocations)
              DropdownMenuItem(value: location, child: Text(location)),
          ],
          onChanged: (value) => setState(() {
            if (pickup) {
              _pickupLocation = value;
            } else {
              _returnLocation = value;
            }
            _error = null;
          }),
        ),
      if (_pickup != null &&
          _returnAt != null &&
          _returnAt!.isAfter(_pickup!) &&
          _pickupLocation != null &&
          _returnLocation != null)
        BookingSummary(draft: _draft()),
      if (_error != null)
        Text(
          _error!,
          style: TextStyle(color: Theme.of(context).colorScheme.error),
        ),
      FilledButton(onPressed: _review, child: const Text('Continue to Review')),
    ],
  );
}

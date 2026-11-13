import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

import '../../../../app/theme/app_theme.dart';
import '../../../../app/router/app_router.dart';
import '../../../../core/utils/format_pesos.dart';
import '../../domain/local_booking.dart';
import 'booking_summary.dart';

class BookingCard extends StatelessWidget {
  const BookingCard({super.key, required this.booking, this.isDemo = false});
  final LocalBooking booking;
  final bool isDemo;

  void _openDetails(BuildContext context) {
    FocusManager.instance.primaryFocus?.unfocus();
    Navigator.of(context).pushNamed(
      AppRouter.bookingDetails,
      arguments: (bookingId: booking.id, isDemo: kDebugMode && isDemo),
    );
  }

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    child: Card(
      clipBehavior: Clip.antiAlias,
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: () => _openDetails(context),
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.fieldSpacing),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: AppTheme.smallSpacing,
            children: [
              Text(
                'Reference: ${booking.id}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              Text(
                booking.draft.vehicle.name,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              Text('Pickup: ${scheduleLabel(context, booking.draft.pickup)}'),
              Text('Return: ${scheduleLabel(context, booking.draft.returnAt)}'),
              Text('Estimated total: ${formatPesos(booking.quote.totalPesos)}'),
              Text('Status: ${booking.status}'),
              const Text('Not a real reservation.'),
              Text(
                'View booking details',
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

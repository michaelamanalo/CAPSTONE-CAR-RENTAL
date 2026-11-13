import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';
import '../../../../core/utils/format_pesos.dart';
import '../../domain/booking_draft.dart';
import '../../domain/rental_pricing.dart';

String scheduleLabel(BuildContext context, DateTime value) =>
    '${MaterialLocalizations.of(context).formatFullDate(value)} · ${TimeOfDay.fromDateTime(value).format(context)}';

class BookingSummary extends StatelessWidget {
  const BookingSummary({super.key, required this.draft, this.quote});
  final BookingDraft draft;
  final RentalQuote? quote;
  @override
  Widget build(BuildContext context) {
    final quote = this.quote ?? draft.quote;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppTheme.smallSpacing,
      children: [
        Text(draft.vehicle.name, style: Theme.of(context).textTheme.titleLarge),
        Text('Pickup: ${scheduleLabel(context, draft.pickup)}'),
        Text('Return: ${scheduleLabel(context, draft.returnAt)}'),
        Text('Pickup location (temporary): ${draft.pickupLocation}'),
        Text('Return location (temporary): ${draft.returnLocation}'),
        Text(
          'Rental duration: ${quote.elapsed.inHours}h ${quote.elapsed.inMinutes.remainder(60)}m',
        ),
        Text(
          'Billed duration: ${quote.billedDays} day${quote.billedDays == 1 ? '' : 's'}',
        ),
        Text('Estimated total: ${formatPesos(quote.totalPesos)}'),
      ],
    );
  }
}

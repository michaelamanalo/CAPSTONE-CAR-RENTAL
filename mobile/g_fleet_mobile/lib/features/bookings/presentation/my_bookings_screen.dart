import 'package:flutter/material.dart';

import '../../../app/theme/app_theme.dart';
import 'booking_scope.dart';
import 'widgets/booking_card.dart';

/// Embedded in the existing Home tab shell; it owns no booking records.
class MyBookingsScreen extends StatelessWidget {
  const MyBookingsScreen({
    super.key,
    required this.onBrowseVehicles,
    this.isDemo = false,
  });
  final VoidCallback onBrowseVehicles;
  final bool isDemo;

  @override
  Widget build(BuildContext context) {
    final store = BookingScope.read(context);
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final bookings = store.bookings.toList()
          ..sort((a, b) {
            final byTime = b.createdAt.compareTo(a.createdAt);
            return byTime != 0 ? byTime : b.id.compareTo(a.id);
          });
        return Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: AppTheme.dashboardMaxWidth,
            ),
            child: ListView.separated(
              key: const PageStorageKey('my-bookings'),
              padding: const EdgeInsets.all(AppTheme.pagePadding),
              itemCount: bookings.isEmpty ? 2 : bookings.length + 1,
              separatorBuilder: (context, index) =>
                  const SizedBox(height: AppTheme.fieldSpacing),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    spacing: AppTheme.smallSpacing,
                    children: [
                      Text(
                        'My Bookings',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const Text(
                        'Local mock bookings for this Home visit only. No real reservations or payments.',
                      ),
                    ],
                  );
                }
                if (bookings.isEmpty) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: AppTheme.fieldSpacing,
                    children: [
                      const Icon(Icons.event_note_outlined, size: 48),
                      Text(
                        'No bookings yet',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const Text(
                        'Browse sample vehicles to create a local mock booking. Nothing is reserved.',
                      ),
                      FilledButton(
                        onPressed: onBrowseVehicles,
                        child: const Text(
                          'Browse Sample Vehicles',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  );
                }
                final booking = bookings[index - 1];
                return BookingCard(
                  key: ValueKey(booking.id),
                  booking: booking,
                  isDemo: isDemo,
                );
              },
            ),
          ),
        );
      },
    );
  }
}

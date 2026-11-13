import 'package:flutter/material.dart';

import '../data/booking_store.dart';
import '../domain/booking_draft.dart';
import '../domain/local_booking.dart';
import 'booking_scope.dart';
import 'widgets/booking_page.dart';
import 'widgets/booking_summary.dart';

class BookingReviewScreen extends StatefulWidget {
  const BookingReviewScreen({
    super.key,
    required this.draft,
    this.isDemo = false,
  });
  final BookingDraft draft;
  final bool isDemo;

  @override
  State<BookingReviewScreen> createState() => _BookingReviewScreenState();
}

class _BookingReviewScreenState extends State<BookingReviewScreen> {
  BookingStore? _store;
  int? _visitId;
  LocalBooking? _booking;
  String? _error;
  bool _leaving = false;

  void _leave(bool confirmed) {
    if (_leaving || !mounted) return;
    _leaving = true;
    Navigator.of(context).pop(confirmed);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _store ??= BookingScope.read(context);
    _visitId ??= _store!.visitId;
  }

  void _confirm() {
    if (_booking != null) return;
    try {
      final booking = _store!.confirm(widget.draft, visitId: _visitId!);
      setState(() {
        _booking = booking;
        _error = null;
      });
    } on ArgumentError catch (error) {
      setState(() => _error = error.message.toString());
    } on StateError catch (error) {
      setState(() => _error = error.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final invalid = BookingStore.validationError(widget.draft, DateTime.now());
    return PopScope<Object?>(
      canPop: _booking == null,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _booking != null) _leave(true);
      },
      child: BookingPage(
        title: 'Review booking',
        isDemo: widget.isDemo,
        children: [
          const Text(
            'Sample data only. No actual reservation, payment, or staff approval is created.',
          ),
          if (_booking != null) ...[
            const Icon(Icons.check_circle_outline, size: 48),
            Text(
              'Mock booking saved',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Text('Reference: ${_booking!.id}'),
            Text('Status: ${_booking!.status}'),
            BookingSummary(draft: _booking!.draft, quote: _booking!.quote),
            const Text(
              'Stored only in memory for this Home visit. View your local examples in My Bookings.',
            ),
            FilledButton(
              onPressed: () => _leave(true),
              child: const Text(
                'View My Bookings',
                textAlign: TextAlign.center,
              ),
            ),
          ] else ...[
            if (invalid == null) BookingSummary(draft: widget.draft),
            if (_error != null || invalid != null)
              Text(
                _error ?? invalid!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            const Text(
              'Temporary estimate: each started 24-hour period at the sample daily rate. No extra fees.',
            ),
            OutlinedButton(
              onPressed: () => _leave(false),
              child: const Text('Edit Booking'),
            ),
            FilledButton(
              onPressed: invalid == null ? _confirm : null,
              child: const Text('Confirm Mock Booking'),
            ),
          ],
        ],
      ),
    );
  }
}

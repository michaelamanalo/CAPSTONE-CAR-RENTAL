import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/utils/format_pesos.dart';
import '../data/booking_store.dart';
import '../domain/rental_schedule.dart';
import 'booking_scope.dart';
import 'widgets/booking_page.dart';
import 'widgets/booking_summary.dart';

class BookingDetailsScreen extends StatefulWidget {
  const BookingDetailsScreen({
    super.key,
    required this.bookingId,
    this.isDemo = false,
  });
  final String bookingId;
  final bool isDemo;

  @override
  State<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends State<BookingDetailsScreen>
    with WidgetsBindingObserver {
  BookingStore? _store;
  Timer? _timer;
  DateTime _now = DateTime.now();
  bool _foreground = true;
  bool _leaving = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_store == null) {
      _store = BookingScope.read(context);
      _store!.addListener(_refresh);
      _syncTimer();
    }
  }

  void _syncTimer() {
    final booking = _store!.findById(widget.bookingId);
    if (!_foreground ||
        booking == null ||
        !_now.isBefore(booking.draft.returnAt)) {
      _timer?.cancel();
      _timer = null;
    } else {
      _timer ??= Timer.periodic(const Duration(minutes: 1), (_) => _refresh());
    }
  }

  void _refresh() {
    if (!mounted) return;
    setState(() => _now = DateTime.now());
    _syncTimer();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _foreground = state == AppLifecycleState.resumed;
    if (_foreground) {
      _refresh();
    } else {
      _timer?.cancel();
      _timer = null;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _store?.removeListener(_refresh);
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  void _back() {
    if (_leaving) return;
    _leaving = true;
    Navigator.of(context).pop();
  }

  String _remaining(Duration duration) {
    // Round up so a positive sub-minute interval never reads as zero remaining.
    final minutes =
        (duration.inMicroseconds + Duration.microsecondsPerMinute - 1) ~/
        Duration.microsecondsPerMinute;
    return '${minutes ~/ 1440}d ${(minutes ~/ 60) % 24}h ${minutes % 60}m';
  }

  @override
  Widget build(BuildContext context) {
    // Always resolve current data by ID, including after a store reset.
    final booking = _store!.findById(widget.bookingId);
    if (booking == null) {
      return BookingPage(
        title: 'Booking details',
        isDemo: widget.isDemo,
        children: [
          const Icon(Icons.event_busy_outlined, size: 48),
          Text(
            'Booking Unavailable',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const Text('This local mock booking is no longer available.'),
          FilledButton(
            onPressed: _back,
            child: const Text(
              'Back to My Bookings',
              textAlign: TextAlign.center,
            ),
          ),
        ],
      );
    }
    final schedule = RentalSchedule.evaluate(
      pickup: booking.draft.pickup,
      returnAt: booking.draft.returnAt,
      now: _now,
    );
    final indicator = switch (schedule.phase) {
      SchedulePhase.pickupPending =>
        'Until scheduled pickup: ${_remaining(schedule.remaining)}',
      SchedulePhase.returnPending =>
        'Until scheduled return: ${_remaining(schedule.remaining)}',
      SchedulePhase.returnPassed => 'Scheduled return time has passed.',
    };
    return BookingPage(
      title: 'Booking details',
      isDemo: widget.isDemo,
      children: [
        Text(
          'Reference: ${booking.id}',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        Text('Status: ${booking.status}'),
        const Text(
          'Mock data only. Not a real reservation, payment, approval, or vehicle handover.',
        ),
        BookingSummary(draft: booking.draft, quote: booking.quote),
        Text('Category: ${booking.draft.vehicle.category}'),
        Text(
          'Illustrative daily rate: ${formatPesos(booking.draft.vehicle.dailyRatePesos)}',
        ),
        Text(indicator, style: Theme.of(context).textTheme.titleMedium),
        const Text(
          'Schedule only — based on local pickup and return times. No collection or return is confirmed. Refreshes each minute while this screen is open.',
        ),
      ],
    );
  }
}

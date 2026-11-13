import 'package:flutter/widgets.dart';

import '../data/booking_store.dart';

class BookingScope extends InheritedNotifier<BookingStore> {
  const BookingScope({
    super.key,
    required BookingStore store,
    required super.child,
  }) : super(notifier: store);

  /// Read without subscribing; reactive consumers can use ListenableBuilder.
  static BookingStore read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<BookingScope>();
    if (scope == null) throw StateError('BookingScope is required.');
    return scope.notifier!;
  }
}

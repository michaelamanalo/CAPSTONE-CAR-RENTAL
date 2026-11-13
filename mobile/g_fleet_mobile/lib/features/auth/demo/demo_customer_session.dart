import 'package:flutter/foundation.dart';

/// Debug-only UI identity. Never a credential or an authenticated session.
class DemoCustomerSession {
  DemoCustomerSession.start() {
    if (!kDebugMode) {
      throw UnsupportedError('Demo customer access is debug-only.');
    }
    _customer = (name: 'Alex Demo', email: 'customer@example.invalid');
  }

  ({String name, String email})? _customer;

  ({String name, String email})? get customer => _customer;

  void clear() => _customer = null;
}

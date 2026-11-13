import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../app/theme/app_theme.dart';
import '../../auth/demo/demo_customer_session.dart';

/// Presentation only: Home retains ownership of identity, navigation and cleanup.
class CustomerProfileScreen extends StatelessWidget {
  const CustomerProfileScreen({
    super.key,
    this.demoSession,
    required this.onLogin,
    required this.onRegister,
    required this.onViewBookings,
    required this.onExitDemo,
  });

  final DemoCustomerSession? demoSession;
  final VoidCallback onLogin;
  final VoidCallback onRegister;
  final VoidCallback onViewBookings;
  final VoidCallback onExitDemo;

  Widget _section(BuildContext context, String title, List<Widget> children) =>
      Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.fieldSpacing),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: AppTheme.fieldSpacing,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              ...children,
            ],
          ),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final customer = kDebugMode ? demoSession?.customer : null;
    return SingleChildScrollView(
      key: const PageStorageKey('customer-profile'),
      padding: const EdgeInsets.all(AppTheme.pagePadding),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppTheme.dashboardMaxWidth,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: AppTheme.sectionSpacing,
            children: [
              Text(
                'Customer Profile',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              Align(
                child: CircleAvatar(
                  radius: 32,
                  child: Icon(
                    customer == null ? Icons.person_outline : Icons.person,
                    size: 32,
                    semanticLabel: customer == null
                        ? 'Guest avatar'
                        : 'Demo avatar',
                  ),
                ),
              ),
              _section(context, 'Account information', [
                if (customer == null) ...[
                  Text(
                    'Guest profile',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const Text(
                    'You are browsing without signing in. No authenticated account is active.',
                  ),
                  FilledButton(onPressed: onLogin, child: const Text('Login')),
                  OutlinedButton(
                    onPressed: onRegister,
                    child: const Text('Register'),
                  ),
                ] else ...[
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Chip(label: Text('Demo Customer')),
                  ),
                  Text(
                    customer.name,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text(customer.email),
                  const Text(
                    'Temporary local demonstration account. No real authentication or backend access.',
                  ),
                ],
              ]),
              FilledButton(
                onPressed: onViewBookings,
                child: const Text('My Bookings', textAlign: TextAlign.center),
              ),
              _section(context, 'Account settings', [
                const Text(
                  'Not available in this demo. Account editing and settings are not connected.',
                ),
              ]),
              _section(context, 'Help and support', [
                const Text(
                  'Not available in this demo. No support requests or messages can be sent.',
                ),
              ]),
              if (customer != null)
                OutlinedButton(
                  onPressed: onExitDemo,
                  child: const Text('Exit Demo'),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../../app/router/app_router.dart';
import '../../../core/widgets/placeholder_page.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PlaceholderPage(
      title: 'G-FLEET',
      message: 'Welcome to G-FLEET',
      action: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FilledButton(
            onPressed: () => Navigator.of(context).pushNamed(AppRouter.home),
            child: const Text('Continue'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pushNamed(AppRouter.login),
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }
}

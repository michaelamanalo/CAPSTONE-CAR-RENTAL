import 'package:flutter/material.dart';

import '../../app/theme/app_theme.dart';

/// Shared layout for the temporary foundation screens.
class PlaceholderPage extends StatelessWidget {
  const PlaceholderPage({
    super.key,
    required this.title,
    required this.message,
    this.action,
  });

  final String title;
  final String message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppTheme.pagePadding),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                if (action != null) ...[
                  const SizedBox(height: AppTheme.sectionSpacing),
                  action!,
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

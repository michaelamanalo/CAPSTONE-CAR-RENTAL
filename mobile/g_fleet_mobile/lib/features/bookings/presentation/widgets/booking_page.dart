import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';

class BookingPage extends StatelessWidget {
  const BookingPage({
    super.key,
    required this.title,
    required this.children,
    this.isDemo = false,
  });
  final String title;
  final List<Widget> children;
  final bool isDemo;

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(title),
      actions: [
        if (kDebugMode && isDemo)
          const Padding(
            padding: EdgeInsets.only(right: AppTheme.fieldSpacing),
            child: Chip(
              label: Text('DEMO'),
              visualDensity: VisualDensity.compact,
            ),
          ),
      ],
    ),
    body: SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.pagePadding),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: AppTheme.dashboardMaxWidth,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: AppTheme.fieldSpacing,
              children: children,
            ),
          ),
        ),
      ),
    ),
  );
}

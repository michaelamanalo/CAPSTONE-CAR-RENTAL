import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';

/// Scrollable form shared by the customer authentication screens.
class AuthLayout extends StatelessWidget {
  const AuthLayout({
    super.key,
    required this.title,
    required this.description,
    required this.formKey,
    required this.children,
  });

  final String title;
  final String description;
  final GlobalKey<FormState> formKey;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.all(AppTheme.pagePadding),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: AppTheme.formMaxWidth,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      DecoratedBox(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(
                            AppTheme.controlRadius,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(AppTheme.brandPadding),
                          child: Icon(
                            Icons.directions_car_outlined,
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppTheme.brandPadding),
                      Flexible(
                        child: Text(
                          'G-FLEET',
                          style: theme.textTheme.titleLarge,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.sectionSpacing),
                  Text(title, style: theme.textTheme.headlineMedium),
                  const SizedBox(height: AppTheme.smallSpacing),
                  Text(
                    description,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppTheme.sectionSpacing),
                  Form(
                    key: formKey,
                    autovalidateMode: AutovalidateMode.onUserInteraction,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      spacing: AppTheme.fieldSpacing,
                      children: children,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Informational only: no account, session, or recovery request is created.
void showBackendNotice(BuildContext context, {bool recovery = false}) {
  FocusScope.of(context).unfocus();
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Text(
          recovery
              ? 'Password recovery is not connected yet. No reset email has been sent.'
              : 'Authentication will be available after backend integration.',
        ),
      ),
    );
}

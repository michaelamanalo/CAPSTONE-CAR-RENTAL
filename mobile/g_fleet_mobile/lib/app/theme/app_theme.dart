import 'package:flutter/material.dart';

abstract final class AppTheme {
  // Temporary brand color. Replace here when G-FLEET branding is finalized.
  static const _seedColor = Color(0xFF2457C5);
  static const pagePadding = 24.0;
  static const sectionSpacing = 24.0;
  static const fieldSpacing = 16.0;
  static const smallSpacing = 8.0;
  static const brandPadding = 12.0;
  static const controlRadius = 14.0;
  static const controlHeight = 52.0;
  static const formMaxWidth = 440.0;
  static const dashboardMaxWidth = 720.0;

  static final light = _build(Brightness.light);
  static final dark = _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final colors = ColorScheme.fromSeed(
      seedColor: _seedColor,
      brightness: brightness,
    );
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(controlRadius),
      borderSide: BorderSide(color: colors.outline),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colors,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.surfaceContainerLowest,
        border: border,
        enabledBorder: border,
        contentPadding: const EdgeInsets.all(fieldSpacing),
        errorMaxLines: 3,
        helperMaxLines: 3,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, controlHeight),
          padding: const EdgeInsets.symmetric(
            horizontal: pagePadding,
            vertical: fieldSpacing,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(controlRadius),
          ),
        ),
      ),
    );
  }
}

G-FLEET mobile (placeholder)

This folder contains a placeholder Flutter project structure so the repository starts with a mobile app layout.

Important:
- The environment where this helper runs does not have the Flutter SDK installed, so a full runnable Flutter project cannot be created here.

What to do locally (recommended):
1. Install Flutter: https://flutter.dev/docs/get-started/install
2. From the repository root run:
   cd mobile
   flutter create g_fleet_mobile
3. Replace lib/main.dart with the provided main.dart and lib/screens/home_screen.dart if you prefer the simple starting screen, or keep the scaffold created by Flutter.
4. Run the app:
   cd mobile\g_fleet_mobile
   flutter pub get
   flutter devices
   flutter run

Files added as placeholders:
- pubspec.yaml (minimal)
- lib/main.dart
- lib/screens/home_screen.dart
- lib/widgets/.gitkeep
- lib/models/.gitkeep
- lib/services/.gitkeep

If you'd like, I can also stage, commit and push these files for you from here. Would you like me to run the git add/commit/push steps now?
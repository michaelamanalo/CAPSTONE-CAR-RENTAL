import 'package:flutter/material.dart';

import 'router/app_router.dart';
import 'theme/app_theme.dart';
import '../features/bookings/data/booking_store.dart';
import '../features/bookings/presentation/booking_scope.dart';

class GFleetApp extends StatefulWidget {
  const GFleetApp({super.key});

  @override
  State<GFleetApp> createState() => _GFleetAppState();
}

class _GFleetAppState extends State<GFleetApp> {
  final _bookings = BookingStore();

  @override
  void dispose() {
    _bookings.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BookingScope(
      store: _bookings,
      child: MaterialApp(
        title: 'G-FLEET',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        themeMode: ThemeMode.system,
        initialRoute: AppRouter.landing,
        routes: AppRouter.routes,
      ),
    );
  }
}

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'screens/home_screen.dart';
import 'supabase_connection_probe.dart';
import 'supabase_settings.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final settings = SupabaseSettings.fromEnvironment();
  if (settings == null) {
    debugPrint(
      'Supabase is not configured. Provide SUPABASE_URL and '
      'SUPABASE_ANON_KEY with --dart-define.',
    );
  } else {
    await Supabase.initialize(
      url: settings.url,
      publishableKey: settings.anonKey,
    );
    unawaited(_checkSupabaseConnection(settings));
  }

  runApp(const GFleetApp());
}

Future<void> _checkSupabaseConnection(SupabaseSettings settings) async {
  final client = http.Client();

  try {
    final isConnected = await SupabaseConnectionProbe(client).check(settings);
    debugPrint(
      isConnected
          ? 'Supabase connection test succeeded.'
          : 'Supabase connection test returned a non-success status.',
    );
  } catch (error) {
    debugPrint('Supabase connection test failed: $error');
  } finally {
    client.close();
  }
}

class GFleetApp extends StatelessWidget {
  const GFleetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'G-FLEET',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const HomeScreen(),
    );
  }
}

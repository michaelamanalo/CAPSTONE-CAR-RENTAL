import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const GFleetApp());
}

class GFleetApp extends StatelessWidget {
  const GFleetApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'G-FLEET',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const HomeScreen(),
    );
  }
}

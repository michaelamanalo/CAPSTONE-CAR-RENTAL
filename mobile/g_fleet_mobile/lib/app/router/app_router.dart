import 'package:flutter/widgets.dart';

import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/registration_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/home/presentation/landing_screen.dart';

abstract final class AppRouter {
  static const landing = '/';
  static const home = '/home';
  static const login = '/login';
  static const registration = '/register';
  static const forgotPassword = '/forgot-password';

  static final Map<String, WidgetBuilder> routes = {
    landing: (_) => const LandingScreen(),
    home: (_) => const HomeScreen(),
    login: (_) => const LoginScreen(),
    registration: (_) => const RegistrationScreen(),
    forgotPassword: (_) => const ForgotPasswordScreen(),
  };
}

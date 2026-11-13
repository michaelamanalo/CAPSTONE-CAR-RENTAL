import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../../core/widgets/placeholder_page.dart';
import '../../features/auth/demo/demo_customer_session.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/registration_screen.dart';
import '../../features/home/data/sample_vehicles.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/home/presentation/landing_screen.dart';
import '../../features/vehicles/presentation/vehicle_details_screen.dart';
import '../../features/bookings/presentation/booking_form_screen.dart';
import '../../features/bookings/domain/booking_draft.dart';
import '../../features/bookings/presentation/booking_review_screen.dart';
import '../../features/bookings/presentation/booking_details_screen.dart';

abstract final class AppRouter {
  static const landing = '/';
  static const home = '/home';
  static const login = '/login';
  static const registration = '/register';
  static const forgotPassword = '/forgot-password';
  static const vehicleDetails = '/vehicle-details';
  static const bookingForm = '/booking-form';
  static const bookingReview = '/booking-review';
  static const bookingDetails = '/booking-details';

  static final Map<String, WidgetBuilder> routes = {
    landing: (_) => const LandingScreen(),
    home: (context) {
      final arguments = ModalRoute.of(context)?.settings.arguments;
      return HomeScreen(
        demoSession: kDebugMode && arguments is DemoCustomerSession
            ? arguments
            : null,
      );
    },
    login: (_) => const LoginScreen(),
    registration: (_) => const RegistrationScreen(),
    forgotPassword: (_) => const ForgotPasswordScreen(),
    vehicleDetails: (context) {
      final arguments = ModalRoute.of(context)?.settings.arguments;
      if (arguments is! ({SampleVehicle vehicle, bool isDemo})) {
        return const PlaceholderPage(
          title: 'Vehicle details',
          message: 'No vehicle selected',
        );
      }
      return VehicleDetailsScreen(
        vehicle: arguments.vehicle,
        isDemo: kDebugMode && arguments.isDemo,
      );
    },
    bookingForm: (context) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is! ({SampleVehicle vehicle, bool isDemo})) {
        return const PlaceholderPage(
          title: 'Booking form',
          message: 'No vehicle selected',
        );
      }
      return BookingFormScreen(
        vehicle: args.vehicle,
        isDemo: kDebugMode && args.isDemo,
      );
    },
    bookingReview: (context) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is! ({BookingDraft draft, bool isDemo})) {
        return const PlaceholderPage(
          title: 'Review booking',
          message: 'No booking draft selected',
        );
      }
      return BookingReviewScreen(
        draft: args.draft,
        isDemo: kDebugMode && args.isDemo,
      );
    },
    bookingDetails: (context) {
      final args = ModalRoute.of(context)?.settings.arguments;
      return BookingDetailsScreen(
        bookingId: args is ({String bookingId, bool isDemo})
            ? args.bookingId
            : '',
        isDemo:
            kDebugMode &&
            args is ({String bookingId, bool isDemo}) &&
            args.isDemo,
      );
    },
  };
}

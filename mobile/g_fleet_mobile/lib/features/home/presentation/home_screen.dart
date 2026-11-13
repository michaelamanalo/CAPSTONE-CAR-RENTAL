import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../app/theme/app_theme.dart';
import '../../../app/router/app_router.dart';
import '../../auth/demo/demo_customer_session.dart';
import '../data/sample_vehicles.dart';
import 'widgets/vehicle_dashboard.dart';
import '../../bookings/data/booking_store.dart';
import '../../bookings/presentation/booking_scope.dart';
import '../../bookings/presentation/my_bookings_screen.dart';
import '../../profile/presentation/customer_profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.demoSession});

  final DemoCustomerSession? demoSession;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedTab = 0;
  BookingStore? _bookings;
  int? _bookingVisitId;
  bool _leavingHome = false;

  void _openGuestAuth({bool register = false}) {
    if (_leavingHome) return;
    _leavingHome = true;
    _bookings?.endVisit(visitId: _bookingVisitId);
    final navigator = Navigator.of(context);
    // End the preview visit instead of nesting another Home/session beneath auth.
    navigator.popAndPushNamed(AppRouter.login);
    if (register) navigator.pushNamed(AppRouter.registration);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_bookings == null) {
      _bookings = BookingScope.read(context);
      _bookingVisitId = _bookings!.startVisit();
    }
  }

  Future<void> _openVehicle(SampleVehicle vehicle) async {
    FocusManager.instance.primaryFocus?.unfocus();
    final confirmed = await Navigator.of(context).pushNamed(
      AppRouter.vehicleDetails,
      arguments: (
        vehicle: vehicle,
        isDemo: kDebugMode && widget.demoSession?.customer != null,
      ),
    );
    if (mounted && confirmed == true) setState(() => _selectedTab = 1);
  }

  @override
  void dispose() {
    // Also clear when the route is removed or the whole app is unmounted.
    widget.demoSession?.clear();
    // Consumers are being removed; do not notify widgets during tree disposal.
    _bookings?.endVisit(visitId: _bookingVisitId, notify: false);
    super.dispose();
  }

  void _exitDemo() {
    if (_leavingHome) return;
    _leavingHome = true;
    _bookings?.endVisit(visitId: _bookingVisitId);
    widget.demoSession?.clear();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final customer = kDebugMode ? widget.demoSession?.customer : null;
    return Scaffold(
      appBar: AppBar(
        title: const Text('G-FLEET'),
        actions: [
          if (customer != null)
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
        child: IndexedStack(
          index: _selectedTab,
          children: [
            VehicleDashboard(onVehicleSelected: _openVehicle),
            MyBookingsScreen(
              isDemo: customer != null,
              onBrowseVehicles: () => setState(() => _selectedTab = 0),
            ),
            const _TabPreview(
              title: 'Messages',
              message: 'Customer messaging is not connected yet.',
            ),
            CustomerProfileScreen(
              demoSession: widget.demoSession,
              onLogin: () => _openGuestAuth(),
              onRegister: () => _openGuestAuth(register: true),
              onViewBookings: () {
                if (mounted && !_leavingHome) setState(() => _selectedTab = 1);
              },
              onExitDemo: _exitDemo,
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedTab,
        onDestinationSelected: (index) {
          FocusScope.of(context).unfocus();
          setState(() => _selectedTab = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_today_outlined),
            label: 'Bookings',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            label: 'Messages',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _TabPreview extends StatelessWidget {
  const _TabPreview({required this.title, required this.message});

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.pagePadding),
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppTheme.dashboardMaxWidth,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: AppTheme.fieldSpacing,
            children: [
              Text(
                '$title preview',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              Text(message, textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/widgets.dart';

import '../../../core/widgets/placeholder_page.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderPage(
      title: 'Home',
      message: 'Your journey starts here.',
    );
  }
}

import 'package:flutter/material.dart';
import 'screens/pos/pos_billing_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PosIndiaApp());
}

class PosIndiaApp extends StatelessWidget {
  const PosIndiaApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'POSIndia.shop Billing',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          primary: const Color(0xFF10B981),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const PosBillingScreen(
        tenantId: 'store_delhi_001',
        cashierName: 'Harish Patel',
      ),
    );
  }
}

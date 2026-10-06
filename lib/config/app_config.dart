// ==============================================================================
// FILE: lib/config/app_config.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// ==============================================================================

class AppConfig {
  static const String baseUrl = 'https://posindia.shop/api/';
  static const String defaultTenantId = 'store_delhi_001';
  static const String defaultStoreName = 'POSIndia Retail Hub';
  static const String storeGstin = '07AABCP1334M1ZX';
  static const String storeAddress = 'Connaught Place, New Delhi - 110001';
  static const String storePhone = '+91 98765 43210';
  static const List<double> gstRates = [0.0, 5.0, 12.0, 18.0, 28.0];

  static Map<String, String> getHeaders({required String tenantId, String? authToken}) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Tenant-Id': tenantId,
      'X-Client-Platform': 'Flutter-POS-Terminal',
      'X-App-Version': '3.4.0',
    };
    if (authToken != null) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }
}

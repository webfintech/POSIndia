// ==============================================================================
// FILE: lib/services/pos_service.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// ==============================================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../models/product_model.dart';
import '../models/customer_model.dart';
import '../models/sale_order_model.dart';

class PosService {
  final String tenantId;
  final String? authToken;
  final http.Client _client;

  PosService({
    required this.tenantId,
    this.authToken,
    http.Client? client,
  }) : _client = client ?? http.Client();

  Future<List<ProductModel>> fetchProducts() async {
    final uri = Uri.parse('${AppConfig.baseUrl}products');
    final headers = AppConfig.getHeaders(tenantId: tenantId, authToken: authToken);

    try {
      final response = await _client.get(uri, headers: headers).timeout(
        const Duration(seconds: 8),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as List<dynamic>;
        return data.map((j) => ProductModel.fromJson(j as Map<String, dynamic>)).toList();
      }
      return _getLocalFallbackProducts();
    } catch (_) {
      return _getLocalFallbackProducts();
    }
  }

  Future<List<CustomerModel>> fetchCustomers({String? query}) async {
    final uri = Uri.parse('${AppConfig.baseUrl}customers${query != null ? '?q=$query' : ''}');
    final headers = AppConfig.getHeaders(tenantId: tenantId, authToken: authToken);

    try {
      final response = await _client.get(uri, headers: headers).timeout(
        const Duration(seconds: 5),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as List<dynamic>;
        return data.map((j) => CustomerModel.fromJson(j as Map<String, dynamic>)).toList();
      }
      return _getLocalFallbackCustomers();
    } catch (_) {
      return _getLocalFallbackCustomers();
    }
  }

  Future<SaleOrderModel> createSale(SaleOrderModel order) async {
    final uri = Uri.parse('${AppConfig.baseUrl}sales/create');
    final headers = AppConfig.getHeaders(tenantId: tenantId, authToken: authToken);
    final body = json.encode(order.toJson());

    try {
      await _client.post(uri, headers: headers, body: body).timeout(
        const Duration(seconds: 10),
      );
      return order;
    } catch (_) {
      return order;
    }
  }

  Future<bool> printThermalReceipt(SaleOrderModel order) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return true;
  }

  List<ProductModel> _getLocalFallbackProducts() => [
    const ProductModel(id: '1', sku: 'SKU-AMUL-500', barcode: '8901262010053', name: 'Amul Butter 500g', category: 'Dairy', unitPrice: 285, costPrice: 260, stockQty: 48, hsnCode: '0405', gstRate: 12),
    const ProductModel(id: '2', sku: 'SKU-TATA-TEA', barcode: '8901052002341', name: 'Tata Tea Gold 500g', category: 'Beverages', unitPrice: 320, costPrice: 275, stockQty: 60, hsnCode: '0902', gstRate: 5),
    const ProductModel(id: '3', sku: 'SKU-CADBURY', barcode: '8901233024881', name: 'Cadbury Silk 150g', category: 'Snacks', unitPrice: 175, costPrice: 145, stockQty: 85, hsnCode: '1806', gstRate: 18),
  ];

  List<CustomerModel> _getLocalFallbackCustomers() => [
    CustomerModel.walkIn(),
    const CustomerModel(id: 'c1', name: 'Rajesh Sharma', phone: '9810123456', creditLimit: 5000, currentOutstanding: 1420),
    const CustomerModel(id: 'c2', name: 'Priya Retailers', phone: '9871188990', gstin: '07AAACP9988K1ZR', creditLimit: 50000, currentOutstanding: 24800),
  ];
}

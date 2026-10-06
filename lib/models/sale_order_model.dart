// ==============================================================================
// FILE: lib/models/sale_order_model.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// ==============================================================================

import 'customer_model.dart';
import 'cart_item_model.dart';

enum PaymentMode { cash, upi, card, credit }

class SaleOrderModel {
  final String invoiceNumber;
  final String tenantId;
  final String storeName;
  final String cashierName;
  final CustomerModel customer;
  final List<CartItemModel> items;
  final double subtotal;
  final double totalDiscount;
  final double taxableValue;
  final double cgstTotal;
  final double sgstTotal;
  final double totalGst;
  final double roundOff;
  final double grandTotal;
  final PaymentMode paymentMode;
  final double? cashTendered;
  final double? cashChange;
  final String? upiRefId;
  final String? cardAuthCode;
  final DateTime createdAt;

  const SaleOrderModel({
    required this.invoiceNumber,
    required this.tenantId,
    required this.storeName,
    required this.cashierName,
    required this.customer,
    required this.items,
    required this.subtotal,
    required this.totalDiscount,
    required this.taxableValue,
    required this.cgstTotal,
    required this.sgstTotal,
    required this.totalGst,
    required this.roundOff,
    required this.grandTotal,
    required this.paymentMode,
    this.cashTendered,
    this.cashChange,
    this.upiRefId,
    this.cardAuthCode,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'invoiceNumber': invoiceNumber,
    'tenantId': tenantId,
    'storeName': storeName,
    'cashierName': cashierName,
    'customer': customer.toJson(),
    'items': items.map((i) => i.toJson()).toList(),
    'subtotal': subtotal,
    'totalDiscount': totalDiscount,
    'taxableValue': taxableValue,
    'cgstTotal': cgstTotal,
    'sgstTotal': sgstTotal,
    'totalGst': totalGst,
    'roundOff': roundOff,
    'grandTotal': grandTotal,
    'paymentMode': paymentMode.name.toUpperCase(),
    'paymentDetails': {
      'cashTendered': cashTendered,
      'cashChange': cashChange,
      'upiRefId': upiRefId,
      'cardAuthCode': cardAuthCode,
    },
    'createdAt': createdAt.toIso8601String(),
  };
}

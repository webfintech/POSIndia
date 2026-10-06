// ==============================================================================
// FILE: lib/models/cart_item_model.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// ==============================================================================

import 'product_model.dart';

enum DiscountType { percentage, fixed }

class CartItemModel {
  final String id;
  final ProductModel product;
  final int quantity;
  final DiscountType discountType;
  final double discountValue;

  const CartItemModel({
    required this.id,
    required this.product,
    required this.quantity,
    this.discountType = DiscountType.percentage,
    this.discountValue = 0.0,
  });

  double get grossPrice => product.unitPrice * quantity;

  double get discountAmount {
    if (discountType == DiscountType.percentage) {
      return (grossPrice * discountValue.clamp(0.0, 100.0)) / 100.0;
    }
    return discountValue.clamp(0.0, grossPrice);
  }

  double get netPrice => (grossPrice - discountAmount).clamp(0.0, double.infinity);

  double get taxableAmount {
    if (product.gstRate <= 0) return netPrice;
    return netPrice / (1.0 + (product.gstRate / 100.0));
  }

  double get totalGstAmount => netPrice - taxableAmount;
  double get cgstAmount => totalGstAmount / 2.0;
  double get sgstAmount => totalGstAmount / 2.0;
  double get lineTotal => netPrice;

  CartItemModel copyWith({
    String? id,
    ProductModel? product,
    int? quantity,
    DiscountType? discountType,
    double? discountValue,
  }) {
    return CartItemModel(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      discountType: discountType ?? this.discountType,
      discountValue: discountValue ?? this.discountValue,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'productId': product.id,
    'sku': product.sku,
    'name': product.name,
    'hsnCode': product.hsnCode,
    'gstRate': product.gstRate,
    'unitPrice': product.unitPrice,
    'quantity': quantity,
    'grossPrice': grossPrice,
    'discountAmount': discountAmount,
    'taxableAmount': taxableAmount,
    'cgstAmount': cgstAmount,
    'sgstAmount': sgstAmount,
    'totalGstAmount': totalGstAmount,
    'lineTotal': lineTotal,
  };
}

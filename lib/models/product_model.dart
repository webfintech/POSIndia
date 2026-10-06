// ==============================================================================
// FILE: lib/models/product_model.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// ==============================================================================

class ProductModel {
  final String id;
  final String sku;
  final String barcode;
  final String name;
  final String category;
  final double unitPrice;
  final double costPrice;
  final int stockQty;
  final String hsnCode;
  final double gstRate;
  final String unit;
  final String? imageUrl;

  const ProductModel({
    required this.id,
    required this.sku,
    required this.barcode,
    required this.name,
    required this.category,
    required this.unitPrice,
    required this.costPrice,
    required this.stockQty,
    required this.hsnCode,
    required this.gstRate,
    this.unit = 'Pcs',
    this.imageUrl,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      sku: json['sku'] as String,
      barcode: json['barcode'] as String,
      name: json['name'] as String,
      category: json['category'] as String? ?? 'General',
      unitPrice: (json['unitPrice'] as num).toDouble(),
      costPrice: (json['costPrice'] as num?)?.toDouble() ?? 0.0,
      stockQty: (json['stockQty'] as num?)?.toInt() ?? 0,
      hsnCode: json['hsnCode'] as String? ?? '9999',
      gstRate: (json['gstRate'] as num?)?.toDouble() ?? 18.0,
      unit: json['unit'] as String? ?? 'Pcs',
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'sku': sku,
    'barcode': barcode,
    'name': name,
    'category': category,
    'unitPrice': unitPrice,
    'costPrice': costPrice,
    'stockQty': stockQty,
    'hsnCode': hsnCode,
    'gstRate': gstRate,
    'unit': unit,
    'imageUrl': imageUrl,
  };
}

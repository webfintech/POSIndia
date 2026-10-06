// ==============================================================================
// FILE: lib/models/customer_model.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// ==============================================================================

class CustomerModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? gstin;
  final String? address;
  final double creditLimit;
  final double currentOutstanding;
  final int loyaltyPoints;
  final bool isWalkIn;

  const CustomerModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.gstin,
    this.address,
    this.creditLimit = 0.0,
    this.currentOutstanding = 0.0,
    this.loyaltyPoints = 0,
    this.isWalkIn = false,
  });

  factory CustomerModel.walkIn() => const CustomerModel(
    id: 'walkin_customer',
    name: 'Walk-in Customer',
    phone: '9999999999',
    creditLimit: 0.0,
    currentOutstanding: 0.0,
    loyaltyPoints: 0,
    isWalkIn: true,
  );

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String?,
      gstin: json['gstin'] as String?,
      address: json['address'] as String?,
      creditLimit: (json['creditLimit'] as num?)?.toDouble() ?? 0.0,
      currentOutstanding: (json['currentOutstanding'] as num?)?.toDouble() ?? 0.0,
      loyaltyPoints: (json['loyaltyPoints'] as num?)?.toInt() ?? 0,
      isWalkIn: json['isWalkIn'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'email': email,
    'gstin': gstin,
    'address': address,
    'creditLimit': creditLimit,
    'currentOutstanding': currentOutstanding,
    'loyaltyPoints': loyaltyPoints,
    'isWalkIn': isWalkIn,
  };
}

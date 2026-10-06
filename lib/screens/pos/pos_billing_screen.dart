// ==============================================================================
// FILE: lib/screens/pos/pos_billing_screen.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// AUTHOR: Lead Flutter Architect & SaaS Systems Engineer
// ==============================================================================

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../config/app_config.dart';
import '../../models/product_model.dart';
import '../../models/cart_item_model.dart';
import '../../models/customer_model.dart';
import '../../models/sale_order_model.dart';
import '../../services/pos_service.dart';
import '../../services/esc_pos_generator.dart';

class PosBillingScreen extends StatefulWidget {
  final String tenantId;
  final String cashierName;

  const PosBillingScreen({
    Key? key,
    this.tenantId = 'store_delhi_001',
    this.cashierName = 'Harish Patel',
  }) : super(key: key);

  @override
  State<PosBillingScreen> createState() => _PosBillingScreenState();
}

class _PosBillingScreenState extends State<PosBillingScreen> {
  late final PosService _posService;
  final TextEditingController _searchController = TextEditingController();

  List<ProductModel> _allProducts = [];
  List<ProductModel> _filteredProducts = [];
  List<String> _categories = ['All'];
  String _selectedCategory = 'All';
  bool _isLoading = false;

  List<CustomerModel> _customers = [];
  late CustomerModel _selectedCustomer;
  final List<CartItemModel> _cartItems = [];
  PaymentMode _selectedPaymentMode = PaymentMode.cash;
  bool _isProcessingCheckout = false;
  int _mobileTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _posService = PosService(tenantId: widget.tenantId);
    _selectedCustomer = CustomerModel.walkIn();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final products = await _posService.fetchProducts();
      final customers = await _posService.fetchCustomers();
      if (mounted) {
        setState(() {
          _allProducts = products;
          _filteredProducts = products;
          _categories = ['All', ...products.map((p) => p.category).toSet()];
          _customers = customers;
          _selectedCustomer = customers.isNotEmpty ? customers.first : CustomerModel.walkIn();
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSearch(String query) {
    setState(() {
      final q = query.toLowerCase().trim();
      _filteredProducts = _allProducts.where((p) {
        final matchCat = _selectedCategory == 'All' || p.category == _selectedCategory;
        final matchQuery = q.isEmpty || p.name.toLowerCase().contains(q) || p.barcode.contains(q) || p.sku.toLowerCase().contains(q);
        return matchCat && matchQuery;
      }).toList();
    });
  }

  void _addToCart(ProductModel product) {
    setState(() {
      final idx = _cartItems.indexWhere((item) => item.product.id == product.id);
      if (idx != -1) {
        _cartItems[idx] = _cartItems[idx].copyWith(quantity: _cartItems[idx].quantity + 1);
      } else {
        _cartItems.add(CartItemModel(
          id: 'item_${DateTime.now().millisecondsSinceEpoch}',
          product: product,
          quantity: 1,
        ));
      }
    });
  }

  void _updateQuantity(int index, int delta) {
    setState(() {
      final newQty = _cartItems[index].quantity + delta;
      if (newQty <= 0) {
        _cartItems.removeAt(index);
      } else {
        _cartItems[index] = _cartItems[index].copyWith(quantity: newQty);
      }
    });
  }

  double get _subtotal => _cartItems.fold(0.0, (acc, i) => acc + i.grossPrice);
  double get _taxableValue => _cartItems.fold(0.0, (acc, i) => acc + i.taxableAmount);
  double get _cgst => _cartItems.fold(0.0, (acc, i) => acc + i.cgstAmount);
  double get _sgst => _cartItems.fold(0.0, (acc, i) => acc + i.sgstAmount);
  double get _totalGst => _cartItems.fold(0.0, (acc, i) => acc + i.totalGstAmount);
  double get _grandTotal => _cartItems.fold(0.0, (acc, i) => acc + i.lineTotal).roundToDouble();

  Future<void> _checkout() async {
    if (_cartItems.isEmpty) return;
    setState(() => _isProcessingCheckout = true);

    final order = SaleOrderModel(
      invoiceNumber: 'INV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      tenantId: widget.tenantId,
      storeName: 'POSIndia Retail Hub',
      cashierName: widget.cashierName,
      customer: _selectedCustomer,
      items: List.from(_cartItems),
      subtotal: _subtotal,
      totalDiscount: 0.0,
      taxableValue: _taxableValue,
      cgstTotal: _cgst,
      sgstTotal: _sgst,
      totalGst: _totalGst,
      roundOff: 0.0,
      grandTotal: _grandTotal,
      paymentMode: _selectedPaymentMode,
      createdAt: DateTime.now(),
    );

    await _posService.createSale(order);

    if (mounted) {
      setState(() {
        _isProcessingCheckout = false;
        _cartItems.clear();
      });
      _showReceipt(order);
    }
  }

  void _showReceipt(SaleOrderModel order) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Invoice #${order.invoiceNumber}'),
        content: SingleChildScrollView(
          child: Text(
            EscPosGenerator.generate80mmTextReceipt(order),
            style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
          ),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('POSIndia.shop Billing'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 768;
          if (isWide) {
            return Row(
              children: [
                Expanded(flex: 6, child: _buildCatalog()),
                const VerticalDivider(width: 1),
                Expanded(flex: 4, child: _buildCart()),
              ],
            );
          }
          return _mobileTabIndex == 0 ? _buildCatalog() : _buildCart();
        },
      ),
      bottomNavigationBar: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth >= 768) return const SizedBox.shrink();
          return BottomNavigationBar(
            currentIndex: _mobileTabIndex,
            onTap: (idx) => setState(() => _mobileTabIndex = idx),
            items: [
              const BottomNavigationBarItem(icon: Icon(Icons.grid_view), label: 'Catalog'),
              BottomNavigationBarItem(
                icon: Badge(
                  label: Text('${_cartItems.length}'),
                  isLabelVisible: _cartItems.isNotEmpty,
                  child: const Icon(Icons.shopping_cart),
                ),
                label: 'Cart (₹${_grandTotal.toStringAsFixed(0)})',
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCatalog() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            controller: _searchController,
            onChanged: _onSearch,
            decoration: InputDecoration(
              hintText: 'Search product by name, SKU...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : GridView.builder(
                  padding: const EdgeInsets.all(12),
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 180,
                    childAspectRatio: 0.8,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: _filteredProducts.length,
                  itemBuilder: (context, idx) {
                    final p = _filteredProducts[idx];
                    return InkWell(
                      onTap: () => _addToCart(p),
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
                              const Spacer(),
                              Text('₹${p.unitPrice.toStringAsFixed(0)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                              Text('GST ${p.gstRate}%', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildCart() {
    return Column(
      children: [
        Expanded(
          child: _cartItems.isEmpty
              ? const Center(child: Text('Cart is empty'))
              : ListView.builder(
                  itemCount: _cartItems.length,
                  itemBuilder: (context, idx) {
                    final item = _cartItems[idx];
                    return ListTile(
                      title: Text(item.product.name),
                      subtitle: Text('₹${item.unitPrice} x ${item.quantity}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(icon: const Icon(Icons.remove), onPressed: () => _updateQuantity(idx, -1)),
                          Text('${item.quantity}'),
                          IconButton(icon: const Icon(Icons.add), onPressed: () => _updateQuantity(idx, 1)),
                        ],
                      ),
                    );
                  },
                ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.grey[100],
          child: Column(
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Taxable:'), Text('₹${_taxableValue.toStringAsFixed(2)}')]),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Total GST:'), Text('₹${_totalGst.toStringAsFixed(2)}')]),
              const Divider(),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('TOTAL:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('₹${_grandTotal.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.green)),
              ]),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
                  onPressed: _cartItems.isEmpty || _isProcessingCheckout ? null : _checkout,
                  child: _isProcessingCheckout ? const CircularProgressIndicator(color: Colors.white) : Text('CHARGE ₹${_grandTotal.toStringAsFixed(0)}'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

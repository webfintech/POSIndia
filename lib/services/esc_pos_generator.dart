// ==============================================================================
// FILE: lib/services/esc_pos_generator.dart
// PROJECT: POSIndia.shop Multi-Tenant Cloud POS & Inventory SaaS
// ==============================================================================

import 'dart:convert';
import 'dart:typed_data';
import '../models/sale_order_model.dart';

class EscPosGenerator {
  static const int lineWidth = 48;

  static String generate80mmTextReceipt(SaleOrderModel order) {
    final buffer = StringBuffer();

    void addCentered(String text) {
      if (text.length >= lineWidth) {
        buffer.writeln(text.substring(0, lineWidth));
      } else {
        final pad = ((lineWidth - text.length) / 2).floor();
        buffer.writeln(' ' * pad + text);
      }
    }

    void addRow(String left, String right) {
      final space = lineWidth - left.length - right.length;
      if (space > 0) {
        buffer.writeln(left + (' ' * space) + right);
      } else {
        buffer.writeln('$left $right');
      }
    }

    void addDivider([String char = '-']) {
      buffer.writeln(char * lineWidth);
    }

    addCentered('================================');
    addCentered(order.storeName.toUpperCase());
    addCentered('POSINDIA.SHOP RETAIL SAAS');
    addCentered('GSTIN: 07AABCP1334M1ZX');
    addCentered('Connaught Place, New Delhi - 110001');
    addCentered('================================');
    buffer.writeln();

    addRow('INV NO: ${order.invoiceNumber}', 'TENANT: ${order.tenantId}');
    addRow('DATE: ${order.createdAt.toLocal().toString().substring(0, 16)}', 'CASHIER: ${order.cashierName}');
    addDivider();

    if (!order.customer.isWalkIn) {
      buffer.writeln('CUSTOMER: ${order.customer.name.toUpperCase()}');
      addRow('PHONE: ${order.customer.phone}', order.customer.gstin != null ? 'GST: ${order.customer.gstin}' : '');
      addDivider();
    }

    buffer.writeln('ITEM'.padRight(20) + 'QTY'.padLeft(6) + 'RATE'.padLeft(10) + 'TOTAL'.padLeft(12));
    addDivider('-');

    for (final item in order.items) {
      final name = item.product.name.length > 19 ? item.product.name.substring(0, 19) : item.product.name.padRight(20);
      final qty = item.quantity.toString().padLeft(6);
      final rate = '₹${item.product.unitPrice.toStringAsFixed(0)}'.padLeft(10);
      final total = '₹${item.lineTotal.toStringAsFixed(2)}'.padLeft(12);

      buffer.writeln('$name$qty$rate$total');
    }

    addDivider('=');
    addRow('Subtotal (Gross):', '₹${order.subtotal.toStringAsFixed(2)}');
    addRow('Taxable Value:', '₹${order.taxableValue.toStringAsFixed(2)}');
    addRow('CGST Total:', '₹${order.cgstTotal.toStringAsFixed(2)}');
    addRow('SGST Total:', '₹${order.sgstTotal.toStringAsFixed(2)}');
    addRow('Total GST Collected:', '₹${order.totalGst.toStringAsFixed(2)}');
    addDivider('-');
    addRow('GRAND TOTAL:', '₹${order.grandTotal.toStringAsFixed(2)}');
    addDivider('=');
    addRow('PAID VIA:', order.paymentMode.name.toUpperCase());

    addDivider();
    addCentered('GST INVOICE GENERATED');
    addCentered('Thank you! Visit Again.');
    addDivider('-');
    buffer.writeln();
    addCentered('[ CUT HERE / TEAR RECEIPT ]');

    return buffer.toString();
  }

  static Uint8List generateEscPosBytes(SaleOrderModel order) {
    final receiptText = generate80mmTextReceipt(order);
    final textBytes = utf8.encode(receiptText);

    final bytes = <int>[
      0x1B, 0x40, // ESC @
    ];

    if (order.paymentMode == PaymentMode.cash) {
      bytes.addAll([0x1B, 0x70, 0x00, 0x19, 0xFA]);
    }

    bytes.addAll(textBytes);
    bytes.addAll([0x0A, 0x0A, 0x0A]);
    bytes.addAll([0x1D, 0x56, 0x42, 0x00]);

    return Uint8List.fromList(bytes);
  }
}

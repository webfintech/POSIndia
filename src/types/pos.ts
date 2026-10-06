export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CREDIT';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  stockQty: number;
  hsnCode: string;
  gstRate: number; // e.g. 5, 12, 18, 28, 0
  unit: string; // e.g. "Pcs", "Kg", "Pack"
  imageUrl?: string;
}

export interface CartItem {
  id: string; // unique cart line ID
  productId: string;
  sku: string;
  barcode: string;
  name: string;
  hsnCode: string;
  gstRate: number;
  unitPrice: number;
  quantity: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  // Computed values
  grossPrice: number;
  discountAmount: number;
  netPrice: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGstAmount: number;
  lineTotal: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  creditLimit: number;
  currentOutstanding: number;
  loyaltyPoints: number;
  isWalkIn?: boolean;
}

export interface CartSummaryData {
  itemCount: number;
  subtotal: number;
  totalDiscount: number;
  taxableValue: number;
  cgstTotal: number;
  sgstTotal: number;
  totalGst: number;
  roundOff: number;
  grandTotal: number;
}

export interface SaleOrder {
  invoiceNumber: string;
  tenantId: string;
  storeName: string;
  cashierName: string;
  customer: Customer;
  items: CartItem[];
  summary: CartSummaryData;
  paymentMode: PaymentMode;
  paymentDetails: {
    cashTendered?: number;
    cashChange?: number;
    upiRefId?: string;
    cardLast4?: string;
    cardAuthCode?: string;
    creditRemarks?: string;
  };
  createdAt: string;
  status: 'COMPLETED' | 'PENDING_SYNC' | 'FAILED';
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST';
  endpoint: string;
  statusCode: number;
  requestPayload?: any;
  responsePayload?: any;
  durationMs: number;
}

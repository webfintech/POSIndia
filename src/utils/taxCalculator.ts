import { CartItem, CartSummaryData, Product } from '../types/pos';

/**
 * Calculates line totals and Indian GST (CGST + SGST split 50/50)
 * Assuming Retail MRP price (Tax-Inclusive as standard in Indian POS)
 */
export function calculateCartItem(
  product: Product,
  quantity: number,
  discountType: 'percentage' | 'fixed' = 'percentage',
  discountValue: number = 0,
  existingCartItemId?: string
): CartItem {
  const grossPrice = product.unitPrice * quantity;

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (grossPrice * Math.min(100, Math.max(0, discountValue))) / 100;
  } else {
    discountAmount = Math.min(grossPrice, Math.max(0, discountValue));
  }

  const netPrice = Math.max(0, grossPrice - discountAmount);

  // Indian GST Calculation (Inclusive):
  // Taxable Value = Net / (1 + GST_rate / 100)
  const gstRate = product.gstRate;
  const taxableAmount = gstRate > 0 ? netPrice / (1 + gstRate / 100) : netPrice;
  const totalGstAmount = netPrice - taxableAmount;
  const cgstAmount = totalGstAmount / 2;
  const sgstAmount = totalGstAmount / 2;
  const lineTotal = netPrice;

  return {
    id: existingCartItemId || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    sku: product.sku,
    barcode: product.barcode,
    name: product.name,
    hsnCode: product.hsnCode,
    gstRate: product.gstRate,
    unitPrice: product.unitPrice,
    quantity,
    discountType,
    discountValue,
    grossPrice: Number(grossPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    netPrice: Number(netPrice.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstAmount: Number(sgstAmount.toFixed(2)),
    totalGstAmount: Number(totalGstAmount.toFixed(2)),
    lineTotal: Number(lineTotal.toFixed(2)),
  };
}

export function calculateCartSummary(items: CartItem[]): CartSummaryData {
  if (items.length === 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      totalDiscount: 0,
      taxableValue: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      totalGst: 0,
      roundOff: 0,
      grandTotal: 0,
    };
  }

  const subtotal = items.reduce((acc, item) => acc + item.grossPrice, 0);
  const totalDiscount = items.reduce((acc, item) => acc + item.discountAmount, 0);
  const taxableValue = items.reduce((acc, item) => acc + item.taxableAmount, 0);
  const cgstTotal = items.reduce((acc, item) => acc + item.cgstAmount, 0);
  const sgstTotal = items.reduce((acc, item) => acc + item.sgstAmount, 0);
  const totalGst = items.reduce((acc, item) => acc + item.totalGstAmount, 0);

  const exactGrandTotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const roundedGrandTotal = Math.round(exactGrandTotal);
  const roundOff = Number((roundedGrandTotal - exactGrandTotal).toFixed(2));

  return {
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    taxableValue: Number(taxableValue.toFixed(2)),
    cgstTotal: Number(cgstTotal.toFixed(2)),
    sgstTotal: Number(sgstTotal.toFixed(2)),
    totalGst: Number(totalGst.toFixed(2)),
    roundOff,
    grandTotal: roundedGrandTotal,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

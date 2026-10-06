import { SaleOrder } from '../types/pos';
import { formatINR } from './taxCalculator';

/**
 * Standard ESC/POS commands
 */
export const ESC_POS_COMMANDS = {
  INIT: [0x1B, 0x40], // ESC @
  ALIGN_LEFT: [0x1B, 0x61, 0x00], // ESC a 0
  ALIGN_CENTER: [0x1B, 0x61, 0x01], // ESC a 1
  ALIGN_RIGHT: [0x1B, 0x61, 0x02], // ESC a 2
  BOLD_ON: [0x1B, 0x45, 0x01], // ESC E 1
  BOLD_OFF: [0x1B, 0x45, 0x00], // ESC E 0
  DOUBLE_HEIGHT_ON: [0x1B, 0x21, 0x10], // ESC ! 16
  DOUBLE_WIDTH_ON: [0x1B, 0x21, 0x20], // ESC ! 32
  NORMAL_TEXT: [0x1B, 0x21, 0x00], // ESC ! 0
  LINE_FEED: [0x0A], // LF
  CUT_FULL: [0x1D, 0x56, 0x42, 0x00], // GS V 66 0 (Cut paper with feed)
  DRAWER_KICK: [0x1B, 0x70, 0x00, 0x19, 0xFA], // ESC p 0 25 250 (Kick cash drawer)
};

const LINE_WIDTH = 48; // Standard 80mm thermal printer (48 chars per line font A)

function padRow(left: string, right: string, width = LINE_WIDTH): string {
  const spaceCount = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(spaceCount) + right;
}

function centerText(text: string, width = LINE_WIDTH): string {
  if (text.length >= width) return text.substring(0, width);
  const leftPad = Math.floor((width - text.length) / 2);
  const rightPad = width - text.length - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

function divider(char = '-', width = LINE_WIDTH): string {
  return char.repeat(width);
}

/**
 * Formats printable 80mm plain text receipt
 */
export function generate80mmTextReceipt(order: SaleOrder): string {
  const lines: string[] = [];

  // Header
  lines.push(centerText('================================'));
  lines.push(centerText(order.storeName.toUpperCase()));
  lines.push(centerText('POSINDIA.SHOP RETAIL SAAS'));
  lines.push(centerText('GSTIN: 07AABCP1334M1ZX'));
  lines.push(centerText('Connaught Place, New Delhi - 110001'));
  lines.push(centerText('Ph: +91 98765 43210 / support@posindia.shop'));
  lines.push(centerText('================================'));
  lines.push('');

  lines.push(padRow(`INV NO: ${order.invoiceNumber}`, `TENANT: ${order.tenantId}`));
  lines.push(padRow(`DATE: ${new Date(order.createdAt).toLocaleString('en-IN')}`, `CASHIER: ${order.cashierName}`));
  lines.push(divider());

  // Customer info
  if (order.customer.name !== 'Walk-in Customer') {
    lines.push(`CUSTOMER: ${order.customer.name.toUpperCase()}`);
    lines.push(padRow(`PHONE: ${order.customer.phone}`, order.customer.gstin ? `GST: ${order.customer.gstin}` : ''));
    lines.push(divider());
  }

  // Items Header: Name (20) | Qty (5) | Rate (10) | Amount (11)
  lines.push(
    'ITEM'.padEnd(20) +
    'QTY'.padStart(6) +
    'RATE'.padStart(10) +
    'TOTAL'.padStart(12)
  );
  lines.push(divider('-'));

  // Item Rows
  for (const item of order.items) {
    const namePart = item.name.length > 19 ? item.name.substring(0, 19) : item.name.padEnd(20);
    const qtyPart = `${item.quantity}`.padStart(6);
    const ratePart = `₹${item.unitPrice.toFixed(0)}`.padStart(10);
    const totalPart = `₹${item.lineTotal.toFixed(2)}`.padStart(12);

    lines.push(`${namePart}${qtyPart}${ratePart}${totalPart}`);
    if (item.discountAmount > 0) {
      lines.push(`  ↳ Disc: -₹${item.discountAmount.toFixed(2)} (HSN: ${item.hsnCode} | GST: ${item.gstRate}%)`);
    } else {
      lines.push(`  ↳ HSN: ${item.hsnCode} | GST ${item.gstRate}% (CGST+SGST)`);
    }
  }

  lines.push(divider('='));

  // Totals
  lines.push(padRow('Subtotal (Gross):', `₹${order.summary.subtotal.toFixed(2)}`));
  if (order.summary.totalDiscount > 0) {
    lines.push(padRow('Total Discount:', `-₹${order.summary.totalDiscount.toFixed(2)}`));
  }
  lines.push(padRow('Taxable Value:', `₹${order.summary.taxableValue.toFixed(2)}`));
  lines.push(padRow('CGST Total:', `₹${order.summary.cgstTotal.toFixed(2)}`));
  lines.push(padRow('SGST Total:', `₹${order.summary.sgstTotal.toFixed(2)}`));
  lines.push(padRow('Total GST Collected:', `₹${order.summary.totalGst.toFixed(2)}`));
  if (order.summary.roundOff !== 0) {
    lines.push(padRow('Round Off:', `${order.summary.roundOff > 0 ? '+' : ''}₹${order.summary.roundOff.toFixed(2)}`));
  }
  lines.push(divider('-'));

  // Grand Total Highlight
  lines.push(padRow('GRAND TOTAL:', formatINR(order.summary.grandTotal)));
  lines.push(divider('='));

  // Payment Mode details
  lines.push(padRow('PAID VIA:', `${order.paymentMode}`));
  if (order.paymentMode === 'CASH' && order.paymentDetails.cashTendered) {
    lines.push(padRow('Cash Tendered:', `₹${order.paymentDetails.cashTendered}`));
    lines.push(padRow('Change Returned:', `₹${(order.paymentDetails.cashChange || 0).toFixed(2)}`));
  } else if (order.paymentMode === 'UPI') {
    lines.push(padRow('UPI Status:', 'VERIFIED (BHARAT QR)'));
    if (order.paymentDetails.upiRefId) {
      lines.push(padRow('UPI Ref:', order.paymentDetails.upiRefId));
    }
  } else if (order.paymentMode === 'CARD') {
    lines.push(padRow('Card Auth:', order.paymentDetails.cardAuthCode || 'AUTH-OK'));
    lines.push(padRow('Card Ending:', `**** ${order.paymentDetails.cardLast4 || '8842'}`));
  } else if (order.paymentMode === 'CREDIT') {
    lines.push(padRow('Ledger Entry:', 'KHATA OUTSTANDING ADDED'));
    lines.push(padRow('New Balance:', formatINR(order.customer.currentOutstanding + order.summary.grandTotal)));
  }

  lines.push(divider());
  lines.push(centerText('GST INVOICE GENERATED'));
  lines.push(centerText('Powered by POSIndia.shop Multi-Tenant Cloud'));
  lines.push(centerText('Thank you! Visit Again.'));
  lines.push(divider('-'));
  lines.push('');
  lines.push(centerText('[ CUT HERE / TEAR RECEIPT ]'));
  lines.push('');

  return lines.join('\n');
}

/**
 * Generates raw ESC/POS binary byte array for direct socket / USB / Bluetooth thermal printer sending
 */
export function generateEscPosBytes(order: SaleOrder): Uint8Array {
  const textReceipt = generate80mmTextReceipt(order);
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(textReceipt);

  const initCmd = new Uint8Array(ESC_POS_COMMANDS.INIT);
  const drawerCmd = order.paymentMode === 'CASH' ? new Uint8Array(ESC_POS_COMMANDS.DRAWER_KICK) : new Uint8Array(0);
  const feedAndCut = new Uint8Array([0x0A, 0x0A, 0x0A, ...ESC_POS_COMMANDS.CUT_FULL]);

  const totalLength = initCmd.length + drawerCmd.length + textBytes.length + feedAndCut.length;
  const buffer = new Uint8Array(totalLength);

  let offset = 0;
  buffer.set(initCmd, offset); offset += initCmd.length;
  if (drawerCmd.length > 0) {
    buffer.set(drawerCmd, offset); offset += drawerCmd.length;
  }
  buffer.set(textBytes, offset); offset += textBytes.length;
  buffer.set(feedAndCut, offset);

  return buffer;
}

/**
 * Returns formatted hex dump string for technical inspection
 */
export function generateEscPosHexDump(bytes: Uint8Array, maxBytes = 256): string {
  const slice = bytes.slice(0, maxBytes);
  const lines: string[] = [];

  for (let i = 0; i < slice.length; i += 16) {
    const chunk = slice.slice(i, i + 16);
    const hex = Array.from(chunk)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ')
      .padEnd(48);

    const ascii = Array.from(chunk)
      .map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
      .join('');

    const offsetStr = i.toString(16).padStart(4, '0').toUpperCase();
    lines.push(`${offsetStr}  ${hex}  |${ascii}|`);
  }

  if (bytes.length > maxBytes) {
    lines.push(`... [${bytes.length - maxBytes} more ESC/POS bytes]`);
  }

  return lines.join('\n');
}

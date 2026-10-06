import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  X, 
  Terminal, 
  FileText, 
  Code, 
  Copy, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { SaleOrder } from '../../types/pos';
import { 
  generate80mmTextReceipt, 
  generateEscPosBytes, 
  generateEscPosHexDump 
} from '../../utils/escPosGenerator';
import { formatINR } from '../../utils/taxCalculator';

interface ReceiptModalProps {
  order: SaleOrder | null;
  onClose: () => void;
  onStartNewBill: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  onStartNewBill,
}) => {
  const [activeTab, setActiveTab] = useState<'thermal_view' | 'esc_pos_hex' | 'json_payload'>('thermal_view');
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const textReceipt = generate80mmTextReceipt(order);
  const escPosBytes = generateEscPosBytes(order);
  const hexDump = generateEscPosHexDump(escPosBytes);

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(textReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEscPosBin = () => {
    const blob = new Blob([new Uint8Array(escPosBytes)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.invoiceNumber}_escpos.bin`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `🧾 *POSIndia Bill Receipt*\n` +
      `Invoice: *${order.invoiceNumber}*\n` +
      `Store: ${order.storeName}\n` +
      `Total Amount: ₹${order.summary.grandTotal}\n` +
      `Payment Mode: ${order.paymentMode}\n` +
      `Items: ${order.items.length}\n` +
      `Date: ${new Date(order.createdAt).toLocaleDateString()}\n\n` +
      `Thank you for shopping at POSIndia.shop!`
    );
    const phone = order.customer.phone.replace(/[^0-9]/g, '');
    const waUrl = phone ? `https://wa.me/91${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Invoice Confirmed</h3>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {order.invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synced to <code className="text-slate-300">https://posindia.shop/api/sales/create</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center px-4 pt-3 bg-slate-900 border-b border-slate-800 text-xs gap-2">
          <button
            onClick={() => setActiveTab('thermal_view')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 font-medium transition ${
              activeTab === 'thermal_view'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Thermal 80mm Slip</span>
          </button>

          <button
            onClick={() => setActiveTab('esc_pos_hex')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 font-medium transition ${
              activeTab === 'esc_pos_hex'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>ESC/POS Hex Byte Dump</span>
          </button>

          <button
            onClick={() => setActiveTab('json_payload')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 font-medium transition ${
              activeTab === 'json_payload'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>REST API Payload</span>
          </button>

          <div className="ml-auto pb-2">
            <button
              onClick={handleCopyReceipt}
              className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded text-[11px] transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/70">
          {activeTab === 'thermal_view' && (
            <div className="flex justify-center">
              {/* Realistic Thermal Receipt Paper Container */}
              <div className="w-full max-w-[400px] bg-amber-50/95 text-slate-950 p-6 rounded shadow-xl font-mono text-[11px] leading-[1.35] border border-amber-200 select-text relative">
                {/* Jagged top tear */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-repeat-x opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
                
                <pre className="whitespace-pre-wrap font-mono font-medium text-slate-900 break-words">
                  {textReceipt}
                </pre>

                {/* Jagged bottom tear */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-repeat-x opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
              </div>
            </div>
          )}

          {activeTab === 'esc_pos_hex' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400/90 overflow-x-auto space-y-2">
              <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span>Total Binary Size: </span>
                <span className="text-white font-bold">{escPosBytes.length} bytes</span>
                <span className="text-slate-500 ml-2">(Includes ESC @ Init, GS V Cut, ESC p Cash Drawer Pulse)</span>
              </div>
              <pre className="text-[11px] leading-relaxed whitespace-pre font-mono text-slate-300">
                {hexDump}
              </pre>
            </div>
          )}

          {activeTab === 'json_payload' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
              <pre className="text-[11px] leading-relaxed text-blue-300">
                {JSON.stringify(order, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print ESC/POS</span>
            </button>

            <button
              onClick={handleDownloadEscPosBin}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition border border-slate-700"
              title="Download raw ESC/POS binary stream for thermal printer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download .BIN</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 rounded-lg text-xs font-semibold transition border border-emerald-800/80"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Bill</span>
            </button>
          </div>

          <button
            onClick={onStartNewBill}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Sale / New Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { CartSummaryData } from '../../types/pos';
import { formatINR } from '../../utils/taxCalculator';

interface CartSummaryProps {
  summary: CartSummaryData;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ summary }) => {
  const [showDetailedTaxes, setShowDetailedTaxes] = useState(false);

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 select-none space-y-2">
      {/* Primary Totals Overview */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Subtotal ({summary.itemCount} items)</span>
          <span className="font-mono text-slate-200">{formatINR(summary.subtotal)}</span>
        </div>

        {summary.totalDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-400">
            <span>Total Item Discounts</span>
            <span className="font-mono font-medium">-{formatINR(summary.totalDiscount)}</span>
          </div>
        )}

        {/* GST Toggle Line */}
        <div className="flex justify-between items-center text-slate-400">
          <button
            onClick={() => setShowDetailedTaxes(!showDetailedTaxes)}
            className="flex items-center gap-1 hover:text-slate-200 text-slate-400 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total GST (CGST + SGST)</span>
            {showDetailedTaxes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <span className="font-mono text-slate-300">{formatINR(summary.totalGst)}</span>
        </div>

        {/* Detailed GST breakdown if expanded */}
        {showDetailedTaxes && (
          <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80 text-[11px] space-y-1 text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>Taxable Value (Excl. Tax):</span>
              <span className="text-slate-300">{formatINR(summary.taxableValue)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (Central 50%):</span>
              <span className="text-slate-300">{formatINR(summary.cgstTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (State 50%):</span>
              <span className="text-slate-300">{formatINR(summary.sgstTotal)}</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center gap-1">
              <span>Rates: Dual tax splitting applied per Indian GST compliance</span>
            </div>
          </div>
        )}

        {summary.roundOff !== 0 && (
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Round Off</span>
            <span className="font-mono">
              {summary.roundOff > 0 ? '+' : ''}{formatINR(summary.roundOff)}
            </span>
          </div>
        )}
      </div>

      {/* Prominent Grand Total Bar */}
      <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Grand Total
          </span>
          <span className="text-[10px] text-slate-400 ml-1.5">(INR)</span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
          {formatINR(summary.grandTotal)}
        </div>
      </div>
    </div>
  );
};

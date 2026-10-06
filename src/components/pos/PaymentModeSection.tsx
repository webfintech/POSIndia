import React, { useState } from 'react';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  BookOpen, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Customer, PaymentMode } from '../../types/pos';
import { formatINR } from '../../utils/taxCalculator';

interface PaymentModeSectionProps {
  paymentMode: PaymentMode;
  onSelectPaymentMode: (mode: PaymentMode) => void;
  grandTotal: number;
  customer: Customer;
  onCheckout: (details: {
    cashTendered?: number;
    cashChange?: number;
    upiRefId?: string;
    cardLast4?: string;
    cardAuthCode?: string;
    creditRemarks?: string;
  }) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const PaymentModeSection: React.FC<PaymentModeSectionProps> = ({
  paymentMode,
  onSelectPaymentMode,
  grandTotal,
  customer,
  onCheckout,
  isProcessing,
  disabled,
}) => {
  // Cash Tender State
  const [cashTendered, setCashTendered] = useState<number>(0);

  // UPI State
  const [upiRefId, setUpiRefId] = useState<string>('');

  // Card State
  const [cardAuthCode, setCardAuthCode] = useState<string>('AUTH-4819');
  const [cardLast4, setCardLast4] = useState<string>('9102');

  // Credit State
  const [creditRemarks, setCreditRemarks] = useState<string>('');

  // Cash Change calculation
  const effectiveTender = cashTendered > 0 ? cashTendered : grandTotal;
  const cashChange = Math.max(0, effectiveTender - grandTotal);

  // Credit Limit Check
  const isCreditOverLimit =
    paymentMode === 'CREDIT' &&
    !customer.isWalkIn &&
    customer.currentOutstanding + grandTotal > customer.creditLimit;

  const isWalkInCreditAttempt = paymentMode === 'CREDIT' && customer.isWalkIn;

  const handleQuickCash = (amount: number) => {
    setCashTendered(amount);
  };

  const handleChargeClick = () => {
    if (disabled || isProcessing) return;

    if (isWalkInCreditAttempt) {
      alert('Cannot perform a Credit (Khata) sale to an anonymous Walk-in Customer. Please attach a registered customer profile first.');
      return;
    }

    onCheckout({
      cashTendered: paymentMode === 'CASH' ? effectiveTender : undefined,
      cashChange: paymentMode === 'CASH' ? cashChange : undefined,
      upiRefId: paymentMode === 'UPI' ? upiRefId || `UPI-${Date.now().toString().slice(-6)}` : undefined,
      cardAuthCode: paymentMode === 'CARD' ? cardAuthCode : undefined,
      cardLast4: paymentMode === 'CARD' ? cardLast4 : undefined,
      creditRemarks: paymentMode === 'CREDIT' ? creditRemarks || 'POS Billing Khata Entry' : undefined,
    });
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 space-y-3">
      {/* Payment Mode Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => onSelectPaymentMode('CASH')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
            paymentMode === 'CASH'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Cash</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPaymentMode('UPI')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
            paymentMode === 'UPI'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>UPI</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPaymentMode('CARD')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
            paymentMode === 'CARD'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Card</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPaymentMode('CREDIT')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
            paymentMode === 'CREDIT'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Credit</span>
        </button>
      </div>

      {/* Payment Mode Specific Interactive Drawer */}
      {paymentMode === 'CASH' && (
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Cash Tendered:</span>
            <div className="flex items-center gap-1 font-mono">
              <span>₹</span>
              <input
                type="number"
                value={cashTendered || ''}
                onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                placeholder={grandTotal.toString()}
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Indian Currency Denominations */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => handleQuickCash(grandTotal)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono border border-slate-700 shrink-0"
            >
              Exact
            </button>
            {[100, 200, 500, 1000, 2000].map((denom) => {
              const nearestMulti = Math.ceil(grandTotal / denom) * denom;
              if (nearestMulti <= 0) return null;
              return (
                <button
                  key={denom}
                  onClick={() => handleQuickCash(nearestMulti)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono border border-slate-700 shrink-0"
                >
                  ₹{nearestMulti}
                </button>
              );
            })}
          </div>

          {/* Change to return */}
          <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/80 font-mono text-[11px]">
            <span className="text-slate-400">Change Due to Customer:</span>
            <span className={`font-bold ${cashChange > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {formatINR(cashChange)}
            </span>
          </div>
        </div>
      )}

      {paymentMode === 'UPI' && (
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs flex items-center justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <QrCode className="w-4 h-4" />
              <span>Dynamic Bharat QR (ICICI VPA)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              VPA: <code className="text-slate-300">posindia@icici</code>
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Txn Ref # (Optional)"
                value={upiRefId}
                onChange={(e) => setUpiRefId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          {/* Simulated Mini QR Code */}
          <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center border border-slate-700 shadow-sm">
            <div className="w-full h-full bg-slate-950 rounded p-1 flex flex-col items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-xs"></div>
                <div className="w-2.5 h-2.5 bg-slate-800"></div>
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-xs"></div>
                <div className="w-2.5 h-2.5 bg-slate-800"></div>
                <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
                <div className="w-2.5 h-2.5 bg-slate-800"></div>
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-xs"></div>
                <div className="w-2.5 h-2.5 bg-slate-800"></div>
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-xs"></div>
              </div>
              <span className="text-[7px] text-white font-bold mt-0.5">UPI</span>
            </div>
          </div>
        </div>
      )}

      {paymentMode === 'CARD' && (
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Card Terminal / POS Swiper:</span>
            <span className="text-emerald-400 font-medium">Ready (EDC Terminal 01)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500">Auth Code</label>
              <input
                type="text"
                value={cardAuthCode}
                onChange={(e) => setCardAuthCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Card Last 4 Digits</label>
              <input
                type="text"
                maxLength={4}
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {paymentMode === 'CREDIT' && (
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-2">
          {customer.isWalkIn ? (
            <div className="text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Credit sales require an attached customer profile!</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Customer Khata Ledger:</span>
                <span className="text-amber-400 font-mono font-medium">
                  {customer.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Credit Limit:</span>
                <span>{formatINR(customer.creditLimit)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Current Outstanding:</span>
                <span className="text-amber-400">{formatINR(customer.currentOutstanding)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono pt-1 border-t border-slate-800">
                <span className="text-slate-400">Post-Bill Balance:</span>
                <span className={isCreditOverLimit ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                  {formatINR(customer.currentOutstanding + grandTotal)}
                </span>
              </div>
              {isCreditOverLimit && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1 bg-rose-950/40 p-1.5 rounded border border-rose-900/60">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Exceeds limit by {formatINR(customer.currentOutstanding + grandTotal - customer.creditLimit)}. Proceeding requires cashier override.</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Prominent CHARGE Button */}
      <button
        type="button"
        disabled={disabled || isProcessing}
        onClick={handleChargeClick}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
          disabled
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
            : isCreditOverLimit
            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:shadow-emerald-900/60'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Syncing to posindia.shop/api...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>
              CHARGE {formatINR(grandTotal)} [{paymentMode}]
            </span>
            <ArrowRight className="w-4 h-4 ml-1 opacity-75" />
          </>
        )}
      </button>
    </div>
  );
};

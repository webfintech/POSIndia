import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Percent, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingBag,
  Info
} from 'lucide-react';
import { CartItem, Customer } from '../../types/pos';
import { formatINR } from '../../utils/taxCalculator';

interface ActiveCartProps {
  cartItems: CartItem[];
  customer: Customer;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetItemDiscount: (id: string, type: 'percentage' | 'fixed', value: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenCustomerSelector: () => void;
  grandTotal: number;
}

export const ActiveCart: React.FC<ActiveCartProps> = ({
  cartItems,
  customer,
  onUpdateQuantity,
  onSetItemDiscount,
  onRemoveItem,
  onClearCart,
  onOpenCustomerSelector,
  grandTotal,
}) => {
  const [editingDiscountItemId, setEditingDiscountItemId] = useState<string | null>(null);
  const [tempDiscountType, setTempDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [tempDiscountValue, setTempDiscountValue] = useState<number>(0);

  const isCreditExceeded =
    !customer.isWalkIn &&
    customer.currentOutstanding + grandTotal > customer.creditLimit;

  const handleOpenDiscount = (item: CartItem) => {
    setEditingDiscountItemId(item.id);
    setTempDiscountType(item.discountType);
    setTempDiscountValue(item.discountValue);
  };

  const handleSaveDiscount = (id: string) => {
    onSetItemDiscount(id, tempDiscountType, tempDiscountValue);
    setEditingDiscountItemId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* 1. Customer Attachment Banner */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {customer.name}
              </span>
              {customer.isWalkIn ? (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                  Walk-in
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                  {customer.loyaltyPoints} pts
                </span>
              )}
            </div>

            {/* Customer Ledger & Credit Limits */}
            {!customer.isWalkIn && (
              <div className="text-[11px] flex items-center gap-1.5 mt-0.5 font-mono">
                <span className="text-slate-400">
                  Limit: {formatINR(customer.creditLimit)}
                </span>
                <span className="text-slate-600">•</span>
                <span className={customer.currentOutstanding > 0 ? 'text-amber-400' : 'text-slate-400'}>
                  Due: {formatINR(customer.currentOutstanding)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenCustomerSelector}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 px-2.5 py-1 rounded border border-emerald-500/30 transition"
          >
            Change
          </button>
          {cartItems.length > 0 && (
            <button
              onClick={onClearCart}
              title="Clear Active Cart"
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-1.5 rounded transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Credit Limit Exceeded Alert Badge */}
      {isCreditExceeded && (
        <div className="px-3 py-1.5 bg-amber-950/60 border-b border-amber-800/80 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="truncate">
            <span className="font-semibold">Credit warning:</span> Outstanding + this bill ({formatINR(customer.currentOutstanding + grandTotal)}) exceeds limit of {formatINR(customer.creditLimit)}.
          </div>
        </div>
      )}

      {/* 2. Cart Items Table / List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 sm:p-3">
        {cartItems.length === 0 ? (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-slate-500 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-700" />
            <p className="text-sm font-medium text-slate-400">Cart is empty</p>
            <p className="text-xs text-slate-600 text-center max-w-[200px]">
              Tap items from the catalog or scan barcodes to begin billing
            </p>
          </div>
        ) : (
          cartItems.map((item) => {
            const isEditingDiscount = editingDiscountItemId === item.id;

            return (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  {/* Name, SKU, GST */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>Rate: {formatINR(item.unitPrice)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">GST {item.gstRate}%</span>
                      <span>•</span>
                      <span className="text-slate-400">HSN {item.hsnCode}</span>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-white font-mono">
                      {formatINR(item.lineTotal)}
                    </div>
                    {item.discountAmount > 0 && (
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Saved {formatINR(item.discountAmount)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls Bar: Qty stepper + Item Discount trigger + Remove */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 sm:px-2 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 font-mono font-bold text-slate-100 text-xs min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 sm:px-2 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Discount Button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDiscount(item)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition ${
                        item.discountAmount > 0
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Apply item-level discount"
                    >
                      <Percent className="w-3 h-3" />
                      <span>
                        {item.discountAmount > 0
                          ? item.discountType === 'percentage'
                            ? `${item.discountValue}% off`
                            : `-₹${item.discountValue}`
                          : 'Discount'}
                      </span>
                    </button>

                    {/* Delete Item */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Discount Editor Popdown */}
                {isEditingDiscount && (
                  <div className="mt-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span>Item Discount for {item.name.substring(0, 20)}...</span>
                      <button
                        onClick={() => setEditingDiscountItemId(null)}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => setTempDiscountType('percentage')}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                            tempDiscountType === 'percentage'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          % Percent
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempDiscountType('fixed')}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                            tempDiscountType === 'fixed'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          ₹ Flat Amount
                        </button>
                      </div>

                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min="0"
                          max={tempDiscountType === 'percentage' ? 100 : item.grossPrice}
                          value={tempDiscountValue}
                          onChange={(e) => setTempDiscountValue(Number(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder={tempDiscountType === 'percentage' ? 'e.g. 10%' : 'e.g. 50'}
                        />
                      </div>

                      <button
                        onClick={() => handleSaveDiscount(item.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  User, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { Customer } from '../../types/pos';
import { formatINR } from '../../utils/taxCalculator';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: Customer) => void;
  onAddNewCustomer: (newCustomer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddNewCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState(10000);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.gstin && c.gstin.toLowerCase().includes(q))
    );
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const created: Customer = {
      id: `cust-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      gstin: newGstin.trim() || undefined,
      creditLimit: Number(newCreditLimit) || 0,
      currentOutstanding: 0,
      loyaltyPoints: 50,
      isWalkIn: false,
    };

    onAddNewCustomer(created);
    onSelectCustomer(created);
    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Attach Customer to Bill</h3>
              <p className="text-[11px] text-slate-400">Multi-tenant client database & Khata credit limit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Add New Toggle */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone or GSTIN..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isAddingNew
                ? 'bg-slate-800 text-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Cancel' : 'New Client'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {isAddingNew ? (
            <form onSubmit={handleCreateCustomer} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <h4 className="font-semibold text-white text-sm">Register New Customer Profile</h4>
              
              <div>
                <label className="block text-slate-400 mb-1">Customer / Business Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra / Sharma General Store"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="98100 12345"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Max Credit Limit (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(Number(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
              >
                Save & Attach to Bill
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((cust) => {
                const isSelected = cust.id === selectedCustomerId;
                const isOverLimit = !cust.isWalkIn && cust.currentOutstanding >= cust.creditLimit;

                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      onSelectCustomer(cust);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate">
                          {cust.name}
                        </span>
                        {cust.isWalkIn ? (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            Anonymous
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-1.5 py-0.5 rounded font-mono">
                            {cust.loyaltyPoints} Loyalty Pts
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono">
                        <span>📞 {cust.phone}</span>
                        {cust.gstin && <span className="text-slate-300">GST: {cust.gstin}</span>}
                      </div>

                      {!cust.isWalkIn && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[11px] flex items-center justify-between">
                          <span className="text-slate-400">
                            Credit Limit: <span className="text-slate-200">{formatINR(cust.creditLimit)}</span>
                          </span>
                          <span className={isOverLimit ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                            Due: {formatINR(cust.currentOutstanding)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

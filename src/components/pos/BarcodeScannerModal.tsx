import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, X, Camera, Zap, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types/pos';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [isLaserActive, setIsLaserActive] = useState(true);
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerScan = (barcode: string) => {
    const found = products.find(
      (p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase()
    );

    if (found) {
      setLastScannedName(found.name);
      onScan(barcode);
      setTimeout(() => setLastScannedName(null), 1200);
    } else {
      onScan(barcode);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleTriggerScan(manualInput.trim());
    setManualInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Scan-to-Cart Barcode Reader</h3>
              <p className="text-[10px] text-slate-400">Camera / Laser scanner simulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Camera Simulation */}
        <div className="p-4 bg-slate-950 flex flex-col items-center">
          <div className="relative w-full aspect-video max-w-[340px] bg-slate-900 rounded-xl overflow-hidden border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center">
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-4 border border-emerald-500/30 rounded-lg pointer-events-none" />
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

            {/* Red Laser Scan Beam */}
            {isLaserActive && (
              <div className="absolute left-6 right-6 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse transition-all top-1/2 -translate-y-1/2" />
            )}

            <div className="flex flex-col items-center gap-1.5 text-slate-500 z-10 pointer-events-none">
              <Camera className="w-8 h-8 text-slate-600" />
              <span className="text-[11px] font-mono text-slate-400">Aim camera at EAN-13 / Code128</span>
            </div>

            {/* Notification on scan */}
            {lastScannedName && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-emerald-300 font-semibold text-xs p-3 text-center animate-in zoom-in-95">
                <Check className="w-6 h-6 mb-1 text-emerald-400" />
                <span>Added: {lastScannedName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Barcode Input & Quick Samples */}
        <div className="p-4 space-y-3 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleManualSubmit} className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Manual Barcode / SKU entry:
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g. 8901262010053 or SKU-AMUL-500"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Scan
              </button>
            </div>
          </form>

          {/* Quick Click Barcodes */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Tap to simulate laser barcode scan:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleTriggerScan(p.barcode)}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded text-[11px] text-slate-300 transition text-left flex items-center gap-1.5"
                >
                  <span className="font-mono text-emerald-400">{p.barcode.slice(-4)}</span>
                  <span className="truncate max-w-[120px]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};

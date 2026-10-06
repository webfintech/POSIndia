import React from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code2, 
  Store, 
  Wifi, 
  WifiOff, 
  Activity, 
  FileText,
  ScanLine
} from 'lucide-react';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type AppTab = 'pos' | 'flutter_code' | 'apk_guide';

interface POSNavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  tenantId: string;
  isOnline: boolean;
  onToggleOnline: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenApiLogs: () => void;
  cartItemCount: number;
}

export const POSNavbar: React.FC<POSNavbarProps> = ({
  activeTab,
  onTabChange,
  viewportMode,
  onViewportChange,
  tenantId,
  isOnline,
  onToggleOnline,
  onOpenBarcodeScanner,
  onOpenApiLogs,
  cartItemCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white select-none z-30 sticky top-0 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand & Tenant Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">POSIndia.shop</span>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded">
                  v3.4 SaaS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="font-mono text-slate-300">{tenantId}</span>
                <span>•</span>
                <span className="text-slate-400">Billing Counter 01</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Main View Modes (POS Terminal vs Flutter Source Code) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onTabChange('pos')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Interactive Terminal</span>
            {cartItemCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-bold rounded-full text-[10px]">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('flutter_code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === 'flutter_code'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Flutter Codebase</span>
            <span className="text-[9px] px-1 py-0.2 bg-blue-500/30 text-blue-300 rounded font-mono">
              lib/
            </span>
          </button>

          <button
            onClick={() => onTabChange('apk_guide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === 'apk_guide'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>APK Download Guide</span>
            <span className="text-[9px] px-1 py-0.2 bg-emerald-500/30 text-emerald-300 rounded font-bold font-mono">
              NEW
            </span>
          </button>
        </div>

        {/* Right: Responsive Frame Switcher & System Status */}
        <div className="flex items-center gap-2">
          {/* Responsive viewport simulator (only active when tab is POS) */}
          {activeTab === 'pos' && (
            <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                title="Desktop POS Terminal (Split Pane)"
                onClick={() => onViewportChange('desktop')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewportMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                title="Tablet POS Screen (iPad / 1024px)"
                onClick={() => onViewportChange('tablet')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewportMode === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                title="Mobile Handheld POS (390px)"
                onClick={() => onViewportChange('mobile')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewportMode === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Barcode Scanner quick trigger */}
          <button
            onClick={onOpenBarcodeScanner}
            title="Scan-to-Cart Barcode Scanner"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <ScanLine className="w-4 h-4 text-emerald-400" />
          </button>

          {/* API Inspector trigger */}
          <button
            onClick={onOpenApiLogs}
            title="Inspect REST API Calls (posindia.shop/api)"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline font-mono text-[11px]">API Logs</span>
          </button>

          {/* Online/Offline Toggle */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? 'Online: Syncing with posindia.shop/api' : 'Offline mode: Caching locally'}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-400 hover:bg-amber-900/40'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline text-[11px] font-medium">
              {isOnline ? 'Online Sync' : 'Offline Mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

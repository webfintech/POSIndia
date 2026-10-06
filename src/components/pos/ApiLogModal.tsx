import React from 'react';
import { Activity, X, Globe, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { ApiLogEntry } from '../../types/pos';

interface ApiLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ApiLogEntry[];
  onClearLogs: () => void;
}

export const ApiLogModal: React.FC<ApiLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">REST API Network Inspector</h3>
              <p className="text-[11px] text-slate-400">
                Backend communication with <code className="text-emerald-400">https://posindia.shop/api/</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500">
              <Globe className="w-8 h-8 text-slate-700 mb-2" />
              <span>No API requests recorded yet.</span>
              <span className="text-[11px] text-slate-600">Checkout or change products to trigger calls</span>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {log.method}
                    </span>
                    <span className="text-slate-200 font-bold">{log.endpoint}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.statusCode >= 200 && log.statusCode < 300
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-rose-900/60 text-rose-300'
                      }`}
                    >
                      {log.statusCode} OK
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.durationMs}ms
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {log.requestPayload && (
                  <div className="pt-1 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 block mb-1">Payload:</span>
                    <pre className="p-2 bg-slate-900 rounded text-[11px] text-slate-300 overflow-x-auto max-h-36">
                      {JSON.stringify(log.requestPayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

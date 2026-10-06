import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  Copy, 
  Check, 
  Download, 
  Archive, 
  Layers, 
  Sparkles, 
  FileText, 
  Settings, 
  Database,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { FLUTTER_SOURCE_FILES, FlutterSourceFile } from '../../data/flutterFiles';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterSourceFile>(FLUTTER_SOURCE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Add all Flutter source files into their proper directory structure
      for (const file of FLUTTER_SOURCE_FILES) {
        zip.file(file.path, file.content);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'posindia_flutter_saas_pos.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getCategoryIcon = (category: FlutterSourceFile['category']) => {
    switch (category) {
      case 'screen':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'config':
        return <Settings className="w-4 h-4 text-amber-400" />;
      case 'service':
        return <Database className="w-4 h-4 text-blue-400" />;
      case 'model':
        return <FileCode className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-950 overflow-hidden text-slate-100">
      {/* Sidebar: File Tree Explorer */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Flutter Architecture (lib/)
            </span>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition"
            title="Download complete Flutter project as ZIP"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Zipping...' : 'Download ZIP'}</span>
          </button>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {FLUTTER_SOURCE_FILES.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2 rounded-lg text-xs transition flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getCategoryIcon(file.category)}</div>
                <div className="min-w-0 flex-1">
                  <div className={`font-mono text-xs truncate ${isSelected ? 'font-bold text-blue-300' : ''}`}>
                    {file.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    {file.path}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Architecture Spec Card */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clean Architecture Highlights:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[10px]">
            <li>Base URL: <code className="text-emerald-400">https://posindia.shop/api/</code></li>
            <li>Multi-tenant: <code className="text-slate-300">X-Tenant-Id</code> header</li>
            <li>Dual-pane tablet/desktop split (768px+)</li>
            <li>ESC/POS thermal byte streams (80mm)</li>
            <li>StatefulWidget with strict null safety</li>
          </ul>
        </div>
      </div>

      {/* Main Code Editor / Inspector */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Top File Header & Actions */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            {getCategoryIcon(selectedFile.category)}
            <div>
              <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                <span>{selectedFile.path}</span>
                <span className="text-[10px] font-normal text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-sans">
                  {selectedFile.content.split('\n').length} lines
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xl">
                {selectedFile.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed select-text">
          <pre className="text-slate-300 whitespace-pre">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};

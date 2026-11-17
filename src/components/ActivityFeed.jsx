import React, { useRef, useState } from 'react';
import {
  Activity,
  X,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ActivityFeed({
  isOpen,
  onClose,
  activities = [],
  onExportBackup,
  onImportBackup
}) {
  const fileInputRef = useRef(null);
  const [backupNotice, setBackupNotice] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const result = onImportBackup ? onImportBackup(parsed) : { ok: false };
        if (result && result.ok) {
          setBackupNotice({
            type: 'success',
            text: `Loaded ${result.gearCount} gear items and ${result.docCount} files.`
          });
        } else {
          setBackupNotice({
            type: 'error',
            text: 'That file does not match an EcoSpark workspace backup.'
          });
        }
      } catch {
        setBackupNotice({
          type: 'error',
          text: 'Could not read that file. Pick a valid .json backup.'
        });
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportClick = () => {
    if (onExportBackup) {
      onExportBackup();
      setBackupNotice({
        type: 'success',
        text: 'Backup file downloaded to your computer.'
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-backdrop-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl h-full animate-drawer-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                <span>Activity Log</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mt-0.5">
                Recent Workspace Changes
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Workspace Backup
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                JSON Snapshot
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Save your gear, bookings, and files to a backup file, or load one onto another browser.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleExportClick}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Backup</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 text-zinc-200 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Load Backup</span>
              </button>
            </div>

            {backupNotice && (
              <div
                className={`p-2.5 rounded border text-xs flex items-start gap-2 ${
                  backupNotice.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                {backupNotice.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                )}
                <span>{backupNotice.text}</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Timeline ({activities.length})
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="py-10 text-center text-xs font-mono text-zinc-500">
                No activity logged yet.
              </div>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded bg-zinc-900/40 border border-zinc-800/80 space-y-1 text-xs"
                >
                  <div className="text-zinc-200 leading-snug">{item.text}</div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs font-medium transition-colors cursor-pointer"
          >
            Close Log
          </button>
        </div>
      </div>
    </div>
  );
}

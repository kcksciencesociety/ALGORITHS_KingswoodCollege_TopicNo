import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Cpu,
  FileText,
  Bell,
  Check,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';
import { staffDirectory } from '../data/staffData';

export default function StaffProfileDrawer({
  holderQuery,
  onClose,
  inventory,
  documents,
  onQuickReturn,
  onLogActivity
}) {
  const [pingSent, setPingSent] = useState(false);

  useEffect(() => {
    setPingSent(false);
  }, [holderQuery]);

  if (!holderQuery) return null;

  const cleanName = holderQuery.split('(')[0].trim();
  const matchedProfile = staffDirectory.find(
    (s) =>
      holderQuery.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(cleanName.toLowerCase())
  );

  const profile = matchedProfile || {
    id: 'EXT-TEMP',
    name: cleanName,
    role: 'Visiting / Ad-Hoc Staff',
    department: 'General Operations',
    station: 'Unassigned Desk',
    extension: 'N/A',
    email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@ecospark.io`,
    clearance: 'Level 1 · Standard'
  };

  const assignedGear = inventory.filter(
    (item) =>
      item.status === 'In Use' &&
      item.holder &&
      (item.holder.toLowerCase().includes(profile.name.toLowerCase()) ||
        profile.name.toLowerCase().includes(item.holder.split('(')[0].trim().toLowerCase()))
  );

  const authoredDocs = documents.filter(
    (doc) =>
      doc.author &&
      (doc.author.toLowerCase().includes(profile.name.toLowerCase()) ||
        profile.name.toLowerCase().includes(doc.author.toLowerCase()))
  );

  const handleSendReminder = () => {
    if (pingSent) return;
    onLogActivity(
      `Dispatched return reminder ping to ${profile.name} (${profile.email}) for ${assignedGear.length} active item(s)`
    );
    setPingSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl h-full animate-in slide-in-from-right duration-200">
        <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>Personnel Custody Dossier</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mt-0.5">{profile.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-md p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-zinc-100 font-medium text-sm">{profile.role}</div>
                <div className="text-zinc-500 font-mono text-[11px]">{profile.department}</div>
              </div>
              <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded font-mono text-[11px] text-zinc-400">
                {profile.id}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-zinc-800/80 font-mono text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate">{profile.station}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{profile.extension}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400/90">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>{profile.clearance}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Active Gear Custody ({assignedGear.length})</span>
                </span>
                {assignedGear.length > 0 && (
                  <button
                    onClick={handleSendReminder}
                    disabled={pingSent}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      pingSent
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {pingSent ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Ping Logged</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3 h-3 text-amber-400" />
                        <span>Ping Reminder</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {assignedGear.length === 0 ? (
                <div className="p-3 rounded bg-zinc-900/30 border border-zinc-800/60 text-zinc-500 font-mono text-[11px] text-center">
                  Zero hardware units currently checked out.
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedGear.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.2 rounded">
                            {item.id}
                          </span>
                          <span className="font-medium text-zinc-200 truncate">{item.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1">
                          Due: {item.returnDate || 'Open'} · Home: {item.location}
                        </div>
                      </div>
                      <button
                        onClick={() => onQuickReturn(item.id)}
                        title="Check item back in"
                        className="shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Return</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Authored Vault Files ({authoredDocs.length})</span>
              </span>

              {authoredDocs.length === 0 ? (
                <div className="p-3 rounded bg-zinc-900/30 border border-zinc-800/60 text-zinc-500 font-mono text-[11px] text-center">
                  No indexed documents under this author.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {authoredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded bg-zinc-900/30 border border-zinc-800/80 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <div className="text-zinc-200 font-medium truncate">{doc.name}</div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {doc.folder} · {doc.updatedAt}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500 shrink-0">{doc.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <button
            onClick={onClose}
            className="w-full py-2 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs font-medium transition-colors cursor-pointer"
          >
            Close Personnel Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
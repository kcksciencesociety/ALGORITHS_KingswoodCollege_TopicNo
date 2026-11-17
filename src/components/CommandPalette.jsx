import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Home,
  Cpu, 
  FileText, 
  ArrowRight, 
  Terminal, 
  RotateCcw, 
  Calendar,
  FileCode,
  Users,
  User
} from 'lucide-react';
import { staffDirectory } from '../data/staffData';

export default function CommandPalette({
  isOpen,
  onClose,
  inventory,
  documents,
  onNavigate,
  onSelectGear,
  onSelectDoc,
  onSelectPerson,
  onOpenAudit,
  onReset
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchingActions = [
    {
      id: 'act-home',
      type: 'action',
      label: 'Go to Home Overview',
      icon: Home,
      run: () => onNavigate('home')
    },
    {
      id: 'act-gear',
      type: 'action',
      label: 'Go to Gear & Checkouts',
      icon: Cpu,
      run: () => onNavigate('gear')
    },
    {
      id: 'act-schedule',
      type: 'action',
      label: 'Go to Booking Schedule',
      icon: Calendar,
      run: () => onNavigate('schedule')
    },
    {
      id: 'act-docs',
      type: 'action',
      label: 'Go to Document Vault',
      icon: FileText,
      run: () => onNavigate('docs')
    },
    {
      id: 'act-team',
      type: 'action',
      label: 'Go to Team Roster',
      icon: Users,
      run: () => onNavigate('team')
    },
    {
      id: 'act-audit',
      type: 'action',
      label: 'Open Activity Log',
      icon: Terminal,
      run: () => onOpenAudit()
    },
    {
      id: 'act-reset',
      type: 'action',
      label: 'Reset Demo Data to Starting Defaults',
      icon: RotateCcw,
      run: () => onReset()
    }
  ].filter((act) => act.label.toLowerCase().includes(cleanQuery));

  const matchingGear = inventory
    .filter(
      (item) =>
        item.name.toLowerCase().includes(cleanQuery) ||
        item.id.toLowerCase().includes(cleanQuery) ||
        item.location.toLowerCase().includes(cleanQuery) ||
        (item.notes && item.notes.toLowerCase().includes(cleanQuery))
    )
    .slice(0, 4);

  const matchingDocs = documents
    .filter(
      (doc) =>
        doc.name.toLowerCase().includes(cleanQuery) ||
        doc.folder.toLowerCase().includes(cleanQuery) ||
        doc.tags.some((t) => t.toLowerCase().includes(cleanQuery))
    )
    .slice(0, 4);

  const matchingStaff = cleanQuery
    ? staffDirectory
        .filter(
          (person) =>
            person.name.toLowerCase().includes(cleanQuery) ||
            (person.role && person.role.toLowerCase().includes(cleanQuery)) ||
            (person.station && person.station.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 3)
    : [];

  const totalResults = [
    ...matchingActions.map((a) => ({ ...a, group: 'Actions' })),
    ...matchingGear.map((g) => ({ ...g, group: 'Gear' })),
    ...matchingDocs.map((d) => ({ ...d, group: 'Documents' })),
    ...matchingStaff.map((s) => ({ ...s, group: 'Team' }))
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResults.length) % (totalResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = totalResults[selectedIndex];
      if (current) executeItem(current);
    }
  };

  const executeItem = (item) => {
    if (item.group === 'Actions') {
      item.run();
    } else if (item.group === 'Gear') {
      onSelectGear(item);
    } else if (item.group === 'Documents') {
      onSelectDoc(item);
    } else if (item.group === 'Team' && onSelectPerson) {
      onSelectPerson(item.name);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col font-sans text-xs"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-3.5 py-3 border-b border-zinc-800 bg-zinc-900/50">
          <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search gear tag, person, or files..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs sm:text-sm font-sans"
          />
          <kbd className="hidden sm:inline-block bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {totalResults.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 font-mono text-xs">
              No matching commands, gear, people, or files found for "{query}".
            </div>
          ) : (
            <>
              {matchingActions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Quick Commands
                  </div>
                  {matchingActions.map((act) => {
                    const itemIndex = totalResults.findIndex((r) => r.id === act.id);
                    const isSelected = itemIndex === selectedIndex;
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.id}
                        onClick={() => executeItem({ ...act, group: 'Actions' })}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{act.label}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                      </button>
                    );
                  })}
                </div>
              )}

              {matchingGear.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Equipment
                  </div>
                  {matchingGear.map((gear) => {
                    const itemIndex = totalResults.findIndex((r) => r.id === gear.id);
                    const isSelected = itemIndex === selectedIndex;
                    return (
                      <button
                        key={gear.id}
                        onClick={() => executeItem({ ...gear, group: 'Gear' })}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <span className="font-mono text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                            {gear.id}
                          </span>
                          <span className="truncate">{gear.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span className="text-zinc-500 hidden sm:inline">{gear.location}</span>
                          <span
                            className={
                              gear.status === 'Available'
                                ? 'text-emerald-400'
                                : gear.status === 'Maintenance'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }
                          >
                            {gear.status === 'Maintenance' ? 'In Repair' : gear.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchingDocs.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Project Documents
                  </div>
                  {matchingDocs.map((doc) => {
                    const itemIndex = totalResults.findIndex((r) => r.id === doc.id);
                    const isSelected = itemIndex === selectedIndex;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => executeItem({ ...doc, group: 'Documents' })}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                          {doc.folder}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchingStaff.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Team Members
                  </div>
                  {matchingStaff.map((person) => {
                    const itemIndex = totalResults.findIndex((r) => r.id === person.id);
                    const isSelected = itemIndex === selectedIndex;
                    return (
                      <button
                        key={person.id}
                        onClick={() => executeItem({ ...person, group: 'Team' })}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{person.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                          {person.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-2 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-[11px] font-mono text-zinc-500 px-3">
          <div className="flex items-center gap-3">
            <span>↑↓ Move</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
          <div>EcoSpark Quick Search</div>
        </div>
      </div>
    </div>
  );
}

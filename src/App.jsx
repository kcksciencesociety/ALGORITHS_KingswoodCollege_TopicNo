import React, { useState, useEffect } from 'react';
import { initialInventory } from './data/inventoryData';
import { initialDocuments } from './data/documentData';
import { staffDirectory } from './data/staffData';
import OverviewHome from './components/OverviewHome';
import GearLedger from './components/GearLedger';
import DocumentExplorer from './components/DocumentExplorer';
import ReservationSchedule from './components/ReservationSchedule';
import TeamRoster from './components/TeamRoster';
import ActivityFeed from './components/ActivityFeed';
import CommandPalette from './components/CommandPalette';
import StaffProfileDrawer from './components/StaffProfileDrawer';
import ConfirmDialog from './components/ConfirmDialog';
import { 
  Home,
  Cpu, 
  FileText, 
  Activity, 
  ShieldCheck, 
  RotateCcw,
  Boxes,
  Clock,
  CheckCircle2,
  Search,
  Wrench,
  Calendar,
  CalendarClock,
  Users
} from 'lucide-react';

const buildInitialReservations = () => {
  const d1 = new Date();
  d1.setDate(d1.getDate() + 1);
  const d2 = new Date();
  d2.setDate(d2.getDate() + 3);

  const staffOne = staffDirectory[0] ? `${staffDirectory[0].name} (${staffDirectory[0].role})` : 'Maya Lin';
  const staffTwo = staffDirectory[3] ? `${staffDirectory[3].name} (${staffDirectory[3].role})` : 'Elena Rostova';

  return [
    {
      id: 'RES-2041',
      gearId: 'ESP-AV-101',
      reservedBy: staffOne,
      date: d1.toISOString().split('T')[0],
      timeSlot: '09:00 - 12:00 (Morning)',
      purpose: 'Classroom 3B Smart-Wall Pilot Demo'
    },
    {
      id: 'RES-2042',
      gearId: 'ESP-IOT-009',
      reservedBy: staffTwo,
      date: d2.toISOString().split('T')[0],
      timeSlot: '13:00 - 16:30 (Afternoon)',
      purpose: 'Assembly Room Microclimate Telemetry Lab'
    }
  ];
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [gearStatusFilter, setGearStatusFilter] = useState('ALL');
  const [focusedGearItem, setFocusedGearItem] = useState(null);
  const [focusedDocItem, setFocusedDocItem] = useState(null);
  const [backupVersion, setBackupVersion] = useState(0);
  
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('ecospark_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('ecospark_docs');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('ecospark_reservations');
    return saved ? JSON.parse(saved) : buildInitialReservations();
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('ecospark_activities');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Workspace initialized with primary lab gear and project files.', time: '08:30 AM' }
    ];
  });

  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedHolder, setSelectedHolder] = useState(null);
  const [preselectedReserveGearId, setPreselectedReserveGearId] = useState(null);

  useEffect(() => {
    localStorage.setItem('ecospark_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('ecospark_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('ecospark_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('ecospark_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const logActivity = (text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivities((prev) => [{ id: Date.now(), text, time: timestamp }, ...prev]);
  };

  const navigateToSection = (tab, status = 'ALL') => {
    if (tab === 'gear') {
      setGearStatusFilter(status);
    }
    setActiveTab(tab);
  };

  const handleSelectGearFromPalette = (gearItem) => {
    setGearStatusFilter('ALL');
    setFocusedGearItem(gearItem);
    setActiveTab('gear');
  };

  const handleSelectDocFromPalette = (docItem) => {
    setFocusedDocItem(docItem);
    setActiveTab('docs');
  };

  const handleQuickReturn = (itemId) => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target || target.status === 'Available') return;

    const today = new Date().toISOString().split('T')[0];
    const newRecord = {
      id: `H-${Date.now().toString().slice(-4)}`,
      date: today,
      type: 'Returned',
      user: target.holder || 'Staff Member',
      note: `Returned to ${target.location}`
    };

    logActivity(`Returned "${target.name}" (${target.id}) back to ${target.location}`);

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'Available',
            holder: null,
            returnDate: null,
            history: [newRecord, ...(item.history || [])]
          };
        }
        return item;
      })
    );
  };

  const handleFulfillReservation = (reservation) => {
    const target = inventory.find((i) => i.id === reservation.gearId);
    if (!target || target.status !== 'Available') return;

    const today = new Date().toISOString().split('T')[0];
    const newRecord = {
      id: `H-${Date.now().toString().slice(-4)}`,
      date: today,
      type: 'Dispatched',
      user: reservation.reservedBy,
      note: `Checked out from booking ${reservation.id} (${reservation.purpose})`
    };

    logActivity(
      `Checked out booked gear "${target.name}" (${target.id}) to ${reservation.reservedBy}`
    );

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === target.id) {
          return {
            ...item,
            status: 'In Use',
            holder: reservation.reservedBy,
            returnDate: reservation.date,
            history: [newRecord, ...(item.history || [])]
          };
        }
        return item;
      })
    );

    setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
  };

  const handleReserveGearFromLedger = (gearId) => {
    setPreselectedReserveGearId(gearId);
    setActiveTab('schedule');
  };

  const handleExportBackup = () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      app: 'EcoSpark Ops Hub',
      exportedAt: new Date().toISOString(),
      inventory,
      documents,
      reservations,
      activities,
      customFolders: JSON.parse(localStorage.getItem('ecospark_custom_folders') || '[]'),
      pinnedDocIds: JSON.parse(localStorage.getItem('ecospark_pinned_docs') || '[]')
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ecospark-backup-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logActivity(`Saved workspace backup (ecospark-backup-${today}.json)`);
  };

  const handleImportBackup = (data) => {
    if (!data || !Array.isArray(data.inventory) || !Array.isArray(data.documents)) {
      return { ok: false };
    }

    const nextReservations = Array.isArray(data.reservations)
      ? data.reservations
      : [];
    const nextFolders = Array.isArray(data.customFolders)
      ? data.customFolders
      : [];
    const nextPinned = Array.isArray(data.pinnedDocIds)
      ? data.pinnedDocIds
      : [];

    setInventory(data.inventory);
    setDocuments(data.documents);
    setReservations(nextReservations);
    localStorage.setItem('ecospark_custom_folders', JSON.stringify(nextFolders));
    localStorage.setItem('ecospark_pinned_docs', JSON.stringify(nextPinned));
    setBackupVersion((v) => v + 1);

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const priorLogs = Array.isArray(data.activities) ? data.activities : activities;
    setActivities([
      {
        id: Date.now(),
        text: `Restored backup (${data.inventory.length} gear, ${data.documents.length} files)`,
        time: timestamp
      },
      ...priorLogs
    ]);

    return {
      ok: true,
      gearCount: data.inventory.length,
      docCount: data.documents.length
    };
  };

  const executeResetDefaults = () => {
    setInventory(initialInventory);
    setDocuments(initialDocuments);
    setReservations(buildInitialReservations());
    setGearStatusFilter('ALL');
    setActivities([{ id: Date.now(), text: 'Demo data reset to starting defaults.', time: 'Just now' }]);
    localStorage.removeItem('ecospark_inventory');
    localStorage.removeItem('ecospark_docs');
    localStorage.removeItem('ecospark_reservations');
    localStorage.removeItem('ecospark_activities');
    localStorage.removeItem('ecospark_pinned_docs');
    localStorage.removeItem('ecospark_custom_folders');
    setBackupVersion((v) => v + 1);
    setShowResetConfirm(false);
  };

  const availableCount = inventory.filter((item) => item.status === 'Available').length;
  const inUseCount = inventory.filter((item) => item.status === 'In Use').length;
  const maintenanceCount = inventory.filter((item) => item.status === 'Maintenance').length;

  return (
    <div className="min-h-screen hub-canvas text-zinc-100 font-sans flex flex-col selection:bg-zinc-700 selection:text-white">
      <header className="border-b border-zinc-800/90 bg-zinc-950/85 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-white shadow-[0_1px_0_0_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-zinc-950 font-mono font-bold text-xs tracking-tighter transition-all">
              ES
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-100">EcoSpark</span>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                OPS HUB
              </span>
            </div>
          </button>

          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex-1 max-w-md h-9 flex items-center justify-between px-3 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-lg text-xs text-zinc-400 transition-all cursor-pointer min-w-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate hidden md:inline">Search gear, docs, team, or commands...</span>
              <span className="truncate md:hidden">Search...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400 shrink-0">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <nav className="h-9 flex items-center gap-0.5 sm:gap-1 bg-zinc-900/80 border border-zinc-800/90 p-1 rounded-lg text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
              <button
                onClick={() => setActiveTab('home')}
                title="Home"
                className={`h-7 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => navigateToSection('gear', 'ALL')}
                title="Gear"
                className={`h-7 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'gear'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gear</span>
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                title="Schedule"
                className={`h-7 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule</span>
                {reservations.length > 0 && (
                  <span
                    className={`font-mono tabular-nums text-[10px] px-1.5 rounded hidden md:inline ${
                      activeTab === 'schedule'
                        ? 'bg-zinc-900 text-zinc-100'
                        : 'bg-sky-950/90 text-sky-300 border border-sky-800/60'
                    }`}
                  >
                    {reservations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                title="Docs"
                className={`h-7 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'docs'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Docs</span>
              </button>
              <button
                onClick={() => setActiveTab('team')}
                title="Team"
                className={`h-7 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Team</span>
              </button>
            </nav>

            <button
              onClick={() => setShowActivityDrawer(true)}
              title="Activity Log & Backup"
              className="h-9 flex items-center gap-1.5 px-2.5 bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 rounded-lg text-xs transition-all cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono tabular-nums text-[10px] bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                {activities.length}
              </span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              title="Reset demo data to defaults"
              className="h-9 w-9 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {activeTab !== 'home' && (
        <section className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xs py-3 animate-view-enter">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs font-mono tabular-nums">
            <button
              type="button"
              onClick={() => navigateToSection('gear', 'ALL')}
              className={`relative overflow-hidden px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'gear' && gearStatusFilter === 'ALL'
                  ? 'bg-zinc-900 border-zinc-600 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {activeTab === 'gear' && gearStatusFilter === 'ALL' && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-zinc-200" />
              )}
              <div className="flex items-center gap-2 text-zinc-400">
                <Boxes className="w-3.5 h-3.5" />
                <span>TOTAL</span>
              </div>
              <span className="text-zinc-100 font-semibold">{inventory.length}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToSection('gear', 'Available')}
              className={`relative overflow-hidden px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'gear' && gearStatusFilter === 'Available'
                  ? 'bg-emerald-950/40 border-emerald-700/80 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {activeTab === 'gear' && gearStatusFilter === 'Available' && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-emerald-400" />
              )}
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AVAILABLE</span>
              </div>
              <span className="text-zinc-100 font-semibold">{availableCount}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToSection('gear', 'In Use')}
              className={`relative overflow-hidden px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'gear' && gearStatusFilter === 'In Use'
                  ? 'bg-amber-950/40 border-amber-700/80 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {activeTab === 'gear' && gearStatusFilter === 'In Use' && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-amber-400" />
              )}
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>IN USE</span>
              </div>
              <span className="text-zinc-100 font-semibold">{inUseCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`relative overflow-hidden px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-sky-950/40 border-sky-700/80 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {activeTab === 'schedule' && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-sky-400" />
              )}
              <div className="flex items-center gap-2 text-sky-400">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>BOOKED</span>
              </div>
              <span className="text-zinc-100 font-semibold">{reservations.length}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToSection('gear', 'Maintenance')}
              className={`relative overflow-hidden px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'gear' && gearStatusFilter === 'Maintenance'
                  ? 'bg-rose-950/40 border-rose-700/80 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {activeTab === 'gear' && gearStatusFilter === 'Maintenance' && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-rose-400" />
              )}
              <div className="flex items-center gap-2 text-rose-400">
                <Wrench className="w-3.5 h-3.5" />
                <span>REPAIR</span>
              </div>
              <span className="text-zinc-100 font-semibold">{maintenanceCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`relative overflow-hidden px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'docs'
                  ? 'bg-zinc-900 border-zinc-600 shadow-sm'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {activeTab === 'docs' && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-zinc-200" />
              )}
              <div className="flex items-center gap-2 text-zinc-400">
                <FileText className="w-3.5 h-3.5" />
                <span>DOCS</span>
              </div>
              <span className="text-zinc-100 font-semibold">{documents.length}</span>
            </button>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-7 flex-1 w-full">
        <div key={activeTab} className="animate-view-enter">
        {activeTab === 'home' && (
          <OverviewHome
            inventory={inventory}
            documents={documents}
            reservations={reservations}
            activities={activities}
            onNavigate={navigateToSection}
            onOpenActivity={() => setShowActivityDrawer(true)}
            onInspectHolder={(holder) => setSelectedHolder(holder)}
            onQuickReturn={handleQuickReturn}
            onOpenSearch={() => setShowCommandPalette(true)}
          />
        )}

        {activeTab === 'gear' && (
          <GearLedger
            inventory={inventory}
            setInventory={setInventory}
            reservations={reservations}
            statusFilter={gearStatusFilter}
            setStatusFilter={setGearStatusFilter}
            focusedGearItem={focusedGearItem}
            onClearFocusedGear={() => setFocusedGearItem(null)}
            onLogActivity={logActivity}
            onInspectHolder={(holder) => setSelectedHolder(holder)}
            onQuickReturn={handleQuickReturn}
            onReserveGear={handleReserveGearFromLedger}
          />
        )}

        {activeTab === 'schedule' && (
          <ReservationSchedule
            inventory={inventory}
            reservations={reservations}
            setReservations={setReservations}
            onFulfillReservation={handleFulfillReservation}
            onLogActivity={logActivity}
            onInspectHolder={(holder) => setSelectedHolder(holder)}
            preselectedGearId={preselectedReserveGearId}
            onClearPreselectedGear={() => setPreselectedReserveGearId(null)}
          />
        )}

        {activeTab === 'docs' && (
          <DocumentExplorer
            key={backupVersion}
            documents={documents}
            setDocuments={setDocuments}
            focusedDocItem={focusedDocItem}
            onClearFocusedDoc={() => setFocusedDocItem(null)}
            onLogActivity={logActivity}
          />
        )}

        {activeTab === 'team' && (
          <TeamRoster
            inventory={inventory}
            documents={documents}
            reservations={reservations}
            onInspectHolder={(holder) => setSelectedHolder(holder)}
          />
        )}
        </div>
      </main>

      <ActivityFeed
        isOpen={showActivityDrawer}
        onClose={() => setShowActivityDrawer(false)}
        activities={activities}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      <StaffProfileDrawer
        holderQuery={selectedHolder}
        onClose={() => setSelectedHolder(null)}
        inventory={inventory}
        documents={documents}
        onQuickReturn={handleQuickReturn}
        onLogActivity={logActivity}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        inventory={inventory}
        documents={documents}
        onNavigate={(tab) => navigateToSection(tab, 'ALL')}
        onSelectGear={handleSelectGearFromPalette}
        onSelectDoc={handleSelectDocFromPalette}
        onSelectPerson={(name) => setSelectedHolder(name)}
        onOpenAudit={() => setShowActivityDrawer(true)}
        onReset={() => setShowResetConfirm(true)}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset demo data?"
        message="This will clear any changes you made and restore the starting gear, bookings, and project files."
        confirmLabel="Reset Data"
        tone="danger"
        onConfirm={executeResetDefaults}
        onCancel={() => setShowResetConfirm(false)}
      />

      <footer className="border-t border-zinc-800/80 bg-zinc-950/90 py-3.5 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>EcoSpark Innovations · Internal Operations Hub</span>
          </div>
          <div className="text-zinc-600">Workspace Synced Locally</div>
        </div>
      </footer>
    </div>
  );
}

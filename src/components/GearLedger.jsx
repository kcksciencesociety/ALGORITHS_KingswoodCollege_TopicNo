import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  X, 
  Plus, 
  LayoutList, 
  LayoutGrid, 
  MapPin, 
  History,
  Tag,
  AlertTriangle,
  Wrench,
  Check,
  User,
  CalendarPlus,
  CalendarClock,
  QrCode,
  ScanLine,
  RotateCcw
} from 'lucide-react';
import { staffDirectory } from '../data/staffData';
import { AssetLabelModal, QuickTagScannerModal } from './AssetTagModal';

function isItemOverdue(item) {
  if (item.status !== 'In Use' || !item.returnDate) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.returnDate)) return false;
  const today = new Date().toISOString().split('T')[0];
  return item.returnDate < today;
}

export default function GearLedger({
  inventory,
  setInventory,
  reservations = [],
  statusFilter = 'ALL',
  setStatusFilter,
  focusedGearItem,
  onClearFocusedGear,
  onLogActivity,
  onInspectHolder,
  onQuickReturn,
  onReserveGear
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [viewMode, setViewMode] = useState('table');
  const [selectedItem, setSelectedItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [maintenanceTarget, setMaintenanceTarget] = useState(null);
  const [labelItem, setLabelItem] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [issueReporter, setIssueReporter] = useState('');
  const [issueSeverity, setIssueSeverity] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    id: '',
    name: '',
    category: 'Classroom AV',
    location: '',
    condition: 'Nominal',
    notes: ''
  });

  useEffect(() => {
    setLocalStatusFilter(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (focusedGearItem) {
      const latest = inventory.find((i) => i.id === focusedGearItem.id) || focusedGearItem;
      setHistoryItem(latest);
      if (onClearFocusedGear) {
        onClearFocusedGear();
      }
    }
  }, [focusedGearItem, inventory, onClearFocusedGear]);

  const activeStatus = setStatusFilter ? statusFilter : localStatusFilter;
  const updateStatus = (next) => {
    if (setStatusFilter) {
      setStatusFilter(next);
    } else {
      setLocalStatusFilter(next);
    }
  };

  const categories = ['ALL', 'Classroom AV', 'Dev Hardware', 'STEM Tools', 'Lab Equipment'];

  const getNextReservation = (gearId) => {
    const matching = reservations
      .filter((r) => r.gearId === gearId)
      .sort((a, b) => a.date.localeCompare(b.date));
    return matching[0] || null;
  };

  const filteredItems = inventory.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.holder && item.holder.toLowerCase().includes(q));
    
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStatus = activeStatus === 'ALL' || item.status === activeStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleReturnClick = (itemId) => {
    onQuickReturn(itemId);
    if (selectedItem?.id === itemId) setSelectedItem(null);
    if (historyItem?.id === itemId) {
      setHistoryItem((prev) => ({
        ...prev,
        status: 'Available',
        holder: null,
        returnDate: null
      }));
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || !borrowerName.trim() || !selectedItem) return;
    setIsSubmitting(true);

    const target = selectedItem;
    const borrower = borrowerName.trim();
    const expected = returnDate || 'Open return';
    const today = new Date().toISOString().split('T')[0];

    const newRecord = {
      id: `H-${Date.now().toString().slice(-4)}`,
      date: today,
      type: 'Dispatched',
      user: borrower,
      note: `Expected return: ${expected}`
    };

    onLogActivity(`Checked out "${target.name}" to ${borrower} (Expected: ${expected})`);

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === target.id) {
          return {
            ...item,
            status: 'In Use',
            holder: borrower,
            returnDate: expected,
            history: [newRecord, ...(item.history || [])]
          };
        }
        return item;
      })
    );

    setBorrowerName('');
    setReturnDate('');
    setSelectedItem(null);
    setIsSubmitting(false);
  };

  const handleReportIssueSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || !issueReporter.trim() || !issueDescription.trim() || !maintenanceTarget) return;
    setIsSubmitting(true);

    const target = maintenanceTarget;
    const today = new Date().toISOString().split('T')[0];

    const incidentData = {
      reporter: issueReporter.trim(),
      date: today,
      severity: issueSeverity,
      description: issueDescription.trim()
    };

    const newRecord = {
      id: `H-${Date.now().toString().slice(-4)}`,
      date: today,
      type: 'Maintenance Flag',
      user: issueReporter.trim(),
      note: `${issueSeverity} Issue: ${issueDescription.trim()}`
    };

    onLogActivity(`Reported issue on "${target.name}" (${target.id}) by ${issueReporter.trim()}`);

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === target.id) {
          return {
            ...item,
            status: 'Maintenance',
            holder: null,
            returnDate: null,
            condition: `${issueSeverity} Issue`,
            maintenanceIssue: incidentData,
            history: [newRecord, ...(item.history || [])]
          };
        }
        return item;
      })
    );

    setIssueReporter('');
    setIssueSeverity('Medium');
    setIssueDescription('');
    setMaintenanceTarget(null);
    setIsSubmitting(false);
  };

  const handleResolveMaintenance = (itemId) => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target) return;

    const today = new Date().toISOString().split('T')[0];
    const newRecord = {
      id: `H-${Date.now().toString().slice(-4)}`,
      date: today,
      type: 'Commissioned',
      user: 'Repair Bench',
      note: 'Repair finished. Back in available pool.'
    };

    onLogActivity(`Cleared repair on "${target.name}" (${target.id}). Back in service.`);

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'Available',
            condition: 'Nominal',
            maintenanceIssue: null,
            history: [newRecord, ...(item.history || [])]
          };
        }
        return item;
      })
    );

    if (historyItem?.id === itemId) {
      setHistoryItem((prev) => ({
        ...prev,
        status: 'Available',
        condition: 'Nominal',
        maintenanceIssue: null,
        history: [newRecord, ...(prev.history || [])]
      }));
    }
  };

  const handleAddAssetSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!newAsset.name.trim() || !newAsset.location.trim()) return;
    setIsSubmitting(true);

    const generatedId = newAsset.id.trim() || `ESP-GEN-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    
    const createdItem = {
      ...newAsset,
      id: generatedId,
      status: 'Available',
      holder: null,
      returnDate: null,
      maintenanceIssue: null,
      history: [
        {
          id: `H-${Date.now().toString().slice(-4)}`,
          date: today,
          type: 'Commissioned',
          user: 'Ops Hub',
          note: `Added at ${newAsset.location}`
        }
      ]
    };

    onLogActivity(`Added new gear: "${createdItem.name}" (${createdItem.id})`);
    setInventory((prev) => [createdItem, ...prev]);
    
    setNewAsset({
      id: '',
      name: '',
      category: 'Classroom AV',
      location: '',
      condition: 'Nominal',
      notes: ''
    });
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div className="hub-panel border border-zinc-800/90 p-3 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 text-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tag, gear name, shelf, notes, or person..."
            className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 text-xs focus:outline-none focus:border-zinc-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <div className="h-9 flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
            {['ALL', 'Available', 'In Use', 'Maintenance'].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                className={`h-7 px-2.5 rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeStatus === status
                    ? 'bg-zinc-800 text-zinc-100 font-medium border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {status === 'Maintenance' ? 'In Repair' : status}
              </button>
            ))}
          </div>

          <div className="h-9 flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`h-7 w-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`h-7 w-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowScannerModal(true)}
            title="Quick Tag Lookup / Scanner"
            className="h-9 flex items-center gap-1.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Tag</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 flex items-center gap-1.5 px-3.5 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Gear</span>
          </button>
        </div>
      </div>

      <div
        key={`${activeStatus}-${selectedCategory}-${viewMode}`}
        className="animate-filter-swap"
      >
      {filteredItems.length === 0 ? (
        <div className="hub-panel border border-zinc-800 rounded-xl py-14 text-center text-zinc-500 font-mono text-xs">
          No matching gear found.
        </div>
      ) : viewMode === 'table' ? (
        <div className="hub-panel border border-zinc-800/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
                  <th className="py-3.5 px-4">Tag</th>
                  <th className="py-3.5 px-4">Gear & Notes</th>
                  <th className="py-3.5 px-4">Home Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredItems.map((item) => {
                  const isAvailable = item.status === 'Available';
                  const isMaintenance = item.status === 'Maintenance';
                  const nextRes = getNextReservation(item.id);
                  const overdue = isItemOverdue(item);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-300 whitespace-nowrap">
                        <button
                          onClick={() => setHistoryItem(item)}
                          title="View item history"
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-md text-[11px] text-zinc-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Tag className="w-3 h-3 text-zinc-500" />
                          <span>{item.id}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-100 flex items-center gap-2">
                          <span>{item.name}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                          <span className="text-zinc-400">{item.category}</span>
                          <span>•</span>
                          <span>{item.notes || 'No notes added.'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                        {item.location}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAvailable ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Available
                          </div>
                        ) : isMaintenance ? (
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-950/50 text-rose-400 border border-rose-800/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              In Repair
                            </div>
                            <div className="text-[10px] text-rose-300/80 font-mono">
                              {item.condition}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-950/50 text-amber-400 border border-amber-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                In Use
                              </div>
                              {overdue && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 font-mono text-[10px] uppercase">
                                  Overdue
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                              <span>By:</span>
                              <button
                                onClick={() => onInspectHolder(item.holder)}
                                className="text-zinc-200 hover:text-white underline decoration-zinc-600 hover:decoration-zinc-300 underline-offset-2 cursor-pointer transition-colors"
                              >
                                {item.holder}
                              </button>
                            </div>
                            {item.returnDate && (
                              <div
                                className={`text-[10px] font-mono tabular-nums ${
                                  overdue ? 'text-rose-400' : 'text-zinc-500'
                                }`}
                              >
                                Due: {item.returnDate}
                              </div>
                            )}
                          </div>
                        )}

                        {nextRes && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/50 border border-sky-800/50 text-sky-300 font-mono tabular-nums text-[10px]">
                            <CalendarClock className="w-3 h-3 shrink-0" />
                            <span>Booked {nextRes.date}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setLabelItem(item)}
                            title="Print Asset Sticker"
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setHistoryItem(item)}
                            title="View History"
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {!isMaintenance && onReserveGear && (
                            <button
                              onClick={() => onReserveGear(item.id)}
                              title="Book for Later"
                              className="p-1.5 bg-zinc-900 hover:bg-sky-950/60 border border-zinc-800 hover:border-sky-800/60 rounded-md text-zinc-400 hover:text-sky-300 transition-colors cursor-pointer"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isMaintenance ? (
                            <button
                              onClick={() => handleResolveMaintenance(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900 rounded-md text-xs font-medium transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Fixed</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setMaintenanceTarget(item)}
                              title="Report Issue"
                              className="p-1.5 bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-800/60 rounded-md text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isAvailable && (
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 text-zinc-950 hover:bg-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Check Out
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.status === 'In Use' && (
                            <button
                              onClick={() => handleReturnClick(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 rounded-md text-xs font-medium transition-colors cursor-pointer"
                            >
                              Mark Returned
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const isAvailable = item.status === 'Available';
            const isMaintenance = item.status === 'Maintenance';
            const nextRes = getNextReservation(item.id);
            const overdue = isItemOverdue(item);
            return (
              <div
                key={item.id}
                className="hub-card border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setHistoryItem(item)}
                      className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Tag className="w-3 h-3 text-zinc-500" />
                      <span>{item.id}</span>
                    </button>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border bg-zinc-950 ${
                      isMaintenance ? 'border-rose-800/80 text-rose-400' : 'border-zinc-800 text-zinc-500'
                    }`}>
                      {item.condition}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-zinc-100 leading-snug">{item.name}</h4>
                    <span className="text-[11px] text-zinc-500 font-mono block mt-0.5">{item.category}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {nextRes && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-950/40 border border-sky-800/50 text-sky-300 font-mono tabular-nums text-[10px]">
                        <CalendarClock className="w-3 h-3 shrink-0" />
                        <span>Next booking: {nextRes.date} ({nextRes.reservedBy.split('(')[0].trim()})</span>
                      </div>
                    )}

                    <p className="text-[11px] text-zinc-500 line-clamp-2">
                      {isMaintenance && item.maintenanceIssue
                        ? `Issue: ${item.maintenanceIssue.description}`
                        : item.notes || 'No notes added.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div>
                    {isAvailable ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Available
                      </div>
                    ) : isMaintenance ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-950/50 text-rose-400 border border-rose-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        In Repair
                      </div>
                    ) : (
                      <div className="text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium bg-amber-950/50 text-amber-400 border border-amber-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            In Use
                          </div>
                          {overdue && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-rose-300 font-mono text-[9px] uppercase">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-400 font-mono text-[10px] mt-1 flex items-center gap-1">
                          <span>By:</span>
                          <button
                            onClick={() => onInspectHolder(item.holder)}
                            className="text-zinc-200 hover:text-white underline decoration-zinc-600 underline-offset-2 cursor-pointer"
                          >
                            {item.holder}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setLabelItem(item)}
                      title="Print Asset Sticker"
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setHistoryItem(item)}
                      title="View History"
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>

                    {!isMaintenance && onReserveGear && (
                      <button
                        onClick={() => onReserveGear(item.id)}
                        title="Book for Later"
                        className="p-1.5 bg-zinc-900 hover:bg-sky-950/60 border border-zinc-800 hover:border-sky-800/60 rounded-md text-zinc-400 hover:text-sky-300 transition-colors cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isMaintenance ? (
                      <button
                        onClick={() => handleResolveMaintenance(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900 rounded-md text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Fixed</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setMaintenanceTarget(item)}
                        title="Report Issue"
                        className="p-1.5 bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-800/60 rounded-md text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isAvailable && (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 text-zinc-950 hover:bg-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Check Out
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.status === 'In Use' && (
                      <button
                        onClick={() => handleReturnClick(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 rounded-md text-xs font-medium transition-colors cursor-pointer"
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-backdrop-in">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl h-full animate-drawer-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Check Out Gear</span>
                  <h3 className="text-base font-semibold text-zinc-100 mt-0.5">{selectedItem.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-4 space-y-2 text-xs">
                <div className="text-zinc-200 font-medium text-sm">{selectedItem.name}</div>
                <div className="text-zinc-400 font-mono">Location: {selectedItem.location}</div>
                <div className="text-zinc-500">{selectedItem.notes}</div>
              </div>

              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Who is taking this? *</label>
                  <input
                    type="text"
                    required
                    list="staff-roster"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="Pick a team member or type a name..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans"
                  />
                  <datalist id="staff-roster">
                    {staffDirectory.map((staff) => (
                      <option key={staff.id} value={`${staff.name} (${staff.role})`} />
                    ))}
                  </datalist>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {staffDirectory.slice(0, 4).map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => setBorrowerName(`${staff.name} (${staff.role})`)}
                        className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {staff.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Expected Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono text-xs"
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Confirm Check Out
              </button>
            </div>
          </div>
        </div>
      )}

      {maintenanceTarget && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-backdrop-in">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl h-full animate-drawer-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-rose-400 font-mono text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Gear Issue</span>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100 mt-0.5">{maintenanceTarget.id}</h3>
                </div>
                <button
                  onClick={() => setMaintenanceTarget(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3.5 space-y-1 text-xs">
                <div className="text-zinc-200 font-medium">{maintenanceTarget.name}</div>
                <div className="text-zinc-500 font-mono">Location: {maintenanceTarget.location}</div>
              </div>

              <form id="incident-form" onSubmit={handleReportIssueSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Reported By *</label>
                  <input
                    type="text"
                    required
                    list="staff-roster"
                    value={issueReporter}
                    onChange={(e) => setIssueReporter(e.target.value)}
                    placeholder="Pick a team member or type your name..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">How urgent is it?</label>
                  <select
                    value={issueSeverity}
                    onChange={(e) => setIssueSeverity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 text-xs"
                  >
                    <option value="Low">Low (Minor wear, still works)</option>
                    <option value="Medium">Medium (Needs checking before next use)</option>
                    <option value="Critical">Critical (Broken / Do not use)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">What went wrong? *</label>
                  <textarea
                    required
                    rows="3"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe the problem or missing part..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none font-sans"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setMaintenanceTarget(null)}
                className="flex-1 py-2 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="incident-form"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Send to Repair
              </button>
            </div>
          </div>
        </div>
      )}

      {historyItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-backdrop-in">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl h-full animate-drawer-in">
            <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Gear History</span>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100 mt-0.5">{historyItem.id}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const item = historyItem;
                      setHistoryItem(null);
                      setLabelItem(item);
                    }}
                    title="Print Asset Sticker"
                    className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setHistoryItem(null)}
                    className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="font-medium text-zinc-100 text-sm">{historyItem.name}</div>
                <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                  <span>Home: {historyItem.location}</span>
                  <span className="text-zinc-500">State: {historyItem.condition}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">Status right now:</span>
                  {historyItem.status === 'Available' ? (
                    <span className="text-emerald-400 font-mono text-xs">Available on shelf</span>
                  ) : historyItem.status === 'Maintenance' ? (
                    <span className="text-rose-400 font-mono text-xs">In Repair</span>
                  ) : (
                    <button
                      onClick={() => {
                        const holder = historyItem.holder;
                        setHistoryItem(null);
                        onInspectHolder(holder);
                      }}
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-mono text-xs cursor-pointer"
                    >
                      With {historyItem.holder}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                  Past Activity
                </span>
                {(!historyItem.history || historyItem.history.length === 0) ? (
                  <div className="text-zinc-600 text-xs font-mono py-6 text-center">
                    No activity recorded yet.
                  </div>
                ) : (
                  historyItem.history.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-1.5 text-xs font-sans"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          record.type === 'Dispatched' 
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' 
                            : record.type === 'Returned' 
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' 
                            : record.type === 'Maintenance Flag'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          {record.type === 'Dispatched'
                            ? 'Checked Out'
                            : record.type === 'Maintenance Flag'
                            ? 'Repair Issue'
                            : record.type}
                        </span>
                        <span className="text-zinc-500 tabular-nums">{record.date}</span>
                      </div>
                      <button
                        onClick={() => {
                          setHistoryItem(null);
                          onInspectHolder(record.user);
                        }}
                        className="text-zinc-200 hover:text-white hover:underline underline-offset-2 font-medium text-left flex items-center gap-1.5 cursor-pointer"
                      >
                        <User className="w-3 h-3 text-zinc-500" />
                        <span>{record.user}</span>
                      </button>
                      <div className="text-[11px] text-zinc-400 font-mono">{record.note}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex gap-2">
              {historyItem.status === 'Available' && (
                <button
                  onClick={() => {
                    const item = historyItem;
                    setHistoryItem(null);
                    setSelectedItem(item);
                  }}
                  className="flex-1 py-2 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Check Out</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
              {historyItem.status === 'In Use' && (
                <button
                  onClick={() => handleReturnClick(historyItem.id)}
                  className="flex-1 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mark Returned</span>
                </button>
              )}
              {historyItem.status === 'Maintenance' && (
                <button
                  onClick={() => handleResolveMaintenance(historyItem.id)}
                  className="flex-1 py-2 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-xs font-medium transition-colors cursor-pointer"
                >
                  Mark Fixed
                </button>
              )}
              <button
                onClick={() => setHistoryItem(null)}
                className="flex-1 py-2 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-backdrop-in">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 animate-modal-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-100">Add New Gear</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAssetSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-zinc-300">Asset Tag (Leave blank to auto-generate)</label>
                <input
                  type="text"
                  value={newAsset.id}
                  onChange={(e) => setNewAsset({ ...newAsset, id: e.target.value })}
                  placeholder="e.g. ESP-AV-109"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300">Gear Name *</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. BenQ Wireless Presentation Kit"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Classroom AV">Classroom AV</option>
                    <option value="Dev Hardware">Dev Hardware</option>
                    <option value="STEM Tools">STEM Tools</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300">Home Shelf / Room *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    placeholder="e.g. Lab Bench 3"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300">Notes / Accessories</label>
                <textarea
                  rows="2"
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                  placeholder="Cables in pouch, charger included, or setup tips..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500 resize-none"
                ></textarea>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:bg-zinc-900 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AssetLabelModal item={labelItem} onClose={() => setLabelItem(null)} />

      <QuickTagScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        inventory={inventory}
        onStartCheckout={(item) => setSelectedItem(item)}
        onQuickReturn={handleReturnClick}
        onInspectHolder={onInspectHolder}
      />
    </div>
  );
}

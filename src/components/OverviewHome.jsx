import React from 'react';
import {
  Boxes,
  CheckCircle2,
  FileText,
  CalendarClock,
  Cpu,
  FolderOpen,
  Calendar,
  Activity,
  ArrowUpRight,
  Clock,
  Wrench,
  AlertCircle,
  Search,
  RotateCcw,
  Users
} from 'lucide-react';

function isOverdueDate(returnDate) {
  if (!returnDate || !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) return false;
  const today = new Date().toISOString().split('T')[0];
  return returnDate < today;
}

export default function OverviewHome({
  inventory,
  documents,
  reservations,
  activities,
  onNavigate,
  onOpenActivity,
  onInspectHolder,
  onQuickReturn,
  onOpenSearch
}) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? 'Good morning, Team.'
      : hour < 18
      ? 'Good afternoon, Team.'
      : 'Good evening, Team.';

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const today = now.toISOString().split('T')[0];
  const totalCount = inventory.length;
  const availableCount = inventory.filter((item) => item.status === 'Available').length;
  const inUseItems = inventory.filter((item) => item.status === 'In Use');
  const overdueItems = inUseItems.filter((item) => isOverdueDate(item.returnDate));
  const repairItems = inventory.filter((item) => item.status === 'Maintenance');
  const todayBookings = reservations.filter((res) => res.date === today);

  const availPct = totalCount ? Math.round((availableCount / totalCount) * 100) : 0;
  const inUsePct = totalCount ? Math.round((inUseItems.length / totalCount) * 100) : 0;
  const repairPct = totalCount ? Math.max(0, 100 - availPct - inUsePct) : 0;

  const needsAttention =
    overdueItems.length > 0 || repairItems.length > 0 || todayBookings.length > 0;

  return (
    <div className="space-y-6">
      {needsAttention && (
        <div className="hub-panel border border-zinc-800 rounded-xl p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-zinc-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Needs Attention</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
            {overdueItems.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('gear', 'In Use')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/60 hover:bg-rose-950 border border-rose-800/70 text-rose-300 transition-colors cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {overdueItems.length} overdue {overdueItems.length === 1 ? 'item' : 'items'}
                </span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}

            {todayBookings.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-950/60 hover:bg-sky-950 border border-sky-800/70 text-sky-300 transition-colors cursor-pointer"
              >
                <CalendarClock className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {todayBookings.length} {todayBookings.length === 1 ? 'booking' : 'bookings'} today
                </span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}

            {repairItems.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('gear', 'Maintenance')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/50 hover:bg-amber-950/80 border border-amber-800/60 text-amber-300 transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>
                  {repairItems.length} in repair
                </span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="hub-card border border-zinc-800/90 rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                {formattedDate}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                HUB ONLINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50">
              {greeting}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Your lab gear, bookings, and project files in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="h-9 px-3.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <span>Quick Lookup</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('gear', 'Available')}
              className="h-9 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Check Out Gear</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono uppercase tracking-wider text-zinc-400 text-[11px]">
              Equipment Readiness
            </span>
            <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-xs bg-emerald-500"></span>
                Available ({availableCount})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-xs bg-amber-500"></span>
                In Use ({inUseItems.length})
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-xs bg-rose-500"></span>
                In Repair ({repairItems.length})
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden flex gap-0.5 p-0.5 border border-zinc-800/80">
            {availableCount > 0 && (
              <div
                style={{ width: `${availPct}%` }}
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
              />
            )}
            {inUseItems.length > 0 && (
              <div
                style={{ width: `${inUsePct}%` }}
                className="h-full bg-amber-500 transition-all duration-300"
              />
            )}
            {repairItems.length > 0 && (
              <div
                style={{ width: `${repairPct}%` }}
                className="h-full bg-rose-500 rounded-r-full transition-all duration-300"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onNavigate('gear', 'ALL')}
            className="group relative overflow-hidden text-left bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <span className="absolute inset-x-0 top-0 h-[2px] bg-zinc-700/60 group-hover:bg-zinc-400 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Boxes className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-200 transition-colors" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-50 font-mono tabular-nums tracking-tight">
                {inventory.length}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Total Equipment
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('gear', 'Available')}
            className="group relative overflow-hidden text-left bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-emerald-800/70 rounded-xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <span className="absolute inset-x-0 top-0 h-[2px] bg-emerald-500/70 group-hover:bg-emerald-400 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-300 transition-colors" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-50 font-mono tabular-nums tracking-tight">
                {availableCount}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Available on Shelf
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('docs')}
            className="group relative overflow-hidden text-left bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-amber-800/70 rounded-xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <span className="absolute inset-x-0 top-0 h-[2px] bg-amber-500/70 group-hover:bg-amber-400 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400">
                <FileText className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-300 transition-colors" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-50 font-mono tabular-nums tracking-tight">
                {documents.length}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Guides & Project Files
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('schedule')}
            className="group relative overflow-hidden text-left bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-sky-800/70 rounded-xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <span className="absolute inset-x-0 top-0 h-[2px] bg-sky-500/70 group-hover:bg-sky-400 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
                <CalendarClock className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-sky-300 transition-colors" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-50 font-mono tabular-nums tracking-tight">
                {reservations.length}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Upcoming Bookings
              </div>
            </div>
          </button>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Quick Access
            </span>
            <button
              type="button"
              onClick={() => onNavigate('team')}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>View Team Roster →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('gear', 'ALL')}
              className="group bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-3.5 text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-amber-700/60 flex items-center justify-center shrink-0 transition-colors">
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-zinc-100 flex items-center justify-between">
                  <span>Gear & Checkouts</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  Sign out gear, print tags, or log repairs
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('docs')}
              className="group bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-3.5 text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 flex items-center justify-center shrink-0 transition-colors">
                <FolderOpen className="w-4 h-4 text-zinc-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-zinc-100 flex items-center justify-between">
                  <span>Document Vault</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  Browse folders, edit notes, or drop files
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('schedule')}
              className="group bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-3.5 text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-sky-700/60 flex items-center justify-center shrink-0 transition-colors">
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-zinc-100 flex items-center justify-between">
                  <span>Booking Schedule</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  Reserve classroom or lab gear ahead
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="hub-panel border border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Currently Checked Out</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('gear', 'In Use')}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Open Gear →
            </button>
          </div>

          {inUseItems.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 bg-zinc-950/70 border border-zinc-800/70 rounded-lg">
              All equipment is currently returned and on the shelf.
            </div>
          ) : (
            <div className="space-y-2.5">
              {inUseItems.slice(0, 3).map((item) => {
                const overdue = isOverdueDate(item.returnDate);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700/80 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {item.id}
                        </span>
                        <span className="font-medium text-zinc-100 truncate">{item.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-1 flex items-center gap-1.5">
                        <span>With:</span>
                        <button
                          type="button"
                          onClick={() => onInspectHolder(item.holder)}
                          className="text-zinc-300 hover:text-white underline decoration-zinc-600 underline-offset-2 cursor-pointer truncate"
                        >
                          {item.holder}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono tabular-nums text-zinc-500">
                          Due {item.returnDate || 'Open'}
                        </span>
                        {overdue && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-rose-300 font-mono text-[9px] uppercase">
                            Overdue
                          </span>
                        )}
                      </div>
                      {onQuickReturn && (
                        <button
                          type="button"
                          onClick={() => onQuickReturn(item.id)}
                          title="Mark Returned"
                          className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hub-panel border border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span>Recent Updates</span>
            </span>
            <button
              type="button"
              onClick={onOpenActivity}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Full Log →
            </button>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 3).map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0"></span>
                  <span className="text-zinc-300 leading-snug">{act.text}</span>
                </div>
                <span className="font-mono tabular-nums text-[10px] text-zinc-500 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

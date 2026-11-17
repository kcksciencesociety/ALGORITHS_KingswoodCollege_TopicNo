import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Mail,
  Phone,
  Cpu,
  CalendarClock,
  FileText,
  ArrowUpRight,
  Users
} from 'lucide-react';
import { staffDirectory } from '../data/staffData';

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function matchesPerson(personName, fieldText) {
  if (!personName || !fieldText) return false;
  const cleanField = fieldText.split('(')[0].trim().toLowerCase();
  const cleanPerson = personName.trim().toLowerCase();
  return (
    fieldText.toLowerCase().includes(cleanPerson) ||
    cleanPerson.includes(cleanField)
  );
}

export default function TeamRoster({
  inventory = [],
  documents = [],
  reservations = [],
  onInspectHolder
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = [
    'ALL',
    ...Array.from(
      new Set(staffDirectory.map((s) => s.department).filter(Boolean))
    )
  ];

  const filteredStaff = staffDirectory.filter((person) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      person.name.toLowerCase().includes(q) ||
      (person.role && person.role.toLowerCase().includes(q)) ||
      (person.department && person.department.toLowerCase().includes(q)) ||
      (person.station && person.station.toLowerCase().includes(q)) ||
      (person.id && person.id.toLowerCase().includes(q));

    const matchesDept =
      selectedDept === 'ALL' || person.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const unlistedHolders = Array.from(
    new Set(
      inventory
        .filter((item) => item.status === 'In Use' && item.holder)
        .map((item) => item.holder)
        .filter(
          (holder) =>
            !staffDirectory.some((staff) => matchesPerson(staff.name, holder))
        )
    )
  );

  return (
    <div className="space-y-5">
      <div className="hub-panel border border-zinc-800/90 p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team by name, role, or lab desk..."
            className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`h-9 px-3 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap border ${
                selectedDept === dept
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-medium'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {dept === 'ALL' ? 'All Teams' : dept}
            </button>
          ))}
        </div>
      </div>

      <div key={selectedDept} className="animate-filter-swap">
      {filteredStaff.length === 0 ? (
        <div className="hub-panel border border-zinc-800 rounded-xl py-14 text-center text-zinc-500 font-mono text-xs">
          No matching team members found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStaff.map((person) => {
            const gearCount = inventory.filter(
              (item) =>
                item.status === 'In Use' && matchesPerson(person.name, item.holder)
            ).length;

            const bookingCount = reservations.filter((res) =>
              matchesPerson(person.name, res.reservedBy)
            ).length;

            const docCount = documents.filter((doc) =>
              matchesPerson(person.name, doc.author)
            ).length;

            return (
              <div
                key={person.id}
                onClick={() => onInspectHolder(person.name)}
                className="group hub-card border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center font-mono text-xs font-semibold text-zinc-200 shrink-0 transition-colors">
                        {getInitials(person.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-zinc-100 truncate group-hover:text-white">
                          {person.name}
                        </h4>
                        <div className="text-xs text-zinc-400 truncate">
                          {person.role}
                        </div>
                      </div>
                    </div>

                    <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-md font-mono text-[10px] text-zinc-500 shrink-0">
                      {person.id}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 font-mono text-[11px] text-zinc-400">
                    {person.station && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{person.station}</span>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                    {person.extension && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{person.extension}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                        gearCount > 0
                          ? 'bg-amber-950/50 border-amber-800/50 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <Cpu className="w-3 h-3" />
                      <span>{gearCount} out</span>
                    </span>

                    {bookingCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/50 border border-sky-800/50 text-sky-300">
                        <CalendarClock className="w-3 h-3" />
                        <span>{bookingCount} booked</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400">
                      <FileText className="w-3 h-3" />
                      <span>{docCount}</span>
                    </span>
                  </div>

                  <span className="text-zinc-500 group-hover:text-zinc-200 inline-flex items-center gap-0.5 transition-colors shrink-0">
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {unlistedHolders.length > 0 && (
        <div className="hub-panel border border-zinc-800 rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span>Other Active Borrowers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unlistedHolders.map((holder) => (
              <button
                key={holder}
                type="button"
                onClick={() => onInspectHolder(holder)}
                className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
              >
                {holder}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

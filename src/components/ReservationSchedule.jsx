import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  X,
  ArrowUpRight,
  Trash2,
  MapPin,
  User,
  AlertCircle
} from 'lucide-react';
import { staffDirectory } from '../data/staffData';

export default function ReservationSchedule({
  inventory,
  reservations,
  setReservations,
  onFulfillReservation,
  onLogActivity,
  onInspectHolder,
  preselectedGearId,
  onClearPreselectedGear
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(Boolean(preselectedGearId));
  const [selectedGearId, setSelectedGearId] = useState(preselectedGearId || (inventory[0]?.id || ''));
  const [reservedBy, setReservedBy] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('09:00 - 12:00 (Morning)');
  const [purpose, setPurpose] = useState('');
  const [conflictError, setConflictError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (preselectedGearId) {
      setSelectedGearId(preselectedGearId);
      setConflictError('');
      setShowBookingModal(true);
    }
  }, [preselectedGearId]);

  const closeModal = () => {
    setShowBookingModal(false);
    setConflictError('');
    if (onClearPreselectedGear) {
      onClearPreselectedGear();
    }
  };

  const openModal = (gearId = '') => {
    setSelectedGearId(gearId || (inventory[0]?.id || ''));
    setConflictError('');
    setShowBookingModal(true);
  };

  const sortedReservations = [...reservations].sort((a, b) => a.date.localeCompare(b.date));

  const filteredReservations = sortedReservations.filter((res) => {
    const gear = inventory.find((i) => i.id === res.gearId);
    const gearName = gear ? gear.name.toLowerCase() : '';
    const q = searchTerm.toLowerCase();
    return (
      res.gearId.toLowerCase().includes(q) ||
      gearName.includes(q) ||
      res.reservedBy.toLowerCase().includes(q) ||
      res.purpose.toLowerCase().includes(q) ||
      res.date.includes(q)
    );
  });

  const handleCreateReservation = (e) => {
    e.preventDefault();
    if (isSubmitting || !selectedGearId || !reservedBy.trim() || !bookingDate) return;

    const targetGear = inventory.find((i) => i.id === selectedGearId);
    if (!targetGear) return;

    if (targetGear.status === 'Maintenance') {
      setConflictError(`${targetGear.id} is currently in repair and cannot be booked until fixed.`);
      return;
    }

    const hasConflict = reservations.some(
      (r) => r.gearId === selectedGearId && r.date === bookingDate && r.timeSlot === timeSlot
    );

    if (hasConflict) {
      setConflictError(`${targetGear.id} is already booked on ${bookingDate} during ${timeSlot}.`);
      return;
    }

    setIsSubmitting(true);

    const newBooking = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      gearId: selectedGearId,
      reservedBy: reservedBy.trim(),
      date: bookingDate,
      timeSlot,
      purpose: purpose.trim() || 'Standard Lab / Classroom Session'
    };

    onLogActivity(
      `Booked "${targetGear.name}" (${targetGear.id}) for ${newBooking.reservedBy} on ${newBooking.date}`
    );

    setReservations((prev) => [newBooking, ...prev]);
    setReservedBy('');
    setPurpose('');
    setConflictError('');
    setIsSubmitting(false);
    closeModal();
  };

  const handleCancelReservation = (res) => {
    const gear = inventory.find((i) => i.id === res.gearId);
    onLogActivity(
      `Cancelled booking ${res.id} for ${gear ? gear.name : res.gearId} (${res.date})`
    );
    setReservations((prev) => prev.filter((item) => item.id !== res.id));
  };

  return (
    <div className="space-y-5">
      <div className="hub-panel border border-zinc-800/90 p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter bookings by tag, team member, date, or room..."
            className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm font-mono"
          />
        </div>

        <button
          onClick={() => openModal()}
          className="h-9 flex items-center justify-center gap-1.5 px-3.5 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="hub-panel border border-zinc-800 rounded-xl py-14 text-center text-zinc-500 font-mono text-xs">
          No upcoming bookings found. Click "New Booking" to reserve gear ahead of time.
        </div>
      ) : (
        <div className="hub-panel border border-zinc-800/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Booked Gear</th>
                  <th className="py-3.5 px-4">Person & Room</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredReservations.map((res) => {
                  const gear = inventory.find((i) => i.id === res.gearId);
                  const canDispatchNow = gear && gear.status === 'Available';

                  return (
                    <tr key={res.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                        <span className="bg-sky-950/50 border border-sky-800/50 text-sky-300 px-2.5 py-1 rounded-md text-[11px]">
                          {res.id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-100 font-mono tabular-nums text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          <span>{res.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{res.timeSlot}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-zinc-300">
                            {res.gearId}
                          </span>
                          <span className="font-medium text-zinc-100">
                            {gear ? gear.name : 'Unknown Asset'}
                          </span>
                        </div>
                        {gear && (
                          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                            Current state:{' '}
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
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onInspectHolder(res.reservedBy)}
                          className="text-zinc-200 hover:text-white underline decoration-zinc-600 hover:decoration-zinc-300 underline-offset-2 font-medium text-xs cursor-pointer flex items-center gap-1"
                        >
                          <User className="w-3 h-3 text-zinc-500" />
                          <span>{res.reservedBy}</span>
                        </button>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span>{res.purpose}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onFulfillReservation(res)}
                            disabled={!canDispatchNow}
                            title={
                              canDispatchNow
                                ? 'Check out this gear now'
                                : 'Gear must be Available to check out now'
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-950 hover:bg-white rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <span>Check Out Now</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCancelReservation(res)}
                            title="Cancel Booking"
                            className="p-1.5 bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-800/60 rounded-md text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-backdrop-in">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl h-full animate-drawer-in">
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">
                    Book Gear Ahead
                  </span>
                  <h3 className="text-base font-semibold text-zinc-100 mt-0.5">
                    Reserve Time Slot
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {conflictError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{conflictError}</span>
                </div>
              )}

              <form id="booking-form" onSubmit={handleCreateReservation} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Gear to Book *</label>
                  <select
                    required
                    value={selectedGearId}
                    onChange={(e) => {
                      setSelectedGearId(e.target.value);
                      setConflictError('');
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 text-xs font-mono"
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.id}] {item.name} ({item.status === 'Maintenance' ? 'In Repair' : item.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Booked For *</label>
                  <input
                    type="text"
                    required
                    list="booking-staff-roster"
                    value={reservedBy}
                    onChange={(e) => setReservedBy(e.target.value)}
                    placeholder="Pick a team member or type a name..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans"
                  />
                  <datalist id="booking-staff-roster">
                    {staffDirectory.map((staff) => (
                      <option key={staff.id} value={`${staff.name} (${staff.role})`} />
                    ))}
                  </datalist>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {staffDirectory.map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => setReservedBy(`${staff.name} (${staff.role})`)}
                        className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {staff.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-medium">Date *</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => {
                        setBookingDate(e.target.value);
                        setConflictError('');
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-medium">Time Block *</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => {
                        setTimeSlot(e.target.value);
                        setConflictError('');
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono text-xs"
                    >
                      <option value="09:00 - 12:00 (Morning)">09:00 - 12:00 (Morning)</option>
                      <option value="13:00 - 16:30 (Afternoon)">13:00 - 16:30 (Afternoon)</option>
                      <option value="09:00 - 17:00 (Full Day)">09:00 - 17:00 (Full Day)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Room / Session Note</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Classroom 3B Sensor Workshop"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs"
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="booking-form"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

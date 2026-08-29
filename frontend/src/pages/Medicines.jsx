import React, { useState } from 'react';
import { Plus, Trash2, Pill, Clock, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function Medicines({ medicines, onCreateMedicine, onDeleteMedicine }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('20:00');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dosage) return;

    const times = [time1];
    if (frequency === 'Twice daily' || frequency === 'Three times daily') {
      times.push(time2);
    }

    onCreateMedicine({
      name,
      dosage,
      frequency,
      scheduled_times: times,
      start_date: startDate,
      end_date: endDate || null,
      notes: notes || null
    });

    setName('');
    setDosage('');
    setNotes('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#38BDF8]" />
            Prescribed Medicines Management
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Register prescribed medications, dosages, and daily reminder schedules.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'CANCEL' : 'ADD NEW MEDICINE'}
        </button>
      </div>

      {/* SAFETY NOTICE */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400 text-xs font-mono">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>SAFETY NOTICE:</strong> MedIadhere AI does NOT provide dosage recommendations. Enter exact dosage instructions prescribed by your healthcare provider.
        </span>
      </div>

      {/* ADD MEDICINE FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border border-[#38BDF8]/30">
          <h3 className="text-lg font-bold text-white mb-4">Register Prescribed Medication</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lisinopril"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-[#38BDF8] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Prescribed Dosage Text *</label>
              <input
                type="text"
                required
                placeholder="e.g. 10 mg or 1 tablet"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-[#38BDF8] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-[#38BDF8] outline-none"
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As needed">As needed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Scheduled Time 1</label>
              <input
                type="time"
                value={time1}
                onChange={(e) => setTime1(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-[#38BDF8] outline-none"
              />
            </div>

            {frequency.includes('Twice') && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Scheduled Time 2</label>
                <input
                  type="time"
                  value={time2}
                  onChange={(e) => setTime2(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-[#38BDF8] outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-[#38BDF8] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Doctor's Notes & Instructions</label>
            <textarea
              rows="2"
              placeholder="e.g. Take with morning meal and water."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-[#38BDF8] outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              SAVE MEDICINE
            </button>
          </div>
        </form>
      )}

      {/* MEDICINES LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicines?.map((m) => (
          <div key={m.id} className="glass-panel p-5 rounded-2xl space-y-4 relative group border border-slate-800 hover:border-[#38BDF8]/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{m.name}</h3>
                  <span className="text-xs font-mono text-[#38BDF8]">{m.dosage}</span>
                </div>
              </div>

              <button
                onClick={() => onDeleteMedicine(m.id)}
                className="p-2 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                title="Delete Medicine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Frequency:</span>
                <span className="text-slate-200">{m.frequency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="text-slate-200">{m.start_date}</span>
              </div>
              {m.notes && (
                <div className="pt-2 border-t border-slate-800 text-slate-400 font-sans italic">
                  "{m.notes}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

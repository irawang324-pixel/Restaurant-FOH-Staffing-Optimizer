import React, { useState } from 'react';
import { SalesRecord } from './types';

interface DataEntryProps {
  onAdd: (record: SalesRecord) => void;
}

export const DataEntry: React.FC<DataEntryProps> = ({ onAdd }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sales: 720 as number | '',
    fohStaff: 1 as number | '',
    covers: 40 as number | '',
    reservations: 20 as number | '',
    shift: 'Lunch' as 'Lunch' | 'Dinner'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.sales === '' || form.fohStaff === '' || form.covers === '' || form.reservations === '') {
      alert("Please fill in all fields.");
      return;
    }
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...form,
      sales: form.sales,
      fohStaff: form.fohStaff,
      covers: form.covers,
      reservations: form.reservations,
      walkins: form.covers - form.reservations
    });
    
    setForm(prev => ({
      ...prev,
      sales: prev.shift === 'Lunch' ? 720 : 2200,
      covers: prev.shift === 'Lunch' ? 40 : 100,
      reservations: prev.shift === 'Lunch' ? 20 : 60
    }));
  };

  const handleNumChange = (field: string, val: string) => {
    setForm(prev => ({
      ...prev,
      [field]: val === '' ? '' : Number(val)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Log Service Actuals</h3>
        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded uppercase">Entry Mode</span>
      </div>
      <div className="space-y-5 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Shift Selection</label>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                type="button"
                onClick={() => setForm({...form, shift: 'Lunch', sales: 720, fohStaff: 1, covers: 40, reservations: 20})}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${form.shift === 'Lunch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >Lunch</button>
              <button 
                type="button"
                onClick={() => setForm({...form, shift: 'Dinner', sales: 2200, fohStaff: 2, covers: 100, reservations: 60})}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${form.shift === 'Dinner' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
              >Dinner</button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Service Date</label>
            <input 
                type="date" 
                className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                value={form.date} 
                onChange={e => setForm({...form, date: e.target.value})} 
              />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">FOH Staff</label>
            <input type="number" className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              value={form.fohStaff} onChange={e => handleNumChange('fohStaff', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Bookings</label>
            <input type="number" className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              value={form.reservations} onChange={e => handleNumChange('reservations', e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Cov.</label>
            <input type="number" className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              value={form.covers} onChange={e => handleNumChange('covers', e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Net Sales</label>
            <input type="number" className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              value={form.sales} onChange={e => handleNumChange('sales', e.target.value)} />
          </div>
        </div>
      </div>
      <button type="submit" className={`w-full py-5 mt-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${form.shift === 'Lunch' ? 'bg-indigo-600' : 'bg-purple-600'} text-white`}>
        Save {form.shift} Data
      </button>
    </form>
  );
};

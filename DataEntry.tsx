
import React, { useState } from 'react';
import { SalesRecord } from '../types';

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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100" lang="en">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-slate-800">Log Daily Actuals</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-500 uppercase">Input Mode</span>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Shift Type</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setForm({...form, shift: 'Lunch', sales: 720, fohStaff: 1, covers: 40, reservations: 20})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.shift === 'Lunch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >Lunch (Morning)</button>
              <button 
                type="button"
                onClick={() => setForm({...form, shift: 'Dinner', sales: 2200, fohStaff: 2, covers: 100, reservations: 60})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.shift === 'Dinner' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
              >Dinner (Evening)</button>
            </div>
          </div>
          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Service Date</label>
            <div className="relative group/input">
              <input 
                type="text" 
                placeholder="YYYY-MM-DD"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-700 pr-10" 
                value={form.date} 
                onChange={e => setForm({...form, date: e.target.value})} 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/input:text-slate-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="date"
                className="absolute right-2 top-0 bottom-0 w-8 opacity-0 cursor-pointer"
                title="Select date"
                onChange={(e) => setForm({...form, date: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Staff Count</label>
            <input type="number" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all font-bold" 
              value={form.fohStaff} onChange={e => handleNumChange('fohStaff', e.target.value)}
              onFocus={(e) => e.target.select()} />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Bookings</label>
            <input type="number" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black text-blue-600" 
              value={form.reservations} onChange={e => handleNumChange('reservations', e.target.value)}
              onFocus={(e) => e.target.select()} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Actual Covers</label>
            <input type="number" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all font-black" 
              value={form.covers} onChange={e => handleNumChange('covers', e.target.value)}
              onFocus={(e) => e.target.select()} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Net Sales (£)</label>
            <input type="number" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-emerald-600" 
              value={form.sales} onChange={e => handleNumChange('sales', e.target.value)}
              onFocus={(e) => e.target.select()} />
          </div>
        </div>
      </div>
      
      <button type="submit" className={`w-full py-4 rounded-xl font-black text-sm shadow-lg transition-all active:scale-95 ${form.shift === 'Lunch' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}>
        Save {form.shift} Records
      </button>
    </form>
  );
};

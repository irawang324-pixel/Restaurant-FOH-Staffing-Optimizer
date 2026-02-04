
import React, { useState } from 'react';
import { SalesRecord } from './types';
import { INITIAL_DATA } from './constants';
import { StatsOverview } from './components/StatsOverview';
import { Charts } from './components/Charts';
import { StaffPredictor } from './components/StaffPredictor';
import { AIAdvisor } from './components/AIAdvisor';
import { DataEntry } from './components/DataEntry';

function App() {
  const [data, setData] = useState<SalesRecord[]>(INITIAL_DATA);
  const [location, setLocation] = useState('London Brixton');
  const [targetDate, setTargetDate] = useState('2025-02-14'); 
  const [totalDailyCovers, setTotalDailyCovers] = useState(118); 
  const [aiFootfallMultiplier, setAiFootfallMultiplier] = useState(1.0);

  const addRecord = (record: SalesRecord) => {
    setData([record, ...data]);
  };

  const handleExport = () => {
    alert("Operational Performance Report (PDF) exported successfully.");
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 selection:bg-indigo-100 text-slate-900" lang="en">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-2xl border-b border-white/5 h-20 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">AuraOps <span className="text-indigo-400 italic">Intelligence</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Resource Optimization Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Venue Location</span>
                <span className="text-xs font-bold text-indigo-300">{location}</span>
             </div>
             <button 
               onClick={handleExport}
               className="bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95"
             >
               Export Report
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-9">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Staffing Predictor</h2>
                <div className="flex items-center gap-4">
                   {aiFootfallMultiplier !== 1.0 && (
                     <div className="bg-indigo-600 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-bounce shadow-lg shadow-indigo-500/20">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        <span className="text-[9px] font-black uppercase tracking-widest">AI Adjusted: {aiFootfallMultiplier > 1 ? '+' : '-'}{Math.abs(Math.round((aiFootfallMultiplier - 1) * 100))}% Load</span>
                     </div>
                   )}
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Model: Gemini 3.0 Pro</span>
                   </div>
                </div>
             </div>
             <StaffPredictor 
               data={data} 
               targetDate={targetDate} 
               onTotalCoversChange={setTotalDailyCovers} 
               aiMultiplier={aiFootfallMultiplier}
             />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block border-b border-slate-100 pb-2">Operational Context</label>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Service Target Date</label>
                  <div className="relative group/input">
                    <input 
                      type="text" 
                      value={targetDate} 
                      placeholder="YYYY-MM-DD"
                      onChange={(e) => setTargetDate(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/input:text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input 
                      type="date"
                      className="absolute right-2 top-0 bottom-0 w-10 opacity-0 cursor-pointer"
                      title="Select date from calendar"
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Venue Address/Neighborhood</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g. London Brixton or Taipei Xinyi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] shadow-xl text-white">
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Strategic Tip</h3>
               <p className="text-sm font-medium leading-relaxed italic opacity-90">
                 "Staffing based on external signals like neighborhood busyness can reduce labor waste by 12% on low-traffic days."
               </p>
            </div>
          </div>
        </div>

        <section className="mb-16">
          <AIAdvisor 
            history={data} 
            location={location} 
            targetDate={targetDate} 
            currentBookings={totalDailyCovers} 
            onAIResult={(result) => setAiFootfallMultiplier(result.footfallIndex)}
          />
        </section>

        <div className="border-t border-slate-200 pt-16 mb-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Operational Analytics</h2>
              <p className="text-slate-500 font-medium">Correlation matrix: Staffing vs. Revenue Yield.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data Points</span>
              <span className="text-xl font-black text-indigo-600 tracking-tight">{data.length} HISTORICAL SHIFTS</span>
            </div>
          </div>
          
          <StatsOverview data={data} />
          <Charts data={data} targetDate={targetDate} />
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <DataEntry onAdd={addRecord} />
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-10 py-8 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-black text-slate-900 tracking-tight">Shift Actuals Log</h3>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chronological Order</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Date</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">FOH</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Covers</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ASPH</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {data.slice(0, 10).map((record) => {
                      const dayName = getDayName(record.date);
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-10 py-6 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{record.date}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                {dayName}
                              </span>
                              <span className={`text-[9px] font-black uppercase mt-1 ${record.shift === 'Lunch' ? 'text-indigo-500' : 'text-purple-500'}`}>
                                {record.shift} Shift
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-6 whitespace-nowrap text-sm font-black text-slate-700">{record.fohStaff}</td>
                          <td className="px-10 py-6 whitespace-nowrap text-sm font-bold text-slate-500">{record.covers}</td>
                          <td className="px-10 py-6 whitespace-nowrap text-sm font-black text-emerald-600">£{record.sales.toLocaleString()}</td>
                          <td className="px-10 py-6 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100">
                              £{(record.sales / record.covers).toFixed(1)}/cv
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 lg:px-8 border-t border-slate-200 pt-12 pb-24 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-40">
             <div className="bg-slate-900 text-white p-2 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <span className="font-black text-slate-900 tracking-tighter">AuraOps OS</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
            Strategic Intelligence Platform • v3.1.2
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

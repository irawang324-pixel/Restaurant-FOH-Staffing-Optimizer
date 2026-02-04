import React, { useState } from 'react';
import { SalesRecord } from './types';
import { INITIAL_DATA } from './constants';
import { StatsOverview } from './StatsOverview';
import { Charts } from './Charts';
import { StaffPredictor } from './StaffPredictor';
import { AIAdvisor } from './AIAdvisor';
import { DataEntry } from './DataEntry';

function App() {
  const [data, setData] = useState<SalesRecord[]>(INITIAL_DATA);
  const [location, setLocation] = useState('台北市信義區');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]); 
  const [totalDailyCovers, setTotalDailyCovers] = useState(118); 
  const [aiMultiplier, setAiMultiplier] = useState(1.0);

  const addRecord = (record: SalesRecord) => {
    setData([record, ...data]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-morphism border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">AuraOps <span className="text-indigo-600 italic">Intelligence</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">FOH Staffing Decision Engine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目前店址</span>
              <span className="text-sm font-bold text-slate-700">{location}</span>
            </div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
              產生營運週報
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-9">
            <StaffPredictor 
              data={data} 
              targetDate={targetDate} 
              onTotalCoversChange={setTotalDailyCovers} 
              aiMultiplier={aiMultiplier} 
            />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">預測設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block">預測日期</label>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block">店鋪區域</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="如：台北市信義區" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
               <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">AI 信心指數</h4>
               <p className="text-4xl font-black">{(aiMultiplier * 100).toFixed(0)}<span className="text-xl font-medium">%</span></p>
               <p className="text-[10px] font-medium mt-3 opacity-60 leading-relaxed">基於環境感知、交通壓力與人流相關性分析所得之加權數值。</p>
            </div>
          </div>
        </div>

        {/* AI Advisor - Full Width Section */}
        <AIAdvisor 
          history={data} 
          location={location} 
          targetDate={targetDate} 
          currentBookings={totalDailyCovers} 
          onAIResult={(res) => setAiMultiplier(res.footfallIndex)} 
        />

        {/* Operational Deep Dive */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-3xl font-black tracking-tighter text-slate-900">核心 <span className="text-slate-400">營運數據分析</span></h3>
            <div className="h-px flex-grow bg-slate-200"></div>
          </div>
          
          <StatsOverview data={data} />
          <Charts data={data} targetDate={targetDate} />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            <div className="lg:col-span-4 h-full">
              <DataEntry onAdd={addRecord} />
            </div>
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
               <div className="px-8 py-6 bg-slate-50/50 border-b flex justify-between items-center">
                 <h4 className="font-black text-sm uppercase tracking-widest text-slate-700">歷史日誌 (Historical Logs)</h4>
                 <span className="text-[10px] font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400">{data.length} Shifts Recorded</span>
               </div>
               <div className="flex-grow overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] uppercase text-slate-400 border-b bg-slate-50/30">
                       <th className="px-8 py-5">服務日期</th>
                       <th className="px-8 py-5">餐期</th>
                       <th className="px-8 py-5">外場配置</th>
                       <th className="px-8 py-5">來客數 (Cov)</th>
                       <th className="px-8 py-5">總營收</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {data.map(r => (
                       <tr key={r.id} className="text-sm font-bold hover:bg-slate-50/80 transition-colors group">
                         <td className="px-8 py-4 text-slate-500">{r.date}</td>
                         <td className="px-8 py-4"><span className={`px-2 py-0.5 rounded-md text-[10px] ${r.shift === 'Lunch' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>{r.shift}</span></td>
                         <td className="px-8 py-4 text-slate-700">{r.fohStaff} <span className="text-[10px] font-medium text-slate-400 ml-1">PAX</span></td>
                         <td className="px-8 py-4 text-slate-700">{r.covers}</td>
                         <td className="px-8 py-4 text-emerald-600 font-black">£{r.sales.toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-24 py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by AuraOps Tactical AI</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Documentation</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Support</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

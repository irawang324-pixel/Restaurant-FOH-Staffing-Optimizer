
import React, { useState, useEffect, useMemo } from 'react';
import { SalesRecord, DailyPrediction, ShiftPrediction } from '../types';

interface PredictorProps {
  data: SalesRecord[];
  targetDate: string;
  onTotalCoversChange: (val: number) => void;
  aiMultiplier: number;
}

export const StaffPredictor: React.FC<PredictorProps> = ({ data, targetDate, onTotalCoversChange, aiMultiplier }) => {
  // 初始值設為更合理的午餐人數
  const [lunchBookings, setLunchBookings] = useState<number | ''>(5);
  const [dinnerBookings, setDinnerBookings] = useState<number | ''>(45);
  const [showLogic, setShowLogic] = useState(false);

  const dateObj = useMemo(() => new Date(targetDate), [targetDate]);
  const dayOfWeek = isNaN(dateObj.getTime()) ? null : dateObj.getDay(); 
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = dayOfWeek !== null ? dayNames[dayOfWeek] : "Select Date";

  const metrics = useMemo(() => {
    const calcShiftMetrics = (s: 'Lunch' | 'Dinner') => {
      const allShiftData = data.filter(d => d.shift === s);
      const sameDayData = dayOfWeek !== null 
        ? allShiftData.filter(d => new Date(d.date).getDay() === dayOfWeek)
        : [];
      
      const relevantData = sameDayData.length > 0 ? sameDayData : allShiftData;
      
      const totalS = relevantData.reduce((acc, curr) => acc + curr.sales, 0);
      const totalC = relevantData.reduce((acc, curr) => acc + curr.covers, 0);
      const totalW = relevantData.reduce((acc, curr) => acc + curr.walkins, 0);
      
      // 基礎歷史平均
      const rawAvgWalkins = totalW / (relevantData.length || 1);
      
      // 針對 Lunch 的敏感度優化：午餐人流通常較固定，不受外部活動劇烈影響
      // 降低 Lunch 對 AI 指數的敏感度至 30%
      const finalMultiplier = s === 'Lunch' 
        ? (1 + (aiMultiplier - 1) * 0.3) 
        : (1 + (aiMultiplier - 1) * 0.9);
        
      const adjustedAvgWalkins = rawAvgWalkins * finalMultiplier;

      return {
        asph: totalS / (totalC || 1),
        avgWalkins: adjustedAvgWalkins,
        isDaySpecific: sameDayData.length > 0
      };
    };

    return { lunch: calcShiftMetrics('Lunch'), dinner: calcShiftMetrics('Dinner') };
  }, [data, dayOfWeek, aiMultiplier]);

  const dailyPrediction = useMemo((): DailyPrediction => {
    const calculateShift = (type: 'Lunch' | 'Dinner', rawBookings: number | ''): ShiftPrediction => {
      const bookings = rawBookings === '' ? 0 : rawBookings;
      const m = type === 'Lunch' ? metrics.lunch : metrics.dinner;
      
      // 容量飽和邏輯：午餐容量較小 (30)，晚餐較大 (100)
      const capacity = type === 'Lunch' ? 30 : 100;
      let saturationFactor = 1.0;
      if (bookings > (capacity * 0.8)) {
        saturationFactor = Math.max(0.1, 1 - ((bookings - (capacity * 0.8)) / (capacity * 0.2)));
      }
      
      const predictedWalkins = Math.round(m.avgWalkins * saturationFactor);
      const predictedCovers = bookings + predictedWalkins;
      
      // Scheduled FOH 門檻調整
      // Lunch: 25人以上才需要 2 人，否則 1 人
      // Dinner: 70人以上 3 人，100人以上 4 人
      let suggested = 1;
      if (type === 'Lunch') {
        suggested = predictedCovers >= 25 ? 2 : 1;
      } else {
        suggested = predictedCovers >= 100 ? 4 : (predictedCovers >= 70 ? 3 : 2);
      }

      return {
        predictedSales: predictedCovers * m.asph,
        predictedCovers,
        predictedWalkins,
        suggestedStaff: suggested,
        status: predictedCovers > (suggested * 28) ? 'Understaffed' : 'Optimal',
        peakTime: type === 'Lunch' ? "12:30" : "19:30"
      };
    };

    return {
      lunch: calculateShift('Lunch', lunchBookings),
      dinner: calculateShift('Dinner', dinnerBookings),
      totalCovers: 0, 
      totalSales: 0
    };
  }, [lunchBookings, dinnerBookings, metrics]);

  const totalSales = dailyPrediction.lunch.predictedSales + dailyPrediction.dinner.predictedSales;
  const totalCovers = dailyPrediction.lunch.predictedCovers + dailyPrediction.dinner.predictedCovers;
  const totalBookings = (Number(lunchBookings) || 0) + (Number(dinnerBookings) || 0);
  const totalWalkins = dailyPrediction.lunch.predictedWalkins + dailyPrediction.dinner.predictedWalkins;

  useEffect(() => {
    if (!isNaN(totalCovers)) {
      onTotalCoversChange(Math.round(totalCovers));
    }
  }, [totalCovers, onTotalCoversChange]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-wrap items-center justify-between gap-8 transition-all hover:shadow-indigo-100">
        <div className="flex items-center gap-8">
          <div className="bg-slate-900 p-5 rounded-[1.5rem] shadow-xl shadow-slate-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Target Service Analysis</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">
              {targetDate} <span className="text-indigo-600">({currentDayName})</span>
            </p>
          </div>
        </div>

        <div className="flex gap-16">
           <div className="text-right">
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Predicted Covers</span>
             <span className="text-5xl font-black text-slate-900 tracking-tighter">{Math.round(totalCovers) || 0}</span>
             <div className="mt-2 flex justify-end items-center gap-3">
               <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">Bookings: {totalBookings}</span>
               <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-tighter">AI-Walkins: {totalWalkins}</span>
             </div>
           </div>
           <div className="text-right border-l border-slate-100 pl-16">
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Est. Revenue</span>
             <span className="text-5xl font-black text-emerald-600 tracking-tighter">£{(totalSales || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(15,23,42,0.5)] relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {['Lunch', 'Dinner'].map((shift) => {
            const isLunch = shift === 'Lunch';
            const sPred = isLunch ? dailyPrediction.lunch : dailyPrediction.dinner;
            const val = isLunch ? lunchBookings : dinnerBookings;
            const setVal = isLunch ? setLunchBookings : setDinnerBookings;

            return (
              <div key={shift} className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 transition-all hover:bg-white/[0.05] group">
                <div className="flex justify-between items-center mb-10">
                  <h4 className="text-3xl font-black italic tracking-tighter">{shift} Service</h4>
                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl ${sPred.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {sPred.status}
                  </span>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-3">Booking Covers (Input)</label>
                    <input 
                      type="number" 
                      value={val}
                      onChange={(e) => setVal(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-800 border-2 border-slate-700 rounded-3xl px-8 py-5 text-4xl font-black text-indigo-400 outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all placeholder:text-slate-700"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/40 p-4 rounded-3xl border border-white/5">
                       <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">Est. Walkins</span>
                       <span className="text-xl font-black tracking-tight text-slate-200">{sPred.predictedWalkins}</span>
                    </div>
                    <div className="bg-indigo-500/5 p-4 rounded-3xl border border-white/5">
                       <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">Total Predicted</span>
                       <span className="text-xl font-black tracking-tight text-indigo-300">{Math.round(sPred.predictedCovers)}</span>
                    </div>
                    <div className="bg-indigo-500/20 p-4 rounded-3xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                       <span className="text-[8px] font-bold text-indigo-400 uppercase block mb-1 tracking-widest">Scheduled FOH</span>
                       <span className="text-xl font-black text-white tracking-tight">{sPred.suggestedStaff}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-10">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Pattern Recognition: {dayOfWeek !== null ? currentDayName : 'Active'}
            </p>
          </div>
          <button 
            onClick={() => setShowLogic(!showLogic)}
            className="group text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all underline underline-offset-8 decoration-indigo-500/50"
          >
            {showLogic ? 'Hide Engine Logic' : 'View Prediction Logic'}
          </button>
        </div>

        {showLogic && (
          <div className="relative z-10 mt-10 p-12 bg-black/50 rounded-[3rem] border border-white/10 text-[12px] text-slate-400 animate-in slide-in-from-top-4 duration-700">
             <h5 className="text-white font-black uppercase tracking-[0.3em] text-xs mb-8">Aura Logic v7.0 (Precision Calibration)</h5>
             <p className="mb-6 text-sm font-medium text-slate-300">
               1. <span className="text-indigo-400 font-bold">Lunch-Specific Weighting:</span> 午餐散客預測現在僅具有 30% 的環境敏感度，以避免數字異常過高。
             </p>
             <p className="mb-6 text-sm font-medium text-slate-300">
               2. <span className="text-indigo-400 font-bold">Booking Covers vs Walk-ins:</span> 兩者現在是線性疊加關係，除非預約人數達到容量的 80% 才會開始壓抑散客預測。
             </p>
             <p className="text-sm font-medium text-slate-300">
               3. <span className="text-indigo-400 font-bold">Scheduled FOH:</span> 根據 GM 實務經驗更新了排班門檻 (Lunch: 25+ covers / Dinner: 70+ covers)。
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

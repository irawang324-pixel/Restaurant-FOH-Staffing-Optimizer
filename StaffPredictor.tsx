import React, { useState, useEffect, useMemo } from 'react';
import { SalesRecord, DailyPrediction, ShiftPrediction } from './types';

interface PredictorProps {
  data: SalesRecord[];
  targetDate: string;
  onTotalCoversChange: (val: number) => void;
  aiMultiplier: number;
}

export const StaffPredictor: React.FC<PredictorProps> = ({ data, targetDate, onTotalCoversChange, aiMultiplier }) => {
  const [lunchBookings, setLunchBookings] = useState<number | ''>(12);
  const [dinnerBookings, setDinnerBookings] = useState<number | ''>(55);
  const [hourlyWage, setHourlyWage] = useState<number>(15);

  const dateObj = useMemo(() => new Date(targetDate), [targetDate]);
  const dayOfWeek = isNaN(dateObj.getTime()) ? null : dateObj.getDay(); 
  const dayNames = ["星期日 (Sunday)", "星期一 (Monday)", "星期二 (Tuesday)", "星期三 (Wednesday)", "星期四 (Thursday)", "星期五 (Friday)", "星期六 (Saturday)"];
  const currentDayName = dayOfWeek !== null ? dayNames[dayOfWeek] : "未選擇日期";

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
      
      const rawAvgWalkins = totalW / (relevantData.length || 1);
      const finalMultiplier = s === 'Lunch' ? (1 + (aiMultiplier - 1) * 0.4) : (1 + (aiMultiplier - 1) * 1.0);
      const adjustedAvgWalkins = rawAvgWalkins * finalMultiplier;

      return {
        asph: totalS / (totalC || 1),
        avgWalkins: adjustedAvgWalkins,
      };
    };
    return { lunch: calcShiftMetrics('Lunch'), dinner: calcShiftMetrics('Dinner') };
  }, [data, dayOfWeek, aiMultiplier]);

  const dailyPrediction = useMemo((): DailyPrediction => {
    const calculateShift = (type: 'Lunch' | 'Dinner', rawBookings: number | ''): ShiftPrediction => {
      const bookings = rawBookings === '' ? 0 : rawBookings;
      const m = type === 'Lunch' ? metrics.lunch : metrics.dinner;
      
      const predictedWalkins = Math.round(m.avgWalkins);
      const predictedCovers = bookings + predictedWalkins;
      
      let suggested = 1;
      const shiftHours = type === 'Lunch' ? 4 : 6;

      if (type === 'Lunch') {
        suggested = predictedCovers > 45 ? 3 : (predictedCovers > 22 ? 2 : 1);
      } else {
        suggested = predictedCovers > 110 ? 5 : (predictedCovers > 85 ? 4 : (predictedCovers > 55 ? 3 : 2));
      }

      const predictedSales = predictedCovers * m.asph;
      const estSPLH = predictedSales / (suggested * shiftHours);

      return {
        predictedSales,
        predictedCovers,
        predictedWalkins,
        suggestedStaff: suggested,
        status: estSPLH < 40 ? 'Surplus' : (estSPLH > 80 ? 'Understaffed' : 'Optimal'),
        peakTime: type === 'Lunch' ? "13:00" : "20:00",
        estSPLH
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
  const totalLaborHours = (dailyPrediction.lunch.suggestedStaff * 4) + (dailyPrediction.dinner.suggestedStaff * 6);
  const totalLaborCost = totalLaborHours * hourlyWage;
  const laborRatio = (totalLaborCost / (totalSales || 1)) * 100;

  useEffect(() => {
    onTotalCoversChange(Math.round(dailyPrediction.lunch.predictedCovers + dailyPrediction.dinner.predictedCovers));
  }, [dailyPrediction, onTotalCoversChange]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            預測目標日期
          </h3>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            {targetDate} <span className="text-indigo-600 ml-2">{currentDayName}</span>
          </p>
        </div>
        
        <div className="flex gap-12 relative z-10">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">預估單日營收</span>
            <span className="text-4xl font-black text-emerald-600 tracking-tighter">£{Math.round(totalSales).toLocaleString()}</span>
          </div>
          <div className="text-right border-l border-slate-100 pl-12">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">人力成本預估</span>
            <span className="text-4xl font-black text-rose-500 tracking-tighter">£{Math.round(totalLaborCost)}</span>
            <div className={`mt-2 flex items-center justify-end gap-1.5 font-bold ${laborRatio > 18 ? 'text-rose-600' : 'text-slate-400'}`}>
               <span className="text-[10px] uppercase">Labor Ratio:</span>
               <span className="text-xs">{laborRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['Lunch', 'Dinner'].map((shift) => {
          const isLunch = shift === 'Lunch';
          const pred = isLunch ? dailyPrediction.lunch : dailyPrediction.dinner;
          return (
            <div key={shift} className="bg-slate-900 rounded-[3rem] p-10 text-white border border-white/5 shadow-2xl relative group">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h4 className="text-2xl font-black tracking-tight mb-1">{isLunch ? '午餐' : '晚餐'} (Service)</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">高峰時段: {pred.peakTime}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${
                  pred.status === 'Optimal' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                  pred.status === 'Surplus' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    pred.status === 'Optimal' ? 'bg-emerald-400' : 
                    pred.status === 'Surplus' ? 'bg-amber-400' : 'bg-rose-400'
                  }`}></span>
                  {pred.status}
                </div>
              </div>

              <div className="space-y-8">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">現有訂位數 (Bookings)</label>
                  <input 
                    type="number" 
                    value={isLunch ? lunchBookings : dinnerBookings}
                    onChange={(e) => isLunch ? setLunchBookings(e.target.value === '' ? '' : Number(e.target.value)) : setDinnerBookings(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-3xl font-black text-indigo-400 outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all placeholder:text-slate-800"
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">預測散客數</p>
                    <p className="text-xl font-black">{pred.predictedWalkins}</p>
                  </div>
                  <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">建議人數</p>
                    <p className="text-xl font-black text-indigo-400">{pred.suggestedStaff} <span className="text-[10px] text-slate-500">PAX</span></p>
                  </div>
                  <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">預期 SPLH</p>
                    <p className="text-xl font-black text-emerald-400">£{Math.round(pred.estSPLH)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

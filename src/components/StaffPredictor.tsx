
import React, { useState, useEffect, useMemo } from 'react';
import { SalesRecord, DailyPrediction, ShiftPrediction } from '../types';

interface PredictorProps {
  data: SalesRecord[];
  targetDate: string;
  onTotalCoversChange: (val: number) => void;
  aiMultiplier: number;
}

export const StaffPredictor: React.FC<PredictorProps> = ({ data, targetDate, onTotalCoversChange, aiMultiplier }) => {
  const [lunchBookings, setLunchBookings] = useState<number | ''>(12);
  const [dinnerBookings, setDinnerBookings] = useState<number | ''>(55);
  const [hourlyWage, setHourlyWage] = useState<number>(15); // Default hourly wage

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
      
      // Staffing thresholds based on GM best practices
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
  const totalCovers = dailyPrediction.lunch.predictedCovers + dailyPrediction.dinner.predictedCovers;
  const totalLaborHours = (dailyPrediction.lunch.suggestedStaff * 4) + (dailyPrediction.dinner.suggestedStaff * 6);
  const totalLaborCost = totalLaborHours * hourlyWage;

  useEffect(() => {
    onTotalCoversChange(Math.round(totalCovers));
  }, [totalCovers, onTotalCoversChange]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Forecast Target</h3>
          <p className="text-2xl font-black text-slate-900">{targetDate} <span className="text-indigo-600">({currentDayName})</span></p>
        </div>
        
        <div className="flex gap-10">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Est. Revenue</span>
            <span className="text-3xl font-black text-emerald-600">£{Math.round(totalSales).toLocaleString()}</span>
          </div>
          <div className="text-right border-l border-slate-100 pl-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Labor Cost Est.</span>
            <span className="text-3xl font-black text-rose-500">£{Math.round(totalLaborCost)}</span>
            <span className="text-[9px] font-bold text-slate-400 block">({((totalLaborCost/totalSales)*100).toFixed(1)}% Ratio)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['Lunch', 'Dinner'].map((shift) => {
          const isLunch = shift === 'Lunch';
          const pred = isLunch ? dailyPrediction.lunch : dailyPrediction.dinner;
          return (
            <div key={shift} className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-white/5 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-xl font-black tracking-tight">{shift} Service</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Peak: {pred.peakTime}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  pred.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' : 
                  pred.status === 'Surplus' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {pred.status}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Bookings Input</label>
                  <input 
                    type="number" 
                    value={isLunch ? lunchBookings : dinnerBookings}
                    onChange={(e) => isLunch ? setLunchBookings(e.target.value === '' ? '' : Number(e.target.value)) : setDinnerBookings(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">AI Walkins</p>
                    <p className="text-lg font-black">{pred.predictedWalkins}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Staff Needed</p>
                    <p className="text-lg font-black text-indigo-400">{pred.suggestedStaff}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">SPLH</p>
                    <p className="text-lg font-black text-emerald-400">£{Math.round(pred.estSPLH)}</p>
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

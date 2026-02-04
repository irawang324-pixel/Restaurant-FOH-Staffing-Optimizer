
import React from 'react';
import { SalesRecord } from '../types';

interface StatsOverviewProps {
  data: SalesRecord[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const lunchData = data.filter(d => d.shift === 'Lunch');
  const dinnerData = data.filter(d => d.shift === 'Dinner');

  const calcStats = (items: SalesRecord[]) => {
    if (items.length === 0) return { revPerStaff: 0, coversPerStaff: 0, asph: 0 };
    const totalSales = items.reduce((acc, curr) => acc + curr.sales, 0);
    const totalStaff = items.reduce((acc, curr) => acc + curr.fohStaff, 0);
    const totalCovers = items.reduce((acc, curr) => acc + curr.covers, 0);
    return {
      revPerStaff: totalSales / (totalStaff || 1),
      coversPerStaff: totalCovers / (totalStaff || 1),
      asph: totalSales / (totalCovers || 1)
    };
  };

  const lunch = calcStats(lunchData);
  const dinner = calcStats(dinnerData);

  const shiftCards = [
    { title: 'Lunch Efficiency', stats: lunch, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Dinner Efficiency', stats: dinner, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {shiftCards.map((card, i) => (
        <div key={i} className={`p-6 rounded-2xl border border-slate-100 bg-white shadow-sm`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${card.color}`}>{card.title}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rev/Staff</p>
              <p className="text-xl font-black text-slate-800">£{card.stats.revPerStaff.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cov/Staff</p>
              <p className="text-xl font-black text-slate-800">{card.stats.coversPerStaff.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ASPH</p>
              <p className="text-xl font-black text-slate-800">£{card.stats.asph.toFixed(1)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell 
} from 'recharts';
import { SalesRecord } from './types';
import { COLORS } from './constants';

interface ChartsProps {
  data: SalesRecord[]; 
  targetDate: string;
}

export const Charts: React.FC<ChartsProps> = ({ data, targetDate }) => {
  const targetDayOfWeek = new Date(targetDate).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const aggregatedData = useMemo(() => {
    return Array.from(
      data.reduce((acc, curr) => {
        const date = curr.date;
        if (!acc.has(date)) {
          acc.set(date, { 
            date, 
            lunchSales: 0, 
            dinnerSales: 0, 
            lunchCovers: 0, 
            dinnerCovers: 0, 
            staff: 0,
            isSameDayOfWeek: new Date(date).getDay() === targetDayOfWeek,
            dayName: dayNames[new Date(date).getDay()]
          });
        }
        const day = acc.get(date)!;
        if (curr.shift === 'Lunch') {
          day.lunchSales = curr.sales;
          day.lunchCovers = curr.covers;
        } else {
          day.dinnerSales = curr.sales;
          day.dinnerCovers = curr.covers;
        }
        day.staff += curr.fohStaff;
        return acc;
      }, new Map<string, any>())
    ).map(([_, val]) => val)
     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, targetDayOfWeek]);

  const dateWithDayFormatter = (tick: string) => {
    const d = new Date(tick);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${tick} (${days[d.getDay()]})`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isTargetDay = new Date(label).getDay() === targetDayOfWeek;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
            {label} ({dayNames[new Date(label).getDay()]})
            {isTargetDay && <span className="ml-2 text-indigo-600">★ Matches Target Day</span>}
          </p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex justify-between gap-4 items-center">
              <span className="text-xs font-bold text-slate-600">{p.name}:</span>
              <span className="text-xs font-black" style={{ color: p.color }}>
                {p.name.includes('Sales') ? `£${p.value}` : p.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Covers Distribution</h3>
          <p className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase">Highlighting: {dayNames[targetDayOfWeek]}s</p>
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickFormatter={dateWithDayFormatter}
              tick={{fontSize: 8, fontWeight: 700}} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis tick={{fontSize: 9}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
            <Bar dataKey="lunchCovers" name="Lunch Covers" stackId="covers">
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-l-${index}`} fill={entry.isSameDayOfWeek ? COLORS.primary : '#cbd5e1'} />
              ))}
            </Bar>
            <Bar dataKey="dinnerCovers" name="Dinner Covers" stackId="covers">
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-d-${index}`} fill={entry.isSameDayOfWeek ? '#8b5cf6' : '#94a3b8'} fillOpacity={0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Revenue Trend Line</h3>
          <p className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-tighter">Correlation Basis</p>
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickFormatter={dateWithDayFormatter}
              tick={{fontSize: 8, fontWeight: 700}} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis tick={{fontSize: 9}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
            <Line type="monotone" dataKey="lunchSales" name="Lunch Sales" stroke={COLORS.primary} strokeWidth={3} dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isSameDayOfWeek) return <circle cx={cx} cy={cy} r={5} fill={COLORS.primary} stroke="white" strokeWidth={2} />;
              return <circle cx={cx} cy={cy} r={3} fill="#cbd5e1" />;
            }} />
            <Line type="monotone" dataKey="dinnerSales" name="Dinner Sales" stroke="#8b5cf6" strokeWidth={3} dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isSameDayOfWeek) return <circle cx={cx} cy={cy} r={5} fill="#8b5cf6" stroke="white" strokeWidth={2} />;
              return <circle cx={cx} cy={cy} r={3} fill="#94a3b8" fillOpacity={0.5} />;
            }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

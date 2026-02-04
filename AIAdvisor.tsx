
import React, { useState, useMemo } from 'react';
import { SalesRecord, AIRecommendation } from '../types';
import { getAIStaffingAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  history: SalesRecord[];
  location: string;
  targetDate: string;
  currentBookings: number;
  onAIResult?: (result: AIRecommendation) => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ history, location, targetDate, currentBookings, onAIResult }) => {
  const [advice, setAdvice] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsultAI = async () => {
    if (!location) {
      alert("Please specify venue location for grounding.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getAIStaffingAdvice(history, location, targetDate, currentBookings);
      setAdvice(result);
      if (onAIResult) onAIResult(result);
    } catch (err: any) {
      setError(err.message || "Consultation failed.");
    } finally {
      setLoading(false);
    }
  };

  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '•')  // Replace single stars with bullets
      .trim();
  };

  const parsedSections = useMemo(() => {
    if (!advice) return null;
    const raw = advice.rawResponse;
    
    // Improved parsing for structured cards
    const weatherRaw = raw.split('[WEATHER]')[1]?.split('[TRANSPORT]')[0] || "";
    const transportRaw = raw.split('[TRANSPORT]')[1]?.split('[EVENTS]')[0] || "";
    const eventsRaw = raw.split('[EVENTS]')[1]?.split('[ADVICE]')[0] || "";
    const adviceRaw = raw.split('[ADVICE]')[1] || "";

    return {
      weather: cleanText(weatherRaw),
      transport: cleanText(transportRaw),
      events: cleanText(eventsRaw),
      advice: cleanText(adviceRaw)
    };
  }, [advice]);

  const Card = ({ title, content, icon }: { title: string, content: string, icon: React.ReactNode }) => (
    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all group/card flex flex-col h-full shadow-sm">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover/card:bg-indigo-600 group-hover/card:text-white transition-colors">
        {icon}
      </div>
      <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">{title}</h4>
      <div className="text-[12px] font-medium text-slate-600 leading-relaxed whitespace-pre-wrap flex-grow">
        {content || "Analyzing tactical signals..."}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group">
      <div className="bg-slate-900 px-12 py-16 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-600/30">Intelligence Hub</span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Data Grounding</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">Strategic <span className="text-indigo-400">Tactical</span> Report</h2>
              <p className="text-slate-400 font-medium text-xl leading-relaxed">
                Evaluating environmental factors, local events, and transport logistics for <span className="text-white font-bold border-b-2 border-indigo-500/50">{location}</span>.
              </p>
            </div>
            
            <button 
              onClick={handleConsultAI}
              disabled={loading}
              className={`group relative overflow-hidden px-12 py-6 bg-white text-slate-900 font-black rounded-3xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] transition-all active:scale-95 ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-indigo-600 hover:text-white hover:-translate-y-1'}`}
            >
              <span className="relative z-10 flex items-center gap-4 uppercase tracking-[0.15em] text-xs">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>Syncing Intelligence...</>
                ) : (
                  <>Consult Aura Intelligence <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-2 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-10 bg-rose-50 border-b border-rose-100 flex items-center gap-4">
           <div className="bg-rose-600 p-2 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
           </div>
           <div>
              <p className="text-sm font-black text-rose-600 uppercase tracking-widest">Analysis Failed</p>
              <p className="text-xs font-bold text-rose-400">{error}</p>
           </div>
        </div>
      )}

      {parsedSections && !error && (
        <div className="p-12 lg:p-16 bg-white animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card 
              title="Weather Factors" 
              content={parsedSections.weather} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>} 
            />
            <Card 
              title="Transport & TfL" 
              content={parsedSections.transport} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>} 
            />
            <Card 
              title="Nearby Events" 
              content={parsedSections.events} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} 
            />
            <Card 
              title="FOH Strategy" 
              content={parsedSections.advice} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} 
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-end justify-between border-t border-slate-100 pt-12">
             <div className="flex flex-col gap-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Citations:</p>
                <div className="flex flex-wrap gap-3">
                   {advice.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                        {idx + 1}. {source.title.split('|')[0].trim()}
                      </a>
                   ))}
                </div>
             </div>
             <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-8 py-5 rounded-3xl shadow-sm flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-xs font-black uppercase tracking-widest">Tactical Audit Synchronized</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

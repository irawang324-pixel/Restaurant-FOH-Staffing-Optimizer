
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
      alert("Please specify venue location.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getAIStaffingAdvice(history, location, targetDate, currentBookings);
      setAdvice(result);
      if (onAIResult) onAIResult(result);
    } catch (err: any) {
      setError(err.message || "Intelligence synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  const cleanText = (text: string) => text.replace(/\*\*/g, '').replace(/\*/g, '•').trim();

  const sections = useMemo(() => {
    if (!advice) return null;
    const raw = advice.rawResponse;
    return {
      environment: cleanText(raw.split('[ENVIRONMENT]')[1]?.split('[LOGISTICS]')[0] || ""),
      logistics: cleanText(raw.split('[LOGISTICS]')[1]?.split('[OPPORTUNITIES]')[0] || ""),
      opportunities: cleanText(raw.split('[OPPORTUNITIES]')[1]?.split('[TACTICAL_ADVICE]')[0] || ""),
      tactical: cleanText(raw.split('[TACTICAL_ADVICE]')[1] || "")
    };
  }, [advice]);

  const InfoCard = ({ title, content, icon, color }: { title: string, content: string, icon: React.ReactNode, color: string }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color} text-white`}>
        {icon}
      </div>
      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{title}</h5>
      <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap flex-grow">{content || "Analyzing signals..."}</p>
    </div>
  );

  return (
    <div className="bg-slate-50 rounded-[3rem] p-8 lg:p-12 border border-slate-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Grounding <span className="text-indigo-600">Intelligence</span></h2>
          <p className="text-slate-500 font-medium max-w-xl">Live environmental analysis for <span className="text-indigo-600 font-bold">{location}</span> using real-time Google Search data.</p>
        </div>
        <button 
          onClick={handleConsultAI}
          disabled={loading}
          className={`px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'}`}
        >
          {loading ? 'Syncing...' : 'Fetch Tactical Audit'}
        </button>
      </div>

      {error && <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold mb-8">{error}</div>}

      {sections && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <InfoCard color="bg-blue-500" title="Environment" content={sections.environment} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>} />
          <InfoCard color="bg-indigo-500" title="Logistics" content={sections.logistics} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>} />
          <InfoCard color="bg-amber-500" title="Opportunities" content={sections.opportunities} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
          <InfoCard color="bg-emerald-500" title="GM Advice" content={sections.tactical} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
        </div>
      )}
    </div>
  );
};

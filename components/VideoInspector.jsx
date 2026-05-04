import React, { useState } from 'react';
import { Users, Activity, Tag, Package, Volume2, ShieldAlert, CheckCircle2, Search, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VideoInspector = ({ file, analysis, isAnalyzing, onAnalyze, onFastAnalyze }) => {
  const [filter, setFilter] = useState('');

  const filteredActions = analysis?.actions.filter(a => 
    a.description.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const chartData = analysis ? [
    { name: 'People', value: analysis.crowdCount },
    { name: 'Objects', value: analysis.objects.length },
    { name: 'Events', value: analysis.actions.length },
  ] : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
      {/* Left: Video Preview and Controls */}
      <div className="lg:w-1/2 flex flex-col gap-4 shrink-0">
        <div className="relative rounded-xl overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <video 
            src={file.previewUrl} 
            controls 
            className="w-full aspect-video object-contain bg-black/50"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium tracking-wider uppercase mono">Live Inspector</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Analysis Control</h3>
              <p className="text-xs text-slate-400">Run neural scan to extract metadata</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onFastAnalyze}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${
                  isAnalyzing 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Fast Scan
              </button>
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${
                  isAnalyzing 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                }`}
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                Deep Scan
              </button>
            </div>
          </div>
          
          {analysis && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.05)]">
                <div className="text-slate-400 text-xs mb-1 uppercase tracking-tighter flex items-center gap-1">
                  <Users className="w-3 h-3" /> Crowd
                </div>
                <div className="text-2xl font-bold text-indigo-400">{analysis.crowdCount}</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <div className="text-slate-400 text-xs mb-1 uppercase tracking-tighter flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Events
                </div>
                <div className="text-2xl font-bold text-emerald-400">{analysis.actions.length}</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                <div className="text-slate-400 text-xs mb-1 uppercase tracking-tighter flex items-center gap-1">
                  <Package className="w-3 h-3" /> Objects
                </div>
                <div className="text-2xl font-bold text-amber-400">{analysis.objects.length}</div>
              </div>
            </div>
          )}
        </div>

        {analysis && (
          <div className="h-48 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4">
             <h4 className="text-sm font-semibold mb-2 text-slate-300">Metric Distribution</h4>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                 <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                 <YAxis stroke="#64748b" fontSize={10} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                   itemStyle={{ color: '#f8fafc' }}
                 />
                 <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b'][index % 3]} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Right: Detailed Analysis Tabs */}
      <div className="lg:w-1/2 flex flex-col gap-6 overflow-hidden pb-4">
        {!analysis && !isAnalyzing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900/20 backdrop-blur-xl rounded-2xl border border-dashed border-white/10">
            <ShieldAlert className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-slate-300">Ready for Inspection</h3>
            <p className="text-slate-400 max-w-xs mt-2 text-sm">Upload a recording (up to 1 hour) and trigger a Deep Scan to begin automated surveillance metadata extraction.</p>
          </div>
        ) : isAnalyzing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900/20 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
            <div className="relative w-24 h-24 mb-6">
               <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
               <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
               <ShieldAlert className="absolute inset-0 m-auto w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Scanning Sequence Active</h3>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
              </div>
              <p className="text-slate-400 text-sm mono">Rerouting through Neural Mesh...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Action Timeline */}
            <section className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-white/5 flex justify-between items-center sticky top-0 bg-slate-900/60 backdrop-blur-2xl z-10">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-white">Event Timeline</h3>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div className="p-2 space-y-1">
                {filteredActions.length > 0 ? filteredActions.map((action, idx) => (
                  <div key={idx} className="group flex gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="text-[10px] font-bold text-slate-400 mb-1 mono">{action.timestamp}</div>
                      <div className={`w-2 h-2 rounded-full ${
                        action.intensity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                        action.intensity === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      }`} />
                      <div className="w-0.5 flex-grow bg-white/10 my-1 group-last:hidden" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">{action.description}</p>
                    </div>
                  </div>
                )) : (
                   <div className="p-8 text-center text-slate-500 text-sm italic">No matching events found.</div>
                )}
              </div>
            </section>

            {/* Objects and Attributes */}
            <div className="grid grid-cols-1 gap-4">
              <section className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Object List</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.objects.map((obj, i) => (
                    <span key={i} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded text-xs font-medium border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      {obj}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Audio Transcription */}
            <section className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Volume2 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Audio Intel</h3>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-lg border border-white/5 italic text-slate-300 text-sm leading-relaxed shadow-inner max-h-64 overflow-y-auto whitespace-pre-wrap">
                "{analysis.audioTranscription || 'No significant audio activity detected.'}"
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoInspector;

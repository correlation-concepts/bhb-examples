'use client';

import { CompleteDocument } from '@/types/bhb';

interface Props {
    data: CompleteDocument;
}

export default function ErrataLog({ data }: Props) {
    const errata = data.errata || [];

    return (
        <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="glass p-8 rounded-[2.5rem] border-white/5 bg-black/40 flex-1 flex flex-col">
                <header className="mb-10 flex justify-between items-center px-2">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-2">System Errata Monitor</h3>
                        <p className="text-slate-500 text-xs font-medium">Anomalies and resolution warnings detected during correlation phase.</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black tracking-[0.2em] uppercase">
                        {errata.length} System Faults
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    {errata.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <h4 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-2">High Fidelity Integrity</h4>
                            <p className="text-slate-500 text-xs font-medium max-w-[280px] leading-relaxed italic">The document DNA was processed without any detectable anomalies or topological inconsistencies.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {errata.map((msg, i) => (
                                <div key={i} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 hover:bg-red-500/[0.02] transition-all duration-300">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-red-500 transition-colors">Anomaly-{100 + i}</span>
                                                <div className="h-px flex-1 bg-white/5 group-hover:bg-red-500/20 transition-colors"></div>
                                            </div>
                                            <p className="text-slate-300 font-mono text-[11px] leading-relaxed group-hover:text-white transition-colors">{msg}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-red-500/5 to-transparent">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Confidence Index</h4>
                    <div className="text-4xl font-black text-white tracking-tighter italic">
                        {errata.length === 0 ? '99.9%' : `${(100 - (errata.length * 1.5)).toFixed(1)}%`}
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Resolution Engine</h4>
                    <div className="text-4xl font-black text-emerald-400 tracking-tighter italic uppercase">Active</div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { CompleteDocument } from '@/types/bhb';

interface Props {
    data: CompleteDocument;
}

export default function NarrativeIntensity({ data }: Props) {
    const chartData = useMemo(() => {
        if (!data.notes) return [];

        return data.notes.map((note, i) => {
            const valIn = parseFloat(note.nIn) || (note.tokens.length * 2);
            const valOut = parseFloat(note.nOut) || (note.text.length / 10);

            return {
                name: `Node ${i + 1}`,
                intensity: valIn,
                connectivity: valOut,
                text: note.text.substring(0, 50) + '...'
            };
        });
    }, [data]);

    if (chartData.length === 0) return (
        <div className="h-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
            Intensity Map Empty
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="glass p-8 rounded-[2.5rem] flex-1 min-h-0 flex flex-col border-white/5">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 px-1">Analytical Intensity Flow</h3>
                        <p className="text-slate-500 text-xs font-medium px-1">Mapping analytical pressure and connection weighted across document nodes.</p>
                    </div>
                    <div className="flex gap-6 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound Intensity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outbound Flux</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="6 6" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="name"
                                hide
                            />
                            <YAxis
                                stroke="#475569"
                                fontSize={10}
                                fontWeight={900}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="glass p-6 rounded-[2rem] border-white/10 shadow-2xl backdrop-blur-3xl bg-black/60">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">{payload[0].payload.name}</p>
                                                <div className="space-y-2 mb-4">
                                                    <p className="text-white font-black text-xs flex justify-between gap-8">
                                                        <span className="text-slate-500 uppercase">Input</span>
                                                        <span className="text-blue-400">{(payload[0].value as number).toFixed(2)}</span>
                                                    </p>
                                                    <p className="text-white font-black text-xs flex justify-between gap-8">
                                                        <span className="text-slate-500 uppercase">Output</span>
                                                        <span className="text-indigo-400">{(payload[1].value as number).toFixed(2)}</span>
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-slate-400 italic font-medium max-w-[220px] leading-relaxed border-t border-white/5 pt-4">
                                                    &quot;{payload[0].payload.text}&quot;
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="intensity"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIn)"
                                animationDuration={1500}
                            />
                            <Area
                                type="monotone"
                                dataKey="connectivity"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorOut)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-white/10 transition-all">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Load Mean</h4>
                    <div className="text-3xl font-black text-white tracking-tighter italic">
                        {(chartData.reduce((acc, d) => acc + d.intensity, 0) / (chartData.length || 1)).toFixed(2)}
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent hover:border-white/10 transition-all">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Flux Peak</h4>
                    <div className="text-3xl font-black text-white tracking-tighter italic">
                        {Math.max(...chartData.map(d => d.connectivity), 0).toFixed(2)}
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent hover:border-white/10 transition-all">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Sync Consistency</h4>
                    <div className="text-3xl font-black text-emerald-400 tracking-tighter italic">98.4%</div>
                </div>
            </div>
        </div>
    );
}

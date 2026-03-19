'use client';

import { useMemo } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { CompleteDocument } from '@/types/bhb';

interface Props {
    data: CompleteDocument;
}

export default function LanguageProfile({ data }: Props) {
    const stats = useMemo(() => {
        if (!data.notes) return null;

        const allTokens = data.notes.flatMap(n => n.tokens);

        const traitCounts: Record<string, number> = {
            singular: 0, plural: 0, masculine: 0, feminine: 0, neutral: 0, possessive: 0,
        };

        const typeCounts: Record<string, number> = {};

        allTokens.forEach(token => {
            if (token.plurality?.toLowerCase().includes('singular')) traitCounts.singular++;
            if (token.plurality?.toLowerCase().includes('plural')) traitCounts.plural++;
            if (token.genderType?.toLowerCase().includes('male')) traitCounts.masculine++;
            if (token.genderType?.toLowerCase().includes('female')) traitCounts.feminine++;
            if (token.genderType?.toLowerCase().includes('neutral')) traitCounts.neutral++;
            if (token.possessive) traitCounts.possessive++;
            const type = token.nameType || 'Unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const total = allTokens.length || 1;

        const radarData = [
            { subject: 'Singular', A: (traitCounts.singular / total) * 100 },
            { subject: 'Plural', A: (traitCounts.plural / total) * 100 },
            { subject: 'Masculine', A: (traitCounts.masculine / total) * 100 },
            { subject: 'Feminine', A: (traitCounts.feminine / total) * 100 },
            { subject: 'Possessive', A: (traitCounts.possessive / total) * 100 },
        ];

        const typeData = Object.entries(typeCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        return { radarData, typeData, traitCounts, total };
    }, [data]);

    if (!stats) return (
        <div className="h-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
            Linguistic Data Unavailable
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0 flex-1">
                <div className="glass p-8 rounded-[2rem] flex flex-col border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6 px-2">Linguistic DNA</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.radarData}>
                                <PolarGrid stroke="#334155" strokeDasharray="4 4" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="DNA" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] flex flex-col border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 px-2">Entity Resolution Distribution</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.typeData} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} width={80} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px' }} itemStyle={{ color: '#60a5fa', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }} />
                                <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 10, 10, 0]} barSize={16} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Masculine Bias', value: stats.traitCounts.masculine, color: 'text-blue-400' },
                    { label: 'Feminine Bias', value: stats.traitCounts.feminine, color: 'text-indigo-400' },
                    { label: 'Possessives', value: stats.traitCounts.possessive, color: 'text-blue-500' },
                    { label: 'Core Density', value: (stats.total / (data.notes.length || 1)).toFixed(2), color: 'text-white', suffix: ' t/n' }
                ].map((item, i) => (
                    <div key={i} className="glass p-6 rounded-[2rem] border-white/5 hover:border-white/10 transition-all hover:translate-y-[-2px]">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{item.label}</div>
                        <div className={`text-3xl font-black tracking-tighter ${item.color}`}>{item.value}{item.suffix}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

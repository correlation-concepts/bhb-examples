'use client';

import { useMemo } from 'react';
import { CompleteDocument } from '@/types/bhb';

interface Props {
    data: CompleteDocument;
}

interface MatrixCell {
    source: string;
    target: string;
    strength: number;
    span: number;
    i: number;
    j: number;
}

interface CorrelationData {
    matrix: MatrixCell[];
    topEntities: any[];
}

export default function CorrelationMatrix({ data }: Props) {
    const correlations = useMemo<CorrelationData | null>(() => {
        if (!data.notes || data.notes.length === 0) return null;

        const entityMap = new Map<string, { name: string, type: string, notes: number[] }>();

        // 1. Map entities and their appearances
        data.notes.forEach((note, noteIndex) => {
            note.tokens.forEach(token => {
                if (!token.nameType || token.nameType === 'UNKNOWN') return;

                const key = token.spelling.toLowerCase();
                if (!entityMap.has(key)) {
                    entityMap.set(key, {
                        name: token.spelling,
                        type: token.nameType,
                        notes: []
                    });
                }
                entityMap.get(key)!.notes.push(noteIndex);
            });
        });

        // 2. Filter to top entities by frequency
        const topEntities = Array.from(entityMap.entries())
            .sort((a, b) => b[1].notes.length - a[1].notes.length)
            .slice(0, 15)
            .map(([key, val]) => ({ key, ...val }));

        if (topEntities.length === 0) return null;

        // 3. Calculate correlation matrix
        const matrix: MatrixCell[] = [];
        topEntities.forEach((e1, i) => {
            topEntities.forEach((e2, j) => {
                if (i > j) return; // Only need half matrix + diagonal

                // Co-occurrences
                const set1 = new Set(e1.notes);
                const set2 = new Set(e2.notes);
                const intersect = [...set1].filter(n => set2.has(n));

                // Distance span (longest distance between mentions)
                const allMentions = [...e1.notes, ...e2.notes];
                const span = allMentions.length > 0 ? Math.max(...allMentions) - Math.min(...allMentions) : 0;

                matrix.push({
                    source: e1.name,
                    target: e2.name,
                    strength: intersect.length,
                    span: span,
                    i, j
                });
            });
        });

        return { matrix, topEntities };
    }, [data]);

    if (!correlations || correlations.matrix.length === 0) return (
        <div className="h-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
            Correlation Space Empty
        </div>
    );

    const { matrix, topEntities } = correlations;

    return (
        <div className="w-full h-full flex flex-col space-y-8 animate-in fade-in duration-700 overflow-hidden">
            <div className="glass p-8 rounded-[2.5rem] border-white/5 flex-1 min-h-0 flex flex-col overflow-hidden">
                <header className="mb-10 flex justify-between items-center px-2">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Platform Correlation Matrix</h3>
                        <p className="text-slate-500 text-xs font-medium">Visualizing intersection strength and mention spans across the narrative.</p>
                    </div>
                </header>

                <div className="flex-1 overflow-auto custom-scrollbar p-4">
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${topEntities.length + 1}, minmax(80px, 1fr))`
                        }}
                    >
                        {/* Header Row */}
                        <div className="h-12"></div>
                        {topEntities.map(e => (
                            <div key={e.key} className="h-12 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase tracking-tighter text-center px-1 truncate">
                                {e.name}
                            </div>
                        ))}

                        {/* Matrix Rows */}
                        {topEntities.map((e1, i) => (
                            <>
                                <div key={e1.key} className="h-20 flex items-center pr-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter text-right truncate">
                                    {e1.name}
                                </div>
                                {topEntities.map((e2, j) => {
                                    const cell = matrix.find(m => (m.i === i && m.j === j) || (m.i === j && m.j === i));
                                    if (!cell) return <div key={j} className="h-20 bg-white/[0.01] rounded-lg"></div>;

                                    const opacity = cell.strength > 0 ? 0.1 + (cell.strength / 10) : 0.02;
                                    const isLongDistance = cell.span > data.notes.length * 0.5 && cell.strength > 0;

                                    return (
                                        <div
                                            key={j}
                                            className={`h-20 rounded-xl flex flex-col items-center justify-center transition-all group relative border ${isLongDistance ? 'border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-transparent'}`}
                                            style={{
                                                backgroundColor: cell.strength > 0 ? `rgba(59, 130, 246, ${Math.min(0.6, opacity)})` : 'rgba(255,255,255,0.02)'
                                            }}
                                        >
                                            <span className={`text-xs font-black ${cell.strength > 0 ? 'text-white' : 'text-slate-700'}`}>
                                                {cell.strength}
                                            </span>
                                            {cell.span > 0 && (
                                                <span className="text-[8px] font-bold text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    S:{cell.span}
                                                </span>
                                            )}

                                            {/* Tooltip on Hover */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover:block z-50">
                                                <div className="glass p-4 rounded-2xl border-white/20 whitespace-nowrap bg-black shadow-2xl">
                                                    <p className="text-[10px] font-black text-blue-400 mb-1">{e1.name} × {e2.name}</p>
                                                    <p className="text-white text-xs font-bold">{cell.strength} co-occurrences</p>
                                                    <p className="text-slate-400 text-[10px]">Mentions spanning {cell.span} nodes</p>
                                                    {isLongDistance && (
                                                        <p className="mt-2 text-[10px] text-indigo-400 font-black tracking-widest uppercase animate-pulse">Long Range Relation</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Correlation Logic</h4>
                    <p className="text-slate-400 text-xs leading-relaxed font-medium">
                        Blue regions indicate strong co-occurrence (clusters). Borders highlight <span className="text-indigo-400">Long Range Relations</span>—entities that interact across more than 50% of the document's total analytical span.
                    </p>
                </div>
                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Unlikely Metrics</h4>
                    <div className="flex gap-10">
                        <div>
                            <div className="text-[9px] font-black text-slate-600 mb-1 uppercase">Max Span</div>
                            <div className="text-2xl font-black text-white">{Math.max(...matrix.map(m => m.span), 0)}</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-slate-600 mb-1 uppercase">Density</div>
                            <div className="text-2xl font-black text-white">{(matrix.filter(m => m.strength > 0).length / matrix.length * 100).toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

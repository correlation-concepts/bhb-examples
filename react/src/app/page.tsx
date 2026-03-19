'use client';

import { useState } from 'react';
import ApiConfigForm, { useApiCredentials } from '@/components/ApiConfig';
import CorrelationMatrix from '@/components/CorrelationMatrix';
import EntityNetworkViz from '@/components/EntityNetworkViz';
import ErrataLog from '@/components/ErrataLog';
import LanguageProfile from '@/components/LanguageProfile';
import NarrativeIntensity from '@/components/NarrativeIntensity';
import SentimentTimeline from '@/components/SentimentTimeline';
import SmartSummary from '@/components/SmartSummary';
import TopicClusters from '@/components/TopicClusters';
import { proxyAnalyze } from '@/lib/api';
import { processEntityData } from '@/lib/viz-utils';
import { CompleteDocument, NotesRequest } from '@/types/bhb';

export default function RootPage() {
    const { credentials } = useApiCredentials();
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CompleteDocument | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!credentials.clientId || !credentials.clientSecret) {
            setError('Please save API credentials first.');
            return;
        }
        if (!url || !email) {
            setError('URL and Email are required.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const request: NotesRequest = {
                url,
                email,
                type: 'developer',
                ts: Date.now(),
                key: 0,
            };

            const result = await proxyAnalyze(credentials.clientId, credentials.clientSecret, request);
            if (result.complete_document) {
                setData(result.complete_document);
            } else {
                setError('Invalid response format');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to analyze URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white p-8 font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">
                            BHB Visualization Hub
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            Interactive data analysis and entity mapping dashboard.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Configuration */}
                    <div className="space-y-8 lg:col-span-1">
                        <ApiConfigForm />

                        <div className="glass p-6 rounded-2xl border border-white/5 bg-gray-900 shadow-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4">Analyze Target</h3>
                            <form onSubmit={handleAnalyze} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-semibold uppercase">Target URL</label>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com/article"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-semibold uppercase">Contact Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                                    />
                                </div>
                                {error && (
                                    <div className="p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-400 text-xs mt-2">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full font-bold py-3 rounded-lg transition-all duration-300 shadow-lg ${
                                        loading
                                            ? 'bg-indigo-600/50 cursor-not-allowed text-white/50'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                    }`}
                                >
                                    {loading ? 'Analyzing...' : 'Run Analysis'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {!data && !loading && (
                            <div className="h-full flex flex-col items-center justify-center p-12 border border-white/5 border-dashed rounded-3xl bg-white/[0.01]">
                                <h2 className="text-xl font-black text-slate-600 uppercase tracking-[0.2em] mb-4">
                                    Awaiting Target
                                </h2>
                                <p className="text-slate-500 text-sm text-center max-w-sm">
                                    Enter an article or document URL along with your email to begin the structural analysis and visualize its core entities.
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center p-12 space-y-6">
                                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                <p className="text-indigo-400 font-black uppercase tracking-widest animate-pulse text-sm">
                                    Extracting DNA...
                                </p>
                            </div>
                        )}

                        {data && (
                            <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-1000">
                                <section>
                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-blue-500">
                                        Smart Summary
                                    </h2>
                                    <div className="h-[250px] relative">
                                        <SmartSummary data={data} />
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section>
                                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-emerald-500">
                                            Entity Topology
                                        </h2>
                                        <div className="h-[400px] relative">
                                            <EntityNetworkViz data={processEntityData(data)} />
                                        </div>
                                    </section>
                                    <section>
                                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-purple-500">
                                            Semantic Topic Clusters
                                        </h2>
                                        <div className="h-[400px] relative">
                                            <TopicClusters data={data} />
                                        </div>
                                    </section>
                                </div>

                                <section>
                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-rose-500">
                                        Narrative Flow Analysis
                                    </h2>
                                    <div className="h-[450px] relative">
                                        <SentimentTimeline data={data} />
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-amber-500">
                                        Intensity Dynamics
                                    </h2>
                                    <div className="h-[350px] relative">
                                        <NarrativeIntensity data={data} />
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <section>
                                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-teal-500">
                                            Language DNA
                                        </h2>
                                        <div className="h-[500px] relative">
                                            <LanguageProfile data={data} />
                                        </div>
                                    </section>
                                    <section>
                                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-indigo-500">
                                            Correlation Space
                                        </h2>
                                        <div className="h-[500px] relative">
                                            <CorrelationMatrix data={data} />
                                        </div>
                                    </section>
                                </div>

                                <section>
                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-4 border-l-2 border-red-500">
                                        Anomaly Matrix
                                    </h2>
                                    <div className="h-[400px] relative">
                                        <ErrataLog data={data} />
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

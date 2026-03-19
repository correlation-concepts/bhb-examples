'use client';

import { useState, useEffect } from 'react';

export interface ApiCredentials {
    clientId: string;
    clientSecret: string;
}

export function useApiCredentials() {
    const [credentials, setCredentials] = useState<ApiCredentials>({
        clientId: '',
        clientSecret: '',
    });

    useEffect(() => {
        const saved = localStorage.getItem('bhb_credentials');
        if (saved) {
            try {
                setCredentials(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved credentials', e);
            }
        }
    }, []);

    const saveCredentials = (newCredentials: ApiCredentials) => {
        setCredentials(newCredentials);
        localStorage.setItem('bhb_credentials', JSON.stringify(newCredentials));
    };

    const clearCredentials = () => {
        setCredentials({ clientId: '', clientSecret: '' });
        localStorage.removeItem('bhb_credentials');
    };

    return { credentials, saveCredentials, clearCredentials };
}

export default function ApiConfigForm({ onSave }: { onSave?: () => void }) {
    const { credentials, saveCredentials } = useApiCredentials();
    const [localCreds, setLocalCreds] = useState(credentials);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalCreds(credentials);
    }, [credentials]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveCredentials(localCreds);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        if (onSave) onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <h3 className="font-bold uppercase tracking-wider text-sm">Credentials Configuration</h3>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold uppercase">Client ID</label>
                <input type="text" value={localCreds.clientId} onChange={(e) => setLocalCreds({ ...localCreds, clientId: e.target.value })} placeholder="Enter Client ID" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm" />
            </div>
            <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold uppercase">Client Secret</label>
                <input type="password" value={localCreds.clientSecret} onChange={(e) => setLocalCreds({ ...localCreds, clientSecret: e.target.value })} placeholder="Enter Client Secret" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm" />
            </div>
            <button type="submit" className={`w-full font-bold py-3 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                <span>{isSaved ? 'Credentials Saved' : 'Save Credentials'}</span>
            </button>
            <p className="text-[10px] text-gray-600 italic text-center">Credentials are saved locally in your browser&#39;s persistent storage.</p>
        </form>
    );
}

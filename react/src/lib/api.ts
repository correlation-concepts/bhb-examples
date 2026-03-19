import { NotesResponse, NotesRequest } from '@/types/bhb';

export async function proxyAnalyze(
    clientId: string,
    clientSecret: string,
    request: NotesRequest
): Promise<NotesResponse> {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            clientId,
            clientSecret,
            ...request,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to analyze document');
        (error as any).rawBody = errorData.rawBody;
        throw error;
    }

    return response.json();
}

// Keep original functions for external reference if needed, but they may hit CORS in browsers
export async function getAccessToken(clientId: string, clientSecret: string) {
    const AUTH_URL = 'https://correlationconcepts.us.auth0.com/oauth/token';
    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            audience: 'server.proggor.com',
        }),
    });
    return response.json();
}

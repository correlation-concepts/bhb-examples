import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = 'https://correlationconcepts.us.auth0.com/oauth/token';
const API_BASE_URL = 'https://server.proggor.com';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { clientId, clientSecret, url, email, type, ts, key } = body;

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // 1. Get Token
        const authResponse = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                audience: 'server.proggor.com',
            }),
        });

        if (!authResponse.ok) {
            const err = await authResponse.text();
            return NextResponse.json({ error: `Auth0 Error: ${err}` }, { status: authResponse.status });
        }

        const { access_token } = await authResponse.json();

        // 2. Perform Analysis
        const analysisResponse = await fetch(`${API_BASE_URL}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                url,
                email,
                type,
                ts: ts.toString(),
                key: key.toString(),
            }),
        });

        if (!analysisResponse.ok) {
            const err = await analysisResponse.text();
            return NextResponse.json({
                error: `BHB API Error: ${analysisResponse.status} ${analysisResponse.statusText}`,
                rawBody: err
            }, { status: analysisResponse.status });
        }

        const data = await analysisResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

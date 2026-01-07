import { NextResponse } from 'next/server';

export async function GET() {
    const keepAliveUrl = process.env.KEEP_ALIVE_URL;

    if (!keepAliveUrl) {
        return NextResponse.json(
            { error: 'KEEP_ALIVE_URL not defined' },
            { status: 500 }
        );
    }

    try {
        console.log(`[Cron] Pinging keep-alive URL: ${keepAliveUrl}`);
        const response = await fetch(keepAliveUrl);

        if (!response.ok) {
            console.error(`[Cron] Ping failed with status: ${response.status}`);
            return NextResponse.json(
                { error: `Ping failed with status: ${response.status}` },
                { status: 502 }
            );
        }

        console.log('[Cron] Ping successful');
        return NextResponse.json({ success: true, message: 'Ping successful' });
    } catch (error) {
        console.error('[Cron] Ping failed:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

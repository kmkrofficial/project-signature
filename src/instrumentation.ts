// Removed conflicting import

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Default to 48 hours (172800 seconds) if not configured
    const intervalSeconds = parseInt(process.env.KEEP_ALIVE_INTERVAL_SECONDS || '172800', 10);
    const intervalMs = intervalSeconds * 1000;

    const runKeepAlive = async () => {
      const keepAliveUrl = process.env.KEEP_ALIVE_URL;
      if (keepAliveUrl) {
        try {
          console.log(`[Scheduler] Pinging keep-alive URL: ${keepAliveUrl}`);
          await fetch(keepAliveUrl);
          console.log('[Scheduler] Ping successful');
        } catch (error) {
          console.error('[Scheduler] Ping failed:', error);
        }
      } else {
        console.warn('[Scheduler] No KEEP_ALIVE_URL configured');
      }
    };

    // Run immediately on start (optional, fitting for a "keep alive")
    // runKeepAlive(); 

    setInterval(runKeepAlive, intervalMs);

    console.log(`[Scheduler] Keep-alive task scheduled (Every ${intervalSeconds} seconds)`);
  }
}

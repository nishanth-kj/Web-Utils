// Submits the sitemap's URLs to IndexNow (Bing, Yandex, Seznam, ...) after a
// production build. Runs as part of `npm run build`, so it must never fail
// the build: every problem is logged and skipped.
const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = 'webutils.site';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUT_DIR = path.join(process.cwd(), 'out');

// Only production deploys change what's live; preview and local builds
// would otherwise ping search engines about URLs that didn't change.
if (process.env.VERCEL_ENV !== 'production' && process.env.INDEXNOW_FORCE !== '1') {
    console.log('[IndexNow] Skipped: not a production build (set INDEXNOW_FORCE=1 to submit anyway).');
    process.exit(0);
}

// The key must stay the same across deploys, because search engines verify
// it by fetching https://webutils.site/<key>.txt from the live site. Use
// INDEXNOW_KEY if set, otherwise the key file committed in public/.
function findKey() {
    if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY;
    const keyFile = fs.readdirSync(PUBLIC_DIR).find((name) => {
        if (!/^[0-9a-f]{32}\.txt$/.test(name)) return false;
        return fs.readFileSync(path.join(PUBLIC_DIR, name), 'utf8').trim() === name.slice(0, -4);
    });
    return keyFile ? keyFile.slice(0, -4) : null;
}

const key = findKey();
if (!key) {
    console.log('[IndexNow] Skipped: no INDEXNOW_KEY and no <key>.txt key file in public/.');
    process.exit(0);
}

// Make sure the deployed output serves the key file, including when the key
// comes from the environment rather than public/.
const outKeyFile = path.join(OUT_DIR, `${key}.txt`);
if (fs.existsSync(OUT_DIR) && !fs.existsSync(outKeyFile)) {
    fs.writeFileSync(outKeyFile, key);
    console.log(`[IndexNow] Added ${key}.txt to the build output.`);
}

let urls = [`https://${HOST}/`];
try {
    const sitemap = fs.readFileSync(path.join(OUT_DIR, 'sitemap.xml'), 'utf8');
    urls.push(...[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
} catch (error) {
    console.log(`[IndexNow] Could not read out/sitemap.xml (${error.message}); submitting the homepage only.`);
}
urls = [...new Set(urls)];

const payload = JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: urls,
});

const request = https.request(
    {
        hostname: 'api.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10_000,
    },
    (response) => {
        const ok = response.statusCode === 200 || response.statusCode === 202;
        console.log(`[IndexNow] ${ok ? 'Submitted' : 'Submission returned'} ${urls.length} URLs (HTTP ${response.statusCode}).`);
        response.resume();
    }
);

request.on('timeout', () => request.destroy(new Error('timed out')));
request.on('error', (error) => console.log(`[IndexNow] Submission failed: ${error.message}`));
request.write(payload);
request.end();

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOST = 'webutils.site';
const KEY_NAME = process.env.INDEXNOW_KEY || crypto.randomUUID().replace(/-/g, '');

// Create the key file in the public directory so Bing can verify it
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
const keyFilePath = path.join(publicDir, `${KEY_NAME}.txt`);
fs.writeFileSync(keyFilePath, KEY_NAME);
console.log(`[IndexNow] Generated key file: ${KEY_NAME}.txt`);

// Extract URLs from sitemap if it exists in the 'out' or 'public' directory
let urls = [`https://${HOST}/`];
try {
    const sitemapPath = path.join(process.cwd(), 'out', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        // Simple regex to extract URLs from sitemap
        const regex = /<loc>(.*?)<\/loc>/g;
        let match;
        while ((match = regex.exec(sitemapContent)) !== null) {
            urls.push(match[1]);
        }
        console.log(`[IndexNow] Found ${urls.length} URLs in sitemap.`);
    }
} catch (e) {
    console.error('[IndexNow] Could not parse sitemap, submitting default URL list.', e);
}

// Remove duplicates
urls = [...new Set(urls)];

const payload = JSON.stringify({
    host: HOST,
    key: KEY_NAME,
    keyLocation: `https://${HOST}/${KEY_NAME}.txt`,
    urlList: urls
});

const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = https.request(options, (res) => {
    console.log(`[IndexNow] Submission Status: ${res.statusCode}`);
    if (res.statusCode === 200 || res.statusCode === 202) {
        console.log('[IndexNow] Successfully submitted URLs to search engines!');
    } else {
        console.log('[IndexNow] Submission may have failed.');
    }
});

req.on('error', (e) => {
    console.error(`[IndexNow] Error submitting to IndexNow: ${e.message}`);
});

req.write(payload);
req.end();

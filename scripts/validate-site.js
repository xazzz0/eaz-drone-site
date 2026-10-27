const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = [
  path.join(root, 'index.html'),
  ...fs.readdirSync(path.join(root, 'pages')).filter((f) => f.endsWith('.html')).map((f) => path.join(root, 'pages', f)),
  ...fs.readdirSync(path.join(root, 'cities')).filter((f) => f.endsWith('.html')).map((f) => path.join(root, 'cities', f)),
];
const problems = [];
const origin = 'https://www.eazdrones.com';
const productionURLs = new Set(htmlFiles.map((file) => origin + (file === path.join(root, 'index.html') ? '/' : '/' + path.relative(root, file).split(path.sep).join('/'))));

function checkLocalURL(target, file, relative) {
  if (/^(mailto:|tel:|javascript:|data:)/i.test(target)) return;
  let url;
  try { url = new URL(target.replace(/&amp;/g, '&'), origin + '/' + path.relative(root, file).split(path.sep).join('/')); }
  catch { problems.push(`${relative}: malformed URL ${target}`); return; }
  if (url.origin !== origin) return;
  let decoded;
  try { decoded = decodeURIComponent(url.pathname); }
  catch { problems.push(`${relative}: invalid URL encoding ${target}`); return; }
  const resolved = path.resolve(root, '.' + (decoded.endsWith('/') ? decoded + 'index.html' : decoded));
  if (!resolved.startsWith(root + path.sep)) { problems.push(`${relative}: URL escapes site root ${target}`); return; }
  if (!fs.existsSync(resolved)) { problems.push(`${relative}: missing local target ${target}`); return; }
  if (url.hash && resolved.endsWith('.html')) {
    const ids = [...fs.readFileSync(resolved, 'utf8').matchAll(/\sid=["']([^"']+)["']/gi)].map((m) => m[1]);
    if (!ids.includes(decodeURIComponent(url.hash.slice(1)))) problems.push(`${relative}: missing anchor ${target}`);
  }
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (!/<html\s+[^>]*lang=["']en["']/i.test(text)) problems.push(`${relative}: missing <html lang="en">`);
  if (!/<title>\s*[^<]+<\/title>/i.test(text)) problems.push(`${relative}: missing title`);
  if (!/<meta\s+name=["']description["'][^>]+content=["'][^"']+[^>]*>/i.test(text)) problems.push(`${relative}: missing description`);
  if (!/<meta\s+property=["']og:image["'][^>]+content=["']https:\/\/www\.eazdrones\.com\/images\//i.test(text)) problems.push(`${relative}: missing og:image`);
  if (!/<meta\s+name=["']twitter:image["'][^>]+content=["']https:\/\/www\.eazdrones\.com\/images\//i.test(text)) problems.push(`${relative}: missing twitter:image`);
  if ((text.match(/<link\s+rel=["']canonical["']/gi) || []).length !== 1) problems.push(`${relative}: expected exactly one canonical URL`);
  if ((text.match(/<h1\b/gi) || []).length !== 1) problems.push(`${relative}: expected exactly one h1`);
  if (/<div\s+data-site-(?:header|footer)\b/i.test(text)) problems.push(`${relative}: contains unbuilt site fragment placeholder`);
  if (/site-fragments\.js/i.test(text)) problems.push(`${relative}: contains runtime fragment loader`);
  if ((text.match(/src="\/assets\/js\/analytics\.js"/g) || []).length !== 1) problems.push(`${relative}: expected one analytics setup script`);
  if (!text.includes('data-analytics-settings')) problems.push(`${relative}: missing analytics choice control`);
  if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(text)) problems.push(`${relative}: production page is marked noindex`);

  const canonical = text.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const expectedURL = origin + (file === path.join(root, 'index.html') ? '/' : '/' + relative.split(path.sep).join('/'));
  if (canonical && canonical[1] !== expectedURL) problems.push(`${relative}: canonical does not match its production URL`);
  const ids = [...text.matchAll(/\sid=["']([^"']+)["']/gi)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) problems.push(`${relative}: duplicate HTML ids`);
  for (const match of text.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); }
    catch (error) { problems.push(`${relative}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of text.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (!/\balt=["'][^"']*["']/i.test(attrs)) problems.push(`${relative}: image missing alt attribute`);
    if (!/\b(?:width|height)=["'][^"']+["']/i.test(attrs)) problems.push(`${relative}: image missing intrinsic dimensions`);
  }

  for (const match of text.matchAll(/\s(?:src|href)=["']([^"']+)["']/gi)) checkLocalURL(match[1], file, relative);
  for (const match of text.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) checkLocalURL(candidate.trim().split(/\s+/)[0], file, relative);
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('<urlset') || !sitemap.includes('</urlset>')) problems.push('sitemap.xml: malformed XML wrapper');
const sitemapURLs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (new Set(sitemapURLs).size !== sitemapURLs.length) problems.push('sitemap.xml: duplicate URLs');
for (const url of sitemapURLs) {
  if (!productionURLs.has(url)) problems.push(`sitemap.xml: unexpected or missing page ${url}`);
}
for (const url of productionURLs) if (!sitemapURLs.includes(url)) problems.push(`sitemap.xml: missing production page ${url}`);
const textURLs = fs.readFileSync(path.join(root, 'sitemap.txt'), 'utf8').trim().split(/\r?\n/).sort();
if (JSON.stringify(textURLs) !== JSON.stringify([...sitemapURLs].sort())) problems.push('sitemap.txt: does not match sitemap.xml');

for (const name of fs.readdirSync(path.join(root, 'assets/css')).filter((name) => name.endsWith('.css'))) {
  const file = path.join(root, 'assets/css', name);
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    checkLocalURL(match[1].trim(), file, path.relative(root, file));
  }
}

if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} production HTML pages and sitemap.xml.`);
}

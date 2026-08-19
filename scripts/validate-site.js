const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = [
  path.join(root, 'index.html'),
  ...fs.readdirSync(path.join(root, 'pages')).filter((f) => f.endsWith('.html')).map((f) => path.join(root, 'pages', f)),
  ...fs.readdirSync(path.join(root, 'cities')).filter((f) => f.endsWith('.html')).map((f) => path.join(root, 'cities', f)),
];
const problems = [];

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

  for (const match of text.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (!/\balt=["'][^"']*["']/i.test(attrs)) problems.push(`${relative}: image missing alt attribute`);
    if (!/\b(?:width|height)=["'][^"']+["']/i.test(attrs)) problems.push(`${relative}: image missing intrinsic dimensions`);
  }

  for (const match of text.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|javascript:|data:|\/)/i.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) problems.push(`${relative}: missing local asset ${target}`);
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('<urlset') || !sitemap.includes('</urlset>')) problems.push('sitemap.xml: malformed XML wrapper');
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!/^https:\/\/www\.eazdrones\.com\//.test(match[1])) problems.push(`sitemap.xml: invalid URL ${match[1]}`);
}

if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} production HTML pages and sitemap.xml.`);
}

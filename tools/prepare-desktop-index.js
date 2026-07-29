const fs = require('node:fs');
const path = require('node:path');

const [, , sourcePath, ...targetPaths] = process.argv;
if (!sourcePath || targetPaths.length === 0) {
  throw new Error('Usage: node tools/prepare-desktop-index.js <source-index> <target-index> [...]');
}

let html = fs.readFileSync(path.resolve(sourcePath), 'utf8');

const browserOnlyLines = [
  /^\s*<meta name="robots"[^>]*>\s*\r?\n/gm,
  /^\s*<meta name="google-site-verification"[^>]*>\s*\r?\n/gm,
  /^\s*<meta name="google-adsense-account"[^>]*>\s*\r?\n/gm,
  /^\s*<link rel="manifest"[^>]*>\s*\r?\n/gm,
  /^\s*<script async data-ad-client="[^"]+"[^>]*><\/script>\s*\r?\n/gm,
  /^\s*<link rel="stylesheet" href="browser-platform\.css">\s*\r?\n/gm,
  /^\s*<script src="browser-config\.js"><\/script>\s*\r?\n/gm,
  /^\s*<script src="browser-platform\.js"><\/script>\s*\r?\n/gm
];
for (const pattern of browserOnlyLines) html = html.replace(pattern, '');

html = html.replace(
  /\s*<script>\s*window\.adsbygoogle = window\.adsbygoogle \|\| \[\];[\s\S]*?window\.adConfig\(\{ preloadAdBreaks: 'on', sound: 'on' \}\);\s*<\/script>\s*/m,
  '\n'
);

const forbidden = [
  'href="browser-platform.css"',
  'src="browser-platform.js"',
  'src="browser-config.js"',
  'pagead2.googlesyndication.com',
  'google-adsense-account'
];
const leaked = forbidden.filter((token) => html.includes(token));
if (leaked.length) throw new Error(`Desktop index still contains browser-only tokens: ${leaked.join(', ')}`);
if (!html.includes('#rewarded-continue') || !html.includes('body.browser-build #rewarded-continue.is-active')) {
  throw new Error('Desktop fail-closed rewarded overlay guard is missing.');
}

for (const targetPath of targetPaths) {
  const absoluteTarget = path.resolve(targetPath);
  fs.mkdirSync(path.dirname(absoluteTarget), { recursive: true });
  fs.writeFileSync(absoluteTarget, html, 'utf8');
  process.stdout.write(`Prepared desktop index: ${absoluteTarget}\n`);
}

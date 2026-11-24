// Builds the home-screen icons (icons/*.png) from Pip in js/art.js: Pip on a perforated stamp, on the desk green.
//   node tools/make-icons.js
// Needs Google Chrome or Microsoft Edge installed (renders the SVG headless). Re-run after changing Pip.
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const out = path.join(root, 'icons');
fs.mkdirSync(out, { recursive: true });

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/art.js'), 'utf8'), sandbox);
const pip = sandbox.window.PMArt.pip.replace(/<svg [^>]*>/, '').replace(/<\/svg>\s*$/, '');

const DESK = '#1f3b33', CREAM = '#f4ecd8', EDGE = '#d6c6a2', SKY = '#bcd3e2';

// size: stamp width as a share of the icon. Maskable icons get cropped to a circle, so their stamp is smaller.
function iconSVG(size) {
  const S = 512, W = S * size, H = W * 1.16, x0 = (S - W) / 2, y0 = (S - H) / 2;
  const r = W * 0.034, gap = W / 11;
  const holes = [];
  for (let x = x0 + gap / 2; x < x0 + W; x += gap) holes.push([x, y0], [x, y0 + H]);
  for (let y = y0 + gap / 2; y < y0 + H; y += gap) holes.push([x0, y], [x0 + W, y]);
  const pad = W * 0.085, iw = W - pad * 2, ih = H - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <style>.f-h,.f-o{display:none}</style>
  <rect width="${S}" height="${S}" fill="${DESK}"/>
  <g transform="rotate(-4 ${S / 2} ${S / 2})">
    <rect x="${x0 + 6}" y="${y0 + 10}" width="${W}" height="${H}" fill="rgba(0,0,0,.28)"/>
    <rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="${CREAM}"/>
    ${holes.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${DESK}"/>`).join('')}
    <rect x="${x0 + pad}" y="${y0 + pad}" width="${iw}" height="${ih}" fill="${SKY}" stroke="${EDGE}" stroke-width="3"/>
    <svg x="${x0 + pad}" y="${y0 + pad + ih * 0.06}" width="${iw}" height="${ih * 0.94}" viewBox="4 4 112 126" preserveAspectRatio="xMidYMax meet">${pip}</svg>
  </g>
</svg>`;
}

const browser = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'
].find(p => fs.existsSync(p));
if (!browser) throw new Error('No Chrome or Edge found to render the icons.');

function render(svg, px, file) {
  const html = path.join(out, '_render.html');
  fs.writeFileSync(html, `<!doctype html><style>html,body{margin:0;background:${DESK}}svg{display:block;width:${px}px;height:${px}px}</style>${svg}`);
  execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${px},${px}`,
    `--screenshot=${path.join(out, file)}`, 'file:///' + html.replace(/\\/g, '/')], { stdio: 'ignore' });
  fs.unlinkSync(html);
  console.log('wrote icons/' + file);
}

const full = iconSVG(0.66), safe = iconSVG(0.52);
fs.writeFileSync(path.join(out, 'icon.svg'), full);
render(full, 512, 'icon-512.png');
render(full, 192, 'icon-192.png');
render(full, 180, 'apple-touch-icon.png');
render(safe, 512, 'maskable-512.png');

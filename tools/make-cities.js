// Builds tools/chain-src/cities.json: the hand-written city list plus every town in GeoNames
// "cities1000" that people might know.
//
//   node tools/make-cities.js path/to/cities1000.txt
//
// GeoNames (https://download.geonames.org/export/dump/cities1000.zip, CC BY 4.0) lists ~170,000
// places with 1,000+ people. We keep:
//   • US, Canada, UK, Ireland, Australia, New Zealand: every town of 1,000+ (Atherton, CA is ~7,000)
//   • everywhere else: towns of 15,000+
// Hand-written entries keep their tier. New ones are tiered by population.
const fs = require('fs'), path = require('path');
const src = process.argv[2];
if (!src) { console.error('usage: node tools/make-cities.js cities1000.txt'); process.exit(1); }

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, 'and').replace(/^\s*the\s+/, '').replace(/[^a-z0-9]/g, '');
const hand = JSON.parse(fs.readFileSync(path.join(__dirname, 'chain-src', 'cities-hand.json'), 'utf8'));
const handKeys = new Set();
for (const list of Object.values(hand.tiers)) for (const s of list) for (const n of s.replace(/\|same:.*/, '').split('|')) handKeys.add(norm(n));
for (const s of Object.keys(hand.nope || {})) for (const n of s.split('|')) handKeys.add(norm(n));

const EN = new Set(['US', 'CA', 'GB', 'IE', 'AU', 'NZ']);
const KEEP = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG', 'PPLS']);
const LATIN = /^[\p{Script=Latin} .'’-]+$/u;

const places = new Map();   // key → { names:Set, pop, cc }
for (const line of fs.readFileSync(src, 'utf8').split('\n')) {
  const f = line.split('\t');
  if (f.length < 15 || !KEEP.has(f[7])) continue;
  const cc = f[8], pop = +f[14] || 0;
  if (pop < (EN.has(cc) ? 1000 : 15000)) continue;
  const names = [f[1], f[2]].map(s => s.trim()).filter(s => s && LATIN.test(s) && s.length <= 30);
  if (!names.length) continue;
  const key = norm(names[0]);
  if (key.length < 3) continue;
  const p = places.get(key) || { names: new Set(), pop: 0, en: false };
  names.forEach(n => p.names.add(n));
  if (pop > p.pop) { p.pop = pop; p.display = names[0]; }
  p.en = p.en || EN.has(cc);
  places.set(key, p);
}

// Other spellings people type: St/Saint, Ft/Fort, Mt/Mount.
const SHORT = [[/^Saint /, 'St '], [/^St\.? /, 'Saint '], [/^Fort /, 'Ft '], [/^Ft\.? /, 'Fort '], [/^Mount /, 'Mt '], [/^Mt\.? /, 'Mount ']];
const tiers = { common: [], uncommon: [], rare: [], legendary: [] };
let added = 0;
for (const [key, p] of places) {
  const names = [p.display, ...[...p.names].filter(n => n !== p.display)];
  for (const n of [...names]) for (const [re, rep] of SHORT) if (re.test(n)) names.push(n.replace(re, rep));
  const keys = names.map(norm);
  if (keys.some(k => handKeys.has(k))) continue;
  const uniq = names.filter((n, i) => keys.indexOf(keys[i]) === i);
  const tier = p.en ? (p.pop >= 100000 ? 'uncommon' : p.pop >= 20000 ? 'rare' : 'legendary')
                    : (p.pop >= 1000000 ? 'uncommon' : p.pop >= 150000 ? 'rare' : 'legendary');
  tiers[tier].push(uniq.join('|'));
  keys.forEach(k => handKeys.add(k));
  added++;
}
const out = {
  ...hand,
  sources: ['hand-written list', 'GeoNames cities1000 (CC BY 4.0, geonames.org)'],
  tiers: Object.fromEntries(Object.keys(tiers).map(t => [t, [...(hand.tiers[t] || []), ...tiers[t]]]))
};
fs.writeFileSync(path.join(__dirname, 'chain-src', 'cities.json'), JSON.stringify(out, null, 1));
console.log(`added ${added} towns from GeoNames:`, Object.entries(tiers).map(([k, v]) => `${k} +${v.length}`).join(', '));

// Where a Chain Letter list runs thin, and a check for new answers before they're merged.
//
//   node tools/chain-gaps.js desserts          letters answers end in vs. how many answers start with them
//   node tools/chain-gaps.js desserts E        every answer that starts with E (so you don't repeat one)
//   node tools/chain-gaps.js desserts --check  checks tools/chain-src/add/desserts.json: format, repeats
//
// New answers go in tools/chain-src/add/<id>.json as { "tiers": { "common": [], "uncommon": [], "rare": [], "legendary": [] } },
// same string format as the main list ("Name|Other spelling"). tools/merge-chain-adds.js folds them in.
const fs = require('fs'), path = require('path');
const TIERS = ['common', 'uncommon', 'rare', 'legendary'];
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, 'and').replace(/^\s*the\s+/, '').replace(/[^a-z0-9]/g, '');
const [id, arg] = process.argv.slice(2);
if (!id) { console.log('usage: node tools/chain-gaps.js <id> [LETTER | --check]'); process.exit(1); }
const SRC = path.join(__dirname, 'chain-src');
const main = JSON.parse(fs.readFileSync(path.join(SRC, id + '.json'), 'utf8'));
const addPath = path.join(SRC, 'add', id + '.json');
const add = fs.existsSync(addPath) ? JSON.parse(fs.readFileSync(addPath, 'utf8')) : { tiers: {} };
const names = s => s.replace(/\|same:.*$/, '').split('|').map(n => n.replace(/\([^)]*\)/g, '').trim()).filter(Boolean);
const rows = d => TIERS.flatMap(t => ((d.tiers || {})[t] || []).map(s => ({ t, s, names: names(s) })));
const mainRows = rows(main), addRows = rows(add);

if (arg === '--check') {
  const seen = new Map();
  mainRows.forEach(r => r.names.forEach(n => seen.set(norm(n), `main/${r.t}: ${r.s}`)));
  let bad = 0;
  const local = new Map();
  for (const t of Object.keys(add.tiers || {})) if (!TIERS.includes(t)) { console.log(`!! unknown tier "${t}"`); bad++; }
  for (const r of addRows) {
    if (typeof r.s !== 'string' || !r.names.length) { console.log(`!! not a name: ${JSON.stringify(r.s)}`); bad++; continue; }
    for (const n of r.names) {
      const k = norm(n);
      if (k.length < 2 || n.length > 40) { console.log(`!! too short/long: ${n}`); bad++; }
      if (seen.has(k)) { console.log(`dup  ${n}  (already ${seen.get(k)})`); bad++; }
      if (local.has(k)) { console.log(`dup  ${n}  (twice in add file: ${local.get(k)})`); bad++; }
      local.set(k, r.s);
    }
  }
  console.log(`${addRows.length} new answers, ${bad} problems`);
  process.exit(0);
}

const all = [...mainRows, ...addRows];
if (arg && /^[a-z]$/i.test(arg)) {
  const L = arg.toLowerCase();
  const hit = all.filter(r => r.names.some(n => norm(n)[0] === L));
  console.log(hit.map(r => r.names.join(' | ')).sort().join('\n'));
  console.log(`\n${hit.length} answers start with ${L.toUpperCase()}`);
  process.exit(0);
}
const starts = {}, ends = {};
for (const r of all) {
  for (const L of new Set(r.names.map(n => norm(n)[0]).filter(Boolean))) starts[L] = (starts[L] || 0) + 1;
  const e = norm(r.names[0]).replace(/[^a-z]/g, '').slice(-1); ends[e] = (ends[e] || 0) + 1;
}
console.log(`${id}: ${mainRows.length} answers + ${addRows.length} new`);
console.log('letter  answers ending in it  answers starting with it');
for (const L of 'abcdefghijklmnopqrstuvwxyz') {
  const e = ends[L] || 0, s = starts[L] || 0, share = e / all.length;
  const flag = share >= 0.03 && s < 40 ? '  <- chains get stuck here' : '';
  console.log(`  ${L.toUpperCase()}     ${String(e).padStart(5)} (${(share * 100).toFixed(0).padStart(2)}%)          ${String(s).padStart(5)}${flag}`);
}

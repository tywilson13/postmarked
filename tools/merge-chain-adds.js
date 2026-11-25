// Folds tools/chain-src/add/<id>.json into tools/chain-src/<id>.json (skipping anything already there),
// then deletes the add file. Run tools/build-chain.js afterwards.
//   node tools/merge-chain-adds.js            all add files
//   node tools/merge-chain-adds.js desserts   just one
const fs = require('fs'), path = require('path');
const TIERS = ['common', 'uncommon', 'rare', 'legendary'];
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, 'and').replace(/^\s*the\s+/, '').replace(/[^a-z0-9]/g, '');
const SRC = path.join(__dirname, 'chain-src'), ADD = path.join(SRC, 'add');
const only = process.argv[2];
const files = fs.existsSync(ADD) ? fs.readdirSync(ADD).filter(f => f.endsWith('.json') && (!only || f === only + '.json')) : [];
for (const f of files) {
  const mainPath = path.join(SRC, f);
  if (!fs.existsSync(mainPath)) { console.log(`!! ${f}: no main list`); continue; }
  const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
  let add;
  try { add = JSON.parse(fs.readFileSync(path.join(ADD, f), 'utf8')); } catch (e) { console.log(`!! ${f}: bad JSON (${e.message})`); continue; }
  const seen = new Set();
  TIERS.forEach(t => (main.tiers[t] || []).forEach(s => s.replace(/\|same:.*$/, '').split('|').forEach(n => seen.add(norm(n)))));
  let n = 0, skipped = 0;
  for (const t of TIERS) for (const s of (add.tiers || {})[t] || []) {
    if (typeof s !== 'string') { skipped++; continue; }
    const keys = s.replace(/\|same:.*$/, '').split('|').map(norm).filter(Boolean);
    if (!keys.length || keys.some(k => seen.has(k))) { skipped++; continue; }
    keys.forEach(k => seen.add(k));
    (main.tiers[t] = main.tiers[t] || []).push(s);
    n++;
  }
  main.sources = [...new Set([...(main.sources || []), 'own knowledge (letter-gap expansion)'])];
  fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + '\n');
  fs.unlinkSync(path.join(ADD, f));
  console.log(`${f.replace('.json', '').padEnd(20)} +${n}${skipped ? `  (skipped ${skipped} repeats)` : ''}`);
}

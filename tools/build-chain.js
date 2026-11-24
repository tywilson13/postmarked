// Turns every answer list in tools/chain-src/*.json into the files the game loads:
//   js/data/chain/index.js    — one line per prompt (name, noun, opening words). Always loaded.
//   js/data/chain/<id>.js     — the full answer list. Loaded only on the day that prompt comes up.
//
//   node tools/build-chain.js            (build everything, print a report)
//   node tools/build-chain.js --check    (report only, write nothing)
//
// It also cleans the lists: drops notes in brackets, duplicates (first, most common tier wins),
// aliases that belong to another entry, and opening words that aren't in the list.
const fs = require('fs'), path = require('path');
const srcArg = process.argv.find(a => a.startsWith('--src='));
const SRC = srcArg ? path.resolve(srcArg.slice(6)) : path.join(__dirname, 'chain-src'), OUT = path.join(__dirname, '..', 'js', 'data', 'chain');
const CHECK = process.argv.includes('--check');
const TIERS = ['common', 'uncommon', 'rare', 'legendary'];
const SKIP = new Set(['cities-hand.json', 'bad-cartoon.json', 'bad-super.json']);   // input to make-cities.js, not a prompt
// Which descriptor words ("baked", "giant", "wild"…) a prompt accepts in front of a known answer. See DESCRIPTORS in games.js.
const KIND = {
  animals: 'dog-breeds birds sea-creatures bugs mammals reptiles',
  foods: 'fruits vegetables cheeses desserts baked-goods herbs-spices dishes pasta-noodles candy drinks sauces snacks',
  plants: 'flowers trees'
};
const kindOf = id => Object.keys(KIND).find(k => KIND[k].split(' ').includes(id)) || null;

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, 'and').replace(/^\s*the\s+/, '').replace(/[^a-z0-9]/g, '');
const clean = s => String(s).replace(/\([^)]*\)|\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim().replace(/^[,.;:\s]+|[,.;:\s]+$/g, '');
const lastLetter = s => norm(s).replace(/[^a-z]/g, '').slice(-1);

const report = [];
const index = {};
if (!CHECK) fs.mkdirSync(OUT, { recursive: true });
const files = fs.readdirSync(SRC).filter(f => f.endsWith('.json') && !SKIP.has(f)).sort();
for (const f of files) {
  let d;
  try { d = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')); } catch (e) { report.push(`!! ${f}: bad JSON (${e.message})`); continue; }
  const id = d.id || f.replace(/\.json$/, '');
  const seen = new Map();           // key → tier, across the whole list
  const tiers = {}; let dropped = 0, dupes = 0, total = 0;
  for (const t of TIERS) {
    tiers[t] = [];
    for (const raw of (d.tiers && d.tiers[t]) || []) {
      if (typeof raw !== 'string') { dropped++; continue; }
      const same = raw.match(/\|same:(.+)$/);
      const names = raw.replace(/\|same:.*$/, '').split('|').map(clean).filter(n => n && n.length <= 40 && norm(n).length >= 2);
      const keep = names.filter((n, i) => { const k = norm(n); return names.findIndex(m => norm(m) === k) === i && !seen.has(k); });
      if (!keep.length || (!same && seen.has(norm(names[0])))) { names.length ? dupes++ : dropped++; continue; }
      keep.forEach(n => seen.set(norm(n), t));
      tiers[t].push(keep.join('|') + (same ? '|same:' + same[1] : ''));
      total++;
    }
  }
  const nope = {};
  for (const [k, msg] of Object.entries(d.nope || {})) {
    const names = k.split('|').map(clean).filter(n => n && !seen.has(norm(n)));   // never refuse a real answer
    if (names.length && typeof msg === 'string') nope[names.join('|')] = msg;
  }
  // Opening words must be real Common answers that don't end in a dead letter.
  const firsts = {}, ends = {};
  for (const t of TIERS) for (const s of tiers[t]) {
    const names = s.replace(/\|same:.*$/, '').split('|');
    for (const L of new Set(names.map(n => norm(n)[0]).filter(Boolean))) firsts[L] = (firsts[L] || 0) + 1;
    const e = lastLetter(names[0]); ends[e] = (ends[e] || 0) + 1;
  }
  const ok = s => seen.get(norm(s)) === 'common' && (firsts[lastLetter(s)] || 0) >= 8;
  let starts = (d.starts || []).map(clean).filter(ok);
  if (starts.length < 8) starts = [...new Set([...starts, ...tiers.common.map(s => s.split('|')[0]).filter(ok)])].slice(0, 12);
  // Letters answers often end in, but few answers start with: chains get stuck there.
  const thin = Object.entries(ends).filter(([L, n]) => n >= total * 0.03 && (firsts[L] || 0) < 10).map(([L]) => `${L.toUpperCase()}(${firsts[L] || 0})`);
  const counts = TIERS.map(t => tiers[t].length).join('/');
  report.push(`${id.padEnd(20)} ${String(total).padStart(6)}  ${counts.padEnd(20)} starts:${String(starts.length).padStart(2)}` +
    (dupes || dropped ? `  cleaned:${dupes + dropped}` : '') + (thin.length ? `  thin: ${thin.join(' ')}` : ''));
  if (total < 150) { report.push(`!! ${id}: only ${total} answers, left out`); continue; }
  const body = `// Chain Letter answers: ${d.plural}. Built by tools/build-chain.js from tools/chain-src/${f}. Sources: ${(d.sources || []).join('; ')}\n` +
    `(window.PM_CHAIN = window.PM_CHAIN || {})[${JSON.stringify(id)}] = ${JSON.stringify({ tiers, nope })};\n`;
  // v changes whenever the list does, so browsers fetch the new file instead of a cached one.
  const v = require('crypto').createHash('md5').update(body).digest('hex').slice(0, 8);
  index[id] = { noun: d.noun, plural: d.plural, starts, kind: kindOf(id), size: total, v };
  if (!CHECK) fs.writeFileSync(path.join(OUT, id + '.js'), body);
}
if (!CHECK) fs.writeFileSync(path.join(OUT, 'index.js'),
  '// Chain Letter prompts. Built by tools/build-chain.js. Each answer list lives in its own file and loads on its day.\n' +
  'window.PM_CHAIN_INDEX = ' + JSON.stringify(index, null, 1) + ';\n');
console.log('id                    total  c/u/r/l              starts');
console.log(report.join('\n'));
console.log(`\n${Object.keys(index).length} prompts${CHECK ? ' (check only)' : ` written to ${path.relative(process.cwd(), OUT)}`}`);

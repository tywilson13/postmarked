// Builds tools/chain-src/girls-names.json and boys-names.json from US Social Security baby-name data.
//
//   node tools/make-names.js path/to/baby-names.csv
//
// Source: https://github.com/hadley/data-baby-names (SSA top 1,000 names per year, 1880–2008, public domain).
// Popularity is the share of babies given the name, summed over the years, with births since 1940
// counting double (those are the names of people alive today). Tiers by popularity rank.
const fs = require('fs'), path = require('path');
const src = process.argv[2];
if (!src) { console.error('usage: node tools/make-names.js baby-names.csv'); process.exit(1); }

const score = { boy: new Map(), girl: new Map() };
for (const line of fs.readFileSync(src, 'utf8').split('\n').slice(1)) {
  const m = line.match(/^(\d+),"([^"]+)",([\d.e-]+),"(boy|girl)"/);
  if (!m) continue;
  const [, year, name, pct, sex] = m;
  const w = +year >= 1940 ? 2 : 1;
  score[sex].set(name, (score[sex].get(name) || 0) + w * +pct);
}
// Rank cut-offs: the top 250 are Common, then Scarce to 1,000, Rare to 3,000, the rest Priceless.
const CUTS = [['common', 250], ['uncommon', 1000], ['rare', 3000], ['legendary', Infinity]];
const STARTS = {
  girl: ['Emma', 'Olivia', 'Sarah', 'Grace', 'Anna', 'Rose', 'Claire', 'Julia', 'Hannah', 'Laura', 'Megan', 'Rachel'],
  boy: ['James', 'Daniel', 'Ethan', 'Noah', 'Ryan', 'Owen', 'Adam', 'Nathan', 'Luke', 'Oliver', 'Samuel', 'Michael']
};
for (const sex of ['girl', 'boy']) {
  const ranked = [...score[sex]].sort((a, b) => b[1] - a[1]).map(([n]) => n);
  const tiers = { common: [], uncommon: [], rare: [], legendary: [] };
  ranked.forEach((n, i) => tiers[CUTS.find(([, c]) => i < c)[0]].push(n));
  const id = sex === 'girl' ? 'girls-names' : 'boys-names';
  const out = {
    id, noun: sex === 'girl' ? 'girl’s name' : 'boy’s name', plural: sex === 'girl' ? 'Girls’ names' : 'Boys’ names',
    sources: ['US Social Security baby names, top 1,000 per year 1880–2008 (via github.com/hadley/data-baby-names)'],
    starts: STARTS[sex], tiers,
    nope: {}
  };
  fs.writeFileSync(path.join(__dirname, 'chain-src', id + '.json'), JSON.stringify(out, null, 1));
  console.log(id, ranked.length, Object.entries(tiers).map(([k, v]) => `${k}:${v.length}`).join(' '));
}

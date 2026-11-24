// Builds each day's mail from the content banks, so the game never runs out.
// Every day: Chain Letter → one rotating game → The Postal Scale → Who Sent This?
// The same issue number always builds the same day, for everyone.
(function () {
  'use strict';

  // ───────── seeded shuffles ─────────
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const permCache = {};
  function perm(n, salt) {
    const key = n + '|' + salt;
    if (permCache[key]) return permCache[key];
    const r = mulberry32(hash('postmarked:' + salt));
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return (permCache[key] = a);
  }
  // The k-th item of a list in a fixed shuffled order. Each pass through the list is shuffled differently.
  function nth(list, k, salt) {
    const n = list.length;
    return list[perm(n, salt + ':' + Math.floor(k / n))[k % n]];
  }
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');

  // ───────── banks ─────────
  const CLASSIC = window.POSTMARKED_DAYS || [];      // the five original handmade days
  const senders = [...CLASSIC.map(d => d.sender), ...(window.PM_SENDERS || [])];
  const missorted = [...CLASSIC.map(d => d.missorted), ...(window.PM_MISSORTED || [])];
  const scale = [...CLASSIC.flatMap(d => d.scale), ...(window.PM_SCALE || [])];
  const places = window.PM_PLACES || [];
  const themes = window.PM_THEMES || [];

  const ROTATION = ['places', 'cross', 'missorted'];
  const SCALE_PER_DAY = 3;

  // ───────── Chain Letter categories ─────────
  const CHAIN = {
    animals: { noun: 'animal', plural: 'Animals', starts: ['Penguin', 'Zebra', 'Elephant', 'Tiger', 'Rabbit', 'Kangaroo', 'Giraffe', 'Hamster', 'Dolphin', 'Panda', 'Yak', 'Dachshund'] },
    countries: { noun: 'country', plural: 'Countries', starts: ['Cuba', 'Brazil', 'Japan', 'Canada', 'Italy', 'Kenya', 'Peru', 'Portugal', 'Iceland', 'Mexico', 'Egypt', 'Norway'] },
    foods: { noun: 'food', plural: 'Foods' },
    cities: { noun: 'city', plural: 'Cities' },
    plants: { noun: 'plant', plural: 'Plants & flowers' },
    jobs: { noun: 'job', plural: 'Jobs' }
  };
  // The narrow prompts ("Name a dog breed") come from js/data/chain/index.js; their answer lists load on the day.
  // A prompt there replaces a built-in category of the same name (cities).
  const chainInfo = k => (window.PM_CHAIN_INDEX || {})[k] || CHAIN[k];
  // Prompts in the same family never come on consecutive days (no fruits straight after vegetables).
  const FAMILY = {
    animals: 'animals dog-breeds birds sea-creatures bugs mammals reptiles pokemon',
    foods: 'foods fruits vegetables cheeses desserts baked-goods herbs-spices dishes pasta-noodles candy drinks sauces snacks',
    plants: 'plants flowers trees',
    places: 'countries cities rivers mountains islands capitals landmarks lakes-seas',
    names: 'girls-names boys-names',
    screen: 'movies tv-shows video-games cartoon-characters superheroes books board-games',
    people: 'artists authors scientists athletes musicians jobs'
  };
  const familyOf = k => Object.keys(FAMILY).find(f => FAMILY[f].split(' ').includes(k)) || k;
  function chainOrder(cats) {
    const order = perm(cats.length, 'chaincat:order').map(i => cats[i]);
    for (let i = 1; i < order.length; i++) {
      if (familyOf(order[i]) !== familyOf(order[i - 1])) continue;
      const j = order.findIndex((c, n) => n > i && familyOf(c) !== familyOf(order[i - 1]) && (n + 1 >= order.length || familyOf(order[n + 1]) !== familyOf(order[i])));
      if (j > 0) [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }
  const chainCats = () => [...new Set([...Object.keys(CHAIN).filter(k => window.PM_LEXICON && window.PM_LEXICON[k]), ...Object.keys(window.PM_CHAIN_INDEX || {})])];

  // ───────── The Postal Scale: move the window so the answer isn't near the middle ─────────
  // Hand-written ranges tend to sit the answer near the centre of the dial. Each question keeps its
  // span (so scoring is unchanged) but slides to a seeded spot, with the answer anywhere from 10% to 90%.
  const niceStep = x => { const p = Math.pow(10, Math.floor(Math.log10(x))); const m = x / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; };
  const niceDown = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); return [5, 2, 1].map(m => m * p).find(c => c <= v) || p; };
  const niceUp = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); return [1, 2, 5, 10].map(m => m * p).find(c => c >= v); };
  function reframe(q) {
    const r = mulberry32(hash('frame:' + q.q));
    const a = q.answer, span = q.max - q.min;
    const floor = q.year ? -Infinity : q.min >= 0 ? 0 : -Infinity;
    const ceil = q.unit === '%' ? 100 : Infinity;
    const posOf = (lo, hi) => q.log ? Math.log(a / lo) / Math.log(hi / lo) : (a - lo) / (hi - lo);
    for (let tries = 0; tries < 16; tries++) {
      const p = 0.1 + 0.8 * r();
      if (Math.abs(p - 0.5) < 0.14) continue;
      let lo, hi;
      if (q.log) {
        const R = q.max / q.min;
        lo = niceDown(a / Math.pow(R, p)); hi = niceUp(lo * R);
      } else {
        lo = Math.max(floor, a - p * span);
        hi = Math.min(ceil, lo + span);
        const step = q.year ? Math.max(5, niceStep(span / 12)) : niceStep(span / 12);
        lo = Math.max(floor, Math.floor(lo / step) * step);
        hi = Math.min(ceil, Math.ceil(hi / step) * step);
      }
      const pos = posOf(lo, hi);
      if (lo < a && a < hi && pos >= 0.08 && pos <= 0.92 && Math.abs(pos - 0.5) >= 0.1) return { ...q, min: lo, max: hi, span };
    }
    return { ...q, span };
  }

  // ───────── Cross Post: fit 4–5 theme words into a small crossword ─────────
  // Greedy placement: each new word must cross the grid, never touch a word side-on, and keep
  // the grid within MAX × MAX. Tries a few seeded orders and keeps the fullest, most compact grid.
  const GRID_MAX = 9, GRID_WORDS = 5;
  function fitGrid(words, rnd) {
    const cells = new Map();                       // "r,c" → { ch, dirs: Set }
    const placed = [];
    const at = (r, c) => cells.get(r + ',' + c);
    const bounds = extra => {
      let r0 = Infinity, r1 = -Infinity, c0 = Infinity, c1 = -Infinity;
      const see = (r, c) => { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); };
      cells.forEach((_, k) => { const [r, c] = k.split(',').map(Number); see(r, c); });
      (extra || []).forEach(([r, c]) => see(r, c));
      return { r0, r1, c0, c1, rows: r1 - r0 + 1, cols: c1 - c0 + 1 };
    };
    function fits(w, r, c, dir) {
      const dr = dir === 'd' ? 1 : 0, dc = dir === 'a' ? 1 : 0;
      if (at(r - dr, c - dc) || at(r + dr * w.length, c + dc * w.length)) return -1;   // nothing directly before or after
      let crosses = 0;
      const path = [];
      for (let i = 0; i < w.length; i++) {
        const rr = r + dr * i, cc = c + dc * i, cell = at(rr, cc);
        path.push([rr, cc]);
        if (cell) {
          if (cell.ch !== w[i] || cell.dirs.has(dir)) return -1;
          crosses++;
        } else if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return -1;            // no side-by-side letters
      }
      const b = bounds(path);
      if (b.rows > GRID_MAX || b.cols > GRID_MAX) return -1;
      return crosses ? crosses * 100 - b.rows * b.cols : -1;
    }
    function put(w, r, c, dir, item) {
      const dr = dir === 'd' ? 1 : 0, dc = dir === 'a' ? 1 : 0, path = [];
      for (let i = 0; i < w.length; i++) {
        const k = (r + dr * i) + ',' + (c + dc * i);
        const cell = cells.get(k) || { ch: w[i], dirs: new Set() };
        cell.dirs.add(dir); cells.set(k, cell); path.push([r + dr * i, c + dc * i]);
      }
      placed.push({ ...item, dir, cells: path });
    }
    const pool = words.slice();
    const first = pool.splice(pool.findIndex(x => x.w.length >= 5 && x.w.length <= 7) >= 0 ? pool.findIndex(x => x.w.length >= 5 && x.w.length <= 7) : 0, 1)[0];
    put(first.w, 0, 0, rnd() < 0.5 ? 'a' : 'd', first);
    for (const item of pool) {
      if (placed.length >= GRID_WORDS) break;
      let best = null;
      cells.forEach((cell, k) => {
        const [r, c] = k.split(',').map(Number);
        for (let i = 0; i < item.w.length; i++) {
          if (item.w[i] !== cell.ch) continue;
          ['a', 'd'].forEach(dir => {
            const r1 = dir === 'd' ? r - i : r, c1 = dir === 'a' ? c - i : c;
            const s = fits(item.w, r1, c1, dir);
            if (s >= 0 && (!best || s > best.s)) best = { s, r: r1, c: c1, dir };
          });
        }
      });
      if (best) put(item.w, best.r, best.c, best.dir, item);
    }
    const b = bounds();
    // Normalise to start at 0,0 and number the words in reading order, like a printed crossword.
    const out = placed.map(p => ({ w: p.w, clue: p.clue, dir: p.dir, cells: p.cells.map(([r, c]) => [r - b.r0, c - b.c0]) }));
    const starts = [...new Set(out.map(p => p.cells[0].join(',')))].map(k => k.split(',').map(Number)).sort((a, b2) => a[0] - b2[0] || a[1] - b2[1]);
    out.forEach(p => { p.num = starts.findIndex(s => s[0] === p.cells[0][0] && s[1] === p.cells[0][1]) + 1; });
    out.sort((a, b2) => (a.dir === b2.dir ? a.num - b2.num : a.dir === 'a' ? -1 : 1));
    return { words: out, rows: b.rows, cols: b.cols };
  }
  function crossFor(theme, salt) {
    const rnd = mulberry32(hash('grid:' + salt + theme.theme));
    let best = null;
    for (let t = 0; t < 40; t++) {
      const order = theme.words.slice();
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const g = fitGrid(order, rnd);
      const score = g.words.length * 1000 - g.rows * g.cols + (Math.abs(g.rows - g.cols) <= 3 ? 20 : 0);
      if (!best || score > best.score) best = { ...g, score };
      if (g.words.length >= GRID_WORDS && g.rows * g.cols <= 64) break;
    }
    return { theme: theme.theme, level: theme.level, ...best };
  }

  // ───────── the day ─────────
  // The classic days go first, then every new entry once, then the whole bank reshuffled.
  function fromBank(bank, k, salt) {
    const C = CLASSIC.length, fresh = bank.length - C;
    if (k < C) return bank[k];
    if (k - C < fresh) return bank[C + nth(Array.from({ length: fresh }, (_, i) => i), k - C, salt)];
    return nth(bank, k - C - fresh, salt + ':again');
  }
  const byLevel = (list, test) => list.filter(x => test(x.level || 2));

  function build(issue) {
    const k = Math.max(0, issue - 1);
    const game = ROTATION[k % ROTATION.length];
    const j = Math.floor(k / ROTATION.length);  // how many times today's rotating game has come round before
    const day = { issue, route: ['chain', game, 'scale', 'sender'], game };

    // Chain Letter every day, walking the categories in a fixed order so none comes twice in a row.
    const cats = chainCats();
    const category = chainOrder(cats)[k % cats.length];
    const info = chainInfo(category), lex = (window.PM_CHAIN_INDEX || {})[category] ? null : window.PM_LEXICON[category];
    const starts = info.starts || lex.starts || lex.tiers.common.map(s => s.split('|')[0]);
    day.chain = { category, noun: info.noun, plural: info.plural, kind: info.kind || category, start: nth(starts, Math.floor(k / cats.length), 'start:' + category) };
    day.theme = `Chain Letter: ${info.plural}`;

    day.scale = Array.from({ length: SCALE_PER_DAY }, (_, i) => reframe(nth(scale, k * SCALE_PER_DAY + i, 'scale')));

    if (game === 'places') {
      // One easy, one middling and one tricky postcard.
      day.places = [1, 2, 3].map(L => nth(byLevel(places, l => l === L), j, 'place' + L));
    } else if (game === 'cross') {
      day.cross = themes.length ? crossFor(nth(themes, j, 'theme'), issue) : null;
    } else {
      day.missorted = nth(missorted, j, 'missorted');
    }

    // Don't let another game give the sender away.
    const spoilers = new Set([day.chain.start, ...(day.cross ? day.cross.words.map(w => w.w) : [])].map(norm));
    let sender = fromBank(senders, k, 'sender');
    for (let n = 0; n < senders.length && sender.answers.split('|').some(a => spoilers.has(norm(a))); n++) sender = senders[(senders.indexOf(sender) + 1) % senders.length];
    day.sender = sender;
    return day;
  }

  window.PMDaily = {
    build,
    counts: () => ({ senders: senders.length, missorted: missorted.length, scale: scale.length, places: places.length, themes: themes.length, chain: chainCats() }),
    _nth: nth, _reframe: reframe, _crossFor: crossFor
  };
})();

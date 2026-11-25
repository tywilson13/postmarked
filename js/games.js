// The deliveries. Each game gets (stage, data, ctx):
//   ctx.run() / ctx.pause()  — the route clock (already running when a game starts;
//                              games pause it while the player reads a reveal)
//   ctx.done({ score 0-100, emoji, recap html })
// Design rule: every game has a floor (anyone scores something) and a ceiling (room to shine).
(function () {
  'use strict';

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const shake = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  // A stamp hitting the desk: the card it lands on gives a little bump.
  const thud = el => { if (!el) return; el.classList.remove('thud'); void el.offsetWidth; el.classList.add('thud'); };
  const sfx = name => window.PMSound && PMSound.play(name);
  const fmtNum = n => Math.round(n).toLocaleString();
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // Every game has a host from the sorting office who sits above it and reacts as you play.
  // Clears `root`, adds the host, and returns { body, say }. Games render into `body`.
  function withHost(root, id, first) {
    const h = PMArt.hostFor(id);
    root.innerHTML = `<div class="host-bar enter"><div class="host-art">${h.svg}</div><div class="bubble"><span class="host-name">${esc(h.name)} the ${esc(h.kind)}</span><span class="bubble-text"></span></div></div><div class="game-body"></div>`;
    const bar = root.querySelector('.host-bar'), text = bar.querySelector('.bubble-text');
    let t = null;
    const say = (msg, mood) => {
      text.innerHTML = msg;
      bar.classList.remove('mood-happy', 'mood-oops', 'hop');
      void bar.offsetWidth;
      clearTimeout(t);
      if (mood) { bar.classList.add('mood-' + mood, 'hop'); t = setTimeout(() => bar.classList.remove('mood-' + mood), 2200); }
    };
    if (first) say(first);
    return { body: root.querySelector('.game-body'), say };
  }

  // ───────── answer matching (shared) ─────────
  const TIERS = [
    { key: 'common', name: 'Common', emoji: '⚪', pts: 8 },
    { key: 'uncommon', name: 'Scarce', emoji: '🟢', pts: 12 },
    { key: 'rare', name: 'Rare', emoji: '🔵', pts: 16 },
    { key: 'legendary', name: 'Priceless', emoji: '🌟', pts: 20 }
  ];
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, 'and').replace(/^\s*the\s+/, '').replace(/[^a-z0-9]/g, '');
  function lev(a, b, max = 2) {
    if (Math.abs(a.length - b.length) > max) return 9;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return dp[a.length][b.length];
  }
  // How a word sounds, roughly: soft/hard c, ph, doubled letters and vowel spellings all collapse, so
  // "millefioule" and "millefeuille" both come out as "malafala". The first letter is kept as typed.
  const sound = k => k[0] + k.slice(1)
    .replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/c(?=[eiy])/g, 's').replace(/[cq]/g, 'k').replace(/x/g, 'ks').replace(/z/g, 's')
    .replace(/gh/g, '').replace(/[0-9]/g, '').replace(/([^aeiouy])h/g, '$1').replace(/[aeiouy]+/g, 'a').replace(/(.)\1+/g, '$1').replace(/a$/, '');
  // lex: { tiers: {common:[...], ...}, nope: {"A|B": msg} }. An entry keeps every spelling: names[k] ↔ keys[k].
  function buildIndex(lex) {
    const entries = [], nopes = [], seen = new Set(), aliases = [];
    TIERS.forEach(t => (lex.tiers[t.key] || []).forEach(str => {
      const same = str.match(/\|same:(.+)$/);
      if (same) { aliases.push({ to: norm(same[1]), names: str.slice(0, same.index).split('|') }); return; }
      const names = str.split('|');
      const keys = names.map(norm);
      if (seen.has(keys[0])) return; // a name listed twice keeps its first (lowest) tier
      seen.add(keys[0]);
      entries.push({ id: keys[0], display: names[0], names, keys, tier: t });
    }));
    aliases.forEach(a => {
      const e = entries.find(x => x.keys.includes(a.to));
      if (e) a.names.forEach(n => { if (!e.keys.includes(norm(n))) { e.names.push(n); e.keys.push(norm(n)); } });
    });
    Object.entries(lex.nope || {}).forEach(([str, msg]) => nopes.push({ keys: str.split('|').map(norm), msg }));
    // Lookups: every spelling by its key, and by first letter for typo matching. Lists can be tens of thousands long.
    const byKey = new Map(), byFirst = new Map();
    const add = e => e.keys.forEach((key, k) => {
      if (!byKey.has(key)) byKey.set(key, { e, k });
      if (!byFirst.has(key[0])) byFirst.set(key[0], []);
      byFirst.get(key[0]).push({ e, k, key, snd: sound(key) });
    });
    entries.forEach(add);
    return { entries, nopes, byKey, byFirst, add: e => { entries.push(e); add(e); return e; } };
  }
  function matchAnswer(idx, raw) {
    const v = norm(raw);
    if (!v) return null;
    const variants = [v, v.replace(/s$/, ''), v.replace(/es$/, ''), v.replace(/ies$/, 'y'), v.replace(/ves$/, 'f'), v.replace(/oes$/, 'o')];
    const tolOf = key => key.length >= 9 ? 2 : key.length >= 5 ? 1 : 0;
    const find = (list, test) => { for (const e of list) for (let k = 0; k < e.keys.length; k++) if (test(e.keys[k])) return { e, k }; return null; };
    const n1 = find(idx.nopes, key => variants.includes(key)); if (n1) return { nope: n1.e.msg };
    let e1 = null, fuzzy = false;
    for (const x of variants) if ((e1 = idx.byKey.get(x))) break;
    if (!e1) {
      // Closest spelling among answers with the same first letter; ties go to the more common answer.
      // Two ways to be close: a few letters off (more allowed on longer words), or spelled the way it sounds
      // ("millefioule" for mille-feuille, "creembrulay" for crème brûlée).
      const vs = sound(v), vl = v.replace(/s$/, '');
      let best = 99;
      for (const c of idx.byFirst.get(v[0]) || []) {
        const len = c.key.length, tol = tolOf(c.key);
        if (Math.abs(len - v.length) > Math.max(tol, 4)) continue;
        let d = tol ? lev(v, c.key, tol) : 9;
        if (d > tol) {
          // Sounds the same: identical sound skeleton, or one sound off on a long word, and not wildly different
          // letters. Only for longer words: short ones sound like too many other things.
          if (len < 6 || v.length < 6 || Math.abs(len - v.length) > 2) continue;
          const sameSound = c.snd === vs || c.snd === sound(vl);
          const nearSound = !sameSound && len >= 8 && c.snd.length >= 6 && c.snd.slice(0, 3) === vs.slice(0, 3) && lev(vs, c.snd, 1) <= 1;
          if (!sameSound && !nearSound) continue;
          d = lev(v, c.key, 5);
          if (d > Math.round(len * 0.34)) continue;
          d += 0.5;   // a letter-for-letter near miss beats a sound-alike
        }
        if (d < best) { best = d; e1 = c; if (d === 1) break; }
      }
      fuzzy = !!e1;
    }
    if (e1) return { entry: e1.e, key: e1.e.keys[e1.k], name: e1.e.names[e1.k], fuzzy };
    const n2 = find(idx.nopes, key => { const tol = tolOf(key); return tol && lev(v, key) <= tol; }); if (n2) return { nope: n2.e.msg };
    return { unknown: true };
  }
  const tierStamp = (t, label) => `<span class="ink-stamp ink-${t.key}">${esc(label || t.name)}</span>`;

  // ───────────────── WHERE'S THIS FROM? ─────────────────
  // Three postcards from three real places: a city, a landmark or a natural wonder.
  // The front says what it is and roughly where, the postmark names the country, the message gives it away.
  // Pin the spot whenever you're ready. Closer pins and fewer clues score more, and every pin scores something.
  const CLUE_CAP = [100, 85, 70];
  const CLUE_SIDE = ['Front', 'Postmark', 'Message'];
  const CLUE_ICON = ['✎', '◎', '✉'];
  // Full marks within 50 miles, then a gentle slope: 300 mi keeps about 3/4, 1,000 mi about 1/3.
  function pinScore(miles) { return miles <= 50 ? 100 : Math.round(100 * Math.exp(-(miles - 50) / 900)); }
  const pinEmoji = s => s >= 85 ? '🎯' : s >= 55 ? '📍' : s >= 20 ? '🧭' : '🌊';
  const fmtMi = mi => mi < 1 ? 'Right on it' : `${fmtNum(mi)} mi away`;

  function places(root, cards, ctx) {
    const H = withHost(root, 'places', pick(['Three postcards from my travels. Where was I?', 'I flew all over for these. Can you find where each one came from?', 'Three stops on my route this week. Pin them for me?']));
    const stage = H.body;
    let i = 0, shown = 1, pinLL = null, locked = false;
    const results = [];
    stage.innerHTML = `
      <div class="pm-layout">
        <article class="paper letter-card enter">
          <header class="lc-head"><span class="small-caps">Where's this postcard from?</span><span class="pcount"></span></header>
          <ol class="lc-clues"></ol>
          <div class="lc-actions"><button class="btn small" data-act="clue"></button><span class="lc-cap"></span></div>
        </article>
        <div class="pm-map">
          <div class="chart"><div class="map-wrap"></div></div>
          <div class="map-info"><span class="under-pin"></span><button class="btn primary" data-act="drop" disabled>Drop pin</button></div>
          <p class="pin-fact" hidden></p>
        </div>
      </div>`;
    const map = PMMap.WorldMap(stage.querySelector('.map-wrap'));
    const under = stage.querySelector('.under-pin');
    const btn = stage.querySelector('[data-act=drop]');
    const clueBtn = stage.querySelector('[data-act=clue]');
    const capEl = stage.querySelector('.lc-cap');
    const cluesEl = stage.querySelector('.lc-clues');
    const fact = stage.querySelector('.pin-fact');
    const chart = stage.querySelector('.chart');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const idle = () => map.isSmall() ? 'Tap a region to zoom in, then tap the spot.' : 'Click the spot. Scroll to zoom in close.';
    const wait = ms => new Promise(r => setTimeout(r, calm ? 0 : ms));
    // Miles tick up while Gus flies, so the distance lands with the plane.
    function countMiles(el, miles, ms) {
      if (calm || ms <= 0) { el.textContent = fmtMi(miles); return; }
      const t0 = performance.now(), ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      const step = now => {
        const x = Math.min(1, (now - t0) / ms);
        el.textContent = `${fmtNum(miles * ease(x))} mi`;
        if (x < 1) requestAnimationFrame(step); else el.textContent = fmtMi(miles);
      };
      requestAnimationFrame(step);
    }

    function paintClues(all) {
      const C = cards[i];
      cluesEl.innerHTML = C.clues.map((c, k) => k < shown || all
        ? `<li class="clue-item ${k === shown - 1 && !all ? 'enter' : ''} ${k >= shown ? 'late' : ''}"><span class="ck">${CLUE_ICON[k]} ${CLUE_SIDE[k]}</span><span class="ct">${esc(c)}</span></li>`
        : `<li class="clue-item sealed-clue"><span class="ck">${CLUE_SIDE[k]}</span><span class="ct">face down</span></li>`).join('');
      const more = shown < C.clues.length && !locked;
      clueBtn.hidden = !more;
      clueBtn.innerHTML = more ? `Turn it over <small>max ${CLUE_CAP[shown]}</small>` : '';
      capEl.innerHTML = locked ? '' : `Worth up to <b>${CLUE_CAP[shown - 1]}</b>`;
    }

    function show() {
      locked = false; pinLL = null; shown = 1;
      map.reset();
      stage.querySelector('.pcount').textContent = `${i + 1} of ${cards.length}`;
      paintClues();
      under.className = 'under-pin muted'; under.textContent = idle();
      btn.textContent = 'Drop pin'; btn.disabled = true; btn.className = 'btn primary';
      fact.hidden = true;
      chart.querySelectorAll('.map-stamp').forEach(e => e.remove());
      if (i > 0) H.say(pick(['Next postcard!', 'Here’s another one.', 'Off we fly again.']));
      ctx.run();
    }

    clueBtn.onclick = () => {
      if (locked || shown >= cards[i].clues.length) return;
      shown++; sfx('paper'); paintClues();
      H.say(shown === 2 ? 'Look at the postmark. That narrows it down.' : 'Here’s what I wrote on the back.');
    };

    map.onTap(ll => {
      if (locked) return;
      pinLL = ll;
      const c = map.setPin(ll);
      sfx('tick');
      under.className = 'under-pin';
      under.textContent = c ? c.properties.name : 'Open water';
      btn.disabled = false;
    });

    btn.onclick = async () => {
      if (!locked) {
        if (!pinLL) return;
        locked = true;
        ctx.pause();
        btn.disabled = true;
        const C = cards[i], spot = [C.lon, C.lat];
        const miles = PMMap.distanceMiles(pinLL, spot);
        const s = Math.round(CLUE_CAP[shown - 1] * pinScore(miles) / 100);
        results.push({ s, miles, label: C.name, clues: shown });
        paintClues(true);
        // Frame both points, bring the map on screen, then fly Gus from the pin to the real spot.
        map.fitTo([pinLL, spot], 14);
        stage.querySelector('.pm-map').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'end' });
        H.say(pick(['Let’s see where I landed…', 'Hold on, flying over now…', 'Wheels up! Let’s check…']));
        under.className = 'under-pin';
        under.innerHTML = '<span class="miles">0 mi</span>';
        const flight = miles < 1 ? 0 : Math.min(1700, 700 + miles / 5);
        await wait(650);
        if (flight) sfx('fly');
        countMiles(under.querySelector('.miles'), miles, calm ? 0 : flight);
        await map.drawRoute(pinLL, spot, calm ? 0 : flight);
        map.highlightCountry(C.country);
        map.showTarget(spot, C.name);
        // The verdict: a stamp on the map, and the score next to the distance.
        const bull = miles <= 50;
        under.innerHTML = `<span class="miles">${fmtMi(miles)}</span> <b class="plus">+${s}</b>`;
        chart.insertAdjacentHTML('beforeend', `<div class="map-stamp"><span class="ink-stamp big slam ${bull || s >= 60 ? 'ink-ok' : s >= 20 ? 'ink-rare' : 'ink-bad'}">${bull ? 'Bullseye' : pinScore(miles) >= 55 ? 'Close' : pinScore(miles) >= 20 ? 'Warm' : 'Far off'} +${s}</span></div>`);
        thud(chart);
        sfx(bull ? 'rare' : s >= 60 ? 'right' : s >= 20 ? 'stamp' : 'wrong');
        btn.textContent = i < cards.length - 1 ? 'Next postcard' : 'Done';
        btn.className = 'btn navy';
        btn.disabled = false;
        if (C.fact) { fact.innerHTML = `<b>${esc(C.name)}</b> ${esc(C.fact)}`; fact.hidden = false; }
        // Gus reacts to the distance itself.
        if (miles <= 60) H.say(pick(['Spot on! That’s right where I landed.', 'Bullseye! You’ve been there, haven’t you?']), 'happy');
        else if (miles <= 300) H.say(pick(['Close! I could see your pin from the air.', 'Very near. A short waddle away.']), 'happy');
        else if (miles <= 1000) H.say(pick(['Right part of the world. A bit of a detour.', 'Warm! Just a long flight off.']));
        else H.say(pick(['Oh dear. I’d have got lost too.', 'Honk! That’s a long way off.']), 'oops');
      } else if (++i < cards.length) {
        show();
      } else {
        const score = Math.round(results.reduce((a, r) => a + r.s, 0) / results.length);
        ctx.done({
          score,
          emoji: results.map(r => pinEmoji(r.s)).join(''),
          recap: `<table class="ledger">${results.map(r => `<tr><td>${esc(r.label)}</td><td>${r.clues} clue${r.clues === 1 ? '' : 's'} · ${r.miles < 1 ? 'on it' : fmtNum(r.miles) + ' mi'}</td><td>+${r.s}</td></tr>`).join('')}</table>`
        });
      }
    };
    show();
  }

  // ───────────────── CROSS POST ─────────────────
  // A themed mini crossword of 4–5 words with a letter bank and no clues to start. The bank holds exactly
  // the letters the grid needs, so every tile placed narrows things down.
  // Floor: clues and letters for sale, so anyone finishes. Ceiling: theme + bank alone, fast.
  const CLUE_COST = 5, LETTER_COST = 8, MISS_COST = 2;

  function cross(root, data, ctx) {
    const H = withHost(root, 'cross', pick(['Every word fits the theme, and every letter you need is in the bank.', 'A little themed crossword. The tiles below are all you need.']));
    const stage = H.body;
    const words = data.words.map(w => ({ ...w, solved: false, given: false, clueShown: false, letters: 0, wrong: 0 }));
    const key = (r, c) => r + ',' + c;
    const cells = new Map();     // "r,c" → { ch, words: [i], locked, tile: id|null }
    words.forEach((w, i) => w.cells.forEach(([r, c], p) => {
      const k = key(r, c);
      if (!cells.has(k)) cells.set(k, { ch: w.w[p], r, c, words: [], locked: false, tile: null });
      cells.get(k).words.push(i);
    }));
    // One tile per square (a shared square needs one letter), shuffled.
    let tiles = shuffle([...cells.values()].map((c, id) => ({ id, ch: c.ch, used: false })));
    let act = 0, over = false;
    const numAt = {};
    words.forEach(w => { numAt[key(...w.cells[0])] = w.num; });

    stage.innerHTML = `
      <article class="paper cross-card enter">
        <header class="cross-head"><span class="small-caps">Cross Post</span><span class="pcount">${words.length} words</span></header>
        <p class="cross-theme">${esc(data.theme)}</p>
        <div class="xgrid" style="--cols:${data.cols};grid-template-columns:repeat(${data.cols}, var(--cell));grid-template-rows:repeat(${data.rows}, var(--cell))"></div>
        <div class="xbank"></div>
        <div class="xhelp">
          <button class="btn small" data-act="clue">Clue <small>−${CLUE_COST}</small></button>
          <button class="btn small" data-act="letter">A letter <small>−${LETTER_COST}</small></button>
          <button class="btn small" data-act="shuffle">Shuffle</button>
        </div>
        <p class="feedback" role="status"></p>
        <ol class="xwords"></ol>
        <div class="center"><button class="btn link" data-act="giveup">Show me the answers</button></div>
      </article>
      <div class="cross-next dock"></div>`;
    const grid = stage.querySelector('.xgrid'), bank = stage.querySelector('.xbank'), list = stage.querySelector('.xwords');
    const fb = stage.querySelector('.feedback');
    const clueBtn = stage.querySelector('[data-act=clue]'), letterBtn = stage.querySelector('[data-act=letter]');
    cells.forEach((cell, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'xcell'; b.style.gridRow = cell.r + 1; b.style.gridColumn = cell.c + 1;
      b.innerHTML = `${numAt[k] ? `<span class="xn">${numAt[k]}</span>` : ''}<span class="xl"></span>`;
      b.onclick = () => tapCell(k);
      grid.appendChild(b);
      cell.el = b;
    });
    const tileOf = id => tiles.find(t => t.id === id);
    const letterIn = cell => cell.locked ? cell.ch : cell.tile != null ? tileOf(cell.tile).ch : '';
    const cellsOf = i => words[i].cells.map(([r, c]) => cells.get(key(r, c)));
    const nextEmpty = i => cellsOf(i).find(c => !c.locked && c.tile == null);
    const nextOpen = () => { const i = words.findIndex((w, k) => !w.solved && k > act); return i >= 0 ? i : words.findIndex(w => !w.solved); };

    function paint() {
      cells.forEach(cell => {
        const el = cell.el, w = cell.words.map(i => words[i]);
        el.querySelector('.xl').textContent = letterIn(cell);
        el.className = 'xcell' + (cell.locked ? (w.some(x => x.given && !x.solved) ? ' given' : w.some(x => x.solved) ? ' ok' : ' known') : '') +
          (!over && cell.words.includes(act) ? ' act' : '') + (!over && nextEmpty(act) === cell ? ' cur' : '');
      });
      bank.innerHTML = tiles.map(t => `<button type="button" class="ptile xtile ${t.used ? 'spent' : ''}" data-id="${t.id}" ${t.used || over ? 'disabled' : ''}>${t.ch}</button>`).join('');
      bank.querySelectorAll('.xtile').forEach(b => b.onclick = () => place(+b.dataset.id));
      list.innerHTML = words.map((w, i) => `<li class="${i === act && !over ? 'act' : ''} ${w.solved ? 'ok' : ''} ${w.given && !w.solved ? 'given' : ''}" data-i="${i}">
        <span class="xd">${w.num} ${w.dir === 'a' ? 'Across' : 'Down'} · ${w.w.length}</span>
        <span class="xc">${w.solved || w.given ? `<b>${w.w}</b>${w.clueShown || w.given ? ' · ' + esc(w.clue) : ''}` : w.clueShown ? esc(w.clue) : '<i>clue sealed</i>'}</span></li>`).join('');
      list.querySelectorAll('li').forEach(li => li.onclick = () => select(+li.dataset.i));
      const w = words[act];
      clueBtn.disabled = over || !w || w.solved || w.clueShown;
      letterBtn.disabled = over || !w || w.solved || !nextEmptyOrWrong(act);
    }
    const nextEmptyOrWrong = i => cellsOf(i).find(c => !c.locked);
    function select(i) { if (over || words[i].solved) return; act = i; paint(); }
    function tapCell(k) {
      if (over) return;
      const cell = cells.get(k);
      // Tapping a placed tile in the current word sends it back to the bank.
      if (!cell.locked && cell.tile != null && cell.words.includes(act)) { tileOf(cell.tile).used = false; cell.tile = null; sfx('tick'); return paint(); }
      const open = cell.words.filter(i => !words[i].solved);
      if (!open.length) return;
      act = open.length > 1 && open.includes(act) ? open.find(i => i !== act) : open[0];
      paint();
    }
    function place(id) {
      if (over) return;
      const t = tileOf(id), cell = nextEmpty(act);
      if (!t || t.used || !cell) return;
      t.used = true; cell.tile = id;
      sfx('key');
      fb.textContent = '';
      if (!nextEmpty(act)) check(act); else paint();
    }
    function lockWord(i, how) {
      const w = words[i];
      cellsOf(i).forEach(c => { if (!c.locked) { c.locked = true; if (c.tile == null) { const t = tiles.find(x => !x.used && x.ch === c.ch); if (t) { t.used = true; c.tile = t.id; } } } });
      if (how === 'solved') w.solved = true; else w.given = true;
      // Any square of another word that's now complete gets checked too.
    }
    function check(i) {
      const w = words[i], guess = cellsOf(i).map(letterIn).join('');
      if (guess.length < w.w.length) return paint();
      if (guess === w.w) {
        lockWord(i, 'solved');
        sfx('stamp');
        fb.className = 'feedback good'; fb.textContent = `${w.w}!`;
        if (words.every(x => x.solved)) return finish();
        H.say(pick(['Hoo! That’s one.', 'Splendid.', 'Quite right!', 'Lovely. Keep going.']), 'happy');
        // A crossing word might now be complete: check it, else move on.
        const done = words.findIndex((x, k) => !x.solved && !nextEmpty(k));
        if (done >= 0) { act = done; return check(done); }
        act = nextOpen(); return paint();
      }
      w.wrong++;
      sfx('wrong');
      cellsOf(i).forEach(c => { if (!c.locked && c.tile != null) { tileOf(c.tile).used = false; c.tile = null; } });
      fb.className = 'feedback bad'; fb.textContent = 'Not that one. The tiles went back to the bank.';
      H.say(pick(['Hmm, not quite.', 'Oh, not that word. Try again!', 'Close? Look at the crossing letters.']), 'oops');
      shake(grid);
      paint();
    }

    clueBtn.onclick = () => { const w = words[act]; if (over || w.solved || w.clueShown) return; w.clueShown = true; sfx('paper'); H.say('Here’s a hint for that one.'); paint(); };
    letterBtn.onclick = () => {
      const w = words[act]; if (over || w.solved) return;
      // Fill the first square that's empty or wrong with its right letter.
      const cell = cellsOf(act).find(c => !c.locked && letterIn(c) !== c.ch) || nextEmpty(act);
      if (!cell) return;
      if (cell.tile != null) { tileOf(cell.tile).used = false; cell.tile = null; }
      let t = tiles.find(x => !x.used && x.ch === cell.ch);
      if (!t) {   // the right tile is sitting in a wrong square elsewhere: take it back
        const holder = [...cells.values()].find(c => !c.locked && c.tile != null && tileOf(c.tile).ch === cell.ch && letterIn(c) !== c.ch);
        if (holder) { tileOf(holder.tile).used = false; holder.tile = null; t = tiles.find(x => !x.used && x.ch === cell.ch); }
      }
      if (t) { t.used = true; cell.tile = t.id; }
      cell.locked = true;
      w.letters++;
      sfx('paper');
      if (!nextEmpty(act)) check(act); else paint();
    };
    stage.querySelector('[data-act=shuffle]').onclick = () => { if (over) return; tiles = shuffle(tiles); sfx('paper'); paint(); };
    stage.querySelector('[data-act=giveup]').onclick = () => {
      if (over) return;
      words.forEach((w, i) => { if (!w.solved) lockWord(i, 'given'); });
      H.say('No trouble. Here they all are.', 'oops');
      finish();
    };
    // Typing works too: a letter picks a matching tile, Backspace sends the last one back.
    const onKey = e => {
      if (over || !document.body.contains(stage)) return document.removeEventListener('keydown', onKey);
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (/^[a-z]$/i.test(e.key)) { const t = tiles.find(x => !x.used && x.ch === e.key.toUpperCase()); if (t) place(t.id); else shake(bank); }
      else if (e.key === 'Backspace') { const filled = cellsOf(act).filter(c => !c.locked && c.tile != null).pop(); if (filled) { tileOf(filled.tile).used = false; filled.tile = null; paint(); } }
    };
    document.addEventListener('keydown', onKey);

    function finish() {
      over = true;
      ctx.pause();
      document.removeEventListener('keydown', onKey);
      const solved = words.filter(w => w.solved).length;
      const help = words.reduce((a, w) => a + (w.clueShown ? CLUE_COST : 0) + w.letters * LETTER_COST + w.wrong * MISS_COST, 0);
      const all = solved === words.length;
      const score = all ? Math.max(20, 100 - help) : Math.max(0, Math.round(60 * solved / words.length) - help);
      const clean = all && help === 0;
      if (all) { H.say(clean ? pick(['Not a single hint. What a wise owl you are!', 'Clean as a whistle. Hoo hoo!']) : pick(['All done. Very good!', 'There we are, every word.']), 'happy'); sfx('right'); }
      fb.className = 'feedback ' + (score >= 60 ? 'good' : ''); fb.textContent = `+${score}`;
      paint();
      stage.querySelectorAll('.xhelp .btn, [data-act=giveup]').forEach(b => b.disabled = true);
      const nb = stage.querySelector('.cross-next');
      nb.innerHTML = '<button class="btn navy big">Done</button>';
      nb.firstElementChild.onclick = () => ctx.done({
        score,
        emoji: words.map(w => !w.solved ? '🟥' : (w.clueShown || w.letters) ? '🟨' : '🟩').join(''),
        recap: `<p class="center hand cross-recap-theme">${esc(data.theme)}</p><table class="ledger">${words.map(w => `<tr><td><b>${w.w}</b><div class="xrecap-clue">${esc(w.clue)}</div></td><td>${!w.solved ? 'shown' : [w.clueShown && 'clue', w.letters && `${w.letters} letter${w.letters === 1 ? '' : 's'}`].filter(Boolean).join(', ') || 'no help'}</td></tr>`).join('')}</table>`
      });
      nb.firstElementChild.focus({ preventScroll: true });
    }
    paint();
  }

  // ───────────────── 3. CHAIN LETTER ─────────────────
  // Name things in a category; each must start with the last letter of the one before.
  // Five links, no countdown: pick well rather than fast. Anyone can name a cat (8); an axolotl is worth 20.
  // A known thing with a real descriptor in front counts too: "russet potato", "Arctic fox", "head chef".
  // Lucky letter: each day one letter pays double. You can't name it directly; you have to land on it by
  // ending an answer with it, so the planning is choosing what to end on. Dot also says how many answers
  // she knows for the letter you're on, and how many of those are Priceless.
  const COLORS = 'red green yellow white black purple brown golden orange pink blue grey gray silver';
  const DESCRIPTORS = {
    foods: COLORS + ' baked fried roasted roast grilled steamed boiled mashed scrambled poached smoked pickled stuffed dried fresh raw frozen toasted candied glazed braised sauteed deepfried stirfried panfried barbecue barbecued bbq blackened creamed caramelized whipped russet yukon heirloom wild baby sweet sour spicy hot iced whole homemade crispy salted honey garlic',
    animals: COLORS + ' spotted striped arctic african asian american european indian australian giant pygmy dwarf common great little lesser greater northern southern eastern western snow sea mountain desert wild baby',
    plants: COLORS + ' wild dwarf giant sweet common climbing creeping weeping english french japanese chinese',
    jobs: 'head chief assistant senior junior deputy apprentice master lead vice executive general associate'
  };

  // A narrow prompt's answers live in js/data/chain/<id>.js and load only on its day (the app asks early, on the
  // home screen). The built-in categories are already in PM_LEXICON.
  const chainLoads = {};
  function loadChain(cat) {
    const info = (window.PM_CHAIN_INDEX || {})[cat];
    if (!info) return Promise.resolve(window.PM_LEXICON[cat] || null);
    if (window.PM_CHAIN && window.PM_CHAIN[cat]) return Promise.resolve(window.PM_CHAIN[cat]);
    return chainLoads[cat] = chainLoads[cat] || new Promise(resolve => {
      const s = document.createElement('script');
      s.src = `js/data/chain/${cat}.js?v=${info.v || 1}`;
      s.onload = () => resolve((window.PM_CHAIN || {})[cat] || null);
      s.onerror = () => { delete chainLoads[cat]; s.remove(); resolve(null); };
      document.head.appendChild(s);
    });
  }
  function chain(root, data, ctx) {
    const ready = (window.PM_CHAIN_INDEX || {})[data.category] ? (window.PM_CHAIN || {})[data.category] : window.PM_LEXICON[data.category];
    if (ready) return chainGame(root, data, ctx, ready);
    const H = withHost(root, 'chain', 'One moment, I’m fetching today’s word book…');
    loadChain(data.category).then(lex => {
      if (lex) return chainGame(root, data, ctx, lex);
      H.say('Oh dear, the word book didn’t arrive. Are you online?', 'oops');
      H.body.innerHTML = '<div class="center"><button class="btn primary">Try again</button></div>';
      H.body.querySelector('.btn').onclick = () => chain(root, data, ctx);
    });
  }

  function chainGame(root, data, ctx, lex) {
    const H = withHost(root, 'chain', `First word: <b>${esc(data.start)}</b>. Tap tap, off you go!`);
    const stage = H.body;
    const LINKS = 5, PASS_COST = 2;
    const idx = buildIndex(lex);
    const common = TIERS[0];
    const descriptors = new Set((DESCRIPTORS[data.kind] || DESCRIPTORS[data.category] || '').split(' ').filter(Boolean));
    const titled = raw => raw.trim().replace(/\s+/g, ' ').replace(/^./, c => c.toUpperCase());
    // Food days also take a flavour in front: "Espresso cake", "Elderflower lemonade", "Eggplant curry".
    const flavorIdx = lex.flavors ? buildIndex({ tiers: { common: lex.flavors } }) : null;
    const isFlavor = words => {
      if (!flavorIdx || !words.length) return null;
      const r = matchAnswer(flavorIdx, words.join(' '));
      return r && r.entry ? r.name : null;
    };
    // "Russet potato", "Iced espresso latte": descriptors and/or a flavour in front of something Dot knows. Counts as Common.
    function compound(raw) {
      const words = raw.trim().split(/\s+/);
      for (let i = 1; i < words.length; i++) {
        const front = words.slice(0, i);
        let d = 0; while (d < front.length && descriptors.has(norm(front[d]))) d++;
        const flavor = d < front.length ? isFlavor(front.slice(d)) : null;
        if (d < front.length && !flavor) continue;
        const base = matchAnswer(idx, words.slice(i).join(' '));
        if (base && base.entry) {
          // Spelled properly: "expresso cak" becomes "Espresso cake". A flavour keeps its capitals ("Earl Grey").
          const lower = s => s.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase());
          const name = [...front.slice(0, d).map(w => w.toLowerCase()), ...(flavor ? [flavor] : []), lower(base.name)]
            .join(' ').replace(/^./, c => c.toUpperCase());
          return { entry: { id: norm(name), tier: common }, key: norm(name), name, flavored: !!flavor };
        }
      }
      return null;
    }
    // A made-up example for the hint: a flavour starting with L in front of one of today's everyday answers.
    const bases = idx.entries.filter(e => e.tier.key === 'common' && !/\s/.test(e.names[0]) && e.names[0].length <= 9).map(e => e.names[0]);
    function flavorExample(L) {
      if (!flavorIdx || !bases.length) return null;
      const fl = (lex.flavorHints || lex.flavors).filter(n => norm(n)[0] === L.toLowerCase() && n.length <= 14);
      if (!fl.length) return null;
      const h = [...`${ctx.issue}${L}${links.length}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 3);
      return { count: fl.length, ex: `${fl[h % fl.length]} ${bases[(h >>> 7) % bases.length].toLowerCase()}` };
    }
    const lastLetter = s => norm(s).replace(/[^a-z]/g, '').slice(-1).toUpperCase();
    const noun = data.noun || (data.category === 'countries' ? 'country' : 'animal');
    const nouns = data.plural ? data.plural.toLowerCase() : noun + 's';
    // Today's lucky letter: one that plenty of answers start with AND end with, so landing on it is a plan,
    // not a fluke. Never the first letter you're given. Same for everyone on the same day.
    const startsBy = {}, endsBy = {};
    idx.entries.forEach(e => { const k = e.keys[0].replace(/[^a-z]/g, ''); if (!k) return; startsBy[k[0]] = (startsBy[k[0]] || 0) + 1; endsBy[k.slice(-1)] = (endsBy[k.slice(-1)] || 0) + 1; });
    const firstNeed = lastLetter(data.start).toLowerCase();
    const luckyPool = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => c !== firstNeed && (startsBy[c] || 0) >= 6 && (endsBy[c] || 0) >= 3);
    const seed = [...`${ctx.issue}:${data.category}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    const lucky = luckyPool.length ? luckyPool[seed % luckyPool.length].toUpperCase() : null;
    // What Dot knows for a letter, not counting answers already in the chain.
    function known(L) {
      const l = L.toLowerCase(), list = idx.entries.filter(e => e.keys[0][0] === l && !used.has(e.id));
      return { all: list.length, top: list.filter(e => e.tier.key === 'legendary').length };
    }
    const aNoun = (/^[aeiou]/.test(noun) ? 'an ' : 'a ') + noun;
    let need = lastLetter(data.start), over = false, penalty = 0;
    const used = new Set(), links = [], needed = [need];

    stage.innerHTML = `
      <article class="telegram chain-card enter">
        <header class="tg-head"><span class="tg-brand">Chain letter</span><span class="tg-no chain-score">0 pts</span></header>
        <p class="tg-body small-body"><span class="strip">${lucky
          ? `LUCKY LETTER <b class="lucky-chip">${lucky}</b> <span class="stop">STOP</span> LAND ON IT FOR DOUBLE <span class="stop">STOP</span>`
          : `EACH ${noun.toUpperCase()} STARTS WITH THE LAST LETTER OF THE ONE BEFORE <span class="stop">STOP</span> RARER IS WORTH MORE <span class="stop">STOP</span>`}</span></p>
        <div class="chain-row"><span class="clink start">${esc(data.start)}</span></div>
        <div class="need-wrap" data-fit-top><span class="need-label">Next ${noun} starts with</span><span class="need-letter">${need}</span></div>
        <p class="need-hint"></p>
        <div class="chain-slots" aria-label="Links used">${'<i></i>'.repeat(LINKS)}</div>
        <form class="answer-row" autocomplete="off">
          <input class="text-input" placeholder="Type ${aNoun}" aria-label="Your answer" autocapitalize="words" autocorrect="off" spellcheck="false">
          <button class="btn primary" type="submit">Add</button>
        </form>
        <p class="feedback" role="status"></p>
        <div class="center"><button class="btn link pass" type="button">Stuck? New letter (−${PASS_COST} pts)</button></div>
      </article>
      <div class="reveal"></div>`;
    const input = stage.querySelector('.text-input');
    const fb = stage.querySelector('.feedback');
    const row = stage.querySelector('.chain-row');
    const needEl = stage.querySelector('.need-letter');
    const scoreEl = stage.querySelector('.chain-score');
    const slots = [...stage.querySelectorAll('.chain-slots i')];
    setTimeout(() => input.focus(), 60);

    const hintEl = stage.querySelector('.need-hint');
    const total = () => Math.max(0, Math.min(100, links.reduce((a, l) => a + l.pts, 0) - penalty));
    function paintNeed() {
      const isLucky = need === lucky;
      needEl.classList.toggle('lucky', isLucky);
      needEl.dataset.x2 = isLucky ? '×2' : '';
      const k = known(need), fl = flavorExample(need);
      hintEl.innerHTML = (isLucky ? '<b class="lucky-word">Lucky letter! This one counts double.</b> ' : '') +
        (k.all ? `Dot knows ${fmtNum(k.all)} ${k.all === 1 ? noun : nouns} with ${need}${k.top ? `, <b>${k.top} Priceless</b>` : ', none Priceless'}.` : fl ? '' : `Dot can’t think of any with ${need}. Maybe a new letter?`) +
        (fl ? ` Flavors count too, like <i>${esc(fl.ex)}</i>.` : '');
    }
    const setNeed = L => { need = L; needed.push(L); needEl.textContent = L; needEl.classList.remove('pop-in'); void needEl.offsetWidth; needEl.classList.add('pop-in'); paintNeed(); };
    const say = (msg, cls) => { fb.className = 'feedback ' + (cls || ''); fb.textContent = msg; };

    stage.querySelector('form').onsubmit = e => {
      e.preventDefault();
      if (over) return;
      const raw = input.value.trim();
      if (!raw) return;
      let r = matchAnswer(idx, raw);
      if (!r) return;
      if (r.unknown) r = compound(raw) || r;
      if (r.nope) { say(r.nope, 'bad'); H.say('Hmm, not quite.', 'oops'); shake(input); return input.select(); }
      const key = r.unknown ? norm(raw) : r.key;
      const first = key[0].toUpperCase();
      if (first !== need) { say(`That starts with ${first}. You need ${need}.`, 'bad'); H.say(`Needs to start with ${need}!`, 'oops'); shake(input); return input.select(); }
      if (used.has(r.unknown ? key : r.entry.id)) { say('Already in your chain.', 'bad'); H.say('You’ve used that one.', 'oops'); shake(input); return input.select(); }
      if (r.unknown) {
        say(`Dot doesn't know “${titled(raw)}”. Try another ${noun}.`, 'bad');
        H.say(pick([`I don't know that ${noun}!`, 'Never heard of that one.']), 'oops');
        shake(input);
        return input.select();
      }
      accept(r);
    };
    function accept(r) {
      used.add(r.entry.id);
      const t = r.entry.tier, x2 = need === lucky, pts = t.pts * (x2 ? 2 : 1);
      links.push({ name: r.name, tier: t, pts, x2 });
      sfx(x2 || t.key === 'rare' || t.key === 'legendary' ? 'rare' : 'stamp');
      slots[links.length - 1].className = 't-' + t.key + (x2 ? ' x2' : '');
      row.insertAdjacentHTML('beforeend', `<span class="clink t-${t.key}${x2 ? ' x2' : ''}">${esc(r.name)}<i>${t.name}${x2 ? ' ×2' : ''}</i></span>`);
      row.scrollLeft = row.scrollWidth;
      scoreEl.textContent = `${total()} pts`;
      scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
      // When Dot fixed the spelling, say what she read, so a wrong guess on her part is visible.
      const read = r.fuzzy && norm(r.name) !== norm(input.value) ? ` (Dot read “${r.name}”)` : '';
      say((x2 ? `Lucky ${need}! ${t.name} ×2 = +${pts}` : `${t.name}! +${t.pts}`) + read, 'good');
      if (x2) H.say(pick(['My lucky letter! Double postage!', 'Tap tap tap! Lucky letter, double points!']), 'happy');
      else if (t.key === 'legendary') H.say(pick([`${esc(r.name)}?! Priceless!`, 'Ooh, a priceless one! Tap tap tap!']), 'happy');
      else if (t.key === 'rare') H.say(pick([`A rare one! Lovely.`, `${esc(r.name)}! Not many think of that.`]), 'happy');
      else if (t.key === 'uncommon') H.say(pick(['Ooh, scarce!', 'Nice pick.']), 'happy');
      else H.say(pick(['Got it.', 'Tap tap!', 'Next!', 'Keep going!']));
      input.value = '';
      if (links.length >= LINKS) return end();
      const nextL = lastLetter(r.key);
      setNeed(nextL);
      if (nextL === lucky && links.length < LINKS) setTimeout(() => H.say(`You landed on ${lucky}! Make it a good one.`, 'happy'), 900);
    }
    stage.querySelector('.pass').onclick = () => {
      if (over) return;
      penalty += PASS_COST;
      scoreEl.textContent = `${total()} pts`;
      // A fresh letter with plenty of answers. Never the lucky one: you have to earn that by landing on it.
      const pool = 'ABCDEGHKLMPRST'.split('').filter(c => c !== need && c !== lucky && known(c).all >= 15);
      if (!pool.length) pool.push(...'BCMPST'.split('').filter(c => c !== need && c !== lucky));
      setNeed(pool[Math.floor(Math.random() * pool.length)]);
      say(`New letter: ${need}. (−${PASS_COST} pts)`);
      sfx('paper');
      input.focus();
    };

    paintNeed();
    ctx.run();

    function end() {
      if (over) return;
      over = true;
      ctx.pause();
      input.disabled = true;
      stage.querySelector('.chain-card').classList.add('done');   // hide the next-letter prompt and the input
      stage.querySelectorAll('.chain-card button').forEach(b => b.disabled = true);
      sfx('paper');
      // Show a few rare finds for letters the player actually faced.
      const ideas = [...new Set(needed)].slice(-4).map(L => {
        const fits = t => idx.entries.find(e => e.tier.key === t && e.keys[0][0] === L.toLowerCase() && !used.has(e.id));
        const pick = fits('rare') || fits('legendary');   // Rare first: better known, so a surer suggestion
        return pick ? `<b>${L}</b> ${esc(pick.display)} <span class="muted">(${pick.tier.name})</span>` : '';
      }).filter(Boolean);
      const score = total();
      H.say(score >= 80 ? 'Five links, and what a chain!' : score >= 56 ? 'Five links. Nicely picked!' : 'Five links, all delivered.', score >= 56 ? 'happy' : '');
      stage.querySelector('.reveal').innerHTML = `
        <section class="paper reply enter">
          <div class="reply-head"><div class="reply-answer">${links.map(l => l.tier.emoji).join('')}</div><span class="ink-stamp big slam ink-ok">+${score}</span></div>
          ${ideas.length ? `<h4 class="small-caps">Rare ones you could have used</h4><p class="ideas">${ideas.join('<br>')}</p>` : ''}
        </section>
        <div class="dock"><button class="btn navy big">Done</button></div>`;
      const next = stage.querySelector('.reveal .btn');
      next.onclick = () => ctx.done({
        score,
        emoji: links.map(l => l.tier.emoji).join('') || '⬛',
        recap: `<div class="chain-row recap">${[`<span class="clink start">${esc(data.start)}</span>`, ...links.map(l => `<span class="clink t-${l.tier.key}${l.x2 ? ' x2' : ''}">${esc(l.name)}<i>${l.tier.name}${l.x2 ? ' ×2' : ''}</i></span>`)].join('')}</div>
          <p class="center muted small">Common ${TIERS[0].pts} · Scarce ${TIERS[1].pts} · Rare ${TIERS[2].pts} · Priceless ${TIERS[3].pts}${lucky ? ` · lucky ${lucky} ×2` : ''}${penalty ? ` · new letters −${penalty}` : ''}</p>`
      });
      next.focus({ preventScroll: true });
      stage.querySelector('.reveal').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ───────────────── 4. MISSORTED ─────────────────
  // Three sacks, packed wrong. Swap stamps between sacks until each holds one group.
  // There's no losing, only how many swaps it took.
  const DENOMS = ['1¢', '2¢', '3¢', '4¢', '5¢', '6¢', '8¢', '10¢', '13¢', '15¢', '20¢', '25¢'];
  const TINTS = ['t-sage', 't-rose', 't-sky', 't-ochre', 't-lilac', 't-cream'];
  const PERMS3 = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  function minSwaps(sacks) {
    let best = Infinity;
    PERMS3.forEach(perm => {               // perm[s] = which group sack s ends up holding
      const home = g => perm.indexOf(g);
      const c = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      sacks.forEach((sack, s) => sack.forEach(x => { const t = home(x.gi); if (t !== s) c[s][t]++; }));
      let swaps = 0;
      [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => { const m = Math.min(c[a][b], c[b][a]); swaps += m; c[a][b] -= m; c[b][a] -= m; });
      const rest = c.flat().reduce((a, b) => a + b, 0);
      best = Math.min(best, swaps + (rest / 3) * 2);
    });
    return best;
  }

  function missorted(root, data, ctx) {
    const H = withHost(root, 'missorted', pick(['Oh dear, I muddled the sacks again. Swap stamps until each sack holds a group of four?', 'I packed these in a hurry, sorry! Swap stamps so each sack holds one group of four.']));
    const stage = H.body;
    const all = data.groups.flatMap((g, gi) => g.items.map(t => ({ t, gi, denom: '', tint: TINTS[Math.floor(Math.random() * TINTS.length)], rot: (Math.random() * 4 - 2).toFixed(1) })));
    let sacks;
    do {
      const s = shuffle(all);
      sacks = [s.slice(0, 4), s.slice(4, 8), s.slice(8, 12)];
    } while (sacks.some(sack => Math.max(...[0, 1, 2].map(g => sack.filter(x => x.gi === g).length)) > 2) || minSwaps(sacks) < 4);
    all.forEach((x, k) => x.denom = DENOMS[k]);
    const best = minSwaps(sacks);
    let sel = null, swaps = 0, over = false;
    const sealedGroup = sack => sack.every(x => x.gi === sack[0].gi) ? sack[0].gi : null;

    function render(msg, cls) {
      stage.innerHTML = `
        <div class="swap-count"><span>Swaps <b>${swaps}</b></span><span class="muted-d">Pip can do it in ${best}</span></div>
        <div class="sack-stack">${sacks.map((sack, s) => {
          const g = sealedGroup(sack);
          return `<div class="mail-sack ${g != null ? 'sealed-sack g' + g : ''}">
            <div class="sack-label">${g != null ? `<span class="sack-tag">${esc(data.groups[g].name)}</span>` : `<span class="sack-tag unknown">Sack ${s + 1}</span>`}</div>
            <div class="sack-row">${sack.map((x, i) => `
              <button class="stamp-perf tile ${sel && sel.s === s && sel.i === i ? 'sel' : ''}" data-s="${s}" data-i="${i}" style="--rot:${x.rot}deg" ${g != null || over ? 'disabled' : ''}>
                <span class="stamp-face ${x.tint}"><span class="tile-word ${x.t.length > 10 ? 'xlong' : x.t.length > 7 ? 'long' : ''}">${esc(x.t)}</span><span class="stamp-val">${x.denom}</span></span>
              </button>`).join('')}</div>
          </div>`;
        }).join('')}</div>
        <p class="feedback ${cls || ''}" role="status">${msg || (sel ? 'Now tap a stamp in another sack to swap.' : 'Tap a stamp to pick it up.')}</p>
        <div class="center"><button class="btn link" data-act="giveup" ${over ? 'disabled' : ''}>Show me the answer</button></div>`;
      stage.querySelectorAll('.tile').forEach(b => b.onclick = () => tap(+b.dataset.s, +b.dataset.i));
      stage.querySelector('[data-act=giveup]').onclick = () => { if (!over) end(false); };
    }

    function tap(s, i) {
      if (over) return;
      if (!sel || sel.s === s) { sel = sel && sel.s === s && sel.i === i ? null : { s, i }; sfx('tick'); return render(); }
      const a = sacks[sel.s][sel.i];
      sacks[sel.s][sel.i] = sacks[s][i];
      sacks[s][i] = a;
      swaps++;
      const before = sel; sel = null;
      const newly = [before.s, s].filter(k => sealedGroup(sacks[k]) != null);
      sfx(newly.length ? 'stamp' : 'paper');
      if (sacks.every(sk => sealedGroup(sk) != null)) return end(true);
      if (newly.length) H.say(pick(['That one’s right! Thank you.', 'Sealed! Coo, that’s a relief.', 'Perfect, that sack can go.']), 'happy');
      else if (swaps === 1) H.say('Keep swapping. A sack seals itself when it’s right.');
      render(newly.length ? `Sealed: ${newly.map(k => data.groups[sealedGroup(sacks[k])].name).join(' and ')}.` : '', newly.length ? 'good' : '');
    }

    function end(won) {
      over = true;
      ctx.pause();
      const sealedCount = sacks.filter(sk => sealedGroup(sk) != null).length;
      if (!won) {
        // Lay the groups out properly so the player can see them.
        sacks = data.groups.map((_, gi) => all.filter(x => x.gi === gi));
      }
      const extra = Math.max(0, swaps - best);
      const score = won ? Math.max(30, 100 - extra * 12) : sealedCount * 15;
      if (won) H.say(extra === 0 ? 'Not a stamp wasted! You’re better at this than me.' : 'All sorted. I owe you one!', 'happy');
      else H.say('Never mind. Here’s how they were meant to go.', 'oops');
      render(won ? (extra === 0 ? 'A perfect sort. As few swaps as possible!' : `All sorted in ${swaps} swaps.`) : 'Here’s how they go.', won ? 'good' : '');
      setTimeout(() => ctx.done({
        score,
        emoji: won ? (extra === 0 ? '🟩🟩🟩' : extra <= 2 ? '🟩🟩🟨' : '🟩🟨🟨') : '🟥',
        recap: `<p class="center"><b>${won ? `${swaps} swaps` : 'Unsorted'}</b> · best possible ${best}</p>
          ${data.groups.map((g, gi) => `<div class="sack g${gi}"><span class="sack-tag">${esc(g.name)}</span><span class="sack-items">${g.items.map(esc).join(' · ')}</span></div>`).join('')}
          ${data.sneaky ? `<p class="note center">${esc(data.sneaky)}</p>` : ''}`
      }), 1200);
    }
    render();
  }

  // ───────────────── 5. THE POSTAL SCALE ─────────────────
  // Estimation on a brass dial, with a bet. Set the needle, then say how sure you are: the band around the
  // needle is your window. If the answer lands inside it you're paid; a narrower window pays more.
  // Floor: Ballpark is wide enough to catch most honest guesses. Ceiling: a Bullseye on all three.
  // Windows are measured along the dial (a share of its sweep), so a log dial gets a ratio window for free.
  const BETS = [
    { key: 'bull', name: 'Bullseye', w: 0.04, pts: 100, emoji: '🎯' },
    { key: 'close', name: 'Close', w: 0.10, pts: 60, emoji: '🟩' },
    { key: 'ball', name: 'Ballpark', w: 0.20, pts: 30, emoji: '🟨' }
  ];
  const betOf = k => BETS.find(b => b.key === k);
  function scaleScore(q, g) {
    const a = q.answer;
    if (q.log) { const e = Math.abs(Math.log(g / a)); return e <= 0.05 ? 100 : Math.round(100 * Math.exp(-(e - 0.05) / 0.45)); }
    const e = Math.abs(g - a) / (q.span || q.max - q.min); // span: the original range, before the dial window moved
    return e <= 0.02 ? 100 : Math.round(100 * Math.exp(-(e - 0.02) / 0.12));
  }
  const fromT = (q, t) => q.log ? q.min * Math.pow(q.max / q.min, t) : q.min + t * (q.max - q.min);
  const toT = (q, v) => q.log ? Math.log(v / q.min) / Math.log(q.max / q.min) : (v - q.min) / (q.max - q.min);
  // The dial's resolution: fine enough to hit answers like 1.3 gallons, coarse enough to read easily.
  const decimals = x => { const m = String(x).match(/\.(\d+)/); return m ? Math.min(2, m[1].length) : 0; };
  function increment(q, v) {
    if (q.year) return 1;
    if (!q.log) return Math.max(Math.pow(10, -decimals(q.answer)), Math.pow(10, Math.floor(Math.log10((q.max - q.min) / 300))));
    const a = Math.abs(v);
    return a < 1 ? 0.01 : a < 10 ? 0.1 : a < 1000 ? 1 : Math.pow(10, Math.floor(Math.log10(a)) - 2);
  }
  function roundVal(q, v) {
    const inc = increment(q, v);
    return +(Math.round(v / inc) * inc).toFixed(Math.max(0, decimals(inc)));
  }
  const fmtVal = (q, v) => q.year ? String(Math.round(v)) : v.toLocaleString(undefined, { maximumFractionDigits: Math.max(0, decimals(increment(q, v))) });
  const fmtAns = q => q.year ? String(q.answer) : q.answer.toLocaleString(undefined, { maximumFractionDigits: 2 });

  function dialSVG(q) {
    const cx = 150, cy = 150, r = 118;
    const pt = (t, rr) => { const a = Math.PI * (1 - t); return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; };
    const ticks = Array.from({ length: 41 }, (_, k) => {
      const t = k / 40, [x1, y1] = pt(t, r), [x2, y2] = pt(t, r - (k % 10 === 0 ? 16 : k % 5 === 0 ? 10 : 5));
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${k % 10 === 0 ? 'major' : ''}"/>`;
    }).join('');
    const labels = [0, 0.5, 1].map(t => { const [x, y] = pt(t, r - 30); return `<text x="${x}" y="${y + 4}" text-anchor="middle">${fmtVal(q, roundVal(q, fromT(q, t)))}</text>`; }).join('');
    return `<svg viewBox="0 0 300 172" class="dial" aria-hidden="true">
      <path d="M${cx - r - 14} ${cy} A${r + 14} ${r + 14} 0 0 1 ${cx + r + 14} ${cy}" class="rim"/>
      <path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" class="face"/>
      <path class="bet-band" d=""/>
      <g class="ticks">${ticks}</g><g class="tick-labels">${labels}</g>
      <text x="${cx}" y="${cy - 52}" text-anchor="middle" class="dial-brand">POSTAL SCALE</text>
      <g class="needle answer-needle" style="display:none"><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r + 8}"/></g>
      <g class="needle guess-needle"><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r + 8}"/></g>
      <circle cx="${cx}" cy="${cy}" r="9" class="hub"/>
    </svg>`;
  }

  // The band on the dial between t0 and t1: an arc-shaped strip under the ticks.
  function bandPath(t0, t1) {
    const cx = 150, cy = 150, ro = 117, ri = 64;
    const pt = (t, rr) => { const a = Math.PI * (1 - t); return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy - rr * Math.sin(a)).toFixed(1)}`; };
    return `M${pt(t0, ro)} A${ro} ${ro} 0 0 1 ${pt(t1, ro)} L${pt(t1, ri)} A${ri} ${ri} 0 0 0 ${pt(t0, ri)} Z`;
  }

  function scale(root, qs, ctx) {
    const H = withHost(root, 'scale', pick(['Three parcels to weigh. Set the dial, then tell me how sure you are.', 'Parcels for the scale! Guess the number, then place your bet.']));
    const stage = H.body;
    let i = 0;
    const results = [];
    function show() {
      const q = qs[i];
      let t = 0, locked = false, moved = false, bet = betOf(results.length ? results[results.length - 1].bet.key : 'close');
      stage.innerHTML = `
        <article class="scale-card enter">
          <header class="sc-head"><span class="small-caps">Postal scale</span><span class="pcount">${i + 1} of ${qs.length}</span></header>
          <p class="sc-q">${esc(q.q)}</p>
          <div class="dial-wrap">${dialSVG(q)}</div>
          <div class="sc-readout"><button class="nudge" data-d="-1" aria-label="Less">−</button><span class="sc-val"></span><button class="nudge" data-d="1" aria-label="More">+</button></div>
          <input type="range" class="sc-range" min="0" max="1000" step="1" value="0" aria-label="Your estimate">
          <div class="bets" role="radiogroup" aria-label="How sure are you?">
            ${BETS.map(b => `<button type="button" class="bet bet-${b.key}" role="radio" data-k="${b.key}"><b>${b.name}</b><span>pays ${b.pts}</span></button>`).join('')}
          </div>
          <p class="bet-note"></p>
          <div class="sc-result" hidden></div>
        </article>
        <div class="dock"><button class="btn primary big" data-act="weigh" disabled>Move the dial to weigh</button></div>`;
      const range = stage.querySelector('.sc-range');
      const valEl = stage.querySelector('.sc-val');
      const needle = stage.querySelector('.guess-needle');
      const ansNeedle = stage.querySelector('.answer-needle');
      const btn = stage.querySelector('[data-act=weigh]');
      const res = stage.querySelector('.sc-result');
      const band = stage.querySelector('.bet-band');
      const note = stage.querySelector('.bet-note');
      const card = stage.querySelector('.scale-card');
      const value = () => roundVal(q, fromT(q, t));
      const angle = tt => -90 + 180 * Math.max(0, Math.min(1, tt));
      const windowOf = () => [Math.max(0, t - bet.w), Math.min(1, t + bet.w)];
      const paint = () => {
        if (moved && btn.disabled && !locked) { btn.disabled = false; btn.textContent = 'Weigh it'; }
        needle.setAttribute('transform', `rotate(${angle(t)} 150 150)`);
        valEl.innerHTML = `${fmtVal(q, value())}<small>${esc(q.unit)}</small>`;
        stage.querySelectorAll('.bet').forEach(b => { const on = b.dataset.k === bet.key; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); b.disabled = locked; });
        card.dataset.bet = bet.key;
        if (!moved) { band.setAttribute('d', ''); note.innerHTML = 'Set the dial, then pick how sure you are.'; return; }
        const [t0, t1] = windowOf();
        band.setAttribute('d', bandPath(t0, t1));
        if (!locked) note.innerHTML = `Pays <b>${bet.pts}</b> if it’s between <b>${fmtVal(q, roundVal(q, fromT(q, t0)))}</b> and <b>${fmtVal(q, roundVal(q, fromT(q, t1)))}</b> ${esc(q.unit)}.`;
      };
      stage.querySelectorAll('.bet').forEach(b => b.onclick = () => { if (locked) return; bet = betOf(b.dataset.k); sfx('tick'); paint(); });
      range.oninput = () => { t = +range.value / 1000; moved = true; paint(); };
      stage.querySelectorAll('.nudge').forEach(b => b.onclick = () => {
        if (locked) return;
        const v = value(), d = +b.dataset.d;
        // Move about half a percent of the dial, but always at least one notch.
        let next = q.year ? v + d : roundVal(q, fromT(q, Math.max(0, Math.min(1, toT(q, v) + d * 0.005))));
        if (next === v) next = roundVal(q, v + d * increment(q, v));
        t = Math.max(0, Math.min(1, toT(q, Math.max(q.min, Math.min(q.max, next)))));
        range.value = Math.round(t * 1000); moved = true; paint(); sfx('tick');
      });
      // Drag the dial itself.
      const svg = stage.querySelector('.dial');
      const fromPointer = ev => {
        const r = svg.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width * 300 - 150, y = 150 - (ev.clientY - r.top) / r.height * 172;
        t = Math.max(0, Math.min(1, 1 - Math.atan2(Math.max(y, 0), x) / Math.PI));
        range.value = Math.round(t * 1000); moved = true; paint();
      };
      svg.addEventListener('pointerdown', ev => { if (locked) return; svg.setPointerCapture(ev.pointerId); fromPointer(ev); svg.onpointermove = fromPointer; });
      svg.addEventListener('pointerup', () => { svg.onpointermove = null; });
      paint();
      if (i > 0) H.say(pick(['Next parcel!', 'Here’s another one.', 'Up it goes onto the scale.']));
      ctx.run();

      btn.onclick = () => {
        if (!locked) {
          if (!moved) return;
          locked = true;
          ctx.pause();
          range.disabled = true;
          svg.classList.add('locked');
          const g = value();
          const hit = Math.abs(toT(q, g) - toT(q, q.answer)) <= bet.w + 1e-9;
          const s = hit ? bet.pts : 0;
          results.push({ q, g, s, hit, bet });
          paint();
          note.innerHTML = '';
          ansNeedle.style.display = '';
          // The answer needle swings over from the guess, like a scale settling.
          ansNeedle.setAttribute('transform', `rotate(${angle(t)} 150 150)`);
          requestAnimationFrame(() => requestAnimationFrame(() => ansNeedle.setAttribute('transform', `rotate(${angle(toT(q, q.answer))} 150 150)`)));
          const diff = g === q.answer ? 'Exactly right!' : g > q.answer ? 'A little heavy.' : 'A little light.';
          res.hidden = false;
          res.innerHTML = `<div class="sc-compare"><span>You <b>${fmtVal(q, g)}</b></span><span class="ans">Actual <b>${fmtAns(q)}</b> ${esc(q.unit)}</span></div>
            <p class="sc-fact"><b>${diff}</b> ${esc(q.fact)}</p>`;
          // The verdict lands once the needle has settled.
          setTimeout(() => {
            card.classList.add(hit ? 'won' : 'lost');
            res.insertAdjacentHTML('afterbegin', `<div class="sc-verdict"><span class="ink-stamp big slam ${hit ? 'ink-ok' : 'ink-bad'}">${hit ? `${bet.name} +${s}` : 'Missed +0'}</span></div>`);
            sfx(hit ? (bet.key === 'bull' ? 'rare' : 'right') : 'wrong');
            thud(card);
            if (hit && bet.key === 'bull') H.say(pick(['Bullseye! You’ve a feel for this.', 'Bang on, and you knew it. Splendid!']), 'happy');
            else if (hit && bet.key === 'close') H.say(pick(['Inside the window. Nicely judged!', 'Close, just like you said.']), 'happy');
            else if (hit) H.say(pick(['Safe and sound, right in the ballpark.', 'In the ballpark. Every parcel counts!']), 'happy');
            else if (bet.key === 'bull') H.say(pick(['A brave bet! Not this time.', 'Oof, so close to glory.']), 'oops');
            else H.say(pick(['Oof! That one surprises everyone.', 'Goodness, a heavy surprise.']), 'oops');
          }, 650);
          btn.textContent = i < qs.length - 1 ? 'Next parcel' : 'Done';
          btn.className = 'btn navy big';
        } else if (++i < qs.length) show();
        else {
          const score = Math.round(results.reduce((a, r) => a + r.s, 0) / results.length);
          ctx.done({
            score,
            emoji: results.map(r => r.hit ? r.bet.emoji : '🟥').join(''),
            recap: `<table class="ledger">${results.map(r => `<tr><td>${esc(r.q.q)}</td><td>${r.bet.name} · ${fmtVal(r.q, r.g)} vs ${fmtAns(r.q)}</td><td>+${r.s}</td></tr>`).join('')}</table>`
          });
        }
      };
    }
    show();
  }

  // ───────────────── WHO SENT THIS? (runs alongside the whole route) ─────────────────
  // state: { seen, clear:[bool], wiped:[bool], wrong, solved, value }
  const SENDER_BASE = [60, 60, 50, 40, 30, 20]; // by number of clues delivered so far
  const WIPE_COST = 10, WRONG_COST = 10;
  function senderValue(st) {
    const wiped = st.wiped.filter(Boolean).length;
    return Math.max(10, SENDER_BASE[Math.min(st.seen, 5)] - st.wrong * WRONG_COST - wiped * WIPE_COST);
  }
  let animalIdx = null;

  // Renders the mystery envelope into `el`. opts: { final, onSolved(value), onGiveUp() }
  function senderCard(el, data, st, opts = {}) {
    const answers = buildIndex({ tiers: { common: [data.answers] }, nope: data.nope || {} });
    animalIdx = animalIdx || buildIndex(window.PM_LEXICON.animals);
    function render(msg, cls) {
      if (st.solved) {
        el.innerHTML = `<section class="sender-card solved enter">
          <div class="sender-stamp stamp-perf"><div class="stamp-face t-${data.tint || 'sky'}"><span class="album-emoji">${data.emoji}</span></div></div>
          <div><span class="small-caps">Today's mail was from</span><h3 class="hand sender-name">${esc(data.name)}</h3><p class="small">+${st.value} postage · in your stamp album</p></div>
        </section>`;
        return;
      }
      const delivered = opts.delivered || 5;
      el.innerHTML = `<section class="sender-card enter">
        <header class="sender-head">
          <div class="sender-stamp stamp-perf"><div class="stamp-face t-cream"><span class="sender-q">?</span></div></div>
          <div><span class="small-caps">Who sent today's mail?</span><p class="hand sender-sub">${opts.final ? 'Last chance to guess the sender.' : 'Each delivery brings a clue. Guess early for more.'}</p></div>
        </header>
        <ol class="sender-clues" data-fit-top>${data.clues.map((c, k) => {
          if (k >= st.seen) {
            if (opts.final && k === st.seen) return `<li class="future"><button class="btn small open-clue" type="button">Open clue ${k + 1} <small>worth ${senderValue({ ...st, seen: k + 1 })}</small></button></li>`;
            return `<li class="future">${k < delivered ? `Arrives after delivery ${k + 1}` : opts.final ? 'Sealed' : 'Yours to open in the last round'}</li>`;
          }
          if (st.clear[k] || st.wiped[k]) return `<li class="${k === st.seen - 1 ? 'enter' : ''}">${esc(c)}</li>`;
          return `<li class="smudged"><span class="smudge">${esc(c)}</span><button class="btn small wipe" data-k="${k}">Wipe <small>−${WIPE_COST}</small></button></li>`;
        }).join('')}</ol>
        <form class="answer-row sender-form" autocomplete="off">
          <input class="text-input" placeholder="An animal" aria-label="Guess the sender" autocapitalize="words" autocorrect="off" spellcheck="false">
          <button class="btn primary" type="submit">Guess</button>
        </form>
        <p class="feedback ${cls || ''}" role="status">${msg || `A right guess now is worth <b>${senderValue(st)}</b>. Wrong guesses cost ${WRONG_COST}.`}</p>
        ${opts.final ? '<div class="center"><button class="btn link giveup" type="button">I give up</button></div>' : ''}
      </section>`;
      el.querySelectorAll('.wipe').forEach(b => b.onclick = () => { st.wiped[+b.dataset.k] = true; sfx('paper'); render(); });
      const oc = el.querySelector('.open-clue');
      if (oc) oc.onclick = () => { st.clear[st.seen] = true; st.seen++; sfx('paper'); render(); const i = el.querySelector('.text-input'); if (i) i.focus(); };
      const input = el.querySelector('.text-input');
      el.querySelector('form').onsubmit = e => {
        e.preventDefault();
        const raw = input.value.trim();
        if (!raw) return;
        const hit = matchAnswer(answers, raw);
        if (hit && hit.entry) {
          st.solved = true; st.value = senderValue(st); st.solvedAt = st.seen;
          sfx('rare');
          render();
          if (opts.onSolved) opts.onSolved(st.value);
          return;
        }
        if (hit && hit.nope) { sfx('wrong'); return render(hit.nope, 'bad'); }
        const animal = matchAnswer(animalIdx, raw);
        if (animal && animal.entry) { st.wrong++; sfx('wrong'); render(`${animal.name}? Not me! (−${WRONG_COST})`, 'bad'); shake(el.querySelector('.sender-form')); return; }
        render("Pip doesn't know that animal. Try another.", 'bad');
      };
      const gu = el.querySelector('.giveup');
      if (gu) gu.onclick = () => opts.onGiveUp && opts.onGiveUp();
    }
    render();
  }

  // The final leg, only if the sender is still a mystery after the deliveries.
  function sender(stage, data, ctx) {
    const { sender: s, state } = data;
    const recap = solved => `<div class="parcel-reveal"><div class="stamp-perf album-stamp"><div class="stamp-face t-${s.tint || 'sky'}"><span class="album-emoji">${s.emoji}</span><span class="stamp-val">No.${ctx.issue}</span></div></div>
      <p>${solved ? `<b>${esc(s.name)}</b> goes in your stamp album.` : `It was a <b>${esc(s.name.toLowerCase())}</b>. That stamp got away this time.`}</p></div>`;
    const H = withHost(stage, 'sender', 'Last round! Who do you think sent today’s mail?');
    H.body.innerHTML = '<div class="sender-host"></div>';
    senderCard(stage.querySelector('.sender-host'), s, state, {
      final: true, delivered: data.delivered,
      onSolved: v => { ctx.pause(); setTimeout(() => ctx.done({ score: v, solved: true, emoji: s.emoji, recap: recap(true) }), 900); },
      onGiveUp: () => { ctx.pause(); sfx('paper'); ctx.done({ score: 0, solved: false, emoji: '❔', recap: recap(false) }); }
    });
    setTimeout(() => { const i = stage.querySelector('.text-input'); if (i) i.focus(); }, 60);
  }

  window.PMGames = {
    places, cross, chain, missorted, scale, sender, senderCard, senderValue,
    TIERS, loadChain, _matchAnswer: matchAnswer, _buildIndex: buildIndex, _minSwaps: minSwaps, _scaleScore: scaleScore
  };
})();

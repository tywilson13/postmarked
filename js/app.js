(function () {
  'use strict';
  const EPOCH = new Date(2026, 10, 7); // Postmarked No. 1 = Nov 7, 2026
  const SPEED_MAX = 20;               // max Express bonus per delivery

  const CATALOGUE = [
    { id: 'chain', mark: 'CHAIN LETTER', title: 'Chain Letter', skill: 'Rarity', par: 90,
      how: 'Five links. Each answer starts with any letter of the one before (after Tiramisu: T, I, R, A, M, S or U). Rarer answers are worth more: Common 8, Scarce 12, Rare 16, Priceless 20. Today’s three bonus letters multiply an answer: one anywhere in it ×1.5, two ×2, all three ×3. No countdown, so choose well (a quick chain still earns Express).' },
    { id: 'places', mark: 'WHERE FROM', title: 'Where’s This From?', skill: 'Maps', par: 90,
      how: 'Three postcards from three real places. The front says what it is and roughly where, the postmark names the country, and the message gives it away. Pin the spot whenever you’re ready. Closer pins and fewer clues earn more.' },
    { id: 'cross', mark: 'CROSS POST', title: 'Cross Post', skill: 'Words',
      how: 'A little crossword where every word fits today’s theme. There are no clues, just a bank holding exactly the letters you need. Tap a word, then tap tiles to fill it, or type. Stuck? Clues and letters are for sale.', par: 150 },
    { id: 'order', mark: 'RETURN TO SENDER', title: 'Return to Sender', skill: 'Hunches', par: 60,
      how: 'Five envelopes to put in order, like oldest to newest. Tap two to swap them, then send. Any in the right spot get delivered and stay put; the rest come back. Four sends. Right first time pays the most.' },
    { id: 'missorted', mark: 'MISSORTED', title: 'Missorted', skill: 'Puzzle', par: 60,
      how: 'Three sacks got packed wrong. Swap stamps between sacks until each holds a group of four. A sack seals when it’s right. Fewer swaps score more.' },
    { id: 'scale', mark: 'POSTAL SCALE', title: 'The Postal Scale', skill: 'Estimation', par: 60,
      how: 'Three parcels, three questions with a number for an answer. Set the dial to your best guess, then bet on how sure you are. If the answer lands in your window you’re paid: Bullseye 100, Close 60, Ballpark 30. Miss and it’s nothing, so only go narrow when you’re confident.' },
    { id: 'sender', mark: 'WHO SENT IT', title: 'Who Sent This?', skill: 'Mystery', par: 0,
      how: 'Last chance to name the animal who sent today’s mail. Open more clues if you need them. Each one lowers the prize a little.' },
    // Retired games, kept so receipts from earlier days still show the right names.
    { id: 'cryptic', mark: 'POSTCARD', title: 'The Postcard', skill: 'Words', retired: true },
    { id: 'postmark', mark: 'WHERE FROM', title: 'Where’s This From?', skill: 'Maps', retired: true }
  ];
  const legOfId = id => CATALOGUE.find(l => l.id === (LEGACY[id] || id)) || CATALOGUE[0];
  const CLEAR_CLUE = 50;               // a delivery scoring this much sends its sender clue unsmudged
  // Records saved before the redesign used older game ids.
  const LEGACY = { pins: 'postmark', penpals: 'chain', mail: 'missorted', customs: 'scale', finale: 'sender' };
  const legOf = id => legOfId(id);
  const GRADES = [
    [350, 'S'], [325, 'A+'], [305, 'A'], [285, 'A−'], [265, 'B+'], [245, 'B'], [225, 'B−'],
    [205, 'C+'], [185, 'C'], [165, 'C−'], [145, 'D+'], [125, 'D'], [105, 'D−'], [0, 'F']
  ];
  const GRADE_NAME = { S: 'Golden Envelope', A: 'Express Delivery', B: 'First Class', C: 'Second Class', D: 'Scenic Route', F: 'Lost in the Mail' };

  // ───────── helpers ─────────
  const $ = s => document.querySelector(s);
  const stage = $('#stage');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pm:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pm:' + k, JSON.stringify(v)); } catch { /* private mode */ } }
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtTime = ms => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const toast = msg => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2000); };
  const sfx = n => window.PMSound && PMSound.play(n);

  function todayNumber() {
    const now = new Date(); const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(1, Math.round((d - EPOCH) / 86400000) + 1);
  }
  const params = new URLSearchParams(location.search);
  const TODAY = todayNumber();
  // ?day=N plays a back issue. Days that haven't come out yet stay sealed (except in ?dev playtests).
  const issue = Math.max(1, Math.min(+params.get('day') || TODAY, params.has('dev') ? Infinity : TODAY));
  const isBack = issue < TODAY;
  const day = PMDaily.build(issue);
  PMGames.loadChain(day.chain.category);   // fetch today's Chain Letter answers while the home screen shows
  const LEGS = day.route.map(legOfId);
  const DELIVERIES = LEGS.length - 1; // the sender is a running bonus, not a delivery
  const issueDate = new Date(EPOCH.getTime() + (issue - 1) * 86400000);
  const dateLabel = issueDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const shortDate = issueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
  const recipient = () => store.get('name', '') || 'You';

  // ───────── head-to-head: results arrive as a link (?from=Name&no=3&s=95.114.80.95.108.50&t=312) ─────────
  function ingestRival() {
    const from = params.get('from'), s = params.get('s'), no = +params.get('no');
    if (!from || !s || !no) return null;
    const scores = s.split('.').map(Number).filter(n => isFinite(n));
    const rival = { name: from.slice(0, 24), scores, total: scores.reduce((a, b) => a + b, 0), timeMs: (+params.get('t') || 0) * 1000 };
    if (rival.name === store.get('name', '')) return null; // your own link
    const all = store.get('rivals', {});
    all[no] = all[no] || {};
    all[no][rival.name] = rival;
    store.set('rivals', all);
    ['from', 's', 'no', 't'].forEach(k => params.delete(k));
    history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : ''));
    return { ...rival, issue: no };
  }
  const arrivedRival = ingestRival();
  const rivalsFor = n => Object.values(store.get('rivals', {})[n] || {}).filter(r => r.scores.length === LEGS.length);

  // ───────── route clock (a red postage meter) ─────────
  const meter = $('#meter');
  const Clock = {
    total: 0, leg: 0, t0: null,
    run() { if (this.t0 == null) this.t0 = performance.now(); meter.classList.add('running'); },
    pause() { if (this.t0 != null) { const d = performance.now() - this.t0; this.total += d; this.leg += d; this.t0 = null; } meter.classList.remove('running'); },
    now() { return this.total + (this.t0 != null ? performance.now() - this.t0 : 0); },
    legNow() { return this.leg + (this.t0 != null ? performance.now() - this.t0 : 0); },
    reset() { this.total = 0; this.leg = 0; this.t0 = null; }
  };
  let currentPar = null;
  setInterval(() => {
    meter.querySelector('.meter-time').textContent = fmtTime(Clock.now());
    const express = currentPar != null && Clock.t0 != null && Clock.legNow() / 1000 < currentPar;
    meter.classList.toggle('express', express);
  }, 200);

  // ───────── progress stamps in the header ─────────
  function progress(active, doneCount) {
    $('#progress').innerHTML = LEGS.map((l, i) =>
      `<span class="mini ${i < doneCount ? 'done' : i === active ? 'now' : ''}" title="${l.title}">${PMArt.icon[l.id]}</span>`).join('');
  }

  // ───────── state ─────────
  let results = [];
  let senderState = null;
  const freshSender = () => ({ seen: 0, clear: [], wiped: [], wrong: 0, solved: false, value: 0 });
  const speedBonus = (score, secs, par) => !par || score <= 0 ? 0 : Math.round(SPEED_MAX * Math.max(0, Math.min(1, (par - secs) / (par / 2))));
  function senderSolved() {
    const album = store.get('album', {});
    album[issue] = { name: day.sender.name, emoji: day.sender.emoji, tint: day.sender.tint };
    store.set('album', album);
  }
  const senderEmoji = st => st.solved ? `${day.sender.emoji} on clue ${st.solvedAt || st.seen}` : '❔';

  // ───────── screens ─────────
  function home() {
    progress(-1, 0);
    const saved = store.get('day:' + issue);
    if (saved && !params.has('replay')) return summary(saved, true);
    const stats = getStats();
    const waiting = rivalsFor(issue);
    stage.innerHTML = `
      ${isBack ? `<div class="telegram back-banner enter"><span class="tg-animal">🗂️</span><p>A back issue from <b>${esc(dateLabel)}</b>. It counts toward your routes and best grade, not your streak.</p><a class="btn small navy" href="./">Today</a></div>` : ''}
      ${waiting.length ? `<div class="telegram rival-banner enter"><span class="tg-animal">💌</span><p><b>${waiting.map(r => esc(r.name)).join(' and ')}</b> already delivered today's mail${waiting.length === 1 ? ` (${waiting[0].total} postage)` : ''}. Your turn. You'll see how you compare at the end.</p></div>` : ''}
      <section class="envelope enter">
        <div class="env-top">
          <div class="env-from">
            <div class="small-caps">From</div>
            <div class="hand">Pip the Otter<br>Sorting Office, Riverbank</div>
          </div>
          <div class="env-stamp-wrap">
            <div class="stamp-perf env-stamp"><div class="stamp-face t-sky">${PMArt.pip}<span class="stamp-val">No.${issue}</span></div></div>
            <div class="env-postmark">${PMArt.postmark('RIVERBANK', shortDate, '★')}</div>
          </div>
        </div>
        <div class="env-to">
          <div class="small-caps">To</div>
          <button class="hand to-name" id="toName" title="Change name">${esc(recipient())}</button>
          <div class="env-addr">${esc(dateLabel)}</div>
        </div>
        <div class="par-avion">Par avion · Air mail</div>
      </section>

      <section class="paper manifest enter">
        <div class="manifest-head">
          <span class="small-caps">${isBack ? 'Deliveries' : "Today's deliveries"}</span>
          <span class="hand theme">${esc(day.theme)}</span>
        </div>
        <ol class="route-list">
          ${LEGS.map(l => `<li><span class="rl-host">${PMArt.hostFor(l.id).svg}</span><span class="t">${l.title}</span><span class="dots"></span><span class="tag">${l.skill}</span></li>`).join('')}
        </ol>
        <button class="seal-btn" id="go"><span class="seal">P</span><span>${isBack ? 'Open this mail' : "Open today's mail"}</span></button>
        <p class="manifest-note">Somebody sent you mail ${isBack ? 'that day' : 'today'}. Each delivery brings a clue to <b>who it was</b>. The meter only runs while you play, and finishing fast earns an <b>Express</b> bonus.</p>
      </section>
      ${stats.played ? scoreboardHTML() + passportHTML(stats) : ''}
      ${TODAY > 1 && !isBack ? `<p class="menu-hint">Missed a day? <button class="btn link" data-sheet="archive">Back issues</button> are in the menu.</p>` : ''}`;
    wireSheetLinks(stage);
    $('#go').onclick = () => { inRoute = true; sfx('paper'); Clock.reset(); results = []; senderState = freshSender(); PMMap.loadHiRes(); openLeg(0); };
    $('#toName').onclick = () => {
      const n = prompt('Who is this mail addressed to?', store.get('name', ''));
      if (n !== null) { store.set('name', n.trim().slice(0, 24)); home(); }
    };
  }

  // After a couple of routes, players know the rules: skip the instructions envelope.
  const plays = () => store.get('plays', {});
  const experienced = id => (plays()[id] || 0) >= 2;
  const countPlay = id => { const p = plays(); p[id] = (p[id] || 0) + 1; store.set('plays', p); };
  function openLeg(i) {
    if (LEGS[i].id === 'sender' && senderState.solved) {
      results.push({ id: 'sender', score: senderState.value, bonus: 0, secs: 0, emoji: senderEmoji(senderState) });
      return finishRoute();
    }
    return experienced(LEGS[i].id) ? play(i) : intro(i);
  }

  function intro(i) {
    const leg = LEGS[i];
    progress(i, i);
    currentPar = null;
    stage.innerHTML = `
      <section class="sealed enter">
        <div class="sealed-count small-caps">Delivery ${i + 1} of ${LEGS.length}</div>
        <div class="sealed-host">${PMArt.hostFor(leg.id).svg}</div>
        <h2>${leg.title}</h2>
        <p class="host-intro">with ${PMArt.hostFor(leg.id).name} the ${PMArt.hostFor(leg.id).kind}</p>
        <p>${leg.how}</p>
        <button class="seal-btn" id="play"><span class="seal">${i + 1}</span><span>Open</span></button>
        <div class="par">${leg.timed ? 'A timed round: 90 seconds' : leg.par ? `Express under ${leg.par} seconds` : 'Bonus round'}</div>
      </section>`;
    $('#play').onclick = () => { sfx('paper'); play(i); };
    $('#play').focus();
    window.scrollTo({ top: 0 });
  }

  function play(i) {
    const leg = LEGS[i];
    progress(i, i);
    Clock.leg = 0;
    currentPar = leg.par;
    stage.innerHTML = '';
    stage.classList.toggle('wide', leg.id === 'places');
    let finished = false;
    Clock.run(); // the meter starts the moment the envelope opens
    const data = leg.id === 'sender' ? { sender: day.sender, state: senderState, delivered: DELIVERIES } : day[leg.id];
    PMGames[leg.id](stage, data, {
      issue,
      run: () => Clock.run(),
      pause: () => Clock.pause(),
      done: r => {
        if (finished) return; finished = true;
        Clock.pause();
        countPlay(leg.id);
        const secs = Clock.leg / 1000;
        const bonus = speedBonus(r.score, secs, leg.par);
        if (leg.id === 'sender') {
          results.push({ id: leg.id, score: r.score, bonus: 0, secs, emoji: r.solved ? senderEmoji(senderState) : '❔' });
          if (r.solved) senderSolved();
        } else {
          results.push({ id: leg.id, score: r.score, bonus, secs, emoji: r.emoji });
          senderState.seen = i + 1;
          senderState.clear[i] = r.score >= CLEAR_CLUE;
        }
        legResult(i, r, bonus, secs);
      }
    });
    window.scrollTo({ top: 0 });
  }

  // The game's host says how it went.
  function hostReaction(id, score) {
    const h = PMArt.hostFor(id);
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const line = score >= 85 ? pick(['Superb! First-class work.', 'Wonderful. That’s a top delivery.', 'Brilliant, just brilliant.'])
      : score >= 60 ? pick(['Nicely done!', 'Good work. That’ll travel well.', 'Lovely job.'])
      : score >= 30 ? pick(['Not bad at all.', 'A decent delivery.', 'Got there in the end!'])
      : pick(['A tricky one today. Tomorrow’s another day!', 'Oh well, they can’t all be easy.']);
    return `<div class="host-bar enter ${score >= 60 ? 'mood-happy hop' : score < 30 ? 'mood-oops' : ''}"><div class="host-art">${h.svg}</div><div class="bubble"><span class="host-name">${h.name} the ${h.kind}</span><span class="bubble-text">${line}</span></div></div>`;
  }

  function legResult(i, r, bonus, secs) {
    const leg = LEGS[i];
    progress(-1, i + 1);
    currentPar = null;
    stage.classList.remove('wide');
    const last = i === LEGS.length - 1;
    sfx('stamp');
    stage.innerHTML = `
      ${hostReaction(leg.id, r.score)}
      <section class="paper result enter">
        <div class="result-mark">${PMArt.postmark('DELIVERED', leg.mark, String(r.score))}</div>
        <div class="result-line">
          <span><b>${r.score}</b> postage</span>
          ${leg.par ? `<span class="${bonus ? 'express-yes' : 'muted'}">${bonus ? `Express +${bonus}` : 'No express'} · ${Math.round(secs)}s</span>` : `<span class="muted">${leg.timed ? 'Timed round' : 'Bonus round'}</span>`}
        </div>
        ${i < DELIVERIES ? `<div class="letter-earned ${r.score >= CLEAR_CLUE ? '' : 'down'}"><span class="ptile ${r.score >= CLEAR_CLUE ? '' : 'down'}">${r.score >= CLEAR_CLUE ? '✓' : '~'}</span>${r.score >= CLEAR_CLUE ? 'A new clue to the sender arrived, clear as day.' : 'A new clue arrived, but it got smudged in the rain.'}</div>` : ''}
        <div class="recap">${r.recap || ''}</div>
      </section>
      ${i < DELIVERIES ? '<div id="senderHost"></div>' : ''}
      <div id="nextHost" class="dock"></div>`;
    const nextBtn = () => {
      const toSender = i === DELIVERIES - 1;
      $('#nextHost').innerHTML = last || (toSender && senderState.solved)
        ? `<button class="btn primary big" id="next">${last ? 'Back to the sorting office' : 'Finish the route'}</button>`
        : `<button class="seal-btn" id="next"><span class="seal">${i + 2}</span><span>Open: ${LEGS[i + 1].title}</span></button>`;
      $('#next').onclick = () => { sfx('paper'); last ? finishRoute() : openLeg(i + 1); };
    };
    if (i < DELIVERIES) PMGames.senderCard($('#senderHost'), day.sender, senderState, { delivered: DELIVERIES, onSolved: () => { senderSolved(); nextBtn(); } });
    nextBtn();
    window.scrollTo({ top: 0 });
  }

  function finishRoute() {
    const total = results.reduce((a, r) => a + r.score + r.bonus, 0);
    inRoute = false;
    const record = { issue, results, total, timeMs: Clock.total, at: Date.now(), v: 3 };
    if (!params.has('replay') || !store.get('day:' + issue)) {
      store.set('day:' + issue, record);
      updateStats(record);
    }
    summary(record, false);
  }

  // ───────── summary + share ─────────
  const gradeFor = total => GRADES.find(([min]) => total >= min)[1];
  const gradeName = g => GRADE_NAME[g[0]];
  const rankFor = total => { const g = gradeFor(total); return `Grade ${g} · ${gradeName(g)}`; };

  function shareText(rec) {
    const lines = [`Postmarked No. ${rec.issue} 📮`];
    // The sender's own emoji would give the answer away, so the message only says whether, and how soon.
    rec.results.forEach(r => {
      if (legOf(r.id).id !== 'sender') return lines.push(r.emoji);
      const clue = String(r.emoji).match(/on clue (\d+)/);
      lines.push(r.score > 0 || clue ? `Sender: ✅${clue ? ` on clue ${clue[1]}` : ''}` : 'Sender: ❔');
    });
    const bonus = rec.results.reduce((a, r) => a + r.bonus, 0);
    lines.push(`${rec.total} postage · ${fmtTime(rec.timeMs)}${bonus ? ` · express +${bonus}` : ''}`);
    lines.push(rankFor(rec.total));
    lines.push(compareLink(rec));
    return lines.join('\n');
  }
  function compareLink(rec) {
    const base = location.protocol.startsWith('http') ? location.origin + location.pathname : 'https://YOUR-SITE/';
    const q = new URLSearchParams({ from: store.get('name', '') || 'A friend', no: rec.issue, s: rec.results.map(r => r.score + r.bonus).join('.'), t: Math.round(rec.timeMs / 1000) });
    return `${base}?${q}`;
  }

  function compareHTML(rec) {
    const rivals = rivalsFor(rec.issue);
    if (!rivals.length) return '';
    const me = store.get('name', '') || 'You';
    return rivals.map(rv => {
      const rows = rec.results.map((r, k) => {
        const mine = r.score + r.bonus, theirs = rv.scores[k];
        const l = legOf(r.id);
        return `<tr><td>${l.title}</td><td class="${mine > theirs ? 'win' : ''}">${mine}</td><td class="${theirs > mine ? 'win' : ''}">${theirs ?? '—'}</td></tr>`;
      }).join('');
      const iWin = rec.total > rv.total, tie = rec.total === rv.total;
      return `
        <section class="paper versus enter">
          <span class="small-caps">Head to head · No. ${rec.issue}</span>
          <h2>${tie ? 'A dead heat' : iWin ? `You beat ${esc(rv.name)}` : `${esc(rv.name)} wins this one`}</h2>
          <table class="ledger vs-table">
            <tr class="vs-head"><td></td><td>${esc(me)}</td><td>${esc(rv.name)}</td></tr>
            ${rows}
            <tr class="vs-total"><td>Total</td><td class="${iWin ? 'win' : ''}">${rec.total}</td><td class="${!iWin && !tie ? 'win' : ''}">${rv.total}</td></tr>
            <tr><td>Route time</td><td>${fmtTime(rec.timeMs)}</td><td>${rv.timeMs ? fmtTime(rv.timeMs) : '—'}</td></tr>
          </table>
        </section>`;
    }).join('');
  }

  // Wins/losses against each person who has sent you results.
  function scoreboardHTML() {
    const rivals = store.get('rivals', {});
    const tally = {};
    Object.entries(rivals).forEach(([no, byName]) => {
      const mine = store.get('day:' + no);
      if (!mine) return;
      Object.values(byName).forEach(rv => {
        const t = tally[rv.name] = tally[rv.name] || { w: 0, l: 0, d: 0 };
        if (mine.total > rv.total) t.w++; else if (mine.total < rv.total) t.l++; else t.d++;
      });
    });
    const names = Object.keys(tally);
    if (!names.length) return '';
    return `<section class="paper scoreboard enter"><span class="small-caps">Household scoreboard</span>
      ${names.map(n => `<div class="sb-row"><span class="hand sb-name">vs ${esc(n)}</span><span class="sb-score"><b>${tally[n].w}</b>–<b>${tally[n].l}</b>${tally[n].d ? `<small> (${tally[n].d} tied)</small>` : ''}</span></div>`).join('')}
    </section>`;
  }

  function summary(rec, revisit) {
    progress(-1, LEGS.length);
    currentPar = null;
    meter.querySelector('.meter-time').textContent = fmtTime(rec.timeMs);
    const bonus = rec.results.reduce((a, r) => a + r.bonus, 0);
    const text = shareText(rec);
    if (!revisit) sfx('rare');
    stage.innerHTML = `
      <section class="paper manifest receipt enter">
        <div class="receipt-head">
          <span class="small-caps">Delivery receipt · No. ${rec.issue}</span>
          <h1>${revisit ? (rec.issue < TODAY ? `No. ${rec.issue} is delivered` : "Today's mail is delivered") : 'All delivered'}</h1>
          <div class="grade-wrap"><div class="grade grade-${gradeFor(rec.total)[0]}">${gradeFor(rec.total)}</div><div class="hand rank">${gradeName(gradeFor(rec.total))}</div></div>
        </div>
        <div class="totals">
          <div><b>${rec.total}</b><span>postage</span></div>
          <div><b>${fmtTime(rec.timeMs)}</b><span>route time</span></div>
          <div><b>+${bonus}</b><span>express</span></div>
        </div>
        <table class="ledger receipt-table">
          ${rec.results.map(r => { const l = legOf(r.id); return `<tr><td class="ri">${PMArt.icon[l.id]}</td><td>${l.title}<div class="em">${r.emoji}</div></td><td class="num">${r.score + r.bonus}</td></tr>`; }).join('')}
        </table>
        <div class="receipt-mark">${PMArt.postmark('POSTMARKED', shortDate, String(rec.total))}</div>
        <button class="btn primary big" id="share">Send your results</button>
        <pre class="share-preview">${esc(text)}</pre>
        <p class="share-tip">The link lets whoever you send it to compare their route with yours.</p>
      </section>
      ${compareHTML(rec)}
      ${scoreboardHTML()}
      ${passportHTML(getStats())}
      <div class="menu-row"><button class="btn" data-sheet="album">Stamp album</button><button class="btn" data-sheet="archive">Back issues</button></div>
      ${rec.issue < TODAY
        ? `<div class="back-again"><a class="btn link" href="?day=${rec.issue}&replay">Play it again (won't change your score)</a><a class="btn navy big" href="./">Go to today's mail</a></div>`
        : `<p class="sign-off hand">Pip will be back tomorrow morning with more mail.</p>`}`;
    wireSheetLinks(stage);
    $('#share').onclick = () => {
      if (!store.get('name', '')) {
        const n = prompt('Sign your postcard. What name should your results show?', '');
        if (n && n.trim()) store.set('name', n.trim().slice(0, 24));
      }
      const t = shareText(rec);
      stage.querySelector('.share-preview').textContent = t;
      share(t);
    };
  }

  // ───────── back issues: every past day, newest first ─────────
  const themeCache = {};
  const themeOf = n => themeCache[n] = themeCache[n] || (() => { try { return PMDaily.build(n).theme; } catch { return ''; } })();
  const pastDays = () => Array.from({ length: TODAY - 1 }, (_, k) => TODAY - 1 - k);
  function archiveHTML() {
    const got = store.get('album', {});
    const days = pastDays();
    const playedCount = days.filter(n => store.get('day:' + n)).length;
    const row = n => {
      const rec = store.get('day:' + n), stamp = got[n];
      const date = new Date(EPOCH.getTime() + (n - 1) * 86400000);
      const when = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const g = rec ? gradeFor(rec.total) : null;
      return `<a class="ar-row${rec ? ' done' : ''}${n === issue ? ' here' : ''}" href="?day=${n}" data-leave>
        <span class="ar-no"><small>No.</small>${n}</span>
        <span class="ar-mid"><b>${esc(when)}</b><span class="ar-theme">${esc(themeOf(n))}</span></span>
        <span class="ar-end">${rec
          ? `${stamp ? `<span class="ar-stamp" title="${esc(stamp.name)}">${stamp.emoji}</span>` : ''}<span class="ar-grade grade-${g[0]}">${g}</span>`
          : '<span class="ar-play">Play</span>'}</span>
      </a>`;
    };
    return `
      <section class="album archive">
        <header class="album-head">
          <span class="small-caps">Back issues</span>
          <h1>${playedCount} of ${days.length} delivered</h1>
          <p class="muted">Missed a day? Every past route is here, exactly as it was. They count toward your routes and best grade, not your streak.</p>
        </header>
        ${days.length ? `<div class="ar-list">${days.map(row).join('')}</div>` : '<p class="muted center">No back issues yet. Tomorrow, today’s mail will be the first.</p>'}
      </section>`;
  }

  // ───────── stamp album ─────────
  function albumHTML() {
    const got = store.get('album', {});
    const slots = Math.max(TODAY, ...Object.keys(got).map(Number), 6);
    const owned = Object.keys(got).length;
    return `
      <section class="album">
        <header class="album-head">
          <span class="small-caps">Stamp album</span>
          <h1>${owned} of ${slots} collected</h1>
          <p class="muted">Guess who sent the day's mail to add their stamp.</p>
        </header>
        <div class="album-grid">
          ${Array.from({ length: slots }, (_, k) => {
            const s = got[k + 1];
            return s
              ? `<figure class="album-slot"><div class="stamp-perf album-stamp"><div class="stamp-face t-${s.tint || 'sky'}"><span class="album-emoji">${s.emoji}</span><span class="stamp-val">No.${k + 1}</span></div></div><figcaption>${esc(s.name)}</figcaption></figure>`
              : `<figure class="album-slot empty"><div class="album-hole">No.${k + 1}</div><figcaption>&nbsp;</figcaption></figure>`;
          }).join('')}
        </div>
      </section>`;
  }

  // ───────── how to play ─────────
  function helpHTML() {
    const games = ['chain', 'places', 'cross', 'order', 'scale', 'sender'].map(legOfId);
    return `
      <section class="paper help">
        <span class="small-caps">How to play</span>
        <h1>A daily mail route</h1>
        <p>Every day brings four deliveries: <b>Chain Letter</b>, one rotating game, <b>The Postal Scale</b>, and <b>Who Sent This?</b> Each delivery pays up to 100 postage, plus up to 20 for an <b>Express</b> finish. The meter only runs while you play.</p>
        <p>Somebody sent you the mail. Each delivery brings a clue to who it was (a good score sends it clear). Guess them for up to 60 more and their stamp goes in your album.</p>
        ${games.map(g => `<div class="help-game"><span class="help-host">${PMArt.hostFor(g.id).svg}</span><div><h3>${esc(g.title)} <small>${esc(g.skill)}</small></h3><p>${esc(g.how)}</p></div></div>`).join('')}
        <p class="muted">The rotating game goes Where’s This From? → Cross Post → Return to Sender. Grades run from S (350+) down to F.</p>
      </section>`;
  }

  async function share(text) {
    const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (mobile && navigator.share) {
      try { await navigator.share({ text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); toast('Copied. Paste it in a text.'); }
    catch { prompt('Copy your results:', text); }
  }

  // ───────── passport (local stats) ─────────
  function getStats() { return store.get('stats', { played: 0, streak: 0, best: 0, lastIssue: 0 }); }
  function updateStats(rec) {
    const s = getStats();
    if (rec.issue < TODAY) {   // a back issue: counts as a route and can set a best, but leaves the streak alone
      s.played++;
      s.best4 = Math.max(s.best4 || 0, rec.total);
      store.set('stats', s);
      return;
    }
    if (s.lastIssue === rec.issue) return;
    s.played++;
    s.streak = s.lastIssue === rec.issue - 1 ? s.streak + 1 : 1;
    s.best4 = Math.max(s.best4 || 0, rec.total);
    s.lastIssue = rec.issue;
    store.set('stats', s);
  }
  function passportHTML(s) {
    return `<section class="passport-card enter">
      <div class="pc-cover"><span class="small-caps">Passport</span>${PMArt.icon.customs}</div>
      <div class="pc-stats">
        <div><b>${s.played}</b><span>routes</span></div>
        <div><b>${s.streak}</b><span>day streak</span></div>
        <div><b>${s.best4 ? gradeFor(s.best4) : '—'}</b><span>best</span></div>
      </div></section>`;
  }

  // ───────── menu ─────────
  // A sheet over the page, so opening it mid-route loses nothing (the meter pauses while it's open).
  // Anything that leaves the page (another day, today's mail) asks first if a route is under way.
  let inRoute = false, sheetPausedClock = false;
  const sheet = document.createElement('div');
  sheet.className = 'sheet'; sheet.hidden = true;
  document.body.appendChild(sheet);
  const soundLabel = () => PMSound.muted ? 'Sound is off' : 'Sound is on';
  function menuHTML() {
    const got = Object.keys(store.get('album', {})).length;
    const days = pastDays(), done = days.filter(n => store.get('day:' + n)).length;
    const item = (attrs, icon, title, sub) => `<${attrs.startsWith('href') ? 'a' : 'button'} class="menu-item" ${attrs}><span class="mi-ico">${icon}</span><span class="mi-text"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="mi-go">›</span></${attrs.startsWith('href') ? 'a' : 'button'}>`;
    return `<nav class="menu-list">
      ${item('href="./" data-leave', '📬', 'Today’s mail', `No. ${TODAY} · ${esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}`)}
      ${item('data-sheet="archive"', '🗂️', 'Back issues', days.length ? `${done} of ${days.length} delivered` : 'None yet')}
      ${item('data-sheet="album"', '🖼️', 'Stamp album', `${got} collected`)}
      ${item('data-sheet="passport"', '🛂', 'Passport & scores', 'Streak, best grade, head to head')}
      ${item('data-sheet="help"', '❓', 'How to play', 'All the games and scoring')}
      ${item('data-act="name"', '✏️', 'Your name', esc(store.get('name', '') || 'Not set'))}
      ${item('data-act="sound"', PMSound.muted ? '🔇' : '🔊', soundLabel(), 'Tap to switch')}
    </nav>
    ${inRoute ? '<p class="sheet-note">The meter is paused while the menu is open.</p>' : ''}`;
  }
  const VIEWS = {
    menu: menuHTML, archive: archiveHTML, album: albumHTML, help: helpHTML,
    passport: () => passportHTML(getStats()) + (scoreboardHTML() || '<p class="muted center sheet-note">Send your results to someone who plays too, and a head-to-head scoreboard shows up here.</p>')
  };
  function openSheet(view) {
    if (sheet.hidden) {
      sheetPausedClock = Clock.t0 != null;
      if (sheetPausedClock) Clock.pause();
      sheet.hidden = false;
      document.body.classList.add('sheet-open');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
    sheet.innerHTML = `<div class="sheet-backdrop"></div>
      <div class="sheet-panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="sheet-head">${view === 'menu' ? '<span class="sheet-title">Menu</span>' : '<button class="sheet-nav" data-sheet="menu">‹ Menu</button>'}<button class="sheet-close" aria-label="Close menu">✕</button></div>
        <div class="sheet-body">${VIEWS[view]()}</div>
      </div>`;
    sheet.querySelector('.sheet-body').scrollTop = 0;
    sheet.querySelector('.sheet-backdrop').onclick = closeSheet;
    sheet.querySelector('.sheet-close').onclick = closeSheet;
    wireSheetLinks(sheet);
    const nameBtn = sheet.querySelector('[data-act=name]');
    if (nameBtn) nameBtn.onclick = () => {
      const n = prompt('What name should your mail and results show?', store.get('name', ''));
      if (n === null) return;
      store.set('name', n.trim().slice(0, 24));
      const to = $('#toName'); if (to) to.textContent = recipient();
      openSheet('menu');
    };
    const soundBtn = sheet.querySelector('[data-act=sound]');
    if (soundBtn) soundBtn.onclick = () => { PMSound.toggle(); sfx('tick'); openSheet('menu'); };
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.hidden = true; sheet.innerHTML = '';
    document.body.classList.remove('sheet-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (sheetPausedClock) Clock.run();
    sheetPausedClock = false;
  }
  // Buttons with data-sheet open that page of the menu; links with data-leave check before abandoning a route.
  function wireSheetLinks(root) {
    root.querySelectorAll('[data-sheet]').forEach(b => b.onclick = () => { sfx('paper'); openSheet(b.dataset.sheet); });
    root.querySelectorAll('[data-leave]').forEach(a => a.onclick = e => {
      if (inRoute && !confirm('Leave this route? Your progress on it so far won’t be saved.')) e.preventDefault();
    });
  }
  const menuBtn = $('#menuBtn');
  menuBtn.onclick = () => { sfx('tick'); sheet.hidden ? openSheet('menu') : closeSheet(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  // ───────── footer ─────────
  // Playtest links show only with ?dev in the address (they carry it along, so you can hop between days).
  $('#foot').innerHTML = `<span>Postmarked · a daily mail route</span>` + (params.has('dev')
    ? `<span class="dev">Playtest: ${Array.from({ length: 12 }, (_, k) => `<a href="?day=${k + 1}&replay&dev">${k + 1}</a>`).join(' ')}</span>`
    : '');

  // ───────── keep the answer box above the phone keyboard ─────────
  // When a text box is focused, scroll so the part you need (the letter to start with, the clues) sits just under the
  // header and the box itself, plus Dot's reply under it, clears the keyboard. Runs again as the keyboard slides up.
  function fitFocused() {
    const el = document.activeElement;
    if (!el || !el.matches || !el.matches('.text-input')) return;
    const vv = window.visualViewport, vh = vv ? vv.height : innerHeight;
    const bar = document.querySelector('.topbar'), barH = bar ? bar.getBoundingClientRect().bottom : 0;
    const box = el.closest('form') || el, anchor = el.closest('section, article')?.querySelector('[data-fit-top]') || box;
    const fb = box.nextElementSibling && box.nextElementSibling.classList.contains('feedback') ? box.nextElementSibling : box;
    const y0 = scrollY, top = anchor.getBoundingClientRect().top + y0, bottom = fb.getBoundingClientRect().bottom + y0;
    let y = top - barH - 8;                                    // anchor right under the header…
    if (bottom + 8 > y + vh) y = bottom + 8 - vh;               // …unless that would hide the box itself
    if (Math.abs(y - y0) > 4) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
  document.addEventListener('focusin', e => {
    if (!e.target.matches || !e.target.matches('.text-input')) return;
    setTimeout(fitFocused, 60); setTimeout(fitFocused, 450);
  });
  if (window.visualViewport) visualViewport.addEventListener('resize', () => setTimeout(fitFocused, 30));

  // ───────── offline support (sw.js). Only over https or on localhost. ─────────
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  home();
})();

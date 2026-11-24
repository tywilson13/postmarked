// Tiny synthesized sound effects (no audio files). Muted state is remembered.
(function () {
  'use strict';
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('pm:muted') === '1'; } catch { /* ignore */ }

  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  function tone(freq, dur, { type = 'sine', vol = 0.15, at = 0, slide = 0 } = {}) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + at;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, { vol = 0.12, at = 0, freq = 1200, q = 0.8 } = {}) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + at;
    const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = a.createGain(); g.gain.value = vol;
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  }

  const SOUNDS = {
    key: () => noise(0.03, { vol: 0.05, freq: 3000 }),
    tick: () => tone(1400, 0.05, { type: 'triangle', vol: 0.06 }),
    paper: () => noise(0.18, { vol: 0.09, freq: 2500, q: 0.5 }),
    stamp: () => { tone(110, 0.12, { type: 'sine', vol: 0.35, slide: -50 }); noise(0.07, { vol: 0.18, freq: 600 }); },
    wrong: () => { tone(220, 0.12, { type: 'square', vol: 0.05 }); tone(185, 0.18, { type: 'square', vol: 0.05, at: 0.09 }); },
    right: () => { tone(660, 0.12, { type: 'triangle', vol: 0.1 }); tone(880, 0.2, { type: 'triangle', vol: 0.1, at: 0.08 }); },
    rare: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.08, at: i * 0.07 })),
    fly: () => { noise(0.9, { vol: 0.05, freq: 900, q: 0.4 }); tone(300, 0.9, { type: 'sine', vol: 0.025, slide: 260 }); }
  };

  window.PMSound = {
    play(name) {
      if (muted || !SOUNDS[name]) return;
      try { SOUNDS[name](); } catch { /* audio not available */ }
      if (navigator.vibrate && (name === 'stamp' || name === 'wrong')) { try { navigator.vibrate(name === 'stamp' ? 12 : [8, 40, 8]); } catch { /* ignore */ } }
    },
    get muted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem('pm:muted', muted ? '1' : '0'); } catch { /* ignore */ } return muted; }
  };
})();

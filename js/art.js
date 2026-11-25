// Hand-built SVG art: Pip the otter, delivery icons, compass rose, postmarks.
(function () {
  'use strict';
  const NAVY = '#1d3557', RED = '#b8282e', RED_D = '#8c1c21', CREAM = '#f4ecd8', GOLD = '#d9a321', BROWN = '#7b4b2a', BROWN_D = '#5c3519', MUZZLE = '#efd9b8';
  const INK = '#231a14';

  // Eyes for every character. .f-n is the resting face; a .mood-happy or .mood-oops class on any ancestor swaps it.
  function face(lx, rx, y, r = 5.2) {
    const eye = x => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff"/>`;
    const happy = x => `<path d="M${x - r} ${y + 1.5} Q${x} ${y - r - 1.5} ${x + r} ${y + 1.5}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    const wide = x => `<circle cx="${x}" cy="${y}" r="${r + 1}" fill="#fff" stroke="${INK}" stroke-width="1.6"/><circle cx="${x}" cy="${y + .6}" r="${r * .55}" fill="${INK}"/>`;
    return `<g class="f-n">${eye(lx)}${eye(rx)}</g><g class="f-h">${happy(lx)}${happy(rx)}</g>` +
      `<g class="f-o">${wide(lx)}${wide(rx)}<path d="M${rx + r + 10} ${y - 14} q-4.5 6.5 0 9 q4.5 -2.5 0 -9z" fill="#8cc4e8" stroke="#5b9cc4" stroke-width=".8"/></g>`;
  }
  const blush = (lx, rx, y) => `<ellipse cx="${lx}" cy="${y}" rx="6" ry="3.5" fill="#e98b7a" opacity=".55"/><ellipse cx="${rx}" cy="${y}" rx="6" ry="3.5" fill="#e98b7a" opacity=".55"/>`;
  const shadow = '<ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>';
  const bodyPath = 'M26 128 C24 100 38 86 60 86 C82 86 96 100 94 128 Z';
  const bellyPath = 'M42 128 C42 108 48 98 60 98 C72 98 78 108 78 128 Z';

  const pip = `
  <svg viewBox="0 0 120 130" class="pip" aria-label="Pip the otter, in a postal cap">
    <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>
    <path d="M24 128 C22 98 34 84 60 84 C86 84 98 98 96 128 Z" fill="${BROWN}"/>
    <path d="M42 128 C42 108 48 98 60 98 C72 98 78 108 78 128 Z" fill="${MUZZLE}"/>
    <circle cx="27" cy="52" r="10" fill="${BROWN}"/><circle cx="27" cy="52" r="5" fill="${BROWN_D}"/>
    <circle cx="93" cy="52" r="10" fill="${BROWN}"/><circle cx="93" cy="52" r="5" fill="${BROWN_D}"/>
    <ellipse cx="60" cy="62" rx="36" ry="33" fill="${BROWN}"/>
    <ellipse cx="60" cy="76" rx="25" ry="17" fill="${MUZZLE}"/>
    <ellipse cx="38" cy="76" rx="6" ry="3.5" fill="#e98b7a" opacity=".55"/>
    <ellipse cx="82" cy="76" rx="6" ry="3.5" fill="#e98b7a" opacity=".55"/>
    ${face(46, 74, 61)}
    <path d="M54 68.5 Q60 65.5 66 68.5 Q66 73 60 74.5 Q54 73 54 68.5 Z" fill="#231a14"/>
    <path d="M60 74.5 V77 M60 77 Q56 81.5 52 79 M60 77 Q64 81.5 68 79" stroke="#231a14" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g stroke="#5c3519" stroke-width="1" stroke-linecap="round" opacity=".7">
      <path d="M44 74 L30 71 M44 78 L30 79"/><path d="M76 74 L90 71 M76 78 L90 79"/>
    </g>
    <path d="M28 40 Q60 8 92 40 Z" fill="${NAVY}"/>
    <rect x="27" y="35" width="66" height="8" rx="2" fill="${RED}"/>
    <path d="M22 44 Q60 36 98 44 Q99 49 94 48 Q60 42 26 48 Q21 49 22 44 Z" fill="#14253d"/>
    <circle cx="60" cy="27" r="5" fill="${GOLD}"/><path d="M57.5 27 h5 M60 24.5 v5" stroke="${NAVY}" stroke-width="1.2"/>
    <g transform="translate(60 108) rotate(-6)">
      <rect x="-21" y="-12" width="42" height="26" rx="2" fill="${CREAM}" stroke="#c9b68f"/>
      <path d="M-21 -12 L0 4 L21 -12" fill="none" stroke="#c9b68f" stroke-width="1.5"/>
      <rect x="10" y="-9" width="8" height="9" fill="${RED}" opacity=".85"/>
    </g>
    <ellipse cx="38" cy="104" rx="8" ry="6" fill="${BROWN_D}"/><ellipse cx="82" cy="104" rx="8" ry="6" fill="${BROWN_D}"/>
  </svg>`;

  // ───────── the other postal workers. Same build as Pip: 120 × 130, body, head, face. ─────────
  // Gus the goose flies the air mail: leather cap, goggles, red scarf.
  const gus = `
  <svg viewBox="0 0 120 130" class="host-svg" aria-label="Gus the goose, in a flying cap">
    ${shadow}
    <path d="${bodyPath}" fill="#fbf8f0" stroke="#ddd3bd" stroke-width="1.5"/>
    <path d="M30 116 C20 106 22 96 31 98 C37 100 39 108 37 118 Z" fill="#ece3cf"/>
    <path d="M90 116 C100 106 98 96 89 98 C83 100 81 108 83 118 Z" fill="#ece3cf"/>
    <path d="M74 94 L88 116 L79 118 L69 97 Z" fill="${RED_D}"/>
    <path d="M37 87 Q60 98 83 87 L85 95 Q60 107 35 95 Z" fill="${RED}"/>
    <circle cx="60" cy="58" r="30" fill="#fbf8f0" stroke="#ddd3bd" stroke-width="1.5"/>
    <path d="M31 50 Q28 64 34 71 Q39 62 38 51 Z" fill="#8a5a35"/>
    <path d="M89 50 Q92 64 86 71 Q81 62 82 51 Z" fill="#8a5a35"/>
    <path d="M31 53 Q30 24 60 22 Q90 24 89 53 Q82 41 60 40 Q38 41 31 53 Z" fill="#8a5a35"/>
    <path d="M34 38 Q60 31 86 38" stroke="#5c3519" stroke-width="3" fill="none"/>
    <circle cx="49" cy="36" r="8" fill="#bcd3e2" stroke="#5c3519" stroke-width="3"/>
    <circle cx="71" cy="36" r="8" fill="#bcd3e2" stroke="#5c3519" stroke-width="3"/>
    <path d="M45 33 l3 -2.5 M67 33 l3 -2.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    ${blush(39, 81, 69)}
    ${face(48, 72, 57)}
    <path d="M47 67 Q60 61 73 67 Q71 78 60 79 Q49 78 47 67 Z" fill="#f0a032"/>
    <path d="M50 70.5 Q60 74 70 70.5" stroke="#c57a18" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </svg>`;

  // Dot the woodpecker taps out the chain letters: red crest, green telegraph visor.
  const dot = `
  <svg viewBox="0 0 120 130" class="host-svg" aria-label="Dot the woodpecker, in a telegraph visor">
    ${shadow}
    <path d="${bodyPath}" fill="#3a3740"/>
    <path d="${bellyPath}" fill="#f3ede0"/>
    <g fill="#f3ede0"><circle cx="33" cy="108" r="2.6"/><circle cx="36" cy="118" r="2.6"/><circle cx="87" cy="108" r="2.6"/><circle cx="84" cy="118" r="2.6"/></g>
    <path d="M45 36 Q47 14 58 10 Q57 19 64 14 Q66 22 74 20 Q71 28 76 36 Z" fill="${RED}"/>
    <circle cx="60" cy="60" r="30" fill="#f7f2e6"/>
    <path d="M30 57 Q30 30 60 30 Q90 30 90 57 Q77 46 60 46 Q43 46 30 57 Z" fill="#2c2a30"/>
    <path d="M30 50 Q60 34 90 50 L94 57 Q60 43 26 57 Z" fill="#4f9a6a"/>
    <path d="M30 50 Q60 34 90 50" stroke="#2f6e48" stroke-width="1.5" fill="none"/>
    ${blush(40, 80, 72)}
    ${face(48, 72, 62)}
    <path d="M53 70 L67 70 L60 87 Z" fill="#9a8f80"/>
    <path d="M53 70 L67 70" stroke="#6f6559" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;

  // Mabel the pigeon packs the sacks (not always well). Her cap never sits straight.
  const mabel = `
  <svg viewBox="0 0 120 130" class="host-svg" aria-label="Mabel the pigeon, cap askew">
    ${shadow}
    <path d="${bodyPath}" fill="#c3bfd3"/>
    <path d="${bellyPath}" fill="#d9d5e4"/>
    <path d="M28 120 C20 108 24 98 32 99 C38 101 40 110 37 121 Z" fill="#a8a3bd"/>
    <path d="M92 120 C100 108 96 98 88 99 C82 101 80 110 83 121 Z" fill="#a8a3bd"/>
    <path d="M26 110 l9 2 M27 116 l9 1.5 M94 110 l-9 2 M93 116 l-9 1.5" stroke="#6f6a80" stroke-width="2" stroke-linecap="round"/>
    <path d="M36 85 Q60 97 84 85 L84 92 Q60 104 36 92 Z" fill="#5f9e8f"/>
    <path d="M37 89 Q60 101 83 89" stroke="#8a6fb3" stroke-width="2.5" fill="none"/>
    <circle cx="60" cy="59" r="29" fill="#c9c5d9"/>
    <circle cx="48" cy="59" r="7.6" fill="#f0a050"/><circle cx="72" cy="59" r="7.6" fill="#f0a050"/>
    ${blush(39, 81, 71)}
    ${face(48, 72, 59, 5)}
    <ellipse cx="60" cy="68.5" rx="5" ry="2.4" fill="#f4f0ea"/>
    <path d="M55.5 70 Q60 68 64.5 70 L60 79 Z" fill="#6a6470"/>
    <g transform="rotate(-16 60 34)">
      <path d="M36 40 Q60 14 84 40 Z" fill="${NAVY}"/>
      <rect x="35" y="36" width="50" height="7" rx="2" fill="${RED}"/>
      <path d="M31 44 Q60 37 89 44 Q90 48 86 47.5 Q60 42 34 47.5 Q30 48 31 44 Z" fill="#14253d"/>
      <circle cx="60" cy="28" r="4" fill="${GOLD}"/>
    </g>
  </svg>`;

  // Bramble the hedgehog minds the postal scale: round spectacles, navy bow tie.
  const spikes = (() => {
    const pts = [];
    for (let i = 0; i <= 26; i++) {
      const th = Math.PI * (1.1 - 1.2 * i / 26), R = i % 2 ? 34 : 46;
      pts.push(`${(60 + R * Math.cos(th)).toFixed(1)} ${(72 - R * Math.sin(th)).toFixed(1)}`);
    }
    return 'M' + pts.join(' L') + ' Z';
  })();
  const bramble = `
  <svg viewBox="0 0 120 130" class="host-svg" aria-label="Bramble the hedgehog, in spectacles">
    ${shadow}
    <circle cx="60" cy="72" r="36" fill="#7a5634"/>
    <path d="${spikes}" fill="#7a5634" stroke="#5c3d22" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M28 128 C26 102 40 90 60 90 C80 90 94 102 92 128 Z" fill="#7a5634"/>
    <path d="${bellyPath}" fill="#f0dcc0"/>
    <circle cx="40" cy="47" r="6.5" fill="#e6c9a5" stroke="#c9a57c"/><circle cx="80" cy="47" r="6.5" fill="#e6c9a5" stroke="#c9a57c"/>
    <ellipse cx="60" cy="66" rx="25" ry="23" fill="#f0dcc0"/>
    <ellipse cx="60" cy="77" rx="10" ry="8" fill="#f0dcc0"/>
    ${blush(40, 80, 74)}
    ${face(49, 71, 63, 4.6)}
    <g fill="rgba(255,255,255,.22)" stroke="${GOLD}" stroke-width="2"><circle cx="49" cy="63" r="8.5"/><circle cx="71" cy="63" r="8.5"/></g>
    <path d="M57.5 62 Q60 60 62.5 62" stroke="${GOLD}" stroke-width="2" fill="none"/>
    <ellipse cx="60" cy="74.5" rx="4.6" ry="3.6" fill="${INK}"/><circle cx="58.6" cy="73.4" r="1.2" fill="#fff"/>
    <path d="M56 81 Q60 84 64 81" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M60 94 L49 88 L49 100 Z M60 94 L71 88 L71 100 Z" fill="${NAVY}"/><circle cx="60" cy="94" r="3" fill="#14253d"/>
  </svg>`;

  // Hazel the owl sets the crosswords, pencil tucked behind one ear tuft.
  const hazel = `
  <svg viewBox="0 0 120 130" class="host-svg" aria-label="Hazel the owl, with a pencil">
    ${shadow}
    <path d="${bodyPath}" fill="#a8794c"/>
    <path d="${bellyPath}" fill="#ead6b1"/>
    <path d="M53 108 l3.5 3 l3.5 -3 M60 108 l3.5 3 l3.5 -3 M56 117 l3.5 3 l3.5 -3" stroke="#a8794c" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M28 122 C18 110 22 98 31 99 C38 101 40 112 37 124 Z" fill="#7f5733"/>
    <path d="M92 122 C102 110 98 98 89 99 C82 101 80 112 83 124 Z" fill="#7f5733"/>
    <g transform="rotate(32 88 30)"><rect x="85" y="10" width="6" height="28" fill="${GOLD}"/><path d="M85 38 L91 38 L88 45 Z" fill="#efd9b8"/><path d="M87 42.5 L89 42.5 L88 45 Z" fill="${INK}"/><rect x="85" y="6" width="6" height="5" fill="#e98b7a"/></g>
    <path d="M30 46 L29 20 L47 36 Z" fill="#a8794c"/><path d="M90 46 L91 20 L73 36 Z" fill="#a8794c"/>
    <ellipse cx="60" cy="60" rx="34" ry="29" fill="#a8794c"/>
    <circle cx="47" cy="60" r="14" fill="#f3e3c4"/><circle cx="73" cy="60" r="14" fill="#f3e3c4"/>
    ${blush(36, 84, 72)}
    ${face(47, 73, 60, 5.6)}
    <path d="M56 68 L64 68 L60 78 Z" fill="#e9a23b"/>
  </svg>`;

  const hosts = {
    pip: { name: 'Pip', kind: 'otter', svg: pip },
    gus: { name: 'Gus', kind: 'goose', svg: gus },
    dot: { name: 'Dot', kind: 'woodpecker', svg: dot },
    mabel: { name: 'Mabel', kind: 'pigeon', svg: mabel },
    bramble: { name: 'Bramble', kind: 'hedgehog', svg: bramble },
    hazel: { name: 'Hazel', kind: 'owl', svg: hazel }
  };
  // Who runs which counter at the sorting office.
  const HOST_OF = { chain: 'dot', places: 'gus', postmark: 'gus', cross: 'hazel', cryptic: 'hazel', missorted: 'mabel', order: 'mabel', scale: 'bramble', sender: 'pip' };
  const hostFor = id => hosts[HOST_OF[id] || 'pip'];

  const icon = {
    cryptic: `<svg viewBox="0 0 32 32" class="ico"><rect x="3" y="7" width="26" height="18" rx="1.5"/><path d="M16 9v14M6 12h7M6 16h7M6 20h5"/><rect x="20" y="10" width="6" height="7" class="fill-red"/></svg>`,
    pins: `<svg viewBox="0 0 32 32" class="ico"><path d="M4 9l7-3 10 3 7-3v17l-7 3-10-3-7 3z"/><path d="M11 6v17M21 9v17"/><circle cx="16" cy="13" r="3" class="fill-red"/></svg>`,
    penpals: `<svg viewBox="0 0 32 32" class="ico"><rect x="4" y="6" width="24" height="20" rx="1"/><path d="M4 11h24"/><path d="M8 16h16M8 20h11"/><text x="16" y="10" text-anchor="middle" class="ico-txt">TELEGRAM</text></svg>`,
    mail: `<svg viewBox="0 0 32 32" class="ico"><path d="M6 13c0-4 4-7 10-7s10 3 10 7v13H6z"/><path d="M6 13h20"/><path d="M12 6c-2 2-2 5-1 7M20 6c2 2 2 5 1 7"/><rect x="12" y="17" width="8" height="5" class="fill-red"/></svg>`,
    finale: `<svg viewBox="0 0 32 32" class="ico"><rect x="5" y="11" width="22" height="16" rx="1"/><path d="M5 16h22M16 11v16"/><path d="M16 11c-3-5-8-5-7-1 1 2 5 1 7 1zM16 11c3-5 8-5 7-1-1 2-5 1-7 1z" class="fill-red"/></svg>`,
    postmark: `<svg viewBox="0 0 32 32" class="ico"><rect x="3" y="8" width="20" height="15" rx="1"/><path d="M3 8l10 8 10-8"/><circle cx="23" cy="20" r="6" class="fill-red"/><path d="M23 17v3.5l2 1.5" stroke="#f4ecd8"/></svg>`,
    chain: `<svg viewBox="0 0 32 32" class="ico"><g transform="rotate(-40 16 16)"><rect x="2" y="12" width="16" height="8" rx="4"/><rect x="14" y="12" width="16" height="8" rx="4" class="red-line"/></g></svg>`,
    missorted: `<svg viewBox="0 0 32 32" class="ico"><path d="M5 12c0-3 3-5 6-5s6 2 6 5v14H5z"/><path d="M17 14c0-3 3-5 5-5s5 2 5 5v12H17z"/><path d="M9 16l8 4M20 16l-6 6" class="red-line"/></svg>`,
    order: `<svg viewBox="0 0 32 32" class="ico"><rect x="9" y="4" width="19" height="7" rx="1"/><rect x="9" y="13" width="19" height="7" rx="1"/><rect x="9" y="22" width="19" height="7" rx="1"/><path d="M4 6v20M2 23l2 3 2-3" class="red-line"/></svg>`,
    scale: `<svg viewBox="0 0 32 32" class="ico"><path d="M6 22a10 10 0 0 1 20 0z"/><path d="M16 22l5-7" class="red-line"/><path d="M4 26h24"/><path d="M10 6h12l-2 6H12z"/></svg>`,
    cross: `<svg viewBox="0 0 32 32" class="ico"><path d="M4 12h24v8H4zM12 4h8v24h-8z"/><rect x="12" y="12" width="8" height="8" class="fill-red"/></svg>`,
    sender: `<svg viewBox="0 0 32 32" class="ico"><rect x="4" y="8" width="24" height="17" rx="1"/><path d="M4 8l12 9 12-9"/><text x="16" y="29" text-anchor="middle" class="ico-q">?</text><circle cx="24" cy="8" r="4" class="fill-red"/></svg>`,
    customs: `<svg viewBox="0 0 32 32" class="ico"><rect x="7" y="4" width="18" height="24" rx="2"/><circle cx="16" cy="14" r="5"/><path d="M11 14h10M16 9c-2 3-2 7 0 10M16 9c2 3 2 7 0 10"/><path d="M11 23h10"/></svg>`
  };

  const compass = `
  <svg viewBox="0 0 60 60" aria-hidden="true">
    <circle cx="30" cy="30" r="22" fill="none" stroke="${NAVY}" stroke-width=".8" opacity=".5"/>
    <circle cx="30" cy="30" r="18" fill="none" stroke="${NAVY}" stroke-width=".5" stroke-dasharray="1.5 1.5" opacity=".5"/>
    <path d="M30 6 L33 30 L30 54 L27 30 Z" fill="${NAVY}" opacity=".7"/>
    <path d="M6 30 L30 27 L54 30 L30 33 Z" fill="${NAVY}" opacity=".45"/>
    <path d="M30 6 L33 30 L30 30 Z" fill="${RED}"/>
    <text x="30" y="5" text-anchor="middle" font-size="6" font-family="Special Elite, monospace" fill="${NAVY}">N</text>
  </svg>`;

  // Circular date postmark with wavy cancellation lines.
  let pmId = 0;
  function postmark(top, bottom, middle, opts = {}) {
    const id = 'pm' + (++pmId);
    const color = opts.color || RED;
    const waves = opts.waves === false ? '' : `
      <g fill="none" stroke="${color}" stroke-width="2.4" opacity=".85">
        ${[0, 1, 2, 3, 4].map(i => `<path d="M104 ${30 + i * 11} q10 -6 20 0 t20 0 t20 0 t20 0 t20 0"/>`).join('')}
      </g>`;
    return `
    <svg viewBox="0 0 210 100" class="postmark-svg" aria-hidden="true">
      <defs><path id="${id}t" d="M18 50 A32 32 0 0 1 82 50"/><path id="${id}b" d="M14 50 A36 36 0 0 0 86 50"/></defs>
      <g fill="none" stroke="${color}" opacity=".85">
        <circle cx="50" cy="50" r="44" stroke-width="2.6"/>
        <circle cx="50" cy="50" r="26" stroke-width="1.6"/>
      </g>
      <g fill="${color}" opacity=".9" font-family="Libre Franklin, sans-serif" font-weight="800" letter-spacing="2">
        <text font-size="11"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${top}</textPath></text>
        <text font-size="11"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${bottom}</textPath></text>
        <text x="50" y="54" font-size="12" text-anchor="middle" font-family="Special Elite, monospace" letter-spacing="0">${middle}</text>
      </g>
      ${waves}
    </svg>`;
  }

  icon.places = icon.postmark;
  window.PMArt = { pip, hosts, hostFor, icon, compass, postmark };
})();

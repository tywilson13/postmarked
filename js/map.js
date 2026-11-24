// An old-chart style world map on d3-geo. No country names (that's the game), but cities and
// state/province lines appear as you zoom in, to help place a pin.
// Low-res shapes always; when zoomed past HI_K, the countries in view are
// redrawn from the 1:10m dataset so coastlines and borders stay crisp.
(function () {
  'use strict';
  const HI_K = 4;
  const MAX_K = 80;
  const MILES_PER_RADIAN = 3958.8;

  let LO = null, HI = null, hiLoading = null;

  // A few source polygons are wound "inside out" (e.g. the 1:10m Maldives), which
  // makes d3 treat them as covering the whole globe. Flip any polygon bigger than a hemisphere.
  function fixWinding(features) {
    const flip = poly => poly.map(ring => ring.slice().reverse());
    features.forEach(f => {
      const g = f.geometry;
      if (!g) return;
      if (g.type === 'Polygon' && d3.geoArea(g) > 2 * Math.PI) g.coordinates = flip(g.coordinates);
      if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map(p => d3.geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI ? flip(p) : p);
    });
    return features;
  }
  const lo = () => LO || (LO = fixWinding(topojson.feature(window.WORLD_TOPO, window.WORLD_TOPO.objects.countries).features));

  function loadHiRes() {
    if (HI) return Promise.resolve(HI);
    if (hiLoading) return hiLoading;
    hiLoading = new Promise(resolve => {
      const done = () => {
        HI = fixWinding(topojson.feature(window.WORLD_TOPO_HI, window.WORLD_TOPO_HI.objects.countries).features
          .filter(f => f.properties.name !== 'Antarctica'));
        HI.forEach(f => { f.bounds = d3.geoBounds(f); });
        resolve(HI);
      };
      if (window.WORLD_TOPO_HI) return done();
      const s = document.createElement('script');
      s.src = 'js/data/world-hi.js';
      s.onload = done;
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return hiLoading;
  }

  // State/province borders and cities load on demand, like the detailed coastlines.
  let extraLoading = null;
  function loadExtra() {
    if (extraLoading) return extraLoading;
    extraLoading = new Promise(resolve => {
      if (window.PM_MAP_EXTRA) return resolve(window.PM_MAP_EXTRA);
      const s = document.createElement('script');
      s.src = 'js/data/map-extra.js?v=1';
      s.onload = () => resolve(window.PM_MAP_EXTRA || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return extraLoading;
  }
  // Which cities show at each zoom: capitals and giants first, then smaller ones as you zoom in.
  const zoomLevel = k => k < 2.5 ? 0 : k < 5 ? 1 : k < 10 ? 2 : k < 20 ? 3 : 4;

  const distanceMiles = (a, b) => d3.geoDistance(a, b) * MILES_PER_RADIAN;
  const countryAt = ll => (HI || lo()).find(f => d3.geoContains(f, ll)) || null;
  const countryByName = name => (HI || lo()).find(f => f.properties.name === name) || lo().find(f => f.properties.name === name) || null;

  function distanceToCountry(ll, feature) {
    if (d3.geoContains(feature, ll)) return 0;
    let best = Infinity;
    const walk = c => {
      if (typeof c[0] === 'number') { const d = distanceMiles(ll, c); if (d < best) best = d; }
      else c.forEach(walk);
    };
    walk(feature.geometry.coordinates);
    return best;
  }

  function WorldMap(el) {
    const w = 1000, h = 520;
    const projection = d3.geoNaturalEarth1().fitExtent([[6, 6], [w - 6, h - 6]], { type: 'Sphere' });
    const path = d3.geoPath(projection);

    el.innerHTML = '';
    const svg = d3.select(el).append('svg')
      .attr('viewBox', `0 0 ${w} ${h}`).attr('class', 'map')
      .attr('role', 'img').attr('aria-label', 'World map. Tap to place a pin.').attr('data-z', 0);
    const g = svg.append('g');
    g.append('path').datum({ type: 'Sphere' }).attr('class', 'sea').attr('d', path);
    g.append('path').datum(d3.geoGraticule10()).attr('class', 'graticule').attr('d', path);
    const loLayer = g.append('g').attr('class', 'lo');
    const hiLayer = g.append('g').attr('class', 'hi');
    loLayer.selectAll('path').data(lo().filter(f => f.properties.name !== 'Antarctica'))
      .join('path').attr('class', 'land').attr('d', path);
    const adminLayer = g.append('g').attr('class', 'admin-layer');
    const cityLayer = g.append('g').attr('class', 'city-layer');
    const routeLayer = g.append('g');
    const markerLayer = g.append('g');
    loadExtra().then(extra => {
      if (!extra) return;
      const lines = extra.lines.map(a => { const c = []; for (let i = 0; i < a.length; i += 2) c.push([a[i], a[i + 1]]); return c; });
      adminLayer.append('path').datum({ type: 'MultiLineString', coordinates: lines }).attr('class', 'admin').attr('d', path);
      // Each city: a dot that stays the same size on screen, and a label sized by the zoom.
      cityLayer.selectAll('g').data(extra.cities).join('g')
        .attr('class', d => 'city t' + d[3])
        .attr('transform', d => { const [x, y] = projection([d[1], d[2]]); return `translate(${x.toFixed(1)},${y.toFixed(1)})`; })
        .call(c => { c.append('path').attr('class', 'cdot').attr('d', 'M0,0h0'); c.append('text').attr('dx', '.55em').attr('dy', '.35em').text(d => d[0]); });
      paintCities();
    });
    // Labels stay about 11px on screen. Smaller cities give way to bigger ones when labels would overlap.
    const labelPx = 11;
    const unitsPerPx = () => w / (el.clientWidth || w);
    function paintCities() {
      cityLayer.attr('font-size', labelPx * unitsPerPx() / k);
      const placed = [], cell = labelPx * 1.25;
      cityLayer.selectAll('g.city').each(function (d) {
        const node = d3.select(this);
        if (this.style.display === 'none' || getComputedStyle(this).display === 'none') return;
        const [px, py] = projection([d[1], d[2]]);
        const sx = (transform.applyX(px)) / unitsPerPx(), sy = (transform.applyY(py)) / unitsPerPx();
        const box = [sx - 3, sy - cell / 2, sx + 8 + d[0].length * labelPx * 0.58, sy + cell / 2];
        const clash = placed.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
        node.classed('nolabel', clash);
        if (!clash) placed.push(box);
      });
    }

    let k = 1, transform = d3.zoomIdentity;
    let picked = null, target = null;
    // Touch screens get tap-to-zoom-then-pin; mouse users click directly and scroll to zoom.
    const isSmall = () => window.matchMedia('(pointer: coarse)').matches || el.clientWidth < 420;

    const rescale = () => markerLayer.selectAll('.marker')
      .attr('transform', d => `translate(${d.x},${d.y}) scale(${1.5 / k})`);

    const paintClasses = () => {
      g.selectAll('.land')
        .classed('picked', f => !!picked && f.properties.name === picked)
        .classed('target', f => !!target && f.properties.name === target);
    };

    function refreshHiRes() {
      if (k < HI_K || !HI) { hiLayer.selectAll('*').remove(); loLayer.style('display', null); return; }
      // visible lon/lat box
      const corners = [[0, 0], [w, 0], [0, h], [w, h], [w / 2, 0], [w / 2, h], [0, h / 2], [w, h / 2]]
        .map(p => projection.invert(transform.invert(p))).filter(Boolean);
      const lons = corners.map(c => c[0]), lats = corners.map(c => c[1]);
      const box = [Math.min(...lons) - 2, Math.min(...lats) - 2, Math.max(...lons) + 2, Math.max(...lats) + 2];
      const visible = HI.filter(f => {
        const [[x0, y0], [x1, y1]] = f.bounds;
        if (y1 < box[1] || y0 > box[3]) return false;
        if (x0 > x1) return true; // crosses the antimeridian
        return !(x1 < box[0] || x0 > box[2]);
      });
      hiLayer.selectAll('path').data(visible, f => f.properties.name)
        .join('path').attr('class', 'land').attr('d', path);
      loLayer.style('display', 'none');
      paintClasses();
    }

    const zoom = d3.zoom()
      .scaleExtent([1, MAX_K])
      .translateExtent([[0, 0], [w, h]])
      .clickDistance(6)
      .on('zoom', e => {
        transform = e.transform; k = transform.k;
        g.attr('transform', transform);
        rescale();
        cityLayer.attr('font-size', labelPx * unitsPerPx() / k);
        svg.attr('data-z', zoomLevel(k));
        if (k < HI_K && hiLayer.node().childNodes.length) refreshHiRes();
      })
      .on('end', () => { refreshHiRes(); paintCities(); });
    svg.call(zoom).on('dblclick.zoom', null);
    loadHiRes().then(refreshHiRes);

    const zb = document.createElement('div');
    zb.className = 'zoom-btns';
    zb.innerHTML = '<button type="button" aria-label="Zoom in">+</button><button type="button" aria-label="Zoom out">−</button><button type="button" aria-label="Show whole world" class="zb-world">⤢</button>';
    const [zin, zout, zall] = zb.children;
    zin.onclick = e => { e.stopPropagation(); svg.transition().duration(250).call(zoom.scaleBy, 2); };
    zout.onclick = e => { e.stopPropagation(); svg.transition().duration(250).call(zoom.scaleBy, 0.5); };
    zall.onclick = e => { e.stopPropagation(); svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity); };
    el.appendChild(zb);

    const rose = document.createElement('div');
    rose.className = 'compass';
    rose.innerHTML = window.PMArt ? PMArt.compass : '';
    el.appendChild(rose);

    let tapHandler = null;
    svg.on('click', ev => {
      if (!tapHandler) return;
      const [x, y] = d3.pointer(ev, g.node());
      const ll = projection.invert([x, y]);
      if (!ll || !isFinite(ll[0]) || !isFinite(ll[1])) return;
      const back = projection(ll);
      if (!back || Math.hypot(back[0] - x, back[1] - y) > 1) return;
      if (isSmall() && k < 2.5) { // first tap on a phone zooms into the region
        svg.transition().duration(450).call(zoom.transform, d3.zoomIdentity.translate(w / 2, h / 2).scale(4).translate(-x, -y));
        return;
      }
      tapHandler(ll);
    });

    function marker(ll, kind, label) {
      const [x, y] = projection(ll);
      const m = markerLayer.append('g').datum({ x, y }).attr('class', `marker marker-${kind}`);
      const inner = m.append('g').attr('class', 'pop');
      if (kind === 'pin') {
        inner.append('ellipse').attr('class', 'shadow').attr('rx', 5).attr('ry', 2);
        inner.append('line').attr('y2', -16);
        inner.append('circle').attr('cy', -18).attr('r', 6.5);
        inner.append('circle').attr('class', 'shine').attr('cx', -2).attr('cy', -20).attr('r', 1.8);
      } else {
        inner.append('circle').attr('class', 'ring').attr('r', 10);
        inner.append('path').attr('class', 'cross').attr('d', 'M-14,0H-5M5,0H14M0,-14V-5M0,5V14');
        inner.append('circle').attr('class', 'dot').attr('r', 3);
        if (label) inner.append('text').attr('x', 14).attr('y', -8).text(label);
      }
      rescale();
      return m;
    }

    let pin = null;
    return {
      isSmall,
      onTap(fn) { tapHandler = fn; },
      setPin(ll) {
        if (pin) pin.remove();
        pin = marker(ll, 'pin');
        const c = countryAt(ll);
        picked = c ? c.properties.name : null;
        paintClasses();
        return c;
      },
      showTarget(ll, label) { return marker(ll, 'target', label); },
      highlightCountry(name) { target = name; paintClasses(); },
      drawRoute(a, b) {
        routeLayer.append('path').datum({ type: 'LineString', coordinates: [a, b] }).attr('class', 'route').attr('d', path);
      },
      fitTo(lls, maxK = 8) {
        const pts = lls.map(ll => projection(ll));
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const scale = Math.max(1, Math.min(maxK, 0.85 / Math.max((x1 - x0 + 90) / w, (y1 - y0 + 90) / h)));
        svg.transition().duration(800).call(zoom.transform,
          d3.zoomIdentity.translate(w / 2, h / 2).scale(scale).translate(-(x0 + x1) / 2, -(y0 + y1) / 2));
      },
      reset() {
        if (pin) { pin.remove(); pin = null; }
        markerLayer.selectAll('*').remove();
        routeLayer.selectAll('*').remove();
        picked = target = null; paintClasses();
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
      }
    };
  }

  window.PMMap = { WorldMap, countryAt, countryByName, distanceMiles, distanceToCountry, loadHiRes };
})();

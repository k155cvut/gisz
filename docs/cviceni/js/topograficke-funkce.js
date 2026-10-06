/*
 * Interaktivní ukázka topografických funkcí (Slope, Aspect, Hillshade, Viewshed,
 * Aspect-Slope, Raster Calculator) pro MkDocs Material. Bez externích závislostí.
 * Styly v topo_function.css (třídy .tf-*).
 *
 * Použití v Markdownu:
 *   <div class="tf" data-tf="topo"></div>   – syntetický DMR a odvozené rastry
 */
(function () {
  "use strict";

  /* ================================================================
   * Konstanty a barevné stupnice
   * ================================================================ */

  const N = 160, CS = 25;                 // velikost rastru a buňky [m]
  const D2R = Math.PI / 180;
  const WILD = 1;   // míra „divokosti“: 0 = jen původní kopec, 1 = výchozí, 2 = hodně divoké

  const DIRS = ["S", "SV", "V", "JV", "J", "JZ", "Z", "SZ"];
  const DIR_COL = [[255,0,0],[255,165,0],[255,255,0],[0,255,0],[0,255,255],[0,165,255],[0,0,255],[255,0,255]];
  const RAMP_DEM = [[0,[58,125,68]],[.25,[143,191,90]],[.5,[232,216,138]],[.75,[176,125,72]],[.9,[138,106,85]],[1,[244,241,236]]];
  const RAMP_SL  = [[0,[255,247,188]],[15,[254,196,79]],[30,[230,85,13]],[45,[165,15,21]],[60,[74,20,134]]];
  const C0 = [208,212,218], C1 = [30,99,181], CRISK = [211,47,47];
  const SUMC = [[208,212,218],[255,224,130],[251,140,0],[211,47,47]];
  const AS_HUE = [0,32,56,120,180,205,235,300];
  const LOS_VIS = [46,170,60], LOS_HID = [221,44,44], LOS_OBST = [30,136,229];   // jako Line Of Sight v ArcGIS

  const TABS = [
    ["dmr", "DMR"], ["slope", "Slope"], ["aspect", "Aspect"], ["hillshade", "Hillshade"],
    ["viewshed", "Viewshed"], ["aspectslope", "Aspect-Slope"], ["combo", "Raster Calculator"]
  ];

  /* ================================================================
   * Pomocné funkce
   * ================================================================ */

  const cl = (v) => v < 0 ? 0 : v >= N ? N - 1 : v;
  const dirIdx = (a) => a < 0 ? -1 : Math.floor(((a + 22.5) % 360) / 45);
  const slopeCls = (s) => s < 5 ? 0 : s < 20 ? 1 : s < 40 ? 2 : 3;
  const ha = (n) => (n * CS * CS / 1e4).toLocaleString("cs-CZ", { maximumFractionDigits: 1 });
  const css = (c) => `rgb(${c.map(Math.round).join(",")})`;

  // seedovaný generátor náhodných čísel (stejný seed = stejný terén)
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function ramp(st, v) {
    if (v <= st[0][0]) return st[0][1];
    for (let i = 1; i < st.length; i++) if (v <= st[i][0]) {
      const [v0, c0] = st[i - 1], [v1, c1] = st[i], t = (v - v0) / (v1 - v0);
      return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t];
    }
    return st[st.length - 1][1];
  }
  function gradCss(st) {
    const lo = st[0][0], hi = st[st.length - 1][0];
    return `linear-gradient(to right,${st.map(([v, c]) => `${css(c)} ${((v - lo) / (hi - lo) * 100).toFixed(0)}%`).join(",")})`;
  }
  function hsl(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  }
  const bivarCol = (c, h) => c === 1 ? hsl(h, 40, 80) : c === 2 ? hsl(h, 65, 60) : hsl(h, 90, 40);

  /* ================================================================
   * Ukázka
   * ================================================================ */

  function initTopo(root) {
    const DEM = new Float32Array(N * N), DX = new Float32Array(N * N), DY = new Float32Array(N * N);
    const SL = new Float32Array(N * N), AS = new Float32Array(N * N), HS = new Float32Array(N * N), VS = new Uint8Array(N * N);
    const id = ++uid;
    let seed = 7;
    const Z = (x, y) => DEM[cl(y) * N + cl(x)];

    /* ---------- generování terénu ---------- */

    function hash(ix, iy) {
      let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 982451653);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967295;
    }
    function vnoise(x, y) {
      const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y, ridged) {
      let s = 0, amp = 0.5, f = 1, norm = 0;
      for (let o = 0; o < 5; o++) {
        let n = vnoise(x * f + o * 17.3, y * f - o * 9.1);
        if (ridged) n = 1 - Math.abs(2 * n - 1);
        s += amp * n; norm += amp; amp *= 0.5; f *= 2.03;
      }
      return s / norm;
    }

    function generate() {
      const R = mulberry32((seed ^ 0x9E3779B9) >>> 0), rnd = (a, b) => a + (b - a) * R();

      // hlavní kopec – poloha i výraznost se mění, někdy skoro zmizí
      const cx = 0.25 + 0.5 * R(), cy = 0.25 + 0.5 * R();
      const domeH = rnd(0.1, 0.5), domeR2 = rnd(0.03, 0.12);

      // vedlejší vrcholy a sníženiny
      const bumps = [];
      for (let i = 0, n = Math.floor(rnd(2, 7)); i < n; i++)
        bumps.push({ x: rnd(0.05, 0.95), y: rnd(0.05, 0.95), r: rnd(0.04, 0.2),
                     h: rnd(0.1, 0.35) * (R() < 0.3 ? -1 : 1) });
      // hřbety / úžlabiny podél úseček
      const ridges = [];
      for (let i = 0, n = Math.floor(rnd(0, 4)); i < n; i++) {
        const x1 = rnd(0.1, 0.9), y1 = rnd(0.1, 0.9), a = rnd(0, Math.PI), len = rnd(0.25, 0.7);
        ridges.push({ x1, y1, x2: x1 + Math.cos(a) * len, y2: y1 + Math.sin(a) * len,
                      w: rnd(0.035, 0.08), h: rnd(0.12, 0.3) * (R() < 0.25 ? -1 : 1) });
      }
      // kráter, zlom a terasy jen občas
      const crater = R() < 0.25 ? { x: rnd(0.2, 0.8), y: rnd(0.2, 0.8), r: rnd(0.06, 0.15), h: rnd(0.15, 0.3) } : null;
      const fault  = R() < 0.25 ? { x: rnd(0.3, 0.7), y: rnd(0.3, 0.7), a: rnd(0, Math.PI), w: rnd(0.006, 0.02), h: rnd(0.08, 0.2) } : null;
      const terr   = R() < 0.3  ? { n: Math.floor(rnd(4, 10)), mix: Math.min(1, rnd(0.4, 0.9) * WILD) } : null;
      const warp = rnd(0, 0.15), ridgedAmp = rnd(0.05, 0.2);

      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const nx = x / N, ny = y / N;
        // domain warping – pokroucení souřadnic dává „roztrhanější“ tvary
        const wx = warp * (fbm(nx * 2 + 11.3, ny * 2 + 3.7, false) - 0.5) * 2;
        const wy = warp * (fbm(nx * 2 + 7.1, ny * 2 + 13.9, false) - 0.5) * 2;
        const ux = nx + wx * WILD, uy = ny + wy * WILD;

        const dome = Math.exp(-((nx - cx) ** 2 + (ny - cy) ** 2) / domeR2);
        const z = 0.45 * fbm(ux * 3.2, uy * 3.2, false) + 0.35 * fbm(ux * 2.4 + 5, uy * 2.4 + 5, true) * (0.4 + 0.6 * dome) + domeH * dome;

        let add = ridgedAmp * (fbm(ux * 3.5 + 21, uy * 3.5 + 4, true) - 0.5);      // skalnaté hřebínky
        for (const b of bumps) {
          const dx = nx - b.x, dy = ny - b.y;
          add += b.h * Math.exp(-(dx * dx + dy * dy) / (b.r * b.r));
        }
        for (const r of ridges) {
          const dx = r.x2 - r.x1, dy = r.y2 - r.y1;
          let t = ((nx - r.x1) * dx + (ny - r.y1) * dy) / (dx * dx + dy * dy);
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const px = r.x1 + t * dx - nx, py = r.y1 + t * dy - ny;
          add += r.h * Math.sin(Math.PI * t) * Math.exp(-(px * px + py * py) / (r.w * r.w));
        }
        if (crater) {
          const d = Math.hypot(nx - crater.x, ny - crater.y), w = crater.r * 0.35;
          const q1 = (d - crater.r) / w, q2 = d / (crater.r * 0.75);
          add += crater.h * Math.exp(-q1 * q1) - crater.h * 0.9 * Math.exp(-q2 * q2);
        }
        if (fault) {
          const d = (nx - fault.x) * Math.sin(fault.a) - (ny - fault.y) * Math.cos(fault.a);
          add += fault.h * Math.tanh(d / fault.w);
        }
        DEM[y * N + x] = z + WILD * add;
      }

      // terasy (stupňovité svahy)
      if (terr) {
        let a = Infinity, b = -Infinity;
        for (const z of DEM) { if (z < a) a = z; if (z > b) b = z; }
        const span = (b - a) || 1;
        for (let k = 0; k < N * N; k++) {
          const q = (DEM[k] - a) / span * terr.n, s = Math.floor(q), f = q - s;
          DEM[k] = DEM[k] * (1 - terr.mix) + ((s + f ** 4) / terr.n * span + a) * terr.mix;
        }
      }
      // lehké vyhlazení (3×3 průměr)
      const tmp = Float32Array.from(DEM);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let s = 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += tmp[cl(y + j) * N + cl(x + i)];
        DEM[y * N + x] = s / 9;
      }
      let mn = Infinity, mx = -Infinity;
      for (const z of DEM) { if (z < mn) mn = z; if (z > mx) mx = z; }
      for (let k = 0; k < N * N; k++) DEM[k] = 700 + (DEM[k] - mn) / (mx - mn) * 900;   // 700–1600 m
    }

    /* ---------- topografické funkce ---------- */

    // Horn (3×3) – stejné jako Slope/Aspect v ArcGIS
    function derive() {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const a = Z(x-1,y-1), b = Z(x,y-1), c = Z(x+1,y-1), d = Z(x-1,y), f = Z(x+1,y), g = Z(x-1,y+1), h = Z(x,y+1), i = Z(x+1,y+1);
        const dx = ((c + 2*f + i) - (a + 2*d + g)) / (8 * CS), dy = ((g + 2*h + i) - (a + 2*b + c)) / (8 * CS);
        const k = y * N + x;
        DX[k] = dx; DY[k] = dy;
        SL[k] = Math.atan(Math.hypot(dx, dy)) / D2R;
        if (dx === 0 && dy === 0) AS[k] = -1;
        else { const t = Math.atan2(dy, -dx) / D2R; AS[k] = t < 0 ? 90 - t : t > 90 ? 450 - t : 90 - t; }
      }
    }
    function hillshade(az, alt, zf) {
      const zen = (90 - alt) * D2R;
      let azm = 360 - az + 90; if (azm >= 360) azm -= 360; azm *= D2R;
      const cz = Math.cos(zen), sz = Math.sin(zen);
      for (let k = 0; k < N * N; k++) {
        const dx = DX[k] * zf, dy = DY[k] * zf, s = Math.atan(Math.hypot(dx, dy));
        let a;
        if (dx !== 0) { a = Math.atan2(dy, -dx); if (a < 0) a += 2 * Math.PI; }
        else a = dy > 0 ? Math.PI / 2 : dy < 0 ? 1.5 * Math.PI : 0;
        const v = 255 * (cz * Math.cos(s) + sz * Math.sin(s) * Math.cos(azm - a));
        HS[k] = v < 0 ? 0 : v;
      }
    }
    function bil(px, py) {
      const x0 = Math.floor(px), y0 = Math.floor(py), fx = px - x0, fy = py - y0;
      const a = Z(x0, y0), b = Z(x0 + 1, y0), c = Z(x0, y0 + 1), d = Z(x0 + 1, y0 + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    function viewshed(ox, oy, offset) {
      const oz = DEM[oy * N + ox] + offset;
      for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
        const k = ty * N + tx, ddx = tx - ox, ddy = ty - oy;
        if (!ddx && !ddy) { VS[k] = 1; continue; }
        const steps = Math.max(Math.abs(ddx), Math.abs(ddy)), L = Math.hypot(ddx, ddy) * CS;
        let maxT = -Infinity;
        for (let s = 1; s < steps; s++) {
          const t = s / steps, tan = (bil(ox + ddx * t, oy + ddy * t) - oz) / (t * L);
          if (tan > maxT) maxT = tan;
        }
        VS[k] = (DEM[k] - oz) / L >= maxT ? 1 : 0;
      }
    }
    // Line Of Sight – profil terénu mezi A a B; každý vzorek je viditelný,
    // pokud jeho výškový úhel od pozorovatele není menší než u předchozích vzorků
    function lineOfSight() {
      const ax = S.ox, ay = S.oy, ddx = S.bx - ax, ddy = S.by - ay;
      const L = Math.hypot(ddx, ddy) * CS, M = Math.max(2, Math.ceil(Math.hypot(ddx, ddy) * 2));
      const oz = DEM[ay * N + ax] + S.off, tz = DEM[S.by * N + S.bx] + S.offB;
      const tanB = L > 0 ? (tz - oz) / L : 0;
      const pts = [];
      let maxT = -Infinity, obst = -1;
      for (let i = 0; i <= M; i++) {
        const t = i / M, x = ax + ddx * t, y = ay + ddy * t, z = bil(x, y), d = t * L;
        let vis = true;
        if (i > 0 && d > 0) {
          const tan = (z - oz) / d;
          vis = tan >= maxT;
          if (tan > maxT) maxT = tan;
          if (i < M && obst < 0 && tan > tanB) obst = i;   // první překážka mezi A a cílem
        }
        pts.push({ x, y, z, d, vis });
      }
      return { pts, L, oz, tz, obst, targetVis: obst < 0 };
    }
    function aspSlopeCol(k) {
      const c = slopeCls(SL[k]), d = dirIdx(AS[k]);
      if (c === 0 || d < 0) return [189, 189, 189];
      return bivarCol(c, AS_HUE[d]);
    }

    /* ---------- stav ---------- */

    const HS_DEFAULT = { az: 315, alt: 45, zf: 1 };
    const S = {
      tab: "dmr", underlay: true,
      elevThr: 1300, elevRc: false,
      slopeThr: 30, slopeRc: false,
      dirs: [true, true, false, false, false, false, false, true], aspRc: false,
      ...HS_DEFAULT,
      ox: 80, oy: 80, off: 20,
      vsMode: "area", bx: 30, by: 130, offB: 2,
      combo: "mul"
    };
    const condE = (k) => DEM[k] >= S.elevThr ? 1 : 0;
    const condS = (k) => SL[k] >= S.slopeThr ? 1 : 0;
    const condA = (k) => { const d = dirIdx(AS[k]); return d >= 0 && S.dirs[d] ? 1 : 0; };
    let demMin, demMax;

    function highestCell() {
      let mk = 0;
      for (let k = 0; k < N * N; k++) if (DEM[k] > DEM[mk]) mk = k;
      return mk;
    }
    function newTerrain(first) {
      if (!first) seed = Math.floor(Math.random() * 1e6);
      generate(); derive(); hillshade(S.az, S.alt, S.zf);
      demMin = Infinity; demMax = -Infinity;
      for (let k = 0; k < N * N; k++) { if (DEM[k] < demMin) demMin = DEM[k]; if (DEM[k] > demMax) demMax = DEM[k]; }
      S.elevThr = Math.round(demMin + 2 * (demMax - demMin) / 3);
      const mk = highestCell();
      S.ox = mk % N; S.oy = Math.floor(mk / N);
      // cíl B do protějšího rohu území, ať čára vede přes terén
      S.bx = S.ox < N / 2 ? Math.round(N * 0.85) : Math.round(N * 0.15);
      S.by = S.oy < N / 2 ? Math.round(N * 0.85) : Math.round(N * 0.15);
      dirtyVS = true;
      renderPanel(); draw();
    }

    /* ---------- kostra ukázky ---------- */

    root.innerHTML = `
      <div class="tf-tabs" role="group">${TABS.map(([t, n]) =>
        `<button type="button" class="tf-btn" data-t="${t}">${n}</button>`).join("")}</div>
      <div class="tf-body">
        <div class="tf-mapcol">
          <div class="tf-map">
            <canvas width="${N}" height="${N}"></canvas>
            <canvas class="tf-overlay"></canvas>
            <div class="tf-marker" hidden></div>
            <div class="tf-north">▲<br>S</div>
          </div>
          <div class="tf-below">
            <div class="tf-readout">Najeďte myší na mapu…</div>
            <button type="button" class="tf-btn" data-act="new" title="Vygenerovat jiný terén">↻ Nový terén</button>
          </div>
        </div>
        <div class="tf-panel"></div>
      </div>`;
    const tabBtns = root.querySelectorAll(".tf-tabs .tf-btn");
    const panel = root.querySelector(".tf-panel");
    const map = root.querySelector(".tf-map");
    const marker = root.querySelector(".tf-marker");
    const readout = root.querySelector(".tf-readout");
    const canvas = map.querySelector("canvas"), ctx = canvas.getContext("2d");
    const overlay = map.querySelector(".tf-overlay"), octx = overlay.getContext("2d");
    const isLos = () => S.tab === "viewshed" && S.vsMode === "los";
    let los = null;   // poslední výsledek lineOfSight()

    /* ---------- panely záložek ---------- */

    const check = (k, text) => `<label class="tf-check"><input type="checkbox" data-k="${k}"> ${text}</label>`;
    const slider = (k, lab, unit, min, max, step) => `
      <div class="tf-lab"><span>${lab}</span><span class="tf-val">${unit[0] || ""}<span data-v="${k}"></span>${unit[1] || ""}</span></div>
      <input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}">`;
    const head = (title, tool) => `<div class="tf-title">${title}</div><div class="tf-tool">${tool}</div>`;
    const underlayBox = check("underlay", "Stínovaný reliéf pod vrstvou");

    function panelHtml() {
      switch (S.tab) {
      case "dmr": return head("DMR – digitální model reliéfu", "vstupní rastr · <i>RECLASSIFY</i>") + `
        <p>Každá buňka nese nadmořskou výšku. Z tohoto rastru odvodíme všechny ostatní vrstvy. Rozlišení je 25&nbsp;m, terén je syntetický.</p>
        <div class="tf-ctrl">
          ${check("elevRc", "<b>Reklasifikovat</b> na 0 / 1")}
          ${slider("elevThr", "mezní výška", ["", " m"], 700, 1600, 10)}
          <button type="button" class="tf-btn" data-act="third">Nejvyšší třetina</button>
          ${underlayBox}
        </div>`;
      case "slope": return head("<i>SLOPE</i> – sklon svahu", "3D Analyst / Spatial Analyst › <i>SLOPE</i>") + `
        <p>Funkce spočítá z okna 3×3 buněk (metoda Horn) největší změnu výšky a vyjádří ji jako úhel ve stupních: 0° je rovina, 90° svislá stěna. Směr svahu tu nehraje roli, jen jeho strmost.</p>
        <div class="tf-ctrl">
          ${check("slopeRc", "<b>Reklasifikovat</b> na 0 / 1")}
          ${slider("slopeThr", "mezní sklon", ["", "°"], 0, 60, 1)}
          ${underlayBox}
        </div>`;
      case "aspect": return head("<i>ASPECT</i> – expozice svahu", "3D Analyst / Spatial Analyst › <i>ASPECT</i>") + `
        <p>Směr, kterým svah <i>klesá</i>, vyjádřený azimutem 0–360° od severu po směru hodinových ručiček. Rovina má hodnotu −1.</p>
        <p class="tf-hint">Sever leží „na švu“ stupnice (0°&nbsp;=&nbsp;360°), takže ho při reklasifikaci poskládáme ze dvou intervalů: 0–22,5° a 337,5–360°.</p>
        <div class="tf-ctrl">
          ${check("aspRc", "<b>Reklasifikovat</b> – vyhovující směry:")}
          <div class="tf-dirs">${[7, 0, 1, 6, -1, 2, 5, 4, 3].map((i) => i < 0 ? "<span>✛</span>" :
            `<label class="tf-check"><input type="checkbox" data-dir="${i}"> ${DIRS[i]}</label>`).join("")}</div>
          ${underlayBox}
        </div>`;
      case "hillshade": return head("<i>HILLSHADE</i> – stínovaný reliéf", "3D Analyst / Spatial Analyst › <i>HILLSHADE</i>") + `
        <p>Funkce simuluje osvětlení povrchu zdrojem daným azimutem a výškou nad obzorem. Hodnota 0–255 vyjadřuje, jak přímo světlo na buňku dopadá. Používáme ji hlavně k vizualizaci.</p>
        <div class="tf-ctrl">
          ${slider("az", "azimut světla", ["", "°"], 0, 360, 5)}
          ${slider("alt", "výška nad obzorem", ["", "°"], 1, 90, 1)}
          ${slider("zf", "Z-faktor (převýšení)", ["× "], 0.5, 5, 0.5)}
          <button type="button" class="tf-btn" data-act="hsreset" title="Azimut 315°, výška 45°, Z-faktor 1">↺ Výchozí nastavení</button>
        </div>
        <p class="tf-hint">Zkuste azimut kolem 135°: údolí mohou začít vypadat jako hřbety (tzv. inverze reliéfu). Proto je výchozí 315°, světlo od SZ.</p>`;
      case "viewshed": return `
        <div class="tf-seg" role="group">
          <button type="button" class="tf-btn" data-mode="area">Viditelnost z bodu</button>
          <button type="button" class="tf-btn" data-mode="los">Přímka viditelnosti</button>
        </div>` + (S.vsMode === "los" ? head("<i>LINE OF SIGHT</i> – přímka viditelnosti", "3D Analyst › <i>CONSTRUCT SIGHT LINES</i>, <i>LINE OF SIGHT</i>") + `
        <p>Funkce vede přímku od pozorovatele <b>A</b> k cíli <b>B</b> a podél ní testuje, které úseky terénu jsou z bodu A vidět (<b style="color:${css(LOS_VIS)}">zeleně</b>) a které zakrývá terén (<b style="color:${css(LOS_HID)}">červeně</b>). Modrý bod je první překážka, která brání výhledu na cíl.</p>
        <div class="tf-ctrl">
          <span><b>Táhněte body A a B</b> v mapě (klik přesune bližší bod).</span>
          ${slider("off", "výška pozorovatele A (<i>OFFSETA</i>)", ["", " m"], 0, 100, 1)}
          ${slider("offB", "výška cíle B (<i>OFFSETB</i>)", ["", " m"], 0, 100, 1)}
          <button type="button" class="tf-btn" data-act="peak">Pozorovatel na nejvyšší bod</button>
        </div>` : head("<i>VIEWSHED</i> – analýza viditelnosti", "Spatial Analyst › <i>VIEWSHED</i>") + `
        <p>Funkce určí buňky, které jsou vidět z pozorovacího bodu. U každé buňky testuje, zda přímku pohledu nepřeruší terén.</p>
        <div class="tf-ctrl">
          <span><b>Klikněte do mapy</b> pro přesun pozorovatele.</span>
          ${slider("off", "výška nad terénem (<i>OFFSETA</i>)", ["", " m"], 0, 100, 1)}
          <button type="button" class="tf-btn" data-act="peak">Pozorovatel na nejvyšší bod</button>
        </div>
        <p class="tf-hint">Zkuste na vrcholu snížit výšku na 2&nbsp;m. Z vypouklého vrcholu nejsou vidět jeho vlastní svahy, protože je zakryje hrana terénu. Výchozích 20&nbsp;m odpovídá rozhledně.</p>`);
      case "aspectslope": return head("<i>ASPECT-SLOPE</i>", "rastrová funkce ArcGIS Pro") + `
        <p>Funkce kombinuje dvě veličiny v jedné vrstvě. Barevný tón nese <b>expozici</b>, sytost nese <b>sklon</b>. Ploché oblasti (&lt;&nbsp;5°) jsou šedé.</p>
        <div class="tf-ctrl">${underlayBox}</div>`;
      case "combo": return head("<i>RASTER CALCULATOR</i>", "Spatial Analyst › <i>RASTER CALCULATOR</i>") + `
        <p>Reklasifikované vrstvy (0/1) z DMR, sklonu a expozice zkombinujeme. Mezní hodnoty nastavíte v příslušných záložkách. Krajinný pokryv (CLC) tu pro jednoduchost chybí.</p>
        <div class="tf-ctrl">
          <label class="tf-check"><input type="radio" name="tf-combo-${id}" value="mul"> součin – platí <b>všechny</b> podmínky</label>
          <label class="tf-check"><input type="radio" name="tf-combo-${id}" value="sum"> součet – <b>kolik</b> podmínek platí</label>
          <div class="tf-expr"><code data-role="expr"></code></div>
          ${underlayBox}
        </div>`;
      }
    }

    function renderPanel() {
      tabBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === S.tab)));
      panel.innerHTML = panelHtml() + '<div class="tf-legend"></div>';
      panel.querySelectorAll("[data-k]").forEach((e) => {
        const k = e.dataset.k;
        if (e.type === "checkbox") e.checked = S[k]; else e.value = S[k];
        e.addEventListener("input", () => { S[k] = e.type === "checkbox" ? e.checked : +e.value; changed(k); });
      });
      panel.querySelectorAll("[data-dir]").forEach((e) => {
        const i = +e.dataset.dir; e.checked = S.dirs[i];
        e.addEventListener("input", () => { S.dirs[i] = e.checked; S.aspRc = true; changed("dirs"); });
      });
      panel.querySelectorAll('input[type="radio"]').forEach((e) => {
        e.checked = e.value === S.combo;
        e.addEventListener("input", () => { S.combo = e.value; changed("combo"); });
      });
      const third = panel.querySelector('[data-act="third"]');
      if (third) third.addEventListener("click", () => {
        S.elevThr = Math.round(demMin + 2 * (demMax - demMin) / 3); S.elevRc = true; renderPanel(); draw();
      });
      const hsReset = panel.querySelector('[data-act="hsreset"]');
      if (hsReset) hsReset.addEventListener("click", () => {
        Object.assign(S, HS_DEFAULT); dirtyHS = true; labels(); schedule();
      });
      const peak = panel.querySelector('[data-act="peak"]');
      if (peak) peak.addEventListener("click", () => {
        const mk = highestCell(); S.ox = mk % N; S.oy = Math.floor(mk / N); dirtyVS = true; schedule();
      });
      panel.querySelectorAll("[data-mode]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.mode === S.vsMode));
        b.addEventListener("click", () => { S.vsMode = b.dataset.mode; renderPanel(); draw(); });
      });
      labels();
    }
    function labels() {
      panel.querySelectorAll("[data-v]").forEach((e) => (e.textContent = S[e.dataset.v]));
      panel.querySelectorAll("[data-dir]").forEach((e) => (e.checked = S.dirs[+e.dataset.dir]));
      panel.querySelectorAll("[data-k]").forEach((e) => {
        const k = e.dataset.k;
        if (e.type === "checkbox") e.checked = S[k];
        else if (+e.value !== S[k]) e.value = S[k];
      });
      const ex = panel.querySelector('[data-role="expr"]');
      if (ex) ex.textContent = S.combo === "mul" ? '"vyska" * "sklon" * "expozice"' : '"vyska" + "sklon" + "expozice"';
    }

    let dirtyHS = false, dirtyVS = false, queued = false;
    function changed(k) {
      if (k === "slopeThr") S.slopeRc = true;
      if (k === "elevThr") S.elevRc = true;
      if (k === "az" || k === "alt" || k === "zf") dirtyHS = true;
      if (k === "off") dirtyVS = true;
      labels(); schedule();
    }
    function schedule() {
      if (queued) return; queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (dirtyHS) { hillshade(S.az, S.alt, S.zf); dirtyHS = false; }
        draw();
      });
    }

    /* ---------- vykreslení ---------- */

    function colorAt(k) {
      switch (S.tab) {
        case "dmr": return S.elevRc ? (condE(k) ? C1 : C0) : ramp(RAMP_DEM, (DEM[k] - demMin) / (demMax - demMin));
        case "slope": return S.slopeRc ? (condS(k) ? C1 : C0) : ramp(RAMP_SL, SL[k]);
        case "aspect": {
          if (S.aspRc) return condA(k) ? C1 : C0;
          const d = dirIdx(AS[k]); return d < 0 ? [160, 160, 160] : DIR_COL[d];
        }
        case "hillshade": return [HS[k], HS[k], HS[k]];
        case "viewshed": { const h = 40 + HS[k] * 0.7; return VS[k] && !isLos() ? [h * 0.45, 90 + h * 0.6, h * 0.35] : [h, h, h]; }
        case "aspectslope": return aspSlopeCol(k);
        case "combo": {
          if (S.combo === "mul") return condE(k) * condS(k) * condA(k) ? CRISK : C0;
          return SUMC[condE(k) + condS(k) + condA(k)];
        }
      }
    }
    function draw() {
      if (dirtyVS && S.tab === "viewshed" && S.vsMode === "area") { viewshed(S.ox, S.oy, S.off); dirtyVS = false; }
      los = isLos() ? lineOfSight() : null;
      const img = ctx.createImageData(N, N), p = img.data;
      const under = S.underlay && !["hillshade", "viewshed"].includes(S.tab);
      for (let k = 0; k < N * N; k++) {
        const c = colorAt(k), f = under ? 0.55 + 0.45 * HS[k] / 255 : 1;
        p[4*k] = c[0] * f; p[4*k + 1] = c[1] * f; p[4*k + 2] = c[2] * f; p[4*k + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      marker.hidden = S.tab !== "viewshed" || !!los;
      marker.style.left = ((S.ox + 0.5) / N * 100) + "%";
      marker.style.top = ((S.oy + 0.5) / N * 100) + "%";
      map.classList.toggle("tf-drag", !!los);
      drawOverlay();
      legend();
    }

    /* ---------- přímka viditelnosti: mapa a profil ---------- */

    // projde body přímky po souvislých úsecích se stejnou viditelností
    function runs(P, fn) {
      for (let i = 0; i < P.length - 1;) {
        const vis = P[i + 1].vis;
        let j = i + 1;
        while (j < P.length - 1 && P[j + 1].vis === vis) j++;
        fn(i, j, vis);
        i = j;
      }
    }
    function fitCanvas(cv) {
      const w = cv.clientWidth, h = cv.clientHeight, dpr = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      }
      const g = cv.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      return [g, w, h];
    }
    function dot(g, x, y, r, fill, label) {
      g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI);
      g.fillStyle = fill; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = "#000"; g.stroke();
      if (label) {
        g.fillStyle = "#000"; g.font = "bold 10px system-ui, sans-serif";
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(label, x, y + 0.5);
      }
    }

    function drawOverlay() {
      const [g, w, h] = fitCanvas(overlay);
      if (!los || !w) return;
      const X = (x) => (x + 0.5) / N * w, Y = (y) => (y + 0.5) / N * h;
      const P = los.pts, last = P[P.length - 1];
      g.lineJoin = "round";
      g.lineCap = "round"; g.lineWidth = 6; g.strokeStyle = "rgba(0,0,0,.75)";
      g.beginPath(); g.moveTo(X(P[0].x), Y(P[0].y)); g.lineTo(X(last.x), Y(last.y)); g.stroke();
      g.lineCap = "butt"; g.lineWidth = 3.5;
      runs(P, (i, j, vis) => {
        g.strokeStyle = css(vis ? LOS_VIS : LOS_HID);
        g.beginPath(); g.moveTo(X(P[i].x), Y(P[i].y)); g.lineTo(X(P[j].x), Y(P[j].y)); g.stroke();
      });
      if (los.obst >= 0) dot(g, X(P[los.obst].x), Y(P[los.obst].y), 4.5, css(LOS_OBST));
      dot(g, X(S.ox), Y(S.oy), 8, "#fff", "A");
      dot(g, X(S.bx), Y(S.by), 8, "#fff", "B");
    }

    function drawProfile(cv) {
      const [g, w, h] = fitCanvas(cv);
      if (!w) return;
      const cs = getComputedStyle(root);
      const fg = cs.getPropertyValue("--md-default-fg-color").trim() || "#000";
      const muted = cs.getPropertyValue("--md-default-fg-color--light").trim() || "#888";
      const faint = cs.getPropertyValue("--md-default-fg-color--lightest").trim() || "#eee";
      const P = los.pts, last = P[P.length - 1];
      let lo = Infinity, hi = Math.max(los.oz, los.tz);
      for (const p of P) { if (p.z < lo) lo = p.z; if (p.z > hi) hi = p.z; }
      const pad = (hi - lo) * 0.1 || 10; lo -= pad; hi += pad;
      const M = { l: 10, r: 10, t: 6, b: 16 };
      const X = (d) => M.l + (los.L ? d / los.L : 0) * (w - M.l - M.r);
      const Y = (z) => M.t + (hi - z) / (hi - lo) * (h - M.t - M.b);

      // terén
      g.fillStyle = faint;
      g.beginPath(); g.moveTo(X(0), h - M.b);
      P.forEach((p) => g.lineTo(X(p.d), Y(p.z)));
      g.lineTo(X(los.L), h - M.b); g.closePath(); g.fill();
      g.lineWidth = 2.5; g.lineJoin = "round";
      runs(P, (i, j, vis) => {
        g.strokeStyle = css(vis ? LOS_VIS : LOS_HID);
        g.beginPath(); g.moveTo(X(P[i].d), Y(P[i].z));
        for (let k = i + 1; k <= j; k++) g.lineTo(X(P[k].d), Y(P[k].z));
        g.stroke();
      });
      // výšky pozorovatele a cíle nad terénem
      g.lineWidth = 1.5; g.strokeStyle = muted;
      g.beginPath();
      g.moveTo(X(0), Y(P[0].z)); g.lineTo(X(0), Y(los.oz));
      g.moveTo(X(los.L), Y(last.z)); g.lineTo(X(los.L), Y(los.tz));
      g.stroke();
      // přímka pohledu
      g.setLineDash([4, 3]); g.lineWidth = 1; g.strokeStyle = fg;
      g.beginPath(); g.moveTo(X(0), Y(los.oz)); g.lineTo(X(los.L), Y(los.tz)); g.stroke();
      g.setLineDash([]);
      if (los.obst >= 0) dot(g, X(P[los.obst].d), Y(P[los.obst].z), 3.5, css(LOS_OBST));
      dot(g, X(0), Y(los.oz), 6.5, "#fff", "A");
      dot(g, X(los.L), Y(los.tz), 6.5, "#fff", "B");
      // osa vzdálenosti
      g.fillStyle = muted; g.font = "10px system-ui, sans-serif"; g.textBaseline = "bottom";
      g.textAlign = "left"; g.fillText("0 m", 2, h);
      g.textAlign = "right"; g.fillText(`${Math.round(los.L)} m`, w - 2, h);
    }

    /* ---------- legenda ---------- */

    function count(fn) { let n = 0; for (let k = 0; k < N * N; k++) n += fn(k); return n; }
    const sw = (c) => `<span class="tf-sw" style="background:${c}"></span>`;
    const bin = (n) => `<div>${sw(css(C1))}1 – vyhovuje (${ha(n)} ha)</div><div>${sw(css(C0))}0 – nevyhovuje</div>`;
    const scale = (bg, labs) => `<div class="tf-grad" style="background:${bg}"></div>
      <div class="tf-scale-lab">${labs.map((t) => `<span>${t}</span>`).join("")}</div>`;
    const selDirs = () => DIRS.filter((d, i) => S.dirs[i]).join(", ") || "—";

    function legend() {
      const L = panel.querySelector(".tf-legend"); if (!L) return;
      const tot = `<div class="tf-stat">Celé území: ${ha(N * N)} ha (${N}×${N} buněk po ${CS} m)</div>`;
      switch (S.tab) {
        case "dmr":
          L.innerHTML = S.elevRc ? bin(count(condE)) + `<div class="tf-stat">Podmínka: výška ≥ ${S.elevThr} m</div>` + tot
            : scale(gradCss(RAMP_DEM), [`${Math.round(demMin)} m`, `${Math.round(demMax)} m`]) + tot;
          break;
        case "slope":
          L.innerHTML = S.slopeRc ? bin(count(condS)) + `<div class="tf-stat">Podmínka: sklon ≥ ${S.slopeThr}°</div>` + tot
            : scale(gradCss(RAMP_SL), ["0°", "30°", "60°+"]) + tot;
          break;
        case "aspect":
          L.innerHTML = S.aspRc ? bin(count(condA)) + `<div class="tf-stat">Podmínka: ${selDirs()}</div>` + tot
            : DIRS.map((d, i) => `<div>${sw(css(DIR_COL[i]))}${d} (${(i * 45 - 22.5 + 360) % 360}–${i * 45 + 22.5}°)</div>`).join("")
              + `<div>${sw("#a0a0a0")}rovina (−1)</div>`;
          break;
        case "hillshade":
          L.innerHTML = scale("linear-gradient(to right,#000,#fff)", ["0 (stín)", "255 (plné světlo)"]);
          break;
        case "viewshed": {
          if (los) {
            const P = los.pts, hidden = P.filter((p, i) => i > 0 && !p.vis).length / (P.length - 1);
            L.innerHTML = `<div class="tf-los">${los.targetVis
                ? `<b style="color:${css(LOS_VIS)}">✓</b> Cíl B je z bodu A <b>viditelný</b>.`
                : `<b style="color:${css(LOS_HID)}">✗</b> Cíl B z bodu A <b>není vidět</b>, výhled zakrývá terén ${Math.round(P[los.obst].d)} m od A.`}</div>
              <canvas class="tf-profile" aria-label="Profil terénu mezi body A a B"></canvas>
              <div>${sw(css(LOS_VIS))}viditelný úsek terénu</div>
              <div>${sw(css(LOS_HID))}skrytý úsek terénu (${(hidden * 100).toFixed(0)} % délky)</div>
              ${los.obst >= 0 ? `<div>${sw(css(LOS_OBST))}první překážka výhledu na cíl</div>` : ""}
              <div class="tf-stat">A: ${Math.round(DEM[S.oy * N + S.ox])} m + ${S.off} m · B: ${Math.round(DEM[S.by * N + S.bx])} m + ${S.offB} m · délka ${Math.round(los.L)} m</div>`;
            drawProfile(L.querySelector(".tf-profile"));
            break;
          }
          const v = count((k) => VS[k]);
          L.innerHTML = `<div>${sw("rgb(60,170,50)")}viditelné (${ha(v)} ha, ${(v / N / N * 100).toFixed(1)} %)</div>
            <div>${sw("#999")}neviditelné</div>
            <div class="tf-stat">Pozorovatel: ${Math.round(DEM[S.oy * N + S.ox])} m + ${S.off} m</div>`;
          break;
        }
        case "aspectslope":
          L.innerHTML = `<div class="tf-bivar"><b></b>${DIRS.map((d) => `<b>${d}</b>`).join("")}
            ${[[3, ">40°"], [2, "20–40°"], [1, "5–20°"]].map(([c, t]) => `<b style="font-weight:400">${t}</b>` +
              AS_HUE.map((h) => `<span style="background:${css(bivarCol(c, h))}"></span>`).join("")).join("")}
            </div><div style="margin-top:0.3rem">${sw("#bdbdbd")}rovina (&lt; 5°)</div>`;
          break;
        case "combo": {
          const cond = `<div class="tf-stat">výška ≥ ${S.elevThr} m · sklon ≥ ${S.slopeThr}° · expozice ${selDirs()}</div>`;
          if (S.combo === "mul") {
            const n = count((k) => condE(k) * condS(k) * condA(k));
            L.innerHTML = `<div>${sw(css(CRISK))}1 – splněny všechny (${ha(n)} ha)</div>
              <div>${sw(css(C0))}0 – aspoň jedna nesplněna</div>` + cond;
          } else {
            const c = [0, 0, 0, 0]; for (let k = 0; k < N * N; k++) c[condE(k) + condS(k) + condA(k)]++;
            L.innerHTML = c.map((n, i) => `<div>${sw(css(SUMC[i]))}${i} – ${ha(n)} ha</div>`).join("") + cond;
          }
          break;
        }
      }
    }

    /* ---------- myš a tlačítka ---------- */

    function cellAt(e) {
      const r = map.getBoundingClientRect();
      return [cl(Math.floor((e.clientX - r.left) / r.width * N)), cl(Math.floor((e.clientY - r.top) / r.height * N))];
    }
    map.addEventListener("mousemove", (e) => {
      const [x, y] = cellAt(e), k = y * N + x, d = dirIdx(AS[k]);
      let t = `Z ${Math.round(DEM[k])} m · sklon ${SL[k].toFixed(1)}° · exp. ${AS[k] < 0 ? "−1" : Math.round(AS[k]) + "° (" + DIRS[d] + ")"} · HS ${Math.round(HS[k])}`;
      if (S.tab === "viewshed" && !los) t += VS[k] ? " · viditelné" : " · skryté";
      readout.textContent = t;
    });
    map.addEventListener("mouseleave", () => (readout.textContent = "Najeďte myší na mapu…"));
    map.addEventListener("click", (e) => {
      if (S.tab !== "viewshed" || S.vsMode !== "area") return;
      [S.ox, S.oy] = cellAt(e); dirtyVS = true; schedule();
    });

    // přímka viditelnosti: táhnutí bodů A a B (myš i dotyk)
    let drag = null;
    function moveLosPoint(which, x, y) {
      if (which === "a") { S.ox = x; S.oy = y; dirtyVS = true; } else { S.bx = x; S.by = y; }
      schedule();
    }
    map.addEventListener("pointerdown", (e) => {
      if (!isLos()) return;
      const [x, y] = cellAt(e);
      drag = Math.hypot(x - S.ox, y - S.oy) <= Math.hypot(x - S.bx, y - S.by) ? "a" : "b";
      map.setPointerCapture(e.pointerId);
      moveLosPoint(drag, x, y);
      e.preventDefault();
    });
    map.addEventListener("pointermove", (e) => { if (drag) moveLosPoint(drag, ...cellAt(e)); });
    map.addEventListener("pointerup", () => (drag = null));
    map.addEventListener("pointercancel", () => (drag = null));

    // překreslení přímky a profilu při změně velikosti nebo barevného režimu
    if (window.ResizeObserver) new ResizeObserver(() => { if (los) schedule(); }).observe(map);
    new MutationObserver(() => { if (los) schedule(); })
      .observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });

    tabBtns.forEach((b) => b.addEventListener("click", () => { S.tab = b.dataset.t; renderPanel(); draw(); }));
    root.querySelector('[data-act="new"]').addEventListener("click", () => newTerrain(false));

    newTerrain(true);
  }

  /* ================================================================
   * Inicializace (funguje i s navigation.instant)
   * ================================================================ */

  let uid = 0;
  function init() {
    document.querySelectorAll(".tf[data-tf]").forEach((root) => {
      if (root.dataset.tfReady) return;
      root.dataset.tfReady = "1";
      try {
        if (root.dataset.tf === "topo") initTopo(root);
      } catch (e) {
        root.textContent = "Interaktivní ukázku se nepodařilo načíst.";
        console.error(e);
      }
    });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(init);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

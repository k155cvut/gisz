/*
 * Interaktivní ukázky interpolačních metod (IDW, Spline, Natural Neighbor, Kriging)
 * pro MkDocs Material. Bez externích závislostí.
 *
 * Použití v Markdownu:
 *   <div class="iw" data-iw="profil"></div>   – 1D profil terénem
 *   <div class="iw" data-iw="mapa"></div>     – 2D rastr se srovnáním metod
 */
(function () {
  "use strict";

  /* ================================================================
   * Pomocné funkce
   * ================================================================ */

  const EULER = 0.5772156649;
  const METHODS = [
    { id: "idw", name: "IDW", color: "--iw-s1" },
    { id: "spline", name: "Spline", color: "--iw-s2" },
    { id: "nn", name: "Natural Neighbor", color: "--iw-s3" },
    { id: "krig", name: "Kriging", color: "--iw-s4" },
  ];

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") e.className = attrs[k];
        else if (k === "text") e.textContent = attrs[k];
        else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
        else e.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach((c) => c && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }

  function fmt(v, d) {
    if (!isFinite(v)) return "–";
    return v.toLocaleString("cs-CZ", { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  // záložní barvy pro případ, že se nenačte interpolace.css
  const CSS_FALLBACK = {
    "--iw-s1": "#2a78d6", "--iw-s2": "#eb6834", "--iw-s3": "#1baf7a", "--iw-s4": "#4a3aa7",
    "--iw-surface": "#ffffff", "--iw-ink": "#000000de", "--iw-ink2": "#0000008a", "--iw-muted": "#0000008a",
    "--iw-grid": "#00000012", "--iw-terrain": "rgba(137, 135, 129, 0.14)", "--iw-nodata": "#e1e0d9",
  };

  function cssVar(node, name) {
    return getComputedStyle(node).getPropertyValue(name).trim() || CSS_FALLBACK[name] || "";
  }

  function isDark() {
    return document.body.getAttribute("data-md-color-scheme") === "slate";
  }

  /* Gaussova eliminace s částečnou pivotací. */
  function solve(A, b) {
    const n = b.length;
    const M = A.map((r) => Float64Array.from(r));
    const x = Float64Array.from(b);
    for (let k = 0; k < n; k++) {
      let p = k, mx = Math.abs(M[k][k]);
      for (let i = k + 1; i < n; i++) {
        const v = Math.abs(M[i][k]);
        if (v > mx) { mx = v; p = i; }
      }
      if (p !== k) {
        const tr = M[k]; M[k] = M[p]; M[p] = tr;
        const tx = x[k]; x[k] = x[p]; x[p] = tx;
      }
      if (Math.abs(M[k][k]) < 1e-12) M[k][k] = 1e-12;
      const Mk = M[k], d = Mk[k];
      for (let i = k + 1; i < n; i++) {
        const Mi = M[i], f = Mi[k] / d;
        if (f === 0) continue;
        for (let j = k; j < n; j++) Mi[j] -= f * Mk[j];
        x[i] -= f * x[k];
      }
    }
    for (let i = n - 1; i >= 0; i--) {
      let s = x[i];
      const Mi = M[i];
      for (let j = i + 1; j < n; j++) s -= Mi[j] * x[j];
      x[i] = s / Mi[i];
    }
    return x;
  }

  /* Modifikovaná Besselova funkce K0 (Abramowitz & Stegun 9.8.5, 9.8.6). */
  function besselI0small(x) {
    const t = (x / 3.75) * (x / 3.75);
    return 1 + t * (3.5156229 + t * (3.0899424 + t * (1.2067492 + t * (0.2659732 + t * (0.0360768 + t * 0.0045813)))));
  }
  function besselK0(x) {
    if (x <= 2) {
      const y = (x * x) / 4;
      return -Math.log(x / 2) * besselI0small(x) +
        (-0.57721566 + y * (0.4227842 + y * (0.23069756 + y * (0.0348859 + y * (0.00262698 + y * (0.0001075 + y * 0.0000074))))));
    }
    const y = 2 / x;
    return (Math.exp(-x) / Math.sqrt(x)) *
      (1.25331414 + y * (-0.07832358 + y * (0.02189568 + y * (-0.01062446 + y * (0.00587872 + y * (-0.0025154 + y * 0.00053208))))));
  }

  /* ================================================================
   * Interpolační metody (body: {x, y, z}; 1D = y ≡ 0)
   * ================================================================ */

  function buildIDW(pts, power, k) {
    const n = pts.length;
    k = Math.min(k || n, n);
    const hp = power / 2;
    const bd = new Float64Array(k), bz = new Float64Array(k);
    return function (x, y) {
      if (k >= n) {
        let sw = 0, sz = 0;
        for (let i = 0; i < n; i++) {
          const dx = pts[i].x - x, dy = pts[i].y - y, d2 = dx * dx + dy * dy;
          if (d2 < 1e-12) return pts[i].z;
          const w = Math.pow(d2, -hp);
          sw += w; sz += w * pts[i].z;
        }
        return sz / sw;
      }
      bd.fill(Infinity);
      for (let i = 0; i < n; i++) {
        const dx = pts[i].x - x, dy = pts[i].y - y, d2 = dx * dx + dy * dy;
        if (d2 < 1e-12) return pts[i].z;
        if (d2 < bd[k - 1]) {
          let j = k - 1;
          while (j > 0 && bd[j - 1] > d2) { bd[j] = bd[j - 1]; bz[j] = bz[j - 1]; j--; }
          bd[j] = d2; bz[j] = pts[i].z;
        }
      }
      let sw = 0, sz = 0;
      for (let j = 0; j < k; j++) { const w = Math.pow(bd[j], -hp); sw += w; sz += w * bz[j]; }
      return sz / sw;
    };
  }

  /* Radiální bázové funkce + polynomiální trend (spline). */
  function buildRBF(pts, kernel, terms) {
    const n = pts.length, m = terms.length, N = n + m;
    const A = [];
    for (let i = 0; i < N; i++) A.push(new Float64Array(N));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) A[i][j] = kernel(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
      for (let t = 0; t < m; t++) { const v = terms[t](pts[i].x, pts[i].y); A[i][n + t] = v; A[n + t][i] = v; }
    }
    const rhs = new Float64Array(N);
    for (let i = 0; i < n; i++) rhs[i] = pts[i].z;
    const w = solve(A, rhs);
    return function (x, y) {
      let s = 0;
      for (let i = 0; i < n; i++) s += w[i] * kernel(Math.hypot(pts[i].x - x, pts[i].y - y));
      for (let t = 0; t < m; t++) s += w[n + t] * terms[t](x, y);
      return s;
    };
  }

  /* Jádra splinu podle dokumentace ArcGIS (souřadnice normalizované na šířku území). */
  function kernelRegularized(tau) {
    if (tau <= 0) return (r) => (r < 1e-12 ? 0 : r * r * Math.log(r)); // thin plate spline
    const r0 = (tau * tau * Math.log(tau / Math.PI)) / (2 * Math.PI);
    return function (r) {
      if (r < 1e-12) return r0;
      return (1 / (2 * Math.PI)) * ((r * r) / 4 * (Math.log(r / (2 * tau)) + EULER - 1) +
        tau * tau * (besselK0(r / tau) + EULER + Math.log(r / (2 * Math.PI))));
    };
  }
  function kernelTension(phi) {
    return function (r) {
      if (r < 1e-12) return 0;
      return (-1 / (2 * Math.PI * phi * phi)) * (Math.log((r * phi) / 2) + EULER + besselK0(r * phi));
    };
  }
  /* 1D: τ = 0 → přirozený kubický spline, τ > 0 → spline s napětím. */
  function kernel1D(tau) {
    if (tau <= 0) return (r) => r * r * r;
    return (r) => (Math.exp(-tau * r) - 1 + tau * r) / (2 * tau * tau * tau);
  }

  function makeVariogram(model, range, sill, nugget) {
    const c0 = nugget, c = Math.max(sill - nugget, 1e-9);
    let f;
    if (model === "spherical") f = (h) => (h >= range ? 1 : 1.5 * (h / range) - 0.5 * Math.pow(h / range, 3));
    else if (model === "exponential") f = (h) => 1 - Math.exp((-3 * h) / range);
    else f = (h) => 1 - Math.exp((-3 * h * h) / (range * range));
    return (h) => (h <= 0 ? 0 : c0 + c * f(h));
  }

  /* Ordinary Kriging v duálním tvaru; rozptyl se počítá zvlášť. */
  function buildKriging(pts, gamma) {
    const n = pts.length, N = n + 1;
    const A = [];
    for (let i = 0; i < N; i++) A.push(new Float64Array(N));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) A[i][j] = gamma(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
      A[i][n] = 1; A[n][i] = 1;
    }
    const rhs = new Float64Array(N);
    for (let i = 0; i < n; i++) rhs[i] = pts[i].z;
    const w = solve(A, rhs);
    return {
      predict(x, y) {
        let s = w[n];
        for (let i = 0; i < n; i++) s += w[i] * gamma(Math.hypot(pts[i].x - x, pts[i].y - y));
        return s;
      },
      variance(x, y) {
        const b = new Float64Array(N);
        for (let i = 0; i < n; i++) b[i] = gamma(Math.hypot(pts[i].x - x, pts[i].y - y));
        b[n] = 1;
        const l = solve(A, b);
        let s = l[n];
        for (let i = 0; i < n; i++) s += l[i] * b[i];
        return Math.max(0, s);
      },
    };
  }

  function variance(zs) {
    const m = zs.reduce((a, b) => a + b, 0) / zs.length;
    return zs.reduce((a, b) => a + (b - m) * (b - m), 0) / Math.max(1, zs.length - 1);
  }

  /* ================================================================
   * Barvy rastru
   * ================================================================ */

  function hex2rgb(h) {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function rampFrom(stops) {
    const c = stops.map(hex2rgb);
    return function (t) {
      t = Math.min(1, Math.max(0, t)) * (c.length - 1);
      const i = Math.min(c.length - 2, Math.floor(t)), f = t - i;
      return [0, 1, 2].map((k) => c[i][k] + (c[i + 1][k] - c[i][k]) * f);
    };
  }
  // hypsometrická stupnice (nížiny zeleně → vrcholy hnědě), jak ji studenti znají z ArcGIS
  const RAMP_ELEV = rampFrom(["#3f7f55", "#7fae66", "#cfd08a", "#e2bd7c", "#b98552", "#8a5a3a"]);
  function rampDiverging() {
    const mid = isDark() ? "#383835" : "#f0efec";
    return rampFrom(["#104281", "#3987e5", "#9ec5f4", mid, "#f2aaa8", "#e34948", "#9c1c1c"]);
  }
  function gradientCss(ramp) {
    const s = [];
    for (let i = 0; i <= 10; i++) { const c = ramp(i / 10).map(Math.round); s.push(`rgb(${c}) ${i * 10}%`); }
    return `linear-gradient(to right, ${s.join(",")})`;
  }

  /* ================================================================
   * Společné UI prvky
   * ================================================================ */

  function slider(label, min, max, step, value, unit, onInput, format) {
    const out = el("output", { class: "iw-val" });
    const show = (v) => (out.textContent = (format ? format(v) : fmt(v, step < 1 ? (step < 0.1 ? 2 : 1) : 0)) + (unit || ""));
    const inp = el("input", { type: "range", min, max, step, value });
    inp.addEventListener("input", () => { show(+inp.value); onInput(+inp.value); });
    show(value);
    const wrap = el("label", { class: "iw-ctrl" }, [el("span", { class: "iw-lab" }, [label, out]), inp]);
    wrap.input = inp;
    return wrap;
  }

  function select(label, options, value, onChange) {
    const s = el("select", {});
    options.forEach(([v, t]) => { const o = el("option", { value: v, text: t }); if (v === value) o.selected = true; s.appendChild(o); });
    s.addEventListener("change", () => onChange(s.value));
    return el("label", { class: "iw-ctrl" }, [el("span", { class: "iw-lab" }, [label]), s]);
  }

  function checkbox(label, value, onChange, swatch) {
    const c = el("input", { type: "checkbox" });
    c.checked = value;
    c.addEventListener("change", () => onChange(c.checked));
    return el("label", { class: "iw-check" }, [c, swatch || null, el("span", { text: label })]);
  }

  function button(label, onClick) {
    return el("button", { type: "button", class: "iw-btn", onclick: onClick, text: label });
  }

  function segmented(options, value, onChange) {
    const g = el("div", { class: "iw-seg", role: "group" });
    const btns = options.map(([v, t]) => {
      const b = el("button", { type: "button", class: "iw-btn", "aria-pressed": String(v === value), text: t });
      b.addEventListener("click", () => { btns.forEach((x) => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); onChange(v); });
      g.appendChild(b);
      return b;
    });
    g.set = (v) => btns.forEach((b, i) => b.setAttribute("aria-pressed", String(options[i][0] === v)));
    return g;
  }

  function setupCanvas(canvas, cssW, cssH) {
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function niceTicks(min, max, count) {
    const span = max - min, raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || 10 * mag;
    const ticks = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(v);
    return ticks;
  }

  function onRedraw(root, fn) {
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); };
    new ResizeObserver(schedule).observe(root);
    new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
    return schedule;
  }

  /* ================================================================
   * Widget 1: profil (1D)
   * ================================================================ */

  function initProfile(root) {
    const L = 1000; // délka profilu [m]
    const truth = (x) => {
      const u = x / L;
      return 320 + 45 * Math.sin(2 * Math.PI * 1.1 * u + 0.3) + 18 * Math.sin(2 * Math.PI * 3.3 * u + 1.1) +
        38 * Math.exp(-Math.pow((u - 0.63) / 0.045, 2)) - 22 * Math.exp(-Math.pow((u - 0.3) / 0.06, 2));
    };
    const S = 400; // vzorků křivky
    const xs = Array.from({ length: S + 1 }, (_, i) => (i / S) * L);
    const tz = xs.map(truth);
    let yMin = Math.min(...tz), yMax = Math.max(...tz);
    const pad = (yMax - yMin) * 0.25;
    yMin -= pad; yMax += pad;

    const st = {
      n: 8, seed: 3, pts: [],
      show: { idw: true, spline: true, nn: true, krig: true },
      power: 2, tau: 0, model: "spherical", range: 250, nugget: 0, band: true,
    };

    function randomPts() {
      const r = rng(st.seed), pts = [];
      let guard = 0;
      while (pts.length < st.n && guard++ < 5000) {
        const x = 20 + r() * (L - 40);
        if (pts.every((p) => Math.abs(p.x - x) > L / (st.n * 3))) pts.push({ x, y: 0, z: truth(x) });
      }
      st.pts = pts.sort((a, b) => a.x - b.x);
    }
    randomPts();

    root.innerHTML = "";
    const canvas = el("canvas", { class: "iw-canvas", role: "img", "aria-label": "Profil terénem s interpolovanými křivkami" });
    const tip = el("div", { class: "iw-tip", hidden: "" });
    const legend = el("div", { class: "iw-legend" });
    const plot = el("div", { class: "iw-plot" }, [canvas, tip]);

    // jeden řádek ovládacích prvků; title = název metody (barva podle její křivky)
    const ctrlRow = (title, color, items) => {
      const head = el("span", { class: "iw-ctrl-title", text: title || "" });
      if (color) head.style.setProperty("--iw-title-color", "var(" + color + ")");
      return el("div", { class: "iw-ctrl-row" }, [head, ...items]);
    };
    const ctrls = el("div", { class: "iw-ctrls iw-ctrls-rows" }, [
      ctrlRow("Body", null, [
        slider("Počet bodů", 3, 25, 1, st.n, "", (v) => { st.n = v; randomPts(); update(); }),
        el("div", { class: "iw-ctrl iw-ctrl-btn" }, [button("Nové náhodné body", () => { st.seed++; randomPts(); update(); })]),
      ]),
      ctrlRow("IDW", "--iw-s1", [
        slider("Power", 0.5, 6, 0.5, st.power, "", (v) => { st.power = v; update(); }),
      ]),
      ctrlRow("Spline", "--iw-s2", [
        slider("Napětí (0 = Regularized)", 0, 60, 1, st.tau, "", (v) => { st.tau = v; update(); }),
      ]),
      ctrlRow("Kriging", "--iw-s4", [
        select("Model semivariogramu", [["spherical", "Spherical"], ["exponential", "Exponential"], ["gaussian", "Gaussian"]], st.model, (v) => { st.model = v; update(); }),
        slider("Range", 20, 1000, 10, st.range, " m", (v) => { st.range = v; update(); }),
        slider("Nugget", 0, 50, 1, st.nugget, " %", (v) => { st.nugget = v; update(); }),
        el("div", { class: "iw-ctrl iw-ctrl-btn iw-ctrl-center" }, [checkbox("Pás nejistoty ±2σ", st.band, (v) => { st.band = v; update(); })]),
      ]),
    ]);

    root.append(
      el("div", { class: "iw-head" }, [
        el("strong", { text: "Profil terénem" }),
        el("span", { class: "iw-hint", text: "Kliknutím do grafu přidáte měřený bod, kliknutím na bod ho odeberete." }),
      ]),
      legend, plot, ctrls
    );

    let curves = {}, bandLo = null, bandHi = null, rmse = {};

    function compute() {
      const pts = st.pts;
      curves = {}; rmse = {}; bandLo = bandHi = null;
      if (pts.length < 2) return;
      const idw = buildIDW(pts, st.power);
      const norm = pts.map((p) => ({ x: p.x / L, y: 0, z: p.z }));
      const spl = buildRBF(norm, kernel1D(st.tau), [() => 1, (x) => x]);
      const zs = pts.map((p) => p.z), sill = variance(zs);
      let nug = (st.nugget / 100) * sill;
      if (st.model === "gaussian") nug = Math.max(nug, 1e-4 * sill);
      const kr = buildKriging(pts, makeVariogram(st.model, st.range, sill, nug));
      const x0 = pts[0].x, x1 = pts[pts.length - 1].x;

      curves.idw = xs.map((x) => idw(x, 0));
      curves.spline = xs.map((x) => spl(x / L, 0));
      curves.nn = xs.map((x) => {
        if (x < x0 || x > x1) return NaN;
        let i = 0;
        while (i < pts.length - 2 && pts[i + 1].x < x) i++;
        const a = pts[i], b = pts[i + 1], t = (x - a.x) / (b.x - a.x);
        return a.z + t * (b.z - a.z);
      });
      curves.krig = xs.map((x) => kr.predict(x, 0));
      if (st.band) {
        bandLo = []; bandHi = [];
        xs.forEach((x, i) => { const s = 2 * Math.sqrt(kr.variance(x, 0)); bandLo.push(curves.krig[i] - s); bandHi.push(curves.krig[i] + s); });
      }
      METHODS.forEach((m) => {
        let s = 0, c = 0;
        xs.forEach((x, i) => { if (x >= x0 && x <= x1 && isFinite(curves[m.id][i])) { const e = curves[m.id][i] - tz[i]; s += e * e; c++; } });
        rmse[m.id] = c ? Math.sqrt(s / c) : NaN;
      });
    }

    function renderLegend() {
      legend.innerHTML = "";
      const best = METHODS.reduce((b, m) => (rmse[m.id] < rmse[b.id] ? m : b), METHODS[0]);
      METHODS.forEach((m) => {
        const sw = el("span", { class: "iw-swatch-line" });
        sw.style.background = cssVar(root, m.color);
        const lab = checkbox(m.name, st.show[m.id], (v) => { st.show[m.id] = v; draw(); }, sw);
        lab.appendChild(el("span", { class: "iw-rmse" + (m.id === best.id ? " iw-best" : ""), text: "RMSE " + fmt(rmse[m.id], 1) + " m" }));
        legend.appendChild(lab);
      });
      const tsw = el("span", { class: "iw-swatch-line iw-swatch-dash" });
      legend.appendChild(el("span", { class: "iw-check iw-static" }, [tsw, el("span", { text: "skutečný terén" })]));
    }

    const M = { l: 44, r: 20, t: 10, b: 30 };
    let geom = null, hoverX = null;

    function draw() {
      const w = plot.clientWidth;
      if (!w) return;
      const h = Math.max(220, Math.min(340, w * 0.45));
      const ctx = setupCanvas(canvas, w, h);
      const pw = w - M.l - M.r, ph = h - M.t - M.b;
      const X = (x) => M.l + (x / L) * pw, Y = (z) => M.t + (1 - (z - yMin) / (yMax - yMin)) * ph;
      geom = { X, Y, pw, ph, w, h };
      const ink = cssVar(root, "--iw-ink"), ink2 = cssVar(root, "--iw-ink2"), muted = cssVar(root, "--iw-muted"),
        grid = cssVar(root, "--iw-grid"), surface = cssVar(root, "--iw-surface"), terrain = cssVar(root, "--iw-terrain");

      ctx.clearRect(0, 0, w, h);
      ctx.font = "11px " + getComputedStyle(root).fontFamily;
      // mřížka a osy
      ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.fillStyle = muted; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      niceTicks(yMin, yMax, 7).forEach((v) => {
        const y = Math.round(Y(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(M.l, y); ctx.lineTo(w - M.r, y); ctx.stroke();
        ctx.fillText(fmt(v, 0), M.l - 6, y);
      });
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      niceTicks(0, L, 8).forEach((v) => ctx.fillText(fmt(v, 0), X(v), h - M.b + 6));
      ctx.textAlign = "right";
      ctx.fillText("vzdálenost [m]", w - M.r, h - 12);
      ctx.save(); ctx.translate(11, M.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("výška [m n. m.]", 0, 0); ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.rect(M.l, M.t, pw, ph); ctx.clip();
      // skutečný terén
      ctx.beginPath(); ctx.moveTo(X(0), Y(yMin));
      xs.forEach((x, i) => ctx.lineTo(X(x), Y(tz[i])));
      ctx.lineTo(X(L), Y(yMin)); ctx.closePath(); ctx.fillStyle = terrain; ctx.fill();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = muted; ctx.lineWidth = 1.5;
      ctx.beginPath(); xs.forEach((x, i) => (i ? ctx.lineTo(X(x), Y(tz[i])) : ctx.moveTo(X(x), Y(tz[i])))); ctx.stroke();
      ctx.setLineDash([]);

      // pás nejistoty krigingu
      if (bandLo && st.show.krig) {
        ctx.beginPath();
        xs.forEach((x, i) => (i ? ctx.lineTo(X(x), Y(bandHi[i])) : ctx.moveTo(X(x), Y(bandHi[i]))));
        for (let i = xs.length - 1; i >= 0; i--) ctx.lineTo(X(xs[i]), Y(bandLo[i]));
        ctx.closePath(); ctx.globalAlpha = 0.1; ctx.fillStyle = cssVar(root, "--iw-s4"); ctx.fill(); ctx.globalAlpha = 1;
      }
      // křivky metod
      METHODS.forEach((m) => {
        if (!st.show[m.id] || !curves[m.id]) return;
        ctx.strokeStyle = cssVar(root, m.color); ctx.lineWidth = 2; ctx.lineJoin = "round";
        ctx.beginPath();
        let pen = false;
        curves[m.id].forEach((z, i) => {
          if (!isFinite(z)) { pen = false; return; }
          if (pen) ctx.lineTo(X(xs[i]), Y(z)); else { ctx.moveTo(X(xs[i]), Y(z)); pen = true; }
        });
        ctx.stroke();
      });
      ctx.restore();

      // hover
      if (hoverX !== null) {
        ctx.strokeStyle = ink2; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(Math.round(X(hoverX)) + 0.5, M.t); ctx.lineTo(Math.round(X(hoverX)) + 0.5, M.t + ph); ctx.stroke();
      }
      // měřené body
      st.pts.forEach((p) => {
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.z), 5, 0, 2 * Math.PI);
        ctx.fillStyle = ink; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = surface; ctx.stroke();
      });
    }

    let upd = 0;
    function update() { cancelAnimationFrame(upd); upd = requestAnimationFrame(() => { compute(); renderLegend(); draw(); }); }

    function pointerPos(ev) {
      const r = canvas.getBoundingClientRect();
      return { px: ev.clientX - r.left, py: ev.clientY - r.top };
    }

    canvas.addEventListener("click", (ev) => {
      if (!geom) return;
      const { px, py } = pointerPos(ev);
      const hit = st.pts.findIndex((p) => Math.hypot(geom.X(p.x) - px, geom.Y(p.z) - py) < 10);
      if (hit >= 0) { if (st.pts.length > 2) st.pts.splice(hit, 1); }
      else {
        const x = ((px - M.l) / geom.pw) * L;
        if (x < 0 || x > L) return;
        if (st.pts.some((p) => Math.abs(geom.X(p.x) - px) < 6)) return;
        st.pts.push({ x, y: 0, z: truth(x) });
        st.pts.sort((a, b) => a.x - b.x);
      }
      update();
    });
    canvas.addEventListener("mousemove", (ev) => {
      if (!geom) return;
      const { px } = pointerPos(ev);
      const x = ((px - M.l) / geom.pw) * L;
      if (x < 0 || x > L) { hoverX = null; tip.hidden = true; draw(); return; }
      const i = Math.round((x / L) * S);
      hoverX = xs[i];
      const rows = [el("div", { class: "iw-tip-h", text: fmt(hoverX, 0) + " m" }),
        el("div", {}, [el("span", { text: "skutečnost" }), el("b", { text: fmt(tz[i], 1) + " m" })])];
      METHODS.forEach((m) => {
        if (!st.show[m.id] || !curves[m.id]) return;
        const sw = el("i", { class: "iw-dot" }); sw.style.background = cssVar(root, m.color);
        rows.push(el("div", {}, [el("span", {}, [sw, m.name]), el("b", { text: fmt(curves[m.id][i], 1) + " m" })]));
      });
      tip.replaceChildren(...rows);
      tip.hidden = false;
      const left = geom.X(hoverX) + 14;
      tip.style.left = (left + tip.offsetWidth > geom.w ? geom.X(hoverX) - tip.offsetWidth - 14 : left) + "px";
      tip.style.top = M.t + 4 + "px";
      draw();
    });
    canvas.addEventListener("mouseleave", () => { hoverX = null; tip.hidden = true; draw(); });

    compute(); renderLegend();
    onRedraw(root, () => { renderLegend(); draw(); })();
  }

  /* ================================================================
   * Widget 2: mapa (2D)
   * ================================================================ */

  function initMap(root) {
    const W = 150, H = 100, CELL = 10; // rastr 150 × 100 buněk po 10 m
    const DX = W * CELL, DY = H * CELL;
    const gauss = (u, v, cu, cv, su, sv) => Math.exp(-0.5 * Math.pow((u - cu) / su, 2) - 0.5 * Math.pow((v - cv) / sv, 2));
    const truthFn = (x, y) => {
      const u = x / DX, v = y / DY;
      let z = 250 + 60 * u + 20 * v;
      z += 115 * gauss(u, v, 0.27, 0.34, 0.1, 0.14);
      z += 75 * gauss(u, v, 0.7, 0.7, 0.07, 0.07);
      z += 45 * gauss(u, v, 0.8, 0.24, 0.05, 0.12);
      z -= 45 * gauss(u, v, 0.52, 0.6, 0.3, 0.045);
      z += 5 * Math.sin(u * 12 + v * 4) * Math.cos(v * 9);
      return z;
    };
    const truth = new Float64Array(W * H);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) truth[r * W + c] = truthFn((c + 0.5) * CELL, (r + 0.5) * CELL);
    let tMin = Infinity, tMax = -Infinity;
    truth.forEach((v) => { tMin = Math.min(tMin, v); tMax = Math.max(tMax, v); });

    const st = {
      n: 40, seed: 7, pts: [], version: 0,
      method: "idw", view: "interp", showPts: true, voronoi: true,
      power: 2, k: 12,
      splineType: "regularized", wReg: 0.1, wTen: 5,
      model: "spherical", range: 450, nugget: 0,
    };

    function randomPts() {
      const r = rng(st.seed), pts = [];
      const minD = Math.max(25, Math.sqrt((DX * DY) / st.n) * 0.45);
      let guard = 0;
      while (pts.length < st.n && guard++ < 20000) {
        const x = 15 + r() * (DX - 30), y = 15 + r() * (DY - 30);
        if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > minD)) pts.push({ x, y, z: truthFn(x, y) });
      }
      st.pts = pts; st.version++;
    }
    randomPts();

    /* ---------- výpočty ---------- */
    const cache = {};
    let hullCache = { v: -1 };

    function hull() {
      if (hullCache.v === st.version) return hullCache;
      const p = st.pts.map((q) => [q.x, q.y]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], up = [];
      p.forEach((q) => { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
      for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      const poly = lo.slice(0, -1).concat(up.slice(0, -1));
      const mask = new Uint8Array(W * H);
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const x = (c + 0.5) * CELL, y = (r + 0.5) * CELL;
        let inside = poly.length >= 3;
        for (let i = 0; i < poly.length && inside; i++) {
          const a = poly[i], b = poly[(i + 1) % poly.length];
          if ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]) < 0) inside = false;
        }
        mask[r * W + c] = inside ? 1 : 0;
      }
      hullCache = { v: st.version, poly, mask };
      return hullCache;
    }

    function sig(m) {
      if (m === "idw") return `${st.power}|${st.k}`;
      if (m === "spline") return st.splineType === "regularized" ? `r${st.wReg}` : `t${st.wTen}`;
      if (m === "nn") return "nn";
      return `${st.model}|${st.range}|${st.nugget}`;
    }

    function gridFromFn(f) {
      const g = new Float64Array(W * H);
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) g[r * W + c] = f((c + 0.5) * CELL, (r + 0.5) * CELL);
      return g;
    }

    function naturalNeighborGrid() {
      // Diskrétní Sibsonova interpolace (Park et al., 2006)
      const pts = st.pts.map((p) => ({ c: p.x / CELL - 0.5, r: p.y / CELL - 0.5, z: p.z }));
      const n = pts.length, near = new Int32Array(W * H), rad = new Float64Array(W * H);
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        let best = Infinity, bi = 0;
        for (let i = 0; i < n; i++) { const d = (pts[i].c - c) ** 2 + (pts[i].r - r) ** 2; if (d < best) { best = d; bi = i; } }
        near[r * W + c] = bi; rad[r * W + c] = Math.sqrt(best);
      }
      const sum = new Float64Array(W * H), cnt = new Float64Array(W * H);
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const R = rad[r * W + c], z = pts[near[r * W + c]].z, R2 = R * R;
        const r0 = Math.max(0, Math.ceil(r - R)), r1 = Math.min(H - 1, Math.floor(r + R));
        for (let qr = r0; qr <= r1; qr++) {
          const span = Math.sqrt(Math.max(0, R2 - (qr - r) * (qr - r)));
          const c0 = Math.max(0, Math.ceil(c - span)), c1 = Math.min(W - 1, Math.floor(c + span));
          const row = qr * W;
          for (let qc = c0; qc <= c1; qc++) { sum[row + qc] += z; cnt[row + qc]++; }
        }
      }
      const mask = hull().mask, g = new Float64Array(W * H);
      for (let i = 0; i < W * H; i++) g[i] = mask[i] && cnt[i] ? sum[i] / cnt[i] : NaN;
      return { grid: g, near };
    }

    function krigParams() {
      const sill = variance(st.pts.map((p) => p.z));
      let nug = (st.nugget / 100) * sill;
      if (st.model === "gaussian") nug = Math.max(nug, 1e-4 * sill);
      return { sill, nug, gamma: makeVariogram(st.model, st.range, sill, nug) };
    }

    function computeMethod(m) {
      const s = sig(m) + "#" + st.version;
      if (cache[m] && cache[m].sig === s) return cache[m];
      let grid, extra = null;
      if (m === "idw") grid = gridFromFn(buildIDW(st.pts, st.power, st.k));
      else if (m === "spline") {
        const norm = st.pts.map((p) => ({ x: p.x / DX, y: p.y / DX, z: p.z }));
        const f = st.splineType === "regularized"
          ? buildRBF(norm, kernelRegularized(st.wReg), [() => 1, (x) => x, (x, y) => y])
          : buildRBF(norm, kernelTension(st.wTen), [() => 1]);
        grid = gridFromFn((x, y) => f(x / DX, y / DX));
      } else if (m === "nn") { const r = naturalNeighborGrid(); grid = r.grid; extra = r.near; }
      else { const k = buildKriging(st.pts, krigParams().gamma); grid = gridFromFn(k.predict); }
      // statistiky v konvexní obálce bodů (stejná plocha pro všechny metody)
      const mask = hull().mask;
      let s2 = 0, s1 = 0, mx = 0, c = 0;
      const absErr = [];
      for (let i = 0; i < W * H; i++) {
        if (!mask[i] || !isFinite(grid[i])) continue;
        const e = grid[i] - truth[i];
        s2 += e * e; s1 += e; mx = Math.max(mx, Math.abs(e)); c++; absErr.push(Math.abs(e));
      }
      absErr.sort((a, b) => a - b);
      cache[m] = { sig: s, grid, near: extra, rmse: Math.sqrt(s2 / c), me: s1 / c, max: mx, p98: absErr[Math.floor(absErr.length * 0.98)] || 1 };
      return cache[m];
    }

    function hillshade(g) {
      const hs = new Float64Array(W * H), zf = 3;
      const azMath = ((360 - 315 + 90) % 360) * Math.PI / 180, zenith = (45 * Math.PI) / 180; // azimut 315°, výška slunce 45°
      const at = (r, c, def) => { r = Math.min(H - 1, Math.max(0, r)); c = Math.min(W - 1, Math.max(0, c)); const v = g[r * W + c]; return isFinite(v) ? v : def; };
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const z0 = g[r * W + c];
        if (!isFinite(z0)) continue;
        const a = at(r - 1, c - 1, z0), b = at(r - 1, c, z0), cc = at(r - 1, c + 1, z0), d = at(r, c - 1, z0), f = at(r, c + 1, z0),
          gg = at(r + 1, c - 1, z0), h = at(r + 1, c, z0), i = at(r + 1, c + 1, z0);
        const dzdx = ((cc + 2 * f + i) - (a + 2 * d + gg)) / (8 * CELL);
        const dzdy = ((gg + 2 * h + i) - (a + 2 * b + cc)) / (8 * CELL);
        const slope = Math.atan(zf * Math.hypot(dzdx, dzdy));
        const aspect = Math.atan2(dzdy, -dzdx);
        hs[r * W + c] = Math.max(0, Math.cos(zenith) * Math.cos(slope) + Math.sin(zenith) * Math.sin(slope) * Math.cos(azMath - aspect));
      }
      return hs;
    }

    /* ---------- DOM ---------- */
    root.innerHTML = "";
    const canvas = el("canvas", { class: "iw-canvas iw-map", role: "img", "aria-label": "Rastr interpolovaného povrchu" });
    const tip = el("div", { class: "iw-tip", hidden: "" });
    const plot = el("div", { class: "iw-plot" }, [canvas, tip]);
    const scale = el("div", { class: "iw-scale" });
    const table = el("div", { class: "iw-table" });
    const params = el("div", { class: "iw-ctrls" });
    const vario = el("div", { class: "iw-vario", hidden: "" });
    const varioCanvas = el("canvas", { class: "iw-canvas" });
    const varioTip = el("div", { class: "iw-tip", hidden: "" });
    vario.append(el("div", { class: "iw-sub", text: "Semivariogram – body: empirický (z měřených bodů), čára: zvolený model. Nastavte Range a Nugget tak, aby čára vystihla body." }),
      el("div", { class: "iw-plot" }, [varioCanvas, varioTip]));

    const methodSeg = segmented(METHODS.map((m) => [m.id, m.name]), st.method, (v) => { st.method = v; buildParams(); update(); });
    const viewSeg = segmented([["interp", "Interpolace"], ["error", "Chyba (interpolace − skutečnost)"], ["truth", "Skutečný povrch"]], st.view, (v) => { st.view = v; draw(); });

    root.append(
      el("div", { class: "iw-head" }, [
        el("strong", { text: "Rastr 1 500 × 1 000 m" }),
        el("span", { class: "iw-hint", text: "Kliknutím do mapy přidáte měřený bod, kliknutím na bod ho odeberete." }),
      ]),
      el("div", { class: "iw-row" }, [el("span", { class: "iw-rowlab", text: "Metoda" }), methodSeg]),
      el("div", { class: "iw-row" }, [el("span", { class: "iw-rowlab", text: "Zobrazit" }), viewSeg]),
      plot, scale,
      el("div", { class: "iw-ctrls" }, [
        slider("Počet bodů", 5, 200, 1, st.n, "", (v) => { st.n = v; randomPts(); update(); }),
        el("div", { class: "iw-ctrl iw-ctrl-btn" }, [button("Nové náhodné body", () => { st.seed++; randomPts(); update(); })]),
        el("div", { class: "iw-ctrl iw-ctrl-btn" }, [checkbox("Zobrazit body", st.showPts, (v) => { st.showPts = v; draw(); })]),
      ]),
      params, vario, table
    );

    function buildParams() {
      params.innerHTML = "";
      const m = st.method;
      if (m === "idw") {
        params.append(
          slider("Power", 0.5, 6, 0.5, st.power, "", (v) => { st.power = v; update(); }),
          slider("Počet nejbližších bodů", 1, 50, 1, st.k, "", (v) => { st.k = v; update(); })
        );
      } else if (m === "spline") {
        const w = el("div", { class: "iw-ctrl" });
        const renderW = () => {
          w.replaceChildren(st.splineType === "regularized"
            ? slider("Weight (Regularized)", 0, 0.5, 0.01, st.wReg, "", (v) => { st.wReg = v; update(); })
            : slider("Weight (Tension)", 0.5, 30, 0.5, st.wTen, "", (v) => { st.wTen = v; update(); }));
        };
        params.append(select("Spline type", [["regularized", "Regularized"], ["tension", "Tension"]], st.splineType, (v) => { st.splineType = v; renderW(); update(); }), w);
        renderW();
      } else if (m === "nn") {
        params.append(el("div", { class: "iw-ctrl iw-ctrl-btn" }, [checkbox("Zobrazit Thiessenovy polygony", st.voronoi, (v) => { st.voronoi = v; draw(); })]));
      } else {
        params.append(
          select("Model semivariogramu", [["spherical", "Spherical"], ["exponential", "Exponential"], ["gaussian", "Gaussian"]], st.model, (v) => { st.model = v; update(); }),
          slider("Range", 50, 1500, 10, st.range, " m", (v) => { st.range = v; update(); }),
          slider("Nugget (podíl ze sillu)", 0, 50, 1, st.nugget, " %", (v) => { st.nugget = v; update(); })
        );
      }
      vario.hidden = m !== "krig";
    }
    buildParams();

    /* ---------- vykreslení ---------- */
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const offCtx = off.getContext("2d");
    let geom = null, errScale = 1;

    function renderTable() {
      const res = METHODS.map((m) => ({ m, r: computeMethod(m.id) }));
      const maxR = Math.max(...res.map((x) => x.r.rmse));
      const best = res.reduce((b, x) => (x.r.rmse < b.r.rmse ? x : b), res[0]);
      table.replaceChildren(
        el("div", { class: "iw-sub", text: "Srovnání metod s aktuálním nastavením – chyby počítané v konvexní obálce bodů (stejná plocha pro všechny metody)." }),
        el("table", {}, [
          el("thead", {}, [el("tr", {}, ["Metoda", "RMSE", "", "Průměrná chyba", "Max. |chyba|"].map((t) => el("th", { text: t })))]),
          el("tbody", {}, res.map(({ m, r }) => {
            const bar = el("span", { class: "iw-bar" });
            bar.style.width = (r.rmse / maxR) * 100 + "%";
            bar.style.background = cssVar(root, m.color);
            const tr = el("tr", { class: (m.id === st.method ? "iw-sel " : "") + (m === best.m ? "iw-best" : ""), tabindex: "0" }, [
              el("td", { text: m.name }),
              el("td", { class: "iw-num", text: fmt(r.rmse, 2) + " m" }),
              el("td", { class: "iw-barcell" }, [bar]),
              el("td", { class: "iw-num", text: (r.me > 0 ? "+" : "") + fmt(r.me, 2) + " m" }),
              el("td", { class: "iw-num", text: fmt(r.max, 1) + " m" }),
            ]);
            const pick = () => { st.method = m.id; methodSeg.set(m.id); buildParams(); update(); };
            tr.addEventListener("click", pick);
            tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
            return tr;
          })),
        ])
      );
      errScale = Math.max(1, ...res.map((x) => x.r.p98));
    }

    function draw() {
      const w = plot.clientWidth;
      if (!w) return;
      const h = w * (H / W);
      const ctx = setupCanvas(canvas, w, h);
      geom = { w, h, sx: w / DX, sy: h / DY };
      const res = computeMethod(st.method);
      const img = offCtx.createImageData(W, H);
      let label;

      if (st.view === "error") {
        const ramp = rampDiverging();
        for (let i = 0; i < W * H; i++) {
          const v = res.grid[i];
          if (!isFinite(v)) continue;
          const c = ramp(0.5 + (v - truth[i]) / (2 * errScale));
          img.data.set([c[0], c[1], c[2], 255], i * 4);
        }
        scale.style.setProperty("--iw-grad", gradientCss(ramp));
        label = ["−" + fmt(errScale, 0) + " m (interpolace nižší)", "0", "+" + fmt(errScale, 0) + " m (interpolace vyšší)"];
      } else {
        const g = st.view === "truth" ? truth : res.grid;
        const hs = hillshade(g);
        for (let i = 0; i < W * H; i++) {
          const v = g[i];
          if (!isFinite(v)) continue;
          const c = RAMP_ELEV((v - tMin) / (tMax - tMin)), s = 0.55 + 0.45 * hs[i];
          img.data.set([c[0] * s, c[1] * s, c[2] * s, 255], i * 4);
        }
        scale.style.setProperty("--iw-grad", gradientCss(RAMP_ELEV));
        label = [fmt(tMin, 0) + " m", "nadmořská výška", fmt(tMax, 0) + " m"];
      }
      offCtx.putImageData(img, 0, 0);
      ctx.fillStyle = cssVar(root, "--iw-nodata");
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, w, h);

      const ink = cssVar(root, "--iw-ink"), surface = cssVar(root, "--iw-surface");
      // Thiessenovy polygony a konvexní obálka (Natural Neighbor)
      if (st.method === "nn" && st.view !== "truth") {
        if (st.voronoi && res.near) {
          ctx.strokeStyle = ink; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
          ctx.beginPath();
          const cw = w / W, ch = h / H;
          for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
            const i = r * W + c;
            if (c < W - 1 && res.near[i] !== res.near[i + 1]) { ctx.moveTo((c + 1) * cw, r * ch); ctx.lineTo((c + 1) * cw, (r + 1) * ch); }
            if (r < H - 1 && res.near[i] !== res.near[i + W]) { ctx.moveTo(c * cw, (r + 1) * ch); ctx.lineTo((c + 1) * cw, (r + 1) * ch); }
          }
          ctx.stroke(); ctx.globalAlpha = 1;
        }
        const poly = hull().poly;
        ctx.setLineDash([6, 4]); ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); poly.forEach((p, i) => (i ? ctx.lineTo(p[0] * geom.sx, p[1] * geom.sy) : ctx.moveTo(p[0] * geom.sx, p[1] * geom.sy)));
        ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      }
      if (st.showPts) {
        st.pts.forEach((p) => {
          ctx.beginPath(); ctx.arc(p.x * geom.sx, p.y * geom.sy, 4, 0, 2 * Math.PI);
          ctx.fillStyle = ink; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = surface; ctx.stroke();
        });
      }
      scale.replaceChildren(el("div", { class: "iw-grad" }), el("div", { class: "iw-scale-lab" }, label.map((t) => el("span", { text: t }))));
      if (st.method === "nn" && st.view !== "truth")
        scale.appendChild(el("div", { class: "iw-sub", text: "Šedá plocha = NoData: Natural Neighbor nepočítá hodnoty mimo konvexní obálku bodů (čárkovaně)." }));
      if (st.method === "krig") drawVario();
    }

    let varioBins = [], varioGeom = null;
    function drawVario() {
      const w = vario.clientWidth;
      if (!w) return;
      const h = 190, M = { l: 64, r: 20, t: 10, b: 30 };
      const ctx = setupCanvas(varioCanvas, w, h);
      const pw = w - M.l - M.r, ph = h - M.t - M.b;
      const pts = st.pts, maxLag = 1000, nb = 20, bw = maxLag / nb;
      const sum = new Float64Array(nb), cnt = new Float64Array(nb);
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d >= maxLag) continue;
        const b = Math.floor(d / bw);
        sum[b] += 0.5 * (pts[i].z - pts[j].z) ** 2; cnt[b]++;
      }
      varioBins = [];
      for (let b = 0; b < nb; b++) if (cnt[b] >= 3) varioBins.push({ h: (b + 0.5) * bw, g: sum[b] / cnt[b], n: cnt[b] });
      const kp = krigParams();
      const yMax = Math.max(kp.sill * 1.3, ...varioBins.map((b) => b.g)) * 1.05;
      const X = (v) => M.l + (v / maxLag) * pw, Y = (v) => M.t + (1 - v / yMax) * ph;
      varioGeom = { X, Y };
      const ink2 = cssVar(root, "--iw-ink2"), muted = cssVar(root, "--iw-muted"), grid = cssVar(root, "--iw-grid");
      ctx.clearRect(0, 0, w, h);
      ctx.font = "11px " + getComputedStyle(root).fontFamily;
      ctx.strokeStyle = grid; ctx.fillStyle = muted; ctx.lineWidth = 1; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      niceTicks(0, yMax, 4).forEach((v) => { const y = Math.round(Y(v)) + 0.5; ctx.beginPath(); ctx.moveTo(M.l, y); ctx.lineTo(w - M.r, y); ctx.stroke(); ctx.fillText(fmt(v, 0), M.l - 6, y); });
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      niceTicks(0, maxLag, 6).forEach((v) => ctx.fillText(fmt(v, 0), X(v), h - M.b + 6));
      ctx.textAlign = "right"; ctx.fillText("vzdálenost h [m]", w - M.r, h - 12);
      ctx.save(); ctx.translate(11, M.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("γ(h) [m²]", 0, 0); ctx.restore();
      // sill a range
      ctx.setLineDash([3, 3]); ctx.strokeStyle = muted;
      ctx.beginPath(); ctx.moveTo(M.l, Y(kp.sill)); ctx.lineTo(w - M.r, Y(kp.sill)); ctx.stroke();
      if (st.range <= maxLag) { ctx.beginPath(); ctx.moveTo(X(st.range), M.t); ctx.lineTo(X(st.range), M.t + ph); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.fillStyle = ink2; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillText("sill", M.l + 4, Y(kp.sill) - 2);
      if (st.range <= maxLag) ctx.fillText("range", X(st.range) + 4, M.t + 12);
      if (kp.nug > 1e-3 * kp.sill) { ctx.textBaseline = "middle"; ctx.fillText("nugget", M.l + 4, Y(kp.nug) - 8); }
      // model
      ctx.strokeStyle = cssVar(root, "--iw-s4"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0));
      for (let i = 1; i <= 200; i++) { const hh = (i / 200) * maxLag; ctx.lineTo(X(hh), Y(kp.gamma(hh))); }
      ctx.stroke();
      // empirické body
      varioBins.forEach((b) => { ctx.beginPath(); ctx.arc(X(b.h), Y(b.g), 4, 0, 2 * Math.PI); ctx.fillStyle = ink2; ctx.fill(); });
    }

    let upd = 0;
    function update() { cancelAnimationFrame(upd); upd = requestAnimationFrame(() => { renderTable(); draw(); }); }

    /* ---------- interakce ---------- */
    const toWorld = (ev) => {
      const r = canvas.getBoundingClientRect();
      const px = ev.clientX - r.left, py = ev.clientY - r.top;
      return { px, py, x: px / geom.sx, y: py / geom.sy };
    };
    canvas.addEventListener("click", (ev) => {
      if (!geom) return;
      const { px, py, x, y } = toWorld(ev);
      const hit = st.pts.findIndex((p) => Math.hypot(p.x * geom.sx - px, p.y * geom.sy - py) < 9);
      if (hit >= 0) { if (st.pts.length > 3) st.pts.splice(hit, 1); else return; }
      else {
        if (x < 0 || y < 0 || x > DX || y > DY) return;
        st.pts.push({ x, y, z: truthFn(x, y) });
      }
      st.version++;
      update();
    });
    canvas.addEventListener("mousemove", (ev) => {
      if (!geom) return;
      const { px, py, x, y } = toWorld(ev);
      const c = Math.floor(x / CELL), r = Math.floor(y / CELL);
      if (c < 0 || r < 0 || c >= W || r >= H) { tip.hidden = true; return; }
      const i = r * W + c, res = computeMethod(st.method), v = res.grid[i];
      const name = METHODS.find((m) => m.id === st.method).name;
      tip.replaceChildren(
        el("div", { class: "iw-tip-h", text: `X ${fmt(c * CELL, 0)} m, Y ${fmt(r * CELL, 0)} m` }),
        el("div", {}, [el("span", { text: "skutečnost" }), el("b", { text: fmt(truth[i], 1) + " m" })]),
        el("div", {}, [el("span", { text: name }), el("b", { text: isFinite(v) ? fmt(v, 1) + " m" : "NoData" })]),
        el("div", {}, [el("span", { text: "chyba" }), el("b", { text: isFinite(v) ? (v - truth[i] > 0 ? "+" : "") + fmt(v - truth[i], 1) + " m" : "–" })])
      );
      tip.hidden = false;
      tip.style.left = (px + 14 + tip.offsetWidth > geom.w ? px - tip.offsetWidth - 14 : px + 14) + "px";
      tip.style.top = Math.min(py + 14, geom.h - tip.offsetHeight - 4) + "px";
    });
    canvas.addEventListener("mouseleave", () => (tip.hidden = true));

    varioCanvas.addEventListener("mousemove", (ev) => {
      if (!varioGeom) return;
      const r = varioCanvas.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top;
      let best = null, bd = 14;
      varioBins.forEach((b) => { const d = Math.hypot(varioGeom.X(b.h) - px, varioGeom.Y(b.g) - py); if (d < bd) { bd = d; best = b; } });
      if (!best) { varioTip.hidden = true; return; }
      varioTip.replaceChildren(
        el("div", { class: "iw-tip-h", text: `h ≈ ${fmt(best.h, 0)} m` }),
        el("div", {}, [el("span", { text: "γ empirické" }), el("b", { text: fmt(best.g, 0) + " m²" })]),
        el("div", {}, [el("span", { text: "γ model" }), el("b", { text: fmt(krigParams().gamma(best.h), 0) + " m²" })]),
        el("div", {}, [el("span", { text: "počet dvojic" }), el("b", { text: String(best.n) })])
      );
      varioTip.hidden = false;
      const X = varioGeom.X(best.h);
      varioTip.style.left = (X + 14 + varioTip.offsetWidth > r.width ? X - varioTip.offsetWidth - 14 : X + 14) + "px";
      varioTip.style.top = "6px";
    });
    varioCanvas.addEventListener("mouseleave", () => (varioTip.hidden = true));

    renderTable();
    onRedraw(root, () => { renderTable(); draw(); })();
  }

  /* ================================================================
   * Inicializace (funguje i s navigation.instant)
   * ================================================================ */

  function init() {
    document.querySelectorAll(".iw[data-iw]").forEach((root) => {
      if (root.dataset.iwReady) return;
      root.dataset.iwReady = "1";
      try {
        if (root.dataset.iw === "profil") initProfile(root);
        else if (root.dataset.iw === "mapa") initMap(root);
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

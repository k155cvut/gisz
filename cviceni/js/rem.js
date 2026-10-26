/*
 * Interaktivní ukázka relativního výškového modelu (REM) pro MkDocs Material. Bez externích závislostí.
 * Styly v rem.css (třídy .rem-*), základ sdílí s interpolace.css (třídy .iw-*).
 *
 * Použití v Markdownu:
 *   <div class="iw" data-rem></div>  – relativní výškový model krok za krokem
 */
(function () {
  "use strict";

  /* ================================================================
   * Pomocné funkce
   * ================================================================ */

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
  const cssVar = (node, name) => getComputedStyle(node).getPropertyValue(name).trim();

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
  const RAMP_ELEV = rampFrom(["#3f7f55", "#7fae66", "#cfd08a", "#e2bd7c", "#b98552", "#8a5a3a"]);
  const RAMP_REM = rampFrom(["#0d366b", "#1c5cab", "#3987e5", "#86b6ef", "#cde2fb", "#f4f2ec"]);
  const rgb = (c) => `rgb(${c.map(Math.round)})`;
  function gradientCss(ramp) {
    const s = [];
    for (let i = 0; i <= 10; i++) s.push(`${rgb(ramp(i / 10))} ${i * 10}%`);
    return `linear-gradient(to right, ${s.join(",")})`;
  }

  function segmented(options, value, onChange) {
    const g = el("div", { class: "iw-seg", role: "group" });
    const btns = options.map(([v, t]) => {
      const b = el("button", { type: "button", class: "iw-btn", "aria-pressed": String(v === value), text: t });
      b.addEventListener("click", () => { btns.forEach((x) => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); onChange(v); });
      g.appendChild(b);
      return b;
    });
    return g;
  }
  function slider(label, min, max, step, value, unit, onInput) {
    const out = el("output", { class: "iw-val" });
    const show = (v) => (out.textContent = fmt(v, step < 1 ? 1 : 0) + (unit || ""));
    const inp = el("input", { type: "range", min, max, step, value });
    inp.addEventListener("input", () => { show(+inp.value); onInput(+inp.value); });
    show(value);
    return el("label", { class: "iw-ctrl" }, [el("span", { class: "iw-lab" }, [label, out]), inp]);
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
  function placeTip(tip, x, y, w, h) {
    tip.style.left = (x + 14 + tip.offsetWidth > w ? x - tip.offsetWidth - 14 : x + 14) + "px";
    tip.style.top = Math.max(0, Math.min(y + 14, h - tip.offsetHeight - 4)) + "px";
  }
  function tipRow(label, value) {
    return el("div", {}, [el("span", { text: label }), el("b", { text: value })]);
  }

  /* ================================================================
   * Relativní výškový model krok za krokem
   * ================================================================ */

  function initREM(root) {
    const W = 160, H = 100, CELL = 5; // 800 × 500 m, buňka 5 m
    const DX = W * CELL, DY = H * CELL;
    const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

    // osa řeky (meandry) a staré koryto
    const riverY = (x) => 250 + 60 * Math.sin((2 * Math.PI * x) / 520 + 0.4) + 13 * Math.sin((2 * Math.PI * x) / 190);
    const paleoY = (x) => 250 - 45 * Math.sin((2 * Math.PI * x) / 610 + 1.3);
    function polyline(fn) { const p = []; for (let x = -150; x <= DX + 150; x += 2) p.push([x, fn(x)]); return p; }
    const river = polyline(riverY), paleo = polyline(paleoY);
    function distTo(line, x, y) {
      let best = Infinity;
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, ay] = line[i], [bx, by] = line[i + 1];
        if (Math.abs(ax - x) > 160) continue;
        const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
        best = Math.min(best, Math.hypot(x - ax - t * vx, y - ay - t * vy));
      }
      return best;
    }
    const OX = { cx: 655, cy: 140, r: 40, w: 8 }; // slepé rameno (odškrcený meandr)

    const floor = (x) => 268 - 0.012 * x; // spád údolí ~10 m na 800 m – víc než výška tvarů v nivě (1–2 m)
    const dmr = new Float64Array(W * H), water = new Float64Array(W * H), isWater = new Uint8Array(W * H);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const x = (c + 0.5) * CELL, y = (r + 0.5) * CELL, i = r * W + c;
      const base = floor(x);
      const dr = distTo(river, x, y), dp = distTo(paleo, x, y);
      let z = base;
      // svahy údolí mimo nivu
      z += 22 * smooth(40, 95, y < 250 ? 250 - y - 115 : y - 250 - 125 + 20 * Math.sin(x / 90));
      z += 0.9 * Math.sin(x / 37 + y / 53) * Math.cos(y / 41);                       // drobná nerovnost nivy
      z += 1.0 * Math.exp(-Math.pow((dr - 16) / 7, 2));                              // přírodní hráze (valy) podél koryta
      z -= 1.1 * Math.exp(-Math.pow(dp / 9, 2));                                      // staré (opuštěné) koryto
      const dOx = Math.abs(Math.hypot(x - OX.cx, y - OX.cy) - OX.r);
      const ang = Math.atan2(y - OX.cy, x - OX.cx);
      if (ang < -2.0 || ang > -1.4) z -= 1.6 * Math.exp(-Math.pow(dOx / OX.w, 2));    // slepé rameno
      if (dr < 9) { z = base - 1.2; isWater[i] = 1; }                                  // hladina v korytě
      dmr[i] = z;
    }
    let dMin = Infinity, dMax = -Infinity;
    dmr.forEach((v) => { dMin = Math.min(dMin, v); dMax = Math.max(dMax, v); });

    const st = { step: "dmr", spacing: 25, stretch: 3, riverStretch: false, section: 360, hover: null };
    let pts = [], rem = new Float64Array(W * H);

    function compute() {
      // body podél středové čáry (Generate Points Along Lines) s výškou z DMR (Extract Values to Points)
      pts = [];
      let acc = 0, last = river[0];
      for (let i = 1; i < river.length; i++) {
        const p = river[i];
        acc += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p;
        if (acc >= st.spacing) {
          acc = 0;
          if (p[0] >= 0 && p[0] < DX) {
            const c = Math.floor(p[0] / CELL), r = Math.min(H - 1, Math.max(0, Math.floor(p[1] / CELL)));
            pts.push({ x: p[0], y: p[1], z: dmr[r * W + c], inside: true });
          } else pts.push({ x: p[0], y: p[1], z: floor(p[0]) - 1.2 }); // řeka pokračuje i mimo výřez mapy
        }
      }
      // IDW (Power 2, 12 nejbližších bodů) na celý rozsah DMR
      const K = Math.min(12, pts.length), bd = new Float64Array(K), bz = new Float64Array(K);
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const x = (c + 0.5) * CELL, y = (r + 0.5) * CELL;
        bd.fill(Infinity);
        for (const p of pts) {
          const d2 = (p.x - x) ** 2 + (p.y - y) ** 2;
          if (d2 < bd[K - 1]) { let j = K - 1; while (j > 0 && bd[j - 1] > d2) { bd[j] = bd[j - 1]; bz[j] = bz[j - 1]; j--; } bd[j] = d2; bz[j] = p.z; }
        }
        let sw = 0, sz = 0;
        for (let j = 0; j < K; j++) { const w = 1 / Math.max(bd[j], 1e-6); sw += w; sz += w * bz[j]; }
        water[r * W + c] = sz / sw;
      }
      for (let i = 0; i < W * H; i++) rem[i] = dmr[i] - water[i]; // mapová algebra: "DMR" - "IDW_hladina"
    }

    root.innerHTML = "";
    const canvas = el("canvas", { class: "iw-canvas iw-map", role: "img", "aria-label": "Mapa kroků výpočtu relativního výškového modelu" });
    const tip = el("div", { class: "iw-tip", hidden: "" });
    const plot = el("div", { class: "iw-plot" }, [canvas, tip]);
    const scale = el("div", { class: "iw-scale" });
    const stepText = el("div", { class: "rem-steptext" });
    const prof = el("canvas", { class: "iw-canvas" });
    const profTip = el("div", { class: "iw-tip", hidden: "" });
    const extra = el("div", { class: "iw-ctrls rem-extra" });

    const STEPS = [
      ["dmr", "1 · DMR"],
      ["body", "2 · Body na hladině"],
      ["hladina", "3 · Interpolovaná hladina"],
      ["rem", "4 · REM = DMR − hladina"],
    ];
    const TEXT = {
      dmr: "DMR zobrazený přes celý rozsah výšek. Barvy vystihují hlavně svahy a spád údolí, tvary v nivě jsou jen málo zřetelné.",
      body: "Podél středové čáry řeky vygenerujeme body (Generate Points Along Lines) a přiřadíme jim výšku hladiny z DMR (Extract Values to Points).",
      hladina: "Z bodů interpolujeme metodou IDW plochu hladiny na celý rozsah DMR. Vystihuje jen spád údolí, žádné tvary nivy.",
      rem: "Rastrová kalkulačka: \"DMR\" − \"IDW_hladina\". Spád údolí zmizel a vynikly tvary nivy: staré koryto, slepé rameno i valy podél řeky.",
    };

    root.append(
      el("div", { class: "iw-head" }, [
        el("strong", { text: "Relativní výškový model krok za krokem" }),
        el("span", { class: "iw-hint", text: "Kliknutím do mapy přesunete příčný profil." }),
      ]),
      el("div", { class: "iw-row" }, [segmented(STEPS, st.step, (v) => { st.step = v; buildExtra(); draw(); })]),
      stepText, plot, scale, extra,
      el("div", { class: "iw-sub", text: "Příčný profil údolím (svislá čára v mapě): DMR, interpolovaná hladina a jejich rozdíl – REM." }),
      el("div", { class: "iw-plot" }, [prof, profTip])
    );

    function buildExtra() {
      extra.replaceChildren();
      if (st.step === "dmr") {
        const cb = el("input", { type: "checkbox" });
        cb.checked = st.riverStretch;
        cb.addEventListener("change", () => { st.riverStretch = cb.checked; draw(); });
        extra.append(el("div", { class: "iw-ctrl iw-ctrl-btn" }, [el("label", { class: "iw-check" }, [cb, el("span", { text: "Symbologie jen na rozsah výšek řeky (krok 11 postupu)" })])]));
      }
      if (st.step === "body" || st.step === "hladina" || st.step === "rem")
        extra.append(slider("Vzdálenost bodů na řece", 10, 150, 5, st.spacing, " m", (v) => { st.spacing = v; compute(); draw(); }));
      if (st.step === "rem")
        extra.append(slider("Horní mez stretche REM", 1, 20, 0.5, st.stretch, " m", (v) => { st.stretch = v; draw(); }));
    }

    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const offCtx = off.getContext("2d");
    let geom = null;

    function riverRange() {
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i < W * H; i++) if (isWater[i]) { lo = Math.min(lo, dmr[i]); hi = Math.max(hi, dmr[i]); }
      return [lo - 1, hi + 3];
    }

    function draw() {
      const w = plot.clientWidth;
      if (!w) return;
      const h = w * (H / W);
      const ctx = setupCanvas(canvas, w, h);
      geom = { w, h, sx: w / DX, sy: h / DY };
      stepText.textContent = TEXT[st.step];
      const img = offCtx.createImageData(W, H);
      let ramp, lo, hi, label;
      if (st.step === "rem") {
        ramp = RAMP_REM; lo = 0; hi = st.stretch;
        label = ["0 m (úroveň hladiny)", "výška nad hladinou řeky", fmt(hi, 1) + " m a více"];
      } else if (st.step === "hladina") {
        ramp = RAMP_ELEV; lo = dMin; hi = dMax;
        label = [fmt(lo, 0) + " m", "výška hladiny (stejná stupnice jako DMR)", fmt(hi, 0) + " m"];
      } else {
        ramp = RAMP_ELEV;
        [lo, hi] = st.step === "dmr" && st.riverStretch ? riverRange() : [dMin, dMax];
        label = [fmt(lo, 0) + " m", "nadmořská výška", fmt(hi, 0) + " m"];
      }
      const g = st.step === "hladina" ? water : st.step === "rem" ? rem : dmr;
      for (let i = 0; i < W * H; i++) {
        const col = ramp((g[i] - lo) / (hi - lo));
        img.data.set([col[0], col[1], col[2], 255], i * 4);
      }
      offCtx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, w, h);

      const ink = cssVar(root, "--iw-ink"), surface = cssVar(root, "--iw-surface");
      if (st.step === "body" || st.step === "hladina") {
        ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); river.forEach((p, i) => (i ? ctx.lineTo(p[0] * geom.sx, p[1] * geom.sy) : ctx.moveTo(p[0] * geom.sx, p[1] * geom.sy))); ctx.stroke();
        ctx.setLineDash([]);
        pts.filter((p) => p.inside).forEach((p) => { ctx.beginPath(); ctx.arc(p.x * geom.sx, p.y * geom.sy, 4, 0, 2 * Math.PI); ctx.fillStyle = ink; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = surface; ctx.stroke(); });
      }
      // příčný profil
      const sx = st.section * geom.sx;
      ctx.strokeStyle = surface; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
      scale.style.setProperty("--iw-grad", gradientCss(ramp));
      scale.replaceChildren(el("div", { class: "iw-grad" }), el("div", { class: "iw-scale-lab" }, label.map((t) => el("span", { text: t }))));
      drawProfile();
    }

    let profGeom = null;
    function drawProfile() {
      const w = plot.clientWidth;
      if (!w) return;
      const h = 220, M = { l: 50, r: 20, t: 30, b: 30 };
      const ctx = setupCanvas(prof, w, h);
      const pw = w - M.l - M.r, ph = h - M.t - M.b;
      const c = Math.min(W - 1, Math.floor(st.section / CELL));
      const zs = [], ws = [];
      for (let r = 0; r < H; r++) { zs.push(dmr[r * W + c]); ws.push(water[r * W + c]); }
      const lo = Math.min(...ws) - 3, hi = Math.min(Math.max(...zs), Math.min(...ws) + 14) + 1;
      const X = (r) => M.l + ((r + 0.5) / H) * pw, Y = (v) => M.t + (1 - (v - lo) / (hi - lo)) * ph;
      profGeom = { X, Y, zs, ws, M, pw, w, h };
      const ink2 = cssVar(root, "--iw-ink2"), muted = cssVar(root, "--iw-muted"), grid = cssVar(root, "--iw-grid");
      const cDMR = cssVar(root, "--iw-s2"), cWat = cssVar(root, "--iw-s1");
      ctx.clearRect(0, 0, w, h);
      ctx.font = "11px " + getComputedStyle(root).fontFamily;
      ctx.strokeStyle = grid; ctx.fillStyle = muted; ctx.lineWidth = 1; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      niceTicks(lo, hi, 5).forEach((v) => { const y = Math.round(Y(v)) + 0.5; ctx.beginPath(); ctx.moveTo(M.l, y); ctx.lineTo(w - M.r, y); ctx.stroke(); ctx.fillText(fmt(v, 0), M.l - 6, y); });
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      niceTicks(0, DY, 5).forEach((v) => ctx.fillText(fmt(v, 0), M.l + (v / DY) * pw, h - M.b + 6));
      ctx.textAlign = "right"; ctx.fillText("vzdálenost napříč údolím [m]", w - M.r, h - 12);
      ctx.save(); ctx.translate(11, M.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("výška [m n. m.]", 0, 0); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(M.l, M.t, pw, ph); ctx.clip();
      // REM jako výplň mezi hladinou a terénem
      ctx.beginPath();
      zs.forEach((z, r) => (r ? ctx.lineTo(X(r), Y(z)) : ctx.moveTo(X(r), Y(z))));
      for (let r = H - 1; r >= 0; r--) ctx.lineTo(X(r), Y(ws[r]));
      ctx.closePath(); ctx.globalAlpha = 0.15; ctx.fillStyle = cWat; ctx.fill(); ctx.globalAlpha = 1;
      const line = (arr, col, dash) => { ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); arr.forEach((v, r) => (r ? ctx.lineTo(X(r), Y(v)) : ctx.moveTo(X(r), Y(v)))); ctx.stroke(); ctx.setLineDash([]); };
      line(ws, cWat, [6, 4]);
      line(zs, cDMR);
      ctx.restore();
      // legenda
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      const leg = [["DMR (terén)", cDMR, false], ["interpolovaná hladina", cWat, true]];
      let lx = M.l;
      leg.forEach(([t, col, dash]) => {
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash ? [6, 4] : []);
        ctx.beginPath(); ctx.moveTo(lx, 10); ctx.lineTo(lx + 18, 10); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = ink2; ctx.fillText(t, lx + 24, 10);
        lx += 24 + ctx.measureText(t).width + 18;
      });
      ctx.fillStyle = cWat; ctx.globalAlpha = 0.25; ctx.fillRect(lx, 5, 18, 10); ctx.globalAlpha = 1;
      ctx.fillStyle = ink2; ctx.fillText("REM = rozdíl", lx + 24, 10);
    }

    canvas.addEventListener("click", (ev) => {
      if (!geom) return;
      const r = canvas.getBoundingClientRect();
      st.section = Math.max(0, Math.min(DX - 1, (ev.clientX - r.left) / geom.sx));
      draw();
    });
    canvas.addEventListener("mousemove", (ev) => {
      if (!geom) return;
      const b = canvas.getBoundingClientRect(), px = ev.clientX - b.left, py = ev.clientY - b.top;
      const c = Math.floor(px / geom.sx / CELL), r = Math.floor(py / geom.sy / CELL);
      if (c < 0 || r < 0 || c >= W || r >= H) { tip.hidden = true; return; }
      const i = r * W + c;
      tip.replaceChildren(
        el("div", { class: "iw-tip-h", text: `X ${fmt(c * CELL, 0)} m, Y ${fmt(r * CELL, 0)} m` }),
        tipRow("DMR", fmt(dmr[i], 2) + " m"),
        tipRow("hladina (IDW)", fmt(water[i], 2) + " m"),
        tipRow("REM", fmt(rem[i], 2) + " m")
      );
      tip.hidden = false;
      placeTip(tip, px, py, geom.w, geom.h);
    });
    canvas.addEventListener("mouseleave", () => (tip.hidden = true));
    prof.addEventListener("mousemove", (ev) => {
      if (!profGeom) return;
      const b = prof.getBoundingClientRect(), px = ev.clientX - b.left;
      const r = Math.round(((px - profGeom.M.l) / profGeom.pw) * H - 0.5);
      if (r < 0 || r >= H) { profTip.hidden = true; return; }
      profTip.replaceChildren(
        el("div", { class: "iw-tip-h", text: `${fmt(r * CELL, 0)} m` }),
        tipRow("DMR", fmt(profGeom.zs[r], 2) + " m"),
        tipRow("hladina", fmt(profGeom.ws[r], 2) + " m"),
        tipRow("REM", fmt(profGeom.zs[r] - profGeom.ws[r], 2) + " m")
      );
      profTip.hidden = false;
      placeTip(profTip, profGeom.X(r), 20, profGeom.w, profGeom.h);
    });
    prof.addEventListener("mouseleave", () => (profTip.hidden = true));

    compute();
    buildExtra();
    onRedraw(root, draw)();
  }

  /* ================================================================
   * Inicializace
   * ================================================================ */

  function init() {
    document.querySelectorAll(".iw[data-rem]").forEach((root) => {
      if (root.dataset.remReady) return;
      root.dataset.remReady = "1";
      try {
        initREM(root);
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

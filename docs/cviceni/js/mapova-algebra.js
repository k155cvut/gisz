/*
 * Interaktivní ukázky mapové algebry pro MkDocs Material. Bez externích závislostí.
 * Styly sdílí s interpolace.css (třídy .iw-*).
 *
 * Použití v Markdownu:
 *   <div class="iw" data-ma="kalkulacka"></div>  – rastrová kalkulačka na malých rastrech
 *   <div class="iw" data-ma="rem"></div>         – relativní výškový model krok za krokem
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
  const isDark = () => document.body.getAttribute("data-md-color-scheme") === "slate";

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
  const RAMP_SLOPE = rampFrom(["#fbe3d6", "#f4b393", "#eb6834", "#b8461b", "#7a2b0c"]);
  const RAMP_BLUE = rampFrom(["#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#0d366b"]);
  const RAMP_REM = rampFrom(["#0d366b", "#1c5cab", "#3987e5", "#86b6ef", "#cde2fb", "#f4f2ec"]);
  const rgb = (c) => `rgb(${c.map(Math.round)})`;
  const lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
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
   * Parser výrazů mapové algebry (syntaxe Raster Calculatoru v ArcGIS Pro,
   * včetně priorit operátorů z Pythonu: & a | se vyhodnocují PŘED porovnáním)
   * ================================================================ */

  class MAError extends Error {}

  function tokenize(src) {
    const t = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '"' || ch === "'") {
        const j = src.indexOf(ch, i + 1);
        if (j < 0) throw new MAError("Chybí uzavírací uvozovky u názvu rastru.");
        t.push({ k: "ras", v: src.slice(i + 1, j) }); i = j + 1; continue;
      }
      const num = /^\d+(\.\d+)?|^\.\d+/.exec(src.slice(i));
      if (num) { t.push({ k: "num", v: parseFloat(num[0]) }); i += num[0].length; continue; }
      const id = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
      if (id) { t.push({ k: "id", v: id[0] }); i += id[0].length; continue; }
      const op = /^(==|!=|>=|<=|\*\*|[+\-*/<>&|~(),])/.exec(src.slice(i));
      if (op) { t.push({ k: "op", v: op[0] }); i += op[0].length; continue; }
      if (ch === "=") throw new MAError("Pro porovnání se v Raster Calculatoru píše == (dvě rovnítka).");
      throw new MAError(`Neznámý znak „${ch}“.`);
    }
    return t;
  }

  const FUNCS = {
    Con: { min: 2, max: 3 },
    SetNull: { min: 2, max: 3 },
    IsNull: { min: 1, max: 1 },
    Abs: { min: 1, max: 1 },
    Sqrt: { min: 1, max: 1 },
    Power: { min: 2, max: 2 },
    Int: { min: 1, max: 1 },
  };

  function parse(src, rasterNames) {
    const tk = tokenize(src);
    let p = 0;
    const peek = () => tk[p];
    const isOp = (v) => tk[p] && tk[p].k === "op" && tk[p].v === v;
    const expect = (v) => { if (!isOp(v)) throw new MAError(`Očekávám „${v}“.`); p++; };

    const CMP = ["==", "!=", ">", "<", ">=", "<="];
    function comparison() {
      const left = bitor();
      if (tk[p] && tk[p].k === "op" && CMP.includes(tk[p].v)) {
        const op = tk[p++].v;
        const right = bitor();
        if (tk[p] && tk[p].k === "op" && CMP.includes(tk[p].v))
          throw new MAError('Porovnání nejdou řetězit. Operátory & a | mají přednost před porovnáním, proto každou podmínku obalte závorkami: ("vyska" > 500) & ("sklon" < 10).');
        return { t: "bin", op, a: left, b: right };
      }
      return left;
    }
    function bitor() { let n = bitand(); while (isOp("|")) { p++; n = { t: "bin", op: "|", a: n, b: bitand() }; } return n; }
    function bitand() { let n = additive(); while (isOp("&")) { p++; n = { t: "bin", op: "&", a: n, b: additive() }; } return n; }
    function additive() { let n = mult(); while (isOp("+") || isOp("-")) { const op = tk[p++].v; n = { t: "bin", op, a: n, b: mult() }; } return n; }
    function mult() { let n = unary(); while (isOp("*") || isOp("/")) { const op = tk[p++].v; n = { t: "bin", op, a: n, b: unary() }; } return n; }
    function unary() {
      if (isOp("-")) { p++; return { t: "neg", a: unary() }; }
      if (isOp("+")) { p++; return unary(); }
      if (isOp("~")) { p++; return { t: "not", a: unary() }; }
      return power();
    }
    function power() { const b = primary(); if (isOp("**")) { p++; return { t: "bin", op: "**", a: b, b: unary() }; } return b; }
    function primary() {
      const x = peek();
      if (!x) throw new MAError("Výraz je neúplný.");
      if (x.k === "num") { p++; return { t: "num", v: x.v }; }
      if (x.k === "ras") {
        p++;
        if (!rasterNames.includes(x.v)) throw new MAError(`Rastr „${x.v}“ neexistuje. K dispozici: ${rasterNames.map((n) => `"${n}"`).join(", ")}.`);
        return { t: "ras", v: x.v };
      }
      if (x.k === "id") {
        p++;
        if (rasterNames.includes(x.v)) throw new MAError(`Název rastru se v Raster Calculatoru píše v uvozovkách: "${x.v}".`);
        const fname = Object.keys(FUNCS).find((f) => f.toLowerCase() === x.v.toLowerCase());
        if (!fname) throw new MAError(`Neznámá funkce „${x.v}“. Podporované: ${Object.keys(FUNCS).join(", ")}.`);
        if (fname !== x.v) throw new MAError(`Názvy funkcí rozlišují velikost písmen: ${fname}(…), ne ${x.v}(…).`);
        expect("(");
        const args = [];
        if (!isOp(")")) { args.push(comparison()); while (isOp(",")) { p++; args.push(comparison()); } }
        expect(")");
        const f = FUNCS[fname];
        if (args.length < f.min || args.length > f.max) throw new MAError(`Funkce ${fname} potřebuje ${f.min === f.max ? f.min : f.min + "–" + f.max} parametr(y).`);
        return { t: "fn", f: fname, args };
      }
      if (x.v === "(") { p++; const n = comparison(); expect(")"); return n; }
      throw new MAError(`Nečekaný symbol „${x.v}“.`);
    }
    if (!tk.length) throw new MAError("Zadejte výraz.");
    const tree = comparison();
    if (p < tk.length) throw new MAError(`Nečekaný symbol „${tk[p].v}“ – nechybí operátor nebo závorka?`);
    return tree;
  }

  /* Vyhodnocení pro jednu buňku; NaN = NoData. */
  function evalNode(n, get) {
    switch (n.t) {
      case "num": return n.v;
      case "ras": return get(n.v);
      case "neg": return -evalNode(n.a, get);
      case "not": { const a = evalNode(n.a, get); return isNaN(a) ? NaN : a === 0 ? 1 : 0; }
      case "bin": {
        const a = evalNode(n.a, get), b = evalNode(n.b, get);
        if (isNaN(a) || isNaN(b)) return NaN;
        switch (n.op) {
          case "+": return a + b; case "-": return a - b; case "*": return a * b;
          case "/": return b === 0 ? NaN : a / b; case "**": return Math.pow(a, b);
          case "==": return +(a === b); case "!=": return +(a !== b);
          case ">": return +(a > b); case "<": return +(a < b); case ">=": return +(a >= b); case "<=": return +(a <= b);
          case "&": return +(a !== 0 && b !== 0); case "|": return +(a !== 0 || b !== 0);
        }
        return NaN;
      }
      case "fn": {
        const A = n.args;
        if (n.f === "IsNull") return isNaN(evalNode(A[0], get)) ? 1 : 0;
        if (n.f === "Con" || n.f === "SetNull") {
          const c = evalNode(A[0], get);
          if (isNaN(c)) return NaN;
          if (n.f === "Con") return c !== 0 ? evalNode(A[1], get) : A[2] ? evalNode(A[2], get) : NaN;
          return c !== 0 ? NaN : evalNode(A[1], get);
        }
        const a = evalNode(A[0], get);
        if (n.f === "Abs") return Math.abs(a);
        if (n.f === "Sqrt") return a < 0 ? NaN : Math.sqrt(a);
        if (n.f === "Int") return Math.trunc(a);
        if (n.f === "Power") return Math.pow(a, evalNode(A[1], get));
      }
    }
    return NaN;
  }

  /* ================================================================
   * Widget 1: rastrová kalkulačka
   * ================================================================ */

  function initCalculator(root) {
    const N = 10, CELL = 100; // 10 × 10 buněk po 100 m (1 buňka = 1 ha)
    // malý syntetický terén: hřbet na severozápadě, údolí na jihovýchodě
    const z = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const u = c / (N - 1), v = r / (N - 1);
      z.push(Math.round(440 + 130 * Math.exp(-((u - 0.3) ** 2 + (v - 0.3) ** 2) / 0.08) + 50 * (1 - v) - 35 * Math.exp(-((u - 0.8) ** 2) / 0.03) + 20 * u));
    }
    const slope = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const at = (rr, cc) => z[Math.min(N - 1, Math.max(0, rr)) * N + Math.min(N - 1, Math.max(0, cc))];
      const dx = (at(r, c + 1) - at(r, c - 1)) / (2 * CELL * (c > 0 && c < N - 1 ? 1 : 0.5));
      const dy = (at(r + 1, c) - at(r - 1, c)) / (2 * CELL * (r > 0 && r < N - 1 ? 1 : 0.5));
      slope.push(Math.round((Math.atan(Math.hypot(dx, dy)) * 180) / Math.PI));
    }
    // land cover: 1 = les, 0 = bez lesa, NaN = NoData (nezmapováno)
    const les = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const forest = slope[r * N + c] >= 12 || (r > 6 && c < 3);
      les.push(r < 2 && c > 6 ? NaN : forest ? 1 : 0);
    }
    const R = { vyska: z, sklon: slope, les };
    const names = Object.keys(R);
    const DESC = {
      vyska: { t: "nadmořská výška [m]", ramp: RAMP_ELEV },
      sklon: { t: "sklon [°]", ramp: RAMP_SLOPE },
      les: { t: "les (1 = les, 0 = bez lesa)", cat: true },
    };

    const PRESETS = [
      ['"vyska" - 450', "Aritmetika: výška nad 450 m"],
      ['"vyska" > 500', "Porovnání vrací 1 (pravda) nebo 0 (nepravda)"],
      ['("vyska" > 500) & ("vyska" < 580)', "Logické A – obě podmínky musí platit (podobně jako úloha 1)"],
      ['"vyska" > 500 & "sklon" < 10', "Častá chyba – chybějící závorky"],
      ['Con("sklon" > 15, 2, 1)', "Con: když platí podmínka, 2, jinak 1"],
      ['SetNull("les" == 0, "vyska")', "SetNull: kde platí podmínka, vznikne NoData"],
      ['"les" * "vyska"', "NoData na vstupu → NoData ve výsledku"],
      ['IsNull("les")', "IsNull: 1 tam, kde je NoData"],
    ];
    const st = { expr: PRESETS[2][0], result: null, error: null, hover: -1 };

    root.innerHTML = "";
    const input = el("input", { type: "text", class: "ma-input", spellcheck: "false", autocomplete: "off", "aria-label": "Výraz mapové algebry" });
    input.value = st.expr;
    const errBox = el("div", { class: "ma-error", role: "alert", hidden: "" });
    const grids = el("div", { class: "ma-grids" });
    const summary = el("div", { class: "ma-summary" });
    const tip = el("div", { class: "iw-tip", hidden: "" });
    const presets = el("div", { class: "ma-presets" }, PRESETS.map(([e, d]) => {
      const b = el("button", { type: "button", class: "iw-btn ma-preset", title: d }, [el("code", { text: e })]);
      b.addEventListener("click", () => { input.value = e; run(); });
      return b;
    }));
    const presetDesc = el("div", { class: "iw-sub ma-desc" });

    root.append(
      el("div", { class: "iw-head" }, [
        el("strong", { text: "Rastrová kalkulačka" }),
        el("span", { class: "iw-hint", text: "Rastry 10 × 10 buněk, velikost buňky 100 m. Najetím na buňku uvidíte, z jakých hodnot se počítá." }),
      ]),
      el("div", { class: "ma-exprrow" }, [el("span", { class: "ma-prompt", text: "Výraz" }), input, el("button", { type: "button", class: "iw-btn", "aria-pressed": "true", text: "Spustit", onclick: () => run() })]),
      errBox,
      el("div", { class: "iw-sub", text: "Vyzkoušejte příklady:" }),
      presets, presetDesc,
      el("div", { class: "iw-plot" }, [grids, tip]),
      summary,
      el("div", { class: "iw-sub", text: `Funkce: ${Object.keys(FUNCS).join(", ")} · Operátory: + − * / ** · == != > < >= <= · & (a zároveň) | (nebo) ~ (negace)` })
    );
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
    let debounce = 0;
    input.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(run, 500); });

    function run() {
      st.expr = input.value;
      const pr = PRESETS.find((x) => x[0] === st.expr.trim());
      presetDesc.textContent = pr ? pr[1] : "";
      presets.querySelectorAll(".ma-preset").forEach((b, i) => b.setAttribute("aria-pressed", String(PRESETS[i][0] === st.expr.trim())));
      try {
        const tree = parse(st.expr, names);
        const out = [];
        for (let i = 0; i < N * N; i++) out.push(evalNode(tree, (n) => R[n][i]));
        st.result = out; st.error = null; st.used = names.filter((n) => st.expr.includes(`"${n}"`) || st.expr.includes(`'${n}'`));
      } catch (e) {
        if (!(e instanceof MAError)) throw e;
        st.error = e.message; st.result = null;
      }
      render();
    }

    function gridEl(title, sub, values, colorFn, digits, highlight) {
      const g = el("div", { class: "ma-grid", role: "table", "aria-label": title });
      values.forEach((v, i) => {
        const c = el("div", { class: "ma-cell" + (isNaN(v) ? " ma-nodata" : "") + (i === st.hover ? " ma-hover" : ""), "data-i": String(i) });
        if (!isNaN(v)) {
          const col = colorFn(v);
          c.style.background = rgb(col);
          c.style.color = lum(col) > 0.55 ? "#1a1a19" : "#ffffff";
          c.textContent = fmt(v, digits(v));
        } else c.textContent = "–";
        g.appendChild(c);
      });
      return el("figure", { class: "ma-fig" + (highlight ? " ma-out" : "") }, [el("figcaption", {}, [el("code", { text: title }), el("span", { text: sub })]), g]);
    }

    function colorFor(name) {
      const d = DESC[name], v = R[name].filter((x) => !isNaN(x));
      const lo = Math.min(...v), hi = Math.max(...v);
      if (d.cat) return (x) => (x === 1 ? hex2rgb("#3f7f55") : hex2rgb("#e8e2d0"));
      return (x) => d.ramp((x - lo) / (hi - lo || 1));
    }

    function render() {
      errBox.hidden = !st.error;
      errBox.textContent = st.error || "";
      input.classList.toggle("ma-bad", !!st.error);
      const figs = names.map((n) => {
        const f = gridEl(`"${n}"`, DESC[n].t, R[n], colorFor(n), () => 0, false);
        if (st.result && !st.used.includes(n)) f.classList.add("ma-unused");
        return f;
      });
      grids.replaceChildren(el("div", { class: "ma-inputs" }, figs));
      if (st.result) {
        const v = st.result.filter((x) => !isNaN(x));
        const lo = Math.min(...v), hi = Math.max(...v);
        const integer = v.every((x) => Number.isInteger(x));
        const color = (x) => RAMP_BLUE(v.length ? (x - lo) / (hi - lo || 1) : 0);
        grids.appendChild(el("div", { class: "ma-arrow", "aria-hidden": "true", text: "↓" }));
        grids.appendChild(gridEl("výsledek", "", st.result, color, (x) => (integer ? 0 : Math.abs(x) < 10 ? 2 : 1), true));
        renderSummary(v, integer);
      } else summary.replaceChildren();
    }

    function renderSummary(v, integer) {
      const nod = N * N - v.length, cellHa = (CELL * CELL) / 10000;
      const uniq = [...new Set(v)].sort((a, b) => a - b);
      const rows = [];
      if (integer && uniq.length <= 6) {
        rows.push(el("div", { class: "iw-sub", text: "Počet buněk a plocha pro každou hodnotu výsledku (buňka = 100 × 100 m = 1 ha):" }));
        const t = el("table", {}, [
          el("thead", {}, [el("tr", {}, ["Hodnota", "Počet buněk", "Plocha"].map((x) => el("th", { text: x })))]),
          el("tbody", {}, uniq.map((u) => {
            const n = v.filter((x) => x === u).length;
            return el("tr", {}, [el("td", { class: "iw-num", text: fmt(u, 0) }), el("td", { class: "iw-num", text: String(n) }), el("td", { class: "iw-num", text: fmt(n * cellHa, cellHa >= 1 ? 0 : 2) + " ha" })]);
          }).concat(nod ? [el("tr", {}, [el("td", { class: "iw-num", text: "NoData" }), el("td", { class: "iw-num", text: String(nod) }), el("td", { class: "iw-num", text: "–" })])] : [])),
        ]);
        rows.push(el("div", { class: "iw-table" }, [t]));
      } else {
        const mean = v.reduce((a, b) => a + b, 0) / (v.length || 1);
        rows.push(el("div", { class: "iw-sub", text: `Minimum ${fmt(Math.min(...v), 1)}, maximum ${fmt(Math.max(...v), 1)}, průměr ${fmt(mean, 1)}` + (nod ? `, NoData: ${nod} buněk` : "") + "." }));
      }
      summary.replaceChildren(...rows);
    }

    grids.addEventListener("mousemove", (ev) => {
      const c = ev.target.closest(".ma-cell");
      const i = c ? +c.dataset.i : -1;
      if (i !== st.hover) {
        grids.querySelectorAll(".ma-hover").forEach((x) => x.classList.remove("ma-hover"));
        if (i >= 0) grids.querySelectorAll(`.ma-cell[data-i="${i}"]`).forEach((x) => x.classList.add("ma-hover"));
        st.hover = i;
      }
      if (i < 0) { tip.hidden = true; return; }
      const r = Math.floor(i / N), col = i % N;
      const rows = [el("div", { class: "iw-tip-h", text: `buňka – řádek ${r + 1}, sloupec ${col + 1}` })];
      names.forEach((n) => rows.push(tipRow(`"${n}"`, isNaN(R[n][i]) ? "NoData" : fmt(R[n][i], 0))));
      if (st.result) rows.push(tipRow("výsledek", isNaN(st.result[i]) ? "NoData" : fmt(st.result[i], Number.isInteger(st.result[i]) ? 0 : 2)));
      tip.replaceChildren(...rows);
      tip.hidden = false;
      const box = grids.getBoundingClientRect(), cb = c.getBoundingClientRect();
      placeTip(tip, cb.right - box.left - 6, cb.bottom - box.top - 6, grids.clientWidth, grids.clientHeight + 200);
    });
    grids.addEventListener("mouseleave", () => {
      tip.hidden = true; st.hover = -1;
      grids.querySelectorAll(".ma-hover").forEach((x) => x.classList.remove("ma-hover"));
    });

    run();
  }

  /* ================================================================
   * Widget 2: relativní výškový model krok za krokem
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
    const stepText = el("div", { class: "ma-steptext" });
    const prof = el("canvas", { class: "iw-canvas" });
    const profTip = el("div", { class: "iw-tip", hidden: "" });
    const extra = el("div", { class: "iw-ctrls ma-extra" });

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
        extra.append(el("div", { class: "iw-ctrl iw-ctrl-btn" }, [el("label", { class: "iw-check" }, [cb, el("span", { text: "Symbologie jen na rozsah výšek řeky (krok 15 postupu)" })])]));
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
    document.querySelectorAll(".iw[data-ma]").forEach((root) => {
      if (root.dataset.maReady) return;
      root.dataset.maReady = "1";
      try {
        if (root.dataset.ma === "kalkulacka") initCalculator(root);
        else if (root.dataset.ma === "rem") initREM(root);
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

/*
 * Interaktivní ukázky mapové algebry pro MkDocs Material. Bez externích závislostí.
 * Styly v mapova_algebra.css (třídy .ma-*).
 *
 * Použití v Markdownu:
 *   <div class="ma" data-ma="kalkulacka"></div>  – rastrová kalkulačka na malých rastrech
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
  const rgb = (c) => `rgb(${c.map(Math.round)})`;
  const lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

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
    const tip = el("div", { class: "ma-tip", hidden: "" });
    const presets = el("div", { class: "ma-presets" }, PRESETS.map(([e, d]) => {
      const b = el("button", { type: "button", class: "ma-btn ma-preset", title: d }, [el("code", { text: e })]);
      b.addEventListener("click", () => { input.value = e; run(); });
      return b;
    }));
    const presetDesc = el("div", { class: "ma-sub ma-desc" });

    root.append(
      el("div", { class: "ma-head" }, [
        el("strong", { text: "Rastrová kalkulačka" }),
        el("span", { class: "ma-hint", text: "Rastry 10 × 10 buněk, velikost buňky 100 m. Najetím na buňku uvidíte, z jakých hodnot se počítá." }),
      ]),
      el("div", { class: "ma-exprrow" }, [el("span", { class: "ma-prompt", text: "Výraz" }), input, el("button", { type: "button", class: "ma-btn", "aria-pressed": "true", text: "Spustit", onclick: () => run() })]),
      errBox,
      el("div", { class: "ma-sub", text: "Vyzkoušejte příklady:" }),
      presets, presetDesc,
      el("div", { class: "ma-plot" }, [grids, tip]),
      summary,
      el("div", { class: "ma-sub", text: `Funkce: ${Object.keys(FUNCS).join(", ")} · Operátory: + − * / ** · == != > < >= <= · & (a zároveň) | (nebo) ~ (negace)` })
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
        rows.push(el("div", { class: "ma-sub", text: "Počet buněk a plocha pro každou hodnotu výsledku (buňka = 100 × 100 m = 1 ha):" }));
        const t = el("table", {}, [
          el("thead", {}, [el("tr", {}, ["Hodnota", "Počet buněk", "Plocha"].map((x) => el("th", { text: x })))]),
          el("tbody", {}, uniq.map((u) => {
            const n = v.filter((x) => x === u).length;
            return el("tr", {}, [el("td", { class: "ma-num", text: fmt(u, 0) }), el("td", { class: "ma-num", text: String(n) }), el("td", { class: "ma-num", text: fmt(n * cellHa, cellHa >= 1 ? 0 : 2) + " ha" })]);
          }).concat(nod ? [el("tr", {}, [el("td", { class: "ma-num", text: "NoData" }), el("td", { class: "ma-num", text: String(nod) }), el("td", { class: "ma-num", text: "–" })])] : [])),
        ]);
        rows.push(el("div", { class: "ma-table" }, [t]));
      } else {
        const mean = v.reduce((a, b) => a + b, 0) / (v.length || 1);
        rows.push(el("div", { class: "ma-sub", text: `Minimum ${fmt(Math.min(...v), 1)}, maximum ${fmt(Math.max(...v), 1)}, průměr ${fmt(mean, 1)}` + (nod ? `, NoData: ${nod} buněk` : "") + "." }));
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
      const rows = [el("div", { class: "ma-tip-h", text: `buňka – řádek ${r + 1}, sloupec ${col + 1}` })];
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
   * Inicializace
   * ================================================================ */

  function init() {
    document.querySelectorAll(".ma[data-ma]").forEach((root) => {
      if (root.dataset.maReady) return;
      root.dataset.maReady = "1";
      try {
        if (root.dataset.ma === "kalkulacka") initCalculator(root);
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

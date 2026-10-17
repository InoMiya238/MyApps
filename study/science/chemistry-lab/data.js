// 化学基礎ラボ: 単元の定義、元素の性質の決め方、反応式のプリセット、道場の問題。
// 読み込む順番: shared/store.js → (道場だけ shared/review.js) → data.js → data-elements.js
// 復習プランナー(study/review/review-planner/)も、このファイルだけを読む(UNITS・unit()・grade()・loadStats())。
//
// ■ 問題の形(固定・生成で共通)。中学理科道場(study/science/junior-high-science/data.js)と同じ
//   {
//     id: "f1",                  // 固定問題は必須。単元の中で重ならない名前(生成問題にはいらない)
//     text: "問いの文のHTML",     // 必須
//     material: "教材のHTML",     // 省略可。問いの文の下に出す(CHEM.given など)
//     choices: ["…", "…", "…", "…"],   // 必須。ちょうど4つ、すべて異なること。並びはページが毎回まぜる
//     answer: 0,                 // 必須。choices の中の正解の番号(0〜3)
//     explain: ["1行目", "2行目"], // 必須。2〜3行
//     choiceLayout: "grid",      // 省略可。短い語・数値のとき2列にする
//     tool: "periodic.html?z=11" // 省略可。解説の下に出すツールページへのリンク。なければ単元の既定のページ
//   }
// ■ 化学式の書き方(CHEM.chem): "H2O" → H₂O、"SO4^2-" → SO₄²⁻、"Na^+" → Na⁺。数字の前が英字か ")" なら下付き。
// ■ 原子量は化学基礎の概数(AW)。アボガドロ定数 6.0×10²³/mol、標準状態の気体 22.4 L/mol。
var CHEM = (function () {
  "use strict";

  var STATS_KEY = "chemistryLabStats";
  var SETTINGS_KEY = "chemistryLabSettings";
  var PERIODIC_MODE_KEY = "chemistryLabPeriodicMode";
  var EQUATION_KEY = "chemistryLabEquation";
  var COUNTS = [5, 10, 20];

  // 学年の代わり(復習プランナーが「化学基礎 · 元素」のように表示する)
  var GRADES = [{ id: "basic", short: "化学基礎", name: "化学基礎" }];
  var AREAS = ["元素", "原子", "化学結合", "化学反応"];
  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "symbols", name: "元素記号と名前", area: "元素", grade: "basic", tool: "periodic.html" },
    { id: "periodic", name: "周期表と元素の性質", area: "元素", grade: "basic", tool: "periodic.html" },
    { id: "atom", name: "原子の構造と同位体", area: "原子", grade: "basic", tool: "atom.html" },
    { id: "electron", name: "電子配置と価電子", area: "原子", grade: "basic", tool: "atom.html" },
    { id: "ion", name: "イオンとイオンからなる物質", area: "化学結合", grade: "basic", tool: "atom.html" },
    { id: "equation", name: "化学反応式の係数", area: "化学反応", grade: "basic", tool: "equation.html" },
    { id: "mole", name: "物質量(mol)の計算", area: "化学反応", grade: "basic", tool: "periodic.html" }
  ];
  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }
  function grade(id) { return id === "basic" ? GRADES[0] : null; }

  // ---------- 保存データ ----------
  function cleanNum(v) { return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function emptyStats() { return { byUnit: {}, bestStreak: 0 }; }
  function loadStats() {
    var raw = Store.load(STATS_KEY, null);
    var s = emptyStats();
    if (!raw || typeof raw !== "object") return s;
    s.bestStreak = cleanNum(raw.bestStreak);
    if (raw.byUnit && typeof raw.byUnit === "object") {
      UNITS.forEach(function (u) {
        var r = raw.byUnit[u.id];
        if (!r || typeof r !== "object") return;
        var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total);
        if (total > 0) s.byUnit[u.id] = { total: total, correct: correct };
      });
    }
    return s;
  }
  function saveStats(stats) { return Store.save(STATS_KEY, stats); }
  function clearStats() { return Store.remove(STATS_KEY); }
  // 設定。保存がなければ null。units には、いまもある単元のIDだけを残す
  function loadSettings() {
    var raw = Store.load(SETTINGS_KEY, null);
    if (!raw || typeof raw !== "object") return null;
    var s = { units: [], count: 10 };
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    if (COUNTS.indexOf(Number(raw.count)) >= 0) s.count = Number(raw.count);
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }
  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  // ---------- 道具 ----------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  // HTMLから文字だけを取り出す(選択肢の重なりを調べるため)。下付き・上付きは _ ^ をつけて区別する
  function text(html) {
    return String(html)
      .replace(/<sub>/g, "_").replace(/<sup>/g, "^")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  function attr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // 小数の誤差を消す
  function num(n, digits) {
    var v = Math.round(Number(n) * 1e6) / 1e6;
    if (!isFinite(v)) return String(n);
    if (typeof digits === "number") return v.toFixed(digits);
    return String(v);
  }
  // 有効数字2けた(0.5 → "0.50"、2 → "2.0"、64 → "64")
  function sig2(n) {
    var v = Number(n);
    if (!isFinite(v) || v <= 0) return String(n);
    var e = Math.floor(Math.log(v) / Math.LN10 + 1e-9);
    var d = Math.max(0, 1 - e);
    return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }
  var SUP_DIGITS = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "+": "⁺" };
  function supText(s) { return String(s).split("").map(function (c) { return SUP_DIGITS[c] || c; }).join(""); }

  // ---------- 表示部品 ----------
  function steps(lines) {
    return '<div class="steps">' + lines.map(function (l) { return '<div class="step">' + l + "</div>"; }).join("") + "</div>";
  }
  function rule(html) { return '<span class="rule">' + html + "</span>"; }
  // 単位つきの数値
  function q(value, unitText) {
    var n = typeof value === "number" ? num(value) : String(value);
    var u = unitText === undefined || unitText === null ? "" : String(unitText);
    var tight = !/^[A-Za-zµμ]/.test(u);
    return '<span class="qty"><span class="n">' + n + "</span>" +
      (u ? '<span class="u' + (tight ? " tight" : "") + '">' + u + "</span>" : "") + "</span>";
  }
  // 化学式。"SO4^2-" のように ^ のうしろを電荷にする
  function chemInner(f) {
    var s = String(f), charge = "";
    var k = s.indexOf("^");
    if (k >= 0) { charge = s.slice(k + 1); s = s.slice(0, k); }
    s = s.replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>");
    if (charge) s += "<sup>" + charge.replace(/-/g, "−") + "</sup>";
    return s;
  }
  function chem(f) { return '<span class="chem">' + chemInner(f) + "</span>"; }
  // 10の累乗の数(6.0×10²³)
  function sci(mantissa, exp) {
    return '<span class="qty"><span class="n">' + mantissa + "×10<sup>" + String(exp).replace(/-/g, "−") + "</sup></span></span>";
  }
  // 核種の記号(質量数を左上、原子番号を左下)
  function nuclide(sym, a, z) {
    return '<span class="nuc"><span class="nuc-ms"><span>' + a + "</span><span>" + z + "</span></span>" + sym + "</span>";
  }
  function given(pairs) {
    return '<dl class="given">' + pairs.map(function (p) { return "<dt>" + p[0] + "</dt><dd>" + p[1] + "</dd>"; }).join("") + "</dl>";
  }
  function formula(lhs, rhs) {
    return '<div class="formula"><span>' + lhs + "</span><span>=</span><span>" + rhs + "</span></div>";
  }

  // 生成問題の4択。誤答の候補から、正解とも互いにも重ならない3つを前から選ぶ
  function choices4(correct, wrongs) {
    var out = [String(correct)], seen = {};
    seen[text(correct)] = true;
    (wrongs || []).forEach(function (w) {
      if (out.length >= 4 || w === undefined || w === null) return;
      var k = text(w);
      if (!k || seen[k] || /NaN|undefined|Infinity/.test(k)) return;
      seen[k] = true;
      out.push(String(w));
    });
    return out.length === 4 ? { choices: out, answer: 0 } : null;
  }

  // =====================================================================
  // 元素(中身は data-elements.js が registerElements で入れる)
  // =====================================================================
  var ELEMENTS = [];          // 原子番号の順。ELEMENTS[z - 1]
  var bySym = {};
  var ISOTOPES = {};
  var NONMETALS = ["H", "He", "B", "C", "N", "O", "F", "Ne", "Si", "P", "S", "Cl", "Ar", "As", "Se", "Br", "Kr", "Te", "I", "Xe", "At", "Rn"];
  var GASES = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86];
  var LIQUIDS = [35, 80];
  var NOBLE_Z = [2, 10, 18, 36, 54, 86, 118];

  // 原子番号 → 周期・族。ランタノイド(57〜71)とアクチノイド(89〜103)は3族として series をつける
  function position(z) {
    if (z <= 2) return { period: 1, group: z === 1 ? 1 : 18, series: null };
    if (z <= 18) {
      var o = z <= 10 ? z - 2 : z - 10;
      return { period: z <= 10 ? 2 : 3, group: o <= 2 ? o : o + 10, series: null };
    }
    if (z <= 54) return { period: z <= 36 ? 4 : 5, group: z <= 36 ? z - 18 : z - 36, series: null };
    var p = z <= 86 ? 6 : 7, k = z - (p === 6 ? 54 : 86);
    if (k <= 2) return { period: p, group: k, series: null };
    if (k <= 17) return { period: p, group: 3, series: p === 6 ? "lanthanoid" : "actinoid" };
    return { period: p, group: k - 14, series: null };
  }

  var CAT_INFO = {
    "alkali": { label: "アルカリ金属", short: "アルカリ金属" },
    "alkaline-earth": { label: "アルカリ土類金属", short: "アルカリ土類金属" },
    "transition": { label: "遷移元素", short: "遷移元素" },
    "lanthanoid": { label: "遷移元素(ランタノイド)", short: "ランタノイド" },
    "actinoid": { label: "遷移元素(アクチノイド)", short: "アクチノイド" },
    "metal": { label: "その他の典型金属", short: "その他の典型金属" },
    "nonmetal": { label: "その他の非金属", short: "その他の非金属" },
    "halogen": { label: "ハロゲン", short: "ハロゲン" },
    "noble": { label: "貴ガス", short: "貴ガス" },
    "unknown": { label: "性質がよくわかっていない", short: "よくわかっていない" }
  };
  var CAT_ORDER = ["alkali", "alkaline-earth", "transition", "lanthanoid", "actinoid", "metal", "nonmetal", "halogen", "noble", "unknown"];
  var STATE_INFO = { solid: "固体", liquid: "液体", gas: "気体", unknown: "不明" };
  var TYPE_INFO = { metal: "金属元素", nonmetal: "非金属元素", unknown: "不明" };

  function isNonmetal(e) { return NONMETALS.indexOf(e.sym) >= 0; }
  function categoryOf(e) {
    if (e.z >= 109) return "unknown";
    if (e.series) return e.series;
    if (e.group === 1 && e.z !== 1) return "alkali";
    if (e.group === 2) return "alkaline-earth";
    if (e.group >= 3 && e.group <= 12) return "transition";
    if (e.group === 17) return "halogen";
    if (e.group === 18) return "noble";
    return isNonmetal(e) ? "nonmetal" : "metal";
  }
  function typeOf(e) { return e.z >= 109 ? "unknown" : isNonmetal(e) ? "nonmetal" : "metal"; }
  function stateOf(e) {
    if (LIQUIDS.indexOf(e.z) >= 0) return "liquid";
    if (GASES.indexOf(e.z) >= 0) return "gas";
    if (e.z >= 99) return "unknown";
    return "solid";
  }
  function blockOf(e) { return e.series || (e.group >= 3 && e.group <= 12) ? "遷移元素" : "典型元素"; }

  // 電子の数 → 各電子殻の電子の数(化学基礎の範囲: K2 → L8 → M8 → N)。20個まで
  function shellsOf(electrons) {
    var caps = [2, 8, 8, 2], out = [], left = electrons;
    for (var i = 0; i < caps.length && left > 0; i++) {
      var k = Math.min(caps[i], left);
      out.push(k);
      left -= k;
    }
    return out;
  }
  var SHELL_NAMES = ["K", "L", "M", "N"];
  function configText(electrons) {
    if (electrons <= 0) return "なし";
    return shellsOf(electrons).map(function (n, i) { return SHELL_NAMES[i] + n; }).join(" ");
  }
  // 原子(中性)の価電子の数。貴ガスは0
  function valenceOf(z) {
    if (NOBLE_Z.indexOf(z) >= 0) return 0;
    var s = shellsOf(z);
    return s[s.length - 1];
  }

  function autoNote(e) {
    var cat = categoryOf(e);
    if (cat === "unknown") return "人工的につくられた元素。できる量がきわめて少なく、性質はよくわかっていない。";
    var place = "第" + e.period + "周期・" + e.group + "族";
    var artificial = e.z >= 93 || e.z === 43 || e.z === 61;
    var radio = artificial ? "天然にはほとんどなく、人工的につくられる放射性の元素。" : (e.z >= 84 ? "放射性の元素。" : "");
    if (cat === "lanthanoid") return "ランタノイド(57〜71番の15元素)の1つ。たがいに性質がよく似ている。" + radio;
    if (cat === "actinoid") return "アクチノイド(89〜103番の15元素)の1つ。すべて放射性の元素。" + (artificial ? "人工的につくられる。" : "");
    var kind = {
      "alkali": "アルカリ金属。価電子1個で、1価の陽イオンになりやすい。",
      "alkaline-earth": "アルカリ土類金属。価電子2個で、2価の陽イオンになりやすい。",
      "transition": "遷移元素で、金属。",
      "metal": "典型元素の金属。",
      "nonmetal": "典型元素の非金属。",
      "halogen": "ハロゲン。価電子7個で、1価の陰イオンになりやすい。",
      "noble": "貴ガス。ほかの物質とほとんど反応しない。"
    }[cat];
    return place + "の" + kind + radio;
  }

  function registerElements(rows, notes, isotopes, readings) {
    ELEMENTS.length = 0;
    bySym = {};
    rows.forEach(function (r, i) {
      var z = i + 1, pos = position(z);
      var e = { z: z, sym: r[0], name: r[1], mass: r[2], period: pos.period, group: pos.group, series: pos.series };
      e.category = categoryOf(e);
      e.type = typeOf(e);
      e.state = stateOf(e);
      e.block = blockOf(e);
      e.note = (notes && notes[z]) || autoNote(e);
      e.reading = (readings && readings[z]) || "";
      ELEMENTS.push(e);
      bySym[e.sym] = e;
    });
    ISOTOPES = isotopes || {};
  }
  function element(z) { return ELEMENTS[z - 1] || null; }
  function elementBySymbol(sym) { return bySym.hasOwnProperty(sym) ? bySym[sym] : null; }
  // 検索: 原子番号・元素記号(大文字小文字を問わない)・名前(完全一致 → 前方一致)
  function findElement(query) {
    var s = String(query || "").trim();
    if (!s) return null;
    if (/^\d+$/.test(s)) return element(Number(s));
    for (var i = 0; i < ELEMENTS.length; i++) if (ELEMENTS[i].sym.toLowerCase() === s.toLowerCase()) return ELEMENTS[i];
    // 名前は、ひらがなにそろえて比べる(カタカナ名・よみがなの両方)。完全一致 → 前方一致
    var key = toHira(s);
    function keys(e) { return [toHira(e.name), e.reading].filter(Boolean); }
    for (i = 0; i < ELEMENTS.length; i++) if (keys(ELEMENTS[i]).indexOf(key) >= 0) return ELEMENTS[i];
    for (i = 0; i < ELEMENTS.length; i++) if (keys(ELEMENTS[i]).some(function (k) { return k.indexOf(key) === 0; })) return ELEMENTS[i];
    return null;
  }
  // カタカナ → ひらがな(漢字・英字はそのまま)
  function toHira(s) { return String(s).replace(/[\u30a1-\u30f6]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); }
  // 同位体の区分: "stable" 安定 / "natural" 放射性(天然にもある) / "none" 天然にはない・不安定 / null データなし
  function isotopeKind(z, a) {
    var iso = ISOTOPES[z];
    if (!iso) return null;
    if (iso.stable.indexOf(a) >= 0) return "stable";
    if (iso.natural.indexOf(a) >= 0) return "natural";
    return "none";
  }
  function isotopesOf(z) { return ISOTOPES[z] || null; }

  // =====================================================================
  // 化学式と反応式
  // =====================================================================
  // 原子量(化学基礎の概数)
  var AW = { H: 1.0, He: 4.0, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 63.5, Zn: 65, Ag: 108 };
  // 化学式の原子を数える。atoms: { H: 2, O: 1 }、order: 現れた順の記号の並び(図に使う)
  function parseFormula(f) {
    var s = String(f).split("^")[0];
    var pos = 0;
    function group() {
      var counts = {}, order = [];
      while (pos < s.length && s[pos] !== ")") {
        var part;
        if (s[pos] === "(") {
          pos++;
          part = group();
          pos++;   // ")"
        } else {
          var m = /^[A-Z][a-z]?/.exec(s.slice(pos));
          if (!m) throw new Error("化学式が読めない: " + f);
          pos += m[0].length;
          part = { counts: {}, order: [m[0]] };
          part.counts[m[0]] = 1;
        }
        var d = /^\d+/.exec(s.slice(pos)), k = 1;
        if (d) { k = Number(d[0]); pos += d[0].length; }
        Object.keys(part.counts).forEach(function (el) { counts[el] = (counts[el] || 0) + part.counts[el] * k; });
        for (var r = 0; r < k; r++) order = order.concat(part.order);
      }
      return { counts: counts, order: order };
    }
    var res = group();
    return { atoms: res.counts, order: res.order };
  }
  function molarMass(f) {
    var a = parseFormula(f).atoms, m = 0;
    Object.keys(a).forEach(function (el) {
      if (!AW.hasOwnProperty(el)) throw new Error("原子量がない: " + el);
      m += AW[el] * a[el];
    });
    return Math.round(m * 100) / 100;
  }
  // 反応式のプリセット。answer は最小の整数比の係数(反応物 → 生成物の順)
  var REACTIONS = [
    { id: "water", level: "jhs", name: "水素の燃焼", reactants: ["H2", "O2"], products: ["H2O"], answer: [2, 1, 2] },
    { id: "carbon", level: "jhs", name: "炭素の燃焼", reactants: ["C", "O2"], products: ["CO2"], answer: [1, 1, 1] },
    { id: "mgo", level: "jhs", name: "マグネシウムの燃焼", reactants: ["Mg", "O2"], products: ["MgO"], answer: [2, 1, 2] },
    { id: "cuo", level: "jhs", name: "銅の酸化", reactants: ["Cu", "O2"], products: ["CuO"], answer: [2, 1, 2] },
    { id: "fes", level: "jhs", name: "鉄と硫黄の反応", reactants: ["Fe", "S"], products: ["FeS"], answer: [1, 1, 1] },
    { id: "ag2o", level: "jhs", name: "酸化銀の熱分解", reactants: ["Ag2O"], products: ["Ag", "O2"], answer: [2, 4, 1] },
    { id: "nahco3", level: "jhs", name: "炭酸水素ナトリウムの熱分解", reactants: ["NaHCO3"], products: ["Na2CO3", "H2O", "CO2"], answer: [2, 1, 1, 1] },
    { id: "neutral", level: "jhs", name: "塩酸と水酸化ナトリウムの中和", reactants: ["HCl", "NaOH"], products: ["NaCl", "H2O"], answer: [1, 1, 1, 1] },
    { id: "methane", level: "basic", name: "メタンの燃焼", reactants: ["CH4", "O2"], products: ["CO2", "H2O"], answer: [1, 2, 1, 2] },
    { id: "propane", level: "basic", name: "プロパンの燃焼", reactants: ["C3H8", "O2"], products: ["CO2", "H2O"], answer: [1, 5, 3, 4] },
    { id: "ethanol", level: "basic", name: "エタノールの燃焼", reactants: ["C2H5OH", "O2"], products: ["CO2", "H2O"], answer: [1, 3, 2, 3] },
    { id: "ammonia", level: "basic", name: "アンモニアの合成", reactants: ["N2", "H2"], products: ["NH3"], answer: [1, 3, 2] },
    { id: "al2o3", level: "basic", name: "アルミニウムの燃焼", reactants: ["Al", "O2"], products: ["Al2O3"], answer: [4, 3, 2] },
    { id: "znhcl", level: "basic", name: "亜鉛と塩酸の反応", reactants: ["Zn", "HCl"], products: ["ZnCl2", "H2"], answer: [1, 2, 1, 1] },
    { id: "caco3", level: "basic", name: "炭酸カルシウムと塩酸の反応", reactants: ["CaCO3", "HCl"], products: ["CaCl2", "H2O", "CO2"], answer: [1, 2, 1, 1, 1] }
  ];
  var LEVELS = [{ id: "jhs", name: "中学" }, { id: "basic", name: "化学基礎" }];
  var reactionById = {};
  REACTIONS.forEach(function (r) { reactionById[r.id] = r; });
  function reaction(id) { return reactionById.hasOwnProperty(id) ? reactionById[id] : null; }
  function speciesOf(r) { return r.reactants.concat(r.products); }
  // 係数から、原子ごとの左辺・右辺の数を数える: [{ el, left, right }](現れた順)
  function countAtoms(r, coefs) {
    var order = [], left = {}, right = {};
    speciesOf(r).forEach(function (f, i) {
      var a = parseFormula(f).atoms, side = i < r.reactants.length ? left : right;
      Object.keys(a).forEach(function (el) {
        if (order.indexOf(el) < 0) order.push(el);
        side[el] = (side[el] || 0) + a[el] * coefs[i];
      });
    });
    return order.map(function (el) { return { el: el, left: left[el] || 0, right: right[el] || 0 }; });
  }
  function isBalanced(r, coefs) { return countAtoms(r, coefs).every(function (c) { return c.left === c.right; }); }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function gcdAll(list) { return list.reduce(function (g, n) { return gcd(g, n); }, 0); }
  // 反応式のHTML。blank を渡すと、その番号の係数を □ にする。係数1は書かない
  function equationHtml(r, coefs, blank) {
    var n = r.reactants.length;
    function term(f, i) {
      var c = blank === i ? '<span class="blank">□</span>' : coefs[i] === 1 ? "" : String(coefs[i]);
      return '<span class="chem">' + c + chemInner(f) + "</span>";
    }
    var lhs = r.reactants.map(function (f, i) { return term(f, i); }).join(" + ");
    var rhs = r.products.map(function (f, i) { return term(f, i + n); }).join(" + ");
    return '<span class="eq">' + lhs + " → " + rhs + "</span>";
  }

  // =====================================================================
  // 道場の問題
  // =====================================================================
  var content = {};
  function register(id, data) {
    if (!unit(id) || !data) return;
    content[id] = {
      fixed: Array.isArray(data.fixed) ? data.fixed : [],
      generators: (Array.isArray(data.generators) ? data.generators : []).filter(function (g) { return g && typeof g.make === "function"; })
    };
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  function isReady(id) {
    var c = contentOf(id);
    return !!c && (c.generators.length + validFixed(c).length) > 0;
  }

  function checkQuestion(qn, generated) {
    var errs = [];
    if (!qn || typeof qn !== "object") return ["問題がオブジェクトではない"];
    if (!generated && (typeof qn.id !== "string" || !qn.id)) errs.push("id がない");
    if (typeof qn.text !== "string" || !qn.text) errs.push("text がない");
    ["material", "tool"].forEach(function (k) {
      if (qn[k] !== undefined && qn[k] !== null && typeof qn[k] !== "string") errs.push(k + " が文字列ではない");
    });
    if (!Array.isArray(qn.choices) || qn.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      qn.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c) { errs.push("choices[" + i + "] が空"); return; }
        var k = text(c);
        if (!k) { errs.push("choices[" + i + "] に文字がない"); return; }
        if (/NaN|undefined|Infinity/.test(k)) errs.push("choices[" + i + "] に数値でないものがある: " + k);
        if (seen[k]) errs.push("choices に同じものがある: " + k);
        seen[k] = true;
      });
    }
    if (typeof qn.answer !== "number" || qn.answer !== Math.floor(qn.answer) || qn.answer < 0 || qn.answer > 3) {
      errs.push("answer が 0〜3 ではない");
    }
    var ex = qn.explain;
    if (!(Array.isArray(ex) && ex.length > 0 && ex.every(function (l) { return typeof l === "string" && l; }))) {
      errs.push("explain がない");
    }
    return errs;
  }

  function prepare(unitId, source, qn) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      source: source,
      text: qn.text,
      material: qn.material || "",
      choices: order.map(function (i) { return qn.choices[i]; }),
      answer: order.indexOf(qn.answer),
      explain: qn.explain.slice(),
      choiceLayout: qn.choiceLayout === "grid" ? "grid" : "",
      tool: qn.tool !== undefined ? qn.tool : unit(unitId).tool
    };
  }
  function signature(qn) { return text(qn.text + "|" + (qn.material || "") + "|" + qn.choices[qn.answer]); }
  function validFixed(c) {
    var seen = {};
    return c.fixed.filter(function (qn) {
      if (checkQuestion(qn).length > 0 || seen[qn.id]) return false;
      seen[qn.id] = true;
      return true;
    });
  }

  // 1つの単元から n 問。固定問題は重ねない。生成問題のある単元は、固定問題と生成問題をまぜる
  function buildForUnit(unitId, n, used) {
    var c = contentOf(unitId), out = [];
    if (!c || n <= 0) return out;
    var fixedPool = shuffle(validFixed(c));
    var gens = shuffle(c.generators);
    var genIndex = 0;
    var genShare = Math.min(0.5, gens.length * 0.2);
    function fromGenerator() {
      for (var round = 0; round < gens.length; round++) {
        var g = gens[genIndex % gens.length];
        genIndex++;
        for (var t = 0; t < 20; t++) {
          var qn = null;
          try { qn = g.make(); } catch (e) { qn = null; }
          if (!qn || checkQuestion(qn, true).length > 0) continue;
          var sig = unitId + "|" + signature(qn);
          if (used[sig]) continue;
          used[sig] = true;
          return prepare(unitId, "gen:" + g.id, qn);
        }
      }
      return null;
    }
    function fromFixed() {
      if (fixedPool.length === 0) return null;
      var qn = fixedPool.shift();
      return prepare(unitId, "fixed:" + qn.id, qn);
    }
    for (var i = 0; i < n; i++) {
      var item = null;
      if (gens.length === 0) item = fromFixed();
      else if (fixedPool.length > 0 && Math.random() >= genShare) item = fromFixed();
      else item = fromGenerator() || fromFixed();
      if (item) out.push(item);
    }
    return out;
  }

  // クイズ1回分。選んだ単元にできるだけ均等に割り振り、順番をまぜる
  function buildQuiz(unitIds, count) {
    var ids = shuffle(unitIds.filter(isReady));
    if (ids.length === 0 || count <= 0) return [];
    var base = Math.floor(count / ids.length), extra = count % ids.length;
    var used = {}, all = [], short = [];
    ids.forEach(function (id, i) {
      var want = base + (i < extra ? 1 : 0), got = buildForUnit(id, want, used);
      all = all.concat(got);
      if (got.length < want && validFixed(contentOf(id)).length > 0) short.push({ id: id, need: want - got.length });
    });
    var seq = shuffle(all);
    // 足りない分は、同じ固定問題をもう1周して補う(同じ問題どうしができるだけ離れるように)
    function keyOf(item) { return item.unitId + "|" + item.source; }
    while (short.length > 0) {
      var lastPos = {};
      seq.forEach(function (item, pos) { lastPos[keyOf(item)] = pos; });
      var lap = [];
      short.forEach(function (sh) {
        var pool = validFixed(contentOf(sh.id)).map(function (qn) {
          var k = sh.id + "|fixed:" + qn.id;
          return { id: sh.id, q: qn, pos: lastPos.hasOwnProperty(k) ? lastPos[k] : -1 };
        });
        pool.sort(function (a, b) { return a.pos - b.pos; });
        var take = pool.slice(0, sh.need);
        sh.need -= take.length;
        lap = lap.concat(take);
      });
      lap.sort(function (a, b) { return a.pos - b.pos; });
      lap.forEach(function (t) { seq.push(prepare(t.id, "fixed:" + t.q.id, t.q)); });
      short = short.filter(function (sh) { return sh.need > 0; });
    }
    return seq;
  }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, PERIODIC_MODE_KEY: PERIODIC_MODE_KEY, EQUATION_KEY: EQUATION_KEY,
    COUNTS: COUNTS, GRADES: GRADES, AREAS: AREAS, UNITS: UNITS,
    unit: unit, grade: grade, register: register, contentOf: contentOf, isReady: isReady,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak,
    shuffle: shuffle, randInt: randInt, pick: pick, text: text, attr: attr, num: num, sig2: sig2, supText: supText,
    steps: steps, rule: rule, q: q, chem: chem, chemInner: chemInner, sci: sci, nuclide: nuclide, given: given, formula: formula,
    choices4: choices4,
    ELEMENTS: ELEMENTS, registerElements: registerElements, element: element, elementBySymbol: elementBySymbol,
    findElement: findElement, isotopeKind: isotopeKind, isotopesOf: isotopesOf,
    CAT_INFO: CAT_INFO, CAT_ORDER: CAT_ORDER, STATE_INFO: STATE_INFO, TYPE_INFO: TYPE_INFO, NONMETALS: NONMETALS,
    shellsOf: shellsOf, configText: configText, valenceOf: valenceOf, SHELL_NAMES: SHELL_NAMES,
    AW: AW, parseFormula: parseFormula, molarMass: molarMass,
    REACTIONS: REACTIONS, LEVELS: LEVELS, reaction: reaction, speciesOf: speciesOf, countAtoms: countAtoms,
    isBalanced: isBalanced, gcdAll: gcdAll, equationHtml: equationHtml,
    checkQuestion: checkQuestion, validFixed: validFixed, buildQuiz: buildQuiz
  };
})();

// =====================================================================
// 元素(symbols、periodic)
// =====================================================================
(function () {
  "use strict";
  if (typeof CHEM === "undefined") return;
  var c = CHEM.chem, rule = CHEM.rule;

  CHEM.register("symbols", {
    fixed: [
      { id: "s1", text: "元素記号「Na」が表す元素はどれか。", choices: ["ナトリウム", "窒素", "ネオン", "ニッケル"], answer: 0, choiceLayout: "grid",
        explain: ["Na はナトリウム。ラテン語の名前 natrium の頭文字からつけられている。", "窒素は N、ネオンは Ne、ニッケルは Ni。"], tool: "periodic.html?z=11" },
      { id: "s2", text: "カリウムの元素記号はどれか。", choices: ["K", "Ca", "Kr", "P"], answer: 0, choiceLayout: "grid",
        explain: ["カリウムは K(ラテン語 kalium から)。", "Ca はカルシウム、Kr はクリプトン、P はリン。"], tool: "periodic.html?z=19" },
      { id: "s3", text: "鉄の元素記号はどれか。", choices: ["Fe", "F", "Fr", "Ti"], answer: 0, choiceLayout: "grid",
        explain: ["鉄は Fe(ラテン語 ferrum から)。", "F はフッ素、Fr はフランシウム、Ti はチタン。"], tool: "periodic.html?z=26" },
      { id: "s4", text: "銀の元素記号はどれか。", choices: ["Ag", "Au", "Al", "Ar"], answer: 0, choiceLayout: "grid",
        explain: ["銀は Ag(ラテン語 argentum から)。", "Au は金、Al はアルミニウム、Ar はアルゴン。Ag と Au の取り違えに注意。"], tool: "periodic.html?z=47" },
      { id: "s5", text: "金の元素記号はどれか。", choices: ["Au", "Ag", "Ga", "Ge"], answer: 0, choiceLayout: "grid",
        explain: ["金は Au(ラテン語 aurum から)。", "Ag は銀、Ga はガリウム、Ge はゲルマニウム。"], tool: "periodic.html?z=79" },
      { id: "s6", text: "元素記号「Cl」が表す元素はどれか。", choices: ["塩素", "炭素", "カルシウム", "銅"], answer: 0, choiceLayout: "grid",
        explain: ["Cl は塩素。", "炭素は C、カルシウムは Ca、銅は Cu。"], tool: "periodic.html?z=17" },
      { id: "s7", text: "元素記号「Hg」が表す元素はどれか。", choices: ["水銀", "水素", "ヘリウム", "銀"], answer: 0, choiceLayout: "grid",
        explain: ["Hg は水銀(ラテン語 hydrargyrum「水の銀」から)。", "水素は H、ヘリウムは He、銀は Ag。"], tool: "periodic.html?z=80" },
      { id: "s8", text: "硫黄の元素記号はどれか。", choices: ["S", "Si", "Sn", "Se"], answer: 0, choiceLayout: "grid",
        explain: ["硫黄は S。", "Si はケイ素、Sn はスズ、Se はセレン。"], tool: "periodic.html?z=16" },
      { id: "s9", text: "元素記号と元素名の組み合わせが正しいものはどれか。",
        choices: ["Mg — マグネシウム", "Mn — マグネシウム", "Cu — 亜鉛", "Pb — 白金"], answer: 0,
        explain: ["Mg がマグネシウム。Mn はマンガン。", "亜鉛は Zn(Cu は銅)、白金は Pt(Pb は鉛)。"], tool: "periodic.html?z=12" },
      { id: "s10", text: "元素記号「N」が表す元素はどれか。", choices: ["窒素", "ナトリウム", "ネオン", "ニッケル"], answer: 0, choiceLayout: "grid",
        explain: ["N は窒素。", "ナトリウムは Na、ネオンは Ne、ニッケルは Ni。"], tool: "periodic.html?z=7" },
      { id: "s11", text: "カルシウムの元素記号の書き方として正しいものはどれか。", choices: ["Ca", "CA", "ca", "cA"], answer: 0, choiceLayout: "grid",
        explain: ["元素記号は、1文字目を大文字、2文字目を小文字で書く。", "大文字の C は炭素、A で始まる元素記号は Ag・Al・Ar などで別の元素になる。"], tool: "periodic.html?z=20" },
      { id: "s12", text: "下線部が、単体ではなく「元素」の意味で使われているものはどれか。",
        choices: ["水は<u>水素</u>と酸素からできている。", "<u>水素</u>は燃えると水になる。", "<u>酸素</u>を集気びんに集める。", "空気中には<u>窒素</u>が体積で約78%ふくまれる。"], answer: 0,
        explain: ["水の成分として、物質をつくる原子の種類を指しているので「元素」。", "ほかの3つは、実際にある物質(" + c("H2") + "、" + c("O2") + "、" + c("N2") + " という単体)を指している。"] },
      { id: "s13", text: "元素記号「Zn」が表す元素はどれか。", choices: ["亜鉛", "スズ", "鉛", "銅"], answer: 0, choiceLayout: "grid",
        explain: ["Zn は亜鉛。", "スズは Sn、鉛は Pb、銅は Cu。"], tool: "periodic.html?z=30" }
    ],
    generators: [
      { id: "sym-name", label: "元素記号 ↔ 名前", make: function () {
        if (CHEM.ELEMENTS.length === 0) return null;
        var POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 25, 26, 28, 29, 30, 35, 47, 50, 53, 56, 78, 79, 80, 82];
        var e = CHEM.element(CHEM.pick(POOL));
        var first = e.sym[0];
        var same = CHEM.shuffle(CHEM.ELEMENTS.filter(function (x) { return x.z !== e.z && x.sym[0] === first; }));
        var samePool = same.filter(function (x) { return POOL.indexOf(x.z) >= 0; });
        var others = CHEM.shuffle(POOL.filter(function (z) { return z !== e.z; }).map(CHEM.element));
        var wrongEls = samePool.concat(same.filter(function (x) { return samePool.indexOf(x) < 0; }).slice(0, 1), others);
        var toName = Math.random() < 0.5, ch;
        if (toName) {
          ch = CHEM.choices4(e.name, wrongEls.map(function (x) { return x.name; }));
        } else {
          ch = CHEM.choices4(e.sym, wrongEls.map(function (x) { return x.sym; }));
        }
        if (!ch) return null;
        return {
          text: toName ? "元素記号「" + e.sym + "」が表す元素はどれか。" : e.name + "の元素記号はどれか。",
          choices: ch.choices, answer: 0, choiceLayout: "grid",
          explain: [e.name + "の元素記号は " + e.sym + "(原子番号 " + e.z + ")。", e.note],
          tool: "periodic.html?z=" + e.z
        };
      } }
    ]
  });

  CHEM.register("periodic", {
    fixed: [
      { id: "p1", text: "周期表の縦の列を何というか。", choices: ["族", "周期", "価", "殻"], answer: 0, choiceLayout: "grid",
        explain: ["縦の列を" + rule("族") + "(1〜18族)、横の行を" + rule("周期") + "(第1〜第7周期)という。", "同じ族の元素は価電子の数が同じで、性質がよく似ている。"] },
      { id: "p2", text: "現在の周期表で、元素は何の順に並んでいるか。", choices: ["原子番号", "原子量", "発見された年", "融点"], answer: 0, choiceLayout: "grid",
        explain: ["現在の周期表は、原子番号(陽子の数)の順に並べてある。", "メンデレーエフが最初につくった周期表は、原子量の順に並べたものだった。"] },
      { id: "p3", text: "水素を除く1族の元素をまとめて何というか。", choices: ["アルカリ金属", "アルカリ土類金属", "ハロゲン", "貴ガス"], answer: 0, choiceLayout: "grid",
        explain: ["Li・Na・K などの" + rule("アルカリ金属") + "。価電子1個で、1価の陽イオンになりやすい。", "水素も1族だが、非金属なのでアルカリ金属には入れない。"], tool: "periodic.html?z=3" },
      { id: "p4", text: "17族の元素をまとめて何というか。", choices: ["ハロゲン", "貴ガス", "アルカリ金属", "遷移元素"], answer: 0, choiceLayout: "grid",
        explain: ["F・Cl・Br・I などの" + rule("ハロゲン") + "。価電子7個で、1価の陰イオンになりやすい。", "貴ガスは18族、アルカリ金属は水素を除く1族、遷移元素は3〜12族。"], tool: "periodic.html?z=17" },
      { id: "p5", text: "2族の元素をまとめて何というか。", choices: ["アルカリ土類金属", "アルカリ金属", "ハロゲン", "典型非金属"], answer: 0, choiceLayout: "grid",
        explain: ["Be・Mg・Ca・Sr・Ba・Ra の2族を" + rule("アルカリ土類金属") + "という。", "価電子2個で、2価の陽イオンになりやすい。"], tool: "periodic.html?z=20" },
      { id: "p6", text: "貴ガス(18族)の性質として正しいものはどれか。",
        choices: ["ほかの物質とほとんど反応しない。", "1価の陽イオンになりやすい。", "1価の陰イオンになりやすい。", "常温ですべて液体である。"], answer: 0,
        explain: ["貴ガスの原子は最外殻の電子配置が安定(He は2個、ほかは8個)で、ほとんど反応しない。価電子は0とする。", "単体は1個の原子が分子として働く気体(単原子分子)。"], tool: "periodic.html?z=10" },
      { id: "p7", text: "次のうち、遷移元素はどれか。", choices: ["Fe", "Na", "Al", "Cl"], answer: 0, choiceLayout: "grid",
        explain: ["3〜12族の元素が" + rule("遷移元素") + "。Fe は8族。", "Na(1族)・Al(13族)・Cl(17族)は典型元素。"], tool: "periodic.html?z=26" },
      { id: "p8", text: "常温(25℃)・常圧で単体が液体である元素はどれか。", choices: ["臭素", "ヨウ素", "塩素", "ナトリウム"], answer: 0, choiceLayout: "grid",
        explain: ["常温で液体の単体は、臭素 " + c("Br2") + " と水銀 Hg の2つだけ。", "塩素 " + c("Cl2") + " は気体、ヨウ素 " + c("I2") + " とナトリウムは固体。"], tool: "periodic.html?z=35" },
      { id: "p9", text: "同じ族の元素についての説明として正しいものはどれか。",
        choices: ["価電子の数が同じで、化学的な性質がよく似ている。", "原子量がほぼ同じである。", "陽子の数が同じである。", "電子殻の数が同じである。"], answer: 0,
        explain: ["同じ族の元素は価電子の数が同じなので、化学的な性質が似ている(同族元素)。", "電子殻の数が同じになるのは、同じ周期の元素。"] },
      { id: "p10", text: "周期表で、金属元素はおもにどこにあるか。",
        choices: ["左側と中央", "右上", "右端の18族だけ", "第1周期だけ"], answer: 0,
        explain: ["金属元素は全元素の約8割をしめ、周期表の左側と中央にある。", "非金属元素は右上に集まっている(水素だけは左上)。"], tool: "periodic.html?z=26" },
      { id: "p11", text: "典型元素の説明として正しいものはどれか。",
        choices: ["1・2族と13〜18族の元素", "3〜12族の元素", "すべてが金属である元素", "すべてが気体である元素"], answer: 0,
        explain: ["1・2族と13〜18族が" + rule("典型元素") + "、3〜12族が遷移元素。", "典型元素には金属も非金属もふくまれる。"] },
      { id: "p12", text: "ナトリウムやカリウムの単体は、ふつう何の中に入れて保存するか。", choices: ["灯油(石油)", "水", "うすい塩酸", "エタノール"], answer: 0, choiceLayout: "grid",
        explain: ["アルカリ金属の単体は、空気中の酸素や水と激しく反応するので灯油の中に保存する。", "水とは反応して水素を発生し、水酸化物ができる。"], tool: "periodic.html?z=11" },
      { id: "p13", text: "陽イオンへのなりやすさ(陽性)が強い元素は、周期表のどのあたりに多いか(18族を除く)。",
        choices: ["左下", "右上", "右下", "中央の上"], answer: 0,
        explain: ["同じ周期では左ほど、同じ族では下ほど、電子を失って陽イオンになりやすい。", "反対に、右上の元素(18族を除く)は陰イオンになりやすい。"], tool: "periodic.html?z=55" },
      { id: "p14", text: "第一イオン化エネルギーが最も大きい元素はどれか。", choices: ["He", "Ne", "Na", "K"], answer: 0, choiceLayout: "grid",
        explain: ["イオン化エネルギーは貴ガスで大きく、He がすべての元素の中で最大。", "アルカリ金属の Na・K は小さく、陽イオンになりやすい。"], tool: "periodic.html?z=2" }
    ]
  });
})();

// =====================================================================
// 原子(atom、electron)
// =====================================================================
(function () {
  "use strict";
  if (typeof CHEM === "undefined") return;
  var c = CHEM.chem, rule = CHEM.rule, nuc = CHEM.nuclide;

  function atomLink(z, n, e) { return "atom.html?z=" + z + "&n=" + n + "&e=" + e; }

  CHEM.register("atom", {
    fixed: [
      { id: "a1", text: "原子核をつくっている粒子の組み合わせはどれか。", choices: ["陽子と中性子", "陽子と電子", "中性子と電子", "電子だけ"], answer: 0, choiceLayout: "grid",
        explain: ["原子の中心の原子核は、正の電荷をもつ陽子と、電荷をもたない中性子からできている。", "電子は原子核のまわりの電子殻にある。"], tool: atomLink(6, 6, 6) },
      { id: "a2", text: "原子番号が表しているものはどれか。", choices: ["陽子の数", "中性子の数", "陽子と中性子の数の和", "電子殻の数"], answer: 0, choiceLayout: "grid",
        explain: [rule("原子番号") + " = 陽子の数。元素の種類は陽子の数で決まる。", "陽子と中性子の数の和は質量数。"] },
      { id: "a3", text: "質量数が表しているものはどれか。", choices: ["陽子の数と中性子の数の和", "陽子の数", "中性子の数", "陽子の数と電子の数の和"], answer: 0,
        explain: [rule("質量数") + " = 陽子の数 + 中性子の数。", "電子の質量はとても小さいので、原子の質量はほぼ陽子と中性子で決まる。"] },
      { id: "a4", text: nuc("Na", 23, 11) + " の原子がもつ中性子の数はいくつか。", choices: ["12", "11", "23", "34"], answer: 0, choiceLayout: "grid",
        explain: ["左上の23が質量数、左下の11が原子番号(陽子の数)。", "中性子の数 = 質量数 − 原子番号 = 23 − 11 = 12。"], tool: atomLink(11, 12, 11) },
      { id: "a5", text: "同位体の説明として正しいものはどれか。",
        choices: ["原子番号が同じで、質量数が異なる原子どうし", "質量数が同じで、原子番号が異なる原子どうし", "同じ元素からなる単体で、性質が異なるものどうし", "陽子の数も中性子の数も同じ原子どうし"], answer: 0,
        explain: [rule("同位体") + "(アイソトープ)は、陽子の数が同じで中性子の数が異なる原子。", "同じ元素の単体で性質が異なるもの(ダイヤモンドと黒鉛など)は同素体。"], tool: atomLink(1, 1, 1) },
      { id: "a6", text: "同じ元素の同位体どうしで、異なるものはどれか。", choices: ["中性子の数", "陽子の数", "原子番号", "中性の原子がもつ電子の数"], answer: 0, choiceLayout: "grid",
        explain: ["同位体は陽子の数(原子番号)が同じで、中性子の数が異なる。そのため質量数も異なる。", "電子の数も同じなので、化学的な性質はほぼ同じ。"], tool: atomLink(6, 7, 6) },
      { id: "a7", text: "電子1個の質量は、陽子1個の質量のおよそ何分の1か。", choices: ["約1840分の1", "約2分の1", "約10分の1", "ほぼ同じ"], answer: 0, choiceLayout: "grid",
        explain: ["電子の質量は陽子の約1840分の1しかない。", "陽子と中性子の質量はほぼ同じ。"] },
      { id: "a8", text: "原子をつくる粒子のうち、電荷をもたないものはどれか。", choices: ["中性子", "陽子", "電子", "原子核"], answer: 0, choiceLayout: "grid",
        explain: ["陽子は正(+)、電子は負(−)の電荷をもち、中性子は電荷をもたない。", "原子核は陽子をふくむので正の電荷をもつ。"] },
      { id: "a9", text: nuc("C", 12, 6) + " と " + nuc("C", 14, 6) + " の関係を何というか。", choices: ["同位体", "同素体", "化合物", "混合物"], answer: 0, choiceLayout: "grid",
        explain: ["どちらも陽子は6個で、中性子が6個と8個。原子番号が同じで質量数が異なるので同位体。", "同素体は、ダイヤモンドと黒鉛のように同じ元素からなる単体どうしのこと。"], tool: atomLink(6, 8, 6) },
      { id: "a10", text: nuc("C", 14, 6) + " のように、放射線を出して別の原子に変わっていく同位体を何というか。",
        choices: ["放射性同位体", "安定同位体", "同素体", "貴ガス"], answer: 0, choiceLayout: "grid",
        explain: ["放射線を出して壊れていく同位体を" + rule("放射性同位体") + "(ラジオアイソトープ)という。", "¹⁴C は半減期が約5730年で、遺跡などの年代測定に使われる。"], tool: atomLink(6, 8, 6) },
      { id: "a11", text: "同素体の組み合わせはどれか。",
        choices: ["ダイヤモンドと黒鉛", "¹H と ²H", "水と水蒸気", "一酸化炭素と二酸化炭素"], answer: 0,
        explain: ["ダイヤモンドと黒鉛は、どちらも炭素だけからなる単体で性質が異なる。これが同素体。", "¹H と ²H は同位体、水と水蒸気は状態が違うだけの同じ物質、CO と " + c("CO2") + " は別の化合物。"] },
      { id: "a12", text: "原子の大きさ(直径)はおよそどのくらいか。",
        choices: ["10<sup>−10</sup> m", "10<sup>−5</sup> m", "10<sup>−15</sup> m", "10<sup>−20</sup> m"], answer: 0, choiceLayout: "grid",
        explain: ["原子の直径はおよそ 10<sup>−10</sup> m(1億分の1 cm)。", "原子核はさらに小さく、10<sup>−15</sup>〜10<sup>−14</sup> m ほどで、原子の1万〜10万分の1。"] },
      { id: "a13", text: "中性の原子で、電子の数と必ず等しいものはどれか。", choices: ["陽子の数", "中性子の数", "質量数", "電子殻の数"], answer: 0, choiceLayout: "grid",
        explain: ["陽子1個の正の電荷と電子1個の負の電荷は大きさが等しい。", "中性の原子では、陽子の数 = 電子の数 = 原子番号。"] },
      { id: "a14", text: nuc("Cl", 35, 17) + " と " + nuc("Cl", 37, 17) + " の中性子の数の組み合わせはどれか。",
        choices: ["18個と20個", "17個と17個", "35個と37個", "18個と18個"], answer: 0, choiceLayout: "grid",
        explain: ["中性子の数 = 質量数 − 原子番号。35 − 17 = 18、37 − 17 = 20。", "陽子の数はどちらも17個で、同じ塩素の同位体。"], tool: atomLink(17, 20, 17) }
    ],
    generators: [
      { id: "atom-count", label: "陽子・中性子・電子の数", make: function () {
        if (CHEM.ELEMENTS.length === 0) return null;
        var z = CHEM.randInt(1, 20), iso = CHEM.isotopesOf(z);
        if (!iso) return null;
        var a = CHEM.pick(iso.stable.concat(iso.natural)), e = CHEM.element(z), n = a - z;
        var kind = CHEM.pick(["n", "p", "e", "a"]);
        var symHtml = nuc(e.sym, a, z), ch, text, explain;
        if (kind === "n") {
          text = symHtml + " の原子がもつ中性子の数はいくつか。";
          ch = CHEM.choices4(String(n), [String(z), String(a), String(n + 1), String(n - 1), String(a + z)].filter(function (s) { return Number(s) >= 0; }));
          explain = ["左上の " + a + " が質量数、左下の " + z + " が原子番号(陽子の数)。", "中性子の数 = " + a + " − " + z + " = " + n + "。"];
        } else if (kind === "p") {
          text = symHtml + " の原子がもつ陽子の数はいくつか。";
          ch = CHEM.choices4(String(z), [String(n), String(a), String(z + 1), String(z - 1), String(a + z)].filter(function (s) { return Number(s) > 0; }));
          explain = ["陽子の数は原子番号と同じで、左下の " + z + "。", e.name + "の原子は、必ず陽子を " + z + " 個もつ。"];
        } else if (kind === "e") {
          text = symHtml + " の中性の原子がもつ電子の数はいくつか。";
          ch = CHEM.choices4(String(z), [String(n), String(a), String(z + 1), String(z - 1)].filter(function (s) { return Number(s) > 0; }));
          explain = ["中性の原子では、電子の数 = 陽子の数 = 原子番号。", "左下の " + z + " が原子番号なので、電子は " + z + " 個。"];
        } else {
          text = "陽子を " + z + " 個、中性子を " + n + " 個もつ原子の質量数はいくつか。";
          ch = CHEM.choices4(String(a), [String(z), String(n), String(a + 1), String(a - 1), String(Math.abs(n - z) || a + 2)].filter(function (s) { return Number(s) > 0; }));
          explain = ["質量数 = 陽子の数 + 中性子の数 = " + z + " + " + n + " = " + a + "。", "この原子は " + e.name + " で、" + symHtml + " と書く。"];
        }
        if (!ch) return null;
        return { text: text, choices: ch.choices, answer: 0, choiceLayout: "grid", explain: explain, tool: atomLink(z, n, z) };
      } }
    ]
  });

  CHEM.register("electron", {
    fixed: [
      { id: "e1", text: "K殻に入ることのできる電子の最大数はいくつか。", choices: ["2個", "8個", "18個", "32個"], answer: 0, choiceLayout: "grid",
        explain: ["内側から n 番目の電子殻には、最大 2n² 個の電子が入る。", "K殻(n=1)は2個、L殻は8個、M殻は18個、N殻は32個。"] },
      { id: "e2", text: "L殻に入ることのできる電子の最大数はいくつか。", choices: ["8個", "2個", "18個", "6個"], answer: 0, choiceLayout: "grid",
        explain: ["L殻は内側から2番目(n=2)なので、2 × 2² = 8個。", "K殻は2個、M殻は18個まで入る。"] },
      { id: "e3", text: "内側から n 番目の電子殻に入る電子の最大数を表す式はどれか。", choices: ["2n²", "n²", "2n", "8n"], answer: 0, choiceLayout: "grid",
        explain: ["最大数は 2n²。K殻 2、L殻 8、M殻 18、N殻 32 になる。", "n² や 2n では、L殻が8個にならない。"] },
      { id: "e4", text: "ナトリウム原子(原子番号11)の電子配置はどれか。", choices: ["K2 L8 M1", "K2 L9", "K1 L8 M2", "K2 L7 M2"], answer: 0, choiceLayout: "grid",
        explain: ["電子は内側のK殻から順に入る。K殻に2個、L殻に8個、残りの1個がM殻。", "L殻は8個までしか入らないので「K2 L9」にはならない。"], tool: "atom.html?z=11&n=12&e=11" },
      { id: "e5", text: "塩素原子(原子番号17)の価電子の数はいくつか。", choices: ["7個", "17個", "1個", "8個"], answer: 0, choiceLayout: "grid",
        explain: ["電子配置は K2 L8 M7。最外殻のM殻の7個が価電子。", "17族の元素(ハロゲン)は、どれも価電子が7個。"], tool: "atom.html?z=17&n=18&e=17" },
      { id: "e6", text: "ネオン原子(原子番号10)の価電子の数はいくつとするか。", choices: ["0個", "8個", "10個", "2個"], answer: 0, choiceLayout: "grid",
        explain: ["ネオンの電子配置は K2 L8 で、最外殻に8個あり安定している。", "貴ガスはほかの原子と結合しにくいので、価電子の数を0とする。"], tool: "atom.html?z=10&n=10&e=10" },
      { id: "e7", text: "価電子の数が2個である原子はどれか。", choices: ["Mg", "Na", "Al", "He"], answer: 0, choiceLayout: "grid",
        explain: ["Mg は K2 L8 M2 で、価電子は2個。Na は1個、Al は3個。", "He も最外殻の電子は2個だが、貴ガスなので価電子は0とする。"], tool: "atom.html?z=12&n=12&e=12" },
      { id: "e8", text: "酸素原子と価電子の数が同じ原子はどれか。", choices: ["S", "N", "F", "Ne"], answer: 0, choiceLayout: "grid",
        explain: ["O は K2 L6、S は K2 L8 M6 で、どちらも価電子6個(16族)。", "N は5個、F は7個、Ne は0個。"], tool: "atom.html?z=16&n=16&e=16" },
      { id: "e9", text: "カリウム原子(原子番号19)の電子配置はどれか。", choices: ["K2 L8 M8 N1", "K2 L8 M9", "K2 L8 M7 N2", "K2 L9 M8"], answer: 0, choiceLayout: "grid",
        explain: ["M殻は最大18個まで入るが、カリウムとカルシウムでは、M殻に8個入ったところで次のN殻に入る。", "そのため K2 L8 M8 N1 になり、価電子は1個。"], tool: "atom.html?z=19&n=20&e=19" },
      { id: "e10", text: "電子配置が K2 L8 M3 の原子はどれか。", choices: ["Al", "Na", "Mg", "Si"], answer: 0, choiceLayout: "grid",
        explain: ["電子の数は 2 + 8 + 3 = 13 個。中性の原子なので原子番号13のアルミニウム。", "Na は11、Mg は12、Si は14。"], tool: "atom.html?z=13&n=14&e=13" },
      { id: "e11", text: "価電子の数が1個の原子だけを集めた組はどれか。",
        choices: ["H、Li、Na、K", "He、Ne、Ar、Kr", "F、Cl、Br、I", "Be、Mg、Ca、Sr"], answer: 0,
        explain: ["1族の H・Li・Na・K は、どれも最外殻に電子が1個。", "18族は価電子0、17族は7、2族は2。"], tool: "atom.html?z=3&n=4&e=3" },
      { id: "e12", text: "価電子についての説明として正しいものはどれか。",
        choices: ["最外殻にある電子で、原子どうしの結合や反応に関わる。", "原子核にいちばん近い電子殻にある電子である。", "原子がもつすべての電子のことである。", "原子核の中にある電子である。"], answer: 0,
        explain: [rule("価電子") + "は最外殻の電子で、イオンのでき方や結合のしかたを決める(貴ガスは0とする)。", "電子は原子核の中にはなく、原子核のまわりの電子殻にある。"] },
      { id: "e13", text: "最外殻に電子が8個入った電子配置をもつ原子はどれか。", choices: ["Ar", "Cl", "K", "He"], answer: 0, choiceLayout: "grid",
        explain: ["Ar は K2 L8 M8 で、最外殻のM殻に8個。安定な電子配置。", "Cl は7個、K は1個、He は最外殻(K殻)に2個。"], tool: "atom.html?z=18&n=22&e=18" }
    ],
    generators: [
      { id: "config", label: "電子配置", make: function () {
        if (CHEM.ELEMENTS.length === 0) return null;
        var z = CHEM.randInt(3, 20), e = CHEM.element(z), s = CHEM.shellsOf(z);
        function fmt(arr) { return arr.map(function (k, i) { return CHEM.SHELL_NAMES[i] + k; }).join(" "); }
        var wrongs = [];
        var last = s.length - 1;
        var a1 = s.slice(); a1[last - 1]++; a1[last]--; if (a1[last] === 0) a1.pop(); wrongs.push(fmt(a1));
        var a2 = s.slice(); if (a2[last - 1] > 1) { a2[last - 1]--; a2[last]++; wrongs.push(fmt(a2)); }
        if (z >= 19) wrongs.push(fmt([2, 8, z - 10]));
        wrongs.push(CHEM.configText(z + 1), CHEM.configText(z - 1));
        var askName = Math.random() < 0.4, ch;
        if (askName) {
          ch = CHEM.choices4(e.name, [z + 1, z - 1, z + 2, z - 2].filter(function (k) { return k >= 1 && k <= 20; }).map(function (k) { return CHEM.element(k).name; }));
          if (!ch) return null;
          return { text: "電子配置が " + CHEM.configText(z) + " の原子はどれか。", choices: ch.choices, answer: 0, choiceLayout: "grid",
            explain: ["電子の数は " + s.join(" + ") + " = " + z + " 個。中性の原子なので原子番号 " + z + " の" + e.name + "(" + e.sym + ")。", "電子は K殻(2個まで)→ L殻(8個まで)→ M殻 の順に入る。"],
            tool: atomLink(z, CHEM.isotopesOf(z).main - z, z) };
        }
        ch = CHEM.choices4(CHEM.configText(z), wrongs);
        if (!ch) return null;
        return { text: e.name + "原子(原子番号 " + z + ")の電子配置はどれか。", choices: ch.choices, answer: 0, choiceLayout: "grid",
          explain: ["電子は内側のK殻から順に入る(K殻2個、L殻8個、M殻は8個入るとN殻へ)。", z + " 個の電子を順に入れると " + CHEM.configText(z) + "。"],
          tool: atomLink(z, CHEM.isotopesOf(z).main - z, z) };
      } },
      { id: "valence", label: "価電子の数", make: function () {
        if (CHEM.ELEMENTS.length === 0) return null;
        var z = CHEM.randInt(1, 20), e = CHEM.element(z), v = CHEM.valenceOf(z), s = CHEM.shellsOf(z);
        var outer = s[s.length - 1];
        var cand = [outer, 8 - v, v + 1, v - 1, v + 2, z].filter(function (k) { return k >= 0 && k <= 8; }).map(function (k) { return k + "個"; });
        var ch = CHEM.choices4(v + "個", cand.concat(["0個", "1個", "2個", "8個"]));
        if (!ch) return null;
        var lines = ["電子配置は " + CHEM.configText(z) + "。"];
        if (v === 0) lines.push("最外殻の電子は " + outer + " 個だが、" + e.name + "は貴ガスなので価電子は0とする。");
        else lines.push("最外殻の電子 " + v + " 個が価電子。");
        return { text: e.name + "原子(原子番号 " + z + ")の価電子の数はいくつか。", choices: ch.choices, answer: 0, choiceLayout: "grid",
          explain: lines, tool: atomLink(z, CHEM.isotopesOf(z).main - z, z) };
      } }
    ]
  });
})();

// =====================================================================
// 化学結合(ion)
// =====================================================================
(function () {
  "use strict";
  if (typeof CHEM === "undefined") return;
  var c = CHEM.chem, rule = CHEM.rule;

  CHEM.register("ion", {
    fixed: [
      { id: "i1", text: "ナトリウム原子 Na がナトリウムイオン " + c("Na^+") + " になるとき、どのような変化が起こるか。",
        choices: ["電子を1個失う。", "電子を1個受け取る。", "陽子を1個失う。", "陽子を1個受け取る。"], answer: 0,
        explain: ["Na(K2 L8 M1)は最外殻の電子1個を失い、Ne と同じ K2 L8 の電子配置になる。", "負の電荷をもつ電子が1個へるので、全体で +1 の電荷をもつ。陽子の数は変わらない。"], tool: "atom.html?z=11&n=12&e=10" },
      { id: "i2", text: "塩化物イオンを表す化学式はどれか。", choices: [c("Cl^-"), c("Cl^+"), c("Cl2^-"), c("Cl^2-")], answer: 0, choiceLayout: "grid",
        explain: ["塩素原子(価電子7個)は電子を1個受け取り、1価の陰イオン " + c("Cl^-") + " になる。", "電子配置は Ar と同じ K2 L8 M8 になる。"], tool: "atom.html?z=17&n=18&e=18" },
      { id: "i3", text: "酸化物イオン " + c("O^2-") + " がもつ電子の数はいくつか。", choices: ["10個", "8個", "6個", "16個"], answer: 0, choiceLayout: "grid",
        explain: ["酸素原子は電子を8個もち、電子を2個受け取って " + c("O^2-") + " になる。", "8 + 2 = 10 個で、Ne と同じ K2 L8 の電子配置。"], tool: "atom.html?z=8&n=8&e=10" },
      { id: "i4", text: c("Mg^2+") + " と同じ電子配置をもつ貴ガスの原子はどれか。", choices: ["Ne", "Ar", "He", "Kr"], answer: 0, choiceLayout: "grid",
        explain: ["Mg(K2 L8 M2)は電子を2個失って " + c("Mg^2+") + " になり、電子は10個(K2 L8)になる。", "これはネオン Ne と同じ電子配置。"], tool: "atom.html?z=12&n=12&e=10" },
      { id: "i5", text: "塩化ナトリウムの組成式はどれか。", choices: [c("NaCl"), c("Na2Cl"), c("NaCl2"), c("Na2Cl2")], answer: 0, choiceLayout: "grid",
        explain: [c("Na^+") + " と " + c("Cl^-") + " は電荷の大きさが同じなので、1 : 1 で結びつく。", "組成式は、イオンの数を最も簡単な整数比で表す。"], tool: "atom.html?z=11&n=12&e=10" },
      { id: "i6", text: "塩化カルシウムの組成式はどれか。", choices: [c("CaCl2"), c("CaCl"), c("Ca2Cl"), c("Ca2Cl3")], answer: 0, choiceLayout: "grid",
        explain: [c("Ca^2+") + " 1個の +2 と、" + c("Cl^-") + " 2個の −2 で電荷がつり合う。", "よって Ca : Cl = 1 : 2 で " + c("CaCl2") + "。"], tool: "atom.html?z=20&n=20&e=18" },
      { id: "i7", text: "酸化アルミニウムの組成式はどれか。", choices: [c("Al2O3"), c("AlO"), c("Al3O2"), c("AlO3")], answer: 0, choiceLayout: "grid",
        explain: [c("Al^3+") + " と " + c("O^2-") + " の電荷をつり合わせると、(+3)×2 = 6、(−2)×3 = −6。", "よって Al : O = 2 : 3 で " + c("Al2O3") + "。"], tool: "atom.html?z=13&n=14&e=10" },
      { id: "i8", text: "硫酸イオンを表す化学式はどれか。", choices: [c("SO4^2-"), c("SO3^2-"), c("SO4^-"), c("S^2-")], answer: 0, choiceLayout: "grid",
        explain: ["硫酸イオンは " + c("SO4^2-") + "。いくつかの原子が集まってできた多原子イオン。", c("SO3^2-") + " は亜硫酸イオン、" + c("S^2-") + " は硫化物イオン。"], tool: null },
      { id: "i9", text: c("NH4^+") + " の名前はどれか。", choices: ["アンモニウムイオン", "アンモニアイオン", "窒化物イオン", "水酸化物イオン"], answer: 0, choiceLayout: "grid",
        explain: [c("NH4^+") + " はアンモニウムイオン。陽イオンになる多原子イオン。", "水酸化物イオンは " + c("OH^-") + "、窒化物イオンは " + c("N^3-") + "。"], tool: null },
      { id: "i10", text: "イオン結合でできた物質(イオン結晶)の性質として正しいものはどれか。",
        choices: ["固体は電気を通さないが、水溶液や融かした液体は電気を通す。", "固体でもよく電気を通す。", "融点が低く、常温で気体のものが多い。", "水に溶かしても電気を通さない。"], answer: 0,
        explain: ["固体ではイオンが動けないので電気を通さない。水溶液や融解液ではイオンが動けるので電気を通す。", "イオン結晶は融点が高く、かたいがもろい。"], tool: null },
      { id: "i11", text: "2価の陽イオンになりやすい原子はどれか。", choices: ["Ca", "Na", "Al", "S"], answer: 0, choiceLayout: "grid",
        explain: ["Ca は価電子2個で、2個の電子を失って " + c("Ca^2+") + " になる。", "Na は " + c("Na^+") + "、Al は " + c("Al^3+") + "、S は陰イオンの " + c("S^2-") + " になりやすい。"], tool: "atom.html?z=20&n=20&e=18" },
      { id: "i12", text: "水酸化物イオンを表す化学式はどれか。", choices: [c("OH^-"), c("OH^+"), c("H3O^+"), c("O^2-")], answer: 0, choiceLayout: "grid",
        explain: ["水酸化物イオンは " + c("OH^-") + "。塩基の水溶液にふくまれる。", c("H3O^+") + " はオキソニウムイオン、" + c("O^2-") + " は酸化物イオン。"], tool: null },
      { id: "i13", text: "イオン化エネルギーの説明として正しいものはどれか。",
        choices: ["原子から電子1個を取り去って、1価の陽イオンにするのに必要なエネルギー", "原子が電子1個を受け取って、1価の陰イオンになるときに放出するエネルギー", "陽イオンと陰イオンが結びつくときに放出するエネルギー", "原子核から陽子1個を取り去るのに必要なエネルギー"], answer: 0,
        explain: [rule("イオン化エネルギー") + "が小さい原子ほど、陽イオンになりやすい(アルカリ金属など)。", "電子を受け取るときに放出するエネルギーは電子親和力という。"], tool: null },
      { id: "i14", text: "炭酸カルシウムの組成式はどれか。", choices: [c("CaCO3"), c("Ca(CO3)2"), c("Ca2CO3"), c("CaCO2")], answer: 0, choiceLayout: "grid",
        explain: [c("Ca^2+") + " と炭酸イオン " + c("CO3^2-") + " が 1 : 1 で結びつく。", "多原子イオンが2個以上のときだけ ( ) でくくる。例: " + c("Ca(OH)2") + "。"], tool: null }
    ]
  });
})();

// =====================================================================
// 化学反応(equation、mole)
// =====================================================================
(function () {
  "use strict";
  if (typeof CHEM === "undefined") return;
  var c = CHEM.chem, rule = CHEM.rule, q = CHEM.q;
  function eq(id, blank) { var r = CHEM.reaction(id); return CHEM.equationHtml(r, r.answer, blank); }
  function eqWith(id, coefs) { return CHEM.equationHtml(CHEM.reaction(id), coefs); }

  CHEM.register("equation", {
    fixed: [
      { id: "q1", text: "化学反応式で、係数が1のときの書き方として正しいものはどれか。",
        choices: ["1は省略して書かない。", "必ず1と書く。", "0と書く。", "( ) をつけて書く。"], answer: 0,
        explain: ["係数が1のときは省略する。例: " + eq("carbon") + "。", "係数は、それぞれの物質の分子(粒子)の数の比を表す。"], tool: "equation.html?r=carbon" },
      { id: "q2", text: "化学反応式の係数の比が表しているものはどれか。",
        choices: ["反応する物質と生じる物質の粒子の数(物質量)の比", "反応する物質と生じる物質の質量の比", "それぞれの物質の原子量の比", "それぞれの物質の密度の比"], answer: 0,
        explain: ["係数の比 = 分子などの粒子の数の比 = 物質量(mol)の比。", "気体どうしなら、同じ温度・圧力での体積の比にもなる。質量の比にはならない。"], tool: "equation.html?r=water" },
      { id: "q3", text: "化学反応の前後で、物質全体の質量の和が変わらないという法則はどれか。",
        choices: ["質量保存の法則", "定比例の法則", "倍数比例の法則", "気体反応の法則"], answer: 0,
        explain: ["反応の前後で原子の組み合わせは変わるが、原子の種類と数は変わらないので、質量の和も変わらない(" + rule("質量保存の法則") + ")。", "化学反応式で左辺と右辺の原子の数をそろえるのは、このため。"] },
      { id: "q4", text: "メタンの燃焼の化学反応式 " + eq("methane", 1) + " の □ に入る係数はどれか。", choices: ["2", "1", "3", "4"], answer: 0, choiceLayout: "grid",
        explain: ["右辺の O は " + c("CO2") + " に2個、" + c("2H2O") + " に2個で、合わせて4個。", "左辺の " + c("O2") + " は1分子に O が2個なので、係数は 4 ÷ 2 = 2。"], tool: "equation.html?r=methane" },
      { id: "q5", text: "プロパンの燃焼の化学反応式 " + eq("propane", 3) + " の □ に入る係数はどれか。", choices: ["4", "8", "3", "2"], answer: 0, choiceLayout: "grid",
        explain: ["左辺の " + c("C3H8") + " には H が8個ある。", c("H2O") + " 1分子に H は2個なので、係数は 8 ÷ 2 = 4。"], tool: "equation.html?r=propane" },
      { id: "q6", text: "マグネシウムの燃焼を表す化学反応式として正しいものはどれか。",
        choices: [eq("mgo"), eqWith("mgo", [1, 1, 1]), eqWith("mgo", [1, 1, 2]), eqWith("mgo", [2, 2, 2])], answer: 0,
        explain: ["2Mg + " + c("O2") + " → 2MgO は、左辺も右辺も Mg が2個、O が2個でそろっている。", "ほかの式は Mg か O の数が左右でそろわない。"], tool: "equation.html?r=mgo" },
      { id: "q7", text: "アンモニアの合成 " + eq("ammonia") + " で、窒素 1 mol から生じるアンモニアは何 mol か。",
        choices: ["2 mol", "1 mol", "3 mol", "4 mol"], answer: 0, choiceLayout: "grid",
        explain: ["係数の比は " + c("N2") + " : " + c("H2") + " : " + c("NH3") + " = 1 : 3 : 2 で、これが物質量の比になる。", "窒素 1 mol からアンモニアは 2 mol できる。"], tool: "equation.html?r=ammonia" },
      { id: "q8", text: "アルミニウムの燃焼の化学反応式 " + eq("al2o3", 2) + " の □ に入る係数はどれか。", choices: ["2", "1", "3", "4"], answer: 0, choiceLayout: "grid",
        explain: ["左辺は Al が4個、O が 3 × 2 = 6 個。", c("Al2O3") + " 1個に Al 2個・O 3個なので、係数を2にすると Al 4個・O 6個でそろう。"], tool: "equation.html?r=al2o3" },
      { id: "q9", text: "炭酸水素ナトリウムの熱分解 " + eq("nahco3", 0) + " の □ に入る係数はどれか。", choices: ["2", "1", "3", "4"], answer: 0, choiceLayout: "grid",
        explain: ["右辺の " + c("Na2CO3") + " に Na が2個あるので、左辺の " + c("NaHCO3") + " は2個必要。", "このとき H 2個・C 2個・O 6個も、左右でそろう。"], tool: "equation.html?r=nahco3" },
      { id: "q10", text: "亜鉛に塩酸を加えたときの反応 " + eq("znhcl") + " で発生する気体はどれか。",
        choices: ["水素", "酸素", "塩素", "二酸化炭素"], answer: 0, choiceLayout: "grid",
        explain: ["右辺の " + c("H2") + " が気体の水素。" + c("ZnCl2") + "(塩化亜鉛)は水に溶けている。", "亜鉛・鉄・マグネシウムなどの金属に塩酸を加えると、水素が発生する。"], tool: "equation.html?r=znhcl" },
      { id: "q11", text: "エタノールの完全燃焼を表す化学反応式として正しいものはどれか。",
        choices: [eq("ethanol"), eqWith("ethanol", [1, 2, 2, 3]), eqWith("ethanol", [1, 3, 2, 2]), eqWith("ethanol", [1, 3, 1, 3])], answer: 0,
        explain: [c("C2H5OH") + " の原子は C 2個・H 6個・O 1個。C と H から " + c("2CO2") + " と " + c("3H2O") + " ができる。", "右辺の O は 4 + 3 = 7 個なので、左辺の " + c("O2") + " は (7 − 1) ÷ 2 = 3。"], tool: "equation.html?r=ethanol" },
      { id: "q12", text: "炭酸カルシウムに塩酸を加えたときの反応 " + eq("caco3", 1) + " の □ に入る係数はどれか。", choices: ["2", "1", "3", "4"], answer: 0, choiceLayout: "grid",
        explain: ["右辺の " + c("CaCl2") + " に Cl が2個ある。", "左辺の HCl 1個には Cl が1個なので係数は2。H も 2 個で " + c("H2O") + " とそろう。"], tool: "equation.html?r=caco3" }
    ],
    generators: [
      { id: "blank", label: "係数を求める", make: function () {
        var r = CHEM.pick(CHEM.REACTIONS);
        var idx = [];
        r.answer.forEach(function (k, i) { if (k >= 2) idx.push(i); });
        if (idx.length === 0) return null;
        var i = CHEM.pick(idx), ans = r.answer[i];
        var ch = CHEM.choices4(String(ans), CHEM.shuffle([ans + 1, ans - 1, ans + 2, ans * 2, 1, 3]).filter(function (k) { return k >= 1; }).map(String));
        if (!ch) return null;
        var f = CHEM.speciesOf(r)[i];
        return {
          text: r.name + "の化学反応式 " + CHEM.equationHtml(r, r.answer, i) + " の □ に入る係数はどれか。",
          choices: ch.choices, answer: 0, choiceLayout: "grid",
          explain: ["□ に " + ans + " を入れると、" + CHEM.equationHtml(r, r.answer) + " となる。", "このとき左辺と右辺で、どの原子の数もそろう(" + c(f) + " の係数が " + ans + ")。"],
          tool: "equation.html?r=" + r.id
        };
      } },
      { id: "balanced", label: "正しい反応式を選ぶ", make: function () {
        var r = CHEM.pick(CHEM.REACTIONS);
        var wrongs = [];
        for (var t = 0; t < 30 && wrongs.length < 3; t++) {
          var k = r.answer.slice(), i = CHEM.randInt(0, k.length - 1);
          k[i] += Math.random() < 0.5 && k[i] > 1 ? -1 : 1;
          if (CHEM.isBalanced(r, k)) continue;
          var h = CHEM.equationHtml(r, k);
          if (wrongs.indexOf(h) < 0) wrongs.push(h);
        }
        var ch = CHEM.choices4(CHEM.equationHtml(r, r.answer), wrongs);
        if (!ch) return null;
        var counts = CHEM.countAtoms(r, r.answer).map(function (x) { return x.el + " " + x.left + "個"; }).join("、");
        return {
          text: r.name + "を表す化学反応式として正しいものはどれか。",
          choices: ch.choices, answer: 0,
          explain: ["正しい式では、左辺と右辺の原子の数がそろう(" + counts + ")。", "ほかの式は、どれかの原子の数が左右でそろわない。"],
          tool: "equation.html?r=" + r.id
        };
      } }
    ]
  });

  // ---------- 物質量 ----------
  var AVO = "6.0×10<sup>23</sup>";
  // n mol の粒子の数(6.0×10²³ × n)を「a×10^b」で
  function particles(n) {
    var v = n * 6.0, e = 23;
    while (v >= 10) { v /= 10; e++; }
    while (v < 1) { v *= 10; e--; }
    return CHEM.sci((Math.round(v * 10) / 10).toFixed(1), e) + '<span class="u">個</span>';
  }
  function mm(f) { return CHEM.molarMass(f); }
  var NS = [0.10, 0.20, 0.25, 0.50, 1.5, 2.0, 2.5, 3.0];
  var SUBST = ["H2O", "CO2", "O2", "N2", "H2", "CH4", "NH3", "NaCl", "NaOH", "CaCO3", "HCl", "Mg", "Fe", "Al", "C"];
  var GAS = [["H2", "水素"], ["O2", "酸素"], ["N2", "窒素"], ["CO2", "二酸化炭素"], ["CH4", "メタン"], ["NH3", "アンモニア"]];
  function clean1(x) { return Math.abs(x * 10 - Math.round(x * 10)) < 1e-6; }
  function mol(n) { return q(CHEM.sig2(n), "mol"); }
  // 原子量の表示(H = 1.0 のように小数1けたの値は .0 をつける)
  function awText(el) { var v = CHEM.AW[el]; return v < 10 ? v.toFixed(1) : CHEM.num(v); }
  function awGiven(f) { return CHEM.given(Object.keys(CHEM.parseFormula(f).atoms).map(function (el) { return ["原子量 " + el, awText(el)]; })); }
  // 質量の表示(10 g 未満は有効数字2けた)
  function mText(M) { return M < 10 ? M.toFixed(1) : CHEM.num(M); }
  // 問題文に出す質量(与えられた値なので、そのまま)
  function gText(x) { return x < 10 ? CHEM.sig2(x) : CHEM.num(x); }
  // 答え・選択肢の質量と体積は有効数字2けた(100以上は出さない)
  function gAns(x) { return q(CHEM.sig2(x), "g"); }
  function vol(x) { return q(CHEM.sig2(x), "L"); }
  function mmLine(f) {
    var a = CHEM.parseFormula(f).atoms;
    var parts = Object.keys(a).map(function (el) { return awText(el) + (a[el] > 1 ? " × " + a[el] : ""); });
    return c(f) + " のモル質量は " + (parts.length > 1 || a[Object.keys(a)[0]] > 1 ? parts.join(" + ") + " = " : "") + q(mText(mm(f)), "g/mol") + "。";
  }

  CHEM.register("mole", {
    fixed: [
      { id: "m1", text: "物質 1 mol にふくまれる粒子の数はどれか。", choices: [particles(1), particles(0.5), particles(2), particles(0.1)], answer: 0, choiceLayout: "grid",
        explain: ["1 mol は粒子 " + AVO + " 個の集まり。", "1 mol あたりの粒子の数 " + AVO + " /mol をアボガドロ定数という。"] },
      { id: "m2", text: "標準状態(0℃、1.013×10<sup>5</sup> Pa)で、気体 1 mol の体積はどれか。", choices: [q("22.4", "L"), q("11.2", "L"), q("1.0", "L"), q("44.8", "L")], answer: 0, choiceLayout: "grid",
        explain: ["標準状態の気体 1 mol の体積は、気体の種類によらず約 22.4 L。", "体積(L)= 物質量(mol)× 22.4 L/mol。"] },
      { id: "m3", text: "水 " + c("H2O") + " のモル質量はどれか(H = 1.0、O = 16)。", choices: [q("18", "g/mol"), q("17", "g/mol"), q("10", "g/mol"), q("34", "g/mol")], answer: 0, choiceLayout: "grid",
        explain: ["分子量は 1.0 × 2 + 16 = 18。", "モル質量は分子量に g/mol をつけたもので、18 g/mol。"] },
      { id: "m4", text: "二酸化炭素 " + c("CO2") + " 22 g の物質量はどれか(C = 12、O = 16)。", choices: [mol(0.5), mol(2), mol(0.25), mol(1)], answer: 0, choiceLayout: "grid",
        explain: [c("CO2") + " のモル質量は 12 + 16 × 2 = 44 g/mol。", "物質量 = 22 g ÷ 44 g/mol = 0.50 mol。"] },
      { id: "m5", text: "塩化ナトリウム NaCl の式量はどれか(Na = 23、Cl = 35.5)。", choices: ["58.5", "35.5", "23", "117"], answer: 0, choiceLayout: "grid",
        explain: ["イオンからなる物質は、組成式の原子量の和を" + rule("式量") + "という。", "23 + 35.5 = 58.5。"], tool: "periodic.html?z=11" },
      { id: "m6", text: "酸素 " + c("O2") + " 2.0 mol の質量はどれか(O = 16)。", choices: [q("64", "g"), q("32", "g"), q("16", "g"), q("128", "g")], answer: 0, choiceLayout: "grid",
        explain: [c("O2") + " のモル質量は 16 × 2 = 32 g/mol。", "質量 = 2.0 mol × 32 g/mol = 64 g。"], tool: "periodic.html?z=8" },
      { id: "m7", text: "標準状態で 11.2 L の二酸化炭素の物質量はどれか。", choices: [mol(0.5), mol(2), mol(0.25), mol(1)], answer: 0, choiceLayout: "grid",
        explain: ["標準状態の気体は 1 mol で 22.4 L。", "物質量 = 11.2 L ÷ 22.4 L/mol = 0.50 mol。"] },
      { id: "m8", text: "水素 " + c("H2") + " 0.50 mol にふくまれる水素分子の数はどれか。", choices: [particles(0.5), particles(1), particles(2), particles(0.25)], answer: 0, choiceLayout: "grid",
        explain: ["分子の数 = 物質量 × アボガドロ定数。", "0.50 mol × " + AVO + " /mol = 3.0×10<sup>23</sup> 個。"] },
      { id: "m9", text: "原子量の基準になっている原子はどれか。",
        choices: ["質量数12の炭素原子 ¹²C(質量を12とする)", "質量数1の水素原子 ¹H(質量を1とする)", "質量数16の酸素原子 ¹⁶O(質量を16とする)", "水分子 H₂O(質量を18とする)"], answer: 0,
        explain: ["¹²C 原子1個の質量を12とし、これを基準にほかの原子の相対質量を決める。", "元素の原子量は、同位体の相対質量を存在比で平均した値。"], tool: "atom.html?z=6&n=6&e=6" },
      { id: "m10", text: "反応 " + eq("water") + " で、水素 4.0 mol と過不足なく反応する酸素は何 mol か。",
        choices: [mol(2), mol(4), mol(1), mol(8)], answer: 0, choiceLayout: "grid",
        explain: ["係数の比から、" + c("H2") + " : " + c("O2") + " = 2 : 1 の物質量の比で反応する。", "酸素は 4.0 mol × 1/2 = 2.0 mol。"], tool: "equation.html?r=water" },
      { id: "m11", text: "メタン " + c("CH4") + " 1.0 mol を完全燃焼させたとき、生じる水の質量はどれか(H = 1.0、O = 16)。<br>" + eq("methane"),
        choices: [q("36", "g"), q("18", "g"), q("44", "g"), q("72", "g")], answer: 0, choiceLayout: "grid",
        explain: ["係数の比から、" + c("CH4") + " 1.0 mol から " + c("H2O") + " が 2.0 mol できる。", c("H2O") + " は 18 g/mol なので、2.0 mol × 18 g/mol = 36 g。"], tool: "equation.html?r=methane" },
      { id: "m12", text: "標準状態で 5.6 L の気体の質量が 8.0 g だった。この気体のモル質量はどれか。",
        choices: [q("32", "g/mol"), q("16", "g/mol"), q("64", "g/mol"), q("8.0", "g/mol")], answer: 0, choiceLayout: "grid",
        explain: ["物質量は 5.6 L ÷ 22.4 L/mol = 0.25 mol。", "モル質量 = 8.0 g ÷ 0.25 mol = 32 g/mol(酸素 " + c("O2") + " と同じ)。"] },
      { id: "m13", text: "水酸化ナトリウム NaOH 2.0 g を水に溶かして 500 mL にした水溶液のモル濃度はどれか(NaOH = 40)。",
        choices: [q("0.10", "mol/L"), q("0.050", "mol/L"), q("0.20", "mol/L"), q("1.0", "mol/L")], answer: 0, choiceLayout: "grid",
        explain: ["NaOH の物質量は 2.0 g ÷ 40 g/mol = 0.050 mol。", "モル濃度 = 0.050 mol ÷ 0.500 L = 0.10 mol/L。"] }
    ],
    generators: [
      { id: "mass-mol", label: "質量 ↔ 物質量", make: function () {
        var f = CHEM.pick(SUBST), M = mm(f), n = CHEM.pick(NS), w = M * n;
        if (!clean1(w)) return null;
        var wText = gText(w);
        if (Math.random() < 0.5) {
          var ch = CHEM.choices4(mol(n), [mol(n * 2), mol(n / 2), mol(n * 4), mol(n / 4), mol(n * 10)]);
          if (!ch) return null;
          return { text: c(f) + " " + q(wText, "g") + " の物質量はどれか。", material: awGiven(f),
            choices: ch.choices, answer: 0, choiceLayout: "grid",
            explain: [mmLine(f), "物質量 = 質量 ÷ モル質量 = " + wText + " g ÷ " + mText(M) + " g/mol = " + CHEM.sig2(n) + " mol。"] };
        }
        if (w >= 100) return null;
        var ch2 = CHEM.choices4(gAns(w), [w * 2, w / 2, M, w * 4, w / 4].filter(function (x) { return x < 100; }).map(gAns));
        if (!ch2) return null;
        return { text: c(f) + " " + mol(n) + " の質量はどれか。", material: awGiven(f),
          choices: ch2.choices, answer: 0, choiceLayout: "grid",
          explain: [mmLine(f), "質量 = 物質量 × モル質量 = " + CHEM.sig2(n) + " mol × " + mText(M) + " g/mol = " + CHEM.sig2(w) + " g。"] };
      } },
      { id: "particles", label: "物質量 ↔ 粒子の数", make: function () {
        var g = CHEM.pick(GAS.concat([["H2O", "水"]])), n = CHEM.pick(NS);
        if (Math.random() < 0.5) {
          var ch = CHEM.choices4(particles(n), [particles(n * 2), particles(n / 2), particles(n * 10), particles(n / 10), particles(n * 4)]);
          if (!ch) return null;
          return { text: g[1] + " " + c(g[0]) + " " + mol(n) + " にふくまれる分子の数はどれか。", choices: ch.choices, answer: 0, choiceLayout: "grid",
            explain: ["分子の数 = 物質量 × アボガドロ定数(" + AVO + " /mol)。", CHEM.sig2(n) + " mol × " + AVO + " /mol = " + particles(n) + "。"] };
        }
        var ch2 = CHEM.choices4(mol(n), [mol(n * 2), mol(n / 2), mol(n * 10), mol(n / 10), mol(n * 4)]);
        if (!ch2) return null;
        return { text: g[1] + "の分子 " + particles(n) + " の物質量はどれか。", choices: ch2.choices, answer: 0, choiceLayout: "grid",
          explain: ["物質量 = 粒子の数 ÷ アボガドロ定数(" + AVO + " /mol)。", particles(n) + " ÷ " + AVO + " /mol = " + CHEM.sig2(n) + " mol。"] };
      } },
      { id: "volume", label: "気体の体積", make: function () {
        var g = CHEM.pick(GAS), n = CHEM.pick([0.10, 0.25, 0.50, 1.5, 2.0, 3.0]), V = 22.4 * n, M = mm(g[0]), w = M * n;
        var kind = CHEM.pick(["n2v", "v2n", "w2v"]);
        var vw = [V * 2, V / 2, V * 4, V / 4, 22.4].filter(function (x) { return x < 100; }).map(vol);
        if (kind === "n2v") {
          var ch = CHEM.choices4(vol(V), vw);
          if (!ch) return null;
          return { text: "標準状態で、" + g[1] + " " + c(g[0]) + " " + mol(n) + " の体積はどれか。", choices: ch.choices, answer: 0, choiceLayout: "grid",
            explain: ["標準状態の気体は、種類によらず 1 mol あたり 22.4 L。", "体積 = " + CHEM.sig2(n) + " mol × 22.4 L/mol ≒ " + CHEM.sig2(V) + " L。"] };
        }
        if (kind === "v2n") {
          var ch2 = CHEM.choices4(mol(n), [mol(n * 2), mol(n / 2), mol(n * 4), mol(n / 4), mol(1)]);
          if (!ch2) return null;
          return { text: "標準状態で " + q(CHEM.num(V), "L") + " の" + g[1] + "の物質量はどれか。", choices: ch2.choices, answer: 0, choiceLayout: "grid",
            explain: ["標準状態の気体は 1 mol あたり 22.4 L。", "物質量 = " + CHEM.num(V) + " L ÷ 22.4 L/mol = " + CHEM.sig2(n) + " mol。"] };
        }
        if (!clean1(w)) return null;
        var ch3 = CHEM.choices4(vol(V), vw);
        if (!ch3) return null;
        return { text: g[1] + " " + c(g[0]) + " " + q(gText(w), "g") + " の、標準状態での体積はどれか。",
          material: awGiven(g[0]),
          choices: ch3.choices, answer: 0, choiceLayout: "grid",
          explain: [mmLine(g[0]) + " 物質量は " + gText(w) + " g ÷ " + mText(M) + " g/mol = " + CHEM.sig2(n) + " mol。", "体積 = " + CHEM.sig2(n) + " mol × 22.4 L/mol ≒ " + CHEM.sig2(V) + " L。"] };
      } }
    ]
  });
})();

// 電子工作道場: 12単元の定義・問題・教科書のカード・図(SVG)。道場(index.html)・教科書(reference.html)・計算ツール(calc.html)で共有する。
// 読み込む順番: shared/store.js → (shared/review.js →) data.js
// 復習プランナー(study/review/review-planner/index.html)もこのファイルを読み込む。グローバルは ELEC の1つだけ。
//
// ■ 単元の中身の登録(このファイルの後半)
//   ELEC.register("単元ID", { cards: [カード, …], questions: [問題, …] });
//
// ■ 教科書のカード
//   {
//     id: "ohms-law",                 // reference.html の id="card-ohms-law" になる。問題の ref からも使う(全単元で重ならない)
//     name: "オームの法則",            // 見出し
//     mono: true,                     // 省略可。見出しがコード(関数名など)のとき等幅にする
//     en: "Ohm's law",                // 英語名・記号(.term-en)
//     desc: "説明",                    // `…` で囲んだところは <code> になる
//     fig: "ohm-tri",                 // 省略可。FIGS の図の id
//     code: [ブロック, …],             // 省略可。例のコード(下の「コードのブロック」)
//     options: [["語", "説明"], …],    // 省略可。opt-list(dt は等幅)
//     notes: ["注意", …]               // 省略可。注意
//   }
//
// ■ 問題
//   {
//     id: "o01",                      // 単元の中で重ならない名前
//     level: "basic",                 // "basic"(基礎) | "std"(標準) | "pro"(応用)
//     q: "問題文",                     // `…` で囲んだところは <code> になる
//     fig: "q-series",                // 省略可。問題の図。図の数値と問題文・正解をそろえる
//     code: [ブロック, …],             // 省略可。問題のコード。____ は空欄
//     kind: "text",                   // 選択肢の種類。"text" = 説明文 / "value" = 数値・記号・命令(等幅)
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。並びはページが毎回まぜる
//     explain: "解説",                 // `…` で囲んだところは <code> になる
//     ref: "ohms-law"                 // 教科書のカードの id
//   }
//
// ■ コードのブロック(色分けはしない。等幅で表示する)
//   { cap: "スケッチ", text: "void setup() {\n}" }
//   cap は省略可(上端のラベル)。1行は36文字以内を目安にする。
//
// ■ 図
//   FIGS["id"] = "<svg …>" 。下の「図」で部品を組み合わせて作る。
//   線と文字は currentColor と theme.css の変数(クラス経由)だけを使うので、ライト・ダークのどちらでも読める。
//   クラスの意味(各ページの .fig-svg のCSSと対応): fi = 塗り / ac = アクセント色 / mu = 薄い色 / thin・thick = 線の太さ /
//   dash = 点線 / bgf = 面の色で塗る / s2f・softf = 薄い塗り / gd・bd = 正・誤の色 / t-s・t-l・t-xl = 文字の大きさ / t-m = 等幅
var ELEC = (function () {
  "use strict";

  var STATS_KEY = "electronicsBasicsStats";
  var SETTINGS_KEY = "electronicsBasicsSettings";
  var COUNT = 10;
  var KINDS = ["text", "value"];
  var BLANK = "____";

  var LEVELS = [
    { id: "basic", name: "基礎", mark: "●○○" },
    { id: "std", name: "標準", mark: "●●○" },
    { id: "pro", name: "応用", mark: "●●●" }
  ];
  var LEVEL_IDS = LEVELS.map(function (l) { return l.id; });
  var levelById = {};
  LEVELS.forEach(function (l) { levelById[l.id] = l; });
  function level(id) { return levelById.hasOwnProperty(id) ? levelById[id] : null; }

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "basics", no: "01", name: "電気の基本", short: "電気の基本", level: "basic", keys: "電圧 · 電流 · 抵抗 · 直流/交流 · m/k/M/μ" },
    { id: "ohm", no: "02", name: "オームの法則と電力", short: "オームの法則", level: "basic", keys: "V=IR · P=VI · P=I²R · 定格電力" },
    { id: "circuit", no: "03", name: "回路図と直列・並列", short: "直列・並列", level: "std", keys: "回路図記号 · GND · 合成抵抗 · 分圧" },
    { id: "resistor", no: "04", name: "抵抗器", short: "抵抗器", level: "basic", keys: "カラーコード · 許容差 · E系列 · CdS" },
    { id: "led", no: "05", name: "LEDとダイオード", short: "LED", level: "basic", keys: "極性 · Vf · 電流制限抵抗 · 逆電圧" },
    { id: "wiring", no: "06", name: "ブレッドボードと配線・はんだ付け", short: "配線・はんだ", level: "basic", keys: "ブレッドボード · 電源レール · はんだ付け" },
    { id: "tester", no: "07", name: "テスターで測る", short: "テスター", level: "basic", keys: "電圧は並列 · 電流は直列 · 導通" },
    { id: "power", no: "08", name: "電源と電池", short: "電源と電池", level: "std", keys: "直列/並列 · mAh · 3.3V/5V · レギュレータ" },
    { id: "capacitor", no: "09", name: "コンデンサー", short: "コンデンサー", level: "std", keys: "μF/pF · τ=RC · 極性 · パスコン" },
    { id: "switch", no: "10", name: "スイッチと入力", short: "スイッチ", level: "std", keys: "プルアップ · 浮いた入力 · チャタリング" },
    { id: "transistor", no: "11", name: "トランジスタとMOSFET", short: "トランジスタ", level: "pro", keys: "NPN · hFE · MOSFET · 還流ダイオード" },
    { id: "arduino", no: "12", name: "マイコン入門", short: "マイコン", level: "std", keys: "pinMode · analogRead · PWM · シリアル" }
  ];

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("ELEC.register: 登録できません: " + id);
      return;
    }
    var c = {
      cards: Array.isArray(data.cards) ? data.cards : [],
      questions: Array.isArray(data.questions) ? data.questions : []
    };
    c.cards.forEach(function (card) { if (card && card.id) cardIndex[card.id] = { card: card, unitId: id }; });
    content[id] = c;
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  function card(id) { return cardIndex.hasOwnProperty(id) ? cardIndex[id].card : null; }
  function cardUnit(id) { return cardIndex.hasOwnProperty(id) ? cardIndex[id].unitId : null; }

  // ---------- 抵抗のカラーコード(図と計算ツールで使う) ----------
  // digit: 数字(金・銀はなし) / mult: 乗数の指数(10の何乗) / tol: 許容差(%)
  var BANDS = [
    { id: "black", name: "黒", digit: 0, mult: 0, tol: null },
    { id: "brown", name: "茶", digit: 1, mult: 1, tol: 1 },
    { id: "red", name: "赤", digit: 2, mult: 2, tol: 2 },
    { id: "orange", name: "橙", digit: 3, mult: 3, tol: null },
    { id: "yellow", name: "黄", digit: 4, mult: 4, tol: null },
    { id: "green", name: "緑", digit: 5, mult: 5, tol: 0.5 },
    { id: "blue", name: "青", digit: 6, mult: 6, tol: 0.25 },
    { id: "violet", name: "紫", digit: 7, mult: 7, tol: 0.1 },
    { id: "gray", name: "灰", digit: 8, mult: 8, tol: 0.01 },
    { id: "white", name: "白", digit: 9, mult: 9, tol: null },
    { id: "gold", name: "金", digit: null, mult: -1, tol: 5 },
    { id: "silver", name: "銀", digit: null, mult: -2, tol: 10 }
  ];
  var bandById = {};
  BANDS.forEach(function (b) { bandById[b.id] = b; });
  function band(id) { return bandById.hasOwnProperty(id) ? bandById[id] : null; }

  // ---------- 図(SVG) ----------
  function f(v) { return String(Math.round(v * 10) / 10); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function cls(c) { return c ? ' class="' + c + '"' : ""; }
  function pts(a) {
    var s = [];
    for (var i = 0; i + 1 < a.length; i += 2) s.push(f(a[i]) + "," + f(a[i + 1]));
    return s.join(" ");
  }
  function line(x1, y1, x2, y2, c) {
    return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '"' + cls(c) + "/>";
  }
  function poly(a, c) { return '<polyline points="' + pts(a) + '"' + cls(c) + "/>"; }
  function polygon(a, c) { return '<polygon points="' + pts(a) + '"' + cls(c) + "/>"; }
  function rect(x, y, w, h, c, rx) {
    return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + cls(c) + "/>";
  }
  function circle(x, y, r, c) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '"' + cls(c) + "/>"; }
  function ellipse(x, y, rx, ry, c) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '"' + cls(c) + "/>"; }
  function path(d, c) { return '<path d="' + d + '"' + cls(c) + "/>"; }
  // 文字。o.a = 揃え(start | middle | end、省略で middle) / o.c = クラス
  function text(x, y, s, o) {
    o = o || {};
    return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (o.a || "middle") + '"' + cls(o.c) + ">" + esc(s) + "</text>";
  }
  function dot(x, y) { return circle(x, y, 3, "fi"); }
  // 矢じり。(x, y) が先端、ang はラジアン
  function head(x, y, ang, c, size) {
    size = size || 7;
    var a1 = ang + Math.PI - 0.45, a2 = ang + Math.PI + 0.45;
    return polygon([x, y, x + size * Math.cos(a1), y + size * Math.sin(a1), x + size * Math.cos(a2), y + size * Math.sin(a2)], "fi" + (c ? " " + c : ""));
  }
  function arrow(x1, y1, x2, y2, c) { return line(x1, y1, x2, y2, c) + head(x2, y2, Math.atan2(y2 - y1, x2 - x1), c); }
  function svg(w, h, label, body) {
    return '<svg class="fig-svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + body + "</svg>";
  }

  // 2本足の部品を (x1, y1) → (x2, y2) のあいだに描く。始点側が、電池の+・LED/ダイオードのアノード・電解コンデンサーの+
  // kind: R 抵抗 / VR 可変抵抗 / BAT 電池 / LED / D ダイオード / C コンデンサー / CE 電解コンデンサー /
  //       SW スイッチ(開) / SWC スイッチ(閉) / M モーター / V 電圧計 / A 電流計
  function part(kind, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy), c = len / 2;
    var deg = Math.atan2(dy, dx) * 180 / Math.PI;
    var a = c, b = c, g = "", out = "";
    if (kind === "R" || kind === "VR") {
      a = c - 18; b = c + 18;
      g = rect(a, -7, 36, 14, "bgf");
      if (kind === "VR") g += arrow(c - 17, 14, c + 16, -14, "thin");
    } else if (kind === "BAT") {
      a = c - 4; b = c + 4;
      g = line(a, -14, a, 14) + line(b, -7, b, 7, "thick");
    } else if (kind === "LED" || kind === "D") {
      a = c - 9; b = c + 9;
      g = polygon([a, -9, a, 9, b, 0], "fi") + line(b, -10, b, 10);
      if (kind === "LED") g += arrow(c - 3, -12, c + 5, -20, "thin") + arrow(c + 4, -12, c + 12, -20, "thin");
    } else if (kind === "C") {
      a = c - 4; b = c + 4;
      g = line(a, -12, a, 12) + line(b, -12, b, 12);
    } else if (kind === "CE") {
      a = c - 6; b = c + 4;
      g = rect(a, -12, 5, 24, "bgf") + line(b, -12, b, 12) + line(c - 17, -17, c - 11, -17, "thin") + line(c - 14, -20, c - 14, -14, "thin");
    } else if (kind === "SW" || kind === "SWC") {
      a = c - 14; b = c + 14;
      g = (kind === "SW" ? line(c - 9, -2, c + 12, -13) : line(c - 9, -3, c + 9, -3)) + circle(c - 11, 0, 3, "bgf") + circle(c + 11, 0, 3, "bgf");
    } else if (kind === "M" || kind === "V" || kind === "A") {
      var r = kind === "M" ? 15 : 13;
      a = c - r; b = c + r;
      g = circle(c, 0, r, "bgf");
      out = text((x1 + x2) / 2, (y1 + y2) / 2 + 5.5, kind, { c: "t-l" });
    }
    var leads = line(0, 0, a, 0) + line(b, 0, len, 0);
    return '<g transform="translate(' + f(x1) + " " + f(y1) + ") rotate(" + f(deg) + ')">' + leads + g + "</g>" + out;
  }
  function gnd(x, y) {
    return line(x, y, x, y + 8) + line(x - 11, y + 8, x + 11, y + 8) + line(x - 7, y + 12.5, x + 7, y + 12.5) + line(x - 3, y + 17, x + 3, y + 17);
  }
  function vcc(x, y, label) { return line(x - 11, y, x + 11, y) + text(x, y - 7, label); }
  function box(x, y, w, h, label) { return rect(x, y, w, h, "bgf", 6) + text(x + w / 2, y + h / 2 + 4.5, label); }
  // NPNトランジスタ。B (x-30, y) / C (x+6, y-30) / E (x+6, y+30)
  function npn(x, y) {
    return circle(x, y, 19) + line(x - 30, y, x - 8, y) + line(x - 8, y - 11, x - 8, y + 11, "thick") +
      line(x - 8, y - 5, x + 6, y - 14) + line(x + 6, y - 14, x + 6, y - 30) +
      line(x - 8, y + 5, x + 6, y + 14) + line(x + 6, y + 14, x + 6, y + 30) +
      head(x + 4, y + 12.7, Math.atan2(9, 14), "", 7);
  }
  // NチャネルMOSFET。G (x-30, y) / D (x+8, y-30) / S (x+8, y+30)
  function nmos(x, y) {
    return circle(x, y, 19) + line(x - 30, y, x - 11, y) + line(x - 11, y - 12, x - 11, y + 12) +
      line(x - 5, y - 14, x - 5, y - 7) + line(x - 5, y - 3.5, x - 5, y + 3.5) + line(x - 5, y + 7, x - 5, y + 14) +
      line(x - 5, y - 10.5, x + 8, y - 10.5) + line(x + 8, y - 10.5, x + 8, y - 30) +
      line(x - 5, y + 10.5, x + 8, y + 10.5) + line(x + 8, y + 10.5, x + 8, y + 30) +
      line(x - 1, y, x + 8, y) + line(x + 8, y, x + 8, y + 10.5) + head(x - 4, y, Math.PI, "", 6);
  }

  var FIGS = {};

  // 回路図記号の一覧
  (function () {
    var b = line(180, 6, 180, 400, "mu thin");
    for (var r = 1; r <= 5; r++) b += line(8, r * 62, 352, r * 62, "mu thin");
    var rows = [
      [["BAT", "電池(直流電源)"], ["R", "抵抗器"]],
      [["LED", "LED(発光ダイオード)"], ["D", "ダイオード"]],
      [["C", "コンデンサー"], ["CE", "電解コンデンサー"]],
      [["SW", "スイッチ"], ["VR", "可変抵抗器"]],
      [["M", "モーター"], ["GND", "GND(グラウンド)"]]
    ];
    rows.forEach(function (row, ri) {
      row.forEach(function (it, ci) {
        var cx = ci * 180 + 90, y = 27 + ri * 62;
        if (it[0] === "GND") b += line(cx, y - 14, cx, y - 8) + gnd(cx, y - 8);
        else b += part(it[0], cx - 42, y, cx + 42, y);
        if (it[0] === "BAT") b += text(cx - 13, y - 15, "+", { c: "t-s" });
        if (it[0] === "LED" || it[0] === "D") b += text(cx - 38, y - 7, "A", { c: "t-s mu" }) + text(cx + 38, y - 7, "K", { c: "t-s mu" });
        b += text(cx, y + 27, it[1], { c: "t-s" });
      });
    });
    var ty = 348;
    b += npn(102, ty) + text(70, ty - 5, "B", { c: "t-s mu", a: "end" }) + text(114, ty - 22, "C", { c: "t-s mu", a: "start" }) + text(114, ty + 30, "E", { c: "t-s mu", a: "start" });
    b += nmos(280, ty) + text(248, ty - 5, "G", { c: "t-s mu", a: "end" }) + text(294, ty - 22, "D", { c: "t-s mu", a: "start" }) + text(294, ty + 30, "S", { c: "t-s mu", a: "start" });
    b += text(90, 396, "NPNトランジスタ", { c: "t-s" }) + text(270, 396, "MOSFET(Nチャネル)", { c: "t-s" });
    FIGS["symbols"] = svg(360, 404, "回路図記号の一覧", b);
  })();

  FIGS["sym-led"] = svg(360, 60, "回路図記号", part("LED", 110, 34, 250, 34));
  FIGS["sym-cap-e"] = svg(360, 60, "回路図記号", part("CE", 110, 34, 250, 34));

  // 水のたとえ
  FIGS["water"] = svg(360, 176, "水のたとえ。水位の差が電圧、流れる水の量が電流、細い管が抵抗", [
    rect(21, 52, 68, 87, "water"),
    polygon([90, 119, 180, 119, 180, 124, 250, 124, 250, 119, 330, 119, 330, 133, 250, 133, 250, 128, 180, 128, 180, 133, 90, 133], "water"),
    line(21, 52, 89, 52, "water-ln"),
    poly([20, 20, 20, 140, 90, 140, 90, 134]), line(90, 20, 90, 118),
    poly([90, 118, 180, 118, 180, 123, 250, 123, 250, 118, 330, 118]),
    poly([90, 134, 180, 134, 180, 129, 250, 129, 250, 134, 330, 134]),
    line(104, 58, 104, 116, "ac thin"), head(104, 54, -Math.PI / 2, "ac"), head(104, 120, Math.PI / 2, "ac"),
    text(55, 14, "タンク = 電池", { c: "t-s" }),
    text(112, 86, "水位の差 = 電圧", { a: "start" }),
    text(215, 110, "細い管 = 抵抗"),
    arrow(256, 150, 326, 150, "ac"),
    text(290, 168, "流れる水の量 = 電流")
  ].join(""));

  // 直流と交流
  (function () {
    var s = [];
    for (var x = 0; x <= 144; x += 3) s.push(202 + x, 70 - 32 * Math.sin(2 * Math.PI * x / 72));
    FIGS["dc-ac"] = svg(360, 140, "直流は電圧が一定、交流は向きと大きさが周期的に変わる", [
      line(20, 20, 20, 112, "mu thin"), line(20, 70, 172, 70, "mu thin"),
      line(22, 38, 166, 38, "ac"),
      text(14, 74, "0", { a: "end", c: "t-s mu" }), text(172, 84, "時間", { a: "end", c: "t-s mu" }),
      text(96, 132, "直流(DC)"),
      line(200, 20, 200, 112, "mu thin"), line(200, 70, 350, 70, "mu thin"),
      poly(s, "ac"),
      text(194, 74, "0", { a: "end", c: "t-s mu" }), text(350, 84, "時間", { a: "end", c: "t-s mu" }),
      text(275, 132, "交流(AC)")
    ].join(""));
  })();

  // オームの法則の三角形
  FIGS["ohm-tri"] = svg(360, 192, "オームの法則の三角形。上がV、下がIとR", [
    polygon([180, 14, 92, 132, 268, 132]),
    line(126.3, 86, 233.7, 86), line(180, 86, 180, 132),
    text(180, 72, "V", { c: "t-xl ac" }), text(150, 121, "I", { c: "t-xl" }), text(210, 121, "R", { c: "t-xl" }),
    text(60, 162, "V = I × R", { c: "t-m" }), text(180, 162, "I = V ÷ R", { c: "t-m" }), text(300, 162, "R = V ÷ I", { c: "t-m" }),
    text(180, 184, "求めたい文字を隠す。上下に並べば割り算、横に並べばかけ算", { c: "t-s mu" })
  ].join(""));

  // 電池と抵抗1本の回路
  function loopFig(o) {
    return svg(360, 170, "電池と抵抗の回路。電池 " + o.v + "、抵抗 " + o.r + "、電流 " + o.i, [
      part("BAT", 70, 62, 70, 118),
      poly([70, 62, 70, 30, 250, 30, 250, 52]),
      part("R", 250, 52, 250, 128),
      poly([250, 128, 250, 150, 70, 150, 70, 118]),
      text(52, 95, o.v, { a: "end", c: "t-l" }), text(84, 80, "+", { c: "t-s" }),
      text(266, 95, o.r, { a: "start", c: "t-l" }),
      arrow(132, 30, 178, 30, "ac"), text(155, 20, o.i, { c: "ac" })
    ].join(""));
  }
  FIGS["q-ohm-i"] = loopFig({ v: "9V", r: "450Ω", i: "I = ?" });
  FIGS["q-ohm-r"] = loopFig({ v: "3V", r: "R = ?", i: "I = 30mA" });

  // 直列と並列(説明用)
  FIGS["series-parallel"] = svg(360, 160, "直列と並列。直列は足し算、並列は逆数の足し算", [
    text(90, 20, "直列"), text(270, 20, "並列"),
    dot(20, 70), part("R", 20, 70, 90, 70), part("R", 90, 70, 160, 70), dot(160, 70),
    text(55, 55, "R1", { c: "t-s" }), text(125, 55, "R2", { c: "t-s" }),
    text(90, 146, "R = R1 + R2", { c: "t-m" }),
    dot(198, 70), line(198, 70, 210, 70), line(210, 45, 210, 95), line(330, 45, 330, 95), line(330, 70, 342, 70), dot(342, 70),
    part("R", 210, 45, 330, 45), part("R", 210, 95, 330, 95),
    text(270, 33, "R1", { c: "t-s" }), text(270, 83, "R2", { c: "t-s" }),
    text(270, 136, "1/R = 1/R1 + 1/R2", { c: "t-m" }),
    text(270, 152, "2本なら R1×R2 ÷ (R1+R2)", { c: "t-s mu" })
  ].join(""));

  function seriesFig(vals) {
    var n = vals.length, x0 = 30, x1 = 330, step = (x1 - x0) / n, b = "";
    vals.forEach(function (v, i) {
      b += part("R", x0 + step * i, 45, x0 + step * (i + 1), 45) + text(x0 + step * (i + 0.5), 30, v);
    });
    return svg(360, 72, "抵抗の直列: " + vals.join("、"), b + dot(x0, 45) + dot(x1, 45) +
      text(x0 - 8, 49, "A", { a: "end", c: "t-s mu" }) + text(x1 + 8, 49, "B", { a: "start", c: "t-s mu" }));
  }
  function parallelFig(vals) {
    var n = vals.length, top = 32, gap = 50, bottom = top + gap * (n - 1), mid = (top + bottom) / 2, b = "";
    b += line(26, mid, 60, mid) + line(300, mid, 334, mid) + line(60, top, 60, bottom) + line(300, top, 300, bottom);
    vals.forEach(function (v, i) {
      var y = top + gap * i;
      b += part("R", 60, y, 300, y) + text(180, y - 12, v);
    });
    b += dot(60, mid) + dot(300, mid) + dot(26, mid) + dot(334, mid);
    b += text(18, mid + 4, "A", { a: "end", c: "t-s mu" }) + text(342, mid + 4, "B", { a: "start", c: "t-s mu" });
    return svg(360, bottom + 20, "抵抗の並列: " + vals.join("、"), b);
  }
  FIGS["q-series"] = seriesFig(["100Ω", "220Ω"]);
  FIGS["q-parallel"] = parallelFig(["300Ω", "600Ω"]);
  FIGS["q-mixed"] = svg(360, 104, "100Ωと、200Ωを2本並列にしたものの直列", [
    dot(20, 55), part("R", 20, 55, 130, 55), text(75, 40, "100Ω"),
    line(130, 30, 130, 80), line(290, 30, 290, 80),
    part("R", 130, 30, 290, 30), part("R", 130, 80, 290, 80),
    text(210, 18, "200Ω"), text(210, 68, "200Ω"),
    line(290, 55, 340, 55), dot(130, 55), dot(290, 55), dot(340, 55),
    text(12, 59, "A", { a: "end", c: "t-s mu" }), text(348, 59, "B", { a: "start", c: "t-s mu" })
  ].join(""));

  // 分圧回路
  function dividerFig(o) {
    return svg(360, o.formula ? 222 : 206, "分圧回路。入力 " + o.vin + "、上の抵抗 " + o.r1 + "、下の抵抗 " + o.r2, [
      dot(140, 24), text(126, 28, o.vin, { a: "end", c: "t-l" }),
      part("R", 140, 24, 140, 104), text(156, 68, o.r1, { a: "start" }),
      dot(140, 104), line(140, 104, 236, 104), dot(236, 104), text(246, 108, o.vout, { a: "start", c: "ac" }),
      part("R", 140, 104, 140, 184), text(156, 148, o.r2, { a: "start" }),
      gnd(140, 184),
      o.formula ? text(180, 216, "Vout = Vin × R2 ÷ (R1 + R2)", { c: "t-m" }) : ""
    ].join(""));
  }
  FIGS["divider"] = dividerFig({ vin: "Vin", r1: "R1", r2: "R2", vout: "Vout", formula: true });
  FIGS["q-divider1"] = dividerFig({ vin: "5V", r1: "R1 = 10kΩ", r2: "R2 = 10kΩ", vout: "Vout = ?" });
  FIGS["q-divider2"] = dividerFig({ vin: "9V", r1: "R1 = 2kΩ", r2: "R2 = 1kΩ", vout: "Vout = ?" });

  // ショートと開放
  FIGS["short-open"] = svg(360, 164, "ショートは部品を通らずに電池の+と−がつながる。開放は回路が切れている", [
    part("BAT", 60, 62, 60, 110), text(74, 80, "+", { c: "t-s" }),
    poly([60, 62, 60, 35, 140, 35, 140, 135, 60, 135, 60, 110], "bd"),
    text(106, 84, "大電流", { c: "t-s bd" }), text(106, 100, "発熱・発火", { c: "t-s bd" }),
    text(100, 156, "ショート(短絡)"),
    line(180, 20, 180, 150, "mu thin dash"),
    part("BAT", 220, 62, 220, 110), text(234, 80, "+", { c: "t-s" }),
    poly([220, 62, 220, 35, 320, 35, 320, 52]), part("R", 320, 52, 320, 116),
    poly([320, 116, 320, 135, 280, 135]), poly([256, 135, 220, 135, 220, 110]),
    circle(280, 135, 2.5, "bgf"), circle(256, 135, 2.5, "bgf"),
    text(272, 92, "電流 0", { c: "t-s mu" }),
    text(270, 156, "開放(切れている)")
  ].join(""));

  // カラーコード
  var BAND_X4 = [120, 144, 168, 236], BAND_X5 = [114, 134, 154, 174, 236];
  function bandsBody(colors) {
    var xs = colors.length === 5 ? BAND_X5 : BAND_X4, b = "";
    b += line(20, 60, 96, 60) + line(264, 60, 340, 60) + rect(95, 38, 170, 44, "rbody", 12);
    colors.forEach(function (c, i) {
      b += rect(xs[i] - 6, 38, 12, 44, "band b-" + c);
      var bd = band(c);
      b += text(xs[i], 100, bd ? bd.name : "?", { c: "t-s" });
    });
    return b;
  }
  // colors: 色の id の配列(4本か5本)。o.legend = 帯の役目の説明 / o.note = いちばん下の1行
  function bandsSvg(colors, o) {
    o = o || {};
    var xs = colors.length === 5 ? BAND_X5 : BAND_X4, b = bandsBody(colors), h = 110;
    var names = colors.map(function (c) { var bd = band(c); return bd ? bd.name : "?"; }).join(" ");
    if (o.legend) {
      var marks = ["①", "②", "③", "④", "⑤"];
      xs.forEach(function (x, i) { b += text(x, 116, marks[i], { c: "t-s mu" }); });
      b += text(180, 138, colors.length === 5 ? "①②③ 数字 ④ 乗数 ⑤ 許容差" : "①② 数字 ③ 乗数(0の数) ④ 許容差", { c: "t-s" });
      h = 146;
    }
    if (o.note) { b += text(180, h + 10, o.note, { c: "t-s ac" }); h += 22; }
    return svg(360, h, "抵抗のカラーコード: " + names, b);
  }
  FIGS["colorcode"] = bandsSvg(["brown", "black", "red", "gold"], { legend: true, note: "茶1 黒0 × 10²(赤) = 1000Ω = 1kΩ、金 = ±5%" });
  FIGS["band5-example"] = bandsSvg(["red", "red", "black", "black", "brown"], { legend: true, note: "赤2 赤2 黒0 × 10⁰(黒) = 220Ω、茶 = ±1%" });
  FIGS["q-band1"] = bandsSvg(["yellow", "violet", "red", "gold"]);
  FIGS["q-band2"] = bandsSvg(["red", "red", "brown", "gold"]);
  FIGS["q-band3"] = bandsSvg(["brown", "black", "orange", "gold"]);
  FIGS["q-band5"] = bandsSvg(["brown", "black", "black", "brown", "brown"]);
  FIGS["q-band6"] = bandsSvg(["green", "blue", "gold", "gold"]);

  // LEDの足と記号
  FIGS["led-polarity"] = svg(360, 168, "LEDの足。長い足がアノード(+)、短い足と本体のふちの平らな側がカソード(−)", [
    path("M62 92 V52 A28 28 0 0 1 118 52 V92 Z", "softf"),
    polygon([54, 92, 118, 92, 118, 100, 54, 100], "softf"),
    line(78, 100, 78, 160), line(102, 100, 102, 138),
    text(70, 140, "アノード(+)", { a: "end", c: "t-s" }), text(70, 156, "長い足", { a: "end", c: "t-s" }),
    text(112, 134, "カソード(−)", { a: "start", c: "t-s" }), text(112, 150, "短い足・平らな側", { a: "start", c: "t-s" }),
    part("LED", 222, 56, 338, 56),
    text(222, 86, "A(+)", { c: "t-s" }), text(338, 86, "K(−)", { c: "t-s" }),
    text(280, 108, "記号の向き:A → K", { c: "t-s mu" })
  ].join(""));

  // LED と抵抗と電池の回路
  function ledFig(o) {
    return svg(360, 192, "LEDの回路。電池 " + o.v + "、抵抗 " + o.r + "、" + o.led + (o.rev ? "(逆向き)" : ""), [
      part("BAT", 60, 64, 60, 136), text(42, 105, o.v, { a: "end", c: "t-l" }), text(74, 90, "+", { c: "t-s" }),
      poly([60, 64, 60, 40, 130, 40]), part("R", 130, 40, 210, 40), text(170, 24, o.r),
      poly([210, 40, 280, 40, 280, 70]),
      o.rev ? part("LED", 280, 130, 280, 70) : part("LED", 280, 70, 280, 130),
      text(304, 96, o.led, { a: "start", c: "t-s" }), text(304, 112, o.vf, { a: "start", c: "t-s" }),
      poly([280, 130, 280, 160, 60, 160, 60, 136]),
      o.i ? arrow(200, 160, 150, 160, "ac") + text(175, 182, "I = " + o.i, { c: "ac" }) : ""
    ].join(""));
  }
  FIGS["led-basic"] = ledFig({ v: "5V", r: "R = ?", led: "赤色LED", vf: "Vf 2.0V", i: "20mA" });
  FIGS["led-q9v"] = ledFig({ v: "9V", r: "R = ?", led: "赤色LED", vf: "Vf 2.0V", i: "20mA" });
  FIGS["led-q-blue"] = ledFig({ v: "5V", r: "R = ?", led: "青色LED", vf: "Vf 3.0V", i: "10mA" });
  FIGS["led-reverse"] = ledFig({ v: "5V", r: "150Ω", led: "赤色LED", vf: "向きに注意", rev: true });

  // ブレッドボード
  (function () {
    var b = rect(8, 8, 344, 248, "s2f thin mu", 10);
    var xs = [];
    for (var i = 0; i < 10; i++) xs.push(64 + i * 28);
    var top = [70, 84, 98, 112, 126], bottom = [152, 166, 180, 194, 208];
    [26, 40, 226, 240].forEach(function (y) { b += line(52, y, 328, y, "strip"); });
    xs.forEach(function (x) { b += line(x, 70, x, 126, "strip") + line(x, 152, x, 208, "strip"); });
    b += rect(48, 134, 284, 10, "bgf thin mu", 3);
    b += text(32, 31, "+", { c: "t-l ac" }) + text(32, 45, "−", { c: "t-l" }) + text(32, 231, "−", { c: "t-l" }) + text(32, 245, "+", { c: "t-l ac" });
    xs.forEach(function (x, i) {
      b += text(x, 60, String(i + 1), { c: "t-s mu" });
      [26, 40, 226, 240].concat(top, bottom).forEach(function (y) { b += circle(x, y, 2.6, "fi"); });
    });
    "abcde".split("").forEach(function (ch, i) { b += text(44, top[i] + 4, ch, { c: "t-s mu" }); });
    "fghij".split("").forEach(function (ch, i) { b += text(44, bottom[i] + 4, ch, { c: "t-s mu" }); });
    FIGS["breadboard"] = svg(360, 264, "ブレッドボードの内部のつながり。色の帯が内部でつながっている穴", b);
  })();

  // はんだ付けの良い例・悪い例
  (function () {
    var b = "";
    [60, 180, 300].forEach(function (x) { b += rect(x - 50, 100, 100, 10, "s2f"); });
    b += rect(38, 96, 44, 4, "fi ac") + path("M38 96 Q54 92 57 52 L63 52 Q66 92 82 96 Z", "solder") + line(60, 30, 60, 100);
    b += rect(158, 96, 44, 4, "fi ac") + line(180, 30, 180, 100) + circle(180, 72, 16, "solder");
    b += rect(270, 96, 20, 4, "fi ac") + rect(310, 96, 20, 4, "fi ac") + line(280, 40, 280, 100) + line(320, 40, 320, 100) + ellipse(300, 85, 34, 12, "solder");
    b += text(60, 132, "○ 富士山型", { c: "gd" }) + text(180, 132, "× イモはんだ", { c: "bd" }) + text(300, 132, "× ブリッジ", { c: "bd" });
    b += text(60, 150, "すそが広がりつやがある", { c: "t-s mu" }) + text(180, 150, "なじまず丸い", { c: "t-s mu" }) + text(300, 150, "となりとつながる", { c: "t-s mu" });
    FIGS["solder-joints"] = svg(360, 158, "はんだ付けの形。良い例は富士山型、悪い例はイモはんだとブリッジ", b);
  })();

  // テスターの当て方
  FIGS["tester"] = svg(360, 190, "テスターの当て方。電圧は部品と並列、電流は回路に直列", [
    part("BAT", 30, 70, 30, 130), text(44, 92, "+", { c: "t-s" }),
    poly([30, 70, 30, 40, 100, 40]), part("R", 100, 40, 100, 150), poly([100, 150, 30, 150, 30, 130]),
    poly([100, 62, 150, 62, 150, 72], "ac"), part("V", 150, 72, 150, 118), poly([150, 118, 150, 128, 100, 128], "ac"),
    dot(100, 62), dot(100, 128),
    text(90, 178, "電圧:部品と並列に当てる"),
    line(180, 20, 180, 170, "mu thin dash"),
    part("BAT", 210, 70, 210, 130), text(224, 92, "+", { c: "t-s" }),
    poly([210, 70, 210, 40, 250, 40], "ac"), part("A", 250, 40, 300, 40), poly([300, 40, 330, 40], "ac"),
    part("R", 330, 40, 330, 150), poly([330, 150, 210, 150, 210, 130]),
    text(272, 178, "電流:回路を切って直列に")
  ].join(""));

  // 電池の直列と並列
  FIGS["battery-sp"] = svg(360, 166, "電池の直列と並列。1.5Vを2本直列で3.0V、並列で1.5V", [
    part("BAT", 90, 30, 90, 75), part("BAT", 90, 75, 90, 120), dot(90, 30), dot(90, 120),
    text(78, 34, "+", { a: "end" }), text(78, 124, "−", { a: "end" }),
    text(106, 57, "1.5V", { a: "start", c: "t-s" }), text(106, 102, "1.5V", { a: "start", c: "t-s" }),
    text(90, 156, "直列: 3.0V"),
    part("BAT", 230, 50, 230, 110), part("BAT", 290, 50, 290, 110),
    line(230, 50, 290, 50), line(230, 110, 290, 110), line(260, 50, 260, 28), line(260, 110, 260, 132),
    dot(260, 28), dot(260, 132), dot(260, 50), dot(260, 110),
    text(248, 32, "+", { a: "end" }), text(248, 136, "−", { a: "end" }),
    text(216, 84, "1.5V", { a: "end", c: "t-s" }), text(304, 84, "1.5V", { a: "start", c: "t-s" }),
    text(260, 156, "並列: 1.5V(長持ち)")
  ].join(""));

  // 三端子レギュレータ
  FIGS["regulator"] = svg(360, 160, "三端子レギュレータ7805。入力9V、出力5V", [
    dot(24, 60), text(24, 46, "9V", { c: "t-l" }), line(24, 60, 140, 60),
    rect(140, 40, 80, 44, "bgf", 4), text(180, 59, "7805", { c: "t-m" }), text(180, 76, "レギュレータ", { c: "t-s" }),
    line(220, 60, 336, 60), dot(336, 60), text(336, 46, "5V", { c: "t-l" }),
    text(124, 54, "IN", { c: "t-s mu" }), text(238, 54, "OUT", { c: "t-s mu" }),
    line(180, 84, 180, 128), gnd(180, 128), text(188, 110, "GND", { a: "start", c: "t-s mu" }),
    part("C", 80, 60, 80, 128), gnd(80, 128), dot(80, 60), text(96, 100, "0.33μF", { a: "start", c: "t-s" }),
    part("C", 280, 60, 280, 128), gnd(280, 128), dot(280, 60), text(296, 100, "0.1μF", { a: "start", c: "t-s" })
  ].join(""));

  // RC の充電カーブ
  (function () {
    var s = [];
    for (var x = 0; x <= 300; x += 5) s.push(40 + x, 170 - 140 * (1 - Math.exp(-x / 50)));
    var b = line(40, 170, 340, 170) + head(346, 170, 0) + line(40, 170, 40, 22) + head(40, 16, -Math.PI / 2);
    b += line(40, 30, 340, 30, "mu dash thin");
    b += poly(s, "ac");
    b += poly([90, 170, 90, 81.5, 40, 81.5], "mu dash thin") + circle(90, 81.5, 3.5, "fi ac");
    b += line(290, 170, 290, 31, "mu dash thin");
    ["τ", "2τ", "3τ", "4τ", "5τ"].forEach(function (t, i) {
      var x = 90 + i * 50;
      b += line(x, 170, x, 175) + text(x, 188, t, { c: "t-s" });
    });
    b += text(34, 85, "63%", { a: "end", c: "t-s" }) + text(34, 34, "100%", { a: "end", c: "t-s" }) + text(34, 174, "0", { a: "end", c: "t-s" });
    b += text(346, 160, "時間", { a: "end", c: "t-s mu" }) + text(48, 16, "コンデンサーの電圧", { a: "start", c: "t-s mu" });
    b += text(196, 128, "最初は速く、だんだんゆっくり", { c: "t-s mu" });
    FIGS["rc-curve"] = svg(360, 196, "コンデンサーの充電カーブ。τで約63%、5τで約99%", b);
  })();

  FIGS["q-rc"] = svg(360, 160, "RC回路。電池5V、スイッチ、抵抗10kΩ、電解コンデンサー100μF", [
    part("BAT", 40, 64, 40, 116), text(18, 95, "5V", { a: "end" }), text(54, 82, "+", { c: "t-s" }),
    poly([40, 64, 40, 30, 80, 30]), part("SW", 80, 30, 150, 30), text(115, 16, "SW", { c: "t-s" }),
    part("R", 150, 30, 240, 30), text(195, 16, "10kΩ"),
    poly([240, 30, 300, 30, 300, 42]), part("CE", 300, 42, 300, 128), text(318, 90, "100μF", { a: "start" }),
    poly([300, 128, 300, 145, 40, 145, 40, 116])
  ].join(""));

  // プルアップ・プルダウン・浮いた入力
  function pullFig(mode) {
    var b = "", label;
    if (mode === "pullup") {
      label = "プルアップ回路。5Vから10kΩでD2へ、スイッチでGNDへ";
      b += vcc(120, 24, "5V") + part("R", 120, 24, 120, 100) + text(136, 66, "10kΩ", { a: "start" });
      b += part("SW", 120, 100, 120, 180) + text(136, 146, "スイッチ", { a: "start" });
    } else if (mode === "pulldown") {
      label = "プルダウン回路。5Vからスイッチを通ってD2へ、10kΩでGNDへ";
      b += vcc(120, 24, "5V") + part("SW", 120, 24, 120, 100) + text(136, 66, "スイッチ", { a: "start" });
      b += part("R", 120, 100, 120, 180) + text(136, 146, "10kΩ", { a: "start" });
    } else {
      label = "抵抗のない入力。D2とGNDのあいだにスイッチだけ";
      b += text(120, 60, "(上には何もない)", { c: "t-s mu" });
      b += part("SW", 120, 100, 120, 180) + text(136, 146, "スイッチ", { a: "start" });
      b += text(168, 88, "HIGH? LOW?", { c: "t-s bd" });
    }
    b += dot(120, 100) + line(120, 100, 214, 100) + box(214, 86, 120, 28, "Arduino D2") + gnd(120, 180);
    return svg(360, 206, label, b);
  }
  FIGS["pullup"] = pullFig("pullup");
  FIGS["pulldown"] = pullFig("pulldown");
  FIGS["floating"] = pullFig("floating");

  // チャタリング
  FIGS["chatter"] = svg(360, 154, "チャタリング。押した瞬間に信号が何度もHIGHとLOWをくり返す", [
    line(180, 26, 180, 132, "mu dash thin"), text(180, 18, "押した瞬間", { c: "t-s mu" }),
    text(18, 20, "理想", { a: "start", c: "t-s" }),
    poly([70, 32, 180, 32, 180, 64, 340, 64], "ac"),
    text(18, 84, "実際", { a: "start", c: "t-s" }),
    poly([70, 92, 180, 92, 180, 126, 185, 126, 185, 92, 190, 92, 190, 126, 194, 126, 194, 98, 198, 98, 198, 126, 340, 126], "ac"),
    text(66, 36, "HIGH", { a: "end", c: "t-s mu" }), text(66, 68, "LOW", { a: "end", c: "t-s mu" }),
    text(260, 146, "チャタリング(数ms程度)", { c: "t-s bd" })
  ].join(""));

  // トランジスタでLED
  FIGS["tr-led"] = svg(360, 226, "NPNトランジスタでLEDを点ける回路。D9からベース抵抗、コレクタ側にLEDと抵抗、エミッタはGND", [
    vcc(240, 24, "5V"), part("R", 240, 24, 240, 78), text(256, 55, "抵抗", { a: "start", c: "t-s" }),
    part("LED", 240, 78, 240, 138), text(264, 112, "LED", { a: "start", c: "t-s" }),
    line(240, 138, 240, 140), npn(234, 170), gnd(240, 200),
    text(248, 152, "C", { a: "start", c: "t-s mu" }), text(212, 160, "B", { c: "t-s mu" }), text(248, 196, "E", { a: "start", c: "t-s mu" }),
    part("R", 104, 170, 204, 170), text(154, 155, "ベース抵抗", { c: "t-s" }),
    box(14, 156, 90, 28, "Arduino D9")
  ].join(""));

  // MOSFETでモーター
  FIGS["tr-motor"] = svg(360, 226, "MOSFETでモーターを動かす回路。ゲートに100Ω、ゲートとGNDのあいだに10kΩ、モーターと並列に還流ダイオード", [
    vcc(200, 30, "6V(モーター用)"),
    part("M", 200, 30, 200, 120),
    poly([200, 30, 260, 30, 260, 40]), part("D", 260, 110, 260, 40), poly([260, 110, 260, 120, 200, 120]),
    dot(200, 120), text(272, 80, "還流ダイオード", { a: "start", c: "t-s" }),
    line(200, 120, 200, 140), nmos(192, 170), gnd(200, 200),
    text(208, 150, "D", { a: "start", c: "t-s mu" }), text(170, 160, "G", { c: "t-s mu" }), text(208, 196, "S", { a: "start", c: "t-s mu" }),
    part("R", 100, 170, 142, 170), line(142, 170, 162, 170), text(121, 156, "100Ω", { c: "t-s" }),
    dot(152, 170), part("R", 152, 170, 152, 204), text(144, 196, "10kΩ", { a: "end", c: "t-s" }), gnd(152, 204),
    box(10, 156, 90, 28, "Arduino D9")
  ].join(""));

  // analogRead の値と電圧
  FIGS["adc"] = svg(360, 112, "analogReadの値。0Vで0、5Vで1023", [
    rect(30, 40, 300, 20, "softf", 4),
    line(30, 36, 30, 64) + line(180, 36, 180, 64) + line(330, 36, 330, 64),
    text(30, 30, "0V", { c: "t-s" }), text(180, 30, "2.5V", { c: "t-s" }), text(330, 30, "5V", { c: "t-s" }),
    text(30, 80, "0", { c: "t-m" }), text(180, 80, "約512", { c: "t-m" }), text(330, 80, "1023", { c: "t-m" }),
    text(180, 104, "電圧 = 値 × 5 ÷ 1023(Arduino Uno・10ビット)", { c: "t-s ac" })
  ].join(""));

  // PWM の波形
  (function () {
    var b = text(180, 16, "ONの割合(デューティ比)と平均の電圧(5V)", { c: "t-s mu" });
    [[0.25, "1.25"], [0.5, "2.5"], [0.75, "3.75"]].forEach(function (it, r) {
      var d = it[0], hi = 34 + r * 62, lo = hi + 34, s = [84, lo];
      for (var k = 0; k < 3; k++) {
        var x0 = 84 + 80 * k;
        s.push(x0, lo, x0, hi, x0 + 80 * d, hi, x0 + 80 * d, lo, x0 + 80, lo);
      }
      b += poly(s) + line(84, lo - 34 * d, 324, lo - 34 * d, "ac dash");
      b += text(12, hi + 13, Math.round(d * 100) + "%", { a: "start" }) + text(12, hi + 30, "平均" + it[1] + "V", { a: "start", c: "t-s ac" });
    });
    FIGS["pwm"] = svg(360, 206, "PWMの波形。デューティ比25%・50%・75%で平均1.25V・2.5V・3.75V", b);
  })();

  // Arduino の D13 に LED
  FIGS["uno-led"] = svg(360, 176, "ArduinoのD13から220Ωと赤色LEDを通ってGND", [
    box(14, 46, 90, 28, "Arduino D13"), text(59, 92, "HIGH(5V)", { c: "t-s mu" }),
    line(104, 60, 130, 60), part("R", 130, 60, 230, 60), text(180, 45, "220Ω"),
    poly([230, 60, 280, 60, 280, 80]), part("LED", 280, 80, 280, 140),
    text(304, 106, "赤色LED", { a: "start", c: "t-s" }), text(304, 122, "Vf 2.0V", { a: "start", c: "t-s" }),
    line(280, 140, 280, 150), gnd(280, 150)
  ].join(""));

  // ---------- 形を確かめる。問題点の一覧を返す(なければ空の配列)。検算スクリプトもこれを使う ----------
  function blocksOf(code) {
    if (!code) return [];
    return Array.isArray(code) ? code : [code];
  }
  function checkBlocks(code, where) {
    var errs = [];
    if (code === undefined) return errs;
    var list = blocksOf(code);
    if (list.length === 0) errs.push(where + " が空");
    list.forEach(function (b, i) {
      if (!b || typeof b !== "object") { errs.push(where + "[" + i + "] がオブジェクトではない"); return; }
      if (typeof b.text !== "string" || !b.text) errs.push(where + "[" + i + "] の text が空");
      if (b.cap !== undefined && (typeof b.cap !== "string" || !b.cap)) errs.push(where + "[" + i + "] の cap が空");
    });
    return errs;
  }
  function checkFig(id) {
    if (id === undefined) return [];
    return typeof id === "string" && FIGS.hasOwnProperty(id) ? [] : ["fig の図がない: " + id];
  }
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (!level(q.level)) errs.push("level がおかしい: " + q.level);
    if (typeof q.q !== "string" || !q.q) errs.push("q がない");
    if (KINDS.indexOf(q.kind) < 0) errs.push("kind がおかしい: " + q.kind);
    errs = errs.concat(checkBlocks(q.code, "code"), checkFig(q.fig));
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || c === "") { errs.push("choices[" + i + "] が空"); return; }
        if (seen[c]) errs.push("choices に同じものがある: " + c);
        seen[c] = true;
      });
    }
    if (typeof q.explain !== "string" || !q.explain) errs.push("explain がない");
    if (!q.ref || !card(q.ref)) errs.push("ref のカードがない: " + q.ref);
    return errs;
  }
  function checkCard(c) {
    var errs = [];
    if (!c || typeof c !== "object") return ["カードがオブジェクトではない"];
    if (typeof c.id !== "string" || !/^[a-z0-9-]+$/.test(c.id)) errs.push("id がおかしい: " + c.id);
    if (typeof c.name !== "string" || !c.name) errs.push("name がない");
    if (typeof c.en !== "string" || !c.en) errs.push("en がない");
    if (typeof c.desc !== "string" || !c.desc) errs.push("desc がない");
    errs = errs.concat(checkBlocks(c.code, "code"), checkFig(c.fig));
    if (c.options !== undefined && !(Array.isArray(c.options) && c.options.every(function (o) {
      return Array.isArray(o) && o.length === 2 && typeof o[0] === "string" && typeof o[1] === "string";
    }))) errs.push("options の形がおかしい");
    if (c.notes !== undefined && !(Array.isArray(c.notes) && c.notes.every(function (s) { return typeof s === "string" && s; }))) errs.push("notes の形がおかしい");
    return errs;
  }

  // ---------- 出題 ----------
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // 単元の問題のうち、形が正しく、levels(難易度IDの配列。省略ならすべて)に入るもの
  function poolOf(unitId, levels) {
    var c = contentOf(unitId);
    if (!c) return [];
    return c.questions.filter(function (q) {
      return checkQuestion(q).length === 0 && (!levels || levels.indexOf(q.level) >= 0);
    });
  }
  function countOf(unitIds, levels) {
    return unitIds.reduce(function (sum, id) { return sum + poolOf(id, levels).length; }, 0);
  }

  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      id: q.id,
      level: q.level,
      q: q.q,
      fig: q.fig || "",
      code: blocksOf(q.code),
      kind: q.kind,
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(0),
      canonical: q.choices[0],
      explain: q.explain,
      ref: q.ref || ""
    };
  }

  // 選んだ単元から順番に1問ずつ取り、count 問になるまで続ける(問題が少ない単元は、ほかの単元で補う)
  function buildQuiz(unitIds, levels, count) {
    count = count || COUNT;
    var pools = shuffle(unitIds.filter(function (id) { return unit(id); })).map(function (id) {
      return { id: id, list: shuffle(poolOf(id, levels)) };
    }).filter(function (p) { return p.list.length > 0; });
    var out = [];
    while (out.length < count && pools.length > 0) {
      for (var i = 0; i < pools.length && out.length < count; i++) {
        out.push(prepare(pools[i].id, pools[i].list.shift()));
      }
      pools = pools.filter(function (p) { return p.list.length > 0; });
    }
    return shuffle(out);
  }

  // ---------- 保存データ(形がくずれていても動くように、数字だけを拾い直す) ----------
  // { byUnit: { 単元ID: { total, correct, sessions } }, byLevel: { basic: { total, correct }, … }, bestStreak }
  function cleanNum(v) { return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function emptyStats() { return { byUnit: {}, byLevel: {}, bestStreak: 0 }; }
  function loadStats() {
    var raw = Store.load(STATS_KEY, null);
    var s = emptyStats();
    if (!raw || typeof raw !== "object") return s;
    s.bestStreak = cleanNum(raw.bestStreak);
    if (raw.byUnit && typeof raw.byUnit === "object") {
      UNITS.forEach(function (u) {
        var r = raw.byUnit[u.id];
        if (!r || typeof r !== "object") return;
        var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total), sessions = cleanNum(r.sessions);
        if (total > 0 || sessions > 0) s.byUnit[u.id] = { total: total, correct: correct, sessions: sessions };
      });
    }
    if (raw.byLevel && typeof raw.byLevel === "object") {
      LEVELS.forEach(function (l) {
        var r = raw.byLevel[l.id];
        if (!r || typeof r !== "object") return;
        var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total);
        if (total > 0) s.byLevel[l.id] = { total: total, correct: correct };
      });
    }
    return s;
  }
  function saveStats(stats) { return Store.save(STATS_KEY, stats); }
  function clearStats() { return Store.remove(STATS_KEY); }
  // 設定。保存がなければ null。units・levels には、いまもあるIDだけを残す
  function loadSettings() {
    var raw = Store.load(SETTINGS_KEY, null);
    if (!raw || typeof raw !== "object") return null;
    var s = { units: [], levels: LEVEL_IDS.slice() };
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    if (Array.isArray(raw.levels)) {
      var lv = LEVEL_IDS.filter(function (id) { return raw.levels.indexOf(id) >= 0; });
      if (lv.length > 0) s.levels = lv;
    }
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }

  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, UNITS: UNITS, LEVELS: LEVELS, KINDS: KINDS, BLANK: BLANK,
    FIGS: FIGS, BANDS: BANDS, band: band, bandsSvg: bandsSvg,
    unit: unit, level: level, register: register, contentOf: contentOf, card: card, cardUnit: cardUnit,
    blocksOf: blocksOf,
    checkQuestion: checkQuestion, checkCard: checkCard, poolOf: poolOf, countOf: countOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();


// =====================================================================
// 01 電気の基本
// =====================================================================
ELEC.register("basics", {
  cards: [
    {
      id: "voltage", name: "電圧", en: "Voltage [V: ボルト]",
      desc: "電気を流そうとする力の大きさです。正しくは2点のあいだの電位の差で、水のたとえでは水位の差にあたります。単位は V(ボルト)です。",
      options: [
        ["1.5V", "乾電池(単3・単4など)1本"],
        ["5V", "USBの電源、Arduino Uno の動作電圧"],
        ["3.3V", "ESP32 や Raspberry Pi の信号の電圧"],
        ["100V", "日本の家庭のコンセント(交流)"]
      ],
      notes: ["電圧は「どこから見た差か」で決まります。電子工作では、ふつう GND(電池の−側など)を 0V の基準にします。"]
    },
    {
      id: "current", name: "電流", en: "Current [A: アンペア]",
      desc: "電気の流れの量で、1秒あたりにどれだけ電気が流れるかを表します。単位は A(アンペア)。電子工作では mA(ミリアンペア、1/1000 A)をよく使います。",
      options: [
        ["5〜20mA", "LED 1個を光らせる電流の目安"],
        ["数十〜数百mA", "小さなモーター"],
        ["500mA", "パソコンのUSB 2.0ポートから取れる電流の目安"]
      ],
      notes: [
        "電流の向きは「+から出て−へ戻る」と決めています。実際に動いている電子は、その逆(−から+)へ動きます。",
        "直列につないだ部品には、どこでも同じ大きさの電流が流れます。"
      ]
    },
    {
      id: "resistance", name: "抵抗", en: "Resistance [Ω: オーム]",
      desc: "電流の流れにくさです。単位は Ω(オーム)。同じ電圧なら、抵抗が大きいほど流れる電流は小さくなります。電流を決まった大きさにおさえるための部品を抵抗器と呼びます。",
      options: [
        ["ほぼ 0Ω", "銅の電線、ジャンパー線"],
        ["数百Ω〜数kΩ", "LEDの電流制限によく使う値"],
        ["とても大きい", "つながっていない所(空気)、絶縁体"]
      ]
    },
    {
      id: "water-analogy", name: "水のたとえ", en: "Water analogy",
      desc: "電気は目に見えないので、水の流れにたとえると考えやすくなります。タンクの水位の差が電圧、管を流れる水の量が電流、管の細さ(流れにくさ)が抵抗です。",
      fig: "water",
      notes: ["たとえは考えるきっかけです。細かいところ(交流やコンデンサーなど)まではそのまま当てはまりません。"]
    },
    {
      id: "dc-ac", name: "直流と交流", en: "DC (Direct Current) / AC (Alternating Current)",
      desc: "向きと大きさが変わらない電気を直流(DC)、向きと大きさが周期的に入れかわる電気を交流(AC)といいます。電池・USB・ACアダプターの出力は直流で、電子工作の回路はふつう直流で動かします。",
      fig: "dc-ac",
      options: [
        ["直流", "電池、USB、ACアダプターの出力"],
        ["交流", "家庭のコンセント 100V。東日本は50Hz、西日本は60Hz"]
      ],
      notes: ["コンセントの100Vは感電の危険があります。自作の回路に直接つながず、ACアダプターなどで安全な直流にしてから使います。"]
    },
    {
      id: "si-prefix", name: "単位の接頭辞", en: "SI prefixes: M k m μ n p",
      desc: "大きな数や小さな数を短く書くために、単位の前に記号をつけます。1kΩ = 1000Ω、20mA = 0.02A のように使います。",
      options: [
        ["M(メガ)", "× 1,000,000(10⁶)"],
        ["k(キロ)", "× 1,000(10³)"],
        ["m(ミリ)", "× 0.001(10⁻³)"],
        ["μ(マイクロ)", "× 0.000001(10⁻⁶)"],
        ["n(ナノ)", "× 10⁻⁹"],
        ["p(ピコ)", "× 10⁻¹²"]
      ],
      notes: [
        "大文字の M(メガ)と小文字の m(ミリ)は、10億倍もちがいます。書き分けに注意します。",
        "μ が打てないときは u で代用することがあります(10uF = 10μF)。"
      ]
    },
    {
      id: "circuit-loop", name: "回路は輪になる", en: "Closed circuit",
      desc: "電流は、電源の+から出て部品を通り、電源の−へ戻る輪(閉じた回路)がつながっているときだけ流れます。どこか1か所でも切れていると、電流は流れません。",
      notes: ["電池の+と−を部品を通さずに直接つなぐと、大きな電流が流れて危険です(ショート)。"]
    },
    {
      id: "conductor", name: "導体と絶縁体", en: "Conductor / Insulator",
      desc: "銅やアルミニウムなどの金属は電気を通しやすく(導体)、ゴム・プラスチック・ガラス・空気は通しにくい(絶縁体)。電線は、銅の芯をビニールなどの絶縁体で包んでいます。",
      notes: ["ぬれた手や水は電気を通しやすくなります。電源につながった回路は、ぬれた手でさわりません。"]
    }
  ],
  questions: [
    {
      id: "b01", level: "basic", q: "電圧の単位は?", kind: "value",
      choices: ["V", "A", "Ω", "W"],
      explain: "電圧は V(ボルト)です。A は電流、Ω は抵抗、W は電力の単位です。",
      ref: "voltage"
    },
    {
      id: "b02", level: "basic", q: "電流の単位は?", kind: "value",
      choices: ["A", "V", "Ω", "F"],
      explain: "電流は A(アンペア)です。F(ファラド)はコンデンサーの容量の単位です。",
      ref: "current"
    },
    {
      id: "b03", level: "basic", q: "水のたとえで「電流」にあたるのは?", kind: "text", fig: "water",
      choices: ["管を流れる水の量", "タンクの水位の差", "管の細さ", "タンクの大きさ"],
      explain: "流れる水の量が電流、水位の差が電圧、管の細さ(流れにくさ)が抵抗にあたります。",
      ref: "water-analogy"
    },
    {
      id: "b04", level: "basic", q: "水のたとえで「抵抗」にあたるのは?", kind: "text", fig: "water",
      choices: ["管の細さ(流れにくさ)", "タンクの水位の差", "管を流れる水の量", "水の温度"],
      explain: "管が細いほど水は流れにくくなります。これが抵抗です。水位の差は電圧、流れる量は電流です。",
      ref: "water-analogy"
    },
    {
      id: "b05", level: "basic", q: "1.5kΩ は何Ω?", kind: "value",
      choices: ["1500Ω", "150Ω", "15000Ω", "0.0015Ω"],
      explain: "k(キロ)は1000倍です。1.5 × 1000 = 1500Ω。0.0015Ω は m(ミリ)と取りちがえたときの値です。",
      ref: "si-prefix"
    },
    {
      id: "b06", level: "basic", q: "20mA は何A?", kind: "value",
      choices: ["0.02A", "0.2A", "2A", "0.002A"],
      explain: "m(ミリ)は 1/1000 です。20 ÷ 1000 = 0.02A。計算では mA を A に直してから使うことが多いので、慣れておきましょう。",
      ref: "si-prefix"
    },
    {
      id: "b07", level: "std", q: "4.7μF を nF で表すと?", kind: "value",
      choices: ["4700nF", "470nF", "47nF", "4.7nF"],
      explain: "1μF = 1000nF なので、4.7μF = 4.7 × 1000 = 4700nF です。",
      ref: "si-prefix"
    },
    {
      id: "b08", level: "std", q: "0.33A は何mA?", kind: "value",
      choices: ["330mA", "33mA", "3.3mA", "3300mA"],
      explain: "1A = 1000mA なので、0.33 × 1000 = 330mA です。",
      ref: "si-prefix"
    },
    {
      id: "b09", level: "basic", q: "電池やUSBの電気のように、向きが変わらない電気を何という?", kind: "text",
      choices: ["直流(DC)", "交流(AC)", "高周波", "三相交流"],
      explain: "向きと大きさが変わらないのが直流(DC)です。家庭のコンセントは交流(AC)で、向きが周期的に入れかわります。",
      ref: "dc-ac"
    },
    {
      id: "b10", level: "std", q: "日本の家庭のコンセントについて正しいのは?", kind: "text", fig: "dc-ac",
      choices: [
        "交流100Vで、周波数は東日本が50Hz・西日本が60Hz",
        "直流100Vで、全国どこでも同じ",
        "交流5Vで、USBと同じ電圧",
        "直流200Vで、周波数は全国60Hz"
      ],
      explain: "家庭のコンセントは交流100Vです。周波数はおおむね東日本50Hz・西日本60Hz。感電の危険があるので、自作の回路にはつなぎません。",
      ref: "dc-ac"
    },
    {
      id: "b11", level: "basic", q: "回路に電流が流れるための条件として正しいのは?", kind: "text",
      choices: [
        "電源の+から部品を通って電源の−へ戻る輪がつながっている",
        "電源の+側だけに部品をつなげばよい",
        "電源の電圧が10V以上ある",
        "部品が金属のケースに入っている"
      ],
      explain: "電流は閉じた輪(回路)の中だけを流れます。どこか1か所でも切れていれば流れません。",
      ref: "circuit-loop"
    },
    {
      id: "b12", level: "std", q: "1MΩ と 1mΩ の関係として正しいのは?", kind: "text",
      choices: [
        "1MΩ は 1mΩ の10億倍",
        "同じ大きさで、書き方がちがうだけ",
        "1MΩ は 1mΩ の1000倍",
        "1MΩ は 1mΩ の100万倍"
      ],
      explain: "M(メガ)は 10⁶、m(ミリ)は 10⁻³ です。10⁶ ÷ 10⁻³ = 10⁹ なので10億倍。大文字と小文字で大ちがいです。",
      ref: "si-prefix"
    },
    {
      id: "b13", level: "basic", q: "電気を通しにくい材料(絶縁体)はどれ?", kind: "text",
      choices: ["ゴムやプラスチック", "銅", "アルミニウム", "はんだ"],
      explain: "ゴムやプラスチックは絶縁体です。銅・アルミニウム・はんだ(すずの合金)は金属なので電気を通します。",
      ref: "conductor"
    },
    {
      id: "b14", level: "pro", q: "電流の向きと電子の動きについて正しいのは?", kind: "text",
      choices: [
        "電流は+から−へ流れると決めているが、電子は−から+へ動く",
        "電流も電子も+から−へ動く",
        "電流も電子も−から+へ動く",
        "直流では電子は動かない"
      ],
      explain: "電流の向きは、電子が見つかる前に「+から−」と決められました。実際に動く電子は負の電気を持つので、逆向き(−から+)に動きます。回路の計算は電流の向きで考えれば十分です。",
      ref: "current"
    },
    {
      id: "b15", level: "std", q: "電圧について正しいのは?", kind: "text",
      choices: [
        "2点のあいだの差で、ふつうはGNDを基準(0V)にして表す",
        "電線の1点だけで決まり、基準はいらない",
        "電線の中を1秒あたりに流れる電気の量",
        "部品の流れにくさを表す量"
      ],
      explain: "電圧は2点のあいだの電位の差です。「この点は5V」というときは、GNDを0Vとしたときの差を言っています。流れる量は電流、流れにくさは抵抗です。",
      ref: "voltage"
    }
  ]
});


// =====================================================================
// 02 オームの法則と電力
// =====================================================================
ELEC.register("ohm", {
  cards: [
    {
      id: "ohms-law", name: "オームの法則", en: "Ohm's law: V = I × R",
      desc: "抵抗にかかる電圧 V は、流れる電流 I と抵抗 R のかけ算になります。3つのうち2つがわかれば、残りの1つを計算できます。",
      fig: "ohm-tri",
      options: [
        ["V = I × R", "電圧を求める"],
        ["I = V ÷ R", "電流を求める"],
        ["R = V ÷ I", "抵抗を求める"]
      ],
      notes: ["計算の前に単位をそろえます。mA は A に、kΩ は Ω に直すのが基本です(20mA = 0.02A)。"]
    },
    {
      id: "power", name: "電力", en: "Power [W: ワット]",
      desc: "電気が1秒あたりにする仕事の量です。電圧と電流のかけ算で求めます。抵抗では、電力はすべて熱になります。",
      options: [
        ["P = V × I", "電圧と電流から"],
        ["P = I² × R", "電流と抵抗から"],
        ["P = V² ÷ R", "電圧と抵抗から"]
      ],
      notes: ["P = I² × R なので、同じ抵抗で電流が2倍になると、電力(熱)は4倍になります。"]
    },
    {
      id: "power-rating", name: "定格電力", en: "Power rating",
      desc: "その抵抗器が安全に消費できる電力の上限です。電子工作でよく使うカーボン抵抗は 1/4W(0.25W)。計算した電力が定格の半分以下になるように、余裕を持って選びます。",
      options: [
        ["1/6W・1/4W", "小型のカーボン抵抗。LEDの電流制限など"],
        ["1/2W・1W", "少し大きな電流を流すところ"],
        ["数W以上", "セメント抵抗など。大きく、熱くなる"]
      ],
      notes: ["定格を超えると、抵抗器が熱くなって変色したり、焦げたり、最悪は燃えたりします。"]
    },
    {
      id: "heat", name: "ジュール熱", en: "Joule heating",
      desc: "抵抗に電流が流れると、電力はすべて熱になります。熱くなること自体は正常ですが、触れないほど熱いなら定格電力や回路の見直しが必要です。",
      notes: ["電源を入れたばかりの回路で、部品が急に熱くなったり、においがしたりしたら、すぐに電源を切ります。"]
    },
    {
      id: "energy", name: "電力量", en: "Energy [Wh: ワット時]",
      desc: "電力 × 時間 で表す、使った(ためた)電気の量です。1W を1時間使うと 1Wh。電池の容量は、電圧 × mAh で Wh に直せます。",
      options: [
        ["1Wh", "1W を1時間"],
        ["1.5V × 2000mAh", "= 1.5V × 2Ah = 3Wh"]
      ]
    },
    {
      id: "unit-calc", name: "単位の組み合わせ", en: "Units: V, mA, kΩ",
      desc: "mA と kΩ を組み合わせると、10の何乗かが打ち消し合って計算が楽になります。慣れないうちは、A と Ω に直してから計算しても同じ答えになります。",
      options: [
        ["V ÷ kΩ", "= mA(5V ÷ 1kΩ = 5mA)"],
        ["V ÷ mA", "= kΩ(3V ÷ 20mA = 0.15kΩ = 150Ω)"],
        ["mA × kΩ", "= V(2mA × 1kΩ = 2V)"],
        ["V × mA", "= mW(5V × 20mA = 100mW)"]
      ]
    },
    {
      id: "proportional", name: "比例の感覚", en: "Proportionality",
      desc: "オームの法則と電力の式から、どれかを何倍かにしたとき、ほかがどう変わるかがわかります。",
      options: [
        ["R が同じで V を2倍", "I は2倍、P は4倍"],
        ["V が同じで R を2倍", "I は1/2倍、P は1/2倍"],
        ["R が同じで I を2倍", "P は4倍(P = I²R)"]
      ]
    }
  ],
  questions: [
    {
      id: "o01", level: "basic", q: "図の回路で、流れる電流 I は?", kind: "value", fig: "q-ohm-i",
      choices: ["20mA", "50mA", "2mA", "4.05A"],
      explain: "I = V ÷ R = 9V ÷ 450Ω = 0.02A = 20mA。50mA は 450 ÷ 9(割る順番の逆)、4.05A は 9 × 450(かけ算)にしたときの値です。",
      ref: "ohms-law"
    },
    {
      id: "o02", level: "basic", q: "5V の電源で、抵抗に 10mA を流したい。抵抗は何Ω?", kind: "value",
      choices: ["500Ω", "50Ω", "5kΩ", "0.05Ω"],
      explain: "R = V ÷ I = 5V ÷ 0.01A = 500Ω。10mA を 0.1A とすると 50Ω、0.001A とすると 5kΩ になってしまいます。0.05Ω は 5 × 0.01(かけ算)です。",
      ref: "ohms-law"
    },
    {
      id: "o03", level: "basic", q: "1kΩ の抵抗に 3mA が流れている。抵抗の両端の電圧は?", kind: "value",
      choices: ["3V", "0.3V", "30V", "3000V"],
      explain: "V = I × R = 0.003A × 1000Ω = 3V。mA × kΩ = V なので、3 × 1 = 3V とすぐに出せます。",
      ref: "unit-calc"
    },
    {
      id: "o04", level: "basic", q: "電力 P を電圧 V と電流 I から求める式は?", kind: "value",
      choices: ["P = V × I", "P = V ÷ I", "P = I ÷ V", "P = V + I"],
      explain: "電力は電圧と電流のかけ算です。V ÷ I は抵抗になります。",
      ref: "power"
    },
    {
      id: "o05", level: "std", q: "12V で 0.5A が流れる部品の消費電力は?", kind: "value",
      choices: ["6W", "24W", "12.5W", "約0.04W"],
      explain: "P = V × I = 12 × 0.5 = 6W。24W は 12 ÷ 0.5、12.5W は足し算、約0.04W は 0.5 ÷ 12 にしたときの値です。",
      ref: "power"
    },
    {
      id: "o06", level: "std", q: "100Ω の抵抗に 50mA が流れている。抵抗の消費電力は?", kind: "value",
      choices: ["0.25W", "5W", "2.5W", "0.025W"],
      explain: "P = I² × R = 0.05 × 0.05 × 100 = 0.25W。5W は I × R(これは電圧 5V)をそのまま電力としたときの値です。0.25W はちょうど 1/4W 抵抗の定格なので、1/4W では余裕がありません。",
      ref: "power"
    },
    {
      id: "o07", level: "pro", q: "100Ω の抵抗に 9V をかける。消費電力と、1/4W 抵抗が使えるかの組み合わせは?", kind: "text",
      choices: [
        "0.81W・使えない(定格を超える)",
        "0.09W・使える",
        "0.81W・使える",
        "8.1W・使えない"
      ],
      explain: "P = V² ÷ R = 81 ÷ 100 = 0.81W。1/4W(0.25W)を大きく超えるので使えません。余裕を見て 2W 程度の抵抗にするか、回路を見直します。0.09W は 9 ÷ 100(これは電流 0.09A)です。",
      ref: "power-rating"
    },
    {
      id: "o08", level: "basic", q: "抵抗器の「定格電力」とは?", kind: "text",
      choices: [
        "その抵抗器が安全に消費できる電力の上限",
        "抵抗値の誤差の範囲",
        "かけてよい電圧の最小値",
        "流れる電流の平均"
      ],
      explain: "定格電力は消費してよい電力の上限です。誤差の範囲は許容差といいます。",
      ref: "power-rating"
    },
    {
      id: "o09", level: "std", q: "抵抗の値はそのままで、かける電圧を2倍にした。消費電力は何倍になる?", kind: "value",
      choices: ["4倍", "2倍", "1倍(変わらない)", "1/2倍"],
      explain: "電圧が2倍になると電流も2倍。P = V × I なので 2 × 2 = 4倍です(P = V² ÷ R からもわかります)。",
      ref: "proportional"
    },
    {
      id: "o10", level: "std", q: "電圧はそのままで、抵抗を2倍にした。流れる電流は何倍になる?", kind: "value",
      choices: ["1/2倍", "2倍", "4倍", "1/4倍"],
      explain: "I = V ÷ R なので、R が2倍になると I は半分になります。",
      ref: "proportional"
    },
    {
      id: "o11", level: "basic", q: "5V ÷ 1kΩ で流れる電流は?", kind: "value",
      choices: ["5mA", "5A", "0.5mA", "50mA"],
      explain: "5V ÷ 1000Ω = 0.005A = 5mA。V ÷ kΩ = mA と覚えておくと速く計算できます。",
      ref: "unit-calc"
    },
    {
      id: "o12", level: "pro", q: "1.5V・2000mAh の電池にたくわえられている電力量は?", kind: "value",
      choices: ["3Wh", "3000Wh", "約1.33Wh", "2Wh"],
      explain: "2000mAh = 2Ah。1.5V × 2Ah = 3Wh です。3000Wh は mAh を Ah に直し忘れたとき、約1.33Wh は 2 ÷ 1.5 にしたときの値です。",
      ref: "energy"
    },
    {
      id: "o13", level: "std", q: "図の回路で、抵抗 R は何Ω?", kind: "value", fig: "q-ohm-r",
      choices: ["100Ω", "0.1Ω", "90Ω", "10Ω"],
      explain: "R = V ÷ I = 3V ÷ 0.03A = 100Ω。0.1Ω は 30mA を A に直さずに 3 ÷ 30 としたとき、90Ω は 3 × 30 としたときの値です。",
      ref: "ohms-law"
    },
    {
      id: "o14", level: "pro", q: "回路の抵抗器が、触れないほど熱くなっていた。もっとも適切な対処は?", kind: "text",
      choices: [
        "電源を切り、消費電力を計算して、定格電力の大きい抵抗器にするか回路を見直す",
        "抵抗は熱くなるのが仕事なので、そのまま使い続ける",
        "抵抗値を半分の抵抗器に交換する",
        "冷却スプレーで冷やしながら使う"
      ],
      explain: "定格を超えている可能性があります。電源を切り、P = I²R などで計算し直して、余裕のある定格の抵抗器にするか回路を見直します。同じ電圧で抵抗値を半分にすると、電流が増えて発熱はさらに大きくなります。",
      ref: "heat"
    },
    {
      id: "o15", level: "std", q: "5V の回路で 0.2W を消費している部品がある。流れている電流は?", kind: "value",
      choices: ["40mA", "1A", "25mA", "4mA"],
      explain: "I = P ÷ V = 0.2 ÷ 5 = 0.04A = 40mA。1A は 5 × 0.2、25mA は 5 ÷ 0.2(= 25)を mA と読んだときの値です。",
      ref: "power"
    }
  ]
});


// =====================================================================
// 03 回路図と直列・並列
// =====================================================================
ELEC.register("circuit", {
  cards: [
    {
      id: "schematic", name: "回路図記号", en: "Schematic symbols",
      desc: "回路図は、部品を記号で、電線を線で表した図です。線が交わる所に黒丸(●)があればつながっていて、なければつながっていません(立体交差)。日本の規格(JIS)では、抵抗器は長方形で描きます。",
      fig: "symbols",
      notes: [
        "古い本や海外の回路図では、抵抗器をギザギザ線で描くことがあります。意味は同じです。",
        "電池の記号は、長い線が+、短い線が−です。"
      ]
    },
    {
      id: "gnd", name: "GND(グラウンド)", en: "Ground",
      desc: "回路の電圧の基準(0V)になる点です。回路図ではGNDの記号をいくつ描いても、それらはすべてつながっています。ふつうは電池や電源の−側をGNDにします。",
      notes: ["電源を2つ使うとき(Arduino とモーター用の電池など)は、GNDどうしをつないで基準をそろえます。"]
    },
    {
      id: "series", name: "直列", en: "Series connection",
      desc: "部品を一本道につなぐつなぎ方です。どの部品にも同じ電流が流れます。合成抵抗は足し算で、電源の電圧は抵抗の大きさに比例して分かれます。",
      fig: "series-parallel",
      options: [
        ["合成抵抗", "R = R1 + R2 + …"],
        ["電流", "どこも同じ"],
        ["電圧", "抵抗の大きさに比例して分かれる"]
      ]
    },
    {
      id: "parallel", name: "並列", en: "Parallel connection",
      desc: "部品を枝分かれさせて、両端を共通にするつなぎ方です。どの枝にも同じ電圧がかかります。合成抵抗は、いちばん小さい抵抗よりもさらに小さくなります。",
      options: [
        ["合成抵抗", "1/R = 1/R1 + 1/R2 + …"],
        ["2本のとき", "R = R1 × R2 ÷ (R1 + R2)(和分の積)"],
        ["同じ値を n 本", "R ÷ n"],
        ["電圧", "どの枝も同じ"]
      ]
    },
    {
      id: "divider", name: "分圧回路", en: "Voltage divider",
      desc: "抵抗を2本直列にして、そのあいだから電源より低い電圧を取り出す回路です。センサーの値を電圧にして読むときや、信号の電圧を下げるときに使います。",
      fig: "divider",
      notes: [
        "出力から電流をたくさん取ると、計算どおりの電圧になりません。モーターなどの電源を作る用途には使えません。",
        "R1 と R2 が同じ値なら、出力はちょうど半分です。"
      ]
    },
    {
      id: "short", name: "ショート(短絡)", en: "Short circuit",
      desc: "部品を通らずに、電源の+と−が電線などで直接つながってしまうことです。抵抗がほぼ0なので大きな電流が流れ、電池や電線が熱くなり、発火することもあります。",
      fig: "short-open",
      notes: ["ブレッドボードの配線まちがい、はんだのブリッジ、むき出しの電線どうしの接触がよくある原因です。電源を入れる前に確かめます。"]
    },
    {
      id: "open", name: "開放(オープン)", en: "Open circuit",
      desc: "回路がどこかで切れている状態です。電流は流れません。断線、差しこみ不足、はんだ付けの不良などで起こります。",
      notes: ["切れている所の両端には、電源の電圧がそのままかかります。テスターで電圧を当てていくと、切れている所を探せます。"]
    }
  ],
  questions: [
    {
      id: "c01", level: "basic", q: "図の A–B 間の合成抵抗は?", kind: "value", fig: "q-series",
      choices: ["320Ω", "約69Ω", "120Ω", "22000Ω"],
      explain: "直列は足し算です。100 + 220 = 320Ω。約69Ω は並列として計算した値(100 × 220 ÷ 320 = 68.75)です。",
      ref: "series"
    },
    {
      id: "c02", level: "std", q: "図の A–B 間の合成抵抗は?", kind: "value", fig: "q-parallel",
      choices: ["200Ω", "900Ω", "450Ω", "300Ω"],
      explain: "並列2本は和分の積です。300 × 600 ÷ (300 + 600) = 180000 ÷ 900 = 200Ω。900Ω は直列として足し算したときの値です。並列の合成抵抗は、小さいほう(300Ω)よりさらに小さくなります。",
      ref: "parallel"
    },
    {
      id: "c03", level: "basic", q: "1kΩ の抵抗を2本、並列につないだときの合成抵抗は?", kind: "value",
      choices: ["500Ω", "2kΩ", "1kΩ", "250Ω"],
      explain: "同じ値を2本並列にすると半分になります。1kΩ ÷ 2 = 500Ω。2kΩ は直列のときの値です。",
      ref: "parallel"
    },
    {
      id: "c04", level: "std", q: "図の A–B 間の合成抵抗は?", kind: "value", fig: "q-mixed",
      choices: ["200Ω", "500Ω", "300Ω", "50Ω"],
      explain: "まず並列部分: 200Ω が2本なので 100Ω。それに 100Ω が直列なので 100 + 100 = 200Ω。500Ω は全部を直列、50Ω は全部を並列として計算した値です。",
      ref: "parallel"
    },
    {
      id: "c05", level: "std", q: "図の分圧回路の出力 Vout は?", kind: "value", fig: "q-divider1",
      choices: ["2.5V", "5V", "1.25V", "0V"],
      explain: "Vout = 5 × 10 ÷ (10 + 10) = 2.5V。R1 と R2 が同じ値なら、ちょうど半分になります。",
      ref: "divider"
    },
    {
      id: "c06", level: "std", q: "図の分圧回路の出力 Vout は?", kind: "value", fig: "q-divider2",
      choices: ["3V", "6V", "4.5V", "1.5V"],
      explain: "Vout = Vin × R2 ÷ (R1 + R2) = 9 × 1 ÷ (2 + 1) = 3V。6V は R1 と R2 を入れかえて計算した値(R1 の両端の電圧)です。",
      ref: "divider"
    },
    {
      id: "c07", level: "basic", q: "回路図にGNDの記号が何か所も描かれている。これらの関係は?", kind: "text",
      choices: [
        "すべて互いにつながっている(同じ0Vの点)",
        "それぞれ別の電池の−につながっている",
        "つながっていない(見やすくするための飾り)",
        "その場所で電流が止まる"
      ],
      explain: "GNDの記号は、線を引くかわりに「ここはGNDにつながる」と示すものです。すべて同じ点としてつながっています。",
      ref: "gnd"
    },
    {
      id: "c08", level: "basic", q: "直列回路を流れる電流について正しいのは?", kind: "text",
      choices: [
        "どの部品にも同じ大きさの電流が流れる",
        "電源から遠い部品ほど電流が小さくなる",
        "抵抗の大きい部品ほど電流が大きい",
        "電源に近い部品だけに流れる"
      ],
      explain: "直列は一本道なので、途中で電流が増えたり減ったりしません。どこで測っても同じ電流です。",
      ref: "series"
    },
    {
      id: "c09", level: "basic", q: "並列につないだ部品にかかる電圧について正しいのは?", kind: "text",
      choices: [
        "どの枝にも同じ電圧がかかる",
        "抵抗の大きい枝ほど電圧が高い",
        "電源の電圧を枝の数で割った値になる",
        "最後の枝だけに電圧がかかる"
      ],
      explain: "並列の枝は両端が共通なので、どの枝にも同じ電圧がかかります。枝ごとにちがうのは電流です。",
      ref: "parallel"
    },
    {
      id: "c10", level: "basic", q: "電池の+と−を、電線だけで直接つなぐとどうなる?", kind: "text", fig: "short-open",
      choices: [
        "ショートして大電流が流れ、発熱・発火のおそれがある",
        "開放なので電流は流れない",
        "電池の電圧が2倍になる",
        "電池が充電される"
      ],
      explain: "部品を通らないので抵抗がほぼ0になり、大きな電流が流れます(ショート)。電池も電線も熱くなり危険です。",
      ref: "short"
    },
    {
      id: "c11", level: "std", q: "回路図で、2本の線が交わる所に黒丸(●)がない。この2本の線は?", kind: "text",
      choices: [
        "つながっていない(立体交差)",
        "つながっている",
        "その点がGNDになる",
        "その点にスイッチがある"
      ],
      explain: "つながっている交点には黒丸を描きます。黒丸がなければ、上を通りすぎているだけでつながっていません。",
      ref: "schematic"
    },
    {
      id: "c12", level: "pro", q: "10kΩ の抵抗を3本、並列につないだときの合成抵抗は?", kind: "value",
      choices: ["約3.3kΩ", "30kΩ", "約6.7kΩ", "10kΩ"],
      explain: "同じ値を n 本並列にすると R ÷ n。10kΩ ÷ 3 ≒ 3.33kΩ です。30kΩ は直列のときの値です。",
      ref: "parallel"
    },
    {
      id: "c13", level: "basic", q: "この回路図記号の部品は?", kind: "text", fig: "sym-led",
      choices: ["LED(発光ダイオード)", "ダイオード", "コンデンサー", "トランジスタ"],
      explain: "ダイオードの記号(三角と縦線)に、光が出ることを表す2本の矢印がついているのがLEDです。矢印がなければふつうのダイオードです。",
      ref: "schematic"
    },
    {
      id: "c14", level: "std", q: "この回路図記号の部品は?", kind: "text", fig: "sym-cap-e",
      choices: ["電解コンデンサー", "セラミックコンデンサー", "電池", "スイッチ"],
      explain: "2枚の板のうち片方が白い長方形で、「+」の印があるのは極性のある電解コンデンサーです。極性のないコンデンサーは、同じ長さの2本線で描きます。電池は長い線と短い線です。",
      ref: "schematic"
    },
    {
      id: "c15", level: "pro", q: "5V を分圧して約3.3V を作りたい。R1(上・5V側)と R2(下・GND側)の組み合わせとして正しいのは?", kind: "text", fig: "divider",
      choices: [
        "R1 = 1kΩ、R2 = 2kΩ",
        "R1 = 2kΩ、R2 = 1kΩ",
        "R1 = 1kΩ、R2 = 1kΩ",
        "R1 = 3.3kΩ、R2 = 5kΩ"
      ],
      explain: "Vout = 5 × R2 ÷ (R1 + R2)。R1 = 1kΩ、R2 = 2kΩ なら 5 × 2 ÷ 3 ≒ 3.33V。逆にすると約1.67V、同じ値だと2.5V、3.3kΩ と 5kΩ だと 5 × 5 ÷ 8.3 ≒ 3.0V です。",
      ref: "divider"
    }
  ]
});


// =====================================================================
// 04 抵抗器
// =====================================================================
ELEC.register("resistor", {
  cards: [
    {
      id: "resistor-part", name: "抵抗器", en: "Resistor",
      desc: "電流を決まった大きさにおさえたり、電圧を分けたりする部品です。極性はないので、どちら向きにつないでもかまいません。",
      options: [
        ["カーボン抵抗", "安くて定番。許容差 ±5%(金の帯)。ベージュの本体が多い"],
        ["金属皮膜抵抗", "精度が高い(±1% など)。青い本体に5本帯が多い"],
        ["チップ抵抗", "基板の表面に付ける小さな抵抗。数字で値を書く"]
      ]
    },
    {
      id: "colorcode", name: "カラーコード", en: "Resistor color code",
      desc: "抵抗器の値は、本体に巻かれた色の帯で表します。色ごとに数字が決まっていて、許容差の帯(金や茶)が右にくる向きで、左から読みます。",
      fig: "colorcode",
      options: [
        ["0〜4", "黒 0・茶 1・赤 2・橙 3・黄 4"],
        ["5〜9", "緑 5・青 6・紫 7・灰 8・白 9"],
        ["金・銀", "乗数では ×0.1・×0.01、許容差では ±5%・±10%"]
      ],
      notes: ["色は虹の順(赤 橙 黄 緑 青 紫)に、0 の黒と 1 の茶を前に、8・9 の灰・白を後ろにつけると覚えやすくなります。"]
    },
    {
      id: "band4", name: "4本帯の読み方", en: "4-band code",
      desc: "1本目と2本目が数字、3本目が乗数(数字のあとにつける0の数)、4本目が許容差です。例: 茶 黒 赤 金 → 1・0 のあとに 0 を2つ = 1000Ω = 1kΩ、±5%。",
      options: [
        ["① ②", "数字(2けた)"],
        ["③", "乗数。黒 ×1、茶 ×10、赤 ×100、橙 ×1k、黄 ×10k、金 ×0.1"],
        ["④", "許容差。金 ±5%、銀 ±10%"]
      ],
      notes: ["許容差の帯は、ほかの帯から少し離れていることが多く、向きを決める手がかりになります。"]
    },
    {
      id: "band5", name: "5本帯の読み方", en: "5-band code",
      desc: "精度の高い抵抗に使います。1〜3本目が数字(3けた)、4本目が乗数、5本目が許容差です。",
      fig: "band5-example",
      options: [
        ["①②③", "数字(3けた)"],
        ["④", "乗数"],
        ["⑤", "許容差。茶 ±1%、赤 ±2% など"]
      ],
      notes: ["5本帯では、茶が両端にくることがあり、向きをまちがえやすくなります。迷ったらテスターで測ります。"]
    },
    {
      id: "tolerance", name: "許容差", en: "Tolerance",
      desc: "表示の値から、実際の値がどれだけずれてよいかの範囲です。1kΩ ±5% なら、実際は 950Ω〜1050Ω のどれかです。",
      options: [
        ["金", "±5%"],
        ["銀", "±10%"],
        ["茶", "±1%"],
        ["赤", "±2%"]
      ]
    },
    {
      id: "e-series", name: "E系列", en: "E series (E12 / E24)",
      desc: "抵抗器は、決まった数列の値だけが売られています。計算で出た値がなければ、近い値を選びます。LEDの電流制限なら、電流が増えないように一つ上の値を選ぶのが安全です。",
      options: [
        ["E12", "10 12 15 18 22 27 33 39 47 56 68 82(×10ⁿ)"],
        ["E24", "E12 に 11 13 16 20 24 30 36 43 51 62 75 91 を足したもの"]
      ],
      notes: ["E12 は許容差 ±10%、E24 は ±5% の考え方で決められた数列です。どの値も1つ前の約1.2倍(E12)・約1.1倍(E24)になっています。"]
    },
    {
      id: "variable-resistor", name: "可変抵抗・半固定抵抗", en: "Potentiometer / Trimmer",
      desc: "つまみで抵抗値を変えられる抵抗です。足は3本で、両端のあいだは全体の抵抗、真ん中の足(ワイパー)がつまみに合わせて動きます。両端を 5V と GND に、真ん中を analogRead のピンにつなぐと、つまみの位置を 0〜5V の電圧として読めます(分圧回路)。",
      options: [
        ["可変抵抗(ボリューム)", "つまみを手で回す。音量・明るさの調整など"],
        ["半固定抵抗", "ドライバーで回して一度合わせたら、あまり動かさない"],
        ["Bカーブ", "回した角度に比例して変わる(電子工作の定番)"],
        ["Aカーブ", "音量用。最初はゆっくり、あとで大きく変わる"]
      ]
    },
    {
      id: "cds", name: "CdS(光センサー)", en: "Photoresistor (CdS cell)",
      desc: "明るいほど抵抗が小さくなる部品です。固定抵抗と組み合わせて分圧回路にすると、明るさを電圧に変えて analogRead で読めます。",
      notes: [
        "CdS はカドミウムを含むため、RoHS指令の規制の対象です。新しく作るときは、フォトトランジスタや照度センサーを使うことも考えます。",
        "CdS を 5V 側、固定抵抗を GND 側にすると、明るいほど出力の電圧が上がります。"
      ]
    }
  ],
  questions: [
    {
      id: "r01", level: "basic", q: "図の抵抗器(4本帯)の抵抗値は?", kind: "value", fig: "q-band2",
      choices: ["220Ω", "2.2kΩ", "22Ω", "221Ω"],
      explain: "赤 2、赤 2、乗数は茶(×10)で 22 × 10 = 220Ω、金で ±5%。221Ω は3本目を数字として読んだとき、2.2kΩ は乗数を ×100 にしたときの値です。",
      ref: "band4"
    },
    {
      id: "r02", level: "basic", q: "図の抵抗器(4本帯)の抵抗値は?", kind: "value", fig: "q-band1",
      choices: ["4.7kΩ", "47kΩ", "470Ω", "472Ω"],
      explain: "黄 4、紫 7、乗数は赤(×100)で 47 × 100 = 4700Ω = 4.7kΩ、金で ±5%。",
      ref: "band4"
    },
    {
      id: "r03", level: "std", q: "図の抵抗器(4本帯)の抵抗値は?", kind: "value", fig: "q-band3",
      choices: ["10kΩ", "1kΩ", "100kΩ", "103Ω"],
      explain: "茶 1、黒 0、乗数は橙(×1000)で 10 × 1000 = 10000Ω = 10kΩ。プルアップによく使う値です。",
      ref: "band4"
    },
    {
      id: "r04", level: "std", q: "図の抵抗器(5本帯)の抵抗値と許容差は?", kind: "value", fig: "q-band5",
      choices: ["1kΩ ±1%", "100Ω ±1%", "10kΩ ±1%", "1kΩ ±5%"],
      explain: "5本帯は3けた: 茶 1、黒 0、黒 0 で 100。乗数は茶(×10)で 1000Ω = 1kΩ。5本目の茶は ±1% です。",
      ref: "band5"
    },
    {
      id: "r05", level: "pro", q: "図の抵抗器(4本帯)の抵抗値は?", kind: "value", fig: "q-band6",
      choices: ["5.6Ω", "56Ω", "0.56Ω", "560Ω"],
      explain: "緑 5、青 6、乗数が金なので ×0.1。56 × 0.1 = 5.6Ω です。4本目の金は許容差 ±5%。",
      ref: "band4"
    },
    {
      id: "r06", level: "basic", q: "4本帯の抵抗で、4本目が金色のときの許容差は?", kind: "value",
      choices: ["±5%", "±10%", "±1%", "±20%"],
      explain: "金は ±5%、銀は ±10%、茶は ±1% です。",
      ref: "tolerance"
    },
    {
      id: "r07", level: "std", q: "1kΩ ±5% の抵抗器の、実際の値として考えられる範囲は?", kind: "value",
      choices: ["950Ω〜1050Ω", "995Ω〜1005Ω", "900Ω〜1100Ω", "1000Ω〜1050Ω"],
      explain: "1000Ω の 5% は 50Ω。1000 − 50 = 950Ω から 1000 + 50 = 1050Ω までです。900Ω〜1100Ω は ±10% のときです。",
      ref: "tolerance"
    },
    {
      id: "r08", level: "std", q: "330Ω ±5% の抵抗器のカラーコード(4本帯)は?", kind: "value",
      choices: ["橙 橙 茶 金", "橙 橙 赤 金", "橙 橙 黒 金", "赤 赤 茶 金"],
      explain: "33 × 10 = 330Ω なので、橙 3・橙 3・乗数 茶(×10)・金。橙 橙 赤 金は 3.3kΩ、橙 橙 黒 金は 33Ω です。",
      ref: "colorcode"
    },
    {
      id: "r09", level: "std", q: "LEDの電流制限抵抗を計算したら 140Ω だった。E12 から、電流が計算より増えないように選ぶなら?", kind: "value",
      choices: ["150Ω", "120Ω", "140Ω", "100Ω"],
      explain: "E12 の 100Ω台は 100・120・150・180…。140Ω はないので、一つ上の 150Ω を選ぶと電流は少し減り、安全側になります。120Ω だと電流が計算より増えます。",
      ref: "e-series"
    },
    {
      id: "r10", level: "basic", q: "抵抗器の向き(極性)について正しいのは?", kind: "text",
      choices: [
        "極性はなく、どちら向きにつないでもよい",
        "色の帯が多い側を+につなぐ",
        "長い足を+につなぐ",
        "金色の帯の側をGNDにつなぐ"
      ],
      explain: "抵抗器には極性がありません。帯の向きは値を読むためのもので、つなぐ向きとは関係ありません。",
      ref: "resistor-part"
    },
    {
      id: "r11", level: "std", q: "10kΩ の可変抵抗の両端を 5V と GND につないだ。真ん中の足の電圧は?", kind: "text",
      choices: [
        "つまみの位置によって 0〜5V のあいだで変わる",
        "いつも 5V",
        "いつも 2.5V",
        "つまみを回すと −5V〜+5V のあいだで変わる"
      ],
      explain: "可変抵抗は、つまみで分け方が変わる分圧回路です。真ん中の足は、つまみの位置に応じて GND(0V)から 5V までの電圧になります。マイナスの電圧は出ません。",
      ref: "variable-resistor"
    },
    {
      id: "r12", level: "basic", q: "CdS(光センサー)は、明るくなると抵抗がどうなる?", kind: "text",
      choices: ["小さくなる", "大きくなる", "変わらない(温度だけで変わる)", "0Ωになって回路がショートする"],
      explain: "CdS は明るいほど抵抗が小さくなります。ただし 0Ω にはならず、明るい所でも数百Ω〜数kΩ ほどあります。",
      ref: "cds"
    },
    {
      id: "r13", level: "pro", q: "CdS を 5V 側、10kΩ を GND 側にした分圧回路で、あいだの電圧を読む。部屋が明るくなると、読む電圧は?", kind: "text",
      choices: ["上がる", "下がる", "変わらない", "0V になる"],
      explain: "出力 = 5 × 10kΩ ÷ (CdS + 10kΩ)。明るくなると CdS の抵抗が小さくなり、分母が小さくなるので出力は上がります。CdS と 10kΩ を入れかえると逆になります。",
      ref: "cds"
    },
    {
      id: "r14", level: "pro", q: "5本帯の抵抗器で、4本目の帯の意味は?", kind: "text",
      choices: ["乗数(10の何乗をかけるか)", "3けた目の数字", "許容差", "温度係数"],
      explain: "5本帯は 1〜3本目が数字、4本目が乗数、5本目が許容差です。4本帯の3本目と同じ役目が、1本ずれて4本目にきます。",
      ref: "band5"
    },
    {
      id: "r15", level: "basic", q: "カラーコードで「赤」が表す数字は?", kind: "value",
      choices: ["2", "1", "3", "7"],
      explain: "黒0・茶1・赤2・橙3・黄4・緑5・青6・紫7・灰8・白9 です。",
      ref: "colorcode"
    }
  ]
});


// =====================================================================
// 05 LEDとダイオード
// =====================================================================
ELEC.register("led", {
  cards: [
    {
      id: "led", name: "LED(発光ダイオード)", en: "Light Emitting Diode",
      desc: "決まった向きに電流を流したときだけ光る部品です。足の長いほうがアノード(+)、短いほうがカソード(−)。アノードを電源の+側に向けてつなぎます。",
      fig: "led-polarity",
      notes: [
        "足を切ったあとは、本体のふちが平らになっている側がカソードです。",
        "LEDは電流で明るさが決まる部品です。電源に直接つながず、必ず電流制限抵抗を入れます。"
      ]
    },
    {
      id: "vf", name: "順方向電圧 Vf", en: "Forward voltage",
      desc: "LEDが光っているとき、LEDの両端にかかる電圧です。色(材料)によってちがいます。正確な値は、その部品のデータシートで確かめます。",
      options: [
        ["赤・黄", "約 2.0V"],
        ["黄緑", "約 2.1V"],
        ["青・白・純緑", "約 3.0〜3.2V"]
      ],
      notes: ["Vf は電流や温度で少し変わります。上の値は計算に使う目安です。"]
    },
    {
      id: "if", name: "順方向電流 If", en: "Forward current",
      desc: "LEDに流す電流です。よくある砲弾型(5mm)の LED は定格(ふだん流してよい電流)が 20mA 程度のものが多く(絶対最大定格はそれより少し上)、5〜10mA でも十分に明るく光ります。",
      notes: ["データシートの絶対最大定格を超える電流は、一瞬でも流しません。"]
    },
    {
      id: "led-resistor", name: "電流制限抵抗", en: "Current-limiting resistor",
      desc: "LEDに流れる電流を決める抵抗です。抵抗には電源電圧と Vf の差がかかるので、R = (電源電圧 − Vf) ÷ 電流 で求めます。",
      fig: "led-basic",
      options: [
        ["式", "R = (Vcc − Vf) ÷ If"],
        ["例", "(5V − 2.0V) ÷ 0.02A = 150Ω"],
        ["抵抗の電力", "P = (Vcc − Vf) × If = 3V × 0.02A = 0.06W"]
      ],
      notes: ["計算した値が売っていなければ、一つ上の値(電流が減る側)を選びます。"]
    },
    {
      id: "led-parallel", name: "LEDを複数つなぐ", en: "Multiple LEDs",
      desc: "並列にするときは、LED 1個ごとに抵抗をつけます。直列にするときは、Vf を足した合計より電源電圧が高くなければ光りません。",
      options: [
        ["並列", "1個ずつ抵抗をつける。Vf のばらつきで電流がかたよるため"],
        ["直列", "R = (Vcc − Vf × 個数) ÷ If"]
      ]
    },
    {
      id: "diode", name: "ダイオード", en: "Diode",
      desc: "電流をアノードからカソードへの一方向にだけ流す部品です。本体の帯(線)がある側がカソードで、回路図記号の縦線の側にあたります。",
      options: [
        ["シリコンダイオード", "Vf 約 0.6〜0.7V。1N4148(小信号)、1N4007(整流・1A)"],
        ["ショットキーダイオード", "Vf が小さい(約 0.2〜0.4V)"]
      ]
    },
    {
      id: "reverse-voltage", name: "逆電圧", en: "Reverse voltage",
      desc: "ダイオードやLEDに逆向きの電圧をかけると、電流はほとんど流れません(光りません)。ただし、耐えられる逆電圧には限度があり、LEDは 5V 程度のものが多くあります。",
      notes: ["限度を超える逆電圧をかけると、壊れることがあります。"]
    },
    {
      id: "polarity-protect", name: "逆接続の保護", en: "Reverse polarity protection",
      desc: "電源の入口にダイオードを直列に入れておくと、電池を逆向きにつないでも電流が流れず、回路を守れます。そのかわり、ダイオードの Vf 分だけ回路にかかる電圧が下がります。",
      notes: ["電圧の下がりを小さくしたいときは、Vf の小さいショットキーダイオードを使います。"]
    }
  ],
  questions: [
    {
      id: "l01", level: "basic", q: "LEDの2本の足のうち、長いほうは?", kind: "text", fig: "led-polarity",
      choices: ["アノード(+側)", "カソード(−側)", "GND専用の足", "どちらでもよい(極性はない)"],
      explain: "長い足がアノードで、電源の+側に向けてつなぎます。短い足がカソードです。",
      ref: "led"
    },
    {
      id: "l02", level: "basic", q: "図の回路で、LEDに 20mA 流すための抵抗 R は?", kind: "value", fig: "led-basic",
      choices: ["150Ω", "250Ω", "100Ω", "350Ω"],
      explain: "R = (5 − 2.0) ÷ 0.02 = 3 ÷ 0.02 = 150Ω。250Ω は Vf を引き忘れたとき(5 ÷ 0.02)、100Ω は Vf だけで計算したとき(2 ÷ 0.02)の値です。",
      ref: "led-resistor"
    },
    {
      id: "l03", level: "std", q: "図の回路で、LEDに 20mA 流すための抵抗 R は?", kind: "value", fig: "led-q9v",
      choices: ["350Ω", "450Ω", "100Ω", "550Ω"],
      explain: "R = (9 − 2.0) ÷ 0.02 = 7 ÷ 0.02 = 350Ω。450Ω は Vf を引き忘れたとき、550Ω は Vf を足してしまったときの値です。",
      ref: "led-resistor"
    },
    {
      id: "l04", level: "std", q: "図の回路で、青色LEDに 10mA 流すための抵抗 R は?", kind: "value", fig: "led-q-blue",
      choices: ["200Ω", "500Ω", "300Ω", "20Ω"],
      explain: "R = (5 − 3.0) ÷ 0.01 = 2 ÷ 0.01 = 200Ω。20Ω は 10mA を 0.1A とまちがえたときの値です。",
      ref: "led-resistor"
    },
    {
      id: "l05", level: "pro", q: "3.3V の電源で、白色LED(Vf 3.0V)に 10mA 流す。抵抗は?", kind: "value",
      choices: ["30Ω", "330Ω", "300Ω", "3Ω"],
      explain: "R = (3.3 − 3.0) ÷ 0.01 = 0.3 ÷ 0.01 = 30Ω。電圧の余裕が 0.3V しかないので、Vf のばらつきで明るさが大きく変わりやすい点にも注意します。",
      ref: "led-resistor"
    },
    {
      id: "l06", level: "basic", q: "図の回路で、LEDはどうなる?(LEDの向きに注目)", kind: "text", fig: "led-reverse",
      choices: [
        "光らない(逆向きなので電流が流れない)",
        "明るく光る",
        "少し暗く光る",
        "抵抗が焼ける"
      ],
      explain: "LEDの三角の向き(アノード→カソード)が電流の流れと逆になっています。逆向きではほとんど電流が流れないので光りません。電流が流れないので抵抗も熱くなりません。",
      ref: "reverse-voltage"
    },
    {
      id: "l07", level: "basic", q: "LEDを抵抗なしで 5V の電源に直接つなぐと?", kind: "text",
      choices: [
        "電流が流れすぎて、LEDが壊れるおそれがある",
        "Vf より電圧が高いので光らない",
        "ちょうどよい明るさで光る",
        "電流が逆向きに流れる"
      ],
      explain: "LEDは Vf を超えると急に電流が増える部品です。抵抗で電流をおさえないと、流れすぎて壊れます。",
      ref: "led-resistor"
    },
    {
      id: "l08", level: "std", q: "赤色LEDの順方向電圧 Vf の目安は?", kind: "value",
      choices: ["約2.0V", "約0.7V", "約3.2V", "約5.0V"],
      explain: "赤・黄は約 2.0V、青・白は約 3.0〜3.2V です。約 0.7V はシリコンダイオードの Vf です。",
      ref: "vf"
    },
    {
      id: "l09", level: "std", q: "よくある砲弾型LED(5mm)の、定格電流(ふだん流してよい電流)の目安は?", kind: "value",
      choices: ["20mA程度", "2A程度", "0.2mA程度", "200mA程度"],
      explain: "多くの砲弾型LEDは定格 20mA 程度です(絶対最大定格はそれより少し上で、超えると壊れます)。実際は 5〜10mA でも十分明るく光ります。",
      ref: "if"
    },
    {
      id: "l10", level: "std", q: "LEDを3個、並列にして光らせたい。正しいつなぎ方は?", kind: "text",
      choices: [
        "LED 1個ごとに電流制限抵抗をつける",
        "抵抗1個を共通にして、その先にLEDを3個並列にする",
        "電流が3つに分かれるので抵抗なしでよい",
        "LEDの向きを1個ずつ互いちがいにする"
      ],
      explain: "LEDは1個ずつ Vf が少しちがうので、抵抗を共通にすると Vf の低いLEDに電流がかたよります。1個ずつ抵抗をつけます。",
      ref: "led-parallel"
    },
    {
      id: "l11", level: "pro", q: "9V の電源で、赤色LED(Vf 2.0V)を3個直列にして 10mA 流す。抵抗は?", kind: "value",
      choices: ["300Ω", "700Ω", "900Ω", "100Ω"],
      explain: "直列なので Vf を足して 2.0 × 3 = 6V。R = (9 − 6) ÷ 0.01 = 300Ω。700Ω は LED 1個分しか引かなかったとき、100Ω は電流を3倍(30mA)にして計算したときの値です。",
      ref: "led-parallel"
    },
    {
      id: "l12", level: "basic", q: "ダイオードの本体に描かれた帯(線)がある側は?", kind: "text",
      choices: ["カソード", "アノード", "ゲート", "ベース"],
      explain: "帯がある側がカソードです。回路図記号の縦線の側にあたります。",
      ref: "diode"
    },
    {
      id: "l13", level: "std", q: "シリコンダイオードの順方向電圧の目安は?", kind: "value",
      choices: ["約0.6〜0.7V", "約2.0V", "約5V", "約0.01V"],
      explain: "シリコンダイオードは約 0.6〜0.7V です。約 2.0V は赤色LEDの Vf の目安です。",
      ref: "diode"
    },
    {
      id: "l14", level: "pro", q: "9V の電池の入口に、逆接続の保護としてダイオード(Vf 0.7V)を直列に入れた。回路にかかる電圧は?", kind: "value",
      choices: ["約8.3V", "9.7V", "9V(変わらない)", "0.7V"],
      explain: "ダイオードを通ると Vf 分だけ電圧が下がるので、9 − 0.7 = 8.3V です。",
      ref: "polarity-protect"
    },
    {
      id: "l15", level: "std", q: "5V の電源、330Ω の抵抗、赤色LED(Vf 2.0V)を直列につないだ。LEDに流れる電流は?", kind: "value",
      choices: ["約9mA", "約15mA", "約6mA", "約21mA"],
      explain: "I = (5 − 2.0) ÷ 330 = 3 ÷ 330 ≒ 0.0091A ≒ 9mA。約15mA は Vf を引き忘れたとき(5 ÷ 330)、約21mA は Vf を足してしまったときの値です。",
      ref: "led-resistor"
    }
  ]
});


// =====================================================================
// 06 ブレッドボードと配線・はんだ付け
// =====================================================================
ELEC.register("wiring", {
  cards: [
    {
      id: "breadboard", name: "ブレッドボード", en: "Breadboard (solderless)",
      desc: "はんだ付けをせずに、部品や線を穴に差して回路を作る板です。中央の溝をはさんで、各列の縦5つの穴(a〜e、f〜j)が内部でつながっています。溝の左右(e と f)はつながっていません。",
      fig: "breadboard",
      notes: ["図の色の帯が、内部でつながっている穴のまとまりです。同じ帯に部品の両方の足を差すと、その部品はショートしてしまいます。"]
    },
    {
      id: "power-rail", name: "電源レール", en: "Power rail",
      desc: "ブレッドボードの長い辺にそって、横につながった穴の列です。+ と − の2列があり、電源とGNDを配るのに使います。",
      notes: ["長いブレッドボードでは、電源レールが真ん中で分かれているものがあります。テスターの導通チェックで確かめるか、ジャンパー線でつないでおきます。"]
    },
    {
      id: "jumper", name: "ジャンパー線", en: "Jumper wire",
      desc: "ブレッドボードや部品のあいだをつなぐ線です。端の形で使い分けます。",
      options: [
        ["オス-オス", "ブレッドボードどうし、ブレッドボードと Arduino のピンソケット"],
        ["オス-メス", "センサーのピンヘッダーとブレッドボード"],
        ["単線(ワイヤー)", "長さを合わせて切ると、配線が平らできれいになる"]
      ],
      notes: ["電源の+は赤、GNDは黒にする習慣があります。色をそろえるとまちがいに気づきやすくなります。"]
    },
    {
      id: "dip-ic", name: "ICの差し方", en: "DIP IC on a breadboard",
      desc: "足が2列に並んだIC(DIP)は、中央の溝をまたぐように差します。溝の片側に差すと、向かい合う足どうしが同じ列でつながってショートします。",
      notes: ["ICには向きがあります。くぼみや丸印のある側が1番ピンです。"]
    },
    {
      id: "soldering-iron", name: "はんだごて", en: "Soldering iron",
      desc: "熱ではんだを溶かして、部品の足と基板をつなぐ道具です。温度調節ができるものを使うと失敗が減ります。",
      options: [
        ["鉛入り(共晶)はんだ", "こての温度の目安 約 320〜350℃"],
        ["鉛フリーはんだ", "こての温度の目安 約 350〜380℃"]
      ],
      notes: ["使わないときは必ずこて台に置きます。熱い先に触れたり、コードを焼いたりしないようにします。"]
    },
    {
      id: "tip", name: "こて先", en: "Soldering tip",
      desc: "こての先の部分です。形によって熱の伝わり方がちがいます。ぬらしたスポンジや金属のクリーナーで汚れを落としながら使います。",
      options: [
        ["B型", "円すい形。細かい所向き"],
        ["C型", "円柱を斜めに切った形。面で当たるので熱が伝わりやすい"],
        ["D型", "マイナスドライバーのような形"]
      ],
      notes: ["使い終わったら、こて先にはんだを少しのせたまま電源を切ると、さびにくく長持ちします。"]
    },
    {
      id: "good-joint", name: "良いはんだ付け", en: "Good solder joint",
      desc: "手順: こて先をランド(基板の銅の部分)と部品の足に同時に当てて2〜3秒温める → はんだを当てて溶かす → はんだを離す → こてを離す。できあがりは、すそが広がった富士山型で、つやがあります。",
      fig: "solder-joints",
      notes: ["はんだをこて先で溶かして運ぶと、フラックスが先に燃えてしまい、なじみが悪くなります。"]
    },
    {
      id: "bad-joint", name: "よくないはんだ付け", en: "Bad solder joints",
      desc: "見た目でわかる失敗は、つけ直して直します。",
      options: [
        ["イモはんだ", "丸く盛り上がり、なじんでいない。加熱不足が主な原因"],
        ["ブリッジ", "となりのランドや足とつながってしまう。はんだの多すぎ"],
        ["はんだ不足", "穴のまわりが埋まっていない"]
      ],
      notes: ["ブリッジは、はんだ吸い取り線で余分なはんだを吸い取ってから付け直します。"]
    },
    {
      id: "safety", name: "はんだ付けの安全", en: "Soldering safety",
      desc: "はんだ付けでは、熱・煙・飛び散りに気をつけます。",
      options: [
        ["換気", "フラックスの煙を吸わないよう、窓を開けるか換気扇を回す"],
        ["手洗い", "作業のあとは手を洗う(鉛入りはんだは特に)"],
        ["保護めがね", "足を切るとき、切れはしが飛ぶことがある"],
        ["電源を切る", "回路の電源を切ってからはんだ付けする"]
      ]
    }
  ],
  questions: [
    {
      id: "w01", level: "basic", q: "図のブレッドボードで、穴 a3(3列目の a)と内部でつながっているのは?", kind: "value", fig: "breadboard",
      choices: ["e3", "a4", "f3", "j3"],
      explain: "同じ列(3列目)の a〜e の5つがつながっています。a4 はとなりの列、f3 と j3 は中央の溝の反対側なのでつながっていません。",
      ref: "breadboard"
    },
    {
      id: "w02", level: "basic", q: "ブレッドボードの中央の溝をはさんだ、穴 e5 と f5 の関係は?", kind: "text", fig: "breadboard",
      choices: ["つながっていない", "つながっている", "電源レールとつながっている", "GNDにつながっている"],
      explain: "a〜e と f〜j は、溝で分かれています。溝をまたいでつなぎたいときは、ジャンパー線を使います。",
      ref: "breadboard"
    },
    {
      id: "w03", level: "basic", q: "ブレッドボードの電源レールでは、どの穴どうしがつながっている?", kind: "text",
      choices: [
        "長い辺にそって横に並んだ穴どうし",
        "縦に並んだ5つずつ",
        "ブレッドボードのすべての穴",
        "となりの1つの穴だけ"
      ],
      explain: "電源レールは、長い辺にそって横につながっています。+ と − の2列があります。",
      ref: "power-rail"
    },
    {
      id: "w04", level: "std", q: "足が2列に並んだIC(DIP)をブレッドボードに差すときは?", kind: "text",
      choices: [
        "中央の溝をまたいで差す",
        "溝の片側にすべての足を差す",
        "電源レールに差す",
        "斜めに差して足どうしを離す"
      ],
      explain: "溝をまたぐと、左右の足がそれぞれ別の列になります。片側に差すと、向かい合う足どうしが同じ列でショートします。",
      ref: "dip-ic"
    },
    {
      id: "w05", level: "std", q: "鉛入り(共晶)はんだを使うときの、こての温度の目安は?", kind: "value",
      choices: ["約320〜350℃", "約100℃", "約200℃", "約500℃以上"],
      explain: "共晶はんだは約 183℃ で溶けますが、ランドや足を温める分も考えて、こては約 320〜350℃ にします。熱すぎるとこて先や部品をいためます。",
      ref: "soldering-iron"
    },
    {
      id: "w06", level: "basic", q: "はんだ付けの手順として正しいのは?", kind: "text",
      choices: [
        "こてで足とランドを温めてから、そこにはんだを当てて溶かす",
        "こて先で溶かしたはんだを、足の所まで運んでのせる",
        "部品の足だけを温め、ランドは温めない",
        "はんだが溶けたら、こてを当てたまま部品を動かして位置を直す"
      ],
      explain: "温めた足とランドにはんだを当てると、はんだが流れてなじみます。こて先で溶かして運ぶと、フラックスが燃えてなじみが悪くなります。固まるまで部品は動かしません。",
      ref: "good-joint"
    },
    {
      id: "w07", level: "basic", q: "良いはんだ付けの形は?", kind: "text", fig: "solder-joints",
      choices: [
        "すそが広がった富士山型で、つやがある",
        "丸い玉のように盛り上がっている",
        "となりのランドまで広がっている",
        "足の先にだけ少しついている"
      ],
      explain: "はんだがランドと足の両方になじむと、すそが広がった富士山型になります。丸い玉はイモはんだ、となりまで広がるのはブリッジです。",
      ref: "good-joint"
    },
    {
      id: "w08", level: "std", q: "イモはんだ(丸く盛り上がってなじんでいない)の主な原因は?", kind: "text",
      choices: [
        "加熱不足で、はんだが足やランドになじんでいない",
        "こて先の温度が高すぎて、はんだが燃えた",
        "はんだの量が少なすぎた",
        "鉛フリーはんだを使った"
      ],
      explain: "足やランドが十分に温まっていないと、はんだが流れずに丸く固まります。しっかり温めてから付け直します。",
      ref: "bad-joint"
    },
    {
      id: "w09", level: "std", q: "はんだ付けの「ブリッジ」とは?", kind: "text",
      choices: [
        "となりのランドや足どうしが、はんだでつながってしまうこと",
        "はんだが足まで届いていないこと",
        "部品が基板から浮いていること",
        "こて先を掃除する方法"
      ],
      explain: "ブリッジはショートの原因になります。はんだ吸い取り線で余分なはんだを取り除きます。",
      ref: "bad-joint"
    },
    {
      id: "w10", level: "basic", q: "はんだ付けをするときの安全な行動は?", kind: "text",
      choices: [
        "換気して、フラックスの煙を吸わないようにする",
        "こては使い終わったら机に直接置く",
        "回路の電源を入れたまま作業する",
        "こて先を指で軽く触って温度を確かめる"
      ],
      explain: "フラックスの煙は吸わないように換気します。こてはこて台に置き、回路の電源は切って作業します。",
      ref: "safety"
    },
    {
      id: "w11", level: "std", q: "こて先を長持ちさせる使い方は?", kind: "text",
      choices: [
        "使い終わったら、こて先にはんだを少しのせたまま電源を切る",
        "使い終わったら、こて先のはんだを全部ふき取って乾かす",
        "汚れたら紙やすりでこて先を削る",
        "使い終わったら水につけて急に冷やす"
      ],
      explain: "はんだをのせておくと、こて先が空気にふれず、さびにくくなります。やすりで削るとこて先のめっきがはがれて使えなくなります。",
      ref: "tip"
    },
    {
      id: "w12", level: "basic", q: "ジャンパー線の色の使い分けで、よく使われる習慣は?", kind: "text",
      choices: [
        "赤を電源の+、黒をGNDにする",
        "黒を電源の+、赤をGNDにする",
        "色が決まっていて、ちがう色では電気が流れない",
        "青は必ずアナログ信号に使う"
      ],
      explain: "赤を+、黒をGNDにするのが一般的な習慣です。電気的な決まりではありませんが、まちがいを見つけやすくなります。",
      ref: "jumper"
    },
    {
      id: "w13", level: "pro", q: "長いブレッドボードの片方の端だけに電源をつないだら、反対の端の部品が動かない。まず疑うことは?", kind: "text",
      choices: [
        "電源レールが真ん中で分かれている",
        "部品が新しすぎる",
        "中央の溝が広すぎる",
        "GNDのジャンパー線が多すぎる"
      ],
      explain: "長いブレッドボードには、電源レールが真ん中で切れているものがあります。導通チェックで確かめ、切れていればジャンパー線でつなぎます。",
      ref: "power-rail"
    },
    {
      id: "w14", level: "std", q: "円柱を斜めに切った形で、面で当たるので熱が伝わりやすいこて先は?", kind: "value",
      choices: ["C型", "B型", "I型", "D型"],
      explain: "斜めに切った形は C型です。B型は円すい形、I型は細くとがった形、D型はマイナスドライバーのような形です。",
      ref: "tip"
    }
  ]
});


// =====================================================================
// 07 テスターで測る
// =====================================================================
ELEC.register("tester", {
  cards: [
    {
      id: "multimeter", name: "テスター(マルチメーター)", en: "Multimeter",
      desc: "電圧・電流・抵抗などを1台で測る道具です。ダイヤルで測るものとレンジを選び、2本のリード(テスト棒)を当てて測ります。",
      options: [
        ["COM", "黒いリードを差す(共通・マイナス側)"],
        ["V/Ω", "赤いリードを差す(電圧・抵抗・導通)"],
        ["mA / 10A", "電流を測るときだけ、赤いリードを差しかえる"]
      ]
    },
    {
      id: "measure-v", name: "電圧の測り方", en: "Measuring voltage",
      desc: "回路の電源を入れたまま、測りたい部品の両端にリードを当てます(部品と並列)。電池や電子回路は直流なので、DCV(V⎓)のレンジを使います。",
      fig: "tester",
      notes: ["赤を+側、黒を−側(GND側)に当てます。逆に当てると、デジタルテスターではマイナスの値が表示されます。"]
    },
    {
      id: "measure-a", name: "電流の測り方", en: "Measuring current",
      desc: "回路を1か所切って、そのあいだにテスターを入れます(回路に直列)。赤いリードを mA または 10A の端子に差しかえ、電流のレンジにします。",
      fig: "tester",
      notes: ["流れる電流の見当がつかないときは、10A の端子とレンジから始めます。"]
    },
    {
      id: "measure-r", name: "抵抗の測り方", en: "Measuring resistance",
      desc: "回路の電源を切ってから、部品の両端に当てます。できれば部品を回路からはずして測ります。回路についたままだと、並列につながったほかの部品も一緒に測ってしまいます。",
      notes: ["リードの金属部分を両手の指でつまむと、体の抵抗も一緒に測ってしまいます。"]
    },
    {
      id: "continuity", name: "導通チェック", en: "Continuity test",
      desc: "2点のあいだの抵抗がとても小さい(つながっている)とき、ブザーが鳴る機能です。断線や、はんだのブリッジ、ブレッドボードのつながりを確かめるのに便利です。",
      notes: ["抵抗の測定と同じく、回路の電源を切ってから使います。"]
    },
    {
      id: "range", name: "レンジ", en: "Range",
      desc: "測る大きさの範囲です。自動で選ぶオートレンジのテスターと、自分で選ぶ手動レンジのテスターがあります。手動のときは、大きいレンジから始めて、順に下げていきます。",
      notes: ["表示が「OL」や「1」だけのときは、レンジを超えています(抵抗なら、つながっていないこともあります)。"]
    },
    {
      id: "amp-danger", name: "電流レンジのまま電圧を測る危険", en: "Current range on a voltage source",
      desc: "電流を測るときのテスターの中の抵抗はとても小さく、ほぼ電線と同じです。その状態で電池などの両端に当てる(並列にする)と、ショートと同じになり、大電流が流れます。",
      notes: [
        "テスターのヒューズが切れたり、テスターや電池が壊れたり、熱くなったりします。",
        "電流を測り終えたら、赤いリードをすぐに V の端子へ戻す習慣をつけます。"
      ]
    },
    {
      id: "dc-ac-range", name: "DCV と ACV", en: "DC volts / AC volts",
      desc: "直流の電圧は DCV(V⎓ や V の上に直線の印)、交流の電圧は ACV(V〜)のレンジで測ります。電池・USB・Arduino の回路はすべて DCV です。",
      notes: ["交流のコンセントの測定は感電の危険があるので、電子工作の練習では行いません。"]
    }
  ],
  questions: [
    {
      id: "t01", level: "basic", q: "テスターで部品にかかる電圧を測るとき、テスターのつなぎ方は?", kind: "text", fig: "tester",
      choices: [
        "測りたい部品と並列に当てる",
        "回路を切って、測りたい部品と直列に入れる",
        "電源を切ってから、部品をはずして当てる",
        "電池の+とテスターの赤だけをつなぐ"
      ],
      explain: "電圧は2点のあいだの差なので、部品の両端に当てます(並列)。直列に入れるのは電流を測るときです。",
      ref: "measure-v"
    },
    {
      id: "t02", level: "basic", q: "テスターで回路を流れる電流を測るときは?", kind: "text", fig: "tester",
      choices: [
        "回路を切って、そのあいだにテスターを直列に入れる",
        "部品の両端に並列に当てる",
        "電源の+と−に直接当てる",
        "抵抗のレンジで測る"
      ],
      explain: "電流は回路を通りぬける量なので、テスターの中を通るように直列に入れます。電源の両端に当てるとショートになり危険です。",
      ref: "measure-a"
    },
    {
      id: "t03", level: "basic", q: "テスターで抵抗を測るときに大切なことは?", kind: "text",
      choices: [
        "回路の電源を切ってから測る",
        "回路の電源を入れたまま測る",
        "電流のレンジで測る",
        "部品に 5V をかけながら測る"
      ],
      explain: "テスターは自分で小さな電流を流して抵抗を測ります。回路の電源が入っていると正しく測れず、テスターをいためることもあります。",
      ref: "measure-r"
    },
    {
      id: "t04", level: "basic", q: "配線が切れていないかを、音で手早く確かめられるテスターの機能は?", kind: "text",
      choices: ["導通チェック", "電流レンジ(A)", "交流電圧レンジ(ACV)", "データホールド"],
      explain: "導通チェックは、2点がつながっているとブザーが鳴ります。断線やブリッジを探すのに便利です。",
      ref: "continuity"
    },
    {
      id: "t05", level: "std", q: "テスターを電流レンジにしたまま、電池の両端にリードを当てるとどうなる?", kind: "text",
      choices: [
        "テスターの中でショートになり、ヒューズが切れるなどして壊れるおそれがある",
        "電池の電圧が正しく表示される",
        "何も起きず、0 と表示される",
        "電池が充電される"
      ],
      explain: "電流レンジのテスターは中の抵抗がとても小さいので、電池の両端に当てるとショートと同じです。大電流が流れて危険です。",
      ref: "amp-danger"
    },
    {
      id: "t06", level: "std", q: "手動レンジのテスターで、測る値の見当がつかないときは?", kind: "text",
      choices: [
        "いちばん大きいレンジから始めて、順に下げる",
        "いちばん小さいレンジから始めて、順に上げる",
        "真ん中のレンジに固定して測る",
        "レンジは値に関係ないので、どれでもよい"
      ],
      explain: "小さいレンジに大きな値が入ると、テスターをいためることがあります。大きいレンジから始めるのが安全です。",
      ref: "range"
    },
    {
      id: "t07", level: "basic", q: "乾電池の電圧を測るときのレンジは?", kind: "text",
      choices: ["DCV(直流電圧)", "ACV(交流電圧)", "Ω(抵抗)", "A(電流)"],
      explain: "電池は直流なので DCV で測ります。ACV はコンセントなどの交流用です。",
      ref: "dc-ac-range"
    },
    {
      id: "t08", level: "std", q: "テスターの黒いリードを差す端子は?", kind: "value",
      choices: ["COM", "mA", "10A", "V/Ω"],
      explain: "黒いリードは COM(共通)に差します。赤いリードは、電圧・抵抗なら V/Ω、電流なら mA か 10A に差します。",
      ref: "multimeter"
    },
    {
      id: "t09", level: "std", q: "回路についたままの抵抗器を測ると、表示の値とちがうことがある。理由は?", kind: "text",
      choices: [
        "並列につながったほかの部品も一緒に測ってしまうから",
        "抵抗器は回路の中では値が2倍になるから",
        "テスターの電池が減るから",
        "抵抗器の色が熱で変わるから"
      ],
      explain: "テスターから見ると、回路のほかの部品が並列につながって見えます。並列の合成抵抗は小さくなるので、ふつうは表示より小さく測れます。",
      ref: "measure-r"
    },
    {
      id: "t10", level: "pro", q: "9V の電池に 1kΩ を2本直列につないだ。下の 1kΩ の両端の電圧をテスターで測ると、表示はおよそ?(テスターの影響は考えない)", kind: "value",
      choices: ["4.5V", "9V", "0V", "18V"],
      explain: "同じ値の抵抗の直列なので、電圧は半分ずつに分かれます。9 × 1 ÷ (1 + 1) = 4.5V。",
      ref: "measure-v"
    },
    {
      id: "t11", level: "pro", q: "5V の電源に 250Ω の抵抗をつないだ回路で、テスターを直列に入れて電流を測った。表示はおよそ?(テスターの影響は考えない)", kind: "value",
      choices: ["20mA", "1.25A", "50mA", "2mA"],
      explain: "I = 5 ÷ 250 = 0.02A = 20mA。50mA は 250 ÷ 5、1.25A は 5 × 250 を mA として A に直した値です。",
      ref: "measure-a"
    },
    {
      id: "t12", level: "std", q: "電流を測り終えたあとに、すぐしておくとよいことは?", kind: "text",
      choices: [
        "赤いリードを V の端子に戻す",
        "黒いリードを 10A の端子に差しかえる",
        "電流レンジのままにして片付ける",
        "ヒューズを外しておく"
      ],
      explain: "赤いリードが電流の端子のままだと、次に電圧を測ろうとしたときにショートさせてしまいます。すぐに V の端子へ戻します。",
      ref: "amp-danger"
    },
    {
      id: "t13", level: "pro", q: "電源を切った回路で導通チェックをしたら、ブザーが鳴った。わかることは?", kind: "text",
      choices: [
        "2点のあいだの抵抗がとても小さい(つながっている)",
        "2点のあいだに高い電圧がかかっている",
        "回路に 20mA 以上の電流が流れている",
        "部品が必ず壊れている"
      ],
      explain: "導通チェックのブザーは、抵抗が小さい(数十Ω程度以下、機種による)ときに鳴ります。電圧や電流を測っているのではありません。",
      ref: "continuity"
    }
  ]
});


// =====================================================================
// 08 電源と電池
// =====================================================================
ELEC.register("power", {
  cards: [
    {
      id: "battery-types", name: "電池の種類", en: "Battery types",
      desc: "電池によって電圧と、使い捨てか充電できるかがちがいます。",
      options: [
        ["アルカリ乾電池", "1.5V。使い捨て"],
        ["ニッケル水素電池", "1.2V。充電して使える"],
        ["9V形(006P)", "9V。端子が2つ並んだ四角い電池"],
        ["コイン電池 CR2032", "3V。リチウムの使い捨て"],
        ["リチウムイオン電池", "3.7V(公称)、満充電で約4.2V。充電式"]
      ]
    },
    {
      id: "battery-series", name: "電池の直列と並列", en: "Batteries in series / parallel",
      desc: "直列にすると電圧が足し算になり、容量(mAh)は1本分のままです。並列にすると電圧は1本分のままで、容量が増えます。",
      fig: "battery-sp",
      notes: ["並列にするときは、種類や残量のちがう電池を混ぜません。電池どうしのあいだで電流が流れてしまいます。電子工作では、電圧を上げる直列のほうがよく使われます。"]
    },
    {
      id: "mah", name: "容量 mAh", en: "Capacity [mAh]",
      desc: "電池が何mAの電流を何時間流せるかの目安です。2000mAh の電池なら、100mA で約20時間(2000 ÷ 100)。",
      notes: ["実際は、流す電流の大きさや温度で短くなります。目安として使います。"]
    },
    {
      id: "usb-power", name: "USBの電源", en: "USB power (5V)",
      desc: "USBの電源は 5V です。Arduino Uno はパソコンのUSBにつなぐだけで動きます。取り出せる電流には上限があります。",
      options: [
        ["USB 2.0", "500mA まで(目安)"],
        ["USB 3.0", "900mA まで(目安)"],
        ["USB充電器", "製品ごとに 1A、2A などと書かれている"]
      ],
      notes: ["モーターなど電流の大きい部品をつなぐと、USBの電源が足りなくなります。別の電源を用意します。"]
    },
    {
      id: "logic-level", name: "3.3V系と5V系", en: "3.3V / 5V logic",
      desc: "マイコンやセンサーには、5V で動くもの(Arduino Uno など)と、3.3V で動くもの(ESP32、Raspberry Pi など)があります。5V の信号を 3.3V 系の入力にそのまま入れると、壊れることがあります。",
      notes: ["電圧のちがう機器をつなぐときは、レベル変換モジュールや分圧回路で電圧を合わせます。"]
    },
    {
      id: "regulator", name: "三端子レギュレータ", en: "Linear voltage regulator",
      desc: "高い電圧から、一定の低い電圧を作る部品です。足は 入力・GND・出力 の3本。7805 なら出力は 5V です。入力と出力の電圧の差 × 電流 が熱になります。",
      fig: "regulator",
      options: [
        ["7805", "出力 5V。入力は出力より約2V以上高くする"],
        ["LDO", "入力と出力の差が小さくても動くタイプ"],
        ["熱", "(入力 − 出力)× 電流。大きいと放熱板が必要"]
      ],
      notes: ["入力と出力にはコンデンサーをつけます。値はデータシートの例に合わせます(7805 なら 0.33μF と 0.1μF など)。"]
    },
    {
      id: "reverse-connection", name: "逆接続", en: "Reverse connection",
      desc: "電池や電源の+と−を逆につなぐことです。部品によっては一瞬で壊れます。電源をつなぐ前に、+と−を必ず確かめます。",
      notes: ["電源の入口にダイオードを入れておくと、逆につないだときに電流が流れず、回路を守れます。"]
    },
    {
      id: "battery-short", name: "電池のショートの危険", en: "Battery short circuit",
      desc: "電池の+と−を金属でつなぐと、大きな電流が流れて電池が熱くなり、液もれ・破裂・発火のおそれがあります。",
      notes: ["電池を鍵やコインと一緒にポケットやかばんに入れません。9V形は端子どうしが近いので特に注意します。"]
    },
    {
      id: "lithium", name: "リチウムイオン電池の扱い", en: "Handling Li-ion batteries",
      desc: "小さくて容量の大きい便利な電池ですが、扱いをまちがえると発火します。",
      options: [
        ["充電", "専用の充電回路・充電器で充電する"],
        ["保護", "保護回路つきの電池を使う"],
        ["衝撃", "落とす・つぶす・曲げる・穴をあけるのは発火の原因"],
        ["ふくらみ", "ふくらんだら使用も充電もやめる"],
        ["捨て方", "燃えないごみに出さず、回収ボックスや自治体の方法で"]
      ]
    }
  ],
  questions: [
    {
      id: "p01", level: "basic", q: "1.5V の乾電池を2本、直列につないだときの電圧は?", kind: "value", fig: "battery-sp",
      choices: ["3.0V", "1.5V", "0.75V", "2.25V"],
      explain: "直列は電圧の足し算です。1.5 + 1.5 = 3.0V。",
      ref: "battery-series"
    },
    {
      id: "p02", level: "basic", q: "1.5V の乾電池を2本、並列につないだときの電圧は?", kind: "value", fig: "battery-sp",
      choices: ["1.5V", "3.0V", "0.75V", "0V"],
      explain: "並列では電圧は1本分のままで、容量(長持ち)が増えます。",
      ref: "battery-series"
    },
    {
      id: "p03", level: "std", q: "2000mAh の電池で、100mA の回路を動かす。動く時間の目安は?", kind: "value",
      choices: ["約20時間", "約200時間", "約2時間", "約0.05時間"],
      explain: "2000mAh ÷ 100mA = 20時間。約0.05時間は 100 ÷ 2000 と逆に割ったときの値です。",
      ref: "mah"
    },
    {
      id: "p04", level: "basic", q: "単3アルカリ乾電池(1.5V)を4本、直列にしたときの電圧は?", kind: "value",
      choices: ["6V", "1.5V", "4.5V", "3V"],
      explain: "1.5 × 4 = 6V。4.5V は3本のときの値です。",
      ref: "battery-series"
    },
    {
      id: "p05", level: "basic", q: "USBの電源の電圧は?", kind: "value",
      choices: ["5V", "3.3V", "12V", "100V"],
      explain: "USBの電源は 5V です。Arduino Uno はこの 5V で動きます。",
      ref: "usb-power"
    },
    {
      id: "p06", level: "std", q: "3.3V で動くマイコンの入力ピンに、5V の信号をつなぎたい。正しい考え方は?", kind: "text",
      choices: [
        "入力を壊すおそれがあるので、レベル変換や分圧で 3.3V 以下にする",
        "電圧が高いほど確実に読めるので、そのままつなぐ",
        "マイコンが自動で 3.3V に変換するので問題ない",
        "5V 系のほうが電流が少ないので安全"
      ],
      explain: "3.3V 系の入力の多くは、電源電圧を大きく超える電圧に耐えられません。レベル変換モジュールや分圧回路で電圧を下げます。",
      ref: "logic-level"
    },
    {
      id: "p07", level: "pro", q: "図のレギュレータで、9V から 5V を作り 0.5A を取り出す。レギュレータで熱になる電力は?", kind: "value", fig: "regulator",
      choices: ["2W", "4.5W", "2.5W", "7W"],
      explain: "熱になるのは (入力 − 出力) × 電流 = (9 − 5) × 0.5 = 2W。4.5W は 9 × 0.5(入力の電力全部)、2.5W は 5 × 0.5(出力の電力)です。2W は放熱板が必要な大きさです。",
      ref: "regulator"
    },
    {
      id: "p08", level: "std", q: "三端子レギュレータ 7805 の出力電圧は?", kind: "value", fig: "regulator",
      choices: ["5V", "7.8V", "0.5V", "78V"],
      explain: "78xx の下2けたが出力電圧です。7805 は 5V、7809 は 9V です。",
      ref: "regulator"
    },
    {
      id: "p09", level: "basic", q: "電池を鍵やコインと一緒にポケットに入れると危ない理由は?", kind: "text",
      choices: [
        "金属で+と−がつながってショートし、発熱・発火するおそれがある",
        "電池の電圧が上がってしまう",
        "電池が勝手に充電される",
        "金属が磁石になってしまう"
      ],
      explain: "金属が+と−の両方にふれるとショートになり、大きな電流で電池が熱くなります。",
      ref: "battery-short"
    },
    {
      id: "p10", level: "std", q: "リチウムイオン電池がふくらんできた。正しい対応は?", kind: "text",
      choices: [
        "使用も充電もやめ、決められた方法で処分する",
        "押してへこませてから使い続ける",
        "冷蔵庫で冷やしてから使う",
        "穴をあけて中のガスを抜く"
      ],
      explain: "ふくらみは劣化や異常のしるしです。押したり穴をあけたりすると発火のおそれがあります。使用をやめ、回収ボックスなどで処分します。",
      ref: "lithium"
    },
    {
      id: "p11", level: "std", q: "電池を並列にするときの注意として正しいのは?", kind: "text",
      choices: [
        "種類や残量のちがう電池を混ぜない",
        "新しい電池と古い電池を必ず組み合わせる",
        "並列にすると電圧が2倍になるので部品を変える",
        "並列なら1本を逆向きに入れても大丈夫"
      ],
      explain: "電圧や残量がちがうと、電池どうしのあいだで電流が流れ、発熱や液もれの原因になります。",
      ref: "battery-series"
    },
    {
      id: "p12", level: "std", q: "リチウムイオン電池1本の公称電圧は?", kind: "value",
      choices: ["3.7V", "1.5V", "1.2V", "9V"],
      explain: "リチウムイオン電池は公称 3.7V、満充電で約 4.2V です。1.5V はアルカリ乾電池、1.2V はニッケル水素電池です。",
      ref: "battery-types"
    },
    {
      id: "p13", level: "pro", q: "Arduino Uno の電源ジャック(DCジャック)に入れる電圧として、推奨されている範囲は?", kind: "value",
      choices: ["7〜12V", "3.3V", "5V(ちょうど)", "24V以上"],
      explain: "Uno はボード上のレギュレータで 5V を作るので、入力は 5V より余裕をもって高くします(推奨 7〜12V)。低いと 5V を保てず、高すぎるとレギュレータが熱くなります。",
      ref: "regulator"
    },
    {
      id: "p14", level: "basic", q: "コイン電池 CR2032 の電圧は?", kind: "value",
      choices: ["3V", "1.5V", "5V", "9V"],
      explain: "CR2032 はリチウムのコイン電池で 3V です。",
      ref: "battery-types"
    },
    {
      id: "p15", level: "std", q: "パソコンのUSB 2.0 ポートから取れる電流の目安は?", kind: "value",
      choices: ["500mA", "5A", "50mA", "20A"],
      explain: "USB 2.0 は 500mA、USB 3.0 は 900mA が目安です。モーターなどを動かすには足りないことがあります。",
      ref: "usb-power"
    }
  ]
});


// =====================================================================
// 09 コンデンサー
// =====================================================================
ELEC.register("capacitor", {
  cards: [
    {
      id: "capacitor", name: "コンデンサー", en: "Capacitor",
      desc: "電気をためたり放したりする部品です。直流をかけると、充電が終わったあとは電流が流れなくなります。電圧の変化(交流やノイズ)は通しやすい性質があります。",
      notes: ["大きな容量のコンデンサーは、電源を切ったあとも電気が残っていることがあります。"]
    },
    {
      id: "farad", name: "容量の単位", en: "Capacitance [F: ファラド]",
      desc: "どれだけ電気をためられるかを容量といい、単位は F(ファラド)です。1F はとても大きいので、ふつうは μF・nF・pF を使います。",
      options: [
        ["μF(マイクロ)", "10⁻⁶ F"],
        ["nF(ナノ)", "10⁻⁹ F"],
        ["pF(ピコ)", "10⁻¹² F"],
        ["換算", "1μF = 1000nF = 1,000,000pF"]
      ]
    },
    {
      id: "charge", name: "充電と放電", en: "Charging / Discharging",
      desc: "抵抗を通してコンデンサーを充電すると、電圧は最初は速く、だんだんゆっくり上がり、電源の電圧に近づきます。放電するときも同じように、最初は速く下がります。",
      fig: "rc-curve"
    },
    {
      id: "tau", name: "時定数 τ = RC", en: "Time constant",
      desc: "抵抗 R[Ω] とコンデンサー C[F] のかけ算で、充電の速さの目安になる時間(秒)です。τ 秒で電源電圧の約63%、5τ でほぼ満充電(約99%)になります。",
      fig: "q-rc",
      options: [
        ["τ = R × C", "Ω × F = 秒"],
        ["例", "10kΩ × 100μF = 10000 × 0.0001 = 1秒"],
        ["τ のとき", "約63%"],
        ["5τ のとき", "約99%"]
      ]
    },
    {
      id: "electrolytic", name: "電解コンデンサー", en: "Electrolytic capacitor",
      desc: "大きな容量を持つ、極性のあるコンデンサーです。足の長いほうが+、本体に帯(−の印)がある側が−です。耐圧(かけてよい電圧の上限)が書かれていて、回路の電圧より余裕のあるものを選びます。",
      notes: ["逆向きにつないだり、耐圧を超える電圧をかけたりすると、発熱して液もれや破裂のおそれがあります。"]
    },
    {
      id: "ceramic", name: "セラミックコンデンサー", en: "Ceramic capacitor",
      desc: "極性のない、小さな容量のコンデンサーです。値は3けたの数字で書かれ、はじめの2けたが数字、3けた目が0の数で、単位は pF です。",
      options: [
        ["101", "10 × 10¹ = 100pF"],
        ["102", "1000pF = 1nF"],
        ["103", "10000pF = 10nF = 0.01μF"],
        ["104", "100000pF = 100nF = 0.1μF"],
        ["105", "1000000pF = 1μF"]
      ]
    },
    {
      id: "bypass", name: "パスコン", en: "Bypass (decoupling) capacitor",
      desc: "ICの電源ピンとGNDのあいだ、できるだけICの近くに入れるコンデンサーです。電源のノイズや、一瞬の電圧の落ちこみをおさえます。0.1μF のセラミックコンデンサーがよく使われます。",
      notes: ["ICから離れた所に置くと、配線が長くなって効果が下がります。"]
    },
    {
      id: "cap-combo", name: "コンデンサーの直列・並列", en: "Capacitors in series / parallel",
      desc: "コンデンサーは抵抗と逆で、並列にすると容量が足し算になり、直列にすると小さくなります。",
      options: [
        ["並列", "C = C1 + C2"],
        ["直列", "1/C = 1/C1 + 1/C2(2個なら和分の積)"]
      ]
    }
  ],
  questions: [
    {
      id: "k01", level: "basic", q: "1μF は何nF?", kind: "value",
      choices: ["1000nF", "100nF", "10nF", "1,000,000nF"],
      explain: "μ は 10⁻⁶、n は 10⁻⁹ なので、1μF = 1000nF です。1,000,000 になるのは pF のときです。",
      ref: "farad"
    },
    {
      id: "k02", level: "std", q: "セラミックコンデンサーに「104」と書かれている。容量は?", kind: "value",
      choices: ["0.1μF", "104pF", "10μF", "1μF"],
      explain: "10 のあとに 0 が4つで 100000pF = 100nF = 0.1μF。パスコンの定番の値です。",
      ref: "ceramic"
    },
    {
      id: "k03", level: "std", q: "セラミックコンデンサーに「103」と書かれている。容量は?", kind: "value",
      choices: ["0.01μF", "103pF", "0.1μF", "1μF"],
      explain: "10 のあとに 0 が3つで 10000pF = 10nF = 0.01μF です。",
      ref: "ceramic"
    },
    {
      id: "k04", level: "basic", q: "図の回路の時定数 τ は?", kind: "value", fig: "q-rc",
      choices: ["1秒", "1000秒", "0.1秒", "10秒"],
      explain: "τ = R × C = 10000Ω × 0.0001F(100μF)= 1秒。1000秒は 10k × 100 のように単位を直さずにかけたときの値です。",
      ref: "tau"
    },
    {
      id: "k05", level: "std", q: "1kΩ の抵抗と 470μF のコンデンサーで作った回路の時定数 τ は?", kind: "value",
      choices: ["0.47秒", "470秒", "4.7秒", "0.047秒"],
      explain: "τ = 1000Ω × 0.00047F = 0.47秒です。",
      ref: "tau"
    },
    {
      id: "k06", level: "std", q: "充電を始めてから τ 秒後、コンデンサーの電圧は電源電圧の約何%?", kind: "value", fig: "rc-curve",
      choices: ["約63%", "約37%", "約50%", "約99%"],
      explain: "τ 秒で約63%(1 − 1/e)です。約37% は放電のとき τ 秒後に残っている割合、約99% は 5τ 後です。",
      ref: "tau"
    },
    {
      id: "k07", level: "pro", q: "時定数 τ の回路で、ほぼ満充電(約99%)になるまでの時間の目安は?", kind: "value", fig: "rc-curve",
      choices: ["5τ", "τ", "2τ", "100τ"],
      explain: "5τ でおよそ 99.3% になるので、5τ を満充電の目安にします。",
      ref: "tau"
    },
    {
      id: "k08", level: "pro", q: "τ = 1秒の回路で、空のコンデンサーを 5V で充電し始めた。1秒後の電圧はおよそ?", kind: "value",
      choices: ["約3.2V", "約1.8V", "約2.5V", "約5V"],
      explain: "1秒 = τ なので約63%。5 × 0.632 ≒ 3.16V ≒ 3.2V です。約1.8V は 37% で計算したときの値です。",
      ref: "tau"
    },
    {
      id: "k09", level: "basic", q: "電解コンデンサーの極性の見分け方として正しいのは?", kind: "text",
      choices: [
        "足の長いほうが+、本体の帯(−の印)がある側が−",
        "足の短いほうが+",
        "極性はないので、どちら向きでもよい",
        "本体の帯がある側が+"
      ],
      explain: "電解コンデンサーは、長い足が+、帯(−の印)の側が−です。LEDと同じく、長い足が+と覚えます。",
      ref: "electrolytic"
    },
    {
      id: "k10", level: "std", q: "12V の回路で使う電解コンデンサーの耐圧として、選ぶのに適切なのは?", kind: "text",
      choices: [
        "16V や 25V など、12V より余裕のあるもの",
        "6.3V(耐圧は小さいほど性能がよい)",
        "耐圧は関係ないので、いちばん安いもの",
        "12V の回路なら 10V で十分"
      ],
      explain: "耐圧は回路の電圧より余裕を持って選びます。耐圧を超えると、発熱や破裂のおそれがあります。",
      ref: "electrolytic"
    },
    {
      id: "k11", level: "basic", q: "ICの電源ピンのすぐ近くに置くパスコンとして、もっともよく使われる値は?", kind: "value",
      choices: ["0.1μF", "1F", "1pF", "4700μF"],
      explain: "0.1μF(表記 104)のセラミックコンデンサーが定番です。",
      ref: "bypass"
    },
    {
      id: "k12", level: "std", q: "パスコンを置く場所として正しいのは?", kind: "text",
      choices: [
        "ICの電源ピンとGNDのあいだ、できるだけICの近く",
        "電池のすぐ近くにだけ1個",
        "LEDと直列",
        "ICからできるだけ離れた所"
      ],
      explain: "パスコンはICのすぐ近くに置くほど効果があります。ICごとに1個ずつ置くのが基本です。",
      ref: "bypass"
    },
    {
      id: "k13", level: "pro", q: "10μF のコンデンサーを2個、並列につないだときの容量は?", kind: "value",
      choices: ["20μF", "5μF", "10μF", "100μF"],
      explain: "コンデンサーは並列で足し算です。10 + 10 = 20μF。5μF は直列のときの値です(抵抗と逆)。",
      ref: "cap-combo"
    },
    {
      id: "k14", level: "std", q: "電解コンデンサーを逆向きにつないだり、耐圧以上の電圧をかけたりすると?", kind: "text",
      choices: [
        "発熱して、液もれや破裂のおそれがある",
        "容量が2倍になる",
        "極性が自動で入れかわる",
        "何も起きない"
      ],
      explain: "電解コンデンサーは、逆電圧や耐圧超えに弱い部品です。向きと耐圧を必ず確かめます。",
      ref: "electrolytic"
    },
    {
      id: "k15", level: "basic", q: "コンデンサーに直流をかけたときの動きとして正しいのは?", kind: "text",
      choices: [
        "充電が終わると、電流は流れなくなる",
        "いつまでも同じ大きさの電流が流れ続ける",
        "直流を交流に変える",
        "かけた電圧を2倍にして出す"
      ],
      explain: "コンデンサーは電気がたまるまでは電流が流れますが、充電が終わると直流の電流は止まります。",
      ref: "capacitor"
    }
  ]
});


// =====================================================================
// 10 スイッチと入力
// =====================================================================
ELEC.register("switch", {
  cards: [
    {
      id: "tact-switch", name: "タクトスイッチ", en: "Tactile switch",
      desc: "押している間だけつながり、離すと切れる小さな押しボタンです。足は4本で、2本ずつ内部でつながっています。押したときにつながる組み合わせを、テスターの導通チェックで確かめてから使います。",
      notes: ["ブレッドボードでは、中央の溝をまたぐように差すと使いやすくなります。"]
    },
    {
      id: "switch-types", name: "モーメンタリとオルタネイト", en: "Momentary / Alternate",
      desc: "押している間だけ動くものをモーメンタリ、押すたびに ON と OFF が切りかわって状態が残るものをオルタネイトといいます。",
      options: [
        ["モーメンタリ", "タクトスイッチ、キーボードのキー"],
        ["オルタネイト", "押すたびに切りかわる電源スイッチなど"],
        ["スライド・トグル", "レバーの位置で ON / OFF を保つ"]
      ]
    },
    {
      id: "digital-input", name: "デジタル入力", en: "Digital input",
      desc: "マイコンの入力ピンは、電圧を HIGH か LOW のどちらかとして読みます。Arduino Uno(5V)では、約 3V 以上なら HIGH、約 1.5V 以下なら LOW と読まれます。そのあいだの電圧では、どちらになるか決まりません。",
      options: [
        ["HIGH", "約 3V 以上(電源電圧の 0.6 倍以上)"],
        ["LOW", "約 1.5V 以下(電源電圧の 0.3 倍以下)"]
      ]
    },
    {
      id: "floating", name: "浮いた入力", en: "Floating input",
      desc: "どこにもつながっていない入力ピンは、まわりのノイズや手を近づけただけで HIGH と LOW がふらふら変わります。スイッチを押していないときの状態を、プルアップかプルダウンで決めておきます。",
      fig: "floating"
    },
    {
      id: "pull-up", name: "プルアップ", en: "Pull-up resistor",
      desc: "入力ピンを抵抗(10kΩ など)で電源につないでおく方法です。スイッチを押していないときは HIGH、押すとピンが GND につながって LOW になります。",
      fig: "pullup",
      notes: ["抵抗のかわりに電線で直結すると、スイッチを押した瞬間に電源と GND がショートします。"]
    },
    {
      id: "pull-down", name: "プルダウン", en: "Pull-down resistor",
      desc: "入力ピンを抵抗で GND につないでおく方法です。スイッチを押していないときは LOW、押すと電源につながって HIGH になります。",
      fig: "pulldown"
    },
    {
      id: "input-pullup", name: "INPUT_PULLUP", en: "pinMode(pin, INPUT_PULLUP)", mono: true,
      desc: "Arduino のピンの中にあるプルアップ抵抗(Uno では 20〜50kΩ 程度)を使う設定です。外に抵抗をつけずに、スイッチをピンと GND のあいだにつなぐだけで済みます。押すと LOW になるので、プログラムでは LOW を「押した」と読みます。",
      code: [{ cap: "スケッチ", text: "void setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  if (digitalRead(2) == LOW) {\n    digitalWrite(13, HIGH); // 押した\n  } else {\n    digitalWrite(13, LOW);\n  }\n}" }]
    },
    {
      id: "chattering", name: "チャタリング", en: "Contact bounce (chattering)",
      desc: "スイッチの金属の接点がはねて、押した瞬間や離した瞬間に、ON と OFF が短いあいだ(数ms 程度)に何度もくり返されることです。1回押しただけなのに、何回も押したと数えられてしまいます。",
      fig: "chatter"
    },
    {
      id: "debounce", name: "チャタリング対策", en: "Debouncing",
      desc: "ソフトウェアでは、変化を見つけたら数十ms 待ってからもう一度読み、同じなら本当の変化とみなします。ハードウェアでは、抵抗とコンデンサーで信号をなめらかにする方法があります。",
      code: [{ cap: "いちばん簡単な例", text: "if (digitalRead(2) == LOW) {\n  delay(20);  // はねが収まるのを待つ\n  if (digitalRead(2) == LOW) {\n    // 押されたと判断する\n  }\n}" }]
    }
  ],
  questions: [
    {
      id: "s01", level: "basic", q: "図の回路で、スイッチを押していないとき、D2 が読む値は?", kind: "text", fig: "pullup",
      choices: ["HIGH(5V)", "LOW(0V)", "HIGH と LOW が交互になる", "ショートして読めない"],
      explain: "押していないとき、D2 は 10kΩ を通して 5V につながっているので HIGH です。これがプルアップです。",
      ref: "pull-up"
    },
    {
      id: "s02", level: "basic", q: "図の回路で、スイッチを押したとき、D2 が読む値は?", kind: "text", fig: "pullup",
      choices: ["LOW(0V)", "HIGH(5V)", "不定(ふらふらする)", "ちょうど 2.5V"],
      explain: "押すと D2 が GND に直接つながるので LOW になります。10kΩ があるので、5V と GND はショートしません。",
      ref: "pull-up"
    },
    {
      id: "s03", level: "basic", q: "図の回路で、スイッチを押したとき、D2 が読む値は?", kind: "text", fig: "pulldown",
      choices: ["HIGH(5V)", "LOW(0V)", "不定(ふらふらする)", "ちょうど 2.5V"],
      explain: "プルダウンでは、押すと D2 が 5V につながって HIGH になります。押していないときは 10kΩ を通して GND につながり LOW です。",
      ref: "pull-down"
    },
    {
      id: "s04", level: "std", q: "図の回路で、スイッチを押していないとき、D2 の値はどうなる?", kind: "text", fig: "floating",
      choices: [
        "不定(ノイズで HIGH と LOW がふらふら変わる)",
        "必ず LOW",
        "必ず HIGH",
        "2.5V に固定される"
      ],
      explain: "押していないとき D2 はどこにもつながっていない(浮いている)ので、値が決まりません。プルアップかプルダウンが必要です。",
      ref: "floating"
    },
    {
      id: "s05", level: "std", q: "スイッチをピン2と GND のあいだにつなぎ、下のように設定した。スイッチを押したとき、`digitalRead(2)` の値は?", kind: "value",
      code: [{ cap: "スケッチ", text: "void setup() {\n  pinMode(2, INPUT_PULLUP);\n}" }],
      choices: ["LOW", "HIGH", "1023", "不定"],
      explain: "INPUT_PULLUP は内蔵のプルアップです。押すとピンが GND につながるので LOW。押していないときは HIGH です。",
      ref: "input-pullup"
    },
    {
      id: "s06", level: "std", q: "プルアップ抵抗の役目は?", kind: "text",
      choices: [
        "スイッチを押していないときの入力を HIGH に決める",
        "スイッチに流れる電流を増やす",
        "チャタリングを完全になくす",
        "電源の電圧を上げる"
      ],
      explain: "プルアップ抵抗は、押していないときに入力が浮かないよう HIGH に引き上げておくためのものです。",
      ref: "pull-up"
    },
    {
      id: "s07", level: "std", q: "5V と 10kΩ のプルアップ回路で、スイッチを押している間に抵抗を流れる電流は?", kind: "value", fig: "pullup",
      choices: ["0.5mA", "5mA", "50mA", "0.05mA"],
      explain: "押すと抵抗の両端に 5V がかかるので、I = 5 ÷ 10000 = 0.0005A = 0.5mA。小さな電流で済むのが 10kΩ を使う理由です。",
      ref: "pull-up"
    },
    {
      id: "s08", level: "pro", q: "プルアップ回路で、抵抗のかわりに電線で 5V に直結すると、どうなる?", kind: "text", fig: "pullup",
      choices: [
        "スイッチを押した瞬間に、5V と GND がショートする",
        "HIGH と LOW が逆になる",
        "チャタリングがなくなる",
        "何も変わらない"
      ],
      explain: "抵抗がないと、押したときに 5V からスイッチを通って GND へ、抵抗ほぼ0の道ができます。ショートです。",
      ref: "pull-up"
    },
    {
      id: "s09", level: "basic", q: "チャタリングとは?", kind: "text", fig: "chatter",
      choices: [
        "スイッチの接点がはねて、短いあいだに ON と OFF が何度もくり返されること",
        "スイッチを長押しすると壊れること",
        "プルアップ抵抗が熱くなること",
        "スイッチを押す音がうるさいこと"
      ],
      explain: "接点がはねるため、1回押しただけで何回も押したように読まれることがあります。",
      ref: "chattering"
    },
    {
      id: "s10", level: "std", q: "チャタリングが続く時間の目安は?", kind: "text",
      choices: ["数ms〜十数ms 程度", "数秒〜十数秒 程度", "数分 程度", "数ピコ秒 程度"],
      explain: "多くのスイッチで数ms〜十数ms 程度です。そのため、変化のあと数十ms 待つ対策がよく使われます。",
      ref: "chattering"
    },
    {
      id: "s11", level: "std", q: "ソフトウェアでのチャタリング対策として正しいのは?", kind: "text",
      choices: [
        "変化を見つけたら数十ms 待ってから、もう一度読んで確かめる",
        "ピンを OUTPUT に設定する",
        "プルアップ抵抗を外す",
        "電源の電圧を上げる"
      ],
      explain: "はねが収まるのを待ってから読み直し、同じ値なら本当の変化とみなします。",
      ref: "debounce"
    },
    {
      id: "s12", level: "basic", q: "タクトスイッチの動きとして正しいのは?", kind: "text",
      choices: [
        "押している間だけつながり、離すと切れる",
        "1回押すとつながったままになり、もう1回押すと切れる",
        "いつもつながっている",
        "押すと電流の向きが逆になる"
      ],
      explain: "タクトスイッチはモーメンタリ(押している間だけ ON)です。押すたびに切りかわるのはオルタネイトです。",
      ref: "tact-switch"
    },
    {
      id: "s13", level: "pro", q: "Arduino Uno(5V)のデジタル入力で、HIGH と読まれる電圧の目安は?", kind: "value",
      choices: ["約3V以上", "約0.5V以上", "ちょうど5Vのときだけ", "約1V以上"],
      explain: "Uno のマイコン(ATmega328P)は、電源電圧の 0.6 倍(約 3V)以上を HIGH、0.3 倍(約 1.5V)以下を LOW と読みます。",
      ref: "digital-input"
    },
    {
      id: "s14", level: "std", q: "4本足のタクトスイッチを使うときの注意として正しいのは?", kind: "text",
      choices: [
        "2本ずつ内部でつながっているので、押したときにつながる組を確かめて使う",
        "4本の足はすべて内部でばらばらなので、どの2本を使っても同じ",
        "4本のうち1本は GND 専用の足になっている",
        "4本すべてをつながないと動かない"
      ],
      explain: "最初からつながっている2本を選ぶと、押さなくても ON のままになります。導通チェックで確かめてから使います。",
      ref: "tact-switch"
    },
    {
      id: "s15", level: "std", q: "オルタネイト動作のスイッチとは?", kind: "text",
      choices: [
        "押すたびに ON と OFF が切りかわり、手を離しても状態が残る",
        "押している間だけ ON になる",
        "光が当たると ON になる",
        "温度が上がると ON になる"
      ],
      explain: "オルタネイトは押すたびに切りかわって状態が残ります。押している間だけ ON になるのはモーメンタリです。",
      ref: "switch-types"
    }
  ]
});


// =====================================================================
// 11 トランジスタとMOSFET
// =====================================================================
ELEC.register("transistor", {
  cards: [
    {
      id: "npn", name: "NPNトランジスタ", en: "NPN bipolar transistor",
      desc: "足は B(ベース)・C(コレクタ)・E(エミッタ)の3本。ベースからエミッタへ小さな電流を流すと、コレクタからエミッタへ大きな電流が流れます。小さな電流で大きな電流をON/OFFするスイッチとして使えます。",
      options: [
        ["B ベース", "制御用の小さな電流を入れる"],
        ["C コレクタ", "負荷(LED・モーターなど)の側"],
        ["E エミッタ", "GND の側(NPN のとき)"]
      ],
      notes: ["足の並び(EBC、ECB など)は品種でちがいます。データシートで確かめます。"]
    },
    {
      id: "tr-switch", name: "スイッチとしての使い方", en: "Transistor as a switch",
      desc: "エミッタを GND に、負荷(LED・リレーなど)を電源とコレクタのあいだにつなぎます(ローサイドスイッチ)。マイコンのピンからベース抵抗を通してベースに電流を流すと、負荷に電流が流れます。",
      fig: "tr-led",
      notes: ["ピンが HIGH でベースに電流が流れると ON、LOW で OFF になります。"]
    },
    {
      id: "base-resistor", name: "ベース抵抗", en: "Base resistor",
      desc: "ベースに流す電流を決める抵抗です。ベースとエミッタのあいだには約 0.7V(Vbe)がかかるので、Rb = (ピンの電圧 − 0.7V) ÷ ベース電流 で求めます。",
      options: [
        ["式", "Rb = (Vout − Vbe) ÷ Ib"],
        ["例", "(5 − 0.7) ÷ 0.001 = 4300Ω → E12 で 4.7kΩ"],
        ["4.7kΩ のとき", "Ib = 4.3 ÷ 4700 ≒ 0.91mA"]
      ],
      notes: ["ベース抵抗なしでピンをベースにつなぐと、大きな電流が流れて、ピンもトランジスタも壊れるおそれがあります。"]
    },
    {
      id: "hfe", name: "hFE(直流電流増幅率)", en: "DC current gain",
      desc: "ベース電流の何倍のコレクタ電流を流せるかを表します。増幅しているときは Ic = hFE × Ib です。スイッチとして使うときは、必要な Ic ÷ hFE より多め(数倍)のベース電流を流して、しっかり ON(飽和)させます。",
      options: [
        ["Ic = hFE × Ib", "hFE 100、Ib 1mA なら最大 100mA"],
        ["スイッチのとき", "計算した Ib の数倍を流す"]
      ],
      notes: ["hFE は同じ品種でも1個ずつ大きくばらつきます。ぎりぎりの値で設計しません。"]
    },
    {
      id: "mosfet", name: "MOSFET", en: "N-channel MOSFET",
      desc: "足は G(ゲート)・D(ドレイン)・S(ソース)の3本。ゲートとソースのあいだの電圧で、ドレインからソースへの電流を ON/OFF します。ゲートには(切りかえの瞬間を除いて)ほとんど電流が流れず、大きな電流を扱うのに向いています。",
      options: [
        ["G ゲート", "電圧で ON / OFF を決める"],
        ["D ドレイン", "負荷の側"],
        ["S ソース", "GND の側(Nチャネルのとき)"]
      ]
    },
    {
      id: "logic-level-fet", name: "ロジックレベルMOSFET", en: "Logic-level MOSFET",
      desc: "5V や 3.3V のゲート電圧で、十分に ON になる品種です。データシートの Vth(ゲートしきい値電圧)は「流れ始める」目安で、完全に ON になる電圧ではありません。ON 抵抗 RDS(on) が、使いたいゲート電圧(4.5V、2.5V など)で決められているものを選びます。",
      notes: ["ゲート電圧が足りないと、中途半端に ON になって MOSFET が熱くなります。"]
    },
    {
      id: "gate-resistors", name: "ゲート抵抗とプルダウン", en: "Gate resistor / Pull-down",
      desc: "ゲートには 100Ω 前後の抵抗を直列に入れ、切りかえの瞬間に流れる電流をおさえます。ゲートとソース(GND)のあいだには 10kΩ ほどの抵抗を入れ、マイコンが起動する前などにゲートを 0V に保って OFF にしておきます。"
    },
    {
      id: "flyback", name: "還流ダイオード", en: "Flyback diode",
      desc: "モーター・リレー・ソレノイドなどのコイルの部品は、電流を切った瞬間に高い電圧(逆起電力)を出します。部品と並列に、カソードを電源の+側に向けてダイオードをつなぎ、この電流を逃がしてトランジスタや MOSFET を守ります。",
      fig: "tr-motor",
      notes: ["向きを逆にすると、電源をショートしてしまいます。"]
    },
    {
      id: "relay", name: "リレー", en: "Relay",
      desc: "電磁石で接点を動かすスイッチです。コイルの回路(小さな電流)と、接点の回路(大きな電流)が電気的に分かれています。コイルはトランジスタで動かし、還流ダイオードをつけます。",
      notes: ["家庭用 100V の機器をリレーで動かすのは、感電・火災の危険があるので、電子工作の練習では扱いません。"]
    },
    {
      id: "motor-drive", name: "モーターを動かすとき", en: "Driving a motor",
      desc: "モーターはマイコンのピンに直接つなぎません。ピンから流せる電流では足りず、逆起電力やノイズでマイコンが壊れるおそれがあります。トランジスタや MOSFET、モータードライバーを使います。",
      notes: ["モーター用の電源は別に用意し、マイコンと GND をつないで共通にします。"]
    }
  ],
  questions: [
    {
      id: "x01", level: "basic", q: "NPNトランジスタの3本の足の名前は?", kind: "text",
      choices: ["ベース・コレクタ・エミッタ", "ゲート・ドレイン・ソース", "アノード・カソード・ゲート", "入力・GND・出力"],
      explain: "バイポーラトランジスタは B・C・E です。G・D・S は MOSFET、入力・GND・出力 は三端子レギュレータです。",
      ref: "npn"
    },
    {
      id: "x02", level: "basic", q: "MOSFET の3本の足の名前は?", kind: "text",
      choices: ["ゲート・ドレイン・ソース", "ベース・コレクタ・エミッタ", "アノード・カソード・ゲート", "入力・GND・出力"],
      explain: "MOSFET は G(ゲート)・D(ドレイン)・S(ソース)です。",
      ref: "mosfet"
    },
    {
      id: "x03", level: "std", q: "Arduino(HIGH = 5V)のピンから、ベース電流 1mA を流したい。Vbe = 0.7V として、ベース抵抗は?", kind: "value", fig: "tr-led",
      choices: ["4.3kΩ", "5kΩ", "5.7kΩ", "0.7kΩ"],
      explain: "Rb = (5 − 0.7) ÷ 0.001 = 4300Ω = 4.3kΩ。5kΩ は Vbe を引き忘れたとき、5.7kΩ は足してしまったときの値です。実際は E12 の 4.7kΩ などを使います。",
      ref: "base-resistor"
    },
    {
      id: "x04", level: "std", q: "hFE が 200 のトランジスタに、ベース電流 0.5mA を流した。流せるコレクタ電流の最大はおよそ?", kind: "value",
      choices: ["100mA", "400mA", "200.5mA", "0.0025mA"],
      explain: "Ic = hFE × Ib = 200 × 0.5mA = 100mA。400mA は 200 ÷ 0.5、0.0025mA は 0.5 ÷ 200 としたときの値です。",
      ref: "hfe"
    },
    {
      id: "x05", level: "pro", q: "hFE が 100 のトランジスタで、100mA の負荷を確実に ON/OFF したい。ベース電流の考え方として適切なのは?", kind: "text",
      choices: [
        "計算上の 1mA より多め(数mA)を流して、確実に飽和させる",
        "ちょうど 1mA にする(多いと必ず壊れる)",
        "hFE が 100 なので、0.1mA で十分",
        "コレクタと同じ 100mA をベースにも流す"
      ],
      explain: "100mA ÷ 100 = 1mA が計算上の最小です。hFE はばらつくので、数倍のベース電流を流してしっかり ON にします。",
      ref: "hfe"
    },
    {
      id: "x06", level: "basic", q: "図の回路で、LEDが光るのはどんなとき?", kind: "text", fig: "tr-led",
      choices: ["D9 を HIGH にしたとき", "D9 を LOW にしたとき", "D9 を入力(INPUT)にしたとき", "いつも光らない"],
      explain: "D9 が HIGH になるとベース抵抗を通ってベースに電流が流れ、トランジスタが ON になって LED に電流が流れます。",
      ref: "tr-switch"
    },
    {
      id: "x07", level: "std", q: "Nチャネル MOSFET について正しいのは?", kind: "text",
      choices: [
        "ゲートにはほとんど電流が流れず、ゲートの電圧で ON / OFF が決まる",
        "ベース電流に比例してドレイン電流が流れる",
        "ゲートに大きな電流を流すほど、よく流れる",
        "ゲートを GND にすると、完全に ON になる"
      ],
      explain: "MOSFET は電圧で動く部品です。ゲートとソースのあいだに十分な電圧をかけると ON、0V にすると OFF になります。",
      ref: "mosfet"
    },
    {
      id: "x08", level: "pro", q: "データシートに「Vth(ゲートしきい値電圧)2V」とある MOSFET について正しいのは?", kind: "text",
      choices: [
        "2V は流れ始める目安で、2V で完全に ON になるわけではない",
        "ゲートを 2V 以上にすれば、どんな電流でも完全に ON になる",
        "ゲートに 2V をかけると壊れる",
        "ドレインに流せる最大の電流が 2A という意味"
      ],
      explain: "Vth はわずかに電流が流れ始める電圧です。大きな電流を流すには、RDS(on) が決められたゲート電圧(4.5V など)をかけられるかを確かめます。",
      ref: "logic-level-fet"
    },
    {
      id: "x09", level: "std", q: "図の回路で、モーターと並列にダイオードをつける理由は?", kind: "text", fig: "tr-motor",
      choices: [
        "電流を切った瞬間に出る高い電圧(逆起電力)を逃がして、MOSFET を守るため",
        "モーターを速く回すため",
        "モーターの回転の向きを逆にするため",
        "電源の電圧を上げるため"
      ],
      explain: "コイルは電流を切った瞬間に高い電圧を出します。ダイオードがその電流の通り道になり、MOSFET に高い電圧がかかるのを防ぎます。",
      ref: "flyback"
    },
    {
      id: "x10", level: "std", q: "還流ダイオードの正しい向きは?", kind: "text", fig: "tr-motor",
      choices: [
        "カソードを電源の+側、アノードを MOSFET(GND)側にして、モーターと並列",
        "カソードを MOSFET(GND)側にして、モーターと並列",
        "向きはどちらでもよい",
        "モーターと直列に入れる"
      ],
      explain: "ふだんは逆向きで電流が流れず、切った瞬間だけモーターの電流がダイオードを回って流れる向きにします。逆にすると、MOSFET が ON のときに電源をショートします。",
      ref: "flyback"
    },
    {
      id: "x11", level: "basic", q: "モーターを Arduino のピンに直接つながない理由は?", kind: "text",
      choices: [
        "ピンから流せる電流では足りず、逆起電力やノイズでマイコンが壊れるおそれがあるから",
        "モーターは交流でしか動かないから",
        "ピンの電圧が高すぎるから",
        "モーターには極性がないから"
      ],
      explain: "小さなモーターでも数百mA 流れることがあり、ピンの上限(20mA 程度が目安)を大きく超えます。トランジスタや MOSFET を使います。",
      ref: "motor-drive"
    },
    {
      id: "x12", level: "std", q: "リレーの特長として正しいのは?", kind: "text",
      choices: [
        "コイルの回路と接点の回路が、電気的に分かれている",
        "電流を増幅する半導体の部品である",
        "接点が光で動く",
        "交流を直流に変える"
      ],
      explain: "リレーは電磁石で接点を動かすので、コイル側と接点側の回路がつながっていません。",
      ref: "relay"
    },
    {
      id: "x13", level: "std", q: "モーター用の電池と Arduino を、別の電源にするときに必要なことは?", kind: "text",
      choices: [
        "GND どうしをつないで共通にする",
        "+どうしをつなぐ",
        "どこもつながない",
        "Arduino の GND だけを外しておく"
      ],
      explain: "電圧は2点の差なので、基準(GND)がそろっていないと、Arduino の信号で MOSFET やトランジスタを正しく動かせません。",
      ref: "motor-drive"
    },
    {
      id: "x14", level: "pro", q: "MOSFET のゲートとソース(GND)のあいだに 10kΩ をつなぐ理由は?", kind: "text",
      choices: [
        "マイコンが起動する前などに、ゲートを 0V に保って OFF にしておくため",
        "ゲートに流れる電流を増やすため",
        "MOSFET の耐圧を上げるため",
        "PWM の周波数を上げるため"
      ],
      explain: "マイコンのピンは、起動直後は入力(浮いた状態)です。ゲートが浮くと勝手に ON になることがあるので、抵抗で 0V に引き下げておきます。",
      ref: "gate-resistors"
    },
    {
      id: "x15", level: "pro", q: "D9 が HIGH(5V)、ベース抵抗 4.7kΩ、Vbe = 0.7V のとき、ベース電流はおよそ?", kind: "value", fig: "tr-led",
      choices: ["約0.9mA", "約1.1mA", "約0.15mA", "約9mA"],
      explain: "Ib = (5 − 0.7) ÷ 4700 = 4.3 ÷ 4700 ≒ 0.00091A ≒ 0.9mA。約1.1mA は Vbe を引き忘れたとき(5 ÷ 4700)、約0.15mA は 0.7 ÷ 4700 としたときの値です。",
      ref: "base-resistor"
    }
  ]
});


// =====================================================================
// 12 マイコン入門
// =====================================================================
ELEC.register("arduino", {
  cards: [
    {
      id: "arduino", name: "Arduino Uno", en: "Arduino Uno (ATmega328P)",
      desc: "電子工作で定番のマイコンボードです。5V で動き、パソコンと USB でつないで、Arduino IDE でプログラム(スケッチ)を書きこみます。",
      options: [
        ["D0〜D13", "デジタル入出力(D0・D1 はシリアル通信と共用)"],
        ["~3 ~5 ~6 ~9 ~10 ~11", "PWM が使えるピン(~ の印)"],
        ["A0〜A5", "アナログ入力(analogRead)"],
        ["5V・3.3V・GND", "電源のピン"]
      ]
    },
    {
      id: "setup-loop", name: "setup と loop", en: "setup() / loop()", mono: true,
      desc: "スケッチには必ず2つの関数があります。setup() は電源を入れたとき(リセットしたとき)に1回だけ、loop() はそのあと、ずっとくり返し実行されます。",
      code: [{ cap: "LEDの点滅(Blink)", text: "void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}" }]
    },
    {
      id: "pinmode", name: "pinMode", en: "pinMode(pin, mode)", mono: true,
      desc: "ピンを出力にするか入力にするかを決めます。ふつうは setup() の中で書きます。",
      options: [
        ["OUTPUT", "出力。LED などを動かす"],
        ["INPUT", "入力。外にプルアップかプルダウンの抵抗をつける"],
        ["INPUT_PULLUP", "入力。内蔵のプルアップを使う"]
      ]
    },
    {
      id: "digital-write", name: "digitalWrite", en: "digitalWrite(pin, value)", mono: true,
      desc: "出力ピンを HIGH(Uno では約 5V)か LOW(0V)にします。LED を抵抗と一緒につなげば、点けたり消したりできます。",
      fig: "uno-led",
      notes: ["図の回路では、LED に (5 − 2.0) ÷ 220 ≒ 14mA 流れます。"]
    },
    {
      id: "digital-read", name: "digitalRead", en: "digitalRead(pin)", mono: true,
      desc: "入力ピンの状態を HIGH か LOW で読みます。スイッチの状態を調べるのに使います。"
    },
    {
      id: "analog-read", name: "analogRead", en: "analogRead(pin)", mono: true,
      desc: "A0〜A5 のピンの電圧を、0〜1023 の数で読みます(10ビット)。Uno では 0V が 0、5V が 1023 です。読んだ値を電圧に直すには、値 × 5 ÷ 1023 を計算します。",
      fig: "adc",
      code: [{ cap: "電圧に直す", text: "int v = analogRead(A0);\nfloat volt = v * 5.0 / 1023.0;" }],
      notes: ["5 ÷ 1024 で計算することもあります。どちらでも、ちがいは 0.005V 程度です。"]
    },
    {
      id: "pwm", name: "PWM と analogWrite", en: "Pulse Width Modulation / analogWrite(pin, 0〜255)",
      desc: "5V と 0V をすばやく切りかえ、ON の時間の割合(デューティ比)で平均の電圧を変える方法です。analogWrite に 0〜255 の値を入れると、0%〜100% のデューティ比になります。LED の明るさやモーターの速さの調整に使います。",
      fig: "pwm",
      options: [
        ["analogWrite(9, 0)", "0%(ずっと 0V)"],
        ["analogWrite(9, 127)", "約50%(平均 約2.5V)"],
        ["analogWrite(9, 255)", "100%(ずっと 5V)"]
      ],
      notes: ["本当に一定の電圧が出るわけではなく、平均として変わります。Uno で使えるのは ~ の印がある 3・5・6・9・10・11 番ピンです。"]
    },
    {
      id: "pin-current", name: "1ピンに流せる電流", en: "Pin current limit",
      desc: "Uno のピン1本の絶対最大定格は 40mA ですが、実際に使うのは 20mA 程度までにします。ピン全部の合計にも上限(マイコン全体で 200mA)があります。",
      notes: ["LED 1個なら直接つなげますが、モーターやリレーはトランジスタや MOSFET を通して動かします。"]
    },
    {
      id: "serial", name: "シリアルモニター", en: "Serial.begin / Serial.println", mono: true,
      desc: "Arduino からパソコンへ文字や数を送って、Arduino IDE のシリアルモニターで見る機能です。センサーの値を確かめたり、プログラムの動きを調べたりするのに使います。",
      code: [{ cap: "A0 の値を表示", text: "void setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  Serial.println(analogRead(A0));\n  delay(500);\n}" }],
      notes: ["シリアルモニターの通信速度を、Serial.begin の値(9600 など)と同じにしないと、文字化けします。"]
    }
  ],
  questions: [
    {
      id: "a01", level: "basic", q: "スケッチの `setup()` と `loop()` について正しいのは?", kind: "text",
      choices: [
        "setup は最初に1回、loop はそのあとずっとくり返し実行される",
        "loop は最初に1回、setup はそのあとずっとくり返し実行される",
        "どちらも電源を入れたときに1回だけ実行される",
        "どちらもボタンを押したときだけ実行される"
      ],
      explain: "setup() で準備(pinMode など)をして、loop() に何度もくり返す処理を書きます。",
      ref: "setup-loop"
    },
    {
      id: "a02", level: "basic", q: "13番ピンにつないだ LED を点けるために、ピンを出力にする命令は?", kind: "value",
      choices: ["pinMode(13, OUTPUT);", "pinMode(13, INPUT);", "digitalRead(13);", "analogRead(13);"],
      explain: "出力にするのは pinMode(13, OUTPUT)。INPUT は入力、digitalRead は入力の状態を読む命令です。",
      ref: "pinmode"
    },
    {
      id: "a03", level: "basic", q: "Arduino Uno で `digitalWrite(13, HIGH);` としたとき、13番ピンの電圧は?", kind: "value",
      choices: ["約5V", "約3.3V", "約0V", "約1023V"],
      explain: "Uno は 5V で動くので、HIGH は約 5V です。3.3V で動くボード(ESP32 など)なら約 3.3V になります。",
      ref: "digital-write"
    },
    {
      id: "a04", level: "std", q: "Arduino Uno の `analogRead` が返す値の範囲は?", kind: "value",
      choices: ["0〜1023", "0〜255", "0〜100", "0〜5"],
      explain: "10ビットなので 2¹⁰ = 1024 段階、0〜1023 です。0〜255 は analogWrite の範囲です。",
      ref: "analog-read"
    },
    {
      id: "a05", level: "std", q: "Arduino Uno(5V、10ビット)で `analogRead(A0)` が 512 だった。A0 の電圧はおよそ?", kind: "value", fig: "adc",
      choices: ["約2.5V", "約5V", "約1.0V", "約0.5V"],
      explain: "512 × 5 ÷ 1023 ≒ 2.50V。1023 のおよそ半分なので、5V のおよそ半分です。",
      ref: "analog-read"
    },
    {
      id: "a06", level: "pro", q: "Arduino Uno(5V、10ビット)で `analogRead(A0)` が 205 だった。A0 の電圧はおよそ?", kind: "value", fig: "adc",
      choices: ["約1.0V", "約4.0V", "約2.05V", "約0.2V"],
      explain: "205 × 5 ÷ 1023 ≒ 1.00V。約4.0V は (1023 − 205) で計算したとき、約2.05V は値を100で割っただけのときの値です。",
      ref: "analog-read"
    },
    {
      id: "a07", level: "pro", q: "Arduino Uno(5V、10ビット)の A0 に 3.0V をかけた。`analogRead(A0)` の値はおよそ?", kind: "value",
      choices: ["約614", "約153", "約300", "約3"],
      explain: "3.0 × 1023 ÷ 5 ≒ 613.8 ≒ 614。約153 は analogWrite の範囲(255)で計算したときの値です。",
      ref: "analog-read"
    },
    {
      id: "a08", level: "std", q: "Arduino Uno の `analogWrite` に入れる値の範囲は?", kind: "value",
      choices: ["0〜255", "0〜1023", "0〜100", "0〜5"],
      explain: "analogWrite は 8ビットの 0〜255 です。analogRead の 0〜1023 と混同しやすいので注意します。",
      ref: "pwm"
    },
    {
      id: "a09", level: "std", q: "Arduino Uno(5V)で `analogWrite(9, 127);` としたとき、9番ピンの出力について正しいのは?", kind: "text", fig: "pwm",
      choices: [
        "5V と 0V をすばやく切りかえ、ON の割合が約50%(平均 約2.5V)",
        "ずっと一定の 2.5V が出る",
        "ずっと 5V が出る",
        "127V が出る"
      ],
      explain: "PWM なので出力は 5V と 0V の切りかえです。127 ÷ 255 ≒ 50% が ON なので、平均は約 2.5V になります。",
      ref: "pwm"
    },
    {
      id: "a10", level: "pro", q: "Arduino Uno で、デューティ比 約25%(平均 約1.25V)の PWM を出したい。`analogWrite` に入れる値は?", kind: "value", fig: "pwm",
      choices: ["64", "25", "256", "191"],
      explain: "255 × 0.25 ≒ 63.75 なので 64。25 は % の数字をそのまま入れたとき、191 は 75% のときの値です。256 は範囲(0〜255)の外です。",
      ref: "pwm"
    },
    {
      id: "a11", level: "std", q: "Arduino Uno で PWM(analogWrite)が使えるピンは?", kind: "value",
      choices: ["3、5、6、9、10、11", "0〜13 のすべて", "A0〜A5", "13 だけ"],
      explain: "ボードに ~ の印がある 3・5・6・9・10・11 番ピンです。",
      ref: "pwm"
    },
    {
      id: "a12", level: "std", q: "Arduino Uno のピン1本から流す電流の目安は?", kind: "text",
      choices: [
        "20mA 程度まで(絶対最大定格は 40mA)",
        "1A まで",
        "200mA まで",
        "電流の上限はない"
      ],
      explain: "絶対最大定格は 40mA ですが、余裕を見て 20mA 程度までにします。200mA はマイコン全体の合計の上限です。",
      ref: "pin-current"
    },
    {
      id: "a13", level: "std", q: "図の回路で D13 を HIGH にしたとき、LED に流れる電流はおよそ?(Arduino Uno、5V)", kind: "value", fig: "uno-led",
      choices: ["約14mA", "約23mA", "約9mA", "約32mA"],
      explain: "I = (5 − 2.0) ÷ 220 = 3 ÷ 220 ≒ 0.0136A ≒ 14mA。20mA 以下なのでピンから直接流せます。約23mA は Vf を引き忘れたとき(5 ÷ 220)の値です。",
      ref: "digital-write"
    },
    {
      id: "a14", level: "basic", q: "A0 の値をシリアルモニターに1行ずつ表示したい。空欄に入るのは?", kind: "value",
      code: [{ cap: "スケッチ", text: "void setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  int v = analogRead(A0);\n  ____;\n  delay(500);\n}" }],
      choices: ["Serial.println(v)", "digitalWrite(v)", "analogWrite(v)", "pinMode(v)"],
      explain: "Serial.println は値を送って改行します。Serial.begin で通信を始めておく必要があります。",
      ref: "serial"
    },
    {
      id: "a15", level: "std", q: "シリアルモニターの表示が文字化けする。まず確かめることは?", kind: "text",
      choices: [
        "シリアルモニターの通信速度が、Serial.begin の値と同じか",
        "LED の向きが正しいか",
        "analogWrite の値が 255 以下か",
        "USB ケーブルの色"
      ],
      explain: "Serial.begin(9600) なら、シリアルモニターも 9600bps にします。速度がちがうと文字化けします。",
      ref: "serial"
    }
  ]
});

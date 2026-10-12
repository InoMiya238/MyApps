// 中学数学道場: 式と図のHTMLを組み立てる関数(グローバル M)。
// data-g1.js などのデータファイルは、式をかならずこの関数で作る(見た目の決めごとをここ1か所で守るため)。
//
// 決めごと
//   ・マイナスは引き算も負の符号も U+2212「−」。掛け算は「×」、割り算は「÷」。
//   ・変数(x, y, a …)は <i class="v">。点や図形の名前、π、単位は立体(そのままの文字)。
//   ・二項演算子と等号は <span class="op">(すきまはCSSでつける。空白文字は入れない)。
//   ・式の部品(M.num、M.frac など)は「部品」を返す。画面に出すときは M.m(...) か M.mf("...") で
//     <span class="math"> に包む。4択の選択肢だけは、ページ側が自動で包むので部品のままでよい。
//   ・平行の記号「∥」は、等幅フォントだと直立の「‖」に見えるので、式の中では <span class="sym-par"> に包んで
//     本文フォントで出す(M.m、M.mf、M.wrap が自動で包む)。
var M = (function () {
  "use strict";

  var MINUS = "−";

  // ---------- 小さな道具 ----------
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function rand(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  // 0 を除いた整数の乱数
  function randNZ(min, max) {
    var n = 0;
    while (n === 0) n = rand(min, max);
    return n;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
  function isPrime(n) {
    if (n < 2 || n !== Math.floor(n)) return false;
    for (var i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }
  // 素因数分解。60 → [[2, 2], [3, 1], [5, 1]]
  function factorize(n) {
    var out = [];
    for (var p = 2; p * p <= n; p++) {
      var e = 0;
      while (n % p === 0) { n /= p; e++; }
      if (e) out.push([p, e]);
    }
    if (n > 1) out.push([n, 1]);
    return out;
  }
  function isNum(v) { return typeof v === "number"; }

  // ---------- 数と文字 ----------
  // 数。負の数は U+2212 をつける。小数の誤差(0.1 + 0.2 など)は丸める
  function num(n) {
    var r = Math.round(n * 1e6) / 1e6;
    return (r < 0 ? MINUS : "") + String(Math.abs(r));
  }
  // 演算の中に置く数。負の数にはかっこをつける: (−3)
  function nump(n) { return n < 0 ? "(" + num(n) + ")" : num(n); }
  // 変数
  function v(name) { return '<i class="v">' + esc(name) + "</i>"; }

  var OP_MAP = {
    "+": "+", "-": MINUS, "−": MINUS, "*": "×", "×": "×", "/": "÷", "÷": "÷",
    "=": "=", ":": ":", "<": "&lt;", ">": "&gt;", "<=": "≦", ">=": "≧", "≦": "≦", "≧": "≧",
    "∥": "∥", "⊥": "⊥", "∽": "∽", "≡": "≡", "≒": "≒"
  };
  // 二項演算子・等号・不等号
  function op(sym) {
    return '<span class="op">' + (OP_MAP.hasOwnProperty(sym) ? OP_MAP[sym] : esc(sym)) + "</span>";
  }

  // 部品を左から並べる。
  //   数      → そのまま。ただし + − × ÷ の直後の負の数にはかっこをつける
  //   演算子  → "+" "-" "*" "/" "=" ":" "<" ">" "<=" ">=" などは M.op にする
  //   そのほかの文字列 → HTMLの部品としてそのまま置く
  // 例: M.join(5, "-", -3) → 5 − (−3)    M.join(M.v("x"), "=", -3) → x = −3
  function join() {
    var parts = Array.prototype.slice.call(arguments);
    if (parts.length === 1 && Array.isArray(parts[0])) parts = parts[0];
    var out = "", afterCalc = false;
    parts.forEach(function (p) {
      if (isNum(p)) {
        out += afterCalc ? nump(p) : num(p);
        afterCalc = false;
      } else if (OP_MAP.hasOwnProperty(p)) {
        out += op(p);
        afterCalc = /^[+\-−*×\/÷]$/.test(p);
      } else {
        out += p;
        afterCalc = false;
      }
    });
    return out;
  }
  // 式の中の「∥」を <span class="sym-par"> に包む(すでに包んであるものはそのまま)
  function sym(html) {
    return String(html).replace(/(<span class="sym-par">)?∥/g, function (all, open) {
      return open ? all : '<span class="sym-par">∥</span>';
    });
  }
  // 部品を <span class="math"> に包む。ページが選択肢を包むときもこれを使う
  function wrap(html) { return '<span class="math">' + sym(html) + "</span>"; }
  // 式全体を包む。引数は M.join と同じ
  function m() { return wrap(join.apply(null, arguments)); }

  // ---------- 分数・累乗・根号 ----------
  // 分数。n, d は数か部品。符号は外に出して書くこと(負の分数は "−" + M.frac(3, 4)、または M.fracNum)
  function frac(n, d) {
    var nh = isNum(n) ? num(n) : n, dh = isNum(d) ? num(d) : d;
    return '<span class="frac" role="img" aria-label="' + esc(text(dh) + "分の" + text(nh)) + '">' +
      '<span class="num">' + nh + '</span><span class="den">' + dh + "</span></span>";
  }
  // 数としての分数。約分し、符号を前に出し、分母が1なら整数にする(同じ値は必ず同じHTMLになる)
  function fracNum(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    n /= g; d /= g;
    if (d === 1) return num(n);
    return (n < 0 ? MINUS : "") + frac(Math.abs(n), d);
  }
  // 累乗。M.pow("x", 2) → x²   M.pow(-3, 2) → (−3)²   M.pow(3, 2) → 3²
  // base が1文字の英小文字なら変数、数なら数(負はかっこつき)、それ以外は部品としてそのまま
  function pow(base, exp) {
    var b = isNum(base) ? nump(base) : (/^[a-z]$/.test(base) ? v(base) : base);
    return b + "<sup>" + (isNum(exp) ? num(exp) : exp) + "</sup>";
  }
  // 根号。M.sqrt(12) → √12   M.sqrt(3, 2) → 2√3   M.sqrt(3, -1) → −√3
  function sqrt(body, coef) {
    var c = "";
    if (coef !== undefined && coef !== 1) c = coef === -1 ? MINUS : (isNum(coef) ? num(coef) : coef);
    return c + '<span class="sqrt"><span class="sqrt-sign">√</span><span class="sqrt-body">' +
      (isNum(body) ? num(body) : body) + "</span></span>";
  }

  // ---------- 項と多項式 ----------
  // 係数は 数 か [分子, 分母]
  function coefParts(c) {
    if (Array.isArray(c)) {
      var n = c[0], d = c[1];
      if (d < 0) { n = -n; d = -d; }
      var g = gcd(n, d) || 1;
      return { sign: n < 0 ? -1 : (n > 0 ? 1 : 0), n: Math.abs(n) / g, d: d / g };
    }
    return { sign: c < 0 ? -1 : (c > 0 ? 1 : 0), n: Math.abs(c), d: 1 };
  }
  function absTerm(p, varHtml) {
    if (p.d !== 1) return frac(p.n, p.d) + (varHtml || "");
    if (!varHtml) return num(p.n);
    return (p.n === 1 ? "" : num(p.n)) + varHtml;
  }
  // 1つの項。M.term(-1, M.v("x")) → −x   M.term(3, M.v("x")) → 3x   M.term([1, 2], M.v("x")) → ½x
  // 係数が 0 なら空文字。varHtml を省くと数だけ
  function term(coef, varHtml) {
    var p = coefParts(coef);
    if (p.sign === 0) return "";
    return (p.sign < 0 ? MINUS : "") + absTerm(p, varHtml);
  }
  // 多項式。terms = [[係数, 文字の部品], …]。係数0の項はとばす。同類項はまとめない(書いた順に並べる)
  // 例: M.poly([[3, M.v("x")], [-5, ""]]) → 3x − 5
  function poly(terms) {
    var out = "";
    terms.forEach(function (t) {
      var p = coefParts(t[0]);
      if (p.sign === 0) return;
      if (out === "") out = (p.sign < 0 ? MINUS : "") + absTerm(p, t[1]);
      else out += op(p.sign < 0 ? "-" : "+") + absTerm(p, t[1]);
    });
    return out === "" ? "0" : out;
  }
  // 一次式 ax + b
  function linear(a, b, name) {
    var x = v(name || "x");
    return poly([[a, x], [b, ""]]);
  }
  // 二次式 ax² + bx + c
  function quad(a, b, c, name) {
    var n = name || "x";
    return poly([[a, pow(n, 2)], [b, v(n)], [c, ""]]);
  }
  // 等式
  function eqn(lhs, rhs) { return (isNum(lhs) ? num(lhs) : lhs) + op("=") + (isNum(rhs) ? num(rhs) : rhs); }
  // 座標
  function coord(x, y) { return "(" + (isNum(x) ? num(x) : x) + ", " + (isNum(y) ? num(y) : y) + ")"; }
  // 連立方程式(2行を縦に並べ、左に波かっこ)。引数は式の部品
  function sys(row1, row2) {
    return '<span class="sys"><span class="sys-row">' + row1 + '</span><span class="sys-row">' + row2 + "</span></span>";
  }
  // 途中式(1行1ステップ)
  function steps(lines) {
    return '<div class="steps">' + lines.map(function (l) { return '<div class="step">' + l + "</div>"; }).join("") + "</div>";
  }
  // 要点の中の大事な式
  function rule(html) { return '<span class="rule">' + html + "</span>"; }

  // ---------- 文字列から式を作る ----------
  // 固定の式を手で書くための書き方。数値を入れかえる生成問題では、上の部品の関数を使うほうが安全。
  //   英小文字1文字 → 変数      英大文字・π・°・△・∠ など → そのまま(立体)
  //   -  → −(前に値があれば引き算、なければ負の符号)   *  → ×   /  → ÷   <= >= → ≦ ≧
  //   x^2 → 累乗(指数が2文字以上なら x^(10))   {3/4} → 分数   √12 や √(x+1) → 根号
  //   'cm' のように ' ' で囲んだ部分 → そのままの文字(単位など)
  //   \V のように \ をつけた1文字 → 変数(大文字の量 V、S や ℓ を斜体にしたいとき。JSの文字列の中では "\\V" と書く)
  // 例: M.f("y = -{2/3}x + 5")   M.f("5 - (-3)")   M.f("12π ' cm'^2")   M.f("\\V = {1/3}\\Sh")
  function matchClose(src, i, open, close) {
    var depth = 0;
    for (var k = i; k < src.length; k++) {
      if (src[k] === open) depth++;
      else if (src[k] === close) { depth--; if (depth === 0) return k; }
    }
    throw new Error("M.f: かっこが閉じていません: " + src);
  }
  function f(src) {
    src = String(src);
    var out = "", i = 0, prevIsValue = false, c, j, inner;
    while (i < src.length) {
      c = src[i];
      if (c === " ") { i++; continue; }
      if (c === "'") {
        j = src.indexOf("'", i + 1);
        if (j < 0) throw new Error("M.f: ' が閉じていません: " + src);
        out += esc(src.slice(i + 1, j)); i = j + 1; prevIsValue = true; continue;
      }
      if (/[0-9]/.test(c)) {
        j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        out += src.slice(i, j); i = j; prevIsValue = true; continue;
      }
      if (c === "{") {
        j = matchClose(src, i, "{", "}");
        inner = src.slice(i + 1, j);
        var depth = 0, cut = -1;
        for (var k = 0; k < inner.length; k++) {
          if (inner[k] === "{" || inner[k] === "(") depth++;
          else if (inner[k] === "}" || inner[k] === ")") depth--;
          else if (inner[k] === "/" && depth === 0) { cut = k; break; }
        }
        if (cut < 0) throw new Error("M.f: 分数は {分子/分母} と書きます: " + src);
        out += frac(f(inner.slice(0, cut)), f(inner.slice(cut + 1)));
        i = j + 1; prevIsValue = true; continue;
      }
      if (c === "^") {
        if (src[i + 1] === "(") {
          j = matchClose(src, i + 1, "(", ")");
          inner = src.slice(i + 2, j); i = j + 1;
        } else {
          var mm = /^(-?\d+|[a-z])/.exec(src.slice(i + 1));
          if (!mm) throw new Error("M.f: ^ のあとに指数がありません: " + src);
          inner = mm[1]; i += 1 + inner.length;
        }
        out += "<sup>" + f(inner) + "</sup>"; prevIsValue = true; continue;
      }
      if (c === "√") {
        if (src[i + 1] === "(") {
          j = matchClose(src, i + 1, "(", ")");
          inner = src.slice(i + 2, j); i = j + 1;
        } else {
          var ms = /^(\d+(\.\d+)?|[a-z])/.exec(src.slice(i + 1));
          if (!ms) throw new Error("M.f: √ のあとに中身がありません: " + src);
          inner = ms[1]; i += 1 + inner.length;
        }
        out += sqrt(f(inner)); prevIsValue = true; continue;
      }
      if (c === "\\" && i + 1 < src.length) { out += v(src[i + 1]); i += 2; prevIsValue = true; continue; }
      if (c === "(") { out += "("; i++; prevIsValue = false; continue; }
      if (c === ")") { out += ")"; i++; prevIsValue = true; continue; }
      if (c === ",") { out += ", "; i++; prevIsValue = false; continue; }
      if (c === "-" || c === MINUS || c === "+") {
        var sym = c === "+" ? "+" : MINUS;
        out += prevIsValue ? op(sym) : sym;
        i++; prevIsValue = false; continue;
      }
      if ((c === "<" || c === ">") && src[i + 1] === "=") { out += op(c + "="); i += 2; prevIsValue = false; continue; }
      if (OP_MAP.hasOwnProperty(c)) { out += op(c); i++; prevIsValue = false; continue; }
      if (/[a-z]/.test(c)) { out += v(c); i++; prevIsValue = true; continue; }
      out += esc(c); i++; prevIsValue = true;
    }
    return out;
  }
  // M.f の結果を <span class="math"> に包む。文章の中に式を入れるときに使う
  function mf(src) { return wrap(f(src)); }

  // ---------- HTMLの部品を読む(読み上げ用の文字、検証スクリプト用) ----------
  // 部品のHTMLを木に直す。{ tag, cls, kids: [ … | "文字" ] }
  function parse(html) {
    var root = { tag: "root", cls: "", kids: [] }, stack = [root];
    var re = /<(\/?)([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g, mt;
    while ((mt = re.exec(html))) {
      var top = stack[stack.length - 1];
      if (mt[4] !== undefined) {
        top.kids.push(mt[4].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
      } else if (mt[1]) {
        if (stack.length > 1) stack.pop();
      } else {
        var cm = /class="([^"]*)"/.exec(mt[3]);
        var node = { tag: mt[2].toLowerCase(), cls: cm ? cm[1] : "", kids: [] };
        top.kids.push(node);
        if (!/\/\s*$/.test(mt[3])) stack.push(node);
      }
    }
    return root;
  }
  function nodeText(n) {
    if (typeof n === "string") return n;
    var inner = n.kids.map(nodeText).join("");
    var cls = " " + n.cls + " ";
    if (cls.indexOf(" frac ") >= 0) {
      var a = nodeText(n.kids[0]), b = nodeText(n.kids[1]);
      var simple = /^[0-9a-zA-Zπ.]+$/;
      return (simple.test(a) ? a : "(" + a + ")") + "/" + (simple.test(b) ? b : "(" + b + ")");
    }
    if (cls.indexOf(" sqrt-body ") >= 0) return /^[0-9a-zA-Z.]+$/.test(inner) ? inner : "(" + inner + ")";
    if (cls.indexOf(" op ") >= 0) return " " + inner + " ";
    if (n.tag === "sup") return "^" + (/^[0-9a-zA-Z]+$/.test(inner) ? inner : "(" + inner + ")");
    if (n.tag === "div" || n.tag === "br") return inner + " ";
    return inner;
  }
  // HTMLの部品を、タグなしの文字に直す。分数は 3/4、累乗は x^2 になる
  function text(html) {
    return nodeText(parse(String(html))).replace(/\s+/g, " ").trim();
  }

  // ---------- 4択を作る ----------
  // correct: 正解の部品。wrongs: 誤答の候補(よくある間違いを先に、多めに入れる)。
  // fill: 候補が足りないときに呼ぶ関数(回数 i を受けとり、部品を返す)。
  // 同じHTMLの候補は1つにまとめる。値が同じものは同じHTMLになるように、部品は M.fracNum や M.linear など
  // 「値から決まる書き方」で作ること。4つそろわなければ例外を出す。
  // 返す値: { choices: [部品×4], answer: 正解の番号(0〜3) }
  function choices(correct, wrongs, fill) {
    var list = [correct], seen = {};
    seen[correct] = true;
    function add(h) {
      if (list.length >= 4 || h === null || h === undefined || h === "" || seen[h]) return;
      seen[h] = true;
      list.push(h);
    }
    (wrongs || []).forEach(add);
    if (typeof fill === "function") {
      for (var i = 0; i < 200 && list.length < 4; i++) add(fill(i));
    }
    if (list.length < 4) throw new Error("M.choices: 誤答が3つそろいません: " + text(correct));
    var order = shuffle([0, 1, 2, 3]);
    return { choices: order.map(function (k) { return list[k]; }), answer: order.indexOf(0) };
  }
  // 数の4択。correct: 正解の数。wrongs: 誤答の数の候補(よくある間違いを先に)。
  // 正解と同じ値・重なった値・整数でない値(opts.allowDecimal がないとき)は自動で外し、
  // 足りない分は正解の近くの数で補う。
  // opts.fmt: 数を部品に直す関数(省略時は M.num)。opts.ok: 候補として使ってよいかを返す関数。
  // 返す値: { choices, answer, values: [選択肢の数×4] }
  function numChoices(correct, wrongs, opts) {
    opts = opts || {};
    var fmt = opts.fmt || num;
    var vals = [correct];
    function key(n) { return Math.round(n * 1e6); }
    function add(n) {
      if (vals.length >= 4 || !isNum(n) || !isFinite(n)) return;
      if (!opts.allowDecimal && n !== Math.floor(n)) return;
      if (opts.ok && !opts.ok(n)) return;
      for (var i = 0; i < vals.length; i++) if (key(vals[i]) === key(n)) return;
      vals.push(n);
    }
    (wrongs || []).forEach(add);
    var step = opts.step || 1;
    for (var k = 1; k < 200 && vals.length < 4; k++) {
      var d = Math.ceil(k / 2) * step * (k % 2 ? 1 : -1) * (Math.random() < 0.5 ? 1 : -1);
      add(correct + d);
      add(correct - d);
    }
    if (vals.length < 4) throw new Error("M.numChoices: 誤答が3つそろいません: " + correct);
    var order = shuffle([0, 1, 2, 3]);
    var ordered = order.map(function (i) { return vals[i]; });
    return { choices: ordered.map(function (n) { return fmt(n); }), answer: order.indexOf(0), values: ordered };
  }

  // ---------- 図(インラインSVG) ----------
  // 色はクラスで決める(fig-grid, fig-axis, fig-line, fig-line-2, fig-shape, fig-fill, fig-bar, fig-point, fig-label)。
  // 色コードをSVGに直接書かない。
  function r1(n) { return Math.round(n * 10) / 10; }
  function svg(w, h, label, inner) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '">' + inner + "</svg>";
  }
  var fig = {
    // 線分
    line: function (x1, y1, x2, y2, cls) {
      return '<line class="' + (cls || "fig-shape") + '" x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"/>';
    },
    // 折れ線・多角形。points = [[x, y], …]。closed が false なら閉じない
    poly: function (points, cls, closed) {
      var pts = points.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" ");
      return "<" + (closed === false ? "polyline" : "polygon") + ' class="' + (cls || "fig-shape") + '" points="' + pts + '"/>';
    },
    path: function (d, cls) { return '<path class="' + (cls || "fig-shape") + '" d="' + d + '"/>'; },
    circle: function (cx, cy, r, cls) {
      return '<circle class="' + (cls || "fig-shape") + '" cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '"/>';
    },
    ellipse: function (cx, cy, rx, ry, cls) {
      return '<ellipse class="' + (cls || "fig-shape") + '" cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '"/>';
    },
    rect: function (x, y, w, h, cls) {
      return '<rect class="' + (cls || "fig-shape") + '" x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"/>';
    },
    // 点
    dot: function (cx, cy, r) { return '<circle class="fig-point" cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + (r || 3.5) + '"/>'; },
    // 文字。anchor は "start" "middle" "end"。変数は fig.v("x") をつないで書く
    text: function (x, y, str, anchor, cls) {
      return '<text class="' + (cls || "fig-label") + '" x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (anchor || "middle") + '">' + str + "</text>";
    },
    v: function (name) { return '<tspan class="fig-v">' + esc(name) + "</tspan>"; },
    // 円周上の点。角度は度、右向きが0°で反時計回り
    polar: function (cx, cy, r, deg) {
      var t = deg * Math.PI / 180;
      return [cx + r * Math.cos(t), cy - r * Math.sin(t)];
    },
    // 弧(deg0 から deg1 へ反時計回り)
    arc: function (cx, cy, r, deg0, deg1, cls) {
      var a = fig.polar(cx, cy, r, deg0), b = fig.polar(cx, cy, r, deg1);
      var large = (deg1 - deg0) > 180 ? 1 : 0;
      return fig.path("M" + r1(a[0]) + " " + r1(a[1]) + " A" + r1(r) + " " + r1(r) + " 0 " + large + " 0 " + r1(b[0]) + " " + r1(b[1]), cls);
    },
    // おうぎ形(deg0 から deg1 へ反時計回り)
    sector: function (cx, cy, r, deg0, deg1, cls) {
      var a = fig.polar(cx, cy, r, deg0), b = fig.polar(cx, cy, r, deg1);
      var large = (deg1 - deg0) > 180 ? 1 : 0;
      return fig.path("M" + r1(cx) + " " + r1(cy) + " L" + r1(a[0]) + " " + r1(a[1]) + " A" + r1(r) + " " + r1(r) + " 0 " + large + " 0 " + r1(b[0]) + " " + r1(b[1]) + " Z", cls);
    }
  };

  // 座標平面。opts:
  //   range: 目もりの範囲(5 なら −5〜5。省略時 5)   size: 図の大きさ(省略時 260)
  //   tickEvery: 目もりの数字を書く間隔(省略時 range。つまり両端だけ)
  //   label: 読み上げ用の説明(aria-label)
  //   items: 上に重ねるもの。順に描く
  //     { type: "line", a, b, domain: [x1, x2], cls }   直線 y = ax + b(b 省略時 0。domain は変域、省略可)
  //     { type: "vline", x, cls } / { type: "hline", y, cls }   軸に平行な直線
  //     { type: "hyperbola", a, cls }                   双曲線 y = a/x
  //     { type: "parabola", a, domain: [x1, x2], cls }  放物線 y = ax²
  //     { type: "segment", x1, y1, x2, y2, cls }        線分
  //     { type: "polygon", points: [[x, y], …], cls }   多角形
  //     { type: "point", x, y, label, dx, dy, anchor }  点と名前(dx, dy は名前をずらす量。画面の単位)
  //     { type: "label", x, y, text, anchor }           文字だけ
  //   cls を省くと fig-line。2本目は "fig-line-2" を指定する
  function plane(opts) {
    opts = opts || {};
    var R = opts.range || 5, size = opts.size || 260, pad = 20;
    var u = (size - 2 * pad) / (2 * R), c = size / 2;
    function X(x) { return c + x * u; }
    function Y(y) { return c - y * u; }
    var s = "", i;
    for (i = -R; i <= R; i++) {
      if (i === 0) continue;
      s += fig.line(X(i), Y(-R), X(i), Y(R), "fig-grid") + fig.line(X(-R), Y(i), X(R), Y(i), "fig-grid");
    }
    s += fig.line(X(-R) - 8, Y(0), X(R) + 8, Y(0), "fig-axis") + fig.line(X(0), Y(-R) + 8, X(0), Y(R) - 8, "fig-axis");
    s += fig.text(X(R) + 12, Y(0) + 15, fig.v("x"), "middle") + fig.text(X(0) + 10, Y(R) - 6, fig.v("y"), "middle");
    s += fig.text(X(0) - 6, Y(0) + 14, "O", "end", "fig-label fig-small");
    var every = opts.tickEvery || R;
    for (i = -R; i <= R; i++) {
      if (i === 0 || i % every !== 0) continue;
      s += fig.text(X(i), Y(0) + 14, num(i), "middle", "fig-label fig-small");
      s += fig.text(X(0) - 5, Y(i) + 4, num(i), "end", "fig-label fig-small");
    }
    function curve(pts, cls) {
      return pts.length < 2 ? "" : fig.poly(pts.map(function (p) { return [X(p[0]), Y(p[1])]; }), cls || "fig-line", false);
    }
    (opts.items || []).forEach(function (it) {
      var lo = -R, hi = R, pts = [], k, x, n = 48;
      if (it.domain) { lo = Math.max(lo, it.domain[0]); hi = Math.min(hi, it.domain[1]); }
      if (it.type === "line") {
        var a = it.a, b = it.b || 0;
        if (a !== 0) {
          var xa = (-R - b) / a, xb = (R - b) / a;
          lo = Math.max(lo, Math.min(xa, xb)); hi = Math.min(hi, Math.max(xa, xb));
        } else if (Math.abs(b) > R) { return; }
        if (lo < hi) s += curve([[lo, a * lo + b], [hi, a * hi + b]], it.cls);
      } else if (it.type === "vline") {
        s += curve([[it.x, -R], [it.x, R]], it.cls);
      } else if (it.type === "hline") {
        s += curve([[-R, it.y], [R, it.y]], it.cls);
      } else if (it.type === "parabola") {
        var xm = Math.min(R, Math.sqrt(R / Math.abs(it.a)));
        lo = Math.max(lo, -xm); hi = Math.min(hi, xm);
        for (k = 0; k <= n; k++) { x = lo + (hi - lo) * k / n; pts.push([x, it.a * x * x]); }
        s += curve(pts, it.cls);
      } else if (it.type === "hyperbola") {
        var x0 = Math.abs(it.a) / R;
        [1, -1].forEach(function (sg) {
          var p2 = [];
          for (k = 0; k <= n; k++) { x = x0 * Math.pow(R / x0, k / n); p2.push([sg * x, it.a / (sg * x)]); }
          s += curve(p2, it.cls);
        });
      } else if (it.type === "segment") {
        s += curve([[it.x1, it.y1], [it.x2, it.y2]], it.cls);
      } else if (it.type === "polygon") {
        s += fig.poly(it.points.map(function (p) { return [X(p[0]), Y(p[1])]; }), it.cls || "fig-shape");
      } else if (it.type === "point") {
        s += fig.dot(X(it.x), Y(it.y));
        if (it.label) s += fig.text(X(it.x) + (it.dx === undefined ? 8 : it.dx), Y(it.y) + (it.dy === undefined ? -8 : it.dy), it.label, it.anchor || "start");
      } else if (it.type === "label") {
        s += fig.text(X(it.x), Y(it.y), it.text, it.anchor || "middle");
      }
    });
    return svg(size, size, opts.label || "座標平面", s);
  }

  // ヒストグラム。opts:
  //   edges: 階級の境目 [0, 10, 20, …](度数より1つ多い)   freqs: 度数 [2, 6, …]
  //   xUnit, yUnit: 軸の単位("分" "人" など)   label: 読み上げ用の説明
  function histogram(opts) {
    var w = 290, h = 190, left = 34, right = 44, top = 22, bottom = 30;
    var freqs = opts.freqs, edges = opts.edges, n = freqs.length;
    // yStep: 目もりの数字のきざみ。gridStep: 目もり線のきざみ(最大度数が10以下なら1きざみで引き、柱の高さを線で読めるようにする)
    var maxF = Math.max.apply(null, freqs), yStep = maxF > 10 ? 5 : (maxF > 5 ? 2 : 1);
    var gridStep = maxF <= 10 ? 1 : yStep;
    var yMax = Math.ceil(maxF / yStep) * yStep;
    var bw = (w - left - right) / n, ph = h - top - bottom;
    function Y(v2) { return top + ph - ph * v2 / yMax; }
    var s = "", i;
    for (i = gridStep; i <= yMax; i += gridStep) s += fig.line(left, Y(i), w - right, Y(i), "fig-grid");
    for (i = yStep; i <= yMax; i += yStep) s += fig.text(left - 6, Y(i) + 4, String(i), "end", "fig-label fig-small");
    for (i = 0; i < n; i++) {
      if (freqs[i] > 0) s += fig.rect(left + bw * i, Y(freqs[i]), bw, ph * freqs[i] / yMax, "fig-bar");
    }
    s += fig.line(left, top - 6, left, top + ph, "fig-axis") + fig.line(left, top + ph, w - right + 6, top + ph, "fig-axis");
    s += fig.text(left - 6, top + ph + 4, "0", "end", "fig-label fig-small");
    for (i = 0; i <= n; i++) s += fig.text(left + bw * i, top + ph + 15, String(edges[i]), "middle", "fig-label fig-small");
    if (opts.yUnit) s += fig.text(left, top - 10, "(" + esc(opts.yUnit) + ")", "middle", "fig-label fig-small");
    if (opts.xUnit) s += fig.text(w - 2, top + ph + 15, "(" + esc(opts.xUnit) + ")", "end", "fig-label fig-small");
    return svg(w, h, opts.label || "ヒストグラム", s);
  }

  return {
    MINUS: MINUS,
    // 道具
    esc: esc, rand: rand, randNZ: randNZ, pick: pick, shuffle: shuffle,
    gcd: gcd, lcm: lcm, isPrime: isPrime, factorize: factorize,
    // 式
    num: num, nump: nump, v: v, op: op, join: join, m: m, wrap: wrap,
    frac: frac, fracNum: fracNum, pow: pow, sqrt: sqrt,
    term: term, poly: poly, linear: linear, quad: quad, eqn: eqn, coord: coord,
    sys: sys, steps: steps, rule: rule, f: f, mf: mf,
    // 読む
    parse: parse, text: text,
    // 4択
    choices: choices, numChoices: numChoices,
    // 図
    svg: svg, fig: fig, plane: plane, histogram: histogram
  };
})();

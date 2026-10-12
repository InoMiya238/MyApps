// 中学数学道場: 中3の8単元の中身(要点・例題・図・問題)。
// 形式の説明は data.js の先頭、式と図の関数は math.js を参照。書き方は data-g1.js と同じ。
(function () {
  "use strict";
  if (typeof JHM === "undefined" || typeof M === "undefined") return;

  // ---------- このファイルの中で使う短い名前 ----------
  var v = M.v, m = M.m, mf = M.mf, f = M.f, fig = M.fig;
  var X = v("x"), Y = v("y"), VA = v("a");
  var X2 = M.pow("x", 2), Y2 = M.pow("y", 2), XY = X + Y;
  var PM = "±";
  function sg(n) { return n < 0 ? "-" : "+"; }          // 符号を演算子に
  function abs(n) { return Math.abs(n); }
  function par(h) { return "(" + h + ")"; }
  function wrapNeg(h) { return h.charAt(0) === M.MINUS ? par(h) : h; }
  // 2〜max(min〜max)の整数に、正負どちらかの符号をつけた乱数
  function signed(max, min) {
    return M.rand(min || 2, max) * (Math.random() < 0.5 ? -1 : 1);
  }
  // 問題の本体と4択を1つにまとめる
  function build(base, ch) {
    base.choices = ch.choices;
    base.answer = ch.answer;
    return base;
  }
  // 二次式 Ax² + Bx + C の4択。triples は誤答の [a, b, c]
  function quadChoices(A, B, C, triples) {
    function h(p) { return (p[0] === 0 && p[1] === 0 && p[2] === 0) ? null : M.quad(p[0], p[1], p[2]); }
    return M.choices(h([A, B, C]), triples.map(h), function () {
      return h([A, B + M.pick([-3, -2, -1, 1, 2, 3]), C + M.pick([-4, -2, -1, 0, 1, 2, 4])]);
    });
  }
  // Ax² + Bxy + Cy²(W が true のとき)または Ax² + Bx + C
  function three(A, B, C, W) {
    return M.poly([[A, X2], [B, W ? XY : X], [C, W ? Y2 : ""]]);
  }
  // (x + a)。a が 0 なら x
  function xp(a) { return a === 0 ? X : par(M.linear(1, a)); }
  // (px + q)
  function pf(p, q) { return par(M.linear(p, q)); }
  // (x + a)(x + b) を決まった順(定数の大きいほうが先)で書く。同じ式は必ず同じHTMLになる
  function fac2(a, b) {
    if (a === b) return a === 0 ? X2 : M.pow(xp(a), 2);
    if (a < b) { var t = a; a = b; b = t; }
    if (a === 0) return X + xp(b);
    if (b === 0) return X + xp(a);
    return xp(a) + xp(b);
  }

  // ---------- 根号をふくむ数(簡単にした形にそろえる) ----------
  // √n = k√r となる [k, r](r は平方因数をもたない)
  function sqSplit(n) {
    for (var i = Math.floor(Math.sqrt(n)); i >= 2; i--) if (n % (i * i) === 0) return [i, n / (i * i)];
    return [1, n];
  }
  // (n/d)√r を簡単にした形。root(1, 12) → 2√3、root(3, 2, 2) → 3√2/2、root(6, 3, 3) → 2√3
  function root(n, r, d) {
    d = d || 1;
    var s = sqSplit(r);
    n *= s[0]; r = s[1];
    if (d < 0) { n = -n; d = -d; }
    var g = M.gcd(n, d) || 1;
    n /= g; d /= g;
    if (n === 0) return "0";
    if (r === 1) return M.fracNum(n, d);
    if (d === 1) return M.sqrt(r, n);
    return (n < 0 ? M.MINUS : "") + M.frac(M.sqrt(r, abs(n)), d);
  }
  // 係数つきの根号の和。terms = [[係数, 根号の中], …](根号の中が 1 なら整数)。同じ根号はまとめ、小さい順に並べる
  function rootPoly(terms) {
    var map = {}, keys = [];
    terms.forEach(function (t) {
      if (!t[0]) return;
      var s = sqSplit(t[1]), r = s[1];
      if (!map.hasOwnProperty(r)) { map[r] = 0; keys.push(r); }
      map[r] += t[0] * s[0];
    });
    keys = keys.filter(function (k) { return map[k] !== 0; }).sort(function (a, b) { return a - b; });
    if (keys.length === 0) return "0";
    return M.poly(keys.map(function (r) { return [map[r], r === 1 ? "" : M.sqrt(r)]; }));
  }

  // ---------- 二次方程式の解の書き方(統一する) ----------
  //   解が2つ: x = −5, 2(小さい順)   絶対値が等しい2つ: x = ±3   重解: x = 3
  //   根号をふくむ: x = ±2√3、x = −2 ± √3、x = (−3 ± √5)/2
  function xeqs(h) { return X + M.op("=") + h; }
  // vals = [[分子, 分母], …](有理数の解)
  function solList(vals) {
    var list = [];
    vals.forEach(function (p) {
      var n = p[0], d = p[1] === undefined ? 1 : p[1];
      if (d < 0) { n = -n; d = -d; }
      var g = M.gcd(n, d) || 1;
      n /= g; d /= g;
      if (!list.some(function (q) { return q[0] === n && q[1] === d; })) list.push([n, d]);
    });
    list.sort(function (a, b) { return a[0] / a[1] - b[0] / b[1]; });
    if (list.length === 2 && list[0][0] === -list[1][0] && list[0][1] === list[1][1]) {
      return xeqs(PM + M.fracNum(list[1][0], list[1][1]));
    }
    return xeqs(list.map(function (p) { return M.fracNum(p[0], p[1]); }).join(", "));
  }
  function sol2(a, b) { return solList([[a, 1], [b, 1]]); }
  function sol1(a) { return solList([[a, 1]]); }
  // x = (p ± q√r) / d
  function solPQ(p, q, r, d) {
    d = d || 1;
    if (d < 0) { p = -p; d = -d; }
    if (r <= 0 || q === 0) return solList([[p, d]]);
    var s = sqSplit(r);
    q = abs(q * s[0]); r = s[1];
    if (r === 1) return solList([[p - q, d], [p + q, d]]);
    var g = M.gcd(M.gcd(p, q), d) || 1;
    p /= g; q /= g; d /= g;
    if (p === 0) return xeqs(PM + (d === 1 ? M.sqrt(r, q) : M.frac(M.sqrt(r, q), d)));
    var core = M.num(p) + M.op("±") + M.sqrt(r, q);
    return xeqs(d === 1 ? core : M.frac(core, d));
  }

  // =====================================================================
  // 3-1 展開と因数分解
  // =====================================================================

  // 単項式×多項式、多項式×多項式
  function genExpandPoly() {
    var kind = M.pick(["mono", "bin", "bin", "xy"]);
    var a, b, c, d, k, expr;
    if (kind === "mono") {
      k = M.randNZ(-5, 5); a = M.randNZ(-4, 4); b = M.randNZ(-7, 7);
      var kx = M.term(k, X);
      expr = kx + pf(a, b);
      return build({
        text: "次の式を展開しなさい。",
        math: m(expr),
        explain: [
          "分配法則で、かっこの中のすべての項に " + m(kx) + " をかけます。",
          m(expr),
          m("=", kx, "*", wrapNeg(M.term(a, X)), "+", wrapNeg(kx), "*", b),
          m("=", M.quad(k * a, k * b, 0))
        ],
        meta: { kind: "g3-expand" }
      }, quadChoices(k * a, k * b, 0, [[k * a, b, 0], [k * a, -k * b, 0], [k * a, 0, k * b], [-k * a, k * b, 0], [a, k * b, 0]]));
    }
    if (kind === "bin") {
      do {
        a = M.rand(1, 3); c = M.rand(1, 3); b = M.randNZ(-6, 6); d = M.randNZ(-6, 6);
      } while (a * c === 1 || (a === c && abs(b) === abs(d)));
      expr = pf(a, b) + pf(c, d);
      return build({
        text: "次の式を展開しなさい。",
        math: m(expr),
        explain: [
          mf("(a + b)(c + d) = ac + ad + bc + bd") + " のように、4つの積をつくります。",
          m(expr),
          m("=", M.poly([[a * c, X2], [a * d, X], [b * c, X], [b * d, ""]])),
          "同類項をまとめて、" + m(M.quad(a * c, a * d + b * c, b * d))
        ],
        meta: { kind: "g3-expand" }
      }, quadChoices(a * c, a * d + b * c, b * d, [[a * c, a * d + b * c, -b * d], [a * c, 0, b * d], [a * c, a * d - b * c, b * d], [a * c, b + d, b * d], [a + c, a * d + b * c, b * d]]));
    }
    do { a = M.randNZ(-7, 7); b = M.randNZ(-7, 7); } while (abs(a) === abs(b));
    expr = xp(a) + par(M.linear(1, b, "y"));
    function h4(p, q, r) { return M.poly([[1, XY], [p, X], [q, Y], [r, ""]]); }
    return build({
      text: "次の式を展開しなさい。",
      math: m(expr),
      explain: [
        mf("(a + b)(c + d) = ac + ad + bc + bd") + " のように、4つの積をつくります。",
        "4つの積は " + m(X, "*", Y) + "、" + m(X, "*", b) + "、" + m(a, "*", Y) + "、" + m(a, "*", b) + " です。",
        m(expr),
        m("=", h4(b, a, a * b))
      ],
      meta: { kind: "g3-expand" }
    }, M.choices(h4(b, a, a * b), [h4(a, b, a * b), h4(0, 0, a * b), h4(b, a, -a * b), h4(b, a, a + b), h4(-b, -a, a * b)], function (i) {
      return h4(b, a, a * b + i + 1);
    }));
  }

  // 乗法公式1: (x + a)(x + b)
  function genExpandXab() {
    var a, b;
    do { a = M.randNZ(-9, 9); b = M.randNZ(-9, 9); } while (abs(a) === abs(b));
    var expr = xp(a) + xp(b);
    return build({
      text: "次の式を展開しなさい。",
      math: m(expr),
      explain: [
        "乗法公式 " + mf("(x + a)(x + b) = x^2 + (a + b)x + ab") + " を使います。",
        m(expr),
        m("=", X2, "+", par(M.join(a, "+", b)) + X, "+", a, "*", b),
        m("=", M.quad(1, a + b, a * b))
      ],
      meta: { kind: "g3-expand" }
    }, quadChoices(1, a + b, a * b, [[1, a + b, -a * b], [1, a * b, a + b], [1, a - b, a * b], [1, -(a + b), a * b], [1, 0, a * b], [1, a + b, a + b]]));
  }

  // 乗法公式2・3: 和の平方、差の平方
  function genExpandSquare() {
    var kind = M.pick(["x", "x", "px", "px", "xy"]), P = 1, Q, W = false;
    if (kind === "x") Q = signed(9, 1);
    else if (kind === "px") { P = M.rand(2, 5); Q = signed(6, 1); }
    else { Q = signed(5, 2); W = true; }
    var q = abs(Q), s = sg(Q);
    var expr = M.pow(par(M.poly([[P, X], [Q, W ? Y : ""]])), 2);
    var first = P === 1 ? X2 : M.pow(par(M.term(P, X)), 2);
    var qt = W ? M.term(q, Y) : M.num(q);
    var last = W ? M.pow(par(M.term(q, Y)), 2) : M.pow(q, 2);
    var wrongs = [[P * P, 0, Q * Q], [P * P, P * Q, Q * Q], [P * P, -2 * P * Q, Q * Q], [P * P, 2 * P * Q, -Q * Q], [P * P, 2 * P * Q, 2 * q]];
    if (P !== 1) wrongs.splice(2, 0, [P, 2 * P * Q, Q * Q]);
    return build({
      text: "次の式を展開しなさい。",
      math: m(expr),
      explain: [
        "乗法公式 " + (Q > 0 ? mf("(a + b)^2 = a^2 + 2ab + b^2") : mf("(a - b)^2 = a^2 - 2ab + b^2")) + " を使います。",
        m(expr),
        m("=", first, s, 2, "*", M.term(P, X), "*", qt, "+", last),
        m("=", three(P * P, 2 * P * Q, Q * Q, W))
      ],
      meta: { kind: "g3-expand" }
    }, M.choices(three(P * P, 2 * P * Q, Q * Q, W), wrongs.map(function (t) { return three(t[0], t[1], t[2], W); }), function (i) {
      return three(P * P, 2 * P * Q, Q * Q + i + 1, W);
    }));
  }

  // 乗法公式4: 和と差の積
  function genExpandSumDiff() {
    var kind = M.pick(["x", "x", "px", "px", "xy"]), P = 1, Q, W = false;
    if (kind === "x") Q = M.rand(1, 12);
    else if (kind === "px") { P = M.rand(2, 5); Q = M.rand(1, 7); }
    else { Q = M.rand(2, 6); W = true; }
    var plus = par(M.poly([[P, X], [Q, W ? Y : ""]])), minus = par(M.poly([[P, X], [-Q, W ? Y : ""]]));
    var expr = Math.random() < 0.5 ? plus + minus : minus + plus;
    var first = P === 1 ? X2 : M.pow(par(M.term(P, X)), 2);
    var last = W ? M.pow(par(M.term(Q, Y)), 2) : M.pow(Q, 2);
    var wrongs = [[P * P, 0, Q * Q], [P * P, -2 * P * Q, Q * Q], [P * P, 2 * P * Q, -Q * Q], [P * P, -2 * P * Q, -Q * Q]];
    if (Q !== 1) wrongs.push([P * P, 0, -Q]);
    if (P !== 1) wrongs.splice(1, 0, [P, 0, -Q * Q]);
    return build({
      text: "次の式を展開しなさい。",
      math: m(expr),
      explain: [
        "乗法公式 " + mf("(a + b)(a - b) = a^2 - b^2") + " を使います(和と差の積は、2乗の差)。",
        m(expr),
        m("=", first, "-", last),
        m("=", three(P * P, 0, -Q * Q, W))
      ],
      meta: { kind: "g3-expand" }
    }, M.choices(three(P * P, 0, -Q * Q, W), wrongs.map(function (t) { return three(t[0], t[1], t[2], W); }), function (i) {
      return three(P * P, 0, -Q * Q - i - 1, W);
    }));
  }

  // いろいろな式の展開(公式を組み合わせる)
  function genExpandCombo() {
    var form = M.pick(["sq-prod", "sq-prod", "prod-sd", "sd+sq", "sq+prod"]);
    var a, b, c, expr, lines, A, B, C, wrongs;
    do { a = M.randNZ(-6, 6); b = M.randNZ(-6, 6); c = M.randNZ(-6, 6); } while (b === c || b === -c);
    var sq = M.pow(xp(a), 2), prod = xp(b) + xp(c), k = abs(a), sd = xp(k) + xp(-k);
    var sqE = M.quad(1, 2 * a, a * a), prodE = M.quad(1, b + c, b * c), sdE = M.quad(1, 0, -k * k);
    if (form === "sq-prod") {
      expr = M.join(sq, "-", prod);
      A = 0; B = 2 * a - b - c; C = a * a - b * c;
      lines = [m("=", sqE, "-", par(prodE)), m("=", M.poly([[1, X2], [2 * a, X], [a * a, ""], [-1, X2], [-(b + c), X], [-b * c, ""]]))];
      wrongs = [[0, B, a * a + b * c], [0, 2 * a + b + c, C], [2, 2 * a + b + c, a * a + b * c], [0, -(b + c), C], [0, B, -C]];
    } else if (form === "prod-sd") {
      expr = M.join(prod, "-", sd);
      A = 0; B = b + c; C = b * c + k * k;
      lines = [m("=", prodE, "-", par(sdE)), m("=", M.poly([[1, X2], [b + c, X], [b * c, ""], [-1, X2], [k * k, ""]]))];
      wrongs = [[0, B, b * c - k * k], [2, B, b * c - k * k], [0, -B, C], [0, B, b * c + k], [0, B + 2 * k, C]];
    } else if (form === "sd+sq") {
      expr = M.join(sd, "+", M.pow(xp(b), 2));
      A = 2; B = 2 * b; C = b * b - k * k;
      lines = [m("=", sdE, "+", M.quad(1, 2 * b, b * b))];
      wrongs = [[2, B, b * b + k * k], [2, b, C], [2, 0, C], [1, B, C], [2, B - 2 * k, b * b + k * k]];
    } else {
      expr = M.join(sq, "+", prod);
      A = 2; B = 2 * a + b + c; C = a * a + b * c;
      lines = [m("=", sqE, "+", prodE)];
      wrongs = [[2, B, a * a - b * c], [2, a + b + c, C], [2, b + c, C], [1, B, C], [2, 2 * a - b - c, C]];
    }
    if (A === 0 && B === 0 && C === 0) return genExpandCombo();
    return build({
      text: "次の式を計算しなさい。",
      math: m(expr),
      explain: ["乗法公式でそれぞれ展開してから、同類項をまとめます。" + (form === "sq-prod" || form === "prod-sd" ? "ひくほうの式は、かっこをつけて展開します。" : "")]
        .concat([m(expr)], lines, [m("=", M.quad(A, B, C))]),
      meta: { kind: "g3-expand" }
    }, quadChoices(A, B, C, wrongs));
  }

  // 共通因数をくくり出す
  function genFactorCommon() {
    var k, a, b, expr, correct, wrongs, lines;
    if (Math.random() < 0.6) {
      do { k = M.rand(1, 6); a = M.rand(1, 5); b = M.randNZ(-7, 7); } while (M.gcd(a, b) !== 1);
      var kx = M.term(k, X);
      expr = M.quad(k * a, k * b, 0);
      correct = kx + pf(a, b);
      wrongs = [kx + pf(a, -b)];
      if (k > 1) wrongs.push(kx + pf(a, k * b), X + pf(a, b), M.num(k) + pf(a, b), kx + pf(k * a, b));
      else wrongs.push(X + pf(a + 1, b), X + pf(a, b + 1));
      lines = [
        "すべての項に共通な因数 " + m(kx) + " をくくり出します。",
        m(expr),
        m("=", kx, "*", M.term(a, X), sg(b), kx, "*", abs(b)),
        m("=", correct)
      ];
      return build({ text: "次の式を因数分解しなさい。", math: m(expr), explain: lines, meta: { kind: "g3-factor" } },
        M.choices(correct, wrongs, function (i) { return kx + pf(a + 1 + (i % 2), b - i - 1 || 1); }));
    }
    var p, q;
    do { k = M.rand(2, 6); p = M.rand(1, 5); q = M.randNZ(-5, 5); } while (M.gcd(p, q) !== 1);
    var ka = M.term(k, VA);
    function inner(s, t) { return par(M.poly([[s, X], [t, Y]])); }
    expr = M.poly([[k * p, VA + X], [k * q, VA + Y]]);
    correct = ka + inner(p, q);
    wrongs = [ka + inner(p, -q), ka + inner(p, k * q), VA + inner(p, q), M.num(k) + inner(p, q), ka + inner(k * p, q)];
    lines = [
      "すべての項に共通な因数 " + m(ka) + " をくくり出します(数の公約数もわすれずに)。",
      m(expr),
      m("=", ka, "*", M.term(p, X), sg(q), ka, "*", M.term(abs(q), Y)),
      m("=", correct)
    ];
    return build({ text: "次の式を因数分解しなさい。", math: m(expr), explain: lines, meta: { kind: "g3-factor" } },
      M.choices(correct, wrongs, function (i) { return ka + inner(p + i + 1, q); }));
  }

  // 因数分解: x² + (a + b)x + ab
  function genFactorXab() {
    var a, b;
    do { a = M.randNZ(-9, 9); b = M.randNZ(-9, 9); } while (abs(a) === abs(b));
    var expr = M.quad(1, a + b, a * b);
    return build({
      text: "次の式を因数分解しなさい。",
      math: m(expr),
      explain: [
        "公式 " + mf("x^2 + (a + b)x + ab = (x + a)(x + b)") + " を使います。",
        "積が " + m(a * b) + "、和が " + m(a + b) + " になる2数をさがすと、" + m(a) + " と " + m(b) + " です。",
        m(a, "*", b, "=", a * b) + "、" + m(a, "+", b, "=", a + b),
        m(expr, "=", fac2(a, b))
      ],
      meta: { kind: "g3-factor" }
    }, M.choices(fac2(a, b), [fac2(-a, -b), fac2(a, -b), fac2(-a, b), fac2(a + b, a * b), fac2(1, a * b)], function (i) {
      return fac2(a + i + 1, b - i - 1);
    }));
  }

  // 因数分解: 平方の公式、2乗の差、共通因数をくくり出してから公式
  function genFactorFormula() {
    var kind = M.pick(["sq", "diff", "diff", "diff-p", "sq-p", "common", "common"]);
    var a, b, p, q, k, expr, correct, wrongs, lines, fill;
    if (kind === "sq") {
      a = signed(9, 1);
      expr = M.quad(1, 2 * a, a * a);
      correct = fac2(a, a);
      wrongs = [fac2(-a, -a), fac2(a, -a), fac2(2 * a, 2 * a), fac2(a * a, 1), fac2(a * a, a * a)];
      fill = function (i) { return fac2(a + i + 1, a + i + 1); };
      lines = [
        "公式 " + (a > 0 ? mf("x^2 + 2ax + a^2 = (x + a)^2") : mf("x^2 - 2ax + a^2 = (x - a)^2")) + " を使います。",
        m(a * a, "=", M.pow(abs(a), 2)) + "、" + m(2 * abs(a), "=", 2, "*", abs(a)) + " なので、公式にあてはまります。",
        m(expr, "=", correct)
      ];
    } else if (kind === "diff") {
      a = M.rand(1, 12);
      expr = M.quad(1, 0, -a * a);
      correct = fac2(a, -a);
      wrongs = [fac2(a, a), fac2(-a, -a), fac2(a * a, -1), fac2(a * a, -a * a)];
      fill = function (i) { return fac2(a + i + 1, -(a + i + 1)); };
      lines = [
        "公式 " + mf("x^2 - a^2 = (x + a)(x - a)") + " を使います(2乗の差は、和と差の積)。",
        m(expr, "=", X2, "-", M.pow(a, 2)),
        m("=", correct)
      ];
    } else if (kind === "diff-p") {
      do { p = M.rand(2, 5); q = M.rand(1, 7); } while (M.gcd(p, q) !== 1);
      expr = M.quad(p * p, 0, -q * q);
      correct = pf(p, q) + pf(p, -q);
      wrongs = [M.pow(pf(p, q), 2), M.pow(pf(p, -q), 2), pf(p * p, q) + pf(1, -q), pf(p * p, q * q) + pf(1, -1)];
      fill = function (i) { return pf(p + i + 1, q) + pf(p + i + 1, -q); };
      lines = [
        "公式 " + mf("a^2 - b^2 = (a + b)(a - b)") + " を使います。",
        m(expr, "=", M.pow(par(M.term(p, X)), 2), "-", M.pow(q, 2)),
        m("=", correct)
      ];
    } else if (kind === "sq-p") {
      do { p = M.rand(2, 4); q = signed(5, 1); } while (M.gcd(p, q) !== 1);
      expr = M.quad(p * p, 2 * p * q, q * q);
      correct = M.pow(pf(p, q), 2);
      wrongs = [M.pow(pf(p, -q), 2), pf(p, abs(q)) + pf(p, -abs(q)), M.pow(pf(p * p, q), 2), M.pow(pf(p, q * q), 2)];
      fill = function (i) { return M.pow(pf(p + i + 1, q), 2); };
      lines = [
        "公式 " + (q > 0 ? mf("a^2 + 2ab + b^2 = (a + b)^2") : mf("a^2 - 2ab + b^2 = (a - b)^2")) + " を使います。",
        m(expr),
        m("=", M.pow(par(M.term(p, X)), 2), sg(q), 2, "*", M.term(p, X), "*", abs(q), "+", M.pow(abs(q), 2)),
        m("=", correct)
      ];
    } else {
      k = M.pick([2, 3, 4, 5]);
      do { a = M.randNZ(-6, 6); b = M.randNZ(-6, 6); } while (a < b);
      expr = M.quad(k, k * (a + b), k * a * b);
      correct = M.num(k) + fac2(a, b);
      wrongs = [M.num(k) + fac2(-a, -b), fac2(a, b), M.num(k) + fac2(a, -b), M.num(k) + fac2(k * a, b), M.num(k) + fac2(a, k * b), M.num(k) + fac2(-a, b)];
      fill = function (i) { return M.num(k) + fac2(a + i + 1, b); };
      lines = [
        "まず共通因数 " + m(k) + " をくくり出し、かっこの中をさらに因数分解します。",
        m(expr),
        m("=", M.num(k) + par(M.quad(1, a + b, a * b))),
        m("=", correct)
      ];
    }
    return build({ text: "次の式を因数分解しなさい。", math: m(expr), explain: lines, meta: { kind: "g3-factor" } }, M.choices(correct, wrongs, fill));
  }

  // 公式を使ったくふうした計算
  function genCleverCalc() {
    var kind = M.pick(["sq", "sumdiff", "sumdiff", "diffsq", "diffsq"]);
    var c, k, s, n, ans, expr, lines, wrongs;
    if (kind === "sq") {
      c = M.pick([20, 30, 40, 50, 100]); k = M.rand(1, 3); s = M.pick(["+", "-"]);
      n = s === "+" ? c + k : c - k;
      ans = n * n;
      expr = M.pow(n, 2);
      lines = [
        m(n, "=", c, s, k) + " とみて、乗法公式 " + (s === "+" ? mf("(a + b)^2 = a^2 + 2ab + b^2") : mf("(a - b)^2 = a^2 - 2ab + b^2")) + " を使います。",
        m(expr, "=", M.pow(par(M.join(c, s, k)), 2)),
        m("=", M.pow(c, 2), s, 2, "*", c, "*", k, "+", M.pow(k, 2)),
        m("=", c * c, s, 2 * c * k, "+", k * k, "=", ans)
      ];
      wrongs = [s === "+" ? c * c + k * k : c * c - k * k, s === "+" ? c * c + c * k + k * k : c * c - c * k + k * k, s === "+" ? c * c + 2 * c * k - k * k : c * c - 2 * c * k - k * k, c * c + k * k];
    } else if (kind === "sumdiff") {
      c = M.pick([20, 30, 40, 50, 60, 70, 80, 100, 200]); k = M.rand(1, 5);
      ans = c * c - k * k;
      var bigFirst = Math.random() < 0.5;
      var facP = par(M.join(c, "+", k)), facM = par(M.join(c, "-", k));
      expr = bigFirst ? M.join(c + k, "*", c - k) : M.join(c - k, "*", c + k);
      lines = [
        "乗法公式 " + mf("(a + b)(a - b) = a^2 - b^2") + " を使います。",
        // 問題と同じ並びで書く(25 × 35 なら (30 − 5)(30 + 5))
        m(expr, "=", bigFirst ? facP + facM : facM + facP),
        m("=", M.pow(c, 2), "-", M.pow(k, 2)),
        m("=", c * c, "-", k * k, "=", ans)
      ];
      wrongs = [c * c + k * k, c * c - 2 * c * k + k * k, ans - 10, ans + 10];
      if (k > 1) wrongs.unshift(c * c - k);
    } else {
      var S = M.pick([20, 30, 40, 50, 100]), D;
      do { D = M.pick([2, 4, 6, 8, 10, 20, 30]); } while (D >= S - 2);
      var a = (S + D) / 2, b = (S - D) / 2;
      ans = S * D;
      expr = M.join(M.pow(a, 2), "-", M.pow(b, 2));
      lines = [
        "因数分解の公式 " + mf("a^2 - b^2 = (a + b)(a - b)") + " を使います。",
        m(expr, "=", par(M.join(a, "+", b)) + par(M.join(a, "-", b))),
        m("=", S, "*", D, "=", ans)
      ];
      wrongs = [D * D, S * D / 2, S * D * 2, S * S, S + D];
    }
    return build({ text: "くふうして、次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "calc" } }, M.numChoices(ans, wrongs));
  }

  JHM.register("g3-expansion-factoring", {
    points: [
      "<b>展開</b>: 積の形の式のかっこをはずして、和の形に表すこと。" + M.rule(mf("(a + b)(c + d) = ac + ad + bc + bd")),
      "<b>乗法公式</b>: " + M.rule(mf("(x + a)(x + b) = x^2 + (a + b)x + ab")) + "、" + M.rule(mf("(a + b)^2 = a^2 + 2ab + b^2")) + "、" + M.rule(mf("(a - b)^2 = a^2 - 2ab + b^2")) + "、" + M.rule(mf("(a + b)(a - b) = a^2 - b^2")),
      "<b>因数分解</b>: 多項式をいくつかの因数の積で表すこと(展開の逆)。まず共通因数をくくり出します。" + M.rule(mf("ma + mb = m(a + b)")),
      "<b>公式による因数分解</b>: 乗法公式を逆に使います。" + mf("x^2 + (a + b)x + ab") + " は、積が " + mf("ab") + "、和が " + mf("a + b") + " になる2数をさがします。",
      "<b>くふうした計算</b>: 公式を使うと、数の計算が簡単になります。" + M.rule(mf("101 * 99 = 100^2 - 1^2 = 9999"))
    ],
    example: {
      title: mf("2x^2 - 4x - 30") + " を因数分解しなさい。",
      steps: [
        mf("2x^2 - 4x - 30"),
        mf("= 2(x^2 - 2x - 15)") + "(共通因数 2 をくくり出す)",
        "積が " + mf("-15") + "、和が " + mf("-2") + " になる2数は " + mf("3") + " と " + mf("-5")
      ],
      result: mf("2(x + 3)(x - 5)")
    },
    generators: [
      { id: "expand-poly", label: "多項式の乗法", make: genExpandPoly },
      { id: "expand-xab", label: "乗法公式 (x + a)(x + b)", make: genExpandXab },
      { id: "expand-square", label: "和の平方・差の平方", make: genExpandSquare },
      { id: "expand-sum-diff", label: "和と差の積", make: genExpandSumDiff },
      { id: "expand-combo", label: "いろいろな式の展開", make: genExpandCombo },
      { id: "factor-common", label: "共通因数をくくり出す", make: genFactorCommon },
      { id: "factor-xab", label: "因数分解 x² + (a + b)x + ab", make: genFactorXab },
      { id: "factor-formula", label: "公式による因数分解", make: genFactorFormula },
      { id: "clever-calc", label: "くふうした計算", make: genCleverCalc }
    ]
  });

  // =====================================================================
  // 3-2 平方根
  // =====================================================================

  var ROOT_SMALL = [2, 3, 5, 6, 7];

  // 平方根の意味、根号を使わずに表す、有理数と無理数
  function genRootMeaning() {
    var kind = M.pick(["roots", "roots", "value", "value", "irrational"]);
    var k, n, a, correct, wrongs, lines;
    if (kind === "roots") {
      var t = M.pick(["sq", "sq", "non", "frac"]), nHtml;
      if (t === "sq") {
        k = M.rand(2, 15); n = k * k; nHtml = M.num(n);
        correct = PM + M.num(k);
        wrongs = [M.num(k), M.num(-k), PM + M.num(n), PM + M.fracNum(n, 2), PM + root(1, k)];
        lines = [
          "2乗すると " + m(n) + " になる数が、" + m(n) + " の平方根です。正の数の平方根は、正と負の2つあります。",
          m(M.pow(k, 2), "=", n) + "、" + m(M.pow(-k, 2), "=", n),
          "したがって、" + m(n) + " の平方根は " + m(correct)
        ];
      } else if (t === "non") {
        n = M.pick([2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17]); nHtml = M.num(n);
        correct = PM + M.sqrt(n);
        wrongs = [M.sqrt(n), M.sqrt(n, -1), PM + M.num(n * n), PM + M.fracNum(n, 2), PM + M.num(n)];
        lines = [
          "正の数の平方根は、正と負の2つあります。整数や分数で表せないときは、根号を使って表します。",
          m(n) + " の平方根のうち、正のほうが " + m(M.sqrt(n)) + "、負のほうが " + m(M.sqrt(n, -1)) + " です。",
          "まとめて " + m(correct) + " と書きます。"
        ];
      } else {
        var pr = M.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [2, 7], [3, 7], [5, 7], [3, 8], [5, 8], [4, 9]]);
        var p = pr[0], q = pr[1];
        nHtml = M.frac(p * p, q * q);
        correct = PM + M.frac(p, q);
        wrongs = [M.frac(p, q), M.MINUS + M.frac(p, q), PM + M.frac(p * p, q * q), PM + M.frac(p, q * q), PM + M.frac(p * p, q)];
        lines = [
          "2乗すると " + m(nHtml) + " になる数をさがします。正の数の平方根は、正と負の2つあります。",
          m(M.pow(par(M.frac(p, q)), 2), "=", M.frac(p * p, q * q)) + "、" + m(M.pow(par(M.MINUS + M.frac(p, q)), 2), "=", M.frac(p * p, q * q)),
          "したがって、平方根は " + m(correct)
        ];
      }
      return build({ text: "次の数の平方根を求めなさい。", math: m(nHtml), explain: lines, meta: { kind: "g3-sqroots" } },
        M.choices(correct, wrongs));
    }
    if (kind === "value") {
      var form = M.rand(0, 5), expr, ans, nums;
      if (form === 0 || form === 1) {
        k = M.rand(2, 15);
        expr = M.sqrt(k * k, form === 0 ? 1 : -1);
        ans = form === 0 ? k : -k;
        lines = [
          m(M.sqrt(k * k)) + " は、" + m(k * k) + " の平方根のうち正のほうを表します。",
          m(M.pow(k, 2), "=", k * k) + " なので、" + m(M.sqrt(k * k), "=", k),
          "したがって、" + m(expr, "=", ans)
        ];
        nums = [-ans, k * k / 2, k * k, -k * k, ans + 1];
      } else if (form === 2 || form === 3) {
        a = M.pick([2, 3, 5, 6, 7, 10, 11, 13]);
        expr = M.pow(par(M.sqrt(a, form === 2 ? 1 : -1)), 2);
        ans = a;
        lines = [
          m(M.sqrt(a)) + " も " + m(M.sqrt(a, -1)) + " も、2乗すると " + m(a) + " になる数(" + m(a) + " の平方根)です。",
          m(expr, "=", a)
        ];
        nums = [-a, a * a, -a * a, 2 * a];
      } else {
        k = M.rand(2, 12);
        expr = M.sqrt(M.pow(-k, 2), form === 4 ? 1 : -1);
        ans = form === 4 ? k : -k;
        lines = [
          "根号の中を先に計算します。" + m(M.pow(-k, 2), "=", k * k),
          m(expr, "=", M.sqrt(k * k, form === 4 ? 1 : -1), "=", ans),
          "根号 " + m(M.sqrt(VA)) + " は、いつも正(または 0)の数を表します。"
        ];
        nums = [-ans, k * k, -k * k, ans + 1];
      }
      return build({ text: "次の数を、根号を使わずに表しなさい。", math: m(expr), explain: lines, meta: { kind: "calc" } }, M.numChoices(ans, nums));
    }
    // 有理数と無理数
    var irr = M.shuffle([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15]).map(function (r, i) {
      var h = M.sqrt(r, i % 3 === 2 ? -1 : 1);
      return { h: h, why: m(h) + " は、根号の中が有理数の2乗ではないので、分数で表せません" };
    });
    irr.push({ h: "π", why: "円周率 " + m("π") + " は、循環しない無限小数で、分数で表せません" });
    var ratRoot = M.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).map(function (r, i) {
      var h = M.sqrt(r * r, i % 3 === 2 ? -1 : 1);
      return { h: h, why: m(h, "=", i % 3 === 2 ? -r : r) };
    });
    ratRoot.push({ h: M.sqrt(M.frac(4, 9)), why: m(M.sqrt(M.frac(4, 9)), "=", M.frac(2, 3)) });
    ratRoot.push({ h: M.sqrt(M.frac(9, 25)), why: m(M.sqrt(M.frac(9, 25)), "=", M.frac(3, 5)) });
    var ratPlain = M.shuffle([
      { h: M.num(0.3), why: m(M.num(0.3), "=", M.frac(3, 10)) },
      { h: M.num(-1.5), why: m(M.num(-1.5), "=", M.MINUS + M.frac(3, 2)) },
      { h: M.num(0.25), why: m(M.num(0.25), "=", M.frac(1, 4)) },
      { h: M.frac(2, 3), why: m(M.frac(2, 3)) + " は分数" },
      { h: M.MINUS + M.frac(5, 7), why: m(M.MINUS + M.frac(5, 7)) + " は分数" },
      { h: M.num(-4), why: m(-4, "=", M.MINUS + M.frac(4, 1)) },
      { h: "0", why: m(0, "=", M.frac(0, 1)) }
    ]);
    var def = "整数 " + mf("a") + " と、0 でない整数 " + mf("b") + " を使って、分数 " + m(M.frac(v("a"), v("b"))) + " の形に表せる数が<b>有理数</b>、表せない数が<b>無理数</b>です。";
    var right, others;
    if (Math.random() < 0.6) {
      right = M.pick(irr);
      others = M.shuffle([ratRoot[0], ratRoot[1], ratPlain[0], ratPlain[1]]).slice(0, 3);
      return build({
        text: "次の数のうち、無理数はどれですか。",
        explain: [def, right.why + "(無理数)。", "ほかの数は有理数です。" + others.map(function (o) { return o.why; }).join("、")],
        meta: { kind: "g3-irrational" }
      }, M.choices(right.h, others.map(function (o) { return o.h; })));
    }
    right = M.pick(ratRoot);
    others = [irr[0], irr[1], irr[irr.length - 1]];
    if (Math.random() < 0.5) others[2] = irr[2];
    return build({
      text: "次の数のうち、有理数はどれですか。",
      explain: [def, right.why + " なので有理数です。", "ほかの数は、根号の中が有理数の2乗ではない数や円周率で、無理数です。"],
      meta: { kind: "g3-irrational" }
    }, M.choices(right.h, others.map(function (o) { return o.h; })));
  }

  // 平方根の大小
  function genRootCompare() {
    var kind = M.pick(["extreme", "extreme", "between", "floor"]);
    var a, b, n, ans;
    if (kind === "between") {
      a = M.rand(1, 5); b = a + M.pick([1, 1, 2]);
      ans = b * b - a * a - 1;
      return build({
        text: m(a, "<", M.sqrt(v("n")), "<", b) + " を満たす自然数 " + mf("n") + " は、全部で何個ありますか。",
        explain: [
          "正の数どうしは、2乗しても大小は変わりません。各辺を2乗します。",
          m(M.pow(a, 2), "<", v("n"), "<", M.pow(b, 2)) + " すなわち " + m(a * a, "<", v("n"), "<", b * b),
          mf("n") + " は " + (a * a + 1) + " から " + (b * b - 1) + " までの自然数なので、" + m(b * b - 1, "-", a * a + 1, "+", 1, "=", ans) + "(個)"
        ],
        meta: { kind: "g3-between" }
      }, M.numChoices(ans, [ans + 1, ans + 2, ans - 1, b - a - 1, b * b - a * a + 1], { fmt: function (t) { return M.num(t) + " 個"; }, ok: function (t) { return t > 0; } }));
    }
    if (kind === "floor") {
      do { n = M.rand(5, 120); } while (Math.sqrt(n) === Math.floor(Math.sqrt(n)));
      ans = Math.floor(Math.sqrt(n));
      return build({
        text: m(v("n"), "<", M.sqrt(n), "<", v("n"), "+", 1) + " を満たす自然数 " + mf("n") + " を求めなさい。",
        explain: [
          m(n) + " をはさむ、自然数の2乗をさがします。",
          m(M.pow(ans, 2), "=", ans * ans) + "、" + m(M.pow(ans + 1, 2), "=", (ans + 1) * (ans + 1)),
          m(ans * ans, "<", n, "<", (ans + 1) * (ans + 1)) + " なので " + m(ans, "<", M.sqrt(n), "<", ans + 1),
          "したがって、" + m(v("n"), "=", ans)
        ],
        meta: { kind: "g3-floor-root" }
      }, M.numChoices(ans, [ans + 1, ans - 1, Math.round(n / 2), ans + 2], { fmt: function (t) { return v("n") + M.op("=") + M.num(t); }, ok: function (t) { return t > 0; } }));
    }
    // 4つの数の中で最大・最小
    var pool = [], k, r, c;
    for (k = 2; k <= 7; k++) pool.push({ h: M.num(k), sq: k * k, type: "int", p: M.pow(k, 2) });
    for (n = 2; n <= 50; n++) if (sqSplit(n)[0] === 1) pool.push({ h: M.sqrt(n), sq: n, type: "root", p: M.pow(par(M.sqrt(n)), 2) });
    for (c = 2; c <= 4; c++) ROOT_SMALL.forEach(function (rr) { pool.push({ h: M.sqrt(rr, c), sq: c * c * rr, type: "coef", p: M.pow(par(M.sqrt(rr, c)), 2) }); });
    var four, types;
    do {
      var center = M.rand(6, 40), seen = {};
      four = [];
      M.shuffle(pool.filter(function (t) { return abs(t.sq - center) <= 10; })).forEach(function (t) {
        if (four.length < 4 && !seen[t.sq]) { seen[t.sq] = true; four.push(t); }
      });
      types = {};
      four.forEach(function (t) { types[t.type] = true; });
    } while (four.length < 4 || Object.keys(types).length < 2);
    var neg = Math.random() < 0.35, wantMax = Math.random() < 0.5;
    four.sort(function (s, t) { return s.sq - t.sq; });          // 絶対値の小さい順
    function show(t) { return (neg ? M.MINUS : "") + t.h; }
    var asc = neg ? four.slice().reverse() : four;                // 値の小さい順
    var best = wantMax ? asc[3] : asc[0];
    var chain = [];
    asc.forEach(function (t, i) { if (i) chain.push("<"); chain.push(show(t)); });
    var sqLines = [
      m(four[0].p, "=", four[0].sq) + "、" + m(four[1].p, "=", four[1].sq),
      m(four[2].p, "=", four[2].sq) + "、" + m(four[3].p, "=", four[3].sq)
    ];
    var lines = neg
      ? ["まず絶対値を比べます。正の数どうしは、2乗した数が大きいほど大きくなります。"].concat(sqLines, ["負の数は、絶対値が大きいほど小さくなります。", m(chain)])
      : ["正の数どうしは、2乗した数が大きいほど大きくなります。それぞれ2乗して比べます。"].concat(sqLines, [m(chain)]);
    lines.push("したがって、最も" + (wantMax ? "大きい" : "小さい") + "数は " + m(show(best)) + " です。");
    return build({
      text: "次の4つの数のうち、最も" + (wantMax ? "大きい" : "小さい") + "数はどれですか。",
      explain: lines,
      meta: { kind: "g3-extreme" }
    }, M.choices(show(best), four.filter(function (t) { return t !== best; }).map(show)));
  }

  // 根号のついた数の変形
  function genRootSimplify() {
    var kind = M.pick(["out", "out", "in", "frac"]);
    var a, b, n, q;
    if (kind === "out") {
      do { a = M.rand(2, 7); b = M.pick([2, 3, 5, 6, 7, 10, 11]); n = a * a * b; } while (n > 300);
      return build({
        text: "次の数を " + m(VA + M.sqrt(v("b"))) + " の形に表しなさい(根号の中を、できるだけ小さい自然数にする)。",
        math: m(M.sqrt(n)),
        explain: [
          "根号の中の数を、2乗の因数をもつ積に直します。" + m(n, "=", M.pow(a, 2), "*", b),
          m(M.sqrt(n), "=", M.sqrt(M.join(M.pow(a, 2), "*", b)), "=", M.sqrt(b, a)),
          mf("√(a^2 b) = a√b") + "(" + mf("a > 0") + ")を使いました。"
        ],
        meta: { kind: "g3-root" }
      }, M.choices(root(1, n), [root(b, a), root(a * a, b), root(a + 1, b), root(a - 1, b), root(a, b + 1)], function (i) { return root(a + i + 2, b); }));
    }
    if (kind === "in") {
      do { a = M.rand(2, 6); b = M.pick([2, 3, 5, 6, 7, 10]); } while (a === b);
      n = a * a * b;
      return build({
        text: "次の数を " + m(M.sqrt(VA)) + " の形に表しなさい。",
        math: m(M.sqrt(b, a)),
        explain: [
          "根号の外の数は、2乗して根号の中に入れます。" + mf("a√b = √(a^2 b)"),
          m(M.sqrt(b, a), "=", M.sqrt(M.join(M.pow(a, 2), "*", b)), "=", M.sqrt(n))
        ],
        meta: { kind: "calc" }
      }, M.choices(M.sqrt(n), [M.sqrt(a * b), M.sqrt(a * b * b), M.sqrt(2 * a * b), M.sqrt(a * a + b), M.sqrt(a + b)], function (i) { return M.sqrt(n + i + 1); }));
    }
    do { b = M.pick(ROOT_SMALL); q = M.rand(2, 9); } while (M.gcd(b, q) !== 1);
    var expr = M.sqrt(M.frac(b, q * q));
    return build({
      text: "次の数を、根号の中をできるだけ小さい自然数にして表しなさい。",
      math: m(expr),
      explain: [
        mf("√({a/b}) = {√a/√b}") + " を使って、分母の根号をはずします。",
        m(expr, "=", M.frac(M.sqrt(b), M.sqrt(q * q)), "=", M.frac(M.sqrt(b), q))
      ],
      meta: { kind: "g3-root" }
    }, M.choices(root(1, b, q), [root(1, b, q * q), M.fracNum(b, q), root(1, b, 2 * q), root(q, b), M.fracNum(b, q * q)], function (i) { return root(1, b, q + i + 1); }));
  }

  // 根号をふくむ式の乗法・除法
  function genRootMulDiv() {
    var kind = M.pick(["mul", "mul", "coef-mul", "div", "frac-div"]);
    var a, b, p, q, k, expr, correct, wrongs, lines, s;
    var L = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
    if (kind === "mul") {
      do { a = M.pick(L); b = M.pick(L); } while (a === b);
      p = a * b; s = sqSplit(p);
      expr = M.join(M.sqrt(a), "*", M.sqrt(b));
      correct = root(1, p);
      lines = [mf("√a * √b = √(ab)") + " を使います。", m(expr, "=", M.sqrt(M.join(a, "*", b)), "=", M.sqrt(p))];
      if (s[0] > 1) lines.push("根号の中を簡単にします。" + m(M.sqrt(p), "=", M.sqrt(M.join(M.pow(s[0], 2), "*", s[1])), "=", correct));
      wrongs = [root(1, a + b), M.num(p)];
      if (s[0] > 1) wrongs.push(root(s[0] * s[0], s[1]), root(s[1], s[0]));
      wrongs.push(root(2, p), root(1, p + 1));
    } else if (kind === "coef-mul") {
      p = M.rand(2, 4); q = M.rand(2, 4); a = M.pick([2, 3, 5, 6, 7, 10]); b = M.pick([2, 3, 5, 6, 7, 10]);
      expr = M.join(M.sqrt(a, p), "*", M.sqrt(b, q));
      correct = root(p * q, a * b);
      lines = [
        "根号の外の数どうし、根号の中の数どうしをかけます。",
        m(expr, "=", p, "*", q, "*", M.sqrt(M.join(a, "*", b))),
        correct === M.sqrt(a * b, p * q) ? m("=", correct) : m("=", M.sqrt(a * b, p * q), "=", correct)
      ];
      wrongs = [root(p + q, a * b), root(p * q, a + b), root(1, a * b), M.num(p * q * a * b), root(p * q, a * b * 2), root(p * q + 1, a * b)];
    } else if (kind === "div") {
      do { k = M.pick([2, 3, 5, 6, 7, 8, 10, 12]); b = M.pick(ROOT_SMALL); a = k * b; } while (sqSplit(a)[1] === 1);   // √36 のような数は出さない
      expr = M.join(M.sqrt(a), "/", M.sqrt(b));
      correct = root(1, k);
      lines = [mf("√a / √b = √({a/b})") + " を使います。", m(expr, "=", M.sqrt(M.frac(a, b)), "=", M.sqrt(k))];
      if (sqSplit(k)[0] > 1) lines.push("根号の中を簡単にします。" + m(M.sqrt(k), "=", correct));
      wrongs = [root(1, a - b), M.num(k), root(1, a * b), root(2, k), root(1, k + 1)];
    } else {
      do {
        p = M.rand(2, 9); q = M.rand(2, 6); k = M.pick([2, 3, 5, 6, 7]); b = M.pick(ROOT_SMALL);
        a = k * b;
      } while (p === q || k === b);
      expr = M.frac(M.sqrt(a, p), M.sqrt(b, q));
      correct = root(p, k, q);
      lines = [
        "根号の外の数どうし、根号の中の数どうしで、それぞれわり算(約分)をします。",
        m(expr, "=", M.frac(p, q), "*", M.sqrt(M.frac(a, b))),
        m("=", M.frac(p, q), "*", M.sqrt(k), "=", correct)
      ];
      wrongs = [root(p, a - b, q), root(q, k, p), root(p * q, k), root(p, k, q + 1), M.fracNum(p * k, q), root(p, a * b, q)];
    }
    return build({ text: "次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "g3-root" } },
      M.choices(correct, wrongs, function (i) { return root(i + 2, kind === "mul" ? a * b + 1 : 3); }));
  }

  // 分母の有理化
  function genRationalize() {
    var kind = M.pick(["basic", "basic", "coef", "root-root", "big"]);
    var a, b, c, expr, correct, wrongs, lines, mid;
    if (kind === "basic") {
      b = M.pick([2, 3, 5, 6, 7, 10]); a = M.rand(1, 12);
      expr = M.frac(a, M.sqrt(b));
      correct = root(a, b, b);
      mid = M.frac(M.sqrt(b, a), b);
      lines = [
        "分母と分子に " + m(M.sqrt(b)) + " をかけて、分母を根号のない形にします。",
        m(expr, "=", M.frac(M.join(a, "*", M.sqrt(b)), M.join(M.sqrt(b), "*", M.sqrt(b)))),
        mid === correct ? m("=", correct) : m("=", mid, "=", correct)
      ];
      wrongs = [root(a, b), M.fracNum(a, b), root(a, b, b * b), root(1, b, a), root(a * b, b), root(a + 1, b, b)];
    } else if (kind === "coef") {
      b = M.pick(ROOT_SMALL); c = M.rand(2, 4); a = M.rand(1, 12);
      expr = M.frac(a, M.sqrt(b, c));
      correct = root(a, b, c * b);
      mid = M.frac(M.sqrt(b, a), c * b);
      lines = [
        "分母と分子に " + m(M.sqrt(b)) + " をかけます(" + m(c) + " はかけなくてよい)。",
        m(expr, "=", M.frac(M.join(a, "*", M.sqrt(b)), M.join(M.sqrt(b, c), "*", M.sqrt(b)))),
        mid === correct ? m("=", correct) : m("=", mid, "=", correct)
      ];
      wrongs = [root(a, b, c), root(a, b, b), root(a * c, b, b), root(a, b, c * c * b), root(a, b), root(a + 1, b, c * b)];
    } else if (kind === "root-root") {
      do { a = M.pick(ROOT_SMALL); b = M.pick(ROOT_SMALL); } while (a === b);
      expr = M.frac(M.sqrt(a), M.sqrt(b));
      correct = root(1, a * b, b);
      mid = M.frac(M.sqrt(a * b), b);
      lines = [
        "分母と分子に " + m(M.sqrt(b)) + " をかけます。",
        m(expr, "=", M.frac(M.join(M.sqrt(a), "*", M.sqrt(b)), M.join(M.sqrt(b), "*", M.sqrt(b))), "=", mid)
      ];
      if (mid !== correct) lines.push("根号の中を簡単にして約分します。" + m(mid, "=", correct));
      wrongs = [root(1, a * b), root(1, a * b, a), M.fracNum(a, b), root(1, a, b), root(1, b, a), root(2, a * b, b)];
    } else {
      var n = M.pick([8, 12, 18, 20, 27]), s = sqSplit(n);
      a = M.rand(1, 12);
      expr = M.frac(a, M.sqrt(n));
      correct = root(a, n, n);
      mid = M.frac(M.sqrt(s[1], a), s[0] * s[1]);
      lines = [
        "先に分母を簡単にします。" + m(M.sqrt(n), "=", M.sqrt(s[1], s[0])),
        "分母と分子に " + m(M.sqrt(s[1])) + " をかけます。",
        m(M.frac(a, M.sqrt(s[1], s[0])), "=", M.frac(M.join(a, "*", M.sqrt(s[1])), M.join(M.sqrt(s[1], s[0]), "*", M.sqrt(s[1])))),
        mid === correct ? m("=", correct) : m("=", mid, "=", correct)
      ];
      wrongs = [root(a, s[1], s[1]), root(a, s[1], s[0]), root(a, s[1]), root(a * s[0], s[1], s[1]), M.fracNum(a, n), root(a + 1, n, n)];
    }
    return build({ text: "次の数の分母を有理化しなさい。", math: m(expr), explain: lines, meta: { kind: "g3-root" } },
      M.choices(correct, wrongs, function (i) { return root(a + i + 2, b || 2, (b || 2) + 1); }));
  }

  // 根号をふくむ式の加法・減法
  function genRootAddSub() {
    var kind = M.pick(["like", "first", "first", "two", "rational"]);
    var r, a, b, c, d, p, q, expr, correct, wrongs, lines, S;
    if (kind === "like") {
      r = M.pick(ROOT_SMALL); S = M.sqrt(r);
      do { a = M.randNZ(-9, 9); b = M.randNZ(-9, 9); c = M.pick([0, M.randNZ(-6, 6)]); } while (a + b + c === 0 || (a < 0 && b < 0));
      expr = M.poly([[a, S], [b, S], [c, S]]);
      correct = root(a + b + c, r);
      lines = [
        "根号の中が同じ数は、同類項と同じようにまとめます。",
        m(expr, "=", par(c === 0 ? M.join(a, sg(b), abs(b)) : M.join(a, sg(b), abs(b), sg(c), abs(c))) + S),
        m("=", correct)
      ];
      wrongs = [root(a + b + c, 2 * r), root(a - b + c, r), M.num((a + b + c) * r), root(a * b, r), root(-(a + b + c), r), root(a + b + c + 1, r)];
    } else if (kind === "first") {
      r = M.pick(ROOT_SMALL);
      var op;
      do { p = M.rand(1, 6); q = M.rand(2, 6); op = M.pick(["+", "-"]); } while (p === q || p * p * r > 200 || q * q * r > 200);
      var res = op === "+" ? p + q : p - q;
      expr = M.join(M.sqrt(p * p * r), op, M.sqrt(q * q * r));
      correct = root(res, r);
      lines = ["根号の中をできるだけ小さい自然数にしてから、まとめます。"];
      lines.push((p > 1 ? m(M.sqrt(p * p * r), "=", M.sqrt(r, p)) + "、" : "") + m(M.sqrt(q * q * r), "=", M.sqrt(r, q)));
      lines.push(m(expr, "=", M.sqrt(r, p), op, M.sqrt(r, q)));
      lines.push(m("=", correct));
      wrongs = [op === "+" ? root(1, p * p * r + q * q * r) : (p > q ? root(1, p * p * r - q * q * r) : root(-1, q * q * r - p * p * r)), root(op === "+" ? p - q : p + q, r), root(p * q, r), root(res, 2 * r), root(res + 1, r), root(-res, r)];
    } else if (kind === "two") {
      var r2;
      do { r = M.pick(ROOT_SMALL); r2 = M.pick(ROOT_SMALL); } while (r === r2);
      do { a = M.randNZ(-6, 6); b = M.randNZ(-6, 6); c = M.randNZ(-6, 6); d = M.randNZ(-6, 6); } while (a + c === 0 || b + d === 0 || a < 0);
      var S1 = M.sqrt(r), S2 = M.sqrt(r2);
      expr = M.poly([[a, S1], [b, S2], [c, S1], [d, S2]]);
      correct = rootPoly([[a + c, r], [b + d, r2]]);
      lines = [
        "根号の中が同じ数どうしをまとめます。根号の中がちがう数は、これ以上まとめられません。",
        m(expr),
        m("=", M.poly([[a, S1], [c, S1], [b, S2], [d, S2]])),
        m("=", correct)
      ];
      wrongs = [rootPoly([[a - c, r], [b + d, r2]]), rootPoly([[a + c, r], [b - d, r2]]), root(a + b + c + d, r + r2), rootPoly([[a + c, r], [-(b + d), r2]]), root(a + b + c + d, r * r2), rootPoly([[b + d, r], [a + c, r2]])];
    } else {
      var t, op2;
      r = M.pick(ROOT_SMALL);
      do { p = M.rand(1, 5); t = M.rand(1, 4); op2 = M.pick(["+", "-"]); } while (op2 === "-" && p === t);
      var res2 = op2 === "+" ? p + t : p - t;
      expr = M.join(M.sqrt(p * p * r), op2, M.frac(t * r, M.sqrt(r)));
      correct = root(res2, r);
      lines = [
        "分母を有理化します。" + m(M.frac(t * r, M.sqrt(r)), "=", M.frac(M.sqrt(r, t * r), r), "=", M.sqrt(r, t))
      ];
      if (p > 1) lines.push("根号の中を簡単にします。" + m(M.sqrt(p * p * r), "=", M.sqrt(r, p)));
      lines.push(m(expr, "=", M.sqrt(r, p), op2, M.sqrt(r, t)));
      lines.push(m("=", correct));
      wrongs = [root(op2 === "+" ? p + t * r : p - t * r, r), root(op2 === "+" ? p - t : p + t, r), rootPoly([[op2 === "+" ? t : -t, 1], [p, r]]), root(res2, 2 * r), root(res2 + 1, r), root(-res2, r)];
    }
    return build({ text: "次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "g3-root" } },
      M.choices(correct, wrongs, function (i) { return root(i + 2, r + 1); }));
  }

  // 根号をふくむ式の展開
  function genRootExpand() {
    var kind = M.pick(["dist", "sq", "sq2", "sumdiff", "xab"]);
    var a, b, c, p, q, expr, correct, wrongs, lines, Sa;
    if (kind === "dist") {
      a = M.pick([2, 3, 5]);
      do { b = a * M.pick([1, 2, 3, 5, 7]); } while (b === a * a);   // √4 のような数は出さない
      c = M.randNZ(-5, 5);
      Sa = M.sqrt(a);
      expr = Sa + par(M.poly([[1, M.sqrt(b)], [c, ""]]));
      correct = rootPoly([[1, a * b], [c, a]]);
      lines = [
        "分配法則でかっこをはずします。",
        m(expr, "=", Sa, "*", M.sqrt(b), sg(c), Sa, "*", abs(c)),
        m("=", M.poly([[1, M.sqrt(a * b)], [c, Sa]])),
        m("=", correct)
      ];
      if (M.poly([[1, M.sqrt(a * b)], [c, Sa]]) === correct) lines.splice(2, 1);
      wrongs = [rootPoly([[1, a * b], [c, 1]]), rootPoly([[1, a + b], [c, a]]), rootPoly([[1, a * b], [-c, a]]), rootPoly([[1, a * b], [c * a, 1]]), rootPoly([[1, b], [c, a]])];
    } else if (kind === "sq") {
      a = M.pick(ROOT_SMALL); c = M.randNZ(-5, 5); Sa = M.sqrt(a);
      expr = M.pow(par(M.poly([[1, Sa], [c, ""]])), 2);
      correct = rootPoly([[a + c * c, 1], [2 * c, a]]);
      lines = [
        "乗法公式 " + (c > 0 ? mf("(a + b)^2 = a^2 + 2ab + b^2") : mf("(a - b)^2 = a^2 - 2ab + b^2")) + " を使います。",
        m(expr),
        m("=", M.pow(par(Sa), 2), sg(c), 2, "*", Sa, "*", abs(c), "+", M.pow(abs(c), 2)),
        m("=", a, sg(c), M.sqrt(a, 2 * abs(c)), "+", c * c),
        m("=", correct)
      ];
      wrongs = [M.num(a + c * c), rootPoly([[a + c * c, 1], [c, a]]), rootPoly([[a + c * c, 1], [-2 * c, a]]), rootPoly([[a - c * c, 1], [2 * c, a]]), rootPoly([[a * a + c * c, 1], [2 * c, a]]), M.num(a - c * c)];
    } else if (kind === "sq2") {
      do { a = M.pick(ROOT_SMALL); b = M.pick(ROOT_SMALL); } while (a >= b);
      var sign = M.pick([1, -1]);
      Sa = M.sqrt(a);
      var Sb = M.sqrt(b);
      expr = M.pow(par(M.poly([[1, Sb], [sign, Sa]])), 2);
      correct = rootPoly([[a + b, 1], [2 * sign, a * b]]);
      lines = [
        "乗法公式 " + (sign > 0 ? mf("(a + b)^2 = a^2 + 2ab + b^2") : mf("(a - b)^2 = a^2 - 2ab + b^2")) + " を使います。",
        m(expr),
        m("=", M.pow(par(Sb), 2), sg(sign), 2, "*", Sb, "*", Sa, "+", M.pow(par(Sa), 2)),
        m("=", b, sg(sign), M.sqrt(a * b, 2), "+", a),
        m("=", correct)
      ];
      wrongs = [M.num(a + b), M.num(b - a), rootPoly([[a + b, 1], [sign, a * b]]), rootPoly([[a + b, 1], [-2 * sign, a * b]]), rootPoly([[a + b, 1], [2 * sign, a + b]]), rootPoly([[b - a, 1], [2 * sign, a * b]])];
    } else if (kind === "sumdiff") {
      a = M.pick([2, 3, 5, 6, 7, 10, 11, 13]); c = M.rand(1, 5); Sa = M.sqrt(a);
      var plus = par(M.poly([[1, Sa], [c, ""]])), minus = par(M.poly([[1, Sa], [-c, ""]]));
      expr = Math.random() < 0.5 ? plus + minus : minus + plus;
      correct = M.num(a - c * c);
      lines = [
        "乗法公式 " + mf("(a + b)(a - b) = a^2 - b^2") + " を使います。",
        m(expr, "=", M.pow(par(Sa), 2), "-", M.pow(c, 2)),
        m("=", a, "-", c * c, "=", a - c * c)
      ];
      wrongs = [M.num(a + c * c), rootPoly([[a + c * c, 1], [-2 * c, a]]), rootPoly([[a - c * c, 1], [2 * c, a]]), M.num(a * a - c * c), M.num(a - c), M.num(c * c - a)];
    } else {
      a = M.pick(ROOT_SMALL); Sa = M.sqrt(a);
      do { p = M.randNZ(-5, 5); q = M.randNZ(-5, 5); } while (abs(p) === abs(q));
      expr = par(M.poly([[1, Sa], [p, ""]])) + par(M.poly([[1, Sa], [q, ""]]));
      correct = rootPoly([[a + p * q, 1], [p + q, a]]);
      lines = [
        "乗法公式 " + mf("(x + a)(x + b) = x^2 + (a + b)x + ab") + " の " + mf("x") + " を " + m(Sa) + " とみます。",
        "和は " + m(p, "+", q, "=", p + q) + "、積は " + m(p, "*", q, "=", p * q),
        m(expr),
        m("=", M.poly([[1, M.pow(par(Sa), 2)], [p + q, Sa], [p * q, ""]])),
        m("=", M.poly([[a, ""], [p + q, Sa], [p * q, ""]])),
        m("=", correct)
      ];
      wrongs = [M.num(a + p * q), rootPoly([[a - p * q, 1], [p + q, a]]), rootPoly([[a + p + q, 1], [p * q, a]]), rootPoly([[a + p * q, 1], [-(p + q), a]]), rootPoly([[a + p * q, 1], [p - q, a]]), rootPoly([[a * a + p * q, 1], [p + q, a]])];
    }
    return build({ text: "次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "g3-root" } },
      M.choices(correct, wrongs, function (i) { return rootPoly([[i + 1, 1], [i + 2, a]]); }));
  }

  // 近似値と有効数字
  var APPROX = { 2: 1.414, 3: 1.732, 5: 2.236, 6: 2.449, 7: 2.646, 20: 4.472, 30: 5.477, 50: 7.071, 60: 7.746, 70: 8.367 };
  function genApprox() {
    var kind = M.pick(["shift", "shift", "coef", "rational", "sigfig", "sigfig", "range"]);
    var b, k, ap, val, expr, lines, wrongs;
    if (kind === "shift") {
      b = M.pick(ROOT_SMALL);
      var type = M.rand(0, 5);
      // [根号の中, もとにする数, 何倍するか, 解説の式]
      var t = [
        [b * 100, b, 10], [b * 1000, 10 * b, 10], [b / 100, b, 0.1], [b / 10, 10 * b, 0.1], [b * 10000, b, 100], [b / 1000, 10 * b, 0.01]
      ][type];
      var base = t[1], factor = t[2], other = base === b ? 10 * b : b;
      ap = APPROX[base];
      val = ap * factor;
      expr = M.sqrt(M.num(t[0]));
      var pw = factor >= 1 ? factor * factor : Math.round(1 / (factor * factor));
      lines = ["根号の中を、" + m(base) + " と 100 や 10000 の積・商に直します。"];
      if (factor >= 1) {
        lines.push(m(expr, "=", M.sqrt(M.join(base, "*", pw)), "=", M.sqrt(base, factor)));
        lines.push(m(factor, "*", ap, "=", M.num(val)));
      } else {
        lines.push(m(expr, "=", M.sqrt(M.frac(base, pw)), "=", M.frac(M.sqrt(base), Math.round(1 / factor))));
        lines.push(m(ap, "/", Math.round(1 / factor), "=", M.num(val)));
      }
      lines.push("小数点の位置が2けたずれるごとに、平方根の小数点は1けたずれます。");
      wrongs = [APPROX[other] * factor, val * 10, val / 10, APPROX[other] * factor * 10];
      return build({
        text: m(M.sqrt(b)) + " の近似値を " + M.num(APPROX[b]) + "、" + m(M.sqrt(10 * b)) + " の近似値を " + M.num(APPROX[10 * b]) + " として、次の数の近似値を求めなさい。",
        math: m(expr), explain: lines, meta: { kind: "g3-approx" }
      }, M.numChoices(val, wrongs, { allowDecimal: true }));
    }
    if (kind === "coef") {
      b = M.pick(ROOT_SMALL); k = M.rand(2, 5); ap = APPROX[b];
      val = k * ap;
      expr = M.sqrt(k * k * b);
      return build({
        text: m(M.sqrt(b)) + " の近似値を " + M.num(ap) + " として、次の数の近似値を求めなさい。",
        math: m(expr),
        explain: [
          "根号の中を簡単にして、" + m(M.sqrt(b)) + " を使った形に直します。",
          m(expr, "=", M.sqrt(M.join(M.pow(k, 2), "*", b)), "=", M.sqrt(b, k)),
          m(k, "*", ap, "=", M.num(val))
        ],
        meta: { kind: "g3-approx" }
      }, M.numChoices(val, [k * k * ap, (k + 1) * ap, (k - 1) * ap, ap + k, val / 2], { allowDecimal: true }));
    }
    if (kind === "rational") {
      b = M.pick(ROOT_SMALL); k = M.rand(2, 4); ap = APPROX[b];
      val = k * ap;
      expr = M.frac(k * b, M.sqrt(b));
      return build({
        text: m(M.sqrt(b)) + " の近似値を " + M.num(ap) + " として、次の数の近似値を求めなさい。",
        math: m(expr),
        explain: [
          "分母を有理化してから、近似値を代入します。",
          m(expr, "=", M.frac(M.sqrt(b, k * b), b), "=", M.sqrt(b, k)),
          m(k, "*", ap, "=", M.num(val))
        ],
        meta: { kind: "g3-approx" }
      }, M.numChoices(val, [k * b * ap, (k - 1) * ap, (k + 1) * ap, k * b / 2, val / 2], { allowDecimal: true }));
    }
    if (kind === "sigfig") {
      var sig = M.pick([2, 3]), d1 = M.rand(1, 9), d2 = M.rand(0, 9), d3 = sig === 3 ? M.pick([0, 0, M.rand(1, 9)]) : 0;
      var n = M.rand(sig, 5);                       // 10 の指数
      var digits = "" + d1 + d2 + (sig === 3 ? d3 : "");
      var N = parseInt(digits, 10) * Math.pow(10, n - sig + 1);
      var item = M.pick([["距離", "m"], ["重さ", "g"], ["道のり", "m"], ["質量", "g"]]);
      var mant = d1 + "." + digits.slice(1);
      var form = function (ms, e) { return ms + M.op("*") + M.pow(10, e); };
      var correct = form(mant, n);
      var alt = sig === 2 ? mant + "0" : (d3 === 0 ? mant.slice(0, 3) : mant.slice(0, 3) + "0");
      return build({
        text: "ある" + item[0] + "の測定値 " + N + " " + item[1] + " の有効数字は、" + digits.split("").join("、") + " の " + sig + " けたです。この測定値を、(整数部分が1けたの数)×(10 の累乗)の形で表しなさい。",
        explain: [
          "有効数字 " + digits.split("").join("、") + " を、整数部分が1けたの小数 " + mant + " にします。",
          m(N, "=", mant, "*", Math.pow(10, n)) + " で、" + m(Math.pow(10, n), "=", M.pow(10, n)) + " です。",
          "したがって、" + m(correct) + "(" + item[1] + ")" + (/0$/.test(mant) ? "。有効数字のけた数がわかるように、末位の 0 も書きます。" : "")
        ],
        choiceLayout: "stack",
        meta: { kind: "g3-sigfig" }
      }, M.choices(correct, [form(alt, n), form(mant, n + 1), form(mant, n - 1), form(digits, n - sig + 1), form("0." + digits, n + 1)]));
    }
    // 真の値の範囲
    var place = M.pick([1, 1, 2]), w, lo, hi, mid;
    if (place === 1) { mid = M.rand(10, 99); w = 0.5; }
    else { do { mid = M.rand(11, 99); } while (mid % 10 === 0); mid = mid / 10; w = 0.05; }
    lo = mid - w; hi = mid + w;
    function rng(l, o1, h, o2) { return M.join(M.num(l), o1, VA, o2, M.num(h)); }
    return build({
      text: "ある数 " + mf("a") + " の小数第 " + place + " 位を四捨五入した近似値が " + M.num(mid) + " になりました。" + mf("a") + " の値の範囲を、不等号を使って表しなさい。",
      explain: [
        "四捨五入して " + M.num(mid) + " になる数は、" + M.num(lo) + " 以上 " + M.num(hi) + " 未満の数です。",
        m(rng(lo, "<=", hi, "<")),
        M.num(hi) + " は、四捨五入すると " + M.num(mid + 2 * w) + " になるので、ふくみません。誤差の絶対値は " + M.num(w) + " 以下です。"
      ],
      choiceLayout: "stack",
      meta: { kind: "g3-round-range" }
    }, M.choices(rng(lo, "<=", hi, "<"), [rng(lo, "<=", hi, "<="), rng(mid - 2 * w, "<=", mid + 2 * w, "<"), rng(lo, "<", hi, "<="), rng(lo, "<", hi, "<")]));
  }

  JHM.register("g3-square-roots", {
    points: [
      "2乗すると " + mf("a") + " になる数を " + mf("a") + " の<b>平方根</b>といいます。正の数の平方根は " + M.rule(mf("√a")) + " と " + M.rule(mf("-√a")) + " の2つ。0 の平方根は 0 だけ。" + M.rule(mf("(√a)^2 = a")),
      "<b>大小</b>: " + mf("0 < a < b") + " ならば " + M.rule(mf("√a < √b")) + "。分数で表せる数が有理数、表せない数(" + mf("√2") + "、" + mf("π") + " など)が無理数です。",
      "<b>乗法・除法</b>: " + M.rule(mf("√a * √b = √(ab)")) + "、" + M.rule(mf("{√a/√b} = √({a/b})")) + "。根号の中は、できるだけ小さい自然数にします。" + M.rule(mf("√12 = 2√3")),
      "<b>分母の有理化</b>: 分母と分子に同じ数をかけて、分母に根号がない形にします。" + M.rule(mf("{a/√b} = {a√b/b}")),
      "<b>加法・減法</b>: 根号の中が同じ数どうしをまとめます。" + M.rule(mf("3√2 + 5√2 = 8√2")) + "。測定値は、有効数字がわかるように " + M.rule(mf("3.84 * 10^3")) + " のように表します。"
    ],
    example: {
      title: mf("√27 - {6/√3} + √12") + " を計算しなさい。",
      steps: [
        mf("√27 = 3√3") + "、" + mf("√12 = 2√3"),
        mf("{6/√3} = {6√3/3} = 2√3") + "(分母の有理化)",
        mf("3√3 - 2√3 + 2√3")
      ],
      result: mf("3√3")
    },
    generators: [
      { id: "meaning", label: "平方根の意味、有理数と無理数", make: genRootMeaning },
      { id: "compare", label: "平方根の大小", make: genRootCompare },
      { id: "simplify", label: "根号のついた数の変形", make: genRootSimplify },
      { id: "mul-div", label: "乗法・除法", make: genRootMulDiv },
      { id: "rationalize", label: "分母の有理化", make: genRationalize },
      { id: "add-sub", label: "加法・減法", make: genRootAddSub },
      { id: "expand", label: "根号をふくむ式の展開", make: genRootExpand },
      { id: "approx", label: "近似値と有効数字", make: genApprox }
    ]
  });

  // =====================================================================
  // 3-3 二次方程式
  // =====================================================================

  var ZERO_RULE = mf("AB = 0") + " ならば " + mf("A = 0") + " または " + mf("B = 0") + " です。";

  // 平方根の考えを使って解く
  function genQuadSqrt() {
    var a, n, b, p, q, k, math, correct, wrongs, lines, fill;
    if (Math.random() < 0.45) {
      a = M.rand(1, 5);
      n = M.pick([1, 4, 9, 16, 25, 36, 49, 64, 81, 2, 3, 5, 6, 7, 8, 10, 12, 18, 20]);
      b = a * n;
      var form = M.rand(0, 1);
      math = form === 0 ? m(M.term(a, X2), "=", b) : m(M.poly([[a, X2], [-b, ""]]), "=", 0);
      correct = solPQ(0, 1, n, 1);
      lines = [];
      if (form === 1) lines.push("数の項を移項して、" + m(M.term(a, X2), "=", b));
      if (a > 1) lines.push("両辺を " + a + " でわって、" + m(X2, "=", n));
      lines.push(mf("x^2 = k") + " の解は、" + mf("k") + " の平方根 " + m(xeqs(PM + M.sqrt(v("k")))) + " です。");
      lines.push(sqSplit(n)[0] > 1 ? m(xeqs(PM + M.sqrt(n)), "=", PM + root(1, n)) : m(correct));
      wrongs = [xeqs(root(1, n)), solPQ(0, 1, b, 1), solPQ(0, n, 1, 1), xeqs(PM + M.fracNum(n, 2)), solPQ(0, 1, n * a * a, 1), xeqs(root(-1, n))];
      fill = function (i) { return solPQ(0, 1, n + i + 1, 1); };
    } else {
      p = M.randNZ(-7, 7);
      q = M.pick([1, 4, 9, 16, 25, 36, 2, 3, 5, 6, 7, 8, 12]);
      math = m(M.pow(xp(p), 2), "=", q);
      correct = solPQ(-p, 1, q, 1);
      var sq = sqSplit(q), isSq = sq[1] === 1;
      k = sq[0];
      lines = [m(M.linear(1, p)) + " を1つのものとみて、平方根を求めます。", m(M.linear(1, p), "=", PM + root(1, q))];
      if (isSq) {
        lines.push(m(X, "=", -p, "+", k, "=", -p + k) + "、" + m(X, "=", -p, "-", k, "=", -p - k));
        lines.push("したがって、" + m(correct));
      } else {
        lines.push(m(p) + " を移項して、" + m(correct));
      }
      wrongs = [solPQ(p, 1, q, 1), isSq ? sol1(-p + k) : xeqs(rootPoly([[-p, 1], [1, q]])), solPQ(-p, q, 1, 1), solPQ(0, 1, q, 1), solPQ(p, q, 1, 1)];
      fill = function (i) { return solPQ(-p + i + 1, 1, q, 1); };
    }
    return build({ text: "次の方程式を解きなさい。", math: math, explain: lines, meta: { kind: "g3-quad" } }, M.choices(correct, wrongs, fill));
  }

  // 因数分解を使って解く
  function genQuadFactor() {
    var kind = M.pick(["factored", "std", "std", "std", "zero", "double", "rearrange", "product", "common"]);
    var r1, r2, s, p, k, math, correct, wrongs, lines;
    do { r1 = M.randNZ(-9, 9); r2 = M.randNZ(-9, 9); } while (abs(r1) === abs(r2));
    s = r1 + r2; p = r1 * r2;
    correct = sol2(r1, r2);
    wrongs = [sol2(-r1, -r2), sol2(r1, -r2), sol2(-r1, r2), sol1(r1), sol1(r2)];
    var facLine = m(fac2(-r1, -r2), "=", 0);
    var orLine = m(M.linear(1, -r1), "=", 0) + " または " + m(M.linear(1, -r2), "=", 0);
    if (kind === "factored") {
      math = facLine;
      lines = [ZERO_RULE, orLine, "したがって、" + m(correct)];
    } else if (kind === "std") {
      math = m(M.quad(1, -s, p), "=", 0);
      lines = [
        "左辺を因数分解します。積が " + m(p) + "、和が " + m(-s) + " になる2数は " + m(-r1) + " と " + m(-r2) + " です。",
        facLine,
        orLine,
        "したがって、" + m(correct)
      ];
    } else if (kind === "zero") {
      k = M.randNZ(-9, 9);
      math = Math.random() < 0.5 ? m(X2, "=", M.term(k, X)) : m(M.quad(1, -k, 0), "=", 0);
      correct = sol2(0, k);
      wrongs = [sol1(k), sol2(0, -k), sol1(-k), solPQ(0, 1, abs(k), 1), sol1(0)];
      lines = [
        "両辺を " + mf("x") + " でわってはいけません(" + mf("x = 0") + " も解だからです)。右辺を 0 にして、因数分解します。",
        m(M.quad(1, -k, 0), "=", 0),
        m(X + xp(-k), "=", 0),
        mf("x = 0") + " または " + m(M.linear(1, -k), "=", 0) + " なので、" + m(correct)
      ];
    } else if (kind === "double") {
      k = M.randNZ(-9, 9);
      math = m(M.quad(1, -2 * k, k * k), "=", 0);
      correct = sol1(k);
      wrongs = [sol1(-k), sol2(k, -k), sol1(k * k), sol1(2 * k), sol2(0, k)];
      lines = [
        "左辺を因数分解します。",
        m(fac2(-k, -k), "=", 0),
        m(M.linear(1, -k), "=", 0),
        "したがって、" + m(correct) + "(解は1つだけです)"
      ];
    } else if (kind === "rearrange") {
      math = m(M.poly([[1, X2], [-s, X]]), "=", -p);
      lines = ["右辺を 0 にしてから、左辺を因数分解します。", m(M.quad(1, -s, p), "=", 0), facLine, "したがって、" + m(correct)];
    } else if (kind === "product") {
      var a, b, c;
      do { a = M.randNZ(-6, 6); b = -s - a; c = a * b - p; } while (b === 0 || c === 0);
      math = m(fac2(a, b), "=", c);
      wrongs = [sol2(c - a, c - b), sol2(-a, -b), sol2(-r1, -r2), sol1(r1), sol2(r1, -r2)];
      lines = [
        "右辺が 0 ではないので、左辺を展開して整理します。",
        m(M.quad(1, a + b, a * b), "=", c),
        m(M.quad(1, -s, p), "=", 0),
        facLine,
        "したがって、" + m(correct)
      ];
    } else {
      k = M.pick([2, 3, 4, 5, -1, -2]);
      math = m(M.quad(k, -k * s, k * p), "=", 0);
      lines = ["両辺を " + m(k) + " でわって、" + mf("x^2") + " の係数を 1 にします。", m(M.quad(1, -s, p), "=", 0), facLine, "したがって、" + m(correct)];
    }
    return build({ text: "次の方程式を解きなさい。", math: math, explain: lines, meta: { kind: "g3-quad" } },
      M.choices(correct, wrongs, function (i) { return sol2(r1 + i + 1, r2 - i - 1); }));
  }

  // 解の公式
  var FORMULA = xeqs(M.frac(M.join(M.MINUS + v("b"), M.op("±"), M.sqrt(f("b^2 - 4ac"))), f("2a")));
  function genQuadFormula() {
    var a, b, c, D;
    do {
      a = M.pick([1, 1, 2, 2, 3]); b = M.randNZ(-9, 9); c = M.randNZ(-6, 6);
      D = b * b - 4 * a * c;
    } while (D <= 0 || M.gcd(M.gcd(a, b), c) !== 1 || (a === 1 && sqSplit(D)[1] === 1));
    var correct = solPQ(-b, 1, D, 2 * a), s = sqSplit(D), D2 = b * b + 4 * a * c;
    var raw = xeqs(M.frac(M.join(-b, M.op("±"), M.sqrt(D)), 2 * a));
    var lines = [
      "解の公式 " + m(FORMULA) + " に、" + m(VA, "=", a) + "、" + m(v("b"), "=", b) + "、" + m(v("c"), "=", c) + " を代入します。",
      m(xeqs(M.frac(M.join(-b, M.op("±"), M.sqrt(M.join(M.pow(b, 2), "-", 4, "*", a, "*", c))), M.join(2, "*", a)))),
      m(raw)
    ];
    if (s[1] === 1) {
      lines.push(m(M.sqrt(D), "=", s[0]) + " なので、" + m(X, "=", M.frac(M.join(-b, "+", s[0]), 2 * a), "=", M.fracNum(-b + s[0], 2 * a)) + "、" + m(X, "=", M.frac(M.join(-b, "-", s[0]), 2 * a), "=", M.fracNum(-b - s[0], 2 * a)));
      lines.push("したがって、" + m(correct));
    } else if (raw !== correct) {
      if (s[0] > 1) lines.push("根号の中を簡単にします。" + m(M.sqrt(D), "=", M.sqrt(s[1], s[0])));
      // 実際に約分したとき(分子と分母を同じ数でわったとき)だけ「約分して」と書く
      var reduced = M.gcd(M.gcd(b, s[0]), 2 * a) > 1;
      lines.push((reduced ? "約分して、" : "したがって、") + m(correct));
    }
    return build({
      text: "次の方程式を、解の公式を使って解きなさい。",
      math: m(M.quad(a, b, c), "=", 0),
      explain: lines,
      choiceLayout: "stack",
      meta: { kind: "g3-quad" }
    }, M.choices(correct, [
      solPQ(b, 1, D, 2 * a), solPQ(-b, 1, D, a),
      D2 > 0 && D2 !== D ? solPQ(-b, 1, D2, 2 * a) : null,
      a !== 1 ? solPQ(-b, 1, D, 2) : null,
      solPQ(b, 1, D, a), solPQ(-b, 1, D, 4 * a)
    ], function (i) { return solPQ(-b, 1, D + i + 1, 2 * a); }));
  }

  // 二次方程式の文章題
  function genQuadWord() {
    var kind = M.pick(["consec", "consec-sq", "square", "rect", "box"]);
    var n, r, s, k, c, d, x, N;
    function unit(u) { return function (t) { return M.num(t) + u; }; }
    function pos(t) { return t > 0; }
    if (kind === "consec") {
      n = M.rand(3, 12); N = n * (n + 1);
      return build({
        text: "連続する2つの自然数があり、その積は " + N + " です。小さいほうの自然数を求めなさい。",
        explain: [
          "小さいほうの自然数を " + mf("x") + " とすると、大きいほうは " + mf("x + 1") + " です。",
          m(X + par(M.linear(1, 1)), "=", N),
          m(M.quad(1, 1, -N), "=", 0),
          m(fac2(n + 1, -n), "=", 0) + " より " + m(sol2(-n - 1, n)),
          mf("x") + " は自然数なので、" + m(X, "=", n) + "(2つの数は " + n + " と " + (n + 1) + ")"
        ],
        meta: { kind: "g3-word-consec" }
      }, M.numChoices(n, [n + 1, n - 1, n + 2, n - 2], { ok: pos }));
    }
    if (kind === "consec-sq") {
      n = M.rand(2, 9); N = n * n + (n + 1) * (n + 1);
      return build({
        text: "連続する2つの自然数があり、それぞれを2乗した数の和は " + N + " です。小さいほうの自然数を求めなさい。",
        explain: [
          "小さいほうの自然数を " + mf("x") + " とすると、大きいほうは " + mf("x + 1") + " です。",
          m(X2, "+", M.pow(par(M.linear(1, 1)), 2), "=", N),
          m(M.quad(2, 2, 1 - N), "=", 0) + " より " + m(M.quad(1, 1, (1 - N) / 2), "=", 0),
          m(fac2(n + 1, -n), "=", 0) + " より " + m(sol2(-n - 1, n)),
          mf("x") + " は自然数なので、" + m(X, "=", n) + "(" + m(M.pow(n, 2), "+", M.pow(n + 1, 2), "=", N) + ")"
        ],
        meta: { kind: "g3-word-consec-sq" }
      }, M.numChoices(n, [n + 1, n - 1, n + 2, n - 2], { ok: pos }));
    }
    if (kind === "square") {
      do { r = M.rand(3, 12); s = M.rand(1, r - 1); } while (r * s > 60);
      k = r - s; c = r * s;
      return build({
        text: "ある自然数を2乗すると、もとの数" + (k === 1 ? "" : "の " + k + " 倍") + "より " + c + " 大きくなります。この自然数を求めなさい。",
        explain: [
          "もとの自然数を " + mf("x") + " として、方程式をつくります。",
          m(X2, "=", M.linear(k, c)),
          m(M.quad(1, -k, -c), "=", 0),
          m(fac2(s, -r), "=", 0) + " より " + m(sol2(-s, r)),
          mf("x") + " は自然数なので、" + m(X, "=", r)
        ],
        meta: { kind: "g3-word-square" }
      }, M.numChoices(r, [s, r + 1, r - 1, c, r + 2], { ok: pos }));
    }
    if (kind === "rect") {
      x = M.rand(3, 10); d = M.rand(1, 5); N = x * (x + d);
      return build({
        text: "横の長さが縦の長さより " + d + " cm 長い長方形があり、面積は " + N + " cm<sup>2</sup> です。縦の長さを求めなさい。",
        explain: [
          "縦の長さを " + mf("x") + " cm とすると、横の長さは " + m(par(M.linear(1, d))) + " cm です。",
          m(X + par(M.linear(1, d)), "=", N),
          m(M.quad(1, d, -N), "=", 0),
          m(fac2(x + d, -x), "=", 0) + " より " + m(sol2(-x - d, x)),
          mf("x > 0") + " なので、" + m(X, "=", x) + "(縦 " + x + " cm、横 " + (x + d) + " cm)"
        ],
        meta: { kind: "g3-word-rect" }
      }, M.numChoices(x, [x + d, x - 1, x + 1, x + 2, d], { fmt: unit(" cm"), ok: pos }));
    }
    x = M.rand(6, 14); k = x - 4; N = 2 * k * k;
    return build({
      text: "正方形の厚紙の4すみから、1辺が 2 cm の正方形を切り取り、ふたのない箱を作ったところ、容積が " + N + " cm<sup>3</sup> になりました。もとの厚紙の1辺の長さを求めなさい。",
      explain: [
        "もとの厚紙の1辺を " + mf("x") + " cm とすると、箱の底面は1辺 " + mf("(x - 4)") + " cm の正方形、高さは 2 cm です。",
        m("2" + M.pow(par(M.linear(1, -4)), 2), "=", N),
        m(M.pow(par(M.linear(1, -4)), 2), "=", k * k),
        m(M.linear(1, -4), "=", PM + M.num(k)) + " より " + m(sol2(4 - k, 4 + k)),
        mf("x > 4") + " なので、" + m(X, "=", x)
      ],
      meta: { kind: "g3-word-box" }
    }, M.numChoices(x, [k, x - 2, x + 2, k + 2, x + 4], { fmt: unit(" cm"), ok: pos }));
  }

  // 解がわかっているときの係数、もう1つの解
  function genQuadKnownRoot() {
    var r1, r2;
    do { r1 = M.randNZ(-7, 7); r2 = M.randNZ(-7, 7); } while (abs(r1) === abs(r2));
    var s = r1 + r2, p = r1 * r2, a = -s, askA = Math.random() < 0.5;
    var math = m(M.poly([[1, X2], [1, VA + X], [p, ""]]), "=", 0);
    var lines = [
      "解を方程式に代入すると、等式が成り立ちます。" + m(X, "=", r1) + " を代入します。",
      m(M.pow(r1, 2), "+", VA, "*", r1, sg(p), abs(p), "=", 0),
      m(M.term(r1, VA), "=", -(r1 * r1 + p)) + " より " + m(VA, "=", a)
    ];
    if (askA) {
      return build({
        text: "下の二次方程式の解の1つが " + m(r1) + " のとき、" + mf("a") + " の値を求めなさい。",
        math: math, explain: lines, meta: { kind: "g3-known-root" }
      }, M.numChoices(a, [s, r2, -r2, p, -r1], { fmt: function (t) { return VA + M.op("=") + M.num(t); } }));
    }
    lines.push("もとの方程式は " + m(M.quad(1, a, p), "=", 0) + " なので、" + m(fac2(-r1, -r2), "=", 0));
    lines.push("したがって、もう1つの解は " + m(X, "=", r2));
    return build({
      text: "下の二次方程式の解の1つが " + m(r1) + " のとき、もう1つの解を求めなさい。",
      math: math, explain: lines, meta: { kind: "g3-known-root" }
    }, M.numChoices(r2, [-r2, a, s, -r1, p], { fmt: function (t) { return X + M.op("=") + M.num(t); } }));
  }

  JHM.register("g3-quadratic-equations", {
    points: [
      "移項して整理すると " + M.rule(mf("ax^2 + bx + c = 0")) + "(" + mf("a") + " は 0 でない)の形になる方程式を<b>二次方程式</b>といいます。解はふつう2つあります。",
      "<b>平方根の考え</b>: " + M.rule(m(X2, "=", v("k")) + " → " + m(xeqs(PM + M.sqrt(v("k"))))) + "、" + M.rule(m(M.pow(par(f("x + p")), 2), "=", v("q")) + " → " + m(X, "=", M.MINUS + v("p"), M.op("±"), M.sqrt(v("q")))),
      "<b>因数分解</b>: " + ZERO_RULE + M.rule(mf("(x - 2)(x + 5) = 0") + " → " + mf("x = -5, 2")) + "。" + mf("x^2 = 3x") + " の両辺を " + mf("x") + " でわってはいけません。",
      "<b>解の公式</b>: " + mf("ax^2 + bx + c = 0") + " の解は " + M.rule(m(FORMULA)),
      "<b>文章題</b>: 求める数量を " + mf("x") + " として方程式をつくり、解が問題に合うか(自然数か、長さが正か)を確かめます。"
    ],
    example: {
      title: mf("x^2 + 4x - 1 = 0") + " を解きなさい。",
      steps: [
        "解の公式に " + mf("a = 1") + "、" + mf("b = 4") + "、" + mf("c = -1") + " を代入",
        m(xeqs(M.frac(M.join(-4, M.op("±"), M.sqrt(f("4^2 - 4 * 1 * (-1)"))), f("2 * 1")))),
        m(xeqs(M.frac(M.join(-4, M.op("±"), M.sqrt(20)), 2)), "=", M.frac(M.join(-4, M.op("±"), M.sqrt(5, 2)), 2))
      ],
      result: m(solPQ(-4, 1, 20, 2))
    },
    generators: [
      { id: "sqrt-method", label: "平方根の考えで解く", make: genQuadSqrt },
      { id: "factoring", label: "因数分解で解く", make: genQuadFactor },
      { id: "formula", label: "解の公式", make: genQuadFormula },
      { id: "word", label: "文章題", make: genQuadWord },
      { id: "known-root", label: "解と係数", make: genQuadKnownRoot }
    ]
  });

  // =====================================================================
  // 3-4 関数 y = ax²
  // =====================================================================

  // 比例定数 a = n/d の候補
  var QA = [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [1, 3], [-1, 3], [1, 4], [-1, 4], [3, 2], [-3, 2]];
  function qEq(n, d) { return M.eqn(Y, M.term([n, d || 1], X2)); }
  function propEq(n, d) { return M.eqn(Y, M.term([n, d || 1], X)); }
  function lineEq(a, b) { return M.eqn(Y, M.linear(a, b)); }
  function yeq(t) { return Y + M.op("=") + M.num(t); }
  function rangeY(lo, hi) { return M.join(lo, "<=", Y, "<=", hi); }
  // a = n/d のとき、ax² が整数になる x のきざみ
  function stepOf(d) { return d === 1 ? 1 : (d === 3 ? 3 : 2); }

  // 式を求める、y の値を求める
  function genFnEq() {
    var a = M.pick(QA), n = a[0], d = a[1], st = stepOf(d), lim = st === 1 ? 5 : 3, p, q, r;
    do { p = st * M.randNZ(-lim, lim); q = n * p * p / d; } while (abs(p) > 6 || abs(q) > 60);
    var lead = mf("y") + " は " + mf("x") + " の2乗に比例し、" + m(X, "=", p) + " のとき " + m(Y, "=", q) + " です。";
    var lines = [
      mf("x") + " の2乗に比例するので、式は " + mf("y = ax^2") + " と表せます。" + m(X, "=", p) + "、" + m(Y, "=", q) + " を代入します。",
      m(q, "=", VA, "*", M.pow(p, 2)),
      m(q, "=", M.term(p * p, VA)) + " より " + m(VA, "=", M.fracNum(n, d))
    ];
    if (Math.random() < 0.5) {
      return build({
        text: lead + mf("y") + " を " + mf("x") + " の式で表しなさい。",
        explain: lines.concat(["したがって、" + m(qEq(n, d))]),
        meta: { kind: "g3-fn-eq" }
      }, M.choices(qEq(n, d), [qEq(q, p), propEq(q, p), qEq(-n, d), qEq(p * p, q), qEq(q, 1)], function (i) { return qEq(n + (n > 0 ? i + 1 : -i - 1), d); }));
    }
    do { r = st * M.randNZ(-lim, lim); } while (abs(r) === abs(p) || abs(r) > 6);
    var ans = n * r * r / d;
    return build({
      text: lead + m(X, "=", r) + " のときの " + mf("y") + " の値を求めなさい。",
      explain: lines.concat([
        "式は " + m(qEq(n, d)) + " です。" + m(X, "=", r) + " を代入します。",
        m(Y, "=", M.fracNum(n, d), "*", M.pow(r, 2), "=", ans)
      ]),
      meta: { kind: "g3-fn-value" }
    }, M.numChoices(ans, [q / p * r, -ans, n * r / d, q + (r - p), ans + q, 2 * ans], { fmt: yeq }));
  }

  // 変域
  function genFnRange() {
    var a = M.pick(QA), n = a[0], d = a[1], st = stepOf(d), type = M.pick(["straddle", "straddle", "straddle", "pos", "neg"]);
    var p, q, ok;
    do {
      p = st * M.rand(-4, 4); q = st * M.rand(-4, 4);
      ok = p < q && abs(p) <= 6 && abs(q) <= 6 && abs(p) !== abs(q) && abs(n * Math.max(p * p, q * q) / d) <= 60;
      if (type === "straddle") ok = ok && p < 0 && q > 0;
      else if (type === "pos") ok = ok && p > 0;
      else ok = ok && q < 0;
    } while (!ok);
    var yp = n * p * p / d, yq = n * q * q / d, e1 = Math.min(yp, yq), e2 = Math.max(yp, yq);
    var straddle = p < 0 && q > 0, lo = e1, hi = e2, far = abs(p) > abs(q) ? p : q, lines;
    var coef = M.fracNum(n, d);
    if (straddle) {
      if (n > 0) lo = 0; else hi = 0;
      lines = [
        mf("x") + " の変域に 0 がふくまれるので、" + mf("y") + " の" + (n > 0 ? "最小値" : "最大値") + "は " + mf("x = 0") + " のときの " + mf("y = 0") + " です。",
        "0 から最も遠い " + m(X, "=", far) + " のとき、" + mf("y") + " は" + (n > 0 ? "最大" : "最小") + "になります。" + m(Y, "=", coef, "*", M.pow(far, 2), "=", n * far * far / d),
        "したがって、" + m(rangeY(lo, hi)) + "(両端の値だけを代入した " + m(rangeY(e1, e2)) + " はまちがい)"
      ];
    } else {
      lines = [
        mf("x") + " の変域に 0 がふくまれないので、両端の値を代入します。",
        m(X, "=", p) + " のとき " + m(Y, "=", coef, "*", M.pow(p, 2), "=", yp),
        m(X, "=", q) + " のとき " + m(Y, "=", coef, "*", M.pow(q, 2), "=", yq),
        "小さいほうを左に書いて、" + m(rangeY(lo, hi))
      ];
    }
    var wrongs = straddle
      ? [rangeY(e1, e2), n > 0 ? rangeY(0, e1) : rangeY(e2, 0), rangeY(-hi, -lo)]
      : [n > 0 ? rangeY(0, e2) : rangeY(e1, 0), rangeY(-hi, -lo), n > 0 ? rangeY(0, e1) : rangeY(e2, 0)];
    if ((n * p) % d === 0 && (n * q) % d === 0) wrongs.push(rangeY(Math.min(n * p / d, n * q / d), Math.max(n * p / d, n * q / d)));
    return build({
      text: "下の関数について、" + mf("x") + " の変域が " + m(p, "<=", X, "<=", q) + " のとき、" + mf("y") + " の変域を求めなさい。",
      math: m(qEq(n, d)),
      explain: lines,
      choiceLayout: "stack",
      meta: { kind: "g3-fn-range" }
    }, M.choices(rangeY(lo, hi), wrongs, function (i) { return rangeY(lo - i - 1, hi + (i % 2)); }));
  }

  // 変化の割合
  function genFnRate() {
    var a = M.pick(QA), n = a[0], d = a[1], st = stepOf(d), p, q;
    do {
      p = st * M.rand(-4, 4); q = st * M.rand(-4, 4);
    } while (p >= q || abs(p) > 6 || abs(q) > 6 || p + q === 0 || (n * (p + q)) % d !== 0);
    var yp = n * p * p / d, yq = n * q * q / d, ans = n * (p + q) / d;
    return build({
      text: "下の関数について、" + mf("x") + " の値が " + m(p) + " から " + m(q) + " まで増加するときの変化の割合を求めなさい。",
      math: m(qEq(n, d)),
      explain: [
        "変化の割合 = (" + mf("y") + " の増加量)÷(" + mf("x") + " の増加量)です。",
        m(X, "=", p) + " のとき " + m(Y, "=", yp) + "、" + m(X, "=", q) + " のとき " + m(Y, "=", yq),
        m(M.frac(M.join(yq, "-", yp), M.join(q, "-", p)), "=", M.frac(yq - yp, q - p), "=", ans),
        mf("y = ax^2") + " では、" + mf("a(p + q)") + " でも求められます。" + m(M.fracNum(n, d), "*", par(M.join(p, "+", q)), "=", ans)
      ],
      meta: { kind: "g3-fn-rate" }
    }, M.numChoices(ans, [n * (q - p) / d, yq - yp, -ans, yq + yp, 2 * ans, n * q / d]));
  }

  // グラフから式を求める(図つき)
  var GRAPH_POINTS = (function () {
    var out = [];
    QA.concat([[3, 4], [-3, 4]]).forEach(function (a) {
      for (var x = -5; x <= 5; x++) {
        if (x === 0) continue;
        var y = a[0] * x * x / a[1];
        if (y === Math.floor(y) && abs(y) <= 5) out.push([a[0], a[1], x, y]);
      }
    });
    return out;
  })();
  function genFnGraph() {
    var g = M.pick(GRAPH_POINTS), n = g[0], d = g[1], px = g[2], py = g[3];
    return build({
      text: "図の放物線は、" + mf("y") + " が " + mf("x") + " の2乗に比例する関数のグラフです。" + mf("y") + " を " + mf("x") + " の式で表しなさい(1目もりは 1)。",
      figure: M.plane({
        range: 5,
        label: "座標平面にかかれた、原点を頂点とし点 " + M.text(M.coord(px, py)) + " を通る放物線",
        items: [{ type: "parabola", a: n / d }, { type: "point", x: px, y: py }]
      }),
      explain: [
        "グラフは点 " + m(M.coord(px, py)) + " を通ります。" + mf("y = ax^2") + " に代入します。",
        m(py, "=", VA, "*", M.pow(px, 2)),
        m(py, "=", M.term(px * px, VA)) + " より " + m(VA, "=", M.fracNum(n, d)),
        "したがって、" + m(qEq(n, d)) + "(" + (n > 0 ? "上" : "下") + "に開いているので、" + mf(n > 0 ? "a > 0" : "a < 0") + ")"
      ],
      meta: { kind: "g3-graph-parabola" }
    }, M.choices(qEq(n, d), [qEq(-n, d), qEq(py, px), propEq(py, px), qEq(d, n), qEq(-py, px)], function (i) { return qEq(n + (n > 0 ? i + 1 : -i - 1), d); }));
  }

  // 放物線上の2点を通る直線
  function genFnLine() {
    var a = M.pick([[1, 1], [-1, 1], [2, 1], [-2, 1], [1, 2], [-1, 2]]), n = a[0], d = a[1], st = stepOf(d), p, q;
    do { p = -st * M.rand(1, 4 / st); q = st * M.rand(1, 4 / st); } while (p + q === 0);
    var yp = n * p * p / d, yq = n * q * q / d, sl = n * (p + q) / d, ic = -n * p * q / d, VB = v("b");
    return build({
      text: "下の関数のグラフ上に2点 A、B があり、" + mf("x") + " 座標はそれぞれ " + m(p) + "、" + m(q) + " です。直線 AB の式を求めなさい。",
      math: m(qEq(n, d)),
      explain: [
        "2点の座標を求めます。A" + m(M.coord(p, yp)) + "、B" + m(M.coord(q, yq)),
        "直線の傾きは " + m(M.frac(M.join(yq, "-", yp), M.join(q, "-", p)), "=", M.frac(yq - yp, q - p), "=", sl),
        m(lineEq(sl, 0) + M.op("+") + VB) + " に B の座標を代入して、" + m(yq, "=", sl, "*", q, "+", VB) + " より " + m(VB, "=", ic),
        "したがって、" + m(lineEq(sl, ic))
      ],
      choiceLayout: "stack",
      meta: { kind: "g3-fn-line" }
    }, M.choices(lineEq(sl, ic), [lineEq(-sl, ic), lineEq(sl, -ic), lineEq(n * (q - p) / d, ic), lineEq(sl, yp), lineEq(ic, sl), lineEq(-sl, -ic)], function (i) {
      return lineEq(sl, ic + i + 1);
    }));
  }

  var fnWhichFig = M.plane({
    range: 5,
    label: "座標平面にかかれた4つの放物線。アは上に開いて開き方が小さい。イは上に開いて開き方が大きい。ウは下に開いて開き方が小さい。エは下に開いて開き方が大きい",
    items: [
      { type: "parabola", a: 2 }, { type: "parabola", a: 0.5 }, { type: "parabola", a: -1 }, { type: "parabola", a: -0.25 },
      { type: "label", x: 1.65, y: 5.25, text: "ア" }, { type: "label", x: 3.3, y: 5.25, text: "イ" },
      { type: "label", x: 2.3, y: -5.75, text: "ウ" }, { type: "label", x: 4.55, y: -5.75, text: "エ" }
    ]
  });
  function fnLineFig(withTriangle) {
    var items = [];
    if (withTriangle) items.push({ type: "polygon", points: [[0, 0], [-2, 1], [4, 4]], cls: "fig-fill" });
    items.push({ type: "parabola", a: 0.25 }, // 直線は x 軸の目もりの数字「−5」の手前で止める(点線が数字に重ならないように)
      { type: "line", a: 0.5, b: 2, domain: [-4.3, 5], cls: "fig-line-2" });
    if (withTriangle) items.push({ type: "segment", x1: 0, y1: 0, x2: -2, y2: 1, cls: "fig-shape" }, { type: "segment", x1: 0, y1: 0, x2: 4, y2: 4, cls: "fig-shape" });
    items.push({ type: "point", x: -2, y: 1, label: "A", dx: -5, dy: -19, anchor: "end" }, { type: "point", x: 4, y: 4, label: "B", dx: 4, dy: 16 });
    return M.plane({
      range: 5,
      label: "座標平面にかかれた放物線と直線。2点 A(−2, 1)、B(4, 4) で交わる。直線は y 軸と (0, 2) で交わる" + (withTriangle ? "。三角形 OAB に色がついている" : ""),
      items: items
    });
  }
  var fnLead = "図で、放物線は関数 " + mf("y = {1/4}x^2") + " のグラフで、直線(点線)と2点 A、B で交わっています。A、B の " + mf("x") + " 座標は、それぞれ " + mf("-2") + "、" + mf("4") + " です。";

  var fnFixed = [
    {
      id: "which-graph",
      text: "図のア〜エは、" + mf("y = 2x^2") + "、" + mf("y = {1/2}x^2") + "、" + mf("y = -x^2") + "、" + mf("y = -{1/4}x^2") + " のグラフのどれかです。" + mf("y = {1/2}x^2") + " のグラフはどれですか。",
      figure: fnWhichFig,
      choices: ["イ", "ア", "ウ", "エ"],
      answer: 0,
      explain: [
        mf("y = ax^2") + " のグラフは、" + mf("a > 0") + " のとき上に開き、" + mf("a < 0") + " のとき下に開きます。上に開いているのはアとイです。",
        mf("a") + " の絶対値が大きいほど、グラフの開き方は小さくなります。",
        mf("{1/2} < 2") + " なので、開き方が大きいイが " + mf("y = {1/2}x^2") + " のグラフです。"
      ]
    },
    {
      id: "statement",
      text: "関数 " + mf("y = -2x^2") + " について、正しいものはどれですか。",
      textChoices: true,
      choices: [
        mf("x > 0") + " の範囲では、" + mf("x") + " の値が増加すると " + mf("y") + " の値は減少する",
        "グラフは上に開いた放物線である",
        mf("y") + " の値は、" + mf("x = 0") + " のとき最小になる",
        "グラフは " + mf("x") + " 軸について対称である"
      ],
      answer: 0,
      explain: [
        mf("a = -2 < 0") + " なので、グラフは下に開いた放物線で、" + mf("y") + " 軸について対称です。",
        mf("x = 0") + " のとき " + mf("y") + " は最大値 0 をとります。",
        mf("x > 0") + " の範囲では、" + mf("x") + " が増加すると " + mf("y") + " は減少します(" + mf("x < 0") + " の範囲では増加します)。"
      ]
    },
    {
      id: "line-through",
      text: fnLead + "直線 AB の式を求めなさい。",
      figure: fnLineFig(false),
      choices: [f("y = {1/2}x + 2"), f("y = 2x + 2"), f("y = {1/2}x - 2"), f("y = {1/2}x + 4")],
      answer: 0,
      choiceLayout: "stack",
      explain: [
        "A の " + mf("y") + " 座標は " + mf("{1/4} * (-2)^2 = 1") + "、B の " + mf("y") + " 座標は " + mf("{1/4} * 4^2 = 4") + " です。",
        "A" + mf("(-2, 1)") + "、B" + mf("(4, 4)") + " を通る直線の傾きは " + mf("{4 - 1/4 - (-2)} = {3/6} = {1/2}"),
        mf("y = {1/2}x + b") + " に B の座標を代入して、" + mf("4 = 2 + b") + " より " + mf("b = 2"),
        "したがって、" + mf("y = {1/2}x + 2")
      ]
    },
    {
      id: "triangle-area",
      text: fnLead + "直線 AB の式は " + mf("y = {1/2}x + 2") + " です。△OAB の面積を求めなさい(座標の1目もりを 1 cm とする)。",
      figure: fnLineFig(true),
      choices: [f("6" + "' cm'^2"), f("12" + "' cm'^2"), f("4" + "' cm'^2"), f("8" + "' cm'^2")],
      answer: 0,
      explain: [
        "直線 AB と " + mf("y") + " 軸の交点を C とすると、切片が 2 なので C" + mf("(0, 2)") + "、OC = 2 cm です。",
        "△OAB を、OC を底辺とする2つの三角形 △OAC と △OBC に分けます。高さは、A、B の " + mf("x") + " 座標の絶対値 2 と 4 です。",
        mf("{1/2} * 2 * 2 + {1/2} * 2 * 4 = 2 + 4 = 6") + "(cm<sup>2</sup>)"
      ]
    },
    {
      id: "falling",
      text: "物を落とすとき、落ち始めてから " + mf("x") + " 秒間に落ちる距離を " + mf("y") + " m とすると、" + mf("y = 5x^2") + " の関係があります。落ち始めて 1 秒後から 3 秒後までの平均の速さを求めなさい。",
      choices: ["秒速 20 m", "秒速 15 m", "秒速 40 m", "秒速 10 m"],
      answer: 0,
      explain: [
        "平均の速さ = 進んだ距離 ÷ かかった時間 で、変化の割合と同じ計算です。",
        mf("x = 1") + " のとき " + mf("y = 5 * 1^2 = 5") + "、" + mf("x = 3") + " のとき " + mf("y = 5 * 3^2 = 45"),
        mf("{45 - 5/3 - 1} = {40/2} = 20") + "(m/秒)"
      ]
    },
    {
      id: "find-a-range",
      text: "関数 " + mf("y = ax^2") + " で、" + mf("x") + " の変域が " + mf("-2 <= x <= 4") + " のとき、" + mf("y") + " の変域は " + mf("0 <= y <= 8") + " です。" + mf("a") + " の値を求めなさい。",
      choices: [f("a = {1/2}"), f("a = 2"), f("a = -{1/2}"), f("a = {1/4}")],
      answer: 0,
      explain: [
        mf("y") + " の変域が 0 以上なので " + mf("a > 0") + " です。" + mf("y") + " が最大になるのは、0 から最も遠い " + mf("x = 4") + " のときです。",
        mf("x = 4") + "、" + mf("y = 8") + " を代入して、" + mf("8 = a * 4^2"),
        mf("16a = 8") + " より " + mf("a = {1/2}") + "(" + mf("x = -2") + " を使うと " + mf("a = 2") + " となり、まちがい)"
      ]
    },
    {
      id: "braking",
      text: "自動車がブレーキをかけてから止まるまでに進む距離(制動距離)は、速さの2乗に比例します。時速 40 km のときの制動距離が 8 m である自動車は、時速 80 km のとき、制動距離は何 m になりますか。",
      choices: ["32 m", "16 m", "24 m", "64 m"],
      answer: 0,
      explain: [
        "速さを時速 " + mf("x") + " km、制動距離を " + mf("y") + " m とすると、" + mf("y = ax^2") + " と表せます。",
        "2乗に比例するので、" + mf("x") + " が 2 倍になると " + mf("y") + " は " + mf("2^2 = 4") + " 倍になります。",
        mf("8 * 4 = 32") + "(m)"
      ]
    }
  ];

  JHM.register("g3-quadratic-functions", {
    points: [
      mf("y") + " が " + mf("x") + " の関数で " + M.rule(mf("y = ax^2")) + "(" + mf("a") + " は 0 でない定数)と表せるとき、" + mf("y") + " は " + mf("x") + " の<b>2乗に比例する</b>といいます。" + mf("x") + " が 2 倍、3 倍になると、" + mf("y") + " は 4 倍、9 倍になります。",
      "<b>グラフ</b>は原点を頂点とし、" + mf("y") + " 軸について対称な<b>放物線</b>。" + mf("a > 0") + " なら上に開き、" + mf("a < 0") + " なら下に開きます。" + mf("a") + " の絶対値が大きいほど、開き方は小さくなります。",
      "<b>変域</b>: " + mf("x") + " の変域に 0 がふくまれるとき、" + mf("y") + " の最小値(" + mf("a < 0") + " なら最大値)は 0 です。両端の値だけで決めないこと。",
      "<b>変化の割合</b>は一定ではありません。" + M.rule(mf("{y ' の増加量'/x ' の増加量'}")) + " で求めます。" + mf("x") + " が " + mf("p") + " から " + mf("q") + " まで増加するときは " + M.rule(mf("a(p + q)")) + "。",
      "<b>放物線と直線</b>: 交点の座標は、両方の式を成り立たせます。2点の座標から、直線の傾きと切片を求めます。"
    ],
    example: {
      title: "関数 " + mf("y = {1/2}x^2") + " で、" + mf("x") + " の変域が " + mf("-4 <= x <= 2") + " のときの " + mf("y") + " の変域を求めなさい。",
      steps: [
        mf("x") + " の変域に 0 がふくまれるので、最小値は " + mf("y = 0"),
        mf("x = -4") + " のとき " + mf("y = {1/2} * (-4)^2 = 8") + "(最大)",
        mf("x = 2") + " のとき " + mf("y = {1/2} * 2^2 = 2")
      ],
      result: mf("0 <= y <= 8")
    },
    figure: {
      html: M.plane({
        range: 5,
        label: "① y = x² のグラフ(上に開いた放物線)、② y = ¼x² のグラフ(上に開いて、開き方が大きい放物線)、③ y = −x² のグラフ(下に開いた放物線)",
        items: [
          { type: "parabola", a: 1 }, { type: "parabola", a: 0.25 }, { type: "parabola", a: -1, cls: "fig-line-2" },
          { type: "label", x: 2.3, y: 5.25, text: "①" }, { type: "label", x: 4.55, y: 5.25, text: "②" }, { type: "label", x: 2.3, y: -5.7, text: "③" }
        ]
      }),
      caption: "① y = x²、② y = ¼x²(a の絶対値が小さいほど、開き方は大きい)、③ y = −x²(点線。a < 0 なので下に開く)。"
    },
    generators: [
      { id: "find-eq", label: "式と値を求める", make: genFnEq },
      { id: "range", label: "変域", make: genFnRange },
      { id: "rate", label: "変化の割合", make: genFnRate },
      { id: "graph-eq", label: "グラフから式を求める", make: genFnGraph },
      { id: "line", label: "放物線上の2点を通る直線", make: genFnLine }
    ],
    fixed: fnFixed
  });

  // =====================================================================
  // 図をかくための道具(相似・円・三平方の定理で使う)
  // =====================================================================
  function lerp(A, B, t) { return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]; }
  function dist(A, B) { return Math.sqrt((A[0] - B[0]) * (A[0] - B[0]) + (A[1] - B[1]) * (A[1] - B[1])); }
  function seg(A, B, cls) { return fig.line(A[0], A[1], B[0], B[1], cls); }
  // pts の中の点を結ぶ。list は "AB CD" のように書く
  function segs(pts, list, cls) {
    return list.split(" ").map(function (g) { return seg(pts[g.charAt(0)], pts[g.charAt(1)], cls); }).join("");
  }
  // 点の名前など。dx, dy は点からのずれ
  function name(Pt, str, dx, dy, anchor) { return fig.text(Pt[0] + dx, Pt[1] + dy, str, anchor || "middle"); }
  // 線分 AB の中点から、垂直な向きに off だけずらした位置に文字を書く(A→B が右向きなら、off > 0 で上側)
  function sideText(A, B, str, off, anchor) {
    var L = dist(A, B), nx = (B[1] - A[1]) / L, ny = -(B[0] - A[0]) / L;
    return fig.text((A[0] + B[0]) / 2 + nx * off, (A[1] + B[1]) / 2 + ny * off + 4.5, str, anchor || "middle");
  }
  // 点 V から見た点 A の向き(度。右が 0°、反時計回り)
  function dirDeg(V, A) { return Math.atan2(V[1] - A[1], A[0] - V[0]) * 180 / Math.PI; }
  // 角の印(弧)。頂点 V、辺の上の点 A, B。str があれば、角の二等分線上の距離 tr の位置に書く
  function angleMark(V, A, B, r, str, tr) {
    var d0 = dirDeg(V, A), d1 = dirDeg(V, B);
    var diff = ((d1 - d0) % 360 + 360) % 360;
    if (diff > 180) { d0 = d1; diff = 360 - diff; }
    var s = fig.arc(V[0], V[1], r, d0, d0 + diff, "fig-axis");
    if (str) {
      var p = fig.polar(V[0], V[1], tr || r + 14, d0 + diff / 2);
      s += fig.text(p[0], p[1] + 4.5, str, "middle");
    }
    return s;
  }
  // 直角の印
  function rightMark(V, A, B, size) {
    size = size || 9;
    var u = lerp(V, A, size / dist(V, A)), w = lerp(V, B, size / dist(V, B));
    return fig.poly([u, [u[0] + w[0] - V[0], u[1] + w[1] - V[1]], w], "fig-axis", false);
  }
  // 長さが等しいことを表す印(n 本の短い線)
  function tick(A, B, n) {
    var L = dist(A, B), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, s = "";
    for (var i = 0; i < n; i++) {
      var o = (i - (n - 1) / 2) * 4;
      s += fig.line(mx + ux * o + uy * 5, my + uy * o - ux * 5, mx + ux * o - uy * 5, my + uy * o + ux * 5, "fig-axis");
    }
    return s;
  }
  // 直線 AB と直線 CD の交点
  function cross(A, B, C, D) {
    var a1 = B[1] - A[1], b1 = A[0] - B[0], c1 = a1 * A[0] + b1 * A[1];
    var a2 = D[1] - C[1], b2 = C[0] - D[0], c2 = a2 * C[0] + b2 * C[1], det = a1 * b2 - a2 * b1;
    return [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det];
  }
  // 底辺 BC が水平な三角形の頂点 A(AB = c、AC = b。長さは画面の単位)
  function apex(B, C, c, b) {
    var a = C[0] - B[0], x = (c * c - b * b + a * a) / (2 * a);
    return [B[0] + x, B[1] - Math.sqrt(c * c - x * x)];
  }
  // 円周上の点。map = { 名前: 角度 }。中心は O
  function circlePts(cx, cy, r, map) {
    var pts = { O: [cx, cy] };
    Object.keys(map).forEach(function (k) { pts[k] = fig.polar(cx, cy, r, map[k]); });
    return pts;
  }
  function circleNames(cx, cy, r, map) {
    return Object.keys(map).map(function (k) {
      var p = fig.polar(cx, cy, r + 12, map[k]);
      return fig.text(p[0], p[1] + 4.5, k, "middle");
    }).join("");
  }
  var XCM = fig.v("x") + " cm", FX = fig.v("x");
  var cm = "' cm'", cm2 = "' cm'^2", cm3 = "' cm'^3";

  // =====================================================================
  // 3-5 相似
  // =====================================================================

  var SIM_SSS = "3組の辺の比がすべて等しい", SIM_SAS = "2組の辺の比とその間の角がそれぞれ等しい", SIM_AA = "2組の角がそれぞれ等しい";
  var CONG_ASA = "1組の辺とその両端の角がそれぞれ等しい";

  // 2組の辺の比とその間の角
  var simSasFig = (function () {
    var u = 12, by = 88, B = [42, by], C = [42 + 6 * u, by], A = fig.polar(B[0], B[1], 4 * u, 50);
    // 2つの三角形の間を広くあける(DE の「6 cm」が AC の長さに見えないように)
    var E = [158, by], F = [158 + 9 * u, by], D = fig.polar(E[0], E[1], 6 * u, 50);
    var s = fig.poly([A, B, C]) + fig.poly([D, E, F]);
    s += name(A, "A", 0, -7) + name(B, "B", -7, 13) + name(C, "C", 6, 13) + name(D, "D", 0, -7) + name(E, "E", -7, 13) + name(F, "F", 6, 13);
    s += angleMark(B, C, A, 14) + fig.text(B[0] + 19, B[1] - 5, "50°", "start") + angleMark(E, F, D, 14) + fig.text(E[0] + 19, E[1] - 5, "50°", "start");
    s += sideText(B, A, "4 cm", 7, "end") + fig.text((B[0] + C[0]) / 2 + 6, by + 16, "6 cm", "middle");
    s += sideText(E, D, "6 cm", 7, "end") + fig.text((E[0] + F[0]) / 2, by + 16, "9 cm", "middle");
    return M.svg(282, by + 24, "三角形 ABC と三角形 DEF。AB = 4 cm、BC = 6 cm、角 B = 50°。DE = 6 cm、EF = 9 cm、角 E = 50°", s);
  })();
  // 相似な2つの三角形(辺の長さ)
  var simSideFig = (function () {
    var u = 9, by = 100, B = [34, by], C = [34 + 8 * u, by], A = apex(B, C, 6 * u, 7 * u);
    var E = [132, by], F = [132 + 12 * u, by], D = apex(E, F, 9 * u, 10.5 * u);
    var s = fig.poly([A, B, C]) + fig.poly([D, E, F]);
    s += name(A, "A", 0, -7) + name(B, "B", -7, 13) + name(C, "C", 6, 13) + name(D, "D", 0, -7) + name(E, "E", -7, 13) + name(F, "F", 6, 13);
    s += sideText(B, A, "6 cm", 7, "end") + fig.text((B[0] + C[0]) / 2, by + 16, "8 cm", "middle");
    s += sideText(E, D, "9 cm", 7, "end") + fig.text((E[0] + F[0]) / 2, by + 16, XCM, "middle");
    return M.svg(260, by + 24, "相似な三角形 ABC と三角形 DEF。AB = 6 cm、BC = 8 cm、DE = 9 cm、EF = x cm", s);
  })();
  // 三角形と平行線(DE ∥ BC)。nums が true なら長さを書く
  function simParFig(nums) {
    var u = 16, B = [34, 160], C = [34 + 12 * u, 160], A = apex(B, C, 9 * u, 10.5 * u);
    var D = lerp(A, B, 2 / 3), E = lerp(A, C, 2 / 3);
    var s = fig.poly([A, B, C]) + seg(D, E, "fig-line");
    s += name(A, "A", 0, -7) + name(B, "B", -8, 6, "end") + name(C, "C", 8, 6, "start") + name(E, "E", 8, 4, "start");
    if (nums) {
      s += name(D, "D", 9, 15, "start");
      s += sideText(D, A, "6 cm", 7, "end") + sideText(B, D, "3 cm", 7, "end") + fig.text((D[0] + E[0]) / 2 + 8, D[1] - 7, "8 cm", "middle") + fig.text((B[0] + C[0]) / 2, 176, XCM, "middle");
    } else {
      s += name(D, "D", -8, 4, "end");
    }
    return M.svg(260, 184, nums
      ? "三角形 ABC。辺 AB 上に点 D、辺 AC 上に点 E があり、DE と BC は平行。AD = 6 cm、DB = 3 cm、DE = 8 cm、BC = x cm"
      : "三角形 ABC。辺 AB 上に点 D、辺 AC 上に点 E があり、DE と BC は平行", s);
  }
  // 平行な3直線と2直線
  var simLinesFig = (function () {
    var A = [64, 30], C = [36, 126], B = lerp(A, C, 0.4), D = [118, 30], F = [233.3, 126], E = lerp(D, F, 0.4);
    var s = "";
    [[30, "ℓ"], [68.4, "m"], [126, "n"]].forEach(function (l) {
      s += fig.line(8, l[0], 252, l[0], "fig-shape") + fig.text(14, l[0] - 6, fig.v(l[1]), "middle");
    });
    s += seg(lerp(A, C, -0.14), lerp(A, C, 1.14), "fig-line") + seg(lerp(D, F, -0.14), lerp(D, F, 1.14), "fig-line");
    s += name(A, "A", 7, -5, "start") + name(B, "B", 7, -5, "start") + name(C, "C", 7, -5, "start");
    s += name(D, "D", 7, -5, "start") + name(E, "E", 7, -5, "start") + name(F, "F", 5, -6, "start");
    s += sideText(B, A, "4 cm", 6, "end") + sideText(C, B, "6 cm", 6, "end");
    s += sideText(E, D, "6 cm", -8, "start") + sideText(F, E, XCM, -8, "start");
    return M.svg(260, 148, "平行な3直線 ℓ、m、n に2直線が交わっている。1本目の直線との交点は上から A、B、C で、AB = 4 cm、BC = 6 cm。2本目の直線との交点は上から D、E、F で、DE = 6 cm、EF = x cm", s);
  })();
  // 中点連結定理
  var simMidFig = (function () {
    var A = [120, 24], B = [36, 150], C = [228, 150], Mp = lerp(A, B, 0.5), N = lerp(A, C, 0.5);
    var s = fig.poly([A, B, C]) + seg(Mp, N, "fig-line");
    s += tick(A, Mp, 1) + tick(Mp, B, 1) + tick(A, N, 2) + tick(N, C, 2);
    s += name(A, "A", 0, -7) + name(B, "B", -8, 6, "end") + name(C, "C", 8, 6, "start") + name(Mp, "M", -9, 4, "end") + name(N, "N", 9, 4, "start");
    s += fig.text(132, 166, "14 cm", "middle") + fig.text((Mp[0] + N[0]) / 2, Mp[1] - 7, XCM, "middle");
    return M.svg(260, 174, "三角形 ABC。M は辺 AB の中点、N は辺 AC の中点。BC = 14 cm、MN = x cm", s);
  })();
  // AB ∥ CD で、AD と BC が O で交わる
  var simCrossFig = (function () {
    var A = [110, 30], B = [194, 30], O = [138.8, 78], D = [182, 150], C = [56, 150];
    var s = seg(A, B) + seg(C, D) + seg(A, D) + seg(B, C);
    s += name(A, "A", -8, 4, "end") + name(B, "B", 8, 4, "start") + name(C, "C", -8, 6, "end") + name(D, "D", 8, 6, "start") + name(O, "O", 12, 4, "start");
    s += fig.text(152, 22, "6 cm", "middle") + fig.text(119, 166, "9 cm", "middle");
    s += sideText(O, A, "4 cm", 7, "end") + sideText(D, O, XCM, -7, "start");
    return M.svg(260, 174, "線分 AB と CD は平行。線分 AD と BC が点 O で交わる。AB = 6 cm、CD = 9 cm、AO = 4 cm、OD = x cm", s);
  })();
  // ∠ABC = ∠AED
  var simAaFig = (function () {
    var A = [110, 22], B = [30, 150], C = [230, 150];
    var E = lerp(A, C, 0.4313), D = lerp(A, B, 0.5796);
    var s = fig.poly([A, B, C]) + seg(D, E, "fig-line");
    s += angleMark(B, C, A, 16) + angleMark(E, A, D, 16);
    s += name(A, "A", 0, -7) + name(B, "B", -8, 6, "end") + name(C, "C", 8, 6, "start") + name(D, "D", -8, 4, "end") + name(E, "E", 9, 2, "start");
    return M.svg(260, 166, "三角形 ABC。辺 AB 上に点 D、辺 AC 上に点 E がある。角 ABC と角 AED に、等しいことを表す印がついている", s);
  })();

  var simFixed = [
    {
      id: "condition-sas",
      text: "図の △ABC と △DEF は相似です。このときに使う相似条件はどれですか。",
      figure: simSasFig,
      textChoices: true,
      choices: [SIM_SAS, SIM_SSS, SIM_AA, CONG_ASA],
      answer: 0,
      explain: [
        "わかっている辺の比を調べます。" + mf("AB : DE = 4 : 6 = 2 : 3") + "、" + mf("BC : EF = 6 : 9 = 2 : 3"),
        "その間の角は " + mf("∠B = ∠E = 50°") + " で等しくなっています。",
        "したがって、「" + SIM_SAS + "」が使えます。"
      ]
    },
    {
      id: "side-length",
      text: "図で、" + mf("△ABC ∽ △DEF") + " のとき、" + mf("x") + " の値を求めなさい。",
      figure: simSideFig,
      choices: ["12", "11", f("{16/3}"), "13.5"],
      answer: 0,
      explain: [
        "相似な図形では、対応する辺の比はすべて等しくなります。",
        mf("AB : DE = BC : EF") + " より " + mf("6 : 9 = 8 : x"),
        mf("6x = 72") + " なので " + mf("x = 12")
      ]
    },
    {
      id: "parallel-triangle",
      text: "図で、" + mf("DE ∥ BC") + " のとき、" + mf("x") + " の値を求めなさい。",
      figure: simParFig(true),
      choices: ["12", "4", "16", "11"],
      answer: 0,
      explain: [
        mf("DE ∥ BC") + " ならば " + mf("AD : AB = DE : BC") + " です(" + mf("AD : DB") + " ではないことに注意)。",
        mf("AB = 6 + 3 = 9") + "(cm)なので、" + mf("6 : 9 = 8 : x"),
        mf("6x = 72") + " より " + mf("x = 12")
      ]
    },
    {
      id: "parallel-lines",
      text: "図で、3直線 " + mf("\\ℓ") + "、" + mf("m") + "、" + mf("n") + " が平行のとき、" + mf("x") + " の値を求めなさい。",
      figure: simLinesFig,
      choices: ["9", "4", "8", "10"],
      answer: 0,
      explain: [
        "平行な3直線に2直線が交わるとき、切り取られる線分の比は等しくなります。",
        mf("AB : BC = DE : EF") + " より " + mf("4 : 6 = 6 : x"),
        mf("4x = 36") + " なので " + mf("x = 9")
      ]
    },
    {
      id: "midpoint",
      text: "図で、点 M、N はそれぞれ辺 AB、AC の中点です。" + mf("x") + " の値を求めなさい。",
      figure: simMidFig,
      choices: ["7", "14", "28", "3.5"],
      answer: 0,
      explain: [
        "中点連結定理: 三角形の2辺の中点を結ぶ線分は、残りの辺に平行で、長さはその半分です。",
        mf("MN ∥ BC") + "、" + mf("MN = {1/2}BC"),
        mf("x = {1/2} * 14 = 7")
      ]
    },
    {
      id: "crossing",
      text: "図で、" + mf("AB ∥ CD") + " のとき、" + mf("x") + " の値を求めなさい。",
      figure: simCrossFig,
      choices: ["6", f("{8/3}"), "7", "13.5"],
      answer: 0,
      explain: [
        mf("AB ∥ CD") + " より錯角が等しいので、" + mf("△OAB ∽ △ODC") + " です(2組の角がそれぞれ等しい)。",
        mf("AO : DO = AB : DC") + " より " + mf("4 : x = 6 : 9"),
        mf("6x = 36") + " なので " + mf("x = 6")
      ]
    },
    {
      id: "condition-aa",
      text: "図で、" + mf("∠ABC = ∠AED") + " です。" + mf("△ABC ∽ △AED") + " を証明するときに使う相似条件はどれですか。",
      figure: simAaFig,
      textChoices: true,
      choices: [SIM_AA, SIM_SAS, SIM_SSS, "2組の辺とその間の角がそれぞれ等しい"],
      answer: 0,
      explain: [
        "△ABC と △AED で、仮定から " + mf("∠ABC = ∠AED"),
        "共通な角だから " + mf("∠BAC = ∠EAD"),
        "したがって、「" + SIM_AA + "」が使えます。"
      ]
    },
    {
      id: "area-ratio",
      text: mf("△ABC ∽ △DEF") + " で、相似比は " + mf("2 : 3") + " です。△ABC の面積が " + mf("20" + cm2) + " のとき、△DEF の面積を求めなさい。",
      choices: [f("45" + cm2), f("30" + cm2), f("{135/2}" + cm2), f("{80/9}" + cm2)],
      answer: 0,
      explain: [
        "相似比が " + mf("m : n") + " の図形の面積比は " + mf("m^2 : n^2") + " です。",
        "面積比は " + mf("2^2 : 3^2 = 4 : 9") + " なので、" + mf("4 : 9 = 20 : x"),
        mf("4x = 180") + " より " + mf("x = 45") + "(cm<sup>2</sup>)"
      ]
    },
    {
      id: "volume-ratio",
      text: "相似な2つの円錐 P、Q があり、相似比は " + mf("2 : 3") + " です。P の体積が " + mf("16π" + cm3) + " のとき、Q の体積を求めなさい。",
      choices: [f("54π" + cm3), f("24π" + cm3), f("36π" + cm3), f("48π" + cm3)],
      answer: 0,
      explain: [
        "相似比が " + mf("m : n") + " の立体の体積比は " + mf("m^3 : n^3") + " です(表面積の比は " + mf("m^2 : n^2") + ")。",
        "体積比は " + mf("2^3 : 3^3 = 8 : 27") + " なので、" + mf("8 : 27 = 16π : x"),
        mf("x = 16π * {27/8} = 54π") + "(cm<sup>3</sup>)"
      ]
    },
    {
      id: "shadow",
      text: "長さ 1 m の棒を地面に垂直に立てると、影の長さは 1.5 m でした。同じ時刻に、木の影の長さは 9 m でした。木の高さを求めなさい。",
      choices: ["6 m", "13.5 m", "8.5 m", "7.5 m"],
      answer: 0,
      explain: [
        "同じ時刻には太陽の光の角度が同じなので、棒とその影、木とその影がつくる直角三角形は相似です。",
        "木の高さを " + mf("x") + " m とすると、" + mf("1 : 1.5 = x : 9"),
        mf("1.5x = 9") + " より " + mf("x = 6") + "(m)"
      ]
    },
    {
      id: "ratio-from-area",
      text: "相似な2つの図形 F、G があり、面積比は " + mf("9 : 25") + " です。F と G の周の長さの比を求めなさい。",
      choices: [f("3 : 5"), f("9 : 25"), f("27 : 125"), f("81 : 625")],
      answer: 0,
      explain: [
        "面積比は相似比の2乗なので、" + mf("9 : 25 = 3^2 : 5^2") + " より、相似比は " + mf("3 : 5") + " です。",
        "周の長さの比は、相似比と等しくなります。",
        "したがって、" + mf("3 : 5")
      ]
    }
  ];

  JHM.register("g3-similarity", {
    points: [
      "形を変えずに、一定の割合で拡大・縮小した図形を<b>相似</b>な図形といいます(記号 ∽)。対応する辺の比(<b>相似比</b>)はすべて等しく、対応する角はそれぞれ等しくなります。",
      "<b>三角形の相似条件</b>: ① " + SIM_SSS + " ② " + SIM_SAS + " ③ " + SIM_AA,
      "<b>平行線と線分の比</b>: △ABC で " + mf("DE ∥ BC") + " ならば " + M.rule(mf("AD : AB = AE : AC = DE : BC")) + "、" + M.rule(mf("AD : DB = AE : EC")),
      "<b>中点連結定理</b>: 2辺の中点 M、N を結ぶと " + M.rule(mf("MN ∥ BC")) + "、" + M.rule(mf("MN = {1/2}BC")),
      "相似比が " + mf("m : n") + " のとき、<b>面積比</b>は " + M.rule(mf("m^2 : n^2")) + "、<b>体積比</b>は " + M.rule(mf("m^3 : n^3"))
    ],
    example: {
      title: "△ABC で、辺 AB、AC 上に点 D、E があり、" + mf("DE ∥ BC") + "、" + mf("AD = 4" + cm) + "、" + mf("DB = 6" + cm) + "、" + mf("BC = 15" + cm) + " です。DE の長さを求めなさい。",
      steps: [
        mf("AB = 4 + 6 = 10") + "(cm)",
        mf("AD : AB = DE : BC") + " より " + mf("4 : 10 = x : 15"),
        mf("10x = 60")
      ],
      result: mf("DE = 6" + cm)
    },
    figure: {
      html: simParFig(false),
      caption: "DE ∥ BC ならば、AD : AB = AE : AC = DE : BC。"
    },
    fixed: simFixed
  });

  // =====================================================================
  // 3-6 円
  // =====================================================================

  var CX = 130, CY = 96, CR = 74;
  function centerDot(pts, dx, dy, anchor) { return fig.dot(pts.O[0], pts.O[1], 2.5) + name(pts.O, "O", dx, dy, anchor); }

  // 円周角と中心角。texts = [中心角の書きこみ, 円周角の書きこみ]
  function circCentralFig(texts, label) {
    var map = { A: 220, B: 320, P: 80 }, p = circlePts(CX, CY, CR, map);
    var s = fig.circle(CX, CY, CR) + segs(p, "OA OB PA PB") + circleNames(CX, CY, CR, map) + centerDot(p, -11, -5);
    s += angleMark(p.O, p.A, p.B, 13, texts[0], 28) + angleMark(p.P, p.A, p.B, 18, texts[1], 33);
    return M.svg(260, 186, label, s);
  }
  // 同じ弧に対する円周角
  var circSameArcFig = (function () {
    var map = { A: 235, B: 305, P: 130, Q: 50 }, p = circlePts(CX, CY, CR, map);
    var s = fig.circle(CX, CY, CR) + segs(p, "PA PB QA QB") + circleNames(CX, CY, CR, map);
    s += angleMark(p.P, p.A, p.B, 22, "35°", 54) + angleMark(p.Q, p.A, p.B, 22, FX, 50);
    return M.svg(260, 186, "円周上に4点 A、B、P、Q がある。P、Q は弧 AB に対して同じ側にあり、角 APB = 35°、角 AQB = x", s);
  })();
  // 直径と円周角
  var circDiameterFig = (function () {
    var map = { A: 180, B: 0, C: 70 }, p = circlePts(CX, CY, CR, map);
    var s = fig.circle(CX, CY, CR) + segs(p, "AB AC BC") + circleNames(CX, CY, CR, map) + centerDot(p, 0, 16);
    s += angleMark(p.A, p.B, p.C, 26, "35°", 46) + angleMark(p.B, p.A, p.C, 16, FX, 29);
    return M.svg(260, 186, "線分 AB を直径とする円 O の周上に点 C がある。角 CAB = 35°、角 ABC = x", s);
  })();
  // 円周角 → 中心角 → 二等辺三角形
  var circIsoFig = (function () {
    var map = { A: 205, B: 335, P: 100 }, p = circlePts(CX, CY, CR, map);
    var s = fig.circle(CX, CY, CR) + segs(p, "PA PB OA OB AB") + circleNames(CX, CY, CR, map) + centerDot(p, 0, -8);
    s += angleMark(p.P, p.A, p.B, 18, "65°", 34) + angleMark(p.A, p.O, p.B, 28, FX, 40);
    return M.svg(260, 186, "円 O の周上に3点 A、B、P がある。角 APB = 65°、角 OAB = x", s);
  })();
  // 円周角の定理の逆(円はかかない)
  var circConverseFig = (function () {
    var A = [50, 150], B = [210, 150], R = 80 / Math.sin(70 * Math.PI / 180), oy = 150 - R * Math.cos(70 * Math.PI / 180);
    var C = fig.polar(130, oy, R, 60), D = fig.polar(130, oy, R, 115);
    var s = fig.poly([A, B, C, D]) + seg(A, C) + seg(B, D);
    s += angleMark(C, A, B, 18, "70°", 33) + angleMark(D, A, B, 18, FX, 31);
    s += name(A, "A", -8, 8, "end") + name(B, "B", 8, 8, "start") + name(C, "C", 8, -4, "start") + name(D, "D", -8, -4, "end");
    return M.svg(260, 172, "四角形 ABCD と対角線 AC、BD。点 C、D は直線 AB について同じ側にある。角 ACB = 70°、角 ADB = x", s);
  })();
  // 円外の点 P からひいた2本の接線。mode: "angle"(角度)か "length"(長さ)
  function circTangentFig(mode) {
    var O = [92, 96], r = 56, P = [92 + r / Math.cos(65 * Math.PI / 180), 96];
    var A = fig.polar(O[0], O[1], r, 65), B = fig.polar(O[0], O[1], r, -65);
    var s = fig.circle(O[0], O[1], r) + seg(lerp(P, A, 1.18), P) + seg(lerp(P, B, 1.18), P) + seg(O, A, "fig-line") + seg(O, B, "fig-line");
    s += rightMark(A, O, P, 8) + rightMark(B, O, P, 8);
    s += fig.dot(O[0], O[1], 2.5) + name(O, "O", -8, 4, "end") + name(P, "P", 9, 4, "start") + name(A, "A", 4, -9, "start") + name(B, "B", 4, 17, "start");
    if (mode === "angle") {
      s += angleMark(P, A, B, 24, "50°", 46) + angleMark(O, A, B, 13, FX, 27);
      return M.svg(260, 190, "円 O の外の点 P から、円に2本の接線をひいた図。接点は A、B。角 APB = 50°、角 AOB = x", s);
    }
    s += sideText(A, P, "8 cm", 9, "start") + sideText(P, B, XCM, 9, "start");
    return M.svg(260, 190, "円 O の外の点 P から、円に2本の接線をひいた図。接点は A、B。PA = 8 cm、PB = x cm", s);
  }
  // 弧の長さと円周角
  var circArcFig = (function () {
    var map = { A: 234, B: 306, P: 90 }, p = circlePts(CX, CY, CR, map);
    var s = fig.circle(CX, CY, CR) + fig.arc(CX, CY, CR, 234, 306, "fig-line") + segs(p, "PA PB") + circleNames(CX, CY, CR, map) + centerDot(p, 0, 16);
    s += angleMark(p.P, p.A, p.B, 22, FX, 37);
    return M.svg(260, 186, "円 O の周上に3点 A、B、P がある。弧 AB(P をふくまないほう)が太くかかれている。角 APB = x", s);
  })();
  // 2つの弦の交点と相似
  var circChordsFig = (function () {
    var map = { A: 160, B: 310, C: 230, D: 40 }, p = circlePts(CX, CY, CR, map);
    p.P = cross(p.A, p.B, p.C, p.D);
    var s = fig.circle(CX, CY, CR) + segs(p, "AB CD") + segs(p, "AC DB", "fig-line") + circleNames(CX, CY, CR, map);
    s += name(p.P, "P", 2, -9);
    return M.svg(260, 186, "円の2つの弦 AB、CD が、円の内部の点 P で交わっている。A と C、D と B も線分で結ばれている", s);
  })();
  // 円周角と三角形の外角
  var circTwoStepFig = (function () {
    var map = { A: 140, D: 50, B: 245, C: 305 }, p = circlePts(CX, CY, CR, map);
    p.E = cross(p.A, p.C, p.B, p.D);
    var s = fig.circle(CX, CY, CR) + segs(p, "AB AC CD BD") + circleNames(CX, CY, CR, map);
    s += angleMark(p.A, p.B, p.C, 26, "30°", 60) + angleMark(p.C, p.A, p.D, 22, "45°", 33) + angleMark(p.E, p.B, p.C, 12, FX, 25);
    s += name(p.E, "E", 0, -9);
    return M.svg(260, 186, "円周上に4点 A、B、C、D がある。弦 AC と BD は点 E で交わる。角 BAC = 30°、角 ACD = 45°、角 BEC = x", s);
  })();

  var circleFixed = [
    {
      id: "central-to-inscribed",
      text: "図で、" + mf("∠x") + " の大きさを求めなさい(点 O は円の中心)。",
      figure: circCentralFig(["100°", FX], "円 O の周上に3点 A、B、P がある。中心角 AOB = 100°、円周角 APB = x"),
      choices: ["50°", "100°", "200°", "80°"],
      answer: 0,
      explain: [
        "円周角の定理: 1つの弧に対する円周角の大きさは、その弧に対する中心角の半分です。",
        mf("∠APB = {1/2}∠AOB"),
        mf("∠x = {1/2} * 100° = 50°")
      ]
    },
    {
      id: "same-arc",
      text: "図で、" + mf("∠x") + " の大きさを求めなさい。",
      figure: circSameArcFig,
      choices: ["35°", "70°", "55°", "17.5°"],
      answer: 0,
      explain: [
        "円周角の定理: 同じ弧に対する円周角の大きさは等しくなります。",
        mf("∠APB") + " と " + mf("∠AQB") + " は、どちらも弧 AB に対する円周角です。",
        mf("∠x = ∠APB = 35°")
      ]
    },
    {
      id: "diameter",
      text: "図で、線分 AB は円 O の直径です。" + mf("∠x") + " の大きさを求めなさい。",
      figure: circDiameterFig,
      choices: ["55°", "35°", "90°", "45°"],
      answer: 0,
      explain: [
        "半円の弧に対する円周角は 90° なので、" + mf("∠ACB = 90°") + " です。",
        "△ABC の内角の和は 180° です。",
        mf("∠x = 180° - 90° - 35° = 55°")
      ]
    },
    {
      id: "isosceles",
      text: "図で、" + mf("∠x") + " の大きさを求めなさい(点 O は円の中心)。",
      figure: circIsoFig,
      choices: ["25°", "65°", "50°", "32.5°"],
      answer: 0,
      explain: [
        "中心角は円周角の 2 倍なので、" + mf("∠AOB = 2 * 65° = 130°"),
        "OA、OB は半径で等しいので、△OAB は二等辺三角形です。底角は等しくなります。",
        mf("∠x = (180° - 130°) / 2 = 25°")
      ]
    },
    {
      id: "converse",
      text: "図で、" + mf("∠ACB = 70°") + " です。4点 A、B、C、D が1つの円周上にあるのは、" + mf("∠x") + "(" + mf("∠ADB") + ")が何度のときですか。",
      figure: circConverseFig,
      choices: ["70°", "110°", "35°", "140°"],
      answer: 0,
      explain: [
        "円周角の定理の逆: 2点 C、D が直線 AB について同じ側にあって、" + mf("∠ACB = ∠ADB") + " ならば、4点 A、B、C、D は1つの円周上にあります。",
        "点 C、D は直線 AB について同じ側にあります。",
        "したがって、" + mf("∠x = ∠ACB = 70°") + " のときです。"
      ]
    },
    {
      id: "tangent-angle",
      text: "図で、PA、PB は円 O の接線で、A、B は接点です。" + mf("∠x") + " の大きさを求めなさい。",
      figure: circTangentFig("angle"),
      choices: ["130°", "50°", "100°", "140°"],
      answer: 0,
      explain: [
        "円の接線は、接点を通る半径に垂直です。" + mf("∠OAP = ∠OBP = 90°"),
        "四角形 OAPB の内角の和は 360° です。",
        mf("∠x = 360° - 90° - 90° - 50° = 130°")
      ]
    },
    {
      id: "tangent-length",
      text: "図で、PA、PB は円 O の接線で、A、B は接点です。" + mf("x") + " の値を求めなさい。",
      figure: circTangentFig("length"),
      choices: ["8", "4", "16", "6"],
      answer: 0,
      explain: [
        "円の外の1点から、その円にひいた2本の接線の長さは等しくなります。",
        "(△OAP と △OBP は、斜辺と他の1辺がそれぞれ等しい直角三角形で、合同です。)",
        mf("PB = PA") + " なので、" + mf("x = 8")
      ]
    },
    {
      id: "arc-ratio",
      text: "図で、太くかいた弧 AB の長さは、円周の " + mf("{1/5}") + " です。" + mf("∠x") + " の大きさを求めなさい(点 O は円の中心)。",
      figure: circArcFig,
      choices: ["36°", "72°", "18°", "144°"],
      answer: 0,
      explain: [
        "弧の長さは中心角に比例します。弧 AB に対する中心角は " + mf("360° * {1/5} = 72°"),
        "円周角は、同じ弧に対する中心角の半分です。",
        mf("∠x = {1/2} * 72° = 36°")
      ]
    },
    {
      id: "chords-similar",
      text: "図で、2つの弦 AB、CD の交点を P とします。" + mf("△PAC ∽ △PDB") + " を証明するときに使う相似条件はどれですか。",
      figure: circChordsFig,
      textChoices: true,
      choices: [SIM_AA, SIM_SAS, SIM_SSS, CONG_ASA],
      answer: 0,
      explain: [
        "弧 BC に対する円周角は等しいので、" + mf("∠PAC = ∠PDB"),
        "対頂角は等しいので、" + mf("∠APC = ∠DPB"),
        "したがって、「" + SIM_AA + "」が使えます。"
      ]
    },
    {
      id: "two-step",
      text: "図で、" + mf("∠x") + "(" + mf("∠BEC") + ")の大きさを求めなさい。",
      figure: circTwoStepFig,
      choices: ["75°", "30°", "45°", "105°"],
      answer: 0,
      explain: [
        "弧 BC に対する円周角は等しいので、" + mf("∠BDC = ∠BAC = 30°"),
        mf("∠x") + " は △ECD の外角で、となり合わない2つの内角の和に等しくなります。",
        mf("∠x = ∠EDC + ∠ECD = 30° + 45° = 75°")
      ]
    }
  ];

  JHM.register("g3-circles", {
    points: [
      "<b>円周角の定理</b>: 1つの弧に対する円周角の大きさは、その弧に対する中心角の半分です。" + M.rule(mf("∠APB = {1/2}∠AOB")) + "。同じ弧に対する円周角の大きさは等しくなります。",
      "<b>直径と円周角</b>: 半円の弧に対する円周角は 90° です。線分 AB が直径ならば " + M.rule(mf("∠APB = 90°")),
      "<b>弧と円周角</b>: 1つの円で、等しい弧に対する円周角は等しく、等しい円周角に対する弧は等しくなります。",
      "<b>円周角の定理の逆</b>: 2点 C、D が直線 AB について同じ側にあって " + M.rule(mf("∠ACB = ∠ADB")) + " ならば、4点 A、B、C、D は1つの円周上にあります。",
      "<b>接線</b>: 円の接線は、接点を通る半径に垂直です。円の外の1点からひいた2本の接線の長さは等しくなります。" + M.rule(mf("PA = PB"))
    ],
    example: {
      title: "円 O の周上に3点 A、B、P があり、" + mf("∠AOB = 140°") + " です。P は、長いほうの弧 AB 上にあります。" + mf("∠APB") + " と " + mf("∠OAB") + " の大きさを求めなさい。",
      steps: [
        "円周角は中心角の半分: " + mf("∠APB = {1/2} * 140° = 70°"),
        "△OAB は " + mf("OA = OB") + " の二等辺三角形",
        mf("∠OAB = (180° - 140°) / 2 = 20°")
      ],
      result: mf("∠APB = 70°") + "、" + mf("∠OAB = 20°")
    },
    figure: {
      html: circCentralFig(["2" + fig.v("a"), fig.v("a")], "円 O の周上に3点 A、B、P がある。弧 AB に対する中心角 AOB は、円周角 APB の 2 倍"),
      caption: "弧 AB に対する円周角 ∠APB(a)は、中心角 ∠AOB(2a)の半分。"
    },
    fixed: circleFixed
  });

  // =====================================================================
  // 3-7 三平方の定理
  // =====================================================================

  // 直角三角形(直角は右下)。a = 横、b = 縦の長さ。la, lb, lc は横・縦・斜辺の書きこみ(null なら書かない)
  function rightTriFig(a, b, la, lb, lc, label) {
    var s = Math.min(170 / a, 100 / b), x0 = (260 - a * s) / 2 - 6;
    var B = [x0, 136], C = [x0 + a * s, 136], A = [C[0], 136 - b * s];
    var g = fig.poly([A, B, C]) + rightMark(C, B, A, 9);
    if (la) g += fig.text((B[0] + C[0]) / 2, 153, la, "middle");
    if (lb) g += fig.text(C[0] + 8, (A[1] + C[1]) / 2 + 4.5, lb, "start");
    if (lc) g += sideText(B, A, lc, 8, "end");
    return M.svg(260, 162, label, g);
  }
  // 三角定規の形。type: 45 か 60。lab = { hyp, a, b }(a は下の辺、b は右の辺)
  function setSquareFig(type, lab, label) {
    var B, C, A, g;
    if (type === 45) { B = [66, 140]; C = [176, 140]; A = [176, 30]; }
    else { B = [36, 140]; C = [192, 140]; A = [192, 50]; }
    g = fig.poly([A, B, C]) + rightMark(C, B, A, 9);
    if (type === 45) {
      g += angleMark(B, C, A, 16) + fig.text(B[0] + 22, B[1] - 6, "45°", "start");
      g += angleMark(A, B, C, 16) + fig.text(A[0] - 5, A[1] + 46, "45°", "end");
    } else {
      g += angleMark(B, C, A, 22) + fig.text(B[0] + 28, B[1] - 5, "30°", "start");
      g += angleMark(A, B, C, 14) + fig.text(A[0] - 5, A[1] + 30, "60°", "end");
    }
    if (lab.a) g += fig.text((B[0] + C[0]) / 2, 157, lab.a, "middle");
    if (lab.b) g += fig.text(C[0] + 8, (A[1] + C[1]) / 2 + 4.5, lab.b, "start");
    if (lab.hyp) g += sideText(B, A, lab.hyp, 8, "end");
    return M.svg(260, 166, label, g);
  }

  // 直角三角形の辺の長さ(図つき)
  function genPythSide() {
    var a, b, c, n, figure, lines, wrongs;
    if (Math.random() < 0.5) {
      do { a = M.rand(1, 9); b = M.rand(1, 9); } while (Math.max(a, b) / Math.min(a, b) > 3);
      n = a * a + b * b;
      figure = rightTriFig(a, b, a + " cm", b + " cm", XCM, "直角三角形。直角をはさむ2辺は " + a + " cm と " + b + " cm、斜辺は x cm");
      lines = [
        "直角三角形では、(斜辺)<sup>2</sup> = (他の2辺の2乗の和)です。斜辺は " + mf("x") + " cm の辺です。",
        m(X2, "=", M.pow(a, 2), "+", M.pow(b, 2), "=", n),
        mf("x > 0") + " なので、" + (sqSplit(n)[0] > 1 ? m(X, "=", M.sqrt(n), "=", root(1, n)) : m(X, "=", root(1, n)))
      ];
      wrongs = [M.num(a + b), a !== b ? root(1, abs(a * a - b * b)) : null, M.num(n), root(1, a + b), root(1, 2 * a * b), root(1, n + 1)];
    } else {
      var other;
      do { c = M.rand(3, 13); a = M.rand(1, c - 1); n = c * c - a * a; other = Math.sqrt(n); } while (a / other > 3 || other / a > 3);
      var label = "直角三角形。斜辺は " + c + " cm、直角をはさむ2辺は " + a + " cm と x cm";
      figure = Math.random() < 0.5 ? rightTriFig(a, other, a + " cm", XCM, c + " cm", label) : rightTriFig(other, a, XCM, a + " cm", c + " cm", label);
      lines = [
        "斜辺は " + c + " cm の辺です。三平方の定理より、",
        m(X2, "+", M.pow(a, 2), "=", M.pow(c, 2)),
        m(X2, "=", M.pow(c, 2), "-", M.pow(a, 2), "=", n),
        mf("x > 0") + " なので、" + (sqSplit(n)[0] > 1 ? m(X, "=", M.sqrt(n), "=", root(1, n)) : m(X, "=", root(1, n)))
      ];
      wrongs = [root(1, c * c + a * a), M.num(c - a), M.num(n), root(1, c - a), root(1, c + a), root(1, n + 1)];
    }
    return build({
      text: "図の直角三角形で、" + mf("x") + " の値を求めなさい。",
      figure: figure,
      explain: lines,
      meta: { kind: "g3-pyth-fig" }
    }, M.choices(xeqs(root(1, n)), wrongs.map(function (w) { return w === null ? null : xeqs(w); }), function (i) { return xeqs(root(1, n + i + 2)); }));
  }

  // 2点間の距離
  function genDistance() {
    var x1, y1, x2, y2, dx, dy;
    do {
      x1 = M.rand(-6, 6); y1 = M.rand(-6, 6); dx = M.randNZ(-7, 7); dy = M.randNZ(-7, 7);
      x2 = x1 + dx; y2 = y1 + dy;
    } while (abs(x2) > 7 || abs(y2) > 7);
    var n = dx * dx + dy * dy, w = abs(dx), h = abs(dy), add = (x1 + x2) * (x1 + x2) + (y1 + y2) * (y1 + y2);
    return build({
      text: "2点 A" + m(M.coord(x1, y1)) + "、B" + m(M.coord(x2, y2)) + " の間の距離を求めなさい。",
      explain: [
        "線分 AB を斜辺とし、他の2辺が座標軸に平行な直角三角形を考えます。",
        "横の長さ " + m(Math.max(x1, x2), "-", Math.min(x1, x2), "=", w) + "、縦の長さ " + m(Math.max(y1, y2), "-", Math.min(y1, y2), "=", h),
        m(M.pow("AB", 2), "=", M.pow(w, 2), "+", M.pow(h, 2), "=", n),
        sqSplit(n)[0] > 1 ? m("AB", "=", M.sqrt(n), "=", root(1, n)) : m("AB", "=", root(1, n))
      ],
      meta: { kind: "g3-distance" }
    }, M.choices(root(1, n), [M.num(w + h), w !== h ? root(1, abs(w * w - h * h)) : null, M.num(n), add > 0 ? root(1, add) : null, root(1, w + h), root(1, n + 1)], function (i) { return root(1, n + i + 2); }));
  }

  // 特別な直角三角形(三角定規の形。図つき)
  function genSpecial() {
    var k, correct, cands, figure, lines, lab = {}, label;
    var S2 = M.sqrt(2), S3 = M.sqrt(3);
    if (Math.random() < 0.4) {
      var ratio45 = "3つの角が 45°、45°、90° の直角三角形の辺の比は " + mf("1 : 1 : √2") + "(斜辺が " + mf("√2") + ")です。";
      if (Math.random() < 0.5) {
        k = M.rand(1, 9);
        lab = { a: k + " cm", hyp: XCM };
        label = "3つの角が 45°、45°、90° の直角三角形。等しい辺 " + k + " cm、斜辺 x cm";
        correct = root(k, 2);
        lines = [ratio45, "斜辺は、等しい辺の " + mf("√2") + " 倍です。", m(X, "=", k, "*", S2, "=", correct)];
      } else {
        k = M.rand(2, 12);
        lab = { hyp: k + " cm", a: XCM };
        label = "3つの角が 45°、45°、90° の直角三角形。斜辺 " + k + " cm、等しい辺 x cm";
        correct = root(k, 2, 2);
        lines = [ratio45, mf("x : " + k + " = 1 : √2") + " より " + m(M.sqrt(2) + X, "=", k), m(X, "=", M.frac(k, S2), "=", correct) + "(分母を有理化)"];
      }
      figure = setSquareFig(45, lab, label);
    } else {
      var ratio60 = "3つの角が 30°、60°、90° の直角三角形の辺の比は " + mf("1 : 2 : √3") + "(最も短い辺 : 斜辺 : 残りの辺)です。";
      var form = M.rand(0, 5);
      // 図では、短い辺が右(縦)、長い辺が下(横)
      if (form === 0) {
        k = 2 * M.rand(1, 6);
        lab = { hyp: k + " cm", b: XCM }; label = "斜辺 " + k + " cm、短い辺 x cm";
        correct = M.num(k / 2);
        lines = [ratio60, "最も短い辺(30° の角に向かい合う辺)は、斜辺の半分です。", m(X, "=", k, "*", M.frac(1, 2), "=", k / 2)];
      } else if (form === 1) {
        k = M.rand(2, 12);
        lab = { hyp: k + " cm", a: XCM }; label = "斜辺 " + k + " cm、長い辺 x cm";
        correct = root(k, 3, 2);
        lines = [ratio60, mf("x : " + k + " = √3 : 2") + " より " + m("2" + X, "=", M.sqrt(3, k)), m(X, "=", correct)];
      } else if (form === 2) {
        k = M.rand(1, 9);
        lab = { b: k + " cm", hyp: XCM }; label = "短い辺 " + k + " cm、斜辺 x cm";
        correct = M.num(2 * k);
        lines = [ratio60, "斜辺は、最も短い辺の 2 倍です。", m(X, "=", k, "*", 2, "=", 2 * k)];
      } else if (form === 3) {
        k = M.rand(1, 9);
        lab = { b: k + " cm", a: XCM }; label = "短い辺 " + k + " cm、長い辺 x cm";
        correct = root(k, 3);
        lines = [ratio60, "残りの辺は、最も短い辺の " + mf("√3") + " 倍です。", m(X, "=", k, "*", S3, "=", correct)];
      } else if (form === 4) {
        k = M.rand(1, 12);
        lab = { a: k + " cm", b: XCM }; label = "長い辺 " + k + " cm、短い辺 x cm";
        correct = root(k, 3, 3);
        lines = [ratio60, mf("x : " + k + " = 1 : √3") + " より " + m(M.sqrt(3) + X, "=", k), m(X, "=", M.frac(k, S3), "=", correct) + "(分母を有理化)"];
      } else {
        k = M.rand(1, 12);
        lab = { a: k + " cm", hyp: XCM }; label = "長い辺 " + k + " cm、斜辺 x cm";
        correct = root(2 * k, 3, 3);
        lines = [ratio60, mf("x : " + k + " = 2 : √3") + " より " + m(M.sqrt(3) + X, "=", 2 * k), m(X, "=", M.frac(2 * k, S3), "=", correct) + "(分母を有理化)"];
      }
      label = "3つの角が 30°、60°、90° の直角三角形。" + label;
      figure = setSquareFig(60, lab, label);
    }
    cands = M.shuffle([root(k, 2), root(k, 3), M.num(2 * k), M.fracNum(k, 2), root(k, 3, 2), root(k, 2, 2), root(k, 3, 3), root(2 * k, 3, 3)]);
    return build({
      text: "図の直角三角形で、" + mf("x") + " の値を求めなさい。",
      figure: figure,
      explain: lines,
      meta: { kind: "g3-special" }
    }, M.choices(xeqs(correct), cands.map(xeqs)));
  }

  // 対角線、立体の中の長さ
  function genDiagonal() {
    var kind = M.pick(["rect", "square", "box", "cube", "cone", "eq"]);
    var a, b, c, n, text, lines, correct, wrongs;
    function fin(nn) { return sqSplit(nn)[0] > 1 ? m(M.sqrt(nn), "=", root(1, nn)) : m(root(1, nn)); }
    if (kind === "rect") {
      do { a = M.rand(1, 9); b = M.rand(1, 9); } while (a === b);
      n = a * a + b * b;
      text = "縦 " + a + " cm、横 " + b + " cm の長方形の対角線の長さを求めなさい。";
      lines = ["対角線は、縦と横を2辺とする直角三角形の斜辺です。", m(M.pow(a, 2), "+", M.pow(b, 2), "=", n), "対角線の長さは " + fin(n) + "(cm)"];
      correct = root(1, n);
      wrongs = [M.num(a + b), M.num(n), root(1, abs(a * a - b * b)), root(1, a + b), root(1, a * b), root(1, n + 1)];
    } else if (kind === "square") {
      a = M.rand(1, 12);
      text = "1辺が " + a + " cm の正方形の対角線の長さを求めなさい。";
      lines = ["正方形を対角線で分けると、3つの角が 45°、45°、90° の直角三角形になります。辺の比は " + mf("1 : 1 : √2") + " です。", m(a, "*", M.sqrt(2), "=", root(a, 2)) + "(cm)"];
      correct = root(a, 2);
      wrongs = [M.num(2 * a), root(a, 3), root(a, 2, 2), M.num(a * a), root(2 * a, 2), root(1, a)];
    } else if (kind === "box") {
      a = M.rand(1, 6); b = M.rand(1, 6); c = M.rand(1, 6);
      n = a * a + b * b + c * c;
      text = "縦 " + a + " cm、横 " + b + " cm、高さ " + c + " cm の直方体の対角線の長さを求めなさい。";
      lines = [
        "直方体の対角線の長さは " + mf("√(a^2 + b^2 + c^2)") + " です(三平方の定理を2回使います)。",
        m(M.pow(a, 2), "+", M.pow(b, 2), "+", M.pow(c, 2), "=", n),
        "対角線の長さは " + fin(n) + "(cm)"
      ];
      correct = root(1, n);
      wrongs = [M.num(a + b + c), M.num(n), root(1, a * a + b * b), root(1, a + b + c), root(1, a * b * c), root(1, n + 1)];
    } else if (kind === "cube") {
      a = M.rand(1, 10);
      text = "1辺が " + a + " cm の立方体の対角線の長さを求めなさい。";
      lines = [
        "底面の対角線は " + m(root(a, 2)) + " cm です。これと高さ " + a + " cm を2辺とする直角三角形の斜辺が、立方体の対角線です。",
        m(M.pow(a, 2), "+", M.pow(a, 2), "+", M.pow(a, 2), "=", 3 * a * a),
        "対角線の長さは " + m(M.sqrt(3 * a * a), "=", root(a, 3)) + "(cm)"
      ];
      correct = root(a, 3);
      wrongs = [root(a, 2), M.num(3 * a), M.num(2 * a), root(3 * a, 2), M.num(3 * a * a), root(a, 3, 2)];
    } else if (kind === "cone") {
      do { c = M.rand(3, 13); a = M.rand(1, c - 1); n = c * c - a * a; } while (a > 8);
      text = "底面の半径が " + a + " cm、母線の長さが " + c + " cm の円錐の高さを求めなさい。";
      lines = [
        "底面の半径、高さ、母線は直角三角形をつくり、母線が斜辺です。高さを " + mf("h") + " cm とします。",
        m(M.pow("h", 2), "=", M.pow(c, 2), "-", M.pow(a, 2), "=", n),
        "高さは " + fin(n) + "(cm)"
      ];
      correct = root(1, n);
      wrongs = [root(1, c * c + a * a), M.num(c - a), M.num(n), root(1, c + a), root(1, c - a), root(1, n + 1)];
    } else {
      a = M.rand(2, 12);
      text = "1辺が " + a + " cm の正三角形の高さを求めなさい。";
      lines = [
        "頂点から底辺に垂線をひくと、3つの角が 30°、60°、90° の直角三角形が2つできます。辺の比は " + mf("1 : 2 : √3") + " です。",
        "高さは、1辺(斜辺)の " + mf("{√3/2}") + " 倍です。",
        m(a, "*", M.frac(M.sqrt(3), 2), "=", root(a, 3, 2)) + "(cm)"
      ];
      correct = root(a, 3, 2);
      wrongs = [root(a, 3), M.fracNum(a, 2), root(a, 2, 2), root(a, 3, 3), root(a, 2), M.num(a)];
    }
    function withCm(h) { return h + " cm"; }
    return build({ text: text, explain: lines, meta: { kind: "g3-diag" } },
      M.choices(withCm(correct), wrongs.map(withCm), function (i) { return withCm(root(1, (n || a) + i + 2)); }));
  }

  // 弦と中心からの距離
  var pythChordFig = (function () {
    var O = [130, 92], A = [74, 134], B = [186, 134], H = [130, 134];
    var s = fig.circle(O[0], O[1], 70) + seg(A, B) + seg(O, H, "fig-line-2") + seg(O, A, "fig-line") + rightMark(H, O, B, 8);
    s += fig.dot(O[0], O[1], 2.5) + name(O, "O", 0, -8) + name(A, "A", -9, 8, "end") + name(B, "B", 9, 8, "start") + name(H, "H", 0, 15);
    s += sideText(A, O, "5 cm", 8, "end") + fig.text(137, 118, "3 cm", "start");
    return M.svg(260, 172, "半径 5 cm の円 O と弦 AB。中心 O から弦 AB にひいた垂線 OH の長さは 3 cm", s);
  })();
  // 円錐
  var pythConeFig = (function () {
    var T = [130, 22], Cn = [130, 130], L = [85, 130], R = [175, 130];
    var s = seg(T, L) + seg(T, R) + fig.path("M85 130 A45 12 0 0 0 175 130") + fig.path("M85 130 A45 12 0 0 1 175 130", "fig-line-2");
    s += seg(T, Cn, "fig-line-2") + seg(Cn, R, "fig-line") + rightMark(Cn, T, R, 7);
    s += sideText(R, T, "13 cm", -8, "start") + fig.text(153, 159, "5 cm", "middle");
    return M.svg(260, 166, "円錐。底面の半径は 5 cm、母線の長さは 13 cm。頂点から底面の中心に、高さを表す点線がひかれている", s);
  })();
  // 正三角形
  var pythEqFig = (function () {
    var B = [70, 150], C = [190, 150], A = [130, 150 - 60 * Math.sqrt(3)], H = [130, 150];
    var s = fig.poly([A, B, C]) + seg(A, H, "fig-line-2") + rightMark(H, A, C, 8);
    s += name(A, "A", 0, -7) + name(B, "B", -8, 6, "end") + name(C, "C", 8, 6, "start") + name(H, "H", 0, 15);
    s += sideText(B, A, "6 cm", 8, "end") + sideText(A, C, "6 cm", 8, "start") + fig.text(164, 166, "3 cm", "middle");
    return M.svg(260, 174, "1辺 6 cm の正三角形 ABC。頂点 A から辺 BC に垂線 AH がひかれている。HC = 3 cm", s);
  })();
  // 接線の長さ
  var pythTangentFig = (function () {
    var O = [84, 100], P = [204, 100], A = fig.polar(84, 100, 72, Math.acos(0.6) * 180 / Math.PI);
    var s = fig.circle(O[0], O[1], 72) + seg(lerp(P, A, 1.25), P) + seg(O, A, "fig-line") + seg(O, P, "fig-line-2") + rightMark(A, O, P, 8);
    s += fig.dot(O[0], O[1], 2.5) + name(O, "O", -8, 4, "end") + name(P, "P", 9, 4, "start") + name(A, "A", 2, -9, "start");
    s += sideText(O, A, "6 cm", 8, "end") + fig.text(118, 116, "10 cm", "middle") + sideText(A, P, XCM, 9, "start");
    return M.svg(260, 180, "半径 6 cm の円 O と、円の外の点 P からひいた接線 PA。A は接点。OP = 10 cm、PA = x cm", s);
  })();
  // 正四角錐
  var pythPyramidFig = (function () {
    var A = [58, 142], B = [168, 142], C = [214, 108], D = [104, 108], H = [136, 125], O = [136, 24];
    var s = seg(O, A) + seg(O, B) + seg(O, C) + seg(A, B) + seg(B, C);
    s += seg(O, D, "fig-line-2") + seg(C, D, "fig-line-2") + seg(D, A, "fig-line-2") + seg(A, C, "fig-line-2") + seg(O, H, "fig-line");
    s += name(O, "O", 0, -7) + name(A, "A", -8, 8, "end") + name(B, "B", 4, 15, "start") + name(C, "C", 8, 5, "start") + name(D, "D", 10, 13, "start") + name(H, "H", 9, 14, "start");
    s += fig.text(113, 158, "6 cm", "middle") + sideText(A, O, "9 cm", 8, "end");
    return M.svg(260, 166, "正四角錐 O-ABCD。底面は1辺 6 cm の正方形 ABCD、OA = 9 cm。頂点 O から底面にひいた垂線が、底面の対角線の交点 H に下りている", s);
  })();

  var pythFixed = [
    {
      id: "converse",
      text: "3辺の長さが次のような三角形のうち、直角三角形はどれですか。",
      choices: ["5 cm、12 cm、13 cm", "4 cm、5 cm、6 cm", "6 cm、7 cm、9 cm", "2 cm、3 cm、4 cm"],
      answer: 0,
      choiceLayout: "stack",
      explain: [
        "三平方の定理の逆: 最も長い辺を " + mf("c") + " として " + mf("a^2 + b^2 = c^2") + " が成り立てば、直角三角形です。",
        mf("5^2 + 12^2 = 25 + 144 = 169") + "、" + mf("13^2 = 169") + " で等しいので、直角三角形です。",
        "ほかは " + mf("4^2 + 5^2 = 41") + "(" + mf("6^2 = 36") + ")、" + mf("6^2 + 7^2 = 85") + "(" + mf("9^2 = 81") + ")、" + mf("2^2 + 3^2 = 13") + "(" + mf("4^2 = 16") + ")で、等しくなりません。"
      ]
    },
    {
      id: "chord",
      text: "図で、円 O の半径は 5 cm、中心 O から弦 AB までの距離 OH は 3 cm です。弦 AB の長さを求めなさい。",
      figure: pythChordFig,
      choices: ["8 cm", "4 cm", f("2√34" + cm), "6 cm"],
      answer: 0,
      explain: [
        "△OAH は " + mf("∠OHA = 90°") + " の直角三角形で、斜辺は半径 OA = 5 cm です。",
        mf("AH^2 = 5^2 - 3^2 = 16") + " より " + mf("AH = 4") + "(cm)",
        "中心から弦にひいた垂線は弦を2等分するので、" + mf("AB = 2 * 4 = 8") + "(cm)"
      ]
    },
    {
      id: "cone-volume",
      text: "図の円錐は、底面の半径が 5 cm、母線の長さが 13 cm です。この円錐の体積を求めなさい。",
      figure: pythConeFig,
      choices: [f("100π" + cm3), f("300π" + cm3), f("{325/3}π" + cm3), f("65π" + cm3)],
      answer: 0,
      explain: [
        "高さを " + mf("h") + " cm とすると、底面の半径・高さ・母線は直角三角形をつくります。",
        mf("h^2 = 13^2 - 5^2 = 144") + " より " + mf("h = 12"),
        "体積は " + mf("{1/3} * π * 5^2 * 12 = 100π") + "(cm<sup>3</sup>)"
      ]
    },
    {
      id: "equilateral-area",
      text: "図の、1辺が 6 cm の正三角形 ABC の面積を求めなさい。",
      figure: pythEqFig,
      choices: [f("9√3" + cm2), f("18√3" + cm2), f("18" + cm2), f("9√2" + cm2)],
      answer: 0,
      explain: [
        "△AHC は直角三角形で、" + mf("AH^2 = 6^2 - 3^2 = 27") + " より " + mf("AH = √27 = 3√3") + "(cm)",
        "面積は 底辺 × 高さ ÷ 2 です。",
        mf("{1/2} * 6 * 3√3 = 9√3") + "(cm<sup>2</sup>)"
      ]
    },
    {
      id: "tangent-length",
      text: "図で、PA は円 O の接線で、A は接点です。円 O の半径が 6 cm、OP = 10 cm のとき、" + mf("x") + " の値を求めなさい。",
      figure: pythTangentFig,
      choices: ["8", "4", f("2√34"), "16"],
      answer: 0,
      explain: [
        "接線は接点を通る半径に垂直なので、△OAP は " + mf("∠OAP = 90°") + " の直角三角形です。斜辺は OP です。",
        mf("x^2 + 6^2 = 10^2") + " より " + mf("x^2 = 100 - 36 = 64"),
        mf("x > 0") + " なので " + mf("x = 8")
      ]
    },
    {
      id: "pyramid-height",
      text: "図の正四角錐 O-ABCD は、底面が1辺 6 cm の正方形で、OA = 9 cm です。高さ OH を求めなさい。",
      figure: pythPyramidFig,
      choices: [f("3√7" + cm), f("6√2" + cm), f("3√5" + cm), f("3√11" + cm)],
      answer: 0,
      explain: [
        "底面の対角線は " + mf("AC = 6√2") + "(cm)なので、" + mf("AH = 3√2") + "(cm)です。",
        "△OAH は " + mf("∠OHA = 90°") + " の直角三角形です。" + mf("OH^2 = 9^2 - (3√2)^2 = 81 - 18 = 63"),
        mf("OH = √63 = 3√7") + "(cm)"
      ]
    },
    {
      id: "plane-distance",
      text: "図の2点 A" + mf("(-3, -2)") + "、B" + mf("(1, 1)") + " の間の距離を求めなさい(1目もりは 1)。",
      figure: M.plane({
        range: 5,
        label: "座標平面。点 A は (−3, −2)、点 B は (1, 1)。線分 AB を斜辺とし、点 C(1, −2) で直角になる直角三角形がかかれている",
        items: [
          { type: "segment", x1: -3, y1: -2, x2: 1, y2: -2, cls: "fig-line-2" }, { type: "segment", x1: 1, y1: -2, x2: 1, y2: 1, cls: "fig-line-2" },
          { type: "segment", x1: -3, y1: -2, x2: 1, y2: 1 },
          { type: "point", x: -3, y: -2, label: "A", dx: -8, dy: 5, anchor: "end" }, { type: "point", x: 1, y: 1, label: "B", dx: 7, dy: -5 },
          { type: "label", x: 1.35, y: -2.75, text: "C", anchor: "start" }
        ]
      }),
      choices: ["5", "7", f("√7"), "25"],
      answer: 0,
      explain: [
        "C" + mf("(1, -2)") + " をとると、△ABC は直角三角形です。" + mf("AC = 1 - (-3) = 4") + "、" + mf("BC = 1 - (-2) = 3"),
        mf("AB^2 = 4^2 + 3^2 = 25"),
        mf("AB > 0") + " なので " + mf("AB = 5")
      ]
    }
  ];

  var pythRefFig = (function () {
    // 左: 45°、45°、90°   右: 30°、60°、90°
    var B1 = [14, 132], C1 = [104, 132], A1 = [104, 42], B2 = [140, 132], C2 = [270, 132], A2 = [270, 132 - 130 / Math.sqrt(3)];
    var s = fig.poly([A1, B1, C1]) + rightMark(C1, B1, A1, 8) + fig.poly([A2, B2, C2]) + rightMark(C2, B2, A2, 8);
    s += angleMark(B1, C1, A1, 14) + fig.text(B1[0] + 19, B1[1] - 5, "45°", "start");
    s += angleMark(B2, C2, A2, 20) + fig.text(B2[0] + 25, B2[1] - 4, "30°", "start") + angleMark(A2, B2, C2, 12) + fig.text(A2[0] - 4, A2[1] + 27, "60°", "end");
    s += fig.text(59, 149, "1", "middle") + fig.text(110, 91, "1", "start") + sideText(B1, A1, "√2", 7, "end");
    s += fig.text(205, 149, "√3", "middle") + fig.text(276, 99, "1", "start") + sideText(B2, A2, "2", 8, "end");
    return M.svg(292, 158, "2つの直角三角形。左は 45°、45°、90° で、辺の比は 1 : 1 : √2。右は 30°、60°、90° で、辺の比は 1 : 2 : √3", s);
  })();

  JHM.register("g3-pythagorean", {
    points: [
      "<b>三平方の定理</b>: 直角三角形の直角をはさむ2辺の長さを " + mf("a") + "、" + mf("b") + "、斜辺の長さを " + mf("c") + " とすると " + M.rule(mf("a^2 + b^2 = c^2")),
      "<b>三平方の定理の逆</b>: 3辺の長さ " + mf("a") + "、" + mf("b") + "、" + mf("c") + " の間に " + mf("a^2 + b^2 = c^2") + " が成り立てば、長さ " + mf("c") + " の辺を斜辺とする直角三角形です。",
      "<b>特別な直角三角形</b>: 45°、45°、90° の辺の比は " + M.rule(mf("1 : 1 : √2")) + "。30°、60°、90° の辺の比は " + M.rule(mf("1 : 2 : √3")) + "(最も短い辺 : 斜辺 : 残りの辺)。",
      "<b>座標平面</b>: 2点間の距離は、座標軸に平行な2辺をもつ直角三角形の斜辺として求めます。" + M.rule(mf("√((x '座標の差')^2 + (y '座標の差')^2)")),
      "<b>図形への利用</b>: 長方形の対角線 " + M.rule(mf("√(a^2 + b^2)")) + "、直方体の対角線 " + M.rule(mf("√(a^2 + b^2 + c^2)")) + "。円錐の高さや弦の長さも、直角三角形を見つけて求めます。"
    ],
    example: {
      title: "直角をはさむ2辺の長さが 4 cm、6 cm の直角三角形の、斜辺の長さを求めなさい。",
      steps: [
        "斜辺の長さを " + mf("x") + " cm とすると、" + mf("x^2 = 4^2 + 6^2"),
        mf("x^2 = 16 + 36 = 52"),
        mf("x > 0") + " なので " + mf("x = √52 = 2√13")
      ],
      result: mf("2√13" + cm)
    },
    figure: {
      html: pythRefFig,
      caption: "三角定規の形の直角三角形の、3辺の比。"
    },
    generators: [
      { id: "side", label: "直角三角形の辺の長さ", make: genPythSide },
      { id: "distance", label: "2点間の距離", make: genDistance },
      { id: "special", label: "特別な直角三角形", make: genSpecial },
      { id: "diagonal", label: "対角線・立体の中の長さ", make: genDiagonal }
    ],
    fixed: pythFixed
  });

  // =====================================================================
  // 3-8 標本調査
  // =====================================================================

  var surveyLead = "ある中学校の全校生徒 600 人の中から、無作為に 50 人を選んで、1日の読書時間を調べました。";

  var samplingFixed = [
    {
      id: "census",
      text: "次の調査のうち、全数調査で行うのが適切なものはどれですか。",
      textChoices: true,
      choices: ["学校で行う生徒の健康診断", "テレビ番組の視聴率の調査", "川の水質の検査", "乾電池の寿命の検査"],
      answer: 0,
      explain: [
        "集団のすべてを調べるのが全数調査、一部を取り出して調べ、全体の傾向を推定するのが標本調査です。",
        "健康診断は、1人1人の健康状態を知る必要があるので、全員を調べます(全数調査)。",
        "視聴率や水質は全部を調べるのに手間と費用がかかりすぎ、乾電池は調べると使えなくなるので、標本調査が適しています。"
      ]
    },
    {
      id: "sample-survey",
      text: "次の調査のうち、標本調査で行うのが適切なものはどれですか。",
      textChoices: true,
      choices: ["缶詰の中身の品質検査", "国勢調査", "入学試験の採点", "クラスの出欠の確認"],
      answer: 0,
      explain: [
        "缶詰の品質検査は、調べるために缶を開けると商品にならなくなるので、一部を取り出して調べます(標本調査)。",
        "国勢調査は、国内に住むすべての人を対象とする全数調査です。",
        "入学試験の採点や出欠の確認は、1人1人の結果が必要なので、全数調査です。"
      ]
    },
    {
      id: "population",
      text: surveyLead + "この調査の母集団は何ですか。",
      textChoices: true,
      choices: ["全校生徒 600 人", "選ばれた 50 人の生徒", "50 人の読書時間の平均値", "読書をしている生徒だけ"],
      answer: 0,
      explain: [
        "標本調査で、傾向を知りたい集団全体を<b>母集団</b>、調べるために取り出した一部を<b>標本</b>といいます。",
        "この調査で知りたいのは全校生徒の読書時間なので、母集団は全校生徒 600 人です。",
        "選ばれた 50 人の生徒は標本です。"
      ]
    },
    {
      id: "sample-size",
      text: surveyLead + "この調査の標本の大きさを答えなさい。",
      choices: ["50", "600", "550", "12"],
      answer: 0,
      explain: [
        "標本として取り出したものの個数(人数)を、<b>標本の大きさ</b>といいます。",
        "取り出した標本は 50 人なので、標本の大きさは 50 です。",
        "600 は母集団の大きさです。"
      ]
    },
    {
      id: "random-method",
      text: "全校生徒 600 人から 50 人を選んで、標本調査をします。標本の選び方として最も適切なものはどれですか。",
      textChoices: true,
      choices: [
        "全員に番号をつけ、乱数さいやコンピューターの乱数を使って 50 人を選ぶ",
        "図書室によく来る生徒の中から 50 人を選ぶ",
        "3年1組と3年2組の生徒から 50 人を選ぶ",
        "調査に協力したいと申し出た生徒から 50 人を選ぶ"
      ],
      answer: 0,
      explain: [
        "標本は、母集団の性質をよく表すように、かたよりなく選ぶ必要があります。これを<b>無作為に抽出する</b>といいます。",
        "乱数さい、乱数表、コンピューターの乱数などを使うと、どの生徒も同じ確率で選ばれます。",
        "ほかの選び方は、学年や好みがかたよるので、全校生徒の傾向を正しく推定できません。"
      ]
    },
    {
      id: "marbles",
      text: "袋の中に白玉だけがたくさん入っています。そこへ黒玉を 50 個入れてよくかき混ぜ、無作為に 40 個を取り出したところ、黒玉が 5 個ふくまれていました。はじめに袋の中にあった白玉は、およそ何個と推定できますか。",
      choices: ["およそ 350 個", "およそ 400 個", "およそ 450 個", "およそ 250 個"],
      answer: 0,
      explain: [
        "取り出した 40 個のうち、白玉は " + mf("40 - 5 = 35") + "(個)です。標本での白玉と黒玉の比は、母集団でもほぼ同じと考えます。",
        "白玉を " + mf("x") + " 個とすると、" + mf("x : 50 = 35 : 5"),
        mf("5x = 1750") + " より " + mf("x = 350") + "(400 個は、黒玉をふくめた全体の数)"
      ]
    },
    {
      id: "defect",
      text: "ある工場で作った製品 5000 個の中から、無作為に 200 個を取り出して調べたところ、不良品が 4 個ありました。5000 個の製品の中に、不良品はおよそ何個あると推定できますか。",
      choices: ["およそ 100 個", "およそ 20 個", "およそ 50 個", "およそ 250 個"],
      answer: 0,
      explain: [
        "標本での不良品の割合は " + mf("{4/200} = {1/50}") + " です。",
        "母集団でも、不良品の割合はほぼ同じと考えます。",
        mf("5000 * {1/50} = 100") + "(個)"
      ]
    },
    {
      id: "fish",
      text: "池のコイの数を調べるために、60 匹をつかまえて印をつけ、池にもどしました。数日後、無作為に 80 匹をつかまえたところ、印のついたコイが 12 匹いました。池のコイは、およそ何匹と推定できますか。",
      choices: ["およそ 400 匹", "およそ 9 匹", "およそ 960 匹", "およそ 320 匹"],
      answer: 0,
      explain: [
        "池全体での印つきのコイの割合と、つかまえた 80 匹の中での割合は、ほぼ等しいと考えます。",
        "池のコイを " + mf("x") + " 匹とすると、" + mf("60 : x = 12 : 80"),
        mf("12x = 4800") + " より " + mf("x = 400")
      ]
    },
    {
      id: "sample-mean",
      text: "ある中学校の3年生 200 人の中から、無作為に 40 人を選んで通学時間を調べたところ、平均値は 18 分でした。3年生 200 人の通学時間の平均値について、最も適切なものはどれですか。",
      textChoices: true,
      choices: ["およそ 18 分と推定できる", "ちょうど 18 分であるといえる", "およそ 90 分と推定できる", "この調査からは、何も推定できない"],
      answer: 0,
      explain: [
        "無作為に抽出した標本の平均値(標本平均)は、母集団の平均値に近い値になると考えられます。",
        "したがって、3年生全体の平均値は、およそ 18 分と推定できます。",
        "標本調査の結果は推定なので、母集団の値とぴったり一致するとはかぎりません。"
      ]
    },
    {
      id: "sample-larger",
      text: "標本調査について、正しいものはどれですか。",
      textChoices: true,
      choices: [
        "標本の大きさを大きくすると、標本の傾向は母集団の傾向に近づきやすい",
        "標本は、調べやすいものから順に選ぶのがよい",
        "標本調査の結果は、母集団の値と必ず一致する",
        "標本調査は、全数調査よりも手間や費用がかかる"
      ],
      answer: 0,
      explain: [
        "標本の大きさが大きいほど、標本の平均値や割合は、母集団の値に近い値をとりやすくなります。",
        "標本は、かたよりが出ないように無作為に抽出します。",
        "標本調査は、全数調査より手間や費用が少なくてすみますが、結果は推定であり、誤差があります。"
      ]
    },
    {
      id: "dictionary",
      text: "ある英和辞典の、見出し語がのっているページは全部で 1000 ページです。無作為に 10 ページを選んで見出し語を数えたところ、1ページあたりの平均は 32 語でした。この辞典の見出し語は、およそ何語と推定できますか。",
      choices: ["およそ 32000 語", "およそ 3200 語", "およそ 320 語", "およそ 320000 語"],
      answer: 0,
      explain: [
        "標本(10 ページ)の平均値 32 語を、母集団(1000 ページ)の1ページあたりの平均値と考えます。",
        mf("32 * 1000 = 32000") + "(語)"
      ]
    },
    {
      id: "ratio-estimate",
      text: "箱の中に、赤玉と白玉が合わせて 600 個入っています。よくかき混ぜてから無作為に 30 個を取り出したところ、赤玉が 12 個ふくまれていました。箱の中の赤玉は、およそ何個と推定できますか。",
      choices: ["およそ 240 個", "およそ 360 個", "およそ 200 個", "およそ 120 個"],
      answer: 0,
      explain: [
        "標本での赤玉の割合は " + mf("{12/30} = {2/5}") + " です。",
        "母集団でも、赤玉の割合はほぼ同じと考えます。",
        mf("600 * {2/5} = 240") + "(個)"
      ]
    }
  ];

  JHM.register("g3-sampling", {
    points: [
      "集団のすべてを調べる調査を<b>全数調査</b>、一部を取り出して調べ、全体の傾向を推定する調査を<b>標本調査</b>といいます。全部を調べると手間や費用がかかりすぎるとき、調べると品物がこわれるときは、標本調査を使います。",
      "傾向を知りたい集団全体を<b>母集団</b>、取り出した一部を<b>標本</b>、標本にふくまれるものの個数を<b>標本の大きさ</b>といいます。",
      "標本は、かたよりのないように<b>無作為に抽出</b>します(乱数さい、乱数表、コンピューターの乱数など)。",
      "<b>推定</b>: 標本での割合や平均値は、母集団でもほぼ同じと考えます。" + M.rule("母集団の数量 ≒ 全体の数 × 標本での割合") + "。標本の大きさが大きいほど、母集団の値に近づきやすくなります。"
    ],
    example: {
      title: "袋の中の白玉と黒玉 合わせて 500 個から、無作為に 20 個を取り出したところ、黒玉が 8 個でした。袋の中の黒玉は、およそ何個と推定できますか。",
      steps: [
        "標本での黒玉の割合は " + mf("{8/20} = {2/5}"),
        "母集団でも、割合はほぼ同じと考える",
        mf("500 * {2/5} = 200")
      ],
      result: "およそ 200 個"
    },
    fixed: samplingFixed
  });
})();

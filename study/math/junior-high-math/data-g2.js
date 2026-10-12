// 中学数学道場: 中2の7単元の中身(要点・例題・図・問題)。
// 形式の説明は data.js の先頭、式と図の関数は math.js を参照。書き方は data-g1.js と同じ。
(function () {
  "use strict";
  if (typeof JHM === "undefined" || typeof M === "undefined") return;

  // ---------- このファイルの中で使う短い名前 ----------
  var v = M.v, m = M.m, mf = M.mf, f = M.f, fig = M.fig;
  var X = v("x"), Y = v("y"), VA = v("a"), VB = v("b"), VN = v("n"), VM = v("m");
  function sg(n) { return n < 0 ? "-" : "+"; }          // 符号を演算子に
  function abs(n) { return Math.abs(n); }
  function par(h) { return "(" + h + ")"; }
  // 問題の本体と4択を1つにまとめる
  function build(base, ch) {
    base.choices = ch.choices;
    base.answer = ch.answer;
    return base;
  }
  // 2つの文字の式 Au + Bw(u, w を省くと x, y)
  function two(A, B, u, w) { return M.poly([[A, u || X], [B, w || Y]]); }
  // Au + Bw の4択。pairs は誤答の [A, B] の組(0 をふくむ組は使わない)。wrap で全体を包める
  function twoChoices(A, B, pairs, u, w, wrap) {
    function h(p) {
      if (p[0] === 0 || p[1] === 0) return null;
      var t = two(p[0], p[1], u, w);
      return wrap ? wrap(t) : t;
    }
    return M.choices(h([A, B]), pairs.map(h), function () {
      return h([A + M.pick([-2, -1, 0, 1, 2]), B + M.pick([-3, -2, -1, 1, 2, 3])]);
    });
  }
  // 連立方程式の解の書き方「x = 2, y = −1」
  function sol(x0, y0) { return M.eqn(X, x0) + ", " + M.eqn(Y, y0); }
  function solChoices(x0, y0) {
    return M.choices(sol(x0, y0), [sol(y0, x0), sol(x0, -y0), sol(-x0, y0), sol(-x0, -y0), sol(x0, y0 + 1), sol(x0 - 1, y0)], function () {
      return sol(x0 + M.pick([-2, -1, 0, 1, 2]), y0 + M.pick([-2, -1, 1, 2]));
    });
  }

  // =====================================================================
  // 2-1 式の計算
  // =====================================================================

  // 多項式の加法・減法
  function genPolyAddSub() {
    var L = M.pick([[X, Y], [X, Y], [VA, VB], [M.pow("x", 2), X]]), u = L[0], w = L[1];
    var s = M.pick(["+", "-", "-"]), a, b, c, d, c2, d2;
    do {
      a = M.randNZ(-7, 7); b = M.randNZ(-7, 7); c = M.randNZ(-7, 7); d = M.randNZ(-7, 7);
      c2 = s === "-" ? -c : c; d2 = s === "-" ? -d : d;
    } while (a + c2 === 0 || b + d2 === 0);
    var expr = par(two(a, b, u, w)) + M.op(s) + par(two(c, d, u, w));
    return build({
      text: "次の計算をしなさい。",
      math: m(expr),
      explain: [
        s === "-" ? "ひくほうの式は、すべての項の符号を変えて、かっこをはずします。" : "そのままかっこをはずして、同類項をまとめます。",
        m(expr),
        m("=", M.poly([[a, u], [b, w], [c2, u], [d2, w]])),
        m("=", two(a + c2, b + d2, u, w))
      ],
      meta: { kind: "simplify-multi" }
    }, twoChoices(a + c2, b + d2, [[a + c2, b - d2], [a - c2, b + d2], [a - c2, b - d2], [a + c2, -(b + d2)], [-(a + c2), b + d2]], u, w));
  }

  // 数 × 多項式の加減、分数の形の式の加減
  function genPolyScale() {
    var a, b, c, d, k, l, l2, s, A, B, expr, lines, ch;
    s = M.pick(["+", "-", "-"]);
    if (Math.random() < 0.65) {
      do {
        k = M.rand(2, 5); l = M.rand(2, 5);
        a = M.randNZ(-4, 4); b = M.randNZ(-4, 4); c = M.randNZ(-4, 4); d = M.randNZ(-4, 4);
        l2 = s === "-" ? -l : l;
        A = k * a + l2 * c; B = k * b + l2 * d;
      } while (A === 0 || B === 0);
      expr = M.num(k) + par(two(a, b)) + M.op(s) + M.num(l) + par(two(c, d));
      lines = [
        "分配法則でかっこをはずしてから、同類項をまとめます。" + (s === "-" ? "うしろのかっこには " + m(-l) + " をかけます。" : ""),
        m(expr),
        m("=", M.poly([[k * a, X], [k * b, Y], [l2 * c, X], [l2 * d, Y]])),
        m("=", two(A, B))
      ];
      ch = twoChoices(A, B, [[A, k * b - l2 * d], [k * a - l2 * c, B], [A, b + l2 * d], [k * a + (s === "-" ? -c : c), B], [k * a - l2 * c, k * b - l2 * d]]);
      return build({ text: "次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "simplify-multi" } }, ch);
    }
    var p, q, Lc, kp, kq, kq2;
    do {
      p = M.pick([2, 3, 4, 6]); q = M.pick([2, 3, 4, 6]);
      a = M.rand(1, 3); b = M.randNZ(-3, 3); c = M.rand(1, 3); d = M.randNZ(-3, 3);
      Lc = M.lcm(p, q); kp = Lc / p; kq = Lc / q; kq2 = s === "-" ? -kq : kq;
      A = kp * a + kq2 * c; B = kp * b + kq2 * d;
    } while (p === q || A === 0 || B === 0 || M.gcd(M.gcd(A, B), Lc) !== 1 || M.gcd(M.gcd(a, b), p) !== 1 || M.gcd(M.gcd(c, d), q) !== 1);
    function fr(t) { return M.frac(t, Lc); }
    function mult(kk, t) { return (kk === 1 ? "" : M.num(kk)) + par(t); }
    expr = M.frac(two(a, b), p) + M.op(s) + M.frac(two(c, d), q);
    lines = [
      "通分して、1つの分数にまとめます(方程式ではないので、分母をはらってはいけません)。",
      m(expr),
      m("=", fr(mult(kp, two(a, b)) + M.op(s) + mult(kq, two(c, d)))),
      m("=", fr(M.poly([[kp * a, X], [kp * b, Y], [kq2 * c, X], [kq2 * d, Y]]))),
      m("=", fr(two(A, B)))
    ];
    function frp(t) { return t[0] === 0 || t[1] === 0 ? null : fr(two(t[0], t[1])); }
    ch = M.choices(fr(two(A, B)), [two(A, B), frp([A, kp * b - kq2 * d]), frp([kp * a - kq2 * c, B]), frp([a + (s === "-" ? -c : c), b + (s === "-" ? -d : d)])], function () {
      return frp([A + M.pick([-2, -1, 1, 2]), B + M.pick([-2, -1, 0, 1, 2])]);
    });
    return build({ text: "次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "simplify-multi" } }, ch);
  }

  // 単項式。係数 c、文字 L[0] の指数 ex、L[1] の指数 ey
  function mono(c, ex, ey, L) {
    L = L || ["x", "y"];
    function pw(name, e) { return e === 0 ? "" : (e === 1 ? v(name) : M.pow(name, e)); }
    return M.term(c, pw(L[0], ex) + pw(L[1], ey));
  }
  // 演算のうしろに置く単項式(負ならかっこをつける)
  function monoP(c, ex, ey, L) { var h = mono(c, ex, ey, L); return c < 0 ? par(h) : h; }
  // 単項式の4択。正解 [c, ex, ey] と、誤答の候補
  function monoChoices(R, L, wrongs) {
    function h(t) { return t[0] === 0 || t[1] < 0 || t[2] < 0 ? null : mono(t[0], t[1], t[2], L); }
    return M.choices(h(R), wrongs.map(h), function () {
      return h([R[0] * M.pick([1, 1, -1]) + M.pick([0, 0, 1, -1, 2]), Math.max(0, R[1] + M.pick([-1, 0, 1])), Math.max(0, R[2] + M.pick([-1, 0, 1]))]);
    });
  }
  function randExps(max) {
    var e;
    do { e = [M.rand(0, max), M.rand(0, max)]; } while (e[0] + e[1] === 0);
    return e;
  }
  var COEFS = [-6, -5, -4, -3, -2, -1, 2, 3, 4, 5, 6];

  // 単項式の乗法・除法
  function genMonomial() {
    var L = M.pick([["x", "y"], ["a", "b"]]), kind = M.pick(["mul", "pow", "div", "div", "muldiv"]);
    var c1, c2, e1, e2, expr, lines, R, wrongs, neg;
    if (kind === "mul") {
      c1 = M.pick(COEFS); c2 = M.pick(COEFS); e1 = randExps(2); e2 = randExps(1);
      R = [c1 * c2, e1[0] + e2[0], e1[1] + e2[1]];
      expr = M.join(mono(c1, e1[0], e1[1], L), "*", monoP(c2, e2[0], e2[1], L));
      lines = [
        "係数どうし、文字どうしをそれぞれかけます。",
        m(expr),
        m("=", c1, "*", c2, "*", mono(1, e1[0], e1[1], L), "*", mono(1, e2[0], e2[1], L)),
        m("=", mono(R[0], R[1], R[2], L))
      ];
      wrongs = [[-R[0], R[1], R[2]], [c1 + c2, R[1], R[2]], [R[0], Math.max(e1[0], e2[0]), Math.max(e1[1], e2[1])], [R[0], R[1] + 1, R[2]], [R[0], R[1], R[2] + 1]];
    } else if (kind === "pow") {
      var e = M.pick([2, 2, 3]), c = e === 2 ? M.pick([-5, -4, -3, -2, -1, 2, 3, 4, 5]) : M.pick([-3, -2, -1, 2]);
      var ex = M.pick([[1, 0], [1, 0], [1, 1], [0, 1]]), outer = e === 2 && Math.random() < 0.3;
      var base = par(mono(c, ex[0], ex[1], L)), val = Math.pow(c, e) * (outer ? -1 : 1);
      R = [val, ex[0] * e, ex[1] * e];
      expr = (outer ? M.MINUS : "") + M.pow(base, e);
      var rep = [];
      for (var i = 0; i < e; i++) { if (i) rep.push("*"); rep.push(base); }
      lines = [
        "かっこの中全体を " + e + " 回かけます。係数も " + e + " 乗します。" + (outer ? "先頭の − は累乗にふくまれません。" : ""),
        m(expr),
        m("=", (outer ? M.MINUS : "") + M.join(rep)),
        m("=", mono(R[0], R[1], R[2], L))
      ];
      wrongs = [[-val, R[1], R[2]], [c * e * (outer ? -1 : 1), R[1], R[2]], [val, ex[0], ex[1]], [c * (outer ? -1 : 1), R[1], R[2]], [-val, ex[0], ex[1]]];
    } else if (kind === "div") {
      var dc, de;
      do {
        R = [M.pick(COEFS), M.rand(0, 2), M.rand(0, 2)]; dc = M.pick(COEFS.slice(1, 10)); de = randExps(1);
      } while (abs(R[0] * dc) > 36);
      var N = [R[0] * dc, R[1] + de[0], R[2] + de[1]];
      expr = M.join(mono(N[0], N[1], N[2], L), "/", monoP(dc, de[0], de[1], L));
      neg = R[0] < 0;
      lines = [
        "わり算は分数の形にして、係数どうし・文字どうしで約分します。",
        m(expr),
        m("=", (neg ? M.MINUS : "") + M.frac(mono(abs(N[0]), N[1], N[2], L), mono(abs(dc), de[0], de[1], L))),
        m("=", mono(R[0], R[1], R[2], L))
      ];
      wrongs = [[-R[0], R[1], R[2]], [R[0], R[1] + 2 * de[0], R[2] + 2 * de[1]], [R[0], N[1], N[2]], [N[0] - dc, R[1], R[2]], [R[0], R[1] + 1, R[2]]];
    } else {
      var P, cc, ce, divs;
      do {
        c1 = M.pick(COEFS); c2 = M.pick(COEFS); e1 = randExps(2); e2 = randExps(1);
        P = [c1 * c2, e1[0] + e2[0], e1[1] + e2[1]];
        divs = [2, 3, 4, 5, 6, 8, 9, 10, 12].filter(function (t) { return P[0] % t === 0; });
        ce = [M.rand(0, Math.min(2, P[1])), M.rand(0, Math.min(2, P[2]))];
      } while (divs.length === 0 || ce[0] + ce[1] === 0);
      cc = M.pick(divs) * M.pick([1, -1]);
      R = [P[0] / cc, P[1] - ce[0], P[2] - ce[1]];
      expr = M.join(mono(c1, e1[0], e1[1], L), "*", monoP(c2, e2[0], e2[1], L), "/", monoP(cc, ce[0], ce[1], L));
      neg = R[0] < 0;
      lines = [
        "かける式を分子に、わる式を分母にして、1つの分数にまとめます。符号は先に決めます(負の数が" + (neg ? "奇数個なので −" : "偶数個なので +") + ")。",
        m(expr),
        m("=", (neg ? M.MINUS : "") + M.frac(M.join(mono(abs(c1), e1[0], e1[1], L), "*", mono(abs(c2), e2[0], e2[1], L)), mono(abs(cc), ce[0], ce[1], L))),
        m("=", mono(R[0], R[1], R[2], L))
      ];
      wrongs = [[-R[0], R[1], R[2]], [R[0], P[1] + ce[0], P[2] + ce[1]], [R[0], P[1], P[2]], [R[0], R[1] + 1, R[2]], [R[0], R[1], R[2] + 1]];
    }
    return build({ text: "次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "monomial" } }, monoChoices(R, L, wrongs));
  }

  // 式の値(式を簡単にしてから代入)
  function genValue() {
    var L = M.pick([["x", "y"], ["a", "b"]]), U = v(L[0]), W = v(L[1]);
    var p, q, expr, lines, val, wrongs;
    do { p = M.randNZ(-4, 4); q = M.randNZ(-4, 4); } while ((p > 0 && q > 0) || p === q);
    if (Math.random() < 0.55) {
      var k, l, l2, a, b, c, d, A, B, s = M.pick(["+", "-", "-"]);
      do {
        k = M.rand(2, 4); l = M.rand(2, 4);
        a = M.randNZ(-3, 3); b = M.randNZ(-3, 3); c = M.randNZ(-3, 3); d = M.randNZ(-3, 3);
        l2 = s === "-" ? -l : l;
        A = k * a + l2 * c; B = k * b + l2 * d;
      } while (abs(A) < 2 || abs(B) < 2);
      expr = M.num(k) + par(two(a, b, U, W)) + M.op(s) + M.num(l) + par(two(c, d, U, W));
      val = A * p + B * q;
      lines = [
        "式を簡単にしてから代入すると、計算が楽になります。",
        m(expr),
        m("=", M.poly([[k * a, U], [k * b, W], [l2 * c, U], [l2 * d, W]])),
        m("=", two(A, B, U, W)),
        m("=", A, "*", p, sg(B), abs(B), "*", q),
        m("=", A * p, sg(B * q), abs(B * q), "=", val)
      ];
      wrongs = [A * q + B * p, A * p - B * q, -val, (k * a - l2 * c) * p + (k * b - l2 * d) * q, A * abs(p) + B * abs(q)];
    } else {
      var R, dc, de;
      do {
        R = [M.pick([-5, -4, -3, -2, 2, 3, 4, 5]), M.rand(0, 2), M.rand(0, 2)]; dc = M.pick([-5, -4, -3, -2, 2, 3, 4, 5]); de = randExps(1);
        val = R[0] * Math.pow(p, R[1]) * Math.pow(q, R[2]);
      } while (R[1] + R[2] === 0 || R[1] + R[2] > 3 || abs(R[0] * dc) > 30 || abs(val) > 150);
      expr = M.join(mono(R[0] * dc, R[1] + de[0], R[2] + de[1], L), "/", monoP(dc, de[0], de[1], L));
      var parts = ["=", R[0]];
      if (R[1]) parts.push("*", R[1] === 1 ? p : M.pow(p, R[1]));
      if (R[2]) parts.push("*", R[2] === 1 ? q : M.pow(q, R[2]));
      lines = [
        "式を簡単にしてから代入します。負の数は、かっこをつけて代入します。",
        m(expr, "=", mono(R[0], R[1], R[2], L)),
        m(parts),
        m("=", val)
      ];
      wrongs = [-val, R[0] * Math.pow(q, R[1]) * Math.pow(p, R[2]), R[0] * (R[1] ? p : 1) * (R[2] ? q : 1), R[0] * dc * Math.pow(p, R[1]) * Math.pow(q, R[2]), -R[0] * (R[1] ? p : 1) * (R[2] ? q : 1)];
    }
    return build({
      text: m(U, "=", p) + "、" + m(W, "=", q) + " のとき、次の式の値を求めなさい。",
      math: m(expr),
      explain: lines,
      meta: { kind: "value-2" }
    }, M.numChoices(val, wrongs));
  }

  // 等式の変形(公式)。eq: もとの等式、t: 解く文字、ans: 正解、wrong: 誤答、how: 途中の説明
  var FORMULAS = [
    { eq: "\\S = {1/2}ah", t: "h", ans: "h = {2\\S/a}", wrong: ["h = {\\S/2a}", "h = 2a\\S", "h = {a/2\\S}"],
      how: ["両辺に 2 をかけて、" + mf("2\\S = ah"), "左辺と右辺を入れかえ、両辺を " + mf("a") + " でわって、" + mf("h = {2\\S/a}")] },
    { eq: "\\ℓ = 2(a + b)", t: "b", ans: "b = {\\ℓ/2} - a", wrong: ["b = \\ℓ - 2a", "b = {\\ℓ/2} + a", "b = 2\\ℓ - a"],
      how: ["両辺を 2 でわって、" + mf("{\\ℓ/2} = a + b"), mf("a") + " を移項して、" + mf("b = {\\ℓ/2} - a")] },
    { eq: "\\V = {1/3}\\Sh", t: "h", ans: "h = {3\\V/\\S}", wrong: ["h = {\\V/3\\S}", "h = {\\S/3\\V}", "h = 3\\V\\S"],
      how: ["両辺に 3 をかけて、" + mf("3\\V = \\Sh"), "左辺と右辺を入れかえ、両辺を " + mf("\\S") + " でわって、" + mf("h = {3\\V/\\S}")] },
    { eq: "m = {a + b/2}", t: "b", ans: "b = 2m - a", wrong: ["b = 2m + a", "b = {m/2} - a", "b = m - 2a"],
      how: ["両辺に 2 をかけて、" + mf("2m = a + b"), mf("a") + " を移項して、" + mf("b = 2m - a")] },
    { eq: "\\ℓ = 2πr", t: "r", ans: "r = {\\ℓ/2π}", wrong: ["r = 2π\\ℓ", "r = {2π/\\ℓ}", "r = {π\\ℓ/2}"],
      how: ["左辺と右辺を入れかえて、" + mf("2πr = \\ℓ"), "両辺を " + mf("2π") + " でわって、" + mf("r = {\\ℓ/2π}")] },
    { eq: "\\S = {(a + b)h/2}", t: "a", ans: "a = {2\\S/h} - b", wrong: ["a = {2\\S/h} + b", "a = {\\S/2h} - b", "a = 2\\Sh - b"],
      how: ["両辺に 2 をかけて、" + mf("2\\S = (a + b)h"), "両辺を " + mf("h") + " でわって、" + mf("{2\\S/h} = a + b"), mf("b") + " を移項して、" + mf("a = {2\\S/h} - b")] },
    { eq: "\\V = πr^2h", t: "h", ans: "h = {\\V/πr^2}", wrong: ["h = πr^2\\V", "h = {πr^2/\\V}", "h = {\\V/πr}"],
      how: ["左辺と右辺を入れかえて、" + mf("πr^2h = \\V"), "両辺を " + mf("πr^2") + " でわって、" + mf("h = {\\V/πr^2}")] }
  ];

  // 等式の変形
  function genRearrange() {
    var r = Math.random();
    if (r < 0.3) {
      var F = M.pick(FORMULAS);
      return build({
        text: "次の等式を " + mf(F.t) + " について解きなさい。",
        math: mf(F.eq),
        explain: [mf(F.t) + " をふくむ項だけが左辺に残るように、等式の性質を使って変形します。"].concat(F.how),
        choiceLayout: "stack",
        meta: { kind: "rearrange" }
      }, M.choices(f(F.ans), F.wrong.map(f)));
    }
    var forY = Math.random() < 0.7, TV = forY ? Y : X, OV = forY ? X : Y;
    var t, o, c, eqHtml, lines;
    function disp() { return m(forY ? two(o, t) : two(t, o), "=", c); }
    if (r < 0.7) {
      // 係数でわり切れる形。t·T + o·O = c を T = P·O + Q に直す
      var P = M.randNZ(-5, 5), Q = M.randNZ(-9, 9);
      t = M.pick([-4, -3, -2, -1, 2, 3, 4, 5]); o = -t * P; c = t * Q;
      eqHtml = disp();
      function eqC(pq) { return pq[0] === 0 ? null : M.eqn(TV, M.poly([[pq[0], OV], [pq[1], ""]])); }
      lines = [
        m(TV) + " をふくむ項だけを左辺に残し、ほかの項を移項します(符号が変わります)。",
        m(M.term(t, TV), "=", M.poly([[-o, OV], [c, ""]])),
        "両辺を " + m(t) + " でわると、" + m(eqC([P, Q]))
      ];
      return build({
        text: "次の等式を " + m(TV) + " について解きなさい。",
        math: eqHtml,
        explain: lines,
        choiceLayout: "stack",
        meta: { kind: "rearrange" }
      }, M.choices(eqC([P, Q]), [eqC([-P, Q]), eqC([P, -Q]), eqC([-o, c]), eqC([-P, -Q]), eqC([o, c])], function () {
        return eqC([P + M.pick([-1, 0, 1]), Q + M.pick([-2, -1, 1, 2])]);
      }));
    }
    // わり切れない形(答えが分数の形)
    do { t = M.rand(2, 5); o = M.randNZ(-5, 5); c = M.rand(1, 12); } while (M.gcd(t, o) !== 1);
    eqHtml = disp();
    function frC(oc, cc, div) {
      var top = M.poly([[oc, OV], [cc, ""]]);
      return M.eqn(TV, div ? M.frac(top, t) : top);
    }
    lines = [
      m(TV) + " をふくむ項だけを左辺に残し、ほかの項を移項します(符号が変わります)。",
      m(M.term(t, TV), "=", M.poly([[-o, OV], [c, ""]])),
      "両辺を " + m(t) + " でわると、" + m(frC(-o, c, true))
    ];
    return build({
      text: "次の等式を " + m(TV) + " について解きなさい。",
      math: eqHtml,
      explain: lines,
      choiceLayout: "stack",
      meta: { kind: "rearrange" }
    }, M.choices(frC(-o, c, true), [frC(o, c, true), frC(-o, c, false), frC(-o, -c, true), frC(-o, c - t, false), frC(o, -c, true)]));
  }

  // 文字を使った説明
  function genExplain() {
    var r = Math.random(), nlin = function (a, b) { return M.linear(a, b, "n"); };
    if (r < 0.4) {
      // p でわると q 余る数
      var p = M.rand(3, 9), q = M.rand(1, p - 1);
      return build({
        text: m(VN) + " を整数とするとき、" + p + " でわると " + q + " 余る数を表す式はどれですか。",
        explain: [
          p + " の倍数は、整数 " + m(VN) + " を使って " + m(M.term(p, VN)) + " と表せます。",
          p + " でわると " + q + " 余る数は、" + p + " の倍数より " + q + " 大きい数なので、" + m(nlin(p, q)) + " です。",
          "たとえば " + m(VN, "=", 1) + " のとき " + m(p, "+", q, "=", p + q) + " で、" + p + " でわると " + q + " 余ります。"
        ],
        meta: { kind: "remainder" }
      }, M.choices(nlin(p, q), [nlin(q, p), M.num(p) + par(nlin(1, q)), nlin(1, q), M.term(p, VN), M.term(p * q, VN)]));
    }
    if (r < 0.7) {
      // 連続する整数・偶数・奇数の和
      var type = M.pick(["整数", "偶数", "奇数"]), k = M.pick([3, 3, 4, 5]), middle = k % 2 === 1 && Math.random() < 0.45;
      var c = type === "整数" ? 1 : 2, e = type === "奇数" ? 1 : 0, step = type === "整数" ? 1 : 2;
      var offs = [], i;
      for (i = 0; i < k; i++) offs.push((middle ? i - (k - 1) / 2 : i) * step);
      var sumOff = offs.reduce(function (s, t) { return s + t; }, 0);
      var A = k * c, B = k * e + sumOff;
      var list = offs.map(function (t) { return nlin(c, e + t); });
      var lines = [
        k + " つの数は、" + list.map(function (h) { return m(h); }).join("、") + " と表せます。",
        // 項ごとに分けて書く(せまい画面で、式の途中で折り返せるように)
        "和は " + list.map(function (h) { return m(h.indexOf('class="op"') >= 0 ? par(h) : h); }).join(m("+")) + m("=", nlin(A, B))
      ];
      if (B !== 0 && B % k === 0) lines.push(m(nlin(A, B), "=", M.num(k) + par(nlin(A / k, B / k))) + " と表せるので、この和は " + k + " の倍数です。");
      else if (B === 0) lines.push(m(nlin(A, 0)) + " は " + k + " × (整数)の形なので、この和は " + k + " の倍数です。");
      return build({
        text: "連続する " + k + " つの" + type + "のうち、" + (middle ? "真ん中の" : "最も小さい") + "数を " + m(nlin(c, e)) + " とします。この " + k + " つの数の和を表す式はどれですか。",
        explain: lines,
        meta: { kind: "consecutive" }
      }, M.choices(nlin(A, B), [nlin(A, k * e + sumOff / step), nlin(A, k * e), nlin(c, B), nlin(A, B + step), nlin(A, k * e + k)].filter(function (h) { return h !== "0"; }), function () {
        return nlin(A + M.pick([-1, 0, 0, 1]) * c, B + M.pick([-2, -1, 1, 2, 3]));
      }));
    }
    if (r < 0.85) {
      // 偶数・奇数の和と差
      var cases = [
        { a: "偶数", b: "偶数", ea: 0, eb: 0, s: "+", name: "和" },
        { a: "偶数", b: "奇数", ea: 0, eb: 1, s: "+", name: "和" },
        { a: "奇数", b: "奇数", ea: 1, eb: 1, s: "+", name: "和" },
        { a: "奇数", b: "奇数", ea: 1, eb: 1, s: "-", name: "差" },
        { a: "奇数", b: "偶数", ea: 1, eb: 0, s: "-", name: "差" }
      ];
      var cs = M.pick(cases), sign = cs.s === "+" ? 1 : -1;
      var first = M.linear(2, cs.ea, "m"), second = M.linear(2, cs.eb, "n");
      var rest = cs.ea + sign * cs.eb;                     // 2m ± 2n のあとに残る数(0, 1, 2)
      var inner = function (extra) { return M.poly([[1, VM], [sign, VN], [extra, ""]]); };
      function shape(extra, plus) { return "2" + par(inner(extra)) + (plus ? M.op("+") + M.num(plus) : ""); }
      var correct = rest === 2 ? shape(1, 0) : shape(0, rest);
      var odd = rest === 1;
      var mathHtml = (cs.ea ? par(first) : first) + M.op(cs.s) + (cs.eb ? par(second) : second);
      return build({
        text: m(VM) + "、" + m(VN) + " を整数とします。" + cs.a + " " + m(first) + " と" + cs.b + " " + m(second) + " の" + cs.name + "を計算した式として、正しいものはどれですか。",
        math: m(mathHtml),
        explain: [
          m(mathHtml),
          m("=", M.poly([[2, VM], [2 * sign, VN], [rest, ""]])),
          m("=", correct),
          m(inner(rest === 2 ? 1 : 0)) + " は整数なので、" + (odd ? "2 × (整数) + 1 の形になり、この" + cs.name + "は奇数です。" : "2 × (整数)の形になり、この" + cs.name + "は偶数です。")
        ],
        choiceLayout: "stack",
        meta: { kind: "simplify-multi" }
      }, M.choices(correct, [shape(0, 0), shape(0, 1), shape(1, 0), shape(1, 1), shape(2, 0), "4" + par(inner(0)) + (rest ? M.op("+") + M.num(rest) : "")]));
    }
    // 2けた・3けたの自然数
    var kind = M.pick(["sum", "diff", "three", "minus-digits"]);
    var lead = "十の位の数が " + m(VA) + "、一の位の数が " + m(VB) + " の2けたの自然数があります。";
    if (kind === "three") {
      var VC = v("c");
      return build({
        text: "百の位の数が " + m(VA) + "、十の位の数が " + m(VB) + "、一の位の数が " + m(VC) + " の3けたの自然数を表す式はどれですか。",
        explain: [
          "百の位の数は 100 が何個あるか、十の位の数は 10 が何個あるかを表します。",
          "たとえば 372 は " + mf("100 * 3 + 10 * 7 + 2") + " です。",
          "同じように、" + mf("100a + 10b + c") + " と表せます。" + mf("abc") + " と書くと、3つの数の積の意味になってしまいます。"
        ],
        choiceLayout: "stack",
        meta: { kind: "digits" }
      }, M.choices(f("100a + 10b + c"), [f("abc"), f("a + b + c"), f("100a + 10b + 10c"), f("10a + 10b + c")]));
    }
    var orig = M.poly([[10, VA], [1, VB]]), rev = M.poly([[10, VB], [1, VA]]);
    if (kind === "minus-digits") {
      var md = par(orig) + M.op("-") + par(M.poly([[1, VA], [1, VB]]));
      return build({
        text: lead + "この数から、各位の数の和をひいた差を表す式はどれですか。",
        math: m(md),
        explain: [
          "2けたの自然数は " + m(orig) + "、各位の数の和は " + mf("a + b") + " です。",
          m(md),
          m("=", M.poly([[10, VA], [1, VB], [-1, VA], [-1, VB]])),
          m("=", M.term(9, VA)) + " となり、この差は 9 の倍数です。"
        ],
        meta: { kind: "simplify-multi" }
      }, M.choices(M.term(9, VA), [M.term(11, VA), M.poly([[9, VA], [2, VB]]), M.poly([[9, VA], [-2, VB]]), M.term(10, VA)]));
    }
    var isSum = kind === "sum", expr2 = par(orig) + M.op(isSum ? "+" : "-") + par(rev);
    var ans = isSum ? "11" + par(f("a + b")) : "9" + par(f("a - b"));
    return build({
      text: lead + "この数と、十の位の数と一の位の数を入れかえた数との" + (isSum ? "和" : "差") + "を表す式はどれですか。",
      math: m(expr2),
      explain: [
        "もとの数は " + m(orig) + "、入れかえた数は " + m(rev) + " です。",
        m(expr2),
        m("=", isSum ? f("11a + 11b") : f("10a + b - 10b - a")),
        m("=", isSum ? "" : f("9a - 9b") + M.op("="), ans) + " となり、" + (isSum ? "この和は 11 の倍数です。" : "この差は 9 の倍数です。")
      ],
      meta: { kind: "simplify-multi" }
    }, M.choices(ans, isSum
      ? ["10" + par(f("a + b")), "11" + par(f("a - b")), f("11ab"), "2" + par(f("a + b"))]
      : ["9" + par(f("a + b")), "11" + par(f("a - b")), "10" + par(f("a - b")), f("9ab")]));
  }

  JHM.register("g2-expressions", {
    points: [
      "<b>単項式と多項式</b>: 数や文字の乗法だけでできた式が単項式、単項式の和の形の式が多項式です。かけ合わされている文字の個数を<b>次数</b>といいます。" + M.rule(mf("3x^2y")) + " の次数は 3。多項式では、各項の次数のうち最も大きいものが、その式の次数です。",
      "<b>多項式の加法・減法</b>: 同類項をまとめます。ひくときは、ひく式のすべての項の符号を変えます。" + M.rule(mf("(3x + 2y) - (x - 4y) = 2x + 6y")),
      "<b>単項式の乗法・除法</b>: 係数どうし、文字どうしを計算します。除法は分数の形にして約分します。" + M.rule(mf("3a * (-2b) = -6ab")) + "、" + M.rule(mf("6xy / 2x = 3y")),
      "<b>等式の変形</b>: 等式を「" + mf("y =") + " …」の形に変形することを、" + mf("y") + " について解くといいます。" + M.rule(mf("2x + y = 6")) + " → " + M.rule(mf("y = -2x + 6")),
      "<b>文字を使った説明</b>: " + mf("n") + " を整数とすると、偶数は " + M.rule(mf("2n")) + "、奇数は " + M.rule(mf("2n + 1")) + "。十の位が " + mf("a") + "、一の位が " + mf("b") + " の2けたの自然数は " + M.rule(mf("10a + b")) + "。"
    ],
    example: {
      title: mf("{2x - y/3} - {x - 3y/2}") + " を計算しなさい。",
      steps: [
        mf("{2x - y/3} - {x - 3y/2}"),
        mf("= {2(2x - y) - 3(x - 3y)/6}") + "(通分)",
        mf("= {4x - 2y - 3x + 9y/6}")
      ],
      result: mf("= {x + 7y/6}")
    },
    generators: [
      { id: "poly-add-sub", label: "多項式の加法・減法", make: genPolyAddSub },
      { id: "poly-scale", label: "数×多項式、分数の形の式", make: genPolyScale },
      { id: "monomial", label: "単項式の乗法・除法", make: genMonomial },
      { id: "value", label: "式の値", make: genValue },
      { id: "rearrange", label: "等式の変形", make: genRearrange },
      { id: "explain", label: "文字を使った説明", make: genExplain }
    ]
  });

  // =====================================================================
  // 2-2 連立方程式
  // =====================================================================

  // 式 ax + by = e。r = [a, b, e]
  function eq2(r) { return M.eqn(two(r[0], r[1]), r[2]); }
  function minLcm(r1, r2) { return Math.min(M.lcm(r1[0], r2[0]), M.lcm(r1[1], r2[1])); }
  // 加減法の途中式。r1, r2 = [a, b, e](係数はどれも 0 でないこと)。n1, n2 は式の呼び名
  function elimLines(r1, r2, n1, n2) {
    n1 = n1 || "①"; n2 = n2 || "②";
    var Lx = M.lcm(r1[0], r2[0]), Ly = M.lcm(r1[1], r2[1]);
    var j = Ly <= Lx ? 1 : 0, i = 1 - j, Lc = j === 1 ? Ly : Lx;       // j: 消去する文字、i: 残る文字
    var k1 = Lc / abs(r1[j]), k2 = Lc / abs(r2[j]);
    var s1 = r1.map(function (t) { return t * k1; }), s2 = r2.map(function (t) { return t * k2; });
    var sub = s1[j] === s2[j];
    var coef = sub ? s1[i] - s2[i] : s1[i] + s2[i], rhs = sub ? s1[2] - s2[2] : s1[2] + s2[2];
    var V = [X, Y], val = rhs / coef, lines = [];
    var name1 = n1 + (k1 > 1 ? " × " + k1 : ""), name2 = n2 + (k2 > 1 ? " × " + k2 : "");
    // ひいて消去するとき、残る文字の係数が負になるなら、ひく順を逆にして正の係数にする(−3x = −6 ではなく 3x = 6)
    var flip = sub && coef < 0;
    if (flip) { coef = -coef; rhs = -rhs; }
    var nameA = flip ? name2 : name1, nameB = flip ? name1 : name2;
    if (k1 === 1 && k2 === 1) lines.push(m(V[j]) + " の係数の絶対値が等しいので、そのまま " + m(V[j]) + " を消去します。");
    else lines.push(m(V[j]) + " の係数の絶対値を " + Lc + " にそろえて、" + m(V[j]) + " を消去します。");
    if (k1 > 1) lines.push(name1 + ": " + m(eq2(s1)));
    if (k2 > 1) lines.push(name2 + ": " + m(eq2(s2)));
    lines.push(nameA + (sub ? " − " : " + ") + nameB + " より " + m(M.term(coef, V[i]), "=", rhs) + (coef === 1 ? "" : "、" + m(V[i], "=", val)));
    var known = r1[i] * val, other = (r1[2] - known) / r1[j];
    lines.push("これを" + n1 + "に代入すると " + m(i === 0 ? M.poly([[known, ""], [r1[1], Y]]) : M.poly([[r1[0], X], [known, ""]]), "=", r1[2]));
    lines.push("したがって " + m(V[j], "=", other));
    lines.coef = coef;          // 1つの文字を消去したあとの係数(数が大きくなりすぎないかを見るため)
    // 途中式に出てくる数のうち、絶対値が最も大きいもの
    lines.maxAbs = Math.max.apply(null, s1.concat(s2, [coef, rhs, known]).map(abs));
    return lines;
  }
  var NAMING = "上の式を①、下の式を②とします。";

  // 加減法
  function genElimination() {
    var a, b, c, d, x0, y0, e, e2, lines;
    do {
      x0 = M.rand(-5, 5); y0 = M.rand(-5, 5);
      a = M.randNZ(-5, 5); b = M.randNZ(-5, 5); c = M.randNZ(-5, 5); d = M.randNZ(-5, 5);
      e = a * x0 + b * y0; e2 = c * x0 + d * y0;
      lines = a * d - b * c === 0 ? null : elimLines([a, b, e], [c, d, e2]);
    } while (!lines || abs(lines.coef) > 20 || lines.maxAbs > 100 || (x0 === 0 && y0 === 0) || abs(e) > 30 || abs(e2) > 30 || minLcm([a, b], [c, d]) > 12);
    return build({
      text: "次の連立方程式を解きなさい。",
      math: m(M.sys(eq2([a, b, e]), eq2([c, d, e2]))),
      explain: [NAMING].concat(lines, ["解は " + m(sol(x0, y0))]),
      choiceLayout: "stack",
      meta: { kind: "system" }
    }, solChoices(x0, y0));
  }

  // 代入法
  function genSubstitution() {
    var swap = Math.random() < 0.3;      // true なら「x = py + q」の形
    var UV = swap ? X : Y, WV = swap ? Y : X;
    var p, q, cu, cw, u0, w0, e;
    do {
      p = M.pick([-4, -3, -2, 2, 3, 4]); q = M.randNZ(-7, 7); w0 = M.randNZ(-5, 5); u0 = p * w0 + q;
      cu = M.randNZ(-4, 4); cw = M.randNZ(-5, 5); e = cu * u0 + cw * w0;
    } while (cw + cu * p === 0 || abs(u0) > 9 || abs(e) > 30);
    var inner = M.poly([[p, WV], [q, ""]]);
    var row1 = M.eqn(UV, inner), row2 = swap ? eq2([cu, cw, e]) : eq2([cw, cu, e]);
    var subHtml, expanded;
    if (swap) {
      subHtml = (cu === 1 ? "" : (cu === -1 ? M.MINUS : M.num(cu))) + par(inner) + M.op(sg(cw)) + M.term(abs(cw), WV);
      expanded = M.poly([[cu * p, WV], [cu * q, ""], [cw, WV]]);
    } else {
      subHtml = M.term(cw, WV) + M.op(sg(cu)) + (abs(cu) === 1 ? "" : M.num(abs(cu))) + par(inner);
      expanded = M.poly([[cw, WV], [cu * p, WV], [cu * q, ""]]);
    }
    var coef = cw + cu * p, rhs = e - cu * q;
    var x0 = swap ? u0 : w0, y0 = swap ? w0 : u0;
    return build({
      text: "次の連立方程式を解きなさい。",
      math: m(M.sys(row1, row2)),
      explain: [
        NAMING + "①を②に代入して、" + m(UV) + " を消去します。",
        m(subHtml, "=", e),
        m(expanded, "=", e),
        m(M.term(coef, WV), "=", rhs) + (coef === 1 ? "" : "、" + m(WV, "=", w0)),
        "これを①に代入すると " + m(UV, "=", p, "*", w0, sg(q), abs(q), "=", u0),
        "解は " + m(sol(x0, y0))
      ],
      choiceLayout: "stack",
      meta: { kind: "system" }
    }, solChoices(x0, y0));
  }

  // かっこ・分数・小数をふくむ連立方程式
  function genSysVarious() {
    var kind = M.pick(["paren", "frac", "decimal"]);
    var x0, y0, c, d, e2, r1, row1, pre, elim;
    function second() { c = M.randNZ(-4, 4); d = M.randNZ(-4, 4); e2 = c * x0 + d * y0; }
    // 加減法(genElimination)と同じ上限: 消去後の係数は 20 まで。途中式に 100 をこえる数を出さない
    function bad() {
      if (r1[0] * d - r1[1] * c === 0 || (x0 === 0 && y0 === 0) || abs(r1[2]) > 60 || abs(e2) > 30 || minLcm(r1, [c, d]) > 12) return true;
      elim = elimLines(r1, [c, d, e2], "①′", "②");
      return abs(elim.coef) > 20 || elim.maxAbs > 100;
    }
    if (kind === "paren") {
      var k, a, b, cc, onY, A1, B1;
      do {
        x0 = M.rand(-5, 5); y0 = M.rand(-5, 5);
        k = M.rand(2, 4); a = M.rand(1, 3); b = M.randNZ(-3, 3); cc = M.randNZ(-7, 7); onY = Math.random() < 0.5;
        A1 = k * a + (onY ? 0 : cc); B1 = k * b + (onY ? cc : 0);
        r1 = [A1, B1, A1 * x0 + B1 * y0];
        second();
      } while (A1 === 0 || B1 === 0 || abs(A1) > 7 || abs(B1) > 7 || abs(r1[2]) > 30 || bad());
      row1 = M.eqn(M.num(k) + par(two(a, b)) + M.op(sg(cc)) + M.term(abs(cc), onY ? Y : X), r1[2]);
      pre = "①のかっこをはずして整理すると " + m(eq2(r1)) + "(これを①′とします)";
    } else if (kind === "frac") {
      var p, q, ii, jj, s, Lc;
      do {
        p = M.pick([2, 3, 4, 5, 6]); q = M.pick([2, 3, 4, 5, 6]); ii = M.randNZ(-2, 2); jj = M.randNZ(-2, 2);
        s = M.pick(["+", "-"]); Lc = M.lcm(p, q);
        x0 = p * ii; y0 = q * jj;
        r1 = [Lc / p, (s === "+" ? 1 : -1) * Lc / q, Lc * (ii + (s === "+" ? jj : -jj))];
        second();
      } while (p === q || r1[2] === 0 || bad());
      row1 = M.eqn(M.frac(X, p) + M.op(s) + M.frac(Y, q), r1[2] / Lc);
      pre = "①の両辺に、分母の最小公倍数 " + Lc + " をかけると " + m(eq2(r1)) + "(これを①′とします)";
    } else {
      var a2, b2;
      do {
        x0 = M.rand(-5, 5); y0 = M.rand(-5, 5); a2 = M.randNZ(-5, 5); b2 = M.randNZ(-5, 5);
        r1 = [a2, b2, a2 * x0 + b2 * y0];
        second();
      } while (r1[2] === 0 || abs(r1[2]) > 30 || bad());
      row1 = M.eqn(two(a2 / 10, b2 / 10), M.num(r1[2] / 10));
      pre = "①の両辺を 10 倍して、係数を整数にすると " + m(eq2(r1)) + "(これを①′とします)";
    }
    return build({
      text: "次の連立方程式を解きなさい。",
      math: m(M.sys(row1, eq2([c, d, e2]))),
      explain: [NAMING, pre].concat(elim, ["解は " + m(sol(x0, y0))]),
      choiceLayout: "stack",
      meta: { kind: "system" }
    }, solChoices(x0, y0));
  }

  // A = B = C の形
  function genSysABC() {
    var a, b, c, d, x0, y0, k;
    do {
      x0 = M.rand(-5, 5); y0 = M.randNZ(-5, 5);
      a = M.randNZ(-5, 5); b = M.randNZ(-5, 5); c = M.randNZ(-5, 5);
      k = a * x0 + b * y0; d = (k - c * x0) / y0;
    } while (d !== Math.floor(d) || d === 0 || abs(d) > 5 || k === 0 || abs(k) > 25 || a * d - b * c === 0 || minLcm([a, b], [c, d]) > 12 || elimLines([a, b, k], [c, d, k]).maxAbs > 100);
    return build({
      text: "次の方程式を解きなさい。",
      math: m(two(a, b), "=", two(c, d), "=", k),
      explain: [
        mf("\\A = \\B = \\C") + " の形の方程式は、" + mf("\\A = \\C") + "、" + mf("\\B = \\C") + " の2つの式に分けて、連立方程式として解きます。",
        m(M.sys(eq2([a, b, k]), eq2([c, d, k]))),
        NAMING
      ].concat(elimLines([a, b, k], [c, d, k]), ["解は " + m(sol(x0, y0))]),
      choiceLayout: "stack",
      meta: { kind: "system-abc" }
    }, solChoices(x0, y0));
  }

  // 文章題
  function genSysWord() {
    var kind = M.pick(["count", "price", "speed"]);
    var x0, y0, ask, ans, lines;
    if (kind === "count") {
      var it = M.pick([["りんご", "みかん"], ["なし", "かき"], ["ケーキ", "プリン"], ["ドーナツ", "クッキー"]]);
      var a = M.pick([120, 150, 160, 180, 200]), b = M.pick([50, 60, 70, 80, 90, 100]);
      x0 = M.rand(2, 9);
      do { y0 = M.rand(2, 9); } while (y0 === x0);
      var n = x0 + y0, T = a * x0 + b * y0;
      ask = Math.random() < 0.5 ? 0 : 1; ans = ask === 0 ? x0 : y0;
      return build({
        text: "1個 " + a + " 円の" + it[0] + "と1個 " + b + " 円の" + it[1] + "を、合わせて " + n + " 個買ったところ、代金の合計は " + T + " 円でした。" + it[ask] + "は何個買いましたか。",
        explain: [
          it[0] + "を " + m(X) + " 個、" + it[1] + "を " + m(Y) + " 個買ったとして、個数と代金について式をつくります。",
          m(M.sys(eq2([1, 1, n]), eq2([a, b, T]))),
          NAMING + "② − ① × " + b + " より " + m(M.term(a - b, X), "=", T - b * n) + "、" + m(X, "=", x0),
          "①に代入して " + m(Y, "=", n, "-", x0, "=", y0),
          it[ask] + "は " + ans + " 個です(" + it[1 - ask] + "は " + (n - ans) + " 個)。"
        ],
        meta: { kind: "word-count" }
      }, M.numChoices(ans, [n - ans, n, ans + 1, ans - 1], { fmt: function (t) { return M.num(t) + " 個"; }, ok: function (t) { return t > 0; } }));
    }
    if (kind === "price") {
      var g = M.pick([["ノート", "冊", "鉛筆", "本"], ["りんご", "個", "みかん", "個"], ["ボールペン", "本", "消しゴム", "個"]]);
      var p, q, r, s;
      var T1, T2, el;
      x0 = M.rand(10, 20) * 10; y0 = M.rand(4, 9) * 10;
      do {
        p = M.rand(1, 5); q = M.rand(1, 5); r = M.rand(1, 5); s = M.rand(1, 5);
        T1 = p * x0 + q * y0; T2 = r * x0 + s * y0;
        el = p * s - q * r === 0 ? null : elimLines([p, q, T1], [r, s, T2]);
      } while (!el || abs(el.coef) > 9 || minLcm([p, q], [r, s]) > 6);
      ask = Math.random() < 0.5 ? 0 : 1; ans = ask === 0 ? x0 : y0;
      var set = function (c1, c2) { return g[0] + " " + c1 + " " + g[1] + "と" + g[2] + " " + c2 + " " + g[3]; };
      lines = [
        g[0] + "1" + g[1] + "の値段を " + m(X) + " 円、" + g[2] + "1" + g[3] + "の値段を " + m(Y) + " 円として、代金について式をつくります。",
        m(M.sys(eq2([p, q, T1]), eq2([r, s, T2]))),
        NAMING
      ].concat(el);
      lines.push(g[ask * 2] + "1" + g[ask * 2 + 1] + "の値段は " + ans + " 円です(" + g[2 - ask * 2] + "は " + (ask === 0 ? y0 : x0) + " 円)。");
      return build({
        text: set(p, q) + "を買うと " + T1 + " 円、" + set(r, s) + "を買うと " + T2 + " 円です。" + g[ask * 2] + "1" + g[ask * 2 + 1] + "の値段を求めなさい。",
        explain: lines,
        meta: { kind: "word-price" }
      }, M.numChoices(ans, [ask === 0 ? y0 : x0, ans + 10, ans - 10, ans + 20], { fmt: function (t) { return M.num(t) + " 円"; }, ok: function (t) { return t > 0; }, step: 10 }));
    }
    var sp = M.pick([[60, 120], [60, 150], [60, 180], [50, 150], [50, 100], [80, 160], [80, 200], [70, 140], [75, 150]]);
    var v1 = sp[0], v2 = sp[1], tw = M.rand(4, 15), tr = M.rand(2, 8);
    x0 = v1 * tw; y0 = v2 * tr;
    var dist = x0 + y0, time = tw + tr, Lc = M.lcm(v1, v2), A = Lc / v1, B = Lc / v2;
    ask = Math.random() < 0.6 ? 0 : 1; ans = ask === 0 ? x0 : y0;
    lines = [
      "歩いた道のりを " + m(X) + " m、走った道のりを " + m(Y) + " m として、道のりと時間について式をつくります(時間 = 道のり ÷ 速さ)。",
      m(M.sys(eq2([1, 1, dist]), M.eqn(M.frac(X, v1) + M.op("+") + M.frac(Y, v2), time))),
      NAMING + "②の両辺に " + Lc + " をかけると " + m(eq2([A, B, Lc * time])) + "(これを②′とします)"
    ].concat(elimLines([1, 1, dist], [A, B, Lc * time], "①", "②′"));
    lines.push((ask === 0 ? "歩いた" : "走った") + "道のりは " + ans + " m です(歩いた時間は " + tw + " 分、走った時間は " + tr + " 分)。");
    return build({
      text: "家から " + dist + " m はなれた駅まで行くのに、はじめは分速 " + v1 + " m で歩き、途中から分速 " + v2 + " m で走ったところ、全部で " + time + " 分かかりました。" + (ask === 0 ? "歩いた" : "走った") + "道のりは何 m ですか。",
      explain: lines,
      meta: { kind: "word-speed" }
    }, M.numChoices(ans, [dist - ans, v1 * time, dist / 2, ans + v1, ans - v1], { fmt: function (t) { return M.num(t) + " m"; }, ok: function (t) { return t > 0; }, step: 50 }));
  }

  JHM.register("g2-simultaneous-equations", {
    points: [
      "2つの文字をふくむ方程式を2つ組にしたものが<b>連立方程式</b>です。どちらの方程式も成り立たせる " + mf("x") + "、" + mf("y") + " の値の組が<b>解</b>です。",
      "<b>加減法</b>: 一方の文字の係数の絶対値をそろえ、左辺どうし・右辺どうしをたすかひくかして、その文字を消去します。",
      "<b>代入法</b>: 一方の式を他方の式に代入して、文字を消去します。" + M.rule(mf("y = 2x - 1")) + " を " + M.rule(mf("3x + y = 9")) + " に代入 → " + M.rule(mf("3x + (2x - 1) = 9")),
      "<b>いろいろな形</b>: かっこははずし、分数は両辺に分母の最小公倍数を、小数は 10 や 100 をかけて、係数を整数にします。" + M.rule(mf("\\A = \\B = \\C")) + " の形は、" + mf("\\A = \\C") + " と " + mf("\\B = \\C") + " に分けます。",
      "<b>文章題</b>: 何を " + mf("x") + "、" + mf("y") + " で表すかを決め、数量の関係から方程式を2つつくります。解が問題に合っているかを確かめます。"
    ],
    example: {
      title: "連立方程式 " + m(M.sys(f("2x + 3y = 12") + " …①", f("x - y = 1") + " …②")) + " を解きなさい。",
      steps: [
        "② × 3: " + mf("3x - 3y = 3"),
        "① + ② × 3 より " + mf("5x = 15") + "、" + mf("x = 3"),
        "②に代入して " + mf("3 - y = 1") + "、" + mf("y = 2")
      ],
      result: mf("x = 3, y = 2")
    },
    generators: [
      { id: "elimination", label: "加減法", make: genElimination },
      { id: "substitution", label: "代入法", make: genSubstitution },
      { id: "various", label: "かっこ・分数・小数をふくむ形", make: genSysVarious },
      { id: "abc", label: "A = B = C の形", make: genSysABC },
      { id: "word", label: "文章題", make: genSysWord }
    ]
  });

  // =====================================================================
  // 2-3 一次関数
  // =====================================================================

  var SLOPES2 = [[1, 1], [2, 1], [3, 1], [4, 1], [-1, 1], [-2, 1], [-3, 1], [-4, 1], [1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [3, 2], [-3, 2]];
  // 直線の式 y = (n/d)x + b
  function lineRhs(n, d, b) { return M.poly([[[n, d], X], [b, ""]]); }
  function lineEq(n, d, b) { return M.eqn(Y, lineRhs(n, d, b)); }
  // 「(n/d) × x」の代入の書き方。傾きが 1 や −1 のときは「1 ×」を書かない
  function slopeTimes(n, d, x) {
    if (n === d) return M.num(x);
    if (n === -d) return x < 0 ? M.MINUS + par(M.num(x)) : M.num(-x);
    return M.join(M.fracNum(n, d), "*", x);
  }
  // 直線の式の4択。list は誤答の [n, d, b]
  function lineChoices(n, d, b, list) {
    function h(t) { return !t || t[0] === 0 || t[1] === 0 || t[2] !== Math.floor(t[2]) ? null : lineEq(t[0], t[1], t[2]); }
    return M.choices(h([n, d, b]), list.map(h), function () {
      return h([n + M.pick([-1, 1, 2]), d, b + M.pick([-2, -1, 1, 2])]);
    });
  }

  // 変化の割合、y の増加量
  function genRate() {
    var sl = M.pick(SLOPES2), n = sl[0], d = sl[1], b = M.randNZ(-9, 9), kind = M.pick(["increase", "rate", "values"]);
    var aH = M.fracNum(n, d), eq = lineEq(n, d, b), p, q;
    if (kind === "increase") {
      var k = d * (d === 1 ? M.rand(2, 6) : M.rand(1, 4)), inc = n * k / d;
      return build({
        text: "次の一次関数で、" + m(X) + " の増加量が " + k + " のときの " + m(Y) + " の増加量を求めなさい。",
        math: m(eq),
        explain: [
          "一次関数 " + mf("y = ax + b") + " では、(" + m(Y) + " の増加量)= " + m(VA) + " ×(" + m(X) + " の増加量)です。",
          "変化の割合は " + m(aH) + " なので、",
          m(aH, "*", k, "=", inc)
        ],
        meta: { kind: "lin-increase" }
      }, M.numChoices(inc, [inc + b, -inc, k, n * k, n + k, inc - b]));
    }
    function rateChoices(wrongs) {
      return M.choices(aH, wrongs, function () { return M.fracNum(n + M.pick([-2, -1, 1, 2]), d); });
    }
    if (kind === "rate") {
      p = M.rand(-4, 3); q = p + M.rand(1, 5);
      return build({
        text: "次の一次関数で、" + m(X) + " の値が " + m(p) + " から " + m(q) + " まで増加するときの変化の割合を求めなさい。",
        math: m(eq),
        explain: [
          "一次関数 " + mf("y = ax + b") + " の変化の割合は一定で、" + m(X) + " の係数 " + m(VA) + " に等しくなります。",
          "どの範囲で調べても、変化の割合は " + m(aH) + " です。",
          "(" + m(X) + " の増加量は " + m(q, "-", p, "=", q - p) + "、" + m(Y) + " の増加量は " + m(aH, "*", q - p, "=", M.fracNum(n * (q - p), d)) + " です。)"
        ],
        meta: { kind: "lin-rate" }
      }, rateChoices([M.num(b), M.fracNum(n * (q - p), d), M.fracNum(d, n), M.fracNum(-n, d), M.num(q - p)]));
    }
    p = d * M.rand(-3, 2); q = p + d * M.rand(1, 3);
    var r = n * p / d + b, s = n * q / d + b;
    var raw = M.frac(M.num(s - r), M.num(q - p));
    return build({
      text: "ある一次関数で、" + m(X, "=", p) + " のとき " + m(Y, "=", r) + "、" + m(X, "=", q) + " のとき " + m(Y, "=", s) + " です。この一次関数の変化の割合を求めなさい。",
      explain: [
        "変化の割合 =(" + m(Y) + " の増加量)÷(" + m(X) + " の増加量)です。",
        m(X) + " の増加量は " + m(q, "-", p, "=", q - p) + "、" + m(Y) + " の増加量は " + m(s, "-", r, "=", s - r),
        // x の増加量が 1 のときは、分母 1 の分数にしないで、わり算の形で書く
        "変化の割合は " + (q - p === 1 ? m(s - r, "/", 1, "=", aH) : (raw === aH ? m(aH) : m(raw, "=", aH)))
      ],
      meta: { kind: "rate-values" }
    }, rateChoices([M.fracNum(d, n), M.num(s - r), M.fracNum(-n, d), q + p === 0 ? null : M.fracNum(s + r, q + p), M.num(q - p)]));
  }

  // 条件から直線の式を求める
  function genLineThrough() {
    var kind = M.pick(["slope-point", "two-points", "two-points", "parallel", "intercept-point"]);
    var sl = M.pick(SLOPES2), n = sl[0], d = sl[1], b, x1, y1, x2, y2, c, text, lines;
    do {
      b = M.randNZ(-7, 7); x1 = d * M.randNZ(-3, 3); y1 = n * x1 / d + b;
      x2 = x1 + d * M.randNZ(-3, 3); y2 = n * x2 / d + b;
    } while (abs(y1) > 9 || abs(x2) > 9 || abs(y2) > 9);
    var aH = M.fracNum(n, d), eq = lineEq(n, d, b), P1 = M.coord(x1, y1), P2 = M.coord(x2, y2);
    var general = M.eqn(Y, M.poly([[[n, d], X]]) + M.op("+") + VB);
    var subst = "点 " + m(P1) + " を通るので、" + m(X, "=", x1) + "、" + m(Y, "=", y1) + " を代入して " + m(y1, "=", slopeTimes(n, d, x1), "+", VB);
    var bLine = m(VB, "=", y1, "-", n * x1 / d, "=", b);
    var last = "したがって、" + m(eq);
    if (kind === "slope-point") {
      text = "傾きが " + m(aH) + " で、点 " + m(P1) + " を通る直線の式を求めなさい。";
      lines = ["傾きが " + m(aH) + " なので、求める式は " + m(general) + " と表せます。", subst, bLine, last];
    } else if (kind === "parallel") {
      do { c = M.randNZ(-7, 7); } while (c === b);
      text = "直線 " + m(lineEq(n, d, c)) + " に平行で、点 " + m(P1) + " を通る直線の式を求めなさい。";
      lines = ["平行な2直線は傾きが等しいので、求める式は " + m(general) + " と表せます。", subst, bLine, last];
    } else if (kind === "intercept-point") {
      text = "切片が " + m(b) + " で、点 " + m(P1) + " を通る直線の式を求めなさい。";
      lines = [
        "切片が " + m(b) + " なので、求める式は " + m(M.eqn(Y, M.poly([[1, VA + X], [b, ""]]))) + " と表せます。",
        "点 " + m(P1) + " を通るので、代入して " + m(y1, "=", M.term(x1, VA), sg(b), abs(b)),
        m(M.term(x1, VA), "=", y1 - b) + "、" + m(VA, "=", aH),
        last
      ];
    } else {
      text = "2点 " + m(P1) + "、" + m(P2) + " を通る直線の式を求めなさい。";
      lines = [
        "傾きは " + m(M.frac(M.join(y2, "-", y1), M.join(x2, "-", x1)), "=", aH) + " なので、求める式は " + m(general) + " と表せます。",
        subst, bLine, last
      ];
    }
    return build({ text: text, explain: lines, choiceLayout: "stack", meta: { kind: "lin-through" } },
      lineChoices(n, d, b, [[-n, d, b], [n, d, -b], [d, n, b], [n, d, y1], [n, d, y1 + n * x1 / d], [-n, d, -b]]));
  }

  // グラフから直線の式を読みとる(図つき)
  function genLineGraph() {
    var sl, n, d, b, px, py, sgn;
    do {
      sl = M.pick(SLOPES2); n = sl[0]; d = sl[1]; b = M.randNZ(-4, 4);
      sgn = M.pick([1, -1]); px = d * sgn; py = b + n * sgn;
      if (abs(py) > 5) { px = -px; py = b - n * sgn; }
    } while (abs(py) > 5);
    var from = px < 0 ? M.coord(px, py) : M.coord(0, b), to = px < 0 ? M.coord(0, b) : M.coord(px, py);
    return build({
      text: "図の直線の式を求めなさい(1目もりは 1)。",
      figure: M.plane({
        range: 5,
        label: "座標平面にかかれた、点 " + M.text(M.coord(0, b)) + " と点 " + M.text(M.coord(px, py)) + " を通る直線",
        items: [{ type: "line", a: n / d, b: b }]
      }),
      explain: [
        "グラフは " + m(Y) + " 軸と点 " + m(M.coord(0, b)) + " で交わるので、切片は " + m(b) + " です。",
        "点 " + m(from) + " から右へ " + d + " 進むと、" + (n > 0 ? "上" : "下") + "へ " + abs(n) + " 進んで点 " + m(to) + " を通るので、傾きは " + m(M.fracNum(n, d)) + " です。",
        "したがって、" + m(lineEq(n, d, b))
      ],
      choiceLayout: "stack",
      meta: { kind: "lin-graph" }
    }, lineChoices(n, d, b, [[-n, d, b], [n, d, -b], [d, n, b], d === 1 ? [b, 1, n] : null, [-n, d, -b], [d, n, -b]]));
  }

  // 2直線の交点
  function genIntersect() {
    var a1, a2, b1, b2, x0, y0;
    do {
      a1 = M.pick([-4, -3, -2, 2, 3, 4]); a2 = M.randNZ(-4, 4); x0 = M.randNZ(-5, 5); y0 = M.rand(-6, 6);
      b1 = y0 - a1 * x0; b2 = y0 - a2 * x0;
    } while (a1 === a2 || b1 === 0 || b2 === 0 || abs(b1) > 15 || abs(b2) > 15);
    var P = M.coord(x0, y0);
    return build({
      text: "2直線 " + m(lineEq(a1, 1, b1)) + "、" + m(lineEq(a2, 1, b2)) + " の交点の座標を求めなさい。",
      explain: [
        "交点の座標は、2つの式を連立方程式として解いた解です。" + m(Y) + " を消去します。",
        m(M.linear(a1, b1), "=", M.linear(a2, b2)),
        m(M.poly([[a1, X], [-a2, X]]), "=", b2, "-", b1),
        m(M.term(a1 - a2, X), "=", b2 - b1) + (a1 - a2 === 1 ? "" : "、" + m(X, "=", x0)),
        "1つ目の式に代入して " + m(Y, "=", a1, "*", x0, sg(b1), abs(b1), "=", y0),
        "交点の座標は " + m(P)
      ],
      meta: { kind: "lin-intersect" }
    }, M.choices(P, [M.coord(y0, x0), M.coord(-x0, y0), M.coord(x0, -y0), M.coord(x0, b1), M.coord(0, b1), M.coord(x0, y0 + 1)], function () {
      return M.coord(x0 + M.pick([-1, 0, 1]), y0 + M.pick([-2, -1, 1, 2]));
    }));
  }

  // 変域
  function genDomain() {
    var sl = M.pick([[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [3, 2], [-3, 2]]), n = sl[0], d = sl[1];
    var b = M.randNZ(-6, 6), p = d * M.rand(-3, 1), q = p + d * M.rand(1, 4);
    var fp = n * p / d + b, fq = n * q / d + b, lo = Math.min(fp, fq), hi = Math.max(fp, fq);
    function rng(l, h) { return M.join(l, "<=", Y, "<=", h); }
    var ap = n * p / d, aq = n * q / d;
    return build({
      text: "次の一次関数で、" + m(X) + " の変域が " + m(p, "<=", X, "<=", q) + " のとき、" + m(Y) + " の変域を求めなさい。",
      math: m(lineEq(n, d, b)),
      explain: [
        "変域の両端の " + m(X) + " の値を代入します。",
        m(X, "=", p) + " のとき " + m(Y, "=", slopeTimes(n, d, p), sg(b), abs(b), "=", fp),
        m(X, "=", q) + " のとき " + m(Y, "=", slopeTimes(n, d, q), sg(b), abs(b), "=", fq),
        (n < 0 ? "傾きが負なので、" + m(X) + " が増えると " + m(Y) + " は減ります。" : "") + "小さいほうを左に書いて、" + m(rng(lo, hi))
      ],
      choiceLayout: "stack",
      meta: { kind: "lin-domain" }
    }, M.choices(rng(lo, hi), [n < 0 ? rng(fp, fq) : null, rng(Math.min(ap, aq), Math.max(ap, aq)), rng(p, q), rng(-hi, -lo), lo - b < hi ? rng(lo - b, hi) : null], function () {
      var l2 = lo + M.pick([-2, -1, 0, 1]), h2 = hi + M.pick([-1, 0, 1, 2]);
      return l2 < h2 ? rng(l2, h2) : null;
    }));
  }

  var linearFixed = [
    {
      id: "choose-graph",
      text: "一次関数 " + mf("y = -2x + 3") + " のグラフは、図のア〜エのどれですか(1目もりは 1)。",
      figure: M.plane({
        range: 5,
        label: "座標平面にかかれた4本の直線。アは (0, 3) と (1, 5)、イは (0, 3) と (1, 1)、ウは (0, 3) と (2, 2)、エは (0, −3) と (1, −5) を通る",
        items: [
          { type: "line", a: 2, b: 3 }, { type: "line", a: -2, b: 3 }, { type: "line", a: -0.5, b: 3 }, { type: "line", a: -2, b: -3 },
          { type: "label", x: 1.3, y: 4.3, text: "ア", anchor: "start" },
          { type: "label", x: 3.9, y: -3.9, text: "イ", anchor: "start" },
          { type: "label", x: 4.3, y: 1.3, text: "ウ", anchor: "middle" },
          { type: "label", x: 1.1, y: -4.3, text: "エ", anchor: "start" }
        ]
      }),
      choices: ["イ", "ア", "ウ", "エ"],
      answer: 0,
      explain: [
        "切片が 3 なので、グラフは点 " + mf("(0, 3)") + " を通ります。これに合うのはア、イ、ウです。",
        "傾きが " + mf("-2") + " なので、右へ 1 進むと下へ 2 進みます。点 " + mf("(0, 3)") + " から点 " + mf("(1, 1)") + " へ進むのはイです。",
        "アは " + mf("y = 2x + 3") + "、ウは " + mf("y = -{1/2}x + 3") + "、エは " + mf("y = -2x - 3") + " のグラフです。"
      ]
    },
    {
      id: "read-system",
      text: "図は、2つの方程式 " + mf("x - y = 1") + "(実線)と " + mf("2x + y = 5") + "(点線)のグラフです。連立方程式 " + m(M.sys(f("x - y = 1"), f("2x + y = 5"))) + " の解を、グラフから求めなさい。",
      figure: M.plane({
        range: 5,
        label: "座標平面にかかれた2本の直線。実線は (0, −1) と (1, 0) を通り、点線は (0, 5) と (1, 3) を通る。2本は点 (2, 1) で交わる",
        items: [{ type: "line", a: -2, b: 5, cls: "fig-line-2" }, { type: "line", a: 1, b: -1 }]
      }),
      choices: [f("x = 2, y = 1"), f("x = 1, y = 2"), f("x = 2, y = -1"), f("x = 0, y = 5")],
      answer: 0,
      choiceLayout: "stack",
      explain: [
        "連立方程式の解は、2つの方程式のグラフの交点の座標です。",
        "2直線は点 " + mf("(2, 1)") + " で交わっているので、解は " + mf("x = 2, y = 1"),
        "確かめ: " + mf("2 - 1 = 1") + "、" + mf("2 * 2 + 1 = 5")
      ]
    },
    {
      id: "triangle-area",
      text: "図のように、直線 " + mf("y = -x + 4") + " が " + mf("x") + " 軸、" + mf("y") + " 軸と交わる点をそれぞれ A、B とします。△OAB の面積を求めなさい(O は原点、1目もりは 1)。",
      figure: M.plane({
        range: 5,
        label: "座標平面にかかれた直線 y = −x + 4。x 軸との交点が A、y 軸との交点が B で、三角形 OAB がぬられている",
        items: [
          { type: "polygon", points: [[0, 0], [4, 0], [0, 4]], cls: "fig-fill" },
          { type: "line", a: -1, b: 4 },
          { type: "point", x: 4, y: 0, label: "A", dx: 4, dy: -8 },
          { type: "point", x: 0, y: 4, label: "B", dx: 8, dy: -4 }
        ]
      }),
      choices: ["8", "16", "4", "12"],
      answer: 0,
      explain: [
        "A は " + mf("x") + " 軸上の点なので、" + mf("y = 0") + " を代入して " + mf("0 = -x + 4") + "、" + mf("x = 4") + "。A" + mf("(4, 0)"),
        "B は切片なので、B" + mf("(0, 4)"),
        "底辺 OA = 4、高さ OB = 4 なので、面積は " + mf("{1/2} * 4 * 4 = 8")
      ]
    },
    {
      id: "graph-statement",
      text: "一次関数 " + mf("y = -3x + 4") + " について、正しいものはどれですか。",
      textChoices: true,
      choices: [
        "グラフは右下がりの直線で、" + mf("y") + " 軸と点 " + mf("(0, 4)") + " で交わる",
        "グラフは右上がりの直線で、" + mf("y") + " 軸と点 " + mf("(0, 4)") + " で交わる",
        mf("x") + " の値が 1 増えると、" + mf("y") + " の値は 4 増える",
        "グラフは原点を通る"
      ],
      answer: 0,
      explain: [
        mf("y = ax + b") + " のグラフは、傾き " + mf("a") + "、切片 " + mf("b") + " の直線です。",
        "傾きが " + mf("-3") + " で負なので右下がり、切片が 4 なので点 " + mf("(0, 4)") + " を通ります。",
        mf("x") + " の値が 1 増えると、" + mf("y") + " の値は 3 減ります。"
      ]
    },
    {
      id: "equation-graph",
      text: "方程式 " + mf("2x + 3y = 6") + " のグラフの傾きと切片を答えなさい。",
      textChoices: true,
      choices: [
        "傾き " + mf("-{2/3}") + "、切片 " + mf("2"),
        "傾き " + mf("{2/3}") + "、切片 " + mf("2"),
        "傾き " + mf("-2") + "、切片 " + mf("6"),
        "傾き " + mf("-{3/2}") + "、切片 " + mf("3")
      ],
      answer: 0,
      explain: [
        mf("y") + " について解いて、" + mf("y = ax + b") + " の形にします。",
        mf("3y = -2x + 6"),
        mf("y = -{2/3}x + 2") + " なので、傾きは " + mf("-{2/3}") + "、切片は 2 です。"
      ]
    },
    {
      id: "spring",
      text: "長さ 12 cm のばねがあり、おもりの重さが 10 g 増えるごとに 2 cm ずつのびます。" + mf("x") + " g のおもりをつるしたときのばねの長さを " + mf("y") + " cm として、" + mf("y") + " を " + mf("x") + " の式で表しなさい。",
      choices: [f("y = {1/5}x + 12"), f("y = 2x + 12"), f("y = 5x + 12"), f("y = {1/5}x")],
      answer: 0,
      choiceLayout: "stack",
      explain: [
        "1 g あたりののびは " + mf("2 / 10 = {1/5}") + "(cm)で、これが変化の割合です。",
        "おもりをつるさないとき(" + mf("x = 0") + ")の長さは 12 cm で、これが切片です。",
        "したがって、" + mf("y = {1/5}x + 12")
      ]
    },
    {
      id: "horizontal-line",
      text: "方程式 " + mf("y = 3") + " のグラフは、どんな直線ですか。",
      textChoices: true,
      choices: [
        "点 " + mf("(0, 3)") + " を通り、" + mf("x") + " 軸に平行な直線",
        "点 " + mf("(3, 0)") + " を通り、" + mf("y") + " 軸に平行な直線",
        "点 " + mf("(3, 0)") + " を通り、" + mf("x") + " 軸に垂直な直線",
        "原点と点 " + mf("(1, 3)") + " を通る直線"
      ],
      answer: 0,
      explain: [
        mf("y = 3") + " は、" + mf("x") + " がどんな値でも " + mf("y") + " の値が 3 であることを表します。",
        "点 " + mf("(0, 3)") + "、" + mf("(1, 3)") + "、" + mf("(2, 3)") + " … を通るので、" + mf("x") + " 軸に平行な直線です。",
        mf("x = 3") + " のグラフなら、点 " + mf("(3, 0)") + " を通り、" + mf("y") + " 軸に平行な直線になります。"
      ]
    },
    {
      id: "which-linear",
      text: "次のうち、" + mf("y") + " が " + mf("x") + " の一次関数であるものはどれですか。",
      textChoices: true,
      choices: [
        "1本 " + mf("x") + " 円の鉛筆 5 本と、100 円の消しゴム1個を買ったときの代金 " + mf("y") + " 円",
        "面積が 20 cm<sup>2</sup> の長方形の、縦の長さ " + mf("x") + " cm と横の長さ " + mf("y") + " cm",
        "1辺が " + mf("x") + " cm の正方形の面積 " + mf("y") + " cm<sup>2</sup>",
        "半径が " + mf("x") + " cm の円の面積 " + mf("y") + " cm<sup>2</sup>"
      ],
      answer: 0,
      explain: [
        "式に表して、" + mf("y = ax + b") + " の形(" + mf("y") + " が " + mf("x") + " の一次式)になるものをさがします。",
        "鉛筆と消しゴム: " + mf("y = 5x + 100") + "(一次関数)",
        "長方形: " + mf("y = {20/x}") + "(反比例)、正方形: " + mf("y = x^2") + "、円: " + mf("y = πx^2") + "(どちらも一次式ではない)"
      ]
    }
  ];

  JHM.register("g2-linear-functions", {
    points: [
      mf("y") + " が " + mf("x") + " の一次式で表されるとき、" + mf("y") + " は " + mf("x") + " の<b>一次関数</b>であるといいます。" + M.rule(mf("y = ax + b")) + "(" + mf("b = 0") + " のときが比例)",
      "<b>変化の割合</b>: " + M.rule(mf("{y 'の増加量'/x 'の増加量'} = a")) + " で、一次関数ではいつも一定です。" + mf("y") + " の増加量は " + mf("a") + " ×(" + mf("x") + " の増加量)。",
      "<b>グラフ</b>: 傾き " + mf("a") + "、切片 " + mf("b") + " の直線。" + mf("a > 0") + " なら右上がり、" + mf("a < 0") + " なら右下がり。平行な2直線は傾きが等しくなります。",
      "<b>直線の式の求め方</b>: 傾きと1点、または2点の座標を " + mf("y = ax + b") + " に代入して、" + mf("a") + "、" + mf("b") + " の値を求めます。",
      "<b>方程式とグラフ</b>: " + mf("ax + by = c") + " のグラフは直線で、2直線の交点の座標は連立方程式の解です。" + mf("y = k") + " のグラフは " + mf("x") + " 軸に、" + mf("x = h") + " のグラフは " + mf("y") + " 軸に平行です。"
    ],
    example: {
      title: "2点 " + mf("(1, 3)") + "、" + mf("(3, 7)") + " を通る直線の式を求めなさい。",
      steps: [
        "傾き: " + mf("{7 - 3/3 - 1} = 2") + " なので " + mf("y = 2x + b"),
        mf("x = 1") + "、" + mf("y = 3") + " を代入して " + mf("3 = 2 * 1 + b"),
        mf("b = 1")
      ],
      result: mf("y = 2x + 1")
    },
    figure: {
      html: M.plane({
        range: 5,
        label: "一次関数 y = 2x + 1 のグラフ。点 (0, 1) で y 軸と交わり、右へ 1 進むと上へ 2 進む",
        items: [
          { type: "segment", x1: 0, y1: 1, x2: 1, y2: 1, cls: "fig-line-2" },
          { type: "segment", x1: 1, y1: 1, x2: 1, y2: 3, cls: "fig-line-2" },
          { type: "line", a: 2, b: 1 },
          { type: "point", x: 0, y: 1, label: "切片 1", dx: -8, dy: -4, anchor: "end" },
          { type: "label", x: 0.5, y: 0.25, text: "1" },
          { type: "label", x: 1.25, y: 1.8, text: "2", anchor: "start" },
          { type: "label", x: 2, y: 3.5, text: fig.v("y") + " = 2" + fig.v("x") + " + 1", anchor: "start" }
        ]
      }),
      caption: "y = 2x + 1 のグラフ。切片は 1、傾きは 2(右へ 1 進むと上へ 2 進む)。"
    },
    generators: [
      { id: "rate", label: "変化の割合と増加量", make: genRate },
      { id: "line-through", label: "条件から直線の式を求める", make: genLineThrough },
      { id: "line-graph", label: "グラフから式を読みとる", make: genLineGraph },
      { id: "intersection", label: "2直線の交点", make: genIntersect },
      { id: "domain", label: "変域", make: genDomain }
    ],
    fixed: linearFixed
  });

  // =====================================================================
  // 図形の図をかくための道具(点は [x, y]。y は下向きが正)
  // =====================================================================
  function unit(P, Q) {
    var dx = Q[0] - P[0], dy = Q[1] - P[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / len, dy / len];
  }
  function mid(P, Q) { return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; }
  function seg(P, Q, cls) { return fig.line(P[0], P[1], Q[0], Q[1], cls); }
  // 点 P の近くに文字を書く
  function lab(P, str, dx, dy, anchor, cls) { return fig.text(P[0] + (dx || 0), P[1] + (dy || 0), str, anchor || "middle", cls); }
  // P から Q を見た向き(度。右が 0°、反時計回り)
  function dirDeg(P, Q) { return Math.atan2(P[1] - Q[1], Q[0] - P[0]) * 180 / Math.PI; }
  // 角の印。P が頂点、A・B は2辺の上の点。r は弧の半径、label は書きこみ、lr は書きこみまでの距離
  function angleMark(P, A, B, r, label, lr) {
    var a = dirDeg(P, A), b = dirDeg(P, B), t;
    var sweep = ((b - a) % 360 + 360) % 360;
    if (sweep > 180) { t = a; a = b; b = t; sweep = 360 - sweep; }
    var s = fig.arc(P[0], P[1], r, a, a + sweep, "fig-axis");
    if (label) {
      var q = fig.polar(P[0], P[1], lr || r + 14, a + sweep / 2);
      s += fig.text(q[0], q[1] + 4.5, label, "middle");
    }
    return s;
  }
  // 直角の印
  function rightMark(P, A, B, size) {
    var u = unit(P, A), w = unit(P, B), k = size || 10;
    return fig.poly([[P[0] + u[0] * k, P[1] + u[1] * k], [P[0] + (u[0] + w[0]) * k, P[1] + (u[1] + w[1]) * k], [P[0] + w[0] * k, P[1] + w[1] * k]], "fig-axis", false);
  }
  // 等しい辺の印(線分の真ん中に n 本の短い線)
  function tick(P, Q, n) {
    var c = mid(P, Q), u = unit(P, Q), s = "", i, o;
    n = n || 1;
    for (i = 0; i < n; i++) {
      o = (i - (n - 1) / 2) * 5;
      s += fig.line(c[0] + u[0] * o + u[1] * 5, c[1] + u[1] * o - u[0] * 5, c[0] + u[0] * o - u[1] * 5, c[1] + u[1] * o + u[0] * 5, "fig-axis");
    }
    return s;
  }
  // 底辺 BC(水平)と両端の角(度)から、頂点 A の位置を求める
  function apex(B, C, angB, angC) {
    var tb = Math.tan(angB * Math.PI / 180), tc = Math.tan(angC * Math.PI / 180);
    var h = (C[0] - B[0]) / (1 / tb + 1 / tc);
    return [B[0] + h / tb, B[1] - h];
  }
  var ANGLE_X = "∠" + mf("x");
  var VX = fig.v("x");

  // =====================================================================
  // 2-4 平行と合同
  // =====================================================================

  // 2直線が交わる図(対頂角)
  var crossFig = (function () {
    var O = [130, 88];
    var a = fig.polar(130, 88, 112, 15), a2 = fig.polar(130, 88, 112, 195), b = fig.polar(130, 88, 84, 70), b2 = fig.polar(130, 88, 84, 250);
    var s = seg(a, a2) + seg(b, b2);
    s += angleMark(O, a, b, 24, "55°", 43) + angleMark(O, a2, b2, 24, VX, 39);
    return M.svg(260, 176, "交わる2直線。交点のまわりの角の1つが 55° で、その向かい側の角が x", s);
  })();

  // 平行線 ℓ、m と、それに交わる直線。mode: "alt"(錯角) "co"(同じ側の内側の角) "ref"(要点帳用)
  function parallelFig(mode) {
    var yl = 52, ym = 124, t = Math.tan(65 * Math.PI / 180);
    var Q = [108, ym], P = [108 + (ym - yl) / t, yl];
    var top = [P[0] + 38 / t, yl - 38], bot = [Q[0] - 38 / t, ym + 38];
    var L0 = [24, yl], L1 = [226, yl], M0 = [24, ym], M1 = [226, ym];
    var s = seg(L0, L1) + seg(M0, M1) + seg(top, bot);
    s += lab(L1, fig.v("ℓ"), 12, 5) + lab(M1, fig.v("m"), 12, 5);
    var label;
    if (mode === "ref") {
      s += angleMark(Q, M1, P, 20, fig.v("a"), 34) + angleMark(P, L1, top, 20, fig.v("b"), 34) + angleMark(P, L0, Q, 20, fig.v("c"), 34);
      label = "平行な2直線 ℓ、m に1本の直線が交わっている。m との交点の右上の角が a、ℓ との交点の右上の角が b、ℓ との交点の左下の角が c";
    } else {
      s += angleMark(Q, M1, P, 20, "65°", 38);
      if (mode === "alt") {
        s += angleMark(P, L0, Q, 20, VX, 34);
        label = "平行な2直線 ℓ、m に1本の直線が交わっている。m との交点の右上の角が 65°、ℓ との交点の左下の角が x";
      } else {
        s += angleMark(P, L1, Q, 16, VX, 30);
        label = "平行な2直線 ℓ、m に1本の直線が交わっている。m との交点の右上の角が 65°、ℓ との交点の右下の角が x";
      }
    }
    return M.svg(260, 176, label, s);
  }

  // 平行線の間で折れ曲がる線
  var zigzagFig = (function () {
    var A = [70, 40], B = [80, 140], P = [139.7, 80.3];
    var s = fig.line(24, 40, 226, 40) + fig.line(24, 140, 226, 140) + seg(A, P) + seg(P, B);
    s += lab([226, 40], fig.v("ℓ"), 12, 5) + lab([226, 140], fig.v("m"), 12, 5);
    s += angleMark(A, [226, 40], P, 34, "30°", 56) + angleMark(B, [226, 140], P, 26, "45°", 46) + angleMark(P, A, B, 16, VX, 31);
    s += lab(A, "A", 0, -8) + lab(B, "B", 0, 17) + lab(P, "P", 10, 5, "start");
    return M.svg(260, 172, "平行な2直線 ℓ、m。ℓ 上の点 A と m 上の点 B を、間の点 P で折れ曲がる線で結んでいる。A での角が 30°、B での角が 45°、P での角が x", s);
  })();

  // 三角形の図。angB・angC は底辺の両端の角(度)。marks: { A, B, C, ext } は角の書きこみ。ext があれば BC を D までのばす
  function triangleFig(B, C, angB, angC, marks, label) {
    var A = apex(B, C, angB, angC), s = fig.poly([A, B, C]);
    if (marks.ext) {
      var D = [C[0] + 58, C[1]];
      s += seg(C, D) + lab(D, "D", 6, 13, "start") + angleMark(C, D, A, 18, marks.ext, 34);
    }
    if (marks.A) s += angleMark(A, B, C, 20, marks.A, 38);
    if (marks.B) s += angleMark(B, C, A, 22, marks.B, angB < 50 ? 46 : 40);
    if (marks.C) s += angleMark(C, B, A, 20, marks.C, 37);
    s += lab(A, "A", 0, -8) + lab(B, "B", -6, 13, "end") + lab(C, "C", marks.ext ? 0 : 6, marks.ext ? 16 : 13, marks.ext ? "middle" : "start");
    return M.svg(260, 172, label, s);
  }

  // 合同な2つの三角形(2組の辺とその間の角)
  var sasFig = (function () {
    function one(ox, names) {
      var B = [ox + 18, 142], C = [ox + 118, 142], A = [ox + 71.5, 78.2];
      var s = fig.poly([A, B, C]) + angleMark(B, C, A, 18, "50°", 36);
      s += lab(A, names[0], 0, -8) + lab(B, names[1], -4, 14, "end") + lab(C, names[2], 4, 14, "start");
      s += lab(mid(A, B), "5 cm", -8, -2, "end") + lab(mid(B, C), "6 cm", 0, 16);
      return s;
    }
    // 2つの三角形の間を広くあける(DE の「5 cm」が AC の長さに見えないように)
    return M.svg(298, 168, "2つの三角形 ABC と DEF。AB = DE = 5 cm、BC = EF = 6 cm、角 B = 角 E = 50°", one(0, ["A", "B", "C"]) + one(160, ["D", "E", "F"]));
  })();

  // 線分 AB と CD が点 O で交わる図
  var crossSegFig = (function () {
    var A = [40, 38], B = [220, 132], C = [64, 140], D = [196, 30], O = [130, 85];
    var s = seg(A, B) + seg(C, D) + seg(A, C) + seg(B, D);
    s += tick(A, O, 1) + tick(O, B, 1) + tick(C, O, 2) + tick(O, D, 2);
    s += lab(A, "A", -8, 2, "end") + lab(B, "B", 8, 8, "start") + lab(C, "C", -8, 10, "end") + lab(D, "D", 8, 0, "start") + lab(O, "O", 0, 23);
    return M.svg(260, 168, "線分 AB と CD が点 O で交わっている。AO = BO、CO = DO の印がついていて、A と C、B と D を結んで2つの三角形ができている", s);
  })();

  var CONGRUENCE = ["3組の辺がそれぞれ等しい", "2組の辺とその間の角がそれぞれ等しい", "1組の辺とその両端の角がそれぞれ等しい"];

  var parallelFixed = [
    {
      id: "vertical-angles",
      text: "図のように2直線が交わっています。" + ANGLE_X + " の大きさを求めなさい。",
      figure: crossFig,
      choices: ["55°", "125°", "35°", "110°"],
      answer: 0,
      explain: [
        "向かい合っている2つの角を対頂角といいます。対頂角は等しくなります。",
        "したがって、" + ANGLE_X + " = 55° です。",
        "となりの角は " + mf("180° - 55° = 125°") + " です。"
      ]
    },
    {
      id: "alternate-angles",
      text: "図で、" + mf("\\ℓ ∥ m") + " のとき、" + ANGLE_X + " の大きさを求めなさい。",
      figure: parallelFig("alt"),
      choices: ["65°", "115°", "25°", "130°"],
      answer: 0,
      explain: [
        "65° の角と " + ANGLE_X + " は、錯角の位置にあります。",
        "平行線の錯角は等しいので、" + ANGLE_X + " = 65° です。"
      ]
    },
    {
      id: "co-interior",
      text: "図で、" + mf("\\ℓ ∥ m") + " のとき、" + ANGLE_X + " の大きさを求めなさい。",
      figure: parallelFig("co"),
      choices: ["115°", "65°", "25°", "125°"],
      answer: 0,
      explain: [
        "平行線の同位角は等しいので、" + mf("\\ℓ") + " との交点の右上の角は 65° です。",
        ANGLE_X + " はそのとなりの角で、合わせて一直線(180°)になります。",
        mf("180° - 65° = 115°")
      ]
    },
    {
      id: "zigzag",
      text: "図で、" + mf("\\ℓ ∥ m") + " のとき、" + ANGLE_X + " の大きさを求めなさい。",
      figure: zigzagFig,
      choices: ["75°", "15°", "105°", "60°"],
      answer: 0,
      explain: [
        "点 P を通り、" + mf("\\ℓ") + " に平行な直線をひいて、" + ANGLE_X + " を上下2つの角に分けます。",
        "平行線の錯角は等しいので、上の角は 30°、下の角は 45° です。",
        mf("30° + 45° = 75°")
      ]
    },
    {
      id: "triangle-interior",
      text: "図の △ABC で、" + ANGLE_X + " の大きさを求めなさい。",
      figure: triangleFig([40, 150], [210, 150], 50, 60, { A: VX, B: "50°", C: "60°" }, "三角形 ABC。角 B が 50°、角 C が 60°、角 A が x"),
      choices: ["70°", "110°", "60°", "80°"],
      answer: 0,
      explain: [
        "三角形の内角の和は 180° です。",
        mf("180° - (50° + 60°) = 70°")
      ]
    },
    {
      id: "triangle-exterior",
      text: "図の △ABC で、辺 BC を C のほうへのばした直線上に点 D をとります。" + ANGLE_X + "(∠ACD)の大きさを求めなさい。",
      figure: triangleFig([30, 150], [185, 150], 45, 65, { A: "70°", B: "45°", ext: VX }, "三角形 ABC。角 A が 70°、角 B が 45°。辺 BC を C のほうへのばした先に点 D があり、角 ACD が x"),
      choices: ["115°", "65°", "105°", "135°"],
      answer: 0,
      explain: [
        "三角形の外角は、それととなり合わない2つの内角の和に等しくなります。",
        mf("70° + 45° = 115°"),
        "(∠ACB を先に求めて " + mf("180° - 65° = 115°") + " としても同じです。)"
      ]
    },
    {
      id: "polygon-interior-sum",
      text: "六角形の内角の和を求めなさい。",
      choices: ["720°", "1080°", "540°", "360°"],
      answer: 0,
      explain: [
        mf("n") + " 角形の内角の和は " + mf("180° * (n - 2)") + " です(1つの頂点からひいた対角線で、" + mf("n - 2") + " 個の三角形に分けられます)。",
        mf("180° * (6 - 2) = 720°")
      ]
    },
    {
      id: "regular-octagon",
      text: "正八角形の1つの内角の大きさを求めなさい。",
      choices: ["135°", "45°", "120°", "144°"],
      answer: 0,
      explain: [
        "多角形の外角の和は 360° なので、正八角形の1つの外角は " + mf("360° / 8 = 45°") + " です。",
        "内角と外角の和は 180° なので、1つの内角は " + mf("180° - 45° = 135°"),
        "(内角の和 " + mf("180° * (8 - 2) = 1080°") + " を 8 でわっても求められます。)"
      ]
    },
    {
      id: "which-regular-polygon",
      text: "1つの外角の大きさが 40° である正多角形は、正何角形ですか。",
      textChoices: true,
      choices: ["正九角形", "正八角形", "正十角形", "正六角形"],
      answer: 0,
      explain: [
        "多角形の外角の和は、何角形でも 360° です。",
        "正多角形の外角はすべて等しいので、頂点の数は " + mf("360° / 40° = 9"),
        "したがって、正九角形です。"
      ]
    },
    {
      id: "triangle-type",
      text: "2つの内角が 35°、45° である三角形は、どんな三角形ですか。",
      textChoices: true,
      choices: ["鈍角三角形", "鋭角三角形", "直角三角形", "二等辺三角形"],
      answer: 0,
      explain: [
        "残りの内角は " + mf("180° - (35° + 45°) = 100°") + " です。",
        "90° より大きい角(鈍角)が1つあるので、鈍角三角形です。",
        "3つの角がすべて鋭角なら鋭角三角形、1つの角が直角なら直角三角形です。"
      ]
    },
    {
      id: "condition-from-figure",
      text: "図の △ABC と △DEF は合同です。このとき使う三角形の合同条件はどれですか。",
      figure: sasFig,
      textChoices: true,
      choices: [CONGRUENCE[1], CONGRUENCE[0], CONGRUENCE[2], "2組の角がそれぞれ等しい"],
      answer: 0,
      explain: [
        "AB = DE(5 cm)、BC = EF(6 cm)で、2組の辺がそれぞれ等しくなっています。",
        "∠B = ∠E(50°)は、その2辺の間の角です。",
        "したがって「2組の辺とその間の角がそれぞれ等しい」が使えます。"
      ]
    },
    {
      id: "not-always-congruent",
      text: "△ABC と △DEF で、次の条件のうち、2つの三角形が合同であるとはかぎらないものはどれですか。",
      textChoices: true,
      choices: [
        "AB = DE、BC = EF、∠A = ∠D",
        "AB = DE、BC = EF、CA = FD",
        "AB = DE、BC = EF、∠B = ∠E",
        "BC = EF、∠B = ∠E、∠C = ∠F"
      ],
      answer: 0,
      explain: [
        "∠A、∠D は、等しい2組の辺(AB と BC、DE と EF)の間の角ではありません。",
        "2組の辺と、その間にない角が等しくても、合同になるとはかぎりません。",
        "ほかの3つは、それぞれ「3組の辺」「2組の辺とその間の角」「1組の辺とその両端の角」にあたります。"
      ]
    },
    {
      id: "proof-with-vertical-angles",
      text: "図で、線分 AB と CD は点 O で交わり、AO = BO、CO = DO です。△AOC ≡ △BOD を証明するときに使う合同条件はどれですか。",
      figure: crossSegFig,
      textChoices: true,
      choices: [CONGRUENCE[1], CONGRUENCE[0], CONGRUENCE[2], "2組の角がそれぞれ等しい"],
      answer: 0,
      explain: [
        "仮定から、AO = BO、CO = DO です。",
        "対頂角は等しいので、∠AOC = ∠BOD です。これは等しい2組の辺の間の角です。",
        "したがって「2組の辺とその間の角がそれぞれ等しい」から、△AOC ≡ △BOD がいえます。"
      ]
    },
    {
      id: "hypothesis",
      text: "「△ABC ≡ △DEF ならば、∠A = ∠D である」ということがらの仮定はどれですか。",
      textChoices: true,
      choices: ["△ABC ≡ △DEF", "∠A = ∠D", "AB = DE", "△ABC と △DEF の面積は等しい"],
      answer: 0,
      explain: [
        "「〇〇ならば、□□である」で、〇〇の部分を仮定、□□の部分を結論といいます。",
        "仮定は「△ABC ≡ △DEF」、結論は「∠A = ∠D」です。",
        "証明では、仮定から出発し、すでに正しいとわかっていることがらを根拠にして、結論を導きます。"
      ]
    }
  ];

  JHM.register("g2-parallel-congruence", {
    points: [
      "<b>対頂角</b>は等しくなります。2直線が平行ならば、<b>同位角・錯角</b>は等しくなります。逆に、同位角か錯角が等しければ、2直線は平行です。",
      "<b>三角形の角</b>: 内角の和は 180°。外角は、それととなり合わない2つの内角の和に等しくなります。",
      "<b>多角形の角</b>: " + mf("n") + " 角形の内角の和は " + M.rule(mf("180° * (n - 2)")) + "、外角の和は何角形でも " + M.rule("360°") + "。",
      "<b>三角形の合同条件</b>: ① 3組の辺 ② 2組の辺とその間の角 ③ 1組の辺とその両端の角 が、それぞれ等しい。合同は " + M.rule("△ABC ≡ △DEF") + " のように、対応する頂点の順に書きます。",
      "<b>証明</b>: 「〇〇ならば、□□である」の〇〇が<b>仮定</b>、□□が<b>結論</b>。仮定から出発し、根拠を示しながら結論を導きます。"
    ],
    example: {
      title: "正十角形の1つの内角の大きさを求めなさい。",
      steps: [
        "内角の和: " + mf("180° * (10 - 2) = 1440°"),
        "1つの内角: " + mf("1440° / 10 = 144°"),
        "(別の解き方)1つの外角は " + mf("360° / 10 = 36°") + " なので、" + mf("180° - 36° = 144°")
      ],
      result: "144°"
    },
    figure: {
      html: parallelFig("ref"),
      caption: "ℓ ∥ m のとき、同位角(∠a と ∠b)、錯角(∠a と ∠c)は等しい。∠b と ∠c は対頂角。"
    },
    fixed: parallelFixed
  });

  // =====================================================================
  // 2-5 三角形と四角形
  // =====================================================================

  // AB = AC の二等辺三角形。apexDeg は頂角。marks: { A, B } は角の書きこみ
  function isoscelesFig(apexDeg, marks, label) {
    var base = (180 - apexDeg) / 2, B = [80, 150], C = [180, 150], A = apex(B, C, base, base);
    var s = fig.poly([A, B, C]) + tick(A, B, 1) + tick(A, C, 1);
    if (marks.A) s += angleMark(A, B, C, 22, marks.A, 42);
    if (marks.B) s += angleMark(B, C, A, 20, marks.B, 35);
    s += lab(A, "A", 0, -8) + lab(B, "B", -6, 13, "end") + lab(C, "C", 6, 13, "start");
    return M.svg(260, 172, label, s);
  }
  // 二等辺三角形の頂点の外角
  var isoExteriorFig = (function () {
    var B = [60, 150], C = [180, 150], A = apex(B, C, 55, 55), u = unit(B, A), D = [A[0] + u[0] * 46, A[1] + u[1] * 46];
    var s = fig.poly([A, B, C]) + seg(A, D) + tick(A, B, 1) + tick(A, C, 1);
    s += angleMark(A, D, C, 16, "110°", 38) + angleMark(B, C, A, 20, VX, 35);
    s += lab(A, "A", -10, 2, "end") + lab(B, "B", -6, 13, "end") + lab(C, "C", 6, 13, "start") + lab(D, "D", 8, 2, "start");
    return M.svg(260, 172, "AB = AC の二等辺三角形 ABC。辺 BA を A のほうへのばした先に点 D があり、角 DAC が 110°、角 B が x", s);
  })();
  // 二等辺三角形の頂角の二等分線
  var bisectorFig = (function () {
    var A = [130, 30], B = [62, 150], C = [198, 150], D = [130, 150];
    var s = fig.poly([A, B, C]) + seg(A, D, "fig-line-2") + tick(A, B, 1) + tick(A, C, 1);
    s += angleMark(A, B, D, 26) + angleMark(A, D, C, 31);
    s += lab(A, "A", 0, -8) + lab(B, "B", -6, 13, "end") + lab(C, "C", 6, 13, "start") + lab(D, "D", 0, 16);
    return M.svg(260, 172, "AB = AC の二等辺三角形 ABC。頂角 A の二等分線が辺 BC と点 D で交わっている", s);
  })();
  // 合同な2つの直角三角形(斜辺と1つの鋭角)
  var rightTrianglesFig = (function () {
    function one(ox, names) {
      var B = [ox + 20, 142], C = [ox + 110, 142], A = [ox + 110, 79];
      var s = fig.poly([A, B, C]) + rightMark(C, B, A, 9) + angleMark(B, C, A, 26, "35°", 53);
      s += lab(A, names[0], 0, -8) + lab(B, names[1], -4, 14, "end") + lab(C, names[2], 4, 14, "start");
      s += lab(mid(A, B), "8 cm", -6, -7, "end");
      return s;
    }
    return M.svg(280, 166, "2つの直角三角形 ABC と DEF。角 C と角 F が直角で、斜辺 AB = DE = 8 cm、角 B = 角 E = 35°", one(0, ["A", "B", "C"]) + one(142, ["D", "E", "F"]));
  })();
  // 平行四辺形 ABCD(∠A = 110°)。mode: "angle"(角) "diagonal"(対角線) "ref"(要点帳用)
  function parallelogramFig(mode) {
    var A = [70, 38], D = [232, 38], B = [33.6, 138], C = [195.6, 138], O = mid(A, C);
    var s = fig.poly([A, B, C, D]), label;
    if (mode === "angle") {
      s += angleMark(A, D, B, 18, "110°", 39) + angleMark(B, C, A, 20, VX, 35);
      label = "平行四辺形 ABCD。角 A が 110°、角 B が x";
    } else {
      s += seg(A, C) + seg(B, D) + lab(O, "O", 0, 23);
      label = "平行四辺形 ABCD。対角線 AC と BD が点 O で交わっている";
      if (mode === "ref") {
        s += tick(A, B, 1) + tick(D, C, 1) + tick(A, D, 2) + tick(B, C, 2);
        label += "。向かい合う辺に、等しいことを表す印がついている";
      }
    }
    s += lab(A, "A", -6, -6, "end") + lab(D, "D", 6, -6, "start") + lab(B, "B", -6, 14, "end") + lab(C, "C", 6, 14, "start");
    return M.svg(264, 162, label, s);
  }
  // AD ∥ BC の台形と対角線
  var trapezoidFig = (function () {
    var A = [90, 40], D = [190, 40], B = [40, 138], C = [232, 138], O = [138.6, 73.6];
    var s = fig.poly([A, B, C, D]) + seg(A, C) + seg(B, D);
    s += lab(A, "A", -6, -6, "end") + lab(D, "D", 6, -6, "start") + lab(B, "B", -6, 14, "end") + lab(C, "C", 6, 14, "start") + lab(O, "O", 0, -9);
    return M.svg(264, 162, "AD と BC が平行な台形 ABCD。対角線 AC と BD が点 O で交わっている", s);
  })();

  var triQuadFixed = [
    {
      id: "isosceles-base-angle",
      text: "図は AB = AC の二等辺三角形です。" + ANGLE_X + " の大きさを求めなさい。",
      figure: isoscelesFig(50, { A: "50°", B: VX }, "AB = AC の二等辺三角形 ABC。頂角 A が 50°、底角 B が x"),
      choices: ["65°", "50°", "130°", "80°"],
      answer: 0,
      explain: [
        "二等辺三角形の2つの底角は等しくなります(∠B = ∠C)。",
        "内角の和は 180° なので、底角2つ分は " + mf("180° - 50° = 130°"),
        mf("130° / 2 = 65°")
      ]
    },
    {
      id: "isosceles-exterior",
      text: "図は AB = AC の二等辺三角形で、点 D は辺 BA を A のほうへのばした直線上にあります。∠DAC = 110° のとき、" + ANGLE_X + " の大きさを求めなさい。",
      figure: isoExteriorFig,
      choices: ["55°", "70°", "110°", "35°"],
      answer: 0,
      explain: [
        "三角形の外角は、それととなり合わない2つの内角の和に等しいので、∠B + ∠C = 110° です。",
        "二等辺三角形の底角は等しいので、∠B = ∠C です。",
        mf("110° / 2 = 55°")
      ]
    },
    {
      id: "isosceles-definition",
      text: "二等辺三角形の定義はどれですか。",
      textChoices: true,
      choices: ["2辺が等しい三角形", "2つの角が等しい三角形", "3辺が等しい三角形", "頂角の二等分線が底辺を垂直に2等分する三角形"],
      answer: 0,
      explain: [
        "ことばの意味をはっきり述べたものを定義といいます。二等辺三角形の定義は「2辺が等しい三角形」です。",
        "「2つの底角は等しい」「頂角の二等分線は底辺を垂直に2等分する」は、定義から証明される性質(定理)です。",
        "「3辺が等しい三角形」は正三角形の定義です。"
      ]
    },
    {
      id: "apex-bisector",
      text: "図は AB = AC の二等辺三角形で、∠A の二等分線と辺 BC の交点を D とします。BC = 8 cm のとき、正しいものはどれですか。",
      figure: bisectorFig,
      textChoices: true,
      choices: ["BD = 4 cm、∠ADB = 90°", "BD = 4 cm、∠ADB = 60°", "BD = 8 cm、∠ADB = 90°", "BD = 2 cm、∠ADB = 45°"],
      answer: 0,
      explain: [
        "二等辺三角形の頂角の二等分線は、底辺を垂直に2等分します。",
        "BD = DC なので、BD = " + mf("8 / 2 = 4") + "(cm)",
        "AD ⊥ BC なので、∠ADB = 90° です。"
      ]
    },
    {
      id: "right-triangle-congruence",
      text: "図の △ABC と △DEF は、∠C = ∠F = 90° の直角三角形です。この2つが合同であることをいうときに使う合同条件はどれですか。",
      figure: rightTrianglesFig,
      textChoices: true,
      choices: ["直角三角形の斜辺と1つの鋭角がそれぞれ等しい", "直角三角形の斜辺と他の1辺がそれぞれ等しい", "3組の辺がそれぞれ等しい", "2組の辺とその間の角がそれぞれ等しい"],
      answer: 0,
      explain: [
        "直角に向かい合う辺が斜辺です。AB = DE(8 cm)で、斜辺が等しくなっています。",
        "∠B = ∠E(35°)で、1つの鋭角が等しくなっています。",
        "直角三角形の合同条件は「斜辺と1つの鋭角」「斜辺と他の1辺」がそれぞれ等しい、の2つです。"
      ]
    },
    {
      id: "parallelogram-angle",
      text: "図の平行四辺形 ABCD で、" + ANGLE_X + " の大きさを求めなさい。",
      figure: parallelogramFig("angle"),
      choices: ["70°", "110°", "55°", "90°"],
      answer: 0,
      explain: [
        "AD ∥ BC なので、となり合う角 ∠A と ∠B の和は 180° です。",
        mf("180° - 110° = 70°"),
        "(平行四辺形の対角は等しいので、∠C = 110°、∠D = 70° です。)"
      ]
    },
    {
      id: "parallelogram-diagonal",
      text: "図の平行四辺形 ABCD で、対角線の交点を O とします。AC = 10 cm、BD = 14 cm のとき、AO の長さを求めなさい。",
      figure: parallelogramFig("diagonal"),
      choices: ["5 cm", "7 cm", "10 cm", "12 cm"],
      answer: 0,
      explain: [
        "平行四辺形の対角線は、それぞれの中点で交わります。",
        "AO は AC の半分なので、" + mf("10 / 2 = 5") + "(cm)",
        "(BO は BD の半分で、" + mf("14 / 2 = 7") + "(cm)です。)"
      ]
    },
    {
      id: "parallelogram-condition",
      text: "四角形 ABCD について、次のうち、平行四辺形になるとはかぎらないものはどれですか。",
      textChoices: true,
      choices: [
        "1組の対辺が平行で、もう1組の対辺の長さが等しい",
        "2組の対辺がそれぞれ等しい",
        "対角線がそれぞれの中点で交わる",
        "1組の対辺が平行で、その長さが等しい"
      ],
      answer: 0,
      explain: [
        "「1組の対辺が平行で、もう1組の対辺の長さが等しい」四角形には、等脚台形のように平行四辺形でないものもあります。",
        "平行四辺形になる条件は、「2組の対辺がそれぞれ平行」「2組の対辺がそれぞれ等しい」「2組の対角がそれぞれ等しい」「対角線がそれぞれの中点で交わる」「1組の対辺が平行でその長さが等しい」の5つです。"
      ]
    },
    {
      id: "rhombus",
      text: "平行四辺形 ABCD に「対角線が垂直に交わる(AC ⊥ BD)」という条件を加えると、どんな四角形になりますか。",
      textChoices: true,
      choices: ["ひし形", "長方形", "正方形", "台形"],
      answer: 0,
      explain: [
        "ひし形の対角線は、垂直に交わります。逆に、対角線が垂直に交わる平行四辺形はひし形です。",
        "長方形の対角線は、長さが等しくなります。",
        "正方形は、長方形でもひし形でもあるので、対角線は長さが等しく、垂直に交わります。"
      ]
    },
    {
      id: "rectangle",
      text: "平行四辺形 ABCD に「対角線の長さが等しい(AC = BD)」という条件を加えると、どんな四角形になりますか。",
      textChoices: true,
      choices: ["長方形", "ひし形", "正方形", "台形"],
      answer: 0,
      explain: [
        "長方形の対角線は、長さが等しくなります。逆に、対角線の長さが等しい平行四辺形は長方形です。",
        "ひし形になるのは、対角線が垂直に交わるとき(または、となり合う辺が等しいとき)です。",
        "両方の条件がそろうと、正方形になります。"
      ]
    },
    {
      id: "equal-area",
      text: "図の四角形 ABCD は、AD ∥ BC の台形です。△ABC と面積が等しい三角形はどれですか。",
      figure: trapezoidFig,
      choices: ["△DBC", "△ABD", "△ACD", "△OBC"],
      answer: 0,
      explain: [
        "△ABC と △DBC は、底辺 BC が共通です。",
        "AD ∥ BC なので、頂点 A、D から BC までの距離(高さ)は等しくなります。",
        "底辺と高さが等しいので、△ABC = △DBC(面積が等しい)です。"
      ]
    },
    {
      id: "converse",
      text: "「△ABC で、AB = AC ならば ∠B = ∠C である」の逆はどれですか。",
      textChoices: true,
      choices: [
        "△ABC で、∠B = ∠C ならば AB = AC である",
        "△ABC で、AB = AC でないならば ∠B = ∠C でない",
        "△ABC で、AB = AC ならば ∠A = ∠B である",
        "△ABC で、∠B = ∠C でないならば AB = AC である"
      ],
      answer: 0,
      explain: [
        "あることがらの仮定と結論を入れかえたものを、そのことがらの逆といいます。",
        "仮定「AB = AC」と結論「∠B = ∠C」を入れかえると、「∠B = ∠C ならば AB = AC」になります。",
        "この逆は正しいことがらです(2つの角が等しい三角形は二等辺三角形)。"
      ]
    },
    {
      id: "converse-false",
      text: "次のことがらのうち、逆が正しくないものはどれですか。",
      textChoices: true,
      choices: [
        "2つの三角形が合同ならば、面積は等しい",
        "△ABC で、AB = AC ならば ∠B = ∠C である",
        "四角形が平行四辺形ならば、2組の対辺はそれぞれ等しい",
        "△ABC が正三角形ならば、3つの角は等しい"
      ],
      answer: 0,
      explain: [
        "「2つの三角形の面積が等しいならば、合同である」は正しくありません。",
        "たとえば、底辺 4 cm・高さ 3 cm の三角形と、底辺 6 cm・高さ 2 cm の三角形は、面積が等しくても合同ではありません(反例)。",
        "正しいことがらでも、その逆が正しいとはかぎりません。ほかの3つは、逆も正しいことがらです。"
      ]
    }
  ];

  JHM.register("g2-triangles-quadrilaterals", {
    points: [
      "<b>二等辺三角形</b>(定義: 2辺が等しい三角形): 2つの底角は等しい。頂角の二等分線は、底辺を垂直に2等分する。2つの角が等しい三角形は、二等辺三角形である。",
      "<b>直角三角形の合同条件</b>: ① 斜辺と1つの鋭角 ② 斜辺と他の1辺 が、それぞれ等しい。",
      "<b>平行四辺形</b>(定義: 2組の対辺がそれぞれ平行な四角形): 2組の対辺はそれぞれ等しい。2組の対角はそれぞれ等しい。対角線はそれぞれの中点で交わる。",
      "<b>平行四辺形になる条件</b>: 上の定義と3つの性質のどれか、または「1組の対辺が平行でその長さが等しい」。長方形は対角線の長さが等しく、ひし形は対角線が垂直に交わり、正方形はその両方が成り立ちます。",
      "<b>等積変形と逆</b>: 底辺が共通で、高さが等しい三角形は面積が等しい。仮定と結論を入れかえたものを<b>逆</b>といい、正しいことがらの逆が正しいとはかぎりません。"
    ],
    example: {
      title: "AB = AC の二等辺三角形 ABC で、∠A = 40° のとき、∠B の大きさを求めなさい。",
      steps: [
        "二等辺三角形の底角は等しいので、∠B = ∠C",
        "底角2つ分は " + mf("180° - 40° = 140°"),
        mf("140° / 2 = 70°")
      ],
      result: "∠B = 70°"
    },
    figure: {
      html: parallelogramFig("ref"),
      caption: "平行四辺形 ABCD。向かい合う辺は等しく、対角線はそれぞれの中点 O で交わる。"
    },
    fixed: triQuadFixed
  });

  // =====================================================================
  // 2-6 確率
  // =====================================================================

  // 2枚の硬貨の樹形図
  var coinTree = (function () {
    var x1 = 58, x2 = 142, x3 = 216, small = "fig-label fig-small";
    var s = fig.text(x1, 16, "1枚目", "middle", small) + fig.text(x2, 16, "2枚目", "middle", small) + fig.text(x3, 16, "結果", "middle", small);
    [[56, "表"], [120, "裏"]].forEach(function (a) {
      s += fig.text(x1, a[0] + 5, a[1], "middle");
      [[-17, "表"], [17, "裏"]].forEach(function (b) {
        var y = a[0] + b[0];
        s += fig.line(x1 + 14, a[0], x2 - 14, y, "fig-axis") + fig.text(x2, y + 5, b[1], "middle");
        s += fig.text(x3, y + 4, "(" + a[1] + ", " + b[1] + ")", "middle", small);
      });
    });
    return M.svg(264, 150, "2枚の硬貨を投げるときの樹形図。1枚目が表か裏、それぞれについて2枚目が表か裏で、(表, 表)(表, 裏)(裏, 表)(裏, 裏)の4通り", s);
  })();
  // 2つのさいころの目の数の和の表
  var diceSumTable = (function () {
    var x0 = 12, y0 = 8, hw = 44, cw = 33, rh = 22, small = "fig-label fig-small", s = "", i, j;
    var w = hw + cw * 6, h = rh * 7;
    s += fig.rect(x0, y0, w, rh, "fig-fill") + fig.rect(x0, y0, hw, h, "fig-fill");
    for (i = 0; i <= 7; i++) s += fig.line(x0, y0 + rh * i, x0 + w, y0 + rh * i, "fig-grid");
    s += fig.line(x0, y0, x0, y0 + h, "fig-grid");
    for (j = 0; j <= 6; j++) s += fig.line(x0 + hw + cw * j, y0, x0 + hw + cw * j, y0 + h, "fig-grid");
    s += fig.text(x0 + hw / 2, y0 + 15, "大＼小", "middle", small);
    for (j = 1; j <= 6; j++) s += fig.text(x0 + hw + cw * (j - 0.5), y0 + 15, String(j), "middle", small);
    for (i = 1; i <= 6; i++) {
      s += fig.text(x0 + hw / 2, y0 + rh * i + 15, String(i), "middle", small);
      for (j = 1; j <= 6; j++) s += fig.text(x0 + hw + cw * (j - 0.5), y0 + rh * i + 16, String(i + j), "middle");
    }
    return M.svg(x0 * 2 + w, y0 * 2 + h, "大小2つのさいころの目の数の和の表。たてが大きいさいころの目(1〜6)、横が小さいさいころの目(1〜6)で、36 個のますに和が書いてある", s);
  })();
  function pr(n, d) { return M.fracNum(n, d); }
  var LOTS = "5本のうち2本があたりのくじがあります。A さんが先に1本ひき、ひいたくじをもどさずに、続けて B さんが1本ひきます。";

  var probFixed = [
    {
      id: "one-die",
      text: "1つのさいころを投げるとき、3 の倍数の目が出る確率を求めなさい。",
      choices: [pr(1, 3), pr(1, 2), pr(1, 6), pr(2, 3)],
      answer: 0,
      explain: [
        "目の出方は全部で 6 通りで、どれも同様に確からしいといえます。",
        "3 の倍数の目は 3、6 の 2 通りです。",
        mf("{2/6} = {1/3}")
      ]
    },
    {
      id: "two-dice-sum",
      text: "大小2つのさいころを同時に投げるとき、出る目の数の和が 8 になる確率を求めなさい。表は、目の数の和をまとめたものです。",
      figure: diceSumTable,
      choices: [pr(5, 36), pr(1, 6), pr(1, 9), pr(2, 9)],
      answer: 0,
      explain: [
        "目の出方は全部で " + mf("6 * 6 = 36") + "(通り)です。",
        "和が 8 になるのは、(大, 小)=(2, 6)、(3, 5)、(4, 4)、(5, 3)、(6, 2)の 5 通りです。",
        "確率は " + mf("{5/36}")
      ]
    },
    {
      id: "two-dice-same",
      text: "2つのさいころを同時に投げるとき、同じ目が出る確率を求めなさい。",
      choices: [pr(1, 6), pr(1, 36), pr(1, 12), pr(1, 3)],
      answer: 0,
      explain: [
        "目の出方は全部で " + mf("6 * 6 = 36") + "(通り)です。",
        "同じ目が出るのは、(1, 1)、(2, 2)、…、(6, 6)の 6 通りです。",
        mf("{6/36} = {1/6}")
      ]
    },
    {
      id: "two-dice-product-odd",
      text: "2つのさいころを同時に投げるとき、出る目の数の積が奇数になる確率を求めなさい。",
      choices: [pr(1, 4), pr(1, 2), pr(3, 4), pr(1, 3)],
      answer: 0,
      explain: [
        "積が奇数になるのは、2つとも奇数の目(1、3、5)が出るときだけです。",
        "その場合は " + mf("3 * 3 = 9") + "(通り)、全部の場合は 36 通りです。",
        mf("{9/36} = {1/4}")
      ]
    },
    {
      id: "two-coins",
      text: "2枚の硬貨を同時に投げるとき、1枚が表で1枚が裏になる確率を求めなさい。図は、表と裏の出方を表した樹形図です。",
      figure: coinTree,
      choices: [pr(1, 2), pr(1, 3), pr(1, 4), pr(2, 3)],
      answer: 0,
      explain: [
        "表と裏の出方は、(表, 表)、(表, 裏)、(裏, 表)、(裏, 裏)の 4 通りで、どれも同様に確からしいといえます。",
        "1枚が表で1枚が裏になるのは、(表, 裏)、(裏, 表)の 2 通りです。",
        mf("{2/4} = {1/2}") + "(「2枚とも表・1枚ずつ・2枚とも裏」の 3 通りと数えるのは誤りです。)"
      ]
    },
    {
      id: "three-coins",
      text: "3枚の硬貨を同時に投げるとき、少なくとも1枚は表が出る確率を求めなさい。",
      choices: [pr(7, 8), pr(1, 8), pr(3, 8), pr(1, 2)],
      answer: 0,
      explain: [
        "表と裏の出方は全部で " + mf("2 * 2 * 2 = 8") + "(通り)です。",
        "「少なくとも1枚は表」にならないのは、3枚とも裏の 1 通りだけで、その確率は " + mf("{1/8}") + " です。",
        mf("1 - {1/8} = {7/8}")
      ]
    },
    {
      id: "lots-both",
      text: LOTS + "2人ともあたる確率を求めなさい。",
      choices: [pr(1, 10), pr(4, 25), pr(1, 5), pr(2, 5)],
      answer: 0,
      explain: [
        "くじを区別して考えます。2人のひき方は全部で " + mf("5 * 4 = 20") + "(通り)です。",
        "2人ともあたるひき方は " + mf("2 * 1 = 2") + "(通り)です。",
        mf("{2/20} = {1/10}")
      ]
    },
    {
      id: "lots-second",
      text: LOTS + "B さんがあたる確率を求めなさい。",
      choices: [pr(2, 5), pr(1, 2), pr(1, 4), pr(3, 10)],
      answer: 0,
      explain: [
        "2人のひき方は全部で " + mf("5 * 4 = 20") + "(通り)です。",
        "B さんがあたるのは、A さんがあたりのとき " + mf("2 * 1 = 2") + "(通り)、A さんがはずれのとき " + mf("3 * 2 = 6") + "(通り)です。",
        mf("{2 + 6/20} = {8/20} = {2/5}") + "(先にひく A さんがあたる確率も " + mf("{2/5}") + " で、ひく順番によるちがいはありません。)"
      ]
    },
    {
      id: "balls-both-red",
      text: "袋の中に、赤玉が 3 個、白玉が 2 個入っています。この袋から同時に 2 個の玉を取り出すとき、2 個とも赤玉である確率を求めなさい。",
      choices: [pr(3, 10), pr(9, 25), pr(3, 5), pr(1, 10)],
      answer: 0,
      explain: [
        "赤玉を 赤1、赤2、赤3、白玉を 白1、白2 と区別します。2 個の組は全部で 10 通りです。",
        "2 個とも赤玉の組は、(赤1, 赤2)、(赤1, 赤3)、(赤2, 赤3)の 3 通りです。",
        "確率は " + mf("{3/10}")
      ]
    },
    {
      id: "balls-at-least-white",
      text: "袋の中に、赤玉が 3 個、白玉が 2 個入っています。この袋から同時に 2 個の玉を取り出すとき、少なくとも 1 個は白玉である確率を求めなさい。",
      choices: [pr(7, 10), pr(3, 10), pr(2, 5), pr(3, 5)],
      answer: 0,
      explain: [
        "「少なくとも 1 個は白玉」にならないのは、2 個とも赤玉のときです。",
        "2 個の組は全部で 10 通り、2 個とも赤玉の組は 3 通りなので、その確率は " + mf("{3/10}") + " です。",
        mf("1 - {3/10} = {7/10}")
      ]
    },
    {
      id: "cards-number",
      text: "1、2、3、4 の数字を1つずつ書いた4枚のカードがあります。このカードから2枚をひいて並べ、2けたの整数をつくるとき、3 の倍数になる確率を求めなさい。",
      choices: [pr(1, 3), pr(1, 4), pr(1, 2), pr(1, 6)],
      answer: 0,
      explain: [
        "十の位は 4 通り、一の位は残りの 3 通りなので、できる整数は " + mf("4 * 3 = 12") + "(通り)です。",
        "3 の倍数は 12、21、24、42 の 4 通りです。",
        mf("{4/12} = {1/3}")
      ]
    },
    {
      id: "committee",
      text: "A、B、C、D の4人の中から、くじで2人の委員を選びます。A が選ばれる確率を求めなさい。",
      choices: [pr(1, 2), pr(1, 4), pr(1, 3), pr(1, 6)],
      answer: 0,
      explain: [
        "2人の選び方は、{A, B}、{A, C}、{A, D}、{B, C}、{B, D}、{C, D} の 6 通りです(順番は考えません)。",
        "A がふくまれるのは 3 通りです。",
        mf("{3/6} = {1/2}")
      ]
    },
    {
      id: "impossible",
      text: "1つのさいころを投げるとき、7 の目が出る確率を求めなさい。",
      choices: ["0", pr(1, 6), pr(1, 7), "1"],
      answer: 0,
      explain: [
        "さいころに 7 の目はないので、7 の目が出る場合は 0 通りです。",
        "決して起こらないことがらの確率は 0、かならず起こることがらの確率は 1 です。",
        "確率 " + mf("p") + " の範囲は " + mf("0 <= p <= 1") + " です。"
      ]
    },
    {
      id: "complement",
      text: "あるくじをひくとき、あたる確率は " + mf("{3/20}") + " です。このくじをひいて、はずれる確率を求めなさい。",
      choices: [pr(17, 20), pr(3, 20), pr(1, 20), pr(7, 20)],
      answer: 0,
      explain: [
        "あることがらの起こる確率が " + mf("p") + " のとき、それが起こらない確率は " + mf("1 - p") + " です。",
        mf("1 - {3/20} = {17/20}")
      ]
    },
    {
      id: "equally-likely",
      text: "確率を考えるときの「同様に確からしい」とは、どんな意味ですか。",
      textChoices: true,
      choices: [
        "どの場合が起こることも、同じ程度に期待できること",
        "どの場合も、かならず1回ずつ起こること",
        "ある場合が、ほかの場合より起こりやすいこと",
        "実験をくり返すと、結果がいつも同じになること"
      ],
      answer: 0,
      explain: [
        "正しくつくられたさいころでは、1 から 6 のどの目が出ることも、同じ程度に期待できます。これを「同様に確からしい」といいます。",
        "起こりうるすべての場合が同様に確からしいときに、(あてはまる場合の数)÷(全部の場合の数)で確率を求められます。"
      ]
    }
  ];

  JHM.register("g2-probability", {
    points: [
      "<b>確率の求め方</b>: 起こりうる場合が全部で " + mf("n") + " 通りあり、どれも同様に確からしいとき、ことがら A の起こる場合が " + mf("a") + " 通りなら、A の起こる確率は " + M.rule(mf("p = {a/n}")),
      "<b>確率の範囲</b>: " + M.rule(mf("0 <= p <= 1")) + "。かならず起こることがらの確率は 1、決して起こらないことがらの確率は 0 です。",
      "<b>場合の数え方</b>: 樹形図や表を使って、もれなく、重なりなく数えます。さいころ2個は " + mf("6 * 6 = 36") + " 通り、硬貨2枚は " + mf("2 * 2 = 4") + " 通り。同じ色の玉やくじも、1つずつ区別して数えます。",
      "<b>起こらない確率</b>: A の起こる確率が " + mf("p") + " のとき、A の起こらない確率は " + M.rule(mf("1 - p")) + "。「少なくとも1つは…」の確率は、1 から「1つも…ない」確率をひいて求めます。"
    ],
    example: {
      title: "2つのさいころを同時に投げるとき、出る目の数の和が 5 になる確率を求めなさい。",
      steps: [
        "目の出方は全部で " + mf("6 * 6 = 36") + "(通り)",
        "和が 5 になるのは、(1, 4)、(2, 3)、(3, 2)、(4, 1)の 4 通り",
        mf("{4/36}")
      ],
      result: mf("= {1/9}")
    },
    figure: {
      html: coinTree,
      caption: "2枚の硬貨を投げるときの樹形図。出方は全部で 4 通り。"
    },
    fixed: probFixed
  });

  // =====================================================================
  // 2-7 箱ひげ図
  // =====================================================================

  // 箱ひげ図。opts:
  //   min, max: 軸の範囲   step: たての目もり線の間隔   labelEvery: 数字を書く間隔(省略時 step)
  //   boxes: [{ label: 左に書く名前, d: [最小値, 第1四分位数, 中央値, 第3四分位数, 最大値] }, …]
  //   unit: 軸の単位   label: 読み上げ用の説明   left: 左の余白(名前が長いとき。省略時は M.histogram と同じ 34)
  function boxPlot(opts) {
    var w = 290, left = opts.left || 34, right = 44, rowH = 34, top = 10;
    var n = opts.boxes.length, axisY = top + rowH * n + 4, h = axisY + 26;
    var every = Math.round((opts.labelEvery || opts.step) / opts.step), count = Math.round((opts.max - opts.min) / opts.step);
    function PX(val) { return left + (w - left - right) * (val - opts.min) / (opts.max - opts.min); }
    var s = "", i;
    for (i = 0; i <= count; i++) {
      var t = opts.min + opts.step * i;
      s += fig.line(PX(t), top, PX(t), axisY, "fig-grid");
      if (i % every === 0) s += fig.text(PX(t), axisY + 15, M.num(t), "middle", "fig-label fig-small");
    }
    s += fig.line(left - 4, axisY, w - right + 6, axisY, "fig-axis");
    if (opts.unit) s += fig.text(w - 2, axisY + 15, "(" + M.esc(opts.unit) + ")", "end", "fig-label fig-small");
    opts.boxes.forEach(function (b, k) {
      var cy = top + rowH * k + rowH / 2, d = b.d, hh = 9;
      s += fig.line(PX(d[0]), cy, PX(d[1]), cy) + fig.line(PX(d[3]), cy, PX(d[4]), cy);
      s += fig.line(PX(d[0]), cy - 5, PX(d[0]), cy + 5) + fig.line(PX(d[4]), cy - 5, PX(d[4]), cy + 5);
      s += fig.rect(PX(d[1]), cy - hh, PX(d[3]) - PX(d[1]), 2 * hh, "fig-bar") + fig.line(PX(d[2]), cy - hh, PX(d[2]), cy + hh);
      if (b.label) s += fig.text(left - 9, cy + 4.5, b.label, "end");
    });
    return M.svg(w, h, opts.label, s);
  }
  function fiveText(d) { return "最小値 " + d[0] + "、第1四分位数 " + d[1] + "、中央値 " + d[2] + "、第3四分位数 " + d[3] + "、最大値 " + d[4]; }

  // 箱ひげ図の各部分の名前(要点帳用)
  var boxNamesFig = (function () {
    var small = "fig-label fig-small", cy = 44, x = [40, 95, 145, 200, 250], s = "";
    s += fig.line(x[0], cy, x[1], cy) + fig.line(x[3], cy, x[4], cy) + fig.line(x[0], cy - 5, x[0], cy + 5) + fig.line(x[4], cy - 5, x[4], cy + 5);
    s += fig.rect(x[1], cy - 10, x[3] - x[1], 20, "fig-bar") + fig.line(x[2], cy - 10, x[2], cy + 10);
    s += fig.text(x[1], 22, "第1四分位数", "middle", small) + fig.text(x[2], 22, "中央値", "middle", small) + fig.text(x[3], 22, "第3四分位数", "middle", small);
    s += fig.line(x[1], 26, x[1], 33, "fig-axis") + fig.line(x[2], 26, x[2], 33, "fig-axis") + fig.line(x[3], 26, x[3], 33, "fig-axis");
    s += fig.text(x[0], 66, "最小値", "middle", small) + fig.text(x[4], 66, "最大値", "middle", small);
    // 四分位範囲と範囲
    s += fig.line(x[1], 76, x[3], 76, "fig-axis") + fig.line(x[1], 72, x[1], 80, "fig-axis") + fig.line(x[3], 72, x[3], 80, "fig-axis");
    s += fig.text((x[1] + x[3]) / 2, 92, "四分位範囲", "middle", small);
    s += fig.line(x[0], 104, x[4], 104, "fig-axis") + fig.line(x[0], 100, x[0], 108, "fig-axis") + fig.line(x[4], 100, x[4], 108, "fig-axis");
    s += fig.text((x[0] + x[4]) / 2, 120, "範囲", "middle", small);
    return M.svg(290, 128, "箱ひげ図の各部分の名前。左のひげの端が最小値、箱の左端が第1四分位数、箱の中の線が中央値、箱の右端が第3四分位数、右のひげの端が最大値。箱の長さが四分位範囲、ひげの端から端までが範囲", s);
  })();

  var QUIZ_BOX = [2, 5, 8, 12, 15];
  var quizBoxFig = boxPlot({
    min: 0, max: 16, step: 1, labelEvery: 2, unit: "点",
    boxes: [{ d: QUIZ_BOX }],
    label: "小テストの得点の箱ひげ図。" + fiveText(QUIZ_BOX)
  });
  var CLASS_A = [30, 45, 60, 70, 90], CLASS_B = [40, 55, 65, 85, 95];
  var twoClassFig = boxPlot({
    min: 20, max: 100, step: 5, labelEvery: 10, unit: "点", left: 46,
    boxes: [{ label: "A組", d: CLASS_A }, { label: "B組", d: CLASS_B }],
    label: "A組とB組の数学のテストの得点の箱ひげ図。A組は" + fiveText(CLASS_A) + "。B組は" + fiveText(CLASS_B)
  });
  var THROWS = [[5, 15, 25, 30, 45], [10, 20, 25, 40, 45], [0, 20, 30, 35, 50], [15, 20, 25, 30, 35]];
  var fourClassFig = boxPlot({
    min: 0, max: 50, step: 5, labelEvery: 10, unit: "m", left: 46,
    boxes: THROWS.map(function (d, i) { return { label: "ABCD".charAt(i) + "組", d: d }; }),
    label: "A組からD組のハンドボール投げの記録の箱ひげ図。" + THROWS.map(function (d, i) { return "ABCD".charAt(i) + "組は" + fiveText(d); }).join("。")
  });
  var HIST_EDGES = [0, 10, 20, 30, 40, 50], HIST_FREQS = [2, 9, 5, 3, 1];
  var MATCH_BOXES = [[4, 18, 25, 32, 46], [4, 12, 17, 25, 46], [4, 25, 33, 38, 46], [12, 15, 18, 24, 36]];
  // 問題文の「上の図」「下の図」に合うように、どの幅でも縦に並べる(1つずつ <div> に包む)
  var matchFig = "<div>" + M.histogram({
    edges: HIST_EDGES, freqs: HIST_FREQS, xUnit: "分", yUnit: "人",
    label: "通学時間のヒストグラム。0〜10 分が 2 人、10〜20 分が 9 人、20〜30 分が 5 人、30〜40 分が 3 人、40〜50 分が 1 人"
  }) + "</div><div>" + boxPlot({
    min: 0, max: 50, step: 10, unit: "分",
    boxes: MATCH_BOXES.map(function (d, i) { return { label: "アイウエ".charAt(i), d: d }; }),
    label: "4つの箱ひげ図。" + MATCH_BOXES.map(function (d, i) { return "アイウエ".charAt(i) + "は" + fiveText(d); }).join("。")
  }) + "</div>";
  var NINE = "2, 3, 5, 6, 7, 8, 9, 11, 12";
  var quizLead = "図は、あるクラスの小テストの得点(点)の箱ひげ図です。";
  var twoLead = "図は、A組とB組の数学のテストの得点(点)の箱ひげ図です。";

  var boxFixed = [
    {
      id: "first-quartile",
      text: "次の9個のデータの第1四分位数を求めなさい。",
      math: mf(NINE),
      choices: ["4", "3", "5", "3.5"],
      answer: 0,
      explain: [
        "データは小さい順に並んでいます。中央値は 5 番目の 7 です。",
        "中央値をのぞいた前半の4個(2, 3, 5, 6)の中央値が、第1四分位数です。",
        mf("(3 + 5) / 2 = 4")
      ]
    },
    {
      id: "interquartile-range",
      text: "次の9個のデータの四分位範囲を求めなさい。",
      math: mf(NINE),
      choices: ["6", "10", "7", "4"],
      answer: 0,
      explain: [
        "中央値は 7。前半(2, 3, 5, 6)の中央値は " + mf("(3 + 5) / 2 = 4") + "(第1四分位数)",
        "後半(8, 9, 11, 12)の中央値は " + mf("(9 + 11) / 2 = 10") + "(第3四分位数)",
        "四分位範囲 = 第3四分位数 − 第1四分位数 = " + mf("10 - 4 = 6") + "(10 は範囲 " + mf("12 - 2") + " の値です。)"
      ]
    },
    {
      id: "third-quartile-even",
      text: "次の6個のデータの第3四分位数を求めなさい。",
      math: mf("3, 5, 8, 10, 13, 16"),
      choices: ["13", "14.5", "16", "10"],
      answer: 0,
      explain: [
        "データが6個(偶数)なので、前半3個と後半3個に分けます。中央値は " + mf("(8 + 10) / 2 = 9") + " です。",
        "後半の3個は 10, 13, 16 です。",
        "その中央値(2番目)の 13 が、第3四分位数です。"
      ]
    },
    {
      id: "median-unsorted",
      text: "次の8個のデータの中央値(第2四分位数)を求めなさい。",
      math: mf("7, 2, 9, 4, 5, 10, 3, 8"),
      choices: ["6", "4.5", "5", "7"],
      answer: 0,
      explain: [
        "まず、小さい順に並べかえます。",
        mf("2, 3, 4, 5, 7, 8, 9, 10"),
        "8個(偶数)なので、4番目と5番目の平均をとって " + mf("(5 + 7) / 2 = 6")
      ]
    },
    {
      id: "read-iqr",
      text: quizLead + "四分位範囲を求めなさい。",
      figure: quizBoxFig,
      choices: ["7 点", "13 点", "8 点", "3 点"],
      answer: 0,
      explain: [
        "箱の左端が第1四分位数(5 点)、箱の右端が第3四分位数(12 点)です。",
        "四分位範囲 = " + mf("12 - 5 = 7") + "(点)",
        "13 点は範囲(" + mf("15 - 2") + ")、8 点は中央値です。"
      ]
    },
    {
      id: "read-quarter",
      text: quizLead + "得点が 12 点以上の人は、全体のおよそ何%ですか。",
      figure: quizBoxFig,
      choices: ["約 25%", "約 50%", "約 75%", "約 12%"],
      answer: 0,
      explain: [
        "12 点は第3四分位数です。",
        "四分位数は、データを小さい順に並べて、個数でほぼ4等分する位置の値です。",
        "第3四分位数以上のデータは、全体のおよそ " + mf("{1/4}") + "、つまり約 25% です。"
      ]
    },
    {
      id: "compare-two",
      text: twoLead + "この図から読みとれることとして、正しいものはどれですか。",
      figure: twoClassFig,
      textChoices: true,
      choices: [
        "B組では、半数以上の生徒が 65 点以上である",
        "範囲は、A組のほうが小さい",
        "四分位範囲は、B組のほうが小さい",
        "最高点は、A組のほうが高い"
      ],
      answer: 0,
      explain: [
        "B組の中央値は 65 点なので、半数以上の生徒が 65 点以上です。",
        "範囲: A組は " + mf("90 - 30 = 60") + "、B組は " + mf("95 - 40 = 55") + " で、B組のほうが小さい。",
        "四分位範囲: A組は " + mf("70 - 45 = 25") + "、B組は " + mf("85 - 55 = 30") + " で、A組のほうが小さい。",
        "最高点(最大値)は、A組が 90 点、B組が 95 点です。"
      ]
    },
    {
      id: "largest-iqr",
      text: "図は、4つの組のハンドボール投げの記録(m)の箱ひげ図です。四分位範囲が最も大きいのは、どの組ですか。",
      figure: fourClassFig,
      textChoices: true,
      choices: ["B組", "A組", "C組", "D組"],
      answer: 0,
      explain: [
        "四分位範囲は、箱の長さ(第3四分位数 − 第1四分位数)です。",
        "A組 " + mf("30 - 15 = 15") + "、B組 " + mf("40 - 20 = 20") + "、C組 " + mf("35 - 20 = 15") + "、D組 " + mf("30 - 20 = 10"),
        "最も大きいのは B組です。C組は範囲(ひげの端から端まで)が最も大きい組です。"
      ]
    },
    {
      id: "match-histogram",
      text: "上の図は、あるクラス 20 人の通学時間のヒストグラムです。同じデータを表した箱ひげ図は、下の図のア〜エのどれですか。",
      figure: matchFig,
      choices: ["イ", "ア", "ウ", "エ"],
      answer: 0,
      explain: [
        "20 人なので、中央値は小さいほうから 10 番目と 11 番目の平均です。0〜10 分が 2 人、10〜20 分が 9 人なので、どちらも 10 分以上 20 分未満の階級に入ります。",
        "中央値が 10 分以上 20 分未満にあるのは、イとエです。",
        "ヒストグラムでは 0〜10 分にも 40〜50 分にもデータがあるので、最小値が 10 分より大きく、最大値が 40 分より小さいエは合いません。答えはイです。"
      ]
    },
    {
      id: "not-readable",
      text: "箱ひげ図から読みとることができない値はどれですか。",
      textChoices: true,
      choices: ["平均値", "中央値", "範囲", "四分位範囲"],
      answer: 0,
      explain: [
        "箱ひげ図は、最小値、第1四分位数、中央値(第2四分位数)、第3四分位数、最大値の5つの値を表した図です。",
        "範囲(最大値 − 最小値)と四分位範囲(第3四分位数 − 第1四分位数)は、この5つの値から求められます。",
        "平均値は、箱ひげ図からは読みとれません。"
      ]
    },
    {
      id: "iqr-property",
      text: "四分位範囲について、正しいものはどれですか。",
      textChoices: true,
      choices: [
        "データの中に極端にかけ離れた値があっても、影響を受けにくい",
        "最大値から最小値をひいた値である",
        "データの個数が多いほど、かならず大きくなる",
        "第2四分位数から第1四分位数をひいた値である"
      ],
      answer: 0,
      explain: [
        "四分位範囲 = 第3四分位数 − 第1四分位数 で、中央値のまわりにあるおよそ半数のデータの散らばりを表します。",
        "範囲(最大値 − 最小値)は、極端にかけ離れた値が1つあるだけで大きく変わります。",
        "四分位範囲は、両端のデータを使わないので、極端な値の影響を受けにくい値です。"
      ]
    }
  ];

  JHM.register("g2-box-plots", {
    points: [
      "<b>四分位数</b>: データを小さい順に並べて、個数で4等分する位置の値。小さいほうから、第1四分位数、第2四分位数(中央値)、第3四分位数といいます。",
      "<b>求め方</b>: 中央値を境に前半と後半に分け(データが奇数個のときは中央値をのぞく)、前半の中央値を第1四分位数、後半の中央値を第3四分位数とします。",
      "<b>四分位範囲</b> " + M.rule("四分位範囲 = 第3四分位数 − 第1四分位数") + "。範囲(最大値 − 最小値)とちがい、極端にかけ離れた値の影響を受けにくい値です。",
      "<b>箱ひげ図</b>: 最小値、第1四分位数、中央値、第3四分位数、最大値を、箱とひげで表した図。箱の中には、中央値のまわりのおよそ半数のデータが入ります。複数のデータの分布を比べるのに便利です。"
    ],
    example: {
      title: "次の7個のデータの四分位数と四分位範囲を求めなさい。" + mf("3, 5, 6, 8, 9, 12, 14"),
      steps: [
        "中央値(第2四分位数): 4番目の 8",
        "第1四分位数: 前半(3, 5, 6)の中央値で 5",
        "第3四分位数: 後半(9, 12, 14)の中央値で 12",
        "四分位範囲: " + mf("12 - 5 = 7")
      ],
      result: "四分位数は 5、8、12。四分位範囲は 7"
    },
    figure: {
      html: boxNamesFig,
      caption: "箱ひげ図。箱の長さが四分位範囲、ひげの端から端までが範囲。"
    },
    fixed: boxFixed
  });
})();

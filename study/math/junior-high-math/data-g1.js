// 中学数学道場: 中1の7単元の中身(要点・例題・図・問題)。
// 形式の説明は data.js の先頭、式と図の関数は math.js を参照。
// 中2・中3のファイル(data-g2.js、data-g3.js)も、このファイルと同じ形で書く。
(function () {
  "use strict";
  if (typeof JHM === "undefined" || typeof M === "undefined") return;

  // ---------- このファイルの中で使う短い名前 ----------
  var v = M.v, m = M.m, mf = M.mf, f = M.f, fig = M.fig;
  var X = v("x"), Y = v("y");
  function sg(n) { return n < 0 ? "-" : "+"; }          // 符号を演算子に
  function abs(n) { return Math.abs(n); }
  function xeq(n) { return X + M.op("=") + M.num(n); }   // 選択肢「x = 3」
  // 2〜max の整数に、正負どちらかの符号をつけた乱数
  function signed(max, min) {
    return M.rand(min || 2, max) * (Math.random() < 0.5 ? -1 : 1);
  }
  // 一次式の4択。正解 Ax + B と、誤答の [a, b] の組(x の係数が 0 になるものは使わない)
  function linChoices(A, B, pairs, name) {
    function h(p) { return p[0] === 0 ? null : M.linear(p[0], p[1], name); }
    return M.choices(M.linear(A, B, name), pairs.map(h), function () {
      return h([A + M.pick([-2, -1, 0, 1, 2]), B + M.pick([-3, -2, -1, 1, 2, 3])]);
    });
  }
  // 問題の本体と4択を1つにまとめる
  function build(base, ch) {
    base.choices = ch.choices;
    base.answer = ch.answer;
    return base;
  }

  // =====================================================================
  // 1-1 正負の数
  // =====================================================================

  // 加法・減法(2数)
  function genAddSub() {
    var a, b, sign;
    do {
      a = M.randNZ(-12, 12); b = M.randNZ(-12, 12); sign = M.pick(["+", "-"]);
    } while (a > 0 && b > 0 && (sign === "+" || a >= b));
    var b2 = sign === "+" ? b : -b, ans = a + b2;
    var lines = [];
    if (sign === "-") {
      lines.push("減法は、ひく数の符号を変えて加法に直します。");
      lines.push(m(a, "-", b, "=", a, "+", b2));
    }
    if (a > 0 && b2 > 0) {
      lines.push(m(a, "+", b2, "=", ans));
    } else if (a * b2 > 0) {
      lines.push("同符号の2数の和は、絶対値の和に共通の符号をつけます。");
      lines.push(m(a, "+", b2, "=", M.MINUS + "(" + M.join(abs(a), "+", abs(b2)) + ")", "=", ans));
    } else if (ans === 0) {
      lines.push("絶対値が等しい異符号の2数の和は 0 です。");
      lines.push(m(a, "+", b2, "=", 0));
    } else {
      var big = Math.max(abs(a), abs(b2)), small = Math.min(abs(a), abs(b2));
      lines.push("異符号の2数の和は、絶対値の差に、絶対値の大きいほうの符号をつけます。");
      lines.push(m(a, "+", b2, "=", (ans < 0 ? M.MINUS : "+") + "(" + M.join(big, "-", small) + ")", "=", ans));
    }
    return build({
      text: "次の計算をしなさい。",
      math: m(a, sign, b),
      explain: lines,
      meta: { kind: "calc" }
    }, M.numChoices(ans, [sign === "+" ? a - b : a + b, -ans, abs(a) + abs(b), -(abs(a) + abs(b)), abs(a) - abs(b), abs(b) - abs(a)]));
  }

  // 加法・減法(3つの項を並べた式)
  function genAddSub3() {
    var a, b, c, s1, s2;
    do {
      a = M.randNZ(-9, 9); b = M.rand(1, 9); c = M.rand(1, 9);
      s1 = M.pick(["+", "-"]); s2 = M.pick(["+", "-"]);
    } while (a > 0 && s1 === "+" && s2 === "+");
    var terms = [a, s1 === "+" ? b : -b, s2 === "+" ? c : -c];
    var ans = terms[0] + terms[1] + terms[2];
    var pos = terms.filter(function (t) { return t > 0; }), neg = terms.filter(function (t) { return t < 0; }).map(abs);
    var P = pos.reduce(function (x, y) { return x + y; }, 0), N = neg.reduce(function (x, y) { return x + y; }, 0);
    var orig = M.join(a, s1, b, s2, c);
    var lines = ["正の項どうし、負の項どうしをそれぞれまとめます。"];
    if (pos.length === 0) {
      lines.push(m(orig, "=", M.MINUS + "(" + neg.join(M.op("+")) + ")"));
      lines.push(m("=", ans));
    } else {
      var re = [];
      pos.forEach(function (t, i) { if (i) re.push("+"); re.push(t); });
      neg.forEach(function (t) { re.push("-"); re.push(t); });
      var reordered = M.join(re);
      if (reordered !== orig) lines.push(m(orig, "=", reordered));
      else lines.push(m(orig));
      lines.push(m("=", P, "-", N, "=", ans));
    }
    return build({
      text: "次の計算をしなさい。",
      math: m(orig),
      explain: lines,
      meta: { kind: "calc" }
    }, M.numChoices(ans, [a - terms[1] + terms[2], a + terms[1] - terms[2], -ans, -a + terms[1] + terms[2], P + N, -(P + N)]));
  }

  // 乗法・除法
  function genMulDiv() {
    var kind = M.pick(["mul", "div", "mul3"]);
    var a, b, c, ans, lines;
    function signRule(x, y) {
      return x * y > 0 ? "同符号の2数の積・商は、絶対値の積・商に正の符号をつけます。" : "異符号の2数の積・商は、絶対値の積・商に負の符号をつけます。";
    }
    if (kind === "mul") {
      do { a = signed(9); b = signed(9); } while (a > 0 && b > 0);
      ans = a * b;
      lines = [signRule(a, b), m(a, "*", b, "=", (ans < 0 ? M.MINUS : "+") + "(" + M.join(abs(a), "*", abs(b)) + ")", "=", ans)];
      return build({ text: "次の計算をしなさい。", math: m(a, "*", b), explain: lines, meta: { kind: "calc" } },
        M.numChoices(ans, [-ans, a + b, -(a + b), abs(a) + abs(b)]));
    }
    if (kind === "div") {
      var q;
      do { b = signed(9); q = signed(9); a = b * q; } while (a > 0 && b > 0);
      ans = q;
      lines = [signRule(a, b), m(a, "/", b, "=", (ans < 0 ? M.MINUS : "+") + "(" + M.join(abs(a), "/", abs(b)) + ")", "=", ans)];
      return build({ text: "次の計算をしなさい。", math: m(a, "/", b), explain: lines, meta: { kind: "calc" } },
        M.numChoices(ans, [-ans, a + b, a - b]));
    }
    do { a = signed(5); b = signed(5); c = signed(5); } while (a > 0 && b > 0 && c > 0);
    ans = a * b * c;
    var negCount = [a, b, c].filter(function (t) { return t < 0; }).length;
    lines = [
      "積の符号は、負の数が偶数個なら +、奇数個なら − です。",
      "負の数は " + negCount + " 個なので、符号は " + (ans < 0 ? "−" : "+") + " です。",
      m(a, "*", b, "*", c, "=", (ans < 0 ? M.MINUS : "+") + "(" + M.join(abs(a), "*", abs(b), "*", abs(c)) + ")", "=", ans)
    ];
    return build({ text: "次の計算をしなさい。", math: m(a, "*", b, "*", c), explain: lines, meta: { kind: "calc" } },
      M.numChoices(ans, [-ans, a + b + c, a * b + c, -(a * b) + c]));
  }

  // 累乗をふくむ計算、四則のまじった計算
  function genPowerMixed() {
    var kind = M.pick(["pow", "order", "sqA", "sqB", "sqC"]);
    var a, b, c, e, val, expr, lines, wrongs;
    if (kind === "pow") {
      e = M.pick([2, 2, 3]);
      b = e === 2 ? M.rand(2, 7) : M.rand(2, 4);
      var pw = Math.pow(b, e);
      var facs = [];
      for (var i = 0; i < e; i++) { if (i) facs.push("*"); facs.push(b); }
      if (Math.random() < 0.5) {
        expr = M.pow(-b, e);
        val = Math.pow(-b, e);
        var nf = [];
        for (var j = 0; j < e; j++) { if (j) nf.push("*"); nf.push("(" + M.num(-b) + ")"); }
        lines = [m(expr) + " は、" + m(-b) + " を " + e + " 個かけた数です。", m(expr, "=", M.join(nf), "=", val)];
      } else {
        expr = M.MINUS + M.pow(b, e);
        val = -pw;
        lines = [m(expr) + " は、" + m(M.pow(b, e)) + " に − をつけた数です(" + e + " 乗するのは " + b + " だけ)。",
          m(expr, "=", M.MINUS + "(" + M.join(facs) + ")", "=", val)];
      }
      wrongs = [-val, b * e, -b * e, pw + 1];
    } else if (kind === "order") {
      var s = M.pick(["+", "-"]);
      do { a = M.randNZ(-9, 9); b = signed(6); c = signed(6); } while (b > 0 && c > 0);
      val = s === "+" ? a + b * c : a - b * c;
      expr = M.join(a, s, b, "*", c);
      lines = ["加減と乗除がまじった式は、乗法・除法を先に計算します。", m(expr, "=", a, s, b * c), m("=", val)];
      wrongs = [(s === "+" ? a + b : a - b) * c, s === "+" ? a - b * c : a + b * c, -val, a + b + c];
    } else if (kind === "sqA") {
      a = M.rand(1, 12); b = M.rand(2, 5);
      val = a - b * b;
      expr = M.join(a, "-", M.pow(-b, 2));
      lines = ["累乗を先に計算します。" + m(M.pow(-b, 2), "=", b * b), m(expr, "=", a, "-", b * b), m("=", val)];
      wrongs = [a + b * b, a - 2 * b, a + 2 * b, -val];
    } else if (kind === "sqB") {
      a = M.rand(1, 12); b = M.rand(2, 5);
      val = -b * b + a;
      expr = M.join(M.MINUS + M.pow(b, 2), "+", a);
      lines = ["累乗を先に計算します。" + m(M.MINUS + M.pow(b, 2), "=", -b * b) + "(2 乗するのは " + b + " だけ)", m(expr, "=", -b * b, "+", a), m("=", val)];
      wrongs = [b * b + a, -2 * b + a, 2 * b + a, -(b * b + a)];
    } else {
      a = signed(5); b = M.rand(2, 4);
      val = a * b * b;
      expr = M.join(a, "*", M.pow(-b, 2));
      lines = ["累乗を先に計算します。" + m(M.pow(-b, 2), "=", b * b), m(expr, "=", a, "*", b * b), m("=", val)];
      wrongs = [-val, a * -2 * b, a * a * b * b, a * 2 * b];
    }
    return build({ text: "次の計算をしなさい。", math: m(expr), explain: lines, meta: { kind: "calc" } }, M.numChoices(val, wrongs));
  }

  // 素因数分解
  function factorHtml(list) {
    return list.map(function (p) { return p[1] === 1 ? M.num(p[0]) : M.pow(p[0], p[1]); }).join(M.op("*"));
  }
  function genPrimeFactor() {
    var n, list, count;
    do {
      var e2 = M.rand(0, 3), e3 = M.rand(0, 2), e5 = M.rand(0, 1), e7 = M.rand(0, 1);
      n = Math.pow(2, e2) * Math.pow(3, e3) * Math.pow(5, e5) * Math.pow(7, e7);
      count = e2 + e3 + e5 + e7;
    } while (count < 3 || count > 5 || n < 12 || n > 200);
    list = M.factorize(n);
    function sorted(l) { return l.filter(function (p) { return p[1] > 0; }).sort(function (x, y) { return x[0] - y[0]; }); }
    function copy() { return list.map(function (p) { return p.slice(); }); }
    var wrongs = [], w, k;
    // 素数でない数が残っている(分解が途中)
    w = copy();
    k = -1;
    w.forEach(function (p, i) { if (k < 0 && p[1] >= 2) k = i; });
    if (k >= 0) { w[k][1] -= 2; w.push([w[k][0] * w[k][0], 1]); }
    else { w[0][1] -= 1; w[1][1] -= 1; w.push([w[0][0] * w[1][0], 1]); }
    wrongs.push(factorHtml(sorted(w)));
    // 指数が1つ多い
    w = copy(); w[0][1] += 1; wrongs.push(factorHtml(w));
    // 指数が1つ少ない、または素数を1つ取りちがえる
    w = copy();
    if (k >= 0) { w[k][1] -= 1; wrongs.push(factorHtml(sorted(w))); }
    w = copy();
    var last = w[w.length - 1], next = last[0] + 1;
    while (!M.isPrime(next)) next++;
    last[0] = next; wrongs.push(factorHtml(w));
    var flat = [];
    list.forEach(function (p) { for (var i = 0; i < p[1]; i++) { if (flat.length) flat.push("*"); flat.push(p[0]); } });
    var lines = ["小さい素数から順にわっていき、素数だけの積にします。", m(n, "=", M.join(flat))];
    if (list.some(function (p) { return p[1] > 1; })) {
      lines.push("同じ数の積は、累乗の指数を使って表します。");
      lines.push(m(n, "=", factorHtml(list)));
    }
    return build({
      text: "次の数を素因数分解しなさい。",
      math: m(n),
      explain: lines,
      meta: { kind: "factor", n: n }
    }, M.choices(factorHtml(list), wrongs, function () {
      var t = copy(), i = M.rand(0, t.length - 1);
      t[i][1] = Math.max(1, t[i][1] + M.pick([-1, 1, 2]));
      return factorHtml(t);
    }));
  }

  // 絶対値と数の大小
  function genAbsCompare() {
    var kind = M.pick(["min", "maxabs", "count"]);
    if (kind === "count") {
      var k = M.rand(2, 5), under = Math.random() < 0.5;
      var top = under ? k - 1 : k, ans = 2 * top + 1, listed = [];
      for (var i = -top; i <= top; i++) listed.push(M.num(i));
      return build({
        text: "絶対値が " + k + (under ? " より小さい" : " 以下の") + "整数は、全部で何個ありますか。",
        explain: [
          "絶対値は、数直線上で原点からの距離を表します。" + (under ? k + " より小さいので、" + m(k) + " と " + m(-k) + " はふくみません。" : k + " 以下なので、" + m(k) + " と " + m(-k) + " もふくみます。"),
          // 数を1つずつ包んで「、」でつなぐ(せまい画面で折り返せるように)
          listed.map(function (h) { return m(h); }).join("、"),
          "0 をわすれずに数えて、" + ans + " 個です。"
        ],
        meta: { kind: "abscount", k: k, under: under }
      }, M.numChoices(ans, [under ? 2 * k + 1 : 2 * k - 1, 2 * top, top, top + 1], { fmt: function (n) { return M.num(n) + " 個"; }, ok: function (n) { return n > 0; } }));
    }
    var nums, absSet;
    do {
      nums = M.shuffle([-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
      absSet = {};
      nums.forEach(function (n) { absSet[abs(n)] = true; });
    } while (Object.keys(absSet).length < 4 || nums.filter(function (n) { return n < 0; }).length < 2);
    var sortedNums = nums.slice().sort(function (x, y) { return x - y; });
    var listHtml = m(nums.map(M.num).join(", "));
    if (kind === "min") {
      var chain = [];
      sortedNums.forEach(function (n, i) { if (i) chain.push("<"); chain.push(M.num(n)); });
      return build({
        text: "次の4つの数のうち、最も小さい数はどれですか。",
        math: listHtml,
        explain: ["負の数は正の数や 0 より小さく、負の数どうしでは絶対値が大きいほど小さくなります。", m(chain)],
        meta: { kind: "min", nums: nums }
      }, M.choices(M.num(sortedNums[0]), nums.filter(function (n) { return n !== sortedNums[0]; }).map(M.num)));
    }
    var best = nums.slice().sort(function (x, y) { return abs(y) - abs(x); })[0];
    return build({
      text: "次の4つの数のうち、絶対値が最も大きい数はどれですか。",
      math: listHtml,
      explain: [
        "絶対値は、数直線上で原点からの距離です。符号をとった数を比べます。",
        nums.map(function (n) { return m(n) + " の絶対値は " + m(abs(n)); }).join("、"),
        "絶対値が最も大きいのは " + m(best) + " です。"
      ],
      meta: { kind: "maxabs", nums: nums }
    }, M.choices(M.num(best), nums.filter(function (n) { return n !== best; }).map(M.num)));
  }

  JHM.register("g1-numbers", {
    points: [
      "0 より小さい数を負の数といいます。数直線上で、原点からの距離を<b>絶対値</b>といいます。負の数は、絶対値が大きいほど小さくなります。" + M.rule(mf("-5 < -2 < 0 < 3")),
      "<b>加法・減法</b>: 同符号の和は、絶対値の和に共通の符号。異符号の和は、絶対値の差に絶対値の大きいほうの符号。減法は、ひく数の符号を変えて加法に直します。" + M.rule(mf("5 - (-3) = 5 + 3 = 8")),
      "<b>乗法・除法</b>: 同符号の積・商は正、異符号の積・商は負です。" + M.rule(mf("(-4) * (-3) = 12")) + "、" + M.rule(mf("(-12) / 3 = -4")),
      "<b>累乗と計算の順序</b>: かっこの中・累乗 → 乗法・除法 → 加法・減法の順に計算します。" + M.rule(mf("(-3)^2 = 9")) + "、" + M.rule(mf("-3^2 = -9")),
      "<b>素因数分解</b>: 自然数を素数だけの積で表すこと。1 は素数にふくめません。" + M.rule(mf("60 = 2^2 * 3 * 5"))
    ],
    example: {
      title: mf("6 - (-2)^2 * 3") + " を計算しなさい。",
      steps: [
        mf("6 - (-2)^2 * 3"),
        mf("= 6 - 4 * 3") + "(累乗を先に)",
        mf("= 6 - 12") + "(次に乗法)"
      ],
      result: mf("= -6")
    },
    generators: [
      { id: "add-sub", label: "加法・減法(2数)", make: genAddSub },
      { id: "add-sub-3", label: "加法・減法(3つの項)", make: genAddSub3 },
      { id: "mul-div", label: "乗法・除法", make: genMulDiv },
      { id: "power-mixed", label: "累乗をふくむ四則", make: genPowerMixed },
      { id: "prime-factor", label: "素因数分解", make: genPrimeFactor },
      { id: "abs-compare", label: "絶対値と大小", make: genAbsCompare }
    ]
  });

  // =====================================================================
  // 1-2 文字と式
  // =====================================================================

  // 式の値(代入)
  function genSubstitute() {
    var k = M.pick([-5, -4, -3, -3, -2, -2, -1, 2, 3, 4]);
    var form = M.pick(["lin", "lin", "sq", "frac"]);
    var a, b, expr, val, lines, wrongs;
    // かっこの注意は、代入する数が負のときだけ出す
    var subLead = k < 0 ? "負の数は、かっこをつけて代入します。" : m(X) + " に " + m(k) + " を代入します。";
    if (form === "lin") {
      a = signed(6); b = M.randNZ(-9, 9);
      expr = M.linear(a, b);
      val = a * k + b;
      lines = [subLead, m(expr, "=", a, "*", k, sg(b), abs(b)), m("=", a * k, sg(b), abs(b)), m("=", val)];
      wrongs = [a * -k + b, a + k + b, a * k - b, -val];
    } else if (form === "sq") {
      a = M.pick([1, -1, 2, -2, 3]); b = M.pick([0, 0, M.randNZ(-5, 5)]);
      expr = M.poly([[a, M.pow("x", 2)], [b, ""]]);
      val = a * k * k + b;
      var sub = a === 1 ? M.pow(k, 2) : (a === -1 ? M.MINUS + M.pow(k, 2) : M.join(a, "*", M.pow(k, 2)));
      var line1 = b === 0 ? m(expr, "=", sub) : m(expr, "=", sub, sg(b), abs(b));
      lines = [subLead + m(M.pow(k, 2), "=", k * k), line1];
      lines.push(b === 0 ? m("=", val) : m("=", a * k * k, sg(b), abs(b), "=", val));
      wrongs = [-a * k * k + b, a * 2 * k + b, -a * 2 * k + b, a * a * k * k + b, -val];
    } else {
      var q = signed(6), c = abs(q * k);
      expr = M.frac(c, X);
      val = c / k;
      lines = ["分数の形の式は、わり算に直して代入します。", m(expr, "=", c, "/", k), m("=", val)];
      wrongs = [-val, c * k, c + k, c - k];
    }
    return build({
      text: m(X, "=", k) + " のとき、次の式の値を求めなさい。",
      math: m(expr),
      explain: lines,
      meta: { kind: "substitute", x: k }
    }, M.numChoices(val, wrongs));
  }

  // 同類項をまとめる
  function genCombine() {
    var a, b, c, d;
    do {
      a = M.randNZ(-9, 9); c = M.randNZ(-9, 9); b = M.randNZ(-9, 9); d = M.randNZ(-9, 9);
    } while (a + c === 0 || b + d === 0);
    var expr = M.poly([[a, X], [b, ""], [c, X], [d, ""]]);
    return build({
      text: "次の式を計算しなさい。",
      math: m(expr),
      explain: [
        "文字の項どうし、数の項どうしをそれぞれまとめます。",
        m(expr),
        m("=", M.poly([[a, X], [c, X], [b, ""], [d, ""]])),
        m("=", "(" + M.join(a, sg(c), abs(c)) + ")" + X, "+", "(" + M.join(b, sg(d), abs(d)) + ")"),
        m("=", M.linear(a + c, b + d))
      ],
      meta: { kind: "simplify" }
    }, linChoices(a + c, b + d, [[a - c, b + d], [a + c, b - d], [a + c, -(b + d)], [a + c + b + d, 0], [a - c, b - d]]));
  }

  // かっこをはずす(分配法則)
  function genDistribute() {
    var a, b, k, expr, lines, ch;
    if (Math.random() < 0.6) {
      k = M.pick([-6, -5, -4, -3, -2, -2, -3, 2, 3, 4]);
      a = M.randNZ(-5, 5); b = M.randNZ(-7, 7);
      expr = M.num(k) + "(" + M.linear(a, b) + ")";
      lines = [
        "分配法則で、かっこの中のすべての項に " + m(k) + " をかけます。",
        m(expr),
        m("=", k, "*", M.term(a, X).charAt(0) === M.MINUS ? "(" + M.term(a, X) + ")" : M.term(a, X), "+", k, "*", b),
        m("=", M.linear(k * a, k * b))
      ];
      ch = linChoices(k * a, k * b, [[k * a, b], [k * a, -k * b], [-k * a, k * b], [a, k * b], [k * a, k + b]]);
    } else {
      k = signed(6);
      var p = M.randNZ(-5, 5), q = M.randNZ(-6, 6);
      a = p * k; b = q * k;
      expr = "(" + M.linear(a, b) + ")" + M.op("/") + M.nump(k);
      lines = [
        "かっこの中のすべての項を " + m(k) + " でわります。",
        m(expr),
        m("=", (p < 0 ? M.MINUS : "") + M.frac(M.term(abs(a), X), abs(k)), q < 0 ? "-" : "+", M.frac(abs(b), abs(k))),
        m("=", M.linear(p, q))
      ];
      ch = linChoices(p, q, [[p, b], [a, q], [-p, q], [p, -q], [-p, -q]]);
    }
    return build({ text: "次の式を計算しなさい。", math: m(expr), explain: lines, meta: { kind: "simplify" } }, ch);
  }

  // かっこのある式の加法・減法
  function genParenAddSub() {
    var a, b, c, d, expr, lines, ch;
    if (Math.random() < 0.5) {
      var s = M.pick(["-", "-", "+"]);
      do {
        a = M.randNZ(-7, 7); b = M.randNZ(-9, 9); c = M.randNZ(-7, 7); d = M.randNZ(-9, 9);
      } while (a - c === 0 || a + c === 0);
      var c2 = s === "-" ? -c : c, d2 = s === "-" ? -d : d;
      expr = "(" + M.linear(a, b) + ")" + M.op(s) + "(" + M.linear(c, d) + ")";
      lines = [
        s === "-" ? "ひくほうの式は、すべての項の符号を変えて、かっこをはずします。" : "そのままかっこをはずします。",
        m(expr),
        m("=", M.poly([[a, X], [b, ""], [c2, X], [d2, ""]])),
        m("=", M.linear(a + c2, b + d2))
      ];
      ch = linChoices(a + c2, b + d2, [[a + c2, b - d2], [a - c2, b + d2], [a - c2, b - d2], [a + c2, -(b + d2)]]);
    } else {
      var p, q;
      do {
        p = M.rand(2, 4); q = M.rand(2, 4);
        a = M.randNZ(-4, 4); b = M.randNZ(-5, 5); c = M.randNZ(-4, 4); d = M.randNZ(-5, 5);
      } while (p * a - q * c === 0 || p * a + q * c === 0);
      expr = M.num(p) + "(" + M.linear(a, b) + ")" + M.op("-") + M.num(q) + "(" + M.linear(c, d) + ")";
      lines = [
        "分配法則でかっこをはずします。うしろのかっこには " + m(-q) + " をかけると考えます。",
        m(expr),
        m("=", M.poly([[p * a, X], [p * b, ""], [-q * c, X], [-q * d, ""]])),
        m("=", M.linear(p * a - q * c, p * b - q * d))
      ];
      ch = linChoices(p * a - q * c, p * b - q * d, [[p * a - q * c, p * b + q * d], [p * a - q * c, p * b - d], [p * a + q * c, p * b + q * d], [p * a - c, p * b - d]]);
    }
    return build({ text: "次の式を計算しなさい。", math: m(expr), explain: lines, meta: { kind: "simplify" } }, ch);
  }

  // 文字式の表し方(× ÷ を使わない書き方)
  function genNotation() {
    var t = M.pick(["product", "square", "quotient"]);
    var A = v("a"), B = v("b"), expr, correct, wrongs, lines, n;
    if (t === "product") {
      n = M.pick([-7, -5, -4, -3, -2, -1, 2, 3, 5, 6]);
      expr = M.join(B, "*", A, "*", n);
      correct = M.term(n, A + B);
      wrongs = [M.term(-n, A + B), M.poly([[1, A + B], [n, ""]]), M.poly([[n, A], [1, B]]), M.poly([[1, A], [1, B], [n, ""]])];
      lines = ["乗法の記号 × は省き、数を文字の前に書きます。文字はふつうアルファベット順に並べます。"];
      if (n === -1) lines.push("係数の 1 は書かないので、" + m(-1, "*", A + B) + " は " + m(correct) + " と書きます。");
      lines.push(m(expr, "=", correct));
    } else if (t === "square") {
      n = M.rand(2, 9);
      expr = M.pick([M.join(X, "*", X, "*", n), M.join(X, "*", n, "*", X), M.join(n, "*", X, "*", X)]);
      correct = M.term(n, M.pow("x", 2));
      wrongs = [M.term(2 * n, X), M.poly([[2, X], [n, ""]]), M.poly([[1, M.pow("x", 2)], [n, ""]]), M.term(n, X)];
      lines = ["同じ文字の積は、累乗の指数を使って表します。数は文字の前に書きます。", m(expr, "=", correct)];
    } else {
      n = M.rand(2, 9);
      var sum = M.poly([[1, A], [1, B]]);
      expr = "(" + sum + ")" + M.op("/") + M.num(n);
      correct = M.frac(sum, n);
      wrongs = [A + M.op("+") + M.frac(B, n), M.num(n) + "(" + sum + ")", M.frac(n, sum), M.frac(A, n) + M.op("+") + B];
      lines = ["除法の記号 ÷ は使わず、分数の形で書きます。かっこの中の式全体が分子になります。", m(expr, "=", correct)];
    }
    return build({
      text: "次の式を、文字式の表し方にしたがって表しなさい。",
      math: m(expr),
      explain: lines,
      meta: { kind: "notation" }
    }, M.choices(correct, wrongs));
  }

  // 数量を文字式で表す
  function genWordExpression() {
    var t = M.pick(["change", "distance", "time", "discount", "perimeter"]);
    var A = v("a"), B = v("b"), n, text, correct, wrongs, lines;
    if (t === "change") {
      n = M.rand(2, 8);
      text = "1個 " + m(A) + " 円のパンを " + n + " 個買い、1000 円札を出しました。おつりを表す式はどれですか。";
      correct = M.poly([[1000, ""], [-n, A]]);
      wrongs = [M.poly([[n, A], [-1000, ""]]), M.poly([[1000, ""], [n, A]]), M.num(n) + "(" + M.poly([[1000, ""], [-1, A]]) + ")", M.poly([[1000, ""], [-1, A]])];
      lines = ["代金は " + m(A, "*", n, "=", M.term(n, A)) + "(円)です。", "おつり = 出した金額 − 代金 なので、" + m(correct) + "(円)です。"];
    } else if (t === "distance") {
      n = M.rand(2, 6);
      text = "時速 " + m(X) + " km で " + n + " 時間歩きました。歩いた道のり(km)を表す式はどれですか。";
      correct = M.term(n, X);
      wrongs = [M.frac(X, n), M.frac(n, X), M.poly([[1, X], [n, ""]])];
      lines = ["道のり = 速さ × 時間 です。", m(X, "*", n, "=", correct) + "(km)"];
    } else if (t === "time") {
      n = M.rand(3, 9);
      text = m(A) + " km の道のりを、時速 " + n + " km で進みます。かかる時間(時間)を表す式はどれですか。";
      correct = M.frac(A, n);
      wrongs = [M.term(n, A), M.frac(n, A), M.poly([[1, A], [-n, ""]])];
      lines = ["時間 = 道のり ÷ 速さ です。", m(A, "/", n, "=", correct) + "(時間)"];
    } else if (t === "discount") {
      n = M.rand(1, 4);
      text = "定価 " + m(X) + " 円の品物を、定価の " + n + " 割引きで買いました。代金(円)を表す式はどれですか。";
      correct = M.term((10 - n) / 10, X);
      wrongs = [M.term(n / 10, X), M.poly([[1, X], [-n / 10, ""]]), M.term(10 - n, X), M.poly([[1, X], [-n, ""]])];
      lines = [n + " 割は " + m(n / 10) + " なので、代金は定価の " + m(1, "-", n / 10, "=", (10 - n) / 10) + " 倍です。", m(X, "*", (10 - n) / 10, "=", correct) + "(円)"];
    } else {
      text = "縦 " + m(A) + " cm、横 " + m(B) + " cm の長方形があります。周の長さ(cm)を表す式はどれですか。";
      var sum = M.poly([[1, A], [1, B]]);
      correct = "2(" + sum + ")";
      wrongs = [A + B, sum, "2" + A + B];
      lines = ["長方形の周の長さ = (縦 + 横) × 2 です。", m("(" + sum + ")", "*", 2, "=", correct) + "(cm)"];
    }
    return build({ text: text, explain: lines, meta: { kind: "word-expression", t: t, n: n || 0 } }, M.choices(correct, wrongs));
  }

  JHM.register("g1-expressions", {
    points: [
      "<b>文字式の表し方</b>: 乗法の記号 × は省き、数を文字の前に書きます。同じ文字の積は累乗で、除法は分数の形で表します。" + M.rule(mf("a * 3 * b = 3ab")) + "、" + M.rule(mf("x * x = x^2")) + "、" + M.rule(mf("a / 4 = {a/4}")),
      "係数の 1 は書きません。" + M.rule(mf("1 * x = x")) + "、" + M.rule(mf("(-1) * x = -x")),
      "<b>式の値</b>: 文字に数を代入して計算した結果。負の数は、かっこをつけて代入します。",
      "<b>文字の部分が同じ項</b>: 係数をまとめて1つの項にできます(中2で「同類項」とよびます)。" + M.rule(mf("3x + 5x = (3 + 5)x = 8x")),
      "<b>分配法則</b>: " + M.rule(mf("a(b + c) = ab + ac")) + "。かっこの前が − のときは、かっこの中のすべての項の符号が変わります。" + M.rule(mf("-(2x - 3) = -2x + 3"))
    ],
    example: {
      title: mf("2(3x - 1) - 3(x - 4)") + " を計算しなさい。",
      steps: [
        mf("2(3x - 1) - 3(x - 4)"),
        mf("= 6x - 2 - 3x + 12") + "(分配法則)",
        mf("= (6 - 3)x + (-2 + 12)")
      ],
      result: mf("= 3x + 10")
    },
    generators: [
      { id: "substitute", label: "式の値", make: genSubstitute },
      { id: "combine", label: "同類項をまとめる", make: genCombine },
      { id: "distribute", label: "分配法則", make: genDistribute },
      { id: "paren-add-sub", label: "かっこのある式の加減", make: genParenAddSub },
      { id: "notation", label: "文字式の表し方", make: genNotation },
      { id: "word-expression", label: "数量を式で表す", make: genWordExpression }
    ]
  });

  // =====================================================================
  // 1-3 一次方程式
  // =====================================================================

  // ax + b = c
  function genEqBasic() {
    var a = signed(7), x0 = M.randNZ(-9, 9), b = M.randNZ(-12, 12), c = a * x0 + b;
    return build({
      text: "次の方程式を解きなさい。",
      math: m(M.linear(a, b), "=", c),
      explain: [
        "数の項を右辺に移項します(移項すると符号が変わります)。",
        m(M.term(a, X), "=", c, b > 0 ? "-" : "+", abs(b)),
        m(M.term(a, X), "=", c - b),
        "両辺を " + m(a) + " でわると、" + m(xeq(x0))
      ],
      meta: { kind: "equation" }
    }, M.numChoices(x0, [(c + b) / a, -x0, (c + b) / -a, c - b], { fmt: xeq }));
  }

  // ax + b = cx + d
  function genEqBothSides() {
    var a, c, x0, b, d;
    do {
      a = M.randNZ(-7, 7); c = M.randNZ(-7, 7); x0 = M.randNZ(-9, 9); b = M.randNZ(-12, 12);
      d = (a - c) * x0 + b;
    } while (a === c || d === 0 || abs(d) > 40);
    return build({
      text: "次の方程式を解きなさい。",
      math: m(M.linear(a, b), "=", M.linear(c, d)),
      explain: [
        "文字の項を左辺に、数の項を右辺に移項します(符号が変わります)。",
        m(M.poly([[a, X], [-c, X]]), "=", d, b > 0 ? "-" : "+", abs(b)),
        m(M.term(a - c, X), "=", d - b)
      ].concat(a - c === 1 ? [] : ["両辺を " + m(a - c) + " でわると、" + m(xeq(x0))]),
      meta: { kind: "equation" }
    }, M.numChoices(x0, [(d + b) / (a - c), (d - b) / (a + c), -x0, (d + b) / (a + c)], { fmt: xeq }));
  }

  // a(x + b) = cx + d
  function genEqParen() {
    var a, b, c, x0, d;
    do {
      a = signed(5); b = M.randNZ(-6, 6); c = M.pick([0, M.randNZ(-5, 5)]); x0 = M.randNZ(-9, 9);
      d = (a - c) * x0 + a * b;
    } while (a === c || abs(d) > 40 || (c === 0 && d === 0));
    var lhs = M.num(a) + "(" + M.linear(1, b) + ")", rhs = M.linear(c, d);
    var lines = ["分配法則でかっこをはずします。", m(M.linear(a, a * b), "=", rhs)];
    lines.push("移項して整理します。");
    lines.push(c === 0 ? m(M.term(a, X), "=", d, a * b > 0 ? "-" : "+", abs(a * b))
      : m(M.poly([[a, X], [-c, X]]), "=", d, a * b > 0 ? "-" : "+", abs(a * b)));
    lines.push(m(M.term(a - c, X), "=", d - a * b));
    if (a - c !== 1) lines.push("両辺を " + m(a - c) + " でわると、" + m(xeq(x0)));
    return build({
      text: "次の方程式を解きなさい。",
      math: m(lhs, "=", rhs),
      explain: lines,
      meta: { kind: "equation" }
    }, M.numChoices(x0, [(d - b) / (a - c), (d + a * b) / (a - c), -x0, (d - a * b) / (a + c)], { fmt: xeq }));
  }

  // (x + a)/p = (x + b)/q
  function genEqFraction() {
    var p, q, k, x0, a, b;
    do {
      p = M.rand(2, 5); q = M.rand(2, 5); k = M.randNZ(-3, 3); x0 = M.randNZ(-9, 9);
      a = p * k - x0; b = q * k - x0;
    } while (p === q || a === 0 || b === 0 || abs(a) > 12 || abs(b) > 12);
    var L = M.lcm(p, q), cp = L / p, cq = L / q;
    function mult(c, e) { return c === 1 ? M.linear(1, e) : M.num(c) + "(" + M.linear(1, e) + ")"; }
    return build({
      text: "次の方程式を解きなさい。",
      math: m(M.frac(M.linear(1, a), p), "=", M.frac(M.linear(1, b), q)),
      explain: [
        "両辺に分母の最小公倍数 " + L + " をかけて、分母をはらいます。",
        m(mult(cp, a), "=", mult(cq, b)),
        m(M.linear(cp, cp * a), "=", M.linear(cq, cq * b)),
        m(M.poly([[cp, X], [-cq, X]]), "=", cq * b, cp * a > 0 ? "-" : "+", abs(cp * a)),
        m(M.term(cp - cq, X), "=", cq * b - cp * a)
      ].concat(cp - cq === 1 ? [] : ["両辺を " + m(cp - cq) + " でわると、" + m(xeq(x0))]),
      meta: { kind: "equation" }
    }, M.numChoices(x0, [(b - a) / (cp - cq), -x0, k, (cq * b + cp * a) / (cp - cq)], { fmt: xeq }));
  }

  // 比例式
  function genEqRatio() {
    var p, q, t, s;
    do { p = M.rand(1, 7); q = M.rand(1, 7); t = M.rand(2, 6); s = M.rand(1, 4); } while (M.gcd(p, q) !== 1 || p === q || s === t);
    var formA = Math.random() < 0.5, a, b, c, x0, math, lines, wrongs;
    b = p * s; c = q * s;
    if (formA) {
      a = q * t; x0 = p * t;
      math = m(X, ":", a, "=", b, ":", c);
      lines = [m(M.term(c, X), "=", a, "*", b), m(M.term(c, X), "=", a * b), "両辺を " + c + " でわると、" + m(xeq(x0))];
      if (c === 1) lines.pop();   // 係数が 1 のときは、わる行を出さない(前の行がそのまま答え)
      wrongs = [a * c / b, a + b - c, b];
    } else {
      a = p * t; x0 = q * t;
      math = m(a, ":", X, "=", b, ":", c);
      lines = [m(M.term(b, X), "=", a, "*", c), m(M.term(b, X), "=", a * c), "両辺を " + b + " でわると、" + m(xeq(x0))];
      if (b === 1) lines.pop();
      wrongs = [a * b / c, a + c - b, c];
    }
    lines.unshift("比例式の性質「" + mf("a : b = c : d") + " ならば " + mf("ad = bc") + "」を使います(外側の積 = 内側の積)。");
    return build({
      text: "次の比例式で、" + m(X) + " の値を求めなさい。",
      math: math,
      explain: lines,
      meta: { kind: "ratio" }
    }, M.numChoices(x0, wrongs, { fmt: xeq, ok: function (n) { return n > 0; } }));
  }

  // 文章題(過不足)
  function genEqWord() {
    var a = M.rand(2, 5), diff = M.rand(1, 3), b = a + diff, x0 = M.rand(4, 12);
    var r = M.rand(1, Math.min(diff * x0 - 1, 12)), s = diff * x0 - r;
    var total = a * x0 + r;
    return build({
      text: "何人かの子どもに鉛筆を配ります。1人に " + a + " 本ずつ配ると " + r + " 本余り、1人に " + b + " 本ずつ配ると " + s + " 本たりません。子どもの人数を求めなさい。",
      explain: [
        "子どもの人数を " + m(X) + " 人として、鉛筆の本数を2通りに表します。",
        m(M.linear(a, r), "=", M.linear(b, -s)),
        m(M.poly([[a, X], [-b, X]]), "=", -s, "-", r),
        m(M.term(a - b, X), "=", -s - r),
        m(xeq(x0)),
        "鉛筆は " + m(a, "*", x0, "+", r, "=", total) + "(本)で、問題に合っています。"
      ],
      meta: { kind: "word-excess", a: a, b: b, r: r, s: s }
    }, M.numChoices(x0, [abs(s - r) / diff, r + s, x0 + diff, x0 - 1], { fmt: function (n) { return M.num(n) + " 人"; }, ok: function (n) { return n > 0; } }));
  }

  JHM.register("g1-linear-equations", {
    points: [
      "<b>方程式</b>は、文字の値によって成り立ったり成り立たなかったりする等式です。成り立たせる文字の値を<b>解</b>といいます。",
      "<b>等式の性質</b>: 両辺に同じ数をたしても、ひいても、かけても、0 でない同じ数でわっても、等式は成り立ちます。",
      "<b>移項</b>: 項を反対の辺に移すと、符号が変わります。" + M.rule(mf("3x - 5 = 16")) + " → " + M.rule(mf("3x = 16 + 5")),
      "<b>解く手順</b>: かっこをはずす(分数は分母をはらう)→ 文字の項を左辺、数の項を右辺に移項 → " + mf("ax = b") + " の形にする → 両辺を " + mf("a") + " でわる。",
      "<b>比例式</b>: " + M.rule(mf("a : b = c : d")) + " ならば " + M.rule(mf("ad = bc"))
    ],
    example: {
      title: mf("5x - 3 = 2x + 9") + " を解きなさい。",
      steps: [
        mf("5x - 3 = 2x + 9"),
        mf("5x - 2x = 9 + 3") + "(移項)",
        mf("3x = 12")
      ],
      result: mf("x = 4")
    },
    generators: [
      { id: "basic", label: "ax + b = c", make: genEqBasic },
      { id: "both-sides", label: "両辺に x がある", make: genEqBothSides },
      { id: "paren", label: "かっこがある", make: genEqParen },
      { id: "fraction", label: "分数がある", make: genEqFraction },
      { id: "ratio", label: "比例式", make: genEqRatio },
      { id: "word", label: "文章題(過不足)", make: genEqWord }
    ]
  });

  // =====================================================================
  // 1-4 比例と反比例
  // =====================================================================

  // y = (n/d)x と y = a/x の書き方(同じ値はかならず同じHTMLになる)
  function propEq(n, d) { return Y + M.op("=") + M.term([n, d || 1], X); }
  function invEq(a) { return a === 0 ? null : Y + M.op("=") + (a < 0 ? M.MINUS : "") + M.frac(abs(a), X); }
  var SLOPES = [[2, 1], [3, 1], [4, 1], [-2, 1], [-3, 1], [-4, 1], [1, 2], [-1, 2], [3, 2], [-3, 2], [2, 3], [-2, 3], [1, 3], [-1, 3]];
  var VA = v("a");

  // 比例: 式を求める、y の値を求める
  function genProp() {
    var sl = M.pick(SLOPES), n = sl[0], d = sl[1];
    var p = d * M.randNZ(-3, 3), q = n * p / d;
    var given = m(X, "=", p) + " のとき " + m(Y, "=", q);
    var findA = [
      "比例の式は " + mf("y = ax") + " です。" + m(X, "=", p) + "、" + m(Y, "=", q) + " を代入して " + mf("a") + " を求めます。",
      m(q, "=", VA, "*", p),
      m(VA, "=", M.fracNum(q, p))
    ];
    if (Math.random() < 0.5) {
      return build({
        text: m(Y) + " は " + m(X) + " に比例し、" + given + " です。" + m(Y) + " を " + m(X) + " の式で表しなさい。",
        explain: findA.concat(["したがって、" + m(propEq(n, d))]),
        meta: { kind: "prop-eq", p: p, q: q }
      }, M.choices(propEq(n, d), [propEq(d, n), propEq(-n, d), invEq(p * q), propEq(p * q, 1)], function () {
        return propEq(n + M.randNZ(-2, 2) || 1, d);
      }));
    }
    var r;
    do { r = d * M.randNZ(-4, 4); } while (r === p);
    var ans = n * r / d;
    return build({
      text: m(Y) + " は " + m(X) + " に比例し、" + given + " です。" + m(X, "=", r) + " のときの " + m(Y) + " の値を求めなさい。",
      explain: findA.concat([
        "式は " + m(propEq(n, d)) + " です。" + m(X, "=", r) + " を代入します。",
        m(Y, "=", M.fracNum(n, d), "*", r, "=", ans)
      ]),
      meta: { kind: "prop-value", p: p, q: q, r: r }
    }, M.numChoices(ans, [-ans, p * q / r, q + (r - p), q * r], { fmt: function (k) { return Y + M.op("=") + M.num(k); } }));
  }

  // 反比例: 式を求める、y の値を求める
  function genInverse() {
    var p, q, a;
    do { p = M.randNZ(-6, 6); q = M.randNZ(-8, 8); a = p * q; } while (abs(a) < 4 || abs(p) === 1 && abs(q) === 1);
    var given = m(X, "=", p) + " のとき " + m(Y, "=", q);
    var findA = [
      "反比例の式は " + mf("y = {a/x}") + " です。比例定数は " + mf("a = xy") + " で求められます。",
      m(VA, "=", p, "*", q, "=", a)
    ];
    if (Math.random() < 0.5) {
      return build({
        text: m(Y) + " は " + m(X) + " に反比例し、" + given + " です。" + m(Y) + " を " + m(X) + " の式で表しなさい。",
        explain: findA.concat(["したがって、" + m(invEq(a))]),
        meta: { kind: "inv-eq", p: p, q: q }
      }, M.choices(invEq(a), [invEq(-a), propEq(q, p), propEq(a, 1), invEq(p + q)], function () {
        return invEq(a + M.randNZ(-3, 3) || 1);
      }));
    }
    var divs = [];
    for (var k = 1; k <= 12; k++) if (abs(a) % k === 0) { divs.push(k); divs.push(-k); }
    divs = divs.filter(function (t) { return t !== p; });
    var r = M.pick(divs), ans = a / r;
    return build({
      text: m(Y) + " は " + m(X) + " に反比例し、" + given + " です。" + m(X, "=", r) + " のときの " + m(Y) + " の値を求めなさい。",
      explain: findA.concat([
        "式は " + m(invEq(a)) + " です。" + m(X, "=", r) + " を代入します。",
        m(Y, "=", a, "/", r, "=", ans)
      ]),
      meta: { kind: "inv-value", p: p, q: q, r: r }
    }, M.numChoices(ans, [-ans, q * r / p, a, q + (r - p)], { fmt: function (t) { return Y + M.op("=") + M.num(t); } }));
  }

  // グラフから式を求める(図つき)
  function genGraphEq() {
    if (Math.random() < 0.55) {
      var sl = M.pick(SLOPES.concat([[1, 1], [-1, 1]])), n = sl[0], d = sl[1];
      var ks = [1, -1, 2, -2].filter(function (k) { return abs(d * k) <= 5 && abs(n * k) <= 5; });
      var k = M.pick(ks), px = d * k, py = n * k;
      return build({
        text: "図の直線は比例のグラフです。" + m(Y) + " を " + m(X) + " の式で表しなさい(1目もりは 1)。",
        figure: M.plane({
          range: 5,
          label: "座標平面にかかれた、原点と点 " + M.text(M.coord(px, py)) + " を通る直線",
          items: [{ type: "line", a: n / d }, { type: "point", x: px, y: py }]
        }),
        explain: [
          "グラフは点 " + m(M.coord(px, py)) + " を通ります。" + mf("y = ax") + " に代入します。",
          m(py, "=", VA, "*", px),
          m(VA, "=", M.fracNum(py, px)),
          "したがって、" + m(propEq(n, d))
        ],
        meta: { kind: "graph-line", px: px, py: py }
      }, M.choices(propEq(n, d), [propEq(-n, d), propEq(d, n), propEq(-d, n), invEq(px * py)], function () {
        return propEq(n + M.randNZ(-2, 2) || 1, d);
      }));
    }
    var a = M.pick([2, 3, 4, 6, 8]) * M.pick([1, -1]);
    var cand = [1, 2, 3, 4, 5, -1, -2, -3, -4, -5].filter(function (t) { return a % t === 0 && abs(a / t) <= 5; });
    var hx = M.pick(cand), hy = a / hx;
    return build({
      text: "図の双曲線は反比例のグラフです。" + m(Y) + " を " + m(X) + " の式で表しなさい(1目もりは 1)。",
      figure: M.plane({
        range: 5,
        label: "座標平面にかかれた、点 " + M.text(M.coord(hx, hy)) + " を通る双曲線",
        items: [{ type: "hyperbola", a: a }, { type: "point", x: hx, y: hy }]
      }),
      explain: [
        "グラフは点 " + m(M.coord(hx, hy)) + " を通ります。反比例の比例定数は " + mf("a = xy") + " です。",
        m(VA, "=", hx, "*", hy, "=", a),
        "したがって、" + m(invEq(a))
      ],
      meta: { kind: "graph-hyperbola", px: hx, py: hy }
    }, M.choices(invEq(a), [invEq(-a), propEq(hy, hx), propEq(a, 1), invEq(hx + hy)], function () {
      return invEq(a + M.randNZ(-3, 3) || 1);
    }));
  }

  // グラフ上の点を選ぶ
  function genOnGraph() {
    var isLine = Math.random() < 0.5, eq, on, px, py, cands, a, n, d;
    if (isLine) {
      var sl = M.pick(SLOPES); n = sl[0]; d = sl[1];
      var k = M.randNZ(-3, 3);
      px = d * k; py = n * k;
      eq = propEq(n, d);
      on = function (x, y) { return n * x === d * y; };
      cands = [[px, -py], [py, px], [-px, py], [px, py + 1], [px + d, py], [px, n * d]];
    } else {
      a = M.pick([6, 8, 12, 18, 20, 24]) * M.pick([1, -1]);
      var divs = [1, 2, 3, 4, 6].filter(function (t) { return a % t === 0; });
      px = M.pick(divs) * M.pick([1, -1]); py = a / px;
      eq = invEq(a);
      on = function (x, y) { return x * y === a; };
      cands = [[px, -py], [-px, py], [px, py + 1], [px + 1, py], [px, abs(a) - abs(px)], [2, a]];
    }
    var correct = M.coord(px, py);
    var wrongs = cands.filter(function (c) { return !on(c[0], c[1]); }).map(function (c) { return M.coord(c[0], c[1]); });
    var sub = isLine ? m(Y, "=", M.fracNum(n, d), "*", px, "=", py) : m(Y, "=", a, "/", px, "=", py);
    return build({
      text: "次の点のうち、下の関数のグラフ上にある点はどれですか。",
      math: m(eq),
      explain: [
        m(X) + " 座標を式に代入して、" + m(Y) + " 座標と等しくなる点をさがします。",
        m(X, "=", px) + " のとき " + sub,
        "したがって、点 " + m(correct) + " はグラフ上にあります。ほかの点は、代入しても " + m(Y) + " 座標が合いません。"
      ],
      meta: { kind: "on-graph" }
    }, M.choices(correct, wrongs, function () {
      var x = M.randNZ(-6, 6), y = M.randNZ(-9, 9);
      return on(x, y) ? null : M.coord(x, y);
    }));
  }

  var propFixed = [
    {
      id: "read-point",
      text: "図の点 A の座標を答えなさい(1目もりは 1)。",
      figure: M.plane({ range: 5, label: "座標平面。点 A は原点から左へ 3、上へ 2 の位置にある", items: [{ type: "point", x: -3, y: 2, label: "A" }] }),
      choices: [f("(-3, 2)"), f("(2, -3)"), f("(3, -2)"), f("(-2, 3)")],
      answer: 0,
      explain: [
        "座標は " + mf("(x '座標', y '座標')") + " の順に書きます。",
        "点 A は原点から左へ 3(" + mf("x") + " 座標は " + mf("-3") + ")、上へ 2(" + mf("y") + " 座標は " + mf("2") + ")の位置にあります。",
        "したがって A" + mf("(-3, 2)")
      ]
    },
    {
      id: "domain",
      text: "関数 " + mf("y = -2x") + " で、" + mf("x") + " の変域が " + mf("-1 <= x <= 3") + " のとき、" + mf("y") + " の変域を求めなさい。",
      choices: [f("-6 <= y <= 2"), f("2 <= y <= -6"), f("-2 <= y <= 6"), f("-6 <= y <= -2")],
      answer: 0,
      choiceLayout: "stack",
      explain: [
        "変域の両端の " + mf("x") + " の値を代入します。",
        mf("x = -1") + " のとき " + mf("y = -2 * (-1) = 2"),
        mf("x = 3") + " のとき " + mf("y = -2 * 3 = -6"),
        "小さいほうを左に書いて、" + mf("-6 <= y <= 2")
      ]
    },
    {
      id: "which-inverse",
      text: "次のうち、" + mf("y") + " が " + mf("x") + " に反比例するものはどれですか。",
      textChoices: true,
      choices: [
        "面積が 24 cm<sup>2</sup> の長方形の、縦の長さ " + mf("x") + " cm と横の長さ " + mf("y") + " cm",
        "1本 80 円の鉛筆を " + mf("x") + " 本買ったときの代金 " + mf("y") + " 円",
        "1辺が " + mf("x") + " cm の正方形の周の長さ " + mf("y") + " cm",
        "1000 円を持っていて " + mf("x") + " 円使ったときの残り " + mf("y") + " 円"
      ],
      answer: 0,
      explain: [
        "式に表して、" + mf("y = {a/x}") + " の形になるものをさがします。",
        "長方形: " + mf("xy = 24") + " より " + mf("y = {24/x}") + "(反比例)",
        "鉛筆: " + mf("y = 80x") + "(比例)、正方形: " + mf("y = 4x") + "(比例)",
        "残金: " + mf("y = 1000 - x") + "(比例でも反比例でもない)"
      ]
    },
    {
      id: "prop-statement",
      text: "比例 " + mf("y = -2x") + " について、正しいものはどれですか。",
      textChoices: true,
      choices: [
        mf("x") + " の値が 1 増えると、" + mf("y") + " の値は 2 減る",
        "グラフは右上がりの直線である",
        "グラフは原点を通らない",
        mf("x") + " の値が 2 倍になると、" + mf("y") + " の値は " + mf("{1/2}") + " 倍になる"
      ],
      answer: 0,
      explain: [
        "比例 " + mf("y = ax") + " のグラフは原点を通る直線で、" + mf("a < 0") + " のとき右下がりです。",
        mf("x") + " が 1 増えると " + mf("y") + " は " + mf("a") + " だけ変わります。" + mf("a = -2") + " なので 2 減ります。",
        "比例では、" + mf("x") + " が 2 倍になると " + mf("y") + " も 2 倍になります。"
      ]
    },
    {
      id: "intersection",
      text: "図で、直線は比例 " + mf("y = ax") + "、曲線(点線)は反比例 " + mf("y = {b/x}") + " のグラフで、点 A(2, 4) で交わっています。" + mf("a") + "、" + mf("b") + " の値を求めなさい。",
      figure: M.plane({
        range: 5,
        label: "座標平面にかかれた、原点を通る直線と双曲線。2つのグラフは点 A(2, 4) で交わる",
        items: [{ type: "hyperbola", a: 8, cls: "fig-line-2" }, { type: "line", a: 2 }, { type: "point", x: 2, y: 4, label: "A" }]
      }),
      choices: [f("a = 2, b = 8"), f("a = 2, b = 2"), f("a = {1/2}, b = 8"), f("a = 8, b = 2")],
      answer: 0,
      explain: [
        "点 A(2, 4) は両方のグラフ上にあるので、それぞれの式に代入します。",
        "比例: " + mf("4 = a * 2") + " より " + mf("a = 2"),
        "反比例: " + mf("b = xy = 2 * 4 = 8")
      ]
    },
    {
      id: "symmetric",
      text: "図の点 A(3, −2) と、" + mf("x") + " 軸について対称な点の座標を答えなさい。",
      figure: M.plane({ range: 5, label: "座標平面。点 A は (3, −2) にある", items: [{ type: "point", x: 3, y: -2, label: "A" }] }),
      choices: [f("(3, 2)"), f("(-3, -2)"), f("(-3, 2)"), f("(-2, 3)")],
      answer: 0,
      explain: [
        mf("x") + " 軸について対称な点は、" + mf("y") + " 座標の符号だけが変わります。",
        mf("(3, -2)") + " → " + mf("(3, 2)"),
        mf("y") + " 軸について対称なら " + mf("(-3, -2)") + "、原点について対称なら " + mf("(-3, 2)") + " です。"
      ]
    },
    {
      id: "constant",
      text: "関数 " + mf("y = -{x/3}") + " の比例定数を答えなさい。",
      choices: [M.fracNum(-1, 3), f("-3"), M.fracNum(1, 3), f("3")],
      answer: 0,
      explain: [
        mf("y = ax") + " の " + mf("a") + " が比例定数です。",
        mf("-{x/3} = -{1/3}x") + " なので、比例定数は " + mf("-{1/3}")
      ]
    },
    {
      id: "inverse-statement",
      text: "反比例 " + mf("y = {12/x}") + " について、正しいものはどれですか。",
      textChoices: true,
      choices: [
        mf("x") + " の値が 2 倍になると、" + mf("y") + " の値は " + mf("{1/2}") + " 倍になる",
        mf("x") + " の値が 2 倍になると、" + mf("y") + " の値も 2 倍になる",
        "グラフは原点を通る",
        "グラフは1本の直線である"
      ],
      answer: 0,
      explain: [
        "反比例では、" + mf("x") + " の値が 2 倍、3 倍になると、" + mf("y") + " の値は " + mf("{1/2}") + " 倍、" + mf("{1/3}") + " 倍になります。",
        "例: " + mf("x = 2") + " のとき " + mf("y = 6") + "、" + mf("x = 4") + " のとき " + mf("y = 3"),
        "グラフは双曲線(2つのなめらかな曲線)で、原点も座標軸も通りません。"
      ]
    }
  ];

  JHM.register("g1-proportion", {
    points: [
      mf("x") + " の値を決めると " + mf("y") + " の値がただ1つに決まるとき、" + mf("y") + " は " + mf("x") + " の<b>関数</b>であるといいます。変数のとりうる値の範囲が<b>変域</b>です。" + M.rule(mf("0 <= x <= 5")),
      "<b>比例</b> " + M.rule(mf("y = ax")) + "(" + mf("a") + " は比例定数)。" + mf("x") + " が 2 倍、3 倍になると " + mf("y") + " も 2 倍、3 倍。グラフは原点を通る直線で、" + mf("a > 0") + " なら右上がり、" + mf("a < 0") + " なら右下がり。",
      "<b>反比例</b> " + M.rule(mf("y = {a/x}")) + "。" + mf("x") + " が 2 倍、3 倍になると " + mf("y") + " は " + mf("{1/2}") + " 倍、" + mf("{1/3}") + " 倍。積 " + M.rule(mf("xy = a")) + " が一定。グラフは双曲線。",
      "<b>座標</b>: 点の位置を " + mf("(x '座標', y '座標')") + " で表します。" + mf("x") + " 軸について対称な点は " + mf("y") + " 座標の符号が、" + mf("y") + " 軸について対称な点は " + mf("x") + " 座標の符号が変わります。"
    ],
    example: {
      title: mf("y") + " は " + mf("x") + " に反比例し、" + mf("x = 3") + " のとき " + mf("y = -4") + " です。" + mf("x = -6") + " のときの " + mf("y") + " の値を求めなさい。",
      steps: [
        mf("a = xy = 3 * (-4) = -12"),
        "式は " + mf("y = -{12/x}"),
        mf("y = -12 / (-6)")
      ],
      result: mf("y = 2")
    },
    figure: {
      html: M.plane({
        range: 5,
        label: "比例 y = 2x のグラフ(原点を通る直線)と、反比例 y = 6/x のグラフ(双曲線)",
        items: [
          { type: "hyperbola", a: 6, cls: "fig-line-2" },
          { type: "line", a: 2 },
          { type: "label", x: 2.6, y: 4.5, text: fig.v("y") + " = 2" + fig.v("x"), anchor: "start" },
          { type: "label", x: 3.2, y: 2.3, text: fig.v("y") + " = 6/" + fig.v("x"), anchor: "start" }
        ]
      }),
      caption: "実線は比例 y = 2x(原点を通る直線)、点線は反比例 y = 6/x(双曲線)。"
    },
    generators: [
      { id: "prop", label: "比例の式と値", make: genProp },
      { id: "inverse", label: "反比例の式と値", make: genInverse },
      { id: "graph-eq", label: "グラフから式を求める", make: genGraphEq },
      { id: "on-graph", label: "グラフ上の点", make: genOnGraph }
    ],
    fixed: propFixed
  });

  // =====================================================================
  // 1-5 平面図形
  // =====================================================================

  // おうぎ形の図。deg: 中心角、rText: 半径の書きこみ、opts.arcText: 弧の書きこみ、opts.angleText: 角の書きこみ
  function sectorFig(deg, rText, opts) {
    opts = opts || {};
    var cx = 130, cy = 150, r = 115, d0 = 90 - deg / 2, d1 = 90 + deg / 2;
    var s = fig.sector(cx, cy, r, d0, d1, "fig-fill") + fig.sector(cx, cy, r, d0, d1, "fig-shape");
    s += fig.arc(cx, cy, 20, d0, d1, "fig-axis");
    // 半径の書きこみは、右側の半径の外側に置く
    var mid = fig.polar(cx, cy, r * 0.55, d0), out = fig.polar(mid[0], mid[1], 12, d0 - 90);
    s += fig.text(out[0], out[1] + 6, rText, "start");
    s += fig.text(cx, cy - 28, opts.angleText === undefined ? deg + "°" : opts.angleText, "middle");
    if (opts.arcText) s += fig.text(cx, cy - r - 8, opts.arcText, "middle");
    s += fig.dot(cx, cy, 2.5) + fig.text(cx, cy + 16, "O", "middle");
    return M.svg(260, 172, opts.label || "おうぎ形", s);
  }
  var tangentFig = (function () {
    var cx = 110, cy = 95, r = 60;
    var a = fig.polar(cx, cy, r, 40), t1 = [a[0] - 70 * Math.sin(40 * Math.PI / 180), a[1] - 70 * Math.cos(40 * Math.PI / 180)];
    var t2 = [a[0] + 70 * Math.sin(40 * Math.PI / 180), a[1] + 70 * Math.cos(40 * Math.PI / 180)];
    var s = fig.circle(cx, cy, r) + fig.line(cx, cy, a[0], a[1], "fig-line") + fig.line(t1[0], t1[1], t2[0], t2[1]);
    s += fig.dot(cx, cy, 2.5) + fig.dot(a[0], a[1], 3) + fig.text(cx - 10, cy + 5, "O", "end") + fig.text(a[0] + 10, a[1] - 4, "A", "start");
    s += fig.text(t2[0] + 4, t2[1] + 14, fig.v("ℓ"), "middle");
    return M.svg(260, 180, "円 O と、周上の点 A を通る接線 ℓ。半径 OA もかかれている", s);
  })();
  // 単位(M.f の書き方。' ' の中はそのままの文字になる)
  var cm = "' cm'", cm2 = "' cm'^2", cm3 = "' cm'^3";

  var planeFixed = [
    {
      id: "arc-length",
      text: "半径 6 cm、中心角 60° のおうぎ形の弧の長さを求めなさい。",
      figure: sectorFig(60, "6 cm", { label: "半径 6 cm、中心角 60° のおうぎ形" }),
      choices: [f("2π" + cm), f("6π" + cm), f("12π" + cm), f("π" + cm)],
      answer: 0,
      explain: [
        "弧の長さは、円周の " + mf("{'中心角'/360}") + " 倍です。",
        mf("2π * 6 * {60/360}"),
        mf("= 12π * {1/6} = 2π") + "(cm)"
      ]
    },
    {
      id: "sector-area",
      text: "半径 4 cm、中心角 135° のおうぎ形の面積を求めなさい。",
      figure: sectorFig(135, "4 cm", { label: "半径 4 cm、中心角 135° のおうぎ形" }),
      choices: [f("6π" + cm2), f("3π" + cm2), f("16π" + cm2), f("12π" + cm2)],
      answer: 0,
      explain: [
        "おうぎ形の面積は、円の面積の " + mf("{'中心角'/360}") + " 倍です。",
        mf("π * 4^2 * {135/360}"),
        mf("= 16π * {3/8} = 6π") + "(cm<sup>2</sup>)"
      ]
    },
    {
      id: "circumference",
      text: "半径 5 cm の円の周の長さを求めなさい。",
      choices: [f("10π" + cm), f("25π" + cm), f("5π" + cm), f("20π" + cm)],
      answer: 0,
      explain: [
        "円周の長さは " + mf("\\ℓ = 2πr") + " です。",
        mf("2π * 5 = 10π") + "(cm)",
        "面積なら " + mf("πr^2 = 25π") + "(cm<sup>2</sup>)です。"
      ]
    },
    {
      id: "central-angle",
      text: "半径 4 cm、弧の長さ 2π cm のおうぎ形の中心角を求めなさい。",
      choices: ["90°", "45°", "180°", "60°"],
      answer: 0,
      explain: [
        "半径 4 cm の円の円周は " + mf("2π * 4 = 8π") + "(cm)です。",
        "弧の長さは円周の " + mf("{2π/8π} = {1/4}") + " にあたります。",
        "中心角は " + mf("360° * {1/4} = 90°")
      ]
    },
    {
      id: "area-from-arc",
      text: "半径 6 cm、弧の長さ 4π cm のおうぎ形の面積を求めなさい。",
      choices: [f("12π" + cm2), f("24π" + cm2), f("36π" + cm2), f("4π" + cm2)],
      answer: 0,
      explain: [
        "おうぎ形の面積は " + mf("\\S = {1/2}\\ℓr") + "(ℓ は弧の長さ)でも求められます。",
        mf("{1/2} * 4π * 6 = 12π") + "(cm<sup>2</sup>)"
      ]
    },
    {
      id: "perpendicular-bisector",
      text: "2点 A、B から等しい距離にある点は、どんな線の上にありますか。",
      textChoices: true,
      choices: ["線分 AB の垂直二等分線", "線分 AB に平行な直線", "点 A を中心とする円", "∠AOB の二等分線"],
      answer: 0,
      explain: [
        "線分の垂直二等分線上の点は、線分の両端から等しい距離にあります。",
        "逆に、2点 A、B から等しい距離にある点は、線分 AB の垂直二等分線上にあります。"
      ]
    },
    {
      id: "angle-bisector",
      text: "∠AOB の2辺 OA、OB から等しい距離にある点は、どんな線の上にありますか。",
      textChoices: true,
      choices: ["∠AOB の二等分線", "線分 AB の垂直二等分線", "点 O を通る OA の垂線", "点 O を中心とする円"],
      answer: 0,
      explain: [
        "角の二等分線上の点は、角の2辺から等しい距離にあります。",
        "2辺に接する円の中心を作図するときなどに使います。"
      ]
    },
    {
      id: "translation",
      text: "図形を、一定の方向に一定の距離だけずらす移動を何といいますか。",
      textChoices: true,
      choices: ["平行移動", "回転移動", "対称移動", "点対称移動"],
      answer: 0,
      explain: [
        "平行移動: 一定の方向に一定の距離だけずらす。",
        "回転移動: 1つの点を中心に一定の角度だけ回す。",
        "対称移動: 1つの直線を折り目として折り返す。"
      ]
    },
    {
      id: "point-symmetry",
      text: "回転移動のうち、180° の回転移動を特に何といいますか。",
      textChoices: true,
      choices: ["点対称移動", "対称移動", "平行移動", "垂直移動"],
      answer: 0,
      explain: [
        "180° の回転移動を点対称移動といいます。",
        "対応する点を結ぶ線分は、すべて回転の中心を通り、中心で二等分されます。"
      ]
    },
    {
      id: "tangent",
      text: "図で、直線 ℓ は点 A で円 O に接しています。半径 OA と接線 ℓ がつくる角の大きさを答えなさい。",
      figure: tangentFig,
      choices: ["90°", "45°", "60°", "180°"],
      answer: 0,
      explain: [
        "円の接線は、接点を通る半径に垂直です。",
        "したがって OA ⊥ ℓ で、角の大きさは 90° です。"
      ]
    },
    {
      id: "symbol-perpendicular",
      text: "「直線 AB と直線 CD は垂直である」を、記号を使って表したものはどれですか。",
      choices: ["AB ⊥ CD", "AB ∥ CD", "AB = CD", "∠ABC = ∠BCD"],
      answer: 0,
      choiceLayout: "stack",
      explain: [
        "垂直は ⊥、平行は ∥ の記号で表します。",
        "AB ⊥ CD は「AB 垂直 CD」、AB ∥ CD は「AB 平行 CD」と読みます。"
      ]
    }
  ];

  JHM.register("g1-plane-figures", {
    points: [
      "<b>直線・線分・半直線</b>: 両方向に限りなくのびるのが直線、両端があるのが線分、一方だけにのびるのが半直線。平行は " + M.rule("AB ∥ CD") + "、垂直は " + M.rule("AB ⊥ CD") + " と書きます。",
      "<b>図形の移動</b>: 平行移動(ずらす)、回転移動(回す)、対称移動(折り返す)。180° の回転移動は点対称移動といいます。",
      "<b>基本の作図</b>: 垂直二等分線(2点から等しい距離にある点の集まり)、角の二等分線(角の2辺から等しい距離にある点の集まり)、垂線。",
      "<b>円</b>: 円周 " + M.rule(mf("\\ℓ = 2πr")) + "、面積 " + M.rule(mf("\\S = πr^2")) + "。円の接線は、接点を通る半径に垂直です。",
      "<b>おうぎ形</b>(半径 " + mf("r") + "、中心角 " + mf("a") + "°): 弧の長さ " + M.rule(mf("\\ℓ = 2πr * {a/360}")) + "、面積 " + M.rule(mf("\\S = πr^2 * {a/360}")) + "。面積は " + M.rule(mf("\\S = {1/2}\\ℓr")) + " でも求められます。"
    ],
    example: {
      title: "半径 6 cm、中心角 120° のおうぎ形の、弧の長さと面積を求めなさい。",
      steps: [
        "弧: " + mf("2π * 6 * {120/360} = 4π"),
        "面積: " + mf("π * 6^2 * {120/360} = 12π")
      ],
      result: "弧の長さ " + mf("4π" + cm) + "、面積 " + mf("12π" + cm2)
    },
    figure: {
      html: sectorFig(100, fig.v("r"), { angleText: fig.v("a") + "°", arcText: fig.v("ℓ"), label: "半径 r、中心角 a° のおうぎ形。弧の長さは ℓ" }),
      caption: "おうぎ形。r は半径、a° は中心角、ℓ は弧の長さ。"
    },
    fixed: planeFixed
  });

  // =====================================================================
  // 1-6 空間図形
  // =====================================================================

  // 立方体 ABCD-EFGH(上の面が ABCD、下の面が EFGH)
  var cubeFig = (function () {
    var fx = 50, fy = 62, sz = 96, ox = 48, oy = -36;
    var A = [fx, fy], B = [fx + sz, fy], F = [fx + sz, fy + sz], E = [fx, fy + sz];
    var D = [A[0] + ox, A[1] + oy], C = [B[0] + ox, B[1] + oy], G = [F[0] + ox, F[1] + oy], H = [E[0] + ox, E[1] + oy];
    var s = fig.poly([A, B, F, E]) + fig.poly([A, D, C, B], "fig-shape") + fig.poly([B, C, G, F], "fig-shape");
    s += fig.line(D[0], D[1], H[0], H[1], "fig-line-2") + fig.line(E[0], E[1], H[0], H[1], "fig-line-2") + fig.line(H[0], H[1], G[0], G[1], "fig-line-2");
    s += fig.line(A[0], A[1], B[0], B[1], "fig-line");
    s += fig.text(A[0] - 8, A[1] + 2, "A", "end") + fig.text(B[0] + 6, B[1] + 16, "B", "start") + fig.text(C[0] + 8, C[1] + 2, "C", "start") + fig.text(D[0] - 6, D[1] - 5, "D", "end");
    s += fig.text(E[0] - 8, E[1] + 8, "E", "end") + fig.text(F[0] + 4, F[1] + 16, "F", "start") + fig.text(G[0] + 8, G[1] + 6, "G", "start") + fig.text(H[0] + 8, H[1] - 6, "H", "start");
    return M.svg(260, 182, "立方体。上の面が ABCD、下の面が EFGH で、A の下に E、B の下に F、C の下に G、D の下に H がある", s);
  })();
  // 円柱と円錐
  var solidsFig = (function () {
    var s = "";
    // 円柱
    s += fig.ellipse(70, 40, 44, 13) + fig.line(26, 40, 26, 140) + fig.line(114, 40, 114, 140);
    s += fig.path("M26 140 A44 13 0 0 0 114 140") + fig.path("M26 140 A44 13 0 0 1 114 140", "fig-line-2");
    s += fig.line(70, 40, 114, 40, "fig-line") + fig.text(83, 36.5, fig.v("r"), "middle") + fig.text(122, 95, fig.v("h"), "start");
    s += fig.text(70, 176, "円柱", "middle");
    // 円錐
    s += fig.line(210, 24, 166, 140) + fig.line(210, 24, 254, 140);
    s += fig.path("M166 140 A44 13 0 0 0 254 140") + fig.path("M166 140 A44 13 0 0 1 254 140", "fig-line-2");
    s += fig.line(210, 24, 210, 140, "fig-line-2") + fig.line(210, 140, 254, 140, "fig-line");
    s += fig.text(226, 150.5, fig.v("r"), "middle") + fig.text(200, 100, fig.v("h"), "end") + fig.text(244, 78, "母線", "start");
    s += fig.text(210, 176, "円錐", "middle");
    return M.svg(290, 184, "円柱と円錐。底面の半径は r、高さは h。円錐の頂点と底面の円周上の点を結ぶ線分が母線", s);
  })();

  var solidFixed = [
    {
      id: "cylinder-volume",
      text: "底面の半径が 3 cm、高さが 5 cm の円柱の体積を求めなさい。",
      choices: [f("45π" + cm3), f("15π" + cm3), f("30π" + cm3), f("90π" + cm3)],
      answer: 0,
      explain: [
        "角柱・円柱の体積は " + mf("\\V = \\Sh") + "(底面積 × 高さ)です。",
        mf("π * 3^2 * 5 = 45π") + "(cm<sup>3</sup>)"
      ]
    },
    {
      id: "cone-volume",
      text: "底面の半径が 6 cm、高さが 5 cm の円錐の体積を求めなさい。",
      choices: [f("60π" + cm3), f("180π" + cm3), f("30π" + cm3), f("20π" + cm3)],
      answer: 0,
      explain: [
        "角錐・円錐の体積は " + mf("\\V = {1/3}\\Sh") + " です(同じ底面・高さの柱の " + mf("{1/3}") + ")。",
        mf("{1/3} * π * 6^2 * 5"),
        mf("= {1/3} * 180π = 60π") + "(cm<sup>3</sup>)"
      ]
    },
    {
      id: "pyramid-volume",
      text: "底面が1辺 6 cm の正方形で、高さが 5 cm の正四角錐の体積を求めなさい。",
      choices: [f("60" + cm3), f("180" + cm3), f("90" + cm3), f("30" + cm3)],
      answer: 0,
      explain: [
        "底面積は " + mf("6 * 6 = 36") + "(cm<sup>2</sup>)です。",
        mf("\\V = {1/3}\\Sh = {1/3} * 36 * 5 = 60") + "(cm<sup>3</sup>)"
      ]
    },
    {
      id: "sphere-surface",
      text: "半径 5 cm の球の表面積を求めなさい。",
      choices: [f("100π" + cm2), f("25π" + cm2), f("50π" + cm2), f("{500/3}π" + cm2)],
      answer: 0,
      explain: [
        "球の表面積は " + mf("\\S = 4πr^2") + " です。",
        mf("4π * 5^2 = 100π") + "(cm<sup>2</sup>)"
      ]
    },
    {
      id: "sphere-volume",
      text: "半径 3 cm の球の体積を求めなさい。",
      choices: [f("36π" + cm3), f("108π" + cm3), f("12π" + cm3), f("27π" + cm3)],
      answer: 0,
      explain: [
        "球の体積は " + mf("\\V = {4/3}πr^3") + " です。",
        mf("{4/3}π * 3^3 = {4/3}π * 27 = 36π") + "(cm<sup>3</sup>)"
      ]
    },
    {
      id: "cylinder-surface",
      text: "底面の半径が 2 cm、高さが 5 cm の円柱の表面積を求めなさい。",
      choices: [f("28π" + cm2), f("24π" + cm2), f("20π" + cm2), f("40π" + cm2)],
      answer: 0,
      explain: [
        "表面積 = 側面積 + 底面積 × 2 です。",
        "側面積: 展開図は長方形で、横は底面の円周。" + mf("5 * (2π * 2) = 20π"),
        "底面積: " + mf("π * 2^2 = 4π"),
        mf("20π + 4π * 2 = 28π") + "(cm<sup>2</sup>)"
      ]
    },
    {
      id: "cone-lateral",
      text: "底面の半径が 2 cm、母線の長さが 6 cm の円錐の側面積を求めなさい。",
      choices: [f("12π" + cm2), f("24π" + cm2), f("36π" + cm2), f("4π" + cm2)],
      answer: 0,
      explain: [
        "側面の展開図は、半径 6 cm のおうぎ形で、弧の長さは底面の円周 " + mf("2π * 2 = 4π") + "(cm)です。",
        mf("\\S = {1/2}\\ℓr = {1/2} * 4π * 6 = 12π") + "(cm<sup>2</sup>)",
        "円錐の側面積は " + mf("π * '母線' * '底面の半径'") + " でも求められます。"
      ]
    },
    {
      id: "cone-net-angle",
      text: "底面の半径が 3 cm、母線の長さが 9 cm の円錐の展開図で、側面になるおうぎ形の中心角を求めなさい。",
      choices: ["120°", "60°", "90°", "180°"],
      answer: 0,
      explain: [
        "おうぎ形の弧の長さは、底面の円周 " + mf("2π * 3 = 6π") + "(cm)と等しくなります。",
        "半径 9 cm の円の円周は " + mf("2π * 9 = 18π") + "(cm)です。",
        "中心角は " + mf("360° * {6π/18π} = 120°")
      ]
    },
    {
      id: "skew",
      text: "図の立方体で、辺 AB とねじれの位置にある辺はどれですか。",
      figure: cubeFig,
      choices: ["辺 CG", "辺 DC", "辺 BF", "辺 EF"],
      answer: 0,
      explain: [
        "ねじれの位置とは、平行でなく、交わりもしない2直線の位置関係です。",
        "辺 DC、辺 EF は辺 AB と平行、辺 BF は点 B で交わります。",
        "辺 AB とねじれの位置にある辺は、CG、DH、EH、FG の4本です。"
      ]
    },
    {
      id: "octahedron",
      text: "正八面体の頂点の数を答えなさい。",
      choices: ["6", "8", "12", "4"],
      answer: 0,
      explain: [
        "正八面体は、8つの正三角形でできた正多面体です。",
        "面の数は 8、辺の数は 12、頂点の数は 6 です。",
        "正多面体は、正四面体・正六面体・正八面体・正十二面体・正二十面体の5種類です。"
      ]
    },
    {
      id: "solid-of-revolution",
      text: "直角三角形を、直角をはさむ辺の1つを軸として1回転させてできる立体は何ですか。",
      textChoices: true,
      choices: ["円錐", "円柱", "球", "三角錐"],
      answer: 0,
      explain: [
        "平面図形を、1つの直線を軸として1回転させてできる立体を回転体といいます。",
        "直角三角形 → 円錐、長方形 → 円柱、半円 → 球 になります。"
      ]
    },
    {
      id: "projection",
      text: "立面図(正面から見た図)が二等辺三角形、平面図(真上から見た図)が円である立体は何ですか。",
      textChoices: true,
      choices: ["円錐", "円柱", "三角柱", "球"],
      answer: 0,
      explain: [
        "投影図は、立面図(正面から)と平面図(真上から)を組にして表します。",
        "真上から見て円、正面から見て三角形なので、円錐です。",
        "円柱なら立面図は長方形、球なら立面図も円になります。"
      ]
    }
  ];

  JHM.register("g1-solid-figures", {
    points: [
      "<b>多面体</b>: 平面だけで囲まれた立体。正多面体は、正四面体・正六面体・正八面体・正十二面体・正二十面体の5種類だけです。",
      "<b>2直線の位置関係</b>: 交わる、平行、ねじれの位置(平行でなく、交わらない)の3つ。",
      "<b>回転体と投影図</b>: 平面図形を1回転させてできる立体が回転体。投影図は、立面図(正面から)と平面図(真上から)で表します。",
      "<b>体積</b>: 角柱・円柱 " + M.rule(mf("\\V = \\Sh")) + "、角錐・円錐 " + M.rule(mf("\\V = {1/3}\\Sh")) + "(" + mf("\\S") + " は底面積、" + mf("h") + " は高さ)。",
      "<b>表面積</b>: 円柱の側面積は 高さ × 底面の円周。円錐の側面積は " + M.rule(mf("π * '母線' * '底面の半径'")) + "。球は " + M.rule(mf("\\S = 4πr^2")) + "、" + M.rule(mf("\\V = {4/3}πr^3")) + "。"
    ],
    example: {
      title: "底面の半径 3 cm、高さ 4 cm、母線の長さ 5 cm の円錐の、体積と表面積を求めなさい。",
      steps: [
        "体積: " + mf("{1/3} * π * 3^2 * 4 = 12π"),
        "側面積: " + mf("π * 5 * 3 = 15π"),
        "底面積: " + mf("π * 3^2 = 9π"),
        "表面積: " + mf("15π + 9π = 24π")
      ],
      result: "体積 " + mf("12π" + cm3) + "、表面積 " + mf("24π" + cm2)
    },
    figure: {
      html: solidsFig,
      caption: "円柱と円錐。r は底面の半径、h は高さ。"
    },
    fixed: solidFixed
  });

  // =====================================================================
  // 1-7 データの活用
  // =====================================================================

  // 度数分布表(通学時間、20人)
  var CLASS_EDGES = [0, 10, 20, 30, 40, 50], CLASS_FREQS = [2, 6, 7, 4, 1];
  var freqTable = (function () {
    var rows = CLASS_FREQS.map(function (fr, i) {
      return "<tr><td>" + CLASS_EDGES[i] + " 以上 " + CLASS_EDGES[i + 1] + " 未満</td><td>" + fr + "</td></tr>";
    }).join("");
    return '<table class="data-table"><caption>通学時間の度数分布表</caption><thead><tr><th scope="col">階級(分)</th><th scope="col">度数(人)</th></tr></thead>' +
      "<tbody>" + rows + '<tr class="total"><td>計</td><td>20</td></tr></tbody></table>';
  })();
  var throwHist = M.histogram({
    edges: [10, 15, 20, 25, 30, 35], freqs: [3, 5, 9, 6, 2], xUnit: "m", yUnit: "人",
    label: "ハンドボール投げの記録のヒストグラム。10〜15 m が 3 人、15〜20 m が 5 人、20〜25 m が 9 人、25〜30 m が 6 人、30〜35 m が 2 人"
  });
  var tableLead = "表は、あるクラス 20 人の通学時間をまとめた度数分布表です。";

  var dataFixed = [
    {
      id: "relative-frequency",
      text: tableLead + "20 分以上 30 分未満の階級の相対度数を求めなさい。",
      figure: freqTable,
      choices: ["0.35", "0.70", "7", "0.30"],
      answer: 0,
      explain: [
        "相対度数 = その階級の度数 ÷ 度数の合計 です。",
        mf("7 / 20 = 0.35")
      ]
    },
    {
      id: "cumulative-frequency",
      text: tableLead + "20 分以上 30 分未満の階級の累積度数を求めなさい。",
      figure: freqTable,
      choices: ["15 人", "7 人", "13 人", "8 人"],
      answer: 0,
      explain: [
        "累積度数は、最初の階級からその階級までの度数の合計です。",
        mf("2 + 6 + 7 = 15") + "(人)"
      ]
    },
    {
      id: "cumulative-relative",
      text: tableLead + "10 分以上 20 分未満の階級までの累積相対度数を求めなさい。",
      figure: freqTable,
      choices: ["0.40", "0.30", "0.10", "0.75"],
      answer: 0,
      explain: [
        "累積相対度数は、最初の階級からその階級までの相対度数の合計です。",
        "累積度数は " + mf("2 + 6 = 8") + "(人)",
        mf("8 / 20 = 0.40")
      ]
    },
    {
      id: "mode",
      text: tableLead + "最頻値を求めなさい。",
      figure: freqTable,
      choices: ["25 分", "7 分", "20 分", "30 分"],
      answer: 0,
      explain: [
        "度数分布表では、度数が最も多い階級の階級値を最頻値とします。",
        "度数が最も多いのは 20 分以上 30 分未満の階級(7 人)です。",
        "階級値は " + mf("(20 + 30) / 2 = 25") + "(分)"
      ]
    },
    {
      id: "median-class",
      text: tableLead + "中央値がふくまれる階級はどれですか。",
      figure: freqTable,
      textChoices: true,
      choices: ["20 分以上 30 分未満", "10 分以上 20 分未満", "30 分以上 40 分未満", "0 分以上 10 分未満"],
      answer: 0,
      explain: [
        "20 人のデータの中央値は、小さいほうから 10 番目と 11 番目の値の平均です。",
        "累積度数は、20 分未満までが " + mf("2 + 6 = 8") + "(人)、30 分未満までが " + mf("8 + 7 = 15") + "(人)です。",
        "10 番目も 11 番目も、20 分以上 30 分未満の階級に入ります。"
      ]
    },
    {
      id: "mean-from-table",
      text: tableLead + "この表から、通学時間の平均値を求めなさい。",
      figure: freqTable,
      choices: ["23 分", "25 分", "20 分", "4 分"],
      answer: 0,
      explain: [
        "度数分布表からは、(階級値 × 度数)の合計 ÷ 度数の合計 で平均値を求めます。",
        mf("5 * 2 + 15 * 6 + 25 * 7 + 35 * 4 + 45 * 1"),
        mf("= 10 + 90 + 175 + 140 + 45 = 460"),
        mf("460 / 20 = 23") + "(分)"
      ]
    },
    {
      id: "class-value",
      text: tableLead + "30 分以上 40 分未満の階級の階級値を求めなさい。",
      figure: freqTable,
      choices: ["35 分", "30 分", "40 分", "10 分"],
      answer: 0,
      explain: [
        "階級値は、階級の真ん中の値です。",
        mf("(30 + 40) / 2 = 35") + "(分)",
        "10 分は階級の幅です。"
      ]
    },
    {
      id: "median-raw",
      text: "次の6個のデータの中央値を求めなさい。",
      math: mf("2, 4, 4, 5, 7, 8"),
      choices: ["4.5", "4", "5", "6"],
      answer: 0,
      explain: [
        "データの個数が偶数のときは、中央に並ぶ2つの値の平均を中央値とします。",
        "小さい順で 3 番目は 4、4 番目は 5 です。",
        mf("(4 + 5) / 2 = 4.5")
      ]
    },
    {
      id: "range",
      text: "次の7個のデータは、小テストの得点(点)です。範囲を求めなさい。",
      math: mf("3, 9, 5, 10, 4, 7, 6"),
      choices: ["7 点", "3 点", "6 点", "10 点"],
      answer: 0,
      explain: [
        "範囲 = 最大値 − 最小値 です。",
        "最大値は 10、最小値は 3 です。",
        mf("10 - 3 = 7") + "(点)"
      ]
    },
    {
      id: "histogram-read",
      text: "図は、あるクラス 25 人のハンドボール投げの記録のヒストグラムです。20 m 以上投げた人は何人ですか。",
      figure: throwHist,
      choices: ["17 人", "9 人", "8 人", "15 人"],
      answer: 0,
      explain: [
        "20 m 以上の階級は、20〜25 m、25〜30 m、30〜35 m の3つです。",
        mf("9 + 6 + 2 = 17") + "(人)"
      ]
    },
    {
      id: "statistical-probability",
      text: "ペットボトルのふたを 1000 回投げたところ、表向きになったのは 380 回でした。表向きになる確率は、およそいくつと考えられますか。",
      choices: ["0.38", "0.50", "0.62", "3.8"],
      answer: 0,
      explain: [
        "多数回の実験では、相対度数を確率とみなします。",
        mf("380 / 1000 = 0.38"),
        "0.62 は、表向きにならなかった回数の相対度数です。"
      ]
    },
    {
      id: "law-of-large-numbers",
      text: "びんの王冠をくり返し投げて、表が出る相対度数を調べます。正しいものはどれですか。",
      textChoices: true,
      choices: [
        "投げる回数を増やすと、表が出る相対度数は一定の値に近づいていく",
        "投げる回数を増やすと、相対度数のばらつきは大きくなっていく",
        "10 回投げれば、表はかならず確率どおりの回数だけ出る",
        "表が出る相対度数は、投げる回数に比例して大きくなる"
      ],
      answer: 0,
      explain: [
        "回数が少ないうちは相対度数がばらつきますが、回数を増やすと一定の値に近づきます。",
        "この一定の値を、そのことがらの起こる確率といいます。"
      ]
    }
  ];

  JHM.register("g1-data", {
    points: [
      "<b>度数分布表</b>: データを階級に分けて整理した表。階級の真ん中の値が<b>階級値</b>、各階級に入るデータの個数が<b>度数</b>。柱状のグラフにしたものがヒストグラムです。",
      "<b>相対度数</b> " + M.rule("相対度数 = その階級の度数 ÷ 度数の合計") + "。最初の階級からその階級までの合計が、累積度数・累積相対度数です。",
      "<b>代表値</b>: 平均値、中央値(メジアン: 大きさの順に並べたときの中央の値)、最頻値(モード: 最も多く出てくる値)。データの個数が偶数なら、中央値は中央の2つの値の平均です。",
      "<b>範囲</b> " + M.rule("範囲 = 最大値 − 最小値") + "。度数分布表から求める平均値は、(階級値 × 度数)の合計 ÷ 度数の合計。",
      "<b>ことがらの起こりやすさ</b>: 多数回の実験をすると、相対度数は一定の値に近づきます。この値を確率といいます。"
    ],
    example: {
      title: "図のヒストグラムのもとになった度数分布表(20 人)で、20 分以上 30 分未満の階級(度数 7)の相対度数と、その階級までの累積相対度数を求めなさい。",
      steps: [
        "相対度数: " + mf("7 / 20 = 0.35"),
        "累積度数: " + mf("2 + 6 + 7 = 15"),
        "累積相対度数: " + mf("15 / 20 = 0.75")
      ],
      result: "相対度数 0.35、累積相対度数 0.75"
    },
    figure: {
      html: M.histogram({
        edges: CLASS_EDGES, freqs: CLASS_FREQS, xUnit: "分", yUnit: "人",
        label: "通学時間のヒストグラム。0〜10 分が 2 人、10〜20 分が 6 人、20〜30 分が 7 人、30〜40 分が 4 人、40〜50 分が 1 人"
      }),
      caption: "20 人の通学時間のヒストグラム。度数は左から 2、6、7、4、1 人。"
    },
    fixed: dataFixed
  });
})();

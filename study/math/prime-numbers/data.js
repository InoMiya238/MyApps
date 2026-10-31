// 素数道場: 10単元の定義・問題・テクニック帳のカード・数の計算。道場(index.html)・テクニック帳(reference.html)・計算ツール(tools.html)で共有する。
// 読み込む順番: shared/store.js → (shared/review.js →) data.js
// 復習プランナー(study/review/review-planner/index.html)もこのファイルを読み込む。グローバルは PRIM の1つだけ。
//
// ■ 単元の中身の登録(このファイルの後半)
//   PRIM.register("単元ID", { cards: [カード, …], questions: [問題, …] });
//
// ■ テクニック帳のカード
//   {
//     id: "trial-division",           // reference.html の id="card-trial-division" になる。問題の ref からも使う(全単元で重ならない)
//     name: "試し割り",                // 見出し
//     en: "trial division",           // 英語名・式(.term-en)
//     desc: "説明",                    // `…` で囲んだところは <code> になる
//     widget: "sieve",                // 省略可。reference.html が動く部品を入れる("sieve" = 1〜100 のふるい)
//     code: [ブロック, …],             // 省略可。例(すだれ算・互除法など。等幅で表示)
//     options: [["例", "説明"], …],    // 省略可。opt-list(dt は等幅)
//     notes: ["注意", …]               // 省略可。注意
//   }
//
// ■ 問題(固定問題)
//   {
//     id: "b01",                      // 単元の中で重ならない名前
//     level: "basic",                 // "basic"(基礎) | "std"(標準) | "pro"(応用)
//     q: "問題文",                     // `…` で囲んだところは <code> になる
//     kind: "value",                  // 選択肢の種類。"text" = 説明文 / "value" = 数・式(等幅)
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。並びはページが毎回まぜる
//     explain: "解説",
//     ref: "trial-division"           // テクニック帳のカードの id
//   }
//
// ■ 生成問題(数を毎回ランダムに作る。basics・primality・factorize・divisors・gcd-lcm)
//   GENS の make() が { q, kind, choices, explain, meta } を返す。正解と誤答はコードで計算する。
//   choicesFrom() が、正解と重ならず4つが全部ちがう選択肢だけを返す(そろわなければ作り直す)。
//   meta は検算スクリプト用(問題に使った数と正解)。
//
// ■ コードのブロック
//   { cap: "見出し", text: "2 ) 360\n…" }   cap は省略可。1行は36文字以内を目安にする。
var PRIM = (function () {
  "use strict";

  var STATS_KEY = "primeNumbersStats";
  var SETTINGS_KEY = "primeNumbersSettings";
  var COUNT = 10;
  var KINDS = ["text", "value"];
  var GEN_COPIES = 2;       // 1回の稽古で、1つの生成問題の型から出してよい数

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
    { id: "basics", no: "01", name: "素数とは", short: "素数とは", level: "basic", keys: "定義 · 1は素数でない · 2 · 合成数 · 100以下の25個" },
    { id: "divisibility", no: "02", name: "倍数の見分け方", short: "倍数の判定", level: "basic", keys: "各位の和 · 下2・3けた · 交代和 · 7の判定" },
    { id: "primality", no: "03", name: "素数の判定", short: "素数の判定", level: "std", keys: "試し割り · √N · 6k±1 · 91 = 7×13" },
    { id: "sieve", no: "04", name: "エラトステネスのふるい", short: "ふるい", level: "basic", keys: "手順 · p² から · √N まで" },
    { id: "factorize", no: "05", name: "素因数分解", short: "素因数分解", level: "basic", keys: "すだれ算 · 指数表記 · 一意性" },
    { id: "divisors", no: "06", name: "約数の個数と総和", short: "約数", level: "std", keys: "(a+1)(b+1) · 総和の公式 · 平方数" },
    { id: "gcd-lcm", no: "07", name: "最大公約数・最小公倍数", short: "GCD・LCM", level: "std", keys: "互除法 · a×b = GCD×LCM · 互いに素" },
    { id: "powers", no: "08", name: "平方数・立方数", short: "平方・立方", level: "std", keys: "指数が偶数 · 最小のかける数 · √の簡単化" },
    { id: "factorial", no: "09", name: "階乗と素因数", short: "階乗", level: "pro", keys: "ルジャンドル · 末尾の0 · 2の個数" },
    { id: "theory", no: "10", name: "素数の性質", short: "素数の性質", level: "pro", keys: "無限 · 双子 · メルセンヌ · フェルマー · ゴールドバッハ" }
  ];

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("PRIM.register: 登録できません: " + id);
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

  // =====================================================================
  // 数の計算(道場の生成問題と計算ツールで使う)。1〜10^12 の整数で正しく動く(Number の安全な範囲)
  // =====================================================================
  var MAX_N = 1e12;
  var SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function sup(e) { return String(e).replace(/\d/g, function (d) { return SUP[d]; }); }
  function isInt(n) { return typeof n === "number" && isFinite(n) && Math.floor(n) === n; }

  // ⌊√n⌋(浮動小数点の誤差を直す)
  function isqrt(n) {
    var s = Math.floor(Math.sqrt(n));
    while (s * s > n) s--;
    while ((s + 1) * (s + 1) <= n) s++;
    return s;
  }
  // n 以下の素数の一覧(エラトステネスのふるい)。計算ツールでは √(10^12) = 10^6 まで使う
  var sieveCache = { limit: 1, list: [] };
  function primesUpTo(n) {
    n = Math.floor(n);
    if (n < 2) return [];
    if (n > sieveCache.limit) {
      var flags = new Uint8Array(n + 1), list = [];
      for (var i = 2; i <= n; i++) {
        if (flags[i]) continue;
        list.push(i);
        for (var j = i * i; j <= n; j += i) flags[j] = 1;
      }
      sieveCache = { limit: n, list: list };
    }
    var out = [], L = sieveCache.list;
    for (var k = 0; k < L.length && L[k] <= n; k++) out.push(L[k]);
    return out;
  }
  function isPrime(n) {
    if (!isInt(n) || n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (var p = 5; p * p <= n; p += 6) {
      if (n % p === 0 || n % (p + 2) === 0) return false;
    }
    return true;
  }
  function nextPrime(n) { var p = Math.floor(n) + 1; while (!isPrime(p)) p++; return p; }
  function prevPrime(n) { var p = Math.ceil(n) - 1; while (p >= 2 && !isPrime(p)) p--; return p >= 2 ? p : null; }
  // 素因数分解: [[素数, 指数], …](小さい順)。n = 1 なら []
  function factorize(n) {
    var f = [], m = n;
    for (var p = 2; p * p <= m; p += (p === 2 ? 1 : 2)) {
      if (m % p !== 0) continue;
      var e = 0;
      while (m % p === 0) { m /= p; e++; }
      f.push([p, e]);
    }
    if (m > 1) f.push([m, 1]);
    return f;
  }
  function valueOf(f) { return f.reduce(function (v, pe) { return v * Math.pow(pe[0], pe[1]); }, 1); }
  // 2³ × 3² × 5 の形にする
  function fmtFactors(f) {
    if (f.length === 0) return "1";
    return f.map(function (pe) { return pe[1] === 1 ? String(pe[0]) : pe[0] + sup(pe[1]); }).join(" × ");
  }
  function numDivisors(f) { return f.reduce(function (d, pe) { return d * (pe[1] + 1); }, 1); }
  function sumDivisors(f) {
    return f.reduce(function (s, pe) {
      var t = 0, pw = 1;
      for (var i = 0; i <= pe[1]; i++) { t += pw; pw *= pe[0]; }
      return s * t;
    }, 1);
  }
  // 約数の一覧(小さい順)。limit を超える個数なら null
  function divisorsOf(f, limit) {
    var list = [1];
    f.forEach(function (pe) {
      var next = [], pw = 1;
      for (var i = 0; i <= pe[1]; i++) {
        list.forEach(function (d) { next.push(d * pw); });
        pw *= pe[0];
      }
      list = next;
    });
    if (limit && list.length > limit) return null;
    return list.sort(function (a, b) { return a - b; });
  }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  // 互除法の段: [{ a, b, q, r }, …]
  function euclidSteps(a, b) {
    var steps = [];
    if (a < b) { var t = a; a = b; b = t; }
    while (b > 0) {
      var q = Math.floor(a / b), r = a - q * b;
      steps.push({ a: a, b: b, q: q, r: r });
      a = b; b = r;
    }
    return steps;
  }
  // すだれ算の段: [{ p, v }, …] と最後の商。v を p で割る。商が素数(または1)になったら止める
  function sudare(n) {
    var rows = [], v = n, f = factorize(n);
    for (var i = 0; i < f.length; i++) {
      for (var e = 0; e < f[i][1]; e++) {
        if (isPrime(v)) return { rows: rows, last: v };
        rows.push({ p: f[i][0], v: v });
        v /= f[i][0];
      }
    }
    return { rows: rows, last: v };
  }
  function sudareText(n) {
    var s = sudare(n), pw = 1, vw = String(n).length;
    s.rows.forEach(function (r) { pw = Math.max(pw, String(r.p).length); });
    function pad(x, w) { x = String(x); while (x.length < w) x = " " + x; return x; }
    var lines = s.rows.map(function (r) { return pad(r.p, pw) + " ) " + pad(r.v, vw); });
    lines.push(pad("", pw + 3) + pad(s.last, vw));
    return lines.join("\n");
  }
  // 平方数にする最小のかける数(指数が奇数の素数の積)
  function squareMultiplier(f) {
    return f.reduce(function (m, pe) { return pe[1] % 2 === 1 ? m * pe[0] : m; }, 1);
  }
  // √n = a√b
  function sqrtSimplify(f) {
    var a = 1, b = 1;
    f.forEach(function (pe) {
      a *= Math.pow(pe[0], Math.floor(pe[1] / 2));
      if (pe[1] % 2 === 1) b *= pe[0];
    });
    return { out: a, in: b };
  }
  // n! に含まれる素数 p の個数(ルジャンドルの公式)
  function legendre(n, p) { var c = 0; for (var q = p; q <= n; q *= p) c += Math.floor(n / q); return c; }
  function digitSum(n) { return String(n).split("").reduce(function (s, d) { return s + Number(d); }, 0); }
  // 一の位から +, −, + … と交互に足した和
  function altSum(n) {
    var d = String(n).split("").reverse(), s = 0;
    d.forEach(function (x, i) { s += (i % 2 === 0 ? 1 : -1) * Number(x); });
    return s;
  }

  var math = {
    MAX_N: MAX_N, sup: sup, isInt: isInt, isqrt: isqrt, primesUpTo: primesUpTo, isPrime: isPrime,
    nextPrime: nextPrime, prevPrime: prevPrime, factorize: factorize, valueOf: valueOf, fmtFactors: fmtFactors,
    numDivisors: numDivisors, sumDivisors: sumDivisors, divisorsOf: divisorsOf, gcd: gcd, euclidSteps: euclidSteps,
    sudare: sudare, sudareText: sudareText, squareMultiplier: squareMultiplier, sqrtSimplify: sqrtSimplify,
    legendre: legendre, digitSum: digitSum, altSum: altSum
  };

  // =====================================================================
  // 生成問題
  // =====================================================================
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // 正解を先頭に、正解と重ならない候補を3つ。4つそろわなければ null(作り直す)
  function choicesFrom(correct, cands) {
    var out = [String(correct)], seen = {};
    seen[out[0]] = true;
    for (var i = 0; i < cands.length && out.length < 4; i++) {
      var s = String(cands[i]);
      if (cands[i] === null || cands[i] === undefined || s === "" || seen[s]) continue;
      seen[s] = true;
      out.push(s);
    }
    return out.length === 4 ? out : null;
  }
  // 素数の組 primes から、指数 1〜maxE で数を作る
  function buildFactors(primes, maxE) {
    return primes.slice().sort(function (a, b) { return a - b; }).map(function (p) { return [p, randInt(1, maxE)]; });
  }
  function sortF(f) { return f.slice().sort(function (a, b) { return a[0] - b[0]; }); }
  function cloneF(f) { return f.map(function (pe) { return [pe[0], pe[1]]; }); }
  // 素因数分解の誤答。近いもの(指数を1つ増やす・減らす、指数を入れかえる)を先に、
  // 足りないときのために、指数1の素数をとなりの素数にかえたものを後ろに並べる
  function wrongFactorings(f) {
    var near = [], far = [], pool = [2, 3, 5, 7, 11, 13];
    f.forEach(function (pe, i) {
      var up = cloneF(f); up[i][1]++; near.push(up);
      if (pe[1] >= 2) { var dn = cloneF(f); dn[i][1]--; near.push(dn); }
      for (var j = i + 1; j < f.length; j++) {
        if (f[i][1] === f[j][1]) continue;
        var sw = cloneF(f); sw[i][1] = f[j][1]; sw[j][1] = f[i][1]; near.push(sw);
      }
      if (pe[1] !== 1) return;
      var k = pool.indexOf(pe[0]);
      [pool[k - 1], pool[k + 1]].forEach(function (q) {
        if (!q || f.some(function (x) { return x[0] === q; })) return;
        var rp = cloneF(f); rp[i][0] = q; far.push(sortF(rp));
      });
    });
    return shuffle(near).concat(shuffle(far));
  }
  function fmtDivList(n) {
    var d = divisorsOf(factorize(n), 30);
    return d ? d.join(", ") : "";
  }
  // "√n ≈ 13.9"(小数第1位に四捨五入)。√n が整数なら "√n = 13"
  function sqrtExpr(n) {
    var r = isqrt(n);
    return "√" + n + (r * r === n ? " = " + r : " ≈ " + (Math.round(Math.sqrt(n) * 10) / 10).toFixed(1));
  }
  function euclidText(a, b) {
    return euclidSteps(a, b).map(function (s) { return s.a + " = " + s.b + " × " + s.q + " + " + s.r; }).join("、");
  }
  function smallestPF(n) { return factorize(n)[0][0]; }

  var LOOKALIKE = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99];   // 2・5 の倍数でない2けたの合成数

  var GENS = {
    basics: [
      {
        id: "which-prime", level: "basic", ref: "primes-100",
        make: function () {
          var p = pick(primesUpTo(97).filter(function (x) { return x >= 11; }));
          var comps = shuffle(LOOKALIKE).slice(0, 3);
          var choices = choicesFrom(p, comps);
          if (!choices) return null;
          return {
            q: "次の4つの数のうち、素数はどれ?", kind: "value", choices: choices,
            explain: p + " は素数です(2, 3, 5, 7 のどれでも割り切れない。100 未満の数は 7 まで調べれば十分)。ほかは " +
              comps.map(function (c) { return c + " = " + fmtFactors(factorize(c)); }).join("、") + " で合成数です。",
            meta: { answer: p, nums: [p].concat(comps) }
          };
        }
      },
      {
        id: "count-primes", level: "std", ref: "primes-100",
        make: function () {
          var n = 10 * randInt(1, 10), list = primesUpTo(n), c = list.length;
          var choices = choicesFrom(c + "個", shuffle([c + 1, c - 1, c + 2, c - 2]).map(function (x) { return x + "個"; }));
          if (!choices) return null;
          return {
            q: "1 から " + n + " までに、素数はいくつある?", kind: "value", choices: choices,
            explain: n + " 以下の素数は " + list.join(", ") + " の " + c + "個です。1 は素数に入れません。",
            meta: { n: n, answer: c }
          };
        }
      }
    ],
    primality: [
      {
        id: "prime-or-factor", level: "std", ref: "trial-division",
        make: function () {
          var n, p = 0, q = 0, small = primesUpTo(71).filter(function (x) { return x >= 7; });
          if (Math.random() < 0.5) {
            n = pick(primesUpTo(499).filter(function (x) { return x > 100; }));
          } else {
            for (var t = 0; t < 100 && !n; t++) {
              p = pick(small); q = pick(small);
              if (p > q) { var w = p; p = q; q = w; }
              if (p * q > 100 && p * q < 500) n = p * q;
            }
            if (!n) return null;
          }
          var prime = isPrime(n);
          var correct = prime ? "素数" : "合成数(" + p + " × " + q + ")";
          // 誤答: n に近いが n ではない、素数2つの積
          var fakes = [];
          small.filter(function (a) { return a <= 23; }).forEach(function (a) {
            [prevPrime(n / a + 0.5), nextPrime(n / a - 0.5)].forEach(function (b) {
              if (!b || b < a || a * b === n) return;
              fakes.push({ d: Math.abs(a * b - n), s: "合成数(" + a + " × " + b + ")" });
            });
          });
          fakes.sort(function (x, y) { return x.d - y.d; });
          var cands = shuffle(fakes.slice(0, 6)).map(function (x) { return x.s; });
          if (!prime) cands.unshift("素数");
          var choices = choicesFrom(correct, cands);
          if (!choices) return null;
          var r = isqrt(n), last = prevPrime(r + 1);
          return {
            q: "`" + n + "` は素数? 合成数なら、2つの素数の積で表すと?", kind: "value", choices: choices,
            explain: prime
              ? sqrtExpr(n) + "。" + last + " 以下の素数(2, 3, 5, …, " + last + ")のどれでも割り切れないので素数です。"
              : n + " = " + p + " × " + q + "。" + primesUpTo(p - 1).join("・") + " では割り切れず、" + p + " で割り切れます(" + sqrtExpr(n) + " 以下の素数を調べれば十分)。",
            meta: { n: n, answer: prime ? null : [p, q] }
          };
        }
      },
      {
        id: "trial-limit", level: "basic", ref: "sqrt-limit",
        make: function () {
          // 「どの素数でも割り切れなかった」という前提に合うよう、2・3・5 の倍数は出さない
          var n = randInt(122, 2000);
          if (n % 2 === 0 || n % 3 === 0 || n % 5 === 0) return null;
          var r = isqrt(n), p = prevPrime(r + 1), nx = nextPrime(p), pv = prevPrime(p);
          var choices = choicesFrom(p, shuffle([nx, pv, nextPrime(nx)]));
          if (!choices) return null;
          return {
            q: "`" + n + "` が素数かどうかを試し割りで調べる。どの素数でも割り切れなかったとき、最後に試す素数は?", kind: "value", choices: choices,
            explain: sqrtExpr(n) + "。" + p + "² = " + (p * p) + " ≤ " + n + " < " + nx + "² = " + (nx * nx) + " なので、" + p + " まで割れば十分です。",
            meta: { n: n, answer: p }
          };
        }
      }
    ],
    factorize: [
      {
        id: "factorize-basic", level: "basic", ref: "sudare",
        make: function () { return factorizeQ([2, 3, 5, 7], 2, 3, 12, 400); }
      },
      {
        id: "factorize-std", level: "std", ref: "sudare",
        make: function () { return factorizeQ([2, 3, 5, 7, 11, 13], 3, 3, 60, 5000); }
      },
      {
        id: "largest-pf", level: "std", ref: "small-first",
        make: function () {
          var q = pick(primesUpTo(97).filter(function (x) { return x >= 11; }));
          var m = pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 18, 20, 21]);
          var n = m * q;
          if (n > 2000) return null;
          var f = factorize(n), mp = factorize(m);
          var choices = choicesFrom(q, shuffle([prevPrime(q), nextPrime(q), mp[mp.length - 1][0], m]));
          if (!choices) return null;
          return {
            q: "`" + n + "` の素因数のうち、いちばん大きいものは?", kind: "value", choices: choices,
            explain: n + " = " + fmtFactors(f) + "。いちばん大きい素因数は " + q + " です。小さい素数から割っていき、最後に残った " + q + " が素数です。",
            meta: { n: n, answer: q }
          };
        }
      }
    ],
    divisors: [
      {
        id: "num-divisors", level: "std", ref: "divisor-count",
        make: function () {
          var f = buildFactors(shuffle([2, 3, 5, 7]).slice(0, randInt(2, 3)), 3), n = valueOf(f);
          if (n < 12 || n > 3000) return null;
          var d = numDivisors(f);
          var prodE = f.reduce(function (s, pe) { return s * pe[1]; }, 1);
          var sumE1 = f.reduce(function (s, pe) { return s + pe[1] + 1; }, 0);
          var cands = [prodE > 1 ? prodE : null, sumE1].concat(shuffle([d + 2, d - 2, d * 2, d + 4]));
          var choices = choicesFrom(d + "個", cands.map(function (x) { return x === null || x < 1 ? null : x + "個"; }));
          if (!choices) return null;
          var list = d <= 18 ? "(" + fmtDivList(n) + ")" : "";
          return {
            q: "`" + n + "` の約数は何個?", kind: "value", choices: choices,
            explain: n + " = " + fmtFactors(f) + " なので、約数の個数は " +
              f.map(function (pe) { return "(" + pe[1] + "+1)"; }).join("") + " = " + d + "個です" + list + "。",
            meta: { n: n, answer: d }
          };
        }
      },
      {
        id: "sum-divisors", level: "pro", ref: "divisor-sum",
        make: function () {
          var f = buildFactors(shuffle([2, 3, 5, 7]).slice(0, 2), 3), n = valueOf(f);
          if (n > 600) return null;
          var s = sumDivisors(f);
          var series = f.map(function (pe) { return sumDivisors([pe]); });
          var added = series.reduce(function (a, b) { return a + b; }, 0);
          var choices = choicesFrom(s, shuffle([s - n, added, s + n]).concat([s - 1, s + 2]));
          if (!choices) return null;
          return {
            q: "`" + n + "` の約数をすべて足すといくつ?", kind: "value", choices: choices,
            explain: n + " = " + fmtFactors(f) + " なので、総和は " +
              f.map(function (pe) {
                var t = [];
                for (var i = 0; i <= pe[1]; i++) t.push(i === 0 ? "1" : i === 1 ? String(pe[0]) : pe[0] + sup(i));
                return "(" + t.join("+") + ")";
              }).join("") + " = " + series.join(" × ") + " = " + s + "。",
            meta: { n: n, answer: s }
          };
        }
      }
    ],
    "gcd-lcm": [
      {
        id: "gcd", level: "basic", ref: "euclid",
        make: function () {
          var ab = coprimePair(2, 30, 2, 12, 600);
          if (!ab) return null;
          var g = ab.g, a = ab.a, b = ab.b;
          var choices = choicesFrom(g, shuffle([g / smallestPF(g), 2 * g, 3 * g, 4 * g]));
          if (!choices) return null;
          return {
            q: "`" + a + "` と `" + b + "` の最大公約数は?", kind: "value", choices: choices,
            explain: "互除法: " + euclidText(a, b) + " → 最大公約数は " + g + "。(" + a + " = " + g + " × " + ab.x + "、" + b + " = " + g + " × " + ab.y + ")",
            meta: { a: a, b: b, answer: g }
          };
        }
      },
      {
        id: "lcm", level: "std", ref: "gcd-lcm-factor",
        make: function () {
          var ab = coprimePair(2, 12, 2, 9, 200);
          if (!ab) return null;
          var g = ab.g, a = ab.a, b = ab.b, L = g * ab.x * ab.y;
          var choices = choicesFrom(L, shuffle([a * b, L / smallestPF(L), g, 2 * L]));
          if (!choices) return null;
          return {
            q: "`" + a + "` と `" + b + "` の最小公倍数は?", kind: "value", choices: choices,
            explain: a + " = " + fmtFactors(factorize(a)) + "、" + b + " = " + fmtFactors(factorize(b)) + "。最大公約数は " + g +
              " なので、最小公倍数 = " + a + " × " + b + " ÷ " + g + " = " + L + "。",
            meta: { a: a, b: b, answer: L }
          };
        }
      },
      {
        id: "ab-from-gl", level: "pro", ref: "ab-gcd-lcm",
        make: function () {
          var ab = coprimePair(2, 15, 2, 9, 400);
          if (!ab) return null;
          var g = ab.g, a = ab.a, b = ab.b, L = g * ab.x * ab.y;
          var choices = choicesFrom(b, shuffle([L / a, L - a, L / g, 2 * b, g * L]));
          if (!choices) return null;
          return {
            q: "2つの自然数 a, b の最大公約数が " + g + "、最小公倍数が " + L + " で、a = " + a + " のとき、b は?", kind: "value", choices: choices,
            explain: "a × b = 最大公約数 × 最小公倍数 なので、b = " + g + " × " + L + " ÷ " + a + " = " + b + "。",
            meta: { g: g, L: L, a: a, answer: b }
          };
        }
      }
    ]
  };

  // 素因数分解の問題。primes から k 個えらび、指数は 1〜maxE。値は lo〜hi
  function factorizeQ(primes, k, maxE, lo, hi) {
    var f = buildFactors(shuffle(primes).slice(0, k), maxE), n = valueOf(f);
    if (n < lo || n > hi) return null;
    if (f.every(function (pe) { return pe[1] === 1; }) && k < 3) return null;
    var correct = fmtFactors(f);
    var cands = wrongFactorings(f).filter(function (w) { return valueOf(w) !== n; }).map(fmtFactors);
    var choices = choicesFrom(correct, cands);
    if (!choices) return null;
    var steps = sudare(n), trail = [String(n)];
    steps.rows.forEach(function (r) { trail.push("÷" + r.p + " → " + r.v / r.p); });
    return {
      q: "`" + n + "` を素因数分解すると?", kind: "value", choices: choices,
      explain: "小さい素数から割ります: " + trail.join(" ") + "(素数)。だから " + n + " = " + correct + "。",
      meta: { n: n, answer: correct }
    };
  }
  // a = g × x、b = g × y(x, y は互いに素で異なる)。g は gLo〜gHi、x, y は 2〜xyHi、a, b は max 以下
  function coprimePair(gLo, gHi, xyLo, xyHi, max) {
    for (var t = 0; t < 200; t++) {
      var g = randInt(gLo, gHi), x = randInt(xyLo, xyHi), y = randInt(xyLo, xyHi);
      if (x === y || gcd(x, y) !== 1 || g * x > max || g * y > max) continue;
      if (x > y && Math.random() < 0.5) { var w = x; x = y; y = w; }
      return { g: g, x: x, y: y, a: g * x, b: g * y };
    }
    return null;
  }

  // 固定問題の問題文か(生成問題と重ならないようにする)
  function isFixedText(text) {
    return UNITS.some(function (u) {
      var c = contentOf(u.id);
      return !!c && c.questions.some(function (fq) { return fq.q === text; });
    });
  }
  function gensOf(unitId) { return GENS.hasOwnProperty(unitId) ? GENS[unitId] : []; }
  // 生成問題を1問作る。作れなければ null
  function generate(unitId, genId) {
    var g = null;
    gensOf(unitId).forEach(function (x) { if (x.id === genId) g = x; });
    if (!g) return null;
    for (var t = 0; t < 80; t++) {
      var r = null;
      try { r = g.make(); } catch (e) { r = null; }
      if (!r) continue;
      var q = { id: "gen-" + g.id, level: g.level, q: r.q, kind: r.kind, choices: r.choices, explain: r.explain, ref: g.ref, gen: true, meta: r.meta };
      if (isFixedText(q.q)) continue;   // 固定問題と同じ問題文(例: 12 と 18 の最大公約数)は作り直す
      if (checkQuestion(q).length === 0) return q;
    }
    return null;
  }

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
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (!level(q.level)) errs.push("level がおかしい: " + q.level);
    if (typeof q.q !== "string" || !q.q) errs.push("q がない");
    if (KINDS.indexOf(q.kind) < 0) errs.push("kind がおかしい: " + q.kind);
    errs = errs.concat(checkBlocks(q.code, "code"));
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
  var WIDGETS = ["sieve"];
  function checkCard(c) {
    var errs = [];
    if (!c || typeof c !== "object") return ["カードがオブジェクトではない"];
    if (typeof c.id !== "string" || !/^[a-z0-9-]+$/.test(c.id)) errs.push("id がおかしい: " + c.id);
    if (typeof c.name !== "string" || !c.name) errs.push("name がない");
    if (typeof c.en !== "string" || !c.en) errs.push("en がない");
    if (typeof c.desc !== "string" || !c.desc) errs.push("desc がない");
    if (c.widget !== undefined && WIDGETS.indexOf(c.widget) < 0) errs.push("widget がおかしい: " + c.widget);
    errs = errs.concat(checkBlocks(c.code, "code"));
    if (c.options !== undefined && !(Array.isArray(c.options) && c.options.every(function (o) {
      return Array.isArray(o) && o.length === 2 && typeof o[0] === "string" && typeof o[1] === "string";
    }))) errs.push("options の形がおかしい");
    if (c.notes !== undefined && !(Array.isArray(c.notes) && c.notes.every(function (s) { return typeof s === "string" && s; }))) errs.push("notes の形がおかしい");
    return errs;
  }

  // ---------- 出題 ----------
  // 単元の問題のうち、形が正しく、levels(難易度IDの配列。省略ならすべて)に入るもの。
  // 生成問題は { genOf: 型 } の目印として GEN_COPIES 個ずつ入る(出題するときに数を作る)
  function poolOf(unitId, levels) {
    var c = contentOf(unitId);
    var fixed = !c ? [] : c.questions.filter(function (q) {
      return checkQuestion(q).length === 0 && (!levels || levels.indexOf(q.level) >= 0);
    });
    var gens = [];
    gensOf(unitId).forEach(function (g) {
      if (levels && levels.indexOf(g.level) < 0) return;
      for (var i = 0; i < GEN_COPIES; i++) gens.push({ genOf: g, level: g.level });
    });
    return fixed.concat(gens);
  }
  function countOf(unitIds, levels) {
    return unitIds.reduce(function (sum, id) { return sum + poolOf(id, levels).length; }, 0);
  }
  // 生成問題の型の数(画面の表示用)
  function genCount(unitIds, levels) {
    return unitIds.reduce(function (sum, id) {
      return sum + gensOf(id).filter(function (g) { return !levels || levels.indexOf(g.level) >= 0; }).length;
    }, 0);
  }

  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      id: q.id,
      gen: !!q.gen,
      level: q.level,
      q: q.q,
      code: blocksOf(q.code),
      kind: q.kind,
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(0),
      canonical: q.choices[0],
      explain: q.explain,
      ref: q.ref || ""
    };
  }

  function sameKey(q) { return q.q + "\n" + q.choices.slice().sort().join("\n"); }

  // 選んだ単元から順番に1問ずつ取り、count 問になるまで続ける(問題が少ない単元は、ほかの単元で補う)
  function buildQuiz(unitIds, levels, count) {
    count = count || COUNT;
    var pools = shuffle(unitIds.filter(function (id) { return unit(id); })).map(function (id) {
      return { id: id, list: shuffle(poolOf(id, levels)) };
    }).filter(function (p) { return p.list.length > 0; });
    var out = [], seenQ = {}, seenText = {};
    while (out.length < count && pools.length > 0) {
      for (var i = 0; i < pools.length && out.length < count; i++) {
        var item = pools[i].list.shift(), q = item;
        if (item.genOf) {
          q = null;
          // 同じ稽古で同じ問題(問題文と選択肢)が出ないように、数を作り直す
          for (var t = 0; t < 10 && !q; t++) {
            var g = generate(pools[i].id, item.genOf.id);
            if (g && !seenQ[sameKey(g)]) q = g;
          }
          if (!q) continue;
        }
        // 固定問題も、同じ稽古で出た問題文と重ならないかを見る
        if (!item.genOf && (seenQ[sameKey(q)] || seenText[q.q])) continue;
        seenQ[sameKey(q)] = true;
        seenText[q.q] = true;
        out.push(prepare(pools[i].id, q));
      }
      pools = pools.filter(function (p) { return p.list.length > 0; });
    }
    return spreadSame(shuffle(out));
  }
  // 同じ型の問題(同じ id。生成問題の型)が隣り合ったら、ほかの問題と入れかえる
  function spreadSame(list) {
    function clash(i) {
      return (i > 0 && list[i].id === list[i - 1].id) || (i + 1 < list.length && list[i].id === list[i + 1].id);
    }
    for (var i = 1; i < list.length; i++) {
      if (list[i].id !== list[i - 1].id) continue;
      for (var j = 0; j < list.length; j++) {
        if (j === i || j === i - 1) continue;
        var t = list[i]; list[i] = list[j]; list[j] = t;
        if (!clash(i) && !clash(j)) break;
        t = list[i]; list[i] = list[j]; list[j] = t;
      }
    }
    return list;
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
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, UNITS: UNITS, LEVELS: LEVELS, KINDS: KINDS,
    GENS: GENS, math: math,
    unit: unit, level: level, register: register, contentOf: contentOf, card: card, cardUnit: cardUnit,
    blocksOf: blocksOf, gensOf: gensOf, generate: generate, genCount: genCount,
    checkQuestion: checkQuestion, checkCard: checkCard, poolOf: poolOf, countOf: countOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();


// =====================================================================
// 01 素数とは
// =====================================================================
PRIM.register("basics", {
  cards: [
    {
      id: "prime-def", name: "素数", en: "prime number",
      desc: "1 より大きい整数で、約数が 1 とその数自身の2つだけの数です。たとえば 7 の約数は 1 と 7 だけなので素数です。",
      options: [["2, 3, 5, 7", "1けたの素数(4個)"], ["11, 13, 17, 19", "10台の素数(4個)"]],
      notes: ["「約数がちょうど2個」と覚えると、1(約数が1個)を間違えません。"]
    },
    {
      id: "not-one", name: "1 は素数ではない", en: "1 is not prime",
      desc: "1 の約数は 1 だけで2個ではないので、素数ではありません。1 を素数に入れると `12 = 2² × 3 = 1 × 2² × 3 = 1² × 2² × 3` のように素因数分解が何通りもできてしまいます。素因数分解をただ1通りに決める(一意性)ために、1 は素数から外します。",
      notes: ["1 は素数でも合成数でもありません。0 も同じです。"]
    },
    {
      id: "only-even", name: "2 はただ1つの偶数の素数", en: "2: the only even prime",
      desc: "2 より大きい偶数は 1・2・自分自身の3つ以上の約数をもつので、合成数です。偶数の素数は 2 だけで、3 以上の素数はすべて奇数です。",
      notes: ["2つの素数の和が奇数なら、一方は必ず 2 です(奇数 + 奇数 = 偶数 だから)。"]
    },
    {
      id: "composite", name: "合成数", en: "composite number",
      desc: "1 より大きい整数で、素数でない数です。1 とその数自身のほかにも約数をもち、2つ以上の素数の積で表せます。例: `12 = 2² × 3`、`91 = 7 × 13`。",
      options: [["0, 1", "素数でも合成数でもない"], ["2, 3, 5, 7, …", "素数"], ["4, 6, 8, 9, 10, …", "合成数"]]
    },
    {
      id: "primes-100", name: "100 以下の素数 25個", en: "primes up to 100",
      desc: "100 以下の素数は25個あります。1けたが4個、2けたが21個です。",
      code: [{ cap: "100 以下の素数", text: " 2  3  5  7 11 13 17 19 23 29\n31 37 41 43 47 53 59 61 67 71\n73 79 83 89 97" }],
      options: [["1〜10", "4個"], ["1〜50", "15個"], ["1〜100", "25個"]],
      notes: ["素数に見えて合成数のもの: 51 = 3 × 17、57 = 3 × 19、87 = 3 × 29、91 = 7 × 13。"]
    }
  ],
  questions: [
    {
      id: "b01", level: "basic", q: "素数の説明として正しいのは?", kind: "text",
      choices: [
        "1 より大きい整数で、約数が 1 とその数自身の2つだけの数",
        "1 とその数自身で割り切れる整数",
        "約数が1つだけの整数",
        "2 で割り切れない整数"
      ],
      explain: "どの整数も 1 と自分自身で割り切れるので、「約数がその2つだけ」という条件が大切です。2 で割り切れない数(奇数)には 9 や 15 のような合成数もあります。",
      ref: "prime-def"
    },
    {
      id: "b02", level: "basic", q: "1 について正しいのは?", kind: "text",
      choices: ["素数ではない(約数が1個しかない)", "いちばん小さい素数である", "いちばん小さい合成数である", "奇数なので素数である"],
      explain: "素数は約数がちょうど2個の数です。1 の約数は 1 だけなので素数ではなく、合成数でもありません。",
      ref: "not-one"
    },
    {
      id: "b03", level: "std", q: "1 を素数に入れない、いちばん大きな理由は?", kind: "text",
      choices: [
        "素因数分解のしかたが1通りに決まらなくなるから",
        "1 は奇数だから",
        "1 はどんな数でも割り切れないから",
        "1 は 0 に近すぎるから"
      ],
      explain: "1 を素数とすると、6 = 2 × 3 = 1 × 2 × 3 = 1 × 1 × 2 × 3 … と表し方が何通りもできてしまいます。素因数分解の一意性を守るために外します。",
      ref: "not-one"
    },
    {
      id: "b04", level: "basic", q: "偶数の素数はどれ?", kind: "value",
      choices: ["2 だけ", "2 と 4", "偶数の素数はない", "0 と 2"],
      explain: "4 以上の偶数は 2 で割り切れるので合成数です。偶数の素数は 2 だけです。",
      ref: "only-even"
    },
    {
      id: "b05", level: "basic", q: "100 以下の素数はいくつある?", kind: "value",
      choices: ["25個", "24個", "26個", "20個"],
      explain: "2, 3, 5, 7(4個)と、2けたの素数21個で、あわせて25個です。",
      ref: "primes-100"
    },
    {
      id: "b06", level: "basic", q: "次のうち、合成数はどれ?", kind: "value",
      choices: ["51", "53", "59", "61"],
      explain: "51 = 3 × 17 です(各位の和 5 + 1 = 6 が3の倍数)。53・59・61 は素数です。",
      ref: "primes-100"
    },
    {
      id: "b07", level: "basic", q: "30 以下の素数をすべて並べたものは?", kind: "value",
      choices: [
        "2, 3, 5, 7, 11, 13, 17, 19, 23, 29",
        "1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29",
        "3, 5, 7, 11, 13, 17, 19, 23, 29",
        "2, 3, 5, 7, 11, 13, 17, 19, 23, 27, 29"
      ],
      explain: "1 は素数ではなく、2 は素数です。27 = 3³ は合成数です。30 以下の素数は10個です。",
      ref: "primes-100"
    },
    {
      id: "b08", level: "std", q: "次のうち、素数はどれ?", kind: "value",
      choices: ["89", "87", "91", "93"],
      explain: "87 = 3 × 29、91 = 7 × 13、93 = 3 × 31。89 は 2, 3, 5, 7 のどれでも割り切れないので素数です。",
      ref: "primes-100"
    },
    {
      id: "b09", level: "std", q: "0 と 1 について正しいのは?", kind: "text",
      choices: ["どちらも素数でも合成数でもない", "0 は合成数、1 は素数", "どちらも素数", "0 は素数、1 は合成数"],
      explain: "素数・合成数は 2 以上の整数についての言葉です。0 と 1 はどちらにも入りません。",
      ref: "composite"
    },
    {
      id: "b10", level: "std", q: "合成数の説明として正しいのは?", kind: "text",
      choices: [
        "1 より大きい整数で、1 とその数自身のほかにも約数をもつ数",
        "2つの数をたしてできる数",
        "偶数のこと",
        "約数が2個の数"
      ],
      explain: "合成数は、2つ以上の素数の積で表せる数です。約数が2個の数は素数です。",
      ref: "composite"
    },
    {
      id: "b11", level: "std", q: "2 以外の素数について、いつも正しいのは?", kind: "text",
      choices: ["奇数である", "一の位が 1, 3, 7, 9 のどれかである", "4 で割ると 1 余る", "3 で割ると 1 余る"],
      explain: "2 以外の偶数は合成数なので、2 以外の素数はすべて奇数です。5 は一の位が 5、3 と 7 は 4 で割ると 3 余り、5 は 3 で割ると 2 余ります。",
      ref: "only-even"
    },
    {
      id: "b12", level: "pro", q: "一の位が 5 の素数は?", kind: "value",
      choices: ["5 だけ", "1つもない", "5 と 15", "無数にある"],
      explain: "一の位が 5 の数は 5 で割り切れます。5 以外は 1・5・自分自身の3つ以上の約数をもつので合成数です。",
      ref: "prime-def"
    },
    {
      id: "b13", level: "pro", q: "2けたの素数はいくつある?", kind: "value",
      choices: ["21個", "25個", "20個", "22個"],
      explain: "100 以下の素数25個から、1けたの 2, 3, 5, 7 の4個を引いて21個です。",
      ref: "primes-100"
    },
    {
      id: "b14", level: "pro", q: "2つの素数の和が奇数になった。2つのうち一方は必ず?", kind: "value",
      choices: ["2", "3", "5", "決まらない"],
      explain: "奇数 + 奇数 は偶数です。和が奇数なら一方は偶数で、偶数の素数は 2 だけです。",
      ref: "only-even"
    }
  ]
});


// =====================================================================
// 02 倍数の見分け方
// =====================================================================
PRIM.register("divisibility", {
  cards: [
    {
      id: "div-2-5-10", name: "2・5・10 の倍数", en: "last digit",
      desc: "一の位だけで分かります。2 の倍数は一の位が 0, 2, 4, 6, 8、5 の倍数は 0 か 5、10 の倍数は 0 です。",
      options: [["3758", "一の位が 8 → 2の倍数"], ["4615", "一の位が 5 → 5の倍数(2の倍数ではない)"]]
    },
    {
      id: "div-4-8", name: "4・8 の倍数", en: "last 2 / 3 digits",
      desc: "4 の倍数は下2けたが4の倍数(00 を含む)、8 の倍数は下3けたが8の倍数(000 を含む)です。100 は 4 で、1000 は 8 で割り切れるので、それより上の位は調べなくてよいからです。",
      options: [["7316", "下2けた 16 → 4の倍数"], ["5132", "下3けた 132 = 8 × 16 + 4 → 8の倍数ではない"], ["93376", "下3けた 376 = 8 × 47 → 8の倍数"]]
    },
    {
      id: "div-3-9", name: "3・9 の倍数", en: "digit sum",
      desc: "各位の数字の和が3の倍数なら3の倍数、9の倍数なら9の倍数です。10, 100, 1000, … はどれも 9 で割ると 1 余るので、各位の数字がそのまま余りに効くからです。",
      options: [["4581", "4 + 5 + 8 + 1 = 18 → 9の倍数(3の倍数でもある)"], ["7365", "7 + 3 + 6 + 5 = 21 → 3の倍数だが、9の倍数ではない"]]
    },
    {
      id: "div-6-12", name: "6・12・15 などの組み合わせ", en: "combine coprime tests",
      desc: "互いに素な2つの数の判定を両方満たせば、その積の倍数です。6 = 2 × 3、12 = 3 × 4、15 = 3 × 5、18 = 2 × 9、24 = 3 × 8、36 = 4 × 9。",
      options: [["6", "2の倍数 かつ 3の倍数"], ["12", "3の倍数 かつ 4の倍数"], ["15", "3の倍数 かつ 5の倍数"], ["18", "2の倍数 かつ 9の倍数"]],
      notes: ["12 を「2の倍数 かつ 6の倍数」で調べてはいけません。2 と 6 は互いに素でないので、6 や 18 も通ってしまいます。"]
    },
    {
      id: "div-11", name: "11 の倍数(交代和)", en: "alternating digit sum",
      desc: "端から順に、たす・ひく・たす…と交互に計算した和(交代和)が 0 か 11 の倍数なら、11 の倍数です。10 を 11 で割ると 1 足りない(−1 余る)からです。",
      options: [["918082", "9 − 1 + 8 − 0 + 8 − 2 = 22 → 11の倍数(918082 = 11 × 83462)"], ["1331", "1 − 3 + 3 − 1 = 0 → 11の倍数(1331 = 11³)"]]
    },
    {
      id: "div-7", name: "7 の倍数(一の位 × 2 を引く)", en: "subtract twice the last digit",
      desc: "一の位を取り去り、残りの数から一の位の2倍を引きます。結果が7の倍数なら、もとの数も7の倍数です。小さくなるまでくり返します。",
      options: [["343", "34 − 3 × 2 = 28 → 7の倍数(343 = 7³)"], ["2443", "244 − 3 × 2 = 238 → 23 − 8 × 2 = 7 → 7の倍数(2443 = 7 × 349)"]],
      notes: ["`10a + b = 10(a − 2b) + 21b` で、21 が 7 の倍数だから成り立ちます。"]
    },
    {
      id: "div-7-11-13", name: "7・11・13 の倍数(3けたずつの交代和)", en: "1001 = 7 × 11 × 13",
      desc: "一の位から3けたずつ区切り、たす・ひく…と交互に計算します。その結果が 7(11、13)の倍数なら、もとの数も 7(11、13)の倍数です。1000 は 1001 より 1 小さく、`1001 = 7 × 11 × 13` なので、3つを一度に調べられます。",
      options: [
        ["241592", "592 − 241 = 351 = 3³ × 13 → 13の倍数(7・11 の倍数ではない)"],
        ["15015", "015 − 15 = 0 → 7・11・13 すべての倍数(15015 = 15 × 1001)"],
        ["1001001", "001 − 001 + 1 = 1 → どれの倍数でもない"]
      ]
    }
  ],
  questions: [
    {
      id: "d01", level: "basic", q: "3 の倍数の見分け方は?", kind: "text",
      choices: ["各位の数字の和が3の倍数", "一の位が 3, 6, 9 のどれか", "下2けたが3の倍数", "一の位と十の位の差が3の倍数"],
      explain: "例: 7365 は 7 + 3 + 6 + 5 = 21 で3の倍数です。一の位だけでは分かりません(13 は3の倍数でない)。",
      ref: "div-3-9"
    },
    {
      id: "d02", level: "basic", q: "4 の倍数の見分け方は?", kind: "text",
      choices: ["下2けたが4の倍数(00 を含む)", "一の位が 4 か 8", "各位の数字の和が4の倍数", "下2けたが8の倍数"],
      explain: "100 は 4 で割り切れるので、下2けただけで決まります。例: 7316 は 16 が4の倍数なので4の倍数です。",
      ref: "div-4-8"
    },
    {
      id: "d03", level: "basic", q: "次のうち、9 の倍数はどれ?", kind: "value",
      choices: ["7362", "7365", "7352", "7346"],
      explain: "各位の和は 7362 → 18、7365 → 21、7352 → 17、7346 → 20。18 だけが9の倍数です(7365 は3の倍数だが9の倍数ではない)。",
      ref: "div-3-9"
    },
    {
      id: "d04", level: "basic", q: "8 の倍数の見分け方は?", kind: "text",
      choices: ["下3けたが8の倍数(000 を含む)", "下2けたが8の倍数", "一の位が 8", "各位の数字の和が8の倍数"],
      explain: "1000 = 8 × 125 なので、下3けたで決まります。下2けただけでは足りません(例: 116 は下2けた 16 が8の倍数でも、116 = 8 × 14 + 4)。",
      ref: "div-4-8"
    },
    {
      id: "d05", level: "basic", q: "次のうち、4 の倍数はどれ?", kind: "value",
      choices: ["7316", "7318", "7326", "7342"],
      explain: "下2けたを見ます。16 = 4 × 4 は4の倍数、18・26・42 は4の倍数ではありません。",
      ref: "div-4-8"
    },
    {
      id: "d06", level: "std", q: "11 の倍数の見分け方は?", kind: "text",
      choices: [
        "端から交互にたし引きした和(交代和)が 0 か 11 の倍数",
        "各位の数字の和が11の倍数",
        "一の位と十の位が同じ数字",
        "下2けたが11の倍数"
      ],
      explain: "10 を 11 で割ると −1 余るので、位ごとに +・− が交互になります。例: 918082 → 9 − 1 + 8 − 0 + 8 − 2 = 22。",
      ref: "div-11"
    },
    {
      id: "d07", level: "std", q: "次のうち、11 の倍数はどれ?", kind: "value",
      choices: ["918082", "918028", "981082", "918820"],
      explain: "交代和は 918082 → 9−1+8−0+8−2 = 22、918028 → 9−1+8−0+2−8 = 10、981082 → 9−8+1−0+8−2 = 8、918820 → 9−1+8−8+2−0 = 10。22 だけが11の倍数です。",
      ref: "div-11"
    },
    {
      id: "d08", level: "std", q: "12 の倍数かどうかを確かめる正しい組み合わせは?", kind: "text",
      choices: ["3 の倍数で、しかも 4 の倍数", "2 の倍数で、しかも 6 の倍数", "3 の倍数で、しかも 6 の倍数", "各位の数字の和が12の倍数"],
      explain: "12 = 3 × 4 で、3 と 4 は互いに素です。2 と 6 は互いに素でないので、たとえば 18 も「2の倍数かつ6の倍数」を満たしてしまいます。",
      ref: "div-6-12"
    },
    {
      id: "d09", level: "std", q: "`343` が7の倍数かを「一の位を2倍して、残りから引く」方法で調べる。1回目の計算でできる数は?", kind: "value",
      choices: ["28", "40", "31", "37"],
      explain: "一の位 3 を取り去ると 34。34 − 3 × 2 = 28 = 7 × 4 なので、343 は7の倍数です(343 = 7³)。",
      ref: "div-7"
    },
    {
      id: "d10", level: "std", q: "`3□84` が9の倍数になるとき、□ に入る数字は?", kind: "value",
      choices: ["3", "6", "0", "1"],
      explain: "3 + □ + 8 + 4 = 15 + □ が9の倍数になるのは □ = 3(和が18)のときだけです。",
      ref: "div-3-9"
    },
    {
      id: "d11", level: "pro", q: "`4□5` が15の倍数になるとき、□ に入る数字をすべて挙げると?", kind: "value",
      choices: ["0, 3, 6, 9", "3, 6, 9", "0, 5", "1, 4, 7"],
      explain: "15 = 3 × 5。一の位が 5 なので5の倍数。3の倍数になるには 4 + □ + 5 = 9 + □ が3の倍数、つまり □ = 0, 3, 6, 9 です。",
      ref: "div-6-12"
    },
    {
      id: "d12", level: "pro", q: "`241592` を一の位から3けたずつ区切った交代和(592 − 241 = 351)から分かることは?", kind: "text",
      choices: ["13 の倍数だが、7 と 11 の倍数ではない", "7 の倍数である", "7・11・13 のすべての倍数である", "11 の倍数である"],
      explain: "351 = 3³ × 13 は13の倍数ですが、7 でも 11 でも割り切れません。1001 = 7 × 11 × 13 を使った判定なので、3つを同時に調べられます(241592 = 13 × 18584)。",
      ref: "div-7-11-13"
    },
    {
      id: "d13", level: "pro", q: "`123382` を 8 で割った余りは?", kind: "value",
      choices: ["6", "2", "0", "4"],
      explain: "1000 は 8 で割り切れるので、下3けた 382 だけを見ます。382 = 8 × 47 + 6 で、余りは 6 です。",
      ref: "div-4-8"
    },
    {
      id: "d14", level: "std", q: "次のうち、6 の倍数はどれ?", kind: "value",
      choices: ["5172", "5174", "5163", "5170"],
      explain: "6 = 2 × 3。5172 は偶数で、5 + 1 + 7 + 2 = 15 が3の倍数。5174 と 5170 は3の倍数でなく、5163 は奇数です。",
      ref: "div-6-12"
    },
    {
      id: "d15", level: "pro", q: "`2443` は7の倍数? 「一の位 × 2 を引く」をくり返すと?", kind: "text",
      choices: [
        "244 − 6 = 238 → 23 − 16 = 7 なので、7の倍数",
        "244 − 6 = 238 → 23 − 16 = 7 だが、7の倍数ではない",
        "244 − 3 = 241 なので、7の倍数ではない",
        "2 + 4 + 4 + 3 = 13 なので、7の倍数ではない"
      ],
      explain: "最後に 7 が出たので7の倍数です。実際 2443 = 7 × 349。",
      ref: "div-7"
    }
  ]
});


// =====================================================================
// 03 素数の判定
// =====================================================================
PRIM.register("primality", {
  cards: [
    {
      id: "trial-division", name: "試し割り", en: "trial division",
      desc: "2, 3, 5, 7, … と小さい素数で順に割り、どれかで割り切れたら合成数、√N 以下の素数のどれでも割り切れなければ素数です。",
      options: [
        ["221", "√221 ≈ 14.9。2, 3, 5, 7, 11 で割り切れず、13 で割り切れる → 221 = 13 × 17"],
        ["307", "√307 ≈ 17.5。17 以下の素数 7個のどれでも割り切れない → 素数"]
      ]
    },
    {
      id: "sqrt-limit", name: "√N まででよい理由", en: "N = a × b ⇒ a ≤ √N",
      desc: "N = a × b(a ≤ b)と分けられるなら、a × a ≤ a × b = N なので a ≤ √N です。合成数には必ず √N 以下の素因数があるので、そこまで割れば十分です。",
      notes: ["「p² が N をこえたらやめる」と覚えると、√ を計算しなくてすみます。"]
    },
    {
      id: "six-k", name: "6k ± 1", en: "primes > 3 are 6k ± 1",
      desc: "整数は6で割った余りで 6k, 6k+1, …, 6k+5 に分けられます。6k, 6k+2, 6k+4 は2の倍数、6k+3 は3の倍数なので、5 以上の素数は 6k+1 か 6k+5(= 6k−1)の形です。試し割りの候補を 5, 7, 11, 13, 17, 19, 23, 25, … にしぼれます。",
      notes: ["逆は成り立ちません。25 = 6 × 4 + 1、35 = 6 × 6 − 1 は合成数です。"]
    },
    {
      id: "quick-screen", name: "先にふるう(末尾・各位の和・交代和)", en: "quick screening",
      desc: "試し割りの前に、一の位で 2・5、各位の和で 3、交代和で 11 の倍数を見つけます。これで合成数の多くがすぐに分かります。",
      options: [["2457", "2 + 4 + 5 + 7 = 18 → 9の倍数(2457 = 3³ × 7 × 13)"], ["1365", "一の位が 5 → 5の倍数"], ["2453", "2 − 4 + 5 − 3 = 0 → 11の倍数(2453 = 11 × 223)"]]
    },
    {
      id: "tricky-composites", name: "素数に見える合成数", en: "tricky composites",
      desc: "2・3・5 で割り切れず、素数とまちがえやすい合成数です。7・11・13 などの積を覚えておくと引っかかりません。",
      options: [
        ["91", "7 × 13"], ["119", "7 × 17"], ["133", "7 × 19"], ["143", "11 × 13"],
        ["161", "7 × 23"], ["187", "11 × 17"], ["209", "11 × 19"], ["221", "13 × 17"],
        ["247", "13 × 19"], ["299", "13 × 23"], ["323", "17 × 19"], ["1001", "7 × 11 × 13"]
      ]
    },
    {
      id: "squares-guide", name: "素数の2乗で √N の見当", en: "squares of primes",
      desc: "√N のかわりに素数の2乗と比べます。N が p² 以上で、次の素数の2乗より小さければ、p まで割れば十分です。",
      options: [["7²", "49"], ["11²", "121"], ["13²", "169"], ["17²", "289"], ["19²", "361"], ["23²", "529"], ["29²", "841"], ["31²", "961"]],
      notes: ["例: 503 は 19² = 361 と 23² = 529 のあいだなので、19 まで割れば十分です(503 は素数)。"]
    }
  ],
  questions: [
    {
      id: "p01", level: "basic", q: "試し割りで、√N 以下の素数まで調べれば十分なのはなぜ?", kind: "text",
      choices: [
        "N = a × b と分けられるなら、a と b の小さいほうは √N 以下だから",
        "√N より大きい素数は存在しないから",
        "√N より大きい数では割り算ができないから",
        "素数はすべて √N より小さいから"
      ],
      explain: "a ≤ b なら a × a ≤ a × b = N なので a ≤ √N。合成数なら √N 以下の約数が必ずあります。",
      ref: "sqrt-limit"
    },
    {
      id: "p02", level: "basic", q: "`91` について正しいのは?", kind: "value",
      choices: ["合成数(7 × 13)", "素数", "合成数(3 × 31)", "合成数(9 × 11)"],
      explain: "91 = 7 × 13。2・3・5 では割り切れないので素数に見えますが、7 で割り切れます。3 × 31 = 93、9 × 11 = 99 です。",
      ref: "tricky-composites"
    },
    {
      id: "p03", level: "std", q: "`221` について正しいのは?", kind: "value",
      choices: ["合成数(13 × 17)", "素数", "合成数(7 × 31)", "合成数(11 × 19)"],
      explain: "√221 ≈ 14.9 なので 13 まで調べます。7 × 31 = 217、11 × 19 = 209。13 で割ると 221 = 13 × 17 です。",
      ref: "tricky-composites"
    },
    {
      id: "p04", level: "std", q: "`1001` を素因数分解すると?", kind: "value",
      choices: ["7 × 11 × 13", "素数なので分解できない", "7 × 11 × 17", "3 × 7 × 47"],
      explain: "1001 = 7 × 11 × 13。7 × 11 × 17 = 1309、3 × 7 × 47 = 987 です。1001 は倍数の判定(3けたずつの交代和)にも使います。",
      ref: "tricky-composites"
    },
    {
      id: "p05", level: "std", q: "5 以上の素数を 6 で割った余りは?", kind: "value",
      choices: ["1 か 5", "1 か 3", "1 だけ", "0〜5 のどれでもありうる"],
      explain: "余りが 0, 2, 4 なら2の倍数、3 なら3の倍数になるので、素数(5 以上)の余りは 1 か 5 です。",
      ref: "six-k"
    },
    {
      id: "p06", level: "std", q: "6k + 1 や 6k − 1 の形の数は、すべて素数?", kind: "text",
      choices: ["いいえ。25 = 6 × 4 + 1 のような合成数もある", "はい。すべて素数", "6k + 1 はすべて素数、6k − 1 は合成数もある", "k が素数ならすべて素数"],
      explain: "「5 以上の素数は 6k ± 1」は正しいですが、逆は成り立ちません。25 = 6 × 4 + 1、35 = 6 × 6 − 1 は合成数です。",
      ref: "six-k"
    },
    {
      id: "p07", level: "basic", q: "`307` が素数かを試し割りで調べる。どの素数まで割れば十分?", kind: "value",
      choices: ["17", "19", "13", "23"],
      explain: "17² = 289 ≤ 307 < 19² = 361 なので 17 まで調べれば十分です。どれでも割り切れないので 307 は素数です。",
      ref: "squares-guide"
    },
    {
      id: "p08", level: "std", q: "次のうち、素数はどれ?", kind: "value",
      choices: ["113", "119", "133", "143"],
      explain: "119 = 7 × 17、133 = 7 × 19、143 = 11 × 13。113 は 10² < 113 < 11² で、2, 3, 5, 7 のどれでも割り切れないので素数です。",
      ref: "tricky-composites"
    },
    {
      id: "p09", level: "pro", q: "次のうち、合成数はどれ?", kind: "value",
      choices: ["323", "311", "313", "317"],
      explain: "323 = 17 × 19 です(18² − 1 = (18 − 1)(18 + 1) と見ることもできる)。311・313・317 は素数です。",
      ref: "tricky-composites"
    },
    {
      id: "p10", level: "basic", q: "`2457` について、試し割りの前にすぐ分かることは?", kind: "text",
      choices: [
        "各位の和が 18 なので、3 でも 9 でも割り切れる合成数",
        "一の位が 7 なので、7 で割り切れる合成数",
        "2 でも 5 でも割り切れないので素数",
        "√2457 まで調べないと何も分からない"
      ],
      explain: "2 + 4 + 5 + 7 = 18 は9の倍数なので、2457 は9の倍数です(2457 = 3³ × 7 × 13)。一の位が 7 でも 7 の倍数とは限りません。",
      ref: "quick-screen"
    },
    {
      id: "p11", level: "std", q: "`247` について正しいのは?", kind: "value",
      choices: ["合成数(13 × 19)", "素数", "合成数(7 × 37)", "合成数(11 × 23)"],
      explain: "247 = 13 × 19。7 × 37 = 259、11 × 23 = 253 です。",
      ref: "tricky-composites"
    },
    {
      id: "p12", level: "pro", q: "`841` について正しいのは?", kind: "value",
      choices: ["合成数(29²)", "素数", "合成数(7 × 121)", "合成数(27 × 31)"],
      explain: "29² = 841 です。素数の2乗を覚えておくと見抜けます。7 × 121 = 847、27 × 31 = 837。",
      ref: "squares-guide"
    },
    {
      id: "p13", level: "pro", q: "`997` が素数であることを試し割りで確かめる。割ってみる素数は何個?", kind: "value",
      choices: ["11個", "10個", "12個", "31個"],
      explain: "31² = 961 ≤ 997 < 37² = 1369 なので、31 以下の素数 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 の11個です。",
      ref: "trial-division"
    },
    {
      id: "p14", level: "basic", q: "一の位が 0, 2, 4, 5, 6, 8 の2けた以上の数は?", kind: "text",
      choices: ["必ず合成数", "必ず素数", "素数のこともある", "必ず平方数"],
      explain: "一の位が偶数なら2の倍数、5 か 0 なら5の倍数です。2けた以上なので 2 や 5 そのものではなく、合成数です。",
      ref: "quick-screen"
    }
  ]
});


// =====================================================================
// 04 エラトステネスのふるい
// =====================================================================
PRIM.register("sieve", {
  cards: [
    {
      id: "sieve-steps", name: "エラトステネスのふるい", en: "sieve of Eratosthenes",
      desc: "数を並べて 1 を消し、残っている最小の数(素数)を残してその倍数をすべて消す、をくり返します。最後に残った数が素数です。古代ギリシャの学者エラトステネスが考えた方法です。",
      options: [
        ["1", "1 を消す"],
        ["2", "2 を残し、4, 6, 8, … を消す"],
        ["3", "3 を残し、9, 15, 21, … を消す(6, 12, … はもう消えている)"],
        ["5, 7", "同じように消す。100 までなら 7 で終わり"]
      ]
    },
    {
      id: "sieve-table", name: "1〜100 でやってみる", en: "sieve 1–100", widget: "sieve",
      desc: "ボタンを押すと、2・3・5・7 の倍数を順に消します。色は、その数を最初に消した素数です。"
    },
    {
      id: "sieve-p2", name: "p² から消し始める", en: "start at p²",
      desc: "p の倍数のうち p² より小さいもの(2p, 3p, …, (p − 1)p)は、p より小さい素因数をもつので、もう消えています。だから p² から消し始めればよいのです。",
      options: [["3", "6 は2で消えている → 9 から"], ["5", "10, 15, 20 は消えている → 25 から"], ["7", "14, 21, 28, 35, 42 は消えている → 49 から"]]
    },
    {
      id: "sieve-sqrt", name: "√N の素数まででよい", en: "stop at √N",
      desc: "N 以下の合成数は、√N 以下の素因数を必ずもちます。√N より大きい素数 p では p² > N なので、新しく消す数がありません。1〜100 なら √100 = 10 なので、7 で終わりです。",
      options: [["1〜100", "7 の倍数まで(11² = 121 > 100)"], ["1〜200", "13 の倍数まで(√200 ≈ 14.1)"], ["1〜1000", "31 の倍数まで(√1000 ≈ 31.6)"]]
    }
  ],
  questions: [
    {
      id: "s01", level: "basic", q: "エラトステネスのふるいの最初の手順は?", kind: "text",
      choices: ["1 を消し、2 を残して 2 の倍数を消す", "偶数をすべて消す(2 も消す)", "1 と 2 を残して、3 の倍数を消す", "100 から順に大きい数を消す"],
      explain: "1 は素数ではないので消します。2 は素数なので残し、4, 6, 8, … を消します。",
      ref: "sieve-steps"
    },
    {
      id: "s02", level: "basic", q: "ふるいで最後に残った数(1 を除く)は?", kind: "text",
      choices: ["すべて素数", "すべて奇数の合成数", "素数と平方数", "すべて6の倍数 ± 1 の合成数"],
      explain: "残っているのは、自分より小さい素数のどれの倍数でもない数、つまり素数です。",
      ref: "sieve-steps"
    },
    {
      id: "s03", level: "std", q: "2 の倍数を消したあと、3 の倍数を消す。新しく消える最初の数は?", kind: "value",
      choices: ["9", "6", "3", "12"],
      explain: "3 は残します。6 は 2 の倍数としてもう消えているので、新しく消えるのは 3² = 9 からです。",
      ref: "sieve-p2"
    },
    {
      id: "s04", level: "std", q: "2・3・5 の倍数を消したあと、7 の倍数を消す。新しく消える最初の数は?", kind: "value",
      choices: ["49", "14", "21", "35"],
      explain: "14, 21, 28, 35, 42 は 2・3・5 の倍数としてもう消えています。最初に新しく消えるのは 7² = 49 です。",
      ref: "sieve-p2"
    },
    {
      id: "s05", level: "basic", q: "1〜100 の素数をふるいで求める。どの素数の倍数まで消せば十分?", kind: "value",
      choices: ["7", "10", "11", "50"],
      explain: "√100 = 10 なので、10 以下の素数 7 まで。11² = 121 は 100 をこえるので、11 の倍数で新しく消える数はありません。",
      ref: "sieve-sqrt"
    },
    {
      id: "s06", level: "std", q: "1〜200 の素数をふるいで求める。どの素数の倍数まで消せば十分?", kind: "value",
      choices: ["13", "11", "17", "14"],
      explain: "√200 ≈ 14.1。14 以下の最大の素数は 13 です。17² = 289 は 200 をこえます。",
      ref: "sieve-sqrt"
    },
    {
      id: "s07", level: "std", q: "p の倍数を p² から消し始めてよいのはなぜ?", kind: "text",
      choices: [
        "p² より小さい p の倍数は、p より小さい素因数をもち、もう消えているから",
        "p² より小さい数はすべて素数だから",
        "p² より小さい p の倍数は存在しないから",
        "p² から始めると計算が楽だから(消し残しがあってもよい)"
      ],
      explain: "kp(k < p)は k の素因数(p より小さい)の倍数として、もう消されています。",
      ref: "sieve-p2"
    },
    {
      id: "s08", level: "std", q: "√N 以下の素数の倍数まで消せば十分なのはなぜ?", kind: "text",
      choices: [
        "N 以下の合成数は、√N 以下の素因数を必ずもつから",
        "√N より大きい数には倍数がないから",
        "√N より大きい素数は N より大きいから",
        "√N をこえると表がいっぱいになるから"
      ],
      explain: "合成数 a × b(a ≤ b)の a は √N 以下です。√N より大きい素数 p では、p² > N なので新しく消える数がありません。",
      ref: "sieve-sqrt"
    },
    {
      id: "s09", level: "pro", q: "1〜100 で、2 の倍数を消したあと 3 の倍数を消す。新しく消える数は何個?", kind: "value",
      choices: ["16個", "33個", "32個", "17個"],
      explain: "3 の倍数(3 を除く)は 6〜99 の32個。そのうち 6 の倍数16個は2の倍数として消えているので、新しく消えるのは 9, 15, 21, …, 99 の16個です。",
      ref: "sieve-p2"
    },
    {
      id: "s10", level: "pro", q: "1〜100 のふるいで、7 の倍数を消すとき新しく消える数は何個?", kind: "value",
      choices: ["3個", "13個", "14個", "6個"],
      explain: "新しく消えるのは、7 × (7 以上で 2・3・5 の倍数でない数)= 49, 77, 91 の3個です。",
      ref: "sieve-p2"
    },
    {
      id: "s11", level: "pro", q: "1〜100 のふるいで、5 の倍数を消すとき新しく消える数は何個?", kind: "value",
      choices: ["6個", "19個", "20個", "10個"],
      explain: "5 × 5, 5 × 7, 5 × 11, 5 × 13, 5 × 17, 5 × 19 = 25, 35, 55, 65, 85, 95 の6個。ほかの 5 の倍数は 2 か 3 の倍数としてもう消えています。",
      ref: "sieve-p2"
    },
    {
      id: "s12", level: "basic", q: "エラトステネスは、どんな人?", kind: "text",
      choices: ["古代ギリシャの学者", "江戸時代の和算家", "20世紀の計算機科学者", "中世ヨーロッパの修道士"],
      explain: "エラトステネスは紀元前3世紀ごろの古代ギリシャの学者で、地球の大きさを測ったことでも知られます。",
      ref: "sieve-steps"
    },
    {
      id: "s13", level: "basic", q: "2 の倍数を消したあと、2 の次に残っている最小の数は?", kind: "value",
      choices: ["3", "4", "5", "9"],
      explain: "4 は消えているので、2 の次に残っているのは 3 です。残っている最小の数は必ず素数なので、3 を残して 3 の倍数を消します。",
      ref: "sieve-steps"
    }
  ]
});


// =====================================================================
// 05 素因数分解
// =====================================================================
PRIM.register("factorize", {
  cards: [
    {
      id: "pf-unique", name: "素因数分解", en: "prime factorization",
      desc: "数を素数だけの積で表すことです。かける順番のちがいを除けば、表し方はただ1通りに決まります(素因数分解の一意性)。",
      options: [["60", "2² × 3 × 5"], ["1001", "7 × 11 × 13"], ["2024", "2³ × 11 × 23"]]
    },
    {
      id: "sudare", name: "すだれ算", en: "repeated division",
      desc: "左に割る素数、右に商を書いて、商が素数になるまで下へ割っていきます。左の数と最後の商をすべてかけたものが答えです。",
      code: [{ cap: "360 のすだれ算", text: "2 ) 360\n2 ) 180\n2 )  90\n3 )  45\n3 )  15\n      5" }],
      notes: ["360 = 2³ × 3² × 5。"]
    },
    {
      id: "exponent", name: "指数表記", en: "exponent notation",
      desc: "同じ素数を何回かけたかを、右上の小さな数(指数)で表します。`2 × 2 × 2 × 3 × 3 = 2³ × 3²`。指数が 1 のときは書きません。",
      options: [["2³", "2 × 2 × 2 = 8"], ["3⁴", "3 × 3 × 3 × 3 = 81"], ["2¹⁰", "1024(約1000)"]]
    },
    {
      id: "small-first", name: "小さい素数から割る", en: "divide by small primes first",
      desc: "2 で割れるだけ割り、次に 3、5、7 … と進みます。小さい順に進めると割る数がいつも素数になり、もれも出ません。倍数の見分け方で、割れる素数を先に見つけると速くなります。",
      options: [["2", "一の位が偶数"], ["3", "各位の和が3の倍数"], ["5", "一の位が 0 か 5"], ["11", "交代和が 0 か 11の倍数"]]
    }
  ],
  questions: [
    {
      id: "f01", level: "basic", q: "`360` を素因数分解すると?", kind: "value",
      choices: ["2³ × 3² × 5", "2² × 3² × 5", "2³ × 3 × 5", "2⁴ × 3² × 5"],
      explain: "360 = 2 × 180 = 2² × 90 = 2³ × 45 = 2³ × 3² × 5。2² × 3² × 5 = 180、2³ × 3 × 5 = 120、2⁴ × 3² × 5 = 720 です。",
      ref: "sudare"
    },
    {
      id: "f02", level: "basic", q: "`2 × 2 × 2 × 3 × 3` を指数で表すと?", kind: "value",
      choices: ["2³ × 3²", "2² × 3³", "6⁵", "2³ + 3²"],
      explain: "2 を3回、3 を2回かけているので 2³ × 3²(= 72)です。",
      ref: "exponent"
    },
    {
      id: "f03", level: "basic", q: "すだれ算で、左に書いて割る数は?", kind: "text",
      choices: ["素数(小さい順に)", "どんな約数でもよい(大きい順に)", "偶数だけ", "10 の倍数"],
      explain: "素数で割るから「素」因数分解になります。4 や 6 で割ると、最後にもう一度分解し直す必要があります。",
      ref: "sudare"
    },
    {
      id: "f04", level: "basic", q: "`84` を素因数分解すると?", kind: "value",
      choices: ["2² × 3 × 7", "2 × 3 × 14", "2² × 21", "2³ × 3 × 7"],
      explain: "84 = 2 × 42 = 2² × 21 = 2² × 3 × 7。14 と 21 は素数ではないので、素因数分解の答えにはなりません。",
      ref: "sudare"
    },
    {
      id: "f05", level: "std", q: "`1000` を素因数分解すると?", kind: "value",
      choices: ["2³ × 5³", "10³", "2² × 5² × 10", "2⁴ × 5²"],
      explain: "1000 = 10³ = (2 × 5)³ = 2³ × 5³。10 は素数ではないので 10³ は素因数分解ではありません。",
      ref: "exponent"
    },
    {
      id: "f06", level: "std", q: "素因数分解が `2² × 3 × 5` になる数は?", kind: "value",
      choices: ["60", "30", "120", "90"],
      explain: "4 × 3 × 5 = 60 です。",
      ref: "exponent"
    },
    {
      id: "f07", level: "std", q: "素因数分解について正しいのは?", kind: "text",
      choices: [
        "かける順番のちがいを除けば、ただ1通りに決まる",
        "割る順番によって、ちがう答えになることがある",
        "偶数だけが素因数分解できる",
        "素数は素因数分解できないので、答えは 1 とする"
      ],
      explain: "素因数分解の一意性(算術の基本定理)です。素数 p の素因数分解は p そのものです。",
      ref: "pf-unique"
    },
    {
      id: "f08", level: "std", q: "`2¹⁰` はいくつ?", kind: "value",
      choices: ["1024", "1000", "2048", "512"],
      explain: "2¹⁰ = 1024 で、約1000 と覚えておくと便利です。2⁹ = 512、2¹¹ = 2048。",
      ref: "exponent"
    },
    {
      id: "f09", level: "basic", q: "`90` の素因数をすべて挙げると?", kind: "value",
      choices: ["2, 3, 5", "2, 3, 5, 9", "2, 5, 9", "1, 2, 3, 5"],
      explain: "90 = 2 × 3² × 5 なので素因数は 2, 3, 5 です。9 は素数ではなく、1 は素因数に入れません。",
      ref: "pf-unique"
    },
    {
      id: "f10", level: "pro", q: "`2023` を素因数分解すると?", kind: "value",
      choices: ["7 × 17²", "7² × 41", "3 × 674", "7 × 17 × 19"],
      explain: "2 + 0 + 2 + 3 = 7 なので3の倍数ではありません。7 で割ると 289 = 17²。7² × 41 = 2009、7 × 17 × 19 = 2261 です。",
      ref: "small-first"
    },
    {
      id: "f11", level: "pro", q: "`2024` を素因数分解すると?", kind: "value",
      choices: ["2³ × 11 × 23", "2³ × 253", "2² × 11 × 46", "2³ × 7 × 37"],
      explain: "2024 = 2³ × 253。253 は交代和 3 − 5 + 2 = 0 なので11の倍数で、253 = 11 × 23。253 や 46 は素数ではありません。",
      ref: "small-first"
    },
    {
      id: "f12", level: "pro", q: "`504` を素因数分解すると?", kind: "value",
      choices: ["2³ × 3² × 7", "2³ × 3 × 21", "2² × 3² × 14", "2⁴ × 3² × 7"],
      explain: "504 = 2³ × 63 = 2³ × 3² × 7。2⁴ × 3² × 7 = 1008 です。",
      ref: "sudare"
    },
    {
      id: "f13", level: "std", q: "`2³ × 5²` はいくつ?", kind: "value",
      choices: ["200", "100", "400", "60"],
      explain: "2³ × 5² = 8 × 25 = 200。2 × 3 = 6、5 × 2 = 10 のように指数をかけ算に使うと 60 になってしまいます。",
      ref: "exponent"
    },
    {
      id: "f14", level: "pro", q: "`1001` の素因数をすべて足すと?", kind: "value",
      choices: ["31", "1001", "24", "143"],
      explain: "1001 = 7 × 11 × 13 なので、7 + 11 + 13 = 31 です。",
      ref: "pf-unique"
    }
  ]
});


// =====================================================================
// 06 約数の個数と総和
// =====================================================================
PRIM.register("divisors", {
  cards: [
    {
      id: "divisor-pairs", name: "約数はペアで見つける", en: "divisor pairs",
      desc: "N = a × b の a と b は、どちらも N の約数です。a を 1 から √N まで調べれば、ペアの相手もいっしょに見つかります。",
      options: [["36", "1×36, 2×18, 3×12, 4×9, 6×6 → 9個"], ["48", "1×48, 2×24, 3×16, 4×12, 6×8 → 10個"]]
    },
    {
      id: "divisor-count", name: "約数の個数", en: "(a+1)(b+1)(c+1)…",
      desc: "`N = pᵃ × qᵇ × rᶜ` のとき、約数の個数は `(a+1)(b+1)(c+1)` 個です。約数は p を 0〜a 個、q を 0〜b 個、r を 0〜c 個えらんでかけたものなので、その組み合わせの数になります。",
      options: [["72 = 2³ × 3²", "(3+1)(2+1) = 12個"], ["360 = 2³ × 3² × 5", "(3+1)(2+1)(1+1) = 24個"], ["素数 p", "2個"], ["p²", "3個(1, p, p²)"]]
    },
    {
      id: "divisor-sum", name: "約数の総和", en: "(1+p+…+pᵃ)(1+q+…+qᵇ)…",
      desc: "約数の総和は `(1 + p + … + pᵃ)(1 + q + … + qᵇ)…` です。かっこを展開すると、約数がちょうど1回ずつ出てきます。",
      options: [["12 = 2² × 3", "(1+2+4)(1+3) = 7 × 4 = 28"], ["72 = 2³ × 3²", "(1+2+4+8)(1+3+9) = 15 × 13 = 195"]],
      notes: ["自分自身を除いた約数の和が自分と等しい数を完全数といいます(6、28、496、…)。"]
    },
    {
      id: "odd-count-square", name: "約数の個数が奇数 ⇔ 平方数", en: "odd number of divisors",
      desc: "約数は a と N ÷ a のペアになります。ペアの相手が自分自身(a × a = N)になるのは平方数のときだけなので、約数の個数が奇数になるのは平方数のときだけです。式で見ても、(a+1)(b+1)… が奇数 ⇔ 指数がすべて偶数 です。",
      options: [["36", "1, 2, 3, 4, 6, 9, 12, 18, 36 → 9個(6 × 6 の 6 は1つ)"], ["1〜100", "約数が奇数個の数は 1, 4, 9, …, 100 の10個"]]
    }
  ],
  questions: [
    {
      id: "v01", level: "basic", q: "`12` の約数は何個?", kind: "value",
      choices: ["6個", "4個", "5個", "12個"],
      explain: "1, 2, 3, 4, 6, 12 の6個です。12 = 2² × 3 なので (2+1)(1+1) = 6 とも求められます。",
      ref: "divisor-pairs"
    },
    {
      id: "v02", level: "basic", q: "`36` の約数をすべて挙げると?", kind: "value",
      choices: ["1, 2, 3, 4, 6, 9, 12, 18, 36", "1, 2, 3, 4, 6, 8, 9, 12, 18, 36", "2, 3, 4, 6, 9, 12, 18", "1, 2, 3, 4, 9, 12, 18, 36"],
      explain: "ペアで探すと 1×36, 2×18, 3×12, 4×9, 6×6。8 は 36 の約数ではありません。",
      ref: "divisor-pairs"
    },
    {
      id: "v03", level: "std", q: "`72 = 2³ × 3²` の約数は何個?", kind: "value",
      choices: ["12個", "6個", "7個", "5個"],
      explain: "(3+1)(2+1) = 12個。指数をそのままかけた 3 × 2 = 6 や、たした 3 + 2 = 5 はまちがいです。",
      ref: "divisor-count"
    },
    {
      id: "v04", level: "std", q: "`360` の約数は何個?", kind: "value",
      choices: ["24個", "12個", "18個", "36個"],
      explain: "360 = 2³ × 3² × 5 なので (3+1)(2+1)(1+1) = 24個です。",
      ref: "divisor-count"
    },
    {
      id: "v05", level: "std", q: "`N = pᵃ × qᵇ`(p, q は異なる素数)の約数の個数は?", kind: "value",
      choices: ["(a+1)(b+1)", "a × b", "a + b + 1", "(a+1) + (b+1)"],
      explain: "約数は pⁱ × qʲ(i は 0〜a、j は 0〜b)なので、(a+1) × (b+1) 通りあります。",
      ref: "divisor-count"
    },
    {
      id: "v06", level: "std", q: "約数の個数が奇数になるのは、どんな数?", kind: "text",
      choices: ["平方数", "素数", "奇数", "偶数"],
      explain: "約数は a と N ÷ a のペアになり、a = N ÷ a となるのは平方数のときだけです。例: 36 の約数は9個。",
      ref: "odd-count-square"
    },
    {
      id: "v07", level: "pro", q: "1〜100 のうち、約数の個数が奇数の数は何個?", kind: "value",
      choices: ["10個", "50個", "25個", "9個"],
      explain: "約数が奇数個 ⇔ 平方数なので、1, 4, 9, …, 100 の10個です。",
      ref: "odd-count-square"
    },
    {
      id: "v08", level: "std", q: "`12` の約数をすべて足すと?", kind: "value",
      choices: ["28", "16", "27", "12"],
      explain: "1 + 2 + 3 + 4 + 6 + 12 = 28。公式では (1+2+4)(1+3) = 7 × 4 = 28。12 を除くと 16 です。",
      ref: "divisor-sum"
    },
    {
      id: "v09", level: "pro", q: "`72` の約数の総和は?", kind: "value",
      choices: ["195", "123", "28", "180"],
      explain: "72 = 2³ × 3² なので (1+2+4+8)(1+3+9) = 15 × 13 = 195。自分を除くと 195 − 72 = 123、15 + 13 = 28 はかっこを足してしまったときの値です。",
      ref: "divisor-sum"
    },
    {
      id: "v10", level: "pro", q: "約数がちょうど3個の数は、どんな数?", kind: "text",
      choices: ["素数の2乗", "素数", "2つの素数の積", "立方数"],
      explain: "3 は素数なので、(a+1) = 3 で a = 2。p² の約数は 1, p, p² の3個です(4, 9, 25, 49, …)。",
      ref: "divisor-count"
    },
    {
      id: "v11", level: "pro", q: "自分以外の約数の和が自分と等しい数(完全数)はどれ?", kind: "value",
      choices: ["28", "12", "18", "24"],
      explain: "28 の自分以外の約数は 1 + 2 + 4 + 7 + 14 = 28。12 は 16、18 は 21、24 は 36 になります。",
      ref: "divisor-sum"
    },
    {
      id: "v12", level: "basic", q: "素数の約数は何個?", kind: "value",
      choices: ["2個", "1個", "3個", "決まらない"],
      explain: "素数 p の約数は 1 と p の2個です。これが素数の定義です。",
      ref: "divisor-count"
    },
    {
      id: "v13", level: "std", q: "`2⁵`(= 32)の約数は何個?", kind: "value",
      choices: ["6個", "5個", "10個", "32個"],
      explain: "(5+1) = 6個。1, 2, 4, 8, 16, 32 です。",
      ref: "divisor-count"
    },
    {
      id: "v14", level: "pro", q: "約数がちょうど6個ある数のうち、最も小さいものは?", kind: "value",
      choices: ["12", "18", "24", "30"],
      explain: "6 = 6 または 2 × 3 なので、p⁵ か p² × q の形です。最小は 2⁵ = 32 と 2² × 3 = 12 のうち 12。18 = 2 × 3² も6個ですが 12 より大きく、24 は8個、30 は8個です。",
      ref: "divisor-count"
    }
  ]
});


// =====================================================================
// 07 最大公約数・最小公倍数
// =====================================================================
PRIM.register("gcd-lcm", {
  cards: [
    {
      id: "gcd-lcm-def", name: "最大公約数・最小公倍数", en: "GCD / LCM",
      desc: "最大公約数(GCD)は2つの数に共通する約数のうち最大のもの、最小公倍数(LCM)は共通する倍数のうち最小のもの(0 を除く)です。",
      options: [["12 と 18", "GCD 6、LCM 36"], ["4 と 6", "GCD 2、LCM 12"]]
    },
    {
      id: "gcd-lcm-factor", name: "素因数分解で求める", en: "min / max exponents",
      desc: "両方を素因数分解し、GCD は共通する素数を小さいほうの指数で、LCM は出てくる素数すべてを大きいほうの指数でかけます。",
      options: [["a = 360", "2³ × 3² × 5"], ["b = 756", "2² × 3³ × 7"], ["GCD", "2² × 3² = 36"], ["LCM", "2³ × 3³ × 5 × 7 = 7560"]]
    },
    {
      id: "euclid", name: "ユークリッドの互除法", en: "Euclidean algorithm",
      desc: "大きいほうを小さいほうで割り、割った数を余りで割る、をくり返します。余りが 0 になったときの割る数が最大公約数です。`a = b × q + r` のとき GCD(a, b) = GCD(b, r) となることを使います。素因数分解しにくい大きな数でも求められます。",
      code: [{ cap: "GCD(252, 105)", text: "252 = 105 × 2 + 42\n105 =  42 × 2 + 21\n 42 =  21 × 2 + 0\n→ GCD = 21" }]
    },
    {
      id: "ab-gcd-lcm", name: "a × b = GCD × LCM", en: "product rule",
      desc: "2つの数の積は、最大公約数と最小公倍数の積に等しくなります。a = G × x、b = G × y(x と y は互いに素)とおくと LCM = G × x × y なので、a × b = G × (G × x × y) です。",
      options: [["12 と 18", "12 × 18 = 216 = 6 × 36"], ["GCD 4、LCM 48、a = 12", "b = 4 × 48 ÷ 12 = 16"]]
    },
    {
      id: "coprime", name: "互いに素", en: "coprime",
      desc: "最大公約数が 1 である2つの数を、互いに素といいます。共通の素因数をもちません。このとき LCM = a × b です。",
      options: [["8 と 15", "2³ と 3 × 5 → 互いに素"], ["連続する2つの整数", "いつも互いに素(差が 1 だから)"], ["9 と 12", "どちらも3の倍数 → 互いに素でない"]]
    }
  ],
  questions: [
    {
      id: "g01", level: "basic", q: "`12` と `18` の最大公約数は?", kind: "value",
      choices: ["6", "3", "2", "36"],
      explain: "12 = 2² × 3、18 = 2 × 3²。共通の素因数を小さい指数で 2 × 3 = 6。36 は最小公倍数です。",
      ref: "gcd-lcm-def"
    },
    {
      id: "g02", level: "basic", q: "`4` と `6` の最小公倍数は?", kind: "value",
      choices: ["12", "24", "2", "6"],
      explain: "4 = 2²、6 = 2 × 3 なので 2² × 3 = 12。24 は積で、公倍数ですが最小ではありません。",
      ref: "gcd-lcm-def"
    },
    {
      id: "g03", level: "std", q: "`2³ × 3² × 5` と `2² × 3³ × 7` の最大公約数は?", kind: "value",
      choices: ["2² × 3²", "2³ × 3³", "2² × 3² × 5 × 7", "2 × 3"],
      explain: "共通の素数は 2 と 3。小さいほうの指数をとって 2² × 3² = 36 です。",
      ref: "gcd-lcm-factor"
    },
    {
      id: "g04", level: "std", q: "`2³ × 3² × 5` と `2² × 3³ × 7` の最小公倍数は?", kind: "value",
      choices: ["2³ × 3³ × 5 × 7", "2² × 3² × 5 × 7", "2³ × 3³", "2⁵ × 3⁵ × 5 × 7"],
      explain: "出てくる素数すべてを、大きいほうの指数で 2³ × 3³ × 5 × 7 = 7560。2⁵ × 3⁵ × 5 × 7 は2つの積です。",
      ref: "gcd-lcm-factor"
    },
    {
      id: "g05", level: "std", q: "互除法で `252` と `105` の最大公約数を求めると?", kind: "value",
      choices: ["21", "42", "7", "105"],
      explain: "252 = 105 × 2 + 42、105 = 42 × 2 + 21、42 = 21 × 2 + 0。余りが 0 になったときの割る数 21 が答えです。",
      ref: "euclid"
    },
    {
      id: "g06", level: "std", q: "ユークリッドの互除法のもとになる性質は?", kind: "text",
      choices: [
        "a = b × q + r のとき、GCD(a, b) = GCD(b, r)",
        "a × b = GCD × LCM",
        "GCD(a, b) = a − b",
        "a と b がどちらも素数なら、GCD は 1"
      ],
      explain: "a と b の公約数は r = a − b × q も割り切り、b と r の公約数は a も割り切ります。だから公約数の集まりが同じで、GCD も同じです。",
      ref: "euclid"
    },
    {
      id: "g07", level: "basic", q: "「互いに素」とは?", kind: "text",
      choices: ["最大公約数が 1 であること", "どちらも素数であること", "どちらも奇数であること", "最小公倍数が 1 であること"],
      explain: "8 と 15 のように、素数でなくても互いに素になります。",
      ref: "coprime"
    },
    {
      id: "g08", level: "basic", q: "次のうち、互いに素な組はどれ?", kind: "value",
      choices: ["8 と 15", "9 と 12", "14 と 21", "10 と 25"],
      explain: "8 = 2³、15 = 3 × 5 で共通の素因数がありません。9 と 12 は3、14 と 21 は7、10 と 25 は5が共通です。",
      ref: "coprime"
    },
    {
      id: "g09", level: "std", q: "2つの数の最大公約数が 4、最小公倍数が 48。一方が 12 のとき、もう一方は?", kind: "value",
      choices: ["16", "4", "36", "576"],
      explain: "a × b = GCD × LCM なので、b = 4 × 48 ÷ 12 = 16。確かめ: GCD(12, 16) = 4、LCM = 48。",
      ref: "ab-gcd-lcm"
    },
    {
      id: "g10", level: "pro", q: "互除法で `391` と `299` の最大公約数を求めると?", kind: "value",
      choices: ["23", "13", "17", "1"],
      explain: "391 = 299 × 1 + 92、299 = 92 × 3 + 23、92 = 23 × 4 + 0 → 23。実際 391 = 17 × 23、299 = 13 × 23 です。",
      ref: "euclid"
    },
    {
      id: "g11", level: "std", q: "連続する2つの整数(例: n と n + 1)の最大公約数は?", kind: "value",
      choices: ["いつも 1", "いつも 2", "n", "n によって変わる"],
      explain: "公約数は差の 1 も割り切るので、1 しかありません。連続する整数はいつも互いに素です。",
      ref: "coprime"
    },
    {
      id: "g12", level: "std", q: "縦 84cm、横 126cm の長方形を、同じ大きさの正方形ですき間なく敷きつめる。いちばん大きい正方形の1辺は?", kind: "value",
      choices: ["42cm", "21cm", "14cm", "252cm"],
      explain: "1辺は 84 と 126 の公約数で、最大のものは GCD(84, 126) = 42 です(126 = 84 × 1 + 42、84 = 42 × 2)。",
      ref: "gcd-lcm-def"
    },
    {
      id: "g13", level: "std", q: "バス A は6分ごと、バス B は8分ごとに出る。いま同時に出たとき、次に同時に出るのは何分後?", kind: "value",
      choices: ["24分後", "48分後", "14分後", "2分後"],
      explain: "6 と 8 の最小公倍数 24 分後です。48 は積、2 は最大公約数です。",
      ref: "gcd-lcm-def"
    },
    {
      id: "g14", level: "pro", q: "2つの自然数の積が 864、最大公約数が 12 のとき、最小公倍数は?", kind: "value",
      choices: ["72", "36", "10368", "144"],
      explain: "a × b = GCD × LCM なので、LCM = 864 ÷ 12 = 72(例: 12 と 72、24 と 36)。",
      ref: "ab-gcd-lcm"
    }
  ]
});


// =====================================================================
// 08 平方数・立方数
// =====================================================================
PRIM.register("powers", {
  cards: [
    {
      id: "square-exp", name: "平方数の素因数分解", en: "even exponents",
      desc: "平方数を素因数分解すると、指数がすべて偶数になります。逆に、指数がすべて偶数なら平方数です。",
      options: [["144", "2⁴ × 3² = (2² × 3)² = 12²"], ["900", "2² × 3² × 5² = 30²"]]
    },
    {
      id: "cube-exp", name: "立方数の素因数分解", en: "exponents divisible by 3",
      desc: "立方数は、指数がすべて3の倍数になります。",
      options: [["216", "2³ × 3³ = 6³"], ["64", "2⁶ = 8² = 4³(平方数でも立方数でもある)"]]
    },
    {
      id: "min-multiplier", name: "最小のかける数・割る数", en: "make it a square",
      desc: "素因数分解して、指数が奇数の素数を1つずつかける(または割る)と平方数になります。立方数なら、指数を3の倍数にそろえます。",
      options: [
        ["72 = 2³ × 3²", "× 2 → 144 = 12²"],
        ["180 = 2² × 3² × 5", "× 5 → 900 = 30²"],
        ["540 = 2² × 3³ × 5", "× 3 × 5 = × 15 → 8100 = 90²"],
        ["252 = 2² × 3² × 7", "÷ 7 → 36 = 6²"],
        ["72 を立方数に", "× 3 → 216 = 6³"]
      ]
    },
    {
      id: "sqrt-simplify", name: "√ の簡単化", en: "√(a² × b) = a√b",
      desc: "√ の中を素因数分解し、2つそろった素数を1つにして外に出します。",
      options: [["√72", "√(2² × 2 × 3²) = 2 × 3 × √2 = 6√2"], ["√180", "√(2² × 3² × 5) = 6√5"], ["√432", "√(2⁴ × 3³) = 2² × 3 × √3 = 12√3"]]
    },
    {
      id: "square-digits", name: "平方数の一の位", en: "last digit of squares",
      desc: "平方数の一の位は 0, 1, 4, 5, 6, 9 のどれかで、2, 3, 7, 8 にはなりません。一の位が 2, 3, 7, 8 なら、すぐに平方数でないと分かります。",
      options: [["1², 9²", "一の位 1"], ["2², 8²", "一の位 4"], ["3², 7²", "一の位 9"], ["4², 6²", "一の位 6"], ["5²", "一の位 5"], ["10²", "一の位 0"]]
    }
  ],
  questions: [
    {
      id: "w01", level: "basic", q: "平方数を素因数分解したとき、指数はどうなっている?", kind: "text",
      choices: ["すべて偶数", "すべて奇数", "すべて2", "すべて3の倍数"],
      explain: "(2² × 3)² = 2⁴ × 3² のように、2乗すると指数が2倍になるので偶数になります。",
      ref: "square-exp"
    },
    {
      id: "w02", level: "basic", q: "立方数を素因数分解したとき、指数はどうなっている?", kind: "text",
      choices: ["すべて3の倍数", "すべて偶数", "すべて3", "すべて奇数"],
      explain: "3乗すると指数が3倍になります。例: 216 = 2³ × 3³、64 = 2⁶。",
      ref: "cube-exp"
    },
    {
      id: "w03", level: "basic", q: "次のうち、平方数はどれ?", kind: "value",
      choices: ["2⁴ × 3²", "2³ × 3²", "2² × 3³", "2 × 3⁴"],
      explain: "指数がすべて偶数なのは 2⁴ × 3² = 144 = 12² だけです。",
      ref: "square-exp"
    },
    {
      id: "w04", level: "std", q: "`72` にできるだけ小さい自然数をかけて平方数にしたい。かける数は?", kind: "value",
      choices: ["2", "3", "6", "8"],
      explain: "72 = 2³ × 3²。指数が奇数の 2 を1つかけると 2⁴ × 3² = 144 = 12² になります。",
      ref: "min-multiplier"
    },
    {
      id: "w05", level: "std", q: "`180` にできるだけ小さい自然数をかけて平方数にしたい。かける数は?", kind: "value",
      choices: ["5", "2", "10", "20"],
      explain: "180 = 2² × 3² × 5。5 をかけて 900 = 30² になります。",
      ref: "min-multiplier"
    },
    {
      id: "w06", level: "std", q: "`252` をできるだけ小さい自然数で割って平方数にしたい。割る数は?", kind: "value",
      choices: ["7", "2", "3", "28"],
      explain: "252 = 2² × 3² × 7。7 で割ると 36 = 6² になります。",
      ref: "min-multiplier"
    },
    {
      id: "w07", level: "pro", q: "`540` にできるだけ小さい自然数をかけて平方数にしたい。かける数は?", kind: "value",
      choices: ["15", "5", "3", "60"],
      explain: "540 = 2² × 3³ × 5。指数が奇数なのは 3 と 5 なので、3 × 5 = 15 をかけて 8100 = 90²。",
      ref: "min-multiplier"
    },
    {
      id: "w08", level: "pro", q: "`72` にできるだけ小さい自然数をかけて立方数にしたい。かける数は?", kind: "value",
      choices: ["3", "2", "6", "9"],
      explain: "72 = 2³ × 3²。3 の指数を 3 にするため 3 を1つかけて 216 = 6³。",
      ref: "min-multiplier"
    },
    {
      id: "w09", level: "std", q: "`√72` を簡単にすると?", kind: "value",
      choices: ["6√2", "3√8", "2√18", "36√2"],
      explain: "72 = 6² × 2 なので √72 = 6√2。3√8 や 2√18 も値は同じですが、√ の中がまだ小さくできます。",
      ref: "sqrt-simplify"
    },
    {
      id: "w10", level: "std", q: "`√180` を簡単にすると?", kind: "value",
      choices: ["6√5", "3√20", "5√6", "9√2"],
      explain: "180 = 2² × 3² × 5 なので √180 = 2 × 3 × √5 = 6√5。",
      ref: "sqrt-simplify"
    },
    {
      id: "w11", level: "pro", q: "`√432` を簡単にすると?", kind: "value",
      choices: ["12√3", "6√12", "4√27", "3√48"],
      explain: "432 = 2⁴ × 3³ = (2² × 3)² × 3 なので √432 = 12√3。ほかは √ の中がまだ平方数を含みます。",
      ref: "sqrt-simplify"
    },
    {
      id: "w12", level: "std", q: "平方数の一の位になることがない数字の組は?", kind: "value",
      choices: ["2, 3, 7, 8", "1, 4, 6, 9", "0, 5, 6", "3, 5, 7"],
      explain: "0² 〜 9² の一の位は 0, 1, 4, 9, 6, 5, 6, 9, 4, 1。2, 3, 7, 8 は出てきません。",
      ref: "square-digits"
    },
    {
      id: "w13", level: "pro", q: "1 より大きく、平方数でも立方数でもある数のうち、最小のものは?", kind: "value",
      choices: ["64", "36", "16", "8"],
      explain: "指数が2の倍数でも3の倍数でもある、つまり6の倍数。最小は 2⁶ = 64 = 8² = 4³ です。",
      ref: "cube-exp"
    },
    {
      id: "w14", level: "basic", q: "1〜100 のうち、立方数はいくつある?", kind: "value",
      choices: ["4個", "3個", "5個", "10個"],
      explain: "1³ = 1、2³ = 8、3³ = 27、4³ = 64 の4個です。5³ = 125 は 100 をこえます。",
      ref: "cube-exp"
    }
  ]
});


// =====================================================================
// 09 階乗と素因数
// =====================================================================
PRIM.register("factorial", {
  cards: [
    {
      id: "factorial-def", name: "階乗", en: "n! = 1 × 2 × … × n",
      desc: "1 から n までの整数をすべてかけたものを n の階乗といい、n! と書きます。",
      options: [["5!", "120"], ["6!", "720"], ["10!", "3628800 = 2⁸ × 3⁴ × 5² × 7"]]
    },
    {
      id: "legendre", name: "ルジャンドルの公式", en: "Legendre's formula",
      desc: "n! に含まれる素数 p の個数(指数)は `⌊n/p⌋ + ⌊n/p²⌋ + ⌊n/p³⌋ + …` です(⌊ ⌋ は小数点以下の切り捨て)。p の倍数を数え、p² の倍数はもう1個、p³ の倍数はさらに1個…と足していきます。",
      options: [["10! の 3", "⌊10/3⌋ + ⌊10/9⌋ = 3 + 1 = 4"], ["20! の 3", "6 + 2 = 8"]]
    },
    {
      id: "trailing-zeros", name: "n! の末尾の 0 の個数", en: "trailing zeros",
      desc: "末尾の 0 の数は、10 = 2 × 5 が何組できるかで決まります。n! には 2 のほうが 5 より多く含まれるので、5 の個数を数えれば足ります。",
      options: [["10!", "10 ÷ 5 = 2 → 2個"], ["25!", "5 + 1 = 6個"], ["100!", "20 + 4 = 24個"], ["1000!", "200 + 40 + 8 + 1 = 249個"]],
      notes: ["24! は4個、25! は6個。末尾の 0 がちょうど5個の n! はありません(25 = 5² で一度に2個ふえる)。"]
    },
    {
      id: "two-count", name: "n! に含まれる 2 の個数", en: "power of 2 in n!",
      desc: "2 の倍数、4 の倍数、8 の倍数、… の個数を足します(ルジャンドルの公式で p = 2)。",
      options: [["10!", "5 + 2 + 1 = 8"], ["30!", "15 + 7 + 3 + 1 = 26"], ["100!", "50 + 25 + 12 + 6 + 3 + 1 = 97"]]
    }
  ],
  questions: [
    {
      id: "x01", level: "basic", q: "`5!` はいくつ?", kind: "value",
      choices: ["120", "15", "25", "60"],
      explain: "5! = 1 × 2 × 3 × 4 × 5 = 120。15 は 1 から 5 までの和です。",
      ref: "factorial-def"
    },
    {
      id: "x02", level: "basic", q: "`10!` の末尾に 0 はいくつ並ぶ?", kind: "value",
      choices: ["2個", "1個", "3個", "10個"],
      explain: "10! = 3628800。1〜10 に5の倍数は 5 と 10 の2つなので、0 は2個です。",
      ref: "trailing-zeros"
    },
    {
      id: "x03", level: "std", q: "`25!` の末尾に 0 はいくつ並ぶ?", kind: "value",
      choices: ["6個", "5個", "7個", "25個"],
      explain: "5 の倍数が ⌊25/5⌋ = 5 個、25 の倍数(5 を2個もつ)が ⌊25/25⌋ = 1 個で、5 + 1 = 6個です。",
      ref: "trailing-zeros"
    },
    {
      id: "x04", level: "std", q: "`100!` の末尾に 0 はいくつ並ぶ?", kind: "value",
      choices: ["24個", "20個", "25個", "10個"],
      explain: "⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24個です。",
      ref: "trailing-zeros"
    },
    {
      id: "x05", level: "std", q: "n! の末尾の 0 を数えるとき、5 の個数だけ数えればよいのはなぜ?", kind: "text",
      choices: [
        "10 = 2 × 5 で、n! には 2 のほうが 5 より多く含まれるから",
        "5 は 10 の半分だから",
        "2 は素数ではないから",
        "n! には 2 が含まれないから"
      ],
      explain: "2 は偶数ごとに出てくるので、5 よりずっと多くあります。だから 10 の組の数は 5 の個数で決まります。",
      ref: "trailing-zeros"
    },
    {
      id: "x06", level: "std", q: "ルジャンドルの公式で、n! に含まれる素数 p の個数は?", kind: "value",
      choices: ["⌊n/p⌋ + ⌊n/p²⌋ + ⌊n/p³⌋ + …", "⌊n/p⌋", "n ÷ p", "⌊n/p⌋ × ⌊n/p²⌋ × …"],
      explain: "p の倍数で1個ずつ、p² の倍数はもう1個、p³ の倍数はさらに1個…と数えるので、足し算になります。",
      ref: "legendre"
    },
    {
      id: "x07", level: "pro", q: "`10!` に、素因数 2 はいくつ含まれる?", kind: "value",
      choices: ["8個", "5個", "7個", "10個"],
      explain: "⌊10/2⌋ + ⌊10/4⌋ + ⌊10/8⌋ = 5 + 2 + 1 = 8個です。",
      ref: "two-count"
    },
    {
      id: "x08", level: "pro", q: "`10!` を素因数分解すると?", kind: "value",
      choices: ["2⁸ × 3⁴ × 5² × 7", "2⁵ × 3³ × 5² × 7", "2⁸ × 3⁴ × 5 × 7", "2⁷ × 3⁴ × 5² × 7"],
      explain: "2: 5 + 2 + 1 = 8、3: 3 + 1 = 4、5: 2、7: 1。2⁸ × 3⁴ × 5² × 7 = 3628800 です。",
      ref: "legendre"
    },
    {
      id: "x09", level: "pro", q: "`50!` の末尾に 0 はいくつ並ぶ?", kind: "value",
      choices: ["12個", "10個", "11個", "13個"],
      explain: "⌊50/5⌋ + ⌊50/25⌋ = 10 + 2 = 12個です。",
      ref: "trailing-zeros"
    },
    {
      id: "x10", level: "pro", q: "`20!` に、素因数 3 はいくつ含まれる?", kind: "value",
      choices: ["8個", "6個", "9個", "7個"],
      explain: "⌊20/3⌋ + ⌊20/9⌋ = 6 + 2 = 8個です。",
      ref: "legendre"
    },
    {
      id: "x11", level: "basic", q: "`6!` はいくつ?", kind: "value",
      choices: ["720", "120", "36", "21"],
      explain: "6! = 5! × 6 = 120 × 6 = 720 です。",
      ref: "factorial-def"
    },
    {
      id: "x12", level: "pro", q: "n! の末尾の 0 がちょうど5個になる n は?", kind: "text",
      choices: ["そのような n はない", "n = 25", "n = 24", "n = 30"],
      explain: "24! の末尾の 0 は4個、25! は6個です。25 = 5² で5が一度に2個ふえるので、5個になる n はありません。",
      ref: "trailing-zeros"
    },
    {
      id: "x13", level: "pro", q: "`30!` に、素因数 2 はいくつ含まれる?", kind: "value",
      choices: ["26個", "15個", "22個", "25個"],
      explain: "⌊30/2⌋ + ⌊30/4⌋ + ⌊30/8⌋ + ⌊30/16⌋ = 15 + 7 + 3 + 1 = 26個です。",
      ref: "two-count"
    },
    {
      id: "x14", level: "std", q: "`1000!` の末尾に 0 はいくつ並ぶ?", kind: "value",
      choices: ["249個", "200個", "240個", "250個"],
      explain: "⌊1000/5⌋ + ⌊1000/25⌋ + ⌊1000/125⌋ + ⌊1000/625⌋ = 200 + 40 + 8 + 1 = 249個です。",
      ref: "trailing-zeros"
    }
  ]
});


// =====================================================================
// 10 素数の性質
// =====================================================================
PRIM.register("theory", {
  cards: [
    {
      id: "infinite-primes", name: "素数は無限にある", en: "Euclid's theorem",
      desc: "素数が有限個 p₁, p₂, …, pₙ しかないと仮定し、`N = p₁ × p₂ × … × pₙ + 1` を考えます。N はどの pᵢ で割っても 1 余るので、N の素因数はリストにない新しい素数です。これは仮定に反するので、素数は無限にあります(ユークリッドの証明)。",
      notes: ["N 自身が素数とは限りません。2 × 3 × 5 × 7 × 11 × 13 + 1 = 30031 = 59 × 509。"]
    },
    {
      id: "twin-primes", name: "双子素数", en: "twin primes",
      desc: "差が 2 の素数の組です。無限にあるかどうかは、まだ分かっていません(双子素数の予想、未解決)。",
      options: [["100 以下", "(3, 5) (5, 7) (11, 13) (17, 19) (29, 31) (41, 43) (59, 61) (71, 73) の8組"]]
    },
    {
      id: "mersenne", name: "メルセンヌ素数", en: "Mersenne prime 2ⁿ − 1",
      desc: "2ⁿ − 1 の形の素数です。2ⁿ − 1 が素数なら n も素数ですが、逆は成り立ちません。これまでに見つかっている最大の素数の多くは、メルセンヌ素数です。",
      options: [["2² − 1", "3(素数)"], ["2³ − 1", "7(素数)"], ["2⁵ − 1", "31(素数)"], ["2⁷ − 1", "127(素数)"], ["2¹¹ − 1", "2047 = 23 × 89(合成数)"]]
    },
    {
      id: "fermat-little", name: "フェルマーの小定理", en: "Fermat's little theorem",
      desc: "p が素数で、a が p の倍数でないとき、`aᵖ⁻¹` を p で割った余りは 1 です。",
      options: [["2¹⁰ ÷ 11", "1024 = 11 × 93 + 1 → 余り 1"], ["3⁶ ÷ 7", "729 = 7 × 104 + 1 → 余り 1"]],
      notes: ["余りが 1 にならなければ、p は素数ではないと分かります。ただし余りが 1 でも素数とは限りません(例: 2³⁴⁰ を 341 = 11 × 31 で割った余りは 1)。"]
    },
    {
      id: "goldbach", name: "ゴールドバッハ予想", en: "Goldbach's conjecture",
      desc: "「4 以上の偶数は、2つの素数の和で表せる」という予想です。とても大きな数までコンピューターで確かめられていますが、証明はされていない未解決問題です。",
      options: [["4", "2 + 2"], ["10", "3 + 7 = 5 + 5"], ["28", "5 + 23 = 11 + 17"], ["100", "3 + 97 = 11 + 89 = 17 + 83 = …"]]
    },
    {
      id: "prime-theorem", name: "素数定理", en: "prime number theorem",
      desc: "N 以下の素数の個数は、N が大きいとき、およそ `N ÷ ln N`(ln は自然対数)です。素数の割合はおよそ 1 ÷ ln N で、数が大きくなるほど少しずつまばらになります。",
      options: [["N = 100", "25個(N ÷ ln N ≈ 22)"], ["N = 1000", "168個(≈ 145)"], ["N = 100万", "78498個(≈ 72382)"]]
    }
  ],
  questions: [
    {
      id: "t01", level: "basic", q: "素数の個数について正しいのは?", kind: "text",
      choices: ["無限にある(ユークリッドが証明した)", "約100万個ある", "有限だが、まだ数え終わっていない", "無限にあるかどうかは未解決"],
      explain: "紀元前にユークリッドが、素数が無限にあることを証明しています。",
      ref: "infinite-primes"
    },
    {
      id: "t02", level: "std", q: "ユークリッドによる「素数は無限にある」の証明で考える数は?", kind: "text",
      choices: [
        "知っている素数をすべてかけて 1 を足した数",
        "知っている素数をすべて足した数",
        "いちばん大きい素数の2乗",
        "知っている素数をすべてかけて 2 を足した数"
      ],
      explain: "N = p₁ × … × pₙ + 1 は、どの pᵢ で割っても 1 余るので、リストにない素因数をもちます。",
      ref: "infinite-primes"
    },
    {
      id: "t03", level: "pro", q: "`2 × 3 × 5 × 7 × 11 × 13 + 1 = 30031` について正しいのは?", kind: "text",
      choices: [
        "合成数(59 × 509)。証明では、新しい素因数があることが言えるだけ",
        "素数。この形の数はいつも素数になる",
        "13 で割り切れる",
        "2 で割り切れる"
      ],
      explain: "30031 = 59 × 509。2〜13 のどれで割っても 1 余るので、59 と 509 という新しい素因数が出てきます。この数自体が素数とは限りません。",
      ref: "infinite-primes"
    },
    {
      id: "t04", level: "basic", q: "双子素数とは?", kind: "text",
      choices: ["差が 2 の素数の組(例: 11 と 13)", "同じ素数を2回かけた数", "和が素数になる2つの素数", "2 と 3 のこと"],
      explain: "(3, 5)、(5, 7)、(11, 13)、(17, 19) などです。",
      ref: "twin-primes"
    },
    {
      id: "t05", level: "std", q: "次のうち、双子素数はどれ?", kind: "value",
      choices: ["(41, 43)", "(37, 39)", "(51, 53)", "(87, 89)"],
      explain: "39 = 3 × 13、51 = 3 × 17、87 = 3 × 29 は合成数です。41 と 43 はどちらも素数です。",
      ref: "twin-primes"
    },
    {
      id: "t06", level: "std", q: "双子素数が無限にあるかどうかは?", kind: "text",
      choices: ["まだ分かっていない(未解決)", "無限にあると証明されている", "有限だと証明されている", "8組しかない"],
      explain: "「双子素数は無限にある」という予想は、まだ証明されていません。",
      ref: "twin-primes"
    },
    {
      id: "t07", level: "std", q: "メルセンヌ数とは、どんな形の数?", kind: "value",
      choices: ["2ⁿ − 1", "2ⁿ + 1", "n² + 1", "2 × n + 1"],
      explain: "2ⁿ − 1 の形の数をメルセンヌ数、そのうち素数のものをメルセンヌ素数といいます。",
      ref: "mersenne"
    },
    {
      id: "t08", level: "pro", q: "n が素数なら、2ⁿ − 1 は必ず素数?", kind: "text",
      choices: ["いいえ。2¹¹ − 1 = 2047 = 23 × 89 は合成数", "はい。必ず素数", "n が奇数なら必ず素数", "n が素数のときは必ず合成数"],
      explain: "2ⁿ − 1 が素数なら n は素数ですが、逆は成り立ちません。n = 2, 3, 5, 7 では素数、n = 11 で合成数になります。",
      ref: "mersenne"
    },
    {
      id: "t09", level: "std", q: "`2⁷ − 1` はいくつで、素数?", kind: "value",
      choices: ["127(素数)", "127(合成数)", "63(合成数)", "128(合成数)"],
      explain: "2⁷ = 128 なので 127。√127 ≈ 11.3 で、11 以下の素数で割り切れないので素数です(メルセンヌ素数)。",
      ref: "mersenne"
    },
    {
      id: "t10", level: "pro", q: "フェルマーの小定理の内容は?(p は素数、a は p の倍数でない)", kind: "text",
      choices: [
        "aᵖ⁻¹ を p で割った余りは 1",
        "aᵖ を p で割った余りは 0",
        "aᵖ⁻¹ は p で割り切れる",
        "aᵖ⁻¹ − 1 は素数"
      ],
      explain: "例: 2¹⁰ = 1024 = 11 × 93 + 1。aᵖ のほうは、p で割った余りが a を p で割った余りと同じになります(0 ではない)。",
      ref: "fermat-little"
    },
    {
      id: "t11", level: "std", q: "`2¹⁰` を 11 で割った余りは?", kind: "value",
      choices: ["1", "0", "2", "10"],
      explain: "11 は素数で、2 は11の倍数でないので、フェルマーの小定理から余りは 1。実際 1024 = 11 × 93 + 1 です。",
      ref: "fermat-little"
    },
    {
      id: "t12", level: "pro", q: "`3⁶` を 7 で割った余りは?", kind: "value",
      choices: ["1", "3", "6", "0"],
      explain: "7 は素数なので、フェルマーの小定理で 3⁶ を 7 で割った余りは 1。3⁶ = 729 = 7 × 104 + 1 です。",
      ref: "fermat-little"
    },
    {
      id: "t13", level: "basic", q: "ゴールドバッハ予想とは?", kind: "text",
      choices: [
        "4 以上の偶数は、2つの素数の和で表せる",
        "すべての奇数は素数である",
        "素数は無限にある",
        "2つの素数の積は、いつも偶数である"
      ],
      explain: "例: 28 = 5 + 23 = 11 + 17。とても大きな数まで確かめられていますが、まだ証明されていません。",
      ref: "goldbach"
    },
    {
      id: "t14", level: "basic", q: "ゴールドバッハ予想は、いまどうなっている?", kind: "text",
      choices: ["まだ証明されていない(未解決)", "正しいと証明された", "反例が見つかった", "偶数では正しく、奇数では誤りと証明された"],
      explain: "コンピューターで非常に大きな偶数まで確かめられていますが、すべての偶数について成り立つ証明はまだありません。",
      ref: "goldbach"
    },
    {
      id: "t15", level: "pro", q: "素数定理によると、N 以下の素数の個数はおよそ?", kind: "value",
      choices: ["N ÷ ln N", "√N", "N ÷ 2", "ln N"],
      explain: "ln は自然対数です。N = 100万 なら N ÷ ln N ≈ 72382 で、実際の個数 78498 に近い値になります。",
      ref: "prime-theorem"
    },
    {
      id: "t16", level: "pro", q: "100万以下の素数は、およそ何個?", kind: "value",
      choices: ["約8万個", "約50万個", "約1000個", "約30万個"],
      explain: "100万以下の素数は78498個です。素数定理の N ÷ ln N ≈ 72000 という見積もりにも近い数です。",
      ref: "prime-theorem"
    }
  ]
});

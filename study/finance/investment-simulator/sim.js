// 投資シミュレーション道場: 計算部分。
// DOM を触らない純粋な関数だけを置く(jsc で単体実行して検算できるように)。
//
// 時間の数え方(全タブ共通):
//   月単位。t = 0, 1, …, N(N = 月数)。時点 t は「t か月たったとき」。
//   月 t(t = 0 … N−1)の初めに買い、その後1か月値動きして時点 t+1 になる。
//   prices[t] = 時点 t の基準価額(10,000円スタート)。
//   value[t]  = 時点 t の評価額(その月の買い付けの前)。value[N] が最終額。
//
// 月次リターン(対数正規):
//   σm = σ/√12, μm = ln(1+r)/12 − σm²/2, R = exp(μm + σm·z) − 1
//   r は年率リターンの平均(期待値)。中央値はそれより少し下になる。
// 現金の利息: 毎月 (1+r)^(1/12) 倍(複利と長期タブの値動きなしの計算と同じ形)。
var Sim = (function () {
  "use strict";

  var START_PRICE = 10000;
  var TAX_RATE = 0.20315;
  var TRIALS = 1000;

  // 資産の性格の初期値(分散投資タブの上級設定で変えられる)
  var DEFAULT_ASSETS = {
    stockR: 0.06, stockS: 0.18,
    bondR: 0.02, bondS: 0.05,
    cashR: 0.002,
    rho: 0.2
  };

  // ---------- 乱数 ----------
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ボックス=ミュラー法の正規乱数(2つ目は次の呼び出しで使う)
  function normalGen(rand) {
    var spare = null;
    return function () {
      if (spare !== null) { var s = spare; spare = null; return s; }
      var u = rand();
      while (u <= 1e-12) u = rand();
      var v = rand();
      var m = Math.sqrt(-2 * Math.log(u));
      spare = m * Math.sin(2 * Math.PI * v);
      return m * Math.cos(2 * Math.PI * v);
    };
  }

  function makeNormal(seed) { return normalGen(mulberry32(seed)); }

  // 1回分の試行のシード(相場番号×1000 + i)
  function trialSeed(no, i) { return no * 1000 + i; }

  // 2本目の乱数列のシード(元のシードから混ぜて作る)
  function subSeed(seed) {
    var h = Math.imul((seed >>> 0) ^ 0x85EBCA6B, 0xC2B2AE35) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  function monthlyDrift(r, sigma) {
    var sm = sigma / Math.sqrt(12);
    return { mu: Math.log(1 + r) / 12 - sm * sm / 2, sm: sm };
  }

  function cashFactor(r) { return Math.pow(1 + r, 1 / 12); }

  // ---------- 相場を作る ----------
  // 1資産の基準価額。pattern: "random" | "v" | "up" | "down"
  // 型を選んだときは σ=10% 固定、区間ごとに μm = ln(目標倍率)/月数(中央の道筋が目標を通る)
  function genPrices(opt) {
    var months = opt.months;
    var z = makeNormal(opt.seed);
    var prices = [START_PRICE];
    var p = START_PRICE;
    var pattern = opt.pattern || "random";
    var t;
    if (pattern === "random") {
      var d = monthlyDrift(opt.r, opt.sigma);
      for (t = 0; t < months; t++) {
        p = p * Math.exp(d.mu + d.sm * z()); // = p × (1 + R)
        prices.push(p);
      }
      return prices;
    }
    var sm = 0.10 / Math.sqrt(12);
    var segs;
    if (pattern === "v") {
      var half = Math.max(1, Math.floor(months / 2));
      segs = [{ len: half, mult: 0.6 }, { len: months - half, mult: 1.0 / 0.6 }];
    } else if (pattern === "up") {
      segs = [{ len: months, mult: 2.0 }];
    } else {
      segs = [{ len: months, mult: 0.6 }];
    }
    segs.forEach(function (s) {
      if (s.len <= 0) return;
      var mu = Math.log(s.mult) / s.len;
      for (var k = 0; k < s.len; k++) {
        p = p * Math.exp(mu + sm * z());
        prices.push(p);
      }
    });
    return prices;
  }

  // 株・債券・現金の3資産。株と債券は相関 ρ: z債 = ρ·z株 + √(1−ρ²)·z'
  function genMarket(opt) {
    var a = opt.assets;
    var months = opt.months;
    // 株は genPrices と同じ乱数列(同じ番号なら、ほかのタブ・ルールと同じ株価になる)。
    // 債券用の z' は別の乱数列から取る
    var z = makeNormal(opt.seed);
    var z2 = makeNormal(subSeed(opt.seed));
    var ds = monthlyDrift(a.stockR, a.stockS);
    var db = monthlyDrift(a.bondR, a.bondS);
    var cf = cashFactor(a.cashR);
    var rho = Math.max(-1, Math.min(1, a.rho));
    var rc = Math.sqrt(1 - rho * rho);
    var S = [START_PRICE], B = [START_PRICE], C = [START_PRICE];
    for (var t = 0; t < months; t++) {
      var zs = z();
      var zb = rho * zs + rc * z2();
      S.push(S[t] * Math.exp(ds.mu + ds.sm * zs));
      B.push(B[t] * Math.exp(db.mu + db.sm * zb));
      C.push(C[t] * cf);
    }
    return { stock: S, bond: B, cash: C };
  }

  // ---------- 集計 ----------
  function sortedCopy(arr) { return arr.slice().sort(function (x, y) { return x - y; }); }

  // 並べ替え済みの配列から。idx = floor(p·(n−1))
  function pick(sorted, p) { return sorted[Math.floor(p * (sorted.length - 1))]; }

  function summarize(arr) {
    var s = sortedCopy(arr);
    var sum = 0;
    for (var i = 0; i < s.length; i++) sum += s[i];
    return {
      n: s.length, mean: sum / s.length,
      p10: pick(s, 0.1), p50: pick(s, 0.5), p90: pick(s, 0.9),
      min: s[0], max: s[s.length - 1]
    };
  }

  // 最大下落率: max(1 − V_t / それまでの最高値)。V は1口あたりの価値(または流入出のない評価額)
  function maxDrawdown(series) {
    var peak = series[0], dd = 0;
    for (var i = 1; i < series.length; i++) {
      if (series[i] > peak) peak = series[i];
      else if (peak > 0) dd = Math.max(dd, 1 - series[i] / peak);
    }
    return dd;
  }

  // 最悪の1年: 12か月リターンの最小値。12か月に満たないときは期間全体のリターン
  function worstYear(series) {
    if (series.length < 13) return series[series.length - 1] / series[0] - 1;
    var w = Infinity;
    for (var t = 12; t < series.length; t++) {
      if (series[t - 12] > 0) w = Math.min(w, series[t] / series[t - 12] - 1);
    }
    return w;
  }

  // ヒストグラム。0 をビンの境目にそろえる(0 をまたぐビンを作らない)。
  // 差がちょうど 0(1円未満)の回は zeros として別に数える
  var ZERO_EPS = 0.5;
  function histogram(values, bins) {
    bins = bins || 30;
    var zeros = 0, rest = [];
    values.forEach(function (v) { if (Math.abs(v) < ZERO_EPS) zeros++; else rest.push(v); });
    var lo = Math.min(0, rest.length ? Math.min.apply(null, rest) : -1);
    var hi = Math.max(0, rest.length ? Math.max.apply(null, rest) : 1);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var w = (hi - lo) / bins;
    var kLo = Math.floor(lo / w), kHi = Math.ceil(hi / w);
    if (kHi === kLo) kHi = kLo + 1;
    lo = kLo * w; hi = kHi * w;
    var n = kHi - kLo;
    var counts = [];
    for (var b = 0; b < n; b++) counts.push(0);
    rest.forEach(function (v) {
      var k = Math.floor((v - lo) / w);
      if (k >= n) k = n - 1;
      if (k < 0) k = 0;
      counts[k]++;
    });
    return { lo: lo, hi: hi, width: w, counts: counts, zeros: zeros };
  }

  // ---------- タブ1 積立と一括 ----------
  // total: 円、months: 月数、prices: genPrices の結果
  function simDca(total, months, prices) {
    var monthly = total / months;
    var lumpUnits = total / prices[0];
    var lump = [], dca = [], pLump = [], pDca = [];
    var units = 0, cash = total, sumPrice = 0;
    for (var t = 0; t <= months; t++) {
      // 時点 t の評価(この月の買い付けの前)
      lump.push(lumpUnits * prices[t]);
      dca.push(units * prices[t] + cash);
      pLump.push(total);
      pDca.push(monthly * Math.min(t, months));
      if (t < months) {
        units += monthly / prices[t];
        cash -= monthly;
        sumPrice += prices[t];
      }
    }
    return {
      lump: lump, dca: dca, principalLump: pLump, principalDca: pDca,
      lumpPrice: prices[0],
      avgCost: total / units,          // 積立の平均取得単価
      avgPrice: sumPrice / months,     // 買った月の価格の平均
      lumpFinal: lump[months], dcaFinal: dca[months]
    };
  }

  // o: { total, months, pattern, r, sigma }, no: 相場番号
  function mcDca(o, no, n) {
    n = n || TRIALS;
    var diffs = [], lumps = [], dcas = [], lumpWins = 0, dcaWins = 0;
    for (var i = 0; i < n; i++) {
      var pr = genPrices({ months: o.months, r: o.r, sigma: o.sigma, pattern: o.pattern, seed: trialSeed(no, i) });
      var res = simDca(o.total, o.months, pr);
      var d = res.lumpFinal - res.dcaFinal;
      diffs.push(d); lumps.push(res.lumpFinal); dcas.push(res.dcaFinal);
      if (d >= ZERO_EPS) lumpWins++; else if (d <= -ZERO_EPS) dcaWins++;
    }
    return {
      n: n, lumpWins: lumpWins, dcaWins: dcaWins,
      diff: summarize(diffs), lump: summarize(lumps), dca: summarize(dcas),
      hist: histogram(diffs, 30)
    };
  }

  // ---------- タブ2 複利と長期 ----------
  // o: { initial, monthly(円), r, years, fee }
  // 毎月 残高 = (残高 + 積立) × (1+r)^(1/12) × (1−手数料)^(1/12)
  function compoundRaw(o, fee) {
    var g = cashFactor(o.r) * Math.pow(1 - fee, 1 / 12);
    var months = o.years * 12;
    var bal = o.initial;
    var principal = o.initial;
    var simpleInterest = 0; // 単利の利息の合計
    var yb = [bal], yp = [principal], ys = [principal];
    // 単利: 各回の積立額 × r × 経過年数
    for (var m = 0; m < months; m++) {
      bal = (bal + o.monthly) * g;
      principal += o.monthly;
      if ((m + 1) % 12 === 0) {
        var t = (m + 1) / 12; // 経過年数
        // 初回の金額は t 年、m' か月目の積立は (12t − m')/12 年
        simpleInterest = o.initial * o.r * t;
        var n = m + 1; // 積立回数
        // Σ_{k=0}^{n−1} (n − k)/12 = n(n+1)/24
        simpleInterest += o.monthly * o.r * (n * (n + 1) / 24);
        yb.push(bal); yp.push(principal); ys.push(principal + simpleInterest);
      }
    }
    return { balance: yb, principal: yp, simple: ys, final: bal, principalFinal: principal };
  }

  function compoundDet(o) {
    var res = compoundRaw(o, o.fee);
    var noFee = compoundRaw(o, 0);
    res.gain = res.final - res.principalFinal;
    res.feeLoss = noFee.final - res.final;
    res.taxable = afterTax(res.final, res.principalFinal);
    return res;
  }

  // 課税口座で最後に一度売ったときの手取り
  function afterTax(final, principal) {
    var tax = Math.max(0, final - principal) * TAX_RATE;
    return { net: final - tax, tax: tax };
  }

  // 値動きありの1本(1年ごとの残高)
  function compoundPath(o, seed) {
    var z = makeNormal(seed);
    var d = monthlyDrift(o.r, o.sigma);
    var f = Math.pow(1 - o.fee, 1 / 12);
    var bal = o.initial, out = [bal];
    for (var m = 0; m < o.years * 12; m++) {
      bal = (bal + o.monthly) * Math.exp(d.mu + d.sm * z()) * f;
      if ((m + 1) % 12 === 0) out.push(bal);
    }
    return out;
  }

  function mcCompound(o, no, n) {
    n = n || TRIALS;
    var Y = o.years;
    var byYear = [];
    for (var y = 0; y <= Y; y++) byYear.push([]);
    var finals = [];
    for (var i = 0; i < n; i++) {
      var path = compoundPath(o, trialSeed(no, i));
      for (y = 0; y <= Y; y++) byYear[y].push(path[y]);
      finals.push(path[Y]);
    }
    var p10 = [], p50 = [], p90 = [];
    byYear.forEach(function (arr) {
      var s = sortedCopy(arr);
      p10.push(pick(s, 0.1)); p50.push(pick(s, 0.5)); p90.push(pick(s, 0.9));
    });
    var principal = o.initial + o.monthly * Y * 12;
    var loss = finals.filter(function (v) { return v < principal; }).length;
    return { n: n, p10: p10, p50: p50, p90: p90, final: summarize(finals), lossRate: loss / n, principal: principal };
  }

  // ---------- タブ3 分散投資 ----------
  // 最初の配分のまま放置(リバランスなし)。w: { s, b, c }(合計1)
  function portfolio(w, market, initial) {
    var S = market.stock, B = market.bond, C = market.cash;
    var out = [];
    for (var t = 0; t < S.length; t++) {
      out.push(initial * (w.s * S[t] / S[0] + w.b * B[t] / B[0] + w.c * C[t] / C[0]));
    }
    return out;
  }

  function portfolioStats(series) {
    return { final: series[series.length - 1], mdd: maxDrawdown(series), worst: worstYear(series) };
  }

  // weightsList: [{s,b,c}, …]、o: { initial, months, assets }
  function mcDiversify(weightsList, o, no, n) {
    n = n || TRIALS;
    var finals = weightsList.map(function () { return []; });
    for (var i = 0; i < n; i++) {
      var mk = genMarket({ months: o.months, assets: o.assets, seed: trialSeed(no, i) });
      weightsList.forEach(function (w, k) {
        var S = mk.stock, B = mk.bond, C = mk.cash, T = o.months;
        finals[k].push(o.initial * (w.s * S[T] / S[0] + w.b * B[T] / B[0] + w.c * C[T] / C[0]));
      });
    }
    return finals.map(function (arr) {
      var sum = summarize(arr);
      sum.lossRate = arr.filter(function (v) { return v < o.initial; }).length / n;
      return sum;
    });
  }

  // ---------- タブ4 売買ルール ----------
  // rule: "hold" | "dip" | "takeprofit" | "stoploss"
  // p: { dip, tp, tpBack, sl, slBack }(すべて 0.1 = 10% の形)
  // 待つ間の現金の利息は 0%
  function simRule(prices, monthly, rule, p) {
    var N = prices.length - 1;
    var units = 0, cash = 0, cost = 0, state = "in", sellPrice = 0;
    var value = [0], principal = [0], events = [], waiting = [];
    var index = [1], idx = 1, trades = 0;
    for (var t = 0; t < N; t++) {
      var px = prices[t];
      cash += monthly;
      if (rule === "hold") {
        units += cash / px; cost += cash; cash = 0;
      } else if (rule === "dip") {
        var high = px;
        for (var k = Math.max(0, t - 12); k < t; k++) if (prices[k] > high) high = prices[k];
        if (px <= high * (1 - p.dip)) {
          units += cash / px; cost += cash; cash = 0;
          events.push({ t: t, type: "buy" }); trades++;
        }
      } else if (rule === "takeprofit" || rule === "stoploss") {
        if (state === "in") {
          var avg = units > 0 ? cost / units : 0;
          var hit = units > 0 && (rule === "takeprofit" ? px >= avg * (1 + p.tp) : px <= avg * (1 - p.sl));
          if (hit) {
            cash += units * px; units = 0; cost = 0;
            state = "out"; sellPrice = px;
            events.push({ t: t, type: "sell" }); trades++;
          } else {
            units += cash / px; cost += cash; cash = 0;
          }
        } else {
          var back = rule === "takeprofit" ? px <= sellPrice * (1 - p.tpBack) : px >= sellPrice * (1 + p.slBack);
          if (back) {
            units += cash / px; cost = cash; cash = 0;
            state = "in";
            events.push({ t: t, type: "buy" }); trades++;
          }
        }
      }
      if (cash > 0) waiting.push(t);
      var vs = units * px + cash;
      var ve = units * prices[t + 1] + cash;
      if (vs > 0) idx *= ve / vs;
      index.push(idx);
      value.push(ve);
      principal.push(monthly * (t + 1));
    }
    return {
      value: value, principal: principal, events: events, waiting: waiting,
      waitMonths: waiting.length, trades: trades, index: index,
      final: value[N], mdd: maxDrawdown(index)
    };
  }

  // リバランス: 株 ws / 債券 1−ws で積立。rebalance=true なら毎年12月末(時点 12, 24, …)に元の配分へ
  function simRebalance(market, monthly, ws, rebalance) {
    var S = market.stock, B = market.bond, N = S.length - 1;
    var us = 0, ub = 0, idx = 1;
    var value = [0], principal = [0], events = [], index = [1];
    for (var t = 0; t < N; t++) {
      us += monthly * ws / S[t];
      ub += monthly * (1 - ws) / B[t];
      var vs = us * S[t] + ub * B[t];
      var ve = us * S[t + 1] + ub * B[t + 1];
      idx *= ve / vs;
      if (rebalance && (t + 1) % 12 === 0 && t + 1 < N) {
        us = ve * ws / S[t + 1];
        ub = ve * (1 - ws) / B[t + 1];
        events.push({ t: t + 1, type: "reb" });
      }
      index.push(idx); value.push(ve); principal.push(monthly * (t + 1));
    }
    return {
      value: value, principal: principal, events: events, waiting: [],
      waitMonths: 0, trades: events.length, index: index,
      final: value[N], mdd: maxDrawdown(index)
    };
  }

  // o: { months, monthly, r, sigma, rule, params, ws, assets }
  // 戻り値: { rule, base, prices }
  function runTiming(o, seed) {
    if (o.rule === "rebalance") {
      var a = {};
      for (var k in o.assets) a[k] = o.assets[k];
      a.stockR = o.r; a.stockS = o.sigma;
      var mk = genMarket({ months: o.months, assets: a, seed: seed });
      return {
        prices: mk.stock, bond: mk.bond,
        rule: simRebalance(mk, o.monthly, o.ws, true),
        base: simRebalance(mk, o.monthly, o.ws, false)
      };
    }
    var pr = genPrices({ months: o.months, r: o.r, sigma: o.sigma, seed: seed });
    return {
      prices: pr,
      rule: simRule(pr, o.monthly, o.rule, o.params),
      base: simRule(pr, o.monthly, "hold", o.params)
    };
  }

  function mcTiming(o, no, n) {
    n = n || TRIALS;
    var diffs = [], wins = 0;
    for (var i = 0; i < n; i++) {
      var res = runTiming(o, trialSeed(no, i));
      var d = res.rule.final - res.base.final;
      diffs.push(d);
      if (d >= ZERO_EPS) wins++;
    }
    return { n: n, wins: wins, diff: summarize(diffs), hist: histogram(diffs, 30) };
  }

  return {
    START_PRICE: START_PRICE, TAX_RATE: TAX_RATE, TRIALS: TRIALS, DEFAULT_ASSETS: DEFAULT_ASSETS,
    mulberry32: mulberry32, normalGen: normalGen, makeNormal: makeNormal, trialSeed: trialSeed,
    genPrices: genPrices, genMarket: genMarket,
    summarize: summarize, pick: pick, maxDrawdown: maxDrawdown, worstYear: worstYear, histogram: histogram,
    simDca: simDca, mcDca: mcDca,
    compoundDet: compoundDet, afterTax: afterTax, compoundPath: compoundPath, mcCompound: mcCompound,
    portfolio: portfolio, portfolioStats: portfolioStats, mcDiversify: mcDiversify,
    simRule: simRule, simRebalance: simRebalance, runTiming: runTiming, mcTiming: mcTiming
  };
})();

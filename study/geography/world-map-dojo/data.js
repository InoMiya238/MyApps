// 世界地図道場: 州(単元)・出題の種類・成績と設定の保存・問題づくり。
// 読み込む順番: shared/store.js →(shared/review.js)→ map.js → countries.js → data.js → mapview.js
//
// ■ 復習プランナーとの連携
//   単元は6州。ID(asia europe africa north-america south-america oceania)は保存データのキーなので変えない。
//   WMAP.UNITS / WMAP.unit(id) / WMAP.loadStats()(byUnit[id].total・correct)をプランナーが読む。
//
// ■ 保存データ
//   worldMapDojoStats:    { byUnit: { 州ID: { total, correct } }, byCountry: { 国キー: { total, correct } }, bestStreak }
//   worldMapDojoSettings: { units: [州ID…], types: [種類ID…], count: 5|10|20 }
//
// ■ 問題の形(buildQuiz が返す配列の1つ)
//   { key: 国キー, unitId: 州ID, type: 種類ID,
//     choices: [{ key, label }] ×4(map-tap は空の配列), answer: 正解の番号(map-tap は -1) }
//   choices の label は、種類によって国名か首都。国旗の問題(name-flag)は key から国旗を出す。
var WMAP = (function () {
  "use strict";

  var STATS_KEY = "worldMapDojoStats";
  var SETTINGS_KEY = "worldMapDojoSettings";
  var COUNTS = [5, 10, 20];

  var UNITS = [
    { id: "asia", name: "アジア州", short: "アジア" },
    { id: "europe", name: "ヨーロッパ州", short: "ヨーロッパ" },
    { id: "africa", name: "アフリカ州", short: "アフリカ" },
    { id: "north-america", name: "北アメリカ州", short: "北アメリカ" },
    { id: "south-america", name: "南アメリカ州", short: "南アメリカ" },
    { id: "oceania", name: "オセアニア州", short: "オセアニア" }
  ];

  // 出題の種類。no は設定画面の①〜⑥
  var TYPES = [
    { id: "map-name", no: "①", name: "地図 → 国名", desc: "地図で色のついた国の名前を4択で答える" },
    { id: "map-tap", no: "②", name: "国名 → 地図", desc: "国名を見て、地図の上でその国をタップする" },
    { id: "flag-name", no: "③", name: "国旗 → 国名", desc: "国旗を見て、国名を4択で答える" },
    { id: "name-flag", no: "④", name: "国名 → 国旗", desc: "国名を見て、国旗を4択で答える" },
    { id: "name-capital", no: "⑤", name: "国名 → 首都", desc: "国名を見て、首都を4択で答える" },
    { id: "capital-name", no: "⑥", name: "首都 → 国名", desc: "首都を見て、国名を4択で答える" }
  ];

  // ほとんど同じ見た目の国旗。同じ問題の選択肢にいっしょに出さない
  var LOOKALIKE_FLAGS = [["td", "ro"], ["id", "mc"], ["lu", "nl"], ["qa", "bh"]];

  var unitById = {}, typeById = {};
  UNITS.forEach(function (u) { unitById[u.id] = u; });
  TYPES.forEach(function (t) { typeById[t.id] = t; });

  function unit(id) { return unitById.hasOwnProperty(id) ? unitById[id] : null; }
  function type(id) { return typeById.hasOwnProperty(id) ? typeById[id] : null; }

  // 小さな国が多い地域を拡大するボタン。範囲は経度・緯度で持ち、map.js の project で地図の座標にする
  // (map.js の subregions には頼らない)。lon は西経をマイナス、日付変更線の東は +360 して書く
  var ZOOMS = [
    { id: "persian-gulf", unit: "asia", label: "ペルシア湾", lon: [45, 59], lat: [22, 31] },
    { id: "levant", unit: "asia", label: "地中海東岸", lon: [31, 39], lat: [29, 37] },
    { id: "southeast-asia", unit: "asia", label: "東南アジア", lon: [95, 128], lat: [-11, 8] },
    { id: "europe-west", unit: "europe", label: "西ヨーロッパ", lon: [-2, 16], lat: [41, 53] },
    { id: "balkans", unit: "europe", label: "バルカン半島", lon: [13, 24], lat: [39, 47] },
    { id: "gulf-of-guinea", unit: "africa", label: "ギニア湾", lon: [4, 12], lat: [-3, 5] },
    { id: "great-lakes", unit: "africa", label: "ルワンダ・ブルンジ", lon: [26, 34], lat: [-6, 1] },
    { id: "indian-ocean", unit: "africa", label: "インド洋の島々", lon: [41, 60], lat: [-22, -3] },
    { id: "central-america", unit: "north-america", label: "中央アメリカ", lon: [-93, -77], lat: [7, 18] },
    { id: "caribbean", unit: "north-america", label: "カリブ海", lon: [-86, -60], lat: [10, 27] },
    { id: "lesser-antilles", unit: "north-america", label: "小アンティル諸島", lon: [-64, -58], lat: [10, 18.5] },
    { id: "micronesia", unit: "oceania", label: "ミクロネシア", lon: [130, 176], lat: [-2, 14] },
    { id: "south-pacific", unit: "oceania", label: "南太平洋", lon: [155, 205], lat: [-24, -2] }
  ];
  // 経度・緯度の範囲 → 地図の [x, y, w, h]
  function zoomRect(z) {
    var G = typeof WMAP_GEO !== "undefined" ? WMAP_GEO : null;
    if (!G || typeof G.project !== "function") return null;
    var xs = [], ys = [];
    [z.lon[0], (z.lon[0] + z.lon[1]) / 2, z.lon[1]].forEach(function (lo) {
      [z.lat[0], 0, z.lat[1]].forEach(function (la) {
        if (la !== 0 || (z.lat[0] < 0 && z.lat[1] > 0)) { var p = G.project(lo, la); xs.push(p[0]); ys.push(p[1]); }
      });
    });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    return [x0, y0, x1 - x0, y1 - y0];
  }
  // 州の拡大ボタン: [{ id, label, rect }]
  function zoomsOf(unitId) {
    return ZOOMS.filter(function (z) { return z.unit === unitId; }).map(function (z) {
      return { id: z.id, label: z.label + "を拡大", rect: zoomRect(z) };
    }).filter(function (z) { return z.rect; });
  }

  // ---------- 国 ----------
  var GEO = typeof WMAP_GEO !== "undefined" ? WMAP_GEO : { countries: {} };
  var SRC = typeof WMAP_COUNTRIES !== "undefined" ? WMAP_COUNTRIES : [];
  function kanaCompare(a, b) { return a.kana < b.kana ? -1 : a.kana > b.kana ? 1 : 0; }
  // 州が正しく、地図にのっている国だけを使う
  var COUNTRIES = SRC.filter(function (c) {
    return c && typeof c.key === "string" && unit(c.region) && GEO.countries && GEO.countries[c.key];
  }).slice().sort(function (a, b) {
    var ra = UNITS.indexOf(unit(a.region)), rb = UNITS.indexOf(unit(b.region));
    return ra - rb || kanaCompare(a, b);
  });
  var countryByKey = {};
  COUNTRIES.forEach(function (c) { countryByKey[c.key] = c; });

  function country(key) { return countryByKey.hasOwnProperty(key) ? countryByKey[key] : null; }
  // 州の国(五十音順)
  function countriesOf(regionId) { return COUNTRIES.filter(function (c) { return c.region === regionId; }); }
  function flagSrc(key) { return "flags/" + key + ".svg"; }
  function hasCapitalQuiz(c) { return c.capitalQuiz !== false; }
  // その種類の問題に出せる国か
  function typeOk(typeId, c) {
    if (typeId === "name-capital" || typeId === "capital-name") return hasCapitalQuiz(c);
    return true;
  }

  // 検索用: カタカナをひらがなにし、空白と「・」を除く
  function normalize(s) {
    return String(s || "").replace(/[ァ-ヶ]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0x60);
    }).replace(/[\s・=＝]/g, "").toLowerCase();
  }
  function search(query) {
    var q = normalize(query);
    if (!q) return [];
    return COUNTRIES.filter(function (c) {
      return [c.name, c.kana, c.official, c.capital, c.capitalKana].some(function (f) { return normalize(f).indexOf(q) >= 0; });
    });
  }

  // ---------- 保存データ(形がくずれていても動くように、数字だけを拾い直す) ----------
  function cleanNum(v) { return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function emptyStats() { return { byUnit: {}, byCountry: {}, bestStreak: 0 }; }
  function cleanRec(r) {
    if (!r || typeof r !== "object") return null;
    var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total);
    return total > 0 ? { total: total, correct: correct } : null;
  }
  function loadStats() {
    var raw = Store.load(STATS_KEY, null);
    var s = emptyStats();
    if (!raw || typeof raw !== "object") return s;
    s.bestStreak = cleanNum(raw.bestStreak);
    if (raw.byUnit && typeof raw.byUnit === "object") {
      UNITS.forEach(function (u) { var r = cleanRec(raw.byUnit[u.id]); if (r) s.byUnit[u.id] = r; });
    }
    if (raw.byCountry && typeof raw.byCountry === "object") {
      COUNTRIES.forEach(function (c) { var r = cleanRec(raw.byCountry[c.key]); if (r) s.byCountry[c.key] = r; });
    }
    return s;
  }
  function saveStats(stats) { return Store.save(STATS_KEY, stats); }
  function clearStats() { return Store.remove(STATS_KEY); }
  // 回答を1つ成績に足す(保存もする)
  function addAnswer(stats, q, isCorrect, streak) {
    [["byUnit", q.unitId], ["byCountry", q.key]].forEach(function (p) {
      var box = stats[p[0]];
      if (!box[p[1]]) box[p[1]] = { total: 0, correct: 0 };
      box[p[1]].total++;
      if (isCorrect) box[p[1]].correct++;
    });
    if (streak > stats.bestStreak) stats.bestStreak = streak;
    return saveStats(stats);
  }

  // 設定。保存がなければ null を返す(初期値はページが決める)
  function loadSettings() {
    var raw = Store.load(SETTINGS_KEY, null);
    if (!raw || typeof raw !== "object") return null;
    var s = { units: [], types: [], count: 10 };
    if (Array.isArray(raw.units)) s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    if (Array.isArray(raw.types)) s.types = TYPES.filter(function (t) { return raw.types.indexOf(t.id) >= 0; }).map(function (t) { return t.id; });
    if (COUNTS.indexOf(Number(raw.count)) >= 0) s.count = Number(raw.count);
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }

  // 苦手な州: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }
  // 苦手な国: 間違えた回数の多い順(同じなら正答率の低い順)
  function missedCountries(stats) {
    var list = [];
    COUNTRIES.forEach(function (c) {
      var r = stats.byCountry[c.key];
      if (r && r.total > r.correct) list.push({ country: c, wrong: r.total - r.correct, rec: r });
    });
    list.sort(function (a, b) {
      return b.wrong - a.wrong || a.rec.correct / a.rec.total - b.rec.correct / b.rec.total || kanaCompare(a.country, b.country);
    });
    return list;
  }

  // ---------- 問題を作る ----------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // 重みつきで1つ選ぶ
  function weightedPick(items, weightOf) {
    var sum = 0, ws = items.map(function (it) { var w = weightOf(it); sum += w; return w; });
    var r = Math.random() * sum;
    for (var i = 0; i < items.length; i++) { r -= ws[i]; if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  function lookalike(a, b) {
    return LOOKALIKE_FLAGS.some(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); });
  }
  // 選択肢の文字(国名か首都)
  function labelOf(typeId, c) { return typeId === "name-capital" ? c.capital : c.name; }

  // 誤答の選択肢を3つ選ぶ。なるべく同じ州から。文字が正解や他の選択肢と重なるものは使わない
  function distractors(typeId, target) {
    var flagType = typeId === "flag-name" || typeId === "name-flag";
    function usable(c) {
      if (c.key === target.key) return false;
      // 首都の問題(⑤⑥)は、誤答の選択肢にも首都の扱いに注意が必要な国を出さない
      if ((typeId === "name-capital" || typeId === "capital-name") && !hasCapitalQuiz(c)) return false;
      if (flagType && lookalike(c.key, target.key)) return false;
      return true;
    }
    var picked = [], labels = {};
    labels[labelOf(typeId, target)] = true;
    function take(pool) {
      shuffle(pool).forEach(function (c) {
        if (picked.length >= 3) return;
        var l = labelOf(typeId, c);
        if (labels[l]) return;
        if (flagType && picked.some(function (p) { return lookalike(p.key, c.key); })) return;
        labels[l] = true;
        picked.push(c);
      });
    }
    take(COUNTRIES.filter(function (c) { return c.region === target.region && usable(c); }));
    if (picked.length < 3) take(COUNTRIES.filter(function (c) { return c.region !== target.region && usable(c); }));
    return picked;
  }

  function makeQuestion(c, typeId) {
    var q = { key: c.key, unitId: c.region, type: typeId, choices: [], answer: -1 };
    if (typeId === "map-tap") return q;
    var list = shuffle([c].concat(distractors(typeId, c)));
    q.choices = list.map(function (x) { return { key: x.key, label: labelOf(typeId, x) }; });
    q.answer = list.indexOf(c);
    return q;
  }

  // 同じ国が2問続かないように並べ替える(配列をその場で変える)。
  // 続いている所があれば、入れ替えても前後に同じ国が並ばない位置を全体から探して入れ替える
  function noRepeat(out) {
    function key(i) { return i >= 0 && i < out.length ? out[i].key : null; }
    function okAt(i, k, skip) {
      // 位置 i に国 k を置いたとき、両隣(skip の位置は入れ替え後の値で考える)と同じにならないか
      return [i - 1, i + 1].every(function (n) { return (n === skip.pos ? skip.key : key(n)) !== k; });
    }
    for (var pass = 0; pass < 3; pass++) {
      var changed = false;
      for (var i = 1; i < out.length; i++) {
        if (out[i].key !== out[i - 1].key) continue;
        for (var j = 0; j < out.length; j++) {
          if (j === i || out[j].key === out[i].key) continue;
          if (okAt(j, out[i].key, { pos: i, key: out[j].key }) && okAt(i, out[j].key, { pos: j, key: out[i].key })) {
            var t = out[i]; out[i] = out[j]; out[j] = t; changed = true; break;
          }
        }
      }
      if (!changed) break;
    }
    return out;
  }

  // 回数を均等にした並び(例: 3種類で10問 → 4,3,3 回をまぜる)
  function evenSeq(ids, n) {
    var seq = [], order = shuffle(ids);
    for (var i = 0; i < n; i++) seq.push(order[i % order.length]);
    return shuffle(seq);
  }

  // クイズ1回分。opts: { units: [州ID], types: [種類ID], count, keys: [国キー](省略可。その国だけから出す) }
  // 州と種類はできるだけ均等に割り振る。同じ国はなるべく1回だけ。間違えたことのある国は少し出やすい
  function buildQuiz(opts, stats) {
    var types = (opts.types || []).filter(type);
    var keys = Array.isArray(opts.keys) ? opts.keys.filter(country) : null;
    var units = keys ? [] : (opts.units || []).filter(unit);
    var count = Number(opts.count) || 10;
    if (types.length === 0 || (!keys && units.length === 0) || (keys && keys.length === 0)) return [];
    var byCountry = stats && stats.byCountry ? stats.byCountry : {};
    function weight(c) {
      var r = byCountry[c.key];
      return 1 + (r ? Math.min(r.total - r.correct, 3) : 0);
    }
    var pool = keys ? keys.map(country) : COUNTRIES.filter(function (c) { return units.indexOf(c.region) >= 0; });
    // 国を指定したとき(間違えた国の練習): 選んだ種類で出せる国だけを、回数を均等にして順に回す。
    // 国が2つ以上あれば、同じ国が続かない
    if (keys) {
      var list = shuffle(pool.filter(function (c) { return types.some(function (t) { return typeOk(t, c); }); }));
      if (list.length === 0) return [];
      var tSeq = evenSeq(types, count), pairs = {}, typeCount = {}, res = [];
      for (var n = 0; n < count; n++) {
        var cc = list[n % list.length];
        var valid = types.filter(function (t) { return typeOk(t, cc); });
        var unusedT = valid.filter(function (t) { return !pairs[cc.key + "|" + t]; });
        // tSeq の種類が使えないときは、まだ出ていない組み合わせのうち、ここまでの回数がいちばん少ない種類にする
        var cand = unusedT.length ? unusedT : valid;
        var tt = valid.indexOf(tSeq[n]) >= 0 && !pairs[cc.key + "|" + tSeq[n]] ? tSeq[n]
          : shuffle(cand).sort(function (x, y) { return (typeCount[x] || 0) - (typeCount[y] || 0); })[0];
        pairs[cc.key + "|" + tt] = true;
        typeCount[tt] = (typeCount[tt] || 0) + 1;
        res.push(makeQuestion(cc, tt));
      }
      return res;
    }
    var typeSeq = evenSeq(types, count);
    var unitSeq = keys ? null : evenSeq(units, count);
    var usedCountry = {}, usedPair = {}, out = [];
    for (var i = 0; i < count; i++) {
      var tId = typeSeq[i];
      var cand = pool.filter(function (c) { return (!unitSeq || c.region === unitSeq[i]) && typeOk(tId, c); });
      // 州がしばりきれないときは、選んだ州全体から
      if (cand.length === 0) cand = pool.filter(function (c) { return typeOk(tId, c); });
      // この種類で出せる国がないときは、ほかの種類にする
      if (cand.length === 0) {
        tId = types.filter(function (t) { return pool.some(function (c) { return typeOk(t, c); }); })[0];
        if (!tId) break;
        cand = pool.filter(function (c) { return typeOk(tId, c); });
      }
      var fresh = cand.filter(function (c) { return !usedCountry[c.key]; });
      if (fresh.length === 0) fresh = cand.filter(function (c) { return !usedPair[c.key + "|" + tId]; });
      if (fresh.length === 0) fresh = cand;
      var c = weightedPick(fresh, weight);
      usedCountry[c.key] = true;
      usedPair[c.key + "|" + tId] = true;
      out.push(makeQuestion(c, tId));
    }
    noRepeat(out);
    return out;
  }

  // 問題が正しい形か(検証用)。問題点の一覧を返す
  function checkQuestion(q) {
    var errs = [], c = country(q.key);
    if (!c) return ["国がない: " + q.key];
    if (!type(q.type)) errs.push("種類がない");
    if (q.unitId !== c.region) errs.push("州が違う");
    if (!typeOk(q.type, c)) errs.push("この国は " + q.type + " に出さない");
    if (q.type === "map-tap") return errs;
    if (q.choices.length !== 4) errs.push("選択肢が4つではない");
    var seen = {};
    q.choices.forEach(function (ch) {
      if (seen[ch.label]) errs.push("選択肢が重なる: " + ch.label);
      seen[ch.label] = true;
      if ((q.type === "name-capital" || q.type === "capital-name") && !hasCapitalQuiz(country(ch.key))) errs.push("首都の問題に出さない国が選択肢にある: " + ch.label);
      if ((q.type === "flag-name" || q.type === "name-flag") && ch.key !== c.key && lookalike(ch.key, c.key)) errs.push("似た国旗: " + ch.key);
    });
    if (!q.choices[q.answer] || q.choices[q.answer].key !== c.key) errs.push("正解の番号が違う");
    var same = q.choices.filter(function (ch) { return ch.key === c.key; }).length;
    if (same !== 1) errs.push("正解が1つではない");
    return errs;
  }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNTS: COUNTS,
    UNITS: UNITS, TYPES: TYPES, COUNTRIES: COUNTRIES, ZOOMS: ZOOMS, zoomsOf: zoomsOf,
    unit: unit, type: type, country: country, countriesOf: countriesOf, flagSrc: flagSrc,
    hasCapitalQuiz: hasCapitalQuiz, typeOk: typeOk, normalize: normalize, search: search,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats, addAnswer: addAnswer,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak, missedCountries: missedCountries,
    shuffle: shuffle, noRepeat: noRepeat, makeQuestion: makeQuestion, buildQuiz: buildQuiz, checkQuestion: checkQuestion
  };
})();

// 中学英単語帳: 学年・カテゴリー(単元)・品詞の定義と、単語ファイル(vocab-1.js など)が単語を登録するための入れ物。
// 復習プランナーもこのファイルだけを読む(UNITS、unit、grade、loadStats を使う)。
// 読み込む順番: shared/store.js → shared/review.js → vocab.js → vocab-1.js → vocab-2.js → vocab-3.js
//   vocab-1.js  動詞、代名詞・前置詞など
//   vocab-2.js  形容詞、副詞、人・家族、体・健康、時・季節・数
//   vocab-3.js  学校・学習、食べ物、家・身の回り、町・乗り物、自然・動物、趣味・文化、社会・世界
//
// ■ 単語の登録(単語ファイルに書く)
//   JHV.add([
//     { en: "apple", ja: "りんご", pos: "名", cat: "food", grade: "g1",
//       ex: ["I eat an apple every morning.", "わたしは毎朝りんごを食べます。"] },
//     { en: "go", ja: "行く", pos: "動", cat: "verbs", grade: "g1", forms: "went - gone",
//       ex: ["I go to school by bus.", "わたしはバスで学校へ行きます。"] },
//     …
//   ]);
//
// ■ 単語の形
//   en     必須。英単語1語(つづりがそのまま ID になるので、あとから変えない)。固有名詞と I 以外は小文字
//   ja     必須。意味。複数のときは「、」で区切り、主な意味を先に書く(3つまで)
//   pos    必須。品詞(下の POS のキー)
//   cat    必須。カテゴリー(下の CATEGORIES の id)
//   grade  必須。学年の目安("g1" "g2" "g3")。教科書によって学年は前後する
//   ex     必須。[英文, 日本語訳]。英文に en の語(または変化形)をふくめる
//   forms  省略可。不規則な変化(動詞は "過去形 - 過去分詞"、形容詞・副詞は "比較級 - 最上級"、名詞は不規則な複数形)
var JHV = (function () {
  "use strict";

  var GRADES = [
    { id: "g1", short: "中1", name: "中学1年" },
    { id: "g2", short: "中2", name: "中学2年" },
    { id: "g3", short: "中3", name: "中学3年" }
  ];

  // 品詞。キーは単語データに書く1字、name は画面の表示
  var POS = {
    "名": "名詞", "動": "動詞", "形": "形容詞", "副": "副詞", "代": "代名詞",
    "前": "前置詞", "接": "接続詞", "助": "助動詞", "冠": "冠詞", "間": "間投詞", "数": "数詞"
  };

  // カテゴリー。学年 × カテゴリーが1つの単元になる(復習プランナーの単位)。
  // area は大きなまとまり(プランナーと絞り込みの見出し)。id は保存データのキーなので変えない
  var CATEGORIES = [
    { id: "verbs", area: "動詞", name: "動詞" },
    { id: "adjectives", area: "形容詞・副詞", name: "形容詞" },
    { id: "adverbs", area: "形容詞・副詞", name: "副詞" },
    { id: "function", area: "機能語", name: "代名詞・前置詞など" },
    { id: "people", area: "名詞", name: "人・家族" },
    { id: "body", area: "名詞", name: "体・健康" },
    { id: "time", area: "名詞", name: "時・季節・数" },
    { id: "school", area: "名詞", name: "学校・学習" },
    { id: "food", area: "名詞", name: "食べ物" },
    { id: "home", area: "名詞", name: "家・身の回り" },
    { id: "town", area: "名詞", name: "町・乗り物" },
    { id: "nature", area: "名詞", name: "自然・動物" },
    { id: "hobby", area: "名詞", name: "趣味・文化" },
    { id: "society", area: "名詞", name: "社会・世界" }
  ];
  var AREAS = ["動詞", "形容詞・副詞", "機能語", "名詞"];

  // 単元: ID は "g1-food" の形(保存データと復習プランナーのキーなので変えない)
  var UNITS = [];
  var unitById = {}, catById = {}, gradeById = {};
  GRADES.forEach(function (g) {
    gradeById[g.id] = g;
    CATEGORIES.forEach(function (c) {
      var u = { id: g.id + "-" + c.id, grade: g.id, cat: c.id, area: c.area, name: c.name };
      UNITS.push(u);
      unitById[u.id] = u;
    });
  });
  CATEGORIES.forEach(function (c) { catById[c.id] = c; });

  var words = [];
  var wordById = {};
  var problems = [];   // 登録できなかった単語(開発時の確認用)

  function unit(id) { return unitById.hasOwnProperty(id) ? unitById[id] : null; }
  function grade(id) { return gradeById.hasOwnProperty(id) ? gradeById[id] : null; }
  function category(id) { return catById.hasOwnProperty(id) ? catById[id] : null; }
  function unitIdOf(w) { return w.grade + "-" + w.cat; }

  // 単語の形を調べ、問題の一覧を返す(空なら正しい)
  function checkWord(w) {
    var errs = [];
    if (!w || typeof w !== "object") return ["単語がオブジェクトではない"];
    if (typeof w.en !== "string" || !/^[A-Za-z][A-Za-z'.-]*$/.test(w.en)) errs.push("en が英単語1語ではない");
    if (typeof w.ja !== "string" || !w.ja) errs.push("ja がない");
    else if (w.ja.split("、").length > 3) errs.push("ja の意味が4つ以上");
    if (!POS.hasOwnProperty(w.pos)) errs.push("pos が不正");
    if (!category(w.cat)) errs.push("cat が不正");
    if (!grade(w.grade)) errs.push("grade が不正");
    if (!Array.isArray(w.ex) || w.ex.length !== 2 || typeof w.ex[0] !== "string" || typeof w.ex[1] !== "string" || !w.ex[0] || !w.ex[1]) {
      errs.push("ex が [英文, 訳] ではない");
    }
    if (w.forms !== undefined && (typeof w.forms !== "string" || !w.forms)) errs.push("forms が文字列ではない");
    return errs;
  }

  function add(list) {
    (list || []).forEach(function (w) {
      var errs = checkWord(w);
      if (!errs.length && wordById.hasOwnProperty(w.en)) errs.push("en が重複: " + w.en);
      if (errs.length) { problems.push({ en: w && w.en, errs: errs }); return; }
      words.push(w);
      wordById[w.en] = w;
    });
  }

  function allWords() { return words.slice(); }
  function word(en) { return wordById.hasOwnProperty(en) ? wordById[en] : null; }
  function wordsOf(unitId) { return words.filter(function (w) { return unitIdOf(w) === unitId; }); }
  function isReady(unitId) { return wordsOf(unitId).length > 0; }

  // ---------- 保存データ(形がくずれていても動くように、使える値だけを拾い直す) ----------
  // loadStats() は復習プランナーも使う: loadStats() → { byUnit: { "g1-food": { total, correct } } }
  var SETTINGS_KEY = "juniorHighEnglishVocabSettings";
  var WORDS_KEY = "juniorHighEnglishVocabWords";
  var STATS_KEY = "juniorHighEnglishVocabStats";
  var EN_RE = /^[A-Za-z][A-Za-z'.-]*$/;

  function cleanNum(v) { return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function isObj(v) { return !!v && typeof v === "object" && !Array.isArray(v); }

  // 単元ごとの正誤
  function emptyStats() { return { byUnit: {} }; }
  function loadStats() {
    var raw = Store.load(STATS_KEY, null);
    var s = emptyStats();
    if (!isObj(raw) || !isObj(raw.byUnit)) return s;
    UNITS.forEach(function (u) {
      var r = raw.byUnit[u.id];
      if (!isObj(r)) return;
      var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total);
      if (total > 0) s.byUnit[u.id] = { total: total, correct: correct };
    });
    return s;
  }
  function saveStats(stats) { return Store.save(STATS_KEY, stats); }
  function clearStats() { return Store.remove(STATS_KEY); }

  // 単語ごとの記録 { "apple": { m: "known"|"weak", c: 正答数, n: 回答数, st: 連続正解 } }(m がなければ未設定)。
  // いまのデータにない語の記録も消さずに残す(単語ファイルが読めなかったときに、記録を失わないように)
  function cleanRecord(r) {
    if (!isObj(r)) return null;
    var n = cleanNum(r.n);
    var o = { c: Math.min(cleanNum(r.c), n), n: n, st: cleanNum(r.st) };
    if (r.m === "known" || r.m === "weak") o.m = r.m;
    if (!o.m && n === 0) return null;
    return o;
  }
  function loadWordRecords() {
    var raw = Store.load(WORDS_KEY, null);
    var out = Object.create(null);
    if (!isObj(raw)) return out;
    Object.keys(raw).forEach(function (k) {
      if (!EN_RE.test(k)) return;
      var r = cleanRecord(raw[k]);
      if (r) out[k] = r;
    });
    return out;
  }
  function saveWordRecords(records) { return Store.save(WORDS_KEY, records); }
  function clearWordRecords() { return Store.remove(WORDS_KEY); }

  // 設定。保存がなければ null を返す(はじめて開いたとき)。くずれた値は初期値に戻す
  var FILTERS = ["all", "notKnown", "weak", "new"];
  var MODES = ["card", "choice", "spell"];
  var DIRS = ["ej", "je"];
  var COUNTS = [10, 20, 50, 0];   // 0 は全部
  var ORDERS = ["random", "weak", "list"];
  var TABS = ["practice", "list", "record"];
  var HIDES = ["none", "en", "ja"];
  function defaultSettings() {
    return {
      grades: ["g1"],
      cats: CATEGORIES.map(function (c) { return c.id; }),
      pos: Object.keys(POS),
      filter: "notKnown", mode: "card", dir: "ej", count: 20,
      order: "random", example: true, autoSpeak: false,
      tab: "practice", hide: "none"
    };
  }
  function pickList(raw, all) {
    if (!Array.isArray(raw)) return null;
    var list = all.filter(function (id) { return raw.indexOf(id) >= 0; });
    return list.length ? list : null;
  }
  function pickOne(v, all, fallback) { return all.indexOf(v) >= 0 ? v : fallback; }
  function loadSettings() {
    var raw = Store.load(SETTINGS_KEY, null);
    if (!isObj(raw)) return null;
    var s = defaultSettings();
    s.grades = pickList(raw.grades, GRADES.map(function (g) { return g.id; })) || s.grades;
    s.cats = pickList(raw.cats, s.cats) || s.cats;
    s.pos = pickList(raw.pos, s.pos) || s.pos;
    s.filter = pickOne(raw.filter, FILTERS, s.filter);
    s.mode = pickOne(raw.mode, MODES, s.mode);
    s.dir = pickOne(raw.dir, DIRS, s.dir);
    s.count = pickOne(raw.count, COUNTS, s.count);
    s.order = pickOne(raw.order, ORDERS, s.order);
    if (typeof raw.example === "boolean") s.example = raw.example;
    if (typeof raw.autoSpeak === "boolean") s.autoSpeak = raw.autoSpeak;
    s.tab = pickOne(raw.tab, TABS, s.tab);
    s.hide = pickOne(raw.hide, HIDES, s.hide);
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }
  function clearSettings() { return Store.remove(SETTINGS_KEY); }

  return {
    GRADES: GRADES, POS: POS, CATEGORIES: CATEGORIES, AREAS: AREAS, UNITS: UNITS,
    unit: unit, grade: grade, category: category, unitIdOf: unitIdOf,
    checkWord: checkWord, add: add, allWords: allWords, word: word, wordsOf: wordsOf, isReady: isReady,
    problems: problems,
    FILTERS: FILTERS, MODES: MODES, DIRS: DIRS, COUNTS: COUNTS, ORDERS: ORDERS, TABS: TABS, HIDES: HIDES,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadWordRecords: loadWordRecords, saveWordRecords: saveWordRecords, clearWordRecords: clearWordRecords,
    defaultSettings: defaultSettings, loadSettings: loadSettings, saveSettings: saveSettings, clearSettings: clearSettings
  };
})();

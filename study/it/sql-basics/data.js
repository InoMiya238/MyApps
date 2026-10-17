// SQL道場: 題材の表・8単元の定義・問題・構文帳の中身。道場(index.html)と構文帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → data.js
// 文法は標準SQL(SQLite・MySQL・PostgreSQL で共通に動く書き方)を前提とする。
//
// ■ 題材の表(このファイルの前半の TABLES)
//   { name: "books", ddl: "CREATE TABLE …", cols: ["id", …], rows: [[1, "星の旅", …], …] }
//   null は NULL として表示する。問題・構文帳・検算スクリプトは、すべてここを使う。
//
// ■ 単元の中身の登録(このファイルの後半)
//   SQLD.register("単元ID", { cards: [カード, …], questions: [問題, …] });
//
// ■ 構文帳のカード
//   {
//     id: "where",                    // reference.html の id="card-where" になる。問題の ref からも使う
//     name: "WHERE",                  // カードの見出し(等幅)
//     read: "条件でしぼる",             // 短い説明(.tag)
//     desc: "意味の説明",              // `…` で囲んだところは <code> になる
//     examples: [["SQL", "説明"], …],  // 「例」。-- 説明 の行と SQL の行で出る
//     options: [["書き方", "説明"], …], // 省略可。「書き方」
//     notes: ["注意", …]               // 省略可。「注意・DBによる違い」
//   }
//
// ■ 問題
//   {
//     id: "s01",                      // 単元の中で重ならない名前
//     q: "問題文",                     // `…` で囲んだところは <code> になる
//     sql: "SELECT …;",               // 省略可。問題の SQL(コード表示)。____ は空欄。";\n" で文を分けてよい
//     result: "列 | 列\n値 | 値",       // 省略可。「求める結果」として表で出す(1行目が見出し、| で列を分ける)
//     tables: ["books"],              // この問題で使う表(画面に小さな表で出す)
//     kind: "result",                 // 選択肢の種類。"result" = 結果の表 / "sql" = SQL文 / "code" = 語句(等幅) / "text" = 説明文
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。並びはページが毎回まぜる
//     accepts: ["別解", …],            // 穴埋め入力で正解にする別の書き方(先頭の選択肢は書かなくてよい)
//     acceptPatterns: ["^…$", …],      // 省略可。正規化したあとの入力に当てる正規表現(数を自由にしたいときなど)
//     noInput: true,                  // 省略可。穴埋めの形でも入力モードで出さない
//     expect: "列\n値",                // 省略可。画面には出さない。検算用(空欄に正解を入れたときの結果)
//     explain: "解説",                 // `…` で囲んだところは <code> になる
//     ref: "where"                    // 構文帳のカードの id
//   }
//   穴埋め入力モードで出すのは、sql に ____ があり、kind が "code" で、noInput がない問題だけ。
//   結果の表で行の順番に意味があるのは、SQL に ORDER BY があるときだけ。
//
// ■ 入力の判定(normalize)
//   大文字小文字を区別しない。前後の空白を削り、連続する空白を1つにまとめる。
//   全角の英数字・記号は半角に、‘ ’ は ' に、“ ” は " にそろえる。
//   ( ) , = < > ! * の前後の空白は取る。ただし < > ! = どうしの間の空白は残す(「< >」は「<>」と別もの)。
var SQLD = (function () {
  "use strict";

  var STATS_KEY = "sqlBasicsStats";
  var SETTINGS_KEY = "sqlBasicsSettings";
  var COUNT = 10;
  var MODES = ["choice", "input"];
  var BLANK = "____";

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "select", no: "01", name: "SELECTの基本", short: "SELECT", keys: "SELECT · * · AS · DISTINCT · ;" },
    { id: "where", no: "02", name: "条件でしぼる", short: "WHERE", keys: "WHERE · <> · AND · IN · BETWEEN · LIKE" },
    { id: "order", no: "03", name: "並べ替えと件数", short: "並べ替え", keys: "ORDER BY · ASC · DESC · LIMIT · OFFSET" },
    { id: "aggregate", no: "04", name: "集計関数", short: "集計", keys: "COUNT · SUM · AVG · MAX · MIN" },
    { id: "group", no: "05", name: "グループ化", short: "グループ化", keys: "GROUP BY · グループごとの集計" },
    { id: "join", no: "06", name: "表の結合", short: "結合", keys: "INNER JOIN · LEFT JOIN · ON · 別名" },
    { id: "modify", no: "07", name: "データの変更", short: "変更", keys: "INSERT · UPDATE · DELETE" },
    { id: "null-table", no: "08", name: "NULLとテーブル作成", short: "NULL・表", keys: "IS NULL · CREATE TABLE · PRIMARY KEY" }
  ];

  // ---------- 題材のデータベース「本屋」 ----------
  // 表を変えたら、結果を答える問題をすべて検算し直す
  var TABLES = [
    {
      name: "authors", label: "著者",
      ddl: "CREATE TABLE authors (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  country TEXT\n);",
      cols: ["id", "name", "country"],
      rows: [
        [1, "青木", "日本"],
        [2, "Brown", "イギリス"],
        [3, "佐藤", "日本"],
        [4, "Smith", "イギリス"],
        [5, "Miller", "アメリカ"],
        [6, "中村", "日本"]
      ]
    },
    {
      name: "books", label: "本",
      ddl: "CREATE TABLE books (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  author_id INTEGER,\n  price INTEGER,\n  year INTEGER\n);",
      cols: ["id", "title", "author_id", "price", "year"],
      rows: [
        [1, "星の旅", 1, 1200, 2015],
        [2, "海の歌", 2, 800, 2018],
        [3, "森の朝", 1, 1500, 2020],
        [4, "夜の街", 3, 900, 2012],
        [5, "風と石", 4, 2200, 2021],
        [6, "星の庭", 3, null, 2019],
        [7, "古い地図", null, 600, 2010],
        [8, "青い鳥", 5, 1200, 2016]
      ]
    },
    {
      name: "orders", label: "注文",
      ddl: "CREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  book_id INTEGER NOT NULL,\n  qty INTEGER NOT NULL,\n  order_date TEXT NOT NULL\n);",
      cols: ["id", "book_id", "qty", "order_date"],
      rows: [
        [1, 1, 2, "2024-04-01"],
        [2, 3, 1, "2024-04-01"],
        [3, 1, 1, "2024-04-02"],
        [4, 5, 4, "2024-04-03"],
        [5, 2, 1, "2024-04-03"],
        [6, 8, 2, "2024-04-05"],
        [7, 3, 4, "2024-04-06"]
      ]
    }
  ];
  var tableIndex = {};
  TABLES.forEach(function (t) { tableIndex[t.name] = t; });
  function table(name) { return tableIndex.hasOwnProperty(name) ? tableIndex[name] : null; }

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("SQLD.register: 登録できません: " + id);
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

  // ---------- 結果の表の文字列 ----------
  // "列 | 列\n値 | 値" → { cols: [...], rows: [[...], ...] }。形がおかしければ null
  function parseResult(s) {
    if (typeof s !== "string" || !s.trim()) return null;
    var lines = s.split("\n");
    var split = function (line) { return line.split("|").map(function (x) { return x.trim(); }); };
    var cols = split(lines[0]);
    var rows = lines.slice(1).map(split);
    for (var i = 0; i < rows.length; i++) if (rows[i].length !== cols.length) return null;
    return { cols: cols, rows: rows };
  }

  // ---------- 入力の判定 ----------
  // 演算子の記号(< > ! =)どうしの間の空白は残す。「< >」を「<>」と同じにしないため
  var PUNCT = "(),=<>!*", OPS = "<>!=";
  function normalize(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/[‘’]/g, "'").replace(/[“”]/g, "\"");
    s = s.replace(/[！-～]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); });
    s = s.replace(/[　\t\r\n]/g, " ");
    s = s.replace(/ +/g, " ").trim().toLowerCase();
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === " ") {
        var prev = out.charAt(out.length - 1), next = s.charAt(i + 1);
        var nearPunct = PUNCT.indexOf(prev) >= 0 || PUNCT.indexOf(next) >= 0;
        var betweenOps = OPS.indexOf(prev) >= 0 && OPS.indexOf(next) >= 0;
        if (nearPunct && !betweenOps) continue;
      }
      out += ch;
    }
    return out;
  }
  function kindOf(q) { return q.kind === "result" || q.kind === "sql" || q.kind === "text" ? q.kind : "code"; }
  function hasBlank(q) { return typeof q.sql === "string" && q.sql.indexOf(BLANK) >= 0; }
  function isInputable(q) { return kindOf(q) === "code" && hasBlank(q) && !q.noInput; }
  function answersOf(q) {
    var list = [q.choices[0]].concat(Array.isArray(q.accepts) ? q.accepts : []);
    return list.map(normalize);
  }
  // acceptPatterns: 正規化したあとの入力に当てる正規表現の文字列(例: VARCHAR(n) の n は何でもよい)
  function patternsOf(q) {
    return (Array.isArray(q.acceptPatterns) ? q.acceptPatterns : []).map(function (src) { return new RegExp(src); });
  }
  function isMatch(q, typed) {
    var t = normalize(typed);
    if (!t) return false;
    if (answersOf(q).indexOf(t) >= 0) return true;
    return patternsOf(q).some(function (re) { return re.test(t); });
  }
  // 空欄に答えを入れた SQL
  function fillBlank(sql, answer) { return String(sql).split(BLANK).join(answer); }

  // ---------- SQL の色分け用の字句分け(画面の部品は各ページで作る) ----------
  // [{ t: "kw" | "fn" | "str" | "num" | "cm" | "blank" | "", s: "文字" }, …] を返す
  var KEYWORDS = ("SELECT FROM WHERE AND OR NOT IN BETWEEN LIKE IS NULL AS DISTINCT ORDER BY ASC DESC LIMIT OFFSET " +
    "GROUP INNER LEFT OUTER RIGHT FULL JOIN ON UNION WITH INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE DROP " +
    "PRIMARY KEY INTEGER TEXT REAL DATE VARCHAR ALL TOP DATABASE").split(" ");
  var FUNCS = "COUNT SUM AVG MAX MIN".split(" ");
  var kwSet = {}, fnSet = {};
  KEYWORDS.forEach(function (k) { kwSet[k] = true; });
  FUNCS.forEach(function (k) { fnSet[k] = true; });
  function tokenize(sql) {
    var out = [], re = /('(?:[^']|'')*'?)|(--[^\n]*)|(____)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g, m;
    var push = function (t, s) {
      var last = out[out.length - 1];
      if (last && last.t === t && t === "") last.s += s; else out.push({ t: t, s: s });
    };
    while ((m = re.exec(String(sql))) !== null) {
      if (m[1] !== undefined) push("str", m[1]);
      else if (m[2] !== undefined) push("cm", m[2]);
      else if (m[3] !== undefined) push("blank", m[3]);
      else if (m[4] !== undefined) push("num", m[4]);
      else if (m[5] !== undefined) {
        var up = m[5].toUpperCase();
        push(fnSet[up] ? "fn" : kwSet[up] ? "kw" : "", m[5]);
      } else push("", m[6]);
    }
    return out;
  }

  // 問題の形を確かめる。問題点の一覧を返す(なければ空の配列)。検証スクリプトもこれを使う
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (typeof q.q !== "string" || !q.q) errs.push("q がない");
    var kind = kindOf(q);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c.trim()) { errs.push("choices[" + i + "] が空"); return; }
        if (kind === "result" && !parseResult(c)) errs.push("choices[" + i + "] が結果の表の形ではない");
        var k = normalize(c);
        if (seen[k]) errs.push("choices に同じものがある: " + c);
        seen[k] = true;
      });
      if (isInputable(q)) {
        var ans = answersOf(q);
        q.choices.slice(1).forEach(function (c) {
          if (ans.indexOf(normalize(c)) >= 0 || isMatch(q, c)) errs.push("誤答が正解の書き方と同じ: " + c);
        });
      }
    }
    if (q.accepts !== undefined && !Array.isArray(q.accepts)) errs.push("accepts が配列ではない");
    if (q.acceptPatterns !== undefined) {
      if (!Array.isArray(q.acceptPatterns)) errs.push("acceptPatterns が配列ではない");
      else q.acceptPatterns.forEach(function (src) {
        try { new RegExp(src); } catch (e) { errs.push("acceptPatterns の正規表現が読めない: " + src); }
      });
    }
    if (q.result !== undefined && !parseResult(q.result)) errs.push("result が結果の表の形ではない");
    if (!Array.isArray(q.tables)) errs.push("tables がない");
    else q.tables.forEach(function (t) { if (!table(t)) errs.push("表がない: " + t); });
    if (typeof q.explain !== "string" || !q.explain) errs.push("explain がない");
    if (!q.ref || !card(q.ref)) errs.push("ref のカードがない: " + q.ref);
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
  function poolOf(unitId, mode) {
    var c = contentOf(unitId);
    if (!c) return [];
    return c.questions.filter(function (q) {
      return checkQuestion(q).length === 0 && (mode !== "input" || isInputable(q));
    });
  }
  function isReady(unitId, mode) { return poolOf(unitId, mode || "choice").length > 0; }

  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      id: q.id,
      q: q.q,
      sql: q.sql || "",
      result: q.result || "",
      tables: q.tables.slice(),
      kind: kindOf(q),
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(0),
      canonical: q.choices[0],
      source: q,
      explain: q.explain,
      ref: q.ref || ""
    };
  }

  // 選んだ単元から順番に1問ずつ取り、count 問になるまで続ける(問題が少ない単元は、ほかの単元で補う)
  function buildQuiz(unitIds, mode, count) {
    count = count || COUNT;
    var pools = shuffle(unitIds.filter(function (id) { return unit(id); })).map(function (id) {
      return { id: id, list: shuffle(poolOf(id, mode)) };
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
        var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total), sessions = cleanNum(r.sessions);
        if (total > 0 || sessions > 0) s.byUnit[u.id] = { total: total, correct: correct, sessions: sessions };
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
    var s = { mode: "choice", units: [] };
    if (MODES.indexOf(raw.mode) >= 0) s.mode = raw.mode;
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }

  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, MODES: MODES, UNITS: UNITS, BLANK: BLANK,
    TABLES: TABLES, table: table, parseResult: parseResult,
    unit: unit, register: register, contentOf: contentOf, card: card,
    normalize: normalize, isMatch: isMatch, isInputable: isInputable, kindOf: kindOf, hasBlank: hasBlank, fillBlank: fillBlank,
    tokenize: tokenize,
    checkQuestion: checkQuestion, isReady: isReady, poolOf: poolOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();


// =====================================================================
// 01 SELECTの基本
// =====================================================================
SQLD.register("select", {
  cards: [
    {
      id: "select", name: "SELECT 列 FROM 表", read: "列を取り出す",
      desc: "表から、指定した列を取り出します。列はカンマ `,` で区切って並べ、並べた順に結果に出ます。`*` と書くと、すべての列を表の定義の順で取り出します。",
      examples: [
        ["SELECT title, price FROM books;", "title と price の2列(8行)"],
        ["SELECT * FROM authors;", "authors のすべての列"]
      ],
      options: [
        ["SELECT 列1, 列2", "取り出す列。カンマで区切る"],
        ["FROM 表", "どの表から取り出すか"],
        ["*", "すべての列"]
      ],
      notes: ["WHERE でしぼらなければ、すべての行が結果に出ます。"]
    },
    {
      id: "as", name: "AS(列の別名)", read: "見出しを変える",
      desc: "`列 AS 別名` と書くと、結果の列の見出しが別名になります。表の中の列名は変わりません。",
      examples: [
        ["SELECT title AS book_title FROM books;", "見出しが book_title になる"],
        ["SELECT COUNT(*) AS n FROM books;", "集計の結果に名前をつける"]
      ],
      notes: ["`AS` は省略できます(`title book_title`)。ただし、列と列の間のカンマを忘れたときと見分けがつかないので、`AS` を書くほうが安全です。"]
    },
    {
      id: "distinct", name: "DISTINCT", read: "重複を1つにまとめる",
      desc: "`SELECT DISTINCT 列` で、同じ値の行を1つにまとめます。列を2つ以上書くと、列の値の組み合わせが同じ行をまとめます。NULL も1つの値としてまとめられます。",
      examples: [
        ["SELECT DISTINCT country FROM authors;", "日本・イギリス・アメリカの3行"],
        ["SELECT DISTINCT book_id FROM orders;", "注文された本の id(5行)"]
      ]
    },
    {
      id: "syntax", name: "文の書き方", read: "; ・大文字小文字・引用符",
      desc: "SQL の文は `;` で終わります。`SELECT` などのキーワードは大文字でも小文字でも同じ意味です(読みやすいように大文字で書くことが多い)。改行や空白は自由に入れられます。文字列は `'…'`(シングルクォート)で囲みます。",
      examples: [
        ["select title from books;", "SELECT title FROM books; と同じ"],
        ["SELECT title\nFROM books\nWHERE price > 1000;", "改行して書いてもよい"]
      ],
      options: [
        [";", "文の終わり。いくつかの文を続けて書くときの区切り"],
        ["'日本'", "文字列はシングルクォートで囲む"],
        ["-- メモ", "-- から行の終わりまではコメント"]
      ],
      notes: [
        "標準SQLでは `\"…\"`(ダブルクォート)は列名や表名を囲む記号です。MySQL などでは文字列として通ることもありますが、文字列には `'…'` を使います。",
        "表名・列名の大文字小文字を区別するかどうかは、DBや設定によって違います。"
      ]
    }
  ],
  questions: [
    {
      id: "s01", q: "このSQLの結果は?", tables: ["authors"], kind: "result",
      sql: "SELECT DISTINCT country FROM authors;",
      choices: [
        "country\n日本\nイギリス\nアメリカ",
        "country\n日本\nイギリス\n日本\nイギリス\nアメリカ\n日本",
        "country\nアメリカ",
        "country\n日本"
      ],
      explain: "`DISTINCT` は同じ値を1つにまとめます。「1回しか出てこない値だけ」を残すのではありません。行の順番は決まっていないので、並びは違うことがあります。",
      ref: "distinct"
    },
    {
      id: "s02", q: "このSQLの結果は、何行・何列?", tables: ["books"], kind: "text",
      sql: "SELECT title, year FROM books;",
      choices: ["8行・2列", "2行・8列", "8行・5列", "7行・2列"],
      explain: "列は `title` と `year` の2つ。WHERE がないので、books の8行がすべて出ます。",
      ref: "select"
    },
    {
      id: "s03", q: "books 表のすべての列を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT ____ FROM books;",
      choices: ["*", "ALL", "%", "?"],
      explain: "`*` は「すべての列」です。`%` は LIKE で使う記号で、ここでは使えません。",
      ref: "select"
    },
    {
      id: "s04", q: "price 列の見出しを price_yen にして取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT price ____ price_yen FROM books;",
      choices: ["AS", "IS", "TO", "="],
      explain: "`列 AS 別名` で、結果の見出しだけが変わります。表の列名は price のままです。",
      ref: "as"
    },
    {
      id: "s05", q: "本を書いた著者の id(author_id)を、重複なしで取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT ____ author_id FROM books;",
      choices: ["DISTINCT", "SINGLE", "ONLY", "DIFFERENT"],
      explain: "`SELECT DISTINCT 列` で、同じ値の行を1つにまとめます。この表では 1・2・3・4・5・NULL の6行になります。",
      ref: "distinct"
    },
    {
      id: "s06", q: "どの表から取り出すかを指定します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title ____ books;",
      choices: ["FROM", "IN", "OF", "AT"],
      explain: "`SELECT 列 FROM 表` が基本の形です。",
      ref: "select"
    },
    {
      id: "s07", q: "title と price の2列を、この順で取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT ____ FROM books;",
      choices: ["title, price", "title AND price", "title price", "title + price"],
      expect: "title | price\n星の旅 | 1200\n海の歌 | 800\n森の朝 | 1500\n夜の街 | 900\n風と石 | 2200\n星の庭 | NULL\n古い地図 | 600\n青い鳥 | 1200",
      explain: "列はカンマで区切ります。`title price` はエラーにならず、「title に price という別名をつけた1列」と読まれてしまいます。",
      ref: "select"
    },
    {
      id: "s08", q: "このSQLの結果の、列の見出しは?", tables: ["books"], kind: "code",
      sql: "SELECT title AS book_title, price FROM books;",
      choices: ["book_title | price", "title | price", "book_title | title | price", "title AS book_title | price"],
      explain: "`AS` で別名をつけた列は、見出しが別名になります。別名をつけていない price はそのままです。",
      ref: "as"
    },
    {
      id: "s09", q: "文の終わりを示す記号を入れます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT * FROM books____",
      choices: [";", ".", ":", "!"],
      explain: "SQL の文は `;` で終わります。いくつかの文を続けて書くときの区切りにもなります。",
      ref: "syntax"
    },
    {
      id: "s10", q: "このSQLを実行するとエラーになります。原因は?", tables: ["books"], kind: "text",
      sql: "SELECT title, price, FROM books;",
      choices: ["FROM の直前に余分な「,」がある", "列名は ' で囲まなければならない", "SELECT で指定できる列は1つだけ", "SELECT と FROM は小文字で書かなければならない"],
      explain: "最後の列のあとにカンマがあると、次の列が来るはずなのに `FROM` が来るので文法エラーになります。キーワードは大文字でも小文字でもかまいません。",
      ref: "select"
    },
    {
      id: "s11", q: "SELECT や FROM などのキーワードの大文字・小文字は?", tables: [], kind: "text",
      choices: ["区別されない(select と書いても同じ)", "必ず大文字で書く", "必ず小文字で書く", "文の最初の語だけ大文字にする"],
      explain: "キーワードは大文字小文字を区別しません。読みやすくするために、キーワードを大文字、列名や表名を小文字で書くことが多いです。",
      ref: "syntax"
    },
    {
      id: "s12", q: "この結果を出すSQLは?", tables: ["orders"], kind: "sql",
      result: "book_id\n1\n3\n5\n2\n8",
      choices: [
        "SELECT DISTINCT book_id FROM orders;",
        "SELECT book_id FROM orders;",
        "SELECT DISTINCT * FROM orders;",
        "SELECT DISTINCT book_id FROM books;"
      ],
      explain: "orders の book_id は 1・3・1・5・2・8・3 の7行です。`DISTINCT` で重複をまとめると5行になります。books 表には book_id という列がないのでエラーです。",
      ref: "distinct"
    },
    {
      id: "s13", q: "SELECT で AS を使って別名をつけると、表の列名はどうなる?", tables: [], kind: "text",
      choices: ["表の列名は変わらず、結果の見出しだけが変わる", "表の列名も別名に書き換わる", "元の列が表から消える", "別名の列が表に追加される"],
      explain: "`AS` はその SELECT の結果の見出しを変えるだけです。表そのものを変えるには ALTER TABLE など別の文を使います。",
      ref: "as"
    }
  ]
});


// =====================================================================
// 02 条件でしぼる
// =====================================================================
SQLD.register("where", {
  cards: [
    {
      id: "where", name: "WHERE", read: "条件でしぼる",
      desc: "`FROM` のあとに `WHERE 条件` を書くと、条件に合う行だけが結果に出ます。文字列の値は `'…'` で囲みます。",
      examples: [
        ["SELECT title FROM books WHERE price >= 1200;", "1200円以上の本"],
        ["SELECT name FROM authors WHERE country = '日本';", "日本の著者"]
      ],
      notes: ["条件の結果が NULL(不明)になった行は、真ではないので出ません。NULL の扱いは単元08で学びます。"]
    },
    {
      id: "compare", name: "= <> < > <= >=", read: "比較演算子",
      desc: "値を比べる記号です。「等しくない」は `<>` と書きます。",
      examples: [
        ["SELECT title FROM books WHERE year < 2015;", "2015年より前"],
        ["SELECT name FROM authors WHERE country <> '日本';", "日本以外"]
      ],
      options: [
        ["=", "等しい(== ではない)"],
        ["<>", "等しくない。!= も SQLite・MySQL・PostgreSQL で使える"],
        ["< >", "より小さい / より大きい"],
        ["<= >=", "以下 / 以上"]
      ],
      notes: ["`price <> 1200` でも、price が NULL の行は出ません(NULL との比較は「不明」になるため)。"]
    },
    {
      id: "logic", name: "AND / OR / NOT", read: "条件の組み合わせ",
      desc: "`AND` は両方とも成り立つ、`OR` はどちらかが成り立つ、`NOT` は成り立たない、という意味です。",
      examples: [
        ["SELECT name FROM authors WHERE country = '日本' AND id > 2;", "佐藤・中村"],
        ["SELECT title FROM books WHERE author_id = 1 OR author_id = 2;", "著者1か2の本"],
        ["SELECT title FROM books WHERE NOT (price > 1000);", "1000円以下(NULL は出ない)"]
      ],
      notes: ["`AND` は `OR` より先に計算されます。組み合わせるときは `( )` で囲むと迷いません。"]
    },
    {
      id: "in", name: "IN (…)", read: "どれかに等しい",
      desc: "`列 IN (値1, 値2, …)` は、列がかっこの中のどれかに等しい行を選びます。`列 = 値1 OR 列 = 値2 …` と同じです。",
      examples: [
        ["SELECT title FROM books WHERE author_id IN (1, 3);", "著者1か3の本(4冊)"],
        ["SELECT name FROM authors WHERE country IN ('日本', 'アメリカ');", "文字列も並べられる"]
      ],
      notes: ["`IN (1, 3)` は 1 と 3 だけです。1〜3 の範囲ではありません。範囲は BETWEEN を使います。"]
    },
    {
      id: "between", name: "BETWEEN a AND b", read: "範囲(両端を含む)",
      desc: "`列 BETWEEN a AND b` は `列 >= a AND 列 <= b` と同じです。両端の値も含みます。小さいほうを先に書きます。",
      examples: [
        ["SELECT title FROM books WHERE year BETWEEN 2015 AND 2018;", "2015〜2018年(3冊)"],
        ["SELECT title FROM books WHERE price BETWEEN 1000 AND 1500;", "1000円以上1500円以下"]
      ]
    },
    {
      id: "like", name: "LIKE", read: "パターンで探す",
      desc: "文字列が形に合うかを調べます。`%` は「0文字以上の何でも」、`_` は「ちょうど1文字」を表します。",
      examples: [
        ["SELECT title FROM books WHERE title LIKE '星%';", "星で始まる"],
        ["SELECT title FROM books WHERE title LIKE '%い%';", "い を含む"],
        ["SELECT title FROM books WHERE title LIKE '_い_';", "3文字で、2文字目が い"]
      ],
      options: [
        ["%", "0文字以上の任意の文字列"],
        ["_", "任意の1文字"]
      ],
      notes: ["英字の大文字小文字を区別するかは DB で違います(PostgreSQL は区別する、SQLite と MySQL はふつう区別しない)。"]
    }
  ],
  questions: [
    {
      id: "w01", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books WHERE price >= 1200;",
      choices: [
        "title\n星の旅\n森の朝\n風と石\n青い鳥",
        "title\n森の朝\n風と石",
        "title\n星の旅\n森の朝\n風と石\n星の庭\n青い鳥",
        "title\n海の歌\n夜の街\n古い地図"
      ],
      explain: "`>=` は「以上」なので、ちょうど1200円の 星の旅 と 青い鳥 も入ります。price が NULL の 星の庭 は、比べられないので出ません。",
      ref: "compare"
    },
    {
      id: "w02", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books WHERE year BETWEEN 2015 AND 2018;",
      choices: [
        "title\n星の旅\n海の歌\n青い鳥",
        "title\n青い鳥",
        "title\n星の旅\n青い鳥",
        "title\n海の歌\n青い鳥"
      ],
      explain: "`BETWEEN` は両端を含みます。2015年の 星の旅、2016年の 青い鳥、2018年の 海の歌 の3冊です。",
      ref: "between"
    },
    {
      id: "w03", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books WHERE title LIKE '星%';",
      choices: [
        "title\n星の旅\n星の庭",
        "title\n星の旅",
        "title",
        "title\n星の旅\n海の歌\n森の朝\n夜の街\n星の庭"
      ],
      explain: "`'星%'` は「星で始まり、そのあとは何文字でもよい」です。星の旅 と 星の庭 が合います。",
      ref: "like"
    },
    {
      id: "w04", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books WHERE title LIKE '_い_';",
      choices: [
        "title\n青い鳥",
        "title\n古い地図\n青い鳥",
        "title\n古い地図",
        "title"
      ],
      explain: "`_` はちょうど1文字です。`'_い_'` は「3文字で、2文字目が い」。古い地図 は4文字なので合いません(`'_い%'` なら合います)。",
      ref: "like"
    },
    {
      id: "w05", q: "このSQLの結果は?", tables: ["authors"], kind: "result",
      sql: "SELECT name FROM authors WHERE country = '日本' AND id > 2;",
      choices: [
        "name\n佐藤\n中村",
        "name\n青木\n佐藤\n中村",
        "name\n青木\n佐藤\nSmith\nMiller\n中村",
        "name\n佐藤"
      ],
      explain: "`AND` は両方の条件に合う行です。日本の著者(1・3・6)のうち、id が 2 より大きい 佐藤(3)と 中村(6)。`OR` なら5人になります。",
      ref: "logic"
    },
    {
      id: "w06", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT id FROM books WHERE price <> 1200;",
      choices: [
        "id\n2\n3\n4\n5\n7",
        "id\n2\n3\n4\n5\n6\n7",
        "id\n1\n8",
        "id\n2\n3\n4\n5\n6"
      ],
      explain: "`<>` は「等しくない」。ただし price が NULL の id 6 は、比べた結果が「不明」になるので出ません。NULL の行も出したいときは `OR price IS NULL` を足します。",
      ref: "compare"
    },
    {
      id: "w07", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books WHERE author_id IN (1, 3);",
      choices: [
        "title\n星の旅\n森の朝\n夜の街\n星の庭",
        "title\n星の旅\n海の歌\n森の朝\n夜の街\n星の庭",
        "title\n星の旅\n夜の街",
        "title\n星の旅\n森の朝"
      ],
      explain: "`IN (1, 3)` は author_id が 1 か 3 の行です。1〜3 の範囲ではないので、著者2の 海の歌 は入りません。",
      ref: "in"
    },
    {
      id: "w08", q: "price が 1000 以上 1500 以下の本を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books WHERE price ____ 1000 AND 1500;",
      choices: ["BETWEEN", "IN", "FROM", "LIKE"],
      expect: "title\n星の旅\n森の朝\n青い鳥",
      explain: "`BETWEEN 1000 AND 1500` は両端を含む範囲です。星の旅(1200)、森の朝(1500)、青い鳥(1200)が入ります。",
      ref: "between"
    },
    {
      id: "w09", q: "国が日本ではない著者を取り出します。空欄に入る演算子は?", tables: ["authors"], kind: "code",
      sql: "SELECT name FROM authors WHERE country ____ '日本';",
      choices: ["<>", "NOT", "=!", "><"],
      accepts: ["!="],
      expect: "name\nBrown\nSmith\nMiller",
      explain: "「等しくない」は `<>` です。`!=` も SQLite・MySQL・PostgreSQL で使えます。`NOT` は条件全体の前に置く語です(`NOT country = '日本'`)。",
      ref: "compare"
    },
    {
      id: "w10", q: "タイトルに「い」を含む本を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books WHERE title LIKE ____;",
      choices: ["'%い%'", "'_い_'", "'*い*'", "'い'"],
      expect: "title\n古い地図\n青い鳥",
      explain: "`%` は0文字以上の何でも。前後に `%` をつけると「どこかに い を含む」になります。`*` は LIKE では使いません。",
      ref: "like"
    },
    {
      id: "w11", q: "author_id が 1 または 2 の本を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books WHERE author_id = 1 ____ author_id = 2;",
      choices: ["OR", "AND", "IN", "ALSO"],
      expect: "title\n星の旅\n海の歌\n森の朝",
      explain: "どちらかに合えばよいので `OR` です。`AND` にすると「1 でもあり 2 でもある」行を探すことになり、0行です。",
      ref: "logic"
    },
    {
      id: "w12", q: "「price が 1000 より大きい」に当てはまらない本を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books WHERE ____ (price > 1000);",
      choices: ["NOT", "NO", "!", "EXCEPT"],
      expect: "title\n海の歌\n夜の街\n古い地図",
      explain: "`NOT` は条件を反対にします。price が NULL の 星の庭 は、`price > 1000` が「不明」で、`NOT` をつけても「不明」のままなので出ません。",
      ref: "logic"
    },
    {
      id: "w13", q: "このSQLはエラーになります。原因は?", tables: ["authors"], kind: "text",
      sql: "SELECT name FROM authors WHERE country = 日本;",
      choices: ["文字列の 日本 を ' で囲んでいない", "= ではなく == と書く", "WHERE は FROM より前に書く", "country は大文字で書く"],
      explain: "囲まない 日本 は列名として読まれ、「そんな列はない」というエラーになります。文字列は `'日本'` と書きます。",
      ref: "where"
    },
    {
      id: "w14", q: "BETWEEN 10 AND 20 が表す範囲は?", tables: [], kind: "text",
      choices: ["10 以上 20 以下", "10 より大きく 20 より小さい", "10 以上 20 未満", "10 より大きく 20 以下"],
      explain: "`BETWEEN` は両端を含みます。`>= 10 AND <= 20` と同じです。",
      ref: "between"
    },
    {
      id: "w15", q: "LIKE で「任意の1文字」を表す記号は?", tables: [], kind: "code",
      choices: ["_", "%", "*", "?"],
      explain: "`_` がちょうど1文字、`%` が0文字以上です。`*` や `?` はファイル名のワイルドカードで、LIKE では使いません。",
      ref: "like"
    },
    {
      id: "w16", q: "author_id が 1 か 3 の本を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books WHERE author_id ____ (1, 3);",
      choices: ["IN", "BETWEEN", "LIKE", "ANY"],
      expect: "title\n星の旅\n森の朝\n夜の街\n星の庭",
      explain: "`IN (1, 3)` は「1 か 3 のどれかに等しい」です。`author_id = 1 OR author_id = 3` と同じ結果になります。",
      ref: "in"
    }
  ]
});


// =====================================================================
// 03 並べ替えと件数
// =====================================================================
SQLD.register("order", {
  cards: [
    {
      id: "order-by", name: "ORDER BY", read: "並べ替え",
      desc: "`ORDER BY 列` で結果を並べ替えます。`ASC` は小さい順(昇順)、`DESC` は大きい順(降順)。どちらも書かなければ `ASC` です。",
      examples: [
        ["SELECT title, year FROM books ORDER BY year;", "古い年から"],
        ["SELECT title, year FROM books ORDER BY year DESC;", "新しい年から"]
      ],
      options: [
        ["ASC", "小さい順(書かないときと同じ)"],
        ["DESC", "大きい順"]
      ],
      notes: [
        "ORDER BY は WHERE のあとに書きます。",
        "NULL を先に並べるか後に並べるかは DB で違います(昇順のとき、SQLite・MySQL は先頭、PostgreSQL は末尾)。",
        "日本語の文字列の並び順も、DB や設定によって違います。"
      ]
    },
    {
      id: "order-multi", name: "ORDER BY 列1, 列2", read: "複数の列で並べる",
      desc: "まず列1で並べ、列1が同じ行どうしを列2で並べます。`ASC` / `DESC` は列ごとに書きます。",
      examples: [
        ["SELECT id, qty FROM orders ORDER BY qty DESC, id;", "qty の大きい順、同じなら id の小さい順"]
      ],
      notes: ["`ORDER BY price, id DESC` の `DESC` は id だけにかかります。price は ASC のままです。"]
    },
    {
      id: "row-order", name: "並び順の保証", read: "ORDER BY がないとき",
      desc: "ORDER BY を書かないとき、行の順番は決まっていません。表に入れた順や id の順に出ることが多いですが、保証はありません。順番が必要なら必ず ORDER BY を書きます。",
      examples: [
        ["SELECT title FROM books;", "順番はDBまかせ"],
        ["SELECT title FROM books ORDER BY id;", "id の順に決まる"]
      ]
    },
    {
      id: "limit", name: "LIMIT / OFFSET", read: "件数をしぼる",
      desc: "`LIMIT n` で先頭から n 行だけを出します。`OFFSET m` をつけると、先頭の m 行を飛ばしてから数えます。ふつうは ORDER BY と組み合わせます。",
      examples: [
        ["SELECT title FROM books ORDER BY year DESC LIMIT 3;", "新しい3冊"],
        ["SELECT title FROM books ORDER BY year LIMIT 3 OFFSET 3;", "4〜6番目"]
      ],
      options: [
        ["LIMIT n", "n 行まで"],
        ["OFFSET m", "先頭の m 行を飛ばす"]
      ],
      notes: [
        "書く順番は `… ORDER BY … LIMIT … OFFSET …;` です。",
        "SQLite・MySQL・PostgreSQL で使えます。SQL Server では `TOP` などを使い、LIMIT はありません。標準SQLには `FETCH FIRST n ROWS ONLY` という書き方もあります。"
      ]
    }
  ],
  questions: [
    {
      id: "o01", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title, year FROM books ORDER BY year DESC LIMIT 3;",
      choices: [
        "title | year\n風と石 | 2021\n森の朝 | 2020\n星の庭 | 2019",
        "title | year\n古い地図 | 2010\n夜の街 | 2012\n星の旅 | 2015",
        "title | year\n森の朝 | 2020\n海の歌 | 2018\n星の旅 | 2015",
        "title | year\n風と石 | 2021\n森の朝 | 2020\n星の庭 | 2019\n海の歌 | 2018"
      ],
      explain: "先に全体を year の大きい順に並べ、そのあと先頭の3行を取ります。最初の3行を取ってから並べるのではありません。",
      ref: "limit"
    },
    {
      id: "o02", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books ORDER BY year LIMIT 2 OFFSET 2;",
      choices: [
        "title\n星の旅\n青い鳥",
        "title\n夜の街\n星の旅",
        "title\n古い地図\n夜の街",
        "title\n森の朝\n夜の街"
      ],
      explain: "year の小さい順は 古い地図(2010)・夜の街(2012)・星の旅(2015)・青い鳥(2016)…。`OFFSET 2` で先頭の2行を飛ばし、そこから2行です。",
      ref: "limit"
    },
    {
      id: "o03", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title, price FROM books WHERE price >= 1000 ORDER BY price, id DESC;",
      choices: [
        "title | price\n青い鳥 | 1200\n星の旅 | 1200\n森の朝 | 1500\n風と石 | 2200",
        "title | price\n星の旅 | 1200\n青い鳥 | 1200\n森の朝 | 1500\n風と石 | 2200",
        "title | price\n風と石 | 2200\n森の朝 | 1500\n青い鳥 | 1200\n星の旅 | 1200",
        "title | price\n風と石 | 2200\n森の朝 | 1500\n星の旅 | 1200\n青い鳥 | 1200"
      ],
      explain: "`DESC` は直前の id にだけかかります。price は小さい順(ASC)で、同じ1200円の2冊は id の大きい順(青い鳥 8 → 星の旅 1)です。",
      ref: "order-multi"
    },
    {
      id: "o04", q: "出版年の新しい本から順に並べます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books ORDER BY year ____;",
      choices: ["DESC", "ASC", "DOWN", "REVERSE"],
      expect: "title\n風と石\n森の朝\n星の庭\n海の歌\n青い鳥\n星の旅\n夜の街\n古い地図",
      explain: "新しい年 = 数の大きい順なので `DESC`(descending)です。`ASC` は小さい順で、何も書かないときも ASC になります。",
      ref: "order-by"
    },
    {
      id: "o05", q: "出版年の古い本から、最初の3冊だけを取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books ORDER BY year ____ 3;",
      choices: ["LIMIT", "TOP", "MAX", "FIRST"],
      expect: "title\n古い地図\n夜の街\n星の旅",
      explain: "`LIMIT 3` で先頭の3行だけになります。`TOP` は SQL Server の書き方で、`SELECT TOP 3 …` のように SELECT の直後に書きます。",
      ref: "limit"
    },
    {
      id: "o06", q: "出版年の古い順で、4〜6番目の本を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books ORDER BY year LIMIT 3 ____ 3;",
      choices: ["OFFSET", "SKIP", "FROM", "START"],
      expect: "title\n青い鳥\n海の歌\n星の庭",
      explain: "`OFFSET 3` で先頭の3行を飛ばし、`LIMIT 3` でそこから3行を取ります。ページ分けの表示によく使います。",
      ref: "limit"
    },
    {
      id: "o07", q: "出版年の古い順に並べます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books ____ year;",
      choices: ["ORDER BY", "SORT BY", "ORDER", "ARRANGE BY"],
      expect: "title\n古い地図\n夜の街\n星の旅\n青い鳥\n海の歌\n星の庭\n森の朝\n風と石",
      explain: "並べ替えは `ORDER BY` です。ASC も DESC も書かないので、小さい順(古い順)になります。",
      ref: "order-by"
    },
    {
      id: "o08", q: "ORDER BY year のように ASC も DESC も書かないと、どう並ぶ?", tables: [], kind: "text",
      choices: ["小さい順(ASC)", "大きい順(DESC)", "表に入れた順のまま", "エラーになる"],
      explain: "書かないときは `ASC`(昇順)です。大きい順にしたいときだけ `DESC` を書きます。",
      ref: "order-by"
    },
    {
      id: "o09", q: "ORDER BY を書かない SELECT では、行はどの順番で出る?", tables: [], kind: "text",
      choices: ["決まっていない(順番が必要なら ORDER BY を書く)", "必ず id の小さい順", "必ず表に入れた順", "必ず1列目の小さい順"],
      explain: "入れた順や id の順に出ることが多いですが、SQL では保証されていません。DB の内部の都合で変わることがあります。",
      ref: "row-order"
    },
    {
      id: "o10", q: "この結果を出すSQLは?", tables: ["books"], kind: "sql",
      result: "title | year\n風と石 | 2021\n森の朝 | 2020",
      choices: [
        "SELECT title, year FROM books ORDER BY year DESC LIMIT 2;",
        "SELECT title, year FROM books ORDER BY year LIMIT 2;",
        "SELECT title, year FROM books LIMIT 2 ORDER BY year DESC;",
        "SELECT title, year FROM books ORDER BY year DESC LIMIT 2 OFFSET 1;"
      ],
      explain: "新しい順に並べて先頭の2行です。`LIMIT` は `ORDER BY` のあとに書きます。`OFFSET 1` をつけると先頭の1行を飛ばすので、森の朝 と 星の庭 になります。",
      ref: "limit"
    },
    {
      id: "o11", q: "LIMIT 5 OFFSET 10 で取り出されるのは、並べたうちの何行目?", tables: [], kind: "text",
      choices: ["11〜15行目", "10〜15行目", "10〜14行目", "6〜10行目"],
      explain: "`OFFSET 10` で1〜10行目を飛ばし、11行目から5行(11〜15行目)を取ります。",
      ref: "limit"
    },
    {
      id: "o12", q: "このSQLはエラーになります。原因は?", tables: ["books"], kind: "text",
      sql: "SELECT title FROM books LIMIT 3 ORDER BY year;",
      choices: ["LIMIT は ORDER BY のあとに書く", "ORDER BY には DESC が必要", "LIMIT には 5 以上の数を書く", "LIMIT の数は ' で囲む"],
      explain: "書く順番は `SELECT … FROM … WHERE … ORDER BY … LIMIT …` と決まっています。",
      ref: "limit"
    },
    {
      id: "o13", q: "このSQLの結果は?", tables: ["orders"], kind: "result",
      sql: "SELECT id, qty FROM orders ORDER BY qty DESC, id LIMIT 3;",
      choices: [
        "id | qty\n4 | 4\n7 | 4\n1 | 2",
        "id | qty\n7 | 4\n4 | 4\n6 | 2",
        "id | qty\n4 | 4\n7 | 4",
        "id | qty\n2 | 1\n3 | 1\n5 | 1"
      ],
      explain: "qty の大きい順で、qty が同じ行は id の小さい順です。qty 4 の id 4・7、次に qty 2 の id 1 です。",
      ref: "order-multi"
    },
    {
      id: "o14", q: "qty の大きい順に、qty が同じなら id の小さい順に並べます。空欄に入るのは?", tables: ["orders"], kind: "code",
      sql: "SELECT id, qty FROM orders ORDER BY qty ____, id;",
      choices: ["DESC", "ASC", "DOWN", "HIGH"],
      expect: "id | qty\n4 | 4\n7 | 4\n1 | 2\n6 | 2\n2 | 1\n3 | 1\n5 | 1",
      explain: "`DESC` は直前の列(qty)だけにかかります。id には何も書かないので ASC(小さい順)です。",
      ref: "order-multi"
    },
    {
      id: "o15", q: "いちばん古い本を1冊だけ取り出します。空欄に入る列は?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books ORDER BY ____ LIMIT 1;",
      choices: ["year", "id", "price", "qty"],
      accepts: ["year ASC"],
      expect: "title\n古い地図",
      explain: "出版年 year の小さい順に並べて、先頭の1行です。id の順は登録した順で、古さとは関係ありません。qty は books にない列です。",
      ref: "limit"
    }
  ]
});


// =====================================================================
// 04 集計関数
// =====================================================================
SQLD.register("aggregate", {
  cards: [
    {
      id: "count", name: "COUNT", read: "行を数える",
      desc: "`COUNT(*)` はすべての行を、`COUNT(列)` はその列が NULL でない行を数えます。`COUNT(DISTINCT 列)` は、NULL でない値の種類を数えます。",
      examples: [
        ["SELECT COUNT(*) FROM books;", "8(すべての行)"],
        ["SELECT COUNT(price) FROM books;", "7(price が NULL の1行は数えない)"],
        ["SELECT COUNT(DISTINCT author_id) FROM books;", "5(1〜5。NULL は数えない)"]
      ],
      options: [
        ["COUNT(*)", "行の数"],
        ["COUNT(列)", "その列が NULL でない行の数"],
        ["COUNT(DISTINCT 列)", "NULL でない値の種類の数"]
      ],
      notes: ["結果の見出しの表記は DB で違います(SQLite・MySQL は `COUNT(*)`、PostgreSQL は `count`)。この道場では SQLite の表記で出しています。`AS n` のように別名をつけると、どの DB でもそろいます。"]
    },
    {
      id: "sum-avg", name: "SUM / AVG", read: "合計・平均",
      desc: "`SUM(列)` は合計、`AVG(列)` は平均です。どちらも NULL の行は無視して計算します。",
      examples: [
        ["SELECT SUM(qty) FROM orders;", "15"],
        ["SELECT AVG(price) FROM books;", "1200(8400 ÷ 7。NULL の行は数に入れない)"]
      ],
      notes: [
        "AVG の結果の表示は DB で違います(1200.0、1200.0000 など)。",
        "見出しの表記も DB で違います(SQLite・MySQL は `SUM(qty)`、PostgreSQL は `sum`)。",
        "整数どうしの割り算(例: `5 / 2`)の結果も DB で違うので注意します。"
      ]
    },
    {
      id: "max-min", name: "MAX / MIN", read: "最大・最小",
      desc: "`MAX(列)` はいちばん大きい値、`MIN(列)` はいちばん小さい値です。NULL は無視されます。",
      examples: [
        ["SELECT MAX(price), MIN(price) FROM books;", "2200 と 600"],
        ["SELECT MAX(year) FROM books;", "2021"]
      ]
    },
    {
      id: "agg-where", name: "WHERE と集計", read: "しぼってから集計",
      desc: "WHERE があると、条件に合う行だけを集計します。集計関数を使った SELECT は、GROUP BY がなければ結果が1行になります。",
      examples: [
        ["SELECT SUM(price) FROM books WHERE author_id = 3;", "900(NULL の 星の庭 は無視)"],
        ["SELECT COUNT(*) AS n FROM orders WHERE qty >= 2;", "AS で見出しをつける"]
      ],
      notes: ["合う行が1行もないとき、`COUNT` は 0、`SUM` `AVG` `MAX` `MIN` は NULL になります。"]
    }
  ],
  questions: [
    {
      id: "a01", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT COUNT(*) FROM books;",
      choices: ["COUNT(*)\n8", "COUNT(*)\n7", "COUNT(*)\n5", "COUNT(*)\n1"],
      explain: "`COUNT(*)` は、NULL があるかどうかに関係なく、行の数を数えます。books は8行です。",
      ref: "count"
    },
    {
      id: "a02", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT COUNT(price) FROM books;",
      choices: ["COUNT(price)\n7", "COUNT(price)\n8", "COUNT(price)\n6", "COUNT(price)\n8400"],
      explain: "`COUNT(列)` は、その列が NULL でない行だけを数えます。price が NULL の 星の庭 を除いた7行です。",
      ref: "count"
    },
    {
      id: "a03", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT COUNT(DISTINCT author_id) FROM books;",
      choices: ["COUNT(DISTINCT author_id)\n5", "COUNT(DISTINCT author_id)\n6", "COUNT(DISTINCT author_id)\n7", "COUNT(DISTINCT author_id)\n8"],
      explain: "author_id の値は 1・2・3・4・5 と NULL。`COUNT(DISTINCT 列)` は NULL を数えないので5です。",
      ref: "count"
    },
    {
      id: "a04", q: "このSQLの結果は?", tables: ["orders"], kind: "result",
      sql: "SELECT SUM(qty) FROM orders;",
      choices: ["SUM(qty)\n15", "SUM(qty)\n7", "SUM(qty)\n4", "SUM(qty)\n28"],
      explain: "qty は 2+1+1+4+1+2+4 = 15。7 は行の数(COUNT)、4 は最大(MAX)です。",
      ref: "sum-avg"
    },
    {
      id: "a05", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT AVG(price) FROM books;",
      choices: ["AVG(price)\n1200", "AVG(price)\n1050", "AVG(price)\n8400", "AVG(price)\n1400"],
      explain: "NULL の行は無視されるので、合計 8400 を 7 で割って 1200。8 で割った 1050 にはなりません。表示は DB によって 1200.0 などになります。",
      ref: "sum-avg"
    },
    {
      id: "a06", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT MAX(price), MIN(price) FROM books;",
      choices: [
        "MAX(price) | MIN(price)\n2200 | 600",
        "MAX(price) | MIN(price)\n2200 | NULL",
        "MAX(price) | MIN(price)\n600 | 2200",
        "MAX(price) | MIN(price)\n2200 | 0"
      ],
      explain: "MAX も MIN も NULL を無視します。いちばん安いのは 古い地図 の 600 です。",
      ref: "max-min"
    },
    {
      id: "a07", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT SUM(price) FROM books WHERE author_id = 3;",
      choices: ["SUM(price)\n900", "SUM(price)\nNULL", "SUM(price)\n1800", "SUM(price)\n2"],
      explain: "著者3の本は 夜の街(900)と 星の庭(NULL)。SUM は NULL を無視するので 900 です。",
      ref: "agg-where"
    },
    {
      id: "a08", q: "注文(orders)の件数を数えます。空欄に入るのは?", tables: ["orders"], kind: "code",
      sql: "SELECT ____(*) FROM orders;",
      choices: ["COUNT", "SUM", "NUMBER", "TOTAL"],
      expect: "COUNT(*)\n7",
      explain: "行の数は `COUNT(*)` です。SUM は値の合計で、`*` は書けません。",
      ref: "count"
    },
    {
      id: "a09", q: "注文された冊数(qty)の合計を出します。空欄に入るのは?", tables: ["orders"], kind: "code",
      sql: "SELECT ____(qty) FROM orders;",
      choices: ["SUM", "COUNT", "ADD", "PLUS"],
      expect: "SUM(qty)\n15",
      explain: "合計は `SUM` です。`COUNT(qty)` だと、qty の値ではなく行の数(7)になります。",
      ref: "sum-avg"
    },
    {
      id: "a10", q: "いちばん新しい出版年を出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT ____(year) FROM books;",
      choices: ["MAX", "MIN", "TOP", "LAST"],
      expect: "MAX(year)\n2021",
      explain: "いちばん大きい値は `MAX` です。",
      ref: "max-min"
    },
    {
      id: "a11", q: "本の値段の平均を出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT ____(price) FROM books;",
      choices: ["AVG", "MEAN", "AVERAGE", "MID"],
      expect: "AVG(price)\n1200",
      explain: "平均は `AVG`(average の略)です。`AVERAGE` は表計算ソフトの関数名で、SQL では使えません。",
      ref: "sum-avg"
    },
    {
      id: "a12", q: "値段が入っている(price が NULL でない)本の数を数えます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT COUNT(____) FROM books;",
      choices: ["price", "*", "NULL", "ALL"],
      expect: "COUNT(price)\n7",
      explain: "`COUNT(price)` は price が NULL でない行だけを数えて 7。`COUNT(*)` だと NULL の行も数えて 8 です。",
      ref: "count"
    },
    {
      id: "a13", q: "本を書いている著者が何人いるかを、重複なしで数えます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT COUNT(____ author_id) FROM books;",
      choices: ["DISTINCT", "UNIQUE", "ALL", "ONLY"],
      expect: "COUNT(DISTINCT author_id)\n5",
      explain: "`COUNT(DISTINCT 列)` は値の種類を数えます。著者1と3は2冊ずつあるので、そのまま数える(7)より少ない 5 になります。",
      ref: "count"
    },
    {
      id: "a14", q: "COUNT(*) と COUNT(price) の違いは?", tables: [], kind: "text",
      choices: [
        "COUNT(*) はすべての行を、COUNT(price) は price が NULL でない行を数える",
        "どちらも同じで、すべての行を数える",
        "COUNT(price) は price の合計を出す",
        "COUNT(*) は NULL を含む行を数えない"
      ],
      explain: "`COUNT(*)` は行そのものを数えます。`COUNT(列)` は、その列に値が入っている行だけを数えます。",
      ref: "count"
    },
    {
      id: "a15", q: "SUM(price) を計算するとき、price が NULL の行はどう扱われる?", tables: [], kind: "text",
      choices: ["無視され、残りの行だけで計算する", "0 として計算する", "結果全体が NULL になる", "エラーになる"],
      explain: "集計関数(COUNT(*) 以外)は NULL を無視します。ただし `price + 100` のような計算では、NULL が入ると結果も NULL です。",
      ref: "sum-avg"
    }
  ]
});


// =====================================================================
// 05 グループ化
// =====================================================================
SQLD.register("group", {
  cards: [
    {
      id: "group-by", name: "GROUP BY", read: "グループにまとめる",
      desc: "`GROUP BY 列` で、その列の値が同じ行を1つのグループにまとめます。集計関数はグループごとに計算され、結果はグループ1つにつき1行です。NULL の行も1つのグループになります。",
      examples: [
        ["SELECT country, COUNT(*) FROM authors GROUP BY country;", "国ごとの著者の数"],
        ["SELECT book_id, SUM(qty) FROM orders GROUP BY book_id;", "本ごとの注文冊数"],
        ["SELECT author_id, AVG(price) FROM books GROUP BY author_id;", "著者ごとの平均の値段(NULL のグループもできる)"]
      ]
    },
    {
      id: "group-select", name: "SELECT に書ける列", read: "グループ化のルール",
      desc: "GROUP BY を使うとき、SELECT に書けるのは「GROUP BY に書いた列」と「集計関数」だけです。1つのグループに値がいくつもある列(例: 著者ごとにまとめたときの title)は、どれを出せばよいか決まらないからです。",
      examples: [
        ["SELECT author_id, COUNT(*) FROM books GROUP BY author_id;", "正しい"],
        ["SELECT title, COUNT(*) FROM books GROUP BY author_id;", "誤り: title は1つに決まらない"]
      ],
      notes: ["SQLite(と設定によっては MySQL)はこの誤りをエラーにせず、グループの中のどれかの値を出します。PostgreSQL や標準SQLではエラーです。どの DB でも、このルールを守って書きます。"]
    },
    {
      id: "group-order", name: "書く順番と実行の順番", read: "WHERE → GROUP BY → ORDER BY",
      desc: "書く順番は `SELECT … FROM … WHERE … GROUP BY … ORDER BY … LIMIT …` です。処理は、WHERE で行をしぼる → GROUP BY でまとめて集計する → ORDER BY で並べる → LIMIT で件数をしぼる、の順に進みます。",
      examples: [
        ["SELECT book_id, SUM(qty) FROM orders\nWHERE order_date >= '2024-04-03'\nGROUP BY book_id\nORDER BY SUM(qty) DESC;", "4月3日以降の注文を、本ごとに合計して多い順"]
      ],
      notes: [
        "グループごとの順番も決まっていないので、並べたいときは ORDER BY を書きます。",
        "集計した結果でしぼる HAVING はこの道場の範囲外です。"
      ]
    }
  ],
  questions: [
    {
      id: "g01", q: "このSQLの結果は?", tables: ["authors"], kind: "result",
      sql: "SELECT country, COUNT(*) FROM authors GROUP BY country ORDER BY COUNT(*) DESC;",
      choices: [
        "country | COUNT(*)\n日本 | 3\nイギリス | 2\nアメリカ | 1",
        "country | COUNT(*)\nアメリカ | 1\nイギリス | 2\n日本 | 3",
        "country | COUNT(*)\n日本 | 1\nイギリス | 1\nアメリカ | 1",
        "country | COUNT(*)\n日本 | 6"
      ],
      explain: "国ごとにまとめて行を数え、数の多い順に並べます。日本(青木・佐藤・中村)3人、イギリス(Brown・Smith)2人、アメリカ(Miller)1人です。",
      ref: "group-by"
    },
    {
      id: "g02", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT author_id, SUM(price) FROM books WHERE author_id IN (1, 3) GROUP BY author_id ORDER BY author_id;",
      choices: [
        "author_id | SUM(price)\n1 | 2700\n3 | 900",
        "author_id | SUM(price)\n1 | 2700\n3 | NULL",
        "author_id | SUM(price)\n1 | 2\n3 | 2",
        "author_id | SUM(price)\n1 | 3600"
      ],
      explain: "著者1は 1200 + 1500 = 2700。著者3は 900 と NULL で、SUM は NULL を無視するので 900 です。",
      ref: "group-by"
    },
    {
      id: "g03", q: "このSQLの結果は?", tables: ["orders"], kind: "result",
      sql: "SELECT book_id, SUM(qty) FROM orders GROUP BY book_id ORDER BY SUM(qty) DESC LIMIT 2;",
      choices: [
        "book_id | SUM(qty)\n3 | 5\n5 | 4",
        "book_id | SUM(qty)\n5 | 4\n3 | 4",
        "book_id | SUM(qty)\n1 | 3\n3 | 5",
        "book_id | SUM(qty)\n1 | 2\n3 | 2"
      ],
      explain: "本ごとの合計は、本3: 1+4=5、本5: 4、本1: 2+1=3、本8: 2、本2: 1。多い順の先頭2行です。",
      ref: "group-order"
    },
    {
      id: "g04", q: "このSQLの結果は、何行?", tables: ["orders"], kind: "text",
      sql: "SELECT order_date, COUNT(*) FROM orders GROUP BY order_date;",
      choices: ["5行", "7行", "2行", "1行"],
      explain: "注文日は 04-01・04-02・04-03・04-05・04-06 の5種類。グループ1つにつき1行なので5行です。",
      ref: "group-by"
    },
    {
      id: "g05", q: "国ごとに著者の数を数えます。空欄に入るのは?", tables: ["authors"], kind: "code",
      sql: "SELECT country, COUNT(*) FROM authors ____ country;",
      choices: ["GROUP BY", "ORDER BY", "GROUP", "SORT BY"],
      expect: "country | COUNT(*)\n日本 | 3\nイギリス | 2\nアメリカ | 1",
      explain: "`GROUP BY country` で国ごとのグループにし、`COUNT(*)` がグループごとに数えます。`ORDER BY` は並べ替えるだけで、まとめません。",
      ref: "group-by"
    },
    {
      id: "g06", q: "著者(author_id)ごとに、本の冊数を出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT author_id, ____ FROM books GROUP BY author_id;",
      choices: ["COUNT(*)", "SUM(*)", "COUNT", "title"],
      accepts: ["COUNT(id)", "COUNT(title)", "COUNT(year)"],
      expect: "author_id | COUNT(*)\n1 | 2\n2 | 1\n3 | 2\n4 | 1\n5 | 1\nNULL | 1",
      explain: "グループごとの行の数は `COUNT(*)` です。author_id が NULL の 古い地図 も、NULL というグループになって1と数えられます。NULL のない列を数える `COUNT(id)` なども同じ結果ですが、`COUNT(price)` だと NULL の行を数えないので変わります。",
      ref: "group-by"
    },
    {
      id: "g07", q: "著者ごとの平均の値段を出します。SELECT に書ける列として正しいのは?", tables: ["books"], kind: "code",
      sql: "SELECT ____, AVG(price) FROM books GROUP BY author_id;",
      choices: ["author_id", "title", "price", "id"],
      expect: "author_id | AVG(price)\n1 | 1350\n2 | 800\n3 | 900\n4 | 2200\n5 | 1200\nNULL | 600",
      explain: "GROUP BY のときに SELECT に書けるのは、GROUP BY の列と集計関数だけです。title・price・id は1つのグループに複数あるので、標準SQLではエラーになります。",
      ref: "group-select"
    },
    {
      id: "g08", q: "本ごとに、1回の注文でいちばん多い冊数を出します。空欄に入るのは?", tables: ["orders"], kind: "code",
      sql: "SELECT book_id, ____(qty) FROM orders GROUP BY book_id;",
      choices: ["MAX", "COUNT", "SUM", "TOP"],
      expect: "book_id | MAX(qty)\n1 | 2\n2 | 1\n3 | 4\n5 | 4\n8 | 2",
      explain: "グループの中の最大は `MAX`。`SUM` だと注文冊数の合計になります。",
      ref: "group-by"
    },
    {
      id: "g09", q: "このSQLは、標準SQL(PostgreSQL など)ではエラーになります。原因は?", tables: ["books"], kind: "text",
      sql: "SELECT title, COUNT(*) FROM books GROUP BY author_id;",
      choices: [
        "title が GROUP BY にも集計関数にも入っていない",
        "COUNT(*) は GROUP BY と一緒に使えない",
        "GROUP BY は FROM より前に書く",
        "author_id を SELECT に書いていない"
      ],
      explain: "著者1のグループには 星の旅 と 森の朝 があり、title が1つに決まりません。GROUP BY した列を SELECT に書かないこと自体は問題ありません。SQLite はエラーにしませんが、どれかの title が出るだけなので頼れません。",
      ref: "group-select"
    },
    {
      id: "g10", q: "books を GROUP BY author_id でまとめると、何グループ(何行)になる?", tables: ["books"], kind: "text",
      choices: ["6行", "5行", "8行", "1行"],
      explain: "author_id は 1・2・3・4・5 と NULL。NULL の行も1つのグループになるので6行です。",
      ref: "group-by"
    },
    {
      id: "g11", q: "WHERE と GROUP BY を両方書いたとき、処理の順番は?", tables: [], kind: "text",
      choices: [
        "WHERE で行をしぼってから、GROUP BY でまとめる",
        "GROUP BY でまとめてから、WHERE でグループをしぼる",
        "WHERE と GROUP BY は同時に処理される",
        "GROUP BY を使うときは WHERE を書けない"
      ],
      explain: "WHERE は1行ずつ見てしぼり、残った行を GROUP BY でまとめます。そのため WHERE の中では COUNT などの集計関数は使えません。",
      ref: "group-order"
    },
    {
      id: "g12", q: "この結果を出すSQLは?", tables: ["orders"], kind: "sql",
      result: "book_id | total\n1 | 3\n3 | 5",
      choices: [
        "SELECT book_id, SUM(qty) AS total FROM orders WHERE book_id IN (1, 3) GROUP BY book_id ORDER BY book_id;",
        "SELECT book_id, COUNT(*) AS total FROM orders WHERE book_id IN (1, 3) GROUP BY book_id ORDER BY book_id;",
        "SELECT book_id, SUM(qty) AS total FROM orders WHERE book_id IN (1, 3) ORDER BY book_id;",
        "SELECT book_id, MAX(qty) AS total FROM orders WHERE book_id IN (1, 3) GROUP BY book_id ORDER BY book_id;"
      ],
      explain: "本1は 2+1=3 冊、本3は 1+4=5 冊で、qty の合計です。COUNT(*) だと注文の回数(2 と 2)、GROUP BY がないと全体で1行になってしまいます。",
      ref: "group-by"
    },
    {
      id: "g13", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT author_id, COUNT(*), COUNT(price) FROM books WHERE author_id = 3 GROUP BY author_id;",
      choices: [
        "author_id | COUNT(*) | COUNT(price)\n3 | 2 | 1",
        "author_id | COUNT(*) | COUNT(price)\n3 | 2 | 2",
        "author_id | COUNT(*) | COUNT(price)\n3 | 1 | 1",
        "author_id | COUNT(*) | COUNT(price)\n3 | 2 | 900"
      ],
      explain: "著者3の本は2冊(夜の街・星の庭)。`COUNT(price)` は price が NULL の 星の庭 を数えないので1です。",
      ref: "group-by"
    },
    {
      id: "g14", q: "著者ごとに本の冊数を数えます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT author_id, COUNT(*) FROM books GROUP BY ____;",
      choices: ["author_id", "title", "COUNT(*)", "id"],
      expect: "author_id | COUNT(*)\n1 | 2\n2 | 1\n3 | 2\n4 | 1\n5 | 1\nNULL | 1",
      explain: "「著者ごと」なので author_id でまとめます。title や id でまとめると、どの本も1冊ずつのグループになってしまいます。集計関数で GROUP BY はできません。",
      ref: "group-by"
    },
    {
      id: "g15", q: "本ごとの注文冊数の合計を、多い順に並べます。空欄に入るのは?", tables: ["orders"], kind: "code",
      sql: "SELECT book_id, SUM(qty) FROM orders GROUP BY book_id ORDER BY ____ DESC;",
      choices: ["SUM(qty)", "qty", "book_id", "COUNT(*)"],
      accepts: ["2"],
      expect: "book_id | SUM(qty)\n3 | 5\n5 | 4\n1 | 3\n8 | 2\n2 | 1",
      explain: "グループごとの合計で並べるので `SUM(qty)` です。ORDER BY でも集計関数を使えます。SELECT で `AS total` と別名をつけていれば `ORDER BY total DESC` とも書けます。SELECT の2番目の列という意味で `ORDER BY 2 DESC` とも書けますが、列を足すとずれるので名前で書くほうが安全です。",
      ref: "group-order"
    }
  ]
});


// =====================================================================
// 06 表の結合
// =====================================================================
SQLD.register("join", {
  cards: [
    {
      id: "inner-join", name: "INNER JOIN … ON", read: "両方にある行をつなぐ",
      desc: "2つの表を、`ON` に書いた条件でつなぎます。`INNER JOIN` は、相手の表に条件に合う行がある行だけを残します。`INNER` は省略して `JOIN` と書けます。",
      examples: [
        ["SELECT b.title, a.name\nFROM books AS b\nINNER JOIN authors AS a ON b.author_id = a.id;", "著者のわかる本7冊(古い地図 は出ない)"]
      ],
      notes: ["相手が複数あれば、その数だけ行が増えます(著者1は本が2冊あるので2行)。"]
    },
    {
      id: "left-join", name: "LEFT JOIN … ON", read: "左の表をすべて残す",
      desc: "`FROM` に書いた左の表の行をすべて残し、右の表に合う行がなければ、右の表の列を NULL にします。`LEFT OUTER JOIN` とも書きます。",
      examples: [
        ["SELECT b.title, a.name\nFROM books AS b\nLEFT JOIN authors AS a ON b.author_id = a.id;", "8冊すべて。古い地図 の name は NULL"],
        ["SELECT a.name, b.title\nFROM authors AS a\nLEFT JOIN books AS b ON a.id = b.author_id\nWHERE b.id IS NULL;", "本を書いていない著者(中村)"]
      ],
      notes: ["どちらの表を左(FROM の直後)に書くかで、結果が変わります。"]
    },
    {
      id: "table-alias", name: "表の別名", read: "books AS b",
      desc: "`FROM books AS b` のように、表に短い別名をつけられます。別名をつけたら、その文の中では別名で呼びます(`books.title` ではなく `b.title`)。",
      examples: [
        ["SELECT b.title FROM books AS b;", "b は books の別名"],
        ["SELECT b.title FROM books b;", "AS は省略してもよい"]
      ],
      notes: ["Oracle Database では、表の別名に AS を書けません(この道場では SQLite・MySQL・PostgreSQL を前提にしています)。"]
    },
    {
      id: "qualified", name: "表名.列名", read: "どの表の列か",
      desc: "結合すると、id のように両方の表にある列名が出てきます。`b.id` `a.id` のように表名(別名)をつけて、どちらの列かを示します。どちらか一方にしかない列は省略できますが、つけておくと読みやすくなります。",
      examples: [
        ["SELECT b.id, b.title, a.name\nFROM books AS b\nINNER JOIN authors AS a ON b.author_id = a.id;", "b.id は本の id"]
      ],
      notes: ["両方にある列を表名なしで書くと「あいまい(ambiguous)」というエラーになります。"]
    },
    {
      id: "multi-join", name: "3つの表をつなぐ", read: "JOIN を続ける",
      desc: "`JOIN … ON …` を続けて書くと、3つ以上の表をつなげます。前からつないだ結果に、次の表をつなぎます。",
      examples: [
        ["SELECT o.id, b.title, a.name\nFROM orders AS o\nINNER JOIN books AS b ON o.book_id = b.id\nINNER JOIN authors AS a ON b.author_id = a.id;", "注文・本・著者をつなぐ"]
      ]
    }
  ],
  questions: [
    {
      id: "j01", q: "このSQLの結果は?", tables: ["books", "authors"], kind: "result",
      sql: "SELECT b.title, a.name\nFROM books AS b\nINNER JOIN authors AS a ON b.author_id = a.id\nWHERE a.country = 'イギリス';",
      choices: [
        "title | name\n海の歌 | Brown\n風と石 | Smith",
        "title | name\n海の歌 | Brown",
        "title | name\n海の歌 | Brown\n風と石 | Smith\n古い地図 | NULL",
        "title | name\n海の歌 | Smith\n風と石 | Brown"
      ],
      explain: "イギリスの著者は Brown(2)と Smith(4)。本の author_id が 2 なのは 海の歌、4 なのは 風と石 です。",
      ref: "inner-join"
    },
    {
      id: "j02", q: "このSQLの結果は、何行?", tables: ["books", "authors"], kind: "text",
      sql: "SELECT b.title, a.name\nFROM books AS b\nINNER JOIN authors AS a ON b.author_id = a.id;",
      choices: ["7行", "8行", "6行", "48行"],
      explain: "author_id が NULL の 古い地図 は、合う著者がいないので消えます。8 − 1 = 7行。48 は条件なしで全部の組み合わせ(8 × 6)をつくったときの数です。",
      ref: "inner-join"
    },
    {
      id: "j03", q: "このSQLの結果は、何行?", tables: ["books", "authors"], kind: "text",
      sql: "SELECT b.title, a.name\nFROM books AS b\nLEFT JOIN authors AS a ON b.author_id = a.id;",
      choices: ["8行", "7行", "6行", "9行"],
      explain: "`LEFT JOIN` は左の books の行をすべて残します。どの本にも著者は1人までなので、ちょうど8行。古い地図 の name は NULL です。",
      ref: "left-join"
    },
    {
      id: "j04", q: "このSQLの結果は?", tables: ["authors", "books"], kind: "result",
      sql: "SELECT a.name, b.title\nFROM authors AS a\nLEFT JOIN books AS b ON a.id = b.author_id\nWHERE a.id >= 5;",
      choices: [
        "name | title\nMiller | 青い鳥\n中村 | NULL",
        "name | title\nMiller | 青い鳥",
        "name | title\nMiller | 青い鳥\n中村 | 古い地図",
        "name | title\n中村 | NULL"
      ],
      explain: "Miller(5)は 青い鳥 を書いています。中村(6)の本はないので、`LEFT JOIN` で title が NULL の行として残ります。",
      ref: "left-join"
    },
    {
      id: "j05", q: "このSQLの結果は?", tables: ["books", "orders"], kind: "result",
      sql: "SELECT b.title, o.qty\nFROM books AS b\nLEFT JOIN orders AS o ON b.id = o.book_id\nWHERE b.id IN (3, 4);",
      choices: [
        "title | qty\n森の朝 | 1\n森の朝 | 4\n夜の街 | NULL",
        "title | qty\n森の朝 | 1\n森の朝 | 4",
        "title | qty\n森の朝 | 5\n夜の街 | NULL",
        "title | qty\n森の朝 | 1\n夜の街 | NULL"
      ],
      explain: "森の朝(3)には注文が2件あるので2行になります。夜の街(4)には注文がないので、qty が NULL の1行です。結合では合計はされません。",
      ref: "left-join"
    },
    {
      id: "j06", q: "著者のわかる本だけを、著者名と一緒に出します(著者のいない本は出さない)。空欄に入るのは?", tables: ["books", "authors"], kind: "code",
      sql: "SELECT b.title, a.name\nFROM books AS b\n____ authors AS a ON b.author_id = a.id;",
      choices: ["INNER JOIN", "LEFT JOIN", "UNION", "WITH"],
      accepts: ["JOIN"],
      expect: "title | name\n星の旅 | 青木\n海の歌 | Brown\n森の朝 | 青木\n夜の街 | 佐藤\n風と石 | Smith\n星の庭 | 佐藤\n青い鳥 | Miller",
      explain: "両方の表に合う行だけを残すのが `INNER JOIN`(`JOIN` だけでも同じ)。`LEFT JOIN` だと、著者のいない 古い地図 も NULL つきで残ります。",
      ref: "inner-join"
    },
    {
      id: "j07", q: "結合の条件を書く語を入れます。空欄に入るのは?", tables: ["books", "authors"], kind: "code",
      sql: "SELECT b.title, a.name\nFROM books AS b\nLEFT JOIN authors AS a ____ b.author_id = a.id;",
      choices: ["ON", "WHERE", "BY", "IF"],
      expect: "title | name\n星の旅 | 青木\n海の歌 | Brown\n森の朝 | 青木\n夜の街 | 佐藤\n風と石 | Smith\n星の庭 | 佐藤\n古い地図 | NULL\n青い鳥 | Miller",
      explain: "どの行とどの行をつなぐかは `ON` のあとに書きます。WHERE は、つないだあとの行をしぼる語です。",
      ref: "inner-join"
    },
    {
      id: "j08", q: "すべての本を出し、著者がいなければ name を NULL にします。空欄に入るのは?", tables: ["books", "authors"], kind: "code",
      sql: "SELECT b.title, a.name\nFROM books AS b\n____ authors AS a ON b.author_id = a.id;",
      choices: ["LEFT JOIN", "INNER JOIN", "UNION", "FULL"],
      accepts: ["LEFT OUTER JOIN"],
      expect: "title | name\n星の旅 | 青木\n海の歌 | Brown\n森の朝 | 青木\n夜の街 | 佐藤\n風と石 | Smith\n星の庭 | 佐藤\n古い地図 | NULL\n青い鳥 | Miller",
      explain: "左の表(books)をすべて残すのは `LEFT JOIN` です。古い地図 は合う著者がいないので、name が NULL になります。",
      ref: "left-join"
    },
    {
      id: "j09", q: "books に b という別名をつけています。空欄に入るのは?", tables: ["books", "authors"], kind: "code",
      sql: "SELECT ____.title, a.name\nFROM books AS b\nINNER JOIN authors AS a ON b.author_id = a.id;",
      choices: ["b", "books", "a", "authors"],
      explain: "別名をつけたら、その文の中では別名で呼びます。`books.title` と書くとエラーになる DB がほとんどです。title は books の列なので `a` ではありません。",
      ref: "table-alias"
    },
    {
      id: "j10", q: "books に b という別名をつけます。空欄に入るのは?", tables: ["books", "authors"], kind: "code",
      sql: "SELECT b.title, a.name\nFROM books ____ b\nINNER JOIN authors AS a ON b.author_id = a.id;",
      choices: ["AS", "ON", "IS", "TO"],
      explain: "`表 AS 別名` で表に別名をつけます。表の別名の `AS` は省略もできます(`FROM books b`)。",
      ref: "table-alias"
    },
    {
      id: "j11", q: "このSQLはエラーになります。原因は?", tables: ["books", "authors"], kind: "text",
      sql: "SELECT id, title, name\nFROM books\nINNER JOIN authors ON books.author_id = authors.id;",
      choices: [
        "id が books と authors の両方にあり、どちらの id かわからない",
        "INNER JOIN のときは WHERE も必要",
        "ON の左右を逆にしなければならない",
        "title と name は同じ表の列でなければならない"
      ],
      explain: "両方の表にある列は、`books.id` のように表名をつけないと「あいまい(ambiguous)」というエラーになります。title と name はそれぞれ片方にしかないので、そのままで大丈夫です。",
      ref: "qualified"
    },
    {
      id: "j12", q: "LEFT JOIN で、右の表に合う行がないとき、右の表の列はどうなる?", tables: [], kind: "text",
      choices: ["NULL になる", "0 になる", "その行ごと結果から消える", "直前の行と同じ値が入る"],
      explain: "左の行は残り、右の表の列は NULL で埋められます。行ごと消えるのは INNER JOIN のときです。",
      ref: "left-join"
    },
    {
      id: "j13", q: "どの本も書いていない著者を探します。この結果を出すSQLは?", tables: ["authors", "books"], kind: "sql",
      result: "name | title\n中村 | NULL",
      choices: [
        "SELECT a.name, b.title FROM authors AS a LEFT JOIN books AS b ON a.id = b.author_id WHERE b.id IS NULL;",
        "SELECT a.name, b.title FROM authors AS a INNER JOIN books AS b ON a.id = b.author_id WHERE b.id IS NULL;",
        "SELECT a.name, b.title FROM authors AS a LEFT JOIN books AS b ON a.id = b.author_id WHERE b.id = NULL;",
        "SELECT a.name, b.title FROM books AS b LEFT JOIN authors AS a ON a.id = b.author_id WHERE a.id IS NULL;"
      ],
      explain: "authors を左にして `LEFT JOIN` すると、本のない著者は b の列が NULL の行で残ります。それを `IS NULL` で選びます。INNER JOIN では残らず、`= NULL` では何も選ばれません。最後の文は「著者のいない本」(古い地図)を探す文です。",
      ref: "left-join"
    },
    {
      id: "j14", q: "このSQLの結果は?", tables: ["orders", "books", "authors"], kind: "result",
      sql: "SELECT a.name, o.qty\nFROM orders AS o\nINNER JOIN books AS b ON o.book_id = b.id\nINNER JOIN authors AS a ON b.author_id = a.id\nWHERE o.order_date = '2024-04-03';",
      choices: [
        "name | qty\nSmith | 4\nBrown | 1",
        "name | qty\nBrown | 4\nSmith | 1",
        "name | qty\nSmith | 5",
        "name | qty\nSmith | 4"
      ],
      explain: "4月3日の注文は、本5(風と石、著者 Smith)が4冊と、本2(海の歌、著者 Brown)が1冊です。",
      ref: "multi-join"
    },
    {
      id: "j15", q: "本と、その本の注文をつなぎます。空欄に入るのは?", tables: ["books", "orders"], kind: "code",
      sql: "SELECT b.title, o.qty\nFROM books AS b\nINNER JOIN orders AS o ON b.id = ____;",
      choices: ["o.book_id", "o.id", "b.book_id", "o.qty"],
      accepts: ["book_id"],
      expect: "title | qty\n星の旅 | 2\n森の朝 | 1\n星の旅 | 1\n風と石 | 4\n海の歌 | 1\n青い鳥 | 2\n森の朝 | 4",
      explain: "注文がどの本かは orders の book_id に入っています。`o.id` は注文の番号なので、本の id とつないでも意味がありません。",
      ref: "qualified"
    }
  ]
});


// =====================================================================
// 07 データの変更
// =====================================================================
SQLD.register("modify", {
  cards: [
    {
      id: "insert", name: "INSERT INTO … VALUES", read: "行を追加する",
      desc: "表に行を追加します。列名を並べ、同じ順番で値を書きます。列と値の数はそろえます。書かなかった列は NULL(または決められた既定値)になります。",
      examples: [
        ["INSERT INTO authors (id, name, country)\nVALUES (7, '森', '日本');", "著者を1人追加"],
        ["INSERT INTO books (id, title, author_id, price, year)\nVALUES (9, '雪の夜', 6, NULL, 2023);", "値段が未定の本"]
      ],
      notes: ["列名を省いて `INSERT INTO authors VALUES (…)` とも書けますが、表のすべての列を定義の順に書く必要があり、まちがえやすいので列名を書きます。"]
    },
    {
      id: "update", name: "UPDATE … SET … WHERE", read: "値を書き換える",
      desc: "WHERE に合う行の値を書き換えます。`SET 列 = 値` をカンマで並べると、いくつかの列を一度に変えられます。今の値を使った計算もできます。",
      examples: [
        ["UPDATE books SET price = 1000 WHERE id = 2;", "本2の値段を1000に"],
        ["UPDATE books SET price = price + 100 WHERE year >= 2020;", "2020年以降の本を100円上げる"]
      ]
    },
    {
      id: "delete", name: "DELETE FROM … WHERE", read: "行を消す",
      desc: "WHERE に合う行を消します。表そのものは残ります。表ごと消すのは `DROP TABLE` です。",
      examples: [
        ["DELETE FROM orders WHERE id = 3;", "注文3を消す"],
        ["DELETE FROM orders WHERE qty = 1;", "qty が1の注文をすべて消す"]
      ]
    },
    {
      id: "where-danger", name: "WHERE を忘れると", read: "全行が対象",
      desc: "UPDATE と DELETE で WHERE を書き忘れると、表のすべての行が書き換わったり消えたりします。SQL の文としてはエラーになりません。",
      examples: [
        ["UPDATE books SET price = 1000;", "8冊すべての値段が1000になる"],
        ["DELETE FROM orders;", "注文がすべて消える(表は残る)"],
        ["SELECT * FROM orders WHERE qty = 1;", "消す前に、同じ WHERE で SELECT して確かめる"]
      ],
      notes: [
        "実行する前に、同じ WHERE で SELECT して対象の行を確かめる習慣をつけると安全です。",
        "SQL としてはエラーになりませんが、MySQL Workbench は初期設定(safe update mode)で、キーの列を使った WHERE のない UPDATE・DELETE を止めることがあります。"
      ]
    }
  ],
  questions: [
    {
      id: "m01", q: "この2つの文を順に実行したあとの、SELECT の結果は?", tables: ["books"], kind: "result",
      sql: "UPDATE books SET price = 1000 WHERE author_id = 1;\nSELECT title, price FROM books WHERE author_id = 1;",
      choices: [
        "title | price\n星の旅 | 1000\n森の朝 | 1000",
        "title | price\n星の旅 | 1200\n森の朝 | 1500",
        "title | price\n星の旅 | 1000\n森の朝 | 1500",
        "title | price\n星の旅 | 2200\n森の朝 | 2500"
      ],
      explain: "WHERE に合う行がすべて書き換わります。著者1の本は2冊なので、どちらも1000になります。",
      ref: "update"
    },
    {
      id: "m02", q: "DELETE FROM orders; を実行すると、どうなる?", tables: ["orders"], kind: "text",
      choices: [
        "orders のすべての行が消える(表そのものは残る)",
        "表 orders そのものが消える",
        "WHERE がないので、何も消えない",
        "最後に追加した1行だけが消える"
      ],
      explain: "WHERE がない DELETE は、すべての行が対象です。エラーにはなりません。表を消すのは `DROP TABLE orders;` です。",
      ref: "where-danger"
    },
    {
      id: "m03", q: "この2つの文を順に実行したあとの、SELECT の結果は?", tables: ["orders"], kind: "result",
      sql: "DELETE FROM orders WHERE qty = 1;\nSELECT COUNT(*) FROM orders;",
      choices: ["COUNT(*)\n4", "COUNT(*)\n3", "COUNT(*)\n7", "COUNT(*)\n0"],
      explain: "qty が1の注文は id 2・3・5 の3件。7件から3件消えて、4件が残ります。",
      ref: "delete"
    },
    {
      id: "m04", q: "この2つの文を順に実行したあとの、SELECT の結果は?", tables: ["books"], kind: "result",
      sql: "UPDATE books SET price = price + 100 WHERE year >= 2020;\nSELECT SUM(price) FROM books;",
      choices: ["SUM(price)\n8600", "SUM(price)\n8400", "SUM(price)\n8500", "SUM(price)\n9100"],
      explain: "2020年以降は 森の朝(2020)と 風と石(2021)の2冊で、合わせて200円増えます。8400 + 200 = 8600。",
      ref: "update"
    },
    {
      id: "m05", q: "authors に行を追加します。空欄に入るのは?", tables: ["authors"], kind: "code",
      sql: "____ INTO authors (id, name, country) VALUES (7, '森', '日本');",
      choices: ["INSERT", "ADD", "PUT", "UPDATE"],
      explain: "行の追加は `INSERT INTO 表 (列, …) VALUES (値, …)` です。UPDATE は、すでにある行の書き換えです。",
      ref: "insert"
    },
    {
      id: "m06", q: "追加する値を並べます。空欄に入るのは?", tables: ["authors"], kind: "code",
      sql: "INSERT INTO authors (id, name, country) ____ (7, '森', '日本');",
      choices: ["VALUES", "WITH", "SET", "DATA"],
      explain: "値は `VALUES ( … )` に、列名と同じ順番で書きます。`SET` は UPDATE で使う語です。",
      ref: "insert"
    },
    {
      id: "m07", q: "id が 2 の本の値段を 1000 に書き換えます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "UPDATE books ____ price = 1000 WHERE id = 2;",
      choices: ["SET", "TO", "VALUES", "CHANGE"],
      explain: "`UPDATE 表 SET 列 = 値 WHERE 条件` の形です。",
      ref: "update"
    },
    {
      id: "m08", q: "注文3を消します。空欄に入るのは?", tables: ["orders"], kind: "code",
      sql: "____ FROM orders WHERE id = 3;",
      choices: ["DELETE", "DROP", "REMOVE", "ERASE"],
      explain: "行を消すのは `DELETE FROM`。`DROP` は `DROP TABLE` のように表そのものを消すときに使います。",
      ref: "delete"
    },
    {
      id: "m09", q: "id が 2 の本だけを書き換えます(忘れるとすべての本が変わります)。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "UPDATE books SET price = 1000 ____ id = 2;",
      choices: ["WHERE", "IF", "ON", "FOR"],
      explain: "書き換える行は `WHERE` でしぼります。WHERE がないと、表のすべての行が対象になります。",
      ref: "where-danger"
    },
    {
      id: "m10", q: "値段がまだ決まっていない本を追加します。price を「値がない」状態にするとき、空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "INSERT INTO books (id, title, author_id, price, year)\nVALUES (9, '雪の夜', 6, ____, 2023);",
      choices: ["NULL", "''", "0", "'NULL'"],
      explain: "値がないことは `NULL`(引用符なし)で表します。`'NULL'` は NULL という4文字の文字列、`0` は0円という値、`''` は空の文字列で、どれも「値がない」とは別物です。",
      ref: "insert"
    },
    {
      id: "m11", q: "id が 2 の本だけ値段を変えたくて、このSQLを実行しました。どうなる?", tables: ["books"], kind: "text",
      sql: "UPDATE books SET price = 1000;",
      choices: [
        "WHERE がないので、すべての本の値段が1000になる",
        "WHERE がないので、エラーになって何も変わらない",
        "最初の1行(id 1)だけが変わる",
        "price が NULL の本だけが変わる"
      ],
      explain: "WHERE を書かない UPDATE は、全行が対象です。エラーにはならないので気づきにくく、とても危険です。",
      ref: "where-danger"
    },
    {
      id: "m12", q: "この2つの文を順に実行したあとの、SELECT の結果は?", tables: ["orders"], kind: "result",
      sql: "INSERT INTO orders (id, book_id, qty, order_date)\nVALUES (8, 4, 3, '2024-04-07');\nSELECT COUNT(*), SUM(qty) FROM orders;",
      choices: [
        "COUNT(*) | SUM(qty)\n8 | 18",
        "COUNT(*) | SUM(qty)\n7 | 15",
        "COUNT(*) | SUM(qty)\n8 | 15",
        "COUNT(*) | SUM(qty)\n8 | 3"
      ],
      explain: "1行増えて8件、qty の合計は 15 + 3 = 18 です。",
      ref: "insert"
    },
    {
      id: "m13", q: "このSQLはエラーになります。原因は?", tables: ["authors"], kind: "text",
      sql: "INSERT INTO authors (id, name) VALUES (7, '森', '日本');",
      choices: [
        "列は2つなのに、値が3つある",
        "文字列はダブルクォートで囲む",
        "INSERT には WHERE が必要",
        "id の値は書いてはいけない"
      ],
      explain: "( ) に並べた列と、VALUES の値は、数も順番もそろえます。country も入れるなら `(id, name, country)` と書きます。",
      ref: "insert"
    },
    {
      id: "m14", q: "DELETE FROM books; と DROP TABLE books; の違いは?", tables: [], kind: "text",
      choices: [
        "DELETE は行をすべて消して表は残し、DROP TABLE は表そのものを消す",
        "DELETE は表そのものを消し、DROP TABLE は行だけを消す",
        "どちらも同じ働きをする",
        "DELETE は1行ずつしか消せない"
      ],
      explain: "DELETE のあとも、空になった books 表は残っていて INSERT できます。DROP TABLE のあとは表がないので、CREATE TABLE から作り直しです。",
      ref: "delete"
    },
    {
      id: "m15", q: "この2つの文を順に実行したあとの、SELECT の結果は?", tables: ["books"], kind: "result",
      sql: "DELETE FROM books WHERE price < 1000;\nSELECT COUNT(*) FROM books;",
      choices: ["COUNT(*)\n5", "COUNT(*)\n4", "COUNT(*)\n3", "COUNT(*)\n8"],
      explain: "1000円未満は 海の歌(800)・夜の街(900)・古い地図(600)の3冊。price が NULL の 星の庭 は条件が「不明」なので消えません。8 − 3 = 5。",
      ref: "delete"
    }
  ]
});


// =====================================================================
// 08 NULLとテーブル作成
// =====================================================================
SQLD.register("null-table", {
  cards: [
    {
      id: "is-null", name: "IS NULL / IS NOT NULL", read: "NULL かどうか",
      desc: "NULL は「値がない・わからない」を表す特別な印です。NULL かどうかは `IS NULL` / `IS NOT NULL` で調べます。`= NULL` では調べられません。",
      examples: [
        ["SELECT title FROM books WHERE price IS NULL;", "星の庭"],
        ["SELECT title FROM books WHERE author_id IS NOT NULL;", "著者のわかる7冊"]
      ],
      notes: ["`price = NULL` はエラーにはなりませんが、どの行でも「不明」になるので、1行も選ばれません。"]
    },
    {
      id: "null-logic", name: "NULL と比較・計算・集計", read: "NULL のふるまい",
      desc: "NULL と比べると、結果は真でも偽でもない「不明」になり、WHERE では選ばれません。NULL を含む計算(`NULL + 100` など)の結果も NULL です。集計関数は NULL を無視します(COUNT(*) だけは行を数える)。",
      examples: [
        ["SELECT COUNT(*) FROM books WHERE price > 1000 OR price <= 1000;", "7(NULL の行はどちらにも入らない)"],
        ["SELECT COUNT(*), COUNT(price), AVG(price) FROM books;", "8 | 7 | 1200"]
      ],
      options: [
        ["NULL = NULL", "不明(真ではない)"],
        ["NULL + 100", "NULL"],
        ["COUNT(price)", "NULL の行を数えない"],
        ["SUM / AVG / MAX / MIN", "NULL を無視して計算"]
      ]
    },
    {
      id: "create-table", name: "CREATE TABLE", read: "表を作る",
      desc: "`CREATE TABLE 表名 ( 列名 型 制約, … );` で新しい表を作ります。列はカンマで区切り、最後の列のあとにはカンマをつけません。表を消すのは `DROP TABLE 表名;` です。",
      examples: [
        ["CREATE TABLE magazines (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  price INTEGER\n);", "雑誌の表を作る"],
        ["DROP TABLE magazines;", "表を中身ごと消す"]
      ]
    },
    {
      id: "types", name: "型", read: "INTEGER · TEXT など",
      desc: "列ごとに、入れる値の種類(型)を決めます。",
      examples: [
        ["CREATE TABLE notes (\n  id INTEGER,\n  body TEXT,\n  rate REAL\n);", "整数・文字列・小数"]
      ],
      options: [
        ["INTEGER", "整数"],
        ["TEXT", "文字列(長さを決めない)"],
        ["VARCHAR(n)", "最大 n 文字の文字列"],
        ["REAL", "小数(浮動小数点数)"],
        ["DATE", "日付(SQLite には日付の型がなく、'2024-04-01' のような TEXT で入れることが多い)"]
      ],
      notes: ["SQLite は型の決まりがゆるく、INTEGER の列に文字列も入ってしまいます。MySQL や PostgreSQL は型に合わない値をエラーにします(または変換します)。"]
    },
    {
      id: "constraints", name: "PRIMARY KEY / NOT NULL", read: "制約",
      desc: "`PRIMARY KEY`(主キー)は、行を1つに決める列につけます。値が重ならず、NULL にもできません。`NOT NULL` は、その列を NULL にできなくします。決まりに合わない INSERT や UPDATE はエラーになります。",
      examples: [
        ["CREATE TABLE magazines (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);", "id が主キー、name は必ず入れる"],
        ["INSERT INTO magazines (id, name) VALUES (1, NULL);", "エラー: name は NOT NULL"]
      ],
      notes: ["SQLite では、INTEGER PRIMARY KEY の列に NULL を入れると自動で番号がつきます。また古い仕様のため、INTEGER 以外の PRIMARY KEY には NULL が入ってしまうことがあります。"]
    }
  ],
  questions: [
    {
      id: "n01", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books WHERE price IS NULL;",
      choices: [
        "title\n星の庭",
        "title",
        "title\n古い地図",
        "title\n星の庭\n古い地図"
      ],
      explain: "price が NULL なのは 星の庭 だけです。古い地図 は author_id が NULL で、price は 600 です。",
      ref: "is-null"
    },
    {
      id: "n02", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT title FROM books WHERE author_id = NULL;",
      choices: [
        "title",
        "title\n古い地図",
        "title\n星の庭\n古い地図",
        "title\n星の庭"
      ],
      explain: "`= NULL` の比較は、どの行でも「不明」になるので、1行も選ばれません(エラーにもなりません)。古い地図 を選ぶには `IS NULL` と書きます。",
      ref: "is-null"
    },
    {
      id: "n03", q: "著者が登録されていない本を取り出します。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT title FROM books WHERE author_id ____;",
      choices: ["IS NULL", "= NULL", "== NULL", "IS EMPTY"],
      expect: "title\n古い地図",
      explain: "NULL かどうかは `IS NULL` で調べます。`= NULL` は1行も選ばれません。",
      ref: "is-null"
    },
    {
      id: "n04", q: "値段が入っている本の数を数えます。空欄に入るのは?", tables: ["books"], kind: "code",
      sql: "SELECT COUNT(*) FROM books WHERE price ____;",
      choices: ["IS NOT NULL", "<> NULL", "IS NULL", "NOT = NULL"],
      expect: "COUNT(*)\n7",
      explain: "NULL でない行は `IS NOT NULL` で選びます。`<> NULL` も「不明」になるので、1行も選ばれず 0 です。",
      ref: "is-null"
    },
    {
      id: "n05", q: "WHERE price = NULL と書いても、price が NULL の行を取り出せないのはなぜ?", tables: [], kind: "text",
      choices: [
        "NULL との = の比較は、真でも偽でもない「不明」になるから",
        "NULL は 0 と同じ扱いになるから",
        "= は数値の列にしか使えないから",
        "NULL は ' で囲まなければならないから"
      ],
      explain: "NULL は「わからない値」なので、何と比べても(NULL どうしでも)結果は「不明」です。WHERE は真の行だけを選びます。",
      ref: "null-logic"
    },
    {
      id: "n06", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT COUNT(*), COUNT(price), AVG(price) FROM books;",
      choices: [
        "COUNT(*) | COUNT(price) | AVG(price)\n8 | 7 | 1200",
        "COUNT(*) | COUNT(price) | AVG(price)\n8 | 8 | 1050",
        "COUNT(*) | COUNT(price) | AVG(price)\n7 | 7 | 1200",
        "COUNT(*) | COUNT(price) | AVG(price)\n8 | 7 | 1050"
      ],
      explain: "`COUNT(*)` は全8行。`COUNT(price)` と `AVG(price)` は NULL を無視するので、7件で 8400 ÷ 7 = 1200 です。",
      ref: "null-logic"
    },
    {
      id: "n07", q: "新しい表 magazines を作ります。空欄に入るのは?", tables: [], kind: "code",
      sql: "CREATE ____ magazines (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);",
      choices: ["TABLE", "DATABASE", "NEW", "FILE"],
      explain: "表を作るのは `CREATE TABLE` です。`CREATE DATABASE` は、表を入れる入れ物(データベース)を作る文です。",
      ref: "create-table"
    },
    {
      id: "n08", q: "id を、行を1つに決める主キーにします。空欄に入るのは?", tables: [], kind: "code",
      sql: "CREATE TABLE magazines (\n  id INTEGER ____,\n  name TEXT NOT NULL\n);",
      choices: ["PRIMARY KEY", "MAIN KEY", "UNIQUE ID", "FIRST KEY"],
      explain: "主キーは `PRIMARY KEY` です。主キーの列は、値が重ならず、NULL にもできません。SQLite は型名や制約をゆるく読むので、この誤答を入れてもエラーにならないことがありますが、主キーの意味にはなりません。",
      ref: "constraints"
    },
    {
      id: "n09", q: "name を NULL にできないようにします。空欄に入るのは?", tables: [], kind: "code",
      sql: "CREATE TABLE magazines (\n  id INTEGER PRIMARY KEY,\n  name TEXT ____\n);",
      choices: ["NOT NULL", "IS NOT NULL", "NO NULL", "REQUIRED"],
      explain: "列の制約は `NOT NULL` です。`IS NOT NULL` は WHERE で NULL でない行を選ぶときの書き方です。SQLite は型名や制約をゆるく読むので、この誤答を入れてもエラーにならないことがありますが、NOT NULL の意味にはなりません。",
      ref: "constraints"
    },
    {
      id: "n10", q: "name に文字列を入れる型を指定します。空欄に入るのは?", tables: [], kind: "code",
      sql: "CREATE TABLE magazines (\n  id INTEGER PRIMARY KEY,\n  name ____ NOT NULL\n);",
      choices: ["TEXT", "INTEGER", "STRING", "CHARS"],
      acceptPatterns: ["^varchar(\\([1-9][0-9]*\\))?$"],
      explain: "文字列は `TEXT`(長さを決めるなら `VARCHAR(100)` など。MySQL では VARCHAR に長さが必要)です。`INTEGER` は整数の型です。`STRING` という型は標準SQLにはありません。SQLite は型名や制約をゆるく読むので、この誤答を入れてもエラーにならないことがありますが、文字列の型を正しく指定したことにはなりません。",
      ref: "types"
    },
    {
      id: "n11", q: "この2つの文を順に実行すると、2つめの INSERT はどうなる?", tables: [], kind: "text",
      sql: "CREATE TABLE magazines (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nINSERT INTO magazines (id, name) VALUES (1, NULL);",
      choices: [
        "name が NOT NULL なのでエラーになり、行は入らない",
        "name が NULL の行が入る",
        "name に 'NULL' という文字列が入る",
        "id も NULL になって行が入る"
      ],
      explain: "`NOT NULL` の列に NULL を入れようとすると、制約違反のエラーになります。",
      ref: "constraints"
    },
    {
      id: "n12", q: "PRIMARY KEY(主キー)をつけた列の性質は?", tables: [], kind: "text",
      choices: [
        "値が重ならず、NULL にもできない",
        "値は重なってもよいが、NULL にはできない",
        "結果がいつもその列の順に並ぶ",
        "その表には1行しか入れられない"
      ],
      explain: "主キーは、その値で行を1つに決めるための列です。重なる値や NULL は入れられません(SQLite には古い仕様による例外があります)。ORDER BY を書かなければ、順番は保証されません。",
      ref: "constraints"
    },
    {
      id: "n13", q: "このSQLの結果は?", tables: ["books"], kind: "result",
      sql: "SELECT COUNT(*) FROM books WHERE price > 1000 OR price <= 1000;",
      choices: ["COUNT(*)\n7", "COUNT(*)\n8", "COUNT(*)\n0", "COUNT(*)\n1"],
      explain: "どんな数でも「1000より大きい」か「1000以下」のどちらかですが、NULL はどちらも「不明」です。星の庭 を除いた7行になります。",
      ref: "null-logic"
    },
    {
      id: "n14", q: "CREATE TABLE で使う型 INTEGER と TEXT の意味は?", tables: [], kind: "text",
      choices: [
        "INTEGER は整数、TEXT は文字列を入れる型",
        "INTEGER は文字列、TEXT は整数を入れる型",
        "どちらも数を入れる型で、桁数が違う",
        "INTEGER は 0〜100 の数だけを入れる型"
      ],
      explain: "INTEGER は整数(1、2015 など)、TEXT は文字列('星の旅' など)です。小数は REAL などを使います。",
      ref: "types"
    }
  ]
});

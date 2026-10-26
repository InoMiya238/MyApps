// Python道場: 16単元の定義・問題・文法帳の中身。道場(index.html)と文法帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → (shared/review.js →) data.js
// Python は 3.9 以上で動く書き方にする(match 文などは使わない)。ブラウザでは実行せず、判定は正規化した文字列の一致。
//
// ■ 単元の中身の登録(このファイルの後半)
//   PYD.register("単元ID", { cards: [カード, …], questions: [問題, …] });
//   登録されていない単元は、道場では「準備中」として選べない。文法帳では見出しだけが出る。
//
// ■ 文法帳のカード
//   {
//     id: "print",                     // reference.html の id="card-print" になる。全単元を通して重ならないこと
//     name: "print()",                 // カードの見出し(等幅)
//     read: "画面に出す",               // 短い説明(.tag)
//     desc: "説明",                     // `…` で囲んだところは <code> になる
//     examples: [["コード", "出力"], …], // 出力は省略可。"" なら「出力なし」と出る。改行は \n
//     notes: ["注意", …]                // 省略可
//   }
//
// ■ 問題
//   {
//     id: "b01",                       // 単元の中で重ならない名前
//     q: "問題文",                      // `…` で囲んだところは <code> になる
//     code: "Pythonコード",             // 省略可。____ は空欄(1か所だけ)
//     kind: "output" | "code" | "text",
//        // output = コードを実行したときの出力を答える(choices[0] がそのままの出力。複数行は \n)
//        // code   = 空欄に入るコード・語句を答える(code に ____ が必要)
//        // text   = 説明文の選択肢(入力モードでも選択肢で出す)
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。画面では毎回まぜる
//     accepts: ["別解", …],             // 省略可。入力で正解にする別の書き方
//     acceptPatterns: ["^…$"],          // 省略可。正規化したあとの入力に当てる正規表現
//     noInput: true,                    // 省略可。入力モードでも選択肢で出す
//     expect: "出力",                    // 省略可(code のとき推奨)。空欄に choices[0] を入れて実行したときの出力。画面には出さない
//     lib: "numpy",                     // 省略可。必要なライブラリ(numpy / pandas / sklearn / torch)。検算の振り分けに使う
//     explain: "解説",                   // `…` で囲んだところは <code> になる
//     ref: "print"                      // 文法帳のカードの id
//   }
//   output と、expect つきの code は、コードをそのまま(空欄を埋めて)実行して検算する。
//
// ■ 入力の判定(normalize)
//   全角英数字・記号は半角に、‘’ は '、“” は "、全角スペースは半角にそろえ、" は ' にそろえる。
//   大文字小文字は区別する。行ごとに前後の空白を取り、連続する空白を1つにまとめ、空行は除く。
//   ( ) [ ] { } , : = + - * / % < > ! . の前後の空白は取る。
//   ただし、つなげると別の演算子になる2文字(<= >= == != ** // += -= など)の間の空白は残す(「< =」を「<=」と同じにしない)。
var PYD = (function () {
  "use strict";

  var STATS_KEY = "pythonBasicsStats";
  var SETTINGS_KEY = "pythonBasicsSettings";
  var COUNT = 10;
  var MODES = ["input", "choice"];
  var KINDS = ["output", "code", "text"];
  var LIBS = ["numpy", "pandas", "sklearn", "torch"];
  var BLANK = "____";

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "basics", no: "01", name: "print・変数・型", short: "print・変数", keys: "print · = · int · float · str · bool · type · コメント" },
    { id: "str-num", no: "02", name: "数値と文字列", short: "数値・文字列", keys: "+ - * / // % ** · f文字列 · len · upper · split · join · スライス" },
    { id: "list", no: "03", name: "リストとタプル", short: "リスト", keys: "[] · 添字 · -1 · スライス · append · pop · in · tuple · アンパック" },
    { id: "dict", no: "04", name: "辞書と集合", short: "辞書・集合", keys: "{} · キー · get · items · in · set · 和・積" },
    { id: "if", no: "05", name: "条件分岐", short: "条件分岐", keys: "if · elif · else · and · or · not · 比較 · 真偽値" },
    { id: "loop", no: "06", name: "繰り返し", short: "繰り返し", keys: "for · range · while · break · continue · enumerate · zip" },
    { id: "func", no: "07", name: "関数", short: "関数", keys: "def · return · 既定値 · キーワード引数 · *args · スコープ · lambda" },
    { id: "comp", no: "08", name: "内包表記と組み込み関数", short: "内包表記", keys: "リスト内包 · 辞書内包 · sorted(key=) · sum · max · min · any · all" },
    { id: "class", no: "09", name: "クラス", short: "クラス", keys: "class · __init__ · self · メソッド · 継承 · super() · __str__" },
    { id: "error-module", no: "10", name: "例外・ファイル・モジュール", short: "例外・モジュール", keys: "try · except · raise · finally · with open · import · from" },
    { id: "numpy", no: "11", name: "NumPy", short: "NumPy", keys: "np.array · shape · reshape · ブロードキャスト · axis · @ · 条件でしぼる" },
    { id: "pandas", no: "12", name: "pandas", short: "pandas", keys: "DataFrame · 列 · loc · 条件 · groupby · mean · 欠損値" },
    { id: "sklearn", no: "13", name: "機械学習の流れ", short: "機械学習", keys: "train_test_split · fit · predict · score · 過学習 · 標準化" },
    { id: "nn-numpy", no: "14", name: "ニューラルネットの仕組み", short: "NNの仕組み", keys: "重み · 活性化関数 · 順伝播 · 損失 · 勾配 · 学習率" },
    { id: "torch-basics", no: "15", name: "PyTorchの基本", short: "PyTorch基本", keys: "tensor · requires_grad · backward · .grad · no_grad · device" },
    { id: "torch-model", no: "16", name: "モデルを作って学習する", short: "モデル学習", keys: "nn.Module · nn.Linear · forward · 損失関数 · optimizer · 学習ループ · eval · 保存" }
  ];

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function warn(msg) { if (typeof console !== "undefined" && console.warn) console.warn("PYD: " + msg); }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") { warn("登録できません: " + id); return; }
    var c = {
      cards: Array.isArray(data.cards) ? data.cards : [],
      questions: Array.isArray(data.questions) ? data.questions : []
    };
    c.cards.forEach(function (card) {
      if (!card || !card.id) return;
      if (cardIndex.hasOwnProperty(card.id) && cardIndex[card.id].unitId !== id) warn("カードの id が重なっています: " + card.id);
      cardIndex[card.id] = { card: card, unitId: id };
    });
    content[id] = c;
  }
  function isRegistered(id) { return content.hasOwnProperty(id); }
  function contentOf(id) { return isRegistered(id) ? content[id] : null; }
  function cards(id) { return isRegistered(id) ? content[id].cards : []; }
  function questions(id) { return isRegistered(id) ? content[id].questions : []; }
  function card(id) { return cardIndex.hasOwnProperty(id) ? cardIndex[id].card : null; }
  function cardUnit(id) { return cardIndex.hasOwnProperty(id) ? cardIndex[id].unitId : null; }

  // ---------- 入力の判定 ----------
  var PUNCT = "()[]{},:=+-*/%<>!.";
  var JOIN_OPS = ["<=", ">=", "==", "!=", "**", "//", "+=", "-=", "*=", "/=", "%=", "->", "<<", ">>"];
  function normLine(line) {
    line = line.replace(/ +/g, " ").trim();
    var out = "";
    for (var i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      if (ch === " ") {
        var prev = out.charAt(out.length - 1), next = line.charAt(i + 1);
        if (PUNCT.indexOf(prev) >= 0 || PUNCT.indexOf(next) >= 0) {
          if (JOIN_OPS.indexOf(prev + next) < 0) continue;
        }
      }
      out += ch;
    }
    return out;
  }
  // normalize(kind, s)。kind は "output" | "code" | "text"(いまはどれも同じ規則)。引数が1つなら、それを s とみなす
  function normalize(kind, s) {
    if (arguments.length < 2) s = kind;
    s = String(s == null ? "" : s);
    s = s.replace(/[‘’]/g, "'").replace(/[“”]/g, "\"");
    s = s.replace(/[！-～]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); });
    s = s.replace(/¥/g, "\\").replace(/[　\t]/g, " ").replace(/"/g, "'");
    return s.split(/\r\n|\r|\n/).map(normLine).filter(function (line) { return line !== ""; }).join("\n");
  }
  function kindOf(q) { return q && KINDS.indexOf(q.kind) >= 0 ? q.kind : ""; }
  function hasBlank(q) { return !!q && typeof q.code === "string" && q.code.indexOf(BLANK) >= 0; }
  function blankCount(code) { return typeof code === "string" ? code.split(BLANK).length - 1 : 0; }
  // 入力モードで打ち込んで答える問題か(text と noInput は選択肢で出す)
  function isInputable(q) {
    if (!q || q.noInput) return false;
    var k = kindOf(q);
    if (k === "output") return typeof q.code === "string" && q.code !== "";
    if (k === "code") return hasBlank(q);
    return false;
  }
  function answersOf(q) {
    var list = [q.choices[0]].concat(Array.isArray(q.accepts) ? q.accepts : []);
    return list.map(function (a) { return normalize(q.kind, a); });
  }
  function patternsOf(q) {
    return (Array.isArray(q.acceptPatterns) ? q.acceptPatterns : []).map(function (src) { return new RegExp(src); });
  }
  // 入力が正解か
  function isCorrect(q, input) {
    var t = normalize(q.kind, input);
    if (!t) return false;
    if (answersOf(q).indexOf(t) >= 0) return true;
    return patternsOf(q).some(function (re) { return re.test(t); });
  }
  // 空欄に答えを入れたコード
  function fillBlank(code, answer) { return String(code).split(BLANK).join(answer); }

  // ---------- Python の色分け用の字句分け(画面の部品は各ページで作る) ----------
  // [{ t: "kw" | "fn" | "str" | "num" | "cm" | "blank" | "", s: "文字" }, …] を返す
  var KEYWORDS = ("False None True and as assert async await break class continue def del elif else except finally for " +
    "from global if import in is lambda nonlocal not or pass raise return try while with yield self").split(" ");
  var BUILTINS = ("print len range int float str bool list dict set tuple type input sum max min abs round sorted reversed " +
    "enumerate zip map filter any all isinstance open super object iter next repr format id hasattr getattr setattr " +
    "Exception ValueError TypeError KeyError IndexError ZeroDivisionError NameError AttributeError FileNotFoundError " +
    "RuntimeError StopIteration __init__ __str__ __repr__ __len__ __name__").split(" ");
  var kwSet = {}, fnSet = {};
  KEYWORDS.forEach(function (k) { kwSet[k] = true; });
  BUILTINS.forEach(function (k) { fnSet[k] = true; });
  var TOKEN_RE = new RegExp([
    "((?:\\b[rRbBfFuU]{1,2})?(?:\"\"\"[\\s\\S]*?(?:\"\"\"|$)|'''[\\s\\S]*?(?:'''|$)|\"(?:[^\"\\\\\\n]|\\\\.)*\"?|'(?:[^'\\\\\\n]|\\\\.)*'?))",
    "(#[^\\n]*)",
    "(____)",
    "(\\b\\d[\\d_]*(?:\\.\\d*)?(?:[eE][+-]?\\d+)?j?\\b|\\.\\d+\\b)",
    "([A-Za-z_][A-Za-z0-9_]*)",
    "([\\s\\S])"
  ].join("|"), "g");
  function tokenize(code) {
    var out = [], m;
    var push = function (t, s) {
      if (!s) return;
      var last = out[out.length - 1];
      if (last && last.t === t && t !== "blank") last.s += s; else out.push({ t: t, s: s });
    };
    // 文字列やコメントの中の ____ も空欄として出す
    var pushSplit = function (t, s) {
      s.split(BLANK).forEach(function (part, i) {
        if (i > 0) push("blank", BLANK);
        push(t, part);
      });
    };
    TOKEN_RE.lastIndex = 0;
    var src = String(code);
    while ((m = TOKEN_RE.exec(src)) !== null) {
      if (m[1] !== undefined) pushSplit("str", m[1]);
      else if (m[2] !== undefined) pushSplit("cm", m[2]);
      else if (m[3] !== undefined) push("blank", m[3]);
      else if (m[4] !== undefined) push("num", m[4]);
      else if (m[5] !== undefined) push(kwSet[m[5]] ? "kw" : fnSet[m[5]] ? "fn" : "", m[5]);
      else push("", m[6]);
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
    if (!kind) errs.push("kind が output / code / text のどれでもない: " + q.kind);
    if (q.code !== undefined && typeof q.code !== "string") errs.push("code が文字列ではない");
    if (kind === "output" && !q.code) errs.push("output なのに code がない");
    if (kind === "output" && hasBlank(q)) errs.push("output の code に空欄がある");
    if (kind === "code" && blankCount(q.code) !== 1) errs.push("code の空欄(____)が1か所ではない");
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c.trim()) { errs.push("choices[" + i + "] が空"); return; }
        var k = normalize(kind, c);
        if (seen[k]) errs.push("choices に同じものがある: " + c);
        seen[k] = true;
      });
      if (isInputable(q) && errs.length === 0) {
        q.choices.slice(1).forEach(function (c) {
          if (isCorrect(q, c)) errs.push("誤答が正解の書き方と同じ: " + c);
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
    if (q.expect !== undefined && typeof q.expect !== "string") errs.push("expect が文字列ではない");
    if (q.lib !== undefined && LIBS.indexOf(q.lib) < 0) errs.push("lib が numpy / pandas / sklearn / torch のどれでもない: " + q.lib);
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
  var checked = {};   // 形の確認の結果を覚えておく(問題 → 正しいか)
  function isValid(unitId, q) {
    var key = unitId + ":" + (q && q.id);
    if (!checked.hasOwnProperty(key)) {
      var errs = checkQuestion(q);
      if (errs.length) warn(key + " を出題しません: " + errs.join(" / "));
      checked[key] = errs.length === 0;
    }
    return checked[key];
  }
  // 出題できる問題。入力モードでも、選択肢で出す問題(text など)を含む
  function poolOf(unitId) {
    return questions(unitId).filter(function (q) { return isValid(unitId, q); });
  }
  function isReady(unitId) { return poolOf(unitId).length > 0; }

  function prepare(unitId, q, mode) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      id: q.id,
      q: q.q,
      code: q.code || "",
      kind: kindOf(q),
      input: mode === "input" && isInputable(q),   // true なら打ち込む。false なら選択肢
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
      return { id: id, list: shuffle(poolOf(id)) };
    }).filter(function (p) { return p.list.length > 0; });
    var out = [];
    while (out.length < count && pools.length > 0) {
      for (var i = 0; i < pools.length && out.length < count; i++) {
        out.push(prepare(pools[i].id, pools[i].list.shift(), mode));
      }
      pools = pools.filter(function (p) { return p.list.length > 0; });
    }
    return shuffle(out);
  }

  // ---------- 保存データ(形がくずれていても動くように、数字だけを拾い直す) ----------
  function cleanNum(v) { return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function emptyStats() { return { byUnit: {}, bestStreak: 0 }; }
  // { byUnit: { [単元ID]: { total, correct, sessions } }, bestStreak }。復習プランナーは byUnit[id].total を読む
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
    var s = { mode: "input", units: [] };
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
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, MODES: MODES, KINDS: KINDS, LIBS: LIBS, UNITS: UNITS, BLANK: BLANK,
    unit: unit, register: register, isRegistered: isRegistered, contentOf: contentOf, cards: cards, questions: questions,
    card: card, cardUnit: cardUnit,
    normalize: normalize, isCorrect: isCorrect, isInputable: isInputable, kindOf: kindOf, hasBlank: hasBlank, fillBlank: fillBlank,
    tokenize: tokenize,
    checkQuestion: checkQuestion, isReady: isReady, poolOf: poolOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();


// =====================================================================
// 01 print・変数・型
// =====================================================================
PYD.register("basics", {
  cards: [
    {
      id: "print", name: "print()", read: "画面に出す",
      desc: "`print(値)` で、値を画面に出して改行します。カンマで区切って複数の値を渡すと、間に空白を1つはさんで1行に出します。文字列は `\"…\"` か `'…'` で囲みます。",
      examples: [
        ["print(\"Hello, World!\")", "Hello, World!"],
        ["print(1, 2, 3)", "1 2 3"],
        ["print(\"答えは\", 42)", "答えは 42"]
      ],
      notes: ["出力には引用符はつきません。`print(\"abc\")` の出力は `abc` です。", "`\"…\"` と `'…'` はどちらも同じ文字列です。"]
    },
    {
      id: "variable", name: "変数と =", read: "値に名前をつける",
      desc: "`名前 = 値` で、値に名前(変数)をつけます。`=` は「等しい」ではなく「右の値を左の名前に入れる」という意味です。同じ名前にもう一度入れると、新しい値に置きかわります。",
      examples: [
        ["x = 3\nx = x + 2\nprint(x)", "5"],
        ["name = \"Taro\"\nage = 12\nprint(name, age)", "Taro 12"]
      ],
      notes: ["変数名には英字・数字・`_` が使えますが、数字で始めることはできません(`2nd` は×、`second` は○)。", "大文字と小文字は別の名前になります(`Age` と `age` は別もの)。"]
    },
    {
      id: "types", name: "int / float / str / bool", read: "値の型",
      desc: "値には型があります。整数は `int`、小数は `float`、文字列は `str`、真偽値(`True` / `False`)は `bool` です。`type(値)` で型を調べられます。",
      examples: [
        ["print(type(3))\nprint(type(3.0))", "<class 'int'>\n<class 'float'>"],
        ["print(type(\"3\"))\nprint(type(True))", "<class 'str'>\n<class 'bool'>"]
      ],
      notes: ["`3` と `\"3\"` は別ものです。`\"3\"` は数ではなく、文字の「3」です。", "`True` と `False` は大文字で始めます。"]
    },
    {
      id: "convert", name: "int() / str() / float()", read: "型を変える",
      desc: "`int(\"10\")` で文字列を整数に、`str(10)` で数を文字列に、`float(\"2.5\")` で小数に変えます。文字列どうしの `+` はつなげる、数どうしの `+` は足し算です。文字列と数を `+` でつなぐとエラーになるので、`str()` でそろえます。",
      examples: [
        ["print(int(\"3\") + 4)", "7"],
        ["print(\"3\" + \"4\")", "34"],
        ["age = 20\nprint(\"年齢は\" + str(age) + \"歳\")", "年齢は20歳"]
      ],
      notes: ["`\"年齢は\" + 20` は `TypeError`(型が合わない)というエラーになります。"]
    },
    {
      id: "comment", name: "# コメント", read: "メモを書く",
      desc: "`#` から行の終わりまでは、コメント(メモ)として無視されます。コードの意味を書き残すのに使います。",
      examples: [
        ["# これはメモ\nprint(\"ok\")  # 行の途中からも書ける", "ok"]
      ],
      notes: ["`//` や `--` はPythonではコメントになりません(`//` は割り算の記号です)。"]
    }
  ],
  questions: [
    {
      id: "b01", q: "このコードの出力は?", kind: "output",
      code: "print(\"Hello, World!\")",
      choices: ["Hello, World!", "\"Hello, World!\"", "print(Hello, World!)", "Hello World"],
      explain: "`print()` は中身の文字列だけを出します。引用符 `\"` は「ここからここまでが文字列」という印なので、出力には出ません。",
      ref: "print"
    },
    {
      id: "b02", q: "このコードの出力は?", kind: "output",
      code: "x = 3\nx = x + 2\nprint(x)",
      choices: ["5", "3", "x", "32"],
      explain: "2行目は「いまの x(3)に 2 を足して、また x に入れる」という意味です。x は 5 になります。",
      ref: "variable"
    },
    {
      id: "b03", q: "このコードの出力は?", kind: "output",
      code: "print(1, 2, 3)",
      choices: ["1 2 3", "123", "1, 2, 3", "(1, 2, 3)"],
      explain: "カンマで区切って渡した値は、間に空白を1つはさんで出ます。カンマそのものは出ません。",
      ref: "print"
    },
    {
      id: "b04", q: "このコードの出力は?", kind: "output",
      code: "print(type(3.0))",
      choices: ["<class 'float'>", "<class 'int'>", "<class 'str'>", "float"],
      explain: "`3.0` は小数点があるので、値が整数と同じでも `float` です。`type()` の結果は `<class '型の名前'>` の形で出ます。",
      ref: "types"
    },
    {
      id: "b05", q: "このコードの出力は?", kind: "output",
      code: "print(\"3\" + \"4\")",
      choices: ["34", "7", "3 4", "\"34\""],
      explain: "`\"3\"` と `\"4\"` は文字列です。文字列どうしの `+` は、足し算ではなく「つなげる」になります。",
      ref: "convert"
    },
    {
      id: "b06", q: "このコードの出力は?", kind: "output",
      code: "print(int(\"3\") + 4)",
      choices: ["7", "34", "3 4", "エラーになる"],
      explain: "`int(\"3\")` で文字列が整数の 3 になるので、`3 + 4` の足し算になります。",
      ref: "convert"
    },
    {
      id: "b07", q: "文字列 \"10\" を整数にして、5 を足します。空欄に入るのは?", kind: "code",
      code: "n = ____(\"10\")\nprint(n + 5)",
      choices: ["int", "str", "float", "number"],
      expect: "15",
      explain: "`int()` で整数になります。`float()` でも足し算はできますが、出力が `15.0` になります。`str()` だと文字列のままで、`+ 5` がエラーになります。",
      ref: "convert"
    },
    {
      id: "b08", q: "このコードの出力は?", kind: "output",
      code: "a = \"Py\"\nb = a\na = \"Java\"\nprint(b)",
      choices: ["Py", "Java", "a", "PyJava"],
      explain: "`b = a` のときに、b にも \"Py\" が入ります。あとで a に別の値を入れても、b は \"Py\" のままです。",
      ref: "variable"
    },
    {
      id: "b09", q: "1行目をコメント(メモ)にします。空欄に入る記号は?", kind: "code",
      code: "____ これはメモ\nprint(\"ok\")",
      choices: ["#", "//", "--", "/*"],
      expect: "ok",
      explain: "Pythonのコメントは `#` です。`//` はC言語やJavaScript、`--` はSQLのコメントの書き方で、Pythonではエラーになります。",
      ref: "comment"
    },
    {
      id: "b10", q: "このコードの出力は?", kind: "output",
      code: "name = \"Taro\"\nage = 12\nprint(name, age)",
      choices: ["Taro 12", "Taro12", "name age", "Taro, 12"],
      explain: "変数の名前ではなく、中に入っている値が出ます。カンマで区切ったので、間に空白が1つ入ります。",
      ref: "print"
    },
    {
      id: "b11", q: "値の型を調べる関数を入れます。空欄に入るのは?", kind: "code",
      code: "print(____(42))",
      choices: ["type", "class", "kind", "typeof"],
      expect: "<class 'int'>",
      explain: "`type(値)` で型がわかります。`typeof` はJavaScriptの書き方です。",
      ref: "types"
    },
    {
      id: "b12", q: "変数名として使えないのはどれ?", kind: "text",
      choices: ["2nd_place", "second_place", "_place2", "place_2"],
      explain: "変数名は数字で始められません。`_` で始めたり、途中や最後に数字を入れたりするのはかまいません。",
      ref: "variable"
    },
    {
      id: "b13", q: "このコードの出力は?", kind: "output",
      code: "age = 20\nprint(\"年齢は\" + str(age) + \"歳\")",
      choices: ["年齢は20歳", "年齢はage歳", "年齢は 20 歳", "エラーになる"],
      explain: "`str(age)` で 20 が文字列の \"20\" になり、`+` で3つの文字列がつながります。`+` でつなぐときは空白は入りません。",
      ref: "convert"
    },
    {
      id: "b14", q: "このコードを実行すると、どうなる?", kind: "text",
      code: "age = 20\nprint(\"年齢は\" + age)",
      choices: [
        "エラー(TypeError)になる",
        "年齢は20 と出る",
        "年齢は 20 と出る",
        "年齢はage と出る"
      ],
      explain: "文字列と整数は `+` でつなげません。`str(age)` で文字列にするか、`print(\"年齢は\", age)` のようにカンマで渡します。",
      ref: "convert"
    }
  ]
});


// =====================================================================
// 02 数値と文字列
// =====================================================================
PYD.register("str-num", {
  cards: [
    {
      id: "arith", name: "+ - * / // % **", read: "計算の記号",
      desc: "`+` 足す、`-` 引く、`*` かける、`/` 割る(答えはいつも小数)、`//` 割り算の商(切り捨て)、`%` 割り算の余り、`**` 累乗です。",
      examples: [
        ["print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)", "3.5\n3\n1"],
        ["print(10 / 2)\nprint(2 ** 3)", "5.0\n8"],
        ["x = 5\nx += 3  # x = x + 3 と同じ\nprint(x)", "8"]
      ],
      notes: ["`/` の答えは割り切れても `5.0` のように小数(float)になります。", "`^` は累乗ではありません(別の意味の記号です)。累乗は `**` です。"]
    },
    {
      id: "fstring", name: "f\"…{式}…\"", read: "f文字列",
      desc: "文字列の前に `f` をつけると、`{ }` の中に書いた変数や式の値が埋めこまれます。`{x:.2f}` のように `:` のあとに書式を書くと、小数の桁数などを決められます。",
      examples: [
        ["name = \"Hana\"\nprint(f\"こんにちは、{name}さん\")", "こんにちは、Hanaさん"],
        ["x = 5\nprint(f\"{x} の2倍は {x * 2}\")", "5 の2倍は 10"],
        ["print(f\"{10 / 3:.2f}\")", "3.33"]
      ],
      notes: ["`f` を忘れると、`{name}` がそのまま出ます。"]
    },
    {
      id: "str-methods", name: "len() / .upper() など", read: "文字列の長さと変換",
      desc: "`len(s)` で文字数を数えます。`s.upper()` 大文字に、`s.lower()` 小文字に、`s.replace(\"a\", \"b\")` 置きかえ、`s.strip()` 前後の空白を取る。`\"ab\" * 3` で文字列をくり返します。",
      examples: [
        ["s = \"Python\"\nprint(len(s))\nprint(s.upper())", "6\nPYTHON"],
        ["print(\"  hi  \".strip())\nprint(\"ab\" * 3)", "hi\nababab"],
        ["print(\"tea\".replace(\"t\", \"s\"))", "sea"]
      ],
      notes: ["文字列のメソッドは、もとの文字列を変えません。新しい文字列を返します。"]
    },
    {
      id: "split-join", name: ".split() / .join()", read: "分ける・つなぐ",
      desc: "`s.split(\",\")` は区切り文字で分けてリストにします(引数なしなら空白で分ける)。`\"区切り\".join(リスト)` は、リストの文字列を区切りではさんでつなぎます。",
      examples: [
        ["print(\"a,b,c\".split(\",\"))", "['a', 'b', 'c']"],
        ["words = [\"I\", \"like\", \"Python\"]\nprint(\" \".join(words))", "I like Python"],
        ["print(\"-\".join([\"2024\", \"04\", \"01\"]))", "2024-04-01"]
      ],
      notes: ["`join` は区切り文字のほうのメソッドです。`words.join(\" \")` ではありません。"]
    },
    {
      id: "str-index", name: "s[i] / s[a:b]", read: "添字とスライス",
      desc: "`s[0]` で先頭の1文字、`s[-1]` で最後の1文字を取り出します。`s[a:b]` は a 番目から b 番目の手前まで(b は含まない)。番号は 0 から数えます。",
      examples: [
        ["s = \"Python\"\nprint(s[0], s[-1])", "P n"],
        ["s = \"Python\"\nprint(s[1:4])\nprint(s[:2])", "yth\nPy"]
      ],
      notes: ["文字数より大きい番号 `s[10]` はエラー(IndexError)ですが、スライス `s[1:10]` はエラーにならず、あるところまでを返します。"]
    }
  ],
  questions: [
    {
      id: "s01", q: "このコードの出力は?", kind: "output",
      code: "print(7 // 2)",
      choices: ["3", "3.5", "4", "1"],
      explain: "`//` は割り算の商を切り捨てで求めます。7 ÷ 2 = 3 あまり 1 の「3」です。`3.5` になるのは `/` です。",
      ref: "arith"
    },
    {
      id: "s02", q: "このコードの出力は?", kind: "output",
      code: "print(7 % 3)",
      choices: ["1", "2", "0", "21"],
      explain: "`%` は割り算の余りです。7 ÷ 3 = 2 あまり 1 なので 1。パーセントの意味ではありません。",
      ref: "arith"
    },
    {
      id: "s03", q: "このコードの出力は?", kind: "output",
      code: "print(2 ** 3)",
      choices: ["8", "6", "9", "5"],
      explain: "`**` は累乗です。2 の 3 乗 = 2 × 2 × 2 = 8。`2 * 3` の 6 とまちがえないように。",
      ref: "arith"
    },
    {
      id: "s04", q: "このコードの出力は?", kind: "output",
      code: "print(10 / 5)",
      choices: ["2.0", "2", "2.00", "0.5"],
      explain: "`/` の答えは、割り切れても小数(float)になります。整数で欲しいときは `10 // 5` と書きます。",
      ref: "arith"
    },
    {
      id: "s05", q: "このコードの出力は?", kind: "output",
      code: "name = \"Hana\"\nprint(f\"こんにちは、{name}さん\")",
      choices: ["こんにちは、Hanaさん", "こんにちは、{name}さん", "こんにちは、nameさん", "fこんにちは、Hanaさん"],
      explain: "f文字列の `{name}` には、変数 name の値が入ります。先頭の `f` は印なので出力には出ません。",
      ref: "fstring"
    },
    {
      id: "s06", q: "{x} に x の値を埋めこみます。空欄に入るのは?", kind: "code",
      code: "x = 5\nprint(____\"x は {x}\")",
      choices: ["f", "r", "s", "$"],
      expect: "x は 5",
      explain: "文字列の前に `f` をつけると、`{ }` の中が値に置きかわります。`r` は「バックスラッシュをそのまま使う」印で、`{x}` はそのまま出ます。",
      ref: "fstring"
    },
    {
      id: "s07", q: "このコードの出力は?", kind: "output",
      code: "print(len(\"Python\"))",
      choices: ["6", "5", "7", "Python"],
      explain: "`len()` は文字数を数えます。P・y・t・h・o・n の6文字です(番号は 0〜5 ですが、数は 6)。",
      ref: "str-methods"
    },
    {
      id: "s08", q: "このコードの出力は?", kind: "output",
      code: "s = \"Python\"\nprint(s[0], s[-1])",
      choices: ["P n", "y n", "P o", "Pn"],
      explain: "番号は 0 から数えるので `s[0]` は先頭の P。`-1` は「最後から1番目」で n です。",
      ref: "str-index"
    },
    {
      id: "s09", q: "このコードの出力は?", kind: "output",
      code: "s = \"Python\"\nprint(s[1:4])",
      choices: ["yth", "ytho", "Pyth", "yt"],
      explain: "`[1:4]` は 1・2・3 番目(4 は含まない)。P=0, y=1, t=2, h=3 なので yth です。",
      ref: "str-index"
    },
    {
      id: "s10", q: "文字列をすべて大文字にします。空欄に入るのは?", kind: "code",
      code: "s = \"abc\"\nprint(s.____())",
      choices: ["upper", "capitalize", "toUpper", "big"],
      expect: "ABC",
      explain: "`upper()` で全部が大文字になります。`capitalize()` は先頭だけを大文字にするので `Abc` です。`toUpper` はPythonにはありません。",
      ref: "str-methods"
    },
    {
      id: "s11", q: "このコードの出力は?", kind: "output",
      code: "print(\"a,b,c\".split(\",\"))",
      choices: ["['a', 'b', 'c']", "a b c", "['a,b,c']", "('a', 'b', 'c')"],
      explain: "`split(\",\")` はカンマで分けて、文字列のリストを返します。リストを print すると `[ ]` と引用符つきで出ます。",
      ref: "split-join"
    },
    {
      id: "s12", q: "リストの単語を、空白をはさんでつなぎます。空欄に入るのは?", kind: "code",
      code: "words = [\"I\", \"like\", \"Python\"]\nprint(\" \".____(words))",
      choices: ["join", "split", "concat", "append"],
      expect: "I like Python",
      explain: "`\"区切り\".join(リスト)` でつなぎます。`split` は逆に分けるメソッド、`concat` はPythonの文字列にはありません。",
      ref: "split-join"
    },
    {
      id: "s13", q: "このコードの出力は?", kind: "output",
      code: "print(\"ab\" * 3)",
      choices: ["ababab", "ab3", "ab ab ab", "エラーになる"],
      explain: "文字列に整数をかけると、その回数だけくり返した文字列になります。間に空白は入りません。",
      ref: "str-methods"
    },
    {
      id: "s14", q: "このコードの出力は?", kind: "output",
      code: "print(f\"{10 / 3:.2f}\")",
      choices: ["3.33", "3.3", "3.333", "3.34"],
      explain: "`:.2f` は「小数点以下2けた」の書式です。10 / 3 = 3.333… を2けたにまるめて 3.33 になります。",
      ref: "fstring"
    }
  ]
});


// =====================================================================
// 03 リストとタプル
// =====================================================================
PYD.register("list", {
  cards: [
    {
      id: "list", name: "[ ] リスト", read: "値を順に並べる",
      desc: "`[値, 値, …]` で、いくつもの値を順に並べたリストを作ります。`a[0]` で先頭、`a[-1]` で最後の要素を取り出し、`a[1] = 値` で入れかえます。`len(a)` で要素の数がわかります。",
      examples: [
        ["nums = [10, 20, 30]\nprint(nums[0], nums[-1])\nprint(len(nums))", "10 30\n3"],
        ["nums = [10, 20, 30]\nnums[1] = 99\nprint(nums)", "[10, 99, 30]"],
        ["print([1, 2] + [3])", "[1, 2, 3]"]
      ],
      notes: ["番号(添字)は 0 から数えます。要素が3つなら、使える番号は 0・1・2 です。", "`b = a` としても、リストは1つのままです。b を変えると a も変わって見えます。"]
    },
    {
      id: "list-slice", name: "a[開始:終わり]", read: "スライス",
      desc: "`a[2:5]` は 2 番目から 5 番目の手前まで(5 は含まない)を、新しいリストとして取り出します。開始を省くと先頭から、終わりを省くと最後まで。`a[::2]` は1つおき、`a[::-1]` は逆順です。",
      examples: [
        ["a = [0, 1, 2, 3, 4, 5]\nprint(a[2:5])\nprint(a[:3])", "[2, 3, 4]\n[0, 1, 2]"],
        ["a = [0, 1, 2, 3, 4, 5]\nprint(a[::2])\nprint(a[::-1])", "[0, 2, 4]\n[5, 4, 3, 2, 1, 0]"]
      ]
    },
    {
      id: "list-methods", name: ".append() / .pop() など", read: "リストを変える",
      desc: "`a.append(x)` は最後に足す、`a.pop()` は最後を取り出して消す(`a.pop(0)` なら先頭)、`a.remove(x)` は値 x を1つ消す、`a.sort()` は小さい順に並べかえます。どれも、もとのリストそのものを変えます。",
      examples: [
        ["a = [1, 2, 3]\na.append(4)\nprint(a)", "[1, 2, 3, 4]"],
        ["stack = [1, 2, 3]\nx = stack.pop()\nprint(x, stack)", "3 [1, 2]"],
        ["a = [3, 1, 2]\na.sort()\nprint(a)", "[1, 2, 3]"]
      ],
      notes: ["`a.sort()` の戻り値は `None` です。`a = a.sort()` と書くと、a が None になってしまいます。"]
    },
    {
      id: "in-list", name: "x in a", read: "含まれているか",
      desc: "`値 in リスト` は、その値がリストの中にあれば `True`、なければ `False` です。`not in` で「含まれていない」を調べます。文字列にも使えます(`\"th\" in \"Python\"`)。",
      examples: [
        ["fruits = [\"apple\", \"banana\"]\nprint(\"apple\" in fruits)\nprint(\"melon\" not in fruits)", "True\nTrue"],
        ["print(\"th\" in \"Python\")", "True"]
      ]
    },
    {
      id: "tuple", name: "( ) タプルとアンパック", read: "変えられない組",
      desc: "`(値, 値)` はタプルです。リストと同じように `t[0]` で取り出せますが、中身を変えられません。`x, y = (3, 5)` のように、左に同じ数の変数を並べると、まとめて取り出せます(アンパック)。",
      examples: [
        ["point = (3, 5)\nx, y = point\nprint(x, y)", "3 5"],
        ["a, b = 1, 2\na, b = b, a  # 入れかえ\nprint(a, b)", "2 1"]
      ],
      notes: ["`t[0] = 9` のようにタプルの中身を変えようとすると、エラー(TypeError)になります。"]
    }
  ],
  questions: [
    {
      id: "l01", q: "このコードの出力は?", kind: "output",
      code: "nums = [10, 20, 30]\nprint(nums[1])",
      choices: ["20", "10", "30", "[20]"],
      explain: "番号は 0 から数えます。`nums[0]` が 10、`nums[1]` が 20 です。",
      ref: "list"
    },
    {
      id: "l02", q: "このコードの出力は?", kind: "output",
      code: "nums = [10, 20, 30]\nprint(nums[-1])",
      choices: ["30", "10", "20", "エラーになる"],
      explain: "マイナスの番号は後ろから数えます。`-1` は最後の要素で 30 です。",
      ref: "list"
    },
    {
      id: "l03", q: "このコードの出力は?", kind: "output",
      code: "a = [1, 2, 3]\na.append(4)\nprint(a)",
      choices: ["[1, 2, 3, 4]", "[4, 1, 2, 3]", "[1, 2, 3]", "[1, 2, 3, [4]]"],
      explain: "`append` はリストの最後に1つ足し、もとのリストそのものを変えます。",
      ref: "list-methods"
    },
    {
      id: "l04", q: "このコードの出力は?", kind: "output",
      code: "print(len([3, 1, 4, 1, 5]))",
      choices: ["5", "4", "14", "6"],
      explain: "`len()` は要素の数です。同じ値(1)が2つあっても、別々に数えて 5 個です。",
      ref: "list"
    },
    {
      id: "l05", q: "このコードの出力は?", kind: "output",
      code: "a = [0, 1, 2, 3, 4, 5]\nprint(a[2:5])",
      choices: ["[2, 3, 4]", "[2, 3, 4, 5]", "[3, 4, 5]", "[1, 2, 3, 4]"],
      explain: "スライス `[2:5]` は 2 番目から 5 番目の「手前」まで。終わりの番号は含みません。",
      ref: "list-slice"
    },
    {
      id: "l06", q: "このコードの出力は?", kind: "output",
      code: "a = [0, 1, 2, 3, 4, 5]\nprint(a[::-1])",
      choices: ["[5, 4, 3, 2, 1, 0]", "[5]", "[0, 1, 2, 3, 4, 5]", "[4, 3, 2, 1, 0]"],
      explain: "`[::-1]` は「最初から最後まで、-1 ずつ進む」で、逆順のリストになります。",
      ref: "list-slice"
    },
    {
      id: "l07", q: "リストの最後の要素を取り出して、リストからは消します。空欄に入るのは?", kind: "code",
      code: "stack = [1, 2, 3]\nx = stack.____()\nprint(x, stack)",
      choices: ["pop", "remove", "get", "delete"],
      expect: "3 [1, 2]",
      explain: "`pop()` は最後の要素を返し、リストからは消します。`remove(値)` は値を指定して消すメソッドで、引数なしではエラーです。",
      ref: "list-methods"
    },
    {
      id: "l08", q: "このコードの出力は?", kind: "output",
      code: "print(3 in [1, 2, 3])",
      choices: ["True", "False", "3", "2"],
      explain: "`in` は「含まれているか」を `True` / `False` で答えます。3 はリストにあるので True。番号を返すわけではありません。",
      ref: "in-list"
    },
    {
      id: "l09", q: "\"apple\" がリストにあるかを調べます。空欄に入るのは?", kind: "code",
      code: "fruits = [\"apple\", \"banana\"]\nprint(\"apple\" ____ fruits)",
      choices: ["in", "of", "has", "on"],
      expect: "True",
      explain: "`値 in リスト` で、含まれているかがわかります。",
      ref: "in-list"
    },
    {
      id: "l10", q: "このコードの出力は?", kind: "output",
      code: "point = (3, 5)\nx, y = point\nprint(y)",
      choices: ["5", "3", "(3, 5)", "y"],
      explain: "アンパックでは、左の変数に前から順に入ります。x に 3、y に 5 です。",
      ref: "tuple"
    },
    {
      id: "l11", q: "このコードを実行すると、どうなる?", kind: "text",
      code: "t = (1, 2, 3)\nt[0] = 9",
      choices: [
        "エラー(TypeError)になる",
        "t が (9, 2, 3) になる",
        "t が (9, 1, 2, 3) になる",
        "何も起きない(t は変わらない)"
      ],
      explain: "タプルは中身を変えられません。入れかえたいときはリスト `[1, 2, 3]` を使います。",
      ref: "tuple"
    },
    {
      id: "l12", q: "このコードの出力は?", kind: "output",
      code: "a = [1, 2]\nb = a\nb.append(3)\nprint(a)",
      choices: ["[1, 2, 3]", "[1, 2]", "[3]", "[1, 2, [3]]"],
      explain: "`b = a` はリストをコピーしません。a と b は同じリストを指すので、b に足すと a からも見えます。コピーしたいときは `b = a.copy()` です。",
      ref: "list"
    },
    {
      id: "l13", q: "このコードの出力は?", kind: "output",
      code: "a = [3, 1, 2]\na.sort()\nprint(a)",
      choices: ["[1, 2, 3]", "[3, 2, 1]", "None", "[3, 1, 2]"],
      explain: "`sort()` はリストそのものを小さい順に並べかえます。`print(a.sort())` なら None が出ますが、ここでは a を出しています。",
      ref: "list-methods"
    },
    {
      id: "l14", q: "2つのリストをつないで [1, 2, 3] を作ります。空欄に入る記号は?", kind: "code",
      code: "print([1, 2] ____ [3])",
      choices: ["+", "&", "and", "*"],
      expect: "[1, 2, 3]",
      explain: "リストどうしの `+` は、つないだ新しいリストを作ります。`and` はつなぐ記号ではなく、ここでは右の `[3]` がそのまま返ります。",
      ref: "list"
    }
  ]
});


// =====================================================================
// 04 辞書と集合
// =====================================================================
PYD.register("dict", {
  cards: [
    {
      id: "dict", name: "{キー: 値} 辞書", read: "名前で引く",
      desc: "`{キー: 値, …}` で辞書を作ります。`d[キー]` で値を取り出し、`d[キー] = 値` で追加・上書きします。`len(d)` はキーの数、`キー in d` はキーがあるかを調べます。",
      examples: [
        ["ages = {\"Taro\": 12, \"Hana\": 10}\nprint(ages[\"Hana\"])", "10"],
        ["ages = {\"Taro\": 12}\nages[\"Ken\"] = 9\nages[\"Taro\"] = 13\nprint(ages)", "{'Taro': 13, 'Ken': 9}"],
        ["d = {\"a\": 1, \"b\": 2}\nprint(\"a\" in d, 1 in d)", "True False"]
      ],
      notes: ["同じキーは1つだけです。もう一度入れると上書きになります。", "`in` が調べるのはキーです。値ではありません。", "辞書は、キーを入れた順を覚えています(Python 3.7 以降)。"]
    },
    {
      id: "dict-get", name: ".get(キー, 既定値)", read: "なくても止まらない",
      desc: "`d[キー]` は、キーがないとエラー(KeyError)になります。`d.get(キー)` はキーがなければ `None` を、`d.get(キー, 0)` なら 0 を返します。数を数えるときによく使います。",
      examples: [
        ["ages = {\"Taro\": 12}\nprint(ages.get(\"Jiro\"))\nprint(ages.get(\"Jiro\", 0))", "None\n0"],
        ["count = {}\nfor w in [\"a\", \"b\", \"a\"]:\n    count[w] = count.get(w, 0) + 1\nprint(count)", "{'a': 2, 'b': 1}"]
      ]
    },
    {
      id: "dict-loop", name: ".keys() / .values() / .items()", read: "辞書を順に見る",
      desc: "`d.keys()` はキー、`d.values()` は値、`d.items()` は (キー, 値) の組を順に取り出します。`for k, v in d.items():` の形でよく使います。`for k in d:` はキーを順に取り出します。",
      examples: [
        ["ages = {\"Taro\": 12, \"Hana\": 10}\nfor name, age in ages.items():\n    print(name, age)", "Taro 12\nHana 10"],
        ["d = {\"a\": 1, \"b\": 2}\nprint(list(d.keys()))\nprint(list(d.values()))", "['a', 'b']\n[1, 2]"]
      ]
    },
    {
      id: "set", name: "{値, …} 集合", read: "重なりのない集まり",
      desc: "`{1, 2, 3}` や `set(リスト)` で集合を作ります。同じ値は1つにまとまり、順番はありません。`s.add(x)` で足し、`x in s` で含まれるかを調べます。",
      examples: [
        ["s = set([3, 1, 3, 2, 1])\nprint(len(s))", "3"],
        ["s = {1, 2}\ns.add(3)\ns.add(2)\nprint(len(s))", "3"]
      ],
      notes: ["空の集合は `set()` です。`{}` と書くと空の辞書になります。", "集合には順番がないので、`s[0]` のように番号では取り出せません。"]
    },
    {
      id: "set-ops", name: "| & -", read: "和・積・差",
      desc: "集合どうしで、`a | b` はどちらかにある(和)、`a & b` は両方にある(積)、`a - b` は a にあって b にないもの(差)を求めます。",
      examples: [
        ["a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a | b))\nprint(sorted(a & b))\nprint(sorted(a - b))", "[1, 2, 3, 4]\n[2, 3]\n[1]"]
      ],
      notes: ["集合を print したときの並びは決まっていません。順に並べて見たいときは `sorted()` を使います。"]
    }
  ],
  questions: [
    {
      id: "d01", q: "このコードの出力は?", kind: "output",
      code: "ages = {\"Taro\": 12, \"Hana\": 10}\nprint(ages[\"Hana\"])",
      choices: ["10", "12", "Hana", "{'Hana': 10}"],
      explain: "`辞書[キー]` で、そのキーの値が取り出せます。",
      ref: "dict"
    },
    {
      id: "d02", q: "このコードの出力は?", kind: "output",
      code: "ages = {\"Taro\": 12}\nages[\"Ken\"] = 9\nprint(ages)",
      choices: ["{'Taro': 12, 'Ken': 9}", "{'Taro': 12}", "{'Ken': 9}", "{'Taro': 9}"],
      explain: "ないキーに代入すると、新しい組が追加されます。辞書は入れた順を覚えているので、Taro が先です。",
      ref: "dict"
    },
    {
      id: "d03", q: "このコードの出力は?", kind: "output",
      code: "ages = {\"Taro\": 12}\nprint(ages.get(\"Jiro\", 0))",
      choices: ["0", "None", "12", "エラーになる"],
      explain: "`get(キー, 既定値)` は、キーがないとき既定値を返します。ここでは 0。既定値を書かなければ None です。",
      ref: "dict-get"
    },
    {
      id: "d04", q: "このコードを実行すると、どうなる?", kind: "text",
      code: "ages = {\"Taro\": 12}\nprint(ages[\"Jiro\"])",
      choices: [
        "エラー(KeyError)になる",
        "None と出る",
        "0 と出る",
        "新しいキー Jiro が作られる"
      ],
      explain: "`d[キー]` で取り出すとき、キーがないとエラーになります。ないかもしれないときは `get()` を使います。",
      ref: "dict-get"
    },
    {
      id: "d05", q: "キーと値の組を順に取り出します。空欄に入るのは?", kind: "code",
      code: "ages = {\"Taro\": 12, \"Hana\": 10}\nfor name, age in ages.____():\n    print(name, age)",
      choices: ["items", "keys", "values", "pairs"],
      expect: "Taro 12\nHana 10",
      explain: "`items()` は (キー, 値) の組を返すので、`name, age` の2つで受け取れます。`keys()` や `values()` は1つずつしか返しません。",
      ref: "dict-loop"
    },
    {
      id: "d06", q: "このコードの出力は?", kind: "output",
      code: "print(len({\"a\": 1, \"b\": 2, \"c\": 3}))",
      choices: ["3", "6", "2", "1"],
      explain: "辞書の `len()` は、キーと値の組の数(キーの数)です。",
      ref: "dict"
    },
    {
      id: "d07", q: "このコードの出力は?", kind: "output",
      code: "d = {\"a\": 1, \"b\": 2}\nprint(1 in d)",
      choices: ["False", "True", "1", "a"],
      explain: "辞書の `in` は、キーにあるかを調べます。1 は値で、キーではないので False です。値を調べるなら `1 in d.values()` です。",
      ref: "dict"
    },
    {
      id: "d08", q: "このコードの出力は?", kind: "output",
      code: "d = {\"x\": 1}\nd[\"x\"] = 5\nprint(d)",
      choices: ["{'x': 5}", "{'x': 1, 'x': 5}", "{'x': 1}", "{'x': 6}"],
      explain: "同じキーは1つしか持てません。あるキーに代入すると、値が上書きされます。",
      ref: "dict"
    },
    {
      id: "d09", q: "このコードの出力は?", kind: "output",
      code: "print(len({1, 2, 2, 3, 3, 3}))",
      choices: ["3", "6", "2", "1"],
      explain: "集合では同じ値が1つにまとまります。残るのは 1・2・3 の3つです。",
      ref: "set"
    },
    {
      id: "d10", q: "このコードの出力は?", kind: "output",
      code: "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a & b))",
      choices: ["[2, 3]", "[1, 2, 3, 4]", "[1, 4]", "[1]"],
      explain: "`&` は両方にある値(積)です。2 と 3 が両方にあります。全部を集めるのは `|` です。",
      ref: "set-ops"
    },
    {
      id: "d11", q: "このコードの出力は?", kind: "output",
      code: "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a | b))",
      choices: ["[1, 2, 3, 4]", "[2, 3]", "[1, 2, 3, 2, 3, 4]", "[1, 4]"],
      explain: "`|` はどちらかにある値(和)です。集合なので、両方にある 2・3 も1つずつです。",
      ref: "set-ops"
    },
    {
      id: "d12", q: "集合に 3 を足します。空欄に入るのは?", kind: "code",
      code: "s = {1, 2}\ns.____(3)\nprint(len(s))",
      choices: ["add", "append", "push", "insert"],
      expect: "3",
      explain: "集合に足すのは `add()` です。集合には順番がないので、「最後に足す」意味の `append()` はありません。",
      ref: "set"
    },
    {
      id: "d13", q: "このコードの出力は?", kind: "output",
      code: "d = {\"a\": 1, \"b\": 2}\nprint(list(d.keys()))",
      choices: ["['a', 'b']", "[1, 2]", "[('a', 1), ('b', 2)]", "['a', 1, 'b', 2]"],
      explain: "`keys()` はキーだけです。値は `values()`、組は `items()` で取り出します。",
      ref: "dict-loop"
    },
    {
      id: "d14", q: "このコードの出力は?", kind: "output",
      code: "count = {}\nfor w in [\"a\", \"b\", \"a\"]:\n    count[w] = count.get(w, 0) + 1\nprint(count)",
      choices: ["{'a': 2, 'b': 1}", "{'a': 1, 'b': 1}", "{'a': 3}", "{'a': 2}"],
      explain: "初めての単語は `get(w, 0)` が 0 を返すので 1 になり、2回目の a は 1 + 1 = 2 になります。単語を数える定番の書き方です。",
      ref: "dict-get"
    }
  ]
});


// =====================================================================
// 05 条件分岐
// =====================================================================
PYD.register("if", {
  cards: [
    {
      id: "if", name: "if / else", read: "条件で分ける",
      desc: "`if 条件:` の下に、条件が成り立つ(`True`)ときの処理を書きます。成り立たないときの処理は `else:` の下に書きます。行の終わりの `:` と、下の行の字下げ(インデント)が必要です。",
      examples: [
        ["x = 7\nif x > 5:\n    print(\"大\")\nelse:\n    print(\"小\")", "大"]
      ],
      notes: ["字下げは半角スペース4つが標準です。同じかたまりの行は、字下げをそろえます。", "字下げを忘れると、エラー(IndentationError)になります。"]
    },
    {
      id: "elif", name: "elif", read: "次の条件",
      desc: "`elif 条件:` は「そうでなくて、もし〜なら」です。上から順に調べ、最初に成り立ったところだけを実行して、残りは調べません。",
      examples: [
        ["score = 75\nif score >= 80:\n    print(\"A\")\nelif score >= 60:\n    print(\"B\")\nelse:\n    print(\"C\")", "B"],
        ["x = 10\nif x > 5:\n    print(\"A\")\nif x > 8:\n    print(\"B\")", "A\nB"]
      ],
      notes: ["`else if` とは書きません。`elif` です。", "`if` を2つ並べると、それぞれ別に調べるので、両方が実行されることがあります。"]
    },
    {
      id: "compare", name: "== != < <= > >=", read: "比べる",
      desc: "`==` 等しい、`!=` 等しくない、`<` `<=` `>` `>=` 大小。結果は `True` か `False` です。`1 < x < 5` のように続けて書けます。`None` かどうかは `is None` で調べます。",
      examples: [
        ["print(3 == 3.0)\nprint(5 != 5)\nprint(1 < 2 < 3)", "True\nFalse\nTrue"],
        ["x = None\nprint(x is None)", "True"]
      ],
      notes: ["`=` は代入、`==` は比べる記号です。`if x = 0:` はエラーになります。"]
    },
    {
      id: "logic", name: "and / or / not", read: "条件を組み合わせる",
      desc: "`A and B` は両方が成り立つとき、`A or B` はどちらかが成り立つとき `True`。`not A` は反対にします。",
      examples: [
        ["age = 15\nprint(age >= 13 and age <= 19)\nprint(age < 6 or age > 64)\nprint(not age > 10)", "True\nFalse\nFalse"]
      ],
      notes: ["Pythonでは `&&` `||` `!` ではなく、英単語の `and` `or` `not` を使います。"]
    },
    {
      id: "truthy", name: "真偽値として使う", read: "空は False",
      desc: "`if` の条件には、`True` / `False` 以外の値も書けます。`0`、`0.0`、空の文字列 `\"\"`、空のリスト `[]`、空の辞書 `{}`、`None` は `False` あつかい、それ以外は `True` あつかいです。`bool(値)` で確かめられます。",
      examples: [
        ["items = []\nif items:\n    print(\"あり\")\nelse:\n    print(\"空\")", "空"],
        ["print(bool(0), bool(\"\"), bool(\"0\"), bool([0]))", "False False True True"]
      ],
      notes: ["`\"0\"` や `\" \"`(空白1つ)は、空ではない文字列なので `True` あつかいです。"]
    }
  ],
  questions: [
    {
      id: "i01", q: "このコードの出力は?", kind: "output",
      code: "x = 7\nif x > 5:\n    print(\"大\")\nelse:\n    print(\"小\")",
      choices: ["大", "小", "大\n小", "x"],
      explain: "7 > 5 が成り立つので、`if` の下だけが実行されます。`else` の下は実行されません。",
      ref: "if"
    },
    {
      id: "i02", q: "このコードの出力は?", kind: "output",
      code: "score = 75\nif score >= 80:\n    print(\"A\")\nelif score >= 60:\n    print(\"B\")\nelse:\n    print(\"C\")",
      choices: ["B", "A", "C", "B\nC"],
      explain: "上から調べます。75 >= 80 は成り立たず、75 >= 60 が成り立つので B。そこで終わり、`else` は実行されません。",
      ref: "elif"
    },
    {
      id: "i03", q: "このコードの出力は?", kind: "output",
      code: "print(3 == 3.0)",
      choices: ["True", "False", "3", "エラーになる"],
      explain: "整数の 3 と小数の 3.0 は、型は違っても値が等しいので `==` は True です。",
      ref: "compare"
    },
    {
      id: "i04", q: "このコードの出力は?", kind: "output",
      code: "print(not (3 > 1))",
      choices: ["False", "True", "None", "not True"],
      explain: "3 > 1 は True。`not` で反対になって False です。",
      ref: "logic"
    },
    {
      id: "i05", q: "13以上「かつ」19以下のとき「10代」と出します。空欄に入るのは?", kind: "code",
      code: "age = 25\nif age >= 13 ____ age <= 19:\n    print(\"10代\")\nelse:\n    print(\"10代ではない\")",
      choices: ["and", "or", "&&", "also"],
      expect: "10代ではない",
      explain: "「かつ」は `and` です。`or` だと「13以上 または 19以下」になり、25 でも「10代」と出てしまいます。`&&` はPythonでは使えません。",
      ref: "logic"
    },
    {
      id: "i06", q: "x が 0 と等しいかを調べます。空欄に入るのは?", kind: "code",
      code: "x = 0\nif x ____ 0:\n    print(\"ゼロ\")",
      choices: ["==", "=", "===", "!="],
      expect: "ゼロ",
      explain: "等しいかを比べるのは `==` です。`=` は代入なのでエラー、`===` はJavaScriptの書き方で、Pythonにはありません。",
      ref: "compare"
    },
    {
      id: "i07", q: "このコードの出力は?", kind: "output",
      code: "items = []\nif items:\n    print(\"あり\")\nelse:\n    print(\"空\")",
      choices: ["空", "あり", "[]", "False"],
      explain: "空のリストは `False` あつかいなので、`else` のほうが実行されます。",
      ref: "truthy"
    },
    {
      id: "i08", q: "このコードの出力は?", kind: "output",
      code: "print(bool(\"0\"))",
      choices: ["True", "False", "0", "None"],
      explain: "`\"0\"` は「0 という文字が1つある文字列」で、空ではないので True です。数の `0` なら False です。",
      ref: "truthy"
    },
    {
      id: "i09", q: "このコードの出力は?", kind: "output",
      code: "x = 10\nif x > 5:\n    print(\"A\")\nif x > 8:\n    print(\"B\")",
      choices: ["A\nB", "A", "B", "AB"],
      explain: "`if` が2つ並んでいるので、それぞれ別に調べます。どちらも成り立つので A と B が1行ずつ出ます。`elif` なら A だけです。",
      ref: "elif"
    },
    {
      id: "i10", q: "このコードの出力は?", kind: "output",
      code: "a = 3\nb = 5\nprint(a > 2 and b > 6)",
      choices: ["False", "True", "True False", "5"],
      explain: "a > 2 は True ですが、b > 6 は False。`and` は両方が True のときだけ True なので、False です。",
      ref: "logic"
    },
    {
      id: "i11", q: "このコードを実行すると、どうなる?", kind: "text",
      code: "x = 1\nif x > 0:\nprint(\"正\")",
      choices: [
        "エラー(IndentationError)になる",
        "正 と出る",
        "何も出ない",
        "x が正のときだけ 正 と出る(エラーにはならない)"
      ],
      explain: "`if 条件:` の下の行は、字下げ(インデント)が必要です。字下げがないとエラーになり、何も実行されません。",
      ref: "if"
    },
    {
      id: "i12", q: "偶数でなければ「奇数」と出します。空欄に入るのは?", kind: "code",
      code: "n = 7\nif n % 2 == 0:\n    print(\"偶数\")\n____:\n    print(\"奇数\")",
      choices: ["else", "elif", "else if", "otherwise"],
      expect: "奇数",
      explain: "「それ以外のとき」は `else:` です。`elif` には条件が必要で、`else if` はPythonでは書けません。",
      ref: "if"
    },
    {
      id: "i13", q: "このコードの出力は?", kind: "output",
      code: "x = None\nif x is None:\n    print(\"なし\")\nelse:\n    print(x)",
      choices: ["なし", "None", "x", "False"],
      explain: "x は None なので `x is None` は True になり、「なし」と出ます。",
      ref: "compare"
    },
    {
      id: "i14", q: "このコードの出力は?", kind: "output",
      code: "x = 4\nif 1 < x < 5:\n    print(\"範囲内\")\nelse:\n    print(\"範囲外\")",
      choices: ["範囲内", "範囲外", "True", "エラーになる"],
      explain: "`1 < x < 5` は「1 < x かつ x < 5」と同じ意味です。4 はどちらも満たすので「範囲内」です。",
      ref: "compare"
    }
  ]
});


// =====================================================================
// 06 繰り返し
// =====================================================================
PYD.register("loop", {
  cards: [
    {
      id: "for", name: "for 変数 in …:", read: "順に取り出してくり返す",
      desc: "`for x in リスト:` は、リストの要素を前から1つずつ x に入れて、下の字下げした処理をくり返します。文字列なら1文字ずつ、辞書ならキーを1つずつ取り出します。",
      examples: [
        ["total = 0\nfor n in [1, 2, 3, 4]:\n    total += n\nprint(total)", "10"],
        ["for c in \"abc\":\n    print(c * 2)", "aa\nbb\ncc"]
      ],
      notes: ["行の終わりの `:` と、くり返す行の字下げを忘れないように。"]
    },
    {
      id: "range", name: "range()", read: "数の並び",
      desc: "`range(5)` は 0〜4、`range(2, 6)` は 2〜5、`range(0, 10, 3)` は 0, 3, 6, 9。終わりの数は含みません。`for i in range(回数):` で、決まった回数くり返せます。",
      examples: [
        ["for i in range(3):\n    print(i)", "0\n1\n2"],
        ["print(list(range(2, 8, 2)))", "[2, 4, 6]"]
      ],
      notes: ["`range(3)` は 1, 2, 3 ではなく 0, 1, 2 です。"]
    },
    {
      id: "while", name: "while 条件:", read: "条件のあいだくり返す",
      desc: "`while 条件:` は、条件が成り立っているあいだ、下の処理をくり返します。くり返しの中で、いつか条件が成り立たなくなるようにします。",
      examples: [
        ["n = 1\nwhile n < 20:\n    n = n * 3\nprint(n)", "27"]
      ],
      notes: ["条件がずっと成り立つと、止まらなくなります(無限ループ)。止めるには Ctrl+C を押します。"]
    },
    {
      id: "break-continue", name: "break / continue", read: "ぬける・とばす",
      desc: "`break` はくり返しをその場で終わらせます。`continue` はその回の残りをとばして、次の回へ進みます。",
      examples: [
        ["for i in range(10):\n    if i == 3:\n        break\n    print(i)", "0\n1\n2"],
        ["for i in range(5):\n    if i % 2 == 0:\n        continue\n    print(i)", "1\n3"]
      ]
    },
    {
      id: "enumerate", name: "enumerate()", read: "番号つきで取り出す",
      desc: "`for i, x in enumerate(リスト):` で、番号 i と要素 x を同時に取り出します。番号は 0 から。`enumerate(リスト, 1)` なら 1 から数えます。",
      examples: [
        ["for i, name in enumerate([\"A\", \"B\"]):\n    print(i, name)", "0 A\n1 B"],
        ["for i, w in enumerate([\"a\", \"bb\"], 1):\n    print(i, w)", "1 a\n2 bb"]
      ]
    },
    {
      id: "zip", name: "zip()", read: "2つを並べて取り出す",
      desc: "`for a, b in zip(リスト1, リスト2):` で、2つのリストの同じ番号の要素を組にして取り出します。短いほうに合わせて終わります。",
      examples: [
        ["names = [\"Aki\", \"Ben\"]\nscores = [80, 95]\nfor n, s in zip(names, scores):\n    print(n, s)", "Aki 80\nBen 95"]
      ]
    }
  ],
  questions: [
    {
      id: "o01", q: "このコードの出力は?", kind: "output",
      code: "for i in range(3):\n    print(i)",
      choices: ["0\n1\n2", "1\n2\n3", "0\n1\n2\n3", "0 1 2"],
      explain: "`range(3)` は 0, 1, 2 の3つです。`print()` は毎回改行するので、1行に1つずつ出ます。",
      ref: "range"
    },
    {
      id: "o02", q: "このコードの出力は?", kind: "output",
      code: "print(list(range(2, 8, 2)))",
      choices: ["[2, 4, 6]", "[2, 4, 6, 8]", "[2, 3, 4, 5, 6, 7]", "[4, 6, 8]"],
      explain: "`range(開始, 終わり, 間隔)`。2 から 2 ずつ、8 の手前まで。8 は含みません。",
      ref: "range"
    },
    {
      id: "o03", q: "このコードの出力は?", kind: "output",
      code: "total = 0\nfor n in [1, 2, 3, 4]:\n    total += n\nprint(total)",
      choices: ["10", "4", "1234", "1\n3\n6\n10"],
      explain: "total に 1, 2, 3, 4 を順に足して 10。`print` はくり返しの外(字下げなし)なので、最後に1回だけ出ます。",
      ref: "for"
    },
    {
      id: "o04", q: "このコードの出力は?", kind: "output",
      code: "for c in \"abc\":\n    print(c * 2)",
      choices: ["aa\nbb\ncc", "abcabc", "a\nb\nc", "aabbcc"],
      explain: "文字列を `for` で回すと、1文字ずつ取り出します。それぞれを2回くり返して、1行ずつ出ます。",
      ref: "for"
    },
    {
      id: "o05", q: "このコードの出力は?", kind: "output",
      code: "n = 1\nwhile n < 20:\n    n = n * 3\nprint(n)",
      choices: ["27", "9", "20", "81"],
      explain: "n は 1 → 3 → 9 → 27 と増えます。27 になったとき `n < 20` が成り立たなくなり、くり返しが終わります。",
      ref: "while"
    },
    {
      id: "o06", q: "このコードの出力は?", kind: "output",
      code: "for i in range(10):\n    if i == 3:\n        break\n    print(i)",
      choices: ["0\n1\n2", "0\n1\n2\n3", "3", "0\n1\n2\n4\n5\n6\n7\n8\n9"],
      explain: "i が 3 になったところで `break` し、くり返しを終わります。`print(i)` は `break` のあとなので、3 は出ません。",
      ref: "break-continue"
    },
    {
      id: "o07", q: "このコードの出力は?", kind: "output",
      code: "for i in range(5):\n    if i % 2 == 0:\n        continue\n    print(i)",
      choices: ["1\n3", "0\n2\n4", "1\n3\n5", "0\n1"],
      explain: "偶数のときは `continue` で `print` をとばします。0〜4 のうち奇数の 1 と 3 だけが出ます。",
      ref: "break-continue"
    },
    {
      id: "o08", q: "番号と要素を同時に取り出します。空欄に入るのは?", kind: "code",
      code: "for i, name in ____([\"A\", \"B\"]):\n    print(i, name)",
      choices: ["enumerate", "range", "zip", "list"],
      expect: "0 A\n1 B",
      explain: "`enumerate()` は (番号, 要素) の組を返します。`range()` にはリストを渡せず、`zip()` にリストを1つだけ渡すと、組が1つずつしかないので `i, name` に分けられません。",
      ref: "enumerate"
    },
    {
      id: "o09", q: "このコードの出力は?", kind: "output",
      code: "names = [\"Aki\", \"Ben\"]\nscores = [80, 95]\nfor n, s in zip(names, scores):\n    print(n, s)",
      choices: ["Aki 80\nBen 95", "Aki Ben\n80 95", "Aki 95\nBen 80", "Aki 80 Ben 95"],
      explain: "`zip` は同じ番号どうしを組にします。(Aki, 80) と (Ben, 95) の順に取り出します。",
      ref: "zip"
    },
    {
      id: "o10", q: "0 から 4 までのリストを作ります。空欄に入るのは?", kind: "code",
      code: "print(list(range(____)))",
      choices: ["5", "4", "1, 5", "0, 4"],
      accepts: ["0, 5"],
      expect: "[0, 1, 2, 3, 4]",
      explain: "`range(5)` は 0〜4 です。終わりの数は含まないので、4 までほしいときは 5 と書きます(`range(0, 5)` でも同じ)。",
      ref: "range"
    },
    {
      id: "o11", q: "このコードを実行すると、どうなる?", kind: "text",
      code: "n = 0\nwhile True:\n    n += 1",
      choices: [
        "止まらずにくり返し続ける(無限ループ)",
        "1回だけ実行して終わる",
        "エラーになる",
        "n が 0 なので1回も実行しない"
      ],
      explain: "条件が `True` のままなので、`break` がなければ終わりません。止めるには Ctrl+C を押します。",
      ref: "while"
    },
    {
      id: "o12", q: "このコードの出力は?", kind: "output",
      code: "for i in range(2):\n    for j in range(2):\n        print(i, j)",
      choices: ["0 0\n0 1\n1 0\n1 1", "0 0\n1 1", "0 0\n1 0\n0 1\n1 1", "0 1\n1 0"],
      explain: "外の i が 0 のあいだに、内の j が 0, 1 と回ります。次に i が 1 になって、また j が 0, 1 と回ります。",
      ref: "for"
    },
    {
      id: "o13", q: "10 より大きい数が出たら、くり返しを終わらせます。空欄に入るのは?", kind: "code",
      code: "for n in [3, 12, 5]:\n    if n > 10:\n        ____\n    print(n)",
      choices: ["break", "continue", "stop", "exit"],
      expect: "3",
      explain: "`break` でくり返しが終わるので、3 だけが出ます。`continue` だと 12 をとばすだけで、5 も出ます。",
      ref: "break-continue"
    },
    {
      id: "o14", q: "このコードの出力は?", kind: "output",
      code: "words = [\"a\", \"bb\", \"ccc\"]\nfor i, w in enumerate(words, 1):\n    print(i, w)",
      choices: ["1 a\n2 bb\n3 ccc", "0 a\n1 bb\n2 ccc", "a 1\nbb 2\nccc 3", "1 a\n1 bb\n1 ccc"],
      explain: "`enumerate(リスト, 1)` の2つめの引数は、番号を数え始める数です。1 から数えます。",
      ref: "enumerate"
    }
  ]
});


// =====================================================================
// 07 関数
// =====================================================================
PYD.register("func", {
  cards: [
    {
      id: "def", name: "def / return", read: "関数を作る",
      desc: "`def 名前(引数):` で関数を作り、字下げした中に処理を書きます。`return 値` で結果を返し、そこで関数は終わります。`return` がない関数は `None` を返します。",
      examples: [
        ["def double(x):\n    return x * 2\n\nprint(double(4))", "8"],
        ["def f():\n    print(\"A\")\n\nx = f()\nprint(x)", "A\nNone"],
        ["def min_max(a):\n    return min(a), max(a)\n\nlo, hi = min_max([4, 1, 7])\nprint(lo, hi)", "1 7"]
      ],
      notes: ["`print` は画面に出すだけで、値を返しません。結果をあとで使うなら `return` です。", "カンマで並べて返すと、タプルとしてまとめて返ります。"]
    },
    {
      id: "default-arg", name: "引数の既定値", read: "省略できる引数",
      desc: "`def f(a, b=10):` のように書くと、呼ぶときに b を省略でき、そのときは 10 が使われます。既定値のある引数は、ない引数よりあとに並べます。",
      examples: [
        ["def greet(name, msg=\"こんにちは\"):\n    print(msg, name)\n\ngreet(\"Ken\")\ngreet(\"Ami\", \"やあ\")", "こんにちは Ken\nやあ Ami"]
      ],
      notes: ["`def f(a=1, b):` はエラー(SyntaxError)です。"]
    },
    {
      id: "keyword-arg", name: "キーワード引数", read: "名前で渡す",
      desc: "呼ぶときに `f(h=3, w=5)` のように `引数名=値` で渡すと、順番に関係なく、名前で引数を指定できます。",
      examples: [
        ["def area(w, h):\n    return w * h\n\nprint(area(h=3, w=5))\nprint(area(5, h=3))", "15\n15"]
      ],
      notes: ["順番で渡す引数は、キーワード引数より前に書きます(`area(w=5, 3)` はエラー)。"]
    },
    {
      id: "star-args", name: "*args", read: "いくつでも受け取る",
      desc: "`def f(*nums):` と書くと、渡された値をいくつでもまとめてタプルで受け取れます。`def f(a, *rest):` なら、最初の1つが a、残りが rest に入ります。",
      examples: [
        ["def total(*nums):\n    return sum(nums)\n\nprint(total(1, 2, 3))", "6"],
        ["def f(a, *rest):\n    print(a, rest)\n\nf(1, 2, 3)", "1 (2, 3)"]
      ]
    },
    {
      id: "scope", name: "スコープと global", read: "変数の見える範囲",
      desc: "関数の中で値を入れた変数は、その関数の中だけの変数(ローカル変数)になり、外の同じ名前の変数は変わりません。外の変数を書きかえたいときは `global 名前` と宣言します。",
      examples: [
        ["x = 10\n\ndef change():\n    x = 99\n\nchange()\nprint(x)", "10"],
        ["count = 0\n\ndef up():\n    global count\n    count += 1\n\nup()\nprint(count)", "1"]
      ],
      notes: ["`global` を多用すると、どこで値が変わるか追いにくくなります。ふつうは引数と `return` でやりとりします。"]
    },
    {
      id: "lambda", name: "lambda", read: "名前のない小さな関数",
      desc: "`lambda 引数: 式` で、式1つだけの小さな関数を作ります。`sorted(…, key=lambda p: p[1])` のように、関数を渡すところでよく使います。",
      examples: [
        ["square = lambda n: n ** 2\nprint(square(5))", "25"],
        ["people = [(\"Ken\", 30), (\"Ami\", 25)]\nprint(sorted(people, key=lambda p: p[1]))", "[('Ami', 25), ('Ken', 30)]"]
      ],
      notes: ["`lambda` の中には `return` を書きません。式の値がそのまま返ります。"]
    }
  ],
  questions: [
    {
      id: "f01", q: "このコードの出力は?", kind: "output",
      code: "def double(x):\n    return x * 2\n\nprint(double(4))",
      choices: ["8", "4", "x * 2", "None"],
      explain: "`double(4)` で x に 4 が入り、`4 * 2` の 8 が返ります。",
      ref: "def"
    },
    {
      id: "f02", q: "足し算の結果を返す関数にします。空欄に入るのは?", kind: "code",
      code: "def add(a, b):\n    ____ a + b\n\nprint(add(2, 3))",
      choices: ["return", "print", "yield", "give"],
      expect: "5",
      explain: "結果を返すのは `return` です。`print a + b` はPython 3ではエラーです(`print(a + b)` なら画面に出ますが、値は返しません)。",
      ref: "def"
    },
    {
      id: "f03", q: "このコードの出力は?", kind: "output",
      code: "def greet(name, msg=\"こんにちは\"):\n    print(msg, name)\n\ngreet(\"Ken\")\ngreet(\"Ami\", \"やあ\")",
      choices: ["こんにちは Ken\nやあ Ami", "Ken こんにちは\nAmi やあ", "こんにちは Ken\nこんにちは Ami", "こんにちは Ken"],
      explain: "1回目は msg を省いたので既定値の「こんにちは」、2回目は「やあ」が使われます。`print(msg, name)` なので msg が先です。",
      ref: "default-arg"
    },
    {
      id: "f04", q: "このコードの出力は?", kind: "output",
      code: "def f():\n    print(\"A\")\n\nx = f()\nprint(x)",
      choices: ["A\nNone", "A", "None", "A\nA"],
      explain: "`f()` を呼んだときに A が出ます。f には `return` がないので None が返り、x は None です。",
      ref: "def"
    },
    {
      id: "f05", q: "このコードの出力は?", kind: "output",
      code: "def area(w, h):\n    return w * h\n\nprint(area(h=3, w=5))",
      choices: ["15", "8", "2", "エラーになる"],
      explain: "キーワード引数なので、順番が逆でも w に 5、h に 3 が入ります。5 × 3 = 15 です。",
      ref: "keyword-arg"
    },
    {
      id: "f06", q: "このコードの出力は?", kind: "output",
      code: "def total(*nums):\n    return sum(nums)\n\nprint(total(1, 2, 3))",
      choices: ["6", "(1, 2, 3)", "1", "3"],
      explain: "`*nums` には、渡した値がタプル (1, 2, 3) としてまとめて入ります。その合計で 6 です。",
      ref: "star-args"
    },
    {
      id: "f07", q: "このコードの出力は?", kind: "output",
      code: "x = 10\n\ndef change():\n    x = 99\n\nchange()\nprint(x)",
      choices: ["10", "99", "None", "エラーになる"],
      explain: "関数の中の `x = 99` は、関数の中だけの新しい変数です。外の x は 10 のままです。",
      ref: "scope"
    },
    {
      id: "f08", q: "このコードの出力は?", kind: "output",
      code: "square = lambda n: n ** 2\nprint(square(5))",
      choices: ["25", "10", "5", "n ** 2"],
      explain: "`lambda n: n ** 2` は「n を受け取って n の2乗を返す」関数です。5 の2乗で 25。",
      ref: "lambda"
    },
    {
      id: "f09", q: "関数 hello を作ります。空欄に入るのは?", kind: "code",
      code: "____ hello():\n    print(\"hi\")\n\nhello()",
      choices: ["def", "function", "func", "fn"],
      expect: "hi",
      explain: "Pythonの関数は `def` で作ります。`function` はJavaScript、`func` はGo、`fn` はRustの書き方です。",
      ref: "def"
    },
    {
      id: "f10", q: "このように関数を作ろうとすると、どうなる?", kind: "text",
      code: "def f(a=1, b):\n    return a + b",
      choices: [
        "エラー(SyntaxError)になる",
        "b にも 1 が入る",
        "b は None になる",
        "呼ぶときに b を渡せば動く"
      ],
      explain: "既定値のある引数(a=1)のあとに、既定値のない引数(b)は置けません。`def f(b, a=1):` の順にします。",
      ref: "default-arg"
    },
    {
      id: "f11", q: "このコードの出力は?", kind: "output",
      code: "def sign(n):\n    if n < 0:\n        return \"負\"\n    return \"0以上\"\n\nprint(sign(-3))\nprint(sign(4))",
      choices: ["負\n0以上", "負", "負\n負", "0以上\n0以上"],
      explain: "-3 のときは最初の `return` で「負」を返し、そこで関数が終わります。4 のときは if を通らず「0以上」を返します。",
      ref: "def"
    },
    {
      id: "f12", q: "このコードの出力は?", kind: "output",
      code: "def min_max(a):\n    return min(a), max(a)\n\nlo, hi = min_max([4, 1, 7])\nprint(lo, hi)",
      choices: ["1 7", "4 7", "(1, 7)", "7 1"],
      explain: "`return min(a), max(a)` はタプル (1, 7) を返し、`lo, hi =` でアンパックされます。",
      ref: "def"
    },
    {
      id: "f13", q: "関数の中から、外の変数 count を書きかえます。空欄に入るのは?", kind: "code",
      code: "count = 0\n\ndef up():\n    ____ count\n    count += 1\n\nup()\nprint(count)",
      choices: ["global", "local", "nonlocal", "var"],
      expect: "1",
      explain: "`global count` と宣言すると、関数の中の count が外の count を指します。`nonlocal` は関数の中の関数で使う書き方で、ここではエラーです。",
      ref: "scope"
    },
    {
      id: "f14", q: "このコードの出力は?", kind: "output",
      code: "def f(a, *rest):\n    print(a, rest)\n\nf(1, 2, 3)",
      choices: ["1 (2, 3)", "1 [2, 3]", "1 2 3", "(1, 2, 3)"],
      explain: "最初の 1 が a に入り、残りの 2 と 3 がタプルにまとまって rest に入ります。タプルは `( )` で出ます。",
      ref: "star-args"
    }
  ]
});


// =====================================================================
// 08 内包表記と組み込み関数
// =====================================================================
PYD.register("comp", {
  cards: [
    {
      id: "listcomp", name: "[式 for x in … if 条件]", read: "リスト内包表記",
      desc: "`[式 for x in リスト]` で、要素ごとに式を計算した新しいリストを1行で作れます。うしろに `if 条件` をつけると、条件に合う要素だけを使います。",
      examples: [
        ["print([n * 2 for n in range(4)])", "[0, 2, 4, 6]"],
        ["print([n for n in range(10) if n % 3 == 0])", "[0, 3, 6, 9]"],
        ["# 同じことを for で書くと\nresult = []\nfor n in range(4):\n    result.append(n * 2)\nprint(result)", "[0, 2, 4, 6]"]
      ]
    },
    {
      id: "dictcomp", name: "{k: v for …}", read: "辞書内包表記",
      desc: "`{キー: 値 for x in …}` で辞書を1行で作れます。`for k, v in d.items()` と組み合わせると、辞書を変換できます。",
      examples: [
        ["print({w: len(w) for w in [\"go\", \"rust\"]})", "{'go': 2, 'rust': 4}"],
        ["prices = {\"apple\": 100, \"pen\": 50}\nprint({k: v // 2 for k, v in prices.items()})", "{'apple': 50, 'pen': 25}"]
      ]
    },
    {
      id: "sorted", name: "sorted(…, key=, reverse=)", read: "並べた新しいリスト",
      desc: "`sorted(リスト)` は小さい順に並べた新しいリストを返し、もとのリストは変えません。`reverse=True` で大きい順、`key=関数` で「何を基準に並べるか」を決めます(例: `key=len` は長さの順)。",
      examples: [
        ["a = [3, 1, 2]\nb = sorted(a)\nprint(a, b)", "[3, 1, 2] [1, 2, 3]"],
        ["print(sorted([3, 1, 2], reverse=True))", "[3, 2, 1]"],
        ["words = [\"banana\", \"fig\", \"apple\"]\nprint(sorted(words, key=len))", "['fig', 'apple', 'banana']"]
      ],
      notes: ["`a.sort()` はもとのリストを変えて `None` を返します。`sorted(a)` は新しいリストを返します。", "`max(…, key=len)` のように、`max` と `min` にも `key=` を使えます。"]
    },
    {
      id: "sum-max-min", name: "sum / max / min / len", read: "集計する",
      desc: "`sum(リスト)` 合計、`max()` 最大、`min()` 最小、`len()` 個数。平均は `sum(a) / len(a)` で求めます。",
      examples: [
        ["a = [4, 9, 2]\nprint(sum(a), max(a), min(a), len(a))", "15 9 2 3"],
        ["a = [1, 2, 3]\nprint(sum(a) / len(a))", "2.0"]
      ]
    },
    {
      id: "any-all", name: "any() / all()", read: "1つでも / すべて",
      desc: "`any(リスト)` は1つでも True あつかいのものがあれば `True`。`all(リスト)` はすべてが True あつかいなら `True`。内包表記と組み合わせて「条件に合うものがあるか」を調べます。",
      examples: [
        ["print(any([0, 0, 1]), all([1, 1, 0]))", "True False"],
        ["scores = [70, 85, 90]\nprint(all(s >= 60 for s in scores))", "True"]
      ]
    }
  ],
  questions: [
    {
      id: "c01", q: "このコードの出力は?", kind: "output",
      code: "print([n * 2 for n in range(4)])",
      choices: ["[0, 2, 4, 6]", "[2, 4, 6, 8]", "[0, 1, 2, 3]", "[0, 2, 4, 6, 8]"],
      explain: "`range(4)` の 0, 1, 2, 3 をそれぞれ2倍したリストです。",
      ref: "listcomp"
    },
    {
      id: "c02", q: "このコードの出力は?", kind: "output",
      code: "print([n for n in range(10) if n % 3 == 0])",
      choices: ["[0, 3, 6, 9]", "[3, 6, 9]", "[0, 3, 6]", "[True, False, False, True, False, False, True, False, False, True]"],
      explain: "0〜9 のうち、3 で割った余りが 0 のものだけが残ります。0 も 3 で割り切れるので入ります。",
      ref: "listcomp"
    },
    {
      id: "c03", q: "1, 4, 9 のリストを作ります。空欄に入るのは?", kind: "code",
      code: "squares = [n ** 2 ____ n in range(1, 4)]\nprint(squares)",
      choices: ["for", "in", "of", "each"],
      expect: "[1, 4, 9]",
      explain: "内包表記は `[式 for 変数 in …]` の形です。`in` はすでにうしろにあります。",
      ref: "listcomp"
    },
    {
      id: "c04", q: "このコードの出力は?", kind: "output",
      code: "print({w: len(w) for w in [\"go\", \"rust\"]})",
      choices: ["{'go': 2, 'rust': 4}", "{2: 'go', 4: 'rust'}", "['go', 'rust']", "{'go', 'rust'}"],
      explain: "`w: len(w)` なので、キーが単語、値がその長さの辞書になります。",
      ref: "dictcomp"
    },
    {
      id: "c05", q: "このコードの出力は?", kind: "output",
      code: "print(sorted([3, 1, 2], reverse=True))",
      choices: ["[3, 2, 1]", "[1, 2, 3]", "[2, 1, 3]", "None"],
      explain: "`reverse=True` で大きい順です。`sorted()` は新しいリストを返すので、None ではありません。",
      ref: "sorted"
    },
    {
      id: "c06", q: "このコードの出力は?", kind: "output",
      code: "words = [\"banana\", \"fig\", \"apple\"]\nprint(sorted(words, key=len))",
      choices: ["['fig', 'apple', 'banana']", "['apple', 'banana', 'fig']", "['banana', 'apple', 'fig']", "[3, 5, 6]"],
      explain: "`key=len` は「長さを基準に並べる」という意味です。3文字・5文字・6文字の順。出てくるのは長さではなく、単語そのものです。",
      ref: "sorted"
    },
    {
      id: "c07", q: "いちばん長い単語を取り出します。空欄に入るのは?", kind: "code",
      code: "words = [\"banana\", \"fig\", \"apple\"]\nprint(max(words, ____=len))",
      choices: ["key", "by", "sort", "order"],
      expect: "banana",
      explain: "`max` も `sorted` と同じく `key=` で基準を決めます。`key` を書かないと、辞書順で最後の \"fig\" が出ます。",
      ref: "sorted"
    },
    {
      id: "c08", q: "このコードの出力は?", kind: "output",
      code: "a = [1, 2, 3]\nprint(sum(a) / len(a))",
      choices: ["2.0", "2", "6", "3"],
      explain: "合計 6 を個数 3 で割って平均を出します。`/` の答えは小数なので 2.0 です。",
      ref: "sum-max-min"
    },
    {
      id: "c09", q: "このコードの出力は?", kind: "output",
      code: "print(any([0, 0, 1]), all([1, 1, 0]))",
      choices: ["True False", "False True", "True True", "False False"],
      explain: "`any` は1つでも True あつかい(1)があるので True。`all` は 0(False あつかい)がまざっているので False です。",
      ref: "any-all"
    },
    {
      id: "c10", q: "このコードの出力は?", kind: "output",
      code: "a = [3, 1, 2]\nb = sorted(a)\nprint(a, b)",
      choices: ["[3, 1, 2] [1, 2, 3]", "[1, 2, 3] [1, 2, 3]", "[3, 1, 2] None", "[1, 2, 3] None"],
      explain: "`sorted()` は新しいリストを返し、もとの a は変えません。a ごと並べかえるのは `a.sort()` です。",
      ref: "sorted"
    },
    {
      id: "c11", q: "このコードの出力は?", kind: "output",
      code: "nums = [4, 9, 2]\nprint(max(nums), min(nums))",
      choices: ["9 2", "2 9", "4 2", "9 4"],
      explain: "`max` は最大の 9、`min` は最小の 2 です。並び順(先頭・最後)とは関係ありません。",
      ref: "sum-max-min"
    },
    {
      id: "c12", q: "このコードの出力は?", kind: "output",
      code: "print(sum([n for n in range(1, 5)]))",
      choices: ["10", "15", "4", "[1, 2, 3, 4]"],
      explain: "`range(1, 5)` は 1〜4。リストは [1, 2, 3, 4] で、合計は 10 です。5 は含みません。",
      ref: "sum-max-min"
    },
    {
      id: "c13", q: "値を半分にした辞書を作ります。空欄に入るのは?", kind: "code",
      code: "prices = {\"apple\": 100, \"pen\": 50}\nhalf = {k: v // 2 for k, v in prices.____()}\nprint(half)",
      choices: ["items", "keys", "values", "pairs"],
      expect: "{'apple': 50, 'pen': 25}",
      explain: "`k, v` の2つで受け取るので、(キー, 値) の組を返す `items()` を使います。",
      ref: "dictcomp"
    },
    {
      id: "c14", q: "このコードの出力は?", kind: "output",
      code: "people = [(\"Ken\", 30), (\"Ami\", 25)]\nprint(sorted(people, key=lambda p: p[1]))",
      choices: ["[('Ami', 25), ('Ken', 30)]", "[('Ken', 30), ('Ami', 25)]", "[25, 30]", "['Ami', 'Ken']"],
      explain: "`key=lambda p: p[1]` は「組の2番目(年齢)で並べる」という意味です。25 の Ami が先。並ぶのは組そのものです。",
      ref: "sorted"
    }
  ]
});

// ---- 単元 09〜16 ----

// ===== 単元09〜16(class 〜 torch-model) =====

PYD.register("class", {
  cards: [
    { id: "class-def",
      name: "class と __init__",
      read: "設計図とインスタンス",
      desc: "`class 名前:` で、データと処理をまとめた「設計図(クラス)」を作ります。`クラス名(…)` と呼ぶと、設計図から実物(インスタンス)ができ、そのとき `__init__` が自動で呼ばれます。`self.名前 = 値` で、インスタンスごとのデータ(属性)を持たせます。",
      examples: [["class Dog:\n    def __init__(self, name):\n        self.name = name\n\nd = Dog(\"ポチ\")\nprint(d.name)", "ポチ"], ["a = Dog(\"ポチ\")\nb = Dog(\"タマ\")\nprint(a.name, b.name)", "ポチ タマ"]],
      notes: ["クラス名は `Dog` のように大文字で始めるのが慣習です。", "`__init__` は前後にアンダースコアが2つずつです。"] },
    { id: "class-self",
      name: "self とメソッド",
      read: "自分自身を指す引数",
      desc: "クラスの中の関数(メソッド)は、最初の引数に `self` を書きます。`self` は「呼び出したそのインスタンス」です。呼ぶときは `インスタンス.メソッド()` と書き、`self` には何も渡しません(Pythonが自動で入れます)。",
      examples: [["class Counter:\n    def __init__(self):\n        self.count = 0\n    def up(self):\n        self.count += 1\n\nc = Counter()\nc.up()\nc.up()\nprint(c.count)", "2"]],
      notes: ["`self` を書き忘れると、呼んだときに `TypeError`(引数の数が合わない)になります。", "メソッドの中で属性を使うときも `self.count` のように `self.` をつけます。"] },
    { id: "class-attr",
      name: "クラス変数",
      read: "全インスタンスで共有",
      desc: "`class` の直下に書いた変数はクラス変数で、すべてのインスタンスで共有されます。`self.x` に入れる値(インスタンス変数)は、インスタンスごとに別々です。",
      examples: [["class Player:\n    count = 0\n    def __init__(self, name):\n        self.name = name\n        Player.count += 1\n\nPlayer(\"A\")\nPlayer(\"B\")\nprint(Player.count)", "2"]],
      notes: ["リストなど変更できる値を、共有するつもりがないのにクラス変数にすると、全インスタンスで1つのリストを使い回してしまいます。インスタンスごとのものは `__init__` の中で `self.items = []` とします。"] },
    { id: "class-inherit",
      name: "継承と super()",
      read: "クラスを引きつぐ",
      desc: "`class 子(親):` と書くと、親クラスの属性やメソッドを引きつぎます(継承)。同じ名前のメソッドを子で書くと、子のほうが使われます(オーバーライド)。`super().__init__(…)` で親の `__init__` を呼べます。",
      examples: [["class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return \"...\"\n\nclass Cat(Animal):\n    def speak(self):\n        return \"ニャー\"\n\nc = Cat(\"タマ\")\nprint(c.name, c.speak())", "タマ ニャー"], ["class Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)\n        self.breed = breed\n\nd = Dog(\"ポチ\", \"柴\")\nprint(d.name, d.breed)", "ポチ 柴"], ["print(isinstance(c, Animal))", "True"]],
      notes: ["PyTorch のモデルも `class Net(nn.Module):` と継承して作り、`__init__` の最初で `super().__init__()` を呼びます。"] },
    { id: "class-str",
      name: "__str__",
      read: "print したときの見え方",
      desc: "`__str__` メソッドを書くと、`print(インスタンス)` や `str(インスタンス)` のときに、その戻り値の文字列が使われます。書かないと `<__main__.Point object at 0x…>` のような表示になります。",
      examples: [["class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\nprint(Point(2, 5))", "(2, 5)"]],
      notes: ["`__str__` は文字列を `return` します。中で `print` するのではありません。"] }
  ],
  questions: [
    { id: "x01",
      q: "このコードの出力は?",
      code: "class Dog:\n    def __init__(self, name):\n        self.name = name\n\nd = Dog(\"ポチ\")\nprint(d.name)",
      kind: "output",
      choices: ["ポチ", "name", "self.name", "Dog"],
      explain: "`Dog(\"ポチ\")` で `__init__` が呼ばれ、`self.name` に `\"ポチ\"` が入ります。`d.name` はその値です。",
      ref: "class-def" },
    { id: "x02",
      q: "メソッドの最初の引数に入る、インスタンス自身を表す名前は?",
      code: "class Dog:\n    def __init__(____, name):\n        self.name = name\n\nd = Dog(\"ポチ\")\nprint(d.name)",
      kind: "code",
      choices: ["self", "this", "cls", "Dog"],
      expect: "ポチ",
      explain: "Pythonでは最初の引数を `self` と書く決まりです。`this` はJavaScriptなどの書き方です。`cls` はクラスメソッドで使う名前です。",
      ref: "class-self" },
    { id: "x03",
      q: "このコードの出力は?",
      code: "class Counter:\n    def __init__(self):\n        self.count = 0\n    def up(self):\n        self.count += 1\n\nc = Counter()\nc.up()\nc.up()\nc.up()\nprint(c.count)",
      kind: "output",
      choices: ["3", "0", "1", "2"],
      explain: "`__init__` で0になり、`up()` を3回呼ぶたびに `self.count` が1ずつ増えます。",
      ref: "class-self" },
    { id: "x04",
      q: "面積を求めるメソッドを呼んで `12` を出したい。空欄は?",
      code: "class Rect:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nr = Rect(3, 4)\nprint(r.____())",
      kind: "code",
      choices: ["area", "self.area", "Rect", "w * h"],
      expect: "12",
      explain: "メソッドは `インスタンス.メソッド名()` で呼びます。`self` は呼ぶ側では書きません(Pythonが `r` を自動で渡します)。",
      ref: "class-self" },
    { id: "x05",
      q: "このコードの出力は?",
      code: "class Box:\n    def __init__(self):\n        self.items = []\n    def add(self, x):\n        self.items.append(x)\n\na = Box()\nb = Box()\na.add(1)\nb.add(2)\na.add(3)\nprint(a.items)",
      kind: "output",
      choices: ["[1, 3]", "[1, 2, 3]", "[3]", "[2]"],
      explain: "`self.items = []` は `__init__` の中なので、`a` と `b` はそれぞれ別のリストを持ちます。`a` に入れたのは1と3だけです。",
      ref: "class-def" },
    { id: "x06",
      q: "`self` の説明として正しいものは?",
      kind: "text",
      choices: ["メソッドを呼び出したインスタンス自身。呼ぶときは書かずに自動で渡される", "クラスそのもの。すべてのインスタンスで共通の1つを指す", "呼ぶときに必ず `c.up(self)` のように自分で渡す引数", "Pythonの予約語で、`self` 以外の名前にすると文法エラーになる"],
      explain: "`c.up()` と呼ぶと、`self` に `c` が自動で入ります。名前は慣習で `self` にしているだけで、予約語ではありません(ただし必ず `self` と書きましょう)。",
      ref: "class-self" },
    { id: "x07",
      q: "このコードの出力は?",
      code: "class Animal:\n    def speak(self):\n        return \"...\"\n\nclass Cat(Animal):\n    def speak(self):\n        return \"ニャー\"\n\nclass Fish(Animal):\n    pass\n\nprint(Cat().speak())\nprint(Fish().speak())",
      kind: "output",
      choices: ["ニャー\n...", "ニャー\nNone", "...\n...", "ニャー\nニャー"],
      explain: "`Cat` は `speak` を書き直している(オーバーライド)ので「ニャー」。`Fish` は何も書いていないので、親 `Animal` の `speak` が使われ「...」です。",
      ref: "class-inherit" },
    { id: "x08",
      q: "`Cat` が `Animal` を継承するように、空欄を埋めてください。",
      code: "class Animal:\n    def hello(self):\n        return \"こんにちは\"\n\nclass Cat(____):\n    pass\n\nprint(Cat().hello())",
      kind: "code",
      choices: ["Animal", "self", "super()", "extends Animal"],
      expect: "こんにちは",
      explain: "継承は `class 子(親):` と、かっこに親クラスの名前を書きます。`extends` はJavaなどの書き方です。",
      ref: "class-inherit" },
    { id: "x09",
      q: "親クラスの `__init__` を呼んで `name` を設定したい。空欄は?",
      code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        ____.__init__(name)\n        self.breed = breed\n\nd = Dog(\"ポチ\", \"柴\")\nprint(d.name, d.breed)",
      kind: "code",
      choices: ["super()", "self", "Animal", "super"],
      accepts: ["super(Dog, self)"],
      expect: "ポチ 柴",
      explain: "`super()` は親クラスを指し、`super().__init__(name)` で親の初期化を行います。`self.__init__(name)` は自分の `__init__` を呼んでしまい、`Animal.__init__(name)` は `self` が足りません。`super` だけではかっこがないので呼べません。",
      ref: "class-inherit" },
    { id: "x10",
      q: "このコードの出力は?",
      code: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\np = Point(2, 5)\nprint(p)",
      kind: "output",
      choices: ["(2, 5)", "Point(2, 5)", "(x, y)", "<__main__.Point object>"],
      explain: "`print(p)` は `__str__` の戻り値を表示します。f文字列なので `self.x` と `self.y` の値が入ります。",
      ref: "class-str" },
    { id: "x11",
      q: "`print(b)` で `本: 吾輩は猫である` と出したい。空欄に入るメソッド名は?",
      code: "class Book:\n    def __init__(self, title):\n        self.title = title\n    def ____(self):\n        return \"本: \" + self.title\n\nb = Book(\"吾輩は猫である\")\nprint(b)",
      kind: "code",
      choices: ["__str__", "__print__", "str", "__init__"],
      expect: "本: 吾輩は猫である",
      explain: "`print` は `__str__` を使います。`__print__` という特別なメソッドはありません。`str` という普通のメソッドを作っても `print` は使いません。",
      ref: "class-str" },
    { id: "x12",
      q: "このコードを実行するとどうなる?",
      code: "class A:\n    def hi():\n        return \"hi\"\n\nprint(A().hi())",
      kind: "text",
      choices: ["`TypeError` になる(`self` を受け取る引数がない)", "`hi` と表示される", "何も表示されない", "`None` と表示される"],
      explain: "`A().hi()` と呼ぶと、Pythonはインスタンスを1つ目の引数として自動で渡します。`hi()` は引数を受け取らないので、「引数が多すぎる」という `TypeError` になります。`def hi(self):` と書きます。",
      ref: "class-self" },
    { id: "x13",
      q: "このコードの出力は?",
      code: "class Player:\n    count = 0\n    def __init__(self, name):\n        self.name = name\n        Player.count += 1\n\nPlayer(\"A\")\nPlayer(\"B\")\nPlayer(\"C\")\nprint(Player.count)",
      kind: "output",
      choices: ["3", "0", "1", "None"],
      explain: "`count` はクラス変数なので、全インスタンスで1つを共有します。インスタンスを3つ作るたびに1ずつ増えて3です。",
      ref: "class-attr" },
    { id: "x14",
      q: "このコードの出力は?",
      code: "class Animal:\n    pass\n\nclass Dog(Animal):\n    pass\n\nd = Dog()\nprint(isinstance(d, Animal))",
      kind: "output",
      choices: ["True", "False", "Dog", "Animal"],
      explain: "`isinstance(x, クラス)` は、`x` がそのクラス(または子クラス)のインスタンスなら `True` です。`Dog` は `Animal` を継承しているので `True` です。",
      ref: "class-inherit" }
  ]
});

PYD.register("error-module", {
  cards: [
    { id: "try-except",
      name: "try / except",
      read: "エラーを受け止める",
      desc: "`try:` の中でエラー(例外)が起きると、そこで中断して、型の合う `except 例外名:` の中に進みます。プログラム全体は止まりません。`except 例外名 as e:` と書くと、`e` でエラーの内容を使えます。",
      examples: [["try:\n    x = 10 / 0\n    print(\"A\")\nexcept ZeroDivisionError:\n    print(\"0では割れません\")\nprint(\"続き\")", "0では割れません\n続き"], ["try:\n    int(\"abc\")\nexcept ValueError as e:\n    print(\"エラー:\", e)", "エラー: invalid literal for int() with base 10: 'abc'"]],
      notes: ["よく出る例外: `ZeroDivisionError`(0で割った)、`ValueError`(値がおかしい。`int(\"abc\")` など)、`TypeError`(型が合わない。`\"1\" + 1` など)、`KeyError`(辞書にないキー)、`IndexError`(範囲外の添字)、`FileNotFoundError`(ファイルがない)。", "`except:` や `except Exception:` で何でも受け止めると、まちがいに気づきにくくなります。受け止めたい例外の名前を書きましょう。"] },
    { id: "try-else-finally",
      name: "else / finally",
      read: "成功したとき・必ず最後に",
      desc: "`else:` は `try` の中でエラーが起きなかったときだけ実行されます。`finally:` はエラーがあってもなくても、`return` で抜けるときでも、必ず最後に実行されます。",
      examples: [["try:\n    n = int(\"42\")\nexcept ValueError:\n    print(\"エラー\")\nelse:\n    print(n + 1)\nfinally:\n    print(\"おわり\")", "43\nおわり"]],
      notes: ["`finally` は、ファイルや接続を閉じるなど「必ずやる後片づけ」に使います。"] },
    { id: "raise",
      name: "raise",
      read: "エラーを起こす",
      desc: "`raise 例外名(\"メッセージ\")` で、自分でエラーを起こします。おかしな値を受け取った関数が、呼び出し元に知らせるときに使います。",
      examples: [["def check_age(age):\n    if age < 0:\n        raise ValueError(\"年齢が負です\")\n    return age\n\ntry:\n    check_age(-1)\nexcept ValueError as e:\n    print(e)", "年齢が負です"]],
      notes: ["ほかの言語の `throw` にあたります。Pythonでは `raise` です。"] },
    { id: "with-open",
      name: "with open()",
      read: "ファイルを読み書きする",
      desc: "`with open(ファイル名, モード, encoding=\"utf-8\") as f:` でファイルを開きます。`with` のブロックを出ると、エラーが起きてもファイルは自動で閉じられます。モードは `\"r\"`(読む。省略時)、`\"w\"`(書く。中身を消して上書き)、`\"a\"`(末尾に足す)。",
      examples: [["with open(\"memo.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"1行目\\n2行目\\n\")\n\nwith open(\"memo.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        print(line.strip())", "1行目\n2行目"], ["with open(\"memo.txt\", encoding=\"utf-8\") as f:\n    text = f.read()      # 全部を1つの文字列で\nprint(len(text.splitlines()))", "2"]],
      notes: ["`\"w\"` で開くと、もとの中身は消えます。", "日本語を扱うときは `encoding=\"utf-8\"` を書いておくと、Windowsでも文字化けしません。", "`write` は改行を自動でつけません。`\\n` を自分で書きます。"] },
    { id: "import",
      name: "import / from",
      read: "モジュールを読み込む",
      desc: "`import モジュール名` で、ほかのファイルや標準ライブラリの機能を使えるようにします。使うときは `モジュール名.関数名`。`from モジュール名 import 名前` なら、名前だけで使えます。`as` で短い別名をつけられます。",
      examples: [["import math\nprint(math.sqrt(16))", "4.0"], ["from math import pi\nprint(round(pi, 2))", "3.14"], ["import math as m\nprint(m.floor(3.7), m.ceil(3.2))", "3 4"], ["from collections import Counter\nprint(Counter(\"banana\")[\"a\"])", "3"]],
      notes: ["`import numpy as np`、`import pandas as pd` のように、よく使う別名が決まっているライブラリもあります。", "`if __name__ == \"__main__\":` の中は、そのファイルを直接実行したときだけ動き、ほかのファイルから `import` されたときは動きません。"] }
  ],
  questions: [
    { id: "e01",
      q: "このコードの出力は?",
      code: "try:\n    x = 10 / 0\n    print(\"A\")\nexcept ZeroDivisionError:\n    print(\"B\")\nprint(\"C\")",
      kind: "output",
      choices: ["B\nC", "A\nB\nC", "B", "A\nC"],
      explain: "`10 / 0` でエラーになった時点で `try` の残り(`print(\"A\")`)は飛ばされ、`except` に進みます。そのあとは普通に続くので `C` も出ます。",
      ref: "try-except" },
    { id: "e02",
      q: "`int(\"abc\")` のエラーを受け止めたい。空欄に入る例外名は?",
      code: "try:\n    n = int(\"abc\")\nexcept ____:\n    print(\"数字ではありません\")",
      kind: "code",
      choices: ["ValueError", "TypeError", "KeyError", "ZeroDivisionError"],
      expect: "数字ではありません",
      explain: "`int()` に数字でない文字列を渡すと `ValueError`(値がおかしい)です。`TypeError` は `\"1\" + 1` のように型が合わないときです。",
      ref: "try-except" },
    { id: "e03",
      q: "このコードの出力は?",
      code: "def f():\n    try:\n        return \"try\"\n    finally:\n        print(\"finally\")\n\nprint(f())",
      kind: "output",
      choices: ["finally\ntry", "try\nfinally", "try", "finally"],
      explain: "`finally` は `return` で抜けるときでも、関数を出る前に必ず実行されます。先に `finally` が表示され、そのあと戻り値 `try` が `print` されます。",
      ref: "try-else-finally" },
    { id: "e04",
      q: "このコードの出力は?",
      code: "try:\n    n = int(\"42\")\nexcept ValueError:\n    print(\"エラー\")\nelse:\n    print(n + 1)\nfinally:\n    print(\"おわり\")",
      kind: "output",
      choices: ["43\nおわり", "43", "エラー\nおわり", "421\nおわり"],
      explain: "`int(\"42\")` は成功するので `except` は飛ばされ、`else` で `43`、最後に `finally` で `おわり` です。",
      ref: "try-else-finally" },
    { id: "e05",
      q: "負の年齢を受け取ったらエラーを起こしたい。空欄は?",
      code: "def check_age(age):\n    if age < 0:\n        ____ ValueError(\"年齢が負です\")\n    return age\n\ntry:\n    check_age(-1)\nexcept ValueError as e:\n    print(e)",
      kind: "code",
      choices: ["raise", "throw", "return", "except"],
      expect: "年齢が負です",
      explain: "Pythonで例外を起こすのは `raise` です。`throw` はJavaScriptなどの書き方です。`return` だとエラーにならず、値として返るだけです。",
      ref: "raise" },
    { id: "e06",
      q: "このコードの出力は?",
      code: "d = {\"a\": 1}\ntry:\n    print(d[\"b\"])\nexcept KeyError:\n    print(\"ない\")\nexcept Exception:\n    print(\"その他\")",
      kind: "output",
      choices: ["ない", "その他", "None", "ない\nその他"],
      explain: "辞書にないキーを `[]` で読むと `KeyError` です。`except` は上から順に調べ、最初に合ったものだけが実行されます。",
      ref: "try-except" },
    { id: "e07",
      q: "ファイルを開き、ブロックを出たら自動で閉じたい。空欄は?",
      code: "with open(\"memo.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"こんにちは\")\n\n____ open(\"memo.txt\", encoding=\"utf-8\") as f:\n    print(f.read())",
      kind: "code",
      choices: ["with", "try", "for", "open"],
      expect: "こんにちは",
      explain: "`with open(…) as f:` と書くと、ブロックを出るときにファイルが自動で閉じられます。",
      ref: "with-open" },
    { id: "e08",
      q: "ファイルの中身を消して新しく書き込むモードは? 空欄に入る1文字を答えてください。",
      code: "with open(\"memo.txt\", \"____\", encoding=\"utf-8\") as f:\n    f.write(\"1行目\\n2行目\\n\")\n\nwith open(\"memo.txt\", encoding=\"utf-8\") as f:\n    print(len(f.readlines()))",
      kind: "code",
      choices: ["w", "r", "a", "x"],
      expect: "2",
      explain: "`\"w\"` は書き込み(上書き)、`\"r\"` は読み込み、`\"a\"` は末尾に追加です。`\"x\"` は「新しく作る」で、ファイルがすでにあるとエラーになります。",
      ref: "with-open" },
    { id: "e09",
      q: "このコードの出力は?",
      code: "with open(\"log.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"A\\n\")\nwith open(\"log.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"B\\n\")\nwith open(\"log.txt\", encoding=\"utf-8\") as f:\n    print(f.read().strip())",
      kind: "output",
      choices: ["A\nB", "B", "A", "B\nA"],
      explain: "`\"w\"` で `A` を書いたあと、`\"a\"`(追加)で開いたので `B` は末尾に足されます。`strip()` は最後の改行を取るだけです。",
      ref: "with-open" },
    { id: "e10",
      q: "`math` モジュールを読み込みたい。空欄は?",
      code: "____ math\nprint(math.sqrt(16))",
      kind: "code",
      choices: ["import", "include", "using", "require"],
      expect: "4.0",
      explain: "Pythonでは `import`。`include` はC、`using` はC#、`require` はJavaScript(Node.js)などの書き方です。",
      ref: "import" },
    { id: "e11",
      q: "`pi` を `math.` なしで使えるようにしたい。空欄は?",
      code: "____ math import pi\nprint(round(pi, 2))",
      kind: "code",
      choices: ["from", "import", "with", "use"],
      expect: "3.14",
      explain: "`from モジュール import 名前` で、その名前だけを直接使えるようにします。",
      ref: "import" },
    { id: "e12",
      q: "このコードの出力は?",
      code: "import math as m\nprint(m.floor(3.7), m.ceil(3.2))",
      kind: "output",
      choices: ["3 4", "4 3", "3.7 3.2", "4 4"],
      explain: "`as m` で `math` に別名 `m` をつけています。`floor` は切り捨て(3)、`ceil` は切り上げ(4)です。",
      ref: "import" },
    { id: "e13",
      q: "このコードの出力は?",
      code: "from collections import Counter\n\nc = Counter(\"banana\")\nprint(c[\"a\"])",
      kind: "output",
      choices: ["3", "2", "1", "6"],
      explain: "`Counter` は要素ごとの個数を数えます。「banana」の `a` は3つです。",
      ref: "import" },
    { id: "e14",
      q: "ファイルの最後に `if __name__ == \"__main__\":` と書いた部分は、いつ実行される?",
      kind: "text",
      choices: ["そのファイルを直接実行したときだけ。ほかのファイルから import されたときは実行されない", "import されたときだけ実行される", "いつでも必ず実行される", "エラーが起きたときだけ実行される"],
      explain: "直接実行すると `__name__` は `\"__main__\"` になり、import されたときはモジュール名になります。テスト用のコードなどを、import したときに動かさないために使います。",
      ref: "import" }
  ]
});

PYD.register("numpy", {
  cards: [
    { id: "np-array",
      name: "np.array",
      read: "数の配列を作る",
      desc: "NumPy は数の配列(ndarray)を速く計算するライブラリです。`import numpy as np` と読み込み、`np.array(リスト)` で配列を作ります。`np.zeros`(0で埋める)、`np.ones`(1で埋める)、`np.arange`(連番)もよく使います。",
      examples: [["import numpy as np\na = np.array([1, 2, 3])\nprint(a)", "[1 2 3]"], ["print(np.arange(5))", "[0 1 2 3 4]"], ["print(np.zeros((2, 3)).shape)", "(2, 3)"]],
      notes: ["表示はリストと違い、カンマなしの `[1 2 3]` です。", "配列の中は同じ型(すべて整数、すべて小数など)になります。"] },
    { id: "np-shape",
      name: "shape・reshape",
      read: "形を見る・変える",
      desc: "`a.shape` は配列の形(行数・列数…)をタプルで返します。`a.ndim` は次元の数、`a.size` は要素の総数。`a.reshape(行, 列)` で、要素の数を変えずに形を変えます。`-1` と書いたところは自動で計算されます。",
      examples: [["import numpy as np\na = np.array([[1, 2, 3], [4, 5, 6]])\nprint(a.shape)", "(2, 3)"], ["print(a.ndim, a.size)", "2 6"], ["b = np.arange(6).reshape(3, 2)\nprint(b)", "[[0 1]\n [2 3]\n [4 5]]"], ["print(np.arange(6).reshape(-1, 1).shape)", "(6, 1)"]],
      notes: ["機械学習では「行 = データ1件」「列 = 特徴」の形 `(件数, 特徴の数)` が基本です。"] },
    { id: "np-broadcast",
      name: "要素ごとの計算",
      read: "ブロードキャスト",
      desc: "配列どうしの `+ - * /` は、同じ位置の要素どうしで計算されます。形が違っても、合わせられるときは小さいほうが引き伸ばされます(ブロードキャスト)。数1つとの計算は、全要素に同じ計算をします。",
      examples: [["import numpy as np\na = np.array([1, 2, 3])\nprint(a * 2)", "[2 4 6]"], ["print(a + np.array([10, 20, 30]))", "[11 22 33]"], ["m = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m + np.array([10, 20, 30]))", "[[11 22 33]\n [14 25 36]]"]],
      notes: ["リストの `[1, 2, 3] * 2` は `[1, 2, 3, 1, 2, 3]`(くり返し)です。NumPy とは意味が違います。", "形 `(2, 3)` と `(2,)` のように、最後の次元が合わないと `ValueError` になります。"] },
    { id: "np-axis",
      name: "sum・mean と axis",
      read: "集計の向き",
      desc: "`a.sum()`、`a.mean()`、`a.max()` は全要素を集計します。`axis=0` は縦方向(行をまたいで、列ごと)、`axis=1` は横方向(行ごと)に集計します。`np.argmax` は最大値の位置(添字)を返します。",
      examples: [["import numpy as np\nb = np.array([[0, 1, 2], [3, 4, 5]])\nprint(b.sum())", "15"], ["print(b.sum(axis=0))", "[3 5 7]"], ["print(b.sum(axis=1))", "[ 3 12]"], ["print(np.argmax(np.array([0.1, 0.7, 0.2])))", "1"]],
      notes: ["`axis=0` を指定すると、その次元(行)が消えます。形 `(2, 3)` → `(3,)`。"] },
    { id: "np-matmul",
      name: "@(行列の積)",
      read: "行列のかけ算",
      desc: "`A @ B` は行列の積です。`A` の列数と `B` の行数が同じでなければなりません。形 `(n, k) @ (k, m)` の結果は `(n, m)` です。`*` は要素ごとのかけ算で、別ものです。",
      examples: [["import numpy as np\nA = np.array([[1, 2], [3, 4]])\nx = np.array([1, 1])\nprint(A @ x)", "[3 7]"], ["print((np.ones((4, 3)) @ np.ones((3, 5))).shape)", "(4, 5)"]],
      notes: ["ニューラルネットの層の計算 `入力 @ 重み + バイアス` はこの形です。"] },
    { id: "np-mask",
      name: "条件でしぼる",
      read: "真偽値の配列で選ぶ",
      desc: "`a > 4` のような比較は、要素ごとの `True`/`False` の配列になります。それを `a[条件]` と添字に使うと、`True` の要素だけを取り出せます。`True` は1として数えられるので、`.sum()` で個数がわかります。",
      examples: [["import numpy as np\na = np.array([3, 8, 1, 9, 5])\nprint(a > 4)", "[False  True False  True  True]"], ["print(a[a > 4])", "[8 9 5]"], ["print((a > 4).sum())", "3"]],
      notes: ["条件を組み合わせるときは `and` ではなく `&`(かつ)、`|`(または)を使い、`(a > 2) & (a < 9)` のようにかっこで囲みます。"] }
  ],
  questions: [
    { id: "n01",
      q: "このコードの出力は?",
      code: "import numpy as np\n\na = np.array([[1, 2, 3], [4, 5, 6]])\nprint(a.shape)",
      kind: "output",
      lib: "numpy",
      choices: ["(2, 3)", "(3, 2)", "(6,)", "6"],
      explain: "外側のリストに行が2つ、各行に3つの要素があるので、形は `(行, 列) = (2, 3)` です。",
      ref: "np-shape" },
    { id: "n02",
      q: "このコードの出力は?",
      code: "import numpy as np\n\na = np.array([[1, 2, 3], [4, 5, 6]])\nprint(a.sum())",
      kind: "output",
      lib: "numpy",
      choices: ["21", "[5 7 9]", "[ 6 15]", "6"],
      explain: "`axis` を書かない `sum()` は、全要素の合計 1+2+…+6 = 21 です。",
      ref: "np-axis" },
    { id: "n03",
      q: "このコードの出力は?",
      code: "import numpy as np\n\na = np.array([1, 2, 3])\nprint(a * 2)",
      kind: "output",
      lib: "numpy",
      choices: ["[2 4 6]", "[1 2 3 1 2 3]", "[2, 4, 6]", "[1, 2, 3, 1, 2, 3]"],
      explain: "NumPy の配列に数をかけると、全要素に同じ計算をします。表示はカンマなしです。リストの `* 2` はくり返しになるので注意。",
      ref: "np-broadcast" },
    { id: "n04",
      q: "0〜5 の連番を2行3列に並べたい。空欄は?",
      code: "import numpy as np\n\nb = np.arange(6).____(2, 3)\nprint(b.shape)",
      kind: "code",
      lib: "numpy",
      choices: ["reshape", "shape", "flatten", "transpose"],
      expect: "(2, 3)",
      explain: "`reshape(行, 列)` で、要素の数(6)を変えずに形を変えます。`shape` は形を見るための属性で、呼び出すものではありません。",
      ref: "np-shape" },
    { id: "n05",
      q: "このコードの出力は?",
      code: "import numpy as np\n\nb = np.array([[0, 1, 2], [3, 4, 5]])\nprint(b.sum(axis=0))",
      kind: "output",
      lib: "numpy",
      choices: ["[3 5 7]", "[3 12]", "15", "[0 1 2]"],
      explain: "`axis=0` は縦方向に、列ごとに合計します。0+3, 1+4, 2+5 で `[3 5 7]` です。`[ 3 12]` は `axis=1`(行ごと)の結果です。",
      ref: "np-axis" },
    { id: "n06",
      q: "このコードの出力は?",
      code: "import numpy as np\n\nb = np.array([[0, 1, 2], [3, 4, 5]])\nprint(b.mean(axis=1))",
      kind: "output",
      lib: "numpy",
      choices: ["[1. 4.]", "[1.5 2.5 3.5]", "2.5", "[3. 12.]"],
      explain: "`axis=1` は行ごとの平均です。(0+1+2)/3 = 1.0、(3+4+5)/3 = 4.0。平均は小数になるので `1.` のように表示されます。",
      ref: "np-axis" },
    { id: "n07",
      q: "このコードの出力は?",
      code: "import numpy as np\n\na = np.array([[1, 2, 3], [4, 5, 6]])\nb = np.array([10, 20, 30])\nc = a + b\nprint(c[1])",
      kind: "output",
      lib: "numpy",
      choices: ["[14 25 36]", "[11 22 33]", "[24 25 26]", "[4 5 6]"],
      explain: "形 `(3,)` の `b` は各行に引き伸ばされて足されます(ブロードキャスト)。2行目は 4+10, 5+20, 6+30 です。",
      ref: "np-broadcast" },
    { id: "n08",
      q: "4 より大きい要素だけを取り出したい。空欄は?",
      code: "import numpy as np\n\na = np.array([3, 8, 1, 9, 5])\nprint(a[____])",
      kind: "code",
      lib: "numpy",
      choices: ["a > 4", "> 4", "a > 4 for a", "if a > 4"],
      accepts: ["4 < a"],
      expect: "[8 9 5]",
      explain: "`a > 4` は `[False True False True True]` という配列になり、それを添字にすると `True` の要素だけが取り出されます。",
      ref: "np-mask" },
    { id: "n09",
      q: "このコードの出力は?",
      code: "import numpy as np\n\na = np.array([3, 8, 1, 9, 5])\nprint((a > 4).sum())",
      kind: "output",
      lib: "numpy",
      choices: ["3", "22", "2", "[8 9 5]"],
      explain: "`a > 4` は真偽値の配列で、`True` は1、`False` は0として合計されます。条件に合う個数(8, 9, 5 の3つ)になります。",
      ref: "np-mask" },
    { id: "n10",
      q: "行列 `A` とベクトル `x` の積(行列の積)を求めたい。空欄に入る演算子は?",
      code: "import numpy as np\n\nA = np.array([[1, 2], [3, 4]])\nx = np.array([1, 1])\nprint(A ____ x)",
      kind: "code",
      lib: "numpy",
      choices: ["@", "*", "**", "."],
      expect: "[3 7]",
      explain: "行列の積は `@`。1×1+2×1 = 3、3×1+4×1 = 7 です。`*` は要素ごとのかけ算で、行列の積にはなりません。",
      ref: "np-matmul" },
    { id: "n11",
      q: "このコードの出力は?",
      code: "import numpy as np\n\na = np.zeros((3, 4))\nprint(a.ndim, a.size)",
      kind: "output",
      lib: "numpy",
      choices: ["2 12", "2 7", "3 4", "12 2"],
      explain: "`ndim` は次元の数(行と列の2次元なので2)、`size` は要素の総数(3×4 = 12)です。",
      ref: "np-shape" },
    { id: "n12",
      q: "このコードを実行するとどうなる?",
      code: "import numpy as np\n\na = np.ones((2, 3))\nb = np.ones(2)\nprint(a + b)",
      kind: "text",
      lib: "numpy",
      choices: ["形が合わないので `ValueError` になる", "`b` が各列に引き伸ばされ、すべて 2. の (2, 3) の配列になる", "`b` の足りない分は0とみなされる", "結果は形 (2,) になる"],
      explain: "ブロードキャストは、最後の次元(右端)からそろえます。`(2, 3)` と `(2,)` は右端が3と2で合わないので、エラーです。`b` が `(3,)` なら足せます。",
      ref: "np-broadcast" },
    { id: "n13",
      q: "このコードの出力は?",
      code: "import numpy as np\n\na = np.array([1, 2, 3])\nb = a.reshape(-1, 1)\nprint(b.shape)",
      kind: "output",
      lib: "numpy",
      choices: ["(3, 1)", "(1, 3)", "(3,)", "(-1, 1)"],
      explain: "`-1` は「残りから自動で決める」の意味です。列が1なので、行は 3÷1 = 3。形は `(3, 1)` です。",
      ref: "np-shape" },
    { id: "n14",
      q: "このコードの出力は?",
      code: "import numpy as np\n\np = np.array([0.1, 0.7, 0.2])\nprint(np.argmax(p))",
      kind: "output",
      lib: "numpy",
      choices: ["1", "0.7", "2", "0"],
      explain: "`argmax` は最大値そのものではなく、最大値の位置(添字)を返します。0.7 は0から数えて1番目です。分類モデルの予測ラベルを決めるときに使います。",
      ref: "np-axis" }
  ]
});

PYD.register("pandas", {
  cards: [
    { id: "pd-dataframe",
      name: "DataFrame",
      read: "表を作る",
      desc: "pandas は表(DataFrame)を扱うライブラリです。`import pandas as pd` と読み込み、`pd.DataFrame({列名: リスト, …})` で表を作ります。ファイルからは `pd.read_csv(\"data.csv\")` で読めます。",
      examples: [["import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.shape)", "(4, 3)"], ["print(df.head(2))", "  name team  score\n0    A    赤     80\n1    B    白     65"], ["print(df.columns.tolist())", "['name', 'team', 'score']"]],
      notes: ["`df.shape` は `(行数, 列数)`。左端の 0, 1, … は行の名前(インデックス)です。", "`df.head()` は先頭5行、`df.describe()` は数値の列の平均などをまとめて出します。"] },
    { id: "pd-column",
      name: "列を取り出す・足す",
      read: "df[\"列名\"]",
      desc: "`df[\"列名\"]` で1列(Series)を取り出します。`df[[\"列1\", \"列2\"]]` のようにリストで渡すと、複数列の表(DataFrame)になります。`df[\"新しい列\"] = …` で列を足せます。",
      examples: [["import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df[\"score\"].mean())", "76.25"], ["print(df[\"score\"].max())", "90"], ["df[\"double\"] = df[\"score\"] * 2\nprint(df[\"double\"].tolist())", "[160, 130, 180, 140]"]],
      notes: ["列の計算は NumPy と同じく、全行に同じ計算をします。"] },
    { id: "pd-loc",
      name: "loc・iloc",
      read: "行と列を指定する",
      desc: "`df.loc[行の名前, 列名]` は名前で、`df.iloc[行番号, 列番号]` は0から数えた位置で指定します。",
      examples: [["import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.loc[2, \"name\"])", "C"], ["print(df.iloc[0, 2])", "80"], ["print(df.loc[df[\"score\"] > 75, \"name\"].tolist())", "['A', 'C']"]],
      notes: ["インデックスが 0, 1, 2… のままなら、`loc` と `iloc` の行指定は同じ結果になります。並べ替えたあとなどは違ってくるので注意。"] },
    { id: "pd-filter",
      name: "条件で行をしぼる・並べ替え",
      read: "df[条件]",
      desc: "`df[\"score\"] >= 80` は行ごとの `True`/`False` になり、`df[条件]` で `True` の行だけを残します。`sort_values(\"列\")` で並べ替え、`ascending=False` で大きい順です。",
      examples: [["import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df[df[\"score\"] >= 80][\"name\"].tolist())", "['A', 'C']"], ["print(len(df[df[\"team\"] == \"赤\"]))", "2"], ["print(df.sort_values(\"score\", ascending=False)[\"name\"].tolist())", "['C', 'A', 'D', 'B']"]],
      notes: ["条件を組み合わせるときは `&`(かつ)・`|`(または)を使い、`(df[\"score\"] >= 70) & (df[\"team\"] == \"赤\")` のように各条件をかっこで囲みます。"] },
    { id: "pd-groupby",
      name: "groupby",
      read: "グループごとに集計",
      desc: "`df.groupby(\"列\")[\"集計する列\"].mean()` で、列の値ごとにグループに分けて集計します。`sum()`、`count()`、`max()` なども使えます。",
      examples: [["import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.groupby(\"team\")[\"score\"].mean()[\"赤\"])", "85.0"], ["print(df.groupby(\"team\")[\"score\"].sum()[\"白\"])", "135"]],
      notes: ["結果はグループの値(ここでは `赤`・`白`)がインデックスになった Series です。"] },
    { id: "pd-missing",
      name: "欠損値",
      read: "NaN を見つける・埋める",
      desc: "値がないところは `NaN`(欠損値)になります。`isna()` で欠損かどうか、`fillna(値)` で埋める、`dropna()` で欠損のある行を消す、ができます。`mean()` や `sum()` は欠損を飛ばして計算します。",
      examples: [["import pandas as pd\n\ndf = pd.DataFrame({\"x\": [1, None, 3]})\nprint(df[\"x\"].isna().sum())", "1"], ["print(df[\"x\"].mean())", "2.0"], ["print(df[\"x\"].fillna(0).tolist())", "[1.0, 0.0, 3.0]"], ["print(len(df.dropna()))", "2"]],
      notes: ["欠損を含む整数の列は、小数(float)の列になります。", "`fillna` や `dropna` は新しい表を返します。もとの `df` は変わりません。"] }
  ],
  questions: [
    { id: "p01",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.shape)",
      kind: "output",
      lib: "pandas",
      choices: ["(4, 3)", "(3, 4)", "12", "(4,)"],
      explain: "`shape` は `(行数, 列数)` です。データが4件(行)、列が name・team・score の3つです。",
      ref: "pd-dataframe" },
    { id: "p02",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df[\"score\"].mean())",
      kind: "output",
      lib: "pandas",
      choices: ["76.25", "76", "305", "77.5"],
      explain: "(80+65+90+70)/4 = 305/4 = 76.25 です。",
      ref: "pd-column" },
    { id: "p03",
      q: "80点以上の人の名前を取り出したい。空欄に入る演算子は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df[df[\"score\"] ____ 80][\"name\"].tolist())",
      kind: "code",
      lib: "pandas",
      choices: [">=", ">", "=>", "=="],
      expect: "['A', 'C']",
      explain: "「以上」は `>=`。`>` だと80点ちょうどの A が入りません。`=>` という演算子はありません。",
      ref: "pd-filter" },
    { id: "p04",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(len(df[df[\"team\"] == \"赤\"]))",
      kind: "output",
      lib: "pandas",
      choices: ["2", "4", "1", "3"],
      explain: "`team` が `赤` の行(A と C)だけが残り、行数は2です。",
      ref: "pd-filter" },
    { id: "p05",
      q: "チームごとの平均点を求めたい。空欄は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.____(\"team\")[\"score\"].mean()[\"赤\"])",
      kind: "code",
      lib: "pandas",
      choices: ["groupby", "group_by", "groupBy", "sort_values"],
      expect: "85.0",
      explain: "pandas では `groupby`(アンダースコアなし、すべて小文字)です。赤は A(80)と C(90)の平均で 85.0 です。",
      ref: "pd-groupby" },
    { id: "p06",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.groupby(\"team\")[\"score\"].sum()[\"白\"])",
      kind: "output",
      lib: "pandas",
      choices: ["135", "170", "67.5", "305"],
      explain: "白は B(65)と D(70)なので、合計 135 です。",
      ref: "pd-groupby" },
    { id: "p07",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.loc[2, \"name\"])",
      kind: "output",
      lib: "pandas",
      choices: ["C", "B", "90", "赤"],
      explain: "`loc[行の名前, 列名]`。行の名前 2 は3番目の行(C)です。インデックスは0から始まります。",
      ref: "pd-loc" },
    { id: "p08",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.iloc[0, 2])",
      kind: "output",
      lib: "pandas",
      choices: ["80", "A", "赤", "65"],
      explain: "`iloc` は0から数えた位置。0行目(A)の2列目(name=0、team=1、score=2)なので 80 です。",
      ref: "pd-loc" },
    { id: "p09",
      q: "点数の高い順に並べたい。空欄は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"A\", \"B\", \"C\", \"D\"],\n    \"team\": [\"赤\", \"白\", \"赤\", \"白\"],\n    \"score\": [80, 65, 90, 70],\n})\nprint(df.sort_values(\"score\", ascending=____)[\"name\"].tolist())",
      kind: "code",
      lib: "pandas",
      choices: ["False", "True", "\"desc\"", "false"],
      expect: "['C', 'A', 'D', 'B']",
      explain: "`ascending` は「小さい順か」。大きい順にするには `False` です。Pythonの真偽値は大文字で始まる `True` / `False` です。",
      ref: "pd-filter" },
    { id: "p10",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\"x\": [1, None, 3]})\nprint(df[\"x\"].isna().sum())",
      kind: "output",
      lib: "pandas",
      choices: ["1", "0", "2", "3"],
      explain: "`None` を入れたところは欠損値 `NaN` になります。`isna()` は欠損なら `True` で、`sum()` で数えると1です。",
      ref: "pd-missing" },
    { id: "p11",
      q: "このコードの出力は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\"x\": [1, None, 3]})\nprint(df[\"x\"].mean())",
      kind: "output",
      lib: "pandas",
      choices: ["2.0", "nan", "1.3333333333333333", "4.0"],
      explain: "`mean()` は欠損を飛ばし、残りの1と3の平均 2.0 を返します。欠損を0として数えるわけではありません。",
      ref: "pd-missing" },
    { id: "p12",
      q: "欠損値を0で埋めて合計したい。空欄は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\"x\": [1, None, 3]})\nprint(df[\"x\"].____(0).sum())",
      kind: "code",
      lib: "pandas",
      choices: ["fillna", "dropna", "isna", "replace_na"],
      expect: "4.0",
      explain: "`fillna(値)` で欠損を埋めます。`dropna()` は欠損の行を消すほうです。欠損があった列は小数の列なので、合計も 4.0 と表示されます。",
      ref: "pd-missing" },
    { id: "p13",
      q: "欠損値のある行を消したい。空欄は?",
      code: "import pandas as pd\n\ndf = pd.DataFrame({\"x\": [1, None, 3]})\nprint(len(df.____()))",
      kind: "code",
      lib: "pandas",
      choices: ["dropna", "fillna", "isna", "drop"],
      expect: "2",
      explain: "`dropna()` は欠損値を含む行を取り除いた表を返します。3行のうち1行が消えて2行です。",
      ref: "pd-missing" },
    { id: "p14",
      q: "`df[\"score\"]` と `df[[\"score\"]]` の違いは?",
      kind: "text",
      lib: "pandas",
      choices: ["`df[\"score\"]` は1列の Series、`df[[\"score\"]]` は1列だけの DataFrame(表)", "どちらも同じ Series になる", "`df[[\"score\"]]` は文法エラーになる", "`df[\"score\"]` は Python のリスト、`df[[\"score\"]]` は NumPy の配列"],
      explain: "角かっこの中に列名のリストを渡すと、選んだ列からなる表(DataFrame)になります。1列でも表の形のままです。",
      ref: "pd-column" }
  ]
});

PYD.register("sklearn", {
  cards: [
    { id: "sk-split",
      name: "train_test_split",
      read: "訓練用とテスト用に分ける",
      desc: "集めたデータを、学習に使う訓練データと、できばえを確かめるテストデータに分けます。`X` は特徴(形 `(件数, 特徴の数)`)、`y` は正解です。`test_size=0.25` ならテストが25%。`random_state` を決めると、毎回同じ分け方になります。",
      examples: [["import numpy as np\nfrom sklearn.model_selection import train_test_split\n\nX = np.arange(40).reshape(20, 2)   # 20件、特徴2つ\ny = np.arange(20)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.25, random_state=0)\nprint(len(X_train), len(X_test))", "15 5"]],
      notes: ["戻り値は `X_train, X_test, y_train, y_test` の順です。", "テストデータは学習に使わず、最後の確認だけに使います。"] },
    { id: "sk-fit",
      name: "fit・predict",
      read: "学習して予測する",
      desc: "scikit-learn のモデルは、どれも同じ使い方です。① モデルを作る ② `model.fit(X, y)` で学習 ③ `model.predict(X)` で予測。数値を予測する「回帰」には `LinearRegression` など、種類を当てる「分類」には `LogisticRegression` などを使います。",
      examples: [["from sklearn.linear_model import LinearRegression\n\nX = [[1], [2], [3], [4]]\ny = [2, 4, 6, 8]\n\nmodel = LinearRegression()\nmodel.fit(X, y)\nprint(round(model.predict([[5]])[0]))", "10"]],
      notes: ["`predict` に渡すのも `[[5]]` のように2次元(件数 × 特徴)です。", "`LogisticRegression` は名前に Regression とつきますが、分類のモデルです。"] },
    { id: "sk-score",
      name: "score",
      read: "できばえを測る",
      desc: "`model.score(X_test, y_test)` で、テストデータでのできばえを数値で出します。分類なら正解率(0〜1)、回帰なら決定係数 R²(1に近いほどよい)です。",
      examples: [["# X_train, X_test, y_train, y_test(train_test_split で分けたもの)と、\n# それで fit した分類モデル model があるとして\nprint(model.score(X_test, y_test))   # 例: 0.93"]],
      notes: ["分類の正解率は `from sklearn.metrics import accuracy_score` の `accuracy_score(y_test, y_pred)` でも求められます。"] },
    { id: "sk-overfit",
      name: "過学習",
      read: "訓練データだけに強い",
      desc: "モデルが訓練データを丸暗記してしまい、訓練データでは成績がよいのに、新しいデータ(テストデータ)では成績が悪い状態を「過学習」といいます。訓練とテストの両方の score を比べて見つけます。",
      examples: [["# X_train, X_test, y_train, y_test(train_test_split で分けたもの)と、\n# それで fit した分類モデル model があるとして\nprint(model.score(X_train, y_train))   # 例: 0.99\nprint(model.score(X_test, y_test))     # 例: 0.62"]],
      notes: ["対策: データを増やす、モデルを単純にする、正則化(重みが大きくなりすぎないようにする)、ニューラルネットなら学習を早めに止める、など。"] },
    { id: "sk-scaler",
      name: "StandardScaler",
      read: "標準化",
      desc: "特徴ごとに、平均0・標準偏差1になるように変換します(標準化)。単位や桁の違う特徴(身長cmと年収円など)をそろえると、多くのモデルで学習がうまくいきます。訓練データで `fit_transform`、テストデータには同じ変換を `transform` で使います。",
      examples: [["from sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nX_train_s = scaler.fit_transform(X_train)\nX_test_s = scaler.transform(X_test)", ""]],
      notes: ["テストデータで `fit` し直すと、テストデータの平均を使ってしまい、正しい評価になりません。"] }
  ],
  questions: [
    { id: "k01",
      q: "データを訓練用とテスト用に分ける関数を読み込みたい。空欄は?",
      code: "import numpy as np\nfrom sklearn.model_selection import ____\n\nX = np.arange(40).reshape(20, 2)   # 20件、特徴2つ\ny = np.arange(20)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.25, random_state=0)\nprint(X_train.shape, X_test.shape)",
      kind: "code",
      lib: "sklearn",
      choices: ["train_test_split", "split_data", "TrainTestSplit", "test_split"],
      expect: "(15, 2) (5, 2)",
      explain: "`sklearn.model_selection` の `train_test_split` です。関数なので小文字とアンダースコアで書きます。",
      ref: "sk-split" },
    { id: "k02",
      q: "このコードの出力は?",
      code: "import numpy as np\nfrom sklearn.model_selection import train_test_split\n\nX = np.arange(40).reshape(20, 2)   # 20件、特徴2つ\ny = np.arange(20)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.25, random_state=0)\nprint(len(X_train), len(X_test))",
      kind: "output",
      lib: "sklearn",
      choices: ["15 5", "5 15", "16 4", "20 5"],
      explain: "20件のうち25%(5件)がテスト、残り15件が訓練です。戻り値は `X_train, X_test, …` の順です。",
      ref: "sk-split" },
    { id: "k03",
      q: "モデルに学習させたい。空欄は?",
      code: "from sklearn.linear_model import LinearRegression\n\nX = [[1], [2], [3], [4]]\ny = [2, 4, 6, 8]\n\nmodel = LinearRegression()\nmodel.____(X, y)\nprint(round(model.predict([[5]])[0]))",
      kind: "code",
      lib: "sklearn",
      choices: ["fit", "train", "learn", "predict"],
      expect: "10",
      explain: "scikit-learn では、学習はどのモデルでも `fit(X, y)` です。",
      ref: "sk-fit" },
    { id: "k04",
      q: "学習したモデルで、x = 10 のときの値を予測したい。空欄は?",
      code: "from sklearn.linear_model import LinearRegression\n\nX = [[1], [2], [3], [4]]\ny = [2, 4, 6, 8]\n\nmodel = LinearRegression()\nmodel.fit(X, y)\nprint(round(model.____([[10]])[0]))",
      kind: "code",
      lib: "sklearn",
      choices: ["predict", "fit", "score", "transform"],
      expect: "20",
      explain: "予測は `predict`。y = 2x を学んだので、10 に対して 20 を返します。",
      ref: "sk-fit" },
    { id: "k05",
      q: "データを訓練用とテスト用に分ける理由は?",
      kind: "text",
      lib: "sklearn",
      choices: ["学習に使っていないデータで、新しいデータにも通用するかを確かめるため", "データが多すぎると学習できないので、半分に減らすため", "訓練用とテスト用で別々のモデルを作り、平均をとるため", "テスト用のデータで学習のしかたを調整し、点数を上げるため"],
      explain: "学習に使ったデータで測ると、丸暗記でも高い点になってしまいます。本当の実力は、見たことのないテストデータで測ります。",
      ref: "sk-split" },
    { id: "k06",
      q: "訓練データでの score が 0.99、テストデータでの score が 0.62 だった。考えられる状態は?",
      kind: "text",
      lib: "sklearn",
      choices: ["過学習(訓練データに合わせすぎて、新しいデータに弱い)", "学習不足(訓練データにもまだ合っていない)", "理想的な状態(訓練データでほぼ満点だから)", "テストデータが訓練データより多すぎる"],
      explain: "訓練では高いのにテストでは低い、という差が過学習のしるしです。学習不足なら訓練データでも低くなります。",
      ref: "sk-overfit" },
    { id: "k07",
      q: "テストデータでのできばえを数値で出したい。空欄は?",
      code: "from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.25, random_state=0)\n\nmodel = LogisticRegression(max_iter=1000)\nmodel.fit(X_train, y_train)\nprint(model.____(X_test, y_test))",
      kind: "code",
      lib: "sklearn",
      choices: ["score", "accuracy", "evaluate", "predict"],
      explain: "`model.score(X, y)` で、予測して正解と比べた結果を出します。分類モデルでは正解率です。`evaluate` は Keras などの書き方です。",
      ref: "sk-score" },
    { id: "k08",
      q: "花の種類(0・1・2)を当てる「分類」に使うモデルは?",
      code: "from sklearn.linear_model import ____\n\n# X: 花の大きさ(特徴4つ)、y: 花の種類(0・1・2)",
      kind: "code",
      lib: "sklearn",
      choices: ["LogisticRegression", "LinearRegression", "Classifier", "LogisticClassifier"],
      explain: "`LogisticRegression` は名前に「回帰」とつきますが、分類のモデルです。`LinearRegression` は数値を予測する回帰のモデルです。",
      ref: "sk-fit" },
    { id: "k09",
      q: "平均0・標準偏差1にそろえる(標準化する)クラスは?",
      code: "from sklearn.preprocessing import ____\n\n# 特徴ごとに、平均0・標準偏差1にそろえたい",
      kind: "code",
      lib: "sklearn",
      choices: ["StandardScaler", "MinMaxScaler", "Standardizer", "Scaler"],
      explain: "標準化は `StandardScaler`。`MinMaxScaler` は最小0・最大1にそろえるもので、別の変換です。",
      ref: "sk-scaler" },
    { id: "k10",
      q: "訓練データで作った標準化を、テストデータにも使いたい。空欄は?",
      code: "from sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nX_train_s = scaler.fit_transform(X_train)\nX_test_s = scaler.____(X_test)",
      kind: "code",
      lib: "sklearn",
      choices: ["transform", "fit_transform", "fit", "predict"],
      explain: "テストデータは `transform` だけ。訓練データの平均と標準偏差で変換します。`fit_transform` だとテストデータで平均を計算し直してしまいます。",
      ref: "sk-scaler" },
    { id: "k11",
      q: "テストデータに `fit_transform` を使ってはいけない理由は?",
      kind: "text",
      lib: "sklearn",
      choices: ["テストデータの平均・標準偏差を使ってしまい、訓練データと違う変換になるから", "`fit_transform` はテストデータに使うとエラーになるから", "`fit_transform` は訓練用で、値を変えずに返すから", "テストデータは標準化してはいけないから"],
      explain: "変換のものさしは訓練データで1回だけ決め、テストデータにも同じものさしを当てます。テストデータの情報を前処理に使うのも、本番では手に入らない情報を使うことになります。",
      ref: "sk-scaler" },
    { id: "k12",
      q: "「回帰」の問題はどれ?",
      kind: "text",
      lib: "sklearn",
      choices: ["家の広さや駅からの距離から、家賃(円)を予測する", "メールが迷惑メールかどうかを判定する", "手書きの数字が0〜9のどれかを当てる", "写真が犬か猫かを見分ける"],
      explain: "数値そのものを予測するのが回帰、いくつかの種類のどれかを当てるのが分類です。ほかの3つは分類です。",
      ref: "sk-fit" },
    { id: "k13",
      q: "`train_test_split(…, random_state=0)` の `random_state` の役目は?",
      kind: "text",
      lib: "sklearn",
      choices: ["分け方を毎回同じにして、結果を再現できるようにする", "テストデータの割合を決める", "データの0番目をテスト用にする", "乱数を使わずに、先頭から順に分ける"],
      explain: "分け方は乱数で決まります。`random_state` に同じ数を渡すと、何度実行しても同じ分け方になり、結果を比べやすくなります。割合は `test_size` です。",
      ref: "sk-split" }
  ]
});

PYD.register("nn-numpy", {
  cards: [
    { id: "nn-neuron",
      name: "重みとバイアス",
      read: "1つのニューロン",
      desc: "ニューロンは、入力に重み `w` をかけて足し合わせ、バイアス `b` を足した値を出します。`x @ w + b`。学習とは、よい予測ができるように `w` と `b` を少しずつ直していくことです。",
      examples: [["import numpy as np\nx = np.array([1.0, 2.0])\nw = np.array([0.5, -1.0])\nb = 1.0\nprint(x @ w + b)   # 1×0.5 + 2×(-1) + 1", "-0.5"]],
      notes: ["重みとバイアスをまとめて「パラメータ」といいます。"] },
    { id: "nn-activation",
      name: "活性化関数",
      read: "ReLU・シグモイド",
      desc: "ニューロンの出力に通す関数です。ReLU は「負なら0、正ならそのまま」(`np.maximum(0, x)`)。シグモイドは値を0〜1に押し込みます(`1 / (1 + np.exp(-x))`)。これがないと、層を何枚重ねても1枚の直線的な計算と同じになってしまいます。",
      examples: [["import numpy as np\ndef relu(x):\n    return np.maximum(0, x)\nprint(relu(np.array([-2, 0, 3])))", "[0 0 3]"], ["def sigmoid(x):\n    return 1 / (1 + np.exp(-x))\nprint(sigmoid(0))", "0.5"]],
      notes: ["中間の層には ReLU がよく使われます。"] },
    { id: "nn-forward",
      name: "順伝播",
      read: "入力から出力まで計算する",
      desc: "層は「`X @ W + b` → 活性化関数」のくり返しです。`X` の形が `(件数, 入力の数)` なら、`W` は `(入力の数, 出力の数)`、`b` は `(出力の数,)`。結果は `(件数, 出力の数)` になります。入力から順に出力まで計算することを順伝播といいます。",
      examples: [["import numpy as np\nX = np.ones((4, 3))      # 4件、特徴3つ\nW1 = np.ones((3, 5))\nb1 = np.zeros(5)\nh = np.maximum(0, X @ W1 + b1)\nprint(h.shape)", "(4, 5)"], ["W2 = np.ones((5, 2))\nb2 = np.zeros(2)\nout = h @ W2 + b2\nprint(out.shape)", "(4, 2)"], ["scores = np.array([[0.1, 2.0, 0.3], [1.5, 0.2, 0.1]])\nprint(scores.argmax(axis=1))   # 1件ごとの予測", "[1 0]"]],
      notes: ["分類では、出力のうち一番大きい位置(`argmax`)を予測ラベルにします。"] },
    { id: "nn-loss",
      name: "損失関数",
      read: "予測のずれを1つの数に",
      desc: "予測と正解のずれを1つの数で表したものが損失です。小さいほどよい予測です。回帰では平均二乗誤差(MSE: ずれの2乗の平均)、分類では交差エントロピーがよく使われます。",
      examples: [["import numpy as np\ny = np.array([1.0, 2.0, 3.0, 4.0])\npred = np.array([1.0, 2.0, 3.0, 8.0])\nprint(np.mean((pred - y) ** 2))", "4.0"]],
      notes: ["学習の目的は、損失をできるだけ小さくするパラメータを見つけることです。"] },
    { id: "nn-gradient",
      name: "勾配と学習率",
      read: "勾配降下法",
      desc: "勾配は「パラメータを少し増やしたら損失がどれだけ増えるか」(傾き)です。損失を減らすには、勾配と逆向きに動かします: `w = w - 学習率 * 勾配`。学習率は1回に動かす幅で、大きすぎると行き過ぎて発散し、小さすぎると学習が遅くなります。",
      examples: [["# 損失 (w - 3)**2 を小さくする。勾配は 2*(w - 3)\nw = 0.0\nlr = 0.25\nfor step in range(2):\n    grad = 2 * (w - 3)\n    w = w - lr * grad\n    print(w)", "1.5\n2.25"]],
      notes: ["勾配の計算(誤差逆伝播)は、PyTorch では `backward()` が自動でやってくれます。", "訓練データ全体を1回使い切ることを1エポックといいます。"] }
  ],
  questions: [
    { id: "g01",
      q: "このコードの出力は?",
      code: "import numpy as np\n\nx = np.array([1.0, 2.0])\nw = np.array([0.5, -1.0])\nb = 1.0\nprint(x @ w + b)",
      kind: "output",
      lib: "numpy",
      choices: ["-0.5", "2.5", "1.5", "-1.5"],
      explain: "1×0.5 + 2×(-1.0) = -1.5、それにバイアス 1.0 を足して -0.5 です。",
      ref: "nn-neuron" },
    { id: "g02",
      q: "ReLU(負なら0、正ならそのまま)を作りたい。空欄は?",
      code: "import numpy as np\n\ndef relu(x):\n    return np.____(0, x)\n\nprint(relu(np.array([-2, 0, 3])))",
      kind: "code",
      lib: "numpy",
      choices: ["maximum", "max", "abs", "sign"],
      expect: "[0 0 3]",
      explain: "`np.maximum(0, x)` は要素ごとに0と比べて大きいほうを返します。`np.max` は配列の中の最大値1つを求める関数で、ここでは使えません。",
      ref: "nn-activation" },
    { id: "g03",
      q: "このコードの出力は?",
      code: "import numpy as np\n\ndef sigmoid(x):\n    return 1 / (1 + np.exp(-x))\n\nprint(sigmoid(0))",
      kind: "output",
      lib: "numpy",
      choices: ["0.5", "0", "1", "1.0"],
      explain: "`np.exp(0)` は1なので、1 / (1 + 1) = 0.5。シグモイドは0のとき真ん中の0.5になります。",
      ref: "nn-activation" },
    { id: "g04",
      q: "活性化関数を使う理由は?",
      kind: "text",
      lib: "numpy",
      choices: ["層を重ねても直線的な計算(行列の積と足し算)だけにならず、複雑な関係を表せるようにするため", "計算を速くするため", "重みを0にしないため", "損失を必ず0にするため"],
      explain: "行列の積と足し算だけを何回重ねても、まとめると1回の行列の積と足し算になります。間に ReLU などの曲がった関数をはさむことで、層を重ねる意味が出ます。",
      ref: "nn-activation" },
    { id: "g05",
      q: "このコードの出力は?",
      code: "import numpy as np\n\nX = np.ones((4, 3))   # 4件、特徴3つ\nW = np.ones((3, 5))\nb = np.zeros(5)\nh = X @ W + b\nprint(h.shape)",
      kind: "output",
      lib: "numpy",
      choices: ["(4, 5)", "(3, 5)", "(4, 3)", "(5, 4)"],
      explain: "`(4, 3) @ (3, 5)` は、内側の3が消えて `(4, 5)`。4件それぞれに5つの出力ができます。",
      ref: "nn-forward" },
    { id: "g06",
      q: "特徴4つのデータ10件を、出力8つの層に通したい。空欄に入る重み `W` の形は?",
      code: "import numpy as np\n\nX = np.ones((10, 4))\nW = np.ones(____)\nprint((X @ W).shape)",
      kind: "code",
      lib: "numpy",
      choices: ["(4, 8)", "(8, 4)", "(10, 8)", "(8, 10)"],
      expect: "(10, 8)",
      explain: "重みの形は `(入力の数, 出力の数)`。`(10, 4) @ (4, 8)` で `(10, 8)` になります。件数10は重みに関係しません。",
      ref: "nn-forward" },
    { id: "g07",
      q: "このコードの出力は?",
      code: "import numpy as np\n\ny = np.array([1.0, 2.0, 3.0, 4.0])\npred = np.array([1.0, 2.0, 3.0, 8.0])\nprint(np.mean((pred - y) ** 2))",
      kind: "output",
      lib: "numpy",
      choices: ["4.0", "16.0", "1.0", "2.0"],
      explain: "ずれは 0, 0, 0, 4。2乗すると 0, 0, 0, 16 で、その平均は 16/4 = 4.0 です(平均二乗誤差)。",
      ref: "nn-loss" },
    { id: "g08",
      q: "勾配降下法で重みを1回更新したい。空欄に入る演算子は?",
      code: "w = 1.0\nlr = 0.1      # 学習率\ngrad = 2.0    # 損失の勾配\nw = w ____ lr * grad\nprint(w)",
      kind: "code",
      lib: "numpy",
      choices: ["-", "+", "*", "/"],
      expect: "0.8",
      explain: "勾配は損失が増える向きなので、その逆に動かすために引きます。1.0 - 0.1×2.0 = 0.8。",
      ref: "nn-gradient" },
    { id: "g09",
      q: "このコードの出力は?",
      code: "# 損失 (w - 3)**2 を小さくする。勾配は 2*(w - 3)\nw = 0.0\nlr = 0.25\nfor step in range(2):\n    grad = 2 * (w - 3)\n    w = w - lr * grad\nprint(w)",
      kind: "output",
      lib: "numpy",
      choices: ["2.25", "1.5", "3.0", "0.75"],
      explain: "1回目: 勾配 -6、w = 0 - 0.25×(-6) = 1.5。2回目: 勾配 -3、w = 1.5 + 0.75 = 2.25。損失が最小になる3に近づいていきます。",
      ref: "nn-gradient" },
    { id: "g10",
      q: "学習率を大きくしすぎると、どうなりやすい?",
      kind: "text",
      lib: "numpy",
      choices: ["一度に動きすぎて最適な値を飛び越え、損失が減らない・発散する", "学習がとても遅くなる", "必ず早く最適な値にたどり着く", "重みがまったく変わらなくなる"],
      explain: "学習率は1回に動かす幅です。大きすぎると谷底を飛び越えて行ったり来たりし、ひどいと損失がどんどん大きくなります。小さすぎると遅くなります。",
      ref: "nn-gradient" },
    { id: "g11",
      q: "このコードの出力は?",
      code: "import numpy as np\n\nscores = np.array([[0.1, 2.0, 0.3],\n                   [1.5, 0.2, 0.1]])\nprint(scores.argmax(axis=1))",
      kind: "output",
      lib: "numpy",
      choices: ["[1 0]", "[0 1]", "[2. 1.5]", "1"],
      explain: "`axis=1` で行(1件)ごとに、最大値の位置を求めます。1件目は 2.0 の位置1、2件目は 1.5 の位置0。これが予測ラベルです。",
      ref: "nn-forward" },
    { id: "g12",
      q: "「勾配」の説明として正しいものは?",
      kind: "text",
      lib: "numpy",
      choices: ["パラメータを少し増やしたときに、損失がどれだけ・どちら向きに変わるか", "損失の値そのもの", "正解と予測の差", "1回の更新で重みを動かす幅を決める設定値"],
      explain: "勾配は損失の傾きです。正なら増やすと損失が増えるので減らし、負なら増やします。動かす幅を決める設定値は学習率です。",
      ref: "nn-gradient" },
    { id: "g13",
      q: "ReLU を通したあとの出力を求めたい。空欄に入る関数名は?",
      code: "import numpy as np\n\nX = np.array([[1.0, -2.0]])\nW = np.array([[1.0, 0.0],\n              [1.0, 1.0]])\nb = np.array([0.0, 1.0])\nh = np.____(0, X @ W + b)\nprint(h.shape)",
      kind: "code",
      lib: "numpy",
      choices: ["maximum", "max", "relu", "clip"],
      expect: "(1, 2)",
      explain: "NumPy に `relu` という関数はないので、`np.maximum(0, …)` で作ります。`X @ W + b` は `[[-1. -1.]]` で、ReLU を通すと `[[0. 0.]]`、形は `(1, 2)` です。",
      ref: "nn-activation" },
    { id: "g14",
      q: "「1エポック」とは?",
      kind: "text",
      lib: "numpy",
      choices: ["訓練データ全体を1回ずつ使って学習すること", "重みを1回更新すること", "1件のデータで予測すること", "学習率を1回変えること"],
      explain: "データ全体をひととおり使うのが1エポックです。データを小分け(ミニバッチ)にして学ぶときは、1エポックの間に何回も重みを更新します。",
      ref: "nn-gradient" }
  ]
});

PYD.register("torch-basics", {
  cards: [
    { id: "torch-tensor",
      name: "torch.tensor",
      read: "PyTorch の配列",
      desc: "PyTorch では、NumPy の配列にあたるものを tensor(テンソル)といいます。`torch.tensor(リスト)` で作り、`shape`、`sum()`、`@`、`reshape` など NumPy とほぼ同じように使えます。数1つの tensor から Python の数を取り出すには `.item()` を使います。",
      examples: [["import torch\nx = torch.tensor([[1, 2, 3], [4, 5, 6]])\nprint(x.shape)", "torch.Size([2, 3])"], ["print(x.sum().item())", "21"], ["print(torch.tensor([1, 2, 3]).dtype)", "torch.int64"], ["print((torch.ones(2, 3) @ torch.ones(3, 4)).shape)", "torch.Size([2, 4])"]],
      notes: ["学習に使う値は小数(`torch.float32`)にします。`torch.tensor([1.0, 2.0])` のように小数で書くか、`.float()` で変換します。", "NumPy の配列とは `torch.from_numpy(a)`、`t.numpy()` で行き来できます。"] },
    { id: "torch-autograd",
      name: "requires_grad・backward",
      read: "勾配の自動計算",
      desc: "`requires_grad=True` をつけた tensor は、計算の道のりが記録されます。最後の値(損失)で `.backward()` を呼ぶと、勾配が自動で計算され、各 tensor の `.grad` に入ります。",
      examples: [["import torch\nx = torch.tensor(3.0, requires_grad=True)\ny = x ** 2\ny.backward()\nprint(x.grad.item())   # dy/dx = 2x", "6.0"]],
      notes: ["`.grad` は呼ぶたびに足し算されていきます(上書きではない)。そのため学習ループでは毎回0に戻します(`optimizer.zero_grad()`)。", "`requires_grad=True` にできるのは小数の tensor だけです。"] },
    { id: "torch-no-grad",
      name: "torch.no_grad()",
      read: "勾配を記録しない",
      desc: "`with torch.no_grad():` の中の計算は記録されず、勾配も計算されません。予測(評価)するときに使うと、メモリと時間の節約になります。",
      examples: [["import torch\nx = torch.tensor(1.0, requires_grad=True)\nwith torch.no_grad():\n    y = x * 2\nprint(y.requires_grad)", "False"], ["z = x * 2\nprint(z.requires_grad)", "True"]] },
    { id: "torch-device",
      name: "device と .to()",
      read: "CPU と GPU",
      desc: "tensor やモデルは、CPU か GPU(`\"cuda\"`)のどちらかに置いて計算します。`.to(device)` で移します。計算に使う tensor とモデルは、同じ device に置かなければなりません。",
      examples: [["import torch\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\nx = torch.tensor([1.0, 2.0]).to(device)\nprint(x.device)   # GPU がなければ cpu", "cpu"]],
      notes: ["Apple シリコンの Mac では `\"mps\"`(`torch.backends.mps.is_available()`)も使えます。", "GPU がなくても、小さなモデルなら CPU で十分に学習できます。"] }
  ],
  questions: [
    { id: "t01",
      q: "リストから tensor を作りたい。空欄は?",
      code: "import torch\n\nx = torch.____([1.0, 2.0, 3.0])\nprint(x.shape)",
      kind: "code",
      lib: "torch",
      choices: ["tensor", "array", "list", "ndarray"],
      accepts: ["as_tensor", "Tensor"],
      expect: "torch.Size([3])",
      explain: "PyTorch では `torch.tensor(…)` で作ります。`np.array` にあたるものです。",
      ref: "torch-tensor" },
    { id: "t02",
      q: "このコードの出力は?",
      code: "import torch\n\nx = torch.tensor([[1, 2, 3], [4, 5, 6]])\nprint(x.shape)",
      kind: "output",
      lib: "torch",
      choices: ["torch.Size([2, 3])", "(2, 3)", "torch.Size([3, 2])", "[2, 3]"],
      explain: "PyTorch の `shape` は `torch.Size([…])` と表示されます。中身は NumPy と同じく `(行, 列)` の順です。",
      ref: "torch-tensor" },
    { id: "t03",
      q: "このコードの出力は?",
      code: "import torch\n\nx = torch.tensor([[1, 2, 3], [4, 5, 6]])\nprint(x.sum().item())",
      kind: "output",
      lib: "torch",
      choices: ["21", "tensor(21)", "[5, 7, 9]", "6"],
      explain: "`sum()` は全要素の合計で、数1つの tensor になります。`.item()` で Python の数として取り出すので、`21` とだけ表示されます。",
      ref: "torch-tensor" },
    { id: "t04",
      q: "このコードの出力は?",
      code: "import torch\n\nx = torch.tensor(3.0, requires_grad=True)\ny = x ** 2\ny.backward()\nprint(x.grad.item())",
      kind: "output",
      lib: "torch",
      choices: ["6.0", "9.0", "3.0", "2.0"],
      explain: "y = x² を x で微分すると 2x。x = 3 なので 6.0 です。`backward()` がこの計算を自動でしてくれます。",
      ref: "torch-autograd" },
    { id: "t05",
      q: "y を x で微分した値(勾配)を計算させたい。空欄は?",
      code: "import torch\n\nx = torch.tensor(3.0, requires_grad=True)\ny = x ** 2\ny.____()\nprint(x.grad.item())",
      kind: "code",
      lib: "torch",
      choices: ["backward", "grad", "forward", "step"],
      expect: "6.0",
      explain: "`backward()` で勾配を計算し、結果は `x.grad` に入ります。`grad` は結果を入れる場所で、呼び出すものではありません。",
      ref: "torch-autograd" },
    { id: "t06",
      q: "x の勾配を記録したい。空欄に入る引数名は?",
      code: "import torch\n\nx = torch.tensor(2.0, ____=True)\ny = 3 * x ** 2\ny.backward()\nprint(x.grad.item())",
      kind: "code",
      lib: "torch",
      choices: ["requires_grad", "grad", "autograd", "need_grad"],
      expect: "12.0",
      explain: "`requires_grad=True` で、この tensor の勾配を求めると宣言します。y = 3x² の微分は 6x で、x = 2 なら 12.0 です。",
      ref: "torch-autograd" },
    { id: "t07",
      q: "このコードの出力は?",
      code: "import torch\n\nx = torch.tensor(1.0, requires_grad=True)\nfor _ in range(2):\n    y = 5 * x\n    y.backward()\nprint(x.grad.item())",
      kind: "output",
      lib: "torch",
      choices: ["10.0", "5.0", "0.0", "25.0"],
      explain: "`.grad` は `backward()` のたびに足し算されます。5 + 5 = 10.0。だから学習ループでは毎回 `zero_grad()` で0に戻します。",
      ref: "torch-autograd" },
    { id: "t08",
      q: "予測のときは勾配を記録しないようにしたい。空欄は?",
      code: "import torch\n\nx = torch.tensor(1.0, requires_grad=True)\nwith torch.____():\n    y = x * 2\nprint(y.requires_grad)",
      kind: "code",
      lib: "torch",
      choices: ["no_grad", "eval", "grad", "stop_grad"],
      accepts: ["inference_mode"],
      expect: "False",
      explain: "`with torch.no_grad():` の中の計算は記録されないので、`y.requires_grad` は `False` です。`eval` はモデルのメソッドで、`torch.eval()` はありません。",
      ref: "torch-no-grad" },
    { id: "t09",
      q: "このコードの出力は?",
      code: "import torch\n\nx = torch.tensor(1.0, requires_grad=True)\ny = x * 2\nprint(y.requires_grad)",
      kind: "output",
      lib: "torch",
      choices: ["True", "False", "None", "2.0"],
      explain: "`requires_grad=True` の tensor から計算した値は、記録の対象になり `True` です。`no_grad` の中ではないからです。",
      ref: "torch-no-grad" },
    { id: "t10",
      q: "GPU が使えるか調べたい。空欄は?",
      code: "import torch\n\ndevice = \"cuda\" if torch.cuda.____() else \"cpu\"\nprint(device)",
      kind: "code",
      lib: "torch",
      choices: ["is_available", "available", "exists", "enabled"],
      explain: "`torch.cuda.is_available()` は GPU(CUDA)が使えれば `True` を返します。",
      ref: "torch-device" },
    { id: "t11",
      q: "tensor を指定した device に移したい。空欄は?",
      code: "import torch\n\ndevice = \"cpu\"\nx = torch.tensor([1.0, 2.0]).____(device)\nprint(x.device)",
      kind: "code",
      lib: "torch",
      choices: ["to", "move", "device", "send"],
      expect: "cpu",
      explain: "`.to(device)` で移します。モデルも `model.to(device)` と同じ書き方です。",
      ref: "torch-device" },
    { id: "t12",
      q: "このコードの出力は?",
      code: "import torch\n\nprint(torch.tensor([1, 2, 3]).dtype)",
      kind: "output",
      lib: "torch",
      choices: ["torch.int64", "torch.float32", "int", "torch.int32"],
      explain: "整数だけのリストから作ると、64ビット整数 `torch.int64` になります。小数を書けば `torch.float32` です。",
      ref: "torch-tensor" },
    { id: "t13",
      q: "このコードの出力は?",
      code: "import torch\n\na = torch.ones(2, 3)\nb = torch.ones(3, 4)\nprint((a @ b).shape)",
      kind: "output",
      lib: "torch",
      choices: ["torch.Size([2, 4])", "torch.Size([3, 3])", "torch.Size([2, 3])", "torch.Size([4, 2])"],
      explain: "NumPy と同じく、`(2, 3) @ (3, 4)` は内側の3が消えて `(2, 4)` です。",
      ref: "torch-tensor" },
    { id: "t14",
      q: "数1つの tensor `loss` から、Python の小数を取り出したい。空欄は?",
      code: "import torch\n\nloss = torch.tensor(0.25)\nvalue = loss.____()\nprint(type(value).__name__)",
      kind: "code",
      lib: "torch",
      choices: ["item", "value", "float32", "numpy"],
      accepts: ["tolist"],
      expect: "float",
      explain: "`.item()` は要素が1つの tensor を Python の数にします。学習中に損失を表示・記録するときによく使います。",
      ref: "torch-tensor" }
  ]
});

PYD.register("torch-model", {
  cards: [
    { id: "torch-module",
      name: "nn.Module",
      read: "モデルを定義する",
      desc: "モデルは `nn.Module` を継承したクラスで作ります。`__init__` の最初で `super().__init__()` を呼び、層を `self.名前` に入れます。`forward(self, x)` に、入力 `x` から出力までの計算(順伝播)を書きます。使うときは `model(x)` と呼びます(中で `forward` が呼ばれる)。",
      examples: [["import torch\nfrom torch import nn\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nprint(model(torch.zeros(5, 4)).shape)", "torch.Size([5, 2])"]],
      notes: ["`model.forward(x)` と直接呼ばず、`model(x)` と呼びます。", "層は `self.` に入れないと、学習するパラメータとして登録されません。"] },
    { id: "torch-linear",
      name: "nn.Linear・nn.Sequential",
      read: "層を作る",
      desc: "`nn.Linear(入力の数, 出力の数)` は `x @ W + b` を計算する全結合層で、重み `W` とバイアス `b` を持ちます。前の層の出力の数と、次の層の入力の数をそろえます。単純に並べるだけなら `nn.Sequential` でも作れます。",
      examples: [["import torch\nfrom torch import nn\nlayer = nn.Linear(4, 16)\nprint(sum(p.numel() for p in layer.parameters()))   # 4×16 + 16", "80"], ["model = nn.Sequential(\n    nn.Linear(4, 16),\n    nn.ReLU(),\n    nn.Linear(16, 2),\n)\nprint(model(torch.zeros(5, 4)).shape)", "torch.Size([5, 2])"]],
      notes: ["活性化関数は `torch.relu(x)`(関数)か `nn.ReLU()`(層)で使います。"] },
    { id: "torch-loss",
      name: "損失関数",
      read: "MSELoss・CrossEntropyLoss",
      desc: "回帰(数値を予測)には `nn.MSELoss()`(平均二乗誤差)、分類には `nn.CrossEntropyLoss()`(交差エントロピー)を使います。`loss = loss_fn(予測, 正解)` の順に渡します。",
      examples: [["import torch\nfrom torch import nn\nloss_fn = nn.MSELoss()\nprint(loss_fn(torch.tensor([1.0, 3.0]), torch.tensor([1.0, 1.0])).item())", "2.0"]],
      notes: ["`CrossEntropyLoss` には、モデルの出力をそのまま(softmax をかけずに)渡し、正解はクラス番号の整数(`long`)の tensor で渡します。"] },
    { id: "torch-optim",
      name: "optimizer",
      read: "パラメータを更新する係",
      desc: "`torch.optim.SGD(model.parameters(), lr=0.1)` のように、更新するパラメータと学習率を渡して作ります。`zero_grad()` で勾配を0に戻し、`step()` で勾配を使ってパラメータを更新します。よく使うのは `SGD` と `Adam`。",
      examples: [["optimizer = torch.optim.SGD(model.parameters(), lr=0.1)", ""], ["optimizer = torch.optim.Adam(model.parameters(), lr=0.001)", ""]],
      notes: ["`step()` は、前にやった勾配降下法の `w = w - lr * grad` を、全パラメータにまとめて行います。"] },
    { id: "torch-train-loop",
      name: "学習ループ",
      read: "zero_grad → 予測 → 損失 → backward → step",
      desc: "学習は次の5行のくり返しです。① `optimizer.zero_grad()` 勾配を0に ② `pred = model(X)` 予測 ③ `loss = loss_fn(pred, y)` 損失 ④ `loss.backward()` 勾配を計算 ⑤ `optimizer.step()` 更新。",
      examples: [["import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.step()\n    if epoch % 20 == 0:\n        print(epoch, loss.item())   # 損失がだんだん小さくなる"]],
      notes: ["データが多いときは `torch.utils.data` の `DataLoader` で小分け(ミニバッチ)にし、`for xb, yb in loader:` の中で同じ5行を書きます。", "`zero_grad()` を忘れると、前の回の勾配が足されたままになります。"] },
    { id: "torch-eval-save",
      name: "評価と保存",
      read: "eval・no_grad・argmax・state_dict",
      desc: "評価の前に `model.eval()` で評価モードにし、`with torch.no_grad():` の中で予測します。分類では `model(X).argmax(dim=1)` で予測ラベルにします。学習した重みは `torch.save(model.state_dict(), \"model.pt\")` で保存し、`model.load_state_dict(torch.load(\"model.pt\"))` で読み込みます。",
      examples: [["model.eval()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")   # 例: 正解率: 0.97"], ["torch.save(model.state_dict(), \"model.pt\")\n\nmodel2 = Net()\nmodel2.load_state_dict(torch.load(\"model.pt\"))\nmodel2.eval()", ""]],
      notes: ["学習を続けるときは `model.train()` で学習モードに戻します(Dropout などの層の動きが変わります)。", "本当の実力は、学習に使っていないテストデータで測ります。"] }
  ],
  questions: [
    { id: "m01",
      q: "PyTorch のモデルを作るときに継承するクラスは? 空欄を埋めてください。",
      code: "import torch\nfrom torch import nn\n\nclass Net(nn.____):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nprint(model(torch.zeros(5, 4)).shape)",
      kind: "code",
      lib: "torch",
      choices: ["Module", "Model", "Network", "Layer"],
      expect: "torch.Size([5, 2])",
      explain: "モデルは `nn.Module` を継承して作ります。こうすると、層のパラメータの管理や `model(x)` での呼び出しが使えるようになります。",
      ref: "torch-module" },
    { id: "m02",
      q: "入力から出力までの計算を書くメソッドの名前は?",
      code: "import torch\nfrom torch import nn\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def ____(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nprint(model(torch.zeros(5, 4)).shape)",
      kind: "code",
      lib: "torch",
      choices: ["forward", "call", "predict", "run"],
      expect: "torch.Size([5, 2])",
      explain: "`forward` に順伝播を書きます。`model(x)` と呼ぶと、PyTorch が中で `forward` を呼びます。`__call__` を自分で書き換えてはいけません。",
      ref: "torch-module" },
    { id: "m03",
      q: "`fc1` の出力の数を、次の層 `fc2` に合わせたい。空欄に入る数は?",
      code: "import torch\nfrom torch import nn\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, ____)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nprint(model(torch.zeros(5, 4)).shape)",
      kind: "code",
      lib: "torch",
      choices: ["16", "4", "2", "5"],
      expect: "torch.Size([5, 2])",
      explain: "`fc1` の出力がそのまま `fc2` の入力になるので、`fc2 = nn.Linear(16, 2)` の入力の数 16 にそろえます。",
      ref: "torch-linear" },
    { id: "m04",
      q: "このコードの出力は?",
      code: "import torch\nfrom torch import nn\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nprint(model(torch.zeros(5, 4)).shape)",
      kind: "output",
      lib: "torch",
      choices: ["torch.Size([5, 2])", "torch.Size([5, 4])", "torch.Size([5, 16])", "torch.Size([2])"],
      explain: "5件、特徴4つの入力が `(5, 4)` → `fc1` で `(5, 16)` → `fc2` で `(5, 2)` になります。件数5はそのまま残ります。",
      ref: "torch-module" },
    { id: "m05",
      q: "このコードの出力は?",
      code: "import torch\nfrom torch import nn\n\nlayer = nn.Linear(4, 16)\nprint(sum(p.numel() for p in layer.parameters()))",
      kind: "output",
      lib: "torch",
      choices: ["80", "64", "20", "16"],
      explain: "重み `W` が 4×16 = 64個、バイアス `b` が出力の数と同じ16個で、合わせて80個です。",
      ref: "torch-linear" },
    { id: "m06",
      q: "0か1かを当てる分類なので、それに合う損失関数を使いたい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.____()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.step()\n\nmodel.eval()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.state_dict(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["CrossEntropyLoss", "MSELoss", "CrossEntropy", "AccuracyLoss"],
      explain: "分類は `nn.CrossEntropyLoss()`。モデルの出力(クラスごとの点数)と、整数の正解ラベルを渡します。`MSELoss` は数値を予測する回帰用です。",
      ref: "torch-loss" },
    { id: "m07",
      q: "optimizer に、更新するパラメータを渡したい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.____(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.step()\n\nmodel.eval()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.state_dict(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["parameters", "state_dict", "weights", "params"],
      explain: "`model.parameters()` で、モデルの全層の重みとバイアスを渡します。optimizer はこれらを `step()` で更新します。",
      ref: "torch-optim" },
    { id: "m08",
      q: "学習ループの最初に、前の回の勾配を消したい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.____()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.step()\n\nmodel.eval()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.state_dict(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["zero_grad", "reset", "clear", "step"],
      explain: "勾配は `backward()` のたびに足されるので、毎回 `optimizer.zero_grad()` で0に戻してから計算します。",
      ref: "torch-train-loop" },
    { id: "m09",
      q: "損失から勾配を計算したい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.____()\n    optimizer.step()\n\nmodel.eval()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.state_dict(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["backward", "forward", "grad", "step"],
      explain: "`loss.backward()` で、損失に対する全パラメータの勾配が計算され、各パラメータの `.grad` に入ります。",
      ref: "torch-train-loop" },
    { id: "m10",
      q: "計算した勾配でパラメータを更新したい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.____()\n\nmodel.eval()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.state_dict(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["step", "update", "backward", "next"],
      explain: "`optimizer.step()` で、各パラメータを勾配と逆向きに学習率の分だけ動かします。",
      ref: "torch-train-loop" },
    { id: "m11",
      q: "学習ループで `optimizer.zero_grad()` を書き忘れるとどうなる?",
      kind: "text",
      lib: "torch",
      choices: ["前の回までの勾配が足されたまま更新され、正しく学習できない", "エラーで止まる", "勾配が計算されず、重みがまったく変わらない", "何も変わらない(PyTorch が自動で0に戻す)"],
      explain: "`.grad` は足し算されていく仕組みなので、0に戻さないと過去の勾配がたまり、更新の向きと大きさがおかしくなります。エラーにはならないので気づきにくい失敗です。",
      ref: "torch-train-loop" },
    { id: "m12",
      q: "評価の前に、モデルを評価モードに切り替えたい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.step()\n\nmodel.____()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.state_dict(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["eval", "test", "no_grad", "predict"],
      explain: "`model.eval()` で評価モードになります(Dropout などの動きが評価用になる)。`no_grad` は `torch.no_grad()` で、勾配を記録しないためのものです。両方を使います。",
      ref: "torch-eval-save" },
    { id: "m13",
      q: "出力(クラスごとの点数)から、1件ごとに一番点数の高いクラスを予測ラベルにしたい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.step()\n\nmodel.eval()\nwith torch.no_grad():\n    label = model(X).____(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.state_dict(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["argmax", "max", "softmax", "argsort"],
      explain: "`argmax(dim=1)` で、1件(行)ごとに最大値の位置 = クラス番号を返します。`max` は最大値そのもの(と位置の組)を返すので、そのままではラベルと比べられません。",
      ref: "torch-eval-save" },
    { id: "m14",
      q: "学習した重みを保存したい。空欄は?",
      code: "import torch\nfrom torch import nn\n\n# データ: 100件、特徴4つ。正解は0か1\nX = torch.randn(100, 4)\ny = (X.sum(dim=1) > 0).long()\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(4, 16)\n        self.fc2 = nn.Linear(16, 2)\n\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.SGD(model.parameters(), lr=0.1)\n\nfor epoch in range(100):\n    optimizer.zero_grad()\n    pred = model(X)\n    loss = loss_fn(pred, y)\n    loss.backward()\n    optimizer.step()\n\nmodel.eval()\nwith torch.no_grad():\n    label = model(X).argmax(dim=1)\n    acc = (label == y).float().mean().item()\nprint(f\"正解率: {acc:.2f}\")\n\ntorch.save(model.____(), \"model.pt\")",
      kind: "code",
      lib: "torch",
      choices: ["state_dict", "parameters", "weights", "save"],
      explain: "`model.state_dict()` は、層ごとの重みとバイアスを名前つきでまとめた辞書です。読み込むときは `model.load_state_dict(torch.load(\"model.pt\"))`。",
      ref: "torch-eval-save" }
  ]
});

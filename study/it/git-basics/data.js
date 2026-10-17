// Git道場: 8単元の定義・問題・コマンド帳の中身。道場(index.html)とコマンド帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → data.js → graph.js(コミットの図は graph.js が描く)
// 内容は Git 2.40 以降の書き方を前提とする(ブランチの切り替えは git switch、ファイルを戻すのは git restore)。
// デフォルトブランチの名前は main、リモートの名前は origin とする。
//
// ■ 単元の中身の登録(このファイルの後半)
//   GITD.register("単元ID", { commands: [カード, …], questions: [問題, …] });
//
// ■ コマンド帳のカード
//   {
//     id: "git-commit",               // reference.html の id="cmd-git-commit" になる。問題の ref からも使う
//     name: "git commit",             // カードの見出し(等幅)
//     read: "記録する",                // 読み・短い説明(.tag)
//     desc: "意味の説明",              // `…` で囲んだところは <code> になる
//     examples: [["git commit -m \"…\"", "説明"], …],   // 「よく使う例」
//     options: [["-m", "説明"], …],        // 省略可。「オプション・書き方」
//     figures: [{ before: 図, cmd: "git commit -m \"…\"", after: 図 }, …]   // 省略可。「図で見る」
//   }
//
// ■ 問題
//   {
//     id: "c01",                      // ファイル全体で重ならない名前
//     q: "問題文",                     // `…` で囲んだところは <code> になる
//     term: "場面表示",                 // 省略可。"\n" で行を分ける。"$ " で始まる行はコマンド行。
//                                     //   [[a1b2c3d]] はハッシュの色、____ は空欄
//     diff: true,                     // 省略可。term の + 行・- 行・@@ 行を色分けする
//     graph: 図 または [図, 図],         // 省略可。問題の下に出すコミットの図(graph.js の書き方)
//     kind: "cmd",                    // 選択肢の種類。"cmd" = コマンド($ つき) / "code" = 語句(等幅) /
//                                     //   "text" = 説明文 / "graph" = 図(choices に図を4つ)
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。並びはページが毎回まぜる
//     accepts: ["別解", …],            // 入力モードで正解にする別の書き方(先頭の選択肢は書かなくてよい)
//     acceptPatterns: ["^…$", …],      // 省略可。正規化したあとの入力に当てる正規表現(コミットメッセージは自由、など)
//     noInput: true,                  // 省略可。入力モードで出さない
//     explain: "解説",                 // `…` で囲んだところは <code> になる
//     ref: "git-commit"               // コマンド帳のカードの id
//   }
//   入力モードで出すのは、kind が "cmd" の問題(コマンドをまるごと打つ)と、
//   kind が "code" で term に ____ がある問題(空欄の語句を打つ)。どちらも noInput がないものだけ。
//
// ■ 入力の判定(normalize)
//   前後の空白を削り、連続する空白を1つにまとめる。全角の英数字・記号は半角に、‘ ’ “ ” は ' " にそろえる。先頭の「$ 」は取る。
//   $ ` \ を含まない '…' は "…" と同じに扱い、空白などを含まない "…" は引用符を外す。大文字・小文字は区別する。
var GITD = (function () {
  "use strict";

  var STATS_KEY = "gitBasicsStats";
  var SETTINGS_KEY = "gitBasicsSettings";
  var COUNT = 10;
  var MODES = ["choice", "input"];
  var BLANK = "____";

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "setup", no: "01", name: "はじめの設定とリポジトリ", short: "設定", cmds: "init · clone · config · status" },
    { id: "commit", no: "02", name: "変更を記録する", short: "記録", cmds: "add · commit · diff · ステージ" },
    { id: "history", no: "03", name: "履歴を見る", short: "履歴", cmds: "log · show · HEAD · ~ ^" },
    { id: "branch", no: "04", name: "ブランチ", short: "ブランチ", cmds: "branch · switch · checkout" },
    { id: "merge", no: "05", name: "マージとコンフリクト", short: "マージ", cmds: "merge · fast-forward · 競合" },
    { id: "remote", no: "06", name: "リモート", short: "リモート", cmds: "remote · fetch · pull · push" },
    { id: "undo", no: "07", name: "取り消し", short: "取り消し", cmds: "restore · reset · revert · stash" },
    { id: "rewrite", no: "08", name: "rebaseと履歴の整理", short: "整理", cmds: "rebase · cherry-pick · tag · .gitignore" }
  ];

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("GITD.register: 登録できません: " + id);
      return;
    }
    var c = {
      commands: Array.isArray(data.commands) ? data.commands : [],
      questions: Array.isArray(data.questions) ? data.questions : []
    };
    c.commands.forEach(function (card) { if (card && card.id) cardIndex[card.id] = { card: card, unitId: id }; });
    content[id] = c;
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  function card(id) { return cardIndex.hasOwnProperty(id) ? cardIndex[id].card : null; }

  // ---------- 入力の判定 ----------
  function normalize(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/[‘’]/g, "'").replace(/[“”]/g, "\"");
    s = s.replace(/[！-～]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); });
    s = s.replace(/[　\t\r\n]/g, " ");
    s = s.replace(/ +/g, " ").trim();
    s = s.replace(/^\$ ?/, "");               // 先頭のプロンプト「$ 」まで打っても同じに扱う
    s = s.replace(/'([^'$`\\]*)'/g, "\"$1\"");
    s = s.replace(/"([A-Za-z0-9_.,\/:=+@%~^{}\-]*)"/g, "$1");
    return s;
  }
  function kindOf(q) { return q.kind === "code" || q.kind === "text" || q.kind === "graph" ? q.kind : "cmd"; }
  function hasBlank(q) { return typeof q.term === "string" && q.term.indexOf(BLANK) >= 0; }
  function isBlankInput(q) { return kindOf(q) === "code" && hasBlank(q); }
  function isInputable(q) { return !q.noInput && (kindOf(q) === "cmd" || isBlankInput(q)); }
  function answersOf(q) {
    var list = [q.choices[0]].concat(Array.isArray(q.accepts) ? q.accepts : []);
    return list.map(normalize);
  }
  function patternsOf(q) {
    return (Array.isArray(q.acceptPatterns) ? q.acceptPatterns : []).map(function (src) { return new RegExp(src); });
  }
  function isMatch(q, typed) {
    var t = normalize(typed);
    if (!t) return false;
    if (answersOf(q).indexOf(t) >= 0) return true;
    return patternsOf(q).some(function (re) { return re.test(t); });
  }
  // 空欄に答えを入れた場面表示
  function fillBlank(text, answer) { return String(text).split(BLANK).join(answer); }

  // 問題の形を確かめる。問題点の一覧を返す(なければ空の配列)。検証スクリプトもこれを使う
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (typeof q.q !== "string" || !q.q) errs.push("q がない");
    var kind = kindOf(q);
    var canCheckGraph = typeof GITD.checkGraph === "function";
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else if (kind === "graph") {
      var seenG = {};
      q.choices.forEach(function (g, i) {
        if (!g || typeof g !== "object") { errs.push("choices[" + i + "] が図ではない"); return; }
        if (canCheckGraph) GITD.checkGraph(g, GITD.MAX_COLS_CHOICE).forEach(function (e) { errs.push("choices[" + i + "] の図: " + e); });
        var k = JSON.stringify(g);
        if (seenG[k]) errs.push("choices[" + i + "] の図が、ほかの選択肢と同じ");
        seenG[k] = true;
      });
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c.trim()) { errs.push("choices[" + i + "] が空"); return; }
        var k = normalize(c);
        if (seen[k]) errs.push("choices に同じものがある: " + c);
        seen[k] = true;
      });
      if (isInputable(q) && errs.length === 0) {
        var ans = answersOf(q), pats = [];
        try { pats = patternsOf(q); } catch (e) { pats = []; }
        q.choices.slice(1).forEach(function (c) {
          var n = normalize(c);
          if (ans.indexOf(n) >= 0) errs.push("誤答が正解の書き方と同じ: " + c);
          if (pats.some(function (re) { return re.test(n); })) errs.push("誤答が acceptPatterns に当たる: " + c);
        });
        if (!isMatch(q, q.choices[0])) errs.push("正解の選択肢が正解と判定されない");
        (q.accepts || []).forEach(function (a) { if (!isMatch(q, a)) errs.push("accepts が正解と判定されない: " + a); });
      }
    }
    if (q.accepts !== undefined && !Array.isArray(q.accepts)) errs.push("accepts が配列ではない");
    if (q.acceptPatterns !== undefined) {
      if (!Array.isArray(q.acceptPatterns)) errs.push("acceptPatterns が配列ではない");
      else q.acceptPatterns.forEach(function (src) {
        try { new RegExp(src); } catch (e) { errs.push("acceptPatterns の正規表現が読めない: " + src); }
      });
    }
    if (q.graph !== undefined) {
      var gs = Array.isArray(q.graph) ? q.graph : [q.graph];
      if (gs.length < 1 || gs.length > 2) errs.push("graph は図1つか2つ");
      if (canCheckGraph) gs.forEach(function (g, i) {
        GITD.checkGraph(g, GITD.MAX_COLS).forEach(function (e) { errs.push("graph[" + i + "]: " + e); });
      });
    }
    if (kind === "code" && hasBlank(q) && q.term.split(BLANK).length !== 2) errs.push("term の空欄が1つではない");
    if (typeof q.explain !== "string" || !q.explain) errs.push("explain がない");
    if (q.ref && !card(q.ref)) errs.push("ref のカードがない: " + q.ref);
    return errs;
  }
  function hasGraph(q) { return kindOf(q) === "graph" || q.graph !== undefined; }

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
      term: q.term || "",
      diff: !!q.diff,
      graph: q.graph || null,
      kind: kindOf(q),
      blank: isBlankInput(q),
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
    unit: unit, register: register, contentOf: contentOf, card: card,
    normalize: normalize, isMatch: isMatch, isInputable: isInputable, isBlankInput: isBlankInput, kindOf: kindOf,
    hasBlank: hasBlank, fillBlank: fillBlank, hasGraph: hasGraph,
    checkQuestion: checkQuestion, isReady: isReady, poolOf: poolOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();

// 図を短く書くための関数(data.js の中だけで使う)
//   GITD.chain("A B C") → [{id:"A"},{id:"B",parent:"A"},{id:"C",parent:"B"}]
//   GITD.chain("D E", "B", 1) → D の親は B、段 1 に置く
GITD.chain = function (ids, parent, lane) {
  var out = [];
  ids.split(" ").forEach(function (id, i) {
    var c = { id: id };
    var p = i === 0 ? parent : out[i - 1].id;
    if (p) c.parent = p;
    if (i === 0 && typeof lane === "number") c.lane = lane;
    out.push(c);
  });
  return out;
};


// =====================================================================
// 01 はじめの設定とリポジトリ
// =====================================================================
GITD.register("setup", {
  commands: [
    {
      id: "git-init", name: "git init", read: "リポジトリを作る",
      desc: "今いるフォルダーを Git のリポジトリにします。フォルダーの中に `.git` ができ、履歴や設定はすべてそこに入ります。`.git` を消すと履歴も消えます。",
      examples: [
        ["git init", "今いるフォルダーをリポジトリにする"],
        ["git init -b main", "最初のブランチ名を main にして作る"],
        ["git init myapp", "myapp フォルダーを作ってリポジトリにする"]
      ],
      options: [["-b <名前>", "最初のブランチの名前(--initial-branch と同じ)"]]
    },
    {
      id: "git-clone", name: "git clone", read: "複製する",
      desc: "リモートのリポジトリを、履歴ごと手元に複製します。複製元は `origin` という名前で登録され、既定のブランチ(ふつうは `main`)が作業ツリーに取り出されます。",
      examples: [
        ["git clone https://github.com/taro/app.git", "app フォルダーに複製"],
        ["git clone https://github.com/taro/app.git myapp", "myapp という名前のフォルダーに複製"]
      ]
    },
    {
      id: "git-config", name: "git config", read: "設定する",
      desc: "名前やメールなどの設定を読み書きします。`--global` はそのパソコンの全リポジトリに効く設定(~/.gitconfig)、つけなければ今のリポジトリだけの設定です。コミットには user.name と user.email が記録されます。",
      examples: [
        ["git config --global user.name \"Taro Yamada\"", "コミットに記録する名前"],
        ["git config --global user.email \"taro@example.com\"", "コミットに記録するメール"],
        ["git config --global init.defaultBranch main", "git init で作る最初のブランチ名"],
        ["git config --list", "今効いている設定の一覧(-l でも同じ)"]
      ],
      options: [
        ["--global", "ユーザー全体の設定(~/.gitconfig)"],
        ["--local", "今のリポジトリだけの設定(.git/config)。何もつけないときと同じ"],
        ["--list", "設定の一覧"]
      ]
    },
    {
      id: "git-status", name: "git status", read: "状態を見る",
      desc: "今のブランチ、ステージした変更、まだステージしていない変更、追跡していないファイルを表示します。迷ったらまず `git status`。",
      examples: [
        ["git status", "くわしい表示"],
        ["git status -s", "短い表示(--short)"]
      ],
      options: [
        ["-s の左の文字", "ステージの状態。M = ステージ済みの変更、A = 新しく追加してステージ"],
        ["-s の右の文字", "作業ツリーの状態。M = まだステージしていない変更、D = 削除"],
        ["??", "まだ追跡していないファイル"]
      ]
    },
    {
      id: "git-help", name: "git help", read: "使い方を見る",
      desc: "コマンドの説明書を表示します。短い使い方だけなら `-h`。",
      examples: [
        ["git help commit", "git commit の説明書(git commit --help と同じ)"],
        ["git commit -h", "オプションの短い一覧"]
      ]
    }
  ],
  questions: [
    {
      id: "s01", q: "今いるフォルダーを、新しい Git リポジトリにするコマンドは?",
      choices: ["git init", "git clone .", "git add .", "git commit --init"],
      explain: "`git init` はフォルダーの中に `.git` を作り、そこから履歴を記録できるようにします。`git clone` はリモートにあるリポジトリを複製するコマンドです。",
      ref: "git-init"
    },
    {
      id: "s02", q: "コミットに記録する名前を「Taro」にします。このパソコンの全リポジトリに効かせるコマンドは?",
      choices: ["git config --global user.name \"Taro\"", "git config --global user.email \"Taro\"", "git config --local user.name \"Taro\"", "git set --global user.name \"Taro\""],
      acceptPatterns: ["^git config --global user\\.name (\"[^\"]+\"|\\S+)$"],
      explain: "名前は `user.name`、メールは `user.email` です。`--global` をつけるとユーザー全体の設定になり、`--local`(または何もつけない)だと今のリポジトリだけの設定になります。入力モードでは名前の中身は何でも正解です。",
      ref: "git-config"
    },
    {
      id: "s03", q: "コミットに記録するメールアドレスを、全リポジトリ共通で設定するコマンドは?",
      choices: ["git config --global user.email \"taro@example.com\"", "git config --global user.name \"taro@example.com\"", "git config --global email \"taro@example.com\"", "git remote add email \"taro@example.com\""],
      acceptPatterns: ["^git config --global user\\.email (\"[^\"]+\"|\\S+)$"],
      explain: "キーは `user.email` です(`email` だけでは Git が使う設定になりません)。入力モードではアドレスの中身は何でも正解です。",
      ref: "git-config"
    },
    {
      id: "s04", q: "GitHub の `https://github.com/taro/app.git` を、履歴ごと手元に複製するコマンドは?",
      choices: ["git clone https://github.com/taro/app.git", "git pull https://github.com/taro/app.git", "git fetch https://github.com/taro/app.git", "git init https://github.com/taro/app.git"],
      explain: "`git clone` はリポジトリを丸ごと複製し、複製元を `origin` という名前で登録します。`pull` や `fetch` は、すでにあるリポジトリに変更を取り込むときに使います。",
      ref: "git-clone"
    },
    {
      id: "s05", q: "これから git init で作るリポジトリの、最初のブランチ名を main にします。空欄に入るのは?",
      term: "$ git config --global ____ main",
      kind: "code",
      choices: ["init.defaultBranch", "core.defaultBranch", "init.branch", "branch.default"],
      explain: "`init.defaultBranch` は `git init` のときに作る最初のブランチの名前です。GitHub で作るリポジトリも、今は `main` が既定です。",
      ref: "git-config"
    },
    {
      id: "s06", q: "`git status -s` の行の先頭にある `??` の意味は?",
      kind: "text",
      choices: ["まだ Git が追跡していないファイル", "変更したが、まだステージしていないファイル", "コンフリクト(競合)しているファイル", "削除したファイル"],
      explain: "`??` は untracked(追跡していない)の印です。`git add` すると追跡が始まり、`A ` に変わります。",
      ref: "git-status"
    },
    {
      id: "s07", q: "この表示で、ステージ済み(次のコミットに入る)の変更があるファイルは?",
      term: "$ git status -s\n M index.html\nM  style.css\n?? memo.txt\n D old.txt",
      kind: "code",
      choices: ["style.css", "index.html", "memo.txt", "old.txt"],
      explain: "短い表示は2文字で、左がステージ、右が作業ツリーの状態です。`M  style.css` は左に M があるのでステージ済み。` M` と ` D` は右の列なので、まだステージしていない変更(変更・削除)です。",
      ref: "git-status"
    },
    {
      id: "s08", q: "`git status` を短い形式で表示します。空欄に入るのは?",
      term: "$ git status ____",
      kind: "code",
      choices: ["-s", "--oneline", "--stat", "--graph"],
      accepts: ["--short"],
      explain: "`-s`(`--short`)で1ファイル1行の短い表示になります。`--oneline` や `--graph` は `git log` のオプションです。",
      ref: "git-status"
    },
    {
      id: "s09", q: "リポジトリのフォルダーにある `.git` は何?",
      kind: "text",
      choices: ["履歴や設定が入っている、Git の本体。消すと履歴がなくなる", "GitHub に送る前の一時ファイル。消しても困らない", "無視するファイルを書く設定ファイル", "最後にコミットしたファイルの控えだけが入っている"],
      explain: "コミット・ブランチ・設定などは、すべて `.git` の中にあります。無視するファイルを書くのは `.gitignore` です。",
      ref: "git-init"
    },
    {
      id: "s10", q: "`git clone` で複製したリポジトリについて、正しいのは?",
      kind: "text",
      choices: ["複製元が origin という名前で登録され、既定のブランチが取り出されている", "リモートは登録されないので、あとで git remote add が必ず要る", "最新のコミットだけが入っていて、過去の履歴はない", "リモートの全ブランチが、それぞれローカルブランチとして作られている"],
      explain: "clone すると複製元が `origin` として登録され、`origin/main` などの追跡ブランチと、ローカルの `main` ができます。ほかのブランチは `origin/feat` などの追跡ブランチとして入っていて、`git switch feat` で取り出せます。",
      ref: "git-clone"
    },
    {
      id: "s11", q: "今効いている Git の設定を一覧で表示するコマンドは?",
      choices: ["git config --list", "git config --show", "git status --config", "git log --config"],
      accepts: ["git config -l"],
      explain: "`git config --list`(`-l`)で、全体とリポジトリの設定がまとめて出ます。",
      ref: "git-config"
    },
    {
      id: "s12", q: "`git commit` の説明書(ヘルプ)を表示するコマンドは?",
      choices: ["git help commit", "git man commit", "git commit --info", "git info commit"],
      accepts: ["git commit --help"],
      explain: "`git help commit` か `git commit --help` で説明書が開きます。オプションの短い一覧だけなら `git commit -h` です。",
      ref: "git-help"
    },
    {
      id: "s13", q: "最初のブランチ名を main にして、新しいリポジトリを作ります。空欄に入るのは?",
      term: "$ git init ____ main",
      kind: "code",
      choices: ["-b", "-m", "--name", "-n"],
      accepts: ["--initial-branch"],
      explain: "`git init -b main`(`--initial-branch=main`)で最初のブランチ名を指定できます。毎回指定しないなら `init.defaultBranch` を設定しておきます。",
      ref: "git-init"
    }
  ]
});


// =====================================================================
// 02 変更を記録する
// =====================================================================
(function () {
  var C = GITD.chain;
  GITD.register("commit", {
    commands: [
      {
        id: "staging", name: "3つの場所", read: "作業ツリー・ステージ・リポジトリ",
        desc: "ファイルを編集するのが作業ツリー、次のコミットに入れる変更を置くのがステージ(インデックス)、コミットとして記録されるのがリポジトリです。`git add` で作業ツリー → ステージ、`git commit` でステージ → リポジトリへ進みます。",
        examples: [
          ["git add index.html", "作業ツリーの変更をステージへ"],
          ["git commit -m \"見出しを追加\"", "ステージの内容をコミットとして記録"]
        ],
        options: [
          ["作業ツリー", "今フォルダーにあるファイル。編集はここで行う"],
          ["ステージ", "次のコミットに入れる変更の置き場所(インデックスとも呼ぶ)"],
          ["リポジトリ", "コミットの履歴。.git の中にある"]
        ]
      },
      {
        id: "git-add", name: "git add", read: "ステージする",
        desc: "作業ツリーの変更を、次のコミットに入れるためにステージへ載せます。新しいファイルは add して初めて追跡されます。",
        examples: [
          ["git add index.html", "1つのファイルをステージ"],
          ["git add .", "今いるフォルダー以下の変更をすべてステージ"],
          ["git add -p", "変更を1かたまりずつ確かめながらステージ"]
        ],
        options: [
          [".", "今いるフォルダー以下すべて"],
          ["-A", "リポジトリ全体の変更すべて(削除も含む)"],
          ["-p", "変更の一部だけを選んでステージ(--patch)"]
        ]
      },
      {
        id: "git-commit", name: "git commit", read: "記録する",
        desc: "ステージした内容を、メッセージをつけて1つのコミットとして記録します。今のブランチは新しいコミットへ進み、HEAD もいっしょに進みます。",
        examples: [
          ["git commit -m \"ログイン画面を追加\"", "メッセージをつけてコミット"],
          ["git commit -a -m \"誤字を直す\"", "追跡中のファイルの変更を add してからコミット"],
          ["git commit --amend", "直前のコミットを作り直す(メッセージの修正など)"]
        ],
        options: [
          ["-m \"…\"", "コミットメッセージ(つけないとエディターが開く)"],
          ["-a", "追跡中のファイルの変更・削除を自動でステージ。新しいファイルは入らない"],
          ["--amend", "直前のコミットを置き換える。push 済みなら使わない"]
        ],
        figures: [{
          before: { commits: C("A B"), refs: { main: "B" }, head: "main" },
          cmd: "git commit -m \"見出しを追加\"",
          after: { commits: C("A B C"), refs: { main: "C" }, head: "main", newIds: ["C"] }
        }]
      },
      {
        id: "git-diff", name: "git diff", read: "差分を見る",
        desc: "変更の差分を表示します。何もつけないと「作業ツリーとステージ」の差(まだ add していない変更)、`--staged` だと「ステージと最新コミット」の差(次のコミットに入る変更)です。",
        examples: [
          ["git diff", "まだステージしていない変更"],
          ["git diff --staged", "ステージ済みの変更(--cached と同じ)"],
          ["git diff HEAD~1 HEAD", "1つ前のコミットと最新コミットの差"]
        ],
        options: [
          ["- の行", "消えた行"],
          ["+ の行", "増えた行"],
          ["@@ -1,2 +1,2 @@", "変更のあった場所(元の1行目から2行 → 新しい1行目から2行)"]
        ]
      },
      {
        id: "git-rm", name: "git rm", read: "削除して記録",
        desc: "ファイルを削除し、その削除をステージします。`--cached` をつけると、ファイルは残したまま Git の追跡だけをやめます。",
        examples: [
          ["git rm old.txt", "ファイルを消して、削除をステージ"],
          ["git rm --cached secret.txt", "ファイルは残し、追跡だけやめる"]
        ]
      },
      {
        id: "git-mv", name: "git mv", read: "名前を変えて記録",
        desc: "ファイルの名前変更(移動)を行い、その変更をステージします。ふつうの `mv` のあとに `git add` するのと同じ結果になります。",
        examples: [["git mv a.txt b.txt", "a.txt を b.txt に変える"]]
      }
    ],
    questions: [
      {
        id: "c01", q: "変更した `index.html` を、次のコミットに入れるためにステージするコマンドは?",
        choices: ["git add index.html", "git commit index.html", "git push index.html", "git save index.html"],
        explain: "`git add` で変更をステージに載せ、`git commit` で記録します。commit にファイル名を渡すとステージを飛ばしてそのファイルだけをコミットするので、ステージする操作ではありません。",
        ref: "git-add"
      },
      {
        id: "c02", q: "ステージした内容を、「ログイン画面を追加」というメッセージでコミットするコマンドは?",
        choices: ["git commit -m \"ログイン画面を追加\"", "git commit \"ログイン画面を追加\"", "git add -m \"ログイン画面を追加\"", "git push -m \"ログイン画面を追加\""],
        acceptPatterns: ["^git commit -m (\"[^\"]+\"|\\S+)$", "^git commit --message (\"[^\"]+\"|\\S+)$"],
        explain: "メッセージは `-m` のあとに書きます。`-m` がないと、メッセージの文字はファイル名として扱われてしまいます。入力モードではメッセージの中身は何でも正解です。",
        ref: "git-commit"
      },
      {
        id: "c03", q: "`git add` がすることは?",
        kind: "text",
        choices: ["変更を、次のコミットに入れるためにステージへ載せる", "変更をコミットとして履歴に記録する", "変更をリモートのリポジトリへ送る", "変更を取り消して、最後のコミットの状態に戻す"],
        explain: "add はステージに載せるだけで、まだ履歴には残りません。記録は `git commit`、送るのは `git push` です。",
        ref: "staging"
      },
      {
        id: "c04", q: "編集したが、まだステージしていない変更の中身(差分)を見るコマンドは?",
        choices: ["git diff", "git diff --staged", "git status", "git log -p"],
        explain: "何もつけない `git diff` は「作業ツリーとステージ」の差なので、まだ add していない変更が出ます。`git status` はファイル名だけで、中身は出ません。",
        ref: "git-diff"
      },
      {
        id: "c05", q: "ステージ済みで、次のコミットに入る変更の中身を見るコマンドは?",
        choices: ["git diff --staged", "git diff", "git log --staged", "git show"],
        accepts: ["git diff --cached"],
        explain: "`git diff --staged`(`--cached`)は「ステージと最新コミット」の差です。add したあとに `git diff` だけを実行しても、ステージ済みの変更は出てきません。",
        ref: "git-diff"
      },
      {
        id: "c06", q: "この差分で、新しく増えた行は?",
        term: "$ git diff\ndiff --git a/hello.txt b/hello.txt\nindex [[3b18e51]]..[[a042389]] 100644\n--- a/hello.txt\n+++ b/hello.txt\n@@ -1,2 +1,2 @@\n こんにちは\n-さようなら\n+またね",
        diff: true,
        kind: "code",
        choices: ["またね", "さようなら", "こんにちは", "hello.txt"],
        explain: "`+` で始まる行が増えた行、`-` で始まる行が消えた行です。「さようなら」が「またね」に変わりました。先頭が空白の「こんにちは」は変わっていない行です。",
        ref: "git-diff"
      },
      {
        id: "c07", q: "今いるフォルダー以下の変更を、まとめてステージするコマンドは?",
        choices: ["git add .", "git add -p", "git commit .", "git add -n ."],
        explain: "`git add .` で今いるフォルダー以下がすべてステージされます(リポジトリのいちばん上で実行すれば `git add -A` と同じ)。`-p` は一部だけ選ぶとき、`-n` は試すだけで何もしません。",
        ref: "git-add"
      },
      {
        id: "c08", q: "メッセージをつけてコミットします。空欄に入るのは?",
        term: "$ git commit ____ \"READMEを修正\"",
        kind: "code",
        choices: ["-m", "-a", "-t", "-p"],
        accepts: ["--message"],
        explain: "`-m`(message)のあとにメッセージを書きます。`-a` は追跡中のファイルを自動でステージするオプションで、メッセージの指定にはなりません。",
        ref: "git-commit"
      },
      {
        id: "c09", q: "`git commit -a -m \"…\"` で、コミットに入らないものは?",
        kind: "text",
        choices: ["まだ一度も add していない新しいファイル", "追跡中のファイルへの変更", "追跡中のファイルを削除したこと", "すでにステージしてあった変更"],
        explain: "`-a` は追跡中のファイルの変更と削除を自動でステージします。新しく作ったファイルはまだ追跡されていないので入りません。先に `git add` が必要です。",
        ref: "git-commit"
      },
      {
        id: "c10", q: "直前のコミット(まだ push していない)のメッセージを直したい。使うコマンドは?",
        choices: ["git commit --amend", "git commit --fix", "git revert HEAD", "git reset --amend"],
        acceptPatterns: ["^git commit --amend -m (\"[^\"]+\"|\\S+)$"],
        explain: "`--amend` は直前のコミットを作り直します(ハッシュは変わります)。push 済みのコミットに使うと、他の人の履歴と食い違うので注意します。`git revert HEAD` は打ち消すコミットを新しく足す別の操作です。",
        ref: "git-commit"
      },
      {
        id: "c11", q: "`old.txt` を削除し、その削除もステージするコマンドは?",
        choices: ["git rm old.txt", "rm old.txt", "git delete old.txt", "git restore old.txt"],
        explain: "`git rm` はファイルを消して、削除をステージまで済ませます。ふつうの `rm` だけだと、削除は作業ツリーにとどまり、別に `git add` が要ります。",
        ref: "git-rm"
      },
      {
        id: "c12", q: "`a.txt` の名前を `b.txt` に変え、その変更をステージまで済ませるコマンドは?",
        choices: ["git mv a.txt b.txt", "git rename a.txt b.txt", "git cp a.txt b.txt", "git switch a.txt b.txt"],
        explain: "`git mv` は名前を変えて、その変更をステージします。Git は「a.txt の削除と b.txt の追加」から名前の変更を見分けて表示します。",
        ref: "git-mv"
      },
      {
        id: "c13", q: "うっかり追跡を始めた `secret.txt` を、ファイルは残したまま Git の追跡からはずします。空欄に入るのは?",
        term: "$ git rm ____ secret.txt",
        kind: "code",
        choices: ["--cached", "-f", "-r", "--dry-run"],
        explain: "`--cached` をつけると、ステージ(と次のコミット)からは消えますが、ファイル自体は残ります。続けて `.gitignore` に書いておくと、もう追跡されません。",
        ref: "git-rm"
      },
      {
        id: "c14", q: "変更が記録されるまでの流れとして正しいのは?",
        kind: "text",
        choices: ["作業ツリー → (add)→ ステージ → (commit)→ リポジトリ", "作業ツリー → (commit)→ ステージ → (add)→ リポジトリ", "ステージ → (add)→ 作業ツリー → (commit)→ リポジトリ", "作業ツリー → (push)→ ステージ → (commit)→ リポジトリ"],
        explain: "編集は作業ツリーで行い、`git add` でステージへ、`git commit` でリポジトリ(履歴)へ記録します。リモートへ送る `push` はそのあとです。",
        ref: "staging"
      },
      {
        id: "c15", q: "`git status` に `nothing to commit, working tree clean` と出ました。どういう状態?",
        kind: "text",
        choices: ["最新のコミットから変わったところがない(未ステージもステージ済みもない)", "コミットが1つもない、空のリポジトリ", "リモートとすべて同じで、push する必要もない", "ステージ済みの変更だけがあり、コミットを待っている"],
        explain: "作業ツリーもステージも最新のコミットと同じ、という意味です。リモートとの差は別の行(`Your branch is ahead of …` など)で示されます。",
        ref: "git-status"
      },
      {
        id: "c16", q: "`index.html` の変更のうち一部だけを、1かたまりずつ確かめながらステージします。空欄に入るのは?",
        term: "$ git add ____ index.html",
        kind: "code",
        choices: ["-p", "-A", "-f", "-u"],
        accepts: ["--patch"],
        explain: "`-p`(`--patch`)は変更を1かたまり(hunk)ずつ見せ、y/n でステージするか選ばせます。1つのファイルの変更を、別々のコミットに分けたいときに便利です。",
        ref: "git-add"
      },
      {
        id: "c17", q: "この状態でコミットしたあとの図は?",
        graph: { title: "今", commits: C("A B"), refs: { main: "B" }, head: "main" },
        kind: "graph",
        choices: [
          { commits: C("A B C"), refs: { main: "C" }, head: "main", newIds: ["C"] },
          { commits: C("A B C"), refs: { main: "B" }, head: "C", newIds: ["C"] },
          { commits: C("A B"), refs: { main: "B" }, head: "main", newIds: ["B"] },
          { commits: C("A B C"), refs: { main: "B" }, head: "main", newIds: ["C"] }
        ],
        explain: "コミットすると、今のブランチ(main)の先に新しいコミット C ができ、main は C へ進みます。HEAD は main を指したままなので、いっしょに C の位置になります。",
        ref: "git-commit"
      }
    ]
  });
})();


// =====================================================================
// 03 履歴を見る
// =====================================================================
(function () {
  var C = GITD.chain;
  // A-B-C が本流、D が B から分かれ、M で合流
  var merged = { commits: C("A B C").concat([{ id: "D", parent: "B", lane: 1 }, { id: "M", parents: ["C", "D"] }]), refs: { main: "M" }, head: "main" };
  GITD.register("history", {
    commands: [
      {
        id: "git-log", name: "git log", read: "履歴を見る",
        desc: "コミットの履歴を、新しい順に表示します。今のブランチ(HEAD)からたどれるコミットだけが出ます。",
        examples: [
          ["git log", "くわしい履歴"],
          ["git log --oneline", "1コミット1行"],
          ["git log --oneline --graph --all", "全ブランチの分かれ方を線で表示"],
          ["git log -3", "新しい3件だけ"],
          ["git log app.js", "app.js を変えたコミットだけ"],
          ["git log --grep \"ログイン\"", "メッセージに「ログイン」を含むコミット"]
        ],
        options: [
          ["--oneline", "短いハッシュとメッセージを1行で"],
          ["--graph", "分岐とマージを線で描く"],
          ["--all", "今のブランチ以外もすべて"],
          ["-<数>", "新しい順に、その件数だけ(-n <数> と同じ)"],
          ["-p", "それぞれの変更内容(差分)も出す"]
        ]
      },
      {
        id: "git-show", name: "git show", read: "1つのコミットを見る",
        desc: "指定したコミットのメッセージ・作者・変更内容を表示します。何も指定しないと HEAD(最新のコミット)です。ハッシュは先頭の数文字(ほかと区別できる長さ)でも指定できます。",
        examples: [
          ["git show", "最新のコミット"],
          ["git show a1b2c3d", "ハッシュで指定"],
          ["git show HEAD~1:app.js", "1つ前のコミットでの app.js の中身"]
        ]
      },
      {
        id: "head", name: "HEAD", read: "今いる場所",
        desc: "HEAD は「今チェックアウトしている場所」の目印です。ふつうは今のブランチを指し、そのブランチの先頭コミットが作業ツリーの元になります。コミットすると、HEAD が指すブランチが進みます。",
        examples: [["git log --oneline -1", "(HEAD -> main) と出れば、HEAD は main を指している"]],
        options: [
          ["HEAD -> main", "HEAD が main を指している(今のブランチは main)"],
          ["@", "HEAD の別名"]
        ]
      },
      {
        id: "rev-rel", name: "~ と ^", read: "さかのぼる書き方",
        desc: "`~n` は最初の親を n 回さかのぼります。`^n` は n 番目の親です(マージコミットは親が2つ)。`HEAD~` と `HEAD^` はどちらも1つ前、`HEAD~3` は `HEAD^^^` と同じです。",
        examples: [
          ["git show HEAD~2", "2つ前のコミット"],
          ["git show M^2", "マージコミット M の2番目の親(取り込んだ側)"],
          ["git diff HEAD~1 HEAD", "1つ前と最新の差"]
        ],
        options: [
          ["HEAD~ / HEAD~1", "1つ前(最初の親)"],
          ["HEAD~3", "最初の親を3回たどる(HEAD^^^ と同じ)"],
          ["M^1", "M の最初の親(マージしたときにいたブランチ側)"],
          ["M^2", "M の2番目の親(取り込んだブランチ側)"]
        ]
      },
      {
        id: "git-blame", name: "git blame", read: "行ごとの記録",
        desc: "ファイルの各行を、最後に変えたコミット・人・日時といっしょに表示します。",
        examples: [["git blame index.html", "index.html の各行の記録"]]
      }
    ],
    questions: [
      {
        id: "h01", q: "履歴を、1コミット1行の短い形で表示するコマンドは?",
        choices: ["git log --oneline", "git log -1", "git log -p", "git status --oneline"],
        explain: "`--oneline` で「短いハッシュ + メッセージ」の1行表示になります。`-1` は最新の1件だけ、`-p` は差分つきの表示です。",
        ref: "git-log"
      },
      {
        id: "h02", q: "最新の3件のコミットだけを表示するコマンドは?",
        choices: ["git log -3", "git log 3", "git log HEAD~3", "git log --tail 3"],
        accepts: ["git log -n 3", "git log -n3", "git log --max-count=3"],
        explain: "`-3`(`-n 3`)で件数をしぼれます。`git log HEAD~3` は「3つ前のコミットから古いほう」を表示するので、最新の3件は出ません。",
        ref: "git-log"
      },
      {
        id: "h03", q: "この図で `HEAD~2` が指すコミットは?",
        graph: { commits: C("A B C D"), refs: { main: "D" }, head: "main" },
        kind: "code",
        choices: ["B", "C", "A", "D"],
        explain: "HEAD は main の D です。`~2` で親を2回たどるので、D → C → B。`HEAD~1` が C、`HEAD~3` が A です。",
        ref: "rev-rel"
      },
      {
        id: "h04", q: "この図で、マージコミット M の `M^2` が指すのは?",
        graph: merged,
        kind: "code",
        choices: ["D", "C", "B", "A"],
        explain: "`^2` は2番目の親です。M の親は C(最初の親・本流)と D(取り込んだ側)なので `M^2` は D。`M^1` と `M~1` は C です。",
        ref: "rev-rel"
      },
      {
        id: "h05", q: "同じ図で、`M~2` が指すのは?",
        graph: merged,
        kind: "code",
        choices: ["B", "D", "C", "A"],
        explain: "`~` は最初の親だけをたどります。M → C → B なので `M~2` は B です。2番目の親 D へは `~` では進みません。",
        ref: "rev-rel"
      },
      {
        id: "h06", q: "コミット `a1b2c3d` のメッセージと変更内容を表示するコマンドは?",
        choices: ["git show a1b2c3d", "git diff a1b2c3d", "git switch a1b2c3d", "git blame a1b2c3d"],
        explain: "`git show` は1つのコミットのメッセージと差分を表示します。`git diff a1b2c3d` は、そのコミットと今の作業ツリーの差になります。",
        ref: "git-show"
      },
      {
        id: "h07", q: "HEAD の説明として正しいのは?",
        kind: "text",
        choices: ["今いる場所の目印。ふつうは今のブランチを指している", "リポジトリでいちばん新しいコミットの別名", "main ブランチの古い呼び名", "リモートにある最新のコミット"],
        explain: "HEAD は今チェックアウトしているところを指します。ほかのブランチにもっと新しいコミットがあっても、HEAD が指すのは今のブランチの先頭です。",
        ref: "head"
      },
      {
        id: "h08", q: "全ブランチの分岐とマージを、線で描きながら1行ずつ表示します。空欄に入るのは?",
        term: "$ git log --oneline ____ --all",
        kind: "code",
        choices: ["--graph", "--tree", "--branch", "--stat"],
        explain: "`--graph` で左側に分岐・合流の線が描かれます。`--all` をつけると、今のブランチ以外も表示されます。`--stat` は変わったファイルの一覧を出すオプションです。",
        ref: "git-log"
      },
      {
        id: "h09", q: "`index.html` の各行を、最後に変えたコミットと人を表示するコマンドは?",
        choices: ["git blame index.html", "git log index.html", "git diff index.html", "git who index.html"],
        explain: "`git blame` は1行ごとに、最後に変えたコミットのハッシュ・作者・日時を出します。`git log index.html` は、そのファイルを変えたコミットの一覧です。",
        ref: "git-blame"
      },
      {
        id: "h10", q: "1つ前のコミットと最新のコミットの差を見ます。空欄に入るのは?",
        term: "$ git diff ____ HEAD",
        kind: "code",
        choices: ["HEAD~1", "HEAD-1", "HEAD+1", "~HEAD"],
        accepts: ["HEAD~", "HEAD^", "HEAD^1", "@~", "@~1", "@^"],
        explain: "1つ前は `HEAD~1`(`HEAD~`、`HEAD^`)と書きます。`-1` や `+1` の書き方はありません。",
        ref: "rev-rel"
      },
      {
        id: "h11", q: "このログで、まだ push していない(origin/main より先にある)コミットは?",
        term: "$ git log --oneline\n[[9f3c2a1]] (HEAD -> main) 見出しを修正\n[[4b7e0d2]] (origin/main) 画像を追加\n[[1a2b3c4]] 最初のコミット",
        kind: "text",
        choices: ["9f3c2a1(見出しを修正)だけ", "4b7e0d2(画像を追加)だけ", "9f3c2a1 と 4b7e0d2", "3つすべて"],
        explain: "`origin/main` は最後にリモートと通信したときのリモートの main の位置です。それより上(新しい)にあるのは 9f3c2a1 だけなので、これがまだ送っていないコミットです。",
        ref: "git-log"
      },
      {
        id: "h12", q: "`app.js` を変えたコミットだけを、履歴から表示するコマンドは?",
        choices: ["git log app.js", "git show app.js", "git log --file app.js", "git status app.js"],
        accepts: ["git log -- app.js"],
        explain: "`git log <ファイル>` で、そのファイルを変えたコミットにしぼれます。ブランチ名とまぎらわしいときは `git log -- app.js` と書きます。",
        ref: "git-log"
      },
      {
        id: "h13", q: "この図で `git log --oneline` を実行すると、表示されないコミットは?",
        graph: { commits: C("A B C").concat(C("D E", "B", 1)), refs: { main: "C", feat: "E" }, head: "main" },
        kind: "code",
        choices: ["D", "A", "B", "C"],
        explain: "`git log` は HEAD(main の C)から親をたどれるコミットだけを出します。C → B → A なので、feat 側の D と E は出ません。出すには `--all` か `git log feat` を使います。",
        ref: "git-log"
      },
      {
        id: "h14", q: "`HEAD~3` と `HEAD^^^` の関係は?",
        kind: "text",
        choices: ["どちらも最初の親を3回たどった、同じコミット", "HEAD~3 は3つ前、HEAD^^^ は3番目の親", "HEAD~3 は3つ前、HEAD^^^ は3つ後", "HEAD^^^ は書き方として正しくない"],
        explain: "`^` を1つ書くと最初の親へ1つ進むので、`^^^` は3回たどることになり、`~3` と同じです。`^3`(数字つき)なら「3番目の親」という別の意味になります。",
        ref: "rev-rel"
      },
      {
        id: "h15", q: "コミットのハッシュ(`9f3c2a1…` のような ID)について正しいのは?",
        kind: "text",
        choices: ["中身と親などから計算した値。ほかと区別できれば先頭の数文字で指定できる", "1, 2, 3 … と順に振られる連番", "コミットした日時を英数字にしたもの", "push するたびに新しく振り直される"],
        explain: "ハッシュは内容・親・作者・日時などから計算されます。同じ変更でも親が変わればハッシュも変わる、というのが rebase や amend で「別のコミットになる」理由です。",
        ref: "git-show"
      },
      {
        id: "h16", q: "メッセージに「ログイン」を含むコミットだけを探します。空欄に入るのは?",
        term: "$ git log ____ \"ログイン\"",
        kind: "code",
        choices: ["--grep", "--search", "--find", "--message"],
        explain: "`--grep` はコミットメッセージを検索します。ファイルの中身を検索するなら `git grep` という別のコマンドです。",
        ref: "git-log"
      }
    ]
  });
})();


// =====================================================================
// 04 ブランチ
// =====================================================================
(function () {
  var C = GITD.chain;
  var ab = C("A B");
  GITD.register("branch", {
    commands: [
      {
        id: "git-branch", name: "git branch", read: "ブランチの一覧・作成・削除",
        desc: "ブランチは、あるコミットを指す名札です。`git branch 名前` は今の位置に新しい名札をつけるだけで、切り替えはしません。名前をつけずに実行すると一覧が出て、今のブランチに `*` がつきます。",
        examples: [
          ["git branch", "ローカルブランチの一覧"],
          ["git branch -a", "リモート追跡ブランチも含めた一覧"],
          ["git branch feat", "今の位置に feat を作る(切り替えない)"],
          ["git branch -d feat", "マージ済みの feat を削除"],
          ["git branch -m main", "今のブランチの名前を main に変える"]
        ],
        options: [
          ["-d", "削除。マージされていないと断られる"],
          ["-D", "強制的に削除(マージされていないコミットはたどれなくなる)"],
          ["-m", "名前を変える"],
          ["-r", "リモート追跡ブランチだけ表示"],
          ["-a", "ローカルとリモート追跡ブランチをすべて表示"]
        ],
        figures: [{
          before: { commits: ab, refs: { main: "B" }, head: "main" },
          cmd: "git branch feat",
          after: { commits: ab, refs: { main: "B", feat: "B" }, head: "main" }
        }]
      },
      {
        id: "git-switch", name: "git switch", read: "ブランチを切り替える",
        desc: "HEAD を別のブランチへ移し、作業ツリーをそのブランチの中身にします。`-c` で新しく作って切り替えます(Git 2.23 から。古い書き方は `git checkout`)。",
        examples: [
          ["git switch dev", "dev へ切り替え"],
          ["git switch -c feat", "feat を作って切り替え"],
          ["git switch -", "直前にいたブランチへ戻る"],
          ["git switch --detach HEAD~1", "ブランチを離れて、1つ前のコミットを取り出す"]
        ],
        options: [
          ["-c <名前>", "新しく作って切り替える(--create)"],
          ["-", "直前のブランチ"],
          ["--detach", "ブランチではなくコミットを直接取り出す(detached HEAD)"]
        ],
        figures: [
          {
            before: { commits: ab, refs: { main: "B" }, head: "main" },
            cmd: "git switch -c feat",
            after: { commits: ab, refs: { main: "B", feat: "B" }, head: "feat" }
          },
          {
            before: { commits: C("A B C"), refs: { main: "C", feat: "B" }, head: "main" },
            cmd: "git switch feat",
            after: { commits: C("A B C"), refs: { main: "C", feat: "B" }, head: "feat" }
          }
        ]
      },
      {
        id: "git-checkout", name: "git checkout", read: "古い書き方",
        desc: "ブランチの切り替えとファイルの復元の両方をこなす、昔からのコマンドです。今は切り替えを `git switch`、ファイルを戻すのを `git restore` に分けて使うのがおすすめですが、古い解説ではよく出てきます。",
        examples: [
          ["git checkout dev", "git switch dev と同じ"],
          ["git checkout -b feat", "git switch -c feat と同じ"],
          ["git checkout -- index.html", "git restore index.html と同じ"]
        ]
      },
      {
        id: "detached", name: "detached HEAD", read: "ブランチを離れた状態",
        desc: "HEAD がブランチではなく、コミットを直接指している状態です。過去のコミットを見るときに使います。このままコミットすると、どのブランチにも属さないコミットになり、ほかへ切り替えるとたどりにくくなります。残したいなら `git switch -c 名前` でブランチを作ります。",
        examples: [
          ["git switch --detach a1b2c3d", "a1b2c3d を直接取り出す"],
          ["git switch -c exp", "今の位置に exp を作って、そこで作業を続ける"],
          ["git switch main", "main へ戻る"]
        ],
        figures: [{
          before: { commits: C("A B C"), refs: { main: "C" }, head: "main" },
          cmd: "git switch --detach HEAD~1",
          after: { commits: C("A B C"), refs: { main: "C" }, head: "B" }
        }]
      }
    ],
    questions: [
      {
        id: "b01", q: "今の位置に新しいブランチ `feat` を作ります。切り替えはしません。コマンドは?",
        choices: ["git branch feat", "git switch -c feat", "git checkout feat", "git branch -d feat"],
        explain: "`git branch feat` は名札をつけるだけで、今のブランチはそのままです。作ってすぐ切り替えるなら `git switch -c feat` です。",
        ref: "git-branch"
      },
      {
        id: "b02", q: "新しいブランチ `feat` を作って、そこへ切り替えるコマンドは?",
        choices: ["git switch -c feat", "git branch feat", "git switch feat", "git merge feat"],
        accepts: ["git switch --create feat", "git checkout -b feat"],
        explain: "`git switch -c`(create)で作って切り替えます。古い書き方では `git checkout -b feat` です。`git branch feat` は作るだけで切り替えません。",
        ref: "git-switch"
      },
      {
        id: "b03", q: "すでにある `dev` ブランチへ切り替えるコマンドは?",
        choices: ["git switch dev", "git branch dev", "git switch -c dev", "git merge dev"],
        accepts: ["git checkout dev"],
        explain: "既存のブランチへは `git switch dev`(古い書き方は `git checkout dev`)。`-c` をつけると「新しく作る」になるので、同じ名前があるとエラーです。",
        ref: "git-switch"
      },
      {
        id: "b04", q: "この状態で `git branch feat` を実行したあとの図は?",
        graph: { title: "実行前", commits: ab, refs: { main: "B" }, head: "main" },
        kind: "graph",
        choices: [
          { commits: ab, refs: { main: "B", feat: "B" }, head: "main" },
          { commits: ab, refs: { main: "B", feat: "B" }, head: "feat" },
          { commits: C("A B C"), refs: { main: "B", feat: "C" }, head: "main", newIds: ["C"] },
          { commits: ab, refs: { main: "B", feat: "A" }, head: "main" }
        ],
        explain: "`git branch feat` は、今いる B に feat という名札をつけるだけです。コミットは増えず、HEAD も main のままです。HEAD が feat に移るのは `git switch -c feat` のときです。",
        ref: "git-branch"
      },
      {
        id: "b05", q: "この状態で `git switch -c feat` を実行したあとの図は?",
        graph: { title: "実行前", commits: ab, refs: { main: "B" }, head: "main" },
        kind: "graph",
        choices: [
          { commits: ab, refs: { main: "B", feat: "B" }, head: "feat" },
          { commits: ab, refs: { main: "B", feat: "B" }, head: "main" },
          { commits: C("A B C"), refs: { main: "B", feat: "C" }, head: "feat", newIds: ["C"] },
          { commits: ab, refs: { feat: "B" }, head: "feat" }
        ],
        explain: "B に feat ができ、HEAD が feat を指します。新しいコミットはまだできません。main も消えずに B に残ります。",
        ref: "git-switch"
      },
      {
        id: "b06", q: "この図で、今いるブランチは?",
        graph: { commits: C("A B C"), refs: { main: "C", feat: "B" }, head: "feat" },
        kind: "code",
        choices: ["feat", "main", "C", "A"],
        explain: "HEAD の札が乗っているのは feat です。main のほうが先に進んでいても、今のブランチは HEAD が指している feat です。",
        ref: "head"
      },
      {
        id: "b07", q: "この状態で変更をコミットしたあとの図は?",
        graph: { title: "実行前", commits: ab, refs: { main: "B", feat: "B" }, head: "feat" },
        kind: "graph",
        choices: [
          { commits: C("A B C"), refs: { main: "B", feat: "C" }, head: "feat", newIds: ["C"] },
          { commits: C("A B C"), refs: { main: "C", feat: "C" }, head: "feat", newIds: ["C"] },
          { commits: C("A B C"), refs: { main: "C", feat: "B" }, head: "feat", newIds: ["C"] },
          { commits: C("A B C"), refs: { main: "B", feat: "C" }, head: "main", newIds: ["C"] }
        ],
        explain: "コミットで進むのは、HEAD が指しているブランチ(feat)だけです。main は B に残ります。こうしてブランチごとに別々の作業を進められます。",
        ref: "git-commit"
      },
      {
        id: "b08", q: "作業が済んでマージした `feat` ブランチを削除するコマンドは?",
        choices: ["git branch -d feat", "git branch -m feat", "git rm feat", "git switch -d feat"],
        explain: "`git branch -d` で削除します。消えるのは名札だけで、マージ済みのコミットは main からたどれるので残ります。`-m` は名前の変更です。",
        ref: "git-branch"
      },
      {
        id: "b09", q: "`git branch -d` と `git branch -D` の違いは?",
        kind: "text",
        choices: ["-d はマージされていないと削除を断る。-D は強制的に削除する", "-d はローカルを、-D はリモートのブランチを削除する", "-d は名札だけ、-D はコミットも即座に消す", "違いはなく、どちらも同じ"],
        explain: "`-d` は、まだどこにも取り込まれていないコミットがあると「not fully merged」と断ります。`-D` は確認なしで消します(コミットはしばらく reflog から戻せます)。リモートのブランチを消すのは `git push origin --delete 名前` です。",
        ref: "git-branch"
      },
      {
        id: "b10", q: "今のブランチの名前を `main` に変えるコマンドは?",
        choices: ["git branch -m main", "git branch -r main", "git switch -c main", "git rename main"],
        accepts: ["git branch --move main"],
        explain: "`git branch -m 新しい名前` で今のブランチの名前を変えます。`-r` はリモート追跡ブランチの一覧、`switch -c` は新しいブランチを作る操作です。",
        ref: "git-branch"
      },
      {
        id: "b11", q: "新しいブランチ `fix` を作って切り替えます(git switch を使う)。空欄に入るのは?",
        term: "$ git switch ____ fix",
        kind: "code",
        choices: ["-c", "-b", "-n", "-d"],
        accepts: ["--create"],
        explain: "`git switch` で作るときは `-c`(create)です。`-b` は `git checkout -b` のほうの書き方で、switch では使えません。",
        ref: "git-switch"
      },
      {
        id: "b12", q: "古い書き方で、新しいブランチ `fix` を作って切り替えます。空欄に入るのは?",
        term: "$ git checkout ____ fix",
        kind: "code",
        choices: ["-b", "-c", "-n", "-m"],
        explain: "`git checkout -b fix` は `git switch -c fix` と同じです。checkout の `-b` と switch の `-c` を取り違えないようにします。",
        ref: "git-checkout"
      },
      {
        id: "b13", q: "この図のような状態を何という?",
        graph: { commits: C("A B C"), refs: { main: "C" }, head: "B" },
        kind: "text",
        choices: ["detached HEAD(HEAD がブランチを離れ、コミットを直接指している)", "コンフリクト(競合)が起きている状態", "main が B まで巻き戻された状態", "B に名前のないブランチが作られた状態"],
        explain: "HEAD が main ではなく B を直接指しています。過去を見るにはよいのですが、ここでコミットするならブランチを作っておきます。main は C のままです。",
        ref: "detached"
      },
      {
        id: "b14", q: "detached HEAD のまま D をコミットしました。D を残すため、今の位置に `exp` を作って切り替えるコマンドは?",
        graph: { commits: C("A B C").concat([{ id: "D", parent: "B", lane: 1 }]), refs: { main: "C" }, head: "D", newIds: ["D"] },
        choices: ["git switch -c exp", "git switch exp", "git branch -d exp", "git switch main"],
        accepts: ["git switch --create exp", "git checkout -b exp"],
        explain: "`git switch -c exp` で D に exp の名札がつき、HEAD も exp を指します。名札をつけずに `git switch main` すると、D はどのブランチからもたどれなくなります。",
        ref: "detached"
      },
      {
        id: "b15", q: "ローカルブランチの一覧を表示し、今のブランチを `*` で確かめるコマンドは?",
        choices: ["git branch", "git branch -r", "git switch", "git log --branches -1"],
        accepts: ["git branch --list", "git branch -l"],
        explain: "`git branch` だけでローカルブランチの一覧が出ます。`-r` はリモート追跡ブランチ(origin/main など)だけを出します。",
        ref: "git-branch"
      },
      {
        id: "b16", q: "この状態で `git switch feat` を実行したあとの図は?",
        graph: { title: "実行前", commits: C("A B C"), refs: { main: "C", feat: "B" }, head: "main" },
        kind: "graph",
        choices: [
          { commits: C("A B C"), refs: { main: "C", feat: "B" }, head: "feat" },
          { commits: C("A B C"), refs: { main: "C", feat: "C" }, head: "feat" },
          { commits: C("A B C"), refs: { main: "C", feat: "B" }, head: "B" },
          { commits: C("A B C"), refs: { main: "B", feat: "B" }, head: "feat" }
        ],
        explain: "切り替えで動くのは HEAD だけです。HEAD が feat(B)を指し、作業ツリーは B の中身になります。main も feat も動きません。",
        ref: "git-switch"
      },
      {
        id: "b17", q: "直前にいたブランチへ戻るコマンドは?",
        choices: ["git switch -", "git switch ..", "git switch HEAD~", "git switch --back"],
        accepts: ["git checkout -"],
        explain: "`git switch -` で、ひとつ前にいたブランチへ戻ります(`cd -` と同じ考え方)。`git switch HEAD~` は、HEAD~ がブランチではないのでエラーになります(コミットへ移るには `git switch --detach HEAD~` と --detach が要ります)。",
        ref: "git-switch"
      },
      {
        id: "b18", q: "リモート追跡ブランチ(origin/main など)も含めて、すべてのブランチを表示します。空欄に入るのは?",
        term: "$ git branch ____",
        kind: "code",
        choices: ["-a", "-r", "-v", "-d"],
        accepts: ["--all"],
        explain: "`-a`(`--all`)でローカルとリモート追跡ブランチがすべて出ます。`-r` はリモート追跡ブランチだけ、`-v` は各ブランチの最新コミットもいっしょに表示します。",
        ref: "git-branch"
      }
    ]
  });
})();


// =====================================================================
// 05 マージとコンフリクト
// =====================================================================
(function () {
  var C = GITD.chain;
  // fast-forward できる形: main は B、feat は B から C-D と進んでいる
  var ffCommits = C("A B").concat(C("C D", "B", 1));
  // 分かれている形: main は C、feat は B から D-E
  var divCommits = C("A B C").concat(C("D E", "B", 1));
  var mergedCommits = divCommits.concat([{ id: "M", parents: ["C", "E"] }]);
  var ffBefore = { title: "実行前", commits: ffCommits, refs: { main: "B", feat: "D" }, head: "main" };
  var divBefore = { title: "実行前", commits: divCommits, refs: { main: "C", feat: "E" }, head: "main" };
  GITD.register("merge", {
    commands: [
      {
        id: "git-merge", name: "git merge", read: "取り込む",
        desc: "指定したブランチの変更を、今のブランチ(HEAD)に取り込みます。両方が分かれて進んでいるときは、2つを親に持つマージコミットができます(3-way マージ)。取り込まれた側のブランチは動きません。",
        examples: [
          ["git switch main", "取り込む側(main)へ移る"],
          ["git merge feat", "feat を main に取り込む"],
          ["git merge --abort", "コンフリクトしたマージを中止して、マージ前に戻す"]
        ],
        options: [
          ["--no-ff", "fast-forward できるときも、マージコミットを作る"],
          ["--ff-only", "fast-forward できないときは何もせず失敗にする"],
          ["--squash", "変更をまとめてステージするだけ(マージコミットは作らない)"],
          ["--abort", "途中のマージを中止する"]
        ],
        figures: [{
          before: divBefore,
          cmd: "git merge feat",
          after: { commits: mergedCommits, refs: { main: "M", feat: "E" }, head: "main", newIds: ["M"] }
        }]
      },
      {
        id: "fast-forward", name: "fast-forward", read: "早送りのマージ",
        desc: "今のブランチが、取り込むブランチの途中(祖先)にあり、自分の側に新しいコミットがないときは、ブランチの名札を先へ進めるだけで済みます。これが fast-forward で、マージコミットはできません。",
        examples: [
          ["git merge feat", "Fast-forward と表示されたら、名札が進んだだけ"],
          ["git merge --ff-only feat", "fast-forward できるときだけマージする"]
        ],
        figures: [{
          before: ffBefore,
          cmd: "git merge feat",
          after: { commits: ffCommits, refs: { main: "D", feat: "D" }, head: "main" }
        }]
      },
      {
        id: "merge-no-ff", name: "git merge --no-ff", read: "必ずマージコミットを作る",
        desc: "fast-forward できる形でも、あえてマージコミットを作ります。「ここで feat を取り込んだ」というまとまりが履歴に残ります。",
        examples: [["git merge --no-ff feat", "マージコミットを作って取り込む"]],
        figures: [{
          before: ffBefore,
          cmd: "git merge --no-ff feat",
          after: { commits: ffCommits.concat([{ id: "M", parents: ["B", "D"] }]), refs: { main: "M", feat: "D" }, head: "main", newIds: ["M"] }
        }]
      },
      {
        id: "conflict", name: "コンフリクト", read: "競合の直し方",
        desc: "両方のブランチで同じファイルの同じあたりを別々に変えると、Git はどちらを残すか決められず、マージが止まります。ファイルには印(マーカー)が入るので、正しい内容に書き直して印を消し、`git add` してから `git commit` で終えます(`git merge --continue` でも同じ)。",
        examples: [
          ["git status", "both modified と出るのが競合しているファイル"],
          ["git add index.html", "直し終えたら add で「解決済み」にする"],
          ["git commit", "マージコミットを作って終える"],
          ["git merge --abort", "やめてマージ前に戻す"]
        ],
        options: [
          ["<<<<<<< HEAD", "ここから ======= までが今のブランチ側"],
          ["=======", "区切り"],
          [">>>>>>> feat", "======= からここまでが取り込むブランチ側"]
        ]
      }
    ],
    questions: [
      {
        id: "m01", q: "この状態で `git merge feat` を実行したあとの図は?",
        graph: ffBefore,
        kind: "graph",
        choices: [
          { commits: ffCommits, refs: { main: "D", feat: "D" }, head: "main" },
          { commits: ffCommits.concat([{ id: "M", parents: ["B", "D"] }]), refs: { main: "M", feat: "D" }, head: "main", newIds: ["M"] },
          { commits: ffCommits, refs: { main: "B", feat: "B" }, head: "main" },
          { commits: ffCommits, refs: { main: "D", feat: "D" }, head: "feat" }
        ],
        explain: "main(B)は feat の途中にあり、main 側に新しいコミットがないので fast-forward になります。main の名札が D へ進むだけで、マージコミットはできません。HEAD は main のままです。",
        ref: "fast-forward"
      },
      {
        id: "m02", q: "この状態で `git merge feat` を実行したあとの図は?",
        graph: divBefore,
        kind: "graph",
        choices: [
          { commits: mergedCommits, refs: { main: "M", feat: "E" }, head: "main", newIds: ["M"] },
          { commits: divCommits, refs: { main: "E", feat: "E" }, head: "main" },
          { commits: mergedCommits, refs: { main: "M", feat: "M" }, head: "main", newIds: ["M"] },
          { commits: mergedCommits, refs: { main: "C", feat: "M" }, head: "feat", newIds: ["M"] }
        ],
        explain: "main と feat は B から分かれて両方進んでいるので、C と E を親に持つマージコミット M ができ、main が M へ進みます(3-way マージ)。取り込まれた feat は E のまま動きません。",
        ref: "git-merge"
      },
      {
        id: "m03", q: "`git merge` が fast-forward になるのは、どんなとき?",
        kind: "text",
        choices: ["取り込むブランチが先へ進んでいて、今のブランチにはそちらにない新しいコミットがないとき", "取り込むブランチが今のブランチより古いとき", "両方のブランチで同じファイルを変えていないとき", "取り込むブランチのコミットが1つだけのとき"],
        explain: "今のブランチの先頭が、取り込むブランチの祖先(途中)なら、名札を進めるだけで済みます。取り込むブランチが今と同じ位置なら、何もすることがなく「Already up to date.」になります。今のブランチ側にも新しいコミットがあると分かれているので、マージコミットが要ります。",
        ref: "fast-forward"
      },
      {
        id: "m04", q: "この図のマージコミット M の親はいくつ?",
        graph: { commits: mergedCommits, refs: { main: "M", feat: "E" }, head: "main", newIds: ["M"] },
        kind: "text",
        choices: ["2つ(C と E)", "1つ(C だけ)", "1つ(E だけ)", "3つ(B と C と E)"],
        explain: "マージコミットは、合流した2つのコミット(C と E)を親に持ちます。最初の親 `M^1` が C(マージしたときにいた main 側)、2番目の親 `M^2` が E です。",
        ref: "git-merge"
      },
      {
        id: "m05", q: "マージしたら、ファイルがこうなりました。今のブランチ(main)側の内容は?",
        term: "$ cat title.txt\n<<<<<<< HEAD\nタイトル: Git入門\n=======\nタイトル: はじめてのGit\n>>>>>>> feat",
        kind: "text",
        choices: ["「タイトル: Git入門」(======= より上)", "「タイトル: はじめてのGit」(======= より下)", "2行の両方", "どちらでもない(マーカーの行だけ)"],
        explain: "`<<<<<<< HEAD` から `=======` までが今のブランチ(HEAD)側、`=======` から `>>>>>>> feat` までが取り込んだ feat 側です。どちらを残すか(両方を合わせるか)決めて書き直し、マーカーの行を消します。",
        ref: "conflict"
      },
      {
        id: "m06", q: "コンフリクトしたマージをやめて、マージする前の状態に戻すコマンドは?",
        choices: ["git merge --abort", "git merge --cancel", "git merge --undo", "git revert --merge"],
        explain: "`git merge --abort` でマージを中止し、始める前の状態に戻ります。",
        ref: "conflict"
      },
      {
        id: "m07", q: "コンフリクトしたファイルを書き直し終えました。マージを終える手順は?",
        kind: "text",
        choices: ["git add で解決済みにしてから、git commit する", "ファイルを保存すれば、自動でマージが終わる", "git push すると解決済みになる", "もう一度 git merge feat を実行する"],
        explain: "書き直したファイルを `git add` すると「解決済み」になり、`git commit`(または `git merge --continue`)でマージコミットができて終わります。",
        ref: "conflict"
      },
      {
        id: "m08", q: "fast-forward できる形でも、マージコミットを作って取り込みます。空欄に入るのは?",
        term: "$ git merge ____ feat",
        kind: "code",
        choices: ["--no-ff", "--ff-only", "--squash", "--abort"],
        explain: "`--no-ff`(no fast-forward)で、必ずマージコミットを作ります。`--ff-only` は反対に、fast-forward できないときは失敗にするオプションです。",
        ref: "merge-no-ff"
      },
      {
        id: "m09", q: "fast-forward できるときだけマージし、できなければ何もせず止めます。空欄に入るのは?",
        term: "$ git merge ____ origin/main",
        kind: "code",
        choices: ["--ff-only", "--no-ff", "--squash", "--no-commit"],
        explain: "`--ff-only` は、名札を進めるだけで済むときだけマージします。意図しないマージコミットを作りたくないときに使います。",
        ref: "fast-forward"
      },
      {
        id: "m10", q: "この状態で `git merge --no-ff feat` を実行したあとの図は?",
        graph: ffBefore,
        kind: "graph",
        choices: [
          { commits: ffCommits.concat([{ id: "M", parents: ["B", "D"] }]), refs: { main: "M", feat: "D" }, head: "main", newIds: ["M"] },
          { commits: ffCommits, refs: { main: "D", feat: "D" }, head: "main" },
          { commits: ffCommits.concat([{ id: "M", parents: ["B", "D"] }]), refs: { main: "M", feat: "M" }, head: "main", newIds: ["M"] },
          { commits: ffCommits.concat([{ id: "M", parents: ["D"] }]), refs: { main: "B", feat: "M" }, head: "feat", newIds: ["M"] }
        ],
        explain: "`--no-ff` なので、fast-forward できる形でも B と D を親に持つマージコミット M ができます。main は M へ進み、feat は D のままです。",
        ref: "merge-no-ff"
      },
      {
        id: "m11", q: "main にいるときの `git merge feat` は、何をする?",
        kind: "text",
        choices: ["feat の変更を、今いる main に取り込む", "main の変更を、feat に取り込む", "main と feat の両方を、新しいブランチにまとめる", "feat を main に置き換えて、feat を削除する"],
        explain: "merge は「指定したブランチを、今のブランチに取り込む」操作です。動くのは今のブランチ(main)だけで、feat は動かず、消えもしません。",
        ref: "git-merge"
      },
      {
        id: "m12", q: "feat を main に取り込みます。まず main に切り替えました。次に実行するコマンドは?",
        term: "$ git switch main\nSwitched to branch 'main'",
        choices: ["git merge feat", "git merge main", "git rebase feat", "git pull feat"],
        explain: "取り込む側(main)にいて、取り込むブランチ(feat)を指定します。`git merge main` は main に main を取り込むことになり、何も起きません。",
        ref: "git-merge"
      },
      {
        id: "m13", q: "マージでコンフリクトが起きるのは、どんなとき?",
        kind: "text",
        choices: ["両方のブランチで、同じファイルの同じあたりを別々に変えたとき", "両方のブランチで、別々のファイルを変えたとき", "片方のブランチで、新しいファイルを足したとき", "取り込むブランチのコミットが多すぎるとき"],
        explain: "別のファイルや、同じファイルでも離れた場所の変更なら、Git が自動でまとめます。同じ行のあたりを両方で変えると、どちらを残すか人が決める必要があります。",
        ref: "conflict"
      },
      {
        id: "m14", q: "マージがコンフリクトで止まりました。どのファイルが競合しているか確かめるコマンドは?",
        choices: ["git status", "git log --conflict", "git merge --list", "git diff --staged"],
        explain: "`git status` の Unmerged paths に、`both modified:` として競合しているファイルが出ます。",
        ref: "conflict"
      },
      {
        id: "m15", q: "この状態で `git branch -d feat` を実行すると?",
        graph: { commits: mergedCommits, refs: { main: "M", feat: "E" }, head: "main" },
        kind: "text",
        choices: ["feat の名札だけが消える。D と E は M からたどれるので残る", "D と E のコミットもいっしょに消える", "マージされていないので削除を断られる", "M も消えて、main は C に戻る"],
        explain: "feat の E は M の親として main に取り込まれているので、`-d` で削除できます。消えるのは名札だけで、コミットは main の履歴に残ります。",
        ref: "git-branch"
      },
      {
        id: "m16", q: "コンフリクトを直して `git add` しました。マージを続けて終えます。空欄に入るのは?",
        term: "$ git add title.txt\n$ git merge ____",
        kind: "code",
        choices: ["--continue", "--abort", "--skip", "--quit"],
        explain: "`git merge --continue` はマージコミットを作って終えます(`git commit` と同じ)。`--abort` はやめてマージ前に戻ります。",
        ref: "conflict"
      }
    ]
  });
})();


// =====================================================================
// 06 リモート
// =====================================================================
(function () {
  var C = GITD.chain;
  var ab = C("A B");
  var abc = C("A B C");
  var fetchBefore = { title: "実行前", commits: ab, refs: { main: "B", "origin/main": "B" }, head: "main" };
  // ローカルの C と、リモートの D が B から分かれている
  var divCommits = abc.concat([{ id: "D", parent: "B", lane: 1 }]);
  var divGraph = { title: "実行前", commits: divCommits, refs: { main: "C", "origin/main": "D" }, head: "main" };
  GITD.register("remote", {
    commands: [
      {
        id: "git-remote", name: "git remote", read: "リモートの登録",
        desc: "リモート(GitHub などにあるリポジトリ)に名前をつけて登録・確認します。clone したときは、複製元が `origin` という名前で登録されています。",
        examples: [
          ["git remote -v", "登録しているリモートを URL つきで表示"],
          ["git remote add origin https://github.com/taro/app.git", "origin という名前で登録"],
          ["git remote remove old", "登録を消す"]
        ]
      },
      {
        id: "tracking", name: "origin/main", read: "リモート追跡ブランチ",
        desc: "`origin/main` は、最後に fetch・pull・push したときの「リモートの main の位置」を手元で覚えている名札です。自分で動かすことはなく、通信したときに更新されます。ローカルの main が `origin/main` を「上流(upstream)」として覚えていると、`git status` で ahead(先に進んでいる)/ behind(遅れている)が出ます。",
        examples: [
          ["git branch -r", "リモート追跡ブランチの一覧"],
          ["git status", "Your branch is ahead of 'origin/main' by 1 commit. など"],
          ["git log main..origin/main", "リモートにだけあるコミット"]
        ],
        options: [
          ["ahead 1", "ローカルが1コミット先(push していない)"],
          ["behind 1", "リモートが1コミット先(まだ取り込んでいない)"],
          ["have diverged", "両方に別々のコミットがある(分岐している)"]
        ]
      },
      {
        id: "git-fetch", name: "git fetch", read: "取ってくるだけ",
        desc: "リモートの新しいコミットを取ってきて、`origin/main` などを更新します。ローカルのブランチと作業ツリーは変わらないので、中身を見てから取り込むかを決められます。",
        examples: [
          ["git fetch", "origin から取ってくる"],
          ["git fetch --prune", "リモートで消えたブランチの追跡ブランチも消す"],
          ["git log main..origin/main", "fetch で入ってきたコミットを確かめる"]
        ],
        figures: [{
          before: fetchBefore,
          cmd: "git fetch",
          after: { commits: abc, refs: { main: "B", "origin/main": "C" }, head: "main", newIds: ["C"] }
        }]
      },
      {
        id: "git-pull", name: "git pull", read: "取ってきて取り込む",
        desc: "`git fetch` のあと、上流のブランチを今のブランチに取り込みます。手元が分かれていなければ fast-forward で進むだけです。両方に別々のコミットがある(分かれている)ときは、取り込み方の指定(`--rebase` / `--no-rebase`、または `pull.rebase` の設定)がないと、Git 2.33.1 からは「fatal: Need to specify how to reconcile divergent branches」で止まります。`--no-rebase` ならマージコミットを作り、`--rebase` なら自分のコミットを付け直します。",
        examples: [
          ["git pull", "fetch して取り込む(分かれていなければ fast-forward)"],
          ["git pull --rebase", "自分のコミットを、取ってきたコミットの先に付け直す"],
          ["git pull --no-rebase", "マージで取り込む"],
          ["git config --global pull.rebase false", "pull の既定をマージにする(true なら rebase)"]
        ],
        figures: [{
          before: fetchBefore,
          cmd: "git pull",
          after: { commits: abc, refs: { main: "C", "origin/main": "C" }, head: "main", newIds: ["C"] }
        }]
      },
      {
        id: "git-push", name: "git push", read: "送る",
        desc: "ローカルのコミットをリモートへ送り、リモートのブランチを進めます。リモートに自分の持っていないコミットがあると断られる(rejected)ので、先に pull します。",
        examples: [
          ["git push -u origin main", "初めて送るとき。上流(origin/main)も設定する"],
          ["git push", "上流が設定済みなら、これだけで送れる"],
          ["git push origin --delete feat", "リモートの feat ブランチを消す"],
          ["git push --force-with-lease", "書き換えた履歴を送る(他人の新しいコミットがあれば止まる)"]
        ],
        options: [
          ["-u", "上流を設定する(--set-upstream)"],
          ["--delete", "リモートのブランチを消す(-d)"],
          ["-f", "強制的に上書き。他の人のコミットを消すおそれがある"]
        ],
        figures: [{
          before: { commits: abc, refs: { main: "C", "origin/main": "B" }, head: "main" },
          cmd: "git push",
          after: { commits: abc, refs: { main: "C", "origin/main": "C" }, head: "main" }
        }]
      }
    ],
    questions: [
      {
        id: "r01", q: "登録しているリモートを、URL つきで表示するコマンドは?",
        choices: ["git remote -v", "git remote", "git branch -r", "git config --remote"],
        accepts: ["git remote --verbose"],
        explain: "`git remote` だけだと名前(origin など)しか出ません。`-v` で取ってくる先(fetch)と送る先(push)の URL が出ます。",
        ref: "git-remote"
      },
      {
        id: "r02", q: "`git init` で作ったリポジトリに、GitHub のリポジトリを origin という名前で登録するコマンドは?",
        choices: ["git remote add origin https://github.com/taro/app.git", "git remote origin https://github.com/taro/app.git", "git clone origin https://github.com/taro/app.git", "git push origin https://github.com/taro/app.git"],
        acceptPatterns: ["^git remote add origin \\S+$"],
        explain: "`git remote add <名前> <URL>` で登録します。入力モードでは URL は何でも正解です。",
        ref: "git-remote"
      },
      {
        id: "r03", q: "リモートの main に新しいコミット C があります。`git fetch` したあとの図は?",
        graph: fetchBefore,
        kind: "graph",
        choices: [
          { commits: abc, refs: { main: "B", "origin/main": "C" }, head: "main", newIds: ["C"] },
          { commits: abc, refs: { main: "C", "origin/main": "C" }, head: "main", newIds: ["C"] },
          { commits: abc, refs: { main: "B", "origin/main": "B" }, head: "main", newIds: ["C"] },
          { commits: abc, refs: { main: "C", "origin/main": "B" }, head: "main", newIds: ["C"] }
        ],
        explain: "fetch はコミット C を取ってきて、`origin/main` を C へ進めるだけです。ローカルの main は B のまま。main まで進めるのが pull(fetch + 取り込み)です。",
        ref: "git-fetch"
      },
      {
        id: "r04", q: "同じ状態(リモートの main に新しい C がある)で `git pull` したあとの図は?",
        graph: fetchBefore,
        kind: "graph",
        choices: [
          { commits: abc, refs: { main: "C", "origin/main": "C" }, head: "main", newIds: ["C"] },
          { commits: abc, refs: { main: "B", "origin/main": "C" }, head: "main", newIds: ["C"] },
          { commits: abc.concat([{ id: "M", parents: ["B", "C"], lane: 1 }]), refs: { main: "M", "origin/main": "C" }, head: "main", newIds: ["C", "M"] },
          { commits: abc, refs: { main: "C", "origin/main": "B" }, head: "main", newIds: ["C"] }
        ],
        explain: "pull は fetch(origin/main を C へ)のあと、main に取り込みます。main 側に新しいコミットがないので fast-forward になり、main も C へ進みます。マージコミットはできません。",
        ref: "git-pull"
      },
      {
        id: "r05", q: "`git fetch` と `git pull` の違いは?",
        kind: "text",
        choices: ["fetch は取ってきて origin/main などを更新するだけ。pull はそのあと今のブランチに取り込む", "fetch はリモートへ送り、pull はリモートから受け取る", "fetch は1つのブランチだけ、pull は全ブランチを取ってくる", "fetch は作業ツリーまで書き換え、pull は履歴だけを取ってくる"],
        explain: "`git pull` ≒ `git fetch` + `git merge`(または rebase)です。先に fetch して `git log main..origin/main` で中身を確かめてから取り込むと安全です。",
        ref: "git-pull"
      },
      {
        id: "r06", q: "ローカルの main を初めて origin へ送ります。あわせて上流も設定し、次から `git push` だけで送れるようにするコマンドは?",
        choices: ["git push -u origin main", "git push origin", "git push -f origin main", "git pull -u origin main"],
        accepts: ["git push --set-upstream origin main"],
        explain: "`-u`(`--set-upstream`)で、ローカルの main の上流を origin/main に設定します。`-f` は強制上書きで、ふだんは使いません。",
        ref: "git-push"
      },
      {
        id: "r07", q: "この状態で `git push` が成功したあと、origin/main が指すのは?",
        graph: { commits: abc, refs: { main: "C", "origin/main": "B" }, head: "main" },
        kind: "text",
        choices: ["C を指す", "B のまま", "A に戻る", "消える"],
        explain: "push でリモートの main が C へ進み、それに合わせて手元の `origin/main` も C に更新されます。",
        ref: "git-push"
      },
      {
        id: "r08", q: "push したら断られました。まず実行するとよいコマンドは?",
        term: "$ git push\n ! [rejected]        main -> main (fetch first)\nerror: failed to push some refs to 'https://github.com/taro/app.git'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally.",
        choices: ["git pull", "git push -f", "git commit --amend", "git remote remove origin"],
        explain: "リモートに、手元にないコミットがあるので断られました。`git pull` で取り込んでから push し直します。手元にも、リモートにはない自分のコミットがある(分岐している)ときは、素の `git pull` は「fatal: Need to specify how to reconcile divergent branches」で止まるので、`git pull --rebase` か `git pull --no-rebase` で取り込み方を指定します(または `pull.rebase` を設定しておきます)。`git push -f` で上書きすると、他の人のコミットを消してしまいます。",
        ref: "git-push"
      },
      {
        id: "r09", q: "この図の状態で `git status` を見ると、main は origin/main と比べてどうなっている?",
        graph: { commits: divCommits, refs: { main: "C", "origin/main": "D" }, head: "main" },
        kind: "text",
        choices: ["分岐している(diverged)。ローカルとリモートに1つずつ別のコミットがある", "1コミット先に進んでいる(ahead 1)だけ", "1コミット遅れている(behind 1)だけ", "同じ(up to date)"],
        explain: "B から、ローカルは C、リモートは D と別々に進んでいます。`have diverged, and have 1 and 1 different commits each` と出ます。push の前に取り込む必要がありますが、分岐しているときの素の `git pull` は「fatal: Need to specify how to reconcile divergent branches」で止まるので、`git pull --rebase` か `git pull --no-rebase` で取り込み方を指定します(または `pull.rebase` を設定しておきます)。",
        ref: "tracking"
      },
      {
        id: "r10", q: "この状態で `git pull --no-rebase`(マージで取り込む)を実行し、成功したあとの図は?",
        graph: divGraph,
        kind: "graph",
        choices: [
          { commits: divCommits.concat([{ id: "M", parents: ["C", "D"] }]), refs: { main: "M", "origin/main": "D" }, head: "main", newIds: ["M"] },
          { commits: divCommits, refs: { main: "D", "origin/main": "D" }, head: "main" },
          { commits: divCommits.concat([{ id: "M", parents: ["C", "D"] }]), refs: { main: "M", "origin/main": "M" }, head: "main", newIds: ["M"] },
          { commits: divCommits.concat([{ id: "M", parents: ["C", "D"] }]), refs: { main: "C", "origin/main": "D" }, head: "main", newIds: ["M"] }
        ],
        explain: "fetch で origin/main は D。そのあと main に D をマージするので、C と D を親に持つ M ができ、main が M へ進みます。M はまだ push していないので、origin/main は D のままです。",
        ref: "git-pull"
      },
      {
        id: "r11", q: "同じ状態で `git pull --rebase` を実行し、成功したあとの図は?",
        graph: divGraph,
        kind: "graph",
        choices: [
          { commits: C("A B D C'").concat([{ id: "C", parent: "B", lane: 1 }]), refs: { main: "C'", "origin/main": "D" }, head: "main", newIds: ["C'"], dimIds: ["C"] },
          { commits: divCommits.concat([{ id: "M", parents: ["C", "D"] }]), refs: { main: "M", "origin/main": "D" }, head: "main", newIds: ["M"] },
          { commits: C("A B D C'").concat([{ id: "C", parent: "B", lane: 1 }]), refs: { main: "C'", "origin/main": "C'" }, head: "main", newIds: ["C'"], dimIds: ["C"] },
          { commits: C("A B C D'").concat([{ id: "D", parent: "B", lane: 1 }]), refs: { main: "D'", "origin/main": "D" }, head: "main", newIds: ["D'"], dimIds: ["D"] }
        ],
        explain: "rebase で取り込むと、自分のコミット C が、取ってきた D の先に付け直されます。付け直したものは親が違うので別のコミット C' になり、元の C はたどれなくなります。履歴は1本になり、マージコミットはできません。",
        ref: "git-rebase"
      },
      {
        id: "r12", q: "リモート(origin)にある feat ブランチを削除します。空欄に入るのは?",
        term: "$ git push origin ____ feat",
        kind: "code",
        choices: ["--delete", "--remove", "--rm", "--drop"],
        accepts: ["-d"],
        explain: "`git push origin --delete feat`(`-d`)でリモートのブランチを消します。ローカルの feat は `git branch -d feat` で別に消します。",
        ref: "git-push"
      },
      {
        id: "r13", q: "リモートで消されたブランチの追跡ブランチ(origin/feat など)も、手元から消しながら fetch します。空欄に入るのは?",
        term: "$ git fetch ____",
        kind: "code",
        choices: ["--prune", "--all", "--delete", "--clean"],
        accepts: ["-p"],
        explain: "`--prune`(`-p`)で、リモートにもうないブランチの追跡ブランチを片づけます。`--all` は登録しているすべてのリモートから取ってくるオプションです。",
        ref: "git-fetch"
      },
      {
        id: "r14", q: "`origin/main` の説明として正しいのは?",
        kind: "text",
        choices: ["最後に fetch・pull・push したときの、リモートの main の位置を手元で覚えている名札", "リモートの今の main を、いつも直接見ている名札", "origin という人が作ったブランチ", "main ブランチの、ひとつ前の名前"],
        explain: "origin/main は通信したときにだけ更新されます。だれかが新しく push しても、fetch するまで手元の origin/main は古いままです。",
        ref: "tracking"
      },
      {
        id: "r15", q: "リモートの新しいコミットを取ってくるだけで、ローカルのブランチと作業ツリーは変えないコマンドは?",
        choices: ["git fetch", "git pull", "git clone", "git merge origin/main"],
        explain: "`git fetch` は origin/main などを更新するだけです。`git pull` や `git merge origin/main` は、今のブランチまで動かします。",
        ref: "git-fetch"
      }
    ]
  });
})();


// =====================================================================
// 07 取り消し
// =====================================================================
(function () {
  var C = GITD.chain;
  var abc = C("A B C");
  var before = { title: "実行前", commits: abc, refs: { main: "C" }, head: "main" };
  var afterReset = { commits: abc, refs: { main: "B" }, head: "main", dimIds: ["C"] };
  var afterRevert = { commits: C("A B C R"), refs: { main: "R" }, head: "main", newIds: ["R"] };
  // reset の3つのモード(u04〜u06 で共通の選択肢)
  var RESET_SOFT = "main は B に戻り、C の変更はステージに残る";
  var RESET_MIXED = "main は B に戻り、C の変更はステージからはずれて作業ツリーに残る";
  var RESET_HARD = "main は B に戻り、C の変更は作業ツリーからも消える";
  var REVERT_LIKE = "C を打ち消す新しいコミットができ、main はそこへ進む";
  GITD.register("undo", {
    commands: [
      {
        id: "git-restore", name: "git restore", read: "ファイルを戻す",
        desc: "ファイルの中身を戻します。何もつけないと、作業ツリーの変更を捨ててステージ(最後に add した)の状態に戻します。`--staged` をつけると、ステージを取り消して(変更は作業ツリーに残したまま)最新コミットの状態に戻します(Git 2.23 から)。",
        examples: [
          ["git restore index.html", "まだ add していない変更を捨てる(元に戻せない)"],
          ["git restore --staged index.html", "add を取り消す。変更は残る"],
          ["git restore --source=HEAD~1 index.html", "1つ前のコミットの中身にする"]
        ],
        options: [
          ["--staged", "ステージを戻す(-S)"],
          ["--source=<コミット>", "どのコミットの中身に戻すか"]
        ]
      },
      {
        id: "git-reset", name: "git reset", read: "ブランチを戻す",
        desc: "今のブランチ(と HEAD)を、指定したコミットへ戻します。戻したあとのコミットはたどれなくなります。モードによって、ステージと作業ツリーをどこまで戻すかが変わります。履歴を書き換えるので、push 済みのコミットには使いません。",
        examples: [
          ["git reset --soft HEAD~1", "直前のコミットだけやめる。変更はステージに残る"],
          ["git reset HEAD~1", "(--mixed)変更はステージからはずれ、作業ツリーに残る"],
          ["git reset --hard HEAD~1", "変更ごと捨てて、1つ前の状態にする"],
          ["git reset index.html", "ファイルを指定すると、ステージの取り消しになる"]
        ],
        options: [
          ["--soft", "ブランチだけ戻す。ステージと作業ツリーはそのまま"],
          ["--mixed", "ブランチとステージを戻す。作業ツリーは残す(既定)"],
          ["--hard", "ブランチ・ステージ・作業ツリーをすべて戻す。変更は消える"]
        ],
        figures: [{ before: before, cmd: "git reset --hard HEAD~1", after: afterReset }]
      },
      {
        id: "git-revert", name: "git revert", read: "打ち消すコミットを足す",
        desc: "指定したコミットの変更を打ち消す、新しいコミットを作ります。履歴は書き換えないので、push 済みのコミットを取り消すときはこちらを使います。",
        examples: [
          ["git revert HEAD", "直前のコミットを打ち消す"],
          ["git revert a1b2c3d", "指定したコミットを打ち消す"]
        ],
        figures: [{ before: before, cmd: "git revert HEAD", after: afterRevert }]
      },
      {
        id: "git-stash", name: "git stash", read: "一時的に退避する",
        desc: "コミットしていない変更を退避して、作業ツリーを最新コミットの状態にします。急ぎで別のブランチに移りたいときに使い、あとで戻します。",
        examples: [
          ["git stash", "変更を退避(git stash push と同じ)"],
          ["git stash list", "退避した一覧"],
          ["git stash pop", "いちばん新しい退避を戻し、一覧から消す"],
          ["git stash apply", "戻すが、一覧には残す"],
          ["git stash -u", "追跡していないファイルも退避"]
        ]
      },
      {
        id: "git-reflog", name: "git reflog", read: "HEAD の足あと",
        desc: "HEAD やブランチがどこを指してきたかの記録です。reset や rebase で見えなくなったコミットも、しばらくはここからハッシュを見つけて戻せます(手元のリポジトリだけの記録)。",
        examples: [
          ["git reflog", "HEAD の動きの一覧(HEAD@{1} などで指定できる)"],
          ["git reset --hard HEAD@{1}", "1つ前に HEAD がいた位置へ戻す"]
        ]
      }
    ],
    questions: [
      {
        id: "u01", q: "まだ add していない `index.html` の変更を捨てて、元に戻すコマンドは?",
        choices: ["git restore index.html", "git restore --staged index.html", "git rm index.html", "git revert index.html"],
        accepts: ["git checkout -- index.html", "git checkout index.html"],
        explain: "`git restore` は作業ツリーの変更を捨てます(元に戻せないので注意)。古い書き方は `git checkout -- index.html` です。`--staged` はステージの取り消しのほうです。",
        ref: "git-restore"
      },
      {
        id: "u02", q: "`git add` した `index.html` のステージだけを取り消します。変更そのものは残します。コマンドは?",
        choices: ["git restore --staged index.html", "git restore index.html", "git rm --cached index.html", "git reset --hard index.html"],
        accepts: ["git restore -S index.html", "git reset index.html", "git reset HEAD index.html", "git reset -- index.html", "git reset HEAD -- index.html"],
        explain: "`git restore --staged` でステージから下ろします(`git reset index.html` でも同じ)。`git rm --cached` は追跡そのものをやめる操作なので、次のコミットでファイルが消えてしまいます。",
        ref: "git-restore"
      },
      {
        id: "u03", q: "この状態で `git reset --hard HEAD~1` を実行したあとの図は?",
        graph: before,
        kind: "graph",
        choices: [
          afterReset,
          afterRevert,
          { commits: abc, refs: { main: "C" }, head: "B" },
          { commits: abc, refs: { main: "A" }, head: "main", dimIds: ["B", "C"] }
        ],
        explain: "reset は main を B へ戻します。C はどのブランチからもたどれなくなり(点線)、--hard なので C の変更は作業ツリーからも消えます。打ち消すコミットを足すのは revert、HEAD だけが B へ移るのは `git switch --detach HEAD~1` です。",
        ref: "git-reset"
      },
      {
        id: "u04", q: "コミット A-B-C の main(HEAD は C)で `git reset --soft HEAD~1` を実行すると?",
        kind: "text",
        choices: [RESET_SOFT, RESET_MIXED, RESET_HARD, REVERT_LIKE],
        explain: "`--soft` はブランチを動かすだけで、ステージと作業ツリーはそのままです。C の変更はステージに残るので、すぐに `git commit` し直せます。コミットのやり直しに向きます。",
        ref: "git-reset"
      },
      {
        id: "u05", q: "同じ状態で、モードをつけずに `git reset HEAD~1` を実行すると?",
        kind: "text",
        choices: [RESET_MIXED, RESET_SOFT, RESET_HARD, REVERT_LIKE],
        explain: "モードを省くと `--mixed` です。ブランチとステージを B に戻し、C の変更は作業ツリーに「まだ add していない変更」として残ります。",
        ref: "git-reset"
      },
      {
        id: "u06", q: "同じ状態で `git reset --hard HEAD~1` を実行すると?",
        kind: "text",
        choices: [RESET_HARD, RESET_SOFT, RESET_MIXED, REVERT_LIKE],
        explain: "`--hard` はステージも作業ツリーも B の状態にするので、C の変更もコミットしていない変更も消えます。C 自体は、しばらく `git reflog` から見つけて戻せます。",
        ref: "git-reset"
      },
      {
        id: "u07", q: "この状態で `git revert HEAD` を実行したあとの図は?",
        graph: before,
        kind: "graph",
        choices: [
          afterRevert,
          afterReset,
          { commits: C("A B").concat([{ id: "C", parent: "B", lane: 1 }, { id: "R", parent: "B" }]), refs: { main: "R" }, head: "main", newIds: ["R"], dimIds: ["C"] },
          { commits: C("A B C R"), refs: { main: "C" }, head: "main", newIds: ["R"] }
        ],
        explain: "revert は C を打ち消す新しいコミット R を、C の後ろに足します。C は履歴に残り、main は R へ進みます。履歴を書き換えないので、push 済みでも安全です。",
        ref: "git-revert"
      },
      {
        id: "u08", q: "すでに push して、ほかの人も取り込んだコミットを取り消したい。向いているのは?",
        kind: "text",
        choices: ["git revert で、打ち消すコミットを足して push する", "git reset --hard で消してから、git push -f する", "git commit --amend で、そのコミットを作り直す", "git restore で、そのコミットを戻す"],
        explain: "reset や amend は履歴を書き換えるので、ほかの人の履歴と食い違ってしまいます。revert は打ち消すコミットを足すだけなので、ふつうに push・pull できます。",
        ref: "git-revert"
      },
      {
        id: "u09", q: "作業途中の変更を、コミットせずに一時的に退避するコマンドは?",
        choices: ["git stash", "git stash pop", "git restore .", "git reset --soft"],
        accepts: ["git stash push"],
        explain: "`git stash` で変更を退避し、作業ツリーを最新コミットの状態にします。`git restore .` は変更を捨ててしまうので、あとで戻せません。",
        ref: "git-stash"
      },
      {
        id: "u10", q: "退避した変更を作業ツリーに戻し、退避の一覧からも消すコマンドは?",
        choices: ["git stash pop", "git stash apply", "git stash list", "git stash drop"],
        explain: "`pop` は戻して一覧から消します。`apply` は戻すだけで一覧に残ります。`drop` は戻さずに消します。",
        ref: "git-stash"
      },
      {
        id: "u11", q: "`git reset --hard` で見えなくなったコミットのハッシュを探すコマンドは?",
        choices: ["git reflog", "git log --all", "git stash list", "git status"],
        explain: "`git reflog` には HEAD が指してきたコミットが残っています。見つけたら `git reset --hard <ハッシュ>` や `git switch -c 名前 <ハッシュ>` で戻せます。`git log --all` は、ブランチからたどれないコミットを出しません。",
        ref: "git-reflog"
      },
      {
        id: "u12", q: "直前のコミットだけをやめて、その変更はステージに残します。空欄に入るのは?",
        term: "$ git reset ____ HEAD~1",
        kind: "code",
        choices: ["--soft", "--mixed", "--hard", "--keep"],
        explain: "ステージに残すのは `--soft` です。`--mixed`(既定)は作業ツリーに残し、`--hard` は変更ごと消します。",
        ref: "git-reset"
      },
      {
        id: "u13", q: "`app.js` のステージを取り消します(変更は残す)。空欄に入るのは?",
        term: "$ git restore ____ app.js",
        kind: "code",
        choices: ["--staged", "--cached", "--soft", "--hard"],
        accepts: ["-S"],
        explain: "`git restore --staged` です。`--cached` は `git rm` や `git diff` で使うオプションで、restore にはありません。",
        ref: "git-restore"
      },
      {
        id: "u14", q: "直前のコミットを打ち消すコミットを作ります。空欄に入るのは?",
        term: "$ git revert ____",
        kind: "code",
        choices: ["HEAD", "HEAD~1", "--last", "main~"],
        accepts: ["@"],
        explain: "直前のコミットは HEAD です。`HEAD~1` を指定すると、そのひとつ前のコミットを打ち消してしまいます。",
        ref: "git-revert"
      },
      {
        id: "u15", q: "reset したあとのこの図で、点線の C はどうなっている?",
        graph: afterReset,
        kind: "text",
        choices: ["どのブランチからもたどれない。しばらくは reflog から戻せる", "すぐに完全に消えて、二度と戻せない", "まだ main の履歴に含まれている", "リモートのリポジトリへ移された"],
        explain: "名札のなくなったコミットは `git log` に出なくなりますが、すぐには消えません。reflog に記録が残っている間(既定でおよそ30日以上)は、ハッシュを指定して戻せます。",
        ref: "git-reflog"
      },
      {
        id: "u16", q: "reflog を見て、reset する前の位置に戻します。空欄に入るのは?",
        term: "$ git reflog\n[[3f2a1b0]] HEAD@{0}: reset: moving to HEAD~1\n[[9c8d7e6]] HEAD@{1}: commit: 見出しを追加\n$ git reset --hard ____",
        kind: "code",
        choices: ["9c8d7e6", "3f2a1b0", "HEAD@{0}", "HEAD~1"],
        accepts: ["HEAD@{1}"],
        explain: "reset する前に HEAD がいたのは `HEAD@{1}`、つまり 9c8d7e6 です。`HEAD@{0}` は今の位置(3f2a1b0)です。",
        ref: "git-reflog"
      }
    ]
  });
})();


// =====================================================================
// 08 rebaseと履歴の整理
// =====================================================================
(function () {
  var C = GITD.chain;
  var divCommits = C("A B C").concat(C("D E", "B", 1));
  var rebaseBefore = { title: "実行前", commits: divCommits, refs: { main: "C", feat: "E" }, head: "feat" };
  var rebaseAfterCommits = C("A B C D' E'").concat(C("D E", "B", 1));
  var rebaseAfter = { commits: rebaseAfterCommits, refs: { main: "C", feat: "E'" }, head: "feat", newIds: ["D'", "E'"], dimIds: ["D", "E"] };
  var pickBefore = { title: "実行前", commits: divCommits, refs: { main: "C", feat: "E" }, head: "main" };
  var pickAfter = { commits: C("A B C E'").concat(C("D E", "B", 1)), refs: { main: "E'", feat: "E" }, head: "main", newIds: ["E'"] };
  var abc = C("A B C");
  GITD.register("rewrite", {
    commands: [
      {
        id: "git-rebase", name: "git rebase", read: "付け直す",
        desc: "今のブランチのコミットを、指定したブランチの先に付け直します。付け直したコミットは中身が同じでも親が違うので、ハッシュの違う別のコミット(D'、E')になり、元のコミットはたどれなくなります。履歴が1本になって読みやすくなりますが、push 済みのコミットには使いません。",
        examples: [
          ["git switch feat", "付け直したいブランチへ移る"],
          ["git rebase main", "feat のコミットを main の先へ付け直す"],
          ["git rebase --continue", "コンフリクトを直して add したあと、続ける"],
          ["git rebase --abort", "やめて、rebase の前に戻す"]
        ],
        options: [
          ["--continue", "競合を直したあと続ける"],
          ["--skip", "そのコミットを飛ばして続ける"],
          ["--abort", "中止して元に戻す"]
        ],
        figures: [{ before: rebaseBefore, cmd: "git rebase main", after: rebaseAfter }]
      },
      {
        id: "rebase-i", name: "git rebase -i", read: "コミットをまとめる・直す",
        desc: "対話的 rebase です。指定したところから先のコミットの一覧(todo)がエディターで開き、行の先頭の命令を書きかえて、まとめる・消す・メッセージを直す・並べかえる、ができます。",
        examples: [
          ["git rebase -i HEAD~3", "直近3つのコミットを整理する"]
        ],
        options: [
          ["pick", "そのまま使う"],
          ["reword", "メッセージだけ直す"],
          ["squash", "ひとつ前のコミットにまとめる(メッセージも合わせる)"],
          ["fixup", "ひとつ前のコミットにまとめる(このメッセージは捨てる)"],
          ["drop", "コミットを消す"],
          ["edit", "そこで止めて、中身を直せるようにする"]
        ]
      },
      {
        id: "git-cherry-pick", name: "git cherry-pick", read: "1つだけ取り込む",
        desc: "ほかのブランチにあるコミットを1つ選んで、その変更を今のブランチに新しいコミットとして写します。写したコミットは親が違うので、別のコミット(E')になります。元のコミットとブランチは変わりません。",
        examples: [
          ["git cherry-pick a1b2c3d", "a1b2c3d の変更を今のブランチへ"],
          ["git cherry-pick --abort", "コンフリクトしたときに中止"]
        ],
        figures: [{ before: pickBefore, cmd: "git cherry-pick E", after: pickAfter }]
      },
      {
        id: "git-tag", name: "git tag", read: "目印をつける",
        desc: "コミットに v1.0 などの名前をつけます。ブランチと違い、コミットしても動きません。メッセージつきの注釈付きタグ(`-a`)は、作った人と日時も残ります。タグは `git push` だけでは送られないので、別に送ります。",
        examples: [
          ["git tag v1.0", "今のコミットに軽量タグ"],
          ["git tag -a v1.0 -m \"最初の公開版\"", "注釈付きタグ"],
          ["git tag v0.9 HEAD~1", "1つ前のコミットにタグ"],
          ["git tag", "タグの一覧"],
          ["git push origin v1.0", "タグを送る(全部なら --tags)"]
        ],
        figures: [{
          before: { commits: abc, refs: { main: "C" }, head: "main" },
          cmd: "git tag v1.0",
          after: { commits: abc, refs: { main: "C" }, tags: { "v1.0": "C" }, head: "main" }
        }]
      },
      {
        id: "gitignore", name: ".gitignore", read: "無視するファイル",
        desc: "Git に追跡させないファイルの名前やパターンを書くファイルです。まだ追跡していないファイルにだけ効きます。すでに追跡しているファイルは、`git rm --cached` で追跡をやめてから書きます。",
        examples: [
          ["cat .gitignore", "中身を見る"],
          ["git check-ignore -v debug.log", "どの行で無視されているか調べる"]
        ],
        options: [
          ["*.log", "拡張子が .log のファイルすべて"],
          ["node_modules/", "node_modules という名前のフォルダー"],
          ["/build", "いちばん上の build だけ"],
          ["!keep.log", "先頭の ! は「無視しない」(例外)"],
          ["# …", "コメント"]
        ]
      }
    ],
    questions: [
      {
        id: "w01", q: "feat にいる状態で `git rebase main` を実行したあとの図は?",
        graph: rebaseBefore,
        kind: "graph",
        choices: [
          rebaseAfter,
          { commits: divCommits.concat([{ id: "M", parents: ["E", "C"], lane: 1 }]), refs: { main: "C", feat: "M" }, head: "feat", newIds: ["M"] },
          { commits: C("A B C D E"), refs: { main: "C", feat: "E" }, head: "feat" },
          { commits: rebaseAfterCommits, refs: { main: "E'", feat: "E'" }, head: "feat", newIds: ["D'", "E'"], dimIds: ["D", "E"] }
        ],
        explain: "feat の D と E が、main の C の先に付け直されます。付け直したコミットは親が違うので、別のコミット D'、E' になり、元の D、E はたどれなくなります。main は動きません(このあと main で `git merge feat` すると fast-forward になります)。",
        ref: "git-rebase"
      },
      {
        id: "w02", q: "rebase で付け直したコミット D' と、元のコミット D の関係は?",
        kind: "text",
        choices: ["変更の中身は同じだが、親が違うのでハッシュも違う別のコミット", "同じコミットが移動しただけで、ハッシュも同じ", "D' は D の変更を打ち消すコミット", "D' は D と元の親をまとめたマージコミット"],
        explain: "コミットのハッシュは親も含めて計算されるので、親が変われば別のコミットになります。だから push 済みのコミットを rebase すると、ほかの人の持っている D と食い違います。",
        ref: "git-rebase"
      },
      {
        id: "w03", q: "main にいる状態で `git cherry-pick E` を実行したあとの図は?",
        graph: pickBefore,
        kind: "graph",
        choices: [
          pickAfter,
          { commits: divCommits, refs: { main: "E", feat: "E" }, head: "main" },
          { commits: C("A B C").concat(C("D E", "B", 1)).concat([{ id: "M", parents: ["C", "E"] }]), refs: { main: "M", feat: "E" }, head: "main", newIds: ["M"] },
          { commits: C("A B C E'").concat(C("D E", "B", 1)), refs: { main: "C", feat: "E'" }, head: "main", newIds: ["E'"], dimIds: ["E"] }
        ],
        explain: "cherry-pick は E の変更だけを、main の C の先に新しいコミット E' として写します。D は取り込まれません。feat と元の E はそのまま残ります。",
        ref: "git-cherry-pick"
      },
      {
        id: "w04", q: "今のコミットに `v1.0` というタグをつけるコマンドは?",
        choices: ["git tag v1.0", "git branch v1.0", "git tag -d v1.0", "git commit --tag v1.0"],
        accepts: ["git tag v1.0 HEAD"],
        explain: "`git tag v1.0` で今のコミットに軽量タグがつきます。`git branch v1.0` だと、コミットのたびに進むブランチになってしまいます。`-d` は削除です。",
        ref: "git-tag"
      },
      {
        id: "w05", q: "タグ `v1.0` だけを GitHub(origin)に送るコマンドは?",
        choices: ["git push origin v1.0", "git push origin main", "git fetch origin v1.0", "git tag --push v1.0"],
        explain: "タグは、ブランチを push しても自動では送られません。`git push origin v1.0` で送ります(全部まとめてなら `git push origin --tags`)。",
        ref: "git-tag"
      },
      {
        id: "w06", q: "この状態で `git tag v1.0 HEAD~1` を実行したあとの図は?",
        graph: { title: "実行前", commits: abc, refs: { main: "C" }, head: "main" },
        kind: "graph",
        choices: [
          { commits: abc, refs: { main: "C" }, tags: { "v1.0": "B" }, head: "main" },
          { commits: abc, refs: { main: "C" }, tags: { "v1.0": "C" }, head: "main" },
          { commits: abc, refs: { main: "C", "v1.0": "B" }, head: "main" },
          { commits: abc, refs: { main: "C" }, tags: { "v1.0": "B" }, head: "B" }
        ],
        explain: "タグ v1.0(黄色)が、1つ前のコミット B につきます。HEAD と main は動きません。タグはブランチ(青)と違い、コミットしても進みません。",
        ref: "git-tag"
      },
      {
        id: "w07", q: "`.gitignore` について正しいのは?",
        kind: "text",
        choices: ["まだ追跡していないファイルを、git status や git add の対象から外す", "書いたファイルを、リポジトリからも作業ツリーからも削除する", "すでにコミットしてあるファイルの追跡も、自動でやめる", "書いたファイルを、ほかの人に見えない形で暗号化する"],
        explain: "`.gitignore` は追跡していないファイルにだけ効きます。すでに追跡中のファイルを外すには、`git rm --cached` で追跡をやめてからコミットします。",
        ref: "gitignore"
      },
      {
        id: "w08", q: "`.gitignore` で、node_modules フォルダーを丸ごと無視します。空欄に入る行は?",
        term: "$ cat .gitignore\n*.log\n____",
        kind: "code",
        choices: ["node_modules/", "!node_modules/", "#node_modules/", "-node_modules/"],
        accepts: ["node_modules", "/node_modules/", "/node_modules"],
        explain: "`node_modules/` と書くと、その名前のフォルダーが無視されます。先頭の `!` は「無視しない」、`#` はコメントの意味になります。",
        ref: "gitignore"
      },
      {
        id: "w09", q: "`.gitignore` に `*.log` と書くと?",
        kind: "text",
        choices: ["名前が .log で終わるファイルをすべて無視する", "log という名前のフォルダーだけを無視する", ".log で終わるファイル以外をすべて無視する", "いちばん上のフォルダーにある *.log という名前のファイルだけを無視する"],
        explain: "`*` は何文字でもよい、という意味です。どのフォルダーにある `debug.log` や `error.log` も無視されます。",
        ref: "gitignore"
      },
      {
        id: "w10", q: "直近3つのコミットを、まとめたりメッセージを直したりするために、対話的 rebase を始めるコマンドは?",
        choices: ["git rebase -i HEAD~3", "git rebase HEAD~3", "git reset -i HEAD~3", "git merge -i HEAD~3"],
        accepts: ["git rebase --interactive HEAD~3"],
        explain: "`-i`(interactive)で todo の一覧が開きます。`HEAD~3` は「ここより後ろのコミットを整理する」という起点で、HEAD~2・HEAD~1・HEAD の3つが対象になります。",
        ref: "rebase-i"
      },
      {
        id: "w11", q: "対話的 rebase の todo です。2行目のコミットを、メッセージも残してひとつ前のコミットにまとめます。空欄に入る命令は?",
        term: "pick [[1a2b3c4]] ログイン画面を追加\n____ [[5d6e7f8]] ログイン画面の誤字を直す",
        kind: "code",
        choices: ["squash", "drop", "reword", "edit"],
        accepts: ["s"],
        explain: "`squash`(`s`)はひとつ前のコミットにまとめ、2つのメッセージを合わせて編集できます。メッセージを捨ててまとめるなら `fixup` です。`drop` は消す、`reword` はメッセージだけ直す命令です。",
        ref: "rebase-i"
      },
      {
        id: "w12", q: "rebase(や commit --amend)を使うときに守りたいことは?",
        kind: "text",
        choices: ["すでに push して、ほかの人が使っているコミットは書き換えない", "rebase の前に、かならず git stash pop する", "main ブランチの上でだけ rebase する", "rebase したら、元のコミットを git branch -D で消す"],
        explain: "書き換えたコミットは別のコミットになるので、ほかの人の手元の履歴と食い違います。自分だけのブランチの、まだ共有していないコミットで使います。",
        ref: "git-rebase"
      },
      {
        id: "w13", q: "rebase の途中でコンフリクトしたので、直して `git add` しました。rebase を続けます。空欄に入るのは?",
        term: "$ git add login.js\n$ git rebase ____",
        kind: "code",
        choices: ["--continue", "--abort", "--skip", "--next"],
        explain: "`--continue` で残りのコミットの付け直しを続けます。`--abort` は rebase をやめて元に戻し、`--skip` はそのコミットを飛ばします。",
        ref: "git-rebase"
      },
      {
        id: "w14", q: "別のブランチにあるコミット `a1b2c3d` の変更だけを、今のブランチに取り込むコマンドは?",
        choices: ["git cherry-pick a1b2c3d", "git merge a1b2c3d", "git rebase a1b2c3d", "git switch a1b2c3d"],
        explain: "`git cherry-pick` は1つのコミットの変更だけを写します。`git merge a1b2c3d` だと、そのコミットまでの履歴がすべて取り込まれます。",
        ref: "git-cherry-pick"
      }
    ]
  });
})();

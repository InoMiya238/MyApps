// Linux道場: 8単元の定義・問題・コマンド帳の中身。道場(index.html)とコマンド帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → data.js
// 内容は Ubuntu / Debian 系 + bash を前提とする。
//
// ■ 単元の中身の登録(このファイルの後半)
//   LNX.register("単元ID", { commands: [カード, …], questions: [問題, …] });
//
// ■ コマンド帳のカード
//   {
//     id: "ls",                       // reference.html の id="cmd-ls" になる。問題の ref からも使う
//     name: "ls",                     // カードの見出し(等幅)
//     read: "list",                   // 読み・由来(.tag)
//     desc: "意味の説明",              // `…` で囲んだところは <code> になる
//     examples: [["ls -la", "説明"], …],   // 「よく使う例」。$ コマンド  # 説明 の形で出る
//     options: [["-l", "説明"], …]          // 省略可。「オプション」
//   }
//
// ■ 問題
//   {
//     id: "p01",                      // 単元の中で重ならない名前
//     q: "問題文",                     // `…` で囲んだところは <code> になる
//     term: "場面表示",                 // 省略可。"\n" で行を分ける。"$ " で始まる行はコマンド行
//     kind: "cmd",                    // 選択肢の種類。"cmd" = コマンド($ つき) / "code" = パスやキー(等幅) / "text" = 説明文
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。並びはページが毎回まぜる
//     accepts: ["別解", …],            // 入力モードで正解にする別の書き方(先頭の選択肢は書かなくてよい)
//     noInput: true,                  // 省略可。kind が "cmd" でも入力モードで出さない
//     explain: "解説",                 // `…` で囲んだところは <code> になる
//     ref: "ls"                       // コマンド帳のカードの id
//   }
//   入力モードで出すのは、kind が "cmd" で noInput がない問題だけ。
//
// ■ 入力の判定(normalize)
//   前後の空白を削り、連続する空白を1つにまとめる。| の前後の空白、> と < の後ろの空白、
//   > と < の前の空白(直前が数字か & のときは残す。2> と 2 > 、&> と & > は意味が違うため)を取る。
//   $ ` \ を含まない '…' は "…" と同じに扱い、空白や * ? [ $ などを含まない "…" は引用符を外す。
//   オプションの並べ替えはしない(ls -la と ls -al などは accepts に並べる)。
var LNX = (function () {
  "use strict";

  var STATS_KEY = "linuxBasicsStats";
  var SETTINGS_KEY = "linuxBasicsSettings";
  var COUNT = 10;
  var MODES = ["choice", "input"];

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "paths", no: "01", name: "ディレクトリ構成とパス", short: "パス", cmds: "pwd · cd · ~ · .. · /etc" },
    { id: "file-ops", no: "02", name: "ファイル操作", short: "ファイル操作", cmds: "ls · cp · mv · rm · mkdir" },
    { id: "viewing", no: "03", name: "ファイルの閲覧", short: "閲覧", cmds: "cat · less · head · tail · wc" },
    { id: "search", no: "04", name: "検索", short: "検索", cmds: "grep · find" },
    { id: "permissions", no: "05", name: "権限", short: "権限", cmds: "ls -l · chmod · chown" },
    { id: "pipes", no: "06", name: "パイプとリダイレクト", short: "パイプ", cmds: "| · > · >> · 2>&1 · sort · uniq" },
    { id: "processes", no: "07", name: "プロセス", short: "プロセス", cmds: "ps · top · kill · jobs · fg" },
    { id: "packages", no: "08", name: "パッケージ・その他", short: "パッケージ他", cmds: "apt · sudo · man · echo $PATH" }
  ];

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("LNX.register: 登録できません: " + id);
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
    s = s.replace(/[　\t\r\n]/g, " ");       // 全角空白・タブも空白として扱う
    s = s.replace(/ +/g, " ").trim();
    s = s.replace(/ ?\| ?/g, "|");
    s = s.replace(/([<>]) /g, "$1");
    s = s.replace(/([^\d& ]) ([<>])/g, "$1$2");
    s = s.replace(/'([^'$`\\]*)'/g, "\"$1\"");
    s = s.replace(/"([A-Za-z0-9_.,\/:=+@%\-]*)"/g, "$1");
    return s;
  }
  function kindOf(q) { return q.kind === "code" || q.kind === "text" ? q.kind : "cmd"; }
  function isInputable(q) { return kindOf(q) === "cmd" && !q.noInput; }
  function answersOf(q) {
    var list = [q.choices[0]].concat(Array.isArray(q.accepts) ? q.accepts : []);
    return list.map(normalize);
  }
  function isMatch(q, typed) {
    var t = normalize(typed);
    if (!t) return false;
    return answersOf(q).indexOf(t) >= 0;
  }

  // 問題の形を確かめる。問題点の一覧を返す(なければ空の配列)。検証スクリプトもこれを使う
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (typeof q.q !== "string" || !q.q) errs.push("q がない");
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c.trim()) { errs.push("choices[" + i + "] が空"); return; }
        var k = normalize(c);
        if (seen[k]) errs.push("choices に同じものがある: " + c);
        seen[k] = true;
      });
      if (isInputable(q)) {
        // 誤答が正解の書き方に入っていたら判定がおかしい
        var ans = answersOf(q);
        q.choices.slice(1).forEach(function (c) {
          if (ans.indexOf(normalize(c)) >= 0) errs.push("誤答が正解の書き方と同じ: " + c);
        });
      }
    }
    if (q.accepts !== undefined && !Array.isArray(q.accepts)) errs.push("accepts が配列ではない");
    if (typeof q.explain !== "string" || !q.explain) errs.push("explain がない");
    if (q.ref && !card(q.ref)) errs.push("ref のカードがない: " + q.ref);
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
      term: q.term || "",
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
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, MODES: MODES, UNITS: UNITS,
    unit: unit, register: register, contentOf: contentOf, card: card,
    normalize: normalize, isMatch: isMatch, isInputable: isInputable, kindOf: kindOf,
    checkQuestion: checkQuestion, isReady: isReady, poolOf: poolOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();


// =====================================================================
// 01 ディレクトリ構成とパス
// =====================================================================
LNX.register("paths", {
  commands: [
    {
      id: "pwd", name: "pwd", read: "print working directory",
      desc: "今いるディレクトリ(カレントディレクトリ)を、`/` から始まる絶対パスで表示します。",
      examples: [["pwd", "例: /home/taro と表示される"]]
    },
    {
      id: "cd", name: "cd", read: "change directory",
      desc: "作業するディレクトリを移動します。行き先を省くとホームディレクトリへ戻ります。",
      examples: [
        ["cd /var/log", "絶対パスで移動"],
        ["cd docs", "今いる場所の下の docs へ(相対パス)"],
        ["cd ..", "1つ上のディレクトリへ"],
        ["cd ../..", "2つ上のディレクトリへ"],
        ["cd", "ホームディレクトリへ(cd ~ と同じ)"],
        ["cd -", "直前にいたディレクトリへ戻る"]
      ],
      options: [["~", "ホームディレクトリ"], ["-", "直前にいたディレクトリ($OLDPWD)"]]
    },
    {
      id: "path", name: "/ ~ . ..", read: "パスの書き方",
      desc: "`/` から始まるのが絶対パス、それ以外は今いる場所から見た相対パスです。`~` はホーム、`.` は今いるディレクトリ、`..` は1つ上のディレクトリを表します。",
      examples: [
        ["ls /", "ルートディレクトリの中身"],
        ["ls ~/Downloads", "ホームの下の Downloads"],
        ["ls ../music", "1つ上のディレクトリの下の music"],
        ["./script.sh", "今いるディレクトリの script.sh を実行"]
      ],
      options: [
        ["/", "ルート(いちばん上)のディレクトリ。パスの区切りにも使う"],
        ["~", "ログイン中のユーザーのホームディレクトリ(例: /home/taro)"],
        [".", "今いるディレクトリ"],
        ["..", "1つ上(親)のディレクトリ"]
      ]
    },
    {
      id: "fhs", name: "主なディレクトリ", read: "ディレクトリ構成",
      desc: "Linux のファイルはすべて `/` の下に1本の木の形でつながっています。よく見るディレクトリの役割は決まっています。",
      examples: [
        ["ls /etc", "設定ファイルを見る"],
        ["ls /var/log", "ログファイルを見る"]
      ],
      options: [
        ["/etc", "システムやソフトの設定ファイル"],
        ["/home", "一般ユーザーのホームディレクトリ(/home/taro など)"],
        ["/root", "管理者(root)のホームディレクトリ"],
        ["/var", "ログ(/var/log)など、中身が変わっていくデータ"],
        ["/tmp", "一時ファイル。再起動で消えることがある"],
        ["/usr", "インストールされたプログラムやライブラリ(/usr/bin など)"],
        ["/bin", "ls や cp などの基本コマンド。最近の Ubuntu では /usr/bin へのリンク"]
      ]
    }
  ],
  questions: [
    {
      id: "p01", q: "今いるディレクトリ(カレントディレクトリ)の絶対パスを表示するコマンドは?",
      choices: ["pwd", "cd", "ls", "whoami"],
      explain: "`pwd` は print working directory の略で、今いる場所を `/home/taro` のような絶対パスで表示します。`cd` は移動、`ls` は一覧、`whoami` はユーザー名の表示です。",
      ref: "pwd"
    },
    {
      id: "p02", q: "どこにいても、自分のホームディレクトリへ移動するコマンドは?",
      choices: ["cd ~", "cd /", "cd .", "cd /home"],
      accepts: ["cd", "cd ~/", "cd $HOME", "cd \"$HOME\"", "cd ${HOME}"],
      explain: "`~` はログイン中のユーザーのホームディレクトリ(例: `/home/taro`)を表します。`cd` だけでもホームへ戻れます。`/home` はホームディレクトリがまとめて置かれる場所で、自分のホームそのものではありません。",
      ref: "cd"
    },
    {
      id: "p03", q: "1つ上(親)のディレクトリへ移動するコマンドは?",
      choices: ["cd ..", "cd .", "cd ~", "cd /"],
      accepts: ["cd ../"],
      explain: "`..` は1つ上のディレクトリを表します。`.` は今いるディレクトリなので、`cd .` では移動しません。",
      ref: "cd"
    },
    {
      id: "p04", q: "直前にいたディレクトリへ戻るコマンドは?",
      choices: ["cd -", "cd ..", "cd ~", "cd back"],
      accepts: ["cd ~-", "cd $OLDPWD", "cd \"$OLDPWD\""],
      explain: "`cd -` は、1つ前にいたディレクトリ(環境変数 `$OLDPWD`)へ戻ります。2つの場所を行き来するときに便利です。`cd ..` は1つ「上」へ移るだけです。",
      ref: "cd"
    },
    {
      id: "p05", q: "ルートディレクトリ(いちばん上のディレクトリ)へ移動するコマンドは?",
      choices: ["cd /", "cd ~", "cd ..", "cd root"],
      explain: "Linux のディレクトリはすべて `/`(ルート)から始まります。`cd root` は、今いる場所の下の root というディレクトリへ移ろうとします。",
      ref: "cd"
    },
    {
      id: "p06", q: "どこにいても /var/log へ移動できる(絶対パスを使った)コマンドは?",
      choices: ["cd /var/log", "cd var/log", "cd ~/var/log", "cd ./var/log"],
      accepts: ["cd /var/log/"],
      explain: "`/` から始まるパスが絶対パスです。`var/log` や `./var/log` は今いる場所から見た相対パス、`~/var/log` はホームの下を指すので、ほかの場所では別のディレクトリになります。",
      ref: "path"
    },
    {
      id: "p07", q: "taro としてログインしていて、/home/taro にいるとき、その下の docs ディレクトリへ移動するコマンドは?",
      choices: ["cd docs", "cd /docs", "cd ~docs", "cd ../docs"],
      accepts: ["cd docs/", "cd ./docs", "cd ./docs/", "cd ~/docs", "cd ~/docs/", "cd /home/taro/docs", "cd /home/taro/docs/"],
      explain: "相対パスの `docs` は「今いる場所の下の docs」です。`/docs` はルート直下、`~docs` は「docs というユーザーのホーム」という意味になり、`../docs` は1つ上の /home の下を指します。",
      ref: "path"
    },
    {
      id: "p08", q: "2つ上のディレクトリへ移動するコマンドは?",
      choices: ["cd ../..", "cd ...", "cd .. ..", "cd ~/.."],
      accepts: ["cd ../../"],
      explain: "`..` を `/` でつなげると、さらに上へ進みます。`cd ...` は「...」という名前のディレクトリを探すだけで、2つ上にはなりません。",
      ref: "path"
    },
    {
      id: "p09", q: "どこにいても、ホームディレクトリの下の Downloads へ移動するコマンドは?",
      choices: ["cd ~/Downloads", "cd /Downloads", "cd ~Downloads", "cd ./Downloads"],
      accepts: ["cd ~/Downloads/", "cd $HOME/Downloads", "cd \"$HOME/Downloads\"", "cd $HOME/Downloads/"],
      explain: "`~/Downloads` はホームの下の Downloads です。`~Downloads`(/ なし)は「Downloads というユーザーのホーム」になります。`./Downloads` はホームにいるときしか通じません。",
      ref: "path"
    },
    {
      id: "p10", q: "ルートディレクトリの中身を一覧表示するコマンドは?",
      choices: ["ls /", "ls ~", "ls .", "ls .."],
      accepts: ["ls /."],
      explain: "`ls` の後ろにディレクトリを書くと、その中身を表示します。ルートは `/` です。`/` の下には `etc` `home` `usr` `var` などが並びます。",
      ref: "path"
    },
    {
      id: "p11", q: "絶対パスはどれ?", kind: "code",
      choices: ["/home/taro/docs", "docs/memo.txt", "./docs", "../taro/docs"],
      explain: "`/` から始まるパスが絶対パスで、どこにいても同じ場所を指します。`docs/…` `./…` `../…` は今いる場所から見た相対パスです。",
      ref: "path"
    },
    {
      id: "p12", q: "今いる場所で次のように実行しました。移動したあとのカレントディレクトリは?", kind: "code",
      term: "$ pwd\n/home/taro/docs\n$ cd ../music",
      choices: ["/home/taro/music", "/home/taro/docs/music", "/home/music", "/music"],
      explain: "`..` で1つ上の `/home/taro` に上がり、その下の `music` へ入るので `/home/taro/music` です。",
      ref: "path"
    },
    {
      id: "p13", q: "パスの中の ~ が表すものは?", kind: "text",
      choices: ["ログイン中のユーザーのホームディレクトリ", "ルートディレクトリ", "今いるディレクトリ", "1つ前にいたディレクトリ"],
      explain: "`~` はホームディレクトリ(taro なら `/home/taro`)です。ルートは `/`、今いる場所は `.`、1つ前にいた場所は `cd -` で戻れます。",
      ref: "path"
    },
    {
      id: "p14", q: "システムやソフトの設定ファイルがまとめて置かれるディレクトリは?", kind: "code",
      choices: ["/etc", "/var", "/tmp", "/bin"],
      explain: "設定ファイルは `/etc` に置かれます(例: `/etc/hosts`、`/etc/ssh/sshd_config`)。",
      ref: "fhs"
    },
    {
      id: "p15", q: "ログファイルなど、中身がどんどん変わっていくデータが置かれるディレクトリは?", kind: "code",
      choices: ["/var", "/etc", "/usr", "/home"],
      explain: "`/var` は variable(変わるもの)の意味です。ログは `/var/log` に置かれます。",
      ref: "fhs"
    },
    {
      id: "p16", q: "一時ファイルを置くためのディレクトリで、再起動すると中身が消えることがあるのは?", kind: "code",
      choices: ["/tmp", "/var", "/home", "/etc"],
      explain: "`/tmp` は temporary(一時的)の意味です。だれでも書き込めますが、再起動などで消えることがあるので、大事なファイルは置きません。",
      ref: "fhs"
    },
    {
      id: "p17", q: "一般ユーザーのホームディレクトリ(taro なら taro のもの)がまとめて置かれるディレクトリは?", kind: "code",
      choices: ["/home", "/usr", "/root", "/etc"],
      explain: "一般ユーザーのホームは `/home/ユーザー名` です。`/root` は管理者(root)だけのホームです。",
      ref: "fhs"
    }
  ]
});


// =====================================================================
// 02 ファイル操作
// =====================================================================
LNX.register("file-ops", {
  commands: [
    {
      id: "ls", name: "ls", read: "list",
      desc: "ディレクトリの中にあるファイルやディレクトリを一覧表示します。何も書かなければ今いるディレクトリが対象です。",
      examples: [
        ["ls", "今いるディレクトリの一覧"],
        ["ls -l", "権限・所有者・サイズ・日時つきの詳しい形式"],
        ["ls -la", "隠しファイルも含めて詳しく"],
        ["ls -lh", "サイズを K・M・G で読みやすく"],
        ["ls -lt", "更新日時の新しい順"]
      ],
      options: [
        ["-l", "詳しい形式(長い形式)で表示"],
        ["-a", "名前が . で始まる隠しファイルも表示(. と .. も出る)"],
        ["-A", "隠しファイルも表示(. と .. は出さない)"],
        ["-h", "-l と一緒に使い、サイズを読みやすい単位で表示"],
        ["-t", "更新日時の新しい順に並べる"],
        ["-r", "並び順を逆にする"],
        ["-S", "サイズの大きい順に並べる"]
      ]
    },
    {
      id: "touch", name: "touch", read: "触る",
      desc: "ファイルの更新日時を今の時刻にします。ファイルがなければ、中身が空のファイルを作ります。",
      examples: [["touch memo.txt", "空のファイルを作る(あれば日時だけ更新)"]]
    },
    {
      id: "mkdir", name: "mkdir", read: "make directory",
      desc: "ディレクトリを作ります。",
      examples: [
        ["mkdir work", "work ディレクトリを作る"],
        ["mkdir -p a/b/c", "途中の a や a/b がなくても、まとめて作る"]
      ],
      options: [["-p", "途中のディレクトリもまとめて作る。すでにあってもエラーにしない"]]
    },
    {
      id: "cp", name: "cp", read: "copy",
      desc: "ファイルやディレクトリをコピーします。`cp コピー元 コピー先` の順に書きます。コピー先に同じ名前があると、確認なしで上書きします。",
      examples: [
        ["cp a.txt b.txt", "a.txt を b.txt という名前でコピー"],
        ["cp a.txt docs/", "a.txt を docs の中へコピー"],
        ["cp -r src backup", "ディレクトリを中身ごとコピー"]
      ],
      options: [
        ["-r", "ディレクトリを中身ごとコピー(-R も同じ)"],
        ["-i", "上書きする前に確認する"],
        ["-p", "更新日時や権限を保ったままコピー"],
        ["-a", "-r に加えて、権限や日時などをできるだけそのまま保つ"]
      ]
    },
    {
      id: "mv", name: "mv", read: "move",
      desc: "ファイルやディレクトリを移動します。同じディレクトリの中で別の名前へ「移動」すると、名前の変更になります。",
      examples: [
        ["mv old.txt new.txt", "名前を変える"],
        ["mv report.txt docs/", "docs の中へ移動"]
      ],
      options: [["-i", "上書きする前に確認する"]]
    },
    {
      id: "rm", name: "rm", read: "remove",
      desc: "ファイルを削除します。ゴミ箱には入らず、すぐに消えるので注意します。",
      examples: [
        ["rm old.log", "ファイルを削除"],
        ["rm -i a.txt", "消す前に確認する"],
        ["rm -r tmp", "ディレクトリを中身ごと削除"]
      ],
      options: [
        ["-i", "1つずつ確認してから削除"],
        ["-r", "ディレクトリを中身ごと削除(-R も同じ)"],
        ["-f", "確認やエラー表示をせずに削除(とくに注意)"]
      ]
    },
    {
      id: "rmdir", name: "rmdir", read: "remove directory",
      desc: "空のディレクトリを削除します。中にファイルが残っているとエラーになります。",
      examples: [["rmdir empty", "空のディレクトリ empty を削除"]]
    }
  ],
  questions: [
    {
      id: "f01", q: "隠しファイル(名前が . で始まるファイル)も含めて、詳しい形式で一覧表示するコマンドは?",
      choices: ["ls -la", "ls -l", "ls -a", "ls -lh"],
      accepts: ["ls -al", "ls -l -a", "ls -a -l", "ls -lA", "ls -Al", "ls -l -A", "ls -A -l"],
      explain: "`-l` は詳しい形式、`-a` は隠しファイルも表示です。まとめて `-la`(`-al` でも同じ)と書けます。`-A` を使うと `.` と `..` を除いて表示します。",
      ref: "ls"
    },
    {
      id: "f02", q: "更新日時が新しい順に並べて、詳しい形式で一覧表示するコマンドは?",
      choices: ["ls -lt", "ls -lr", "ls -lS", "ls -la"],
      accepts: ["ls -tl", "ls -l -t", "ls -t -l"],
      explain: "`-t` は更新日時(time)の新しい順です。`-r` は並びを逆に、`-S` はサイズの大きい順にします。",
      ref: "ls"
    },
    {
      id: "f03", q: "中身が空のファイル memo.txt を新しく作るコマンドは?",
      choices: ["touch memo.txt", "mkdir memo.txt", "cat memo.txt", "new memo.txt"],
      explain: "`touch` は、ファイルがなければ空のファイルを作ります(あれば更新日時だけが変わります)。`mkdir` で作るとディレクトリになってしまいます。",
      ref: "touch"
    },
    {
      id: "f04", q: "work という名前のディレクトリを作るコマンドは?",
      choices: ["mkdir work", "touch work", "md work", "mkdir -r work"],
      accepts: ["mkdir work/", "mkdir ./work"],
      explain: "ディレクトリは `mkdir`(make directory)で作ります。`touch` は空のファイルを作ります。`mkdir` には `-r` というオプションはありません。",
      ref: "mkdir"
    },
    {
      id: "f05", q: "a も a/b もまだないところに、a/b/c ディレクトリを一度に作るコマンドは?",
      choices: ["mkdir -p a/b/c", "mkdir a/b/c", "mkdir -r a/b/c", "touch -p a/b/c"],
      accepts: ["mkdir -p a/b/c/", "mkdir --parents a/b/c"],
      explain: "`-p`(parents)をつけると、途中のディレクトリもまとめて作ります。つけないと「そのようなファイルやディレクトリはありません」のエラーになります。",
      ref: "mkdir"
    },
    {
      id: "f06", q: "a.txt を、b.txt という名前でコピーするコマンドは?",
      choices: ["cp a.txt b.txt", "mv a.txt b.txt", "cp b.txt a.txt", "copy a.txt b.txt"],
      explain: "`cp コピー元 コピー先` の順です。`mv` だと a.txt が残らず、名前が変わるだけになります。",
      ref: "cp"
    },
    {
      id: "f07", q: "ディレクトリ src を中身ごと backup としてコピーするコマンドは?",
      choices: ["cp -r src backup", "cp src backup", "mv -r src backup", "cp -p src backup"],
      accepts: ["cp -R src backup", "cp -a src backup", "cp --recursive src backup", "cp -r src/ backup", "cp -r src backup/", "cp -r src/ backup/", "cp -R src/ backup", "cp -R src backup/", "cp -R src/ backup/"],
      explain: "ディレクトリをコピーするには `-r`(recursive、中までたどる)が必要です。つけないと「-r が指定されていないため、ディレクトリを飛ばします」と言われます。",
      ref: "cp"
    },
    {
      id: "f08", q: "old.txt の名前を new.txt に変えるコマンドは?",
      choices: ["mv old.txt new.txt", "cp old.txt new.txt", "mv new.txt old.txt", "ren old.txt new.txt"],
      explain: "名前の変更も `mv` で行います。`cp` だと old.txt が残ります。`ren` は Windows のコマンドです。",
      ref: "mv"
    },
    {
      id: "f09", q: "report.txt を、今いる場所の下の docs ディレクトリの中へ移動するコマンドは?",
      choices: ["mv report.txt docs/", "cp report.txt docs/", "mv docs/ report.txt", "cd report.txt docs/"],
      accepts: ["mv report.txt docs", "mv report.txt ./docs", "mv report.txt ./docs/"],
      explain: "`mv 移動するもの 移動先` の順です。移動先がディレクトリなら、その中へ同じ名前で入ります。`cp` は元のファイルが残ります。",
      ref: "mv"
    },
    {
      id: "f10", q: "ファイル old.log を削除するコマンドは?",
      choices: ["rm old.log", "rmdir old.log", "del old.log", "delete old.log"],
      accepts: ["rm ./old.log"],
      explain: "ファイルの削除は `rm` です。`rmdir` は空のディレクトリ用、`del` は Windows のコマンドです。",
      ref: "rm"
    },
    {
      id: "f11", q: "a.txt を、本当に消してよいか確認してから削除するコマンドは?",
      choices: ["rm -i a.txt", "rm -f a.txt", "rm -r a.txt", "rm -v a.txt"],
      accepts: ["rm --interactive a.txt"],
      explain: "`-i`(interactive)をつけると「削除しますか?」と聞かれ、`y` で削除します。`-f` は逆に、確認せずに消します。",
      ref: "rm"
    },
    {
      id: "f12", q: "ディレクトリ tmp を、中のファイルごと削除するコマンドは?",
      choices: ["rm -r tmp", "rmdir tmp", "rm tmp", "rm -i tmp"],
      accepts: ["rm -R tmp", "rm -rf tmp", "rm -fr tmp", "rm -r -f tmp", "rm --recursive tmp", "rm -r tmp/", "rm -R tmp/", "rm -rf tmp/", "rm -fr tmp/", "rm -r -f tmp/"],
      explain: "中身ごと消すには `-r` が必要です。`rmdir` は空のディレクトリしか消せず、`rm tmp` だけでは「ディレクトリです」とエラーになります。",
      ref: "rm"
    },
    {
      id: "f13", q: "空のディレクトリだけを削除するためのコマンドで、ディレクトリ empty を削除するには?",
      choices: ["rmdir empty", "rm empty", "rm -i empty", "deldir empty"],
      accepts: ["rmdir empty/", "rm -d empty", "rm -d empty/"],
      explain: "`rmdir` は空のディレクトリ専用です。中身が残っているときはエラーで止まるので、うっかり消す心配がありません。",
      ref: "rmdir"
    },
    {
      id: "f14", q: "rm で削除したファイルはどうなる?", kind: "text",
      choices: ["ゴミ箱には入らず、すぐに消える", "ホームのゴミ箱に移り、あとで戻せる", "30日たってから消える", "再起動するまでは残る"],
      explain: "`rm` で消したファイルはゴミ箱を通らずに消えます。元に戻すのは難しいので、不安なときは `rm -i` を使います。",
      ref: "rm"
    },
    {
      id: "f15", q: "cp a.txt b.txt を実行したとき、b.txt がすでにあるとどうなる?", kind: "text",
      choices: ["確認なしで b.txt が上書きされる", "エラーになって何もコピーされない", "b(1).txt という別のファイルができる", "a.txt の中身が b.txt の末尾に追加される"],
      explain: "`cp` は、コピー先があると何も聞かずに上書きします。上書きの前に確認したいときは `cp -i` を使います。",
      ref: "cp"
    },
    {
      id: "f16", q: "ls -a をつけると、ふだんより多く表示されるのは?", kind: "text",
      choices: ["名前が . で始まる隠しファイル", "実行権限のあるファイル", "サイズが0のファイル", "最近変更したファイル"],
      explain: "`.bashrc` のように名前が `.` で始まるファイルは、ふだんの `ls` では表示されません。`-a`(all)をつけると表示されます。",
      ref: "ls"
    },
    {
      id: "f17", q: "ls -lh の -h の働きは?", kind: "text",
      choices: ["サイズを K・M・G などの読みやすい単位で表示する", "隠しファイルも表示する", "使い方の説明(ヘルプ)を表示する", "更新日時の新しい順に並べる"],
      explain: "`-h` は human-readable(人が読みやすい)の意味で、`-l` と一緒に使うと `4096` ではなく `4.0K` のように表示します。ヘルプは `ls --help` です。",
      ref: "ls"
    }
  ]
});


// =====================================================================
// 03 ファイルの閲覧
// =====================================================================
LNX.register("viewing", {
  commands: [
    {
      id: "cat", name: "cat", read: "concatenate(つなげる)",
      desc: "ファイルの中身をそのまま画面に出します。複数のファイルを書くと、つなげて出します。",
      examples: [
        ["cat memo.txt", "中身を全部表示"],
        ["cat -n memo.txt", "行番号をつけて表示"],
        ["cat a.txt b.txt", "2つをつなげて表示"]
      ],
      options: [["-n", "すべての行に行番号をつける"]]
    },
    {
      id: "less", name: "less", read: "more より多機能",
      desc: "長いファイルを1画面ずつ表示します。前後にスクロールしたり、検索したりできます。",
      examples: [
        ["less big.log", "1画面ずつ読む"],
        ["ls -l | less", "コマンドの長い出力を読む"]
      ],
      options: [
        ["Space / b", "1画面先へ / 1画面戻る"],
        ["/文字", "下(先)へ向かって検索"],
        ["?文字", "上(前)へ向かって検索"],
        ["n / N", "次の一致 / 前の一致"],
        ["g / G", "先頭へ / 末尾へ"],
        ["q", "終了"]
      ]
    },
    {
      id: "head", name: "head", read: "頭",
      desc: "ファイルの先頭を表示します。何も指定しなければ10行です。",
      examples: [
        ["head access.log", "先頭10行"],
        ["head -n 5 data.csv", "先頭5行"]
      ],
      options: [["-n 数", "表示する行数(-5 のようにも書ける)"], ["-c 数", "先頭から指定したバイト数"]]
    },
    {
      id: "tail", name: "tail", read: "しっぽ",
      desc: "ファイルの末尾を表示します。何も指定しなければ10行です。`-f` で、追記される内容を表示し続けます。",
      examples: [
        ["tail -n 20 access.log", "末尾20行"],
        ["tail -f app.log", "追記されるログを表示し続ける(Ctrl+C で終了)"]
      ],
      options: [["-n 数", "表示する行数(-20 のようにも書ける)"], ["-f", "ファイルを見張り、追記された行を表示し続ける"]]
    },
    {
      id: "wc", name: "wc", read: "word count",
      desc: "行数・単語数・バイト数を数えます。オプションなしでは「行数 単語数 バイト数 ファイル名」の順に出ます。",
      examples: [
        ["wc notes.txt", "行数・単語数・バイト数"],
        ["wc -l data.csv", "行数だけ"]
      ],
      options: [["-l", "行数"], ["-w", "単語数"], ["-c", "バイト数"]]
    }
  ],
  questions: [
    {
      id: "v01", q: "memo.txt の中身を、画面にそのまま全部表示するコマンドは?",
      choices: ["cat memo.txt", "head memo.txt", "type memo.txt", "show memo.txt"],
      explain: "`cat` はファイルの中身をそのまま出力します。`head` は先頭の一部だけです。`type` は bash では「コマンドの種類を調べる」命令です。",
      ref: "cat"
    },
    {
      id: "v02", q: "オプションをつけずに head access.log を実行すると表示されるのは?", kind: "text",
      choices: ["先頭の10行", "先頭の1行", "先頭の1画面分", "ファイル名と行数"],
      explain: "`head` も `tail` も、行数を指定しないと10行を表示します。",
      ref: "head"
    },
    {
      id: "v03", q: "data.csv の先頭5行だけを表示するコマンドは?",
      choices: ["head -n 5 data.csv", "tail -n 5 data.csv", "head -c 5 data.csv", "cat -5 data.csv"],
      accepts: ["head -5 data.csv", "head -n5 data.csv", "head --lines=5 data.csv", "cat data.csv | head -n 5", "cat data.csv | head -5", "head -n 5 < data.csv"],
      explain: "`head -n 5` で先頭5行です。`-c 5` は5バイト、`tail` は末尾から数えます。",
      ref: "head"
    },
    {
      id: "v04", q: "access.log の末尾20行を表示するコマンドは?",
      choices: ["tail -n 20 access.log", "head -n 20 access.log", "tail -c 20 access.log", "tail -f access.log"],
      accepts: ["tail -20 access.log", "tail -n20 access.log", "tail --lines=20 access.log"],
      explain: "`tail -n 20` で末尾20行です。`-c 20` は末尾20バイト、`-f` は追記を見張り続けるオプションです。",
      ref: "tail"
    },
    {
      id: "v05", q: "memo.txt の最後の1行だけを表示するコマンドは?",
      choices: ["tail -n 1 memo.txt", "head -n 1 memo.txt", "tail -c 1 memo.txt", "wc -l memo.txt"],
      accepts: ["tail -1 memo.txt", "tail -n1 memo.txt", "tail --lines=1 memo.txt"],
      explain: "末尾から数えるのは `tail` です。`head -n 1` は最初の1行、`wc -l` は行数を数えるだけです。",
      ref: "tail"
    },
    {
      id: "v06", q: "書き込まれ続けている app.log を、新しく追加された行が出るたびに表示し続けるコマンドは?",
      choices: ["tail -f app.log", "head -f app.log", "cat -f app.log", "tail -r app.log"],
      accepts: ["tail -F app.log", "tail --follow app.log"],
      explain: "`tail -f`(follow)はファイルを見張り、追記された行を表示し続けます。ログの確認でよく使います。`head` や `cat` に `-f` はありません。",
      ref: "tail"
    },
    {
      id: "v07", q: "tail -f で表示し続けているのを終わらせる方法は?", kind: "text",
      choices: ["Ctrl+C を押す", "q を押す", "Ctrl+Z を押す", "Esc を押す"],
      explain: "`Ctrl+C` で実行中のコマンドを中断します。`q` は `less` や `top` を終える方法です。`Ctrl+Z` は一時停止なので、裏で止まったまま残ります。",
      ref: "tail"
    },
    {
      id: "v08", q: "長い big.log を、前後にスクロールしながら1画面ずつ読むコマンドは?",
      choices: ["less big.log", "cat big.log", "head big.log", "wc big.log"],
      explain: "`less` は1画面ずつ表示し、`Space` で先へ、`b` で前へ戻れます。`cat` は一気に全部流れてしまいます。",
      ref: "less"
    },
    {
      id: "v09", q: "less でファイルを読んでいるとき、終了するキーは?", kind: "code",
      choices: ["q", "Ctrl+C", "Esc", ":wq"],
      explain: "`less` は `q`(quit)で終わります。`:wq` は vim で保存して終わる操作です。",
      ref: "less"
    },
    {
      id: "v10", q: "less で、今の位置より下(先)にある error という文字を検索する入力は?", kind: "code",
      choices: ["/error", "?error", ":error", "#error"],
      explain: "`/文字` で先へ向かって検索します。`?文字` は前(上)へ向かって検索します。",
      ref: "less"
    },
    {
      id: "v11", q: "less で検索したあと、次に一致する場所へ進むキーは?", kind: "code",
      choices: ["n", "N", "Space", "g"],
      explain: "`n`(next)で次の一致、`N` で前の一致へ移ります。`Space` は1画面先へ、`g` は先頭へ移動します。",
      ref: "less"
    },
    {
      id: "v12", q: "data.csv の行数を数えるコマンドは?",
      choices: ["wc -l data.csv", "wc -w data.csv", "wc -c data.csv", "cat -n data.csv"],
      accepts: ["wc --lines data.csv"],
      explain: "`wc -l` は行(line)の数を数えます。`-w` は単語数、`-c` はバイト数です。`cat -n` は行番号をつけて全部を表示します。",
      ref: "wc"
    },
    {
      id: "v13", q: "memo.txt のバイト数(ファイルの大きさ)を wc で数えるコマンドは?",
      choices: ["wc -c memo.txt", "wc -l memo.txt", "wc -w memo.txt", "ls memo.txt"],
      accepts: ["wc --bytes memo.txt"],
      explain: "`wc -c` はバイト数です。日本語は1文字が3バイト(UTF-8)のことが多いので、文字数とは違う数になります。",
      ref: "wc"
    },
    {
      id: "v14", q: "次の出力で、58 は何を表している?", kind: "text",
      term: "$ wc notes.txt\n 12  58 340 notes.txt",
      choices: ["単語数", "行数", "バイト数", "文字数"],
      explain: "`wc` をオプションなしで使うと「行数 単語数 バイト数」の順に出ます。12 行、58 単語、340 バイトです。",
      ref: "wc"
    },
    {
      id: "v15", q: "memo.txt を、すべての行に行番号をつけて表示するコマンドは?",
      choices: ["cat -n memo.txt", "cat -l memo.txt", "wc -l memo.txt", "head -n memo.txt"],
      accepts: ["cat --number memo.txt"],
      explain: "`cat -n` は、空の行も含めてすべての行に番号をつけます。`cat` に `-l` はありません。",
      ref: "cat"
    },
    {
      id: "v16", q: "a.txt と b.txt を、この順につなげて画面に表示するコマンドは?",
      choices: ["cat a.txt b.txt", "cat a.txt > b.txt", "cat a.txt + b.txt", "cat a.txt & b.txt"],
      explain: "`cat` は並べたファイルを順につなげて出力します(concatenate の略)。`cat a.txt > b.txt` は b.txt を a.txt の中身で上書きしてしまいます。",
      ref: "cat"
    }
  ]
});


// =====================================================================
// 04 検索
// =====================================================================
LNX.register("search", {
  commands: [
    {
      id: "grep", name: "grep", read: "global regular expression print",
      desc: "ファイルの中から、指定した文字(パターン)を含む行を探して表示します。`grep パターン ファイル` の順に書きます。",
      examples: [
        ["grep error app.log", "error を含む行"],
        ["grep -i error app.log", "大文字小文字を区別しない"],
        ["grep -rn main src", "src の下を再帰的に、行番号つきで"],
        ["grep -v debug app.log", "debug を含まない行"]
      ],
      options: [
        ["-i", "大文字小文字を区別しない"],
        ["-n", "行番号をつける"],
        ["-v", "一致しない行を表示"],
        ["-c", "一致した行の数を表示"],
        ["-r", "ディレクトリの下を再帰的に探す"]
      ]
    },
    {
      id: "find", name: "find", read: "見つける",
      desc: "名前・種類・大きさ・更新日時などの条件で、ファイルやディレクトリを探します。`find 探し始める場所 条件` の順に書きます。",
      examples: [
        ["find . -name \"*.txt\"", "名前が .txt で終わるもの"],
        ["find . -type d", "ディレクトリだけ"],
        ["find /home -size +100M", "100MB(MiB)より大きいもの"],
        ["find . -mtime -7", "7日以内に更新されたもの"]
      ],
      options: [
        ["-name", "名前で探す。* などは \"\" で囲む"],
        ["-iname", "名前で探す(大文字小文字を区別しない)"],
        ["-type f / d", "f = 通常のファイル、d = ディレクトリ"],
        ["-size +N / -N", "N より大きい / 小さい(k・M・G で単位)"],
        ["-mtime -N / +N", "N 日以内に更新 / N 日より前に更新(端数切り捨ての日数で比べるので、+30 は実際には31日以上前)"]
      ]
    }
  ],
  questions: [
    {
      id: "s01", q: "app.log の中から、error を含む行を表示するコマンドは?",
      choices: ["grep error app.log", "find error app.log", "grep app.log error", "cat error app.log"],
      accepts: ["grep -e error app.log", "cat app.log | grep error"],
      explain: "`grep 探す文字 ファイル` の順です。逆に書くと、app.log という文字を error というファイルから探すことになります。`find` はファイルの名前などで探すコマンドです。",
      ref: "grep"
    },
    {
      id: "s02", q: "app.log から、Error も ERROR も error も含めて(大文字小文字を区別せずに)探すコマンドは?",
      choices: ["grep -i error app.log", "grep -v error app.log", "grep -n error app.log", "grep -c error app.log"],
      accepts: ["grep --ignore-case error app.log"],
      explain: "`-i`(ignore case)で大文字小文字を区別しなくなります。",
      ref: "grep"
    },
    {
      id: "s03", q: "main.c の中で TODO を含む行を、行番号つきで表示するコマンドは?",
      choices: ["grep -n TODO main.c", "grep -c TODO main.c", "grep -i TODO main.c", "cat -n TODO main.c"],
      accepts: ["grep --line-number TODO main.c"],
      explain: "`-n`(number)で、行の先頭に `12:` のような行番号がつきます。",
      ref: "grep"
    },
    {
      id: "s04", q: "app.log から、debug を含まない行だけを表示するコマンドは?",
      choices: ["grep -v debug app.log", "grep -i debug app.log", "grep -n debug app.log", "grep -c debug app.log"],
      accepts: ["grep --invert-match debug app.log"],
      explain: "`-v`(invert)は、一致しない行を表示します。じゃまな行を取り除くときに使います。",
      ref: "grep"
    },
    {
      id: "s05", q: "app.log の中で、error を含む行が何行あるかを表示するコマンドは?",
      choices: ["grep -c error app.log", "grep -n error app.log", "grep -v error app.log", "wc -l error app.log"],
      accepts: ["grep --count error app.log", "grep error app.log | wc -l"],
      explain: "`-c`(count)は、一致した行の数だけを表示します。`grep error app.log | wc -l` でも同じ数になります。",
      ref: "grep"
    },
    {
      id: "s06", q: "src ディレクトリの下のすべてのファイル(サブディレクトリも含む)から、main を含む行を探すコマンドは?",
      choices: ["grep -r main src", "grep main src", "find main src", "grep -c main src"],
      accepts: ["grep -r main src/", "grep -R main src", "grep -R main src/", "grep --recursive main src"],
      explain: "`-r`(recursive)で、ディレクトリの中までたどって探します。つけないと「src: ディレクトリです」と言われます。",
      ref: "grep"
    },
    {
      id: "s07", q: "次の出力で、先頭の 12 は何?", kind: "text",
      term: "$ grep -n error app.log\n12:error: disk full\n40:error: timeout",
      choices: ["一致した行の行番号", "一致した回数", "エラーの番号", "ファイルの番号"],
      explain: "`-n` をつけると、一致した行の前に `行番号:` がつきます。12 行目と 40 行目に error があるということです。",
      ref: "grep"
    },
    {
      id: "s08", q: "app.log の中で、大文字小文字を区別せずに warning を含む行の数を表示するコマンドは?",
      choices: ["grep -ic warning app.log", "grep -iv warning app.log", "grep -in warning app.log", "grep -c warning app.log"],
      accepts: ["grep -ci warning app.log", "grep -i -c warning app.log", "grep -c -i warning app.log"],
      explain: "オプションはまとめて書けます。`-i`(区別しない)と `-c`(数える)を合わせて `-ic` です。`-c` だけでは Warning や WARNING を数えません。",
      ref: "grep"
    },
    {
      id: "s09", q: "今いるディレクトリ以下から、名前が .txt で終わるファイルを探すコマンドは?",
      choices: ["find . -name \"*.txt\"", "find . -type \"*.txt\"", "grep -r \".txt\" .", "find \"*.txt\" -name ."],
      accepts: ["find -name \"*.txt\"", "find ./ -name \"*.txt\"", "find . -type f -name \"*.txt\"", "find . -name \"*.txt\" -type f", "find -type f -name \"*.txt\"", "find -name \"*.txt\" -type f", "find . -name \\*.txt"],
      explain: "`find 場所 -name \"パターン\"` の形です。`*` はシェルが先に展開しないように `\"\"` か `''` で囲みます。`grep -r` はファイルの「中身」を探します。",
      ref: "find"
    },
    {
      id: "s10", q: "今いるディレクトリ以下から、ディレクトリだけを探すコマンドは?",
      choices: ["find . -type d", "find . -type f", "find . -name d", "ls -d"],
      accepts: ["find -type d", "find ./ -type d"],
      explain: "`-type d` はディレクトリ(directory)、`-type f` は通常のファイル(file)です。",
      ref: "find"
    },
    {
      id: "s11", q: "/home 以下から、100MB より大きいファイルを探すコマンドは?",
      choices: ["find /home -size +100M", "find /home -size 100M", "find /home -size -100M", "find /home -size +100MB"],
      accepts: ["find /home/ -size +100M", "find /home -type f -size +100M", "find /home/ -type f -size +100M", "find /home -size +100M -type f", "find /home/ -size +100M -type f"],
      explain: "`-size +100M` で「100M より大きい」、`-100M` で「小さい」です。単位は `k` `M` `G` の1文字で、`MB` とは書けません(M は 1024×1024 バイト)。",
      ref: "find"
    },
    {
      id: "s12", q: "今いるディレクトリ以下から、最近7日以内に内容が更新されたファイルを探すコマンドは?",
      choices: ["find . -mtime -7", "find . -mtime +7", "find . -atime -7", "find . -size -7"],
      accepts: ["find -mtime -7", "find ./ -mtime -7", "find . -type f -mtime -7", "find . -mtime -7 -type f", "find -type f -mtime -7", "find -mtime -7 -type f"],
      explain: "`-mtime` は更新日時(modification time)です。`-7` は7日以内、`+7` は7日より前です。`-atime` は最後に読まれた日時です。",
      ref: "find"
    },
    {
      id: "s13", q: "find . -mtime +30 で見つかるのは?", kind: "text",
      choices: ["最後に更新されてから30日より長くたったファイル", "30日以内に更新されたファイル", "ちょうど30日前に作られたファイル", "30MB より大きいファイル"],
      explain: "`+30` は「30日より前」、`-30` は「30日以内」です。日数は端数を切り捨てて比べるので、`+30` で見つかるのは実際には31日以上前に更新されたものです。古いログを探して消すときなどに使います。",
      ref: "find"
    },
    {
      id: "s14", q: "find . -type f で見つかるのは?", kind: "text",
      choices: ["通常のファイル(ディレクトリは含まない)", "ディレクトリだけ", "隠しファイルだけ", "最近使ったファイル"],
      explain: "`f` は file です。ディレクトリだけなら `-type d` です。",
      ref: "find"
    },
    {
      id: "s15", q: "今いるディレクトリ以下から、大文字小文字を区別せずに名前が readme.md のもの(README.md なども)を探すコマンドは?",
      choices: ["find . -iname readme.md", "find . -name readme.md", "find . -i -name readme.md", "grep -i readme.md ."],
      accepts: ["find -iname readme.md", "find ./ -iname readme.md", "find . -iname README.md", "find -iname README.md"],
      explain: "`-iname` は、大文字小文字を区別しない `-name` です。`-name readme.md` では README.md は見つかりません。",
      ref: "find"
    }
  ]
});


// =====================================================================
// 05 権限
// =====================================================================
LNX.register("permissions", {
  commands: [
    {
      id: "perm", name: "ls -l の読み方", read: "パーミッション",
      desc: "`ls -l` の先頭10文字は、種類(`-` = ファイル、`d` = ディレクトリ)と、所有者・グループ・その他の3組の権限です。r = 読み取り(4)、w = 書き込み(2)、x = 実行(1)、- = なし。",
      examples: [
        ["ls -l script.sh", "-rwxr-xr-- 1 taro staff 120 …"],
        ["ls -ld docs", "ディレクトリ自身の権限を見る"]
      ],
      options: [
        ["-rwxr-xr--", "ファイル。所有者 rwx(7)、グループ r-x(5)、その他 r--(4) = 754"],
        ["drwxr-xr-x", "ディレクトリ。755"],
        ["r(4)", "読み取り。ディレクトリでは中身の一覧"],
        ["w(2)", "書き込み。ディレクトリでは中のファイルの作成・削除"],
        ["x(1)", "実行。ディレクトリでは中に入る(cd)"]
      ]
    },
    {
      id: "chmod", name: "chmod", read: "change mode",
      desc: "ファイルの権限を変えます。数字(755 など)か、記号(u+x など)で書きます。u = 所有者、g = グループ、o = その他、a = 全員。",
      examples: [
        ["chmod u+x script.sh", "所有者に実行権限を追加"],
        ["chmod 755 deploy.sh", "rwxr-xr-x にする"],
        ["chmod 644 notes.txt", "rw-r--r-- にする"],
        ["chmod go-w shared.txt", "グループとその他から書き込みを外す"]
      ],
      options: [
        ["+ / - / =", "追加 / 削除 / その通りに設定"],
        ["755", "rwxr-xr-x(実行するファイルやディレクトリ)"],
        ["644", "rw-r--r--(ふつうのファイル)"],
        ["600", "rw-------(自分だけ読み書き)"],
        ["-R", "ディレクトリの下もまとめて変える"]
      ]
    },
    {
      id: "chown", name: "chown", read: "change owner",
      desc: "ファイルの所有者(とグループ)を変えます。ふつうは管理者権限が必要なので `sudo` をつけます。",
      examples: [
        ["sudo chown taro file.txt", "所有者を taro に"],
        ["sudo chown taro:staff file.txt", "所有者を taro、グループを staff に"],
        ["sudo chown -R taro /srv/app", "ディレクトリの下もまとめて"]
      ],
      options: [["ユーザー:グループ", "所有者とグループを同時に変える"], ["-R", "ディレクトリの下もまとめて変える"]]
    }
  ],
  questions: [
    {
      id: "r01", q: "次の表示で、先頭の d が表しているのは?", kind: "text",
      term: "$ ls -ld docs\ndrwxr-xr-x 2 taro taro 4096 Oct 17 10:00 docs",
      choices: ["docs がディレクトリであること", "docs が削除できないこと", "docs が隠しファイルであること", "docs がダウンロードしたものであること"],
      explain: "先頭の1文字は種類です。`d` はディレクトリ、`-` は通常のファイル、`l` はシンボリックリンクです。",
      ref: "perm"
    },
    {
      id: "r02", q: "script.sh のグループ(staff)が持っている権限は?", kind: "text",
      term: "$ ls -l script.sh\n-rwxr-xr-- 1 taro staff 120 Oct 17 10:00 script.sh",
      choices: ["読み取りと実行", "読み取り・書き込み・実行", "読み取りだけ", "書き込みと実行"],
      explain: "`rwx` `r-x` `r--` の3組が、所有者・グループ・その他の順です。グループは `r-x` なので、読み取りと実行ができ、書き込みはできません。",
      ref: "perm"
    },
    {
      id: "r03", q: "数字の 755 を、ls -l の記号で書くと?", kind: "code",
      choices: ["rwxr-xr-x", "rw-r--r--", "rwxrwxr-x", "rwxr--r--"],
      explain: "r = 4、w = 2、x = 1 の合計です。7 = 4+2+1 = `rwx`、5 = 4+1 = `r-x` なので `rwxr-xr-x` です。",
      ref: "chmod"
    },
    {
      id: "r04", q: "rw-r--r-- を数字で書くと?", kind: "code",
      choices: ["644", "755", "664", "466"],
      explain: "`rw-` = 4+2 = 6、`r--` = 4 なので 644 です。ふつうのファイルによくある権限です。",
      ref: "chmod"
    },
    {
      id: "r05", q: "ディレクトリの x(実行)権限があると、何ができる?", kind: "text",
      choices: ["cd でそのディレクトリに入り、中のファイルにアクセスできる", "中のファイルがすべて実行できるようになる", "ディレクトリそのものを削除できる", "ディレクトリの名前を変えられる"],
      explain: "ディレクトリの `x` は「中に入る(通り抜ける)」権限です。中身の一覧を見るのは `r`、中にファイルを作ったり消したりするのは `w` の役目です。",
      ref: "perm"
    },
    {
      id: "r06", q: "権限が -rw-r--r-- の script.sh を ./script.sh で実行しようとすると、どうなる?", kind: "text",
      choices: ["Permission denied(許可がありません)のエラーになる", "ふつうに実行される", "実行権限が自動でつき、実行される", "スクリプトの中身が表示される"],
      explain: "だれにも `x` がないので実行できません。`chmod u+x script.sh` で実行権限をつけてから実行します。",
      ref: "chmod"
    },
    {
      id: "r07", q: "script.sh の所有者に、実行権限を追加するコマンドは?",
      choices: ["chmod u+x script.sh", "chmod u-x script.sh", "chmod g+x script.sh", "chown u+x script.sh"],
      accepts: ["chmod u+x ./script.sh"],
      explain: "`u` は所有者(user)、`+x` は実行権限の追加です。`-x` だと外します。権限を変えるのは `chmod`、所有者を変えるのが `chown` です。",
      ref: "chmod"
    },
    {
      id: "r08", q: "deploy.sh の権限を、数字で 755(rwxr-xr-x)にするコマンドは?",
      choices: ["chmod 755 deploy.sh", "chmod 644 deploy.sh", "chown 755 deploy.sh", "chmod 557 deploy.sh"],
      accepts: ["chmod 0755 deploy.sh", "chmod u=rwx,go=rx deploy.sh", "chmod u=rwx,g=rx,o=rx deploy.sh"],
      explain: "数字は「所有者・グループ・その他」の順です。755 は所有者が全部、ほかの人は読み取りと実行です。",
      ref: "chmod"
    },
    {
      id: "r09", q: "secret.txt を、所有者だけが読み書きでき、ほかの人は何もできない状態にするコマンドは?",
      choices: ["chmod 600 secret.txt", "chmod 700 secret.txt", "chmod 644 secret.txt", "chmod 006 secret.txt"],
      accepts: ["chmod 0600 secret.txt", "chmod u=rw,go= secret.txt", "chmod u=rw,g=,o= secret.txt"],
      explain: "所有者は `rw-` = 6、グループとその他は 0 なので 600 です。700 だと実行権限もついてしまいます。",
      ref: "chmod"
    },
    {
      id: "r10", q: "全員(所有者・グループ・その他)に、notes.txt の読み取り権限を追加するコマンドは?",
      choices: ["chmod a+r notes.txt", "chmod a-r notes.txt", "chmod u+r notes.txt", "chmod a+w notes.txt"],
      accepts: ["chmod +r notes.txt", "chmod ugo+r notes.txt"],
      explain: "`a` は all(全員)です。`ugo` と書いても同じです。",
      ref: "chmod"
    },
    {
      id: "r11", q: "グループとその他の人から、shared.txt の書き込み権限を外すコマンドは?",
      choices: ["chmod go-w shared.txt", "chmod go+w shared.txt", "chmod u-w shared.txt", "chmod go-x shared.txt"],
      accepts: ["chmod og-w shared.txt", "chmod g-w,o-w shared.txt", "chmod o-w,g-w shared.txt"],
      explain: "`g` がグループ、`o` がその他(others)、`-w` が書き込みを外す指定です。",
      ref: "chmod"
    },
    {
      id: "r12", q: "notes.txt の権限・所有者・サイズを確認するコマンドは?",
      choices: ["ls -l notes.txt", "ls notes.txt", "chmod notes.txt", "cat -l notes.txt"],
      accepts: ["ls -la notes.txt", "ls -al notes.txt", "ls -lh notes.txt", "ls -hl notes.txt", "stat notes.txt"],
      explain: "`ls -l` の詳しい形式で、権限・所有者・グループ・サイズ・更新日時がわかります。",
      ref: "perm"
    },
    {
      id: "r13", q: "管理者権限で、file.txt の所有者を taro に変えるコマンドは?",
      choices: ["sudo chown taro file.txt", "sudo chmod taro file.txt", "sudo chgrp taro file.txt", "sudo chown file.txt taro"],
      explain: "`chown 新しい所有者 ファイル` の順です。`chgrp` はグループを変えるコマンドです。所有者の変更にはふつう管理者権限がいるので `sudo` をつけます。",
      ref: "chown"
    },
    {
      id: "r14", q: "管理者権限で、file.txt の所有者を taro、グループを staff に一度に変えるコマンドは?",
      choices: ["sudo chown taro:staff file.txt", "sudo chown staff:taro file.txt", "sudo chmod taro:staff file.txt", "sudo chown taro staff file.txt"],
      explain: "`所有者:グループ` の順に `:` でつなぎます。`taro staff file.txt` と空白で区切ると、staff と file.txt の2つのファイルの所有者を taro にする意味になります。",
      ref: "chown"
    },
    {
      id: "r15", q: "管理者権限で、/srv/app とその下にあるすべてのファイルの所有者を taro に変えるコマンドは?",
      choices: ["sudo chown -R taro /srv/app", "sudo chown taro /srv/app", "sudo chown -r taro /srv/app", "sudo chmod -R taro /srv/app"],
      accepts: ["sudo chown -R taro /srv/app/", "sudo chown --recursive taro /srv/app"],
      explain: "下の階層までまとめて変えるのは `-R`(大文字)です。`chown` の `-r`(小文字)はエラーになります。",
      ref: "chown"
    },
    {
      id: "r16", q: "/etc/hosts を保存しようとしたら Permission denied になりました。管理者権限で nano を使って /etc/hosts を編集するコマンドは?",
      choices: ["sudo nano /etc/hosts", "nano -r /etc/hosts", "chmod 777 /etc/hosts", "su nano /etc/hosts"],
      explain: "`sudo` をつけると、そのコマンドだけを管理者(root)の権限で実行できます。`chmod 777` で権限を広げるのは危険で、そもそも一般ユーザーには変えられません。",
      ref: "sudo"
    }
  ]
});


// =====================================================================
// 06 パイプとリダイレクト
// =====================================================================
LNX.register("pipes", {
  commands: [
    {
      id: "pipe", name: "|", read: "パイプ",
      desc: "左のコマンドの出力を、右のコマンドの入力に渡します。小さなコマンドをつないで仕事をさせます。",
      examples: [
        ["ls -l | less", "長い一覧を less で読む"],
        ["ps aux | grep nginx", "nginx を含む行だけ"],
        ["ls -lt | head -n 5", "新しい順の先頭5件"]
      ]
    },
    {
      id: "redirect", name: "> >> <", read: "リダイレクト",
      desc: "出力をファイルへ書き出したり、ファイルを入力にしたりします。`>` は上書き、`>>` は末尾に追記です。",
      examples: [
        ["ls > files.txt", "結果をファイルに保存(上書き)"],
        ["echo done >> log.txt", "末尾に1行追記"],
        ["wc -l < data.txt", "ファイルを標準入力として渡す"]
      ],
      options: [
        [">", "標準出力をファイルへ(上書き)"],
        [">>", "標準出力をファイルの末尾へ追記"],
        ["<", "ファイルを標準入力にする"]
      ]
    },
    {
      id: "stderr", name: "2> 2>&1", read: "標準エラー出力",
      desc: "エラーメッセージは、ふつうの出力(標準出力 = 1番)とは別の、標準エラー出力(2番)に出ます。`2>` でエラーだけを、`> file 2>&1` で両方をファイルへ送れます。",
      examples: [
        ["make 2> err.txt", "エラーだけを保存"],
        ["make > all.log 2>&1", "出力もエラーもまとめて保存"],
        ["make &> all.log", "上と同じ(bash の書き方)"]
      ],
      options: [
        ["2>", "標準エラー出力をファイルへ"],
        ["2>&1", "標準エラー出力を、標準出力と同じ行き先へ"],
        ["&>", "標準出力と標準エラー出力の両方をファイルへ(bash)"]
      ]
    },
    {
      id: "devnull", name: "/dev/null", read: "ヌルデバイス",
      desc: "書き込んだものがすべて捨てられる特別なファイルです。いらない出力を消すときに使います。",
      examples: [
        ["find / -name hosts 2> /dev/null", "エラー表示だけ捨てる"],
        ["cmd > /dev/null 2>&1", "すべての出力を捨てる"]
      ]
    },
    {
      id: "sort", name: "sort", read: "並べ替え",
      desc: "行を並べ替えます。何も指定しなければ文字の順です。",
      examples: [
        ["sort names.txt", "行を文字の順に"],
        ["sort -u names.txt", "並べ替えて重複を除く"],
        ["sort -rn counts.txt", "数として大きい順に"]
      ],
      options: [["-n", "数として比べる"], ["-r", "逆順"], ["-u", "重複した行を1つにする"]]
    },
    {
      id: "uniq", name: "uniq", read: "unique",
      desc: "隣り合った同じ行を1つにまとめます。離れた重複は消えないので、ふつうは先に `sort` します。",
      examples: [
        ["sort names.txt | uniq", "重複を除く"],
        ["sort access.txt | uniq -c | sort -rn", "出てくる回数の多い順"]
      ],
      options: [["-c", "各行の前に、何回続いたかを表示"], ["-d", "重複している行だけを表示"]]
    }
  ],
  questions: [
    {
      id: "i01", q: "ls -l の長い結果を、less で1画面ずつ読むコマンドは?",
      choices: ["ls -l | less", "ls -l > less", "ls -l & less", "less | ls -l"],
      explain: "`|`(パイプ)は左の出力を右の入力に渡します。`> less` と書くと、less という名前のファイルに保存してしまいます。",
      ref: "pipe"
    },
    {
      id: "i02", q: "ls の結果を files.txt に保存する(すでにあれば上書きする)コマンドは?",
      choices: ["ls > files.txt", "ls >> files.txt", "ls | files.txt", "ls < files.txt"],
      accepts: ["ls 1> files.txt"],
      explain: "`>` は上書き、`>>` は追記です。`| files.txt` は files.txt を「コマンド」として実行しようとします。",
      ref: "redirect"
    },
    {
      id: "i03", q: "log.txt の末尾に、done という1行を追加するコマンドは?",
      choices: ["echo done >> log.txt", "echo done > log.txt", "echo done << log.txt", "echo done | log.txt"],
      explain: "`>>` は末尾への追記です。`>` だと、それまでの中身が消えて done だけになります。",
      ref: "redirect"
    },
    {
      id: "i04", q: "data.txt を、wc -l の標準入力として渡す(< を使う)コマンドは?",
      choices: ["wc -l < data.txt", "wc -l > data.txt", "wc -l << data.txt", "wc -l | data.txt"],
      explain: "`<` はファイルを標準入力にします。`> data.txt` と書くと、data.txt が空で上書きされてしまいます。",
      ref: "redirect"
    },
    {
      id: "i05", q: "> と >> の違いは?", kind: "text",
      choices: ["> は上書きし、>> は末尾に追記する", "> は追記し、>> は上書きする", "> はファイルに、>> は画面に出す", "違いはなく、どちらも上書きする"],
      explain: "`>` はファイルの中身を消してから書き込みます。ログのように残したいものには `>>` を使います。",
      ref: "redirect"
    },
    {
      id: "i06", q: "make で出るエラーメッセージ(標準エラー出力)だけを err.txt に保存するコマンドは?",
      choices: ["make 2> err.txt", "make > err.txt", "make 1> err.txt", "make &> err.txt"],
      explain: "エラーは2番(標準エラー出力)に出るので `2>` で保存します。`>` や `1>` はふつうの出力だけ、`&>` は両方です。",
      ref: "stderr"
    },
    {
      id: "i07", q: "make のふつうの出力とエラーの両方を、all.log にまとめて保存するコマンドは?",
      choices: ["make > all.log 2>&1", "make 2>&1 > all.log", "make > all.log 2>1", "make 2> all.log"],
      accepts: ["make &> all.log", "make >& all.log", "make 1> all.log 2>&1"],
      explain: "まず `> all.log` で出力をファイルへ向け、次に `2>&1` でエラーを同じ行き先へ送ります。`2>&1 > all.log` の順だと、エラーは画面に出たままです。`2>1` は 1 という名前のファイルを作ります。",
      ref: "stderr"
    },
    {
      id: "i08", q: "2>&1 の意味は?", kind: "text",
      choices: ["標準エラー出力を、標準出力と同じ行き先へ送る", "標準出力を2回くり返して出す", "2番目のファイルを1番目のファイルに追記する", "エラーが起きたら終了コード1を返す"],
      explain: "1 は標準出力、2 は標準エラー出力の番号です。`&1` は「1番と同じところ」という意味です。",
      ref: "stderr"
    },
    {
      id: "i09", q: "find / -name hosts で大量に出るエラー表示を捨てて、見つかった結果だけを画面に出すコマンドは?",
      choices: ["find / -name hosts 2> /dev/null", "find / -name hosts > /dev/null", "find / -name hosts 2> null", "find / -name hosts | /dev/null"],
      explain: "`/dev/null` に送ったものは捨てられます。エラーだけを捨てたいので `2>` を使います。`> /dev/null` だと、肝心の結果のほうが消えます。",
      ref: "devnull"
    },
    {
      id: "i10", q: "cmd > /dev/null 2>&1 を実行すると、どうなる?", kind: "text",
      choices: ["ふつうの出力もエラーも捨てられ、画面に何も出ない", "エラーだけが画面に出る", "出力が null というファイルに保存される", "cmd が2回実行される"],
      explain: "`> /dev/null` で出力を捨て、`2>&1` でエラーも同じところ(/dev/null)へ送るので、何も表示されません。",
      ref: "devnull"
    },
    {
      id: "i11", q: "names.txt の行を並べ替えて、重複した行を除いて表示するコマンドは?",
      choices: ["sort names.txt | uniq", "uniq names.txt | sort", "sort names.txt > uniq", "sort | uniq names.txt"],
      accepts: ["sort -u names.txt", "cat names.txt | sort | uniq", "sort < names.txt | uniq"],
      explain: "`uniq` は隣り合った同じ行しかまとめないので、先に `sort` で同じ行を隣に集めます。`sort -u` でも同じ結果です。`> uniq` は uniq というファイルに保存してしまいます。",
      ref: "uniq"
    },
    {
      id: "i12", q: "uniq names.txt だけでは重複が残ることがあるのは、なぜ?", kind: "text",
      choices: ["uniq は隣り合った同じ行だけをまとめるから", "uniq は大文字小文字を区別しないから", "uniq は最初の100行しか見ないから", "uniq は空白を含む行を無視するから"],
      explain: "離れた場所にある同じ行はまとめられません。そのため `sort | uniq` の形で使います。",
      ref: "uniq"
    },
    {
      id: "i13", q: "access.txt の各行が何回出てくるかを数え、多い順に並べるコマンドは?",
      choices: ["sort access.txt | uniq -c | sort -rn", "sort access.txt | uniq -c | sort", "uniq -c access.txt | sort -rn", "sort access.txt | uniq -d | sort -rn"],
      accepts: ["sort access.txt | uniq -c | sort -nr", "sort access.txt | uniq -c | sort -n -r", "sort access.txt | uniq -c | sort -r -n", "cat access.txt | sort | uniq -c | sort -rn", "cat access.txt | sort | uniq -c | sort -nr"],
      explain: "`sort` で同じ行を集め、`uniq -c` で回数をつけ、`sort -rn` で数の大きい順にします。ログの集計でよく使う形です。",
      ref: "uniq"
    },
    {
      id: "i14", q: "実行中のプロセスの一覧から、nginx を含む行だけを表示するコマンドは?",
      choices: ["ps aux | grep nginx", "ps aux > grep nginx", "grep nginx | ps aux", "ps aux & grep nginx"],
      accepts: ["ps -ef | grep nginx"],
      explain: "`ps aux` の出力をパイプで `grep` に渡し、nginx を含む行だけにします。",
      ref: "pipe"
    },
    {
      id: "i15", q: "ls -lt の結果の、先頭5行だけを表示するコマンドは?",
      choices: ["ls -lt | head -n 5", "ls -lt | tail -n 5", "ls -lt > head -n 5", "head -n 5 | ls -lt"],
      accepts: ["ls -lt | head -5", "ls -lt | head -n5", "ls -tl | head -n 5", "ls -tl | head -5"],
      explain: "パイプで `head` に渡すと、先頭だけが残ります。`ls -lt` は新しい順なので、最近変更した5件がわかります。",
      ref: "pipe"
    }
  ]
});


// =====================================================================
// 07 プロセス
// =====================================================================
LNX.register("processes", {
  commands: [
    {
      id: "ps", name: "ps", read: "process status",
      desc: "実行中のプロセスを表示します。オプションなしでは、今の端末のものだけが出ます。",
      examples: [
        ["ps aux", "すべてのプロセスを詳しく"],
        ["ps aux | grep nginx", "名前で絞り込む"]
      ],
      options: [["aux", "全ユーザーのすべてのプロセスを、CPU やメモリの使用率つきで"], ["-ef", "すべてのプロセスを別の形式で"]]
    },
    {
      id: "top", name: "top", read: "上位",
      desc: "CPU やメモリをたくさん使っているプロセスを、リアルタイムに表示し続けます。",
      examples: [["top", "q で終了"]],
      options: [["q", "終了"], ["M", "メモリ使用率の順"], ["P", "CPU 使用率の順"]]
    },
    {
      id: "kill", name: "kill", read: "シグナルを送る",
      desc: "プロセスにシグナルを送ります。何も指定しなければ、終了を頼む SIGTERM(15)です。応じないときだけ SIGKILL(9)で強制終了します。",
      examples: [
        ["kill 1234", "PID 1234 に終了を頼む(SIGTERM)"],
        ["kill -9 1234", "強制終了(SIGKILL)"],
        ["kill %1", "ジョブ番号1を終了"]
      ],
      options: [["-15 / -TERM", "終了を頼む(省略したときと同じ)"], ["-9 / -KILL", "強制終了。後片付けをさせずに止める"]]
    },
    {
      id: "pkill", name: "pkill / pgrep", read: "名前で kill / 名前で探す",
      desc: "PID のかわりに、プロセスの名前で指定します。`pgrep` は PID を表示し、`pkill` はシグナルを送ります。",
      examples: [
        ["pgrep nginx", "nginx の PID を表示"],
        ["pkill firefox", "firefox をまとめて終了"]
      ]
    },
    {
      id: "jobs", name: "& jobs fg bg", read: "ジョブ管理",
      desc: "コマンドの最後に `&` をつけると、バックグラウンドで実行して端末をすぐ使えます。`jobs` で一覧、`fg` で手前に戻し、`bg` で止まったジョブを裏で再開します。",
      examples: [
        ["sleep 300 &", "裏で実行。[1] 4321 のように出る"],
        ["jobs", "ジョブの一覧"],
        ["fg %1", "ジョブ1を手前(フォアグラウンド)へ"],
        ["bg %1", "止まっているジョブ1を裏で再開"]
      ],
      options: [["%1", "ジョブ番号1"], ["[1] 4321", "[ジョブ番号] PID"]]
    },
    {
      id: "keys", name: "Ctrl+C / Ctrl+Z", read: "端末のキー操作",
      desc: "`Ctrl+C` は実行中のコマンドを中断して終わらせます。`Ctrl+Z` は一時停止し、ジョブとして残します(`fg` か `bg` で再開)。",
      examples: [["fg", "Ctrl+Z で止めたものを再開"]],
      options: [["Ctrl+C", "中断(SIGINT)"], ["Ctrl+Z", "一時停止(SIGTSTP)"], ["Ctrl+L", "画面を消す(clear と同じ)"]]
    }
  ],
  questions: [
    {
      id: "o01", q: "すべてのユーザーの、実行中のすべてのプロセスを詳しく表示するコマンドは?",
      choices: ["ps aux", "ps", "jobs", "kill -l"],
      accepts: ["ps -ef"],
      explain: "`ps aux` は全ユーザーのすべてのプロセスを CPU・メモリ使用率つきで表示します。`ps` だけでは今の端末のものしか出ません。`kill -l` はシグナルの一覧です。",
      ref: "ps"
    },
    {
      id: "o02", q: "CPU やメモリを多く使っているプロセスを、リアルタイムに表示し続けるコマンドは?",
      choices: ["top", "ps", "jobs", "uptime"],
      accepts: ["htop"],
      explain: "`top` は数秒ごとに表示を更新します。`ps` はその瞬間の一覧を1回出すだけです。見やすい `htop` も使えますが、環境によっては別にインストールが必要です。",
      ref: "top"
    },
    {
      id: "o03", q: "top を終了するキーは?", kind: "code",
      choices: ["q", "Ctrl+Z", "Enter", ":q"],
      explain: "`top` は `q` で終わります。`Ctrl+Z` だと一時停止してジョブとして残ります。",
      ref: "top"
    },
    {
      id: "o04", q: "次の表示で、2列目(1、2 の列)は何?", kind: "text",
      term: "$ ps aux | head -3\nUSER  PID %CPU %MEM ... COMMAND\nroot    1  0.0  0.1 ... /sbin/init\nroot    2  0.0  0.0 ... [kthreadd]",
      choices: ["プロセスID(PID)", "CPU 使用率", "メモリ使用率", "起動した回数"],
      explain: "2列目の PID は、プロセスにつけられた番号です。`kill` で止めるときはこの番号を使います。",
      ref: "ps"
    },
    {
      id: "o05", q: "PID が 1234 のプロセスに、ふつうの終了シグナル(SIGTERM)を送るコマンドは?",
      choices: ["kill 1234", "kill -9 1234", "stop 1234", "exit 1234"],
      accepts: ["kill -15 1234", "kill -TERM 1234", "kill -SIGTERM 1234", "kill -s TERM 1234", "kill -s SIGTERM 1234", "kill -s 15 1234", "kill -n 15 1234"],
      explain: "`kill PID` は、何も指定しなければ SIGTERM(15)を送ります。プログラムは後片付けをしてから終われます。`-9` は強制終了です。",
      ref: "kill"
    },
    {
      id: "o06", q: "kill 1234 で終わらないプロセスを、強制終了するコマンドは?",
      choices: ["kill -9 1234", "kill 1234", "kill -1 1234", "exit -9 1234"],
      accepts: ["kill -KILL 1234", "kill -SIGKILL 1234", "kill -s KILL 1234", "kill -s SIGKILL 1234", "kill -s 9 1234", "kill -n 9 1234"],
      explain: "`-9` は SIGKILL で、プロセスはこれを無視できません。`-1` は SIGHUP で、設定の読み直しなどに使うシグナルです。",
      ref: "kill"
    },
    {
      id: "o07", q: "最初から kill -9 を使わず、まずふつうの kill を試すのはなぜ?", kind: "text",
      choices: ["-9 だと後片付けをする機会がなく、データが壊れることがあるから", "-9 を使うと必ずパソコンが再起動するから", "-9 は1日に1回しか使えないから", "-9 は自分のプロセスには使えないから"],
      explain: "SIGTERM なら、プログラムはファイルの保存などを終えてから止まれます。SIGKILL はその場で止めるので、書きかけのデータが壊れることがあります。",
      ref: "kill"
    },
    {
      id: "o08", q: "名前が firefox のプロセスを、名前を指定してまとめて終了するコマンドは?",
      choices: ["pkill firefox", "kill firefox", "stop firefox", "jobs -k firefox"],
      accepts: ["killall firefox"],
      explain: "`pkill` は名前でプロセスを選んでシグナルを送ります。`kill` は PID かジョブ番号しか受け付けないので、`kill firefox` はエラーです。",
      ref: "pkill"
    },
    {
      id: "o09", q: "nginx という名前のプロセスの PID だけを表示するコマンドは?",
      choices: ["pgrep nginx", "pkill nginx", "jobs nginx", "kill -l nginx"],
      accepts: ["pidof nginx"],
      explain: "`pgrep` は名前に合うプロセスの PID を表示します。`pkill` だと止めてしまうので注意します。",
      ref: "pkill"
    },
    {
      id: "o10", q: "sleep 100 を、端末をすぐ使える状態のままバックグラウンドで実行するコマンドは?",
      choices: ["sleep 100 &", "sleep 100 |", "bg sleep 100", "sleep 100 &&"],
      accepts: ["sleep 100&"],
      explain: "コマンドの最後に `&` をつけると、バックグラウンドで実行されます。`&&` は「前が成功したら次を実行」という別の記号です。",
      ref: "jobs"
    },
    {
      id: "o11", q: "次の表示で、4321 は何?", kind: "text",
      term: "$ sleep 300 &\n[1] 4321",
      choices: ["プロセスID(PID)", "ジョブ番号", "残りの秒数", "終了コード"],
      explain: "`[1]` がジョブ番号、`4321` が PID です。`kill %1` でも `kill 4321` でも、このプロセスを止められます。",
      ref: "jobs"
    },
    {
      id: "o12", q: "この端末で動いているジョブ(バックグラウンドや停止中のもの)の一覧を表示するコマンドは?",
      choices: ["jobs", "ps aux", "fg", "bg"],
      accepts: ["jobs -l"],
      explain: "`jobs` は、今のシェルから起動したジョブを `[1]+ Running sleep 300 &` のように表示します。",
      ref: "jobs"
    },
    {
      id: "o13", q: "ジョブ番号1のジョブを、フォアグラウンド(手前)に戻すコマンドは?",
      choices: ["fg %1", "bg %1", "jobs %1", "kill %1"],
      accepts: ["fg 1", "%1"],
      explain: "`fg`(foreground)で手前に戻すと、また `Ctrl+C` などで操作できます。`bg` は裏で再開、`kill %1` は終了です。",
      ref: "jobs"
    },
    {
      id: "o14", q: "Ctrl+Z で止めたジョブ1を、バックグラウンドで動かし直すコマンドは?",
      choices: ["bg %1", "fg %1", "jobs %1", "start %1"],
      accepts: ["bg 1"],
      explain: "`bg`(background)は、止まっているジョブを裏で再開します。`fg` だと手前で再開します。",
      ref: "jobs"
    },
    {
      id: "o15", q: "コマンドの実行中に Ctrl+Z を押すと、どうなる?", kind: "text",
      choices: ["一時停止し、ジョブとして残る", "強制終了して消える", "直前の入力を取り消す", "端末の画面が消える"],
      explain: "`Ctrl+Z` は一時停止です。`fg` で手前に、`bg` で裏で再開できます。止めたまま放っておくと残り続けます。",
      ref: "keys"
    },
    {
      id: "o16", q: "コマンドの実行中に Ctrl+C を押すと、どうなる?", kind: "text",
      choices: ["実行中のコマンドが中断され、終了する", "画面の文字がコピーされる", "一時停止し、ジョブとして残る", "ログアウトする"],
      explain: "`Ctrl+C` は中断のシグナル(SIGINT)を送ります。端末で文字をコピーするのは、ふつう `Ctrl+Shift+C` です。",
      ref: "keys"
    }
  ]
});


// =====================================================================
// 08 パッケージ・その他
// =====================================================================
LNX.register("packages", {
  commands: [
    {
      id: "apt", name: "apt", read: "Advanced Package Tool",
      desc: "Ubuntu や Debian で、ソフト(パッケージ)を入れたり、更新したり、消したりします。変更する操作には `sudo` が必要です。",
      examples: [
        ["sudo apt update", "パッケージの一覧を最新にする"],
        ["sudo apt upgrade", "入っているパッケージを新しくする"],
        ["sudo apt install tree", "tree を入れる"],
        ["sudo apt remove tree", "tree を消す"],
        ["apt search tree", "パッケージを探す"]
      ],
      options: [
        ["update", "どんな版があるかの一覧だけを取り直す(ソフトは変わらない)"],
        ["upgrade", "入っているパッケージを新しい版にする"],
        ["install", "パッケージを入れる"],
        ["remove / purge", "消す / 設定ファイルも消す"],
        ["-y", "「続けますか?」に自動で yes と答える"]
      ]
    },
    {
      id: "sudo", name: "sudo", read: "superuser do",
      desc: "後ろに書いたコマンドだけを、管理者(root)の権限で実行します。Ubuntu では自分のパスワードを聞かれます。",
      examples: [
        ["sudo apt update", "管理者権限で apt を実行"],
        ["sudo nano /etc/hosts", "設定ファイルを編集"]
      ]
    },
    {
      id: "man", name: "man", read: "manual",
      desc: "コマンドの説明書(マニュアル)を表示します。中の操作は `less` と同じで、`q` で終わります。",
      examples: [["man ls", "ls のマニュアル"], ["man -k copy", "説明に copy を含むコマンドを探す"]]
    },
    {
      id: "help", name: "--help", read: "ヘルプ",
      desc: "多くのコマンドは `--help` をつけると、使い方とオプションの一覧を短く表示します。",
      examples: [["ls --help", "ls の使い方"], ["ls --help | less", "長いときは less で読む"]]
    },
    {
      id: "which", name: "which", read: "どれ",
      desc: "コマンド名を打ったときに実行されるプログラムが、どこにあるかを表示します。",
      examples: [["which python3", "例: /usr/bin/python3"]]
    },
    {
      id: "echo", name: "echo", read: "こだま",
      desc: "後ろに書いた文字をそのまま表示します。`$` をつけると変数の中身を表示します。",
      examples: [["echo hello", "hello と表示"], ["echo $HOME", "ホームディレクトリのパス"]]
    },
    {
      id: "env", name: "$PATH $HOME export", read: "環境変数",
      desc: "環境変数は、シェルやプログラムが参照する設定の値です。`$名前` で中身を使い、`export` で、このシェルから起動するプログラムにも引き継ぎます。",
      examples: [
        ["echo $PATH", "コマンドを探すディレクトリの一覧"],
        ["export EDITOR=vim", "EDITOR を設定して引き継ぐ"],
        ["export PATH=\"$HOME/bin:$PATH\"", "PATH の先頭に ~/bin を足す"],
        ["printenv", "環境変数の一覧"]
      ],
      options: [
        ["$HOME", "ホームディレクトリ"],
        ["$PATH", "コマンドを探すディレクトリを : で区切った一覧"],
        ["$USER", "ユーザー名"],
        ["名前=値", "= の前後に空白を入れない"]
      ]
    },
    {
      id: "history", name: "history", read: "履歴",
      desc: "これまでに実行したコマンドの履歴を、番号つきで表示します。上矢印キーでも前のコマンドを呼び出せます。",
      examples: [["history", "履歴の一覧"], ["history | grep apt", "apt を使った履歴だけ"]]
    },
    {
      id: "clear", name: "clear", read: "消す",
      desc: "端末の画面を消して、いちばん上から表示します。`Ctrl+L` でも同じです。",
      examples: [["clear", "画面を消す"]]
    },
    {
      id: "whoami", name: "whoami", read: "who am I",
      desc: "今ログインしている(コマンドを実行している)ユーザーの名前を表示します。",
      examples: [["whoami", "例: taro"], ["sudo whoami", "root と表示される"]]
    }
  ],
  questions: [
    {
      id: "k01", q: "インストールできるパッケージの一覧(どの版があるか)を最新にするコマンドは?",
      choices: ["sudo apt update", "sudo apt upgrade", "sudo apt install", "apt list"],
      accepts: ["sudo apt-get update"],
      explain: "`apt update` は一覧を取り直すだけで、ソフトそのものは変わりません。入れる・更新する前に実行します。一覧の更新にも管理者権限(`sudo`)が必要です。",
      ref: "apt"
    },
    {
      id: "k02", q: "パッケージの tree をインストールするコマンドは?",
      choices: ["sudo apt install tree", "apt install tree", "sudo apt get tree", "sudo apt update tree"],
      accepts: ["sudo apt-get install tree", "sudo apt install -y tree", "sudo apt-get install -y tree", "sudo apt -y install tree", "sudo apt install tree -y", "sudo apt-get install tree -y"],
      explain: "インストールはシステムを変えるので `sudo` が必要です。つけないと「権限がありません」と言われます。",
      ref: "apt"
    },
    {
      id: "k03", q: "入っているパッケージを、新しい版に更新するコマンドは?",
      choices: ["sudo apt upgrade", "sudo apt update", "sudo apt install", "sudo apt renew"],
      accepts: ["sudo apt-get upgrade", "sudo apt upgrade -y", "sudo apt -y upgrade", "sudo apt-get upgrade -y", "sudo apt full-upgrade"],
      explain: "`upgrade` が実際の更新です。ふつうは `sudo apt update` のあとに実行します。",
      ref: "apt"
    },
    {
      id: "k04", q: "apt update と apt upgrade の違いは?", kind: "text",
      choices: ["update は一覧を最新にするだけで、upgrade が入っているソフトを新しくする", "update がソフトを新しくし、upgrade は一覧を最新にするだけ", "どちらも同じ働きをする", "update は apt 自身だけを、upgrade はすべてを新しくする"],
      explain: "名前が似ていますが、`update` は情報の取り直し、`upgrade` は実際の更新です。",
      ref: "apt"
    },
    {
      id: "k05", q: "インストールしてある tree パッケージを削除するコマンドは?",
      choices: ["sudo apt remove tree", "sudo apt delete tree", "sudo rm tree", "sudo apt uninstall tree"],
      accepts: ["sudo apt-get remove tree", "sudo apt purge tree", "sudo apt-get purge tree", "sudo apt remove -y tree", "sudo apt remove tree -y", "sudo apt-get remove tree -y"],
      explain: "パッケージの削除は `apt remove` です。`purge` を使うと設定ファイルも消します。`rm` はファイルを消すコマンドで、パッケージは消せません。",
      ref: "apt"
    },
    {
      id: "k06", q: "sudo をつけてコマンドを実行すると、どうなる?", kind: "text",
      choices: ["そのコマンドだけが管理者(root)の権限で実行される", "コマンドが速く実行される", "コマンドがバックグラウンドで実行される", "一度ログアウトして root として入り直す"],
      explain: "`sudo` は後ろのコマンドだけを管理者権限で動かします。Ubuntu では自分のパスワードを聞かれます。",
      ref: "sudo"
    },
    {
      id: "k07", q: "ls コマンドのマニュアル(説明書)を表示するコマンドは?",
      choices: ["man ls", "help ls", "ls -m", "manual ls"],
      explain: "`man` で開いたマニュアルは `less` と同じ操作で読み、`q` で閉じます。bash の `help` はシェルに組みこまれた命令の説明用で、`ls` には使えません。",
      ref: "man"
    },
    {
      id: "k08", q: "ls の使い方とオプションの一覧を、短く表示するコマンドは?",
      choices: ["ls --help", "ls -help", "ls help", "man --ls"],
      explain: "`--help` はハイフン2つです。`ls -help` は `-h` `-e` …の短いオプションの組み合わせと読まれ、エラーになります。",
      ref: "help"
    },
    {
      id: "k09", q: "python3 と打ったときに実行されるプログラムが、どこにあるかを表示するコマンドは?",
      choices: ["which python3", "where python3", "pwd python3", "find python3"],
      accepts: ["command -v python3", "type python3", "type -p python3"],
      explain: "`which` は PATH の中を探して、`/usr/bin/python3` のように場所を表示します。`where` は bash にはありません。",
      ref: "which"
    },
    {
      id: "k10", q: "環境変数を使って、ホームディレクトリのパスを表示するコマンドは?",
      choices: ["echo $HOME", "echo HOME", "echo $home", "echo %HOME%"],
      accepts: ["echo \"$HOME\"", "echo ${HOME}", "echo \"${HOME}\"", "printenv HOME"],
      explain: "変数の中身は `$名前` で取り出します。名前は大文字小文字を区別するので `$home` は空です。`%HOME%` は Windows の書き方です。",
      ref: "env"
    },
    {
      id: "k11", q: "環境変数 PATH の役割は?", kind: "text",
      choices: ["コマンド名だけで実行するときに、プログラムを探すディレクトリの一覧", "ホームディレクトリの場所", "今いるディレクトリの場所", "前回実行したコマンドの記録"],
      explain: "`ls` と打つと、シェルは PATH に `:` 区切りで並んだディレクトリを順に探して `/usr/bin/ls` を見つけます。",
      ref: "env"
    },
    {
      id: "k12", q: "環境変数 EDITOR に vim を設定し、このシェルから起動するプログラムにも引き継ぐコマンドは?",
      choices: ["export EDITOR=vim", "EDITOR = vim", "set EDITOR=vim", "export $EDITOR=vim"],
      accepts: ["EDITOR=vim; export EDITOR", "EDITOR=vim;export EDITOR"],
      explain: "`export 名前=値` です。`=` の前後に空白を入れると、EDITOR というコマンドを実行しようとしてしまいます。名前には `$` をつけません。",
      ref: "env"
    },
    {
      id: "k13", q: "PATH の先頭に ~/bin を足す(今までの PATH は残す)書き方は?", noInput: true,
      choices: ["export PATH=\"$HOME/bin:$PATH\"", "export PATH=\"$HOME/bin\"", "export $PATH=\"$HOME/bin:$PATH\"", "PATH = \"$HOME/bin:$PATH\""],
      explain: "`:$PATH` で今までの値を後ろにつなげます。`PATH=\"$HOME/bin\"` だけにすると、ls なども見つからなくなります。",
      ref: "env"
    },
    {
      id: "k14", q: "これまでに実行したコマンドの履歴を、番号つきで表示するコマンドは?",
      choices: ["history", "jobs", "last", "log"],
      explain: "`history` で履歴を表示します。`last` はログインした記録、`jobs` は実行中のジョブです。",
      ref: "history"
    },
    {
      id: "k15", q: "端末の画面に出ている文字を消して、すっきりさせるコマンドは?",
      choices: ["clear", "cls", "clean", "exit"],
      explain: "`clear` で画面を消します(`Ctrl+L` でも同じ)。`cls` は Windows のコマンド、`exit` はシェルを終了します。",
      ref: "clear"
    },
    {
      id: "k16", q: "今ログインしているユーザーの名前を表示するコマンドは?",
      choices: ["whoami", "pwd", "hostname", "id -g"],
      accepts: ["id -un", "id -nu", "echo $USER", "echo \"$USER\""],
      explain: "`whoami` はユーザー名を表示します。`hostname` はコンピューターの名前、`id -g` はグループの番号です。",
      ref: "whoami"
    }
  ]
});

// 中学国語道場: 学年・分野・単元の定義と、学年別ファイル(data-g1.js など)が中身を登録するための入れ物。
// 例文・古文・漢文などの表示部品を組み立てる関数も、このファイルに置く。
// 読み込む順番: shared/store.js → data.js → data-g1.js → data-g2.js → data-g3.js
//
// ■ 学年を足すとき(中2・中3)
//   1. 下の GRADES に学年を、UNITS に単元を足す(ID は "g2-…")。
//   2. data-g2.js を作り、index.html と reference.html の <script> に足す。
//   学年が2つ以上になると、道場の学年タブが自動で出る。
//
// ■ 単元の中身の登録(学年別ファイルに書く)
//   JHJ.register("単元ID", {
//     points:  ["要点のHTML", …],            // 3〜5個。大事な言葉は JHJ.rule(...) で包む
//     example: { title: "問いのHTML", steps: ["考え方のHTML", …], result: "答えのHTML" },
//     fixed:   [ 問題, … ]                    // 固定の4択問題。id をつける
//   });
//
// ■ 問題の形
//   {
//     id: "f1",                  // 必須。単元の中で重ならない名前
//     text: "問いの文のHTML",     // 必須
//     material: "教材のHTML",     // 省略可。例文(JHJ.reibun)、古文(JHJ.kobun)、漢文(JHJ.kanbun)、大きい漢字(JHJ.glyph)
//     choices: ["…", "…", "…", "…"],   // 必須。ちょうど4つ、すべて異なること。並びはページが毎回まぜる
//     answer: 0,                 // 必須。choices の中の正解の番号(0〜3)
//     explain: ["解説の1行目", "2行目", …],   // 必須。1行ずつ表示される
//     choiceLayout: "grid"       // 省略可。選択肢が短い語(品詞名、画数、漢字1字)のとき2列にする
//   }
//
// ■ 表示部品(見た目のCSSは index.html と reference.html の「国語の表示部品」にある)
//   JHJ.u("走って")            傍線         JHJ.u("きれいな", "①")  番号つきの傍線
//   JHJ.bunsetsu(["わたしは", "毎朝", "走る。"])        文節の区切り(/)
//   JHJ.bunsetsu(["犬", "が", "走る。"], "|")           単語の区切り(|)
//   JHJ.r("翁", "おきな")      ふりがな
//   JHJ.reibun("…")            例文ブロック。配列を渡すと1文ずつ段落にする
//   JHJ.kobun({ gen: "原文", yaku: "現代語訳", src: "出典" })      yaku と src は省略可
//   JHJ.kanbun({ lines: [[ ["百"], ["聞", "ハ"], ["不", "", "レ"], "。" ]], kaki: "書き下し文", yaku: "意味" })
//       1行 = 配列。1字 = [漢字, 送り仮名, 返り点](うしろ2つは省略可)。句読点は文字列で書く。
//       1つの漢文は4行まで、1行は漢字7字まで。
//   JHJ.glyph("遠")            大きい漢字。JHJ.glyph("休林", true) で小さめに並べる
var JHJ = (function () {
  "use strict";

  var STATS_KEY = "juniorHighJapaneseStats";
  var SETTINGS_KEY = "juniorHighJapaneseSettings";
  var COUNTS = [5, 10, 20];

  var GRADES = [
    { id: "g1", short: "中1", name: "中学1年" },
    { id: "g2", short: "中2", name: "中学2年" },
    { id: "g3", short: "中3", name: "中学3年" }
  ];

  // 分野。設定画面の小見出し、要点帳の目次、成績の「分野ごとの正答率」は、この順に並ぶ
  var AREAS = ["文法", "漢字", "語句", "古典"];

  // ID は保存データのキーなので変えない。
  // name は短い名前(一覧・出題ラベル・目次)、sub は補足(要点帳の見出しの下)。
  // wide: true の単元は、要点帳で要点と例題を左右に並べる
  var UNITS = [
    { id: "g1-units-of-language", grade: "g1", area: "文法", name: "言葉の単位" },
    { id: "g1-bunsetsu-relations", grade: "g1", area: "文法", name: "文節どうしの関係" },
    { id: "g1-sentence-components", grade: "g1", area: "文法", name: "文の成分と連文節" },
    { id: "g1-parts-of-speech", grade: "g1", area: "文法", name: "単語の分類(品詞)" },
    { id: "g1-demonstratives-conjunctions", grade: "g1", area: "文法", name: "指示語と接続語" },
    { id: "g1-radicals-strokes", grade: "g1", area: "漢字", name: "部首・画数・筆順" },
    { id: "g1-kanji-origins-readings", grade: "g1", area: "漢字", name: "漢字の成り立ちと音訓" },
    { id: "g1-compounds-vocabulary", grade: "g1", area: "語句", name: "熟語と語句", sub: "熟語の構成・類義語・対義語・多義語" },
    { id: "g1-classical-japanese", grade: "g1", area: "古典", name: "古文の基礎", sub: "歴史的仮名遣い・古語・竹取物語", wide: true },
    { id: "g1-classical-chinese", grade: "g1", area: "古典", name: "漢文の基礎", sub: "返り点・故事成語", wide: true },

    { id: "g2-verb-conjugation", grade: "g2", area: "文法", name: "動詞の活用", sub: "活用の種類・活用形" },
    { id: "g2-adjective-conjugation", grade: "g2", area: "文法", name: "形容詞・形容動詞の活用" },
    { id: "g2-particles", grade: "g2", area: "文法", name: "助詞", sub: "格助詞・接続助詞・副助詞・終助詞" },
    { id: "g2-auxiliary-verbs", grade: "g2", area: "文法", name: "助動詞", sub: "おもな助動詞の意味" },
    { id: "g2-homophones", grade: "g2", area: "漢字", name: "同音異義語・同訓異字" },
    { id: "g2-honorifics", grade: "g2", area: "語句", name: "敬語", sub: "尊敬語・謙譲語・丁寧語" },
    { id: "g2-idioms-proverbs", grade: "g2", area: "語句", name: "慣用句・ことわざ" },
    { id: "g2-makura-tsurezure", grade: "g2", area: "古典", name: "枕草子・徒然草", sub: "随筆の古典", wide: true },
    { id: "g2-heike", grade: "g2", area: "古典", name: "平家物語", sub: "軍記物語・無常観・対句", wide: true },
    { id: "g2-kanshi", grade: "g2", area: "古典", name: "漢詩", sub: "絶句・律詩・押韻・対句", wide: true },

    { id: "g3-word-identification", grade: "g3", area: "文法", name: "まぎらわしい語の識別", sub: "「ない」「の」「に」「だ」など" },
    { id: "g3-auxiliary-meanings", grade: "g3", area: "文法", name: "助動詞・助詞の意味の識別", sub: "「れる・られる」「ようだ」「そうだ」など" },
    { id: "g3-four-character-idioms", grade: "g3", area: "漢字", name: "三字熟語・四字熟語" },
    { id: "g3-word-origins", grade: "g3", area: "語句", name: "和語・漢語・外来語" },
    { id: "g3-rhetoric", grade: "g3", area: "語句", name: "表現技法", sub: "比喩・倒置・体言止め・対句・季語・切れ字" },
    { id: "g3-waka", grade: "g3", area: "古典", name: "和歌", sub: "万葉集・古今和歌集・新古今和歌集", wide: true },
    { id: "g3-okunohosomichi", grade: "g3", area: "古典", name: "おくのほそ道", sub: "松尾芭蕉・紀行文と俳句", wide: true },
    { id: "g3-analects", grade: "g3", area: "古典", name: "論語", sub: "孔子の言葉・書き下し文", wide: true }
  ];

  var byId = {};
  // 要点帳の番号(「1-3」= 中1の3番目)
  (function () {
    var counter = {};
    UNITS.forEach(function (u) {
      counter[u.grade] = (counter[u.grade] || 0) + 1;
      u.no = u.grade.slice(1) + "-" + counter[u.grade];
      byId[u.id] = u;
    });
  })();

  var content = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }
  function grade(id) {
    for (var i = 0; i < GRADES.length; i++) if (GRADES[i].id === id) return GRADES[i];
    return null;
  }
  function unitsOf(gradeId) { return UNITS.filter(function (u) { return u.grade === gradeId; }); }
  // 単元を1つ以上もつ学年(学年タブを出すかどうか、見出しの「中1〜中3」に使う)
  function activeGrades() { return GRADES.filter(function (g) { return unitsOf(g.id).length > 0; }); }

  // 学年別ファイルから呼ぶ。知らないIDは無視する(ページは止めない)
  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("JHJ.register: 登録できません: " + id);
      return;
    }
    content[id] = {
      points: Array.isArray(data.points) ? data.points : [],
      example: data.example || null,
      fixed: Array.isArray(data.fixed) ? data.fixed : []
    };
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  // 出題できる単元か(中身が未登録の単元は「準備中」)
  function isReady(id) {
    var c = contentOf(id);
    return !!c && validFixed(c).length > 0;
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
        var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total);
        if (total > 0) s.byUnit[u.id] = { total: total, correct: correct };
      });
    }
    return s;
  }
  function saveStats(stats) { return Store.save(STATS_KEY, stats); }
  function clearStats() { return Store.remove(STATS_KEY); }
  // 設定。保存がなければ null を返す(初期値はページが決める)。
  // units には、いまもある単元のIDだけを残す。保存が空・不正なら units は空の配列になり、
  // ページは「はじめて開いたとき」と同じ選択に戻す
  function loadSettings() {
    var raw = Store.load(SETTINGS_KEY, null);
    if (!raw || typeof raw !== "object") return null;
    var s = { units: [], count: 10, grade: GRADES[0].id };
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    if (COUNTS.indexOf(Number(raw.count)) >= 0) s.count = Number(raw.count);
    if (grade(raw.grade)) s.grade = raw.grade;
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }

  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  // ---------- 表示部品 ----------
  // 傍線。no を渡すと番号つき、double が true なら二重線
  function u(html, no, double) {
    return '<span class="bousen' + (double ? " double" : "") + '">' +
      (no ? '<span class="bousen-no">' + no + "</span>" : "") + html + "</span>";
  }
  // 文節(/)や単語(|)の区切り。区切りのあとでだけ折り返す
  function bunsetsu(parts, sep) {
    var mark = '<span class="kugiri" aria-hidden="true">' + (sep || "/") + "</span><wbr>";
    return parts.map(function (p) { return '<span class="bs">' + p + "</span>"; }).join(mark);
  }
  function r(kanji, yomi) { return "<ruby>" + kanji + "<rt>" + yomi + "</rt></ruby>"; }
  function reibun(html) {
    var inner = Array.isArray(html) ? html.map(function (l) { return "<p>" + l + "</p>"; }).join("") : html;
    return '<div class="reibun">' + inner + "</div>";
  }
  function kobun(o) {
    return '<figure class="kobun"><blockquote class="kobun-gen">' + o.gen + "</blockquote>" +
      (o.yaku ? '<p class="kobun-yaku"><span class="kobun-tag">現代語訳</span>' + o.yaku + "</p>" : "") +
      (o.src ? '<figcaption class="kobun-src">' + o.src + "</figcaption>" : "") + "</figure>";
  }
  function kanbun(o) {
    var lines = (o.lines || []).map(function (line) {
      return '<span class="kanbun-line">' + line.map(function (c) {
        if (typeof c === "string") return '<span class="kj-p">' + c + "</span>";
        return '<span class="kj"><span class="kj-c">' + c[0] + "</span>" +
          (c[1] ? '<span class="kj-o">' + c[1] + "</span>" : "") +
          (c[2] ? '<span class="kj-k">' + c[2] + "</span>" : "") + "</span>";
      }).join("") + "</span>";
    }).join("");
    return '<figure class="kanbun"><div class="kanbun-body">' + lines + "</div>" +
      (o.kaki ? '<p class="kanbun-kaki"><span class="kanbun-tag">書き下し文</span>' + o.kaki + "</p>" : "") +
      (o.yaku ? '<p class="kanbun-yaku"><span class="kanbun-tag">意味</span>' + o.yaku + "</p>" : "") + "</figure>";
  }
  function glyph(chars, small) {
    return '<div class="glyph-row">' + Array.from(String(chars)).map(function (c) {
      return '<span class="glyph' + (small ? " sm" : "") + '">' + c + "</span>";
    }).join("") + "</div>";
  }
  // 解説や例題の「1行ずつ」の並び
  function steps(lines) {
    return '<div class="steps">' + lines.map(function (l) { return '<div class="step">' + l + "</div>"; }).join("") + "</div>";
  }
  // 要点の中の大事な言葉
  function rule(html) { return '<span class="rule">' + html + "</span>"; }
  // HTMLから文字だけを取り出す(選択肢の重なりを調べるため。ふりがなは除く)
  function text(html) {
    return String(html)
      .replace(/<rt>[\s\S]*?<\/rt>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ---------- 問題を作る ----------
  // 問題の形を確かめる。問題点の一覧を返す(なければ空の配列)。検証スクリプトもこれを使う
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (typeof q.text !== "string" || !q.text) errs.push("text がない");
    if (q.material !== undefined && q.material !== null && typeof q.material !== "string") errs.push("material が文字列ではない");
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c) { errs.push("choices[" + i + "] が空"); return; }
        var k = text(c);
        if (!k) { errs.push("choices[" + i + "] に文字がない"); return; }
        if (seen[c] || seen["t:" + k]) errs.push("choices に同じものがある: " + k);
        seen[c] = true; seen["t:" + k] = true;
      });
    }
    if (typeof q.answer !== "number" || q.answer !== Math.floor(q.answer) || q.answer < 0 || q.answer > 3) {
      errs.push("answer が 0〜3 ではない");
    }
    var ex = q.explain;
    if (!(typeof ex === "string" && ex) && !(Array.isArray(ex) && ex.length > 0 && ex.every(function (l) { return typeof l === "string" && l; }))) {
      errs.push("explain がない");
    }
    return errs;
  }

  // 出題用に形をそろえ、4択の並びをまぜる
  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      source: "fixed:" + q.id,
      text: q.text,
      material: q.material || "",
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(q.answer),
      explain: Array.isArray(q.explain) ? q.explain.slice() : [q.explain],
      choiceLayout: q.choiceLayout === "grid" ? "grid" : ""
    };
  }

  // 出題できる固定問題(形のくずれた問題と、id が重なった2つ目以降は出さない)
  function validFixed(c) {
    var seen = {};
    return c.fixed.filter(function (q) {
      if (checkQuestion(q).length > 0 || seen[q.id]) return false;
      seen[q.id] = true;
      return true;
    });
  }

  // クイズ1回分。選んだ単元にできるだけ均等に割り振り、順番をまぜる
  function buildQuiz(unitIds, count) {
    var ids = shuffle(unitIds.filter(isReady));
    if (ids.length === 0 || count <= 0) return [];
    var base = Math.floor(count / ids.length), extra = count % ids.length;
    var all = [];
    var short = [];   // 問題が足りなかった単元と、足りない数
    ids.forEach(function (id, i) {
      var want = base + (i < extra ? 1 : 0);
      var got = shuffle(validFixed(contentOf(id))).slice(0, want);
      got.forEach(function (q) { all.push(prepare(id, q)); });
      if (got.length < want) short.push({ id: id, need: want - got.length });
    });
    var seq = shuffle(all);

    // 足りない分は、同じ固定問題をもう1周して補う。同じ問題どうしができるだけ離れるように、
    // 「最後に出たのがいちばん前の問題」から順に、列の後ろへ足していく(4択の並びは毎回まぜ直す)
    function keyOf(item) { return item.unitId + "|" + item.source; }
    while (short.length > 0) {
      var lastPos = {};
      seq.forEach(function (item, pos) { lastPos[keyOf(item)] = pos; });
      var lap = [];
      short.forEach(function (sh) {
        var pool = validFixed(contentOf(sh.id)).map(function (q) {
          var key = sh.id + "|fixed:" + q.id;
          return { id: sh.id, q: q, pos: lastPos.hasOwnProperty(key) ? lastPos[key] : -1 };
        });
        pool.sort(function (a, b) { return a.pos - b.pos; });
        var take = pool.slice(0, sh.need);
        sh.need -= take.length;
        lap = lap.concat(take);
      });
      lap.sort(function (a, b) { return a.pos - b.pos; });
      lap.forEach(function (t) { seq.push(prepare(t.id, t.q)); });
      short = short.filter(function (sh) { return sh.need > 0; });
    }
    return seq;
  }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNTS: COUNTS,
    GRADES: GRADES, AREAS: AREAS, UNITS: UNITS,
    unit: unit, grade: grade, unitsOf: unitsOf, activeGrades: activeGrades,
    register: register, contentOf: contentOf, isReady: isReady,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak,
    u: u, bunsetsu: bunsetsu, r: r, reibun: reibun, kobun: kobun, kanbun: kanbun, glyph: glyph,
    steps: steps, rule: rule, text: text, shuffle: shuffle,
    checkQuestion: checkQuestion, validFixed: validFixed, buildQuiz: buildQuiz
  };
})();

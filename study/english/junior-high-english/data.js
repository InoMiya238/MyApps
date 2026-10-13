// 中学英語道場: 学年・分野・単元の定義と、学年別ファイル(data-g1.js など)が中身を登録するための入れ物。
// 例文・会話・表・語順の枠などの表示部品を組み立てる関数も、このファイルに置く。
// 読み込む順番: shared/store.js → data.js → data-g1.js → data-g1-2.js
//   data-g1.js   中1「動詞」の7単元
//   data-g1-2.js 中1「文の形」「語句」の6単元
//
// ■ 学年を足すとき(中2・中3)
//   1. 下の GRADES に学年を、UNITS に単元を足す(ID は "g2-…")。
//   2. data-g2.js を作り、index.html と reference.html の <script> に足す。
//   学年が2つ以上になると、道場の学年タブが自動で出る。
//
// ■ 単元の中身の登録(学年別ファイルに書く)
//   JHE.register("単元ID", {
//     points:  ["要点のHTML", …],            // 3〜5個。大事な言葉は JHE.rule(...) で包む
//     chart:   "表や語順のHTML",              // 省略可。要点帳で、要点のリストのすぐ下に出す(JHE.hyo、JHE.gojun)
//     example: { title: "問いのHTML", steps: ["考え方のHTML", …], result: "答えのHTML" },
//     fixed:   [ 問題, … ]                    // 固定の4択問題。id をつける
//   });
//
// ■ 問題の形
//   {
//     id: "f1",                  // 必須。単元の中で重ならない名前
//     text: "問いの文のHTML",     // 必須。日本語の指示だけを書く(英文は material に入れる)
//     material: "教材のHTML",     // 省略可。例文(JHE.eibun)、会話(JHE.kaiwa)など
//     choices: ["…", "…", "…", "…"],   // 必須。ちょうど4つ、すべて異なること。並びはページが毎回まぜる
//     answer: 0,                 // 必須。choices の中の正解の番号(0〜3)
//     explain: ["解説の1行目", "2行目", …],   // 必須。1行ずつ表示される
//     choiceLayout: "grid"       // 省略可。選択肢が4つとも半角9字以内の語のとき2列にする
//   }
//   選択肢が英文のときは JHE.en("…") で包む。選択肢の中では JHE.key と JHE.u を使わない(正誤で文字色が変わるため)。
//
// ■ 表示部品(見た目のCSSは index.html と reference.html の「英語の表示部品」にある)
//   JHE.en("book")                 日本語の文中・選択肢の英語
//   JHE.eibun(en, ja)              例文ブロック。ja は省略可。JHE.eibun([[en, ja], [en, ja]]) で複数文
//   JHE.kaiwa([["A", en, ja], ["B", en, ja]])     会話(問いと答え)。ja は省略可
//   JHE.blank()  JHE.blank("①")    空所
//   JHE.fill("am")                 解説で、答えを入れた空所
//   JHE.u("plays")  JHE.u("plays", "①")   注目する語の下線(問題文用)
//   JHE.key("s")                   変わった部分・答えの強調(要点・解説用)
//   JHE.henka("play", "plays")     語形の変化(play → plays)
//   JHE.seigo(ng, ok)              誤文(×)と正文(○)の対
//   JHE.hyo({ caption, head: ["", "〜は", …], rows: [["私", "I", …], …], compact: true })
//       活用・変化の表。各行の1つめは行見出し(日本語)、残りは英語のセル。caption と compact は省略可。
//       日本語のセル(意味の列など)は { ja: "意味" } の形で渡す。
//       360px幅に収めるため、列は見出し列を入れて5列まで(4列以上は compact: true)。
//   JHE.gojun([{ role, en, ja, key }, …], label)    語順の枠。ja・key・label は省略可
//   JHE.steps([...])  JHE.rule("…")  JHE.text(html)
var JHE = (function () {
  "use strict";

  var STATS_KEY = "juniorHighEnglishStats";
  var SETTINGS_KEY = "juniorHighEnglishSettings";
  var COUNTS = [5, 10, 20];

  var GRADES = [
    { id: "g1", short: "中1", name: "中学1年" }
  ];

  // 分野。設定画面の小見出し、要点帳の目次、成績の「分野ごとの正答率」は、この順に並ぶ
  var AREAS = ["動詞", "文の形", "語句"];

  // ID は保存データのキーなので変えない。
  // name は短い名前(一覧・出題ラベル・目次)、sub は補足(要点帳の見出しの下)。
  // wide: true の単元(表や語順の枠のある単元)は、要点帳で要点と例題を左右に並べる。
  // いまは全単元に表か語順の枠があるので、すべて wide(半分の幅のカードがまざると、となりが空くため)
  var UNITS = [
    { id: "g1-be-verbs", grade: "g1", area: "動詞", name: "be動詞", sub: "am / are / is の使い分け、否定文・疑問文", wide: true },
    { id: "g1-general-verbs", grade: "g1", area: "動詞", name: "一般動詞", sub: "play, like など。do を使う否定文・疑問文", wide: true },
    { id: "g1-third-person-singular", grade: "g1", area: "動詞", name: "三人称単数現在", sub: "動詞の s、does / doesn't", wide: true },
    { id: "g1-can", grade: "g1", area: "動詞", name: "助動詞 can", sub: "〜できる、Can you 〜?", wide: true },
    { id: "g1-present-progressive", grade: "g1", area: "動詞", name: "現在進行形", sub: "be動詞 + 動詞の ing 形", wide: true },
    { id: "g1-past-tense", grade: "g1", area: "動詞", name: "一般動詞の過去形", sub: "規則動詞・不規則動詞、did / didn't", wide: true },
    { id: "g1-be-past-progressive", grade: "g1", area: "動詞", name: "be動詞の過去形と過去進行形", sub: "was / were、was 〜ing", wide: true },
    { id: "g1-wh-questions", grade: "g1", area: "文の形", name: "疑問詞", sub: "what / who / where / when / which / whose / why / how", wide: true },
    { id: "g1-imperatives", grade: "g1", area: "文の形", name: "命令文", sub: "〜しなさい、Don't 〜、Let's 〜", wide: true },
    { id: "g1-nouns-articles", grade: "g1", area: "語句", name: "名詞の複数形と冠詞", sub: "s / es のつけ方、a / an / the、数えられない名詞", wide: true },
    { id: "g1-pronouns", grade: "g1", area: "語句", name: "代名詞", sub: "I / my / me / mine の変化、this / that", wide: true },
    { id: "g1-prepositions", grade: "g1", area: "語句", name: "前置詞", sub: "in / on / at / to / from / with など", wide: true },
    { id: "g1-numbers-dates", grade: "g1", area: "語句", name: "数・曜日・月", sub: "基数と序数、曜日、月、時刻の言い方", wide: true }
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
      if (typeof console !== "undefined" && console.warn) console.warn("JHE.register: 登録できません: " + id);
      return;
    }
    content[id] = {
      points: Array.isArray(data.points) ? data.points : [],
      chart: typeof data.chart === "string" ? data.chart : "",
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
  // 日本語の文中・選択肢の英語
  function en(html) { return '<span class="en" lang="en">' + html + "</span>"; }
  // 英文と訳の1組(訳は省略可)
  function pair(enHtml, jaHtml) {
    return '<div class="eibun-pair"><p class="eibun-en" lang="en">' + enHtml + "</p>" +
      (jaHtml ? '<p class="eibun-ja">' + jaHtml + "</p>" : "") + "</div>";
  }
  // 例文ブロック。eibun(en, ja) か、eibun([[en, ja], [en, ja]])(配列の中は、英文だけの文字列でもよい)
  function eibun(enHtml, jaHtml) {
    var list = Array.isArray(enHtml) ? enHtml : [[enHtml, jaHtml]];
    return '<div class="eibun">' + list.map(function (p) {
      return Array.isArray(p) ? pair(p[0], p[1]) : pair(p);
    }).join("") + "</div>";
  }
  // 会話。rows は [話し手, 英文, 訳](訳は省略可)
  function kaiwa(rows) {
    return '<div class="eibun kaiwa">' + (rows || []).map(function (r) {
      return '<div class="kaiwa-row"><span class="kaiwa-who">' + r[0] + "</span>" + pair(r[1], r[2]) + "</div>";
    }).join("") + "</div>";
  }
  // 空所。no を渡すと番号つき
  function blank(no) { return '<span class="blank" role="img" aria-label="空所">' + (no || "") + "</span>"; }
  // 解説で、答えを入れた空所
  function fill(html) { return '<span class="blank filled">' + html + "</span>"; }
  // 注目する語の下線(問題文用)。no を渡すと番号つき
  function u(html, no) {
    return '<span class="chumoku">' + (no ? '<span class="chumoku-no">' + no + "</span>" : "") + html + "</span>";
  }
  // 変わった部分・答えの強調(要点・解説用)
  function key(html) { return '<b class="key">' + html + "</b>"; }
  // 語形の変化(play → plays)
  function henka(from, to) {
    return '<span class="henka" lang="en">' + from + ' <span class="henka-arrow" aria-hidden="true">→</span> <b class="key">' + to + "</b></span>";
  }
  // 誤文と正文の対
  function seigo(ng, ok) {
    return '<div class="seigo">' +
      '<p class="seigo-ng" lang="en"><span class="seigo-mark" lang="ja">×</span>' + ng + "</p>" +
      '<p class="seigo-ok" lang="en"><span class="seigo-mark" lang="ja">○</span>' + ok + "</p></div>";
  }
  // 属性の値に入れる文字
  function attr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // 活用・変化の表。各行の1つめは行見出し、残りは英語のセル({ ja: "…" } は日本語のセル)
  function hyo(o) {
    o = o || {};
    var head = Array.isArray(o.head) ? o.head : [];
    var rows = Array.isArray(o.rows) ? o.rows : [];
    var thead = "";
    if (head.length > 0) {
      thead = "<thead><tr>" + head.map(function (h, i) {
        return i === 0 && !h ? "<th></th>" : '<th scope="col">' + h + "</th>";
      }).join("") + "</tr></thead>";
    }
    var tbody = "<tbody>" + rows.map(function (row) {
      return "<tr>" + row.map(function (c, i) {
        if (i === 0) return '<th scope="row">' + (c && typeof c === "object" ? (c.ja || c.en || "") : c) + "</th>";
        var label = head[i] ? ' data-label="' + attr(text(head[i])) + '"' : "";
        if (c && typeof c === "object") {
          if (typeof c.ja === "string") return "<td" + label + ">" + c.ja + "</td>";
          return '<td lang="en"' + label + ">" + (c.en || "") + "</td>";
        }
        return '<td lang="en"' + label + ">" + c + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody>";
    return '<table class="en-table' + (o.compact ? " compact" : "") + '">' +
      (o.caption ? "<caption>" + o.caption + "</caption>" : "") + thead + tbody + "</table>";
  }
  // 語順の枠。slots は { role, en, ja, key }(ja と key は省略可)
  function gojun(slots, label) {
    return '<div class="gojun-set">' +
      (label ? '<p class="gojun-label">' + label + "</p>" : "") +
      '<div class="gojun">' + (slots || []).map(function (s) {
        return '<span class="gojun-slot' + (s.key ? " is-key" : "") + '">' +
          '<span class="gojun-role">' + (s.role || "") + "</span>" +
          '<span class="gojun-en" lang="en">' + (s.en || "") + "</span>" +
          (s.ja ? '<span class="gojun-ja">' + s.ja + "</span>" : "") + "</span>";
      }).join("") + "</div></div>";
  }
  // 解説や例題の「1行ずつ」の並び
  function steps(lines) {
    return '<div class="steps">' + lines.map(function (l) { return '<div class="step">' + l + "</div>"; }).join("") + "</div>";
  }
  // 要点の中の大事な言葉
  function rule(html) { return '<span class="rule">' + html + "</span>"; }
  // HTMLから文字だけを取り出す(選択肢の重なりを調べるため)
  function text(html) {
    return String(html)
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
    en: en, eibun: eibun, kaiwa: kaiwa, blank: blank, fill: fill, u: u, key: key,
    henka: henka, seigo: seigo, hyo: hyo, gojun: gojun,
    steps: steps, rule: rule, text: text, shuffle: shuffle,
    checkQuestion: checkQuestion, validFixed: validFixed, buildQuiz: buildQuiz
  };
})();

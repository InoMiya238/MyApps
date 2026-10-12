// 中学数学道場: 22単元の定義と、学年別ファイル(data-g1.js など)が中身を登録するための入れ物。
// 読み込む順番: shared/store.js → math.js → data.js → data-g1.js → data-g2.js → data-g3.js
//
// ■ 単元の中身の登録(学年別ファイルに書く)
//   JHM.register("単元ID", {
//     points:  ["要点のHTML", …],            // 3〜5個。大事な式は M.rule(...) で包む
//     example: { title: "問いのHTML", steps: ["途中式のHTML", …], result: "答えのHTML" },
//     figure:  { html: "SVGなどのHTML", caption: "図の説明" },   // 省略可。あると要点帳のカードが横長になる
//     generators: [ { id: "型の名前", label: "型の説明", make: function () { return 問題; } }, … ],  // 省略可
//     fixed:   [ 問題, … ]                    // 省略可。固定問題には id をつける
//   });
//
// ■ 問題の形(生成・固定で共通)
//   {
//     id: "f1",                  // 固定問題だけ。単元の中で重ならない名前
//     text: "問いの文のHTML",     // 必須
//     math: "大きく見せる式",     // 省略可。<span class="math"> に包んだもの(M.m / M.mf)
//     figure: "図のHTML",         // 省略可。SVG(M.plane など)や表
//     choices: ["…", "…", "…", "…"],   // 必須。ちょうど4つ、すべて異なること。並びはページが毎回まぜる
//     answer: 0,                 // 必須。choices の中の正解の番号(0〜3)
//     explain: ["解説の1行目", "2行目", …],   // 必須。途中式つき。1行ずつ表示される
//     textChoices: true,         // 省略可。選択肢が文章のとき(本文フォント・左寄せ・1列になる)
//     choiceLayout: "stack",     // 省略可。式の選択肢が長いとき1列にする
//     meta: { … }                // 省略可。検証スクリプトが答えを確かめるための数値。画面には出ない
//   }
//   ・textChoices がない選択肢は、ページが <span class="math"> に包む(部品のまま書けばよい)。
//   ・text、explain、textChoices の選択肢の中の式は、M.m(...) か M.mf("...") で包んで書く。
var JHM = (function () {
  "use strict";

  var STATS_KEY = "juniorHighMathStats";
  var SETTINGS_KEY = "juniorHighMathSettings";
  var COUNTS = [5, 10, 20];

  var GRADES = [
    { id: "g1", short: "中1", name: "中学1年" },
    { id: "g2", short: "中2", name: "中学2年" },
    { id: "g3", short: "中3", name: "中学3年" }
  ];

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "g1-numbers", grade: "g1", name: "正負の数", area: "数と式" },
    { id: "g1-expressions", grade: "g1", name: "文字と式", area: "数と式" },
    { id: "g1-linear-equations", grade: "g1", name: "一次方程式", area: "数と式" },
    { id: "g1-proportion", grade: "g1", name: "比例と反比例", area: "関数" },
    { id: "g1-plane-figures", grade: "g1", name: "平面図形", area: "図形" },
    { id: "g1-solid-figures", grade: "g1", name: "空間図形", area: "図形" },
    { id: "g1-data", grade: "g1", name: "データの活用", area: "データ" },
    { id: "g2-expressions", grade: "g2", name: "式の計算", area: "数と式" },
    { id: "g2-simultaneous-equations", grade: "g2", name: "連立方程式", area: "数と式" },
    { id: "g2-linear-functions", grade: "g2", name: "一次関数", area: "関数" },
    { id: "g2-parallel-congruence", grade: "g2", name: "平行と合同", area: "図形" },
    { id: "g2-triangles-quadrilaterals", grade: "g2", name: "三角形と四角形", area: "図形" },
    { id: "g2-probability", grade: "g2", name: "確率", area: "データ" },
    { id: "g2-box-plots", grade: "g2", name: "箱ひげ図", area: "データ" },
    { id: "g3-expansion-factoring", grade: "g3", name: "展開と因数分解", area: "数と式" },
    { id: "g3-square-roots", grade: "g3", name: "平方根", area: "数と式" },
    { id: "g3-quadratic-equations", grade: "g3", name: "二次方程式", area: "数と式" },
    { id: "g3-quadratic-functions", grade: "g3", name: "関数 y=ax²", area: "関数" },
    { id: "g3-similarity", grade: "g3", name: "相似", area: "図形" },
    { id: "g3-circles", grade: "g3", name: "円", area: "図形" },
    { id: "g3-pythagorean", grade: "g3", name: "三平方の定理", area: "図形" },
    { id: "g3-sampling", grade: "g3", name: "標本調査", area: "データ" }
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

  // 学年別ファイルから呼ぶ。知らないIDは無視する(ページは止めない)
  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("JHM.register: 登録できません: " + id);
      return;
    }
    content[id] = {
      points: Array.isArray(data.points) ? data.points : [],
      example: data.example || null,
      figure: data.figure || null,
      generators: Array.isArray(data.generators) ? data.generators : [],
      fixed: Array.isArray(data.fixed) ? data.fixed : []
    };
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  // 出題できる単元か(中身が未登録の単元は「準備中」)
  function isReady(id) {
    var c = contentOf(id);
    return !!c && (c.generators.length + c.fixed.length) > 0;
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
    var s = { units: [], count: 10, grade: "g1" };
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

  // ---------- 問題を作る ----------
  // 問題の形を確かめる。問題点の一覧を返す(なければ空の配列)。検証スクリプトもこれを使う
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.text !== "string" || !q.text) errs.push("text がない");
    if (q.math !== undefined && q.math !== null && typeof q.math !== "string") errs.push("math が文字列ではない");
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c) { errs.push("choices[" + i + "] が空"); return; }
        var k = M.text(c);
        // 中身が欠けた選択肢(タグだけで文字がない、「y =」「2x +」のように式が途中で終わる)は出題しない
        if (!k) { errs.push("choices[" + i + "] に文字がない"); return; }
        if (k.length > 1 && /[=+−×÷]$/.test(k)) errs.push("choices[" + i + "] が途中で終わっている: " + k);
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
  function prepare(unitId, source, q) {
    var order = M.shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      source: source,
      text: q.text,
      math: q.math || "",
      figure: q.figure || "",
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(q.answer),
      explain: Array.isArray(q.explain) ? q.explain.slice() : [q.explain],
      textChoices: !!q.textChoices,
      choiceLayout: q.choiceLayout === "stack" ? "stack" : ""
    };
  }

  function signature(q) { return M.text(q.text + "|" + (q.math || "") + "|" + q.choices[q.answer]); }

  // 1つの単元から n 問。固定問題は重ねない(足りなければ生成で補う)。
  // 固定だけの単元で足りないときは、足りないまま返す(2周目は buildQuiz が、同じ問題が離れるように足す)
  function validFixed(c) { return c.fixed.filter(function (q) { return checkQuestion(q).length === 0; }); }
  function buildForUnit(unitId, n, used) {
    var c = contentOf(unitId), out = [];
    if (!c || n <= 0) return out;
    var fixedPool = M.shuffle(validFixed(c));
    var gens = M.shuffle(c.generators.filter(function (g) { return g && typeof g.make === "function"; }));
    var genIndex = 0;

    function fromGenerator() {
      for (var round = 0; round < gens.length; round++) {
        var g = gens[genIndex % gens.length];
        genIndex++;
        for (var t = 0; t < 20; t++) {
          var q = null;
          try { q = g.make(); } catch (e) { q = null; }
          if (!q || checkQuestion(q).length > 0) continue;
          var sig = unitId + "|" + signature(q);
          if (used[sig]) continue;
          used[sig] = true;
          return prepare(unitId, "gen:" + g.id, q);
        }
      }
      return null;
    }
    function fromFixed() {
      if (fixedPool.length === 0) return null;
      var q = fixedPool.shift();
      return prepare(unitId, "fixed:" + (q.id || ""), q);
    }

    for (var i = 0; i < n; i++) {
      var item = null;
      if (gens.length === 0) {
        item = fromFixed();
      } else if (fixedPool.length > 0 && Math.random() < 0.4) {
        item = fromFixed();
      } else {
        item = fromGenerator() || fromFixed();
      }
      if (item) out.push(item);
    }
    return out;
  }

  // クイズ1回分。選んだ単元にできるだけ均等に割り振り、順番をまぜる
  function buildQuiz(unitIds, count) {
    var ids = M.shuffle(unitIds.filter(isReady));
    if (ids.length === 0 || count <= 0) return [];
    var base = Math.floor(count / ids.length), extra = count % ids.length;
    var used = {}, all = [];
    var short = [];   // 固定問題だけの単元で、問題が足りなかった分
    ids.forEach(function (id, i) {
      var want = base + (i < extra ? 1 : 0), got = buildForUnit(id, want, used);
      all = all.concat(got);
      var c = contentOf(id);
      var fixedOnly = c.generators.filter(function (g) { return g && typeof g.make === "function"; }).length === 0;
      if (fixedOnly && got.length < want && validFixed(c).length > 0) short.push({ id: id, need: want - got.length });
    });
    var seq = M.shuffle(all);

    // 足りない分は、同じ固定問題をもう1周して補う。同じ問題どうしができるだけ離れるように、
    // 「最後に出たのがいちばん前の問題」から順に、列の後ろへ足していく(4択の並びは毎回まぜ直す)
    function keyOf(item) { return item.unitId + "|" + item.source; }
    while (short.length > 0) {
      var lastPos = {};
      seq.forEach(function (item, pos) { lastPos[keyOf(item)] = pos; });
      var lap = [];
      short.forEach(function (sh) {
        var pool = validFixed(contentOf(sh.id)).map(function (q) {
          var key = sh.id + "|fixed:" + (q.id || "");
          return { id: sh.id, q: q, pos: lastPos.hasOwnProperty(key) ? lastPos[key] : -1 };
        });
        pool.sort(function (a, b) { return a.pos - b.pos; });
        var take = pool.slice(0, sh.need);
        sh.need -= take.length;
        lap = lap.concat(take);
      });
      lap.sort(function (a, b) { return a.pos - b.pos; });
      lap.forEach(function (t) { seq.push(prepare(t.id, "fixed:" + (t.q.id || ""), t.q)); });
      short = short.filter(function (sh) { return sh.need > 0; });
    }
    return seq;
  }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNTS: COUNTS,
    GRADES: GRADES, UNITS: UNITS,
    unit: unit, grade: grade, unitsOf: unitsOf,
    register: register, contentOf: contentOf, isReady: isReady,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak,
    checkQuestion: checkQuestion, buildQuiz: buildQuiz
  };
})();

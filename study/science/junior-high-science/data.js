// 中学理科道場: 学年・分野・単元の定義と、学年別ファイル(data-g1.js など)が中身を登録するための入れ物。
// 表・公式・図などの表示部品を組み立てる関数も、このファイルに置く。
// 読み込む順番: shared/store.js → data.js → data-g1.js → data-g2.js
//
// ■ 単元の中身の登録(学年別ファイルに書く。分野ごとに1つの IIFE にまとめる)
//   JHS.register("単元ID", {
//     points:  ["要点のHTML", …],             // 3〜6個。大事な言葉は JHS.rule(...) で包む
//     figures: [{ html: "SVGのHTML", caption: "図の説明" }, …],   // 省略可。要点帳の図。0〜2個(多い単元は3個まで)
//     blocks:  ["表・公式の箱・枝分かれのHTML", …],                // 省略可。要点の下に出す
//     example: { title: "問いのHTML", steps: ["考え方のHTML", …], result: "答えのHTML" },
//     fixed:   [ 問題, … ],                    // 固定の4択問題。1単元 10〜14問。id をつける
//     generators: [ { id: "型の名前", label: "型の説明", make: function () { return 問題; } }, … ]   // 省略可。数値が毎回変わる問題
//   });
//   ・figures が1つでもある単元は、要点帳でカードが横長(2列)になる。左が points → blocks、右が figures → example。
//   ・make は、作れなかったとき null を返してよい(ページが作り直す)。4つの選択肢が重ならないことは make の中で保証する。
//
// ■ 問題の形(固定・生成で共通)
//   {
//     id: "f1",                  // 固定問題は必須。単元の中で重ならない名前(生成問題にはいらない)
//     text: "問いの文のHTML",     // 必須
//     figure: "SVGのHTML",        // 省略可。図。問いの文のすぐ下に出る(枠はページがつける)
//     material: "教材のHTML",     // 省略可。図以外(JHS.table、JHS.given)。図の下に出る
//     choices: ["…", "…", "…", "…"],   // 必須。ちょうど4つ、すべて異なること。並びはページが毎回まぜる
//     answer: 0,                 // 必須。choices の中の正解の番号(0〜3)
//     explain: ["解説の1行目", "2行目", …],   // 必須。なぜ正解か、ほかがなぜ違うかを2〜3行で
//     choiceLayout: "grid",      // 省略可。選択肢が短い語や単位つきの数値のとき2列にする
//     meta: { … }                // 省略可。検算用の数値(元の数値と答え)。画面には出ない
//   }
//   ・問題用の図の aria-label には答えを書かない。
//
// ■ 表示部品(見た目のCSSは index.html と reference.html の「理科の表示部品」にある)
//   JHS.rule("蒸留")                   大事な言葉
//   JHS.r("脊椎", "せきつい")          ふりがな
//   JHS.num(2.7)                       小数の表示("2.7")。JHS.num(1, 1) は "1.0"(小数第1位までそろえる)
//   JHS.q(2.7, "g/cm³")                単位つきの数値。JHS.q(25, "%") JHS.q(100, "℃") JHS.q(40, "倍") は、すき間を自動でつめる。
//                                      数値と単位の間に文字のスペースは入れない。1つ目に文字列を渡すと、そのまま出す
//   JHS.chem("CO2")                    化学式(英字のあとの数字を下つきにする)。中1では問題に使わない(中2からは使う)
//   JHS.frac("質量", "体積")           分数
//   JHS.formula("密度", JHS.frac("質量", "体積"))                     公式の箱(左辺 = 右辺)
//   JHS.given([["質量", JHS.q(54, "g")], ["体積", JHS.q(20, "cm³")]])   与えられた値の箱(名前と値の組)
//   JHS.calc("54 g ÷ 20 cm³", "2.7 g/cm³")    計算式の1行。解説(explain)や例題(steps)の1行として使う。
//       ・前後にスペースのある ÷ × + − = を演算子として扱う。
//       ・「数値 + スペース + 単位」「数値だけ」の項は、自動で JHS.q の形にする。HTMLを含む項はそのまま出す。
//       ・2つ目(答え)は太字になる。省略すると式だけを出す。
//   JHS.steps(["1行目", "2行目"])      1行ずつの並び(ページが使う。データでは explain と steps を配列で書けばよい)
//   JHS.table({
//     caption: "表の題",                // 省略可
//     head: ["なかま", "呼吸", "体表"],  // 列の見出し
//     rows: [["魚類", "えら", "うろこ"], …],   // 各行の1つ目は、行の見出し(th)になる
//     compact: true,                    // 省略可。4列のとき(セルは4文字以内)
//     stack: true                       // 省略可。5列以上のとき。幅がせまいと、1行を1枚のカードに組みかえる
//   })
//       ・3列まではそのまま。4列は compact、5列以上は stack にする。
//   JHS.branch(木)                      分類の枝分かれ。木は、次の2種類の節を入れ子にして書く
//       分かれ目: { q: "種子をつくるか", kids: [節, 節, …] }
//       行き先:   { leaf: "裸子植物", note: "マツ、イチョウ" }     note は省略可
//       どちらの節にも when: "つくる" をつけると、「親の問いにどう答えたときの枝か」が前に出る。
//       行き先にも kids をつけられる(「節足動物」の下に「昆虫類」「甲殻類」を並べるとき)。
//       例: JHS.branch({ q: "種子をつくるか", kids: [
//             { when: "つくる", leaf: "種子植物" }, { when: "つくらない", leaf: "シダ植物・コケ植物" } ] })
//   JHS.choices4("正解", ["誤答1", "誤答2", "誤答3", "予備", …])
//       生成問題用。誤答の候補から、正解とも互いにも重ならない3つを前から選び、{ choices, answer } を返す。
//       3つそろわなければ null を返す(make はそのまま null を返せばよい)。
//   JHS.randInt(1, 6)  JHS.pick([…])  JHS.shuffle([…])     乱数の道具
//
// ■ 図(SVG)
//   図は、学年別ファイルの中に「SVGの文字列を返す関数」として書く。幅はつねに 320。
//   高さは、横長の図が 200、グラフと装置図が 240、3コマの比較が 150。
//     function figScope(opts) {
//       opts = opts || {};
//       var s = '<rect class="fig-shape fig-fill-2" x="40" y="60" width="80" height="30"/>';
//       s += JHS.labels([
//         { key: "A", name: "接眼レンズ", from: [117, 32], to: [200, 26] },
//         { key: "B", name: "鏡筒", from: [122, 66], to: [200, 56] }
//       ], opts);
//       return JHS.svg(320, 240, opts.keys || opts.mark ? "顕微鏡の図。部分に記号がついている" : "顕微鏡のつくり", s);
//     }
//   JHS.svg(w, h, label, inner)        <svg> で包む。label は aria-label(問題用の図には答えを書かない)
//   JHS.labels(parts, opts)            部位の名前と引き出し線。
//       parts: [{ key: "A", name: "名前", from: [x, y], to: [x, y], side: "right" }, …]
//         from は部位の上の点(●がつく。省略すると線なし)、to は線の終わり。
//         side は、to のどちら側に文字を置くか。"right"(初期値) "left" "top" "bottom"
//       opts:  {} → 名前を出す(要点帳)          { keys: true } → 名前のかわりに記号 A, B, … を出す(問題)
//              { mark: "C" } → C の記号だけを出す   { keys: true, mark: "C" } → 全部の記号を出し、C を目立たせる
//              { hide: true } → 何も出さない
//   JHS.txt(x, y, "文字", { cls: "fig-small", anchor: "middle", halo: true })
//       文字。cls の初期値は "fig-label"、anchor は "start"。halo は線に重なるとき
//   JHS.key(x, y, "ア")                記号の丸(半径10)。{ on: true } を足すと目立たせる
//   JHS.arrow(x1, y1, x2, y2, cls, { both: true })
//       矢印。cls の初期値は "fig-shape"。"fig-force" "fig-line" は緑の矢じり、ほかは黒の矢じり。both で両矢印
//   JHS.graph({
//     label: "グラフの説明",                       // aria-label
//     x: { min: 0, max: 80, step: 20, label: "水の温度[℃]" },    // step ごとに目盛りと方眼
//     y: { min: 0, max: 180, step: 20, label: "とける質量[g]" },
//     series: [{ pts: [[0, 13], [20, 32], …], cls: "fig-line", marker: "circle", name: "硝酸カリウム", smooth: true }],
//         cls は "fig-line"(実線) "fig-line-2"(破線) "fig-line-3"(点線)。marker は "circle" "tri" "square"(省略で印なし)。
//         name は線の端(最後の点の左上)に出る。場所を変えるときは nameAt: [x, y](グラフの値で指定)。
//         smooth: true でなめらかな曲線にする
//     guides: [{ x: 60, y: 109, xText: "60", yText: "109" }],
//         読み取り用の破線。点(x, y)から両方の軸へ引き、軸のそばに数字を書く。x だけ・y だけなら、まっすぐ1本
//     extra: function (g) { return "追加のSVG"; }   // 省略可。g.X(値) g.Y(値) で座標に直せる。g.left g.right g.top g.bottom は枠
//   })
//       余白は左44・下36・上14・右14。高さは 240(h で変えられる)。JHS.graphScale(opts) でも g が得られる。
//   線と面のクラス(色はすべてクラスで決める。SVGに色の値を書かない)
//     fig-shape 輪郭 / fig-line 主役の線 / fig-line-2 2本目(破線) / fig-line-3 3本目(点線) / fig-dash 補助線
//     fig-thin 引き出し線 / fig-axis 軸 / fig-grid 方眼 / fig-force 力の矢印 / fig-detail 細かい線(葉脈など)
//     fig-fill(うすい緑) fig-fill-2(うすい灰) fig-fill-0(地の色) 面(fig-shape と合わせて輪郭をつける) / fig-point 点 / fig-solid ぬりつぶした小さな形
//     文字: fig-label(13px) fig-small(12px) fig-num(目盛りの数字) fig-halo(線に重なる文字)
//   模様(地層・岩石・鏡の裏): fill="url(#sci-pat-gravel)" のように書く。
//     sci-pat-gravel れき(丸) / sci-pat-sand 砂(点) / sci-pat-mud 泥(短い横線) / sci-pat-tuff 凝灰岩(v字)
//     sci-pat-lime 石灰岩(れんが) / sci-pat-hatch 斜線
//   JHS.defs()                          模様と矢じりの定義。両ページが <body> の先頭に1回だけ入れる(データでは呼ばない)
//   1つのラベルは8文字以内。図の端から4px以内に文字を置かない。軸の名前は回転させない。
var JHS = (function () {
  "use strict";

  var STATS_KEY = "juniorHighScienceStats";
  var SETTINGS_KEY = "juniorHighScienceSettings";
  var COUNTS = [5, 10, 20];

  var GRADES = [
    { id: "g1", short: "中1", name: "中学1年" },
    { id: "g2", short: "中2", name: "中学2年" }
  ];

  // 分野。設定画面の小見出し、要点帳の目次、成績の「分野ごとの正答率」は、この順に並ぶ
  var AREAS = ["生物", "化学", "物理", "地学"];

  // ID は保存データのキーなので変えない。
  // name は短い名前(一覧・出題ラベル・目次)、sub は補足(要点帳の見出しの下)。
  var UNITS = [
    { id: "g1-observation", grade: "g1", area: "生物", name: "生物の観察", sub: "ルーペ・顕微鏡" },
    { id: "g1-plants", grade: "g1", area: "生物", name: "植物の分類", sub: "花のつくり・種子植物・シダ・コケ" },
    { id: "g1-animals", grade: "g1", area: "生物", name: "動物の分類", sub: "脊椎動物・無脊椎動物" },
    { id: "g1-substances-density", grade: "g1", area: "化学", name: "物質の性質と密度" },
    { id: "g1-gases", grade: "g1", area: "化学", name: "気体の性質" },
    { id: "g1-solutions", grade: "g1", area: "化学", name: "水溶液", sub: "濃度・溶解度・再結晶" },
    { id: "g1-state-changes", grade: "g1", area: "化学", name: "状態変化", sub: "融点・沸点・蒸留" },
    { id: "g1-light", grade: "g1", area: "物理", name: "光", sub: "反射・屈折・凸レンズ" },
    { id: "g1-sound", grade: "g1", area: "物理", name: "音" },
    { id: "g1-force", grade: "g1", area: "物理", name: "力", sub: "フックの法則・力のつり合い" },
    { id: "g1-volcanoes", grade: "g1", area: "地学", name: "火山と火成岩" },
    { id: "g1-earthquakes", grade: "g1", area: "地学", name: "地震" },
    { id: "g1-strata", grade: "g1", area: "地学", name: "地層と化石", sub: "堆積岩・化石" },

    { id: "g2-cells", grade: "g2", area: "生物", name: "細胞のつくり", sub: "植物と動物の細胞・単細胞生物と多細胞生物" },
    { id: "g2-plant-functions", grade: "g2", area: "生物", name: "植物のつくりとはたらき", sub: "光合成・呼吸・蒸散・葉と茎と根" },
    { id: "g2-digestion", grade: "g2", area: "生物", name: "消化と吸収" },
    { id: "g2-respiration-circulation", grade: "g2", area: "生物", name: "呼吸・血液・排出", sub: "肺・心臓と血液の循環・じん臓" },
    { id: "g2-stimulus-response", grade: "g2", area: "生物", name: "刺激と反応", sub: "感覚器官・神経・骨と筋肉" },
    { id: "g2-decomposition-atoms", grade: "g2", area: "化学", name: "分解と原子・分子", sub: "熱分解・電気分解・元素記号" },
    { id: "g2-chemical-equations", grade: "g2", area: "化学", name: "化学式と化学反応式", sub: "単体と化合物・物質どうしが結びつく変化" },
    { id: "g2-oxidation-reduction", grade: "g2", area: "化学", name: "酸化と還元", sub: "燃焼・還元・熱の出入り" },
    { id: "g2-chemical-mass", grade: "g2", area: "化学", name: "化学変化と質量", sub: "質量保存の法則・質量の比" },
    { id: "g2-circuits", grade: "g2", area: "物理", name: "回路と電流・電圧", sub: "直列回路と並列回路" },
    { id: "g2-ohms-law", grade: "g2", area: "物理", name: "オームの法則と抵抗" },
    { id: "g2-electric-power", grade: "g2", area: "物理", name: "電力と熱量", sub: "電力・熱量・電力量" },
    { id: "g2-static-electrons", grade: "g2", area: "物理", name: "静電気と電流の正体", sub: "放電・電子・放射線" },
    { id: "g2-magnetic-field", grade: "g2", area: "物理", name: "電流と磁界", sub: "磁界・モーター・電磁誘導" },
    { id: "g2-pressure-weather", grade: "g2", area: "地学", name: "圧力と気象観測", sub: "圧力・大気圧・天気図の記号" },
    { id: "g2-clouds-humidity", grade: "g2", area: "地学", name: "雲のでき方と湿度", sub: "飽和水蒸気量・露点・湿度" },
    { id: "g2-fronts", grade: "g2", area: "地学", name: "前線と天気の変化", sub: "高気圧と低気圧・気団・前線" },
    { id: "g2-japan-weather", grade: "g2", area: "地学", name: "日本の天気", sub: "季節風・四季の天気・台風" }
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
      if (typeof console !== "undefined" && console.warn) console.warn("JHS.register: 登録できません: " + id);
      return;
    }
    content[id] = {
      points: Array.isArray(data.points) ? data.points : [],
      figures: (Array.isArray(data.figures) ? data.figures : []).filter(function (f) { return f && typeof f.html === "string" && f.html; }),
      blocks: (Array.isArray(data.blocks) ? data.blocks : []).filter(function (b) { return typeof b === "string" && b; }),
      example: data.example || null,
      fixed: Array.isArray(data.fixed) ? data.fixed : [],
      generators: (Array.isArray(data.generators) ? data.generators : []).filter(function (g) { return g && typeof g.make === "function"; })
    };
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  // 出題できる単元か(中身が未登録の単元は「準備中」)
  function isReady(id) {
    var c = contentOf(id);
    return !!c && (c.generators.length + validFixed(c).length) > 0;
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

  // ---------- 道具 ----------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  // HTMLから文字だけを取り出す(選択肢の重なりを調べるため。ふりがなは除く)
  function text(html) {
    return String(html)
      .replace(/<rt>[\s\S]*?<\/rt>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  // 属性に入れる文字
  function attr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ---------- 表示部品 ----------
  function r(kanji, yomi) { return "<ruby>" + kanji + "<rt>" + yomi + "</rt></ruby>"; }
  // 要点の中の大事な言葉
  function rule(html) { return '<span class="rule">' + html + "</span>"; }
  // 解説や例題の「1行ずつ」の並び
  function steps(lines) {
    return '<div class="steps">' + lines.map(function (l) { return '<div class="step">' + l + "</div>"; }).join("") + "</div>";
  }
  // 小数の表示。0.1 + 0.2 のような誤差を消す。digits を渡すと、その桁数にそろえる(1 → "1.0")
  function num(n, digits) {
    var v = Math.round(Number(n) * 1e6) / 1e6;
    if (!isFinite(v)) return String(n);
    if (typeof digits === "number") return v.toFixed(digits);
    return String(v);
  }
  // 単位つきの数値。英字で始まる単位(g、cm³、N、Hz、m/s)は少しあけ、%・℃・°・倍・秒などはつめる
  function q(value, unitText) {
    var n = typeof value === "number" ? num(value) : String(value);
    var u = unitText === undefined || unitText === null ? "" : String(unitText);
    var tight = !/^[A-Za-zµμ]/.test(u);
    return '<span class="qty"><span class="n">' + n + "</span>" +
      (u ? '<span class="u' + (tight ? " tight" : "") + '">' + u + "</span>" : "") + "</span>";
  }
  function chem(formulaText) {
    return '<span class="chem">' + String(formulaText).replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>") + "</span>";
  }
  function frac(top, bottom) {
    return '<span class="frac"><span class="num">' + top + '</span><span class="den">' + bottom + "</span></span>";
  }
  function formula(lhs, rhs) {
    return '<div class="formula"><span class="formula-lhs">' + lhs + '</span><span class="formula-eq">=</span>' +
      '<span class="formula-rhs">' + rhs + "</span></div>";
  }
  function given(pairs) {
    return '<dl class="given">' + pairs.map(function (p) {
      return "<dt>" + p[0] + "</dt><dd>" + p[1] + "</dd>";
    }).join("") + "</dl>";
  }
  // 計算式の中の1つの項。「54 g」「100」のような形だけを JHS.q に直す
  function calcTerm(s) {
    s = String(s).trim();
    if (s.indexOf("<") >= 0) return s;
    var m = /^(-?\d[\d.]*)\s+(\S+)$/.exec(s);
    if (m) return q(m[1], m[2]);
    if (/^-?\d[\d.]*$/.test(s)) return q(s);
    return s;
  }
  function calcSide(s) {
    return String(s).split(/\s+([÷×+−=])\s+/).map(function (part, i) {
      return i % 2 === 1 ? '<span class="op">' + part + "</span>" : calcTerm(part);
    }).join("");
  }
  function calc(expr, result) {
    return '<div class="calc">' + calcSide(expr) +
      (result !== undefined && result !== null && result !== "" ? '<span class="op">=</span><b>' + calcSide(result) + "</b>" : "") + "</div>";
  }
  function table(o) {
    var head = Array.isArray(o.head) ? o.head : [];
    var cls = "sci-table" + (o.compact ? " compact" : "") + (o.stack ? " stack" : "");
    var h = '<div class="tbl-wrap"><table class="' + cls + '">';
    if (o.caption) h += "<caption>" + o.caption + "</caption>";
    if (head.length > 0) {
      h += "<thead><tr>" + head.map(function (c) { return '<th scope="col">' + c + "</th>"; }).join("") + "</tr></thead>";
    }
    h += "<tbody>" + (o.rows || []).map(function (row) {
      return "<tr>" + row.map(function (c, i) {
        if (i === 0) return '<th scope="row">' + c + "</th>";
        return '<td data-label="' + attr(text(head[i] || "")) + '">' + c + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody></table></div>";
    return h;
  }
  function branchNode(n) {
    var h = "<li>";
    if (n.when) h += '<span class="branch-when">' + n.when + "</span>";
    if (n.leaf) {
      h += '<span class="branch-leaf">' + n.leaf + "</span>";
      if (n.note) h += '<span class="branch-note">' + n.note + "</span>";
    } else {
      h += '<span class="branch-q">' + (n.q || "") + "</span>";
    }
    if (Array.isArray(n.kids) && n.kids.length > 0) h += "<ul>" + n.kids.map(branchNode).join("") + "</ul>";
    return h + "</li>";
  }
  function branch(tree) { return '<ul class="branch">' + branchNode(tree) + "</ul>"; }
  function fig(svgHtml, caption) {
    return '<figure class="sci-fig">' + svgHtml + (caption ? "<figcaption>" + caption + "</figcaption>" : "") + "</figure>";
  }

  // 生成問題の4択。誤答の候補から、正解とも互いにも重ならない3つを前から選ぶ
  function choices4(correct, wrongs) {
    var out = [String(correct)], seen = {};
    seen[text(correct)] = true;
    (wrongs || []).forEach(function (w) {
      if (out.length >= 4 || w === undefined || w === null) return;
      var k = text(w);
      if (!k || seen[k]) return;
      seen[k] = true;
      out.push(String(w));
    });
    return out.length === 4 ? { choices: out, answer: 0 } : null;
  }

  // ---------- 図(SVG) ----------
  function px(v) { return String(Math.round(v * 10) / 10); }
  function svg(w, h, label, inner) {
    return '<svg class="sci-svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + attr(label || "図") + '">' + inner + "</svg>";
  }
  function txt(x, y, str, o) {
    o = o || {};
    return '<text class="' + (o.cls || "fig-label") + (o.halo ? " fig-halo" : "") + '" x="' + px(x) + '" y="' + px(y) + '"' +
      (o.anchor && o.anchor !== "start" ? ' text-anchor="' + o.anchor + '"' : "") + ">" + str + "</text>";
  }
  function key(x, y, ch, o) {
    return '<circle class="fig-key' + (o && o.on ? " on" : "") + '" cx="' + px(x) + '" cy="' + px(y) + '" r="10"/>' +
      '<text class="fig-key-t" x="' + px(x) + '" y="' + px(y) + '">' + ch + "</text>";
  }
  function arrow(x1, y1, x2, y2, cls, o) {
    cls = cls || "fig-shape";
    var id = /fig-force|fig-line(\s|$)/.test(cls) ? "sci-arrow-accent" : "sci-arrow";
    return '<line class="' + cls + '" x1="' + px(x1) + '" y1="' + px(y1) + '" x2="' + px(x2) + '" y2="' + px(y2) + '"' +
      ' marker-end="url(#' + id + ')"' + (o && o.both ? ' marker-start="url(#' + id + ')"' : "") + "/>";
  }
  function labels(parts, o) {
    o = o || {};
    if (o.hide) return "";
    return (parts || []).map(function (p) {
      var asKey = !!o.keys || !!o.mark;
      if (o.mark && !o.keys && o.mark !== p.key) return "";
      var to = p.to, side = p.side || "right", h = "";
      if (p.from) {
        h += '<line class="fig-thin" x1="' + px(p.from[0]) + '" y1="' + px(p.from[1]) + '" x2="' + px(to[0]) + '" y2="' + px(to[1]) + '"/>' +
          '<circle class="fig-dot" cx="' + px(p.from[0]) + '" cy="' + px(p.from[1]) + '" r="2"/>';
      }
      if (asKey) {
        var kx = to[0] + (side === "right" ? 11 : side === "left" ? -11 : 0);
        var ky = to[1] + (side === "top" ? -11 : side === "bottom" ? 11 : 0);
        h += key(kx, ky, p.key, { on: !!o.keys && o.mark === p.key });
      } else {
        var tx = to[0] + (side === "right" ? 4 : side === "left" ? -4 : 0);
        var ty = to[1] + (side === "top" ? -5 : side === "bottom" ? 15 : 4.5);
        h += txt(tx, ty, p.name, { anchor: side === "right" ? "start" : side === "left" ? "end" : "middle", halo: true });
      }
      return h;
    }).join("");
  }

  // グラフの座標。余白は左44・下36・上14・右14
  function graphScale(o) {
    var W = 320, H = o.h || 240, left = 44, right = W - 14, top = 14, bottom = H - 36;
    return {
      W: W, H: H, left: left, right: right, top: top, bottom: bottom,
      X: function (v) { return left + (v - o.x.min) / (o.x.max - o.x.min) * (right - left); },
      Y: function (v) { return bottom - (v - o.y.min) / (o.y.max - o.y.min) * (bottom - top); }
    };
  }
  function ticks(axis) {
    var n = Math.round((axis.max - axis.min) / axis.step), out = [];
    for (var i = 0; i <= n; i++) out.push(axis.min + i * axis.step);
    return out;
  }
  function marker(kind, x, y, cls) {
    if (kind === "tri") {
      return '<path class="' + cls + '" d="M' + px(x) + " " + px(y - 4.6) + "L" + px(x + 4.4) + " " + px(y + 3.2) + "L" + px(x - 4.4) + " " + px(y + 3.2) + 'Z"/>';
    }
    if (kind === "square") return '<rect class="' + cls + '" x="' + px(x - 3.4) + '" y="' + px(y - 3.4) + '" width="6.8" height="6.8"/>';
    return '<circle class="' + cls + '" cx="' + px(x) + '" cy="' + px(y) + '" r="3.6"/>';
  }
  function graph(o) {
    var g = graphScale(o), s = "";
    // 目盛りの数字は、刻みに小数があれば小数の桁をそろえる(0.9、1.0、1.1)
    function digitsOf(axis) { var m = /\.(\d+)$/.exec(String(axis.step)); return m ? m[1].length : undefined; }
    var dx = digitsOf(o.x), dy = digitsOf(o.y);
    ticks(o.x).forEach(function (v) {
      var X = px(g.X(v));
      s += '<line class="fig-grid" x1="' + X + '" y1="' + g.top + '" x2="' + X + '" y2="' + g.bottom + '"/>' +
        txt(g.X(v), g.bottom + 15, num(v, dx), { cls: "fig-num", anchor: "middle" });
    });
    ticks(o.y).forEach(function (v) {
      var Y = px(g.Y(v));
      s += '<line class="fig-grid" x1="' + g.left + '" y1="' + Y + '" x2="' + g.right + '" y2="' + Y + '"/>' +
        txt(g.left - 6, g.Y(v) + 4, num(v, dy), { cls: "fig-num", anchor: "end" });
    });
    s += '<path class="fig-axis" d="M' + g.left + " " + g.top + "V" + g.bottom + "H" + g.right + '"/>';

    (o.guides || []).forEach(function (gd) {
      var hasX = typeof gd.x === "number", hasY = typeof gd.y === "number";
      var X = hasX ? g.X(gd.x) : 0, Y = hasY ? g.Y(gd.y) : 0;
      if (hasX && hasY) s += '<path class="fig-dash" d="M' + px(X) + " " + g.bottom + "V" + px(Y) + "H" + g.left + '"/>';
      else if (hasX) s += '<path class="fig-dash" d="M' + px(X) + " " + g.bottom + "V" + g.top + '"/>';
      else if (hasY) s += '<path class="fig-dash" d="M' + g.left + " " + px(Y) + "H" + g.right + '"/>';
    });

    (o.series || []).forEach(function (se) {
      var cls = se.cls || "fig-line";
      var P = (se.pts || []).map(function (p) { return [g.X(p[0]), g.Y(p[1])]; });
      if (P.length > 1) {
        var d = "M" + px(P[0][0]) + " " + px(P[0][1]);
        for (var i = 1; i < P.length; i++) {
          if (se.smooth) {
            var a = P[Math.max(i - 2, 0)], b = P[i - 1], c = P[i], e = P[Math.min(i + 1, P.length - 1)];
            d += "C" + px(b[0] + (c[0] - a[0]) / 6) + " " + px(b[1] + (c[1] - a[1]) / 6) + " " +
              px(c[0] - (e[0] - b[0]) / 6) + " " + px(c[1] - (e[1] - b[1]) / 6) + " " + px(c[0]) + " " + px(c[1]);
          } else {
            d += "L" + px(P[i][0]) + " " + px(P[i][1]);
          }
        }
        s += '<path class="' + cls + '" d="' + d + '"/>';
      }
      if (se.marker) {
        var mc = cls === "fig-line-2" ? "fig-point-2" : cls === "fig-line-3" ? "fig-point-3" : "fig-point";
        P.forEach(function (p) { s += marker(se.marker, p[0], p[1], mc); });
      }
      if (se.name && P.length > 0) {
        var at = se.nameAt ? [g.X(se.nameAt[0]), g.Y(se.nameAt[1])] : [P[P.length - 1][0] - 4, P[P.length - 1][1] - 9];
        s += txt(Math.min(at[0], g.right), Math.max(at[1], g.top + 12), se.name, { cls: "fig-small", anchor: "end", halo: true });
      }
    });

    // 読み取る値は、線より上に重ねて書く
    (o.guides || []).forEach(function (gd) {
      if (typeof gd.x === "number" && gd.xText !== undefined) {
        s += txt(g.X(gd.x) + 4, g.bottom - 5, gd.xText, { cls: "fig-val", halo: true });
      }
      if (typeof gd.y === "number" && gd.yText !== undefined) {
        s += txt(g.left + 5, g.Y(gd.y) - 5, gd.yText, { cls: "fig-val", halo: true });
      }
    });

    if (o.y.label) s += txt(g.left + 6, g.top + 13, o.y.label, { cls: "fig-small", halo: true });
    if (o.x.label) s += txt(g.right, g.H - 6, o.x.label, { cls: "fig-small", anchor: "end" });
    if (typeof o.extra === "function") s += o.extra(g) || "";
    else if (typeof o.extra === "string") s += o.extra;
    return svg(g.W, g.H, o.label || "グラフ", s);
  }

  // 模様と矢じり。両ページが <body> の先頭に1回だけ入れる(display:none にすると模様が出ないので、大きさ0で置く)
  function defs() {
    function pat(id, w, h, inner, extra) {
      return '<pattern id="sci-pat-' + id + '" width="' + w + '" height="' + h + '" patternUnits="userSpaceOnUse"' + (extra || "") + ">" + inner + "</pattern>";
    }
    function head(id, cls) {
      return '<marker id="' + id + '" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse">' +
        '<path class="' + cls + '" d="M0 1L10 5L0 9Z"/></marker>';
    }
    return '<svg class="sci-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      pat("gravel", 14, 14, '<circle class="pat-s" cx="4" cy="4.5" r="3"/><circle class="pat-s" cx="10.5" cy="10.5" r="2.2"/>') +
      pat("sand", 8, 8, '<circle class="pat-f" cx="2" cy="2" r="0.9"/><circle class="pat-f" cx="6" cy="6" r="0.9"/>') +
      pat("mud", 12, 8, '<path class="pat-s" d="M1 2H6M7 6H12"/>') +
      pat("tuff", 12, 10, '<path class="pat-s" d="M1.5 1.5L3.5 5L5.5 1.5M7.5 6L9.5 9.5L11.5 6"/>') +
      pat("lime", 16, 12, '<path class="pat-s" d="M0 0.5H16M0 6.5H16M4 0.5V6.5M12 6.5V12"/>') +
      pat("hatch", 6, 6, '<path class="pat-s" d="M0 0V6"/>', ' patternTransform="rotate(45)"') +
      head("sci-arrow", "arrow-ink") + head("sci-arrow-accent", "arrow-accent") +
      "</defs></svg>";
  }

  // ---------- 問題を作る ----------
  // 問題の形を確かめる。問題点の一覧を返す(なければ空の配列)。検証スクリプトもこれを使う。
  // 生成問題は id がいらないので、2つ目に true を渡す
  function checkQuestion(qn, generated) {
    var errs = [];
    if (!qn || typeof qn !== "object") return ["問題がオブジェクトではない"];
    if (!generated && (typeof qn.id !== "string" || !qn.id)) errs.push("id がない");
    if (typeof qn.text !== "string" || !qn.text) errs.push("text がない");
    ["material", "figure"].forEach(function (k) {
      if (qn[k] !== undefined && qn[k] !== null && typeof qn[k] !== "string") errs.push(k + " が文字列ではない");
    });
    if (qn.meta !== undefined && qn.meta !== null && typeof qn.meta !== "object") errs.push("meta がオブジェクトではない");
    if (!Array.isArray(qn.choices) || qn.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      qn.choices.forEach(function (c, i) {
        if (typeof c !== "string" || !c) { errs.push("choices[" + i + "] が空"); return; }
        var k = text(c);
        if (!k) { errs.push("choices[" + i + "] に文字がない"); return; }
        if (/NaN|undefined|Infinity/.test(k)) errs.push("choices[" + i + "] に数値でないものがある: " + k);
        if (seen[c] || seen["t:" + k]) errs.push("choices に同じものがある: " + k);
        seen[c] = true; seen["t:" + k] = true;
      });
    }
    if (typeof qn.answer !== "number" || qn.answer !== Math.floor(qn.answer) || qn.answer < 0 || qn.answer > 3) {
      errs.push("answer が 0〜3 ではない");
    }
    var ex = qn.explain;
    if (!(typeof ex === "string" && ex) && !(Array.isArray(ex) && ex.length > 0 && ex.every(function (l) { return typeof l === "string" && l; }))) {
      errs.push("explain がない");
    }
    return errs;
  }

  // 出題用に形をそろえ、4択の並びをまぜる。図は枠(figure.sci-fig)に入れる
  function prepare(unitId, source, qn) {
    var order = shuffle([0, 1, 2, 3]);
    var figure = qn.figure || "";
    if (figure && figure.indexOf("<figure") !== 0) figure = fig(figure);
    return {
      unitId: unitId,
      source: source,
      text: qn.text,
      figure: figure,
      material: qn.material || "",
      choices: order.map(function (i) { return qn.choices[i]; }),
      answer: order.indexOf(qn.answer),
      explain: Array.isArray(qn.explain) ? qn.explain.slice() : [qn.explain],
      choiceLayout: qn.choiceLayout === "grid" ? "grid" : "",
      meta: qn.meta || null
    };
  }

  function signature(qn) { return text(qn.text + "|" + (qn.material || "") + "|" + qn.choices[qn.answer]); }

  // 出題できる固定問題(形のくずれた問題と、id が重なった2つ目以降は出さない)
  function validFixed(c) {
    var seen = {};
    return c.fixed.filter(function (qn) {
      if (checkQuestion(qn).length > 0 || seen[qn.id]) return false;
      seen[qn.id] = true;
      return true;
    });
  }

  // 1つの単元から n 問。固定問題は重ねない。生成問題のある単元は、固定問題と生成問題をまぜる。
  // 足りないときは、足りないまま返す(2周目は buildQuiz が、同じ問題が離れるように足す)
  function buildForUnit(unitId, n, used) {
    var c = contentOf(unitId), out = [];
    if (!c || n <= 0) return out;
    var fixedPool = shuffle(validFixed(c));
    var gens = shuffle(c.generators);
    var genIndex = 0;
    // 生成問題の割合。種類が少ない単元で同じ形の計算ばかりにならないよう、1種類につき2割、最大5割
    var genShare = Math.min(0.5, gens.length * 0.2);

    function fromGenerator() {
      for (var round = 0; round < gens.length; round++) {
        var g = gens[genIndex % gens.length];
        genIndex++;
        for (var t = 0; t < 20; t++) {
          var qn = null;
          try { qn = g.make(); } catch (e) { qn = null; }
          if (!qn || checkQuestion(qn, true).length > 0) continue;
          var sig = unitId + "|" + signature(qn);
          if (used[sig]) continue;
          used[sig] = true;
          return prepare(unitId, "gen:" + g.id, qn);
        }
      }
      return null;
    }
    function fromFixed() {
      if (fixedPool.length === 0) return null;
      var qn = fixedPool.shift();
      return prepare(unitId, "fixed:" + qn.id, qn);
    }

    for (var i = 0; i < n; i++) {
      var item = null;
      if (gens.length === 0) {
        item = fromFixed();
      } else if (fixedPool.length > 0 && Math.random() >= genShare) {
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
    var ids = shuffle(unitIds.filter(isReady));
    if (ids.length === 0 || count <= 0) return [];
    var base = Math.floor(count / ids.length), extra = count % ids.length;
    var used = {}, all = [];
    var short = [];   // 問題が足りなかった単元と、足りない数
    ids.forEach(function (id, i) {
      var want = base + (i < extra ? 1 : 0), got = buildForUnit(id, want, used);
      all = all.concat(got);
      if (got.length < want && validFixed(contentOf(id)).length > 0) short.push({ id: id, need: want - got.length });
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
        var pool = validFixed(contentOf(sh.id)).map(function (qn) {
          var k = sh.id + "|fixed:" + qn.id;
          return { id: sh.id, q: qn, pos: lastPos.hasOwnProperty(k) ? lastPos[k] : -1 };
        });
        pool.sort(function (a, b) { return a.pos - b.pos; });
        var take = pool.slice(0, sh.need);
        sh.need -= take.length;
        lap = lap.concat(take);
      });
      lap.sort(function (a, b) { return a.pos - b.pos; });
      lap.forEach(function (t) { seq.push(prepare(t.id, "fixed:" + t.q.id, t.q)); });
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
    r: r, rule: rule, steps: steps, num: num, q: q, chem: chem, frac: frac, formula: formula,
    given: given, calc: calc, table: table, branch: branch, fig: fig,
    svg: svg, txt: txt, key: key, arrow: arrow, labels: labels, graph: graph, graphScale: graphScale, defs: defs,
    text: text, shuffle: shuffle, randInt: randInt, pick: pick, choices4: choices4,
    checkQuestion: checkQuestion, validFixed: validFixed, buildQuiz: buildQuiz
  };
})();

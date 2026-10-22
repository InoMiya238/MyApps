// 中学社会道場: 学年・分野・単元の定義と、中身のファイル(data-g1.js など)が登録するための入れ物。
// 表などの表示部品を組み立てる関数も、このファイルに置く。
// 読み込む順番: shared/store.js → data.js → data-g1.js(中1地理) → data-g1-2.js(中1歴史)
//   → data-g2.js(中2地理) → data-g2-2.js(中2歴史) → data-g3.js(中3歴史) → data-g3-2.js(中3公民・政治) → data-g3-3.js(中3公民・経済と国際)
//
// ■ 学年を足すとき(中2・中3)
//   1. 下の GRADES に学年を、UNITS に単元を足す(ID は "g2-…")。分野が増えるときは AREAS にも足す。
//   2. data-g2.js を作り、index.html と reference.html の <script> に足す。
//   学年が2つ以上になると、道場の学年タブが自動で出る。
//
// ■ 単元の中身の登録(中身のファイルに書く)
//   JHSO.register("単元ID", {
//     points:  ["要点のHTML", …],            // 4〜6個。大事な言葉は JHSO.rule(...) で包む
//     figures: [{ html: "SVGのHTML", caption: "図の説明" }, …],   // 省略可。要点帳の図。0〜2個
//     blocks:  ["表などのHTML", …],           // 省略可。要点の下に出す(JHSO.table など)
//     example: { title: "問いのHTML", steps: ["考え方のHTML", …], result: "答えのHTML" },
//     fixed:   [ 問題, … ]                    // 固定の4択問題。id をつける
//   });
//   ・figures が1つでもある単元は、要点帳でカードが横長(2列)になる。左が points → blocks、右が figures → example。
//   ・模式図(実際の形や数値ではない図)は、caption にそう書く。
//
// ■ 問題の形
//   {
//     id: "f1",                  // 必須。単元の中で重ならない名前
//     text: "問いの文のHTML",     // 必須
//     figure: "SVGのHTML",        // 省略可。図。問いの文のすぐ下に出る(枠はページがつける)
//     material: "教材のHTML",     // 省略可。表(JHSO.table)など。図の下に出る
//     choices: ["…", "…", "…", "…"],   // 必須。ちょうど4つ、すべて異なること。並びはページが毎回まぜる
//     answer: 0,                 // 必須。choices の中の正解の番号(0〜3)
//     explain: ["解説の1行目", "2行目", …],   // 必須。なぜ正解か、ほかがなぜ違うかを2〜3行で
//     choiceLayout: "grid"       // 省略可。選択肢が短い語(地名、用語)のとき2列にする
//   }
//   ・問題用の図の aria-label には答えを書かない。図を使う問題の id は、各単元 f11 から。
//
// ■ 表示部品(見た目のCSSは index.html と reference.html の「社会の表示部品」にある)
//   JHSO.rule("季節風")                大事な言葉
//   JHSO.r("択捉島", "えとろふとう")    ふりがな
//   JHSO.table({
//     caption: "表の題",                // 省略可
//     head: ["気候帯", "特徴", "くらし"],  // 列の見出し
//     rows: [["熱帯", "一年中高温", "高床の住居"], …],   // 各行の1つ目は、行の見出し(th)になる
//     compact: true,                    // 省略可。4列のとき(セルは4文字以内)
//     stack: true                       // 省略可。5列以上や、セルの文が長い4列のとき。幅がせまいと、1行を1枚のカードに組みかえる
//   })
//   JHSO.steps(["1行目", "2行目"])     1行ずつの並び(ページが使う。データでは explain と steps を配列で書けばよい)
//   JHSO.text(html)                    HTMLから文字だけを取り出す
//   JHSO.shuffle([…])                  並びをまぜた新しい配列を返す
//
// ■ 図(SVG)
//   図は、中身のファイルの中に「SVGの文字列を返す関数」として書く。幅は 320 が基本(雨温図など小さい図は 204)。
//     function figKofun(opts) {
//       opts = opts || {};
//       var s = '<path class="fig-shape fig-fill-2" d="…"/>';
//       s += JHSO.labels([
//         { key: "A", name: "後円部", from: [150, 60], to: [220, 40] },
//         { key: "B", name: "前方部", from: [150, 150], to: [220, 150] }
//       ], opts);
//       return JHSO.svg(320, 220, opts.keys || opts.mark ? "古墳を上から見た図。部分に記号がついている" : "前方後円墳を上から見た図", s);
//     }
//   JHSO.svg(w, h, label, inner, { small: true })
//       <svg> で包む。label は aria-label(問題用の図には答えを書かない)。small は、幅の小さい図を大きくしすぎないとき
//   JHSO.labels(parts, opts)            部分の名前と引き出し線。
//       parts: [{ key: "A", name: "名前", from: [x, y], to: [x, y], side: "right" }, …]
//         from は部分の上の点(●がつく。省略すると線なし)、to は線の終わり。
//         side は、to のどちら側に文字を置くか。"right"(初期値) "left" "top" "bottom"
//       opts:  {} → 名前を出す(要点帳)          { keys: true } → 名前のかわりに記号 A, B, … を出す(問題)
//              { mark: "C" } → C の記号だけを出す   { keys: true, mark: "C" } → 全部の記号を出し、C を目立たせる
//              { hide: true } → 何も出さない
//   JHSO.box({ key: "A", name: "執権", note: "将軍を補佐", x: 160, y: 60, w: 80, h: 28, em: true }, opts)
//       しくみ図の箱。x, y は箱の中心。note は2行目の小さい字(省略可)。em: true で色つきの面にする。
//       opts: {} → 名前を出す   { keys: true } → key のある箱は全部、名前のかわりに記号を出す
//             { mark: "A" } → A の箱だけ記号にし、ほかの箱は名前を出す(しくみ図の問題はこれを使う)
//   JHSO.link([[x, y], [x, y], …], cls)  折れ線(しくみ図の線)。cls の初期値は "fig-shape"
//   JHSO.txt(x, y, "文字", { cls: "fig-small", anchor: "middle", halo: true })
//       文字。cls の初期値は "fig-label"、anchor は "start"。halo は線に重なるとき
//   JHSO.key(x, y, "ア")                記号の丸(半径10)。{ on: true } を足すと目立たせる
//   JHSO.arrow(x1, y1, x2, y2, cls, { both: true })
//       矢印。cls の初期値は "fig-shape"。"fig-force" "fig-line" は色つきの矢じり、ほかは黒の矢じり。both で両矢印
//   JHSO.curve("M… C…", cls)            曲がった矢印(path の d をそのまま書く)。矢じりのつけ方は arrow と同じ
//   JHSO.figSet([svg, svg, …])          小さい図を1つの図の中に並べる(広い所では2列、せまい所では1列)
//   線と面のクラス(色はすべてクラスで決める。SVGに色の値を書かない。CSSは両ページの「社会の表示部品」)
//     fig-shape 輪郭 / fig-line 主役の線(色) / fig-line-2 2本目(破線) / fig-dash 補助線 / fig-thin 引き出し線
//     fig-axis 軸 / fig-grid 方眼 / fig-force 太い色の矢印
//     fig-fill(うすい色) fig-fill-2(うすい灰) fig-fill-0(地の色) fig-fill-3(色つき・濃いめ。海や堀) 面(fig-shape と合わせて輪郭をつける)
//     fig-bar 棒グラフの棒 / fig-point 点(色) / fig-solid ぬりつぶした小さな形 / fig-dot 引き出し線の点
//     文字: fig-label(13px) fig-small(12px) fig-title(13px 太字) fig-num(目盛りの数字) fig-halo(線に重なる文字)
//   模様: fill="url(#soc-pat-sand)" のように書く。soc-pat-sand 点(砂漠など) / soc-pat-hatch 斜線
//   JHSO.defs()                          模様と矢じりの定義。両ページが <body> の先頭に1回だけ入れる(データでは呼ばない)
//   図の文字は 12px 以上。図の端から4px以内に文字を置かない。軸の名前は回転させない。
var JHSO = (function () {
  "use strict";

  var STATS_KEY = "juniorHighSocialStats";
  var SETTINGS_KEY = "juniorHighSocialSettings";
  var COUNTS = [5, 10, 20];

  var GRADES = [
    { id: "g1", short: "中1", name: "中学1年" },
    { id: "g2", short: "中2", name: "中学2年" },
    { id: "g3", short: "中3", name: "中学3年" }
  ];

  // 分野。設定画面の小見出し、要点帳の目次、成績の「分野ごとの正答率」は、この順に並ぶ
  var AREAS = ["地理", "歴史", "公民"];

  // ID は保存データのキーなので変えない。
  // name は短い名前(一覧・出題ラベル・目次)、sub は補足(要点帳の見出しの下)。
  // 要点帳のカードを横長にするかどうかは、図(figures)があるかで決まる
  var UNITS = [
    { id: "g1-world-overview", grade: "g1", area: "地理", name: "世界の姿", sub: "六大陸と三大洋・緯度と経度・地図" },
    { id: "g1-japan-overview", grade: "g1", area: "地理", name: "日本の姿", sub: "位置・時差・領域・都道府県" },
    { id: "g1-world-life", grade: "g1", area: "地理", name: "世界の人々の生活と環境", sub: "気候帯・くらし・宗教" },
    { id: "g1-asia", grade: "g1", area: "地理", name: "アジア州" },
    { id: "g1-europe", grade: "g1", area: "地理", name: "ヨーロッパ州" },
    { id: "g1-africa", grade: "g1", area: "地理", name: "アフリカ州" },
    { id: "g1-north-america", grade: "g1", area: "地理", name: "北アメリカ州" },
    { id: "g1-south-america", grade: "g1", area: "地理", name: "南アメリカ州" },
    { id: "g1-oceania", grade: "g1", area: "地理", name: "オセアニア州" },
    { id: "g1-ancient-civilizations", grade: "g1", area: "歴史", name: "人類の出現と古代文明" },
    { id: "g1-jomon-yayoi-kofun", grade: "g1", area: "歴史", name: "縄文・弥生・古墳時代" },
    { id: "g1-asuka-nara", grade: "g1", area: "歴史", name: "飛鳥・奈良時代" },
    { id: "g1-heian", grade: "g1", area: "歴史", name: "平安時代" },
    { id: "g1-kamakura", grade: "g1", area: "歴史", name: "鎌倉時代" },
    { id: "g1-muromachi", grade: "g1", area: "歴史", name: "室町時代" },

    { id: "g2-japan-nature", grade: "g2", area: "地理", name: "日本の地形と気候", sub: "山地・川・平野・海流・気候区分・自然災害" },
    { id: "g2-japan-population-resources", grade: "g2", area: "地理", name: "日本の人口と資源・エネルギー", sub: "人口ピラミッド・過疎と過密・発電" },
    { id: "g2-japan-industry-transport", grade: "g2", area: "地理", name: "日本の産業と交通・通信", sub: "農業・漁業・工業・商業とサービス業・交通網" },
    { id: "g2-kyushu", grade: "g2", area: "地理", name: "九州地方" },
    { id: "g2-chugoku-shikoku", grade: "g2", area: "地理", name: "中国・四国地方" },
    { id: "g2-kinki", grade: "g2", area: "地理", name: "近畿地方" },
    { id: "g2-chubu", grade: "g2", area: "地理", name: "中部地方" },
    { id: "g2-kanto", grade: "g2", area: "地理", name: "関東地方" },
    { id: "g2-tohoku", grade: "g2", area: "地理", name: "東北地方" },
    { id: "g2-hokkaido", grade: "g2", area: "地理", name: "北海道地方" },
    { id: "g2-topographic-map", grade: "g2", area: "地理", name: "地形図の読み取り", sub: "縮尺・等高線・地図記号" },
    { id: "g2-europe-expansion", grade: "g2", area: "歴史", name: "ヨーロッパの世界進出", sub: "ルネサンス・宗教改革・大航海時代・鉄砲とキリスト教" },
    { id: "g2-azuchi-momoyama", grade: "g2", area: "歴史", name: "天下統一と桃山文化", sub: "織田信長・豊臣秀吉" },
    { id: "g2-edo-establishment", grade: "g2", area: "歴史", name: "江戸幕府の成立と鎖国" },
    { id: "g2-edo-reforms", grade: "g2", area: "歴史", name: "産業の発達と幕府の改革", sub: "元禄文化・三大改革・化政文化" },
    { id: "g2-western-revolutions", grade: "g2", area: "歴史", name: "欧米の近代化", sub: "市民革命・産業革命・アジアへの進出" },
    { id: "g2-opening-japan", grade: "g2", area: "歴史", name: "開国と江戸幕府の滅亡" },
    { id: "g2-meiji-restoration", grade: "g2", area: "歴史", name: "明治維新" },
    { id: "g2-constitution", grade: "g2", area: "歴史", name: "立憲制国家の成立", sub: "自由民権運動・大日本帝国憲法" },
    { id: "g2-sino-russo-wars", grade: "g2", area: "歴史", name: "日清・日露戦争と近代産業", sub: "条約改正・産業革命・近代文化" },

    { id: "g3-wwi", grade: "g3", area: "歴史", name: "第一次世界大戦と国際協調" },
    { id: "g3-taisho-democracy", grade: "g3", area: "歴史", name: "大正デモクラシー" },
    { id: "g3-depression", grade: "g3", area: "歴史", name: "世界恐慌と日本の中国侵略" },
    { id: "g3-wwii", grade: "g3", area: "歴史", name: "第二次世界大戦と日本" },
    { id: "g3-postwar", grade: "g3", area: "歴史", name: "戦後の改革と日本の独立", sub: "占領と民主化・冷戦・国際社会への復帰" },
    { id: "g3-contemporary", grade: "g3", area: "歴史", name: "高度経済成長と現代の世界" },
    { id: "g3-modern-society", grade: "g3", area: "公民", name: "現代社会と私たち", sub: "少子高齢化・情報化・グローバル化・文化・対立と合意" },
    { id: "g3-constitution", grade: "g3", area: "公民", name: "日本国憲法の基本原則" },
    { id: "g3-human-rights", grade: "g3", area: "公民", name: "基本的人権" },
    { id: "g3-democracy-elections", grade: "g3", area: "公民", name: "民主政治と選挙", sub: "選挙の原則・選挙制度・政党・世論" },
    { id: "g3-diet-cabinet", grade: "g3", area: "公民", name: "国会と内閣" },
    { id: "g3-courts", grade: "g3", area: "公民", name: "裁判所と三権分立" },
    { id: "g3-local-government", grade: "g3", area: "公民", name: "地方自治" },
    { id: "g3-consumers-market", grade: "g3", area: "公民", name: "消費生活と市場経済", sub: "消費者の権利・流通・価格のはたらき" },
    { id: "g3-production-labor", grade: "g3", area: "公民", name: "生産と企業・労働" },
    { id: "g3-finance", grade: "g3", area: "公民", name: "金融と景気", sub: "銀行・日本銀行・為替" },
    { id: "g3-public-finance", grade: "g3", area: "公民", name: "財政と社会保障" },
    { id: "g3-international", grade: "g3", area: "公民", name: "国際社会と国際連合" },
    { id: "g3-global-issues", grade: "g3", area: "公民", name: "地球規模の課題", sub: "環境・資源とエネルギー・貧困・持続可能な社会" }
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

  // 中身のファイルから呼ぶ。知らないIDは無視する(ページは止めない)
  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("JHSO.register: 登録できません: " + id);
      return;
    }
    content[id] = {
      points: Array.isArray(data.points) ? data.points : [],
      figures: (Array.isArray(data.figures) ? data.figures : []).filter(function (f) { return f && typeof f.html === "string" && f.html; }),
      blocks: (Array.isArray(data.blocks) ? data.blocks : []).filter(function (b) { return typeof b === "string" && b; }),
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
  function attr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function r(kanji, yomi) { return "<ruby>" + kanji + "<rt>" + yomi + "</rt></ruby>"; }
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
  // 表。各行の1つ目は行の見出し(th)。td には、せまい幅で使う列名(data-label)をつける
  function table(o) {
    o = o || {};
    var head = Array.isArray(o.head) ? o.head : [];
    var cls = "soc-table" + (o.compact ? " compact" : "") + (o.stack ? " stack" : "");
    var h = '<div class="tbl-wrap"><table class="' + cls + '">';
    if (o.caption) h += "<caption>" + o.caption + "</caption>";
    if (head.length > 0) {
      h += "<thead><tr>" + head.map(function (c) { return '<th scope="col">' + c + "</th>"; }).join("") + "</tr></thead>";
    }
    h += "<tbody>" + (Array.isArray(o.rows) ? o.rows : []).map(function (row) {
      return "<tr>" + (Array.isArray(row) ? row : [row]).map(function (c, i) {
        if (i === 0) return '<th scope="row">' + c + "</th>";
        return '<td data-label="' + attr(text(head[i] || "")) + '">' + c + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody></table></div>";
    return h;
  }

  function fig(svgHtml, caption) {
    return '<figure class="soc-fig">' + svgHtml + (caption ? "<figcaption>" + caption + "</figcaption>" : "") + "</figure>";
  }
  function figSet(svgs) { return '<div class="fig-set">' + svgs.join("") + "</div>"; }

  // ---------- 図(SVG) ----------
  function px(v) { return String(Math.round(v * 10) / 10); }
  function svg(w, h, label, inner, o) {
    return '<svg class="soc-svg' + (o && o.small ? " is-small" : "") + '" viewBox="0 0 ' + w + " " + h +
      '" role="img" aria-label="' + attr(label || "図") + '">' + inner + "</svg>";
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
  function headId(cls) { return /fig-force|fig-line(\s|$)/.test(cls) ? "soc-arrow-accent" : "soc-arrow"; }
  function arrow(x1, y1, x2, y2, cls, o) {
    cls = cls || "fig-shape";
    var id = headId(cls);
    return '<line class="' + cls + '" x1="' + px(x1) + '" y1="' + px(y1) + '" x2="' + px(x2) + '" y2="' + px(y2) + '"' +
      ' marker-end="url(#' + id + ')"' + (o && o.both ? ' marker-start="url(#' + id + ')"' : "") + "/>";
  }
  function curve(d, cls, o) {
    cls = cls || "fig-shape";
    var id = headId(cls);
    return '<path class="' + cls + '" d="' + d + '" marker-end="url(#' + id + ')"' +
      (o && o.both ? ' marker-start="url(#' + id + ')"' : "") + "/>";
  }
  function link(pts, cls) {
    return '<path class="' + (cls || "fig-shape") + '" d="' + pts.map(function (p, i) {
      return (i === 0 ? "M" : "L") + px(p[0]) + " " + px(p[1]);
    }).join("") + '"/>';
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
  // しくみ図の箱。mark の箱(keys なら key のある箱すべて)は、名前のかわりに記号を出す
  function box(p, o) {
    o = o || {};
    var w = p.w || 72, h = p.h || (p.note ? 38 : 28);
    var s = '<rect class="fig-shape ' + (p.em ? "fig-fill" : "fig-fill-0") + '" x="' + px(p.x - w / 2) + '" y="' + px(p.y - h / 2) +
      '" width="' + px(w) + '" height="' + px(h) + '" rx="5"/>';
    var asKey = !!p.key && (!!o.keys || o.mark === p.key);
    if (asKey) return s + key(p.x, p.y, p.key, { on: !!o.keys && o.mark === p.key });
    if (p.note) {
      return s + txt(p.x, p.y - 2, p.name, { anchor: "middle" }) + txt(p.x, p.y + 13, p.note, { cls: "fig-small", anchor: "middle" });
    }
    return s + txt(p.x, p.y + 4.5, p.name, { anchor: "middle" });
  }
  // 模様と矢じり。両ページが <body> の先頭に1回だけ入れる(display:none にすると模様が出ないので、大きさ0で置く)
  function defs() {
    function pat(id, w, h, inner, extra) {
      return '<pattern id="soc-pat-' + id + '" width="' + w + '" height="' + h + '" patternUnits="userSpaceOnUse"' + (extra || "") + ">" + inner + "</pattern>";
    }
    function head(id, cls) {
      return '<marker id="' + id + '" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse">' +
        '<path class="' + cls + '" d="M0 1L10 5L0 9Z"/></marker>';
    }
    return '<svg class="soc-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      pat("sand", 8, 8, '<circle class="pat-f" cx="2" cy="2" r="1"/><circle class="pat-f" cx="6" cy="6" r="1"/>') +
      pat("hatch", 6, 6, '<path class="pat-s" d="M0 0V6"/>', ' patternTransform="rotate(45)"') +
      head("soc-arrow", "arrow-ink") + head("soc-arrow-accent", "arrow-accent") +
      "</defs></svg>";
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
    ["material", "figure"].forEach(function (k) {
      if (q[k] !== undefined && q[k] !== null && typeof q[k] !== "string") errs.push(k + " が文字列ではない");
    });
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

  // 出題用に形をそろえ、4択の並びをまぜる。図は枠(figure.soc-fig)に入れる
  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    var figure = q.figure || "";
    if (figure && figure.indexOf("<figure") !== 0) figure = fig(figure);
    return {
      unitId: unitId,
      source: "fixed:" + q.id,
      text: q.text,
      figure: figure,
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
    r: r, table: table, steps: steps, rule: rule, text: text, shuffle: shuffle,
    fig: fig, figSet: figSet, svg: svg, txt: txt, key: key, arrow: arrow, curve: curve, link: link,
    labels: labels, box: box, defs: defs,
    checkQuestion: checkQuestion, validFixed: validFixed, buildQuiz: buildQuiz
  };
})();

// 中学理科道場: 中3の単元の中身(要点・図・表・例題・問題)。
// 形式の説明と、表示部品・図の関数(JHS.table、JHS.labels など)は data.js の先頭を参照。書き方は data-g1.js、data-g2.js と同じ。
// 分野ごとに1つの IIFE にまとめる(生物 → 化学 → 物理 → 地学 の順に、うしろへ足していく)。
//
// 内容のきまり:
// ・中3の範囲で書く。高校の内容(イオン化傾向の語、加速度の式、運動方程式、ケプラーの法則など)は問題にしない。
// ・化学式・イオン式・化学反応式は、教科書に載る定番のものだけを使う(JHS.chem)。
// ・教科書によって答えが分かれる問いは作らない。誤答は、明らかに誤りと言えるものにする。
// ・数値の変わる問題は、meta に元の数値と答えを入れる。

// =====================================================================
// 生物(g3-cell-division、g3-reproduction、g3-heredity、g3-evolution、g3-ecosystems)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var r = JHS.r, rule = JHS.rule, q = JHS.q, txt = JHS.txt;
  // 物質やはたらきの流れを1行で見せる箱(公式の箱と同じ見た目で、「=」を出さない)
  function flow(html) { return '<div class="formula"><span class="formula-rhs">' + html + "</span></div>"; }
  function n1(v) { return String(Math.round(v * 10) / 10); }
  function hon(n) { return q(n, "本"); }
  function ko(n) { return q(n, "個"); }
  // 線(class と座標)
  function line(cls, x1, y1, x2, y2, style) {
    return '<line class="' + cls + '" x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '"' +
      (style ? ' style="' + style + '"' : "") + "/>";
  }
  // 染色体1本(太い短い線)。中心(x, y)、長さ len、角度 deg(0 で横向き)
  function rod(x, y, len, deg) {
    var a = (deg || 0) * Math.PI / 180, dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
    return line("fig-shape", x - dx, y - dy, x + dx, y + dy, "stroke-width:3px");
  }
  // 複製された染色体(同じ2本が、平行にそろって組になる)。2本の中心は、角度に直角な向きに half ずつ離す
  function rod2(x, y, len, deg, half) {
    var h = half || 3, a = (deg || 0) * Math.PI / 180, ox = -Math.sin(a) * h, oy = Math.cos(a) * h;
    return rod(x + ox, y + oy, len, deg) + rod(x - ox, y - oy, len, deg);
  }
  // 2つの並び方が同じか
  function sameSeq(a, b) { return a.join(",") === b.join(","); }
  // 並べかえの候補(a の、となりどうしを入れかえたもの)。first を固定するときは 1 から
  function swaps(a, from) {
    var out = [];
    for (var i = from || 0; i < a.length - 1; i++) {
      var b = a.slice(); var t = b[i]; b[i] = b[i + 1]; b[i + 1] = t; out.push(b);
    }
    return out;
  }

  // =====================================================================
  // 3-1 細胞分裂と成長
  // =====================================================================
  // C1 根の先端(横向き。左が根もと側、右が先端)。opts は JHS.labels と同じ。
  // 記号は、A 根もとに近い部分、B 中ほど、C 先端に近い部分(成長点)
  function figRootTip(opts) {
    opts = opts || {};
    var asKey = !!(opts.keys || opts.mark), s = "", i, j;
    var outline = "M14 74H250C280 74 300 90 302 100C300 110 280 126 250 126H14";
    s += '<path class="fig-fill-0" d="' + outline + 'Z"/>';
    // 細胞を区切りの線で描く。x0〜x1 を cols 列、上下 rows 段に分け、核を rr の大きさでかく
    function region(x0, x1, cols, rows, rr) {
      var w = (x1 - x0) / cols, h = 52 / rows, t = "";
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          t += '<rect class="fig-detail" x="' + n1(x0 + i * w) + '" y="' + n1(74 + j * h) + '" width="' + n1(w) + '" height="' + n1(h) + '"/>';
          t += '<circle class="fig-detail fig-fill-2" cx="' + n1(x0 + (i + 0.5) * w) + '" cy="' + n1(74 + (j + 0.5) * h) + '" r="' + rr + '"/>';
        }
      }
      return t;
    }
    s += region(14, 122, 4, 3, 2.6) + region(122, 200, 5, 3, 2.6) + region(200, 252, 6, 4, 2.4);
    // 根の先をおおう部分
    s += '<path class="fig-detail fig-fill-2" d="M252 74C280 74 300 90 302 100C300 110 280 126 252 126Z"/>';
    s += '<path class="fig-detail" d="M262 80C280 86 290 94 292 100C290 106 280 114 262 120"/>';
    s += '<path class="fig-shape" d="' + outline + '"/>';
    s += txt(14, 176, "根もと側", { cls: "fig-small" }) + txt(306, 176, "先端", { cls: "fig-small", anchor: "end" });
    var parts = asKey ? [
      { key: "A", name: "A", from: [68, 100], to: [68, 52], side: "top" },
      { key: "B", name: "B", from: [161, 100], to: [161, 52], side: "top" },
      { key: "C", name: "C", from: [226, 100], to: [226, 52], side: "top" }
    ] : [
      { key: "A", name: "細胞が大きい", from: [68, 100], to: [68, 50], side: "top" },
      { key: "C", name: "成長点", from: [226, 100], to: [226, 50], side: "top" }
    ];
    s += JHS.labels(parts, opts);
    if (!asKey) s += txt(226, 150, "細胞分裂がさかん", { cls: "fig-small", anchor: "middle" });
    return JHS.svg(320, 200, asKey ? "根の先端部分を拡大した図。根もとに近い部分から先端に向かって、記号 A、B、C がついている"
      : "根の先端部分。根もとに近い部分は細胞が大きく、先端に近い成長点には小さい細胞が多い", s);
  }

  // C2 体細胞分裂の各段階(植物の細胞)。染色体は4本。
  // 段階: 0 分裂前、1 染色体が見える(複製ずみ)、2 中央に並ぶ、3 両端に分かれる、4 仕切りができる
  // opts.order: 左から並べる段階の番号(省略すると 0〜4 の順)。opts.keys: true で、名前のかわりに ア〜オ を出す
  var STAGE_NAMES = [["分裂前"], ["染色体が", "見える"], ["中央に", "並ぶ"], ["両端に", "分かれる"], ["仕切りが", "できる"]];
  var KANA = ["ア", "イ", "ウ", "エ", "オ"];
  function divisionStage(k, cx) {
    var cy = 78, s = '<rect class="fig-shape fig-fill-0" x="' + (cx - 27) + '" y="36" width="54" height="84" rx="3"/>';
    var xs = [-18, -6, 6, 18];
    if (k === 0) {
      s += '<circle class="fig-shape fig-fill-2" cx="' + cx + '" cy="' + cy + '" r="15"/>';
    } else if (k === 1) {
      s += '<circle class="fig-dash" cx="' + cx + '" cy="' + cy + '" r="19"/>';
      s += rod2(cx - 7, cy - 7, 9, 30, 3) + rod2(cx + 8, cy - 6, 9, -50, 3) + rod2(cx - 7, cy + 8, 9, 80, 3) + rod2(cx + 8, cy + 8, 9, 10, 3);
    } else if (k === 2) {
      xs.forEach(function (dx) { s += rod2(cx + dx, cy, 6, 0, 3.4); });
    } else if (k === 3) {
      xs.forEach(function (dx) { s += rod(cx + dx, cy - 24, 6, 0) + rod(cx + dx, cy + 24, 6, 0); });
    } else {
      s += line("fig-shape", cx - 27, cy, cx + 27, cy);
      [cy - 21, cy + 21].forEach(function (y) {
        s += '<circle class="fig-shape fig-fill-2" cx="' + cx + '" cy="' + y + '" r="13"/>';
        [-7.5, -2.5, 2.5, 7.5].forEach(function (dx) { s += rod(cx + dx, y, 7, 90); });
      });
    }
    return s;
  }
  function figDivision(opts) {
    opts = opts || {};
    var order = opts.order || [0, 1, 2, 3, 4], s = "";
    order.forEach(function (k, i) {
      var cx = 35 + i * 62;
      s += divisionStage(k, cx);
      if (opts.keys) {
        s += JHS.key(cx, 142, KANA[i]);
      } else {
        s += txt(cx, 26, String(i + 1), { cls: "fig-small", anchor: "middle" });
        STAGE_NAMES[k].forEach(function (l, j) { s += txt(cx, 140 + j * 15, l, { cls: "fig-small", anchor: "middle" }); });
      }
    });
    return JHS.svg(320, 170, opts.keys ? "体細胞分裂のいろいろな段階の細胞の図。5つの細胞に、記号ア〜オがついている"
      : "体細胞分裂の順序。分裂前、染色体が見える、中央に並ぶ、両端に分かれる、仕切りができて2つの細胞になる。染色体の数は、分裂前と分裂後で同じ4本", s);
  }
  // 問題用の並び(ア 中央に並ぶ、イ 分裂前、ウ 仕切り、エ 染色体が見える、オ 両端に分かれる)
  var DIV_ORDER_Q = [2, 0, 4, 1, 3];

  var ROOT_STEPS = JHS.table({
    caption: "根の先端の細胞を観察する手順",
    head: ["操作", "目的"],
    rows: [
      ["根の先端を切り取り、うすい塩酸に入れてあたためる", "細胞と細胞を離れやすくする"],
      ["染色液(" + r("酢酸", "さくさん") + "オルセイン液など)をたらす", "核や染色体を染めて見やすくする"],
      ["カバーガラスをかけ、ろ紙をのせて指で押しつぶす", "細胞の重なりを少なくして、見やすくする"]
    ]
  });

  var CHROMO_ORGS = [
    { name: "タマネギ", n: 16, what: "根の細胞" },
    { name: "ソラマメ", n: 12, what: "根の細胞" },
    { name: "エンドウ", n: 14, what: "根の細胞" },
    { name: "ヒト", n: 46, what: "受精卵" }
  ];

  JHS.register("g3-cell-division", {
    points: [
      "1つの細胞が2つに分かれることを<b>細胞分裂</b>といいます。体をつくる細胞がふえるときの細胞分裂を" + rule("体細胞分裂") + "といいます。植物の根では、" + rule("先端に近い部分(成長点)") + "で細胞分裂がさかんに行われています。",
      "根の先端の細胞は、" + rule("うすい塩酸") + "に入れてあたためて細胞を離れやすくし、" + r("酢酸", "さくさん") + "オルセイン液などの染色液で染め、カバーガラスの上から押しつぶして観察します。",
      "細胞分裂が始まると、核の中に、ひものような" + rule(r("染色体", "せんしょくたい")) + "が見えるようになります。染色体には、生物の形や性質を決める遺伝子がふくまれています。",
      "体細胞分裂の順序: " + rule("染色体が見える → 中央に並ぶ → 2つに分かれて両端へ移動する → 仕切りができて2つの細胞になる") + "。植物の細胞では中央に仕切りができ、動物の細胞では、細胞がくびれて2つに分かれます。",
      "分裂の前に、染色体は" + rule(r("複製", "ふくせい")) + "されて2倍の量になり、それが2つの細胞に等しく分かれます。そのため、" + rule("分裂後の細胞の染色体の数は、もとの細胞と同じ") + "です。染色体の数は、生物の種類によって決まっています(ヒトは46本)。",
      "生物の体が成長するのは、" + rule("細胞分裂で細胞の数がふえ、ふえた1つ1つの細胞が大きくなる") + "からです。"
    ],
    figures: [
      { html: figRootTip(), caption: "根の先端部分。先端に近い成長点では小さな細胞が細胞分裂をさかんに行い、根もとに近い部分ほど細胞が大きくなっています。" },
      { html: figDivision(), caption: "植物の細胞の体細胞分裂(1→5の順)。2〜3の染色体は、複製されて2本ずつが組になっています。5でできた2つの細胞は、どちらも、もとと同じ4本の染色体をもちます。" }
    ],
    blocks: [
      ROOT_STEPS,
      flow("体細胞分裂: 染色体が複製される → 染色体が見える → 中央に並ぶ → 両端に分かれる → 2つの細胞になる")
    ],
    example: {
      title: "タマネギの根の細胞の染色体の数は16本です。この細胞が体細胞分裂をしてできた2つの細胞の、それぞれの染色体の数は何本ですか。",
      steps: [
        "分裂の前に、染色体は複製されて2倍の量になります。",
        "複製された染色体は2つに分かれて、両端へ移動し、2つの細胞に等しく入ります。",
        "そのため、分裂してできた細胞の染色体の数は、もとの細胞と同じです。半分にはなりません。"
      ],
      result: "どちらも 16本"
    },
    fixed: [
      {
        id: "fig-growth-point",
        text: "図は、タマネギの根の先端部分を拡大したものです。細胞分裂がさかんに行われているのは、A〜C のどの部分ですか。",
        figure: figRootTip({ keys: true }),
        choices: ["C", "A", "B", "どの部分も同じ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "根の先端に近い C(成長点)には小さな細胞が多く、細胞分裂がさかんに行われています。",
          "根もとに近い A の細胞は、分裂したあとに大きくなった細胞です。"
        ]
      },
      {
        id: "fig-large-cells",
        text: "図は、タマネギの根の先端部分を拡大したものです。1つ1つの細胞が最も大きいのは、A〜C のどの部分ですか。",
        figure: figRootTip({ keys: true }),
        choices: ["A", "B", "C", "どの部分も同じ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "根もとに近い A の細胞が最も大きくなっています。分裂でふえた細胞が、大きくなったものです。",
          "先端に近い C は、分裂したばかりの小さな細胞が多い部分です。"
        ]
      },
      {
        id: "hcl",
        text: "タマネギの根の先端の細胞を観察するとき、根をうすい塩酸に入れてあたためるのは、なぜですか。",
        choices: [
          "細胞と細胞を離れやすくするため",
          "核や染色体を赤紫色に染めるため",
          "細胞分裂をさかんにするため",
          "細胞を大きくして見やすくするため"
        ],
        answer: 0,
        explain: [
          "うすい塩酸に入れてあたためると、細胞どうしの結びつきが弱くなり、1つ1つの細胞が離れやすくなります。",
          "核や染色体を染めるのは、酢酸オルセイン液などの染色液です。"
        ]
      },
      {
        id: "stain",
        text: "細胞分裂のようすを観察するとき、核や染色体を染めて見やすくするために使う液はどれですか。",
        choices: ["酢酸オルセイン液", "うすい塩酸", "ヨウ素液", "BTB溶液"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "酢酸オルセイン液(赤紫色)や酢酸カーミン液(赤色)は、核や染色体をよく染めます。",
          "うすい塩酸は細胞を離れやすくするため、ヨウ素液はデンプンを調べるために使います。"
        ]
      },
      {
        id: "press",
        text: "根の先端をスライドガラスにのせて染色し、カバーガラスをかけたあと、ろ紙をのせて指で押しつぶしました。押しつぶすのは、なぜですか。",
        choices: [
          "細胞の重なりを少なくして、1つ1つの細胞を見やすくするため",
          "細胞をこわして、核を細胞の外に出すため",
          "染色液を細胞の中から追い出すため",
          "細胞分裂を止めて、染色体を見えるようにするため"
        ],
        answer: 0,
        explain: [
          "押しつぶすと、細胞が重ならずにうすく広がるので、1つ1つの細胞が観察しやすくなります。",
          "細胞をこわして核を取り出すためではありません。"
        ]
      },
      {
        id: "fig-chromosome",
        text: "図は、タマネギの根の先端で見られた、体細胞分裂のいろいろな段階の細胞を表しています。エの細胞の核の中に見える、ひものようなものを何といいますか。",
        figure: figDivision({ keys: true, order: DIV_ORDER_Q }),
        choices: ["染色体", "葉緑体", "細胞壁", "液胞"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "細胞分裂が始まると、核の中に、ひものような<b>染色体</b>が見えるようになります。",
          "葉緑体・細胞壁・液胞は、細胞分裂のときに現れるものではありません。"
        ]
      },
      {
        id: "fig-metaphase",
        text: "図は、体細胞分裂のいろいろな段階の細胞を表しています。染色体が細胞の中央に並んでいるのは、ア〜オのどれですか。",
        figure: figDivision({ keys: true, order: DIV_ORDER_Q }),
        choices: ["ア", "エ", "オ", "ウ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "アでは、複製された染色体が、細胞の中央に横一列に並んでいます。",
          "エは染色体が見え始めたところ、オは染色体が両端に分かれたところ、ウは仕切りができて2つの細胞になったところです。"
        ]
      },
      {
        id: "replicate",
        text: "体細胞分裂が始まる前に、染色体に起こることとして正しいものはどれですか。",
        choices: [
          "複製されて、2倍の量になる",
          "半分に分かれて、数が半分になる",
          "とけて、なくなる",
          "変化しない"
        ],
        answer: 0,
        explain: [
          "分裂の前に染色体は複製されて2倍の量になり、分裂のときに2つの細胞に等しく分かれます。",
          "そのため、分裂してできた細胞の染色体の数は、もとの細胞と同じになります。"
        ]
      },
      {
        id: "count-after",
        text: "染色体の数が16本の細胞が体細胞分裂をしました。分裂してできた1つの細胞の染色体の数は何本ですか。",
        choices: [hon(16), hon(8), hon(32), hon(4)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "体細胞分裂では、複製されて2倍になった染色体が、2つの細胞に等しく分かれます。",
          "分裂してできた細胞の染色体の数は、もとの細胞と同じ16本です。8本(半分)にはなりません。"
        ]
      },
      {
        id: "growth",
        text: "植物の根や茎がのびて成長するしくみとして、正しいものはどれですか。",
        choices: [
          "細胞分裂で細胞の数がふえ、ふえた細胞がそれぞれ大きくなる",
          "細胞の数は変わらず、1つ1つの細胞が大きくなるだけである",
          "細胞分裂で細胞の数がふえるが、1つ1つの細胞は小さくなっていく",
          "細胞どうしが合体して、大きな細胞になる"
        ],
        answer: 0,
        explain: [
          "生物の体は、細胞分裂で細胞の数がふえることと、1つ1つの細胞が大きくなることで成長します。",
          "どちらか一方だけではありません。"
        ]
      },
      {
        id: "root-marks",
        text: "ソラマメの根に、先端から等しい間隔で印をつけました。2日後、印の間隔が最も広がっているのは、根のどの部分だと考えられますか。",
        choices: [
          "先端に近い部分",
          "根もとに近い部分",
          "根の中ほどの部分",
          "どの部分も同じように広がる"
        ],
        answer: 0,
        explain: [
          "根の先端に近い部分では、細胞分裂で細胞の数がふえ、その細胞が大きくなるので、よくのびます。",
          "根もとに近い部分は、細胞がすでに大きくなっているので、あまりのびません。"
        ]
      },
      {
        id: "gene-in-chromosome",
        text: "染色体について、正しいものはどれですか。",
        choices: [
          "生物の形や性質を決める遺伝子がふくまれている",
          "植物の細胞だけにあり、動物の細胞にはない",
          "細胞分裂のたびに、数が半分ずつに減っていく",
          "どの生物でも、数は46本と決まっている"
        ],
        answer: 0,
        explain: [
          "染色体には、生物の形や性質(形質)を決める遺伝子がふくまれています。動物の細胞にもあります。",
          "染色体の数は生物の種類によって決まっていて、ヒトは46本です。体細胞分裂では数は変わりません。"
        ]
      },
      {
        id: "animal-division",
        text: "動物の細胞が体細胞分裂をするとき、最後に2つの細胞に分かれるようすとして正しいものはどれですか。",
        choices: [
          "細胞がくびれて、2つに分かれる",
          "細胞の中央に細胞壁の仕切りができる",
          "核だけが2つになり、細胞は1つのままである",
          "染色体だけが細胞の外に出る"
        ],
        answer: 0,
        explain: [
          "動物の細胞は、細胞の中央がくびれて2つに分かれます。",
          "中央に仕切りができて2つに分かれるのは、細胞壁のある植物の細胞です。"
        ]
      },
      {
        id: "first-step",
        text: "体細胞分裂のようすを、次の4つの説明で表しました。分裂の進む順に並べたものはどれですか。<br>a 染色体が細胞の中央に並ぶ<br>b 核の中に染色体が見えるようになる<br>c 仕切りができて、2つの細胞になる<br>d 染色体が2つに分かれ、両端に移動する",
        choices: ["b → a → d → c", "a → b → d → c", "b → d → a → c", "b → a → c → d"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "核の中に染色体が見える(b) → 中央に並ぶ(a) → 両端に分かれる(d) → 仕切りができて2つの細胞になる(c) の順です。",
          "染色体が両端に分かれてから、2つの細胞に分かれます。"
        ]
      }
    ],
    generators: [
      {
        id: "division-order",
        label: "体細胞分裂の段階の図を、分裂の順に並べる",
        make: function () {
          var order = JHS.shuffle([0, 1, 2, 3, 4]);
          function keyOf(stage) { return KANA[order.indexOf(stage)]; }
          function seqText(seq) { return seq.map(keyOf).join(" → "); }
          var right = [0, 1, 2, 3, 4];
          var wrongs = swaps(right, 1).concat([[0, 3, 2, 1, 4], [0, 2, 1, 4, 3]]).map(seqText);
          var c = JHS.choices4(seqText(right), wrongs);
          if (!c) return null;
          return {
            text: "図は、植物の根の先端で見られた、体細胞分裂のいろいろな段階の細胞です。ア〜オを、分裂前の細胞から始めて、細胞分裂の進む順に並べたものはどれですか。",
            figure: figDivision({ keys: true, order: order }),
            choices: c.choices, answer: c.answer,
            explain: [
              "分裂前の細胞(" + keyOf(0) + ") → 核の中に染色体が見える(" + keyOf(1) + ") → 染色体が中央に並ぶ(" + keyOf(2) + ") → 両端に分かれる(" + keyOf(3) + ") → 仕切りができて2つの細胞になる(" + keyOf(4) + ") の順です。",
              "染色体は、中央に並んでから2つに分かれ、両端へ移動します。2つの細胞に分かれるのは、そのあとです。"
            ],
            meta: { order: order.map(function (k) { return STAGE_NAMES[k].join(""); }), answer: seqText(right) }
          };
        }
      },
      {
        id: "division-count",
        label: "体細胞分裂をくり返したときの細胞の数と染色体の数",
        make: function () {
          var o = JHS.pick(CHROMO_ORGS), k = JHS.pick([3, 4, 5]), n = o.n, cells = Math.pow(2, k);
          function pair(c, h) { return ko(c) + "・" + hon(h); }
          var c = JHS.choices4(pair(cells, n), [pair(2 * k, n), pair(cells, n / 2), pair(cells, n * 2), pair(2 * k, n / 2), pair(cells, n * cells)]);
          if (!c) return null;
          var twos = [];
          for (var i = 0; i < k; i++) twos.push("2");
          return {
            text: o.name + "の体細胞の染色体の数は" + n + "本です。" + o.name + "の1つの" + o.what + "が体細胞分裂を" + k + "回くり返すと、細胞は何個になりますか。また、そのときの1つの細胞の染色体の数は何本ですか。どの細胞も同じように分裂するものとします。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "1回の分裂で、細胞の数は2倍になります。" + k + "回くり返すと、2を" + k + "回かけた数になります。",
              JHS.calc(twos.join(" × "), cells + " 個"),
              "体細胞分裂では、分裂してできた細胞の染色体の数は、もとの細胞と同じ" + n + "本のままです。"
            ],
            meta: { organism: o.name, chromosomes: n, times: k, cells: cells, answer: cells }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-2 生物のふえ方
  // =====================================================================
  // C3 受粉したあとのめしべ(縦の断面)。opts は JHS.labels と同じ。
  // 記号は、A 柱頭、B 花粉、C 花粉管、D 精細胞、E 卵細胞、F 胚珠、G 子房
  function figPistil(opts) {
    opts = opts || {};
    var asKey = !!(opts.keys || opts.mark), s = "";
    // 子房と、柱頭まで続く花柱
    s += '<path class="fig-shape fig-fill-0" d="M112 42V122C80 128 66 150 66 170C66 198 90 214 120 214C150 214 174 198 174 170C174 150 160 128 128 122V42Z"/>';
    s += '<ellipse class="fig-shape fig-fill-2" cx="120" cy="36" rx="24" ry="8"/>';
    s += '<ellipse class="fig-shape fig-fill-2" cx="120" cy="174" rx="22" ry="28"/>';   // 胚珠
    s += '<circle class="fig-shape fig-fill" cx="120" cy="156" r="6"/>';                  // 卵細胞
    // 花粉と花粉管
    s += '<circle class="fig-shape fig-fill" cx="106" cy="24" r="8"/>';
    s += '<path class="fig-line" d="M109 31C114 50 120 60 120 80V144"/>';
    s += '<circle class="fig-solid" cx="120" cy="118" r="3"/><circle class="fig-solid" cx="120" cy="130" r="3"/>';
    s += JHS.labels([
      { key: "A", name: "柱頭", from: [140, 36], to: [196, 34] },
      { key: "B", name: "花粉", from: [98, 22], to: [60, 22], side: "left" },
      { key: "C", name: "花粉管", from: [120, 84], to: [196, 70] },
      { key: "D", name: "精細胞", from: [122, 124], to: [196, 104] },
      { key: "E", name: "卵細胞", from: [125, 158], to: [196, 140] },
      { key: "F", name: "胚珠", from: [138, 186], to: [196, 176] },
      { key: "G", name: "子房", from: [166, 200], to: [196, 210] }
    ], opts);
    return JHS.svg(320, 240, asKey ? "受粉したあとの、めしべの断面の図。部分に記号がついている"
      : "受粉したあとのめしべの断面。柱頭についた花粉から花粉管が胚珠までのび、花粉管の中の精細胞が、胚珠の中の卵細胞へ向かう", s);
  }

  // C4 生殖細胞と受精での染色体の数(体細胞の染色体が4本の動物)。
  // 雄からの染色体はぬりつぶした棒、雌からの染色体は中が空いた棒で表す
  function figChromoHalf() {
    var s = "";
    function solid(x, y, len) { return rod(x, y, len, 90); }
    function hollow(x, y, len) {
      return '<rect class="fig-shape fig-fill-0" x="' + n1(x - 2.5) + '" y="' + n1(y - len / 2) + '" width="5" height="' + len + '" rx="2" style="stroke-width:1.5px"/>';
    }
    function set(f, x, y, both) {
      // 長い染色体と短い染色体。both で、長短それぞれ2本ずつ
      return both ? f(x - 12, y, 18) + f(x - 4, y, 18) + f(x + 4, y, 10) + f(x + 12, y, 10) : f(x - 4, y, 18) + f(x + 4, y, 10);
    }
    // 雄の体細胞 → 精子
    s += '<circle class="fig-shape fig-fill-0" cx="60" cy="56" r="24"/>' + set(solid, 60, 56, true);
    s += txt(60, 22, "雄の体細胞", { anchor: "middle" });
    s += JHS.arrow(60, 82, 60, 110, "fig-shape") + txt(68, 100, "減数分裂", { cls: "fig-small" });
    s += '<path class="fig-shape" d="M44 136C34 130 28 142 18 136"/>';
    s += '<circle class="fig-shape fig-fill-0" cx="60" cy="136" r="16"/>' + set(solid, 60, 136, false);
    s += txt(60, 168, "精子", { anchor: "middle" });
    // 雌の体細胞 → 卵
    s += '<circle class="fig-shape fig-fill-0" cx="260" cy="56" r="24"/>' + set(hollow, 260, 56, true);
    s += txt(260, 22, "雌の体細胞", { anchor: "middle" });
    s += JHS.arrow(260, 82, 260, 108, "fig-shape") + txt(252, 100, "減数分裂", { cls: "fig-small", anchor: "end" });
    s += '<circle class="fig-shape fig-fill-0" cx="260" cy="136" r="22"/>' + set(hollow, 260, 136, false);
    s += txt(260, 174, "卵", { anchor: "middle" });
    // 受精卵
    s += JHS.arrow(80, 146, 132, 192, "fig-shape") + JHS.arrow(240, 152, 188, 192, "fig-shape");
    s += txt(160, 168, "受精", { cls: "fig-small", anchor: "middle" });
    s += '<circle class="fig-shape fig-fill-0" cx="160" cy="210" r="24"/>';
    s += solid(148, 210, 18) + hollow(156, 210, 18) + solid(164, 210, 10) + hollow(172, 210, 10);
    s += txt(196, 214, "受精卵", { cls: "fig-label" });
    // 本数
    s += txt(92, 60, "4本", { cls: "fig-small" }) + txt(80, 140, "2本", { cls: "fig-small" });
    s += txt(228, 60, "4本", { cls: "fig-small", anchor: "end" }) + txt(236, 140, "2本", { cls: "fig-small", anchor: "end" });
    s += txt(124, 214, "4本", { cls: "fig-small", anchor: "end" });
    return JHS.svg(320, 240, "体細胞の染色体が4本の動物。減数分裂で、精子と卵の染色体は2本になり、受精した受精卵は4本にもどる。受精卵には、雄からの染色体と雌からの染色体が2本ずつある", s);
  }

  var REPRO_KINDS = JHS.table({
    caption: "無性生殖と有性生殖",
    head: ["ふえ方", "しくみ", "例"],
    rows: [
      ["無性生殖", "受精をせず、親の体の一部が分かれて新しい個体になる。子は親と同じ形質。", "ゾウリムシ・アメーバの分裂、ジャガイモのいも、ヤマノイモのむかご、オランダイチゴのほふく茎、さし木"],
      ["有性生殖", "雌と雄の生殖細胞が受精して子ができる。子は両親から遺伝子を半分ずつ受けつぐ。", "カエル、メダカ、ヒト、エンドウ、アブラナ"]
    ]
  });

  // 染色体の数の問題に使う生物(体細胞の染色体の数は4の倍数のものだけ)
  var GAMETE_ORGS = [
    { name: "タマネギ", n: 16, plant: true },
    { name: "ソラマメ", n: 12, plant: true },
    { name: "チンパンジー", n: 48, plant: false },
    { name: "ある動物", n: 20, plant: false },
    { name: "ある植物", n: 24, plant: true }
  ];

  JHS.register("g3-reproduction", {
    points: [
      "生物が自分と同じ種類の新しい個体をつくることを<b>生殖</b>といいます。受精をせずに、親の体の一部が分かれて新しい個体ができるふえ方を" + rule("無性生殖") + "といい、ゾウリムシやアメーバの<b>分裂</b>などがあります。",
      "植物が、体の一部から新しい個体をつくる無性生殖を" + rule("栄養生殖") + "といいます。ジャガイモのいも、ヤマノイモのむかご、オランダイチゴのほふく茎、さし木などです。無性生殖の子は、親の遺伝子をそのまま受けつぐので、" + rule("親と同じ形質") + "になります。このような、同じ遺伝子をもつ個体の集団を<b>クローン</b>といいます。",
      "雌と雄の<b>生殖細胞</b>(動物では卵と精子)の核が合体することを" + rule("受精") + "といい、できた細胞を<b>受精卵</b>といいます。受精によって子をつくるふえ方が" + rule("有性生殖") + "です。",
      "受精卵は細胞分裂をくり返して<b>" + r("胚", "はい") + "</b>になり、やがて親と同じような体になります。受精卵から体のつくりが完成していくまでの過程を" + rule("発生") + "といいます(カエル: 受精卵 → 胚 → おたまじゃくし → カエル)。",
      "被子植物では、花粉が柱頭につくと、" + rule("花粉管") + "が" + r("胚珠", "はいしゅ") + "に向かってのびます。花粉管の中の<b>精細胞</b>と、胚珠の中の<b>卵細胞</b>が受精し、受精卵は胚になります。" + rule("胚珠全体は種子に、子房は果実に") + "なります。",
      "生殖細胞は、" + rule("染色体の数が半分になる") + "特別な細胞分裂(" + rule("減数分裂") + ")でつくられます。受精すると、受精卵の染色体の数は体細胞と同じにもどります。有性生殖の子は両親の遺伝子を半分ずつ受けつぐので、親と異なる形質が現れることがあります。"
    ],
    figures: [
      { html: figPistil(), caption: "受粉したあとのめしべ。花粉管の中を精細胞が運ばれ、胚珠の中の卵細胞と受精します。" },
      { html: figChromoHalf(), caption: "体細胞の染色体が4本の動物の場合。受精卵のうち、ぬりつぶした棒は精子(雄)から、中が空いた棒は卵(雌)から受けついだ染色体です。生殖細胞は2本、受精卵は4本になります。" }
    ],
    blocks: [
      REPRO_KINDS,
      flow("植物: 受粉 → 花粉管がのびる → 精細胞と卵細胞が受精 → 受精卵 → 胚(胚珠 → 種子、子房 → 果実)"),
      flow("染色体の数: 体細胞 → 減数分裂で生殖細胞(半分) → 受精で受精卵(もとの数)")
    ],
    example: {
      title: "チンパンジーの体細胞の染色体の数は48本です。チンパンジーの精子と受精卵の染色体の数は、それぞれ何本ですか。",
      steps: [
        "精子は生殖細胞なので、減数分裂でつくられ、染色体の数は体細胞の半分になります。",
        JHS.calc("48 本 ÷ 2", "24 本"),
        "受精卵は、精子(24本)と卵(24本)の核が合体してできるので、体細胞と同じ数にもどります。",
        JHS.calc("24 本 + 24 本", "48 本")
      ],
      result: "精子 24本、受精卵 48本"
    },
    fixed: [
      {
        id: "asexual-def",
        text: "無性生殖の説明として、正しいものはどれですか。",
        choices: [
          "受精をせずに、親の体の一部が分かれて新しい個体ができる",
          "雌と雄の生殖細胞が受精して、新しい個体ができる",
          "花粉が柱頭について、種子ができる",
          "生殖細胞の染色体の数が半分になる細胞分裂"
        ],
        answer: 0,
        explain: [
          "無性生殖は受精をしないふえ方で、親の体の一部が分かれて新しい個体になります。",
          "受精によって子をつくるのは有性生殖です。種子は、受精してできるものです。"
        ]
      },
      {
        id: "vegetative",
        text: "次のうち、植物の栄養生殖にあたるものはどれですか。",
        choices: [
          "ジャガイモのいもを植えると、芽が出て新しい個体ができる",
          "エンドウの種子をまくと、芽が出て新しい個体ができる",
          "アブラナの花粉がめしべの柱頭について、種子ができる",
          "マツの花粉が風で運ばれて、胚珠につく"
        ],
        answer: 0,
        explain: [
          "ジャガイモのいもは茎の一部が変化したもので、いもから新しい個体ができるのは栄養生殖(無性生殖)です。",
          "種子は受精によってできるので、種子からふえるのは有性生殖です。"
        ]
      },
      {
        id: "asexual-trait",
        text: "オランダイチゴは、ほふく茎(地面をはうようにのびる茎)の先から新しい個体をつくってふえます。この新しい個体の形質について、正しいものはどれですか。",
        choices: [
          "親と同じ遺伝子を受けつぐので、親と同じ形質になる",
          "両親の遺伝子を半分ずつ受けつぐので、親と異なる形質になることがある",
          "親の遺伝子の半分だけを受けつぐので、親よりも小さくなる",
          "遺伝子を受けつがないので、形質は親と関係なく決まる"
        ],
        answer: 0,
        explain: [
          "ほふく茎でふえるのは無性生殖(栄養生殖)です。子は親の遺伝子をそのまま受けつぐので、親と同じ形質になります。",
          "両親の遺伝子を半分ずつ受けつぐのは、有性生殖です。"
        ]
      },
      {
        id: "clone",
        text: "さし木でふやしたキクのように、起源が同じで、同じ遺伝子をもつ個体の集団を何といいますか。",
        choices: ["クローン", "純系", "胚", "受精卵"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "無性生殖でできた、同じ遺伝子をもつ個体の集団をクローンといいます。",
          "純系は、自家受粉などで何代重ねても同じ形質が現れる系統のことです。"
        ]
      },
      {
        id: "fertilization",
        text: "受精とは、どのようなことですか。",
        choices: [
          "雌と雄の生殖細胞の核が合体すること",
          "花粉がめしべの柱頭につくこと",
          "受精卵が細胞分裂をくり返すこと",
          "親の体が2つに分かれること"
        ],
        answer: 0,
        explain: [
          "卵と精子(植物では卵細胞と精細胞)の核が合体することを受精といいます。",
          "花粉が柱頭につくことは受粉です。受粉のあと、花粉管がのびて受精が起こります。"
        ]
      },
      {
        id: "frog-order",
        text: "カエルの発生の順として、正しいものはどれですか。",
        choices: [
          "受精卵 → 胚 → おたまじゃくし → カエル",
          "胚 → 受精卵 → おたまじゃくし → カエル",
          "受精卵 → おたまじゃくし → 胚 → カエル",
          "おたまじゃくし → 受精卵 → 胚 → カエル"
        ],
        answer: 0,
        explain: [
          "受精卵は細胞分裂をくり返して胚になり、胚が育っておたまじゃくしになり、やがてカエルになります。",
          "胚は、受精卵が細胞分裂を始めてから、自分で食物をとり始めるまでの間の子のことです。"
        ]
      },
      {
        id: "development",
        text: "受精卵が細胞分裂をくり返して胚になり、体のつくりが完成していくまでの過程を何といいますか。",
        choices: ["発生", "受粉", "減数分裂", "栄養生殖"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "受精卵から体のつくりが完成していくまでの過程を、発生といいます。",
          "減数分裂は、生殖細胞をつくるときの細胞分裂です。"
        ]
      },
      {
        id: "fig-pollen-tube",
        text: "図は、受粉したあとのめしべの断面を表しています。花粉から胚珠に向かってのびている管 C を何といいますか。",
        figure: figPistil({ keys: true, mark: "C" }),
        choices: ["花粉管", "道管", "師管", "柱頭"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "花粉が柱頭につくと、花粉から胚珠に向かって<b>花粉管</b>がのびます。",
          "道管・師管は、水や養分が通る管です。柱頭は A です。"
        ]
      },
      {
        id: "fig-sperm-egg",
        text: "図は、受粉したあとのめしべの断面です。花粉管の中を運ばれ、胚珠の中の卵細胞と受精するものは、A〜G のどれですか。",
        figure: figPistil({ keys: true }),
        choices: ["D", "B", "E", "F"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "D は精細胞で、花粉管の中を運ばれ、胚珠の中の卵細胞(E)と受精します。",
          "B は花粉、F は胚珠です。"
        ]
      },
      {
        id: "fig-seed",
        text: "図は、受粉したあとのめしべの断面です。受精したあと、成長して種子になるのは、A〜G のどれですか。",
        figure: figPistil({ keys: true }),
        choices: ["F", "G", "E", "A"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "胚珠(F)全体が種子になります。胚珠の中の受精卵(卵細胞 E が受精したもの)は、種子の中の胚になります。",
          "子房(G)は果実になります。"
        ]
      },
      {
        id: "meiosis",
        text: "生殖細胞がつくられるときの、減数分裂の説明として正しいものはどれですか。",
        choices: [
          "染色体の数が、もとの細胞の半分になる",
          "染色体の数が、もとの細胞の2倍になる",
          "染色体の数が、もとの細胞と同じになる",
          "染色体がなくなる"
        ],
        answer: 0,
        explain: [
          "減数分裂では、生殖細胞の染色体の数が、体細胞の半分になります。",
          "受精すると、受精卵の染色体の数は体細胞と同じにもどります。体細胞分裂では、数は変わりません。"
        ]
      },
      {
        id: "fig-chromo-zygote",
        text: "図は、体細胞の染色体が4本の動物で、生殖細胞ができて受精するまでの染色体の数を表しています。減数分裂が行われないとすると、受精卵の染色体の数はどうなると考えられますか。",
        figure: figChromoHalf(),
        choices: [
          "8本になり、世代ごとに2倍にふえていく",
          "4本のまま変わらない",
          "2本になり、世代ごとに半分に減っていく",
          "生殖細胞の染色体だけが残り、2本になる"
        ],
        answer: 0,
        explain: [
          "減数分裂がないと、精子も卵も4本のままなので、受精卵は 4本 + 4本 = 8本 になります。",
          "減数分裂で生殖細胞の染色体を半分にしておくので、受精卵は親と同じ4本になり、世代をこえて数が保たれます。"
        ]
      },
      {
        id: "sexual-variety",
        text: "有性生殖でできた子に、親と異なる形質が現れることがあるのは、なぜですか。",
        choices: [
          "両親から遺伝子を半分ずつ受けつぐから",
          "親の遺伝子をそのまま受けつぐから",
          "受精卵の染色体の数が親の半分だから",
          "体細胞分裂のたびに遺伝子が入れかわるから"
        ],
        answer: 0,
        explain: [
          "有性生殖では、子は両親の遺伝子を半分ずつ受けつぐので、遺伝子の組み合わせが親と変わり、親と異なる形質が現れることがあります。",
          "受精卵の染色体の数は、親の体細胞と同じです。"
        ]
      },
      {
        id: "fruit",
        text: "被子植物で、受精のあと果実になるのは、花のどの部分ですか。",
        choices: ["子房", "胚珠", "柱頭", "やく"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "子房は果実になります。",
          "胚珠は種子になります。柱頭は花粉がつく所、やくは花粉が入っている所です。"
        ]
      }
    ],
    generators: [
      {
        id: "gamete-chromosomes",
        label: "生殖細胞・受精卵の染色体の数",
        make: function () {
          var o = JHS.pick(GAMETE_ORGS), n = o.n, h = n / 2;
          var male = o.plant ? "精細胞" : "精子", female = o.plant ? "卵細胞" : "卵";
          var kind = JHS.pick(["gamete", "zygote", "back"]);
          var ans, wrongs, ask, explain, given;
          var again = o.name.indexOf("ある") === 0 ? "この" + o.name.slice(2) : o.name;
          var g = JHS.pick([male, female]);
          if (kind === "gamete") {
            given = "体細胞の染色体の数は" + n + "本です。";
            ask = again + "の" + g + "の染色体の数は何本ですか。";
            ans = h; wrongs = [n, n * 2, h / 2];
            explain = [g + "は生殖細胞で、減数分裂でつくられるので、染色体の数は体細胞の半分になります。", JHS.calc(n + " 本 ÷ 2", h + " 本")];
          } else if (kind === "zygote") {
            given = "体細胞の染色体の数は" + n + "本です。";
            ask = again + "の受精卵の染色体の数は何本ですか。";
            ans = n; wrongs = [h, n * 2, h / 2];
            explain = [male + "と" + female + "の染色体は、減数分裂で、それぞれ体細胞の半分の" + h + "本になっています。", JHS.calc(h + " 本 + " + h + " 本", n + " 本"), "受精卵の染色体の数は、体細胞と同じです。"];
          } else {
            given = g + "の染色体の数は" + h + "本です。";
            ask = again + "の体細胞の染色体の数は何本ですか。";
            ans = n; wrongs = [h, h / 2, n * 2];
            explain = [g + "は減数分裂でつくられるので、染色体の数は体細胞の半分です。", "体細胞の染色体の数は、" + g + "の2倍になります。", JHS.calc(h + " 本 × 2", n + " 本")];
          }
          var c = JHS.choices4(hon(ans), wrongs.map(hon));
          if (!c) return null;
          return {
            text: o.name + "の" + given + ask,
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: explain,
            meta: { organism: o.name, kind: kind, cell: kind === "zygote" ? "受精卵" : g, body: n, answer: ans }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-3 遺伝の規則性
  // =====================================================================
  // エンドウの種子。round で丸、そうでなければしわ
  function pea(x, y, round, rr) {
    rr = rr || 14;
    if (round) return '<circle class="fig-shape fig-fill" cx="' + x + '" cy="' + y + '" r="' + rr + '"/>';
    var d = "", k, n = 10;
    for (k = 0; k < n; k++) {
      var a0 = k / n * 2 * Math.PI, am = (k + 0.5) / n * 2 * Math.PI, a1 = (k + 1) / n * 2 * Math.PI;
      if (k === 0) d += "M" + n1(x + rr * 0.86 * Math.cos(a0)) + " " + n1(y + rr * 0.86 * Math.sin(a0));
      d += "Q" + n1(x + rr * 1.08 * Math.cos(am)) + " " + n1(y + rr * 1.08 * Math.sin(am)) + " " + n1(x + rr * 0.86 * Math.cos(a1)) + " " + n1(y + rr * 0.86 * Math.sin(a1));
    }
    return '<path class="fig-shape fig-fill" d="' + d + 'Z"/>';
  }
  // C5 メンデルの実験(親 → 子 → 孫)。
  // opts.ask: "child" で子の遺伝子の組み合わせを「?」にする。"grand" で孫の遺伝子をかくし、ア〜エをつける
  function figPeaCross(opts) {
    opts = opts || {};
    var s = "";
    s += txt(12, 44, "親") + txt(12, 124, "子") + txt(12, 194, "孫");
    s += pea(110, 40, true) + pea(210, 40, false) + txt(160, 45, "×", { anchor: "middle" });
    s += txt(110, 74, "丸 AA", { cls: "fig-small", anchor: "middle" }) + txt(210, 74, "しわ aa", { cls: "fig-small", anchor: "middle" });
    s += JHS.arrow(160, 56, 160, 98, "fig-shape");
    s += pea(160, 118, true);
    s += txt(182, 123, opts.ask === "child" ? "丸 ?" : "丸 Aa", { cls: "fig-small" });
    s += txt(230, 123, "すべて丸", { cls: "fig-small" });
    s += JHS.arrow(160, 136, 160, 166, "fig-shape") + txt(168, 156, "自家受粉", { cls: "fig-small" });
    var G = [["AA", true], ["Aa", true], ["Aa", true], ["aa", false]];
    G.forEach(function (g, i) {
      var x = 70 + i * 60;
      s += pea(x, 190, g[1], 13);
      if (opts.ask === "grand") s += JHS.key(x, 222, KANA[i]);
      else if (opts.ask !== "child") s += txt(x, 226, (g[1] ? "丸 " : "しわ ") + g[0], { cls: "fig-small", anchor: "middle" });
    });
    return JHS.svg(320, 240, opts.ask === "child" ? "丸の純系としわの純系をかけ合わせて子をつくり、子を自家受粉させて孫をつくる図。子の遺伝子の組み合わせは示していない"
      : opts.ask === "grand" ? "丸の純系としわの純系をかけ合わせて子をつくり、子を自家受粉させて孫をつくる図。孫の種子4つに記号ア〜エがついている"
        : "丸の純系 AA としわの純系 aa をかけ合わせると、子はすべて丸 Aa。子を自家受粉させると、孫は AA、Aa、Aa、aa の割合で、丸としわが3対1", s);
  }

  var GRID = JHS.table({
    caption: "子(Aa)どうしをかけ合わせたときの孫",
    head: ["生殖細胞", "A", "a"],
    rows: [
      ["A", "AA(丸)", "Aa(丸)"],
      ["a", "Aa(丸)", "aa(しわ)"]
    ]
  });
  var GENE_NOTE = "エンドウの種子の形で、丸の遺伝子を A、しわの遺伝子を a とします。丸が顕性形質、しわが潜性形質です。";

  // 親の組み合わせと、子の割合
  var CROSSES = [
    { p: ["AA", "aa"], kids: ["Aa", "Aa", "Aa", "Aa"], pheno: "すべて丸", geno: "すべて Aa" },
    { p: ["Aa", "aa"], kids: ["Aa", "Aa", "aa", "aa"], pheno: "丸:しわ = 1:1", geno: "Aa:aa = 1:1" },
    { p: ["Aa", "Aa"], kids: ["AA", "Aa", "Aa", "aa"], pheno: "丸:しわ = 3:1", geno: "AA:Aa:aa = 1:2:1" },
    { p: ["AA", "Aa"], kids: ["AA", "AA", "Aa", "Aa"], pheno: "すべて丸", geno: "AA:Aa = 1:1" }
  ];
  function gametes(g) { return g.charAt(0) === g.charAt(1) ? g.charAt(0) + " だけ" : g.charAt(0) + " と " + g.charAt(1) + "(1:1)"; }
  function phenoOf(g) { return g.indexOf("A") >= 0 ? "丸" : "しわ"; }
  var GRAND_N = [400, 480, 600, 800, 1000, 1200, 1600, 2000, 2400, 3000, 3200, 4000];

  JHS.register("g3-heredity", {
    points: [
      "生物のもつ形や性質を<b>形質</b>といい、親の形質が子や孫に伝わることを<b>遺伝</b>といいます。形質を決めるもとになるものが" + rule("遺伝子") + "で、細胞の核の中の染色体にあります。遺伝子の本体は" + rule("DNA(デオキシリボ核酸)") + "という物質です。",
      "メンデルは、エンドウの種子の形(丸・しわ)などを使って遺伝の規則性を調べました。自家受粉で何代重ねても、親と同じ形質が現れる系統を" + rule(r("純系", "じゅんけい")) + "といいます。丸としわのように、どちらか一方しか現れない形質どうしを<b>対立形質</b>といいます。",
      "対立形質をもつ純系どうしをかけ合わせたとき、子に現れる形質を" + rule(r("顕性", "けんせい") + "形質") + "、子に現れない形質を" + rule(r("潜性", "せんせい") + "形質") + "といいます(以前は優性形質・劣性形質とよばれていました)。エンドウの種子の形では、丸が顕性形質です。",
      "遺伝子は対になっていて、減数分裂のとき、対の遺伝子は分かれて別々の生殖細胞に入ります。これを" + rule("分離の法則") + "といいます。",
      "丸の純系(AA)としわの純系(aa)をかけ合わせると、子は" + rule("すべて Aa で丸") + "になります。子を自家受粉させると、孫は " + rule("AA:Aa:aa = 1:2:1") + " となり、形質は" + rule("丸:しわ = 3:1") + "になります。",
      "遺伝子は、まれに変化することがあり、形質が変わることもあります。現在では、遺伝子を操作する技術(" + rule("遺伝子組換え") + ")や、いろいろな細胞になることのできる <b>iPS細胞</b> などが、農業や医療に利用・研究されています。"
    ],
    figures: [
      { html: figPeaCross(), caption: "メンデルの実験。子は Aa ですべて丸になり、子を自家受粉させてできた孫は、丸:しわ = 3:1 になります。" }
    ],
    blocks: [
      GRID,
      flow("孫の遺伝子の組み合わせ: AA:Aa:aa = 1:2:1 → 形質: 丸(AA と Aa):しわ(aa) = 3:1")
    ],
    example: {
      title: "丸の純系としわの純系をかけ合わせてできた子を自家受粉させたところ、孫の種子が800個できました。このうち、しわの種子は約何個ですか。",
      steps: [
        "子はすべて Aa です。Aa がつくる生殖細胞は、A と a が1:1です。",
        "孫の遺伝子の組み合わせは AA:Aa:aa = 1:2:1 で、丸:しわ = 3:1 になります。",
        "しわは全体の4つに1つです。",
        JHS.calc("800 個 ÷ 4", "200 個")
      ],
      result: "約200個"
    },
    fixed: [
      {
        id: "trait",
        text: "生物のもつ、形や性質のことを何といいますか。",
        choices: ["形質", "遺伝子", "染色体", "純系"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "生物のもつ形や性質を形質といいます。",
          "遺伝子は、形質を決めるもとになるものです。"
        ]
      },
      {
        id: "dna",
        text: "遺伝子の本体である物質は何ですか。",
        choices: ["DNA(デオキシリボ核酸)", "デンプン", "タンパク質を分解する消化酵素", "葉緑体"],
        answer: 0,
        explain: [
          "遺伝子の本体は、DNA(デオキシリボ核酸)という物質です。",
          "DNAは、細胞の核の中の染色体にふくまれています。"
        ]
      },
      {
        id: "pure-line",
        text: "自家受粉で何代重ねても、親と同じ形質が現れる系統を何といいますか。",
        choices: ["純系", "クローン", "顕性形質", "対立形質"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "自家受粉で何代重ねても同じ形質が現れる系統を、純系といいます。",
          "対立形質は、丸としわのように、どちらか一方しか現れない形質どうしのことです。"
        ]
      },
      {
        id: "dominant",
        text: "対立形質をもつ純系どうしをかけ合わせたとき、子に現れる形質を何といいますか。",
        choices: ["顕性形質", "潜性形質", "対立遺伝子", "獲得形質"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "子に現れる形質を顕性形質、子に現れない形質を潜性形質といいます。",
          "エンドウの種子の形では、丸が顕性形質、しわが潜性形質です。"
        ]
      },
      {
        id: "recessive",
        text: "丸の純系としわの純系のエンドウをかけ合わせると、子はすべて丸になりました。しわのように、子に現れなかった形質を何といいますか。",
        choices: ["潜性形質", "顕性形質", "純系", "クローン"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "純系どうしをかけ合わせたとき、子に現れない形質を潜性形質といいます。",
          "子に現れた丸は、顕性形質です。"
        ]
      },
      {
        id: "segregation",
        text: "分離の法則の説明として、正しいものはどれですか。",
        choices: [
          "減数分裂のとき、対になっている遺伝子が分かれて、別々の生殖細胞に入る",
          "体細胞分裂のとき、染色体が2つに分かれて両端に移動する",
          "純系どうしをかけ合わせると、子には顕性形質だけが現れる",
          "受精のとき、精細胞と卵細胞の核が合体する"
        ],
        answer: 0,
        explain: [
          "対になっている遺伝子(A と a など)が、減数分裂で分かれて別々の生殖細胞に入ることを、分離の法則といいます。",
          "Aa の個体からは、A をもつ生殖細胞と a をもつ生殖細胞が1:1でできます。"
        ]
      },
      {
        id: "fig-child",
        text: GENE_NOTE + "図のように、丸の純系(AA)としわの純系(aa)をかけ合わせて子をつくりました。子の遺伝子の組み合わせはどれですか。",
        figure: figPeaCross({ ask: "child" }),
        choices: ["Aa", "AA", "aa", "AA と aa が半分ずつ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "AA の親の生殖細胞は A だけ、aa の親の生殖細胞は a だけなので、子はすべて Aa になります。",
          "Aa は A をもつので、顕性形質の丸になります。"
        ]
      },
      {
        id: "fig-grand-round",
        text: GENE_NOTE + "図の孫のア〜エは、子を自家受粉させてできた種子を表しています。丸い種子(ア〜ウ)の遺伝子の組み合わせとして考えられるものを、すべて選んだものはどれですか。",
        figure: figPeaCross({ ask: "grand" }),
        choices: ["AA と Aa", "AA だけ", "Aa だけ", "Aa と aa"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "A を1つでももつと丸になるので、丸い種子は AA か Aa です。孫では AA:Aa = 1:2 の割合になります。",
          "aa はしわの種子(エ)です。"
        ]
      },
      {
        id: "grand-geno-ratio",
        text: GENE_NOTE + "子(Aa)を自家受粉させてできた孫の、遺伝子の組み合わせの数の比 AA:Aa:aa はどれですか。",
        choices: ["1:2:1", "3:1:0", "1:1:1", "2:1:1"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "A と a をもつ生殖細胞が1:1でできるので、組み合わせは AA、Aa、Aa、aa となり、AA:Aa:aa = 1:2:1 です。",
          "形質で見ると、丸(AA と Aa):しわ(aa) = 3:1 になります。"
        ]
      },
      {
        id: "child-round-reason",
        text: GENE_NOTE + "丸の純系としわの純系をかけ合わせると、子はすべて丸になります。その理由はどれですか。",
        choices: [
          "子はすべて A と a の両方をもち、顕性形質の丸が現れるから",
          "子はすべて AA になるから",
          "しわの遺伝子 a は、子に受けつがれないから",
          "子の遺伝子の組み合わせは、母親の遺伝子だけで決まるから"
        ],
        answer: 0,
        explain: [
          "子は、AA の親から A を、aa の親から a を受けつぐので、すべて Aa です。Aa では顕性形質の丸が現れます。",
          "a も子に受けつがれているので、孫ではしわ(aa)が現れます。"
        ]
      },
      {
        id: "gametes-aa",
        text: GENE_NOTE + "遺伝子の組み合わせが Aa の個体がつくる生殖細胞について、正しいものはどれですか。",
        choices: [
          "A をもつものと a をもつものが、1:1の割合でできる",
          "すべて A と a の両方をもつ",
          "すべて A をもつ",
          "A をもつものと a をもつものが、3:1の割合でできる"
        ],
        answer: 0,
        explain: [
          "減数分裂で、対になっている A と a が分かれて、別々の生殖細胞に入ります(分離の法則)。",
          "そのため、A をもつ生殖細胞と a をもつ生殖細胞が1:1でできます。"
        ]
      },
      {
        id: "gene-tech",
        text: "ある生物の遺伝子をほかの生物に組みこむなど、遺伝子を操作する技術を何といいますか。",
        choices: ["遺伝子組換え", "さし木", "自家受粉", "減数分裂"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "遺伝子を操作して、ほかの生物の遺伝子を組みこんだりする技術を、遺伝子組換えといいます。",
          "農作物の品種改良や、医薬品の製造などに利用されています。"
        ]
      },
      {
        id: "grand-wrinkled-genes",
        text: GENE_NOTE + "丸の純系としわの純系をかけ合わせた子を自家受粉させると、孫にしわの種子が現れました。この孫のしわの種子の遺伝子の組み合わせはどれですか。",
        choices: ["aa", "Aa", "AA", "a"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "しわは潜性形質なので、A を1つももたない aa のときだけ現れます。",
          "Aa や AA は丸になります。遺伝子は対になっているので、a 1つだけということはありません。"
        ]
      }
    ],
    generators: [
      {
        id: "cross-ratio",
        label: "親の遺伝子の組み合わせから、子の形質・遺伝子の割合",
        make: function () {
          var cr = JHS.pick(CROSSES), kind = JHS.pick(["pheno", "geno"]);
          var p = JHS.pick([0, 1]) ? cr.p : [cr.p[1], cr.p[0]];
          var c;
          if (kind === "pheno") {
            c = JHS.choices4(cr.pheno, JHS.shuffle(["すべて丸", "丸:しわ = 3:1", "丸:しわ = 1:1", "丸:しわ = 1:3", "すべてしわ"]));
          } else {
            c = JHS.choices4(cr.geno, JHS.shuffle(CROSSES.map(function (x) { return x.geno; }).concat(["すべて AA"])));
          }
          if (!c) return null;
          var combos = cr.kids.map(function (g) { return g + "(" + phenoOf(g) + ")"; }).join("、");
          return {
            text: GENE_NOTE + "遺伝子の組み合わせが " + p[0] + " の個体と " + p[1] + " の個体をかけ合わせました。できる子の" + (kind === "pheno" ? "形質の割合" : "遺伝子の組み合わせの割合") + "はどれですか。",
            choices: c.choices, answer: c.answer,
            explain: [
              p[0] + " の個体の生殖細胞は " + gametes(p[0]) + "、" + p[1] + " の個体の生殖細胞は " + gametes(p[1]) + "です。",
              "組み合わせると、" + combos + " になります。A を1つでももつと丸になります。",
              "したがって、" + (kind === "pheno" ? cr.pheno : cr.geno) + " です。"
            ],
            meta: { parents: p, kind: kind, kids: cr.kids, answer: kind === "pheno" ? cr.pheno : cr.geno }
          };
        }
      },
      {
        id: "grand-count",
        label: "孫の種子の数(3:1)",
        make: function () {
          var N = JHS.pick(GRAND_N), kind = JHS.pick(["wrinkled", "round", "Aa", "AA", "fromRound"]);
          var ask, ans, wrongs, explain;
          var lead = GENE_NOTE + "丸の純系としわの純系をかけ合わせてできた子(すべて丸)を自家受粉させたところ、";
          var base = "孫は AA:Aa:aa = 1:2:1 となり、丸:しわ = 3:1 になります。";
          function third(v) { return v % 3 === 0 ? v / 3 : null; }
          if (kind === "fromRound") {
            var R = N * 3 / 4;
            ask = "孫の種子のうち、丸い種子が " + ko(R) + " できました。しわの種子は約何個できたと考えられますか。";
            ans = N / 4; wrongs = [R / 4, R * 3, R / 2, N / 2];
            explain = [base, "しわの数は、丸の数の3分の1です。", JHS.calc(R + " 個 ÷ 3", ans + " 個")];
          } else {
            ask = "孫の種子が " + ko(N) + " できました。";
            if (kind === "wrinkled") {
              ask += "このうち、しわの種子は約何個ですか。";
              ans = N / 4; wrongs = [third(N), N / 2, N * 3 / 4, N * 3 / 8];
              explain = [base, "しわ(aa)は、全体の4つに1つです。", JHS.calc(N + " 個 ÷ 4", ans + " 個")];
            } else if (kind === "round") {
              ask += "このうち、丸い種子は約何個ですか。";
              ans = N * 3 / 4; wrongs = [N / 4, N / 2, third(N * 2), third(N), N * 3 / 8];
              explain = [base, "丸(AA と Aa)は、全体の4つに3つです。", JHS.calc(N + " 個 ÷ 4 × 3", ans + " 個")];
            } else if (kind === "Aa") {
              ask += "このうち、遺伝子の組み合わせが Aa の種子は約何個ですか。";
              ans = N / 2; wrongs = [N / 4, N * 3 / 4, third(N * 2), third(N), N * 3 / 8];
              explain = [base, "Aa は、全体の4つに2つです。", JHS.calc(N + " 個 ÷ 4 × 2", ans + " 個")];
            } else {
              ask += "このうち、遺伝子の組み合わせが AA の種子は約何個ですか。";
              ans = N / 4; wrongs = [N / 2, N * 3 / 4, third(N), N * 3 / 8];
              explain = [base, "AA は、全体の4つに1つです。丸い種子の全部が AA ではありません。", JHS.calc(N + " 個 ÷ 4", ans + " 個")];
            }
          }
          var c = JHS.choices4("約" + ans + "個", wrongs.filter(function (w) { return w !== null && w === Math.floor(w); }).map(function (w) { return "約" + w + "個"; }));
          if (!c) return null;
          return {
            text: lead + ask,
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: explain,
            meta: { total: N, kind: kind, answer: ans }
          };
        }
      },
      {
        id: "parents-from-ratio",
        label: "子の数の比から、親の遺伝子の組み合わせ",
        make: function () {
          var kind = JHS.pick(["31", "11", "all"]), M = 40 * JHS.randInt(10, 30), w, rnd, setup, ans, why;
          if (kind === "31") {
            w = M / 4 + JHS.randInt(-6, 6); rnd = M - w;
            setup = "丸い種子から育てた2つの個体をかけ合わせたところ、丸い種子が" + rnd + "個、しわの種子が" + w + "個できました。";
            ans = "Aa と Aa";
            why = ["丸:しわ が約3:1なので、両方の親が a をもっています。丸い親で a をもつのは Aa です。", "Aa と Aa をかけ合わせると、AA:Aa:aa = 1:2:1 で、丸:しわ = 3:1 になります。"];
          } else if (kind === "11") {
            w = M / 2 + JHS.randInt(-8, 8); rnd = M - w;
            setup = "丸い種子から育てた個体と、しわの種子から育てた個体をかけ合わせたところ、丸い種子が" + rnd + "個、しわの種子が" + w + "個できました。";
            ans = "Aa と aa";
            why = ["しわの親は aa なので、生殖細胞は a だけです。丸:しわ が約1:1なので、丸の親は A と a を1:1でつくる Aa です。", "AA と aa では、子はすべて丸(Aa)になります。"];
          } else {
            rnd = M; w = 0;
            setup = "丸い種子から育てた個体と、しわの種子から育てた個体をかけ合わせたところ、種子が" + M + "個でき、すべて丸い種子でした。";
            ans = "AA と aa";
            why = ["しわの親は aa なので、生殖細胞は a だけです。子がすべて丸なので、丸の親の生殖細胞はすべて A で、丸の親は AA です。", "丸の親が Aa なら、しわの種子(aa)が約半分できるはずです。"];
          }
          var c = JHS.choices4(ans, JHS.shuffle(["AA と aa", "Aa と aa", "Aa と Aa", "AA と Aa"]));
          if (!c) return null;
          return {
            text: GENE_NOTE + setup + "親の遺伝子の組み合わせはどれですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: why,
            meta: { kind: kind, round: rnd, wrinkled: w, answer: ans }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-4 生物の進化
  // =====================================================================
  // C6 脊椎動物のなかまが現れた順(左ほど古い)。哺乳類と鳥類は、どちらもは虫類の右に、上下に並べる。
  // opts.keys: 記号に置きかえるなかまの番号の配列(0 魚類、1 両生類、2 は虫類、3 哺乳類、4 鳥類。記号は A〜E)
  var VERT = [
    { name: "魚類", key: "A", x: 8, y: 86 },
    { name: "両生類", key: "B", x: 82, y: 86 },
    { name: "は虫類", key: "C", x: 156, y: 86 },
    { name: "哺乳類", key: "D", x: 248, y: 36 },
    { name: "鳥類", key: "E", x: 248, y: 136 }
  ];
  function figVertebrates(opts) {
    opts = opts || {};
    var hide = opts.keys || [], s = "";
    VERT.forEach(function (v, i) {
      s += '<rect class="fig-shape fig-fill-2" x="' + v.x + '" y="' + v.y + '" width="' + (i >= 3 ? 64 : 58) + '" height="28" rx="4"/>';
      var cx = v.x + (i >= 3 ? 32 : 29), cy = v.y + 14;
      if (hide.indexOf(i) >= 0) s += JHS.key(cx, cy, v.key);
      else s += txt(cx, cy + 4.5, v.name, { anchor: "middle" });
    });
    s += JHS.arrow(66, 100, 80, 100) + JHS.arrow(140, 100, 154, 100);
    s += JHS.arrow(214, 94, 246, 60) + JHS.arrow(214, 106, 246, 140);
    s += JHS.arrow(20, 186, 300, 186, "fig-axis");
    s += txt(20, 178, "古い", { cls: "fig-small" }) + txt(300, 178, "新しい", { cls: "fig-small", anchor: "end" });
    return JHS.svg(320, 200, hide.length ? "脊椎動物のなかまが現れた順を表す図。左ほど古い。いくつかのなかまが記号になっている"
      : "脊椎動物のなかまが現れた順。魚類、両生類、は虫類の順に現れ、は虫類のなかまから哺乳類と鳥類が現れた", s);
  }

  // C7 相同器官(前あしの骨格の模式図)。うでのつけ根の骨はぬりつぶし、次の2本の骨は斜線、先の骨は線で表す
  function figForelimbs() {
    var s = "";
    function upper(x, y, w, h) { return '<rect class="fig-shape fig-fill" x="' + n1(x - w / 2) + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" style="stroke-width:1.5px"/>'; }
    function fore(x, y, w, h) {
      var at = ' x="' + n1(x - w / 2) + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2"';
      return '<rect class="fig-fill-2"' + at + '/><rect fill="url(#sci-pat-hatch)"' + at + '/><rect class="fig-shape"' + at + ' style="stroke-width:1.5px"/>';
    }
    function digit(x1, y1, x2, y2) { return line("fig-shape", x1, y1, x2, y2, "stroke-width:2.5px"); }
    // ヒトのうで
    s += upper(44, 34, 9, 52) + fore(39, 90, 5, 46) + fore(49, 90, 5, 46);
    [[34, 32], [39, 37], [44, 44], [49, 51], [54, 57]].forEach(function (f) { s += digit(f[0], 142, f[1], 168); });
    // コウモリのつばさ
    s += '<path class="fig-detail" d="M120 132L88 176L104 184L120 182L140 182L158 168L128 70"/>';
    s += upper(124, 34, 9, 36) + fore(120, 74, 4, 54) + fore(127, 74, 5, 54);
    [[96, 174], [110, 182], [130, 182], [154, 166]].forEach(function (f) { s += digit(122, 134, f[0], f[1]); });
    s += digit(118, 134, 112, 144);
    // クジラのひれ
    s += '<path class="fig-detail" d="M188 36C180 70 182 130 196 176C202 184 210 182 212 172C220 120 220 70 212 36"/>';
    s += upper(200, 40, 14, 22) + fore(195, 66, 8, 24) + fore(205, 66, 8, 24);
    [[190, 92, 192, 150], [196, 92, 198, 168], [202, 92, 204, 170], [208, 92, 210, 150]].forEach(function (f) { s += digit(f[0], f[1], f[2], f[3]); });
    // ハトのつばさ
    s += upper(278, 34, 9, 48) + fore(273, 86, 4, 50) + fore(283, 86, 6, 50);
    s += '<rect class="fig-shape fig-fill-0" x="274" y="140" width="9" height="26" rx="3" style="stroke-width:1.5px"/>' + digit(284, 142, 290, 156);
    s += '<path class="fig-detail" d="M286 40L304 96L304 150L290 176"/>';
    [["ヒト", 44, "うで"], ["コウモリ", 122, "つばさ"], ["クジラ", 200, "ひれ"], ["ハト", 280, "つばさ"]].forEach(function (a) {
      s += txt(a[1], 22, a[0], { anchor: "middle" }) + txt(a[1], 196, a[2], { cls: "fig-small", anchor: "middle" });
    });
    return JHS.svg(320, 210, "ヒトのうで、コウモリのつばさ、クジラのひれ、ハトのつばさの骨格。形はちがうが、つけ根の1本の骨、次の2本の骨、その先の骨という基本のつくりが共通している", s);
  }

  var LAND = JHS.table({
    caption: "脊椎動物の、水中から陸上への生活のちがい",
    head: ["なかま", "呼吸", "体表", "卵・子"],
    compact: true,
    rows: [
      ["魚類", "えら", "うろこ", "殻なし卵"],
      ["両生類", "えら→肺", "皮膚", "殻なし卵"],
      ["は虫類", "肺", "うろこ", "殻あり卵"],
      ["鳥類", "肺", "羽毛", "殻あり卵"],
      ["哺乳類", "肺", "毛", "胎生"]
    ]
  });

  JHS.register("g3-evolution", {
    points: [
      "生物が、長い年月をかけて代を重ねる間に、形質が変化することを" + rule("進化") + "といいます。地層の中の化石を調べると、古い地層ほど、つくりの簡単な生物の化石が見つかります。",
      r("脊椎", "せきつい") + "動物は、" + rule("魚類 → 両生類 → は虫類") + " の順に現れ、" + rule(r("哺乳", "ほにゅう") + "類と鳥類は、は虫類のなかまから進化した") + "と考えられています。",
      "水中から陸上へ生活の場が広がるにつれて、呼吸は<b>えら → 肺</b>、体表は乾燥にたえるつくり(うろこ・羽毛・毛)、卵は<b>殻のある卵</b>や胎生へと変化しました。両生類は、子はえらと皮膚、親は肺と皮膚で呼吸し、水中と陸上の両方の特徴をもちます。",
      "<b>" + r("始祖鳥", "しそちょう") + "</b>の化石には、" + rule("鳥類の特徴(羽毛・つばさ)と、は虫類の特徴(口の歯・つばさの先のつめ・長い尾の骨)") + "の両方が見られ、鳥類がは虫類から進化した手がかりとされています。卵を産む哺乳類のカモノハシや、大昔の魚類の特徴を残すシーラカンスも知られています。",
      "ヒトのうで、コウモリのつばさ、クジラのひれ、鳥のつばさのように、" + rule("形やはたらきはちがっても、もとは同じ器官だったと考えられるもの") + "を" + rule(r("相同", "そうどう") + "器官") + "といいます。クジラの後ろあしの骨のように、はたらきを失って、なごりだけが残っているものを" + r("痕跡", "こんせき") + "器官といいます。",
      "植物も、水中から陸上へ広がりながら進化しました。" + rule("コケ植物・シダ植物 → " + r("裸子", "らし") + "植物 → " + r("被子", "ひし") + "植物") + " の順に現れ、乾燥した陸上に適した、種子でふえる植物が栄えるようになりました。"
    ],
    figures: [
      { html: figVertebrates(), caption: "脊椎動物のなかまが現れた順(左ほど古い)。哺乳類と鳥類は、は虫類のなかまから進化したと考えられています。" },
      { html: figForelimbs(), caption: "前あしの骨格。ぬりつぶした骨はつけ根の1本の骨、斜線の骨はその次の2本の骨です。形やはたらきはちがっても、基本のつくりが共通しています(相同器官)。" }
    ],
    blocks: [
      LAND,
      flow("植物: コケ植物・シダ植物 → 裸子植物 → 被子植物(水中から陸上へ、乾燥に強いものへ)")
    ],
    example: {
      title: "始祖鳥の化石には、次の特徴が見られます。このうち、は虫類の特徴はどれとどれですか。<br>a 体が羽毛でおおわれている<br>b 口に歯がある<br>c 前あしがつばさになっている<br>d つばさの先につめがある",
      steps: [
        "羽毛やつばさは、鳥類の特徴です(a、c)。",
        "現在の鳥類の口には歯がなく、つばさの先につめはありません。口の歯やつばさのつめは、は虫類の特徴です(b、d)。",
        "始祖鳥は両方の特徴をもつので、鳥類がは虫類から進化したと考える手がかりになっています。"
      ],
      result: "b と d"
    },
    fixed: [
      {
        id: "evolution-def",
        text: "生物が、長い年月をかけて代を重ねる間に、形質が変化することを何といいますか。",
        choices: ["進化", "発生", "遺伝", "成長"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "長い年月をかけて、代を重ねる間に形質が変化することを進化といいます。",
          "発生は受精卵から体ができていく過程、遺伝は親の形質が子に伝わることです。"
        ]
      },
      {
        id: "order3",
        text: "脊椎動物のなかまが地球上に現れた順として、正しいものはどれですか。",
        choices: ["魚類 → 両生類 → は虫類", "両生類 → 魚類 → は虫類", "魚類 → は虫類 → 両生類", "は虫類 → 両生類 → 魚類"],
        answer: 0,
        explain: [
          "化石の記録から、脊椎動物は、魚類 → 両生類 → は虫類 の順に現れたと考えられています。",
          "水中で生活する魚類から、水中と陸上の両方の特徴をもつ両生類が現れ、さらに陸上の生活に適したは虫類が現れました。"
        ]
      },
      {
        id: "first-vertebrate",
        text: "脊椎動物の5つのなかまのうち、最も古い時代に現れたのはどれですか。",
        choices: ["魚類", "両生類", "は虫類", "哺乳類"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "脊椎動物のうち、最初に現れたのは魚類です。",
          "そのあと、両生類、は虫類の順に現れました。"
        ]
      },
      {
        id: "fig-amphibian",
        text: "図は、脊椎動物のなかまが現れた順を表したもので、左ほど古い時代です。B にあてはまるなかまはどれですか。",
        figure: figVertebrates({ keys: [1] }),
        choices: ["両生類", "は虫類", "鳥類", "哺乳類"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "魚類のあと、は虫類の前に現れたのは両生類です。",
          "両生類は、子はえらと皮膚、親は肺と皮膚で呼吸し、水中と陸上の両方の特徴をもっています。"
        ]
      },
      {
        id: "fig-bird-origin",
        text: "図は、脊椎動物のなかまが現れた順を表したもので、左ほど古い時代です。E は、始祖鳥の化石などから、C のなかまから進化したと考えられています。C と E にあてはまるなかまの組み合わせはどれですか。",
        figure: figVertebrates({ keys: [2, 4] }),
        choices: ["C は虫類、E 鳥類", "C 両生類、E 鳥類", "C は虫類、E 両生類", "C 鳥類、E は虫類"],
        answer: 0,
        explain: [
          "魚類 → 両生類 → は虫類 の順に現れ、鳥類はは虫類のなかまから進化したと考えられています。",
          "始祖鳥は、は虫類と鳥類の両方の特徴をもっています。"
        ]
      },
      {
        id: "archaeopteryx-reptile",
        text: "始祖鳥の化石に見られる特徴のうち、は虫類の特徴はどれですか。",
        choices: ["口に歯がある", "体が羽毛でおおわれている", "前あしがつばさになっている", "えらで呼吸する"],
        answer: 0,
        explain: [
          "口に歯があること、つばさの先につめがあること、長い尾の骨があることは、は虫類の特徴です。",
          "羽毛やつばさは鳥類の特徴です。えらで呼吸するのは、魚類や両生類の子です。"
        ]
      },
      {
        id: "egg-land",
        text: "は虫類や鳥類が、陸上で卵を産むことができるのはなぜですか。",
        choices: [
          "卵に殻があり、乾燥にたえられるから",
          "卵に殻がなく、水分を吸収しやすいから",
          "卵の中で、子がえらで呼吸するから",
          "親が体内で子を育ててから産むから"
        ],
        answer: 0,
        explain: [
          "は虫類と鳥類の卵には殻があり、乾燥にたえられるので、陸上に産むことができます。",
          "魚類や両生類の卵には殻がないので、水中に産みます。"
        ]
      },
      {
        id: "amphibian-breath",
        text: "両生類が「水中から陸上への進化の途中の特徴をもつ」といわれる理由として、正しいものはどれですか。",
        choices: [
          "子は水中でえらと皮膚で呼吸し、親は陸上で肺と皮膚で呼吸するから",
          "一生えらで呼吸し、殻のある卵を陸上に産むから",
          "体が羽毛でおおわれ、口に歯があるから",
          "子を乳で育て、卵も産むから"
        ],
        answer: 0,
        explain: [
          "両生類は、子のときは水中でえらと皮膚、親になると陸上で肺と皮膚で呼吸します。",
          "水中の生活と陸上の生活の両方の特徴をもっています。"
        ]
      },
      {
        id: "fig-homologous",
        text: "図は、ヒトのうで、コウモリのつばさ、クジラのひれ、ハトのつばさの骨格です。形やはたらきはちがっても、もとは同じ器官だったと考えられるこのような器官を何といいますか。",
        figure: figForelimbs(),
        choices: ["相同器官", "痕跡器官", "感覚器官", "消化器官"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "骨格の基本のつくりが共通していて、もとは同じ器官だったと考えられるものを相同器官といいます。",
          "痕跡器官は、はたらきを失って、なごりだけが残っている器官です。"
        ]
      },
      {
        id: "homologous-example",
        text: "相同器官の組み合わせとして、正しいものはどれですか。",
        choices: [
          "ヒトのうでとクジラのひれ",
          "チョウのはねとハトのつばさ",
          "トンボのはねとコウモリのつばさ",
          "イカのあしとヒトのうで"
        ],
        answer: 0,
        explain: [
          "ヒトのうでとクジラのひれは、どちらも脊椎動物の前あしで、骨格の基本のつくりが共通しています。",
          "チョウ・トンボのはねやイカのあしは、脊椎動物の前あしとはつくりがまったくちがい、もとが同じ器官ではありません。"
        ]
      },
      {
        id: "vestigial",
        text: "クジラの体の中には、後ろあしの骨のなごりが残っています。このように、はたらきを失って、なごりだけが残っている器官を何といいますか。",
        choices: ["痕跡器官", "相同器官", "生殖器官", "運動器官"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "はたらきを失い、なごりだけが残っている器官を痕跡器官といいます。",
          "クジラの祖先が、陸上で後ろあしを使って生活していたことを示す手がかりと考えられています。"
        ]
      },
      {
        id: "platypus",
        text: "カモノハシは哺乳類ですが、ほかの哺乳類とちがう特徴をもっています。それはどれですか。",
        choices: ["卵を産む", "肺で呼吸する", "体が毛でおおわれている", "子を乳で育てる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "カモノハシは、哺乳類なのに卵を産みます。",
          "肺で呼吸すること、毛があること、子を乳で育てることは、哺乳類に共通する特徴です。"
        ]
      },
      {
        id: "plant-order",
        text: "植物が地球上に現れた順として、正しいものはどれですか。",
        choices: [
          "コケ植物・シダ植物 → 裸子植物 → 被子植物",
          "被子植物 → 裸子植物 → コケ植物・シダ植物",
          "裸子植物 → コケ植物・シダ植物 → 被子植物",
          "コケ植物・シダ植物 → 被子植物 → 裸子植物"
        ],
        answer: 0,
        explain: [
          "植物は、コケ植物・シダ植物 → 裸子植物 → 被子植物 の順に現れたと考えられています。",
          "種子でふえる植物は、乾燥した陸上の生活に適しています。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-5 生態系と自然環境
  // =====================================================================
  // C8 生物の数量のピラミッド。opts.keys で、段に A(上)・B・C(下)をつける
  function figPyramid(opts) {
    opts = opts || {};
    var s = "";
    function half(y) { return 120 * (y - 30) / 150; }
    function tier(y0, y1, cls) {
      return '<path class="fig-shape ' + cls + '" d="M' + n1(160 - half(y0)) + " " + y0 + "L" + n1(160 + half(y0)) + " " + y0 +
        "L" + n1(160 + half(y1)) + " " + y1 + "L" + n1(160 - half(y1)) + " " + y1 + 'Z"/>';
    }
    s += tier(130, 180, "fig-fill") + tier(80, 130, "fig-fill-2") + '<path class="fig-shape fig-fill-0" d="M160 30L200 80H120Z"/>';
    if (opts.keys) {
      s += JHS.key(160, 62, "A") + JHS.key(160, 106, "B") + JHS.key(160, 156, "C");
    } else {
      s += txt(160, 160, "植物など", { anchor: "middle" }) + txt(160, 110, "草食動物", { anchor: "middle" });
      s += JHS.labels([{ key: "A", name: "肉食動物", from: [168, 62], to: [214, 46] }], {});
      // 消費者は上の2段(肉食動物・草食動物)にまたがるので、2段の高さの線をそえる。生産者は下の段の横に書く
      s += line("fig-thin", 66, 32, 66, 128) + txt(36, 84, "消費者", { cls: "fig-small", anchor: "middle" });
      s += txt(36, 160, "生産者", { cls: "fig-small", anchor: "middle" });
    }
    s += JHS.arrow(304, 176, 304, 44, "fig-axis") + txt(298, 34, "数が少ない", { cls: "fig-small", anchor: "end" }) + txt(298, 194, "数が多い", { cls: "fig-small", anchor: "end" });
    return JHS.svg(320, 200, opts.keys ? "生物の数量の関係を表すピラミッドの図。上から A、B、C の3つの段がある"
      : "生物の数量のピラミッド。下から植物などの生産者、草食動物、肉食動物の順で、上の段ほど数が少ない", s);
  }

  // C9 炭素の循環。opts.keys で、矢印に ア〜カ をつける(問題用)
  // ア 光合成(二酸化炭素 → 植物)、イ 植物の呼吸、ウ 草食動物の呼吸、エ 分解者の呼吸、オ 植物 → 草食動物(食べる)、カ 生物の死がい → 分解者
  function figCarbon(opts) {
    opts = opts || {};
    var s = "", k = !!opts.keys;
    function box(x, y, w, h, t) { return '<rect class="fig-shape fig-fill-2" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4"/>' + txt(x + w / 2, y + h / 2 + 4.5, t, { anchor: "middle" }); }
    s += box(10, 12, 300, 28, "二酸化炭素") + txt(40, 30.5, "大気中", { cls: "fig-small" });
    s += box(10, 100, 80, 30, "植物") + box(112, 100, 76, 30, "草食動物") + box(210, 100, 76, 30, "肉食動物");
    s += box(112, 186, 112, 30, "分解者");
    // 二酸化炭素の出入り(実線)
    s += JHS.arrow(26, 42, 26, 98, "fig-line");                          // 光合成
    s += JHS.arrow(74, 98, 74, 42, "fig-line");                          // 植物の呼吸
    s += JHS.arrow(150, 98, 150, 42, "fig-line");                        // 草食動物の呼吸
    s += JHS.arrow(248, 98, 248, 42, "fig-line");                        // 肉食動物の呼吸
    s += '<path class="fig-line" d="M224 201H300V60"/>' + JHS.arrow(300, 60, 300, 42, "fig-line");   // 分解者の呼吸
    // 有機物の移動(破線)
    s += JHS.arrow(90, 115, 110, 115, "fig-line-2") + JHS.arrow(188, 115, 208, 115, "fig-line-2");
    s += JHS.arrow(50, 132, 120, 184, "fig-line-2") + JHS.arrow(150, 132, 160, 184, "fig-line-2") + JHS.arrow(240, 132, 200, 184, "fig-line-2");
    if (k) {
      s += JHS.key(26, 70, "ア") + JHS.key(74, 70, "イ") + JHS.key(150, 70, "ウ") + JHS.key(300, 150, "エ") + JHS.key(101, 104, "オ") + JHS.key(85, 158, "カ");
    } else {
      s += txt(30, 74, "光合成", { cls: "fig-small", halo: true }) + txt(78, 64, "呼吸", { cls: "fig-small", halo: true }) +
        txt(154, 74, "呼吸", { cls: "fig-small" }) + txt(252, 74, "呼吸", { cls: "fig-small" }) + txt(296, 150, "呼吸", { cls: "fig-small", anchor: "end" });
    }
    s += line("fig-line", 14, 216, 34, 216) + txt(38, 220, "二酸化炭素", { cls: "fig-small" });
    s += line("fig-line-2", 14, 198, 34, 198) + txt(38, 202, "有機物", { cls: "fig-small" });
    return JHS.svg(320, 230, k ? "炭素の循環の図。大気中の二酸化炭素、植物、草食動物、肉食動物、分解者の間の矢印に、記号がついている"
      : "炭素の循環。植物は光合成で二酸化炭素を取り入れ、すべての生物は呼吸で二酸化炭素を出す。有機物は、食べる・食べられるの関係や死がい・ふんを通して、動物や分解者へ移る", s);
  }

  // C10 数量のつり合いが変化するようす(3つの状態)。states: [{ top, mid, bot }] 1 ふえた、-1 減った、0 つり合いのとき
  function figPyramidShift(states, keys) {
    var s = "", W = [24, 48, 72], D = 16, Y = [40, 66, 92];
    s += txt(8, 55, "肉食", { cls: "fig-small" }) + txt(8, 81, "草食", { cls: "fig-small" }) + txt(8, 107, "植物", { cls: "fig-small" });
    states.forEach(function (st, i) {
      var cx = 84 + i * 92, ch = [st.top, st.mid, st.bot];
      ch.forEach(function (c, j) {
        var w = W[j] + c * D;
        s += '<rect class="fig-shape ' + (c > 0 ? "fig-fill" : c < 0 ? "fig-fill-0" : "fig-fill-2") + '" x="' + n1(cx - w / 2) + '" y="' + Y[j] + '" width="' + w + '" height="22"/>';
        if (c !== 0) s += '<rect class="fig-dash" x="' + n1(cx - W[j] / 2) + '" y="' + Y[j] + '" width="' + W[j] + '" height="22"/>';
      });
      s += JHS.key(cx, 134, keys[i]);
    });
    return JHS.svg(320, 150, "3つの状態の、生物の数量の図。破線の四角は、つり合っているときの大きさを表す。記号がついている", s);
  }
  var SHIFT = {
    herbUp: { top: 0, mid: 1, bot: 0 },
    A: { top: 1, mid: 0, bot: -1 },     // 植物が減り、肉食動物がふえる
    herbDown: { top: 0, mid: -1, bot: 0 },
    C: { top: -1, mid: 0, bot: 1 }      // 植物がふえ、肉食動物が減る
  };
  var SHIFT_TEXT = {
    herbUp: "草食動物がふえる", A: "植物が減り、肉食動物がふえる", herbDown: "草食動物が減る", C: "植物がふえ、肉食動物が減る"
  };

  var ROLES = JHS.table({
    caption: "生態系の中での生物のはたらき",
    head: ["役割", "はたらき", "例"],
    rows: [
      ["生産者", "光合成で、無機物から有機物をつくる。", "植物、植物プランクトン"],
      ["消費者", "ほかの生物を食べて、有機物を取り入れる。", "草食動物、肉食動物"],
      ["分解者", "死がいやふんなどの有機物を、無機物に分解する。", "菌類(カビ・キノコ)、細菌類(乳酸菌・大腸菌)、土の中の小動物(ミミズ・ダンゴムシ)"]
    ]
  });
  var MICROBE_TEXT = "林の土を水に入れてよくかき混ぜ、しばらく置いて上ずみ液をとりました。ビーカー A には上ずみ液をそのまま、ビーカー B には十分に加熱して冷ました上ずみ液を入れ、それぞれにうすいデンプンのりを加えました。ふたをして数日置いたあと、それぞれにヨウ素液を加えました。";
  var MICROBE_RESULT = JHS.table({
    head: ["ビーカー", "入れた上ずみ液", "ヨウ素液"],
    rows: [["A", "そのまま", "変化しない"], ["B", "加熱したもの", "青紫色になる"]]
  });

  var CHAINS = [
    ["植物プランクトン", "動物プランクトン", "小さな魚", "大きな魚"],
    ["草", "バッタ", "カエル", "ヘビ"],
    ["イネ", "イナゴ", "カエル", "ヘビ"],
    ["木", "ガの幼虫", "シジュウカラ", "タカ"]
  ];

  JHS.register("g3-ecosystems", {
    points: [
      "ある地域に生活する生物と、それをとりまく水・空気・土・光などの環境を、1つのまとまりとしてとらえたものを" + rule("生態系") + "といいます。生物どうしの「食べる・食べられる」の関係のつながりを" + rule("食物連鎖") + "といい、実際には網の目のようにからみ合っているので<b>食物網</b>といいます。",
      "光合成で無機物から有機物をつくる植物などを" + rule("生産者") + "、ほかの生物を食べて有機物を取り入れる動物を" + rule("消費者") + "といいます。死がいやふんなどの有機物を無機物に分解する生物を" + rule("分解者") + "といい、" + r("菌類", "きんるい") + "(カビ・キノコ)や細菌類(乳酸菌・大腸菌など)がいます。ミミズやダンゴムシなど土の中の小動物も、分解者のはたらきをしています。",
      "生物の数量は、ふつう" + rule("生産者が最も多く、食物連鎖の上位の消費者ほど少ない") + "ピラミッドの形になります。ある生物が一時的にふえたり減ったりしても、長い目で見ると、" + rule("もとのつり合いにもどる") + "ことが多いです。",
      "炭素は、大気中の二酸化炭素として植物の" + rule("光合成") + "で取り入れられて有機物になり、食物連鎖で動物へ移ります。すべての生物は" + rule("呼吸") + "で有機物を分解し、二酸化炭素を出します。酸素も、光合成と呼吸によって生物と大気の間を" + r("循環", "じゅんかん") + "しています。",
      "土の上ずみ液とデンプンのりの実験では、加熱しない上ずみ液ではデンプンがなくなり(ヨウ素液が変化しない)、" + rule("加熱した上ずみ液ではデンプンが残ります") + "。土の中の微生物がデンプンを分解したことがわかります。",
      "川にすむ水生生物の種類を調べると、水のよごれの程度がわかります(カワゲラ・ヒラタカゲロウはきれいな水、アメリカザリガニはとてもきたない水)。人によってほかの地域から持ちこまれて定着した<b>外来生物</b>(オオクチバスなど)や、二酸化炭素などの増加による<b>地球温暖化</b>は、生態系に影響をあたえます。地震・火山・大雨などの自然災害がある一方、自然は温泉やわき水などの恵みももたらします。"
    ],
    figures: [
      { html: figPyramid(), caption: "生物の数量のピラミッド。食べられる生物のほうが、食べる生物よりも数が多くなります。" },
      { html: figCarbon(), caption: "炭素の循環。実線は二酸化炭素としての移動、破線は有機物としての移動です。分解者も呼吸をして二酸化炭素を出します。" }
    ],
    blocks: [
      ROLES,
      flow("草食動物がふえる → 植物が減り、肉食動物がふえる → 草食動物が減る → 植物がふえ、肉食動物が減る → もとのつり合いにもどる")
    ],
    example: {
      title: MICROBE_TEXT + "A は変化せず、B は青紫色になりました。この結果から、どのようなことがわかりますか。",
      steps: [
        "ヨウ素液が青紫色になるのは、デンプンが残っているときです。A ではデンプンがなくなり、B では残っていました。",
        "A と B のちがいは、上ずみ液を加熱したかどうかだけです(対照実験)。加熱すると、上ずみ液の中の微生物は死んでしまいます。",
        "したがって、A では、上ずみ液の中の微生物がデンプンを分解したと考えられます。"
      ],
      result: "土の中の微生物が、デンプン(有機物)を分解した"
    },
    fixed: [
      {
        id: "ecosystem",
        text: "ある地域に生活する生物と、それをとりまく環境を、1つのまとまりとしてとらえたものを何といいますか。",
        choices: ["生態系", "食物連鎖", "食物網", "外来生物"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "生物と、それをとりまく水・空気・土などの環境をまとめて、生態系といいます。",
          "食物連鎖・食物網は、生物どうしの食べる・食べられるの関係です。"
        ]
      },
      {
        id: "food-web",
        text: "生態系の中で、食物連鎖が網の目のように複雑にからみ合っていることを何といいますか。",
        choices: ["食物網", "生態系", "分解者", "外来生物"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "多くの動物は何種類もの生物を食べるので、食物連鎖は網の目のようにつながっています。これを食物網といいます。",
          "生態系は、生物と環境をまとめたものです。"
        ]
      },
      {
        id: "producer",
        text: "生態系の中で、光合成によって無機物から有機物をつくり出す生物を何といいますか。",
        choices: ["生産者", "消費者", "分解者", "草食動物"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "光合成で有機物をつくり出す植物などを生産者といいます。",
          "消費者は、ほかの生物を食べて有機物を取り入れる動物です。"
        ]
      },
      {
        id: "decomposer-ex",
        text: "次のうち、菌類や細菌類にあたり、分解者としてはたらく生物の組み合わせはどれですか。",
        choices: ["カビ・キノコ・乳酸菌", "バッタ・カエル・ヘビ", "イネ・ススキ・タンポポ", "ミジンコ・メダカ・ザリガニ"],
        answer: 0,
        explain: [
          "カビ・キノコは菌類、乳酸菌は細菌類で、死がいやふんなどの有機物を無機物に分解します。",
          "バッタ・カエル・ヘビは消費者、イネなどの植物は生産者です。"
        ]
      },
      {
        id: "decomposer-role",
        text: "分解者のはたらきとして、正しいものはどれですか。",
        choices: [
          "生物の死がいやふんなどの有機物を、無機物に分解する",
          "光合成によって、無機物から有機物をつくる",
          "ほかの動物を食べて、その数を減らす",
          "二酸化炭素を取り入れて、酸素を出す"
        ],
        answer: 0,
        explain: [
          "分解者は、死がいやふんなどにふくまれる有機物を、二酸化炭素や水などの無機物に分解します。",
          "光合成で有機物をつくるのは生産者です。"
        ]
      },
      {
        id: "fig-pyramid",
        text: "図は、ある地域の生物の数量の関係をピラミッドの形で表したものです。A〜C は、植物、草食動物、肉食動物のどれかです。植物にあたるのはどれですか。",
        figure: figPyramid({ keys: true }),
        choices: ["C", "B", "A", "どれにもあたらない"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "生産者である植物は、数量が最も多く、ピラミッドのいちばん下の段(C)になります。",
          "B は草食動物、A は肉食動物です。"
        ]
      },
      {
        id: "balance-next",
        text: "つり合いのとれた生態系で、何らかの原因で草食動物が一時的にふえました。このあと、まず起こると考えられる変化はどれですか。",
        choices: [
          "植物が減り、肉食動物がふえる",
          "植物がふえ、肉食動物が減る",
          "植物も肉食動物も減る",
          "植物も肉食動物もふえる"
        ],
        answer: 0,
        explain: [
          "草食動物がふえると、食べられる植物は減り、草食動物を食べる肉食動物はえさが多くなってふえます。",
          "そのあと草食動物が減り、植物がふえ、肉食動物が減って、もとのつり合いにもどります。"
        ]
      },
      {
        id: "fig-photosynthesis-arrow",
        text: "図は、生態系の中での炭素の循環を表しています。実線は二酸化炭素としての移動、破線は有機物としての移動です。光合成による炭素の移動を表す矢印は、ア〜カのどれですか。",
        figure: figCarbon({ keys: true }),
        choices: ["ア", "イ", "エ", "オ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "光合成では、植物が大気中の二酸化炭素を取り入れるので、大気から植物へ向かう矢印アです。",
          "イ・エは呼吸で二酸化炭素を出す矢印、オは植物が草食動物に食べられて有機物が移る矢印です。"
        ]
      },
      {
        id: "fig-decomposer-arrow",
        text: "図は、生態系の中での炭素の循環を表しています。実線は二酸化炭素としての移動、破線は有機物としての移動です。分解者が有機物を分解して、二酸化炭素を出すはたらきを表す矢印は、ア〜カのどれですか。",
        figure: figCarbon({ keys: true }),
        choices: ["エ", "カ", "イ", "ア"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "分解者は、呼吸によって有機物を分解し、二酸化炭素を大気中に出します。分解者から大気へ向かう矢印エです。",
          "カは、植物の死がいなどの有機物が分解者に取り入れられる矢印です。"
        ]
      },
      {
        id: "microbe-result",
        text: MICROBE_TEXT + "結果は表のようになりました。A のヨウ素液が変化しなかったのはなぜですか。",
        material: MICROBE_RESULT,
        choices: [
          "上ずみ液の中の微生物が、デンプンを分解したから",
          "上ずみ液の中の微生物が、デンプンをつくったから",
          "ヨウ素液が、上ずみ液で分解されたから",
          "デンプンのりが、水に浮いて分かれたから"
        ],
        answer: 0,
        explain: [
          "ヨウ素液が変化しないのは、デンプンがなくなったからです。A では、上ずみ液の中の微生物がデンプンを分解しました。",
          "加熱して微生物が死んだ B では、デンプンが残って青紫色になりました。"
        ]
      },
      {
        id: "microbe-control",
        text: MICROBE_TEXT + "加熱した上ずみ液を入れたビーカー B を用意したのは、なぜですか。",
        choices: [
          "デンプンが減ったのが、上ずみ液の中の微生物のはたらきによることを確かめるため",
          "上ずみ液の中の微生物の数をふやすため",
          "デンプンのりを、とけやすくするため",
          "ヨウ素液の色を、見やすくするため"
        ],
        answer: 0,
        explain: [
          "加熱すると微生物は死にます。微生物がいるかどうかだけがちがう B とくらべる対照実験にすることで、微生物のはたらきだとわかります。",
          "B がないと、デンプンが減った原因が微生物かどうかわかりません。"
        ]
      },
      {
        id: "water-quality",
        text: "川にすむ水生生物を調べて、水のよごれの程度を調べました。カワゲラやヒラタカゲロウが多く見つかった場所の水は、どのようだと考えられますか。",
        choices: ["きれいな水", "とてもきたない水", "海水", "温泉の水"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "カワゲラやヒラタカゲロウは、きれいな水にすむ生物です。",
          "アメリカザリガニなどは、とてもきたない水でも見られます。"
        ]
      },
      {
        id: "alien",
        text: "外来生物の説明として、正しいものはどれですか。",
        choices: [
          "人によって、ほかの地域から持ちこまれて定着した生物",
          "昔からその地域にすんでいる生物",
          "生態系の中で、最も数が多い生物",
          "死がいやふんを分解する生物"
        ],
        answer: 0,
        explain: [
          "外来生物は、人の活動によって、もともといなかった地域に持ちこまれて定着した生物です(オオクチバス、アライグマなど)。",
          "在来の生物を食べたり、すむ場所をうばったりして、生態系に影響をあたえることがあります。"
        ]
      },
      {
        id: "warming",
        text: "地球温暖化の原因の1つと考えられているものはどれですか。",
        choices: [
          "化石燃料の大量消費などによる、大気中の二酸化炭素の増加",
          "植物の光合成による、大気中の酸素の増加",
          "分解者による、土の中の有機物の減少",
          "外来生物の増加による、在来の生物の減少"
        ],
        answer: 0,
        explain: [
          "石油や石炭などの化石燃料を大量に燃やすと、大気中の二酸化炭素がふえます。二酸化炭素は、地球の気温を上げるはたらきのある気体です。",
          "ほかの選択肢は、地球温暖化の原因ではありません。"
        ]
      }
    ],
    generators: [
      {
        id: "pyramid-shift",
        label: "数量のつり合いが変化する順",
        make: function () {
          var up = JHS.pick([true, false]);
          var start = up ? "herbUp" : "herbDown", seq = up ? ["A", "herbDown", "C"] : ["C", "herbUp", "A"];
          var disp = JHS.shuffle(seq.slice());
          function keyOf(name) { return KANA[disp.indexOf(name)]; }
          function seqText(a) { return a.map(keyOf).join(" → "); }
          var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(function (p) { return p.map(function (i) { return seq[i]; }); });
          var c = JHS.choices4(seqText(seq), JHS.shuffle(perms.filter(function (p) { return !sameSeq(p, seq); })).map(seqText));
          if (!c) return null;
          return {
            text: "つり合いのとれた生態系で、何らかの原因で" + (up ? "草食動物が一時的にふえました" : "草食動物が一時的に減りました") + "。そのあと、図のア〜ウの状態を経て、もとのつり合いにもどりました。図は、植物・草食動物・肉食動物の数量を、つり合っているときの大きさ(破線)とくらべて表したものです。ア〜ウを、変化の順に並べたものはどれですか。",
            figure: figPyramidShift(disp.map(function (n) { return SHIFT[n]; }), KANA),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              SHIFT_TEXT[start] + " → " + SHIFT_TEXT[seq[0]] + "(" + keyOf(seq[0]) + ") → " + SHIFT_TEXT[seq[1]] + "(" + keyOf(seq[1]) + ") → " + SHIFT_TEXT[seq[2]] + "(" + keyOf(seq[2]) + ") → もとにもどる、の順です。",
              "草食動物がふえると、食べられる植物は減り、食べる肉食動物はふえます。草食動物が減ると、その逆になります。"
            ],
            meta: { start: start, display: disp, answer: seqText(seq) }
          };
        }
      },
      {
        id: "food-chain",
        label: "食物連鎖の順と、生産者・数量",
        make: function () {
          var ch = JHS.pick(CHAINS), kind = JHS.pick(["order", "producer", "fewest"]);
          var listed = JHS.shuffle(ch.slice());
          var lead = "ある生態系で、" + listed.join("、") + "の4種類の生物は、食べる・食べられるの関係でつながっています。";
          var chainText = ch.join(" → ");
          var c, ask, explain;
          if (kind === "order") {
            var w = swaps(ch, 0).concat([ch.slice().reverse()]).map(function (a) { return a.join(" → "); });
            c = JHS.choices4(chainText, w);
            ask = "食べられる生物から食べる生物へ、矢印で順に並べたものはどれですか。";
            explain = ["食物連鎖は、" + chainText + " の順につながっています(矢印は、食べられる生物から食べる生物へ)。", "最初の" + ch[0] + "は、光合成で有機物をつくる生産者です。"];
          } else if (kind === "producer") {
            c = JHS.choices4(ch[0], [ch[1], ch[2], ch[3]]);
            ask = "このうち、生産者はどれですか。";
            explain = [ch[0] + "は、光合成で無機物から有機物をつくる生産者です。", "ほかの" + ch[1] + "・" + ch[2] + "・" + ch[3] + "は、ほかの生物を食べる消費者です(" + chainText + ")。"];
          } else {
            c = JHS.choices4(ch[3], [ch[0], ch[1], ch[2]]);
            ask = "このうち、ふつう数量が最も少ないと考えられる生物はどれですか。";
            explain = ["食物連鎖は " + chainText + " の順です。", "数量は、ふつう生産者が最も多く、食物連鎖の上位の消費者ほど少なくなるので、最も上位の" + ch[3] + "が最も少なくなります。"];
          }
          if (!c) return null;
          return {
            text: lead + ask,
            choices: c.choices, answer: c.answer, choiceLayout: kind === "order" ? "" : "grid",
            explain: explain,
            meta: { chain: ch, kind: kind, answer: c.choices[c.answer] }
          };
        }
      }
    ]
  });
})();

// =====================================================================
// 化学(g3-ions、g3-batteries、g3-acids-alkalis)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var r = JHS.r, rule = JHS.rule, q = JHS.q, chem = JHS.chem;
  function cm3(n) { return q(n, "cm³"); }
  function ko(n) { return q(n, "個"); }
  // 途中で折り返さないまとまり
  function nb(html) { return '<span style="white-space:nowrap">' + html + "</span>"; }

  // ---------- イオン式と、イオンをふくむ式 ----------
  // 電荷の文字。"2+" → 2+、"-" → −、"2-" → 2−
  function chargeText(c) { return String(c).replace(/-/g, "−"); }
  // 上つきの電荷。下つきの数字(.chem sub)と同じ考え方で、行の高さを変えずに上へずらす
  var SUP_STYLE = "font-size:.7em;line-height:0;position:relative;top:-.55em;vertical-align:baseline;margin-left:.05em";
  // イオン式。ion("Cu", "2+") → Cu²⁺、ion("SO4", "2-") → SO₄²⁻、ion("Cl", "-") → Cl⁻
  function ion(f, c) {
    return '<span class="chem">' + String(f).replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>") +
      '<sup style="' + SUP_STYLE + '">' + chargeText(c) + "</sup></span>";
  }
  // 式の1項。"2Cl^-" → 2Cl⁻、"Cu^2+" → Cu²⁺、"2H2O" → 2H₂O、"Ba(OH)2" → Ba(OH)₂、"2e^-" → 電子2個
  function splitTerm(t) {
    var m = /^(\d*)([^\^]+)(?:\^(.+))?$/.exec(String(t));
    return { coef: m[1], body: m[2], charge: m[3] || "" };
  }
  function term(t) {
    var p = splitTerm(t);
    return nb(p.coef + (p.charge ? ion(p.body, p.charge) : chem(p.body)));
  }
  // 図(SVG)の中の文字。上つき・下つきは Unicode の文字で書く。"Cu^2+" → "Cu²⁺"
  var SUB_CH = "₀₁₂₃₄₅₆₇₈₉", SUP_CH = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "+": "⁺", "-": "⁻" };
  function uni(t) {
    var p = splitTerm(t);
    var body = p.body.replace(/([A-Za-z\)])(\d+)/g, function (all, a, d) {
      return a + d.split("").map(function (x) { return SUB_CH.charAt(Number(x)); }).join("");
    });
    return p.coef + body + p.charge.split("").map(function (x) { return SUP_CH[x]; }).join("");
  }
  // 図(SVG)の中のイオン式。電荷は 12px の文字で上にずらして書く(Unicode の上つき文字は小さすぎて読みにくいため)。
  // 下つきの数字は Unicode の文字(₂ ₄)。電荷は最後に書くので、ずらした高さを戻さなくてよい
  function svgIon(t) {
    var p = splitTerm(t);
    var body = uni(p.coef + p.body);
    if (!p.charge) return body;
    return body + '<tspan dy="-5" style="font-size:12px">' + chargeText(p.charge) + "</tspan>";
  }
  // 式を組み立てる。幅がせまいときは「+」や「→」の前で折り返し、式の項の途中では折り返さない。
  // data-eq には、検算用に、もとの項を残す(左右の原子の数と電荷の合計を数えるため)。
  // bad は、わざとまちがえた式(誤答)の印。"count" は原子の数か電荷が合わない式、"formula" はイオン式や化学式そのものが誤りの式
  function joinEq(L, R, bad) {
    function side(a, lead) {
      return a.map(function (t, i) {
        if (i === 0) return lead ? nb(lead + " " + term(t)) : term(t);
        return nb("+ " + term(t));
      }).join(" ");
    }
    return '<span class="chem-eq" data-eq="' + L.join(" ") + " = " + R.join(" ") + '"' + (bad ? ' data-bad="' + bad + '"' : "") + ">" +
      side(L, "") + " " + side(R, "→") + "</span>";
  }
  // 正しい式。eq(["CuCl2"], ["Cu^2+", "2Cl^-"]) → CuCl₂ → Cu²⁺ + 2Cl⁻
  function eq(L, R) { return joinEq(L, R, ""); }
  // 誤答の式
  function badEq(L, R, why) { return joinEq(L, R, why || "count"); }
  // 式を1行の箱に入れる(要点帳の公式の箱と同じ見た目)
  function eqBox(html) { return '<div class="formula">' + html + "</div>"; }
  // 物質名で書いた式
  function words(L, R) {
    function side(a, lead) {
      return a.map(function (t, i) { return i === 0 ? (lead ? nb(lead + " " + t) : nb(t)) : nb("+ " + t); }).join(" ");
    }
    return '<span class="chem-eq">' + side(L, "") + " " + side(R, "→") + "</span>";
  }

  // 定番の式。どの式も、左右で原子の種類と数、電荷の合計が合っている(数え方はコメント)
  var EQ = {
    nacl: { L: ["NaCl"], R: ["Na^+", "Cl^-"] },                       // Na 1, Cl 1 / 電荷 0 = +1 −1
    hcl: { L: ["HCl"], R: ["H^+", "Cl^-"] },                          // H 1, Cl 1 / 0 = +1 −1
    cucl2: { L: ["CuCl2"], R: ["Cu^2+", "2Cl^-"] },                   // Cu 1, Cl 2 / 0 = +2 −2
    naoh: { L: ["NaOH"], R: ["Na^+", "OH^-"] },                       // Na 1, O 1, H 1 / 0 = +1 −1
    h2so4: { L: ["H2SO4"], R: ["2H^+", "SO4^2-"] },                   // H 2, S 1, O 4 / 0 = +2 −2
    baoh2: { L: ["Ba(OH)2"], R: ["Ba^2+", "2OH^-"] },                 // Ba 1, O 2, H 2 / 0 = +2 −2
    cucl2Split: { L: ["CuCl2"], R: ["Cu", "Cl2"] },                   // Cu 1, Cl 2
    hclSplit: { L: ["2HCl"], R: ["H2", "Cl2"] },                      // H 2, Cl 2
    cuGet: { L: ["Cu^2+", "2e^-"], R: ["Cu"] },                       // Cu 1 / +2 −2 = 0
    clGive: { L: ["2Cl^-"], R: ["Cl2", "2e^-"] },                     // Cl 2 / −2 = −2
    hGet: { L: ["2H^+", "2e^-"], R: ["H2"] },                         // H 2 / +2 −2 = 0
    naLose: { L: ["Na"], R: ["Na^+", "e^-"] },                        // Na 1 / 0 = +1 −1
    clTake: { L: ["Cl", "e^-"], R: ["Cl^-"] },                        // Cl 1 / −1 = −1
    znLose: { L: ["Zn"], R: ["Zn^2+", "2e^-"] },                      // Zn 1 / 0 = +2 −2
    mgLose: { L: ["Mg"], R: ["Mg^2+", "2e^-"] },                      // Mg 1 / 0 = +2 −2
    znCu: { L: ["Zn", "Cu^2+"], R: ["Zn^2+", "Cu"] },                 // Zn 1, Cu 1 / +2 = +2
    fuel: { L: ["2H2", "O2"], R: ["2H2O"] },                          // H 4, O 2
    h2oSplit: { L: ["2H2O"], R: ["2H2", "O2"] },                      // H 4, O 2
    neutral: { L: ["H^+", "OH^-"], R: ["H2O"] },                      // H 2, O 1 / 0 = 0
    hclNaoh: { L: ["HCl", "NaOH"], R: ["NaCl", "H2O"] },              // H 2, Cl 1, Na 1, O 1
    h2so4Baoh2: { L: ["H2SO4", "Ba(OH)2"], R: ["BaSO4", "2H2O"] },    // H 4, S 1, O 6, Ba 1
    mgHcl: { L: ["Mg", "2HCl"], R: ["MgCl2", "H2"] }                  // Mg 1, H 2, Cl 2
  };
  function eqOf(id) { return eq(EQ[id].L, EQ[id].R); }

  // =====================================================================
  // 3-6 水溶液とイオン
  // =====================================================================

  // ---------- 図: ヘリウム原子のモデル ----------
  // 陽子は「+」、電子は「−」の印をつけ、中性子は印なし(色だけで分けない)。
  // opts は JHS.labels と同じ({} 名前 / { keys: true } 記号 A〜D)
  function figHelium(opts) {
    opts = opts || {};
    var asKey = opts.keys || opts.mark, s = "";
    var cx = 108, cy = 100, R = 66, d = R * Math.SQRT1_2;
    s += '<circle class="fig-thin" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';     // 電子が回っているところ(模式)
    s += '<circle class="fig-dash" cx="' + cx + '" cy="' + cy + '" r="27"/>';             // 原子核
    function nucleon(x, y, plus) {
      return '<circle class="fig-shape ' + (plus ? "fig-fill" : "fig-fill-2") + '" cx="' + x + '" cy="' + y + '" r="11"/>' +
        (plus ? JHS.txt(x, y + 5, "+", { anchor: "middle" }) : "");
    }
    s += nucleon(119, 89, false) + nucleon(97, 111, false) + nucleon(97, 89, true) + nucleon(119, 111, true);
    function electron(x, y) {
      return '<circle class="fig-shape fig-fill-0" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="8.5"/>' +
        JHS.txt(x, y + 4.5, "−", { anchor: "middle" });
    }
    s += electron(cx - d, cy - d) + electron(cx + d, cy + d);
    var parts = [
      { key: "A", name: "電子", from: [cx + d + 6, cy + d + 6], to: [206, 172] },
      { key: "B", name: "陽子", from: [127, 119], to: [206, 132] },
      { key: "C", name: "中性子", from: [127, 83], to: [206, 90] },
      { key: "D", name: "原子核", from: [cx, cy - 27], to: [206, 44] }
    ];
    s += JHS.labels(parts, opts);
    return JHS.svg(320, 200, asKey
      ? "ヘリウム原子のモデル。中心に4個の粒子があり、2個には+の印、2個には印がない。そのまわりに−の印のついた粒子が2個ある。A〜D の記号がついている"
      : "ヘリウム原子のモデル。中心の原子核に、+の電気をもつ陽子2個と、電気をもたない中性子2個がある。そのまわりに、−の電気をもつ電子が2個ある", s);
  }

  // ---------- 図: 塩化銅水溶液の電気分解 ----------
  // 左の電極が電源装置の−極につながる陰極、右が陽極。
  // opts: { keys: true }(できる物質に記号 A・B)、{ hide: true }(できる物質の名前を書かない)、{ ions: true }(イオンの動きを書く)
  function figCuCl2(opts) {
    opts = opts || {};
    var asKey = opts.keys || opts.mark, s = "";
    // 電源装置と導線
    s += '<path class="fig-shape" d="M128 26H107V78M192 26H213V78"/>';
    s += '<rect class="fig-shape fig-fill-2" x="128" y="12" width="64" height="28" rx="3"/>' + JHS.txt(160, 31, "電源装置", { cls: "fig-small", anchor: "middle" });
    s += JHS.txt(100, 22, "−極", { cls: "fig-small", anchor: "end" }) + JHS.txt(220, 22, "+極", { cls: "fig-small" });
    // ビーカーと水溶液
    s += '<rect class="fig-fill" x="65" y="112" width="190" height="93"/>';
    s += '<path class="fig-detail" d="M64 112H256"/>';
    s += '<path class="fig-shape" d="M64 92V196q0 10 10 10H246q10 0 10 -10V92"/>';
    // 電極(炭素棒)
    s += '<rect class="fig-shape fig-fill-2" x="101" y="78" width="12" height="100"/>';
    s += '<rect class="fig-shape fig-fill-2" x="207" y="78" width="12" height="100"/>';
    // 陰極に付着した銅(斜線の層)
    var dep = ' x="98" y="128" width="18" height="52"/>';
    s += '<rect class="fig-fill-0"' + dep + '<rect fill="url(#sci-pat-hatch)"' + dep + '<rect class="fig-shape"' + dep;
    // 陽極から出る気体の泡
    [[225, 168, 2.6], [227, 150, 2.4], [224, 133, 2.8], [226, 118, 2.4], [200, 160, 2.4], [198, 140, 2.8]].forEach(function (b) {
      s += '<circle class="fig-detail fig-fill-0" cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '"/>';
    });
    if (opts.ions) {
      s += JHS.txt(155, 152, svgIon("Cu^2+"), { anchor: "middle" }) + JHS.arrow(134, 148, 121, 148);
      s += JHS.txt(155, 194, svgIon("Cu^2+"), { anchor: "middle" }) + JHS.arrow(134, 190, 121, 190);
      s += JHS.txt(170, 132, svgIon("Cl^-"), { anchor: "middle" }) + JHS.arrow(184, 128, 197, 128);
      s += JHS.txt(170, 174, svgIon("Cl^-"), { anchor: "middle" }) + JHS.arrow(184, 170, 197, 170);
    }
    s += JHS.labels([
      { key: "K", name: "陰極", from: [101, 88], to: [60, 74], side: "left" },
      { key: "Y", name: "陽極", from: [219, 88], to: [260, 74] }
    ]);
    if (asKey) {
      s += JHS.labels([
        { key: "A", name: "", from: [98, 160], to: [52, 160], side: "left" },
        { key: "B", name: "", from: [229, 133], to: [272, 133] }
      ], opts);
    } else if (!opts.hide) {
      s += JHS.labels([
        { key: "A", name: "銅", from: [98, 160], to: [50, 160], side: "left" },
        { key: "B", name: "塩素", from: [229, 133], to: [268, 133] }
      ]);
    }
    return JHS.svg(320, 216, asKey
      ? "塩化銅水溶液に2本の炭素棒を入れて電流を流している装置の図。左の電極は電源装置の−極、右の電極は+極につながっている。左の電極の表面に付着した物質にA、右の電極から出ている泡にBの記号がついている"
      : opts.hide ? "塩化銅水溶液に2本の炭素棒を入れて電流を流している装置の図。左の電極は電源装置の−極、右の電極は+極につながっている"
        : "塩化銅水溶液の電気分解。電源装置の−極につないだ陰極の表面に銅が付着し、+極につないだ陽極から塩素が発生する" +
          (opts.ions ? "。水溶液の中の銅イオンは陰極へ、塩化物イオンは陽極へ移動する" : ""), s);
  }

  var ION_TABLE_PLUS = JHS.table({
    caption: "おもな陽イオン",
    head: ["名前", "イオン式"],
    rows: [
      ["水素イオン", ion("H", "+")],
      ["ナトリウムイオン", ion("Na", "+")],
      ["カリウムイオン", ion("K", "+")],
      ["銅イオン", ion("Cu", "2+")],
      [r("亜鉛", "あえん") + "イオン", ion("Zn", "2+")],
      ["マグネシウムイオン", ion("Mg", "2+")],
      ["カルシウムイオン", ion("Ca", "2+")],
      ["アンモニウムイオン", ion("NH4", "+")]
    ]
  });
  var ION_TABLE_MINUS = JHS.table({
    caption: "おもな陰イオン",
    head: ["名前", "イオン式"],
    rows: [
      ["塩化物イオン", ion("Cl", "-")],
      ["水酸化物イオン", ion("OH", "-")],
      [r("硫酸", "りゅうさん") + "イオン", ion("SO4", "2-")],
      ["炭酸イオン", ion("CO3", "2-")],
      [r("硝酸", "しょうさん") + "イオン", ion("NO3", "-")]
    ]
  });
  var IONIZE_TABLE = JHS.table({
    caption: "電離を表す式",
    head: ["電解質", "電離を表す式"],
    rows: [
      ["塩化ナトリウム", eqOf("nacl")],
      ["塩化水素", eqOf("hcl")],
      ["塩化銅", eqOf("cucl2")],
      ["水酸化ナトリウム", eqOf("naoh")]
    ]
  });
  var ELECTROLYSIS_TABLE = JHS.table({
    caption: "電解質の水溶液の電気分解",
    head: ["水溶液", "陰極", "陽極"],
    rows: [
      ["塩化銅水溶液", "銅が付着する", "塩素が発生する"],
      ["塩酸", "水素が発生する", "塩素が発生する"]
    ]
  });

  // イオン式の問題に使うイオン。near は、まちがえやすいほかのイオン(誤答に使う)。
  // wrongCharge は、ありえない電荷(誤答に使う。実際にあるイオンと重ならないものだけ)
  var IONS = [
    { id: "H", f: "H", c: "+", name: "水素イオン", near: ["OH", "Na", "Cl"], wrongCharge: ["2+"] },
    { id: "Na", f: "Na", c: "+", name: "ナトリウムイオン", near: ["K", "NH4", "H"], wrongCharge: ["2+"] },
    { id: "K", f: "K", c: "+", name: "カリウムイオン", near: ["Na", "Ca", "H"], wrongCharge: ["2+"] },
    { id: "Cu", f: "Cu", c: "2+", name: "銅イオン", near: ["Ca", "Zn", "Cl"], wrongCharge: [] },
    { id: "Zn", f: "Zn", c: "2+", name: "亜鉛イオン", near: ["Mg", "Cu", "Na"], wrongCharge: [] },
    { id: "Mg", f: "Mg", c: "2+", name: "マグネシウムイオン", near: ["Zn", "Ca", "Na"], wrongCharge: [] },
    { id: "Ca", f: "Ca", c: "2+", name: "カルシウムイオン", near: ["Cu", "K", "Mg"], wrongCharge: [] },
    { id: "NH4", f: "NH4", c: "+", name: "アンモニウムイオン", near: ["Na", "OH", "NO3"], wrongCharge: ["2+"] },
    { id: "Cl", f: "Cl", c: "-", name: "塩化物イオン", near: ["OH", "Ca", "Cu"], wrongCharge: ["2-"] },
    { id: "OH", f: "OH", c: "-", name: "水酸化物イオン", near: ["H", "Cl", "NH4"], wrongCharge: ["2-"] },
    { id: "SO4", f: "SO4", c: "2-", name: "硫酸イオン", near: ["CO3", "NO3", "OH"], wrongCharge: ["-"] },
    { id: "CO3", f: "CO3", c: "2-", name: "炭酸イオン", near: ["SO4", "NO3", "OH"], wrongCharge: ["-"] },
    { id: "NO3", f: "NO3", c: "-", name: "硝酸イオン", near: ["SO4", "CO3", "NH4"], wrongCharge: ["2-"] }
  ];
  function ionById(id) { return IONS.filter(function (x) { return x.id === id; })[0]; }
  function ionHtml(x) { return ion(x.f, x.c); }
  function flipSign(c) { return c.indexOf("+") >= 0 ? c.replace("+", "-") : c.replace("-", "+"); }
  function isCation(x) { return x.c.indexOf("+") >= 0; }

  // 陽子・電子の数の問題に使う原子(原子番号の小さい定番の元素だけ)
  var ATOMS_Z = [
    { s: "Na", name: "ナトリウム", ionName: "ナトリウムイオン", z: 11, c: 1 },
    { s: "K", name: "カリウム", ionName: "カリウムイオン", z: 19, c: 1 },
    { s: "Mg", name: "マグネシウム", ionName: "マグネシウムイオン", z: 12, c: 2 },
    { s: "Ca", name: "カルシウム", ionName: "カルシウムイオン", z: 20, c: 2 },
    { s: "Cl", name: "塩素", ionName: "塩化物イオン", z: 17, c: -1 }
  ];
  function chargeOf(n) { return (Math.abs(n) === 1 ? "" : String(Math.abs(n))) + (n > 0 ? "+" : "-"); }

  // 電離を表す式の問題。wrong は誤答の式(左辺, 右辺, 誤りの種類)
  var IONIZE = [
    { id: "nacl", name: "塩化ナトリウム", f: "NaCl", ions: "ナトリウムイオン(" + ion("Na", "+") + ")と塩化物イオン(" + ion("Cl", "-") + ")",
      wrong: [
        [["NaCl"], ["Na^+", "2Cl^-"], "count"],        // Cl 1 と 2、電荷 0 と −1
        [["NaCl"], ["Na^+", "Cl^+"], "count"],         // 電荷 0 と +2
        [["NaCl"], ["Na^-", "Cl^+"], "formula"],       // イオン式の+と−が逆
        [["NaCl"], ["Na^2+", "Cl^2-"], "formula"]      // 電荷の数がちがう
      ] },
    { id: "hcl", name: "塩化水素", f: "HCl", ions: "水素イオン(" + ion("H", "+") + ")と塩化物イオン(" + ion("Cl", "-") + ")",
      wrong: [
        [["HCl"], ["H^+", "Cl2^-"], "count"],          // Cl 1 と 2
        [["HCl"], ["H^+", "Cl^+"], "count"],           // 電荷 0 と +2
        [["HCl"], ["H^-", "Cl^+"], "formula"],
        [["HCl"], ["H2^+", "Cl^-"], "count"]           // H 1 と 2
      ] },
    { id: "cucl2", name: "塩化銅", f: "CuCl2", ions: "銅イオン(" + ion("Cu", "2+") + ")と塩化物イオン(" + ion("Cl", "-") + ")",
      wrong: [
        [["CuCl2"], ["Cu^2+", "Cl^-"], "count"],       // Cl 2 と 1、電荷 0 と +1
        [["CuCl2"], ["Cu^+", "2Cl^-"], "count"],       // 電荷 0 と −1
        [["CuCl2"], ["Cu^2+", "Cl2^2-"], "formula"],   // Cl₂²⁻ というイオンはない
        [["CuCl2"], ["Cu^2-", "2Cl^+"], "formula"]
      ] },
    { id: "naoh", name: "水酸化ナトリウム", f: "NaOH", ions: "ナトリウムイオン(" + ion("Na", "+") + ")と水酸化物イオン(" + ion("OH", "-") + ")",
      wrong: [
        [["NaOH"], ["Na^+", "OH^+"], "count"],         // 電荷 0 と +2
        [["NaOH"], ["Na^+", "OH^2-"], "count"],        // 電荷 0 と −1
        [["NaOH"], ["Na^-", "OH^+"], "formula"],
        [["NaOH"], ["NaO^-", "H^+"], "formula"]        // NaO⁻ というイオンはない
      ] }
  ];

  JHS.register("g3-ions", {
    points: [
      "水にとかしたとき、水溶液に電流が流れる物質を<b>" + r("電解質", "でんかいしつ") + "</b>、流れない物質を<b>非電解質</b>といいます。" +
        rule("塩化ナトリウム・塩化水素・水酸化ナトリウム・塩化銅") + "は電解質、" + rule("砂糖・エタノール") + "は非電解質です。純粋な水には、電流がほとんど流れません。",
      "塩化銅水溶液(青色)に電流を流すと、" + rule("陰極に赤色の銅が付着し、陽極から塩素が発生します") + "(" + eqOf("cucl2Split") + ")。塩素は、プールの消毒薬のようなにおいがあり、赤インクの色を消すはたらき(漂白作用)があります。" +
        "塩酸に電流を流すと、" + rule("陰極に水素、陽極に塩素") + "が発生します(" + eqOf("hclSplit") + ")。",
      "原子は、中心にある" + r("原子核", "げんしかく") + "と、そのまわりにある" + rule("−の電気をもつ電子") + "でできています。原子核は、" + rule("+の電気をもつ" + r("陽子", "ようし")) + "と、" + rule("電気をもたない" + r("中性子", "ちゅうせいし")) + "でできています。" +
        "陽子1個と電子1個の電気の量は同じで、" + rule("陽子の数と電子の数が等しい") + "ので、原子全体は電気を帯びていません。同じ元素で中性子の数がちがう原子を、同位体といいます。",
      "原子が電子を失うと、+の電気を帯びた<b>陽イオン</b>になり、電子を受けとると、−の電気を帯びた<b>陰イオン</b>になります。ナトリウム原子は電子を1個失って " + ion("Na", "+") + "、銅原子は電子を2個失って " + ion("Cu", "2+") + "、塩素原子は電子を1個受けとって " + ion("Cl", "-") + " になります。",
      "イオンを、元素記号と、右上に書いた電気の種類(+・−)と数で表したものを<b>イオン式</b>といいます。" + ion("NH4", "+") + "、" + ion("OH", "-") + "、" + ion("SO4", "2-") + " のように、いくつかの原子のまとまりがイオンになったものもあります。",
      "電解質が水にとけて、陽イオンと陰イオンに分かれることを<b>" + r("電離", "でんり") + "</b>といいます。電解質の水溶液に電流が流れるのは、水溶液の中にイオンがあるからです。非電解質は電離しないので、水溶液に電流が流れません。"
    ],
    figures: [
      { html: figHelium(), caption: "ヘリウム原子のモデル。陽子(+)2個、中性子2個、電子(−)2個でできています。陽子の数と電子の数が等しいので、原子全体は電気を帯びていません(実際の原子核は、原子全体に比べて、図よりずっと小さいです)。" },
      { html: figCuCl2({ ions: true }), caption: "塩化銅水溶液の電気分解。+の電気をもつ銅イオンは陰極に引かれ、電子を受けとって銅になります。−の電気をもつ塩化物イオンは陽極に引かれ、電子をわたして塩素になります。" }
    ],
    blocks: [
      ELECTROLYSIS_TABLE,
      eqBox(eqOf("cucl2Split")),
      ION_TABLE_PLUS,
      ION_TABLE_MINUS,
      IONIZE_TABLE
    ],
    example: {
      title: "塩化銅水溶液に電流を流すと、陰極と陽極では、それぞれ何ができますか。イオンを使って説明しなさい。",
      steps: [
        "塩化銅は、水にとけて銅イオンと塩化物イオンに電離しています。",
        eqBox(eqOf("cucl2")),
        "<b>陰極</b>: +の電気をもつ銅イオンが引かれ、電子を2個受けとって銅原子になり、電極に付着します(" + eqOf("cuGet") + "。" + ion("e", "-") + " は電子1個)。",
        "<b>陽極</b>: −の電気をもつ塩化物イオンが引かれ、電子を1個ずつわたして塩素原子になり、2個ずつ結びついて塩素分子になります(" + eqOf("clGive") + ")。",
        "全体をまとめると、" + eqOf("cucl2Split") + " です。"
      ],
      result: "陰極には銅が付着し、陽極からは塩素が発生する"
    },
    fixed: [
      {
        id: "nonelectrolyte",
        text: "次の物質をそれぞれ水にとかし、水溶液に電流が流れるかを調べました。電流が<b>流れない</b>ものはどれですか。",
        choices: ["砂糖", "塩化ナトリウム", "水酸化ナトリウム", "塩化銅"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "砂糖は、水にとけても電離しない非電解質なので、水溶液に電流は流れません。",
          "塩化ナトリウム、水酸化ナトリウム、塩化銅は電解質で、水にとけるとイオンに分かれるので、水溶液に電流が流れます。"
        ]
      },
      {
        id: "electrolyte-pair",
        text: "<b>電解質</b>の組み合わせとして、正しいものはどれですか。",
        choices: ["塩化水素と塩化銅", "砂糖とエタノール", "塩化水素と砂糖", "エタノールと水酸化ナトリウム"],
        answer: 0,
        explain: [
          "塩化水素(水溶液は塩酸)と塩化銅は、水にとけると電離するので電解質です。",
          "砂糖とエタノールは、水にとけても電離しない非電解質です。"
        ]
      },
      {
        id: "cucl2-cathode",
        text: "図のように、塩化銅水溶液に電流を流しました。陰極の表面(A)に付着した物質の説明として、正しいものはどれですか。",
        figure: figCuCl2({ keys: true }),
        choices: [
          "赤色の物質で、こすると金属光沢が出る。銅である",
          "白色の物質で、水にとける。塩化ナトリウムである",
          "青色の物質で、水にとける。塩化銅である",
          "黒色の物質で、こすっても光らない。炭素である"
        ],
        answer: 0,
        explain: [
          "陰極(電源装置の−極につないだ電極)には、+の電気をもつ銅イオンが引かれ、銅になって付着します。",
          "銅は赤色の金属で、薬さじなどでこすると金属光沢が出ます。"
        ]
      },
      {
        id: "cucl2-anode",
        text: "図のように、塩化銅水溶液に電流を流すと、陽極から気体(B)が発生しました。この気体の性質として、正しいものはどれですか。",
        figure: figCuCl2({ keys: true }),
        choices: [
          "プールの消毒薬のようなにおいがあり、赤インクの色を消す",
          "火のついた線香を入れると、線香が激しく燃える",
          "マッチの火を近づけると、音を立てて燃える",
          "石灰水に通すと、石灰水が白くにごる"
        ],
        answer: 0,
        explain: [
          "陽極には、−の電気をもつ塩化物イオンが引かれ、塩素が発生します。塩素には特有の刺激臭があり、赤インクの色を消す漂白作用があります。",
          "線香が激しく燃えるのは酸素、音を立てて燃えるのは水素、石灰水を白くにごらせるのは二酸化炭素の性質です。"
        ]
      },
      {
        id: "cucl2-color",
        text: "塩化銅水溶液に電流を流し続けると、水溶液の青色はどうなりますか。理由とあわせて、正しいものを選びなさい。",
        choices: [
          "うすくなる。青色のもとである銅イオンが、銅になって陰極に付着し、減っていくから",
          "こくなる。陽極から塩素が発生して、銅イオンがふえていくから",
          "うすくなる。陰極から水素が発生して、水溶液がうすまるから",
          "変わらない。電流を流しても、水溶液の中のイオンの数は変わらないから"
        ],
        answer: 0,
        explain: [
          "塩化銅水溶液の青色は、銅イオンによる色です。電流を流すと、銅イオンが陰極で電子を受けとって銅になるので、水溶液の中の銅イオンが減り、青色がうすくなります。",
          "塩化銅水溶液の電気分解では、陰極に付着するのは銅で、水素は発生しません。"
        ]
      },
      {
        id: "hcl-electrolysis",
        text: "うすい塩酸に電流を流すと、両方の電極から気体が発生しました。陰極と陽極で発生した気体の組み合わせとして、正しいものはどれですか。",
        choices: [
          "陰極は水素、陽極は塩素",
          "陰極は塩素、陽極は水素",
          "陰極は水素、陽極は酸素",
          "陰極は酸素、陽極は塩素"
        ],
        answer: 0,
        explain: [
          "塩酸の中の水素イオン(" + ion("H", "+") + ")は陰極に引かれて水素に、塩化物イオン(" + ion("Cl", "-") + ")は陽極に引かれて塩素になります(" + eqOf("hclSplit") + ")。",
          "酸素が発生するのは、水の電気分解の陽極です。"
        ]
      },
      {
        id: "atom-neutron",
        text: "図は、ヘリウム原子のつくりをモデルで表したものです。「+」の印は+の電気を、「−」の印は−の電気をもつことを表します。<b>電気をもたない</b>粒子の記号と名前の組み合わせとして、正しいものはどれですか。",
        figure: figHelium({ keys: true }),
        choices: ["C、中性子", "B、陽子", "A、電子", "C、陽子"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "原子核の中にあって、印のない粒子 C は、電気をもたない中性子です。+の印の B は陽子、原子核のまわりにある−の印の A は電子です。",
          "D は、陽子と中性子が集まった原子核です。"
        ]
      },
      {
        id: "atom-neutral",
        text: "原子全体が電気を帯びていないのは、なぜですか。",
        choices: [
          "+の電気をもつ陽子の数と、−の電気をもつ電子の数が等しいから",
          "陽子の数と、中性子の数が等しいから",
          "原子核も電子も、電気をもっていないから",
          "電子の数と、中性子の数が等しいから"
        ],
        answer: 0,
        explain: [
          "陽子1個がもつ+の電気と、電子1個がもつ−の電気の量は同じです。原子の中では陽子の数と電子の数が等しいので、+と−が打ち消し合って、全体は電気を帯びていません。",
          "中性子は電気をもたないので、中性子の数は、原子全体の電気には関係しません。"
        ]
      },
      {
        id: "cation-def",
        text: "<b>陽イオン</b>の説明として、正しいものはどれですか。",
        choices: [
          "原子が電子を失って、+の電気を帯びたもの",
          "原子が電子を受けとって、+の電気を帯びたもの",
          "原子が陽子を受けとって、+の電気を帯びたもの",
          "原子が中性子を失って、+の電気を帯びたもの"
        ],
        answer: 0,
        explain: [
          "原子が−の電気をもつ電子を失うと、+の電気が多くなり、陽イオンになります。電子を受けとると、−の電気が多くなり、陰イオンになります。",
          "イオンになるときに出入りするのは電子で、原子核の中の陽子や中性子の数は変わりません。"
        ]
      },
      {
        id: "cucl2-ionize",
        text: "塩化銅の電離を表す式として、正しいものはどれですか。",
        choices: [
          eqOf("cucl2"),
          badEq(["CuCl2"], ["Cu^2+", "Cl^-"]),
          badEq(["CuCl2"], ["Cu^+", "2Cl^-"]),
          badEq(["CuCl2"], ["Cu^2+", "Cl2^2-"], "formula")
        ],
        answer: 0,
        explain: [
          "塩化銅は、銅イオン(" + ion("Cu", "2+") + ")1個と塩化物イオン(" + ion("Cl", "-") + ")2個に電離します。左右とも、銅原子は1個、塩素原子は2個で、電気の合計は 0(+2 と −1 × 2)です。",
          "銅イオンは " + ion("Cu", "2+") + "、塩化物イオンは " + ion("Cl", "-") + " で、" + ion("Cl2", "2-") + " というイオンはありません。"
        ]
      },
      {
        id: "ionization-def",
        text: "「電離」の説明として、正しいものはどれですか。",
        choices: [
          "電解質が水にとけて、陽イオンと陰イオンに分かれること",
          "電流を流して、物質を2種類以上の物質に分けること",
          "原子が電子を受けとって、陰イオンになること",
          "非電解質が水にとけて、分子がばらばらに広がること"
        ],
        answer: 0,
        explain: [
          "電離は、電解質が水にとけて陽イオンと陰イオンに分かれることです。電流を流さなくても、水にとけるだけで起こります。",
          "電流を流して物質を分けるのは、電気分解です。"
        ]
      },
      {
        id: "why-current",
        text: "塩化ナトリウムの水溶液に電流が流れるのは、なぜですか。",
        choices: [
          "塩化ナトリウムが電離して、水溶液の中に陽イオンと陰イオンがあるから",
          "塩化ナトリウムが、金属と同じように電子を自由に動かすから",
          "水の分子が、電気を帯びているから",
          "塩化ナトリウムの分子が、水の中で電子を運ぶから"
        ],
        answer: 0,
        explain: [
          "塩化ナトリウムは、水にとけるとナトリウムイオンと塩化物イオンに電離します(" + eqOf("nacl") + ")。",
          "電気を帯びたイオンが水溶液の中にあるので、電流が流れます。砂糖のような非電解質は電離しないので、水溶液に電流は流れません。"
        ]
      },
      {
        id: "cu-ion-move",
        text: "塩化銅水溶液に電流を流したとき、銅イオンについて正しく説明しているものはどれですか。",
        choices: [
          "陰極に引かれ、電子を受けとって銅原子になる",
          "陽極に引かれ、電子を受けとって銅原子になる",
          "陰極に引かれ、電子を失って銅原子になる",
          "陽極に引かれ、電子を失って銅原子になる"
        ],
        answer: 0,
        explain: [
          "銅イオン(" + ion("Cu", "2+") + ")は+の電気をもつので、−極につないだ陰極に引かれます。",
          "陰極で電子を2個受けとると、電気をもたない銅原子になります(" + eqOf("cuGet") + ")。"
        ]
      },
      {
        id: "polyatomic",
        text: "次のイオンのうち、<b>陰イオン</b>はどれですか。",
        choices: [ion("SO4", "2-"), ion("NH4", "+"), ion("Cu", "2+"), ion("H", "+")],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "−の記号がついている " + ion("SO4", "2-") + "(硫酸イオン)が陰イオンです。硫黄原子1個と酸素原子4個のまとまりが、電子を2個受けとったイオンです。",
          ion("NH4", "+") + "(アンモニウムイオン)、" + ion("Cu", "2+") + "(銅イオン)、" + ion("H", "+") + "(水素イオン)は、+の記号がついている陽イオンです。"
        ]
      }
    ],
    generators: [
      {
        id: "ion-particles",
        label: "イオンの陽子・電子の数",
        make: function () {
          var a = JHS.pick(ATOMS_Z), kind = JHS.randInt(0, 2), c, n = Math.abs(a.c);
          var ionH = ion(a.s, chargeOf(a.c)), e = a.z - a.c;
          var lead = a.name + "原子は、陽子を " + ko(a.z) + " もっています。";
          var how = a.c > 0 ? "電子を " + ko(n) + " 失って" : "電子を " + ko(n) + " 受けとって";
          if (kind === 0) {
            c = JHS.choices4(ko(e), [ko(a.z), ko(a.z + a.c), ko(a.z - 2 * a.c), ko(a.z + 1), ko(a.z - 1)]);
            if (!c) return null;
            return {
              text: lead + a.ionName + "(" + ionH + ")1個がもつ<b>電子</b>の数は何個ですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "原子では、陽子の数と電子の数が等しいので、" + a.name + "原子の電子は " + ko(a.z) + " です。",
                ionH + " は、" + a.name + "原子が" + how + "できた" + (a.c > 0 ? "陽" : "陰") + "イオンです。",
                JHS.calc(a.z + (a.c > 0 ? " − " : " + ") + n, e + " 個")
              ],
              meta: { kind: "electrons", ion: a.s, z: a.z, charge: a.c, answer: e }
            };
          }
          if (kind === 1) {
            c = JHS.choices4(ko(a.z), [ko(e), ko(a.z + a.c), ko(a.z - 2 * a.c), ko(a.z + 1), ko(a.z - 1)]);
            if (!c) return null;
            return {
              text: lead + a.ionName + "(" + ionH + ")1個がもつ<b>陽子</b>の数は何個ですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "原子がイオンになるときに出入りするのは電子だけで、原子核の中の陽子の数は変わりません。" + ionH + " の陽子は、" + a.name + "原子と同じ " + ko(a.z) + " です。",
                "変わるのは電子の数で、" + how + "、" + ko(e) + " になっています。"
              ],
              meta: { kind: "protons", ion: a.s, z: a.z, charge: a.c, answer: a.z }
            };
          }
          // 電子をいくつ失った(受けとった)か
          function desc(lose, k) { return "電子を " + ko(k) + (lose ? " 失ってできた" : " 受けとってできた"); }
          var lose = a.c > 0;
          c = JHS.choices4(desc(lose, n), [desc(!lose, n), desc(lose, n === 1 ? 2 : 1), desc(!lose, n === 1 ? 2 : 1)]);
          if (!c) return null;
          return {
            text: a.ionName + "(" + ionH + ")は、" + a.name + "原子がどのように変化してできたイオンですか。",
            choices: c.choices, answer: c.answer,
            explain: [
              "イオン式の右上の記号は、イオンがもつ電気の種類と数を表します。" + ionH + " は" + (lose ? "+" : "−") + "の電気を " + n + " つ分もつ" + (lose ? "陽" : "陰") + "イオンです。",
              lose ? "−の電気をもつ電子を " + ko(n) + " 失うと、+の電気が " + n + " つ分多くなります。"
                : "−の電気をもつ電子を " + ko(n) + " 受けとると、−の電気が " + n + " つ分多くなります。"
            ],
            meta: { kind: "lose-or-take", ion: a.s, charge: a.c }
          };
        }
      },
      {
        id: "ion-formula",
        label: "イオンの名前とイオン式",
        make: function () {
          var x = JHS.pick(IONS), kind = JHS.randInt(0, 2), c;
          var others = JHS.shuffle(x.near).map(ionById);
          if (kind === 0) {
            // 名前 → イオン式
            var wrong = [ion(x.f, flipSign(x.c))].concat(x.wrongCharge.map(function (w) { return ion(x.f, w); }), others.map(ionHtml));
            c = JHS.choices4(ionHtml(x), JHS.shuffle(wrong.slice(0, 2)).concat(wrong.slice(2)));
            if (!c) return null;
            return {
              text: "「" + x.name + "」のイオン式はどれですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                x.name + "のイオン式は " + ionHtml(x) + " です。" + (isCation(x) ? "+" : "−") + "の電気を帯びた" + (isCation(x) ? "陽" : "陰") + "イオンです。",
                "イオン式は、元素記号(や原子のまとまり)の右上に、電気の種類(+・−)と数を書いて表します。数が1のときは書きません。"
              ],
              meta: { kind: "name-to-formula", ion: x.id }
            };
          }
          if (kind === 1) {
            // イオン式 → 名前
            c = JHS.choices4(x.name, others.map(function (o) { return o.name; }));
            if (!c) return null;
            return {
              text: "イオン式 " + ionHtml(x) + " で表されるイオンはどれですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                ionHtml(x) + " は" + x.name + "です。",
                others.map(function (o) { return o.name + "は " + ionHtml(o); }).join("、") + " です。"
              ],
              meta: { kind: "formula-to-name", ion: x.id }
            };
          }
          // 陽イオン・陰イオンを見分ける(1つだけちがう種類を選ぶ)
          var wantCation = isCation(x);
          var pool = JHS.shuffle(IONS.filter(function (o) { return isCation(o) !== wantCation; }));
          c = JHS.choices4(ionHtml(x), pool.map(ionHtml));
          if (!c) return null;
          return {
            text: "次のイオンのうち、<b>" + (wantCation ? "陽イオン" : "陰イオン") + "</b>はどれですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              ionHtml(x) + "(" + x.name + ")は、右上に" + (wantCation ? "+" : "−") + "の記号があるので" + (wantCation ? "陽" : "陰") + "イオンです。",
              "ほかの3つは、右上に" + (wantCation ? "−" : "+") + "の記号があるので" + (wantCation ? "陰" : "陽") + "イオンです。"
            ],
            meta: { kind: wantCation ? "find-cation" : "find-anion", ion: x.id }
          };
        }
      },
      {
        id: "ionize-equation",
        label: "電離を表す式",
        make: function () {
          var x = JHS.pick(IONIZE);
          var wrong = JHS.shuffle(x.wrong).map(function (w) { return badEq(w[0], w[1], w[2]); });
          var right = eqOf(x.id);
          var c = JHS.choices4(right, wrong);
          if (!c) return null;
          return {
            text: x.name + "(" + chem(x.f) + ")が水にとけて電離するようすを表す式として、正しいものはどれですか。",
            choices: c.choices, answer: c.answer,
            explain: [
              x.name + "は、" + x.ions + "に電離します。",
              "正しい式は、矢印の左右で原子の種類と数が同じで、右辺の+と−の電気の合計が 0 になっています。ほかの式は、イオン式がまちがっているか、原子の数や電気の合計が合っていません。"
            ],
            meta: { kind: "ionize", substance: x.id }
          };
        }
      },
      {
        id: "ion-count",
        label: "電離してできるイオンの数",
        make: function () {
          var kind = JHS.randInt(0, 3), n, c;
          var note = "塩化銅は、水溶液の中ですべて電離しているものとします。";
          var ratio = "塩化銅は " + eqOf("cucl2") + " のように電離するので、銅イオンと塩化物イオンの数の比は 1:2 です。";
          if (kind === 0) {
            n = JHS.randInt(2, 15);
            c = JHS.choices4(ko(2 * n), [ko(n), n % 2 === 0 ? ko(n / 2) : null, ko(3 * n), ko(4 * n)]);
            if (!c) return null;
            return {
              text: "塩化銅水溶液の中に、銅イオンが " + ko(n) + " あります。塩化物イオンは何個ありますか。" + note,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [ratio, "塩化物イオンの数は、銅イオンの数の2倍です。", JHS.calc(n + " 個 × 2", 2 * n + " 個")],
              meta: { kind: "cu-to-cl", copperIons: n, answer: 2 * n }
            };
          }
          if (kind === 1) {
            n = JHS.randInt(2, 15);
            var m = 2 * n;
            c = JHS.choices4(ko(n), [ko(m), ko(2 * m), ko(3 * n)]);
            if (!c) return null;
            return {
              text: "塩化銅水溶液の中に、塩化物イオンが " + ko(m) + " あります。銅イオンは何個ありますか。" + note,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [ratio, "銅イオンの数は、塩化物イオンの数の半分です。", JHS.calc(m + " 個 ÷ 2", n + " 個")],
              meta: { kind: "cl-to-cu", chlorideIons: m, answer: n }
            };
          }
          if (kind === 2) {
            n = JHS.randInt(2, 15);
            c = JHS.choices4(ko(3 * n), [ko(2 * n), ko(n), ko(4 * n)]);
            if (!c) return null;
            return {
              text: "塩化銅(" + chem("CuCl2") + ")" + n + "個分が水にとけて、すべて電離しました。できたイオンは、陽イオンと陰イオンを合わせて何個ですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "塩化銅1個分は、銅イオン1個と塩化物イオン2個に電離します(" + eqOf("cucl2") + ")。イオンは、1個分あたり3個できます。",
                JHS.calc(n + " 個 × 3", 3 * n + " 個")
              ],
              meta: { kind: "total-ions", units: n, answer: 3 * n }
            };
          }
          // 電気分解でできる銅原子と塩素分子の数
          n = JHS.randInt(2, 15);
          c = JHS.choices4(ko(n), [ko(2 * n), n % 2 === 0 ? ko(n / 2) : null, ko(3 * n), ko(n + 1)]);
          if (!c) return null;
          return {
            text: "塩化銅水溶液に電流を流したところ、陰極に銅原子が " + ko(n) + " 付着しました。このとき、陽極で発生した塩素分子(" + chem("Cl2") + ")は何個ですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "陰極では銅イオン1個が電子を2個受けとって銅原子1個になり(" + eqOf("cuGet") + ")、陽極では塩化物イオン2個が電子を2個わたして塩素分子1個になります(" + eqOf("clGive") + ")。",
              "やりとりする電子の数が同じなので、銅原子1個に対して塩素分子が1個できます(" + eqOf("cucl2Split") + ")。塩素分子は " + ko(n) + " です。"
            ],
            meta: { kind: "cu-and-cl2", copperAtoms: n, answer: n }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-7 化学変化と電池
  // =====================================================================

  // ---------- 図: ダニエル電池 ----------
  // 左が亜鉛板(−極)と硫酸亜鉛水溶液、右が銅板(+極)と硫酸銅水溶液。間はセロハン。
  // 電子は導線を亜鉛板 → 銅板、電流は銅板 → 亜鉛板。
  // opts: {}(要点帳。極・矢印・イオンを書く)、{ plain: true }(極と矢印を書かない)、
  //       { keys: true }(板とセロハンに記号 A〜C。板の名前・極・矢印を書かない)
  function figDaniell(opts) {
    opts = opts || {};
    var full = !opts.plain && !opts.keys, s = "";
    // 導線とモーター
    s += '<path class="fig-shape" d="M86 74V40H147M173 40H234V74"/>';
    s += '<circle class="fig-shape fig-fill-0" cx="160" cy="40" r="13"/>' + JHS.txt(160, 45, "M", { anchor: "middle" });
    // 容器と水溶液
    s += '<rect class="fig-fill-2" x="51" y="112" width="109" height="101"/>';
    s += '<rect class="fig-fill" x="160" y="112" width="109" height="101"/>';
    s += '<path class="fig-detail" d="M50 112H270"/>';
    s += '<path class="fig-shape" d="M50 96V206q0 8 8 8H262q8 0 8 -8V96"/>';
    s += '<path class="fig-line-2" d="M160 100V214"/>';   // セロハン
    // 金属板
    s += '<rect class="fig-shape fig-fill-0" x="80" y="74" width="12" height="122"/>';
    s += '<rect class="fig-shape fig-fill-0" x="228" y="74" width="12" height="122"/>';
    s += JHS.txt(105, 232, "硫酸亜鉛水溶液", { cls: "fig-small", anchor: "middle" });
    s += JHS.txt(215, 232, "硫酸銅水溶液", { cls: "fig-small", anchor: "middle" });
    if (opts.keys) {
      s += JHS.labels([
        { key: "A", name: "", from: [86, 88], to: [60, 62], side: "top" },
        { key: "B", name: "", from: [234, 88], to: [260, 62], side: "top" },
        { key: "C", name: "", from: [160, 150], to: [184, 140], side: "right" }
      ], { keys: true });
    } else {
      s += JHS.labels([
        { key: "Z", name: "亜鉛板", from: [86, 88], to: [58, 62], side: "top" },
        { key: "C", name: "銅板", from: [234, 88], to: [262, 62], side: "top" }
      ]);
      s += JHS.labels([{ key: "S", name: "セロハン", from: [160, 122], to: [160, 94], side: "top" }]);
    }
    if (full) {
      s += JHS.txt(58, 36, "−極", { cls: "fig-small", anchor: "middle" }) + JHS.txt(262, 36, "+極", { cls: "fig-small", anchor: "middle" });
      s += JHS.arrow(98, 28, 136, 28, "fig-line") + JHS.txt(117, 20, "電子", { cls: "fig-small", anchor: "middle" });
      s += JHS.arrow(222, 28, 184, 28, "fig-line-2") + JHS.txt(203, 20, "電流", { cls: "fig-small", anchor: "middle" });
      // イオンの動き: 亜鉛板から亜鉛イオンがとけ出し、銅イオンは銅板で銅になる
      s += JHS.arrow(95, 150, 108, 150) + JHS.txt(112, 155, svgIon("Zn^2+"));
      s += JHS.arrow(211, 178, 225, 178) + JHS.txt(207, 183, svgIon("Cu^2+"), { anchor: "end" });
    }
    return JHS.svg(320, 240, opts.keys
      ? "2種類の金属板と2種類の水溶液でつくった電池の図。左は硫酸亜鉛水溶液に入れた板、右は硫酸銅水溶液に入れた板で、2つの水溶液の間に膜がある。左の板にA、右の板にB、膜にCの記号がついている。2枚の板は導線でモーターにつながっている"
      : full ? "ダニエル電池。硫酸亜鉛水溶液に入れた亜鉛板が−極、硫酸銅水溶液に入れた銅板が+極で、2つの水溶液の間をセロハンで仕切る。電子は導線を亜鉛板から銅板へ、電流は銅板から亜鉛板へ流れる。亜鉛板からは亜鉛イオンがとけ出し、銅イオンは銅板で銅になる"
        : "硫酸亜鉛水溶液に入れた亜鉛板と、硫酸銅水溶液に入れた銅板を導線でモーターにつないだ電池の図。2つの水溶液の間はセロハンで仕切られている", s);
  }

  // 金属のイオンへのなりやすさ。rank が小さいほどなりやすい
  var METALS = [
    { id: "mg", name: "マグネシウム", sol: "硫酸マグネシウム水溶液", rank: 0 },
    { id: "zn", name: "亜鉛", sol: "硫酸亜鉛水溶液", rank: 1 },
    { id: "cu", name: "銅", sol: "硫酸銅水溶液", rank: 2 }
  ];
  // 金属片 piece を、metal のイオンをふくむ水溶液に入れたときの結果。○: metal が付着、×: 変化なし、−: 調べない
  function mark(piece, metal) { return piece === metal ? "−" : piece.rank < metal.rank ? "○" : "×"; }

  var METAL_TABLE = JHS.table({
    caption: "金属片を水溶液に入れたときの変化(○: 金属片の表面に金属が付着した、×: 変化がなかった、−: 調べていない)",
    head: ["水溶液", "マグネシウム片", "亜鉛片", "銅片"],
    stack: true,
    rows: METALS.map(function (sol) {
      return [sol.sol].concat(METALS.map(function (piece) { return mark(piece, sol); }));
    })
  });
  var CELL_TABLE = JHS.table({
    caption: "電池の種類",
    head: ["種類", "特徴", "例"],
    rows: [
      ["一次電池", "使うと電圧が下がり、充電できない", "マンガン乾電池、アルカリマンガン乾電池"],
      ["二次電池", "充電すると、くり返し使える", "鉛蓄電池、リチウムイオン電池"],
      ["燃料電池", "水素と酸素から水ができる化学変化を利用する", "燃料電池自動車、家庭用の発電装置"]
    ]
  });

  // ダニエル電池の極の説明に使う式
  var DANIELL_BOX = '<div class="formula" style="flex-direction:column;gap:4px">' +
    "<span>−極(亜鉛板): " + eqOf("znLose") + "</span>" +
    "<span>+極(銅板): " + eqOf("cuGet") + "</span>" +
    '<span style="font-size:13px;font-weight:400;color:var(--ink-muted)">(' + ion("e", "-") + " は電子1個)</span></div>";

  // 2種類の金属で電池をつくる問題の組み合わせ
  var PAIRS = [["mg", "zn"], ["mg", "cu"], ["zn", "cu"]];
  function metalById(id) { return METALS.filter(function (m) { return m.id === id; })[0]; }

  JHS.register("g3-batteries", {
    points: [
      "硫酸銅水溶液に" + r("亜鉛", "あえん") + "板を入れると、" + rule("亜鉛板の表面に赤色の銅が付着し、水溶液の青色がうすくなります") + "。亜鉛原子が電子を失って亜鉛イオンになってとけ出し、水溶液の中の銅イオンがその電子を受けとって銅原子になるからです(" + eqOf("znCu") + ")。" +
        "反対に、硫酸亜鉛水溶液に銅板を入れても、変化は起こりません。",
      "このような実験から、金属によって陽イオンへのなりやすさがちがうことがわかります。" + rule("マグネシウム > 亜鉛 > 銅") + " の順に、陽イオンになりやすい金属です。イオンになりやすい金属は、自分がイオンになって、イオンになりにくい金属のイオンを金属にもどします。",
      "化学変化を利用して、物質がもっている<b>化学エネルギー</b>を<b>電気エネルギー</b>に変えてとり出す装置を<b>電池</b>(化学電池)といいます。電池は、" + rule("2種類の金属と、電解質の水溶液") + "でつくることができ、" + rule("イオンになりやすいほうの金属が−極") + "になります。同じ種類の金属や、砂糖水・エタノールのような非電解質の水溶液では、電流はとり出せません。",
      "<b>ダニエル電池</b>では、" + rule("亜鉛板が−極") + "で、亜鉛が電子を失って亜鉛イオンになってとけ出します。" + rule("銅板が+極") + "で、水溶液の中の銅イオンが電子を受けとって銅になり、銅板に付着します。" +
        rule("電子は導線を−極(亜鉛板)から+極(銅板)へ") + "移動し、" + rule("電流の向きはその逆で、+極から−極へ") + "流れます。",
      "ダニエル電池の<b>セロハン</b>(素焼きの板を使うこともある)は、2つの水溶液がすぐに混ざらないようにしながら、イオンを少しずつ通します。混ざってしまうと、銅イオンが亜鉛板の表面で直接電子を受けとってしまい、電流がとり出しにくくなります。",
      "使うと電圧が下がり、充電できない電池を<b>一次電池</b>、充電するとくり返し使える電池を<b>二次電池</b>といいます。<b>燃料電池</b>は、水素と酸素が結びついて水ができる化学変化(" + eqOf("fuel") + ")を利用して、電気エネルギーをとり出す装置で、" + rule("出てくるのは水だけ") + "です。水の電気分解とは逆の化学変化です。"
    ],
    figures: [
      { html: figDaniell(), caption: "ダニエル電池(M はモーター)。亜鉛板(−極)では亜鉛が亜鉛イオンになってとけ出し、銅板(+極)では銅イオンが銅になって付着します。実線の矢印は電子、破線の矢印は電流の向きです。" }
    ],
    blocks: [
      METAL_TABLE,
      JHS.formula("イオンへのなりやすさ", "マグネシウム > 亜鉛 > 銅"),
      DANIELL_BOX,
      CELL_TABLE
    ],
    example: {
      title: "硫酸亜鉛水溶液に銅片を入れても変化はありませんでしたが、硫酸銅水溶液に亜鉛片を入れると、亜鉛片の表面に赤色の物質が付着しました。亜鉛と銅では、どちらが陽イオンになりやすいですか。",
      steps: [
        "亜鉛片の表面に付着した赤色の物質は、銅です。水溶液の中の銅イオンが、電子を受けとって銅になりました。",
        "その電子は、亜鉛原子が亜鉛イオンになるときに失ったものです。亜鉛は、自分がイオンになって、銅イオンを銅にもどしたことになります。",
        eqBox(eqOf("znCu")),
        "反対に、銅は亜鉛イオンを亜鉛にもどすことができませんでした。"
      ],
      result: "亜鉛のほうが、銅より陽イオンになりやすい"
    },
    fixed: [
      {
        id: "zn-in-cuso4",
        text: "硫酸銅水溶液に亜鉛板を入れて、しばらく置きました。このときのようすとして、正しいものはどれですか。",
        choices: [
          "亜鉛板の表面に赤色の物質が付着し、水溶液の青色がうすくなる",
          "亜鉛板の表面に赤色の物質が付着し、水溶液の青色がこくなる",
          "亜鉛板の表面から酸素が発生し、水溶液の色は変わらない",
          "何も変化しない"
        ],
        answer: 0,
        explain: [
          "亜鉛は銅より陽イオンになりやすいので、亜鉛がイオンになってとけ出し、水溶液の中の銅イオンが銅になって亜鉛板に付着します。",
          "水溶液の青色は銅イオンによる色なので、銅イオンが減ると青色がうすくなります。"
        ]
      },
      {
        id: "cu-in-znso4",
        text: "硫酸亜鉛水溶液に銅板を入れると、どうなりますか。",
        choices: [
          "何も変化しない",
          "銅板の表面に亜鉛が付着する",
          "銅板がとけて、水溶液が青色になる",
          "銅板の表面から水素が発生する"
        ],
        answer: 0,
        explain: [
          "銅は亜鉛より陽イオンになりにくいので、銅がイオンになって、亜鉛イオンを亜鉛にもどすことはできません。",
          "そのため、何も変化は起こりません。"
        ]
      },
      {
        id: "zn-cu-electron",
        text: "硫酸銅水溶液に亜鉛板を入れると、亜鉛板の表面に銅が付着します。このとき起こっていることの説明として、正しいものはどれですか。",
        choices: [
          "亜鉛原子が電子を失って亜鉛イオンになり、銅イオンがその電子を受けとって銅原子になる",
          "亜鉛原子が電子を受けとって亜鉛イオンになり、銅イオンが電子を失って銅原子になる",
          "銅イオンが亜鉛板の中に入りこみ、亜鉛原子と結びついて銅原子になる",
          "硫酸イオンが電子を失って、銅原子になる"
        ],
        answer: 0,
        explain: [
          "亜鉛原子は電子を2個失って亜鉛イオンになり、水溶液にとけ出します。銅イオンは電子を2個受けとって銅原子になり、亜鉛板に付着します。",
          eqBox(eqOf("znCu"))
        ]
      },
      {
        id: "metal-order",
        text: "マグネシウム・亜鉛・銅の金属片を、それぞれの金属のイオンをふくむ水溶液に入れ、変化を調べました。表の結果から、陽イオンになりやすい順に並べたものはどれですか。",
        material: METAL_TABLE,
        choices: [
          "マグネシウム > 亜鉛 > 銅",
          "銅 > 亜鉛 > マグネシウム",
          "亜鉛 > マグネシウム > 銅",
          "マグネシウム > 銅 > 亜鉛"
        ],
        answer: 0,
        explain: [
          "マグネシウム片は、硫酸亜鉛水溶液でも硫酸銅水溶液でも金属が付着したので、いちばんイオンになりやすい金属です。",
          "亜鉛片は、硫酸銅水溶液では銅が付着しましたが、硫酸マグネシウム水溶液では変化がありませんでした。銅片は、どちらの水溶液でも変化がなかったので、いちばんイオンになりにくい金属です。"
        ]
      },
      {
        id: "battery-energy",
        text: "電池(化学電池)は、どのようなエネルギーの変換を行う装置ですか。",
        choices: [
          "物質がもつ化学エネルギーを、電気エネルギーに変える",
          "電気エネルギーを、物質がもつ化学エネルギーに変える",
          "熱エネルギーを、電気エネルギーに変える",
          "光エネルギーを、化学エネルギーに変える"
        ],
        answer: 0,
        explain: [
          "電池は、化学変化を利用して、物質がもっている化学エネルギーを電気エネルギーに変えてとり出す装置です。",
          "二次電池を充電するときは、反対に、電気エネルギーを化学エネルギーに変えてたくわえます。"
        ]
      },
      {
        id: "battery-condition",
        text: "2枚の金属板を水溶液に入れ、導線で電子オルゴールにつなぎました。電子オルゴールが鳴る組み合わせはどれですか。",
        choices: [
          "亜鉛板と銅板を、うすい塩酸に入れる",
          "亜鉛板と亜鉛板を、うすい塩酸に入れる",
          "亜鉛板と銅板を、砂糖水に入れる",
          "亜鉛板と銅板を、エタノールの水溶液に入れる"
        ],
        answer: 0,
        explain: [
          "電池をつくるには、2種類の金属と、電解質の水溶液が必要です。塩酸は塩化水素(電解質)の水溶液です。",
          "同じ種類の金属どうしでは、電流はとり出せません。砂糖やエタノールは非電解質なので、その水溶液では電流は流れません。"
        ]
      },
      {
        id: "daniell-minus",
        text: "図の電池で、−極になるのはどちらの金属板ですか。理由もふくめて、正しいものを選びなさい。",
        figure: figDaniell({ plain: true }),
        choices: [
          "亜鉛板。亜鉛のほうが銅より陽イオンになりやすく、亜鉛が電子を失ってイオンになるから",
          "銅板。銅のほうが亜鉛より陽イオンになりやすく、銅が電子を失ってイオンになるから",
          "亜鉛板。亜鉛のほうが銅より陽イオンになりにくく、亜鉛イオンが電子を受けとるから",
          "銅板。銅のほうが亜鉛より陽イオンになりにくく、銅イオンが電子を失うから"
        ],
        answer: 0,
        explain: [
          "亜鉛のほうが銅より陽イオンになりやすいので、亜鉛板では亜鉛が電子を失って亜鉛イオンになります(" + eqOf("znLose") + ")。",
          "亜鉛板に残った電子が導線へ出ていくので、亜鉛板が−極です。銅板は+極で、銅イオンが電子を受けとって銅になります。"
        ]
      },
      {
        id: "daniell-direction",
        text: "図の電池(M はモーター)で、モーターが回りました。導線の中を移動する電子の向きと、電流の向きの組み合わせとして、正しいものはどれですか。",
        figure: figDaniell({ plain: true }),
        choices: [
          "電子は亜鉛板 → 銅板、電流は銅板 → 亜鉛板",
          "電子は銅板 → 亜鉛板、電流は亜鉛板 → 銅板",
          "電子も電流も、亜鉛板 → 銅板",
          "電子も電流も、銅板 → 亜鉛板"
        ],
        answer: 0,
        explain: [
          "亜鉛板(−極)で亜鉛が失った電子は、導線を通って銅板(+極)へ移動します。",
          "電流の向きは、電子の移動の向きと逆と決められているので、銅板(+極)から亜鉛板(−極)へ流れます。"
        ]
      },
      {
        id: "daniell-plus",
        text: "ダニエル電池の銅板(+極)では、どのようなことが起こっていますか。",
        choices: [
          "水溶液の中の銅イオンが電子を受けとって銅になり、銅板に付着する",
          "銅板の銅が電子を失って銅イオンになり、水溶液にとけ出す",
          "水溶液の中の亜鉛イオンが電子を受けとって亜鉛になり、銅板に付着する",
          "銅板から水素が発生する"
        ],
        answer: 0,
        explain: [
          "亜鉛板から導線を通ってきた電子を、硫酸銅水溶液の中の銅イオンが受けとり、銅になって銅板に付着します(" + eqOf("cuGet") + ")。",
          "電流をとり出し続けると、銅板には銅が付着していき、硫酸銅水溶液の青色はうすくなっていきます。"
        ]
      },
      {
        id: "cellophane",
        text: "図の電池で、2つの水溶液の間にある膜 C には、セロハンを使います。セロハンのはたらきとして、正しいものはどれですか。",
        figure: figDaniell({ keys: true }),
        choices: [
          "2つの水溶液がすぐに混ざらないようにしながら、イオンを少しずつ通す",
          "2つの水溶液を完全に分け、水もイオンも通さない",
          "導線のかわりに、電子を A から B へ通す",
          "銅イオンだけを、A の板のほうへ通す"
        ],
        answer: 0,
        explain: [
          "セロハンには目に見えない小さな穴があり、2つの水溶液がすぐに混ざるのを防ぎながら、イオンを少しずつ通します。イオンが通らないと、電流は流れ続けません。",
          "2つの水溶液が混ざると、銅イオンが亜鉛板(A)の表面で直接電子を受けとってしまい、電流がとり出しにくくなります。"
        ]
      },
      {
        id: "daniell-long",
        text: "ダニエル電池で長い時間モーターを回したあと、金属板を調べました。結果として、正しいものはどれですか。",
        choices: [
          "亜鉛板はとけて表面がぼろぼろになり、銅板には銅が付着して厚くなっていた",
          "亜鉛板には亜鉛が付着し、銅板はとけてうすくなっていた",
          "亜鉛板にも銅板にも、変化はなかった",
          "亜鉛板にも銅板にも、銅が付着していた"
        ],
        answer: 0,
        explain: [
          "−極の亜鉛板では、亜鉛が亜鉛イオンになってとけ出すので、亜鉛板は減っていきます。",
          "+極の銅板では、銅イオンが銅になって付着するので、銅がふえていきます。"
        ]
      },
      {
        id: "secondary-cell",
        text: "次の電池のうち、充電するとくり返し使える<b>二次電池</b>はどれですか。",
        choices: ["リチウムイオン電池", "マンガン乾電池", "アルカリマンガン乾電池", "酸化銀電池"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "リチウムイオン電池は、スマートフォンなどに使われる二次電池で、充電するとくり返し使えます。鉛蓄電池も二次電池です。",
          "マンガン乾電池、アルカリマンガン乾電池、酸化銀電池は、充電できない一次電池です。"
        ]
      },
      {
        id: "fuel-equation",
        text: "燃料電池で起こる化学変化を表す化学反応式として、正しいものはどれですか。",
        choices: [
          eqOf("fuel"),
          badEq(["H2", "O2"], ["H2O"]),
          badEq(["2H2", "O2"], ["H2O"]),
          badEq(["H2", "O"], ["H2O"], "formula")
        ],
        answer: 0,
        explain: [
          "燃料電池では、水素と酸素が結びついて水ができます。左辺も右辺も、水素原子は4個、酸素原子は2個で、数が合っています。",
          "酸素は分子 " + chem("O2") + " で表します。" + chem("H2") + " + " + chem("O2") + " → " + chem("H2O") + " では、酸素原子の数が左右で合いません。"
        ]
      },
      {
        id: "fuel-feature",
        text: "燃料電池の説明として、正しいものはどれですか。",
        choices: [
          "水素と酸素から水ができる化学変化を利用して電気をとり出し、出てくる物質は水だけである",
          "水に電流を流して、水素と酸素をとり出す装置である",
          "燃料を燃やした熱で水を沸騰させ、発電機を回している",
          "化学変化のときに、二酸化炭素を多く出す"
        ],
        answer: 0,
        explain: [
          "燃料電池は、水素と酸素が結びつく化学変化(" + eqOf("fuel") + ")で、化学エネルギーを直接、電気エネルギーに変えます。出てくるのは水だけです。",
          "水に電流を流して水素と酸素に分けるのは、水の電気分解で、燃料電池とは逆の化学変化です。"
        ]
      }
    ],
    generators: [
      {
        id: "metal-table",
        label: "実験の表から、金属のイオンへのなりやすさを考える",
        make: function () {
          var keys = ["A", "B", "C"], ms = JHS.shuffle(METALS), kind = JHS.randInt(0, 2), c;
          // ms[i] が金属 keys[i]
          var table = JHS.table({
            caption: "金属片を水溶液に入れたときの変化。水溶液の「Aのイオン」は、A のイオンをふくむ水溶液(○: 金属片の表面に金属が付着した、×: 変化がなかった、−: 調べていない)",
            head: ["水溶液", "金属A", "金属B", "金属C"],
            compact: true,
            rows: ms.map(function (sol, i) {
              return [keys[i] + "のイオン"].concat(ms.map(function (piece) { return mark(piece, sol); }));
            })
          });
          var lead = "3種類の金属 A・B・C の金属片を、A・B・C それぞれのイオンをふくむ水溶液に入れ、変化を調べました。";
          var order = [0, 1, 2].sort(function (i, j) { return ms[i].rank - ms[j].rank; });   // なりやすい順の番号
          function orderText(o) { return o.map(function (i) { return keys[i]; }).join(" > "); }
          var count = ms.map(function (piece) { return ms.filter(function (sol) { return mark(piece, sol) === "○"; }).length; });
          var reason = "金属片の表面に金属が付着したのは、金属片の金属がイオンになって、水溶液の中のイオンを金属にもどしたからです。" +
            "○の数は、" + keys.map(function (k, i) { return k + " が " + count[i] + "つ"; }).join("、") + "です。○が多い金属ほど、陽イオンになりやすい金属です。";
          var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
          if (kind === 0) {
            var rev = order.slice().reverse();
            c = JHS.choices4(orderText(order), [orderText(rev)].concat(JHS.shuffle(perms).map(orderText)));
            if (!c) return null;
            return {
              text: lead + "表の結果から、A・B・C を陽イオンになりやすい順に並べたものはどれですか。",
              material: table,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [reason, "陽イオンになりやすい順は、" + orderText(order) + " です。"],
              meta: { kind: "order", metals: ms.map(function (m) { return m.id; }), answer: orderText(order) }
            };
          }
          if (kind === 1) {
            function namesText(p) { return keys.map(function (k, i) { return k + " " + METALS[p[i]].name; }).join("、"); }
            var right = ms.map(function (m) { return m.rank; });
            c = JHS.choices4(namesText(right), JHS.shuffle(perms).map(namesText));
            if (!c) return null;
            return {
              text: lead + "A・B・C は、マグネシウム・亜鉛・銅のどれかです。表の結果から考えられる組み合わせはどれですか。",
              material: table,
              choices: c.choices, answer: c.answer,
              explain: [reason, "陽イオンになりやすい順は マグネシウム > 亜鉛 > 銅 なので、" + namesText(right) + " です。"],
              meta: { kind: "names", metals: ms.map(function (m) { return m.id; }) }
            };
          }
          // 2つの金属で電池をつくったときの−極と電子の向き
          var pair = JHS.shuffle([0, 1, 2]).slice(0, 2), x = pair[0], y = pair[1];
          var minus = ms[x].rank < ms[y].rank ? x : y, plus = minus === x ? y : x;
          function cell(m, from, to) { return keys[m] + " が−極で、電子は導線を " + keys[from] + " から " + keys[to] + " へ移動する"; }
          c = JHS.choices4(cell(minus, minus, plus), [cell(minus, plus, minus), cell(plus, plus, minus), cell(plus, minus, plus)]);
          if (!c) return null;
          return {
            text: lead + "次に、" + keys[x] + " と " + keys[y] + " の金属板をうすい塩酸に入れ、導線でつないで電池をつくりました。表の結果から考えて、正しいものはどれですか。",
            material: table,
            choices: c.choices, answer: c.answer,
            explain: [
              reason,
              keys[minus] + " のほうが " + keys[plus] + " より陽イオンになりやすいので、" + keys[minus] + " が電子を失ってイオンになり、" + keys[minus] + " が−極になります。電子は導線を−極(" + keys[minus] + ")から+極(" + keys[plus] + ")へ移動します。"
            ],
            meta: { kind: "cell", metals: ms.map(function (m) { return m.id; }), minus: keys[minus] }
          };
        }
      },
      {
        id: "metal-cell",
        label: "2種類の金属でつくった電池の−極と電子の向き",
        make: function () {
          var p = JHS.pick(PAIRS), a = metalById(p[0]), b = metalById(p[1]);   // a のほうがイオンになりやすい
          var sw = Math.random() < 0.5, first = sw ? b : a, second = sw ? a : b;
          var liquid = JHS.pick(["うすい塩酸", "食塩水"]);
          var kind = p[1] === "cu" ? JHS.randInt(0, 2) : JHS.randInt(0, 1), c;
          // 銅との組は電子オルゴールが鳴る。マグネシウムと亜鉛の組は電圧が小さく鳴るか確かでないので、電圧計で確かめる形にする
          var lead = first.name + "板と" + second.name + "板を" + liquid + "に入れ、" +
            (p[1] === "cu" ? "導線で電子オルゴールにつなぐと、電子オルゴールが鳴りました。" : "導線で電圧計につなぐと、電圧が生じていることがわかりました。");
          var why = "陽イオンへのなりやすさは マグネシウム > 亜鉛 > 銅 なので、" + a.name + "のほうが" + b.name + "より陽イオンになりやすく、" + a.name + "板が−極になります。";
          if (kind === 0) {
            function pole(m, easy) { return m.name + "板。" + m.name + "のほうが" + (m === a ? b : a).name + "より陽イオンになり" + (easy ? "やすい" : "にくい") + "から"; }
            c = JHS.choices4(pole(a, true), [pole(a, false), pole(b, true), pole(b, false)]);
            if (!c) return null;
            return {
              text: lead + "−極になったのはどちらの金属板ですか。理由もふくめて、正しいものを選びなさい。",
              choices: c.choices, answer: c.answer,
              explain: [why, a.name + "が電子を失って陽イオンになり、その電子が導線へ出ていくので、" + a.name + "板が−極です。"],
              meta: { kind: "minus", metals: p, minus: a.id }
            };
          }
          if (kind === 1) {
            function dir(e1, e2, i1, i2) { return "電子は " + e1.name + "板 → " + e2.name + "板、電流は " + i1.name + "板 → " + i2.name + "板"; }
            c = JHS.choices4(dir(a, b, b, a), [dir(b, a, a, b), dir(a, b, a, b), dir(b, a, b, a)]);
            if (!c) return null;
            return {
              text: lead + "導線の中を移動する電子の向きと、電流の向きの組み合わせとして、正しいものはどれですか。",
              choices: c.choices, answer: c.answer,
              explain: [why, "電子は導線を−極(" + a.name + "板)から+極(" + b.name + "板)へ移動します。電流の向きは電子の移動の向きと逆なので、" + b.name + "板から" + a.name + "板へ流れます。"],
              meta: { kind: "direction", metals: p, minus: a.id }
            };
          }
          // 銅との組み合わせ: とけ出す金属
          c = JHS.choices4(a.name + "板の" + a.name + "が、陽イオンになってとけ出す", [
            "銅板の銅が、陽イオンになってとけ出す",
            a.name + "板の" + a.name + "が、陰イオンになってとけ出す",
            "どちらの金属板も、まったく変化しない"
          ]);
          if (!c) return null;
          return {
            text: lead + "このとき、−極の金属板で起こっていることとして、正しいものはどれですか。",
            choices: c.choices, answer: c.answer,
            explain: [why, "−極の" + a.name + "板では、" + a.name + "原子が電子を2個失って陽イオンになり、水溶液にとけ出します(" + eqOf(a.id === "mg" ? "mgLose" : "znLose") + ")。金属は、陰イオンにはなりません。"],
            meta: { kind: "dissolve", metals: p, minus: a.id }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-8 酸・アルカリと中和
  // =====================================================================

  // ---------- 図: 電気泳動(pH試験紙の色の変化が動く向き) ----------
  // 左のクリップが電源装置の−極につながる陰極、右が陽極。
  // opts: { kind: "acid" | "alkali" }(色が変わった部分と、イオンの動く向きを書く)、{ plain: true, kind }(色の部分と矢印を書かない)
  function figElectrophoresis(opts) {
    opts = opts || {};
    var acid = opts.kind !== "alkali", s = "";
    s += '<path class="fig-shape" d="M128 26H42V104M192 26H278V104"/>';
    s += '<rect class="fig-shape fig-fill-2" x="128" y="12" width="64" height="28" rx="3"/>' + JHS.txt(160, 31, "電源装置", { cls: "fig-small", anchor: "middle" });
    s += JHS.txt(100, 22, "−極", { cls: "fig-small", anchor: "end" }) + JHS.txt(220, 22, "+極", { cls: "fig-small" });
    // ガラス板と pH試験紙
    s += '<rect class="fig-shape fig-fill-2" x="24" y="98" width="272" height="56" rx="2"/>';
    s += '<rect class="fig-shape fig-fill-0" x="40" y="112" width="240" height="28"/>';
    if (!opts.plain) {
      var at = acid ? ' x="108" y="112" width="50" height="28"/>' : ' x="162" y="112" width="50" height="28"/>';
      s += '<rect class="fig-fill"' + at + '<rect fill="url(#sci-pat-hatch)"' + at + '<rect class="fig-detail"' + at;
      if (acid) s += JHS.arrow(150, 166, 104, 166, "fig-line") + JHS.txt(156, 171, svgIon("H^+"));
      else s += JHS.arrow(170, 166, 216, 166, "fig-line") + JHS.txt(164, 171, svgIon("OH^-"), { anchor: "end" });
    }
    // 糸(水溶液をしみこませたもの)
    s += '<path class="fig-shape" style="stroke-width:3.5px" d="M160 104V148"/>';
    // クリップ
    s += '<rect class="fig-shape fig-fill-2" x="36" y="104" width="12" height="44" rx="2"/>';
    s += '<rect class="fig-shape fig-fill-2" x="272" y="104" width="12" height="44" rx="2"/>';
    s += JHS.labels([
      { key: "T", name: "糸", from: [160, 104], to: [160, 84], side: "top" },
      { key: "P", name: "pH試験紙", from: [240, 114], to: [236, 78], side: "top" }
    ]);
    s += JHS.txt(42, 176, "陰極", { cls: "fig-small", anchor: "middle" }) + JHS.txt(278, 176, "陽極", { cls: "fig-small", anchor: "middle" });
    var what = acid ? "うすい塩酸" : "うすい水酸化ナトリウム水溶液";
    return JHS.svg(320, 190, opts.plain
      ? "ガラス板の上に、電解質の水溶液でしめらせたpH試験紙を置き、両端をクリップでとめて電圧を加える装置の図。中央に、" + what + "をしみこませた糸を置いている。左のクリップは電源装置の−極(陰極)、右のクリップは+極(陽極)につながっている"
      : acid ? "電気泳動の実験。pH試験紙の中央に塩酸をしみこませた糸を置いて電圧を加えると、酸性を示す色に変わった部分が、陰極(左)の側へ広がる。水素イオンが陰極へ移動するため"
        : "電気泳動の実験。pH試験紙の中央に水酸化ナトリウム水溶液をしみこませた糸を置いて電圧を加えると、アルカリ性を示す色に変わった部分が、陽極(右)の側へ広がる。水酸化物イオンが陽極へ移動するため", s);
  }

  // ---------- 図: 中和のイオンのモデル(塩酸に水酸化ナトリウム水溶液を加える) ----------
  // 3つのビーカー。それぞれの中身は、イオンや分子の記号を並べて表す
  var MODEL_STAGES = [
    { id: "before", title: "加える前", state: "酸性", items: ["H^+", "Cl^-", "H^+", "Cl^-", "H^+", "Cl^-", "H^+", "Cl^-"] },
    { id: "half", title: "少し加えた", state: "酸性", items: ["H^+", "Cl^-", "Na^+", "Cl^-", "H2O", "H^+", "Na^+", "Cl^-", "H2O", "Cl^-"] },
    { id: "neutral", title: "ちょうど中和", state: "中性", items: ["Na^+", "Cl^-", "H2O", "Cl^-", "H2O", "Na^+", "Na^+", "Cl^-", "H2O", "Cl^-", "H2O", "Na^+"] }
  ];
  // order: 並べる段階の番号。keys: true で、題のかわりに ア・イ・ウ をつける(問題用)
  function figNeutralModel(order, keys) {
    order = order || [0, 1, 2];
    var s = "", kk = ["ア", "イ", "ウ"];
    order.forEach(function (st, i) {
      var x0 = 8 + i * 104, stage = MODEL_STAGES[st];
      s += '<rect class="fig-fill" x="' + (x0 + 1) + '" y="40" width="94" height="107"/>';
      s += '<path class="fig-shape" d="M' + x0 + " 26V140q0 8 8 8H" + (x0 + 88) + "q8 0 8 -8V26" + '"/>';
      stage.items.forEach(function (t, j) {
        var col = j % 3, row = Math.floor(j / 3);
        s += JHS.txt(x0 + 20 + col * 28, 64 + row * 24, svgIon(t), { cls: "fig-small", anchor: "middle" });
      });
      if (keys) s += JHS.key(x0 + 48, 168, kk[i]);
      else {
        s += JHS.txt(x0 + 48, 168, stage.title, { cls: "fig-small", anchor: "middle" });
        s += JHS.txt(x0 + 48, 186, stage.state, { cls: "fig-small", anchor: "middle" });
      }
    });
    return JHS.svg(320, 196, keys
      ? "塩酸に水酸化ナトリウム水溶液を加えていくときの、ビーカーの中のイオンと水分子をモデルで表した3つの図。ア、イ、ウの記号がついている"
      : "塩酸に水酸化ナトリウム水溶液を加えていくときの、ビーカーの中のイオンと水分子のモデル。加える前は水素イオンと塩化物イオンがある。加えると、水素イオンが水酸化物イオンと結びついて水になり、かわりにナトリウムイオンがふえる。水素イオンがなくなると中性になる", s);
  }

  // ---------- 図: 中和とイオンの数のグラフ ----------
  // 形: "dec"(減って 0 になり、そのまま)、"const"(変わらない)、"inc"(0 からふえ続ける)、"late"(中性まで 0、そのあとふえる)
  // 横軸は加えた体積(中性になる体積を 1 とすると 0〜2)、縦軸はイオンの数(はじめの酸のイオン 1 つ分を 1 とすると 0〜2)
  var SHAPES = {
    dec: [[0, 1], [1, 0], [2, 0]],
    "const": [[0, 1], [2, 1]],
    inc: [[0, 0], [2, 2]],
    late: [[0, 0], [1, 0], [2, 1]]
  };
  function ionPanel(ox, bottom, w, h, shape, head) {
    var s = "";
    function X(v) { return ox + v / 2 * (w - 6); }
    function Y(v) { return bottom - v / 2 * (h - 10); }
    s += '<path class="fig-dash" d="M' + X(1) + " " + bottom + "V" + (bottom - h + 4) + '"/>';
    s += '<path class="fig-axis" d="M' + ox + " " + (bottom - h) + "V" + bottom + "H" + (ox + w) + '"/>';
    s += '<path class="fig-line" d="' + SHAPES[shape].map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join("") + '"/>';
    s += JHS.txt(X(1), bottom + 15, "中性", { cls: "fig-small", anchor: "middle" });
    s += JHS.txt(ox - 6, bottom + 4, "0", { cls: "fig-num", anchor: "end" });
    s += head || "";
    return s;
  }
  // 4つの形を2×2に並べる。panels: [{ shape, title }] または keys: true で ア〜エ
  function figIonGraphs(panels, keys, label) {
    var s = "", kk = ["ア", "イ", "ウ", "エ"];
    panels.forEach(function (p, i) {
      var ox = i % 2 === 0 ? 40 : 190, bottom = i < 2 ? 98 : 208;
      var head = keys ? JHS.key(ox + 14, bottom - 80, kk[i]) : JHS.txt(ox + 8, bottom - 76, p.title, { halo: true });
      s += ionPanel(ox, bottom, 110, 84, p.shape, head);
    });
    return JHS.svg(320, 232, label, s);
  }
  // 1つの形を大きく描く(問題用)
  function figIonGraph(shape, what) {
    var s = ionPanel(50, 160, 250, 140, shape, "");
    s += JHS.txt(56, 30, "イオンの数", { cls: "fig-small", halo: true });
    s += JHS.txt(306, 194, "加えた体積", { cls: "fig-small", anchor: "end" });
    return JHS.svg(320, 200, "ある水溶液に別の水溶液を加えていったときの、加えた体積と、あるイオンの数の関係を表すグラフ。破線の位置でちょうど中性になる。" + what, s);
  }
  // 塩酸に水酸化ナトリウム水溶液を加える(a)/ 水酸化ナトリウム水溶液に塩酸を加える(b)ときの、イオンごとの形
  var ION_GRAPH = {
    a: { lead: "うすい塩酸に、うすい水酸化ナトリウム水溶液を少しずつ加えていきました。",
      shapes: { H: "dec", Cl: "const", Na: "inc", OH: "late" },
      why: {
        H: "水素イオン(" + ion("H", "+") + ")は、加えた水酸化物イオンと結びついて水になるので減っていき、ちょうど中性になったとき 0 になります。そのあとも 0 のままです。",
        Cl: "塩化物イオン(" + ion("Cl", "-") + ")は、中和に関係しないので、数は変わりません。",
        Na: "ナトリウムイオン(" + ion("Na", "+") + ")は、中和に関係しないので、加えた分だけふえ続けます。",
        OH: "水酸化物イオン(" + ion("OH", "-") + ")は、中性になるまでは水素イオンと結びついて水になるので 0 のままです。中性になったあとは、加えた分だけふえていきます。"
      } },
    b: { lead: "うすい水酸化ナトリウム水溶液に、うすい塩酸を少しずつ加えていきました。",
      shapes: { OH: "dec", Na: "const", Cl: "inc", H: "late" },
      why: {
        OH: "水酸化物イオン(" + ion("OH", "-") + ")は、加えた水素イオンと結びついて水になるので減っていき、ちょうど中性になったとき 0 になります。そのあとも 0 のままです。",
        Na: "ナトリウムイオン(" + ion("Na", "+") + ")は、中和に関係しないので、数は変わりません。",
        Cl: "塩化物イオン(" + ion("Cl", "-") + ")は、中和に関係しないので、加えた分だけふえ続けます。",
        H: "水素イオン(" + ion("H", "+") + ")は、中性になるまでは水酸化物イオンと結びついて水になるので 0 のままです。中性になったあとは、加えた分だけふえていきます。"
      } }
  };
  var ION_NAMES = {
    H: "水素イオン(" + ion("H", "+") + ")", Cl: "塩化物イオン(" + ion("Cl", "-") + ")",
    Na: "ナトリウムイオン(" + ion("Na", "+") + ")", OH: "水酸化物イオン(" + ion("OH", "-") + ")"
  };
  var SHAPE_WORDS = {
    dec: "減っていき、中性で 0 になる", "const": "変わらない", inc: "0 からふえ続ける", late: "中性になるまで 0 で、そのあとふえる"
  };

  // 表と箱
  var INDICATOR_TABLE = JHS.table({
    caption: "指示薬の色",
    head: ["指示薬", "酸性", "中性", "アルカリ性"],
    stack: true,
    rows: [
      ["青色リトマス紙", "赤色", "変化なし", "変化なし"],
      ["赤色リトマス紙", "変化なし", "変化なし", "青色"],
      ["BTB溶液", "黄色", "緑色", "青色"],
      ["フェノールフタレイン溶液", "無色", "無色", "赤色"]
    ]
  });
  var ACID_TABLE = JHS.table({
    caption: "酸とアルカリの電離",
    head: ["", "物質", "電離を表す式"],
    rows: [
      ["酸", nb("塩化水素"), eqOf("hcl")],
      ["酸", nb(r("硫酸", "りゅうさん")), eqOf("h2so4")],
      [nb("アルカリ"), nb("水酸化ナトリウム"), eqOf("naoh")],
      [nb("アルカリ"), nb("水酸化バリウム"), eqOf("baoh2")]
    ]
  });
  var SALT_TABLE = JHS.table({
    caption: "中和と塩",
    stack: true,   // 物質名を折り返さないと 360px 幅に3列が収まらないので、せまいときは1行を1枚のカードにする
    head: ["酸とアルカリ", "化学反応式", "できる塩"],
    rows: [
      ["<span>" + nb("塩酸") + "と" + nb("水酸化ナトリウム") + nb("水溶液") + "</span>", eqOf("hclNaoh"), "<span>" + nb("塩化ナトリウム") + "(水にとける)</span>"],
      ["<span>" + nb("硫酸") + "と" + nb("水酸化バリウム") + nb("水溶液") + "</span>", eqOf("h2so4Baoh2"), "<span>" + nb("硫酸バリウム") + "(水にとけにくく、白い沈殿になる)</span>"]
    ]
  });

  // 中和の計算に使う体積の比(塩酸:水酸化ナトリウム水溶液)。1:1 は、比を逆にしても同じになるので使わない
  var RATIOS = [[1, 2], [2, 1], [2, 3], [3, 2], [3, 4], [4, 3], [4, 5], [5, 4], [2, 5], [5, 2], [3, 5], [5, 3]];
  function pickRatio() {
    for (var t = 0; t < 30; t++) {
      var pq = JHS.pick(RATIOS), p = pq[0], qq = pq[1];
      var ms = [];
      for (var m = 1; m <= 15; m++) if (p * m >= 6 && p * m <= 30 && qq * m >= 6 && qq * m <= 30) ms.push(m);
      if (ms.length === 0) continue;
      var mm = JHS.pick(ms);
      return { p: p, q: qq, a: p * mm, b: qq * mm };
    }
    return null;
  }

  // 指示薬の問題に使う水溶液
  var SOLUTIONS = {
    acid: ["うすい塩酸", "炭酸水", "食酢"],
    neutral: ["食塩水", "砂糖水"],
    alkali: ["うすい水酸化ナトリウム水溶液", "アンモニア水", "石灰水"]
  };
  var NATURE = { acid: "酸性", neutral: "中性", alkali: "アルカリ性" };
  var INDICATORS = [
    { name: "BTB溶液", verb: "にBTB溶液を加えると", res: { acid: "黄色になる", neutral: "緑色になる", alkali: "青色になる" }, extra: ["赤色になる"] },
    { name: "フェノールフタレイン溶液", verb: "にフェノールフタレイン溶液を加えると", res: { acid: "無色のまま", neutral: "無色のまま", alkali: "赤色になる" }, extra: ["青色になる", "黄色になる"] },
    { name: "青色リトマス紙", verb: "を青色リトマス紙につけると", res: { acid: "赤色に変わる", neutral: "変化しない", alkali: "変化しない" }, extra: ["黄色に変わる", "緑色に変わる"] },
    { name: "赤色リトマス紙", verb: "を赤色リトマス紙につけると", res: { acid: "変化しない", neutral: "変化しない", alkali: "青色に変わる" }, extra: ["黄色に変わる", "緑色に変わる"] }
  ];

  JHS.register("g3-acids-alkalis", {
    points: [
      "水溶液は、" + rule("酸性・中性・アルカリ性") + "に分けられます。調べるには" + r("指示薬", "しじやく") + "を使います。" + rule("BTB溶液は、酸性で黄色、中性で緑色、アルカリ性で青色") + "になります。フェノールフタレイン溶液は、アルカリ性で赤色になります。" +
        "酸性の水溶液は青色リトマス紙を赤色に、アルカリ性の水溶液は赤色リトマス紙を青色に変えます。",
      "酸性・アルカリ性の強さは <b>pH</b>(ピーエイチ)で表します。" + rule("pH 7 が中性") + "で、" + rule("7 より小さいほど酸性が強く、7 より大きいほどアルカリ性が強い") + "です。pH試験紙やpHメーターで調べます。",
      "水溶液にしたとき電離して" + rule("水素イオン(" + ion("H", "+") + ")を生じる") + "化合物を<b>酸</b>、" + rule("水酸化物イオン(" + ion("OH", "-") + ")を生じる") + "化合物を<b>アルカリ</b>といいます。" +
        "酸性の性質は水素イオンによるもので、酸性の水溶液にマグネシウムリボンを入れると水素が発生します。アルカリ性の性質は水酸化物イオンによるものです。",
      "電解質の水溶液でしめらせたpH試験紙の中央に塩酸をつけて電圧を加えると、" + rule("酸性を示す色の部分が陰極側へ") + "移動します。+の電気をもつ水素イオンが陰極に引かれるからです。水酸化ナトリウム水溶液では、" + rule("アルカリ性を示す色の部分が陽極側へ") + "移動します。−の電気をもつ水酸化物イオンが陽極に引かれるからです。",
      "酸の水溶液とアルカリの水溶液を混ぜると、" + rule("水素イオンと水酸化物イオンが結びついて水ができ") + "(" + eqOf("neutral") + ")、たがいの性質を打ち消し合います。これを<b>中和</b>といいます。中和は熱が発生する反応(発熱反応)です。混ぜると中和は起こりますが、中性になるのは、水素イオンと水酸化物イオンが過不足なく反応したときだけです。",
      "中和では、酸の陰イオンとアルカリの陽イオンが結びついた物質もできます。これを<b>" + r("塩", "えん") + "</b>といいます。塩酸と水酸化ナトリウム水溶液からは" + rule("塩化ナトリウム") + "(水にとける)、硫酸と水酸化バリウム水溶液からは" + rule("硫酸バリウム") + "(水にとけにくく、白い沈殿になる)ができます。" +
        "塩にはほかに、硝酸と水酸化カリウムからできる硝酸カリウムなどがあります。"
    ],
    figures: [
      { html: figElectrophoresis({ kind: "acid" }), caption: "電気泳動の実験(塩酸の場合)。斜線の部分が、酸性を示す色に変わった部分です。水素イオン(+)が陰極へ移動するので、色の変わった部分は陰極側へ広がります。水酸化ナトリウム水溶液では、水酸化物イオン(−)が陽極へ移動するので、陽極側へ広がります。" },
      { html: figNeutralModel(), caption: "塩酸に水酸化ナトリウム水溶液を加えていくときのモデル。水素イオンと水酸化物イオンが結びついて水になり、ナトリウムイオンと塩化物イオンは水溶液の中に残ります。水素イオンがなくなったときが中性です。図では、中和でできた水分子だけをかき、はじめからある水は省いています。" },
      { html: figIonGraphs([{ shape: "dec", title: svgIon("H^+") }, { shape: "const", title: svgIon("Cl^-") }, { shape: "inc", title: svgIon("Na^+") }, { shape: "late", title: svgIon("OH^-") }], false,
        "塩酸に水酸化ナトリウム水溶液を加えていったときの、4種類のイオンの数の変化を表す4つのグラフ。水素イオンは減って中性で0になる。塩化物イオンは変わらない。ナトリウムイオンは0からふえ続ける。水酸化物イオンは中性まで0で、そのあとふえる"),
        caption: "塩酸に水酸化ナトリウム水溶液を加えていったときの、イオンの数の変化。横軸は加えた水酸化ナトリウム水溶液の体積、縦軸はイオンの数で、破線のところでちょうど中性になります。" }
    ],
    blocks: [
      INDICATOR_TABLE,
      '<div class="formula">酸性 ← pH 7(中性) → アルカリ性</div>',
      ACID_TABLE,
      eqBox(eqOf("neutral")),
      SALT_TABLE
    ],
    example: {
      title: "うすい塩酸 " + cm3(10) + " に、うすい水酸化ナトリウム水溶液を " + cm3(15) + " 加えると、ちょうど中性になりました。同じ塩酸 " + cm3(18) + " をちょうど中性にするには、同じ水酸化ナトリウム水溶液が何cm³必要ですか。",
      steps: [
        "塩酸と水酸化ナトリウム水溶液は、体積の比 10:15 = 2:3 でちょうど中和します。",
        "塩酸の体積と、必要な水酸化ナトリウム水溶液の体積は比例します。",
        JHS.calc("18 cm³ × 15 ÷ 10", "27 cm³")
      ],
      result: cm3(27)
    },
    fixed: [
      {
        id: "btb-colors",
        text: "BTB溶液を加えたときの色の組み合わせとして、正しいものはどれですか。",
        choices: [
          "酸性で黄色、中性で緑色、アルカリ性で青色",
          "酸性で青色、中性で緑色、アルカリ性で黄色",
          "酸性で赤色、中性で無色、アルカリ性で青色",
          "酸性で無色、中性で無色、アルカリ性で赤色"
        ],
        answer: 0,
        explain: [
          "BTB溶液は、酸性で黄色、中性で緑色、アルカリ性で青色になります。",
          "酸性・中性で無色、アルカリ性で赤色になるのは、フェノールフタレイン溶液です。"
        ]
      },
      {
        id: "ph",
        text: "pH の説明として、正しいものはどれですか。",
        choices: [
          "pH 7 が中性で、7 より小さいほど酸性が強い",
          "pH 7 が中性で、7 より大きいほど酸性が強い",
          "pH 0 が中性で、数値が大きいほどアルカリ性が強い",
          "pH 14 が中性で、数値が小さいほど酸性が強い"
        ],
        answer: 0,
        explain: [
          "pH は、酸性・アルカリ性の強さを表す数値で、7 が中性です。",
          "7 より小さいほど酸性が強く、7 より大きいほどアルカリ性が強くなります。"
        ]
      },
      {
        id: "mg-acid",
        text: "うすい塩酸にマグネシウムリボンを入れると、気体が発生しました。この気体は何ですか。",
        choices: ["水素", "酸素", "二酸化炭素", "塩素"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "酸性の水溶液にマグネシウムを入れると、水素が発生します。",
          "発生した気体にマッチの火を近づけると、音を立てて燃えます。"
        ]
      },
      {
        id: "acid-def",
        text: "<b>酸</b>の説明として、正しいものはどれですか。",
        choices: [
          "水溶液にしたとき電離して、水素イオンを生じる化合物",
          "水溶液にしたとき電離して、水酸化物イオンを生じる化合物",
          "水溶液にしたとき電離して、塩化物イオンを生じる化合物",
          "水にとけても電離しない化合物"
        ],
        answer: 0,
        explain: [
          "酸は、水溶液にしたとき電離して水素イオン(" + ion("H", "+") + ")を生じる化合物です。酸性の性質は、水素イオンによるものです。",
          "電離して水酸化物イオン(" + ion("OH", "-") + ")を生じるのは、アルカリです。"
        ]
      },
      {
        id: "alkali-ion",
        text: "水酸化ナトリウム水溶液、水酸化バリウム水溶液、アンモニア水に共通してふくまれ、アルカリ性の性質を示すもとになるイオンはどれですか。",
        choices: [ion("OH", "-"), ion("H", "+"), ion("Na", "+"), ion("Cl", "-")],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "アルカリ性の性質は、水酸化物イオン(" + ion("OH", "-") + ")によるものです。たとえば、水酸化ナトリウムは " + eqOf("naoh") + " のように電離します。",
          ion("H", "+") + " は酸性のもとになるイオンです。" + ion("Na", "+") + " は水酸化バリウム水溶液やアンモニア水にはふくまれません。"
        ]
      },
      {
        id: "phoresis-acid",
        text: "図のように、電解質の水溶液でしめらせたpH試験紙の中央に、うすい塩酸をしみこませた糸を置き、電圧を加えました。pH試験紙の、酸性を示す色に変わった部分はどうなりますか。理由もふくめて、正しいものを選びなさい。",
        figure: figElectrophoresis({ kind: "acid", plain: true }),
        choices: [
          "陰極側へ広がる。酸性を示すもとのイオンは、+の電気をもつから",
          "陽極側へ広がる。酸性を示すもとのイオンは、+の電気をもつから",
          "陰極側へ広がる。酸性を示すもとのイオンは、−の電気をもつから",
          "陽極側へ広がる。酸性を示すもとのイオンは、−の電気をもつから"
        ],
        answer: 0,
        explain: [
          "酸性を示すもとになるのは、水素イオン(" + ion("H", "+") + ")です。水素イオンは+の電気をもつので、−極につないだ陰極へ引かれて移動します。",
          "そのため、酸性を示す色の部分は陰極側へ広がります。塩化物イオン(" + ion("Cl", "-") + ")は陽極へ移動しますが、pH試験紙の色は変えません。"
        ]
      },
      {
        id: "phoresis-alkali",
        text: "図のように、電解質の水溶液でしめらせたpH試験紙の中央に、うすい水酸化ナトリウム水溶液をしみこませた糸を置き、電圧を加えました。アルカリ性を示す色に変わった部分が広がる向きと、そのもとになるイオンの組み合わせとして、正しいものはどれですか。",
        figure: figElectrophoresis({ kind: "alkali", plain: true }),
        choices: [
          "陽極側、" + ion("OH", "-"),
          "陰極側、" + ion("OH", "-"),
          "陰極側、" + ion("Na", "+"),
          "陽極側、" + ion("Na", "+")
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "アルカリ性を示すもとになるのは、水酸化物イオン(" + ion("OH", "-") + ")です。−の電気をもつので、+極につないだ陽極へ引かれて移動します。",
          "ナトリウムイオン(" + ion("Na", "+") + ")は陰極へ移動しますが、pH試験紙の色は変えません。"
        ]
      },
      {
        id: "neutral-ionic",
        text: "中和で起こる、水素イオンと水酸化物イオンの反応を表す式として、正しいものはどれですか。",
        choices: [
          eqOf("neutral"),
          badEq(["2H^+", "OH^-"], ["H2O"]),
          badEq(["H^+", "OH^-"], ["H2O2"]),
          badEq(["H^+", "OH^-"], ["H2O^+"])
        ],
        answer: 0,
        explain: [
          "水素イオン1個と水酸化物イオン1個が結びついて、水分子が1個できます。左右とも、水素原子は2個、酸素原子は1個で、電気の合計は 0 です。",
          "ほかの式は、原子の数か、電気の合計が左右で合っていません。"
        ]
      },
      {
        id: "neutral-model",
        text: "図は、うすい塩酸にうすい水酸化ナトリウム水溶液を加えていくときの、ビーカーの中のようすをモデルで表したものです。ちょうど<b>中性</b>になっているのはどれですか。",
        figure: figNeutralModel([1, 2, 0], true),
        choices: ["イ", "ア", "ウ", "どれも中性ではない"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "イには、水素イオン(" + ion("H", "+") + ")も水酸化物イオン(" + ion("OH", "-") + ")もなく、ナトリウムイオン、塩化物イオン、水分子だけがあるので、中性です。",
          "アとウには、水素イオンが残っているので酸性です。ウは加える前の塩酸です。"
        ]
      },
      {
        id: "salt-def",
        text: "中和でできる「塩(えん)」の説明として、正しいものはどれですか。",
        choices: [
          "酸の陰イオンと、アルカリの陽イオンが結びついてできた物質",
          "酸の水素イオンと、アルカリの水酸化物イオンが結びついてできた物質",
          "酸の陰イオンと、アルカリの水酸化物イオンが結びついてできた物質",
          "塩化ナトリウムのことだけをいい、ほかの物質は塩とはいわない"
        ],
        answer: 0,
        explain: [
          "塩は、酸の陰イオンとアルカリの陽イオンが結びついてできた物質です。塩化ナトリウムは、塩化物イオンとナトリウムイオンからできた塩です。",
          "水素イオンと水酸化物イオンが結びついてできるのは、水です。硫酸バリウムなど、塩化ナトリウム以外の塩もあります。"
        ]
      },
      {
        id: "baso4",
        text: "うすい硫酸に、うすい水酸化バリウム水溶液を加えると、白い沈殿ができました。この沈殿は何ですか。",
        choices: ["硫酸バリウム", "水酸化バリウム", "塩化ナトリウム", "硫酸ナトリウム"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "硫酸と水酸化バリウムが中和して、水と、塩の硫酸バリウムができます(" + eqOf("h2so4Baoh2") + ")。",
          "硫酸バリウムは水にとけにくいので、白い沈殿になります。この反応にはナトリウムがふくまれないので、塩化ナトリウムや硫酸ナトリウムはできません。"
        ]
      },
      {
        id: "heat",
        text: "うすい塩酸に、うすい水酸化ナトリウム水溶液を少しずつ加えて中和させると、液の温度はどうなりますか。",
        choices: [
          "中和で熱が発生するので、温度が上がる",
          "中和で熱を吸収するので、温度が下がる",
          "中和では熱の出入りがないので、温度は変わらない",
          "水ができるので、温度が下がる"
        ],
        answer: 0,
        explain: [
          "中和は、熱が発生する反応(発熱反応)です。",
          "そのため、中和が起こると、液の温度が上がります。"
        ]
      },
      {
        id: "evaporate",
        text: "うすい塩酸にうすい水酸化ナトリウム水溶液を加え、BTB溶液が緑色になった液を少しとって、スライドガラスの上で水を蒸発させました。あとに残った結晶は何ですか。",
        choices: ["塩化ナトリウム", "水酸化ナトリウム", "塩化水素", "何も残らない"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "BTB溶液が緑色なので、液はちょうど中性で、塩酸と水酸化ナトリウムが過不足なく中和しています(" + eqOf("hclNaoh") + ")。",
          "液の中には、塩の塩化ナトリウムがイオン(" + ion("Na", "+") + "と" + ion("Cl", "-") + ")になってとけているので、水を蒸発させると塩化ナトリウムの結晶が残ります。"
        ]
      },
      {
        id: "neutral-ions",
        text: "うすい塩酸にうすい水酸化ナトリウム水溶液を加えていき、ちょうど中性になりました。このとき、水溶液の中にあるイオンの組み合わせとして、正しいものはどれですか。",
        choices: [
          ion("Na", "+") + " と " + ion("Cl", "-"),
          ion("H", "+") + " と " + ion("OH", "-"),
          ion("H", "+") + " と " + ion("Cl", "-"),
          ion("Na", "+") + " と " + ion("OH", "-")
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "水素イオンと水酸化物イオンは、結びついて水になったので、ちょうど中性のときは、どちらも残っていません。",
          "中和に関係しないナトリウムイオンと塩化物イオンは、水溶液の中にそのまま残っています。"
        ]
      }
    ],
    generators: [
      {
        id: "neutral-volume",
        label: "ちょうど中性になる体積の比を使う計算",
        make: function () {
          var R = pickRatio();
          if (!R) return null;
          var p = R.p, qq = R.q, a = R.a, b = R.b, kind = JHS.randInt(0, 3), c, t;
          var lead = "うすい塩酸 " + cm3(a) + " に、うすい水酸化ナトリウム水溶液を " + cm3(b) + " 加えると、ちょうど中性になりました。";
          var ratioLine = "塩酸と水酸化ナトリウム水溶液は、体積の比 " + a + ":" + b + (a / p !== 1 ? " = " + p + ":" + qq : "") + " でちょうど中和します。";
          var ts = [];
          for (t = 1; t <= 30; t++) if (p * t >= 4 && p * t <= 60 && qq * t <= 60 && p * t !== a) ts.push(t);
          t = JHS.pick(ts);
          var A = p * t, B = qq * t;
          if (kind === 0) {
            var inv = (A * a) % b === 0 ? A * a / b : null;
            c = JHS.choices4(cm3(B), [inv !== null ? cm3(inv) : null, A + b - a > 0 ? cm3(A + b - a) : null, cm3(b), cm3(A), cm3(B * 2)]);
            if (!c) return null;
            return {
              text: lead + "同じ塩酸 " + cm3(A) + " をちょうど中性にするには、同じ水酸化ナトリウム水溶液が何cm³必要ですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [ratioLine, "必要な水酸化ナトリウム水溶液の体積は、塩酸の体積に比例します。", JHS.calc(A + " cm³ × " + b + " ÷ " + a, B + " cm³")],
              meta: { kind: "acid-to-base", acid: a, base: b, target: A, answer: B }
            };
          }
          if (kind === 1) {
            var inv2 = (B * b) % a === 0 ? B * b / a : null;
            c = JHS.choices4(cm3(A), [inv2 !== null ? cm3(inv2) : null, B - (b - a) > 0 ? cm3(B - (b - a)) : null, cm3(a), cm3(B), cm3(A * 2)]);
            if (!c) return null;
            return {
              text: lead + "同じ水酸化ナトリウム水溶液 " + cm3(B) + " をちょうど中性にするには、同じ塩酸が何cm³必要ですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [ratioLine, "必要な塩酸の体積は、水酸化ナトリウム水溶液の体積に比例します。", JHS.calc(B + " cm³ × " + a + " ÷ " + b, A + " cm³")],
              meta: { kind: "base-to-acid", acid: a, base: b, target: B, answer: A }
            };
          }
          // 塩酸 A cm³ に、水酸化ナトリウム水溶液 Y cm³ を加えた
          var Y;
          if (kind === 2) {
            var state = JHS.pick(["acid", "neutral", "alkali"]);
            var d = JHS.randInt(1, Math.max(1, Math.min(10, B - 1)));
            Y = state === "acid" ? B - d : state === "neutral" ? B : B + d;
            if (Y <= 0) return null;
            var color = { acid: "黄色", neutral: "緑色", alkali: "青色" }[state];
            c = JHS.choices4(color, ["黄色", "緑色", "青色", "赤色"]);
            if (!c) return null;
            var cmp = state === "acid" ? "より少ないので、塩酸の水素イオンが残り、酸性になります" : state === "neutral" ? "と同じなので、ちょうど中性になります" : "より多いので、水酸化物イオンが残り、アルカリ性になります";
            return {
              text: lead + "次に、同じ塩酸 " + cm3(A) + " に同じ水酸化ナトリウム水溶液を " + cm3(Y) + " 加え、BTB溶液を入れました。液は何色になりますか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                ratioLine + "塩酸 " + cm3(A) + " をちょうど中性にする水酸化ナトリウム水溶液は、次のとおりです。",
                JHS.calc(A + " cm³ × " + b + " ÷ " + a, B + " cm³"),
                "加えた " + cm3(Y) + " は " + cm3(B) + " " + cmp + "。BTB溶液は、酸性で黄色、中性で緑色、アルカリ性で青色です。"
              ],
              meta: { kind: "btb", acid: a, base: b, target: A, added: Y, need: B, state: state }
            };
          }
          if (B < 4) return null;
          Y = JHS.randInt(1, B - 1);
          var more = B - Y;
          c = JHS.choices4(cm3(more), [cm3(B), cm3(B + Y), A - Y > 0 ? cm3(A - Y) : null, cm3(Y), cm3(more * 2)]);
          if (!c) return null;
          return {
            text: lead + "次に、同じ塩酸 " + cm3(A) + " に同じ水酸化ナトリウム水溶液を " + cm3(Y) + " 加えました。この液をちょうど中性にするには、同じ水酸化ナトリウム水溶液をあと何cm³加えればよいですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              ratioLine + "塩酸 " + cm3(A) + " をちょうど中性にする水酸化ナトリウム水溶液は、次のとおりです。",
              JHS.calc(A + " cm³ × " + b + " ÷ " + a, B + " cm³"),
              "すでに " + cm3(Y) + " 加えているので、残りを求めます。",
              JHS.calc(B + " cm³ − " + Y + " cm³", more + " cm³")
            ],
            meta: { kind: "more", acid: a, base: b, target: A, added: Y, need: B, answer: more }
          };
        }
      },
      {
        id: "ion-graph",
        label: "中和とイオンの数のグラフ",
        make: function () {
          var dir = JHS.pick(["a", "b"]), G = ION_GRAPH[dir], ids = ["H", "Cl", "Na", "OH"];
          var target = JHS.pick(ids), shape = G.shapes[target], c;
          var adding = dir === "a" ? "水酸化ナトリウム水溶液" : "塩酸";
          if (Math.random() < 0.5) {
            c = JHS.choices4(ION_NAMES[target], JHS.shuffle(ids.filter(function (k) { return k !== target; })).map(function (k) { return ION_NAMES[k]; }));
            if (!c) return null;
            return {
              text: G.lead + "図は、加えた" + adding + "の体積と、水溶液の中のあるイオンの数の関係を表したグラフです。破線のところで、ちょうど中性になりました。このグラフは、どのイオンの数の変化を表していますか。",
              figure: figIonGraph(shape, "イオンの数は、" + SHAPE_WORDS[shape]),
              choices: c.choices, answer: c.answer,
              explain: [G.why[target], "グラフは「" + SHAPE_WORDS[shape] + "」形なので、" + ION_NAMES[target] + "です。"],
              meta: { kind: "graph-to-ion", direction: dir, shape: shape, ion: target }
            };
          }
          var order = JHS.shuffle(["dec", "const", "inc", "late"]), kk = ["ア", "イ", "ウ", "エ"];
          var right = kk[order.indexOf(shape)];
          c = JHS.choices4(right, kk.filter(function (k) { return k !== right; }));
          if (!c) return null;
          return {
            text: G.lead + "加えた" + adding + "の体積と、水溶液の中の" + ION_NAMES[target] + "の数の関係を表すグラフはどれですか。図の破線のところで、ちょうど中性になります。",
            figure: figIonGraphs(order.map(function (sh) { return { shape: sh }; }), true,
              "加えた体積とイオンの数の関係を表す4つのグラフ。ア〜エの記号がついている。破線のところで中性になる"),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [G.why[target], "「" + SHAPE_WORDS[shape] + "」形のグラフは " + right + " です。"],
            meta: { kind: "ion-to-graph", direction: dir, ion: target, shape: shape, order: order.join(","), answer: right }
          };
        }
      },
      {
        id: "indicator",
        label: "指示薬の色と、水溶液の性質",
        make: function () {
          var nat = JHS.pick(["acid", "neutral", "alkali"]), sol = JHS.pick(SOLUTIONS[nat]), c;
          if (Math.random() < 0.6) {
            var ind = JHS.pick(INDICATORS), right = ind.res[nat];
            var wrong = ["acid", "neutral", "alkali"].map(function (k) { return ind.res[k]; }).concat(ind.extra);
            c = JHS.choices4(right, wrong);
            if (!c) return null;
            return {
              text: sol + ind.verb + "、どうなりますか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                sol + "は" + NATURE[nat] + "の水溶液です。",
                ind.name + "は、酸性で「" + ind.res.acid + "」、中性で「" + ind.res.neutral + "」、アルカリ性で「" + ind.res.alkali + "」です。"
              ],
              meta: { kind: "color", solution: sol, nature: nat, indicator: ind.name }
            };
          }
          // BTB溶液の色から、水溶液を選ぶ
          var color = { acid: "黄色", neutral: "緑色", alkali: "青色" }[nat];
          var others = ["acid", "neutral", "alkali"].filter(function (k) { return k !== nat; });
          var wrongs = JHS.shuffle(others.reduce(function (acc, k) { return acc.concat(SOLUTIONS[k]); }, []));
          c = JHS.choices4(sol, wrongs);
          if (!c) return null;
          return {
            text: "ある水溶液にBTB溶液を加えると、" + color + "になりました。この水溶液として考えられるものはどれですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "BTB溶液が" + color + "になるのは、" + NATURE[nat] + "の水溶液です。" + sol + "は" + NATURE[nat] + "です。",
              c.choices.slice(1).map(function (w) {
                var k = others.filter(function (o) { return SOLUTIONS[o].indexOf(w) >= 0; })[0];
                return w + "は" + NATURE[k];
              }).join("、") + "です。"
            ],
            meta: { kind: "color-to-solution", nature: nat, answer: sol }
          };
        }
      }
    ]
  });
})();

// =====================================================================
// 物理(g3-pressure-buoyancy、g3-force-composition、g3-motion、g3-work-power、g3-energy)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var rule = JHS.rule, q = JHS.q, num = JHS.num;
  function N(n) { return q(n, "N"); }
  function J(n) { return q(n, "J"); }
  function W(n) { return q(n, "W"); }
  function g(n) { return q(n, "g"); }
  function m(n) { return q(n, "m"); }
  function cm(n) { return q(n, "cm"); }
  function sec(n) { return q(n, "秒"); }
  function mps(n) { return q(n, "m/s"); }
  function cmps(n) { return q(n, "cm/s"); }
  function kmh(n) { return q(n, "km/h"); }
  function pct(n) { return q(n, "%"); }
  var KANA = ["ア", "イ", "ウ", "エ"];
  var ABC = ["A", "B", "C", "D", "E"];

  // 数値の組が合わなかったとき(make が null を返したとき)に、何回か作り直す
  function retry(make) {
    return function () {
      for (var i = 0; i < 30; i++) { var qn = make(); if (qn) return qn; }
      return null;
    };
  }
  // 10倍の整数で持った値を、小数の数値にもどす
  function d10(v) { return Math.round(v) / 10; }
  // 10倍の整数で持った力を、小数第1位までそろえて書く(2.0N、1.6N)
  function n1(v) { return num(v / 10, 1); }
  function N1(v) { return q(n1(v), "N"); }
  // 小数第2位までで書ける正の数か(誤答に、割り切れない数を出さないため)
  function nice(v) { return isFinite(v) && v > 0 && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6; }
  function onlyNice(list) { return list.filter(nice); }

  // ---------- 図の道具 ----------
  var RAD = Math.PI / 180;
  function P(v) { return String(Math.round(v * 10) / 10); }
  function seg(cls, x1, y1, x2, y2) {
    return '<line class="' + cls + '" x1="' + P(x1) + '" y1="' + P(y1) + '" x2="' + P(x2) + '" y2="' + P(y2) + '"/>';
  }
  function path(cls, d) { return '<path class="' + cls + '" d="' + d + '"/>'; }
  function circle(cls, x, y, r) { return '<circle class="' + cls + '" cx="' + P(x) + '" cy="' + P(y) + '" r="' + r + '"/>'; }
  function rect(cls, x, y, w, h, rx) {
    return '<rect class="' + cls + '" x="' + P(x) + '" y="' + P(y) + '" width="' + P(w) + '" height="' + P(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + "/>";
  }
  function poly(cls, pts, open) {
    return path(cls, pts.map(function (p, i) { return (i ? "L" : "M") + P(p[0]) + " " + P(p[1]); }).join("") + (open ? "" : "Z"));
  }
  function txt(x, y, s, o) { return JHS.txt(x, y, s, o); }
  // 力の矢印。矢じりの先が、ちょうど (x2, y2) にくるようにする(矢じりは線の端から 1.5 だけ先に出る)。
  // dot: true で、作用点に●をつける
  function forceArrow(x1, y1, x2, y2, dot, cls) {
    var len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) || 1;
    return JHS.arrow(x1, y1, x2 - (x2 - x1) / len * 1.5, y2 - (y2 - y1) / len * 1.5, cls || "fig-force") +
      (dot ? circle("fig-point", x1, y1, 3.5) : "");
  }
  // 方眼(left, top から cols × rows 目盛り。1目盛り G)
  function grid(left, top, cols, rows, G) {
    var s = "", i;
    for (i = 0; i <= cols; i++) s += seg("fig-grid", left + i * G, top, left + i * G, top + rows * G);
    for (i = 0; i <= rows; i++) s += seg("fig-grid", left, top + i * G, left + cols * G, top + i * G);
    return s;
  }

  // =====================================================================
  // 3-9 水圧と浮力
  // =====================================================================
  // 水中に沈めた立方体にはたらく水圧。矢印の長さは、その場所の深さに比例させる
  function figPressureBox() {
    var s = "", surf = 26, x0 = 126, x1 = 194, y0 = 66, y1 = 134, k = 0.35;
    s += rect("fig-fill", 40, surf, 240, 160);
    s += path("fig-shape", "M40 14V186H280V14");
    s += seg("fig-thin", 40, surf, 280, surf) + txt(276, surf - 5, "水面", { cls: "fig-small", anchor: "end" });
    s += rect("fig-shape fig-fill-2", x0, y0, x1 - x0, y1 - y0);
    [140, 160, 180].forEach(function (x) {
      s += forceArrow(x, y0 - (y0 - surf) * k, x, y0);
      s += forceArrow(x, y1 + (y1 - surf) * k, x, y1);
    });
    [78, 100, 122].forEach(function (y) {
      var L = (y - surf) * k;
      s += forceArrow(x0 - L, y, x0, y) + forceArrow(x1 + L, y, x1, y);
    });
    s += txt(204, 58, "小さい", { cls: "fig-small" });
    s += txt(204, 178, "大きい", { cls: "fig-small" });
    return JHS.svg(320, 200, "水中の立方体にはたらく水圧。どの面にも垂直にはたらき、深いところほど矢印が長い", s);
  }

  // 両はしにゴム膜をはった筒を、水中に沈めた結果。左は縦向き、右は横向き。へこみは、その深さに比例させる
  function figMembrane() {
    var s = "", surf = 34, k = 0.11;
    s += rect("fig-fill", 24, surf, 272, 150);
    s += path("fig-shape", "M24 22V184H296V22");
    s += seg("fig-thin", 24, surf, 296, surf) + txt(292, surf - 5, "水面", { cls: "fig-small", anchor: "end" });
    // 縦向きの筒(x 72〜108、y 62〜162)
    var xl = 72, xr = 108, yt = 54, yb = 148, it = (yt - surf) * k, ib = (yb - surf) * k;
    s += rect("fig-fill-0", xl, yt, xr - xl, yb - yt);
    s += seg("fig-shape", xl, yt, xl, yb) + seg("fig-shape", xr, yt, xr, yb);
    s += path("fig-line", "M" + xl + " " + yt + "Q90 " + P(yt + it * 2) + " " + xr + " " + yt);
    s += path("fig-line", "M" + xl + " " + yb + "Q90 " + P(yb - ib * 2) + " " + xr + " " + yb);
    s += txt(90, 176, "縦向き", { cls: "fig-small", anchor: "middle" });
    // 横向きの筒(x 168〜256、y 112〜140)
    var x0 = 168, x1 = 256, y0 = 108, y1 = 144, ih = ((y0 + y1) / 2 - surf) * k;
    s += rect("fig-fill-0", x0, y0, x1 - x0, y1 - y0);
    s += seg("fig-shape", x0, y0, x1, y0) + seg("fig-shape", x0, y1, x1, y1);
    s += path("fig-line", "M" + x0 + " " + y0 + "Q" + P(x0 + ih * 2) + " " + (y0 + y1) / 2 + " " + x0 + " " + y1);
    s += path("fig-line", "M" + x1 + " " + y0 + "Q" + P(x1 - ih * 2) + " " + (y0 + y1) / 2 + " " + x1 + " " + y1);
    s += txt(212, 166, "横向き", { cls: "fig-small", anchor: "middle" });
    return JHS.svg(320, 200, "両はしにゴム膜をはった筒を、縦向きと横向きにして水中に沈めたときの、ゴム膜のへこみ方", s);
  }

  // 水そうの中の4つの点。o.pts: [[x, 深さ], …](記号 A〜D の順)
  function figDepthPoints(pts) {
    var s = "", surf = 30;
    s += rect("fig-fill", 40, surf, 240, 150);
    s += path("fig-shape", "M40 16V180H280V16");
    s += seg("fig-thin", 40, surf, 280, surf) + txt(276, surf - 5, "水面", { cls: "fig-small", anchor: "end" });
    pts.forEach(function (p, i) {
      s += circle("fig-solid", p[0], surf + p[1], 3.5) + JHS.key(p[0] + 17, surf + p[1], ABC[i]);
    });
    return JHS.svg(320, 200, "水を入れた水そうの中の4つの点 A〜D", s);
  }

  // 浮力の実験。ばねばかりに物体をつるし、空気中や水中で値を読む。
  //   panels: [{ mode: "air"(空気中) "full"(全体を水中) "half"(半分を水中) "deep"(深く沈める), read: "2.4N", name: "空気中" }](1〜4コマ)
  function figScale(panels, label) {
    // 幅は 312 で割る(右端のコマの値の文字が、図の右端から 4 以上内側に入るように)
    var n = panels.length, w = 312 / n, s = "";
    panels.forEach(function (p, i) {
      var cx = w * i + w / 2, oy = p.mode === "deep" ? 166 : 120, oh = 30, ow = 28;
      if (p.mode !== "air") {
        var surf = p.mode === "half" ? oy + oh / 2 : 106;
        s += rect("fig-fill", cx - 32, surf, 64, 210 - surf);
        s += seg("fig-thin", cx - 32, surf, cx + 32, surf);
        s += path("fig-shape", "M" + P(cx - 32) + " 94V210H" + P(cx + 32) + "V94");
      }
      s += seg("fig-shape", cx - 16, 20, cx + 16, 20) + seg("fig-shape", cx, 20, cx, 28);
      s += rect("fig-shape fig-fill-0", cx - 8, 28, 16, 50, 3);
      for (var k = 0; k < 5; k++) s += seg("fig-thin", cx - 4, 36 + k * 9, cx + 4, 36 + k * 9);
      s += seg("fig-shape", cx, 78, cx, oy);
      s += rect("fig-shape fig-fill-2", cx - ow / 2, oy, ow, oh);
      s += txt(cx + 12, 58, p.read, { halo: true });
      if (p.name) s += txt(cx, 230, p.name, { cls: "fig-small", anchor: "middle" });
    });
    return JHS.svg(320, 240, label || "ばねばかりに物体をつるし、空気中と水中で値を読む実験の図", s);
  }

  var BUOY_TABLE = JHS.table({
    caption: "水中の物体の、浮く・沈む",
    head: ["重力と浮力", "物体の動き"],
    rows: [
      ["<span style=\"white-space:nowrap\">重力 > 浮力</span>", "沈んでいく"],
      ["<span style=\"white-space:nowrap\">重力 < 浮力</span>", "浮き上がり、水面に浮く"],
      ["<span style=\"white-space:nowrap\">重力 = 浮力</span>", "水中で静止する(水面に浮いて静止している物体でも、重力と浮力はつり合っている)"]
    ]
  });

  JHS.register("g3-pressure-buoyancy", {
    points: [
      "水の重さによって生じる圧力を<b>水圧</b>といいます。水圧は、" + rule("水面から深いところほど大きく") + "なります。",
      "水圧は、水中の物体に" + rule("あらゆる向きから") + "はたらき、物体の面に" + rule("垂直に") + "はたらきます。同じ深さでは、向きによらず水圧の大きさは同じです。",
      "水中の物体には、" + rule("上向きの力") + "がはたらきます。この力を<b>浮力</b>といいます。物体の下の面にはたらく水圧のほうが、上の面にはたらく水圧より大きいために生じます。",
      "浮力の大きさは、" + rule("空気中でのばねばかりの値 − 水中でのばねばかりの値") + " で求められます。",
      "浮力は、" + rule("物体の水中にある部分の体積が大きいほど大きく") + "なります。物体全体が水中に入ったあとは、" + rule("深さを変えても浮力は変わりません") + "。体積が同じなら、物体の質量がちがっても浮力は同じです。",
      "水中で手をはなすと、" + rule("重力が浮力より大きい物体は沈み") + "、重力より浮力が大きい物体は浮き上がります。水面に浮いて静止している物体では、重力と浮力がつり合っています。"
    ],
    figures: [
      { html: figPressureBox(), caption: "水中の立方体にはたらく水圧。水圧は面に垂直にはたらき、深いところほど大きくなります。横からの水圧は左右で打ち消し合い、上の面より下の面の水圧が大きいので、上向きの力(浮力)が残ります。" },
      {
        html: figScale([
          { mode: "air", read: "2.4N", name: "空気中" },
          { mode: "half", read: "2.0N", name: "半分を水中" },
          { mode: "full", read: "1.6N", name: "全体を水中" },
          { mode: "deep", read: "1.6N", name: "深く沈める" }
        ], "ばねばかりにつるした物体を、水中に入れていったときの値。2.4N、2.0N、1.6N、1.6N"),
        caption: "物体全体を水中に入れると、ばねばかりの値は 2.4N から 1.6N に減ります。浮力は 2.4N − 1.6N = 0.8N です。半分だけ入れたときの浮力は 0.4N で、全体を入れたあとは、深く沈めても値は変わりません。"
      }
    ],
    blocks: [
      JHS.formula("浮力[N]", "空気中での値[N] − 水中での値[N]"),
      BUOY_TABLE
    ],
    example: {
      title: "ある物体をばねばかりにつるすと、空気中では " + N(2.4) + "、物体全体を水中に入れると " + N(1.6) + " を示しました。物体にはたらく浮力は何Nですか。また、物体の体積の半分だけを水中に入れると、ばねばかりは何Nを示しますか。",
      steps: [
        "浮力は、空気中での値から水中での値をひいて求めます。",
        JHS.calc("2.4 N − 1.6 N", "0.8 N"),
        "浮力は、水中にある部分の体積に比例します。体積の半分なら、浮力も半分の " + N(0.4) + " です。",
        JHS.calc("2.4 N − 0.4 N", "2.0 N")
      ],
      result: "浮力は " + N(0.8) + "、半分のときは " + N1(20)
    },
    fixed: [
      {
        id: "pressure-cause",
        text: "水圧は、何によって生じる圧力ですか。",
        choices: ["水にはたらく重力(水の重さ)", "水の温度", "水面にはたらく浮力", "水中の物体の体積"],
        answer: 0,
        explain: [
          "水圧は、その場所より上にある水の重さによって生じる圧力です。",
          "そのため、上にある水が多いほど(深いところほど)、水圧は大きくなります。"
        ]
      },
      {
        id: "pressure-depth-points",
        text: "図の水そうの中の点 A〜D のうち、水圧がもっとも大きい点はどれですか。",
        figure: figDepthPoints([[80, 28], [140, 70], [196, 128], [250, 70]]),
        choices: ["C", "A", "B", "D"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "水圧は、水面からの深さが深いほど大きくなります。",
          "4つの点のうち、水面からもっとも深いのは C です。B と D は同じ深さなので、水圧も同じです。"
        ]
      },
      {
        id: "pressure-same-depth",
        text: "図の水そうの中の点 A〜D のうち、水圧の大きさが等しい2点はどれですか。",
        figure: figDepthPoints([[80, 28], [140, 70], [196, 128], [250, 70]]),
        choices: ["B と D", "A と B", "A と C", "C と D"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "水圧の大きさは、水面からの深さで決まります。横の位置がちがっても、深さが同じなら水圧は同じです。",
          "B と D は、水面から同じ深さにあります。"
        ]
      },
      {
        id: "membrane-vertical",
        text: "図は、両はしにゴム膜をはった筒を、縦向きと横向きにして水中に沈めたときのようすです。縦向きの筒の結果から、どのようなことがわかりますか。",
        figure: figMembrane(),
        choices: [
          "水圧は、深いところほど大きい",
          "水圧は、浅いところほど大きい",
          "水圧は、上向きにだけはたらく",
          "水圧は、深さによらず同じ大きさである"
        ],
        answer: 0,
        explain: [
          "縦向きの筒では、下のゴム膜のほうが大きくへこんでいます。下のゴム膜のほうが深いところにあるので、水圧は深いところほど大きいことがわかります。",
          "上のゴム膜も下向きにへこんでいるので、水圧は上からも下からもはたらいています。"
        ]
      },
      {
        id: "membrane-horizontal",
        text: "両はしにゴム膜をはった筒を、横向き(水平)にして水中に沈めました。左右のゴム膜のようすとして、正しいものはどれですか。",
        choices: [
          "左右とも、同じだけ内側にへこむ",
          "左のゴム膜だけが、内側にへこむ",
          "左右とも、外側にふくらむ",
          "左右とも、まったくへこまない"
        ],
        answer: 0,
        explain: [
          "横向きの筒の左右のゴム膜は、同じ深さにあるので、同じ大きさの水圧を受けます。",
          "水圧は面に垂直に、外から押す向きにはたらくので、左右とも同じだけ内側にへこみます。"
        ]
      },
      {
        id: "pressure-direction",
        text: "水圧のはたらき方として、正しいものはどれですか。",
        choices: [
          "あらゆる向きから、物体の面に垂直にはたらく",
          "上から下への向きにだけはたらく",
          "下から上への向きにだけはたらく",
          "物体の面に平行にはたらく"
        ],
        answer: 0,
        explain: [
          "水圧は、水中の物体のあらゆる面に、その面に垂直にはたらきます。",
          "下から上へ、横から、上から下へと、どの向きからもはたらきます。"
        ]
      },
      {
        id: "buoyancy-cause",
        text: "水中の物体に浮力がはたらく理由として、正しいものはどれですか。",
        choices: [
          "物体の下の面にはたらく水圧が、上の面にはたらく水圧より大きいから",
          "物体の上の面にはたらく水圧が、下の面にはたらく水圧より大きいから",
          "水中では、物体にはたらく重力がなくなるから",
          "物体の横の面にはたらく水圧が、上向きにはたらくから"
        ],
        answer: 0,
        explain: [
          "物体の下の面は上の面より深いところにあるので、下から上向きに押す水圧のほうが大きくなります。この差が、上向きの浮力になります。",
          "横からの水圧は、左右で同じ大きさなので打ち消し合います。水中でも、重力はなくなりません。"
        ]
      },
      {
        id: "buoyancy-calc",
        text: "図のように、物体をばねばかりにつるして、空気中と、物体全体を水中に入れたときの値を調べました。物体にはたらく浮力は何Nですか。",
        figure: figScale([{ mode: "air", read: "1.5N", name: "空気中" }, { mode: "full", read: "0.9N", name: "全体を水中" }]),
        choices: [N(0.6), N(2.4), N(0.9), N(1.5)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "浮力は、空気中での値から水中での値をひいて求めます。",
          JHS.calc("1.5 N − 0.9 N", "0.6 N"),
          "2つの値をたしたり、水中での値をそのまま浮力としたりしないように注意します。"
        ],
        meta: { air: 1.5, water: 0.9, answer: 0.6 }
      },
      {
        id: "buoyancy-depth",
        text: "ばねばかりにつるした物体の全体を水中に入れたあと、さらに深く沈めました(底にはつかない)。ばねばかりの値はどうなりますか。",
        choices: ["変わらない", "小さくなる", "大きくなる", "0 になる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "物体全体が水中に入ったあとは、深さを変えても浮力の大きさは変わりません。",
          "深いところほど水圧は大きくなりますが、上の面と下の面の水圧の差は変わらないので、浮力は同じです。"
        ]
      },
      {
        id: "buoyancy-volume",
        text: "体積が同じで質量がちがう、鉄のおもりとアルミニウムのおもりがあります。それぞれの全体を水中に入れたとき、はたらく浮力の大きさについて正しいものはどれですか。",
        choices: [
          "どちらも同じ大きさ",
          "質量が大きい鉄のおもりのほうが大きい",
          "質量が小さいアルミニウムのおもりのほうが大きい",
          "鉄のおもりには、浮力ははたらかない"
        ],
        answer: 0,
        explain: [
          "浮力の大きさは、物体の水中にある部分の体積で決まり、物体の質量には関係しません。",
          "体積が同じなので、どちらにも同じ大きさの浮力がはたらきます。鉄のおもりは、浮力より重力が大きいので沈みます。"
        ]
      },
      {
        id: "float-balance",
        text: "質量 " + g(120) + " の木片が、水面に浮いて静止しています。木片にはたらく浮力の大きさは何Nですか。" + g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。",
        choices: [N(1.2), N(0), N(12), N(0.12)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "水面に浮いて静止している物体では、重力と浮力がつり合っています。",
          "木片にはたらく重力は " + N(1.2) + " なので、浮力も " + N(1.2) + " です。"
        ],
        meta: { mass: 120, answer: 1.2 }
      },
      {
        id: "sink-reason",
        text: "水中で静かに手をはなすと、物体が沈んでいきました。このとき、物体にはたらく重力と浮力の関係として、正しいものはどれですか。",
        choices: ["重力が浮力より大きい", "浮力が重力より大きい", "重力と浮力が等しい", "浮力がはたらいていない"],
        answer: 0,
        explain: [
          "下向きの重力が、上向きの浮力より大きいので、物体は沈んでいきます。",
          "沈んでいく物体にも、浮力ははたらいています。浮力のほうが大きければ浮き上がります。"
        ]
      },
      {
        id: "buoyancy-dir",
        text: "水中の物体にはたらく浮力の向きはどれですか。",
        choices: ["上向き", "下向き", "水平の向き", "水の流れる向き"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "浮力は、水中の物体にはたらく上向きの力です。",
          "下の面を押し上げる水圧が、上の面を押し下げる水圧より大きいため、上向きになります。"
        ]
      }
    ],
    generators: [
      {
        id: "buoyancy",
        label: "ばねばかりの値から、浮力・水中での値・空気中での値を求める",
        make: retry(function () {
          var kind = JHS.pick(["f", "f", "w", "a"]);
          var A = JHS.randInt(8, 50), F = JHS.randInt(Math.max(2, Math.ceil(A * 0.1)), Math.floor(A * 0.7)), Wt = A - F;   // 空気中・浮力・水中(N の10倍)
          var byMass = kind !== "a" && Math.random() < 0.3;
          var useFig = !byMass && Math.random() < 0.6;
          var c, text, explain, ans, figure = "";
          var air = byMass ? "質量 " + g(A * 10) + " の物体" : "空気中で " + N1(A) + " を示す物体";
          var note = byMass ? g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。" : "";
          var massLine = byMass ? ["物体にはたらく重力は " + N1(A) + " なので、空気中でのばねばかりの値は " + N1(A) + " です。"] : [];
          if (kind === "f") {
            c = JHS.choices4(N1(F), [A + Wt, Wt, A, F * 2].map(function (v) { return N1(v); }));
            if (useFig) {
              text = "図のように、物体をばねばかりにつるして、空気中と、物体全体を水中に入れたときの値を調べました。物体にはたらく浮力は何Nですか。";
              figure = figScale([{ mode: "air", read: n1(A) + "N", name: "空気中" }, { mode: "full", read: n1(Wt) + "N", name: "全体を水中" }]);
            } else {
              text = air + "をばねばかりにつるし、物体全体を水中に入れると、ばねばかりは " + N1(Wt) + " を示しました。物体にはたらく浮力は何Nですか。" + note;
            }
            explain = massLine.concat([
              "浮力は、空気中での値から水中での値をひいて求めます。",
              JHS.calc(n1(A) + " N − " + n1(Wt) + " N", n1(F) + " N")
            ]);
            ans = d10(F);
          } else if (kind === "w") {
            c = JHS.choices4(N1(Wt), [A + F, F, A, A - 2 * F].filter(function (v) { return v > 0; }).map(function (v) { return N1(v); }));
            if (useFig) {
              text = "図の物体の全体を水中に入れると、物体には " + N1(F) + " の浮力がはたらきました。このとき、ばねばかりは何Nを示しますか。";
              figure = figScale([{ mode: "air", read: n1(A) + "N", name: "空気中" }, { mode: "full", read: "?", name: "全体を水中" }]);
            } else {
              text = air + "をばねばかりにつるし、物体全体を水中に入れると、" + N1(F) + " の浮力がはたらきました。このとき、ばねばかりは何Nを示しますか。" + note;
            }
            explain = massLine.concat([
              "浮力は上向きにはたらくので、ばねばかりの値は、浮力の分だけ小さくなります。",
              JHS.calc(n1(A) + " N − " + n1(F) + " N", n1(Wt) + " N")
            ]);
            ans = d10(Wt);
          } else {
            c = JHS.choices4(N1(A), [Wt - F, F, Wt, A + F].filter(function (v) { return v > 0; }).map(function (v) { return N1(v); }));
            if (useFig) {
              text = "ある物体の全体を水中に入れると、図のように、ばねばかりは " + N1(Wt) + " を示し、物体には " + N1(F) + " の浮力がはたらいていました。この物体を空気中でばねばかりにつるすと、何Nを示しますか。";
              figure = figScale([{ mode: "air", read: "?", name: "空気中" }, { mode: "full", read: n1(Wt) + "N", name: "全体を水中" }]);
            } else {
              text = "ある物体をばねばかりにつるし、物体全体を水中に入れると、ばねばかりは " + N1(Wt) + " を示し、物体には " + N1(F) + " の浮力がはたらいていました。この物体を空気中でばねばかりにつるすと、何Nを示しますか。";
            }
            explain = [
              "水中では、浮力の分だけばねばかりの値が小さくなっています。空気中での値は、水中での値に浮力をたして求めます。",
              JHS.calc(n1(Wt) + " N + " + n1(F) + " N", n1(A) + " N")
            ];
            ans = d10(A);
          }
          if (!c) return null;
          var qn = { text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, air: d10(A), water: d10(Wt), buoyancy: d10(F), byMass: byMass, answer: ans } };
          if (figure) qn.figure = figure;
          return qn;
        })
      },
      {
        id: "half",
        label: "物体の半分だけを水中に入れたとき(浮力は体積に比例する)",
        make: retry(function () {
          var kind = JHS.pick(["read", "read", "buoy", "full"]);
          var A = JHS.randInt(10, 50), F = 2 * JHS.randInt(Math.max(1, Math.ceil(A * 0.05)), Math.floor(A * 0.35)), Wt = A - F, H = A - F / 2;
          var c, text, explain, ans, panels;
          var lead = "ある物体をばねばかりにつるし、空気中と水中で値を調べました。";
          if (kind === "read" || kind === "buoy") {
            panels = [{ mode: "air", read: n1(A) + "N", name: "空気中" }, { mode: "full", read: n1(Wt) + "N", name: "全体を水中" }, { mode: "half", read: "?", name: "半分を水中" }];
            var base = [
              "物体全体を水中に入れたときの浮力は、空気中での値から水中での値をひいて求めます。",
              JHS.calc(n1(A) + " N − " + n1(Wt) + " N", n1(F) + " N"),
              "浮力は、水中にある部分の体積に比例します。体積の半分なら、浮力も半分の " + N1(F / 2) + " です。"
            ];
            if (kind === "read") {
              c = JHS.choices4(N1(H), [Wt, F / 2, A - F * 2, A / 2, F].filter(function (v) { return v > 0 && v % 1 === 0; }).map(function (v) { return N1(v); }));
              text = lead + "図のように、物体の体積の半分だけを水中に入れると、ばねばかりは何Nを示しますか。";
              explain = base.concat([JHS.calc(n1(A) + " N − " + n1(F / 2) + " N", n1(H) + " N")]);
              ans = d10(H);
            } else {
              c = JHS.choices4(N1(F / 2), [F, H, Wt, F * 2].filter(function (v) { return v > 0; }).map(function (v) { return N1(v); }));
              text = lead + "図のように、物体の体積の半分だけを水中に入れたとき、物体にはたらく浮力は何Nですか。";
              explain = base;
              ans = d10(F / 2);
            }
          } else {
            panels = [{ mode: "air", read: n1(A) + "N", name: "空気中" }, { mode: "half", read: n1(H) + "N", name: "半分を水中" }, { mode: "full", read: "?", name: "全体を水中" }];
            c = JHS.choices4(N1(Wt), [H, A - F / 2 * 3, F, F / 2, H - 1].filter(function (v) { return v > 0 && v % 1 === 0; }).map(function (v) { return N1(v); }));
            text = lead + "図のように、物体の体積の半分だけを水中に入れると、ばねばかりは " + N1(H) + " を示しました。物体全体を水中に入れると、ばねばかりは何Nを示しますか。";
            explain = [
              "体積の半分を入れたときの浮力は、空気中での値から、そのときの値をひいて求めます。",
              JHS.calc(n1(A) + " N − " + n1(H) + " N", n1(F / 2) + " N"),
              "全体を入れると、水中の体積が2倍になるので、浮力も2倍の " + N1(F) + " になります。",
              JHS.calc(n1(A) + " N − " + n1(F) + " N", n1(Wt) + " N")
            ];
            ans = d10(Wt);
          }
          if (!c) return null;
          return {
            text: text, figure: figScale(panels), choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, air: d10(A), water: d10(Wt), half: d10(H), buoyancy: d10(F), answer: ans }
          };
        })
      },
      {
        id: "float-sink",
        label: "重力と浮力の表から、浮き上がる物体・沈む物体を選ぶ",
        make: retry(function () {
          var floatKind = Math.random() < 0.5;
          var rows = [], target = JHS.randInt(0, 3);
          for (var i = 0; i < 4; i++) {
            var Fb = JHS.randInt(3, 30), Wg;
            var odd = i === target;
            // floatKind: 1つだけ 浮力 > 重力。ほかは 重力 > 浮力(逆も同じ)
            if (odd === floatKind) Wg = Fb - JHS.randInt(1, Math.min(8, Fb - 1));
            else Wg = Fb + JHS.randInt(1, 12);
            rows.push([Wg, Fb]);
          }
          var keys = ["A", "B", "C", "D"];
          // 重力がもっとも小さい物体(浮くと思いがちなもの)と正解が同じなら、作り直す
          var minW = Math.min.apply(null, rows.map(function (r) { return r[0]; }));
          if (floatKind && rows[target][0] === minW) return null;
          var c = JHS.choices4("物体" + keys[target], keys.filter(function (k, i) { return i !== target; }).map(function (k) { return "物体" + k; }));
          var tbl = JHS.table({
            caption: "物体全体を水中に入れたときの、重力と浮力",
            head: ["物体", "重力", "浮力"],
            rows: rows.map(function (r, i) { return [keys[i], N1(r[0]), N1(r[1])]; })
          });
          var t = rows[target];
          return {
            text: "4つの物体 A〜D について、物体全体を水中に入れたときに、それぞれにはたらく重力と浮力の大きさを調べ、表にまとめました。水中で静かに手をはなしたとき、" +
              (floatKind ? "<b>浮き上がる</b>" : "<b>沈む</b>") + "物体はどれですか。",
            material: tbl,
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              floatKind ? "重力より浮力が大きい物体は、浮き上がります。" : "浮力より重力が大きい物体は、沈んでいきます。",
              "物体" + keys[target] + "は、重力 " + N1(t[0]) + "、浮力 " + N1(t[1]) + " で、" + (floatKind ? "浮力のほうが大きい" : "重力のほうが大きい") + "ただ1つの物体です。重力の大きさだけでなく、重力と浮力を比べて判断します。"
            ],
            meta: { kind: floatKind ? "float" : "sink", rows: rows.map(function (r) { return [d10(r[0]), d10(r[1])]; }), answer: keys[target] }
          };
        })
      }
    ]
  });


  // =====================================================================
  // 3-10 力の合成と分解
  // =====================================================================
  // 方眼の上の力の矢印。1目盛りは 20。方眼は 14 × 10 目盛り。
  //   o.origin [列, 行](作用点。行は上から数える)
  //   o.forces [{ v: [右へ, 上へ](目盛りの数), name: "力A", at: [dx, dy](名前を書く位置。矢印の先端からのずれ) }]
  //   o.result { v: [右へ, 上へ], name: "合力", at: [dx, dy] }   合力の矢印(fig-shape の矢印)
  //   o.para   true で、平行四辺形の補助線(破線)を描く
  //   o.keys   [[列, 行], …] 方眼の格子点に ア〜エ をつける
  //   o.scale  1目盛りが表す力("1N" など)。方眼の下に「1目盛りは 1N」と書く
  var GG = 20, GL = 20, GT = 12, GC = 14, GR = 10;
  function gx(col) { return GL + col * GG; }
  function gy(row) { return GT + row * GG; }
  function figGrid(o) {
    var s = grid(GL, GT, GC, GR, GG), O = o.origin, ox = gx(O[0]), oy = gy(O[1]);
    function tip(v) { return [ox + v[0] * GG, oy - v[1] * GG]; }
    var names = "";
    if (o.para && o.forces.length === 2) {
      var a = tip(o.forces[0].v), b = tip(o.forces[1].v), r = tip([o.forces[0].v[0] + o.forces[1].v[0], o.forces[0].v[1] + o.forces[1].v[1]]);
      s += seg("fig-dash", a[0], a[1], r[0], r[1]) + seg("fig-dash", b[0], b[1], r[0], r[1]);
    }
    if (o.result) {
      var t = tip(o.result.v);
      s += forceArrow(ox, oy, t[0], t[1], false, "fig-shape");
      if (o.result.name) names += txt(t[0] + o.result.at[0], t[1] + o.result.at[1], o.result.name, { anchor: "middle", halo: true });
    }
    o.forces.forEach(function (f) {
      var t = tip(f.v);
      s += forceArrow(ox, oy, t[0], t[1]);
      if (f.name) names += txt(t[0] + f.at[0], t[1] + f.at[1], f.name, { anchor: "middle", halo: true });
    });
    s += circle("fig-point", ox, oy, 4);
    (o.keys || []).forEach(function (k, i) { s += JHS.key(gx(k[0]), gy(k[1]), KANA[i]); });
    s += names;
    if (o.scale) s += txt(GL, 230, "1目盛りは", { cls: "fig-small" }) + txt(GL + 62, 230, o.scale, { cls: "fig-small" });
    return JHS.svg(320, 240, o.label || "方眼の上に、1つの点にはたらく力を矢印で表した図", s);
  }

  // 斜面の上の物体にはたらく重力と、その分力。傾きは 30°。
  //   o.keys  true で、名前のかわりに ア(重力)・イ(斜面に平行な分力)・ウ(斜面に垂直な分力)・エ(垂直抗力)をつける(問題)
  function figSlope(o) {
    o = o || {};
    var s = "", th = 30 * RAD, top = [40, 62], run = 230, bot = [top[0] + run, top[1] + run * Math.tan(th)];
    var u = [Math.cos(th), Math.sin(th)], n = [Math.sin(th), -Math.cos(th)];
    s += poly("fig-shape fig-fill-2", [top, bot, [top[0], bot[1]]]);
    var t = 0.5, S = [top[0] + u[0] * t * run / Math.cos(th), top[1] + u[1] * t * run / Math.cos(th)];
    var C = [S[0] + n[0] * 14, S[1] + n[1] * 14], hw = 22, hh = 14;
    // 箱の4すみ: 中心から、斜面に沿って ±hw、法線の向きに ±hh
    var box = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(function (p) {
      return [C[0] + u[0] * p[0] + n[0] * p[1], C[1] + u[1] * p[0] + n[1] * p[1]];
    });
    s += poly("fig-shape fig-fill-0", box);
    var L = 70, Gt = [C[0], C[1] + L];
    var Pa = [C[0] + u[0] * L * Math.sin(th), C[1] + u[1] * L * Math.sin(th)];
    var Pe = [C[0] - n[0] * L * Math.cos(th), C[1] - n[1] * L * Math.cos(th)];
    var Nt = [S[0] + n[0] * L * Math.cos(th), S[1] + n[1] * L * Math.cos(th)];
    s += seg("fig-dash", Pa[0], Pa[1], Gt[0], Gt[1]) + seg("fig-dash", Pe[0], Pe[1], Gt[0], Gt[1]);
    if (o.keys) s += forceArrow(S[0], S[1], Nt[0], Nt[1], false, "fig-shape");
    s += forceArrow(C[0], C[1], Gt[0], Gt[1]) + forceArrow(C[0], C[1], Pa[0], Pa[1]) + forceArrow(C[0], C[1], Pe[0], Pe[1]);
    s += circle("fig-point", C[0], C[1], 3.5);
    if (o.keys) {
      s += JHS.key(Gt[0] + 16, Gt[1] - 10, "ア") + JHS.key(Pa[0] + 13, Pa[1] - 8, "イ") + JHS.key(Pe[0] - 14, Pe[1] + 2, "ウ") + JHS.key(Nt[0] + 13, Nt[1] - 4, "エ");
    } else {
      s += txt(Gt[0] + 8, Gt[1] - 2, "重力", { halo: true });
      s += txt(Pa[0] + 6, Pa[1] - 6, "斜面に平行な分力", { cls: "fig-small", halo: true });
      s += txt(Pe[0] - 6, Pe[1] + 8, "斜面に垂直な分力", { cls: "fig-small", anchor: "end", halo: true });
    }
    return JHS.svg(320, 200, o.keys ? "斜面の上の物体にはたらく力を、矢印で表した図。矢印に記号がついている" : "斜面の上の物体にはたらく重力を、斜面に平行な分力と、斜面に垂直な分力に分けた図", s);
  }

  // 2本の糸でおもりをつるしたときの、糸が引く力。左は糸の間の角度が 60°、右は 120°。
  // おもりの重力を 50 の長さとして、糸の力の矢印の長さを計算する(重力 ÷ (2 × cos(角度の半分)))
  // o.quiz: 問題用。答えになる糸の力の矢印と「糸の力は小さい・大きい」の文字をかかない
  function figStrings(o) {
    o = o || {};
    var s = "", Wl = 50;
    [[80, 60, 100], [240, 120, 60]].forEach(function (p) {
      var cx = p[0], ang = p[1], ky = p[2], half = ang / 2 * RAD, h = ky - 20, dx = h * Math.tan(half);
      var T = Wl / (2 * Math.cos(half)), ux = Math.sin(half), uy = -Math.cos(half);
      s += '<rect x="' + P(cx - 74) + '" y="12" width="148" height="8" fill="url(#sci-pat-hatch)"/>' + seg("fig-shape", cx - 74, 20, cx + 74, 20);
      s += seg("fig-shape", cx, ky, cx - dx, 20) + seg("fig-shape", cx, ky, cx + dx, 20) + seg("fig-shape", cx, ky, cx, ky + 30);
      s += rect("fig-shape fig-fill-2", cx - 15, ky + 30, 30, 24);
      if (!o.quiz) s += forceArrow(cx, ky, cx - ux * T, ky + uy * T) + forceArrow(cx, ky, cx + ux * T, ky + uy * T);
      s += forceArrow(cx, ky + 42, cx, ky + 42 + Wl, false, "fig-shape");
      s += circle("fig-point", cx, ky, 3.5);
      s += txt(cx, ky - (ang > 90 ? 18 : 38), ang + "°", { cls: "fig-small", anchor: "middle", halo: true });
      s += txt(cx + 8, ky + 42 + Wl - 4, "重力", { cls: "fig-small", halo: true });
    });
    if (!o.quiz) s += txt(80, 228, "糸の力は小さい", { cls: "fig-small", anchor: "middle" }) + txt(240, 228, "糸の力は大きい", { cls: "fig-small", anchor: "middle" });
    return JHS.svg(320, 240, o.quiz ? "同じおもりを2本の糸でつるした図。糸の間の角度が 60° のときと 120° のとき" : "同じおもりを2本の糸でつるした図。糸の間の角度が 60° のときと 120° のときの、糸が引く力の矢印", s);
  }

  // 一直線上の2力。物体(箱)を、糸で左右に引く。forces: [{ dir: 1(右) か -1(左), n: 大きさ(N), label: "3N" }]
  function figLine(forces) {
    var s = "", y = 100, max = Math.max.apply(null, forces.map(function (f) { return f.n; })), k = 100 / max;
    var same = forces.length === 2 && forces[0].dir === forces[1].dir;
    s += rect("fig-shape fig-fill-2", 136, y - 18, 48, 36);
    forces.forEach(function (f, i) {
      // 矢印は 18 以上の長さにする(小さい力の矢印が見えなくならないように)
      var yy = same ? y + (i === 0 ? -8 : 8) : y, x0 = f.dir > 0 ? 184 : 136, x1 = x0 + f.dir * Math.max(18, f.n * k);
      s += forceArrow(x0, yy, x1, yy, true);
      // 名前は矢印の中ほど。ただし箱に重ならないよう、箱の辺から 16 以上離す
      var lx = f.dir > 0 ? Math.max((x0 + x1) / 2, x0 + 16) : Math.min((x0 + x1) / 2, x0 - 16);
      s += txt(lx, same && i === 1 ? yy + 22 : yy - 12, f.label, { anchor: "middle", halo: true });
    });
    return JHS.svg(320, 200, "物体に、一直線上の2つの力がはたらいている図", s);
  }

  // 直角に交わる2力。a(右向き)・b(上向き)の大きさの比で描き、そばに値を書く。o.result: true で、合力と補助線も描く
  function figRight(a, b, la, lb, o) {
    o = o || {};
    var s = "", k = 120 / Math.max(a, b), ox = 90, oy = 170, A = [ox + a * k, oy], B = [ox, oy - b * k];
    s += path("fig-thin", "M" + (ox + 10) + " " + oy + "V" + (oy - 10) + "H" + ox);
    if (o.result) {
      s += seg("fig-dash", A[0], A[1], A[0], B[1]) + seg("fig-dash", B[0], B[1], A[0], B[1]);
      s += forceArrow(ox, oy, A[0], B[1], false, "fig-shape") + txt(A[0] + 6, B[1] - 6, "合力", { halo: true });
    }
    s += forceArrow(ox, oy, A[0], A[1], true) + forceArrow(ox, oy, B[0], B[1], true);
    s += txt((ox + A[0]) / 2, oy + 20, la, { anchor: "middle" }) + txt(ox - 8, (oy + B[1]) / 2 + 4, lb, { anchor: "end" });
    return JHS.svg(320, 200, o.result ? "直角に交わる2力と、その合力" : "1つの点に、直角に交わる2つの力がはたらいている図", s);
  }

  // 方向を言葉にする(方眼の目盛り)
  function moveWords(v) {
    var w = [];
    if (v[0] !== 0) w.push((v[0] > 0 ? "右へ " : "左へ ") + Math.abs(v[0]) + "目盛り");
    if (v[1] !== 0) w.push((v[1] > 0 ? "上へ " : "下へ ") + Math.abs(v[1]) + "目盛り");
    return w.join("、");
  }
  // 点 p と線分 a–b の距離
  function distSeg(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0;
    var x = a[0] + t * dx - p[0], y = a[1] + t * dy - p[1];
    return Math.sqrt(x * x + y * y);
  }
  // 3:4:5 の組と、方眼の向きにそった長さ
  var PYTH = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10]];
  // 三平方の定理を習う前なので、3:4:5 の比は問題文に前提として書く
  var P345 = "直角をはさむ2辺の長さの比が 3:4 の直角三角形では、3辺の比は 3:4:5 になります。";
  // 2力がほぼ一直線上にあるか(なす角が約20°未満、または約160°より大きい)。作図が読みにくいので使わない
  function nearlyLine(a, b) {
    var cosAB = (a[0] * b[0] + a[1] * b[1]) / Math.hypot(a[0], a[1]) / Math.hypot(b[0], b[1]);
    return cosAB > 0.94 || cosAB < -0.94;
  }

  var LINE_TABLE = JHS.table({
    caption: "一直線上の2力の合力",
    head: ["2力の向き", "合力の大きさ", "合力の向き"],
    rows: [
      ["同じ向き", "2力の和", "2力と同じ向き"],
      ["反対向き", "2力の差", "大きいほうの力の向き"]
    ]
  });

  JHS.register("g3-force-composition", {
    points: [
      "2つの力と同じはたらきをする1つの力を求めることを<b>力の合成</b>といい、求めた力を<b>合力</b>といいます。",
      "一直線上の2力の合力は、" + rule("同じ向きなら2力の和") + "、" + rule("反対向きなら2力の差") + "で、向きは大きいほうの力の向きです。",
      "向きのちがう2力の合力は、" + rule("2力を2辺とする平行四辺形の対角線") + "で表されます(<b>平行四辺形の法則</b>)。2力の大きさを変えずに、2力の間の角度を大きくすると、合力は小さくなります。",
      "1つの物体に3つの力がはたらいてつり合っているとき、" + rule("2力の合力は、残りの1力と同じ大きさで逆向き") + "です。",
      "1つの力を、同じはたらきをする2つの力に分けることを<b>力の分解</b>といい、分けた力を<b>分力</b>といいます。もとの力が、2つの分力を2辺とする平行四辺形の対角線になるように分けます。",
      "斜面の上の物体にはたらく重力は、" + rule("斜面に平行な分力") + "と" + rule("斜面に垂直な分力") + "に分けられます。斜面の傾きが大きいほど、平行な分力は大きく、垂直な分力は小さくなります。2本の糸で物体をつるすとき、" + rule("糸の間の角度が大きいほど、それぞれの糸が引く力は大きく") + "なります。"
    ],
    figures: [
      {
        html: figGrid({
          origin: [3, 7],
          forces: [{ v: [5, 0], name: "力A", at: [0, 20] }, { v: [2, 3], name: "力B", at: [-18, -6] }],
          result: { v: [7, 3], name: "合力", at: [6, -10] },
          para: true,
          label: "方眼の上の力Aと力B、2力を2辺とする平行四辺形と、その対角線の合力"
        }),
        caption: "力Aと力Bを2辺とする平行四辺形をかく(破線)と、作用点(●)から引いた対角線が合力です。合力の先端は、力Aの先端から、力Bと同じ向き・同じ長さだけ進んだ点になります。"
      },
      { html: figSlope(), caption: "斜面の上の物体にはたらく重力を、斜面に平行な分力と、斜面に垂直な分力に分けた図。重力が、2つの分力を2辺とする長方形の対角線になります。" },
      { html: figStrings(), caption: "同じおもりを2本の糸でつるしたとき、2本の糸が引く力の合力は、どちらもおもりの重力と同じ大きさで上向きです。糸の間の角度が大きい右のほうが、それぞれの糸が引く力は大きくなります。" }
    ],
    blocks: [LINE_TABLE],
    example: {
      title: "1つの点に、右向きに " + N(3) + " の力と、上向きに " + N(4) + " の力が、直角に交わるようにはたらいています。2力の合力の大きさは何Nですか。" + P345,
      steps: [
        "2力を2辺とする平行四辺形(ここでは長方形)をかくと、合力はその対角線になります。",
        "対角線は、横 3・縦 4 の直角三角形の斜辺です。3辺の比が 3:4:5 なので、対角線の長さは 5 にあたります。",
        "2力をそのままたして " + N(7) + " としないように注意します。"
      ],
      result: N(5)
    },
    fixed: [
      {
        id: "resultant-def",
        text: "2つの力と同じはたらきをする1つの力を何といいますか。",
        choices: ["合力", "分力", "垂直抗力", "弾性力"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "2つの力と同じはたらきをする1つの力を合力といい、合力を求めることを力の合成といいます。",
          "分力は、1つの力を分解して得られる力です。"
        ]
      },
      {
        id: "line-same",
        text: "図のように、物体に、同じ向きに " + N(3) + " と " + N(5) + " の力がはたらいています。2力の合力はどれですか。",
        figure: figLine([{ dir: 1, n: 5, label: "5N" }, { dir: 1, n: 3, label: "3N" }]),
        choices: ["右向きに " + N(8), "右向きに " + N(2), "左向きに " + N(8), "右向きに " + N(15)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "一直線上で同じ向きの2力の合力は、2力の和で、向きは2力と同じです。",
          JHS.calc("3 N + 5 N", "8 N")
        ],
        meta: { f1: 3, f2: 5, same: true, answer: 8 }
      },
      {
        id: "line-opp",
        text: "物体を、右向きに " + N(8) + "、左向きに " + N(3) + " の力で、一直線上で引きました。2力の合力はどれですか。",
        figure: figLine([{ dir: 1, n: 8, label: "8N" }, { dir: -1, n: 3, label: "3N" }]),
        choices: ["右向きに " + N(5), "左向きに " + N(5), "右向きに " + N(11), "左向きに " + N(11)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "一直線上で反対向きの2力の合力は、2力の差で、向きは大きいほうの力の向きです。",
          JHS.calc("8 N − 3 N", "5 N") ,
          "大きいほうの力(" + N(8) + ")が右向きなので、合力も右向きです。"
        ],
        meta: { right: 8, left: 3, answer: 5 }
      },
      {
        id: "parallelogram",
        text: "向きのちがう2力の合力を作図で求める方法として、正しいものはどれですか。",
        choices: [
          "2力を2辺とする平行四辺形をかき、作用点から引いた対角線を合力とする",
          "2力の矢印の先端どうしを結んだ線を合力とする",
          "2力の矢印の長さをたした長さの矢印を、どちらかの力の向きにかく",
          "長いほうの力の矢印を、そのまま合力とする"
        ],
        answer: 0,
        explain: [
          "向きのちがう2力の合力は、2力を2辺とする平行四辺形の対角線で表されます(平行四辺形の法則)。",
          "2力の先端どうしを結んだ線は、もう1本の対角線で、合力ではありません。"
        ]
      },
      {
        id: "grid-tip",
        text: "図の力A・力Bの合力を作図したとき、合力の矢印の先端は、ア〜エのどの点になりますか。●は作用点で、ア〜エは方眼の格子点(線が交わる点)にあります。",
        figure: figGrid({
          origin: [2, 7],
          forces: [{ v: [4, 0], name: "力A", at: [0, 20] }, { v: [1, 3], name: "力B", at: [-18, -4] }],
          keys: [[7, 4], [5, 4], [3, 10], [9, 4]],
          label: "方眼の上の力Aと力B。方眼の格子点に記号がついている"
        }),
        choices: ["ア", "イ", "ウ", "エ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "力Aと力Bを2辺とする平行四辺形をかきます。合力の先端は、力Aの先端から、力Bと同じだけ(右へ1目盛り、上へ3目盛り)進んだ点です。",
          "作用点から見ると、右へ 4 + 1 = 5目盛り、上へ 3目盛りの点で、アです。"
        ],
        meta: { a: [4, 0], b: [1, 3], answer: "ア" }
      },
      {
        id: "angle-resultant",
        text: "大きさの変わらない2力が1つの点にはたらいています。2力の間の角度を大きくしていくと、合力の大きさはどうなりますか。",
        choices: ["小さくなる", "大きくなる", "変わらない", "はじめは大きくなり、やがて小さくなる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "2力の間の角度が大きくなるほど、平行四辺形の対角線は短くなるので、合力は小さくなります。",
          "角度が 0°(同じ向き)のとき合力は2力の和で最大、180°(反対向き)のとき2力の差で最小です。"
        ]
      },
      {
        id: "three-forces",
        text: "1つの物体に3つの力がはたらいて、物体が静止しています。このとき、そのうちの2力の合力と、残りの1力の関係として正しいものはどれですか。",
        choices: [
          "同じ大きさで、逆向き",
          "同じ大きさで、同じ向き",
          "合力のほうが、残りの1力より大きい",
          "合力のほうが、残りの1力より小さく、向きは直角"
        ],
        answer: 0,
        explain: [
          "3力がつり合っているとき、2力の合力は、残りの1力とつり合っています。",
          "つり合う2力は、同じ大きさで、一直線上にあり、逆向きです。"
        ]
      },
      {
        id: "component-def",
        text: "1つの力を、同じはたらきをする2つの力に分けることを何といいますか。",
        choices: ["力の分解", "力の合成", "力のつり合い", "作用・反作用"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "1つの力を、同じはたらきをする2つの力に分けることを力の分解といい、分けた力を分力といいます。",
          "力の合成は、その逆で、2つの力を1つの力(合力)にまとめることです。"
        ]
      },
      {
        id: "slope-keys",
        text: "図は、斜面の上に静止している物体にはたらく力などを、矢印ア〜エで表したものです。物体にはたらく重力の、斜面に平行な分力はどれですか。",
        figure: figSlope({ keys: true }),
        choices: ["イ", "ア", "ウ", "エ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "アが重力で、イが斜面に平行な分力、ウが斜面に垂直な分力です。重力は、イとウを2辺とする長方形の対角線になっています。",
          "エは、斜面が物体を押す垂直抗力で、斜面に垂直な分力(ウ)とつり合っています。"
        ]
      },
      {
        id: "slope-steeper",
        text: "斜面の上の物体について、斜面の傾きを大きくしました。物体にはたらく重力の分力はどうなりますか。",
        choices: [
          "斜面に平行な分力は大きくなり、垂直な分力は小さくなる",
          "斜面に平行な分力は小さくなり、垂直な分力は大きくなる",
          "どちらの分力も大きくなる",
          "どちらの分力も変わらない"
        ],
        answer: 0,
        explain: [
          "傾きを大きくすると、重力(大きさと向きは変わらない)を分解したとき、斜面に平行な分力は大きく、垂直な分力は小さくなります。",
          "傾きが 90° になると、平行な分力は重力と同じ大きさになり、垂直な分力は 0 になります。"
        ]
      },
      {
        id: "slope-normal",
        text: "斜面の上で静止している物体について、物体にはたらく重力の「斜面に垂直な分力」とつり合っている力はどれですか。",
        choices: ["斜面が物体を押す垂直抗力", "斜面に平行な分力", "物体にはたらく重力", "物体が斜面を押す力"],
        answer: 0,
        explain: [
          "斜面に垂直な分力は、斜面が物体を垂直に押し返す力(垂直抗力)とつり合っています。",
          "物体が斜面を押す力は、斜面にはたらく力なので、物体にはたらく力とのつり合いにはなりません。"
        ]
      },
      {
        id: "strings-angle",
        text: "同じおもりを2本の糸でつるします。2本の糸の間の角度を大きくすると、それぞれの糸がおもりを引く力の大きさはどうなりますか。",
        figure: figStrings({ quiz: true }),
        choices: ["大きくなる", "小さくなる", "変わらない", "0 になる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "2本の糸が引く力の合力は、いつもおもりの重力とつり合うので、大きさは変わりません。",
          "糸の間の角度が大きいほど、同じ合力をつくるのに、それぞれの糸の力を大きくする必要があります。"
        ]
      },
      {
        id: "strings-sum",
        text: "質量 " + g(300) + " のおもりを、2本の糸でつるして静止させました。2本の糸がおもりを引く力の合力の大きさは何Nですか。" + g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。",
        choices: [N(3), N(1.5), N(6), N(300)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "おもりは静止しているので、2本の糸が引く力の合力は、おもりにはたらく重力(" + N(3) + ")とつり合っています。",
          "合力は重力と同じ大きさで上向きです。糸1本の力ではないので、2で割りません。"
        ],
        meta: { mass: 300, answer: 3 }
      },
      {
        id: "right-angle",
        text: "図のように、1つの点に、右向きに " + N(6) + "、上向きに " + N(8) + " の力が直角に交わるようにはたらいています。2力の合力の大きさは何Nですか。" + P345,
        figure: figRight(6, 8, "6N", "8N"),
        choices: [N(10), N(14), N(2), N(48)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "2力を2辺とする長方形をかくと、合力はその対角線です。対角線は、横 6・縦 8 の直角三角形の斜辺です。",
          "6:8:10 は 3:4:5 と同じ比なので、合力は " + N(10) + " です。2力の和の " + N(14) + " にはなりません。"
        ],
        meta: { a: 6, b: 8, answer: 10 }
      }
    ],
    generators: [
      {
        id: "line",
        label: "一直線上の2力の合力(同じ向き・反対向き)",
        make: retry(function () {
          var a = JHS.randInt(2, 12), b = JHS.randInt(2, 12), same = Math.random() < 0.45;   // 1N の矢印は短すぎて見えにくいので、2N 以上
          if (a === b) return null;
          var dA = JHS.pick([1, -1]), dB = same ? dA : -dA;
          function word(d) { return d > 0 ? "右向き" : "左向き"; }
          var sum = a + b, diff = Math.abs(a - b), dirR = same ? dA : (a > b ? dA : dB);
          var correct = word(dirR) + "に " + N(same ? sum : diff);
          var wr = same ? [word(-dirR) + "に " + N(sum), word(dirR) + "に " + N(diff), word(-dirR) + "に " + N(diff)]
                        : [word(-dirR) + "に " + N(diff), word(dirR) + "に " + N(sum), word(-dirR) + "に " + N(sum)];
          var c = JHS.choices4(correct, wr);
          if (!c) return null;
          var big = a > b ? a : b, small = a > b ? b : a;
          return {
            text: "図のように、物体に一直線上の2力がはたらいています。" +
              (same ? "どちらも" + word(dA) + "で、大きさは " + N(a) + " と " + N(b) + " です。" : word(dA) + "の力は " + N(a) + "、" + word(dB) + "の力は " + N(b) + " です。") + "2力の合力はどれですか。",
            figure: figLine([{ dir: dA, n: a, label: a + "N" }, { dir: dB, n: b, label: b + "N" }]),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: same ? [
              "同じ向きの2力の合力は、2力の和で、向きは2力と同じです。",
              JHS.calc(a + " N + " + b + " N", sum + " N")
            ] : [
              "反対向きの2力の合力は、2力の差で、向きは大きいほうの力の向きです。",
              JHS.calc(big + " N − " + small + " N", diff + " N"),
              "大きいほうの力(" + N(big) + ")が" + word(dirR) + "なので、合力も" + word(dirR) + "です。"
            ],
            meta: { f1: a, dir1: dA, f2: b, dir2: dB, same: same, dir: dirR, answer: same ? sum : diff }
          };
        })
      },
      {
        id: "grid-tip",
        label: "方眼の上で、合力・つり合う力・分力の矢印の先端を選ぶ",
        make: retry(function () {
          var kind = JHS.pick(["resultant", "resultant", "balance", "decomp"]);
          function rv() { return [JHS.randInt(-5, 5), JHS.randInt(-4, 4)]; }
          function big(v) { return Math.abs(v[0]) + Math.abs(v[1]) >= 2; }
          var A = rv(), B = rv();
          if (!big(A) || !big(B)) return null;
          if (A[0] * B[1] - A[1] * B[0] === 0) return null;   // 一直線上の2力は使わない
          var R = [A[0] + B[0], A[1] + B[1]];
          if (!big(R)) return null;
          if (nearlyLine(A, kind === "decomp" ? R : B)) return null;   // 図にかく2力(分解では 力A と 力F)がほぼ一直線上なら使わない
          function neg(v) { return [-v[0], -v[1]]; }
          function sub(v, w) { return [v[0] - w[0], v[1] - w[1]]; }
          // drawn: 図にかく矢印、ans: 答えの点、cands: まちがえやすい点
          var drawnF, drawnR = null, ans, cands;
          if (kind === "resultant") {
            drawnF = [{ v: A, name: "力A" }, { v: B, name: "力B" }];
            ans = R; cands = [sub(A, B), sub(B, A), neg(R), [R[0], -R[1]], [-R[0], R[1]]];
          } else if (kind === "balance") {
            drawnF = [{ v: A, name: "力A" }, { v: B, name: "力B" }];
            ans = neg(R); cands = [R, neg(A), neg(B), sub(A, B), sub(B, A)];
          } else {
            // 力F(= R)を、力A と 力B に分解する。図には 力F と 力A をかく
            drawnF = [{ v: A, name: "力A" }];
            drawnR = { v: R, name: "力F" };
            ans = B; cands = [sub(A, R), [R[0] + A[0], R[1] + A[1]], neg(B), [B[0], -B[1]], [-B[0], B[1]]];
          }
          var shown = drawnF.map(function (f) { return f.v; }).concat(drawnR ? [drawnR.v] : []);
          // 作用点の位置を決める(使う点がすべて方眼の内側 1〜13列、1〜9行に入るように)
          var pts = [[0, 0], ans].concat(shown);
          var minX = Math.min.apply(null, pts.map(function (p) { return p[0]; })), maxX = Math.max.apply(null, pts.map(function (p) { return p[0]; }));
          var minY = Math.min.apply(null, pts.map(function (p) { return p[1]; })), maxY = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
          if (maxX - minX > 12 || maxY - minY > 8) return null;
          var oc = JHS.randInt(1 - minX, 13 - maxX), orow = JHS.randInt(1 + maxY, 9 + minY);
          function cell(v) { return [oc + v[0], orow - v[1]]; }
          function pix(v) { var c = cell(v); return [gx(c[0]), gy(c[1])]; }
          function inside(v) { var c = cell(v); return c[0] >= 1 && c[0] <= 13 && c[1] >= 1 && c[1] <= 9; }
          var O = pix([0, 0]);
          var chosen = [];
          // 記号は、矢印から 13 以上、ほかの記号から 2目盛り以上離す。矢印の先端にも置かない
          function ok(v) {
            if (!inside(v)) return false;
            var p = pix(v);
            if (shown.some(function (w) { return distSeg(p, O, pix(w)) < 13; })) return false;
            return chosen.every(function (w) { var q2 = pix(w); return Math.abs(q2[0] - p[0]) + Math.abs(q2[1] - p[1]) >= 40; });
          }
          if (!ok(ans)) return null;
          chosen = [ans];
          JHS.shuffle(cands).forEach(function (v) { if (chosen.length < 4 && ok(v)) chosen.push(v); });
          if (chosen.length < 4) return null;
          var order = JHS.shuffle([0, 1, 2, 3]);
          var keys = [], ansKana = "";
          order.forEach(function (idx, i) { keys.push(cell(chosen[idx])); if (idx === 0) ansKana = KANA[i]; });
          // 矢印の名前は、先端の上(上向きの矢印)か下に書く。記号・方眼の外・ほかの名前と重なる組は作り直す
          var named = drawnF.concat(drawnR ? [drawnR] : []), labelPts = [];
          named.forEach(function (f) { f.at = [0, f.v[1] > 0 ? -10 : 20]; var t = pix(f.v); labelPts.push([t[0], t[1] + f.at[1] - 4]); });
          var badLabel = labelPts.some(function (lp, i) {
            if (lp[1] < 16 || lp[1] > 216 || lp[0] < 30 || lp[0] > 290) return true;
            if (keys.some(function (k) { return Math.abs(gx(k[0]) - lp[0]) < 34 && Math.abs(gy(k[1]) - lp[1]) < 20; })) return true;
            if (Math.abs(lp[0] - O[0]) < 26 && Math.abs(lp[1] - O[1]) < 16) return true;
            // 名前が、ほかの矢印の線分や矢じりに近すぎないか
            if (named.some(function (f, j) { return j !== i && distSeg(lp, O, pix(f.v)) < 14; })) return true;
            return labelPts.some(function (lq, j) { return j > i && Math.abs(lp[0] - lq[0]) < 40 && Math.abs(lp[1] - lq[1]) < 18; });
          });
          if (badLabel) return null;
          var c = JHS.choices4(ansKana, KANA.filter(function (k) { return k !== ansKana; }));
          var lead = "ア〜エは方眼の格子点(線が交わる点)にあり、●は作用点です。";
          var text, explain;
          if (kind === "resultant") {
            text = "図の力A・力Bの合力を作図したとき、合力の矢印の先端は、ア〜エのどの点になりますか。" + lead;
            explain = [
              "力Aと力Bを2辺とする平行四辺形をかくと、作用点から引いた対角線が合力です。合力の先端は、力Aの先端から、力Bと同じだけ進んだ点です。",
              "作用点から見ると、" + moveWords(R) + "進んだ点で、" + ansKana + " です。力の先端どうしを結んだ線や、合力と逆向きの点と取り違えないようにします。"
            ];
          } else if (kind === "balance") {
            text = "図の点●に、力A・力Bと、もう1つの力がはたらいて、3力がつり合っています。3つ目の力の矢印の先端は、ア〜エのどの点ですか。" + lead;
            explain = [
              "力Aと力Bを2辺とする平行四辺形をかくと、合力の先端は、作用点から" + moveWords(R) + "進んだ点です。",
              "3つ目の力は、この合力とつり合うので、同じ大きさで逆向きです。先端は、作用点から" + moveWords(ans) + "進んだ点で、" + ansKana + " です。"
            ];
          } else {
            text = "図の力Fを、力Aと、もう1つの力Bに分解します。力Bの矢印の先端は、ア〜エのどの点ですか。" + lead;
            explain = [
              "力Fが、力Aと力Bを2辺とする平行四辺形の対角線になるように分解します。",
              "力Bの先端は、力Aの先端から力Fの先端までと同じだけ、作用点から進んだ点です。作用点から" + moveWords(ans) + "進んだ点で、" + ansKana + " です。"
            ];
          }
          return {
            text: text,
            figure: figGrid({ origin: [oc, orow], forces: drawnF, result: drawnR, keys: keys,
              label: kind === "decomp" ? "方眼の上の力Fと力A。方眼の格子点に記号がついている" : "方眼の上の力Aと力B。方眼の格子点に記号がついている" }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, a: A, b: B, r: R, tip: ans, keys: keys, origin: [oc, orow], answer: ansKana }
          };
        })
      },
      {
        id: "grid-mag",
        label: "方眼の上の2力の合力の大きさ(格子点にのる、整数の目盛り)",
        make: retry(function () {
          var R, axis = Math.random() < 0.45;
          if (axis) {
            var k = JHS.randInt(2, 8);
            R = JHS.pick([[k, 0], [-k, 0], [0, Math.min(k, 7)], [0, -Math.min(k, 7)]]);
          } else {
            var t = JHS.pick(PYTH);
            if (t[1] > 7) return null;
            R = [t[0] * JHS.pick([1, -1]), t[1] * JHS.pick([1, -1])];
          }
          var len = axis ? Math.abs(R[0]) + Math.abs(R[1]) : PYTH.filter(function (t) { return t[0] === Math.abs(R[0]) && t[1] === Math.abs(R[1]); })[0][2];
          var A = [JHS.randInt(-5, 6), JHS.randInt(-4, 4)], B = [R[0] - A[0], R[1] - A[1]];
          if (Math.abs(A[0]) + Math.abs(A[1]) < 2 || Math.abs(B[0]) + Math.abs(B[1]) < 2) return null;
          if (A[0] * B[1] - A[1] * B[0] === 0) return null;
          if (nearlyLine(A, B)) return null;   // ほぼ一直線上の2力は使わない
          var pts = [[0, 0], A, B, R];
          var minX = Math.min.apply(null, pts.map(function (p) { return p[0]; })), maxX = Math.max.apply(null, pts.map(function (p) { return p[0]; }));
          var minY = Math.min.apply(null, pts.map(function (p) { return p[1]; })), maxY = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
          if (maxX - minX > 12 || maxY - minY > 8) return null;
          var oc = JHS.randInt(1 - minX, 13 - maxX), orow = JHS.randInt(1 + maxY, 9 + minY);
          var unit = JHS.pick([1, 1, 2, 0.5]);
          if (unit === 0.5 && len % 2 !== 0) return null;
          var ans = len * unit;
          var compSum = (Math.abs(R[0]) + Math.abs(R[1])) * unit;
          var wr = [compSum, len, ans + unit, ans - unit, Math.abs(R[0]) * unit, Math.abs(R[1]) * unit].filter(function (v) { return v > 0; });
          var c = JHS.choices4(N(ans), wr.map(N));
          if (!c) return null;
          var TA = [gx(oc + A[0]), gy(orow - A[1])], TB = [gx(oc + B[0]), gy(orow - B[1])];
          var atA = [0, A[1] > 0 ? -10 : 20], atB = [0, B[1] > 0 ? -10 : 20];
          var la = [TA[0], TA[1] + atA[1] - 4], lb = [TB[0], TB[1] + atB[1] - 4];
          if (la[1] < 16 || la[1] > 216 || lb[1] < 16 || lb[1] > 216) return null;
          if (Math.abs(la[0] - lb[0]) < 40 && Math.abs(la[1] - lb[1]) < 18) return null;
          var O2 = [gx(oc), gy(orow)];   // 名前が、もう一方の矢印の線分や矢じりに近すぎないか
          if (distSeg(la, O2, TB) < 14 || distSeg(lb, O2, TA) < 14) return null;
          var scaleText = num(unit) + "N";
          var explain = [
            "力Aと力Bを2辺とする平行四辺形をかくと、合力の先端は、作用点から" + moveWords(R) + "進んだ格子点です。"
          ];
          if (axis) explain.push("合力は方眼の線にそった向きで、長さは " + len + "目盛りです。");
          else explain.push("合力は、横 " + Math.abs(R[0]) + "目盛り・縦 " + Math.abs(R[1]) + "目盛りの直角三角形の斜辺です。3辺の比が 3:4:5 なので、長さは " + len + "目盛りです。横と縦の目盛りの数をたさないように注意します。");
          explain.push(JHS.calc(len + " × " + num(unit) + " N", num(ans) + " N"));
          return {
            text: "図の力A・力Bの合力の大きさは何Nですか。方眼の1目盛りは " + N(unit) + " を表します。" + (axis ? "" : P345),
            figure: figGrid({ origin: [oc, orow], forces: [{ v: A, name: "力A", at: atA }, { v: B, name: "力B", at: atB }], scale: scaleText, label: "方眼の上の力Aと力B" }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { a: A, b: B, r: R, cells: len, unit: unit, answer: ans }
          };
        })
      },
      {
        id: "right",
        label: "直角に交わる2力の合力(3:4:5 の比)",
        make: retry(function () {
          var t = JHS.pick([[3, 4, 5], [4, 3, 5]]), k = JHS.pick([0.1, 0.2, 1, 2, 3, 4, 5, 10]);
          var a = Math.round(t[0] * k * 10) / 10, b = Math.round(t[1] * k * 10) / 10, cc = Math.round(t[2] * k * 10) / 10;
          var kind = Math.random() < 0.7 ? "res" : "other";
          var c, text, explain, ans;
          if (kind === "res") {
            c = JHS.choices4(N(cc), onlyNice([a + b, Math.abs(b - a), a * b, cc * 2]).map(N));
            text = "図のように、1つの点に、右向きに " + N(a) + "、上向きに " + N(b) + " の力が直角に交わるようにはたらいています。2力の合力の大きさは何Nですか。" + P345;
            explain = [
              "2力を2辺とする長方形をかくと、合力はその対角線です。",
              "対角線は、2辺が " + num(a) + " と " + num(b) + " の直角三角形の斜辺です。辺の比が 3:4:5 なので、合力は " + N(cc) + " です。",
              "2力をそのままたした " + N(Math.round((a + b) * 10) / 10) + " にはなりません。"
            ];
            ans = cc;
          } else {
            c = JHS.choices4(N(b), onlyNice([cc - a, cc + a, a, cc]).map(N));
            text = "1つの点に、右向きの " + N(a) + " の力と、上向きの力が直角に交わるようにはたらいていて、2力の合力の大きさは " + N(cc) + " でした。上向きの力の大きさは何Nですか。" + P345;
            explain = [
              "2力を2辺とする長方形の対角線が合力です。直角三角形の辺の比 3:4:5 で考えます。",
              "右向きの力 " + num(a) + " と合力 " + num(cc) + " の比は " + t[0] + ":" + t[2] + " なので、上向きの力は " + t[1] + " にあたる " + N(b) + " です。",
              "合力から右向きの力をひいた " + N(Math.round((cc - a) * 10) / 10) + " にはなりません。"
            ];
            ans = b;
          }
          if (!c) return null;
          var qn = { text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain, meta: { kind: kind, right: a, up: b, resultant: cc, answer: ans } };
          if (kind === "res") qn.figure = figRight(t[0], t[1], num(a) + "N", num(b) + "N");
          return qn;
        })
      }
    ]
  });

  // =====================================================================
  // 3-11 物体の運動
  // =====================================================================
  // 一定の時間ごとに切った記録テープを、左から順に下をそろえてはった図(グラフの形)。
  //   lens  テープの長さ(cm)の配列。o.ymax o.ystep 縦軸。o.dots 1本のテープの打点の間隔の数(5 か 6)。
  //   o.values: false でテープの上の数値を書かない。o.dt 1本のテープの時間(秒。初期値 0.1)
  function figTapeChart(lens, o) {
    o = o || {};
    var n = lens.length, dt = o.dt || 0.1, dots = o.dots || 5;
    return JHS.graph({
      label: o.label || "一定の時間ごとに切った記録テープを、順に並べてはった図",
      x: { min: 0, max: Math.round(n * dt * 10) / 10, step: dt, label: "時間[秒]" },
      y: { min: 0, max: o.ymax, step: o.ystep, label: "長さ[cm]" },
      series: [],
      extra: function (gs) {
        var s = "";
        lens.forEach(function (L, i) {
          var x0 = gs.X(i * dt) + 4, x1 = gs.X((i + 1) * dt) - 4, yb = gs.Y(0), yt = gs.Y(L);
          s += rect("fig-shape fig-fill", x0, yt, x1 - x0, yb - yt);
          for (var j = 0; j < dots; j++) s += circle("fig-solid", (x0 + x1) / 2, yb - (yb - yt) * (j + 0.5) / dots, 1.8);
          if (o.values !== false) s += txt((x0 + x1) / 2, yt - 5, num(L), { cls: "fig-num", anchor: "middle", halo: true });
        });
        return s;
      }
    });
  }

  // 記録テープの一部(横向き)。k は、はかる区間の打点の間隔の数。lenText は区間の長さの文字("6.0cm")
  function figTape(k, lenText) {
    var s = "", y = 76, x0 = 52, x1 = 268, sp = (x1 - x0) / k, i;
    s += rect("fig-shape fig-fill-2", 18, y - 14, 284, 28);
    for (i = -Math.floor(30 / sp); x0 + i * sp <= 300; i++) {
      var x = x0 + i * sp;
      if (x < 22 || x > 298) continue;
      s += circle("fig-solid", x, y, i >= 0 && i <= k ? 3 : 2.2);
    }
    s += seg("fig-thin", x0, y + 6, x0, y + 40) + seg("fig-thin", x1, y + 6, x1, y + 40);
    s += JHS.arrow(x0 + 2, y + 34, x1 - 2, y + 34, "fig-shape", { both: true });
    s += txt((x0 + x1) / 2, y + 56, lenText, { anchor: "middle" });
    s += txt(x0, y - 22, "A", { anchor: "middle" }) + txt(x1, y - 22, "B", { anchor: "middle" });
    return JHS.svg(320, 150, "記録タイマーで打点した記録テープ。点Aから点Bまでの長さが示されている", s);
  }

  // 速さと時間のグラフ(要点帳)。斜面を下る運動と、等速直線運動
  function figVT() {
    return JHS.graph({
      label: "斜面を下る台車と、等速直線運動をする台車の、速さと時間の関係を表したグラフ",
      x: { min: 0, max: 0.5, step: 0.1, label: "時間[秒]" },
      y: { min: 0, max: 120, step: 20, label: "速さ[cm/s]" },
      series: [
        { pts: [[0, 0], [0.1, 24], [0.2, 48], [0.3, 72], [0.4, 96], [0.5, 120]], cls: "fig-line", marker: "circle", name: "斜面を下る", nameAt: [0.38, 108] },
        { pts: [[0, 60], [0.1, 60], [0.2, 60], [0.3, 60], [0.4, 60], [0.5, 60]], cls: "fig-line-2", marker: "tri", name: "等速", nameAt: [0.5, 46] }
      ]
    });
  }

  // 等速直線運動の、移動距離と時間のグラフ(問題)。v は速さ(縦軸の単位/秒)、tmax は横軸の最大(秒)
  function figDT(v, tmax, tstep, ystep, yunit) {
    var pts = [];
    for (var t = 0; t <= tmax + 1e-9; t += tstep) pts.push([t, v * t]);
    return JHS.graph({
      label: "物体の移動距離と時間の関係を表したグラフ",
      x: { min: 0, max: tmax, step: tstep, label: "時間[秒]" },
      y: { min: 0, max: v * tmax, step: ystep, label: "距離[" + yunit + "]" },
      series: [{ pts: pts, cls: "fig-line", marker: "circle" }]
    });
  }
  // 速さと時間のグラフ(問題)。v0 は 0 秒の速さ、inc は 1目盛り(tstep 秒)ごとにふえる速さ
  function figVTq(v0, inc, tmax, tstep, ymax, ystep, yunit) {
    var pts = [];
    for (var i = 0; i * tstep <= tmax + 1e-9; i++) pts.push([Math.round(i * tstep * 10) / 10, v0 + inc * i]);
    return JHS.graph({
      label: "物体の速さと時間の関係を表したグラフ",
      x: { min: 0, max: tmax, step: tstep, label: "時間[秒]" },
      y: { min: 0, max: ymax, step: ystep, label: "速さ[" + yunit + "]" },
      series: [{ pts: pts, cls: "fig-line", marker: "circle" }]
    });
  }

  var TIMER_TABLE = JHS.table({
    caption: "記録タイマーの打点と時間",
    head: ["1秒間の打点", "1打点の時間", "0.1秒の打点"],
    rows: [
      ["50回(東日本)", JHS.frac("1", "50") + "秒", "5打点"],
      ["60回(西日本)", JHS.frac("1", "60") + "秒", "6打点"]
    ]
  });
  var ACTION_TABLE = JHS.table({
    caption: "力のつり合いと、作用・反作用",
    head: ["", "つり合う2力", "作用・反作用"],
    rows: [
      ["物体", "1つの物体にはたらく", "2つの物体の間で、たがいにはたらく"],
      ["大きさと向き", "同じ大きさ・一直線上・逆向き", "同じ大きさ・一直線上・逆向き"]
    ]
  });

  JHS.register("g3-motion", {
    points: [
      "物体の" + rule("速さ = 移動距離 ÷ かかった時間") + " です。単位は m/s(メートル毎秒)、cm/s、km/h(キロメートル毎時)などを使います。ある区間を一定の速さで動いたと考えた速さを<b>平均の速さ</b>、ごく短い時間に動いた距離から求めた速さを<b>瞬間の速さ</b>といいます(自動車のスピードメーターが示す速さ)。",
      "<b>記録タイマー</b>は、1秒間に決まった回数だけテープに打点します。東日本では 1秒間に 50回、西日本では 60回です。50回なら" + rule("5打点で 0.1秒") + "、60回なら 6打点で 0.1秒です。打点の間隔が広いほど、速さが大きいことを表します。",
      "速さが一定で、一直線上を進む運動を<b>等速直線運動</b>といいます。" + rule("移動距離は、時間に比例") + "します。物体に力がはたらいていないときや、はたらく力がつり合っているときに起こります。",
      "物体に力がはたらいていないか、力がつり合っているとき、静止している物体は静止し続け、運動している物体は等速直線運動を続けます(<b>慣性の法則</b>)。物体がもつこの性質を<b>慣性</b>といいます。",
      "斜面を下る台車には、運動の向きに、重力の斜面に平行な分力がはたらき続けるので、" + rule("速さが一定の割合で大きくなります") + "。斜面の傾きが大きいほど、速さのふえ方は大きくなります。傾きが 90° のときが、真下に落ちる<b>自由落下</b>です。運動の向きと逆向きに力がはたらくと、速さはしだいに小さくなります。",
      "物体Aが物体Bに力を加えると、同時に、BもAに力を加えます。2つの力は、" + rule("同じ大きさで、一直線上にあり、逆向き") + "です(<b>作用・反作用の法則</b>)。つり合う2力は1つの物体にはたらきますが、作用・反作用の2力は、2つの物体の間でたがいにはたらきます。"
    ],
    figures: [
      {
        html: figTapeChart([1.2, 2.4, 3.6, 4.8, 6, 7.2], { ymax: 8, ystep: 1, label: "斜面を下る台車の記録テープを 0.1秒ごとに切って並べた図。長さは 1.2cm ずつ長くなる" }),
        caption: "斜面を下る台車の記録テープを、5打点(0.1秒)ごとに切って並べた図(1秒間に50回打点)。テープの長さが一定の割合で長くなるので、速さは一定の割合で大きくなっています。"
      },
      {
        html: figTapeChart([3, 3, 3, 3, 3, 3], { ymax: 4, ystep: 1, label: "水平面を進む台車の記録テープを 0.1秒ごとに切って並べた図。長さはどれも 3cm" }),
        caption: "等速直線運動の記録テープ。0.1秒ごとのテープの長さがどれも 3cm で同じなので、速さは 3cm ÷ 0.1秒 = 30cm/s で一定です。"
      },
      {
        html: figVT(),
        caption: "速さと時間のグラフ。斜面を下る運動では、速さが時間に比例して大きくなり(実線)、等速直線運動では、速さは変わりません(破線)。"
      }
    ],
    blocks: [
      JHS.formula("速さ[m/s]", JHS.frac("移動距離[m]", "かかった時間[秒]")),
      TIMER_TABLE,
      ACTION_TABLE
    ],
    example: {
      title: "1秒間に50回打点する記録タイマーで、台車の運動を記録しました。5打点ごとに切ったテープの長さは " + cm(4.5) + " でした。この間の台車の平均の速さは何cm/sですか。",
      steps: [
        "1秒間に50回打点するので、1打点の時間は " + JHS.frac("1", "50") + "秒、5打点では 5 × " + JHS.frac("1", "50") + " = " + sec(0.1) + "です。",
        JHS.calc("4.5 cm ÷ 0.1 秒", "45 cm/s")
      ],
      result: cmps(45)
    },
    fixed: [
      {
        id: "speed-unit",
        text: "速さの単位「m/s」は、何を表していますか。",
        choices: ["1秒間に進む距離(m)", "1分間に進む距離(m)", "1m 進むのにかかる時間(秒)", "1時間に進む距離(m)"],
        answer: 0,
        explain: [
          "m/s(メートル毎秒)は、1秒間に何m進むかを表す速さの単位です。",
          "1時間に進む距離を km で表したものは km/h です。"
        ]
      },
      {
        id: "instant-speed",
        text: "自動車のスピードメーターが示している速さを何といいますか。",
        choices: ["瞬間の速さ", "平均の速さ", "等速直線運動の速さ", "最大の速さ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "スピードメーターは、その瞬間ごとの速さ(ごく短い時間に進んだ距離から求めた速さ)を示しています。",
          "平均の速さは、ある区間を一定の速さで動いたと考えて、移動距離 ÷ かかった時間で求めた速さです。"
        ]
      },
      {
        id: "timer-50",
        text: "1秒間に50回打点する記録タイマーで、5打点するのにかかる時間は何秒ですか。",
        choices: [sec(0.1), sec(0.5), sec(0.2), sec(5)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "1打点の時間は " + JHS.frac("1", "50") + "秒です。",
          JHS.calc(JHS.frac("1", "50") + " 秒 × 5", "0.1 秒")
        ],
        meta: { hz: 50, dots: 5, answer: 0.1 }
      },
      {
        id: "timer-60",
        text: "1秒間に60回打点する記録タイマー(西日本)で、0.1秒間に、打点の間隔はいくつできますか。",
        choices: ["6", "5", "10", "60"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "1秒間に60回打点するので、0.1秒間では 60 × 0.1 = 6打点です。",
          "1秒間に50回打点する記録タイマーなら、0.1秒は5打点です。"
        ],
        meta: { hz: 60, answer: 6 }
      },
      {
        id: "tape-slope",
        text: "図は、ある台車の運動を記録したテープを、0.1秒ごとに切って順に並べたものです。台車はどのような運動をしていますか。",
        figure: figTapeChart([1.5, 3, 4.5, 6, 7.5], { ymax: 8, ystep: 1, values: false, label: "0.1秒ごとに切った記録テープを、順に並べた図" }),
        choices: [
          "速さが一定の割合で大きくなる運動",
          "速さが一定の運動(等速直線運動)",
          "速さが一定の割合で小さくなる運動",
          "静止している"
        ],
        answer: 0,
        explain: [
          "0.1秒ごとのテープの長さは、0.1秒間に進んだ距離を表し、速さに比例します。",
          "テープの長さが一定の割合で長くなっているので、速さが一定の割合で大きくなっています。斜面を下る台車の運動などです。"
        ]
      },
      {
        id: "tape-uniform",
        text: "図は、水平面上を動く台車の運動を記録したテープを、0.1秒ごとに切って順に並べたものです。台車の運動を何といいますか。",
        figure: figTapeChart([2.5, 2.5, 2.5, 2.5, 2.5], { ymax: 3.5, ystep: 0.5, values: false, label: "0.1秒ごとに切った記録テープを、順に並べた図" }),
        choices: ["等速直線運動", "自由落下", "速さが大きくなる運動", "速さが小さくなる運動"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "0.1秒ごとのテープの長さがどれも同じなので、速さが一定です。",
          "一直線上を一定の速さで進む運動を、等速直線運動といいます。"
        ]
      },
      {
        id: "dt-shape",
        text: "等速直線運動をしている物体の、移動距離と時間の関係を表すグラフは、どのような形になりますか。",
        choices: [
          "原点を通る右上がりの直線",
          "横軸に平行な直線",
          "原点を通る右下がりの直線",
          "しだいに傾きが大きくなる曲線"
        ],
        answer: 0,
        explain: [
          "等速直線運動では、移動距離は時間に比例するので、原点を通る直線になります。",
          "横軸に平行な直線になるのは、等速直線運動の「速さと時間」のグラフです。"
        ]
      },
      {
        id: "inertia-bus",
        text: "止まっていたバスが急に発進すると、立っている乗客は、バスの進む向きと逆の向き(後ろ)にたおれそうになります。この理由として正しいものはどれですか。",
        choices: [
          "乗客のからだは、慣性によってその場に静止し続けようとするから",
          "バスが乗客を後ろ向きに押すから",
          "乗客のからだに、後ろ向きの重力がはたらくから",
          "作用・反作用で、乗客がバスを押すから"
        ],
        answer: 0,
        explain: [
          "物体には、静止している物体は静止し続けようとする性質(慣性)があります。",
          "バスが前に動き出しても、乗客のからだはその場にとどまろうとするので、バスに対して後ろにたおれそうになります。"
        ]
      },
      {
        id: "inertia-law",
        text: "なめらかな水平面の上で運動している物体に、運動の向きの力がはたらかず、摩擦もないとき、物体はどのような運動をしますか。",
        choices: [
          "等速直線運動を続ける",
          "しだいに速さが小さくなり、止まる",
          "しだいに速さが大きくなる",
          "すぐに止まる"
        ],
        answer: 0,
        explain: [
          "物体に力がはたらいていないか、力がつり合っているとき、運動している物体は等速直線運動を続けます(慣性の法則)。",
          "実際に物体が止まるのは、摩擦力や空気の抵抗が、運動と逆向きにはたらくからです。"
        ]
      },
      {
        id: "slope-steeper-motion",
        text: "台車が斜面を下る運動で、斜面の傾きを大きくすると、台車の速さのふえ方はどうなりますか。",
        choices: ["大きくなる", "小さくなる", "変わらない", "速さがふえなくなる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "斜面の傾きが大きいほど、運動の向きにはたらく力(重力の斜面に平行な分力)が大きくなります。",
          "そのため、速さのふえ方も大きくなります。傾きが 90° のときが自由落下です。"
        ]
      },
      {
        id: "slope-force-const",
        text: "斜面を下っている台車にはたらく、運動の向きの力(重力の斜面に平行な分力)の大きさは、台車が斜面を下るにつれてどうなりますか。摩擦は考えないものとします。",
        choices: ["一定で変わらない", "しだいに大きくなる", "しだいに小さくなる", "0 になる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "同じ斜面の上では、重力の斜面に平行な分力の大きさは、どの位置でも同じです。",
          "一定の大きさの力が運動の向きにはたらき続けるので、速さが一定の割合で大きくなります。速さが大きくなっても、力が大きくなるわけではありません。"
        ]
      },
      {
        id: "slope-up",
        text: "斜面の下から上向きに台車を押し出すと、台車は斜面を上っていきました。手をはなしたあとの台車の速さはどうなりますか。摩擦は考えないものとします。",
        choices: ["しだいに小さくなる", "しだいに大きくなる", "一定のまま", "すぐに 0 になる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "斜面を上る台車には、重力の斜面に平行な分力が、運動の向きと逆向き(斜面の下向き)にはたらきます。",
          "運動の向きと逆向きに力がはたらき続けるので、速さはしだいに小さくなります。"
        ]
      },
      {
        id: "action-pair",
        text: "机の上に本が置いてあります。次の力の組のうち、<b>作用・反作用</b>の関係にあるものはどれですか。",
        choices: [
          "本が机を押す力と、机が本を押す力",
          "本にはたらく重力と、机が本を押す力",
          "本にはたらく重力と、本が机を押す力",
          "机にはたらく重力と、本にはたらく重力"
        ],
        answer: 0,
        explain: [
          "作用・反作用の2力は、2つの物体(本と机)の間で、たがいにはたらき合う力です。「本が机を押す力」と「机が本を押す力」がこれにあたります。",
          "「本にはたらく重力」と「机が本を押す力」は、どちらも本という1つの物体にはたらく力で、つり合いの関係です。"
        ]
      },
      {
        id: "action-collision",
        text: "大型のトラックと小型の自動車が正面からぶつかりました。ぶつかったときに、トラックが自動車から受ける力と、自動車がトラックから受ける力の大きさについて、正しいものはどれですか。",
        choices: [
          "どちらも同じ大きさ",
          "自動車がトラックから受ける力のほうが大きい",
          "トラックが自動車から受ける力のほうが大きい",
          "速く動いていたほうが受ける力が大きい"
        ],
        answer: 0,
        explain: [
          "2つの物体の間ではたらき合う力は、作用・反作用の関係にあり、いつも同じ大きさで逆向きです。",
          "受ける力の大きさは同じで、こわれ方のちがいは、車体のじょうぶさなど、物体のちがいによるものです。"
        ]
      }
    ],
    generators: [
      {
        id: "speed",
        label: "速さの計算と、単位の換算(m/s・km/h・cm/s)",
        make: retry(function () {
          var kind = JHS.pick(["v", "v", "kmh-ms", "ms-kmh", "cm", "dist"]);
          var c, text, explain, ans, meta;
          if (kind === "v") {
            var v = JHS.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]), t = JHS.pick([4, 5, 8, 10, 12, 20, 25, 40, 50]);
            var d = v * t;
            if (d > 1000) return null;
            c = JHS.choices4(mps(v), onlyNice([d * t, t / d, v * 60, v / 10, v * 3.6]).map(mps));
            // 人が走る速さは 8m/s まで。それより速いときは自動車にする
            var who = v <= 8 ? "ある人" : "自動車";
            text = who + "が、" + m(d) + " の道のりを " + sec(t) + "間で走りました。このときの平均の速さは何m/sですか。";
            explain = ["速さは、移動距離をかかった時間で割って求めます。", JHS.calc(d + " m ÷ " + t + " 秒", v + " m/s"), "時間を距離で割らないように注意します。"];
            ans = v; meta = { kind: kind, who: who, distance: d, seconds: t, answer: ans };
          } else if (kind === "kmh-ms") {
            var ms = JHS.pick([5, 10, 15, 20, 25, 30]), kh = ms * 3.6;
            c = JHS.choices4(mps(ms), onlyNice([kh / 60, kh * 3.6, kh * 1000 / 60, kh / 360]).map(mps));
            text = "時速 " + kmh(kh) + " は、秒速何m(何m/s)ですか。";
            explain = [
              kmh(kh) + " は、1時間(" + sec(3600) + ")に " + q(kh * 1000, "m") + " 進む速さです。",
              JHS.calc(kh * 1000 + " m ÷ 3600 秒", ms + " m/s"),
              "km/h の値を 3.6 で割っても求められます。60 で割るだけでは、1分間に進む距離(km)になってしまいます。"
            ];
            ans = ms; meta = { kind: kind, kmh: kh, answer: ans };
          } else if (kind === "ms-kmh") {
            var ms2 = JHS.pick([5, 10, 15, 20, 25, 30]), kh2 = ms2 * 3.6;
            c = JHS.choices4(kmh(kh2), onlyNice([ms2 * 60, ms2 / 3.6, ms2 * 3600, ms2 * 60 / 1000]).map(kmh));
            text = "秒速 " + mps(ms2) + " は、時速何km(何km/h)ですか。";
            explain = [
              "1時間は " + sec(3600) + "なので、1時間に進む距離は " + ms2 + " × 3600 = " + q(ms2 * 3600, "m") + " です。",
              JHS.calc(ms2 * 3600 + " m ÷ 1000", num(kh2) + " km"),
              "m/s の値に 3.6 をかけても求められます。"
            ];
            ans = kh2; meta = { kind: kind, ms: ms2, answer: ans };
          } else if (kind === "cm") {
            var vc = JHS.pick([20, 30, 40, 45, 50, 60, 75, 80, 90, 120, 150]), t10 = JHS.pick([2, 4, 5]), dc = vc * t10 / 10;
            var toM = Math.random() < 0.4;
            if (toM) {
              c = JHS.choices4(mps(vc / 100), onlyNice([vc, vc / 10, vc / 1000, dc / 100]).map(mps));
              text = "台車が、" + sec(t10 / 10) + "間に " + cm(dc) + " 進みました。この間の台車の平均の速さは何m/sですか。";
              explain = [JHS.calc(num(dc) + " cm ÷ " + num(t10 / 10) + " 秒", vc + " cm/s"), "1m = 100cm なので、100 で割って m/s になおします。", JHS.calc(vc + " ÷ 100", num(vc / 100))];
              ans = vc / 100;
            } else {
              c = JHS.choices4(cmps(vc), onlyNice([dc * t10 / 10, dc, vc / 10, vc * 10]).map(cmps));
              text = "台車が、" + sec(t10 / 10) + "間に " + cm(dc) + " 進みました。この間の台車の平均の速さは何cm/sですか。";
              explain = ["速さは、移動距離をかかった時間で割って求めます。", JHS.calc(num(dc) + " cm ÷ " + num(t10 / 10) + " 秒", vc + " cm/s")];
              ans = vc;
            }
            meta = { kind: kind, cm: dc, seconds: t10 / 10, toM: toM, answer: ans };
          } else {
            var vk = JHS.pick([4, 6, 12, 15, 18, 20, 30, 40, 60]), mins = JHS.pick([10, 15, 20, 30, 40, 45, 90]);
            var km = vk * mins / 60;
            if (!nice(km) || Math.abs(km * 10 - Math.round(km * 10)) > 1e-9) return null;
            c = JHS.choices4(q(km, "km"), onlyNice([vk * mins, vk / mins * 60, km * 10, vk * mins / 100]).map(function (v2) { return q(v2, "km"); }));
            text = "時速 " + kmh(vk) + " の一定の速さで、" + q(mins, "分") + "間進みました。進んだ距離は何kmですか。";
            explain = [
              "km/h の速さを使うときは、時間を「時間」の単位になおします。" + q(mins, "分") + "は " + JHS.frac(String(mins), "60") + " 時間です。",
              JHS.calc(vk + " km/h × " + mins + " ÷ 60", num(km) + " km"),
              "分のまま " + vk + " × " + mins + " と計算しないように注意します。"
            ];
            ans = km; meta = { kind: kind, kmh: vk, minutes: mins, answer: ans };
          }
          if (!c) return null;
          return { text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain, meta: meta };
        })
      },
      {
        id: "tape-speed",
        label: "記録テープの長さから、平均の速さを求める(1秒間に50回・60回)",
        make: retry(function () {
          var hz = JHS.pick([50, 60]);
          var k = hz === 50 ? JHS.pick([5, 5, 10]) : JHS.pick([6, 6, 12, 3]);
          var t = k / hz, v = JHS.pick([15, 20, 24, 25, 30, 36, 40, 45, 50, 60, 72, 75, 80, 90, 100, 120]);
          var L = Math.round(v * t * 100) / 100;
          if (Math.abs(L * 10 - Math.round(L * 10)) > 1e-9 || L < 0.6 || L > 20) return null;
          var other = hz === 50 ? 60 : 50, tWrong = k / other;
          var wr = [L / tWrong, L * hz, L / k, L * 10, v * 2, v / 2];
          var c = JHS.choices4(cmps(v), wr.filter(function (w) { return nice(w) && Math.abs(w * 10 - Math.round(w * 10)) < 1e-9; }).map(cmps));
          if (!c) return null;
          var tText = num(t) + " 秒";
          var tStep = JHS.frac("1", String(hz)) + " 秒 × " + k + " = " + sec(num(t));
          return {
            text: "1秒間に" + hz + "回打点する記録タイマーで、台車の運動を記録しました。図のテープの点Aから点Bまでには、打点の間隔が " + k + " 個あり、長さは " + cm(L) + " でした。点Aから点Bまでの台車の平均の速さは何cm/sですか。",
            figure: figTape(k, num(L) + "cm"),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "1秒間に" + hz + "回打点するので、打点の間隔1個分の時間は " + JHS.frac("1", String(hz)) + "秒です。間隔 " + k + " 個分の時間は、" + tStep + "です。",
              JHS.calc(num(L) + " cm ÷ " + tText, v + " cm/s")
            ],
            meta: { hz: hz, intervals: k, seconds: t, cm: L, answer: v }
          };
        })
      },
      {
        id: "tape-growth",
        label: "0.1秒ごとに切ったテープの長さのふえ方",
        make: retry(function () {
          var hz = JHS.pick([50, 60]), dots = hz === 50 ? 5 : 6;
          var d10v = JHS.pick([4, 5, 6, 8, 10, 12, 15]), a10 = JHS.pick([0, 0, 4, 5, 6, 8, 10]);
          var n = 5, lens = [];
          for (var i = 0; i < n; i++) lens.push((a10 + d10v * (i + (a10 ? 0 : 1))) / 10);
          if (lens[0] < 1) return null;
          var top = lens[n - 1];
          var ystep = top <= 4 ? 0.5 : top <= 10 ? 1 : 2, ymax = Math.ceil((top + d10v / 10 * 0.6) / ystep) * ystep;
          var kind = JHS.pick(["next", "speed", "inc"]);
          var dcm = d10v / 10, c, text, explain, ans;
          var lead = "1秒間に" + hz + "回打点する記録タイマーで、斜面を下る台車の運動を記録しました。図は、そのテープを " + dots + "打点(" + sec(0.1) + ")ごとに切って、順に並べたものです。";
          if (kind === "next") {
            var nx = Math.round((top + dcm) * 10) / 10;
            c = JHS.choices4(cm(nx), onlyNice([top, top + dcm * 2, top * 2, top + 1 === nx ? top + 0.5 : top + 1]).map(cm));
            text = lead + "このまま斜面を下り続けたとすると、次の 0.1秒間のテープの長さは何cmになると考えられますか。";
            explain = ["0.1秒ごとのテープの長さは、" + cm(dcm) + " ずつ長くなっています(速さが一定の割合で大きくなる)。", JHS.calc(num(top) + " cm + " + num(dcm) + " cm", num(nx) + " cm")];
            ans = nx;
          } else if (kind === "speed") {
            var j = JHS.randInt(1, n), Lj = lens[j - 1], vj = Math.round(Lj * 100) / 10;
            c = JHS.choices4(cmps(vj), onlyNice([Lj, Lj * hz, Lj * 100, Math.round(Lj / (dots / (hz === 50 ? 60 : 50)) * 10) / 10]).map(cmps));
            text = lead + "左から " + j + "本目のテープを記録した 0.1秒間の、台車の平均の速さは何cm/sですか。";
            explain = ["左から " + j + "本目のテープの長さは " + cm(Lj) + " で、これは 0.1秒間に進んだ距離です。", JHS.calc(num(Lj) + " cm ÷ 0.1 秒", num(vj) + " cm/s")];
            ans = vj;
          } else {
            var inc = d10v;   // cm/s(dcm ÷ 0.1)
            c = JHS.choices4(cmps(inc), onlyNice([dcm, inc * 10, top * 10, inc / 2]).map(cmps));
            text = lead + "0.1秒ごとの平均の速さは、0.1秒ごとに何cm/sずつ大きくなっていますか。";
            explain = [
              "テープは 0.1秒ごとに " + cm(dcm) + " ずつ長くなっています。",
              "0.1秒間の平均の速さは、テープの長さ ÷ 0.1秒 なので、速さのふえ方も " + num(dcm) + " ÷ 0.1 = " + cmps(inc) + " ずつです。"
            ];
            ans = inc;
          }
          if (!c) return null;
          return {
            text: text,
            figure: figTapeChart(lens, { ymax: ymax, ystep: ystep, dots: dots, label: "0.1秒ごとに切った記録テープを、順に並べた図。それぞれの長さが書いてある" }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, hz: hz, lens: lens, increase: dcm, answer: ans }
          };
        })
      },
      {
        id: "motion-graph",
        label: "速さと時間・移動距離と時間のグラフを読む",
        make: retry(function () {
          var kind = JHS.pick(["dt-speed", "dt-later", "vt-dist", "vt-slope"]);
          var c, text, explain, ans, figure, meta;
          if (kind === "dt-speed" || kind === "dt-later") {
            var unit = JHS.pick(["cm", "m"]), v = unit === "cm" ? JHS.pick([5, 10, 15, 20, 30, 40, 50]) : JHS.pick([2, 3, 4, 5, 6, 8, 10]);
            var tmax = JHS.pick([4, 5]), ystep = v;
            figure = figDT(v, tmax, 1, ystep, unit);
            var su = unit + "/s";
            if (kind === "dt-speed") {
              c = JHS.choices4(q(v, su), onlyNice([v * tmax, v * tmax * tmax, tmax / v / tmax, v * 2, v / 2]).map(function (w) { return q(w, su); }));
              text = "グラフは、一直線上を動く物体の、移動距離と時間の関係を表しています。この物体の速さは何" + su + "ですか。";
              explain = [
                "グラフは原点を通る直線なので、物体は等速直線運動をしています。",
                "グラフから、" + sec(tmax) + "間に " + q(v * tmax, unit) + " 進んでいます。",
                JHS.calc(v * tmax + " " + unit + " ÷ " + tmax + " 秒", v + " " + su)
              ];
              ans = v;
            } else {
              var T2 = JHS.pick([8, 10, 12, 15, 20]);
              c = JHS.choices4(q(v * T2, unit), onlyNice([v * tmax, v * T2 * 2, v + T2, v * (T2 - tmax)]).map(function (w) { return q(w, unit); }));
              text = "グラフは、一直線上を動く物体の、移動距離と時間の関係を表しています。この物体が同じ運動を続けると、動き始めてから " + sec(T2) + "間に進む距離は何" + unit + "ですか。";
              explain = [
                "グラフは原点を通る直線なので、移動距離は時間に比例します(等速直線運動)。",
                "グラフから、速さは " + v * tmax + " ÷ " + tmax + " = " + q(v, su) + " です。",
                JHS.calc(v + " " + su + " × " + T2 + " 秒", v * T2 + " " + unit)
              ];
              ans = v * T2;
            }
            meta = { kind: kind, speed: v, unit: unit, tmax: tmax, answer: ans };
          } else if (kind === "vt-dist") {
            var vv = JHS.pick([10, 20, 30, 40, 50, 60, 80]), tt = JHS.pick([2, 3, 4, 5]);
            var ymaxv = vv <= 40 ? 50 : 100, ys = ymaxv === 50 ? 10 : 20;
            if (vv % ys !== 0) return null;
            figure = JHS.graph({
              label: "物体の速さと時間の関係を表したグラフ",
              x: { min: 0, max: 5, step: 1, label: "時間[秒]" },
              y: { min: 0, max: ymaxv, step: ys, label: "速さ[cm/s]" },
              series: [{ pts: [[0, vv], [1, vv], [2, vv], [3, vv], [4, vv], [5, vv]], cls: "fig-line", marker: "circle" }]
            });
            c = JHS.choices4(cm(vv * tt), onlyNice([vv, vv / tt, vv * tt * 2, vv * 5]).map(cm));
            text = "グラフは、一直線上を動く台車の、速さと時間の関係を表しています。0秒から " + sec(tt) + "までに、台車が進んだ距離は何cmですか。";
            explain = [
              "グラフから、台車は " + cmps(vv) + " の一定の速さで動いています(等速直線運動)。",
              JHS.calc(vv + " cm/s × " + tt + " 秒", vv * tt + " cm"),
              "速さの値を、そのまま距離としないように注意します。"
            ];
            ans = vv * tt;
            meta = { kind: kind, speed: vv, seconds: tt, answer: ans };
          } else {
            var inc = JHS.pick([10, 20, 30, 40]), tk = JHS.randInt(2, 5), ymax2 = inc * 5;
            var ystp = inc;
            figure = figVTq(0, inc, 0.5, 0.1, ymax2, ystp, "cm/s");
            var vk = inc * tk;
            c = JHS.choices4(cmps(vk), onlyNice([inc, inc * (tk + 1), inc * (tk - 1), vk * 2]).map(cmps));
            text = "グラフは、斜面を下る台車の、速さと時間の関係を表しています。台車が動き始めてから " + sec(tk / 10) + "後の速さは何cm/sですか。";
            explain = [
              "グラフは原点を通る直線で、速さは 0.1秒ごとに " + cmps(inc) + " ずつ大きくなっています。",
              JHS.calc(inc + " cm/s × " + tk, vk + " cm/s"),
              "横軸で " + num(tk / 10) + "秒の点を読みます。"
            ];
            ans = vk;
            meta = { kind: kind, inc: inc, seconds: tk / 10, answer: ans };
          }
          if (!c) return null;
          return { text: text, figure: figure, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain, meta: meta };
        })
      }
    ]
  });

  // =====================================================================
  // 3-12 仕事と仕事率
  // =====================================================================
  // 直接持ち上げる(左)と、動滑車を使う(右)。o.w おもりの重力、o.f1 o.f2 引く力、o.h o.d 上げる高さ・引く距離(文字)
  //   o.single: true で右のコマ(動滑車)だけを大きく描く
  function figPulley(o) {
    o = o || {};
    var s = "";
    function hatch(x0, x1) { return '<rect x="' + P(x0) + '" y="12" width="' + P(x1 - x0) + '" height="8" fill="url(#sci-pat-hatch)"/>' + seg("fig-shape", x0, 20, x1, 20); }
    function weight(cx, y, label) { return rect("fig-shape fig-fill-2", cx - 20, y, 40, 30) + (label ? txt(cx, y + 20, label, { anchor: "middle" }) : ""); }
    function direct(cx) {
      var h = seg("fig-shape", cx, 66, cx, 130) + weight(cx, 130, o.w);
      h += forceArrow(cx, 96, cx, 36, false) + txt(cx + 10, 56, o.f1 || "", { halo: true });
      h += txt(cx, 190, "直接", { cls: "fig-small", anchor: "middle" });
      if (o.h) h += txt(cx, 208, o.h + " 上げる", { cls: "fig-small", anchor: "middle" });
      return h;
    }
    function moving(cx) {
      var r = 18, py = 104, h = hatch(cx - 44, cx - 6);
      h += seg("fig-shape", cx - r, 20, cx - r, py) + seg("fig-shape", cx + r, py, cx + r, 50);
      h += path("fig-shape", "M" + P(cx - r) + " " + py + "A" + r + " " + r + " 0 0 0 " + P(cx + r) + " " + py);
      h += circle("fig-shape fig-fill-0", cx, py, r) + circle("fig-solid", cx, py, 3);
      h += seg("fig-shape", cx, py, cx, 130) + weight(cx, 130, o.w);
      h += forceArrow(cx + r, 80, cx + r, 36, false) + txt(cx + r + 10, 56, o.f2 || "", { halo: true });
      h += txt(cx, 190, "動滑車", { cls: "fig-small", anchor: "middle" });
      if (o.d) h += txt(cx, 208, o.d + " 引く", { cls: "fig-small", anchor: "middle" });
      return h;
    }
    if (o.single) {
      s += moving(160);
      return JHS.svg(320, 220, "動滑車を使って、おもりを引き上げるようすの図", s);
    }
    s += direct(80) + moving(230);
    return JHS.svg(320, 220, "おもりを直接持ち上げる場合と、動滑車を使って引き上げる場合の図", s);
  }

  // 斜面にそって物体を引き上げる図。L 斜面の長さ・h 高さ(どちらも m。図の形はこの比で描く)。o.f 引く力の文字
  function figIncline(L, h, o) {
    o = o || {};
    var s = "", run = Math.sqrt(L * L - h * h), k = Math.min(200 / run, 120 / h);
    var x0 = 40, yb = 168, x1 = x0 + run * k, yt = yb - h * k;
    s += poly("fig-shape fig-fill-2", [[x0, yb], [x1, yb], [x1, yt]]);
    var ux = run / L, uy = -h / L, nx = uy, ny = -ux;   // 斜面を上る向き u、斜面から外へ向かう法線 n
    var t = 0.3, Sx = x0 + (x1 - x0) * t, Sy = yb + (yt - yb) * t;
    var bw = 18, bh = 12, C = [Sx + nx * bh, Sy + ny * bh];
    s += poly("fig-shape fig-fill-0", [[-bw, -bh], [bw, -bh], [bw, bh], [-bw, bh]].map(function (p) {
      return [C[0] + ux * p[0] + nx * p[1], C[1] + uy * p[0] + ny * p[1]];
    }));
    s += forceArrow(C[0] + ux * bw, C[1] + uy * bw, C[0] + ux * (bw + 54), C[1] + uy * (bw + 54), true);
    if (o.f) s += txt(C[0] + ux * (bw + 40) + nx * 16, C[1] + uy * (bw + 40) + ny * 16, o.f, { halo: true });
    // 長さと高さ
    s += txt(x0 + (x1 - x0) * 0.72 - nx * 18, yb + (yt - yb) * 0.72 - ny * 18 + 4, o.L || "", { anchor: "middle", halo: true });
    s += seg("fig-thin", x1 + 6, yt, x1 + 22, yt) + seg("fig-thin", x1 + 6, yb, x1 + 22, yb);
    s += JHS.arrow(x1 + 16, yt + 2, x1 + 16, yb - 2, "fig-thin", { both: true });
    s += txt(x1 + 22, (yt + yb) / 2 + 4, o.h || "");
    return JHS.svg(320, 200, "斜面にそって、物体を引き上げるようすの図", s);
  }

  var TOOL_TABLE = JHS.table({
    caption: "道具を使ったときの力と距離(仕事の原理)",
    head: ["道具", "必要な力", "動かす距離"],
    rows: [
      ["動滑車", "直接の半分", "直接の2倍"],
      ["斜面", "直接より小さい", "斜面の長さ(高さより長い)"],
      ["てこ", "支点から遠いほど小さい", "力が小さいほど長い"],
      ["定滑車", "直接と同じ", "直接と同じ(向きだけ変わる)"]
    ]
  });

  JHS.register("g3-work-power", {
    points: [
      "物体に力を加えて、" + rule("力の向きに物体を動かしたとき") + "、力は物体に<b>仕事</b>をしたといいます。" + rule("仕事[J] = 力の大きさ[N] × 力の向きに動いた距離[m]") + " で、単位は<b>ジュール(J)</b>です。",
      "力を加えても物体が動かないときや、物体が" + rule("力と垂直な向きに動いたとき") + "は、その力がした仕事は 0 です。荷物を持ったまま水平に歩くとき、荷物を支える上向きの力は仕事をしていません。",
      "物体を持ち上げる仕事は、" + rule("物体にはたらく重力の大きさ × 持ち上げた高さ") + " です。床の上で物体を一定の速さで引くときは、引く力は摩擦力と同じ大きさなので、仕事は 摩擦力 × 動かした距離 です。",
      "動滑車・斜面・てこなどの道具を使うと、加える力は小さくできますが、力を加えて動かす距離が長くなり、" + rule("仕事の大きさは、道具を使わないときと変わりません") + "(<b>仕事の原理</b>)。動滑車では、" + rule("力は半分、ひもを引く距離は2倍") + "です。",
      "1秒間あたりにする仕事を<b>仕事率</b>といい、" + rule("仕事率[W] = 仕事[J] ÷ 仕事にかかった時間[秒]") + " です。単位は<b>ワット(W)</b>で、電力と同じ単位です。"
    ],
    figures: [
      {
        html: figPulley({ w: "6N", f1: "6N", f2: "3N", h: "0.2m", d: "0.4m" }),
        caption: "重力 6N のおもりを 0.2m 上げるとき、直接なら 6N の力で 0.2m 引き上げます。動滑車を使うと、力は半分の 3N ですが、ひもを 2倍の 0.4m 引きます。仕事はどちらも 1.2J です(滑車とひもの重さ、摩擦は考えない)。"
      },
      {
        html: figIncline(1.2, 0.6, { f: "5N", L: "1.2m", h: "0.6m" }),
        caption: "重力 10N の物体を、長さ 1.2m の斜面にそって高さ 0.6m まで引き上げる例。直接持ち上げる仕事は 10N × 0.6m = 6J です。斜面を使うと、引く力は 6J ÷ 1.2m = 5N ですみます(摩擦は考えない)。"
      }
    ],
    blocks: [
      JHS.formula("仕事[J]", "力の大きさ[N] × 力の向きに動いた距離[m]"),
      JHS.formula("仕事率[W]", JHS.frac("仕事[J]", "かかった時間[秒]")),
      TOOL_TABLE
    ],
    example: {
      title: "質量 " + g(2000) + " の物体を、" + q(50, "cm") + " の高さまで、" + sec(4) + "かけて一定の速さで持ち上げました。このときの仕事は何Jですか。また、仕事率は何Wですか。" + g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。",
      steps: [
        "物体にはたらく重力は " + N(20) + " で、" + cm(50) + " は " + m(0.5) + " です。",
        JHS.calc("20 N × 0.5 m", "10 J"),
        "仕事率は、仕事をかかった時間で割って求めます。",
        JHS.calc("10 J ÷ 4 秒", "2.5 W")
      ],
      result: J(10) + "、" + W(2.5)
    },
    fixed: [
      {
        id: "work-unit",
        text: "仕事の大きさを表す単位はどれですか。",
        choices: ["J(ジュール)", "W(ワット)", "N(ニュートン)", "Pa(パスカル)"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "仕事の単位はジュール(J)です。1N の力で、力の向きに 1m 動かしたときの仕事が 1J です。",
          "W は仕事率(や電力)、N は力、Pa は圧力の単位です。"
        ]
      },
      {
        id: "work-zero",
        text: "次のうち、下線の力が物体に対して仕事を<b>していない</b>ものはどれですか。",
        choices: [
          "荷物を持ったまま、水平な廊下を歩くときの、<u>荷物を支える力</u>",
          "荷物を床から机の上まで持ち上げるときの、<u>荷物を持ち上げる力</u>",
          "床の上の箱を、押して動かすときの、<u>箱を押す力</u>",
          "ばねばかりで物体を引いて、床の上をすべらせるときの、<u>引く力</u>"
        ],
        answer: 0,
        explain: [
          "荷物を支える力は上向きですが、荷物は水平に動いていて、力の向き(上向き)には動いていません。そのため、この力がした仕事は 0 です。",
          "ほかの3つは、力の向きに物体が動いているので、仕事をしています。"
        ]
      },
      {
        id: "work-lift",
        text: "質量 " + g(500) + " の物体を、床から " + m(1.2) + " の高さまで、ゆっくり一定の速さで持ち上げました。このときの仕事は何Jですか。" + g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。",
        choices: [J(6), J(600), J(0.6), J(60)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "物体にはたらく重力は " + N(5) + " なので、" + N(5) + " の力で " + m(1.2) + " 持ち上げます。",
          JHS.calc("5 N × 1.2 m", "6 J"),
          "質量の数値(500)をそのまま力にしないように注意します。"
        ],
        meta: { mass: 500, height: 1.2, answer: 6 }
      },
      {
        id: "work-friction",
        text: "水平な床の上の箱を、ばねばかりで水平に引いて、一定の速さで " + m(3) + " 動かしました。このとき、ばねばかりは " + N(4) + " を示していました。引く力がした仕事は何Jですか。",
        choices: [J(12), J(7), J(0.75), J(4)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "一定の速さで動いているので、引く力(" + N(4) + ")は摩擦力とつり合っています。",
          JHS.calc("4 N × 3 m", "12 J")
        ],
        meta: { force: 4, distance: 3, answer: 12 }
      },
      {
        id: "principle",
        text: "道具を使って物体を同じ高さまで持ち上げるときの「仕事の原理」として、正しいものはどれですか。",
        choices: [
          "道具を使っても使わなくても、仕事の大きさは変わらない",
          "道具を使うと、力も距離も小さくなり、仕事が小さくなる",
          "道具を使うと、力は小さくなり、仕事も小さくなる",
          "道具を使うと、動かす距離が長くなり、仕事が大きくなる"
        ],
        answer: 0,
        explain: [
          "動滑車や斜面などの道具を使うと、力は小さくなりますが、そのぶん力を加えて動かす距離が長くなります。",
          "力 × 距離 で求める仕事の大きさは、道具を使わないときと同じです(道具の重さや摩擦を考えない場合)。"
        ]
      },
      {
        id: "pulley-fig",
        text: "図のように、動滑車を使っておもりを引き上げます。直接持ち上げるときと比べて、ひもを引く力と、ひもを引く距離はどうなりますか。滑車とひもの重さ、摩擦は考えないものとします。",
        figure: figPulley({ single: true }),
        choices: [
          "力は半分になり、引く距離は2倍になる",
          "力は2倍になり、引く距離は半分になる",
          "力は半分になり、引く距離は変わらない",
          "力も引く距離も変わらない"
        ],
        answer: 0,
        explain: [
          "動滑車では、おもりを2本のひもで支えるので、ひもを引く力は、おもりの重力の半分ですみます。",
          "そのかわり、おもりを上げる高さの2倍の長さのひもを引く必要があります。仕事(力 × 距離)は、直接持ち上げるときと同じです。"
        ]
      },
      {
        id: "pulley-calc",
        text: "動滑車を使って、重力 " + N(20) + " のおもりを " + m(0.5) + " 引き上げます。ひもを引く力は何Nで、ひもを何m引けばよいですか。滑車とひもの重さ、摩擦は考えないものとします。",
        choices: ["10N の力で 1m 引く", "20N の力で 0.5m 引く", "10N の力で 0.5m 引く", "40N の力で 0.25m 引く"],
        answer: 0,
        explain: [
          "動滑車では、力は半分の " + N(10) + "、ひもを引く距離は2倍の " + m(1) + " です。",
          "仕事は 10N × 1m = 10J で、直接持ち上げる仕事 20N × 0.5m = 10J と同じです(仕事の原理)。"
        ],
        meta: { weight: 20, height: 0.5, force: 10, pull: 1 }
      },
      {
        id: "fixed-pulley",
        text: "定滑車を使っておもりを引き上げるとき、ひもを引く力と、直接持ち上げるときの力の関係として、正しいものはどれですか。滑車とひもの重さ、摩擦は考えないものとします。",
        choices: [
          "力の大きさは同じで、力の向きを変えられる",
          "力の大きさが半分になる",
          "力の大きさが2倍になる",
          "力の大きさが半分になり、向きも変えられる"
        ],
        answer: 0,
        explain: [
          "定滑車は、ひもを引く力の向きを変えるはたらきをします。力の大きさと、ひもを引く距離は、直接持ち上げるときと同じです。",
          "力が半分になるのは、動滑車を使うときです。"
        ]
      },
      {
        id: "incline-fig",
        text: "図のように、重力 " + N(30) + " の物体を、長さ " + m(1.5) + " の斜面にそって、高さ " + m(0.5) + " まで引き上げます。斜面にそって引く力は何Nですか。摩擦は考えないものとします。",
        figure: figIncline(1.5, 0.5, { f: "?", L: "1.5m", h: "0.5m" }),
        choices: [N(10), N(30), N(15), N(90)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "直接持ち上げる仕事は、次のとおりです。",
              JHS.calc("30 N × 0.5 m", "15 J"),
          "仕事の原理より、斜面にそって 1.5m 引く仕事も 15J なので、",
          JHS.calc("15 J ÷ 1.5 m", "10 N")
        ],
        meta: { weight: 30, length: 1.5, height: 0.5, answer: 10 }
      },
      {
        id: "power-def",
        text: "1秒間あたりにする仕事を何といいますか。また、その単位は何ですか。",
        choices: ["仕事率、単位は W", "仕事、単位は J", "仕事率、単位は J", "電力量、単位は Wh"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "1秒間あたりにする仕事を仕事率といい、単位はワット(W)です。1秒間に 1J の仕事をするときの仕事率が 1W です。",
          "J は仕事そのものの単位です。"
        ]
      },
      {
        id: "power-calc",
        text: "ある人が、" + J(600) + " の仕事を " + sec(20) + "かけて行いました。このときの仕事率は何Wですか。",
        choices: [W(30), W(12000), W(580), W(0.03)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "仕事率は、仕事をかかった時間で割って求めます。",
          JHS.calc("600 J ÷ 20 秒", "30 W")
        ],
        meta: { work: 600, seconds: 20, answer: 30 }
      },
      {
        id: "power-compare",
        text: "Aさんは " + J(1200) + " の仕事を " + sec(40) + "で、Bさんは " + J(1000) + " の仕事を " + sec(25) + "で行いました。仕事率が大きいのはどちらですか。",
        choices: ["Bさん(仕事率 40W)", "Aさん(仕事率 30W)", "Aさん(仕事が大きいから)", "どちらも同じ"],
        answer: 0,
        explain: [
          "Aさんの仕事率は 1200J ÷ 40秒 = 30W、Bさんは 1000J ÷ 25秒 = 40W です。",
          "仕事率は、仕事の大きさだけでなく、かかった時間も考えて比べます。"
        ],
        meta: { a: 30, b: 40 }
      },
      {
        id: "lever",
        text: "てこを使って重い物体を持ち上げるとき、支点から遠いところを押すと、小さな力で持ち上げられます。このとき、押す距離と仕事について正しいものはどれですか。",
        choices: [
          "押す距離は長くなり、仕事の大きさは直接持ち上げるときと同じ",
          "押す距離は短くなり、仕事の大きさは小さくなる",
          "押す距離は変わらず、仕事の大きさは小さくなる",
          "押す距離は長くなり、仕事の大きさは大きくなる"
        ],
        answer: 0,
        explain: [
          "てこでも仕事の原理が成り立ちます。小さな力ですむかわりに、押す距離が長くなります。",
          "力 × 距離 で求める仕事の大きさは、直接持ち上げるときと変わりません(てこの重さや摩擦を考えない場合)。"
        ]
      },
      {
        id: "work-cm",
        text: "重力 " + N(8) + " の物体を、" + cm(30) + " の高さまで持ち上げました。このときの仕事は何Jですか。",
        choices: [J(2.4), J(240), J(24), J(38)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "仕事を J で求めるときは、距離を m で表します。" + cm(30) + " = " + m(0.3) + " です。",
          JHS.calc("8 N × 0.3 m", "2.4 J"),
          "cm のまま 8 × 30 と計算すると、100倍の値になってしまいます。"
        ],
        meta: { force: 8, cm: 30, answer: 2.4 }
      }
    ],
    generators: [
      {
        id: "work",
        label: "仕事を求める(持ち上げる・摩擦にさからう・仕事が 0 のとき)",
        make: retry(function () {
          var kind = JHS.pick(["lift", "lift", "friction", "zero"]);
          var c, text, explain, ans, meta;
          if (kind === "lift") {
            var byMass = Math.random() < 0.5, F = JHS.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]);
            var inCm = Math.random() < 0.4, h = inCm ? JHS.pick([20, 30, 40, 50, 60, 80]) : JHS.pick([0.5, 1, 1.2, 1.5, 2, 2.5, 3]);
            var hm = inCm ? h / 100 : h, Wk = Math.round(F * hm * 100) / 100;
            if (!nice(Wk)) return null;
            c = JHS.choices4(J(Wk), onlyNice([inCm ? F * h : Wk * 10, byMass ? F * 100 * hm : Wk / 10, F + hm, F / hm, Wk * 2]).map(J));
            text = (byMass ? "質量 " + g(F * 100) + " の物体" : "重力 " + N(F) + " の物体") + "を、" + (inCm ? cm(h) : m(h)) + " の高さまで、一定の速さで持ち上げました。このときの仕事は何Jですか。" +
              (byMass ? g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。" : "");
            explain = (byMass ? ["物体にはたらく重力は " + N(F) + " です。"] : []).concat(inCm ? ["距離を m になおします。" + cm(h) + " = " + m(hm) + " です。"] : []).concat([
              "持ち上げる仕事は、重力の大きさ × 持ち上げた高さ です。",
              JHS.calc(F + " N × " + num(hm) + " m", num(Wk) + " J")
            ]);
            ans = Wk; meta = { kind: kind, force: F, meters: hm, byMass: byMass, answer: ans };
          } else if (kind === "friction") {
            var f = JHS.pick([1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12]), dd = JHS.pick([0.5, 1, 1.5, 2, 3, 4, 5]);
            var Wf = Math.round(f * dd * 100) / 100;
            c = JHS.choices4(J(Wf), onlyNice([f + dd, f / dd, dd / f, Wf * 10]).map(J));
            text = "水平な床の上の物体を、ばねばかりで水平に引いて、一定の速さで " + m(dd) + " 動かしました。このとき、ばねばかりは " + N(f) + " を示していました。引く力がした仕事は何Jですか。";
            explain = [
              "一定の速さで動いているので、引く力は摩擦力とつり合っています。摩擦力にさからってする仕事は、",
              JHS.calc(num(f) + " N × " + num(dd) + " m", num(Wf) + " J")
            ];
            ans = Wf; meta = { kind: kind, force: f, meters: dd, answer: ans };
          } else {
            var Fz = JHS.pick([10, 20, 30, 50]), dz = JHS.pick([2, 3, 5, 10]);
            c = JHS.choices4(J(0), [Fz * dz, Fz, Fz / dz, dz].filter(nice).map(J));
            text = "重力 " + N(Fz) + " の荷物を手で持ったまま、水平な廊下を " + m(dz) + " 歩きました。このとき、荷物を支える手の力が荷物にした仕事は何Jですか。";
            explain = [
              "荷物を支える手の力は上向きですが、荷物は水平に動いていて、力の向き(上向き)には動いていません。",
              "力の向きに動いた距離が 0 なので、仕事は 0J です。" + Fz + " × " + dz + " と計算するのは誤りです。"
            ];
            ans = 0; meta = { kind: kind, force: Fz, meters: dz, answer: ans };
          }
          if (!c) return null;
          return { text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain, meta: meta };
        })
      },
      {
        id: "power",
        label: "仕事率を求める(仕事 ÷ 時間)",
        make: retry(function () {
          var kind = JHS.pick(["p", "p-lift", "t"]);
          var c, text, explain, ans, meta;
          var Pw = JHS.pick([2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100]), t = JHS.pick([2, 4, 5, 8, 10, 12, 20, 30, 40, 60]);
          var Wk = Pw * t;
          if (kind === "p") {
            c = JHS.choices4(W(Pw), onlyNice([Wk * t, t / Wk, Wk - t, Pw * 60]).map(W));
            text = "ある機械が、" + J(Wk) + " の仕事を " + sec(t) + "で行いました。この機械の仕事率は何Wですか。";
            explain = ["仕事率は、仕事をかかった時間で割って求めます。", JHS.calc(Wk + " J ÷ " + t + " 秒", Pw + " W")];
            ans = Pw; meta = { kind: kind, work: Wk, seconds: t, answer: ans };
          } else if (kind === "p-lift") {
            var F = JHS.pick([5, 10, 20, 30, 40, 50, 60, 100]), hh = JHS.pick([0.5, 1, 1.5, 2, 3, 4, 5, 6]);
            var W2 = F * hh, tt = JHS.pick([2, 3, 4, 5, 6, 10, 12, 15, 20]);
            var P2 = W2 / tt;
            if (!nice(P2) || Math.abs(P2 * 10 - Math.round(P2 * 10)) > 1e-9) return null;
            c = JHS.choices4(W(P2), onlyNice([W2, F * tt / hh, F / tt, W2 * tt]).map(W));
            text = "重力 " + N(F) + " の物体を、" + m(hh) + " の高さまで、" + sec(tt) + "かけて一定の速さで持ち上げました。このときの仕事率は何Wですか。";
            explain = [
              "まず、仕事を求めます。",
              JHS.calc(F + " N × " + num(hh) + " m", num(W2) + " J"),
              JHS.calc(num(W2) + " J ÷ " + tt + " 秒", num(P2) + " W"),
              "仕事の値を、そのまま仕事率としないように注意します。"
            ];
            ans = P2; meta = { kind: kind, force: F, meters: hh, seconds: tt, work: W2, answer: ans };
          } else {
            c = JHS.choices4(sec(t), onlyNice([Wk * Pw, Pw / Wk, Wk - Pw, t * 60]).map(sec));
            text = "仕事率 " + W(Pw) + " のモーターで、" + J(Wk) + " の仕事をするのに、何秒かかりますか。";
            explain = ["仕事率 = 仕事 ÷ 時間 なので、時間 = 仕事 ÷ 仕事率 です。", JHS.calc(Wk + " J ÷ " + Pw + " W", t + " 秒")];
            ans = t; meta = { kind: kind, work: Wk, watt: Pw, answer: ans };
          }
          if (!c) return null;
          return { text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain, meta: meta };
        })
      },
      {
        id: "pulley",
        label: "動滑車を使ったときの力・ひもを引く距離・仕事",
        make: retry(function () {
          var kind = JHS.pick(["force", "dist", "work"]);
          var byMass = Math.random() < 0.4, Wt = JHS.pick([4, 6, 8, 10, 12, 16, 20, 24, 30, 40, 50, 60]);
          var hcm = JHS.pick([10, 20, 30, 40, 50, 60, 80, 100]), hm = hcm / 100;
          var F = Wt / 2, dcm = hcm * 2, Wk = Math.round(Wt * hm * 100) / 100;
          var obj = byMass ? "質量 " + g(Wt * 100) + " のおもり" : "重力 " + N(Wt) + " のおもり";
          var note = "滑車とひもの重さ、摩擦は考えないものとします。" + (byMass ? g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。" : "");
          var massLine = byMass ? ["おもりにはたらく重力は " + N(Wt) + " です。"] : [];
          var check = "仕事の原理の確認: ひもを引く仕事 " + num(F) + "N × " + num(dcm / 100) + "m = " + num(Wk) + "J は、直接持ち上げる仕事 " + Wt + "N × " + num(hm) + "m = " + num(Wk) + "J と同じです。";
          var c, text, explain, ans;
          if (kind === "force") {
            c = JHS.choices4(N(F), onlyNice([Wt, Wt * 2, Wt / 4]).map(N));
            text = "図のように、動滑車を使って、" + obj + "をゆっくり " + cm(hcm) + " 引き上げます。ひもを引く力は何Nですか。" + note;
            explain = massLine.concat(["動滑車では、おもりを2本のひもで支えるので、ひもを引く力はおもりの重力の半分です。", JHS.calc(Wt + " N ÷ 2", num(F) + " N"), check]);
            ans = F;
          } else if (kind === "dist") {
            c = JHS.choices4(cm(dcm), onlyNice([hcm, hcm / 2, hcm * 4]).map(cm));
            text = "図のように、動滑車を使って、" + obj + "を " + cm(hcm) + " 引き上げます。ひもを何cm引けばよいですか。" + note;
            explain = massLine.concat(["動滑車では、ひもを引く力は半分になりますが、ひもを引く距離は、おもりを上げる高さの2倍になります。", JHS.calc(hcm + " cm × 2", dcm + " cm"), check]);
            ans = dcm;
          } else {
            c = JHS.choices4(J(Wk), onlyNice([Wk / 2, Wk * 2, Wt * hcm, F * hm]).map(J));
            text = "図のように、動滑車を使って、" + obj + "をゆっくり " + cm(hcm) + " 引き上げました。ひもを引く力がした仕事は何Jですか。" + note;
            explain = massLine.concat([
              "動滑車では、ひもを引く力は " + N(F) + "(重力の半分)、ひもを引く距離は " + cm(dcm) + " = " + m(dcm / 100) + "(高さの2倍)です。",
              JHS.calc(num(F) + " N × " + num(dcm / 100) + " m", num(Wk) + " J"),
              "これは、直接持ち上げる仕事 " + Wt + "N × " + num(hm) + "m = " + num(Wk) + "J と同じです(仕事の原理)。力が半分だからといって、仕事も半分にはなりません。"
            ]);
            ans = Wk;
          }
          if (!c) return null;
          return {
            text: text, figure: figPulley({ single: true }), choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, weight: Wt, byMass: byMass, cm: hcm, force: F, pull: dcm, work: Wk, answer: ans }
          };
        })
      },
      {
        id: "incline",
        label: "斜面を使って引き上げるときの力・仕事(摩擦は考えない)",
        make: retry(function () {
          var kind = JHS.pick(["force", "force", "work", "length"]);
          var Wt = JHS.pick([6, 8, 10, 12, 15, 20, 24, 30, 40, 50, 60]);
          var pair = JHS.pick([[0.3, 0.6], [0.4, 0.8], [0.5, 1], [0.6, 1.2], [0.5, 1.5], [0.4, 1.2], [0.3, 0.9], [0.6, 1.5], [0.4, 1], [0.5, 2], [1, 2], [0.8, 2]]);
          var h = pair[0], L = pair[1], Wk = Math.round(Wt * h * 100) / 100, F = Math.round(Wk / L * 100) / 100;
          if (!nice(F) || Math.abs(F * 10 - Math.round(F * 10)) > 1e-9) return null;
          var note = "摩擦は考えないものとします。";
          var c, text, explain, ans, fig;
          if (kind === "force") {
            c = JHS.choices4(N(F), onlyNice([Wt, Wt * L / h, Wt * h, Wt / 2 === F ? Wt / 4 : Wt / 2]).map(N));
            text = "図のように、重力 " + N(Wt) + " の物体を、長さ " + m(L) + " の斜面にそって、高さ " + m(h) + " までゆっくり引き上げます。斜面にそって引く力は何Nですか。" + note;
            explain = [
              "直接持ち上げる仕事は、次のとおりです。",
              JHS.calc(Wt + " N × " + num(h) + " m", num(Wk) + " J"),
              "仕事の原理より、斜面にそって " + m(L) + " 引く仕事も " + J(Wk) + " です。",
              JHS.calc(num(Wk) + " J ÷ " + num(L) + " m", num(F) + " N")
            ];
            ans = F; fig = figIncline(L, h, { f: "?", L: num(L) + "m", h: num(h) + "m" });
          } else if (kind === "work") {
            c = JHS.choices4(J(Wk), onlyNice([Wt * L, F * h, Wk * 2, F]).map(J));
            text = "図のように、重力 " + N(Wt) + " の物体を、長さ " + m(L) + " の斜面にそって、高さ " + m(h) + " までゆっくり引き上げました。引く力がした仕事は何Jですか。" + note;
            explain = [
              "仕事の原理より、斜面を使っても、仕事の大きさは直接持ち上げるときと同じです。",
              JHS.calc(Wt + " N × " + num(h) + " m", num(Wk) + " J"),
              "引く力は " + num(Wk) + " ÷ " + num(L) + " = " + N(F) + " で、" + num(F) + "N × " + num(L) + "m を計算しても同じ値になります。重力 × 斜面の長さ ではありません。"
            ];
            ans = Wk; fig = figIncline(L, h, { L: num(L) + "m", h: num(h) + "m" });
          } else {
            c = JHS.choices4(m(L), onlyNice([h, Wt * h * F, F * h / Wt, L * 2, L / 2]).map(m));
            text = "重力 " + N(Wt) + " の物体を、高さ " + m(h) + " まで、斜面にそって " + N(F) + " の力で引き上げました。斜面の長さは何mですか。" + note;
            explain = [
              "直接持ち上げる仕事は、次のとおりです。",
              JHS.calc(Wt + " N × " + num(h) + " m", num(Wk) + " J"),
              "仕事の原理より、" + num(F) + "N × 斜面の長さ = " + num(Wk) + "J なので、",
              JHS.calc(num(Wk) + " J ÷ " + num(F) + " N", num(L) + " m")
            ];
            ans = L; fig = figIncline(L, h, { f: num(F) + "N", L: "?", h: num(h) + "m" });
          }
          if (!c) return null;
          return {
            text: text, figure: fig, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, weight: Wt, height: h, length: L, force: F, work: Wk, answer: ans }
          };
        })
      }
    ]
  });

  // =====================================================================
  // 3-13 エネルギー
  // =====================================================================
  // ふりこ。支点 (160, 22)、糸の長さ 150。A(左はし、50°)から静かにはなす。
  // B と D は同じ高さ(25°)、C は最下点、E は右側の 40°(A より低い)
  var PEND = [["A", -50], ["B", -25], ["C", 0], ["D", 25], ["E", 40]];
  function figPendulum() {
    var s = "", cx = 160, cy = 22, R = 150;
    function pos(a) { return [cx + R * Math.sin(a * RAD), cy + R * Math.cos(a * RAD)]; }
    var a0 = pos(-50), a1 = pos(50);
    s += seg("fig-shape", cx - 30, cy, cx + 30, cy) + circle("fig-solid", cx, cy, 3);
    s += path("fig-dash", "M" + P(a0[0]) + " " + P(a0[1]) + "A" + R + " " + R + " 0 0 0 " + P(a1[0]) + " " + P(a1[1]));
    s += seg("fig-thin", a0[0] - 10, a0[1], a1[0] + 10, a1[1]);
    PEND.forEach(function (p) {
      var b = pos(p[1]);
      s += seg(p[0] === "A" ? "fig-shape" : "fig-thin", cx, cy, b[0], b[1]);
      s += circle("fig-shape fig-fill-2", b[0], b[1], 8);
      var lx = b[0] + (p[1] < 0 ? -14 : p[1] > 0 ? 14 : 0), ly = b[1] + (p[1] === 0 ? 26 : 16);
      s += txt(lx, ly, p[0], { anchor: "middle" });
    });
    return JHS.svg(320, 200, "ふりこのおもりを A の位置から静かにはなしたときの、おもりの位置 A〜E。B と D は同じ高さ", s);
  }

  // ふりこの位置と、位置エネルギー・運動エネルギーの割合(積み上げの棒)。A(最高点)・B・C(最下点)
  function figEnergyBars() {
    var s = "", base = 176, H = 130, ys = [[1, 0], [0.26, 0.74], [0, 1]], names = ["A(最高点)", "B", "C(最下点)"];
    ys.forEach(function (v, i) {
      var x = 56 + i * 70, w = 40, hp = H * v[0], hk = H * v[1];
      if (hk > 0) {
        s += rect("fig-fill", x - w / 2, base - hk, w, hk);
        s += '<rect x="' + P(x - w / 2) + '" y="' + P(base - hk) + '" width="' + w + '" height="' + P(hk) + '" fill="url(#sci-pat-hatch)"/>';
        s += rect("fig-shape", x - w / 2, base - hk, w, hk);
      }
      if (hp > 0) s += rect("fig-shape fig-fill-2", x - w / 2, base - hk - hp, w, hp);
      s += txt(x, base + 16, names[i], { cls: "fig-small", anchor: "middle" });
    });
    s += seg("fig-axis", 24, base, 228, base) + seg("fig-dash", 28, base - H, 224, base - H);
    s += rect("fig-shape fig-fill-2", 240, 76, 14, 12) + txt(258, 86.5, "位置", { cls: "fig-small" });
    s += rect("fig-fill", 240, 98, 14, 12) + '<rect x="240" y="98" width="14" height="12" fill="url(#sci-pat-hatch)"/>' + rect("fig-shape", 240, 98, 14, 12) + txt(258, 108.5, "運動", { cls: "fig-small" });
    s += txt(28, 38, "力学的エネルギー", { cls: "fig-small" });
    return JHS.svg(320, 200, "ふりこの位置 A・B・C での、位置エネルギーと運動エネルギーの割合。どの位置でも合計は同じ", s);
  }

  // ジェットコースターのようなレール。hs: A〜E の高さ(0〜5 の整数)。レールは、それぞれの点で水平になる曲線でつなぐ
  function figTrack(hs) {
    var s = "", base = 176, k = 26, xs = [36, 100, 164, 228, 292];
    var pts = hs.map(function (h, i) { return [xs[i], base - 12 - h * k]; });
    var d = "M" + P(pts[0][0] - 14) + " " + P(pts[0][1]) + "L" + P(pts[0][0]) + " " + P(pts[0][1]);
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], mx = (b[0] - a[0]) / 2;
      d += "C" + P(a[0] + mx) + " " + P(a[1]) + " " + P(b[0] - mx) + " " + P(b[1]) + " " + P(b[0]) + " " + P(b[1]);
    }
    d += "L" + P(pts[4][0] + 12) + " " + P(pts[4][1]);
    s += seg("fig-axis", 16, base, 304, base);
    s += path("fig-shape", d);
    s += circle("fig-shape fig-fill-2", pts[0][0], pts[0][1] - 7, 7);
    pts.forEach(function (p, i) {
      s += seg("fig-dash", p[0], p[1], p[0], base) + txt(p[0], p[1] - (i === 0 ? 20 : 8), ABC[i], { anchor: "middle", halo: true });
    });
    return JHS.svg(320, 200, "なめらかなレールの上の位置 A〜E。小球を A の位置に置いて静かにはなす", s);
  }

  var CONVERT_TABLE = JHS.table({
    caption: "エネルギーの移り変わりの例",
    head: ["器具・現象", "エネルギーの移り変わり"],
    rows: [
      ["電灯(LED電球)", "電気 → 光"],
      ["モーター", "電気 → 運動"],
      ["発電機", "運動 → 電気"],
      ["光電池(太陽電池)", "光 → 電気"],
      ["乾電池", "化学 → 電気"],
      ["電熱線", "電気 → 熱"],
      ["スピーカー", "電気 → 音"]
    ]
  });
  var POWERPLANT_TABLE = JHS.table({
    caption: "発電方法とエネルギーの移り変わり",
    head: ["発電方法", "エネルギーの移り変わり"],
    rows: [
      ["火力発電", "化学 → 熱 → 運動 → 電気"],
      ["水力発電", "位置 → 運動 → 電気"],
      ["原子力発電", "核 → 熱 → 運動 → 電気"],
      ["風力発電", "運動(風) → 電気"],
      ["太陽光発電", "光 → 電気"],
      ["地熱発電", "熱 → 運動 → 電気"]
    ]
  });

  JHS.register("g3-energy", {
    points: [
      "物体がほかの物体に仕事をする能力をもっているとき、その物体は<b>エネルギー</b>をもっているといいます。エネルギーの単位は、仕事と同じ<b>ジュール(J)</b>です。",
      "高いところにある物体がもつエネルギーを<b>位置エネルギー</b>といいます。" + rule("基準面からの高さが高いほど、質量が大きいほど大きく") + "、高さと質量のそれぞれに比例します。運動している物体がもつエネルギーを<b>運動エネルギー</b>といい、" + rule("速さが大きいほど、質量が大きいほど大きく") + "なります(速さが2倍になると、4倍になります)。",
      "位置エネルギーと運動エネルギーの和を<b>力学的エネルギー</b>といいます。摩擦や空気の抵抗がなければ、位置エネルギーと運動エネルギーはたがいに移り変わり、" + rule("力学的エネルギーは一定に保たれます") + "(<b>力学的エネルギーの保存</b>)。ふりこでは、もっとも高い位置で位置エネルギーが最大、もっとも低い位置で運動エネルギーが最大になります。",
      "エネルギーには、電気・熱・光・音・化学・核エネルギーなどがあり、たがいに移り変わります。移り変わる前後で、" + rule("エネルギーの総量は変わりません") + "(<b>エネルギー保存の法則</b>)。" + rule("変換効率[%] = 目的のエネルギー ÷ 消費したエネルギー × 100") + " で、目的以外のエネルギー(おもに熱)に変わる分があるので、100% にはなりません。",
      "熱は、<b>伝導</b>(物体の中を、高温の部分から低温の部分へ伝わる)、<b>対流</b>(あたためられた液体や気体が動いて伝わる)、<b>放射</b>(熱源から離れたところへ、光などとして伝わる)によって伝わります。",
      "火力発電は化石燃料(石油・石炭・天然ガス)の化学エネルギーを、原子力発電はウランなどの核エネルギーを利用します。化石燃料は量に限りがあり、燃やすと二酸化炭素が出ます。原子力発電では、放射線を出す廃棄物の管理が課題です。太陽光・風力・水力・地熱・バイオマスなどの<b>再生可能エネルギー</b>は、くり返し利用でき、ふえる二酸化炭素の量をおさえられます。"
    ],
    figures: [
      { html: figPendulum(), caption: "A から静かにはなしたふりこ(摩擦や空気の抵抗は考えない)。位置エネルギーは A で最大、運動エネルギーは最下点の C で最大です。同じ高さの B と D では、速さも同じです。おもりは、反対側の A と同じ高さ(細い線)まで上がります。" },
      { html: figEnergyBars(), caption: "ふりこの位置と、エネルギーの割合。位置エネルギー(斜線のない部分)が減った分だけ運動エネルギー(斜線の部分)がふえ、合計の力学的エネルギーは変わりません。" }
    ],
    blocks: [
      JHS.formula("変換効率[%]", JHS.frac("目的のエネルギー[J]", "消費したエネルギー[J]") + " × 100"),
      CONVERT_TABLE,
      POWERPLANT_TABLE
    ],
    example: {
      title: "モーターに " + J(50) + " の電気エネルギーを与えて、重力 " + N(4) + " の物体を " + m(2.5) + " の高さまで持ち上げました。このモーターの変換効率は何%ですか。",
      steps: [
        "物体を持ち上げた仕事(目的のエネルギー)を求めます。",
        JHS.calc("4 N × 2.5 m", "10 J"),
        JHS.calc("10 J ÷ 50 J × 100", "20 %"),
        "残りの 40J は、おもに目的以外の熱や音のエネルギーに変わっています。"
      ],
      result: pct(20)
    },
    fixed: [
      {
        id: "energy-def",
        text: "物体が「エネルギーをもっている」とは、どういうことですか。",
        choices: [
          "ほかの物体に仕事をする能力をもっていること",
          "物体が必ず運動していること",
          "物体の温度が高いこと",
          "物体にはたらく力がつり合っていること"
        ],
        answer: 0,
        explain: [
          "ほかの物体に仕事をする能力をもっているとき、その物体はエネルギーをもっているといいます。",
          "高いところで静止している物体も、落ちて仕事ができるので、エネルギー(位置エネルギー)をもっています。"
        ]
      },
      {
        id: "pe-factors",
        text: "物体のもつ位置エネルギーについて、正しいものはどれですか。",
        choices: [
          "基準面からの高さが高いほど、質量が大きいほど大きい",
          "基準面からの高さが高いほど大きく、質量には関係しない",
          "速さが大きいほど、質量が大きいほど大きい",
          "質量が大きいほど小さい"
        ],
        answer: 0,
        explain: [
          "位置エネルギーは、基準面からの高さと、物体の質量のそれぞれに比例します。",
          "速さが大きいほど大きくなるのは、運動エネルギーです。"
        ]
      },
      {
        id: "pe-ratio",
        text: "質量 " + g(100) + " の物体を高さ " + m(1) + " に置いたときの位置エネルギーと比べて、質量 " + g(200) + " の物体を高さ " + m(3) + " に置いたときの位置エネルギーは何倍ですか。基準面は同じとします。",
        choices: [q(6, "倍"), q(5, "倍"), q(3, "倍"), q(1.5, "倍")],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "位置エネルギーは、質量と高さのそれぞれに比例します。",
          "質量が 2倍、高さが 3倍なので、2 × 3 = 6倍です。2 + 3 = 5倍ではありません。"
        ],
        meta: { massRatio: 2, heightRatio: 3, answer: 6 }
      },
      {
        id: "ke-factors",
        text: "運動エネルギーが大きくなるのは、どのようなときですか。",
        choices: [
          "物体の速さが大きいほど、質量が大きいほど大きい",
          "物体の高さが高いほど大きい",
          "物体の速さが小さいほど大きい",
          "物体の質量には関係せず、速さだけで決まる"
        ],
        answer: 0,
        explain: [
          "運動エネルギーは、物体の速さが大きいほど、質量が大きいほど大きくなります。",
          "高さで決まるのは、位置エネルギーです。"
        ]
      },
      {
        id: "pend-ke",
        text: "図のように、ふりこのおもりを A の位置から静かにはなしました。おもりの運動エネルギーが最大になるのは、A〜E のどの位置ですか。摩擦や空気の抵抗は考えないものとします。",
        figure: figPendulum(),
        choices: ["C", "A", "B", "E"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "力学的エネルギーは一定なので、位置エネルギーがもっとも小さい位置で、運動エネルギーが最大になります。",
          "もっとも低い位置は C です。A では、おもりは止まっていて、運動エネルギーは 0 です。"
        ]
      },
      {
        id: "pend-same",
        text: "図のように、ふりこのおもりを A の位置から静かにはなしました。おもりの速さが、B の位置での速さと同じになるのは、どの位置ですか。摩擦や空気の抵抗は考えないものとします。",
        figure: figPendulum(),
        choices: ["D", "C", "E", "A"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "力学的エネルギーは一定なので、同じ高さでは位置エネルギーが同じになり、運動エネルギー(速さ)も同じになります。",
          "B と同じ高さにあるのは D です。"
        ]
      },
      {
        id: "conservation",
        text: "摩擦や空気の抵抗がないとき、運動している物体の位置エネルギーと運動エネルギーの和について、正しいものはどれですか。",
        choices: ["つねに一定に保たれる", "しだいに大きくなる", "しだいに小さくなる", "高いところほど大きい"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "位置エネルギーと運動エネルギーの和(力学的エネルギー)は、摩擦や空気の抵抗がなければ一定に保たれます。",
          "これを力学的エネルギーの保存といいます。"
        ]
      },
      {
        id: "real-pendulum",
        text: "実際のふりこは、ふれ続けるうちに、ふれはばがしだいに小さくなり、やがて止まります。このとき、エネルギーについて正しいものはどれですか。",
        choices: [
          "力学的エネルギーの一部が、摩擦や空気の抵抗によって熱や音のエネルギーに変わった",
          "エネルギーが、消えてなくなった",
          "位置エネルギーだけが、運動エネルギーに変わり続けた",
          "力学的エネルギーが、時間とともにふえた"
        ],
        answer: 0,
        explain: [
          "摩擦や空気の抵抗があると、力学的エネルギーの一部が熱や音のエネルギーに変わるので、力学的エネルギーは減っていきます。",
          "熱や音も含めたエネルギーの総量は変わりません(エネルギー保存の法則)。"
        ]
      },
      {
        id: "solar-cell",
        text: "光電池(太陽電池)では、どのようなエネルギーの移り変わりが起こっていますか。",
        choices: ["光エネルギー → 電気エネルギー", "電気エネルギー → 光エネルギー", "化学エネルギー → 電気エネルギー", "熱エネルギー → 光エネルギー"],
        answer: 0,
        explain: [
          "光電池は、光エネルギーを電気エネルギーに変えます。",
          "電気エネルギー → 光エネルギー は電灯、化学エネルギー → 電気エネルギー は乾電池などの電池です。"
        ]
      },
      {
        id: "thermal-plant",
        text: "火力発電で、エネルギーはどのように移り変わりますか。",
        choices: [
          "化学 → 熱 → 運動 → 電気",
          "位置 → 運動 → 電気",
          "核 → 熱 → 運動 → 電気",
          "光 → 電気"
        ],
        answer: 0,
        explain: [
          "火力発電では、燃料のもつ化学エネルギーを燃焼で熱エネルギーに変え、水蒸気でタービンを回し(運動エネルギー)、発電機で電気エネルギーに変えます。",
          "位置 → 運動 → 電気 は水力発電、核 → 熱 → 運動 → 電気 は原子力発電、光 → 電気 は太陽光発電です。"
        ]
      },
      {
        id: "led-efficiency",
        text: "同じ明るさの白熱電球と LED電球では、LED電球のほうが消費電力が小さくてすみます。その理由として正しいものはどれですか。",
        choices: [
          "LED電球は、電気エネルギーを光エネルギーに変える変換効率が高いから",
          "LED電球は、電気エネルギーの多くを熱エネルギーに変えるから",
          "LED電球では、エネルギーの総量がふえるから",
          "白熱電球は、光をまったく出さないから"
        ],
        answer: 0,
        explain: [
          "白熱電球は、消費した電気エネルギーの多くが熱エネルギーになり、光になる割合(変換効率)が低くなります。",
          "LED電球は変換効率が高いので、同じ明るさでも、消費する電気エネルギーが少なくてすみます。"
        ]
      },
      {
        id: "heat-radiation",
        text: "たき火に手をかざすと、たき火から離れていても手があたたかく感じられます。このような熱の伝わり方を何といいますか。",
        choices: ["放射", "伝導", "対流", "蒸散"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "熱源から離れたところに、光などとして熱が伝わることを放射(熱放射)といいます。太陽が地面をあたためるのも放射です。",
          "伝導はふれ合った物体の中を熱が伝わること、対流はあたためられた液体や気体が動いて熱を運ぶことです。"
        ]
      },
      {
        id: "renewable",
        text: "次のうち、<b>再生可能エネルギーではない</b>ものはどれですか。",
        choices: ["石炭", "太陽光", "風力", "地熱"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "石炭は化石燃料で、量に限りがあり、使えばなくなっていきます。",
          "太陽光・風力・地熱・水力・バイオマスなどは、くり返し利用できる再生可能エネルギーです。"
        ]
      },
      {
        id: "fossil-issue",
        text: "化石燃料を使う火力発電の課題として、正しいものはどれですか。",
        choices: [
          "燃料の量に限りがあり、燃やすと二酸化炭素が出る",
          "天候によって、発電量が大きく変わる",
          "発電に、ダムをつくる必要がある",
          "放射線を出す廃棄物が出る"
        ],
        answer: 0,
        explain: [
          "化石燃料(石油・石炭・天然ガス)は量に限りがあり、燃やすと地球温暖化の原因の1つとされる二酸化炭素が出ます。",
          "天候で発電量が変わるのは太陽光・風力発電、ダムは水力発電、放射線を出す廃棄物は原子力発電の課題です。"
        ]
      }
    ],
    generators: [
      {
        id: "track",
        label: "レールの上の位置と、位置エネルギー・運動エネルギーの大小",
        make: retry(function () {
          var rest = JHS.shuffle([0, 1, 2, 3, 4]).slice(0, 4), hs = [5].concat(rest);
          var kind = JHS.pick(["ke-max", "ke-max", "slow", "pe-max", "ratio"]);
          var others = [1, 2, 3, 4], c, text, explain, ansIdx, meta;
          var lowI = others.reduce(function (a, i) { return hs[i] < hs[a] ? i : a; }, 1);
          var highI = others.reduce(function (a, i) { return hs[i] > hs[a] ? i : a; }, 1);
          var lead = "図のように、なめらかなレールの A の位置に小球を置き、静かにはなしました。小球はレールにそって、B、C、D、E の順に通過します。摩擦や空気の抵抗は考えないものとします。";
          function wrongKeys(ans) { return others.filter(function (i) { return i !== ans; }).map(function (i) { return ABC[i]; }).concat(["A"]); }
          if (kind === "ke-max") {
            ansIdx = lowI;
            c = JHS.choices4(ABC[ansIdx], wrongKeys(ansIdx));
            text = lead + "小球の運動エネルギーが最大になるのは、どの位置ですか。";
            explain = ["力学的エネルギーは一定なので、位置エネルギーがもっとも小さい(もっとも低い)位置で、運動エネルギーが最大になります。", "もっとも低い位置は " + ABC[ansIdx] + " です。"];
          } else if (kind === "slow") {
            ansIdx = highI;
            c = JHS.choices4(ABC[ansIdx], others.filter(function (i) { return i !== ansIdx; }).map(function (i) { return ABC[i]; }));
            text = lead + "B〜E のうち、小球の速さがもっとも小さいのは、どの位置ですか。";
            explain = ["力学的エネルギーは一定なので、高い位置ほど位置エネルギーが大きく、運動エネルギー(速さ)は小さくなります。", "B〜E のうちでもっとも高い位置は " + ABC[ansIdx] + " です。"];
          } else if (kind === "pe-max") {
            ansIdx = highI;
            c = JHS.choices4(ABC[ansIdx], others.filter(function (i) { return i !== ansIdx; }).map(function (i) { return ABC[i]; }));
            text = lead + "B〜E のうち、小球の位置エネルギーがもっとも大きいのは、どの位置ですか。";
            explain = ["位置エネルギーは、基準面からの高さが高いほど大きくなります。", "B〜E のうちでもっとも高い位置は " + ABC[ansIdx] + " です。そこでは運動エネルギーがもっとも小さくなります。"];
          } else {
            // 2つの位置の運動エネルギーの比(A との高さの差に比例)
            var pairs = [];
            others.forEach(function (i) { others.forEach(function (j) {
              if (i !== j && hs[j] < 5 && hs[i] < 5 && (5 - hs[i]) % (5 - hs[j]) === 0 && (5 - hs[i]) / (5 - hs[j]) >= 2) pairs.push([i, j]);
            }); });
            if (pairs.length === 0) return null;
            var pr = JHS.pick(pairs), r = (5 - hs[pr[0]]) / (5 - hs[pr[1]]);
            c = JHS.choices4(q(r, "倍"), [1 / r, hs[pr[0]] ? hs[pr[1]] / hs[pr[0]] : r + 1, r + 1, r * 2, r - 1 > 1 ? r - 1 : r + 2].filter(function (v) { return nice(v) && v !== 1; }).map(function (v) { return q(v, "倍"); }));
            text = lead + "図の「高さ」の数値は、それぞれの位置の地面からの高さを、同じ単位で表したものです。" + ABC[pr[0]] + " での小球の運動エネルギーは、" + ABC[pr[1]] + " での運動エネルギーの何倍ですか。";
            explain = [
              "A で止まっていた小球が、ある位置で運動エネルギーをもつのは、A からその位置まで下がった分の位置エネルギーが運動エネルギーに変わったからです。運動エネルギーは、A との高さの差に比例します。",
              ABC[pr[0]] + " は A より " + (5 - hs[pr[0]]) + "、" + ABC[pr[1]] + " は A より " + (5 - hs[pr[1]]) + " 低いので、" + (5 - hs[pr[0]]) + " ÷ " + (5 - hs[pr[1]]) + " = " + r + "倍です。"
            ];
            meta = { kind: kind, heights: hs, from: ABC[pr[0]], to: ABC[pr[1]], answer: r };
          }
          if (!c) return null;
          var fig = figTrack(hs);
          if (kind === "ratio") {
            // 高さの数値を、それぞれの点の点線の下に書く
            fig = fig.replace("</svg>", hs.map(function (h, i) { return txt([36, 100, 164, 228, 292][i], 194, "高さ" + h, { cls: "fig-small", anchor: "middle" }); }).join("") + "</svg>");
          }
          return {
            text: text, figure: fig, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: meta || { kind: kind, heights: hs, answer: ABC[ansIdx] }
          };
        })
      },
      {
        id: "efficiency",
        label: "変換効率の計算(%)",
        make: retry(function () {
          var kind = JHS.pick(["direct", "motor", "reverse"]);
          var c, text, explain, ans, meta;
          if (kind === "direct") {
            // 器具ごとに、現実に近い変換効率の候補を分ける
            var dev = JHS.pick([["ある電球", "電気", "光", [10, 15, 20, 25, 30, 40]], ["あるモーター", "電気", "運動", [40, 45, 60, 75, 80, 90]],
              ["ある発電機", "運動", "電気", [60, 75, 80, 90]], ["ある光電池", "光", "電気", [10, 15, 20, 25]]]);
            var E = JHS.pick([50, 100, 200, 250, 400, 500, 800, 1000]), e = JHS.pick(dev[3]);
            var U = E * e / 100;
            if (U % 1 !== 0) return null;
            c = JHS.choices4(pct(e), onlyNice([Math.round(E / U * 10000) / 100, 100 - e, e / 100, U]).filter(function (v) { return v !== e; }).map(pct));
            text = dev[0] + "に " + J(E) + " の" + dev[1] + "エネルギーを与えたところ、" + J(U) + " の" + dev[2] + "エネルギーが得られました。この" + dev[0].replace("ある", "") + "の変換効率は何%ですか。";
            explain = [
              "変換効率は、目的のエネルギーが、消費したエネルギーの何%にあたるかを表します。",
              JHS.calc(U + " J ÷ " + E + " J × 100", e + " %"),
              "残りの " + J(E - U) + " は、おもに熱など、目的以外のエネルギーになっています。"
            ];
            ans = e; meta = { kind: kind, input: E, output: U, answer: ans };
          } else if (kind === "motor") {
            var F = JHS.pick([1, 2, 3, 4, 5, 6, 8, 10]), h = JHS.pick([0.5, 1, 1.5, 2, 2.5, 3]), Pw = JHS.pick([1, 2, 3, 4, 5, 6, 10]), t = JHS.pick([2, 4, 5, 10, 20]);
            var Wk = F * h, Ein = Pw * t, eff = Wk / Ein * 100;
            if (Math.abs(eff - Math.round(eff)) > 1e-9 || eff < 10 || eff >= 100) return null;
            c = JHS.choices4(pct(eff), onlyNice([Math.round(Ein / Wk * 10000) / 100, 100 - eff, Wk, Math.round(eff / 100 * 1000) / 1000]).filter(function (v) { return v !== eff; }).map(pct));
            text = "消費電力 " + W(Pw) + " のモーターを " + sec(t) + "間使って、重力 " + N(F) + " の物体を " + m(h) + " の高さまで持ち上げました。このモーターの変換効率は何%ですか。";
            explain = [
              "モーターが消費した電気エネルギー(電力 × 時間)は、次のとおりです。",
              JHS.calc(Pw + " W × " + t + " 秒", Ein + " J"),
              "物体を持ち上げた仕事(目的のエネルギー)は、次のとおりです。",
              JHS.calc(F + " N × " + num(h) + " m", num(Wk) + " J"),
              JHS.calc(num(Wk) + " J ÷ " + Ein + " J × 100", num(eff) + " %")
            ];
            ans = eff; meta = { kind: kind, watt: Pw, seconds: t, input: Ein, force: F, height: h, output: Wk, answer: ans };
          } else {
            var E2 = JHS.pick([100, 200, 300, 400, 500, 600, 800, 1000, 1200, 2000]), e2 = JHS.pick([10, 20, 25, 30, 40, 50, 60, 75, 80, 90]);
            var U2 = E2 * e2 / 100;
            if (U2 % 1 !== 0) return null;
            c = JHS.choices4(J(U2), onlyNice([E2 - U2, E2 * e2, E2 / e2, U2 * 10]).filter(function (v) { return v !== U2; }).map(J));
            text = "変換効率 " + pct(e2) + " の電気器具に、" + J(E2) + " の電気エネルギーを与えました。目的のエネルギーとして得られるのは何Jですか。";
            explain = [
              "変換効率 " + pct(e2) + " は、消費したエネルギーの " + JHS.frac(String(e2), "100") + " が目的のエネルギーになることを表します。",
              JHS.calc(E2 + " J × " + e2 + " ÷ 100", U2 + " J"),
              "残りの " + J(E2 - U2) + " は、目的以外のエネルギーになります。"
            ];
            ans = U2; meta = { kind: kind, input: E2, efficiency: e2, answer: ans };
          }
          if (!c) return null;
          return { text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain, meta: meta };
        })
      },
      {
        id: "collision",
        label: "小球を木片に当てる実験(位置エネルギーは質量と高さに比例)",
        make: retry(function () {
          var m0 = JHS.pick([10, 20, 25, 40, 50]), h0 = JHS.pick([5, 10, 15, 20]), x0 = JHS.pick([2, 3, 4, 5, 6]);
          var km = JHS.pick([1, 2, 3, 0.5]), kh = JHS.pick([1, 2, 3, 0.5]);
          if (km === 1 && kh === 1) return null;
          var m1 = m0 * km, h1 = h0 * kh, x1 = x0 * km * kh;
          if (!nice(m1) || m1 % 1 !== 0 || h1 % 1 !== 0 || Math.abs(x1 * 10 - Math.round(x1 * 10)) > 1e-9) return null;
          if (x1 > 30) return null;   // 木片が 30cm をこえて動く組は、実験の台の上で現実的でないので使わない
          var kind = Math.random() < 0.7 ? "dist" : "height";
          var lead = "斜面の上の高さ " + cm(h0) + " から質量 " + g(m0) + " の小球を転がして、水平面上の木片に当てると、木片は " + cm(x0) + " 動きました。この実験で、木片の動いた距離は、小球の質量と、小球を転がしはじめた高さのそれぞれに比例することがわかっています。";
          var c, text, explain, ans;
          if (kind === "dist") {
            c = JHS.choices4(cm(x1), onlyNice([x0 * (km + kh), x0 * km, x0 * kh, x1 * 2, x0]).filter(function (v) { return Math.abs(v - x1) > 1e-9; }).map(cm));
            text = lead + "質量 " + g(m1) + " の小球を、高さ " + cm(h1) + " から転がすと、木片は何cm動きますか。";
            explain = [
              "木片の動く距離は、小球が木片に当たる前にもっていたエネルギー(はじめの位置エネルギー)の大きさを表し、質量と高さのそれぞれに比例します。",
              "質量は " + num(km) + "倍、高さは " + num(kh) + "倍なので、距離は " + num(km) + " × " + num(kh) + " = " + num(km * kh) + "倍になります。",
              JHS.calc(x0 + " cm × " + num(km * kh), num(x1) + " cm")
            ];
            ans = x1;
          } else {
            if (km === 1 || x1 === x0) return null;
            c = JHS.choices4(cm(h1), onlyNice([h0 * x1 / x0, h0, h0 * km, h1 * 2]).filter(function (v) { return Math.abs(v - h1) > 1e-9; }).map(cm));
            text = lead + "質量 " + g(m1) + " の小球を使って、木片を " + cm(x1) + " 動かすには、小球を何cmの高さから転がせばよいですか。";
            explain = [
              "木片の動く距離は、小球の質量と高さのそれぞれに比例します。",
              "質量が " + num(km) + "倍なので、同じ高さ(" + cm(h0) + ")から転がすと、木片は " + cm(x0 * km) + " 動きます。",
              "木片を " + cm(x1) + " 動かすには、高さを " + num(x1) + " ÷ " + num(x0 * km) + " = " + num(kh) + "倍にします。",
              JHS.calc(h0 + " cm × " + num(kh), num(h1) + " cm")
            ];
            ans = h1;
          }
          if (!c) return null;
          return { text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, mass0: m0, height0: h0, dist0: x0, mass1: m1, height1: h1, dist1: x1, answer: ans } };
        })
      }
    ]
  });
})();

// =====================================================================
// 地学(g3-daily-motion、g3-annual-motion、g3-moon-venus、g3-solar-system)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var r = JHS.r, rule = JHS.rule, q = JHS.q, txt = JHS.txt;
  var RAD = Math.PI / 180;
  var KANA = ["ア", "イ", "ウ", "エ", "オ"];
  function n1(v) { return String(Math.round(v * 10) / 10); }
  function pt(p) { return n1(p[0]) + " " + n1(p[1]); }
  function dg(v) { return q(JHS.num(v), "°"); }          // 角度
  // 円の上の点(数学の向き: 右が0°、反時計回りが正)
  function onCircle(cx, cy, rr, a) { return [cx + rr * Math.cos(a * RAD), cy - rr * Math.sin(a * RAD)]; }
  // 円弧の d。a1 から a2 へ。a2 > a1 なら反時計回り、a2 < a1 なら時計回り
  function arcD(cx, cy, rr, a1, a2) {
    var p1 = onCircle(cx, cy, rr, a1), p2 = onCircle(cx, cy, rr, a2);
    return "M" + pt(p1) + "A" + n1(rr) + " " + n1(rr) + " 0 " + (Math.abs(a2 - a1) > 180 ? 1 : 0) + " " + (a2 > a1 ? 0 : 1) + " " + pt(p2);
  }
  // 矢じりのついた曲線(d は path の d)
  function curveArrow(d, cls) {
    cls = cls || "fig-shape";
    return '<path class="' + cls + '" d="' + d + '" marker-end="url(#' + (/fig-force|fig-line(\s|$)/.test(cls) ? "sci-arrow-accent" : "sci-arrow") + ')"/>';
  }
  // 斜線の模様でぬった形(影・夜の側)。shape は '<path d="…"/>' などの、class のない要素
  function shade(shape) {
    var tag = /^<(\w+) /.exec(shape)[1];
    return shape.replace("<" + tag + " ", "<" + tag + ' class="fig-fill-2" ') + shape.replace("<" + tag + " ", "<" + tag + ' fill="url(#sci-pat-hatch)" ');
  }
  // 時刻(0時からの分)を「6時」「5時30分」の形に。24時をこえたら「翌日の」をつける
  function clock(min) {
    if (min >= 1440) return "翌日の" + clock(min - 1440);
    if (min < 0) return "前日の" + clock(min + 1440);
    var h = Math.floor(min / 60), m = min % 60;
    return h + "時" + (m ? m + "分" : "");
  }
  // 時間の長さ(分)を「3時間」「3時間30分」「30分」の形に
  function span(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h ? h + "時間" : "") + (m ? m + "分" : "");
  }
  // 端に近い文字は、はみ出さないように寄せる
  function anchorFor(x) { return x < 50 ? "start" : x > 270 ? "end" : "middle"; }
  function edgeX(x) { return x < 50 ? x - 8 : x > 270 ? x + 8 : x; }

  // ---------- 透明半球 ----------
  // 南の上の方から見た図(手前が南、奥が北。東が右、西が左)。
  // 天球上の向きを x: 東、y: 北、z: 天頂 の単位ベクトルで表し、図の座標に直す
  var HEMI = { cx: 160, cy: 158, R: 120, e: 15 };
  function hemiP(v) {
    var e = HEMI.e * RAD;
    return [HEMI.cx + HEMI.R * v[0], HEMI.cy - HEMI.R * (v[1] * Math.sin(e) + v[2] * Math.cos(e))];
  }
  // 北緯 lat の地点で、赤緯 dec(夏至 23.4、春分・秋分 0、冬至 −23.4)の太陽が、時角 H(正午が0°、午前が負。1時間に15°)にある向き
  function sunAt(lat, dec, H) {
    var L = lat * RAD, D = dec * RAD, h = H * RAD, a = Math.sin(D), b = Math.cos(D);
    return [-b * Math.sin(h), a * Math.cos(L) - b * Math.cos(h) * Math.sin(L), a * Math.sin(L) + b * Math.cos(h) * Math.cos(L)];
  }
  // 日の出の時角(正の値。日の出は −H0、日の入りは +H0)
  function riseH(lat, dec) {
    var c = -Math.tan(lat * RAD) * Math.tan(dec * RAD);
    return Math.acos(Math.max(-1, Math.min(1, c))) / RAD;
  }
  // 透明半球の図。
  // o.paths: [{ dec, cls, name, key, dots }]  太陽の道すじ(北緯35°)。dots: true で1時間ごとの点
  // o.dirKeys: { 東: "エ", … } 方位の文字のかわりに記号を出す(問題用)
  // o.meridian: true で天頂と子午線、o.labels: true で「南中」「1時間ごと」などの説明
  function figHemi(o) {
    o = o || {};
    var cx = HEMI.cx, cy = HEMI.cy, R = HEMI.R, ry = R * Math.sin(HEMI.e * RAD), s = "", top = "";
    s += '<ellipse class="fig-shape fig-fill-2" cx="' + cx + '" cy="' + cy + '" rx="' + R + '" ry="' + n1(ry) + '"/>';
    s += '<path class="fig-shape" d="M' + (cx - R) + " " + cy + "A" + R + " " + R + " 0 0 1 " + (cx + R) + " " + cy + '"/>';
    if (o.meridian) {
      var md = "";
      for (var t = 0; t <= 180; t += 5) md += (t ? "L" : "M") + pt(hemiP([0, Math.cos(t * RAD), Math.sin(t * RAD)]));
      s += '<path class="fig-dash" d="' + md + '"/>';
      var zen = hemiP([0, 0, 1]);
      s += '<circle class="fig-dot" cx="' + n1(zen[0]) + '" cy="' + n1(zen[1]) + '" r="3"/>';
      top += txt(zen[0] - 7, zen[1] - 4, "天頂", { cls: "fig-small", anchor: "end", halo: true });
      var mp = hemiP([0, Math.cos(140 * RAD), Math.sin(140 * RAD)]);
      top += txt(mp[0] - 6, mp[1] + 4, "子午線", { cls: "fig-small", anchor: "end", halo: true });
    }
    (o.paths || []).forEach(function (p) {
      var lat = 35, H0 = riseH(lat, p.dec), d = "", H;
      for (H = -H0; H < H0; H += 2) d += (d ? "L" : "M") + pt(hemiP(sunAt(lat, p.dec, H)));
      d += "L" + pt(hemiP(sunAt(lat, p.dec, H0)));
      s += '<path class="' + p.cls + '" d="' + d + '"/>';
      // 太陽の動く向き(午後の側に、道すじの上に大きめの矢じりをかく。マーカーの矢じりは小さくて見えにくいため)
      var tipP = hemiP(sunAt(lat, p.dec, H0 * 0.6)), backP = hemiP(sunAt(lat, p.dec, H0 * 0.6 - 4));
      var ux = tipP[0] - backP[0], uy = tipP[1] - backP[1], ul = Math.sqrt(ux * ux + uy * uy) || 1;
      ux /= ul; uy /= ul;
      var tipF = [tipP[0] + ux * 6, tipP[1] + uy * 6], baseC = [tipP[0] - ux * 8, tipP[1] - uy * 8];
      s += '<path class="' + (p.cls === "fig-line" ? "arrow-accent" : "arrow-ink") + '" d="M' + pt(tipF) + "L" + pt([baseC[0] - uy * 6, baseC[1] + ux * 6]) +
        "L" + pt([baseC[0] + uy * 6, baseC[1] - ux * 6]) + 'Z"/>';
      if (p.dots) {
        for (H = -165; H <= 165; H += 15) {
          if (Math.abs(H) >= H0 - 0.5) continue;
          var dp = hemiP(sunAt(lat, p.dec, H));
          s += '<circle class="fig-point" cx="' + n1(dp[0]) + '" cy="' + n1(dp[1]) + '" r="3.5"/>';
        }
      }
      var noon = hemiP(sunAt(lat, p.dec, 0));
      if (p.key) top += JHS.key(noon[0] + 22, noon[1] + 14, p.key);
      else if (p.name) top += txt(noon[0] + 9, noon[1] + 16, p.name, { cls: "fig-small", halo: true });
    });
    // 観測者
    s += '<circle class="fig-solid" cx="' + cx + '" cy="' + cy + '" r="3.5"/>';
    if (!o.dirKeys) top += txt(cx, cy + 19, "観測者", { cls: "fig-small", anchor: "middle", halo: true });
    if (o.labels) {
      var noon0 = hemiP(sunAt(35, 0, 0));
      top += txt(noon0[0] + 7, noon0[1] - 8, "南中", { cls: "fig-small", halo: true });
    }
    // 方位
    var pos = { 東: [cx + R + 12, cy], 西: [cx - R - 12, cy], 南: [cx, cy + ry + 15], 北: [cx - 12, cy - ry + 12] };
    ["東", "西", "南", "北"].forEach(function (k) {
      var p = pos[k];
      if (o.dirKeys) {
        var kp = { 東: [cx + R + 14, cy + 14], 西: [cx - R - 14, cy + 14], 南: [cx, cy + ry + 15], 北: [cx, cy - ry - 13] }[k];
        top += JHS.key(kp[0], kp[1], o.dirKeys[k]);
      } else {
        top += txt(p[0], p[1] + 5, k, { anchor: "middle", halo: true });
      }
    });
    return JHS.svg(320, 232, o.label || "透明半球の図", s + top);
  }

  // ---------- 紙テープ(透明半球の点を写したもの) ----------
  // o.from・o.to: テープの左端・右端の時刻[分]。o.ends: 端の点の名前 [{ at, name }]。o.hours: 時刻を書く正時 [9, …]
  // o.spans: 寸法線 [{ a, b, text, row }](a・b は時刻[分]、row は 0 か 1)
  function figTape(o) {
    var x0 = 26, x1 = 294, s = "", lab = "";
    function X(m) { return x0 + (m - o.from) / (o.to - o.from) * (x1 - x0); }
    s += '<rect class="fig-shape fig-fill-2" x="10" y="44" width="300" height="24" rx="2"/>';
    for (var h = Math.ceil(o.from / 60); h * 60 <= o.to; h++) {
      if (o.ends.some(function (e) { return e.at === h * 60; })) continue;
      s += '<circle class="fig-point" cx="' + n1(X(h * 60)) + '" cy="56" r="3.5"/>';
    }
    o.ends.forEach(function (e) {
      var x = X(e.at);
      s += '<circle class="fig-shape fig-fill-0" cx="' + n1(x) + '" cy="56" r="4.5"/>';
      lab += txt(edgeX(x), 34, e.name, { cls: "fig-small", anchor: anchorFor(x) });
    });
    (o.hours || []).forEach(function (hh) {
      var x = X(hh * 60);
      lab += txt(edgeX(x), 34, hh + "時", { cls: "fig-small", anchor: anchorFor(x) });
    });
    (o.spans || []).forEach(function (sp) {
      var xa = X(sp.a), xb = X(sp.b), y = 90 + (sp.row || 0) * 30;
      s += '<path class="fig-thin" d="M' + n1(xa) + " 70V" + (y + 4) + "M" + n1(xb) + " 70V" + (y + 4) + '"/>';
      s += JHS.arrow(xa + 1, y, xb - 1, y, "fig-thin", { both: true });
      lab += txt((xa + xb) / 2, y + 16, sp.text, { cls: "fig-small", anchor: "middle", halo: true });
    });
    return JHS.svg(320, o.spans.some(function (sp) { return sp.row; }) ? 146 : 116, "透明半球に記録した点を写しとった紙テープの図。点の間隔の長さが書いてある", s + lab);
  }

  // ---------- 星の日周運動(4方位の空) ----------
  // order: 左上・右上・左下・右下 のコマに入れる空。o.keys: true で方位を書かず、ア〜エ の記号を出す(問題用)
  var SKY_SIDES = { east: ["北", "東の空", "南"], south: ["東", "南の空", "西"], west: ["南", "西の空", "北"], north: ["西", "北の空", "東"] };
  function figStarSky(o) {
    o = o || {};
    var order = o.order || ["east", "south", "west", "north"], s = "";
    order.forEach(function (kind, i) {
      var ox = (i % 2) * 160, oy = Math.floor(i / 2) * 118, hy = oy + 92, a = 55 * RAD, L = 68;
      s += '<path class="fig-shape" d="M' + (ox + 10) + " " + hy + "H" + (ox + 150) + '"/>';
      if (kind === "east") {
        [30, 62, 94].forEach(function (x) {
          s += JHS.arrow(ox + x, hy - 3, ox + x + L * Math.cos(a), hy - 3 - L * Math.sin(a), "fig-line");
        });
      } else if (kind === "west") {
        [24, 56, 88].forEach(function (x) {
          s += JHS.arrow(ox + x, hy - 3 - L * Math.sin(a), ox + x + L * Math.cos(a), hy - 3, "fig-line");
        });
      } else if (kind === "south") {
        s += curveArrow("M" + (ox + 16) + " " + (hy - 3) + "Q" + (ox + 80) + " " + (oy + 2) + " " + (ox + 144) + " " + (hy - 3), "fig-line");
        s += curveArrow("M" + (ox + 44) + " " + (hy - 3) + "Q" + (ox + 80) + " " + (oy + 48) + " " + (ox + 116) + " " + (hy - 3), "fig-line");
      } else {
        var px = ox + 80, py = oy + 52;
        s += curveArrow(arcD(px, py, 13, 30, 150), "fig-line");
        s += curveArrow(arcD(px, py, 25, 160, 270), "fig-line");
        s += curveArrow(arcD(px, py, 36, 280, 380), "fig-line");
        s += '<circle class="fig-solid" cx="' + px + '" cy="' + py + '" r="3.5"/>';
        if (!o.keys) s += '<path class="fig-thin" d="M' + px + " " + (py - 5) + "V" + (oy + 14) + '"/>' + txt(px + 4, oy + 12, "北極星", { cls: "fig-small", halo: true });
      }
      if (o.keys) {
        s += JHS.key(ox + 18, oy + 16, KANA[i]);
      } else {
        var sd = SKY_SIDES[kind];
        s += txt(ox + 12, hy + 16, sd[0], { cls: "fig-small" }) + txt(ox + 80, hy + 16, sd[1], { anchor: "middle" }) +
          txt(ox + 148, hy + 16, sd[2], { cls: "fig-small", anchor: "end" });
      }
    });
    if (o.keys) return JHS.svg(320, 236, "4つの方位の空で、星の動きを矢印で表した図。ア〜エ の記号がついている", s);
    return JHS.svg(320, 236, "東・南・西・北の空の星の動き。東の空は右上へ、南の空は左から右へ弧をえがき、西の空は右下へ、北の空は北極星を中心に反時計回り", s);
  }

  // ---------- 北極側から見た地球と時刻 ----------
  // o.keys: { top, left, bottom, right } の記号を出す(問題用)。なければ 明け方・正午・夕方・真夜中 の名前
  function figEarthTime(o) {
    o = o || {};
    var cx = 196, cy = 102, R = 56, tp = cy - R, bt = cy + R, s = "";
    [62, 102, 142].forEach(function (y) { s += JHS.arrow(12, y, 70, y); });
    s += txt(12, 40, "太陽の光", { cls: "fig-small" });
    s += '<path class="fig-fill-0" d="M' + cx + " " + tp + "A" + R + " " + R + " 0 0 0 " + cx + " " + bt + 'Z"/>';
    s += shade('<path d="M' + cx + " " + tp + "A" + R + " " + R + " 0 0 1 " + cx + " " + bt + 'Z"/>');
    s += '<circle class="fig-shape" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    s += '<circle class="fig-solid" cx="' + cx + '" cy="' + cy + '" r="3"/>' + txt(cx + 6, cy - 7, "北極", { cls: "fig-small", halo: true });
    s += txt(cx - 30, cy - 22, "昼", { anchor: "middle", halo: true }) + txt(cx + 30, cy - 22, "夜", { anchor: "middle", halo: true });
    s += curveArrow(arcD(cx, cy, R + 13, 296, 338), "fig-shape");
    s += txt(268, 176, "自転の向き", { cls: "fig-small", anchor: "middle" });
    var P = { top: [cx, tp], left: [cx - R, cy], bottom: [cx, bt], right: [cx + R, cy] };
    Object.keys(P).forEach(function (k) { s += '<circle class="fig-point" cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="4"/>'; });
    if (o.keys) {
      s += JHS.key(cx, tp - 15, o.keys.top) + JHS.key(cx - R + 17, cy, o.keys.left) + JHS.key(cx, bt + 15, o.keys.bottom) + JHS.key(cx + R + 15, cy, o.keys.right);
      return JHS.svg(320, 196, "北極側から見た地球と、太陽の光の図。地球は矢印の向きに自転している。地球の上の4つの地点に記号がついている", s);
    }
    s += txt(cx, tp - 8, "明け方", { cls: "fig-small", anchor: "middle", halo: true }) + txt(cx - R + 8, cy + 18, "正午", { cls: "fig-small", halo: true }) +
      txt(cx, bt + 17, "夕方", { cls: "fig-small", anchor: "middle", halo: true }) + txt(cx + R + 8, cy + 4, "真夜中", { cls: "fig-small", halo: true });
    return JHS.svg(320, 196, "北極側から見た地球。太陽の光は左から当たり、地球は反時計回りに自転する。太陽の方を向いた地点が正午、反対側が真夜中、上が明け方、下が夕方", s);
  }

  // ---------- 北の空の星の位置(問題用) ----------
  // o.start: もとの星の角度(数学の向き)、o.time: その時刻の文字、o.cands: [{ ang, key }]
  function figNorthPos(o) {
    var cx = 160, cy = 112, R = 72, s = "";
    s += '<circle class="fig-dash" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    s += '<circle class="fig-solid" cx="' + cx + '" cy="' + cy + '" r="4"/>' + txt(cx, cy + 20, "北極星", { cls: "fig-small", anchor: "middle", halo: true });
    s += txt(16, cy + 5, "西") + txt(304, cy + 5, "東", { anchor: "end" }) + txt(12, 20, "北の空", { cls: "fig-small" });
    var sp = onCircle(cx, cy, R, o.start), lp = onCircle(cx, cy, R + 22, o.start);
    s += '<circle class="fig-point" cx="' + n1(sp[0]) + '" cy="' + n1(sp[1]) + '" r="6"/>';
    s += txt(lp[0], lp[1] + 4, o.time, { cls: "fig-small", anchor: "middle", halo: true });
    o.cands.forEach(function (c) { var p = onCircle(cx, cy, R, c.ang); s += JHS.key(p[0], p[1], c.key); });
    return JHS.svg(320, 222, "北の空を見たときの図。北極星を中心とする円の上に、ある時刻の星の位置(●)と、ア〜エ の位置がある。左が西、右が東", s);
  }

  // =====================================================================
  // 3-14 天体の1日の動き
  // =====================================================================
  var HEMI_EQ = [{ dec: 0, cls: "fig-line", dots: true }];
  var STAR_TABLE = JHS.table({
    caption: "星の日周運動(その方位を向いて見たとき)",
    head: ["方位の空", "星の動き"],
    rows: [
      ["東の空", "地平線から右上へ上る"],
      ["南の空", "東から西へ、左から右へ動く"],
      ["西の空", "右下へ動き、地平線に沈む"],
      ["北の空", "北極星を中心に反時計回り"]
    ]
  });

  JHS.register("g3-daily-motion", {
    points: [
      "地球は、北極と南極を結ぶ<b>" + r("地軸", "ちじく") + "</b>を中心に、" + rule("西から東へ1日に1回") + "まわっています。これを地球の<b>" + r("自転", "じてん") + "</b>といいます。24時間で360°まわるので、" + rule("1時間に15°") + "まわります。",
      "空を、観測者を中心とする大きな球の天井と考えたものを<b>" + r("天球", "てんきゅう") + "</b>といいます。観測者の真上の点を<b>" + r("天頂", "てんちょう") + "</b>、天頂を通って真北と真南を結ぶ線を<b>" + r("子午線", "しごせん") + "</b>といいます。天体が真南に来ることを<b>" + r("南中", "なんちゅう") + "</b>といい、このとき天体の高度はもっとも高くなります。南中したときの、地平線からの角度を<b>南中高度</b>といいます。",
      "太陽は、" + rule("東から出て、南の空を通り、西に沈み") + "ます。これは、地球の自転による見かけの動きで、<b>" + r("日周運動", "にっしゅううんどう") + "</b>といいます。透明半球に1時間ごとの太陽の位置を記録すると、" + rule("点の間隔は一定") + "で、太陽が一定の速さで動いていることがわかります。",
      "星も太陽と同じように、1時間に約15°、東から西へ日周運動をします。" + rule("東の空では右上へ上り、南の空では東から西へ(左から右へ)動き、西の空では右下へ沈み") + "ます。" + rule("北の空では、北極星を中心に反時計回り") + "に回ります。",
      "<b>北極星</b>は、地軸を北へのばした先の近くにあるので、ほとんど動いて見えません。",
      "北極側から見ると、地球は反時計回りに自転しています。太陽の方を向いた地点が正午、その反対側が真夜中です。自転の向きに進んで、夜から昼に入る地点が明け方、昼から夜に入る地点が夕方です。"
    ],
    figures: [
      {
        html: figHemi({ paths: HEMI_EQ, meridian: true, labels: true, label: "透明半球に、春分の日の太陽の位置を1時間ごとに記録した図。太陽は右の東から出て、手前の南の空を通り、左の西に沈む。点の間隔は等しい" }),
        caption: "春分の日の太陽の位置を、透明半球に1時間ごとに記録した図です。南の上の方から見ているので、右が東、左が西になります。ペンの先の影が円の中心(観測者の位置)に来るように点を打ちます。点の間隔はどこも等しくなります。"
      },
      { html: figStarSky(), caption: "それぞれの方位を向いて見た、星の動きです。東の空では右上へ、南の空では左(東)から右(西)へ、西の空では右下へ動きます。北の空では、北極星を中心に反時計回りに、1時間に約15°回ります。" },
      { html: figEarthTime(), caption: "北極側から見た地球です。太陽の光は左から当たっていて、斜線の側が夜です。地球は反時計回りに自転するので、真夜中の次に来る上の地点が明け方、正午の次に来る下の地点が夕方です。" }
    ],
    blocks: [
      JHS.formula("日周運動で動く角度", "15° × 時間"),
      STAR_TABLE
    ],
    example: {
      title: "透明半球に1時間ごとの太陽の位置を記録し、点を紙テープに写しとりました。1時間ごとの点の間隔は" + q(2.4, "cm") + "で、日の出の点から9時の点までは" + q(7.2, "cm") + "でした。日の出の時刻は何時ですか。",
      steps: [
        "太陽は一定の速さで動くので、テープの長さは時間に比例します。",
        "日の出から9時までの時間を求めます。" + JHS.calc("7.2 cm ÷ 2.4 cm", "3") + "なので、3時間です。",
        "日の出は9時の3時間前です。"
      ],
      result: "6時"
    },
    fixed: [
      {
        id: "rotation-direction",
        text: "地球の自転の向きとして、正しいものはどれですか。",
        choices: ["西から東", "東から西", "北から南", "南から北"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "地球は、地軸を中心に西から東へ自転しています。北極側から見ると、反時計回りです。",
          "そのため、地上からは、太陽や星が反対の東から西へ動いて見えます。"
        ]
      },
      {
        id: "rotation-rate",
        text: "太陽や星は、日周運動で1時間に約何度動いて見えますか。",
        choices: [dg(15), dg(30), dg(1), dg(24)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "地球は24時間で360°自転するので、1時間あたりでは " + JHS.calc("360 ° ÷ 24", "15 °"),
          "「1か月に約30°」は、地球の公転による年周運動の値です。"
        ]
      },
      {
        id: "culmination",
        text: "天体の「南中」とは、どのようなことですか。",
        choices: [
          "天体が真南に来ること。このとき天体の高度はもっとも高い",
          "天体が真東の地平線から出ること",
          "天体が真南に来ること。このとき天体の高度はもっとも低い",
          "天体が真西の地平線に沈むこと"
        ],
        answer: 0,
        explain: [
          "天体が子午線を通って真南に来ることを南中といいます。日本では、天体は南中したときに高度がもっとも高くなります。",
          "南中したときの、地平線からの角度を南中高度といいます。"
        ]
      },
      {
        id: "hemi-east",
        text: "図は、ある日の太陽の位置を、透明半球に1時間ごとに記録したものです。矢印は太陽の動いた向きです。ア〜エ のうち、東はどれですか。",
        figure: figHemi({ paths: HEMI_EQ, dirKeys: { 東: "エ", 西: "イ", 南: "ウ", 北: "ア" }, label: "透明半球に太陽の位置を記録した図。地平線上の4つの方位に ア〜エ の記号がついていて、道すじには矢印がある" }),
        choices: ["ア", "イ", "ウ", "エ"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "太陽は東から出て西に沈むので、道すじの始まりの側(矢印の向きと反対の端)の エ が東、終わりの側の イ が西です。",
          "東が右、西が左に見えるのは、南側から北を向いて見ているときなので、手前の ウ が南、奥の ア が北です。"
        ]
      },
      {
        id: "hemi-pen",
        text: "透明半球に太陽の位置を記録するとき、ペンの先をどのように置いて印をつけますか。",
        choices: [
          "ペンの先の影が、透明半球の円の中心に来るようにする",
          "ペンの先の影が、透明半球の円のふちに来るようにする",
          "ペンの先を、太陽を直接見ながら太陽に重ねる",
          "ペンの先の影が、透明半球の真上の点に来るようにする"
        ],
        answer: 0,
        explain: [
          "透明半球の円の中心は、観測者の位置にあたります。ペンの先の影が中心に来るとき、ペンの先は、観測者から見た太陽の方向にあります。",
          "太陽を直接見ると目をいためるので、ぜったいに見てはいけません。"
        ]
      },
      {
        id: "hemi-spacing",
        text: "透明半球に1時間ごとに記録した太陽の位置の点は、間隔がどのようになっていますか。",
        choices: [
          "どこも等しい",
          "南中のころがもっとも広い",
          "日の出と日の入りのころがもっとも広い",
          "午前は広く、午後はせまい"
        ],
        answer: 0,
        explain: [
          "地球は一定の速さで自転しているので、太陽も天球上を一定の速さで動いて見えます。",
          "そのため、1時間ごとの点の間隔は等しくなります。この性質を使って、点の間隔から日の出や日の入りの時刻を求めることができます。"
        ]
      },
      {
        id: "diurnal-cause",
        text: "太陽や星の日周運動が起こる理由として、正しいものはどれですか。",
        choices: [
          "地球が地軸を中心に自転しているから",
          "地球が太陽のまわりを公転しているから",
          "太陽や星が、地球のまわりを1日に1回まわっているから",
          "地軸が、公転面に垂直な方向から傾いているから"
        ],
        answer: 0,
        explain: [
          "日周運動は、地球が西から東へ自転しているために起こる、見かけの動きです。",
          "公転は1年の動き(年周運動)の原因で、地軸の傾きは季節の変化の原因です。"
        ]
      },
      {
        id: "star-east",
        text: "図の ア〜エ は、日本で、東・西・南・北の空の星の動きを、それぞれの方位を向いて観察したようすです。東の空のようすはどれですか。",
        figure: figStarSky({ keys: true, order: ["south", "west", "north", "east"] }),
        choices: ["ア", "イ", "ウ", "エ"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "東の空では、星は地平線から右上へななめに上っていきます(エ)。",
          "ア は南の空(左の東から右の西へ弧をえがく)、イ は西の空(右下へ沈む)、ウ は北の空(北極星を中心に反時計回り)です。"
        ]
      },
      {
        id: "star-west",
        text: "図の ア〜エ は、日本で、東・西・南・北の空の星の動きを、それぞれの方位を向いて観察したようすです。西の空のようすはどれですか。",
        figure: figStarSky({ keys: true, order: ["south", "west", "north", "east"] }),
        choices: ["ア", "イ", "ウ", "エ"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "西の空では、星は右下へななめに動いて、地平線に沈んでいきます(イ)。",
          "エ は東の空(右上へ上る)、ア は南の空、ウ は北の空です。"
        ]
      },
      {
        id: "north-ccw",
        text: "北の空の星は、北を向いて見ると、どのように動いて見えますか。",
        choices: [
          "北極星を中心に、反時計回りに1時間に約15°",
          "北極星を中心に、時計回りに1時間に約15°",
          "北極星を中心に、反時計回りに1時間に約30°",
          "北極星を中心に、時計回りに1時間に約30°"
        ],
        answer: 0,
        explain: [
          "北の空の星は、北極星を中心に反時計回りに回って見えます。地球の自転による動きなので、1時間に約15°です。",
          "24時間で1回転(360°)するので、" + JHS.calc("360 ° ÷ 24", "15 °")
        ]
      },
      {
        id: "polaris",
        text: "北極星が、ほとんど動いて見えない理由として、正しいものはどれですか。",
        choices: [
          "地軸を北へのばした先の近くにあるから",
          "天頂の近くにあるから",
          "ほかの星よりも、地球にとても近いところにあるから",
          "北極星そのものが、地球の自転と同じ向きに動いているから"
        ],
        answer: 0,
        explain: [
          "星の日周運動は、地球が地軸を中心に自転することによる見かけの動きです。地軸の延長線の近くにある北極星は、その回転の中心にあたるので、ほとんど動きません。",
          "日本では、北極星は北の空の、地平線から35°前後の高さに見え、天頂の近くにはありません。"
        ]
      },
      {
        id: "south-sky",
        text: "南の空の星は、南を向いて見ると、どのように動いて見えますか。",
        choices: [
          "東から西へ、左から右へ動く",
          "西から東へ、右から左へ動く",
          "東から西へ、右から左へ動く",
          "北極星を中心に、反時計回りに回る"
        ],
        answer: 0,
        explain: [
          "南の空の星は、太陽と同じように、東から出て南の空を通り、西へ動きます。",
          "南を向くと、左が東、右が西なので、星は左から右へ動いて見えます。"
        ]
      },
      {
        id: "earth-evening",
        text: "図は、北極側から見た地球と、太陽の光のようすです。地球は矢印の向きに自転しています。夕方(18時ごろ)の地点は、ア〜エ のどれですか。",
        figure: figEarthTime({ keys: { top: "ア", left: "イ", bottom: "ウ", right: "エ" } }),
        choices: ["ア", "イ", "ウ", "エ"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "太陽の方を向いた イ が正午、その反対側の エ が真夜中です。",
          "地球は反時計回りに自転するので、正午の イ の次に来る ウ が、昼から夜に入る夕方です。ア は、夜から昼に入る明け方です。"
        ]
      },
      {
        id: "meridian",
        text: "天球上で、天頂を通って、真北と真南の地平線上の点を結ぶ線を何といいますか。",
        choices: ["子午線", "地軸", "地平線", "黄道"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "天頂と真北・真南を結ぶ天球上の線を子午線といいます。天体が子午線を通るとき、南中します。",
          "地軸は地球の北極と南極を結ぶ線、黄道は天球上の太陽の通り道です。"
        ]
      }
    ],
    generators: [
      {
        id: "hemi-tape",
        label: "透明半球の記録から、日の出・日の入りの時刻や昼の長さを求める",
        make: function () {
          var a = JHS.pick([20, 22, 24, 26, 28, 30]), kind = JHS.pick(["rise", "set", "day"]), c;   // a: 1時間の長さ[mm]
          function cmv(mm) { return JHS.num(mm / 10); }
          function cm(mm) { return q(cmv(mm), "cm"); }
          var intro = "透明半球に、1時間ごとの太陽の位置と、日の出・日の入りの位置を記録し、点を紙テープに写しとりました。1時間ごとの点の間隔は" + cm(a) + "でした。";
          var lineA = "太陽は一定の速さで動くので、テープの長さは時間に比例します。";
          if (kind === "rise" || kind === "set") {
            var rise = kind === "rise", T = rise ? JHS.pick([8, 9, 10]) : JHS.pick([14, 15, 16]);
            var edge = rise ? JHS.pick([270, 300, 330, 360, 390]) : JHS.pick([1020, 1050, 1080, 1110, 1140]);
            var dt = Math.abs(T * 60 - edge);
            if (dt < 90) return null;
            var d = a * dt / 60, other = rise ? T * 60 + dt : T * 60 - dt;
            c = JHS.choices4(clock(edge), [clock(other), clock(edge - 60), clock(edge + 60), clock(edge + 30), clock(edge - 30)]);
            if (!c) return null;
            var nm = rise ? "日の出" : "日の入り";
            var fig = figTape(rise
              ? { from: edge, to: (T + 1) * 60, ends: [{ at: edge, name: "日の出" }], hours: [T], spans: [{ a: edge, b: T * 60, text: cmv(d) + "cm" }, { a: T * 60, b: (T + 1) * 60, text: cmv(a) + "cm" }] }
              : { from: (T - 1) * 60, to: edge, ends: [{ at: edge, name: "日の入り" }], hours: [T], spans: [{ a: (T - 1) * 60, b: T * 60, text: cmv(a) + "cm" }, { a: T * 60, b: edge, text: cmv(d) + "cm" }] });
            return {
              text: intro + (rise ? "日の出の点から" + T + "時の点までは" : T + "時の点から日の入りの点までは") + cm(d) + "でした。この日の" + nm + "の時刻は何時何分ですか。",
              figure: fig,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                lineA + (rise ? "日の出から" + T + "時まで" : T + "時から日の入りまで") + "の時間は、" + JHS.calc(cmv(d) + " cm ÷ " + cmv(a) + " cm", JHS.num(dt / 60)) + "で、" + span(dt) + "です。",
                rise
                  ? "日の出は" + T + "時より前なので、" + T + "時から" + span(dt) + "前の<b>" + clock(edge) + "</b>です。"
                  : "日の入りは" + T + "時よりあとなので、" + T + "時から" + span(dt) + "後の<b>" + clock(edge) + "</b>です。",
                rise
                  ? T + "時に" + span(dt) + "を足した" + clock(other) + "ではありません。"
                  : T + "時から" + span(dt) + "を引いた" + clock(other) + "ではありません。"
              ],
              meta: { kind: kind, mmPerHour: a, mm: d, knownHour: T, minutes: dt, answerMin: edge, answerText: clock(edge) }
            };
          }
          // 昼の長さ。南中が11時30分〜12時30分ごろになる組だけ
          var s = JHS.pick([270, 300, 330, 360, 390]), D = JHS.pick([600, 630, 660, 690, 720, 750, 780, 810, 840, 870]);
          var noon = s + D / 2;
          if (noon < 690 || noon > 750) return null;
          var L = a * D / 60;
          c = JHS.choices4(span(D), [span(D - 60), span(D + 60), span(D + 30), span(D - 30), span(D + 120)]);
          if (!c) return null;
          var fs = [{ a: s, b: s + D, text: cmv(L) + "cm", row: 1 }], h1 = Math.ceil(s / 60) * 60;
          if (h1 === s) h1 += 60;
          fs.push({ a: h1, b: h1 + 60, text: cmv(a) + "cm", row: 0 });
          return {
            text: intro + "日の出の点から日の入りの点までは" + cm(L) + "でした。この日の昼の長さ(日の出から日の入りまでの時間)は、何時間何分ですか。",
            figure: figTape({ from: s, to: s + D, ends: [{ at: s, name: "日の出" }, { at: s + D, name: "日の入り" }], hours: [], spans: fs }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              lineA + "テープ全体の長さを、1時間の長さで割ります。",
              JHS.calc(cmv(L) + " cm ÷ " + cmv(a) + " cm", JHS.num(D / 60)) + "なので、昼の長さは<b>" + span(D) + "</b>です。",
              D % 60 ? "小数の" + JHS.num(D / 60) + "時間を、時間と分に直すときは、0.5時間 = 30分 です。" : "割り切れるので、ちょうど" + span(D) + "です。"
            ],
            meta: { kind: kind, mmPerHour: a, mm: L, sunriseMin: s, minutes: D, answerText: span(D) }
          };
        }
      },
      {
        id: "rotation-angle",
        label: "日周運動の角度と時間(1時間に15°)",
        make: function () {
          var kind = JHS.pick(["deg", "hours", "north-time", "south-time"]), c, h, X, T;
          function hr(v) { return q(JHS.num(v), "時間"); }
          if (kind === "deg") {
            h = JHS.randInt(2, 8);
            var ans = 15 * h;
            c = JHS.choices4(dg(ans), [dg(30 * h), dg(15 * (h + 1)), dg(15 * (h - 1)), dg(10 * h)]);
            if (!c) return null;
            return {
              text: "北の空の星を観察すると、北極星を中心に回って見えました。この星は、" + h + "時間で約何度回りますか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "北の空の星も、地球の自転によって、1時間に約15°回ります。",
                JHS.calc("15 ° × " + h, ans + " °"),
                "1時間に30°や、1時間に10°ではありません(24時間で1回転 = 360°)。"
              ],
              meta: { kind: kind, hours: h, answer: ans }
            };
          }
          if (kind === "hours") {
            X = JHS.pick([30, 45, 60, 75, 90, 105, 120, 135, 150, 180]);
            h = X / 15;
            c = JHS.choices4(hr(h), [hr(X / 30), hr(h + 1), hr(h - 1), hr(h * 2)]);
            if (!c) return null;
            return {
              text: "北の空の星が、北極星を中心に約" + dg(X) + "回るのにかかる時間は、約何時間ですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "星は、地球の自転によって、1時間に約15°回ります。",
                JHS.calc(X + " ° ÷ 15 °", String(h)) + "なので、約" + h + "時間です。",
                "30°で割ると、1時間に30°動くとしたことになり、まちがいです。"
              ],
              meta: { kind: kind, degrees: X, answer: h }
            };
          }
          // ある時刻から何時ごろか
          var north = kind === "north-time";
          T = JHS.pick([18, 19, 20, 21]);
          X = JHS.pick([30, 45, 60, 75, 90]);
          h = X / 15;
          if (T + h > 23) return null;
          function tm(v) { return clock(v * 60); }
          c = JHS.choices4(tm(T + h), [tm(T - h), tm(T + X / 30), tm(T + h + 1), tm(T + 2 * h)]);
          if (!c) return null;
          return {
            text: north
              ? "ある日の" + T + "時に、北の空の星Pを観察しました。星Pが、北極星を中心に反時計回りに約" + dg(X) + "回った位置に見えるのは、何時ごろですか。"
              : "ある日の" + T + "時に、星Pが南中しました。星Pが、南中した位置から西へ約" + dg(X) + "動いた位置に見えるのは、何時ごろですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              (north ? "北の空の星は北極星を中心に反時計回りに" : "南の空の星は東から西へ") + "、1時間に約15°動きます。" + JHS.calc(X + " ° ÷ 15 °", String(h)) + "なので、" + h + "時間かかります。",
              T + "時の" + h + "時間後なので、<b>" + tm(T + h) + "</b>ごろです。",
              "星が動いた先の位置なので、" + T + "時から" + h + "時間を引いた" + tm(T - h) + "ではありません。"
            ],
            meta: { kind: kind, startHour: T, degrees: X, answer: T + h }
          };
        }
      },
      {
        id: "north-position",
        label: "北の空の星の位置(図から、何時間後・何時間前の位置を選ぶ)",
        make: function () {
          // たずねる時刻は 18〜23時の夜だけ(何時間前の型で、15〜17時の昼にならないように)。合う組から選ぶ
          var after = Math.random() < 0.6, combos = [];
          [19, 20, 21, 22].forEach(function (t0) { [2, 3, 4].forEach(function (h0) { if (after ? t0 + h0 <= 23 : t0 - h0 >= 18) combos.push([t0, h0]); }); });
          var th = JHS.pick(combos), T = th[0], h = th[1];
          var start = JHS.pick([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]);
          var right = after ? 15 * h : -15 * h;
          var offs = [right, -right, 2 * right, -2 * right];
          var keys = JHS.shuffle(KANA.slice(0, 4));
          var cands = offs.map(function (off, i) { return { off: off, ang: start + off, key: keys[i] }; });
          cands.sort(function (x, y) { return x.key < y.key ? -1 : 1; });
          var ansKey = keys[0], target = after ? T + h : T - h;
          function desc(off) {
            var hh = Math.abs(off) / 15;
            return off > 0 ? "反時計回りに" + Math.abs(off) + "°(" + hh + "時間後の位置)" : "時計回りに" + Math.abs(off) + "°(" + hh + "時間前の位置)";
          }
          return {
            text: "図は、北の空を見たときのようすです。ある日の" + T + "時に、星が ● の位置に見えました。" + (after ? h + "時間後の" + target + "時" : h + "時間前の" + target + "時") + "には、この星は ア〜エ のどの位置に見えますか。",
            figure: figNorthPos({ start: start, time: T + "時", cands: cands.map(function (x) { return { ang: x.ang, key: x.key }; }) }),
            choices: ["ア", "イ", "ウ", "エ"],
            answer: ["ア", "イ", "ウ", "エ"].indexOf(ansKey),
            choiceLayout: "grid",
            explain: [
              "北の空の星は、北極星を中心に反時計回りに、1時間に約15°回ります。" + JHS.calc("15 ° × " + h, 15 * h + " °"),
              (after ? h + "時間後は、反時計回りに" : h + "時間前は、反対の時計回りに") + (15 * h) + "°回った位置なので、<b>" + ansKey + "</b>です。",
              cands.filter(function (x) { return x.key !== ansKey; }).map(function (x) { return x.key + " は" + desc(x.off); }).join("、") + "です。"
            ],
            meta: { startAngle: start, startHour: T, hours: h, after: after, answerKey: ansKey }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-15 天体の1年の動きと季節
  // =====================================================================
  // 公転軌道と星座(北極側から見た図。地球は反時計回りに公転・自転する)。
  // 夏至の地球は下、秋分は右、冬至は上、春分は左。星座は、太陽から見てその地球の外側の方向にかく
  var SEASON_POS = { summer: 270, autumn: 0, winter: 90, spring: 180 };
  var SEASON_NAME = { summer: "夏至", autumn: "秋分", winter: "冬至", spring: "春分" };
  var CONST_OF = { summer: "さそり座", autumn: "ペガスス座", winter: "オリオン座", spring: "しし座" };
  // 北極側から見た小さな地球(太陽と反対側の半分を斜線にする)
  function smallEarth(cx, cy, rr, sunX, sunY) {
    var ux = cx - sunX, uy = cy - sunY, len = Math.sqrt(ux * ux + uy * uy);
    ux /= len; uy /= len;
    // 図の座標で、外向き(太陽と反対)が u。境目の両端は u に垂直な向き
    var e1 = [cx - uy * rr, cy + ux * rr], e2 = [cx + uy * rr, cy - ux * rr];
    var s = '<circle class="fig-lit" cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + rr + '"/>';   // 昼の側は fig-lit
    s += shade('<path d="M' + pt(e1) + "A" + rr + " " + rr + " 0 0 0 " + pt(e2) + 'Z"/>');
    return s + '<circle class="fig-shape" cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + rr + '"/>';
  }
  // o.keys: { summer: "B", … } 地球の位置に記号を出す(問題用)。なければ季節の名前
  function figOrbit(o) {
    o = o || {};
    var cx = 160, cy = 120, R = 64, s = "", lab = "";
    s += '<circle class="fig-thin" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    s += curveArrow(arcD(cx, cy, R, 312, 332), "fig-shape");
    s += '<circle class="fig-shape fig-fill" cx="' + cx + '" cy="' + cy + '" r="16"/>' + txt(cx, cy + 4, "太陽", { cls: "fig-small", anchor: "middle" });
    Object.keys(SEASON_POS).forEach(function (k) {
      var a = SEASON_POS[k], p = onCircle(cx, cy, R, a), lp = onCircle(cx, cy, 39, a), cp = onCircle(cx, cy, 100, a);
      s += smallEarth(p[0], p[1], 10, cx, cy);
      if (o.keys) lab += JHS.key(lp[0], lp[1], o.keys[k]);
      else lab += txt(lp[0], lp[1] + 4, SEASON_NAME[k], { cls: "fig-small", anchor: "middle", halo: true });
      if (k === "autumn") lab += txt(cx + R + 16, cy + 5, CONST_OF[k]);
      else if (k === "spring") lab += txt(cx - R - 16, cy + 5, CONST_OF[k], { anchor: "end" });
      else lab += txt(cp[0], cp[1] + 5, CONST_OF[k], { anchor: "middle" });
    });
    // 夏至の地球の自転の向き(反時計回り)
    var se = onCircle(cx, cy, R, 270);
    s += curveArrow(arcD(se[0], se[1], 17, 205, 335), "fig-shape");
    return JHS.svg(320, 240, o.keys
      ? "北極側から見た、太陽のまわりを公転する地球と、4つの星座の図。地球の4つの位置に記号がついている。地球は反時計回りに公転・自転し、斜線の側が夜"
      : "北極側から見た地球の公転と星座。夏至の地球は下、秋分は右、冬至は上、春分は左にあり、それぞれの外側に、さそり座・ペガスス座・オリオン座・しし座がある", s + lab);
  }

  // 地軸の傾きと季節(ななめ上から見た図)。地軸の北極側は、どの位置でも図の左上へ傾いている。
  // o.keys: { summer: "D", … } で季節の名前のかわりに記号を出す
  function figTilt(o) {
    o = o || {};
    var cx = 160, cy = 96, rx = 120, ry = 44, s = "", lab = "", sn = Math.sin(23.4 * RAD), cs = Math.cos(23.4 * RAD);
    function orbitP(t) { return [cx + rx * Math.cos(t * RAD), cy - ry * Math.sin(t * RAD)]; }
    s += '<ellipse class="fig-thin" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>';
    var ad = "";
    for (var t = -62; t <= -40; t += 2) ad += (ad ? "L" : "M") + pt(orbitP(t));
    s += curveArrow(ad, "fig-shape");
    var E = [
      { k: "autumn", x: cx, y: cy - ry, r: 11 },
      { k: "summer", x: cx + rx, y: cy, r: 14 },
      { k: "winter", x: cx - rx, y: cy, r: 14 },
      { k: "spring", x: cx, y: cy + ry, r: 13 }
    ];
    function earth(e) {
      var L = e.r + 9, h = "";
      h += '<circle class="fig-shape fig-fill-0" cx="' + n1(e.x) + '" cy="' + n1(e.y) + '" r="' + e.r + '"/>';
      h += '<path class="fig-thin" d="M' + n1(e.x - e.r) + " " + n1(e.y) + "H" + n1(e.x + e.r) + '"/>';
      h += '<path class="fig-shape" d="M' + pt([e.x + L * sn, e.y + L * cs]) + "L" + pt([e.x - L * sn, e.y - L * cs]) + '"/>';
      lab += txt(e.x - L * sn - 5, e.y - L * cs + 3, "北", { cls: "fig-small", anchor: "end", halo: true });
      return h;
    }
    s += earth(E[0]);
    s += '<circle class="fig-shape fig-fill" cx="' + cx + '" cy="' + cy + '" r="18"/>' + txt(cx, cy + 4, "太陽", { cls: "fig-small", anchor: "middle" });
    s += earth(E[1]) + earth(E[2]) + earth(E[3]);
    // 夏至の地球に、公転面に垂直な線と 23.4°(問題用 o.keys では、夏至の位置の手がかりになるのでかかない)
    var sx = cx + rx, L1 = 23;
    if (!o.keys) {
      s += '<path class="fig-dash" d="M' + sx + " " + (cy - L1 - 6) + "V" + (cy + L1 + 4) + '"/>';
      s += '<path class="fig-thin" d="' + arcD(sx, cy, 19, 90, 113.4).replace(/ 0 0 0 /, " 0 0 0 ") + '"/>';
      lab += txt(sx + 2, cy - L1 - 10, "23.4°", { cls: "fig-small", anchor: "middle", halo: true });
    }
    var pos = { summer: [cx + rx, cy + 31], winter: [cx - rx, cy + 31], autumn: [cx + 30, cy - ry - 2], spring: [cx + 34, cy + ry + 6] };
    Object.keys(pos).forEach(function (k) {
      var p = pos[k];
      if (o.keys) lab += JHS.key(p[0], p[1] - 4, o.keys[k]);
      else lab += txt(p[0], p[1], SEASON_NAME[k], { cls: "fig-small", anchor: "middle", halo: true });
    });
    return JHS.svg(320, 176, o.keys
      ? "太陽のまわりを公転する地球を、ななめ上から見た図。地軸は傾いていて、4つの位置に記号がついている"
      : "地軸を傾けたまま公転する地球。地軸の北極側は、いつも同じ向きに23.4°傾いている。北極側が太陽の方へ傾いた右の位置が夏至、反対の左の位置が冬至", s + lab);
  }

  var HEMI_3 = [
    { dec: 23.4, cls: "fig-line", name: "夏至" },
    { dec: 0, cls: "fig-line-2", name: "春分・秋分" },
    { dec: -23.4, cls: "fig-line-3", name: "冬至" }
  ];

  // 南中高度(10倍した整数で計算する)
  var ALT_ADD = { summer: 234, equinox: 0, winter: -234 };
  var ALT_FORMULA = { summer: "90° − 緯度 + 23.4°", equinox: "90° − 緯度", winter: "90° − 緯度 − 23.4°" };
  function alt10(v) { return dg(v / 10); }
  var ALT_TABLE = JHS.table({
    caption: "太陽の南中高度の求め方(北半球)",
    head: ["日", "南中高度"],
    rows: [["夏至", ALT_FORMULA.summer], ["春分・秋分", ALT_FORMULA.equinox], ["冬至", ALT_FORMULA.winter]]
  });
  var SEASON_TABLE = JHS.table({
    caption: "夏至と冬至の太陽(日本)",
    head: ["", "夏至", "冬至"],
    rows: [
      ["南中高度", "高い", "低い"],
      ["昼の長さ", "長い", "短い"],
      ["日の出", "真東より北寄り", "真東より南寄り"],
      ["日の入り", "真西より北寄り", "真西より南寄り"]
    ]
  });
  var MOTION_TABLE = JHS.table({
    caption: "日周運動と年周運動",
    head: ["", "日周運動", "年周運動"],
    rows: [
      ["原因", "地球の自転", "地球の公転"],
      ["動く角度", "1時間に約15°", "1か月に約30°"],
      ["向き", "東から西へ", "東から西へ"]
    ]
  });
  function hourText(h) { return clock(h * 60); }
  function monthAdd(M, m) { return ((M - 1 + m) % 12 + 12) % 12 + 1; }

  JHS.register("g3-annual-motion", {
    points: [
      "地球は、太陽のまわりを" + rule("1年に1回、北極側から見て反時計回り") + "にまわっています。これを地球の<b>" + r("公転", "こうてん") + "</b>といいます。360°を12か月でまわるので、" + rule("1か月に約30°") + "動きます。",
      "地球の公転によって、星座の見え方は1年で変わります。これを<b>" + r("年周運動", "ねんしゅううんどう") + "</b>といいます。" + rule("同じ時刻に見える星座は、1か月に約30°ずつ東から西へ") + "動き、" + rule("同じ星が南中する時刻は、1か月に約2時間ずつ早く") + "なります(30°は、自転の2時間分)。",
      "天球上の太陽の通り道を<b>" + r("黄道", "こうどう") + "</b>といい、黄道付近の12の星座を黄道12星座といいます。" + rule("真夜中に南中するのは、地球から見て太陽と反対側にある星座") + "で、太陽と同じ方向にある星座は、昼の空にあるので見えません。",
      "地球は、" + rule("地軸を、公転面に垂直な方向から約23.4°傾けたまま") + "公転しています。そのため、太陽の南中高度・昼の長さ・日の出と日の入りの方位が1年で変わり、季節が生じます。北極側が太陽の方へ傾いた位置が<b>夏至</b>、反対側が<b>冬至</b>です。",
      "夏至の日は、太陽が" + rule("真東より北寄りから出て、真西より北寄りに沈み") + "、南中高度がもっとも高く、昼がもっとも長くなります。冬至の日はその逆です。春分・秋分の日は、真東から出て真西に沈み、昼と夜の長さがほぼ同じです。",
      "太陽の光が地面に垂直に近い角度で当たるほど、同じ面積が受ける光の量(エネルギー)が多くなります。夏は南中高度が高く昼も長いので、地面が多くのエネルギーを受け取り、気温が高くなります。"
    ],
    figures: [
      { html: figOrbit(), caption: "北極側から見た図です。斜線の側が夜です。真夜中に南の空に見えるのは、地球の夜の側の先(太陽と反対側)にある星座で、夏至のころはさそり座です。太陽の方向にあるオリオン座は、昼の空にあるので見えません。" },
      { html: figTilt(), caption: "地軸の北極側は、いつも同じ向き(図の左上)に、公転面に垂直な方向から23.4°傾いています。北極側が太陽の方へ傾いている右の位置が夏至、太陽と反対側へ傾いている左の位置が冬至です。" },
      { html: figHemi({ paths: HEMI_3, label: "透明半球に記録した、夏至・春分と秋分・冬至の太陽の道すじ。夏至は北寄りから出て南中高度が高く、冬至は南寄りから出て南中高度が低い" }), caption: "北緯35°の地点の、季節ごとの太陽の道すじです(南の上の方から見た図で、右が東)。道すじは季節によって平行に移り、夏至は北寄りから出て北寄りに沈み、南中高度が高くなります。" }
    ],
    blocks: [ALT_TABLE, SEASON_TABLE, MOTION_TABLE],
    example: {
      title: "北緯35°の地点で、夏至の日の太陽の南中高度は何度ですか。地軸は、公転面に垂直な方向から23.4°傾いているものとします。",
      steps: [
        "春分・秋分の日の南中高度は、90° − 緯度 です。" + JHS.calc("90 ° − 35 °", "55 °"),
        "夏至の日は、春分・秋分の日より23.4°高くなります。" + JHS.calc("55 ° + 23.4 °", "78.4 °")
      ],
      result: dg(78.4)
    },
    fixed: [
      {
        id: "revolution",
        text: "地球の公転について、正しいものはどれですか。",
        choices: [
          "1年に1回、北極側から見て反時計回りに公転する",
          "1年に1回、北極側から見て時計回りに公転する",
          "1日に1回、北極側から見て反時計回りに公転する",
          "1か月に1回、北極側から見て反時計回りに公転する"
        ],
        answer: 0,
        explain: [
          "地球は、太陽のまわりを1年に1回、北極側から見て反時計回りに公転しています。自転の向きも、北極側から見て反時計回りです。",
          "1日に1回まわるのは自転です。"
        ]
      },
      {
        id: "constellation-shift",
        text: "毎日同じ時刻に、同じ星座を観察します。星座の位置は、1か月でどのように変わりますか。",
        choices: [
          "東から西へ、約30°動く",
          "西から東へ、約30°動く",
          "東から西へ、約15°動く",
          "ほとんど変わらない"
        ],
        answer: 0,
        explain: [
          "地球は1年(12か月)で360°公転するので、1か月で約30°動きます。そのため、同じ時刻に見える星座は、1か月に約30°ずつ東から西へずれていきます。",
          "1時間に約15°は、自転による日周運動の値です。"
        ]
      },
      {
        id: "culmination-earlier",
        text: "同じ星が南中する時刻は、1か月でどのように変わりますか。",
        choices: ["約2時間早くなる", "約2時間おそくなる", "約1時間早くなる", "約4分早くなる"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "同じ時刻の星の位置は、1か月で西へ約30°ずれます。星は自転によって1時間に約15°動くので、30°は2時間分です。",
          "そのため、1か月後には、約2時間早い時刻に同じ位置(南中)に来ます。"
        ]
      },
      {
        id: "ecliptic",
        text: "天球上での、太陽の1年の見かけの通り道を何といいますか。",
        choices: ["黄道", "子午線", "地軸", "天の川"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "地球が公転すると、地球から見た太陽は、星座の間を少しずつ西から東へ動いていくように見えます。この太陽の通り道を黄道といいます。",
          "黄道付近にある12の星座を、黄道12星座といいます。"
        ]
      },
      {
        id: "midnight-south",
        text: "図は、北極側から見た地球の公転と、4つの星座です。地球が B の位置にあるとき、真夜中に南の空に見える星座はどれですか。",
        figure: figOrbit({ keys: { spring: "A", summer: "B", autumn: "C", winter: "D" } }),
        choices: ["さそり座", "オリオン座", "しし座", "ペガスス座"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "真夜中の地点は、地球の太陽と反対側(夜の側の真ん中)です。B の地球の真夜中の地点から見て、南の空(地球の外側の方向)にあるのは、さそり座です。",
          "太陽と同じ方向にあるオリオン座は、昼の空にあるので見えません。"
        ]
      },
      {
        id: "sun-side",
        text: "地球から見て、太陽と同じ方向にある星座が、その時期に見えない理由として、正しいものはどれですか。",
        choices: [
          "太陽と同じころに空に出ていて、昼の明るい空にあるから",
          "地球の夜の側の真上にあるから",
          "地軸の傾きによって、地平線の下にかくれているから",
          "その時期は、星座が地球から遠ざかっているから"
        ],
        answer: 0,
        explain: [
          "太陽と同じ方向にある星座は、太陽といっしょに出て、いっしょに沈みます。昼の明るい空にあるので、見ることができません。",
          "反対に、太陽と反対側にある星座は、真夜中に南中します。"
        ]
      },
      {
        id: "evening-south",
        text: "図は、北極側から見た地球の公転と、4つの星座です。地球は反時計回りに公転・自転しています。地球が D の位置にあるとき、夕方に南の空に見える星座はどれですか。",
        figure: figOrbit({ keys: { spring: "A", summer: "B", autumn: "C", winter: "D" } }),
        choices: ["ペガスス座", "オリオン座", "しし座", "さそり座"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "D の地球で、太陽の方を向いた下の地点が正午、反対の上の地点が真夜中です。地球は反時計回りに自転するので、正午の次に来る右側の地点が夕方です。",
          "夕方の地点から見て南の空(地球の外側の方向)にあるのは、右のペガスス座です。真夜中に南中するのはオリオン座、太陽の方向にあるさそり座は見えません。"
        ]
      },
      {
        id: "axis-tilt",
        text: "地球の地軸は、公転面に垂直な方向から約何度傾いていますか。",
        choices: [dg(23.4), dg(15), dg(30), dg(66.6)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "地軸は、公転面に垂直な方向から約23.4°傾いています。地球は、この傾きを保ったまま公転しています。",
          "公転面そのものとの角度でいうと、" + JHS.calc("90 ° − 23.4 °", "66.6 °") + "です。問いは「垂直な方向から」の角度です。"
        ]
      },
      {
        id: "summer-position",
        text: "図は、地軸を傾けたまま公転する地球を、ななめ上から見たものです。地軸の「北」の側が北極です。夏至の日の地球の位置は、A〜D のどれですか。",
        figure: figTilt({ keys: { autumn: "A", winter: "B", spring: "C", summer: "D" } }),
        choices: ["A", "B", "C", "D"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "夏至は、北半球が太陽の光をもっとも多く受ける日で、地軸の北極側が太陽の方へ傾いている位置です。北極側は図の左上へ傾いているので、太陽の右にある D が夏至です。",
          "反対の B は北極側が太陽と反対へ傾いているので冬至、A と C は春分か秋分です。"
        ]
      },
      {
        id: "season-cause",
        text: "日本で季節の変化が起こる主な理由として、正しいものはどれですか。",
        choices: [
          "地球が、地軸を傾けたまま太陽のまわりを公転しているから",
          "地球と太陽の距離が、夏は近く、冬は遠くなるから",
          "地球の自転の速さが、季節によって変わるから",
          "太陽が出す光の量が、季節によって大きく変わるから"
        ],
        answer: 0,
        explain: [
          "地軸を傾けたまま公転するので、季節によって太陽の南中高度と昼の長さが変わります。そのため、地面が受け取るエネルギーの量が変わり、季節が生じます。",
          "地球と太陽の距離の変化は、季節の原因ではありません(南半球では、日本と季節が逆になります)。"
        ]
      },
      {
        id: "summer-sun",
        text: "日本で、夏至の日の太陽のようすとして、正しいものはどれですか。",
        choices: [
          "真東より北寄りから出て、南中高度は1年でもっとも高い",
          "真東より南寄りから出て、南中高度は1年でもっとも高い",
          "真東から出て、南中高度は1年でもっとも高い",
          "真東より北寄りから出て、南中高度は1年でもっとも低い"
        ],
        answer: 0,
        explain: [
          "夏至の日の太陽は、真東より北寄りから出て、真西より北寄りに沈みます。南中高度は1年でもっとも高く、昼がもっとも長くなります。",
          "真東から出るのは春分・秋分の日、真東より南寄りから出て南中高度がもっとも低いのは冬至の日です。"
        ]
      },
      {
        id: "light-angle",
        text: "太陽の光が地面に当たる角度と、地面が受け取るエネルギーの関係として、正しいものはどれですか。",
        choices: [
          "垂直に近い角度で当たるほど、同じ面積が受け取るエネルギーは多い",
          "ななめに当たるほど、同じ面積が受け取るエネルギーは多い",
          "当たる角度に関係なく、同じ面積が受け取るエネルギーは同じ",
          "垂直に近い角度で当たるほど、同じ面積が受け取るエネルギーは少ない"
        ],
        answer: 0,
        explain: [
          "同じ量の光でも、ななめに当たると広い面積に広がるので、一定の面積が受け取るエネルギーは少なくなります。",
          "夏は南中高度が高く、光が垂直に近い角度で当たり、昼も長いので、気温が高くなります。"
        ]
      },
      {
        id: "hemi-winter",
        text: "図の ア〜ウ は、北緯35°の地点で、夏至・春分(秋分)・冬至の日の太陽の道すじを、透明半球に記録したものです。冬至の日の道すじと、その日の日の出の方位の組み合わせとして、正しいものはどれですか。",
        figure: figHemi({ paths: [{ dec: 23.4, cls: "fig-line", key: "ア" }, { dec: 0, cls: "fig-line-2", key: "イ" }, { dec: -23.4, cls: "fig-line-3", key: "ウ" }], label: "透明半球に記録した3本の太陽の道すじの図。道すじに ア〜ウ の記号がついている。東西南北の方位が書いてある" }),
        choices: ["ウ・真東より南寄り", "ア・真東より北寄り", "ウ・真東より北寄り", "イ・真東"],
        answer: 0,
        explain: [
          "冬至の日は、南中高度がもっとも低いので、いちばん低い ウ の道すじです。",
          "冬至の日の太陽は、真東より南寄り(図の手前寄り)から出て、真西より南寄りに沈みます。ア は夏至(北寄りから出る)、イ は春分・秋分(真東から出る)です。"
        ]
      }
    ],
    generators: [
      {
        id: "culmination-altitude",
        label: "太陽の南中高度の計算(夏至・春分・秋分・冬至)",
        make: function () {
          var lat = JHS.randInt(26, 43), kind = JHS.pick(["summer", "winter", "equinox", "summer", "winter", "lat"]), c;
          var base = (90 - lat) * 10, lat10 = lat * 10;
          if (kind === "lat") {
            var sea = JHS.pick(["summer", "winter"]), given = base + ALT_ADD[sea], nm = SEASON_NAME[sea];
            function north(v) { return "北緯" + dg(v / 10); }
            var wr = sea === "summer" ? [900 - given, lat10 - 468, 900 - given + 468, given - 234] : [900 - given, lat10 + 468, given + 234, 900 - given - 468];
            c = JHS.choices4(north(lat10), wr.filter(function (v) { return v > 0 && v < 900; }).map(north));
            if (!c) return null;
            return {
              text: "ある地点で、" + nm + "の日の太陽の南中高度をはかると" + alt10(given) + "でした。この地点の緯度は、北緯何度ですか。地軸は、公転面に垂直な方向から23.4°傾いているものとします。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                nm + "の日の南中高度は、" + ALT_FORMULA[sea] + " で求めます。",
                sea === "summer"
                  ? "緯度 = 90° + 23.4° − 南中高度 なので、" + JHS.calc("90 ° + 23.4 ° − " + JHS.num(given / 10) + " °", lat + " °")
                  : "緯度 = 90° − 23.4° − 南中高度 なので、" + JHS.calc("90 ° − 23.4 ° − " + JHS.num(given / 10) + " °", lat + " °"),
                "90° − 南中高度 だけでは、春分・秋分の日の式を使ったことになり、まちがいです。"
              ],
              meta: { kind: kind, season: sea, altitude: given / 10, answer: lat }
            };
          }
          var ans = base + ALT_ADD[kind], name = kind === "equinox" ? JHS.pick(["春分", "秋分"]) : SEASON_NAME[kind];
          var wrongs = kind === "summer" ? [base - 234, base, lat10 + 234, lat10]
            : kind === "winter" ? [base + 234, base, lat10 - 234, lat10]
              : [base + 234, base - 234, lat10, lat10 + 234];
          c = JHS.choices4(alt10(ans), wrongs.map(alt10));
          if (!c) return null;
          var expr = kind === "summer" ? "90 ° − " + lat + " ° + 23.4 °" : kind === "winter" ? "90 ° − " + lat + " ° − 23.4 °" : "90 ° − " + lat + " °";
          return {
            text: "北緯" + dg(lat) + "の地点で、" + name + "の日の太陽の南中高度は何度ですか。地軸は、公転面に垂直な方向から23.4°傾いているものとします。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              name + "の日の南中高度は、" + ALT_FORMULA[kind] + " で求めます。",
              JHS.calc(expr, JHS.num(ans / 10) + " °"),
              kind === "summer" ? "23.4°を引くのは冬至の式です。緯度に23.4°を足すのではなく、90°から緯度を引いた値に足します。"
                : kind === "winter" ? "23.4°を足すのは夏至の式です。緯度から23.4°を引くのではなく、90°から緯度を引いた値から引きます。"
                  : "春分・秋分の日は、23.4°を足したり引いたりしません。緯度そのものではなく、90°から緯度を引きます。"
            ],
            meta: { kind: kind, latitude: lat, answer: ans / 10 }
          };
        }
      },
      {
        id: "culmination-time",
        label: "星が南中する時刻の変化(1か月に約2時間)",
        make: function () {
          // 答えが18〜23時になる組だけ(24時をまたがない)
          var combos = [];
          for (var t = 18; t <= 23; t++) [1, 2, 3].forEach(function (mm) { [true, false].forEach(function (af) { var v = af ? t - 2 * mm : t + 2 * mm; if (v >= 18 && v <= 23) combos.push([t, mm, af]); }); });
          var cb = JHS.pick(combos), M = JHS.randInt(1, 12), T = cb[0], m = cb[1], after = cb[2];
          var ans = after ? T - 2 * m : T + 2 * m;
          var M2 = monthAdd(M, after ? m : -m);
          var c = JHS.choices4(hourText(ans), [hourText(after ? T + 2 * m : T - 2 * m), hourText(after ? T - m : T + m), hourText(after ? T - 4 * m : T + 4 * m), hourText(T)]);
          if (!c) return null;
          return {
            text: "ある星が、" + M + "月15日の" + T + "時に南中しました。" + m + "か月" + (after ? "後" : "前") + "の" + M2 + "月15日に、この星が南中するのは何時ごろですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "地球の公転によって、同じ星が南中する時刻は、1か月に約2時間ずつ早くなります。",
              after
                ? m + "か月後なので、" + JHS.calc("2 時間 × " + m, 2 * m + " 時間") + "早くなり、" + T + "時の" + (2 * m) + "時間前の<b>" + hourText(ans) + "</b>ごろです。"
                : m + "か月前なので、反対に " + JHS.calc("2 時間 × " + m, 2 * m + " 時間") + "おそくなり、" + T + "時の" + (2 * m) + "時間後の<b>" + hourText(ans) + "</b>ごろです。",
              "1か月に1時間ではなく、約2時間です(1か月に約30°は、自転の2時間分)。"
            ],
            meta: { month: M, hour: T, months: after ? m : -m, answer: ans }
          };
        }
      },
      {
        id: "star-position",
        label: "年周運動と日周運動を合わせた、星の位置(1か月30°・1時間15°)",
        make: function () {
          var M = JHS.randInt(1, 12), T = JHS.randInt(19, 22), m = JHS.pick([1, 2, 3, -1, -2]), h = JHS.randInt(-3, 3);
          if (T + h < 18 || T + h > 23) return null;
          var a = 30 * m + 15 * h;
          if (Math.abs(a) > 90) return null;
          function where(v) { return v === 0 ? "真南" : "南から" + (v > 0 ? "西" : "東") + "へ約" + Math.abs(v) + "°"; }
          var cand = [30 * m - 15 * h, -a, 15 * m + 15 * h, 30 * m + 30 * h, a + 30, a - 30].filter(function (v) { return Math.abs(v) <= 150; });
          var c = JHS.choices4(where(a), cand.map(where));
          if (!c) return null;
          var M2 = monthAdd(M, m), am = Math.abs(m), ah = Math.abs(h);
          var lineM = m > 0
            ? m + "か月後の同じ" + T + "時には、公転によって西へ " + JHS.calc("30 ° × " + am, 30 * am + " °") + "ずれます。"
            : am + "か月前の同じ" + T + "時には、公転による動きを逆にたどるので、東へ " + JHS.calc("30 ° × " + am, 30 * am + " °") + "ずれた位置です。";
          var lineH = h === 0 ? "時刻は同じ" + T + "時なので、自転による動きは考えません。"
            : h > 0 ? (T + h) + "時は" + T + "時の" + ah + "時間後なので、" + (m > 0 ? "さらに" : "") + "西へ " + JHS.calc("15 ° × " + ah, 15 * ah + " °") + "動きます。"
              : (T + h) + "時は" + T + "時の" + ah + "時間前なので、東へ " + JHS.calc("15 ° × " + ah, 15 * ah + " °") + "もどります。";
          return {
            text: "ある星が、" + M + "月15日の" + T + "時に南中しました。" + am + "か月" + (m > 0 ? "後" : "前") + "の" + M2 + "月15日の" + (T + h) + "時には、この星はどの位置に見えますか。",
            choices: c.choices, answer: c.answer,
            explain: [
              "同じ時刻の星の位置は、1か月に約30°東から西へずれ(年周運動)、1日の中では1時間に約15°東から西へ動きます(日周運動)。",
              lineM,
              lineH + "合わせると、<b>" + where(a) + "</b>です。"
            ],
            meta: { month: M, hour: T, months: m, hours: h, westDeg: a, answer: Math.abs(a) }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-16 月と金星の見え方
  // =====================================================================
  // 光っている側は fig-lit(どちらの表示でも明るい黄色)、影の側は斜線(shade)で表す。図の中に凡例を入れ、
  // 説明文でも「明るくぬった側が光っている側」と書く。
  // 地球から見た形。alpha: 位相角(0 = 満月の形、180 = 新月の形)、side: 光っている側("right" / "left")
  function phaseIcon(cx, cy, R, alpha, side) {
    var c = ' cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(R) + '"/>', s = shade("<circle" + c);
    if (alpha <= 0.5) {
      s += '<circle class="fig-lit"' + c;
    } else if (alpha < 179.5) {
      var k = Math.cos(alpha * RAD), rx = R * Math.abs(k), right = side === "right";
      var d = "M" + n1(cx) + " " + n1(cy - R) + "A" + n1(R) + " " + n1(R) + " 0 0 " + (right ? 1 : 0) + " " + n1(cx) + " " + n1(cy + R);
      // 明暗の境目: 細い形(k < 0)は光っている側を、ふくらんだ形(k > 0)は反対側を通って上へもどる
      var viaRight = (k < 0) === right;
      d += "A" + n1(rx) + " " + n1(R) + " 0 0 " + (viaRight ? 0 : 1) + " " + n1(cx) + " " + n1(cy - R) + "Z";
      s += '<path class="fig-lit" d="' + d + '"/>';
    }
    return s + '<circle class="fig-detail"' + c;
  }
  // 宇宙から見た形(左から光が当たり、左半分が光っている)
  function halfLit(cx, cy, R) {
    var c = ' cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + R + '"/>';
    return shade("<circle" + c) + '<path class="fig-lit" d="M' + n1(cx) + " " + n1(cy - R) + "A" + R + " " + R + " 0 0 0 " + n1(cx) + " " + n1(cy + R) + 'Z"/>' +
      '<circle class="fig-detail"' + c;
  }
  function legend(x, y) {
    return '<rect class="fig-lit" x="' + x + '" y="' + (y - 10) + '" width="12" height="12"/><rect class="fig-detail" x="' + x + '" y="' + (y - 10) + '" width="12" height="12"/>' +
      txt(x + 17, y + 1, "光っている側", { cls: "fig-small" }) +
      shade('<rect x="' + x + '" y="' + (y + 8) + '" width="12" height="12"/>') + '<rect class="fig-detail" x="' + x + '" y="' + (y + 8) + '" width="12" height="12"/>' +
      txt(x + 17, y + 19, "影の側", { cls: "fig-small" });
  }

  // 月の公転と満ち欠け(北極側から見た図。太陽の光は左から)。月の位置 A〜H は、A(新月)から反時計回り
  var MOON_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  function moonAngle(i) { return (180 + 45 * i) % 360; }
  var MOON_NAME = { A: "新月", B: "三日月", C: "上弦の月", E: "満月", G: "下弦の月" };
  // o.outer: true で、外側に地球から見た形と名前(要点帳)。o.keys: true で、月の位置に A〜H の記号(問題用)
  function figMoon(o) {
    o = o || {};
    var cx = 182, cy = o.outer ? 150 : 112, R = 64, s = "", lab = "";
    [-60, 0, 60].forEach(function (dy) { s += JHS.arrow(8, cy + dy, o.outer ? 46 : 62, cy + dy); });
    lab += txt(8, cy - 78, "太陽の光", { cls: "fig-small" });
    s += '<circle class="fig-thin" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    s += curveArrow(arcD(cx, cy, R, 102, 124), "fig-shape");
    s += '<circle class="fig-lit" cx="' + cx + '" cy="' + cy + '" r="14"/>' + shade('<path d="M' + cx + " " + (cy - 14) + "A14 14 0 0 1 " + cx + " " + (cy + 14) + 'Z"/>') +
      '<circle class="fig-shape" cx="' + cx + '" cy="' + cy + '" r="14"/>';
    lab += txt(cx, cy + 32, "地球", { cls: "fig-small", anchor: "middle", halo: true });
    MOON_KEYS.forEach(function (k, i) {
      var a = moonAngle(i), p = onCircle(cx, cy, R, a);
      s += halfLit(p[0], p[1], 9);
      if (o.keys) { var kp = onCircle(cx, cy, R + 22, a); lab += JHS.key(kp[0], kp[1], k); }
      if (o.outer) {
        var op = onCircle(cx, cy, 108, a), el = Math.abs(((a - 180 + 540) % 360) - 180);
        s += phaseIcon(op[0], op[1], 12, 180 - el, a > 180 ? "right" : "left");
        if (MOON_NAME[k]) lab += txt(op[0], k === "G" ? op[1] - 17 : op[1] + 27, MOON_NAME[k], { cls: "fig-small", anchor: "middle", halo: true });
      }
    });
    if (o.outer) {
      lab += legend(8, 270);
      return JHS.svg(320, 300, "北極側から見た月の公転。太陽の光は左から当たり、月は地球のまわりを反時計回りに公転する。内側は宇宙から見た月、外側は地球から見た月の形で、新月・三日月・上弦の月・満月・下弦の月の順に変わる", s + lab);
    }
    lab += legend(8, 196);
    return JHS.svg(320, 226, "北極側から見た月の公転の図。太陽の光は左から当たり、月は地球のまわりを反時計回りに公転する。月の8つの位置に A〜H の記号がついている", s + lab);
  }

  // 日食と月食の並び。o.only: "lunar" で月食の並びだけ(名前なし、問題用)
  function eclipseRow(y, kind) {
    var s = "", sunX = 44;
    s += '<circle class="fig-shape fig-fill" cx="' + sunX + '" cy="' + y + '" r="28"/>' + txt(sunX, y + 4, "太陽", { cls: "fig-small", anchor: "middle" });
    if (kind === "solar") {
      s += shade('<path d="M190 ' + (y - 7) + "L251 " + (y - 3) + "V" + (y + 3) + "L190 " + (y + 7) + 'Z"/>');
      s += '<circle class="fig-shape fig-fill-0" cx="268" cy="' + y + '" r="18"/>';
      s += halfLit(190, y, 7);
      s += txt(190, y + 30, "月", { cls: "fig-small", anchor: "middle" }) + txt(268, y + 34, "地球", { cls: "fig-small", anchor: "middle" });
    } else {
      s += shade('<path d="M180 ' + (y - 18) + "L300 " + (y - 11) + "V" + (y + 11) + "L180 " + (y + 18) + 'Z"/>');
      s += halfLit(180, y, 18);
      s += '<circle class="fig-detail" cx="272" cy="' + y + '" r="7"/>';
      s += txt(180, y + 34, "地球", { cls: "fig-small", anchor: "middle" }) + txt(272, y + 30, "月", { cls: "fig-small", anchor: "middle" });
    }
    s += '<path class="fig-dash" d="M76 ' + (y - 24) + "L150 " + (y - 24) + "M76 " + (y + 24) + "L150 " + (y + 24) + '"/>';
    return s;
  }
  function figEclipse(o) {
    o = o || {};
    if (o.only === "lunar") return JHS.svg(320, 104, "太陽・地球・月が一直線に並んだ図。左から太陽、地球、月の順で、月は地球の影(斜線)の中にある", eclipseRow(46, "lunar"));
    var s = txt(8, 18, "日食(新月)") + eclipseRow(62, "solar") + txt(8, 120, "月食(満月)") + eclipseRow(160, "lunar");
    return JHS.svg(320, 206, "日食と月食の並び。日食は太陽・月・地球の順に並び、月の影が地球にかかる。月食は太陽・地球・月の順に並び、月が地球の影に入る", s);
  }

  // 金星の位置と見え方(北極側から見た図)。地球は下に固定し、金星の位置 ア〜オ をかく
  var VENUS = [
    { key: "ア", ang: 190 }, { key: "イ", ang: 245 }, { key: "ウ", ang: 270 }, { key: "エ", ang: 295 }, { key: "オ", ang: 350 }
  ];
  // 地球から見た金星の、相対的な大きさ(距離の逆数)と位相角
  function venusLook(ang) {
    var vx = 0.72 * Math.cos(ang * RAD), vy = 0.72 * Math.sin(ang * RAD), ex = 0 - vx, ey = -1 - vy, d = Math.sqrt(ex * ex + ey * ey);
    var cosA = (-vx * ex + -vy * ey) / (0.72 * d);
    return { dist: d, alpha: Math.acos(Math.max(-1, Math.min(1, cosA))) / RAD };
  }
  // o.view: true で、下に地球から見た形と、よいの明星・明けの明星の文字を出す(要点帳)
  function figVenus(o) {
    o = o || {};
    var cx = 160, cy = 96, s = "", lab = "";
    s += '<circle class="fig-thin" cx="' + cx + '" cy="' + cy + '" r="84"/><circle class="fig-thin" cx="' + cx + '" cy="' + cy + '" r="60"/>';
    s += curveArrow(arcD(cx, cy, 84, 18, 40), "fig-shape") + curveArrow(arcD(cx, cy, 60, 118, 142), "fig-shape");
    s += '<circle class="fig-shape fig-fill" cx="' + cx + '" cy="' + cy + '" r="14"/>' + txt(cx, cy + 4, "太陽", { cls: "fig-small", anchor: "middle" });
    s += smallEarth(cx, cy + 84, 9, cx, cy);
    lab += txt(cx + 14, cy + 102, "地球", { cls: "fig-small", halo: true });
    VENUS.forEach(function (v) {
      var p = onCircle(cx, cy, 60, v.ang), kp = onCircle(cx, cy, v.key === "ウ" ? 42 : 78, v.ang);
      s += '<circle class="fig-shape fig-fill-0" cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="5"/>';
      lab += JHS.key(kp[0], kp[1], v.key);
    });
    if (!o.view) return JHS.svg(320, 210, "北極側から見た、太陽・金星・地球の図。内側の円が金星、外側の円が地球の公転軌道で、どちらも反時計回り。金星の5つの位置に ア〜オ の記号がついている", s + lab);
    lab += txt(8, 160, "よいの明星", { cls: "fig-small" }) + txt(312, 160, "明けの明星", { cls: "fig-small", anchor: "end" });
    var xs = { ア: 40, イ: 106, ウ: 160, エ: 214, オ: 280 };
    VENUS.forEach(function (v) {
      var x = xs[v.key];
      if (v.key === "ウ") lab += txt(x, 256, "見えない", { cls: "fig-small", anchor: "middle" });
      else {
        var lk = venusLook(v.ang);
        s += phaseIcon(x, 252, 11.5 / lk.dist, lk.alpha, v.ang < 270 ? "right" : "left");
      }
      lab += JHS.key(x, 294, v.key);
    });
    s += '<path class="fig-thin" d="M8 218H312"/>';
    return JHS.svg(320, 310, "金星の位置と見え方。左側の ア・イ はよいの明星、右側の エ・オ は明けの明星で、ウ は見えない。下は地球から見た形で、地球に近い イ・エ は大きく見えて大きく欠けている", s + lab);
  }

  var MOON_TABLE = JHS.table({
    caption: "月の形と、見える時刻・方角",
    head: ["月の形", "見える時刻と方角"],
    rows: [
      ["三日月", "夕方、西の空"],
      ["上弦の月", "夕方、南の空(右半分が光る)"],
      ["満月", "夕方に東から出て、真夜中に南中"],
      ["下弦の月", "明け方、南の空(左半分が光る)"]
    ]
  });
  var ECLIPSE_TABLE = JHS.table({
    head: ["", "日食", "月食"],
    rows: [
      ["月の形", "新月", "満月"],
      ["並び方", "太陽−月−地球", "太陽−地球−月"],
      ["かくれるもの", "太陽", "月"]
    ]
  });
  var VENUS_TABLE = JHS.table({
    head: ["", "よいの明星", "明けの明星"],
    rows: [
      ["時刻", "夕方", "明け方"],
      ["方角", "西の空", "東の空"],
      ["光る側", "右側", "左側"]
    ]
  });

  var MOON_WHEN = { B: "夕方、西の空に見える", C: "夕方、南の空に見える", E: "真夜中、南の空に見える", G: "明け方、南の空に見える", H: "明け方、東の空に見える" };
  var MOON_WHY = {
    A: "A は地球から見て太陽と同じ方向にあり、地球には光っていない面が向いているので、新月です。",
    B: "B は A(新月)から少し進んだ位置で、地球からは右側が細く光って見える三日月です。夕方の地点から見ると、西の空にあります。",
    C: "C は、地球から見て太陽と90°はなれた位置で、右半分が光って見える上弦の月です。夕方の地点から見ると、南の空にあります。",
    E: "E は太陽と反対側にあり、光っている面が全部見える満月です。真夜中の地点から見ると、南の空にあります。",
    G: "G は C の反対側で、左半分が光って見える下弦の月です。明け方の地点から見ると、南の空にあります。",
    H: "H は新月の少し前の位置で、左側が細く光って見えます。明け方の地点から見ると、東の空にあります。"
  };
  var MOON_BASE = "太陽の光は図の左から当たります。地球は反時計回りに自転するので、地球の下側が夕方、右側が真夜中、上側が明け方の地点です。";

  var VENUS_INFO = {
    ア: { when: "夕方、西の空に見える", look: "小さく見え、欠け方は小さく、右側が光っている", desc: "よいの明星のうち、小さく見えて、欠け方が小さい" },
    イ: { when: "夕方、西の空に見える", look: "大きく見え、大きく欠けていて、右側が光っている", desc: "よいの明星のうち、大きく見えて、大きく欠けている" },
    ウ: { when: "太陽と同じ方向にあり、見えない", desc: "地球から見て太陽と同じ方向にあり、見ることができない" },
    エ: { when: "明け方、東の空に見える", look: "大きく見え、大きく欠けていて、左側が光っている", desc: "明けの明星のうち、大きく見えて、大きく欠けている" },
    オ: { when: "明け方、東の空に見える", look: "小さく見え、欠け方は小さく、左側が光っている", desc: "明けの明星のうち、小さく見えて、欠け方が小さい" }
  };
  var VENUS_WHY = {
    ア: "ア は太陽の左側にあるので、夕方の西の空に見えるよいの明星です。地球から遠いので小さく見え、欠け方は小さくなります。",
    イ: "イ は太陽の左側にあるので、夕方の西の空に見えるよいの明星です。地球に近いので大きく見え、大きく欠けています。",
    ウ: "ウ は地球と太陽の間にあり、地球から見て太陽と同じ方向なので見えません(光っている面も地球と反対側を向いています)。",
    エ: "エ は太陽の右側にあるので、明け方の東の空に見える明けの明星です。地球に近いので大きく見え、大きく欠けています。",
    オ: "オ は太陽の右側にあるので、明け方の東の空に見える明けの明星です。地球から遠いので小さく見え、欠け方は小さくなります。"
  };
  var VENUS_BASE = "地球は反時計回りに自転するので、地球の左側が夕方、右側が明け方の地点です。夕方の地点からは太陽の左側の金星が西の空に、明け方の地点からは太陽の右側の金星が東の空に見えます。";

  JHS.register("g3-moon-venus", {
    points: [
      "月は地球のまわりを公転する<b>" + r("衛星", "えいせい") + "</b>で、自分では光を出さず、" + rule("太陽の光を反射して光って") + "います。北極側から見ると、地球のまわりを反時計回りに公転しています。",
      "月と太陽の位置関係が変わるので、地球から見た月の形は、" + rule("新月 → 三日月 → 上弦の月 → 満月 → 下弦の月 → 新月") + "と、約29.5日で変わります。これを月の<b>満ち欠け</b>といいます。",
      rule("三日月は夕方の西の空、上弦の月(右半分が光る)は夕方の南の空") + "に見えます。<b>満月</b>は夕方に東から出て、真夜中に南中し、明け方に西に沈みます。" + rule("下弦の月(左半分が光る)は明け方の南の空") + "に見えます。",
      "同じ時刻に見える月の位置は、" + rule("1日に約12°ずつ東へ") + "ずれ、月の出は1日に約50分ずつおそくなります。月は、公転の周期と自転の周期が同じなので、いつも同じ面を地球に向けています。",
      "<b>日食</b>は、" + rule("太陽 − 月 − 地球") + "の順に一直線に並び、月が太陽をかくす現象で、新月のときに起こります。<b>月食</b>は、" + rule("太陽 − 地球 − 月") + "の順に並び、月が地球の影に入る現象で、満月のときに起こります。月の公転面は地球の公転面から少し傾いているので、毎月は起こりません。",
      "金星は地球より内側を公転しているので、" + rule("真夜中には見えません") + "。" + rule("夕方の西の空に見える金星をよいの明星、明け方の東の空に見える金星を明けの明星") + "といいます。金星は満ち欠けし、" + rule("地球に近いほど大きく見え、大きく欠けて") + "見えます。"
    ],
    figures: [
      { html: figMoon({ outer: true }), caption: "明るくぬった側が光っている側、斜線の側が影の側です。内側は宇宙から見た月で、いつも太陽の側(左側)の半分が光っています。外側は、それぞれの位置の月を地球から見た形です。月は反時計回りに公転し、新月 → 三日月 → 上弦の月 → 満月 → 下弦の月と変わります。" },
      { html: figEclipse(), caption: "日食は、月が太陽と地球の間に入り、月の影(斜線)が地球にかかるときに起こります。月食は、地球が太陽と月の間に入り、月が地球の影(斜線)に入るときに起こります。" },
      { html: figVenus({ view: true }), caption: "北極側から見た図で、地球は下にあります。太陽の左側の ア・イ はよいの明星、右側の エ・オ は明けの明星で、地球と太陽の間の ウ は見えません。下は地球から見た形(明るくぬった側が光っている側)で、同じ倍率で見たときの大きさの比べです。" }
    ],
    blocks: [MOON_TABLE, ECLIPSE_TABLE, VENUS_TABLE],
    example: {
      title: "ある日の夕方、南の空に、右半分が光っている月が見えました。この月を何といいますか。また、約1週間後の夕方には、月はどのような形で、どの方角に見えますか。",
      steps: [
        "夕方に南の空に見え、右半分が光っている月は、<b>上弦の月</b>です。",
        "月の満ち欠けは約29.5日で1回りするので、約1週間で4分の1進みます。上弦の月の約1週間後は満月です。",
        "満月は、夕方に東の空から出てきます。"
      ],
      result: "上弦の月。約1週間後の夕方は、満月が東の空に見える"
    },
    fixed: [
      {
        id: "moon-cycle",
        text: "月の満ち欠けの周期(新月から次の新月まで)は、約何日ですか。",
        choices: ["約29.5日", "約7日", "約15日", "約365日"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "月の満ち欠けは、約29.5日で1回りします(約1か月)。",
          "新月から上弦の月、満月、下弦の月までは、それぞれ約1週間ずつです。"
        ]
      },
      {
        id: "moon-light",
        text: "月が光って見える理由として、正しいものはどれですか。",
        choices: [
          "太陽の光を反射しているから",
          "月そのものが光を出しているから",
          "地球の光を反射しているから",
          "月の表面で火山が活動しているから"
        ],
        answer: 0,
        explain: [
          "月は自分では光を出さず、太陽の光を反射して光っています。",
          "そのため、月の太陽の側の半分だけが光り、地球からの見え方によって形が変わります。"
        ]
      },
      {
        id: "phase-order",
        text: "新月から始まる月の満ち欠けの順として、正しいものはどれですか。",
        choices: [
          "新月 → 三日月 → 上弦の月 → 満月 → 下弦の月",
          "新月 → 三日月 → 下弦の月 → 満月 → 上弦の月",
          "新月 → 上弦の月 → 三日月 → 満月 → 下弦の月",
          "新月 → 満月 → 三日月 → 上弦の月 → 下弦の月"
        ],
        answer: 0,
        explain: [
          "新月のあと、右側が細く光る三日月になり、右半分が光る上弦の月、全体が光る満月、左半分が光る下弦の月と変わって、新月にもどります。",
          "上弦の月は満月の前、下弦の月は満月のあとです。"
        ]
      },
      {
        id: "moon-first-quarter",
        text: "図は、北極側から見た地球と月の位置です(明るくぬった側が月の光っている側)。上弦の月が見えるのは、月が A〜H のどの位置にあるときですか。",
        figure: figMoon({ keys: true }),
        choices: ["C", "G", "E", "A"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          MOON_BASE,
          "上弦の月は、夕方の南の空に見える、右半分が光った月です。夕方の地点(地球の下側)から見て南(地球の外側の方向)にある C です。",
          "G は下弦の月、E は満月、A は新月の位置です。"
        ]
      },
      {
        id: "moon-g",
        text: "図は、北極側から見た地球と月の位置です(明るくぬった側が月の光っている側)。月が G の位置にあるとき、地球から見える月を何といいますか。",
        figure: figMoon({ keys: true }),
        choices: ["下弦の月", "上弦の月", "満月", "三日月"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "G の月は、地球から見て太陽と90°はなれていて、光っている面の半分が見えます。",
          "G の月は明け方の地点(地球の上側)から見て南の空にあり、左半分が光って見えるので、下弦の月です。右半分が光る上弦の月は、反対側の C です。"
        ]
      },
      {
        id: "full-moon",
        text: "満月の見え方として、正しいものはどれですか。",
        choices: [
          "夕方に東から出て、真夜中に南中し、明け方に西に沈む",
          "夕方に西の空に見え、すぐに沈む",
          "真夜中に東から出て、明け方に南中する",
          "明け方に東から出て、正午に南中する"
        ],
        answer: 0,
        explain: [
          "満月は、地球から見て太陽と反対側にあります。そのため、太陽が西に沈むころに東から出て、真夜中に南中し、太陽が出るころに西に沈みます。",
          "夕方に西の空に見えてすぐ沈むのは、三日月です。"
        ]
      },
      {
        id: "first-quarter",
        text: "上弦の月について、正しいものはどれですか。",
        choices: [
          "夕方に南の空に見え、右半分が光っている",
          "夕方に南の空に見え、左半分が光っている",
          "明け方に南の空に見え、右半分が光っている",
          "明け方に南の空に見え、左半分が光っている"
        ],
        answer: 0,
        explain: [
          "上弦の月は、新月と満月の間の半月で、夕方に南の空に見えます。西の空にある太陽の側の、右半分が光っています。",
          "明け方に南の空に見え、左半分が光っているのは、下弦の月です。"
        ]
      },
      {
        id: "last-quarter",
        text: "明け方の南の空に半月が見えました。この月について、正しいものはどれですか。",
        choices: [
          "下弦の月で、左半分が光っている",
          "下弦の月で、右半分が光っている",
          "上弦の月で、左半分が光っている",
          "上弦の月で、右半分が光っている"
        ],
        answer: 0,
        explain: [
          "明け方の南の空に見える半月は、下弦の月です。太陽は東の空にあるので、東の側の左半分が光っています。",
          "上弦の月は、夕方の南の空に見え、右半分が光っています。"
        ]
      },
      {
        id: "moon-daily",
        text: "毎日同じ時刻に月を観察すると、月の位置と形はどのように変わりますか(新月から満月までの間)。",
        choices: [
          "位置は1日に約12°ずつ東へずれ、光っている部分がふえていく",
          "位置は1日に約12°ずつ西へずれ、光っている部分がふえていく",
          "位置は1日に約15°ずつ西へずれ、光っている部分がへっていく",
          "位置は変わらず、形だけが変わっていく"
        ],
        answer: 0,
        explain: [
          "月は約29.5日で地球のまわりを1回公転するので、同じ時刻に見える月の位置は、1日に約12°ずつ東へずれます。月の出も、1日に約50分ずつおそくなります。",
          "新月から満月までは、光っている部分がふえていきます(三日月 → 上弦の月 → 満月)。"
        ]
      },
      {
        id: "same-face",
        text: "月が、いつも同じ面を地球に向けている理由として、正しいものはどれですか。",
        choices: [
          "月の公転の周期と、自転の周期が同じだから",
          "月は自転をしていないから",
          "月の公転の周期が、地球の自転の周期と同じだから",
          "月の裏側には、太陽の光が当たらないから"
        ],
        answer: 0,
        explain: [
          "月は、地球のまわりを1回公転する間に、ちょうど1回自転します。そのため、いつも同じ面を地球に向けています。",
          "月の裏側にも太陽の光は当たります(新月のころは、裏側が昼です)。"
        ]
      },
      {
        id: "eclipse-figure",
        text: "図のように、太陽・地球・月が一直線に並びました。このとき起こることがある現象と、そのときの月の形の組み合わせとして、正しいものはどれですか。",
        figure: figEclipse({ only: "lunar" }),
        choices: ["月食・満月", "日食・新月", "日食・満月", "月食・新月"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "太陽 − 地球 − 月の順に並ぶと、月が地球の影に入り、月がかけて見えます。これが月食で、満月のときに起こります。",
          "日食は、太陽 − 月 − 地球の順に並び、新月のときに起こります。"
        ]
      },
      {
        id: "solar-eclipse",
        text: "日食が起こるときの、太陽・月・地球の並び方と、そのときの月の形の組み合わせとして、正しいものはどれですか。",
        choices: [
          "太陽 − 月 − 地球 の順・新月",
          "太陽 − 地球 − 月 の順・満月",
          "太陽 − 月 − 地球 の順・満月",
          "太陽 − 地球 − 月 の順・新月"
        ],
        answer: 0,
        explain: [
          "日食は、月が太陽と地球の間に入り、太陽をかくす現象です。太陽 − 月 − 地球の順に並ぶので、新月のときに起こります。",
          "太陽 − 地球 − 月の順に並ぶのは月食で、満月のときに起こります。"
        ]
      },
      {
        id: "venus-midnight",
        text: "金星が真夜中に見えない理由として、正しいものはどれですか。",
        choices: [
          "金星は地球より内側を公転していて、地球から見ていつも太陽に近い方向にあるから",
          "金星は地球より外側を公転していて、地球から遠すぎるから",
          "金星は太陽の光を反射しないから",
          "金星は真夜中には、地球のかげに入るから"
        ],
        answer: 0,
        explain: [
          "金星は地球より内側を公転しているので、地球から見ると、いつも太陽からあまりはなれていない方向にあります。",
          "真夜中の地点は太陽と反対の方向を向いているので、金星を見ることはできません。金星は、夕方の西の空か、明け方の東の空に見えます。"
        ]
      },
      {
        id: "venus-figure",
        text: "図は、北極側から見た太陽・金星・地球の位置です。明けの明星として見え、もっとも大きく欠けて見える金星の位置は、ア〜オ のどれですか。",
        figure: figVenus(),
        choices: ["エ", "イ", "オ", "ウ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          VENUS_BASE,
          "明けの明星は太陽の右側の エ・オ です。地球に近いほど大きく見え、大きく欠けるので、エ です。",
          "イ は大きく欠けたよいの明星、オ は小さく見えて欠け方の小さい明けの明星、ウ は太陽と同じ方向にあって見えません。"
        ]
      }
    ],
    generators: [
      {
        id: "moon-position",
        label: "月の位置と、見える形・時刻・方角(公転の図)",
        make: function () {
          var kind = JHS.pick(["name-to-pos", "pos-to-name", "pos-to-when"]), named = ["A", "B", "C", "E", "G"], k, c;
          var fig = figMoon({ keys: true }), head = "図は、北極側から見た地球と月の位置です(明るくぬった側が月の光っている側)。";
          if (kind === "name-to-pos") {
            k = JHS.pick(["B", "C", "E", "G"]);
            var mirror = { B: "H", C: "G", E: "A", G: "C" }[k];
            c = JHS.choices4(k, JHS.shuffle([mirror].concat(JHS.shuffle(named.filter(function (x) { return x !== k && x !== mirror; })))));
            if (!c) return null;
            var letters = c.choices.slice().sort();
            return {
              text: head + MOON_NAME[k] + "が見えるのは、月が A〜H のどの位置にあるときですか。",
              figure: fig,
              choices: letters, answer: letters.indexOf(k), choiceLayout: "grid",
              explain: [MOON_BASE, MOON_WHY[k]],
              meta: { kind: kind, answerKey: k }
            };
          }
          if (kind === "pos-to-name") {
            k = JHS.pick(named);
            var names = ["新月", "三日月", "上弦の月", "満月", "下弦の月"];
            c = JHS.choices4(MOON_NAME[k], JHS.shuffle(names.filter(function (x) { return x !== MOON_NAME[k]; })));
            if (!c) return null;
            return {
              text: head + "月が " + k + " の位置にあるとき、地球から見える月を何といいますか。",
              figure: fig,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [MOON_BASE, MOON_WHY[k]],
              meta: { kind: kind, key: k, answerText: MOON_NAME[k] }
            };
          }
          k = JHS.pick(["B", "C", "E", "G", "H"]);
          c = JHS.choices4(MOON_WHEN[k], JHS.shuffle(Object.keys(MOON_WHEN).filter(function (x) { return x !== k; }).map(function (x) { return MOON_WHEN[x]; })));
          if (!c) return null;
          return {
            text: head + "月が " + k + " の位置にあるとき、月はいつ、どの方角の空に見えますか。",
            figure: fig,
            choices: c.choices, answer: c.answer,
            explain: [MOON_BASE, MOON_WHY[k]],
            meta: { kind: kind, key: k, answerText: MOON_WHEN[k] }
          };
        }
      },
      {
        id: "moon-shift",
        label: "月の位置のずれと、月の出の時刻(1日に約12°・約50分)",
        make: function () {
          var n = JHS.randInt(1, 4), c;
          function to(dir, v) { return dir + "へ約" + v + "°"; }
          if (Math.random() < 0.5) {
            var T = JHS.pick([18, 19, 20, 21]);
            c = JHS.choices4(to("東", 12 * n), [to("西", 12 * n), to("東", 15 * n), to("西", 15 * n), to("東", 30 * n)]);
            if (!c) return null;
            return {
              text: "ある日の" + T + "時に、南の空に月が見えました。" + n + "日後の同じ" + T + "時に月を観察すると、月の位置は、どちらの向きに約何度ずれていますか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "月は地球のまわりを西から東へ公転していて、太陽との位置関係は約29.5日で1回りします。そのため、同じ時刻に見える月の位置は、1日に約12°(360° ÷ 29.5)ずつ東へずれます。",
                JHS.calc("12 ° × " + n, 12 * n + " °") + "なので、<b>東へ約" + (12 * n) + "°</b>です。",
                "1時間に約15°は、自転による日周運動の値です。日周運動とは逆の、東向きにずれることに注意します。"
              ],
              meta: { kind: "shift", days: n, answer: 12 * n }
            };
          }
          var start = JHS.pick([960, 990, 1020, 1050, 1080, 1110, 1140]) + JHS.pick([0, 10, 20]), ans = start + 50 * n;
          if (ans >= 1440) return null;
          c = JHS.choices4(clock(ans), [clock(start - 50 * n), clock(start + 60 * n), clock(start + 30 * n), clock(start + 100 * n)]);
          if (!c) return null;
          return {
            text: "ある日の月の出は" + clock(start) + "でした。" + n + "日後の月の出は、およそ何時何分ですか。月の出は、1日に約50分ずつおそくなるものとします。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "月は公転によって、同じ時刻の位置が1日に約12°ずつ東へずれるので、月の出は1日に約50分ずつおそくなります。",
              JHS.calc("50 分 × " + n, 50 * n + " 分") + "おそくなるので、" + clock(start) + "の" + span(50 * n) + "後の<b>" + clock(ans) + "</b>ごろです。",
              "早くなるのではなく、おそくなります。"
            ],
            meta: { kind: "moonrise", days: n, startMin: start, answerMin: ans, answerText: clock(ans) }
          };
        }
      },
      {
        id: "venus-position",
        label: "金星の位置と、見える時刻・方角・形(公転の図)",
        make: function () {
          var kind = JHS.pick(["when", "desc", "look"]), fig = figVenus(), c, k;
          var head = "図は、北極側から見た太陽・金星・地球の位置です。";
          if (kind === "when") {
            k = JHS.pick(KANA);
            var pool = ["夕方、西の空に見える", "明け方、東の空に見える", "真夜中、南の空に見える", "夕方、東の空に見える", "明け方、西の空に見える", "太陽と同じ方向にあり、見えない"];
            c = JHS.choices4(VENUS_INFO[k].when, ["真夜中、南の空に見える"].concat(JHS.shuffle(pool.filter(function (x) { return x !== VENUS_INFO[k].when && x !== "真夜中、南の空に見える"; }))));
            if (!c) return null;
            return {
              text: head + "金星が " + k + " の位置にあるとき、金星はいつ、どの方角の空に見えますか。",
              figure: fig,
              choices: c.choices, answer: c.answer,
              explain: [VENUS_BASE, VENUS_WHY[k], "金星は地球より内側を公転しているので、真夜中には見えません。"],
              meta: { kind: kind, key: k, answerText: VENUS_INFO[k].when }
            };
          }
          if (kind === "desc") {
            k = JHS.pick(KANA);
            var others = JHS.shuffle(KANA.filter(function (x) { return x !== k; })).slice(0, 3);
            var letters = [k].concat(others).sort(function (a, b) { return KANA.indexOf(a) - KANA.indexOf(b); });
            return {
              text: head + VENUS_INFO[k].desc + "のは、金星が ア〜オ のどの位置にあるときですか。",
              figure: fig,
              choices: letters, answer: letters.indexOf(k), choiceLayout: "grid",
              explain: [VENUS_BASE, VENUS_WHY[k], "地球に近いほど、大きく見えて、大きく欠けます。"],
              meta: { kind: kind, answerKey: k }
            };
          }
          k = JHS.pick(["ア", "イ", "エ", "オ"]);
          var looks = ["ア", "イ", "エ", "オ"].map(function (x) { return VENUS_INFO[x].look; });
          c = JHS.choices4(VENUS_INFO[k].look, looks.filter(function (x) { return x !== VENUS_INFO[k].look; }));
          if (!c) return null;
          return {
            text: head + "金星が " + k + " の位置にあるとき、同じ倍率の望遠鏡で見た金星のようすとして、正しいものはどれですか(上下左右は、肉眼で見たときの向きとします)。",
            figure: fig,
            choices: c.choices, answer: c.answer,
            explain: [VENUS_WHY[k], "地球に近いほど大きく見えて大きく欠け、遠いほど小さく見えて欠け方が小さくなります。よいの明星は右側、明けの明星は左側(太陽のある側)が光っています。"],
            meta: { kind: kind, key: k, answerText: VENUS_INFO[k].look }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 3-17 太陽系と宇宙
  // =====================================================================
  // 惑星の代表値(直径は地球を1としたとき。密度[g/cm³]、公転周期[年])。表示は文字のまま使う
  var PLANETS = [
    { name: "水星", dia: "0.38", den: "5.43", per: "0.24", type: "地球型" },
    { name: "金星", dia: "0.95", den: "5.24", per: "0.62", type: "地球型" },
    { name: "地球", dia: "1.00", den: "5.51", per: "1.00", type: "地球型" },
    { name: "火星", dia: "0.53", den: "3.93", per: "1.88", type: "地球型" },
    { name: "木星", dia: "11.2", den: "1.33", per: "11.9", type: "木星型" },
    { name: "土星", dia: "9.45", den: "0.69", per: "29.5", type: "木星型" },
    { name: "天王星", dia: "4.01", den: "1.27", per: "84.0", type: "木星型" },
    { name: "海王星", dia: "3.88", den: "1.64", per: "165", type: "木星型" }
  ];
  var PLANET_TABLE = JHS.table({
    caption: "太陽系の惑星(直径は、地球を1としたときの値)",
    head: ["惑星", "直径", "密度[g/cm³]", "公転周期[年]"],
    rows: PLANETS.map(function (p) { return [p.name, p.dia, p.den, p.per]; }),
    compact: true
  });
  var TYPE_TABLE = JHS.table({
    head: ["", "地球型惑星", "木星型惑星"],
    rows: [
      ["惑星", "水星・金星・地球・火星", "木星・土星・天王星・海王星"],
      ["大きさ", "小さい", "大きい"],
      ["密度", "大きい", "小さい"],
      ["表面", "岩石", "気体(主に水素とヘリウム)"]
    ]
  });

  // 惑星の並び(大きさは、比べやすいように縮めてかく)。o.keys: { 金星: "A", … } で、名前のかわりに記号(問題用)
  var PLANET_FIG = [
    { name: "水星", x: 46, r: 2.5, at: "top" }, { name: "金星", x: 63, r: 4.5, at: "bottom" },
    { name: "地球", x: 80, r: 4.5, at: "top" }, { name: "火星", x: 97, r: 3, at: "bottom" },
    { name: "木星", x: 140, r: 24, at: "bottom" }, { name: "土星", x: 205, r: 19, at: "bottom", ring: true },
    { name: "天王星", x: 254, r: 9, at: "top" }, { name: "海王星", x: 290, r: 9, at: "bottom" }
  ];
  function figPlanets(o) {
    o = o || {};
    var cy = 84, s = "", lab = "";
    s += '<circle class="fig-shape fig-fill" cx="-36" cy="' + cy + '" r="70"/>' + txt(6, cy + 4, "太陽", { cls: "fig-small" });
    PLANET_FIG.forEach(function (p) {
      if (p.ring) s += '<ellipse class="fig-shape" cx="' + p.x + '" cy="' + cy + '" rx="33" ry="7"/>';
      s += '<circle class="fig-shape fig-fill-0" cx="' + p.x + '" cy="' + cy + '" r="' + p.r + '"/>';
      if (p.ring) s += '<path class="fig-shape" d="M' + (p.x - 33) + " " + cy + "A33 7 0 0 0 " + (p.x + 33) + " " + cy + '"/>';
      var y = p.at === "top" ? cy - Math.max(p.r, 7) - 8 : cy + Math.max(p.r, 7) + 18;
      if (o.keys) { if (o.keys[p.name]) lab += JHS.key(p.x, p.at === "top" ? y - 4 : y - 4, o.keys[p.name]); }
      else lab += txt(p.x, y, p.name, { cls: "fig-small", anchor: "middle", halo: true });
    });
    if (o.keys) return JHS.svg(320, 136, "太陽系の8つの惑星を、太陽に近い順に左から並べた図。いくつかの惑星に記号がついている。大きさは比べやすいように縮めてある", s + lab);
    s += '<path class="fig-thin" d="M36 34V28H104V34M112 34V28H306V34"/>';
    lab += txt(70, 22, "地球型惑星", { cls: "fig-small", anchor: "middle" }) + txt(209, 22, "木星型惑星", { cls: "fig-small", anchor: "middle" });
    return JHS.svg(320, 136, "太陽系の8つの惑星。太陽に近い順に、水星・金星・地球・火星(地球型惑星)、木星・土星・天王星・海王星(木星型惑星)", s + lab);
  }

  // 太陽の表面のようす。o.keys: true で A(黒点)・B(プロミネンス)・C(コロナ)の記号(問題用)
  function figSun(o) {
    o = o || {};
    var cx = 108, cy = 104, R = 58, s = "";
    s += '<circle class="fig-dash" cx="' + cx + '" cy="' + cy + '" r="82"/>';
    s += '<circle class="fig-shape fig-lit" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
    var a = onCircle(cx, cy, R, 38), b = onCircle(cx, cy, R, 62), top = onCircle(cx, cy, R + 26, 50);
    s += '<path class="fig-line" d="M' + pt(a) + "Q" + pt(top) + " " + pt(b) + '"/>';
    // 黒点は fig-shade(どちらの表示でも暗い)。引き出し線の●は黒点のふち(右端)に置き、黒点の色が見えるようにする
    s += '<ellipse class="fig-shade" cx="92" cy="98" rx="6" ry="4.5"/><ellipse class="fig-shade" cx="118" cy="122" rx="4.5" ry="3.5"/>';
    var cp = onCircle(cx, cy, 82, -32);
    s += JHS.labels([
      { key: "A", name: "黒点", from: [123, 121], to: [196, 116] },
      { key: "B", name: "プロミネンス", from: onCircle(cx, cy, R + 14, 50), to: [196, 40] },
      { key: "C", name: "コロナ", from: cp, to: [196, 176] }
    ], o.keys ? { keys: true } : {});
    return JHS.svg(320, 200, o.keys
      ? "太陽の図。表面の点、ふちから出た炎のような形、まわりに広がる部分に、A〜C の記号がついている"
      : "太陽の表面のようす。表面の暗い点が黒点、ふちから出た炎のような形がプロミネンス、まわりに広がるうすいガスの層(破線)がコロナ", s);
  }

  // 銀河系を横から見た図
  function figGalaxy() {
    var s = "";
    s += '<ellipse class="fig-shape fig-fill" cx="160" cy="62" rx="132" ry="11"/>';
    s += '<ellipse class="fig-shape fig-fill" cx="160" cy="62" rx="30" ry="20"/>';
    s += '<circle class="fig-point" cx="229" cy="62" r="4"/>';
    s += JHS.labels([{ key: "S", name: "太陽系", from: [229, 58], to: [248, 26] }]);
    s += txt(160, 30, "中心部", { cls: "fig-small", anchor: "middle" });
    s += '<path class="fig-thin" d="M28 74V102M292 74V102"/>' + JHS.arrow(30, 96, 290, 96, "fig-thin", { both: true });
    s += txt(160, 116, "約10万光年", { cls: "fig-small", anchor: "middle", halo: true });
    return JHS.svg(320, 126, "銀河系を横から見た図。うすい円盤の形で、中心部がふくらんでいる。直径は約10万光年で、太陽系は中心から外れた円盤の中にある", s);
  }

  var PROP = {
    dia: { name: "直径", big: "もっとも大きい", small: "もっとも小さい" },
    den: { name: "密度", big: "もっとも大きい", small: "もっとも小さい" },
    per: { name: "公転周期", big: "もっとも長い", small: "もっとも短い" }
  };

  JHS.register("g3-solar-system", {
    points: [
      "<b>太陽</b>は、自分で光を出す<b>" + r("恒星", "こうせい") + "</b>で、主に水素とヘリウムの気体でできています。直径は" + rule("地球の約109倍") + "、表面の温度は" + rule("約6000℃") + "です。",
      "太陽の表面に見える<b>" + r("黒点", "こくてん") + "</b>は、" + rule("まわりより温度が低い(約4000℃)") + "ので、黒く見えます。黒点が一定の向きに移動することから" + rule("太陽が自転している") + "こと、中央で円形の黒点がふちでは細長く見えることから" + rule("太陽が球形である") + "ことがわかります。ふちには炎のような<b>プロミネンス</b>(" + r("紅炎", "こうえん") + ")、まわりにはうすいガスの層の<b>コロナ</b>が見えます。",
      "太陽のまわりを公転する8つの<b>惑星</b>は、太陽に近い順に、水星・金星・地球・火星・木星・土星・天王星・海王星です。" + rule("地球型惑星(水星〜火星)は小さく密度が大きく、木星型惑星(木星〜海王星)は大きく密度が小さい") + "です。",
      "惑星のまわりを公転する天体を<b>衛星</b>といいます(月は地球の衛星)。主に火星と木星の間を公転する小さな天体を<b>小惑星</b>、氷とちりでできていて、太陽に近づくと尾をのばす天体を<b>すい星</b>といいます。海王星より外側を公転する、冥王星などの天体を<b>太陽系外縁天体</b>といいます。",
      "太陽系をふくむ、たくさんの恒星の集まりを<b>銀河系</b>といいます。銀河系はうずをまいた円盤の形で、直径は約10万光年です。夜空の<b>天の川</b>は、銀河系を内側から見た姿です。銀河系の外にも、アンドロメダ銀河など、多くの<b>銀河</b>があります。",
      "<b>1光年</b>は、" + rule("光が1年間に進む距離") + "で、約9兆5000億kmです。恒星までの距離のような、とても長い距離を表すのに使います。"
    ],
    figures: [
      { html: figSun(), caption: "黒点はまわりより温度が低いので、黒く見えます(図では暗い点)。プロミネンスは、ふちから炎のようにふき出したガス、コロナは太陽のまわりに広がるうすいガスの層で、皆既日食のときによく見えます。" },
      { html: figPlanets(), caption: "太陽に近い順に並べた8つの惑星です。大きさは比べやすいように縮めてかいてあり、正確な比ではありません(木星の直径は地球の約11倍)。土星には大きな環があります。" },
      { html: figGalaxy(), caption: "銀河系を横から見た図です。太陽系は、銀河系の中心から外れたところにあります。円盤の方向を見ると星がたくさん重なって見えるので、天の川になります。" }
    ],
    blocks: [PLANET_TABLE, TYPE_TABLE],
    example: {
      title: "表で、水星・金星・地球・火星の密度は" + q(3.93, "g/cm³") + "〜" + q(5.51, "g/cm³") + "、木星・土星・天王星・海王星の密度は" + q(0.69, "g/cm³") + "〜" + q(1.64, "g/cm³") + "です。このちがいは、惑星の何のちがいによるものですか。",
      steps: [
        "水星・金星・地球・火星は<b>地球型惑星</b>で、主に岩石と金属でできているので、密度が大きくなります。",
        "木星・土星・天王星・海王星は<b>木星型惑星</b>で、主に水素やヘリウムなどの気体でできているので、大きいわりに密度が小さくなります。"
      ],
      result: "惑星をつくっている物質のちがい(地球型惑星は岩石、木星型惑星は気体が主)"
    },
    fixed: [
      {
        id: "sun-temperature",
        text: "太陽の表面の温度は、約何℃ですか。",
        choices: [q(6000, "℃"), q(4000, "℃"), q(600, "℃"), q(60, "℃")],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "太陽の表面の温度は、約6000℃です。",
          "約4000℃は、まわりより温度が低い黒点の温度です。"
        ]
      },
      {
        id: "sunspot-dark",
        text: "太陽の黒点が黒く見える理由として、正しいものはどれですか。",
        choices: [
          "まわりより温度が低いから",
          "まわりより温度が高いから",
          "太陽の表面にあいた穴だから",
          "月の影が太陽にうつっているから"
        ],
        answer: 0,
        explain: [
          "黒点の温度は約4000℃で、まわり(約6000℃)より低いので、暗く(黒く)見えます。",
          "黒点は穴や影ではなく、太陽の表面の一部です。"
        ]
      },
      {
        id: "sunspot-move",
        text: "太陽の黒点を数日間観察すると、黒点の位置が一定の向きに移動していました。このことからわかることはどれですか。",
        choices: ["太陽が自転している", "太陽が球形である", "地球が公転している", "黒点の温度が低い"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "黒点が一定の向きに移動していくのは、太陽が自転しているからです。",
          "太陽が球形であることは、中央で円形の黒点が、ふちでは細長く見えることからわかります。"
        ]
      },
      {
        id: "sunspot-shape",
        text: "太陽の中央付近で円形に見えた黒点が、ふちに近づくと細長く見えるようになりました。このことからわかることはどれですか。",
        choices: ["太陽が球形である", "太陽が自転している", "黒点の温度が上がった", "黒点が小さくなった"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "球の表面の円形の模様は、ふちに近いところでは、ななめから見ることになるので細長く見えます。これは、太陽が球形であることを示しています。",
          "黒点が移動することからは、太陽が自転していることがわかります。"
        ]
      },
      {
        id: "sun-parts",
        text: "図は、太陽のようすです。B の、太陽のふちから炎のようにふき出したガスを何といいますか。",
        figure: figSun({ keys: true }),
        choices: ["プロミネンス", "コロナ", "黒点", "すい星"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "太陽のふちから炎のようにふき出している高温のガスを、プロミネンス(紅炎)といいます。",
          "A は黒点、C は太陽のまわりに広がるうすいガスの層のコロナです。"
        ]
      },
      {
        id: "sun-diameter",
        text: "太陽の直径は、地球の直径の約何倍ですか。",
        choices: [q(109, "倍"), q(11, "倍"), q(1090, "倍"), q(10, "倍")],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "太陽の直径は、地球の約109倍です。",
          "約11倍は、木星の直径(地球を1としたとき)です。"
        ]
      },
      {
        id: "planet-density",
        text: "図は、太陽系の8つの惑星を、太陽に近い順に左から並べたものです。A〜D のうち、密度がもっとも小さい惑星はどれですか。",
        figure: figPlanets({ keys: { 金星: "A", 火星: "B", 木星: "C", 土星: "D" } }),
        choices: ["A", "B", "C", "D"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "太陽に近い順に、水星・金星・地球・火星・木星・土星・天王星・海王星なので、A は金星、B は火星、C は木星、D は土星です。",
          "木星型惑星は密度が小さく、なかでも土星の密度は約" + q(0.69, "g/cm³") + "で、8つの惑星の中でもっとも小さい(水の密度より小さい)値です。"
        ]
      },
      {
        id: "terrestrial",
        text: "地球型惑星の特徴として、正しいものはどれですか。",
        choices: [
          "直径が小さく、密度が大きい",
          "直径が大きく、密度が小さい",
          "直径が小さく、密度も小さい",
          "直径が大きく、密度も大きい"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "水星・金星・地球・火星の地球型惑星は、主に岩石と金属でできていて、直径は小さく、密度は大きくなります。",
          "木星型惑星は、主に気体でできていて、直径は大きく、密度は小さくなります。"
        ]
      },
      {
        id: "jovian",
        text: "木星型惑星の組み合わせとして、正しいものはどれですか。",
        choices: [
          "木星・土星・天王星・海王星",
          "水星・金星・地球・火星",
          "火星・木星・土星・天王星",
          "木星・土星・天王星・冥王星"
        ],
        answer: 0,
        explain: [
          "火星より外側を公転する、木星・土星・天王星・海王星の4つが木星型惑星です。",
          "冥王星は惑星ではなく、太陽系外縁天体です。"
        ]
      },
      {
        id: "satellite",
        text: "月のように、惑星のまわりを公転している天体を何といいますか。",
        choices: ["衛星", "恒星", "小惑星", "すい星"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "惑星のまわりを公転する天体を衛星といいます。月は地球の衛星です。",
          "恒星は太陽のように自分で光を出す天体、小惑星とすい星は太陽のまわりを公転する天体です。"
        ]
      },
      {
        id: "comet",
        text: "氷とちりでできていて、太陽に近づくと、尾をのばして見えることがある天体を何といいますか。",
        choices: ["すい星", "小惑星", "衛星", "太陽系外縁天体"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "すい星は、主に氷とちりでできた天体で、太陽に近づくと、とけ出したガスやちりが尾のように見えます。",
          "小惑星は、主に火星と木星の間を公転している、岩石でできた小さな天体です。"
        ]
      },
      {
        id: "pluto",
        text: "冥王星は、太陽系の天体のうち、何に分類されていますか。",
        choices: ["太陽系外縁天体", "惑星", "衛星", "恒星"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "冥王星は、海王星より外側を公転する太陽系外縁天体の1つです。",
          "太陽系の惑星は、水星から海王星までの8つです。"
        ]
      },
      {
        id: "milky-way",
        text: "夜空に見える天の川の正体として、正しいものはどれですか。",
        choices: [
          "銀河系を内側から見た、たくさんの恒星の集まり",
          "太陽のまわりを公転する、たくさんの小惑星の集まり",
          "地球の大気中の、水蒸気やちりの集まり",
          "銀河系の外にある、1つの銀河"
        ],
        answer: 0,
        explain: [
          "太陽系は、円盤の形をした銀河系の中にあります。円盤の方向を見ると、たくさんの恒星が重なって帯のように見えます。これが天の川です。",
          "アンドロメダ銀河のような、銀河系の外にある銀河とはちがいます。"
        ]
      },
      {
        id: "light-year",
        text: "「1光年」とは、何を表していますか。",
        choices: [
          "光が1年間に進む距離",
          "光が1年間に進む時間",
          "地球が1年間に公転で進む距離",
          "光が太陽から地球まで届くのにかかる時間"
        ],
        answer: 0,
        explain: [
          "1光年は、光が1年間に進む距離で、約9兆5000億kmです。時間ではなく、距離の単位です。",
          "恒星や銀河までの、とても長い距離を表すのに使います。"
        ]
      }
    ],
    generators: [
      {
        id: "planet-table",
        label: "惑星の表の読み取り(直径・密度・公転周期)",
        make: function () {
          var key = JHS.pick(["dia", "den", "per"]), big = Math.random() < 0.5, pr = PROP[key];
          var four = JHS.shuffle(PLANETS).slice(0, 4);
          var sorted = four.slice().sort(function (a, b) { return Number(a[key]) - Number(b[key]); });
          var ans = big ? sorted[3] : sorted[0];
          var order = PLANETS.filter(function (p) { return four.indexOf(p) >= 0; });
          var unit = key === "den" ? "g/cm³" : key === "per" ? "年" : "";
          function val(p) { return unit ? q(p[key], unit) : p.name === "地球" ? "基準(" + p[key] + ")" : "地球の" + p[key] + "倍"; }
          return {
            text: "表で、" + order.map(function (p) { return p.name; }).join("・") + " のうち、" + pr.name + "が" + (big ? pr.big : pr.small) + "惑星はどれですか。",
            material: PLANET_TABLE,
            choices: order.map(function (p) { return p.name; }),
            answer: order.indexOf(ans),
            choiceLayout: "grid",
            explain: [
              "表の「" + pr.name + "」の列で、4つの惑星の値をくらべます。" + order.map(function (p) { return p.name + "は" + val(p); }).join("、") + "です。",
              pr.name + "が" + (big ? pr.big : pr.small) + "のは<b>" + ans.name + "</b>です。" + (key === "per" ? "太陽から遠い惑星ほど、公転周期は長くなります。" : key === "den" ? "地球型惑星は密度が大きく、木星型惑星は密度が小さくなっています。" : "木星型惑星は、地球型惑星より直径がずっと大きくなっています。")
            ],
            meta: { property: key, largest: big, planets: order.map(function (p) { return p.name; }), answerText: ans.name }
          };
        }
      }
    ]
  });
})();

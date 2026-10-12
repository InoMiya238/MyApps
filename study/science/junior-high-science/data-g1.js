// 中学理科道場: 中1の単元の中身(要点・図・表・例題・問題)。
// 形式の説明と、表示部品・図の関数(JHS.table、JHS.labels など)は data.js の先頭を参照。
// 分野ごとに1つの IIFE にまとめる(生物 → 化学 → 物理 → 地学 の順に、うしろへ足していく)。
//
// 内容のきまり:
// ・中1の範囲で書く。中2・中3の内容(化学式・原子・イオン、細胞、力の合成など)は問題にしない。
// ・物質は化学式ではなく名前で書く。表記は「魚類・両生類・は虫類・鳥類・哺乳類」。
// ・教科書によって答えが分かれる問いは作らない。誤答は、明らかに誤りと言えるものにする。
// ・数値の変わる問題は、meta に元の数値と答えを入れる。

// =====================================================================
// 生物(g1-observation、g1-plants、g1-animals)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var r = JHS.r, rule = JHS.rule, q = JHS.q;
  function bai(n) { return q(n, "倍"); }

  // ---------- 図 ----------
  // B1 顕微鏡のつくり。opts は JHS.labels と同じ({} 名前 / { keys: true } 記号 / { mark: "C" } など)
  function figMicroscope(opts) {
    opts = opts || {};
    var s = "";
    s += '<rect class="fig-shape fig-fill-2" x="36" y="214" width="114" height="12" rx="4"/>';          // 台
    s += '<path class="fig-shape fig-fill-2" d="M44 214V70H98V92H60V214Z"/>';                           // アーム
    s += '<rect class="fig-shape fig-fill-0" x="103" y="22" width="14" height="22"/>';                  // 接眼レンズ
    s += '<rect class="fig-shape fig-fill-0" x="98" y="44" width="24" height="60"/>';                   // 鏡筒
    s += '<rect class="fig-shape fig-fill-0" x="97" y="112" width="8" height="16" transform="rotate(35 101 114)"/>';   // 使っていない対物レンズ
    s += '<path class="fig-shape fig-fill" d="M94 104H126L122 116H98Z"/>';                              // レボルバー
    s += '<rect class="fig-shape fig-fill-0" x="105" y="116" width="10" height="22"/>';                 // 対物レンズ
    s += '<rect class="fig-shape fig-fill" x="96" y="146" width="28" height="4"/>';                     // プレパラート
    s += '<rect class="fig-shape fig-fill-2" x="60" y="150" width="92" height="7"/>';                   // ステージ
    s += '<path class="fig-shape" d="M110 200V214"/>';
    s += '<ellipse class="fig-shape fig-fill" cx="110" cy="194" rx="14" ry="5" transform="rotate(-20 110 194)"/>';   // 反射鏡
    s += '<circle class="fig-shape fig-fill-0" cx="52" cy="172" r="10"/><circle class="fig-solid" cx="52" cy="172" r="2.5"/>';   // 調節ねじ
    s += JHS.labels([
      { key: "A", name: "接眼レンズ", from: [116, 32], to: [200, 28] },
      { key: "B", name: "鏡筒", from: [121, 70], to: [200, 60] },
      { key: "C", name: "レボルバー", from: [123, 110], to: [200, 92] },
      { key: "D", name: "対物レンズ", from: [114, 128], to: [200, 124] },
      { key: "E", name: "ステージ", from: [148, 153], to: [200, 156] },
      { key: "F", name: "調節ねじ", from: [60, 170], to: [200, 186] },
      { key: "G", name: "反射鏡", from: [122, 191], to: [200, 214] }
    ], opts);
    var asKey = opts.keys || opts.mark;
    return JHS.svg(320, 240, asKey ? "顕微鏡を横から見た図。部分に記号がついている" : "顕微鏡のつくり。上から、接眼レンズ、鏡筒、レボルバー、対物レンズ、ステージ、調節ねじ、反射鏡", s);
  }

  // B2 花のつくり(被子植物の縦の断面)。opts は JHS.labels と同じ
  function figFlower(opts) {
    opts = opts || {};
    var s = "";
    s += '<path class="fig-shape" d="M160 170V194"/>';
    s += '<path class="fig-shape fig-fill-0" d="M150 172C100 168 58 110 66 46C96 80 128 120 146 166Z"/>';     // 花弁(左)
    s += '<path class="fig-shape fig-fill-0" d="M170 172C220 168 262 110 254 46C224 80 192 120 174 166Z"/>';  // 花弁(右)
    s += '<path class="fig-shape fig-fill-2" d="M152 176C128 182 104 176 90 156C114 156 138 162 152 170Z"/>';  // がく(左)
    s += '<path class="fig-shape fig-fill-2" d="M168 176C192 182 216 176 230 156C206 156 182 162 168 170Z"/>'; // がく(右)
    s += '<path class="fig-shape" d="M152 168C140 140 130 110 128 88"/>';                                     // おしべ(左)
    s += '<ellipse class="fig-shape fig-fill-2" cx="127" cy="78" rx="6" ry="10"/>';
    s += '<path class="fig-shape" d="M168 168C180 140 190 110 192 88"/>';                                     // おしべ(右)
    s += '<ellipse class="fig-shape fig-fill-2" cx="193" cy="78" rx="6" ry="10"/>';
    s += '<rect class="fig-shape fig-fill-0" x="157" y="66" width="6" height="68"/>';                         // めしべ(花柱)
    s += '<ellipse class="fig-shape fig-fill-0" cx="160" cy="63" rx="9" ry="5"/>';                            // 柱頭
    s += '<ellipse class="fig-shape fig-fill-0" cx="160" cy="150" rx="16" ry="20"/>';                         // 子房
    s += '<ellipse class="fig-shape fig-fill" cx="160" cy="152" rx="7" ry="10"/>';                            // 胚珠
    s += JHS.labels([
      { key: "A", name: "がく", from: [112, 166], to: [52, 152], side: "left" },
      { key: "B", name: "花弁", from: [88, 100], to: [52, 88], side: "left" },
      { key: "C", name: "おしべ", from: [186, 118], to: [258, 100] },
      { key: "D", name: "やく", from: [198, 76], to: [258, 68] },
      { key: "E", name: "めしべ", from: [158, 100], to: [124, 26], side: "left" },
      { key: "F", name: "柱頭", from: [167, 62], to: [258, 36] },
      { key: "G", name: "子房", from: [174, 142], to: [258, 136] },
      { key: "H", name: "胚珠", from: [164, 156], to: [258, 170] }
    ], opts);
    var asKey = opts.keys || opts.mark;
    return JHS.svg(320, 200, asKey ? "花を縦に切った断面の図。部分に記号がついている" : "被子植物の花のつくり。外側から、がく、花弁、おしべ、めしべ", s);
  }

  // B3 マツのりん片
  function figPine() {
    var s = "";
    s += '<path class="fig-shape fig-fill-0" d="M80 152C42 132 42 62 80 42C118 62 118 132 80 152Z"/>';
    s += '<ellipse class="fig-shape fig-fill" cx="68" cy="118" rx="8" ry="11"/><ellipse class="fig-shape fig-fill" cx="92" cy="118" rx="8" ry="11"/>';
    s += '<path class="fig-shape fig-fill-0" d="M235 152C200 132 200 74 235 58C270 74 270 132 235 152Z"/>';
    s += '<ellipse class="fig-shape fig-fill-2" cx="224" cy="110" rx="9" ry="24"/><ellipse class="fig-shape fig-fill-2" cx="246" cy="110" rx="9" ry="24"/>';
    s += JHS.labels([
      { key: "A", name: "胚珠", from: [96, 114], to: [128, 92] },
      { key: "B", name: "花粉のう", from: [250, 96], to: [268, 48], side: "top" }
    ]);
    s += JHS.txt(80, 174, "雌花のりん片", { anchor: "middle" }) + JHS.txt(80, 191, "胚珠がむき出し", { cls: "fig-small", anchor: "middle" });
    s += JHS.txt(235, 174, "雄花のりん片", { anchor: "middle" }) + JHS.txt(235, 191, "中に花粉がある", { cls: "fig-small", anchor: "middle" });
    return JHS.svg(320, 200, "マツのりん片。左は雌花のりん片で胚珠がむき出し、右は雄花のりん片で花粉のうがある", s);
  }

  // B4 単子葉類と双子葉類(上段は葉脈、下段は根)。
  // opts.only: "mono" か "di" で1列だけ描く。opts.keys: true で、なかまの名前と特徴の名前をかくす(問題用)
  function figLeafRoot(opts) {
    opts = opts || {};
    var names = !opts.keys;
    function L(d) { return '<path class="fig-detail" d="' + d + '"/>'; }
    function mono(cx) {
      var s = '<path class="fig-shape fig-fill" d="M' + cx + " 30C" + (cx - 20) + " 55 " + (cx - 20) + " 85 " + cx + " 106C" + (cx + 20) + " 85 " + (cx + 20) + " 55 " + cx + ' 30Z"/>';
      [-12, -6, 0, 6, 12].forEach(function (k) {
        s += L("M" + cx + " 104C" + (cx + k) + " 85 " + (cx + k) + " 55 " + cx + " 33");
      });
      s += '<path class="fig-shape" d="M' + cx + " 134V152" + '"/>';
      [-36, -24, -12, 0, 12, 24, 36].forEach(function (dx) {
        s += L("M" + cx + " 152C" + (cx + dx * 0.2) + " 172 " + (cx + dx * 1.1) + " 186 " + (cx + dx) + " 214");
      });
      if (names) {
        s += JHS.txt(cx, 18, "単子葉類", { anchor: "middle" }) + JHS.txt(cx, 124, "平行脈", { cls: "fig-small", anchor: "middle" }) +
          JHS.txt(cx, 232, "ひげ根", { cls: "fig-small", anchor: "middle" });
      }
      return s;
    }
    function di(cx) {
      var s = '<path class="fig-shape fig-fill" d="M' + cx + " 30C" + (cx - 34) + " 50 " + (cx - 30) + " 92 " + cx + " 106C" + (cx + 30) + " 92 " + (cx + 34) + " 50 " + cx + ' 30Z"/>';
      s += L("M" + cx + " 106V34");
      var veins = [[94, 19], [80, 22], [66, 19], [52, 12]];   // [中央の脈から出る高さ, 横への長さ]
      [-1, 1].forEach(function (sg) {
        veins.forEach(function (v, i) {
          var x2 = cx + sg * v[1], y2 = v[0] - 13;
          s += L("M" + cx + " " + v[0] + "L" + x2 + " " + y2);
          if (i < veins.length - 1) {
            var n = veins[i + 1];
            // となりの脈とつなぐ細い脈(網目)
            s += L("M" + (cx + sg * v[1] * 0.5) + " " + (v[0] - 6.5) + "L" + (cx + sg * n[1] * 0.45) + " " + (n[0] - 5.5));
            s += L("M" + (cx + sg * v[1] * 0.85) + " " + (v[0] - 11) + "L" + (cx + sg * n[1] * 0.8) + " " + (n[0] - 10));
          }
        });
      });
      s += '<path class="fig-shape" d="M' + cx + " 134V216" + '"/>';
      [[152, 28], [168, 24], [184, 18], [200, 12]].forEach(function (v) {
        s += L("M" + cx + " " + v[0] + "L" + (cx - v[1]) + " " + (v[0] + 15)) + L("M" + cx + " " + (v[0] + 6) + "L" + (cx + v[1]) + " " + (v[0] + 21));
      });
      if (names) {
        s += JHS.txt(cx, 18, "双子葉類", { anchor: "middle" }) + JHS.txt(cx, 124, "網状脈", { cls: "fig-small", anchor: "middle" }) +
          JHS.txt(cx, 232, "主根と側根", { cls: "fig-small", anchor: "middle" });
      }
      return s;
    }
    var s = JHS.txt(10, 72, "葉脈", { cls: "fig-small" }) + JHS.txt(10, 178, "根", { cls: "fig-small" });
    if (opts.only === "mono") s += mono(170);
    else if (opts.only === "di") s += di(170);
    else s += mono(112) + di(236);
    return JHS.svg(320, 240, names ? "単子葉類と双子葉類の、葉脈と根のちがい" : "ある植物の葉脈と根の図", s);
  }

  // =====================================================================
  // 1-1 生物の観察
  // =====================================================================
  var MICRO_STEPS = JHS.table({
    caption: "顕微鏡の使い方(この順に行う)",
    head: ["順", "すること"],
    rows: [
      ["1", "対物レンズを、いちばん低倍率のものにする。"],
      ["2", "接眼レンズをのぞきながら、反射鏡としぼりを調節して、視野全体を明るくする。"],
      ["3", "プレパラートをステージにのせる。"],
      ["4", "<b>横から見ながら</b>調節ねじを回し、対物レンズとプレパラートをできるだけ近づける。"],
      ["5", "接眼レンズをのぞきながら、対物レンズとプレパラートを<b>遠ざけながら</b>ピントを合わせる。"]
    ]
  });

  JHS.register("g1-observation", {
    points: [
      "<b>ルーペ</b>は、" + rule("目に近づけて持ちます") + "。観察するものが動かせるときは観察するものを、動かせないときは自分の顔を前後に動かして、ピントを合わせます。ルーペで太陽を見てはいけません。",
      "<b>スケッチ</b>は、目的のものだけを、" + rule("細い線と小さな点ではっきりと") + "かきます。影をつけたり、線を重ねがきしたりしません。",
      "顕微鏡は、直射日光の当たらない、明るく水平なところに置きます。レンズは、鏡筒の中にほこりが入らないように、<b>接眼レンズ → 対物レンズ</b>の順に取りつけます。",
      "顕微鏡の倍率は、" + rule("接眼レンズの倍率 × 対物レンズの倍率") + " です。",
      "倍率を高くすると、見える範囲は<b>せまく</b>なり、視野は<b>暗く</b>なります。対物レンズは倍率の高いものほど長いので、プレパラートとの間はせまくなります。",
      "<b>双眼実体顕微鏡</b>は、プレパラートをつくらずに、観察するものを20〜40倍程度で<b>立体的に</b>見ることができます。"
    ],
    figures: [
      { html: figMicroscope(), caption: "顕微鏡のつくり(ステージが上下する形)。調節ねじを回して、対物レンズとプレパラートの間を変えます。" }
    ],
    blocks: [
      JHS.formula("顕微鏡の倍率", "接眼レンズの倍率 × 対物レンズの倍率"),
      MICRO_STEPS
    ],
    example: {
      title: "10倍の接眼レンズと40倍の対物レンズを使うと、顕微鏡の倍率は何倍になりますか。",
      steps: [
        "接眼レンズの倍率と対物レンズの倍率を<b>かけます</b>(たし算ではありません)。",
        JHS.calc("10 倍 × 40 倍", "400 倍")
      ],
      result: bai(400)
    },
    fixed: [
      {
        id: "loupe-movable",
        text: "手に持った花をルーペで観察します。正しい使い方はどれですか。",
        choices: [
          "ルーペを目に近づけて持ち、花を前後に動かす",
          "ルーペを花に近づけて持ち、顔を前後に動かす",
          "ルーペを目から離して持ち、ルーペを前後に動かす",
          "ルーペと花を両方とも動かさず、目を細めて見る"
        ],
        answer: 0,
        explain: [
          "ルーペは目に近づけて持ちます。",
          "観察するものが動かせるときは、観察するものを前後に動かしてピントを合わせます。"
        ]
      },
      {
        id: "loupe-fixed",
        text: "木の幹についているコケのように、動かせないものをルーペで観察します。正しい使い方はどれですか。",
        choices: [
          "ルーペを目に近づけたまま、顔を前後に動かす",
          "ルーペを目から離し、ルーペだけを前後に動かす",
          "ルーペを観察するものにつけ、顔を遠ざける",
          "ルーペを使わず、できるだけ遠くから見る"
        ],
        answer: 0,
        explain: [
          "ルーペを目に近づけて持つのは、いつも同じです。",
          "観察するものが動かせないときは、自分の顔(体)を前後に動かしてピントを合わせます。"
        ]
      },
      {
        id: "sketch",
        text: "理科のスケッチのしかたとして、正しいものはどれですか。",
        choices: [
          "細い線と小さな点で、はっきりとかく",
          "影をつけて、立体的に見えるようにかく",
          "線を何度も重ねて、太くかく",
          "まわりの背景も、見えたものはすべてかく"
        ],
        answer: 0,
        explain: [
          "スケッチは、目的のものだけを、細い線と小さな点ではっきりとかきます。",
          "影をつけたり、線を重ねがきしたりすると、形や特徴がわかりにくくなります。"
        ]
      },
      {
        id: "scope-part-revolver",
        text: "図は、顕微鏡を横から見たものです。C の部分を何といいますか。",
        figure: figMicroscope({ keys: true, mark: "C" }),
        choices: ["レボルバー", "対物レンズ", "調節ねじ", "鏡筒"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "C は<b>レボルバー</b>です。回して、使う対物レンズを切りかえます。",
          "対物レンズは D、調節ねじは F、鏡筒は B です。"
        ]
      },
      {
        id: "scope-part-focus",
        text: "図の顕微鏡で、ピントを合わせるときに回す部分は、A〜G のどれですか。",
        figure: figMicroscope({ keys: true }),
        choices: ["F", "B", "C", "G"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "ピントは、<b>調節ねじ</b>(F)を回して合わせます。",
          "B は鏡筒、C はレボルバー(対物レンズを切りかえる)、G は反射鏡(視野の明るさを調節する)です。"
        ]
      },
      {
        id: "lens-order",
        text: "顕微鏡にレンズを取りつける順番と、その理由として正しいものはどれですか。",
        choices: [
          "接眼レンズを先につける。鏡筒の中にほこりが入らないようにするため",
          "対物レンズを先につける。鏡筒の中にほこりが入らないようにするため",
          "接眼レンズを先につける。視野を明るくするため",
          "対物レンズを先につける。ピントを合わせやすくするため"
        ],
        answer: 0,
        explain: [
          "接眼レンズ → 対物レンズの順に取りつけます。",
          "先に上の口を接眼レンズでふさぐと、鏡筒の中にほこりが落ちて対物レンズにつくのを防げます。"
        ]
      },
      {
        id: "low-power-first",
        text: "顕微鏡で観察を始めるとき、はじめに低倍率の対物レンズを使うのはなぜですか。",
        choices: [
          "見える範囲が広く、観察するものを見つけやすいから",
          "見える範囲がせまく、細かいところまで見えるから",
          "視野が暗くなり、目がつかれにくいから",
          "対物レンズが長く、プレパラートに近づけやすいから"
        ],
        answer: 0,
        explain: [
          "低倍率のほうが、見える範囲が広く、視野も明るいので、観察するものを見つけやすくなります。",
          "見える範囲がせまくなり、視野が暗くなるのは、高倍率にしたときです。"
        ]
      },
      {
        id: "focus-procedure",
        text: "顕微鏡のピントの合わせ方として、正しいものはどれですか。",
        choices: [
          "横から見ながら対物レンズとプレパラートを近づけ、そのあと、のぞきながら遠ざけていく",
          "接眼レンズをのぞきながら、対物レンズとプレパラートを近づけていく",
          "横から見ながら、対物レンズとプレパラートを遠ざけていく",
          "接眼レンズをのぞきながら、レボルバーをすばやく回す"
        ],
        answer: 0,
        explain: [
          "先に、横から見ながら対物レンズとプレパラートをできるだけ近づけます。",
          "そのあと、接眼レンズをのぞきながら遠ざけていき、ピントを合わせます。",
          "のぞきながら近づけると、対物レンズがプレパラートにぶつかるおそれがあります。"
        ]
      },
      {
        id: "high-power-view",
        text: "顕微鏡の倍率を高くすると、見える範囲と視野の明るさはどうなりますか。",
        choices: [
          "見える範囲はせまくなり、視野は暗くなる",
          "見える範囲はせまくなり、視野は明るくなる",
          "見える範囲は広くなり、視野は暗くなる",
          "見える範囲は広くなり、視野は明るくなる"
        ],
        answer: 0,
        explain: [
          "倍率を高くすると、せまい範囲を大きく見ることになるので、見える範囲はせまくなります。",
          "レンズに入る光の量も減るので、視野は暗くなります。"
        ]
      },
      {
        id: "scope-place",
        text: "顕微鏡を置く場所として、正しいものはどれですか。",
        choices: [
          "直射日光の当たらない、明るく水平なところ",
          "直射日光のよく当たる、明るく水平なところ",
          "光の入らない、暗く水平なところ",
          "直射日光の当たらない、少しかたむいたところ"
        ],
        answer: 0,
        explain: [
          "顕微鏡は、直射日光の当たらない、明るく水平なところに置きます。",
          "直射日光が反射鏡から目に入ると、目をいためる危険があります。"
        ]
      },
      {
        id: "image-reversed",
        text: "上下左右が逆に見える顕微鏡で、視野の右上に見えているものを中央に動かします。プレパラートをどの向きに動かしますか。",
        choices: ["右上", "左下", "右下", "左上"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "上下左右が逆に見えているので、実物は左下にあります。",
          "実物を中央へ動かすには、プレパラートを右上(見えている向きと同じ向き)に動かします。"
        ]
      },
      {
        id: "stereo-scope",
        text: "双眼実体顕微鏡の特徴として、正しいものはどれですか。",
        choices: [
          "観察するものを、立体的に見ることができる",
          "数百倍に拡大して観察することができる",
          "プレパラートをつくらないと観察できない",
          "上下左右が逆に見える"
        ],
        answer: 0,
        explain: [
          "双眼実体顕微鏡は、両目で見るので、観察するものを立体的に見ることができます。",
          "倍率は20〜40倍程度で、プレパラートをつくる必要はなく、向きもそのまま見えます。"
        ]
      },
      {
        id: "pond-green",
        text: "池の水の中にいる小さな生物のうち、緑色をしているものはどれですか。",
        choices: ["ミカヅキモ", "ミジンコ", "ゾウリムシ", "アメーバ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "ミカヅキモは、三日月の形をした緑色の生物です。",
          "ミジンコ、ゾウリムシ、アメーバは、緑色ではありません。"
        ]
      }
    ],
    generators: [
      {
        id: "magnification",
        label: "顕微鏡の倍率(接眼レンズ × 対物レンズ)",
        make: function () {
          var e = JHS.pick([5, 7, 10, 15]), o = JHS.pick([4, 10, 20, 40]), total = e * o;
          var kind = JHS.pick(["total", "total", "objective", "eyepiece"]);
          var why = "顕微鏡の倍率は、接眼レンズの倍率 × 対物レンズの倍率で求めます。";
          var c;
          if (kind === "total") {
            c = JHS.choices4(bai(total), [bai(e + o), bai(total * 10), bai(Math.abs(o - e)), bai(total + o), bai(o)]
              .filter(function (x, i) { return !(i === 2 && o === e); }));
            if (!c) return null;
            return {
              text: "次のレンズを使うと、顕微鏡の倍率は何倍になりますか。",
              material: JHS.given([["接眼レンズ", bai(e)], ["対物レンズ", bai(o)]]),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [why, JHS.calc(e + " 倍 × " + o + " 倍", total + " 倍"), "たし算の " + bai(e + o) + " ではありません。"],
              meta: { kind: kind, eyepiece: e, objective: o, total: total, answer: total }
            };
          }
          var known = kind === "objective" ? e : o, ans = kind === "objective" ? o : e;
          var knownName = kind === "objective" ? "接眼レンズ" : "対物レンズ";
          var askName = kind === "objective" ? "対物レンズ" : "接眼レンズ";
          c = JHS.choices4(bai(ans), [bai(total * known), bai(total - known), bai(total + known), bai(ans * 10), bai(ans + 5)]);
          if (!c) return null;
          return {
            text: "顕微鏡の倍率を次のようにしたいとき、" + askName + "は何倍のものを使えばよいですか。",
            material: JHS.given([["顕微鏡の倍率", bai(total)], [knownName, bai(known)]]),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              why,
              "わかっているレンズの倍率で、顕微鏡の倍率を割ります。",
              JHS.calc(total + " 倍 ÷ " + known + " 倍", ans + " 倍")
            ],
            meta: { kind: kind, eyepiece: e, objective: o, total: total, answer: ans }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 1-2 植物の分類
  // =====================================================================
  var PLANT_TREE = JHS.branch({
    q: "種子をつくるか",
    kids: [
      {
        when: "つくる(種子植物)", q: "胚珠が子房の中にあるか", kids: [
          {
            when: "ある(被子植物)", q: "子葉は何枚か", kids: [
              { when: "1枚", leaf: "単子葉類", note: "イネ、ユリ" },
              { when: "2枚", leaf: "双子葉類", note: "アブラナ、サクラ" }
            ]
          },
          { when: "ない(胚珠がむき出し)", leaf: "裸子植物", note: "マツ、イチョウ" }
        ]
      },
      {
        when: "つくらない(胞子でふえる)", q: "根・茎・葉の区別があるか", kids: [
          { when: "ある", leaf: "シダ植物", note: "イヌワラビ、ゼンマイ" },
          { when: "ない", leaf: "コケ植物", note: "ゼニゴケ、スギゴケ" }
        ]
      }
    ]
  });

  var MONO_DI = JHS.table({
    caption: "単子葉類と双子葉類",
    head: ["特徴", "単子葉類", "双子葉類"],
    rows: [
      ["子葉", "1枚", "2枚"],
      ["葉脈", "平行脈", "網状脈"],
      ["根", "ひげ根", "主根と側根"],
      ["例", "イネ、トウモロコシ、ユリ", "アブラナ、タンポポ、サクラ"]
    ]
  });

  JHS.register("g1-plants", {
    points: [
      "花は、外側から " + rule("がく → 花弁 → おしべ → めしべ") + " の順についています。おしべの先の<b>やく</b>には花粉が入っています。めしべの先を<b>柱頭</b>、根もとのふくらんだ部分を<b>子房</b>といい、子房の中に<b>" + r("胚珠", "はいしゅ") + "</b>があります。",
      "花粉がめしべの柱頭につくことを<b>受粉</b>といいます。受粉すると、" + rule("胚珠は種子に、子房は果実に") + "なります。",
      "種子でふえる植物を<b>種子植物</b>といいます。胚珠が子房の中にあるのが<b>被子植物</b>、子房がなく胚珠がむき出しなのが<b>" + r("裸子", "らし") + "植物</b>(マツ、スギ、イチョウ、ソテツ)です。",
      "被子植物は、子葉が1枚の<b>単子葉類</b>と、2枚の<b>双子葉類</b>に分けられます。葉脈と根のようすもちがいます。",
      "双子葉類は、花弁がつながっている<b>合弁花類</b>(アサガオ、ツツジ、タンポポ)と、1枚ずつ離れている<b>離弁花類</b>(アブラナ、サクラ、エンドウ)に分けられます。",
      "<b>シダ植物</b>と<b>コケ植物</b>は、種子をつくらず、" + rule("胞子でふえます") + "。シダ植物には根・茎・葉の区別がありますが、コケ植物にはありません。コケ植物の<b>仮根</b>は、体を地面などに固定するはたらきをします。"
    ],
    figures: [
      { html: figFlower(), caption: "被子植物の花のつくり(縦の断面)。胚珠は子房の中にあります。" },
      { html: figLeafRoot(), caption: "単子葉類は平行脈とひげ根、双子葉類は網状脈と、主根・側根をもちます。" },
      { html: figPine(), caption: "マツの花には花弁やがくがなく、りん片が重なっています。雌花のりん片には子房がなく、胚珠がむき出しです。" }
    ],
    blocks: [PLANT_TREE, MONO_DI],
    example: {
      title: "ある植物を調べると、花には子房があり、胚珠はその中にありました。葉脈は網目状でした。この植物は、どのなかまですか。",
      steps: [
        "胚珠があるので、種子をつくる<b>種子植物</b>です。",
        "胚珠が子房の中にあるので、<b>被子植物</b>です。",
        "葉脈が網目状(網状脈)なので、子葉が2枚の<b>双子葉類</b>です。"
      ],
      result: "双子葉類"
    },
    fixed: [
      {
        id: "flower-order",
        text: "アブラナの花のつくりを、外側から順に並べたものはどれですか。",
        choices: [
          "がく → 花弁 → おしべ → めしべ",
          "花弁 → がく → おしべ → めしべ",
          "がく → 花弁 → めしべ → おしべ",
          "花弁 → がく → めしべ → おしべ"
        ],
        answer: 0,
        explain: [
          "花は、外側から、がく → 花弁 → おしべ → めしべ の順についています。",
          "めしべは花の中心に1本あり、そのまわりをおしべが囲んでいます。"
        ]
      },
      {
        id: "flower-part-anther",
        text: "図は、花を縦に切った断面です。D の部分を何といいますか。",
        figure: figFlower({ keys: true, mark: "D" }),
        choices: ["やく", "柱頭", "子房", "胚珠"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "D は、おしべ(C)の先にある<b>やく</b>です。中に花粉が入っています。",
          "柱頭は F、子房は G、胚珠は H で、どれもめしべの部分です。"
        ]
      },
      {
        id: "flower-part-stigma",
        text: "図の花で、受粉のときに花粉がつく部分は、A〜H のどれですか。",
        figure: figFlower({ keys: true }),
        choices: ["F", "D", "G", "H"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "受粉は、花粉がめしべの先の<b>柱頭</b>(F)につくことです。",
          "D はやく(花粉が入っている)、G は子房、H は胚珠です。"
        ]
      },
      {
        id: "pollination",
        text: "被子植物の「受粉」とは、どのようなことですか。",
        choices: [
          "花粉が、めしべの柱頭につくこと",
          "花粉が、おしべのやくの中でつくられること",
          "胚珠が成長して、種子になること",
          "子房が成長して、果実になること"
        ],
        answer: 0,
        explain: [
          "おしべのやくから出た花粉が、めしべの柱頭につくことを受粉といいます。",
          "胚珠が種子に、子房が果実になるのは、受粉のあとに起こる変化です。"
        ]
      },
      {
        id: "after-pollination",
        text: "受粉のあと、胚珠と子房は、それぞれ何になりますか。",
        choices: [
          "胚珠は種子に、子房は果実になる",
          "胚珠は果実に、子房は種子になる",
          "胚珠は花粉に、子房は種子になる",
          "胚珠は種子に、子房は花弁になる"
        ],
        answer: 0,
        explain: [
          "受粉すると、胚珠は種子に、胚珠を包んでいた子房は果実になります。",
          "果実の中に種子があるのは、子房の中に胚珠があったからです。"
        ]
      },
      {
        id: "gymnosperm-feature",
        text: "裸子植物の特徴として、正しいものはどれですか。",
        choices: [
          "子房がなく、胚珠がむき出しになっている",
          "胚珠が子房の中にある",
          "種子をつくらず、胞子でふえる",
          "根・茎・葉の区別がない"
        ],
        answer: 0,
        explain: [
          "裸子植物は、子房がなく、胚珠がむき出しになっている種子植物です。",
          "胚珠が子房の中にあるのは被子植物、胞子でふえるのはシダ植物とコケ植物、根・茎・葉の区別がないのはコケ植物です。"
        ]
      },
      {
        id: "gymnosperm-example",
        text: "次のうち、裸子植物はどれですか。",
        choices: ["イチョウ", "サクラ", "イネ", "アブラナ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "裸子植物には、マツ、スギ、イチョウ、ソテツなどがあります。",
          "サクラ、イネ、アブラナは、胚珠が子房の中にある被子植物です。"
        ]
      },
      {
        id: "pine-scale",
        text: "マツで、花粉が入っている「花粉のう」があるのはどこですか。",
        choices: ["雄花のりん片", "雌花のりん片", "葉の先", "根の先"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "マツの雄花のりん片には、花粉のうがあり、中に花粉が入っています。",
          "雌花のりん片にあるのは、むき出しの胚珠です。"
        ]
      },
      {
        id: "monocot-feature",
        text: "単子葉類の葉脈と根の組み合わせとして、正しいものはどれですか。",
        choices: [
          "平行脈・ひげ根",
          "平行脈・主根と側根",
          "網状脈・ひげ根",
          "網状脈・主根と側根"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "単子葉類は、子葉が1枚で、葉脈は平行脈、根はひげ根です。",
          "網状脈と、主根・側根をもつのは、双子葉類です。"
        ]
      },
      {
        id: "dicot-figure",
        text: "図のような葉脈と根をもつ植物は、次のうちどれですか。",
        figure: figLeafRoot({ only: "di", keys: true }),
        choices: ["タンポポ", "イネ", "トウモロコシ", "ユリ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "葉脈が網目状(網状脈)で、根が主根と側根からなるので、双子葉類です。",
          "タンポポは双子葉類です。イネ、トウモロコシ、ユリは単子葉類で、平行脈とひげ根をもちます。"
        ]
      },
      {
        id: "monocot-example",
        text: "次のうち、単子葉類はどれですか。",
        choices: ["トウモロコシ", "アサガオ", "サクラ", "エンドウ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "トウモロコシは単子葉類で、葉脈は平行脈、根はひげ根です。",
          "アサガオ、サクラ、エンドウは、子葉が2枚の双子葉類です。"
        ]
      },
      {
        id: "gamopetalous",
        text: "次のうち、花弁がつながっている合弁花類はどれですか。",
        choices: ["アサガオ", "アブラナ", "サクラ", "エンドウ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "アサガオの花弁は、1つにつながっています(合弁花類)。",
          "アブラナ、サクラ、エンドウは、花弁が1枚ずつ離れている離弁花類です。"
        ]
      },
      {
        id: "fern-moss-common",
        text: "シダ植物とコケ植物に共通する特徴はどれですか。",
        choices: [
          "胞子でふえる",
          "種子でふえる",
          "根・茎・葉の区別がある",
          "花をさかせる"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "シダ植物とコケ植物は、どちらも種子をつくらず、胞子でふえます。花はさきません。",
          "根・茎・葉の区別があるのはシダ植物だけで、コケ植物にはありません。"
        ]
      },
      {
        id: "moss-rhizoid",
        text: "コケ植物の「仮根」のおもなはたらきは何ですか。",
        choices: [
          "体を地面などに固定する",
          "必要な水の大部分を吸収する",
          "胞子をつくる",
          "花粉をつくる"
        ],
        answer: 0,
        explain: [
          "仮根は、体を地面や岩などに固定するはたらきをします。",
          "コケ植物は、水を体の表面全体から吸収します。花粉はつくりません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-3 動物の分類
  // =====================================================================
  var VERTEBRATES = JHS.table({
    caption: "脊椎動物の5つのなかま",
    head: ["なかま", "生活場所", "呼吸", "体表", "子の生まれ方"],
    stack: true,
    rows: [
      ["魚類", "水中", "えら", "うろこ", "卵生(殻のない卵を水中に産む)"],
      ["両生類", "子は水中、親は陸上や水辺", "子はえらと皮膚、親は肺と皮膚", "しめった皮膚", "卵生(殻のない卵を水中に産む)"],
      ["は虫類", "おもに陸上", "肺", "うろこ", "卵生(殻のある卵を陸上に産む)"],
      ["鳥類", "おもに陸上", "肺", "羽毛", "卵生(殻のある卵を陸上に産む)"],
      ["哺乳類", "おもに陸上", "肺", "毛", "胎生"]
    ]
  });

  var INVERTEBRATES = JHS.branch({
    q: "無脊椎動物(背骨がない)の体のつくり",
    kids: [
      {
        when: "外骨格でおおわれ、体やあしに節がある", leaf: "節足動物", kids: [
          { leaf: "昆虫類", note: "バッタ、チョウ、カブトムシ" },
          { leaf: "甲殻類", note: "エビ、カニ、ミジンコ" },
          { leaf: "そのほか", note: "クモ、ムカデ" }
        ]
      },
      { when: "外とう膜が内臓を包んでいる", leaf: "軟体動物", note: "イカ、タコ、アサリ、マイマイ" },
      { when: "どちらでもない", leaf: "そのほかの無脊椎動物", note: "ミミズ、クラゲ、ウニ" }
    ]
  });

  JHS.register("g1-animals", {
    points: [
      "背骨のある動物を<b>" + r("脊椎", "せきつい") + "動物</b>、背骨のない動物を<b>" + r("無脊椎", "むせきつい") + "動物</b>といいます。",
      "脊椎動物は、" + rule("魚類・両生類・は虫類・鳥類・" + r("哺乳", "ほにゅう") + "類") + " の5つに分けられます。",
      "卵を産んでなかまをふやすことを<b>卵生</b>、母親の体内である程度育ってから子が生まれることを<b>胎生</b>といいます。胎生は哺乳類だけです。",
      "<b>両生類</b>は、子(幼生)のときは水中で<b>えらと皮膚</b>で呼吸し、親(成体)になると<b>肺と皮膚</b>で呼吸します。",
      "無脊椎動物のうち、<b>節足動物</b>は体が<b>外骨格</b>でおおわれ、体やあしに節があります。昆虫類の体は頭部・胸部・腹部に分かれ、胸部に3対のあしがあります。<b>軟体動物</b>は、内臓が<b>外とう膜</b>に包まれています。",
      "草食動物の目は<b>横向き</b>につき、広い範囲を見わたせます。肉食動物の目は<b>前向き</b>につき、立体的に見える範囲が広く、えものとの距離をつかめます。歯は、草食動物では門歯と臼歯、肉食動物では犬歯が発達しています。"
    ],
    blocks: [VERTEBRATES, INVERTEBRATES],
    example: {
      title: "次の特徴をもつ脊椎動物は、何類ですか。" +
        JHS.given([["呼吸", "一生、肺で呼吸する"], ["体表", "うろこ"], ["子の生まれ方", "卵生(殻のある卵)"]]),
      steps: [
        "一生、肺で呼吸するのは、は虫類・鳥類・哺乳類です。",
        "そのうち、殻のある卵を産むのは、は虫類と鳥類です。",
        "体表がうろこなので、<b>は虫類</b>です(鳥類の体表は羽毛)。"
      ],
      result: "は虫類"
    },
    fixed: [
      {
        id: "vertebrate-example",
        text: "次のうち、脊椎動物(背骨のある動物)はどれですか。",
        choices: ["カエル", "イカ", "バッタ", "ミミズ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "カエルは両生類で、背骨のある脊椎動物です。",
          "イカ(軟体動物)、バッタ(節足動物)、ミミズは、背骨のない無脊椎動物です。"
        ]
      },
      {
        id: "viviparous",
        text: "母親の体内である程度育ってから子が生まれる「胎生」のなかまはどれですか。",
        choices: ["哺乳類", "鳥類", "は虫類", "両生類"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "胎生は、哺乳類だけの特徴です。",
          "鳥類、は虫類、両生類、魚類は、卵を産む卵生です。"
        ]
      },
      {
        id: "amphibian-breathing",
        text: "次のように、子と親で呼吸のしかたが変わる脊椎動物は、何類ですか。",
        material: JHS.given([["子(幼生)", "えらと皮膚で呼吸"], ["親(成体)", "肺と皮膚で呼吸"]]),
        choices: ["両生類", "魚類", "は虫類", "鳥類"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "両生類は、子のときは水中でえらと皮膚で呼吸し、親になると肺と皮膚で呼吸します。",
          "魚類は一生えらで、は虫類と鳥類は一生肺で呼吸します。"
        ]
      },
      {
        id: "feathers",
        text: "体の表面が羽毛でおおわれている脊椎動物は、何類ですか。",
        choices: ["鳥類", "哺乳類", "は虫類", "魚類"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "体表が羽毛でおおわれているのは、鳥類です。",
          "哺乳類は毛、は虫類と魚類はうろこでおおわれています。"
        ]
      },
      {
        id: "reptile-example",
        text: "次のうち、は虫類はどれですか。",
        choices: ["ヤモリ", "イモリ", "サンショウウオ", "ウナギ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "ヤモリは、は虫類です。体表はうろこで、一生、肺で呼吸します。",
          "イモリとサンショウウオは両生類、ウナギは魚類です。"
        ]
      },
      {
        id: "mammal-example",
        text: "次のうち、哺乳類はどれですか。",
        choices: ["クジラ", "サメ", "ペンギン", "ウミガメ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "クジラは、水中で生活しますが、肺で呼吸し、子を産んで乳で育てる哺乳類です。",
          "サメは魚類、ペンギンは鳥類、ウミガメは、は虫類です。"
        ]
      },
      {
        id: "shelled-eggs",
        text: "殻のある卵を陸上に産むなかまの組み合わせは、どれですか。",
        choices: ["は虫類と鳥類", "魚類と両生類", "両生類とは虫類", "鳥類と哺乳類"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "は虫類と鳥類は、乾燥にたえられる殻のある卵を、陸上に産みます。",
          "魚類と両生類は殻のない卵を水中に産み、哺乳類は胎生です。"
        ]
      },
      {
        id: "fish-reptile-common",
        text: "魚類と、は虫類に共通する特徴はどれですか。",
        choices: [
          "体の表面が、うろこでおおわれている",
          "一生、えらで呼吸する",
          "殻のある卵を産む",
          "胎生である"
        ],
        answer: 0,
        explain: [
          "魚類も、は虫類も、体表はうろこでおおわれています。",
          "えらで呼吸するのは魚類だけ、殻のある卵を産むのは、は虫類だけです。どちらも卵生で、胎生ではありません。"
        ]
      },
      {
        id: "exoskeleton",
        text: "節足動物の体の外側をおおっている、かたい殻を何といいますか。",
        choices: ["外骨格", "外とう膜", "背骨", "うろこ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "節足動物の体は、外骨格というかたい殻でおおわれています。",
          "外とう膜は、軟体動物の内臓を包む膜です。背骨とうろこは、脊椎動物に見られます。"
        ]
      },
      {
        id: "mollusk-example",
        text: "次のうち、軟体動物はどれですか。",
        choices: ["アサリ", "エビ", "クモ", "ミミズ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "アサリは、内臓が外とう膜に包まれた軟体動物です。イカやタコも軟体動物です。",
          "エビとクモは節足動物です。ミミズは、節足動物でも軟体動物でもない無脊椎動物です。"
        ]
      },
      {
        id: "insect-body",
        text: "昆虫類の体のつくりとして、正しいものはどれですか。",
        choices: [
          "頭部・胸部・腹部に分かれ、胸部に3対のあしがある",
          "頭部・胸部・腹部に分かれ、腹部に3対のあしがある",
          "頭胸部と腹部に分かれ、4対のあしがある",
          "体に節がなく、内臓が外とう膜に包まれている"
        ],
        answer: 0,
        explain: [
          "昆虫類の体は、頭部・胸部・腹部の3つに分かれ、胸部に3対(6本)のあしがあります。",
          "頭胸部と腹部に分かれ、あしが4対あるのはクモのなかまです。外とう膜をもつのは軟体動物です。"
        ]
      },
      {
        id: "crustacean-example",
        text: "次のうち、甲殻類はどれですか。",
        choices: ["カニ", "クモ", "チョウ", "タコ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "カニは、エビやミジンコと同じ甲殻類です。",
          "チョウは昆虫類、クモは昆虫類でも甲殻類でもない節足動物、タコは軟体動物です。"
        ]
      },
      {
        id: "herbivore-eyes",
        text: "シマウマのような草食動物の目は、横向きについています。どのような点で役に立ちますか。",
        choices: [
          "広い範囲を見わたせるので、敵を早く見つけられる",
          "立体的に見える範囲が広いので、えものとの距離をつかめる",
          "暗いところでも、色を見分けられる",
          "遠くのものを、大きく拡大して見られる"
        ],
        answer: 0,
        explain: [
          "目が横向きについていると、見える範囲が広くなり、近づく敵を早く見つけられます。",
          "立体的に見える範囲が広く、距離をつかみやすいのは、目が前向きについた肉食動物の特徴です。"
        ]
      },
      {
        id: "carnivore-teeth",
        text: "ライオンのような肉食動物の歯の特徴として、正しいものはどれですか。",
        choices: [
          "犬歯が大きくするどく、えものをとらえるのに適している",
          "門歯が発達し、草をかみ切るのに適している",
          "臼歯が平らで大きく、草をすりつぶすのに適している",
          "歯がなく、えものを丸のみにする"
        ],
        answer: 0,
        explain: [
          "肉食動物は、えものをとらえる犬歯が大きくするどく発達しています。臼歯も、肉をさくのに適した形です。",
          "門歯で草をかみ切り、平らな臼歯ですりつぶすのは、草食動物の特徴です。"
        ]
      }
    ]
  });
})();

// =====================================================================
// 化学(g1-substances-density、g1-gases、g1-solutions、g1-state-changes)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var r = JHS.r, rule = JHS.rule, q = JHS.q, num = JHS.num;
  function gram(n) { return q(n, "g"); }
  function cm3(n) { return q(n, "cm³"); }
  function gcm3(n) { return q(n, "g/cm³"); }
  function pct(n) { return q(n, "%"); }
  // 温度。0より低いときは、マイナスの記号(−)をつける
  function temp(n) { return q(n < 0 ? "−" + num(-n) : num(n), "℃"); }
  // ガラス管・ゴム管。太い線の上に地の色の線を重ねて、2本線の管に見せる
  function tube(d, w) {
    w = w || 7;
    return '<path class="fig-shape" style="stroke-width:' + w + 'px;stroke-linecap:butt" d="' + d + '"/>' +
      '<path class="fig-halo" fill="none" style="stroke-width:' + (w - 3.5) + 'px;stroke-linecap:square" d="' + d + '"/>';
  }

  // 代表的な数値(教科書に載る値)
  // 密度は100倍、溶解度は整数で持ち、計算は整数で行う
  var KNO3 = { 0: 13, 20: 32, 40: 64, 60: 109, 80: 169 };   // 100gの水にとける硝酸カリウムの質量[g](およその値)
  var METALS = [
    { name: "アルミニウム", d100: 270, show: "2.70" },
    { name: "鉄", d100: 787, show: "7.87" },
    { name: "銅", d100: 896, show: "8.96" },
    { name: "銀", d100: 1050, show: "10.5" }
  ];

  // ---------- 図 ----------
  // C1 メスシリンダーの目盛り(液面の付近を拡大)。v は体積[cm³]で、0.5きざみ。
  // opts.names: true で、読み方の説明を入れる(要点帳用)
  function figCylinder(v, opts) {
    opts = opts || {};
    var d = Math.floor(v / 10) * 10, base = d - 1, U = 13;
    function Y(val) { return 180 - (val - base) * U; }
    var yv = Y(v), s = "";
    var curve = "M96 " + (yv - 10) + "C108 " + yv + " 122 " + yv + " 136 " + yv + "C150 " + yv + " 164 " + yv + " 176 " + (yv - 10);
    s += '<path class="fig-fill" d="' + curve + 'V188H96Z"/>';
    for (var k = 0; k <= 12; k++) {
      var val = base + k, len = val % 10 === 0 ? 26 : val % 5 === 0 ? 18 : 10;
      s += '<path class="fig-detail" d="M96 ' + Y(val) + "h" + len + '"/>';
      if (val % 10 === 0) s += JHS.txt(88, Y(val) + 4, String(val), { cls: "fig-num", anchor: "end" });
    }
    s += JHS.txt(88, 22, "cm³", { cls: "fig-small", anchor: "end" });
    s += '<path class="fig-shape" d="M96 12V188M176 12V188"/>';
    s += '<path class="fig-shape" d="' + curve + '"/>';
    s += '<path class="fig-dash" d="M96 ' + yv + 'H240"/>';
    // 目の位置
    s += '<path class="fig-shape fig-fill-0" d="M286 ' + yv + 'q11 -10 22 0q-11 10 -22 0Z"/><circle class="fig-solid" cx="297" cy="' + yv + '" r="3"/>';
    s += JHS.arrow(280, yv, 246, yv, "fig-shape");
    if (opts.names) {
      s += JHS.labels([{ key: "A", name: "液面の底を読む", from: [136, yv], to: [190, yv - 40] }]);
      s += JHS.txt(312, yv - 16, "目の位置", { cls: "fig-small", anchor: "end" });
      s += JHS.txt(262, yv + 20, "真横から見る", { cls: "fig-small", anchor: "middle" });
    }
    return JHS.svg(320, 200, opts.names ? "メスシリンダーの目盛りの読み方。液面の最も低いところを、真横から見て読む" : "メスシリンダーの液面の付近を拡大した図。目盛りは1cm³ごと", s);
  }

  // C2 ガスバーナー。opts は JHS.labels と同じ({} 名前 / { keys: true } 記号)
  function figBurner(opts) {
    opts = opts || {};
    var s = "";
    function knurl(x1, x2, y1, y2) {
      var h = "";
      for (var x = x1; x <= x2; x += 8) h += '<path class="fig-detail" d="M' + x + " " + y1 + "V" + y2 + '"/>';
      return h;
    }
    s += tube("M60 198H12", 9);                                                                         // ガスのゴム管
    s += '<rect class="fig-shape fig-fill-2" x="58" y="192" width="40" height="12"/>';                   // ガスの入り口
    s += '<path class="fig-shape fig-fill" d="M120 50C104 36 112 22 120 10C128 22 136 36 120 50Z"/>';    // 炎
    s += '<rect class="fig-shape fig-fill-0" x="110" y="52" width="20" height="84"/>';                   // 筒
    s += '<rect class="fig-shape fig-fill-0" x="112" y="156" width="16" height="6"/>';
    s += '<rect class="fig-shape fig-fill-2" x="100" y="136" width="40" height="20" rx="3"/>' + knurl(108, 132, 140, 152);   // 空気調節ねじ
    s += '<rect class="fig-shape fig-fill-2" x="96" y="162" width="48" height="20" rx="3"/>' + knurl(104, 136, 166, 178);    // ガス調節ねじ
    s += '<path class="fig-shape fig-fill-0" d="M108 182H132L150 212H90Z"/>';                            // 台
    s += '<rect class="fig-shape fig-fill-2" x="78" y="212" width="84" height="10" rx="3"/>';
    s += JHS.labels([
      { key: "A", name: "空気調節ねじ", from: [138, 146], to: [196, 132] },
      { key: "B", name: "ガス調節ねじ", from: [142, 172], to: [196, 184] }
    ], opts);
    var asKey = opts.keys || opts.mark;
    if (!asKey) s += JHS.txt(14, 184, "ガス", { cls: "fig-small" });
    return JHS.svg(320, 240, asKey ? "ガスバーナーの図。上下に2つあるねじに、記号がついている" : "ガスバーナー。上のねじが空気調節ねじ、下のねじがガス調節ねじ", s);
  }

  // C3 気体の集め方(3コマ)。opts.only: "water" "up" "down" で1コマだけ描く。opts.keys: true で名前をかくす(問題用)
  function figCollect(opts) {
    opts = opts || {};
    var names = !opts.keys;
    function cap(cx, name, note) {
      if (!names) return "";
      return JHS.txt(cx, 124, name, { anchor: "middle" }) + JHS.txt(cx, 141, note, { cls: "fig-small", anchor: "middle" });
    }
    function water(cx) {
      var t = "M" + (cx - 2) + " 90V28a13 13 0 0 1 26 0V90";
      var s = '<rect class="fig-fill" x="' + (cx - 40) + '" y="70" width="80" height="36"/>';
      s += '<path class="fig-fill" d="' + t + 'Z"/>';
      s += '<path class="fig-fill-0" d="M' + (cx - 2) + " 52V28a13 13 0 0 1 26 0V52" + 'Z"/>';              // 集まった気体
      s += '<path class="fig-detail" d="M' + (cx - 2) + " 52h26M" + (cx - 40) + " 70h38M" + (cx + 24) + ' 70h16"/>';
      s += '<path class="fig-shape" d="' + t + '"/>';
      s += '<path class="fig-shape" d="M' + (cx - 40) + " 60V106H" + (cx + 40) + 'V60"/>';                   // 水そう
      s += '<path class="fig-shape" d="M' + (cx - 50) + " 40H" + (cx - 28) + "V98H" + (cx + 8) + 'V84"/>';   // ガラス管
      s += '<circle class="fig-detail fig-fill-0" cx="' + (cx + 8) + '" cy="76" r="2.5"/><circle class="fig-detail fig-fill-0" cx="' + (cx + 10) + '" cy="65" r="2.5"/>';
      s += JHS.arrow(cx + 17, 80, cx + 17, 60, "fig-line");
      return s + cap(cx, "水上置換法", "水にとけにくい");
    }
    function up(cx) {
      var s = '<path class="fig-shape fig-fill-0" d="M' + (cx - 14) + " 100V30a14 14 0 0 1 28 0V100" + '"/>';
      s += '<path class="fig-shape" d="M' + (cx - 50) + " 106H" + (cx - 4) + 'V40"/>';
      s += JHS.arrow(cx + 6, 82, cx + 6, 52, "fig-line");
      return s + cap(cx, "上方置換法", "空気より軽い");
    }
    function down(cx) {
      var s = '<path class="fig-shape fig-fill-0" d="M' + (cx - 14) + " 22V86a14 14 0 0 0 28 0V22" + '"/>';
      s += '<path class="fig-shape" d="M' + (cx - 50) + " 10H" + (cx - 4) + 'V84"/>';
      s += JHS.arrow(cx + 6, 44, cx + 6, 74, "fig-line");
      return s + cap(cx, "下方置換法", "空気より重い");
    }
    var s = "";
    if (opts.only === "water") s = water(160);
    else if (opts.only === "up") s = up(160);
    else if (opts.only === "down") s = down(160);
    else s = water(54) + up(160) + down(266);
    // 1コマだけで名前も出さないとき(問題用)は、枠に合わせて大きく描く
    if (opts.only && !names) s = '<g transform="translate(160 75) scale(1.4) translate(-155 -60)">' + s + "</g>";
    return JHS.svg(320, 150, opts.only ? "気体を集めている装置の図。矢印は気体の動く向き" : "気体の集め方。左から、水上置換法、上方置換法、下方置換法", s);
  }

  // C4 溶解度曲線。opts.only: "kno3" で硝酸カリウムだけを描く。
  // opts.guides: [60, 20] のように温度を渡すと、その温度に破線を引き、とける質量を数字で書く
  function figSolubility(opts) {
    opts = opts || {};
    var temps = [0, 20, 40, 60, 80], guides = opts.guides || [];
    var series = [{
      pts: temps.map(function (t) { return [t, KNO3[t]]; }),
      cls: "fig-line", marker: "circle", name: "硝酸カリウム", nameAt: [66, 150], smooth: true
    }];
    if (opts.only !== "kno3") {
      series.push({ pts: [[0, 35.7], [20, 35.8], [40, 36.3], [60, 37.1], [80, 38]], cls: "fig-line-2", marker: "tri", name: "塩化ナトリウム" });
    }
    return JHS.graph({
      label: opts.only === "kno3" ? "硝酸カリウムの溶解度曲線。水の温度と、100gの水にとける質量の関係" : "硝酸カリウムと塩化ナトリウムの溶解度曲線。水の温度と、100gの水にとける質量の関係",
      x: { min: 0, max: 80, step: 20, label: "水の温度[℃]" },
      y: { min: 0, max: 200, step: 20, label: "とける質量[g]" },
      series: series,
      guides: guides.map(function (t) { return { x: t, y: KNO3[t] }; }),
      extra: function (gr) {
        // 読み取る値は、曲線の上の点のすぐ左上に数字で書く(0℃だけは軸に重なるので右上)
        return guides.map(function (t) {
          var X = gr.X(t), Y = gr.Y(KNO3[t]);
          return t === 0 ? JHS.txt(X + 8, Y - 9, String(KNO3[t]), { cls: "fig-val", halo: true })
            : JHS.txt(X - 7, Y - 6, String(KNO3[t]), { cls: "fig-val", anchor: "end", halo: true });
        }).join("");
      }
    });
  }

  // C5 ろ過のしかた。opts.wrong: "tip"(ろうとの先が壁についていない) "rod"(ガラス棒を使っていない) で誤った操作を描く。
  // opts.plain: true で名前を出さない。誤り版は、いつも名前なし
  function figFilter(opts) {
    opts = opts || {};
    var wrong = opts.wrong || "", plain = !!opts.plain || !!wrong;
    var bx = wrong === "tip" ? 75 : 113;   // 下のビーカーの左の壁
    var s = "";
    // 下のビーカーと、ろ液
    s += '<path class="fig-fill" d="M' + bx + " 208H" + (bx + 90) + "V224q0 6 -6 6H" + (bx + 6) + 'q-6 0 -6 -6Z"/>';
    s += '<path class="fig-detail" d="M' + bx + " 208H" + (bx + 90) + '"/>';
    s += '<path class="fig-shape" d="M' + bx + " 148V224q0 6 6 6H" + (bx + 84) + 'q6 0 6 -6V148"/>';
    // ろうと(先は、長いほうが左)
    s += '<path class="fig-shape fig-fill-0" d="M72 72L115 122V174L125 164V122L168 72Z"/>';
    s += '<path class="fig-fill" d="M94 92L120 120L146 92Z"/>';                         // ろ紙の中の液
    s += '<path class="fig-detail" d="M80 76L120 120L160 76M94 92H146"/>';              // ろ紙
    if (wrong === "rod") {
      // 上のビーカーから直接注いでいる
      s += '<path class="fig-fill" d="M122 54L159.6 40.3H116.9Z"/>';
      s += '<path class="fig-shape" d="M111.7 25.8L122 54L159.6 40.3L149.3 12.1"/>';
      s += '<path class="fig-line" d="M122 56V90"/>';
    } else {
      s += '<path class="fig-fill" d="M128 50L165.6 36.3H122.9Z"/>';
      s += '<path class="fig-shape" d="M117.7 21.8L128 50L165.6 36.3L155.3 8.1"/>';      // 上のビーカー
      s += '<path class="fig-shape" style="stroke-width:4px" d="M106 8L146 92"/>';       // ガラス棒
      s += '<path class="fig-line" d="M131 52L147 86"/>';                                // 伝わる液
    }
    if (!plain) {
      s += JHS.labels([
        { key: "A", name: "ガラス棒", from: [109, 14], to: [70, 18], side: "left" },
        { key: "B", name: "ろ紙", from: [88, 84], to: [52, 66], side: "left" },
        { key: "C", name: "ろうと", from: [98, 102], to: [52, 112], side: "left" },
        { key: "D", name: "ビーカー", from: [150, 26], to: [206, 22] },
        { key: "E", name: "棒を伝わらせる", from: [140, 72], to: [212, 64] },
        { key: "F", name: "先を壁につける", from: [116, 170], to: [218, 124] }
      ]);
    }
    return JHS.svg(320, 240, wrong ? "ろ過をしているようすの図" : "ろ過のしかた。液はガラス棒を伝わらせて注ぎ、ろうとの先はビーカーの壁につける", s);
  }

  // C6 状態変化と粒子(3コマ)。粒子の数は、どのコマも16個。
  // opts.only: "solid" "liquid" "gas" で1コマだけ描く。
  // opts.keys: true で、状態の名前のかわりに ア・イ・ウ をつける。opts.order で、左からの並びを変えられる(問題用)
  function figStates(opts) {
    opts = opts || {};
    var TOP = 28, W = 76, H = 80;
    var GAS = [[10, 12], [30, 8], [52, 14], [68, 10], [18, 28], [42, 26], [62, 32], [8, 44], [28, 46], [50, 48], [69, 52], [16, 62], [38, 64], [58, 68], [26, 73], [66, 72]];
    var NAMES = { solid: "固体", liquid: "液体", gas: "気体" };
    function dot(x, y) { return '<circle class="fig-shape fig-fill" cx="' + x + '" cy="' + y + '" r="4.5"/>'; }
    function box(kind, x0) {
      var cx = x0 + W / 2, bottom = TOP + H;
      var s = '<rect class="fig-shape fig-fill-0" x="' + x0 + '" y="' + TOP + '" width="' + W + '" height="' + H + '" rx="4"/>';
      var i, j;
      if (kind === "solid") {
        for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) s += dot(cx - 15 + i * 10, bottom - 7 - j * 10);
      } else if (kind === "liquid") {
        for (i = 0; i < 7; i++) s += dot(cx - 31 + i * 10.3, bottom - 7 - (i % 2) * 0.8);
        for (i = 0; i < 6; i++) s += dot(cx - 27 + i * 10.6, bottom - 16.2 + (i % 3) * 0.7);
        s += dot(cx - 20, bottom - 25.6) + dot(cx + 1, bottom - 25.2) + dot(cx + 13, bottom - 25.8);
      } else {
        GAS.forEach(function (p) { s += dot(x0 + p[0], TOP + p[1]); });
      }
      return s;
    }
    var s = "";
    if (opts.only) {
      s = box(opts.only, 122);
      return JHS.svg(320, 150, "ある状態の物質の、粒子のようすを表した図", s);
    }
    var order = opts.order || ["solid", "liquid", "gas"], xs = [8, 122, 236], keys = ["ア", "イ", "ウ"];
    order.forEach(function (kind, i) {
      s += box(kind, xs[i]);
      s += opts.keys ? JHS.key(xs[i] + W / 2, 14, keys[i]) : JHS.txt(xs[i] + W / 2, 19, NAMES[kind], { anchor: "middle" });
    });
    if (!opts.keys) {
      [103, 217].forEach(function (x) {
        s += JHS.txt(x, 52, "加熱", { cls: "fig-small", anchor: "middle" }) + JHS.arrow(x - 14, 60, x + 14, 60) +
          JHS.arrow(x + 14, 80, x - 14, 80) + JHS.txt(x, 98, "冷却", { cls: "fig-small", anchor: "middle" });
      });
      s += JHS.txt(84, 134, "体積は変わる", { cls: "fig-small", anchor: "middle" }) + JHS.txt(236, 134, "質量は変わらない", { cls: "fig-small", anchor: "middle" });
    }
    return JHS.svg(320, 150, opts.keys ? "物質の3つの状態の、粒子のようすを表した図。ア、イ、ウの記号がついている" : "状態変化と粒子。固体は規則正しく並び、液体は並び方がくずれ、気体は粒子の間が広い", s);
  }

  // C7 加熱したときの温度変化。o: { start, mp, bp, t: [融点に着く, とけ終わる, 沸点に着く], end, yMin, yMax,
  //   show: "names"(区間に状態の名前) "keys"(区間に ア〜エ) 省略で何も書かない, guides: true で融点と沸点に破線, label: aria-label }
  function figHeating(o) {
    var mp = o.mp, bp = o.bp, t = o.t, end = o.end || 20;
    return JHS.graph({
      label: o.label || "ある物質を加熱したときの、加熱時間と温度の関係を表すグラフ",
      x: { min: 0, max: end, step: 2, label: "加熱時間[分]" },
      y: { min: o.yMin, max: o.yMax, step: 20, label: "温度[℃]" },
      series: [{ pts: [[0, o.start], [t[0], mp], [t[1], mp], [t[2], bp], [end, bp]], cls: "fig-line" }],
      guides: o.guides ? [{ y: mp }, { y: bp }] : [],
      extra: function (gr) {
        if (!o.show) return "";
        var parts = [
          // 固体の区間は短いので、線の右下の空いたところに書き、引き出し線でつなぐ
          { k: "ア", n: "固体", x: gr.X(t[1]) + 28, y: gr.Y((o.start + mp) / 2), a: "start", from: [gr.X(t[0] / 2) + 3, gr.Y((o.start + mp) / 2)] },
          { k: "イ", n: "固体+液体", x: gr.X((t[0] + t[1]) / 2), y: gr.Y(mp) - 8, a: "middle" },
          { k: "ウ", n: "液体", x: gr.X((t[1] + t[2]) / 2) - 10, y: gr.Y((mp + bp) / 2) - 4, a: "end" },
          { k: "エ", n: "液体+気体", x: gr.X((t[2] + end) / 2), y: gr.Y(bp) - 8, a: "middle" }
        ];
        return parts.map(function (p) {
          if (p.from) {
            var lead = '<line class="fig-thin" x1="' + p.from[0] + '" y1="' + p.from[1] + '" x2="' + (p.x - (o.show === "keys" ? 11 : 4)) + '" y2="' + (p.y - 4) + '"/>';
            return lead + (o.show === "keys" ? JHS.key(p.x, p.y - 4, p.k) : JHS.txt(p.x, p.y, p.n, { cls: "fig-small", halo: true }));
          }
          if (o.show === "keys") return JHS.key(p.a === "end" ? p.x - 10 : p.x, p.y - 6, p.k);
          return JHS.txt(p.x, p.y, p.n, { cls: "fig-small", anchor: p.a, halo: true });
        }).join("");
      }
    });
  }
  // 氷を加熱したときの温度変化(要点帳と固定問題で使う)
  function figHeatingWater(show) {
    return figHeating({
      start: -20, mp: 0, bp: 100, t: [2, 8, 14], end: 20, yMin: -20, yMax: 120, show: show,
      label: show === "keys" ? "氷を加熱したときの、加熱時間と温度の関係を表すグラフ。4つの区間に、ア〜エの記号がついている"
        : "氷を加熱したときの温度変化。0℃と100℃で、温度が変わらない平らな部分がある"
    });
  }

  // C8 蒸留の装置。opts は JHS.labels と同じ
  function figDistill(opts) {
    opts = opts || {};
    var s = "";
    // 冷やすための水と、試験管
    s += '<rect class="fig-fill" x="199" y="148" width="72" height="61"/>';
    s += '<path class="fig-detail" d="M198 148H272"/>';
    s += '<path class="fig-shape" d="M198 136V204q0 6 6 6H266q6 0 6 -6V136"/>';
    s += '<path class="fig-shape fig-fill-0" d="M224 122V192a10 10 0 0 0 20 0V122"/>';
    s += '<path class="fig-fill-2" d="M225 186H243V192a9 9 0 0 1 -18 0Z"/><path class="fig-detail" d="M225 186H243"/>';   // 集まった液体
    // 加熱(金網と炎)
    s += '<path class="fig-shape" d="M70 190H154"/>';
    s += '<path class="fig-shape fig-fill" d="M112 224C100 214 106 206 112 196C118 206 124 214 112 224Z"/>';
    // 枝つきフラスコ
    s += tube("M119 80L186 104");
    s += '<path class="fig-fill-0" d="M103 52V115.1A36 36 0 1 0 121 115.1V52Z"/>';
    s += '<path class="fig-fill" d="M76.9 158A36 36 0 0 0 147.1 158Z"/><path class="fig-detail" d="M76.9 158H147.1"/>';
    s += '<path class="fig-shape" d="M103 52V115.1A36 36 0 1 0 121 115.1V84M121 76V52"/>';
    s += '<circle class="fig-solid" cx="104" cy="181" r="2.5"/><circle class="fig-solid" cx="113" cy="183" r="2.5"/><circle class="fig-solid" cx="121" cy="180" r="2.5"/>';   // 沸騰石
    s += '<rect class="fig-shape fig-fill-2" x="101" y="44" width="22" height="10"/>';                                   // ゴムせん
    s += '<path class="fig-shape" d="M112 10V76"/><circle class="fig-solid" cx="112" cy="79" r="3.5"/>';                  // 温度計
    // ゴム管とガラス管
    s += tube("M194 107L222 113Q234 116 234 128V168");
    s += '<path class="fig-shape" style="stroke-width:10px;stroke-linecap:butt" d="M181 102.2L199 108.1"/>';
    s += JHS.labels([
      { key: "A", name: "温度計", from: [112, 24], to: [72, 20], side: "left" },
      { key: "B", name: "枝つきフラスコ", from: [121, 64], to: [146, 34] },
      { key: "C", name: "ガラス管", from: [212, 110], to: [226, 82], side: "top" },
      { key: "D", name: "沸騰石", from: [106, 182], to: [58, 210], side: "left" },
      { key: "E", name: "試験管", from: [234, 196], to: [234, 214], side: "bottom" }
    ], opts);
    var asKey = opts.keys || opts.mark;
    if (!asKey) s += JHS.labels([{ key: "W", name: "水", from: [262, 176], to: [288, 166] }]);
    return JHS.svg(320, 240, asKey ? "液体を加熱し、出てきた気体を冷やして集める装置の図。部分に記号がついている" : "蒸留の装置。枝つきフラスコの液体を加熱し、出てきた気体を、水で冷やした試験管に集める", s);
  }

  // =====================================================================
  // 1-4 物質の性質と密度
  // =====================================================================
  var DENSITY_TABLE = JHS.table({
    caption: "いろいろな物質の密度[g/cm³](固体と液体。水は4℃、氷は0℃、ほかは約20℃のときの値)",
    head: ["物質", "密度[g/cm³]"],
    rows: [
      ["銀", "10.5"],
      ["銅", "8.96"],
      ["鉄", "7.87"],
      ["アルミニウム", "2.70"],
      ["水", "1.00"],
      ["氷", "0.92"],
      ["エタノール", "0.79"]
    ]
  });

  var BURNER_STEPS = JHS.table({
    caption: "ガスバーナーの火のつけ方(この順に行う)",
    head: ["順", "すること"],
    rows: [
      ["1", "空気調節ねじとガス調節ねじが、<b>両方とも閉まっている</b>ことを確かめる。"],
      ["2", "ガスの元栓を開く(コックがあれば、コックも開く)。"],
      ["3", "マッチに火をつけてから、<b>ガス調節ねじ</b>を少しずつ開いて点火する。"],
      ["4", "ガス調節ねじで、炎の大きさを調節する。"],
      ["5", "ガス調節ねじをおさえて、<b>空気調節ねじ</b>だけを開き、青色の炎にする。"],
      ["消す", "つけるときと逆に、空気調節ねじ → ガス調節ねじ → 元栓 の順に閉める。"]
    ]
  });

  var BALANCE = JHS.table({
    caption: "質量のはかり方",
    head: ["器具", "使い方"],
    rows: [
      ["電子てんびん", "水平な台に置く。何ものせないときの表示を 0 にしてから、はかるものをのせる。薬品をはかりとるときは、薬包紙や容器をのせてから表示を 0 にする。"],
      ["上皿てんびん", "水平な台に置き、指針が左右に同じだけ振れるように調節する。分銅は、ピンセットで持ち、重いものからのせる。"]
    ]
  });

  JHS.register("g1-substances-density", {
    points: [
      "炭素をふくみ、燃えると二酸化炭素が発生する物質を<b>有機物</b>といいます(砂糖、デンプン、ロウ、プラスチック、エタノール)。有機物の多くは、燃えると水もできます。有機物以外の物質が<b>無機物</b>です(食塩、ガラス、鉄、水)。炭素や二酸化炭素は、炭素をふくみますが無機物に分けます。",
      "<b>金属</b>には、共通の性質があります。" + rule("みがくと光る(金属光沢)・電気をよく通す・熱をよく伝える・たたくと広がり、引っぱるとのびる") + "。金属以外の物質を<b>非金属</b>といいます。",
      "磁石につくのは、鉄などの一部の金属だけです。アルミニウムや銅は磁石につかないので、" + rule("磁石につくことは、金属に共通の性質ではありません") + "。",
      "物質 " + cm3(1) + " あたりの質量を<b>密度</b>といいます。密度は物質の種類によって決まっているので、物質を見分ける手がかりになります。",
      "液体に入れた物質は、密度が液体より<b>小さければ浮き</b>、<b>大きければ沈みます</b>。氷(" + gcm3("0.92") + ")が水(" + gcm3("1.00") + ")に浮くのは、このためです。",
      "<b>メスシリンダー</b>は水平な台に置き、目の位置を液面と同じ高さにして、" + rule("液面の最も低いところ") + "を、1目盛りの10分の1まで目分量で読みます。"
    ],
    figures: [
      { html: figCylinder(46.5, { names: true }), caption: "メスシリンダーの目盛りの読み方。この図では、液面の底が46と47のちょうど中間にあるので、46.5cm³ と読みます。" },
      { html: figBurner(), caption: "ガスバーナー。上が空気調節ねじ、下がガス調節ねじです。" }
    ],
    blocks: [
      JHS.formula("密度[g/cm³]", JHS.frac("物質の質量[g]", "物質の体積[cm³]")),
      DENSITY_TABLE,
      BURNER_STEPS,
      BALANCE
    ],
    example: {
      title: "ある金属のかたまりの質量と体積をはかりました。この金属の密度を求め、密度の表から金属の種類を答えなさい。" +
        JHS.given([["質量", gram(54)], ["体積", cm3(20)]]),
      steps: [
        "密度は、<b>質量 ÷ 体積</b>で求めます。",
        JHS.calc("54 g ÷ 20 cm³", "2.7 g/cm³"),
        "表で、密度が " + gcm3("2.70") + " の金属は<b>アルミニウム</b>です。"
      ],
      result: gcm3("2.7") + "、アルミニウム"
    },
    fixed: [
      {
        id: "organic-def",
        text: "「有機物」の説明として、正しいものはどれですか。",
        choices: [
          "炭素をふくみ、燃えると二酸化炭素が発生する物質",
          "みがくと光り、電気をよく通す物質",
          "加熱しても変化せず、燃えない物質",
          "水にとけて、透明な液体になる物質"
        ],
        answer: 0,
        explain: [
          "有機物は、炭素をふくむ物質です。燃えると二酸化炭素が発生し、多くは水もできます。",
          "みがくと光り、電気をよく通すのは、金属の性質です。"
        ]
      },
      {
        id: "organic-example",
        text: "次のうち、有機物はどれですか。",
        choices: ["砂糖", "食塩", "ガラス", "鉄"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "砂糖は、加熱するとこげて炭になり、燃えると二酸化炭素が発生する有機物です。",
          "食塩、ガラス、鉄は、無機物です。"
        ]
      },
      {
        id: "inorganic-example",
        text: "次のうち、無機物はどれですか。",
        choices: ["食塩", "デンプン", "ロウ", "プラスチック"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "食塩は、加熱してもこげず、二酸化炭素も発生しない無機物です。",
          "デンプン、ロウ、プラスチックは、炭素をふくみ、燃えると二酸化炭素が発生する有機物です。"
        ]
      },
      {
        id: "limewater",
        text: "集気びんの中で砂糖を燃やしたあと、石灰水を入れてふると、石灰水が白くにごりました。このことから、何ができたとわかりますか。",
        choices: ["二酸化炭素", "酸素", "水素", "窒素"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "石灰水を白くにごらせるのは、二酸化炭素です。",
          "砂糖は有機物なので、燃えると二酸化炭素が発生します。"
        ]
      },
      {
        id: "metal-common",
        text: "次のうち、金属に共通する性質と<b>いえない</b>ものはどれですか。",
        choices: ["磁石につく", "電気をよく通す", "熱をよく伝える", "みがくと光る"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "磁石につくのは、鉄などの一部の金属だけです。アルミニウムや銅は、磁石につきません。",
          "電気をよく通す、熱をよく伝える、みがくと光る(金属光沢)は、金属に共通の性質です。"
        ]
      },
      {
        id: "nonmetal-example",
        text: "次のうち、非金属はどれですか。",
        choices: ["ガラス", "銅", "アルミニウム", "鉄"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "金属以外の物質を、非金属といいます。ガラスは電気を通さず、たたくと割れる非金属です。",
          "銅、アルミニウム、鉄は金属です。"
        ]
      },
      {
        id: "density-meaning",
        text: "「密度」とは、何を表す値ですか。",
        choices: [
          "物質 1cm³ あたりの質量",
          "物質 1g あたりの体積",
          "物質全体の質量",
          "物質が水にとける量"
        ],
        answer: 0,
        explain: [
          "密度は、物質 1cm³ あたりの質量で、単位は g/cm³ です。質量 ÷ 体積 で求めます。",
          "密度は、物質の種類によって決まっていて、物質の量には関係しません。"
        ]
      },
      {
        id: "cylinder-eye",
        text: "水を入れたメスシリンダーの目盛りを読みます。正しい読み方はどれですか。",
        choices: [
          "液面の最も低いところを、真横から見て読む",
          "液面のふちの高いところを、真横から見て読む",
          "液面の最も低いところを、ななめ上から見て読む",
          "液面のふちの高いところを、ななめ下から見て読む"
        ],
        answer: 0,
        explain: [
          "水の液面は、ふちが高く、中央が低くなっています。その最も低いところを読みます。",
          "目の位置は、液面と同じ高さにして、真横から見ます。ななめから見ると、ずれて読んでしまいます。"
        ]
      },
      {
        id: "displaced-volume",
        text: "水を " + cm3("50.0") + " 入れたメスシリンダーに、金属のかたまりを沈めると、液面は図のようになりました。この金属の体積は何cm³ですか。",
        figure: figCylinder(58.5),
        choices: [cm3("8.5"), cm3("58.5"), cm3("9.5"), cm3("108.5")],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "図の液面の底は、58と59の中間なので、" + cm3("58.5") + " と読みます。",
          "ふえた分が、沈めた金属の体積です。",
          JHS.calc("58.5 cm³ − 50.0 cm³", "8.5 cm³")
        ],
        meta: { before: 50, after: 58.5, answer: 8.5 }
      },
      {
        id: "burner-screws",
        text: "図のガスバーナーで、<b>ガスの量</b>を調節するねじはどちらですか。記号と名前の組み合わせを選びなさい。",
        figure: figBurner({ keys: true }),
        choices: ["B・ガス調節ねじ", "A・ガス調節ねじ", "A・空気調節ねじ", "B・空気調節ねじ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "2つのねじのうち、下のねじ(B)がガス調節ねじで、ガスの量を調節します。",
          "上のねじ(A)は空気調節ねじで、空気の量を調節します。"
        ]
      },
      {
        id: "burner-light-order",
        text: "ガスバーナーに火をつけるときの順番として、正しいものはどれですか。2つのねじが閉まっていることは、確かめてあります。",
        choices: [
          "元栓を開く → マッチに火をつける → ガス調節ねじを開いて点火する → 空気調節ねじを開く",
          "元栓を開く → ガス調節ねじを開く → しばらくしてからマッチに火をつける → 空気調節ねじを開く",
          "元栓を開く → マッチに火をつける → 空気調節ねじを開いて点火する → ガス調節ねじを開く",
          "ガス調節ねじを開く → 空気調節ねじを開く → 元栓を開く → マッチに火をつける"
        ],
        answer: 0,
        explain: [
          "元栓を開き、マッチに火をつけてから、ガス調節ねじを少しずつ開いて点火します。",
          "先にガスを出してから火をつけると、たまったガスに一気に火がついて危険です。",
          "空気調節ねじは、火がついて炎の大きさを調節したあとで開きます。"
        ]
      },
      {
        id: "burner-blue-flame",
        text: "図のガスバーナーに火をつけると、炎がオレンジ色でした。青色の炎にするには、どうしますか。",
        figure: figBurner({ keys: true }),
        choices: [
          "B をおさえて、A だけを少しずつ開く",
          "A をおさえて、B だけを少しずつ開く",
          "A と B を、両方とも閉める",
          "B をおさえて、A だけを少しずつ閉める"
        ],
        answer: 0,
        explain: [
          "炎がオレンジ色なのは、空気が足りないからです。",
          "ガス調節ねじ(B)をおさえて、空気調節ねじ(A)だけを開き、空気の量をふやして青色の炎にします。"
        ]
      },
      {
        id: "burner-off-order",
        text: "ガスバーナーの火を消すときの順番として、正しいものはどれですか。",
        choices: [
          "空気調節ねじを閉める → ガス調節ねじを閉める → 元栓を閉める",
          "ガス調節ねじを閉める → 空気調節ねじを閉める → 元栓を閉める",
          "元栓を閉める → ガス調節ねじを閉める → 空気調節ねじを閉める",
          "元栓を閉める → 空気調節ねじを閉める → ガス調節ねじを閉める"
        ],
        answer: 0,
        explain: [
          "火を消すときは、つけるときと逆の順に閉めます。",
          "空気調節ねじ → ガス調節ねじ → 元栓 の順です。"
        ]
      },
      {
        id: "balance-electronic",
        text: "電子てんびんで、粉の薬品を " + gram("5.0") + " はかりとります。薬包紙の使い方として、正しいものはどれですか。",
        choices: [
          "薬包紙をのせてから表示を 0 にし、そのあと薬品をのせていく",
          "表示を 0 にしてから薬包紙をのせ、そのまま薬品をのせていく",
          "薬包紙を使わず、皿に薬品を直接のせる",
          "薬品をのせてから表示を 0 にし、そのあと薬包紙をのせる"
        ],
        answer: 0,
        explain: [
          "薬包紙をのせた状態で表示を 0 にすると、薬包紙の質量をのぞいて、薬品だけの質量をはかれます。",
          "0 にしたあとで薬包紙をのせると、表示には薬包紙の質量もふくまれてしまいます。"
        ]
      }
    ],
    generators: [
      {
        id: "density",
        label: "密度を求める(質量 ÷ 体積)",
        make: function () {
          var c;
          if (Math.random() < 0.4) {
            // 表の金属のうち、どれかを見分ける
            var mt = JHS.pick(METALS), V = JHS.pick([10, 20, 50, 100]);
            var mass = mt.d100 * V / 100;   // V が10の倍数なので、小数第1位までで割り切れる
            c = JHS.choices4(mt.name, METALS.filter(function (x) { return x !== mt; }).map(function (x) { return x.name; }));
            if (!c) return null;
            return {
              text: "ある金属のかたまりの質量と体積をはかると、次のようになりました。この金属は、表のうちどれですか。",
              material: JHS.given([["質量", gram(mass)], ["体積", cm3(V)]]) +
                JHS.table({ head: ["金属", "密度[g/cm³]"], rows: METALS.map(function (x) { return [x.name, x.show]; }) }),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "密度は、質量 ÷ 体積 で求めます。",
                JHS.calc(num(mass) + " g ÷ " + V + " cm³", mt.show + " g/cm³"),
                "表で、密度が " + gcm3(mt.show) + " の金属は、" + mt.name + "です。"
              ],
              meta: { kind: "identify", mass: mass, volume: V, density: mt.d100 / 100, answer: mt.name }
            };
          }
          var d10 = JHS.pick([5, 8, 9, 12, 15, 25, 27, 45, 79, 105]), vol = JHS.pick([5, 10, 20, 30, 40, 50, 60, 80]);
          var m10 = d10 * vol, m = m10 / 10, dens = d10 / 10;
          var inverse = Math.round(vol * 1000 / m10) / 100;   // 体積 ÷ 質量(割る向きが逆)
          c = JHS.choices4(gcm3(dens), [gcm3(inverse), gcm3(d10), gcm3(Math.round(m10 * vol) / 10), gcm3(d10 / 100), gcm3(m + vol)]);
          if (!c) return null;
          return {
            text: "ある物体の質量と体積をはかると、次のようになりました。この物体をつくっている物質の密度は何g/cm³ですか。",
            material: JHS.given([["質量", gram(m)], ["体積", cm3(vol)]]),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "密度は、質量 ÷ 体積 で求めます。",
              JHS.calc(num(m) + " g ÷ " + vol + " cm³", num(dens) + " g/cm³"),
              "体積 ÷ 質量 で計算した " + ((vol * 1000) % m10 === 0 ? "" : "約 ") + q(inverse) + " は、割る向きが逆です。答えになりません。"
            ],
            meta: { kind: "density", mass: m, volume: vol, answer: dens }
          };
        }
      },
      {
        id: "mass-volume",
        label: "密度から、質量や体積を求める",
        make: function () {
          var subs = [
            { name: "アルミニウム", d100: 270, show: "2.70" },
            { name: "鉄", d100: 787, show: "7.87" },
            { name: "銅", d100: 896, show: "8.96" },
            { name: "氷", d100: 92, show: "0.92" },
            { name: "エタノール", d100: 79, show: "0.79" }
          ];
          var sb = JHS.pick(subs), V = JHS.pick([10, 20, 50, 100, 200]);
          var m10 = sb.d100 * V / 10, m = m10 / 10;   // 質量の10倍は整数になる
          var c;
          if (Math.random() < 0.5) {
            var wrongDiv = Math.round(V * 1000 / sb.d100) / 10;   // 体積 ÷ 密度
            c = JHS.choices4(gram(m), [gram(wrongDiv), gram(m * 10), gram(m10 / 100), gram(V), gram(m + V)]);
            if (!c) return null;
            return {
              text: sb.name + "の密度は " + gcm3(sb.show) + " です。体積が " + cm3(V) + " の" + sb.name + "の質量は何gですか。",
              material: JHS.given([["密度", gcm3(sb.show)], ["体積", cm3(V)]]),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "密度は " + cm3(1) + " あたりの質量なので、質量は、密度 × 体積 で求めます。",
                JHS.calc(sb.show + " g/cm³ × " + V + " cm³", num(m) + " g"),
                "体積 ÷ 密度 で計算した " + ((V * 1000) % sb.d100 === 0 ? "" : "約 ") + q(wrongDiv) + " は、誤りです。"
              ],
              meta: { kind: "mass", substance: sb.name, density: sb.d100 / 100, volume: V, answer: m }
            };
          }
          var wrongMul = Math.round(m10 * sb.d100 / 100) / 10;   // 質量 × 密度
          c = JHS.choices4(cm3(V), [cm3(wrongMul), cm3(V * 10), cm3(V / 10), cm3(m), cm3(V + 10)]);
          if (!c) return null;
          return {
            text: sb.name + "の密度は " + gcm3(sb.show) + " です。質量が " + gram(m) + " の" + sb.name + "の体積は何cm³ですか。",
            material: JHS.given([["密度", gcm3(sb.show)], ["質量", gram(m)]]),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "密度 = 質量 ÷ 体積 なので、体積は、質量 ÷ 密度 で求めます。",
              JHS.calc(num(m) + " g ÷ " + sb.show + " g/cm³", V + " cm³"),
              "検算: " + gcm3(sb.show) + " × " + cm3(V) + " = " + gram(m) + " になります。"
            ],
            meta: { kind: "volume", substance: sb.name, density: sb.d100 / 100, mass: m, answer: V }
          };
        }
      },
      {
        id: "cylinder",
        label: "メスシリンダーの目盛りを読む",
        make: function () {
          var d = JHS.pick([20, 30, 40, 50, 60, 70, 80]), half = JHS.randInt(3, 17);   // 液面は d + 1.5 〜 d + 8.5
          var v = d + half / 2, low = Math.floor(v);
          function show(x) { return cm3(num(x, 1)); }
          var c = JHS.choices4(show(v), [show(v + 1), show(2 * d + 10 - v), show(v - 1), show(v + 10), show(v - 10)]);
          if (!c) return null;
          return {
            text: "メスシリンダーに水を入れると、液面は図のようになりました。水の体積は何cm³ですか。1目盛りは " + cm3(1) + " です。",
            figure: figCylinder(v),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "液面の最も低いところを、真横から見て、1目盛りの10分の1まで読みます。",
              half % 2 === 1
                ? "液面の底は、" + low + " と " + (low + 1) + " の目盛りのちょうど中間にあるので、" + show(v) + " です。"
                : "液面の底は、" + low + " の目盛りの線と重なっているので、" + show(v) + " です(10分の1の位の 0 も書きます)。",
              "数字の書いてある目盛り(" + d + " と " + (d + 10) + ")から、1目盛りずつ数えて確かめましょう。"
            ],
            meta: { volume: v, answer: v }
          };
        }
      },
      {
        id: "float-sink",
        label: "密度をくらべて、浮くか沈むかを考える",
        make: function () {
          var liquids = [{ name: "水", d100: 100, show: "1.00" }, { name: "エタノール", d100: 79, show: "0.79" }];
          var solids = [
            { name: "氷", d100: 92, show: "0.92" },
            { name: "アルミニウム", d100: 270, show: "2.70" },
            { name: "鉄", d100: 787, show: "7.87" },
            { name: "銅", d100: 896, show: "8.96" }
          ].concat([60, 70, 85, 95, 110, 130].map(function (d) { return { name: "固体X", d100: d, show: num(d / 100, 2) }; }));
          var wantFloat = Math.random() < 0.5, pairs = [];
          liquids.forEach(function (l) {
            solids.forEach(function (sd) { if ((sd.d100 < l.d100) === wantFloat) pairs.push([sd, l]); });
          });
          var p = JHS.pick(pairs), sd = p[0], lq = p[1];
          function line(verb, cmp) { return verb + "。" + sd.name + "の密度が、" + lq.name + "の密度より" + cmp + "から"; }
          var choices = wantFloat
            ? [line("浮く", "小さい"), line("沈む", "大きい"), line("浮く", "大きい"), line("沈む", "小さい")]
            : [line("沈む", "大きい"), line("浮く", "小さい"), line("沈む", "小さい"), line("浮く", "大きい")];
          return {
            text: sd.name + "を、" + lq.name + "の中に入れました。" + sd.name + "は、浮きますか、沈みますか。",
            material: JHS.given([[sd.name + "の密度", gcm3(sd.show)], [lq.name + "の密度", gcm3(lq.show)]]),
            choices: choices, answer: 0,
            explain: [
              "液体より密度が小さい物質は浮き、大きい物質は沈みます。",
              sd.name + "の密度 " + gcm3(sd.show) + " は、" + lq.name + "の密度 " + gcm3(lq.show) + " より" + (wantFloat ? "小さい" : "大きい") + "ので、" + (wantFloat ? "浮きます" : "沈みます") + "。"
            ],
            meta: { solid: sd.name, solidDensity: sd.d100 / 100, liquid: lq.name, liquidDensity: lq.d100 / 100, answer: wantFloat ? "浮く" : "沈む" }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 1-5 気体の性質
  // =====================================================================
  var GASES = JHS.table({
    caption: "おもな気体の性質",
    head: ["気体", "色・におい", "重さ", "水へのとけ方", "集め方", "そのほか"],
    stack: true,
    rows: [
      ["酸素", "無色・においなし", "空気より少し重い", "とけにくい", "水上置換法", "ものを燃やすはたらきがある"],
      ["二酸化炭素", "無色・においなし", "空気より重い", "少しとける", "下方置換法(水上置換法でもよい)", "石灰水を白くにごらせる。水溶液は酸性"],
      ["水素", "無色・においなし", "気体の中で最も軽い", "とけにくい", "水上置換法", "火をつけると燃えて、水ができる"],
      ["アンモニア", "無色・刺激臭", "空気より軽い", "非常にとけやすい", "上方置換法", "水溶液はアルカリ性。有毒"],
      ["窒素", "無色・においなし", "空気よりわずかに軽い", "とけにくい", "水上置換法", "空気の約78%をしめる。燃えない"]
    ]
  });

  var GAS_MAKING = JHS.table({
    caption: "気体の発生方法",
    head: ["気体", "発生方法"],
    rows: [
      ["酸素", "二酸化マンガンに、うすい過酸化水素水(オキシドール)を加える。"],
      ["二酸化炭素", "石灰石に、うすい塩酸を加える。"],
      ["水素", "亜鉛や鉄などの金属に、うすい塩酸を加える。"],
      ["アンモニア", "塩化アンモニウムと水酸化カルシウムの混合物を加熱する。"]
    ]
  });

  var COLLECT_TREE = JHS.branch({
    q: "集める気体は、水にとけにくいか",
    kids: [
      { when: "とけにくい", leaf: "水上置換法", note: "酸素、水素、窒素。二酸化炭素も、水に少ししかとけないので集められる" },
      {
        when: "とけやすい", q: "空気より重いか、軽いか", kids: [
          { when: "重い(密度が大きい)", leaf: "下方置換法", note: "二酸化炭素(水に少しとける)" },
          { when: "軽い(密度が小さい)", leaf: "上方置換法", note: "アンモニア" }
        ]
      }
    ]
  });

  JHS.register("g1-gases", {
    points: [
      "気体は、" + rule("水へのとけやすさ") + "と、" + rule("空気とくらべた重さ(密度)") + "で、集め方を決めます。水にとけにくい気体は<b>水上" + r("置換", "ちかん") + "法</b>、水にとけやすく空気より重い気体は<b>下方置換法</b>、水にとけやすく空気より軽い気体は<b>上方置換法</b>で集めます。",
      "<b>酸素</b>は、二酸化マンガンにうすい過酸化水素水を加えると発生します。" + rule("ものを燃やすはたらき") + "がありますが、酸素そのものは燃えません。空気の約21%をしめます。",
      "<b>二酸化炭素</b>は、石灰石にうすい塩酸を加えると発生します。空気より重く、水に少しとけます。" + rule("石灰水を白くにごらせ") + "、水溶液(炭酸水)は酸性を示します。",
      "<b>水素</b>は、亜鉛や鉄などの金属にうすい塩酸を加えると発生します。気体の中で最も軽く、火をつけると" + rule("音を立てて燃え、水ができます") + "。",
      "<b>アンモニア</b>は、塩化アンモニウムと水酸化カルシウムの混合物を加熱すると発生します。鼻をさすような<b>刺激臭</b>があり、空気より軽く、" + rule("水に非常にとけやすい") + "気体です。水溶液はアルカリ性を示します。",
      "<b>窒素</b>は、空気の約78%をしめる気体です。水にとけにくく、燃えません。気体のにおいを調べるときは、じかにかがず、<b>手であおいで</b>かぎます。"
    ],
    figures: [
      { html: figCollect(), caption: "気体の集め方。水上置換法は、空気がまじらず、集めた気体の量もわかります。上方置換法と下方置換法は、水にとけやすい気体に使います。" }
    ],
    blocks: [COLLECT_TREE, GASES, GAS_MAKING],
    example: {
      title: "ある気体は、水に非常にとけやすく、空気より軽いことがわかっています。この気体を集めるには、どの方法が適していますか。",
      steps: [
        "水に非常にとけやすいので、水上置換法は使えません(集める前に、水にとけてしまいます)。",
        "空気より軽い気体は、容器の中で上にたまります。",
        "容器の口を下に向け、上にたまった気体が空気をおし出すようにして集めます。これが<b>上方置換法</b>です。"
      ],
      result: "上方置換法"
    },
    fixed: [
      {
        id: "water-advantage",
        text: "図の方法で気体を集めます。この方法には、ほかの集め方とくらべて、どのようなよい点がありますか。",
        figure: figCollect({ only: "water", keys: true }),
        choices: [
          "空気のまじらない気体を集められ、集めた量もわかりやすい",
          "水にとけやすい気体でも、とけずに集められる",
          "空気より軽い気体だけを、選んで集められる",
          "集めた気体を冷やして、液体にできる"
        ],
        answer: 0,
        explain: [
          "図は水上置換法です。水と置きかえて集めるので、空気がまじりにくく、たまった気体の量も見てわかります。",
          "水にとけやすい気体は、水にとけてしまうので、この方法では集められません。"
        ]
      },
      {
        id: "ammonia-up-reason",
        text: "アンモニアは、図の方法で集めます。それは、アンモニアにどのような性質があるからですか。",
        figure: figCollect({ only: "up", keys: true }),
        choices: [
          "水に非常にとけやすく、空気より軽いから",
          "水に非常にとけやすく、空気より重いから",
          "水にとけにくく、空気より軽いから",
          "水にとけにくく、空気より重いから"
        ],
        answer: 0,
        explain: [
          "図は、容器の口を下に向けて集める上方置換法です。",
          "アンモニアは水に非常にとけやすいので水上置換法は使えず、空気より軽いので、上にたまるように集めます。"
        ]
      },
      {
        id: "down-name",
        text: "図のように、口を上に向けた容器の底までガラス管を入れて、気体を集める方法を何といいますか。",
        figure: figCollect({ only: "down", keys: true }),
        choices: ["下方置換法", "上方置換法", "水上置換法", "蒸留"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "空気より重い気体は容器の底にたまり、空気を上へおし出します。この集め方が下方置換法です。",
          "上方置換法は容器の口を下に向け、水上置換法は水と置きかえて集めます。"
        ]
      },
      {
        id: "oxygen-make",
        text: "酸素を発生させるには、どの組み合わせを使いますか。",
        choices: [
          "二酸化マンガンと、うすい過酸化水素水(オキシドール)",
          "石灰石と、うすい塩酸",
          "亜鉛と、うすい塩酸",
          "塩化アンモニウムと、水酸化カルシウム"
        ],
        answer: 0,
        explain: [
          "酸素は、二酸化マンガンにうすい過酸化水素水(オキシドール)を加えると発生します。",
          "石灰石とうすい塩酸では二酸化炭素、亜鉛とうすい塩酸では水素、塩化アンモニウムと水酸化カルシウムではアンモニアが発生します。"
        ]
      },
      {
        id: "oxygen-property",
        text: "酸素を集めた集気びんの中に、火のついた線香を入れると、どうなりますか。",
        choices: [
          "線香が、炎を上げて激しく燃える",
          "線香の火が、すぐに消える",
          "気体そのものが、ポンと音を立てて燃える",
          "びんの中の気体が、白くにごる"
        ],
        answer: 0,
        explain: [
          "酸素には、ものを燃やすはたらきがあるので、線香は炎を上げて激しく燃えます。",
          "酸素そのものは燃えません。音を立てて燃えるのは、水素です。"
        ]
      },
      {
        id: "co2-make",
        text: "石灰石にうすい塩酸を加えると発生する気体は、何ですか。",
        choices: ["二酸化炭素", "酸素", "水素", "アンモニア"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "石灰石にうすい塩酸を加えると、二酸化炭素が発生します。",
          "貝殻や卵の殻でも、同じように二酸化炭素が発生します。"
        ]
      },
      {
        id: "co2-down-reason",
        text: "二酸化炭素は、下方置換法で集めることができます。それは、二酸化炭素にどのような性質があるからですか。",
        choices: [
          "空気より重い(密度が大きい)から",
          "空気より軽い(密度が小さい)から",
          "鼻をさすような、においがあるから",
          "ものを燃やすはたらきがあるから"
        ],
        answer: 0,
        explain: [
          "二酸化炭素は空気より重いので、容器の底にたまります。そのため、下方置換法で集められます。",
          "水に少ししかとけないので、水上置換法で集めることもできます。"
        ]
      },
      {
        id: "co2-acid",
        text: "二酸化炭素を水にとかした水溶液(炭酸水)の性質として、正しいものはどれですか。",
        choices: [
          "酸性を示し、青色リトマス紙を赤色に変える",
          "アルカリ性を示し、赤色リトマス紙を青色に変える",
          "中性で、どちらのリトマス紙の色も変えない",
          "アルカリ性を示し、フェノールフタレイン溶液を赤色に変える"
        ],
        answer: 0,
        explain: [
          "二酸化炭素の水溶液は、酸性を示します。酸性の水溶液は、青色リトマス紙を赤色に変えます。",
          "水溶液がアルカリ性を示すのは、アンモニアです。"
        ]
      },
      {
        id: "hydrogen-make",
        text: "水素を発生させる方法として、正しいものはどれですか。",
        choices: [
          "亜鉛に、うすい塩酸を加える",
          "石灰石に、うすい塩酸を加える",
          "二酸化マンガンに、うすい過酸化水素水を加える",
          "塩化アンモニウムと水酸化カルシウムの混合物を加熱する"
        ],
        answer: 0,
        explain: [
          "水素は、亜鉛や鉄などの金属に、うすい塩酸を加えると発生します。",
          "石灰石とうすい塩酸では、二酸化炭素が発生します。同じうすい塩酸でも、加える相手によって発生する気体が変わります。"
        ]
      },
      {
        id: "hydrogen-property",
        text: "ある気体を試験管に集め、口にマッチの火を近づけると、ポンと音を立てて燃えました。この気体は何ですか。",
        choices: ["水素", "酸素", "二酸化炭素", "窒素"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "火を近づけると音を立てて燃えるのは、水素です。水素が燃えると、水ができます。",
          "酸素は、ものを燃やすはたらきがありますが、酸素そのものは燃えません。二酸化炭素と窒素も燃えません。"
        ]
      },
      {
        id: "ammonia-make",
        text: "塩化アンモニウムと水酸化カルシウムを混ぜ、試験管に入れて加熱しました。発生する気体は何ですか。",
        choices: ["アンモニア", "酸素", "水素", "二酸化炭素"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "塩化アンモニウムと水酸化カルシウムの混合物を加熱すると、アンモニアが発生します。",
          "アンモニアは、鼻をさすような刺激臭のある気体です。"
        ]
      },
      {
        id: "ammonia-fountain",
        text: "アンモニアを満たしたフラスコの中に、スポイトで少量の水を入れると、ガラス管から水が吸い上げられて、噴水のようになります。これは、アンモニアのどの性質によるものですか。",
        choices: [
          "水に非常にとけやすい",
          "空気より軽い",
          "刺激臭がある",
          "色がない"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "スポイトの水に、フラスコの中のアンモニアが一気にとけます。すると、フラスコの中の気体が減るので、水が吸い上げられます。",
          "空気より軽いこと、刺激臭があること、色がないことは、どれもアンモニアの性質ですが、噴水の原因ではありません。"
        ]
      },
      {
        id: "nitrogen-air",
        text: "空気にふくまれる気体のうち、体積の割合が最も大きいものはどれですか。",
        choices: ["窒素", "酸素", "二酸化炭素", "水素"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "空気の約78%は窒素で、最も多くふくまれています。",
          "酸素は約21%です。二酸化炭素は、ごくわずかしかふくまれていません。"
        ]
      },
      {
        id: "smell",
        text: "気体のにおいを調べるときの方法として、正しいものはどれですか。",
        choices: [
          "手であおぐようにして、少しだけかぐ",
          "容器の口に鼻を近づけて、深く吸いこむ",
          "容器をさかさまにして、顔の上でふる",
          "息を止めて、容器の口に鼻をつける"
        ],
        answer: 0,
        explain: [
          "気体には、アンモニアのように有毒なものがあります。",
          "じかにかがず、手であおぐようにして、少しだけかぎます。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-6 水溶液
  // =====================================================================
  var KNO3_TABLE = JHS.table({
    caption: "100gの水にとける硝酸カリウムの質量(およその値)",
    head: ["水の温度", "とける質量"],
    rows: [0, 20, 40, 60, 80].map(function (t) { return [temp(t), gram(KNO3[t])]; })
  });

  JHS.register("g1-solutions", {
    points: [
      "とけている物質を<b>" + r("溶質", "ようしつ") + "</b>、溶質をとかしている液体を<b>" + r("溶媒", "ようばい") + "</b>、溶質が溶媒にとけた液全体を<b>溶液</b>といいます。溶媒が水の溶液が<b>水溶液</b>です。",
      "水溶液は、色がついていても" + rule("透明") + "で、" + rule("濃さはどの部分も同じ") + "です。時間がたっても、溶質が底にたまることはありません。物質が水にとけても、全体の質量は変わりません(溶液の質量 = 溶質の質量 + 溶媒の質量)。",
      "溶液の濃さは、溶液の質量に対する溶質の質量の割合で表します。これを<b>質量パーセント濃度</b>といいます。割るのは、溶媒(水)ではなく、" + rule("溶液全体の質量") + "です。",
      "100gの水にとける物質の最大の質量を<b>" + r("溶解度", "ようかいど") + "</b>といいます。溶解度は、物質の種類と水の温度によって決まっています。物質が溶解度までとけている水溶液を<b>" + r("飽和", "ほうわ") + "水溶液</b>といいます。",
      "固体の物質をいったん水にとかし、再び結晶としてとり出すことを<b>再結晶</b>といいます。" + r("硝酸", "しょうさん") + "カリウムのように、温度による溶解度の差が大きい物質は、" + rule("水溶液を冷やして") + "とり出します。塩化ナトリウムは、溶解度が温度によってほとんど変わらないので、" + rule("水を蒸発させて") + "とり出します。",
      "液体にとけていない固体は、<b>ろ過</b>でとり出します。液は<b>ガラス棒を伝わらせて</b>注ぎ、ろうとの先のとがったほうを<b>ビーカーの壁につけます</b>。"
    ],
    figures: [
      { html: figSolubility(), caption: "溶解度曲線。100gの水にとける質量を、水の温度ごとに表したグラフです。硝酸カリウムは温度による変化が大きく、塩化ナトリウムはほとんど変わりません。" },
      { html: figFilter(), caption: "ろ過のしかた。ろ紙は、水でぬらして、ろうとに密着させておきます。" }
    ],
    blocks: [
      JHS.formula("質量パーセント濃度[%]", JHS.frac("溶質の質量[g]", "溶液の質量[g]") + " × 100"),
      JHS.formula("溶液の質量", "溶質の質量 + 溶媒の質量"),
      KNO3_TABLE
    ],
    example: {
      title: "水 " + gram(80) + " に、砂糖 " + gram(20) + " をすべてとかしました。この砂糖水の質量パーセント濃度は何%ですか。",
      steps: [
        "まず、溶液(砂糖水)全体の質量を求めます。",
        JHS.calc("20 g + 80 g", "100 g"),
        "溶質(砂糖)の質量を、溶液の質量で割って、100をかけます。",
        JHS.calc("20 g ÷ 100 g × 100", "20 %"),
        "水の質量 " + gram(80) + " で割ると 25% になりますが、これは誤りです。"
      ],
      result: pct(20)
    },
    fixed: [
      {
        id: "solute-solvent",
        text: "食塩水の「溶質」と「溶媒」の組み合わせとして、正しいものはどれですか。",
        choices: [
          "溶質は食塩、溶媒は水",
          "溶質は水、溶媒は食塩",
          "溶質は食塩水、溶媒は水",
          "溶質は食塩、溶媒は食塩水"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "とけている物質(食塩)が溶質、とかしている液体(水)が溶媒です。",
          "食塩水は、溶質が溶媒にとけた液全体で、溶液といいます。"
        ]
      },
      {
        id: "solution-uniform",
        text: "砂糖を水に入れてふたをし、そのまま何日か置くと、砂糖はすべてとけて見えなくなりました。さらに何日か置くと、砂糖水の濃さはどうなりますか。",
        choices: [
          "どの部分も、同じ濃さのままである",
          "底に近い部分ほど、濃くなる",
          "水面に近い部分ほど、濃くなる",
          "砂糖が、再び底にたまってくる"
        ],
        answer: 0,
        explain: [
          "水にとけた砂糖は、目に見えない小さな粒子になって、水の中に一様に広がっています。",
          "いちどとけると、時間がたっても、濃さはどの部分も同じままです。底にたまることはありません。"
        ]
      },
      {
        id: "solution-mass",
        text: "水 " + gram(100) + " に、食塩 " + gram(15) + " をすべてとかしました。できた食塩水の質量は何gですか。",
        choices: [gram(115), gram(100), gram(85), gram(15)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "食塩は、とけて見えなくなっても、なくなったわけではありません。",
          "溶液の質量は、溶質の質量と溶媒の質量の和です。",
          JHS.calc("15 g + 100 g", "115 g")
        ],
        meta: { solute: 15, solvent: 100, answer: 115 }
      },
      {
        id: "transparent",
        text: "水溶液に共通する特徴として、正しいものはどれですか。",
        choices: [
          "色がついているものもあるが、どれも透明である",
          "どれも色がなく、無色である",
          "しばらく置くと、底のほうが濃くなる",
          "ろ過をすると、とけている物質をろ紙の上にとり出せる"
        ],
        answer: 0,
        explain: [
          "水溶液は透明です。硫酸銅水溶液のように、青色で透明なものもあります。",
          "濃さはどの部分も同じで、時間がたっても変わりません。とけている物質の粒子は、ろ紙の穴より小さいので、ろ紙を通りぬけます。"
        ]
      },
      {
        id: "same-concentration",
        text: "質量パーセント濃度が 10% の砂糖水 " + gram(200) + " を、2つのビーカーに " + gram(100) + " ずつ分けました。それぞれの砂糖水の濃度は、何%ですか。",
        choices: [pct(10), pct(5), pct(20), pct(100)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "水溶液の濃さは、どの部分も同じです。分けても、濃度は 10% のまま変わりません。",
          "半分にすると、とけている砂糖の質量は半分になりますが、砂糖水の質量も半分になります。"
        ],
        meta: { answer: 10 }
      },
      {
        id: "saturated-def",
        text: "「飽和水溶液」の説明として、正しいものはどれですか。",
        choices: [
          "物質が、それ以上とけることのできない量までとけている水溶液",
          "物質が、少しだけとけている、うすい水溶液",
          "質量パーセント濃度が、ちょうど 100% の水溶液",
          "温度を下げても、結晶が出てこない水溶液"
        ],
        answer: 0,
        explain: [
          "物質が溶解度(とける限度の量)までとけている水溶液を、飽和水溶液といいます。",
          "とける限度の量は、物質の種類と水の温度によって決まっています。"
        ]
      },
      {
        id: "solubility-compare",
        text: "図は、硝酸カリウムと塩化ナトリウムの溶解度曲線です。60℃の飽和水溶液を冷やして、結晶を多くとり出せるのはどちらですか。理由も選びなさい。",
        figure: figSolubility(),
        choices: [
          "硝酸カリウム。温度による溶解度の変化が大きいから",
          "硝酸カリウム。温度による溶解度の変化が小さいから",
          "塩化ナトリウム。温度による溶解度の変化が大きいから",
          "塩化ナトリウム。温度による溶解度の変化が小さいから"
        ],
        answer: 0,
        explain: [
          "冷やすと、とけきれなくなった分が結晶として出てきます。出てくる量は、冷やす前と後の溶解度の差です。",
          "硝酸カリウムは、温度が下がると溶解度が大きく下がるので、多くの結晶が出てきます。",
          "塩化ナトリウムは、曲線がほぼ水平で、冷やしても結晶はほとんど出てきません。"
        ]
      },
      {
        id: "dissolve-all",
        text: "図は、硝酸カリウムの溶解度曲線です。40℃の水 " + gram(100) + " に、硝酸カリウム " + gram(50) + " を入れて、よくかき混ぜました。どうなりますか。",
        figure: figSolubility({ only: "kno3", guides: [40] }),
        choices: [
          "すべてとける。40℃の水100gには、64gまでとけるから",
          "14gがとけ残る。40℃の水100gには、64gまでとけるから",
          "すべてとけ残る。硝酸カリウムは、水にとけないから",
          "50gがとけて、さらに64gの結晶が出てくる"
        ],
        answer: 0,
        explain: [
          "図から、40℃の水100gには、硝酸カリウムが 64g までとけます。",
          "入れた 50g は 64g より少ないので、すべてとけます。あと 14g とかすことができます。"
        ],
        meta: { temperature: 40, solubility: 64, added: 50 }
      },
      {
        id: "nacl-crystal",
        text: "塩化ナトリウムの水溶液から、結晶をとり出すには、どの方法が適していますか。",
        choices: [
          "水溶液を加熱して、水を蒸発させる",
          "水溶液を、氷水で冷やす",
          "水溶液を、ろ紙でろ過する",
          "水溶液に、水を加えてうすめる"
        ],
        answer: 0,
        explain: [
          "塩化ナトリウムの溶解度は、温度が変わってもほとんど変わりません。冷やしても、結晶はほとんど出てきません。",
          "水を蒸発させると、とけきれなくなった塩化ナトリウムが、結晶として出てきます。",
          "とけている物質は、ろ紙を通りぬけるので、ろ過ではとり出せません。"
        ]
      },
      {
        id: "recrystallization-def",
        text: "「再結晶」の説明として、正しいものはどれですか。",
        choices: [
          "固体の物質をいったん水にとかし、再び結晶としてとり出すこと",
          "液体を沸騰させ、出てきた気体を冷やして、再び液体にすること",
          "液体にとけていない固体を、ろ紙でこしてとり出すこと",
          "固体の物質を加熱して、液体に変えること"
        ],
        answer: 0,
        explain: [
          "再結晶は、物質を水にとかしてから、冷やしたり水を蒸発させたりして、再び結晶としてとり出すことです。",
          "液体を沸騰させて気体を冷やして集めるのは蒸留、ろ紙でこすのはろ過です。"
        ]
      },
      {
        id: "crystal-shape",
        text: "塩化ナトリウムの結晶は、どのような形をしていますか。",
        choices: [
          "立方体に近い形",
          "細長い針のような形",
          "正八面体に近い形",
          "決まった形はない"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "結晶の形は、物質の種類によって決まっています。塩化ナトリウムの結晶は、立方体に近い形です。",
          "硝酸カリウムの結晶は細長い針のような形、ミョウバンの結晶は正八面体に近い形です。"
        ]
      },
      {
        id: "filter-wrong-tip",
        text: "図は、ろ過をしているようすです。この操作には、正しくないところがあります。どこですか。",
        figure: figFilter({ wrong: "tip" }),
        choices: [
          "ろうとの先が、ビーカーの壁についていない",
          "液を、ガラス棒を伝わらせて注いでいる",
          "ろうとの中に、ろ紙を入れている",
          "ろうとの下に、ビーカーを置いている"
        ],
        answer: 0,
        explain: [
          "ろうとの先は、とがったほうをビーカーの壁につけます。図では、ビーカーの中央にあります。",
          "壁につけると、ろ過された液が壁を伝って流れ、はねずに集まります。",
          "ガラス棒を伝わらせて注ぐこと、ろ紙を使うことは、正しい操作です。"
        ]
      },
      {
        id: "filter-wrong-rod",
        text: "図のろ過の操作を、正しく直すには、どうすればよいですか。",
        figure: figFilter({ wrong: "rod" }),
        choices: [
          "液を、ガラス棒を伝わらせて、少しずつ注ぐ",
          "ろうとの先を、ビーカーの壁から離す",
          "ろ紙をとりのぞいて、ろうとに直接注ぐ",
          "液を、もっと高いところから勢いよく注ぐ"
        ],
        answer: 0,
        explain: [
          "図では、ビーカーの液を、ろうとに直接注いでいます。",
          "液がはねたり、ろ紙が破れたりしないように、ガラス棒を伝わらせて、少しずつ注ぎます。",
          "ろうとの先がビーカーの壁についているのは、正しい操作です。"
        ]
      }
    ],
    generators: [
      {
        id: "concentration",
        label: "質量パーセント濃度を求める",
        make: function () {
          var solute = JHS.pick(["食塩", "砂糖"]);
          var p = JHS.pick(solute === "食塩" ? [4, 5, 8, 10, 12, 15, 16, 20] : [4, 5, 8, 10, 12, 15, 16, 20, 25]);
          var totals = [50, 100, 150, 200, 250, 300, 400, 500].filter(function (t) { return (p * t) % 100 === 0; });
          var total = JHS.pick(totals), s = p * total / 100, w = total - s;
          var liquid = solute + "水";
          var bySolvent = Math.round(s * 1000 / w) / 10;   // 溶媒(水)の質量で割ってしまう
          var c = JHS.choices4(pct(p), [pct(bySolvent), pct(p / 100), pct(100 - p), pct(p * 10), pct(p + 10)]);
          if (!c) return null;
          var fromParts = Math.random() < 0.6;
          var explain = fromParts
            ? [
              "まず、溶液(" + liquid + ")の質量を求めます。溶質と溶媒の質量の和です。",
              JHS.calc(s + " g + " + w + " g", total + " g"),
              "溶質の質量を、溶液の質量で割って、100をかけます。",
              JHS.calc(s + " g ÷ " + total + " g × 100", p + " %"),
              "水の質量 " + gram(w) + " で割って出した " + ((s * 1000) % w === 0 ? "" : "約 ") + pct(bySolvent) + " は、誤りです。溶液の質量で割ります。"
            ]
            : [
              "溶質の質量を、溶液の質量で割って、100をかけます。",
              JHS.calc(s + " g ÷ " + total + " g × 100", p + " %"),
              "100をかけ忘れると " + q(p / 100) + " になってしまいます。"
            ];
          return {
            text: fromParts
              ? "水 " + gram(w) + " に、" + solute + " " + gram(s) + " をすべてとかしました。この" + liquid + "の質量パーセント濃度は何%ですか。"
              : liquid + " " + gram(total) + " の中に、" + solute + "が " + gram(s) + " とけています。この" + liquid + "の質量パーセント濃度は何%ですか。",
            material: fromParts
              ? JHS.given([["溶質(" + solute + ")", gram(s)], ["溶媒(水)", gram(w)]])
              : JHS.given([["溶液(" + liquid + ")", gram(total)], ["溶質(" + solute + ")", gram(s)]]),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: explain,
            meta: { kind: fromParts ? "from-parts" : "from-solution", solute: s, solvent: w, solution: total, answer: p }
          };
        }
      },
      {
        id: "solute-mass",
        label: "濃度から、溶質や水の質量を求める",
        make: function () {
          var solute = JHS.pick(["食塩", "砂糖"]);
          var p = JHS.pick([2, 4, 5, 8, 10, 12, 15, 20]);
          var totals = [50, 100, 150, 200, 250, 300, 400, 500].filter(function (t) { return (p * t) % 100 === 0; });
          var total = JHS.pick(totals), s = p * total / 100, w = total - s;
          var liquid = solute + "水", c;
          var given = JHS.given([["質量パーセント濃度", pct(p)], ["溶液(" + liquid + ")", gram(total)]]);
          var base = [
            "溶質の質量は、溶液の質量 × 濃度[%] ÷ 100 で求めます。",
            JHS.calc(total + " g × " + p + " ÷ 100", s + " g")
          ];
          if (Math.random() < 0.6) {
            c = JHS.choices4(gram(s), [gram(w), gram(Math.round(total * 10 / p) / 10), gram(total * p), gram(s * 10), gram(s + 10)]);
            if (!c) return null;
            return {
              text: "質量パーセント濃度が " + pct(p) + " の" + liquid + "が " + gram(total) + " あります。この中にとけている" + solute + "は何gですか。",
              material: given,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: base.concat(["のこりの " + gram(w) + " は、水の質量です。"]),
              meta: { kind: "solute", concentration: p, solution: total, answer: s }
            };
          }
          c = JHS.choices4(gram(w), [gram(s), gram(total), gram(total + s), gram(total - p), gram(w - 10)].filter(function (x, i) { return !(i === 4 && w <= 10); }));
          if (!c) return null;
          return {
            text: "質量パーセント濃度が " + pct(p) + " の" + liquid + "を " + gram(total) + " つくります。水は何g必要ですか。",
            material: given,
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: base.concat([
              "水の質量は、溶液の質量から、溶質の質量を引いて求めます。",
              JHS.calc(total + " g − " + s + " g", w + " g")
            ]),
            meta: { kind: "solvent", concentration: p, solution: total, solute: s, answer: w }
          };
        }
      },
      {
        id: "recrystallization",
        label: "再結晶で出てくる結晶の質量(溶解度曲線)",
        make: function () {
          var temps = [0, 20, 40, 60, 80];
          var t1 = JHS.pick([20, 40, 60, 80]);
          var t2 = JHS.pick(temps.filter(function (t) { return t < t1; }));
          var s1 = KNO3[t1], s2 = KNO3[t2];
          var kind = JHS.pick(["saturated", "partial", "partial", "double"]);
          var fig = figSolubility({ only: "kno3", guides: [t1, t2] });
          var lead = "図は、硝酸カリウムの溶解度曲線です。図の中の数字は、その温度の水 " + gram(100) + " にとける質量[g]を表しています。";
          var c, ans;
          if (kind === "partial") {
            // とかした量は、冷やす前はすべてとけ、冷やすととけきれなくなる量にする
            var options = [];
            for (var m0 = 10; m0 < s1; m0 += 10) if (m0 > s2) options.push(m0);
            if (options.length === 0) return null;
            var m = JHS.pick(options);
            ans = m - s2;
            c = JHS.choices4(gram(ans), [gram(s1 - s2), gram(s2), gram(m), gram(s1 - m), gram(m + s2)]);
            if (!c) return null;
            return {
              text: lead + temp(t1) + " の水 " + gram(100) + " に、硝酸カリウム " + gram(m) + " をすべてとかしました。この水溶液を " + temp(t2) + " まで冷やすと、結晶は何g出てきますか。",
              figure: fig,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                temp(t2) + " の水 " + gram(100) + " には、" + gram(s2) + " までしかとけません。",
                "とけきれなくなった分が、結晶として出てきます。",
                JHS.calc(m + " g − " + s2 + " g", ans + " g")
              ],
              meta: { kind: kind, t1: t1, t2: t2, s1: s1, s2: s2, water: 100, dissolved: m, answer: ans }
            };
          }
          var times = kind === "double" ? 2 : 1, water = 100 * times;
          ans = (s1 - s2) * times;
          c = JHS.choices4(gram(ans), kind === "double"
            ? [gram(s1 - s2), gram(s2 * 2), gram(s1 * 2), gram(s1 + s2), gram(ans + 10)]
            : [gram(s2), gram(s1), gram(s1 + s2), gram(ans + 10), gram(ans * 2)]);
          if (!c) return null;
          return {
            text: lead + temp(t1) + " の水 " + gram(water) + " に、硝酸カリウムをとけるだけとかして、飽和水溶液をつくりました。この水溶液を " + temp(t2) + " まで冷やすと、結晶は何g出てきますか。",
            figure: fig,
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: (kind === "double"
              ? [
                "水 " + gram(100) + " のとき、とけていた " + gram(s1) + " のうち、" + temp(t2) + " でもとけていられるのは " + gram(s2) + " です。",
                JHS.calc(s1 + " g − " + s2 + " g", (s1 - s2) + " g"),
                "水が " + gram(200) + " なので、とける量も、出てくる結晶も2倍になります。",
                JHS.calc((s1 - s2) + " g × 2", ans + " g")
              ]
              : [
                temp(t1) + " の水 " + gram(100) + " には " + gram(s1) + " とけていますが、" + temp(t2) + " では " + gram(s2) + " までしかとけません。",
                "その差が、結晶として出てきます。",
                JHS.calc(s1 + " g − " + s2 + " g", ans + " g")
              ]),
            meta: { kind: kind, t1: t1, t2: t2, s1: s1, s2: s2, water: water, dissolved: s1 * times, answer: ans }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 1-7 状態変化
  // =====================================================================
  var MP_BP = JHS.table({
    caption: "いろいろな物質の融点と沸点",
    head: ["物質", "融点", "沸点"],
    rows: [
      ["水", temp(0), temp(100)],
      ["エタノール", temp(-115), temp(78)],
      ["水銀", temp(-39), temp(357)],
      ["酸素", temp(-218), temp(-183)],
      ["窒素", temp(-210), temp(-196)]
    ]
  });

  var STATE_BY_TEMP = JHS.table({
    caption: "温度と物質の状態",
    head: ["温度", "状態"],
    rows: [
      ["融点より低い", "固体"],
      ["融点と沸点の間", "液体"],
      ["沸点より高い", "気体"]
    ]
  });

  JHS.register("g1-state-changes", {
    points: [
      "物質が、温度によって " + rule("固体 ⇄ 液体 ⇄ 気体") + " と姿を変えることを<b>状態変化</b>といいます。状態が変わっても、物質そのものは別の物質になりません。",
      "状態変化では、" + rule("体積は変わりますが、質量は変わりません") + "。物質をつくる粒子の数は同じで、粒子の並び方や、粒子どうしの間が変わるからです。",
      "ふつう、固体 → 液体 → 気体 の順に体積は大きくなります。水は例外で、液体(水)から固体(氷)になると体積が<b>大きく</b>なります。そのため、氷は水より密度が小さく、水に浮きます。",
      "固体がとけて液体になるときの温度を<b>" + r("融点", "ゆうてん") + "</b>、液体が" + r("沸騰", "ふっとう") + "して気体になるときの温度を<b>" + r("沸点", "ふってん") + "</b>といいます。融点と沸点は、" + rule("物質の種類によって決まっていて、物質の量には関係しません") + "。",
      "1種類の物質でできているものを<b>純粋な物質</b>(水、エタノール、酸素、塩化ナトリウム)、いくつかの物質が混ざり合ったものを<b>混合物</b>(空気、食塩水、石油)といいます。純粋な物質は、状態が変わっている間、温度が一定です。混合物は、融点や沸点が決まった温度になりません。",
      "液体を沸騰させ、出てきた気体を冷やして再び液体にして集める方法を<b>" + r("蒸留", "じょうりゅう") + "</b>といいます。" + rule("沸点のちがい") + "を利用して、混合物を分けることができます。水とエタノールの混合物を蒸留すると、はじめに、沸点の低いエタノールを多くふくむ液体が集まります。"
    ],
    figures: [
      { html: figStates(), caption: "状態変化と粒子のようす(どの図も、粒子の数は同じ)。固体は粒子が規則正しく並び、液体は並び方がくずれて動き回り、気体は粒子が自由に飛び回っています。" },
      { html: figHeatingWater("names"), caption: "氷を加熱したときの温度変化。氷がとけている間(0℃)と、水が沸騰している間(100℃)は、加熱を続けても温度が変わりません。" },
      { html: figDistill(), caption: "蒸留の装置。急な沸騰を防ぐために沸騰石を入れ、温度計の球部は、枝の高さにします。火を消す前に、ガラス管を試験管の液体からぬいておきます。" }
    ],
    blocks: [MP_BP, STATE_BY_TEMP],
    example: {
      title: "エタノールの融点は " + temp(-115) + "、沸点は " + temp(78) + " です。" + temp(20) + " のとき、エタノールはどの状態ですか。",
      steps: [
        "融点より低い温度では固体、融点と沸点の間では液体、沸点より高い温度では気体です。",
        temp(20) + " は、融点の " + temp(-115) + " より高く、沸点の " + temp(78) + " より低い温度です。",
        "融点と沸点の間なので、<b>液体</b>です。"
      ],
      result: "液体"
    },
    fixed: [
      {
        id: "wax-solid",
        text: "ビーカーに入れた液体のロウを冷やして、固体にしました。体積と質量は、どうなりますか。",
        choices: [
          "体積は小さくなり、質量は変わらない",
          "体積は小さくなり、質量も小さくなる",
          "体積は大きくなり、質量は変わらない",
          "体積も質量も変わらない"
        ],
        answer: 0,
        explain: [
          "ロウが液体から固体になると、粒子がすき間なく並ぶので、体積は小さくなります(中央がくぼみます)。",
          "粒子の数は変わらないので、質量は変わりません。"
        ]
      },
      {
        id: "water-ice",
        text: "水が氷になるとき、体積と質量は、どうなりますか。",
        choices: [
          "体積は大きくなり、質量は変わらない",
          "体積は小さくなり、質量は変わらない",
          "体積は大きくなり、質量も大きくなる",
          "体積も質量も変わらない"
        ],
        answer: 0,
        explain: [
          "水は例外で、液体から固体(氷)になると、体積が大きくなります。質量は変わりません。",
          "質量が同じで体積が大きくなるので、氷の密度は水より小さくなり、氷は水に浮きます。"
        ]
      },
      {
        id: "particles-order",
        text: "図の ア〜ウ は、ある物質の固体・液体・気体のいずれかの、粒子のようすを表しています。固体 → 液体 → 気体 の順に並べたものはどれですか。",
        figure: figStates({ keys: true, order: ["gas", "solid", "liquid"] }),
        choices: ["イ → ウ → ア", "ア → ウ → イ", "ウ → イ → ア", "イ → ア → ウ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "固体は、粒子が規則正しく並んでいます(イ)。",
          "液体は、粒子の並び方がくずれていますが、粒子どうしは近くにあります(ウ)。",
          "気体は、粒子どうしの間がとても広くなっています(ア)。"
        ]
      },
      {
        id: "gas-volume-reason",
        text: "液体が気体になると、体積が非常に大きくなります。その理由として、正しいものはどれですか。",
        choices: [
          "粒子が自由に飛び回るようになり、粒子どうしの間が広がるから",
          "粒子の数が、ふえるから",
          "粒子の1つ1つが、大きくふくらむから",
          "粒子が、別の種類の粒子に変わるから"
        ],
        answer: 0,
        explain: [
          "気体になると、粒子は自由に飛び回り、粒子どうしの間がとても広くなります。そのため、体積が大きくなります。",
          "状態変化では、粒子の数も、大きさも、種類も変わりません。だから質量は変わりません。"
        ]
      },
      {
        id: "melting-point-def",
        text: "「融点」とは、どのような温度ですか。",
        choices: [
          "固体がとけて、液体になるときの温度",
          "液体が沸騰して、気体になるときの温度",
          "物質が燃えはじめるときの温度",
          "物質が水にとけはじめるときの温度"
        ],
        answer: 0,
        explain: [
          "固体がとけて液体になるときの温度を、融点といいます。",
          "液体が沸騰して気体になるときの温度は、沸点です。"
        ]
      },
      {
        id: "boiling-point-amount",
        text: "水 " + cm3(100) + " を加熱すると、" + temp(100) + " で沸騰しました。水の量を " + cm3(200) + " にして、同じように加熱すると、沸騰する温度はどうなりますか。",
        choices: [
          temp(100) + " のままで、変わらない",
          temp(200) + " になる",
          temp(50) + " になる",
          "決まった温度では沸騰しなくなる"
        ],
        answer: 0,
        explain: [
          "沸点は、物質の種類によって決まっていて、物質の量には関係しません。",
          "水の量をふやすと、沸騰するまでの時間は長くなりますが、沸騰する温度は " + temp(100) + " のままです。"
        ]
      },
      {
        id: "heating-flat",
        text: "図は、氷を加熱したときの、加熱時間と温度の関係を表しています。温度が変わらない イ の間、物質はどのような状態ですか。",
        figure: figHeatingWater("keys"),
        choices: [
          "氷がとけている途中で、固体と液体が混ざっている",
          "すべて固体(氷)のままである",
          "すべて液体(水)になっている",
          "水が沸騰していて、液体と気体が混ざっている"
        ],
        answer: 0,
        explain: [
          "イ は、温度が " + temp(0) + "(水の融点)で一定になっている部分です。",
          "加えた熱が、氷をとかすことに使われているので、氷がすべてとけるまで温度は上がりません。",
          "水が沸騰しているのは、" + temp(100) + " で一定になっている エ の部分です。"
        ]
      },
      {
        id: "state-table",
        text: "表は、物質 A〜D の融点と沸点です。" + temp(20) + " のとき、液体である物質はどれですか。",
        material: JHS.table({
          head: ["物質", "融点", "沸点"],
          rows: [
            ["A", temp(-218), temp(-183)],
            ["B", temp(-39), temp(357)],
            ["C", temp(63), temp(360)],
            ["D", temp(801), temp(1413)]
          ]
        }),
        choices: ["B", "A", "C", "D"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "液体であるのは、温度が、融点より高く、沸点より低いときです。",
          "B は、" + temp(20) + " が融点(" + temp(-39) + ")と沸点(" + temp(357) + ")の間にあるので、液体です。",
          "A は沸点より高いので気体、C と D は融点より低いので固体です。"
        ]
      },
      {
        id: "pure-example",
        text: "次のうち、純粋な物質はどれですか。",
        choices: ["酸素", "空気", "食塩水", "石油"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "酸素は、1種類の物質でできている純粋な物質です。",
          "空気(窒素や酸素など)、食塩水(食塩と水)、石油は、いくつかの物質が混ざり合った混合物です。"
        ]
      },
      {
        id: "mixture-boiling",
        text: "水とエタノールの混合物を加熱したときの、温度の変化として、正しいものはどれですか。",
        choices: [
          "沸騰がはじまってからも、温度は少しずつ上がり続ける",
          "沸騰している間、温度は " + temp(78) + " のまま変わらない",
          "沸騰している間、温度は " + temp(100) + " のまま変わらない",
          "沸騰がはじまると、温度は下がっていく"
        ],
        answer: 0,
        explain: [
          "混合物は、沸点が決まった温度になりません。沸騰がはじまってからも、温度は少しずつ上がり続けます。",
          "沸騰している間の温度が一定になるのは、水だけ、エタノールだけのような、純粋な物質のときです。"
        ]
      },
      {
        id: "distillation-def",
        text: "「蒸留」の説明として、正しいものはどれですか。",
        choices: [
          "液体を沸騰させ、出てきた気体を冷やして、再び液体にして集めること",
          "固体の物質を水にとかし、再び結晶としてとり出すこと",
          "液体にとけていない固体を、ろ紙でこしてとり出すこと",
          "液体を冷やして、固体にすること"
        ],
        answer: 0,
        explain: [
          "蒸留は、液体を沸騰させ、出てきた気体を冷やして、再び液体にして集める方法です。",
          "物質によって沸点がちがうことを利用して、混合物を分けることができます。"
        ]
      },
      {
        id: "distillation-first",
        text: "水とエタノールの混合物を蒸留しました。はじめに集まった液体について、正しいものはどれですか。",
        choices: [
          "エタノールを多くふくむ。エタノールのほうが、水より沸点が低いから",
          "エタノールを多くふくむ。エタノールのほうが、水より沸点が高いから",
          "水を多くふくむ。水のほうが、エタノールより沸点が低いから",
          "水を多くふくむ。水のほうが、エタノールより沸点が高いから"
        ],
        answer: 0,
        explain: [
          "エタノールの沸点(" + temp(78) + ")は、水の沸点(" + temp(100) + ")より低いので、先に気体になって出てきます。",
          "はじめに集まった液体は、エタノールを多くふくみ、においがあり、火をつけると燃えます。"
        ]
      },
      {
        id: "distill-thermometer",
        text: "図は、蒸留の装置です。A の温度計の球部を、フラスコの枝の高さにするのは、なぜですか。",
        figure: figDistill({ keys: true, mark: "A" }),
        choices: [
          "枝のほうへ出ていく気体の温度をはかるため",
          "フラスコの中の液体の温度をはかるため",
          "液体が急に沸騰するのを防ぐため",
          "フラスコの中の空気をぬくため"
        ],
        answer: 0,
        explain: [
          "蒸留では、枝を通って出ていく気体(蒸気)の温度をはかります。そのため、球部を枝の高さにします。",
          "液体が急に沸騰するのを防ぐのは、沸騰石(D)の役目です。"
        ]
      },
      {
        id: "boiling-stone",
        text: "液体を加熱するときに、沸騰石を入れるのは、なぜですか。",
        choices: [
          "液体が、急に沸騰するのを防ぐため",
          "液体の沸点を、低くするため",
          "液体が、早く沸騰するようにするため",
          "液体の中の、とけ残りをとりのぞくため"
        ],
        answer: 0,
        explain: [
          "液体を加熱すると、急に沸騰して、液がふき出すことがあります。",
          "沸騰石を入れておくと、おだやかに沸騰するようになります。沸点は変わりません。"
        ]
      }
    ],
    generators: [
      {
        id: "heating-graph",
        label: "加熱したときの温度変化のグラフを読む",
        make: function () {
          var mp = JHS.pick([0, 20, 40]);
          var bp = JHS.pick([60, 80, 100, 120].filter(function (b) { return b - mp >= 40; }));
          var t1 = JHS.pick([2, 4]), t2 = t1 + JHS.pick([4, 6]), t3 = t2 + JHS.pick([4, 6]), end = 20;
          var start = mp - 20;
          var fig = figHeating({ start: start, mp: mp, bp: bp, t: [t1, t2, t3], end: end, yMin: start, yMax: bp + 20, guides: true });
          var lead = "図は、固体の物質Xを、一定の強さで加熱したときの、加熱時間と温度の関係を表しています。";
          var meta = { start: start, meltingPoint: mp, boilingPoint: bp, times: [t1, t2, t3] };
          var kind = JHS.pick(["mp", "bp", "time", "time", "temp"]);
          var mid = (mp + bp) / 2, c;
          meta.kind = kind;
          if (kind === "mp" || kind === "bp") {
            var isMp = kind === "mp", ans = isMp ? mp : bp;
            c = JHS.choices4(temp(ans), isMp ? [temp(bp), temp(mid), temp(start), temp(bp + 20)] : [temp(mp), temp(mid), temp(bp + 20), temp(start)]);
            if (!c) return null;
            meta.answer = ans;
            return {
              text: lead + "物質Xの" + (isMp ? "融点" : "沸点") + "は何℃ですか。",
              figure: fig,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "純粋な物質は、状態が変わっている間、加熱を続けても温度が変わりません。グラフの平らな部分が、それにあたります。",
                "1つ目の平らな部分(" + temp(mp) + ")が融点、2つ目の平らな部分(" + temp(bp) + ")が沸点です。"
              ],
              meta: meta
            };
          }
          if (kind === "time") {
            var bounds = [0, t1, t2, t3, end], seg = JHS.randInt(0, 3);
            var tq = JHS.randInt(bounds[seg] + 1, bounds[seg + 1] - 1);
            var states = ["すべて固体である", "固体と液体が混ざっている", "すべて液体である", "液体と気体が混ざっている"];
            var why = [
              tq + "分のときは、温度がまだ融点(" + temp(mp) + ")に届いていません。とけはじめる前なので、すべて固体です。",
              tq + "分のときは、温度が融点(" + temp(mp) + ")で一定になっています。固体がとけている途中で、固体と液体が混ざっています。",
              tq + "分のときは、温度が融点(" + temp(mp) + ")と沸点(" + temp(bp) + ")の間で、上がり続けています。すべてとけ終わっていて、液体です。",
              tq + "分のときは、温度が沸点(" + temp(bp) + ")で一定になっています。沸騰している途中で、液体と気体が混ざっています。"
            ];
            meta.time = tq; meta.answer = states[seg];
            return {
              text: lead + "加熱をはじめてから " + q(tq, "分") + "のとき、物質Xはどのような状態ですか。",
              figure: fig,
              choices: states, answer: seg,
              explain: [
                why[seg],
                "温度が変わらない平らな部分では、状態が変わっている途中で、2つの状態が混ざっています。"
              ],
              meta: meta
            };
          }
          var solid = Math.random() < 0.35;
          var T = solid ? mp - 10 : JHS.pick([mp + 10, mid, bp - 10]);
          meta.temperature = T; meta.answer = solid ? "固体" : "液体";
          return {
            text: lead + "物質Xは、" + temp(T) + " のとき、どの状態ですか。",
            figure: fig,
            choices: ["固体", "液体", "気体", "固体と液体が混ざった状態"], answer: solid ? 0 : 1, choiceLayout: "grid",
            explain: [
              "グラフの平らな部分から、物質Xの融点は " + temp(mp) + "、沸点は " + temp(bp) + " とわかります。",
              solid
                ? temp(T) + " は融点より低いので、固体です。"
                : temp(T) + " は、融点より高く、沸点より低いので、液体です。"
            ],
            meta: meta
          };
        }
      }
    ]
  });
})();

// =====================================================================
// 物理(g1-light、g1-sound、g1-force)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var rule = JHS.rule, q = JHS.q;
  function deg(n) { return q(n, "°"); }
  function cm(n) { return q(n, "cm"); }
  function m(n) { return q(n, "m"); }
  function N(n) { return q(n, "N"); }
  function g(n) { return q(n, "g"); }
  function sec(n) { return q(n, "秒"); }
  function mps(n) { return q(n, "m/s"); }
  var KANA = ["ア", "イ", "ウ", "エ"];

  // ---------- 図の道具 ----------
  var RAD = Math.PI / 180;
  function P(v) { return String(Math.round(v * 10) / 10); }
  function seg(cls, x1, y1, x2, y2) {
    return '<line class="' + cls + '" x1="' + P(x1) + '" y1="' + P(y1) + '" x2="' + P(x2) + '" y2="' + P(y2) + '"/>';
  }
  // 光線。線の途中(t の位置)に、進む向きの矢じりをつける
  function ray(x1, y1, x2, y2, t) {
    t = t === undefined ? 0.55 : t;
    var mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
    return JHS.arrow(x1, y1, mx, my, "fig-line") + seg("fig-line", mx, my, x2, y2);
  }
  // 力の矢印。矢じりの先が、ちょうど (x2, y2) にくるようにする(矢じりは線の端から 1.5 だけ先に出る)
  function forceArrow(x1, y1, x2, y2) {
    var len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) || 1;
    return JHS.arrow(x1, y1, x2 - (x2 - x1) / len * 1.5, y2 - (y2 - y1) / len * 1.5, "fig-force") +
      '<circle class="fig-point" cx="' + P(x1) + '" cy="' + P(y1) + '" r="3.5"/>';
  }
  // 角は「真上を0°、右回りを正」ではかる。down は「真下を0°、右を正」
  function up(cx, cy, rad, a) { return [cx + rad * Math.sin(a * RAD), cy - rad * Math.cos(a * RAD)]; }
  function down(cx, cy, rad, a) { return [cx + rad * Math.sin(a * RAD), cy + rad * Math.cos(a * RAD)]; }
  // 角を示す弧。side は up か down。a1 < a2 で渡す
  function arc(side, cx, cy, rad, a1, a2) {
    var p1 = side(cx, cy, rad, a1), p2 = side(cx, cy, rad, a2);
    return '<path class="fig-axis" d="M' + P(p1[0]) + " " + P(p1[1]) + "A" + rad + " " + rad + " 0 0 " + (side === up ? 1 : 0) + " " + P(p2[0]) + " " + P(p2[1]) + '"/>';
  }
  // 文字のおよその幅の半分(角の中に文字をおさめる計算に使う)
  function halfWidth(str) {
    var w = 0;
    for (var i = 0; i < str.length; i++) w += str.charCodeAt(i) < 128 ? 7.5 : (str.charAt(i) === "°" ? 6 : 13);
    return w / 2 + 5;
  }
  // 角の名前や大きさ。2本の線の間に入るところまで、頂点から離して書く
  function angleText(side, cx, cy, a1, a2, str, minR) {
    var half = Math.abs(a2 - a1) / 2;
    var rad = Math.max(minR || 46, halfWidth(str) / Math.sin(half * RAD));
    var p = side(cx, cy, rad, (a1 + a2) / 2);
    return JHS.txt(p[0], p[1] + 4.5, str, { anchor: "middle", halo: true });
  }

  // P1 光の反射。下に鏡、中央に法線。
  // o.angle 入射角(20〜70)。o.inc / o.ref / o.mir は、入射角・反射角・「鏡の面と入射光の間の角」のところに書く文字(省略すると書かない)。
  // o.names: true で「入射光」「反射光」も書く(要点帳)。o.keys: true で、4つの角に ア〜エ をつける(問題)
  function figReflection(o) {
    o = o || {};
    var th = o.angle || 50, cx = 160, cy = 160, L = 120, s = "";
    var S = up(cx, cy, L, -th), E = up(cx, cy, L, th);
    s += '<rect x="30" y="160" width="260" height="11" fill="url(#sci-pat-hatch)"/>';
    s += seg("fig-shape", 30, cy, 290, cy);
    s += seg("fig-dash", cx, cy, cx, 22);
    if (o.keys || o.mir) s += arc(up, cx, cy, 24, -90, -th);
    if (o.keys || o.inc) s += arc(up, cx, cy, 32, -th, 0);
    if (o.keys || o.ref) s += arc(up, cx, cy, 32, 0, th);
    if (o.keys) s += arc(up, cx, cy, 24, th, 90);
    s += ray(S[0], S[1], cx, cy) + ray(cx, cy, E[0], E[1]);
    if (o.keys) {
      [[-90, -th], [-th, 0], [0, th], [th, 90]].forEach(function (pair, i) {
        var p = up(cx, cy, 62, (pair[0] + pair[1]) / 2);
        s += JHS.key(p[0], p[1], KANA[i]);
      });
    } else {
      if (o.mir) s += angleText(up, cx, cy, -90, -th, o.mir);
      if (o.inc) s += angleText(up, cx, cy, -th, 0, o.inc);
      if (o.ref) s += angleText(up, cx, cy, 0, th, o.ref);
    }
    if (o.names) {
      s += JHS.txt(S[0] - 2, S[1] - 9, "入射光", { anchor: "middle" }) + JHS.txt(E[0] + 2, E[1] - 9, "反射光", { anchor: "middle" });
    }
    s += JHS.txt(cx + 6, 32, "法線", { cls: "fig-small" }) + JHS.txt(286, 190, "鏡", { anchor: "end" });
    return JHS.svg(320, 200, o.names ? "光の反射。入射角と反射角は、法線と光の間の角で、大きさが等しい" : "鏡で光が反射するようすの図", s);
  }

  // P2 光の屈折の1コマ。上が空気、下が水。屈折角は、水の屈折のしかた(約1.33)から計算する。
  // o.dir "in"(空気 → 水) "out"(水 → 空気)、o.i 入射角、o.cx 光が入る点の横の位置、o.L 光線の長さ、o.x0 o.x1 o.top o.bottom コマの範囲。
  // o.cands に角の配列を渡すと、屈折後の光のかわりに候補の線を ア〜エ で描く(法線から右を正)
  function refractPanel(o) {
    var cx = o.cx, cy = 100, L = o.L, into = o.dir !== "out", i = o.i, s = "";
    var ratio = 1.33;
    var rr = Math.asin(into ? Math.sin(i * RAD) / ratio : Math.sin(i * RAD) * ratio) / RAD;
    var first = into ? up : down, second = into ? down : up;
    s += '<rect class="fig-shape fig-fill" x="' + o.x0 + '" y="' + cy + '" width="' + (o.x1 - o.x0) + '" height="' + (o.bottom - cy) + '"/>';
    s += seg("fig-dash", cx, o.top, cx, o.bottom - 6);
    var S = first(cx, cy, L, -i);
    if (o.cands) {
      o.cands.forEach(function (a, k) {
        var e = second(cx, cy, L, a), kp = second(cx, cy, L + 13, a);
        s += seg("fig-line", cx, cy, e[0], e[1]) + JHS.key(kp[0], kp[1], KANA[k]);
      });
      s += ray(S[0], S[1], cx, cy);
    } else {
      var e2 = second(cx, cy, L, rr);
      s += arc(first, cx, cy, 22, -i, 0) + arc(second, cx, cy, 22, 0, rr);
      s += ray(S[0], S[1], cx, cy) + ray(cx, cy, e2[0], e2[1]);
      s += angleText(first, cx, cy, -i, 0, "入射角", 40) + angleText(second, cx, cy, 0, rr, "屈折角", 40);
    }
    s += JHS.txt(o.x0 + 6, cy - 8, "空気", { cls: "fig-small" }) + JHS.txt(o.x0 + 6, cy + 18, "水", { cls: "fig-small" });
    return s;
  }
  // 要点帳用: 空気 → 水 と 水 → 空気 を横に並べる
  function figRefractionPair() {
    var s = refractPanel({ dir: "in", i: 50, cx: 81, L: 80, x0: 8, x1: 154, top: 24, bottom: 192 }) +
      refractPanel({ dir: "out", i: 35, cx: 239, L: 80, x0: 166, x1: 312, top: 24, bottom: 192 });
    s += JHS.txt(10, 16, "空気 → 水", { cls: "fig-small" }) + JHS.txt(168, 16, "水 → 空気", { cls: "fig-small" });
    return JHS.svg(320, 200, "光の屈折。空気から水へ進むときは屈折角のほうが小さく、水から空気へ進むときは屈折角のほうが大きい", s);
  }
  // 問題用: 屈折後の道すじの候補を ア〜エ で出す
  function figRefractionQuiz(dir, i, cands) {
    return JHS.svg(320, 200, "空気と水の境界に光が入る図。境界から先の道すじの候補に記号がついている",
      refractPanel({ dir: dir, i: i, cands: cands, cx: 160, L: 76, x0: 30, x1: 290, top: 8, bottom: 194 }));
  }

  // P3 凸レンズと像。長さは図の中の目盛り(px)で渡す。
  // o.f 焦点距離、o.a レンズから物体までの距離、o.h 物体の高さ。
  // o.rays: false で光線を、o.image: false で像を、o.names: false で「物体」「実像」「虚像」の文字を、o.twoF: false で焦点距離の2倍の位置を描かない。
  // 光線は (1) 光軸に平行 → 焦点を通る (2) レンズの中心を通る → 直進 (3) 焦点を通る → 光軸に平行 の3本。
  // 像の位置は a・f ÷ (a − f)。3本の光線(虚像のときは逆向きにのばした線)は、像の先で交わる
  function figLens(o) {
    o = o || {};
    var f = o.f || 40, a = o.a, h = o.h || 24, cx = 160, ay = 100, s = "";
    var showRays = o.rays !== false, showImage = o.image !== false, names = o.names !== false;
    var none = a === f, real = a > f;
    var b = none ? 0 : a * f / (a - f);     // 実像は正(レンズの右)、虚像は負(物体と同じ側)
    var hi = none ? 0 : h * b / a;          // 実像は正(光軸の下 = 逆向き)、虚像は負(光軸の上 = 同じ向き)
    var xo = cx - a, yT = ay - h, xi = cx + b, yI = ay + hi, right = 304;
    s += seg("fig-axis", 8, ay, 312, ay);
    s += '<ellipse class="fig-shape fig-fill" cx="' + cx + '" cy="' + ay + '" rx="8" ry="74"/>';
    if (showRays) {
      if (none) {
        // 物体が焦点の上: レンズを出た光は平行になり、交わらない
        s += ray(xo, yT, cx, yT) + ray(cx, yT, right, yT + (right - cx) * h / f);
        var xe0 = Math.min(right, cx + (190 - ay) * a / h);
        s += ray(xo, yT, cx, ay) + ray(cx, ay, xe0, ay + (xe0 - cx) * h / a);
      } else if (real) {
        var ext = 10;
        var d1 = Math.sqrt(b * b + (yI - yT) * (yI - yT)), d2 = Math.sqrt(b * b + hi * hi);
        s += ray(xo, yT, cx, yT) + ray(cx, yT, xi + b / d1 * ext, yI + (yI - yT) / d1 * ext);
        s += ray(xo, yT, cx, ay) + ray(cx, ay, xi + b / d2 * ext, yI + hi / d2 * ext);
        s += ray(xo, yT, cx, yI) + ray(cx, yI, xi + ext, yI);
      } else {
        // 虚像: レンズを出た光は広がる。逆向きにのばした破線が、像の先で交わる
        s += seg("fig-dash", cx, yT, xi, yI) + seg("fig-dash", xo, yT, xi, yI) + seg("fig-dash", cx, yI, xi, yI);
        s += ray(xo, yT, cx, yT) + ray(cx, yT, right, yT + (right - cx) * h / f);
        var xe = Math.min(right, cx + (190 - ay) * a / h);
        s += ray(xo, yT, cx, ay) + ray(cx, ay, xe, ay + (xe - cx) * h / a);
        s += ray(xo, yT, cx, yI) + ray(cx, yI, right, yI);
      }
    }
    // 焦点と、焦点距離の2倍の位置
    [-1, 1].forEach(function (sg) {
      s += '<circle class="fig-point" cx="' + P(cx + sg * f) + '" cy="' + ay + '" r="3.5"/>';
      if (sg < 0) s += JHS.txt(cx - f - 4, ay + 16, "焦点", { cls: "fig-small", anchor: "end", halo: true });
      else s += JHS.txt(cx + f + 4, ay - 7, "焦点", { cls: "fig-small", halo: true });
      if (o.twoF !== false) {
        var x2 = cx + sg * 2 * f, yl = sg < 0 ? ay + 24 : ay - 20;
        s += seg("fig-thin", x2, ay, x2, yl) + '<circle class="fig-solid" cx="' + P(x2) + '" cy="' + ay + '" r="2.5"/>';
        s += JHS.txt(x2, sg < 0 ? yl + 13 : yl - 4, "焦点距離の2倍", { cls: "fig-small", anchor: "middle", halo: true });
      }
    });
    s += JHS.arrow(xo, ay, xo, yT + 1.5, "fig-shape");
    if (showImage && !none) {
      if (real) s += JHS.arrow(xi, ay, xi, yI - 1.5, "fig-shape");
      else s += JHS.arrow(xi, ay, xi, yI + 1.5, "fig-line-2");
    }
    if (names) {
      if (!real && showRays) s += JHS.txt(xo - 8, ay + 16, "物体", { halo: true });
      else if (!real) s += JHS.txt(xo - 6, yT - 4, "物体", { anchor: "end", halo: true });
      else s += JHS.txt(xo, yT - 8, "物体", { anchor: "middle", halo: true });
      if (showImage && !none) {
        if (real) s += JHS.txt(xi, yI + 18, "実像", { anchor: "middle", halo: true });
        else s += JHS.txt(xi, yI - 8, "虚像", { anchor: "middle", halo: true });
      }
    }
    s += JHS.txt(cx + 12, 22, "凸レンズ", { cls: "fig-small" });
    var label = !showRays ? "凸レンズと物体の位置を表す図" :
      !names ? "凸レンズを通る光の進み方の図" :
        real ? "凸レンズによる実像。物体の先から出た3本の光が、レンズの反対側で1点に集まる" : "凸レンズによる虚像。レンズを出た光を逆向きにのばすと、1点で交わる";
    return JHS.svg(320, 200, label, s);
  }

  // P4 音の波形。方眼と、まん中の線と、波
  function waveBox(x0, y0, w, h, sq, amp, waves) {
    var s = "", yc = y0 + h / 2, i;
    for (i = 1; i < Math.round(w / sq); i++) s += seg("fig-grid", x0 + i * sq, y0, x0 + i * sq, y0 + h);
    for (i = 1; i < Math.round(h / sq); i++) s += seg("fig-grid", x0, y0 + i * sq, x0 + w, y0 + i * sq);
    s += '<rect class="fig-axis" x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '"/>' + seg("fig-axis", x0, yc, x0 + w, yc);
    var d = "", steps = Math.round(w);
    for (i = 0; i <= steps; i++) {
      d += (i ? "L" : "M") + P(x0 + w * i / steps) + " " + P(yc - amp * Math.sin(2 * Math.PI * waves * i / steps));
    }
    return s + '<path class="fig-line" d="' + d + '"/>';
  }
  // 1つの波形に、振幅と「1回の振動」を書き入れる。o.keys: true で、名前のかわりに ア・イ をつける(問題)
  function figWave(o) {
    o = o || {};
    var x0 = 52, y0 = 44, w = 256, h = 128, amp = 48, waves = 4, yc = y0 + h / 2, per = w / waves;
    var s = waveBox(x0, y0, w, h, 16, amp, waves);
    var xp = x0 + per / 4;                       // 1つ目の山
    s += seg("fig-dash", 40, yc - amp, xp, yc - amp);
    s += JHS.arrow(44, yc - 1.5, 44, yc - amp + 1.5, "fig-shape", { both: true });
    var xa = xp + per, xb = xp + 2 * per;        // 2つ目と3つ目の山
    s += seg("fig-dash", xa, yc - amp, xa, 26) + seg("fig-dash", xb, yc - amp, xb, 26);
    s += JHS.arrow(xa + 1.5, 32, xb - 1.5, 32, "fig-shape", { both: true });
    if (o.keys) {
      s += JHS.key(24, yc - amp / 2, "ア") + JHS.key((xa + xb) / 2, 17, "イ");
    } else {
      s += JHS.txt(37, yc - amp / 2 + 4.5, "振幅", { anchor: "end" }) + JHS.txt((xa + xb) / 2, 23, "1回の振動", { anchor: "middle" });
    }
    s += JHS.txt(308, 191, "時間 →", { cls: "fig-small", anchor: "end" });
    return JHS.svg(320, 200, o.keys ? "オシロスコープで見た音の波形。2か所の長さに記号がついている" : "音の波形。山の高さが振幅、山から次の山までが1回の振動", s);
  }
  // 4つの波形を 2×2 に並べる。panels: [{ amp: 目盛りの数, waves: 波の数, name: "大きい音" }, …]
  // name のあるコマは上に名前を書き、ないコマは左に ア〜エ をつける
  function figWaves(panels) {
    var sq = 15, w = 120, h = 90, s = "", named = !!panels[0].name;
    panels.forEach(function (p, i) {
      var cellX = (i % 2) * 160, y0 = i < 2 ? 21 : 137;
      var x0 = cellX + (named ? 20 : 34);
      s += waveBox(x0, y0, w, h, sq, p.amp * sq, p.waves);
      if (named) s += JHS.txt(x0 + w / 2, y0 - 6, p.name, { anchor: "middle" });
      else s += JHS.key(cellX + 17, y0 + h / 2, KANA[i]);
    });
    return JHS.svg(320, 240, named ? "音の波形の比べ方。振幅が大きいほど大きい音、波の数が多いほど高い音" : "4つの音の波形。方眼の目盛りはどれも同じ", s);
  }

  // P5 ばねののびのグラフ。数値は10倍の整数で渡す。
  // o.u10 横軸の1目盛り(N)、o.e10 ばねが1目盛りの力でのびる長さ(cm)の配列(1〜2本。2本のときは A が B のちょうど2倍)
  function figSpring(o) {
    var u = o.u10 / 10, two = o.e10.length > 1;
    var eA = o.e10[0] / 10, step = (two ? o.e10[1] : o.e10[0]) / 10;
    function pts(e) { return [0, 1, 2, 3, 4, 5].map(function (k) { return [k * u, k * e]; }); }
    var series = [{ pts: pts(eA), cls: "fig-line", marker: "circle", name: two ? "ばねA" : "", nameAt: [3.6 * u, 4.35 * eA] }];
    if (two) series.push({ pts: pts(o.e10[1] / 10), cls: "fig-line-2", marker: "tri", name: "ばねB", nameAt: [4.95 * u, 1.55 * eA] });
    return JHS.graph({
      label: two ? "2本のばねについて、加えた力の大きさと、ばねののびの関係を表したグラフ" : "ばねに加えた力の大きさと、ばねののびの関係を表したグラフ",
      x: { min: 0, max: 5 * u, step: u, label: "力の大きさ[N]" },
      y: { min: 0, max: 5 * eA, step: step, label: "のび[cm]" },
      series: series
    });
  }

  // P6 力の矢印。方眼の1目盛りは16。机の面は上から7目盛り、物体は机の上の 幅4 × 高さ2 目盛りの箱。
  // o.scale10 1目盛りが表す力(Nの10倍)、o.boxCol 箱の左はしの列(省略で7)、o.desk: false で机を描かない。
  // o.forces: [{ at: "center" "bottom" "right" "left"(作用点の場所), dir: "up" "down" "left" "right", n: 目盛りの数, name: "重力", shift: 横へずらす量 }]
  function figForce(o) {
    o = o || {};
    var G = 16, left = 16, top = 12, cols = 18, rows = 11, s = "", i;
    var deskY = top + 7 * G, col = o.boxCol === undefined ? 7 : o.boxCol;
    var bx = left + col * G, by = deskY - 2 * G, bw = 4 * G, bh = 2 * G;
    for (i = 0; i <= cols; i++) s += seg("fig-grid", left + i * G, top, left + i * G, top + rows * G);
    for (i = 0; i <= rows; i++) s += seg("fig-grid", left, top + i * G, left + cols * G, top + i * G);
    if (o.desk !== false) {
      s += '<rect x="' + left + '" y="' + deskY + '" width="' + (cols * G) + '" height="10" fill="url(#sci-pat-hatch)"/>';
      s += seg("fig-shape", left, deskY, left + cols * G, deskY);
    }
    s += '<rect class="fig-shape fig-fill-2" x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '"/>';
    var names = "";
    (o.forces || []).forEach(function (fc) {
      var x = bx + bw / 2 + (fc.shift || 0), y = by + bh / 2;
      if (fc.at === "bottom") y = deskY;
      if (fc.at === "right") x = bx + bw;
      if (fc.at === "left") x = bx;
      var dx = fc.dir === "right" ? 1 : fc.dir === "left" ? -1 : 0, dy = fc.dir === "down" ? 1 : fc.dir === "up" ? -1 : 0;
      var x2 = x + dx * fc.n * G, y2 = y + dy * fc.n * G;
      s += forceArrow(x, y, x2, y2);
      if (!fc.name && !fc.key) return;
      var tx, ty, anchor;
      if (dx !== 0) { tx = (x + x2) / 2; ty = y - 9; anchor = "middle"; }
      else if (fc.side === "left") { tx = x - 8; ty = y2 + (dy > 0 ? -2 : 12); anchor = "end"; }
      else { tx = x + 8; ty = y2 + (dy > 0 ? -2 : 12); anchor = "start"; }
      if (fc.key) names += JHS.key(dx !== 0 ? tx : tx + (anchor === "end" ? -8 : 8), dx !== 0 ? ty - 6 : ty - 4, fc.key);
      else names += JHS.txt(tx, ty, fc.name, { anchor: anchor, halo: true });
    });
    s += names;
    if (o.scale10) {
      s += JHS.txt(22, 27, "1目盛りは", { cls: "fig-small", halo: true }) + JHS.txt(81, 27, JHS.num(o.scale10 / 10) + "N", { cls: "fig-small", halo: true });
    }
    if (o.desk !== false) s += JHS.txt(298, deskY + 26, "机", { cls: "fig-small", anchor: "end", halo: true });
    return JHS.svg(320, 200, o.label || "机の上の物体にはたらく力を、矢印で表した図", s);
  }

  // =====================================================================
  // 1-8 光
  // =====================================================================
  var LENS_TABLE = JHS.table({
    caption: "凸レンズで、物体を置く位置と、できる像",
    head: ["物体の位置", "像の種類と向き", "像の大きさ"],
    rows: [
      ["焦点距離の2倍より遠い", "実像(上下左右が逆向き)", "物体より小さい"],
      ["焦点距離の2倍の位置", "実像(上下左右が逆向き)", "物体と同じ"],
      ["焦点距離の2倍の位置と焦点の間", "実像(上下左右が逆向き)", "物体より大きい"],
      ["焦点の上", "像はできない", "—"],
      ["焦点より凸レンズに近い", "虚像(物体と同じ向き)", "物体より大きい"]
    ]
  });
  var LENS_IMAGES = {
    small: "実像(逆向き)で、物体より小さい",
    same: "実像(逆向き)で、物体と同じ大きさ",
    large: "実像(逆向き)で、物体より大きい",
    virtual: "虚像(同じ向き)で、物体より大きい",
    none: "像はできない"
  };

  JHS.register("g1-light", {
    points: [
      "自ら光を出す物体を<b>光源</b>といいます。光源から出た光は、まっすぐに進みます(" + rule("光の直進") + ")。",
      "光が物体の表面ではね返ることを<b>反射</b>といいます。面に垂直な線(法線)と入射光の間の角を<b>入射角</b>、法線と反射光の間の角を<b>反射角</b>といい、" + rule("入射角 = 反射角") + " になります(反射の法則)。表面がでこぼこした物体では、光がいろいろな向きに反射します(<b>乱反射</b>)。",
      "鏡にうつった物体(<b>像</b>)は、" + rule("鏡の面に対して、物体と対称の位置") + "にあるように見えます。",
      "光が、種類のちがう物質の境界で折れ曲がって進むことを<b>屈折</b>といいます。空気 → 水・ガラスでは " + rule("入射角 &gt; 屈折角") + "、水・ガラス → 空気では " + rule("入射角 &lt; 屈折角") + " です。境界の面に垂直に入った光は、そのまま直進します。",
      "光が水・ガラスから空気へ進むとき、入射角を大きくしていくと、光は屈折せずにすべて反射します。これを<b>全反射</b>といい、光ファイバーに利用されています。",
      "<b>凸レンズ</b>の軸(光軸)に平行な光は、凸レンズを通ると<b>焦点</b>に集まります。凸レンズの中心から焦点までの距離が<b>焦点距離</b>です。スクリーンにうつる像を<b>実像</b>、凸レンズを通して見える、スクリーンにうつせない像を<b>虚像</b>といいます。"
    ],
    figures: [
      { html: figReflection({ angle: 50, inc: "入射角", ref: "反射角", names: true }), caption: "光の反射。入射角と反射角は、鏡の面との角ではなく、法線との間の角です。" },
      { html: figRefractionPair(), caption: "光の屈折。空気の側の角が、いつも大きくなります。境界の面では、光の一部は反射もします(図では省いています)。" },
      { html: figLens({ f: 40, a: 60, h: 24 }), caption: "物体が、焦点距離の2倍の位置と焦点の間にあるとき。光軸に平行な光は焦点を通り、中心を通る光は直進し、焦点を通った光は光軸に平行に進みます。3本が集まるところに実像ができます。" }
    ],
    blocks: [
      JHS.formula("入射角", "反射角"),
      LENS_TABLE
    ],
    example: {
      title: "鏡の面と入射光の間の角が " + deg(30) + " になるように、光を鏡に当てました。反射角は何度ですか。",
      steps: [
        "入射角は、鏡の面との角ではなく、<b>法線との間の角</b>です。法線は鏡の面に垂直(" + deg(90) + ")です。",
        JHS.calc("90 ° − 30 °", "60 °") ,
        "反射の法則より、反射角は入射角と等しくなります。"
      ],
      result: deg(60)
    },
    fixed: [
      {
        id: "straight",
        text: "光源から出た光が、空気中や水中をまっすぐに進むことを何といいますか。",
        choices: ["光の直進", "光の反射", "光の屈折", "全反射"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "光がまっすぐに進むことを、光の直進といいます。",
          "反射は物体の表面ではね返ること、屈折は物質の境界で折れ曲がることです。"
        ]
      },
      {
        id: "reflection-law",
        text: "鏡で光が反射するとき、入射角と反射角の関係はどうなりますか。",
        choices: [
          "入射角と反射角は、つねに等しい",
          "反射角は、つねに入射角より大きい",
          "反射角は、つねに入射角より小さい",
          "入射角と反射角の和は、つねに 90° になる"
        ],
        answer: 0,
        explain: [
          "光が反射するとき、入射角と反射角はつねに等しくなります(反射の法則)。",
          "入射角を大きくすると、反射角も同じだけ大きくなります。"
        ]
      },
      {
        id: "incidence-angle-key",
        text: "図は、鏡で光が反射するようすです。入射角は、ア〜エ のどれですか。",
        figure: figReflection({ angle: 50, keys: true }),
        choices: ["イ", "ア", "ウ", "エ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "入射角は、<b>法線と入射光の間の角</b>なので、イ です。",
          "ア は鏡の面と入射光の間の角で、入射角ではありません。ウ は反射角、エ は鏡の面と反射光の間の角です。"
        ]
      },
      {
        id: "mirror-image",
        text: "鏡の前 " + cm(50) + " のところに立って、鏡にうつった自分の像を見ました。像は、自分から何cm離れたところにあるように見えますか。",
        choices: [cm(100), cm(50), cm(25), cm(200)],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "鏡にうつった像は、鏡の面に対して、物体と対称の位置にあるように見えます。",
          "像は鏡の奥 " + cm(50) + " のところにあるので、自分からは",
          JHS.calc("50 cm + 50 cm", "100 cm")
        ],
        meta: { mirrorDistance: 50, answer: 100 }
      },
      {
        id: "diffuse",
        text: "光源ではない物体が、どの方向からでも見えるのはなぜですか。",
        choices: [
          "表面のでこぼこで、光がいろいろな向きに反射するから(乱反射)",
          "物体の中で、光がすべて反射をくり返すから(全反射)",
          "物体が、自ら光を出しているから",
          "物体の表面で、光が屈折して1点に集まるから"
        ],
        answer: 0,
        explain: [
          "物体の表面には細かいでこぼこがあり、当たった光はいろいろな向きに反射します。これを乱反射といいます。",
          "反射した光の一部が目に入るので、どの方向からでも物体が見えます。1つ1つの光は、反射の法則にしたがっています。"
        ]
      },
      {
        id: "refraction-into-water",
        text: "図のように、空気中から水面に光を当てました。水中での光の道すじとして正しいものは、ア〜エ のどれですか。",
        figure: figRefractionQuiz("in", 50, [70, 50, 35, -25]),
        choices: ["ウ", "ア", "イ", "エ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "光が空気から水へ進むとき、屈折角は入射角より小さくなります。光は、法線に近づくように折れ曲がります。",
          "イ は折れ曲がらずに直進しています。ア は法線から遠ざかっています。エ は法線の反対側に出ているので、誤りです。"
        ]
      },
      {
        id: "refraction-out-of-water",
        text: "図のように、水中から水面に光を当てました。空気中での光の道すじとして正しいものは、ア〜エ のどれですか。",
        figure: figRefractionQuiz("out", 35, [-25, 18, 35, 50]),
        choices: ["エ", "ア", "イ", "ウ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "光が水から空気へ進むとき、屈折角は入射角より大きくなります。光は、法線から遠ざかるように折れ曲がります。",
          "ウ は折れ曲がらずに直進しています。イ は法線に近づいています。ア は法線の反対側に出ているので、誤りです。"
        ]
      },
      {
        id: "perpendicular",
        text: "空気中から、ガラスの面に垂直に光を当てました。光はどのように進みますか。",
        choices: [
          "折れ曲がらずに、そのまま直進する",
          "ガラスの面に近づくように、大きく折れ曲がる",
          "ガラスの中には入らず、すべて反射する",
          "ガラスの中で、2つの向きに分かれて進む"
        ],
        answer: 0,
        explain: [
          "境界の面に垂直に入った光は、屈折せずにそのまま直進します(入射角も屈折角も 0° です)。",
          "折れ曲がるのは、境界の面にななめに入ったときです。"
        ]
      },
      {
        id: "total-reflection",
        text: "全反射が起こるのは、次のうちどのときですか。",
        choices: [
          "光が水中から空気中へ進むとき、入射角が大きい場合",
          "光が空気中から水中へ進むとき、入射角が大きい場合",
          "光が水中から空気中へ、水面に垂直に進む場合",
          "光が空気中から、鏡に垂直に当たる場合"
        ],
        answer: 0,
        explain: [
          "全反射は、光が水やガラスから空気へ進むときに、入射角がある大きさをこえると起こります。光は屈折せず、すべて反射します。",
          "空気から水へ進むときには起こりません。光ファイバーは、全反射を利用しています。"
        ]
      },
      {
        id: "focus",
        text: "凸レンズの軸(光軸)に平行な光を凸レンズに当てると、光は1点に集まります。この点を何といいますか。",
        choices: ["焦点", "光源", "実像", "法線"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "光軸に平行な光は、凸レンズで屈折して、焦点に集まります。焦点は、凸レンズの両側に1つずつあります。",
          "凸レンズの中心から焦点までの距離を、焦点距離といいます。"
        ]
      },
      {
        id: "virtual-image-figure",
        text: "図は、物体を凸レンズの焦点より近くに置いたときの、光の進み方です。凸レンズを通して見える像(破線の矢印)について、正しいものはどれですか。",
        figure: figLens({ f: 60, a: 36, h: 20, names: false, twoF: false }),
        choices: [
          "物体より大きく、物体と同じ向きの虚像",
          "物体より大きく、上下左右が逆向きの実像",
          "物体より小さく、物体と同じ向きの虚像",
          "物体と同じ大きさで、上下左右が逆向きの実像"
        ],
        answer: 0,
        explain: [
          "物体が焦点より凸レンズに近いとき、凸レンズを出た光は広がるので、スクリーンに像はうつりません。",
          "凸レンズを通して見ると、光を逆向きにのばした先に、物体より大きく、同じ向きの虚像が見えます。ルーペで見える像が、これにあたります。"
        ]
      },
      {
        id: "real-image-direction",
        text: "凸レンズによってスクリーンにうつった実像の向きは、物体と比べてどうなっていますか。",
        choices: [
          "上下も左右も、逆向きになっている",
          "上下だけが、逆向きになっている",
          "左右だけが、逆向きになっている",
          "上下も左右も、物体と同じ向きである"
        ],
        answer: 0,
        explain: [
          "実像は、物体と上下も左右も逆向きになります。",
          "物体と同じ向きに見えるのは、凸レンズを通して見える虚像です。"
        ]
      },
      {
        id: "half-covered",
        text: "凸レンズでスクリーンに実像をうつしているとき、凸レンズの上半分を黒い紙でおおいました。像はどうなりますか。",
        choices: [
          "像の形は変わらず、全体が暗くなる",
          "像の上半分が、欠けて見えなくなる",
          "像の下半分が、欠けて見えなくなる",
          "像が、すべて消えてしまう"
        ],
        answer: 0,
        explain: [
          "物体の1点から出た光は、凸レンズのどこを通っても、同じ1点に集まります。",
          "下半分を通る光だけでも像の全体ができますが、集まる光の量が減るので、像は暗くなります。"
        ]
      },
      {
        id: "move-closer",
        text: "物体を、焦点距離の2倍より遠いところから、焦点に近づけていきます(焦点より外側)。実像のできる位置と大きさは、どう変わりますか。",
        choices: [
          "凸レンズから遠ざかり、大きくなる",
          "凸レンズから遠ざかり、小さくなる",
          "凸レンズに近づき、大きくなる",
          "凸レンズに近づき、小さくなる"
        ],
        answer: 0,
        explain: [
          "物体を焦点に近づけるほど、実像のできる位置は凸レンズから遠ざかり、実像は大きくなります。",
          "物体が焦点距離の2倍の位置にあるとき、実像は物体と同じ大きさで、それより焦点に近づけると物体より大きくなります。"
        ]
      }
    ],
    generators: [
      {
        id: "reflection-angle",
        label: "入射角・反射角を求める(鏡の面との角から求める形もある)",
        make: function () {
          // 45° は、鏡の面との角と同じ値になって取り違えに気づけないので使わない
          var th = JHS.pick([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]), phi = 90 - th;
          var kind = JHS.pick(["reflect", "incidence-from-mirror", "reflect-from-mirror", "between"]);
          var text, figure, ans, wrongs, explain;
          if (kind === "reflect") {
            text = "図のように、入射角が " + deg(th) + " になるように、鏡に光を当てました。反射角は何度ですか。";
            figure = figReflection({ angle: th, inc: th + "°", ref: "?" });
            ans = th; wrongs = [phi, 2 * th, 180 - th, 90, th + 10];
            explain = [
              "反射の法則より、反射角は入射角と等しくなります。",
              "反射角は " + deg(th) + " です。" + deg(phi) + " は、鏡の面と反射光の間の角です。"
            ];
          } else if (kind === "between") {
            text = "図のように、入射角が " + deg(th) + " になるように、鏡に光を当てました。入射光と反射光の間の角は何度ですか。";
            figure = figReflection({ angle: th, inc: th + "°" });
            ans = 2 * th; wrongs = [th, phi, 180 - 2 * th, 2 * phi, 90, th + 90];
            explain = [
              "反射角は入射角と等しく、" + deg(th) + " です。",
              "入射光と反射光の間の角は、入射角と反射角の和です。",
              JHS.calc(th + " ° + " + th + " °", 2 * th + " °")
            ];
          } else {
            var askRef = kind === "reflect-from-mirror";
            text = "図のように、鏡の面と入射光の間の角が " + deg(phi) + " になるように、鏡に光を当てました。" + (askRef ? "反射角" : "入射角") + "は何度ですか。";
            figure = figReflection(askRef ? { angle: th, mir: phi + "°", ref: "?" } : { angle: th, mir: phi + "°", inc: "?" });
            ans = th; wrongs = [phi, 180 - phi, 2 * phi, 90, th + 10];
            explain = [
              "入射角は、鏡の面との角ではなく、法線と入射光の間の角です。法線は鏡の面に垂直です。",
              JHS.calc("90 ° − " + phi + " °", th + " °"),
              askRef ? "反射角は入射角と等しいので、" + deg(th) + " です。" : deg(phi) + " をそのまま答えないように注意します。"
            ];
          }
          var c = JHS.choices4(deg(ans), wrongs.map(deg));
          if (!c) return null;
          return {
            text: text, figure: figure, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, incidenceAngle: th, mirrorAngle: phi, answer: ans }
          };
        }
      },
      {
        id: "lens-image",
        label: "凸レンズで、物体の位置から像の種類・向き・大きさを答える",
        make: function () {
          var f = JHS.pick([8, 10, 12, 15, 20]);
          var c0 = JHS.pick([
            { ratio: 3, key: "small" }, { ratio: 2.5, key: "small" }, { ratio: 2, key: "same" },
            { ratio: 1.5, key: "large" }, { ratio: 1, key: "none" }, { ratio: 0.5, key: "virtual" }
          ]);
          var a = f * c0.ratio;
          var others = JHS.shuffle(Object.keys(LENS_IMAGES).filter(function (k) { return k !== c0.key; })).map(function (k) { return LENS_IMAGES[k]; });
          var c = JHS.choices4(LENS_IMAGES[c0.key], others);
          if (!c) return null;
          var where = {
            small: "焦点距離の2倍(" + cm(2 * f) + ")より遠いので、物体より小さい実像ができます。",
            same: "ちょうど焦点距離の2倍(" + cm(2 * f) + ")の位置なので、物体と同じ大きさの実像ができます。",
            large: "焦点(" + cm(f) + ")と、焦点距離の2倍(" + cm(2 * f) + ")の位置の間なので、物体より大きい実像ができます。",
            none: "ちょうど焦点の上なので、凸レンズを出た光は平行に進み、像はできません。",
            virtual: "焦点(" + cm(f) + ")より凸レンズに近いので、実像はできず、凸レンズを通して虚像が見えます。"
          };
          var more = {
            small: "実像は、上下左右が物体と逆向きです。",
            same: "実像は、上下左右が物体と逆向きです。",
            large: "実像は、上下左右が物体と逆向きです。",
            none: "実像も虚像もできないのは、物体が焦点の上にあるときだけです。",
            virtual: "虚像は、物体より大きく、物体と同じ向きです。"
          };
          return {
            text: "焦点距離が " + cm(f) + " の凸レンズがあります。凸レンズの中心から " + cm(a) + " のところに物体を置きました。できる像として正しいものはどれですか。",
            figure: figLens({ f: 40, a: 40 * c0.ratio, h: 24, rays: false, image: false, twoF: false }),
            choices: c.choices, answer: c.answer,
            explain: ["物体の位置を、焦点と、焦点距離の2倍の位置と比べます。", where[c0.key], more[c0.key]],
            meta: { focalLength: f, objectDistance: a, answer: c0.key }
          };
        }
      },
      {
        id: "lens-position",
        label: "凸レンズで、像の大きさから物体の位置や焦点距離を答える",
        make: function () {
          var kind = JHS.pick(["large", "small", "virtual", "same", "focal", "screen"]);
          var c, text, explain, ans;
          if (kind === "focal" || kind === "screen") {
            var a = JHS.pick([16, 20, 24, 32, 40, 48, 60]);
            ans = kind === "focal" ? a / 2 : a;
            c = JHS.choices4(cm(ans), (kind === "focal" ? [a, 2 * a, a / 4] : [a / 2, 2 * a, a / 4]).map(cm));
            if (!c) return null;
            text = "凸レンズの中心から " + cm(a) + " のところに物体を置くと、スクリーンに、物体と同じ大きさの実像がうつりました。" +
              (kind === "focal" ? "この凸レンズの焦点距離は何cmですか。" : "このとき、凸レンズの中心からスクリーンまでの距離は何cmですか。");
            explain = kind === "focal" ? [
              "物体と同じ大きさの実像ができるのは、物体が焦点距離の2倍の位置にあるときです。",
              JHS.calc(a + " cm ÷ 2", a / 2 + " cm")
            ] : [
              "物体と同じ大きさの実像ができるのは、物体が焦点距離の2倍の位置にあるときです。",
              "このとき、実像も、凸レンズの反対側の、焦点距離の2倍の位置にできます。スクリーンまでの距離は、物体までの距離と同じ " + cm(a) + " です。"
            ];
            return {
              text: text, choices: c.choices, answer: c.answer, choiceLayout: "grid", explain: explain,
              meta: { kind: kind, objectDistance: a, focalLength: a / 2, answer: ans }
            };
          }
          var f = JHS.pick([8, 10, 12, 16, 20]);
          var pos = { virtual: f / 2, large: f * 3 / 2, same: 2 * f, small: 3 * f };
          var want = {
            large: "スクリーンに、物体より大きい実像をうつしたい",
            small: "スクリーンに、物体より小さい実像をうつしたい",
            same: "スクリーンに、物体と同じ大きさの実像をうつしたい",
            virtual: "凸レンズを通して、物体より大きい虚像を見たい"
          };
          var why = {
            large: "物体より大きい実像ができるのは、物体が、焦点(" + cm(f) + ")と焦点距離の2倍(" + cm(2 * f) + ")の位置の間にあるときです。",
            small: "物体より小さい実像ができるのは、物体が、焦点距離の2倍(" + cm(2 * f) + ")より遠いところにあるときです。",
            same: "物体と同じ大きさの実像ができるのは、物体が、ちょうど焦点距離の2倍(" + cm(2 * f) + ")の位置にあるときです。",
            virtual: "虚像が見えるのは、物体が、焦点(" + cm(f) + ")より凸レンズに近いところにあるときです。"
          };
          ans = pos[kind];
          c = JHS.choices4(cm(ans), ["virtual", "large", "same", "small"].filter(function (k) { return k !== kind; }).map(function (k) { return cm(pos[k]); }));
          if (!c) return null;
          return {
            text: "焦点距離が " + cm(f) + " の凸レンズがあります。" + want[kind] + "とき、凸レンズの中心から物体までの距離として適するものはどれですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [why[kind], "選択肢のうち、これにあてはまるのは " + cm(ans) + " だけです。"],
            meta: { kind: kind, focalLength: f, answer: ans }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 1-9 音
  // =====================================================================
  var STRING_TABLE = JHS.table({
    caption: "弦をはじいたときの音(モノコード)",
    head: ["変えるもの", "高い音", "低い音"],
    rows: [
      ["弦の長さ", "短くする", "長くする"],
      ["弦の太さ", "細くする", "太くする"],
      ["弦の張り", "強くする", "弱くする"]
    ]
  });
  var WAVE_TABLE = JHS.table({
    caption: "音のちがいと、波形のちがい",
    head: ["音", "決めるもの", "波形"],
    rows: [
      ["大きい音", "振幅が大きい", "山が高く、谷が深い"],
      ["高い音", "振動数が多い", "同じ時間の中の波の数が多い"]
    ]
  });

  JHS.register("g1-sound", {
    points: [
      "音を出している物体を<b>音源</b>(発音体)といいます。音源は" + rule("振動") + "しています。",
      "音源の振動は、まわりの空気を振動させ、その振動が<b>波</b>として次々と伝わります。音は、空気などの気体だけでなく、水などの液体や、金属などの固体の中も伝わります。" + rule("真空中では伝わりません") + "。",
      "空気中を伝わる音の速さは、" + rule("約340m/s") + " です。光の速さ(約30万km/s)よりはるかにおそいので、花火や雷は、光が見えてから少しおくれて音が聞こえます。",
      "音源の振動のはばを<b>振幅</b>といいます。" + rule("振幅が大きいほど、音は大きく") + "なります。",
      "音源が1秒間に振動する回数を<b>振動数</b>といい、単位は<b>ヘルツ(Hz)</b>です。" + rule("振動数が多いほど、音は高く") + "なります。",
      "弦をはじくとき、弦を<b>短く</b>する、<b>細く</b>する、<b>強く張る</b>と、振動数が多くなり、高い音が出ます。弦を強くはじくと、振幅が大きくなり、大きい音が出ます。"
    ],
    figures: [
      { html: figWave(), caption: "オシロスコープで見た音の波形。縦は振動のはば、横は時間を表します。" },
      { html: figWaves([
        { amp: 2.5, waves: 2, name: "大きい音" }, { amp: 1, waves: 2, name: "小さい音" },
        { amp: 2, waves: 4, name: "高い音" }, { amp: 2, waves: 2, name: "低い音" }
      ]), caption: "上の2つは、高さが同じで大きさのちがう音。下の2つは、大きさが同じで高さのちがう音です。" }
    ],
    blocks: [
      JHS.formula("音の速さ[m/s]", JHS.frac("音が伝わった距離[m]", "かかった時間[s]")),
      WAVE_TABLE,
      STRING_TABLE
    ],
    example: {
      title: "山に向かって「ヤッホー」とさけぶと、" + sec(4) + "後に山びこが聞こえました。山までの距離は何mですか。音の速さは " + mps(340) + " とします。",
      steps: [
        "音が " + sec(4) + "の間に進んだ距離を求めます。",
        JHS.calc("340 m/s × 4 秒", "1360 m"),
        "これは、山まで行って<b>もどってくる</b>往復の距離です。山までの距離は、その半分です。",
        JHS.calc("1360 m ÷ 2", "680 m")
      ],
      result: m(680)
    },
    fixed: [
      {
        id: "sound-source",
        text: "音を出している物体に共通していることは何ですか。",
        choices: ["振動している", "熱くなっている", "光を出している", "回転している"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "音を出している物体(音源)は、振動しています。",
          "鳴っている音さやたいこにふれて振動を止めると、音も止まります。"
        ]
      },
      {
        id: "vacuum-bell",
        text: "鳴っているブザーを容器に入れ、容器の中の空気をぬいていきました。ブザーの音はどうなりますか。",
        choices: [
          "しだいに小さくなり、聞こえにくくなる",
          "しだいに大きくなる",
          "しだいに高くなる",
          "まったく変わらない"
        ],
        answer: 0,
        explain: [
          "音は、空気の振動として伝わります。空気をぬいていくと、音を伝えるものが少なくなるので、音は聞こえにくくなります。",
          "真空中では、音は伝わりません。"
        ]
      },
      {
        id: "medium",
        text: "次のうち、音が<b>伝わらない</b>ものはどれですか。",
        choices: ["真空", "空気", "水", "鉄"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "音は、振動を伝える物質がないと伝わりません。真空中では伝わりません。",
          "空気(気体)、水(液体)、鉄(固体)の中は、どれも音が伝わります。"
        ]
      },
      {
        id: "sound-wave",
        text: "音が空気中を伝わるしくみとして、正しいものはどれですか。",
        choices: [
          "空気の振動が、次々とまわりに伝わっていく",
          "音源のまわりの空気が、耳まで移動してくる",
          "音源から出た小さな粒が、耳まで飛んでくる",
          "音源から出た光が、耳で音に変わる"
        ],
        answer: 0,
        explain: [
          "音源の振動がまわりの空気を振動させ、その振動が波として次々と伝わります。",
          "空気そのものが、音源から耳まで移動するわけではありません。"
        ]
      },
      {
        id: "light-first",
        text: "遠くの打ち上げ花火は、光が見えてから、少しおくれて音が聞こえます。その理由として正しいものはどれですか。",
        choices: [
          "音の速さが、光の速さよりはるかにおそいから",
          "光の速さが、音の速さよりはるかにおそいから",
          "音が、光よりあとから出るから",
          "音は、遠くまで伝わるうちに速くなるから"
        ],
        answer: 0,
        explain: [
          "光の速さは約30万km/s で、花火の光は出た瞬間に見えると考えてかまいません。",
          "音の速さは約340m/s なので、遠いほど、音が届くまでに時間がかかります。"
        ]
      },
      {
        id: "amplitude-loudness",
        text: "たいこを強くたたくと、弱くたたいたときと比べて、音はどうなりますか。",
        choices: [
          "振幅が大きくなり、音が大きくなる",
          "振幅が大きくなり、音が高くなる",
          "振動数が多くなり、音が大きくなる",
          "振動数が多くなり、音が高くなる"
        ],
        answer: 0,
        explain: [
          "強くたたくと、振動のはば(振幅)が大きくなり、音が大きくなります。",
          "音の高さを決めるのは振動数です。たたく強さを変えても、音の高さは変わりません。"
        ]
      },
      {
        id: "hertz",
        text: "振動数の単位はどれですか。",
        choices: ["Hz(ヘルツ)", "N(ニュートン)", "m/s(メートル毎秒)", "g(グラム)"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "振動数は、1秒間に振動する回数で、単位はヘルツ(Hz)です。",
          "N は力の大きさ、m/s は速さ、g は質量の単位です。"
        ]
      },
      {
        id: "frequency-calc",
        text: "ある音さは、" + sec(5) + "間に2000回振動しました。この音さの振動数は何Hzですか。",
        choices: [q(400, "Hz"), q(2000, "Hz"), q(10000, "Hz"), q(40, "Hz")],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "振動数は、1秒間に振動する回数です。",
          JHS.calc("2000 回 ÷ 5 秒", "400 Hz")
        ],
        meta: { times: 2000, seconds: 5, answer: 400 }
      },
      {
        id: "string-high",
        text: "モノコードの弦をはじいて、より高い音を出したいとき、どうすればよいですか。",
        choices: [
          "弦の振動する部分を短くする",
          "弦の振動する部分を長くする",
          "太い弦にかえる",
          "弦の張りを弱くする"
        ],
        answer: 0,
        explain: [
          "弦を短くする、細くする、強く張ると、振動数が多くなり、高い音が出ます。",
          "弦を長くする、太くする、張りを弱くすると、どれも音は低くなります。"
        ]
      },
      {
        id: "string-thick",
        text: "長さと張りの強さが同じで、太さだけがちがう2本の弦を、同じ強さではじきました。太い弦の音は、細い弦の音と比べてどうなりますか。",
        choices: ["低い", "高い", "同じ高さである", "はじくたびに、高くなったり低くなったりする"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "太い弦は、細い弦より振動数が少なくなるので、低い音が出ます。",
          "ギターでも、太い弦ほど低い音が出ます。"
        ]
      },
      {
        id: "wave-amplitude-key",
        text: "図は、オシロスコープで見た音の波形です。ア の長さが表しているものは何ですか。",
        figure: figWave({ keys: true }),
        choices: ["振幅", "振動数", "音の速さ", "音が伝わる距離"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "ア は、波のまん中から山の頂上までの高さで、<b>振幅</b>を表します。振幅が大きいほど、大きい音です。",
          "イ は、1回の振動にかかる時間を表します。この長さが短いほど、振動数が多く、高い音です。"
        ]
      },
      {
        id: "wave-same-pitch",
        text: "ア〜エ は、4つの音をオシロスコープで調べた波形です。ア と同じ高さで、ア より小さい音はどれですか。",
        figure: figWaves([{ amp: 2.5, waves: 2 }, { amp: 2.5, waves: 4 }, { amp: 1, waves: 4 }, { amp: 1, waves: 2 }]),
        choices: ["エ", "イ", "ウ", "ア"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "音の高さが同じなら、同じ時間の中の波の数が同じです。ア と波の数が同じなのは エ です。",
          "エ は ア より振幅が小さいので、ア より小さい音です。イ は、ア と同じ大きさで、ア より高い音です。"
        ]
      },
      {
        id: "wave-tighter",
        text: "モノコードの弦をはじいたときの波形が ア でした。弦の張りを強くして、同じ強さではじくと、波形はどれになりますか。",
        figure: figWaves([{ amp: 2.5, waves: 2 }, { amp: 1, waves: 2 }, { amp: 2.5, waves: 4 }, { amp: 1, waves: 4 }]),
        choices: ["ウ", "ア", "イ", "エ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "弦の張りを強くすると、振動数が多くなり、音が高くなります。同じ時間の中の波の数がふえます。",
          "はじく強さは同じなので、振幅は変わりません。ア と振幅が同じで、波の数が多い ウ が正解です。"
        ]
      }
    ],
    generators: [
      {
        id: "sound-distance",
        label: "音の速さから、距離や時間を求める(花火・雷)",
        make: function () {
          var t10 = JHS.pick([15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80]);
          var d = 34 * t10;                    // 340 m/s × 時間
          var scene = JHS.pick([
            { see: "打ち上げ花火が開くのが見えて", what: "花火の音", place: "花火が開いたところ" },
            { see: "いなずまが光って", what: "雷の音", place: "いなずまが光ったところ" }
          ]);
          var c;
          if (Math.random() < 0.65) {
            c = JHS.choices4(m(d), [3400 % t10 === 0 ? 3400 / t10 : null, 17 * t10, 68 * t10, 340 + t10 / 10, 340, 340 * t10].map(function (v) { return v === null ? null : m(v); }));
            if (!c) return null;
            return {
              text: scene.see + "から " + sec(t10 / 10) + "後に、" + scene.what + "が聞こえました。" + scene.place + "までの距離は何mですか。音の速さは " + mps(340) + " とします。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "光は一瞬で届くので、音が " + sec(t10 / 10) + "かかって伝わったと考えます。",
                "距離は、速さ × 時間 で求めます。",
                JHS.calc("340 m/s × " + JHS.num(t10 / 10) + " 秒", d + " m")
              ],
              meta: { kind: "distance", speed: 340, seconds: t10 / 10, answer: d }
            };
          }
          c = JHS.choices4(sec(t10 / 10), [t10 / 5, t10 / 20, t10 / 10 + 1, t10, t10 / 10 + 0.5].map(sec));
          if (!c) return null;
          return {
            text: m(d) + " 離れたところで" + (scene.what === "花火の音" ? "打ち上げ花火が開きました" : "いなずまが光りました") + "。光が見えてから" + scene.what + "が聞こえるまでの時間は何秒ですか。音の速さは " + mps(340) + " とします。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "時間は、距離 ÷ 速さ で求めます。",
              JHS.calc(d + " m ÷ 340 m/s", JHS.num(t10 / 10) + " 秒")
            ],
            meta: { kind: "time", speed: 340, distance: d, answer: t10 / 10 }
          };
        }
      },
      {
        id: "sound-speed",
        label: "距離と時間から、音の速さを求める",
        make: function () {
          var v = JHS.pick([330, 340, 350]), t10 = JHS.pick([15, 20, 25, 30, 40, 50]);
          var d = v * t10 / 10;
          var dt = d * t10 / 10;               // 距離 × 時間(誤答用。整数のときだけ使う)
          var c = JHS.choices4(mps(v), [v / 2, dt === Math.floor(dt) ? dt : null, v * 2, d, v * 10, v + 100].map(function (x) { return x === null ? null : mps(x); }));
          if (!c) return null;
          return {
            text: "打ち上げ花火が開いたところから " + m(d) + " 離れた場所で見ていると、花火が開くのが見えてから " + sec(t10 / 10) + "後に、音が聞こえました。このときの音の速さは何m/sですか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "速さは、距離 ÷ 時間 で求めます。",
              JHS.calc(d + " m ÷ " + JHS.num(t10 / 10) + " 秒", v + " m/s"),
              "音は、花火から耳まで片道を伝わっただけなので、2で割りません。"
            ],
            meta: { distance: d, seconds: t10 / 10, answer: v }
          };
        }
      },
      {
        id: "sound-echo",
        label: "反射した音(山びこなど)。往復に注意する",
        make: function () {
          var kind = JHS.pick(["mountain", "mountain", "sea", "wall-time"]);
          var t10, d, c;
          if (kind === "mountain") {
            t10 = JHS.pick([10, 15, 20, 25, 30, 35, 40, 50, 60]);
            d = 17 * t10;                      // 340 × 時間 ÷ 2
            c = JHS.choices4(m(d), [34 * t10, 68 * t10, 340, 170, 17 * t10 + 340].map(m));
            if (!c) return null;
            return {
              text: "山に向かって大きな声を出すと、" + sec(t10 / 10) + "後に、山ではね返った声(山びこ)が聞こえました。山までの距離は何mですか。音の速さは " + mps(340) + " とします。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "音は、山まで行ってもどってくるので、" + sec(t10 / 10) + "の間に<b>往復</b>の距離を進んでいます。",
                JHS.calc("340 m/s × " + JHS.num(t10 / 10) + " 秒", 34 * t10 + " m"),
                JHS.calc(34 * t10 + " m ÷ 2", d + " m")
              ],
              meta: { kind: kind, speed: 340, seconds: t10 / 10, roundTrip: 34 * t10, answer: d }
            };
          }
          if (kind === "sea") {
            t10 = JHS.pick([4, 6, 8, 10, 12, 16, 20, 24, 30, 40]);
            d = 75 * t10;                      // 1500 × 時間 ÷ 2
            c = JHS.choices4(m(d), [150 * t10, 300 * t10, 17 * t10, 1500, 34 * t10].map(m));
            if (!c) return null;
            return {
              text: "船から海底に向けて音を出すと、" + sec(t10 / 10) + "後に、海底ではね返った音がもどってきました。海の深さは何mですか。海水中を伝わる音の速さは " + mps(1500) + " とします。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "音は、海底まで行ってもどってくるので、" + sec(t10 / 10) + "の間に<b>往復</b>の距離を進んでいます。",
                JHS.calc("1500 m/s × " + JHS.num(t10 / 10) + " 秒", 150 * t10 + " m"),
                JHS.calc(150 * t10 + " m ÷ 2", d + " m")
              ],
              meta: { kind: kind, speed: 1500, seconds: t10 / 10, roundTrip: 150 * t10, answer: d }
            };
          }
          t10 = JHS.pick([4, 5, 6, 8, 10]);
          d = 17 * t10;
          c = JHS.choices4(sec(t10 / 10), [t10 / 20, t10 / 5, t10 / 10 + 1, t10 / 10 + 2].map(sec));
          if (!c) return null;
          return {
            text: "校舎の壁から " + m(d) + " 離れたところで手をたたくと、壁ではね返った音が聞こえました。手をたたいてから、はね返った音が聞こえるまでの時間は何秒ですか。音の速さは " + mps(340) + " とします。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "音は、壁まで行ってもどってくるので、進む距離は<b>往復</b>の " + m(2 * d) + " です。",
              JHS.calc(d + " m × 2", 2 * d + " m"),
              JHS.calc(2 * d + " m ÷ 340 m/s", JHS.num(t10 / 10) + " 秒")
            ],
            meta: { kind: kind, speed: 340, distance: d, roundTrip: 2 * d, answer: t10 / 10 }
          };
        }
      },
      {
        id: "sound-waveform",
        label: "波形から、大きい音・高い音を選ぶ",
        make: function () {
          // 振幅は 1目盛りと 2.5目盛り、波の数は 2つと 4つ。4つの組み合わせを、ならべかえて出す
          var panels = JHS.shuffle([
            { amp: 2.5, waves: 2 }, { amp: 2.5, waves: 4 }, { amp: 1, waves: 2 }, { amp: 1, waves: 4 }
          ]);
          function find(big, high) {
            for (var i = 0; i < 4; i++) if ((panels[i].amp > 2) === big && (panels[i].waves > 2) === high) return i;
            return -1;
          }
          function list(test) {
            return panels.map(function (p, i) { return test(p) ? KANA[i] : ""; }).filter(function (x) { return x; }).join(" と ");
          }
          var bigOnes = list(function (p) { return p.amp > 2; }), highOnes = list(function (p) { return p.waves > 2; });
          var kind = JHS.pick(["both", "both", "pitch", "loudness"]);
          var head = "ア〜エ は、4つの音をオシロスコープで調べた波形です(方眼の目盛りは、どれも同じです)。";
          var text, ans, explain;
          var big = Math.random() < 0.5, high = Math.random() < 0.5;
          if (kind === "both") {
            ans = find(big, high);
            text = head + "<b>" + (big ? "大きくて" : "小さくて") + "、" + (high ? "高い" : "低い") + "</b>音はどれですか。";
            explain = [
              "音の大きさは振幅(山の高さ)で、音の高さは振動数(同じ時間の中の波の数)で決まります。",
              "振幅が大きいのは " + bigOnes + "、波の数が多いのは " + highOnes + " です。",
              (big ? "振幅が大きく" : "振幅が小さく") + "、" + (high ? "波の数が多い" : "波の数が少ない") + " " + KANA[ans] + " が正解です。"
            ];
          } else {
            var base = JHS.randInt(0, 3), bBig = panels[base].amp > 2, bHigh = panels[base].waves > 2;
            if (kind === "pitch") {
              ans = find(bBig, !bHigh);
              text = head + KANA[base] + " と同じ大きさで、" + KANA[base] + " より<b>" + (bHigh ? "低い" : "高い") + "</b>音はどれですか。";
              explain = [
                "音の大きさが同じなら、振幅が同じです。" + KANA[base] + " と振幅が同じなのは " + KANA[ans] + " です。",
                KANA[ans] + " は、同じ時間の中の波の数が " + KANA[base] + " より" + (bHigh ? "少ない" : "多い") + "ので、" + KANA[base] + " より" + (bHigh ? "低い" : "高い") + "音です。"
              ];
            } else {
              ans = find(!bBig, bHigh);
              text = head + KANA[base] + " と同じ高さで、" + KANA[base] + " より<b>" + (bBig ? "小さい" : "大きい") + "</b>音はどれですか。";
              explain = [
                "音の高さが同じなら、同じ時間の中の波の数が同じです。" + KANA[base] + " と波の数が同じなのは " + KANA[ans] + " です。",
                KANA[ans] + " は、振幅が " + KANA[base] + " より" + (bBig ? "小さい" : "大きい") + "ので、" + KANA[base] + " より" + (bBig ? "小さい" : "大きい") + "音です。"
              ];
            }
          }
          if (ans < 0) return null;
          return {
            text: text, figure: figWaves(panels), choices: KANA.slice(), answer: ans, choiceLayout: "grid", explain: explain,
            meta: { kind: kind, panels: panels, answer: KANA[ans] }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 1-10 力
  // =====================================================================
  var FORCE_TABLE = JHS.table({
    caption: "いろいろな力",
    head: ["力", "どんな力か"],
    rows: [
      ["重力", "地球が、物体を地球の中心に向かって引く力"],
      ["弾性力", "変形した物体が、もとにもどろうとして生じる力"],
      ["垂直抗力", "面が、面に接している物体を、面に垂直に押し返す力"],
      ["摩擦力", "物体がふれ合う面で、物体の動きをさまたげる向きにはたらく力"],
      ["磁力", "磁石の極どうしや、磁石と鉄の間にはたらく力"],
      ["電気の力", "こすった下じきが髪の毛を引きつけるような、電気を帯びた物体の間にはたらく力"]
    ]
  });
  var WEIGHT_MASS = JHS.table({
    caption: "重さと質量",
    head: ["", "重さ", "質量"],
    rows: [
      ["意味", "物体にはたらく重力の大きさ", "物体そのものの量"],
      ["単位", "N", "g、kg"],
      ["はかる器具", "ばねばかり", "上皿てんびん"],
      ["場所を変えると", "変わる(月面では約6分の1)", "変わらない"]
    ]
  });
  var BALANCE_TABLE = JHS.table({
    caption: "1つの物体にはたらく2力がつり合う条件(3つとも必要)",
    head: ["", "条件"],
    rows: [
      ["1", "2力が、一直線上にある"],
      ["2", "2力の向きが、逆である"],
      ["3", "2力の大きさが、等しい"]
    ]
  });
  var FORCE_ON_DESK = [
    { at: "center", dir: "down", n: 3, name: "重力", side: "left", shift: -5 },
    { at: "bottom", dir: "up", n: 3, name: "垂直抗力", shift: 5 }
  ];

  JHS.register("g1-force", {
    points: [
      "力には、" + rule("物体の形を変える") + "、" + rule("物体の動き(速さや向き)を変える") + "、" + rule("物体を支える") + " の3つのはたらきがあります。",
      "力には、重力、弾性力、垂直抗力、摩擦力、磁力、電気の力などがあります。重力・磁力・電気の力は、物体どうしが<b>離れていても</b>はたらきます。",
      "力の大きさの単位は<b>ニュートン(N)</b>です。" + rule("約100gの物体にはたらく重力の大きさが 1N") + " です。",
      "<b>重さ</b>は物体にはたらく重力の大きさで、場所によって変わります。<b>質量</b>は物体そのものの量で、場所が変わっても変わりません。",
      "ばねののびは、ばねに加えた力の大きさに" + rule("比例") + "します(<b>フックの法則</b>)。",
      "力は、<b>作用点</b>(力のはたらく点)・<b>向き</b>・<b>大きさ</b>の3つを、矢印で表します。矢印の長さは、力の大きさに比例させます。1つの物体に2つの力がはたらいていて物体が動かないとき、2力は<b>つり合っている</b>といいます。"
    ],
    figures: [
      { html: figSpring({ u10: 10, e10: [40, 20] }), caption: "力の大きさとばねののびの関係。グラフは原点を通る直線になります。同じ力で大きくのびるばねAのほうが、のびやすいばねです。" },
      { html: figForce({ scale10: 10, forces: FORCE_ON_DESK, label: "机の上の物体にはたらく重力と垂直抗力。同じ長さの矢印が、逆向きにかかれている" }), caption: "机の上の物体にはたらく重力と垂直抗力。●が作用点です。2力は一直線上にありますが、矢印が重ならないように、少しずらしてかいています。" }
    ],
    blocks: [FORCE_TABLE, WEIGHT_MASS, BALANCE_TABLE],
    example: {
      title: N(0.5) + " の力を加えると " + cm(2) + " のびるばねがあります。このばねに、質量 " + g(150) + " のおもりをつるすと、ばねののびは何cmになりますか。" + g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。",
      steps: [
        "おもりがばねを引く力の大きさを求めます。" + g(100) + " で " + N(1) + " なので、" + g(150) + " では " + N(1.5) + " です。",
        "力の大きさが、" + N(0.5) + " の何倍かを求めます。",
        JHS.calc("1.5 N ÷ 0.5 N", "3"),
        "ばねののびは力の大きさに比例するので、のびも3倍になります。",
        JHS.calc("2 cm × 3", "6 cm")
      ],
      result: cm(6)
    },
    fixed: [
      {
        id: "effect-motion",
        text: "飛んできたボールをバットで打ち返しました。このとき、力はおもにどのはたらきをしていますか。",
        choices: [
          "物体の動き(速さや向き)を変える",
          "物体を支える",
          "物体の質量を変える",
          "物体の温度を変える"
        ],
        answer: 0,
        explain: [
          "ボールの進む向きと速さが変わっているので、「物体の動きを変える」はたらきです。",
          "力のはたらきは、形を変える・動きを変える・支える の3つです。力で質量は変わりません。"
        ]
      },
      {
        id: "effect-not",
        text: "次のうち、力のはたらきに<b>あてはまらない</b>ものはどれですか。",
        choices: [
          "物体の質量を大きくする",
          "物体の形を変える",
          "物体の動きを変える",
          "物体を支える"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "力のはたらきは、物体の形を変える、物体の動きを変える、物体を支える の3つです。",
          "質量は物体そのものの量で、力を加えても変わりません。"
        ]
      },
      {
        id: "elastic-force",
        text: "のばしたゴムや、押し縮めたばねが、もとにもどろうとして生じる力を何といいますか。",
        choices: ["弾性力", "摩擦力", "垂直抗力", "重力"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "変形した物体がもとにもどろうとして生じる力を、弾性力(弾性の力)といいます。",
          "摩擦力は動きをさまたげる力、垂直抗力は面が物体を押し返す力、重力は地球が物体を引く力です。"
        ]
      },
      {
        id: "friction",
        text: "机の上の本を横に押しても、動きませんでした。このとき、本と机がふれ合う面で、本の動きをさまたげる向きにはたらいている力を何といいますか。",
        choices: ["摩擦力", "弾性力", "磁力", "重力"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "物体がふれ合う面で、動きをさまたげる向きにはたらく力を、摩擦力(摩擦の力)といいます。",
          "押す力と摩擦力がつり合っているので、本は動きません。"
        ]
      },
      {
        id: "force-at-distance",
        text: "次のうち、物体どうしが離れていてもはたらく力はどれですか。",
        choices: ["磁力", "摩擦力", "垂直抗力", "弾性力"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "磁力、電気の力、重力は、物体どうしが離れていてもはたらきます。",
          "摩擦力、垂直抗力、弾性力は、物体どうしがふれ合っているときにはたらく力です。"
        ]
      },
      {
        id: "gravity",
        text: "重力の説明として、正しいものはどれですか。",
        choices: [
          "地球が、物体を地球の中心に向かって引く力",
          "机の面が、物体を垂直に押し返す力",
          "空気が、物体を上からおさえつける力",
          "物体が、地球から離れようとする力"
        ],
        answer: 0,
        explain: [
          "重力は、地球が物体を地球の中心に向かって引く力です。地球上のすべての物体にはたらきます。",
          "机の面が物体を押し返す力は、垂直抗力です。"
        ]
      },
      {
        id: "moon",
        text: "質量 " + g(600) + " の物体を月面に持っていき、上皿てんびんと、ばねばかりではかりました。月面の重力の大きさは地球上の約6分の1、" + g(100) + " の物体にはたらく地球上の重力の大きさは " + N(1) + " とします。正しいものはどれですか。",
        choices: [
          "上皿てんびんは 600g とつり合い、ばねばかりは約 1N を示す",
          "上皿てんびんは 600g とつり合い、ばねばかりは約 6N を示す",
          "上皿てんびんは 100g とつり合い、ばねばかりは約 1N を示す",
          "上皿てんびんは 100g とつり合い、ばねばかりは約 6N を示す"
        ],
        answer: 0,
        explain: [
          "質量は、場所が変わっても変わりません。上皿てんびんでは、分銅にはたらく重力も同じ割合で小さくなるので、月面でも 600g の分銅とつり合います。",
          "重さは重力の大きさなので、場所によって変わります。地球上で約 6N の重さは、月面では約 1N になります。"
        ]
      },
      {
        id: "mass-tool",
        text: "物体の質量をはかる器具はどれですか。",
        choices: ["上皿てんびん", "ばねばかり", "メスシリンダー", "オシロスコープ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "質量は、上皿てんびんではかります。",
          "ばねばかりではかるのは、重さ(力の大きさ)です。メスシリンダーは体積、オシロスコープは音の波形を調べる器具です。"
        ]
      },
      {
        id: "hooke-law",
        text: "ばねに加える力の大きさと、ばねののびの関係として、正しいものはどれですか。",
        choices: [
          "ばねののびは、力の大きさに比例する",
          "ばねののびは、力の大きさに反比例する",
          "ばね全体の長さは、力の大きさに比例する",
          "ばねののびは、力の大きさに関係なく一定である"
        ],
        answer: 0,
        explain: [
          "ばねののびは、ばねに加えた力の大きさに比例します。これをフックの法則といいます。",
          "比例するのは「のび」で、ばね全体の長さ(もとの長さ + のび)ではありません。"
        ]
      },
      {
        id: "arrow-origin",
        text: "力を矢印で表すとき、矢印の始まりの点(●)は、何を表しますか。",
        choices: ["作用点", "力の大きさ", "力の向き", "物体の質量"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "矢印の始まりの点は、力のはたらく点(作用点)を表します。",
          "力の大きさは矢印の長さで、力の向きは矢印の向きで表します。"
        ]
      },
      {
        id: "normal-force-key",
        text: "図は、机の上に置いた物体にはたらく2つの力を、矢印で表したものです(矢印が重ならないように、少しずらしてかいています)。A の力を何といいますか。",
        figure: figForce({ forces: [
          { at: "center", dir: "down", n: 3, key: "B", side: "left", shift: -5 },
          { at: "bottom", dir: "up", n: 3, key: "A", shift: 5 }
        ] }),
        choices: ["垂直抗力", "重力", "摩擦力", "弾性力"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "A は、机の面が物体を垂直に押し返す力で、<b>垂直抗力</b>です。作用点は、物体と机がふれ合う面にあります。",
          "B は、物体の中心から下向きにはたらく重力です。A と B はつり合っています。"
        ]
      },
      {
        id: "balance-conditions",
        text: "1つの物体にはたらく2力がつり合う条件として、<b>誤っている</b>ものはどれですか。",
        choices: [
          "2力の向きが、同じである",
          "2力が、一直線上にある",
          "2力の大きさが、等しい",
          "2力の向きが、逆である"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "2力がつり合う条件は、一直線上にある・向きが逆である・大きさが等しい の3つです。",
          "向きが同じ2力は、つり合いません。"
        ]
      },
      {
        id: "friction-balance",
        text: "図のように、机の上の物体を右向きに引きましたが、物体は動きませんでした。方眼の1目盛りは " + N(1) + " を表します。このとき、物体にはたらく摩擦力の向きと大きさはどうなりますか。",
        figure: figForce({ scale10: 10, boxCol: 5, forces: [{ at: "right", dir: "right", n: 4, name: "引く力" }], label: "机の上の物体を、右向きに引く力を矢印で表した図" }),
        choices: ["左向きに 4N", "右向きに 4N", "左向きに 1N", "下向きに 4N"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "矢印の長さは4目盛りなので、引く力は右向きに 4N です。",
          "物体が動かないので、引く力と摩擦力はつり合っています。摩擦力は、引く力と逆向き(左向き)で、大きさは同じ 4N です。"
        ],
        meta: { squares: 4, newtonPerSquare: 1, answer: 4 }
      },
      {
        id: "normal-force-size",
        text: "図は、机の上に置いた物体にはたらく重力を、矢印で表したものです。方眼の1目盛りは " + N(2) + " を表します。物体にはたらく垂直抗力の向きと大きさはどうなりますか。",
        figure: figForce({ scale10: 20, forces: [{ at: "center", dir: "down", n: 3, name: "重力" }], label: "机の上の物体にはたらく重力を、矢印で表した図" }),
        choices: ["上向きに 6N", "下向きに 6N", "上向きに 3N", "上向きに 2N"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "矢印の長さは3目盛りで、1目盛りが 2N なので、重力は下向きに 6N です。",
          "物体は静止しているので、重力と垂直抗力はつり合っています。垂直抗力は、重力と逆向き(上向き)で、大きさは同じ 6N です。"
        ],
        meta: { squares: 3, newtonPerSquare: 2, answer: 6 }
      }
    ],
    generators: [
      {
        id: "hooke",
        label: "フックの法則(のびを求める・力を求める・全体の長さを求める)",
        make: function () {
          // 数値は10倍の整数で持つ。u10 N の力で e10 cm のびるばね
          var u10 = JHS.pick([2, 5, 10, 20]), e10 = JHS.pick([5, 10, 15, 20, 30, 40]);
          var k = JHS.randInt(2, 8), F10 = u10 * k, ext10 = e10 * k;
          var spring = N(u10 / 10) + " の力を加えると " + cm(e10 / 10) + " のびるばね";
          var times = JHS.calc(JHS.num(F10 / 10) + " N ÷ " + JHS.num(u10 / 10) + " N", String(k));
          var kind = JHS.pick(["extension", "extension", "force", "total", "longer"]);
          var c, L0;
          function cm10(v) { return cm(v / 10); }
          function n10(v) { return N(v / 10); }
          if (kind === "extension") {
            var byMass = Math.random() < 0.5;
            c = JHS.choices4(cm10(ext10), [e10 * F10 / 10, e10 * (k + 1), e10 * k * 2, k * 10, e10 + F10, e10 * (k - 1)].map(cm10));
            if (!c) return null;
            return {
              text: spring + "があります。このばねに" + (byMass ? "、質量 " + g(F10 * 10) + " のおもりをつるすと" : " " + n10(F10) + " の力を加えると") + "、ばねののびは何cmになりますか。" +
                (byMass ? g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。" : ""),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: (byMass ? [g(100) + " で " + N(1) + " なので、" + g(F10 * 10) + " のおもりがばねを引く力は " + n10(F10) + " です。"] : []).concat([
                "力の大きさが " + n10(u10) + " の何倍かを求めます。",
                times,
                "ばねののびは力の大きさに比例するので、のびも " + k + "倍になります。",
                JHS.calc(JHS.num(e10 / 10) + " cm × " + k, JHS.num(ext10 / 10) + " cm")
              ]),
              meta: { kind: kind, forcePerStep: u10 / 10, extensionPerStep: e10 / 10, force: F10 / 10, massGram: byMass ? F10 * 10 : null, answer: ext10 / 10 }
            };
          }
          if (kind === "force") {
            c = JHS.choices4(n10(F10), [k * 10, ext10 * u10 / 10, u10 * (k + 1), F10 * 2, ext10, u10 * (k - 1)].map(n10));
            if (!c) return null;
            return {
              text: spring + "があります。このばねののびが " + cm10(ext10) + " になるのは、何Nの力を加えたときですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "のびが " + cm10(e10) + " の何倍かを求めます。",
                JHS.calc(JHS.num(ext10 / 10) + " cm ÷ " + JHS.num(e10 / 10) + " cm", String(k)),
                "ばねののびは力の大きさに比例するので、力も " + k + "倍です。",
                JHS.calc(JHS.num(u10 / 10) + " N × " + k, JHS.num(F10 / 10) + " N")
              ],
              meta: { kind: kind, forcePerStep: u10 / 10, extensionPerStep: e10 / 10, extension: ext10 / 10, answer: F10 / 10 }
            };
          }
          L0 = JHS.randInt(8, 20);
          if (kind === "total") {
            c = JHS.choices4(cm10(L0 * 10 + ext10), [ext10, L0 * 10 * k, L0 * 10 + e10, L0 * 10 + ext10 * 2, L0 * 10 + ext10 + e10].map(cm10));
            if (!c) return null;
            return {
              text: "何もつるさないときの長さが " + cm(L0) + " で、" + spring + "があります。このばねに " + n10(F10) + " の力を加えると、ばね全体の長さは何cmになりますか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "まず、のびを求めます。力は " + n10(u10) + " の " + k + "倍なので、のびも " + k + "倍です。",
                JHS.calc(JHS.num(e10 / 10) + " cm × " + k, JHS.num(ext10 / 10) + " cm"),
                "ばね全体の長さは、もとの長さにのびをたしたものです。" + cm10(ext10) + " は、のびだけの長さです。",
                JHS.calc(L0 + " cm + " + JHS.num(ext10 / 10) + " cm", JHS.num(L0 + ext10 / 10) + " cm")
              ],
              meta: { kind: kind, naturalLength: L0, forcePerStep: u10 / 10, extensionPerStep: e10 / 10, force: F10 / 10, extension: ext10 / 10, answer: L0 + ext10 / 10 }
            };
          }
          // longer: 全体の長さが与えられる。力を k 倍にしても、全体の長さは k 倍にならない
          var k2 = JHS.randInt(2, 4), T10 = L0 * 10 + e10, ans10 = L0 * 10 + e10 * k2;
          c = JHS.choices4(cm10(ans10), [T10 * k2, e10 * k2, T10 + e10 * k2, L0 * 10 + e10 * (k2 + 1), T10 + e10].map(cm10));
          if (!c) return null;
          return {
            text: "何もつるさないときの長さが " + cm(L0) + " のばねがあります。このばねに " + n10(u10) + " の力を加えると、ばね全体の長さは " + cm10(T10) + " になりました。" + n10(u10 * k2) + " の力を加えると、ばね全体の長さは何cmになりますか。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "力の大きさに比例するのは、全体の長さではなく、<b>のび</b>です。" + n10(u10) + " のときののびを求めます。",
              JHS.calc(JHS.num(T10 / 10) + " cm − " + L0 + " cm", JHS.num(e10 / 10) + " cm"),
              "力は " + k2 + "倍なので、のびも " + k2 + "倍の " + cm10(e10 * k2) + " です。これをもとの長さにたします。",
              JHS.calc(L0 + " cm + " + JHS.num(e10 * k2 / 10) + " cm", JHS.num(ans10 / 10) + " cm")
            ],
            meta: { kind: kind, naturalLength: L0, force1: u10 / 10, length1: T10 / 10, force2: u10 * k2 / 10, extension2: e10 * k2 / 10, answer: ans10 / 10 }
          };
        }
      },
      {
        id: "hooke-graph",
        label: "ばねののびのグラフを読む",
        make: function () {
          var u10 = JHS.pick([2, 5, 10]);
          var kind = JHS.pick(["extension", "force", "two"]);
          var c, k, e10;
          function cm10(v) { return cm(v / 10); }
          function n10(v) { return N(v / 10); }
          if (kind === "two") {
            var pair = JHS.pick([[10, 5], [20, 10], [40, 20], [60, 30]]);
            k = JHS.pick([1, 2]);
            var same10 = pair[0] * k;            // そろえるのび
            c = JHS.choices4(n10(2 * k * u10), [k * u10, k * u10 / 2, 5 * u10, 3 * k * u10, 4 * k * u10].map(n10));
            if (!c) return null;
            return {
              text: "図は、ばねAとばねBについて、加えた力の大きさと、ばねののびの関係を表したグラフです。ばねAに " + n10(k * u10) + " の力を加えたときと同じ長さだけ、ばねBをのばすには、ばねBに何Nの力を加えればよいですか。",
              figure: figSpring({ u10: u10, e10: pair }),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "グラフから、ばねAに " + n10(k * u10) + " の力を加えたときののびは " + cm10(same10) + " です。",
                "ばねBののびが " + cm10(same10) + " になるところを読むと、力の大きさは " + n10(2 * k * u10) + " です。",
                "同じ力を加えたときののびは、ばねBがばねAの半分なので、同じだけのばすには2倍の力がいります。"
              ],
              meta: { kind: kind, forceStep: u10 / 10, extensionPerStepA: pair[0] / 10, extensionPerStepB: pair[1] / 10, forceA: k * u10 / 10, extension: same10 / 10, answer: 2 * k * u10 / 10 }
            };
          }
          e10 = JHS.pick([5, 10, 20, 30, 40]);
          k = JHS.randInt(6, 10);                // グラフの右はし(5目盛り)より先を聞く
          var F10 = u10 * k, ext10 = e10 * k;
          var read = "グラフから、このばねは " + n10(u10) + " の力で " + cm10(e10) + " のびることがわかります。";
          if (kind === "extension") {
            c = JHS.choices4(cm10(ext10), [5 * e10, F10, e10 * (k + 1), k * 10, e10 * k * 2, e10 * (k - 1)].map(cm10));
            if (!c) return null;
            return {
              text: "図は、あるばねに加えた力の大きさと、ばねののびの関係を表したグラフです。このばねに " + n10(F10) + " の力を加えると、ばねののびは何cmになりますか。ばねののびは、力の大きさに比例するものとします。",
              figure: figSpring({ u10: u10, e10: [e10] }),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                read,
                n10(F10) + " は " + n10(u10) + " の " + k + "倍なので、のびも " + k + "倍になります。",
                JHS.calc(JHS.num(e10 / 10) + " cm × " + k, JHS.num(ext10 / 10) + " cm")
              ],
              meta: { kind: kind, forceStep: u10 / 10, extensionPerStep: e10 / 10, force: F10 / 10, answer: ext10 / 10 }
            };
          }
          c = JHS.choices4(n10(F10), [5 * u10, ext10, u10 * (k + 1), k * 10, F10 * 2, u10 * (k - 1)].map(n10));
          if (!c) return null;
          return {
            text: "図は、あるばねに加えた力の大きさと、ばねののびの関係を表したグラフです。このばねののびが " + cm10(ext10) + " になるのは、何Nの力を加えたときですか。ばねののびは、力の大きさに比例するものとします。",
            figure: figSpring({ u10: u10, e10: [e10] }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              read,
              cm10(ext10) + " は " + cm10(e10) + " の " + k + "倍なので、力も " + k + "倍になります。",
              JHS.calc(JHS.num(u10 / 10) + " N × " + k, JHS.num(F10 / 10) + " N")
            ],
            meta: { kind: kind, forceStep: u10 / 10, extensionPerStep: e10 / 10, extension: ext10 / 10, answer: F10 / 10 }
          };
        }
      },
      {
        id: "mass-weight",
        label: "質量と重さ(100g の物体にはたらく重力が 1N)",
        make: function () {
          var kind = JHS.pick(["g-to-n", "g-to-n", "n-to-g", "kg-to-n", "moon"]);
          var note = g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。";
          var c, n10, mass;
          if (kind === "g-to-n") {
            mass = JHS.pick([20, 50, 80, 120, 150, 250, 300, 450, 600, 800, 1500, 2400]);
            c = JHS.choices4(N(mass / 100), [mass / 10, mass / 1000, mass, mass * 100].map(N));
            if (!c) return null;
            return {
              text: "質量 " + g(mass) + " の物体にはたらく重力の大きさは何Nですか。" + note,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                g(100) + " で " + N(1) + " なので、質量(g)を100で割ります。",
                JHS.calc(mass + " ÷ 100", JHS.num(mass / 100)),
                "重力の大きさは " + N(mass / 100) + " です。"
              ],
              meta: { kind: kind, massGram: mass, answer: mass / 100 }
            };
          }
          if (kind === "n-to-g") {
            n10 = JHS.pick([2, 5, 8, 12, 15, 25, 30, 45, 60]);
            mass = n10 * 10;
            c = JHS.choices4(g(mass), [n10, n10 * 100, n10 / 10, n10 * 1000].map(g));
            if (!c) return null;
            return {
              text: "ある物体をばねばかりにつるすと、ばねばかりは " + N(n10 / 10) + " を示しました。この物体の質量は何gですか。" + note,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                N(1) + " が " + g(100) + " にあたるので、力の大きさ(N)に100をかけます。",
                JHS.calc(JHS.num(n10 / 10) + " × 100", String(mass)),
                "物体の質量は " + g(mass) + " です。"
              ],
              meta: { kind: kind, newton: n10 / 10, answer: mass }
            };
          }
          if (kind === "kg-to-n") {
            var kg10 = JHS.pick([5, 12, 15, 20, 25, 30, 45, 50]);
            c = JHS.choices4(N(kg10), [kg10 / 10, kg10 * 10, kg10 / 100, kg10 * 100].map(N));
            if (!c) return null;
            return {
              text: "質量 " + q(kg10 / 10, "kg") + " の物体にはたらく重力の大きさは何Nですか。" + note,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "まず、質量を g になおします。" + q(kg10 / 10, "kg") + " は " + g(kg10 * 100) + " です。",
                g(100) + " で " + N(1) + " なので、100で割ります。",
                JHS.calc(kg10 * 100 + " ÷ 100", String(kg10))
              ],
              meta: { kind: kind, massKg: kg10 / 10, massGram: kg10 * 100, answer: kg10 }
            };
          }
          var k = JHS.randInt(1, 6);
          mass = 600 * k;
          c = JHS.choices4(N(k), [6 * k, 36 * k, 3 * k, 12 * k].map(N));
          if (!c) return null;
          return {
            text: "質量 " + g(mass) + " の物体を月面に持っていき、ばねばかりにつるしました。ばねばかりは何Nを示しますか。月面の重力の大きさは地球上の6分の1とし、" + g(100) + " の物体にはたらく地球上の重力の大きさを " + N(1) + " とします。",
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "地球上での重さは、" + g(mass) + " ÷ 100 で " + N(6 * k) + " です。",
              "月面では、重さはその6分の1になります。質量は " + g(mass) + " のままです。",
              JHS.calc(6 * k + " N ÷ 6", k + " N")
            ],
            meta: { kind: kind, massGram: mass, weightOnEarth: 6 * k, answer: k }
          };
        }
      },
      {
        id: "arrow-length",
        label: "矢印の長さから、力の大きさを求める",
        make: function () {
          var s10 = JHS.pick([5, 10, 20, 50, 100]);
          var kind = JHS.pick(["pull", "gravity", "mass", "count"]);
          var k = kind === "pull" || kind === "count" ? JHS.randInt(2, 7) : JHS.randInt(2, 4);
          var F10 = s10 * k, c;
          function n10(v) { return N(v / 10); }
          var scale = "方眼の1目盛りは " + n10(s10) + " を表します。";
          var how = [
            "矢印の長さは " + k + "目盛りです。1目盛りが " + n10(s10) + " なので、目盛りの数をかけます。",
            JHS.calc(JHS.num(s10 / 10) + " N × " + k, JHS.num(F10 / 10) + " N")
          ];
          if (kind === "count") {
            c = JHS.choices4(q(k, "目盛り"), [F10 * s10 / 100, F10 / 10, k * 2, k + 1, k * 10].map(function (v) { return q(v, "目盛り"); }));
            if (!c) return null;
            return {
              text: n10(F10) + " の力を、方眼の1目盛りが " + n10(s10) + " を表すようにして矢印でかきます。矢印の長さは何目盛りにすればよいですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "矢印の長さは、力の大きさに比例させます。力の大きさを、1目盛りが表す大きさで割ります。",
                JHS.calc(JHS.num(F10 / 10) + " N ÷ " + JHS.num(s10 / 10) + " N", String(k))
              ],
              meta: { kind: kind, newtonPerSquare: s10 / 10, force: F10 / 10, answer: k }
            };
          }
          if (kind === "pull") {
            c = JHS.choices4(n10(F10), [k * 10, s10, s10 * (k + 1), s10 * (k - 1), F10 * 10, s10 + k * 10].map(n10));
            if (!c) return null;
            return {
              text: "図は、机の上の物体を右向きに引く力を、矢印で表したものです。" + scale + "物体を引く力の大きさは何Nですか。",
              figure: figForce({ scale10: s10, boxCol: 5, forces: [{ at: "right", dir: "right", n: k, name: "引く力" }], label: "机の上の物体を、右向きに引く力を矢印で表した図" }),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: how.concat([s10 === 10 ? "1目盛りが 1N なので、目盛りの数がそのまま力の大きさ(N)になります。" : "目盛りの数(" + k + ")を、そのまま力の大きさにしないように注意します。"]),
              meta: { kind: kind, newtonPerSquare: s10 / 10, squares: k, answer: F10 / 10 }
            };
          }
          var fig = figForce({ scale10: s10, forces: [{ at: "center", dir: "down", n: k, name: "重力" }], label: "机の上の物体にはたらく重力を、矢印で表した図" });
          if (kind === "gravity") {
            c = JHS.choices4(n10(F10), [k * 10, s10, s10 * (k + 1), s10 * (k - 1), F10 * 10, s10 + k * 10].map(n10));
            if (!c) return null;
            return {
              text: "図は、机の上の物体にはたらく重力を、矢印で表したものです。" + scale + "物体にはたらく重力の大きさは何Nですか。",
              figure: fig, choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: how.concat(["重力の矢印は、物体の中心を作用点として、下向きにかきます。"]),
              meta: { kind: kind, newtonPerSquare: s10 / 10, squares: k, answer: F10 / 10 }
            };
          }
          var mass = F10 * 10;
          c = JHS.choices4(g(mass), [F10 / 10, F10, mass * 10, k * 100, mass / 2].map(g));
          if (!c) return null;
          return {
            text: "図は、机の上の物体にはたらく重力を、矢印で表したものです。" + scale + "この物体の質量は何gですか。" + g(100) + " の物体にはたらく重力の大きさを " + N(1) + " とします。",
            figure: fig, choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: how.concat([
              N(1) + " が " + g(100) + " にあたるので、" + n10(F10) + " の重力がはたらく物体の質量は " + g(mass) + " です。"
            ]),
            meta: { kind: kind, newtonPerSquare: s10 / 10, squares: k, gravity: F10 / 10, answer: mass }
          };
        }
      }
    ]
  });
})();

// =====================================================================
// 地学(g1-volcanoes、g1-earthquakes、g1-strata)
// =====================================================================
(function () {
  "use strict";
  if (typeof JHS === "undefined") return;

  // ---------- この分野の中で使う短い名前 ----------
  var r = JHS.r, rule = JHS.rule, q = JHS.q, txt = JHS.txt;
  function km(n) { return q(n, "km"); }
  function sec(n) { return q(n, "秒"); }
  function kms(n) { return q(n, "km/s"); }
  function n1(v) { return String(Math.round(v * 10) / 10); }
  // 時刻。t は0時からの秒数。「10時15分20秒」の形にする(分や時をまたいでも正しく直る)
  function clock(t) { return Math.floor(t / 3600) + "時" + Math.floor(t % 3600 / 60) + "分" + (t % 60) + "秒"; }
  function tm(t) { return '<span class="qty">' + clock(t) + "</span>"; }

  // ---------- 図 ----------
  // E1 火山の形とマグマのねばりけ(3コマ)。
  // opts.keys: true で、名前と下の矢印をかくし、ア〜ウ の記号を出す(問題用)。opts.mark: "ウ" で、その記号を目立たせる
  function figVolcano(opts) {
    opts = opts || {};
    var base = 58, s = "";
    var list = [
      { key: "ア", name: "ゆるやかな形", cx: 58, d: function (c) { return "M" + (c - 46) + " " + base + "Q" + c + " " + (base - 28) + " " + (c + 46) + " " + base + "Z"; } },
      { key: "イ", name: "円すい形", cx: 160, d: function (c) { return "M" + (c - 44) + " " + base + "Q" + (c - 16) + " " + (base - 14) + " " + (c - 6) + " " + (base - 40) + "H" + (c + 6) + "Q" + (c + 16) + " " + (base - 14) + " " + (c + 44) + " " + base + "Z"; } },
      { key: "ウ", name: "ドーム状", cx: 262, d: function (c) { return "M" + (c - 26) + " " + base + "C" + (c - 26) + " " + (base - 56) + " " + (c + 26) + " " + (base - 56) + " " + (c + 26) + " " + base + "Z"; } }
    ];
    list.forEach(function (v) {
      s += '<path class="fig-shape fig-fill-2" d="' + v.d(v.cx) + '"/>';
      s += '<path class="fig-shape" d="M' + (v.cx - 50) + " " + base + "H" + (v.cx + 50) + '"/>';
      if (opts.keys) s += JHS.key(v.cx, 80, v.key, { on: opts.mark === v.key });
      else s += txt(v.cx, 77, v.name, { anchor: "middle" });
    });
    if (opts.keys) return JHS.svg(320, 100, "3つの火山の形を横から見た図。ア、イ、ウ の記号がついている", s);
    s += JHS.arrow(24, 90, 296, 90, "fig-shape", { both: true });
    [["マグマのねばりけ", "弱い", "強い"], ["溶岩の色", "黒っぽい", "白っぽい"], ["噴火のようす", "おだやか", "激しい"]].forEach(function (row, i) {
      var y = 107 + i * 15;
      s += txt(160, y, row[0], { cls: "fig-small", anchor: "middle" }) + txt(12, y, row[1]) + txt(308, y, row[2], { anchor: "end" });
    });
    return JHS.svg(320, 150, "火山の形とマグマのねばりけ。左から、傾斜のゆるやかな形、円すい形、ドーム状。右のものほどマグマのねばりけが強い", s);
  }

  // E2 火成岩のつくり(左: 斑状組織、右: 等粒状組織)。
  // opts.keys: true で、斑晶と石基を A・B の記号にし、下の名前をかくす。opts.mark: "A" など。
  // opts.panels: true で、部分の名前を出さず、2つの視野に ア・イ の記号をつける
  function figTexture(opts) {
    opts = opts || {};
    var s = "", lx = 70, rx = 250, cy = 84, R = 58;
    function poly(cx, pts, cls) {
      return '<path class="fig-detail ' + cls + '" d="M' + pts.map(function (p) { return (cx + p[0]) + " " + (cy + p[1]); }).join("L") + 'Z"/>';
    }
    // 左: 石基(細かい粒)の中に、大きな斑晶が散らばる
    s += '<circle class="fig-fill-0" cx="' + lx + '" cy="' + cy + '" r="' + R + '"/>';
    s += '<circle fill="url(#sci-pat-sand)" cx="' + lx + '" cy="' + cy + '" r="' + R + '"/>';
    s += poly(lx, [[-34, -22], [-14, -30], [-8, -14], [-28, -6]], "fig-fill-0");
    s += poly(lx, [[8, -38], [30, -30], [26, -14], [6, -20]], "fig-fill-0");
    s += poly(lx, [[-6, 2], [18, -4], [24, 14], [2, 20]], "fig-fill-2");
    s += poly(lx, [[-40, 14], [-22, 10], [-18, 30], [-34, 34]], "fig-fill-0");
    s += poly(lx, [[22, 26], [40, 20], [36, 38], [20, 42]], "fig-fill-2");
    s += '<circle class="fig-shape" cx="' + lx + '" cy="' + cy + '" r="' + R + '"/>';
    // 右: 同じくらいの大きさの鉱物が、すき間なく組み合わさる
    var A = [-19, -23], B = [14, -28], C = [33, -5], D = [19, 23], E = [-9, 28], F = [-33, 5], G = [0, 0];
    var a = [-31, -49], b = [21, -54], c = [57, -9], d = [34, 47], e = [-17, 55.5], f = [-57, 9];
    function P(p) { return (rx + p[0]) + " " + (cy + p[1]); }
    function outer(p1, o1, o2, p2, cls) {
      return '<path class="fig-detail ' + cls + '" d="M' + P(p1) + "L" + P(o1) + "A" + R + " " + R + " 0 0 1 " + P(o2) + "L" + P(p2) + 'Z"/>';
    }
    s += '<circle class="fig-fill-0" cx="' + rx + '" cy="' + cy + '" r="' + R + '"/>';
    s += outer(B, b, c, C, "fig-fill-2") + outer(E, e, f, F, "fig-fill-2") + outer(D, d, e, E, "fig-fill-0") + outer(A, a, b, B, "fig-fill");
    s += outer(C, c, d, D, "fig-fill-0") + outer(F, f, a, A, "fig-fill-0");
    s += poly(rx, [A, B, C, G], "fig-fill-0") + poly(rx, [G, C, D, E], "fig-fill-2") + poly(rx, [A, G, E, F], "fig-fill");
    s += '<circle class="fig-shape" cx="' + rx + '" cy="' + cy + '" r="' + R + '"/>';
    if (opts.panels) {
      s += JHS.key(lx, 166, "ア") + JHS.key(rx, 166, "イ");
      return JHS.svg(320, 186, "2種類の火成岩をルーペで観察した図。ア と イ の記号がついている", s);
    }
    s += JHS.labels([
      { key: "A", name: "斑晶", from: [96, 60], to: [136, 40] },
      { key: "B", name: "石基", from: [108, 86], to: [136, 116] }
    ], opts);
    if (opts.keys || opts.mark) return JHS.svg(320, 156, "2種類の火成岩をルーペで観察した図。左の岩石の部分に記号がついている", s);
    s += txt(lx, 164, "斑状組織", { anchor: "middle" }) + txt(lx, 181, "火山岩", { cls: "fig-small", anchor: "middle" });
    s += txt(rx, 164, "等粒状組織", { anchor: "middle" }) + txt(rx, 181, "深成岩", { cls: "fig-small", anchor: "middle" });
    return JHS.svg(320, 196, "火成岩のつくり。左は斑状組織(斑晶と石基)で火山岩、右は等粒状組織で深成岩", s);
  }

  // E3 地震計の記録。
  // opts.keys: true で、ゆれの名前を A・B の記号にし、上の両矢印をかくす。opts.mark: "A" など。
  // opts.pText / opts.sText: P波・S波の到着を表す破線の下に書く文字(到着時刻など。8文字以内)
  function figSeismogram(opts) {
    opts = opts || {};
    var xP = 92, xS = 188, y0 = 104, s = "", x = xP;
    var pts = [[18, y0], [xP, y0]];
    var small = [5, -6, 4, -7, 6, -5, 7, -4, 5, -6, 6, -5];
    var big = [38, -44, 40, -36, 34, -30, 26, -28, 22, -18, 16, -14, 10, -9, 7, -5, 4, -3];
    small.concat(small).forEach(function (v) { x += 4; pts.push([x, y0 + v]); });
    big.forEach(function (v) { x += 6; pts.push([x, y0 + v]); });
    pts.push([304, y0]);
    s += JHS.arrow(18, 176, 306, 176, "fig-axis");
    s += '<path class="fig-dash" d="M' + xP + " 40V176M" + xS + ' 40V176"/>';
    s += '<polyline class="fig-line" points="' + pts.map(function (p) { return p[0] + "," + p[1]; }).join(" ") + '"/>';
    s += txt(xP, 193, opts.pText || "P波が到着", { cls: "fig-small", anchor: "middle" });
    s += txt(xS, 193, opts.sText || "S波が到着", { cls: "fig-small", anchor: "middle" });
    s += txt(304, 193, "時刻", { cls: "fig-small", anchor: "end" });
    if (opts.keys || opts.mark) {
      s += JHS.labels([
        { key: "A", name: "初期微動", to: [140, 151], side: "top" },
        { key: "B", name: "主要動", to: [262, 171], side: "top" }
      ], opts);
      return JHS.svg(320, 204, "地震計の記録の図。はじめの小さなゆれと、あとの大きなゆれに記号がついている", s);
    }
    s += JHS.arrow(xP + 2, 34, xS - 2, 34, "fig-shape", { both: true });
    s += txt((xP + xS) / 2, 24, "初期微動継続時間", { anchor: "middle" });
    s += txt(140, 144, "初期微動", { anchor: "middle", halo: true }) + txt(262, 166, "主要動", { anchor: "middle", halo: true });
    return JHS.svg(320, 204, "地震計の記録。P波が到着すると初期微動が始まり、S波が到着すると主要動が始まる。その間が初期微動継続時間", s);
  }

  // E4 地震の波の伝わり方(横軸: 地震が発生してからの時間、縦軸: 震源からの距離)。
  // o.vp / o.vs: P波・S波の速さ[km/s]。o.d: 読ませる距離[km]。
  // o.read: true で、距離 d のところに破線を引き、2つの波が届く時間を軸のそばに数字で書く(問題用)。
  // o.span: true で、距離 d のところに初期微動継続時間の両矢印を出す(要点帳用)。
  // o.names: 2本の線の名前(省略で ["P波", "S波"])
  function figWaveGraph(o) {
    var vp = o.vp, vs = o.vs, YM = 240, XM = 80, names = o.names || ["P波", "S波"], guides = [];
    if (o.read && o.d) {
      guides.push({ x: o.d / vp, y: o.d, xText: JHS.num(o.d / vp), yText: String(o.d) });
      guides.push({ x: o.d / vs, y: o.d, xText: JHS.num(o.d / vs) });
    }
    return JHS.graph({
      label: o.label || "地震の波が届くまでの時間と、震源からの距離の関係を表すグラフ。2本の直線がある",
      x: { min: 0, max: XM, step: 10, label: "時間[秒]" },
      y: { min: 0, max: YM, step: 60, label: "震源距離[km]" },
      series: [
        { pts: [[0, 0], [YM / vp, YM]], cls: "fig-line" },
        { pts: [[0, 0], [YM / vs, YM]], cls: "fig-line-2" }
      ],
      guides: guides,
      extra: function (g) {
        var s = "";
        for (var k = 1; k <= 4; k++) {
          var y = g.Y(60 * k), xa = g.X(60 * k / vp), xb = g.X(60 * k / vs);
          s += '<circle class="fig-point" cx="' + n1(xa) + '" cy="' + n1(y) + '" r="3.6"/>';
          s += '<path class="fig-point-2" d="M' + n1(xb) + " " + n1(y - 4.6) + "L" + n1(xb + 4.4) + " " + n1(y + 3.2) + "L" + n1(xb - 4.4) + " " + n1(y + 3.2) + 'Z"/>';
        }
        s += txt(g.X(195 / vp) - 12, g.Y(195), names[0], { cls: "fig-small", anchor: "end", halo: true });
        s += txt(g.X(195 / vs) - 12, g.Y(195), names[1], { cls: "fig-small", anchor: "end", halo: true });
        if (o.span && o.d) {
          var Y = g.Y(o.d), x1 = g.X(o.d / vp), x2 = g.X(o.d / vs);
          s += '<path class="fig-dash" d="M' + g.left + " " + n1(Y) + "H" + n1(x1 - 5) + '"/>';
          s += JHS.arrow(x1 + 6, Y, x2 - 6, Y, "fig-shape", { both: true });
          s += txt(x2 + 16, Y + 4.5, "初期微動継続時間", { halo: true });
        }
        return s;
      }
    });
  }

  // E5 震源と震央(断面図)
  function figFocus() {
    var s = "";
    s += '<rect class="fig-shape fig-fill-2" x="8" y="62" width="304" height="130"/>';
    s += '<path class="fig-dash" d="M92 68V142"/>';
    s += '<path class="fig-line-2" d="M98 146L238 64"/>';
    s += '<path class="fig-line" d="M85 143L99 157M99 143L85 157"/>';
    s += '<circle class="fig-point" cx="92" cy="62" r="4.5"/>';
    s += '<path class="fig-shape fig-fill-0" d="M232 62L240 48L248 62Z"/>';
    s += txt(92, 50, "震央", { anchor: "middle" }) + txt(240, 40, "観測点", { anchor: "middle" });
    s += txt(300, 54, "地表", { cls: "fig-small", anchor: "end" });
    s += txt(80, 172, "震源", { anchor: "end" });
    s += txt(84, 110, "震源の深さ", { cls: "fig-small", anchor: "end" });
    s += txt(180, 130, "震源距離", { cls: "fig-small" });
    return JHS.svg(320, 200, "震源と震央。地下で地震が発生した場所が震源、その真上の地表の点が震央。震源から観測点までの距離が震源距離", s);
  }

  // 地層・堆積物の種類(模様は JHS.defs() の sci-pat-…)
  var ROCKS = {
    gravel: { name: "れき岩", grain: "れき" },
    sand: { name: "砂岩", grain: "砂" },
    mud: { name: "泥岩", grain: "泥" },
    tuff: { name: "凝灰岩" },
    lime: { name: "石灰岩" }
  };
  var ROCK_ORDER = ["gravel", "sand", "mud", "tuff", "lime"];
  // 模様つきの四角(地の色 → 模様 → 輪郭 の順に重ねる)
  function layerBox(x, y, w, h, kind) {
    var at = ' x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '"/>';
    return '<rect class="fig-fill-0"' + at + '<rect fill="url(#sci-pat-' + kind + ')"' + at + '<rect class="fig-shape"' + at;
  }

  // E6 地層の柱状図。
  // o.cols: [{ name: "A地点", layers: [{ t: "mud", h: 1, key: "ア", note: "サンゴの化石" }, …] }]   layers は上から下の順。
  //         t は gravel / sand / mud / tuff / lime、h は厚さの比(省略で1)。key と note は、柱が1本のときだけ使える。
  // o.age: true で「新しい → 古い」の矢印を出す。o.link: true で、2本の柱の凝灰岩の層を破線で結ぶ。o.mark: 目立たせる記号
  function figColumn(o) {
    o = o || {};
    var cols = o.cols || [], two = cols.length > 1;
    var top = 34, H = 168, w = two ? 58 : 76, xs = two ? [14, 96] : [24], s = "", used = [], spans = [];
    cols.forEach(function (c, ci) {
      var x = xs[ci], total = 0, y = top;
      c.layers.forEach(function (l) { total += l.h || 1; });
      spans[ci] = [];
      c.layers.forEach(function (l) {
        var h = (l.h || 1) / total * H;
        s += layerBox(x, y, w, h, l.t);
        if (used.indexOf(l.t) < 0) used.push(l.t);
        spans[ci].push({ t: l.t, y1: y, y2: y + h });
        if (!two && l.key) {
          s += '<line class="fig-thin" x1="' + (x + w) + '" y1="' + n1(y + h / 2) + '" x2="' + (x + w + 10) + '" y2="' + n1(y + h / 2) + '"/>';
          s += JHS.key(x + w + 21, y + h / 2, l.key, { on: o.mark === l.key });
        } else if (!two && l.note) {
          s += txt(x + w + 8, y + h / 2 + 4.5, l.note, { cls: "fig-small" });
        }
        y += h;
      });
      if (c.name) s += txt(x + w / 2, 22, c.name, { anchor: "middle" });
    });
    if (two && o.link) {
      spans[0].forEach(function (p) {
        if (p.t !== "tuff") return;
        spans[1].forEach(function (p2) {
          if (p2.t !== "tuff") return;
          s += '<path class="fig-dash" d="M' + (xs[0] + w) + " " + n1(p.y1) + "L" + xs[1] + " " + n1(p2.y1) + "M" + (xs[0] + w) + " " + n1(p.y2) + "L" + xs[1] + " " + n1(p2.y2) + '"/>';
        });
      });
    }
    if (o.age) {
      var ax = two ? 174 : 150;
      s += JHS.arrow(ax, 40, ax, 198);
      s += txt(ax + 7, 52, "新しい", { cls: "fig-small" }) + txt(ax + 7, 196, "古い", { cls: "fig-small" });
    }
    var lxp = two ? 232 : 208, ly = 48;
    ROCK_ORDER.forEach(function (k) {
      if (used.indexOf(k) < 0) return;
      s += layerBox(lxp, ly, 22, 16, k) + txt(lxp + 28, ly + 12.5, ROCKS[k].name);
      ly += 30;
    });
    return JHS.svg(320, 216, o.label || (two ? "2つの地点の地層の柱状図。層は模様で区別してある" : "ある地点の地層の柱状図。層は模様で区別してある"), s);
  }

  // E7 粒の大きさと堆積する場所(河口から沖への断面)。
  // opts.keys: true で、堆積物の名前を A〜C の記号にし、上の矢印をかくす(問題用)
  function figDeposition(opts) {
    opts = opts || {};
    var s = "";
    function bed(x) { return 64 + (x - 60) * 0.33; }
    function strip(x1, x2, kind) {
      var d = "M" + x1 + " " + n1(bed(x1)) + "L" + x2 + " " + n1(bed(x2)) + "L" + x2 + " " + n1(bed(x2) - 16) + "L" + x1 + " " + n1(bed(x1) - 16) + "Z";
      return '<path class="fig-fill-0" d="' + d + '"/><path fill="url(#sci-pat-' + kind + ')" d="' + d + '"/><path class="fig-shape" d="' + d + '"/>';
    }
    s += '<path class="fig-shape fig-fill" d="M60 64H312V' + n1(bed(312)) + 'Z"/>';
    s += '<path class="fig-shape fig-fill-2" d="M8 42L40 47L60 64L312 ' + n1(bed(312)) + 'V192H8Z"/>';
    s += strip(110, 170, "gravel") + strip(170, 240, "sand") + strip(240, 306, "mud");
    s += JHS.labels([
      { key: "A", name: "れき", from: [140, bed(140) - 8], to: [140, 48], side: "top" },
      { key: "B", name: "砂", from: [205, bed(205) - 8], to: [205, 48], side: "top" },
      { key: "C", name: "泥", from: [273, bed(273) - 8], to: [273, 48], side: "top" }
    ], opts);
    s += txt(38, 34, "河口", { cls: "fig-small", anchor: "middle" });
    s += txt(60, 150, "海底", { cls: "fig-small" });
    s += txt(300, 84, "海", { cls: "fig-small", anchor: "end" });
    if (opts.keys || opts.mark) return JHS.svg(320, 200, "河口から沖に向かう海底の断面図。海底の堆積物に、岸に近い順に A、B、C の記号がついている", s);
    s += txt(92, 20, "粒が大きい") + txt(246, 20, "小さい");
    s += JHS.arrow(166, 15, 238, 15, "fig-shape", { both: true });
    return JHS.svg(320, 200, "粒の大きさと堆積する場所。河口に近い順に、れき、砂、泥が堆積する。沖ほど粒が小さい", s);
  }

  // =====================================================================
  // 1-11 火山と火成岩
  // =====================================================================
  var VOLCANO_TABLE = JHS.table({
    caption: "マグマのねばりけと火山",
    head: ["ねばりけ", "火山の形", "火山の例"],
    rows: [
      ["弱い", "傾斜のゆるやかな形", "マウナロア、キラウエア"],
      ["中間", "円すい形", "桜島、浅間山"],
      ["強い", "ドーム状", "昭和新山、雲仙普賢岳"]
    ]
  });

  var MINERALS = JHS.table({
    caption: "火成岩にふくまれるおもな鉱物",
    head: ["鉱物", "なかま", "色と形"],
    rows: [
      ["石英", "無色鉱物", "無色か白色。不規則に割れる。"],
      ["長石", "無色鉱物", "白色かうすい桃色。柱状で、決まった方向に割れる。"],
      ["黒雲母", "有色鉱物", "黒色。板状・六角形で、決まった方向にうすくはがれる。"],
      ["角閃石", "有色鉱物", "濃い緑色か黒色。長い柱状。"],
      ["輝石", "有色鉱物", "緑色か褐色。短い柱状。"],
      ["カンラン石", "有色鉱物", "黄緑色か褐色。丸みのある小さな粒。"]
    ]
  });

  var IGNEOUS = JHS.table({
    caption: "火成岩の分類(右のものほど有色鉱物が多い)",
    head: ["色", "白っぽい", "中間", "黒っぽい"],
    compact: true,
    rows: [
      ["火山岩", "流紋岩", "安山岩", "玄武岩"],
      ["深成岩", "花こう岩", "せん緑岩", "斑れい岩"],
      ["ねばりけ", "強い", "中間", "弱い"]
    ]
  });

  JHS.register("g1-volcanoes", {
    points: [
      "地下にある岩石が、高温でどろどろにとけたものを<b>マグマ</b>といいます。噴火のときにふき出すものを<b>火山噴出物</b>といい、溶岩、火山灰、火山弾、火山れき、軽石、火山ガスなどがあります。火山ガスの主成分は<b>水蒸気</b>です。",
      "火山の形、噴火のようす、溶岩の色は、" + rule("マグマのねばりけ") + "で決まります。ねばりけが<b>強い</b>と、ドーム状の形になり、激しい噴火をし、溶岩は<b>白っぽく</b>なります。<b>弱い</b>と、傾斜のゆるやかな形になり、おだやかな噴火をし、溶岩は<b>黒っぽく</b>なります。",
      "マグマが冷えてできた結晶を<b>鉱物</b>といいます。白っぽい<b>無色鉱物</b>(" + r("石英", "せきえい") + "・" + r("長石", "ちょうせき") + ")と、黒っぽい<b>有色鉱物</b>(" + r("黒雲母", "くろうんも") + "・" + r("角閃石", "かくせんせき") + "・" + r("輝石", "きせき") + "・カンラン石)があります。",
      "マグマが冷え固まってできた岩石を<b>火成岩</b>といいます。地表や地表近くで" + rule("急に冷えた") + "ものが<b>火山岩</b>、地下深くで" + rule("ゆっくり冷えた") + "ものが<b>深成岩</b>です。",
      "火山岩は、大きな鉱物(<b>" + r("斑晶", "はんしょう") + "</b>)のまわりを、細かい粒(<b>" + r("石基", "せっき") + "</b>)がうめている<b>" + r("斑状", "はんじょう") + "組織</b>です。深成岩は、同じくらいの大きさの大きな鉱物が組み合わさった<b>" + r("等粒状", "とうりゅうじょう") + "組織</b>です。",
      "火山岩は " + rule(r("流紋岩", "りゅうもんがん") + "・" + r("安山岩", "あんざんがん") + "・" + r("玄武岩", "げんぶがん")) + "、深成岩は " + rule("花こう岩・せん" + r("緑", "りょく") + "岩・" + r("斑", "はん") + "れい岩") + " で、どちらもあとに書いたものほど有色鉱物が多く、黒っぽくなります。"
    ],
    figures: [
      { html: figVolcano(), caption: "マグマのねばりけが強いほど、溶岩が流れにくく、盛り上がった形の火山になります。" },
      { html: figTexture(), caption: "火山岩は急に冷えるので、大きな結晶になれなかった細かい部分(石基)が残ります。深成岩はゆっくり冷えるので、どの鉱物も大きく成長します。" }
    ],
    blocks: [VOLCANO_TABLE, IGNEOUS, MINERALS],
    example: {
      title: "ある火成岩をルーペで観察すると、同じくらいの大きさの大きな鉱物が組み合わさっていて、全体が白っぽく見えました。この岩石は、火成岩の6種類のうちのどれですか。",
      steps: [
        "同じくらいの大きさの鉱物が組み合わさったつくりは、<b>等粒状組織</b>です。等粒状組織をもつのは<b>深成岩</b>(花こう岩・せん緑岩・斑れい岩)です。",
        "白っぽいのは、無色鉱物(石英・長石)が多いからです。深成岩のうち、いちばん白っぽいのは<b>花こう岩</b>です。"
      ],
      result: "花こう岩"
    },
    fixed: [
      {
        id: "volcanic-gas",
        text: "火山ガスにもっとも多くふくまれている気体はどれですか。",
        choices: ["水蒸気", "酸素", "水素", "窒素"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "火山ガスの主成分は水蒸気です。",
          "そのほかに、二酸化炭素や二酸化硫黄などがふくまれています。"
        ]
      },
      {
        id: "viscosity-strong",
        text: "マグマのねばりけが強い火山の特徴として、正しいものはどれですか。",
        choices: [
          "ドーム状の形で、激しい噴火をし、溶岩は白っぽい",
          "ドーム状の形で、おだやかな噴火をし、溶岩は黒っぽい",
          "傾斜のゆるやかな形で、激しい噴火をし、溶岩は白っぽい",
          "傾斜のゆるやかな形で、おだやかな噴火をし、溶岩は黒っぽい"
        ],
        answer: 0,
        explain: [
          "ねばりけが強いマグマは流れにくいので、火口の近くに盛り上がって、ドーム状の形になります。",
          "ガスがぬけにくいので噴火は激しく、溶岩や火山灰は白っぽくなります。",
          "傾斜のゆるやかな形・おだやかな噴火・黒っぽい溶岩は、ねばりけが弱いマグマの特徴です。"
        ]
      },
      {
        id: "shape-example-dome",
        text: "図は、3つの火山の形を横から見たものです。ウ のような形の火山は、次のうちどれですか。",
        figure: figVolcano({ keys: true, mark: "ウ" }),
        choices: ["昭和新山", "マウナロア", "キラウエア", "桜島"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "ウ は、盛り上がったドーム状の形です。昭和新山や雲仙普賢岳が、この形の火山です。",
          "マウナロアとキラウエアは ア のような傾斜のゆるやかな形、桜島は イ のような円すい形です。"
        ]
      },
      {
        id: "shape-shield-magma",
        text: "図の ア のような形の火山について、マグマのねばりけと噴火のようすの組み合わせとして、正しいものはどれですか。",
        figure: figVolcano({ keys: true, mark: "ア" }),
        choices: [
          "ねばりけが弱く、おだやかな噴火をする",
          "ねばりけが弱く、激しい噴火をする",
          "ねばりけが強く、おだやかな噴火をする",
          "ねばりけが強く、激しい噴火をする"
        ],
        answer: 0,
        explain: [
          "ア は、傾斜のゆるやかな形です。ねばりけが弱いマグマは流れやすく、うすく広がるので、この形になります。",
          "ねばりけが弱いと、ガスがぬけやすいので、噴火はおだやかです。"
        ]
      },
      {
        id: "colorless-minerals",
        text: "無色鉱物だけの組み合わせは、どれですか。",
        choices: ["石英と長石", "石英と黒雲母", "長石と輝石", "角閃石とカンラン石"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "無色鉱物は、石英と長石の2つです。",
          "黒雲母・角閃石・輝石・カンラン石は、色のついた有色鉱物です。"
        ]
      },
      {
        id: "mineral-biotite",
        text: "次の特徴をもつ鉱物は、どれですか。",
        material: JHS.given([["色", "黒色"], ["形", "板状・六角形"], ["割れ方", "うすくはがれる"]]),
        choices: ["黒雲母", "石英", "長石", "カンラン石"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "黒色で板状、決まった方向にうすくはがれるのは、黒雲母です。",
          "石英と長石は白っぽい無色鉱物です。カンラン石は黄緑色や褐色の、丸みのある粒です。"
        ]
      },
      {
        id: "mineral-quartz",
        text: "無色か白色で、割れるときに決まった方向がなく、不規則に割れる鉱物はどれですか。",
        choices: ["石英", "長石", "黒雲母", "輝石"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "無色か白色で、不規則に割れるのは、石英です。",
          "長石も白っぽい鉱物ですが、決まった方向に割れます。黒雲母と輝石は有色鉱物です。"
        ]
      },
      {
        id: "ash-washing",
        text: "火山灰にふくまれる鉱物を観察するための準備として、正しいものはどれですか。",
        choices: [
          "水を加えて指でおし洗いし、にごった水を捨てることを、水がきれいになるまでくり返す",
          "うすい塩酸を加えて、火山灰をすべてとかす",
          "ガスバーナーで強く加熱して、火山灰をとかす",
          "水を加えてよくかき混ぜ、にごった水のほうを残して、しずんだ粒を捨てる"
        ],
        answer: 0,
        explain: [
          "火山灰を蒸発皿にとり、水を加えて指でおし洗いします。にごった水を捨てることをくり返すと、鉱物の粒が残ります。",
          "残った粒をかわかして、ルーペや双眼実体顕微鏡で観察します。観察するのは、しずんだ粒のほうです。"
        ]
      },
      {
        id: "volcanic-rock-def",
        text: "マグマが、地表や地表近くで急に冷え固まってできた岩石を何といいますか。",
        choices: ["火山岩", "深成岩", "堆積岩", "火山灰"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "マグマが冷え固まった岩石が火成岩で、そのうち、地表や地表近くで急に冷えたものが火山岩です。",
          "深成岩は、地下深くでゆっくり冷え固まった火成岩です。堆積岩は、土砂などが積もって固まった岩石です。"
        ]
      },
      {
        id: "texture-phenocryst",
        text: "図は、2種類の火成岩をルーペで観察したものです。左の岩石の A のような、大きな鉱物の部分を何といいますか。",
        figure: figTexture({ keys: true, mark: "A" }),
        choices: ["斑晶", "石基", "火山れき", "軽石"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "A のような大きな鉱物を<b>斑晶</b>、B のような細かい粒の部分を<b>石基</b>といいます。",
          "斑晶と石基からなるつくりを、斑状組織といいます。火山れきと軽石は、火山噴出物の名前です。"
        ]
      },
      {
        id: "texture-plutonic",
        text: "図は、2種類の火成岩をルーペで観察したものです。深成岩はどちらですか。また、そのつくりを何といいますか。",
        figure: figTexture({ panels: true }),
        choices: ["イ・等粒状組織", "イ・斑状組織", "ア・等粒状組織", "ア・斑状組織"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "イ は、同じくらいの大きさの鉱物が組み合わさった<b>等粒状組織</b>で、深成岩のつくりです。",
          "ア は、大きな鉱物のまわりを細かい粒がうめている斑状組織で、火山岩のつくりです。"
        ]
      },
      {
        id: "why-equigranular",
        text: "深成岩が、大きな鉱物だけでできているのはなぜですか。",
        choices: [
          "マグマが地下深くでゆっくり冷え、鉱物が大きく成長したから",
          "マグマが地表近くで急に冷え、鉱物が大きく成長したから",
          "マグマが地下深くで急に冷え、鉱物が成長できなかったから",
          "流れる水に運ばれる間に、小さな粒が流されたから"
        ],
        answer: 0,
        explain: [
          "深成岩は、マグマが地下深くで長い時間をかけて冷えるので、どの鉱物も大きく成長します。",
          "急に冷えると、鉱物は大きく成長できず、細かい粒の石基ができます(火山岩)。"
        ]
      },
      {
        id: "rock-rhyolite",
        text: "斑状組織をもち、全体が白っぽい火成岩はどれですか。",
        choices: ["流紋岩", "花こう岩", "玄武岩", "斑れい岩"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "斑状組織をもつのは火山岩(流紋岩・安山岩・玄武岩)で、そのうち白っぽいのは流紋岩です。",
          "花こう岩は白っぽい深成岩、玄武岩は黒っぽい火山岩、斑れい岩は黒っぽい深成岩です。"
        ]
      },
      {
        id: "plutonic-set",
        text: "深成岩だけの組み合わせは、どれですか。",
        choices: [
          "花こう岩・せん緑岩・斑れい岩",
          "流紋岩・安山岩・玄武岩",
          "花こう岩・安山岩・玄武岩",
          "流紋岩・せん緑岩・斑れい岩"
        ],
        answer: 0,
        explain: [
          "深成岩は、花こう岩・せん緑岩・斑れい岩です。",
          "流紋岩・安山岩・玄武岩は、火山岩です。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-12 地震
  // =====================================================================
  var WAVES = JHS.table({
    caption: "地震の2つの波",
    head: ["波", "伝わる速さ", "起こすゆれ"],
    rows: [
      ["P波", "速い", "初期微動(はじめの小さなゆれ)"],
      ["S波", "おそい", "主要動(あとからくる大きなゆれ)"]
    ]
  });

  var SHINDO = JHS.table({
    caption: "震度とマグニチュード",
    head: ["", "震度", "マグニチュード"],
    rows: [
      ["表すもの", "ある地点でのゆれの大きさ", "地震そのものの規模"],
      ["値", "0〜7の10階級(5と6は弱と強に分かれる)", "記号は M。1大きいとエネルギーは約32倍、2大きいと1000倍"],
      ["1つの地震では", "観測する地点によってちがう", "1つに決まる"]
    ]
  });

  // 地震の計算に使う、P波とS波の速さの組[km/s]
  var SPEEDS = [[6, 3], [8, 4], [7, 3.5], [6, 4], [5, 3]];
  // P波・S波の届く時間がどちらも整数の秒になる震源距離(5km きざみ)
  function distances(vp, vs, min, max) {
    var out = [];
    for (var d = min; d <= max; d += 5) {
      if ((d * 10) % (vp * 10) === 0 && (d * 10) % (vs * 10) === 0) out.push(d);
    }
    return out;
  }
  // 地震の発生時刻(6時〜22時台。秒は5きざみ)
  function randomTime() { return JHS.randInt(6, 22) * 3600 + JHS.randInt(0, 59) * 60 + JHS.randInt(0, 11) * 5; }

  JHS.register("g1-earthquakes", {
    points: [
      "地下で地震が発生した場所を<b>震源</b>、震源の真上にある地表の点を<b>震央</b>といいます。震源から観測点までの距離を<b>震源距離</b>といいます。",
      "地震が起こると、速い<b>P波</b>とおそい<b>S波</b>が、震源で" + rule("同時に発生") + "します。P波が届くと小さなゆれの<b>初期微動</b>が、S波が届くと大きなゆれの<b>主要動</b>が始まります。",
      "P波が届いてからS波が届くまでの時間を<b>初期微動継続時間</b>といいます。" + rule("震源距離が長いほど、初期微動継続時間は長く") + "なります(ほぼ比例します)。",
      "<b>震度</b>は、ある地点でのゆれの大きさで、0〜7の<b>10階級</b>で表します。<b>マグニチュード</b>(M)は、地震そのものの規模を表します。ふつう、震度は震央に近いほど大きくなります。",
      "地球の表面は、<b>プレート</b>という厚い岩盤でおおわれています。日本付近では、" + rule("海洋プレートが大陸プレートの下に沈みこんで") + "いて、そのひずみで大きな地震が起こります。震源は、太平洋側で浅く、日本海側に向かって深くなります。",
      "地震では、建物の倒壊、土砂くずれ、<b>津波</b>、<b>液状化</b>などの災害が起こります。<b>緊急地震速報</b>は、震源の近くでP波をとらえ、S波による大きなゆれが届く前に知らせるしくみです。"
    ],
    figures: [
      { html: figFocus(), caption: "震源は地下、震央は地表の点です。震源距離は、震源から観測点までのまっすぐな距離です。" },
      { html: figSeismogram(), caption: "地震計の記録。P波が届いてからS波が届くまでの小さなゆれが、初期微動です。" },
      { html: figWaveGraph({ vp: 6, vs: 3, d: 120, span: true, label: "地震の波が届くまでの時間と、震源からの距離の関係。P波は実線、S波は破線。震源から遠いほど、2つの波が届く時間の差が大きい" }), caption: "横軸は、地震が発生してからの時間です。P波(●)とS波(▲)の届く時間の差が初期微動継続時間で、震源から遠いほど長くなります。" }
    ],
    blocks: [
      JHS.formula("波の速さ", JHS.frac("震源からの距離", "届くまでにかかった時間")),
      JHS.formula("初期微動継続時間", "S波が届いた時刻 − P波が届いた時刻"),
      WAVES,
      SHINDO
    ],
    example: {
      title: "P波の速さが" + kms(6) + "、S波の速さが" + kms(3) + "の地震があります。震源から" + km(120) + "の地点の初期微動継続時間は何秒ですか。",
      steps: [
        "P波が届くまでの時間を求めます。" + JHS.calc("120 km ÷ 6 km/s", "20 秒"),
        "S波が届くまでの時間を求めます。" + JHS.calc("120 km ÷ 3 km/s", "40 秒"),
        "その差が、初期微動継続時間です。" + JHS.calc("40 秒 − 20 秒", "20 秒")
      ],
      result: sec(20)
    },
    fixed: [
      {
        id: "epicenter",
        text: "地下で地震が発生した場所の、真上にある地表の点を何といいますか。",
        choices: ["震央", "震源", "震度", "プレート"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "地下で地震が発生した場所が震源、その真上の地表の点が震央です。",
          "震度は、ある地点でのゆれの大きさです。プレートは、地球の表面をおおう岩盤です。"
        ]
      },
      {
        id: "record-tremor",
        text: "図は、ある地点の地震計の記録です。A の小さなゆれを何といいますか。",
        figure: figSeismogram({ keys: true, mark: "A" }),
        choices: ["初期微動", "主要動", "津波", "液状化"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "はじめの小さなゆれ(A)を<b>初期微動</b>、あとからくる大きなゆれ(B)を<b>主要動</b>といいます。",
          "津波と液状化は、地震によって起こる災害です。"
        ]
      },
      {
        id: "record-swave",
        text: "図の B の大きなゆれを起こす波について、正しいものはどれですか。",
        figure: figSeismogram({ keys: true, mark: "B" }),
        choices: [
          "S波で、P波よりおそく伝わる",
          "S波で、P波より速く伝わる",
          "P波で、S波よりおそく伝わる",
          "P波で、S波より速く伝わる"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "B は主要動で、S波が届くと始まります。",
          "S波はP波よりおそいので、あとから届きます。先に届くP波が起こすのは、初期微動(A)です。"
        ]
      },
      {
        id: "waves-start",
        text: "P波とS波が震源で発生する時刻について、正しいものはどれですか。",
        choices: [
          "P波とS波は、同時に発生する",
          "P波が先に発生し、しばらくしてからS波が発生する",
          "S波が先に発生し、しばらくしてからP波が発生する",
          "P波は震源で、S波は震央で発生する"
        ],
        answer: 0,
        explain: [
          "P波とS波は、震源で同時に発生します。",
          "P波のほうが伝わる速さが速いので、観測点には先にP波が届きます。そのため、初期微動のあとに主要動が始まります。"
        ]
      },
      {
        id: "graph-which-p",
        text: "図は、ある地震の2つの波 A・B について、地震が発生してから届くまでの時間と、震源からの距離の関係を表しています。P波はどちらですか。また、そう判断できる理由は何ですか。",
        figure: figWaveGraph({ vp: 6, vs: 3, names: ["A", "B"] }),
        choices: [
          "A。同じ距離を、短い時間で伝わっているから",
          "A。同じ距離を、長い時間をかけて伝わっているから",
          "B。同じ距離を、短い時間で伝わっているから",
          "B。同じ距離を、長い時間をかけて伝わっているから"
        ],
        answer: 0,
        explain: [
          "同じ距離(たとえば " + km(120) + ")で比べると、A は20秒、B は40秒で届いています。",
          "短い時間で届く A のほうが速いので、A がP波、B がS波です。"
        ]
      },
      {
        id: "shindo-def",
        text: "ある地点での、地震のゆれの大きさを表すものはどれですか。",
        choices: ["震度", "マグニチュード", "震源距離", "初期微動継続時間"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "ある地点でのゆれの大きさは、震度で表します。",
          "マグニチュードは、地震そのものの規模を表す値です。"
        ]
      },
      {
        id: "shindo-scale",
        text: "日本で使われている震度の階級について、正しいものはどれですか。",
        choices: [
          "0〜7の10階級",
          "0〜7の8階級",
          "1〜7の7階級",
          "1〜10の10階級"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "震度は、0、1、2、3、4、5弱、5強、6弱、6強、7 の10階級です。",
          "5と6が、それぞれ弱と強に分かれているので、0〜7でも10階級になります。"
        ]
      },
      {
        id: "magnitude-energy",
        text: "マグニチュードが1大きくなると、地震のエネルギーは約何倍になりますか。",
        choices: ["約32倍", "約2倍", "約10倍", "約1000倍"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "マグニチュードが1大きくなると、エネルギーは約32倍になります。",
          "2大きくなると、約32 × 約32 で、1000倍になります。"
        ]
      },
      {
        id: "shindo-vs-magnitude",
        text: "1つの地震の、震度とマグニチュードについて、正しいものはどれですか。",
        choices: [
          "マグニチュードは1つに決まるが、震度は観測する地点によってちがう",
          "震度は1つに決まるが、マグニチュードは観測する地点によってちがう",
          "震度もマグニチュードも、観測する地点によってちがう",
          "震度もマグニチュードも、どの地点でも同じ値になる"
        ],
        answer: 0,
        explain: [
          "マグニチュードは地震そのものの規模なので、1つの地震に1つの値です。",
          "震度は、その地点でのゆれの大きさなので、震源からの距離や地盤のようすによって、地点ごとにちがいます。"
        ]
      },
      {
        id: "plates-japan",
        text: "日本付近のプレートの動きについて、正しいものはどれですか。",
        choices: [
          "海洋プレートが、大陸プレートの下に沈みこんでいる",
          "大陸プレートが、海洋プレートの下に沈みこんでいる",
          "海洋プレートと大陸プレートが、たがいに離れていっている",
          "海洋プレートも大陸プレートも、動いていない"
        ],
        answer: 0,
        explain: [
          "日本付近では、海洋プレートが大陸プレートの下に沈みこんでいます。",
          "大陸プレートが引きずりこまれてひずみ、たえられなくなって元にもどるときに、大きな地震が起こります。"
        ]
      },
      {
        id: "focus-depth",
        text: "日本付近で起こる地震の、震源の深さの分布について、正しいものはどれですか。",
        choices: [
          "太平洋側で浅く、日本海側に向かって深くなる",
          "太平洋側で深く、日本海側に向かって浅くなる",
          "太平洋側でも日本海側でも、同じ深さである",
          "日本海側だけに分布し、太平洋側にはない"
        ],
        answer: 0,
        explain: [
          "震源は、沈みこむ海洋プレートに沿って分布しています。",
          "海洋プレートは太平洋側から日本海側へ向かって沈みこんでいるので、震源は太平洋側で浅く、日本海側に向かって深くなります。"
        ]
      },
      {
        id: "tsunami",
        text: "海底で大きな地震が起こり、海底が急に持ち上がったり沈んだりしたときに発生する、大きな波を何といいますか。",
        choices: ["津波", "液状化", "初期微動", "土砂くずれ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "海底の動きが海水に伝わってできる大きな波が、津波です。",
          "液状化は地面がやわらかくなる現象、土砂くずれは斜面がくずれる現象です。"
        ]
      },
      {
        id: "liquefaction",
        text: "地震のゆれによって、埋め立て地などの砂の多い土地が急にやわらかくなり、建物がかたむいたり、砂や水がふき出したりする現象を何といいますか。",
        choices: ["液状化", "津波", "しゅう曲", "風化"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "水を多くふくんだ砂の地面が、ゆれによって液体のようになる現象を、液状化といいます。",
          "埋め立て地や、川や海に近い土地で起こりやすい現象です。"
        ]
      },
      {
        id: "early-warning",
        text: "緊急地震速報は、どのようなしくみで出されますか。",
        choices: [
          "震源の近くでP波をとらえ、S波による大きなゆれが届く前に知らせる",
          "震源の近くでS波をとらえ、P波による大きなゆれが届く前に知らせる",
          "地震が発生する数分前に、プレートの動きをとらえて知らせる",
          "すべての地点で主要動がおさまったあとに、震度を知らせる"
        ],
        answer: 0,
        explain: [
          "P波はS波より速く伝わるので、震源の近くの地震計でP波をとらえれば、離れた地点に主要動が届く前に知らせることができます。",
          "大きなゆれを起こすのはS波です。また、地震の発生そのものを前もって知るしくみではありません。"
        ]
      }
    ],
    generators: [
      {
        id: "wave-speed",
        label: "地震の波の速さ(震源からの距離 ÷ かかった時間)",
        make: function () {
          var sp = JHS.pick(SPEEDS), vp = sp[0], vs = sp[1];
          var d = JHS.pick(distances(vp, vs, 60, 240)), t0 = randomTime();
          var tP = d / vp, tS = d / vs, askP = Math.random() < 0.5;
          var name = askP ? "P波" : "S波", other = askP ? "S波" : "P波";
          var ans = askP ? vp : vs, t = askP ? tP : tS, arr = t0 + t;
          var wrongs = [kms(askP ? vs : vp), kms(d / (tS - tP))];
          if ((t * 100) % d === 0) wrongs.push(kms(t / d));
          wrongs.push(kms(ans * 2), kms(ans + 1), kms(ans + 2));
          var c = JHS.choices4(kms(ans), wrongs);
          if (!c) return null;
          return {
            text: "ある地震を、震源から" + km(d) + "の地点で観測しました。" + name + "の伝わる速さは何km/sですか。",
            material: JHS.given([["地震が発生した時刻", tm(t0)], ["P波が届いた時刻", tm(t0 + tP)], ["S波が届いた時刻", tm(t0 + tS)]]),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              name + "が届くまでにかかった時間は、" + name + "が届いた時刻から、地震が発生した時刻を引いて求めます。" + JHS.calc(tm(arr) + " − " + tm(t0), t + " 秒"),
              "速さは、距離 ÷ 時間です。" + JHS.calc(d + " km ÷ " + t + " 秒", ans + " km/s"),
              other + "が届いた時刻を使" + ((tS - tP) === t ? "わないようにします。" : "ったり、2つの波が届いた時刻の差(" + sec(tS - tP) + ")で割ったりしないようにします。")
            ],
            meta: { ask: name, distance: d, origin: clock(t0), pArrival: clock(t0 + tP), sArrival: clock(t0 + tS), pSpeed: vp, sSpeed: vs, answer: ans }
          };
        }
      },
      {
        id: "tremor-duration",
        label: "初期微動継続時間(波の速さから求める・震源距離との比例)",
        make: function () {
          var sp = JHS.pick(SPEEDS), vp = sp[0], vs = sp[1], c;
          if (Math.random() < 0.5) {
            var d = JHS.pick(distances(vp, vs, 30, 240)), tP = d / vp, tS = d / vs, ans = tS - tP;
            var wrongs = [sec(tP), sec(tS), sec(tP + tS)];
            if ((d * 10) % ((vp - vs) * 10) === 0) wrongs.push(sec(d / (vp - vs)));
            wrongs.push(sec(ans * 2), sec(ans + 5), sec(ans + 10));
            c = JHS.choices4(sec(ans), wrongs);
            if (!c) return null;
            return {
              text: "次の地震で、震源から" + km(d) + "の地点の初期微動継続時間は何秒ですか。",
              material: JHS.given([["P波の速さ", kms(vp)], ["S波の速さ", kms(vs)]]),
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "P波とS波が届くまでの時間を、それぞれ求めます。" + JHS.calc(d + " km ÷ " + vp + " km/s", tP + " 秒") + JHS.calc(d + " km ÷ " + vs + " km/s", tS + " 秒"),
                "初期微動継続時間は、その差です。" + JHS.calc(tS + " 秒 − " + tP + " 秒", ans + " 秒"),
                tP === ans
                  ? "この地震ではS波の速さがP波の半分なので、初期微動継続時間は、P波が届くまでの時間と同じ " + sec(ans) + "になります。" + sec(tS) + "はS波が届くまでの時間で、初期微動継続時間ではありません。"
                  : sec(tP) + "はP波が届くまでの時間、" + sec(tS) + "はS波が届くまでの時間で、どちらも初期微動継続時間ではありません。"
              ],
              meta: { kind: "from-speeds", distance: d, pSpeed: vp, sSpeed: vs, pTime: tP, sTime: tS, answer: ans }
            };
          }
          // 比例: A地点の震源距離と初期微動継続時間から、B地点の値を求める
          var ds = JHS.shuffle(distances(vp, vs, 30, 240));
          if (ds.length < 2) return null;
          var d1 = ds[0], d2 = ds[1], t1 = d1 / vs - d1 / vp, t2 = d2 / vs - d2 / vp;
          var askD = Math.random() < 0.5, w = [], row, textQ, lines;
          if (askD) {
            if ((d1 * t1) % t2 === 0) w.push(km(d1 * t1 / t2));
            w.push(km(d1 + (t2 - t1)), km(d2 + 10), km(d2 * 2), km(d2 + 20), km(d2 + 30));
            c = JHS.choices4(km(d2), w);
            row = ["B", "?", sec(t2)];
            textQ = "同じ地震を、A・B の2地点で観測しました。B地点の震源距離は何kmですか。初期微動継続時間は、震源距離に比例するものとします。";
            lines = [
              "初期微動継続時間は震源距離に比例するので、初期微動継続時間が何倍になったかを調べます。" + JHS.calc(t2 + " 秒 ÷ " + t1 + " 秒", JHS.num(t2 / t1) + " 倍"),
              "震源距離も、同じだけ倍になります。" + JHS.calc(d1 + " km × " + JHS.num(t2 / t1), d2 + " km")
            ];
          } else {
            if ((t1 * d1) % d2 === 0) w.push(sec(t1 * d1 / d2));
            if (t1 + (d2 - d1) > 0) w.push(sec(t1 + (d2 - d1)));
            w.push(sec(t2 + 5), sec(t2 * 2), sec(t2 + 10), sec(t2 + 15));
            c = JHS.choices4(sec(t2), w);
            row = ["B", km(d2), "?"];
            textQ = "同じ地震を、A・B の2地点で観測しました。B地点の初期微動継続時間は何秒ですか。初期微動継続時間は、震源距離に比例するものとします。";
            lines = [
              "初期微動継続時間は震源距離に比例するので、震源距離が何倍になったかを調べます。" + JHS.calc(d2 + " km ÷ " + d1 + " km", JHS.num(d2 / d1) + " 倍"),
              "初期微動継続時間も、同じだけ倍になります。" + JHS.calc(t1 + " 秒 × " + JHS.num(d2 / d1), t2 + " 秒")
            ];
          }
          if (!c) return null;
          // 何倍かが小数第2位までで割り切れない組は、解説の式が書けないので出さない
          var ratio = askD ? t2 / t1 : d2 / d1;
          if (Math.abs(ratio * 100 - Math.round(ratio * 100)) > 1e-9) return null;
          return {
            text: textQ,
            material: JHS.table({ head: ["地点", "震源距離", "初期微動継続時間"], rows: [["A", km(d1), sec(t1)], row] }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: lines,
            meta: { kind: askD ? "ratio-distance" : "ratio-time", distanceA: d1, timeA: t1, distanceB: d2, timeB: t2, answer: askD ? d2 : t2 }
          };
        }
      },
      {
        id: "origin-time",
        label: "地震の発生時刻(届いた時刻 − かかった時間)",
        make: function () {
          var sp = JHS.pick(SPEEDS), vp = sp[0], vs = sp[1], t0 = randomTime(), c;
          if (Math.random() < 0.5) {
            var d = JHS.pick(distances(vp, vs, 60, 240)), tP = d / vp, tS = d / vs, askP = Math.random() < 0.5;
            var name = askP ? "P波" : "S波", v = askP ? vp : vs, t = askP ? tP : tS, tOther = askP ? tS : tP, arr = t0 + t;
            c = JHS.choices4(tm(t0), [tm(arr + t), tm(arr - tOther), tm(arr - (tS - tP)), tm(t0 - 10), tm(t0 + 10), tm(t0 - 20)]);
            if (!c) return null;
            return {
              text: "震源から" + km(d) + "の地点に、" + name + "が" + tm(arr) + "に届きました。" + name + "の速さを" + kms(v) + "とすると、地震が発生した時刻はいつですか。",
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                name + "が届くまでにかかった時間を求めます。" + JHS.calc(d + " km ÷ " + v + " km/s", t + " 秒"),
                "地震が発生したのは、届いた時刻の" + sec(t) + "前です。" + JHS.calc(tm(arr) + " − " + t + " 秒", tm(t0)),
                "かかった時間は、届いた時刻から<b>引きます</b>(足すと、届いたあとの時刻になってしまいます)。"
              ],
              meta: { kind: "one-point", wave: name, distance: d, speed: v, travel: t, arrival: clock(arr), arrivalSec: arr, originSec: t0, answer: clock(t0) }
            };
          }
          // 2地点のP波の届いた時刻から求める
          var ds = distances(vp, vs, 30, 240);
          if (ds.length < 2) return null;
          var pair = JHS.shuffle(ds).slice(0, 2).sort(function (x, y) { return x - y; });
          var d1 = pair[0], d2 = pair[1], t1 = d1 / vp, t2 = d2 / vp, a1 = t0 + t1, a2 = t0 + t2;
          c = JHS.choices4(tm(t0), [tm(a1 - (t2 - t1)), tm(a1 + t1), tm(a2 - t1), tm(t0 - 10), tm(t0 + 10), tm(t0 - 20)]);
          if (!c) return null;
          return {
            text: "同じ地震のP波が、A・B の2地点に次の時刻に届きました。P波は一定の速さで伝わるものとすると、地震が発生した時刻はいつですか。",
            material: JHS.table({ head: ["地点", "震源からの距離", "P波が届いた時刻"], rows: [["A", km(d1), tm(a1)], ["B", km(d2), tm(a2)]] }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "P波は、A と B の間の" + km(d2 - d1) + "を、" + sec(t2 - t1) + "で伝わっています。P波の速さを求めます。" + JHS.calc((d2 - d1) + " km ÷ " + (t2 - t1) + " 秒", vp + " km/s"),
              "震源から A に届くまでにかかった時間を求めます。" + JHS.calc(d1 + " km ÷ " + vp + " km/s", t1 + " 秒"),
              "地震が発生したのは、A に届いた時刻の" + sec(t1) + "前です。" + JHS.calc(tm(a1) + " − " + t1 + " 秒", tm(t0))
            ],
            meta: { kind: "two-points", distanceA: d1, distanceB: d2, arrivalA: clock(a1), arrivalB: clock(a2), arrivalASec: a1, arrivalBSec: a2, pSpeed: vp, originSec: t0, answer: clock(t0) }
          };
        }
      },
      {
        id: "graph-read",
        label: "グラフの読み取り(初期微動継続時間・波の速さ)",
        make: function () {
          var sp = JHS.pick(SPEEDS), vp = sp[0], vs = sp[1];
          // 図の中で数字が重ならないよう、2つの波が届く時間の差が10秒以上ある距離だけを使う
          var ds = distances(vp, vs, 60, 180).filter(function (x) { return x / vs - x / vp >= 10; });
          if (ds.length === 0) return null;
          var d = JHS.pick(ds), tP = d / vp, tS = d / vs;
          var kind = JHS.pick(["duration", "duration", "p-speed", "s-speed"]);
          var figure = figWaveGraph({ vp: vp, vs: vs, d: d, read: true });
          var intro = "図は、ある地震のP波とS波について、地震が発生してから届くまでの時間と、震源からの距離の関係を表しています。";
          var c, ans;
          if (kind === "duration") {
            ans = tS - tP;
            c = JHS.choices4(sec(ans), [sec(tP), sec(tS), sec(tP + tS), sec(ans * 2), sec(ans + 5), sec(ans + 10)]);
            if (!c) return null;
            return {
              text: intro + "震源から" + km(d) + "の地点の初期微動継続時間は何秒ですか。",
              figure: figure,
              choices: c.choices, answer: c.answer, choiceLayout: "grid",
              explain: [
                "グラフから、" + km(d) + "の地点にP波は" + sec(tP) + "後、S波は" + sec(tS) + "後に届いています。",
                "初期微動継続時間は、P波が届いてからS波が届くまでの時間です。" + JHS.calc(tS + " 秒 − " + tP + " 秒", ans + " 秒")
              ],
              meta: { kind: kind, distance: d, pSpeed: vp, sSpeed: vs, pTime: tP, sTime: tS, answer: ans }
            };
          }
          var askP = kind === "p-speed", name = askP ? "P波" : "S波", t = askP ? tP : tS;
          ans = askP ? vp : vs;
          var wrongs = [kms(askP ? vs : vp), kms(d / (tS - tP))];
          if ((t * 100) % d === 0) wrongs.push(kms(t / d));
          wrongs.push(kms(ans * 2), kms(ans + 1), kms(ans + 2));
          c = JHS.choices4(kms(ans), wrongs);
          if (!c) return null;
          return {
            text: intro + "震源から" + km(d) + "の地点に届くまでの時間から考えると、" + name + "の伝わる速さは何km/sですか。",
            figure: figure,
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "グラフから、" + name + "(" + (askP ? "実線" : "破線") + ")は、" + km(d) + "の地点に" + sec(t) + "後に届いています。",
              "速さは、距離 ÷ 時間です。" + JHS.calc(d + " km ÷ " + t + " 秒", ans + " km/s")
            ],
            meta: { kind: kind, distance: d, pSpeed: vp, sSpeed: vs, pTime: tP, sTime: tS, answer: ans }
          };
        }
      }
    ]
  });

  // =====================================================================
  // 1-13 地層と化石
  // =====================================================================
  var SEDIMENTARY = JHS.table({
    caption: "堆積岩の種類",
    head: ["堆積岩", "もとになるもの", "特徴"],
    rows: [
      ["れき岩", "れき(粒の直径 2mm以上)", "粒は丸みを帯びている。"],
      ["砂岩", "砂(約0.06mm〜2mm)", "粒は丸みを帯びている。"],
      ["泥岩", "泥(約0.06mm以下)", "粒は見分けられないほど細かい。"],
      ["石灰岩", "生物の遺骸など", "うすい塩酸をかけると、二酸化炭素が発生する。"],
      ["チャート", "生物の遺骸など", "うすい塩酸をかけても気体は発生しない。非常にかたい。"],
      ["凝灰岩", "火山灰など", "粒は角ばっている。"]
    ]
  });

  var FOSSILS = JHS.table({
    caption: "示相化石と示準化石",
    head: ["", "示相化石", "示準化石"],
    rows: [
      ["わかること", "地層が堆積した当時の環境", "地層が堆積した年代"],
      ["適した生物", "限られた環境にしかすめない生物", "広い範囲にすみ、短い期間だけ栄えた生物"],
      ["例", "サンゴ(あたたかくて浅い、きれいな海)、アサリ・ハマグリ(浅い海)、シジミ(湖や河口)、ブナ(やや寒冷な気候の陸地)", "下の表を参照"]
    ]
  });

  var ERAS = JHS.table({
    caption: "地質年代と示準化石(上ほど古い)",
    head: ["地質年代", "示準化石"],
    rows: [
      ["古生代", "サンヨウチュウ、フズリナ"],
      ["中生代", "アンモナイト、恐竜"],
      ["新生代", "ビカリア、ナウマンゾウ、マンモス"]
    ]
  });

  // 柱状図の層の並び(下から上へ)を、文字で書く
  function rockNames(kinds) { return kinds.map(function (k) { return ROCKS[k].name; }).join(" → "); }
  var DEPTH = { gravel: 0, sand: 1, mud: 2 };

  JHS.register("g1-strata", {
    points: [
      "岩石は、気温の変化や雨水のはたらきで、表面からもろくなります(<b>風化</b>)。流れる水は、岩石をけずり(<b>" + r("侵食", "しんしょく") + "</b>)、土砂を運び(<b>運搬</b>)、流れのゆるやかなところに積もらせます(<b>" + r("堆積", "たいせき") + "</b>)。",
      "土砂は、粒の大きさで " + rule("れき・砂・泥") + " に分けます。粒の大きいものほど速くしずむので、河口や岸の近くには<b>れき</b>が、沖には<b>泥</b>が堆積します。",
      "堆積したものが、長い年月の間におし固められてできた岩石を<b>堆積岩</b>といいます。れき岩・砂岩・泥岩の粒は、流れる水に運ばれる間に角がとれて、" + rule("丸みを帯びています") + "。",
      "<b>石灰岩</b>と<b>チャート</b>は、生物の" + r("遺骸", "いがい") + "などが堆積してできた岩石で、" + rule("うすい塩酸をかけて見分けます") + "。<b>" + r("凝灰岩", "ぎょうかいがん") + "</b>は、火山灰などが堆積してできた岩石です。",
      "<b>" + r("示相", "しそう") + "化石</b>は地層が堆積した当時の<b>環境</b>を、<b>" + r("示準", "しじゅん") + "化石</b>は地層が堆積した<b>年代</b>を知る手がかりになります。地質年代は、古いほうから 古生代・中生代・新生代 です。",
      "地層は、ふつう" + rule("下の層ほど古い") + "です。火山灰の層(凝灰岩の層)は、広い範囲に同じ時期に堆積するので、離れた地層を比べる目印(<b>かぎ層</b>)になります。地層に大きな力がはたらくと、曲がった<b>しゅう曲</b>や、切れてずれた<b>断層</b>ができます。"
    ],
    figures: [
      { html: figDeposition(), caption: "粒の大きいれきは河口の近くに、粒の小さい泥は沖まで運ばれて堆積します。" },
      {
        html: figColumn({
          age: true,
          label: "地層の柱状図の例。上から、泥岩、砂岩、れき岩、凝灰岩、石灰岩の層。下の層ほど古い",
          cols: [{ name: "柱状図", layers: [{ t: "mud" }, { t: "sand" }, { t: "gravel" }, { t: "tuff", h: 0.6 }, { t: "lime" }] }]
        }),
        caption: "柱状図は、地層の重なりを1本の柱で表した図です。地層の逆転がなければ、下の層ほど古い層です。"
      }
    ],
    blocks: [SEDIMENTARY, FOSSILS, ERAS],
    example: {
      title: "ある地点の地層は、下から順に れき岩 → 砂岩 → 泥岩 と重なっていました。これらの層が堆積する間に、この地点の海の深さはどう変化したと考えられますか。地層の逆転はないものとします。",
      steps: [
        "下の層ほど古いので、れき → 砂 → 泥 の順に堆積しました。",
        "粒の大きいれきは岸に近い浅い海に、粒の小さい泥は岸から遠い深い海に堆積します。",
        "堆積する粒がしだいに小さくなったので、この地点は岸から遠くなり、海は<b>しだいに深くなった</b>と考えられます。"
      ],
      result: "しだいに深くなった"
    },
    fixed: [
      {
        id: "weathering",
        text: "気温の変化や雨水などのはたらきで、岩石が表面からもろくなってくずれていくことを何といいますか。",
        choices: ["風化", "侵食", "運搬", "堆積"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "岩石が、気温の変化や雨水などによって、表面からもろくなることを風化といいます。",
          "侵食・運搬・堆積は、流れる水のはたらきで、それぞれ、けずること・運ぶこと・積もらせることです。"
        ]
      },
      {
        id: "deposit-places",
        text: "図は、河口から沖に向かう海底の断面です。A〜C に堆積しているものの組み合わせとして、正しいものはどれですか。",
        figure: figDeposition({ keys: true }),
        choices: [
          "A れき・B 砂・C 泥",
          "A 泥・B 砂・C れき",
          "A 砂・B れき・C 泥",
          "A れき・B 泥・C 砂"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "粒の大きいものほど速くしずむので、河口に近い A にれき、その先の B に砂が堆積します。",
          "粒の小さい泥は、しずみにくいので、沖の C まで運ばれます。"
        ]
      },
      {
        id: "why-mud-far",
        text: "泥が、れきや砂よりも河口から遠い沖まで運ばれて堆積するのはなぜですか。",
        choices: [
          "粒が小さく、しずみにくいから",
          "粒が大きく、しずみにくいから",
          "粒が角ばっていて、水にうきやすいから",
          "水にとけて運ばれ、沖で再び固まるから"
        ],
        answer: 0,
        explain: [
          "泥は粒が小さいので、しずむのに時間がかかり、その間に沖まで運ばれます。",
          "粒の大きいれきや砂は、速くしずむので、河口や岸の近くに堆積します。"
        ]
      },
      {
        id: "round-grains",
        text: "れき岩や砂岩にふくまれる粒が、丸みを帯びているのはなぜですか。",
        choices: [
          "流れる水に運ばれる間に、角がけずられたから",
          "マグマが、地下深くでゆっくり冷え固まったから",
          "火山の噴火でふき出したあと、空中で冷えたから",
          "うすい塩酸によって、表面がとかされたから"
        ],
        answer: 0,
        explain: [
          "堆積岩の粒は、流れる水に運ばれる間に、ぶつかり合って角がけずられ、丸みを帯びます。",
          "火成岩の鉱物や、凝灰岩にふくまれる火山灰の粒は、流れる水に運ばれていないので、角ばっています。"
        ]
      },
      {
        id: "limestone-chert",
        text: "石灰岩とチャートを見分ける方法として、正しいものはどれですか。",
        choices: [
          "うすい塩酸をかける。二酸化炭素が発生するほうが石灰岩である",
          "うすい塩酸をかける。二酸化炭素が発生するほうがチャートである",
          "水に入れる。水にとけるほうが石灰岩である",
          "磁石を近づける。磁石につくほうがチャートである"
        ],
        answer: 0,
        explain: [
          "石灰岩にうすい塩酸をかけると、二酸化炭素が発生します。チャートでは、気体は発生しません。",
          "石灰岩もチャートも、水にはとけず、磁石にもつきません。"
        ]
      },
      {
        id: "chert",
        text: "次の特徴をもつ堆積岩は、どれですか。",
        material: JHS.given([["もとになるもの", "生物の遺骸など"], ["うすい塩酸", "気体は発生しない"], ["かたさ", "非常にかたい"]]),
        choices: ["チャート", "石灰岩", "凝灰岩", "泥岩"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "生物の遺骸などからできていて、うすい塩酸をかけても気体が発生せず、非常にかたいのは、チャートです。",
          "石灰岩は、うすい塩酸をかけると二酸化炭素が発生します。凝灰岩は火山灰、泥岩は泥からできています。"
        ]
      },
      {
        id: "tuff",
        text: "火山灰などが堆積して固まった岩石を何といいますか。",
        choices: ["凝灰岩", "石灰岩", "砂岩", "花こう岩"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "火山灰などが堆積して固まった岩石が、凝灰岩です。凝灰岩の層があると、その時期に火山の噴火があったことがわかります。",
          "花こう岩は、マグマが冷え固まった火成岩(深成岩)で、堆積岩ではありません。"
        ]
      },
      {
        id: "coral-fossil",
        text: "ある地層から、サンゴの化石が見つかりました。この地層が堆積した当時、この場所はどのような環境だったと考えられますか。",
        choices: [
          "あたたかくて浅い、きれいな海",
          "冷たくて深い海",
          "湖や河口",
          "やや寒冷な気候の陸地"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "サンゴは、あたたかくて浅い、きれいな海にすむ生物です。",
          "湖や河口を示すのはシジミ、やや寒冷な気候の陸地を示すのはブナの化石です。このような化石を示相化石といいます。"
        ]
      },
      {
        id: "index-fossil-condition",
        text: "示準化石(地層が堆積した年代を知る手がかりになる化石)に適しているのは、どのような生物の化石ですか。",
        choices: [
          "広い範囲にすみ、短い期間だけ栄えた生物",
          "広い範囲にすみ、長い期間にわたって栄えた生物",
          "せまい範囲にすみ、短い期間だけ栄えた生物",
          "せまい範囲にすみ、長い期間にわたって栄えた生物"
        ],
        answer: 0,
        explain: [
          "栄えた期間が短いと、その化石をふくむ地層の年代をしぼりこめます。",
          "すんでいた範囲が広いと、離れた場所の地層どうしを比べることができます。"
        ]
      },
      {
        id: "mesozoic-fossil",
        text: "中生代の示準化石は、どれですか。",
        choices: ["アンモナイト", "サンヨウチュウ", "フズリナ", "ビカリア"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "アンモナイトと恐竜は、中生代の示準化石です。",
          "サンヨウチュウとフズリナは古生代、ビカリアは新生代の示準化石です。"
        ]
      },
      {
        id: "paleozoic-fossils",
        text: "古生代の示準化石だけの組み合わせは、どれですか。",
        choices: [
          "サンヨウチュウとフズリナ",
          "アンモナイトと恐竜",
          "ビカリアとナウマンゾウ",
          "サンヨウチュウとアンモナイト"
        ],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "古生代の示準化石は、サンヨウチュウとフズリナです。",
          "アンモナイトと恐竜は中生代、ビカリアとナウマンゾウは新生代の示準化石です。"
        ]
      },
      {
        id: "key-bed",
        text: "図は、離れた2地点 A・B の地層の柱状図です。2地点の地層のつながりを調べるとき、目印(かぎ層)としてもっとも適している層はどれですか。",
        figure: figColumn({
          cols: [
            { name: "A地点", layers: [{ t: "sand" }, { t: "mud" }, { t: "tuff", h: 0.5 }, { t: "sand" }, { t: "gravel" }] },
            { name: "B地点", layers: [{ t: "mud", h: 0.6 }, { t: "tuff", h: 0.5 }, { t: "sand" }, { t: "gravel" }, { t: "mud" }] }
          ]
        }),
        choices: ["凝灰岩の層", "砂岩の層", "泥岩の層", "れき岩の層"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "凝灰岩のもとになる火山灰は、広い範囲に、ほぼ同じ時期に降り積もります。",
          "そのため、凝灰岩の層は、離れた地点の地層が同じ時期のものかどうかを調べる目印(かぎ層)になります。"
        ]
      },
      {
        id: "eruption-layer",
        text: "図は、ある地点の地層の柱状図です。堆積した当時、火山の噴火があったことがわかる層は、ア〜エ のどれですか。",
        figure: figColumn({
          cols: [{ layers: [{ t: "mud", key: "ア" }, { t: "sand", key: "イ" }, { t: "tuff", key: "ウ", h: 0.7 }, { t: "gravel", key: "エ" }] }]
        }),
        choices: ["ウ", "ア", "イ", "エ"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "模様の見本から、ウ は凝灰岩の層です。凝灰岩は火山灰などが堆積してできるので、このころ火山の噴火があったことがわかります。",
          "ア は泥岩、イ は砂岩、エ はれき岩で、流れる水に運ばれた土砂が堆積した層です。"
        ]
      },
      {
        id: "fold",
        text: "地層に大きな力が長い間はたらいて、地層が波打つように曲がったものを何といいますか。",
        choices: ["しゅう曲", "断層", "かぎ層", "風化"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "地層がおされて、波打つように曲がったものを、しゅう曲といいます。",
          "断層は、地層が切れてずれたものです。かぎ層は、地層を比べるときの目印になる層です。"
        ]
      }
    ],
    generators: [
      {
        id: "column-age",
        label: "柱状図の読み取り(いちばん古い層・新しい層)",
        make: function () {
          var kinds = JHS.shuffle(ROCK_ORDER).slice(0, 4);   // 上から下の順
          var oldest = Math.random() < 0.5;
          var ansKind = oldest ? kinds[3] : kinds[0];
          var others = kinds.filter(function (k) { return k !== ansKind; }).map(function (k) { return ROCKS[k].name + "の層"; });
          var c = JHS.choices4(ROCKS[ansKind].name + "の層", others);
          if (!c) return null;
          return {
            text: "図は、ある地点の地層の柱状図です。4つの層のうち、" + (oldest ? "いちばん古い" : "いちばん新しい") + "層はどれですか。地層の逆転はないものとします。",
            figure: figColumn({ cols: [{ layers: kinds.map(function (k) { return { t: k, h: JHS.pick([0.7, 1, 1.3]) }; }) }] }),
            choices: c.choices, answer: c.answer, choiceLayout: "grid",
            explain: [
              "地層は下から順に積み重なるので、下の層ほど古く、上の層ほど新しい層です。",
              "いちばん" + (oldest ? "下" : "上") + "にあるのは、模様の見本から、<b>" + ROCKS[ansKind].name + "</b>の層です。",
              "この柱状図の層は、下から " + rockNames(kinds.slice().reverse()) + " の順に堆積しました。"
            ],
            meta: { ask: oldest ? "oldest" : "newest", topToBottom: kinds.map(function (k) { return ROCKS[k].name; }), answer: ROCKS[ansKind].name }
          };
        }
      },
      {
        id: "sea-depth",
        label: "柱状図の読み取り(海の深さの変化)",
        make: function () {
          var set = ["gravel", "sand", "mud"];
          var a = JHS.pick(set);
          var b = JHS.pick(set.filter(function (k) { return k !== a; }));
          var c3 = JHS.pick(set.filter(function (k) { return k !== b; }));
          var seq = [a, b, c3];   // 下から上の順
          var up1 = DEPTH[b] > DEPTH[a], up2 = DEPTH[c3] > DEPTH[b];
          var choices = [
            "しだいに深くなった",
            "しだいに浅くなった",
            "深くなったあと、浅くなった",
            "浅くなったあと、深くなった"
          ];
          var answer = up1 && up2 ? 0 : !up1 && !up2 ? 1 : up1 ? 2 : 3;
          function grain(k) { return ROCKS[k].grain; }
          function step(from, to, up) {
            return grain(from) + " → " + grain(to) + " は、粒が" + (up ? "小さく" : "大きく") + "なっているので、海は<b>" + (up ? "深く" : "浅く") + "</b>なりました。";
          }
          return {
            text: "図は、ある地点の地層の柱状図で、下から順に " + rockNames(seq) + " の層が重なっています。これらの層が堆積する間に、この地点の海の深さはどのように変化したと考えられますか。地層の逆転はないものとします。",
            figure: figColumn({ cols: [{ layers: seq.slice().reverse().map(function (k) { return { t: k, h: JHS.pick([0.8, 1, 1.2]) }; }) }] }),
            choices: choices, answer: answer,
            explain: [
              "粒の大きいものほど岸に近い浅い海に、粒の小さいものほど岸から遠い深い海に堆積します。下の層から順に、粒の大きさの変化を見ます。",
              step(a, b, up1),
              step(b, c3, up2)
            ],
            meta: { bottomToTop: seq.map(function (k) { return ROCKS[k].name; }), answer: choices[answer] }
          };
        }
      }
    ]
  });
})();

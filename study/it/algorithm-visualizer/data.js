// アルゴリズム道場: 6単元の定義・問題・成績の保存。道場(index.html)と復習プランナーで使う。
// 読み込む順番: shared/store.js →(shared/review.js →)data.js → algo.js
// 自動生成の問題は、algo.js(AlgoViz)のステップ生成から正解を求める(可視化と同じ処理)。AlgoViz は出題のときに使う。
//
// ■ 問題
//   {
//     id: "c01",                       // 単元の中で重ならない名前(自動生成は "gen-…")
//     q: "問題文",                      // `…` で囲んだところは <code> になる
//     kind: "text",                    // 選択肢の種類。"text" = 説明文 / "code" = 値・式(等幅) / "arr" = 配列・並び(等幅)
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ、すべて異なる。先頭が正解。並びはページが毎回まぜる
//     fig: { type: "code", text: "…" }  // 省略可。問題の図。"code" = 擬似コード / "array" = { arr } / "graph" = { graph, start }
//     explain: "解説",
//     ref: "bubble"                    // 可視化ページの #… (visualizer.html#bubble)
//   }
var ALGO = (function () {
  "use strict";

  var STATS_KEY = "algorithmVisualizerStats";
  var SETTINGS_KEY = "algorithmVisualizerQuizSettings";
  var COUNT = 10;
  var KINDS = ["text", "code", "arr"];
  var REFS = ["bubble", "selection", "insertion", "merge", "quick", "linear", "binary", "bfs", "dfs", "complexity"];

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "complexity", no: "01", name: "計算量の基本", short: "計算量", keys: "O(1) · O(log n) · O(n²) · 安定性", ref: "complexity" },
    { id: "simple-sort", no: "02", name: "バブル・選択・挿入ソート", short: "基本ソート", keys: "1パス後の配列 · 交換の回数", ref: "bubble" },
    { id: "fast-sort", no: "03", name: "マージ・クイックソート", short: "速いソート", keys: "分割統治 · ピボット · マージ", ref: "merge" },
    { id: "search", no: "04", name: "線形探索・二分探索", short: "探索", keys: "mid · 調べる回数 · 整列済み", ref: "binary" },
    { id: "bfs", no: "05", name: "幅優先探索", short: "BFS", keys: "キュー · 訪問順 · 最少の辺数", ref: "bfs" },
    { id: "dfs", no: "06", name: "深さ優先探索", short: "DFS", keys: "スタック · 再帰 · 戻る", ref: "dfs" }
  ];
  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  // ---------- 固定の問題 ----------
  var FIXED = {};
  FIXED["complexity"] = [
    { id: "c01", kind: "text", q: "O記法(オーダー記法)で表しているものは?",
      choices: ["データの量 n が増えたとき、処理の手間がどんな割合で増えるか", "プログラムを1回動かしたときにかかる秒数", "プログラムの行数", "プログラムが使うメモリのバイト数そのもの"],
      explain: "O記法は「n を大きくしたときの手間の増え方」だけを表します。2n も n も同じ O(n) と書き、定数倍や小さい項は気にしません。速いパソコンでも遅いパソコンでも、増え方は変わりません。", ref: "complexity" },
    { id: "c02", kind: "code", q: "次の処理の計算量は?(n は配列の長さ)",
      fig: { type: "code", text: "for i ← 0 … n−1\n  for j ← 0 … n−1\n    s ← s + a[i] × a[j]" },
      choices: ["O(n²)", "O(n)", "O(n log n)", "O(2n)"],
      explain: "外側のループが n 回、その1回ごとに内側のループが n 回まわるので、`s ← …` は n × n = n² 回実行されます。ループの入れ子は、回数のかけ算になります。", ref: "complexity" },
    { id: "c03", kind: "code", q: "次の処理の計算量は?(n は配列の長さ)",
      fig: { type: "code", text: "for i ← 0 … n−1\n  s ← s + a[i]\nfor i ← 0 … n−1\n  t ← t + a[i] × 2" },
      choices: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
      explain: "ループが2つありますが、入れ子ではなく順番に並んでいるだけです。回数は n + n = 2n 回。定数倍は無視するので O(n) です(入れ子ならかけ算、並んでいるなら足し算)。", ref: "complexity" },
    { id: "c04", kind: "code", q: "次の処理の計算量は?",
      fig: { type: "code", text: "i ← n\nwhile i > 1\n  i ← ⌊i / 2⌋" },
      choices: ["O(log n)", "O(n)", "O(n / 2)", "O(1)"],
      explain: "1回まわるごとに i が半分になります。n = 1024 なら 512, 256, …, 1 と10回で終わります。「半分にし続けて1になるまでの回数」が log₂ n で、O(log n) と書きます。", ref: "complexity" },
    { id: "c05", kind: "code", q: "長さ n の配列 a で、`a[i]` を1つ読む処理の計算量は?",
      choices: ["O(1)", "O(n)", "O(log n)", "O(i)"],
      explain: "配列は、添字がわかればその場所を直接読めます。n がいくら大きくても手間は変わらないので O(1)(定数時間)です。", ref: "complexity" },
    { id: "c06", kind: "code", q: "n が十分に大きいとき、手間の増え方が「小さい順」に正しく並んでいるのは?",
      choices: ["O(1) < O(log n) < O(n) < O(n log n) < O(n²)", "O(1) < O(n) < O(log n) < O(n²) < O(n log n)", "O(log n) < O(1) < O(n) < O(n log n) < O(n²)", "O(1) < O(log n) < O(n log n) < O(n) < O(n²)"],
      explain: "n = 1,024 なら、1・10・1,024・約1万・約100万と増えていきます。可視化ページの「計算量の比較」で、グラフと表を見比べられます。", ref: "complexity" },
    { id: "c07", kind: "code", q: "バブルソートの、最悪のときの計算量は?",
      choices: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
      explain: "最悪(逆順のデータ)では、n−1 パスでおよそ n²/2 回比べて交換します。だから O(n²) です。", ref: "bubble" },
    { id: "c08", kind: "code", q: "マージソートの、最悪のときの計算量は?",
      choices: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      explain: "マージソートは、データがどんな並びでも半分ずつに分けて(log n 段)、各段で全体を1回ずつ合わせます(n 回ほど)。だから最良・平均・最悪のどれも O(n log n) です。", ref: "merge" },
    { id: "c09", kind: "text", q: "末尾の値をピボット(基準)にするクイックソートが、最も遅く O(n²) になるのはどんなデータ?",
      choices: ["すでに整列済み(または逆順)のデータ", "値がばらばらに並んだデータ", "値がすべて異なるデータ", "要素の数が偶数のデータ"],
      explain: "整列済みだと、末尾のピボットはいつも最大値です。分割しても「n−1 個と0個」にしか分かれず、ほとんど減らない分割が n 回続くので、およそ n²/2 回比べることになります。", ref: "quick" },
    { id: "c10", kind: "text", q: "「安定なソート」とは、どんなソート?",
      choices: ["同じ値の要素どうしの並び順が、整列したあとも元のまま保たれる", "何回動かしても、かかる時間が同じ", "最悪でも O(n log n) で終わる", "追加のメモリをまったく使わない"],
      explain: "たとえば「点数順に並べる」とき、同じ点数の人が元の順番(名前順など)のまま残るのが安定なソートです。バブル・挿入・マージは安定、選択・クイックは安定ではありません。", ref: "complexity" },
    { id: "c11", kind: "text", q: "次のうち、安定でないソートは?",
      choices: ["選択ソート", "バブルソート", "挿入ソート", "マージソート"],
      explain: "選択ソートは、最小値を未整列部分の先頭と「遠くどうしで」交換します。このとき、同じ値の要素を飛びこえて順番が入れかわることがあるので、安定ではありません。", ref: "selection" },
    { id: "c12", kind: "code", q: "マージソートが整列のために使う、追加のメモリ(作業用の場所)の大きさは?",
      choices: ["O(n)", "O(1)", "O(n²)", "O(log n)"],
      explain: "マージソートは、2つの列を合わせるときに、取り出した値をいったん別の場所に書いていきます。そのため、元の配列と同じくらい(n に比例する)の作業用メモリが必要です。", ref: "merge" },
    { id: "c13", kind: "code", q: "挿入ソートに、すでに整列済みのデータを渡したときの計算量は?",
      choices: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
      explain: "整列済みなら、取り出した値は左どなりと1回比べるだけで「そのままでよい」とわかります。比べる回数は n−1 回なので O(n)。挿入ソートは、ほぼ整列済みのデータに強いソートです。", ref: "insertion" },
    { id: "c14", kind: "code", q: "二分探索の計算量(最悪のとき)は?",
      choices: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      explain: "1回調べるごとに、探す範囲が半分になります。範囲が1つになるまでに半分にできる回数は log₂ n 回ほどなので O(log n) です。", ref: "binary" },
    { id: "c15", kind: "text", q: "O(n²) のプログラムが、n = 1,000 のとき1秒かかりました。n = 2,000 にすると、およそ何秒かかる?",
      choices: ["4秒", "2秒", "8秒", "1秒"],
      explain: "手間は n² に比例します。n が2倍になると、手間は 2² = 4倍。だからおよそ4秒です(O(n) なら2倍、O(1) なら変わらない)。", ref: "complexity" },
    { id: "c16", kind: "code", q: "n = 1,000,000(100万)のとき、log₂ n はおよそいくつ?",
      choices: ["20", "1,000", "500,000", "100"],
      explain: "2¹⁰ = 1,024 なので、2²⁰ = 1,024 × 1,024 ≒ 100万です。log₂ n は「2を何回かけると n になるか」なので、およそ20。100万個から二分探索しても、20回ほどで見つかります。", ref: "complexity" }
  ];

  FIXED["simple-sort"] = [
    { id: "s01", kind: "text", q: "小さい順に並べるバブルソートで、1パス目(左端から右端まで、となりどうしを1回ずつ比べる)が終わると、必ず右端にくる値は?",
      choices: ["配列の中でいちばん大きい値", "配列の中でいちばん小さい値", "最初に左端にあった値", "最初に右端にあった値"],
      explain: "大きい値は、比べるたびに交換されて右へ右へと運ばれていきます。いちばん大きい値は、どこにあっても1パスで右端まで運ばれて確定します。", ref: "bubble" },
    { id: "s02", kind: "code", q: "8個の値を選択ソートで並べるとき、交換は最大で何回?",
      choices: ["7回", "28回", "8回", "64回"],
      explain: "選択ソートは、添字 0, 1, …, n−2 の位置を決めるときに、それぞれ最大1回だけ交換します。だから交換は最大で n−1 = 7回。交換が少ないのが選択ソートの長所です。", ref: "selection" },
    { id: "s03", kind: "code", q: "6個の値を選択ソートで並べるとき、値どうしを比べる回数は?",
      choices: ["15回", "36回", "5回", "30回"],
      explain: "最小値を探すのに、残りの個数−1回ずつ比べます。5 + 4 + 3 + 2 + 1 = 15回(n(n−1)/2)。選択ソートは、データの並びに関係なく比べる回数がいつも同じです。", ref: "selection" },
    { id: "s04", kind: "code", q: "交換がなければ打ち切るバブルソートに、すでに整列済みの n 個のデータを渡すと、比べる回数は?",
      choices: ["n−1 回", "n(n−1)/2 回", "0 回", "n² 回"],
      explain: "1パス目で n−1 回比べて、交換が1回もないので、その場で終わります。だから最良のときの計算量は O(n) です。", ref: "bubble" },
    { id: "s05", kind: "text", q: "挿入ソートが特に速く終わるのは、どんなデータ?",
      choices: ["ほとんど整列済みで、少しだけ順番がずれたデータ", "大きい順(逆順)に並んだデータ", "値がばらばらに並んだデータ", "要素の数がとても多いデータ"],
      explain: "挿入ソートは、取り出した値を左へずらしていきます。ほぼ整列済みなら、ほとんどずらさずにすむので速く終わります(整列済みなら O(n))。", ref: "insertion" },
    { id: "s06", kind: "code", q: "`[5, 4, 3, 2, 1]` をバブルソートで小さい順に並べるとき、交換は全部で何回?",
      fig: { type: "array", arr: [5, 4, 3, 2, 1] },
      choices: ["10回", "4回", "5回", "25回"],
      explain: "バブルソートの1回の交換で、順番が逆になっている2つの組が1組だけ直ります。逆順の5個では、どの2つを選んでも逆なので 5×4÷2 = 10組。だから交換は10回です。", ref: "bubble" },
    { id: "s07", kind: "text", q: "「未整列の部分から最小値を探して、未整列の部分の先頭と交換する」ことをくり返すのは?",
      choices: ["選択ソート", "バブルソート", "挿入ソート", "マージソート"],
      explain: "これは選択ソートです。1回ごとに、左から1つずつ位置が確定していきます。", ref: "selection" },
    { id: "s08", kind: "text", q: "「左側の整列済みの部分へ、右から1つずつ取り出して、正しい位置に入れていく」のは?",
      choices: ["挿入ソート", "選択ソート", "バブルソート", "クイックソート"],
      explain: "これは挿入ソートです。トランプの手札を、1枚ずつ正しい場所にさしこんで並べるやり方と同じです。", ref: "insertion" },
    { id: "s09", kind: "text", q: "小さい順に並べるバブルソートで、i パス目が終わったとき、位置が確定しているのは?",
      choices: ["右端から i 個", "左端から i 個", "右端の1個だけ", "まだどこも確定していない"],
      explain: "1パスごとに、残りの中でいちばん大きい値が右端へ運ばれて確定します。だから i パス後には、右端から i 個が確定しています。", ref: "bubble" },
    { id: "s10", kind: "text", q: "同じ個数のデータなら、データの並び方にかかわらず、比べる回数がいつも同じなのは?",
      choices: ["選択ソート", "打ち切りありのバブルソート", "挿入ソート", "3つとも並び方で変わる"],
      explain: "選択ソートは、最小値を探すために残りをすべて見るので、整列済みでも逆順でも n(n−1)/2 回比べます。バブル(打ち切りあり)と挿入は、整列済みなら n−1 回ですみます。", ref: "selection" },
    { id: "s11", kind: "text", q: "挿入ソートで、比べる回数とずらす回数が最も多くなるのは、どんなデータ?",
      choices: ["大きい順(逆順)に並んだデータ", "すでに小さい順に並んだデータ", "前半だけ整列済みのデータ", "値がばらばらのデータ"],
      explain: "逆順だと、取り出した値はいつも整列済みの部分のどれよりも小さいので、左端までずらすことになります。合計 n(n−1)/2 回で、これが最悪(O(n²))です。", ref: "insertion" }
  ];

  FIXED["fast-sort"] = [
    { id: "f01", kind: "text", q: "マージソートの計算量について、正しいのは?",
      choices: ["最良・平均・最悪のどれも O(n log n)", "最良は O(n)、最悪は O(n²)", "平均は O(n log n)、最悪は O(n²)", "最良・平均・最悪のどれも O(n²)"],
      explain: "マージソートは、データの並びに関係なく、半分に分けて(log n 段)合わせる(各段で n 回ほど)ので、いつも O(n log n) です。「平均 O(n log n)・最悪 O(n²)」はクイックソートです。", ref: "merge" },
    { id: "f02", kind: "text", q: "クイックソートの計算量について、正しいのは?",
      choices: ["平均は O(n log n)、最悪は O(n²)", "最良・平均・最悪のどれも O(n log n)", "平均も最悪も O(n²)", "平均は O(n)、最悪は O(n log n)"],
      explain: "ピボットでほぼ半分ずつに分かれれば O(n log n) です。でもピボットがいつも最大(最小)だと、分割がほとんど進まず O(n²) になります。", ref: "quick" },
    { id: "f03", kind: "text", q: "マージソートやクイックソートの考え方「分割統治」の説明として正しいのは?",
      choices: ["大きな問題を小さな問題に分けて解き、その結果を組み合わせる", "データを1つずつ順番に調べていく", "となりどうしを比べて交換する", "いちばん大きい値から順に決めていく"],
      explain: "マージソートは「半分に分けて、それぞれ整列して、合わせる」、クイックソートは「ピボットで小さい組と大きい組に分けて、それぞれ整列する」。どちらも分割統治です。", ref: "merge" },
    { id: "f04", kind: "code", q: "8個の値をマージソートで半分ずつに分けていくと、1個ずつになるまでに何段分ける?",
      choices: ["3段", "8段", "4段", "7段"],
      explain: "8 → 4 → 2 → 1 と、3回半分にすると1個ずつになります。log₂ 8 = 3。この段の数が log n で、各段で全体を合わせるので O(n log n) になります。", ref: "merge" },
    { id: "f05", kind: "arr", q: "整列済みの2つの列 `[2, 5, 9]` と `[3, 4, 10]` をマージ(合わせる)すると?",
      choices: ["[2, 3, 4, 5, 9, 10]", "[2, 5, 9, 3, 4, 10]", "[2, 3, 5, 4, 9, 10]", "[3, 4, 10, 2, 5, 9]"],
      explain: "先頭どうしを比べて小さいほうを取り出す、をくり返します。2と3 → 2、5と3 → 3、5と4 → 4、5と10 → 5、9と10 → 9、残りの10。結果は整列済みの1つの列になります。", ref: "merge" },
    { id: "f06", kind: "code", q: "長さ4の整列済みの列どうしを合わせる(マージする)とき、値を比べる回数は最大で何回?",
      choices: ["7回", "8回", "16回", "4回"],
      explain: "1回比べるごとに1つ書きます。最後の1つは比べずに書けるので、最大で 4 + 4 − 1 = 7回です。片方が先に空になれば、もっと少なくてすみます。", ref: "merge" },
    { id: "f07", kind: "text", q: "クイックソートで1回の分割が終わったとき、ピボット(基準の値)はどこにある?",
      choices: ["全体を整列し終えたときと同じ位置(そこで確定)", "必ず配列の真ん中", "必ず配列の左端", "まだ決まっていない(あとで動く)"],
      explain: "分割のあと、ピボットより左はすべて小さく、右はすべて大きい値です。だからピボットは、もう動かない正しい位置にいます。", ref: "quick" },
    { id: "f08", kind: "text", q: "マージソートとクイックソートのうち、安定なソート(同じ値の順番が保たれる)はどれ?",
      choices: ["マージソートだけ", "クイックソートだけ", "どちらも安定", "どちらも安定ではない"],
      explain: "マージソートは、左右の先頭が同じ値なら左を先に取り出すので、順番が保たれます。クイックソートは遠くの要素と交換するので、同じ値の順番が入れかわることがあります。", ref: "merge" },
    { id: "f09", kind: "text", q: "作業用の大きな配列を使わず、配列の中での交換だけで並べかえるのは?",
      choices: ["クイックソート", "マージソート", "どちらも作業用の配列が必要", "どちらも交換だけで並べる"],
      explain: "クイックソートは配列の中で交換するだけで分割できます(追加のメモリは再帰の分だけ、平均 O(log n))。マージソートは合わせるときに O(n) の作業用の場所を使います。", ref: "quick" },
    { id: "f10", kind: "text", q: "末尾をピボットにするクイックソートに `[1, 2, 3, 4, 5, 6]` を渡すと、最初の分割のあと、ピボットの 6 はどこに来る?",
      fig: { type: "array", arr: [1, 2, 3, 4, 5, 6] },
      choices: ["添字 5(右端のまま)", "添字 0(左端)", "添字 2", "添字 3"],
      explain: "6 より小さい値が5個あるので、6 は添字5に入ります。分割しても「5個と0個」にしか分かれません。整列済みのデータでこれが毎回起きるのが、クイックソートの最悪(O(n²))です。", ref: "quick" },
    { id: "f11", kind: "code", q: "7個の値(添字 0〜6)をマージソートで最初に分けるとき、左半分は何個?(mid = ⌊(0+6)/2⌋、左は添字 0〜mid)",
      choices: ["4個", "3個", "3.5個", "7個"],
      explain: "mid = ⌊(0+6)/2⌋ = 3 なので、左は添字0〜3の4個、右は添字4〜6の3個です。個数が奇数のときは、左のほうが1つ多くなります。", ref: "merge" }
  ];

  FIXED["search"] = [
    { id: "b01", kind: "text", q: "二分探索を使うために、配列が満たしていなければならないことは?",
      choices: ["整列済み(小さい順など)であること", "値がすべて異なること", "要素の数が2のべき乗であること", "探す値が必ず入っていること"],
      explain: "二分探索は「真ん中より小さいなら左、大きいなら右にあるはず」と考えて範囲を半分にします。整列していないと、この考えが成り立ちません。", ref: "binary" },
    { id: "b02", kind: "code", q: "100個の値から線形探索で探すとき、調べる回数は最大で何回?",
      choices: ["100回", "50回", "7回", "1回"],
      explain: "線形探索は先頭から1つずつ調べます。探す値が末尾にあるか、配列にないときは、100個すべてを調べます。最悪 O(n) です。", ref: "linear" },
    { id: "b03", kind: "code", q: "整列済みの100個の値から二分探索で探すとき、調べる回数は最大で何回?",
      choices: ["7回", "50回", "10回", "100回"],
      explain: "1回調べるごとに範囲が約半分になります。最悪のとき、調べるたびに候補が 100 → 50 → 25 → 12 → 6 → 3 → 1 個と減ります。6回調べたあとで候補が1つになり、7回目にその1つを調べるので、最大7回です(2⁶ = 64 < 100 ≤ 128 = 2⁷)。", ref: "binary" },
    { id: "b04", kind: "text", q: "整列済みの配列の要素数が2倍になると、二分探索で調べる回数(最悪)はどうなる?",
      choices: ["1回ふえる", "2倍になる", "4倍になる", "変わらない"],
      explain: "1回目で範囲が半分になれば、元の大きさにもどります。だから要素数が2倍になっても、ふえるのは1回だけです。これが O(log n) の強さです。", ref: "binary" },
    { id: "b05", kind: "code", q: "整列済みの100万個の値から二分探索で探すとき、調べる回数は最大でおよそ何回?",
      choices: ["20回", "1,000,000回", "500,000回", "1,000回"],
      explain: "2²⁰ = 1,048,576 なので、100万個でも20回ほど半分にすれば1個になります。線形探索なら最悪100万回です。", ref: "binary" },
    { id: "b06", kind: "text", q: "線形探索が二分探索より便利なのは、どんなとき?",
      choices: ["配列が整列していないとき", "要素の数がとても多いとき", "同じ配列から何度も探すとき", "探す値がないとき"],
      explain: "線形探索は1つずつ全部見るので、並び方に関係なく使えます。整列済みで何度も探すなら、二分探索のほうがずっと速いです。", ref: "linear" },
    { id: "b07", kind: "text", q: "二分探索で、探す値が「ない」とわかるのはいつ?",
      choices: ["low が high をこえて、調べる範囲がなくなったとき", "mid が 0 になったとき", "配列の最後の要素を調べたとき", "1回目に調べた値がちがったとき"],
      explain: "範囲をしぼっていき、low > high になったら、値が入りうる場所がもう残っていません。そこで「ない」と判断します。", ref: "binary" },
    { id: "b08", kind: "code", q: "二分探索で low = 3、high = 8 のとき、次に調べる添字 mid は?(mid = ⌊(low+high)/2⌋)",
      choices: ["5", "6", "5.5", "4"],
      explain: "(3 + 8) ÷ 2 = 5.5 で、⌊ ⌋ は小数点以下を切り捨てる記号なので 5 です。添字は整数でなければならないので、切り捨てます。", ref: "binary" },
    { id: "b09", kind: "text", q: "小さい順に並んだ配列の二分探索で、`a[mid] < x`(調べた値が探す値より小さい)だったら、次にどうする?",
      choices: ["low を mid+1 にする(右側を調べる)", "high を mid−1 にする(左側を調べる)", "low を mid にする", "探索を終える"],
      explain: "a[mid] が x より小さければ、x はそれより右にあるはずです。mid 自身はもう調べたので、low = mid+1 にして右側にしぼります。", ref: "binary" },
    { id: "b10", kind: "text", q: "線形探索で、調べる回数が1回ですむのはどんなとき?",
      choices: ["探す値が先頭にあるとき", "探す値が末尾にあるとき", "探す値が真ん中にあるとき", "配列が整列済みのとき"],
      explain: "線形探索は先頭から調べるので、先頭にあれば1回で見つかります(最良 O(1))。末尾にあるときやないときが最悪です。", ref: "linear" }
  ];

  FIXED["bfs"] = [
    { id: "q01", kind: "text", q: "幅優先探索(BFS)で、次に調べるノードを管理するのに使うものは?",
      choices: ["キュー(先に入れたものから取り出す)", "スタック(あとに入れたものから取り出す)", "整列済みの配列", "乱数"],
      explain: "BFS はキューを使います。先に見つけた(開始点に近い)ノードから順に取り出すので、近い順に広がっていきます。", ref: "bfs" },
    { id: "q02", kind: "text", q: "キューに 3, 5, 2 の順に入れてから1つ取り出すと、取り出されるのは?",
      choices: ["3(最初に入れたもの)", "2(最後に入れたもの)", "2(いちばん小さいもの)", "5(真ん中のもの)"],
      explain: "キューは「先入れ先出し(FIFO)」です。お店の行列と同じで、先に並んだ人から出ていきます。", ref: "bfs" },
    { id: "q03", kind: "code", q: "ノードの数を V、辺の数を E とすると、BFS の計算量は?",
      choices: ["O(V + E)", "O(V × E)", "O(E²)", "O(log V)"],
      explain: "BFS は、すべてのノードを1回ずつ取り出し、そのとなり(辺)を1回ずつ調べます。だから手間はノードの数と辺の数の合計に比例して O(V + E) です。", ref: "bfs" },
    { id: "q04", kind: "text", q: "辺に長さ(重み)のないグラフで、BFS を使うとわかることは?",
      choices: ["開始点から各ノードまで、通る辺の数がいちばん少ない経路", "開始点から各ノードまでの、いちばん長い経路", "すべての経路の数", "辺の長さの合計が最小の経路(重みつき)"],
      explain: "BFS は開始点に近い順(通る辺の数が少ない順)に訪問するので、最初にたどりついた経路が、辺の数が最少の経路です。", ref: "bfs" },
    { id: "q05", kind: "text", q: "BFS で、ノードに「訪問済み」の印をつけるのはなぜ?",
      choices: ["同じノードを何度もキューに入れないため(輪があると終わらなくなる)", "ノードを番号順に並べるため", "辺の数を数えるため", "キューを速くするため"],
      explain: "輪(ループ)のあるグラフでは、印がないと同じノードに何度も戻ってきて、いつまでも終わりません。印があれば、各ノードは1回だけキューに入ります。", ref: "bfs" },
    { id: "q06", kind: "text", q: "開始点からどの辺をたどっても行けないノードは、BFS でどうなる?",
      choices: ["訪問されない", "最後に訪問される", "最初に訪問される", "エラーになって止まる"],
      explain: "BFS は辺をたどって広がるので、つながっていない部分には届きません。可視化ページのプリセット「つながっていない部分あり」で確かめられます。", ref: "bfs" },
    { id: "q07", kind: "text", q: "BFS の訪問順の特徴は?",
      choices: ["開始点から近い(通る辺の数が少ない)ノードから順に訪問する", "番号の小さいノードから順に訪問する", "開始点から遠いノードから順に訪問する", "行けるところまで深く進んでから戻る"],
      explain: "距離1のノードをすべて訪問してから距離2、その次に距離3…と、同心円のように広がります。「深く進んでから戻る」のは DFS です。", ref: "bfs" },
    { id: "q08", kind: "text", q: "迷路(1マス進むのはどこでも同じ手間)で、スタートからゴールまでの最少の手数を求めるのに向いているのは?",
      choices: ["幅優先探索(BFS)", "深さ優先探索(DFS)", "二分探索", "バブルソート"],
      explain: "マスをノード、となりどうしを辺と考えると、最少の手数は「通る辺の数が最少の経路」です。これは BFS で求められます。DFS で見つかる道は、最短とは限りません。", ref: "bfs" },
    { id: "q09", kind: "text", q: "BFS で、開始点から距離2(辺2本)のノードを訪問し始めるのはいつ?",
      choices: ["距離1のノードをすべて訪問したあと", "開始点のすぐあと", "距離3のノードを訪問したあと", "番号が2のノードを訪問したあと"],
      explain: "キューには距離0 → 距離1 → 距離2 … の順に入るので、距離1のノードをすべて取り出してから、距離2のノードが取り出されます。", ref: "bfs" },
    { id: "q10", kind: "text", q: "辺ごとに長さ(重み)がちがう道路の地図で、長さの合計が最短の道を求めたい。BFS について正しいのは?",
      choices: ["BFS は辺の本数しか考えないので、ダイクストラ法など別の方法が必要", "BFS でそのまま求められる", "DFS にすれば求められる", "二分探索で求められる"],
      explain: "BFS が最短にするのは「辺の本数」です。長さのちがう辺があると、本数が少なくても合計が長いことがあります。重みつきの最短経路にはダイクストラ法などを使います。", ref: "bfs" }
  ];

  FIXED["dfs"] = [
    { id: "d01", kind: "text", q: "深さ優先探索(DFS)の進み方として正しいのは?",
      choices: ["行けるところまで深く進み、行き止まりになったら戻って別の道へ進む", "開始点から近いノードから順に広げていく", "番号の小さいノードから順に訪問する", "ランダムにノードを選んで訪問する"],
      explain: "DFS は、まだ行っていないとなりがあれば、すぐそちらへ進みます。行き止まりで1つ前に戻り、残りの道を調べます。迷路で「右手を壁につけて進む」のに似ています。", ref: "dfs" },
    { id: "d02", kind: "text", q: "再帰で書いた DFS で、「どこへ戻ればよいか」を覚えているものは?",
      choices: ["呼び出しスタック(あとに呼んだものから終わる)", "キュー(先に入れたものから取り出す)", "整列済みの配列", "訪問順のリスト"],
      explain: "dfs(v) の中で dfs(w) を呼ぶと、w の処理が終わったら v に戻ってきます。この「呼び出しの重なり」が呼び出しスタックです。", ref: "dfs" },
    { id: "d03", kind: "text", q: "スタックに 3, 5, 2 の順に入れてから1つ取り出すと、取り出されるのは?",
      choices: ["2(最後に入れたもの)", "3(最初に入れたもの)", "5(真ん中のもの)", "5(いちばん大きいもの)"],
      explain: "スタックは「後入れ先出し(LIFO)」です。積み重ねたお皿を上から取るのと同じで、最後に入れたものが最初に出ます。", ref: "dfs" },
    { id: "d04", kind: "code", q: "ノードの数を V、辺の数を E とすると、DFS の計算量は?",
      choices: ["O(V + E)", "O(V × E)", "O(V²E)", "O(log V)"],
      explain: "DFS も、各ノードを1回ずつ訪問し、各辺を(両方向から)1回ずつ調べます。だから BFS と同じ O(V + E) です。", ref: "dfs" },
    { id: "d05", kind: "text", q: "DFS について正しいのは?",
      choices: ["開始点からたどった道が、辺の数の最少の経路になるとは限らない", "開始点からの最短経路(辺の数が最少)が必ず求まる", "BFS より必ず速く終わる", "輪のあるグラフでは使えない"],
      explain: "DFS は深く進むので、遠回りしてたどりつくことがあります。辺の数が最少の経路がほしいときは BFS を使います。", ref: "dfs" },
    { id: "d06", kind: "text", q: "DFS で「訪問済み」の印をつけないと、輪のあるグラフではどうなる?",
      choices: ["同じノードの間を行ったり来たりして、いつまでも終わらない", "訪問順が番号順になる", "BFS と同じ順番になる", "何も変わらない"],
      explain: "輪があると、たどっていくうちに前に通ったノードへ戻ってきます。印がないとまたそこから進んでしまい、終わりません。", ref: "dfs" },
    { id: "d07", kind: "text", q: "dfs(v) の中で dfs(w) を呼び、dfs(w) が終わったら、次に何をする?",
      choices: ["v に戻って、v の残りのとなりを調べる", "開始点に戻ってやり直す", "w のとなりをもう一度調べる", "探索全体を終える"],
      explain: "呼び出しスタックの一番上が w から v に戻ります。v のとなりで、まだ調べていないものを番号の小さい順に続けて調べます。", ref: "dfs" },
    { id: "d08", kind: "text", q: "再帰を使わずに、ループで DFS を書くとき、キューの代わりに使うものは?",
      choices: ["スタック", "キュー", "整列済みの配列", "二分探索"],
      explain: "あとから見つけたノードを先に調べると、深く進んでいく動きになります。キューをスタックに取りかえると、BFS が DFS のような順番になります。", ref: "dfs" },
    { id: "d09", kind: "text", q: "ある開始点から DFS をしたら、すべてのノードを訪問できた。グラフについてわかることは?",
      choices: ["開始点からすべてのノードへ、辺をたどって行ける", "グラフに輪がない", "グラフが木である", "辺の数とノードの数が同じ"],
      explain: "DFS(BFS も)は、開始点から辺をたどって行けるノードをすべて訪問します。全部訪問できたなら、グラフ全体がつながっています。", ref: "dfs" },
    { id: "d10", kind: "text", q: "DFS の呼び出しスタックが最も深くなりやすいのは、どんなグラフ?",
      choices: ["ノードが一直線に長くつながったグラフ", "開始点がすべてのノードと直接つながったグラフ", "ノードが2つだけのグラフ", "辺が1本もないグラフ"],
      explain: "一直線だと、dfs(1) → dfs(2) → dfs(3) → … と戻らずに呼び続けるので、スタックの深さがノードの数と同じになります。", ref: "dfs" },
    { id: "d11", kind: "text", q: "同じグラフ・同じ開始点で BFS と DFS をしたとき、必ず言えることは?",
      choices: ["どちらも、開始点が1番目に訪問される", "訪問順はいつも同じになる", "DFS の訪問順はいつも番号順になる", "BFS のほうが訪問するノードが多い"],
      explain: "どちらも開始点から始めます。そのあとの順番は、木の形や輪によって同じになることも、ちがうこともあります。訪問するノード(開始点から行けるノード)の集まりは同じです。", ref: "dfs" }
  ];

  // ---------- 自動生成の問題 ----------
  function V() { return AlgoViz; }
  function ri(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function arrStr(a) { return "[" + a.join(", ") + "]"; }
  function orderStr(a) { return a.join(" → "); }
  function listStr(a) { return a.length ? a.join(", ") : "(空)"; }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  // 誤答の候補から、正解とも、ほかの誤答とも重ならないものを3つ選ぶ。足りなければ null
  function distract(correct, cands) {
    var out = [], seen = {};
    seen[correct] = true;
    cands.forEach(function (c) {
      if (c === null || c === undefined) return;
      c = String(c);
      if (out.length < 3 && !seen[c]) { seen[c] = true; out.push(c); }
    });
    return out.length === 3 ? [String(correct)].concat(out) : null;
  }
  function make(id, kind, q, choices, explain, ref, fig) {
    if (!choices) return null;
    var o = { id: id, kind: kind, q: q, choices: choices, explain: explain, ref: ref };
    if (fig) o.fig = fig;
    return o;
  }
  // 1つの値を動かした配列(誤答用)
  function moveMax(a) {
    var m = Math.max.apply(null, a), b = a.filter(function (x) { return x !== m; });
    b.push(m);
    return b;
  }
  function sortedCopy(a) { return a.slice().sort(function (x, y) { return x - y; }); }

  // ----- 計算量 -----
  function genLog2() {
    var k = ri(3, 20), n = Math.pow(2, k);
    var choices = distract(String(k), [k + 1, k - 1, 2 * k, num(n / 2)]);
    return make("gen-log2", "code", "n = " + num(n) + " のとき、log₂ n はいくつ?(2を何回かけると n になるか)", choices,
      "2 を " + k + " 回かけると " + num(n) + " になるので、log₂ " + num(n) + " = " + k + " です。二分探索なら、" + num(n) + " 個でも " + (k + 1) + " 回ほど調べれば終わります。", "complexity");
  }
  var LOOPS = [
    { id: "square", text: "count ← 0\nfor i ← 0 … n−1\n  for j ← 0 … n−1\n    count ← count + 1",
      run: function (n) { var c = 0; for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) c++; return c; },
      why: function (n) { return "外側 n 回 × 内側 n 回で n² = " + num(n * n) + " 回です(O(n²))。"; } },
    { id: "tri", text: "count ← 0\nfor i ← 0 … n−1\n  for j ← i+1 … n−1\n    count ← count + 1",
      run: function (n) { var c = 0; for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) c++; return c; },
      why: function (n) { return "i = 0 のとき内側は n−1 回、i = 1 で n−2 回、…と1回ずつ減るので、(n−1) + … + 1 + 0 = n(n−1)/2 = " + num(n * (n - 1) / 2) + " 回です。それでも増え方は O(n²) です。"; } },
    { id: "seq", text: "count ← 0\nfor i ← 0 … n−1\n  count ← count + 1\nfor j ← 0 … n−1\n  count ← count + 1",
      run: function (n) { var c = 0, i; for (i = 0; i < n; i++) c++; for (i = 0; i < n; i++) c++; return c; },
      why: function (n) { return "入れ子ではなく順に並んだループなので、n + n = 2n = " + num(2 * n) + " 回です(O(n))。"; } },
    { id: "half", text: "count ← 0\ni ← n\nwhile i > 1\n  i ← ⌊i / 2⌋\n  count ← count + 1", pow2: true,
      run: function (n) { var c = 0, i = n; while (i > 1) { i = Math.floor(i / 2); c++; } return c; },
      why: function (n) { return "i は " + n + " → " + Math.floor(n / 2) + " → … と半分になり、1 になるまで log₂ n = " + Math.round(Math.log(n) / Math.LN2) + " 回まわります(O(log n))。"; } }
  ];
  function genLoopCount() {
    var L = pick(LOOPS);
    var n = L.pow2 ? pick([16, 32, 64, 128, 1024]) : pick([8, 10, 12, 16, 20, 50, 100]);
    var ans = L.run(n);
    var lg = Math.round(Math.log(n) / Math.LN2);
    var cands = [n * n, n * (n - 1) / 2, n * (n + 1) / 2, 2 * n, n, lg, n * lg, n / 2].map(num);
    var choices = distract(num(ans), AlgoViz.shuffle(cands));
    return make("gen-loop-" + L.id, "code", "n = " + n + " のとき、次の処理が終わったあとの count の値は?", choices,
      L.why(n) + "(ループの入れ子はかけ算、順に並んだループは足し算、半分にし続けるループは log。)", "complexity", { type: "code", text: L.text });
  }
  function genGrowth() {
    var k = pick([2, 3, 4, 10]);
    var kinds = [
      { o: "O(n)", f: function (k) { return k; }, why: function (k, a) { return "手間が n に比例して増えます。だから n が " + k + " 倍なら、手間も " + a + " 倍です。"; } },
      { o: "O(n²)", f: function (k) { return k * k; }, why: function (k, a) { return "手間が n² に比例して増えます。だから n が " + k + " 倍なら、手間は " + k + " × " + k + " = " + a + " 倍です。"; } },
      { o: "O(1)", f: function () { return 1; }, why: function (k) { return "手間が n に関係なく一定です。だから n が " + k + " 倍になっても、手間は変わりません(1倍)。"; } }
    ];
    var t = pick(kinds), ans = t.f(k);
    var choices = distract(ans + "倍", [k * k + "倍", k + "倍", 2 * k + "倍", k * k * k + "倍", "1倍"]);
    return make("gen-growth", "code", t.o + " の処理で、n を " + k + " 倍にすると、手間はおよそ何倍になる?", choices,
      t.o + " の処理では、" + t.why(k, ans) + "(O(n) なら " + k + " 倍、O(n²) なら " + (k * k) + " 倍、O(1) なら変わりません。)", "complexity");
  }

  // ----- 基本ソート -----
  function swapsText(sw) { return sw.length ? sw.map(function (p) { return p[0] + "↔" + p[1]; }).join("、") : "なし"; }
  function genBubblePass() {
    var n = ri(6, 7), a = V().randomDistinct(n), k = ri(1, 2);
    var passes = V().eventsOf(V().sortSteps("bubble", a), "passEnd");
    if (passes.length < k + 1) return null;
    var correct = arrStr(passes[k - 1].vals);
    var sel = V().eventsOf(V().sortSteps("selection", a), "round"), ins = V().eventsOf(V().sortSteps("insertion", a), "round");
    var cands = [arrStr(passes[k].vals), k >= 2 ? arrStr(passes[k - 2].vals) : arrStr(moveMax(a)), arrStr(sel[k - 1].vals), arrStr(ins[k - 1].vals), arrStr(a), arrStr(sortedCopy(a))];
    var trace = passes.slice(0, k).map(function (p) { return p.info.pass + "パス目(交換: " + swapsText(p.info.swaps) + ")→ " + arrStr(p.vals); }).join("。");
    return make("gen-bubble-pass", "arr", "次の配列をバブルソートで小さい順に並べます。" + k + "パス目が終わったときの配列は?(1パス = 左端から右へ、となりどうしを1回ずつ比べる)",
      distract(correct, cands),
      "となりどうしを比べて、左が大きければ交換します。" + trace + "。1パスごとに、残りの最大値が右端で確定します。", "bubble", { type: "array", arr: a });
  }
  function genSelectionRound() {
    var n = ri(6, 7), a = V().randomDistinct(n), k = ri(1, 3);
    var rounds = V().eventsOf(V().sortSteps("selection", a), "round");
    var correct = arrStr(rounds[k - 1].vals);
    var bub = V().eventsOf(V().sortSteps("bubble", a), "passEnd"), ins = V().eventsOf(V().sortSteps("insertion", a), "round");
    var cands = [arrStr(rounds[k].vals), k >= 2 ? arrStr(rounds[k - 2].vals) : arrStr(a), bub[k - 1] ? arrStr(bub[k - 1].vals) : null, arrStr(ins[k - 1].vals), arrStr(ins[k].vals), arrStr(sortedCopy(a))];
    var trace = rounds.slice(0, k).map(function (r) {
      var i = r.info;
      return "添字" + i.from + ": 最小は " + i.value + (i.swapped ? "(" + i.other + " と交換)" : "(交換なし)") + " → " + arrStr(r.vals);
    }).join("。");
    return make("gen-selection-round", "arr", "次の配列を選択ソートで小さい順に並べます。先頭から " + k + " つの位置が決まったときの配列は?",
      distract(correct, cands),
      "未整列の部分の最小値を、未整列の部分の先頭と交換します。" + trace + "。", "selection", { type: "array", arr: a });
  }
  function genInsertionRound() {
    var n = ri(6, 7), a = V().randomDistinct(n), k = ri(2, 4);
    var rounds = V().eventsOf(V().sortSteps("insertion", a), "round");
    var correct = arrStr(rounds[k - 1].vals);
    var bub = V().eventsOf(V().sortSteps("bubble", a), "passEnd"), sel = V().eventsOf(V().sortSteps("selection", a), "round");
    var cands = [arrStr(rounds[k].vals), arrStr(rounds[k - 2].vals), arrStr(sel[k - 1].vals), bub[k - 1] ? arrStr(bub[k - 1].vals) : null, arrStr(sel[k].vals), arrStr(sortedCopy(a))];
    var trace = rounds.slice(0, k).map(function (r) {
      var i = r.info;
      return i.key + " を添字" + i.pos + "へ" + (i.shifted.length ? "(" + i.shifted.join("・") + " をずらす)" : "(そのまま)");
    }).join(" → ");
    return make("gen-insertion-round", "arr", "次の配列を挿入ソートで小さい順に並べます。添字 " + k + " の値(" + a[k] + ")を、左の整列済みの部分に入れ終わったときの配列は?",
      distract(correct, cands),
      "添字1から順に、左の整列済みの部分の正しい位置へ入れます。" + trace + "。このとき添字 0〜" + k + " が整列済みで、右側はまだ元のままです。", "insertion", { type: "array", arr: a });
  }
  function genBubbleSwaps() {
    var n = ri(5, 6), a = V().randomDistinct(n);
    var passes = V().eventsOf(V().sortSteps("bubble", a), "passEnd");
    var c = passes[0].info.swaps.length;
    var choices = distract(c + "回", [(c + 1) + "回", (c - 1 >= 0 ? (c - 1) + "回" : null), (n - 1) + "回", (c + 2) + "回", n + "回"]);
    return make("gen-bubble-swaps", "code", "次の配列をバブルソートで小さい順に並べます。1パス目で、交換は何回起きる?", choices,
      "1パス目は添字0〜" + (n - 1) + "の範囲で、となりどうしを " + (n - 1) + " 回比べます。交換するのは " + swapsText(passes[0].info.swaps) + " の " + c + " 回で、結果は " + arrStr(passes[0].vals) + " です。", "bubble", { type: "array", arr: a });
  }

  // ----- 速いソート -----
  function genQuickPartition() {
    var n = 7, a = V().randomDistinct(n);
    var p = V().eventsOf(V().sortSteps("quick", a), "partition")[0];
    var idx = p.info.index;
    if (idx === 0 || idx === n - 1) return null;
    var correct = arrStr(p.vals);
    var pv = p.info.pivot;
    var less = a.slice(0, n - 1).filter(function (x) { return x < pv; }), more = a.slice(0, n - 1).filter(function (x) { return x > pv; });
    var stable = less.concat([pv], more);
    var noFinal = p.vals.slice(); noFinal[idx] = p.vals[n - 1]; noFinal[n - 1] = p.vals[idx];
    var bigFirst = more.concat([pv], less);
    var cands = [arrStr(stable), arrStr(noFinal), arrStr(sortedCopy(a)), arrStr(bigFirst)];
    return make("gen-quick-partition", "arr", "次の配列をクイックソート(ピボットは末尾、Lomuto 方式)で並べます。最初の分割が終わったときの配列は?",
      distract(correct, cands),
      "ピボットは末尾の " + pv + "。左から順に " + pv + " より小さい値(" + p.info.moved.join("・") + ")を、前から順に交換で集めます。最後にピボットを添字 " + idx + " の値と交換して " + correct + "。" + pv + " は添字 " + idx + " で確定し、左は小さい値、右は大きい値になります(左右の中の順番は、交換の結果しだいでばらばらです)。", "quick", { type: "array", arr: a });
  }
  function genQuickPivotIndex() {
    var n = ri(6, 8), a = V().randomDistinct(n);
    var p = V().eventsOf(V().sortSteps("quick", a), "partition")[0];
    var idx = p.info.index, pv = p.info.pivot;
    var cands = [n - 1, idx + 1, idx - 1, n - 1 - idx, Math.floor((n - 1) / 2), 0].filter(function (x) { return x >= 0 && x < n; }).map(function (x) { return "添字 " + x; });
    return make("gen-quick-pivot", "code", "次の配列をクイックソート(ピボットは末尾)で並べます。最初の分割が終わったとき、ピボットの " + pv + " は添字いくつに入る?",
      distract("添字 " + idx, cands),
      pv + " より小さい値は " + (p.info.moved.length ? p.info.moved.join("・") : "なし") + " の " + idx + " 個です。小さい値がすべて左に集まり、そのすぐ右にピボットが入るので、添字 " + idx + " です。分割後は " + arrStr(p.vals) + "。", "quick", { type: "array", arr: a });
  }
  function genMergeLast() {
    var n = ri(7, 8), a = V().randomDistinct(n);
    var merges = V().eventsOf(V().sortSteps("merge", a), "merge");
    var last = merges[merges.length - 1].info;
    var correct = arrStr(last.left) + " と " + arrStr(last.right);
    var mid = last.mid, s = sortedCopy(a);
    var cands = [
      arrStr(a.slice(0, mid + 1)) + " と " + arrStr(a.slice(mid + 1)),
      arrStr(s.slice(0, mid + 1)) + " と " + arrStr(s.slice(mid + 1)),
      arrStr(sortedCopy(a.slice(0, mid))) + " と " + arrStr(sortedCopy(a.slice(mid))),
      arrStr(sortedCopy(a.slice(0, mid + 2))) + " と " + arrStr(sortedCopy(a.slice(mid + 2))),
      arrStr(last.right) + " と " + arrStr(last.left)
    ];
    return make("gen-merge-last", "arr", "次の配列をマージソートで並べます。最後に合わせる(マージする)2つの列は?(mid = ⌊(0+" + (n - 1) + ")/2⌋ = " + mid + "、左は添字 0〜mid)",
      distract(correct, cands),
      "最初に添字 0〜" + mid + " と " + (mid + 1) + "〜" + (n - 1) + " に分けます。それぞれをマージソートで整列してから、最後に合わせます。左 " + arrStr(a.slice(0, mid + 1)) + " を整列して " + arrStr(last.left) + "、右 " + arrStr(a.slice(mid + 1)) + " を整列して " + arrStr(last.right) + "。", "merge", { type: "array", arr: a });
  }

  // ----- 探索 -----
  function probesOf(arr, x, algo) { return V().eventsOf(V().searchSteps(algo, arr, x), "probe"); }
  function binTrace(ps, x) {
    return ps.map(function (p, i) {
      var f = p.info;
      return (i + 1) + "回目 low=" + f.low + "・high=" + f.high + " → mid=" + f.mid + "、a[" + f.mid + "]=" + f.value + (f.value === x ? "(見つかった)" : f.value < x ? "(" + x + " より小さい → 右へ)" : "(" + x + " より大きい → 左へ)");
    }).join("。");
  }
  function genBinarySecond() {
    var n = ri(9, 15), arr = V().makeSearchData(n), x = pick(arr);
    var ps = probesOf(arr, x, "binary");
    if (ps.length < 3) return null;
    var p1 = ps[0].info, p2 = ps[1].info;
    // 誤答: 1回目の値、3回目の値、反対側に進んだ場合、切り上げで mid を求めた場合
    var other = p1.value < x ? Math.floor((p1.low + p1.mid - 1) / 2) : Math.floor((p1.mid + 1 + p1.high) / 2);
    var ceilMid = Math.ceil((p2.low + p2.high) / 2);
    var cands = [arr[ceilMid], arr[other], ps[2].info.value, p1.value, arr[p2.mid + 1], arr[p2.mid - 1]];
    return make("gen-binary-second", "code", "整列済みの次の配列から、二分探索で " + x + " を探します(mid = ⌊(low+high)/2⌋)。2回目に調べる値は?",
      distract(String(p2.value), cands),
      binTrace(ps, x) + "。", "binary", { type: "array", arr: arr });
  }
  function genBinaryCount() {
    var n = ri(9, 15), arr = V().makeSearchData(n), x = pick(arr);
    var c = probesOf(arr, x, "binary").length, lin = arr.indexOf(x) + 1;
    var choices = distract(c + "回", [lin + "回", (c + 1) + "回", c > 1 ? (c - 1) + "回" : null, (c + 2) + "回", n + "回"]);
    return make("gen-binary-count", "code", "整列済みの次の配列から、二分探索で " + x + " を探します(mid = ⌊(low+high)/2⌋)。見つかるまでに、値を何回調べる?", choices,
      binTrace(probesOf(arr, x, "binary"), x) + "。だから " + c + " 回です(線形探索なら " + lin + " 回)。", "binary", { type: "array", arr: arr });
  }
  function genBinaryMiss() {
    var n = ri(9, 15), arr = V().makeSearchData(n);
    var absent = V().range(arr[0] + 1, arr[n - 1] - 1).filter(function (v) { return arr.indexOf(v) < 0; });
    if (!absent.length) return null;
    var x = pick(absent), ps = probesOf(arr, x, "binary"), c = ps.length;
    var choices = distract(c + "回", [n + "回", (c + 1) + "回", (c - 1) + "回", (c + 2) + "回", "0回"]);
    return make("gen-binary-miss", "code", "整列済みの次の配列から、二分探索で " + x + " を探します(mid = ⌊(low+high)/2⌋)。" + x + " は配列にありません。「ない」とわかるまでに、値を何回調べる?", choices,
      binTrace(ps, x) + "。ここで low が high をこえて範囲がなくなるので、" + c + " 回で「ない」とわかります。", "binary", { type: "array", arr: arr });
  }
  function genLinearCount() {
    var n = ri(9, 14), arr = V().makeSearchData(n), i = ri(2, n - 1), x = arr[i];
    var c = probesOf(arr, x, "linear").length, b = probesOf(arr, x, "binary").length;
    var choices = distract(c + "回", [b + "回", i + "回", (c + 1) + "回", n + "回"]);
    return make("gen-linear-count", "code", "次の配列から、線形探索(先頭から1つずつ)で " + x + " を探します。見つかるまでに、値を何回調べる?", choices,
      x + " は添字 " + i + " にあるので、a[0] から a[" + i + "] まで " + c + " 回調べて見つかります(添字は0から数えるので、添字+1回)。同じ配列で二分探索なら " + b + " 回です。", "linear", { type: "array", arr: arr });
  }

  // ----- グラフ -----
  function pickGraph() {
    var g = Math.random() < 0.4 ? V().preset(pick(["tree", "cycle", "grid"])) : V().randomGraph();
    var ids = g.nodes.map(function (n) { return n.id; });
    return { graph: g, start: pick(ids) };
  }
  function endInfo(steps) { return V().eventsOf(steps, "end")[0].info; }
  function graphFig(G) { return { type: "graph", graph: G.graph, start: G.start }; }
  var NB = "となりのノードは番号の小さい順に調べます。";
  function bfsTrace(steps) {
    return V().eventsOf(steps, "expand").map(function (e) { return e.info.node + " を取り出す → キュー [" + e.info.queue.join(", ") + "]"; }).join("、");
  }
  function genOrder(algo) {
    var G = pickGraph(), g = G.graph, s = G.start;
    var main = endInfo(V().graphSteps(algo, g, s)).order;
    if (main.length < 5) return null;
    var other = endInfo(V().graphSteps(algo === "bfs" ? "dfs" : "bfs", g, s)).order;
    var rev = endInfo(V().graphSteps(algo, g, s, true)).order;
    var byNum = [s].concat(main.filter(function (x) { return x !== s; }).sort(function (x, y) { return x - y; }));
    var sw = main.slice(); var t = sw[2]; sw[2] = sw[3]; sw[3] = t;
    var cands = [orderStr(other), orderStr(rev), orderStr(byNum), orderStr(sw)];
    var name = algo === "bfs" ? "幅優先探索(BFS)" : "深さ優先探索(DFS)";
    var how = algo === "bfs" ? "キューを使って開始点に近い順に訪問します。" + bfsTrace(V().graphSteps("bfs", g, s)) + "。"
      : "行けるところまで深く進み、行き止まりで戻ります。";
    return make("gen-" + algo + "-order", "arr", "ノード " + s + " から" + name + "をすると、訪問順は?(" + NB + ")",
      distract(orderStr(main), cands),
      how + "訪問順は " + orderStr(main) + "。" + (algo === "bfs" ? "DFS なら " : "BFS なら ") + orderStr(other) + " です。", algo, graphFig(G));
  }
  function genKth(algo) {
    var G = pickGraph(), g = G.graph, s = G.start;
    var main = endInfo(V().graphSteps(algo, g, s)).order;
    if (main.length < 5) return null;
    var k = ri(3, Math.min(5, main.length - 1));
    var other = endInfo(V().graphSteps(algo === "bfs" ? "dfs" : "bfs", g, s)).order;
    var rev = endInfo(V().graphSteps(algo, g, s, true)).order;
    var cands = [other[k - 1], rev[k - 1], main[k], main[k - 2], main[k + 1]].map(function (x) { return x === undefined ? null : "ノード " + x; });
    var name = algo === "bfs" ? "BFS" : "DFS";
    return make("gen-" + algo + "-kth", "code", "ノード " + s + " から " + name + " をすると、" + k + " 番目に訪問するノードは?(開始点が1番目。" + NB + ")",
      distract("ノード " + main[k - 1], cands),
      "訪問順は " + orderStr(main) + " なので、" + k + " 番目は " + main[k - 1] + " です。" + (algo === "bfs" ? "(DFS なら " : "(BFS なら ") + orderStr(other) + ")", algo, graphFig(G));
  }
  function genBfsQueue() {
    var G = pickGraph(), g = G.graph, s = G.start;
    var steps = V().graphSteps("bfs", g, s);
    var ex = V().eventsOf(steps, "expand");
    var ok = [];
    for (var m = 1; m < ex.length - 1; m++) if (ex[m].info.queue.length >= 2) ok.push(m);
    if (!ok.length) return null;
    m = pick(ok);
    var e = ex[m].info, q = e.queue;
    var dfsSt = V().eventsOf(V().graphSteps("dfs", g, s), "call");
    var cands = [listStr(ex[m - 1].info.queue), listStr(ex[m + 1].info.queue), listStr(q.slice().reverse()), listStr([e.node].concat(q)),
      dfsSt[m + 1] ? listStr(dfsSt[m + 1].info.stack) : null, listStr(q.slice(1))];
    return make("gen-bfs-queue", "arr", "ノード " + s + " から BFS をします。ノード " + e.node + " をキューから取り出し、そのとなりを調べ終えたとき、キューの中身は?(左が先頭 = 次に取り出すもの。" + NB + ")",
      distract(listStr(q), cands),
      "取り出す順に追うと: " + bfsTrace(steps) + "。" + e.node + " を取り出したあとのキューは [" + q.join(", ") + "] です。", "bfs", graphFig(G));
  }
  function genBfsDist() {
    var G = pickGraph(), g = G.graph, s = G.start;
    var info = endInfo(V().graphSteps("bfs", g, s));
    var far = info.order.filter(function (v) { return info.dist[v] >= 2; });
    if (!far.length) return null;
    var t = pick(far), d = info.dist[t];
    var dd = endInfo(V().graphSteps("dfs", g, s)).depth[t];
    var path = [t];
    while (info.parent[path[0]] !== undefined) path.unshift(info.parent[path[0]]);
    var choices = distract("辺 " + d + " 本", ["辺 " + dd + " 本", "辺 " + (d + 1) + " 本", "辺 " + (d - 1) + " 本", "辺 " + (d + 2) + " 本", "辺 " + info.order.indexOf(t) + " 本"]);
    return make("gen-bfs-dist", "code", "ノード " + s + " からノード " + t + " まで、通る辺の数がいちばん少ない経路は、辺を何本通る?", choices,
      s + " から BFS をすると、近い順(辺の数が少ない順)に訪問します。" + t + " へは " + path.join(" − ") + " の " + d + " 本で行けて、これより少ない経路はありません。" + (dd !== d ? "(DFS でたどった道だと " + dd + " 本になり、最少とは限りません。)" : ""), "bfs", graphFig(G));
  }
  function genDfsStack() {
    var G = pickGraph(), g = G.graph, s = G.start;
    var calls = V().eventsOf(V().graphSteps("dfs", g, s), "call");
    var order = endInfo(V().graphSteps("dfs", g, s)).order;
    var ok = [];
    for (var m = 2; m < calls.length; m++) {
      var st = calls[m].info.stack;
      if (st.length >= 2 && listStr(st) !== listStr(order.slice(0, m + 1))) ok.push(m);
    }
    if (!ok.length) return null;
    m = pick(ok);
    var c = calls[m].info, stack = c.stack;
    var bfsEx = V().eventsOf(V().graphSteps("bfs", g, s), "expand");
    var cands = [listStr(order.slice(0, m + 1)), listStr(stack.slice().reverse()), listStr(calls[m - 1].info.stack),
      bfsEx[m - 1] ? listStr(bfsEx[m - 1].info.queue) : null, listStr(stack.slice(1))];
    return make("gen-dfs-stack", "arr", "ノード " + s + " から DFS(再帰)をします。dfs(" + c.node + ") が呼ばれた直後、呼び出しスタックに積まれているのは?(左が一番下 = 最初に呼んだもの、右が一番上。" + NB + ")",
      distract(listStr(stack), cands),
      "訪問順は " + orderStr(order) + "。dfs(" + c.node + ") が呼ばれた時点では、行き止まりで戻った dfs はもう終わっていて、スタックに残るのは開始点から " + c.node + " までたどってきた道 " + stack.join(" → ") + " だけです。訪問順(" + listStr(order.slice(0, m + 1)) + ")とはちがいます。", "dfs", graphFig(G));
  }

  var GENS = {
    "complexity": [genLog2, genLoopCount, genGrowth],
    "simple-sort": [genBubblePass, genSelectionRound, genInsertionRound, genBubbleSwaps],
    "fast-sort": [genQuickPartition, genQuickPivotIndex, genMergeLast],
    "search": [genBinarySecond, genBinaryCount, genBinaryMiss, genLinearCount],
    "bfs": [function () { return genOrder("bfs"); }, function () { return genKth("bfs"); }, genBfsQueue, genBfsDist],
    "dfs": [function () { return genOrder("dfs"); }, function () { return genKth("dfs"); }, genDfsStack]
  };

  // ---------- 問題の確かめ ----------
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がない"];
    if (typeof q.q !== "string" || !q.q) errs.push("問題文がない");
    if (KINDS.indexOf(q.kind) < 0) errs.push("kind がおかしい: " + q.kind);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) errs.push("選択肢が4つではない");
    else {
      var seen = {};
      q.choices.forEach(function (c) {
        if (typeof c !== "string" || !c) errs.push("選択肢が空");
        else if (seen[c]) errs.push("選択肢が重なっている: " + c);
        seen[c] = true;
      });
    }
    if (typeof q.explain !== "string" || !q.explain) errs.push("解説がない");
    if (REFS.indexOf(q.ref) < 0) errs.push("ref がおかしい: " + q.ref);
    return errs;
  }
  // 自動生成: うまく作れなかったら作り直す(最大 50 回)
  function generate(fn) {
    for (var t = 0; t < 50; t++) {
      var q = null;
      try { q = fn(); } catch (e) { q = null; }
      if (q && checkQuestion(q).length === 0) return q;
    }
    return null;
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
  function fixedOf(id) { return (FIXED[id] || []).filter(function (q) { return checkQuestion(q).length === 0; }); }
  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId, id: q.id, q: q.q, kind: q.kind, fig: q.fig || null,
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(0), canonical: q.choices[0],
      explain: q.explain, ref: q.ref
    };
  }
  // 単元ごとの出題の候補: 固定の問題 + 自動生成(1種類につき2回分)をまぜる
  function poolOf(unitId) {
    var list = fixedOf(unitId).map(function (q) { return { q: q }; });
    (GENS[unitId] || []).forEach(function (fn) { list.push({ gen: fn }); list.push({ gen: fn }); });
    return shuffle(list);
  }
  // 選んだ単元から順番に1問ずつ取り、count 問になるまで続ける
  function buildQuiz(unitIds, count) {
    count = count || COUNT;
    var pools = shuffle(unitIds.filter(function (id) { return unit(id); })).map(function (id) { return { id: id, list: poolOf(id) }; });
    var out = [];
    while (out.length < count && pools.length > 0) {
      for (var i = 0; i < pools.length && out.length < count; i++) {
        var item = pools[i].list.shift();
        if (!item) continue;
        var q = item.q || generate(item.gen);
        if (q) out.push(prepare(pools[i].id, q));
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
    var s = { units: [] };
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }
  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, UNITS: UNITS,
    unit: unit, FIXED: FIXED, GENS: GENS, checkQuestion: checkQuestion, generate: generate,
    fixedOf: fixedOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();

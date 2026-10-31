// アルゴリズム道場: ステップの生成・グラフのプリセット・図(棒・箱・グラフ)の描画。
// 可視化(visualizer.html)と道場(index.html)で共有する。道場の自動生成問題の正解も、ここのステップ生成から求める。
// 読み込む順番: shared/store.js →(道場は shared/review.js →)data.js → algo.js
//
// ■ アルゴリズムの決め方(可視化と道場で同じ)
//   バブル: 左から隣どうしを比べ、左>右なら交換。1パスで交換がなければ打ち切る。i パス目後は末尾 i 個が確定。
//   選択: 未整列部分の最小値(同じ値なら最初のもの)を、未整列部分の先頭と交換(同じ位置なら交換しない)。
//   挿入: 左から順に1つ取り出し、左の整列済み部分の正しい位置へずらして入れる。
//   マージ: 上から分割(mid = ⌊(lo+hi)/2⌋、左半分が [lo..mid])。左右の値が同じなら左を先に(安定)。
//   クイック: ピボットは末尾、Lomuto 方式(a[j] < pivot なら前へ)。
//   二分探索: mid = ⌊(low+high)/2⌋。整列済み配列。
//   BFS: キュー。開始点を訪問済みにして入れ、取り出したノードのとなりを番号の小さい順に調べ、未訪問なら訪問済みにしてキューへ。
//        訪問順 = キューから取り出した順。
//   DFS: 再帰。dfs(v): v を訪問 → となりを番号の小さい順に、未訪問なら dfs。訪問順 = 呼ばれた順。
//   グラフは無向。開始点から行けないノードは訪問しない。
//
// ■ ステップ(steps の1つ)
//   ソート: { vals, ids, st: {添字: "compare"|"swap"|"write"|"pivot"}, done: [真偽], range: [lo,hi]|null, mid,
//            line, note, cmp, wr, ev, info }
//   探索:   { low, high, mid, cur, checked: {添字: true}, found, line, note, probes, ev, info }
//   グラフ: { cur, order: [ノード], ds: [キュー/スタックの中身], queued: {ノード: true}, tryEdge: [u,v]|null,
//            onEdges: ["u-v"], line, note, ev, info }
//   ev は道場の問題づくりで使う目印(passEnd / round / merge / partition / probe / expand / call)。
var AlgoViz = (function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var MIN_N = 8, MAX_N = 16, DEFAULT_N = 8, MAX_VALUE = 50;

  // ---------- アルゴリズムの一覧と計算量 ----------
  var ALGOS = {
    bubble:    { group: "sort", name: "バブルソート", short: "バブル" },
    selection: { group: "sort", name: "選択ソート", short: "選択" },
    insertion: { group: "sort", name: "挿入ソート", short: "挿入" },
    merge:     { group: "sort", name: "マージソート", short: "マージ" },
    quick:     { group: "sort", name: "クイックソート", short: "クイック" },
    linear:    { group: "search", name: "線形探索", short: "線形" },
    binary:    { group: "search", name: "二分探索", short: "二分" },
    bfs:       { group: "graph", name: "幅優先探索(BFS)", short: "BFS" },
    dfs:       { group: "graph", name: "深さ優先探索(DFS)", short: "DFS" },
    complexity:{ group: "complexity", name: "計算量の比較", short: "比較" }
  };
  var ORDER = ["bubble", "selection", "insertion", "merge", "quick", "linear", "binary", "bfs", "dfs", "complexity"];
  var GROUPS = [
    { id: "sort", name: "ソート", algos: ["bubble", "selection", "insertion", "merge", "quick"] },
    { id: "search", name: "探索", algos: ["linear", "binary"] },
    { id: "graph", name: "グラフ", algos: ["bfs", "dfs"] },
    { id: "complexity", name: "計算量", algos: ["complexity"] }
  ];
  // 計算量(最良・平均・最悪・追加メモリ・安定)。安定 = 同じ値の並び順が保たれるか(ソートだけ)
  var INFO = {
    bubble:    { best: "O(n)", avg: "O(n²)", worst: "O(n²)", mem: "O(1)", stable: "安定", note: "最良は、すでに整列済みで1パス目に交換がないとき。" },
    selection: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", mem: "O(1)", stable: "安定でない", note: "比べる回数はいつも n(n−1)/2 回。交換は n−1 回以下。" },
    insertion: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", mem: "O(1)", stable: "安定", note: "ほぼ整列済みのデータに強い。最悪は逆順のとき。" },
    merge:     { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", mem: "O(n)", stable: "安定", note: "合わせるときに、もう1つの配列(作業用)を使う。" },
    quick:     { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", mem: "O(log n)", stable: "安定でない", note: "末尾をピボットにすると、整列済み・逆順のデータで最悪になる。メモリは再帰の深さ(平均)。" },
    linear:    { best: "O(1)", avg: "O(n)", worst: "O(n)", mem: "O(1)", stable: "—", note: "整列していなくても使える。" },
    binary:    { best: "O(1)", avg: "O(log n)", worst: "O(log n)", mem: "O(1)", stable: "—", note: "整列済みの配列でだけ使える。" },
    bfs:       { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)", mem: "O(V)", stable: "—", note: "V = ノードの数、E = 辺の数。キューを使う。" },
    dfs:       { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)", mem: "O(V)", stable: "—", note: "V = ノードの数、E = 辺の数。再帰(スタック)を使う。" }
  };

  // ---------- 擬似コード ----------
  var PSEUDO = {
    bubble: [
      "for i ← 0 … n−2",
      "  swapped ← false",
      "  for j ← 0 … n−2−i",
      "    if a[j] > a[j+1]",
      "      swap(a[j], a[j+1]); swapped ← true",
      "  if not swapped: break  // 交換なし → 終わり"
    ],
    selection: [
      "for i ← 0 … n−2",
      "  min ← i",
      "  for j ← i+1 … n−1",
      "    if a[j] < a[min]: min ← j",
      "  if min ≠ i: swap(a[i], a[min])",
      "  // a[i] が確定"
    ],
    insertion: [
      "for i ← 1 … n−1",
      "  key ← a[i]; j ← i−1",
      "  while j ≥ 0 and a[j] > key",
      "    a[j+1] ← a[j]; j ← j−1  // 右へずらす",
      "  a[j+1] ← key"
    ],
    merge: [
      "mergeSort(lo, hi):",
      "  if lo ≥ hi: return",
      "  mid ← ⌊(lo+hi)/2⌋",
      "  mergeSort(lo, mid); mergeSort(mid+1, hi)",
      "  while 左と右の両方に残りがある",
      "    先頭どうしを比べ、小さいほう(同じなら左)を書く",
      "  残ったほうを順に書く"
    ],
    quick: [
      "quickSort(lo, hi):",
      "  if lo ≥ hi: return",
      "  pivot ← a[hi]; i ← lo",
      "  for j ← lo … hi−1",
      "    if a[j] < pivot: swap(a[i], a[j]); i ← i+1",
      "  swap(a[i], a[hi])  // ピボットが確定",
      "  quickSort(lo, i−1); quickSort(i+1, hi)"
    ],
    linear: [
      "for i ← 0 … n−1",
      "  if a[i] = x",
      "    return i  // 見つかった",
      "return −1  // ない"
    ],
    binary: [
      "low ← 0; high ← n−1",
      "while low ≤ high",
      "  mid ← ⌊(low+high)/2⌋",
      "  if a[mid] = x: return mid",
      "  else if a[mid] < x: low ← mid+1",
      "  else: high ← mid−1",
      "return −1  // ない"
    ],
    bfs: [
      "visited[s] ← true; Q に s を入れる",
      "while Q が空でない",
      "  v ← Q の先頭を取り出す  // 訪問",
      "  for v のとなり w(番号の小さい順)",
      "    if not visited[w]",
      "      visited[w] ← true; Q の末尾に w を入れる"
    ],
    dfs: [
      "dfs(v):",
      "  visited[v] ← true  // 訪問",
      "  for v のとなり w(番号の小さい順)",
      "    if not visited[w]",
      "      dfs(w)",
      "  return  // 呼び出し元へ戻る"
    ]
  };

  // ---------- 乱数とデータ ----------
  function randInt(lo, hi, rnd) { return lo + Math.floor((rnd || Math.random)() * (hi - lo + 1)); }
  function shuffle(a, rnd) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor((rnd || Math.random)() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function range(lo, hi) { var a = []; for (var i = lo; i <= hi; i++) a.push(i); return a; }
  function clampN(n) { n = Math.floor(Number(n)); return n >= MIN_N && n <= MAX_N ? n : DEFAULT_N; }
  // 1〜50 の重ならない値を n 個(並びはばらばら)
  function randomDistinct(n, rnd) { return shuffle(range(1, MAX_VALUE), rnd).slice(0, n); }
  // ソートのデータ。kind = "random" | "nearly"(ほぼ整列)| "reversed"(逆順)
  function makeSortData(kind, n, rnd) {
    var a = randomDistinct(n, rnd);
    if (kind === "random") return a;
    a.sort(function (x, y) { return x - y; });
    if (kind === "reversed") return a.reverse();
    // ほぼ整列: 近くの2つを入れかえる(1〜2か所)。整列済みのままにはしない
    var swaps = Math.max(1, Math.floor(n / 6));
    for (var k = 0; k < swaps; k++) {
      var i = randInt(0, n - 2, rnd), j = Math.min(n - 1, i + randInt(1, 2, rnd));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    if (isSorted(a)) { var t2 = a[0]; a[0] = a[1]; a[1] = t2; }
    return a;
  }
  // 探索のデータ: 重ならない値の整列済み配列
  function makeSearchData(n, rnd) { return randomDistinct(n, rnd).sort(function (x, y) { return x - y; }); }
  function isSorted(a) { for (var i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false; return true; }
  function fmtArr(a) { return "[" + a.join(", ") + "]"; }

  // ---------- ソートのステップ ----------
  function SortRec(values) {
    this.items = values.map(function (v, i) { return { v: v, id: i }; });
    this.n = values.length;
    this.steps = [];
    this.cmp = 0;
    this.wr = 0;
    this.done = values.map(function () { return false; });
  }
  SortRec.prototype.snap = function (o) {
    o = o || {};
    this.steps.push({
      vals: this.items.map(function (x) { return x.v; }),
      ids: this.items.map(function (x) { return x.id; }),
      st: o.st || {},
      done: this.done.slice(),
      range: o.range || null,
      mid: o.mid === undefined ? null : o.mid,
      line: o.line === undefined ? -1 : o.line,
      note: o.note || "",
      cmp: this.cmp,
      wr: this.wr,
      ev: o.ev || null,
      info: o.info || null
    });
  };
  SortRec.prototype.v = function (i) { return this.items[i].v; };
  SortRec.prototype.swap = function (i, j) {
    var t = this.items[i]; this.items[i] = this.items[j]; this.items[j] = t;
  };
  SortRec.prototype.allDone = function () { this.done = this.done.map(function () { return true; }); };
  function stObj(pairs) { var o = {}; for (var i = 0; i < pairs.length; i += 2) o[pairs[i]] = pairs[i + 1]; return o; }

  function bubbleSteps(values) {
    var r = new SortRec(values), n = r.n;
    r.snap({ line: -1, note: "バブルソート: となりどうしを比べて、大きいほうを右へ送ります。1回左から右まで比べる流れを「パス」と呼びます。" });
    var finished = false;
    for (var i = 0; i < n - 1; i++) {
      var swapped = false, swaps = [];
      r.snap({ line: 0, note: (i + 1) + "パス目: 左から添字 " + (n - 1 - i) + " まで、となりどうしを比べます。" });
      for (var j = 0; j < n - 1 - i; j++) {
        var x = r.v(j), y = r.v(j + 1);
        r.cmp++;
        r.snap({ st: stObj([j, "compare", j + 1, "compare"]), line: 3,
          note: "a[" + j + "] = " + x + " と a[" + (j + 1) + "] = " + y + " を比べます。" + (x > y ? "左のほうが大きいので交換します。" : "順番どおりなので、そのままです。") });
        if (x > y) {
          r.swap(j, j + 1);
          r.wr += 2;
          swapped = true;
          swaps.push([x, y]);
          r.snap({ st: stObj([j, "swap", j + 1, "swap"]), line: 4, note: x + " と " + y + " を交換しました。", info: { swap: [x, y] } });
        }
      }
      if (!swapped) {
        r.allDone();
        r.snap({ line: 5, ev: "passEnd", info: { pass: i + 1, swaps: swaps },
          note: (i + 1) + "パス目は交換が1回もありませんでした。もう整列済みなので、ここで終わります。" });
        finished = true;
        break;
      }
      r.done[n - 1 - i] = true;
      if (i === n - 2) r.allDone();
      r.snap({ line: 5, ev: "passEnd", info: { pass: i + 1, swaps: swaps },
        note: (i + 1) + "パス目が終わりました。この中でいちばん大きい " + r.v(n - 1 - i) + " が添字 " + (n - 1 - i) + " で確定します(交換 " + swaps.length + " 回)。" });
    }
    if (!finished) { r.allDone(); }
    r.snap({ line: -1, note: "整列が終わりました。比較 " + r.cmp + " 回、書き込み " + r.wr + " 回です。" });
    return r.steps;
  }

  function selectionSteps(values) {
    var r = new SortRec(values), n = r.n;
    r.snap({ line: -1, note: "選択ソート: 未整列の部分から最小値を探し、未整列の部分の先頭と交換します。" });
    for (var i = 0; i < n - 1; i++) {
      var min = i;
      r.snap({ st: stObj([i, "compare"]), line: 1, note: "添字 " + i + " に入る値を決めます。いまの最小は a[" + i + "] = " + r.v(i) + " です。" });
      for (var j = i + 1; j < n; j++) {
        r.cmp++;
        var less = r.v(j) < r.v(min);
        r.snap({ st: stObj([min, "compare", j, "compare"]), line: 3,
          note: "a[" + j + "] = " + r.v(j) + " と、いまの最小 a[" + min + "] = " + r.v(min) + " を比べます。" + (less ? r.v(j) + " のほうが小さいので、最小を a[" + j + "] にします。" : "最小はそのままです。") });
        if (less) min = j;
      }
      var info = { round: i + 1, from: i, minIndex: min, value: r.v(min), swapped: min !== i, other: r.v(i) };
      if (min !== i) {
        var a = r.v(i), b = r.v(min);
        r.swap(i, min);
        r.wr += 2;
        r.snap({ st: stObj([i, "swap", min, "swap"]), line: 4, note: "最小の " + b + " を、添字 " + i + " の " + a + " と交換しました。" });
      } else {
        r.snap({ st: stObj([i, "compare"]), line: 4, note: "最小の " + r.v(i) + " はもう添字 " + i + " にあるので、交換しません。" });
      }
      r.done[i] = true;
      if (i === n - 2) r.allDone();
      r.snap({ line: 5, ev: "round", info: info, note: "添字 " + i + " が " + r.v(i) + " で確定しました。" + (i === n - 2 ? "残りの1つも自動的に確定です。" : "") });
    }
    if (n === 1) r.allDone();
    r.snap({ line: -1, note: "整列が終わりました。比較 " + r.cmp + " 回、書き込み " + r.wr + " 回です。" });
    return r.steps;
  }

  function insertionSteps(values) {
    var r = new SortRec(values), n = r.n;
    r.snap({ range: [0, 0], line: -1, note: "挿入ソート: 左の整列済みの部分(帯)に、右から1つずつ取り出して正しい位置へ入れます。最初は a[0] だけが整列済みです。" });
    for (var i = 1; i < n; i++) {
      var key = r.v(i), j = i - 1, pos = i, shifted = [];
      r.snap({ range: [0, i - 1], st: stObj([i, "write"]), line: 1, note: "a[" + i + "] = " + key + " を取り出して、左の整列済みの部分に入れます。" });
      while (j >= 0) {
        r.cmp++;
        var big = r.v(j) > key;
        r.snap({ range: [0, i - 1], st: stObj([j, "compare", pos, "compare"]), line: 2,
          note: "a[" + j + "] = " + r.v(j) + " と " + key + " を比べます。" + (big ? r.v(j) + " のほうが大きいので、右へずらします。" : "大きくないので、ここで止まります。") });
        if (!big) break;
        var moved = r.v(j);
        r.swap(j, pos);
        shifted.push(moved);
        r.wr++;
        pos = j;
        r.snap({ range: [0, i - 1], st: stObj([pos + 1, "write", pos, "swap"]), line: 3, note: moved + " を1つ右へずらしました。" });
        j--;
      }
      r.wr++;
      if (i === n - 1) r.allDone();
      r.snap({ range: i === n - 1 ? null : [0, i], st: stObj([pos, "write"]), line: 4, ev: "round",
        info: { round: i, key: key, pos: pos, shifted: shifted },
        note: key + " を添字 " + pos + " に入れました。" + (shifted.length ? "(" + shifted.join("・") + " を右へずらした)" : "(動かさなくてよかった)") + "添字 0〜" + i + " が整列済みです。" });
    }
    r.allDone();
    r.snap({ line: -1, note: "整列が終わりました。比較 " + r.cmp + " 回、書き込み " + r.wr + " 回です。" });
    return r.steps;
  }

  function mergeSteps(values) {
    var r = new SortRec(values), n = r.n;
    r.snap({ line: -1, note: "マージソート: 半分に分けることをくり返し、整列した2つの列を「合わせる(マージ)」ことで全体を整列します。" });
    function ms(lo, hi) {
      if (lo >= hi) return;
      var mid = Math.floor((lo + hi) / 2);
      r.snap({ range: [lo, hi], mid: mid, line: 2, note: "a[" + lo + "…" + hi + "] を、左 a[" + lo + "…" + mid + "] と右 a[" + (mid + 1) + "…" + hi + "] に分けます。" });
      ms(lo, mid);
      ms(mid + 1, hi);
      var L = r.items.slice(lo, mid + 1), R = r.items.slice(mid + 1, hi + 1), taken = [];
      var lv = L.map(function (x) { return x.v; }), rv = R.map(function (x) { return x.v; });
      r.snap({ range: [lo, hi], mid: mid, line: 4, ev: "merge", info: { lo: lo, mid: mid, hi: hi, left: lv, right: rv },
        note: "整列済みの左 " + fmtArr(lv) + " と右 " + fmtArr(rv) + " を合わせます。" });
      function rebuild() {
        var seg = taken.concat(L, R);
        for (var k = 0; k < seg.length; k++) r.items[lo + k] = seg[k];
      }
      while (L.length && R.length) {
        var pl = lo + taken.length, pr = pl + L.length;
        r.cmp++;
        var takeLeft = L[0].v <= R[0].v;
        r.snap({ range: [lo, hi], mid: pl + L.length - 1, st: stObj([pl, "compare", pr, "compare"]), line: 5,
          note: "左の先頭 " + L[0].v + " と右の先頭 " + R[0].v + " を比べます。" + (takeLeft ? L[0].v : R[0].v) + " のほうが小さいので先に書きます。" });
        taken.push(takeLeft ? L.shift() : R.shift());
        rebuild();
        r.wr++;
        r.snap({ range: [lo, hi], mid: L.length && R.length ? lo + taken.length + L.length - 1 : null, st: stObj([lo + taken.length - 1, "write"]), line: 5,
          note: taken[taken.length - 1].v + " を添字 " + (lo + taken.length - 1) + " に書きました。" });
      }
      while (L.length || R.length) {
        var x = L.length ? L.shift() : R.shift();
        taken.push(x);
        rebuild();
        r.wr++;
        r.snap({ range: [lo, hi], st: stObj([lo + taken.length - 1, "write"]), line: 6,
          note: "片方が空になったので、残りの " + x.v + " をそのまま添字 " + (lo + taken.length - 1) + " に書きます。" });
      }
      if (lo === 0 && hi === n - 1) r.allDone();
      r.snap({ range: [lo, hi], line: 6, note: "a[" + lo + "…" + hi + "] が " + fmtArr(r.items.slice(lo, hi + 1).map(function (x) { return x.v; })) + " になりました。" });
    }
    ms(0, n - 1);
    r.allDone();
    r.snap({ line: -1, note: "整列が終わりました。比較 " + r.cmp + " 回、書き込み " + r.wr + " 回です。" });
    return r.steps;
  }

  function quickSteps(values) {
    var r = new SortRec(values), n = r.n;
    r.snap({ line: -1, note: "クイックソート: 末尾の値を「ピボット(基準)」にして、それより小さい値を前に集めます。ピボットの位置が決まったら、左右に分けて同じことをくり返します。" });
    function qs(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) {
        r.done[lo] = true;
        r.snap({ range: [lo, hi], line: 1, note: "a[" + lo + "] は1つだけなので、そのまま確定です。" });
        return;
      }
      var pivot = r.v(hi), i = lo, moved = [];
      r.snap({ range: [lo, hi], st: stObj([hi, "pivot"]), line: 2, note: "a[" + lo + "…" + hi + "] を分けます。末尾の " + pivot + " がピボットです。i は「小さい値を置く場所」で、最初は添字 " + lo + " です。" });
      for (var j = lo; j < hi; j++) {
        r.cmp++;
        var less = r.v(j) < pivot;
        var st = stObj([hi, "pivot", j, "compare"]);
        r.snap({ range: [lo, hi], st: st, line: 4, note: "a[" + j + "] = " + r.v(j) + " とピボット " + pivot + " を比べます。" + (less ? "小さいので、添字 i = " + i + " の場所へ送ります。" : "小さくないので、そのままです。") });
        if (less) {
          moved.push(r.v(j));
          if (i !== j) {
            var a = r.v(i), b = r.v(j);
            r.swap(i, j);
            r.wr += 2;
            r.snap({ range: [lo, hi], st: stObj([hi, "pivot", i, "swap", j, "swap"]), line: 4, note: b + " と " + a + " を交換しました。i を " + (i + 1) + " にします。" });
          }
          i++;
        }
      }
      if (i !== hi) {
        var c = r.v(i);
        r.swap(i, hi);
        r.wr += 2;
        r.snap({ range: [lo, hi], st: stObj([i, "swap", hi, "swap"]), line: 5, note: "ピボット " + pivot + " を添字 " + i + " の " + c + " と交換しました。" });
      }
      r.done[i] = true;
      r.snap({ range: [lo, hi], st: stObj([i, "pivot"]), line: 5, ev: "partition",
        info: { lo: lo, hi: hi, pivot: pivot, index: i, moved: moved },
        note: "ピボット " + pivot + " が添字 " + i + " で確定しました。左はすべて " + pivot + " より小さく、右はすべて大きい値です。" });
      qs(lo, i - 1);
      qs(i + 1, hi);
    }
    qs(0, n - 1);
    r.allDone();
    r.snap({ line: -1, note: "整列が終わりました。比較 " + r.cmp + " 回、書き込み " + r.wr + " 回です。" });
    return r.steps;
  }

  var SORTS = { bubble: bubbleSteps, selection: selectionSteps, insertion: insertionSteps, merge: mergeSteps, quick: quickSteps };
  function sortSteps(algo, values) { return SORTS[algo](values.slice()); }
  // 道場用: ev の目印がついたステップだけ
  function eventsOf(steps, ev) { return steps.filter(function (s) { return s.ev === ev; }); }

  // ---------- 探索のステップ ----------
  function linearSteps(arr, x) {
    var steps = [], checked = {}, probes = 0, n = arr.length;
    function snap(o) {
      steps.push({ low: null, high: null, mid: null, cur: o.cur === undefined ? null : o.cur, checked: copy(checked),
        found: o.found === undefined ? null : o.found, line: o.line, note: o.note, probes: probes, ev: o.ev || null, info: o.info || null });
    }
    snap({ line: -1, note: "線形探索: 左から順に1つずつ、" + x + " と同じかを調べます。" });
    for (var i = 0; i < n; i++) {
      probes++;
      var hit = arr[i] === x;
      snap({ cur: i, line: 1, ev: "probe", info: { index: i, value: arr[i] }, note: probes + "回目: a[" + i + "] = " + arr[i] + " を調べます。" + (hit ? x + " と同じです。" : x + " ではありません。") });
      if (hit) {
        snap({ cur: i, found: i, line: 2, ev: "end", info: { found: i, probes: probes }, note: "見つかりました。" + x + " は添字 " + i + " にあります(調べた回数 " + probes + " 回)。" });
        return steps;
      }
      checked[i] = true;
    }
    snap({ line: 3, ev: "end", info: { found: -1, probes: probes }, note: "最後まで調べても " + x + " はありませんでした(調べた回数 " + probes + " 回)。" });
    return steps;
  }
  function binarySteps(arr, x) {
    var steps = [], probes = 0, low = 0, high = arr.length - 1;
    function snap(o) {
      steps.push({ low: o.low === undefined ? low : o.low, high: o.high === undefined ? high : o.high, mid: o.mid === undefined ? null : o.mid,
        cur: o.mid === undefined ? null : o.mid, checked: {}, found: o.found === undefined ? null : o.found,
        line: o.line, note: o.note, probes: probes, ev: o.ev || null, info: o.info || null });
    }
    snap({ line: 0, note: "二分探索: 整列済みの配列の真ん中を調べ、" + x + " がありうる範囲を半分ずつにしぼります。最初の範囲は添字 0〜" + high + " です。" });
    while (low <= high) {
      var mid = Math.floor((low + high) / 2);
      probes++;
      var v = arr[mid];
      snap({ mid: mid, line: 3, ev: "probe", info: { low: low, high: high, mid: mid, value: v },
        note: probes + "回目: low = " + low + "、high = " + high + " なので mid = ⌊(" + low + "+" + high + ")/2⌋ = " + mid + "。a[" + mid + "] = " + v + " を調べます。" });
      if (v === x) {
        snap({ mid: mid, found: mid, line: 3, ev: "end", info: { found: mid, probes: probes }, note: "a[" + mid + "] = " + x + " で見つかりました(調べた回数 " + probes + " 回)。" });
        return steps;
      }
      if (v < x) {
        low = mid + 1;
        snap({ mid: mid, line: 4, note: v + " < " + x + " なので、" + x + " は右側にあるはずです。low を " + low + " にします。" });
      } else {
        high = mid - 1;
        snap({ mid: mid, line: 5, note: v + " > " + x + " なので、" + x + " は左側にあるはずです。high を " + high + " にします。" });
      }
    }
    snap({ line: 6, ev: "end", info: { found: -1, probes: probes }, note: "low(" + low + ")が high(" + high + ")をこえて、調べる範囲がなくなりました。" + x + " はありません(調べた回数 " + probes + " 回)。" });
    return steps;
  }
  function searchSteps(algo, arr, x) { return algo === "binary" ? binarySteps(arr, x) : linearSteps(arr, x); }
  function copy(o) { var c = {}; Object.keys(o).forEach(function (k) { c[k] = o[k]; }); return c; }

  // ---------- グラフ ----------
  // 座標は viewBox の単位。ノード番号は 1 から
  var PRESETS = [
    { id: "tree", name: "木", nodes: [[1, 200, 40], [2, 110, 120], [3, 290, 120], [4, 60, 200], [5, 160, 200], [6, 240, 200], [7, 340, 200]],
      edges: [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7]] },
    { id: "cycle", name: "輪つき", nodes: [[1, 60, 120], [2, 150, 50], [3, 150, 190], [4, 240, 120], [5, 250, 210], [6, 330, 50], [7, 350, 160]],
      edges: [[1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [4, 7], [5, 7], [6, 7]] },
    { id: "grid", name: "格子", nodes: [[1, 90, 40], [2, 200, 40], [3, 310, 40], [4, 90, 125], [5, 200, 125], [6, 310, 125], [7, 90, 210], [8, 200, 210], [9, 310, 210]],
      edges: [[1, 2], [2, 3], [1, 4], [2, 5], [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [7, 8], [8, 9]] },
    { id: "split", name: "つながっていない部分あり", nodes: [[1, 60, 60], [2, 160, 40], [3, 90, 170], [4, 190, 150], [5, 290, 60], [6, 350, 150], [7, 270, 210]],
      edges: [[1, 2], [1, 3], [2, 4], [3, 4], [5, 6], [6, 7], [5, 7]] }
  ];
  function makeGraph(def) {
    var g = { id: def.id, name: def.name, nodes: [], edges: [], adj: {} };
    def.nodes.forEach(function (p) { g.nodes.push({ id: p[0], x: p[1], y: p[2] }); g.adj[p[0]] = []; });
    def.edges.forEach(function (e) {
      var a = Math.min(e[0], e[1]), b = Math.max(e[0], e[1]);
      g.edges.push([a, b]);
      g.adj[a].push(b);
      g.adj[b].push(a);
    });
    Object.keys(g.adj).forEach(function (k) { g.adj[k].sort(function (x, y) { return x - y; }); });
    return g;
  }
  function preset(id) {
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return makeGraph(PRESETS[i]);
    return makeGraph(PRESETS[0]);
  }
  function edgeKey(a, b) { return Math.min(a, b) + "-" + Math.max(a, b); }

  // 道場用: 格子状の位置に、ランダムにつながったグラフを作る(番号もばらばら)
  function randomGraph(rnd) {
    var shapes = [[2, 3], [2, 4], [3, 3]];
    var sh = shapes[randInt(0, shapes.length - 1, rnd)], R = sh[0], C = sh[1];
    var N = R * C, pos = [];
    var dx = C === 4 ? 100 : 130, dy = R === 2 ? 120 : 90;
    var x0 = (400 - dx * (C - 1)) / 2, y0 = R === 2 ? 60 : 40;
    for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) pos.push([x0 + c * dx + (r % 2 ? randInt(-12, 12, rnd) : 0), y0 + r * dy]);
    var cand = [];
    for (r = 0; r < R; r++) for (c = 0; c < C; c++) {
      var k = r * C + c;
      if (c + 1 < C) cand.push([k, k + 1]);
      if (r + 1 < R) cand.push([k, k + C]);
      if (r + 1 < R && c + 1 < C) {
        if (randInt(0, 1, rnd)) cand.push([k, k + C + 1]); else cand.push([k + 1, k + C]);
      }
    }
    // ランダムな全域木 + いくつかの辺
    var parent = range(0, N - 1);
    function find(a) { while (parent[a] !== a) a = parent[a] = parent[parent[a]]; return a; }
    var chosen = [], rest = [];
    shuffle(cand, rnd).forEach(function (e) {
      var a = find(e[0]), b = find(e[1]);
      if (a !== b) { parent[a] = b; chosen.push(e); } else rest.push(e);
    });
    rest.forEach(function (e) { if ((rnd || Math.random)() < 0.3) chosen.push(e); });
    var labels = shuffle(range(1, N), rnd);
    return makeGraph({ id: "random", name: "ランダム",
      nodes: pos.map(function (p, i) { return [labels[i], p[0], p[1]]; }),
      edges: chosen.map(function (e) { return [labels[e[0]], labels[e[1]]]; }) });
  }

  // reverse = true なら、となりを番号の大きい順にたどる(道場の誤答づくりだけで使う)
  function neighbors(g, v, reverse) { var a = g.adj[v].slice(); return reverse ? a.reverse() : a; }

  function bfsSteps(g, s, reverse) {
    var steps = [], order = [], queue = [], visited = {}, queued = {}, on = [], dist = {}, parentOf = {};
    function snap(o) {
      steps.push({ cur: o.cur === undefined ? null : o.cur, order: order.slice(), ds: queue.slice(), queued: copy(queued),
        visited: copy(visited), tryEdge: o.tryEdge || null, onEdges: on.slice(), line: o.line, note: o.note, ev: o.ev || null, info: o.info || null });
    }
    snap({ line: -1, note: "幅優先探索(BFS): 開始点 " + s + " から近い順に広げていきます。次に調べるノードを「キュー」(先に入れたものから取り出す列)で管理します。" });
    visited[s] = true; queued[s] = true; queue.push(s); dist[s] = 0;
    snap({ line: 0, note: s + " を訪問済みの印をつけてキューに入れます。" });
    while (queue.length) {
      var v = queue.shift();
      delete queued[v];
      order.push(v);
      snap({ cur: v, line: 2, note: "キューの先頭から " + v + " を取り出して訪問します(" + order.length + "番目)。" });
      neighbors(g, v, reverse).forEach(function (w) {
        if (visited[w]) {
          snap({ cur: v, tryEdge: [v, w], line: 4, note: "となりの " + w + " は訪問済み(またはキューの中)なので、入れません。" });
          return;
        }
        visited[w] = true; queued[w] = true; queue.push(w); on.push(edgeKey(v, w)); dist[w] = dist[v] + 1; parentOf[w] = v;
        snap({ cur: v, tryEdge: [v, w], line: 5, note: "となりの " + w + " はまだなので、印をつけてキューの末尾に入れます。" });
      });
      snap({ cur: v, line: 3, ev: "expand", info: { node: v, queue: queue.slice() },
        note: v + " のとなりを調べ終わりました。キューは " + (queue.length ? queue.join(", ") : "空") + " です。" });
    }
    var unreached = g.nodes.map(function (n) { return n.id; }).filter(function (id) { return !visited[id]; });
    snap({ line: -1, ev: "end", info: { order: order.slice(), dist: copy(dist), parent: copy(parentOf) },
      note: "キューが空になったので終わりです。訪問順は " + order.join(" → ") + "。" + (unreached.length ? unreached.join("・") + " は開始点からつながっていないので訪問しません。" : "") });
    return steps;
  }

  function dfsSteps(g, s, reverse) {
    var steps = [], order = [], stack = [], visited = {}, on = [], depth = {};
    function snap(o) {
      var inStack = {};
      stack.forEach(function (x) { inStack[x] = true; });
      steps.push({ cur: o.cur === undefined ? null : o.cur, order: order.slice(), ds: stack.slice(), queued: inStack,
        visited: copy(visited), tryEdge: o.tryEdge || null, onEdges: on.slice(), line: o.line, note: o.note, ev: o.ev || null, info: o.info || null });
    }
    snap({ line: -1, note: "深さ優先探索(DFS): 開始点 " + s + " から、行けるところまで深く進み、行き止まりになったら戻って別の道を進みます。呼び出しの重なり(呼び出しスタック)で、戻る先を覚えます。" });
    function dfs(v, d) {
      stack.push(v);
      visited[v] = true;
      order.push(v);
      depth[v] = d;
      snap({ cur: v, line: 1, ev: "call", info: { node: v, stack: stack.slice() }, note: "dfs(" + v + ") が呼ばれました。" + v + " を訪問します(" + order.length + "番目)。" });
      neighbors(g, v, reverse).forEach(function (w) {
        if (visited[w]) {
          snap({ cur: v, tryEdge: [v, w], line: 3, note: v + " のとなりの " + w + " は訪問済みなので、進みません。" });
          return;
        }
        on.push(edgeKey(v, w));
        snap({ cur: v, tryEdge: [v, w], line: 4, note: v + " のとなりの " + w + " はまだなので、dfs(" + w + ") を呼びます。" });
        dfs(w, d + 1);
        snap({ cur: v, line: 2, note: "dfs(" + w + ") が終わって、" + v + " に戻りました。" + v + " の残りのとなりを調べます。" });
      });
      stack.pop();
      snap({ cur: stack.length ? stack[stack.length - 1] : null, line: 5,
        note: v + " のとなりはすべて調べました。dfs(" + v + ") を終えて" + (stack.length ? " " + stack[stack.length - 1] + " に戻ります。" : "、探索が終わります。") });
    }
    dfs(s, 0);
    var unreached = g.nodes.map(function (n) { return n.id; }).filter(function (id) { return !visited[id]; });
    snap({ line: -1, ev: "end", info: { order: order.slice(), depth: copy(depth) },
      note: "訪問順は " + order.join(" → ") + "。" + (unreached.length ? unreached.join("・") + " は開始点からつながっていないので訪問しません。" : "") });
    return steps;
  }
  function graphSteps(algo, g, s, reverse) { return algo === "dfs" ? dfsSteps(g, s, reverse) : bfsSteps(g, s, reverse); }

  // ---------- 描画(DOM が必要。読み込むだけでは使わない) ----------
  function svgEl(tag, attrs, cls) {
    var e = document.createElementNS(SVG_NS, tag);
    if (cls) e.setAttribute("class", cls);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function svgText(x, y, text, cls, attrs) {
    var t = svgEl("text", attrs || {}, cls);
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.textContent = text;
    return t;
  }
  var SYMBOL = { compare: "?", swap: "⇄", write: "↓", pivot: "P", done: "✓" };

  // 棒グラフ(ソート)。値の要素は id ごとの <g> で、位置の変化はアニメーションする
  function BarView(container) {
    this.container = container;
    this.svg = null;
    this.key = "";
  }
  BarView.prototype.layout = function (n) {
    var W = Math.max(260, Math.floor(this.container.clientWidth || 600));
    var narrow = W < 480;
    var gap = narrow ? 2 : 6;
    var bw = Math.max(10, Math.min(44, Math.floor((W - 16) / n) - gap));
    var total = n * (bw + gap) - gap;
    var maxH = narrow ? 180 : 220;
    var top = 34;   // ★ と値の分
    return { W: W, n: n, gap: gap, bw: bw, x0: Math.round((W - total) / 2), maxH: maxH, top: top, base: top + maxH,
      H: top + maxH + 58, font: narrow ? 11 : 12.5 };
  };
  BarView.prototype.x = function (L, i) { return L.x0 + i * (L.bw + L.gap); };
  BarView.prototype.build = function (step) {
    var n = step.vals.length, L = this.layout(n);
    this.L = L;
    var svg = svgEl("svg", { viewBox: "0 0 " + L.W + " " + L.H, width: L.W, height: L.H, role: "img" }, "bars-svg");
    this.band = svgEl("g", {}, "band-layer");
    svg.appendChild(this.band);
    var idx = svgEl("g", {}, "idx-layer");
    for (var i = 0; i < n; i++) idx.appendChild(svgText(this.x(L, i) + L.bw / 2, L.base + 15, String(i), "bar-idx", { "font-size": L.font }));
    svg.appendChild(idx);
    this.bars = {};
    var layer = svgEl("g", {}, "bar-layer");
    for (i = 0; i < n; i++) {
      var id = step.ids[i], v = step.vals[i], h = Math.max(4, Math.round(v / MAX_VALUE * L.maxH));
      var g = svgEl("g", {}, "bar");
      g.appendChild(svgEl("rect", { x: 0, y: L.base - h, width: L.bw, height: h, rx: Math.min(4, L.bw / 4) }, "bar-rect"));
      g.appendChild(svgText(L.bw / 2, L.base - h - 5, String(v), "bar-val", { "font-size": L.font }));
      g.appendChild(svgText(L.bw / 2, L.base - h - 5 - L.font - 2, "★", "bar-star", { "font-size": L.font }));
      g.appendChild(svgText(L.bw / 2, L.base + 33, "", "bar-sym", { "font-size": L.font + 1 }));
      layer.appendChild(g);
      this.bars[id] = g;
    }
    svg.appendChild(layer);
    this.svg = svg;
    this.container.innerHTML = "";
    this.container.appendChild(svg);
    this.key = n + ":" + L.W + ":" + step.ids.slice().sort(function (a, b) { return a - b; }).join(",");
    this.valsKey = "";
  };
  // force = true なら作り直す(データが変わったとき・幅が変わったとき)
  BarView.prototype.update = function (step, force) {
    var n = step.vals.length;
    var W = Math.max(260, Math.floor(this.container.clientWidth || 600));
    var vk = step.ids.map(function (id, i) { return id + ":" + step.vals[i]; }).sort().join(",");
    if (force || !this.svg || !this.L || this.L.n !== n || this.L.W !== W || this.valsKey !== vk) {
      this.build(step);
      this.valsKey = vk;
      this.svg.classList.add("no-anim");
    } else {
      this.svg.classList.remove("no-anim");
    }
    var L = this.L, self = this;
    step.ids.forEach(function (id, i) {
      var g = self.bars[id], st = step.st[i] || (step.done[i] ? "done" : "");
      g.style.transform = "translate(" + self.x(L, i) + "px, 0px)";
      g.setAttribute("class", "bar" + (st ? " is-" + st : ""));
      g.lastChild.textContent = SYMBOL[st] || "";
    });
    // 範囲の帯と括弧
    this.band.innerHTML = "";
    if (step.range) {
      var lo = step.range[0], hi = step.range[1];
      var x1 = this.x(L, lo) - Math.max(2, L.gap / 2 + 1), x2 = this.x(L, hi) + L.bw + Math.max(2, L.gap / 2 + 1);
      this.band.appendChild(svgEl("rect", { x: x1, y: 4, width: x2 - x1, height: L.base + 2 - 4, rx: 6 }, "range-band"));
      var by = L.base + 44;
      this.band.appendChild(svgEl("path", { d: "M " + x1 + " " + (by - 5) + " L " + x1 + " " + by + " L " + x2 + " " + by + " L " + x2 + " " + (by - 5) }, "range-bracket"));
      if (step.mid !== null && step.mid !== undefined && step.mid >= lo && step.mid < hi) {
        var mx = this.x(L, step.mid) + L.bw + L.gap / 2;
        this.band.appendChild(svgEl("line", { x1: mx, y1: 8, x2: mx, y2: L.base + 48 }, "range-mid"));
      }
    }
    var desc = step.vals.map(function (v, i) {
      var st = step.st[i] || (step.done[i] ? "done" : "");
      return v + (st ? "(" + STATE_NAME[st] + ")" : "");
    }).join("、");
    this.svg.setAttribute("aria-label", "配列: " + desc);
  };
  var STATE_NAME = { compare: "比較中", swap: "交換中", write: "書き込み", pivot: "ピボット", done: "確定" };

  // 箱の列(探索・道場の問題の配列)。opts: { box: 箱の幅, width: 使える横幅, state: 探索のステップ }
  function renderBoxes(arr, opts) {
    opts = opts || {};
    var s = opts.state || null;
    var box = opts.box || 44, gap = opts.gap === undefined ? 6 : opts.gap;
    var n = arr.length, avail = opts.width || 10000;
    var perRow = n;
    if (n * (box + gap) - gap + 8 > avail) perRow = Math.min(n, 8);
    if (perRow * (box + gap) - gap + 8 > avail) {
      box = Math.max(24, Math.floor((avail - 8) / perRow) - gap);
    }
    var rows = Math.ceil(n / perRow);
    var showPtr = !!s, idxH = 16, ptrH = showPtr ? 34 : 0, rowH = idxH + box + ptrH + 8;
    var W = perRow * (box + gap) - gap + 8, H = rows * rowH;
    var font = box >= 40 ? 16 : box >= 32 ? 14 : 13;
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img" }, "boxes-svg");
    var desc = [];
    for (var i = 0; i < n; i++) {
      var r = Math.floor(i / perRow), c = i % perRow;
      var x = 4 + c * (box + gap), y = r * rowH + idxH;
      var cls = "box";
      var inRange = !s || s.low === null || (i >= s.low && i <= s.high);
      if (s && !inRange) cls += " is-dim";
      if (s && s.checked && s.checked[i]) cls += " is-checked";
      if (s && s.cur === i) cls += " is-compare";
      if (s && s.found === i) cls += " is-found";
      var g = svgEl("g", {}, cls);
      g.appendChild(svgText(x + box / 2, y - 4, String(i), "box-idx", { "font-size": 11 }));
      g.appendChild(svgEl("rect", { x: x, y: y, width: box, height: box, rx: 6 }, "box-rect"));
      g.appendChild(svgText(x + box / 2, y + box / 2, String(arr[i]), "box-val", { "font-size": s && !inRange ? font - 2 : font }));
      if (s && s.found === i) g.appendChild(svgText(x + box - 7, y + 9, "✓", "box-mark", { "font-size": 11 }));
      if (showPtr) {
        var labels = [];
        if (s.low === i) labels.push("L");
        if (s.mid === i) labels.push("M");
        if (s.high === i) labels.push("H");
        if (labels.length) {
          var hasM = labels.indexOf("M") >= 0;
          g.appendChild(svgText(x + box / 2, y + box + 13, "▲", "box-ptr" + (hasM ? " is-mid" : ""), { "font-size": 11 }));
          var t = svgEl("text", { x: x + box / 2, y: y + box + 27, "font-size": 11 }, "box-ptr-label");
          labels.forEach(function (lb, k) {
            var ts = svgEl("tspan", {}, lb === "M" ? "is-mid" : "");
            ts.textContent = (k ? " " : "") + lb;
            t.appendChild(ts);
          });
          g.appendChild(t);
        } else if (s.checked && s.checked[i]) {
          g.appendChild(svgText(x + box / 2, y + box + 16, "済", "box-done", { "font-size": 11 }));
        }
      }
      svg.appendChild(g);
      desc.push("a[" + i + "]=" + arr[i]);
    }
    svg.setAttribute("aria-label", "配列 " + desc.join("、"));
    return svg;
  }

  // グラフ。opts: { state: グラフのステップ, start, onNodeClick(id), compact, maxHeight }
  function renderGraph(g, opts) {
    opts = opts || {};
    var s = opts.state || null, R = opts.compact ? 19 : 20;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    g.nodes.forEach(function (n) { minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x); minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y); });
    var padX = R + 26, padTop = R + 26, padBottom = R + 8;
    var vx = minX - padX, vy = minY - padTop, vw = maxX - minX + padX * 2, vh = maxY - minY + padTop + padBottom;
    var svg = svgEl("svg", { viewBox: vx + " " + vy + " " + vw + " " + vh, role: "img", preserveAspectRatio: "xMidYMid meet" }, "graph-svg");
    if (opts.maxHeight) svg.style.maxHeight = opts.maxHeight + "px";
    var byId = {};
    g.nodes.forEach(function (n) { byId[n.id] = n; });
    var onSet = {};
    (s ? s.onEdges : []).forEach(function (k) { onSet[k] = true; });
    var tryKey = s && s.tryEdge ? edgeKey(s.tryEdge[0], s.tryEdge[1]) : null;
    var ge = svgEl("g", {}, "g-edges");
    g.edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]], k = edgeKey(e[0], e[1]);
      var cls = "g-edge" + (k === tryKey ? " is-try" : onSet[k] ? " is-on" : "");
      ge.appendChild(svgEl("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y }, cls));
    });
    svg.appendChild(ge);
    var orderNo = {};
    if (s) s.order.forEach(function (id, i) { orderNo[id] = i + 1; });
    var gn = svgEl("g", {}, "g-nodes");
    var desc = [];
    g.nodes.forEach(function (n) {
      var cls = "g-node";
      if (s) {
        if (s.cur === n.id) cls += " is-current";
        else if (orderNo[n.id]) cls += " is-visited";
        else if (s.queued[n.id]) cls += " is-queued";
      }
      if (opts.onNodeClick) cls += " is-clickable";
      var node = svgEl("g", {}, cls);
      if (s && s.cur === n.id) node.appendChild(svgEl("circle", { cx: n.x, cy: n.y, r: R + 5 }, "g-ring"));
      node.appendChild(svgEl("circle", { cx: n.x, cy: n.y, r: R }, "g-dot"));
      node.appendChild(svgText(n.x, n.y, String(n.id), "g-id"));
      if (orderNo[n.id]) {
        node.appendChild(svgEl("circle", { cx: n.x + R * 0.85, cy: n.y - R * 0.85, r: 9 }, "g-badge"));
        node.appendChild(svgText(n.x + R * 0.85, n.y - R * 0.85, String(orderNo[n.id]), "g-badge-text"));
      }
      if (opts.start === n.id) {
        node.appendChild(svgText(n.x, n.y - R - 10, "開始", "g-start"));
      }
      var label = "ノード " + n.id + (opts.start === n.id ? "(開始点)" : "") +
        (orderNo[n.id] ? "、" + orderNo[n.id] + "番目に訪問" : s && s.queued[n.id] ? "、" + (s.ds && opts.dsName ? opts.dsName : "キュー") + "の中" : "");
      if (opts.onNodeClick) {
        node.setAttribute("role", "button");
        node.setAttribute("tabindex", "0");
        node.setAttribute("aria-label", label + "。開始点にする");
        node.addEventListener("click", function () { opts.onNodeClick(n.id); });
        node.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); opts.onNodeClick(n.id); }
        });
      }
      desc.push(label);
      gn.appendChild(node);
    });
    svg.appendChild(gn);
    var edgeText = g.edges.map(function (e) { return e[0] + "−" + e[1]; }).join("、");
    svg.setAttribute("aria-label", "グラフ。" + desc.join("。") + "。辺: " + edgeText);
    return svg;
  }

  return {
    MIN_N: MIN_N, MAX_N: MAX_N, DEFAULT_N: DEFAULT_N, MAX_VALUE: MAX_VALUE,
    ALGOS: ALGOS, ORDER: ORDER, GROUPS: GROUPS, INFO: INFO, PSEUDO: PSEUDO, PRESETS: PRESETS,
    randInt: randInt, shuffle: shuffle, range: range, clampN: clampN, isSorted: isSorted, fmtArr: fmtArr,
    randomDistinct: randomDistinct, makeSortData: makeSortData, makeSearchData: makeSearchData,
    sortSteps: sortSteps, searchSteps: searchSteps, graphSteps: graphSteps, eventsOf: eventsOf,
    preset: preset, makeGraph: makeGraph, randomGraph: randomGraph, edgeKey: edgeKey,
    BarView: BarView, renderBoxes: renderBoxes, renderGraph: renderGraph, SYMBOL: SYMBOL
  };
})();

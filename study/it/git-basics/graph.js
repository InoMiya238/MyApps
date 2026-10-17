// Git道場: コミットの図(.git-graph)を描く。道場(index.html)とコマンド帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → data.js → graph.js(GITD は data.js で作る)
//
// ■ 図の書き方(data.js の graph)
//   {
//     title: "実行前",                      // 省略可。図の上の小さい見出し
//     commits: [                            // 古い順。親は必ず先に書く
//       { id: "A" },
//       { id: "B", parent: "A" },
//       { id: "D", parent: "B", lane: 1 },  // lane = 段(0 が一番上)。省略すると最初の親の段を受け継ぐ
//       { id: "M", parents: ["C", "D"] }    // マージコミット。最初の親が本流
//     ],
//     refs: { main: "M", "origin/main": "C" },  // "/" を含む名前はリモート追跡ブランチ
//     tags: { "v1.0": "A" },                // 省略可
//     head: "main",                         // ブランチ名なら HEAD→ブランチ。コミットIDなら detached HEAD
//     newIds: ["M"],                        // 省略可。新しくできたコミット(朱で強調)
//     dimIds: ["D"]                         // 省略可。たどれなくなったコミット(点線で薄く)
//   }
//   列 = 親の列の最大 + 1(根は 0)。コミットIDは3文字まで。
//
// ■ 寸法(SVG の座標 = 等倍の px)
//   丸 r=12、列の間隔は 48 以上(同じ高さの名札が横にぶつからない広さに、図ごとに広げる)。
//   ラベルは高さ 20、幅 = 文字数×6.8+14、重ねる間隔 23、丸から 6 あける。
//   名札はふつう丸の上。段が2つ以上あるときは、一番下の段だけ丸の下に置く(段違いの曲線と重ねない)。
//   段の間は、丸どうしを 14 あけ、その段の上の名札の高さを足す。
(function (GITD) {
  "use strict";

  var R = 12, COL_W = 48, PILL_H = 20, PILL_STEP = 23, PILL_GAP = 6, LANE_GAP = 14;
  var PAD_X = 24, PAD_TOP = 10, PAD_BOTTOM = 12, PILL_MARGIN = 4;
  var MAX_COLS = 7;          // 問題の下・コマンド帳の図
  var MAX_COLS_CHOICE = 5;   // 選択肢の図
  var SVG_NS = "http://www.w3.org/2000/svg";
  var markerNo = 0;

  function own(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function pillWidth(text) { return String(text).length * 6.8 + 14; }
  function parentsOf(c) {
    if (Array.isArray(c.parents)) return c.parents.slice();
    return c.parent ? [c.parent] : [];
  }

  // 図の位置を計算する(DOM は使わない。checkGraph と renderGraph の両方で使う)
  function layout(g, opts) {
    var errs = [];
    var out = { nodes: [], byId: {}, edges: [], pills: [], width: 0, height: 0, errors: errs };
    if (!g || typeof g !== "object") { errs.push("図がオブジェクトではない"); return out; }
    if (!Array.isArray(g.commits) || g.commits.length === 0) { errs.push("commits がない"); return out; }
    var newSet = {}, dimSet = {};
    (Array.isArray(g.newIds) ? g.newIds : []).forEach(function (id) { newSet[id] = true; });
    (Array.isArray(g.dimIds) ? g.dimIds : []).forEach(function (id) { dimSet[id] = true; });

    var byId = out.byId;
    g.commits.forEach(function (c, i) {
      if (!c || typeof c.id !== "string" || !c.id) { errs.push("commits[" + i + "] に id がない"); return; }
      if (c.id.length > 3) errs.push("コミットIDが3文字をこえる: " + c.id);
      if (own(byId, c.id)) { errs.push("コミットIDが重なっている: " + c.id); return; }
      var ps = parentsOf(c), col = 0, ok = [];
      ps.forEach(function (p) {
        if (!own(byId, p)) errs.push(c.id + " の親が見つからない(先に書く): " + p);
        else ok.push(p);
      });
      ok.forEach(function (p) { col = Math.max(col, byId[p].col + 1); });
      var lane = typeof c.lane === "number" ? c.lane : (ok.length ? byId[ok[0]].lane : 0);
      if (!(lane >= 0) || Math.floor(lane) !== lane) { errs.push(c.id + " の lane が0以上の整数ではない"); lane = 0; }
      var n = { id: c.id, parents: ok, col: col, lane: lane, isNew: !!newSet[c.id], isDim: !!dimSet[c.id] };
      byId[c.id] = n;
      out.nodes.push(n);
    });

    // (列, 段)の重なり、列数
    var cell = {}, maxCol = 0;
    out.nodes.forEach(function (n) {
      var k = n.col + "," + n.lane;
      if (cell[k]) errs.push("コミットの位置が重なっている: " + cell[k] + " と " + n.id + "(列" + n.col + "・段" + n.lane + ")");
      else cell[k] = n.id;
      maxCol = Math.max(maxCol, n.col);
    });
    out.cols = maxCol + 1;
    // 同じ段の親子の線が、あいだにある別のコミットの上を通らないこと
    out.nodes.forEach(function (n) {
      n.parents.forEach(function (pid) {
        var p = byId[pid];
        if (p.lane !== n.lane) return;
        for (var col = p.col + 1; col < n.col; col++) {
          if (cell[col + "," + n.lane]) errs.push(n.id + " → " + pid + " の線が " + cell[col + "," + n.lane] + " の上を通る");
        }
      });
    });
    ["newIds", "dimIds"].forEach(function (key) {
      if (g[key] !== undefined && !Array.isArray(g[key])) { errs.push(key + " が配列ではない"); return; }
      (g[key] || []).forEach(function (id) { if (!own(byId, id)) errs.push(key + " のコミットがない: " + id); });
    });

    // ラベル(下から: HEADなしのローカルブランチ → リモート追跡 → タグ → HEADつきのブランチ → HEAD)
    var refs = g.refs && typeof g.refs === "object" ? g.refs : {};
    var tags = g.tags && typeof g.tags === "object" ? g.tags : {};
    if (g.refs !== undefined && (typeof g.refs !== "object" || g.refs === null)) errs.push("refs がオブジェクトではない");
    var head = g.head, headBranch = null, headCommit = null;
    if (head !== undefined) {
      if (typeof head === "string" && own(refs, head)) headBranch = head;
      else if (typeof head === "string" && own(byId, head)) headCommit = head;
      else errs.push("head の指す先がない: " + head);
    }
    var stacks = {};
    function push(target, text, cls, what) {
      if (!own(byId, target)) { errs.push(what + " の指す先がない: " + text + " → " + target); return; }
      (stacks[target] = stacks[target] || []).push({ text: text, cls: cls });
    }
    Object.keys(refs).forEach(function (name) {
      if (name !== headBranch && name.indexOf("/") < 0) push(refs[name], name, "is-branch", "refs");
    });
    Object.keys(refs).forEach(function (name) {
      if (name.indexOf("/") >= 0) {
        if (name === headBranch) errs.push("HEAD がリモート追跡ブランチを指している: " + name);
        push(refs[name], name, "is-remote", "refs");
      }
    });
    Object.keys(tags).forEach(function (name) { push(tags[name], name, "is-tag", "tags"); });
    if (headBranch && headBranch.indexOf("/") < 0) {
      push(refs[headBranch], headBranch, "is-branch is-current", "refs");
      push(refs[headBranch], "HEAD", "is-head", "head");
    }
    if (headCommit) push(headCommit, "HEAD", "is-head is-detached", "head");

    // 名札を置く側: 段が2つ以上あるとき、一番下の段だけは丸の下に置く(段違いの親子をつなぐ曲線と重ならないように)
    var lanes = [];
    out.nodes.forEach(function (n) { if (lanes.indexOf(n.lane) < 0) lanes.push(n.lane); });
    lanes.sort(function (a, b) { return a - b; });
    var belowLane = lanes.length > 1 ? lanes[lanes.length - 1] : null;
    // 名札の段(丸に近いほうから 0, 1, …)。積み順は上から HEAD → HEADつきのブランチ → タグ → リモート → ほかのブランチ
    var levelsOfLane = {};
    lanes.forEach(function (lane) { levelsOfLane[lane] = 0; });
    out.nodes.forEach(function (n) {
      var st = stacks[n.id];
      if (!st) return;
      var below = n.lane === belowLane;
      st.forEach(function (p, i) {
        var lv = below ? st.length - 1 - i : i;
        out.pills.push({ text: p.text, cls: p.cls, node: n, level: lv, below: below, w: pillWidth(p.text) });
      });
      levelsOfLane[n.lane] = Math.max(levelsOfLane[n.lane], st.length);
    });

    // 列の間隔: 同じ段・同じ側・同じ高さの名札が横にぶつからない広さにする(最小 48)
    var colW = COL_W;
    out.pills.forEach(function (a) {
      out.pills.forEach(function (b) {
        if (a === b || a.node.lane !== b.node.lane || a.below !== b.below || a.level !== b.level || a.node.col >= b.node.col) return;
        var need = (a.w + b.w) / 2 + PILL_MARGIN;
        colW = Math.max(colW, Math.ceil(need / (b.node.col - a.node.col)));
      });
    });
    if (opts && opts.colW) colW = Math.max(colW, opts.colW);
    out.colW = colW;

    // 縦の位置。上の名札は丸と上の段のあいだに、下の名札は一番下の丸の下に置く
    var laneY = {}, prevCy = null, bottomExtra = 0;
    function labelH(lv) { return lv > 0 ? lv * PILL_STEP - (PILL_STEP - PILL_H) + PILL_GAP : 0; }
    lanes.forEach(function (lane) {
      var above = lane === belowLane ? 0 : labelH(levelsOfLane[lane]);
      var cy = prevCy === null ? PAD_TOP + above + R : prevCy + R + LANE_GAP + above + R;
      laneY[lane] = cy;
      prevCy = cy;
    });
    if (belowLane !== null) bottomExtra = labelH(levelsOfLane[belowLane]);
    out.height = (prevCy === null ? 0 : prevCy) + R + bottomExtra + PAD_BOTTOM;

    // 横の位置(端のラベルがはみ出すなら余白を広げる)
    var minX = Infinity, maxX = -Infinity;
    out.nodes.forEach(function (n) {
      minX = Math.min(minX, n.col * colW - R - PAD_X);
      maxX = Math.max(maxX, n.col * colW + R + PAD_X);
    });
    out.pills.forEach(function (p) {
      minX = Math.min(minX, p.node.col * colW - p.w / 2 - PILL_MARGIN);
      maxX = Math.max(maxX, p.node.col * colW + p.w / 2 + PILL_MARGIN);
    });
    var shift = -minX;
    out.width = Math.ceil(maxX - minX);
    out.nodes.forEach(function (n) { n.cx = n.col * colW + shift; n.cy = laneY[n.lane]; });
    out.pills.forEach(function (p) {
      p.x = p.node.cx - p.w / 2;
      p.y = p.below
        ? p.node.cy + R + PILL_GAP + p.level * PILL_STEP
        : p.node.cy - R - PILL_GAP - p.level * PILL_STEP - PILL_H;
    });

    // 線(子 → 親)
    out.nodes.forEach(function (n) {
      n.parents.forEach(function (pid) {
        var p = byId[pid];
        var x1 = n.cx - R, y1 = n.cy, x2 = p.cx + R + 1, y2 = p.cy;
        var d = y1 === y2
          ? "M " + x1 + " " + y1 + " L " + x2 + " " + y2
          : "M " + x1 + " " + y1 + " C " + (x1 - 24) + " " + y1 + ", " + (x2 + 24) + " " + y2 + ", " + x2 + " " + y2;
        out.edges.push({ d: d, isDim: n.isDim || p.isDim, from: n.id, to: pid });
        // 線と名札が重なっていないか(線の上の点を細かく調べる)
        for (var k = 0; k <= 40; k++) {
          var t = k / 40, u = 1 - t, px, py;
          if (y1 === y2) { px = x1 + (x2 - x1) * t; py = y1; }
          else {
            px = u * u * u * x1 + 3 * u * u * t * (x1 - 24) + 3 * u * t * t * (x2 + 24) + t * t * t * x2;
            py = u * u * u * y1 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y2;
          }
          var hit = null;
          out.pills.forEach(function (q) {
            if (px > q.x + 1 && px < q.x + q.w - 1 && py > q.y + 1 && py < q.y + PILL_H - 1) hit = q;
          });
          if (hit) { errs.push(n.id + " → " + pid + " の線が名札 " + hit.text + " に重なる"); break; }
        }
      });
    });
    // 名札どうしの重なり
    out.pills.forEach(function (a, i) {
      out.pills.slice(i + 1).forEach(function (b) {
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + PILL_H && b.y < a.y + PILL_H) errs.push("名札が重なる: " + a.text + " と " + b.text);
      });
    });
    out.headBranch = headBranch;
    out.headCommit = headCommit;
    return out;
  }

  // 図の問題点の一覧を返す(なければ空の配列)。maxCols は列数の上限(省略すると 7)
  function checkGraph(g, maxCols) {
    var lay = layout(g);
    var errs = lay.errors.slice();
    var limit = maxCols || MAX_COLS;
    if (lay.cols > limit) errs.push("列が多すぎる: " + lay.cols + "列(上限 " + limit + ")");
    if (g && g.title !== undefined && typeof g.title !== "string") errs.push("title が文字ではない");
    return errs;
  }

  // 読み上げ用の説明
  function describe(g, lay) {
    var parts = ["コミット " + lay.nodes.map(function (n) { return n.id; }).join(", ")];
    var rel = [];
    lay.nodes.forEach(function (n) {
      if (n.parents.length) rel.push(n.id + " の親は " + n.parents.join(" と "));
    });
    if (rel.length) parts.push(rel.join("、"));
    var refs = g.refs || {}, tags = g.tags || {};
    var refText = Object.keys(refs).map(function (k) { return k + " は " + refs[k] + " を指す"; })
      .concat(Object.keys(tags).map(function (k) { return "タグ " + k + " は " + tags[k] + " を指す"; }));
    if (refText.length) parts.push(refText.join("、"));
    if (lay.headBranch) parts.push("HEAD は " + lay.headBranch);
    else if (lay.headCommit) parts.push("HEAD は " + lay.headCommit + " を直接指す(detached HEAD)");
    var news = lay.nodes.filter(function (n) { return n.isNew; }).map(function (n) { return n.id; });
    var dims = lay.nodes.filter(function (n) { return n.isDim; }).map(function (n) { return n.id; });
    if (news.length) parts.push("新しいコミットは " + news.join(", "));
    if (dims.length) parts.push(dims.join(", ") + " はたどれなくなったコミット");
    return parts.join("。");
  }

  function svgEl(tag, attrs, cls) {
    var e = document.createElementNS(SVG_NS, tag);
    if (cls) e.setAttribute("class", cls);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  // 図を作って返す。opts.inline = true なら <span>(ボタンの中に入れるとき)
  function renderGraph(g, opts) {
    opts = opts || {};
    var lay = layout(g, opts);
    var wrapTag = opts.inline ? "span" : "figure";
    var fig = document.createElement(wrapTag);
    fig.className = "git-graph";
    var title = opts.title !== undefined ? opts.title : g && g.title;
    if (title) {
      var cap = document.createElement(opts.inline ? "span" : "figcaption");
      cap.className = "gg-caption";
      cap.textContent = title;
      fig.appendChild(cap);
    }
    // minWidth: 横幅をそろえるとき(左右に同じだけ余白を足す)。縮尺は変わらない
    var W = Math.max(lay.width, opts.minWidth || 0), H = lay.height, ox = -(W - lay.width) / 2;
    var svg = svgEl("svg", { role: "img", "aria-label": (title ? title + ": " : "") + describe(g || {}, lay), viewBox: ox + " 0 " + W + " " + H });
    svg.style.width = W + "px";

    var mid = "gg-arrow-" + (++markerNo);
    var defs = svgEl("defs");
    var marker = svgEl("marker", { id: mid, viewBox: "0 0 6 6", refX: "6", refY: "3", markerWidth: "6", markerHeight: "6", markerUnits: "userSpaceOnUse", orient: "auto" }, "gg-arrow");
    marker.appendChild(svgEl("path", { d: "M 0 0 L 6 3 L 0 6 z" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var ge = svgEl("g", {}, "gg-edges");
    lay.edges.forEach(function (e) {
      ge.appendChild(svgEl("path", { d: e.d, "marker-end": "url(#" + mid + ")" }, "gg-edge" + (e.isDim ? " is-dim" : "")));
    });
    svg.appendChild(ge);

    var gn = svgEl("g", {}, "gg-nodes");
    lay.nodes.forEach(function (n) {
      var node = svgEl("g", {}, "gg-node" + (n.isNew ? " is-new" : "") + (n.isDim ? " is-dim" : ""));
      node.appendChild(svgEl("circle", { cx: n.cx, cy: n.cy, r: R }, "gg-dot"));
      var t = svgEl("text", { x: n.cx, y: n.cy }, "gg-id");
      t.textContent = n.id;
      node.appendChild(t);
      gn.appendChild(node);
    });
    svg.appendChild(gn);

    var gr = svgEl("g", {}, "gg-refs");
    lay.pills.forEach(function (p) {
      var ref = svgEl("g", {}, "gg-ref " + p.cls);
      ref.appendChild(svgEl("rect", { x: round(p.x), y: p.y, width: round(p.w), height: PILL_H, rx: 10, ry: 10 }, "gg-pill"));
      var t = svgEl("text", { x: p.node.cx, y: p.y + PILL_H / 2 }, "gg-ref-text");
      t.textContent = p.text;
      ref.appendChild(t);
      gr.appendChild(ref);
    });
    svg.appendChild(gr);
    fig.appendChild(svg);
    return fig;
  }
  function round(v) { return Math.round(v * 10) / 10; }

  // いくつかの図を同じ縮尺で描く(列の間隔と横幅をそろえる)。1問の選択肢、帳の実行前・実行後に使う
  function renderGraphSet(graphs, opts) {
    opts = opts || {};
    var colW = 0;
    graphs.forEach(function (g) { colW = Math.max(colW, layout(g).colW || 0); });
    var width = 0;
    graphs.forEach(function (g) { width = Math.max(width, layout(g, { colW: colW }).width); });
    return graphs.map(function (g, i) {
      var o = {};
      Object.keys(opts).forEach(function (k) { o[k] = opts[k]; });
      if (Array.isArray(opts.titles)) o.title = opts.titles[i];
      o.colW = colW;
      o.minWidth = width;
      return renderGraph(g, o);
    });
  }

  GITD.MAX_COLS = MAX_COLS;
  GITD.MAX_COLS_CHOICE = MAX_COLS_CHOICE;
  GITD.layoutGraph = layout;
  GITD.checkGraph = checkGraph;
  GITD.renderGraph = renderGraph;
  GITD.renderGraphSet = renderGraphSet;
})(GITD);

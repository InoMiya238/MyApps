// 将棋道場: 盤面図をSVGで描く。
// 使い方: ShogiBoard.render(containerEl, board, { caption: "…" })
//   board = { sente: "88玉 78金 …", gote: "…", view: "full" または { files:[9,5], ranks:[5,9] },
//             hand: { sente: "角 歩3", gote: "" }, key: ["24"], aim: ["23"] }
// 向きはつねに先手が下。色は theme.css の変数(--board など)を使う。
var ShogiBoard = (function () {
  "use strict";

  var CELL_W = 40, CELL_H = 44;      // マスの大きさ(viewBox の単位)
  var PAD_L = 6, PAD_T = 22, PAD_R = 24, PAD_B = 6;
  var KANJI = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  var KANJI_COUNT = ["", "", "二", "三", "四", "五", "六", "七", "八", "九", "十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八"];
  var PROMOTED = "と杏圭全馬龍";
  var PIECE_FONT = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
  var PIECE_SHAPE = [[0, -20], [13, -15], [16, 19], [-16, 19], [-13, -15]];

  var CSS =
    ".sb{margin:0;}" +
    ".sb-inner{margin:0 auto;}" +
    ".sb svg{width:100%;height:auto;display:block;margin:0 auto;}" +
    ".sb-hand{margin:0;font-size:13px;line-height:1.5;color:var(--ink-muted);}" +
    ".sb-hand-gote{margin-bottom:4px;}" +
    ".sb-hand-sente{margin-top:4px;text-align:right;}" +
    ".sb-hand b{color:var(--ink);font-weight:600;}" +
    ".sb figcaption{margin-top:8px;text-align:center;font-size:12.5px;line-height:1.6;color:var(--ink-faint);}";

  function injectStyle() {
    if (document.getElementById("sb-style")) return;
    var style = document.createElement("style");
    style.id = "sb-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // "88玉 78金" → [{ file:8, rank:8, piece:"玉" }, …]
  function parsePieces(str) {
    return String(str || "").split(/\s+/).filter(Boolean).map(function (t) {
      return { file: Number(t.charAt(0)), rank: Number(t.charAt(1)), piece: t.charAt(2) };
    }).filter(function (p) {
      return p.file >= 1 && p.file <= 9 && p.rank >= 1 && p.rank <= 9 && p.piece;
    });
  }

  // "角 歩3" → "角 歩三"。空なら「なし」
  function handText(str) {
    var parts = String(str || "").split(/\s+/).filter(Boolean).map(function (t) {
      var n = t.length > 1 ? Number(t.slice(1)) : 1;
      return t.charAt(0) + (KANJI_COUNT[n] || "");
    });
    return parts.length ? parts.join(" ") : "なし";
  }

  function getView(board) {
    var v = board.view;
    if (!v || v === "full") return { fHi: 9, fLo: 1, rLo: 1, rHi: 9, full: true };
    return { fHi: v.files[0], fLo: v.files[1], rLo: v.ranks[0], rHi: v.ranks[1], full: false };
  }

  function squareName(file, rank) { return file + KANJI[rank]; }

  function describe(board, sente, gote) {
    function list(pieces, isGote) {
      return pieces.map(function (p) {
        return squareName(p.file, p.rank) + (isGote && p.piece === "玉" ? "王" : p.piece);
      }).join("、");
    }
    var text = "先手 " + (sente.length ? list(sente, false) : "なし");
    if (board.hand) text += "、持ち駒 " + handText(board.hand.sente);
    if (gote.length || board.hand) {
      text += "。後手 " + (gote.length ? list(gote, true) : "なし");
      if (board.hand) text += "、持ち駒 " + handText(board.hand.gote);
    }
    if (board.key && board.key.length) {
      text += "。主役の駒 " + board.key.map(function (k) { return squareName(k.charAt(0), Number(k.charAt(1))); }).join("、");
    }
    if (board.aim && board.aim.length) {
      text += "。ねらっているマス " + board.aim.map(function (k) { return squareName(k.charAt(0), Number(k.charAt(1))); }).join("、");
    }
    return text;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function buildSvg(board, view) {
    var cols = view.fHi - view.fLo + 1, rows = view.rHi - view.rLo + 1;
    var W = PAD_L + cols * CELL_W + PAD_R, H = PAD_T + rows * CELL_H + PAD_B;
    var x0 = PAD_L, y0 = PAD_T, x1 = PAD_L + cols * CELL_W, y1 = PAD_T + rows * CELL_H;
    var sente = parsePieces(board.sente), gote = parsePieces(board.gote);

    function inView(file, rank) {
      return file <= view.fHi && file >= view.fLo && rank >= view.rLo && rank <= view.rHi;
    }
    function cellX(file) { return x0 + (view.fHi - file) * CELL_W; }
    function cellY(rank) { return y0 + (rank - view.rLo) * CELL_H; }
    function marks(list) {
      return (list || []).map(function (k) { return { file: Number(k.charAt(0)), rank: Number(k.charAt(1)) }; })
        .filter(function (m) { return inView(m.file, m.rank); });
    }

    var s = "";
    // (1) 盤の地
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (cols * CELL_W) + '" height="' + (rows * CELL_H) + '" fill="var(--board)"/>';
    // (2) 主役のマス
    marks(board.key).forEach(function (m) {
      s += '<rect x="' + cellX(m.file) + '" y="' + cellY(m.rank) + '" width="' + CELL_W + '" height="' + CELL_H + '" fill="var(--board-mark)"/>';
    });
    // (3) 罫線。内側は太さ1
    var i;
    for (i = 1; i < cols; i++) {
      s += '<line x1="' + (x0 + i * CELL_W) + '" y1="' + y0 + '" x2="' + (x0 + i * CELL_W) + '" y2="' + y1 + '" stroke="var(--board-line)" stroke-width="1"/>';
    }
    for (i = 1; i < rows; i++) {
      s += '<line x1="' + x0 + '" y1="' + (y0 + i * CELL_H) + '" x2="' + x1 + '" y2="' + (y0 + i * CELL_H) + '" stroke="var(--board-line)" stroke-width="1"/>';
    }
    // 外枠。本当の盤の端は太い実線、切り出しで切れた辺は細い破線
    function edge(ax, ay, bx, by, real) {
      return '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="var(--board-line)" ' +
        (real ? 'stroke-width="2.5" stroke-linecap="square"' : 'stroke-width="1" stroke-dasharray="3 3"') + '/>';
    }
    s += edge(x0, y0, x1, y0, view.rLo === 1);   // 上
    s += edge(x0, y1, x1, y1, view.rHi === 9);   // 下
    s += edge(x0, y0, x0, y1, view.fHi === 9);   // 左
    s += edge(x1, y0, x1, y1, view.fLo === 1);   // 右
    // (4) 星。6-7筋の間・3-4筋の間と、三-四段の間・六-七段の間の交点
    [6, 3].forEach(function (fileRight) {
      [3, 6].forEach(function (rankAbove) {
        if (inView(fileRight + 1, rankAbove) && inView(fileRight, rankAbove + 1)) {
          s += '<circle cx="' + cellX(fileRight) + '" cy="' + cellY(rankAbove + 1) + '" r="2.5" fill="var(--board-line)"/>';
        }
      });
    });
    // (5) 駒
    function piece(p, isGote) {
      if (!inView(p.file, p.rank)) return "";
      var cx = cellX(p.file) + CELL_W / 2, cy = cellY(p.rank) + CELL_H / 2;
      var pts = PIECE_SHAPE.map(function (d) { return (cx + d[0]) + "," + (cy + d[1]); }).join(" ");
      var ch = isGote && p.piece === "玉" ? "王" : p.piece;
      var ink = PROMOTED.indexOf(p.piece) >= 0 ? "var(--piece-promoted)" : "var(--piece-ink)";
      var g = '<polygon points="' + pts + '" fill="var(--piece)" stroke="var(--piece-edge)" stroke-width="1" stroke-linejoin="round"/>' +
        '<text x="' + cx + '" y="' + (cy + 3) + '" font-size="24" font-weight="700" text-anchor="middle" dominant-baseline="central" ' +
        'fill="' + ink + '" style="font-family:' + esc(PIECE_FONT) + '">' + esc(ch) + '</text>';
      return isGote ? '<g transform="rotate(180 ' + cx + ' ' + cy + ')">' + g + '</g>' : '<g>' + g + '</g>';
    }
    sente.forEach(function (p) { s += piece(p, false); });
    gote.forEach(function (p) { s += piece(p, true); });
    // (6) ねらっているマス(駒の上に枠を描く)
    marks(board.aim).forEach(function (m) {
      s += '<rect x="' + (cellX(m.file) + 2) + '" y="' + (cellY(m.rank) + 2) + '" width="' + (CELL_W - 4) + '" height="' + (CELL_H - 4) + '" fill="none" stroke="var(--board-aim)" stroke-width="3"/>';
    });
    // (7) 符号。筋は上に算用数字、段は右に漢数字
    var f, r;
    for (f = view.fHi; f >= view.fLo; f--) {
      s += '<text x="' + (cellX(f) + CELL_W / 2) + '" y="' + (y0 - 11) + '" font-size="13" font-weight="600" text-anchor="middle" dominant-baseline="central" fill="var(--ink-muted)" style="font-family:var(--font-mono)">' + f + '</text>';
    }
    for (r = view.rLo; r <= view.rHi; r++) {
      s += '<text x="' + (x1 + 13) + '" y="' + (cellY(r) + CELL_H / 2) + '" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--ink-muted)" style="font-family:var(--font-body)">' + KANJI[r] + '</text>';
    }

    var label = describe(board, sente.filter(function (p) { return inView(p.file, p.rank); }), gote.filter(function (p) { return inView(p.file, p.rank); }));
    return {
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + '">' + s + '</svg>',
      maxWidth: view.full ? 400 : cols * 44 + 30
    };
  }

  function render(containerEl, board, options) {
    if (!containerEl || !board) return null;
    injectStyle();
    var opts = options || {};
    var view = getView(board);
    var svg = buildSvg(board, view);

    var figure = document.createElement("figure");
    figure.className = "sb";
    var inner = document.createElement("div");
    inner.className = "sb-inner";
    inner.style.maxWidth = svg.maxWidth + "px";

    var html = "";
    if (board.hand) html += '<p class="sb-hand sb-hand-gote">△後手 持ち駒 <b>' + esc(handText(board.hand.gote)) + '</b></p>';
    html += svg.html;
    if (board.hand) html += '<p class="sb-hand sb-hand-sente">▲先手 持ち駒 <b>' + esc(handText(board.hand.sente)) + '</b></p>';
    inner.innerHTML = html;
    figure.appendChild(inner);

    if (opts.caption) {
      var cap = document.createElement("figcaption");
      cap.textContent = opts.caption;
      figure.appendChild(cap);
    }
    containerEl.innerHTML = "";
    containerEl.appendChild(figure);
    return figure;
  }

  return { render: render };
})();

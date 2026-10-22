// 世界地図道場: 地図の表示部品(index.html と atlas.html が使う)。
// map.js の WMAP_GEO からインラインSVGを1回だけ組み立て、表示範囲(viewBox)と色の印を切り替えて使う。
// 読み込む順番: map.js → countries.js → data.js → mapview.js
// 見た目のCSSは、両ページの <style> の「地図の表示部品」にある(変えるときは両方を直す)。
//
//   var view = WMapView.create(hostElement, { label: "世界地図", onTap: function (key) {…} });
//   view.setView(rect, { focus: "asia", shortcuts: [{ label, rect }] })  表示範囲を決めて、拡大を元に戻す
//        rect = [x, y, w, h]。右端が 1000 をこえる範囲(オセアニア州など)では、日付変更線をまたぐ国に alt を使う。
//        focus の州の国だけをふつうの色にし、ほかの州の国はうすくする(省略するとすべてふつうの色)
//   view.setTappable(true)    タップで国を選べるようにする(onTap が呼ばれる)。
//        小さな国の円と別の国が指の下で重なるときは、onTap を呼ばずに、その点を中心に拡大する
//   view.mark(key, "target" | "good" | "bad" | "pick")   国に色の印をつける。小さな国には円の枠もつける
//   view.clearMarks()
//   view.reveal(key, { keepIfVisible })  その国が表示範囲の外なら、元の範囲に戻す(それでも外なら、国が入るように広げる)。
//        keepIfVisible: true なら、国の一部でも見えているときは範囲を変えない
//   view.zoomTo(key)          その国が大きく見えるように拡大する
//   view.pxSize(key)          いまの表示で、その国が画面で何pxの大きさか
//   view.reset()              拡大を元に戻す
var WMapView = (function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var MARKER_PX = 5;      // 小さな国の円の半径(画面上のpx)
  var RING_PX = 13;       // 印をつけた小さな国の枠の半径
  var HIT_PX = 13;        // 海の上なら、円からこの距離までを小さな国のタップとみなす
  var ON_MARKER_SLACK_PX = 3;   // 大きな国の上で、円の外側この幅の余白を押したときは、拡大して選び直させる
  var TINY_PX = 16;       // 元の範囲でこれより小さく見える国にも、印をつけるとき枠を足す
  var AMBIGUOUS_PX = 30;  // 円の下の国がこれより小さく見えるときは、拡大してから選んでもらう
  var MAX_ZOOM = 24;      // 元の範囲から何倍まで拡大できるか
  var SEP_PX = 18;        // 重なった円をタップして拡大するとき、候補の円どうしをこの距離まで離す
  var LOCAL_STEP_PX = 3;  // 押した点のまわりで国の大きさを測るときの刻み
  var LOCAL_MAX_PX = 45;  // 測る長さの上限(片側)
  var VISIBLE_MIN_HITS = 12;   // 表示範囲を25×15に分けた点のうち、この数以上が国に入れば「見えている」とする
  var TAP_MOVE_PX = 8;    // これより動いたら、タップではなくドラッグ

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function btn(text, label, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "wmap-btn" + (cls ? " " + cls : "");
    b.textContent = text;
    if (label) b.setAttribute("aria-label", label);
    return b;
  }
  function f1(v) { return String(Math.round(v * 100) / 100); }

  function create(host, opts) {
    opts = opts || {};
    var GEO = WMAP_GEO;
    var keys = Object.keys(GEO.countries);
    var smallKeys = keys.filter(function (k) { return GEO.countries[k].small; });

    host.classList.add("wmap");
    host.innerHTML = "";
    var stage = document.createElement("div");
    stage.className = "wmap-stage";
    stage.tabIndex = 0;
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", (opts.label || "世界地図") + "。矢印キーで移動、+ と − で拡大・縮小");
    var svg = svgEl("svg", { "class": "wmap-svg", viewBox: "0 0 1000 500", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" });
    svg.appendChild(svgEl("rect", { "class": "wmap-sea", x: -400, y: -300, width: 1900, height: 1100 }));
    var gOthers = svgEl("g", { "class": "wmap-others" });
    var gCountries = svgEl("g", { "class": "wmap-countries" });
    var gMarkers = svgEl("g", { "class": "wmap-markers" });
    var gRings = svgEl("g", { "class": "wmap-rings" });
    svg.appendChild(gOthers); svg.appendChild(gCountries); svg.appendChild(gMarkers); svg.appendChild(gRings);
    (GEO.others || []).forEach(function (o) {
      var p = svgEl("path", { "class": "wmap-o", d: o.d });
      gOthers.appendChild(p);
    });
    var paths = {}, markers = {};
    keys.forEach(function (k) {
      var g = GEO.countries[k];
      var p = svgEl("path", { "class": "wmap-c", d: g.d, "data-key": k });
      paths[k] = p;
      gCountries.appendChild(p);
      if (g.small) {
        var m = svgEl("circle", { "class": "wmap-m", cx: g.cx, cy: g.cy, r: 4, "data-key": k });
        markers[k] = m;
        gMarkers.appendChild(m);
      }
    });
    stage.appendChild(svg);

    var tools = document.createElement("div");
    tools.className = "wmap-tools";
    var zoomIn = btn("+", "拡大"), zoomOut = btn("−", "縮小"), resetBtn = btn("元の範囲", "拡大を元に戻す", "wide");
    tools.appendChild(zoomIn); tools.appendChild(zoomOut); tools.appendChild(resetBtn);
    var shortcutBox = document.createElement("span");
    shortcutBox.className = "wmap-shortcuts";
    tools.appendChild(shortcutBox);
    var msg = document.createElement("p");
    msg.className = "wmap-msg";
    msg.setAttribute("role", "status");
    msg.hidden = true;
    host.appendChild(stage);
    host.appendChild(msg);
    host.appendChild(tools);

    // ---------- 状態 ----------
    var raw = [0, 0, 1000, 500];   // 指定された範囲
    var base = { x: 0, y: 0, w: 1000, h: 500 };   // 画面の縦横比に合わせて広げた範囲
    var view = { x: 0, y: 0, w: 1000, h: 500 };
    var useAlt = false, tappable = false, focusRegion = null;
    var marks = {};
    var stageW = 0, stageH = 0;

    function geom(k) {
      var g = GEO.countries[k];
      return useAlt && g.alt ? g.alt : g;
    }
    function upp() { return stageW > 0 ? view.w / stageW : 1; }   // 画面1pxあたりの地図の長さ

    // 地図の高さを、範囲の縦横比から決める(せまい画面で低くなりすぎず、広い画面で高くなりすぎない)
    function layout() {
      var w = stage.clientWidth || 320;
      var aspect = raw[2] / raw[3];
      var maxH = Math.min(Math.max(window.innerHeight * 0.62, 260), 540);
      var h = Math.round(Math.max(200, Math.min(w / aspect, maxH)));
      stage.style.height = h + "px";
      // 枠線の内側(地図が描かれる広さ)で比を決める
      stageW = stage.clientWidth || w; stageH = stage.clientHeight || h;
      var ratio = stageW / stageH;
      var bw = raw[2], bh = raw[3];
      if (bw / bh < ratio) bw = bh * ratio; else bh = bw / ratio;
      base = { x: raw[0] + raw[2] / 2 - bw / 2, y: raw[1] + raw[3] / 2 - bh / 2, w: bw, h: bh };
    }
    function bounds() {
      var right = useAlt ? 1095 : 1015;
      var x0 = Math.min(-15, base.x), y0 = Math.min(-10, base.y);
      var x1 = Math.max(right, base.x + base.w), y1 = Math.max(510, base.y + base.h);
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    function clampView() {
      var minW = base.w / MAX_ZOOM, maxW = base.w;
      var cx = view.x + view.w / 2, cy = view.y + view.h / 2;
      var w = Math.max(minW, Math.min(maxW, view.w));
      var h = w * base.h / base.w;
      var b = bounds();
      cx = w >= b.w ? b.x + b.w / 2 : Math.max(b.x + w / 2, Math.min(b.x + b.w - w / 2, cx));
      cy = h >= b.h ? b.y + b.h / 2 : Math.max(b.y + h / 2, Math.min(b.y + b.h - h / 2, cy));
      view = { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
    }
    function apply() {
      clampView();
      svg.setAttribute("viewBox", [view.x, view.y, view.w, view.h].map(f1).join(" "));
      var u = upp();
      smallKeys.forEach(function (k) { markers[k].setAttribute("r", f1(MARKER_PX * u)); });
      Array.prototype.forEach.call(gRings.childNodes, function (r) { r.setAttribute("r", f1(RING_PX * u)); });
      zoomIn.disabled = view.w <= base.w / MAX_ZOOM + 1e-6;
      zoomOut.disabled = view.w >= base.w - 1e-6;
      resetBtn.disabled = Math.abs(view.w - base.w) < 1e-6 && Math.abs(view.x - base.x) < 1e-6 && Math.abs(view.y - base.y) < 1e-6;
      host.classList.toggle("zoomed", view.w < base.w - 1e-6);
    }
    function zoomAt(factor, px, py) {
      // px, py: 地図の座標。その点を画面の同じ場所に残して拡大・縮小する
      var w = Math.max(base.w / MAX_ZOOM, Math.min(base.w, view.w / factor));
      var k = w / view.w;
      view = { x: px - (px - view.x) * k, y: py - (py - view.y) * k, w: w, h: view.h * k };
      apply();
    }
    function center() { return [view.x + view.w / 2, view.y + view.h / 2]; }
    // 地図が描かれる範囲(枠線の内側)の、画面上の位置と大きさ
    function inner() {
      var b = stage.getBoundingClientRect();
      return { left: b.left + stage.clientLeft, top: b.top + stage.clientTop, width: stage.clientWidth || b.width, height: stage.clientHeight || b.height };
    }
    function toMap(clientX, clientY) {
      var r = inner();
      return [view.x + (clientX - r.left) * view.w / r.width, view.y + (clientY - r.top) * view.h / r.height];
    }

    function setAlt(on) {
      useAlt = on;
      keys.forEach(function (k) {
        var g = GEO.countries[k];
        if (!g.alt) return;
        var src = on ? g.alt : g;
        paths[k].setAttribute("d", src.d);
        if (markers[k]) { markers[k].setAttribute("cx", src.cx); markers[k].setAttribute("cy", src.cy); }
      });
      redrawRings();
    }

    function setView(rect, o) {
      o = o || {};
      raw = rect.slice();
      setAlt(rect[0] + rect[2] > 1000);
      focusRegion = o.focus || null;
      keys.forEach(function (k) {
        var c = typeof WMAP !== "undefined" ? WMAP.country(k) : null;
        paths[k].classList.toggle("dim", !!focusRegion && !!c && c.region !== focusRegion);
        if (markers[k]) markers[k].classList.toggle("dim", !!focusRegion && !!c && c.region !== focusRegion);
      });
      shortcutBox.innerHTML = "";
      (o.shortcuts || []).forEach(function (s) {
        var b = btn(s.label, null, "wide");
        b.addEventListener("click", function () { fitRect(s.rect); });
        shortcutBox.appendChild(b);
      });
      layout();
      view = { x: base.x, y: base.y, w: base.w, h: base.h };
      apply();
    }
    // 長方形が入るように拡大する(元の範囲より広くはしない)
    function fitRect(rect, pad) {
      pad = pad || 0;
      var w = rect[2] * (1 + pad * 2), h = rect[3] * (1 + pad * 2);
      var ratio = base.w / base.h;
      if (w / h < ratio) w = h * ratio;
      view = { x: rect[0] + rect[2] / 2 - w / 2, y: rect[1] + rect[3] / 2 - w / ratio / 2, w: w, h: w / ratio };
      apply();
    }
    function reset() { view = { x: base.x, y: base.y, w: base.w, h: base.h }; apply(); }

    function inside(bb, v) {
      return bb[0] >= v.x && bb[1] >= v.y && bb[0] + bb[2] <= v.x + v.w && bb[1] + bb[3] <= v.y + v.h;
    }
    // その国が、いまの表示範囲にある程度見えているか(表示範囲を格子に分けて、国の面に入る点を数える)。
    // 角にわずかに入っているだけのときは、見えていないとみなす
    function partlyVisible(k) {
      var g = geom(k);
      if (GEO.countries[k].small) return inside([g.cx, g.cy, 0, 0], view);
      var bb = g.bbox;
      if (bb[0] > view.x + view.w || bb[1] > view.y + view.h || bb[0] + bb[2] < view.x || bb[1] + bb[3] < view.y) return false;
      var path = paths[k], pt = svg.createSVGPoint();
      if (!path.isPointInFill) return true;
      var hits = 0;
      for (var i = 0; i <= 24; i++) {
        for (var j = 0; j <= 14; j++) {
          pt.x = view.x + view.w * i / 24; pt.y = view.y + view.h * j / 14;
          try { if (path.isPointInFill(pt) && ++hits >= VISIBLE_MIN_HITS) return true; } catch (e) { return true; }
        }
      }
      return false;
    }
    // o.keepIfVisible: 国の一部が見えていれば、範囲を変えない
    function reveal(k, o) {
      if (!GEO.countries[k]) return;
      if (o && o.keepIfVisible && partlyVisible(k)) return;
      var g = geom(k), pt = [g.cx, g.cy, 0, 0];
      var target = GEO.countries[k].small ? pt : g.bbox;
      if (inside(target, view)) return;
      reset();
      if (inside(pt, view)) return;
      // 元の範囲の外にある国(地図帳の全体図で選んだ国など)は、元の範囲と国が両方入るように広げる
      var x0 = Math.min(base.x, g.bbox[0]), y0 = Math.min(base.y, g.bbox[1]);
      var x1 = Math.max(base.x + base.w, g.bbox[0] + g.bbox[2]), y1 = Math.max(base.y + base.h, g.bbox[1] + g.bbox[3]);
      raw = [x0, y0, x1 - x0, y1 - y0];
      layout();
      reset();
    }
    function zoomTo(k) {
      if (!GEO.countries[k]) return;
      var g = geom(k), bb = g.bbox;
      var minSide = base.w / 6;   // 小さな国は、まわりの国も見える程度にとどめる
      var w = Math.max(bb[2], minSide), h = Math.max(bb[3], minSide * base.h / base.w);
      if (GEO.countries[k].small) fitRect([g.cx - w / 2, g.cy - h / 2, w, h], 0.25);
      else fitRect([bb[0] + bb[2] / 2 - w / 2, bb[1] + bb[3] / 2 - h / 2, w, h], 0.25);
    }

    // ---------- 印 ----------
    function isTiny(k) {
      if (GEO.countries[k].small) return true;
      var bb = geom(k).bbox, u = base.w / (stageW || 320);
      return Math.max(bb[2], bb[3]) / u < TINY_PX;
    }
    // いまの表示で、国の大きさ(bbox の長いほうの辺)が画面で何pxか
    function pxSize(k) {
      if (!GEO.countries[k]) return 0;
      var bb = geom(k).bbox;
      return Math.max(bb[2], bb[3]) / upp();
    }
    function redrawRings() {
      gRings.innerHTML = "";
      Object.keys(marks).forEach(function (k) {
        if (!isTiny(k)) return;
        var g = geom(k);
        gRings.appendChild(svgEl("circle", { "class": "wmap-ring " + marks[k], cx: g.cx, cy: g.cy, r: f1(RING_PX * upp()) }));
      });
    }
    function mark(k, cls) {
      if (!paths[k]) return;
      clearMark(k);
      marks[k] = cls;
      paths[k].classList.add("is-" + cls);
      gCountries.appendChild(paths[k]);   // 国境線が隣の国に隠れないよう、いちばん上に
      if (markers[k]) { markers[k].classList.add("is-" + cls); gMarkers.appendChild(markers[k]); }
      redrawRings();
    }
    function clearMark(k) {
      if (!marks[k]) return;
      paths[k].classList.remove("is-" + marks[k]);
      if (markers[k]) markers[k].classList.remove("is-" + marks[k]);
      delete marks[k];
    }
    function clearMarks() { Object.keys(marks).forEach(clearMark); redrawRings(); }
    function setTappable(on) { tappable = !!on; host.classList.toggle("tappable", tappable); }

    // ---------- タップ ----------
    // 画面の点の下にある国(大きな国の面。小さな国の円は数えない)
    function countryUnder(clientX, clientY) {
      var els = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [document.elementFromPoint(clientX, clientY)];
      for (var i = 0; i < els.length; i++) {
        var e = els[i];
        if (e && e.classList && e.classList.contains("wmap-c") && stage.contains(e)) return e.getAttribute("data-key");
      }
      return null;
    }
    // 押した点のまわりで、その国が画面で何pxの大きさに見えるか。
    // 8方向に LOCAL_STEP_PX ずつ進んで国の外に出るまでの長さを測り、向かい合う2方向の和(4本)の最大をとる。
    // bbox を使わないので、飛び地の多い国(マレーシアなど)を大きく見積もらない
    function localSize(k, clientX, clientY) {
      var r = inner(), spans = [];
      var dirs = [[1, 0], [0, 1], [0.7071, 0.7071], [0.7071, -0.7071]];
      dirs.forEach(function (dv) {
        var span = 0;
        [1, -1].forEach(function (sg) {
          for (var d = LOCAL_STEP_PX; d <= LOCAL_MAX_PX; d += LOCAL_STEP_PX) {
            var x = clientX + dv[0] * d * sg, y = clientY + dv[1] * d * sg;
            if (x < r.left || x > r.left + r.width || y < r.top || y > r.top + r.height || countryUnder(x, y) !== k) { span += d - LOCAL_STEP_PX; return; }
          }
          span += LOCAL_MAX_PX;
        });
        spans.push(span);
      });
      return Math.max.apply(null, spans);
    }

    // タップした点の国を調べる。{ key: いちばんありそうな国 | null, ambiguous: 拡大して選び直させるか, zoom: 必要な倍率 }
    //   即決: 小さな国の円の内側(半径 MARKER_PX)で、ほかの円が近くにないとき / 円から離れた大きな国の面 /
    //         海の上で、近くの円が1つだけのとき
    //   拡大: 円が2つ以上近い / 大きな国の上で円の外側の余白(ON_MARKER_SLACK_PX)を押した /
    //         円の内側だが、下の国が押した点のまわりで小さい(円に隠れやすい)
    function hitTest(clientX, clientY) {
      var p = toMap(clientX, clientY), u = upp();
      var under = countryUnder(clientX, clientY);
      if (under && GEO.countries[under].small) under = null;   // 小さな国の面は、円と同じ扱い
      var reach = under ? MARKER_PX + ON_MARKER_SLACK_PX : HIT_PX;
      var near = [];
      smallKeys.forEach(function (k) {
        var g = geom(k);
        var d = Math.sqrt((g.cx - p[0]) * (g.cx - p[0]) + (g.cy - p[1]) * (g.cy - p[1])) / u;
        if (d <= reach) near.push({ key: k, d: d });
      });
      near.sort(function (a, b) { return a.d - b.d; });
      // 指の下が小さな国の面で、近くに円がないとき(拡大して小さな国が見えているとき)
      if (near.length === 0) {
        var raw = countryUnder(clientX, clientY);
        return { key: under || raw, ambiguous: false, zoom: 1 };
      }
      var need = 1;
      for (var a = 0; a < near.length; a++) {
        for (var b = a + 1; b < near.length; b++) {
          var ga = geom(near[a].key), gb = geom(near[b].key);
          var sep = Math.max(0.01, Math.sqrt((ga.cx - gb.cx) * (ga.cx - gb.cx) + (ga.cy - gb.cy) * (ga.cy - gb.cy)) / u);
          need = Math.max(need, SEP_PX / sep);
        }
      }
      if (near.length > 1) return { key: near[0].key, ambiguous: true, zoom: need };
      var only = near[0];
      if (!under) return { key: only.key, ambiguous: false, zoom: 1 };      // 海の上
      if (only.d > MARKER_PX) {
        // 円の外側の余白: 拡大して、円と下の国がはっきり分かれるようにする
        return { key: under, ambiguous: true, zoom: Math.max(need, (reach + 4) / Math.max(1, only.d)) };
      }
      var size = localSize(under, clientX, clientY);
      if (size < AMBIGUOUS_PX) return { key: only.key, ambiguous: true, zoom: Math.max(need, AMBIGUOUS_PX * 1.15 / Math.max(1, size)) };
      return { key: only.key, ambiguous: false, zoom: 1 };
    }
    function keyAt(clientX, clientY) { return hitTest(clientX, clientY).key; }

    // 近くに国が重なっていて決められないときは、その点を中心に拡大して、もう一度押してもらう
    var msgTimer = null;
    function say(text) {
      msg.textContent = text;
      msg.hidden = !text;
      if (msgTimer) clearTimeout(msgTimer);
      if (text) msgTimer = setTimeout(function () { msg.hidden = true; msg.textContent = ""; }, 3500);
    }
    function handleTap(clientX, clientY) {
      var h = hitTest(clientX, clientY);
      if (!h.key) return;
      if (h.ambiguous && view.w > base.w / MAX_ZOOM + 1e-6) {
        var p = toMap(clientX, clientY);
        // 必要な倍率まで1回で拡大する(少なくとも2.5倍。上限は MAX_ZOOM)
        // 押した点を中心にする(候補の円が画面の外に出ないように)
        var f = Math.max(2.5, h.zoom * 1.1);
        var w = Math.max(base.w / MAX_ZOOM, view.w / f), hh = w * view.h / view.w;
        view = { x: p[0] - w / 2, y: p[1] - hh / 2, w: w, h: hh };
        apply();
        say("近くに国が重なっているので拡大しました。もう一度タップしてください。");
        return;
      }
      say("");
      opts.onTap(h.key);
    }

    // ---------- ドラッグ・ピンチ ----------
    var pointers = {}, gesture = null;
    function pts() { return Object.keys(pointers).map(function (id) { return pointers[id]; }); }
    function startGesture(isTap) {
      var list = pts();
      if (list.length === 1) {
        gesture = { kind: "pan", x: list[0].x, y: list[0].y, v: { x: view.x, y: view.y, w: view.w, h: view.h }, tap: isTap, moved: false };
      } else if (list.length >= 2) {
        var a = list[0], b = list[1];
        gesture = { kind: "pinch", d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2,
          v: { x: view.x, y: view.y, w: view.w, h: view.h }, tap: false };
      } else {
        gesture = null;
      }
    }
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* 取れなくても動く */ }
      startGesture(pts().length === 1);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId] || !gesture) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var r = inner(), list = pts();
      if (gesture.kind === "pan") {
        var dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
        if (!gesture.moved && Math.hypot(dx, dy) < TAP_MOVE_PX) return;
        gesture.moved = true;
        host.classList.add("dragging");
        var k = gesture.v.w / r.width;
        view = { x: gesture.v.x - dx * k, y: gesture.v.y - dy * k, w: gesture.v.w, h: gesture.v.h };
        apply();
      } else if (list.length >= 2) {
        var a = list[0], b = list[1];
        var d = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var v0 = gesture.v;
        // ピンチを始めた点の地図の座標が、いまの2本の指の中点にくるように
        var px = v0.x + (gesture.mx - r.left) * v0.w / r.width, py = v0.y + (gesture.my - r.top) * v0.h / r.height;
        var w = Math.max(base.w / MAX_ZOOM, Math.min(base.w, v0.w * gesture.d / d));
        var h = w * v0.h / v0.w;
        view = { x: px - (mx - r.left) * w / r.width, y: py - (my - r.top) * h / r.height, w: w, h: h };
        apply();
      }
    });
    function endPointer(e, cancelled) {
      if (!pointers[e.pointerId]) return;
      var g = gesture;
      delete pointers[e.pointerId];
      if (pts().length > 0) { startGesture(false); return; }
      gesture = null;
      host.classList.remove("dragging");
      if (!cancelled && g && g.kind === "pan" && g.tap && !g.moved && tappable && typeof opts.onTap === "function") {
        handleTap(e.clientX, e.clientY);
      }
    }
    stage.addEventListener("pointerup", function (e) { endPointer(e, false); });
    stage.addEventListener("pointercancel", function (e) { endPointer(e, true); });
    // パソコン: Ctrl(Mac は ⌘ も)+ ホイール、またはトラックパッドのピンチで拡大・縮小。ふつうのホイールはページのスクロール
    stage.addEventListener("wheel", function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      var p = toMap(e.clientX, e.clientY);
      zoomAt(Math.exp(-e.deltaY * 0.01), p[0], p[1]);
    }, { passive: false });
    stage.addEventListener("keydown", function (e) {
      var step = 0.15, c = center();
      if (e.key === "+" || e.key === "=") zoomAt(1.5, c[0], c[1]);
      else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.5, c[0], c[1]);
      else if (e.key === "ArrowLeft") { view.x -= view.w * step; apply(); }
      else if (e.key === "ArrowRight") { view.x += view.w * step; apply(); }
      else if (e.key === "ArrowUp") { view.y -= view.h * step; apply(); }
      else if (e.key === "ArrowDown") { view.y += view.h * step; apply(); }
      else if (e.key === "0") reset();
      else return;
      e.preventDefault();
      e.stopPropagation();
    });
    zoomIn.addEventListener("click", function () { var c = center(); zoomAt(1.6, c[0], c[1]); });
    zoomOut.addEventListener("click", function () { var c = center(); zoomAt(1 / 1.6, c[0], c[1]); });
    resetBtn.addEventListener("click", reset);

    // 画面の幅が変わったら、中心と拡大率を保ったまま高さを決め直す
    var lastW = 0;
    function onResize() {
      var w = stage.clientWidth;
      if (!w || w === lastW) return;
      lastW = w;
      var zoom = base.w / view.w, c = center();
      layout();
      var vw = base.w / zoom;
      view = { x: c[0] - vw / 2, y: c[1] - vw * base.h / base.w / 2, w: vw, h: vw * base.h / base.w };
      apply();
      redrawRings();
    }
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(stage);
    else window.addEventListener("resize", onResize);

    setView([0, 0, 1000, 500]);

    return {
      setView: setView, setTappable: setTappable, mark: mark, clearMarks: clearMarks,
      reveal: reveal, partlyVisible: partlyVisible, zoomTo: zoomTo, reset: reset, fitRect: fitRect, pxSize: pxSize,
      element: host, keyAt: keyAt, hitTest: hitTest,
      state: function () { return { view: view, base: base, useAlt: useAlt }; }
    };
  }

  return { create: create };
})();

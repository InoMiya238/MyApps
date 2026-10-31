// ギター入門コース: index.html(コース)と chords.html(コード帳)で共有する部品。
//   - コードの押さえ方のデータ(CHORDS)
//   - 撥弦音の合成(Karplus-Strong)、ストローク、メトロノームのクリック
//   - 先読みスケジューラー(Ticker): メトロノーム・チェンジ練習・コード進行で使う
//   - コードダイアグラムのSVG
// 弦の番号は 1(いちばん細い)〜6(いちばん太い)。frets / fingers の並びは「6弦→1弦」。
// frets の -1 は鳴らさない弦(×)、0 は開放弦。fingers の 0 は押さえない。
// 音はタップなどユーザーの操作があったときだけ鳴らす(AudioContext も操作のときに作る)。
var Guitar = (function () {
  "use strict";

  // 標準チューニング(6弦→1弦): E2 A2 D3 G3 B3 E4
  var OPEN_MIDI = [40, 45, 50, 55, 59, 64];
  var NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  var DOREMI = { 0: "ド", 2: "レ", 4: "ミ", 5: "ファ", 7: "ソ", 9: "ラ", 11: "シ" };

  // 弦の番号(1〜6)とフレットから MIDI 番号
  function midiOf(stringNo, fret) { return OPEN_MIDI[6 - stringNo] + fret; }
  function noteName(midi) { return NAMES[((midi % 12) + 12) % 12]; }
  function noteWithOctave(midi) { return noteName(midi) + (Math.floor(midi / 12) - 1); }
  function doremi(midi) { return DOREMI[((midi % 12) + 12) % 12] || ""; }

  // ---------- コード ----------
  var LEVELS = [
    { id: "easy", label: "やさしい" },
    { id: "basic", label: "ふつう" },
    { id: "barre", label: "セーハ" }
  ];
  var CHORDS = [
    { id: "Em", name: "Em", read: "イー・マイナー", level: "easy", frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0],
      note: "指2本。6本とも鳴らす。" },
    { id: "Am", name: "Am", read: "エー・マイナー", level: "easy", frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
      note: "5弦から鳴らす。Emの形を1本ずつ細い弦へずらし、人差し指を足す。" },
    { id: "E", name: "E", read: "イー", level: "easy", frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0],
      note: "Emに人差し指(3弦1フレット)を足した形。" },
    { id: "A", name: "A", read: "エー", level: "easy", frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0],
      note: "2フレットに3本の指を横に並べる。指が窮屈なら少し斜めに。" },
    { id: "E7", name: "E7", read: "イー・セブン", level: "easy", frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0],
      note: "Eから薬指をはなした形。" },
    { id: "A7", name: "A7", read: "エー・セブン", level: "easy", frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0],
      note: "3弦の開放がつぶれないように、指を立てる。" },
    { id: "C", name: "C", read: "シー", level: "basic", frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
      note: "5弦から鳴らす。3弦と1弦の開放がつぶれやすいので、指を立てる。" },
    { id: "G", name: "G", read: "ジー", level: "basic", frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
      note: "6本とも鳴らす。指を大きく広げる。" },
    { id: "D", name: "D", read: "ディー", level: "basic", frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2],
      note: "4弦から鳴らす。3本の指で小さな三角形をつくる。" },
    { id: "Dm", name: "Dm", read: "ディー・マイナー", level: "basic", frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1],
      note: "4弦から鳴らす。Dの1弦を1フレットに下げた形。" },
    { id: "G7", name: "G7", read: "ジー・セブン", level: "basic", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1],
      note: "6本とも鳴らす。Cへ進むことが多いコード。" },
    { id: "Fs", name: "F", sub: "簡易F", read: "エフ(かんたんな形)", level: "barre", frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1],
      barre: { fret: 1, from: 2, to: 1 },
      note: "4弦から鳴らす。人差し指で2弦と1弦の1フレットをまとめて押さえる。" },
    { id: "F", name: "F", sub: "セーハ", read: "エフ", level: "barre", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1],
      barre: { fret: 1, from: 6, to: 1 },
      note: "人差し指で1フレットの6本をまとめて押さえる(セーハ)。" }
  ];
  var BY_ID = {};
  CHORDS.forEach(function (c) { BY_ID[c.id] = c; });
  function chord(id) { return BY_ID[id] || null; }
  function chordLabel(c) { return c.sub ? c.name + "(" + c.sub + ")" : c.name; }
  // 鳴らす弦の MIDI(6弦→1弦。鳴らさない弦は null)
  function chordMidis(c) {
    return c.frets.map(function (f, i) { return f < 0 ? null : OPEN_MIDI[i] + f; });
  }
  // 構成音の音名(重なりを除き、いちばん低い音(このコード帳ではルート)からの音程の順)
  function chordTones(c) {
    var ms = chordMidis(c).filter(function (m) { return m !== null; });
    var root = ms[0] % 12, pcs = [];
    ms.forEach(function (m) { var pc = m % 12; if (pcs.indexOf(pc) < 0) pcs.push(pc); });
    pcs.sort(function (a, b) { return (a - root + 12) % 12 - (b - root + 12) % 12; });
    return pcs.map(function (pc) { return NAMES[pc]; });
  }

  // ---------- 音 ----------
  var ctx = null, master = null;
  var cache = {};
  var voices = {}; // 弦ごとに鳴っている音。同じ弦を弾き直したら前の音を止める

  // AudioContext を用意する(ユーザー操作の中で呼ぶ)。使えなければ null
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === "suspended" && ctx.resume) ctx.resume();
    return ctx;
  }
  function now() { return ctx ? ctx.currentTime : 0; }

  // Karplus-Strong で撥弦音を1つ作る(MIDI 番号ごとにキャッシュ)
  function pluckBuffer(midi) {
    if (cache[midi]) return cache[midi];
    var sr = ctx.sampleRate;
    var freq = 440 * Math.pow(2, (midi - 69) / 12);
    var dur = midi < 52 ? 3.2 : 2.6;
    var len = Math.floor(sr * dur);
    var buf = ctx.createBuffer(1, len, sr);
    var out = buf.getChannelData(0);
    // ループの遅れ = 遅延線 P + 平均フィルター 0.5 + オールパス d = sr / freq
    var D = sr / freq - 0.5;
    var P = Math.max(2, Math.floor(D - 0.1));
    var d = D - P;
    var C = (1 - d) / (1 + d);
    var line = new Float32Array(P);
    // 初めのはじき: ノイズを少しなめらかにして、やわらかい音にする
    var lp = 0, mean = 0, i;
    for (i = 0; i < P; i++) {
      lp = lp * 0.45 + (Math.random() * 2 - 1) * 0.55;
      line[i] = lp;
      mean += lp;
    }
    mean /= P;
    for (i = 0; i < P; i++) line[i] -= mean;
    // 1周あたりの減衰。低い音ほど長く響く
    var t60 = midi < 50 ? 4.2 : midi < 60 ? 3.4 : 2.6;
    var decay = Math.pow(0.001, 1 / (freq * t60));
    var idx = 0, prev = 0, apx = 0, apy = 0, peak = 0;
    for (var n = 0; n < len; n++) {
      var cur = line[idx];
      out[n] = cur;
      var avg = 0.5 * (cur + prev);
      prev = cur;
      var ap = C * avg + apx - C * apy;
      apx = avg;
      apy = ap;
      line[idx] = ap * decay;
      idx++;
      if (idx === P) idx = 0;
      var a = Math.abs(cur);
      if (a > peak) peak = a;
    }
    // 音量をそろえ、最後をなめらかに消す
    var g = peak > 0 ? 0.6 / peak : 1;
    var fade = Math.floor(sr * 0.25);
    for (n = 0; n < len; n++) {
      var k = n > len - fade ? (len - n) / fade : 1;
      out[n] *= g * k;
    }
    cache[midi] = buf;
    return buf;
  }

  // 弦の音を止める(when 秒から)
  function damp(stringNo, when) {
    var v = voices[stringNo];
    if (!v) return;
    var t = Math.max(when, ctx.currentTime);
    try {
      v.gain.gain.cancelScheduledValues(t);
      v.gain.gain.setTargetAtTime(0, t, 0.02);
      v.src.stop(t + 0.25);
    } catch (e) { /* すでに止まっている */ }
    voices[stringNo] = null;
  }

  // 1本の弦を鳴らす。stringNo は 1〜6(0 ならほかの音を止めない単音)
  function pluck(stringNo, midi, when, vol) {
    if (!audio()) return;
    var t = Math.max(when || 0, ctx.currentTime);
    if (stringNo) damp(stringNo, t);
    var src = ctx.createBufferSource();
    src.buffer = pluckBuffer(midi);
    var gain = ctx.createGain();
    gain.gain.value = vol === undefined ? 0.5 : vol;
    src.connect(gain);
    gain.connect(master);
    src.start(t);
    if (stringNo) {
      var v = { src: src, gain: gain };
      voices[stringNo] = v;
      src.onended = function () { if (voices[stringNo] === v) voices[stringNo] = null; };
    }
  }

  // 弦の番号とフレットで鳴らす
  function playFret(stringNo, fret, when, vol) { pluck(stringNo, midiOf(stringNo, fret), when, vol); }

  // コードをストロークで鳴らす。opts: { dir: "down"|"up", spread: 弦ごとのずれ(秒), vol }
  // 鳴らさない弦(×)は、鳴っていた音を止める
  function strum(c, when, opts) {
    if (!c || !audio()) return;
    opts = opts || {};
    var t = Math.max(when || 0, ctx.currentTime + 0.005);
    var dir = opts.dir || "down";
    var spread = opts.spread === undefined ? 0.03 : opts.spread;
    var vol = opts.vol === undefined ? 0.36 : opts.vol;
    var order = dir === "up" ? [1, 2, 3, 4, 5, 6] : [6, 5, 4, 3, 2, 1];
    var played = 0;
    order.forEach(function (s) {
      var f = c.frets[6 - s];
      if (f < 0) { damp(s, t); return; }
      // アップは細い弦から4本まで
      if (dir === "up" && played >= 4) return;
      pluck(s, OPEN_MIDI[6 - s] + f, t + played * spread, vol * (dir === "up" ? 0.75 : 1));
      played++;
    });
  }

  // 鳴っている音をすべて止める
  function silence() {
    if (!ctx) return;
    for (var s = 1; s <= 6; s++) damp(s, ctx.currentTime);
  }

  // メトロノームのクリック。accent なら高く強く
  function click(when, accent) {
    if (!audio()) return;
    var t = Math.max(when || 0, ctx.currentTime);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = accent ? 1760 : 1100;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(accent ? 0.32 : 0.16, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // ---------- 先読みスケジューラー ----------
  // o.interval(i): i 番目の拍から次の拍までの秒数(テンポの変更はすぐ反映される)
  // o.onSchedule(i, time): 音を予約する(time は AudioContext の時刻)
  // o.onBeat(i): その拍になったときの表示(requestAnimationFrame で呼ぶ)
  // o.onStop(): 止まったとき
  // 同時に動くのは1つだけ。新しく start すると、前のものは止まる
  var running = null;
  function Ticker(o) {
    var timer = null, raf = 0, next = 0, i = 0, queue = [];
    var self = {
      playing: false,
      start: function () {
        if (!audio()) return false;
        if (running && running !== self) running.stop();
        running = self;
        self.playing = true;
        i = 0;
        queue = [];
        next = ctx.currentTime + 0.08;
        tick();
        timer = setInterval(tick, 25);
        raf = requestAnimationFrame(draw);
        return true;
      },
      stop: function () {
        if (!self.playing) return;
        self.playing = false;
        clearInterval(timer);
        cancelAnimationFrame(raf);
        queue = [];
        if (running === self) running = null;
        if (o.onStop) o.onStop();
      }
    };
    function tick() {
      while (next < ctx.currentTime + 0.12) {
        o.onSchedule(i, next);
        queue.push({ i: i, t: next });
        next += o.interval(i);
        i++;
      }
    }
    function draw() {
      if (!self.playing) return;
      var shown = -1;
      while (queue.length && queue[0].t <= ctx.currentTime + 0.01) shown = queue.shift().i;
      if (shown >= 0 && o.onBeat) o.onBeat(shown);
      raf = requestAnimationFrame(draw);
    }
    return self;
  }
  function stopAll() { if (running) running.stop(); }

  // ---------- コードダイアグラム(SVG) ----------
  // 縦向き: 左が6弦、右が1弦、上の太い線がナット。●の中の数字は指番号
  var svgNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var e = document.createElementNS(svgNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function chordSvg(c, opts) {
    opts = opts || {};
    var frets = 4, sx = 18, gap = 16, top = 30, fh = 24;
    var W = sx * 2 + gap * 5, H = top + fh * frets + (opts.labels ? 22 : 8);
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "chord-svg", role: "img" });
    svg.setAttribute("aria-label", chordLabel(c) + "のダイアグラム: " + describe(c));
    function X(s) { return sx + (6 - s) * gap; } // s: 弦の番号
    for (var f = 0; f <= frets; f++) {
      svg.appendChild(svgEl("line", {
        x1: sx, y1: top + f * fh, x2: sx + gap * 5, y2: top + f * fh,
        stroke: "var(--diagram-line)", "stroke-width": f === 0 ? 0 : 1.2
      }));
    }
    svg.appendChild(svgEl("rect", { x: sx - 1, y: top - 4, width: gap * 5 + 2, height: 5, rx: 1, fill: "var(--diagram-nut)" }));
    for (var s = 1; s <= 6; s++) {
      svg.appendChild(svgEl("line", {
        x1: X(s), y1: top, x2: X(s), y2: top + fh * frets,
        stroke: "var(--diagram-line)", "stroke-width": 1 + (s - 1) * 0.18
      }));
    }
    // ○ と ×
    for (s = 1; s <= 6; s++) {
      var fr = c.frets[6 - s], cx = X(s), cy = top - 14;
      if (fr === 0) {
        svg.appendChild(svgEl("circle", { cx: cx, cy: cy, r: 4.6, fill: "none", stroke: "var(--diagram-line)", "stroke-width": 1.5 }));
      } else if (fr < 0) {
        svg.appendChild(svgEl("path", {
          d: "M" + (cx - 4) + " " + (cy - 4) + "L" + (cx + 4) + " " + (cy + 4) + "M" + (cx + 4) + " " + (cy - 4) + "L" + (cx - 4) + " " + (cy + 4),
          stroke: "var(--diagram-line)", "stroke-width": 1.6, "stroke-linecap": "round"
        }));
      }
    }
    // セーハ
    if (c.barre) {
      var by = top + (c.barre.fret - 0.5) * fh;
      var x1 = X(c.barre.from), x2 = X(c.barre.to);
      svg.appendChild(svgEl("rect", { x: x1 - 8, y: by - 8, width: x2 - x1 + 16, height: 16, rx: 8, fill: "var(--diagram-dot)" }));
      var bt = svgEl("text", {
        x: (x1 + x2) / 2, y: by + 4.2, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700,
        "font-family": "var(--font-mono)", fill: "var(--diagram-dot-ink)"
      });
      bt.textContent = "1";
      svg.appendChild(bt);
    }
    // 押さえる場所
    for (s = 1; s <= 6; s++) {
      var ff = c.frets[6 - s], fg = c.fingers[6 - s];
      if (ff <= 0) continue;
      if (c.barre && ff === c.barre.fret && s <= c.barre.from && s >= c.barre.to) continue;
      var y = top + (ff - 0.5) * fh;
      svg.appendChild(svgEl("circle", { cx: X(s), cy: y, r: 7.6, fill: "var(--diagram-dot)" }));
      if (fg) {
        var t = svgEl("text", {
          x: X(s), y: y + 4.2, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700,
          "font-family": "var(--font-mono)", fill: "var(--diagram-dot-ink)"
        });
        t.textContent = String(fg);
        svg.appendChild(t);
      }
    }
    // 弦の番号(下)
    if (opts.labels) {
      for (s = 1; s <= 6; s++) {
        var lt = svgEl("text", {
          x: X(s), y: top + fh * frets + 16, "text-anchor": "middle", "font-size": 10, "font-weight": 600,
          "font-family": "var(--font-mono)", fill: "var(--ink-faint)"
        });
        lt.textContent = String(s);
        svg.appendChild(lt);
      }
    }
    return svg;
  }
  // 読み上げ用の説明
  function describe(c) {
    var parts = [];
    for (var s = 6; s >= 1; s--) {
      var f = c.frets[6 - s], fg = c.fingers[6 - s];
      if (f < 0) parts.push(s + "弦は鳴らさない");
      else if (f === 0) parts.push(s + "弦は開放");
      else parts.push(s + "弦" + f + "フレット" + (fg ? "を" + fg + "の指" : ""));
    }
    return parts.join("、");
  }

  // ---------- コードカード(ダイアグラム + 1本ずつ鳴らすボタン) ----------
  // ダイアグラムをタップするとジャラーン(ストローク)。下のボタンで1本ずつ鳴らせる。
  // opts: { note: true なら押さえ方のひとことを出す, id: 要素の id }
  function chordCard(c, opts) {
    opts = opts || {};
    var card = document.createElement("div");
    card.className = "chord-card";
    if (opts.id) card.id = opts.id;
    var tap = document.createElement("button");
    tap.type = "button";
    tap.className = "chord-tap";
    tap.setAttribute("aria-label", chordLabel(c) + "を鳴らす");
    var name = document.createElement("span");
    name.className = "chord-name";
    name.textContent = c.name;
    if (c.sub) {
      var sub = document.createElement("span");
      sub.className = "chord-sub";
      sub.textContent = c.sub;
      name.appendChild(sub);
    }
    tap.appendChild(name);
    var read = document.createElement("span");
    read.className = "chord-read";
    read.textContent = c.read;
    tap.appendChild(read);
    tap.appendChild(chordSvg(c));
    var hint = document.createElement("span");
    hint.className = "chord-hint";
    hint.textContent = "タップで鳴らす";
    tap.appendChild(hint);
    tap.addEventListener("click", function () {
      strum(c, 0, { spread: 0.035 });
      card.classList.remove("is-ringing");
      void card.offsetWidth;
      card.classList.add("is-ringing");
    });
    card.appendChild(tap);
    var row = document.createElement("div");
    row.className = "chord-strings";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", chordLabel(c) + "の弦を1本ずつ鳴らす");
    for (var s = 6; s >= 1; s--) {
      (function (s) {
        var f = c.frets[6 - s];
        var b = document.createElement("button");
        b.type = "button";
        b.className = "string-btn";
        var no = document.createElement("span");
        no.className = "string-no";
        no.textContent = String(s);
        var nm = document.createElement("span");
        nm.className = "string-note";
        if (f < 0) {
          nm.textContent = "×";
          b.disabled = true;
          b.setAttribute("aria-label", s + "弦は鳴らさない");
        } else {
          var m = OPEN_MIDI[6 - s] + f;
          nm.textContent = noteName(m);
          b.setAttribute("aria-label", s + "弦 " + (f === 0 ? "開放" : f + "フレット") + " " + noteName(m) + "を鳴らす");
          b.addEventListener("click", function () { pluck(s, m, 0, 0.55); });
        }
        b.appendChild(no);
        b.appendChild(nm);
        row.appendChild(b);
      })(s);
    }
    card.appendChild(row);
    if (opts.note && c.note) {
      var p = document.createElement("p");
      p.className = "chord-note";
      p.textContent = c.note;
      card.appendChild(p);
    }
    return card;
  }

  return {
    chordCard: chordCard,
    OPEN_MIDI: OPEN_MIDI,
    midiOf: midiOf,
    noteName: noteName,
    noteWithOctave: noteWithOctave,
    doremi: doremi,
    LEVELS: LEVELS,
    CHORDS: CHORDS,
    chord: chord,
    chordLabel: chordLabel,
    chordMidis: chordMidis,
    chordTones: chordTones,
    audio: audio,
    now: now,
    pluck: pluck,
    playFret: playFret,
    strum: strum,
    silence: silence,
    click: click,
    Ticker: Ticker,
    stopAll: stopAll,
    chordSvg: chordSvg,
    describe: describe,
    svgEl: svgEl
  };
})();

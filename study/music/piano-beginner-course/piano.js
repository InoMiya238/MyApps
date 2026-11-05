// ピアノ入門コース: index.html(コース)と songs.html(曲集)で共有する部品。グローバルは Piano 1つ。
//   - 音: ピアノらしい減衰音の合成、メトロノームのクリック、先読みスケジューラー(Ticker)
//   - 音名: C4 形式、ドレミ、♯/♭表記
//   - 画面の鍵盤(SVG): keyboard(opts)
//   - 楽譜(五線譜 SVG): score(container, data, opts)
//   - 再生と「弾いてみる」: player(score, keyboard, opts)。PCキー・Web MIDI(任意)の入力
//   - 曲集の曲データ: SONGS
// 音はタップなどユーザーの操作があったときだけ鳴らす(AudioContext も操作のときに作る)。
// このファイルは読み込んだだけでは DOM に触らない(jsc でも読め、曲データの拍の合計を確かめられる)。
//
// ===== 楽譜データの形 =====
//   { rh: "右手の音の並び", lh: "左手の音の並び",   // どちらか片方だけでもよい
//     time: [4, 4],      // 拍子。[2,4] [3,4] [4,4] を想定(分母は4)。省略は 4/4
//     key: 0,            // 調号。0 = なし(ハ長調)、1 = ♯1つ(ト長調)、-1 = ♭1つ(ヘ長調)
//     clef: "grand",     // 省略可。rh と lh があれば "grand"(大譜表)、rh だけなら "treble"(ト音)、
//                        //   lh だけなら "bass"(ヘ音)。"grand" を指定して片方を省くと、その段は全休符
//     bpm: 90 }          // 省略可。player の初期テンポ
//   右手はト音記号の段、左手はヘ音記号の段に書く(1段だけのときは、その段に書く)。
//
//   音の並びは、空白で区切ったトークンを左から読む(LilyPond に近い書き方):
//     "E4/4:3 D4:2 C4:1 D4 | E4 E4 E4/2 | r/4 C4+E4+G4/2.:1+3+5"
//   ・音の高さ: 音名 C D E F G A B + (♯なら #、♭なら b)+ オクターブ。C4 = 真ん中のド。
//       書くのは「実際に鳴る音」。調号や小節内の臨時記号の表示は自動で決まる
//       (ト長調で F#4 と書けば記号なし、F4 と書けば ♮ がつく)。
//   ・r = 休符。和音は + でつなぐ(C3+E3+G3)。
//   ・/長さ: 1 = 全音符、2. = 付点二分、2 = 二分、4. = 付点四分、4 = 四分、8 = 八分。
//       省略すると、同じ手の1つ前の長さを引き継ぐ(最初は 4)。
//       八分音符は、拍の頭から2つ続くと連桁でつなぐ。1つだけなら旗。
//   ・:指番号(1〜5)。和音は + でつなぎ、音と同じ順に書く(C3+E3+G3:5+3+1)。省略可。
//   ・後ろに ' = スタッカート、( で始めて ) で終わる = スラー(同じ手の音どうし)。
//       例: "(E4:3 D4 C4)"  "G4/4'"
//   ・!p !mp !mf !f(!pp !ff)= 強弱記号。次の音の下に書き、再生の強さも変わる。
//   ・小節線: |。|| = 複縦線、|: と :| = 反復記号(:| で |: まで(なければ最初まで)1回戻る)。
//       曲の終わりの終止線は自動で描く。各小節の拍の合計は拍子と同じにする(checkScore で確かめる)。
//   ・大譜表では、右手と左手の小節の数をそろえる。
//
// ===== 主な API =====
//   音
//     Piano.audio()                    AudioContext を用意(操作の中で呼ぶ)。使えなければ null
//     Piano.now()                      いまの AudioContext の時刻(秒)
//     Piano.play(midi, when, dur, vel) 1音鳴らす。when: 0 = すぐ、dur: 秒(省略で長めに鳴る)、
//                                      vel: 0〜1(省略 0.7)。戻り値 voice の voice.release(at) で離鍵
//     Piano.click(when, accent)        メトロノームの音。accent なら高く強く
//     Piano.Ticker({interval(i), onSchedule(i, time), onBeat(i), onStop()})  先読みスケジューラー
//                                      (ギター入門と同じ形。同時に動くのは1つだけ)
//     Piano.stopAll()                  再生・弾いてみる・鳴っている音をすべて止める(画面を移るときに呼ぶ)
//   音名
//     Piano.noteName(60) → "C4"、noteName(61) → "C♯4"、noteName(61, true) → "D♭4"
//     Piano.pcName(61) → "C♯"(オクターブなし)、Piano.doremi(64) → "ミ"、doremi(61, true) → "レ♭"
//     Piano.noteJa(64) → "ミ(E4)"   Piano.isBlack(61) → true
//     Piano.keyName(key) → "ハ長調" | "ト長調" | "ヘ長調"   Piano.timeName([3,4]) → "3/4"
//   鍵盤
//     var kb = Piano.keyboard({ from: 48, to: 72,     // 表示する範囲(MIDI。白鍵にそろえる)
//       need: [60, 67],          // 必ず見せる音(省略可)。幅が足りないとき(白鍵1つ18px未満)、
//                                //   この音を残して外側を削る
//       labels: "doremi",        // "doremi" | "cde" | "pc"(PCキー) | "none"
//       fingers: [{ midi: 60, f: 1, hand: "rh" }],  // 指番号の丸(省略可)
//       onPress: function (midi, source) {},       // source: "pointer" | "pc" | "midi"
//       sound: true,             // 押したら鳴らす(既定 true。MIDI 入力は本物の楽器が鳴るので鳴らさない)
//       maxKeyWidth: 40,         // 白鍵1つの最大幅(px)
//       maxHeight: 0 })          // 鍵盤全体の最大の高さ(px。0 = 制限なし)
//     kb は <div class="pn-kb"> 要素。そのまま appendChild する。メソッド:
//       kb.light(midi, kind) / kb.unlight(midi, kind)   kind: "play" | "target" | "good" | "wrong"
//       kb.flash(midi, kind, ms)  kb.clear(kind)(省略で全部)
//       kb.setLabels(mode)  kb.setFingers(list)  kb.clearFingers()
//       kb.setRange(from, to, need)  kb.range() → {from, to}(いま表示している範囲)
//       kb.press(midi, source)   押したのと同じ(鳴らして onPress を呼ぶ)
//       kb.onPress(fn) → 外す関数   kb.activate()(PCキーと MIDI の入力先にする)
//       kb.destroy()(画面から外すときに呼ぶ。window のイベントと幅の監視を外す)
//       kb.pcBase / kb.setPcBase(midi)(A キーの音。既定 60)  kb.onPcBase(fn)
//     PCキー: A=ド W=ド♯ S=レ E=レ♯ D=ミ F=ファ T=ファ♯ G=ソ Y=ソ♯ H=ラ U=ラ♯ J=シ K=上のド
//       O L P ; ' と続く。Z/X でオクターブ下げ/上げ。入力先は最後に触った(activate した)鍵盤。
//   楽譜
//     var sc = Piano.score(container, data, { zoom: 1, fingers: true, onTap: fn(col) })
//       container(空の div)に、段ごとの <svg class="pn-system"> を縦に積む。幅の変化に合わせて
//       組み直す(ResizeObserver)。列(同じ時刻に始まる音のまとまり)をタップすると鳴る。
//       sc.cols[i] = { i, bar, start(小節内の拍), ev: { rh: 出来事|null, lh: 出来事|null } }
//         出来事 = { rest, dur(拍), notes: [{ midi, letter, alter, octave, finger }], hand }
//       sc.mark(i, kind, on)   kind: "play" | "target" | "wrong" | "done"   sc.flash(i, kind, ms)
//       sc.clear(kind)  sc.setHand("both"|"rh"|"lh")(選んでいない手を薄く)  sc.setZoom(1 | 1.3)
//       sc.setFingers(bool)  sc.scrollTo(i)  sc.order()(反復を展開した小節の順)  sc.destroy()
//       sc.S = 読み取った楽譜(time, key, barBeats, staves, bars, cols, hands, errors)
//     Piano.parseScore(data) → sc.S と同じもの。Piano.checkScore(data) → まちがいの一覧(配列)
//     Piano.scoreRange(data, hand) → { lo, hi }(使っている音の最低・最高の MIDI)
//     Piano.kbRange(lo, hi) → { from, to }(lo の下のド〜hi の上のド。C3〜C5 より狭くしない)
//   再生・弾いてみる
//     var pl = Piano.player(sc, kb, {
//       bpm: 90, hand: "both", metronome: false,   // メトロノームがオンなら1小節カウントしてから
//       status: 要素,            // 「次: ミ(E4)・右手3の指」などを書く(aria-live をつけておく)
//       idleText: "…",           // 止まっているときの status の文
//       onState: function (mode, pl) {},  // mode: "idle" | "play" | "wait" | "done"(ボタンの文言を変える)
//       onBeat: function (beat, countIn) {} })  // 拍ごと(0始まり。拍の表示に使う。省略可)
//     pl.play() pl.stop() pl.togglePlay()          再生(▶ 再生 ↔ ■ 停止)
//     pl.startWait() pl.stopWait() pl.toggleWait() 弾いてみる(待ちモード。done のあと startWait で最初から)
//     pl.setBpm(n) pl.setHand(h) pl.setMetronome(on)  pl.mode  pl.mistakes  pl.destroy()
//     弾いてみるでは、次の列の音を全部押すと進む(和音は順番・時間を問わない)。Esc でやめる。
//     弾いてみるを始めると、ほかの再生を全部止めて kb.activate() し、A キーを 右手・両手 = C4、左手 = C3 にする。
//     次に弾く音が PCキーの範囲(A から17半音)に入らないときは、A の音を自動で合わせる。
//   Web MIDI(任意): Piano.midi.enable()(「電子ピアノをつなぐ」ボタンで呼ぶ。許可ずみなら読み込み時に黙ってつなぐ)、Piano.midi.status
//     ("off" | "requesting" | "none" | "denied" | "waiting" | "connected")、Piano.midi.onChange(fn) → 外す関数。失敗しても何も起きない。
//   曲集: Piano.SONGS(下の「曲集」を参照)、Piano.song(id)、Piano.CATS
var Piano = (function () {
  "use strict";

  var HAS_DOM = typeof document !== "undefined";

  // ---------- 音名 ----------
  var NAMES_SHARP = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  var NAMES_FLAT = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
  var DO_SHARP = ["ド", "ド♯", "レ", "レ♯", "ミ", "ファ", "ファ♯", "ソ", "ソ♯", "ラ", "ラ♯", "シ"];
  var DO_FLAT = ["ド", "レ♭", "レ", "ミ♭", "ミ", "ファ", "ソ♭", "ソ", "ラ♭", "ラ", "シ♭", "シ"];
  var LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  var LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var LETTER_JA = { C: "ド", D: "レ", E: "ミ", F: "ファ", G: "ソ", A: "ラ", B: "シ" };
  var ACC_SIGN = { "-1": "♭", "0": "", "1": "♯" };
  var HAND_JA = { rh: "右手", lh: "左手" };

  function pc(m) { return ((m % 12) + 12) % 12; }
  function octaveOf(m) { return Math.floor(m / 12) - 1; }
  function noteName(m, flat) { return (flat ? NAMES_FLAT : NAMES_SHARP)[pc(m)] + octaveOf(m); }
  function pcName(m, flat) { return (flat ? NAMES_FLAT : NAMES_SHARP)[pc(m)]; }
  function doremi(m, flat) { return (flat ? DO_FLAT : DO_SHARP)[pc(m)]; }
  function noteJa(m, flat) { return doremi(m, flat) + "(" + noteName(m, flat) + ")"; }
  function isBlack(m) { var p = pc(m); return p === 1 || p === 3 || p === 6 || p === 8 || p === 10; }
  // 楽譜の音(つづりつき)の名前
  function spellName(n) { return n.letter + ACC_SIGN[n.alter] + n.octave; }
  function spellJa(n) { return LETTER_JA[n.letter] + ACC_SIGN[n.alter]; }
  function keyName(k) { return k > 0 ? "ト長調" : k < 0 ? "ヘ長調" : "ハ長調"; }
  function timeName(t) { t = t || [4, 4]; return t[0] + "/" + t[1]; }

  // ---------- 音 ----------
  var ctx = null, master = null;
  var bufCache = {};
  var voices = []; // 鳴っている音(stopAll で止める)

  function audio() {
    if (!ctx) {
      var AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
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

  // ピアノの音を1つ作る(MIDI 番号ごとにキャッシュ)。
  // 少しずつずらした2本の弦 × 倍音。高い倍音ほど早く消え、低い音ほど長く響く。打鍵の小さな雑音を足す。
  function pianoBuffer(m) {
    if (bufCache[m]) return bufCache[m];
    var sr = ctx.sampleRate;
    var f0 = 440 * Math.pow(2, (m - 69) / 12);
    var secs = m < 48 ? 4.2 : m < 72 ? 3.4 : 2.4;
    var len = Math.floor(sr * secs);
    var buf = ctx.createBuffer(1, len, sr);
    var out = buf.getChannelData(0);
    var tau1 = Math.max(0.7, Math.min(5, 2.6 * Math.pow(2, -(m - 60) / 20)));
    var B = 0.00012 * Math.pow(2, (m - 60) / 30); // 弦の硬さ(高い倍音が少し高くずれる)
    var nP = Math.max(3, Math.min(14, Math.floor(7000 / f0)));
    var detune = [0.9993, 1.0007];
    var n, s, i;
    for (n = 1; n <= nP; n++) {
      var amp = Math.pow(n, -1.15) * (n === 1 ? 1 : 0.8) * (0.55 + 0.45 * Math.abs(Math.sin(Math.PI * n * 0.14)));
      if (m < 52 && n > 1 && n < 5) amp *= 1.35; // 低い音は2〜4倍音を少し強く
      var tau = tau1 / (1 + 0.38 * (n - 1));
      var dFast = Math.exp(-1 / (sr * tau * 0.16));
      var dSlow = Math.exp(-1 / (sr * tau));
      for (s = 0; s < 2; s++) {
        var fn = n * f0 * Math.sqrt(1 + B * n * n) * detune[s];
        if (fn > sr * 0.45) continue;
        var w = 2 * Math.PI * fn / sr;
        var cw = Math.cos(w), sw = Math.sin(w);
        var re = Math.cos(s * 1.3 + n), im = Math.sin(s * 1.3 + n);
        var eF = amp * 0.62, eS = amp * 0.38;
        for (i = 0; i < len; i++) {
          var r2 = re * cw - im * sw;
          im = re * sw + im * cw;
          re = r2;
          out[i] += im * (eF + eS);
          eF *= dFast;
          eS *= dSlow;
        }
      }
    }
    // 打鍵の雑音(10ms ほど)
    var nl = Math.floor(sr * 0.012), lp = 0, k = Math.min(0.9, f0 / 1500);
    for (i = 0; i < nl; i++) {
      lp += k * ((Math.random() * 2 - 1) - lp);
      out[i] += lp * 0.25 * Math.exp(-i / (sr * 0.003));
    }
    // 立ち上がり 2ms、終わり 0.25s をなめらかに。音量をそろえる
    var peak = 0;
    for (i = 0; i < len; i++) { var a = Math.abs(out[i]); if (a > peak) peak = a; }
    var g = peak > 0 ? 0.55 / peak : 1;
    var att = Math.floor(sr * 0.002), fade = Math.floor(sr * 0.25);
    for (i = 0; i < len; i++) {
      var e = 1;
      if (i < att) e = i / att;
      if (i > len - fade) e = (len - i) / fade;
      out[i] *= g * e;
    }
    bufCache[m] = buf;
    return buf;
  }
  // よく使う音を先に作っておく(再生の途中で止まらないように)
  function prepare(midis) {
    if (!audio()) return;
    midis.forEach(function (m) { pianoBuffer(m); });
  }

  // 1音鳴らす。dur(秒)を省くと、release を呼ぶまで(最長で音が消えるまで)鳴る
  function play(midi, when, dur, vel) {
    if (!audio()) return null;
    var t = Math.max(when || 0, ctx.currentTime);
    var src = ctx.createBufferSource();
    src.buffer = pianoBuffer(midi);
    var gain = ctx.createGain();
    var v = vel === undefined || vel === null ? 0.7 : vel;
    gain.gain.value = 0.15 + 0.85 * v * v;
    src.connect(gain);
    gain.connect(master);
    src.start(t);
    var voice = {
      midi: midi,
      start: t,
      released: false,
      release: function (at) {
        if (voice.released) return;
        voice.released = true;
        var r = Math.max(at || 0, ctx.currentTime, voice.start + 0.05);
        try {
          gain.gain.setTargetAtTime(0, r, 0.09);
          src.stop(r + 0.7);
        } catch (e) { /* すでに止まっている */ }
      }
    };
    voices.push(voice);
    src.onended = function () { var k = voices.indexOf(voice); if (k >= 0) voices.splice(k, 1); };
    if (dur !== undefined && dur !== null) voice.release(t + dur);
    return voice;
  }
  function silence() {
    voices.slice().forEach(function (v) { v.release(0); });
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
    g.gain.exponentialRampToValueAtTime(accent ? 0.28 : 0.14, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // ---------- 先読みスケジューラー(ギター入門と同じ) ----------
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
        next = ctx.currentTime + 0.1;
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
      while (self.playing && next < ctx.currentTime + 0.12) {
        o.onSchedule(i, next);
        queue.push({ i: i, t: next });
        next += o.interval(i);
        i++;
      }
    }
    function draw() {
      if (!self.playing) return;
      var shown = [];
      while (queue.length && queue[0].t <= ctx.currentTime + 0.01) shown.push(queue.shift().i);
      if (o.onBeat) {
        for (var k = 0; k < shown.length && self.playing; k++) o.onBeat(shown[k]);
      }
      if (self.playing) raf = requestAnimationFrame(draw);
    }
    return self;
  }
  var players = [];
  function stopAll() {
    if (running) running.stop();
    players.slice().forEach(function (p) { p.stop(); if (p.mode === "wait" || p.mode === "done") p.stopWait(); });
    silence();
  }

  // ---------- SVG の小道具 ----------
  var svgNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var e = document.createElementNS(svgNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function r1(v) { return Math.round(v * 10) / 10; }

  // =====================================================================
  // 楽譜: 読み取り
  // =====================================================================
  var DUR_BEATS = { "1": 4, "2.": 3, "2": 2, "4.": 1.5, "4": 1, "8": 0.5 };
  var DYN_VEL = { pp: 0.32, p: 0.42, mp: 0.55, mf: 0.68, f: 0.82, ff: 0.95 };
  var PITCH_RE = /^([A-G])(#|b|n)?(\d)$/;
  var TOKEN_RE = /^(\()?(r|[A-G](?:#|b|n)?\d(?:\+[A-G](?:#|b|n)?\d)*)(?:\/(\d\.?))?(?::(\d(?:\+\d)*))?(['\)]*)$/;
  var BOTTOM_STEP = { treble: 4 * 7 + 2, bass: 2 * 7 + 4 }; // 第1線の音: ト音 E4、ヘ音 G2
  var KEY_ALTER = { "1": { F: 1 }, "-1": { B: -1 }, "0": {} };

  function parsePitch(s) {
    var m = PITCH_RE.exec(s);
    var letter = m[1], alter = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0, oct = parseInt(m[3], 10);
    return {
      letter: letter, alter: alter, octave: oct,
      step: oct * 7 + LETTERS.indexOf(letter),
      midi: (oct + 1) * 12 + LETTER_PC[letter] + alter,
      finger: 0
    };
  }

  // 1つの手の文字列 → 小節の並び
  function parseHand(str, hand, errs) {
    var bars = [];
    var cur = newBar(), dur = "4", dyn = null;
    function newBar() { return { events: [], len: 0, startRepeat: false, endRepeat: false, double: false }; }
    function last() { return cur.events.length ? cur : bars[bars.length - 1]; }
    String(str || "").trim().split(/\s+/).forEach(function (tok) {
      if (!tok) return;
      if (tok === "|" || tok === "||" || tok === ":|" || tok === "|:" || tok === ":|:") {
        var lb = last();
        if (lb && (tok === ":|" || tok === ":|:")) lb.endRepeat = true;
        if (lb && tok === "||") lb.double = true;
        if (cur.events.length) { bars.push(cur); cur = newBar(); }
        if (tok === "|:" || tok === ":|:") cur.startRepeat = true;
        return;
      }
      var where = HAND_JA[hand] + " " + (bars.length + 1) + "小節目";
      if (tok.charAt(0) === "!") {
        var d = tok.slice(1);
        if (DYN_VEL[d]) dyn = d; else errs.push(where + ": 強弱記号が読めない " + tok);
        return;
      }
      var m = TOKEN_RE.exec(tok);
      if (!m) { errs.push(where + ": 読めない " + tok); return; }
      if (m[3]) {
        if (DUR_BEATS[m[3]]) dur = m[3];
        else errs.push(where + ": 長さが読めない " + tok);
      }
      var ev = {
        hand: hand, start: cur.len, durCode: dur, dur: DUR_BEATS[dur], rest: m[2] === "r", notes: [],
        dyn: dyn, slurStart: !!m[1], slurEnd: m[5].indexOf(")") >= 0, stacc: m[5].indexOf("'") >= 0
      };
      dyn = null;
      if (!ev.rest) {
        ev.notes = m[2].split("+").map(parsePitch);
        if (m[4]) {
          var fs = m[4].split("+").map(Number);
          if (fs.length !== ev.notes.length) errs.push(where + ": 指番号の数が音の数と合わない " + tok);
          else ev.notes.forEach(function (n, k) { n.finger = fs[k]; });
          fs.forEach(function (f) { if (f < 1 || f > 5) errs.push(where + ": 指番号は1〜5 " + tok); });
        }
        ev.notes.sort(function (a, b) { return a.step - b.step; });
      } else if (m[4]) errs.push(where + ": 休符に指番号 " + tok);
      cur.events.push(ev);
      cur.len += ev.dur;
    });
    if (cur.events.length) bars.push(cur);
    return bars;
  }

  // 楽譜データ → 描画と再生に使う形
  function parseScore(data) {
    data = data || {};
    var errs = [];
    var time = data.time || [4, 4];
    var barBeats = time[0] * 4 / time[1];
    var key = Math.max(-1, Math.min(1, data.key | 0));
    var hands = [];
    if (data.rh) hands.push("rh");
    if (data.lh) hands.push("lh");
    var clef = data.clef || (hands.length === 2 ? "grand" : hands[0] === "lh" ? "bass" : "treble");
    var staves;
    if (clef === "grand") staves = [{ hand: "rh", clef: "treble" }, { hand: "lh", clef: "bass" }];
    else staves = [{ hand: hands[0] || (clef === "bass" ? "lh" : "rh"), clef: clef === "bass" ? "bass" : "treble" }];
    var parsed = {}, nBars = 0;
    staves.forEach(function (st) {
      parsed[st.hand] = data[st.hand] ? parseHand(data[st.hand], st.hand, errs) : null;
      if (parsed[st.hand]) nBars = Math.max(nBars, parsed[st.hand].length);
    });
    staves.forEach(function (st) {
      var bs = parsed[st.hand];
      if (!bs) {
        // 書いていない段は全休符
        bs = parsed[st.hand] = [];
        for (var b = 0; b < nBars; b++) {
          bs.push({ events: [{ hand: st.hand, start: 0, durCode: "1", dur: barBeats, rest: true, notes: [] }], len: barBeats });
        }
      } else if (bs.length !== nBars) {
        errs.push(HAND_JA[st.hand] + "の小節の数(" + bs.length + ")がもう一方(" + nBars + ")と合わない");
      }
      bs.forEach(function (bar, bi) {
        if (Math.abs(bar.len - barBeats) > 1e-6) {
          errs.push(HAND_JA[st.hand] + " " + (bi + 1) + "小節目: 拍の合計が " + bar.len + "(" + timeName(time) + " なら " + barBeats + ")");
        }
      });
    });
    // 小節をまとめ、列(同じ時刻に始まる音)をつくる
    var bars = [], cols = [];
    for (var b = 0; b < nBars; b++) {
      var bar = { i: b, cols: [], startRepeat: false, endRepeat: false, double: false };
      var starts = [];
      staves.forEach(function (st) {
        var hb = parsed[st.hand][b];
        if (!hb) return;
        if (hb.startRepeat) bar.startRepeat = true;
        if (hb.endRepeat) bar.endRepeat = true;
        if (hb.double) bar.double = true;
        hb.events.forEach(function (ev) {
          ev.bar = b;
          ev.clef = st.clef;
          if (starts.indexOf(ev.start) < 0) starts.push(ev.start);
        });
      });
      starts.sort(function (x, y) { return x - y; });
      starts.forEach(function (s, k) {
        var col = { i: cols.length, bar: b, start: s, delta: (k + 1 < starts.length ? starts[k + 1] : barBeats) - s, ev: { rh: null, lh: null } };
        staves.forEach(function (st) {
          var hb = parsed[st.hand][b];
          if (!hb) return;
          hb.events.forEach(function (ev) { if (ev.start === s) { col.ev[st.hand] = ev; ev.col = col; } });
        });
        bar.cols.push(col);
        cols.push(col);
      });
      staves.forEach(function (st) {
        var hb = parsed[st.hand][b];
        if (hb && hb.events.length === 1 && hb.events[0].rest && hb.events[0].dur === barBeats) hb.events[0].wholeBar = true;
      });
      bars.push(bar);
    }
    // 調号・臨時記号の表示、連桁、符尾の向き
    staves.forEach(function (st) {
      parsed[st.hand].forEach(function (hb) {
        var seen = {};
        hb.events.forEach(function (ev) {
          ev.notes.forEach(function (n) {
            var k = n.letter + n.octave;
            var expect = seen[k] !== undefined ? seen[k] : (KEY_ALTER[key][n.letter] || 0);
            if (n.alter !== expect) { n.acc = n.alter; seen[k] = n.alter; }
          });
        });
        // 八分音符: 拍の頭から2つ続けば連桁
        hb.events.forEach(function (ev, k) {
          var nx = hb.events[k + 1];
          if (ev.durCode === "8" && !ev.rest && !ev.beam && Math.abs(ev.start % 1) < 1e-6 &&
              nx && nx.durCode === "8" && !nx.rest) {
            ev.beam = nx; nx.beamFrom = ev;
          }
        });
        hb.events.forEach(function (ev) { if (!ev.beamFrom) geom(ev, st.clef); });
      });
    });
    return {
      time: time, barBeats: barBeats, key: key, clef: clef, staves: staves, hands: staves.map(function (s) { return s.hand; }),
      bars: bars, cols: cols, bpm: data.bpm || 0, errors: errs
    };
  }

  // 符頭の位置・符尾の向き(五線の第5線が y=0、第1線が y=40)
  function geom(ev, clef) {
    var bottom = BOTTOM_STEP[clef], mid = bottom + 4;
    var group = ev.beam ? [ev, ev.beam] : [ev];
    group.forEach(function (e) {
      e.heads = e.notes.map(function (n) {
        var d = n.step - bottom;
        return { n: n, y: 40 - d * 5, line: ((d % 2) + 2) % 2 === 0, disp: 0 };
      });
    });
    if (ev.rest) { ev.minY = 0; ev.maxY = 40; return; }
    // 向き: 第3線からいちばん遠い音で決める(線の上・同じ距離なら下向き)
    var far = 0, farStep = mid;
    group.forEach(function (e) {
      e.notes.forEach(function (n) {
        var d = Math.abs(n.step - mid);
        if (d > far || (d === far && n.step > farStep)) { far = d; farStep = n.step; }
      });
    });
    var up = farStep < mid;
    group.forEach(function (e) {
      e.up = e.durCode === "1" ? null : up;
      var hs = e.heads;
      // 2度でぶつかる符頭をずらす(上向き・全音符は右へ、下向きは左へ)
      if (e.up === false) {
        for (var k = hs.length - 2; k >= 0; k--) {
          if (hs[k + 1].n.step - hs[k].n.step === 1 && !hs[k + 1].disp) hs[k].disp = -1;
        }
      } else {
        for (var j = 1; j < hs.length; j++) {
          if (hs[j].n.step - hs[j - 1].n.step === 1 && !hs[j - 1].disp) hs[j].disp = 1;
        }
      }
      var ys = hs.map(function (h) { return h.y; });
      var minH = Math.min.apply(null, ys), maxH = Math.max.apply(null, ys);
      e.minHead = minH; e.maxHead = maxH;
      if (e.up === true) { e.stemFrom = maxH; e.tip = Math.min(minH - 35, 20); }
      else if (e.up === false) { e.stemFrom = minH; e.tip = Math.max(maxH + 35, 20); }
      e.minY = Math.min(minH - 6, e.up === true ? e.tip - 5 : 99);
      e.maxY = Math.max(maxH + 6, e.up === false ? e.tip + 5 : -99);
      if (hs.some(function (h) { return h.n.acc !== undefined; })) e.minY = Math.min(e.minY, minH - 14);
      if (e.stacc) {
        if (e.up === false) e.minY = Math.min(e.minY, minH - 12);
        else e.maxY = Math.max(e.maxY, maxH + 12);
      }
    });
  }

  // 使っている音の範囲
  function scoreRange(data, hand) {
    var S = data && data.cols ? data : parseScore(data);
    var lo = 999, hi = -1;
    S.cols.forEach(function (c) {
      ["rh", "lh"].forEach(function (h) {
        if (hand && hand !== "both" && hand !== h) return;
        var ev = c.ev[h];
        if (ev) ev.notes.forEach(function (n) { lo = Math.min(lo, n.midi); hi = Math.max(hi, n.midi); });
      });
    });
    if (hi < 0) return { lo: 60, hi: 72 };
    return { lo: lo, hi: hi };
  }
  // 鍵盤の範囲: lo の下のド 〜 hi の上のド。C3〜C5 より狭くしない
  function kbRange(lo, hi) {
    var from = Math.min(48, lo - pc(lo));
    var to = Math.max(72, pc(hi) === 0 ? hi : hi - pc(hi) + 12);
    return { from: from, to: to };
  }
  // まちがいの一覧(拍の合計・小節の数・指番号・読めないトークン)
  function checkScore(data) { return parseScore(data).errors; }
  // 反復記号を展開した小節の順
  function playOrder(S) {
    var order = [], i = 0, from = 0, done = {}, guard = 0;
    while (i < S.bars.length && guard++ < 10000) {
      var b = S.bars[i];
      if (b.startRepeat) from = i;
      order.push(i);
      if (b.endRepeat && !done[i]) { done[i] = true; i = from; continue; }
      i++;
    }
    return order;
  }

  // =====================================================================
  // 楽譜: 描画
  // =====================================================================
  var STATE_INK = { wrong: "var(--note-wrong)", target: "var(--note-target)", play: "var(--note-play)", done: "var(--note-done)" };
  var STATE_BG = { wrong: "var(--bad-soft)", target: "var(--note-target-soft)", play: "var(--note-play-soft)" };
  var QUARTER_REST = "M13 4 L20 12 L15 19 L21 27 C 16 24, 12 27, 16 34 C 9 30, 10 22, 17 24 L 11 17 L 16 11 Z";
  var CLEF = {
    treble: { glyph: "𝄞", size: 40, base: 30, x: 2 },
    bass: { glyph: "𝄢", size: 40, base: 36, x: 3 }
  };
  var MUSIC_FONT = "'Noto Music', 'Apple Symbols', 'Segoe UI Symbol', serif";

  function slotW(d) { return d >= 4 ? 48 : d >= 3 ? 42 : d >= 2 ? 38 : d >= 1.5 ? 34 : d >= 1 ? 30 : 24; }
  // 楕円の輪郭(回転つき)。穴あきの符頭に使う
  function ellPath(cx, cy, rx, ry, deg) {
    var a = deg * Math.PI / 180, ux = rx * Math.cos(a), uy = rx * Math.sin(a);
    return "M" + r1(cx + ux) + " " + r1(cy + uy) + " A" + rx + " " + ry + " " + deg + " 1 0 " + r1(cx - ux) + " " + r1(cy - uy) +
      " A" + rx + " " + ry + " " + deg + " 1 0 " + r1(cx + ux) + " " + r1(cy + uy) + " Z";
  }
  // 臨時記号(♯ ♭ ♮)を線で描く。戻り値: [[要素, 色をつける属性], …]
  function accGlyph(parent, kind, x, y, color) {
    var out = [];
    function add(el, attr) { parent.appendChild(el); out.push([el, attr]); }
    if (kind === 1) {
      add(svgEl("path", { d: "M" + r1(x - 2.2) + " " + r1(y - 8) + " V" + r1(y + 10) + " M" + r1(x + 2.2) + " " + r1(y - 10) + " V" + r1(y + 8), stroke: color, "stroke-width": 1.1, fill: "none" }), "stroke");
      add(svgEl("path", {
        d: "M" + (x - 5) + " " + r1(y - 1.6) + " L" + (x + 5) + " " + r1(y - 4.6) + " L" + (x + 5) + " " + r1(y - 2.2) + " L" + (x - 5) + " " + r1(y + 0.8) + " Z" +
          " M" + (x - 5) + " " + r1(y + 4.4) + " L" + (x + 5) + " " + r1(y + 1.4) + " L" + (x + 5) + " " + r1(y + 3.8) + " L" + (x - 5) + " " + r1(y + 6.8) + " Z",
        fill: color
      }), "fill");
    } else if (kind === -1) {
      add(svgEl("path", {
        d: "M" + r1(x - 3) + " " + r1(y - 13) + " V" + r1(y + 5) + " C" + r1(x + 1) + " " + r1(y + 2.5) + " " + r1(x + 5.5) + " " + r1(y - 0.5) + " " + r1(x + 4.2) + " " + r1(y - 3.4) +
          " C" + r1(x + 3) + " " + r1(y - 6) + " " + r1(x - 0.6) + " " + r1(y - 4.6) + " " + r1(x - 3) + " " + r1(y - 1.6),
        stroke: color, "stroke-width": 1.5, fill: "none", "stroke-linejoin": "round"
      }), "stroke");
    } else {
      add(svgEl("path", { d: "M" + r1(x - 2.5) + " " + r1(y - 10) + " V" + r1(y + 5) + " M" + r1(x + 2.5) + " " + r1(y - 5) + " V" + r1(y + 10), stroke: color, "stroke-width": 1.1, fill: "none" }), "stroke");
      add(svgEl("path", {
        d: "M" + r1(x - 2.5) + " " + r1(y - 2.6) + " L" + r1(x + 2.5) + " " + r1(y - 4.6) + " L" + r1(x + 2.5) + " " + r1(y - 2.2) + " L" + r1(x - 2.5) + " " + r1(y - 0.2) + " Z" +
          " M" + r1(x - 2.5) + " " + r1(y + 2.6) + " L" + r1(x + 2.5) + " " + r1(y + 0.6) + " L" + r1(x + 2.5) + " " + r1(y + 3) + " L" + r1(x - 2.5) + " " + r1(y + 5) + " Z",
        fill: color
      }), "fill");
    }
    return out;
  }

  function score(container, data, opts) {
    opts = opts || {};
    var S = parseScore(data);
    if (S.errors.length && typeof console !== "undefined") console.warn("Piano.score: " + S.errors.join(" / "));
    var grand = S.staves.length === 2;
    var self = {
      S: S, cols: S.cols, zoom: opts.zoom || 1, hand: "both", fingers: opts.fingers !== false,
      onTap: opts.onTap || null, container: container, systems: []
    };
    S.cols.forEach(function (c) { c.states = {}; c.timers = {}; });
    var lastW = -1, timer = 0, ro = null;

    // 列と小節の幅(拡大率に関係しない)
    S.bars.forEach(function (bar) {
      bar.cols.forEach(function (c) {
        var acc = 0, dl = 0, dr = 0, whole = true;
        ["rh", "lh"].forEach(function (h) {
          var ev = c.ev[h];
          if (!ev) return;
          if (!ev.wholeBar) whole = false;
          var nAcc = 0;
          (ev.heads || []).forEach(function (hd) {
            if (hd.n.acc !== undefined) nAcc++;
            if (hd.disp < 0) dl = 11;
            if (hd.disp > 0) dr = 11;
          });
          acc = Math.max(acc, nAcc ? 12 + (nAcc - 1) * 9 : 0);
        });
        c.headOff = acc + dl + 7;
        c.base = whole && bar.cols.length === 1 ? 48 : slotW(c.delta);
        c.extra = acc + dl + dr;
      });
    });
    // 狭い段(W < 560。スマホ)では、音の最小幅・小節の余白・段の頭を縮めて、
    // 四分音符4つの小節が1段に2小節入るようにする(臨時記号・ずらした符頭の幅は縮めない)
    var narrow = false, CLEF_W = 38, TIME_W = 26;
    function layoutWidths(isNarrow) {
      narrow = isNarrow;
      CLEF_W = narrow ? 34 : 38;
      TIME_W = narrow ? 22 : 26;
      var k = narrow ? 0.72 : 1;
      S.bars.forEach(function (bar) {
        bar.padL = (narrow ? 8 : 10) + (bar.startRepeat ? 14 : 0);
        bar.padR = (narrow ? 4 : 6) + (bar.endRepeat ? 12 : 0);
        bar.cols.forEach(function (c) { c.w = c.base * k + c.extra; });
        bar.w = bar.padL + bar.padR + bar.cols.reduce(function (a, c) { return a + c.w; }, 0);
      });
    }
    function headerW(first) { return CLEF_W + Math.abs(S.key) * 10 + (first ? TIME_W : 0) + (narrow ? 4 : 6); }

    function render() {
      var cw = container.clientWidth || 600;
      var W = Math.max(300, Math.min(960, Math.floor(cw / self.zoom)));
      lastW = cw;
      layoutWidths(W < 560);
      container.replaceChildren();
      self.systems = [];
      var L = grand ? 17 : 3;
      var maxBars = W >= 560 ? 4 : 2;
      var groups = [], cur = null;
      S.bars.forEach(function (b) {
        if (!cur || cur.bars.length >= maxBars || (cur.width + b.w > W && cur.bars.length)) {
          cur = { bars: [], first: groups.length === 0, width: L + headerW(groups.length === 0) };
          groups.push(cur);
        }
        cur.bars.push(b);
        cur.width += b.w;
      });
      var prevF = null;
      groups.forEach(function (g, gi) {
        var fixed = L + headerW(g.first), colSum = 0;
        g.bars.forEach(function (b) { fixed += b.padL + b.padR; b.cols.forEach(function (c) { colSum += c.w; }); });
        var f = (W - fixed - 2) / colSum;
        if (gi === groups.length - 1 && g.bars.length < maxBars) f = Math.min(f, prevF !== null ? prevF : 1.8);
        if (f < 1) f = 1;
        prevF = f;
        drawSystem(g, gi, f, L);
      });
      S.cols.forEach(applyState);
      applyHand();
    }

    function drawSystem(g, gi, f, L) {
      // 横の位置
      var x0 = L + headerW(g.first), x = x0;
      g.bars.forEach(function (b) {
        b.x0 = x;
        x += b.padL;
        b.cols.forEach(function (c) {
          c.x0 = x;
          c.ws = c.w * f;
          c.hx = x + c.headOff;
          x += c.ws;
          c.sys = gi;
        });
        x += b.padR;
        b.x1 = x;
        b.cols.forEach(function (c) {
          ["rh", "lh"].forEach(function (h) { if (c.ev[h] && c.ev[h].wholeBar) c.ev[h].wx = (b.x0 + b.x1) / 2; });
        });
      });
      var Wsys = x + 2;
      // 縦の範囲(五線の上の線を 0 とした位置)
      var ext = S.staves.map(function (st) {
        var e = { minY: 0, maxY: 40, fStack: 0, hasF: false, hasDyn: false };
        g.bars.forEach(function (b) {
          b.cols.forEach(function (c) {
            var ev = c.ev[st.hand];
            if (!ev) return;
            e.minY = Math.min(e.minY, ev.minY !== undefined ? ev.minY : 0);
            e.maxY = Math.max(e.maxY, ev.maxY !== undefined ? ev.maxY : 40);
            if (ev.beamFrom) {
              e.minY = Math.min(e.minY, ev.minY);
              e.maxY = Math.max(e.maxY, ev.maxY);
            }
            var nf = ev.notes.filter(function (n) { return n.finger; }).length;
            if (nf && self.fingers) { e.hasF = true; e.fStack = Math.max(e.fStack, nf); }
            if (ev.dyn) e.hasDyn = true;
          });
        });
        var top = e.minY, bot = e.maxY;
        if (st.hand === "rh") {
          e.fRow = Math.min(-12, e.minY - 5);
          if (e.hasF) top = e.fRow - 9 - (e.fStack - 1) * 10;
          e.dRow = Math.max(58, e.maxY + 15);
          if (e.hasDyn) bot = e.dRow + 3;
        } else {
          e.fRow = Math.max(60, e.maxY + 13);
          if (e.hasF) bot = e.fRow + (e.fStack - 1) * 10 + 2;
          e.dRow = Math.max(58, (e.hasF ? bot : e.maxY) + 15);
          if (e.hasDyn) bot = e.dRow + 3;
        }
        e.top = top; e.bot = bot;
        return e;
      });
      var off = [Math.max(32, 6 - ext[0].top)];
      if (grand) off.push(Math.max(off[0] + 110, off[0] + ext[0].bot + 10 - ext[1].top));
      var lastI = off.length - 1;
      var H = off[lastI] + Math.max(72, ext[lastI].bot + 10);
      var yTop = off[0], yBot = off[lastI] + 40;

      var svg = svgEl("svg", {
        class: "pn-system", viewBox: "0 0 " + r1(Wsys) + " " + r1(H), role: "group",
        "aria-label": "楽譜 " + (g.bars[0].i + 1) + "〜" + (g.bars[g.bars.length - 1].i + 1) + "小節"
      });
      svg.style.cssText = "display:block;height:auto;max-width:100%;overflow:visible;width:" + r1(Wsys * self.zoom) + "px";
      var gBg = svgEl("g", {}), gStaff = svgEl("g", {}), gCols = svgEl("g", {}), gTop = svgEl("g", {});
      svg.appendChild(gBg); svg.appendChild(gStaff); svg.appendChild(gCols); svg.appendChild(gTop);
      var INK = "var(--score-ink)";

      // 五線
      off.forEach(function (oy) {
        for (var k = 0; k < 5; k++) {
          gStaff.appendChild(svgEl("line", { x1: L, x2: r1(Wsys - 2), y1: oy + k * 10, y2: oy + k * 10, stroke: "var(--staff-line)", "stroke-width": 1.1 }));
        }
      });
      // 大譜表: 左の縦線と波かっこ
      if (grand) {
        gStaff.appendChild(svgEl("line", { x1: L + 0.6, x2: L + 0.6, y1: yTop, y2: yBot, stroke: INK, "stroke-width": 1.2 }));
        var y0 = yTop, y1 = yBot, h = y1 - y0, mid = (y0 + y1) / 2, xr = L - 3, xl = L - 14, xm = L - 8.5;
        var P2 = function (x, y) { return r1(x) + " " + r1(y); };
        gStaff.appendChild(svgEl("path", {
          d: "M" + P2(xr, y0) +
            " C" + P2(xr - 6, y0 + 2) + " " + P2(xm - 1.6, y0 + h * 0.1) + " " + P2(xm - 1.6, y0 + h * 0.25) +
            " C" + P2(xm - 1.6, mid - h * 0.12) + " " + P2(xl + 3, mid - 2) + " " + P2(xl, mid) +
            " C" + P2(xl + 3, mid + 2) + " " + P2(xm - 1.6, mid + h * 0.12) + " " + P2(xm - 1.6, y1 - h * 0.25) +
            " C" + P2(xm - 1.6, y1 - h * 0.1) + " " + P2(xr - 6, y1 - 2) + " " + P2(xr, y1) +
            " C" + P2(xr - 4, y1 - 1) + " " + P2(xm + 1.6, y1 - h * 0.1) + " " + P2(xm + 1.6, y1 - h * 0.25) +
            " C" + P2(xm + 1.6, mid + h * 0.1) + " " + P2(xl + 5, mid + 1) + " " + P2(xl, mid) +
            " C" + P2(xl + 5, mid - 1) + " " + P2(xm + 1.6, mid - h * 0.1) + " " + P2(xm + 1.6, y0 + h * 0.25) +
            " C" + P2(xm + 1.6, y0 + h * 0.1) + " " + P2(xr - 4, y0 + 1) + " " + P2(xr, y0) + " Z",
          fill: INK
        }));
      }
      // 音部記号・調号・拍子記号
      S.staves.forEach(function (st, si) {
        var oy = off[si], cf = CLEF[st.clef];
        var t = svgEl("text", { x: L + cf.x, y: oy + cf.base, "font-size": cf.size, "font-family": MUSIC_FONT, fill: INK });
        t.textContent = cf.glyph;
        gStaff.appendChild(t);
        var kx = L + CLEF_W + 6;
        if (S.key) {
          var step = S.key > 0 ? (st.clef === "treble" ? 38 : 24) : (st.clef === "treble" ? 34 : 20);
          var ky = oy + 40 - (step - BOTTOM_STEP[st.clef]) * 5;
          accGlyph(gStaff, S.key > 0 ? 1 : -1, kx, ky, INK);
        }
        if (g.first) {
          var tx = L + CLEF_W + Math.abs(S.key) * 10 + TIME_W / 2 + 2;
          [S.time[0], S.time[1]].forEach(function (num, k) {
            var tt = svgEl("text", {
              x: tx, y: oy + (k === 0 ? 18.5 : 38.5), "text-anchor": "middle", "font-size": 25, "font-weight": 700,
              "font-family": "var(--font-display)", fill: INK
            });
            tt.textContent = String(num);
            gStaff.appendChild(tt);
          });
        }
      });
      // 小節線
      g.bars.forEach(function (b, k) {
        var isLast = b.i === S.bars.length - 1;
        var xe = b.x1;
        function vline(xx, w) { gStaff.appendChild(svgEl("line", { x1: r1(xx), x2: r1(xx), y1: yTop, y2: yBot, stroke: INK, "stroke-width": w })); }
        function dots(xx) {
          off.forEach(function (oy) {
            gStaff.appendChild(svgEl("circle", { cx: r1(xx), cy: oy + 15, r: 1.9, fill: INK }));
            gStaff.appendChild(svgEl("circle", { cx: r1(xx), cy: oy + 25, r: 1.9, fill: INK }));
          });
        }
        if (b.startRepeat) { vline(b.x0 + 3, 3.5); vline(b.x0 + 8, 1.2); dots(b.x0 + 12.5); }
        if (b.endRepeat) { dots(xe - 11.5); vline(xe - 7, 1.2); vline(xe - 2, 3.5); }
        else if (isLast) { vline(xe - 6, 1.2); vline(xe - 2, 3.5); }
        else if (b.double) { vline(xe - 4, 1.2); vline(xe - 0.6, 1.2); }
        else vline(xe - 0.6, 1.2);
      });
      // 列
      var beams = [], slurs = [];
      g.bars.forEach(function (b) {
        b.cols.forEach(function (c) {
          var gc = svgEl("g", { class: "sc-ev" });
          gc.style.cursor = "pointer";
          c.paint = [];
          c.g = {};
          c.bg = svgEl("rect", { x: r1(c.hx - 13), y: yTop - 9, width: 26 + (c.w > 40 ? 0 : 0), height: yBot - yTop + 18, rx: 7, fill: "transparent" });
          gBg.appendChild(c.bg);
          gc.appendChild(svgEl("rect", { class: "sc-hit", x: r1(c.x0 - 2), y: 0, width: r1(Math.max(c.ws, 20) + 2), height: r1(H), fill: "transparent" }));
          S.staves.forEach(function (st, si) {
            var ev = c.ev[st.hand];
            if (!ev) return;
            var gh = svgEl("g", {});
            c.g[st.hand] = gh;
            gc.appendChild(gh);
            drawEvent(gh, ev, ev.wholeBar ? ev.wx : c.hx, off[si], ext[si], st, c.paint, INK);
            if (ev.beam) beams.push({ a: ev, b: ev.beam, oy: off[si], st: st });
            if (ev.slurStart || ev.slurEnd) slurs.push({ ev: ev, oy: off[si] });
          });
          var label = describeCol(c);
          gc.setAttribute("role", "button");
          gc.setAttribute("tabindex", "-1");
          gc.setAttribute("aria-label", label + "を鳴らす");
          gc.addEventListener("click", function () { tap(c); });
          gc.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(c); } });
          gCols.appendChild(gc);
        });
      });
      // 連桁
      beams.forEach(function (bm) {
        var a = bm.a, b2 = bm.b, ca = a.col, cb = b2.col;
        var up = a.up;
        var xa = ca.hx + (up ? 5.8 : -5.8), xb = cb.hx + (up ? 5.8 : -5.8);
        var ta = a.tip, tb = b2.tip;
        var dy = Math.max(-5, Math.min(5, tb - ta));
        var ya = up ? Math.min(ta, tb - dy) : Math.max(ta, tb - dy);
        var yb = ya + dy;
        [[a, xa, ya, ca], [b2, xb, yb, cb]].forEach(function (p) {
          var st = svgEl("line", { x1: r1(p[1]), x2: r1(p[1]), y1: r1(bm.oy + p[0].stemFrom + (up ? -1 : 1)), y2: r1(bm.oy + p[2]), stroke: INK, "stroke-width": 1.3 });
          p[3].g[bm.st.hand].appendChild(st);
          p[3].paint.push([st, "stroke"]);
        });
        var t = up ? 4.5 : -4.5;
        ca.g[bm.st.hand].appendChild(svgEl("path", {
          d: "M" + r1(xa - 0.65) + " " + r1(bm.oy + ya) + " L" + r1(xb + 0.65) + " " + r1(bm.oy + yb) + " L" + r1(xb + 0.65) + " " + r1(bm.oy + yb + t) + " L" + r1(xa - 0.65) + " " + r1(bm.oy + ya + t) + " Z",
          fill: INK
        }));
      });
      // スラー
      slurs.forEach(function (s) {
        if (!s.ev.slurStart) return;
        var ev = s.ev, end = null;
        // 同じ手で次の slurEnd を探す
        for (var k = ev.col.i; k < S.cols.length; k++) {
          var e2 = S.cols[k].ev[ev.hand];
          if (e2 && e2 !== ev && e2.slurEnd) { end = e2; break; }
          if (e2 && e2 !== ev && e2.slurStart) break;
        }
        if (!end) return;
        var below = ev.up !== false;
        var xa = ev.col.hx + 2, ya = s.oy + (below ? ev.maxHead + 7 : ev.minHead - 7);
        var sameSys = end.col.sys === ev.col.sys;
        var xb = sameSys ? end.col.hx - 2 : Wsys - 6;
        var yb = sameSys ? s.oy + (below ? end.maxHead + 7 : end.minHead - 7) : ya;
        drawSlur(ev.col.g[ev.hand] || gTop, xa, ya, xb, yb, below, INK);
      });
      slurs.forEach(function (s) {
        // 前の段から続くスラーの終わり
        var ev = s.ev;
        if (!ev.slurEnd || ev.slurStart) return;
        for (var k = ev.col.i - 1; k >= 0; k--) {
          var e1 = S.cols[k].ev[ev.hand];
          if (e1 && e1.slurStart) {
            if (e1.col.sys !== ev.col.sys) {
              var below = e1.up !== false;
              var yb = s.oy + (below ? ev.maxHead + 7 : ev.minHead - 7);
              drawSlur(ev.col.g[ev.hand] || gTop, x0 - 4, yb, ev.col.hx - 2, yb, below, INK);
            }
            break;
          }
          if (e1 && e1.slurEnd) break;
        }
      });
      container.appendChild(svg);
      self.systems.push({ svg: svg, bars: g.bars });
    }

    function drawSlur(parent, xa, ya, xb, yb, below, ink) {
      var dir = below ? 1 : -1, len = Math.abs(xb - xa);
      var hgt = Math.min(14, 5 + len * 0.06);
      var mx = (xa + xb) / 2, my = (ya + yb) / 2 + dir * hgt;
      var my2 = my - dir * 2.2;
      parent.appendChild(svgEl("path", {
        d: "M" + r1(xa) + " " + r1(ya) + " Q" + r1(mx) + " " + r1(my) + " " + r1(xb) + " " + r1(yb) + " Q" + r1(mx) + " " + r1(my2) + " " + r1(xa) + " " + r1(ya) + " Z",
        fill: ink, stroke: ink, "stroke-width": 0.5
      }));
    }

    function drawEvent(gh, ev, hx, oy, e, st, paint, INK) {
      function add(el, attr) { gh.appendChild(el); if (attr) paint.push([el, attr]); return el; }
      if (ev.rest) {
        var dc = ev.wholeBar ? "1" : ev.durCode;
        if (dc === "1") add(svgEl("rect", { x: r1(hx - 5.5), y: oy + 10, width: 11, height: 5, fill: INK }), "fill");
        else if (dc === "2" || dc === "2.") add(svgEl("rect", { x: r1(hx - 5.5), y: oy + 15, width: 11, height: 5, fill: INK }), "fill");
        else if (dc === "4" || dc === "4.") {
          add(svgEl("path", { d: QUARTER_REST, transform: "translate(" + r1(hx - 15) + " " + (oy + 1) + ")", fill: INK, stroke: INK, "stroke-width": 1, "stroke-linejoin": "round" }), "fill");
        } else {
          add(svgEl("circle", { cx: r1(hx - 2.5), cy: oy + 15, r: 2.4, fill: INK }), "fill");
          add(svgEl("path", { d: "M" + r1(hx - 3) + " " + (oy + 16.6) + " Q" + r1(hx + 1) + " " + (oy + 18) + " " + r1(hx + 4) + " " + (oy + 13) + " L" + r1(hx - 0.5) + " " + (oy + 30), stroke: INK, "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" }), "stroke");
        }
        if (!ev.wholeBar && dc.indexOf(".") > 0) add(svgEl("circle", { cx: r1(hx + 9), cy: oy + 15, r: 1.6, fill: INK }), "fill");
        return;
      }
      var hs = ev.heads, bottom = BOTTOM_STEP[st.clef];
      var anyL = hs.some(function (h) { return h.disp < 0; }), anyR = hs.some(function (h) { return h.disp > 0; });
      // 加線
      var steps = hs.map(function (h) { return h.n.step; });
      var lo = Math.min.apply(null, steps), hi = Math.max.apply(null, steps);
      var lw1 = hx - 9 - (anyL ? 11 : 0), lw2 = hx + 9 + (anyR ? 11 : 0);
      var s;
      for (s = bottom - 2; s >= lo; s -= 2) gh.appendChild(svgEl("line", { x1: r1(lw1), x2: r1(lw2), y1: oy + 40 - (s - bottom) * 5, y2: oy + 40 - (s - bottom) * 5, stroke: "var(--staff-line)", "stroke-width": 1.1 }));
      for (s = bottom + 10; s <= hi; s += 2) gh.appendChild(svgEl("line", { x1: r1(lw1), x2: r1(lw2), y1: oy + 40 - (s - bottom) * 5, y2: oy + 40 - (s - bottom) * 5, stroke: "var(--staff-line)", "stroke-width": 1.1 }));
      // 符頭
      var dc2 = ev.durCode;
      hs.forEach(function (h) {
        var x = hx + h.disp * 11.6, y = oy + h.y;
        if (dc2 === "1") add(svgEl("path", { d: ellPath(x, y, 7.4, 4.8, 0) + " " + ellPath(x, y, 3.6, 2.5, -55), fill: INK, "fill-rule": "evenodd" }), "fill");
        else if (dc2 === "2" || dc2 === "2.") add(svgEl("path", { d: ellPath(x, y, 6.2, 4.5, -20) + " " + ellPath(x, y, 4.6, 2.1, -20), fill: INK, "fill-rule": "evenodd" }), "fill");
        else add(svgEl("ellipse", { cx: r1(x), cy: y, rx: 6.2, ry: 4.5, transform: "rotate(-20 " + r1(x) + " " + y + ")", fill: INK }), "fill");
      });
      // 符尾と旗(連桁の音は、あとで連桁まで伸ばす)
      if (ev.up !== null && ev.up !== undefined && !ev.beam && !ev.beamFrom) {
        var sx = hx + (ev.up ? 5.8 : -5.8);
        add(svgEl("line", { x1: r1(sx), x2: r1(sx), y1: r1(oy + ev.stemFrom + (ev.up ? -1 : 1)), y2: r1(oy + ev.tip), stroke: INK, "stroke-width": 1.3 }), "stroke");
        if (dc2 === "8") {
          var ty = oy + ev.tip, d = ev.up ? 1 : -1;
          add(svgEl("path", {
            d: "M" + r1(sx) + " " + r1(ty) + " C" + r1(sx + 1) + " " + r1(ty + d * 8) + " " + r1(sx + 9.5) + " " + r1(ty + d * 10) + " " + r1(sx + 7.5) + " " + r1(ty + d * 21) +
              " C" + r1(sx + 7.6) + " " + r1(ty + d * 14) + " " + r1(sx + 3) + " " + r1(ty + d * 11.5) + " " + r1(sx) + " " + r1(ty + d * 9.5) + " Z",
            fill: INK
          }), "fill");
        }
      }
      // 付点
      if (dc2.indexOf(".") > 0) {
        var dx = hx + (anyR ? 11.6 : 0) + 10;
        hs.forEach(function (h) { add(svgEl("circle", { cx: r1(dx), cy: oy + h.y - (h.line ? 5 : 0), r: 1.6, fill: INK }), "fill"); });
      }
      // 臨時記号(高い音から、ぶつからないように左へずらす)
      var k = 0;
      hs.slice().reverse().forEach(function (h) {
        if (h.n.acc === undefined) return;
        var ax = hx - 15 - (anyL ? 11 : 0) - k * 9;
        accGlyph(gh, h.n.acc, ax, oy + h.y, INK).forEach(function (p) { paint.push(p); });
        k++;
      });
      // スタッカート
      if (ev.stacc) {
        var syy = ev.up === false ? ev.minHead - 9 : ev.maxHead + 9;
        add(svgEl("circle", { cx: r1(hx), cy: oy + syy, r: 1.7, fill: INK }), "fill");
      }
      // 指番号
      if (self.fingers) {
        var fsn = ev.notes.filter(function (n) { return n.finger; });
        if (fsn.length) {
          var order = fsn.slice().sort(function (a, b) { return st.hand === "rh" ? a.step - b.step : b.step - a.step; });
          order.forEach(function (n, j) {
            var fy = st.hand === "rh" ? e.fRow - j * 10 : e.fRow + j * 10;
            var t = svgEl("text", { x: r1(hx), y: r1(oy + fy), "text-anchor": "middle", "font-size": 11, "font-weight": 600, "font-family": "var(--font-mono)", fill: "var(--score-finger)" });
            t.textContent = String(n.finger);
            gh.appendChild(t);
          });
        }
      }
      // 強弱記号
      if (ev.dyn) {
        var dt = svgEl("text", { x: r1(hx - 6), y: r1(oy + e.dRow), "font-size": 15, "font-weight": 700, "font-style": "italic", "font-family": "var(--font-display)", fill: INK });
        dt.textContent = ev.dyn;
        gh.appendChild(dt);
      }
    }

    function describeCol(c) {
      var parts = [];
      ["rh", "lh"].forEach(function (h) {
        var ev = c.ev[h];
        if (!ev || ev.rest) return;
        parts.push((S.staves.length > 1 ? HAND_JA[h] + " " : "") + ev.notes.map(function (n) { return spellJa(n) + "(" + spellName(n) + ")"; }).join("・"));
      });
      return (c.bar + 1) + "小節目 " + (parts.length ? parts.join("、") : "休符");
    }

    function tap(c) {
      var t = audio() ? ctx.currentTime + 0.01 : 0;
      ["rh", "lh"].forEach(function (h) {
        var ev = c.ev[h];
        if (!ev || ev.rest) return;
        ev.notes.forEach(function (n) { play(n.midi, t, 0.9, h === "lh" ? 0.55 : 0.68); });
      });
      self.flash(c.i, "play", 450);
      if (self.onTap) self.onTap(c);
    }

    function applyState(c) {
      if (!c.paint) return;
      var st = c.states;
      var k = st.wrong ? "wrong" : st.target ? "target" : st.play ? "play" : st.done ? "done" : "";
      var color = k ? STATE_INK[k] : "var(--score-ink)";
      c.paint.forEach(function (p) { p[0].setAttribute(p[1], color); });
      c.bg.setAttribute("fill", (k && STATE_BG[k]) || "transparent");
    }
    function applyHand() {
      S.cols.forEach(function (c) {
        if (!c.g) return;
        ["rh", "lh"].forEach(function (h) {
          if (c.g[h]) c.g[h].setAttribute("opacity", self.hand === "both" || self.hand === h || S.staves.length === 1 ? 1 : 0.35);
        });
      });
    }

    self.mark = function (i, kind, on) {
      var c = S.cols[i];
      if (!c) return;
      if (on) c.states[kind] = true; else delete c.states[kind];
      applyState(c);
    };
    self.flash = function (i, kind, ms) {
      var c = S.cols[i];
      if (!c) return;
      clearTimeout(c.timers[kind]);
      self.mark(i, kind, true);
      c.timers[kind] = setTimeout(function () { self.mark(i, kind, false); }, ms || 300);
    };
    self.clear = function (kind) {
      S.cols.forEach(function (c) {
        if (kind) delete c.states[kind]; else c.states = {};
        applyState(c);
      });
    };
    self.setHand = function (h) { self.hand = h || "both"; applyHand(); };
    self.setZoom = function (z) { self.zoom = z || 1; render(); };
    self.setFingers = function (on) { self.fingers = !!on; render(); };
    self.order = function () { return playOrder(S); };
    self.scrollTo = function (i) {
      var c = S.cols[i];
      if (!c || c.sys === undefined || !self.systems[c.sys]) return;
      var svg = self.systems[c.sys].svg;
      var r = svg.getBoundingClientRect();
      var margin = parseFloat(getComputedStyle(svg).scrollMarginBottom) || 0;
      if (r.top < 0 || r.bottom > window.innerHeight - margin) svg.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };
    self.rerender = render;
    self.destroy = function () {
      if (ro) ro.disconnect();
      clearTimeout(timer);
      container.replaceChildren();
    };

    render();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(function () {
        if (Math.abs((container.clientWidth || 0) - lastW) < 2) return;
        clearTimeout(timer);
        timer = setTimeout(render, 150);
      });
      ro.observe(container);
    }
    return self;
  }

  // =====================================================================
  // 鍵盤
  // =====================================================================
  var PC_MAP = {
    KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11,
    KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16, Quote: 17
  };
  var PC_LABEL = { KeyA: "A", KeyW: "W", KeyS: "S", KeyE: "E", KeyD: "D", KeyF: "F", KeyT: "T", KeyG: "G", KeyY: "Y", KeyH: "H", KeyU: "U", KeyJ: "J", KeyK: "K", KeyO: "O", KeyL: "L", KeyP: "P", Semicolon: ";", Quote: "'" };
  var BLACK_OFF = { 1: -2, 3: 2, 6: -3, 8: 0, 10: 3 };
  var KEY_FILL = {
    white: { wrong: "var(--key-wrong)", good: "var(--key-good)", play: "var(--key-play)", target: "var(--key-target)" },
    black: { wrong: "var(--key-wrong-black)", good: "var(--key-good)", play: "var(--key-play-black)", target: "var(--key-target-black)" }
  };
  var activeKb = null, kbSeq = 0, pcInstalled = false, pcDown = {};

  function whiteDown(m) { while (isBlack(m)) m--; return m; }
  function whiteUp(m) { while (isBlack(m)) m++; return m; }
  function countWhites(a, b) { var n = 0; for (var m = a; m <= b; m++) if (!isBlack(m)) n++; return n; }

  function keyboard(o) {
    o = o || {};
    var uid = "pnkb" + (++kbSeq);
    var full = { from: whiteDown(o.from === undefined ? 48 : o.from), to: whiteUp(o.to === undefined ? 72 : o.to) };
    var need = o.need || null;
    var labels = o.labels || "doremi";
    var maxKey = o.maxKeyWidth || 40, maxH = o.maxHeight || 0;
    var fingers = {};
    var st = {};
    var listeners = [], pcListeners = [];
    if (o.onPress) listeners.push(o.onPress);
    if (o.onPcBase) pcListeners.push(o.onPcBase);
    var wrap = document.createElement("div");
    wrap.className = "pn-kb";
    wrap.style.cssText = "touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;";
    var svg = null, keys = {}, cur = null, W = 0, H = 124, held = {}, smallLabels = false;
    wrap.pcBase = 60;

    function computeRange() {
      var width = wrap.clientWidth || 0;
      var avail = width ? Math.floor(width / 18) : 99;
      if (countWhites(full.from, full.to) <= avail || !need) return { from: full.from, to: full.to };
      var lo = Math.min(need[0], need[1]), hi = Math.max(need[0], need[1]);
      while (pc(lo) !== 0 && pc(lo) !== 5) lo--;
      while (pc(hi) !== 11 && pc(hi) !== 4) hi++;
      var a = lo, b = hi, turn = 0, moved = true;
      while (moved && countWhites(a, b) < avail) {
        moved = false;
        if (turn % 2 === 0 && a > full.from) { a = whiteDown(a - 1); moved = true; }
        else if (b < full.to) { b = whiteUp(b + 1); moved = true; }
        else if (a > full.from) { a = whiteDown(a - 1); moved = true; }
        turn++;
      }
      return { from: a, to: b };
    }

    function build() {
      var r = computeRange();
      if (cur && cur.from === r.from && cur.to === r.to && svg) { updateLabels(); return; }
      cur = r;
      keys = {};
      var whites = [];
      for (var m = r.from; m <= r.to; m++) if (!isBlack(m)) whites.push(m);
      W = whites.length * 24 + 4;
      svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "group", "aria-label": "鍵盤 " + noteName(r.from) + "〜" + noteName(r.to) });
      var mw = whites.length * maxKey;
      if (maxH) mw = Math.min(mw, maxH * W / H);
      svg.style.cssText = "display:block;width:100%;height:auto;margin:0 auto;overflow:visible;max-width:" + Math.round(mw) + "px";
      var defs = svgEl("defs", {});
      var gw = svgEl("linearGradient", { id: uid + "w", x1: 0, y1: 0, x2: 0, y2: 1 });
      gw.appendChild(svgEl("stop", { offset: "0", style: "stop-color:var(--key-white)" }));
      gw.appendChild(svgEl("stop", { offset: "0.82", style: "stop-color:var(--key-white)" }));
      gw.appendChild(svgEl("stop", { offset: "1", style: "stop-color:var(--key-white-shade)" }));
      var gb = svgEl("linearGradient", { id: uid + "b", x1: 0, y1: 0, x2: 0, y2: 1 });
      gb.appendChild(svgEl("stop", { offset: "0", style: "stop-color:var(--key-black-top)" }));
      gb.appendChild(svgEl("stop", { offset: "1", style: "stop-color:var(--key-black)" }));
      defs.appendChild(gw); defs.appendChild(gb);
      svg.appendChild(defs);
      svg.appendChild(svgEl("rect", { x: 0, y: 0, width: W, height: 108, rx: 4, fill: "var(--key-bed)" }));
      svg.appendChild(svgEl("rect", { x: 2, y: 0, width: W - 4, height: 5, fill: "var(--key-felt)" }));
      var gW = svgEl("g", {}), gB = svgEl("g", {}), gF = svgEl("g", { "pointer-events": "none" });
      svg.appendChild(gW); svg.appendChild(gB); svg.appendChild(gF);
      whites.forEach(function (m, i) {
        var x = 2 + i * 24;
        var g = svgEl("g", { role: "button", tabindex: "-1", "aria-label": noteName(m) + " " + doremi(m) });
        g.style.cursor = "pointer";
        var rect = svgEl("rect", { x: x + 0.5, y: 5, width: 23, height: 100, rx: 2.5, fill: "url(#" + uid + "w)", stroke: "var(--key-white-edge)", "stroke-width": 1 });
        var ring = svgEl("rect", { x: x + 2, y: 6.5, width: 20, height: 97, rx: 2, fill: "none", stroke: "var(--key-target-ring)", "stroke-width": 2, visibility: "hidden" });
        var lab = svgEl("text", { x: x + 12, y: 95, "text-anchor": "middle", "font-size": 12, "font-family": "var(--font-body)", fill: pc(m) === 0 ? "var(--key-label-c)" : "var(--key-label)", "font-weight": pc(m) === 0 ? 700 : 500 });
        g.appendChild(rect); g.appendChild(ring); g.appendChild(lab);
        var dot = null;
        if (m === 60) {
          dot = svgEl("circle", { cx: x + 12, cy: 77, r: 3, fill: "var(--accent)" });
          g.appendChild(dot);
          var c4 = svgEl("text", { x: x + 12, y: 120, "text-anchor": "middle", "font-size": 10, "font-weight": 600, "font-family": "var(--font-mono)", fill: "var(--ink-muted)" });
          c4.textContent = "C4";
          svg.appendChild(c4);
        }
        gW.appendChild(g);
        keys[m] = { g: g, rect: rect, ring: ring, lab: lab, dot: dot, black: false, cx: x + 12, fy: 71 };
        bindKey(g, m);
      });
      whites.forEach(function (m, i) {
        var b = m + 1;
        if (!isBlack(b) || b > r.to) return;
        var X = 2 + (i + 1) * 24 + BLACK_OFF[pc(b)];
        var g = svgEl("g", { role: "button", tabindex: "-1", "aria-label": noteName(b) + " " + doremi(b) });
        g.style.cursor = "pointer";
        var rect = svgEl("rect", { x: X - 7, y: 5, width: 14, height: 62, rx: 1.5, fill: "url(#" + uid + "b)" });
        var lab = svgEl("text", { x: X, y: 59, "text-anchor": "middle", "font-size": 9.5, "font-family": "var(--font-mono)", "font-weight": 600, fill: "var(--key-label-on-black)" });
        g.appendChild(rect); g.appendChild(lab);
        gB.appendChild(g);
        keys[b] = { g: g, rect: rect, lab: lab, black: true, cx: X, fy: 53 };
        bindKey(g, b);
      });
      keys._gF = gF;
      wrap.replaceChildren(svg);
      Object.keys(keys).forEach(function (k) { if (k !== "_gF") paintKey(+k); });
      drawFingers();
      updateLabels();
    }

    function updateLabels() {
      if (!svg) return;
      var px = (svg.getBoundingClientRect().width || 0) * 24 / W;
      smallLabels = px > 0 && px < 22;
      var pcLab = {};
      if (labels === "pc") Object.keys(PC_MAP).forEach(function (code) { pcLab[wrap.pcBase + PC_MAP[code]] = PC_LABEL[code]; });
      Object.keys(keys).forEach(function (k) {
        if (k === "_gF") return;
        var m = +k, key = keys[k], txt = "";
        if (labels === "doremi") txt = key.black ? "" : doremi(m);
        else if (labels === "cde") txt = key.black ? "" : pcName(m);
        else if (labels === "pc") txt = pcLab[m] || "";
        if (smallLabels && labels !== "pc" && pc(m) !== 0) txt = "";
        if (smallLabels && labels === "doremi" && pc(m) === 0) txt = "ド";
        key.lab.textContent = txt;
        if (!key.black) key.lab.setAttribute("font-size", smallLabels ? 13 : 12);
      });
    }

    function paintKey(m) {
      var key = keys[m];
      if (!key) return;
      var s = st[m] || {};
      var k = s.wrong ? "wrong" : s.good ? "good" : (s.play || s.down) ? "play" : s.target ? "target" : "";
      var tbl = KEY_FILL[key.black ? "black" : "white"];
      key.rect.setAttribute("fill", k ? tbl[k] : "url(#" + uid + (key.black ? "b)" : "w)"));
      if (key.ring) key.ring.setAttribute("visibility", s.target && k === "target" ? "visible" : "hidden");
    }

    function drawFingers() {
      var gF = keys._gF;
      if (!gF) return;
      gF.replaceChildren();
      Object.keys(fingers).forEach(function (k) {
        var m = +k, f = fingers[k], key = keys[m];
        if (!key) return;
        gF.appendChild(svgEl("circle", { cx: key.cx, cy: key.fy, r: 9, fill: f.hand === "lh" ? "var(--hand-l)" : "var(--hand-r)" }));
        var t = svgEl("text", { x: key.cx, y: key.fy + 4, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, "font-family": "var(--font-mono)", fill: "var(--hand-ink)" });
        t.textContent = f.f ? String(f.f) : (f.hand === "lh" ? "左" : "右");
        if (!f.f) t.setAttribute("font-size", 9.5);
        gF.appendChild(t);
      });
      Object.keys(keys).forEach(function (k) {
        if (k !== "_gF" && keys[k].dot) keys[k].dot.setAttribute("visibility", fingers[k] ? "hidden" : "visible");
      });
    }

    function bindKey(g, m) {
      g.addEventListener("pointerdown", function (e) {
        if (e.button !== undefined && e.button > 0) return;
        e.preventDefault();
        held[e.pointerId] = m;
        press(m, "pointer");
      });
      g.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    }
    function onUp(e) {
      if (held[e.pointerId] === undefined) return;
      var m = held[e.pointerId];
      delete held[e.pointerId];
      release(m);
    }
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    var voicesByKey = {};
    function press(m, source, vel) {
      activeKb = wrap;
      var sound = o.sound !== false && !(source === "midi" && !o.midiSound);
      if (sound) {
        if (voicesByKey[m]) voicesByKey[m].release(0);
        voicesByKey[m] = play(m, 0, null, vel === undefined ? 0.7 : vel);
      }
      var s = st[m] = st[m] || {};
      s.down = (s.down || 0) + 1;
      paintKey(m);
      listeners.slice().forEach(function (fn) { fn(m, source); });
    }
    function release(m) {
      var s = st[m];
      if (s && s.down) { s.down--; paintKey(m); }
      var v = voicesByKey[m];
      if (v) {
        delete voicesByKey[m];
        v.release(Math.max(now(), v.start + 0.35));
      }
    }

    wrap.press = function (m, source, vel) { press(m, source || "pointer", vel); };
    wrap.release = release;
    wrap.light = function (m, kind) { var s = st[m] = st[m] || {}; s[kind] = (s[kind] || 0) + 1; paintKey(m); };
    wrap.unlight = function (m, kind) { var s = st[m]; if (s && s[kind]) { s[kind]--; paintKey(m); } };
    wrap.flash = function (m, kind, ms) {
      wrap.light(m, kind);
      setTimeout(function () { wrap.unlight(m, kind); }, ms || 250);
    };
    wrap.clear = function (kind) {
      Object.keys(st).forEach(function (k) {
        if (kind) delete st[k][kind];
        else { var d = st[k].down; st[k] = {}; if (d) st[k].down = d; }
        paintKey(+k);
      });
    };
    wrap.setLabels = function (mode) { labels = mode; updateLabels(); };
    wrap.setFingers = function (list) {
      fingers = {};
      (list || []).forEach(function (f) { fingers[f.midi] = { f: f.f || 0, hand: f.hand || "rh" }; });
      drawFingers();
    };
    wrap.clearFingers = function () { wrap.setFingers([]); };
    wrap.setRange = function (from, to, nd) {
      full = { from: whiteDown(from), to: whiteUp(to) };
      need = nd || null;
      cur = null;
      build();
    };
    wrap.range = function () { return cur ? { from: cur.from, to: cur.to } : { from: full.from, to: full.to }; };
    wrap.onPress = function (fn) { listeners.push(fn); return function () { var k = listeners.indexOf(fn); if (k >= 0) listeners.splice(k, 1); }; };
    wrap.onPcBase = function (fn) { pcListeners.push(fn); };
    wrap.activate = function () { activeKb = wrap; };
    wrap.setPcBase = function (b) {
      b = Math.max(24, Math.min(96, b));
      wrap.pcBase = b;
      if (labels === "pc") updateLabels();
      pcListeners.forEach(function (fn) { fn(b); });
    };

    if (o.fingers) fingers = {};
    installPc();
    build();
    if (o.fingers) wrap.setFingers(o.fingers);
    var kbRo = null, t2 = 0;
    if (typeof ResizeObserver !== "undefined") {
      var lastWidth = -1;
      kbRo = new ResizeObserver(function () {
        var w = wrap.clientWidth;
        if (Math.abs(w - lastWidth) < 2) return;
        lastWidth = w;
        clearTimeout(t2);
        t2 = setTimeout(build, 60);
      });
      kbRo.observe(wrap);
    }
    // 画面から外すときの片づけ(window のイベントと幅の監視を外し、鳴っている音を離す)
    wrap.destroy = function () {
      if (kbRo) kbRo.disconnect();
      clearTimeout(t2);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      Object.keys(voicesByKey).forEach(function (k) { release(+k); });
      if (activeKb === wrap) activeKb = null;
    };
    if (o.active) activeKb = wrap;
    midiAuto();
    return wrap;
  }

  // ---------- PCキー ----------
  function installPc() {
    if (pcInstalled || !HAS_DOM) return;
    pcInstalled = true;
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && waitPlayer) { waitPlayer.stopWait(); return; }
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || t.tagName === "TEXTAREA" || t.tagName === "SELECT" ||
          (t.tagName === "INPUT" && !/^(range|checkbox|radio|button)$/.test(t.type)))) return;
      var kb = activeKb;
      if (!kb || !kb.isConnected) return;
      if (e.code === "KeyZ" || e.code === "KeyX") {
        e.preventDefault();
        kb.setPcBase(kb.pcBase + (e.code === "KeyZ" ? -12 : 12));
        return;
      }
      var offv = PC_MAP[e.code];
      if (offv === undefined) return;
      e.preventDefault();
      var m = kb.pcBase + offv;
      pcDown[e.code] = { kb: kb, m: m };
      kb.press(m, "pc");
    });
    document.addEventListener("keyup", function (e) {
      var d = pcDown[e.code];
      if (!d) return;
      delete pcDown[e.code];
      d.kb.release(d.m);
    });
    window.addEventListener("blur", function () {
      Object.keys(pcDown).forEach(function (c) { pcDown[c].kb.release(pcDown[c].m); delete pcDown[c]; });
    });
  }

  // ---------- Web MIDI(任意) ----------
  var midi = {
    status: "off",
    listeners: [],
    onChange: function (fn) { midi.listeners.push(fn); return function () { var k = midi.listeners.indexOf(fn); if (k >= 0) midi.listeners.splice(k, 1); }; },
    enable: function () {
      if (midi.status !== "off") return;
      if (typeof navigator === "undefined" || !navigator.requestMIDIAccess) { setMidi("none"); return; }
      setMidi("requesting");
      try {
        navigator.requestMIDIAccess().then(function (access) {
          function attach() {
            var n = 0;
            access.inputs.forEach(function (inp) { inp.onmidimessage = onMidi; n++; });
            setMidi(n ? "connected" : "waiting");
          }
          access.onstatechange = attach;
          attach();
        }, function () { setMidi("denied"); });
      } catch (e) { setMidi("denied"); }
    }
  };
  function setMidi(s) { midi.status = s; midi.listeners.forEach(function (fn) { try { fn(s); } catch (e) { /* 表示だけ */ } }); }
  function onMidi(e) {
    var d = e.data;
    if (!d || d.length < 3) return;
    var kind = d[0] & 0xf0, kb = activeKb;
    if (!kb || !kb.isConnected) return;
    if (kind === 0x90 && d[2] > 0) kb.press(d[1], "midi", d[2] / 127);
    else if (kind === 0x80 || (kind === 0x90 && d[2] === 0)) kb.release(d[1]);
  }
  // すでに許可されているときだけ、黙ってつなぐ
  var midiTried = false;
  function midiAuto() {
    if (midiTried) return;
    midiTried = true;
    try {
      if (navigator.permissions && navigator.permissions.query && navigator.requestMIDIAccess) {
        navigator.permissions.query({ name: "midi" }).then(function (r) { if (r.state === "granted") midi.enable(); }, function () {});
      }
    } catch (e) { /* 使えない */ }
  }

  // =====================================================================
  // 再生と「弾いてみる」
  // =====================================================================
  var waitPlayer = null;

  function player(sc, kb, o) {
    o = o || {};
    var S = sc.S;
    var self = {
      mode: "idle", bpm: o.bpm || S.bpm || 90, hand: o.hand || "both", metronome: !!o.metronome, mistakes: 0
    };
    var ticker = null, playCol = null, playEnd = 0, lit = [], steps = [], idx = 0, req = {}, remaining = {};
    var flat = S.key < 0;

    function activeHands() {
      if (S.staves.length === 1) return [S.staves[0].hand];
      return self.hand === "both" ? ["rh", "lh"] : [self.hand];
    }
    function setStatus(t) { if (o.status) o.status.textContent = t; }
    function setMode(m) { self.mode = m; if (o.onState) o.onState(m, self); }
    function idle() { setStatus(o.idleText || ""); }

    // 反復を展開した時間の並び(単位は半拍)
    function timeline() {
      var out = [], tick = 0;
      playOrder(S).forEach(function (bi) {
        S.bars[bi].cols.forEach(function (c) { out.push({ col: c, tick: tick + Math.round(c.start * 2) }); });
        tick += Math.round(S.barBeats * 2);
      });
      return { list: out, total: tick };
    }
    function notesOf(c) {
      var out = [];
      activeHands().forEach(function (h) {
        var ev = c.ev[h];
        if (ev && !ev.rest) ev.notes.forEach(function (n) { out.push({ n: n, hand: h, ev: ev }); });
      });
      return out;
    }

    // ----- 再生 -----
    self.play = function () {
      if (self.mode === "wait" || self.mode === "done") self.stopWait();
      if (ticker && ticker.playing) return;
      if (!audio()) { setStatus("この端末では音を出せません。"); return; }
      var tl = timeline();
      var byTick = {};
      tl.list.forEach(function (e) { (byTick[e.tick] = byTick[e.tick] || []).push(e.col); });
      var midis = {};
      tl.list.forEach(function (e) { notesOf(e.col).forEach(function (x) { midis[x.n.midi] = 1; }); });
      prepare(Object.keys(midis).map(Number));
      var bb = Math.round(S.barBeats);
      var count = self.metronome ? bb * 2 : 0;
      var total = count + tl.total;
      var vel = { rh: DYN_VEL.mf, lh: DYN_VEL.mf };
      var lastSys = -1;
      ticker = Ticker({
        interval: function () { return 30 / self.bpm; },
        onSchedule: function (i, t) {
          if (i >= total) return;
          if (self.metronome && i % 2 === 0) {
            var beat = ((i - count) / 2) % bb;
            click(t, i < count ? i === 0 : beat === 0);
          }
          if (i < count) return;
          (byTick[i - count] || []).forEach(function (c) {
            activeHands().forEach(function (h) {
              var ev = c.ev[h];
              if (!ev || ev.rest) return;
              if (ev.dyn) vel[h] = DYN_VEL[ev.dyn];
              var secs = ev.dur * 60 / self.bpm * (ev.stacc ? 0.4 : 0.97);
              ev.notes.forEach(function (n) { play(n.midi, t, secs, vel[h] * (h === "lh" ? 0.82 : 1)); });
            });
          });
        },
        onBeat: function (i) {
          if (i >= total) { ticker.stop(); return; }
          if (i % 2 === 0 && o.onBeat) o.onBeat(i < count ? i / 2 : ((i - count) / 2) % bb, i < count);
          if (i < count) { if (i % 2 === 0) setStatus("カウント " + (i / 2 + 1)); return; }
          var tk = i - count;
          // 長さが終わった鍵盤の光を消す
          lit = lit.filter(function (l) { if (l.end <= tk) { kb.unlight(l.m, "play"); return false; } return true; });
          if (playCol !== null && tk >= playEnd) { sc.mark(playCol, "play", false); playCol = null; }
          var cs = byTick[tk];
          if (!cs) return;
          cs.forEach(function (c) {
            var ns = notesOf(c);
            if (!ns.length) return;
            if (playCol !== null) sc.mark(playCol, "play", false);
            playCol = c.i;
            playEnd = tk + Math.max.apply(null, ns.map(function (x) { return Math.max(1, Math.round(x.ev.dur * 2)); }));
            sc.mark(c.i, "play", true);
            ns.forEach(function (x) {
              kb.light(x.n.midi, "play");
              lit.push({ m: x.n.midi, end: tk + Math.max(1, Math.round(x.ev.dur * 2)) });
            });
            if (c.sys !== lastSys) { lastSys = c.sys; sc.scrollTo(c.i); }
            setStatus("再生中 " + (c.bar + 1) + "小節目");
          });
        },
        onStop: function () {
          lit.forEach(function (l) { kb.unlight(l.m, "play"); });
          lit = [];
          if (playCol !== null) sc.mark(playCol, "play", false);
          playCol = null;
          sc.clear("play");
          if (self.mode === "play") { setMode("idle"); idle(); }
        }
      });
      if (ticker.start()) { setMode("play"); setStatus(count ? "カウント 1" : "再生中"); }
    };
    self.stop = function () { if (ticker && ticker.playing) ticker.stop(); };
    self.togglePlay = function () { if (ticker && ticker.playing) self.stop(); else self.play(); };

    // ----- 弾いてみる -----
    var unlisten = kb.onPress(function (m) {
      if (self.mode !== "wait") return;
      if (remaining[m]) {
        delete remaining[m];
        kb.unlight(m, "target");
        kb.flash(m, "good", 200);
        if (Object.keys(remaining).length) {
          var left = Object.keys(remaining).map(function (k) { return remaining[k]; });
          setStatus(describe(left));
          fitPc(left);
        } else {
          var c = steps[idx].col;
          sc.mark(c.i, "target", false);
          sc.mark(c.i, "done", true);
          idx++;
          next();
        }
      } else if (req[m]) {
        // 和音のうち、もう押した音
      } else {
        self.mistakes++;
        kb.flash(m, "wrong", 300);
        sc.flash(steps[idx].col.i, "wrong", 300);
        var rest = Object.keys(remaining).map(function (k) { var n = remaining[k].n; return spellJa(n) + "(" + spellName(n) + ")"; });
        setStatus("いま押したのは" + noteJa(m, flat) + "。次は" + rest.join("・") + "です");
      }
    });

    function describe(list) {
      var hs = [];
      list.forEach(function (x) { if (hs.indexOf(x.hand) < 0) hs.push(x.hand); });
      var many = hs.length > 1;
      return "次: " + hs.map(function (h) {
        var ns = list.filter(function (x) { return x.hand === h; });
        if (ns.length === 1) {
          var n = ns[0].n;
          return spellJa(n) + "(" + spellName(n) + ")・" + HAND_JA[h] + (n.finger ? n.finger + "の指" : "");
        }
        return ns.map(function (x) { return spellJa(x.n); }).join("・") + "(" + (many || S.staves.length > 1 ? HAND_JA[h] + "・" : "") + ns.length + "つ同時)";
      }).join(" / ");
    }
    // PCキー(A〜' で17半音)の範囲に次の音が入らないときは、A の音を自動で合わせる(ドの位置)。
    // 両手の和音などで全部が入らないときは、低い音に合わせる(押すと残りの音に合わせ直す)
    function fitPc(list) {
      var ms = list.map(function (x) { return x.n.midi; });
      if (!ms.length) return;
      var lo = Math.min.apply(null, ms), hi = Math.max.apply(null, ms), b = kb.pcBase;
      // 片手だけの音なら、その手のいつもの位置(右手 A = C4、左手 A = C3)に入るときはそこへ戻す
      var hs = {};
      list.forEach(function (x) { hs[x.hand] = 1; });
      var only = Object.keys(hs);
      if (only.length === 1) {
        var pref = only[0] === "lh" ? 48 : 60;
        if (lo >= pref && hi <= pref + 17) { if (pref !== b) kb.setPcBase(pref); return; }
      }
      if (lo >= b && hi <= b + 17) return;
      // A をド(なければファ)にして、全部が入る位置をさがす
      var c = lo - pc(lo), f = lo - ((pc(lo) - 5 + 12) % 12);
      var nb = hi <= c + 17 ? c : hi <= f + 17 ? f : c;
      if (nb !== b) kb.setPcBase(nb);
    }
    function next() {
      kb.clear("target");
      if (idx >= steps.length) {
        kb.clearFingers();
        setMode("done");
        setStatus("最後まで弾けました! まちがい " + self.mistakes + "回");
        if (waitPlayer === self) waitPlayer = null;
        return;
      }
      var c = steps[idx].col;
      var list = notesOf(c);
      req = {}; remaining = {};
      list.forEach(function (x) { req[x.n.midi] = x; remaining[x.n.midi] = x; kb.light(x.n.midi, "target"); });
      kb.setFingers(list.map(function (x) { return { midi: x.n.midi, f: x.n.finger, hand: x.hand }; }));
      sc.mark(c.i, "target", true);
      sc.scrollTo(c.i);
      setStatus(describe(list));
      fitPc(list);
    }
    self.startWait = function () {
      // ほかのブロックの再生・メトロノームも含めて、鳴っているものを全部止める
      if (running) running.stop();
      players.forEach(function (p) { p.stop(); });
      if (waitPlayer && waitPlayer !== self) waitPlayer.stopWait();
      waitPlayer = self;
      audio();
      kb.activate();
      kb.setPcBase(self.hand === "lh" || (S.staves.length === 1 && S.staves[0].hand === "lh") ? 48 : 60);
      sc.clear("done");
      sc.clear("target");
      steps = timeline().list.filter(function (e) { return notesOf(e.col).length > 0; });
      idx = 0;
      self.mistakes = 0;
      setMode("wait");
      next();
    };
    self.stopWait = function () {
      if (self.mode !== "wait" && self.mode !== "done") return;
      if (waitPlayer === self) waitPlayer = null;
      kb.clear("target");
      kb.clearFingers();
      sc.clear("target");
      sc.clear("done");
      req = {}; remaining = {};
      setMode("idle");
      idle();
    };
    self.toggleWait = function () { if (self.mode === "wait") self.stopWait(); else self.startWait(); };
    self.setBpm = function (n) { self.bpm = Math.max(20, Math.min(240, n)); };
    self.setMetronome = function (on) { self.metronome = !!on; };
    self.setHand = function (h) {
      self.hand = h;
      sc.setHand(h);
      if (self.mode === "wait" || self.mode === "done") self.stopWait();
      kb.setPcBase(h === "lh" ? 48 : 60);
    };
    self.destroy = function () {
      self.stop();
      self.stopWait();
      unlisten();
      var k = players.indexOf(self);
      if (k >= 0) players.splice(k, 1);
    };
    sc.setHand(self.hand);
    var prevTap = sc.onTap;
    sc.onTap = function (c) {
      ["rh", "lh"].forEach(function (h) { var ev = c.ev[h]; if (ev && !ev.rest) ev.notes.forEach(function (n) { kb.flash(n.midi, "play", 450); }); });
      if (prevTap) prevTap(c);
    };
    players.push(self);
    idle();
    return self;
  }

  // =====================================================================
  // 曲集
  // =====================================================================
  // 1曲の形: { id, title, origin(どこの曲か), key(-1|0|1), time, bpm, cat, lesson(目安のレッスン番号),
  //   desc(1行の説明), score(楽譜データ。key・time・bpm は上と同じ値) }
  // cat: "rh" 右手だけ | "lh" 左手も(両手で受け渡す) | "both" 両手 | "chord" 和音つき
  // 著作権の切れた曲(民謡・伝承曲・古典)だけ。歌詞は入れない。id は変えない(保存とリンクに使う)。
  var CATS = [
    { id: "rh", label: "右手だけ" },
    { id: "lh", label: "左手も" },
    { id: "both", label: "両手" },
    { id: "chord", label: "和音つき" }
  ];
  // 左手の和音(ドの位置): C = ド・ミ・ソ、F = ド・ファ・ラ、G7 = シ・ファ・ソ
  var C_ = "C3+E3+G3", F_ = "C3+F3+A3", G7 = "B2+F3+G3";
  var KIRA_RH =
    "C4/4:1 C4 G4:4 G4 | A4:5 A4 G4/2:4 | F4/4:4 F4 E4:3 E4 | D4:2 D4 C4/2:1 | " +
    "G4/4:5 G4 F4:4 F4 | E4:3 E4 D4/2:2 | G4/4:5 G4 F4:4 F4 | E4:3 E4 D4/2:2 | " +
    "C4/4:1 C4 G4:4 G4 | A4:5 A4 G4/2:4 | F4/4:4 F4 E4:3 E4 | D4:2 D4 C4/2:1";
  function song(o) { o.score.key = o.key; o.score.time = o.time; o.score.bpm = o.bpm; return o; }
  var SONGS = [
    song({
      id: "mary", title: "メリーさんのひつじ", origin: "アメリカの童謡", key: 0, time: [4, 4], bpm: 100, cat: "rh", lesson: 6,
      desc: "ド・レ・ミ・ソの4つの音だけ。右手をドの位置に置いて、指を動かさずに弾けます。",
      score: {
        rh: "E4/4:3 D4:2 C4:1 D4:2 | E4:3 E4 E4/2 | D4/4:2 D4 D4/2 | E4/4:3 G4:5 G4/2 | " +
          "E4/4:3 D4:2 C4:1 D4:2 | E4:3 E4 E4 E4 | D4:2 D4 E4:3 D4:2 | C4/1:1"
      }
    }),
    song({
      id: "hotcross", title: "ホット・クロス・バンズ", origin: "イギリスの童謡", key: 0, time: [4, 4], bpm: 92, cat: "rh", lesson: 7,
      desc: "ミ・レ・ドの3つの音。3小節目の八分音符は「タタ」と1拍に2つ。",
      score: {
        rh: "E4/4:3 D4:2 C4/2:1 | E4/4:3 D4:2 C4/2:1 | C4/8:1 C4 C4 C4 D4:2 D4 D4 D4 | E4/4:3 D4:2 C4/2:1"
      }
    }),
    song({
      id: "kirakira", title: "きらきら星", origin: "フランスの民謡", key: 0, time: [4, 4], bpm: 92, cat: "rh", lesson: 8,
      desc: "ドの位置から、ラまで4と5の指をのばします。同じ音が2つずつ続きます。",
      score: { rh: KIRA_RH }
    }),
    song({
      id: "tsuki", title: "月の光に", origin: "フランスの民謡", key: 0, time: [4, 4], bpm: 96, cat: "lh", lesson: 10,
      desc: "まん中のフレーズ(9〜12小節)だけ左手。真ん中のドの近くで、右手と左手が受け渡します。",
      score: {
        rh: "C4/4:1 C4 C4 D4:2 | E4/2:3 D4:2 | C4/4:1 E4:3 D4:2 D4 | C4/1:1 | " +
          "C4/4:1 C4 C4 D4:2 | E4/2:3 D4:2 | C4/4:1 E4:3 D4:2 D4 | C4/1:1 | " +
          "r/1 | r | r | r | " +
          "C4/4:1 C4 C4 D4:2 | E4/2:3 D4:2 | C4/4:1 E4:3 D4:2 D4 | C4/1:1",
        lh: "r/1 | r | r | r | r | r | r | r | " +
          "D4/4:1 D4 D4 D4 | A3/2:4 A3 | D4/4:1 C4:2 B3:3 A3:4 | G3/1:5 | " +
          "r/1 | r | r | r"
      }
    }),
    song({
      id: "london", title: "ロンドン橋", origin: "イギリスの童謡", key: 0, time: [4, 4], bpm: 96, cat: "both", lesson: 12,
      desc: "右手はメロディ、左手は全音符でド(5の指)とソ(1の指)。はじめの「ソ・ラ」はやさしく四分音符にしています。",
      score: {
        rh: "G4/4:4 A4:5 G4:4 F4:3 | E4:2 F4:3 G4/2:4 | D4/4:1 E4:2 F4/2:3 | E4/4:2 F4:3 G4/2:4 | " +
          "G4/4:4 A4:5 G4:4 F4:3 | E4:2 F4:3 G4/2:4 | D4/2:1 G4:4 | E4/4:3 C4/2.:1",
        lh: "C3/1:5 | C3 | G3:1 | C3:5 | C3 | C3 | G3:1 | C3:5"
      }
    }),
    song({
      id: "saints", title: "聖者の行進", origin: "アメリカの黒人霊歌", key: 0, time: [4, 4], bpm: 104, cat: "both", lesson: 12,
      desc: "休符から入る「ン・ド・ミ・ファ」。左手は全音符で、ド・ソ・ファを1小節ずつ。",
      score: {
        rh: "!mf r/4 C4:1 E4:3 F4:4 | G4/1:5 | r/4 C4:1 E4:3 F4:4 | G4/1:5 | r/4 C4:1 E4:3 F4:4 | G4/2:5 E4:3 | C4:1 E4:3 | D4/1:2 | " +
          "r/4 E4:3 E4 D4:2 | C4/2.:1 C4/4 | E4/2:3 G4:5 | G4/4 F4/2.:4 | r/4 C4:1 E4:3 F4:4 | G4/2:5 E4:3 | C4:1 D4:2 | C4/1:1",
        lh: "r/1 | C3/1:5 | C3 | C3 | C3 | C3 | C3 | G3:1 | " +
          "C3:5 | C3 | C3 | F3:2 | C3:5 | C3 | G3:1 | C3:5"
      }
    }),
    song({
      id: "yorokobi", title: "よろこびの歌", origin: "ベートーヴェン「交響曲第9番」より", key: 1, time: [4, 4], bpm: 92, cat: "both", lesson: 14,
      desc: "ト長調(ファに♯)。右手はソの位置。左手のファ♯は、調号があるので記号なしで黒鍵を弾きます。",
      score: {
        rh: "B4/4:3 B4 C5:4 D5:5 | D5:5 C5:4 B4:3 A4:2 | G4:1 G4 A4:2 B4:3 | B4/4.:3 A4/8:2 A4/2 | " +
          "B4/4:3 B4 C5:4 D5:5 | D5:5 C5:4 B4:3 A4:2 | G4:1 G4 A4:2 B4:3 | A4/4.:2 G4/8:1 G4/2 | " +
          "A4/4:2 A4 B4:3 G4:1 | A4:2 B4/8:3 C5:4 B4/4:3 G4:1 | A4:2 B4/8:3 C5:4 B4/4:3 A4:2 | G4:1 A4:2 D4/2:1 | " +
          "B4/4:3 B4 C5:4 D5:5 | D5:5 C5:4 B4:3 A4:2 | G4:1 G4 A4:2 B4:3 | A4/4.:2 G4/8:1 G4/2",
        lh: "G3/1:2 | F#3:3 | G3:2 | G3/2:2 F#3:3 | G3/1:2 | F#3:3 | G3:2 | F#3/2:3 G3:2 | " +
          "F#3:3 G3:2 | F#3:3 G3:2 | F#3:3 G3:2 | G3:2 D3:5 | G3/1:2 | F#3:3 | G3:2 | F#3/2:3 G3:2"
      }
    }),
    song({
      id: "kaeru", title: "かえるのうた", origin: "ドイツの民謡", key: -1, time: [4, 4], bpm: 96, cat: "both", lesson: 14,
      desc: "ヘ長調(シに♭)。右手はファの位置。4の指のシ♭は黒鍵です。7小節目は八分音符。",
      score: {
        rh: "F4/4:1 G4:2 A4:3 Bb4:4 | A4:3 G4:2 F4/2:1 | A4/4:2 Bb4:3 C5:4 D5:5 | C5:4 Bb4:3 A4/2:2 | " +
          "F4/4:1 r F4 r | F4 r F4 r | F4/8:1 F4 G4:2 G4 A4:3 A4 Bb4:4 Bb4 | A4/4:3 G4:2 F4/2:1",
        lh: "F3/1:2 | F3 | F3 | C3/2:5 F3:2 | F3/1 | F3 | F3 | C3/2:5 F3:2"
      }
    }),
    song({
      id: "kirakira-chord", title: "きらきら星(和音つき)", origin: "フランスの民謡", key: 0, time: [4, 4], bpm: 80, cat: "chord", lesson: 15,
      desc: "左手は C・F・G7 の3つの和音。5〜6小節目は反復記号でくり返します。",
      score: {
        rh: "C4/4:1 C4 G4:4 G4 | A4:5 A4 G4/2:4 | F4/4:4 F4 E4:3 E4 | D4:2 D4 C4/2:1 | " +
          "|: G4/4:5 G4 F4:4 F4 | E4:3 E4 D4/2:2 :| " +
          "C4/4:1 C4 G4:4 G4 | A4:5 A4 G4/2:4 | F4/4:4 F4 E4:3 E4 | D4:2 D4 C4/2:1",
        lh: C_ + "/1:5+3+1 | " + F_ + "/2:5+2+1 " + C_ + ":5+3+1 | " + F_ + " " + C_ + " | " + G7 + ":5+2+1 " + C_ + " | " +
          "|: " + C_ + "/2 " + G7 + " | " + C_ + " " + G7 + " :| " +
          C_ + "/1 | " + F_ + "/2 " + C_ + " | " + F_ + " " + C_ + " | " + G7 + " " + C_
      }
    }),
    song({
      id: "jingle", title: "ジングルベル(サビ)", origin: "ピアポント作曲(アメリカ)", key: 0, time: [4, 4], bpm: 112, cat: "chord", lesson: 16,
      desc: "付点四分音符と八分音符が出てきます。左手は C・F・G7 の和音を全音符で。",
      score: {
        rh: "!mf E4/4:3 E4 E4/2 | E4/4 E4 E4/2 | E4/4:3 G4:5 C4/4.:1 D4/8:2 | E4/1:3 | " +
          "F4/4:4 F4 F4 F4 | F4 E4:3 E4 E4/8 E4 | E4/4 D4:2 D4 E4:3 | D4/2:2 G4:5 | " +
          "E4/4:3 E4 E4/2 | E4/4 E4 E4/2 | E4/4:3 G4:5 C4/4.:1 D4/8:2 | E4/1:3 | " +
          "!f F4/4:4 F4 F4 F4 | F4 E4:3 E4 E4/8 E4 | G4/4:5 G4 F4:4 D4:2 | C4/1:1",
        lh: C_ + "/1:5+3+1 | " + C_ + " | " + C_ + " | " + C_ + " | " + F_ + ":5+2+1 | " + C_ + ":5+3+1 | " + G7 + ":5+2+1 | " + G7 + " | " +
          C_ + ":5+3+1 | " + C_ + " | " + C_ + " | " + C_ + " | " + F_ + ":5+2+1 | " + C_ + ":5+3+1 | " + G7 + ":5+2+1 | " + C_ + ":5+3+1"
      }
    })
  ];
  var SONG_BY_ID = {};
  SONGS.forEach(function (s) { SONG_BY_ID[s.id] = s; });

  return {
    // 音
    audio: audio, now: now, play: play, click: click, Ticker: Ticker, stopAll: stopAll, silence: silence, prepare: prepare,
    // 音名
    noteName: noteName, pcName: pcName, doremi: doremi, noteJa: noteJa, isBlack: isBlack,
    spellName: spellName, spellJa: spellJa, keyName: keyName, timeName: timeName, HAND_JA: HAND_JA,
    // 鍵盤・楽譜・演奏
    keyboard: keyboard, score: score, player: player,
    parseScore: parseScore, checkScore: checkScore, scoreRange: scoreRange, kbRange: kbRange, playOrder: playOrder,
    PC_MAP: PC_MAP, midi: midi, svgEl: svgEl,
    // 曲集
    SONGS: SONGS, CATS: CATS, song: function (id) { return SONG_BY_ID[id] || null; }
  };
})();

// 韓国語入門道場: 9単元の定義・項目(ハングル・読み・意味・解説)・出題の組み立て。
// 道場(index.html)とハングル表・単語帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → (shared/review.js) → data.js
//
// ■ 読みの書き方
//   kana: カタカナの読み(発音どおり)。同じカタカナになる字は ( ) で口の形などを足して区別する。
//         例: ㅓ「オ(口を大きく開けて)」/ ㅗ「オ(唇を丸めて)」
//         ( ) を除いた部分が同じ項目は、同じ問題の選択肢に並べない(baseKana で比べる)。
//         単語・フレーズは、空白で区切った語ごとに語頭の形で書く(주세요 → チュセヨ)。
//   roma: 改訂ローマ字(文化観光部式)。鼻音化・連音化など、規則でローマ字に反映するものは反映する
//         (감사합니다 → gamsahamnida、한국어 → hangugeo)。濃音化は反映しない(학교 → hakgyo)。
//         発音の変化は note(解説)に書く。
//   パッチム単元の kana / roma は、パッチムの音を [ ] で囲む(表で .pc の印をつける)。出題では [ ] を外す。
//
// ■ 単元の中身の登録(このファイルの後半)
//   KOR.register("単元ID", { items: [項目, …], reps: [代表音, …] });
//   項目: { kind: "letter" | "word", ko, jamo?, kana, roma, ja?, note, sub?, group?, rep? }
//     letter = 字母1つ(ja はなし)、word = 語・フレーズ(ja が必要)
//     sub   = 単元の中の区分(数字の "sino" 漢数詞 / "native" 固有数詞)
//     group = 意味が近く、同じ問題の選択肢に並べないもの(お礼・おわび など)
//     rep   = パッチム単元の代表音のID
var KOR = (function () {
  "use strict";

  var STATS_KEY = "koreanBasicsStats";
  var SETTINGS_KEY = "koreanBasicsSettings";
  var COUNT = 10;
  // 出題の向き。"mix" はほかの向きをまぜる
  var MODES = ["ko2read", "read2ko", "ko2ja", "ja2ko", "audio", "mix"];
  var DIRS = ["ko2read", "read2ko", "ko2ja", "ja2ko", "audio"];
  var MODE_NAMES = {
    ko2read: "ハングル→読み", read2ko: "読み→ハングル", ko2ja: "韓国語→日本語",
    ja2ko: "日本語→韓国語", audio: "音声→ハングル", mix: "まぜる"
  };
  // ハングル単元では、意味の向きを読みの向きに置き換える
  var SUBSTITUTE = { ko2ja: "ko2read", ja2ko: "read2ko" };

  // ID は保存データ・復習プランナーのキーなので変えない
  var UNITS = [
    { id: "vowels", no: "01", name: "基本母音", short: "基本母音", ex: "ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ", hangul: true },
    { id: "consonants", no: "02", name: "基本子音", short: "基本子音", ex: "ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ", hangul: true },
    { id: "aspirated-tense", no: "03", name: "激音と濃音", short: "激音・濃音", ex: "ㅋ ㅌ ㅍ ㅊ · ㄲ ㄸ ㅃ", hangul: true },
    { id: "compound-vowels", no: "04", name: "合成母音", short: "合成母音", ex: "ㅐ ㅔ ㅘ ㅝ ㅢ", hangul: true },
    { id: "batchim", no: "05", name: "パッチム", short: "パッチム", ex: "책 산 옷 물 밤 밥 강", hangul: true },
    { id: "greetings", no: "06", name: "あいさつ", short: "あいさつ", ex: "안녕하세요", hangul: false },
    { id: "numbers", no: "07", name: "数字(漢数詞・固有数詞)", short: "数字", ex: "일 이 삼 · 하나 둘 셋", hangul: false },
    { id: "words", no: "08", name: "基本単語", short: "基本単語", ex: "사람 학교 오늘", hangul: false },
    { id: "phrases", no: "09", name: "基本フレーズ", short: "フレーズ", ex: "얼마예요?", hangul: false }
  ];

  var byId = {};
  UNITS.forEach(function (u, i) { u.index = i; byId[u.id] = u; });
  var content = {};
  var itemIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }
  function isHangulUnit(id) { var u = unit(id); return !!(u && u.hangul); }

  // [ ] の印を外す
  function plain(s) { return String(s == null ? "" : s).replace(/[\[\]]/g, ""); }
  // ( ) の補足と空白を除いたカタカナ。同じ問題に並べてよいかを比べるのに使う
  function baseKana(s) { return plain(s).replace(/[((][^))]*[))]/g, "").replace(/[\s・?!?!。、]/g, ""); }
  function baseRoma(s) { return plain(s).toLowerCase().replace(/[^a-z]/g, ""); }
  function baseKo(s) { return String(s || "").replace(/[\s?!.?!]/g, ""); }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("KOR.register: 登録できません: " + id);
      return;
    }
    var items = (Array.isArray(data.items) ? data.items : []).map(function (raw, i) {
      var it = {};
      for (var k in raw) if (raw.hasOwnProperty(k)) it[k] = raw[k];
      it.unitId = id;
      it.id = id + ":" + (it.jamo || it.ko);
      it.kanaMarked = String(raw.kana || "");
      it.romaMarked = String(raw.roma || "");
      it.kana = plain(raw.kana);
      it.roma = plain(raw.roma);
      it.say = raw.say || raw.ko;
      it.order = i;
      itemIndex[it.id] = it;
      return it;
    });
    content[id] = { items: items, reps: Array.isArray(data.reps) ? data.reps : [] };
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  function items(id) { var c = contentOf(id); return c ? c.items : []; }
  function item(id) { return itemIndex.hasOwnProperty(id) ? itemIndex[id] : null; }

  // ---------- 形の確認(検証スクリプトもこれを使う) ----------
  function checkItem(it) {
    var errs = [];
    if (!it.ko) errs.push("ko がない");
    if (!it.kana) errs.push("kana がない");
    if (!it.roma) errs.push("roma がない");
    if (!it.note) errs.push("note がない");
    if (it.kind !== "letter" && it.kind !== "word") errs.push("kind が letter / word でない");
    if (it.kind === "letter" && !it.jamo) errs.push("letter に jamo がない");
    if (it.kind === "word" && !it.ja) errs.push("word に ja がない");
    if (it.kana && !/^[ァ-ヶー\s()()、]+$/.test(it.kana.replace(/[((][^))]*[))]/g, ""))) errs.push("kana にカタカナ以外: " + it.kana);
    if (it.roma && !/^[a-z' ?!.,-]+$/.test(it.roma)) errs.push("roma の文字: " + it.roma);
    if (it.ko && !/^[가-힣ㄱ-ㆎ\s?!.,]+$/.test(it.ko)) errs.push("ko にハングル以外: " + it.ko);
    return errs;
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

  // 単元に合わせた向き(ハングル単元では、意味の向きを読みの向きにする)
  function effectiveDir(unitId, dir) {
    return isHangulUnit(unitId) && SUBSTITUTE.hasOwnProperty(dir) ? SUBSTITUTE[dir] : dir;
  }
  function needsJa(dir) { return dir === "ko2ja" || dir === "ja2ko"; }

  // 2つの項目を同じ問題に並べると紛らわしいか(表記・カタカナ・ローマ字・意味のどれかが重なる、または同じグループ)
  function clash(a, b, dir) {
    if (a === b) return true;
    if (baseKo(a.ko) === baseKo(b.ko)) return true;
    if (baseKana(a.kana) === baseKana(b.kana)) return true;
    if (baseRoma(a.roma) === baseRoma(b.roma)) return true;
    if (a.ja && b.ja && a.ja === b.ja) return true;
    if (a.group && b.group && a.group === b.group) return true;
    if (needsJa(dir) && (!a.ja || !b.ja)) return true;
    return false;
  }

  // 誤答を3つ選ぶ。同じ単元の同じ種類 → 同じ単元 → 近い単元 の順に、重ならないものを取る
  function pickDistractors(it, dir, n) {
    n = n || 3;
    var u = unit(it.unitId);
    var same = shuffle(items(it.unitId).filter(function (x) { return x !== it; }));
    var tiers = [
      same.filter(function (x) { return x.kind === it.kind && (x.sub || "") === (it.sub || ""); }),
      same.filter(function (x) { return !(x.kind === it.kind && (x.sub || "") === (it.sub || "")); })
    ];
    var others = UNITS.filter(function (v) { return v.id !== u.id; }).sort(function (a, b) {
      return Math.abs(a.index - u.index) - Math.abs(b.index - u.index) || a.index - b.index;
    });
    others.forEach(function (v) {
      var list = shuffle(items(v.id));
      tiers.push(list.filter(function (x) { return x.kind === it.kind; }));
      tiers.push(list.filter(function (x) { return x.kind !== it.kind; }));
    });
    var out = [];
    for (var t = 0; t < tiers.length && out.length < n; t++) {
      for (var i = 0; i < tiers[t].length && out.length < n; i++) {
        var c = tiers[t][i];
        if (clash(c, it, dir)) continue;
        if (out.some(function (o) { return clash(o, c, dir); })) continue;
        out.push(c);
      }
    }
    return out;
  }

  function prepare(it, dir) {
    var wrong = pickDistractors(it, dir, 3);
    var all = shuffle([it].concat(wrong));
    return {
      unitId: it.unitId,
      item: it,
      dir: dir,
      choices: all,
      answer: all.indexOf(it)
    };
  }

  // mode の向きで count 問を作る。hasVoice が false なら音声の向きは使わない
  // 選んだ単元から順番に1問ずつ取り、count 問になるまで続ける(項目が少ない単元は、ほかの単元で補う)
  function buildQuiz(unitIds, mode, count, hasVoice) {
    count = count || COUNT;
    var dirs = DIRS.filter(function (d) { return hasVoice || d !== "audio"; });
    if (mode !== "mix" && dirs.indexOf(mode) < 0) return [];
    var pools = shuffle(unitIds.filter(function (id) { return unit(id); })).map(function (id) {
      return { id: id, list: shuffle(items(id)) };
    }).filter(function (p) { return p.list.length > 0; });
    var out = [];
    while (out.length < count && pools.length > 0) {
      for (var i = 0; i < pools.length && out.length < count; i++) {
        var it = pools[i].list.shift();
        var d = mode === "mix" ? dirs[Math.floor(Math.random() * dirs.length)] : mode;
        var q = prepare(it, effectiveDir(it.unitId, d));
        if (q.choices.length === 4) out.push(q);
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
    var s = { mode: "ko2read", units: [] };
    if (MODES.indexOf(raw.mode) >= 0) s.mode = raw.mode;
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }

  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  // ---------- 反切表(子音14 × 基本母音10) ----------
  var CHART_CONS = [
    ["ㄱ", 0, "g"], ["ㄴ", 2, "n"], ["ㄷ", 3, "d"], ["ㄹ", 5, "r"], ["ㅁ", 6, "m"], ["ㅂ", 7, "b"], ["ㅅ", 9, "s"],
    ["ㅇ", 11, ""], ["ㅈ", 12, "j"], ["ㅊ", 14, "ch"], ["ㅋ", 15, "k"], ["ㅌ", 16, "t"], ["ㅍ", 17, "p"], ["ㅎ", 18, "h"]
  ];
  var CHART_VOWELS = [
    ["ㅏ", 0, "a"], ["ㅑ", 2, "ya"], ["ㅓ", 4, "eo"], ["ㅕ", 6, "yeo"], ["ㅗ", 8, "o"],
    ["ㅛ", 12, "yo"], ["ㅜ", 13, "u"], ["ㅠ", 17, "yu"], ["ㅡ", 18, "eu"], ["ㅣ", 20, "i"]
  ];
  function syllable(l, v, t) { return String.fromCharCode(0xAC00 + (l * 21 + v) * 28 + (t || 0)); }
  function chart() {
    return {
      cons: CHART_CONS.map(function (c) { return c[0]; }),
      vowels: CHART_VOWELS.map(function (v) { return v[0]; }),
      rows: CHART_CONS.map(function (c) {
        return CHART_VOWELS.map(function (v) { return { ko: syllable(c[1], v[1]), roma: c[2] + v[2] }; });
      })
    };
  }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, MODES: MODES, DIRS: DIRS, MODE_NAMES: MODE_NAMES,
    UNITS: UNITS, unit: unit, isHangulUnit: isHangulUnit, register: register, contentOf: contentOf, items: items, item: item,
    plain: plain, baseKana: baseKana, baseRoma: baseRoma, checkItem: checkItem, clash: clash,
    effectiveDir: effectiveDir, needsJa: needsJa, pickDistractors: pickDistractors, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak, chart: chart, syllable: syllable
  };
})();

// 短く書くための関数(data.js の中だけで使う)
//   L(字母, 例の音節, カタカナ, ローマ字, 解説)
//   W(ハングル, カタカナ, ローマ字, 意味, 解説, ほかの項目)
KOR.L = function (jamo, ko, kana, roma, note) {
  return { kind: "letter", jamo: jamo, ko: ko, kana: kana, roma: roma, note: note };
};
KOR.W = function (ko, kana, roma, ja, note, extra) {
  var it = { kind: "word", ko: ko, kana: kana, roma: roma, ja: ja, note: note };
  if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) it[k] = extra[k];
  return it;
};

// ============ 01 基本母音 ============
(function () {
  var L = KOR.L, W = KOR.W;
  KOR.register("vowels", {
    items: [
      L("ㅏ", "아", "ア", "a", "口を大きく開けて「ア」。日本語のアとほぼ同じです。母音だけの字は、音のない ㅇ を左につけて 아 と書きます。"),
      L("ㅑ", "야", "ヤ", "ya", "ㅏ に短い棒をもう1本足すと、ヤ行の音になります(ㅏ → ㅑ)。"),
      L("ㅓ", "어", "オ(口を大きく開けて)", "eo", "口を縦に大きく開けたまま「オ」。唇は丸めません。唇を丸める ㅗ と区別します。"),
      L("ㅕ", "여", "ヨ(口を大きく開けて)", "yeo", "ㅓ に棒を足した形。口を大きく開けた「ヨ」です。唇を丸める ㅛ と区別します。"),
      L("ㅗ", "오", "オ(唇を丸めて)", "o", "唇を丸く突き出して「オ」。日本語のオより唇をすぼめます。"),
      L("ㅛ", "요", "ヨ(唇を丸めて)", "yo", "ㅗ に棒を足した形。唇を丸めた「ヨ」です。"),
      L("ㅜ", "우", "ウ(唇を丸めて)", "u", "唇を丸く突き出して「ウ」。日本語のウより唇をすぼめます。"),
      L("ㅠ", "유", "ユ", "yu", "ㅜ に棒を足した形。唇を丸めた「ユ」です。"),
      L("ㅡ", "으", "ウ(唇を横に引いて)", "eu", "唇を横に引いたまま「ウ」。唇を丸める ㅜ と区別します。"),
      L("ㅣ", "이", "イ", "i", "日本語のイとほぼ同じです。"),
      W("아이", "アイ", "ai", "子ども", "ㅏ と ㅣ。母音の字を2つ並べただけの語です。"),
      W("오이", "オイ", "oi", "キュウリ", "唇を丸める ㅗ のあとに ㅣ。"),
      W("우유", "ウユ", "uyu", "牛乳", "ㅜ と ㅠ。どちらも唇を丸めて発音します。"),
      W("여우", "ヨウ", "yeou", "キツネ", "口を大きく開ける ㅕ のあとに、唇を丸める ㅜ。")
    ]
  });
})();

// ============ 02 基本子音 ============
(function () {
  var L = KOR.L, W = KOR.W;
  KOR.register("consonants", {
    items: [
      L("ㄱ", "가", "カ", "ga", "語頭ではカ、母音にはさまれるとガに近く濁ります(例: 고기 コギ)。ローマ字は母音の前で g と書きます。"),
      L("ㄴ", "나", "ナ", "na", "ナ行の音です。"),
      L("ㄷ", "다", "タ", "da", "語頭ではタ、語中ではダに近く濁ります(例: 바다 パダ)。"),
      L("ㄹ", "라", "ラ", "ra", "ラ行の音です。母音の前では r、パッチムでは l と書きます。"),
      L("ㅁ", "마", "マ", "ma", "マ行の音です。"),
      L("ㅂ", "바", "パ", "ba", "語頭ではパ、語中ではバに近く濁ります(例: 나비 ナビ)。"),
      L("ㅅ", "사", "サ", "sa", "サ行の音です。ㅣ と組むと 시(シ)になります。"),
      L("ㅇ", "아", "ア(ㅇは音なし)", "a", "はじめに置く ㅇ は音がなく、母音だけを読みます。パッチムの ㅇ は「ン(ng)」です。"),
      L("ㅈ", "자", "チャ", "ja", "語頭ではチャ、語中ではジャに近く濁ります(例: 모자 モジャ)。"),
      L("ㅎ", "하", "ハ", "ha", "ハ行の音です。語中では弱くなり、ほとんど聞こえないこともあります。"),
      W("나라", "ナラ", "nara", "国", "ㄴ と ㄹ。ㄹ は母音の間で軽い「ラ」です。"),
      W("바다", "パダ", "bada", "海", "語頭の ㅂ はパ、語中の ㄷ はダと濁ります。"),
      W("나비", "ナビ", "nabi", "チョウ", "語中の ㅂ はビと濁ります。"),
      W("모자", "モジャ", "moja", "帽子", "語中の ㅈ はジャと濁ります。"),
      W("하마", "ハマ", "hama", "カバ", "ㅎ と ㅁ。"),
      W("다리", "タリ", "dari", "脚・橋", "語頭の ㄷ はタ。同じ 다리 で「脚」と「橋」の両方を表します。"),
      W("고기", "コギ", "gogi", "肉", "語頭の ㄱ はコ、語中の ㄱ はギと濁ります。"),
      W("사자", "サジャ", "saja", "ライオン", "語中の ㅈ はジャと濁ります。")
    ]
  });
})();

// ============ 03 激音と濃音 ============
(function () {
  var L = KOR.L, W = KOR.W;
  KOR.register("aspirated-tense", {
    items: [
      L("ㅋ", "카", "カ(息を強く)", "ka", "ㄱ に線を足した激音。息を強く出して「カ」。語中でも濁りません。"),
      L("ㅌ", "타", "タ(息を強く)", "ta", "ㄷ に線を足した激音。息を強く出して「タ」。"),
      L("ㅍ", "파", "パ(息を強く)", "pa", "ㅂ の形を変えた激音。息を強く出して「パ」。"),
      L("ㅊ", "차", "チャ(息を強く)", "cha", "ㅈ に点を足した激音。息を強く出して「チャ」。"),
      L("ㄲ", "까", "ッカ", "kka", "ㄱ を2つ重ねた濃音。のどを詰めて、息をほとんど出さずに「ッカ」。"),
      L("ㄸ", "따", "ッタ", "tta", "ㄷ を2つ重ねた濃音。のどを詰めた「ッタ」。"),
      L("ㅃ", "빠", "ッパ", "ppa", "ㅂ を2つ重ねた濃音。のどを詰めた「ッパ」。"),
      L("ㅆ", "싸", "ッサ", "ssa", "ㅅ を2つ重ねた濃音。のどを詰めた「ッサ」。"),
      L("ㅉ", "짜", "ッチャ", "jja", "ㅈ を2つ重ねた濃音。のどを詰めた「ッチャ」。"),
      W("커피", "コピ", "keopi", "コーヒー", "激音 ㅋ と ㅍ。韓国語には f の音がないので「コピ」になります。"),
      W("아빠", "アッパ", "appa", "パパ・お父さん", "語中の濃音 ㅃ は「ッパ」と詰まります。"),
      W("토끼", "トッキ", "tokki", "ウサギ", "激音 ㅌ と濃音 ㄲ。"),
      W("기차", "キチャ", "gicha", "汽車", "激音 ㅊ は語中でも濁らず「チャ」のままです。"),
      W("코", "コ", "ko", "鼻", "激音 ㅋ。息を強く出します。")
    ]
  });
})();

// ============ 04 合成母音 ============
(function () {
  var L = KOR.L, W = KOR.W;
  KOR.register("compound-vowels", {
    items: [
      L("ㅐ", "애", "エ(口を大きめに)", "ae", "ㅏ + ㅣ。いまのソウルの発音では ㅔ とほとんど同じ「エ」です。"),
      L("ㅒ", "얘", "イェ(口を大きめに)", "yae", "ㅑ + ㅣ。ㅖ とほとんど同じ「イェ」です。"),
      L("ㅔ", "에", "エ", "e", "ㅓ + ㅣ。日本語のエに近い音です。"),
      L("ㅖ", "예", "イェ", "ye", "ㅕ + ㅣ。子音のあとでは「エ」に近くなります(例: 시계 シゲ)。"),
      L("ㅘ", "와", "ワ", "wa", "ㅗ + ㅏ。「オア」を一息で言うと「ワ」になります。"),
      L("ㅙ", "왜", "ウェ(口を大きめに)", "wae", "ㅗ + ㅐ。ㅚ・ㅞ とほとんど同じ「ウェ」です。"),
      L("ㅚ", "외", "ウェ(唇を丸めて)", "oe", "ㅗ + ㅣ。形は「オ+イ」ですが、発音は「ウェ」です。"),
      L("ㅞ", "웨", "ウェ", "we", "ㅜ + ㅔ。"),
      L("ㅝ", "워", "ウォ", "wo", "ㅜ + ㅓ。「ウオ」を一息で言います。"),
      L("ㅟ", "위", "ウィ", "wi", "ㅜ + ㅣ。唇を丸めて「ウィ」。"),
      L("ㅢ", "의", "ウイ", "ui", "ㅡ + ㅣ。唇を横に引いた「ウ」から「イ」へ一息に。子音のあとや語中では「イ」、助詞「〜の」では「エ」と読みます。"),
      W("개", "ケ", "gae", "犬", "ㄱ + ㅐ。"),
      W("사과", "サグァ", "sagwa", "りんご", "ㅘ。語中の ㄱ は濁って「グァ」。"),
      W("회사", "フェサ", "hoesa", "会社", "ㅚ は「ウェ」。ㅎ と組んで「フェ」。"),
      W("의자", "ウイジャ", "uija", "いす", "語頭の ㅢ は「ウイ」。"),
      W("돼지", "トェジ", "dwaeji", "ブタ", "ㅙ。돼 は「トェ」と読みます。"),
      W("뭐", "ムォ", "mwo", "何", "ㅝ。会話でよく使う「何?」です。"),
      W("귀", "クィ", "gwi", "耳", "ㅟ。"),
      W("시계", "シゲ", "sigye", "時計", "ㅖ は子音のあとで「エ」に近く、「シゲ」と聞こえます。ローマ字は ye のまま書きます。"),
      W("가게", "カゲ", "gage", "店", "ㅔ。語中の ㄱ は濁って「ゲ」。")
    ]
  });
})();

// ============ 05 パッチム ============
(function () {
  var W = KOR.W;
  function P(rep, ko, kana, roma, ja, note) { return W(ko, kana, roma, ja, note, { rep: rep }); }
  KOR.register("batchim", {
    reps: [
      { id: "k", sound: "k", kana: "ク", letters: "ㄱ ㅋ ㄲ", desc: "「ク」を言いかけて止める音。舌の奥を上あごにつけて止め、ウの音は出しません。" },
      { id: "n", sound: "n", kana: "ン", letters: "ㄴ", desc: "舌先を上の歯ぐきにつけた「ン」(「あんない」のン)。" },
      { id: "t", sound: "t", kana: "ッ", letters: "ㄷ ㅌ ㅅ ㅆ ㅈ ㅊ ㅎ", desc: "舌先を上の歯ぐきにつけて止める音。「ッ」のように詰まります。7つの字が同じ音になります。" },
      { id: "l", sound: "l", kana: "ル", letters: "ㄹ", desc: "舌先を上あごにつけたままの「ル」。ウの音は出しません。" },
      { id: "m", sound: "m", kana: "ム", letters: "ㅁ", desc: "唇を閉じた「ン」(「さんま」のン)。" },
      { id: "p", sound: "p", kana: "プ", letters: "ㅂ ㅍ", desc: "唇を閉じて止める音。「プ」を言いかけて止め、ウの音は出しません。" },
      { id: "ng", sound: "ng", kana: "ン", letters: "ㅇ", desc: "口を開けたまま、舌の奥で出す「ン」(「りんご」のン)。" },
      { id: "link", sound: "", kana: "", letters: "", title: "連音化", desc: "パッチムのあとに ㅇ で始まる字(母音)が続くと、パッチムが次の字に移って読まれます。ㄱ・ㄷ・ㅂ は移ると濁ります。" }
    ],
    items: [
      P("k", "책", "チェ[ク]", "chae[k]", "本", "パッチム ㄱ は [k]。「チェク」の「ク」は言いかけて止めます。"),
      P("k", "밖", "パ[ク]", "ba[k]", "外", "パッチム ㄲ も [k] と読みます。ローマ字も k と書きます。"),
      P("k", "부엌", "プオ[ク]", "bueo[k]", "台所", "パッチム ㅋ も [k]。"),
      P("n", "산", "サ[ン]", "sa[n]", "山", "パッチム ㄴ は舌先をつける「ン」。"),
      P("n", "눈", "ヌ[ン]", "nu[n]", "目・雪", "同じ 눈 で「目」と「雪」の両方を表します。"),
      P("n", "돈", "ト[ン]", "do[n]", "お金", "パッチム ㄴ。"),
      P("t", "옷", "オ[ッ]", "o[t]", "服", "パッチム ㅅ は [t] と読みます。ローマ字も t と書きます。"),
      P("t", "꽃", "コ[ッ]", "kko[t]", "花", "パッチム ㅊ も [t]。はじめの ㄲ は濃音です。"),
      P("t", "낮", "ナ[ッ]", "na[t]", "昼", "パッチム ㅈ も [t]。"),
      P("t", "밭", "パ[ッ]", "ba[t]", "畑", "パッチム ㅌ も [t]。"),
      P("t", "맛", "マ[ッ]", "ma[t]", "味", "パッチム ㅅ は [t]。맛있어요(おいしいです)の 맛 です。"),
      P("l", "물", "ム[ル]", "mu[l]", "水", "パッチム ㄹ は舌先をつけたままの「ル」。"),
      P("l", "달", "タ[ル]", "da[l]", "月", "パッチム ㄹ。"),
      P("l", "말", "マ[ル]", "ma[l]", "ことば・馬", "同じ 말 で「ことば」と「馬」の両方を表します。"),
      P("m", "밤", "パ[ム]", "ba[m]", "夜・栗", "パッチム ㅁ は唇を閉じた「ン」。"),
      P("m", "곰", "コ[ム]", "go[m]", "クマ", "パッチム ㅁ。"),
      P("m", "김치", "キ[ム]チ", "gi[m]chi", "キムチ", "김 のパッチム ㅁ。唇を閉じてから「チ」へ。"),
      P("p", "밥", "パ[プ]", "ba[p]", "ご飯", "パッチム ㅂ は唇を閉じて止める [p]。"),
      P("p", "집", "チ[プ]", "ji[p]", "家", "パッチム ㅂ。"),
      P("p", "앞", "ア[プ]", "a[p]", "前", "パッチム ㅍ も [p] と読みます。"),
      P("ng", "강", "カ[ン]", "ga[ng]", "川", "パッチム ㅇ は口を開けたままの「ン」。"),
      P("ng", "빵", "パ[ン]", "ppa[ng]", "パン", "パッチム ㅇ。はじめの ㅃ は濃音です。"),
      P("ng", "사랑", "サラ[ン]", "sara[ng]", "愛", "랑 のパッチム ㅇ。"),
      P("link", "한국어", "ハングゴ", "hangugeo", "韓国語", "국 のパッチム ㄱ が次の 어 に移り、濁って「グゴ」と読みます(連音化)。ローマ字も発音どおり hangugeo。"),
      P("link", "일본어", "イルボノ", "ilboneo", "日本語", "본 のパッチム ㄴ が 어 に移って「ボノ」(連音化)。"),
      P("link", "음악", "ウマク", "eumak", "音楽", "음 のパッチム ㅁ が 악 に移って「ウマク」(連音化)。"),
      P("link", "단어", "タノ", "daneo", "単語", "단 のパッチム ㄴ が 어 に移って「タノ」(連音化)。"),
      P("link", "직업", "チゴプ", "jigeop", "職業", "직 のパッチム ㄱ が 업 に移り、濁って「ゴプ」(連音化)。"),
      P("link", "발음", "パルム", "bareum", "発音", "발 のパッチム ㄹ が 음 に移って「パルム」(連音化)。ㄹ は母音の前なのでローマ字は r。"),
      P("link", "옷이", "オシ", "osi", "服が", "옷 だけなら「オッ」ですが、母音が続くと ㅅ がもとの [s] にもどって「オシ」。"),
      P("link", "꽃이", "コチ", "kkochi", "花が", "꽃 だけなら「コッ」ですが、母音が続くと ㅊ がもとの音にもどって「コチ」。")
    ]
  });
})();

// ============ 06 あいさつ ============
(function () {
  var W = KOR.W;
  KOR.register("greetings", {
    items: [
      W("안녕하세요", "アンニョンハセヨ", "annyeonghaseyo", "こんにちは", "朝・昼・夜いつでも使える、いちばん基本のあいさつ。「安寧(あんねい)ですか」という意味です。", { group: "hello" }),
      W("안녕하십니까", "アンニョンハシムニッカ", "annyeonghasimnikka", "こんにちは(かしこまった言い方)", "안녕하세요 のかしこまった形。仕事やニュースで使います。십 の ㅂ は ㄴ の前で [m] になり「シムニッカ」(鼻音化)。", { group: "hello" }),
      W("안녕히 가세요", "アンニョンヒ カセヨ", "annyeonghi gaseyo", "さようなら(去っていく人に)", "「安らかに行ってください」。その場から去っていく人に言います。"),
      W("안녕히 계세요", "アンニョンヒ ケセヨ", "annyeonghi gyeseyo", "さようなら(その場に残る人に)", "「安らかにいてください」。自分が去るとき、残る人に言います。계 の ㅖ は「エ」に近く「ケセヨ」。"),
      W("감사합니다", "カムサハムニダ", "gamsahamnida", "ありがとうございます", "합 の ㅂ は ㄴ の前で [m] になり「ハムニダ」(鼻音化)。ローマ字も発音どおり hamnida と書きます。", { group: "thanks" }),
      W("고맙습니다", "コマプスムニダ", "gomapseumnida", "ありがとうございます(固有語)", "감사합니다 と同じお礼。습니다 も鼻音化で「スムニダ」。", { group: "thanks" }),
      W("고마워요", "コマウォヨ", "gomawoyo", "ありがとう(打ち解けた丁寧語)", "고맙습니다 のやわらかい言い方。親しい人や同年代に使います。", { group: "thanks" }),
      W("죄송합니다", "チェソンハムニダ", "joesonghamnida", "申し訳ありません", "ていねいなおわび。目上の人や仕事の場で使います。", { group: "sorry" }),
      W("미안해요", "ミアネヨ", "mianhaeyo", "ごめんなさい", "やわらかいおわび。해 の ㅎ が弱くなり「ミアネヨ」と聞こえます。", { group: "sorry" }),
      W("괜찮아요", "ケンチャナヨ", "gwaenchanayo", "大丈夫です", "相手を気づかうときや、遠慮するときにも使います。찮 の ㅎ は発音せず「ケンチャナヨ」。"),
      W("처음 뵙겠습니다", "チョウム ペプケッスムニダ", "cheoeum boepgetseumnida", "はじめまして", "「初めてお目にかかります」という意味の、初対面のあいさつ。"),
      W("만나서 반갑습니다", "マンナソ パンガプスムニダ", "mannaseo bangapseumnida", "お会いできてうれしいです", "「会えてうれしいです」。はじめましてのあとによく続けます。"),
      W("잘 부탁드립니다", "チャル プタクトゥリムニダ", "jal butakdeurimnida", "よろしくお願いします", "自己紹介の最後に言います。립니다 は鼻音化で「リムニダ」。"),
      W("네", "ネ", "ne", "はい", "返事の「はい」。かしこまって 예(イェ)とも言います。"),
      W("아니요", "アニヨ", "aniyo", "いいえ", "ていねいな「いいえ」。"),
      W("잘 먹겠습니다", "チャル モクケッスムニダ", "jal meokgetseumnida", "いただきます", "食べ始めるときに。「よく食べます」という意味です。"),
      W("잘 먹었습니다", "チャル モゴッスムニダ", "jal meogeotseumnida", "ごちそうさまでした", "食べ終わったときに。「よく食べました」という意味。먹 の ㄱ が 었 に移って「モゴッ」(連音化)。"),
      W("안녕히 주무세요", "アンニョンヒ チュムセヨ", "annyeonghi jumuseyo", "おやすみなさい", "寝る前に目上の人へ。「安らかにお休みください」という意味です。"),
      W("수고하셨습니다", "スゴハショッスムニダ", "sugohasyeotseumnida", "お疲れさまでした", "仕事を終えた人をねぎらうことば。"),
      W("축하합니다", "チュカハムニダ", "chukhahamnida", "おめでとうございます", "축 の ㄱ と 하 の ㅎ が合わさって激音になり「チュカ」と聞こえます。ローマ字は、名詞の中の ㄱ+ㅎ は k と h を分けて書く決まりなので chukha です。"),
      W("어서 오세요", "オソ オセヨ", "eoseo oseyo", "いらっしゃいませ", "お店で客を迎えるときの決まり文句。"),
      W("실례합니다", "シルレハムニダ", "sillyehamnida", "失礼します", "ㄹ が2つ続いて「シルレ」。人に声をかけるときや、部屋に入るときに使います。")
    ]
  });
})();

// ============ 07 数字 ============
(function () {
  var W = KOR.W;
  function S(ko, kana, roma, ja, note) { return W(ko, kana, roma, ja, note, { sub: "sino" }); }
  function N(ko, kana, roma, ja, note) { return W(ko, kana, roma, ja, note, { sub: "native" }); }
  KOR.register("numbers", {
    items: [
      S("일", "イル", "il", "1(いち)", "漢数詞の1。日付・値段・電話番号・「〜分」などに使います。"),
      S("이", "イ", "i", "2(に)", "漢数詞の2。"),
      S("삼", "サム", "sam", "3(さん)", "漢数詞の3。パッチム ㅁ で唇を閉じます。"),
      S("사", "サ", "sa", "4(よん)", "漢数詞の4。"),
      S("오", "オ", "o", "5(ご)", "漢数詞の5。唇を丸めて「オ」。"),
      S("육", "ユク", "yuk", "6(ろく)", "漢数詞の6。"),
      S("칠", "チル", "chil", "7(なな)", "漢数詞の7。"),
      S("팔", "パル", "pal", "8(はち)", "漢数詞の8。激音 ㅍ で息を強く出します。"),
      S("구", "ク", "gu", "9(きゅう)", "漢数詞の9。"),
      S("십", "シプ", "sip", "10(じゅう)", "漢数詞の10。11 は 십일(シビル)のように、십 のあとに並べます。"),
      S("백", "ペク", "baek", "100(ひゃく)", "漢数詞の100。"),
      S("천", "チョン", "cheon", "1000(せん)", "漢数詞の1000。"),
      S("만", "マン", "man", "1万(まん)", "漢数詞の1万。日本語と同じく、4けたごとに区切って数えます。"),
      N("하나", "ハナ", "hana", "1つ(ひとつ)", "固有数詞の1。物の数・年齢・時刻の「〜時」に使います。単位の前では 한(ハン)になります(한 개 ひとつ)。"),
      N("둘", "トゥル", "dul", "2つ(ふたつ)", "固有数詞の2。単位の前では 두(トゥ)になります。"),
      N("셋", "セッ", "set", "3つ(みっつ)", "固有数詞の3。単位の前では 세(セ)になります。"),
      N("넷", "ネッ", "net", "4つ(よっつ)", "固有数詞の4。単位の前では 네(ネ)になります。"),
      N("다섯", "タソッ", "daseot", "5つ(いつつ)", "固有数詞の5。パッチム ㅅ は [t] で「ッ」。"),
      N("여섯", "ヨソッ", "yeoseot", "6つ(むっつ)", "固有数詞の6。"),
      N("일곱", "イルゴプ", "ilgop", "7つ(ななつ)", "固有数詞の7。"),
      N("여덟", "ヨドル", "yeodeol", "8つ(やっつ)", "固有数詞の8。パッチム ㄼ は ㄹ だけを読んで「ヨドル」。"),
      N("아홉", "アホプ", "ahop", "9つ(ここのつ)", "固有数詞の9。"),
      N("열", "ヨル", "yeol", "10(とお)", "固有数詞の10。固有数詞は 99 まであります(20 は 스물)。")
    ]
  });
})();

// ============ 08 基本単語 ============
(function () {
  var W = KOR.W;
  KOR.register("words", {
    items: [
      W("사람", "サラム", "saram", "人", "「人」。일본 사람 で「日本人」になります。"),
      W("친구", "チング", "chingu", "友だち", "語中の ㄱ は濁って「グ」。"),
      W("학교", "ハッキョ", "hakgyo", "学校", "학 のあとの ㄱ は濃音になり「ハッキョ」と聞こえます(濃音化)。ローマ字は濃音化を書かず hakgyo。"),
      W("학생", "ハクセン", "haksaeng", "学生", "생 は濃音化して「ッセン」に近く聞こえます。"),
      W("선생님", "ソンセンニム", "seonsaengnim", "先生", "-님 は「〜様」にあたる敬称。先生は 선생님 と呼びます。"),
      W("엄마", "オンマ", "eomma", "ママ・お母さん", "くだけた呼び方です。かしこまると 어머니(オモニ)。"),
      W("아버지", "アボジ", "abeoji", "父・お父さん", "くだけた呼び方は 아빠(アッパ)。"),
      W("가족", "カジョク", "gajok", "家族", "漢字語「家族」。日本語と音が似ています。"),
      W("오늘", "オヌル", "oneul", "今日", "「今日」。"),
      W("내일", "ネイル", "naeil", "明日", "漢字語「来日」で、明日のことです。"),
      W("어제", "オジェ", "eoje", "昨日", "「昨日」。語中の ㅈ は濁って「ジェ」。"),
      W("시간", "シガン", "sigan", "時間", "漢字語「時間」。日本語と音が似ています。"),
      W("음식", "ウムシク", "eumsik", "食べ物・料理", "漢字語「飲食」で、食べ物・料理のことです。"),
      W("화장실", "ファジャンシル", "hwajangsil", "トイレ", "漢字語「化粧室」。トイレのことです。"),
      W("병원", "ピョンウォン", "byeongwon", "病院", "漢字語「病院」。"),
      W("은행", "ウネン", "eunhaeng", "銀行", "漢字語「銀行」。행 の ㅎ が弱くなり「ウネン」と聞こえます。"),
      W("역", "ヨク", "yeok", "駅", "漢字語「駅」。서울역 で「ソウル駅」。"),
      W("가방", "カバン", "gabang", "かばん", "語中の ㅂ は濁って「バ」。"),
      W("전화", "チョヌァ", "jeonhwa", "電話", "漢字語「電話」。화 の ㅎ が弱くなり「チョヌァ」と聞こえます。"),
      W("휴대폰", "ヒュデポン", "hyudaepon", "携帯電話", "「携帯」+ phone。スマホのことも言います。"),
      W("날씨", "ナルッシ", "nalssi", "天気", "씨 は濃音で「ッシ」。"),
      W("한국", "ハングク", "hanguk", "韓国", "漢字語「韓国」。語中の ㄱ は濁って「グク」。"),
      W("일본", "イルボン", "ilbon", "日本", "漢字語「日本」。"),
      W("여기", "ヨギ", "yeogi", "ここ", "「ここ」。저기(あそこ)・거기(そこ)と組で覚えます。"),
      W("저기", "チョギ", "jeogi", "あそこ", "「あそこ」。人に呼びかける「あの…」の意味でも使います。")
    ]
  });
})();

// ============ 09 基本フレーズ ============
(function () {
  var W = KOR.W;
  KOR.register("phrases", {
    items: [
      W("이게 뭐예요?", "イゲ ムォエヨ", "ige mwoyeyo?", "これは何ですか?", "이게 は 이것이(これが)の縮まった形。예요 は「エヨ」と発音します。"),
      W("얼마예요?", "オルマエヨ", "eolmayeyo?", "いくらですか?", "買い物でいちばんよく使う質問です。"),
      W("화장실이 어디예요?", "ファジャンシリ オディエヨ", "hwajangsiri eodiyeyo?", "トイレはどこですか?", "실 のパッチム ㄹ が 이 に移って「シリ」(連音化)。〇〇이/가 어디예요? で場所を聞けます。"),
      W("이거 주세요", "イゴ チュセヨ", "igeo juseyo", "これをください", "指さしながら注文するときに。주세요 は「ください」。"),
      W("물 좀 주세요", "ムル チョム チュセヨ", "mul jom juseyo", "お水をください", "좀 は「ちょっと」で、頼みごとをやわらげます。"),
      W("맛있어요", "マシッソヨ", "masisseoyo", "おいしいです", "맛 のパッチム ㅅ が 있 に移って「マシッソヨ」(連音化)。"),
      W("좋아요", "チョアヨ", "joayo", "いいです・好きです", "좋 の ㅎ は母音の前で発音せず「チョアヨ」。"),
      W("몰라요", "モルラヨ", "mollayo", "知りません・わかりません", "ㄹ が2つ続いて「モルラ」。"),
      W("알겠습니다", "アルゲッスムニダ", "algetseumnida", "わかりました", "「承知しました」の意味。습니다 は鼻音化で「スムニダ」。"),
      W("다시 한번 말해 주세요", "タシ ハンボン マレ チュセヨ", "dasi hanbeon malhae juseyo", "もう一度言ってください", "말해 の ㅎ が弱くなり「マレ」と聞こえます。"),
      W("천천히 말해 주세요", "チョンチョニ マレ チュセヨ", "cheoncheonhi malhae juseyo", "ゆっくり話してください", "천천히 の 히 は ㅎ が弱くなり「チョンチョニ」。"),
      W("한국어를 잘 못해요", "ハングゴルル チャル モッテヨ", "hangugeoreul jal motaeyo", "韓国語はあまりできません", "못해요 は ㅅ(発音は [t])と ㅎ が合わさって「モッテヨ」。ローマ字も発音どおり motaeyo。"),
      W("저는 일본 사람이에요", "チョヌン イルボン サラミエヨ", "jeoneun ilbon saramieyo", "私は日本人です", "저는 は「私は」。사람이에요 は連音化して「サラミエヨ」。"),
      W("이름이 뭐예요?", "イルミ ムォエヨ", "ireumi mwoyeyo?", "名前は何ですか?", "름 のパッチム ㅁ が 이 に移って「イルミ」(連音化)。"),
      W("어디에서 왔어요?", "オディエソ ワッソヨ", "eodieseo wasseoyo?", "どこから来ましたか?", "어디에서 は「どこから」。"),
      W("지금 몇 시예요?", "チグム ミョッ シエヨ", "jigeum myeot siyeyo?", "今何時ですか?", "몇 시 は「何時」。時刻の「〜時」には固有数詞を使います(한 시 1時)。"),
      W("카드 돼요?", "カドゥ トェヨ", "kadeu dwaeyo?", "カードは使えますか?", "돼요 は「できます・大丈夫です」。お店で支払いの前に聞きます。"),
      W("배고파요", "ペゴパヨ", "baegopayo", "おなかがすきました", "배 は「おなか」。"),
      W("피곤해요", "ピゴネヨ", "pigonhaeyo", "疲れました", "해 の ㅎ が弱くなり「ピゴネヨ」と聞こえます。"),
      W("재미있어요", "チェミイッソヨ", "jaemiisseoyo", "おもしろいです", "「楽しい・おもしろい」。"),
      W("사랑해요", "サランヘヨ", "saranghaeyo", "愛しています", "사랑(愛)+ 해요(します)。"),
      W("도와주세요", "トワジュセヨ", "dowajuseyo", "助けてください", "「手伝ってください」の意味でも使います。"),
      W("여기요", "ヨギヨ", "yeogiyo", "すみません(店員を呼ぶとき)", "お店で店員を呼ぶときの「すみません」。저기요 とも言います。"),
      W("비싸요", "ピッサヨ", "bissayo", "(値段が)高いです", "싸 は濃音で「ッサ」。싸요(ッサヨ)は「安いです」。")
    ]
  });
})();

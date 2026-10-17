// 正規表現道場: 8単元の定義・問題・記法帳の中身・正規表現の部品。道場(index.html)と記法帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → data.js
// 正規表現は JavaScript の RegExp(Chrome で動くもの)を前提とする。
//
// ■ 単元の中身の登録(このファイルの後半)
//   RGX.register("単元ID", { cards: [カード, …], questions: [問題, …] });
//
// ■ 記法帳のカード
//   {
//     id: "dot",                      // reference.html の id="card-dot" になる。問題の ref からも使う
//     name: ".",                      // カードの見出し(等幅)
//     read: "任意の1文字",             // 短い説明(.tag)
//     desc: "意味の説明",              // `…` で囲んだところは <code> になる
//     examples: [["コード", "説明"], …], // 「例」。コードの行と // 説明 の行で出る。
//                                     //   説明が「→ 値」で始まるときは、コードを実行した結果(formatValue)と同じであること(検算する)
//     options: [["書き方", "説明"], …], // 省略可。「書き方」
//     notes: ["注意", …]               // 省略可。「注意」
//   }
//
// ■ 問題
//   {
//     id: "l01",                      // 単元の中で重ならない名前
//     q: "問題文",                     // `…` で囲んだところは <code> になる
//     code: "/a.c/",                  // 省略可。問題のコード(暗い表示)。____ は空欄
//     kind: "str",                    // 選択肢の種類。"str" = 文字列 / "regex" = 正規表現リテラル / "code" = 語句・値(等幅) / "text" = 説明文
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。並びはページが毎回まぜる
//     pick: "noMatch",                // 省略可。kind "str" で「マッチしないのは?」のとき
//     tests: {                        // 省略可。正規表現が満たす条件。kind "regex" では必須
//       match: ["…"],                 //   マッチする(test が true)
//       noMatch: ["…"],               //   マッチしない
//       first: [["対象", "最初のマッチ"]] //   exec(対象)[0] がこれになる(null ならマッチしない)
//     },
//     run: true,                      // 省略可。code を JavaScript として実行した結果が正解(検算スクリプトが確かめる。ページでは実行しない)
//     expect: '"…"',                  // run で code に空欄があるとき、先頭の選択肢を入れて実行した結果(formatValue の形)
//     accepts: ["別解", …],            // 穴埋め入力で正解にする別の書き方(tests がないときだけ使う)
//     noInput: true,                  // 省略可。穴埋めの形でも入力モードで出さない
//     explain: "解説",                 // `…` で囲んだところは <code> になる
//     ref: "dot"                      // 記法帳のカードの id
//   }
//   穴埋め入力モードで出すのは、code に ____ があり、kind が "code" で、noInput がない問題だけ。
//   tests がある穴埋めは、code が正規表現リテラル(/…/フラグ)で、入力を空欄に入れて実際に動かして判定する。
//   tests がない穴埋めは、正規化した文字列が choices[0] か accepts と同じなら正解。
//
// ■ 自動で確かめること(checkQuestion。形がおかしい問題は出題しない)
//   kind "str"   : code の正規表現に、先頭の選択肢だけがマッチする(pick: "noMatch" なら先頭だけがマッチしない)
//   kind "regex" : 先頭の選択肢だけが tests をすべて満たす
//   tests つきの穴埋め: 先頭の選択肢を入れると tests を満たし、ほかの選択肢では満たさない
//
// ■ 入力の判定(normalize)
//   大文字小文字は区別する(正規表現では意味が変わるため)。前後の空白を削る。
//   全角の英数字・記号は半角に、¥ ￥ は \ にそろえる(日本語キーボードの ¥ キー対策)。
var RGX = (function () {
  "use strict";

  var STATS_KEY = "regexBasicsStats";
  var SETTINGS_KEY = "regexBasicsSettings";
  var COUNT = 10;
  var MODES = ["choice", "input"];
  var KINDS = ["str", "regex", "code", "text"];
  var BLANK = "____";

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "literal", no: "01", name: "文字とエスケープ", short: "文字", keys: "abc · . · \\. · メタ文字" },
    { id: "class", no: "02", name: "文字クラス", short: "クラス", keys: "[abc] · [a-z] · [^…] · \\d \\w \\s" },
    { id: "quant", no: "03", name: "くり返し", short: "くり返し", keys: "* · + · ? · {n} · {n,m}" },
    { id: "anchor", no: "04", name: "位置の指定", short: "位置", keys: "^ · $ · \\b · m フラグ" },
    { id: "group", no: "05", name: "グループと選択", short: "グループ", keys: "( ) · | · (?: )" },
    { id: "greedy", no: "06", name: "欲張りと控えめ", short: "欲張り", keys: ".* · .*? · +? · [^…]*" },
    { id: "capture", no: "07", name: "キャプチャと置換", short: "キャプチャ", keys: "$1 · \\1 · (?<name>) · replace" },
    { id: "lookaround", no: "08", name: "先読み・後読みとフラグ", short: "先読み", keys: "(?=) · (?!) · (?<=) · g i m s u" }
  ];

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("RGX.register: 登録できません: " + id);
      return;
    }
    var c = {
      cards: Array.isArray(data.cards) ? data.cards : [],
      questions: Array.isArray(data.questions) ? data.questions : []
    };
    c.cards.forEach(function (card) { if (card && card.id) cardIndex[card.id] = { card: card, unitId: id }; });
    content[id] = c;
  }
  function contentOf(id) { return content.hasOwnProperty(id) ? content[id] : null; }
  function card(id) { return cardIndex.hasOwnProperty(id) ? cardIndex[id].card : null; }

  // ---------- 正規表現リテラル ----------
  // "/パターン/フラグ" を読む。{ re, source, flags } か、読めなければ { error: "理由" } を返す。
  // JavaScript のリテラルと同じく、[ ] の外の / は \/ と書かないと読めないことにする
  function parseLiteral(s) {
    s = String(s == null ? "" : s);
    var m = /^\/([\s\S]+)\/([A-Za-z]*)$/.exec(s);
    if (!m) return { error: "/パターン/フラグ の形になっていません" };
    var src = m[1], inClass = false;
    for (var i = 0; i < src.length; i++) {
      var ch = src.charAt(i);
      if (ch === "\\") { i++; continue; }
      if (ch === "\n" || ch === "\r") return { error: "改行は入れられません" };
      if (inClass) { if (ch === "]") inClass = false; continue; }
      if (ch === "[") inClass = true;
      else if (ch === "/") return { error: "リテラルの中の / は \\/ と書きます" };
    }
    try {
      return { re: new RegExp(src, m[2]), source: src, flags: m[2] };
    } catch (e) {
      return { error: e && e.message ? String(e.message) : "正規表現として読めません" };
    }
  }

  // サロゲートペア(絵文字など)の途中で止まらないように、次の位置を決める
  function advance(text, i, unicode) {
    if (unicode && i < text.length - 1) {
      var c = text.charCodeAt(i);
      if (c >= 0xD800 && c <= 0xDBFF) {
        var d = text.charCodeAt(i + 1);
        if (d >= 0xDC00 && d <= 0xDFFF) return i + 2;
      }
    }
    return i + 1;
  }
  // re が text のどこにマッチするか。g フラグがなければ最初の1つだけ(replace・match と同じ)。
  // [{ index, end, text, groups: [グループ1, …], named: { 名前: 値 } | null }, …]
  function findMatches(re, text, max) {
    max = max || 500;
    text = String(text);
    var flags = re.flags, global = flags.indexOf("g") >= 0;
    var r = new RegExp(re.source, global ? flags : flags + "g");
    var unicode = flags.indexOf("u") >= 0 || flags.indexOf("v") >= 0;
    var out = [], m;
    while (out.length < max && (m = r.exec(text)) !== null) {
      var named = null;
      if (m.groups) {
        named = {};
        Object.keys(m.groups).forEach(function (k) { named[k] = m.groups[k]; });
      }
      out.push({ index: m.index, end: m.index + m[0].length, text: m[0], groups: Array.prototype.slice.call(m, 1), named: named });
      if (!global) break;
      if (m[0] === "") r.lastIndex = advance(text, r.lastIndex, unicode);
    }
    return out;
  }

  // tests を満たすか。満たさなかったものの一覧を返す(空なら合格)
  //   { type: "match" | "noMatch" | "first", s: 対象, want, got }
  function runTests(tests, re) {
    var r = new RegExp(re.source, re.flags.replace(/[gy]/g, ""));
    var fails = [];
    (tests.match || []).forEach(function (s) { if (!r.test(s)) fails.push({ type: "match", s: s }); });
    (tests.noMatch || []).forEach(function (s) { if (r.test(s)) fails.push({ type: "noMatch", s: s }); });
    (tests.first || []).forEach(function (p) {
      var m = r.exec(p[0]), got = m ? m[0] : null;
      if (got !== p[1]) fails.push({ type: "first", s: p[0], want: p[1], got: got });
    });
    return fails;
  }

  // ---------- 値の書き方(実行結果の選択肢と同じ形) ----------
  // 文字列は "…"、配列は ["a", "b"]、null・true・数はそのまま
  function formatValue(v) {
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    if (Array.isArray(v)) return "[" + Array.prototype.map.call(v, formatValue).join(", ") + "]";
    if (typeof v === "string") return JSON.stringify(v);
    return String(v);
  }

  // ---------- 入力の判定 ----------
  function normalize(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/[¥￥]/g, "\\");
    s = s.replace(/[！-～]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); });
    s = s.replace(/　/g, " ");
    return s.trim();
  }
  function kindOf(q) { return KINDS.indexOf(q.kind) >= 0 ? q.kind : "code"; }
  function hasBlank(q) { return typeof q.code === "string" && q.code.indexOf(BLANK) >= 0; }
  function isInputable(q) { return kindOf(q) === "code" && hasBlank(q) && !q.noInput; }
  function answersOf(q) {
    var list = [q.choices[0]].concat(Array.isArray(q.accepts) ? q.accepts : []);
    return list.map(normalize);
  }
  // 空欄に答えを入れたコード
  function fillBlank(code, answer) { return String(code).split(BLANK).join(answer); }

  // 入力を判定する。{ ok, error: 読めなかった理由 | null, fails: [満たさなかった条件], re: 動かした正規表現 | null }
  function judge(q, typed) {
    var t = normalize(typed);
    var res = { ok: false, error: null, fails: [], re: null };
    if (!t) return res;
    if (q.tests) {
      var p = parseLiteral(fillBlank(q.code, t));
      if (p.error) { res.error = p.error; return res; }
      res.re = p.re;
      res.fails = runTests(q.tests, p.re);
      res.ok = res.fails.length === 0;
      return res;
    }
    res.ok = answersOf(q).indexOf(t) >= 0;
    return res;
  }
  function isMatch(q, typed) { return judge(q, typed).ok; }

  // 問題が扱う正規表現(4択の選択肢、または空欄に答えを入れたもの)。読めなければ null
  function regexOf(q, answer) {
    var s = kindOf(q) === "regex" ? answer : hasBlank(q) ? fillBlank(q.code, answer) : q.code;
    var p = parseLiteral(s);
    return p.error ? null : p.re;
  }

  // ---------- 色分け用の字句分け(画面の部品は各ページで作る) ----------
  // [{ t: "esc" | "cls" | "grp" | "qnt" | "kw" | "dl" | "str" | "fn" | "num" | "cm" | "blank" | "", s: "文字" }, …]
  //   esc = \d などのエスケープ / cls = [ ] の中 / grp = ( ) / qnt = くり返し / kw = ^ $ | . / dl = リテラルの / とフラグ
  function pushTok(out, t, s) {
    var last = out[out.length - 1];
    if (last && last.t === t && (t === "" || t === "cls")) last.s += s; else out.push({ t: t, s: s });
  }
  // パターンの中身(/ と / の間)を分ける
  function tokenizeRegex(src, out) {
    out = out || [];
    src = String(src);
    var i = 0, n = src.length, inClass = false, m;
    while (i < n) {
      if (src.substr(i, BLANK.length) === BLANK) { pushTok(out, "blank", BLANK); i += BLANK.length; continue; }
      var ch = src.charAt(i), rest = src.slice(i);
      if (ch === "\\") {
        m = /^\\(?:u\{[0-9A-Fa-f]+\}|u[0-9A-Fa-f]{4}|x[0-9A-Fa-f]{2}|k<[^>]*>|[pP]\{[^}]*\}|c[A-Za-z]|[\s\S])?/.exec(rest);
        pushTok(out, inClass ? "cls" : "esc", m[0]);
        i += m[0].length;
      } else if (inClass) {
        pushTok(out, "cls", ch);
        if (ch === "]") inClass = false;
        i++;
      } else if (ch === "[") {
        m = /^\[\^?\]?/.exec(rest);   // [] と [^] の直後の ] は閉じかっこではない(JavaScript の決まり)
        pushTok(out, "cls", m[0] === "[]" || m[0] === "[^]" ? m[0].slice(0, -1) : m[0]);
        i += m[0] === "[]" || m[0] === "[^]" ? m[0].length - 1 : m[0].length;
        inClass = true;
      } else if (ch === "(") {
        m = /^\((?:\?(?::|=|!|<=|<!|<[A-Za-z_$][\w$]*>))?/.exec(rest);
        pushTok(out, "grp", m[0]);
        i += m[0].length;
      } else if (ch === ")") {
        pushTok(out, "grp", ch);
        i++;
      } else if ((m = /^(?:[*+?]|\{\d+(?:,\d*)?\})\??/.exec(rest)) !== null) {
        pushTok(out, "qnt", m[0]);
        i += m[0].length;
      } else if ("^$|.".indexOf(ch) >= 0) {
        pushTok(out, "kw", ch);
        i++;
      } else {
        pushTok(out, "", ch);
        i++;
      }
    }
    return out;
  }
  var FUNCS = "test exec match matchAll replace replaceAll search split groups length index lastIndex map RegExp".split(" ");
  var fnSet = {};
  FUNCS.forEach(function (k) { fnSet[k] = true; });
  // コード(1行または数行)を分ける。/ で始まるところは正規表現リテラルとして読む(このページのコードに割り算は出てこない)
  function tokenize(code) {
    var out = [];
    code = String(code);
    var i = 0, n = code.length, m;
    while (i < n) {
      var ch = code.charAt(i), rest = code.slice(i);
      if (code.substr(i, BLANK.length) === BLANK) { pushTok(out, "blank", BLANK); i += BLANK.length; continue; }
      if (ch === "\"" || ch === "'") {
        // 文字列。空欄があれば分けて出す
        var j = i + 1;
        while (j < n && code.charAt(j) !== ch && code.charAt(j) !== "\n") j += code.charAt(j) === "\\" ? 2 : 1;
        var lit = code.slice(i, Math.min(j + 1, n));
        lit.split(BLANK).forEach(function (part, k) {
          if (k > 0) pushTok(out, "blank", BLANK);
          if (part) pushTok(out, "str", part);
        });
        i += lit.length;
      } else if (rest.substr(0, 2) === "//") {
        m = /^\/\/[^\n]*/.exec(rest);
        pushTok(out, "cm", m[0]);
        i += m[0].length;
      } else if (ch === "/") {
        // 正規表現リテラルの終わりを探す
        var k2 = i + 1, inClass = false;
        while (k2 < n) {
          if (code.substr(k2, BLANK.length) === BLANK) { k2 += BLANK.length; continue; }
          var c2 = code.charAt(k2);
          if (c2 === "\n") break;
          if (c2 === "\\") { k2 += 2; continue; }
          if (inClass) { if (c2 === "]") inClass = false; }
          else if (c2 === "[") inClass = true;
          else if (c2 === "/") break;
          k2++;
        }
        pushTok(out, "dl", "/");
        tokenizeRegex(code.slice(i + 1, Math.min(k2, n)), out);
        i = Math.min(k2, n);
        if (code.charAt(i) === "/") {
          pushTok(out, "dl", "/");
          i++;
          m = /^(?:[A-Za-z]|____)*/.exec(code.slice(i));
          m[0].split(BLANK).forEach(function (part, k) {
            if (k > 0) pushTok(out, "blank", BLANK);
            if (part) pushTok(out, "dl", part);
          });
          i += m[0].length;
        }
      } else if ((m = /^\d+/.exec(rest)) !== null) {
        pushTok(out, "num", m[0]);
        i += m[0].length;
      } else if ((m = /^[A-Za-z_$][\w$]*/.exec(rest)) !== null) {
        pushTok(out, fnSet[m[0]] ? "fn" : "", m[0]);
        i += m[0].length;
      } else {
        pushTok(out, "", ch);
        i++;
      }
    }
    return out;
  }

  // コードから「どの正規表現を、どの文字列に当てているか」を読み取る(マッチの色分け用。実行はしない)。
  //   "文字列".replace(/…/g, …) / "文字列".match(/…/) / /…/.test("文字列") などの形。読めなければ null
  var STR_SRC = "(\"(?:[^\"\\\\\\n]|\\\\.)*\")";
  var RE_SRC = "(\\/(?:[^\\/\\\\\\[\\n]|\\\\.|\\[(?:[^\\]\\\\\\n]|\\\\.)*\\])+\\/[A-Za-z]*)";
  var HL_A = new RegExp("^" + STR_SRC + "\\.(?:replace|replaceAll|match|matchAll|search|split)\\(" + RE_SRC + "[,)]");
  var HL_B = new RegExp("^" + RE_SRC + "\\.(?:test|exec)\\(" + STR_SRC + "\\)");
  function deriveTarget(code) {
    code = String(code || "");
    var m = HL_A.exec(code), text, lit;
    if (m) { text = m[1]; lit = m[2]; }
    else if ((m = HL_B.exec(code)) !== null) { lit = m[1]; text = m[2]; }
    else return null;
    var p = parseLiteral(lit);
    if (p.error) return null;
    try { text = JSON.parse(text); } catch (e) { return null; }
    return { re: p.re, text: text };
  }

  // ---------- 問題の形を確かめる。問題点の一覧を返す(なければ空の配列)。検算スクリプトもこれを使う ----------
  function isStrArr(a) { return Array.isArray(a) && a.every(function (s) { return typeof s === "string"; }); }
  function checkTests(t) {
    if (!t || typeof t !== "object") return ["tests がオブジェクトではない"];
    var errs = [];
    ["match", "noMatch"].forEach(function (k) { if (t[k] !== undefined && !isStrArr(t[k])) errs.push("tests." + k + " が文字列の配列ではない"); });
    if (t.first !== undefined && !(Array.isArray(t.first) && t.first.every(function (p) {
      return Array.isArray(p) && p.length === 2 && typeof p[0] === "string" && (typeof p[1] === "string" || p[1] === null);
    }))) errs.push("tests.first の形がおかしい");
    var count = (t.match || []).length + (t.noMatch || []).length + (t.first || []).length;
    if (count === 0) errs.push("tests が空");
    return errs;
  }
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (typeof q.q !== "string" || !q.q) errs.push("q がない");
    if (KINDS.indexOf(q.kind) < 0) errs.push("kind がおかしい: " + q.kind);
    if (q.code !== undefined && (typeof q.code !== "string" || !q.code)) errs.push("code が空");
    var kind = kindOf(q);
    if (q.tests !== undefined) errs = errs.concat(checkTests(q.tests));
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errs.push("choices が4つではない");
    } else {
      var seen = {};
      q.choices.forEach(function (c, i) {
        if (typeof c !== "string" || c === "") { errs.push("choices[" + i + "] が空"); return; }
        if (seen[c]) errs.push("choices に同じものがある: " + c);
        seen[c] = true;
      });
    }
    if (errs.length > 0) return errs;

    if (kind === "str") {
      // 先頭の選択肢だけがマッチする(pick: "noMatch" なら、先頭だけがマッチしない)
      var p = parseLiteral(q.code || "");
      if (p.error) errs.push("code の正規表現が読めない: " + p.error);
      else {
        var r = new RegExp(p.source, p.flags.replace(/[gy]/g, ""));
        var want = q.pick !== "noMatch";
        q.choices.forEach(function (c, i) {
          if (r.test(c) !== (i === 0 ? want : !want)) errs.push("choices[" + i + "] のマッチが合わない: " + c);
        });
      }
    } else if (q.pick !== undefined) errs.push("pick は kind str だけ");
    if (kind === "regex") {
      if (!q.tests) errs.push("kind regex には tests が要る");
      else q.choices.forEach(function (c, i) {
        var p2 = parseLiteral(c);
        if (p2.error) { if (i === 0) errs.push("正解の正規表現が読めない: " + p2.error); return; }
        var ok = runTests(q.tests, p2.re).length === 0;
        if (ok !== (i === 0)) errs.push(i === 0 ? "正解が tests を満たさない" : "誤答が tests を満たす: " + c);
      });
    }
    if (isInputable(q)) {
      if (q.tests) {
        var j0 = judge(q, q.choices[0]);
        if (!j0.ok) errs.push("正解を入れても tests を満たさない" + (j0.error ? ": " + j0.error : ""));
      }
      q.choices.slice(1).forEach(function (c) {
        if (isMatch(q, c)) errs.push("誤答が正解と判定される: " + c);
      });
    } else if (q.tests && kind !== "regex" && !hasBlank(q)) {
      errs.push("tests は kind regex か空欄の問題だけ");
    }
    if (q.accepts !== undefined && !isStrArr(q.accepts)) errs.push("accepts が文字列の配列ではない");
    if (q.run !== undefined && q.run !== true) errs.push("run は true だけ");
    if (q.run && hasBlank(q) && typeof q.expect !== "string") errs.push("空欄のある run には expect が要る");
    if (typeof q.explain !== "string" || !q.explain) errs.push("explain がない");
    if (!q.ref || !card(q.ref)) errs.push("ref のカードがない: " + q.ref);
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
  function poolOf(unitId, mode) {
    var c = contentOf(unitId);
    if (!c) return [];
    return c.questions.filter(function (q) {
      return checkQuestion(q).length === 0 && (mode !== "input" || isInputable(q));
    });
  }
  function isReady(unitId, mode) { return poolOf(unitId, mode || "choice").length > 0; }

  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      id: q.id,
      q: q.q,
      code: q.code || "",
      kind: kindOf(q),
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(0),
      canonical: q.choices[0],
      source: q,
      explain: q.explain,
      ref: q.ref || ""
    };
  }

  // 選んだ単元から順番に1問ずつ取り、count 問になるまで続ける(問題が少ない単元は、ほかの単元で補う)
  function buildQuiz(unitIds, mode, count) {
    count = count || COUNT;
    var pools = shuffle(unitIds.filter(function (id) { return unit(id); })).map(function (id) {
      return { id: id, list: shuffle(poolOf(id, mode)) };
    }).filter(function (p) { return p.list.length > 0; });
    var out = [];
    while (out.length < count && pools.length > 0) {
      for (var i = 0; i < pools.length && out.length < count; i++) {
        out.push(prepare(pools[i].id, pools[i].list.shift()));
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
    var s = { mode: "choice", units: [] };
    if (MODES.indexOf(raw.mode) >= 0) s.mode = raw.mode;
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }

  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, MODES: MODES, UNITS: UNITS, BLANK: BLANK,
    unit: unit, register: register, contentOf: contentOf, card: card,
    parseLiteral: parseLiteral, findMatches: findMatches, runTests: runTests, formatValue: formatValue,
    normalize: normalize, judge: judge, isMatch: isMatch, regexOf: regexOf,
    isInputable: isInputable, kindOf: kindOf, hasBlank: hasBlank, fillBlank: fillBlank,
    tokenize: tokenize, tokenizeRegex: tokenizeRegex, deriveTarget: deriveTarget,
    checkQuestion: checkQuestion, isReady: isReady, poolOf: poolOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();


// =====================================================================
// 01 文字とエスケープ
// =====================================================================
RGX.register("literal", {
  cards: [
    {
      id: "js-regex", name: "/パターン/フラグ", read: "JavaScript での書き方",
      desc: "JavaScript では、正規表現を `/` と `/` で囲んで書きます(正規表現リテラル)。うしろに `g` や `i` などのフラグをつけられます。文字列から作るときは `new RegExp(\"パターン\", \"フラグ\")` と書きます。",
      examples: [
        ['/cat/.test("concat")', "→ true"],
        ['new RegExp("ca+t", "i").test("CAAT")', "→ true"]
      ],
      notes: [
        "`new RegExp` に文字列で渡すときは、`\\` を `\\\\` と2つ書きます。文字列のエスケープが先に働いて、`\\` が1つ消えるためです。",
        "リテラルの中で `/` そのものを書くときは `\\/` とします。"
      ]
    },
    {
      id: "methods", name: "test · match · replace", read: "よく使うメソッド",
      desc: "`正規表現.test(文字列)` は、マッチすれば `true`。`文字列.match(正規表現)` は、マッチした内容の配列(なければ `null`)。`文字列.replace(正規表現, 置きかえ)` は、マッチした部分を置きかえた新しい文字列を返します。",
      examples: [
        ['/\\d/.test("abc1")', "→ true"],
        ['"abc1".match(/\\d/)[0]', '→ "1"'],
        ['"abc1".replace(/\\d/, "#")', '→ "abc#"']
      ],
      notes: [
        "`g` フラグがないと、`match` も `replace` も最初の1か所だけを扱います。`g` は単元08でくわしく学びます。",
        "`test` は、文字列のどこか一部にマッチすれば `true` です。文字列全体を調べるには `^…$` で囲みます(単元04)。"
      ]
    },
    {
      id: "literal", name: "abc", read: "そのままの文字",
      desc: "記号ではないふつうの文字は、その文字自身にマッチします。文字列のどこかにその並びがあればマッチします。大文字と小文字は区別します。",
      examples: [
        ['/cat/.test("concatenate")', "→ true(途中の cat)"],
        ['/cat/.test("Cat")', "→ false(大文字の C)"],
        ['/東京/.test("東京都")', "→ true"]
      ]
    },
    {
      id: "meta", name: ". ^ $ * + ? ( ) [ ] { } | \\", read: "メタ文字",
      desc: "特別な意味をもつ記号です。その文字そのものにマッチさせるには、前に `\\` をつけてエスケープします。",
      options: [
        [".", "任意の1文字"],
        ["^ $", "先頭・末尾(単元04)"],
        ["* + ? { }", "くり返し(単元03)"],
        ["( ) |", "グループ・選択(単元05)"],
        ["[ ]", "文字クラス(単元02)"],
        ["\\", "エスケープ"],
        ["/", "リテラルの区切り。中では \\/ と書く"]
      ],
      notes: ["`-` `@` `#` `_` `:` `,` `=` などはメタ文字ではないので、そのまま書けます。"]
    },
    {
      id: "escape", name: "\\. \\+ \\( \\\\ \\/", read: "エスケープ",
      desc: "メタ文字の前に `\\` をつけると、その文字そのものにマッチします。`\\.` は点、`\\+` はプラス、`\\\\` は `\\` 1文字、`\\/` はスラッシュです。",
      examples: [
        ['"1.5".match(/1\\.5/)[0]', '→ "1.5"'],
        ['/1\\.5/.test("1x5")', "→ false"],
        ['"1+1=2".replace(/\\+/, " plus ")', '→ "1 plus 1=2"'],
        ['"a/b".replace(/\\//, "-")', '→ "a-b"']
      ],
      notes: ["英字の前に `\\` をつけると、`\\d`(数字)のように別の意味になることがあります。メタ文字でない文字には、むやみにつけないようにします。"]
    },
    {
      id: "dot", name: ".", read: "任意の1文字",
      desc: "`.` は、改行以外の任意の1文字にマッチします。ちょうど1文字ぶんで、0文字や2文字にはマッチしません。",
      examples: [
        ['/a.c/.test("abc")', "→ true"],
        ['/a.c/.test("ac")', "→ false"],
        ['/a.c/.test("a\\nc")', "→ false(改行)"]
      ],
      notes: ["改行にもマッチさせたいときは `s` フラグをつけます(単元08)。"]
    }
  ],
  questions: [
    {
      id: "l01", q: "この正規表現にマッチする文字列は?", code: "/cat/", kind: "str",
      choices: ["concatenate", "Cat", "c-a-t", "act"],
      explain: "`test` は、文字列のどこか一部に「c・a・t」の並びがあればマッチします。concatenate の途中に cat があります。大文字の Cat は別の文字なのでマッチしません。",
      ref: "literal"
    },
    {
      id: "l02", q: "この正規表現にマッチする文字列は?", code: "/a.c/", kind: "str",
      choices: ["a+c", "ac", "abbc", "A.C"],
      explain: "`.` は任意の1文字なので、a と c の間にちょうど1文字が必要です。`+` も1文字としてマッチします。ac は間が0文字、abbc は2文字です。A.C は大文字の A と C なので合いません。",
      ref: "dot"
    },
    {
      id: "l03", q: "\"1.5\" にはマッチし、\"1x5\" にはマッチしない正規表現は?", kind: "regex",
      choices: ["/1\\.5/", "/1.5/", "/1\\\\.5/", "/1..5/"],
      tests: { match: ["1.5"], noMatch: ["1x5"] },
      explain: "`\\.` は点そのものです。`/1.5/` の `.` は任意の1文字なので 1x5 にもマッチします。`/1\\\\.5/` は「1、`\\`、任意の1文字、5」です。",
      ref: "escape"
    },
    {
      id: "l04", q: "\"www.example.com\" の最初の点も、点そのものとして書きます。空欄に入るのは?", code: "/www____example\\.com/", kind: "code",
      choices: ["\\.", ".", "/.", "\\\\."],
      tests: { match: ["www.example.com"], noMatch: ["wwwxexample.com"] },
      explain: "`\\.` で点そのものにマッチします。`.` のままだと「wwwxexample.com」のような文字列にもマッチしてしまいます。`[.]` と書いても点だけにマッチします。",
      ref: "escape"
    },
    {
      id: "l05", q: "正規表現の `.` は、何にマッチする?", kind: "text",
      choices: ["改行以外の任意の1文字", "点(.)という文字だけ", "0文字以上の任意の文字列", "空白以外の任意の1文字"],
      explain: "`.` は改行以外の1文字なら何にでもマッチします。点そのものは `\\.`、0文字以上の任意の文字列は `.*` です。",
      ref: "dot"
    },
    {
      id: "l06", q: "このコードの結果は?", code: '/a.c/.test("a\\nc")', kind: "code", run: true,
      choices: ["false", "true", "null", '"a\\nc"'],
      explain: "`\\n` は改行です。`.` は改行にはマッチしないので false になります。改行にもマッチさせるには `s` フラグ(`/a.c/s`)を使います。",
      ref: "dot"
    },
    {
      id: "l07", q: "正規表現の中で、その文字そのものとして書くには `\\` でエスケープが必要なのは?", kind: "code",
      choices: ["+", "@", "#", "_"],
      explain: "`+` は「1回以上くり返す」というメタ文字なので、プラスそのものは `\\+` と書きます。`@` `#` `_` はメタ文字ではないので、そのまま書けます。",
      ref: "meta"
    },
    {
      id: "l08", q: "このコードの結果は?", code: '"1+1=2".replace(/\\+/, "plus")', kind: "code", run: true,
      choices: ['"1plus1=2"', '"1+1=2"', '"plus"', '"1plus1plus2"'],
      explain: "`\\+` はプラスそのものにマッチします。マッチした「+」が「plus」に置きかわります。`=` は置きかえの対象ではありません。",
      ref: "escape"
    },
    {
      id: "l09", q: "このコードの結果は?", code: '"a.b.c".replace(/./g, "-")', kind: "code", run: true,
      choices: ['"-----"', '"a-b-c"', '"a.b.c"', '"-.-.-"'],
      explain: "`.` は任意の1文字なので、点だけでなくすべての文字にマッチします。`g` フラグですべてのマッチを置きかえるので、5文字すべてが「-」になります。点だけを置きかえるなら `/\\./g` です。",
      ref: "dot"
    },
    {
      id: "l10", q: "\"1+2\" にはマッチし、\"112\" や \"1-2\" にはマッチしないようにします。空欄に入るのは?", code: "/1____2/", kind: "code",
      choices: ["\\+", "+", ".", "\\\\+"],
      tests: { match: ["1+2"], noMatch: ["112", "1-2"] },
      explain: "`\\+` でプラスそのものにマッチします。`/1+2/` は「1が1回以上、そのあと2」なので 112 にマッチします。`[+]` と書いても正解です。",
      ref: "escape"
    },
    {
      id: "l11", q: "この正規表現にマッチする文字列は?", code: "/\\$100/", kind: "str",
      choices: ["価格は$100です", "100ドル", "$ 100", "$10"],
      explain: "`\\$` はドル記号そのものです。$ と 100 が続いて並んでいる必要があります。「$ 100」は間に空白があり、「$10」は 0 が1つ足りません。",
      ref: "escape"
    },
    {
      id: "l12", q: "`new RegExp(\"1\\\\.5\")` のように、文字列で `\\` を2つ書くのはなぜ?", kind: "text",
      choices: [
        "文字列の中では \\ そのものも \\\\ とエスケープする必要があるから",
        "\\ を2つ書くと、点が2回くり返されるから",
        "new RegExp では、メタ文字を2回エスケープする決まりだから",
        "1つでも2つでも同じだが、2つ書くのが習慣だから"
      ],
      explain: "文字列 `\"1\\\\.5\"` の中身は `1\\.5` です。`\"1\\.5\"` と書くと、文字列の段階で `\\.` が `.` になり、正規表現は `1.5`(任意の1文字)になってしまいます。リテラル `/1\\.5/` なら1つで済みます。",
      ref: "js-regex"
    },
    {
      id: "l13", q: "\"a/b\" のスラッシュにマッチさせます。空欄に入るのは?", code: "/a____b/", kind: "code",
      choices: ["\\/", "/", "//", "|"],
      tests: { match: ["a/b"], noMatch: ["ab", "a|b"] },
      explain: "正規表現リテラルは `/` で囲むので、中の `/` は `\\/` と書きます。そのまま `/` を書くと、そこでリテラルが終わってしまいます。`|` は「または」の記号です。",
      ref: "js-regex"
    },
    {
      id: "l14", q: "\"a.txt\" や \"b.txt\" のように、何か1文字のあとに \".txt\" が続くところにマッチさせます。空欄に入るのは?", code: "/____\\.txt/", kind: "code",
      choices: [".", "\\.", "a", "*"],
      tests: { match: ["a.txt", "b.txt"], noMatch: [".txt"] },
      explain: "任意の1文字は `.` です。うしろの点はエスケープした `\\.` なので、点そのものです。`*` は直前に何もないので、正規表現として読めません。",
      ref: "dot"
    },
    {
      id: "l15", q: "\"(笑)\" のかっこを、かっこそのものとして書きます。空欄に入るのは?", code: "/____笑\\)/", kind: "code",
      choices: ["\\(", "(", "[(", "."],
      tests: { match: ["(笑)"], noMatch: ["笑)", "x笑)"] },
      explain: "`(` はグループを作るメタ文字なので、かっこそのものは `\\(` と書きます。`(` だけだと閉じていないグループになり、正規表現として読めません。`.` は任意の1文字なので、「x笑)」にもマッチしてしまいます。",
      ref: "escape"
    }
  ]
});


// =====================================================================
// 02 文字クラス
// =====================================================================
RGX.register("class", {
  cards: [
    {
      id: "class-set", name: "[abc]", read: "どれか1文字",
      desc: "`[ ]` の中に並べた文字の、どれか1文字にマッチします。",
      examples: [
        ['/gr[ae]y/.test("grey")', "→ true"],
        ['"bat cat hat".match(/[bc]at/g)', '→ ["bat", "cat"]']
      ],
      notes: ["`[abc]` は1文字ぶんです。「abc」という並びではありません。"]
    },
    {
      id: "class-range", name: "[a-z] [0-9]", read: "範囲",
      desc: "`-` でつなぐと、文字コードの範囲になります。範囲はいくつも並べられます。",
      examples: [
        ['"R2-D2".match(/[0-9]/g)', '→ ["2", "2"]'],
        ['/[A-Za-z]/.test("123")', "→ false"]
      ],
      options: [
        ["[a-z]", "小文字の a〜z"],
        ["[A-Z]", "大文字の A〜Z"],
        ["[0-9]", "数字"],
        ["[a-zA-Z0-9_]", "範囲と文字を並べる"]
      ],
      notes: [
        "`-` そのものを入れたいときは、`[-a]` や `[0-9-]` のように端に置くか、`\\-` と書きます。",
        "`[9-0]` のように逆向きの範囲は、正規表現として読めません(エラー)。"
      ]
    },
    {
      id: "class-neg", name: "[^…]", read: "以外の1文字",
      desc: "`[` の直後の `^` は、「かっこの中の文字以外」の1文字という意味です。",
      examples: [
        ['"a1b2".replace(/[^0-9]/g, "")', '→ "12"'],
        ['/[^0-9]/.test("123")', "→ false"]
      ],
      notes: [
        "`[^…]` も1文字ぶんにマッチします。0文字にはマッチしません。",
        "`[` の直後以外の `^` は、ただの文字です(`[a^]` は a か ^)。"
      ]
    },
    {
      id: "shorthand", name: "\\d \\w \\s", read: "よく使うクラス",
      desc: "よく使う文字クラスには、短い書き方があります。",
      options: [
        ["\\d", "数字 [0-9]"],
        ["\\w", "英数字とアンダースコア [A-Za-z0-9_]"],
        ["\\s", "空白文字(スペース・タブ・改行・全角スペースなど)"]
      ],
      examples: [
        ['"東京 Tokyo".match(/\\w+/g)', '→ ["Tokyo"]'],
        ['"a b\\tc".replace(/\\s/g, "_")', '→ "a_b_c"'],
        ['/\\d/.test("１２３")', "→ false(全角数字)"]
      ],
      notes: ["JavaScript の `\\d` と `\\w` は、半角(ASCII)の英数字だけです。ひらがな・漢字・全角数字にはマッチしません。"]
    },
    {
      id: "shorthand-neg", name: "\\D \\W \\S", read: "大文字は反対",
      desc: "大文字にすると、反対の意味になります。",
      options: [
        ["\\D", "数字以外の1文字"],
        ["\\W", "\\w 以外の1文字(記号・空白・日本語など)"],
        ["\\S", "空白以外の1文字"]
      ],
      examples: [
        ['"Ab1_!".match(/\\W/g)', '→ ["!"]'],
        ['"12-34".replace(/\\D/g, "")', '→ "1234"']
      ]
    },
    {
      id: "class-meta", name: "[.] [*] [+]", read: "クラスの中の記号",
      desc: "`[ ]` の中では、`.` `*` `+` `?` `(` `)` `$` `|` などはただの文字です。中で特別なのは、`]` `\\`、先頭の `^`、文字の間の `-` だけです。",
      examples: [
        ['/[.]/.test("3.14")', "→ true"],
        ['/[.]/.test("314")', "→ false"],
        ['"a+b*c".match(/[+*]/g)', '→ ["+", "*"]']
      ]
    }
  ],
  questions: [
    {
      id: "c01", q: "この正規表現にマッチする文字列は?", code: "/gr[ae]y/", kind: "str",
      choices: ["grey", "groy", "graey", "gry"],
      explain: "`[ae]` は a か e の1文字です。graey は間が2文字、gry は0文字なので合いません。",
      ref: "class-set"
    },
    {
      id: "c02", q: "\"gray\" と \"grey\" にはマッチし、\"groy\" \"grdy\" \"graey\" にはマッチしないようにします。空欄に入るのは?", code: "/gr____y/", kind: "code",
      choices: ["[ae]", "ae", "[a-e]", "[ae]+"],
      tests: { match: ["gray", "grey"], noMatch: ["groy", "grdy", "graey"] },
      explain: "`[ae]` は a か e の1文字です。`[a-e]` は a〜e の範囲なので d などにもマッチし、`[ae]+` は graey にもマッチします。",
      ref: "class-set"
    },
    {
      id: "c03", q: "小文字のアルファベット1文字にマッチさせます。空欄に入るのは?", code: "/[____]/", kind: "code",
      choices: ["a-z", "A-Z", "a..z", "az"],
      tests: { match: ["x", "Ab"], noMatch: ["ABC", "123"] },
      explain: "`[a-z]` で a から z までのどれか1文字です。`[a..z]` は「a・点・z」のどれか、`[az]` は a か z だけです。",
      ref: "class-range"
    },
    {
      id: "c04", q: "数字が1文字以上続くところにマッチさせます。空欄に入るのは?", code: "/____+/", kind: "code",
      choices: ["\\d", "\\w", "\\D", "d"],
      tests: { match: ["2024"], noMatch: ["abc", "--"] },
      explain: "`\\d` は数字です。`\\w` は英字にもマッチし、`\\D` は数字以外、`d` は英字の d そのものです。`[0-9]` と書いても正解です。",
      ref: "shorthand"
    },
    {
      id: "c05", q: "JavaScript の `\\w` がマッチするのは?", kind: "text",
      choices: [
        "半角の英字・数字と _ のどれか1文字",
        "ひらがな・漢字を含む、文字ならどれでも1文字",
        "空白以外の1文字",
        "半角の英字1文字だけ"
      ],
      explain: "`\\w` は `[A-Za-z0-9_]` と同じです。日本語の文字にはマッチしません。空白以外の1文字は `\\S` です。",
      ref: "shorthand"
    },
    {
      id: "c06", q: "このコードの結果は?", code: '"東京 Tokyo".match(/\\w+/g)', kind: "code", run: true,
      choices: ['["Tokyo"]', '["東京", "Tokyo"]', '["東京 Tokyo"]', "null"],
      explain: "`\\w` は半角の英数字と _ だけなので、「東京」にはマッチしません。日本語もふくめたいときは、`[^\\s]` や `\\S` などを使います。",
      ref: "shorthand"
    },
    {
      id: "c07", q: "このコードの結果は?", code: '"a b\\tc".replace(/\\s/g, "_")', kind: "code", run: true,
      choices: ['"a_b_c"', '"a_b\\tc"', '"a b\\tc"', '"abc"'],
      explain: "`\\s` は空白文字で、スペースにもタブ(`\\t`)にもマッチします。`g` があるので両方が「_」になります。",
      ref: "shorthand"
    },
    {
      id: "c08", q: "この正規表現にマッチする文字列は?", code: "/[.]/", kind: "str",
      choices: ["3.14", "314", "three", "3,14"],
      explain: "`[ ]` の中の `.` は、ただの点です。任意の1文字という意味にはなりません。",
      ref: "class-meta"
    },
    {
      id: "c09", q: "数字以外の文字が1つでもあればマッチする正規表現は?", kind: "regex",
      choices: ["/\\D/", "/\\d/", "/[^\\D]/", "/[0-9]/"],
      tests: { match: ["a", "12-3"], noMatch: ["123"] },
      explain: "`\\D` は数字以外の1文字です。`[^\\D]` は「数字以外、以外」なので数字と同じ意味になります。",
      ref: "shorthand-neg"
    },
    {
      id: "c10", q: "この正規表現にマッチする文字列は?", code: "/[A-Z][a-z]/", kind: "str",
      choices: ["iPhone", "IPHONE", "iphone", "aB"],
      explain: "大文字1文字のすぐあとに小文字1文字が必要です。iPhone の「Ph」がマッチします。aB は小文字のあとに大文字なので、順番が逆です。",
      ref: "class-range"
    },
    {
      id: "c11", q: "`[^abc]` の `^` の意味は?", kind: "text",
      choices: [
        "かっこの中の文字以外、という意味",
        "文字列の先頭、という意味",
        "^ という文字そのもの",
        "直前の文字をくり返さない、という意味"
      ],
      explain: "`[` の直後に置いた `^` は、文字クラスを反対にします。`[^abc]` は a・b・c 以外の1文字です。かっこの外の `^` は文字列の先頭(単元04)です。",
      ref: "class-neg"
    },
    {
      id: "c12", q: "数字とハイフンだけでできた文字列(03-1234 など)にマッチさせます。空欄に入るのは?", code: "/^[0-9____]+$/", kind: "code",
      choices: ["-", "_", "\\s", "."],
      tests: { match: ["03-1234", "0120"], noMatch: ["03_1234", "03 1234", "03.1234"] },
      explain: "`[ ]` の最後に置いた `-` は、範囲ではなくハイフンそのものです。`\\-` と書いても正解です。`[ ]` の中の `.` は点そのものなので、03.1234 にもマッチしてしまいます。",
      ref: "class-range"
    },
    {
      id: "c13", q: "このコードの結果は?", code: '"Ab1_!".match(/\\W/g)', kind: "code", run: true,
      choices: ['["!"]', '["_", "!"]', '["A", "b"]', "null"],
      explain: "`\\W` は `\\w`(英数字と _)以外の1文字です。_ は `\\w` にふくまれるので、マッチするのは ! だけです。",
      ref: "shorthand-neg"
    },
    {
      id: "c14", q: "スペースにもタブにもマッチし、空白のない文字列にはマッチしない正規表現は?", kind: "regex",
      choices: ["/\\s/", "/ /", "/\\S/", "/[s]/"],
      tests: { match: ["a b", "a\tb"], noMatch: ["ab"] },
      explain: "`\\s` は空白文字(スペース・タブ・改行など)の1文字です。`/ /` はスペースだけ、`\\S` は空白以外、`[s]` は英字の s です。",
      ref: "shorthand"
    },
    {
      id: "c15", q: "数字以外の文字が1つでもあればマッチさせます。空欄に入るのは?", code: "/[^____]/", kind: "code",
      choices: ["0-9", "9-0", "a-z", "0-9a-z"],
      tests: { match: ["12a", "-5"], noMatch: ["123"] },
      explain: "`[^0-9]` は数字以外の1文字です。`[^\\d]` でも同じ意味になります。`9-0` のように逆向きの範囲は、正規表現として読めません。",
      ref: "class-neg"
    }
  ]
});


// =====================================================================
// 03 くり返し
// =====================================================================
RGX.register("quant", {
  cards: [
    {
      id: "star", name: "*", read: "0回以上",
      desc: "直前の文字を0回以上くり返します。1回もなくてもマッチします。",
      examples: [
        ['"ac abc abbc".match(/ab*c/g)', '→ ["ac", "abc", "abbc"]']
      ],
      notes: ["0回でもよいので、`/a*/` はどんな文字列にも(長さ0の文字列として)マッチします。"]
    },
    {
      id: "plus", name: "+", read: "1回以上",
      desc: "直前の文字を1回以上くり返します。",
      examples: [
        ['"ac abc abbc".match(/ab+c/g)', '→ ["abc", "abbc"]']
      ]
    },
    {
      id: "question", name: "?", read: "0回か1回",
      desc: "直前の文字が、あってもなくてもよい(0回か1回)という意味です。",
      examples: [
        ['"color colour".match(/colou?r/g)', '→ ["color", "colour"]'],
        ['/^https?:/.test("http://a.jp")', "→ true"]
      ]
    },
    {
      id: "brace", name: "{n} {n,} {n,m}", read: "回数を決める",
      desc: "くり返しの回数を数で決めます。",
      options: [
        ["{3}", "ちょうど3回"],
        ["{2,}", "2回以上"],
        ["{2,4}", "2〜4回"]
      ],
      examples: [
        ['/^\\d{3}-\\d{4}$/.test("123-4567")', "→ true"],
        ['"100000".match(/0{2,3}/g)', '→ ["000", "00"]']
      ],
      notes: [
        "`{2, 4}` のように空白を入れると、くり返しにはならず、ただの文字の並びとして読まれます(u フラグなしのとき)。",
        "`{,3}` は「0〜3回」の意味になりません。`{0,3}` と書きます。"
      ]
    },
    {
      id: "quant-target", name: "くり返しの範囲", read: "直前の1つにかかる",
      desc: "くり返しの記号は、直前の1文字(または `[…]` `( )` の1かたまり)だけにかかります。`ab+` は b だけをくり返します。",
      examples: [
        ['"ababab".match(/ab+/)[0]', '→ "ab"'],
        ['"ababab".match(/(ab)+/)[0]', '→ "ababab"'],
        ['"abc123".match(/[a-z]+/)[0]', '→ "abc"']
      ]
    }
  ],
  questions: [
    {
      id: "q01", q: "この正規表現にマッチする文字列は?", code: "/colou?r/", kind: "str",
      choices: ["color", "colouur", "colr", "coloer"],
      explain: "`u?` は u が0回か1回です。color(u なし)と colour(u 1つ)にマッチします。u が2つの colouur には合いません。",
      ref: "question"
    },
    {
      id: "q02", q: "この正規表現にマッチする文字列は?", code: "/ab*c/", kind: "str",
      choices: ["ac", "abd", "a*c", "bc"],
      explain: "`b*` は b が0回以上なので、b がない ac にもマッチします。`*` はくり返しの記号で、a*c の「*」という文字にはマッチしません。",
      ref: "star"
    },
    {
      id: "q03", q: "この正規表現にマッチしない文字列は?", code: "/ab+c/", kind: "str", pick: "noMatch",
      choices: ["ac", "abc", "abbbc", "xabcx"],
      explain: "`b+` は b が1回以上です。b が1つもない ac にはマッチしません。xabcx は途中の abc がマッチします。",
      ref: "plus"
    },
    {
      id: "q04", q: "ちょうど3けたの数字だけの文字列にマッチさせます(`^` と `$` は文字列の先頭と末尾)。空欄に入るのは?", code: "/^\\d____$/", kind: "code",
      choices: ["{3}", "{0,3}", "{3,}", "+"],
      tests: { match: ["123", "007"], noMatch: ["12", "1234"] },
      explain: "`\\d{3}` で数字ちょうど3つです。`{0,3}` は0〜3回、`{3,}` は3回以上、`+` は1回以上です。`\\d\\d\\d` と書いても正解です。",
      ref: "brace"
    },
    {
      id: "q05", q: "郵便番号(123-4567 の形)だけにマッチさせます。空欄に入るのは?", code: "/^\\d{3}-\\d____$/", kind: "code",
      choices: ["{4}", "{3}", "{4,}", "*"],
      tests: { match: ["123-4567"], noMatch: ["123-456", "123-45678"] },
      explain: "ハイフンのあとは数字ちょうど4つなので `\\d{4}` です。`{4,}` だと5けた以上も通ってしまいます。",
      ref: "brace"
    },
    {
      id: "q06", q: "このコードの結果は?", code: '"aaaa".replace(/a{2}/g, "X")', kind: "code", run: true,
      choices: ['"XX"', '"Xaa"', '"XXXX"', '"XXX"'],
      explain: "`a{2}` は aa です。左から aa・aa と2回マッチし、`g` があるので両方が X になります。マッチした部分は重ならないので、XXX にはなりません。",
      ref: "brace"
    },
    {
      id: "q07", q: "`{2,}` の意味は?", kind: "text",
      choices: ["2回以上", "ちょうど2回", "2回まで(0〜2回)", "2文字の並び"],
      explain: "`{n,}` は n 回以上、`{n}` はちょうど n 回、`{n,m}` は n〜m 回です。0〜2回は `{0,2}` と書きます。",
      ref: "brace"
    },
    {
      id: "q08", q: "x が2〜4個だけの文字列(xx・xxx・xxxx)にマッチする正規表現は?", kind: "regex",
      choices: ["/^x{2,4}$/", "/^x{2-4}$/", "/^x{2,}$/", "/^x[2,4]$/"],
      tests: { match: ["xx", "xxxx"], noMatch: ["x", "xxxxx"] },
      explain: "回数の範囲はカンマで `{2,4}` と書きます。`{2-4}` はくり返しにならず、「{2-4}」という文字の並びとして読まれます。`[2,4]` は「2・カンマ・4」のどれか1文字です。",
      ref: "brace"
    },
    {
      id: "q09", q: "この正規表現にマッチする文字列は?", code: "/go*gle/", kind: "str",
      choices: ["ggle", "goagle", "gole", "oogle"],
      explain: "`o*` は o が0回以上なので、o がない ggle にもマッチします。goagle は o と g の間に a があり、gole は2つめの g がありません。",
      ref: "star"
    },
    {
      id: "q10", q: "\"http://\" と \"https://\" にはマッチし、\"httpss://\" にはマッチしないようにします。空欄に入るのは?", code: "/https____:\\/\\//", kind: "code",
      choices: ["?", "*", "+", "{1}"],
      tests: { match: ["http://", "https://"], noMatch: ["httpss://"] },
      explain: "`s?` で s が0回か1回になります。`*` だと httpss:// にもマッチし、`+` や `{1}` だと http:// にマッチしません。",
      ref: "question"
    },
    {
      id: "q11", q: "このコードの結果は?", code: '"100000".match(/0{2,3}/g)', kind: "code", run: true,
      choices: ['["000", "00"]', '["00000"]', '["00", "00", "0"]', '["00", "000"]'],
      explain: "0 が5つ並んでいます。左から、できるだけ多く(3つ)取って 000、残りの 00 も2つなのでマッチします。残りが1つだけならマッチしません。",
      ref: "brace"
    },
    {
      id: "q12", q: "`/ab+/` の `+` がくり返すのは?", kind: "text",
      choices: ["直前の b だけ", "ab の2文字", "a だけ", "それまでのパターン全体"],
      explain: "くり返しの記号は直前の1文字にかかります。ab をまとめてくり返すには `(ab)+` と書きます(単元05)。",
      ref: "quant-target"
    },
    {
      id: "q13", q: "このコードの結果は?", code: '/a*/.test("xyz")', kind: "code", run: true,
      choices: ["true", "false", "null", '"xyz"'],
      explain: "`a*` は a が0回でもよいので、文字列の先頭で「長さ0の文字列」にマッチします。そのため a がなくても true です。",
      ref: "star"
    },
    {
      id: "q14", q: "数字が1文字以上だけの文字列にマッチさせます。空欄に入るのは?", code: "/^[0-9]____$/", kind: "code",
      choices: ["+", "*", "?", "{1}"],
      tests: { match: ["7", "2024"], noMatch: ["", "12a"] },
      explain: "`+` は1回以上です。`*` だと空の文字列にもマッチし、`?` は0〜1けた(空の文字列にもマッチ)、`{1}` は1けただけです。",
      ref: "plus"
    },
    {
      id: "q15", q: "2〜4けたの数字だけの文字列にマッチさせます。空欄に入るのは?", code: "/^\\d____$/", kind: "code",
      choices: ["{2,4}", "{2-4}", "{2,}", "{4}"],
      tests: { match: ["12", "1234"], noMatch: ["1", "12345"] },
      explain: "回数の範囲は `{2,4}` のようにカンマで書きます。`{2-4}` はくり返しにならず、「{2-4}」という文字の並びとして読まれます。",
      ref: "brace"
    }
  ]
});


// =====================================================================
// 04 位置の指定
// =====================================================================
RGX.register("anchor", {
  cards: [
    {
      id: "caret", name: "^", read: "先頭",
      desc: "文字列の先頭の位置にマッチします。文字は食べません(幅0)。",
      examples: [
        ['/^abc/.test("abcdef")', "→ true"],
        ['/^abc/.test("xabc")', "→ false"]
      ],
      notes: ["`[^…]` の `^` とは別の意味です。"]
    },
    {
      id: "dollar", name: "$", read: "末尾",
      desc: "文字列の末尾の位置にマッチします。",
      examples: [
        ['/end$/.test("the end")', "→ true"],
        ['/end$/.test("ending")', "→ false"]
      ],
      notes: ["JavaScript の `$` は(m フラグがなければ)文字列の本当の末尾だけにマッチします。末尾に改行があると `/^\\d+$/` は合いません(ほかの言語では、末尾の改行の手前にもマッチすることがあります)。"]
    },
    {
      id: "whole", name: "^…$", read: "文字列全体",
      desc: "`^` と `$` で囲むと、文字列全体がパターンに合うときだけマッチします。入力チェックでよく使います。",
      examples: [
        ['/^\\d+$/.test("2024")', "→ true"],
        ['/^\\d+$/.test("2024年")', "→ false"],
        ['/\\d+/.test("2024年")', "→ true(一部にマッチ)"]
      ]
    },
    {
      id: "wordb", name: "\\b \\B", read: "単語の境目",
      desc: "`\\b` は、`\\w` の文字とそれ以外(または文字列の端)の境目にマッチします。文字は食べない(幅0)ので、位置だけを指定します。`\\B` は境目ではない位置です。",
      examples: [
        ['"cat concat cats".match(/\\bcat\\b/g)', '→ ["cat"]'],
        ['"cat concat cats".match(/\\Bcat/g)', '→ ["cat"](concat の cat)'],
        ['/\\b東京\\b/.test("東京へ")', "→ false"]
      ],
      notes: ["`\\w` は半角の英数字と `_` だけなので、日本語の文字のまわりでは `\\b` が思ったとおりに働きません。"]
    },
    {
      id: "multiline", name: "m フラグ", read: "行ごとの ^ $",
      desc: "`m` フラグをつけると、`^` と `$` が、文字列の先頭・末尾に加えて、各行の先頭・末尾(改行の直後・直前)にもマッチします。",
      examples: [
        ['"a1\\nb2".match(/^\\w/g)', '→ ["a"]'],
        ['"a1\\nb2".match(/^\\w/gm)', '→ ["a", "b"]'],
        ['"line1\\nline2".replace(/^/gm, "> ")', '→ "> line1\\n> line2"']
      ]
    }
  ],
  questions: [
    {
      id: "a01", q: "この正規表現にマッチする文字列は?", code: "/^abc/", kind: "str",
      choices: ["abcdef", "xabc", "ABC", "ab c"],
      explain: "`^` は先頭の位置です。abc が先頭にある abcdef だけがマッチします。xabc は abc が途中にあります。",
      ref: "caret"
    },
    {
      id: "a02", q: "この正規表現にマッチする文字列は?", code: "/end$/", kind: "str",
      choices: ["the end", "end.", "ending", "endless"],
      explain: "`$` は末尾の位置です。end のすぐあとで文字列が終わっている必要があります。「end.」は最後に点があります。",
      ref: "dollar"
    },
    {
      id: "a03", q: "数字だけの文字列にマッチさせます。空欄に入るのは?", code: "/____\\d+$/", kind: "code",
      choices: ["^", "$", "\\b", "."],
      tests: { match: ["123"], noMatch: ["a123", "x 99"] },
      explain: "先頭の `^` と末尾の `$` で囲むと、文字列全体が数字のときだけマッチします。`\\b` だと「x 99」の 99 にもマッチします。",
      ref: "whole"
    },
    {
      id: "a04", q: "concat の中の cat にはマッチし、単語として独立した cat にはマッチしないようにします。空欄に入るのは?", code: "/____cat/", kind: "code",
      choices: ["\\B", "\\b", "^", "."],
      tests: { match: ["concat"], noMatch: ["cat food", "a cat"] },
      explain: "`\\B` は単語の境目ではない位置です。cat の前が英字のときだけマッチします。`.` だと「a cat」の「 cat」(空白と cat)にもマッチします。",
      ref: "wordb"
    },
    {
      id: "a05", q: "この正規表現にマッチする文字列は?", code: "/\\bcat\\b/", kind: "str",
      choices: ["a cat sat", "concat", "cats", "category"],
      explain: "`\\b` は単語の境目です。cat の前後が空白や文字列の端になっている「a cat sat」だけがマッチします。cats は t のあとに s が続いています。",
      ref: "wordb"
    },
    {
      id: "a06", q: "このコードの結果は?", code: '"cat concat cats".match(/\\bcat\\b/g)', kind: "code", run: true,
      choices: ['["cat"]', '["cat", "cat", "cat"]', '["cat", "cat"]', "null"],
      explain: "単語として独立した cat は先頭の1つだけです。concat の cat は前に n、cats の cat はうしろに s があるので、境目になりません。",
      ref: "wordb"
    },
    {
      id: "a07", q: "このコードの結果は?", code: '"a1\\nb2\\nc3".match(/^\\w/gm)', kind: "code", run: true,
      choices: ['["a", "b", "c"]', '["a"]', '["a", "1", "b", "2", "c", "3"]', "null"],
      explain: "`m` フラグがあると、`^` が各行の先頭にもマッチします。3行それぞれの先頭の1文字が取り出されます。`m` がなければ `[\"a\"]` です。",
      ref: "multiline"
    },
    {
      id: "a08", q: "このコードの結果は?", code: '"line1\\nline2".replace(/^/gm, "> ")', kind: "code", run: true,
      choices: ['"> line1\\n> line2"', '"> line1\\nline2"', '"line1\\nline2> "', '">line1\\n>line2"'],
      explain: "`^` は文字を食べない位置なので、置きかえると行の先頭に「> 」が差しこまれます。`m` と `g` があるので、2行とも先頭に入ります。",
      ref: "multiline"
    },
    {
      id: "a09", q: "\"a\\nb\"(2行めが b)の b の前でも `^` がマッチするようにします。空欄に入るフラグは?", code: "/^b/____", kind: "code",
      choices: ["m", "g", "i", "s"],
      tests: { match: ["a\nb"], noMatch: ["a b", "ab"] },
      explain: "`m`(multiline)フラグで、`^` が改行の直後にもマッチします。`s` は `.` が改行にマッチするようになるフラグで、`^` には関係しません。",
      ref: "multiline"
    },
    {
      id: "a10", q: "`\\b` がマッチするのは?", kind: "text",
      choices: [
        "\\w の文字とそれ以外の文字(または文字列の端)の境目の位置",
        "空白文字1つ",
        "文字列の先頭の位置だけ",
        "改行文字"
      ],
      explain: "`\\b` は文字ではなく位置(幅0)にマッチします。空白そのものにマッチするのは `\\s` です。",
      ref: "wordb"
    },
    {
      id: "a11", q: "この正規表現にマッチしない文字列は?", code: "/^\\d{3}$/", kind: "str", pick: "noMatch",
      choices: ["1234", "123", "000", "999"],
      explain: "`^` と `$` で囲んでいるので、数字ちょうど3つだけの文字列にマッチします。1234 は4けたなので合いません。`^$` がなければ、1234 の一部にマッチします。",
      ref: "whole"
    },
    {
      id: "a12", q: "このコードの結果は?", code: '/^\\d+$/.test("123\\n")', kind: "code", run: true,
      choices: ["false", "true", "null", '"123"'],
      explain: "JavaScript の `$` は、m フラグがなければ文字列の本当の末尾だけにマッチします。末尾に改行 `\\n` があるので false です。入力の前後の空白や改行は、先に `trim()` で取っておくと安全です。",
      ref: "dollar"
    },
    {
      id: "a13", q: "このコードの結果は?", code: '/\\b東京\\b/.test("東京へ行く")', kind: "code", run: true,
      choices: ["false", "true", "null", '"東京"'],
      explain: "`\\b` は `\\w`(半角の英数字と _)とそれ以外の境目です。「東京へ行く」には `\\w` の文字がないので、境目が1つもなく false になります。",
      ref: "wordb"
    },
    {
      id: "a14", q: "単語として独立した cat だけにマッチさせます。空欄に入るのは?", code: "/____cat\\b/", kind: "code",
      choices: ["\\b", "^", "\\B", "$"],
      tests: { match: ["a cat", "cat!"], noMatch: ["concat", "cats"] },
      explain: "cat の前後を `\\b` ではさみます。`^` だと「a cat」のように途中にある cat にマッチしません。`\\B` は境目ではない位置で、concat のほうにマッチします。",
      ref: "wordb"
    },
    {
      id: "a15", q: "数字だけでできた文字列にマッチさせます。空欄に入るのは?", code: "/^\\d+____/", kind: "code",
      choices: ["$", "^", "\\b", "."],
      tests: { match: ["2024", "7"], noMatch: ["2024年", "12a"] },
      explain: "末尾の位置 `$` まで数字が続く必要があります。`\\b` だと、数字と「年」の間も境目になるので 2024年 にマッチします。",
      ref: "whole"
    }
  ]
});


// =====================================================================
// 05 グループと選択
// =====================================================================
RGX.register("group", {
  cards: [
    {
      id: "alt", name: "|", read: "どれか(選択)",
      desc: "`A|B` は、A か B のどちらかにマッチします。3つ以上も並べられます。",
      examples: [
        ['"hotdog".match(/cat|dog/)[0]', '→ "dog"'],
        ['"Tom and Jerry".replace(/Tom|Jerry/g, "?")', '→ "? and ?"']
      ],
      notes: ["`|` はいちばん弱く結びつきます。`/^cat|dog$/` は「^cat」または「dog$」という意味です。全体にかけるには `/^(cat|dog)$/` と書きます。"]
    },
    {
      id: "group", name: "( )", read: "まとめる",
      desc: "かっこで囲んだ部分は1かたまりとして扱われます。`|` の範囲を区切ったり、まとめてくり返したりできます。中身はキャプチャ(記録)もされます(単元07)。",
      examples: [
        ['/^gr(a|e)y$/.test("grey")', "→ true"],
        ['/^(ab)+$/.test("ababab")', "→ true"]
      ]
    },
    {
      id: "group-quant", name: "(…)? (…){n}", read: "かたまりのくり返し",
      desc: "かっこのうしろにくり返しの記号を置くと、かたまり全体がくり返しの対象になります。",
      examples: [
        ['/^\\d+(\\.\\d+)?$/.test("3.14")', "→ true"],
        ['/^(ha){3}$/.test("hahaha")', "→ true"],
        ['"ababab".match(/ab+/)[0]', '→ "ab"(b だけがくり返し)']
      ]
    },
    {
      id: "noncap", name: "(?: )", read: "まとめるだけ",
      desc: "`(?:…)` は、まとめるだけで、キャプチャ(番号つきの記録)をしないかっこです。グループの番号がずれないので、くり返しや `|` の範囲を決めるだけのときに使います。",
      examples: [
        ['"2024-05".match(/(\\d+)-(?:\\d+)/)', '→ ["2024-05", "2024"]'],
        ['/^(?:ab)+$/.test("abab")', "→ true"]
      ]
    }
  ],
  questions: [
    {
      id: "g01", q: "この正規表現にマッチする文字列は?", code: "/cat|dog/", kind: "str",
      choices: ["hotdog", "cow", "ca", "do g"],
      explain: "`cat|dog` は cat か dog のどちらかです。hotdog の中に dog があります。",
      ref: "alt"
    },
    {
      id: "g02", q: "この正規表現にマッチする文字列は?", code: "/^(ab)+$/", kind: "str",
      choices: ["ababab", "abba", "aabb", "ab ab"],
      explain: "`(ab)+` は ab のかたまりを1回以上くり返します。`^$` で囲んでいるので、ab のくり返しだけでできた文字列にマッチします。",
      ref: "group"
    },
    {
      id: "g03", q: "この正規表現にマッチしない文字列は?", code: "/^(red|blue|green)$/", kind: "str", pick: "noMatch",
      choices: ["redblue", "red", "blue", "green"],
      explain: "かっこの中の3つのうち、どれか1つだけからなる文字列にマッチします。redblue は2つが続いているので、全体には合いません。",
      ref: "alt"
    },
    {
      id: "g04", q: "\"cat\" か \"dog\" だけの文字列にマッチする正規表現は?", kind: "regex",
      choices: ["/^(cat|dog)$/", "/^cat|dog$/", "/^[catdog]$/", "/^(cat)|(dog)$/"],
      tests: { match: ["cat", "dog"], noMatch: ["cats", "hotdog"] },
      explain: "`|` は弱く結びつくので、`/^cat|dog$/` は「先頭が cat」または「末尾が dog」になり、cats にもマッチします。`^ $` を両方にかけるには、かっこで `|` の範囲を区切ります。`[catdog]` は1文字です。",
      ref: "alt"
    },
    {
      id: "g05", q: "\"ha\" のくり返しだけの文字列(ha・haha・…)にマッチさせます。空欄に入るのは?", code: "/^(____)+$/", kind: "code",
      choices: ["ha", "h|a", "[ha]", "ha?"],
      tests: { match: ["ha", "hahaha"], noMatch: ["hah", "h", "ah"] },
      explain: "`(ha)+` で ha のかたまりを1回以上くり返します。`[ha]` や `h|a` は1文字ずつなので、hah や ah にもマッチしてしまいます。",
      ref: "group"
    },
    {
      id: "g06", q: "`(…)` と比べて、`(?:…)` の違いは?", kind: "text",
      choices: [
        "まとめるだけで、キャプチャ(番号つきの記録)をしない",
        "かっこの中を0回か1回にする",
        "かっこの中を先読みする",
        "かっこの中の大文字小文字を区別しない"
      ],
      explain: "`(?:…)` は「非キャプチャグループ」です。まとめる働きは `( )` と同じですが、`$1` などの番号がつきません。",
      ref: "noncap"
    },
    {
      id: "g07", q: "このコードの結果は?", code: '"2024-05".match(/(\\d+)-(?:\\d+)/).length', kind: "code", run: true,
      choices: ["2", "3", "1", "0"],
      explain: "結果の配列は、[0] がマッチ全体、[1] が1つめのキャプチャです。`(?:…)` はキャプチャしないので数に入らず、長さは2です。",
      ref: "noncap"
    },
    {
      id: "g08", q: "このコードの結果は?", code: '"Tom and Jerry".replace(/Tom|Jerry/g, "?")', kind: "code", run: true,
      choices: ['"? and ?"', '"? and Jerry"', '"?"', '"Tom and ?"'],
      explain: "`Tom|Jerry` は Tom か Jerry です。`g` があるので、両方とも「?」に置きかわります。",
      ref: "alt"
    },
    {
      id: "g09", q: "整数と、小数点つきの数(3・3.14)だけにマッチさせます。空欄に入るのは?", code: "/^\\d+(____\\d+)?$/", kind: "code",
      choices: ["\\.", ".", ",", "\\d"],
      tests: { match: ["3", "3.14"], noMatch: ["3.", "3.1.4", "3x5"] },
      explain: "`(\\.\\d+)?` で「点と数字」のかたまりを0回か1回にします。`.` だと 3x5 にもマッチします。",
      ref: "group-quant"
    },
    {
      id: "g10", q: "`/ab+/` と `/(ab)+/` の違いは?", kind: "text",
      choices: [
        "ab+ は b だけを、(ab)+ は ab のかたまりをくり返す",
        "どちらも ab のかたまりをくり返す",
        "ab+ は ab のかたまりを、(ab)+ は b だけをくり返す",
        "(ab)+ は a か b のどちらかをくり返す"
      ],
      explain: "くり返しの記号は直前の1つにかかります。ababab に対して、`ab+` は「ab」、`(ab)+` は「ababab」にマッチします。",
      ref: "group-quant"
    },
    {
      id: "g11", q: "このコードの結果は?", code: '"I like cats and dogs".match(/cat|dog/g)', kind: "code", run: true,
      choices: ['["cat", "dog"]', '["cats", "dogs"]', '["cat"]', "null"],
      explain: "cats の中の cat、dogs の中の dog にマッチします。s は正規表現にふくまれていないので、結果にも入りません。",
      ref: "alt"
    },
    {
      id: "g12", q: "\"cat\" か \"dog\" だけの文字列にマッチさせます。空欄に入るのは?", code: "/^(____)$/", kind: "code",
      choices: ["cat|dog", "[catdog]", "cat dog", "catdog"],
      tests: { match: ["cat", "dog"], noMatch: ["cats", "hotdog", "catdog"] },
      explain: "`|` で「cat または dog」です。かっこの中にあるので、`^` と `$` は両方の候補にかかります。`[catdog]` は1文字です。`dog|cat` と書いても正解です。",
      ref: "alt"
    },
    {
      id: "g13", q: "\"Mr.\" \"Mrs.\" \"Ms.\" だけにマッチする正規表現は?", kind: "regex",
      choices: ["/^M(r|rs|s)\\.$/", "/^Mr|Mrs|Ms\\.$/", "/^M[rs]\\.$/", "/^M(r|s)\\.$/"],
      tests: { match: ["Mr.", "Mrs.", "Ms."], noMatch: ["Mr", "Mx.", "Mrr."] },
      explain: "かっこで `|` の範囲を区切ると、「M、(r か rs か s)、点」になります。`/^Mr|Mrs|Ms\\.$/` は「先頭が Mr」などの意味になり、点のない Mr にもマッチします。`[rs]` や `(r|s)` は1文字なので Mrs. に合いません。",
      ref: "alt"
    },
    {
      id: "g14", q: "\"123\" と \"123-4567\" の形だけにマッチさせます。空欄に入るのは?", code: "/^\\d{3}(____\\d{4})?$/", kind: "code",
      choices: ["-", ".", "\\d", "|"],
      tests: { match: ["123", "123-4567"], noMatch: ["1234567", "123-", "123x4567"] },
      explain: "`(-\\d{4})?` で「ハイフンと4けた」のかたまりを、あってもなくてもよい部分にします。`.` だと 123x4567 にもマッチします。",
      ref: "group-quant"
    },
    {
      id: "g15", q: "2つめのかっこを、まとめるだけでキャプチャしないかっこにします。空欄に入るのは?", code: "/(\\d+)-(____\\d+)/", kind: "code",
      choices: ["?:", "?=", "?!", ":?"],
      explain: "`(?:…)` は非キャプチャグループです。`(?=…)` `(?!…)` は先読み(単元08)で、まとめるかっこではありません。",
      ref: "noncap"
    }
  ]
});


// =====================================================================
// 06 欲張りと控えめ
// =====================================================================
RGX.register("greedy", {
  cards: [
    {
      id: "greedy", name: ".* .+", read: "欲張り",
      desc: "`*` `+` `?` `{n,m}` は、ふつう「欲張り」です。できるだけ長くマッチしようとし、あとが合わないときだけ少しずつ戻します。",
      examples: [
        ['"<b>A</b>".match(/<.*>/)[0]', '→ "<b>A</b>"'],
        ['"「a」と「b」".match(/「.*」/)[0]', '→ "「a」と「b」"']
      ]
    },
    {
      id: "lazy", name: "*? +? ?? {n,m}?", read: "控えめ",
      desc: "くり返しの記号のうしろに `?` をつけると「控えめ」になり、できるだけ短くマッチします。",
      examples: [
        ['"<b>A</b>".match(/<.*?>/)[0]', '→ "<b>"'],
        ['"aaa".match(/a+?/)[0]', '→ "a"'],
        ['"「a」と「b」".match(/「.*?」/g)', '→ ["「a」", "「b」"]']
      ],
      notes: ["`+?` の `?` は「0回か1回」ではなく、控えめにする印です。"]
    },
    {
      id: "negclass-stop", name: "[^x]*", read: "x の手前で止める",
      desc: "「ある文字の手前まで」を取りたいときは、控えめの `.*?` のかわりに `[^x]*`(x 以外のくり返し)と書く方法もあります。x を越えないことがはっきりします。",
      examples: [
        ['"<a><b>".match(/<[^>]*>/g)', '→ ["<a>", "<b>"]'],
        ['"key=value; x=y".match(/^[^;]*/)[0]', '→ "key=value"']
      ]
    },
    {
      id: "leftmost", name: "左の位置が先", read: "どこから始まるか",
      desc: "正規表現は、文字列の左の位置から順に試し、最初にマッチできた位置で決まります。控えめにしても、始まる位置が右にずれることはありません。",
      examples: [
        ['"aab".match(/a*?b/)[0]', '→ "aab"'],
        ['"xaaay".replace(/a+?/, "-")', '→ "x-aay"']
      ]
    }
  ],
  questions: [
    {
      id: "r01", q: "このコードの結果は?", code: '"<b>A</b>".match(/<.*>/)[0]', kind: "code", run: true,
      choices: ['"<b>A</b>"', '"<b>"', '"<b>A"', '"b"'],
      explain: "`.*` は欲張りなので、まず最後まで取り、そこから戻って最後の `>` で止まります。文字列全体の「<b>A</b>」になります。",
      ref: "greedy"
    },
    {
      id: "r02", q: "このコードの結果は?", code: '"<b>A</b>".match(/<.*?>/)[0]', kind: "code", run: true,
      choices: ['"<b>"', '"<b>A</b>"', '"<b>A"', '"<>"'],
      explain: "`.*?` は控えめなので、できるだけ短く取ります。最初の `>` で止まって「<b>」になります。",
      ref: "lazy"
    },
    {
      id: "r03", q: "下の条件をすべて満たすようにします(\"<b>A</b>\" では \"<b>\" が、\"<ab>x>\" では \"<ab>\" が最初のマッチ)。空欄に入るのは?", code: "/<.____>/", kind: "code",
      choices: ["*?", "*", "+", "?"],
      tests: { first: [["<b>A</b>", "<b>"], ["<ab>x>", "<ab>"]] },
      explain: "`.*?` は控えめなので、最初の `>` で止まります。`.*` `.+` は欲張りで最後の `>` まで取り、`.?` は1文字までしか入らないので <ab> に合いません。`+?` と書いても正解です。",
      ref: "lazy"
    },
    {
      id: "r04", q: "このコードの結果は?", code: '"「a」と「b」".match(/「.*?」/g)', kind: "code", run: true,
      choices: ['["「a」", "「b」"]', '["「a」と「b」"]', '["a", "b"]', '["「a」"]'],
      explain: "`.*?` は控えめなので、それぞれ最初の「」」で止まります。`g` があるので、2つとも取り出されます。",
      ref: "lazy"
    },
    {
      id: "r05", q: "\"「a」と「b」\" に当てたとき、最初のマッチが \"「a」\" になるようにします。空欄に入るのは?", code: "/「____」/", kind: "code",
      choices: [".*?", ".*", ".+", "\\S*"],
      tests: { first: [["「a」と「b」", "「a」"], ["「」", "「」"]] },
      explain: "控えめの `.*?` で、最初の「」」までになります。`.*` `.+` `\\S*` は欲張りなので、最後の「」」まで取ってしまいます。`[^」]*` と書いても正解です。",
      ref: "lazy"
    },
    {
      id: "r06", q: "正規表現の「欲張り(greedy)」とは?", kind: "text",
      choices: [
        "くり返しが、できるだけ長くマッチしようとすること",
        "文字列の中のマッチを、すべて取り出すこと",
        "大文字と小文字の両方にマッチすること",
        "マッチした部分をすべてキャプチャすること"
      ],
      explain: "`*` `+` などは、ふつうできるだけ長く取ります(欲張り)。うしろに `?` をつけると、できるだけ短く取ります(控えめ)。すべてのマッチを取り出すのは `g` フラグです。",
      ref: "greedy"
    },
    {
      id: "r07", q: "このコードの結果は?", code: '"aaa".match(/a+?/)[0]', kind: "code", run: true,
      choices: ['"a"', '"aaa"', '"aa"', '""'],
      explain: "`+?` は控えめな「1回以上」なので、最少の1回だけ取ります。",
      ref: "lazy"
    },
    {
      id: "r08", q: "このコードの結果は?", code: '"aaa".match(/a*?/)[0]', kind: "code", run: true,
      choices: ['""', '"a"', '"aaa"', '"aa"'],
      explain: "`*?` は控えめな「0回以上」なので、0回(長さ0の文字列)で止まります。あとに続くパターンがないので、それ以上は取りません。",
      ref: "lazy"
    },
    {
      id: "r09", q: "このコードの結果は?", code: '"xaaay".replace(/a+?/, "-")', kind: "code", run: true,
      choices: ['"x-aay"', '"x-y"', '"x---y"', '"-aaay"'],
      explain: "`a+?` は a を1つだけ取ります。`g` もないので、最初の a 1つだけが「-」になります。`/a+/` なら「x-y」です。",
      ref: "lazy"
    },
    {
      id: "r10", q: "このコードの結果は?", code: '"aab".match(/a*?b/)[0]', kind: "code", run: true,
      choices: ['"aab"', '"b"', '"ab"', '"a"'],
      explain: "正規表現は左の位置から試します。先頭の位置で `a*?` を少しずつ増やすと「aab」でマッチできるので、それで決まります。控えめにしても、始まる位置が右の b にずれることはありません。",
      ref: "leftmost"
    },
    {
      id: "r11", q: "\"key=value; x=y\" から、最初の ; の手前まで(\"key=value\")を取り出す正規表現は?", kind: "regex",
      choices: ["/^[^;]*/", "/^.*;/", "/^.*/", "/^.+?/"],
      tests: { first: [["key=value; x=y", "key=value"], ["a;b;c", "a"]] },
      explain: "`[^;]*` は ; 以外の文字のくり返しなので、; の手前で止まります。`/^.*;/` は ; までふくみ、`/^.+?/` は1文字だけで止まります。",
      ref: "negclass-stop"
    },
    {
      id: "r12", q: "\"key=value; x=y\" に当てたとき、最初のマッチが \"key=value\" になるようにします。空欄に入るのは?", code: "/^[^____]*/", kind: "code",
      choices: [";", "=", "^", ","],
      tests: { first: [["key=value; x=y", "key=value"], ["a;b", "a"]] },
      explain: "`[^;]*` は ; 以外の文字のくり返しなので、最初の ; の手前で止まります。`[^=]*` だと「key」で止まります。",
      ref: "negclass-stop"
    },
    {
      id: "r13", q: "\"12345\" に当てたとき、最初のマッチが \"12\" になるようにします。空欄に入るのは?", code: "/\\d{2,4}____/", kind: "code",
      choices: ["?", "$", "\\b", "+"],
      tests: { first: [["12345", "12"], ["9876", "98"]] },
      explain: "`{2,4}?` は控えめな「2〜4回」なので、最少の2つで止まります。`/\\d{2,4}+/` は、くり返しを重ねた形になり、JavaScript では読めません。",
      ref: "lazy"
    },
    {
      id: "r14", q: "`+`(1回以上)を控えめにした書き方は?", kind: "code",
      choices: ["+?", "?+", "++", "+*"],
      explain: "くり返しの記号のうしろに `?` をつけます。`?+` `++` `+*` は、くり返しの記号を重ねた形で、JavaScript では読めない正規表現になります。",
      ref: "lazy"
    },
    {
      id: "r15", q: "\"<a><b>\" に当てたとき、最初のマッチが \"<a>\" になるようにします(控えめの ? は使わない)。空欄に入るのは?", code: "/<____>/", kind: "code",
      choices: ["[^>]*", ".*", ".+", "[>]*"],
      tests: { first: [["<a><b>", "<a>"], ["<p>x</p>", "<p>"]] },
      explain: "`[^>]*` は > 以外のくり返しなので、最初の > の手前で止まります。`.*` `.+` は欲張りで、最後の > まで取ってしまいます。",
      ref: "negclass-stop"
    }
  ]
});


// =====================================================================
// 07 キャプチャと置換
// =====================================================================
RGX.register("capture", {
  cards: [
    {
      id: "capture", name: "( ) と [1]", read: "キャプチャ",
      desc: "かっこ `( )` で囲んだ部分にマッチした文字は、記録(キャプチャ)されます。`match`(g なし)や `exec` の結果の `[1]` `[2]` … で取り出せます。",
      examples: [
        ['"2024-05-01".match(/(\\d+)-(\\d+)-(\\d+)/)[2]', '→ "05"'],
        ['"2024-05-01".match(/(\\d+)-(\\d+)-(\\d+)/)[0]', '→ "2024-05-01"']
      ],
      notes: ["番号は、左のかっこ `(` が出てくる順に 1, 2, 3 …。`[0]` はマッチ全体です。`(?:…)` には番号がつきません。"]
    },
    {
      id: "replace-dollar", name: "$1 $2 $&", read: "置きかえで使う",
      desc: "`replace` の置きかえの文字列の中では、`$1` `$2` … でキャプチャした文字を、`$&` でマッチ全体を使えます。",
      options: [
        ["$1", "1番目のグループ"],
        ["$&", "マッチ全体"],
        ["$$", "$ という文字"]
      ],
      examples: [
        ['"2024-05-01".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3/$2/$1")', '→ "01/05/2024"'],
        ['"cat".replace(/a/, "[$&]")', '→ "c[a]t"']
      ]
    },
    {
      id: "backref", name: "\\1", read: "後方参照",
      desc: "パターンの中で `\\1` と書くと、「1番目のグループにマッチしたのと同じ文字」にマッチします。",
      examples: [
        ['"hello".match(/(\\w)\\1/)[0]', '→ "ll"'],
        ['/^(\\d)\\1$/.test("77")', "→ true"],
        ['/^(\\d)\\1$/.test("78")', "→ false"]
      ],
      notes: ["`\\1` はパターンの中で、`$1` は置きかえの文字列の中で使います。"]
    },
    {
      id: "named", name: "(?<name>…) $<name>", read: "名前つきグループ",
      desc: "`(?<名前>…)` でグループに名前をつけられます。結果の `.groups.名前` で取り出し、置きかえでは `$<名前>` と書きます。",
      examples: [
        ['"2024-05".match(/(?<y>\\d+)-(?<m>\\d+)/).groups.m', '→ "05"'],
        ['"Taro Yamada".replace(/(?<first>\\w+) (?<last>\\w+)/, "$<last> $<first>")', '→ "Yamada Taro"']
      ],
      notes: ["パターンの中で名前で参照するときは `\\k<名前>` と書きます(例: `/(?<c>\\w)\\k<c>/`)。名前つきグループにも番号はつきます。"]
    },
    {
      id: "match-g", name: "match と g", read: "結果の形",
      desc: "`match` は、`g` がないと最初のマッチの詳しい結果(キャプチャつき)を、`g` があるとマッチした文字列だけの配列(キャプチャなし)を返します。どちらもマッチしなければ `null` です。すべてのマッチのキャプチャがほしいときは `matchAll` を使います。",
      examples: [
        ['"a1b2".match(/[a-z](\\d)/)', '→ ["a1", "1"]'],
        ['"a1b2".match(/[a-z](\\d)/g)', '→ ["a1", "b2"]'],
        ['[..."a1b2".matchAll(/[a-z](\\d)/g)].map(m => m[1])', '→ ["1", "2"]']
      ]
    }
  ],
  questions: [
    {
      id: "p01", q: "このコードの結果は?", code: '"2024-05-01".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3/$2/$1")', kind: "code", run: true,
      choices: ['"01/05/2024"', '"2024/05/01"', '"$3/$2/$1"', '"05/01/2024"'],
      explain: "$1 = 2024、$2 = 05、$3 = 01 です。置きかえの文字列「$3/$2/$1」に入れると「01/05/2024」になります。",
      ref: "replace-dollar"
    },
    {
      id: "p02", q: "\"2024-05-01\" を \"05/01/2024\"(月/日/年)に置きかえます。空欄に入るのは?", code: '"2024-05-01".replace(/(\\d+)-(\\d+)-(\\d+)/, "____")', kind: "code", run: true,
      expect: '"05/01/2024"',
      choices: ["$2/$3/$1", "$1/$2/$3", "$2/$1/$3", "2/3/1"],
      explain: "月は2番目、日は3番目、年は1番目のグループです。置きかえでは `$` のうしろに番号を書きます。",
      ref: "replace-dollar"
    },
    {
      id: "p03", q: "このコードの結果は?", code: '"2024-05-01".match(/(\\d+)-(\\d+)/)[2]', kind: "code", run: true,
      choices: ['"05"', '"2024"', '"2024-05"', '"01"'],
      explain: "`[0]` がマッチ全体の「2024-05」、`[1]` が 2024、`[2]` が 05 です。パターンは「数字-数字」までなので、01 はマッチにふくまれません。",
      ref: "capture"
    },
    {
      id: "p04", q: "この正規表現にマッチする文字列は?", code: "/^(\\w)\\1$/", kind: "str",
      choices: ["aa", "ab", "a1", "aaa"],
      explain: "`\\1` は1番目のグループと同じ文字です。同じ文字が2つだけ並んだ aa にマッチします。",
      ref: "backref"
    },
    {
      id: "p05", q: "月(05)を取り出します。空欄に入るのは?", code: '"2024-05".match(/(?<year>\\d+)-(?<month>\\d+)/).groups.____', kind: "code", run: true,
      expect: '"05"',
      choices: ["month", "m", "$2", "2"],
      explain: "名前つきグループの中身は、`.groups.名前` で取り出します。名前はパターンの中の `(?<month>…)` と同じ綴りにします。",
      ref: "named"
    },
    {
      id: "p06", q: "このコードの結果は?", code: '"2024-05".match(/(?<y>\\d+)-(?<m>\\d+)/).groups.m', kind: "code", run: true,
      choices: ['"05"', '"2024"', '"m"', "undefined"],
      explain: "`(?<m>…)` で m という名前をつけたグループは、`.groups.m` で取り出せます。",
      ref: "named"
    },
    {
      id: "p07", q: "このコードの結果は?", code: '"Taro Yamada".replace(/(?<first>\\w+) (?<last>\\w+)/, "$<last> $<first>")', kind: "code", run: true,
      choices: ['"Yamada Taro"', '"Taro Yamada"', '"last first"', '"$<last> $<first>"'],
      explain: "置きかえの文字列の `$<名前>` に、名前つきグループの中身が入ります。順番を入れかえて「Yamada Taro」になります。",
      ref: "named"
    },
    {
      id: "p08", q: "\"John Smith\" を \"Smith, John\" に置きかえます。空欄に入るのは?", code: '"John Smith".replace(/(\\w+) (\\w+)/, "____")', kind: "code", run: true,
      expect: '"Smith, John"',
      choices: ["$2, $1", "$1, $2", "$2 $1", "2, 1"],
      explain: "姓(Smith)は2番目、名(John)は1番目のグループです。カンマと空白は、置きかえの文字列にそのまま書きます。",
      ref: "replace-dollar"
    },
    {
      id: "p09", q: "このコードの結果は?", code: '"a1b2".match(/[a-z](\\d)/g)', kind: "code", run: true,
      choices: ['["a1", "b2"]', '["1", "2"]', '["a1", "1", "b2", "2"]', '["a1", "1"]'],
      explain: "`g` つきの `match` は、マッチした文字列だけの配列を返し、キャプチャはふくみません。キャプチャもほしいときは `matchAll` を使います。",
      ref: "match-g"
    },
    {
      id: "p10", q: "このコードの結果は?", code: '"a1b2".match(/[a-z](\\d)/)', kind: "code", run: true,
      choices: ['["a1", "1"]', '["a1", "b2"]', '["1"]', '["a1"]'],
      explain: "`g` なしの `match` は、最初のマッチの結果です。[0] がマッチ全体の a1、[1] がキャプチャの 1 です。",
      ref: "match-g"
    },
    {
      id: "p11", q: "マッチした文字を [ ] で囲みます。結果が \"c[a]t\" になるように、空欄に入るのは?", code: '"cat".replace(/a/, "[____]")', kind: "code", run: true,
      expect: '"c[a]t"',
      choices: ["$&", "$0", "&", "$1"],
      explain: "置きかえの文字列の `$&` は、マッチ全体です。`$0` は特別な意味がなく、そのまま「$0」と出ます。グループがないので `$1` も「$1」のままです。",
      ref: "replace-dollar"
    },
    {
      id: "p12", q: "`\\1` と `$1` の使い分けは?", kind: "text",
      choices: [
        "\\1 はパターンの中、$1 は置きかえの文字列の中で、1番目のグループを指す",
        "\\1 は置きかえの文字列の中、$1 はパターンの中で使う",
        "どちらも同じで、どこで使ってもよい",
        "\\1 は1文字め、$1 は1行めを指す"
      ],
      explain: "パターンの中の `\\1` は後方参照、置きかえの文字列の `$1` はキャプチャの中身です。`replace(/(\\w)\\1/, \"$1\")` のように両方を使うこともあります。",
      ref: "backref"
    },
    {
      id: "p13", q: "同じ数字が2つ並んだ文字列(11・77 など)だけにマッチさせます。空欄に入るのは?", code: "/^(\\d)____$/", kind: "code",
      choices: ["\\1", "$1", "\\d", "(\\d)"],
      tests: { match: ["11", "77"], noMatch: ["12", "1"] },
      explain: "パターンの中で1番目のグループと同じ文字を指すのは `\\1` です。`\\d` や `(\\d)` だと、12 のように違う数字にもマッチします。",
      ref: "backref"
    },
    {
      id: "p14", q: "このコードの結果は?", code: '"aa bb cd".match(/(\\w)\\1/g)', kind: "code", run: true,
      choices: ['["aa", "bb"]', '["a", "b"]', '["aa", "bb", "cd"]', '["aa"]'],
      explain: "同じ文字が2つ続く aa と bb がマッチします。cd は違う文字です。`g` つきなので、マッチした文字列の配列になります。",
      ref: "backref"
    },
    {
      id: "p15", q: "同じ単語が空白をはさんで続くところ(\"the the\" など)にマッチする正規表現は?", kind: "regex",
      choices: ["/\\b(\\w+) \\1\\b/", "/\\b(\\w+) $1\\b/", "/\\b\\w+ \\w+\\b/", "/(\\w) \\1/"],
      tests: { match: ["the the", "go go"], noMatch: ["the cat", "the then"] },
      explain: "`(\\w+)` でとらえた単語と同じものを `\\1` で指します。`$1` はパターンの中では後方参照になりません。`/(\\w) \\1/` は1文字ずつなので「the the」には合いません。",
      ref: "backref"
    }
  ]
});


// =====================================================================
// 08 先読み・後読みとフラグ
// =====================================================================
RGX.register("lookaround", {
  cards: [
    {
      id: "lookahead", name: "(?=…)", read: "肯定先読み",
      desc: "`X(?=Y)` は、うしろに Y が続く X にマッチします。Y は確かめるだけで、マッチの結果にはふくまれません(幅0)。",
      examples: [
        ['"100円 200ドル".match(/\\d+(?=円)/g)', '→ ["100"]']
      ]
    },
    {
      id: "neg-lookahead", name: "(?!…)", read: "否定先読み",
      desc: "`X(?!Y)` は、うしろに Y が続かない X にマッチします。",
      examples: [
        ['/^(?!test)\\w+$/.test("best")', "→ true"],
        ['"100円 200ドル".match(/\\d+(?!円)/g)', '→ ["10", "200"]'],
        ['"100円 200ドル".match(/\\d+(?![\\d円])/g)', '→ ["200"]']
      ],
      notes: ["くり返しのあとに `(?!…)` を置くと、1文字戻して条件を満たそうとすることがあります(2つめの例の \"10\")。3つめの例のように、数字も続かないことにすると防げます。"]
    },
    {
      id: "lookbehind", name: "(?<=…)", read: "肯定後読み",
      desc: "`(?<=Y)X` は、前に Y がある X にマッチします。Y はマッチの結果にふくまれません。",
      examples: [
        ['"$30 and 40".match(/(?<=\\$)\\d+/g)', '→ ["30"]'],
        ['"price: 500".replace(/(?<=: )\\d+/, "***")', '→ "price: ***"']
      ]
    },
    {
      id: "neg-lookbehind", name: "(?<!…)", read: "否定後読み",
      desc: "`(?<!Y)X` は、前に Y がない X にマッチします。",
      examples: [
        ['"a1 b2 12".match(/(?<![a-z])\\d/g)', '→ ["1", "2"]']
      ]
    },
    {
      id: "flags-gi", name: "g i", read: "よく使うフラグ",
      desc: "リテラルの最後の `/` のうしろにつけるフラグで、動きを変えます。いくつでも組み合わせられます(`/…/gi`)。",
      options: [
        ["g", "すべてのマッチを扱う(global)"],
        ["i", "大文字と小文字を区別しない(ignore case)"]
      ],
      examples: [
        ['"a-b-c".replace(/-/, "+")', '→ "a+b-c"'],
        ['"a-b-c".replace(/-/g, "+")', '→ "a+b+c"'],
        ['"Apple APPLE".match(/apple/gi)', '→ ["Apple", "APPLE"]']
      ],
      notes: ["g つきの正規表現を変数に入れて `test` を何度も呼ぶと、前回の続きの位置(`lastIndex`)から探すので、同じ文字列でも結果が変わることがあります。"]
    },
    {
      id: "flags-msu", name: "m s u", read: "そのほかのフラグ",
      desc: "行・改行・Unicode の扱いを変えるフラグです。",
      options: [
        ["m", "^ $ が各行の先頭・末尾にもマッチ(単元04)"],
        ["s", ". が改行にもマッチ(dotAll)"],
        ["u", "Unicode の文字単位で扱う。絵文字なども1文字になる"]
      ],
      examples: [
        ['/a.c/s.test("a\\nc")', "→ true"],
        ['/^.$/.test("😀")', "→ false"],
        ['/^.$/u.test("😀")', "→ true"]
      ],
      notes: ["絵文字の多くは、JavaScript の文字列の中では2つぶん(サロゲートペア)として数えられます。`u` をつけると1文字として扱います。"]
    }
  ],
  questions: [
    {
      id: "k01", q: "このコードの結果は?", code: '"100円 200ドル".match(/\\d+(?=円)/g)', kind: "code", run: true,
      choices: ['["100"]', '["100円"]', '["100", "200"]', '["200"]'],
      explain: "`(?=円)` は、うしろに「円」が続くことを確かめるだけで、円はマッチにふくまれません。200 のうしろは「ド」なので合いません。",
      ref: "lookahead"
    },
    {
      id: "k02", q: "このコードの結果は?", code: '"100円 200ドル".match(/\\d+(?!円)/g)', kind: "code", run: true,
      choices: ['["10", "200"]', '["200"]', '["100", "200"]', "null"],
      explain: "100 のうしろは円なので合いませんが、`\\d+` を1文字戻した「10」のうしろは 0 なので、条件を満たします。200 のうしろは「ド」なので、200 はそのままマッチします。数字の途中で止まらないようにするには `/\\d+(?![\\d円])/` と書きます。",
      ref: "neg-lookahead"
    },
    {
      id: "k03", q: "このコードの結果は?", code: '"$30 and 40".match(/(?<=\\$)\\d+/g)', kind: "code", run: true,
      choices: ['["30"]', '["$30"]', '["30", "40"]', '["40"]'],
      explain: "`(?<=\\$)` は、前に $ があることを確かめるだけです。$ はマッチにふくまれません。40 の前には $ がありません。",
      ref: "lookbehind"
    },
    {
      id: "k04", q: "\"$30 and 40\" に当てたとき、最初のマッチが \"30\"($ のあとの数字)になるようにします。空欄に入るのは?", code: "/(?____\\$)\\d+/", kind: "code",
      choices: ["<=", "=", "<!", ":"],
      tests: { first: [["$30 and 40", "30"]], noMatch: ["30 and 40"] },
      explain: "`(?<=\\$)` は肯定後読みで、前に $ があることを確かめます。`(?<!\\$)` は「前に $ がない」なので、30 の 0 にマッチします。`(?:\\$)` だと $ もマッチにふくまれます。",
      ref: "lookbehind"
    },
    {
      id: "k05", q: "8文字以上で、数字を1つ以上ふくむ文字列にマッチさせます。空欄に入るのは?", code: "/^(?=.*____).{8,}$/", kind: "code",
      choices: ["\\d", "\\D", "\\w", "$"],
      tests: { match: ["abcdefg1", "12345678"], noMatch: ["abcdefgh", "a1"] },
      explain: "先頭で `(?=.*\\d)` と先読みすると、「どこかに数字がある」ことを確かめられます。先読みは位置を動かさないので、そのあとの `.{8,}$` で長さを調べられます。",
      ref: "lookahead"
    },
    {
      id: "k06", q: "先読み `(?=…)` の特徴として正しいのは?", kind: "text",
      choices: [
        "条件を確かめるだけで、その文字はマッチの結果にふくまれない",
        "かっこの中の文字も、マッチの結果にふくまれる",
        "かっこの中は、前にある文字を確かめる",
        "かっこの中の文字は、キャプチャされて $1 で使える"
      ],
      explain: "先読みは幅0で、位置を進めません。前にある文字を確かめるのは後読み `(?<=…)` です。先読みはキャプチャもしません。",
      ref: "lookahead"
    },
    {
      id: "k07", q: "この正規表現にマッチする文字列は?", code: "/^(?!test)\\w+$/", kind: "str",
      choices: ["best", "test", "testing", "test1"],
      explain: "`^(?!test)` は「先頭が test で始まらない」という条件です。test で始まる3つはマッチしません。",
      ref: "neg-lookahead"
    },
    {
      id: "k08", q: "このコードの結果は?", code: '"Apple apple APPLE".match(/apple/gi).length', kind: "code", run: true,
      choices: ["3", "1", "2", "0"],
      explain: "`i` で大文字小文字を区別せず、`g` ですべてのマッチを取り出すので、3つともマッチします。",
      ref: "flags-gi"
    },
    {
      id: "k09", q: "\"HELLO\" や \"Hello\" にもマッチさせます。空欄に入るフラグは?", code: "/^hello$/____", kind: "code",
      choices: ["i", "g", "m", "s"],
      tests: { match: ["HELLO", "Hello", "hello"], noMatch: ["hello!"] },
      explain: "`i` フラグで大文字と小文字を区別しなくなります。`g` はすべてのマッチ、`m` は行ごとの ^ $、`s` は改行にマッチする `.` です。",
      ref: "flags-gi"
    },
    {
      id: "k11", q: "このコードの結果は?", code: '/a.c/s.test("a\\nc")', kind: "code", run: true,
      choices: ["true", "false", "null", "undefined"],
      explain: "`s` フラグがあると、`.` が改行 `\\n` にもマッチします。`s` がなければ false です。",
      ref: "flags-msu"
    },
    {
      id: "k12", q: "このコードの結果は?", code: '"a1 b2 12".match(/(?<![a-z])\\d/g)', kind: "code", run: true,
      choices: ['["1", "2"]', '["12"]', '["1", "2", "1", "2"]', "null"],
      explain: "前が英小文字ではない数字を探します。a1 の 1、b2 の 2 は前が英字なので合いません。12 の 1 は前が空白、2 は前が 1 なので、両方マッチします。",
      ref: "neg-lookbehind"
    },
    {
      id: "k13", q: "`.` が改行にもマッチするようにします。空欄に入るフラグは?", code: "/a.c/____", kind: "code",
      choices: ["s", "m", "g", "u"],
      tests: { match: ["a\nc", "abc"], noMatch: ["ac"] },
      explain: "`s`(dotAll)フラグで、`.` が改行にもマッチします。`m` は ^ $ を行ごとにするフラグで、`.` には関係しません。",
      ref: "flags-msu"
    },
    {
      id: "k14", q: "このコードの結果は?", code: '/^.$/.test("😀")', kind: "code", run: true,
      choices: ["false", "true", "null", '"😀"'],
      explain: "この絵文字は、JavaScript の文字列の中では2つぶん(サロゲートペア)です。`u` フラグがないと `.` は半分ずつにしかマッチしないので、「1文字だけ」の `^.$` には合いません。`/^.$/u` なら true です。",
      ref: "flags-msu"
    },
    {
      id: "k15", q: "\"300円\" から、円は入れずに数字 \"300\" だけを取り出す正規表現は?", kind: "regex",
      choices: ["/\\d+(?=円)/", "/\\d+円/", "/(?<=円)\\d+/", "/\\d+(?!円)/"],
      tests: { first: [["300円", "300"], ["300ドル", null]] },
      explain: "`(?=円)` は円が続くことを確かめるだけなので、円はマッチにふくまれません。`/\\d+円/` は円までふくみ、`(?<=円)` は前に円がある数字を探します。`(?!円)` は「30」(うしろが 0)にマッチします。",
      ref: "lookahead"
    },
    {
      id: "k16", q: "\"500円 300ドル\" に当てたとき、最初のマッチが \"500\" になるようにします。空欄に入るのは?", code: "/\\d+(?____円)/", kind: "code",
      choices: ["=", "!", "<=", ":"],
      tests: { first: [["500円 300ドル", "500"]], noMatch: ["300ドル"] },
      explain: "`(?=円)` は肯定先読みです。`(?!円)` は「50」に、`(?:円)` は「500円」にマッチし、`\\d+(?<=円)` は、数字を読んだ位置の手前が円かを調べます。そこは必ず数字なので、決してマッチしません。",
      ref: "lookahead"
    }
  ]
});

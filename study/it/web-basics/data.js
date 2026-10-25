// Web道場: 12単元の定義・問題・用語帳のカード・コードの色分け。道場(index.html)と用語帳(reference.html)で共有する。
// 読み込む順番: shared/store.js → (shared/review.js →) data.js
// 復習プランナー(study/review/review-planner/index.html)もこのファイルを読み込む。グローバルは WEBD の1つだけ。
//
// ■ 単元の中身の登録(このファイルの後半)
//   WEBD.register("単元ID", { cards: [カード, …], questions: [問題, …] });
//
// ■ 用語帳のカード
//   {
//     id: "cors",                     // reference.html の id="card-cors" になる。問題の ref からも使う(全単元で重ならない)
//     name: "CORS",                   // 見出し
//     mono: true,                     // 省略可。見出しがコードの用語(ヘッダー名・関数名など)のとき等幅にする
//     en: "Cross-Origin Resource Sharing", // 正式名・英語名(.term-en)
//     desc: "説明",                    // `…` で囲んだところは <code> になる
//     code: [ブロック, …],             // 省略可。例のコード(下の「コードのブロック」)
//     options: [["語", "説明"], …],    // 省略可。opt-list(dt は等幅)
//     notes: ["注意", …]               // 省略可。注意
//   }
//
// ■ 問題
//   {
//     id: "h01",                      // 単元の中で重ならない名前
//     level: "basic",                 // "basic"(基礎) | "std"(標準) | "pro"(実務)
//     q: "問題文",                     // `…` で囲んだところは <code> になる
//     code: [ブロック, …],             // 省略可。問題のコード。____ は空欄
//     kind: "text",                   // 選択肢の種類。"text" = 説明文 / "code" = ヘッダー名・タグ・値など(等幅)
//     choices: ["正解", "誤答", "誤答", "誤答"],   // ちょうど4つ。先頭が正解。並びはページが毎回まぜる
//     explain: "解説",                 // `…` で囲んだところは <code> になる
//     ref: "cors"                     // 用語帳のカードの id
//   }
//
// ■ コードのブロック
//   { cap: "リクエスト", lang: "http", text: "GET / HTTP/1.1\nHost: example.com" }
//   cap は省略可(上端のラベル)。lang は LANGS のどれか。1行は36文字以内を目安にする。
var WEBD = (function () {
  "use strict";

  var STATS_KEY = "webBasicsStats";
  var SETTINGS_KEY = "webBasicsSettings";
  var COUNT = 10;
  var KINDS = ["text", "code"];
  var BLANK = "____";
  var PH = "";   // 色分けのあいだだけ、空欄をこの1文字に置きかえる

  var LEVELS = [
    { id: "basic", name: "基礎", mark: "●○○" },
    { id: "std", name: "標準", mark: "●●○" },
    { id: "pro", name: "実務", mark: "●●●" }
  ];
  var LEVEL_IDS = LEVELS.map(function (l) { return l.id; });
  var levelById = {};
  LEVELS.forEach(function (l) { levelById[l.id] = l; });
  function level(id) { return levelById.hasOwnProperty(id) ? levelById[id] : null; }

  // ID は保存データのキーなので変えない
  var UNITS = [
    { id: "url-dns", no: "01", name: "URLとDNS", short: "URLとDNS", level: "basic", keys: "URLの各部 · DNS · A/CNAME · TTL" },
    { id: "http", no: "02", name: "HTTPの基本", short: "HTTP基本", level: "basic", keys: "メソッド · ステータス · ヘッダー · HTTP/3" },
    { id: "render", no: "03", name: "ブラウザが表示するまで", short: "表示の流れ", level: "std", keys: "DOM · CSSOM · レイアウト · defer" },
    { id: "html", no: "04", name: "HTMLとセマンティクス", short: "HTML", level: "basic", keys: "DOCTYPE · main · label · alt" },
    { id: "css", no: "05", name: "CSSのセレクタとレイアウト", short: "CSS", level: "basic", keys: "詳細度 · ボックス · flex · grid" },
    { id: "js-dom", no: "06", name: "JavaScriptとDOM・非同期", short: "JSとDOM", level: "std", keys: "DOM · イベント · Promise · fetch" },
    { id: "state", no: "07", name: "Cookie・セッション・ストレージ", short: "Cookie等", level: "std", keys: "Cookie属性 · SameSite · Storage · JWT" },
    { id: "security", no: "08", name: "HTTPSと攻撃対策", short: "攻撃対策", level: "std", keys: "TLS · XSS · CSRF · SQLi" },
    { id: "origin", no: "09", name: "オリジン・CORS・CSP", short: "CORS・CSP", level: "pro", keys: "オリジン · CORS · プリフライト · CSP" },
    { id: "cache", no: "10", name: "キャッシュとCDN", short: "キャッシュ", level: "pro", keys: "Cache-Control · ETag · 304 · CDN" },
    { id: "perf", no: "11", name: "表示速度", short: "表示速度", level: "pro", keys: "LCP · INP · CLS · lazy · preload" },
    { id: "a11y-seo", no: "12", name: "アクセシビリティとSEO", short: "a11y・SEO", level: "std", keys: "alt · コントラスト · ARIA · canonical" }
  ];

  var byId = {};
  UNITS.forEach(function (u) { byId[u.id] = u; });
  var content = {};
  var cardIndex = {};

  function unit(id) { return byId.hasOwnProperty(id) ? byId[id] : null; }

  function register(id, data) {
    if (!unit(id) || !data || typeof data !== "object") {
      if (typeof console !== "undefined" && console.warn) console.warn("WEBD.register: 登録できません: " + id);
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
  function cardUnit(id) { return cardIndex.hasOwnProperty(id) ? cardIndex[id].unitId : null; }

  // ---------- コードの色分け(画面の部品は各ページで作る) ----------
  // tokenize(lang, text) → [{ t: "kw" | "fn" | "str" | "num" | "cm" | "pn" | "st-ok" | "st-ng" | "blank" | "", s: "文字" }, …]
  var LANGS = ["http", "html", "css", "js", "json", "url", "dns", "csp", "text"];

  function push(out, t, s) {
    if (!s) return;
    var last = out[out.length - 1];
    if (last && last.t === t && t === "") last.s += s; else out.push({ t: t, s: s });
  }

  // JavaScript / JSON
  var JS_KW = {};
  ("const let var function return if else for of in while do async await new true false null undefined " +
   "typeof instanceof class this try catch finally throw import export from default break continue switch case").split(" ")
    .forEach(function (k) { JS_KW[k] = true; });
  function tokJs(src, out, json) {
    var i = 0, n = src.length, m;
    while (i < n) {
      var rest = src.slice(i);
      if ((m = /^\/\/[^\n]*/.exec(rest)) || (m = /^\/\*[\s\S]*?(?:\*\/|$)/.exec(rest))) {
        push(out, "cm", m[0]);
      } else if ((m = /^`(?:\\[\s\S]|[^\\`])*`?/.exec(rest)) || (m = /^"(?:\\.|[^\\"\n])*"?/.exec(rest)) || (m = /^'(?:\\.|[^\\'\n])*'?/.exec(rest))) {
        push(out, json && /^\s*:/.test(src.slice(i + m[0].length)) ? "fn" : "str", m[0]);
      } else if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
        var after = src.slice(i + m[0].length);
        push(out, JS_KW[m[0]] ? "kw" : /^\s*\(/.test(after) ? "fn" : "", m[0]);
      } else if ((m = /^\d+(?:\.\d+)?/.exec(rest))) {
        push(out, "num", m[0]);
      } else {
        m = [rest.charAt(0)];
        push(out, "", m[0]);
      }
      i += m[0].length;
    }
  }

  // CSS
  function tokCssValue(src, out) {
    var i = 0, n = src.length, m;
    while (i < n) {
      var rest = src.slice(i);
      if ((m = /^\/\*[\s\S]*?(?:\*\/|$)/.exec(rest))) push(out, "cm", m[0]);
      else if ((m = /^"[^"\n]*"?/.exec(rest)) || (m = /^'[^'\n]*'?/.exec(rest))) push(out, "str", m[0]);
      else if ((m = /^!important/.exec(rest))) push(out, "kw", m[0]);
      else if ((m = /^#[0-9a-fA-F]{3,8}\b/.exec(rest))) push(out, "num", m[0]);
      else if ((m = /^-?[A-Za-z_][-\w]*(?=\()/.exec(rest))) push(out, "fn", m[0]);
      else if ((m = /^-?[A-Za-z_][-\w]*/.exec(rest))) push(out, "", m[0]);
      else if ((m = /^-?(?:\d+\.?\d*|\.\d+)(?:[A-Za-z]+|%)?/.exec(rest))) push(out, "num", m[0]);
      else { m = [rest.charAt(0)]; push(out, "", m[0]); }
      i += m[0].length;
    }
  }
  function tokCss(src, out) {
    var i = 0, n = src.length, m, state = "start";
    while (i < n) {
      var rest = src.slice(i), ch = src.charAt(i);
      if ((m = /^\s+/.exec(rest))) { push(out, "", m[0]); i += m[0].length; continue; }
      if ((m = /^\/\*[\s\S]*?(?:\*\/|$)/.exec(rest))) { push(out, "cm", m[0]); i += m[0].length; continue; }
      if (ch === "{" || ch === "}" || ch === ";") { push(out, "pn", ch); i++; state = "start"; continue; }
      if (state === "start") {
        if ((m = /^@[\w-]+/.exec(rest))) { push(out, "kw", m[0]); i += m[0].length; state = "value"; continue; }
        var stop = rest.search(/[{};]/);
        var seg = stop < 0 ? rest : rest.slice(0, stop);
        if (stop >= 0 && rest.charAt(stop) === "{") {
          // セレクタ
          var body = seg.replace(/\s+$/, "");
          push(out, "kw", body);
          i += body.length;
          continue;
        }
        if ((m = /^[-\w]+(?=\s*:)/.exec(rest))) {
          push(out, "fn", m[0]);
          i += m[0].length;
          var c = /^(\s*)(:)/.exec(src.slice(i));
          push(out, "", c[1]);
          push(out, "pn", c[2]);
          i += c[0].length;
          state = "value";
          continue;
        }
        push(out, "", ch);
        i++;
        continue;
      }
      // 値(と @media などの条件)。次の { } ; まで
      var end = rest.search(/[{};]/);
      var val = end < 0 ? rest : rest.slice(0, end);
      tokCssValue(val, out);
      i += val.length;
    }
  }

  // HTML
  function tokHtml(src, out) {
    var i = 0, n = src.length, m;
    while (i < n) {
      var rest = src.slice(i);
      if ((m = /^<!--[\s\S]*?(?:-->|$)/.exec(rest))) { push(out, "cm", m[0]); i += m[0].length; continue; }
      if ((m = /^<!DOCTYPE[^>]*>/i.exec(rest))) { push(out, "kw", m[0]); i += m[0].length; continue; }
      if ((m = /^(<\/?)([A-Za-z][\w-]*|)/.exec(rest))) {
        var closing = m[1] === "</", tag = m[2].toLowerCase();
        push(out, "pn", m[1]);
        push(out, "kw", m[2]);
        i += m[0].length;
        var afterEq = false;
        while (i < n) {
          var r = src.slice(i), a;
          if ((a = /^\s+/.exec(r))) { push(out, "", a[0]); }
          else if ((a = /^\/?>/.exec(r))) { push(out, "pn", a[0]); i += a[0].length; break; }
          else if ((a = /^"[^"]*"?/.exec(r)) || (a = /^'[^']*'?/.exec(r))) { push(out, "str", a[0]); afterEq = false; }
          else if (afterEq && (a = /^[^\s>]+/.exec(r))) { push(out, "str", a[0]); afterEq = false; }
          else if ((a = /^=/.exec(r))) { push(out, "pn", a[0]); afterEq = true; }
          else if ((a = /^[^\s=>\/"']+/.exec(r))) { push(out, "fn", a[0]); }
          else { a = [r.charAt(0)]; push(out, "", a[0]); }
          i += a[0].length;
        }
        // <script> と <style> の中身は、それぞれの言語で色分けする
        if (!closing && (tag === "script" || tag === "style")) {
          var close = src.slice(i).search(new RegExp("</" + tag, "i"));
          var inner = close < 0 ? src.slice(i) : src.slice(i, i + close);
          if (tag === "script") tokJs(inner, out, false); else tokCss(inner, out);
          i += inner.length;
        }
        continue;
      }
      if ((m = /^&(?:#x?[0-9a-fA-F]+|[A-Za-z]+);/.exec(rest))) { push(out, "num", m[0]); i += m[0].length; continue; }
      m = /^[^<&]+/.exec(rest) || [rest.charAt(0)];
      push(out, "", m[0]);
      i += m[0].length;
    }
  }

  // HTTP のメッセージ(開始行・ヘッダー・空行・本文)
  function tokHeaderValue(src, out) {
    var i = 0, n = src.length, m;
    while (i < n) {
      var rest = src.slice(i);
      if ((m = /^"[^"]*"?/.exec(rest)) || (m = /^'[^']*'?/.exec(rest))) push(out, "str", m[0]);
      else if ((m = /^[A-Za-z_][\w.\/+*-]*/.exec(rest))) push(out, "", m[0]);
      else if ((m = /^\d+(?:\.\d+)?/.exec(rest))) push(out, "num", m[0]);
      else { m = [rest.charAt(0)]; push(out, "", m[0]); }
      i += m[0].length;
    }
  }
  function statusType(code) {
    if (/^[123]\d\d$/.test(code)) return "st-ok";
    if (/^[45]\d\d$/.test(code)) return "st-ng";
    return "";
  }
  function tokHttp(src, out) {
    var lines = src.split("\n"), phase = "start", m;
    for (var k = 0; k < lines.length; k++) {
      var line = lines[k];
      if (k > 0) push(out, "", "\n");
      if (phase === "body") {
        var body = lines.slice(k).join("\n"), t = body.replace(/^\s+/, "");
        if (/^[{[]/.test(t)) tokJs(body, out, true);
        else if (/^</.test(t)) tokHtml(body, out);
        else tokHeaderValue(body, out);
        return;
      }
      if (phase === "start") {
        phase = "head";
        if ((m = /^(HTTP\/[\d.]+)(\s+)(\S+)(.*)$/.exec(line))) {
          push(out, "pn", m[1]); push(out, "", m[2]); push(out, statusType(m[3]), m[3]); push(out, "", m[4]);
          continue;
        }
        if ((m = /^([A-Z]+)(\s+)(\S+)(\s+)(HTTP\/[\d.]+)$/.exec(line))) {
          push(out, "kw", m[1]); push(out, "", m[2]); push(out, "", m[3]); push(out, "", m[4]); push(out, "pn", m[5]);
          continue;
        }
      }
      if (line === "") { phase = "body"; continue; }
      if ((m = /^([\w-]+)(:)(.*)$/.exec(line))) {
        push(out, "fn", m[1]); push(out, "pn", m[2]); tokHeaderValue(m[3], out);
      } else if (/^\s*…\s*$/.test(line)) {
        push(out, "pn", line);
      } else {
        tokHeaderValue(line, out);
      }
    }
  }

  // URL: スキーム・ホスト・ポート・パス・クエリ・フラグメントを分ける
  function tokUrl(src, out) {
    src.split("\n").forEach(function (line, k) {
      if (k > 0) push(out, "", "\n");
      var m = /^([A-Za-z][\w+.-]*:)(\/\/)([^\/?#:\s]*)(:[\d]+)?([^?#\s]*)(\?[^#\s]*)?(#\S*)?(.*)$/.exec(line);
      if (!m) m = /^()()()()(\/[^?#\s]*)?(\?[^#\s]*)?(#\S*)?(.*)$/.exec(line);
      if (!m || (!m[1] && !m[5] && !m[6] && !m[7])) { push(out, "", line); return; }
      push(out, "kw", m[1]); push(out, "pn", m[2]); push(out, "fn", m[3]); push(out, "num", m[4] || "");
      push(out, "", m[5] || ""); push(out, "str", m[6] || ""); push(out, "cm", m[7] || ""); push(out, "", m[8] || "");
    });
  }

  // DNS のレコード(ゾーンファイルの1行の形)
  var DNS_TYPES = { A: 1, AAAA: 1, CNAME: 1, MX: 1, TXT: 1, NS: 1, SOA: 1, CAA: 1, PTR: 1, HTTPS: 1 };
  function tokDns(src, out) {
    src.split("\n").forEach(function (line, k) {
      if (k > 0) push(out, "", "\n");
      var i = 0, n = line.length, first = true, m;
      while (i < n) {
        var rest = line.slice(i);
        if ((m = /^;.*/.exec(rest))) push(out, "cm", m[0]);
        else if ((m = /^\s+/.exec(rest))) push(out, "", m[0]);
        else if ((m = /^"[^"]*"?/.exec(rest))) { push(out, "str", m[0]); first = false; }
        else {
          m = /^\S+/.exec(rest);
          var w = m[0];
          if (first) push(out, "fn", w);
          else if (DNS_TYPES[w]) push(out, "kw", w);
          else if (w === "IN") push(out, "pn", w);
          else if (/\d/.test(w) && /^[\d.:a-fA-F]+$/.test(w)) push(out, "num", w);
          else push(out, "", w);
          first = false;
        }
        i += m[0].length;
      }
    });
  }

  // CSP の値(ディレクティブ名 → 値 … ; で区切る)
  function tokCsp(src, out) {
    var i = 0, n = src.length, m, atName = true;
    while (i < n) {
      var rest = src.slice(i);
      if ((m = /^\s+/.exec(rest))) push(out, "", m[0]);
      else if (rest.charAt(0) === ";") { m = [";"]; push(out, "pn", ";"); atName = true; }
      else if ((m = /^'[^']*'?/.exec(rest))) { push(out, "str", m[0]); atName = false; }
      else {
        m = /^[^\s;']+/.exec(rest);
        push(out, atName ? "fn" : "", m[0]);
        atName = false;
      }
      i += m[0].length;
    }
  }

  function tokenize(lang, text) {
    var src = String(text == null ? "" : text).split(BLANK).join(PH);
    var raw = [];
    if (lang === "http") tokHttp(src, raw);
    else if (lang === "html") tokHtml(src, raw);
    else if (lang === "css") tokCss(src, raw);
    else if (lang === "js") tokJs(src, raw, false);
    else if (lang === "json") tokJs(src, raw, true);
    else if (lang === "url") tokUrl(src, raw);
    else if (lang === "dns") tokDns(src, raw);
    else if (lang === "csp") tokCsp(src, raw);
    else push(raw, "", src);
    // 空欄を戻す
    var out = [];
    raw.forEach(function (tk) {
      if (tk.s.indexOf(PH) < 0) { out.push(tk); return; }
      tk.s.split(PH).forEach(function (part, k) {
        if (k > 0) out.push({ t: "blank", s: BLANK });
        if (part) out.push({ t: tk.t, s: part });
      });
    });
    return out;
  }
  // 問題・カードの code を、ブロックの配列にそろえる
  function blocksOf(code) {
    if (!code) return [];
    return Array.isArray(code) ? code : [code];
  }

  // ---------- 形を確かめる。問題点の一覧を返す(なければ空の配列)。検算スクリプトもこれを使う ----------
  function checkBlocks(code, where) {
    var errs = [];
    if (code === undefined) return errs;
    var list = blocksOf(code);
    if (list.length === 0) errs.push(where + " が空");
    list.forEach(function (b, i) {
      if (!b || typeof b !== "object") { errs.push(where + "[" + i + "] がオブジェクトではない"); return; }
      if (LANGS.indexOf(b.lang) < 0) errs.push(where + "[" + i + "] の lang がおかしい: " + b.lang);
      if (typeof b.text !== "string" || !b.text) errs.push(where + "[" + i + "] の text が空");
      if (b.cap !== undefined && (typeof b.cap !== "string" || !b.cap)) errs.push(where + "[" + i + "] の cap が空");
    });
    return errs;
  }
  function checkQuestion(q) {
    var errs = [];
    if (!q || typeof q !== "object") return ["問題がオブジェクトではない"];
    if (typeof q.id !== "string" || !q.id) errs.push("id がない");
    if (!level(q.level)) errs.push("level がおかしい: " + q.level);
    if (typeof q.q !== "string" || !q.q) errs.push("q がない");
    if (KINDS.indexOf(q.kind) < 0) errs.push("kind がおかしい: " + q.kind);
    errs = errs.concat(checkBlocks(q.code, "code"));
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
    if (typeof q.explain !== "string" || !q.explain) errs.push("explain がない");
    if (!q.ref || !card(q.ref)) errs.push("ref のカードがない: " + q.ref);
    return errs;
  }
  function checkCard(c) {
    var errs = [];
    if (!c || typeof c !== "object") return ["カードがオブジェクトではない"];
    if (typeof c.id !== "string" || !/^[a-z0-9-]+$/.test(c.id)) errs.push("id がおかしい: " + c.id);
    if (typeof c.name !== "string" || !c.name) errs.push("name がない");
    if (typeof c.en !== "string" || !c.en) errs.push("en がない");
    if (typeof c.desc !== "string" || !c.desc) errs.push("desc がない");
    errs = errs.concat(checkBlocks(c.code, "code"));
    if (c.options !== undefined && !(Array.isArray(c.options) && c.options.every(function (o) {
      return Array.isArray(o) && o.length === 2 && typeof o[0] === "string" && typeof o[1] === "string";
    }))) errs.push("options の形がおかしい");
    if (c.notes !== undefined && !(Array.isArray(c.notes) && c.notes.every(function (s) { return typeof s === "string" && s; }))) errs.push("notes の形がおかしい");
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
  // 単元の問題のうち、形が正しく、levels(難易度IDの配列。省略ならすべて)に入るもの
  function poolOf(unitId, levels) {
    var c = contentOf(unitId);
    if (!c) return [];
    return c.questions.filter(function (q) {
      return checkQuestion(q).length === 0 && (!levels || levels.indexOf(q.level) >= 0);
    });
  }
  function countOf(unitIds, levels) {
    return unitIds.reduce(function (sum, id) { return sum + poolOf(id, levels).length; }, 0);
  }

  function prepare(unitId, q) {
    var order = shuffle([0, 1, 2, 3]);
    return {
      unitId: unitId,
      id: q.id,
      level: q.level,
      q: q.q,
      code: blocksOf(q.code),
      kind: q.kind,
      choices: order.map(function (i) { return q.choices[i]; }),
      answer: order.indexOf(0),
      canonical: q.choices[0],
      explain: q.explain,
      ref: q.ref || ""
    };
  }

  // 選んだ単元から順番に1問ずつ取り、count 問になるまで続ける(問題が少ない単元は、ほかの単元で補う)
  function buildQuiz(unitIds, levels, count) {
    count = count || COUNT;
    var pools = shuffle(unitIds.filter(function (id) { return unit(id); })).map(function (id) {
      return { id: id, list: shuffle(poolOf(id, levels)) };
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
  // { byUnit: { 単元ID: { total, correct, sessions } }, byLevel: { basic: { total, correct }, … }, bestStreak }
  function cleanNum(v) { return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function emptyStats() { return { byUnit: {}, byLevel: {}, bestStreak: 0 }; }
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
    if (raw.byLevel && typeof raw.byLevel === "object") {
      LEVELS.forEach(function (l) {
        var r = raw.byLevel[l.id];
        if (!r || typeof r !== "object") return;
        var total = cleanNum(r.total), correct = Math.min(cleanNum(r.correct), total);
        if (total > 0) s.byLevel[l.id] = { total: total, correct: correct };
      });
    }
    return s;
  }
  function saveStats(stats) { return Store.save(STATS_KEY, stats); }
  function clearStats() { return Store.remove(STATS_KEY); }
  // 設定。保存がなければ null。units・levels には、いまもあるIDだけを残す
  function loadSettings() {
    var raw = Store.load(SETTINGS_KEY, null);
    if (!raw || typeof raw !== "object") return null;
    var s = { units: [], levels: LEVEL_IDS.slice() };
    if (Array.isArray(raw.units)) {
      s.units = UNITS.filter(function (u) { return raw.units.indexOf(u.id) >= 0; }).map(function (u) { return u.id; });
    }
    if (Array.isArray(raw.levels)) {
      var lv = LEVEL_IDS.filter(function (id) { return raw.levels.indexOf(id) >= 0; });
      if (lv.length > 0) s.levels = lv;
    }
    return s;
  }
  function saveSettings(settings) { return Store.save(SETTINGS_KEY, settings); }

  // 苦手: 5問以上答えて、正答率が70%未満
  function isWeak(rec) { return !!rec && rec.total >= 5 && rec.correct / rec.total < 0.7; }

  return {
    STATS_KEY: STATS_KEY, SETTINGS_KEY: SETTINGS_KEY, COUNT: COUNT, UNITS: UNITS, LEVELS: LEVELS, LANGS: LANGS, BLANK: BLANK,
    unit: unit, level: level, register: register, contentOf: contentOf, card: card, cardUnit: cardUnit,
    tokenize: tokenize, blocksOf: blocksOf,
    checkQuestion: checkQuestion, checkCard: checkCard, poolOf: poolOf, countOf: countOf, buildQuiz: buildQuiz,
    emptyStats: emptyStats, loadStats: loadStats, saveStats: saveStats, clearStats: clearStats,
    loadSettings: loadSettings, saveSettings: saveSettings, isWeak: isWeak
  };
})();


// =====================================================================
// 01 URLとDNS
// =====================================================================
WEBD.register("url-dns", {
  cards: [
    {
      id: "url-parts", name: "URLの各部", en: "Uniform Resource Locator",
      desc: "URLは、どこにある何を、どの方法で取りに行くかを1行で表します。左から順に、スキーム・ホスト・ポート・パス・クエリ・フラグメントと並びます。",
      code: [{ cap: "URL", lang: "url", text: "https://www.example.com:8443\n/docs/a.html?lang=ja#intro" }],
      options: [
        ["https:", "スキーム。通信の方法"],
        ["www.example.com", "ホスト。接続する相手の名前"],
        [":8443", "ポート。省略すると、スキームの既定の番号"],
        ["/docs/a.html", "パス。サーバーの中のどれか"],
        ["?lang=ja", "クエリ。名前=値 を & でつなぐ"],
        ["#intro", "フラグメント。ページの中の位置"]
      ],
      notes: [
        "フラグメント(`#` 以降)はブラウザの中だけで使われ、サーバーへのリクエストには含まれません。",
        "上の例は見やすさのために2行に分けています。実際のURLは1行で、空白を含みません。"
      ]
    },
    {
      id: "domain", name: "ドメイン名の階層", en: "Domain name hierarchy",
      desc: "ドメイン名は、右へ行くほど上の階層です。いちばん上のルート(`.`)の下にトップレベルドメイン(TLD)があり、その下に組織などの名前、さらにサブドメインが続きます。",
      options: [
        ["jp / com", "トップレベルドメイン(TLD)"],
        ["co.jp", "jp の下の第2レベル(日本の会社向け)"],
        ["example", "登録して使う名前"],
        ["www / shop", "サブドメイン。自由に作れる"]
      ],
      notes: ["末尾にルートの `.` まで書いた形(`www.example.com.`)を FQDN(完全修飾ドメイン名)と呼びます。ふだんは最後の `.` を省きます。"]
    },
    {
      id: "dns-resolve", name: "名前解決", en: "DNS resolution",
      desc: "ホスト名からIPアドレスを調べることを名前解決といいます。端末は、フルサービスリゾルバ(キャッシュDNSサーバー)に問い合わせます。リゾルバは、答えを持っていなければルート → TLD → 権威DNSサーバーの順にたどって答えを得て、しばらくキャッシュします。",
      options: [
        ["スタブリゾルバ", "端末のOSにある、問い合わせを出す部分"],
        ["フルサービスリゾルバ", "代わりに調べてキャッシュする。プロバイダーや 8.8.8.8 など"],
        ["ルートサーバー", "TLD(com、jp など)の担当を教える"],
        ["権威DNSサーバー", "そのドメインの正しいレコードを持つ"]
      ],
      notes: ["ブラウザやOSにもキャッシュがあるので、同じ名前を何度も問い合わせるわけではありません。"]
    },
    {
      id: "ttl", name: "TTL", en: "Time To Live",
      desc: "DNSのレコードに付ける秒数で、リゾルバなどがその答えをキャッシュしてよい時間です。期限が来るまでは、権威DNSサーバーに聞き直さずに同じ答えを返します。",
      code: [{ cap: "TTL 3600秒(1時間)のAレコード", lang: "dns", text: "www 3600 IN A 192.0.2.10" }],
      notes: ["サーバーの引っ越しなどでIPアドレスを変える前には、TTLを短くしておくと、古い答えのキャッシュが早く切れて切り替えが早く広がります。"]
    },
    {
      id: "dns-records", name: "DNSレコード", en: "Resource records",
      desc: "権威DNSサーバーには、名前ごとに種類の違うレコードを登録します。`@` はゾーンの頂点(ここでは example.com 自体)を表します。",
      code: [{ cap: "example.com のゾーン", lang: "dns", text: "@   300 IN A     192.0.2.1\n@   300 IN AAAA  2001:db8::1\nwww 300 IN CNAME example.com.\n@   300 IN MX    10 mail\n@   300 IN TXT   \"v=spf1 -all\"" }],
      options: [
        ["A", "IPv4アドレス"],
        ["AAAA", "IPv6アドレス"],
        ["CNAME", "別名。ほかのドメイン名を指す"],
        ["MX", "メールを受け取るサーバー(優先度つき)"],
        ["TXT", "文字列。SPFやドメイン所有の確認に使う"],
        ["NS", "そのゾーンの権威DNSサーバー"]
      ],
      notes: [
        "CNAME を置いた名前には、ほかのレコードを置けません。ゾーンの頂点には SOA と NS が必ずあるので、頂点には CNAME を置けません。"
      ]
    },
    {
      id: "ip-address", name: "IPアドレス", en: "Internet Protocol address",
      desc: "ネットワーク上の機器の住所です。IPv4 は32ビットで `192.0.2.1` のように4つの数で書き、IPv6 は128ビットで `2001:db8::1` のように16進数で書きます。",
      options: [
        ["127.0.0.1 / ::1", "自分自身(localhost)"],
        ["192.168.0.0/16 など", "家庭や会社の中だけで使うプライベートアドレス"],
        ["192.0.2.0/24", "説明・例に使うためのアドレス"]
      ],
      notes: ["IPv4 のアドレスは約43億個しかなく足りないため、IPv6 への移行が進んでいます。"]
    },
    {
      id: "port", name: "ポート番号", en: "Port number",
      desc: "1台の機器の中で、どのサービス(プログラム)と通信するかを表す 0〜65535 の番号です。URLでポートを省くと、スキームごとの既定の番号が使われます。",
      options: [
        ["80", "HTTP の既定"],
        ["443", "HTTPS の既定"],
        ["22", "SSH"],
        ["53", "DNS"]
      ],
      notes: ["0〜1023 はウェルノウンポートと呼ばれ、よく知られたサービスに割り当てられています。開発中は 3000 や 8080 などがよく使われます。"]
    },
    {
      id: "percent-encoding", name: "パーセントエンコーディング", en: "Percent-encoding",
      desc: "URLに使えない文字(空白・日本語・一部の記号)を、UTF-8 のバイトごとに `%` と16進数2けたで表す方法です。JavaScript では `encodeURIComponent` で変換します。",
      code: [{ lang: "js", text: "encodeURIComponent(\"a b\")\n// → \"a%20b\"\nencodeURIComponent(\"あ\")\n// → \"%E3%81%82\"" }],
      notes: ["HTMLのフォームを送る形式(`application/x-www-form-urlencoded`)では、空白は `%20` ではなく `+` になります。"]
    }
  ],
  questions: [
    {
      id: "d01", level: "basic", q: "このURLのポート番号は?", kind: "code",
      code: [{ cap: "URL", lang: "url", text: "https://example.com:8080/a?x=1#top" }],
      choices: ["8080", "443", "80", "1"],
      explain: "ホストのあとの `:8080` がポートです。書いてあるので、https の既定の 443 ではなく 8080 に接続します。",
      ref: "url-parts"
    },
    {
      id: "d02", level: "basic", q: "URLのフラグメント(`#` 以降)について正しいのは?", kind: "text",
      choices: [
        "サーバーへのリクエストには含まれない",
        "サーバーが検索の条件として受け取る",
        "ドメイン名の一部として名前解決に使う",
        "通信を暗号化するために必ず必要になる"
      ],
      explain: "フラグメントはページの中の位置などを表し、ブラウザの中だけで使われます。サーバーに値を渡したいときはクエリ(`?` 以降)を使います。",
      ref: "url-parts"
    },
    {
      id: "d03", level: "basic", q: "`shop.example.co.jp` のトップレベルドメイン(TLD)は?", kind: "code",
      choices: ["jp", "co", "example", "shop"],
      explain: "ドメイン名は右ほど上の階層で、いちばん右の `jp` がTLDです。`co.jp` は jp の下の第2レベル、`shop` はサブドメインです。",
      ref: "domain"
    },
    {
      id: "d04", level: "basic", q: "ドメイン名に対応する IPv4 アドレスを登録するDNSレコードは?", kind: "code",
      choices: ["A", "AAAA", "CNAME", "MX"],
      explain: "IPv4 は A レコード、IPv6 は AAAA レコードです。CNAME は別名、MX はメールサーバーを表します。",
      ref: "dns-records"
    },
    {
      id: "d05", level: "basic", q: "ポートを書いていない `https://` のURLを開くと、何番のポートに接続する?", kind: "code",
      choices: ["443", "80", "8080", "22"],
      explain: "HTTPS の既定のポートは443、HTTP は80です。22 は SSH で使われます。",
      ref: "port"
    },
    {
      id: "d06", level: "basic", q: "DNSの主な役割は?", kind: "text",
      choices: [
        "ドメイン名からIPアドレスなどの情報を調べる",
        "通信の内容を暗号化して、盗み見を防ぐ",
        "Webページの見た目を整えるルールを決める",
        "送ったデータが壊れていないかを確かめる"
      ],
      explain: "DNS(Domain Name System)は、`example.com` のような名前と、IPアドレスなどの情報を結びつけるしくみです。暗号化は TLS、見た目は CSS の役目です。",
      ref: "dns-resolve"
    },
    {
      id: "d07", level: "basic", q: "このURLのクエリ文字列はどれ?", kind: "code",
      code: [{ cap: "URL", lang: "url", text: "https://a.example/search?q=cat&p=2" }],
      choices: ["q=cat&p=2", "/search", "a.example", "https"],
      explain: "`?` のあとがクエリです。`名前=値` を `&` でつないで、サーバーに条件を渡します。`/search` はパスです。",
      ref: "url-parts"
    },
    {
      id: "d08", level: "std", q: "`www.example.com` を、別のドメイン名 `example.net` の別名にしたい。使うレコードは?", kind: "code",
      choices: ["CNAME", "A", "TXT", "NS"],
      explain: "CNAME は「この名前は、あの名前の別名」という意味のレコードです。CDN やホスティングサービスの名前を指すときによく使います。",
      ref: "dns-records"
    },
    {
      id: "d09", level: "std", q: "このレコードの `3600` は何を表す?", kind: "text",
      code: [{ lang: "dns", text: "www 3600 IN A 192.0.2.10" }],
      choices: [
        "リゾルバがこの答えをキャッシュしてよい秒数",
        "この名前に問い合わせてよい1時間の回数",
        "サーバーが応答するまでに待つミリ秒の上限",
        "このレコードを登録してからの経過秒数"
      ],
      explain: "TTL(Time To Live)です。3600秒(1時間)は、権威DNSサーバーに聞き直さずにキャッシュの答えを使えます。",
      ref: "ttl"
    },
    {
      id: "d10", level: "std", q: "このコードの結果は?", kind: "code",
      code: [{ lang: "js", text: "encodeURIComponent(\"東京\")" }],
      choices: ["\"%E6%9D%B1%E4%BA%AC\"", "\"%6771%4EAC\"", "\"%u6771%u4EAC\"", "\"東京\""],
      explain: "文字を UTF-8 のバイトに直し、1バイトずつ `%` と16進数2けたで書きます。東と京は UTF-8 でそれぞれ3バイトなので、`%` が6つ並びます。`%u6771` の形は古い `escape` 関数のものです。",
      ref: "percent-encoding"
    },
    {
      id: "d11", level: "std", q: "何もキャッシュしていないフルサービスリゾルバが `www.example.com` を調べるとき、最初に問い合わせる相手は?", kind: "text",
      choices: [
        "ルートDNSサーバー",
        "example.com の権威DNSサーバー",
        ".com のTLDサーバー",
        "ブラウザのDNSキャッシュ"
      ],
      explain: "リゾルバは上の階層からたどります。ルートから .com の担当を、.com のTLDサーバーから example.com の担当を教わり、最後に権威DNSサーバーから答えを得ます。",
      ref: "dns-resolve"
    },
    {
      id: "d12", level: "std", q: "`<form method=\"get\">` の検索欄(`name=\"q\"`)に「a b」と入れて送った。URLのクエリはどうなる?", kind: "code",
      choices: ["?q=a+b", "?q=a b", "?q=a%2Bb", "?q=a_b"],
      explain: "フォームの送信は `application/x-www-form-urlencoded` の形で、空白は `+` になります。`%2B` は「+」という文字そのものを表します。",
      ref: "percent-encoding"
    },
    {
      id: "d13", level: "pro", q: "`example.com`(ゾーンの頂点)に CNAME レコードを置けない理由は?", kind: "text",
      choices: [
        "頂点には SOA と NS が必ずあり、CNAME はほかのレコードと同じ名前に置けないから",
        "CNAME はサブドメインの名前にしか書けないと、ドメインの登録時に決まっているから",
        "CNAME の向き先は必ず IPv6 アドレスでなければならず、頂点の A と食い違うから",
        "ゾーンの頂点のレコードには TTL を設定できず、CNAME は TTL が必須だから"
      ],
      explain: "CNAME を置いた名前には、ほかの種類のレコードを置けない決まりがあります。頂点には SOA と NS が必要なので、ぶつかります。頂点を別名のように使いたいときは、DNSサービス独自の ALIAS などを使います。",
      ref: "dns-records"
    },
    {
      id: "d14", level: "pro", q: "サーバーを移してIPアドレスを変える数日前に、Aレコードの TTL を短くしておく理由は?", kind: "text",
      choices: [
        "古いアドレスのキャッシュが早く切れ、切り替えが早く広がるから",
        "TTL を短くすると、DNSの問い合わせが暗号化されるから",
        "TTL を短くすると、権威DNSサーバーへの問い合わせが減るから",
        "TTL を短くすると、ブラウザのページのキャッシュも消えるから"
      ],
      explain: "リゾルバは TTL の間、前の答えを使い続けます。前もって短くしておくと、変更後に古いIPアドレスが使われる時間を短くできます。問い合わせはむしろ増えます。",
      ref: "ttl"
    },
    {
      id: "d15", level: "basic", q: "IPv6 アドレスの書き方の例はどれ?", kind: "code",
      choices: ["2001:db8::1", "192.0.2.1", "example.com", "00:1A:2B:3C:4D:5E"],
      explain: "IPv6 は128ビットで、16進数を `:` で区切って書きます。`::` は0の続きを省いた形です。`192.0.2.1` は IPv4、最後のものは機器のMACアドレスの形です。",
      ref: "ip-address"
    }
  ]
});


// =====================================================================
// 02 HTTPの基本
// =====================================================================
WEBD.register("http", {
  cards: [
    {
      id: "http-message", name: "リクエストとレスポンス", en: "HTTP messages",
      desc: "HTTPは、ブラウザ(クライアント)がリクエストを送り、サーバーがレスポンスを返すやりとりです。どちらも「開始行 → ヘッダー → 空行 → 本文(ボディ)」の形をしています。",
      code: [
        { cap: "リクエスト", lang: "http", text: "GET /index.html HTTP/1.1\nHost: example.com\nAccept: text/html" },
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\nContent-Type: text/html\n\n<!DOCTYPE html>…" }
      ],
      options: [
        ["開始行", "リクエストは メソッド・パス・バージョン、レスポンスは バージョン・ステータスコード・説明"],
        ["ヘッダー", "名前: 値 の行。付加情報"],
        ["本文", "空行のあと。HTMLやJSONなど"]
      ],
      notes: ["HTTP/2 と HTTP/3 では、通信の上ではバイナリの形で送られますが、メソッド・ヘッダー・ステータスコードの意味は同じです。"]
    },
    {
      id: "http-methods", name: "メソッド", en: "HTTP request methods",
      desc: "リクエストの1語目で、リソースに何をしたいかを表します。",
      options: [
        ["GET", "取得する"],
        ["POST", "データを送って処理させる(新規作成など)"],
        ["PUT", "指定した場所に丸ごと置きかえる(なければ作る)"],
        ["PATCH", "一部だけを変更する"],
        ["DELETE", "削除する"],
        ["HEAD", "GET と同じだが、ヘッダーだけを返させる"],
        ["OPTIONS", "使えるメソッドなどを問い合わせる(CORS のプリフライトでも使う)"]
      ]
    },
    {
      id: "safe-idempotent", name: "安全性とべき等性", en: "Safe / Idempotent methods",
      desc: "安全なメソッドは、サーバーの状態を変えないもの(GET・HEAD・OPTIONS)です。べき等なメソッドは、同じリクエストを何回送っても、1回送ったときと同じ結果になるもの(安全なメソッド + PUT・DELETE)です。",
      options: [
        ["GET HEAD OPTIONS", "安全で、べき等"],
        ["PUT DELETE", "安全ではないが、べき等"],
        ["POST", "安全でもべき等でもない(送るたびに注文が増えるなど)"],
        ["PATCH", "べき等とは限らない"]
      ],
      notes: ["べき等なリクエストは、通信が切れたときに送り直しても困りません。POST の送り直しは二重注文などの原因になります。"]
    },
    {
      id: "status-2xx3xx", name: "ステータスコード 2xx・3xx", en: "Successful / Redirection",
      desc: "レスポンスの開始行の3けたの数で、結果を表します。2xx は成功、3xx はリダイレクトなど別の対応が必要なことを表します。",
      options: [
        ["200 OK", "成功"],
        ["201 Created", "新しく作成できた"],
        ["204 No Content", "成功したが、返す本文はない"],
        ["301 / 308", "恒久的に移動した"],
        ["302 / 307", "一時的に別の場所にある"],
        ["304 Not Modified", "キャッシュがまだ使える"]
      ]
    },
    {
      id: "status-4xx5xx", name: "ステータスコード 4xx・5xx", en: "Client error / Server error",
      desc: "4xx はリクエスト側の問題、5xx はサーバー側の問題を表します。",
      options: [
        ["400 Bad Request", "リクエストの形がおかしい"],
        ["401 Unauthorized", "認証が必要、または認証に失敗した"],
        ["403 Forbidden", "認証はできても、権限がない"],
        ["404 Not Found", "見つからない"],
        ["405 Method Not Allowed", "そのメソッドは使えない(Allow ヘッダーで使えるものを示す)"],
        ["409 Conflict", "いまの状態とぶつかる(同時編集など)"],
        ["429 Too Many Requests", "短い時間にリクエストが多すぎる"],
        ["500 Internal Server Error", "サーバー内部のエラー"],
        ["502 Bad Gateway", "中継するサーバーが、上流から不正な応答を受けた"],
        ["503 Service Unavailable", "一時的に処理できない(過負荷・メンテナンス)"],
        ["504 Gateway Timeout", "中継するサーバーが、上流から時間内に応答を得られなかった"]
      ]
    },
    {
      id: "redirect", name: "リダイレクト", en: "Redirection",
      desc: "3xx のレスポンスと `Location` ヘッダーで、ブラウザに別のURLを開き直させます。恒久的な移動は 301・308、一時的な移動は 302・307 を使います。",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 301 Moved Permanently\nLocation: https://example.com/" }],
      notes: [
        "301・302 では、ブラウザが POST を GET に変えて送り直すことがあります。メソッドと本文をそのまま保ちたいときは 307・308 を使います。",
        "検索エンジンは、恒久的な移動(301・308)を見て、新しいURLに評価を引き継ぎます。"
      ]
    },
    {
      id: "http-headers", name: "主なヘッダー", en: "HTTP headers",
      desc: "ヘッダーは `名前: 値` の形の付加情報です。名前の大文字と小文字は区別しません。",
      options: [
        ["Host", "接続先のホスト名(HTTP/1.1 では必須)"],
        ["Content-Type", "本文の形式(text/html、application/json など)"],
        ["Accept", "受け取りたい形式"],
        ["Location", "リダイレクト先や、作成したリソースのURL"],
        ["User-Agent", "ブラウザなどクライアントの種類"],
        ["Authorization", "認証情報(Bearer トークンなど)"]
      ]
    },
    {
      id: "http-versions", name: "HTTP/1.1・HTTP/2・HTTP/3", en: "HTTP versions",
      desc: "HTTP/1.1 はテキストの形で、1本の接続では基本的に1つずつ順番にやりとりします。HTTP/2 は1本の TCP 接続の上で複数のやりとりを同時に流せます(多重化)。HTTP/3 は UDP の上の QUIC を使い、パケットが失われても他のやりとりが止まりにくくなっています。",
      options: [
        ["HTTP/1.1", "テキスト。持続的接続(keep-alive)"],
        ["HTTP/2", "バイナリ。多重化、ヘッダー圧縮(HPACK)"],
        ["HTTP/3", "QUIC(UDP)。TLS 1.3 を組みこみ、接続が早い"]
      ],
      notes: ["HTTP/2 も1本の TCP の上なので、パケットが1つ失われると、届くまで全部のやりとりが待たされます(TCP の先頭のつまり)。HTTP/3 はこれを避けます。"]
    },
    {
      id: "stateless", name: "ステートレス", en: "Stateless protocol",
      desc: "HTTPは、サーバーがそれぞれのリクエストを、前のリクエストと関係なく扱う決まりです。ログイン状態などを続けたいときは、Cookie などで毎回の手がかりを送ります。",
      notes: ["状態を持たないので、サーバーを何台にも増やしやすいという利点があります。"]
    }
  ],
  questions: [
    {
      id: "h01", level: "basic", q: "POST で新しい記事を作成できた。返すステータスコードとして最も適切なのは?", kind: "code",
      choices: ["201", "204", "301", "400"],
      explain: "201 Created は、新しいリソースを作れたことを表します。作ったリソースのURLを `Location` ヘッダーで知らせることがよくあります。",
      ref: "status-2xx3xx"
    },
    {
      id: "h02", level: "basic", q: "指定したURLのページが見つからないときのステータスコードは?", kind: "code",
      choices: ["404", "403", "500", "301"],
      explain: "404 Not Found です。4xx はリクエスト側の問題を表します。",
      ref: "status-4xx5xx"
    },
    {
      id: "h03", level: "basic", q: "ステータスコード 503 の意味は?", kind: "text",
      choices: [
        "サーバーが一時的にリクエストを処理できない",
        "リクエストの書き方がまちがっている",
        "ページが別のURLへ恒久的に移動した",
        "見る権限がないので表示できない"
      ],
      explain: "503 Service Unavailable は、過負荷やメンテナンスで一時的に処理できないことを表します。いつ再試行してよいかを `Retry-After` ヘッダーで伝えられます。",
      ref: "status-4xx5xx"
    },
    {
      id: "h04", level: "basic", q: "リソースを取得するときに使う、最も基本的なメソッドは?", kind: "code",
      choices: ["GET", "POST", "PUT", "DELETE"],
      explain: "GET は取得のためのメソッドです。ブラウザでURLを開くと GET のリクエストが送られます。",
      ref: "http-methods"
    },
    {
      id: "h05", level: "basic", q: "このリクエストの1行目にある `/index.html` は何を表す?", kind: "text",
      code: [{ cap: "リクエスト", lang: "http", text: "GET /index.html HTTP/1.1\nHost: example.com" }],
      choices: [
        "リクエストの対象(パス)",
        "使うメソッドの名前",
        "HTTPのバージョン",
        "接続先のホスト名"
      ],
      explain: "開始行は「メソッド・パス・バージョン」の順です。ホスト名は `Host` ヘッダーで送ります。",
      ref: "http-message"
    },
    {
      id: "h06", level: "basic", q: "本文が JSON であることを示すときに使うヘッダーは?", kind: "code",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\n____: application/json\n\n{\"id\": 1}" }],
      choices: ["Content-Type", "Accept", "User-Agent", "Host"],
      explain: "`Content-Type` は、送っている本文の形式を表します。`Accept` は、クライアントが受け取りたい形式を伝えるリクエストヘッダーです。",
      ref: "http-headers"
    },
    {
      id: "h07", level: "basic", q: "HTTPが「ステートレス」であるとは?", kind: "text",
      choices: [
        "サーバーが各リクエストを、前のリクエストと関係なく扱う",
        "サーバーとの接続を、いつも1本だけに保ち続ける",
        "レスポンスに、結果を表すステータスコードを付けない",
        "リクエストのたびに、暗号化の鍵を作り直して送る"
      ],
      explain: "HTTPそのものは前のやりとりを覚えていません。ログイン状態などは、Cookie やトークンを毎回送ることで続けます。",
      ref: "stateless"
    },
    {
      id: "h08", level: "basic", q: "リダイレクトのレスポンスで、移動先のURLを伝えるヘッダーは?", kind: "code",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 301 Moved Permanently\n____: https://example.com/" }],
      choices: ["Location", "Referer", "Host", "Origin"],
      explain: "3xx のレスポンスでは、`Location` に移動先を書きます。`Referer` は、どのページから来たかを伝えるリクエストヘッダーです。",
      ref: "redirect"
    },
    {
      id: "h09", level: "std", q: "ログインしていない利用者が、会員だけのページを開いた。認証を求めるステータスコードは?", kind: "code",
      choices: ["401", "403", "404", "400"],
      explain: "401 Unauthorized は認証が必要(または失敗した)ことを表します。ログインしていても権限がない場合は 403 Forbidden です。",
      ref: "status-4xx5xx"
    },
    {
      id: "h10", level: "std", q: "べき等ではないメソッドは?", kind: "code",
      choices: ["POST", "PUT", "DELETE", "GET"],
      explain: "PUT は同じものを何度置きかえても結果が同じで、DELETE も2回目以降は「すでにない」状態のままです。POST は送るたびに注文が増えるなど、結果が変わりえます。",
      ref: "safe-idempotent"
    },
    {
      id: "h11", level: "std", q: "ステータスコード 304 Not Modified を受け取ったブラウザの動きは?", kind: "text",
      choices: [
        "手元のキャッシュがまだ新しいので、それを使う",
        "ページが移動したので、新しいURLを開き直す",
        "内容が変わったので、キャッシュを捨てて取り直す",
        "サーバーが混んでいるので、時間をおいて送り直す"
      ],
      explain: "304 は、条件付きリクエスト(`If-None-Match` など)に対して「変わっていない」と答えるもので、本文を含みません。ブラウザは保存してある内容を使います。",
      ref: "status-2xx3xx"
    },
    {
      id: "h12", level: "std", q: "URLを恒久的に移した。POST のメソッドと本文を変えずに、新しいURLへ送り直させたい。使うステータスコードは?", kind: "code",
      choices: ["308", "301", "302", "307"],
      explain: "308 Permanent Redirect は、恒久的な移動で、メソッドと本文を保ちます。301 では POST が GET に変わることがあり、307 は一時的な移動です。",
      ref: "redirect"
    },
    {
      id: "h13", level: "std", q: "HEAD メソッドで送ると、サーバーは何を返す?", kind: "text",
      choices: [
        "GET と同じヘッダーだけを返し、本文は返さない",
        "本文だけを返し、ヘッダーはすべて省いて返す",
        "使えるメソッドの一覧だけを、本文で返す",
        "ページの先頭の部分だけを、本文で返す"
      ],
      explain: "HEAD は GET と同じレスポンスのヘッダー部分だけを受け取るメソッドです。ファイルの大きさや更新日時だけを調べたいときに使います。使えるメソッドを問い合わせるのは OPTIONS です。",
      ref: "http-methods"
    },
    {
      id: "h14", level: "std", q: "レスポンスの空欄に入るステータスコードは?", kind: "code",
      code: [
        { cap: "リクエスト", lang: "http", text: "DELETE /articles HTTP/1.1\nHost: example.com" },
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 ____ Method Not Allowed\nAllow: GET, POST" }
      ],
      choices: ["405", "403", "404", "409"],
      explain: "405 Method Not Allowed は、そのURLではそのメソッドを使えないことを表します。`Allow` ヘッダーで使えるメソッドを示します。",
      ref: "status-4xx5xx"
    },
    {
      id: "h15", level: "std", q: "短い時間に API を呼びすぎたときに返されるステータスコードは?", kind: "code",
      choices: ["429", "503", "403", "408"],
      explain: "429 Too Many Requests は、利用回数の制限(レート制限)を超えたことを表します。`Retry-After` で再試行してよい時間を伝えることがあります。",
      ref: "status-4xx5xx"
    },
    {
      id: "h16", level: "pro", q: "HTTP/2 の「多重化」の説明として正しいのは?", kind: "text",
      choices: [
        "1本のTCP接続の上で、複数のやりとりを同時に並べて流す",
        "リクエストごとに新しいTCP接続を開き、並行して送る",
        "同じリクエストを複数のサーバーに送り、速い方を使う",
        "レスポンスを複数のCDNから分けて受け取り、結合する"
      ],
      explain: "HTTP/2 はやりとりをストリームに分け、1本の接続の上で同時に流します。HTTP/1.1 のように接続を何本も開かなくてよくなりました。",
      ref: "http-versions"
    },
    {
      id: "h17", level: "pro", q: "HTTP/3 の特徴として正しいのは?", kind: "text",
      choices: [
        "UDP の上の QUIC を使い、パケットの紛失で全体が止まりにくい",
        "TCP の上で TLS 1.0 を使い、古い端末とのつながりやすさを高めた",
        "バイナリをやめてテキストの形に戻し、人がそのまま読めるようにした",
        "WebSocket を必須にして、サーバーとの双方向の通信だけを扱う"
      ],
      explain: "HTTP/3 は QUIC(UDP の上)で動き、ストリームごとに再送を扱うので、1つのパケットの紛失で全体が待たされにくくなっています。TLS 1.3 も組みこまれています。",
      ref: "http-versions"
    },
    {
      id: "h18", level: "pro", q: "リバースプロキシが、裏のアプリサーバーから時間内に応答を得られなかった。プロキシが返すステータスコードは?", kind: "code",
      choices: ["504", "502", "503", "408"],
      explain: "504 Gateway Timeout です。上流から不正な応答が返ったときは 502 Bad Gateway、プロキシ自身が一時的に受け付けられないときは 503 を使います。408 はクライアントからのリクエストが遅いときのコードです。",
      ref: "status-4xx5xx"
    }
  ]
});


// =====================================================================
// 03 ブラウザが表示するまで
// =====================================================================
WEBD.register("render", {
  cards: [
    {
      id: "nav-flow", name: "URL入力から表示まで", en: "Navigation",
      desc: "URLを入れてから画面が出るまでに、ブラウザはおおまかに次の順で進みます。キャッシュや前の接続が使えるときは、途中を飛ばします。",
      options: [
        ["1. 名前解決", "DNSでホスト名からIPアドレスを調べる"],
        ["2. 接続", "TCP(HTTP/3 なら QUIC)でつなぎ、TLS で暗号化の準備をする"],
        ["3. リクエスト", "HTTPで HTML を求める"],
        ["4. 解析", "HTML から DOM、CSS から CSSOM を作る"],
        ["5. 描画", "レンダーツリー → レイアウト → ペイント → 合成"]
      ],
      notes: ["HTML を読む途中で見つけた CSS・JavaScript・画像も、並行して取りに行きます。"]
    },
    {
      id: "dom", name: "DOM", en: "Document Object Model",
      desc: "ブラウザが HTML を解析して作る、要素の木構造です。JavaScript は DOM を通してページの中身を読んだり変えたりします。",
      code: [{ cap: "HTML → DOM", lang: "html", text: "<body>\n  <h1>見出し</h1>\n  <p>本文<a>リンク</a></p>\n</body>" }],
      notes: ["HTML の書き方が多少まちがっていても、ブラウザは決まった手順で直しながら DOM を作ります。"]
    },
    {
      id: "cssom", name: "CSSOM", en: "CSS Object Model",
      desc: "ブラウザが CSS を解析して作る、スタイルの規則の集まりです。DOM と組み合わせて、要素ごとの最終的なスタイルを決めます。",
      notes: ["CSSOM ができるまでは見た目が決まらないので、`<head>` の CSS は描画を待たせます(レンダリングブロック)。"]
    },
    {
      id: "render-tree", name: "レンダーツリー", en: "Render tree",
      desc: "DOM と CSSOM を合わせて、画面に描く要素だけを集めたものです。`display: none` の要素は入りません。`visibility: hidden` の要素は、見えなくても場所を取るので入ります。",
      code: [{ lang: "css", text: ".a { display: none; }\n/* 場所も取らない */\n.b { visibility: hidden; }\n/* 見えないが場所は取る */" }]
    },
    {
      id: "pipeline", name: "レイアウト・ペイント・合成", en: "Layout / Paint / Composite",
      desc: "レンダーツリーができたら、各要素の位置と大きさを計算し(レイアウト)、色や文字をピクセルに描き(ペイント)、いくつかの層(レイヤー)を重ねて画面に出します(合成)。",
      options: [
        ["レイアウト", "位置と大きさを計算する。リフローとも呼ぶ"],
        ["ペイント", "色・文字・影などを描く"],
        ["合成", "レイヤーを重ねて1枚の画面にする"]
      ]
    },
    {
      id: "defer-async", name: "defer と async", en: "Script loading attributes",
      desc: "属性のない `<script src>` は、読み込みと実行が終わるまで HTML の解析を止めます。`defer` と `async` は、解析を止めずに並行して読み込みます。",
      code: [{ lang: "html", text: "<script src=\"a.js\" defer></script>\n<script src=\"b.js\" async></script>" }],
      options: [
        ["属性なし", "解析を止めて、読み込み・実行する"],
        ["defer", "解析のあと、書いた順に実行する(DOMContentLoaded の前)"],
        ["async", "読み込めしだい実行する。順番は決まらない"],
        ["type=\"module\"", "何も付けなくても defer と同じ扱い"]
      ],
      notes: ["DOM を使う処理は、`defer` にすると、解析が終わってから動くので安全です。"]
    },
    {
      id: "render-blocking", name: "レンダリングブロック", en: "Render-blocking resources",
      desc: "読み込みが終わるまで、ブラウザが画面の描画を待つリソースです。`<head>` の CSS と、属性のない `<script>` が代表です。",
      options: [
        ["DOMContentLoaded", "HTML の解析が終わり、defer のスクリプトも実行したとき(画像は待たない)"],
        ["load", "画像なども含めて、すべて読み終えたとき"]
      ],
      notes: ["CSS は、そのあとにある `<script>` の実行も待たせます。スクリプトがスタイルを読むかもしれないからです。"]
    },
    {
      id: "reflow", name: "リフローと再描画", en: "Reflow / Repaint",
      desc: "幅や位置を変えると、レイアウトの計算からやり直し(リフロー)になります。色だけを変えたときはペイントからで済み、`transform` と `opacity` は合成だけで済むことが多いです。",
      code: [{ cap: "リフローを何度も起こす書き方", lang: "js", text: "for (const el of items) {\n  const h = box.offsetHeight;\n  el.style.height = h + \"px\";\n}" }],
      notes: ["スタイルを書きかえたあとに `offsetHeight` などのサイズを読むと、ブラウザはその場でレイアウトを計算し直します。読むのと書くのを交互にくり返すと遅くなります(レイアウトスラッシング)。読むのをまとめて先に済ませます。"]
    }
  ],
  questions: [
    {
      id: "r01", level: "basic", q: "ブラウザが HTML を解析して作る、要素の木構造を何という?", kind: "code",
      choices: ["DOM", "CSSOM", "JSON", "URL"],
      explain: "DOM(Document Object Model)です。CSS を解析して作るのは CSSOM です。",
      ref: "dom"
    },
    {
      id: "r02", level: "basic", q: "初めて訪れるサイトのURLを入力した。次のうち、最初に行われるのは?", kind: "text",
      choices: [
        "DNSでホスト名からIPアドレスを調べる",
        "HTML を解析して DOM を作る",
        "CSS を読んでレイアウトを計算する",
        "画像を読みこんで画面に描く"
      ],
      explain: "接続する相手のIPアドレスがわからないと、リクエストを送れません。名前解決 → 接続 → リクエスト → 解析 → 描画 の順です。",
      ref: "nav-flow"
    },
    {
      id: "r03", level: "basic", q: "画像の読み込みを待たずに、HTML の解析が終わった時点で発生するイベントは?", kind: "code",
      choices: ["DOMContentLoaded", "load", "pageshow", "unload"],
      explain: "`DOMContentLoaded` は、HTML の解析が終わり、defer のスクリプトも実行したときに起きます。画像などすべてを読み終えたときに起きるのが `load` です。",
      ref: "render-blocking"
    },
    {
      id: "r04", level: "std", q: "`display: none` を指定した要素について正しいのは?", kind: "text",
      choices: [
        "レンダーツリーに入らず、場所も取らない",
        "透明になるが、場所は取ったまま残る",
        "DOM から取り除かれ、JavaScript で探せない",
        "画面の外に移り、スクロールすると見える"
      ],
      explain: "`display: none` の要素は DOM には残りますが、描画の対象(レンダーツリー)から外れます。見えないまま場所を取るのは `visibility: hidden` です。",
      ref: "render-tree"
    },
    {
      id: "r05", level: "std", q: "`<script src=\"app.js\" defer>` の動きは?", kind: "text",
      choices: [
        "解析を止めずに読み込み、解析後に書いた順で実行する",
        "読み込みが終わりしだい、解析を止めてすぐ実行する",
        "解析を止めて読み込み、終わるまで表示を待たせる",
        "画像も含めてすべて読み終えた load のあとに実行する"
      ],
      explain: "`defer` は並行して読み込み、HTML の解析が終わってから、書いた順に実行します。読み込めしだい実行するのは `async` です。",
      ref: "defer-async"
    },
    {
      id: "r06", level: "std", q: "`async` を付けたスクリプトが2つある。正しいのは?", kind: "text",
      code: [{ lang: "html", text: "<script src=\"a.js\" async></script>\n<script src=\"b.js\" async></script>" }],
      choices: [
        "読み込めた方から実行され、a.js が先とは限らない",
        "必ず a.js、b.js の順に、解析が終わってから実行される",
        "HTML の解析を止めて、a.js から順に読み込む",
        "load イベントのあとまで、読み込みが始まらない"
      ],
      explain: "`async` のスクリプトは、読み込みが終わりしだい実行されます。順番を守りたいときは `defer` を使います。",
      ref: "defer-async"
    },
    {
      id: "r07", level: "std", q: "`<head>` にある、属性のない `<script src=\"app.js\">` について正しいのは?", kind: "text",
      choices: [
        "読み込みと実行が終わるまで、HTML の解析が止まる",
        "HTML の解析と並行して読み込み、最後に実行される",
        "ページが表示されたあとで、自動的に読み込まれる",
        "画像の読み込みが終わるまで、実行が後回しになる"
      ],
      explain: "属性のない外部スクリプトは、解析を止めて読み込み・実行します(パーサーブロック)。そのあいだ、うしろの HTML は解析されません。",
      ref: "defer-async"
    },
    {
      id: "r08", level: "std", q: "レンダーツリーができたあとの処理の順番として正しいのは?", kind: "text",
      choices: [
        "レイアウト → ペイント → 合成",
        "ペイント → レイアウト → 合成",
        "合成 → レイアウト → ペイント",
        "レイアウト → 合成 → ペイント"
      ],
      explain: "位置と大きさを決め(レイアウト)、ピクセルに描き(ペイント)、レイヤーを重ねて画面に出します(合成)。",
      ref: "pipeline"
    },
    {
      id: "r09", level: "std", q: "レイアウト(リフロー)の段階で計算されるのは?", kind: "text",
      choices: [
        "各要素の位置と大きさ",
        "各ピクセルの色と描く順番",
        "要素の親子関係と並び順",
        "どの CSS の規則が当てはまるか"
      ],
      explain: "レイアウトは、箱の位置と大きさを決める段階です。ピクセルの色はペイント、親子関係は DOM、規則の当てはめはスタイルの計算で決まります。",
      ref: "pipeline"
    },
    {
      id: "r10", level: "std", q: "`<head>` の `<link rel=\"stylesheet\">` について正しいのは?", kind: "text",
      choices: [
        "読み込みが終わるまで、ページの描画が待たされる",
        "HTML の解析が終わるまで、読み込みが始まらない",
        "描画のあとで読み込まれ、あとから見た目が変わる",
        "JavaScript の実行には何も影響しない"
      ],
      explain: "CSS はレンダリングブロックのリソースです。スタイルが決まらないまま描くと、あとで見た目が大きく変わってしまうためです。うしろの `<script>` の実行も待たせます。",
      ref: "render-blocking"
    },
    {
      id: "r11", level: "std", q: "次の変更のうち、リフロー(レイアウトのやり直し)が起きるのは?", kind: "text",
      choices: [
        "要素の width を変える",
        "要素の color を変える",
        "要素の opacity を変える",
        "要素の transform を変える"
      ],
      explain: "幅が変わると、まわりの要素の位置も変わりうるので、レイアウトからやり直します。color はペイントだけ、opacity と transform は合成だけで済むことが多いです。",
      ref: "reflow"
    },
    {
      id: "r12", level: "pro", q: "アニメーションには `transform` と `opacity` を使うとよい、と言われる理由は?", kind: "text",
      choices: [
        "レイアウトやペイントをやり直さず、合成だけで動かせることが多いから",
        "古いブラウザでも、必ず同じ速さで動くことが決まっているから",
        "要素が DOM から一時的に外れ、JavaScript の負担がなくなるから",
        "GPU を使わずに CPU だけで描くので、電池が長持ちするから"
      ],
      explain: "`transform` と `opacity` の変化は、レイヤーを重ねる合成の段階だけで済むことが多く、なめらかに動きます。`top` や `width` を動かすと、毎フレームでレイアウトがやり直しになります。",
      ref: "reflow"
    },
    {
      id: "r13", level: "pro", q: "このコードが遅くなる主な理由は?", kind: "text",
      code: [{ lang: "js", text: "for (const el of items) {\n  const h = box.offsetHeight;\n  el.style.height = h + \"px\";\n}" }],
      choices: [
        "書きかえのたびに offsetHeight を読むので、レイアウトが何度も計算される",
        "offsetHeight を読むたびに DOM が作り直され、要素の数が増えていく",
        "style.height に書くと CSSOM が消えて、全体のスタイルが初期化される",
        "for...of は DOM の要素を1つずつ複製してから、くり返しを回す"
      ],
      explain: "スタイルを書きかえたあとにサイズを読むと、正しい値を返すためにレイアウトがその場で計算されます(強制同期レイアウト)。読む処理をループの前にまとめれば1回で済みます。",
      ref: "reflow"
    },
    {
      id: "r14", level: "pro", q: "`<script type=\"module\" src=\"app.js\">`(defer も async もなし)の動きは?", kind: "text",
      choices: [
        "defer と同じく、解析を止めずに読み込み、解析後に実行する",
        "async と同じく、読み込みが終わりしだい、すぐに実行する",
        "属性なしと同じく、解析を止めて読み込み、すぐに実行する",
        "load イベントのあとまで、読み込みそのものを始めない"
      ],
      explain: "モジュールのスクリプトは、何も付けなくても defer と同じように扱われます。`async` を付けると、読み込めしだい実行されます。",
      ref: "defer-async"
    },
    {
      id: "r15", level: "basic", q: "ブラウザが CSS を解析して作る、スタイルの規則の集まりを何という?", kind: "code",
      choices: ["CSSOM", "DOM", "レンダーツリー", "レイヤー"],
      explain: "CSSOM(CSS Object Model)です。DOM と CSSOM を組み合わせて、画面に描く要素の木(レンダーツリー)を作ります。",
      ref: "cssom"
    }
  ]
});


// =====================================================================
// 04 HTMLとセマンティクス
// =====================================================================
WEBD.register("html", {
  cards: [
    {
      id: "html-skeleton", name: "HTMLの基本構造", en: "Document structure",
      desc: "HTML の文書は、DOCTYPE のあと `<html>` の中に、ページの情報を書く `<head>` と、表示する中身を書く `<body>` を置きます。",
      code: [{ lang: "html", text: "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>ページ名</title>\n</head>\n<body>…</body>\n</html>" }],
      notes: ["`<meta charset>` は、`<head>` のできるだけ先頭(最初の1024バイト以内)に書きます。"]
    },
    {
      id: "doctype", name: "DOCTYPE", mono: true, en: "Document type declaration",
      desc: "文書の先頭に書く `<!DOCTYPE html>` で、ブラウザは標準モードで表示します。書かないと、古いブラウザに合わせた互換モード(quirks mode)になり、ボックスの大きさなどの計算が変わります。",
      code: [{ lang: "html", text: "<!DOCTYPE html>" }],
      notes: ["大文字と小文字は区別しません。`<!doctype html>` でも同じです。"]
    },
    {
      id: "semantic", name: "セマンティック要素", en: "Semantic elements",
      desc: "内容の意味を表す要素です。`div` の代わりに使うと、読み上げソフトや検索エンジンがページの構造をつかみやすくなります。",
      code: [{ lang: "html", text: "<header>…</header>\n<nav>…</nav>\n<main>\n  <article>…</article>\n  <aside>…</aside>\n</main>\n<footer>…</footer>" }],
      options: [
        ["header", "ページや区画の導入部分(ロゴ・見出しなど)"],
        ["nav", "主なナビゲーションのリンクの集まり"],
        ["main", "ページの主な内容。1ページに1つ"],
        ["article", "それだけで完結する内容(記事・投稿)"],
        ["section", "見出しを持つ、内容のまとまり"],
        ["aside", "本筋から外れる補足(サイドバーなど)"],
        ["footer", "ページや区画の終わりの情報(著作権など)"]
      ]
    },
    {
      id: "headings", name: "見出しの階層", en: "Heading levels",
      desc: "`h1`〜`h6` は、内容の階層を表します。h1 の下に h2、h2 の下に h3 と、レベルを飛ばさずに使います。",
      notes: [
        "文字を大きくしたいだけなら、見出し要素ではなく CSS で整えます。",
        "読み上げソフトの利用者は、見出しの一覧をたどってページの中を移動します。"
      ]
    },
    {
      id: "link-img", name: "a と img", en: "Anchor / Image elements",
      desc: "`<a href>` はリンク、`<img src>` は画像です。画像には、見えない人や読み込めないときのための `alt` を書きます。",
      code: [{ lang: "html", text: "<a href=\"/about.html\">会社概要</a>\n<img src=\"logo.png\" alt=\"ABC社\"\n  width=\"120\" height=\"40\">" }],
      options: [
        ["href", "リンク先のURL"],
        ["target=\"_blank\"", "新しいタブで開く"],
        ["rel=\"noopener\"", "開いた先から window.opener で元のページを操作させない"],
        ["alt", "画像の代わりになる文章"],
        ["width / height", "画像の縦横の大きさ。読み込み前に場所を確保できる"]
      ],
      notes: ["いまのブラウザは、`target=\"_blank\"` のリンクを自動で noopener として扱います。"]
    },
    {
      id: "form-controls", name: "フォームの部品", en: "Form controls",
      desc: "`<form>` の中に入力欄やボタンを置きます。`<label>` の `for` と入力欄の `id` を同じにすると、ラベルと入力欄が結びつき、ラベルを押しても入力欄が選ばれます。",
      code: [{ lang: "html", text: "<form action=\"/join\" method=\"post\">\n  <label for=\"mail\">メール</label>\n  <input id=\"mail\" type=\"email\">\n  <button>登録</button>\n</form>" }],
      options: [
        ["action / method", "送り先のURLと、送るメソッド"],
        ["type=\"email\"", "入力の種類。スマホでは合うキーボードが出る"],
        ["name", "送るときの項目名"],
        ["<button>", "form の中では、既定で type=\"submit\"(送信)"]
      ]
    },
    {
      id: "block-inline", name: "ブロックとインライン", en: "Block / Inline",
      desc: "要素には、既定の表示のしかたがあります。`div` `p` `h1` などは横幅いっぱいに広がって縦に積まれ(ブロック)、`span` `a` `em` などは文の中に並びます(インライン)。",
      notes: ["表示のしかたは CSS の `display` で変えられます。意味で要素を選び、見た目は CSS で整えます。"]
    },
    {
      id: "viewport", name: "meta viewport", mono: true, en: "Viewport meta tag",
      desc: "スマホで、ページの幅を端末の画面の幅に合わせる指定です。書かないと、スマホは広い画面を想定して縮小表示します。",
      code: [{ lang: "html", text: "<meta name=\"viewport\"\n  content=\"width=device-width,\n  initial-scale=1\">" }]
    },
    {
      id: "char-ref", name: "文字参照", en: "Character references",
      desc: "HTML で特別な意味を持つ文字を、文字として表示するための書き方です。",
      options: [
        ["&lt;", "<"],
        ["&gt;", ">"],
        ["&amp;", "&"],
        ["&quot;", "\"(属性の値の中など)"],
        ["&#x3042;", "文字番号で書く(この例は「あ」)"]
      ],
      notes: ["利用者が入力した文字をページに出すときは、`<` などをこの形に変えます(エスケープ)。XSS を防ぐ基本です。"]
    }
  ],
  questions: [
    {
      id: "m01", level: "basic", q: "文書の先頭に置き、ブラウザに標準モードで表示させる宣言は?", kind: "code",
      choices: ["<!DOCTYPE html>", "<html lang=\"ja\">", "<meta charset=\"UTF-8\">", "<?xml version=\"1.0\"?>"],
      explain: "`<!DOCTYPE html>` がないと、ブラウザは互換モードで表示し、ボックスの大きさなどの計算が変わります。",
      ref: "doctype"
    },
    {
      id: "m02", level: "basic", q: "ページの主な内容を囲む要素で、1ページに1つだけ置くものは?", kind: "code",
      choices: ["main", "section", "article", "aside"],
      explain: "`main` はページの主な内容を表します。ヘッダーやナビゲーション、フッターは外に置きます。",
      ref: "semantic"
    },
    {
      id: "m03", level: "basic", q: "サイトの主なナビゲーションのリンクをまとめる要素は?", kind: "code",
      choices: ["nav", "menu", "header", "aside"],
      explain: "`nav` は主なナビゲーションの区画を表します。読み上げソフトは「ナビゲーション」としてそこへ移動できます。",
      ref: "semantic"
    },
    {
      id: "m04", level: "basic", q: "画像の代わりになる文章を書く属性は?", kind: "code",
      code: [{ lang: "html", text: "<img src=\"logo.png\" ____=\"ABC社\">" }],
      choices: ["alt", "title", "name", "label"],
      explain: "`alt` は、画像が見えない人(読み上げ)や、画像を読み込めないときに使われる文章です。",
      ref: "link-img"
    },
    {
      id: "m05", level: "basic", q: "本文の中で「<」を文字として表示したい。書き方は?", kind: "code",
      choices: ["&lt;", "&gt;", "&amp;", "&quot;"],
      explain: "`&lt;`(less than)は < を、`&gt;` は > を、`&amp;` は & を表します。",
      ref: "char-ref"
    },
    {
      id: "m06", level: "basic", q: "既定でインライン(文の中に並ぶ)要素はどれ?", kind: "code",
      choices: ["span", "div", "p", "section"],
      explain: "`span` はインラインの要素です。`div` `p` `section` は横幅いっぱいに広がって縦に積まれます。",
      ref: "block-inline"
    },
    {
      id: "m07", level: "basic", q: "スマホでページの幅を端末の幅に合わせる指定。空欄に入るのは?", kind: "code",
      code: [{ lang: "html", text: "<meta name=\"viewport\"\n  content=\"____\">" }],
      choices: ["width=device-width, initial-scale=1", "width=100%, initial-scale=1.0", "device=mobile, zoom=100%", "width=screen, scale=fit"],
      explain: "`width=device-width` で表示の幅を端末の幅に、`initial-scale=1` で最初の拡大率を等倍にします。",
      ref: "viewport"
    },
    {
      id: "m08", level: "basic", q: "リンク先のURLを指定する属性は?", kind: "code",
      code: [{ lang: "html", text: "<a ____=\"/about.html\">会社概要</a>" }],
      choices: ["href", "src", "link", "url"],
      explain: "`<a>` のリンク先は `href` に書きます。`src` は `<img>` や `<script>` が読み込むファイルを指定する属性です。",
      ref: "link-img"
    },
    {
      id: "m09", level: "std", q: "ラベルと入力欄を結びつけたい。空欄に入る属性は?", kind: "code",
      code: [{ lang: "html", text: "<label ____=\"mail\">メール</label>\n<input id=\"mail\" type=\"email\">" }],
      choices: ["for", "id", "name", "href"],
      explain: "`<label for>` に入力欄の `id` を書くと結びつきます。ラベルを押すと入力欄が選ばれ、読み上げソフトもラベルを読みます。",
      ref: "form-controls"
    },
    {
      id: "m10", level: "std", q: "`<form>` の中の `<button>` に type を書かないと、どう働く?", kind: "text",
      choices: [
        "送信ボタン(type=\"submit\")として働く",
        "何もしないボタン(type=\"button\")として働く",
        "入力を初期値に戻すボタンとして働く",
        "フォームの外にあるものとして扱われる"
      ],
      explain: "form の中の button は、既定で送信ボタンです。送信させたくないボタンには `type=\"button\"` を書きます。",
      ref: "form-controls"
    },
    {
      id: "m11", level: "std", q: "見出し要素の使い方として正しいのは?", kind: "text",
      choices: [
        "文字を大きくしたいだけなら、見出し要素ではなく CSS で整える",
        "h1 は使ってはいけないので、ページの見出しは h2 から始める",
        "見出しは h6 から順に、だんだん大きいものへ並べていく",
        "見出しの階層は検索エンジンだけが使い、利用者には関係ない"
      ],
      explain: "見出しは内容の階層を表すものです。見た目のために選ぶと、読み上げソフトの利用者などに誤った構造が伝わります。",
      ref: "headings"
    },
    {
      id: "m12", level: "std", q: "ブログの1つの記事のように、それだけで完結する内容を表す要素は?", kind: "code",
      choices: ["article", "section", "aside", "div"],
      explain: "`article` は、単独で取り出しても意味が通る内容を表します。`section` は見出しを持つ内容のまとまり、`aside` は補足です。",
      ref: "semantic"
    },
    {
      id: "m13", level: "pro", q: "リンクに付ける `rel=\"noopener\"` の働きは?", kind: "text",
      choices: [
        "開いた先のページに、window.opener で元のページを操作させない",
        "リンク先のページを、検索エンジンの検索結果に表示させないようにする",
        "リンク先へ移るときに、元のページのURL(リファラー)を送らない",
        "リンク先のページを、いつも新しいタブ(別のウィンドウ)で開くようにする"
      ],
      explain: "noopener は、開いた先のページが `window.opener` を通じて元のページを別のURLに変えるといった操作を防ぎます。リファラーを送らないのは `noreferrer` です。",
      ref: "link-img"
    },
    {
      id: "m14", level: "std", q: "`<img>` に `width` と `height` を書いておく主な理由は?", kind: "text",
      choices: [
        "読み込む前に縦横比がわかり、場所を確保してレイアウトのずれを防ぐ",
        "画像のファイルを、書いた大きさに縮めてからダウンロードさせる",
        "書いた大きさより大きい画像は、読み込まれないようにする",
        "画像がブラウザのキャッシュに保存されるようにする"
      ],
      explain: "ブラウザは width と height から縦横比を計算し、画像が届く前から場所を空けておけます。CSS で `width: 100%; height: auto;` にしても比率は保たれます。",
      ref: "link-img"
    },
    {
      id: "m15", level: "basic", q: "ページの題名や文字コードなど、画面には表示しない情報をまとめて書く要素は?", kind: "code",
      choices: ["head", "body", "header", "footer"],
      explain: "`<head>` にはページの情報(title、meta、CSS の link など)を書き、表示する中身は `<body>` に書きます。`<header>` は body の中に置く、ページの導入部分の要素です。",
      ref: "html-skeleton"
    }
  ]
});


// =====================================================================
// 05 CSSのセレクタとレイアウト
// =====================================================================
WEBD.register("css", {
  cards: [
    {
      id: "selectors", name: "セレクタ", en: "Selectors",
      desc: "どの要素にスタイルを当てるかを選ぶ書き方です。",
      code: [{ lang: "css", text: "p { color: gray; }\n.note { color: red; }\n#main { width: 80%; }\nul > li { margin: 0; }" }],
      options: [
        ["p", "要素名(型セレクタ)"],
        [".note", "class=\"note\" の要素"],
        ["#main", "id=\"main\" の要素"],
        ["ul li", "ul の中のすべての li(子孫)"],
        ["ul > li", "ul の直接の子の li"],
        ["h2 + p", "h2 のすぐ次の p"],
        ["[type=\"text\"]", "属性で選ぶ"],
        ["a:hover", "状態で選ぶ(擬似クラス)"],
        ["p::before", "要素の一部を作る(擬似要素)"]
      ]
    },
    {
      id: "specificity", name: "詳細度", en: "Specificity",
      desc: "同じ要素に複数の規則が当たったとき、どれを使うかを決める強さです。(ID の数, クラス・属性・擬似クラスの数, 要素・擬似要素の数)の3つを、左から順に比べます。",
      options: [
        ["#nav a", "(1, 0, 1)"],
        [".menu a", "(0, 1, 1)"],
        ["ul li a", "(0, 0, 3)"],
        ["a:hover", "(0, 1, 1)"]
      ],
      notes: [
        "クラスをいくつ重ねても、ID 1つには勝てません。",
        "`style` 属性に書いたスタイルは、どのセレクタよりも強くなります。`!important` は、さらにそれより優先されます。"
      ]
    },
    {
      id: "cascade", name: "カスケードと継承", en: "Cascade / Inheritance",
      desc: "カスケードは、ぶつかった規則から1つを選ぶしくみで、重要度(`!important`)→ 詳細度 → 書いた順(あとが勝つ)の順に比べます。継承は、親に指定した値が子にも引き継がれることです。",
      options: [
        ["継承する", "color、font-size、font-family、line-height など(文字に関するもの)"],
        ["継承しない", "margin、padding、border、background、width など(箱に関するもの)"]
      ],
      notes: ["実際には、ブラウザの既定のスタイルと作者のスタイルの区別や、`@layer` による層の順番も比べます。"]
    },
    {
      id: "box-model", name: "ボックスモデル", en: "Box model",
      desc: "要素は、内側から 内容(content)→ padding → border → margin の箱でできています。`box-sizing: border-box` にすると、`width` に padding と border も含めて計算します。",
      code: [{ lang: "css", text: "* { box-sizing: border-box; }\n.box {\n  width: 200px;\n  padding: 20px;\n  border: 2px solid;\n}\n/* 見た目の幅は 200px */" }],
      options: [
        ["padding", "border の内側の余白"],
        ["border", "枠線"],
        ["margin", "border の外側の余白。ほかの要素との間"]
      ],
      notes: ["既定の `content-box` では、上の `.box` の見た目の幅は 200 + 20×2 + 2×2 = 244px になります。"]
    },
    {
      id: "display", name: "display", mono: true, en: "display property",
      desc: "要素をどう表示するかを決めます。",
      options: [
        ["block", "横幅いっぱい。縦に積まれる"],
        ["inline", "文の中に並ぶ。width・height は効かない"],
        ["inline-block", "文の中に並ぶが、大きさを指定できる"],
        ["none", "表示しない。場所も取らない"],
        ["flex", "子を1方向に並べる(フレックスボックス)"],
        ["grid", "子を縦横の格子に並べる(グリッド)"]
      ]
    },
    {
      id: "position", name: "position", mono: true, en: "position property",
      desc: "要素の置き方を決め、`top` `left` などで位置をずらします。",
      options: [
        ["static", "既定。ふつうの流れどおり"],
        ["relative", "元の位置から、ずらす。元の場所は空いたまま"],
        ["absolute", "流れから外れ、position が static 以外のいちばん近い祖先を基準に置く"],
        ["fixed", "画面(ビューポート)を基準に固定する"],
        ["sticky", "スクロールで指定の位置まで来たら、そこに貼りつく"]
      ],
      notes: ["sticky は、`top` などのしきい値を書かないと効きません。貼りつくのは親要素の範囲の中だけです。"]
    },
    {
      id: "flexbox", name: "フレックスボックス", en: "Flexible box layout",
      desc: "`display: flex` の要素(コンテナ)の子を、1方向に並べます。並べる向きを主軸、それと直角の向きを交差軸といいます。",
      code: [{ lang: "css", text: ".menu {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 8px;\n}" }],
      options: [
        ["flex-direction", "主軸の向き(row = 横、column = 縦)"],
        ["justify-content", "主軸の方向のそろえ方"],
        ["align-items", "交差軸の方向のそろえ方"],
        ["flex-wrap", "入りきらないとき折り返すか"],
        ["gap", "子どうしの間"],
        ["flex: 1", "子に付けて、残りの場所を分け合う"]
      ]
    },
    {
      id: "grid", name: "グリッドレイアウト", en: "CSS Grid Layout",
      desc: "`display: grid` で、子を縦横の格子に並べます。`fr` は、残りの場所を割合で分ける単位です。",
      code: [{ lang: "css", text: ".list {\n  display: grid;\n  grid-template-columns:\n    repeat(3, 1fr);\n  gap: 16px;\n}" }],
      options: [
        ["grid-template-columns", "列の数と幅"],
        ["1fr 2fr", "残りを 1:2 に分ける"],
        ["repeat(3, 1fr)", "同じ幅の列を3つ"],
        ["minmax(200px, 1fr)", "最小200px、余れば広がる"]
      ]
    },
    {
      id: "css-units", name: "長さの単位", en: "CSS length units",
      desc: "CSS の長さには、決まった大きさの単位と、何かを基準にした単位があります。",
      options: [
        ["px", "CSS のピクセル"],
        ["em", "その要素の文字の大きさ(font-size に使うときは親の文字の大きさ)"],
        ["rem", "ルート要素(html)の文字の大きさ"],
        ["%", "親要素などに対する割合"],
        ["vw / vh", "ビューポートの幅・高さの1%"]
      ],
      notes: ["em は入れ子になるとかけ算で大きくなっていくので、文字の大きさには rem が使いやすいです。"]
    },
    {
      id: "media-query", name: "メディアクエリ", en: "Media queries",
      desc: "画面の幅や設定などの条件で、当てるスタイルを切りかえます。画面の幅に合わせて見た目を変えることをレスポンシブデザインといいます。",
      code: [{ lang: "css", text: "@media (max-width: 600px) {\n  .menu { flex-direction: column; }\n}\n@media (prefers-color-scheme: dark) {\n  body { background: #111; }\n}" }],
      notes: ["スマホ向けを先に書き、`min-width` で広い画面向けを足していく書き方を、モバイルファーストといいます。"]
    }
  ],
  questions: [
    {
      id: "c01", level: "basic", q: "`class=\"note\"` の要素を選ぶセレクタは?", kind: "code",
      choices: [".note", "#note", "note", "*note"],
      explain: "クラスは `.`、ID は `#` で選びます。`note` だけだと、`<note>` という名前の要素を選ぶことになります。",
      ref: "selectors"
    },
    {
      id: "c02", level: "basic", q: "親要素に指定すると、子要素にも引き継がれる(継承する)プロパティは?", kind: "code",
      choices: ["color", "border", "margin", "padding"],
      explain: "文字の色や大きさなど、文字に関するプロパティは継承します。margin・padding・border など箱に関するものは継承しません。",
      ref: "cascade"
    },
    {
      id: "c03", level: "basic", q: "枠線(border)の内側の余白を指定するプロパティは?", kind: "code",
      choices: ["padding", "margin", "outline", "gap"],
      explain: "内側から 内容 → padding → border → margin の順です。margin は枠線の外側の余白です。",
      ref: "box-model"
    },
    {
      id: "c04", level: "basic", q: "`box-sizing: border-box` を指定するとどうなる?", kind: "text",
      choices: [
        "width に padding と border を含めて計算する",
        "width に padding・border・margin まで含めて計算する",
        "width の指定を無視して、親要素の幅と同じにそろえる",
        "width に足して、padding と border の分だけ外側に広げる"
      ],
      explain: "border-box では、`width: 200px` なら padding や border を足しても見た目の幅は 200px のままです。レイアウトの計算がしやすくなります。",
      ref: "box-model"
    },
    {
      id: "c05", level: "basic", q: "横に並んだ項目を、左右の中央に寄せたい。空欄に入るプロパティは?", kind: "code",
      code: [{ lang: "css", text: ".menu {\n  display: flex;\n  ____: center;\n}" }],
      choices: ["justify-content", "align-items", "text-align", "vertical-align"],
      explain: "flex の既定の主軸は横(row)なので、横方向のそろえ方は `justify-content` です。`align-items` は交差軸(縦)のそろえ方です。",
      ref: "flexbox"
    },
    {
      id: "c06", level: "basic", q: "画面の幅が 600px 以下のときだけスタイルを当てたい。空欄に入るのは?", kind: "code",
      code: [{ lang: "css", text: "@media (____: 600px) {\n  .menu { display: none; }\n}" }],
      choices: ["max-width", "min-width", "width-max", "screen-width"],
      explain: "`max-width: 600px` は「幅が 600px 以下」、`min-width: 600px` は「幅が 600px 以上」という条件です。",
      ref: "media-query"
    },
    {
      id: "c07", level: "basic", q: "単位 `rem` が基準にするのは?", kind: "text",
      choices: [
        "ルート要素(html)の文字の大きさ",
        "すぐ外側にある親要素の文字の大きさ",
        "ビューポート(画面)の幅の1%",
        "画面の物理的な1ピクセルの大きさ"
      ],
      explain: "rem は root em の略で、html 要素の font-size が基準です。ブラウザの既定では 16px なので、1rem = 16px になります。",
      ref: "css-units"
    },
    {
      id: "c08", level: "std", q: "`<nav id=\"nav\" class=\"menu\">` の中の `<a>` の文字の色は?", kind: "text",
      code: [{ lang: "css", text: "#nav a { color: red; }\n.menu a { color: blue; }\na { color: green; }" }],
      choices: ["赤(red)", "青(blue)", "緑(green)", "ブラウザの既定の色"],
      explain: "詳細度は `#nav a` が (1,0,1)、`.menu a` が (0,1,1)、`a` が (0,0,1) です。ID を含む `#nav a` がいちばん強く、書いた順より優先されます。",
      ref: "specificity"
    },
    {
      id: "c09", level: "std", q: "詳細度がいちばん高いセレクタは?", kind: "code",
      choices: ["#header .logo", ".nav .item a", "header nav ul li a", "a:hover"],
      explain: "`#header .logo` は (1,1,0)、`.nav .item a` は (0,2,1)、`header nav ul li a` は (0,0,5)、`a:hover` は (0,1,1) です。ID の数から比べるので、ID を含むものが勝ちます。",
      ref: "specificity"
    },
    {
      id: "c10", level: "std", q: "`position: absolute` の要素は、何を基準に置かれる?", kind: "text",
      choices: [
        "position が static 以外の、最も近い祖先要素",
        "position の値に関係なく、すぐ外側にある親要素",
        "祖先に関係なく、いつもビューポート(画面)の左上の角",
        "ふつうの流れの中で、その要素がもともとあった位置"
      ],
      explain: "absolute は、position が relative などに指定された祖先を基準にします。そうした祖先がなければ、最初の包含ブロック(ページの左上の位置)が基準です。親に `position: relative` を付けるのがよくある書き方です。",
      ref: "position"
    },
    {
      id: "c11", level: "std", q: "幅 600px のコンテナ(gap なし)で、1列目の幅はいくつになる?", kind: "code",
      code: [{ lang: "css", text: ".wrap {\n  display: grid;\n  width: 600px;\n  grid-template-columns: 1fr 2fr;\n}" }],
      choices: ["200px", "300px", "400px", "100px"],
      explain: "`1fr 2fr` は、場所を 1:2 に分けます。600px を3つに分けた1つ分なので、1列目は 200px、2列目は 400px です。",
      ref: "grid"
    },
    {
      id: "c12", level: "std", q: "`display: flex`(横並び)で、項目の縦方向の位置をそろえるプロパティは?", kind: "code",
      choices: ["align-items", "justify-content", "flex-direction", "vertical-align"],
      explain: "横並びのとき、縦は交差軸です。交差軸のそろえ方は `align-items` で決めます。`vertical-align` は inline の要素や表のセルに使うもので、flex の子には効きません。",
      ref: "flexbox"
    },
    {
      id: "c13", level: "std", q: "`position: sticky` について正しいのは?", kind: "text",
      choices: [
        "top などを指定すると、スクロールでその位置に来たら貼りつく",
        "指定するとすぐに、ビューポートの左上に固定されて動かなくなる",
        "親要素の外まではみ出して、ページの最後まで貼りつき続ける",
        "absolute と同じく流れから外れ、元の場所は詰められる"
      ],
      explain: "sticky は、しきい値(`top: 0` など)の位置に来るまではふつうに流れ、来たら貼りつきます。親要素の範囲を出ると一緒に流れていき、元の場所も空いたままです。",
      ref: "position"
    },
    {
      id: "c14", level: "pro", q: "`.child` の padding は何px になる?", kind: "code",
      code: [{ lang: "css", text: ".parent { font-size: 20px; }\n.child {\n  font-size: 1.5em;\n  padding: 1em;\n}" }],
      choices: ["30px", "20px", "16px", "45px"],
      explain: "font-size の em は親が基準なので、`.child` の文字は 20 × 1.5 = 30px です。ほかのプロパティの em はその要素自身の文字の大きさが基準なので、padding は 30px になります。",
      ref: "css-units"
    },
    {
      id: "c15", level: "pro", q: "`<p style=\"color: blue\">` の文字の色は?", kind: "text",
      code: [{ lang: "css", text: "p { color: red !important; }" }],
      choices: ["赤(red)", "青(blue)", "黒(既定の色)", "紫(2つが混ざる)"],
      explain: "style 属性はふつうのセレクタより強いですが、`!important` の付いた宣言はそれより優先されます。`!important` は強すぎて上書きしにくくなるので、多用しません。",
      ref: "specificity"
    },
    {
      id: "c16", level: "basic", q: "要素を表示せず、場所も取らないようにする指定は?", kind: "code",
      choices: ["display: none", "visibility: hidden", "opacity: 0", "position: absolute"],
      explain: "`display: none` は描画の対象から外します。`visibility: hidden` と `opacity: 0` は見えなくなるだけで、場所は取ったままです。",
      ref: "display"
    }
  ]
});


// =====================================================================
// 06 JavaScriptとDOM・非同期
// =====================================================================
WEBD.register("js-dom", {
  cards: [
    {
      id: "query-selector", name: "querySelector", mono: true, en: "Document.querySelector()",
      desc: "CSS のセレクタで要素を探します。`querySelector` は最初の1つ(なければ `null`)、`querySelectorAll` は当てはまるすべてを NodeList で返します。",
      code: [{ lang: "js", text: "const t = document\n  .querySelector(\"#title\");\nconst items = document\n  .querySelectorAll(\".item\");" }],
      notes: ["`querySelectorAll` の NodeList は、取り出したあとに要素が増えても変わりません(静的)。"]
    },
    {
      id: "text-vs-html", name: "textContent と innerHTML", mono: true, en: "Node.textContent / Element.innerHTML",
      desc: "`textContent` は文字としてそのまま入れ、`innerHTML` は HTML として解析して入れます。",
      code: [{ lang: "js", text: "el.textContent = \"<b>Hi</b>\";\n// 画面: <b>Hi</b>(文字のまま)\nel.innerHTML = \"<b>Hi</b>\";\n// 画面: 太字の Hi" }],
      notes: ["利用者の入力やURLの値を `innerHTML` に入れると、XSS の原因になります。文字を出すだけなら `textContent` を使います。"]
    },
    {
      id: "events", name: "addEventListener", mono: true, en: "EventTarget.addEventListener()",
      desc: "要素でイベント(クリック・入力・送信など)が起きたときに動く関数(リスナー)を登録します。",
      code: [{ lang: "js", text: "const f = (e) => log(e.target);\nbtn.addEventListener(\"click\", f);" }],
      options: [
        ["click", "クリック・タップ"],
        ["input", "入力欄の値が変わるたび"],
        ["submit", "フォームを送信するとき"],
        ["keydown", "キーを押したとき"]
      ]
    },
    {
      id: "bubbling", name: "バブリング", en: "Event bubbling",
      desc: "イベントは、起きた要素(target)から始まり、親、さらにその親へと順に伝わっていきます(バブリング)。途中で止めるには `stopPropagation()` を呼びます。",
      code: [{ cap: "inner は outer の中", lang: "js", text: "outer.onclick = () => log(\"outer\");\ninner.onclick = () => log(\"inner\");\n// inner を押す → inner, outer" }],
      notes: ["実際には、外側から target まで下りていく段階(キャプチャ)が先にあります。`addEventListener` の第3引数に `{ capture: true }` を渡すと、その段階で受け取れます。"]
    },
    {
      id: "prevent-default", name: "preventDefault", mono: true, en: "Event.preventDefault()",
      desc: "フォームの送信やリンクの移動など、ブラウザが既定で行う動作を止めます。イベントが親に伝わること(バブリング)は止めません。",
      code: [{ lang: "js", text: "form.onsubmit = (e) => {\n  e.preventDefault();\n  // ページを移らずに送る処理\n};" }]
    },
    {
      id: "delegation", name: "イベント委譲", en: "Event delegation",
      desc: "子要素の1つ1つではなく、親に1つだけリスナーを置き、`event.target` からどの子が押されたかを調べる方法です。あとから増えた子にも効きます。",
      code: [{ lang: "js", text: "list.onclick = (e) => {\n  const li = e.target.closest(\"li\");\n  if (li) select(li);\n};" }]
    },
    {
      id: "event-loop", name: "イベントループ", en: "Event loop",
      desc: "JavaScript は1つのスレッドで動き、いまの処理が終わってから、待っている仕事を1つずつ取り出して実行します。Promise の `then` などのマイクロタスクは、`setTimeout` などのタスクより先に、まとめて実行されます。",
      code: [{ lang: "js", text: "log(\"A\");\nsetTimeout(() => log(\"B\"), 0);\nPromise.resolve()\n  .then(() => log(\"C\"));\nlog(\"D\");\n// → A D C B" }],
      notes: ["重い処理が長く続くと、そのあいだクリックへの反応や描画が止まります。"]
    },
    {
      id: "promise-async", name: "Promise と async/await", en: "Promise / async function",
      desc: "Promise は、あとで結果が出る処理を表すオブジェクトです。`async` を付けた関数は必ず Promise を返し、その中では `await` で結果を待てます。",
      code: [{ lang: "js", text: "async function load() {\n  const r = await fetch(\"/a\");\n  return r.json();\n}\nconst [a, b] = await Promise.all(\n  [load(), load()]);" }],
      options: [
        ["Promise.all", "全部が終わるのを待つ(1つでも失敗すると失敗)"],
        ["try / catch", "await で失敗(reject)を受け取る"]
      ],
      notes: ["例の最後の行のように関数の外で `await` を書けるのは、モジュール(`<script type=\"module\">`)の中だけです。普通のスクリプトでは async 関数の中で使います。"]
    },
    {
      id: "fetch-json", name: "fetch と JSON", en: "Fetch API / JSON",
      desc: "`fetch` は HTTP のリクエストを送り、レスポンスを Promise で返します。JSON は、データを文字列でやりとりする形式で、`JSON.parse` で値に、`JSON.stringify` で文字列にします。",
      code: [{ lang: "js", text: "const res = await fetch(\"/api\");\nif (!res.ok) throw new Error();\nconst data = await res.json();" }],
      notes: [
        "`fetch` は、404 や 500 が返っても失敗(reject)にはなりません。`res.ok`(200〜299 なら true)を確かめます。reject になるのは、通信そのものができなかったときです。",
        "`JSON.stringify` は、値が `undefined` のプロパティや関数を出力しません。"
      ]
    },
    {
      id: "let-const", name: "let と const", en: "Block-scoped declarations",
      desc: "`let` と `const` で宣言した変数は、`{ }` の中(ブロック)でだけ使えます。`const` は再代入ができませんが、中身のオブジェクトや配列は変更できます。",
      code: [{ lang: "js", text: "const list = [1, 2];\nlist.push(3);   // できる\nlist = [];      // エラー" }],
      notes: ["for 文で `let` を使うと、くり返しの1回ごとに別の変数になります。古い `var` は関数全体で1つです。"]
    }
  ],
  questions: [
    {
      id: "j01", level: "basic", q: "`id=\"title\"` の要素を1つ取り出したい。空欄に入るのは?", kind: "code",
      code: [{ lang: "js", text: "const t =\n  document.____(\"#title\");" }],
      choices: ["querySelector", "querySelectorAll", "getElementsByName", "createElement"],
      explain: "`querySelector` は、CSS のセレクタに合う最初の1つを返します。`querySelectorAll` は合うものすべてをまとめた NodeList を返します。",
      ref: "query-selector"
    },
    {
      id: "j02", level: "basic", q: "`const` で宣言した変数について正しいのは?", kind: "text",
      choices: [
        "同じ変数に、別の値を再代入できない",
        "中のオブジェクトの中身も変更できない",
        "関数の外からは、決して読めない",
        "宣言より前の行でも、値を読める"
      ],
      explain: "const は再代入を禁止しますが、入っている配列に `push` するなど、中身の変更はできます。宣言より前で読むとエラーになります。",
      ref: "let-const"
    },
    {
      id: "j03", level: "basic", q: "このコードの結果は?", kind: "code",
      code: [{ lang: "js", text: "JSON.parse('{\"a\": 1}').a" }],
      choices: ["1", "\"1\"", "undefined", "\"a\""],
      explain: "`JSON.parse` は JSON の文字列を値に直します。`{\"a\": 1}` はプロパティ a に数値 1 を持つオブジェクトになります。",
      ref: "fetch-json"
    },
    {
      id: "j04", level: "basic", q: "ボタンをクリックしたときに `onClick` を動かしたい。空欄に入るのは?", kind: "code",
      code: [{ lang: "js", text: "btn.____(\"click\", onClick);" }],
      choices: ["addEventListener", "dispatchEvent", "removeEventListener", "createEvent"],
      explain: "`addEventListener(イベント名, 関数)` でリスナーを登録します。`dispatchEvent` はイベントを自分で起こすときに使います。",
      ref: "events"
    },
    {
      id: "j05", level: "std", q: "このコードを実行すると、画面はどうなる?", kind: "text",
      code: [{ lang: "js", text: "el.textContent = \"<b>Hi</b>\";" }],
      choices: [
        "「<b>Hi</b>」が文字のまま表示される",
        "タグが解釈され、太字の「Hi」が表示される",
        "何も表示されず、コンソールにエラーが出る",
        "タグだけが取り除かれ、「Hi」が太字なしで出る"
      ],
      explain: "`textContent` は HTML として解析せず、文字のまま入れます。太字にしたいときは `innerHTML` を使いますが、利用者の入力を入れると XSS の危険があります。",
      ref: "text-vs-html"
    },
    {
      id: "j06", level: "std", q: "利用者が入力した文字を画面に表示する。安全なのはどれに入れる方法?", kind: "code",
      choices: ["textContent", "innerHTML", "outerHTML", "insertAdjacentHTML"],
      explain: "`textContent` は文字として入れるので、`<script>` などが入っていても動きません。ほかの3つは HTML として解析します。",
      ref: "text-vs-html"
    },
    {
      id: "j07", level: "std", q: "`event.preventDefault()` の働きは?", kind: "text",
      choices: [
        "フォームの送信やリンクの移動など、既定の動作を止める",
        "親要素へイベントが伝わること(バブリング)を止める",
        "同じ要素に登録した、ほかのリスナーを止める",
        "このリスナーを、イベントの登録から外す"
      ],
      explain: "既定の動作を止めるのが preventDefault です。親へ伝わるのを止めるのは `stopPropagation`、同じ要素のほかのリスナーまで止めるのは `stopImmediatePropagation` です。",
      ref: "prevent-default"
    },
    {
      id: "j08", level: "std", q: "inner は outer の中にある。inner をクリックしたときの表示の順番は?", kind: "code",
      code: [{ lang: "js", text: "outer.onclick = () => log(\"outer\");\ninner.onclick = () => log(\"inner\");" }],
      choices: ["inner → outer", "outer → inner", "inner だけ", "outer だけ"],
      explain: "クリックのイベントは、押した要素(inner)から親(outer)へと伝わります(バブリング)。",
      ref: "bubbling"
    },
    {
      id: "j09", level: "std", q: "「イベント委譲」の説明として正しいのは?", kind: "text",
      choices: [
        "親に1つリスナーを置き、event.target で押された子を調べる",
        "子要素の1つ1つに、同じ働きのリスナーを複製して付けていく",
        "リスナーを window に1つ置き、ページのすべてのイベントを止める",
        "イベントの処理を Web Worker にまかせ、別のスレッドで並列に動かす"
      ],
      explain: "バブリングを利用して、親でまとめて受け取ります。リスナーが1つで済み、あとから追加した子にも効きます。",
      ref: "delegation"
    },
    {
      id: "j10", level: "std", q: "このコードの `r` は何になる?", kind: "text",
      code: [{ lang: "js", text: "async function f() {\n  return 1;\n}\nconst r = f();" }],
      choices: [
        "1 で解決される Promise",
        "undefined で解決される Promise",
        "数値の 1(そのまま返る)",
        "関数 f そのもの"
      ],
      explain: "async 関数は、いつも Promise を返します。中で `return 1` すると、1 で解決される Promise になります。値を取り出すには `await f()` と書きます。",
      ref: "promise-async"
    },
    {
      id: "j11", level: "std", q: "このコードの結果は?", kind: "code",
      code: [{ lang: "js", text: "JSON.stringify({\n  a: 1,\n  b: undefined\n})" }],
      choices: ["'{\"a\":1}'", "'{\"a\":1,\"b\":undefined}'", "'{\"a\":1,\"b\":null}'", "'{a:1}'"],
      explain: "JSON には undefined がないので、値が undefined のプロパティは出力されません。配列の中の undefined は null になります。",
      ref: "fetch-json"
    },
    {
      id: "j12", level: "std", q: "このコードで表示されるのは?", kind: "code",
      code: [{ lang: "js", text: "for (let i = 0; i < 3; i++) {\n  setTimeout(() => log(i), 0);\n}" }],
      choices: ["0 1 2", "3 3 3", "1 2 3", "0 0 0"],
      explain: "for 文の `let` は、くり返しごとに別の変数になるので、それぞれの関数は 0・1・2 を覚えています。`var` で書くと変数が1つだけなので、3 3 3 になります。",
      ref: "let-const"
    },
    {
      id: "j13", level: "pro", q: "表示される順番は?", kind: "code",
      code: [{ lang: "js", text: "log(\"A\");\nsetTimeout(() => log(\"B\"), 0);\nPromise.resolve()\n  .then(() => log(\"C\"));\nlog(\"D\");" }],
      choices: ["A D C B", "A B C D", "A D B C", "A C D B"],
      explain: "まず同期の A と D が出ます。そのあと、Promise の then(マイクロタスク)が、setTimeout(タスク)より先に実行されるので C、最後に B です。",
      ref: "event-loop"
    },
    {
      id: "j14", level: "pro", q: "`fetch` でリクエストしたら、サーバーが 404 を返した。どうなる?", kind: "text",
      choices: [
        "Promise は解決され、res.ok が false になる",
        "Promise が拒否(reject)され、catch に進む",
        "res.status が 0 になり、本文は読めない",
        "ブラウザが自動で、もう一度リクエストを送る"
      ],
      explain: "fetch は、HTTP のレスポンスが返ってくれば成功として解決されます。エラーのステータスは `res.ok` や `res.status` で確かめます。reject になるのは、通信そのものができなかったときです。",
      ref: "fetch-json"
    },
    {
      id: "j15", level: "std", q: "互いに関係のない3つの API を呼ぶ。いちばん早く全部の結果がそろう書き方は?", kind: "text",
      choices: [
        "Promise.all で3つを同時に始め、まとめて待つ",
        "for 文の中で1つずつ await して、順に待つ",
        "setTimeout で3つを、100ミリ秒ずつずらして送る",
        "async を付けずに呼び、結果を同期的に受け取る"
      ],
      explain: "1つずつ await すると、前のレスポンスが来るまで次を送りません。`Promise.all` なら3つを同時に送り、いちばん遅いものの時間で全部そろいます。",
      ref: "promise-async"
    }
  ]
});


// =====================================================================
// 07 Cookie・セッション・ストレージ
// =====================================================================
WEBD.register("state", {
  cards: [
    {
      id: "cookie", name: "Cookie", en: "HTTP cookie",
      desc: "サーバーがレスポンスの `Set-Cookie` で保存させ、ブラウザが以後のリクエストの `Cookie` ヘッダーで送り返す、小さなデータです。ステートレスな HTTP で、ログイン状態などを続けるのに使います。",
      code: [
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\nSet-Cookie: sid=a3f9; Path=/;\n  Secure; HttpOnly" },
        { cap: "次からのリクエスト", lang: "http", text: "GET /mypage HTTP/1.1\nCookie: sid=a3f9" }
      ],
      notes: ["上の Set-Cookie は見やすさのために2行に分けています。実際は1行です。"]
    },
    {
      id: "cookie-scope", name: "Domain・Path", en: "Cookie scope",
      desc: "どのURLへのリクエストに Cookie を送るかを決める属性です。",
      options: [
        ["Domain なし", "設定したホストだけに送る(サブドメインには送らない)"],
        ["Domain=example.com", "example.com と、そのすべてのサブドメインに送る"],
        ["Path=/app", "/app と、その下のパスに送る"]
      ],
      notes: ["Domain を書くと送り先が広がります。必要がなければ書かない方が安全です。"]
    },
    {
      id: "cookie-expiry", name: "Expires・Max-Age", en: "Cookie lifetime",
      desc: "Cookie の有効期限です。`Expires` は日時、`Max-Age` は秒数で書き、両方あれば `Max-Age` が優先されます。どちらもない Cookie はセッションCookieで、ブラウザのセッションが終わると消えます。",
      options: [
        ["Max-Age=3600", "1時間後に消える"],
        ["Max-Age=0", "すぐに消す(削除に使う)"],
        ["Expires=日時", "その日時に消える"],
        ["どちらもなし", "セッションCookie"]
      ],
      notes: ["ブラウザの「前回のタブを開く」設定などで、セッションCookieが残ることもあります。"]
    },
    {
      id: "cookie-security", name: "Secure・HttpOnly", en: "Cookie security attributes",
      desc: "`Secure` を付けると、HTTPS の通信のときだけ送ります。`HttpOnly` を付けると、JavaScript の `document.cookie` から読めなくなります。",
      notes: ["HttpOnly は、XSS でスクリプトを動かされたときに、セッションIDを盗まれる被害を減らします。XSS そのものを防ぐわけではありません。"]
    },
    {
      id: "samesite", name: "SameSite", en: "SameSite attribute",
      desc: "別のサイトから来たリクエストに、Cookie を送るかどうかを決めます。CSRF の対策になります。",
      options: [
        ["Strict", "別サイトからのリクエストには、リンクで来たときも送らない"],
        ["Lax", "別サイトからは、リンクでページを移るとき(GET)だけ送る。フォームの POST や画像では送らない"],
        ["None", "いつも送る。Secure が必須"]
      ],
      notes: ["SameSite を書かない Cookie を、Chrome は Lax として扱います。", "ただし Chrome は、SameSite を書かずに作られて2分以内の Cookie を、別サイトからのページ移動を伴う POST でも送ります(Lax+POST の例外)。対策としては SameSite を明示して書きます。"]
    },
    {
      id: "session", name: "セッション", en: "Session management",
      desc: "サーバーが利用者ごとのデータ(ログイン中の人など)を保存し、その鍵となるセッションIDを Cookie で渡すしくみです。ブラウザは毎回セッションIDを送り、サーバーはそれで利用者を見分けます。",
      notes: [
        "セッションIDは、推測できない長いランダムな値にします。",
        "ログインに成功したら、セッションIDを新しく作り直します。攻撃者が前もって用意したIDを使わせる「セッション固定攻撃」を防ぐためです。"
      ]
    },
    {
      id: "web-storage", name: "localStorage と sessionStorage", mono: true, en: "Web Storage API",
      desc: "ブラウザに文字列を保存する場所で、オリジンごとに分かれます。`localStorage` は閉じても残り、`sessionStorage` はタブごとに分かれて、そのタブを閉じると消えます。",
      code: [{ lang: "js", text: "localStorage.setItem(\"n\", 5);\nlocalStorage.getItem(\"n\");\n// → \"5\"(文字列になる)" }],
      notes: [
        "保存できるのは文字列だけです。オブジェクトは `JSON.stringify` してから保存します。",
        "サーバーには自動で送られません。JavaScript から読めるので、XSS があると中身を読まれます。"
      ]
    },
    {
      id: "indexeddb", name: "IndexedDB", en: "Indexed Database API",
      desc: "ブラウザの中のデータベースです。オブジェクトや画像などのデータを大量に保存でき、読み書きは非同期で、トランザクションを使えます。オフラインで動くアプリなどで使います。",
      notes: ["localStorage は同期的に動くので、大きなデータを扱うと画面が止まりやすくなります。"]
    },
    {
      id: "jwt", name: "トークン認証とJWT", en: "JSON Web Token",
      desc: "ログインに成功すると、サーバーが署名つきのトークンを渡し、クライアントは以後 `Authorization: Bearer <トークン>` で送ります。JWT は `ヘッダー.ペイロード.署名` を Base64URL で書いたトークンの形式です。",
      code: [{ cap: "リクエスト", lang: "http", text: "GET /api/me HTTP/1.1\nAuthorization: Bearer eyJhbGc…" }],
      notes: [
        "署名つきのJWTのペイロードは暗号化されていないので、だれでも中身を読めます。パスワードなどの秘密を入れてはいけません。",
        "署名で改ざんは見破れますが、発行したトークンを途中で無効にしにくいので、有効期限(`exp`)を短くします。"
      ]
    }
  ],
  questions: [
    {
      id: "s01", level: "basic", q: "サーバーがブラウザに Cookie を保存させるときに使うヘッダーは?", kind: "code",
      choices: ["Set-Cookie", "Cookie", "Authorization", "Content-Type"],
      explain: "レスポンスの `Set-Cookie` で保存させ、ブラウザは以後のリクエストの `Cookie` ヘッダーで送り返します。",
      ref: "cookie"
    },
    {
      id: "s02", level: "basic", q: "ブラウザを閉じても残り、同じオリジンのページから読み書きできる保存場所は?", kind: "code",
      choices: ["localStorage", "sessionStorage", "window.name", "history.state"],
      explain: "`localStorage` は消すまで残ります。`sessionStorage` は、そのタブを閉じると消えます。",
      ref: "web-storage"
    },
    {
      id: "s03", level: "basic", q: "ブラウザが保存している Cookie をサーバーへ送るときのリクエストヘッダーは?", kind: "code",
      code: [{ cap: "リクエスト", lang: "http", text: "GET /mypage HTTP/1.1\nHost: example.com\n____: sid=a3f9" }],
      choices: ["Cookie", "Set-Cookie", "Session", "Authorization"],
      explain: "リクエストでは `Cookie` ヘッダーで送ります。`Set-Cookie` はサーバーが保存させるときのレスポンスヘッダーです。",
      ref: "cookie"
    },
    {
      id: "s04", level: "std", q: "Cookie の `HttpOnly` 属性の働きは?", kind: "text",
      choices: [
        "JavaScript(document.cookie)から読めなくする",
        "HTTPS の通信のときだけ、Cookie を送るようにする",
        "別のサイトから来たリクエストには、Cookie を付けないようにする",
        "ブラウザを閉じたときに、Cookie が自動で消えるようにする"
      ],
      explain: "HttpOnly の Cookie は HTTP の通信でだけ使われ、スクリプトからは読めません。HTTPS だけで送るのは `Secure`、別サイトからの送信を制限するのは `SameSite` です。",
      ref: "cookie-security"
    },
    {
      id: "s05", level: "std", q: "Cookie の `Secure` 属性の働きは?", kind: "text",
      choices: [
        "HTTPS の通信のときだけ Cookie を送る",
        "Cookie の値をブラウザの中で暗号化して保存する",
        "JavaScript から Cookie を読めなくする",
        "同じサイトからのリクエストだけに送る"
      ],
      explain: "Secure を付けると、暗号化されていない HTTP の通信では送りません。値そのものを暗号化するわけではありません。",
      ref: "cookie-security"
    },
    {
      id: "s06", level: "std", q: "`Expires` も `Max-Age` も付けずに設定した Cookie はどうなる?", kind: "text",
      choices: [
        "セッションCookieとなり、ブラウザのセッションが終わると消える",
        "保存されず、そのレスポンスを受け取っているあいだだけ使われる",
        "期限がないので、利用者が消すまでずっと残り続ける",
        "最初の1回のリクエストで送られたら、その場で消える"
      ],
      explain: "期限のない Cookie はセッションCookieです。ずっと残したいときは `Max-Age` や `Expires` を付けます。",
      ref: "cookie-expiry"
    },
    {
      id: "s07", level: "std", q: "`sessionStorage` について正しいのは?", kind: "text",
      choices: [
        "タブごとに分かれ、そのタブを閉じると消える",
        "同じオリジンなら、すべてのタブで共有される",
        "リクエストのたびに、サーバーへ自動で送られる",
        "ブラウザを閉じても、次に開いたとき残っている"
      ],
      explain: "sessionStorage はオリジンとタブの組みごとに分かれます。同じサイトを別のタブで開くと、別の保存場所になります。",
      ref: "web-storage"
    },
    {
      id: "s08", level: "std", q: "`SameSite=Lax` の Cookie はいつ送られる?", kind: "text",
      choices: [
        "別サイトのリンクで来たときは送り、別サイトからの POST では送らない",
        "別サイトからのリクエストでも、種類に関係なくいつも Cookie を送る",
        "同じサイトからのときだけ送り、別サイトのリンクで来たときも送らない",
        "HTTPS の通信のときだけ送り、サイトが同じか違うかは関係ない"
      ],
      explain: "Lax は、別サイトのリンクからページを開いたとき(トップレベルの GET)には送り、別サイトのフォームの POST や画像の読み込みでは送りません。リンクで来たときも送らないのは Strict です。",
      ref: "samesite"
    },
    {
      id: "s09", level: "std", q: "`SameSite=None` の Cookie に、一緒に付けなければならない属性は?", kind: "code",
      choices: ["Secure", "HttpOnly", "Domain", "Path"],
      explain: "別サイトからのリクエストにも送る `SameSite=None` は、`Secure` がないと受け付けられません。",
      ref: "samesite"
    },
    {
      id: "s10", level: "std", q: "`www.example.com` が、Domain 属性なしで Cookie を設定した。この Cookie が送られる先は?", kind: "text",
      code: [{ cap: "レスポンス", lang: "http", text: "Set-Cookie: id=abc; Path=/" }],
      choices: [
        "www.example.com だけ",
        "example.com とすべてのサブドメイン",
        "example.com だけ(www には送らない)",
        "同じIPアドレスのすべてのホスト"
      ],
      explain: "Domain を書かない Cookie は、設定したホストだけに送られます。`Domain=example.com` と書くと、example.com とそのサブドメインすべてに広がります。",
      ref: "cookie-scope"
    },
    {
      id: "s11", level: "std", q: "このコードの結果は?", kind: "code",
      code: [{ lang: "js", text: "localStorage.setItem(\"n\", 5);\ntypeof localStorage.getItem(\"n\");" }],
      choices: ["\"string\"", "\"number\"", "\"object\"", "\"undefined\""],
      explain: "Web Storage には文字列しか保存できず、数値の 5 は \"5\" になります。数値として使うときは `Number()` で戻します。",
      ref: "web-storage"
    },
    {
      id: "s12", level: "std", q: "オフラインでも使えるアプリで、大量のデータを非同期で保存したい。適した保存場所は?", kind: "code",
      choices: ["IndexedDB", "localStorage", "sessionStorage", "Cookie"],
      explain: "IndexedDB はブラウザの中のデータベースで、大きなデータを非同期で扱えます。localStorage は同期的で、文字列しか保存できません。Cookie は毎回サーバーへ送られます。",
      ref: "indexeddb"
    },
    {
      id: "s13", level: "pro", q: "署名つきのJWTのペイロード(真ん中の部分)について正しいのは?", kind: "text",
      choices: [
        "Base64URL で書かれただけで、だれでも中身を読める",
        "サーバーの秘密鍵で暗号化され、発行したサーバーしか読めない",
        "ハッシュ値になっているので、元の内容には決して戻せない",
        "ブラウザに結びつけてあり、ほかの端末では中身を読めない"
      ],
      explain: "ペイロードは符号化されているだけで、暗号化はされていません。署名は改ざんを見破るためのものです。秘密の情報を入れてはいけません。",
      ref: "jwt"
    },
    {
      id: "s14", level: "pro", q: "ログインに成功したときに、セッションIDを作り直す理由は?", kind: "text",
      choices: [
        "攻撃者が先に用意したセッションIDを、使い続けられないようにするため",
        "ログイン前のカートなどの情報を、すべて捨てて初期化するため",
        "セッションIDを短くして、リクエストを速く送れるようにするため",
        "Cookie の有効期限を延ばし、ログイン状態を長く保つため"
      ],
      explain: "セッション固定攻撃の対策です。攻撃者が自分の知っているセッションIDを利用者に使わせ、そのままログインされると乗っ取られてしまいます。",
      ref: "session"
    },
    {
      id: "s15", level: "pro", q: "この Cookie の有効期限はどうなる?", kind: "text",
      code: [{ cap: "レスポンス", lang: "http", text: "Set-Cookie: a=1; Max-Age=60;\n  Expires=Wed, 01 Jan 2031\n  00:00:00 GMT" }],
      choices: [
        "Max-Age が優先され、60秒後に消える",
        "Expires が優先され、2031年まで残る",
        "2つが食い違うので、保存されない",
        "早い方ではなく、遅い方の期限が使われる"
      ],
      explain: "両方あるときは `Max-Age` が優先されます。(この例は見やすさのために3行に分けています。)",
      ref: "cookie-expiry"
    }
  ]
});


// =====================================================================
// 08 HTTPSと攻撃対策
// =====================================================================
WEBD.register("security", {
  cards: [
    {
      id: "https-tls", name: "HTTPSとTLS", en: "HTTP over TLS",
      desc: "HTTPS は、HTTP の通信を TLS で守ったものです。通信の暗号化(盗み見を防ぐ)、改ざんの検出、相手が本物のサーバーであることの確認(証明書)の3つを行います。",
      notes: ["HTTPS が守るのは通信の途中だけです。サーバーに保存したデータの流出や、サイトのプログラムの欠陥(XSS など)は防げません。"]
    },
    {
      id: "tls-handshake", name: "TLSハンドシェイク", en: "TLS handshake",
      desc: "通信を始める前に、使う暗号を決め、サーバーの証明書を確かめ、鍵交換(ECDHE など)で共通の鍵を作ります。そのあとの通信は、その共通鍵による共通鍵暗号で速く暗号化します。",
      options: [
        ["ClientHello", "使える暗号の一覧と、鍵交換の材料を送る"],
        ["ServerHello", "使う暗号を選び、鍵交換の材料を返す。証明書は、続くメッセージで暗号化して送る(TLS 1.3)"],
        ["共通鍵", "両者が同じ鍵を計算で得る。鍵そのものは送らない"]
      ],
      notes: ["TLS 1.3 では、ハンドシェイクが1往復で済みます。"]
    },
    {
      id: "certificate", name: "証明書と認証局", en: "Certificate / Certificate Authority",
      desc: "サーバー証明書は、ドメイン名と公開鍵を結びつけ、認証局(CA)が署名したものです。ブラウザは、信頼している認証局までの署名のつながり、ドメイン名、有効期限を確かめます。",
      notes: ["Let's Encrypt のように、無料で自動発行できる認証局もあります。証明書の期限が切れると、ブラウザは警告を出します。"]
    },
    {
      id: "hsts", name: "HSTS", en: "HTTP Strict Transport Security",
      desc: "このサイトには一定の期間 HTTPS だけで接続するよう、ブラウザに覚えさせるヘッダーです。利用者が `http://` で開こうとしても、ブラウザが最初から HTTPS に変えます。",
      code: [{ cap: "レスポンス", lang: "http", text: "Strict-Transport-Security:\n  max-age=31536000;\n  includeSubDomains" }],
      notes: ["初めての訪問のときは、まだ HSTS を知らないので、HTTP で接続してしまう可能性があります。ブラウザに組みこまれた HSTS preload リストに登録すると、初回から HTTPS になります。"]
    },
    {
      id: "xss", name: "XSS", en: "Cross-Site Scripting",
      desc: "攻撃者のスクリプトを、ほかの利用者のブラウザで、そのサイトのページとして動かす攻撃です。Cookie の盗み出しや、なりすました操作に使われます。",
      options: [
        ["反射型", "URL などに入れたスクリプトが、そのままレスポンスに出て動く"],
        ["格納型", "掲示板などに保存されたスクリプトが、ほかの人が開いたときに動く"],
        ["DOMベース", "JavaScript が URL の値などを innerHTML に入れて動く"]
      ],
      notes: [
        "基本の対策は、出力する場所に合わせたエスケープです(HTML なら `<` を `&lt;` に)。JavaScript では `textContent` を使います。",
        "CSP は、エスケープ漏れがあったときの被害を減らす、追加の守りです。"
      ]
    },
    {
      id: "csrf", name: "CSRF", en: "Cross-Site Request Forgery",
      desc: "ログイン中の利用者に、攻撃者のサイトから、本物のサイトへのリクエスト(送金・設定変更など)を意図せず送らせる攻撃です。ブラウザが Cookie を自動で付けることを悪用します。",
      options: [
        ["CSRFトークン", "フォームに推測できない値を入れ、サーバーで照合する"],
        ["SameSite", "別サイトからのリクエストに Cookie を送らせない"],
        ["Origin の確認", "リクエストの Origin ヘッダーが自分のサイトか確かめる"]
      ]
    },
    {
      id: "sqli", name: "SQLインジェクション", en: "SQL injection",
      desc: "入力した文字を SQL の文に文字列としてつなげると、`' OR '1'='1` のような入力で SQL の意味を変えられてしまう攻撃です。プレースホルダ(プリペアドステートメント)で、値を SQL と分けて渡して防ぎます。",
      code: [
        { cap: "危ない(文字列をつなげる)", lang: "js", text: "const sql = \"SELECT * FROM u \" +\n  \"WHERE name = '\" + name + \"'\";\ndb.query(sql);" },
        { cap: "安全(プレースホルダ)", lang: "js", text: "db.query(\"SELECT * FROM u \" +\n  \"WHERE name = ?\", [name]);" }
      ]
    },
    {
      id: "clickjacking", name: "クリックジャッキング", en: "Clickjacking",
      desc: "本物のページを透明な iframe で重ね、利用者にボタンを押させる攻撃です。自分のページをほかのサイトに埋め込ませないことで防ぎます。",
      code: [{ cap: "レスポンス", lang: "http", text: "X-Frame-Options: DENY" }],
      notes: ["いまは CSP の `frame-ancestors` で指定するのが基本です(単元09)。古いブラウザのために X-Frame-Options も一緒に送ることがあります。"]
    },
    {
      id: "password-hash", name: "パスワードの保存", en: "Password hashing",
      desc: "パスワードはそのまま保存せず、利用者ごとのソルト(ランダムな値)を加え、bcrypt・scrypt・Argon2 のような、わざと計算に時間がかかるハッシュ関数で保存します。",
      notes: [
        "ハッシュは元に戻せないので、データが漏れても、パスワードそのものはすぐにはわかりません。",
        "SHA-256 などの速いハッシュを1回かけるだけでは、総当たりで調べられやすく不十分です。暗号化(元に戻せる)や Base64 は使いません。"
      ]
    }
  ],
  questions: [
    {
      id: "x01", level: "basic", q: "HTTPS で、通信を暗号化するために使われるしくみは?", kind: "code",
      choices: ["TLS", "SSH", "FTP", "DNS"],
      explain: "HTTPS は HTTP を TLS で守ったものです。昔の名前から SSL と呼ばれることもあります。",
      ref: "https-tls"
    },
    {
      id: "x02", level: "basic", q: "HTTPS にすることで防げるのは?", kind: "text",
      choices: [
        "通信の途中での盗み見と改ざん",
        "サーバーに保存したデータの流出",
        "利用者が弱いパスワードを使うこと",
        "サイトのプログラムの欠陥による XSS"
      ],
      explain: "HTTPS が守るのは、ブラウザとサーバーのあいだの通信です。サーバーの中のデータや、プログラムの欠陥は別の対策が必要です。",
      ref: "https-tls"
    },
    {
      id: "x03", level: "basic", q: "SQLインジェクションを防ぐ基本の方法は?", kind: "text",
      choices: [
        "プレースホルダで、値を SQL の文と分けて渡す",
        "入力をすべて大文字に変えてから SQL に入れる",
        "SQL の文を Base64 に変えてから送る",
        "データベースのパスワードを長くする"
      ],
      explain: "プレースホルダ(`?` など)を使うと、入力は値としてだけ扱われ、SQL の意味を変えられません。",
      ref: "sqli"
    },
    {
      id: "x04", level: "std", q: "「格納型XSS」の説明として正しいのは?", kind: "text",
      choices: [
        "掲示板などに保存されたスクリプトが、ほかの人が開いたときに動く",
        "URL に入れたスクリプトが、そのままレスポンスに出て動く",
        "JavaScript が location.hash の値を DOM に書いて動く",
        "攻撃者のサイトから、本物のサイトへ操作を送らせる"
      ],
      explain: "格納型(持続型)は、サーバーに保存された入力が、見た人すべてのブラウザで動きます。2つ目は反射型、3つ目は DOMベースの XSS、4つ目は CSRF の説明です。",
      ref: "xss"
    },
    {
      id: "x05", level: "std", q: "XSS を防ぐ基本の対策は?", kind: "text",
      choices: [
        "出力する場所に合わせてエスケープする(< を &lt; に)",
        "入力された文字を、サーバーで暗号化してからデータベースに保存する",
        "ページを HTTPS で配信して、ブラウザとのあいだの通信を暗号化する",
        "Cookie に Secure 属性を付けて、HTTPS だけで送る"
      ],
      explain: "XSS は、入力がページの中で HTML やスクリプトとして解釈されることで起きます。出力するときにエスケープすれば、ただの文字として表示されます。",
      ref: "xss"
    },
    {
      id: "x06", level: "std", q: "CSRF(クロスサイト・リクエスト・フォージェリ)とは?", kind: "text",
      choices: [
        "ログイン中の人に、別サイトから意図しないリクエストを送らせる攻撃",
        "攻撃者のスクリプトを、ほかの利用者のブラウザで動かして操作する攻撃",
        "入力した文字で SQL の文を書きかえ、データベースを勝手に操作する攻撃",
        "暗号化されていない通信を途中で読み取り、パスワードを盗み出す攻撃"
      ],
      explain: "ブラウザは、別サイトから送られたリクエストにも Cookie を付けることがあります。それを悪用して、本人のふりをした操作をさせます。",
      ref: "csrf"
    },
    {
      id: "x07", level: "std", q: "CSRF の対策として正しいのは?", kind: "text",
      choices: [
        "フォームに推測できないトークンを入れ、サーバーで照合する",
        "入力された文字を HTML エスケープしてから表示する",
        "パスワードをハッシュ化してからデータベースに保存する",
        "SQL をプレースホルダで組み立ててから実行する"
      ],
      explain: "攻撃者のサイトは、本物のフォームにあるトークンを知りえないので、照合で見破れます。Cookie の SameSite 属性や、Origin ヘッダーの確認も対策になります。",
      ref: "csrf"
    },
    {
      id: "x08", level: "std", q: "このヘッダーを受け取ったブラウザはどうする?", kind: "text",
      code: [{ cap: "レスポンス", lang: "http", text: "Strict-Transport-Security:\n  max-age=31536000" }],
      choices: [
        "1年間、このサイトには HTTPS だけで接続する",
        "1年間、このページをキャッシュから表示する",
        "1年間、このサイトの Cookie を消さずに残す",
        "1年ごとに、サーバーの証明書を確かめ直す"
      ],
      explain: "HSTS です。31536000秒(1年)のあいだ、`http://` で開こうとしても、ブラウザが HTTPS に変えて接続します。",
      ref: "hsts"
    },
    {
      id: "x09", level: "std", q: "ブラウザがサーバー証明書で確かめることとして正しいのは?", kind: "text",
      choices: [
        "信頼する認証局の署名があり、ドメイン名と期限が合うか",
        "サーバーのIPアドレスが、国内のものになっているか",
        "サーバーのOSが、最新の版に更新されているか",
        "サイトの運営者が、個人か会社かのどちらか"
      ],
      explain: "ブラウザは、信頼している認証局までの署名のつながり、証明書のドメイン名が開いたホストと合うか、有効期限内かを確かめます。",
      ref: "certificate"
    },
    {
      id: "x10", level: "std", q: "自分のページを、ほかのサイトの iframe に埋め込ませないために使うヘッダーは?", kind: "code",
      choices: ["X-Frame-Options", "X-Content-Type-Options", "Access-Control-Allow-Origin", "Referrer-Policy"],
      explain: "`X-Frame-Options: DENY` などで埋め込みを禁止し、クリックジャッキングを防ぎます。いまは CSP の `frame-ancestors` で指定するのが基本です。",
      ref: "clickjacking"
    },
    {
      id: "x11", level: "std", q: "利用者のパスワードを保存する方法として適切なのは?", kind: "text",
      choices: [
        "ソルトを加え、bcrypt や Argon2 など遅いハッシュで保存する",
        "AES で暗号化し、復号に使う鍵を同じサーバーの中に置いて保存する",
        "SHA-256 で1回だけハッシュ化し、ソルトは付けずにそのまま保存する",
        "Base64 に変えて、人がそのままでは読めない形にしてから保存する"
      ],
      explain: "パスワード用のハッシュ関数は、わざと計算を遅くして総当たりを難しくします。ソルトで、同じパスワードでも違う値になるようにします。暗号化や Base64 は元に戻せてしまいます。",
      ref: "password-hash"
    },
    {
      id: "x12", level: "pro", q: "TLS で、やりとりするデータ本体の暗号化に使われるのは?", kind: "text",
      choices: [
        "ハンドシェイクで決めた共通鍵による共通鍵暗号",
        "サーバー証明書の公開鍵による公開鍵暗号",
        "認証局の秘密鍵による電子署名",
        "パスワードから作ったハッシュ値"
      ],
      explain: "公開鍵のしくみは、相手の確認と共通鍵を作るために使います。データ本体は、速い共通鍵暗号(AES-GCM など)で暗号化します。",
      ref: "tls-handshake"
    },
    {
      id: "x13", level: "pro", q: "HSTS preload リストにサイトを登録する目的は?", kind: "text",
      choices: [
        "初めての訪問から、HTTPS だけで接続させる",
        "ページを先に読み込み、表示を速くする",
        "証明書の期限が切れても、接続を続けさせる",
        "HTTP/3 を使えるサーバーだと先に知らせる"
      ],
      explain: "HSTS のヘッダーは、一度 HTTPS で接続しないと受け取れません。ブラウザに組みこまれた preload リストに入れば、初回から HTTPS で接続します。",
      ref: "hsts"
    },
    {
      id: "x14", level: "pro", q: "このコードの問題点は?", kind: "text",
      code: [{ lang: "js", text: "const q = location.hash.slice(1);\nconst s = decodeURIComponent(q);\nout.innerHTML = s;" }],
      choices: [
        "# 以降に入れたタグがそのまま解釈され、XSS になる",
        "# 以降がサーバーに送られ、SQLインジェクションになる",
        "decodeURIComponent が失敗すると、Cookie が消える",
        "location.hash は読み取り専用なので、例外が出る"
      ],
      explain: "URL の値を innerHTML に入れているので、`#<img src=x onerror=…>` のようなURLを開かせるとスクリプトが動きます(DOMベースXSS)。`textContent` を使えば防げます。",
      ref: "xss"
    }
  ]
});


// =====================================================================
// 09 オリジン・CORS・CSP
// =====================================================================
WEBD.register("origin", {
  cards: [
    {
      id: "origin-def", name: "オリジン", en: "Origin",
      desc: "スキーム・ホスト・ポートの3つの組みです。3つがすべて同じなら同じオリジン、1つでも違えば別のオリジンです。パスやクエリは関係しません。",
      code: [{ cap: "https://example.com と比べる", lang: "url", text: "https://example.com/a/b\nhttp://example.com/\nhttps://www.example.com/\nhttps://example.com:8443/" }],
      options: [
        ["/a/b", "同じオリジン(パスが違うだけ)"],
        ["http:", "別オリジン(スキームが違う)"],
        ["www.", "別オリジン(ホストが違う)"],
        [":8443", "別オリジン(ポートが違う)"]
      ]
    },
    {
      id: "sop", name: "同一オリジンポリシー", en: "Same-origin policy",
      desc: "あるオリジンのページのスクリプトが、別のオリジンのデータを読むことを、ブラウザが制限する決まりです。利用者がログインしているほかのサイトの情報を、勝手に読まれないようにします。",
      options: [
        ["制限される", "別オリジンへの fetch のレスポンスを読む、別オリジンの iframe の DOM を触る"],
        ["許される", "img・script・link での埋め込み、リンクやフォームでの移動・送信"]
      ],
      notes: ["フォームの送信のように、送ること自体はできてしまう場合があります。それを悪用するのが CSRF です。"]
    },
    {
      id: "cors", name: "CORS", en: "Cross-Origin Resource Sharing",
      desc: "別オリジンからのデータの読み取りを、サーバーが許可するしくみです。ブラウザはリクエストに `Origin` ヘッダーを付け、レスポンスの `Access-Control-Allow-Origin` を見て、スクリプトに読ませるかを決めます。",
      code: [
        { cap: "リクエスト", lang: "http", text: "GET /data HTTP/1.1\nHost: api.example\nOrigin: https://app.example" },
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\nAccess-Control-Allow-Origin:\n  https://app.example" }
      ],
      notes: ["CORS は、ブラウザが守る決まりです。curl などブラウザ以外からのアクセスは制限しないので、サーバーの認証の代わりにはなりません。"]
    },
    {
      id: "preflight", name: "プリフライト", en: "Preflight request",
      desc: "単純ではないリクエスト(PUT・DELETE、`Content-Type: application/json`、独自のヘッダーなど)を別オリジンに送る前に、ブラウザが OPTIONS で「送ってよいか」を確かめるリクエストです。",
      code: [
        { cap: "プリフライト", lang: "http", text: "OPTIONS /items HTTP/1.1\nOrigin: https://app.example\nAccess-Control-Request-Method:\n  PUT" },
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 204 No Content\nAccess-Control-Allow-Origin:\n  https://app.example\nAccess-Control-Allow-Methods:\n  GET, PUT\nAccess-Control-Max-Age: 600" }
      ],
      options: [
        ["Access-Control-Allow-Methods", "許すメソッド"],
        ["Access-Control-Allow-Headers", "許すリクエストヘッダー"],
        ["Access-Control-Max-Age", "プリフライトの結果をキャッシュする秒数"]
      ],
      notes: ["GET・HEAD・POST で、Content-Type が `text/plain`・`multipart/form-data`・`application/x-www-form-urlencoded` のどれかなら、プリフライトなしで送られます。"]
    },
    {
      id: "cors-credentials", name: "資格情報つきのCORS", en: "Credentialed requests",
      desc: "別オリジンへのリクエストに Cookie を付けるには、`fetch` で `credentials: \"include\"` を指定します。サーバーは `Access-Control-Allow-Credentials: true` を返し、`Access-Control-Allow-Origin` には `*` ではなく、オリジンを1つ書きます。",
      code: [{ lang: "js", text: "fetch(\"https://api.example/me\", {\n  credentials: \"include\"\n});" }],
      notes: ["資格情報つきのリクエストに `Access-Control-Allow-Origin: *` を返すと、ブラウザはレスポンスを読ませません。"]
    },
    {
      id: "csp", name: "CSP", en: "Content Security Policy",
      desc: "ページが読み込んだり実行したりしてよいもの(スクリプト・画像・接続先など)を、レスポンスヘッダーで制限するしくみです。XSS が起きたときの被害を減らします。",
      code: [{ cap: "Content-Security-Policy の値", lang: "csp", text: "default-src 'self';\nscript-src 'self' 'nonce-r4nd0m';\nimg-src 'self' https:" }],
      options: [
        ["default-src", "ほかで指定しなかった種類の既定"],
        ["script-src", "スクリプトの読み込み元"],
        ["'self'", "同じオリジン"],
        ["'nonce-…'", "同じ値の nonce 属性を持つ script だけを許す"],
        ["'unsafe-inline'", "インラインのスクリプトを許す(守りが大きく弱まる)"]
      ],
      notes: [
        "nonce は、レスポンスのたびに新しいランダムな値にします。",
        "`Content-Security-Policy-Report-Only` にすると、止めずに違反の報告だけを受け取れます。"
      ]
    },
    {
      id: "frame-ancestors", name: "frame-ancestors", mono: true, en: "CSP frame-ancestors directive",
      desc: "自分のページを、どのページの iframe に埋め込んでよいかを決める CSP のディレクティブです。クリックジャッキングを防ぎます。",
      options: [
        ["'none'", "どこにも埋め込ませない(X-Frame-Options: DENY と同じ)"],
        ["'self'", "同じオリジンのページにだけ埋め込ませる(SAMEORIGIN と同じ)"],
        ["https://a.example", "指定したオリジンにだけ埋め込ませる"]
      ],
      notes: ["自分のページの中に置く iframe の読み込み元を決めるのは `frame-src` です。向きが逆なので注意します。"]
    },
    {
      id: "site-vs-origin", name: "サイトとオリジン", en: "Same-site / Same-origin",
      desc: "サイトは、スキームと「登録できるドメイン」(公開サフィックス〔com・co.jp・github.io など〕とそのすぐ下の名前。eTLD+1 とも呼ぶ)の組みです。例: a.example.co.jp のサイトは example.co.jp です。オリジンよりも広い区切りで、Cookie の SameSite はサイトで判定します。",
      options: [
        ["a.example.com と b.example.com", "同じサイト、別オリジン"],
        ["example.com と example.net", "別サイト、別オリジン"]
      ],
      notes: ["github.io のように、だれでもサブドメインを持てるドメインは、サブドメインごとに別のサイトとして扱われます(Public Suffix List)。"]
    }
  ],
  questions: [
    {
      id: "o01", level: "basic", q: "オリジンを決める3つの要素は?", kind: "text",
      choices: [
        "スキーム・ホスト・ポート",
        "ホスト・パス・クエリ",
        "スキーム・パス・フラグメント",
        "IPアドレス・ポート・パス"
      ],
      explain: "オリジンはスキーム・ホスト・ポートの組みです。パスやクエリが違っても、同じオリジンです。",
      ref: "origin-def"
    },
    {
      id: "o02", level: "basic", q: "`https://example.com` と同じオリジンなのは?", kind: "code",
      choices: ["https://example.com/a/b.html", "http://example.com/", "https://www.example.com/", "https://example.com:8443/"],
      explain: "スキーム・ホスト・ポートがすべて同じものだけが同じオリジンです。http はスキーム、www はホスト、:8443 はポートが違います。",
      ref: "origin-def"
    },
    {
      id: "o03", level: "std", q: "同一オリジンポリシーによって、許可なしにはできないことは?", kind: "text",
      choices: [
        "別オリジンへの fetch のレスポンスを、スクリプトで読む",
        "別オリジンにある画像を、img 要素でページに表示する",
        "別オリジンにある CSS を、link 要素でページに読み込む",
        "別オリジンにあるページへ、a 要素のリンクで移る"
      ],
      explain: "埋め込みやリンクは許されますが、別オリジンのデータをスクリプトで読むことは制限されます。読ませたいときは、サーバーが CORS で許可します。",
      ref: "sop"
    },
    {
      id: "o04", level: "std", q: "別オリジンからの読み取りを許すとき、空欄に入るレスポンスヘッダーは?", kind: "code",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\n____: https://app.example" }],
      choices: ["Access-Control-Allow-Origin", "Access-Control-Request-Method", "Origin", "Allow"],
      explain: "`Access-Control-Allow-Origin` に許すオリジンを書きます。`Origin` と `Access-Control-Request-Method` は、ブラウザが送るリクエストヘッダーです。",
      ref: "cors"
    },
    {
      id: "o05", level: "std", q: "CORS のプリフライトで、ブラウザが使うメソッドは?", kind: "code",
      choices: ["OPTIONS", "HEAD", "GET", "CONNECT"],
      explain: "プリフライトは OPTIONS のリクエストで、本番のメソッドやヘッダーを送ってよいかを先に確かめます。",
      ref: "preflight"
    },
    {
      id: "o06", level: "std", q: "CORS について正しいのは?", kind: "text",
      choices: [
        "ブラウザがレスポンスのヘッダーを見て、スクリプトに読ませるか決める",
        "サーバーが、許可していないオリジンからの通信を必ず遮断する",
        "curl などブラウザ以外からの通信も、同じように制限される",
        "HTTPS のときだけ働き、HTTP のページでは何も制限されない"
      ],
      explain: "CORS はブラウザが守る決まりで、サーバーへのリクエスト自体は届いていることもあります。サーバーを守るには、別に認証や CSRF の対策が必要です。",
      ref: "cors"
    },
    {
      id: "o07", level: "std", q: "別オリジンへの `fetch` で、ブラウザが自動で付け、サーバーが許可の判断に使うリクエストヘッダーは?", kind: "code",
      choices: ["Origin", "Access-Control-Allow-Origin", "Authorization", "Set-Cookie"],
      explain: "ブラウザは、どのオリジンのページからのリクエストかを `Origin` ヘッダーで伝えます。サーバーはそれを見て、`Access-Control-Allow-Origin` を返します。",
      ref: "cors"
    },
    {
      id: "o08", level: "pro", q: "`https://app.example` のページでこのコードを動かした。どうなる?", kind: "text",
      code: [{ lang: "js", text: "fetch(\"https://api.example/x\", {\n  method: \"POST\",\n  headers: {\n    \"Content-Type\":\n      \"application/json\"\n  },\n  body: data\n});" }],
      choices: [
        "先に OPTIONS のプリフライトが送られる",
        "プリフライトなしで、すぐに POST が送られる",
        "POST が GET に書きかえられて送られる",
        "別オリジンなので、送る前に必ず例外になる"
      ],
      explain: "`application/json` は単純なリクエストの Content-Type に入らないので、ブラウザは先に OPTIONS で許可を確かめます。許可があれば POST を送ります。",
      ref: "preflight"
    },
    {
      id: "o09", level: "pro", q: "`credentials: \"include\"` の fetch に、サーバーがこのヘッダーを返した。どうなる?", kind: "text",
      code: [{ cap: "レスポンス", lang: "http", text: "Access-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials:\n  true" }],
      choices: [
        "レスポンスを読めない(* は資格情報つきでは使えない)",
        "どのオリジンからでも、Cookie つきで読める",
        "Cookie だけが外され、本文は読める",
        "ブラウザが * をオリジンに書きかえて読む"
      ],
      explain: "資格情報(Cookie など)つきのリクエストでは、`Access-Control-Allow-Origin` にオリジンを1つ書く必要があります。`*` だと、ブラウザは読み取りを許しません。",
      ref: "cors-credentials"
    },
    {
      id: "o10", level: "pro", q: "この CSP のとき、実行されるスクリプトは?", kind: "text",
      code: [{ cap: "Content-Security-Policy の値", lang: "csp", text: "script-src 'nonce-r4nd0m'" }],
      choices: [
        "nonce=\"r4nd0m\" を付けた、インラインの script",
        "nonce 属性を付けていない、インラインの script 要素",
        "ボタンの onclick 属性に書いた、インラインの処理",
        "nonce を付けていない、src で読む外部ファイルの script"
      ],
      explain: "nonce だけを許す設定では、同じ nonce を持つ script 要素だけが動きます。onclick などのイベント属性は nonce を付けられないので動きません。",
      ref: "csp"
    },
    {
      id: "o11", level: "pro", q: "CSP の script-src に `'unsafe-inline'` を加えると、どうなる?", kind: "text",
      choices: [
        "インラインのスクリプトが動くようになり、XSS を防ぐ力が弱まる",
        "外部ファイルのスクリプトがすべて止まり、ページが動かなくなる",
        "eval() だけが許され、ほかのインラインの処理は止まる",
        "スクリプトの通信が暗号化され、盗み見されにくくなる"
      ],
      explain: "XSS で入りこむスクリプトの多くはインラインです。unsafe-inline を許すと、CSP の大きな守りがなくなります。eval を許すのは `'unsafe-eval'` です。",
      ref: "csp"
    },
    {
      id: "o12", level: "pro", q: "`https://a.example.com` と `https://b.example.com` の関係は?", kind: "text",
      choices: [
        "同じサイトだが、別のオリジン",
        "同じオリジンで、同じサイト",
        "別のサイトで、別のオリジン",
        "同じオリジンだが、別のサイト"
      ],
      explain: "ホストが違うので別オリジンですが、スキームと登録できるドメイン(eTLD+1 の example.com)が同じなので同じサイトです。SameSite の Cookie は、この2つのあいだでは送られます。",
      ref: "site-vs-origin"
    },
    {
      id: "o13", level: "pro", q: "この CSP の意味は?", kind: "text",
      code: [{ cap: "Content-Security-Policy の値", lang: "csp", text: "frame-ancestors 'self'" }],
      choices: [
        "同じオリジンのページにだけ、埋め込みを許す",
        "どのサイトにも、埋め込みを許さない",
        "このページの中に、iframe を置けなくする",
        "埋め込みは許すが、スクリプトは止める"
      ],
      explain: "frame-ancestors は、このページを埋め込める親のページを決めます。'self' は同じオリジンだけです。どこにも許さないのは 'none'、ページの中の iframe の読み込み元を決めるのは frame-src です。",
      ref: "frame-ancestors"
    },
    {
      id: "o14", level: "pro", q: "プリフライトの結果をブラウザにキャッシュさせ、毎回 OPTIONS を送らないようにするヘッダーは?", kind: "code",
      choices: ["Access-Control-Max-Age", "Access-Control-Allow-Methods", "Max-Forwards", "Keep-Alive"],
      explain: "`Access-Control-Max-Age` に秒数を書くと、その間は同じ種類のリクエストでプリフライトを省けます。ブラウザごとに上限があります。",
      ref: "preflight"
    }
  ]
});


// =====================================================================
// 10 キャッシュとCDN
// =====================================================================
WEBD.register("cache", {
  cards: [
    {
      id: "cache-control", name: "Cache-Control", mono: true, en: "Cache-Control header",
      desc: "レスポンスをキャッシュしてよいか、どれだけの間使ってよいかを指示するヘッダーです。指示はカンマで区切って並べます。",
      code: [{ cap: "レスポンス", lang: "http", text: "Cache-Control: max-age=3600" }],
      options: [
        ["max-age=秒", "その秒数のあいだは新しい(確認なしで使える)"],
        ["s-maxage=秒", "共有キャッシュ(CDN など)だけに効く max-age"],
        ["no-cache", "使う前に毎回サーバーに確認する"],
        ["no-store", "どこにも保存しない"],
        ["private", "ブラウザだけが保存してよい"],
        ["public", "共有キャッシュも保存してよい"],
        ["immutable", "期限内は内容が変わらない"]
      ],
      notes: ["immutable は Firefox と Safari が対応していますが、Chrome は実装していません(Chrome は再読み込み時の確認をもともと減らしています)。"]
    },
    {
      id: "no-cache-store", name: "no-cache と no-store", mono: true, en: "Revalidation / No storage",
      desc: "`no-cache` は「保存してよいが、使う前に毎回サーバーに確認する」、`no-store` は「どこにも保存しない」という意味です。名前が似ていますが、まったく違います。",
      notes: ["銀行の明細のように、端末に残したくないデータには no-store を使います。"]
    },
    {
      id: "private-public", name: "private と public", mono: true, en: "Private / Shared caches",
      desc: "キャッシュには、利用者のブラウザだけのもの(プライベート)と、CDN やプロキシのように多くの人で共有するもの(共有キャッシュ)があります。`private` は共有キャッシュへの保存を禁じます。",
      notes: ["ログインした人ごとに中身が違うページを共有キャッシュに保存すると、ほかの人に表示されてしまうおそれがあります。"]
    },
    {
      id: "etag", name: "ETag と If-None-Match", en: "Entity tag / Conditional request",
      desc: "サーバーはレスポンスに、内容の版を表す `ETag` を付けます。期限が切れたら、ブラウザは `If-None-Match` にその値を入れて確かめ、変わっていなければサーバーは本文なしの 304 を返します。",
      code: [
        { cap: "最初のレスポンス", lang: "http", text: "HTTP/1.1 200 OK\nETag: \"v42\"\nCache-Control: no-cache" },
        { cap: "確認のリクエスト", lang: "http", text: "GET /app.css HTTP/1.1\nIf-None-Match: \"v42\"" },
        { cap: "変わっていないとき", lang: "http", text: "HTTP/1.1 304 Not Modified" }
      ]
    },
    {
      id: "last-modified", name: "Last-Modified と If-Modified-Since", en: "Last-Modified / If-Modified-Since",
      desc: "ETag の代わりに、最後に更新した日時で確かめる方法です。サーバーの `Last-Modified` の日時を、ブラウザが `If-Modified-Since` で送ります。",
      code: [
        { cap: "レスポンス", lang: "http", text: "Last-Modified: Mon, 05 Oct\n  2026 09:00:00 GMT" },
        { cap: "確認のリクエスト", lang: "http", text: "If-Modified-Since: Mon, 05 Oct\n  2026 09:00:00 GMT" }
      ],
      notes: ["日時は秒の単位なので、1秒のうちに2回変わると見分けられません。両方あるときは ETag(If-None-Match)が優先されます。(例は見やすさのために2行に分けています。)"]
    },
    {
      id: "cdn", name: "CDN", en: "Content Delivery Network",
      desc: "世界各地のサーバー(エッジ)に内容をキャッシュし、利用者に近いところから配るしくみです。エッジにあればそのまま返し(キャッシュヒット)、なければ元のサーバー(オリジン)から取ってきます(キャッシュミス)。",
      options: [
        ["エッジ", "利用者の近くで配るサーバー"],
        ["オリジン", "元の内容を持つサーバー"],
        ["パージ", "エッジのキャッシュを期限前に消す"]
      ]
    },
    {
      id: "cache-busting", name: "キャッシュバスティング", en: "Cache busting",
      desc: "ファイル名に内容のハッシュを入れ(`app.3f9a1c.js`)、内容が変わったら名前も変える方法です。名前が変わればブラウザは新しいファイルとして取りに行くので、長いキャッシュと確実な更新を両立できます。",
      code: [
        { cap: "app.3f9a1c.js のレスポンス", lang: "http", text: "Cache-Control: max-age=31536000,\n  immutable" },
        { cap: "それを読み込む HTML のレスポンス", lang: "http", text: "Cache-Control: no-cache" }
      ],
      notes: ["HTML 自体を長くキャッシュすると、新しいファイル名を知らせられません。HTML は no-cache などにして、毎回確かめさせます。"]
    },
    {
      id: "vary", name: "Vary", mono: true, en: "Vary header",
      desc: "同じURLでも、リクエストのヘッダーによって中身が変わるとき、そのヘッダーの名前を書きます。キャッシュは、そのヘッダーの値ごとに別のものとして保存します。",
      code: [{ cap: "レスポンス", lang: "http", text: "Content-Encoding: br\nVary: Accept-Encoding" }],
      notes: ["Vary を忘れると、Brotli に対応していない相手に Brotli で圧縮したものを返すなど、別の人向けの中身がキャッシュから返ってしまいます。"]
    }
  ],
  questions: [
    {
      id: "k01", level: "basic", q: "ブラウザのキャッシュの主な利点は?", kind: "text",
      choices: [
        "同じ内容を取りに行かずに済み、表示が速くなる",
        "通信が暗号化され、盗み見されにくくなる",
        "サーバーのプログラムの不具合が自動で直る",
        "ページの内容がいつも最新だと保証される"
      ],
      explain: "保存してある内容を使えば、ダウンロードの時間と通信量を減らせます。そのかわり、古い内容を見せない工夫が必要です。",
      ref: "cache-control"
    },
    {
      id: "k02", level: "basic", q: "`Cache-Control: max-age=3600` の意味は?", kind: "text",
      choices: [
        "3600秒のあいだは、サーバーに確認せずにキャッシュを使える",
        "同じページを3600回読み込むまでは、キャッシュを使ってよい",
        "3600秒たつまでは、キャッシュに保存してはいけない",
        "3600秒ごとに、サーバーが自動で新しい内容を送り直してくる"
      ],
      explain: "max-age は、レスポンスが新しいとみなせる秒数です。期限内はサーバーに問い合わせず、期限が切れたら確認します。",
      ref: "cache-control"
    },
    {
      id: "k03", level: "std", q: "`Cache-Control: no-cache` の意味は?", kind: "text",
      choices: [
        "保存してよいが、使う前に毎回サーバーに確認する",
        "どこにも保存してはいけない",
        "ブラウザにだけ保存し、CDN には保存しない",
        "期限を気にせず、ずっとそのまま使ってよい"
      ],
      explain: "no-cache は「キャッシュしない」ではなく「毎回確かめる」です。変わっていなければ 304 が返るので、本文の転送は省けます。保存しないのは no-store です。",
      ref: "no-cache-store"
    },
    {
      id: "k04", level: "std", q: "ログインした人のマイページ。ブラウザには保存してよいが、CDN などの共有キャッシュには保存させたくない。使う指示は?", kind: "code",
      choices: ["private", "public", "immutable", "s-maxage=600"],
      explain: "private は、その利用者のブラウザだけが保存してよいという指示です。人ごとに中身が違うページが、ほかの人に配られるのを防ぎます。",
      ref: "private-public"
    },
    {
      id: "k05", level: "std", q: "期限の切れたキャッシュを確かめるリクエスト。空欄に入るヘッダーは?", kind: "code",
      code: [
        { cap: "前のレスポンス", lang: "http", text: "HTTP/1.1 200 OK\nETag: \"v42\"" },
        { cap: "確認のリクエスト", lang: "http", text: "GET /app.css HTTP/1.1\n____: \"v42\"" }
      ],
      choices: ["If-None-Match", "If-Match", "If-Modified-Since", "ETag"],
      explain: "ETag の値は `If-None-Match` で送ります。変わっていなければ 304 が返ります。`If-Modified-Since` は Last-Modified の日時と組み合わせて使います。",
      ref: "etag"
    },
    {
      id: "k06", level: "std", q: "前のレスポンスに `Last-Modified` があった。次の確認のリクエストで、その日時を入れて送るヘッダーは?", kind: "code",
      choices: ["If-Modified-Since", "If-None-Match", "Last-Modified", "Date"],
      explain: "`If-Modified-Since` に日時を入れ、それ以降に変わったかを確かめます。変わっていなければ 304 が返ります。",
      ref: "last-modified"
    },
    {
      id: "k07", level: "std", q: "CDN で「キャッシュヒット」したときの動きは?", kind: "text",
      choices: [
        "利用者に近いエッジが、オリジンに聞かずに保存済みの内容を返す",
        "エッジがオリジンから最新の内容を取ってきて、利用者に返す",
        "利用者のブラウザが、CDN を通さずにオリジンへ直接つなぐ",
        "エッジがリクエストを止めて、エラーのページを返す"
      ],
      explain: "エッジにまだ新しいキャッシュがあれば、そのまま返します。オリジンまで行かないので速く、オリジンの負担も減ります。",
      ref: "cdn"
    },
    {
      id: "k08", level: "pro", q: "銀行の明細のページ。どこにもキャッシュとして残したくない。使う指示は?", kind: "code",
      choices: ["no-store", "no-cache", "private", "max-age=0"],
      explain: "no-store は、ブラウザにも共有キャッシュにも保存させません。no-cache・private・max-age=0 は、保存すること自体は許します。",
      ref: "no-cache-store"
    },
    {
      id: "k09", level: "pro", q: "ファイル名に内容のハッシュを入れる(`app.3f9a1c.js`)理由は?", kind: "text",
      choices: [
        "内容が変わると名前も変わり、長くキャッシュしても古いものを使わない",
        "名前を推測しにくくして、ファイルをダウンロードされないようにする",
        "CDN が、名前のハッシュで内容の改ざんを確かめられるようにする",
        "ブラウザが名前のハッシュを見て、ファイルを圧縮しないようにする"
      ],
      explain: "キャッシュバスティングです。新しい版は別の名前になるので、古い名前のファイルを1年キャッシュしても困りません。改ざんの確認は `integrity` 属性(SRI)で行うもので、別のしくみです。",
      ref: "cache-busting"
    },
    {
      id: "k10", level: "pro", q: "`app.3f9a1c.js` のように、ハッシュつきの名前のファイルに合う Cache-Control は?", kind: "code",
      choices: ["max-age=31536000, immutable", "no-store", "no-cache", "max-age=0, must-revalidate"],
      explain: "名前が同じなら中身も同じなので、1年(31536000秒)キャッシュし、期限内は確認もしなくてよい(immutable)と伝えます。",
      ref: "cache-busting"
    },
    {
      id: "k11", level: "pro", q: "ハッシュつきのファイル名を読み込む HTML 自体には、どんな指定が合う?", kind: "text",
      choices: [
        "no-cache にして、毎回サーバーに確かめさせる",
        "max-age=31536000, immutable で1年保存させる",
        "Expires に遠い未来の日時を書いて固定する",
        "public にして、CDN で1年間変えずに配る"
      ],
      explain: "HTML を長くキャッシュすると、新しいファイル名に切りかわりません。HTML は毎回確かめさせ、変わっていなければ 304 で済ませます。",
      ref: "cache-busting"
    },
    {
      id: "k12", level: "pro", q: "レスポンスに `Vary: Accept-Encoding` を付ける意味は?", kind: "text",
      choices: [
        "Accept-Encoding の値ごとに、別のキャッシュとして保存させる",
        "Accept-Encoding を送らないブラウザには、キャッシュさせない",
        "レスポンスの圧縮のしかたを、毎回変えるように指示する",
        "CDN に、リクエストの Accept-Encoding を消させる"
      ],
      explain: "圧縮に対応しているかで中身が変わるので、キャッシュはその値ごとに分けて保存します。分けないと、対応していない相手に圧縮した中身が返ることがあります。",
      ref: "vary"
    },
    {
      id: "k13", level: "std", q: "CDN で配っている画像を差しかえた。期限の前に、エッジに残っている古いキャッシュを消す操作は?", kind: "text",
      choices: ["パージ", "プリフェッチ", "リダイレクト", "ハンドシェイク"],
      explain: "パージ(purge)で、エッジのキャッシュを消します。次のリクエストでエッジがオリジンから新しい内容を取ってきます。",
      ref: "cdn"
    },
    {
      id: "k14", level: "pro", q: "このヘッダーの意味は?", kind: "text",
      code: [{ cap: "レスポンス", lang: "http", text: "Cache-Control: max-age=60,\n  s-maxage=600" }],
      choices: [
        "ブラウザは60秒、CDN は600秒キャッシュできる",
        "ブラウザは600秒、CDN は60秒キャッシュできる",
        "どちらも600秒で、60秒は確認までの待ち時間",
        "どちらも60秒で、600秒は保存できる量の上限"
      ],
      explain: "s-maxage は共有キャッシュ(CDN など)だけに効き、そこでは max-age より優先されます。ブラウザは max-age の60秒に従います。(例は見やすさのために2行に分けています。)",
      ref: "cache-control"
    }
  ]
});


// =====================================================================
// 11 表示速度
// =====================================================================
WEBD.register("perf", {
  cards: [
    {
      id: "cwv", name: "Core Web Vitals", en: "Core Web Vitals",
      desc: "Google が示す、利用者の体験を表す3つの指標です。読み込みの速さ(LCP)、操作への反応の速さ(INP)、見た目の安定(CLS)を測ります。",
      options: [
        ["LCP", "よい: 2.5秒以下"],
        ["INP", "よい: 200ミリ秒以下"],
        ["CLS", "よい: 0.1以下"]
      ],
      notes: [
        "そのページを訪れた利用者の 75パーセンタイル(遅い方から4分の1の境目)の値で判定します。",
        "INP は、2024年3月に FID(First Input Delay)に代わって Core Web Vitals になりました。"
      ]
    },
    {
      id: "lcp", name: "LCP", en: "Largest Contentful Paint",
      desc: "画面に見えている範囲で、いちばん大きな画像や文字のかたまりが表示されるまでの時間です。",
      options: [
        ["サーバーを速く", "最初の1バイトが届くまで(TTFB)を縮める"],
        ["早く見つけさせる", "LCP の画像は HTML に img で書き、preload や fetchpriority=\"high\" を使う"],
        ["軽くする", "画像を適した大きさ・形式にする"]
      ],
      notes: ["LCP の画像に `loading=\"lazy\"` を付けると、読み込みの開始が遅れて LCP が悪くなります。"]
    },
    {
      id: "inp", name: "INP", en: "Interaction to Next Paint",
      desc: "クリック・タップ・キー入力をしてから、次に画面が更新されるまでの時間です。ページを開いているあいだの操作のうち、遅いもの(ほぼ最も遅いもの)で評価します。",
      notes: [
        "メインスレッドを長く占める処理(長いタスク)があると、そのあいだ操作に反応できず、INP が悪くなります。",
        "重い処理は小さく分け、あいだでブラウザに処理を返します。"
      ]
    },
    {
      id: "cls", name: "CLS", en: "Cumulative Layout Shift",
      desc: "読み込みの途中などで、表示中の要素が予期せず動いた量です。広告や画像があとから入って本文がずれると悪くなります。",
      code: [{ lang: "css", text: ".ad {\n  min-height: 250px;\n}\nimg {\n  aspect-ratio: 16 / 9;\n}" }],
      notes: ["利用者の操作の直後(0.5秒以内)に起きたずれは数えません。", "ずれは、続けて起きたまとまり(間が1秒未満、長さは最長5秒)ごとに合計し、いちばん大きいまとまりの値を CLS とします。"]
    },
    {
      id: "ttfb", name: "TTFB", en: "Time to First Byte",
      desc: "リクエストを始めてから、レスポンスの最初の1バイトが届くまでの時間です。名前解決・接続・サーバーの処理の時間を含みます。Core Web Vitals ではありませんが、LCP などすべての土台になります。",
      notes: ["CDN やキャッシュを使う、サーバーの処理を速くする、リダイレクトを減らす、などで縮めます。"]
    },
    {
      id: "image-formats", name: "画像形式と srcset", en: "Image formats / Responsive images",
      desc: "WebP や AVIF は、JPEG や PNG より同じ画質で小さくできることが多い形式です。`srcset` と `sizes` で候補を並べると、ブラウザが画面の幅と画素密度に合ったものを選びます。",
      code: [{ lang: "html", text: "<img src=\"s.jpg\"\n  srcset=\"s.jpg 480w, l.jpg 960w\"\n  sizes=\"100vw\" alt=\"\">" }],
      options: [
        ["480w", "その画像の幅が 480px"],
        ["sizes", "画像を表示する幅"],
        ["<picture>", "形式ごとに候補を並べ、対応しているものを使わせる"]
      ]
    },
    {
      id: "lazy-loading", name: "loading=\"lazy\"", mono: true, en: "Lazy loading",
      desc: "画像や iframe を、画面に近づくまで読み込まないようにする属性です。最初の表示に要らないものを後回しにして、大事なものに通信を回せます。",
      code: [{ lang: "html", text: "<img src=\"photo.jpg\" alt=\"…\"\n  loading=\"lazy\"\n  width=\"800\" height=\"600\">" }],
      notes: ["最初に見える画像(とくに LCP の画像)には付けません。"]
    },
    {
      id: "compression", name: "圧縮(gzip・Brotli)", en: "Content-Encoding",
      desc: "HTML・CSS・JavaScript などの文字のデータを圧縮して送ると、転送量が大きく減ります。ブラウザは対応する方式を `Accept-Encoding` で伝え、サーバーは使った方式を `Content-Encoding` で示します。",
      code: [
        { cap: "リクエスト", lang: "http", text: "Accept-Encoding: gzip, br" },
        { cap: "レスポンス", lang: "http", text: "Content-Encoding: br" }
      ],
      options: [
        ["gzip", "広く使われてきた方式"],
        ["br", "Brotli。多くの場合 gzip より小さくなる"]
      ],
      notes: ["JPEG や PNG などの画像は、すでに圧縮されているので、gzip をかけてもほとんど小さくなりません。"]
    },
    {
      id: "bundling", name: "バンドルとコード分割", en: "Bundling / Code splitting",
      desc: "バンドルは、多くの JavaScript のファイルを少ないファイルにまとめることです。コード分割は、最初に要らない部分を別のファイルに分け、必要になったときに `import()` で読み込むことです。",
      code: [{ lang: "js", text: "btn.onclick = async () => {\n  const m = await import(\"./c.js\");\n  m.draw();\n};" }],
      notes: ["使っていないコードを取り除くこと(ツリーシェイキング)も、ファイルを小さくします。"]
    },
    {
      id: "resource-hints", name: "preload と preconnect", en: "Resource hints",
      desc: "ブラウザに、先に準備しておいてほしいことを伝える `<link>` です。",
      code: [{ lang: "html", text: "<link rel=\"preconnect\"\n  href=\"https://cdn.example\">\n<link rel=\"preload\"\n  href=\"font.woff2\" as=\"font\"\n  type=\"font/woff2\" crossorigin>" }],
      options: [
        ["preconnect", "その相手との接続(DNS・TCP・TLS)を先に済ませる"],
        ["dns-prefetch", "名前解決だけを先に済ませる"],
        ["preload", "このページで必ず使うものを、早く高い優先度で取る。as で種類を書く"],
        ["prefetch", "次のページで使いそうなものを、手がすいたときに取る"]
      ],
      notes: ["preload したのに使わないと、ほかの読み込みのじゃまになるだけです。Chrome はコンソールで警告を出します。"]
    }
  ],
  questions: [
    {
      id: "p01", level: "basic", q: "Core Web Vitals の3つの指標の組み合わせは?", kind: "code",
      choices: ["LCP・INP・CLS", "LCP・FID・CLS", "FCP・TTI・TBT", "TTFB・FCP・CLS"],
      explain: "読み込み(LCP)、反応(INP)、見た目の安定(CLS)の3つです。FID は2024年3月に INP に置きかわりました。",
      ref: "cwv"
    },
    {
      id: "p02", level: "basic", q: "画像を、画面に近づくまで読み込まないようにしたい。空欄に入るのは?", kind: "code",
      code: [{ lang: "html", text: "<img src=\"a.jpg\" alt=\"…\" ____>" }],
      choices: ["loading=\"lazy\"", "decoding=\"async\"", "fetchpriority=\"low\"", "defer"],
      explain: "`loading=\"lazy\"` で、画面の外の画像の読み込みを後回しにできます。`decoding=\"async\"` は画像の展開のしかた、`defer` は script の属性です。",
      ref: "lazy-loading"
    },
    {
      id: "p03", level: "std", q: "LCP が「よい」とされる目安は?", kind: "text",
      choices: ["2.5秒以下", "1秒以下", "4秒以下", "0.5秒以下"],
      explain: "LCP は2.5秒以下がよい、4秒を超えると悪いとされます。",
      ref: "cwv"
    },
    {
      id: "p04", level: "std", q: "INP が「よい」とされる目安は?", kind: "text",
      choices: ["200ミリ秒以下", "100ミリ秒以下", "500ミリ秒以下", "2.5秒以下"],
      explain: "INP は200ミリ秒以下がよい、500ミリ秒を超えると悪いとされます。100ミリ秒は、以前の指標 FID の目安でした。",
      ref: "cwv"
    },
    {
      id: "p05", level: "std", q: "CLS が「よい」とされる目安は?", kind: "text",
      choices: ["0.1以下", "0.25以下", "1以下", "2.5以下"],
      explain: "CLS は0.1以下がよい、0.25を超えると悪いとされます。秒ではなく、ずれの量を表す数です。",
      ref: "cwv"
    },
    {
      id: "p06", level: "std", q: "CLS をよくする方法として正しいのは?", kind: "text",
      choices: [
        "画像や広告の場所を、aspect-ratio などで先に確保する",
        "画像をすべて loading=\"lazy\" にして、あとから読み込ませる",
        "フォントを大きくして、文字の折り返しの回数を減らす",
        "JavaScript に defer を付けて、実行をあとに回す"
      ],
      explain: "あとから入るものの場所を先に空けておけば、本文がずれません。lazy にしても、場所を確保していなければずれは起きます。",
      ref: "cls"
    },
    {
      id: "p07", level: "std", q: "INP が悪くなる主な原因は?", kind: "text",
      choices: [
        "メインスレッドを長く占める処理で、操作への反応が遅れる",
        "画像のファイルが大きく、ダウンロードに時間がかかる",
        "サーバーの応答が遅く、最初の1バイトがなかなか届かない",
        "読み込みのあとで広告が入り、レイアウトがずれる"
      ],
      explain: "INP は操作への反応の速さです。長いタスクがあると、そのあいだ操作を処理できません。画像の大きさは LCP、応答の遅さは TTFB、ずれは CLS に関係します。",
      ref: "inp"
    },
    {
      id: "p08", level: "basic", q: "写真の転送量を減らすために使われる、新しい画像形式は?", kind: "code",
      choices: ["AVIF", "BMP", "GIF", "TIFF"],
      explain: "AVIF や WebP は、JPEG より同じ画質で小さくできることが多い形式です。BMP や TIFF は圧縮しないか弱く、Web の写真には向きません。",
      ref: "image-formats"
    },
    {
      id: "p09", level: "pro", q: "ページの最上部の大きなメイン画像(LCP の要素)に `loading=\"lazy\"` を付けた。どうなる?", kind: "text",
      choices: [
        "読み込みの開始が遅れ、LCP が悪くなりやすい",
        "読み込みが早まり、LCP がかならずよくなる",
        "画像が表示されなくなり、CLS が 0 になる",
        "INP の計測から外れ、操作が速くなる"
      ],
      explain: "lazy の画像は、レイアウトが決まって画面内だとわかるまで読み込みを始めません。最初に見える大事な画像には付けず、むしろ `fetchpriority=\"high\"` で優先させます。",
      ref: "lcp"
    },
    {
      id: "p10", level: "pro", q: "このタグの働きは?", kind: "text",
      code: [{ lang: "html", text: "<link rel=\"preconnect\"\n  href=\"https://cdn.example\">" }],
      choices: [
        "その相手との接続(DNS・TCP・TLS)を先に済ませる",
        "その相手にあるファイルを、すべて先にダウンロードしておく",
        "その相手へのリクエストを、すべてブラウザのキャッシュから返させる",
        "その相手のページを裏で開いておき、すぐに切りかえる"
      ],
      explain: "preconnect は、あとで使う相手との接続の準備だけを先に済ませます。ファイルそのものは取りに行きません。",
      ref: "resource-hints"
    },
    {
      id: "p11", level: "pro", q: "`<link rel=\"preload\">` が効果的な場面は?", kind: "text",
      choices: [
        "CSS の中で指定する Web フォントを、早めに読み込ませる",
        "最後まで使わないかもしれない画像を、全部先に読み込ませる",
        "HTML の先頭の img で書いた画像を、もう一度指定しておく",
        "次に移るページで使うファイルを、手がすいたときに取る"
      ],
      explain: "CSS の中のフォントは、CSS を読むまで見つかりません。preload で、早い段階から取りに行かせられます。次のページ用に取るのは prefetch です。",
      ref: "resource-hints"
    },
    {
      id: "p12", level: "pro", q: "Brotli で圧縮して返すとき、空欄に入る値は?", kind: "code",
      code: [
        { cap: "リクエスト", lang: "http", text: "Accept-Encoding: gzip, br" },
        { cap: "レスポンス", lang: "http", text: "Content-Encoding: ____" }
      ],
      choices: ["br", "brotli", "bz2", "zstd"],
      explain: "Brotli を表す名前は `br` です。`zstd` は Zstandard という別の圧縮方式です。",
      ref: "compression"
    },
    {
      id: "p13", level: "pro", q: "この img のしくみとして正しいのは?", kind: "text",
      code: [{ lang: "html", text: "<img src=\"s.jpg\"\n  srcset=\"s.jpg 480w, l.jpg 960w\"\n  sizes=\"100vw\" alt=\"\">" }],
      choices: [
        "画面の幅と画素密度から、ブラウザが合う画像を選ぶ",
        "2つの画像を両方読み込み、大きい方を表示する",
        "480px より狭い画面では、画像を表示しない",
        "960w の画像を、480px に縮めて保存し直す"
      ],
      explain: "srcset に画像の幅(w)を並べ、sizes で表示の幅を伝えると、ブラウザは画素密度も考えて1つだけ選んで読み込みます。",
      ref: "image-formats"
    },
    {
      id: "p14", level: "pro", q: "このコードの `c.js` について正しいのは?", kind: "text",
      code: [{ lang: "js", text: "btn.onclick = async () => {\n  const m = await import(\"./c.js\");\n  m.draw();\n};" }],
      choices: [
        "ボタンを押したときに、初めて読み込まれる",
        "ページを開いたときに、先に読み込まれる",
        "ボタンを押すたびに、毎回ダウンロードされる",
        "読み込むまで、画面が止まって操作できない"
      ],
      explain: "`import()` は、呼んだときにモジュールを読み込み、Promise を返します(コード分割)。一度読み込んだモジュールは使い回されるので、2回目からはダウンロードしません。",
      ref: "bundling"
    },
    {
      id: "p15", level: "pro", q: "Core Web Vitals で、ページが「よい」かどうかを判定するときに使う値は?", kind: "text",
      choices: [
        "利用者の 75パーセンタイルの値",
        "利用者全体の値の算術平均",
        "いちばん速かった利用者の1回の値",
        "開発者の端末で1回だけ測った値"
      ],
      explain: "多くの利用者がよい体験をしているかを見るため、75パーセンタイル(4人に3人はこれより速い値)で判定します。",
      ref: "cwv"
    },
    {
      id: "p16", level: "std", q: "TTFB(Time to First Byte)が表す時間は?", kind: "text",
      choices: [
        "レスポンスの最初の1バイトが届くまで",
        "最初の文字や画像が、画面に表示されるまで",
        "いちばん大きな要素が、画面に表示されるまで",
        "画像も含め、ページのすべてを読み終えるまで"
      ],
      explain: "TTFB は、リクエストを始めてから、レスポンスの最初の1バイトが届くまでの時間で、名前解決・接続・サーバーの処理を含みます。2つ目は FCP、3つ目は LCP にあたります。",
      ref: "ttfb"
    }
  ]
});


// =====================================================================
// 12 アクセシビリティとSEO
// =====================================================================
WEBD.register("a11y-seo", {
  cards: [
    {
      id: "alt", name: "alt属性", en: "Alternative text",
      desc: "画像の代わりになる文章です。読み上げソフトが読み、画像を読み込めないときにも表示されます。画像が伝えている内容を書きます。",
      code: [{ lang: "html", text: "<img src=\"graph.png\"\n  alt=\"売上は前年の1.5倍\">\n<img src=\"line.png\" alt=\"\">" }],
      notes: [
        "飾りの画像は `alt=\"\"`(空)にすると、読み上げで飛ばされます。alt そのものを省くと、ファイル名が読まれることがあります。",
        "「画像」「写真」などの言葉は、読み上げソフトが付け加えるので書かなくてよいです。"
      ]
    },
    {
      id: "form-label", name: "ラベルとフォーム", en: "Form labels",
      desc: "入力欄には、`<label>` で見える名前を付けて結びつけます。読み上げソフトが入力欄の名前を読み、ラベルを押しても入力欄が選ばれます。",
      code: [{ lang: "html", text: "<label for=\"tel\">電話番号</label>\n<input id=\"tel\" type=\"tel\"\n  autocomplete=\"tel\">" }],
      notes: ["placeholder は入力を始めると消え、色も薄いことが多いので、ラベルの代わりにはなりません。"]
    },
    {
      id: "keyboard-focus", name: "キーボード操作とフォーカス", en: "Keyboard accessibility",
      desc: "マウスを使わない人も、Tab で移動し、Enter やスペースで操作できるようにします。`<button>` や `<a href>` はそのまま対応しています。いまどこにいるか(フォーカス)が見えることも大切です。",
      code: [{ lang: "css", text: ":focus-visible {\n  outline: 2px solid;\n}" }],
      options: [
        ["tabindex=\"0\"", "ふつうはフォーカスできない要素を、Tab の順番に入れる"],
        ["tabindex=\"-1\"", "Tab では止まらないが、スクリプトでフォーカスできる"],
        ["tabindex=\"1\" など", "順番が乱れるので使わない"]
      ],
      notes: ["`outline: none` でフォーカスの枠を消すと、キーボードの利用者が迷います。消すなら代わりの目印を付けます。"]
    },
    {
      id: "contrast", name: "コントラスト比", en: "Contrast ratio (WCAG)",
      desc: "文字の色と背景の色の明るさの比です。WCAG 2 の AA の基準では、ふつうの文字は 4.5:1 以上、大きな文字(18pt 以上、または太字の 14pt 以上)は 3:1 以上が必要です。",
      options: [
        ["4.5:1", "AA・ふつうの文字"],
        ["3:1", "AA・大きな文字、ボタンの枠などの部品"],
        ["7:1", "AAA・ふつうの文字"]
      ],
      notes: ["Chrome の DevTools で、要素を選ぶとコントラスト比を確かめられます。"]
    },
    {
      id: "aria", name: "ARIAの原則", en: "WAI-ARIA",
      desc: "ARIA は、要素の役割(role)や状態(aria-expanded など)を、読み上げソフトなどに伝える属性です。同じ働きの HTML の要素があるなら、ARIA よりもそれを使うのが第一の原則です。",
      code: [{ lang: "html", text: "<button aria-expanded=\"false\"\n  aria-controls=\"menu\">\n  メニュー\n</button>" }],
      notes: [
        "ARIA は伝えるだけで、動きは付けません。`role=\"button\"` を付けても、キーボードで押せるようにするのは自分で書く必要があります。",
        "開閉などの状態が変わったら、`aria-expanded` などの値もスクリプトで書きかえます。"
      ]
    },
    {
      id: "lang-attr", name: "lang属性", en: "Language attribute",
      desc: "`<html lang=\"ja\">` で、ページの言語を伝えます。読み上げソフトは、これを見て読み方(発音)を切りかえます。",
      code: [{ lang: "html", text: "<html lang=\"ja\">\n…\n<p lang=\"en\">Hello</p>" }],
      notes: ["一部だけ別の言語のときは、その要素に lang を付けます。"]
    },
    {
      id: "title-desc", name: "title と meta description", en: "Title / Meta description",
      desc: "`<title>` はページの題名で、ブラウザのタブや検索結果の見出しに使われます。`<meta name=\"description\">` はページの要約で、検索結果の説明文に使われることがあります。",
      code: [{ lang: "html", text: "<title>料金 | ABC社</title>\n<meta name=\"description\"\n  content=\"3つのプランの料金…\">" }],
      notes: ["description は順位を直接は上げませんが、検索結果で選ばれやすさに関わります。検索エンジンが本文から説明文を作ることもあります。"]
    },
    {
      id: "canonical", name: "canonical", mono: true, en: "Canonical URL",
      desc: "同じ内容のページが複数のURL(`?ref=…` つき、http と https など)で見られるとき、代表のURLを検索エンジンに伝えます。",
      code: [{ lang: "html", text: "<link rel=\"canonical\"\n  href=\"https://example.com/a\">" }],
      notes: ["検索エンジンへのヒントで、必ず従われるとは限りません。転送させたいときは 301 などのリダイレクトを使います。"]
    },
    {
      id: "robots", name: "robots.txt と noindex", en: "Crawling / Indexing control",
      desc: "`robots.txt` は、クローラーにどのURLを巡回(クロール)してよいかを伝えるファイルです。検索結果に出さないようにするのは `noindex` です。",
      code: [
        { cap: "/robots.txt", lang: "text", text: "User-agent: *\nDisallow: /admin/\nSitemap: https://example.com/\n  sitemap.xml" },
        { cap: "検索結果に出さないページ", lang: "html", text: "<meta name=\"robots\"\n  content=\"noindex\">" }
      ],
      notes: [
        "robots.txt で巡回を止めても、ほかからリンクされていれば、URLだけが検索結果に出ることがあります。",
        "noindex は、クローラーがページを読めないと気づけません。noindex のページを robots.txt でブロックしてはいけません。",
        "robots.txt はだれでも読めるので、秘密の場所を隠す役には立ちません。",
        "上の例の Sitemap の行は、見やすさのために分けています。実際の robots.txt では1行に書きます(改行すると壊れます)。"
      ]
    },
    {
      id: "sitemap", name: "sitemap.xml", mono: true, en: "XML Sitemap",
      desc: "サイトの中のURLの一覧を、検索エンジンに知らせるファイルです。リンクをたどりにくいページも見つけてもらいやすくなります。",
      code: [{ lang: "html", text: "<urlset xmlns=\"…\">\n  <url>\n    <loc>https://example.com/a</loc>\n  </url>\n</urlset>" }]
    }
  ],
  questions: [
    {
      id: "a01", level: "basic", q: "内容に関係のない飾りの画像に付ける alt として適切なのは?", kind: "code",
      choices: ["alt=\"\"", "alt=\"画像\"", "alt=\"line.png\"", "alt=\"飾りの画像です\""],
      explain: "空の alt にすると、読み上げソフトはその画像を飛ばします。意味のない言葉を読ませると、聞く人のじゃまになります。",
      ref: "alt"
    },
    {
      id: "a02", level: "basic", q: "ページの言語を伝える。空欄に入る属性は?", kind: "code",
      code: [{ lang: "html", text: "<html ____=\"ja\">" }],
      choices: ["lang", "language", "locale", "charset"],
      explain: "`lang` 属性でページの言語を伝えます。読み上げソフトはこれを見て発音を切りかえます。",
      ref: "lang-attr"
    },
    {
      id: "a03", level: "basic", q: "ブラウザのタブに表示される、ページの題名を書く要素は?", kind: "code",
      choices: ["title", "h1", "header", "caption"],
      explain: "`<head>` の中の `<title>` です。検索結果の見出しにも使われるので、ページごとに内容がわかる題名を付けます。",
      ref: "title-desc"
    },
    {
      id: "a04", level: "std", q: "WCAG 2 の AA の基準で、ふつうの大きさの文字に必要なコントラスト比は?", kind: "text",
      choices: ["4.5:1 以上", "3:1 以上", "7:1 以上", "2:1 以上"],
      explain: "AA では、ふつうの文字は 4.5:1 以上、大きな文字は 3:1 以上です。7:1 はより厳しい AAA の基準です。",
      ref: "contrast"
    },
    {
      id: "a05", level: "std", q: "ARIA を使うときの第一の原則は?", kind: "text",
      choices: [
        "同じ働きの HTML の要素があるなら、ARIA よりそれを使う",
        "すべての div に role を付けて、意味をはっきりさせる",
        "見た目を変えたら、かならず aria-label も付け直す",
        "ARIA を付ければ、キーボードの操作も自動で付く"
      ],
      explain: "`<button>` のようなネイティブの要素は、役割もキーボード操作も最初からそろっています。ARIA は伝えるだけで、動きは付けません。",
      ref: "aria"
    },
    {
      id: "a06", level: "std", q: "`<div onclick=\"…\">送信</div>` をボタンの代わりにした。主な問題は?", kind: "text",
      choices: [
        "Tab で移れず、Enter やスペースでも押せない",
        "マウスでクリックしても、click イベントが起きない",
        "スマホでタップしても、反応しない決まりになっている",
        "検索エンジンに、ページ全体が登録されなくなる"
      ],
      explain: "div はフォーカスもキーボード操作もできず、読み上げソフトにもボタンだと伝わりません。`<button>` を使えばすべてそろいます。",
      ref: "keyboard-focus"
    },
    {
      id: "a07", level: "std", q: "CSS に `:focus { outline: none; }` だけを書いた。何が問題?", kind: "text",
      choices: [
        "キーボードで操作する人が、いまの位置を見失う",
        "マウスでクリックできる範囲がせまくなる",
        "読み上げソフトが、その要素を読まなくなる",
        "Tab キーで移動する順番が逆になる"
      ],
      explain: "フォーカスの枠は、キーボードの利用者にとっての「いまここ」の目印です。消すなら、`:focus-visible` などで代わりの目印を付けます。",
      ref: "keyboard-focus"
    },
    {
      id: "a08", level: "std", q: "入力欄の名前の付け方として正しいのは?", kind: "text",
      choices: [
        "label 要素で結びつけ、placeholder だけに頼らない",
        "placeholder があれば、label は書かなくてよい",
        "label は見た目の飾りで、読み上げには関係しない",
        "label は入力欄の下にしか置けない決まりがある"
      ],
      explain: "placeholder は入力すると消え、薄い色で読みにくいことも多いです。label で結びつければ、読み上げソフトが名前を読み、ラベルを押しても入力欄が選ばれます。",
      ref: "form-label"
    },
    {
      id: "a09", level: "std", q: "このタグの意味は?", kind: "text",
      code: [{ lang: "html", text: "<link rel=\"canonical\"\n  href=\"https://example.com/a\">" }],
      choices: [
        "同じ内容の複数のURLのうち、代表のURLを示す",
        "このページを、検索結果に出さないように頼む",
        "このページの古いURLから、自動で転送させる",
        "このページを、別の言語の版と結びつける"
      ],
      explain: "canonical は代表のURLを検索エンジンに伝えます。検索結果に出さないのは noindex、転送はリダイレクト、別の言語の版は hreflang です。",
      ref: "canonical"
    },
    {
      id: "a10", level: "std", q: "`sitemap.xml` の役割は?", kind: "text",
      choices: [
        "サイトの中のURLの一覧を、検索エンジンに知らせる",
        "検索結果での、ページの並び順を決める",
        "巡回してほしくないURLを、検索エンジンに伝える",
        "ページを速く表示するため、URLを先に読ませる"
      ],
      explain: "サイトマップは、巡回してほしいURLの一覧です。順位を決めるものではありません。巡回を止めるのは robots.txt です。",
      ref: "sitemap"
    },
    {
      id: "a11", level: "std", q: "見出し(h1〜h6)を正しい階層で使う理由として正しいのは?", kind: "text",
      choices: [
        "読み上げソフトの利用者が、見出しをたどって移動できる",
        "見出しの順番どおりに、ページの読み込みが速くなる",
        "見出しの数が多いほど、検索の順位がかならず上がる",
        "階層を守ると、CSS を書かなくても色が付く"
      ],
      explain: "読み上げソフトには見出しの一覧から移動する機能があり、階層が正しいとページの構造をつかめます。検索エンジンにとっても内容を理解する手がかりになります。",
      ref: "headings"
    },
    {
      id: "a12", level: "std", q: "`<meta name=\"description\">` について正しいのは?", kind: "text",
      choices: [
        "検索結果の説明文として使われることがある",
        "書いた言葉の数だけ、検索の順位が上がる",
        "ブラウザのタブに表示される題名になる",
        "書かないと、検索結果にページが出なくなる"
      ],
      explain: "description はページの要約です。順位を直接上げるものではありませんが、検索結果で内容を伝える説明文に使われることがあります。",
      ref: "title-desc"
    },
    {
      id: "a13", level: "pro", q: "`robots.txt` で Disallow したページについて正しいのは?", kind: "text",
      choices: [
        "巡回はされないが、リンクがあるとURLが検索結果に出ることがある",
        "検索結果からかならず消え、URLもどこにも表示されなくなる",
        "ブラウザからもそのページにアクセスできなくなり、守られる",
        "Disallow したページの中身は、暗号化されて配信される"
      ],
      explain: "robots.txt が止めるのは巡回(クロール)だけです。検索結果に出さないようにするのは noindex で、robots.txt に書いた場所はだれでも読めます。",
      ref: "robots"
    },
    {
      id: "a14", level: "pro", q: "あるページを、検索結果からかならず外したい。正しい扱いは?", kind: "text",
      choices: [
        "noindex を付け、robots.txt ではブロックしない",
        "robots.txt で Disallow し、noindex も付ける",
        "robots.txt で Disallow するだけにする",
        "sitemap.xml からそのページを消すだけにする"
      ],
      explain: "robots.txt でブロックすると、クローラーはページを読めず、noindex に気づけません。noindex を付けて、巡回は許します。",
      ref: "robots"
    },
    {
      id: "a15", level: "pro", q: "開閉するメニューのボタン。正しい作り方は?", kind: "text",
      code: [{ lang: "html", text: "<button aria-expanded=\"false\"\n  aria-controls=\"menu\">\n  メニュー\n</button>" }],
      choices: [
        "開いたら、aria-expanded を true に書きかえる",
        "aria-expanded を書けば、開閉の動きは自動で付く",
        "aria-expanded は、見た目の矢印を回すための属性",
        "一度書いた aria-expanded の値は、変えてはいけない"
      ],
      explain: "ARIA は状態を伝えるだけなので、開閉に合わせて値を書きかえます。読み上げソフトは「折りたたみ」「展開」などと状態を伝えます。",
      ref: "aria"
    }
  ]
});

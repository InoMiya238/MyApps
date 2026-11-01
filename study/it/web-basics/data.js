// Web道場: 20単元の定義・問題・用語帳のカード・コードの色分け。道場(index.html)と用語帳(reference.html)で共有する。
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

  // ID は保存データのキーなので変えない。no は学ぶ順の番号で、並べ直してもよい
  var UNITS = [
    { id: "network", no: "01", name: "ネットワークとTCP/IP", short: "TCP/IP", level: "std", keys: "TCP/IP · CIDR · TCP/UDP · NAT" },
    { id: "url-dns", no: "02", name: "URLとDNS", short: "URLとDNS", level: "basic", keys: "URLの各部 · DNS · A/CNAME · TTL" },
    { id: "http", no: "03", name: "HTTPの基本", short: "HTTP基本", level: "basic", keys: "メソッド · ステータス · ヘッダー · HTTP/3" },
    { id: "render", no: "04", name: "ブラウザが表示するまで", short: "表示の流れ", level: "std", keys: "DOM · CSSOM · レイアウト · defer" },
    { id: "html", no: "05", name: "HTMLとセマンティクス", short: "HTML", level: "basic", keys: "DOCTYPE · main · label · alt" },
    { id: "css", no: "06", name: "CSSのセレクタとレイアウト", short: "CSS", level: "basic", keys: "詳細度 · ボックス · flex · grid" },
    { id: "js-dom", no: "07", name: "JavaScriptとDOM・非同期", short: "JSとDOM", level: "std", keys: "DOM · イベント · Promise · fetch" },
    { id: "json", no: "08", name: "JSONとデータ形式", short: "JSON", level: "basic", keys: "JSONの文法 · stringify · YAML · Base64" },
    { id: "api", no: "09", name: "Web APIとREST", short: "Web API", level: "std", keys: "REST · CRUD · ページング · 429" },
    { id: "state", no: "10", name: "Cookie・セッション・ストレージ", short: "Cookie等", level: "std", keys: "Cookie属性 · SameSite · Storage · JWT" },
    { id: "auth", no: "11", name: "認証と認可", short: "認証認可", level: "pro", keys: "OAuth 2.0 · PKCE · OIDC · パスキー" },
    { id: "security", no: "12", name: "HTTPSと攻撃対策", short: "攻撃対策", level: "std", keys: "TLS · XSS · CSRF · SQLi" },
    { id: "origin", no: "13", name: "オリジン・CORS・CSP", short: "CORS・CSP", level: "pro", keys: "オリジン · CORS · プリフライト · CSP" },
    { id: "cache", no: "14", name: "キャッシュとCDN", short: "キャッシュ", level: "pro", keys: "Cache-Control · ETag · 304 · CDN" },
    { id: "perf", no: "15", name: "表示速度", short: "表示速度", level: "pro", keys: "LCP · INP · CLS · lazy · preload" },
    { id: "a11y-seo", no: "16", name: "アクセシビリティとSEO", short: "a11y・SEO", level: "std", keys: "alt · コントラスト · ARIA · canonical" },
    { id: "realtime", no: "17", name: "リアルタイム通信", short: "リアルタイム", level: "pro", keys: "ポーリング · SSE · WebSocket · WebRTC" },
    { id: "server", no: "18", name: "Webサーバーとインフラ", short: "サーバー", level: "std", keys: "プロキシ · LB · コンテナ · デプロイ" },
    { id: "frontend", no: "19", name: "フロントエンドの構成", short: "構成", level: "pro", keys: "SPA · SSR/SSG · History API · npm" },
    { id: "browser-api", no: "20", name: "ブラウザのAPIとPWA", short: "PWA等", level: "pro", keys: "Service Worker · Manifest · Worker" }
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
  var LANGS = ["http", "html", "xml", "css", "js", "json", "yaml", "url", "dns", "csp", "shell", "text"];

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

  // シェル(1行目の語はコマンド、- で始まる語はオプション、# 以降はコメント、行頭の $ はプロンプト)
  // $ で始まる行があるブロックでは、$ のない行はコマンドの出力として色を付けない
  function tokShell(src, out) {
    var hasPrompt = /^\$ /m.test(src);
    src.split("\n").forEach(function (line, k) {
      if (k > 0) push(out, "", "\n");
      var i = 0, n = line.length, m, first = true;
      if ((m = /^\$ /.exec(line))) { push(out, "pn", m[0]); i = m[0].length; }
      else if (/^\s*#/.test(line)) { push(out, "cm", line); return; }
      else if (hasPrompt) { push(out, "", line); return; }
      while (i < n) {
        var rest = line.slice(i);
        if ((m = /^#.*/.exec(rest)) && (i === 0 || /\s/.test(line.charAt(i - 1)))) push(out, "cm", m[0]);
        else if ((m = /^\s+/.exec(rest))) push(out, "", m[0]);
        else if ((m = /^"[^"]*"?/.exec(rest)) || (m = /^'[^']*'?/.exec(rest))) { push(out, "str", m[0]); first = false; }
        else {
          m = /^[^\s"']+/.exec(rest);
          if (first) push(out, "fn", m[0]);
          else if (/^--?[A-Za-z]/.test(m[0])) push(out, "kw", m[0]);
          else if (/^\d+(?:\.\d+)*$/.test(m[0])) push(out, "num", m[0]);
          else push(out, "", m[0]);
          first = false;
        }
        i += m[0].length;
      }
    });
  }

  // YAML(キー: 値、# コメント、- の並び)
  function tokYaml(src, out) {
    src.split("\n").forEach(function (line, k) {
      if (k > 0) push(out, "", "\n");
      var m = /^(\s*)(- )?([^\s:#"'][^:#]*?)(:)(\s|$)(.*)$/.exec(line), rest = line;
      if (m) {
        push(out, "", m[1]); push(out, "pn", m[2] || ""); push(out, "fn", m[3]); push(out, "pn", m[4]); push(out, "", m[5]);
        rest = m[6];
      } else if ((m = /^(\s*)(- )(.*)$/.exec(line))) {
        push(out, "", m[1]); push(out, "pn", m[2]); rest = m[3];
      } else rest = line;
      var c = /^(.*?)(\s#.*|^#.*)?$/.exec(rest);
      var val = c[1], cm = c[2] || "";
      if (/^\s*(["']).*\1\s*$/.test(val)) push(out, "str", val);
      else if (/^\s*-?\d+(\.\d+)?\s*$/.test(val)) push(out, "num", val);
      else if (/^\s*(true|false|null)\s*$/.test(val)) push(out, "kw", val);
      else push(out, "", val);
      push(out, "cm", cm);
    });
  }

  function tokenize(lang, text) {
    var src = String(text == null ? "" : text).split(BLANK).join(PH);
    var raw = [];
    if (lang === "http") tokHttp(src, raw);
    else if (lang === "html" || lang === "xml") tokHtml(src, raw);
    else if (lang === "css") tokCss(src, raw);
    else if (lang === "js") tokJs(src, raw, false);
    else if (lang === "json") tokJs(src, raw, true);
    else if (lang === "url") tokUrl(src, raw);
    else if (lang === "dns") tokDns(src, raw);
    else if (lang === "csp") tokCsp(src, raw);
    else if (lang === "shell") tokShell(src, raw);
    else if (lang === "yaml") tokYaml(src, raw);
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
      notes: ["いまは CSP の `frame-ancestors` で指定するのが基本です(単元「オリジン・CORS・CSP」)。古いブラウザのために X-Frame-Options も一緒に送ることがあります。"]
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


// =====================================================================
// ネットワークとTCP/IP(id: network)
// =====================================================================
WEBD.register("network", {
  cards: [
    {
      id: "osi-model", name: "OSI参照モデル", en: "OSI reference model",
      desc: "通信のしくみを7つの層に分けて考えるための模型です。下の層ほど電気信号に近く、上の層ほどアプリに近くなります。各層は、すぐ下の層の働きを使って自分の役目を果たします。",
      options: [
        ["第7層 アプリケーション", "HTTP・DNS など、アプリどうしの決まり"],
        ["第6層 プレゼンテーション", "データの表し方(文字コード・圧縮など)"],
        ["第5層 セッション", "通信の始まりと終わりの管理"],
        ["第4層 トランスポート", "TCP・UDP。端末の中のどのプログラムか(ポート)"],
        ["第3層 ネットワーク", "IP。ネットワークをまたいで宛先へ届ける"],
        ["第2層 データリンク", "イーサネット・Wi-Fi。となりの機器へ届ける"],
        ["第1層 物理", "ケーブル・電波などの信号"]
      ]
    },
    {
      id: "tcpip-model", name: "TCP/IPの4階層", en: "Internet protocol suite",
      desc: "インターネットで実際に使われているプロトコルの組み合わせで、4つの層で説明されます。送るときは上の層から順にヘッダーを付けて包み(カプセル化)、受け取ると下の層から順にはがします。",
      options: [
        ["アプリケーション層", "HTTP・DNS・SMTP など(OSI の第5〜7層)"],
        ["トランスポート層", "TCP・UDP(第4層)"],
        ["インターネット層", "IP・ICMP(第3層)"],
        ["ネットワークインターフェース層", "イーサネット・Wi-Fi(第1〜2層)"]
      ]
    },
    {
      id: "subnet-cidr", name: "サブネットとCIDR", en: "Subnet / CIDR notation",
      desc: "IPアドレスを、ネットワークを表す部分(ネットワーク部)と、その中の機器を表す部分(ホスト部)に分けます。`/24` は、先頭の24ビットがネットワーク部という意味で、この書き方を CIDR 表記といいます。",
      code: [{ cap: "192.168.1.0/24", lang: "text", text: "ネットワーク部: 192.168.1\nホスト部: 0〜255(8ビット)\nサブネットマスク: 255.255.255.0" }],
      options: [
        ["/24", "アドレス256個。機器に使えるのは254個"],
        ["/16", "アドレス65,536個"],
        ["/32", "アドレス1個だけ"]
      ],
      notes: ["ホスト部がすべて0のアドレス(ネットワークアドレス)と、すべて1のアドレス(ブロードキャストアドレス)は、機器に割り当てません。"]
    },
    {
      id: "private-ip", name: "プライベートIPアドレス", en: "Private address space",
      desc: "家庭や会社の中だけで自由に使えるIPv4アドレスの範囲です。インターネット上では使われず、外と通信するときは NAT でグローバルIPアドレスに変えます。",
      options: [
        ["10.0.0.0/8", "10.0.0.0〜10.255.255.255"],
        ["172.16.0.0/12", "172.16.0.0〜172.31.255.255"],
        ["192.168.0.0/16", "192.168.0.0〜192.168.255.255"]
      ],
      notes: ["`127.0.0.1` は自分自身を表すループバックアドレスで、プライベートアドレスとは別のものです。"]
    },
    {
      id: "tcp-udp", name: "TCPとUDP", en: "TCP / UDP",
      desc: "TCP は、接続を確立してから送り、届いたかの確認・再送・順番の並べ直しを行う、確実なプロトコルです。UDP は、確認も再送もせずに送るだけの軽いプロトコルで、遅れが少ないのが利点です。",
      options: [
        ["TCP", "HTTP/1.1・HTTP/2・メール・SSH など"],
        ["UDP", "DNS の多くの問い合わせ・音声や映像の通話・QUIC(HTTP/3)"]
      ],
      notes: ["UDP で確実さが必要なときは、その上のプロトコル(QUIC など)が再送などを受け持ちます。"]
    },
    {
      id: "three-way", name: "3ウェイハンドシェイク", en: "TCP three-way handshake",
      desc: "TCP が接続を始めるときの3回のやりとりです。クライアントが SYN を送り、サーバーが SYN+ACK を返し、クライアントが ACK を返すと接続ができます。",
      code: [{ lang: "text", text: "クライアント → SYN     → サーバー\nクライアント ← SYN+ACK ← サーバー\nクライアント → ACK     → サーバー" }],
      notes: ["接続を終えるときは FIN を送り合います。HTTPS では、このあとに TLS のハンドシェイクが続きます。"]
    },
    {
      id: "nat", name: "NAT", en: "Network Address Translation",
      desc: "ルーターが、プライベートIPアドレスとグローバルIPアドレスを付けかえるしくみです。ポート番号も付けかえて、1つのグローバルIPアドレスを家の中の複数の端末で共有するものを NAPT(IPマスカレード)といいます。",
      notes: ["外からは、NAT の内側の端末に直接つなぎにくくなります。WebRTC などで直接つなぐときに、工夫が必要になる理由です。"]
    },
    {
      id: "routing", name: "パケットとルーティング", en: "Packets / Routing",
      desc: "データは小さなパケットに分けて送られます。ルーターは、パケットの宛先IPアドレスと経路表(ルーティングテーブル)を見て、次にどのルーターへ渡すかを決めます。経路表にない宛先は、デフォルトゲートウェイへ送ります。",
      notes: ["IPのヘッダーには TTL(IPv6 ではホップリミット)があり、ルーターを1つ通るたびに1減ります。0になったパケットは捨てられ、送り主に ICMP で知らされます。経路がループしても、パケットが回り続けないためのしくみです。"]
    },
    {
      id: "ping-traceroute", name: "ping と traceroute", en: "ICMP-based diagnostic tools",
      desc: "`ping` は、ICMP のエコー要求を送って、相手から応答が返るかと、往復にかかる時間を調べます。`traceroute` は、TTL を1から順に増やしたパケットを送り、途中のルーターから返る知らせで、通り道を調べます。",
      code: [{ lang: "shell", text: "$ ping -c 3 example.com\n$ traceroute example.com" }],
      notes: ["ICMP に応答しないよう設定されたサーバーもあるので、ping が返らなくても、Webサイトが動いていないとは限りません。"]
    }
  ],
  questions: [
    {
      id: "n01", level: "basic", q: "TCP/IP の4階層のモデルで、HTTP が属する層は?", kind: "text",
      choices: ["アプリケーション層", "トランスポート層", "インターネット層", "ネットワークインターフェース層"],
      explain: "HTTP・DNS・SMTP などはアプリケーション層です。その下のトランスポート層の TCP や UDP を使って運ばれます。",
      ref: "tcpip-model"
    },
    {
      id: "n02", level: "basic", q: "届いたかの確認と再送、順番の並べ直しを行うプロトコルは?", kind: "code",
      choices: ["TCP", "UDP", "IP", "ICMP"],
      explain: "TCP は確実に届けるためのプロトコルです。UDP は確認も再送もしません。IP は宛先まで運ぶだけで、届いたかは確かめません。",
      ref: "tcp-udp"
    },
    {
      id: "n03", level: "basic", q: "プライベートIPアドレスはどれ?", kind: "code",
      choices: ["192.168.10.5", "8.8.8.8", "172.32.0.1", "203.0.113.7"],
      explain: "192.168.0.0/16 はプライベートアドレスの範囲です。172 で始まるものは 172.16〜172.31 だけがプライベートで、172.32 は範囲の外です。",
      ref: "private-ip"
    },
    {
      id: "n04", level: "basic", q: "SSH が使うウェルノウンポートの番号は?", kind: "code",
      choices: ["22", "21", "25", "53"],
      explain: "SSH は22番です。21番は FTP、25番はメールの送信(SMTP)、53番は DNS で使われます。",
      ref: "port"
    },
    {
      id: "n05", level: "std", q: "TCP の3ウェイハンドシェイクの順番は?", kind: "code",
      choices: ["SYN → SYN+ACK → ACK", "SYN → ACK → FIN", "ACK → SYN → SYN+ACK", "SYN+ACK → SYN → ACK"],
      explain: "クライアントが SYN で接続を求め、サーバーが SYN+ACK で応じ、クライアントが ACK を返して接続ができます。FIN は接続を終えるときに使います。",
      ref: "three-way"
    },
    {
      id: "n06", level: "std", q: "`192.168.1.0/24` のネットワークで、機器に割り当てられるアドレスはいくつ?", kind: "code",
      choices: ["254", "256", "255", "24"],
      explain: "ホスト部は8ビットなので256個ありますが、すべて0のネットワークアドレスと、すべて1のブロードキャストアドレスを除いて254個です。",
      ref: "subnet-cidr"
    },
    {
      id: "n07", level: "std", q: "UDP が向いている用途は?", kind: "text",
      choices: [
        "多少欠けても遅れが困る、音声や映像の通話",
        "1バイトも欠けてはいけない、ファイルのダウンロード",
        "届く順番が大事な、Webページの HTML の転送",
        "確実に届いたか確かめたい、銀行の振込の処理"
      ],
      explain: "UDP は再送をしないぶん遅れが少なく、少しの欠けより遅れが困る通話に向きます。確実さが必要なものには TCP を使います。",
      ref: "tcp-udp"
    },
    {
      id: "n08", level: "std", q: "NAPT(IPマスカレード)の働きは?", kind: "text",
      choices: [
        "ポート番号で区別し、1つのグローバルIPを複数台で共有する",
        "ドメイン名を IP アドレスに変換して、接続先を端末に教える",
        "通信の中身を暗号化して、途中の人に読めないようにする",
        "端末に IP アドレスなどの設定を自動で割り当てる"
      ],
      explain: "ルーターがアドレスとポート番号を付けかえて、家の中の複数の端末が1つのグローバルIPアドレスで通信できるようにします。名前の変換は DNS、自動の割り当ては DHCP の役目です。",
      ref: "nat"
    },
    {
      id: "n09", level: "std", q: "OSI参照モデルで、TCP が属する層は?", kind: "text",
      choices: ["トランスポート層(第4層)", "ネットワーク層(第3層)", "セッション層(第5層)", "データリンク層(第2層)"],
      explain: "TCP と UDP は第4層のトランスポート層です。IP は第3層のネットワーク層、イーサネットは第2層のデータリンク層です。",
      ref: "osi-model"
    },
    {
      id: "n10", level: "std", q: "ルーターが、パケットを次にどこへ渡すかを決めるのに使うのは?", kind: "text",
      choices: ["宛先のIPアドレスと経路表", "宛先のポート番号とドメイン名", "送信元のMACアドレスとURL", "パケットの中のHTTPヘッダー"],
      explain: "ルーターは第3層の機器で、宛先IPアドレスを経路表と照らして転送先を決めます。ポート番号や HTTP の中身は見ません。",
      ref: "routing"
    },
    {
      id: "n11", level: "std", q: "`ping` で調べられることは?", kind: "text",
      choices: [
        "相手から応答が返るかと、往復にかかる時間",
        "相手のサーバーで動いている Web サーバーの種類",
        "相手のドメインの登録者と、有効期限の日付",
        "相手までの通信が暗号化されているかどうか"
      ],
      explain: "ping は ICMP のエコー要求を送り、応答と往復時間(RTT)を表示します。相手が ICMP に応答しない設定のこともあります。",
      ref: "ping-traceroute"
    },
    {
      id: "n12", level: "pro", q: "`traceroute` は、どうやって途中のルーターを調べる?", kind: "text",
      choices: [
        "TTL を1ずつ増やし、期限切れを知らせたルーターを記録する",
        "経路上のルーターに順に問い合わせ、それぞれの経路表をダウンロードする",
        "DNS の逆引きだけを使って、通る国の一覧を順に調べる",
        "相手のサーバーのログを読みに行き、通った場所を調べる"
      ],
      explain: "TTL が0になったルーターは、パケットを捨てて ICMP で送り主に知らせます。TTL を1、2、3…と増やすと、近いルーターから順に知らせが返ってきます。",
      ref: "ping-traceroute"
    },
    {
      id: "n13", level: "pro", q: "`172.16.0.0/12` の範囲に含まれるアドレスは?", kind: "code",
      choices: ["172.31.0.1", "172.32.0.1", "172.15.255.1", "172.160.0.1"],
      explain: "/12 なので、先頭の12ビット(172 と、2つ目の数の上位4ビット)が同じものが範囲です。2つ目の数は 16〜31 になり、172.16.0.0〜172.31.255.255 です。",
      ref: "private-ip"
    },
    {
      id: "n14", level: "pro", q: "IP パケットの TTL が0になると、どうなる?", kind: "text",
      choices: [
        "パケットが捨てられ、送り主に ICMP で知らされる",
        "パケットが、最初の送り主のところへ自動で送り返される",
        "ルーターが TTL を64に戻して、転送を続ける",
        "宛先に届くまで、そのルーターの中で待たされる"
      ],
      explain: "TTL は、経路がループしたときにパケットが回り続けないためのしくみです。0になったら捨てられ、ICMP の Time Exceeded で知らされます。traceroute はこれを利用します。",
      ref: "routing"
    }
  ]
});


// =====================================================================
// JSONとデータ形式(id: json)
// =====================================================================
WEBD.register("json", {
  cards: [
    {
      id: "json-syntax", name: "JSONの文法", en: "JavaScript Object Notation (RFC 8259)",
      desc: "JSON は、データを文字で表す形式です。使える値は、オブジェクト・配列・文字列・数値・真偽値(true / false)・null の6種類です。",
      code: [{ lang: "json", text: "{\n  \"id\": 7,\n  \"name\": \"Ken\",\n  \"tags\": [\"a\", \"b\"],\n  \"admin\": false,\n  \"memo\": null\n}" }],
      notes: [
        "キーは、かならず二重引用符 `\"` で囲んだ文字列です。文字列にも `'` は使えません。",
        "最後の要素のあとのカンマ、コメント、`undefined`・`NaN`・`Infinity` は書けません。"
      ]
    },
    {
      id: "json-parse", name: "JSON.parse", mono: true, en: "JSON.parse()",
      desc: "JSON の文字列を、JavaScript の値に直します。文法がまちがっていると `SyntaxError` が投げられるので、外から来たデータは `try` / `catch` で囲みます。",
      code: [{ lang: "js", text: "JSON.parse('{\"a\": [1, 2]}').a[1]\n// → 2\nJSON.parse(\"{a: 1}\")\n// → SyntaxError" }],
      notes: ["数値は JavaScript の Number になるので、`9007199254740991`(Number.MAX_SAFE_INTEGER)を超える整数は正確に表せません。大きなIDは文字列でやりとりします。"]
    },
    {
      id: "json-stringify", name: "JSON.stringify", mono: true, en: "JSON.stringify()",
      desc: "JavaScript の値を JSON の文字列にします。第2引数(replacer)で出すプロパティを選び、第3引数(space)で字下げして読みやすくできます。",
      code: [{ lang: "js", text: "JSON.stringify({ a: 1 }, null, 2)\n// → \"{\\n  \\\"a\\\": 1\\n}\"\nJSON.stringify([1, undefined])\n// → \"[1,null]\"" }],
      options: [
        ["undefined・関数", "オブジェクトの中では省かれ、配列の中では null になる"],
        ["NaN・Infinity", "null になる"],
        ["Date", "toJSON() で ISO 8601 の文字列になる"]
      ]
    },
    {
      id: "json-media-type", name: "application/json", mono: true, en: "JSON media type",
      desc: "JSON を送るときの Content-Type です。JSON は UTF-8 で書く決まりなので、`charset` を付ける必要はありません。",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"ok\": true}" }],
      notes: ["fetch では `await res.json()` で本文を読み、値に直せます。"]
    },
    {
      id: "json-lines", name: "JSON Lines", en: "JSON Lines / NDJSON",
      desc: "1行に1つずつ JSON の値を書く形式です。行ごとに読めるので、ログや、少しずつ流れてくるデータに向いています。",
      code: [{ cap: "events.jsonl", lang: "json", text: "{\"t\": 1, \"ev\": \"login\"}\n{\"t\": 2, \"ev\": \"view\"}" }],
      notes: ["ファイル全体は1つの JSON ではないので、まとめて `JSON.parse` することはできません。"]
    },
    {
      id: "json-schema", name: "JSON Schema", en: "JSON Schema",
      desc: "JSON データの形(型・必須の項目・値の範囲など)を、JSON で書いて決める仕様です。受け取ったデータの検証や、API の説明に使われます。",
      code: [{ lang: "json", text: "{\n  \"type\": \"object\",\n  \"required\": [\"id\"],\n  \"properties\": {\n    \"id\": { \"type\": \"integer\" }\n  }\n}" }],
      notes: ["`additionalProperties: false` を書かないかぎり、properties にない項目があってもよいとみなされます。"]
    },
    {
      id: "data-formats", name: "XML・YAML・CSV", en: "Other data formats",
      desc: "JSON のほかにも、よく使われるデータの形式があります。用途に合わせて選びます。",
      code: [
        { cap: "XML", lang: "xml", text: "<user id=\"7\">\n  <name>Ken</name>\n</user>" },
        { cap: "YAML", lang: "yaml", text: "user:\n  id: 7\n  name: Ken  # コメント" },
        { cap: "CSV", lang: "text", text: "id,name\n7,Ken" }
      ],
      options: [
        ["XML", "タグで囲む。属性を持てる。古くからある API や設定で使う"],
        ["YAML", "字下げで階層を表す。コメントを書ける。設定ファイルに多い"],
        ["CSV", "表を行と列で表す。階層は表せない"]
      ]
    },
    {
      id: "utf8-bom", name: "UTF-8 と BOM", en: "Character encoding / Byte Order Mark",
      desc: "システムどうしでやりとりする JSON は、UTF-8 で書く決まりです(RFC 8259)。ファイルの先頭に BOM(バイト順マーク)を付けてはいけません。",
      notes: ["UTF-8 では、日本語のひらがなや漢字の多くは1文字3バイトです。"]
    },
    {
      id: "base64", name: "Base64", en: "Base64 encoding",
      desc: "バイナリのデータを、英数字と `+` `/`(と埋め草の `=`)だけの文字で表す変換です。3バイトを4文字にするので、大きさは約4/3倍になります。だれでも元に戻せるので、暗号化ではありません。",
      code: [{ lang: "js", text: "btoa(\"abc\")\n// → \"YWJj\"\natob(\"YWJj\")\n// → \"abc\"" }],
      options: [
        ["Base64URL", "`+` `/` の代わりに `-` `_` を使い、URL に入れられるようにしたもの(JWT で使う)"],
        ["パーセントエンコーディング", "URL に使えない文字だけを `%XX` にする。目的が違う"]
      ],
      notes: ["`btoa` は1文字が1バイトの文字列しか扱えません。日本語は、先に UTF-8 のバイト列にしてから変換します。"]
    }
  ],
  questions: [
    {
      id: "jn01", level: "basic", q: "JSON として正しいのは?", kind: "code",
      choices: ["{\"name\": \"Ken\"}", "{name: \"Ken\"}", "{'name': 'Ken'}", "{\"name\": \"Ken\",}"],
      explain: "JSON のキーと文字列は二重引用符で囲みます。引用符なしのキー、単引用符、最後のカンマは、JavaScript では書けても JSON ではまちがいです。",
      ref: "json-syntax"
    },
    {
      id: "jn02", level: "basic", q: "JSON の値として書けないものは?", kind: "code",
      choices: ["undefined", "null", "true", "3.14"],
      explain: "JSON の値は、オブジェクト・配列・文字列・数値・真偽値・null の6種類です。undefined はありません。",
      ref: "json-syntax"
    },
    {
      id: "jn03", level: "basic", q: "JSON の文法として正しいのは?", kind: "text",
      choices: [
        "文字列は二重引用符で囲む",
        "// でコメントを書ける",
        "最後の要素のあとにカンマを置ける",
        "キーは引用符なしで書ける"
      ],
      explain: "JSON はコメントも最後のカンマも書けず、キーはかならず二重引用符の文字列です。コメントを書きたい設定ファイルには YAML などが使われます。",
      ref: "json-syntax"
    },
    {
      id: "jn04", level: "basic", q: "JSON を返すレスポンスの Content-Type は?", kind: "code",
      choices: ["application/json", "text/json", "application/javascript", "text/plain"],
      explain: "JSON の正式なメディアタイプは `application/json` です。JSON は UTF-8 と決まっているので、charset は要りません。",
      ref: "json-media-type"
    },
    {
      id: "jn05", level: "basic", q: "JSON の文字列を、JavaScript のオブジェクトに直すメソッドは?", kind: "code",
      choices: ["JSON.parse", "JSON.stringify", "JSON.decode", "JSON.toObject"],
      explain: "文字列 → 値 は `JSON.parse`、値 → 文字列 は `JSON.stringify` です。decode や toObject というメソッドはありません。",
      ref: "json-parse"
    },
    {
      id: "jn06", level: "basic", q: "Base64 について正しいのは?", kind: "text",
      choices: [
        "暗号化ではなく、だれでも元に戻せる変換",
        "決まった鍵がないと、元に戻せない暗号化の方式",
        "データを半分ほどの大きさにする圧縮",
        "元に戻せない一方向のハッシュ関数"
      ],
      explain: "Base64 は、バイナリを文字で表すための変換です。大きさは約4/3倍に増え、秘密を守る力はありません。",
      ref: "base64"
    },
    {
      id: "jn07", level: "basic", q: "「JSON Lines」の説明として正しいのは?", kind: "text",
      choices: [
        "1行に1つずつ、JSON の値を書く形式",
        "1つの JSON を、1文字ずつ改行して書く形式",
        "JSON に、コメントの行を足せるようにした形式",
        "表の行と列を、カンマで区切って書く形式"
      ],
      explain: "JSON Lines は、行ごとに独立した JSON を並べます。ログを1行ずつ足したり読んだりできます。カンマで区切る表は CSV です。",
      ref: "json-lines"
    },
    {
      id: "jn08", level: "std", q: "このコードの結果は?", kind: "code",
      code: [{ lang: "js", text: "JSON.stringify({\n  d: new Date(0)\n})" }],
      choices: ["'{\"d\":\"1970-01-01T00:00:00.000Z\"}'", "'{\"d\":0}'", "'{\"d\":{}}'", "'{\"d\":\"Thu Jan 01 1970 00:00:00\"}'"],
      explain: "Date は `toJSON()` を持ち、ISO 8601 の形(UTC)の文字列になります。読みこむときは、`new Date(文字列)` で Date に戻します。",
      ref: "json-stringify"
    },
    {
      id: "jn09", level: "std", q: "このコードの結果は?", kind: "code",
      code: [{ lang: "js", text: "JSON.stringify([1, undefined, NaN])" }],
      choices: ["'[1,null,null]'", "'[1]'", "'[1,undefined,NaN]'", "'[1,null,NaN]'"],
      explain: "配列の中の undefined と、JSON にない NaN は、どちらも null になります。オブジェクトのプロパティの undefined は、null ではなく省かれます。",
      ref: "json-stringify"
    },
    {
      id: "jn10", level: "std", q: "`JSON.stringify(obj, null, 2)` の `2` の意味は?", kind: "text",
      choices: [
        "空白2つで字下げして、読みやすく整形する",
        "数値の小数点以下を、2けたにそろえて出力する",
        "2階層より深い部分を省いて出力する",
        "最初の2つのプロパティだけを出力する"
      ],
      explain: "第3引数(space)は字下げの幅です。数のかわりに `\"\\t\"` などの文字列も渡せます。第2引数は出すものを選ぶ replacer です。",
      ref: "json-stringify"
    },
    {
      id: "jn11", level: "std", q: "3バイトのデータを Base64 にすると、何文字になる?", kind: "code",
      choices: ["4", "3", "6", "2"],
      explain: "Base64 は6ビットを1文字で表すので、3バイト(24ビット)が4文字になります。全体で約4/3倍の大きさです。",
      ref: "base64"
    },
    {
      id: "jn12", level: "std", q: "JSON と YAML の違いとして正しいのは?", kind: "text",
      choices: [
        "YAML は # でコメントを書けるが、JSON は書けない",
        "JSON は字下げで階層を表し、YAML は括弧で階層を表す",
        "YAML は文字列しか扱えず、数値を書けない",
        "JSON はバイナリの形式で、人には読めない"
      ],
      explain: "YAML は字下げで階層を表し、`#` でコメントを書けるので、設定ファイルによく使われます。JSON はコメントを書けません。",
      ref: "data-formats"
    },
    {
      id: "jn13", level: "pro", q: "このスキーマで検証したとき、正しいとされる JSON は?", kind: "code",
      code: [{ cap: "JSON Schema", lang: "json", text: "{\n  \"type\": \"object\",\n  \"required\": [\"id\"],\n  \"properties\": {\n    \"id\": { \"type\": \"integer\" }\n  }\n}" }],
      choices: ["{\"id\": 7, \"x\": 1}", "{\"id\": \"7\"}", "{\"x\": 1}", "{\"id\": 7.5}"],
      explain: "id は必須で、整数でなければなりません。\"7\" は文字列、7.5 は整数ではありません。properties にない `x` は、`additionalProperties: false` がないので許されます。",
      ref: "json-schema"
    },
    {
      id: "jn14", level: "pro", q: "このコードの結果は?", kind: "code",
      code: [{ lang: "js", text: "const s = '{\"id\":9007199254740993}';\nJSON.parse(s).id" }],
      choices: ["9007199254740992", "9007199254740993", "\"9007199254740993\"", "SyntaxError"],
      explain: "JSON の数値は Number(倍精度の浮動小数点数)になり、2の53乗を超える整数は正確に表せません。大きなIDは、JSON の中で文字列にして送ります。",
      ref: "json-parse"
    },
    {
      id: "jn15", level: "std", q: "システムどうしでやりとりする JSON の文字コードとして、RFC 8259 で決められているのは?", kind: "code",
      choices: ["UTF-8", "Shift_JIS", "UTF-16", "EUC-JP"],
      explain: "やりとりする JSON は UTF-8 で書き、先頭に BOM を付けてはいけない決まりです。そのため `application/json` には charset を付けません。",
      ref: "utf8-bom"
    }
  ]
});


// =====================================================================
// Web APIとREST(id: api)
// =====================================================================
WEBD.register("api", {
  cards: [
    {
      id: "web-api", name: "Web API", en: "Web API",
      desc: "プログラムどうしが、HTTP を使って決まった形でデータをやりとりするための窓口です。リクエストを受け付けるURLをエンドポイントと呼び、データは JSON で送ることが多いです。",
      code: [
        { cap: "リクエスト", lang: "http", text: "GET /v1/users/42 HTTP/1.1\nHost: api.example.com\nAccept: application/json" },
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"id\": 42, \"name\": \"Ken\"}" }
      ]
    },
    {
      id: "rest", name: "REST", en: "Representational State Transfer",
      desc: "Web のしくみに沿って API を設計する考え方です。扱う対象を「リソース」としてURIで表し、HTTP のメソッドで操作します。",
      options: [
        ["リソースとURI", "ユーザーや注文などを、/users/42 のようなURIで表す"],
        ["統一インターフェース", "どのリソースにも、同じ意味の GET・POST・PUT・DELETE などを使う"],
        ["ステートレス", "リクエストごとに必要な情報(認証など)をすべて含め、前のやりとりに頼らない"],
        ["表現", "リソースの状態を JSON などの形で送る"]
      ]
    },
    {
      id: "uri-design", name: "URIの設計", en: "Resource naming",
      desc: "URIには、動詞ではなくリソースを表す名詞を使い、集まりは複数形にします。親子関係は階層で表し、操作の種類はメソッドで表します。",
      code: [{ lang: "text", text: "GET  /users          一覧\nGET  /users/42       1件\nGET  /users/42/orders  その人の注文\n× GET /getUser?id=42" }],
      notes: ["絞り込みや並び順など、リソースそのものではない条件はクエリで表します(`/orders?status=paid&sort=-created`)。"]
    },
    {
      id: "crud-methods", name: "CRUDとメソッド", en: "CRUD mapping",
      desc: "データの基本操作(作成・読み取り・更新・削除)を、HTTP のメソッドに対応させます。",
      options: [
        ["Create", "POST /users(新しいIDはサーバーが決める)"],
        ["Read", "GET /users/42"],
        ["Update", "PUT /users/42(全体を置きかえ)・PATCH /users/42(一部を変更)"],
        ["Delete", "DELETE /users/42"]
      ],
      notes: ["PUT は同じ内容を何度送っても結果が同じ(べき等)です。PATCH は書き方によってはべき等になりません(「数を1増やす」など)。"]
    },
    {
      id: "api-status", name: "ステータスコードの使い分け", en: "Status codes in APIs",
      desc: "API では、結果をステータスコードで正しく伝えます。エラーなのに 200 を返すと、クライアントやキャッシュが成功と誤解します。",
      options: [
        ["200", "成功(本文あり)"],
        ["201", "作成した。Location に新しいリソースのURL"],
        ["204", "成功したが本文なし(削除など)"],
        ["400", "リクエストの形がおかしい"],
        ["401 / 403", "認証が必要 / 権限がない"],
        ["404", "リソースがない"],
        ["409", "いまの状態とぶつかる"],
        ["422", "形は正しいが、内容を処理できない(入力の検証エラーなど)"],
        ["429", "呼び出しが多すぎる"]
      ]
    },
    {
      id: "pagination", name: "ページネーション", en: "Pagination",
      desc: "件数の多い一覧を、少しずつ分けて返す方法です。何件目から読むかを数で指定する offset 方式と、前回の続きの位置を表す値(カーソル)で指定する cursor 方式があります。",
      code: [
        { cap: "offset 方式", lang: "url", text: "/items?limit=20&offset=40" },
        { cap: "cursor 方式", lang: "url", text: "/items?limit=20&cursor=eyJpZCI6NjB9" }
      ],
      notes: [
        "offset 方式は好きなページへ飛べますが、読むあいだにデータが増減すると、重複や抜けが出ます。深いページほど遅くなりやすいです。",
        "cursor 方式はずれにくく速い反面、「5ページ目へ飛ぶ」ことは苦手です。"
      ]
    },
    {
      id: "versioning", name: "バージョニング", en: "API versioning",
      desc: "項目の削除や意味の変更など、いまの利用者を壊す変更(破壊的変更)をするときは、新しいバージョンとして出します。URLのパス(`/v2/`)やヘッダーで版を区別します。",
      notes: ["項目を足すだけなら、ふつうは破壊的変更ではありません。クライアントは、知らない項目を無視するように作ります。"]
    },
    {
      id: "problem-details", name: "エラーの形式", en: "Problem Details for HTTP APIs (RFC 9457)",
      desc: "エラーの中身を伝える共通の JSON の形です。Content-Type は `application/problem+json` で、`type` `title` `status` `detail` `instance` などの項目を持ちます。",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 422 Unprocessable Content\nContent-Type:\n  application/problem+json\n\n{\n  \"type\": \"/errors/invalid\",\n  \"title\": \"入力が正しくありません\",\n  \"status\": 422,\n  \"detail\": \"email の形式が違います\"\n}" }],
      notes: ["RFC 9457 は、以前の RFC 7807 を置きかえたものです。"]
    },
    {
      id: "rate-limit", name: "レート制限と Idempotency-Key", en: "Rate limiting / Idempotency key",
      desc: "短い時間の呼び出し回数を制限し、超えたら 429 Too Many Requests を返します。`Retry-After` で、いつ再試行してよいかを伝えます。`Idempotency-Key` は、POST を送り直しても二重に処理されないよう、リクエストに付ける一意の値です。",
      code: [
        { cap: "制限を超えたとき", lang: "http", text: "HTTP/1.1 429 Too Many Requests\nRetry-After: 30" },
        { cap: "二重の注文を防ぐ", lang: "http", text: "POST /orders HTTP/1.1\nIdempotency-Key: 7f3a-91c2" }
      ],
      notes: ["Idempotency-Key は決済サービスなどで広く使われ、IETF で標準化の案(ドラフト)が出されているヘッダーです。サーバーは同じキーのリクエストに、前と同じ結果を返します。"]
    },
    {
      id: "openapi", name: "OpenAPI・GraphQL・gRPC", en: "API description / Alternatives to REST",
      desc: "OpenAPI は、REST API のエンドポイント・パラメーター・レスポンスの形を YAML や JSON で書く仕様で、文書やコードの自動生成に使います。GraphQL と gRPC は、REST とは別の API の方式です。",
      code: [{ cap: "OpenAPI(一部)", lang: "yaml", text: "paths:\n  /users/{id}:\n    get:\n      summary: 1件取得\n      responses:\n        \"200\":\n          description: OK" }],
      options: [
        ["GraphQL", "1つのエンドポイントに、ほしい項目をクエリで書いて送る"],
        ["gRPC", "Protocol Buffers のバイナリで、HTTP/2 の上で関数のように呼ぶ"]
      ]
    }
  ],
  questions: [
    {
      id: "ap01", level: "basic", q: "新しいユーザーを作るとき、`/users` に送るメソッドとして最も一般的なのは?", kind: "code",
      choices: ["POST", "GET", "DELETE", "HEAD"],
      explain: "集まり(/users)に POST して、新しいリソースを作らせます。新しいIDはサーバーが決め、201 と Location で知らせます。",
      ref: "crud-methods"
    },
    {
      id: "ap02", level: "basic", q: "REST の考え方に沿った URI はどれ?", kind: "code",
      choices: ["/users/42", "/getUser?id=42", "/user_get/42", "/api/doGetUserById"],
      explain: "URI はリソース(名詞)を表し、「取得する」という操作はメソッド(GET)で表します。動詞を URI に入れません。",
      ref: "uri-design"
    },
    {
      id: "ap03", level: "basic", q: "Web API の説明として正しいのは?", kind: "text",
      choices: [
        "プログラムどうしが HTTP でデータをやりとりする窓口",
        "Web ページの見た目を整えるために、ブラウザに読ませる言語",
        "データを長く保存しておくための、サーバーの中のデータベース",
        "画面を描くために、ブラウザに組みこまれた描画の部品"
      ],
      explain: "Web API は、ほかのプログラムから HTTP で呼び出せる機能の入口です。データは JSON で返すことが多いです。",
      ref: "web-api"
    },
    {
      id: "ap04", level: "std", q: "`DELETE /users/42` が成功し、返す本文はない。適したステータスコードは?", kind: "code",
      choices: ["204", "201", "304", "202"],
      explain: "204 No Content は、成功したが本文がないことを表します。201 は作成、304 はキャッシュの確認、202 は「受け付けたが処理はまだ」です。",
      ref: "api-status"
    },
    {
      id: "ap05", level: "std", q: "PUT と PATCH の違いとして正しいのは?", kind: "text",
      choices: [
        "PUT は全体を置きかえ、PATCH は一部だけを変える",
        "PUT は一部だけを変え、PATCH は全体を置きかえる",
        "PUT は作成だけに使い、PATCH は削除だけに使う",
        "PUT と PATCH は同じ働きで、名前が違うだけ"
      ],
      explain: "PUT は送った内容でリソース全体を置きかえるので、送らなかった項目は消えることがあります。PATCH は指定した部分だけを変更します。",
      ref: "crud-methods"
    },
    {
      id: "ap06", level: "std", q: "POST でリソースを作成した。空欄に入る、新しいリソースのURLを伝えるヘッダーは?", kind: "code",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 201 Created\n____: /users/43" }],
      choices: ["Location", "Referer", "Host", "Link"],
      explain: "201 Created と一緒に `Location` で、作ったリソースのURLを返します。クライアントはそのURLで GET できます。",
      ref: "api-status"
    },
    {
      id: "ap07", level: "std", q: "offset 方式のページネーションの弱点は?", kind: "text",
      choices: [
        "読む間にデータが増減すると、重複や抜けが出る",
        "1ページの件数を、サーバー側で決められなくなる",
        "最初のページより先のデータは、取得できなくなる",
        "ページの位置を、URL のクエリに書けなくなる"
      ],
      explain: "「40件目から20件」と数で指定するので、途中で先頭に1件増えると、前のページの最後の1件がもう一度出ます。cursor 方式はこれが起きにくくなります。",
      ref: "pagination"
    },
    {
      id: "ap08", level: "std", q: "トークンは正しいが、一般ユーザーが管理者だけの API を呼んだ。返すステータスコードは?", kind: "code",
      choices: ["403", "401", "404", "400"],
      explain: "だれかはわかっている(認証は成功)が、権限がないので 403 Forbidden です。トークンがない・無効なときは 401 です。",
      ref: "api-status"
    },
    {
      id: "ap09", level: "std", q: "429 と一緒に返して、再試行してよい時間を伝えるヘッダーは?", kind: "code",
      choices: ["Retry-After", "Expires", "Cache-Control", "Age"],
      explain: "`Retry-After` には秒数か日時を書きます。クライアントはその時間まで待ってから送り直します。",
      ref: "rate-limit"
    },
    {
      id: "ap10", level: "std", q: "REST の「ステートレス」の説明として正しいのは?", kind: "text",
      choices: [
        "各リクエストに必要な情報をすべて含め、前のやりとりに頼らない",
        "サーバーはデータベースを持たず、利用者のデータを何も保存しない",
        "1本の接続を開いたまま、すべてのリクエストを順番に送る",
        "レスポンスにはステータスコードもヘッダーも付けない"
      ],
      explain: "サーバーが前のリクエストの状態を覚えていなくても処理できるように、認証の情報などを毎回送ります。データを保存しないという意味ではありません。",
      ref: "rest"
    },
    {
      id: "ap11", level: "std", q: "REST API のエンドポイントやレスポンスの形を、YAML や JSON で記述する仕様は?", kind: "code",
      choices: ["OpenAPI", "GraphQL", "gRPC", "JSON Lines"],
      explain: "OpenAPI で書いた仕様から、API の文書や、呼び出すコードを自動で作れます。GraphQL と gRPC は API の方式そのものです。",
      ref: "openapi"
    },
    {
      id: "ap12", level: "pro", q: "RFC 9457 の形式でエラーを返すときの Content-Type は?", kind: "code",
      choices: ["application/problem+json", "application/error+json", "text/problem", "application/json+error"],
      explain: "Problem Details の形式は `application/problem+json` です。`type` `title` `status` `detail` などの項目でエラーを伝えます。",
      ref: "problem-details"
    },
    {
      id: "ap13", level: "pro", q: "注文の POST に `Idempotency-Key` を付ける目的は?", kind: "text",
      choices: [
        "送り直しても、同じ注文を二重に作らないようにする",
        "リクエストの本文を暗号化して、途中での盗み見を防ぐ",
        "API キーの代わりに使って、呼び出した利用者を認証する",
        "レスポンスを CDN にキャッシュさせて、表示を速くする"
      ],
      explain: "通信が切れて結果がわからないとき、同じキーで送り直せば、サーバーは前の結果を返し、注文を増やしません。POST はべき等ではないので、この工夫が要ります。",
      ref: "rate-limit"
    },
    {
      id: "ap14", level: "pro", q: "cursor 方式のページネーションの利点は?", kind: "text",
      choices: [
        "続きの位置を値で示すので、データが増減してもずれにくい",
        "ページ番号を指定するだけで、好きなページへすぐに飛べる",
        "全体の件数を、いつも正確にすばやく返せる",
        "クエリなしで、すべてのデータを1回で受け取れる"
      ],
      explain: "「最後に見た ID の次から」のように位置を指定するので、途中で増減があっても重複や抜けが出にくく、深いページでも速く読めます。好きなページへ飛ぶのは offset 方式の得意なことです。",
      ref: "pagination"
    },
    {
      id: "ap15", level: "pro", q: "GraphQL の特徴として正しいのは?", kind: "text",
      choices: [
        "必要な項目をクエリで指定し、1つのエンドポイントで受け取る",
        "リソースごとに URL を分け、決まった項目を GET で受け取る",
        "Protocol Buffers のバイナリで、HTTP/2 の上で関数を呼ぶ",
        "API の仕様を YAML で書き、文書やコードを自動で作る"
      ],
      explain: "GraphQL では、クライアントがほしい項目を指定するので、取りすぎや取り足りないことが減ります。2つ目は REST、3つ目は gRPC、4つ目は OpenAPI の説明です。",
      ref: "openapi"
    },
    {
      id: "ap16", level: "std", q: "公開中の API で、いまの利用者のプログラムを壊す変更(破壊的変更)にあたるのは?", kind: "text",
      choices: [
        "レスポンスにある項目を削除する",
        "レスポンスに新しい項目を足す",
        "新しいエンドポイントを追加する",
        "説明の文書の誤字を直す"
      ],
      explain: "使っている項目が消えると、クライアントは動かなくなります。こうした変更は新しいバージョン(/v2/ など)で出します。項目やエンドポイントを足すだけなら、ふつうは壊しません。",
      ref: "versioning"
    }
  ]
});


// =====================================================================
// 認証と認可(id: auth)
// =====================================================================
WEBD.register("auth", {
  cards: [
    {
      id: "authn-authz", name: "認証と認可", en: "Authentication / Authorization",
      desc: "認証は「あなたはだれか」を確かめること、認可は「その人に何をしてよいか」を決めることです。HTTP では、認証が必要なら 401、認証はできても権限がなければ 403 を返します。",
      options: [
        ["認証(AuthN)", "パスワード・パスキー・トークンなどで本人を確かめる"],
        ["認可(AuthZ)", "役割や権限を見て、操作を許すか決める"]
      ]
    },
    {
      id: "basic-auth", name: "Basic認証", en: "HTTP Basic authentication",
      desc: "`ユーザー名:パスワード` を Base64 にして、`Authorization` ヘッダーで毎回送る方法です。Base64 は暗号化ではないので、かならず HTTPS で使います。",
      code: [
        { cap: "サーバー → 認証を求める", lang: "http", text: "HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Basic\n  realm=\"admin\"" },
        { cap: "ブラウザ → 送る", lang: "http", text: "Authorization: Basic\n  a2VuOnNlY3JldA==" }
      ]
    },
    {
      id: "bearer-apikey", name: "Bearerトークンと APIキー", en: "Bearer token / API key",
      desc: "Bearer トークンは「持っている人が使える」トークンで、`Authorization: Bearer <トークン>` で送ります。APIキーは、呼び出すアプリやサービスを見分けるための秘密の文字列です。",
      code: [{ cap: "リクエスト", lang: "http", text: "GET /v1/me HTTP/1.1\nAuthorization: Bearer eyJhbGc…" }],
      notes: [
        "盗まれるとそのまま使われるので、HTTPS で送り、URL のクエリには入れません(ログや履歴に残るため)。",
        "ブラウザで動くコードに秘密の APIキーを書くと、だれでも読めてしまいます。"
      ]
    },
    {
      id: "session-vs-token", name: "セッション方式とトークン方式", en: "Session-based / Token-based authentication",
      desc: "セッション方式は、サーバーがログインの状態を保存し、ブラウザには Cookie でセッションIDだけを渡します。トークン方式は、署名つきのトークン(JWT など)に情報を入れて渡し、サーバーは署名を確かめるだけで済ませます。",
      options: [
        ["セッション方式", "サーバーで消せばすぐログアウトできる。サーバーどうしで状態の共有が要る"],
        ["トークン方式", "サーバーが状態を持たなくてよい。発行したトークンを途中で無効にしにくい"]
      ],
      notes: ["トークン方式では、アクセストークンの期限を短くし、リフレッシュトークンで取り直すのが一般的です。"]
    },
    {
      id: "oauth2", name: "OAuth 2.0", en: "OAuth 2.0 Authorization Framework",
      desc: "パスワードを渡さずに、ほかのアプリに「あなたの代わりに、この範囲だけ操作してよい」という権限を与えるしくみです。権限はアクセストークンの形で渡されます。",
      options: [
        ["リソースオーナー", "データの持ち主(利用者)"],
        ["クライアント", "権限をもらって API を呼ぶアプリ"],
        ["認可サーバー", "利用者の同意を得て、トークンを発行する"],
        ["リソースサーバー", "トークンを確かめて、データを返す API"]
      ],
      notes: ["OAuth 2.0 は認可のしくみです。「だれがログインしたか」を伝える部分は、OpenID Connect が足しています。"]
    },
    {
      id: "pkce", name: "認可コードフローと PKCE", en: "Authorization Code Flow with PKCE",
      desc: "利用者を認可サーバーへ移して同意させ、戻ってきたときに受け取る一時的な「認可コード」を、裏でアクセストークンに換える流れです。PKCE は、毎回作るランダムな値(code_verifier)で、横取りされたコードを使えないようにします。",
      options: [
        ["code_verifier", "クライアントが毎回作る秘密のランダムな値"],
        ["code_challenge", "code_verifier の SHA-256 ハッシュを Base64URL にしたもの(S256 方式)。最初の要求で送る"],
        ["state", "戻ってきた応答が、自分の始めた手続きかを確かめる値(CSRF 対策)"]
      ],
      notes: ["トークンを URL で直接受け取るインプリシットフローは、漏れやすいため、現在のセキュリティの指針では使わないことになっています。SPA やスマホアプリも、認可コードフロー + PKCE を使います。"]
    },
    {
      id: "token-types", name: "アクセストークンとリフレッシュトークン", en: "Access token / Refresh token / Scope",
      desc: "アクセストークンは API を呼ぶための短い期限のトークン、リフレッシュトークンは期限が切れたアクセストークンを取り直すためのトークンです。スコープは、トークンで許される操作の範囲です。",
      code: [{ cap: "トークンのレスポンス(一部)", lang: "json", text: "{\n  \"access_token\": \"eyJ…\",\n  \"expires_in\": 3600,\n  \"refresh_token\": \"8xLO…\",\n  \"scope\": \"read:photos\"\n}" }],
      notes: ["リフレッシュトークンは長く使えるので、とくに大切に保管します。"]
    },
    {
      id: "oidc", name: "OpenID Connect", en: "OpenID Connect (OIDC)",
      desc: "OAuth 2.0 の上に、ログインした人がだれかを伝える「IDトークン」を足したしくみです。「Google でログイン」などに使われます。スコープに `openid` を入れて要求します。",
      options: [
        ["iss", "トークンを発行したサーバー"],
        ["sub", "利用者を表す一意のID"],
        ["aud", "トークンを受け取るはずのアプリ(クライアントID)"],
        ["exp", "有効期限"]
      ],
      notes: ["IDトークンは JWT で、受け取ったアプリは署名と iss・aud・exp を確かめます。"]
    },
    {
      id: "jwt-verify", name: "JWT の検証", en: "JWT validation",
      desc: "JWT を受け取ったサーバーは、決めておいたアルゴリズムで署名を確かめ、期限(exp)や発行者(iss)、受け取り手(aud)も確かめます。",
      code: [{ cap: "JWT の3つの部分", lang: "text", text: "ヘッダー.ペイロード.署名\neyJhbGciOiJ… . eyJzdWIiOi… . SflKxw…" }],
      notes: [
        "ヘッダーの `alg` をそのまま信じてはいけません。`\"alg\": \"none\"`(署名なし)を受け入れると、だれでも中身を書きかえたトークンを通せてしまいます。",
        "ペイロードは暗号化されていないので、秘密の情報を入れません。"
      ]
    },
    {
      id: "passkey-mfa", name: "パスキーと多要素認証", en: "Passkeys (WebAuthn) / Multi-factor authentication",
      desc: "パスキーは、端末の中の秘密鍵で署名してログインするしくみ(WebAuthn)です。サーバーには公開鍵だけを置き、鍵はサイトに結びつくので、偽サイトでは使われません。多要素認証は、知識・所持・生体のうち2つ以上を組み合わせます。",
      options: [
        ["知識", "パスワード・暗証番号"],
        ["所持", "スマホ・セキュリティキー"],
        ["生体", "指紋・顔"]
      ],
      notes: ["パスワードを2回入れるのは、同じ「知識」なので多要素ではありません。"]
    }
  ],
  questions: [
    {
      id: "au01", level: "basic", q: "「あなたはだれか」を確かめることを何という?", kind: "text",
      choices: ["認証", "認可", "暗号化", "署名"],
      explain: "本人を確かめるのが認証、その人に何を許すか決めるのが認可です。",
      ref: "authn-authz"
    },
    {
      id: "au02", level: "basic", q: "多要素認証の例として正しいのは?", kind: "text",
      choices: [
        "パスワードと、スマホのアプリに出るコードを入れる",
        "同じパスワードを、確認のために2回入力する",
        "長くて複雑なパスワードを、1つだけずっと使い続ける",
        "秘密の質問に、2つ続けて答えるようにする"
      ],
      explain: "パスワード(知識)とスマホ(所持)という、種類の違う要素を組み合わせています。パスワードや秘密の質問をいくつ重ねても、知識の1種類だけです。",
      ref: "passkey-mfa"
    },
    {
      id: "au03", level: "std", q: "Basic認証について正しいのは?", kind: "text",
      choices: [
        "中身は Base64 にしただけなので、HTTPS が必須",
        "パスワードはハッシュ化して送られるので、HTTP でも安全",
        "トークンの期限が切れると、自動で新しいものに更新される",
        "ID だけを送り、パスワードはサーバーが自分で調べる"
      ],
      explain: "Base64 はだれでも元に戻せるので、HTTP で送ると盗み見でパスワードがわかってしまいます。",
      ref: "basic-auth"
    },
    {
      id: "au04", level: "std", q: "OAuth 2.0 のアクセストークンを API に送る。空欄に入るのは?", kind: "code",
      code: [{ cap: "リクエスト", lang: "http", text: "GET /v1/me HTTP/1.1\nAuthorization: ____ eyJhbGc…" }],
      choices: ["Bearer", "Basic", "Cookie", "Session"],
      explain: "アクセストークンは `Authorization: Bearer <トークン>` で送ります。Basic は「ユーザー名:パスワード」を送る方式です。",
      ref: "bearer-apikey"
    },
    {
      id: "au05", level: "std", q: "OAuth 2.0 の主な目的は?", kind: "text",
      choices: [
        "パスワードを渡さずに、ほかのアプリに限られた権限を与える",
        "利用者のパスワードを、暗号化して安全にほかのサイトへ送り届ける",
        "通信を暗号化して、途中での盗み見を防ぐためのしくみ",
        "サイトのページを、検索エンジンに知らせるためのしくみ"
      ],
      explain: "利用者は認可サーバーで同意するだけで、アプリにはパスワードではなく、範囲と期限のあるアクセストークンが渡されます。",
      ref: "oauth2"
    },
    {
      id: "au06", level: "std", q: "リフレッシュトークンの役割は?", kind: "text",
      choices: [
        "期限が切れたアクセストークンを、新しく取り直す",
        "ページを再読み込みしたとき、キャッシュを消す",
        "ログインした人の名前やメールを、画面に表示する",
        "API の呼び出し回数の上限を、一時的に増やす"
      ],
      explain: "アクセストークンは盗まれたときの被害を小さくするため期限を短くし、切れたらリフレッシュトークンで取り直します。",
      ref: "token-types"
    },
    {
      id: "au07", level: "std", q: "OAuth 2.0 の「スコープ」が表すのは?", kind: "text",
      choices: [
        "トークンで許される操作の範囲",
        "トークンを使える期限の長さ",
        "トークンを発行したサーバーの名前",
        "トークンを受け取るアプリの URL"
      ],
      explain: "`read:photos` のように、許す操作を絞ります。アプリには必要な最小限のスコープだけを与えます。",
      ref: "token-types"
    },
    {
      id: "au08", level: "std", q: "署名つきの JWT を使うトークン方式の弱点は?", kind: "text",
      choices: [
        "発行したトークンを、期限の前に無効にしにくい",
        "サーバーどうしでセッションを共有しないと使えない",
        "ブラウザ以外のアプリからは、送ることができない",
        "署名があるので、だれも中身を読むことができない"
      ],
      explain: "サーバーは署名を確かめるだけで状態を持たないので、盗まれたトークンも期限までは使えてしまいます。そのため期限を短くします。セッションの共有が要るのはセッション方式です。",
      ref: "session-vs-token"
    },
    {
      id: "au09", level: "pro", q: "SPA やスマホアプリが OAuth 2.0 でトークンを得るとき、推奨される方法は?", kind: "text",
      choices: [
        "認可コードフロー + PKCE",
        "インプリシットフロー",
        "パスワードをアプリが受け取って送る方式",
        "Basic認証で毎回パスワードを送る方式"
      ],
      explain: "インプリシットフローはトークンを URL で受け取るため漏れやすく、現在は非推奨です。秘密を持てないアプリも、認可コードフローに PKCE を組み合わせます。",
      ref: "pkce"
    },
    {
      id: "au10", level: "pro", q: "PKCE が防ぐのは?", kind: "text",
      choices: [
        "横取りされた認可コードを、トークンに換えられること",
        "利用者が、認可サーバーで同意を取り消すこと",
        "アクセストークンの期限が、短くなりすぎること",
        "ログイン画面の見た目を、攻撃者に偽物へ変えられること"
      ],
      explain: "クライアントは code_verifier のハッシュを先に送っておき、コードをトークンに換えるときに code_verifier そのものを見せます。コードだけを盗んだ者は、それを知らないので換えられません。",
      ref: "pkce"
    },
    {
      id: "au11", level: "pro", q: "OpenID Connect と OAuth 2.0 の関係として正しいのは?", kind: "text",
      choices: [
        "OAuth 2.0 の上に、ログインした人を伝える IDトークンを足したもの",
        "OAuth 2.0 の古い名前で、中身はまったく同じもの",
        "OAuth 2.0 の代わりに、パスワードを暗号化してほかのサイトに渡すもの",
        "OAuth 2.0 とは関係なく、API のレート制限を決める規格"
      ],
      explain: "OAuth 2.0 は「何をしてよいか」を渡すしくみで、ログインした人がだれかは決めていません。OIDC が IDトークンでそれを伝えます。",
      ref: "oidc"
    },
    {
      id: "au12", level: "pro", q: "受け取った JWT のヘッダーが `{\"alg\": \"none\"}` だったのに、そのまま受け入れた。何が危ない?", kind: "text",
      choices: [
        "署名なしのトークンが通り、だれでも中身を書きかえて使える",
        "トークンの期限が短くなり、利用者がすぐにログアウトされる",
        "ペイロードが暗号化されて、サーバーが読めなくなる",
        "トークンが長くなりすぎて、Cookie に入りきらなくなる"
      ],
      explain: "alg: none は「署名なし」という意味です。サーバーは使うアルゴリズムを自分で決めておき、それ以外のトークンは拒否します。",
      ref: "jwt-verify"
    },
    {
      id: "au13", level: "pro", q: "IDトークンの `aud` を確かめる目的は?", kind: "text",
      choices: [
        "自分のアプリ向けに発行されたトークンか確かめる",
        "トークンを発行したのが、どのサーバーか確かめる",
        "トークンの有効期限が、切れていないか確かめる",
        "ログインした人を表す、一意のIDを取り出す"
      ],
      explain: "aud(audience)は受け取り手です。別のアプリ向けのトークンを使い回されないように確かめます。発行者は iss、期限は exp、利用者のIDは sub です。",
      ref: "oidc"
    },
    {
      id: "au14", level: "pro", q: "パスキーがフィッシングに強い理由は?", kind: "text",
      choices: [
        "鍵がサイトに結びつき、偽のサイトでは使われないから",
        "パスワードを長く複雑にして、推測されにくくしているから",
        "サーバーに秘密鍵を預けて、管理を任せているから",
        "ログインのたびに、メールで確認コードを送るから"
      ],
      explain: "パスキーは登録したサイトのためだけに使われ、偽サイトには署名を返しません。秘密鍵は端末の中にあり、サーバーには公開鍵しかないので、漏れても悪用できません。",
      ref: "passkey-mfa"
    },
    {
      id: "au15", level: "pro", q: "OAuth 2.0 の認可リクエストに `state` を付ける目的は?", kind: "text",
      choices: [
        "戻ってきた応答が、自分の始めた手続きかを確かめる",
        "利用者の住む国や地域を、認可サーバーに伝える",
        "アクセストークンの有効期限を、クライアントが決める",
        "ログイン画面を表示する言語を、認可サーバーに伝える"
      ],
      explain: "推測できない値を送り、戻ってきたときに同じ値か確かめます。攻撃者が自分の認可コードを利用者に送りこむ CSRF を防ぎます。",
      ref: "pkce"
    }
  ]
});


// =====================================================================
// リアルタイム通信(id: realtime)
// =====================================================================
WEBD.register("realtime", {
  cards: [
    {
      id: "polling", name: "ポーリングとロングポーリング", en: "Polling / Long polling",
      desc: "ポーリングは、クライアントが一定の間隔でサーバーに「新しいデータはある?」と問い合わせる方法です。ロングポーリングは、サーバーが新しいデータが出るまで返事を待たせ、返したらクライアントがすぐまた問い合わせる方法です。",
      code: [{ cap: "ポーリング", lang: "js", text: "setInterval(async () => {\n  const r = await fetch(\"/news\");\n  show(await r.json());\n}, 10000);" }],
      notes: ["ふつうの HTTP だけで作れますが、ポーリングは新しいデータがなくても問い合わせるので、むだな通信と遅れが出ます。"]
    },
    {
      id: "sse", name: "Server-Sent Events", en: "Server-Sent Events (EventSource)",
      desc: "サーバーからクライアントへ、1本の HTTP の接続でイベントを送り続けるしくみです。向きは一方向(サーバー → クライアント)だけで、ブラウザは `EventSource` で受け取ります。切れると自動で再接続します。",
      code: [
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 200 OK\nContent-Type: text/event-stream\n\nid: 1\ndata: 株価 1200\n\nid: 2\ndata: 株価 1210" },
        { cap: "ブラウザ", lang: "js", text: "const es = new EventSource(\"/s\");\nes.onmessage = (e) => {\n  show(e.data);\n};" }
      ],
      notes: ["再接続のとき、ブラウザは最後に受け取った id を `Last-Event-ID` ヘッダーで送るので、サーバーは続きから送れます。"]
    },
    {
      id: "websocket", name: "WebSocket", en: "The WebSocket Protocol (RFC 6455)",
      desc: "1本の接続で、クライアントとサーバーが好きなときに双方向でメッセージを送り合えるプロトコルです。HTTP のリクエストで「切りかえたい」と伝え、サーバーが 101 Switching Protocols を返すと、WebSocket の通信に変わります。",
      code: [
        { cap: "リクエスト", lang: "http", text: "GET /chat HTTP/1.1\nHost: example.com\nUpgrade: websocket\nConnection: Upgrade\nOrigin: https://example.com" },
        { cap: "レスポンス", lang: "http", text: "HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade" }
      ],
      options: [
        ["ws://", "暗号化なし"],
        ["wss://", "TLS で暗号化(https と同じく、ふつうはこちら)"]
      ],
      notes: ["WebSocket には同一オリジンポリシーや CORS が働きません。サーバーは `Origin` ヘッダーを確かめ、許可したページからの接続だけを受け付けます。"]
    },
    {
      id: "ws-api", name: "WebSocket の使い方", en: "WebSocket API",
      desc: "ブラウザでは `new WebSocket(URL)` で接続し、`send` で送り、`message` イベントで受け取ります。テキストとバイナリを送れます。",
      code: [{ lang: "js", text: "const ws = new WebSocket(\n  \"wss://example.com/chat\");\nws.onopen = () => ws.send(\"hi\");\nws.onmessage = (e) => {\n  show(e.data);\n};" }],
      notes: ["WebSocket API には自動の再接続がありません。切れたら(`close` イベント)、間隔を少しずつ広げながら自分でつなぎ直します。"]
    },
    {
      id: "webrtc", name: "WebRTC", en: "Web Real-Time Communication",
      desc: "ブラウザどうしが直接(P2P)つながって、映像・音声・データを送り合うしくみです。通信はかならず暗号化されます。",
      options: [
        ["シグナリング", "つなぐ前に接続の情報を交換すること。方法は決まっておらず、WebSocket などで用意する"],
        ["STUN", "NAT の外から見た自分のアドレスを調べるサーバー"],
        ["TURN", "直接つながれないとき、通信を中継するサーバー"]
      ]
    },
    {
      id: "realtime-choice", name: "方式の使い分け", en: "Choosing a real-time method",
      desc: "必要な向きと頻度で、方式を選びます。",
      options: [
        ["ポーリング", "更新がたまにで、少し遅れてもよい"],
        ["Server-Sent Events", "サーバーからの通知・配信だけ(株価・進み具合など)"],
        ["WebSocket", "双方向に頻繁にやりとりする(チャット・共同編集・ゲーム)"],
        ["WebRTC", "ブラウザどうしの通話・画面共有"]
      ]
    },
    {
      id: "keepalive", name: "接続の維持", en: "Keepalive / Idle timeout",
      desc: "長く開いたままの接続は、途中のプロキシやロードバランサーに、しばらく通信がないと切られることがあります。定期的に小さなメッセージ(ハートビート)を送って、接続を保ちます。",
      notes: ["WebSocket のプロトコルには ping と pong のしくみがあり、サーバーから送って相手が生きているかを確かめられます。"]
    }
  ],
  questions: [
    {
      id: "rt01", level: "basic", q: "サーバーからクライアントへ一方向にイベントを送り続け、ブラウザが `EventSource` で受け取るしくみは?", kind: "code",
      choices: ["Server-Sent Events", "WebSocket", "WebRTC", "Web Worker"],
      explain: "Server-Sent Events(SSE)は、ふつうの HTTP の接続を開いたままにして、サーバーから送り続けます。",
      ref: "sse"
    },
    {
      id: "rt02", level: "basic", q: "「ポーリング」の説明として正しいのは?", kind: "text",
      choices: [
        "クライアントが一定の間隔で、新しいデータを問い合わせる",
        "サーバーが接続を開いたままにして、データを押し出し続ける",
        "ブラウザどうしが直接つながって、データを送り合う",
        "1回だけ問い合わせて、その結果をずっと使い続ける"
      ],
      explain: "ポーリングは、ふつうの HTTP のリクエストをくり返す方法です。簡単ですが、新しいデータがなくても通信が発生します。",
      ref: "polling"
    },
    {
      id: "rt03", level: "std", q: "WebSocket に切りかえるときの、サーバーのレスポンスの空欄に入るのは?", kind: "code",
      code: [{ cap: "レスポンス", lang: "http", text: "HTTP/1.1 ____ Switching Protocols\nUpgrade: websocket\nConnection: Upgrade" }],
      choices: ["101", "200", "301", "426"],
      explain: "101 Switching Protocols で、この接続を WebSocket に切りかえます。以後は HTTP ではなく、WebSocket のフレームでやりとりします。",
      ref: "websocket"
    },
    {
      id: "rt04", level: "std", q: "TLS で暗号化した WebSocket の URL のスキームは?", kind: "code",
      choices: ["wss://", "ws://", "https://", "socket://"],
      explain: "暗号化ありは `wss://`、なしは `ws://` です。HTTPS のページからは、wss を使います。",
      ref: "websocket"
    },
    {
      id: "rt05", level: "std", q: "Server-Sent Events のレスポンスの Content-Type は?", kind: "code",
      choices: ["text/event-stream", "application/json", "text/plain", "application/websocket"],
      explain: "`text/event-stream` で、`data:` などの行を空行で区切ったイベントを送ります。",
      ref: "sse"
    },
    {
      id: "rt06", level: "std", q: "「ロングポーリング」の説明として正しいのは?", kind: "text",
      choices: [
        "サーバーがデータが出るまで返事を待たせ、返したらまた聞く",
        "クライアントが長い間隔をあけて、ときどき問い合わせる",
        "1本の接続を使って、クライアントとサーバーが双方向に送り合う",
        "ブラウザどうしが直接つながり、映像を送り合う"
      ],
      explain: "サーバーは新しいデータが出たときにはじめて返事をするので、ふつうのポーリングより遅れとむだな問い合わせが減ります。",
      ref: "polling"
    },
    {
      id: "rt07", level: "std", q: "WebRTC の説明として正しいのは?", kind: "text",
      choices: [
        "ブラウザどうしが直接つながり、映像や音声を送り合う",
        "サーバーから一方向に、更新を送り続けるしくみ",
        "サーバーに定期的に、新しいデータを問い合わせるしくみ",
        "ページをオフラインでも開けるようにするしくみ"
      ],
      explain: "WebRTC は P2P の通話やデータのやりとりのためのしくみです。2つ目は SSE、3つ目はポーリング、4つ目は Service Worker の説明です。",
      ref: "webrtc"
    },
    {
      id: "rt08", level: "std", q: "チャットのように、クライアントとサーバーが双方向に頻繁にやりとりする。最も適した方式は?", kind: "code",
      choices: ["WebSocket", "Server-Sent Events", "Service Worker", "Cache-Control"],
      explain: "WebSocket は1本の接続で双方向に送り合えます。SSE はサーバーから一方向だけなので、クライアントから送るには別のリクエストが要ります。",
      ref: "realtime-choice"
    },
    {
      id: "rt09", level: "pro", q: "Server-Sent Events の特徴として正しいのは?", kind: "text",
      choices: [
        "接続が切れると、ブラウザが自動で再接続する",
        "クライアントからも、同じ接続でサーバーへ送れる",
        "UDP の上で動き、HTTP の接続は使わない",
        "バイナリのデータだけを送るための形式"
      ],
      explain: "EventSource は切れると自動でつなぎ直し、最後の id を `Last-Event-ID` で送ります。データはテキストで、向きはサーバーからの一方向です。",
      ref: "sse"
    },
    {
      id: "rt10", level: "pro", q: "WebRTC の TURN サーバーの役割は?", kind: "text",
      choices: [
        "直接つながれないとき、通信を中継する",
        "NAT の外から見た、自分のアドレスを調べる",
        "相手の映像を録画して、あとで見られるように保存する",
        "接続の情報を交換する方法を、すべての端末に決める"
      ],
      explain: "NAT やファイアウォールで直接つながれないとき、TURN が通信を中継します。自分のアドレスを調べるのは STUN です。",
      ref: "webrtc"
    },
    {
      id: "rt11", level: "pro", q: "WebRTC で、つなぐ前に接続の情報を交換する方法(シグナリング)について正しいのは?", kind: "text",
      choices: [
        "方法は決まっておらず、WebSocket などで用意する",
        "WebRTC の中に決まった方法があり、ブラウザが自動で行う",
        "かならず電子メールで、相手に接続の情報を送る",
        "DNS の TXT レコードに書いて、相手に読ませる"
      ],
      explain: "WebRTC は、つないだあとの通信を決めていますが、相手と情報を交換する方法は決めていません。アプリが WebSocket などでサーバーを用意します。",
      ref: "webrtc"
    },
    {
      id: "rt12", level: "pro", q: "WebSocket のサーバーが、許可したページからの接続かを確かめるのに使うリクエストヘッダーは?", kind: "code",
      choices: ["Origin", "Referer", "User-Agent", "Accept"],
      explain: "WebSocket には同一オリジンポリシーや CORS が働かないので、別のサイトのページからも接続できてしまいます。ブラウザが付ける `Origin` を確かめて、知らないページからの接続を断ります。",
      ref: "websocket"
    },
    {
      id: "rt13", level: "pro", q: "`new WebSocket()` で開いた接続が切れた。正しいのは?", kind: "text",
      choices: [
        "自動では再接続しないので、間隔をあけて自分でつなぎ直す",
        "ブラウザが自動で、同じ接続をすぐに作り直してくれる",
        "切れているあいだのメッセージは、サーバーが必ず送り直す",
        "ページを再読み込みしないと、二度と接続できない"
      ],
      explain: "WebSocket API に再接続の機能はありません。close イベントで気づき、間隔を少しずつ広げながら(バックオフ)つなぎ直します。",
      ref: "ws-api"
    },
    {
      id: "rt14", level: "pro", q: "株価をサーバーから配信するだけで、ふつうの HTTP のまま、切れたら自動でつなぎ直したい。適した方式は?", kind: "code",
      choices: ["Server-Sent Events", "WebSocket", "WebRTC", "ポーリング(1時間ごと)"],
      explain: "一方向の配信なら SSE が簡単です。HTTP のままなので、プロキシなどもそのまま通り、再接続も自動です。",
      ref: "realtime-choice"
    },
    {
      id: "rt15", level: "pro", q: "WebSocket の接続が、しばらく何も送らないと途中で切られてしまう。よくある対策は?", kind: "text",
      choices: [
        "定期的に小さなメッセージを送って、接続を保つ",
        "メッセージを大きくまとめて、たまに送るようにする",
        "接続のたびに、ブラウザのキャッシュを消しておく",
        "WebSocket をやめて、画像の読み込みで代わりにする"
      ],
      explain: "途中のプロキシやロードバランサーは、通信のない接続を一定時間で切ることがあります。ping・pong やハートビートで、接続が生きていることを示します。",
      ref: "keepalive"
    }
  ]
});


// =====================================================================
// Webサーバーとインフラ(id: server)
// =====================================================================
WEBD.register("server", {
  cards: [
    {
      id: "web-app-server", name: "Webサーバーとアプリケーションサーバー", en: "Web server / Application server",
      desc: "Webサーバー(nginx・Apache など)は、HTTP のリクエストを受け、ファイルを返したり、裏のサーバーへ渡したりします。アプリケーションサーバーは、プログラム(Node.js・Python・Java など)を動かして、データベースを使いながら応答を作ります。",
      notes: ["1つのソフトが両方の役目をすることもあります。"]
    },
    {
      id: "static-dynamic", name: "静的と動的", en: "Static / Dynamic content",
      desc: "静的なコンテンツは、画像・CSS・作っておいた HTML のように、だれにでも同じファイルを返すものです。動的なコンテンツは、リクエストのたびにプログラムが作るもの(ログイン後のページ・検索結果など)です。",
      notes: ["静的なファイルは CDN で配りやすく、速く安く届けられます。"]
    },
    {
      id: "proxy", name: "リバースプロキシとフォワードプロキシ", en: "Reverse proxy / Forward proxy",
      desc: "リバースプロキシは、サーバーの手前でリクエストを受け、裏のサーバーへ振り分けます。TLS の処理・キャッシュ・圧縮などもまとめて受け持ちます。フォワードプロキシは、利用者の手前に置き、外のサイトへの通信を代わりに出します(会社の中から外へ出るときなど)。",
      code: [{ cap: "nginx の設定(一部)", lang: "text", text: "location /api/ {\n  proxy_pass http://app:3000;\n}" }]
    },
    {
      id: "load-balancer", name: "ロードバランサー", en: "Load balancer",
      desc: "リクエストを複数のサーバーに振り分けて、負荷を分けます。止まったサーバーには送らないよう、定期的にヘルスチェックをします。",
      options: [
        ["L4", "IPアドレスとポート番号(TCP・UDP)で振り分ける"],
        ["L7", "URL のパスやヘッダーなど、HTTP の中身を見て振り分ける"],
        ["ヘルスチェック", "各サーバーが正常に応答するか、定期的に確かめる"],
        ["スティッキーセッション", "同じ利用者を、いつも同じサーバーへ送る"]
      ],
      notes: ["スティッキーセッションに頼ると、そのサーバーが止まったときに状態が失われます。状態は共有の保存先に置くほうが安全です。"]
    },
    {
      id: "xff", name: "X-Forwarded-For", mono: true, en: "X-Forwarded-For header",
      desc: "プロキシやロードバランサーを通ると、サーバーから見た送り主はプロキシになります。もとの利用者の IP アドレスを伝えるため、プロキシが付けるヘッダーです。通ったプロキシの順に、カンマで並びます。",
      code: [{ lang: "http", text: "X-Forwarded-For: 203.0.113.7,\n  198.51.100.2" }],
      notes: [
        "利用者が自分で書いて送ることもできるので、自分の管理するプロキシが付けた部分だけを信用します。",
        "標準化された同じ目的のヘッダーに `Forwarded`(RFC 7239)もあります。"
      ]
    },
    {
      id: "scaling", name: "スケールアップとスケールアウト", en: "Vertical / Horizontal scaling",
      desc: "スケールアップは、1台のサーバーの CPU やメモリを増やすこと、スケールアウトは、サーバーの台数を増やして処理を分け合うことです。",
      notes: ["スケールアウトしやすくするには、セッションなどの状態を各サーバーのメモリに持たず、共有の保存先(データベースやキャッシュのサーバー)に置きます。"]
    },
    {
      id: "vm-container", name: "仮想マシンとコンテナ", en: "Virtual machine / Container",
      desc: "仮想マシンは、1台の物理マシンの上で、OS ごと別のマシンのように動かします。コンテナは、ホストの OS のカーネルを共有し、アプリと必要なライブラリだけをまとめて動かすので、軽くすばやく起動します。",
      code: [{ lang: "shell", text: "$ docker run -p 8080:80 nginx" }],
      notes: ["コンテナの元になるファイルをイメージといいます。同じイメージから、どこでも同じ環境を作れます。"]
    },
    {
      id: "serverless", name: "サーバーレス", en: "Serverless / FaaS",
      desc: "リクエストなどのイベントのたびに関数を動かし、サーバーの管理や台数の調整を事業者に任せる方式です。使った分だけ料金がかかります。",
      notes: [
        "サーバーがないわけではなく、自分で管理しなくてよいという意味です。",
        "しばらく使われていないと、最初の1回の起動に時間がかかることがあります(コールドスタート)。"
      ]
    },
    {
      id: "logs-env", name: "アクセスログと環境変数", en: "Access log / Environment variables",
      desc: "アクセスログには、リクエストごとに時刻・送り主のIP・メソッドとパス・ステータスコード・大きさなどが1行ずつ記録されます。データベースのパスワードなどの設定は、コードに書かず環境変数などで渡します。",
      code: [
        { cap: "アクセスログ(1行)", lang: "text", text: "203.0.113.7 [01/Nov/2026:10:00:00]\n\"GET /a HTTP/1.1\" 200 512" },
        { cap: "環境変数を読む(Node.js)", lang: "js", text: "const url = process.env.DB_URL;" }
      ],
      notes: ["秘密の値をリポジトリに入れると、履歴から消すのが大変です。ログにも出さないようにします。"]
    },
    {
      id: "deploy", name: "デプロイの方式", en: "Deployment strategies",
      desc: "新しい版を本番に出すときの方式です。止める時間をなくし、問題が出たらすぐ戻せるようにします。",
      options: [
        ["ブルーグリーン", "新旧2つの環境を用意し、準備ができたら通信をまとめて切りかえる"],
        ["カナリア", "一部の利用者にだけ新しい版を出し、様子を見て広げる"],
        ["ローリング", "サーバーを1台ずつ順番に新しい版へ入れかえる"]
      ]
    }
  ],
  questions: [
    {
      id: "sv01", level: "basic", q: "「静的なコンテンツ」の例として正しいのは?", kind: "text",
      choices: [
        "だれにでも同じものを返す、画像や CSS のファイル",
        "ログインした人ごとに中身をそのつど作って返す、マイページ",
        "入力した言葉で、そのたびに作る検索の結果ページ",
        "いまの時刻と天気を、毎回計算して返すページ"
      ],
      explain: "静的なコンテンツは、作っておいたファイルをそのまま返します。人や時刻によって中身が変わるものは、動的なコンテンツです。",
      ref: "static-dynamic"
    },
    {
      id: "sv02", level: "basic", q: "「スケールアウト」の説明として正しいのは?", kind: "text",
      choices: [
        "サーバーの台数を増やして、処理を分け合う",
        "1台のサーバーの CPU やメモリを増やす",
        "サーバーの台数を減らして、費用を下げる",
        "サーバーを別の国へ移して、速くする"
      ],
      explain: "台数を増やすのがスケールアウト、1台を強くするのがスケールアップです。",
      ref: "scaling"
    },
    {
      id: "sv03", level: "basic", q: "Webサーバーのアクセスログに、ふつう記録されるものは?", kind: "text",
      choices: [
        "時刻・IP・パス・ステータスコードなど",
        "利用者が入力したパスワードの平文",
        "ブラウザに表示された画面の画像",
        "利用者の PC にあるファイルの一覧"
      ],
      explain: "アクセスログは、リクエストごとの記録です。どこへのアクセスがエラーになったかなどを調べるのに使います。",
      ref: "logs-env"
    },
    {
      id: "sv04", level: "std", q: "リバースプロキシの説明として正しいのは?", kind: "text",
      choices: [
        "サーバーの手前でリクエストを受け、裏のサーバーへ振り分ける",
        "利用者のネットワークの手前に置き、外のサイトへの通信を代わりに出す",
        "ドメイン名から IP アドレスを調べて、端末に教える",
        "ブラウザの中で動き、ページのキャッシュを管理する"
      ],
      explain: "リバースプロキシはサーバー側の入口で、TLS やキャッシュも受け持ちます。利用者側に置くのはフォワードプロキシです。",
      ref: "proxy"
    },
    {
      id: "sv05", level: "std", q: "ロードバランサーの「ヘルスチェック」とは?", kind: "text",
      choices: [
        "各サーバーが正常に応答するかを、定期的に確かめる",
        "サーバーの証明書が、期限切れでないかを確かめる",
        "アクセスログを集めて、攻撃のあとを探す",
        "データベースのバックアップを、毎日自動で取る"
      ],
      explain: "応答しないサーバーを振り分け先から外し、直ったら戻します。",
      ref: "load-balancer"
    },
    {
      id: "sv06", level: "std", q: "「スティッキーセッション」の説明として正しいのは?", kind: "text",
      choices: [
        "同じ利用者のリクエストを、いつも同じサーバーへ送る",
        "セッションIDを、Cookie ではなく URL に付けて送る",
        "すべてのサーバーの負荷を、ちょうど同じにそろえる",
        "セッションが切れないよう、有効期限をなくしておく"
      ],
      explain: "セッションの状態を各サーバーのメモリに持つとき、同じサーバーへ送り続けるしくみです。サーバーが止まると状態が失われます。",
      ref: "load-balancer"
    },
    {
      id: "sv07", level: "std", q: "コンテナと仮想マシンの違いとして正しいのは?", kind: "text",
      choices: [
        "コンテナはホストの OS のカーネルを共有するので軽い",
        "コンテナは中に OS を丸ごと入れるので、仮想マシンより重い",
        "仮想マシンはカーネルを共有するので、コンテナより軽い",
        "コンテナは物理サーバーの上でしか動かせない"
      ],
      explain: "仮想マシンはそれぞれが OS を持ちますが、コンテナはホストのカーネルを共有するので、起動が速く、たくさん並べられます。",
      ref: "vm-container"
    },
    {
      id: "sv08", level: "std", q: "「サーバーレス」の説明として正しいのは?", kind: "text",
      choices: [
        "イベントのたびに関数が動き、サーバーの管理は事業者に任せる",
        "サーバーを1台も使わずに、利用者のブラウザだけで処理をすませる",
        "自分でサーバーを買って、社内に置いて動かし続ける",
        "1台の大きなサーバーで、すべての処理をまとめて行う"
      ],
      explain: "サーバーは事業者の側にあり、利用者は関数を置くだけです。台数の調整も自動で行われ、使った分だけ料金がかかります。",
      ref: "serverless"
    },
    {
      id: "sv09", level: "std", q: "データベースのパスワードの置き場所として適切なのは?", kind: "text",
      choices: [
        "環境変数や秘密の管理サービスに置き、コードには書かない",
        "ソースコードに直接書き、リポジトリでみんなと共有する",
        "HTML のコメントに書いて、忘れないようにしておく",
        "起動のたびにログに出して、いつでも確かめられるようにする"
      ],
      explain: "コードやログに秘密を書くと、リポジトリやログを見られる人すべてに漏れます。環境ごとに違う設定も、環境変数で渡せば切りかえやすくなります。",
      ref: "logs-env"
    },
    {
      id: "sv10", level: "std", q: "`X-Forwarded-For` ヘッダーが伝えるのは?", kind: "text",
      choices: [
        "プロキシを通る前の、利用者の IP アドレス",
        "ブラウザに次に開かせる、リダイレクト先の URL",
        "キャッシュに保存されてから経った秒数",
        "利用者が好む言語を、好きな順に並べた一覧"
      ],
      explain: "プロキシを通ると、サーバーから見た送り主はプロキシになるので、もとの IP アドレスをこのヘッダーで伝えます。2つ目は Location、3つ目は Age、4つ目は Accept-Language です。",
      ref: "xff"
    },
    {
      id: "sv11", level: "pro", q: "L7 のロードバランサーにはできて、L4 にはできないことは?", kind: "text",
      choices: [
        "URL のパスを見て、/api だけ別のサーバーへ送る",
        "IP アドレスとポート番号で、振り分け先を決める",
        "止まったサーバーを外し、ほかのサーバーへ送る",
        "TCP の接続を、複数のサーバーに分けて流す"
      ],
      explain: "L7 は HTTP の中身(パス・ヘッダーなど)を見て振り分けられます。L4 は TCP・UDP の情報だけを見ます。ヘルスチェックはどちらにもあります。",
      ref: "load-balancer"
    },
    {
      id: "sv12", level: "pro", q: "`X-Forwarded-For` の値を使うときの注意として正しいのは?", kind: "text",
      choices: [
        "利用者も書いて送れるので、自分のプロキシが付けた部分だけを信じる",
        "暗号化されているので、復号してから使わなければならない",
        "HTTP/2 では送れないので、HTTP/1.1 のときだけ使える",
        "値はいつも1つと決まっているので、そのまま信じてよい"
      ],
      explain: "利用者が偽の値を入れて送れば、そのあとにプロキシが追記するだけです。アクセス制限などに使うときは、自分の管理するプロキシが付けた位置の値を使います。",
      ref: "xff"
    },
    {
      id: "sv13", level: "pro", q: "「ブルーグリーンデプロイ」の説明として正しいのは?", kind: "text",
      choices: [
        "新旧2つの環境を用意し、準備ができたら通信をまとめて切りかえる",
        "まず一部の利用者にだけ新しい版を出し、様子を見ながら少しずつ広げていく",
        "サーバーを1台ずつ順番に、新しい版へ入れかえていく",
        "夜中にサーバーをすべて止めて、まとめて入れかえる"
      ],
      explain: "切りかえが一瞬で、問題があれば古い環境へすぐ戻せます。2つ目はカナリア、3つ目はローリングです。",
      ref: "deploy"
    },
    {
      id: "sv14", level: "pro", q: "サーバーを何台にも増やしやすい(スケールアウトしやすい)アプリの作り方は?", kind: "text",
      choices: [
        "セッションなどの状態を各サーバーに持たず、共有の保存先に置く",
        "利用者ごとの状態を、それぞれのサーバーのメモリの中に持たせる",
        "すべての処理を、1台のサーバーで順番に行うようにする",
        "サーバーごとに、内容の違う別のデータベースを持たせる"
      ],
      explain: "どのサーバーが受けても同じように処理できれば、台数を増やすだけで負荷を分けられます。状態はデータベースやキャッシュのサーバーで共有します。",
      ref: "scaling"
    },
    {
      id: "sv15", level: "std", q: "nginx などの Webサーバーと、アプリケーションサーバーの役割分担として正しいのは?", kind: "text",
      choices: [
        "Webサーバーが静的ファイルと中継を受け持ち、プログラムはアプリ側で動かす",
        "Webサーバーがデータベースになり、アプリ側が画像のファイルを配る",
        "アプリケーションサーバーがDNSを受け持ち、Webサーバーがメールを送る",
        "どちらも同じ役目なので、かならず両方に同じプログラムを入れる"
      ],
      explain: "よくある構成では、Webサーバー(リバースプロキシ)が入口になり、静的ファイルを返し、残りをアプリケーションサーバーへ渡します。",
      ref: "web-app-server"
    }
  ]
});


// =====================================================================
// フロントエンドの構成(id: frontend)
// =====================================================================
WEBD.register("frontend", {
  cards: [
    {
      id: "mpa-spa", name: "MPA と SPA", en: "Multi-page / Single-page application",
      desc: "MPA は、画面を移るたびにサーバーから新しい HTML を受け取る作り方です。SPA は、最初に1つのページを読み込み、そのあとは JavaScript がデータだけを取ってきて画面を書きかえる作り方です。",
      options: [
        ["MPA", "作りが単純。ページごとに読み込み直す"],
        ["SPA", "画面の切りかえがなめらか。最初の JavaScript が大きくなりやすい"]
      ]
    },
    {
      id: "rendering-modes", name: "CSR・SSR・SSG・ISR", en: "Rendering strategies",
      desc: "HTML を、いつ・どこで作るかの違いです。",
      options: [
        ["CSR", "ほぼ空の HTML を返し、ブラウザの JavaScript が画面を作る"],
        ["SSR", "リクエストのたびに、サーバーで HTML を作って返す"],
        ["SSG", "ビルドのときに、すべてのページの HTML を作っておく"],
        ["ISR", "作っておいた静的なページを、公開後も一定の時間ごとなどに作り直す"]
      ],
      notes: ["内容がめったに変わらないページは SSG、人ごとに違うページは SSR や CSR が向きます。1つのサイトの中で混ぜて使うこともよくあります。"]
    },
    {
      id: "hydration", name: "ハイドレーション", en: "Hydration",
      desc: "SSR や SSG で作った HTML に、ブラウザで JavaScript を結びつけて、ボタンなどが動くようにすることです。終わるまでは、見えていても押せないことがあります。",
      notes: ["サーバーで作った HTML と、ブラウザで作る画面が食いちがうと、警告が出たり作り直しが起きたりします。"]
    },
    {
      id: "history-api", name: "History API", en: "History API",
      desc: "ページを読み込み直さずに、アドレスバーの URL と履歴を変えるための API です。SPA の画面の切りかえ(クライアント側のルーティング)に使います。",
      code: [{ lang: "js", text: "history.pushState(\n  { id: 3 }, \"\", \"/items/3\");\nwindow.onpopstate = (e) => {\n  render(e.state);\n};" }],
      options: [
        ["pushState", "履歴に1つ足して、URL を変える(popstate は起きない)"],
        ["replaceState", "いまの履歴の URL を置きかえる"],
        ["popstate", "戻る・進むで履歴を移動したときに起きる"]
      ],
      notes: ["`/items/3` を直接開いたり再読み込みしたりすると、サーバーにそのパスのリクエストが届きます。どのパスでもアプリの HTML を返すよう、サーバーを設定します。"]
    },
    {
      id: "es-modules", name: "ES Modules", en: "ECMAScript modules",
      desc: "JavaScript を、ファイルごとの部品(モジュール)に分ける標準のしくみです。`export` で外に出し、`import` で読み込みます。ブラウザでは `<script type=\"module\">` で使います。",
      code: [
        { cap: "math.js", lang: "js", text: "export function add(a, b) {\n  return a + b;\n}" },
        { cap: "main.js", lang: "js", text: "import { add } from \"./math.js\";\nadd(1, 2);" }
      ],
      notes: [
        "モジュールの中は、自動で strict モードになります。トップレベルの変数は、ほかのスクリプトと共有されません。",
        "ブラウザでファイル(file://)を直接開くと、モジュールは読み込めません。ローカルのサーバーを使います。"
      ]
    },
    {
      id: "bundler", name: "バンドラーとトランスパイル", en: "Bundler / Transpiler",
      desc: "バンドラーは、たくさんのモジュールをまとめて、本番向けに小さくする(圧縮・使わないコードの削除)道具です。トランスパイルは、TypeScript や JSX などを、ブラウザで動く JavaScript に変換することです。",
      notes: ["変換・圧縮したコードと元のコードを対応づけるソースマップを作ると、ブラウザの開発ツールで元のコードのまま調べられます。"]
    },
    {
      id: "npm", name: "npm と依存関係", en: "npm packages / Dependencies",
      desc: "npm は JavaScript のパッケージを入れる道具で、使うパッケージ(依存関係)を `package.json` に書きます。実際に入った正確な版は、ロックファイル(`package-lock.json`)に記録されます。",
      code: [{ cap: "package.json(一部)", lang: "json", text: "{\n  \"dependencies\": {\n    \"date-fns\": \"^3.6.0\"\n  },\n  \"devDependencies\": {\n    \"vite\": \"^5.4.0\"\n  }\n}" }],
      options: [
        ["dependencies", "本番で動くときに要るもの"],
        ["devDependencies", "ビルドやテストのときだけ要るもの"],
        ["^3.6.0", "3.6.0 以上、4.0.0 未満を許す"],
        ["~3.6.0", "3.6.0 以上、3.7.0 未満を許す"]
      ],
      notes: ["依存するパッケージが乗っ取られると、自分のアプリにも悪いコードが入ります(サプライチェーン攻撃)。入れるものは必要なものに絞ります。"]
    },
    {
      id: "components", name: "コンポーネント指向", en: "Component-based UI",
      desc: "画面を、見た目と動きをまとめた部品(コンポーネント)に分け、組み合わせて作る考え方です。同じ部品を何度も使え、部品ごとに直したり試したりできます。",
      notes: ["親から子へはデータ(props など)を渡し、子から親へはイベントで知らせる形がよく使われます。"]
    },
    {
      id: "state-management", name: "状態管理", en: "State management",
      desc: "画面に出すデータ(状態)をどこに持ち、どう変えるかの決め方です。画面は状態から作り、状態を変えると画面がそれに合わせて描き直される、という考え方(宣言的 UI)が広く使われています。",
      notes: ["同じデータを何か所にもコピーして持つと、食いちがいが起きます。もとになる場所を1つに決めます。"]
    }
  ],
  questions: [
    {
      id: "fe01", level: "basic", q: "SPA(シングルページアプリケーション)の説明として正しいのは?", kind: "text",
      choices: [
        "最初に1つのページを読み込み、あとは JavaScript で画面を書きかえる",
        "画面を移るたびに、サーバーから新しい HTML を丸ごと受け取る",
        "JavaScript をまったく使わずに、HTML と CSS だけで作るサイト",
        "ページを1枚だけにして、すべての内容を縦に並べたサイト"
      ],
      explain: "SPA は最初の読み込みのあと、データだけを取ってきて画面を作りかえます。2つ目は MPA の説明です。",
      ref: "mpa-spa"
    },
    {
      id: "fe02", level: "basic", q: "math.js の関数を読み込む。空欄に入るのは?", kind: "code",
      code: [
        { cap: "math.js", lang: "js", text: "export function add(a, b) {\n  return a + b;\n}" },
        { cap: "main.js", lang: "js", text: "import { ____ } from \"./math.js\";" }
      ],
      choices: ["add", "math", "export", "function"],
      explain: "名前つきで export したものは、`import { 名前 }` で読み込みます。",
      ref: "es-modules"
    },
    {
      id: "fe03", level: "std", q: "SSR(サーバーサイドレンダリング)の説明として正しいのは?", kind: "text",
      choices: [
        "リクエストのたびに、サーバーで HTML を作って返す",
        "ビルドのときに、すべてのページの HTML を作っておく",
        "ほぼ空の HTML を返し、ブラウザの JavaScript で画面を作る",
        "画像を、サーバーで小さく作り直してから返す"
      ],
      explain: "SSR はリクエストごとに HTML を作ります。2つ目は SSG、3つ目は CSR です。",
      ref: "rendering-modes"
    },
    {
      id: "fe04", level: "std", q: "SSG(静的サイト生成)が最も向いているのは?", kind: "text",
      choices: [
        "内容があまり変わらない、ブログや説明書のサイト",
        "利用者ごとに中身が違う、ログイン後のマイページ",
        "1秒ごとに値が変わる、株価を表示する画面",
        "入力のたびに結果が変わる、サイト内の検索結果"
      ],
      explain: "SSG はビルドのときに HTML を作るので、どの人にも同じで、めったに変わらない内容に向きます。作ったファイルは CDN で速く配れます。",
      ref: "rendering-modes"
    },
    {
      id: "fe05", level: "std", q: "このコードの働きは?", kind: "text",
      code: [{ lang: "js", text: "history.pushState(\n  {}, \"\", \"/items/3\");" }],
      choices: [
        "ページを読み込み直さずに、URL と履歴を変える",
        "/items/3 のページを、サーバーから読み込み直す",
        "1つ前の履歴に戻り、popstate イベントを起こす",
        "/items/3 へのリンクを、ページの中に追加する"
      ],
      explain: "pushState は URL を変えて履歴に足すだけで、リクエストは送りません。画面の書きかえは自分のコードで行います。",
      ref: "history-api"
    },
    {
      id: "fe06", level: "std", q: "package.json の `\"^1.4.2\"` が許す版の範囲は?", kind: "text",
      choices: [
        "1.4.2 以上、2.0.0 未満",
        "1.4.2 だけ(ほかの版は許さない)",
        "1.4.2 以上なら、2.x や 3.x も許す",
        "1.4.2 以上、1.5.0 未満"
      ],
      explain: "`^` は、いちばん左の0でない数(ここでは 1)を変えない範囲を許します。1.5.0 未満に限るのは `~1.4.2` です。",
      ref: "npm"
    },
    {
      id: "fe07", level: "std", q: "「コンポーネント指向」の説明として正しいのは?", kind: "text",
      choices: [
        "見た目と動きをまとめた部品に分け、組み合わせて画面を作る",
        "1つの大きなファイルに、すべての画面のコードをまとめて書く",
        "CSS だけを使って、すべての画面の動きを作る",
        "画面ごとに、別々のサーバーを用意して配る"
      ],
      explain: "部品に分けると、同じものを使い回したり、部品ごとに直したり試したりできます。",
      ref: "components"
    },
    {
      id: "fe08", level: "pro", q: "ロックファイル(package-lock.json など)の役割は?", kind: "text",
      choices: [
        "入った依存の正確な版を記録し、だれが入れても同じにする",
        "パッケージを勝手に更新されないよう、パスワードをかける",
        "使われていないパッケージを、見つけて自動で削除する",
        "パッケージのソースコードを、暗号化して盗まれないようにする"
      ],
      explain: "package.json の `^` などは範囲を表すので、入れる時期で版が変わりえます。ロックファイルをリポジトリに入れておけば、全員と本番で同じ版になります。",
      ref: "npm"
    },
    {
      id: "fe09", level: "pro", q: "「ハイドレーション」の説明として正しいのは?", kind: "text",
      choices: [
        "サーバーで作った HTML に、ブラウザで処理を結びつけて動かす",
        "HTML の中の画像を、画面に近づいてからあとで読み込んで差しこむ",
        "古いブラウザでも動くように、新しい JavaScript を書きかえる",
        "ページのデータを、次に開くときのために localStorage に保存する"
      ],
      explain: "SSR や SSG の HTML は表示は速いですが、そのままではボタンなどが動きません。ハイドレーションでイベント処理などを結びつけます。",
      ref: "hydration"
    },
    {
      id: "fe10", level: "pro", q: "SPA で `/items/3` を直接開くと、サーバーが 404 を返した。よくある対策は?", kind: "text",
      choices: [
        "どのパスでもアプリの HTML を返すよう、サーバーを設定する",
        "History API をやめて、すべてのリンクを外部サイトにする",
        "ブラウザのキャッシュを消してから開くよう、利用者に頼む",
        "404 のページに、トップページへのリンクを置くだけにする"
      ],
      explain: "/items/3 という URL はブラウザの中だけで作ったもので、サーバーにはそのファイルがありません。どのパスにもアプリの HTML を返し、画面はブラウザで作らせます。",
      ref: "history-api"
    },
    {
      id: "fe11", level: "pro", q: "`popstate` イベントが起きるのは?", kind: "text",
      choices: [
        "戻る・進むで履歴を移動したとき",
        "pushState で URL を変えたとき",
        "ページを最初に読み込んだとき",
        "リンクの href を書きかえたとき"
      ],
      explain: "popstate は、利用者の戻る・進む(または history.back など)で起きます。pushState を呼んだだけでは起きません。",
      ref: "history-api"
    },
    {
      id: "fe12", level: "pro", q: "ISR の説明として正しいのは?", kind: "text",
      choices: [
        "静的に作ったページを、公開後も一定の時間ごとなどに作り直す",
        "リクエストのたびに、サーバーでかならず HTML を作り直す",
        "サーバーでは何も作らず、ブラウザの中で画面をすべて作る",
        "ビルドのときに一度だけ作り、それからは二度と作り直さない"
      ],
      explain: "ISR(Incremental Static Regeneration)は、SSG の速さを保ちつつ、全体をビルドし直さずにページを新しくします。",
      ref: "rendering-modes"
    },
    {
      id: "fe13", level: "std", q: "「トランスパイル」の説明として正しいのは?", kind: "text",
      choices: [
        "TypeScript などを、ブラウザで動く JS に変換する",
        "たくさんのファイルを、1つの大きなファイルにまとめて小さくする",
        "画像を、WebP などの小さい形式に変換してから保存する",
        "コードの不具合を見つけて、自動で正しく書き直してくれる"
      ],
      explain: "TypeScript の型を取り除いたり、JSX をふつうの関数の呼び出しに直したりします。ファイルをまとめるのはバンドラーの役目です。",
      ref: "bundler"
    },
    {
      id: "fe14", level: "std", q: "package.json の `devDependencies` に入れるものは?", kind: "text",
      choices: [
        "ビルドやテストにだけ使い、本番の実行には要らないもの",
        "本番で動くときに、かならず読み込まれて必要なもの",
        "開発者のパソコンにだけ入れる、OS そのものの設定",
        "ほかのパッケージが、自分の判断で勝手に入れたもの"
      ],
      explain: "バンドラーやテストの道具などは devDependencies、本番で動くライブラリは dependencies に入れます。",
      ref: "npm"
    },
    {
      id: "fe15", level: "pro", q: "宣言的 UI の考え方として正しいのは?", kind: "text",
      choices: [
        "画面は状態から作り、状態を変えると画面がそれに合わせて描き直される",
        "状態を変えるたびに、自分で DOM の要素を1つずつ探して書きかえる",
        "状態は画面の中の文字に持たせ、必要なときに読み取って使う",
        "画面を変えないよう、状態は一度決めたら変えてはいけない"
      ],
      explain: "「この状態ならこう見える」を書いておき、状態だけを変えれば、画面の更新はしくみに任せられます。同じデータを何か所にも持たないことも大切です。",
      ref: "state-management"
    }
  ]
});


// =====================================================================
// ブラウザのAPIとPWA(id: browser-api)
// =====================================================================
WEBD.register("browser-api", {
  cards: [
    {
      id: "service-worker", name: "Service Worker", en: "Service Worker API",
      desc: "ページとネットワークのあいだに入って動くスクリプトです。ページを閉じても登録は残り、リクエストを横取りして、キャッシュから返すなどができます。DOM には触れません。",
      code: [{ lang: "js", text: "if (\"serviceWorker\" in navigator) {\n  navigator.serviceWorker\n    .register(\"/sw.js\");\n}" }],
      options: [
        ["スコープ", "制御するページの範囲。既定は sw.js の置き場所より下"],
        ["HTTPS 必須", "開発用の localhost は例外"],
        ["install → activate", "新しい版は、古い版のページがなくなるまで待機する"]
      ]
    },
    {
      id: "sw-cache", name: "Cache Storage とオフライン", en: "Cache API / Offline strategies",
      desc: "Service Worker は、`fetch` イベントでリクエストを受け、Cache Storage に保存した応答を返せます。これでオフラインでもページを開けます。",
      code: [{ cap: "sw.js(キャッシュ優先)", lang: "js", text: "self.onfetch = (e) => {\n  const q = e.request;\n  e.respondWith(caches.match(q)\n    .then(r => r || fetch(q)));\n};" }],
      options: [
        ["キャッシュ優先", "あればキャッシュ、なければネットワーク"],
        ["ネットワーク優先", "まずネットワーク、失敗したらキャッシュ"],
        ["stale-while-revalidate", "すぐキャッシュを返し、裏で取り直して更新する"]
      ]
    },
    {
      id: "manifest", name: "Web App Manifest", en: "Web App Manifest",
      desc: "アプリとしてインストールされたときの名前・アイコン・開くURL・表示のしかたなどを書く JSON のファイルです。HTML から `<link rel=\"manifest\">` で読み込みます。",
      code: [{ cap: "manifest.json", lang: "json", text: "{\n  \"name\": \"Web道場\",\n  \"short_name\": \"道場\",\n  \"start_url\": \"/\",\n  \"display\": \"standalone\",\n  \"icons\": [{\n    \"src\": \"/icon-512.png\",\n    \"sizes\": \"512x512\",\n    \"type\": \"image/png\"\n  }]\n}" }],
      options: [
        ["standalone", "アドレスバーなどを出さず、アプリの窓のように開く"],
        ["browser", "ふつうのブラウザのタブで開く"],
        ["fullscreen", "画面全体を使う"]
      ]
    },
    {
      id: "pwa", name: "PWA", en: "Progressive Web App",
      desc: "Web の技術で作り、インストールしてアプリのように使えるようにしたものです。マニフェストでホーム画面のアイコンと開き方を決め、Service Worker でオフラインや速い表示を実現します。",
      notes: ["インストールできる条件や見え方は、ブラウザや OS によって違います。HTTPS で配信することは共通の前提です。"]
    },
    {
      id: "web-worker", name: "Web Worker", en: "Web Workers API",
      desc: "重い計算を、画面とは別のスレッドで動かすしくみです。メインスレッドが止まらないので、操作への反応が悪くなりません。Worker の中からは DOM に触れず、`postMessage` でデータをやりとりします。",
      code: [
        { cap: "main.js", lang: "js", text: "const w = new Worker(\"calc.js\");\nw.postMessage(42);\nw.onmessage = (e) => log(e.data);" },
        { cap: "calc.js", lang: "js", text: "onmessage = (e) => {\n  postMessage(e.data * 2);\n};" }
      ],
      notes: ["渡したデータは複製されて届きます(構造化複製)。関数や DOM の要素は渡せません。"]
    },
    {
      id: "intersection-observer", name: "Intersection Observer", mono: true, en: "Intersection Observer API",
      desc: "要素が画面(または指定した親要素)に入ったか・出たかを知らせてくれる API です。画像の遅延読み込みや、下までスクロールしたら続きを読み込む処理に使います。",
      code: [{ lang: "js", text: "const io = new IntersectionObserver(\n  (list) => list.forEach((en) => {\n    if (en.isIntersecting) load(en);\n  }));\nio.observe(item);" }],
      notes: ["scroll イベントで毎回位置を計算するより、ブラウザに任せるほうが軽く済みます。"]
    },
    {
      id: "permissions", name: "権限の許可", en: "Permission prompts",
      desc: "通知・位置情報・カメラなど、利用者の情報や端末に関わる機能は、使う前にブラウザが利用者に許可を求めます。拒否されたら、その機能なしでも使えるようにしておきます。",
      code: [{ lang: "js", text: "btn.onclick = async () => {\n  const p = await Notification\n    .requestPermission();\n  // \"granted\" / \"denied\" /\n  // \"default\"(閉じただけ)\n};" }],
      notes: ["ページを開いた直後にいきなり求めると、拒否されやすく、ブラウザが表示を控えめにすることもあります。理由がわかる操作のあとに求めます。"]
    },
    {
      id: "clipboard", name: "Clipboard API", en: "Async Clipboard API",
      desc: "`navigator.clipboard` で、クリップボードに文字を書いたり読んだりします。結果は Promise で返り、セキュアコンテキストでしか使えません。",
      code: [{ lang: "js", text: "await navigator.clipboard\n  .writeText(\"コピーする文字\");" }],
      notes: ["読み取り(`readText`)は利用者の情報に関わるので、許可が必要です。"]
    },
    {
      id: "secure-context", name: "セキュアコンテキスト", en: "Secure contexts",
      desc: "HTTPS で配信されたページなど、安全な通信で読み込まれた環境です。Service Worker・位置情報・Clipboard API・パスキー(WebAuthn)などの強い機能は、セキュアコンテキストでしか使えません。`window.isSecureContext` で確かめられます。",
      options: [
        ["https://", "セキュア"],
        ["http://localhost・http://127.0.0.1", "開発のために、セキュアとみなされる"],
        ["http://(それ以外)", "セキュアではない。LAN の中の IP アドレスでも同じ"]
      ]
    }
  ],
  questions: [
    {
      id: "ba01", level: "basic", q: "重い計算を画面とは別のスレッドで動かし、DOM には触れない。このしくみは?", kind: "code",
      choices: ["Web Worker", "Service Worker", "Intersection Observer", "EventSource"],
      explain: "Web Worker は計算のための別スレッドです。Service Worker もページとは別に動きますが、ネットワークとキャッシュの仲立ちが役目です。",
      ref: "web-worker"
    },
    {
      id: "ba02", level: "basic", q: "インストールしたときのアプリの名前やアイコンを書くファイルは?", kind: "code",
      choices: ["Web App Manifest", "robots.txt", "sitemap.xml", "package.json"],
      explain: "Web App Manifest(manifest.json など)に名前・アイコン・開き方を書き、`<link rel=\"manifest\">` で読み込みます。",
      ref: "manifest"
    },
    {
      id: "ba03", level: "std", q: "Service Worker を登録できるページは?", kind: "text",
      choices: [
        "HTTPS のページ(localhost は例外)",
        "HTTP のページだけ(HTTPS では動かない)",
        "ブラウザの拡張機能として入れたページの中だけ",
        "利用者がログインしたあとに開いたページだけ"
      ],
      explain: "Service Worker はリクエストを横取りできる強い機能なので、改ざんされない HTTPS が必要です。開発しやすいよう、localhost は例外です。",
      ref: "service-worker"
    },
    {
      id: "ba04", level: "std", q: "Web Worker の中でできないことは?", kind: "text",
      choices: [
        "document を使って DOM を書きかえる",
        "fetch でサーバーからデータを取ってくる",
        "postMessage で、結果をページに返す",
        "時間のかかるループの計算をする"
      ],
      explain: "Worker には document がなく、DOM に触れません。画面を変えたいときは、結果を postMessage でページに送り、ページ側で書きかえます。",
      ref: "web-worker"
    },
    {
      id: "ba05", level: "std", q: "Intersection Observer の主な用途は?", kind: "text",
      choices: [
        "要素が画面に入ったことを知り、画像などを読み込む",
        "要素の大きさが変わったことを知り、配置を計算し直す",
        "DOM に子要素が足されたことを知り、記録する",
        "利用者がページを閉じることを知り、保存する"
      ],
      explain: "画面に入ったかを知らせる API です。大きさの変化は ResizeObserver、DOM の変化は MutationObserver が受け持ちます。",
      ref: "intersection-observer"
    },
    {
      id: "ba06", level: "std", q: "Worker にデータを渡す。空欄に入るのは?", kind: "code",
      code: [{ lang: "js", text: "const w = new Worker(\"calc.js\");\nw.____(42);\nw.onmessage = (e) => log(e.data);" }],
      choices: ["postMessage", "send", "emit", "dispatchEvent"],
      explain: "ページと Worker は `postMessage` で送り、`message` イベントで受け取ります。データは複製されて届きます。",
      ref: "web-worker"
    },
    {
      id: "ba07", level: "std", q: "通知の許可を求めるタイミングとして適切なのは?", kind: "text",
      choices: [
        "「通知を受け取る」を押したなど、理由がわかる操作のあと",
        "ページを開いた直後、まだ何も操作していないうちに",
        "許可は求めずに、ページを開くなりいきなり通知を送る",
        "拒否されたあと、許可されるまで何度もくり返して"
      ],
      explain: "理由がわからないまま求められると、多くの人は拒否します。一度拒否されると、ページからはもう一度求められません。",
      ref: "permissions"
    },
    {
      id: "ba08", level: "pro", q: "`navigator.clipboard.writeText()` について正しいのは?", kind: "text",
      choices: [
        "Promise を返し、セキュアコンテキストでだけ使える",
        "コピーした文字を、サーバーへ自動で送り届ける",
        "HTTP のページでも、許可なしで自由に読み書きできる",
        "同期的に動き、すぐに true か false を返す"
      ],
      explain: "Clipboard API は非同期で、`await` して使います。HTTPS などのセキュアコンテキストでしか使えません。",
      ref: "clipboard"
    },
    {
      id: "ba09", level: "pro", q: "`/app/sw.js` を、scope を指定せずに登録した。この Service Worker が制御するのは?", kind: "text",
      choices: [
        "/app/ より下のページ",
        "サイトのすべてのページ",
        "sw.js というファイルだけ",
        "/app/ より上のページ"
      ],
      explain: "既定のスコープは、スクリプトが置かれた場所(/app/)より下です。サイト全体を制御したいときは、sw.js をルートに置くのが一般的です。",
      ref: "service-worker"
    },
    {
      id: "ba10", level: "pro", q: "この Service Worker の動きは?", kind: "text",
      code: [{ cap: "sw.js", lang: "js", text: "self.onfetch = (e) => {\n  const q = e.request;\n  e.respondWith(caches.match(q)\n    .then(r => r || fetch(q)));\n};" }],
      choices: [
        "キャッシュにあればそれを返し、なければネットワークから取る",
        "いつもネットワークから取り、失敗したらキャッシュを返す",
        "ネットワークから取ったものを、毎回すべてキャッシュに保存する",
        "キャッシュをすべて消してから、ネットワークから取り直す"
      ],
      explain: "`caches.match` で見つかればそれを返し(r)、なければ `fetch` します。キャッシュ優先の戦略です。このコードは、取ってきたものを保存はしません。",
      ref: "sw-cache"
    },
    {
      id: "ba11", level: "pro", q: "sw.js を書きかえて公開した。新しい版の動きとして正しいのは?", kind: "text",
      choices: [
        "既定では待機し、古い版のページがすべて閉じられてから有効になる",
        "書きかえた瞬間、いま開いているページもすぐ新しい版に切りかわる",
        "古い版が残り続け、ブラウザを入れ直すまで新しい版は使われない",
        "新しい版と古い版が、同じページの中で同時に動き続ける"
      ],
      explain: "新しい版はインストールされたあと、古い版が制御するページがなくなるまで待ちます。すぐに切りかえたいときは `skipWaiting()` などを使います。",
      ref: "service-worker"
    },
    {
      id: "ba12", level: "pro", q: "セキュアコンテキストにならないのは?", kind: "code",
      choices: ["http://192.168.0.5:8080", "https://example.com", "http://localhost:3000", "http://127.0.0.1:8080"],
      explain: "HTTPS と、開発用の localhost・127.0.0.1 はセキュアとみなされます。LAN の中でも、ほかの IP アドレスへの HTTP はセキュアではありません。",
      ref: "secure-context"
    },
    {
      id: "ba13", level: "pro", q: "マニフェストの `\"display\": \"standalone\"` の意味は?", kind: "text",
      choices: [
        "アドレスバーなどを出さず、アプリの窓のように開く",
        "ふつうのブラウザのタブで、ページとして開く",
        "画面全体を使い、時計などの表示まで隠す",
        "ホーム画面には置かず、通知だけを出す"
      ],
      explain: "standalone は、独立したアプリのような窓で開きます。ふつうのタブは browser、画面全体は fullscreen です。",
      ref: "manifest"
    },
    {
      id: "ba14", level: "pro", q: "Service Worker の「stale-while-revalidate」の説明は?", kind: "text",
      choices: [
        "すぐキャッシュを返し、裏でネットワークから取り直して更新する",
        "まずネットワークを試してみて、失敗したときだけキャッシュを返す",
        "キャッシュは使わず、いつもネットワークから取ってくる",
        "キャッシュの期限が切れるまで、ネットワークを一切使わない"
      ],
      explain: "表示は速く、次に開いたときには新しい内容になります。少し古い内容を見せてもよいものに向きます。",
      ref: "sw-cache"
    },
    {
      id: "ba15", level: "std", q: "PWA の説明として正しいのは?", kind: "text",
      choices: [
        "Web の技術で作り、アプリのように入れて使えるもの",
        "スマホの OS ごとに、専用の言語で書いたアプリのこと",
        "サーバーの中だけで動き、画面を持たないプログラム",
        "ブラウザの拡張機能として配る、小さな追加の道具"
      ],
      explain: "PWA は、マニフェストと Service Worker などを使って、Web のページをアプリのように使えるようにしたものです。",
      ref: "pwa"
    }
  ]
});

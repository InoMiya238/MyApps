// 復習プランナーの記録。中学5教科・英単語帳・化学基礎・世界地図・将棋・IT(Git・Linux・SQL・正規表現・Web・Python・アルゴリズム)・AI理論・電子工作・素数・韓国語の道場が、回答のたびに Review.record を呼ぶ。
// 道場を足すときは、APPS に名前を足し、復習プランナー(study/review/review-planner/index.html)の SUBJECTS にも足す。
// 読み込む順番: shared/store.js → shared/review.js
// 保存キーは "reviewPlannerLog"(各道場の成績キーとは別。道場の成績には触らない)。
// 習慣プランナー(study/review/habit-planner/)用に、回答のたびに "habitPlannerAnswerLog" にも日ごとの回答数を数える。
//   { days: { "YYYY-MM-DD": { "math": 12, ... } } }   直近120日だけ残す。読むときは Review.answersOn(日付)。
//   数えられなくても、record の動作と戻り値は変わらない。
//
// ■ 記録の形
//   { items: { "math:g1-numbers": {
//       stage: 0〜5,              定着度。INTERVALS[stage] 日ごとに復習する
//       due: "YYYY-MM-DD",        次の復習日
//       last: "YYYY-MM-DD" | null 最後に解いた日(取り込んだだけの単元は null)
//       dayDate, dayCorrect, dayTotal,   その日の集計
//       dayStartStage, dayStartDue,      その日最初の回答の時点の stage と due
//       imported: true            道場の成績から取り込んだだけで、まだ記録していない単元
//   } } }
//   日付はすべて端末のローカル時刻。
//
// ■ 判定(その日の集計から、回答のたびに決め直す。同じ日に何回解いても1日1回分)
//   新規の単元                    → stage 0、復習日は翌日
//   その日の回答が3問未満         → その日の最初の状態のまま
//   正答率 60% 未満               → stage 0、復習日は翌日
//   正答率 80% 以上で復習日が来ていた → stage +1(最大5)、復習日は 今日 + INTERVALS[新stage]
//   正答率 80% 以上で復習日の前   → その日の最初の状態のまま(先取り)
//   60〜80%                       → stage はそのまま、復習日は 今日 + INTERVALS[stage]
var Review = (function () {
  "use strict";

  var KEY = "reviewPlannerLog";
  var INTERVALS = [1, 3, 7, 14, 30, 60];
  var MAX_STAGE = INTERVALS.length - 1;
  var MIN_ANSWERS = 3;
  var ANSWER_KEY = "habitPlannerAnswerLog";
  var ANSWER_DAYS = 120;
  var APPS = ["math", "japanese", "english", "english-vocab", "science", "social", "worldmap", "chemistry", "shogi", "git", "linux", "sql", "regex", "web", "python", "ai", "electronics", "primes", "algorithm", "korean"];

  // ---------- 日付(YYYY-MM-DD、ローカル時刻) ----------
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function isYmd(s) {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var p = s.split("-").map(Number);
    var d = new Date(p[0], p[1] - 1, p[2]);
    return d.getFullYear() === p[0] && d.getMonth() === p[1] - 1 && d.getDate() === p[2];
  }
  function today(now) { return fmt(now instanceof Date ? now : new Date()); }
  // 日付に n 日足す(月末・年末・夏時間をまたいでも暦どおり)
  function addDays(ymd, n) {
    var p = ymd.split("-").map(Number);
    return fmt(new Date(p[0], p[1] - 1, p[2] + n));
  }
  // b − a の日数(a より b があとなら正)
  function daysBetween(a, b) {
    var p = a.split("-").map(Number), q = b.split("-").map(Number);
    return Math.round((Date.UTC(q[0], q[1] - 1, q[2]) - Date.UTC(p[0], p[1] - 1, p[2])) / 86400000);
  }

  // ---------- 読み書き(形がくずれていても、使える値だけを拾い直す) ----------
  function cleanNum(v) { return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function cleanStage(v) { return Math.min(cleanNum(v), MAX_STAGE); }
  function isKey(k) {
    var i = k.indexOf(":");
    return i > 0 && i < k.length - 1 && APPS.indexOf(k.slice(0, i)) >= 0;
  }
  function cleanItem(r, todayStr) {
    if (!r || typeof r !== "object") return null;
    var it = {
      stage: cleanStage(r.stage),
      due: isYmd(r.due) ? r.due : todayStr,
      last: isYmd(r.last) ? r.last : null,
      dayDate: isYmd(r.dayDate) ? r.dayDate : null,
      dayCorrect: 0,
      dayTotal: 0,
      dayStartStage: cleanStage(r.dayStartStage),
      dayStartDue: isYmd(r.dayStartDue) ? r.dayStartDue : null
    };
    if (it.dayDate) {
      it.dayTotal = cleanNum(r.dayTotal);
      it.dayCorrect = Math.min(cleanNum(r.dayCorrect), it.dayTotal);
    }
    if (r.imported === true) it.imported = true;
    return it;
  }
  function load() {
    var raw = Store.load(KEY, null);
    var log = { items: {} };
    if (!raw || typeof raw !== "object" || !raw.items || typeof raw.items !== "object") return log;
    var t = today();
    Object.keys(raw.items).forEach(function (k) {
      if (!isKey(k)) return;
      var it = cleanItem(raw.items[k], t);
      if (it) log.items[k] = it;
    });
    return log;
  }
  function save(log) { return Store.save(KEY, log); }
  function clear() { return Store.remove(KEY); }

  // ---------- 判定 ----------
  // その日の集計から stage と due を決める(item を書き換える)
  function decide(item, t) {
    var c = item.dayCorrect, n = item.dayTotal;
    var s = item.dayStartStage, d = item.dayStartDue || addDays(t, 1);
    if (n < MIN_ANSWERS) {
      item.stage = s; item.due = d;
    } else if (c * 5 < n * 3) {            // 60% 未満
      item.stage = 0; item.due = addDays(t, INTERVALS[0]);
    } else if (c * 5 >= n * 4) {           // 80% 以上
      if (t >= d) {
        item.stage = Math.min(s + 1, MAX_STAGE);
        item.due = addDays(t, INTERVALS[item.stage]);
      } else {
        item.stage = s; item.due = d;       // 先取り
      }
    } else {                               // 60〜80%
      item.stage = s; item.due = addDays(t, INTERVALS[s]);
    }
    return item;
  }

  // 回答を1つ記録する。now は試験用(省略すると今の時刻)。記録後の単元の状態を返す
  function record(app, unit, isCorrect, now) {
    try {
      if (APPS.indexOf(app) < 0 || typeof unit !== "string" || !unit) return null;
      var t = today(now);
      var log = load();
      var key = app + ":" + unit;
      var item = log.items[key];
      if (!item) {
        // 新規: stage 0、復習日は翌日。この状態をその日の最初の状態にする
        item = { stage: 0, due: addDays(t, INTERVALS[0]), last: null, dayDate: null,
          dayCorrect: 0, dayTotal: 0, dayStartStage: 0, dayStartDue: null };
        log.items[key] = item;
      }
      if (item.dayDate !== t) {
        item.dayDate = t;
        item.dayCorrect = 0;
        item.dayTotal = 0;
        item.dayStartStage = item.stage;
        item.dayStartDue = item.due;
      }
      item.dayTotal++;
      if (isCorrect) item.dayCorrect++;
      item.last = t;
      delete item.imported;
      decide(item, t);
      save(log);
      countAnswer(app, t);
      return item;
    } catch (e) {
      return null;
    }
  }

  // 道場の成績にある単元のうち、まだ記録にないものを登録する(stage 0、復習日は今日)。
  // 登録した数を返す
  function importStats(app, unitIds, now) {
    try {
      if (APPS.indexOf(app) < 0 || !Array.isArray(unitIds)) return 0;
      var t = today(now);
      var log = load(), added = 0;
      unitIds.forEach(function (unit) {
        if (typeof unit !== "string" || !unit) return;
        var key = app + ":" + unit;
        if (log.items[key]) return;
        log.items[key] = { stage: 0, due: t, last: null, dayDate: null, dayCorrect: 0, dayTotal: 0,
          dayStartStage: 0, dayStartDue: null, imported: true };
        added++;
      });
      if (added > 0) save(log);
      return added;
    } catch (e) {
      return 0;
    }
  }

  // ---------- 日ごとの回答数(習慣プランナー用) ----------
  // 形がくずれていても、直近 ANSWER_DAYS 日の使える値だけを拾い直す
  function loadAnswerLog(t) {
    var raw = Store.load(ANSWER_KEY, null);
    var out = { days: {} };
    if (!raw || typeof raw !== "object" || !raw.days || typeof raw.days !== "object") return out;
    Object.keys(raw.days).forEach(function (d) {
      if (!isYmd(d)) return;
      var age = daysBetween(d, t);
      if (age < 0 || age >= ANSWER_DAYS) return;
      var src = raw.days[d], day = {};
      if (!src || typeof src !== "object") return;
      Object.keys(src).forEach(function (app) {
        if (APPS.indexOf(app) >= 0 && cleanNum(src[app]) > 0) day[app] = cleanNum(src[app]);
      });
      out.days[d] = day;
    });
    return out;
  }
  function countAnswer(app, t) {
    try {
      var a = loadAnswerLog(t);
      var day = a.days[t] || (a.days[t] = {});
      day[app] = (day[app] || 0) + 1;
      Store.save(ANSWER_KEY, a);
    } catch (e) { /* 数えられなくても record は止めない */ }
  }
  // その日の道場ごとの回答数: { app: 数 }
  function answersOn(ymd) {
    try {
      var d = loadAnswerLog(today()).days[ymd];
      var out = {};
      if (d) Object.keys(d).forEach(function (k) { out[k] = d[k]; });
      return out;
    } catch (e) {
      return {};
    }
  }

  // 記録を一覧にする: [{ key, app, unit, stage, due, last, ... }, …]
  function list(log) {
    log = log || load();
    return Object.keys(log.items).map(function (k) {
      var i = k.indexOf(":"), it = log.items[k], o = { key: k, app: k.slice(0, i), unit: k.slice(i + 1) };
      Object.keys(it).forEach(function (f) { o[f] = it[f]; });
      return o;
    });
  }

  return {
    KEY: KEY, INTERVALS: INTERVALS, MAX_STAGE: MAX_STAGE, MIN_ANSWERS: MIN_ANSWERS, APPS: APPS,
    today: today, addDays: addDays, daysBetween: daysBetween, isYmd: isYmd,
    load: load, save: save, clear: clear, list: list,
    record: record, importStats: importStats, answersOn: answersOn
  };
})();

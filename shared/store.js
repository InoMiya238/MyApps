// 学習ページ共通の保存処理。
// localStorage が使えない・壊れているときも、ページが止まらないようにする。
// ファイルを直接開いた場合は全ページが同じ保存領域を使うので、
// キーにはアプリ名を入れて、ほかのページと重ならないようにする(例: "mentalMathTrainerSettings")。
var Store = (function () {
  "use strict";

  // 保存した値を読む。なければ(または読めなければ) fallback を返す
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === "") return fallback;
      var value = JSON.parse(raw);
      return value === null || value === undefined ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  // 値を保存する。保存できたら true
  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 保存した値を消す
  function remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  return { load: load, save: save, remove: remove };
})();

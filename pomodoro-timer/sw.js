// ポモドーロタイマーの通知用。スマホのChromeは、Service Worker経由でしか通知を出せない。
// 通知を出す窓口になるだけで、ページの保存(キャッシュ)や通信の書きかえはしない。
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

// 通知をタップしたら、開いているタイマーの画面に戻る
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list){
      for (var i = 0; i < list.length; i++) {
        // 同じサイトのほかのアプリの画面は対象にしない
        if (list[i].url.indexOf(self.registration.scope) === 0 && 'focus' in list[i]) return list[i].focus();
      }
    })
  );
});

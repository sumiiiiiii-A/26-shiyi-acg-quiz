// Diagnostic snippet injected into the game's own page.
// It runs in the SAME realm as the game, so it can wrap fetch and report every
// leaderboard request/response into a visible panel - no DevTools needed.
(function () {
  var BACKEND = 'https://shiyi-acg-quiz-d9g7yozc701ac0027-1507320843.ap-shanghai.app.tcloudbase.com';

  var box = document.createElement('div');
  box.id = '__rankdiag';
  box.style.cssText = [
    'position:fixed', 'left:0', 'right:0', 'bottom:0', 'max-height:52vh', 'overflow-y:auto',
    'z-index:2147483647', 'background:#0b0f1a', 'color:#e6edf5',
    'font:12px/1.5 ui-monospace,Consolas,monospace', 'padding:8px 10px',
    'border-top:2px solid #eacb62', 'white-space:pre-wrap', 'word-break:break-all'
  ].join(';');
  box.innerHTML = '<b style="color:#eacb62">排行榜诊断已开启</b> —— 进游戏打开排行榜，这里会记录每一次请求。\n'
    + '<span id="__rankdiaglog"></span>';
  function attach() { if (document.body) document.body.appendChild(box); else setTimeout(attach, 50); }
  attach();

  var log = function (s, color) {
    var el = document.getElementById('__rankdiaglog');
    if (!el) return;
    var line = document.createElement('div');
    if (color) line.style.color = color;
    line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + s;
    el.appendChild(line);
    box.scrollTop = box.scrollHeight;
  };

  var origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input);
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    var interesting = /tcloudbase|leaderboard|scores|\/api/i.test(url);

    if (!interesting) return origFetch(input, init);

    var t0 = Date.now();
    log('→ ' + method + ' ' + url, '#8fd0ff');
    if (init && init.body) log('   请求体: ' + String(init.body).slice(0, 300));

    return origFetch(input, init).then(function (res) {
      var ms = Date.now() - t0;
      var cors = res.headers.get('access-control-allow-origin') || '(无)';
      log('← ' + res.status + '  ' + ms + 'ms  CORS:' + cors,
        res.ok ? '#7fdc9b' : '#ff8b8b');
      var clone = res.clone();
      clone.text().then(function (t) {
        if (t) log('   响应: ' + t.slice(0, 600));
      }).catch(function () {});
      return res;
    }).catch(function (e) {
      var ms = Date.now() - t0;
      log('✗ 请求失败 ' + ms + 'ms  ' + (e && e.message ? e.message : String(e)), '#ff8b8b');
      throw e;
    });
  };

  window.addEventListener('error', function (e) {
    log('✗ JS 错误: ' + (e.message || '') + ' @' + (e.filename || '') + ':' + (e.lineno || ''), '#ff8b8b');
  });
  window.addEventListener('unhandledrejection', function (e) {
    log('✗ 未处理的 Promise 拒绝: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)), '#ff8b8b');
  });

  log('后端地址(window.QUIZ_RANK_API_BASE) = ' + (window.QUIZ_RANK_API_BASE || '(空)'), '#eacb62');
  log('fetch 已被拦截，等待游戏的请求…');
})();

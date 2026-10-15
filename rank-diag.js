// Diagnostic v2: in addition to logging network traffic, this actively probes
// the backend for SHAPE variations and reports exactly what each returns, so we
// can find which shape the game's parser accepts.
(function () {
  var BACKEND_PLACEHOLDER = 'window.QUIZ_RANK_API_BASE';
  var base = (window.QUIZ_RANK_API_BASE || '').replace(/\/+$/, '');

  var box = document.createElement('div');
  box.id = '__rankdiag';
  box.style.cssText = [
    'position:fixed', 'left:0', 'right:0', 'bottom:0', 'max-height:58vh', 'overflow-y:auto',
    'z-index:2147483647', 'background:#0b0f1a', 'color:#e6edf5',
    'font:12px/1.5 ui-monospace,Consolas,monospace', 'padding:8px 10px',
    'border-top:2px solid #eacb62', 'white-space:pre-wrap', 'word-break:break-all'
  ].join(';');
  box.innerHTML = '<b style="color:#eacb62">排行榜诊断 v2</b>  <span id="__rankdiaglog"></span>';
  function attach() { if (document.body) document.body.appendChild(box); else setTimeout(attach, 50); }
  attach();

  function log(s, color) {
    var el = document.getElementById('__rankdiaglog');
    if (!el) return;
    var line = document.createElement('div');
    if (color) line.style.color = color;
    line.textContent = s;
    el.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }

  var origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input);
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    if (!/tcloudbase|\/api\/|leaderboard|scores/i.test(url)) return origFetch(input, init);

    var t0 = Date.now();
    log('→ ' + method + ' ' + url, '#8fd0ff');
    return origFetch(input, init).then(function (res) {
      log('← ' + res.status + ' ' + (Date.now() - t0) + 'ms', res.ok ? '#7fdc9b' : '#ff8b8b');
      var c = res.clone();
      c.text().then(function (t) {
        log('   原始文本(前700): ' + t.slice(0, 700), '#9aa7bd');
        // show what a parser sees, field by field
        try {
          var j = JSON.parse(t);
          if (j && j.entries) {
            log('   解析结果: total=' + j.total + ' offset=' + j.offset
              + ' entries=' + j.entries.length
              + ' player_best=' + JSON.stringify(j.player_best)
              + ' updated=' + j.updated, '#9aa7bd');
            if (j.entries[0]) {
              log('   第1条字段: ' + Object.keys(j.entries[0]).join(', ')
                + '  →  ' + JSON.stringify(j.entries[0]), '#9aa7bd');
              log('   各字段类型: ' + Object.keys(j.entries[0]).map(function (k) {
                return k + ':' + (typeof j.entries[0][k]);
              }).join(', '), '#9aa7bd');
            }
          } else {
            log('   解析结果没有 entries 字段！顶层键: ' + Object.keys(j || {}).join(', '), '#ff8b8b');
          }
        } catch (e) {
          log('   JSON.parse 失败: ' + e.message, '#ff8b8b');
        }
      }).catch(function () {});
      return res;
    }).catch(function (e) {
      log('✗ 失败 ' + (Date.now() - t0) + 'ms ' + (e && e.message ? e.message : e), '#ff8b8b');
      throw e;
    });
  };

  window.addEventListener('error', function (e) {
    log('✗ JS 错误: ' + (e.message || ''), '#ff8b8b');
  });
  window.addEventListener('unhandledrejection', function (e) {
    log('✗ Promise 拒绝: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)), '#ff8b8b');
  });

  log('base = ' + (base || '(空)'), '#eacb62');
  void BACKEND_PLACEHOLDER;

  // --- active probes: which response SHAPE does the parser accept? -----------
  function probe(label, params) {
    var url = base + '/leaderboard?offset=0&limit=20&player_id=' + encodeURIComponent(params || '');
    return origFetch(url).then(function (r) {
      return r.text().then(function (t) {
        var n = 0, fields = '';
        try {
          var j = JSON.parse(t);
          n = j.entries ? j.entries.length : -1;
          fields = j.entries && j.entries[0] ? Object.keys(j.entries[0]).join('+') : '(无条目)';
        } catch (e) { fields = 'PARSE FAIL'; }
        log('PROBE ' + label + ' → ' + r.status + ' 条数=' + n + ' 字段=' + fields, '#c9a44a');
        return t;
      });
    });
  }

  setTimeout(function () {
    log('--- 主动探测不同的响应形状 ---', '#eacb62');
    probe('原样', '');
  }, 3000);
})();

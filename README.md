# 世伊娘の兴隆山大冒险 · 26百团答题小游戏 — 网页版

这是 **26百团答题小游戏 WebVer1.1** 的在线版本，用 Godot Engine 4.7.2 制作。

- 在线游玩：<https://sumiiiiiii-A.github.io/26-shiyi-acg-quiz/>
- 手机支持横屏适配（竖屏时会提示旋转屏幕）
- 建议使用支持 WebAssembly 的现代浏览器（Chrome / Edge / Firefox / Safari）

## 关于本仓库

本仓库只存放**构建产物**，用于 GitHub Pages 静态托管：

| 文件 | 说明 |
| --- | --- |
| `index.html` | 自定义页面外壳（加载进度、横屏提示、全屏按钮） |
| `index.js` | Godot Web 运行时加载器 |
| `index.wasm` | Godot 引擎（WebAssembly，37.9 MB，托管方自动 gzip 到 ~9.8 MB） |
| `index.pck` | 游戏内容（11.3 MB） |
| `index.audio.*.worklet.js` | 音频 worklet |
| `index.icon.png` / `index.apple-touch-icon.png` / `index.png` | 图标 |
| `fonts/WenQuanYi/` | 页面用的位图字体 |
| `licenses/`, `OFL-font.txt` | 第三方字体与素材许可证 |

构建时附带的 `.gz` 副本没有上传 —— GitHub Pages 会自己 gzip，同时上传两份只会让仓库体积翻倍。

## 技术说明

* 引擎版本：Godot **4.7.2** stable
* 渲染后端：GL Compatibility
* 设计分辨率：1280 × 720（横屏）
* Web 模板：`web_nothreads_release`（不依赖 SharedArrayBuffer，因此不需要 COOP/COEP 响应头）

原版 `index.pck` 已做 SHA256 校验，托管副本与原始文件**逐字节一致**。

## 排行榜后端

排行榜指向腾讯云开发 CloudBase 上的一个云函数，地址写在 `index.html` 第 53 行：

```js
window.QUIZ_RANK_API_BASE = 'https://shiyi-acg-quiz-d9g7yozc701ac0027-1507320843.ap-shanghai.app.tcloudbase.com/api';
```

后端提供两个接口：

* `POST {base}/scores` —— 提交分数
* `GET  {base}/leaderboard?offset=&limit=&player_id=` —— 查排行榜

数据存在 CloudBase 的 SQL 型数据库（PostgreSQL）里。

> **不需要跨域代理。** 实测从 `github.io` 直连该地址，读取和写入都正常
> （CloudBase 网关在此环境下未拦截跨域）。所以直接填后端地址即可。

如果以后换了环境，只要把这一行改成新的后端地址就行。

## 本地运行

浏览器不允许通过 `file://` 加载 WebAssembly 和 `.pck`，必须用 HTTP 服务器：

```bash
python -m http.server 8731
# 然后打开 http://127.0.0.1:8731/
```

注意服务器要把 `.wasm` 以 `application/wasm` 返回。

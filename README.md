# 世伊娘の兴隆山大冒险 · 26百团答题小游戏 — 网页版

这是 **26百团答题小游戏 WebVer1.12** 的在线版本，用 Godot Engine 4.7.2 制作。

- 在线游玩：<https://sumiiiiiii-A.github.io/26-shiyi-acg-quiz/>
- 手机支持横屏适配（竖屏时自动旋转画面，而不是简单提示）
- 移动端虚拟键盘做了完整处理（重排画布、避免抖动、输入框浮层）
- 建议使用支持 WebAssembly 的现代浏览器（Chrome / Edge / Firefox / Safari）

## 关于本仓库

本仓库只存放**构建产物**，用于 GitHub Pages 静态托管：

| 文件 | 说明 |
| --- | --- |
| `index.html` | 自定义页面外壳（加载进度、旋转与缩放、虚拟键盘、全屏） |
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
* 设计分辨率：1280 × 720（横屏，比例 16:9）
* Web 模板：`web_nothreads_release`（不依赖 SharedArrayBuffer，因此不需要 COOP/COEP 响应头）

## 排行榜后端

排行榜指向腾讯云开发 CloudBase 上的一个云函数，地址写在 `index.html` 第 57 行：

```js
window.QUIZ_RANK_API_BASE = 'https://shiyi-acg-quiz-d9g7yozc701ac0027-1507320843.ap-shanghai.app.tcloudbase.com/api';
```

后端提供两个接口：

* `POST {base}/scores` —— 提交分数
* `GET  {base}/leaderboard?offset=&limit=&player_id=` —— 查排行榜

数据存在 CloudBase 的 SQL 型数据库（PostgreSQL）里，经由 PostgREST Data API 访问。

> **不需要跨域代理。** 实测从 `github.io` 直连该地址，读取和写入都正常。
>
> 接口返回的每条记录**必须包含 `elapsed_ms`**（`player_id / score / elapsed_ms / rank`
> 四字段）。缺了这个字段，游戏会显示「排行榜暂不可用」而不是报错 —— 这个坑踩过一次。
>
> 1.12 起客户端会给排行榜请求加一个缓存穿透参数 `&_fresh=<时间戳>`，
> 后端忽略它即可（已验证不影响任何返回字段）。

如果以后换了环境，只要把第 57 行改成新的后端地址就行。

## 本地运行

浏览器不允许通过 `file://` 加载 WebAssembly 和 `.pck`，必须用 HTTP 服务器：

```bash
python -m http.server 8731
# 然后打开 http://127.0.0.1:8731/
```

注意服务器要把 `.wasm` 以 `application/wasm` 返回。

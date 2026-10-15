# 世伊娘の兴隆山大冒险 — 网页版

This is the HTML5/WebAssembly build of the Godot 4.7.2 game
**世伊娘の兴隆山大冒险** (Shii-onna's Xinglong Mountain Adventure).

原版是一个 Godot Engine 4.7.2 的 Windows 游戏，这里是用官方 Web 导出模板
配合原版 `index.pck` 生成的网页版。

## 运行方式

这是纯静态站点，但 `.wasm` / `.pck` 必须通过 HTTP 提供
（直接双击 `index.html` 用 `file://` 打开浏览器会拒绝加载），
并且服务器需要：

* `.wasm` 以 `application/wasm` 返回
* 建议开启 gzip：`index.wasm` 37.7 MB → 9.6 MB

### GitHub Pages

启用 Pages 后即可访问：

```
https://<username>.github.io/<repo-name>/
```

GitHub Pages 自动满足上面的条件（会正确返回 `application/wasm`，并自动 gzip）。

### 本地预览

```powershell
python serve.py 8731
# 打开 http://127.0.0.1:8731/
```

## 文件说明

| 文件 | 大小 | 说明 |
| --- | --- | --- |
| `index.html` | 5.4 KB | 入口页面 |
| `index.js` | 273 KB | Godot Web 运行时加载器 |
| `index.wasm` | 37.7 MB | Godot 引擎（WebAssembly） |
| `index.pck` | 10.5 MB | **游戏内容**（原版 pack，未修改） |
| `index.audio.worklet.js` | 7.1 KB | 音频 worklet |
| `index.audio.position.worklet.js` | 2.9 KB | 音频定位 worklet |
| `.nojekyll` | 0 B | 让 GitHub Pages 跳过 Jekyll 处理 |

## 技术细节

* 引擎版本：Godot **4.7.2** stable
* 渲染后端：GL Compatibility（Web 必须）
* 分辨率：1280 × 720（项目设置里的 viewport 尺寸）
* 模板：`web_nothreads_release`（不依赖 SharedArrayBuffer，
  所以不需要 COOP/COEP 隔离响应头，静态托管直接可用）

原版 `index.pck` 里的 145 个资源文件 MD5 全部校验通过，未做任何修改。

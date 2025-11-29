<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://raw.githubusercontent.com/dpes8693/neon-pulse-visualizer/refs/heads/main/img/demo1.png" />

# 🎵 Neon Pulse Visualizer

高效能賽博龐克音訊視覺化工具，使用 React、Three.js 和 Web Audio API 打造。

[English](README.md) | [中文](README-zh.md)

</div>

---

## ✨ 功能特色

- **即時音訊視覺化** - 根據音頻頻率動態響應的 3D 圖形
- **多種音訊來源**
  - 🎵 本地音檔上傳（MP3、WAV）
  - 📺 YouTube 影片嵌入並擷取音訊
  - 🎤 麥克風輸入
  - 🖥️ 系統/分頁音訊擷取（桌面瀏覽器）
- **賽博龐克美學**
  - 霓虹光暈效果
  - 頂點位移的線框幾何體
  - 響應式粒子系統
  - 低音節拍時的相機震動
- **可自訂粒子設定**
  - 數量、大小、速度、分布、透明度、脈衝強度
- **5 種變形模式**
  - 🌊 Gentle（柔和）- 平滑的波浪呼吸效果
  - ⚡ Normal（標準）- 標準音訊響應變形
  - 🦔 Spiky（尖銳）- 低閾值觸發的銳利尖刺
  - 🧊 Blocky（方塊）- 量化的階梯式位移
  - 🌀 Chaotic（混亂）- 多層噪聲與隨機爆發
- **模式切換確認** - 切換音訊來源時防止音訊重疊
- **效能優化**
  - 幾何體更新的跳幀處理
  - 噪音閘過濾
  - 物件池化以減少垃圾回收

## 🚀 快速開始

### 環境需求

- Node.js 18+ 或 pnpm/npm/yarn

### 安裝步驟

```bash
# 複製專案
git clone https://github.com/dpes8693/neon-pulse-visualizer.git
cd neon-pulse-visualizer

# 安裝依賴
pnpm install
# 或
npm install

# 啟動開發伺服器
pnpm dev
# 或
npm run dev
```

應用程式將在 `http://localhost:3000` 運行

### 建置生產版本

```bash
pnpm build
# 或
npm run build

# 預覽生產版本
pnpm preview
```

## 📁 專案結構

```
neon-pulse-visualizer/
├── index.html          # 入口 HTML，包含 Tailwind CSS 和字型
├── index.tsx           # React 應用程式入口
├── App.tsx             # 主要應用程式元件與音訊邏輯
├── types.ts            # TypeScript 型別定義
├── vite.config.ts      # Vite 設定檔
├── components/
│   ├── Scene.tsx       # Three.js 3D 場景與視覺化元件
│   └── UI.tsx          # 使用者介面控制元件
├── package.json
└── tsconfig.json
```

## 🏗️ 架構說明

### 核心元件

| 元件 | 說明 |
|------|------|
| `App.tsx` | 主控制器，處理音訊上下文、檔案上傳、YouTube 嵌入和音訊擷取 |
| `Scene.tsx` | Three.js 場景，包含視覺化元素 |
| `UI.tsx` | 賽博龐克風格的控制面板和狀態指示器 |

### 視覺化元素

| 元素 | 說明 |
|------|------|
| `MainSphere` | 二十面體，頂點位移響應中頻 |
| `InnerCore` | 內部脈動球體，響應低音 |
| `Particles` | 環繞粒子雲，具有音訊響應運動 |
| `CameraController` | 自動旋轉，低音觸發震動效果 |

### 音訊處理流程

```
音訊來源 → AudioContext → AnalyserNode → FFT 資料 → 視覺化元件
                ↓
           Destination（揚聲器）
```

## 🎛️ 音訊設定

分析器配置了優化設定以降低噪音：

```typescript
analyser.fftSize = 2048;              // FFT 大小
analyser.smoothingTimeConstant = 0.9; // 平滑係數（越高越平滑）
analyser.minDecibels = -90;           // 最小分貝（噪音門檻）
analyser.maxDecibels = -10;           // 最大分貝閾值
```

## 🎨 自訂設定

### 粒子設定

透過設定面板（齒輪圖示）調整：
- **Count（數量）**: 100 - 2000 個粒子
- **Size（大小）**: 0.05 - 0.5
- **Speed（速度）**: 0.1 - 3.0
- **Spread（分布）**: 5 - 30
- **Opacity（透明度）**: 0.1 - 1.0
- **Pulse（脈衝）**: 0.5 - 5.0（音訊響應強度）
- **Deformation Mode（變形模式）**: 5 種獨特的視覺風格可選

### 後處理效果

`Scene.tsx` 中的 Bloom 效果設定：
```typescript
<Bloom 
  luminanceThreshold={0.3}  // 亮度閾值
  mipmapBlur                // Mipmap 模糊
  intensity={1.2}           // 強度
  radius={0.4}              // 半徑
  levels={5}                // 層級
/>
```

## 🛠️ 技術棧

| 技術 | 用途 |
|------|------|
| **React 19** | UI 框架 |
| **Three.js** | 3D 圖形引擎 |
| **@react-three/fiber** | Three.js 的 React 渲染器 |
| **@react-three/drei** | r3f 實用輔助工具 |
| **@react-three/postprocessing** | 後處理效果 |
| **Vite** | 建置工具與開發伺服器 |
| **TypeScript** | 型別安全 |
| **Tailwind CSS** | 工具優先的樣式框架 |

## 📝 API 參考

### AudioState 介面

```typescript
interface AudioState {
  isPlaying: boolean;           // 是否正在播放
  audioBuffer: AudioBuffer | null;  // 音訊緩衝區
  analyser: AnalyserNode | null;    // 分析器節點
  audioContext: AudioContext | null; // 音訊上下文
}
```

### ParticleSettings 介面

```typescript
interface ParticleSettings {
  count: number;           // 粒子數量
  size: number;            // 粒子大小
  speed: number;           // 動畫速度
  spread: number;          // 分布半徑
  opacity: number;         // 透明度
  pulseIntensity: number;  // 音訊響應強度
  deformationMode: DeformationMode; // 球體變形模式
}

type DeformationMode = 'gentle' | 'normal' | 'spiky' | 'blocky' | 'chaotic';
```

## 🔧 效能優化技巧

1. **跳幀更新** - 幾何體每隔一幀更新，粒子每三幀更新
2. **噪音閘** - 忽略低於閾值的音訊值（NOISE_GATE = 15）
3. **向量重用** - 使用 `useMemo` 創建可重用的 `THREE.Vector3`
4. **Canvas 設定優化**:
   ```typescript
   <Canvas
     dpr={[1, 1.5]}  // 限制像素比
     gl={{ 
       antialias: false,  // 關閉抗鋸齒
       powerPreference: 'high-performance',
       stencil: false
     }}
     performance={{ min: 0.5 }}  // 自動降質
   />
   ```

## 🤝 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

---

<div align="center">

Made with ❤️ and ☕

**[⬆ 回到頂部](#-neon-pulse-visualizer)**

</div>

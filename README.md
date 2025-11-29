<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://raw.githubusercontent.com/dpes8693/neon-pulse-visualizer/refs/heads/main/img/demo1.png" />

# 🎵 Neon Pulse Visualizer

A high-performance cyberpunk audio visualizer built with React, Three.js, and Web Audio API.

[English](README.md) | [中文](README-zh.md)

</div>

---

## ✨ Features

- **Real-time Audio Visualization** - Dynamic 3D graphics that respond to audio frequencies
- **Multiple Audio Sources**
  - 🎵 Local audio file upload (MP3, WAV)
  - 📺 YouTube video embedding with audio capture
  - 🎤 Microphone input
  - 🖥️ System/Tab audio capture (Desktop browsers)
- **Cyberpunk Aesthetics**
  - Neon bloom effects
  - Wireframe geometry with vertex displacement
  - Reactive particle system
  - Camera shake on bass hits
- **Customizable Particle Settings**
  - Count, Size, Speed, Spread, Opacity, Pulse Intensity
- **5 Deformation Modes**
  - 🌊 Gentle - Smooth wave-like breathing effect
  - ⚡ Normal - Standard audio-reactive deformation
  - 🦔 Spiky - Sharp spikes with low threshold triggers
  - 🧊 Blocky - Quantized stepped displacement
  - 🌀 Chaotic - Multi-layered noise with random bursts
- **Mode Switch Confirmation** - Prevents audio overlap when switching between sources
- **Performance Optimized**
  - Frame skipping for geometry updates
  - Noise gate filtering
  - Object pooling to reduce garbage collection

### 🚀 Getting Started

#### Prerequisites

- Node.js 18+ or pnpm/npm/yarn

#### Installation

```bash
# Clone the repository
git clone https://github.com/dpes8693/neon-pulse-visualizer.git
cd neon-pulse-visualizer

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`

#### Build for Production

```bash
pnpm build
# or
npm run build

# Preview production build
pnpm preview
```

### 📁 Project Structure

```
neon-pulse-visualizer/
├── index.html          # Entry HTML with Tailwind CSS & fonts
├── index.tsx           # React app entry point
├── App.tsx             # Main application component & audio logic
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
├── components/
│   ├── Scene.tsx       # Three.js 3D scene & visualizers
│   └── UI.tsx          # User interface controls
├── package.json
└── tsconfig.json
```

### 🏗️ Architecture

#### Core Components

| Component | Description |
|-----------|-------------|
| `App.tsx` | Main controller handling audio context, file uploads, YouTube embedding, and audio capture |
| `Scene.tsx` | Three.js scene containing the visualizer elements |
| `UI.tsx` | Cyberpunk-styled control panel and status indicators |

#### Visualization Elements

| Element | Description |
|---------|-------------|
| `MainSphere` | Icosahedron with vertex displacement reacting to mid frequencies |
| `InnerCore` | Pulsating inner sphere responding to bass |
| `Particles` | Orbiting particle cloud with audio-reactive movement |
| `CameraController` | Auto-rotation with bass-triggered shake effect |

#### Audio Pipeline

```
Audio Source → AudioContext → AnalyserNode → FFT Data → Visualizers
                    ↓
              Destination (Speakers)
```

### 🎛️ Audio Settings

The analyser is configured with optimized settings to reduce noise:

```typescript
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.9;
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
```

### 🎨 Customization

#### Particle Settings

Access the settings panel (gear icon) to adjust:
- **Count**: 100 - 2000 particles
- **Size**: 0.05 - 0.5
- **Speed**: 0.1 - 3.0
- **Spread**: 5 - 30
- **Opacity**: 0.1 - 1.0
- **Pulse**: 0.5 - 5.0 (audio reactivity intensity)
- **Deformation Mode**: Choose from 5 distinct visual styles

#### Post-processing

Bloom effect configuration in `Scene.tsx`:
```typescript
<Bloom 
  luminanceThreshold={0.3} 
  mipmapBlur 
  intensity={1.2} 
  radius={0.4}
  levels={5}
/>
```

### 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Three.js** | 3D graphics engine |
| **@react-three/fiber** | React renderer for Three.js |
| **@react-three/drei** | Useful helpers for r3f |
| **@react-three/postprocessing** | Post-processing effects |
| **Vite** | Build tool & dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |

### 📝 API Reference

#### AudioState Interface

```typescript
interface AudioState {
  isPlaying: boolean;
  audioBuffer: AudioBuffer | null;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
}
```

#### ParticleSettings Interface

```typescript
interface ParticleSettings {
  count: number;           // Number of particles
  size: number;            // Particle size
  speed: number;           // Animation speed
  spread: number;          // Distribution radius
  opacity: number;         // Transparency
  pulseIntensity: number;  // Audio reactivity strength
  deformationMode: DeformationMode; // Sphere deformation style
}

type DeformationMode = 'gentle' | 'normal' | 'spiky' | 'blocky' | 'chaotic';
```

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ and ☕

**[⬆ Back to Top](#-neon-pulse-visualizer)**

</div>

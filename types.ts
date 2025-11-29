export interface AudioState {
  isPlaying: boolean;
  audioBuffer: AudioBuffer | null;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
}

// 5 distinct deformation modes for the sphere
export type DeformationMode = 'gentle' | 'normal' | 'spiky' | 'blocky' | 'chaotic';

export const DEFORMATION_MODE_LABELS: Record<DeformationMode, string> = {
  gentle: '🌊 柔和 Gentle',
  normal: '⚡ 標準 Normal',
  spiky: '🦔 尖銳 Spiky',
  blocky: '🧊 方塊 Blocky',
  chaotic: '🌀 混亂 Chaotic',
};

export interface ParticleSettings {
  count: number;
  size: number;
  speed: number;
  spread: number;
  opacity: number;
  pulseIntensity: number;
  deformationMode: DeformationMode;
}

export interface VisualizerProps {
  analyser: AnalyserNode;
  particleSettings?: ParticleSettings;
}

export const DEFAULT_PARTICLE_SETTINGS: ParticleSettings = {
  count: 800,
  size: 0.15,
  speed: 1,
  spread: 15,
  opacity: 0.7,
  pulseIntensity: 2.0,
  deformationMode: 'normal',
};

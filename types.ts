export interface AudioState {
  isPlaying: boolean;
  audioBuffer: AudioBuffer | null;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
}

export interface ParticleSettings {
  count: number;
  size: number;
  speed: number;
  spread: number;
  opacity: number;
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
};

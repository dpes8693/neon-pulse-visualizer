import React, { useState } from 'react';
import { ParticleSettings, DEFAULT_PARTICLE_SETTINGS, DeformationMode, DEFORMATION_MODE_LABELS } from '../types';

interface UIProps {
  onFileUpload: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  onStartCapture: () => void;
  onStopCapture: () => void;
  onUseMicrophone: () => void;
  onReset: () => void;
  isPlaying: boolean;
  audioName?: string;
  isLoading: boolean;
  error: string | null;
  youtubeId: string | null;
  isCapturing: boolean;
  hideUI: boolean;
  onToggleUI: () => void;
  particleSettings: ParticleSettings;
  onParticleSettingsChange: (settings: ParticleSettings) => void;
}

// Slider component for control panel
const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-[10px] font-mono">
      <span className="text-gray-400">{label}</span>
      <span className="text-cyan-400">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

export const UI: React.FC<UIProps> = ({ 
    onFileUpload, 
    onUrlSubmit, 
    onStartCapture,
    onStopCapture,
    onUseMicrophone,
    onReset,
    isPlaying, 
    audioName, 
    isLoading, 
    error,
    youtubeId,
    isCapturing,
    hideUI,
    onToggleUI,
    particleSettings,
    onParticleSettingsChange,
}) => {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showModeConfirm, setShowModeConfirm] = useState<'file' | 'url' | null>(null);

  // Check if there's active audio that would be interrupted
  const hasActiveAudio = isPlaying || isCapturing || youtubeId;

  const handleModeSwitch = (newMode: 'file' | 'url') => {
    if (newMode === mode) return;
    
    // If there's active audio, show confirmation dialog
    if (hasActiveAudio) {
      setShowModeConfirm(newMode);
    } else {
      setMode(newMode);
    }
  };

  const confirmModeSwitch = () => {
    if (showModeConfirm) {
      onReset(); // Reset all audio state
      setMode(showModeConfirm);
      setShowModeConfirm(null);
    }
  };

  const cancelModeSwitch = () => {
    setShowModeConfirm(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* Mode Switch Confirmation Modal */}
      {showModeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={cancelModeSwitch}
          />
          
          {/* Modal */}
          <div className="relative bg-gray-900 border border-cyan-500/50 rounded-lg p-6 max-w-sm mx-4 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 -mt-0.5 -ml-0.5"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 -mt-0.5 -mr-0.5"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 -mb-0.5 -ml-0.5"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 -mb-0.5 -mr-0.5"></div>
            
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-cyan-400 font-mono text-center text-lg font-bold mb-2">
              SWITCH MODE?
            </h3>
            
            {/* Message */}
            <p className="text-gray-400 text-center text-sm font-mono mb-6">
              <br />
              <span className="text-gray-500">Current audio will be stopped.</span>
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelModeSwitch}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-gray-300 font-mono text-sm rounded transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={confirmModeSwitch}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white font-mono text-sm rounded shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Control Panel - Bottom Left (Always visible) */}
      <div className="pointer-events-auto fixed bottom-6 left-6 z-30 flex flex-col gap-2">
        {/* Eye Toggle Button */}
        <button
          onClick={onToggleUI}
          className={`p-3 rounded-lg border transition-all ${
            hideUI 
              ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,255,255,0.5)]' 
              : 'bg-black/80 border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-400'
          }`}
          title={hideUI ? "Show UI" : "Hide UI (Fullscreen Mode)"}
        >
          {hideUI ? (
            // Eye open icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          ) : (
            // Eye closed icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          )}
        </button>

        {/* Settings Toggle Button */}
        <button
          onClick={() => setShowControlPanel(!showControlPanel)}
          className={`p-3 rounded-lg border transition-all ${
            showControlPanel 
              ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-[0_0_15px_rgba(255,0,255,0.5)]' 
              : 'bg-black/80 border-gray-600 text-gray-400 hover:border-fuchsia-500 hover:text-fuchsia-400'
          }`}
          title="Particle Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>

        {/* Particle Control Panel */}
        {showControlPanel && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-black/90 backdrop-blur-sm border border-fuchsia-500/50 rounded-lg p-4 shadow-[0_0_20px_rgba(255,0,255,0.2)]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-fuchsia-400 font-mono text-xs font-bold tracking-wider">PARTICLE SETTINGS</h3>
              <button
                onClick={() => onParticleSettingsChange(DEFAULT_PARTICLE_SETTINGS)}
                className="text-gray-500 hover:text-cyan-400 text-[10px] font-mono"
              >
                RESET
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <Slider
                label="COUNT"
                value={particleSettings.count}
                min={100}
                max={2000}
                step={100}
                onChange={(v) => onParticleSettingsChange({ ...particleSettings, count: v })}
              />
              <Slider
                label="SIZE"
                value={particleSettings.size}
                min={0.05}
                max={0.5}
                step={0.01}
                onChange={(v) => onParticleSettingsChange({ ...particleSettings, size: v })}
              />
              <Slider
                label="SPEED"
                value={particleSettings.speed}
                min={0.1}
                max={3}
                step={0.1}
                onChange={(v) => onParticleSettingsChange({ ...particleSettings, speed: v })}
              />
              <Slider
                label="SPREAD"
                value={particleSettings.spread}
                min={5}
                max={30}
                step={1}
                onChange={(v) => onParticleSettingsChange({ ...particleSettings, spread: v })}
              />
              <Slider
                label="OPACITY"
                value={particleSettings.opacity}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) => onParticleSettingsChange({ ...particleSettings, opacity: v })}
              />
              <Slider
                label="PULSE"
                value={particleSettings.pulseIntensity}
                min={0.5}
                max={5}
                step={0.1}
                onChange={(v) => onParticleSettingsChange({ ...particleSettings, pulseIntensity: v })}
              />
              
              {/* Deformation Mode Dropdown */}
              <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-fuchsia-500/30">
                <span className="text-gray-400 text-[10px] font-mono">DEFORMATION MODE</span>
                <select
                  value={particleSettings.deformationMode}
                  onChange={(e) => onParticleSettingsChange({ 
                    ...particleSettings, 
                    deformationMode: e.target.value as DeformationMode 
                  })}
                  className="w-full bg-gray-900 border border-fuchsia-500/50 text-cyan-400 text-xs font-mono rounded px-2 py-1.5 cursor-pointer focus:outline-none focus:border-cyan-400 hover:border-cyan-400 transition-colors"
                >
                  {(Object.keys(DEFORMATION_MODE_LABELS) as DeformationMode[]).map((mode) => (
                    <option key={mode} value={mode} className="bg-gray-900">
                      {DEFORMATION_MODE_LABELS[mode]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hide all other UI when hideUI is true */}
      {!hideUI && (
        <>
          {/* Top Left: Controls */}
          <div className="pointer-events-auto flex flex-col items-start gap-4 max-w-md w-full">
            <h1 className="text-4xl font-bold text-cyan-400 font-['Orbitron'] tracking-wider drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              NEON PULSE
            </h1>
            
            {/* Mode Switcher */}
            <div className="flex gap-4 text-sm font-mono tracking-widest">
                <button 
                    onClick={() => handleModeSwitch('file')}
                    className={`pb-1 border-b-2 transition-colors ${mode === 'file' ? 'text-white border-cyan-400' : 'text-gray-500 border-transparent hover:text-cyan-200'}`}
                >
                    FILE UPLOAD
                </button>
                <button 
                    onClick={() => handleModeSwitch('url')}
                    className={`pb-1 border-b-2 transition-colors ${mode === 'url' ? 'text-white border-fuchsia-400' : 'text-gray-500 border-transparent hover:text-fuchsia-200'}`}
                >
                    YOUTUBE EMBED
                </button>
            </div>
            
            <div className="relative group w-full">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${mode === 'file' ? 'from-cyan-500 to-blue-500' : 'from-fuchsia-500 to-purple-500'} rounded blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}></div>
              <div className="relative flex items-center bg-black bg-opacity-90 backdrop-blur-xl border border-white/10 rounded-lg p-2 w-full">
            
             {mode === 'file' ? (
                <label className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors rounded-md w-full justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-cyan-100 font-semibold tracking-wide uppercase text-sm">Select Audio File</span>
                <input 
                    type="file" 
                    accept="audio/mp3, audio/wav, audio/mpeg" 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
                </label>
            ) : (
                <form onSubmit={handleUrlSubmit} className="flex w-full gap-2">
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube Link..."
                        className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-gray-500 font-mono text-sm outline-none px-2"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="text-fuchsia-400 hover:text-white disabled:opacity-50 px-2 font-bold font-mono"
                    >
                        LOAD
                    </button>
                </form>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
            <div className="w-full bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded text-xs font-mono tracking-wide animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.3)]">
                ⚠ ERROR: {error}
            </div>
        )}

        {(audioName || isCapturing) && !error && (
           <div className={`mt-2 font-mono text-xs border-l-2 pl-2 animate-pulse bg-black/50 p-1 ${isCapturing ? 'border-green-500 text-green-400' : 'border-cyan-500 text-cyan-400'}`}>
             {isLoading ? (
                 <>STATUS: PROCESSING...</>
             ) : (
                 <>
                    SOURCE: {isCapturing ? 'SYSTEM AUDIO' : (audioName || 'NONE')} <br/>
                    STATUS: {isPlaying || isCapturing ? 'VISUALIZING >>' : 'READY'}
                 </>
             )}
           </div>
        )}
      </div>
        </>
      )}

      {/* YouTube Player - use CSS to hide instead of unmounting to keep video playing */}
      {youtubeId && mode === 'url' && (
        <div 
          className={`pointer-events-auto fixed bottom-24 right-6 flex flex-col items-end gap-2 z-20 w-80 md:w-96 transition-opacity duration-300 ${
            hideUI ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
            {/* Reset Button */}
            <button
                onClick={onReset}
                className="px-3 py-1 bg-gray-800 hover:bg-red-900 border border-gray-600 hover:border-red-500 text-gray-300 hover:text-red-300 rounded font-mono text-xs flex items-center gap-2 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                CHANGE VIDEO
            </button>
            
            {/* Cyberpunk Border Container */}
            <div className="relative p-1 bg-black/90 backdrop-blur-sm border border-fuchsia-500/50 shadow-[0_0_20px_rgba(255,0,255,0.3)] rounded-lg w-full">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-fuchsia-400 -mt-0.5 -ml-0.5"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-fuchsia-400 -mt-0.5 -mr-0.5"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-fuchsia-400 -mb-0.5 -ml-0.5"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-fuchsia-400 -mb-0.5 -mr-0.5"></div>
                
                <div className="relative w-full aspect-video">
                  <iframe 
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1&iv_load_policy=3&modestbranding=1`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full rounded bg-black"
                  ></iframe>
                </div>
            </div>
            
            {/* Audio Capture Buttons - Compact */}
            {!isCapturing ? (
                <div className="flex flex-col items-end gap-2 w-full">
                    <div className="flex gap-2 w-full justify-end">
                        <button 
                            onClick={onStartCapture}
                            className="hidden md:block px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold font-mono tracking-wider rounded shadow-[0_0_10px_rgba(255,0,255,0.5)] transition-all transform hover:scale-105 text-[10px] whitespace-nowrap"
                        >
                            🖥️ CAPTURE TAB
                        </button>
                        <button 
                            onClick={onUseMicrophone}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono tracking-wider rounded shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all transform hover:scale-105 text-[10px] whitespace-nowrap"
                        >
                            🎙️ USE MIC
                        </button>
                    </div>
                    <p className="text-gray-500 text-[9px] font-mono text-right">
                        Play video, then capture audio to sync visualizer
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/50 border border-green-500 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-mono text-xs font-bold">SYNCED</span>
                    </div>
                    <button 
                        onClick={onStopCapture}
                        className="text-gray-400 hover:text-red-400 text-xs font-mono px-2 py-1 border border-gray-600 hover:border-red-500 rounded transition-colors"
                    >
                        ✕ STOP
                    </button>
                </div>
            )}
        </div>
      )}

      {/* Bottom Right: Status Indicators - also hidden when hideUI is true */}
      {!hideUI && (
        <div className="pointer-events-auto self-end text-right">
          <div className="flex flex-col gap-1 items-end text-xs font-mono text-cyan-600/70">
            <div>SYS.VISUALIZER: {isPlaying || isCapturing ? 'ACTIVE' : 'STANDBY'}</div>
            <div>RENDERER: WEBGL.2.0</div>
            <div>BLOOM: ENABLED</div>
            {isCapturing && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-green-400">AUDIO STREAM LINKED</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

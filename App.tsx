import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { AudioState, ParticleSettings, DEFAULT_PARTICLE_SETTINGS } from './types';

const App: React.FC = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    audioBuffer: null,
    analyser: null,
    audioContext: null,
  });
  
  const [audioName, setAudioName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  const [particleSettings, setParticleSettings] = useState<ParticleSettings>(DEFAULT_PARTICLE_SETTINGS);
  
  // Audio Graph Refs
  const bufferSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const streamSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize Audio Context (lazily)
  const initAudioContext = () => {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    
    // Optimized settings to reduce noise
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.9; // Higher = smoother, less jittery (0.0 - 1.0)
    analyser.minDecibels = -90; // Ignore very quiet sounds (noise floor)
    analyser.maxDecibels = -10; // Maximum volume threshold
    
    return { ctx, analyser };
  };

  const getContext = async () => {
    let { ctx, analyser } = audioState.analyser && audioState.audioContext 
      ? { ctx: audioState.audioContext, analyser: audioState.analyser } 
      : initAudioContext();

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return { ctx, analyser };
  };

  const stopAllSources = () => {
    // Stop buffer source (file)
    if (bufferSourceNodeRef.current) {
      try {
        bufferSourceNodeRef.current.stop();
        bufferSourceNodeRef.current.disconnect();
      } catch (e) {}
      bufferSourceNodeRef.current = null;
    }

    // Stop stream source (capture)
    if (streamSourceNodeRef.current) {
        try {
            streamSourceNodeRef.current.disconnect();
            // Also stop tracks to turn off the "sharing" indicator in browser
            const stream = (streamSourceNodeRef.current as any).mediaStream;
            if(stream) {
                stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            }
        } catch(e) {}
        streamSourceNodeRef.current = null;
    }
    
    // CRITICAL: Disconnect analyser from destination to prevent audio overlap
    // when switching between modes (e.g., MP3 -> YouTube capture)
    if (audioState.analyser) {
      try {
        audioState.analyser.disconnect();
      } catch (e) {}
    }
    
    setIsCapturing(false);
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setYoutubeId(null);
    stopAllSources();
    
    const { ctx, analyser } = await getContext();
    
    setAudioName(file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    try {
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      setAudioState({
        isPlaying: true,
        audioBuffer: decodedBuffer,
        analyser,
        audioContext: ctx,
      });

      playBuffer(ctx, decodedBuffer, analyser);
      setIsLoading(false);

    } catch (e) {
      console.error("Error decoding audio data", e);
      setError("Failed to decode audio file. It might be corrupt or an unsupported format.");
      setIsLoading(false);
    }
  };

  const playBuffer = (ctx: AudioContext, buffer: AudioBuffer, analyser: AnalyserNode) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    source.connect(analyser);
    analyser.connect(ctx.destination); // Connect to speakers so we can hear it
    
    source.start(0);
    bufferSourceNodeRef.current = source;
    
    source.onended = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlSubmit = (url: string) => {
    setError(null);
    const id = getYoutubeId(url);
    if (!id) {
        setError("Invalid YouTube URL");
        return;
    }
    stopAllSources();
    setYoutubeId(id);
    setAudioName("YouTube Embed");
  };

  const handleReset = () => {
    stopAllSources();
    setYoutubeId(null);
    setAudioName("");
    setError(null);
  };

  const handleStartCapture = async () => {
      setError(null);
      
      // Safety check for mobile browsers that don't support getDisplayMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
         setError("System Audio Capture is not supported on mobile devices. Please use the 'USE MICROPHONE' button instead.");
         return;
      }

      try {
        const { ctx, analyser } = await getContext();

        // Use getDisplayMedia to capture system/tab audio
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true, // Video is required to get audio in most browsers
            audio: true,
            preferCurrentTab: true, // Hint to browser to offer current tab
        } as any);
        
        // Check if user actually shared audio
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            setError("No audio shared. Please check 'Share Audio' in the popup.");
            // Stop video track since we failed
            stream.getTracks().forEach(t => t.stop());
            return;
        }

        const source = ctx.createMediaStreamSource(stream);
        
        // CRITICAL: Connect ONLY to analyser. 
        // DO NOT connect to ctx.destination, otherwise we get an echo 
        // because the tab is already playing the audio!
        source.connect(analyser);
        
        streamSourceNodeRef.current = source;
        setIsCapturing(true);
        setAudioState(prev => ({ ...prev, isPlaying: true, analyser, audioContext: ctx }));

        // Detect when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
            stopAllSources();
        };

      } catch (e) {
          console.error(e);
          setError("Capture failed or cancelled.");
      }
  };

  const handleUseMicrophone = async () => {
      setError(null);
      stopAllSources();
      
      try {
          const { ctx, analyser } = await getContext();
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);
          // Do not connect mic to destination to avoid feedback loop (screeching noise)
          
          streamSourceNodeRef.current = source;
          setIsCapturing(true);
          setAudioState(prev => ({ ...prev, isPlaying: true, analyser, audioContext: ctx }));
          setAudioName("Microphone Input");

      } catch (e) {
          console.error(e);
          setError("Microphone access denied. Please allow permission.");
      }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <UI 
        onFileUpload={handleFileUpload} 
        onUrlSubmit={handleUrlSubmit}
        onStartCapture={handleStartCapture}
        onStopCapture={stopAllSources}
        onUseMicrophone={handleUseMicrophone}
        onReset={handleReset}
        isPlaying={audioState.isPlaying}
        audioName={audioName}
        isLoading={isLoading}
        error={error}
        youtubeId={youtubeId}
        isCapturing={isCapturing}
        hideUI={hideUI}
        onToggleUI={() => setHideUI(!hideUI)}
        particleSettings={particleSettings}
        onParticleSettingsChange={setParticleSettings}
      />
      
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: false, 
          toneMapping: 3,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        performance={{ min: 0.5 }}
      >
        {audioState.analyser ? (
          <Scene analyser={audioState.analyser} particleSettings={particleSettings} />
        ) : (
          <IdleScene />
        )}
      </Canvas>
    </div>
  );
};

const IdleScene: React.FC = () => {
    return (
        <>
            <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
            <mesh rotation={[0.5, 0.5, 0]}>
                <icosahedronGeometry args={[2, 1]} />
                <meshBasicMaterial wireframe color="#333" />
            </mesh>
             <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={0} intensity={0.5} radius={0.8} />
            </EffectComposer>
        </>
    )
}

export default App;
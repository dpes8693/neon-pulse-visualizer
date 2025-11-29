import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VisualizerProps, ParticleSettings, DEFAULT_PARTICLE_SETTINGS, DeformationMode } from '../types';

// Noise gate threshold - values below this are considered noise and ignored
const NOISE_GATE = 15;

// Utility to get average frequency from a range with noise gate
const getFrequencyRangeValue = (data: Uint8Array, low: number, high: number) => {
  let sum = 0;
  let count = 0;
  for (let i = low; i < high; i++) {
    // Apply noise gate - ignore values below threshold
    if (data[i] > NOISE_GATE) {
      sum += data[i] - NOISE_GATE; // Subtract noise floor
      count++;
    }
  }
  return count > 0 ? sum / (high - low) : 0;
};

const MainSphere: React.FC<VisualizerProps> = ({ analyser, particleSettings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const pulseIntensity = particleSettings?.pulseIntensity ?? DEFAULT_PARTICLE_SETTINGS.pulseIntensity;
  const deformationMode = particleSettings?.deformationMode ?? DEFAULT_PARTICLE_SETTINGS.deformationMode;
  
  // Store original positions for deformation reference (reduced detail level from 4 to 3)
  const originalPositions = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(2, 3);
    return geometry.attributes.position.array as Float32Array;
  }, []);

  // Audio data buffer
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  
  // Reusable vector to avoid garbage collection
  const tempVector = useMemo(() => new THREE.Vector3(), []);
  
  // Frame skip counter for performance
  const frameCount = useRef(0);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    // Skip every other frame for geometry updates (halves CPU load)
    frameCount.current++;
    const shouldUpdateGeometry = frameCount.current % 2 === 0;

    analyser.getByteFrequencyData(dataArray);

    // Calculate different frequency bands
    const bass = getFrequencyRangeValue(dataArray, 0, 10);
    const mids = getFrequencyRangeValue(dataArray, 30, 100);

    if (shouldUpdateGeometry) {
      const positions = meshRef.current.geometry.attributes.position;
      const currentPositions = positions.array as Float32Array;

      // Time for organic movement
      const time = state.clock.getElapsedTime();

      // Deform geometry based on selected mode
      for (let i = 0; i < originalPositions.length; i += 3) {
        const x = originalPositions[i];
        const y = originalPositions[i + 1];
        const z = originalPositions[i + 2];

        // Reuse vector to avoid creating new objects
        tempVector.set(x, y, z).normalize();

        const vertexIndex = i / 3;
        let scale = 1;

        switch (deformationMode) {
          case 'gentle': {
            // 🌊 柔和模式：平滑的波浪起伏，像呼吸一樣
            const wave1 = Math.sin(time * 0.5 + vertexIndex * 0.02) * 0.15;
            const wave2 = Math.cos(time * 0.3 + x * 2) * 0.1;
            const bassInfluence = (bass / 255) * 0.3 * pulseIntensity;
            scale = 1 + wave1 + wave2 + bassInfluence;
            break;
          }
          
          case 'normal': {
            // ⚡ 標準模式：原本的效果
            const noise = Math.sin(x * 2 + time) * Math.cos(y * 2 + time) * Math.sin(z * 2 + time);
            const freqIndex = (vertexIndex * 13) % 300;
            const rawAudioValue = dataArray[freqIndex] / 255.0;
            const audioValue = Math.pow(rawAudioValue, 2);
            const displacement = 1 + (audioValue * 1.5 * pulseIntensity) + (bass / 255 * 0.2 * pulseIntensity);
            const spike = audioValue > 0.5 ? audioValue * 0.8 * pulseIntensity : 0;
            scale = displacement + spike + (noise * 0.1);
            break;
          }
          
          case 'spiky': {
            // 🦔 尖銳模式：劇烈的尖刺突出，像刺蝟
            const freqIndex = (vertexIndex * 7) % 256;
            const rawAudioValue = dataArray[freqIndex] / 255.0;
            // 更陡峭的響應曲線
            const audioValue = Math.pow(rawAudioValue, 3);
            // 低閾值觸發尖刺
            const spike = audioValue > 0.2 ? audioValue * 2.5 * pulseIntensity : 0;
            // 隨機性增加不規則感
            const randomSpike = Math.sin(vertexIndex * 123.456) > 0.7 ? audioValue * 1.5 : 0;
            scale = 1 + spike + randomSpike + (bass / 255 * 0.1);
            break;
          }
          
          case 'blocky': {
            // 🧊 方塊模式：量化的階梯式變化，像低解析度
            const freqIndex = (vertexIndex * 17) % 200;
            const rawAudioValue = dataArray[freqIndex] / 255.0;
            // 量化成5個離散級別
            const quantizedAudio = Math.floor(rawAudioValue * 5) / 5;
            // 基於位置的區塊分組
            const blockGroup = Math.floor((x + y + z + 10) * 2) % 4;
            const blockOffset = blockGroup * 0.1;
            // 階梯式位移
            const displacement = 1 + (quantizedAudio * 1.8 * pulseIntensity) + blockOffset;
            // 加入時間上的量化跳動
            const timeBlock = Math.floor(time * 4) * 0.25;
            const pulse = Math.sin(timeBlock + blockGroup) * 0.15 * (bass / 255);
            scale = displacement + pulse;
            break;
          }
          
          case 'chaotic': {
            // 🌀 混亂模式：高噪聲、隨機、劇烈不可預測的變化
            const freqIndex1 = (vertexIndex * 11) % 256;
            const freqIndex2 = (vertexIndex * 23) % 256;
            const audio1 = dataArray[freqIndex1] / 255.0;
            const audio2 = dataArray[freqIndex2] / 255.0;
            // 多層噪聲疊加
            const noise1 = Math.sin(x * 5 + time * 3) * Math.cos(y * 7 + time * 2);
            const noise2 = Math.sin(z * 3 + time * 4) * Math.sin(vertexIndex + time);
            const noise3 = Math.cos(x * y * 2 + time * 5);
            // 高頻震動
            const vibration = Math.sin(time * 20 + vertexIndex) * 0.1 * audio1;
            // 爆發性位移
            const burst = Math.pow(audio1, 1.5) * 2 * pulseIntensity;
            const secondaryBurst = audio2 * 0.8 * pulseIntensity;
            // 隨機閃爍
            const flicker = Math.random() > 0.95 ? 0.5 * pulseIntensity : 0;
            scale = 1 + burst + secondaryBurst + (noise1 + noise2 + noise3) * 0.3 + vibration + flicker;
            break;
          }
        }

        currentPositions[i] = tempVector.x * scale * 2;
        currentPositions[i + 1] = tempVector.y * scale * 2;
        currentPositions[i + 2] = tempVector.z * scale * 2;
      }

      positions.needsUpdate = true;
    }
    
    meshRef.current.rotation.y += 0.002 + (bass / 10000);
    meshRef.current.rotation.z += 0.001;

    // Pulse color
    const colorIntensity = (bass / 255);
    materialRef.current.emissive.setHSL(0.5 + (colorIntensity * 0.2), 1, 0.2 + colorIntensity * 0.5);
    materialRef.current.color.setHSL(0.5, 1, 0.5);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 3]} />
      <meshStandardMaterial
        ref={materialRef}
        wireframe={true}
        color="#00ffff"
        emissive="#0000ff"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
};

const InnerCore: React.FC<VisualizerProps> = ({ analyser, particleSettings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const pulseIntensity = particleSettings?.pulseIntensity ?? DEFAULT_PARTICLE_SETTINGS.pulseIntensity;
  
  // Reusable vector for lerp target
  const targetScale = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    analyser.getByteFrequencyData(dataArray);
    const bass = getFrequencyRangeValue(dataArray, 0, 20) / 255;
    
    // Smooth pulse - reuse vector instead of creating new one, scaled by pulseIntensity
    const scale = 0.8 + (bass * 0.8 * pulseIntensity);
    targetScale.set(scale, scale, scale);
    meshRef.current.scale.lerp(targetScale, 0.1);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#ff00ff" wireframe={false} />
    </mesh>
  );
};

interface ParticlesProps {
  analyser: AnalyserNode;
  settings: ParticleSettings;
}

const Particles: React.FC<ParticlesProps> = ({ analyser, settings }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  const [positions, initialPositions] = useMemo(() => {
    const count = settings.count;
    const pos = new Float32Array(count * 3);
    const init = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 5 + Math.random() * settings.spread;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      init[i * 3] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;
    }
    return [pos, init];
  }, [settings.count, settings.spread]);

  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  
  // Frame skip for performance
  const frameCount = useRef(0);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Update material properties dynamically
    if (materialRef.current) {
      materialRef.current.size = settings.size;
      materialRef.current.opacity = settings.opacity;
    }
    
    // Update particles every 3rd frame
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;
    
    analyser.getByteFrequencyData(dataArray);
    const bass = getFrequencyRangeValue(dataArray, 0, 20) / 255;
    const time = state.clock.getElapsedTime();

    const currentPositions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const count = settings.count;

    for(let i=0; i<count; i++) {
      const ix = i*3;
      // Orbiting
      const speed = (0.2 + (bass * 0.5)) * settings.speed;
      const x = initialPositions[ix];
      const z = initialPositions[ix+2];
      
      // Simple rotation around Y
      const angle = speed * time * (i % 2 === 0 ? 1 : -1) * 0.2 + (i * 0.1);
      
      // Expand/Contract
      const rScale = 1 + (Math.sin(time * 2 + i) * 0.1) + (bass * 0.2);

      currentPositions[ix] = (x * Math.cos(angle) - z * Math.sin(angle)) * rScale;
      currentPositions[ix+1] = initialPositions[ix+1] * rScale;
      currentPositions[ix+2] = (x * Math.sin(angle) + z * Math.cos(angle)) * rScale;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={settings.count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={settings.size}
        color="#00ffff"
        transparent
        opacity={settings.opacity}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

const CameraController: React.FC<VisualizerProps> = ({ analyser }) => {
  const { camera } = useThree();
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const basePosition = useRef(new THREE.Vector3(0, 0, 8));

  useFrame(() => {
    analyser.getByteFrequencyData(dataArray);
    const bass = getFrequencyRangeValue(dataArray, 0, 10);
    
    // Shake effect
    if (bass > 200) {
      const intensity = (bass - 200) / 55 * 0.2; // 0 to 0.2
      camera.position.x = basePosition.current.x + (Math.random() - 0.5) * intensity;
      camera.position.y = basePosition.current.y + (Math.random() - 0.5) * intensity;
      camera.position.z = basePosition.current.z + (Math.random() - 0.5) * intensity;
    } else {
      // Smooth return
      camera.position.lerp(basePosition.current, 0.1);
    }
  });

  return (
    <OrbitControls 
      enablePan={false} 
      minDistance={4} 
      maxDistance={15} 
      autoRotate 
      autoRotateSpeed={0.5} 
    />
  );
};

export const Scene: React.FC<VisualizerProps> = ({ analyser, particleSettings }) => {
  const settings = particleSettings || DEFAULT_PARTICLE_SETTINGS;
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <CameraController analyser={analyser} />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />

      <group>
        <MainSphere analyser={analyser} particleSettings={settings} />
        <InnerCore analyser={analyser} particleSettings={settings} />
        <Particles analyser={analyser} settings={settings} />
      </group>

      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom 
          luminanceThreshold={0.3} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.4}
          levels={5}
        />
      </EffectComposer>
    </>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// BONFIRE particles system
function BonfireParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 3000;
  
  const particles = React.useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start particles at bottom center
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = -10 + Math.random() * 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;
      
      // Upward velocity with randomness
      velocities[i3] = (Math.random() - 0.5) * 2;
      velocities[i3 + 1] = 10 + Math.random() * 15;
      velocities[i3 + 2] = (Math.random() - 0.5) * 2;
      
      sizes[i] = Math.random() * 0.5 + 0.2;
    }
    
    return { positions, velocities, sizes };
  }, []);
  
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = particles.velocities;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Update positions
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
      
      // Reset particle if it goes too high
      if (positions[i3 + 1] > 15) {
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = -10;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
      }
      
      // Add turbulence
      velocities[i3] += (Math.random() - 0.5) * 0.5;
      velocities[i3 + 2] += (Math.random() - 0.5) * 0.5;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <Points ref={pointsRef} positions={particles.positions} sizes={particles.sizes}>
      <PointMaterial
        transparent
        color="#FF4500"
        size={0.3}
        sizeAttenuation={true}
        alphaTest={0.001}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Explosion effect
function ExplosionEffect({ trigger }: { trigger: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [isExploding, setIsExploding] = useState(false);
  
  useEffect(() => {
    if (trigger) {
      setIsExploding(true);
    }
  }, [trigger]);
  
  useFrame((state, delta) => {
    if (!groupRef.current || !isExploding) return;
    
    groupRef.current.children.forEach((child, index) => {
      const sphere = child as THREE.Mesh;
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2
      ).normalize();
      
      sphere.position.add(direction.multiplyScalar(delta * 20));
      sphere.scale.multiplyScalar(0.98);
      
      if (sphere.scale.x < 0.1) {
        sphere.position.set(0, 0, 0);
        sphere.scale.setScalar(1);
      }
    });
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: 50 }, (_, i) => (
        <Sphere key={i} args={[0.2]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            color={Math.random() > 0.5 ? "#FF6B00" : "#FF4500"} 
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
}

// Main 3D scene
function IntroScene({ stage }: { stage: number }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    if (stage === 1) {
      // Fire stage - camera shaking
      camera.position.x = Math.sin(state.clock.elapsedTime * 10) * 0.5;
      camera.position.y = Math.cos(state.clock.elapsedTime * 8) * 0.3;
    } else if (stage === 2) {
      // Explosion stage - dramatic zoom
      camera.position.z = 10 - state.clock.elapsedTime * 2;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#FF4500" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#FF6B00" />
      
      {stage === 0 && <BonfireParticles />}
      {stage === 1 && <BonfireParticles />}
      {stage === 2 && <ExplosionEffect trigger={true} />}
      
      {stage >= 2 && (
        <Text
          position={[0, 0, 0]}
          fontSize={3}
          color="#FF6B00"
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-bold.woff"
        >
          NEMI
        </Text>
      )}
    </>
  );
}

interface IntroLoaderProps {
  onComplete: () => void;
}

function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [stage, setStage] = useState(0); // 0: fire, 1: explosion, 2: blackout, 3: complete
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  useEffect(() => {
    // Create audio context for fire crackling sound
    const initAudio = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      
      // Generate fire crackling sound
      const createFireSound = () => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.3;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        noiseSource.start();
        noiseSource.stop(ctx.currentTime + 0.1);
      };
      
      // Play crackling sounds periodically
      const fireInterval = setInterval(() => {
        if (stage === 0) {
          createFireSound();
        }
      }, 200);
      
      setTimeout(() => clearInterval(fireInterval), 1500);
    };
    
    // FASTER Sequence timing with BONFIRE
    const sequence = async () => {
      // Stage 0: BONFIRE (1.5 seconds)
      setStage(0);
      initAudio();
      
      setTimeout(() => {
        // Stage 1: Explosion (0.5 seconds)
        setStage(1);
        
        setTimeout(() => {
          // Stage 2: Blackout (0.3 seconds)
          setStage(2);
          
          setTimeout(() => {
            // Stage 3: Complete - fade to main website
            setStage(3);
            setTimeout(() => {
              onComplete();
            }, 400);
          }, 300);
        }, 500);
      }, 1500);
    };
    
    sequence();
  }, [onComplete, stage]);
  
  return (
    <div className="intro-loader">
      {/* Fire stage background */}
      {stage === 0 && (
        <div className="fire-bg">
          <div className="fire-overlay"></div>
        </div>
      )}
      
      {/* Blackout stage */}
      {stage === 2 && (
        <div className="blackout-overlay">
          <div className="blackout-text">
            <h1 className="nemi-title">NEMI</h1>
            <p className="nemi-subtitle">Neural Edge Micro-Inspection</p>
          </div>
        </div>
      )}
      
      {/* 3D Scene */}
      {(stage === 0 || stage === 1) && (
        <div className="intro-3d-scene">
          <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <IntroScene stage={stage} />
          </Canvas>
        </div>
      )}
      
      {/* Fade out overlay */}
      {stage === 3 && (
        <div className="fade-out-overlay"></div>
      )}
    </div>
  );
}

export default IntroLoader;
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF, Environment, ContactShadows, Box, Sphere, Torus, Ring } from '@react-three/drei';
import * as THREE from 'three';

// Interactive Factory Robot (Bruno Simon style)
function InteractiveRobot({ position = [0, 0, 0], onClick }: { position?: [number, number, number]; onClick?: () => void }) {
  const robotRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  useFrame((state) => {
    if (!robotRef.current) return;
    
    // Floating animation
    robotRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    
    if (isActive) {
      // Spinning when active
      robotRef.current.rotation.y += 0.02;
    } else {
      // Idle rotation
      robotRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    
    // Scale on hover
    const targetScale = isHovered ? 1.2 : 1;
    robotRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const handleClick = () => {
    setIsActive(!isActive);
    onClick?.();
  };

  return (
    <group 
      ref={robotRef} 
      position={position}
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      {/* Robot Body */}
      <Box args={[1, 1.5, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={isActive ? "#FF6B00" : "#FF8A50"} 
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      
      {/* Robot Head */}
      <Sphere args={[0.4]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color={isActive ? "#D84315" : "#FF6B00"} 
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>
      
      {/* Robot Arms */}
      <Box args={[0.3, 1, 0.3]} position={[-0.8, 0, 0]}>
        <meshStandardMaterial color="#FF8A50" metalness={0.7} roughness={0.3} />
      </Box>
      <Box args={[0.3, 1, 0.3]} position={[0.8, 0, 0]}>
        <meshStandardMaterial color="#FF8A50" metalness={0.7} roughness={0.3} />
      </Box>
      
      {/* Robot Eyes */}
      <Sphere args={[0.1]} position={[-0.15, 1.1, 0.35]}>
        <meshStandardMaterial 
          color={isActive ? "#00FF00" : "#FDF6E3"} 
          emissive={isActive ? "#00FF00" : "#000000"}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere args={[0.1]} position={[0.15, 1.1, 0.35]}>
        <meshStandardMaterial 
          color={isActive ? "#00FF00" : "#FDF6E3"} 
          emissive={isActive ? "#00FF00" : "#000000"}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Activity indicator */}
      {isActive && (
        <Ring args={[0.6, 0.8]} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#FF6B00" transparent opacity={0.5} side={THREE.DoubleSide} />
        </Ring>
      )}
      
      {/* Floating label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
        font-family="Orbitron"
      >
        {isActive ? "PROCESSING..." : "CLICK ME!"}
      </Text>
    </group>
  );
}

// Interactive Factory Conveyor Belt
function InteractiveConveyor({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const conveyorRef = useRef<THREE.Group>(null);
  const boxesRef = useRef<THREE.Group>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  useFrame(() => {
    if (!boxesRef.current || !isRunning) return;
    
    // Move boxes along conveyor
    boxesRef.current.children.forEach((box, index) => {
      box.position.x += 0.02;
      if (box.position.x > 4) {
        box.position.x = -4;
      }
    });
  });

  return (
    <group ref={conveyorRef} position={position}>
      {/* Conveyor Belt */}
      <Box 
        args={[8, 0.2, 1]} 
        position={[0, 0, 0]}
        onClick={() => setIsRunning(!isRunning)}
      >
        <meshStandardMaterial 
          color="#8D6E63" 
          metalness={0.3}
          roughness={0.7}
        />
      </Box>
      
      {/* Moving boxes */}
      <group ref={boxesRef}>
        {Array.from({ length: 5 }, (_, i) => (
          <Box 
            key={i}
            args={[0.5, 0.5, 0.5]} 
            position={[-4 + i * 2, 0.4, 0]}
          >
            <meshStandardMaterial 
              color={isRunning ? "#FF6B00" : "#D84315"} 
              metalness={0.5}
              roughness={0.4}
            />
          </Box>
        ))}
      </group>
      
      {/* Status indicator */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color={isRunning ? "#FF6B00" : "#8D6E63"}
        anchorX="center"
        anchorY="middle"
      >
        {isRunning ? "RUNNING" : "CLICK TO START"}
      </Text>
    </group>
  );
}

// Interactive AI Brain Visualization
function InteractiveAIBrain({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const brainRef = useRef<THREE.Group>(null);
  const [neurons, setNeurons] = useState<Array<{ x: number; y: number; z: number; active: boolean }>>([]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Generate random neuron positions
    const newNeurons = Array.from({ length: 20 }, () => ({
      x: (Math.random() - 0.5) * 3,
      y: (Math.random() - 0.5) * 3,
      z: (Math.random() - 0.5) * 3,
      active: false
    }));
    setNeurons(newNeurons);
  }, []);

  useFrame(() => {
    if (!brainRef.current) return;
    
    // Gentle rotation
    brainRef.current.rotation.y += 0.005;
    
    if (isThinking) {
      // Animate neuron activity
      setNeurons(prev => prev.map(neuron => ({
        ...neuron,
        active: Math.random() > 0.7
      })));
    }
  });

  return (
    <group 
      ref={brainRef} 
      position={position}
      onClick={() => setIsThinking(!isThinking)}
    >
      {/* Brain structure */}
      <Sphere args={[1.5]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#FF8A50" 
          transparent 
          opacity={0.3}
          metalness={0.1}
          roughness={0.9}
        />
      </Sphere>
      
      {/* Neurons */}
      {neurons.map((neuron, index) => (
        <Sphere 
          key={index}
          args={[0.1]} 
          position={[neuron.x, neuron.y, neuron.z]}
        >
          <meshStandardMaterial 
            color={neuron.active ? "#FF6B00" : "#D84315"}
            emissive={neuron.active ? "#FF6B00" : "#000000"}
            emissiveIntensity={neuron.active ? 0.5 : 0}
          />
        </Sphere>
      ))}
      
      {/* Neural connections - simplified */}
      {neurons.map((neuron, index) => {
        if (index === 0) return null;
        const prevNeuron = neurons[index - 1];
        const midPoint = [
          (prevNeuron.x + neuron.x) / 2,
          (prevNeuron.y + neuron.y) / 2,
          (prevNeuron.z + neuron.z) / 2
        ];
        return (
          <Box
            key={`connection-${index}`}
            args={[0.02, 0.02, 2]}
            position={midPoint as [number, number, number]}
            lookAt={[neuron.x, neuron.y, neuron.z]}
          >
            <meshBasicMaterial
              color={neuron.active && prevNeuron.active ? "#FF6B00" : "#D84315"}
              transparent
              opacity={0.6}
            />
          </Box>
        );
      })}
      
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
      >
        {isThinking ? "AI THINKING..." : "CLICK TO ACTIVATE AI"}
      </Text>
    </group>
  );
}

// Interactive Data Cube (Bruno Simon style)
function InteractiveDataCube({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const cubeRef = useRef<THREE.Mesh>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [dataPoints, setDataPoints] = useState(0);

  useFrame((state) => {
    if (!cubeRef.current) return;
    
    if (isScanning) {
      // Rapid rotation when scanning
      cubeRef.current.rotation.x += 0.03;
      cubeRef.current.rotation.y += 0.02;
      cubeRef.current.rotation.z += 0.01;
    } else {
      // Gentle floating
      cubeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      cubeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    }
  });

  const handleClick = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setDataPoints(Math.floor(Math.random() * 1000) + 500);
    }
  };

  return (
    <group>
      <mesh 
        ref={cubeRef} 
        position={position}
        onClick={handleClick}
      >
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial 
          color={isScanning ? "#FF4500" : "#FF6B00"}
          transparent
          opacity={isScanning ? 0.8 : 0.6}
          wireframe={isScanning}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Data visualization particles */}
      {isScanning && Array.from({ length: 50 }, (_, i) => (
        <Sphere key={i} args={[0.05]} position={[
          position[0] + (Math.random() - 0.5) * 3,
          position[1] + (Math.random() - 0.5) * 3,
          position[2] + (Math.random() - 0.5) * 3
        ]}>
          <meshBasicMaterial 
            color="#FF6B00" 
            transparent 
            opacity={0.8}
          />
        </Sphere>
      ))}
      
      <Text
        position={[position[0], position[1] - 2, position[2]]}
        fontSize={0.25}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
      >
        {isScanning ? `SCANNING... ${dataPoints} DATA POINTS` : "CLICK TO SCAN DATA"}
      </Text>
    </group>
  );
}

// Interactive Network Nodes
function InteractiveNetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const [connections, setConnections] = useState<Array<{ from: number; to: number; active: boolean }>>([]);
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; z: number; active: boolean }>>([]);

  useEffect(() => {
    // Initialize nodes in a network pattern
    const newNodes = [
      { x: -3, y: 2, z: 0, active: false },   // Japan node 1
      { x: -1, y: 1, z: -2, active: false }, // Japan node 2
      { x: 0, y: 0, z: 0, active: true },    // Central coordinator
      { x: 1, y: 1, z: 2, active: false },   // India node 1
      { x: 3, y: 2, z: 0, active: false },   // India node 2
    ];
    setNodes(newNodes);

    // Create connections
    const newConnections = [
      { from: 0, to: 2, active: false },
      { from: 1, to: 2, active: false },
      { from: 2, to: 3, active: false },
      { from: 2, to: 4, active: false },
    ];
    setConnections(newConnections);
  }, []);

  const activateNetwork = () => {
    // Simulate data flow through network
    setConnections(prev => prev.map(conn => ({ ...conn, active: true })));
    setNodes(prev => prev.map(node => ({ ...node, active: true })));
    
    setTimeout(() => {
      setConnections(prev => prev.map(conn => ({ ...conn, active: false })));
      setNodes(prev => prev.map((node, index) => ({ 
        ...node, 
        active: index === 2 // Keep coordinator active
      })));
    }, 3000);
  };

  return (
    <group ref={groupRef} onClick={activateNetwork}>
      {/* Render nodes */}
      {nodes.map((node, index) => (
        <Sphere key={index} args={[0.3]} position={[node.x, node.y, node.z]}>
          <meshStandardMaterial 
            color={node.active ? "#FF4500" : "#FF8A50"}
            emissive={node.active ? "#FF6B00" : "#000000"}
            emissiveIntensity={node.active ? 0.3 : 0}
          />
        </Sphere>
      ))}
      
      {/* Render connections */}
      {connections.map((conn, index) => {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        if (!fromNode || !toNode) return null;
        
        return (
          <line key={index}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  fromNode.x, fromNode.y, fromNode.z,
                  toNode.x, toNode.y, toNode.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color={conn.active ? "#FF4500" : "#D84315"}
              transparent
              opacity={conn.active ? 1 : 0.4}
            />
          </line>
        );
      })}
      
      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
      >
        INTERACTIVE NETWORK - CLICK TO ACTIVATE
      </Text>
    </group>
  );
}

// Main Interactive 3D Scene Component
interface Interactive3DSceneProps {
  title: string;
  description: string;
  onInteraction?: (type: string) => void;
}

function Interactive3DScene({ title, description, onInteraction }: Interactive3DSceneProps) {
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastInteraction, setLastInteraction] = useState<string>('');

  const handleInteraction = (type: string) => {
    setInteractionCount(prev => prev + 1);
    setLastInteraction(type);
    onInteraction?.(type);
  };

  return (
    <div className="lunar-panel p-8 interactive-element">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-orbitron font-bold lunar-gradient mb-3">
          {title}
        </h2>
        <p className="text-secondary font-inter text-base">
          {description}
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-sm font-inter">
          <span className="text-muted">Interactions: <span className="text-fire-orange font-semibold">{interactionCount}</span></span>
          {lastInteraction && (
            <span className="text-muted">Last: <span className="text-deep-orange font-semibold">{lastInteraction}</span></span>
          )}
        </div>
      </div>
      
      <div className="h-96 bg-warm-cream rounded-xl overflow-hidden border border-fire-orange/20">
        <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#FF6B00" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF8A50" />
          
          <InteractiveRobot 
            position={[-3, 0, 0]} 
            onClick={() => handleInteraction('Robot Activated')}
          />
          <InteractiveConveyor position={[0, -1, 2]} />
          <InteractiveDataCube position={[3, 1, -1]} />
          <InteractiveNetworkNodes />
          
          <ContactShadows 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={4.5} 
            resolution={256} 
            color="#FF6B00" 
          />
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={5}
            maxDistance={15}
            autoRotate={false}
          />
        </Canvas>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="lunar-metric-card p-4">
          <h4 className="font-orbitron font-bold text-fire-orange mb-2">🤖 Interactive Robot</h4>
          <p className="text-xs text-muted font-inter">Click to activate AI processing simulation</p>
        </div>
        <div className="lunar-metric-card p-4">
          <h4 className="font-orbitron font-bold text-deep-orange mb-2">📊 Data Cube</h4>
          <p className="text-xs text-muted font-inter">Click to scan and analyze factory data</p>
        </div>
        <div className="lunar-metric-card p-4">
          <h4 className="font-orbitron font-bold text-accent-orange mb-2">🌐 Network Nodes</h4>
          <p className="text-xs text-muted font-inter">Click to activate federated learning</p>
        </div>
      </div>
    </div>
  );
}

export default Interactive3DScene;
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, ContactShadows, useKeyboardControls, KeyboardControls, useCursor } from '@react-three/drei';
import * as THREE from 'three';

// Interactive Factory Robot (like Bruno Simon's car)
function InteractiveFactoryRobot() {
  const robotRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState(new THREE.Vector3(0, 1, 0));
  const [isMoving, setIsMoving] = useState(false);
  const [defectsScanned, setDefectsScanned] = useState(0);
  const speed = 0.1;
  
  // Keyboard controls setup
  const [subscribeKeys, getKeys] = useKeyboardControls();
  
  useFrame(() => {
    if (!robotRef.current) return;
    
    const { forward, backward, leftward, rightward, scan } = getKeys();
    
    let moved = false;
    const newPosition = position.clone();
    
    if (forward) {
      newPosition.z -= speed;
      moved = true;
    }
    if (backward) {
      newPosition.z += speed;
      moved = true;
    }
    if (leftward) {
      newPosition.x -= speed;
      moved = true;
    }
    if (rightward) {
      newPosition.x += speed;
      moved = true;
    }
    
    // Boundary constraints
    newPosition.x = Math.max(-12, Math.min(12, newPosition.x));
    newPosition.z = Math.max(-12, Math.min(12, newPosition.z));
    
    setPosition(newPosition);
    robotRef.current.position.copy(newPosition);
    
    // Scanning animation
    if (scan && Math.random() > 0.95) {
      setDefectsScanned(prev => prev + 1);
    }
    
    setIsMoving(moved);
    
    // Rotation based on movement
    if (forward) robotRef.current.rotation.y = 0;
    if (backward) robotRef.current.rotation.y = Math.PI;
    if (leftward) robotRef.current.rotation.y = Math.PI / 2;
    if (rightward) robotRef.current.rotation.y = -Math.PI / 2;
  });

  return (
    <group ref={robotRef} position={[0, 1, 0]}>
      {/* Robot Body */}
      <mesh>
        <boxGeometry args={[2, 1, 3]} />
        <meshStandardMaterial 
          color={isMoving ? "#FF4500" : "#FF6B00"} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Robot Head with AI Sensor */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.6]} />
        <meshStandardMaterial 
          color="#FF8A50"
          emissive={isMoving ? "#FF6B00" : "#000000"}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* AI Scanner Array */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            Math.sin((i / 8) * Math.PI * 2) * 0.4,
            1.2,
            Math.cos((i / 8) * Math.PI * 2) * 0.4
          ]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
          <meshStandardMaterial 
            color="#00FF00"
            emissive="#00FF00"
            emissiveIntensity={isMoving ? 0.8 : 0.2}
          />
        </mesh>
      ))}
      
      {/* Wheels */}
      {[[-0.8, -0.5, 1], [0.8, -0.5, 1], [-0.8, -0.5, -1], [0.8, -0.5, -1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2]} />
          <meshStandardMaterial color="#2C1810" />
        </mesh>
      ))}
      
      {/* Floating status text */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
      >
        DEFECTS: {defectsScanned} | {isMoving ? "SCANNING..." : "USE WASD TO DRIVE"}
      </Text>
    </group>
  );
}

// Interactive Conveyor Belt System
function InteractiveConveyorBelt({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const conveyorRef = useRef<THREE.Group>(null);
  const boxesRef = useRef<THREE.Group>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  useFrame(() => {
    if (!boxesRef.current || !isRunning) return;
    
    // Move boxes along conveyor
    boxesRef.current.children.forEach((box) => {
      box.position.x += 0.02 * speed;
      if (box.position.x > 6) {
        box.position.x = -6;
      }
    });
  });

  return (
    <group ref={conveyorRef} position={position}>
      {/* Conveyor Belt */}
      <mesh 
        position={[0, 0, 0]}
        onClick={() => setIsRunning(!isRunning)}
      >
        <boxGeometry args={[12, 0.3, 2]} />
        <meshStandardMaterial 
          color="#8D6E63" 
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Moving boxes */}
      <group ref={boxesRef}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh 
            key={i}
            position={[-6 + i * 2, 0.5, 0]}
          >
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial 
              color={isRunning ? "#FF6B00" : "#D84315"} 
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
      
      {/* Speed control */}
      <mesh 
        position={[6.5, 1, 0]}
        onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 0.5 : 1)}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.8]} />
        <meshStandardMaterial color="#FF8A50" />
      </mesh>
      
      {/* Status indicator */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color={isRunning ? "#FF6B00" : "#8D6E63"}
        anchorX="center"
        anchorY="middle"
      >
        {isRunning ? `RUNNING ${speed}x` : "CLICK TO START"}
      </Text>
    </group>
  );
}

// Draggable AI Edge Computing Nodes
function DraggableAINode({ initialPosition, id }: { initialPosition: [number, number, number]; id: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(new THREE.Vector3(...initialPosition));
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { camera, gl } = useThree();
  
  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    setIsDragging(true);
    setIsProcessing(true);
    gl.domElement.style.cursor = 'grabbing';
  };
  
  const handlePointerUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsProcessing(false), 2000);
    gl.domElement.style.cursor = 'auto';
  };
  
  const handlePointerMove = (event: any) => {
    if (!isDragging || !meshRef.current) return;
    
    const newPosition = new THREE.Vector3();
    newPosition.setFromMatrixPosition(meshRef.current.matrixWorld);
    newPosition.x = (event.clientX / window.innerWidth) * 20 - 10;
    newPosition.z = -(event.clientY / window.innerHeight) * 20 + 10;
    setPosition(newPosition);
  };
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Update position
    meshRef.current.position.copy(position);
    
    // Floating animation
    meshRef.current.position.y = initialPosition[1] + Math.sin(state.clock.elapsedTime * 2 + initialPosition[0]) * 0.2;
    
    if (isProcessing) {
      // Processing animation
      meshRef.current.rotation.y += 0.05;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.1;
    } else {
      // Idle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.rotation.z = 0;
    }
  });
  
  useCursor(isDragging);

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <octahedronGeometry args={[0.8]} />
        <meshStandardMaterial 
          color={isProcessing ? "#FF4500" : "#FF6B00"}
          emissive={isProcessing ? "#FF6B00" : "#000000"}
          emissiveIntensity={isProcessing ? 0.5 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Data flow visualization */}
      {isProcessing && Array.from({ length: 15 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            position.x + (Math.random() - 0.5) * 2,
            position.y + (Math.random() - 0.5) * 2,
            position.z + (Math.random() - 0.5) * 2
          ]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#00FF00" />
        </mesh>
      ))}
      
      <Text
        position={[position.x, position.y - 1.5, position.z]}
        fontSize={0.2}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
      >
        AI NODE {id} - {isProcessing ? "PROCESSING" : "DRAG ME"}
      </Text>
    </group>
  );
}

// Interactive Security Camera System
function InteractiveSecurityCamera({ position }: { position: [number, number, number] }) {
  const cameraRef = useRef<THREE.Group>(null);
  const [isActive, setIsActive] = useState(false);
  const [scanAngle, setScanAngle] = useState(0);
  const [detectionZone, setDetectionZone] = useState<Array<{x: number; z: number; type: string}>>([]);
  
  useFrame(() => {
    if (!cameraRef.current) return;
    
    if (isActive) {
      // Auto-scanning motion
      const newAngle = Math.sin(Date.now() * 0.002) * Math.PI * 0.5;
      setScanAngle(newAngle);
      cameraRef.current.rotation.y = newAngle;
      
      // Simulate detection
      if (Math.random() > 0.98) {
        setDetectionZone([
          { x: Math.random() * 10 - 5, z: Math.random() * 10 - 5, type: 'violation' }
        ]);
        setTimeout(() => setDetectionZone([]), 3000);
      }
    }
  });

  return (
    <group>
      {/* Camera mount */}
      <mesh position={position}>
        <cylinderGeometry args={[0.2, 0.2, 3]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      
      {/* Camera head */}
      <group ref={cameraRef} position={[position[0], position[1] + 1.5, position[2]]}>
        <mesh onClick={() => setIsActive(!isActive)}>
          <boxGeometry args={[0.8, 0.4, 0.6]} />
          <meshStandardMaterial 
            color={isActive ? "#FF6B00" : "#D84315"}
            emissive={isActive ? "#FF4500" : "#000000"}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Camera lens */}
        <mesh position={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1]} />
          <meshStandardMaterial 
            color="#000000"
            emissive={isActive ? "#00FF00" : "#000000"}
            emissiveIntensity={isActive ? 0.8 : 0}
          />
        </mesh>
        
        {/* Scanning laser beam */}
        {isActive && (
          <mesh position={[0, 0, 2]} rotation={[0, 0, scanAngle]}>
            <planeGeometry args={[0.1, 8]} />
            <meshBasicMaterial 
              color="#FF0000" 
              transparent 
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
      
      {/* Detection zones */}
      {detectionZone.map((zone, index) => (
        <mesh key={index} position={[zone.x, 0.1, zone.z]}>
          <ringGeometry args={[0.8, 1.2]} />
          <meshBasicMaterial color="#FF0000" transparent opacity={0.7} />
        </mesh>
      ))}
      
      <Text
        position={[position[0], position[1] + 3.5, position[2]]}
        fontSize={0.25}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
      >
        SECURITY CAM - {isActive ? "SCANNING" : "CLICK TO ACTIVATE"}
      </Text>
    </group>
  );
}

// Interactive Factory Equipment
function InteractiveEquipment() {
  const [machines, setMachines] = useState([
    { id: 'press', position: [-6, 1, -4], active: false, type: 'Hydraulic Press' },
    { id: 'mill', position: [6, 1, -4], active: false, type: 'CNC Mill' },
    { id: 'welder', position: [-6, 1, 4], active: false, type: 'Robotic Welder' },
    { id: 'sorter', position: [6, 1, 4], active: false, type: 'AI Sorter' },
  ]);

  const toggleMachine = (id: string) => {
    setMachines(prev => prev.map(machine => 
      machine.id === id ? { ...machine, active: !machine.active } : machine
    ));
  };

  return (
    <group>
      {machines.map((machine) => (
        <group key={machine.id}>
          <mesh 
            position={machine.position as [number, number, number]}
            onClick={() => toggleMachine(machine.id)}
          >
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial 
              color={machine.active ? "#FF4500" : "#FF8A50"}
              metalness={0.6}
              roughness={0.4}
              emissive={machine.active ? "#FF6B00" : "#000000"}
              emissiveIntensity={machine.active ? 0.2 : 0}
            />
          </mesh>
          
          {/* Machine indicator light */}
          <mesh position={[machine.position[0], machine.position[1] + 1.2, machine.position[2]]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color={machine.active ? "#00FF00" : "#FF0000"}
              emissive={machine.active ? "#00FF00" : "#FF0000"}
              emissiveIntensity={0.8}
            />
          </mesh>
          
          {/* Working animation */}
          {machine.active && (
            <mesh 
              position={[machine.position[0], machine.position[1] + 2, machine.position[2]]}
              rotation={[0, Date.now() * 0.01, 0]}
            >
              <torusGeometry args={[0.5, 0.1]} />
              <meshBasicMaterial color="#FF6B00" transparent opacity={0.6} />
            </mesh>
          )}
          
          <Text
            position={[machine.position[0], machine.position[1] + 3, machine.position[2]]}
            fontSize={0.25}
            color="#FF6B00"
            anchorX="center"
            anchorY="middle"
          >
            {machine.type} - {machine.active ? "WORKING" : "CLICK TO START"}
          </Text>
        </group>
      ))}
    </group>
  );
}

// Interactive Quality Inspector Tool
function InteractiveQualityTool() {
  const toolRef = useRef<THREE.Group>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qualityScore, setQualityScore] = useState(95.5);
  const [position, setPosition] = useState(new THREE.Vector3(3, 2, 3));
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (!toolRef.current) return;
    
    // Follow mouse when scanning
    if (isScanning) {
      const newPosition = new THREE.Vector3(
        mouse.x * 8,
        2 + Math.sin(state.clock.elapsedTime * 4) * 0.2,
        mouse.y * 8
      );
      setPosition(newPosition);
      toolRef.current.position.copy(newPosition);
      
      // Update quality score
      if (Math.random() > 0.9) {
        setQualityScore(90 + Math.random() * 10);
      }
    } else {
      // Floating animation
      toolRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <group>
      <group ref={toolRef}>
        <mesh 
          onClick={() => setIsScanning(!isScanning)}
          onPointerOver={() => useCursor(true)}
          onPointerOut={() => useCursor(false)}
        >
          <coneGeometry args={[0.3, 1.5]} />
          <meshStandardMaterial 
            color={isScanning ? "#00FF00" : "#FF6B00"}
            emissive={isScanning ? "#00FF00" : "#000000"}
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Quality scanner beam */}
        {isScanning && (
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.1, 0.5, 2]} />
            <meshBasicMaterial 
              color="#00FF00" 
              transparent 
              opacity={0.6}
            />
          </mesh>
        )}
      </group>
      
      <Text
        position={[position.x, position.y + 2, position.z]}
        fontSize={0.25}
        color="#FF6B00"
        anchorX="center"
        anchorY="middle"
      >
        QUALITY: {qualityScore.toFixed(1)}% - {isScanning ? "SCANNING" : "CLICK & MOVE MOUSE"}
      </Text>
    </group>
  );
}

// Factory Floor with Interactive Elements
function FactoryFloor() {
  return (
    <group>
      {/* Main floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[30, 1, 30]} />
        <meshStandardMaterial 
          color="#FDF6E3" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Factory grid lines */}
      {Array.from({ length: 31 }, (_, i) => (
        <group key={i}>
          <mesh position={[-15 + i, 0.01, 0]}>
            <boxGeometry args={[0.05, 0.01, 30]} />
            <meshBasicMaterial color="#FF6B00" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, 0.01, -15 + i]}>
            <boxGeometry args={[30, 0.01, 0.05]} />
            <meshBasicMaterial color="#FF6B00" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
      
      {/* Interactive workstations */}
      {[[-8, 0, -8], [8, 0, -8], [-8, 0, 8], [8, 0, 8]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[1.5, 1.5, 0.2]} />
          <meshStandardMaterial color="#E55100" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Main Bruno Style Factory Scene
function BrunoStyleFactory() {
  const [instructions, setInstructions] = useState(true);
  const [stats, setStats] = useState({
    robotPosition: "Center",
    machinesActive: 0,
    qualityScore: 95.5,
    securityAlerts: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => setInstructions(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  const controlsMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'scan', keys: ['Space'] },
  ];

  return (
    <div className="lunar-panel p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-orbitron font-black hero-title mb-3">
          🏭 Interactive Factory Intelligence Playground
        </h2>
        <p className="text-secondary font-inter text-lg subtitle-glow mb-4">
          Experience NEMI like Bruno Simon's portfolio! Drive robots, control machines, and interact with AI systems.
        </p>
        
        {instructions && (
          <div className="bruno-button text-sm py-3 px-6 mb-4 bg-fire-orange/20 border border-fire-orange/50 animate-pulse">
            🎮 Use WASD to drive robot • Click machines • Drag AI nodes • Mouse to control scanner
          </div>
        )}
      </div>

      <div className="h-[700px] bg-warm-cream rounded-2xl overflow-hidden border-2 border-fire-orange/20 glow-orange">
        <KeyboardControls map={controlsMap}>
          <Canvas camera={{ position: [15, 12, 15], fov: 60 }} shadows>
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1} 
              color="#FF6B00"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[5, 10, 5]} intensity={0.8} color="#FF8A50" />
            <pointLight position={[-5, 10, -5]} intensity={0.6} color="#FF6B00" />
            
            <FactoryFloor />
            <InteractiveFactoryRobot />
            <InteractiveConveyorBelt position={[0, 0.5, -8]} />
            <InteractiveEquipment />
            <InteractiveQualityTool />
            <InteractiveSecurityCamera position={[-10, 6, -10]} />
            <InteractiveSecurityCamera position={[10, 6, 10]} />
            
            {/* Draggable AI Nodes */}
            <DraggableAINode initialPosition={[-4, 3, 0]} id="01" />
            <DraggableAINode initialPosition={[4, 3, 0]} id="02" />
            <DraggableAINode initialPosition={[0, 4, -6]} id="03" />
            <DraggableAINode initialPosition={[0, 4, 6]} id="04" />
            
            <ContactShadows 
              opacity={0.4} 
              scale={50} 
              blur={2} 
              far={10} 
              resolution={256} 
              color="#FF6B00" 
            />
            
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={8}
              maxDistance={30}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>
        </KeyboardControls>
      </div>

      {/* Interactive Stats Dashboard */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lunar-metric-card p-4 text-center interactive-element">
          <h4 className="font-orbitron font-bold text-fire-orange mb-2">🤖 AI Factory Robot</h4>
          <p className="text-xs text-muted font-inter mb-2">WASD to drive around factory</p>
          <div className="text-lg font-bold text-primary">Ready to Scan</div>
        </div>
        <div className="lunar-metric-card p-4 text-center interactive-element">
          <h4 className="font-orbitron font-bold text-deep-orange mb-2">🏭 Smart Machines</h4>
          <p className="text-xs text-muted font-inter mb-2">Click machines to activate</p>
          <div className="text-lg font-bold text-primary">{stats.machinesActive}/4 Running</div>
        </div>
        <div className="lunar-metric-card p-4 text-center interactive-element">
          <h4 className="font-orbitron font-bold text-accent-orange mb-2">🔧 Edge AI Nodes</h4>
          <p className="text-xs text-muted font-inter mb-2">Drag nodes to reposition</p>
          <div className="text-lg font-bold text-primary">4 Deployable</div>
        </div>
        <div className="lunar-metric-card p-4 text-center interactive-element">
          <h4 className="font-orbitron font-bold text-rust-orange mb-2">📹 Security System</h4>
          <p className="text-xs text-muted font-inter mb-2">Cameras monitor compliance</p>
          <div className="text-lg font-bold text-primary">360° Coverage</div>
        </div>
      </div>

      {/* Interactive Controls Guide */}
      <div className="mt-8 lunar-panel p-6 bg-gradient-to-r from-fire-orange/5 to-accent-orange/5">
        <h3 className="font-orbitron font-bold text-fire-orange mb-6 text-center text-xl">
          🎮 Interactive Factory Experience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm font-inter">
          <div className="text-center">
            <div className="w-16 h-16 bg-fire-orange/20 rounded-full flex items-center justify-center mx-auto mb-3 hover-lift">
              <span className="text-fire-orange font-bold text-2xl">🤖</span>
            </div>
            <h4 className="font-semibold text-primary mb-2">Drive AI Robot</h4>
            <div className="space-y-1 text-muted">
              <p><kbd className="bg-fire-orange/20 px-2 py-1 rounded">W</kbd> Forward</p>
              <p><kbd className="bg-fire-orange/20 px-2 py-1 rounded">S</kbd> Backward</p>
              <p><kbd className="bg-fire-orange/20 px-2 py-1 rounded">A</kbd><kbd className="bg-fire-orange/20 px-2 py-1 rounded">D</kbd> Turn</p>
              <p><kbd className="bg-fire-orange/20 px-2 py-1 rounded">SPACE</kbd> Scan</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-deep-orange/20 rounded-full flex items-center justify-center mx-auto mb-3 hover-lift">
              <span className="text-deep-orange font-bold text-2xl">🏭</span>
            </div>
            <h4 className="font-semibold text-primary mb-2">Control Machines</h4>
            <p className="text-muted">Click on factory equipment to activate. Watch hydraulic presses, CNC mills, and robotic welders</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-orange/20 rounded-full flex items-center justify-center mx-auto mb-3 hover-lift">
              <span className="text-accent-orange font-bold text-2xl">🔧</span>
            </div>
            <h4 className="font-semibold text-primary mb-2">Drag AI Nodes</h4>
            <p className="text-muted">Drag floating AI edge computing nodes to optimize factory coverage and processing</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-rust-orange/20 rounded-full flex items-center justify-center mx-auto mb-3 hover-lift">
              <span className="text-rust-orange font-bold text-2xl">📹</span>
            </div>
            <h4 className="font-semibold text-primary mb-2">Security Cameras</h4>
            <p className="text-muted">Activate security cameras to scan for compliance violations with laser detection</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrunoStyleFactory;
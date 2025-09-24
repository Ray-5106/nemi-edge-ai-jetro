import React, { useState, useEffect, useRef } from 'react';
import { Microscope, Zap, Target, AlertTriangle, Search, Settings, Eye, Maximize } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { useNEMI } from '../../context/NEMIContext';
import BrunoStyleFactory from '../interactive/BrunoStyleFactory';

interface MicroDefect {
  id: string;
  type: 'scratch' | 'pit' | 'crack' | 'contamination' | 'discoloration';
  position: [number, number, number];
  size: number; // in micrometers
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  timestamp: Date;
  description: string;
}

// 3D Surface component with defects
function Surface({ defects }: { defects: MicroDefect[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const getDefectColor = (type: string) => {
    switch (type) {
      case 'scratch': return '#FF10F0';
      case 'pit': return '#FF6B00';
      case 'crack': return '#FFEAA7';
      case 'contamination': return '#39FF14';
      case 'discoloration': return '#00E5FF';
      default: return '#FFFFFF';
    }
  };

  return (
    <group>
      {/* Main surface */}
      <Box ref={meshRef} args={[10, 0.2, 10]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#404040" 
          metalness={0.8} 
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </Box>
      
      {/* Grid lines for scale */}
      {Array.from({ length: 21 }, (_, i) => (
        <group key={i}>
          <Box args={[0.01, 0.01, 10]} position={[-5 + i * 0.5, 0.11, 0]}>
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.3} />
          </Box>
          <Box args={[10, 0.01, 0.01]} position={[0, 0.11, -5 + i * 0.5]}>
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.3} />
          </Box>
        </group>
      ))}

      {/* Defects visualization */}
      {defects.map((defect) => (
        <group key={defect.id} position={defect.position}>
          {/* Defect marker */}
          <Sphere args={[0.1 + defect.size * 0.001]}>
            <meshStandardMaterial 
              color={getDefectColor(defect.type)} 
              emissive={getDefectColor(defect.type)}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </Sphere>
          
          {/* Scanning ring animation */}
          <Ring args={[0.2, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial 
              color={getDefectColor(defect.type)} 
              transparent 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </Ring>
          
          {/* Defect label */}
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.15}
            color={getDefectColor(defect.type)}
            anchorX="center"
            anchorY="middle"
          >
            {defect.type.toUpperCase()}
            {'\n'}
            {defect.size.toFixed(2)}μm
          </Text>
        </group>
      ))}

      {/* Scale reference */}
      <Text
        position={[-4.5, -1, 0]}
        fontSize={0.2}
        color="#00E5FF"
        anchorX="left"
        anchorY="middle"
      >
        Scale: 1 unit = 1μm
      </Text>
    </group>
  );
}

// Scanning laser animation
function ScanningLaser() {
  const laserRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (laserRef.current) {
      const time = state.clock.elapsedTime;
      laserRef.current.position.x = Math.sin(time * 2) * 4;
      laserRef.current.position.z = Math.cos(time * 1.5) * 4;
    }
  });

  return (
    <group ref={laserRef}>
      {/* Laser beam */}
      <Box args={[0.05, 10, 0.05]} position={[0, 5, 0]}>
        <meshBasicMaterial color="#39FF14" transparent opacity={0.8} />
      </Box>
      
      {/* Laser source */}
      <Sphere args={[0.2]} position={[0, 10, 0]}>
        <meshBasicMaterial color="#39FF14" />
      </Sphere>
      
      {/* Scan point on surface */}
      <Sphere args={[0.15]} position={[0, 0.15, 0]}>
        <meshBasicMaterial color="#39FF14" transparent opacity={0.9} />
      </Sphere>
      
      {/* Scanning ripple effect */}
      <Ring args={[0.3, 0.4]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <meshBasicMaterial color="#39FF14" transparent opacity={0.4} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
}

function MicroDefectDetection() {
  const { state } = useNEMI();
  const [detectedDefects, setDetectedDefects] = useState<MicroDefect[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<MicroDefect | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [magnification, setMagnification] = useState(1000);
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.5);

  // Generate random micro defects
  const generateDefects = () => {
    const defectTypes: MicroDefect['type'][] = ['scratch', 'pit', 'crack', 'contamination', 'discoloration'];
    const newDefects: MicroDefect[] = [];
    
    for (let i = 0; i < 8; i++) {
      const defect: MicroDefect = {
        id: `defect_${Date.now()}_${i}`,
        type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
        position: [
          (Math.random() - 0.5) * 8,
          0.15 + Math.random() * 0.1,
          (Math.random() - 0.5) * 8
        ],
        size: 0.5 + Math.random() * 4.5, // 0.5-5 micrometers
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        confidence: 0.8 + Math.random() * 0.2,
        timestamp: new Date(),
        description: ''
      };
      
      // Generate description based on type
      switch (defect.type) {
        case 'scratch':
          defect.description = `Linear surface damage ${defect.size.toFixed(2)}μm deep`;
          break;
        case 'pit':
          defect.description = `Circular depression ${defect.size.toFixed(2)}μm diameter`;
          break;
        case 'crack':
          defect.description = `Surface fracture ${defect.size.toFixed(2)}μm width`;
          break;
        case 'contamination':
          defect.description = `Foreign particle ${defect.size.toFixed(2)}μm size`;
          break;
        case 'discoloration':
          defect.description = `Color variation ${defect.size.toFixed(2)}μm area`;
          break;
      }
      
      newDefects.push(defect);
    }
    
    return newDefects;
  };

  // Start scanning simulation
  const startScanning = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanningProgress(0);
    setDetectedDefects([]);
    
    const totalDefects = generateDefects();
    
    // Simulate progressive detection
    for (let i = 0; i <= 100; i += 2) {
      setScanningProgress(i);
      
      // Reveal defects progressively
      const defectsToReveal = Math.floor((i / 100) * totalDefects.length);
      setDetectedDefects(totalDefects.slice(0, defectsToReveal));
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsScanning(false);
  };

  const DefectCard = ({ defect }: { defect: MicroDefect }) => {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'high': return 'text-neon-pink border-neon-pink';
        case 'medium': return 'text-bright-yellow border-bright-yellow';
        case 'low': return 'text-neon-green border-neon-green';
        default: return 'text-gray-400 border-gray-400';
      }
    };

    return (
      <div 
        className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-300 ${
          selectedDefect?.id === defect.id ? 'bg-neon-cyan/20 border-neon-cyan' : 'bg-gray-panel/50 ' + getSeverityColor(defect.severity)
        }`}
        onClick={() => setSelectedDefect(defect)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-orbitron font-bold text-sm uppercase">
            {defect.type}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(defect.severity)} bg-opacity-20`}>
            {defect.severity.toUpperCase()}
          </span>
        </div>
        <div className="space-y-1 text-xs font-roboto-mono">
          <div className="flex justify-between">
            <span className="text-gray-400">Size:</span>
            <span className="text-white">{defect.size.toFixed(2)} μm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Confidence:</span>
            <span className="text-neon-cyan">{(defect.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Position:</span>
            <span className="text-white">
              [{defect.position[0].toFixed(1)}, {defect.position[2].toFixed(1)}]
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{defect.description}</p>
      </div>
    );
  };

  const MetricDisplay = ({ label, value, unit, icon: Icon, color }: any) => (
    <div className="metric-card">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-roboto-mono text-gray-300">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
            Micro-Defect Detection
          </h1>
          <p className="text-gray-400 font-roboto-mono text-sm">
            Sub-millimeter precision defect analysis with 3D visualization
          </p>
        </div>
        <button
          onClick={startScanning}
          disabled={isScanning}
          className={`edge-ai-button ${
            isScanning 
              ? 'border-bright-yellow text-bright-yellow cursor-not-allowed opacity-50'
              : 'border-neon-green text-neon-green hover:bg-neon-green'
          }`}
        >
          <Search className="w-4 h-4 mr-2" />
          {isScanning ? 'SCANNING...' : 'START SCAN'}
        </button>
      </div>

      {/* Scanning Status */}
      {isScanning && (
        <div className="glass-panel p-4 rounded-lg bg-gradient-to-r from-neon-green/20 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <span className="font-orbitron font-bold text-neon-green">
              Micro-Scanning in Progress
            </span>
            <span className="text-neon-green font-roboto-mono">
              {scanningProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-green to-neon-cyan h-2 rounded-full transition-all duration-100"
              style={{ width: `${scanningProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visualization */}
        <div className="lg:col-span-2 space-y-4">
          {/* 3D Surface View */}
          <div className="glass-panel p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-orbitron font-bold text-neon-cyan">
                3D Surface Analysis
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Maximize className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm font-roboto-mono text-gray-300">
                    {magnification}x magnification
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={magnification}
                  onChange={(e) => setMagnification(Number(e.target.value))}
                  className="w-20 h-2 bg-gray-700 rounded-lg appearance-none slider"
                />
              </div>
            </div>

            <div className="h-96 bg-gray-900 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 8, 8], fov: 60 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                <Surface defects={detectedDefects} />
                {isScanning && <ScanningLaser />}
                
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={true} 
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={20}
                />
              </Canvas>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-roboto-mono">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
                <span>Scratch</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-japan rounded-full"></div>
                <span>Pit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-bright-yellow rounded-full"></div>
                <span>Crack</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neon-green rounded-full"></div>
                <span>Contamination</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
                <span>Discoloration</span>
              </div>
            </div>
          </div>

          {/* Detection Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricDisplay
              label="Defects Found"
              value={detectedDefects.length}
              unit="total"
              icon={Target}
              color="text-neon-pink"
            />
            <MetricDisplay
              label="Avg Size"
              value={detectedDefects.length > 0 ? 
                    detectedDefects.reduce((sum, d) => sum + d.size, 0) / detectedDefects.length : 0}
              unit="μm"
              icon={Microscope}
              color="text-neon-cyan"
            />
            <MetricDisplay
              label="Scan Resolution"
              value={0.1}
              unit="μm"
              icon={Eye}
              color="text-neon-green"
            />
            <MetricDisplay
              label="Scan Speed"
              value={2.3}
              unit="mm²/s"
              icon={Zap}
              color="text-bright-yellow"
            />
          </div>
        </div>

        {/* Detection Results Panel */}
        <div className="space-y-4">
          {/* Detection Settings */}
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-lg font-orbitron font-bold text-neon-cyan mb-4">
              Detection Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-roboto-mono text-gray-400 mb-2">
                  Sensitivity: {detectionSensitivity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={detectionSensitivity}
                  onChange={(e) => setDetectionSensitivity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none slider"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-roboto-mono">
                <div className="p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Min Size:</span>
                  <span className="text-white ml-2">0.1 μm</span>
                </div>
                <div className="p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Max Size:</span>
                  <span className="text-white ml-2">10 μm</span>
                </div>
                <div className="p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Scan Area:</span>
                  <span className="text-white ml-2">10×10 mm</span>
                </div>
                <div className="p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400">Laser Power:</span>
                  <span className="text-white ml-2">5 mW</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Defects List */}
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-lg font-orbitron font-bold text-neon-cyan mb-4">
              Detected Defects ({detectedDefects.length})
            </h3>
            
            {detectedDefects.length === 0 ? (
              <div className="text-center py-8">
                <Microscope className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 font-roboto-mono text-sm">
                  No defects detected
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {detectedDefects.map((defect) => (
                  <DefectCard key={defect.id} defect={defect} />
                ))}
              </div>
            )}
          </div>

          {/* Selected Defect Details */}
          {selectedDefect && (
            <div className="glass-panel p-4 rounded-lg">
              <h3 className="text-lg font-orbitron font-bold text-neon-cyan mb-4">
                Defect Analysis
              </h3>
              <div className="space-y-3">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-orbitron font-bold text-xl text-white mb-2">
                    {selectedDefect.type.toUpperCase()}
                  </h4>
                  <p className="text-sm text-gray-400">{selectedDefect.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm font-roboto-mono">
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white ml-2">{selectedDefect.size.toFixed(3)} μm</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Severity:</span>
                    <span className={`ml-2 ${
                      selectedDefect.severity === 'high' ? 'text-neon-pink' :
                      selectedDefect.severity === 'medium' ? 'text-bright-yellow' :
                      'text-neon-green'
                    }`}>
                      {selectedDefect.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-neon-cyan ml-2">{(selectedDefect.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Detected:</span>
                    <span className="text-white ml-2">{selectedDefect.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                  <h5 className="font-orbitron font-bold text-neon-cyan mb-2">Recommendations</h5>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {selectedDefect.severity === 'high' && (
                      <>
                        <li>• Immediate quality review required</li>
                        <li>• Consider part rejection or rework</li>
                        <li>• Investigate process parameters</li>
                      </>
                    )}
                    {selectedDefect.severity === 'medium' && (
                      <>
                        <li>• Monitor for trend development</li>
                        <li>• Schedule preventive maintenance</li>
                        <li>• Document for quality tracking</li>
                      </>
                    )}
                    {selectedDefect.severity === 'low' && (
                      <>
                        <li>• Continue normal operation</li>
                        <li>• Log for statistical analysis</li>
                        <li>• Consider process optimization</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Technology Overview */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Micro-Defect Detection Technology
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Microscope className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
            <h4 className="font-orbitron font-bold text-white mb-2">Laser Scanning</h4>
            <p className="text-xs text-gray-400 font-roboto-mono">
              High-resolution confocal laser scanning microscopy with sub-micrometer precision for surface topology mapping
            </p>
          </div>
          <div className="text-center">
            <Target className="w-12 h-12 text-neon-green mx-auto mb-4" />
            <h4 className="font-orbitron font-bold text-white mb-2">AI Classification</h4>
            <p className="text-xs text-gray-400 font-roboto-mono">
              Deep learning models trained on millions of defect samples for accurate type classification and severity assessment
            </p>
          </div>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-neon-pink mx-auto mb-4" />
            <h4 className="font-orbitron font-bold text-white mb-2">Real-time Alerts</h4>
            <p className="text-xs text-gray-400 font-roboto-mono">
              Instant notification system with severity-based escalation for immediate quality control response
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MicroDefectDetection;
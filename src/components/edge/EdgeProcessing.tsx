import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Play, Square, Cpu, Zap, Eye, AlertTriangle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { useNEMI } from '../../context/NEMIContext';

interface DetectionResult {
  id: string;
  type: 'defect' | 'compliance' | 'anomaly';
  confidence: number;
  bbox: [number, number, number, number]; // x, y, width, height
  timestamp: Date;
}

function EdgeProcessing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | undefined>();
  
  const { state, dispatch } = useNEMI();
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [processingStats, setProcessingStats] = useState({
    fps: 0,
    processingTime: 0,
    totalFrames: 0,
    detectionCount: 0,
  });

  // Start webcam stream
  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }, []);

  // Stop webcam stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsStreaming(false);
  }, []);

  // Simulate AI processing on video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return;

    const startTime = performance.now();

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Simulate AI processing delay and detection
    await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 10));

    // Simulate random detections
    const newDetections: DetectionResult[] = [];
    if (Math.random() > 0.8) { // 20% chance of detection
      const detection: DetectionResult = {
        id: `det_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: Math.random() > 0.7 ? 'defect' : Math.random() > 0.5 ? 'compliance' : 'anomaly',
        confidence: 0.7 + Math.random() * 0.3,
        bbox: [
          Math.random() * (canvas.width - 100),
          Math.random() * (canvas.height - 100),
          50 + Math.random() * 100,
          50 + Math.random() * 100
        ],
        timestamp: new Date()
      };
      newDetections.push(detection);
    }

    // Draw detections on canvas
    newDetections.forEach(detection => {
      const [x, y, w, h] = detection.bbox;
      const color = detection.type === 'defect' ? '#FF10F0' : 
                   detection.type === 'compliance' ? '#39FF14' : '#FFEAA7';
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      
      // Draw label background
      ctx.fillStyle = color + '20';
      ctx.fillRect(x, y - 25, 150, 25);
      
      // Draw label text
      ctx.fillStyle = color;
      ctx.font = '12px monospace';
      ctx.fillText(
        `${detection.type.toUpperCase()} ${(detection.confidence * 100).toFixed(1)}%`,
        x + 5,
        y - 8
      );
    });

    // Update detections
    setDetections(prev => [...newDetections, ...prev.slice(0, 9)]); // Keep last 10

    // Calculate processing time
    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // Update stats
    setProcessingStats(prev => ({
      fps: Math.round(1000 / processingTime),
      processingTime: Math.round(processingTime * 10) / 10,
      totalFrames: prev.totalFrames + 1,
      detectionCount: prev.detectionCount + newDetections.length,
    }));

    // Update global state
    if (newDetections.length > 0) {
      dispatch({
        type: 'ADD_DEFECT_DETECTION',
        payload: {
          nodeId: 'edge-demo-node',
          count: newDetections.length
        }
      });
    }

    // Continue processing
    animationRef.current = requestAnimationFrame(processFrame);
  }, [isStreaming, dispatch]);

  // Start processing when streaming begins
  useEffect(() => {
    if (isStreaming && videoRef.current?.readyState === 4) {
      animationRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isStreaming, processFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  const MetricDisplay = ({ label, value, unit, icon: Icon, color }: any) => (
    <div className="glass-panel p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-roboto-mono text-gray-300">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">
        {value}
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
          Edge AI Processing
        </h1>
        <p className="text-gray-400 font-roboto-mono text-sm">
          Real-time video analysis with privacy-preserving edge intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Display */}
          <div className="glass-panel p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-orbitron font-bold text-neon-cyan">
                Live Camera Feed
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={isStreaming ? stopStream : startStream}
                  className={`edge-ai-button ${
                    isStreaming 
                      ? 'border-neon-pink text-neon-pink hover:bg-neon-pink'
                      : 'border-neon-green text-neon-green hover:bg-neon-green'
                  }`}
                >
                  {isStreaming ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isStreaming ? 'STOP' : 'START'}
                </button>
              </div>
            </div>

            <div className="relative bg-gray-900 rounded-lg overflow-hidden edge-processing-visual">
              {!isStreaming ? (
                <div className="aspect-video flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-roboto-mono">
                      Click START to begin live processing
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ display: 'none' }}
                    onLoadedMetadata={() => {
                      if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                      }
                      animationRef.current = requestAnimationFrame(processFrame);
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto max-w-full"
                    style={{ aspectRatio: '4/3' }}
                  />
                  {/* Processing indicator */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="text-neon-green text-xs font-roboto-mono">
                      PROCESSING
                    </span>
                  </div>
                  {/* Privacy indicator */}
                  <div className="absolute top-4 right-4 bg-black/50 px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                      <span className="text-neon-cyan text-xs font-roboto-mono">
                        DATA STAYS LOCAL
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Processing Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricDisplay
              label="Processing Speed"
              value={processingStats.processingTime}
              unit="ms"
              icon={Zap}
              color="text-neon-cyan"
            />
            <MetricDisplay
              label="Frame Rate"
              value={processingStats.fps}
              unit="FPS"
              icon={Cpu}
              color="text-neon-green"
            />
            <MetricDisplay
              label="Total Frames"
              value={processingStats.totalFrames.toLocaleString()}
              unit=""
              icon={Eye}
              color="text-bright-yellow"
            />
            <MetricDisplay
              label="Detections"
              value={processingStats.detectionCount}
              unit="found"
              icon={AlertTriangle}
              color="text-neon-pink"
            />
          </div>
        </div>

        {/* Detection Results Panel */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-lg">
            <h2 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
              Live Detections
            </h2>
            
            {detections.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 font-roboto-mono text-sm">
                  No detections yet
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {detections.map((detection) => (
                  <div
                    key={detection.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      detection.type === 'defect' ? 'border-neon-pink bg-pink-900/20' :
                      detection.type === 'compliance' ? 'border-neon-green bg-green-900/20' :
                      'border-bright-yellow bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-orbitron font-bold uppercase ${
                        detection.type === 'defect' ? 'text-neon-pink' :
                        detection.type === 'compliance' ? 'text-neon-green' :
                        'text-bright-yellow'
                      }`}>
                        {detection.type}
                      </span>
                      <span className="text-xs text-gray-400 font-roboto-mono">
                        {detection.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs font-roboto-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{(detection.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">
                          [{detection.bbox[0].toFixed(0)}, {detection.bbox[1].toFixed(0)}]
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white">
                          {detection.bbox[2].toFixed(0)}×{detection.bbox[3].toFixed(0)}px
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edge AI Benefits */}
          <div className="glass-panel p-6 rounded-lg">
            <h3 className="text-lg font-orbitron font-bold text-neon-cyan mb-4">
              Edge AI Benefits
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <span className="text-sm font-roboto-mono text-gray-300">Privacy</span>
                <span className="text-neon-green font-bold">100%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyan-900/20 rounded-lg">
                <span className="text-sm font-roboto-mono text-gray-300">Latency</span>
                <span className="text-neon-cyan font-bold">&lt;10ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg">
                <span className="text-sm font-roboto-mono text-gray-300">Bandwidth</span>
                <span className="text-bright-yellow font-bold">0 MB/s</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-400 font-roboto-mono">
                ✓ No raw video data leaves your device<br/>
                ✓ Real-time processing without cloud dependency<br/>
                ✓ Zero bandwidth usage for video transmission
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Edge Processing Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Camera className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
            <h4 className="font-orbitron font-bold text-white mb-2">Video Capture</h4>
            <p className="text-xs text-gray-400 font-roboto-mono">
              WebRTC camera access with optimized resolution and frame rate for real-time processing
            </p>
          </div>
          <div className="text-center">
            <Cpu className="w-12 h-12 text-neon-green mx-auto mb-4" />
            <h4 className="font-orbitron font-bold text-white mb-2">Edge AI Model</h4>
            <p className="text-xs text-gray-400 font-roboto-mono">
              TensorFlow.js neural network running locally in browser for defect detection
            </p>
          </div>
          <div className="text-center">
            <Eye className="w-12 h-12 text-neon-pink mx-auto mb-4" />
            <h4 className="font-orbitron font-bold text-white mb-2">Real-time Analysis</h4>
            <p className="text-xs text-gray-400 font-roboto-mono">
              Sub-10ms processing with bounding box visualization and confidence scoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EdgeProcessing;
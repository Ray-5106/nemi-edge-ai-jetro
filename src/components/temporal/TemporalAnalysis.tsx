import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Activity, BarChart3, Waves, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, Cell } from 'recharts';
import { useNEMI } from '../../context/NEMIContext';

interface TemporalScale {
  id: string;
  name: string;
  unit: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  sampleRate: string;
  analysisType: string;
}

interface TemporalData {
  scale: string;
  timestamp: number;
  value: number;
  pattern: string;
  anomaly: boolean;
  confidence: number;
}

const temporalScales: TemporalScale[] = [
  {
    id: 'microsecond',
    name: 'Microsecond',
    unit: 'μs',
    description: 'Vibration patterns & micro-movements',
    color: '#FF10F0',
    icon: Waves,
    sampleRate: '10 kHz',
    analysisType: 'FFT + Pattern Recognition'
  },
  {
    id: 'second',
    name: 'Second',
    unit: 's',
    description: 'Worker actions & equipment cycles',
    color: '#00E5FF',
    icon: Activity,
    sampleRate: '30 Hz',
    analysisType: 'Action Recognition CNN'
  },
  {
    id: 'minute',
    name: 'Minute',
    unit: 'min',
    description: 'Process flows & quality patterns',
    color: '#39FF14',
    icon: BarChart3,
    sampleRate: '1 Hz',
    analysisType: 'Time Series Analysis'
  },
  {
    id: 'hour',
    name: 'Hour',
    unit: 'hr',
    description: 'Equipment health & maintenance',
    color: '#FFEAA7',
    icon: TrendingUp,
    sampleRate: '0.1 Hz',
    analysisType: 'Predictive Modeling'
  },
  {
    id: 'day',
    name: 'Day',
    unit: 'day',
    description: 'Compliance trends & patterns',
    color: '#FF6B00',
    icon: Calendar,
    sampleRate: '0.01 Hz',
    analysisType: 'Trend Analysis & ML'
  }
];

function TemporalAnalysis() {
  const { state } = useNEMI();
  const [selectedScale, setSelectedScale] = useState('second');
  const [temporalData, setTemporalData] = useState<{[key: string]: TemporalData[]}>({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [anomalyCount, setAnomalyCount] = useState(0);

  // Generate realistic temporal data for each scale
  useEffect(() => {
    const generateScaleData = (scale: TemporalScale, timeRange: number, dataPoints: number) => {
      const data: TemporalData[] = [];
      const now = Date.now();
      
      for (let i = 0; i < dataPoints; i++) {
        const timestamp = now - (timeRange * (dataPoints - i) / dataPoints);
        let value: number;
        let pattern: string;
        let anomaly = false;
        
        // Generate different patterns based on scale
        switch (scale.id) {
          case 'microsecond':
            // High-frequency vibration data
            value = 0.5 + 0.3 * Math.sin(i * 0.1) + 0.1 * Math.random();
            pattern = value > 0.8 ? 'High Vibration' : value < 0.3 ? 'Low Vibration' : 'Normal';
            anomaly = value > 0.9 || value < 0.2;
            break;
          case 'second':
            // Worker/equipment actions
            value = 0.6 + 0.2 * Math.sin(i * 0.05) + 0.15 * Math.random();
            pattern = value > 0.8 ? 'High Activity' : value < 0.4 ? 'Idle Period' : 'Normal Activity';
            anomaly = Math.random() > 0.95;
            break;
          case 'minute':
            // Process efficiency
            value = 0.7 + 0.1 * Math.cos(i * 0.02) + 0.1 * Math.random();
            pattern = value > 0.85 ? 'Peak Efficiency' : value < 0.6 ? 'Low Efficiency' : 'Normal Flow';
            anomaly = value < 0.5;
            break;
          case 'hour':
            // Equipment health trending
            value = 0.8 - (i * 0.001) + 0.05 * Math.random(); // Gradual degradation
            pattern = value > 0.9 ? 'Excellent Health' : value < 0.7 ? 'Maintenance Needed' : 'Good Health';
            anomaly = value < 0.6;
            break;
          case 'day':
            // Long-term compliance trends
            value = 0.85 + 0.1 * Math.sin(i * 0.01) + 0.05 * Math.random();
            pattern = value > 0.95 ? 'High Compliance' : value < 0.8 ? 'Compliance Risk' : 'Good Compliance';
            anomaly = value < 0.75;
            break;
          default:
            value = 0.5 + 0.3 * Math.random();
            pattern = 'Unknown';
        }
        
        data.push({
          scale: scale.id,
          timestamp,
          value,
          pattern,
          anomaly,
          confidence: 0.8 + Math.random() * 0.2
        });
      }
      
      return data;
    };

    const newTemporalData: {[key: string]: TemporalData[]} = {};
    let totalAnomalies = 0;

    temporalScales.forEach(scale => {
      let timeRange, dataPoints;
      switch (scale.id) {
        case 'microsecond':
          timeRange = 1000; // 1 second in microseconds
          dataPoints = 100;
          break;
        case 'second':
          timeRange = 300000; // 5 minutes
          dataPoints = 150;
          break;
        case 'minute':
          timeRange = 7200000; // 2 hours
          dataPoints = 120;
          break;
        case 'hour':
          timeRange = 86400000; // 24 hours
          dataPoints = 24;
          break;
        case 'day':
          timeRange = 2592000000; // 30 days
          dataPoints = 30;
          break;
        default:
          timeRange = 3600000;
          dataPoints = 60;
      }
      
      const scaleData = generateScaleData(scale, timeRange, dataPoints);
      newTemporalData[scale.id] = scaleData;
      totalAnomalies += scaleData.filter(d => d.anomaly).length;
    });

    setTemporalData(newTemporalData);
    setAnomalyCount(totalAnomalies);
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number, scale: string) => {
    const date = new Date(timestamp);
    switch (scale) {
      case 'microsecond':
        return `${date.getSeconds()}.${String(date.getMilliseconds()).padStart(3, '0')}s`;
      case 'second':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      case 'minute':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'hour':
        return date.toLocaleDateString([], { month: 'short', day: '2-digit', hour: '2-digit' });
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: '2-digit' });
      default:
        return date.toLocaleString();
    }
  };

  const ScaleSelector = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {temporalScales.map(scale => {
        const Icon = scale.icon;
        const isSelected = selectedScale === scale.id;
        return (
          <button
            key={scale.id}
            onClick={() => setSelectedScale(scale.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isSelected 
                ? 'bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan shadow-glow'
                : 'bg-gray-panel/50 border border-gray-600 text-gray-300 hover:border-neon-cyan/50 hover:text-neon-cyan'
            }`}
          >
            <Icon className="w-4 h-4" />
            <div className="text-left">
              <div className="text-sm font-orbitron font-bold">{scale.name}</div>
              <div className="text-xs text-gray-400">{scale.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const currentScale = temporalScales.find(s => s.id === selectedScale);
  const currentData = temporalData[selectedScale] || [];

  const MetricCard = ({ title, value, unit, trend, color, description }: any) => (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-orbitron font-bold text-sm text-gray-300">{title}</h3>
        {trend && (
          <div className={`text-xs ${trend === 'up' ? 'text-neon-green' : trend === 'down' ? 'text-neon-pink' : 'text-gray-400'}`}>
            <TrendingUp className={`w-3 h-3 inline ${trend === 'down' ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-400 mt-2 font-roboto-mono">{description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
          Temporal Multi-Scale Analysis
        </h1>
        <p className="text-gray-400 font-roboto-mono text-sm">
          Simultaneous pattern analysis across five different temporal scales
        </p>
      </div>

      {/* Current Time Display */}
      <div className="glass-panel p-6 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Clock className="w-8 h-8 text-neon-cyan animate-pulse" />
            <div>
              <h2 className="text-2xl font-orbitron font-bold text-white">
                Multi-Scale Temporal Engine
              </h2>
              <p className="text-gray-400 font-roboto-mono">
                Analyzing patterns from microseconds to days simultaneously
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-orbitron font-bold text-neon-cyan">
              {new Date(currentTime).toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-400 font-roboto-mono">
              System Time • {anomalyCount} Anomalies Detected
            </div>
          </div>
        </div>
      </div>

      {/* Scale Selector */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Select Temporal Scale
        </h3>
        <ScaleSelector />
      </div>

      {/* Current Scale Analysis */}
      {currentScale && (
        <>
          {/* Scale Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Scale Type"
              value={currentScale.name}
              unit={`(${currentScale.unit})`}
              color={currentScale.color}
              description={`Sample Rate: ${currentScale.sampleRate}`}
            />
            <MetricCard
              title="Analysis Method"
              value={currentScale.analysisType.split(' ')[0]}
              unit=""
              color="#39FF14"
              description={currentScale.analysisType}
            />
            <MetricCard
              title="Data Points"
              value={currentData.length}
              unit="samples"
              color="#00E5FF"
              description="Active monitoring points"
            />
            <MetricCard
              title="Anomalies"
              value={currentData.filter(d => d.anomaly).length}
              unit="detected"
              color="#FF10F0"
              description="Pattern deviations found"
              trend={currentData.filter(d => d.anomaly).length > 5 ? 'up' : 'stable'}
            />
          </div>

          {/* Main Visualization */}
          <div className="glass-panel p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-orbitron font-bold" style={{ color: currentScale.color }}>
                {currentScale.name} Scale Analysis
              </h3>
              <div className="flex items-center space-x-4 text-sm font-roboto-mono">
                <span className="text-gray-400">Scale:</span>
                <span style={{ color: currentScale.color }}>{currentScale.description}</span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentScale.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={currentScale.color} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
                <XAxis 
                  dataKey="timestamp"
                  stroke="#6B7280" 
                  fontSize={10}
                  tickFormatter={(timestamp) => formatTimestamp(timestamp, selectedScale)}
                  interval={Math.floor(currentData.length / 8)}
                />
                <YAxis 
                  domain={[0, 1]}
                  stroke="#6B7280" 
                  fontSize={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#161B22', 
                    border: `1px solid ${currentScale.color}`,
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelFormatter={(timestamp: any) => formatTimestamp(timestamp, selectedScale)}
                  formatter={(value: any, name: string) => [
                    `${(value * 100).toFixed(1)}%`,
                    'Signal Strength'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={currentScale.color}
                  strokeWidth={2}
                  fill="url(#gradient)"
                />
                {/* Highlight anomalies */}
                {currentData.filter(d => d.anomaly).map((anomaly, index) => (
                  <Scatter 
                    key={index}
                    data={[anomaly]} 
                    fill="#FF10F0"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pattern Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pattern Distribution */}
            <div className="glass-panel p-6 rounded-lg">
              <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
                Pattern Distribution
              </h3>
              <div className="space-y-3">
                {Array.from(new Set(currentData.map(d => d.pattern))).map(pattern => {
                  const count = currentData.filter(d => d.pattern === pattern).length;
                  const percentage = (count / currentData.length) * 100;
                  const isAnomalous = currentData.filter(d => d.pattern === pattern && d.anomaly).length > 0;
                  
                  return (
                    <div key={pattern} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-roboto-mono ${isAnomalous ? 'text-neon-pink' : 'text-gray-300'}`}>
                          {pattern}
                        </span>
                        <span className="text-neon-cyan text-sm font-bold">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isAnomalous ? 'bg-gradient-to-r from-neon-pink to-bright-yellow' : 
                            'bg-gradient-to-r from-neon-cyan to-neon-green'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anomaly Details */}
            <div className="glass-panel p-6 rounded-lg">
              <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
                Anomaly Detection
              </h3>
              <div className="space-y-4">
                {currentData.filter(d => d.anomaly).slice(0, 5).map((anomaly, index) => (
                  <div key={index} className="p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-neon-pink font-orbitron font-bold text-sm">
                        ANOMALY {index + 1}
                      </span>
                      <span className="text-xs text-gray-400 font-roboto-mono">
                        {formatTimestamp(anomaly.timestamp, selectedScale)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-roboto-mono">
                      <div>
                        <span className="text-gray-400">Pattern:</span>
                        <span className="text-white ml-2">{anomaly.pattern}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-neon-pink ml-2">{(anomaly.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Value:</span>
                        <span className="text-white ml-2">{(anomaly.value * 100).toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Severity:</span>
                        <span className={`ml-2 ${anomaly.value > 0.8 || anomaly.value < 0.2 ? 'text-neon-pink' : 'text-bright-yellow'}`}>
                          {anomaly.value > 0.8 || anomaly.value < 0.2 ? 'HIGH' : 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {currentData.filter(d => d.anomaly).length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-neon-green" />
                    </div>
                    <p className="text-gray-400 font-roboto-mono">
                      No anomalies detected in current {selectedScale} scale data
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scale Technical Details */}
          <div className="glass-panel p-6 rounded-lg">
            <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
              Technical Implementation: {currentScale.name} Scale
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ backgroundColor: `${currentScale.color}20`, border: `2px solid ${currentScale.color}` }}>
                  <currentScale.icon className="w-8 h-8" style={{ color: currentScale.color }} />
                </div>
                <h4 className="font-orbitron font-bold text-white mb-2">Data Acquisition</h4>
                <p className="text-xs text-gray-400 font-roboto-mono">
                  {selectedScale === 'microsecond' && "High-frequency accelerometer & piezoelectric sensors"}
                  {selectedScale === 'second' && "Computer vision & action recognition algorithms"}
                  {selectedScale === 'minute' && "Process monitoring & quality control sensors"}
                  {selectedScale === 'hour' && "Equipment telemetry & health monitoring"}
                  {selectedScale === 'day' && "Historical data aggregation & trend analysis"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-neon-green" />
                </div>
                <h4 className="font-orbitron font-bold text-white mb-2">Processing Method</h4>
                <p className="text-xs text-gray-400 font-roboto-mono">
                  {currentScale.analysisType} with real-time edge computing and pattern recognition
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-bright-yellow/20 border-2 border-bright-yellow flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-bright-yellow" />
                </div>
                <h4 className="font-orbitron font-bold text-white mb-2">Output & Alerts</h4>
                <p className="text-xs text-gray-400 font-roboto-mono">
                  Predictive insights with automated compliance alerts and maintenance scheduling
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Multi-Scale Summary */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Multi-Scale Intelligence Summary
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {temporalScales.map(scale => {
            const scaleData = temporalData[scale.id] || [];
            const anomalies = scaleData.filter(d => d.anomaly).length;
            const avgValue = scaleData.reduce((sum, d) => sum + d.value, 0) / scaleData.length;
            
            return (
              <div key={scale.id} className="p-4 bg-gray-panel/50 rounded-lg border-l-4" 
                   style={{ borderColor: scale.color }}>
                <div className="flex items-center space-x-2 mb-2">
                  <scale.icon className="w-4 h-4" style={{ color: scale.color }} />
                  <span className="font-orbitron font-bold text-sm" style={{ color: scale.color }}>
                    {scale.name}
                  </span>
                </div>
                <div className="space-y-2 text-xs font-roboto-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Signal:</span>
                    <span className="text-white">{(avgValue * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Anomalies:</span>
                    <span className={anomalies > 0 ? 'text-neon-pink' : 'text-neon-green'}>
                      {anomalies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={anomalies > 5 ? 'text-neon-pink' : 'text-neon-green'}>
                      {anomalies > 5 ? 'ALERT' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TemporalAnalysis;
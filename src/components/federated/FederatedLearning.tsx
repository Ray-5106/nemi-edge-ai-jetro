import React, { useEffect, useState, useRef } from 'react';
import { Network, Shield, Globe2, Cpu, TrendingUp, Lock, Users, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { useNEMI } from '../../context/NEMIContext';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  type: 'japan' | 'india' | 'coordinator';
  status: 'active' | 'learning' | 'idle';
  accuracy: number;
  contributions: number;
  lastUpdate: Date;
}

interface LearningRound {
  round: number;
  globalAccuracy: number;
  participatingNodes: number;
  convergenceRate: number;
  privacyBudget: number;
  timestamp: Date;
}

function FederatedLearning() {
  const { state, simulateFederatedLearning } = useNEMI();
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [learningHistory, setLearningHistory] = useState<LearningRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isLearning, setIsLearning] = useState(false);
  const [transmissionData, setTransmissionData] = useState<Array<{from: string, to: string, progress: number}>>([]);

  // Initialize network nodes
  useEffect(() => {
    const centerX = 300;
    const centerY = 200;
    const radius = 120;
    
    const initialNodes: NetworkNode[] = [
      // Coordinator in center
      {
        id: 'coordinator',
        x: centerX,
        y: centerY,
        type: 'coordinator',
        status: 'active',
        accuracy: 99.0,
        contributions: 0,
        lastUpdate: new Date(),
      },
      // Japan nodes
      {
        id: 'japan-factory-01',
        x: centerX - radius * Math.cos(0),
        y: centerY - radius * Math.sin(0),
        type: 'japan',
        status: 'active',
        accuracy: 99.7,
        contributions: 24,
        lastUpdate: new Date(),
      },
      {
        id: 'japan-factory-02',
        x: centerX - radius * Math.cos(Math.PI / 3),
        y: centerY - radius * Math.sin(Math.PI / 3),
        type: 'japan',
        status: 'active',
        accuracy: 99.8,
        contributions: 31,
        lastUpdate: new Date(),
      },
      {
        id: 'japan-factory-03',
        x: centerX - radius * Math.cos(2 * Math.PI / 3),
        y: centerY - radius * Math.sin(2 * Math.PI / 3),
        type: 'japan',
        status: 'idle',
        accuracy: 99.4,
        contributions: 18,
        lastUpdate: new Date(),
      },
      // India nodes
      {
        id: 'india-factory-01',
        x: centerX + radius * Math.cos(0),
        y: centerY + radius * Math.sin(0),
        type: 'india',
        status: 'active',
        accuracy: 99.5,
        contributions: 28,
        lastUpdate: new Date(),
      },
      {
        id: 'india-factory-02',
        x: centerX + radius * Math.cos(Math.PI / 3),
        y: centerY + radius * Math.sin(Math.PI / 3),
        type: 'india',
        status: 'active',
        accuracy: 99.6,
        contributions: 22,
        lastUpdate: new Date(),
      },
      {
        id: 'india-factory-03',
        x: centerX + radius * Math.cos(2 * Math.PI / 3),
        y: centerY + radius * Math.sin(2 * Math.PI / 3),
        type: 'india',
        status: 'learning',
        accuracy: 99.3,
        contributions: 15,
        lastUpdate: new Date(),
      },
    ];

    setNodes(initialNodes);
    
    // Initialize learning history
    const history: LearningRound[] = [];
    for (let i = 1; i <= 20; i++) {
      history.push({
        round: i,
        globalAccuracy: 95 + (i * 0.2) + Math.random() * 0.1,
        participatingNodes: 4 + Math.floor(Math.random() * 3),
        convergenceRate: 0.8 + Math.random() * 0.2,
        privacyBudget: 1.0 - (i * 0.02),
        timestamp: new Date(Date.now() - (20 - i) * 3600000), // Hours ago
      });
    }
    setLearningHistory(history);
    setCurrentRound(20);
  }, []);

  // Simulate federated learning round
  const startLearningRound = async () => {
    if (isLearning) return;
    
    setIsLearning(true);
    setCurrentRound(prev => prev + 1);

    // Phase 1: Select participating nodes
    const activeNodes = nodes.filter(n => n.type !== 'coordinator' && Math.random() > 0.3);
    setNodes(prev => prev.map(node => ({
      ...node,
      status: activeNodes.find(n => n.id === node.id) ? 'learning' : 
              node.type === 'coordinator' ? 'active' : 'idle'
    })));

    // Phase 2: Simulate local training (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Phase 3: Gradient transmission
    const transmissions = activeNodes.map(node => ({
      from: node.id,
      to: 'coordinator',
      progress: 0
    }));
    setTransmissionData(transmissions);

    // Animate transmissions
    for (let progress = 0; progress <= 100; progress += 10) {
      setTransmissionData(prev => prev.map(t => ({ ...t, progress })));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Phase 4: Aggregation and model update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update global accuracy and history
    const newAccuracy = Math.min(99.9, state.globalAccuracy + 0.05 + Math.random() * 0.05);
    const newRound: LearningRound = {
      round: currentRound + 1,
      globalAccuracy: newAccuracy,
      participatingNodes: activeNodes.length,
      convergenceRate: 0.85 + Math.random() * 0.1,
      privacyBudget: Math.max(0.1, 1.0 - (currentRound * 0.02)),
      timestamp: new Date(),
    };

    setLearningHistory(prev => [...prev.slice(-19), newRound]);

    // Update node statuses
    setNodes(prev => prev.map(node => ({
      ...node,
      status: node.type === 'coordinator' ? 'active' : 'active',
      accuracy: node.type === 'coordinator' ? newAccuracy : 
                Math.min(99.9, node.accuracy + 0.02 + Math.random() * 0.03),
      contributions: node.type !== 'coordinator' && activeNodes.find(n => n.id === node.id) ?
                    node.contributions + 1 : node.contributions,
      lastUpdate: new Date(),
    })));

    setTransmissionData([]);
    setIsLearning(false);
    
    // Trigger global state update
    simulateFederatedLearning();
  };

  // Network visualization component
  const NetworkVisualization = () => {
    const getNodeColor = (node: NetworkNode) => {
      if (node.type === 'coordinator') return '#00E5FF';
      if (node.type === 'japan') return '#FF6B00';
      return '#138808'; // India
    };

    const getNodeStatus = (status: string) => {
      switch (status) {
        case 'learning': return 'animate-pulse';
        case 'active': return '';
        default: return 'opacity-50';
      }
    };

    return (
      <svg ref={svgRef} width="600" height="400" className="border border-neon-cyan/30 rounded-lg bg-gray-900/50">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A1A2E" strokeWidth="0.5"/>
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connections */}
        {nodes.filter(n => n.type !== 'coordinator').map(node => {
          const coordinator = nodes.find(n => n.type === 'coordinator');
          if (!coordinator) return null;
          
          const isTransmitting = transmissionData.some(t => t.from === node.id);
          
          return (
            <g key={`connection-${node.id}`}>
              <line
                x1={node.x}
                y1={node.y}
                x2={coordinator.x}
                y2={coordinator.y}
                stroke={isTransmitting ? '#39FF14' : '#00E5FF'}
                strokeWidth={isTransmitting ? 2 : 1}
                strokeOpacity={isTransmitting ? 0.8 : 0.3}
                className={isTransmitting ? 'data-transmission' : ''}
              />
              {/* Transmission animation */}
              {isTransmitting && (
                <circle
                  cx={node.x + (coordinator.x - node.x) * (transmissionData.find(t => t.from === node.id)?.progress || 0) / 100}
                  cy={node.y + (coordinator.y - node.y) * (transmissionData.find(t => t.from === node.id)?.progress || 0) / 100}
                  r="3"
                  fill="#39FF14"
                  filter="url(#glow)"
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <g key={node.id} className={getNodeStatus(node.status)}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.type === 'coordinator' ? 20 : 15}
              fill={getNodeColor(node)}
              fillOpacity={node.status === 'learning' ? 0.8 : 0.4}
              stroke={getNodeColor(node)}
              strokeWidth="2"
              filter={node.status === 'learning' ? "url(#glow)" : undefined}
            />
            {/* Node labels */}
            <text
              x={node.x}
              y={node.y - (node.type === 'coordinator' ? 35 : 25)}
              textAnchor="middle"
              className="text-xs font-roboto-mono fill-white"
            >
              {node.type === 'coordinator' ? 'COORDINATOR' : 
               node.type === 'japan' ? '🇯🇵 ' + node.id.split('-')[2].toUpperCase() :
               '🇮🇳 ' + node.id.split('-')[2].toUpperCase()}
            </text>
            {/* Accuracy display */}
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              className="text-xs font-roboto-mono fill-neon-cyan"
            >
              {node.accuracy.toFixed(1)}%
            </text>
          </g>
        ))}

        {/* Legend */}
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="150" height="80" fill="rgba(0,0,0,0.7)" rx="5" />
          <text x="10" y="15" className="text-xs font-orbitron fill-neon-cyan">Network Status</text>
          <circle cx="15" cy="30" r="5" fill="#00E5FF" />
          <text x="25" y="35" className="text-xs font-roboto-mono fill-white">Coordinator</text>
          <circle cx="15" cy="45" r="5" fill="#FF6B00" />
          <text x="25" y="50" className="text-xs font-roboto-mono fill-white">Japan Nodes</text>
          <circle cx="15" cy="60" r="5" fill="#138808" />
          <text x="25" y="65" className="text-xs font-roboto-mono fill-white">India Nodes</text>
        </g>

        {/* Status indicator */}
        <g transform="translate(450, 20)">
          <rect x="0" y="0" width="140" height="60" fill="rgba(0,0,0,0.7)" rx="5" />
          <text x="10" y="15" className="text-xs font-orbitron fill-neon-cyan">FL Status</text>
          <circle 
            cx="15" 
            cy="35" 
            r="5" 
            fill={isLearning ? "#39FF14" : "#6B7280"}
            className={isLearning ? "animate-pulse" : ""}
          />
          <text x="25" y="40" className="text-xs font-roboto-mono fill-white">
            {isLearning ? 'LEARNING...' : 'READY'}
          </text>
          <text x="10" y="55" className="text-xs font-roboto-mono fill-gray-400">
            Round: {currentRound}
          </text>
        </g>
      </svg>
    );
  };

  const MetricCard = ({ title, value, unit, icon: Icon, description, color = "text-neon-cyan" }: any) => (
    <div className="metric-card">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-orbitron font-bold text-sm">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-white mb-2">
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </div>
      <p className="text-xs text-gray-400 font-roboto-mono">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
            Federated Learning Network
          </h1>
          <p className="text-gray-400 font-roboto-mono text-sm">
            Privacy-preserving collaborative intelligence across Japan-India factories
          </p>
        </div>
        <button
          onClick={startLearningRound}
          disabled={isLearning}
          className={`edge-ai-button ${
            isLearning 
              ? 'border-bright-yellow text-bright-yellow cursor-not-allowed opacity-50'
              : 'border-neon-green text-neon-green hover:bg-neon-green'
          }`}
        >
          <Network className="w-4 h-4 mr-2" />
          {isLearning ? 'LEARNING...' : 'START FL ROUND'}
        </button>
      </div>

      {/* Network Visualization */}
      <div className="glass-panel p-6 rounded-lg">
        <h2 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Real-time Network Status
        </h2>
        <div className="flex justify-center">
          <NetworkVisualization />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Global Accuracy"
          value={learningHistory.length > 0 ? learningHistory[learningHistory.length - 1].globalAccuracy : 0}
          unit="%"
          icon={TrendingUp}
          description="Federated model performance"
          color="text-neon-green"
        />
        <MetricCard
          title="Privacy Budget"
          value={learningHistory.length > 0 ? learningHistory[learningHistory.length - 1].privacyBudget : 1.0}
          unit="ε remaining"
          icon={Shield}
          description="Differential privacy protection"
          color="text-neon-cyan"
        />
        <MetricCard
          title="Active Nodes"
          value={nodes.filter(n => n.status === 'active' && n.type !== 'coordinator').length}
          unit={`/ ${nodes.length - 1}`}
          icon={Globe2}
          description="Participating factories"
          color="text-bright-yellow"
        />
        <MetricCard
          title="FL Rounds"
          value={currentRound}
          unit="completed"
          icon={Cpu}
          description="Learning iterations"
          color="text-neon-pink"
        />
      </div>

      {/* Learning Progress and Privacy Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Chart */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
            Learning Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={learningHistory.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
              <XAxis 
                dataKey="round" 
                stroke="#6B7280" 
                fontSize={10}
              />
              <YAxis 
                domain={['dataMin - 0.5', 'dataMax + 0.1']}
                stroke="#6B7280" 
                fontSize={10} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161B22', 
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="globalAccuracy" 
                stroke="#39FF14" 
                strokeWidth={2}
                name="Global Accuracy (%)"
                dot={{ fill: '#39FF14', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="convergenceRate" 
                stroke="#00E5FF" 
                strokeWidth={2}
                name="Convergence Rate"
                dot={{ fill: '#00E5FF', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Privacy Protection Analysis */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
            Privacy Protection
          </h3>
          <div className="space-y-4">
            {/* Privacy Budget Visualization */}
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-roboto-mono text-gray-300">Privacy Budget (ε)</span>
                <span className="text-neon-cyan font-bold">
                  {learningHistory.length > 0 ? learningHistory[learningHistory.length - 1].privacyBudget.toFixed(2) : '1.00'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-green to-bright-yellow h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(learningHistory.length > 0 ? learningHistory[learningHistory.length - 1].privacyBudget : 1) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Privacy Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-neon-green" />
                  <span className="text-sm font-roboto-mono">Differential Privacy</span>
                </div>
                <span className="text-neon-green font-bold">ACTIVE</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-cyan-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm font-roboto-mono">Secure Aggregation</span>
                </div>
                <span className="text-neon-cyan font-bold">ENABLED</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-bright-yellow" />
                  <span className="text-sm font-roboto-mono">Homomorphic Encryption</span>
                </div>
                <span className="text-bright-yellow font-bold">PROTECTED</span>
              </div>
            </div>

            {/* Privacy Guarantee */}
            <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-4 rounded-lg">
              <h4 className="font-orbitron font-bold text-neon-cyan mb-2">Privacy Guarantee</h4>
              <p className="text-xs text-gray-400 font-roboto-mono">
                ✓ Raw data never leaves local factories<br/>
                ✓ Only encrypted gradients shared<br/>
                ✓ Individual contributions cannot be identified<br/>
                ✓ Differential privacy bounds: ε = {learningHistory.length > 0 ? learningHistory[learningHistory.length - 1].privacyBudget.toFixed(2) : '1.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Factory Contributions */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Factory Contributions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.filter(n => n.type !== 'coordinator').map(node => (
            <div 
              key={node.id}
              className={`p-4 rounded-lg border-l-4 ${
                node.type === 'japan' 
                  ? 'border-orange-japan bg-orange-japan/10' 
                  : 'border-green-india bg-green-india/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-orbitron font-bold">
                  {node.type === 'japan' ? '🇯🇵' : '🇮🇳'} Factory {node.id.split('-')[2].toUpperCase()}
                </span>
                <div className={`w-3 h-3 rounded-full ${
                  node.status === 'active' ? 'bg-neon-green animate-pulse' :
                  node.status === 'learning' ? 'bg-bright-yellow animate-pulse' :
                  'bg-gray-500'
                }`}></div>
              </div>
              <div className="space-y-2 text-xs font-roboto-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Local Accuracy:</span>
                  <span className="text-white">{node.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contributions:</span>
                  <span className="text-neon-cyan">{node.contributions} rounds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="text-gray-400">{node.lastUpdate.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={
                    node.status === 'active' ? 'text-neon-green' :
                    node.status === 'learning' ? 'text-bright-yellow' :
                    'text-gray-500'
                  }>
                    {node.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Japan-India Collaboration Benefits */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Japan-India Collaboration Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-orbitron font-bold text-orange-japan">🇯🇵 Japan Contributions</h4>
            <ul className="space-y-2 text-sm font-roboto-mono text-gray-300">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-japan rounded-full"></div>
                <span>Precision manufacturing standards & quality control data</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-japan rounded-full"></div>
                <span>Advanced sensor technology & IoT integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-japan rounded-full"></div>
                <span>Lean manufacturing process optimization</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-japan rounded-full"></div>
                <span>High-accuracy defect detection patterns</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-orbitron font-bold text-green-india">🇮🇳 India Contributions</h4>
            <ul className="space-y-2 text-sm font-roboto-mono text-gray-300">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-india rounded-full"></div>
                <span>Cost-effective AI model architectures & optimization</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-india rounded-full"></div>
                <span>Diverse manufacturing environment data</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-india rounded-full"></div>
                <span>Scalable edge computing solutions</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-india rounded-full"></div>
                <span>Multi-language compliance standards</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FederatedLearning;
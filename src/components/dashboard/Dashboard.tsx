import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Network, 
  Shield, 
  Zap, 
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useNEMI } from '../../context/NEMIContext';

// Mock data for charts
const generatePerformanceData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // Last 24 minutes
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accuracy: 97 + Math.random() * 2.5,
      processingTime: 6 + Math.random() * 6,
      defects: Math.floor(Math.random() * 5),
    });
  }
  return data;
};

const complianceData = [
  { name: 'Safety', value: 98.5, color: '#39FF14' },
  { name: 'Quality', value: 97.2, color: '#00E5FF' },
  { name: 'Environmental', value: 95.8, color: '#FFEAA7' },
  { name: 'Documentation', value: 99.1, color: '#FF10F0' },
];

const edgeNodePerformance = [
  { name: 'Japan-01', accuracy: 99.7, speed: 8.3, defects: 12 },
  { name: 'Japan-02', accuracy: 99.8, speed: 7.9, defects: 8 },
  { name: 'India-01', accuracy: 99.5, speed: 9.1, defects: 15 },
  { name: 'India-02', accuracy: 99.6, speed: 8.7, defects: 11 },
];

function Dashboard() {
  const { state } = useNEMI();
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (state.isSystemActive) {
        setPerformanceData(prev => {
          const newData = [...prev.slice(1)];
          const now = new Date();
          newData.push({
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            accuracy: 97 + Math.random() * 2.5,
            processingTime: 6 + Math.random() * 6,
            defects: Math.floor(Math.random() * 5),
          });
          return newData;
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [state.isSystemActive]);

  const MetricCard = ({ title, value, unit, trend, icon: Icon, color, description }: any) => (
    <div className="metric-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className={`w-6 h-6 ${color} group-hover:animate-pulse`} />
          <h3 className="font-orbitron font-bold text-sm text-gray-300 group-hover:text-white transition-colors">
            {title}
          </h3>
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${trend === 'up' ? 'text-neon-green' : trend === 'down' ? 'text-neon-pink' : 'text-gray-400'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trend}
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className={`text-3xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2 font-roboto-mono">{description}</p>
      )}
    </div>
  );

  const StatusCard = ({ title, status, details }: any) => (
    <div className="glass-panel p-4 rounded-lg border-l-4 border-neon-cyan">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-orbitron font-bold text-sm">{title}</h3>
        <div className={`flex items-center text-xs ${
          status === 'active' ? 'text-neon-green' : 
          status === 'warning' ? 'text-bright-yellow' : 
          'text-neon-pink'
        }`}>
          {status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
          {status.toUpperCase()}
        </div>
      </div>
      <div className="text-xs text-gray-400 font-roboto-mono">
        {details.map((detail: string, index: number) => (
          <div key={index} className="flex justify-between py-1 border-b border-gray-700 last:border-0">
            <span>{detail.split(': ')[0]}:</span>
            <span className="text-neon-cyan">{detail.split(': ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
            NEMI Dashboard
          </h1>
          <p className="text-gray-400 font-roboto-mono text-sm">
            Real-time Factory Intelligence Monitoring
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-orbitron font-bold text-neon-cyan">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-400">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* System Status Banner */}
      <div className={`glass-panel p-6 rounded-lg border-2 ${
        state.isSystemActive 
          ? 'border-neon-green bg-gradient-to-r from-green-900/20 to-transparent' 
          : 'border-gray-500 bg-gradient-to-r from-gray-800/20 to-transparent'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              state.isSystemActive ? 'bg-neon-green/20 border-2 border-neon-green' : 'bg-gray-500/20 border-2 border-gray-500'
            }`}>
              <Activity className={`w-6 h-6 ${state.isSystemActive ? 'text-neon-green animate-pulse' : 'text-gray-500'}`} />
            </div>
            <div>
              <h2 className="text-xl font-orbitron font-bold">
                System Status: {state.isSystemActive ? 'OPERATIONAL' : 'STANDBY'}
              </h2>
              <p className="text-gray-400 text-sm">
                {state.edgeNodes.filter(node => node.status === 'active').length} of {state.edgeNodes.length} edge nodes active
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-neon-cyan">
              {state.globalAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Global Accuracy</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Processing Speed"
          value={state.averageProcessingTime}
          unit="ms"
          trend="down"
          icon={Zap}
          color="text-neon-cyan"
          description="Average edge processing latency"
        />
        <MetricCard
          title="Privacy Score"
          value={state.privacyScore}
          unit="%"
          trend="stable"
          icon={Shield}
          color="text-neon-green"
          description="Data privacy protection level"
        />
        <MetricCard
          title="Defects Detected"
          value={state.totalDefectsDetected}
          unit="total"
          trend="up"
          icon={Eye}
          color="text-neon-pink"
          description="Cumulative micro-defects found"
        />
        <MetricCard
          title="FL Rounds"
          value={state.federatedLearningRounds}
          unit="completed"
          trend="up"
          icon={Network}
          color="text-bright-yellow"
          description="Federated learning iterations"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Timeline */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold mb-4 text-neon-cyan">
            Real-time Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280" 
                fontSize={10}
                interval={3}
              />
              <YAxis stroke="#6B7280" fontSize={10} />
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
                dataKey="accuracy" 
                stroke="#39FF14" 
                strokeWidth={2}
                name="Accuracy (%)"
              />
              <Line 
                type="monotone" 
                dataKey="processingTime" 
                stroke="#00E5FF" 
                strokeWidth={2}
                name="Speed (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Status */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold mb-4 text-neon-cyan">
            Compliance Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161B22', 
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {complianceData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-300">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edge Nodes Performance */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold mb-4 text-neon-cyan">
          Edge Node Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={edgeNodePerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={10} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#161B22', 
                border: '1px solid #00E5FF',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="accuracy" fill="#39FF14" name="Accuracy (%)" />
            <Bar dataKey="speed" fill="#00E5FF" name="Speed (ms)" />
            <Bar dataKey="defects" fill="#FF10F0" name="Defects Found" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusCard
          title="Federated Learning Network"
          status="active"
          details={[
            `Active Nodes: ${state.edgeNodes.filter(n => n.status === 'active').length}`,
            `Japan Nodes: ${state.edgeNodes.filter(n => n.location === 'japan' && n.status === 'active').length}`,
            `India Nodes: ${state.edgeNodes.filter(n => n.location === 'india' && n.status === 'active').length}`,
            `Global Rounds: ${state.federatedLearningRounds}`
          ]}
        />
        
        <StatusCard
          title="Privacy & Security"
          status="active"
          details={[
            `Encryption: AES-256`,
            `Data Locality: 100%`,
            `Zero Raw Transfer: ✓`,
            `Privacy Score: ${state.privacyScore}%`
          ]}
        />
        
        <StatusCard
          title="Temporal Analysis"
          status="active"
          details={[
            `Microsecond: Active`,
            `Second Scale: Active`,
            `Minute Scale: Active`,
            `Multi-Scale Fusion: ✓`
          ]}
        />
      </div>

      {/* Recent Activities */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold mb-4 text-neon-cyan">
          Recent System Activities
        </h3>
        <div className="space-y-3">
          {state.edgeNodes.slice(0, 8).map((node, index) => (
            <div key={node.id} className="flex items-center justify-between p-3 bg-gray-panel/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  node.status === 'active' ? 'bg-neon-green animate-pulse' : 
                  node.status === 'learning' ? 'bg-bright-yellow' : 'bg-gray-500'
                }`}></div>
                <div>
                  <span className="text-sm font-roboto-mono text-white">{node.id}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {node.location === 'japan' ? '🇯🇵' : '🇮🇳'} {node.location.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs font-roboto-mono">
                <div className="text-neon-cyan">{node.accuracy.toFixed(1)}% accuracy</div>
                <div className="text-gray-400">{node.processingTime.toFixed(1)}ms • {node.defectsDetected} defects</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
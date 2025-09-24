import React, { useState, useEffect } from 'react';
import { Globe2, TrendingUp, Users, Building, Handshake, DollarSign, Target, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useNEMI } from '../../context/NEMIContext';
import Interactive3DScene from '../interactive/Interactive3DScene';

interface CollaborationMetric {
  name: string;
  japan: number;
  india: number;
  combined: number;
  improvement: number;
}

interface TechnologyTransfer {
  id: string;
  from: 'Japan' | 'India';
  to: 'Japan' | 'India';
  technology: string;
  impact: string;
  status: 'planned' | 'active' | 'completed';
  benefit: number; // 0-100
}

const collaborationData: CollaborationMetric[] = [
  {
    name: 'Manufacturing Efficiency',
    japan: 95.2,
    india: 87.8,
    combined: 96.8,
    improvement: 8.4
  },
  {
    name: 'Quality Standards',
    japan: 99.1,
    india: 94.5,
    combined: 99.3,
    improvement: 4.2
  },
  {
    name: 'Cost Optimization',
    japan: 78.5,
    india: 92.1,
    combined: 94.7,
    improvement: 16.2
  },
  {
    name: 'Innovation Speed',
    japan: 88.4,
    india: 91.2,
    combined: 95.6,
    improvement: 7.2
  },
  {
    name: 'Scalability',
    japan: 85.3,
    india: 96.4,
    combined: 98.1,
    improvement: 12.8
  }
];

const technologyTransfers: TechnologyTransfer[] = [
  {
    id: 'jp-01',
    from: 'Japan',
    to: 'India',
    technology: 'Precision Manufacturing Standards',
    impact: 'Improved quality control processes',
    status: 'completed',
    benefit: 85
  },
  {
    id: 'jp-02',
    from: 'Japan',
    to: 'India',
    technology: 'IoT Sensor Integration',
    impact: 'Enhanced real-time monitoring',
    status: 'active',
    benefit: 72
  },
  {
    id: 'jp-03',
    from: 'Japan',
    to: 'India',
    technology: 'Lean Manufacturing Processes',
    impact: 'Reduced waste and improved efficiency',
    status: 'active',
    benefit: 68
  },
  {
    id: 'in-01',
    from: 'India',
    to: 'Japan',
    technology: 'AI Model Optimization',
    impact: 'Cost-effective edge computing',
    status: 'completed',
    benefit: 91
  },
  {
    id: 'in-02',
    from: 'India',
    to: 'Japan',
    technology: 'Scalable Cloud Architecture',
    impact: 'Improved system scalability',
    status: 'active',
    benefit: 76
  },
  {
    id: 'in-03',
    from: 'India',
    to: 'Japan',
    technology: 'Multi-language Compliance',
    impact: 'Enhanced global deployability',
    status: 'planned',
    benefit: 83
  }
];

const economicImpactData = [
  { year: '2024', japan: 45, india: 32, combined: 89 },
  { year: '2025', japan: 68, india: 52, combined: 134 },
  { year: '2026', japan: 89, india: 78, combined: 189 },
  { year: '2027', japan: 112, india: 105, combined: 256 },
  { year: '2028', japan: 138, india: 134, combined: 342 },
];

const sectorBenefits = [
  { name: 'Automotive', value: 35, color: '#FF6B00' },
  { name: 'Electronics', value: 28, color: '#00E5FF' },
  { name: 'Pharmaceuticals', value: 22, color: '#39FF14' },
  { name: 'Food Processing', value: 15, color: '#FF10F0' },
];

function JapanIndiaCollab() {
  const { state } = useNEMI();
  const [selectedMetric, setSelectedMetric] = useState<CollaborationMetric>(collaborationData[0]);
  const [activeTransfers, setActiveTransfers] = useState(technologyTransfers.filter(t => t.status === 'active').length);

  const CollaborationCard = ({ title, japanValue, indiaValue, combinedValue, improvement, icon: Icon }: any) => (
    <div 
      className={`metric-card cursor-pointer transition-all duration-300 ${
        selectedMetric.name === title ? 'ring-2 ring-neon-cyan shadow-glow' : 'hover:shadow-glow'
      }`}
      onClick={() => setSelectedMetric(collaborationData.find(d => d.name === title) || collaborationData[0])}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="w-5 h-5 text-neon-cyan" />
        <h3 className="font-orbitron font-bold text-sm">{title}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">🇯🇵 Japan:</span>
          <span className="text-orange-japan font-bold">{japanValue.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">🇮🇳 India:</span>
          <span className="text-green-india font-bold">{indiaValue.toFixed(1)}%</span>
        </div>
        <div className="h-px bg-gradient-to-r from-orange-japan to-green-india"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Combined:</span>
          <span className="text-neon-cyan font-bold text-lg">{combinedValue.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neon-green">↑ Improvement:</span>
          <span className="text-neon-green font-bold">+{improvement.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );

  const TechnologyTransferCard = ({ transfer }: { transfer: TechnologyTransfer }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      transfer.from === 'Japan' 
        ? 'border-orange-japan bg-orange-japan/10' 
        : 'border-green-india bg-green-india/10'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{transfer.from === 'Japan' ? '🇯🇵' : '🇮🇳'}</span>
          <span className="text-sm font-roboto-mono">→</span>
          <span className="text-lg">{transfer.to === 'Japan' ? '🇯🇵' : '🇮🇳'}</span>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          transfer.status === 'completed' ? 'bg-neon-green/20 text-neon-green' :
          transfer.status === 'active' ? 'bg-bright-yellow/20 text-bright-yellow' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {transfer.status.toUpperCase()}
        </div>
      </div>
      
      <h4 className="font-orbitron font-bold text-sm text-white mb-1">
        {transfer.technology}
      </h4>
      <p className="text-xs text-gray-400 mb-3">{transfer.impact}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Impact:</span>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-cyan to-neon-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${transfer.benefit}%` }}
            ></div>
          </div>
          <span className="text-neon-cyan text-xs font-bold">{transfer.benefit}%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
          🇯🇵 Japan-India Collaboration 🇮🇳
        </h1>
        <p className="text-gray-400 font-roboto-mono text-sm mb-4">
          Bilateral technology partnership for advanced manufacturing intelligence
        </p>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-japan">67%</div>
            <div className="text-xs text-gray-400">Japan Contribution</div>
          </div>
          <Handshake className="w-8 h-8 text-neon-cyan animate-pulse" />
          <div className="text-center">
            <div className="text-2xl font-bold text-green-india">58%</div>
            <div className="text-xs text-gray-400">India Contribution</div>
          </div>
        </div>
      </div>

      {/* Key Partnership Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {collaborationData.map((metric) => (
          <CollaborationCard
            key={metric.name}
            title={metric.name}
            japanValue={metric.japan}
            indiaValue={metric.india}
            combinedValue={metric.combined}
            improvement={metric.improvement}
            icon={
              metric.name.includes('Efficiency') ? TrendingUp :
              metric.name.includes('Quality') ? Award :
              metric.name.includes('Cost') ? DollarSign :
              metric.name.includes('Innovation') ? Target :
              Building
            }
          />
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Metric Analysis */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
            {selectedMetric.name} Analysis
          </h3>
          
          <div className="space-y-6">
            {/* Comparison Visualization */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[selectedMetric]}>
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
                <Bar dataKey="japan" fill="#FF6B00" name="Japan" />
                <Bar dataKey="india" fill="#138808" name="India" />
                <Bar dataKey="combined" fill="#00E5FF" name="Combined" />
              </BarChart>
            </ResponsiveContainer>

            {/* Synergy Benefits */}
            <div className="bg-gradient-to-r from-orange-japan/10 via-neon-cyan/10 to-green-india/10 p-4 rounded-lg">
              <h4 className="font-orbitron font-bold text-neon-cyan mb-3">Collaboration Synergy</h4>
              <div className="grid grid-cols-2 gap-4 text-sm font-roboto-mono">
                <div>
                  <span className="text-gray-400">Individual Best:</span>
                  <span className="text-white ml-2">
                    {Math.max(selectedMetric.japan, selectedMetric.india).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Combined Result:</span>
                  <span className="text-neon-cyan ml-2">{selectedMetric.combined.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Synergy Gain:</span>
                  <span className="text-neon-green ml-2">+{selectedMetric.improvement.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Efficiency Multiplier:</span>
                  <span className="text-bright-yellow ml-2">
                    {(selectedMetric.combined / Math.max(selectedMetric.japan, selectedMetric.india)).toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Economic Impact Projection */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
            Economic Impact Projection
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={economicImpactData}>
              <defs>
                <linearGradient id="japanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="indiaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#138808" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#138808" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="combinedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
              <XAxis dataKey="year" stroke="#6B7280" fontSize={10} />
              <YAxis stroke="#6B7280" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161B22', 
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  `$${value}B`, 
                  name === 'japan' ? '🇯🇵 Japan' : name === 'india' ? '🇮🇳 India' : '🤝 Combined'
                ]}
              />
              <Area type="monotone" dataKey="combined" stackId="1" stroke="#00E5FF" fill="url(#combinedGradient)" />
              <Area type="monotone" dataKey="japan" stackId="2" stroke="#FF6B00" fill="url(#japanGradient)" />
              <Area type="monotone" dataKey="india" stackId="3" stroke="#138808" fill="url(#indiaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technology Transfer */}
      <div className="glass-panel p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-orbitron font-bold text-neon-cyan">
            Technology Transfer Pipeline
          </h3>
          <div className="flex items-center space-x-4 text-sm font-roboto-mono">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
              <span>{activeTransfers} Active Transfers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-bright-yellow rounded-full"></div>
              <span>{technologyTransfers.filter(t => t.status === 'completed').length} Completed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-orbitron font-bold text-orange-japan mb-4">
              🇯🇵 Japan → India Transfers
            </h4>
            <div className="space-y-3">
              {technologyTransfers.filter(t => t.from === 'Japan').map(transfer => (
                <TechnologyTransferCard key={transfer.id} transfer={transfer} />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-orbitron font-bold text-green-india mb-4">
              🇮🇳 India → Japan Transfers
            </h4>
            <div className="space-y-3">
              {technologyTransfers.filter(t => t.from === 'India').map(transfer => (
                <TechnologyTransferCard key={transfer.id} transfer={transfer} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sector Impact Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Benefits Distribution */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
            Sector Impact Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sectorBenefits}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={5}
                dataKey="value"
              >
                {sectorBenefits.map((entry, index) => (
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
            {sectorBenefits.map((sector, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: sector.color }}
                ></div>
                <span className="text-gray-300">{sector.name}: {sector.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Benefits */}
        <div className="glass-panel p-6 rounded-lg">
          <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
            Strategic Partnership Benefits
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-orange-japan/10 border border-orange-japan/30 rounded-lg">
              <h4 className="font-orbitron font-bold text-orange-japan mb-2">🇯🇵 Japan Gains</h4>
              <ul className="text-xs text-gray-300 space-y-1 font-roboto-mono">
                <li>• 40% reduction in AI development costs through Indian expertise</li>
                <li>• Access to scalable manufacturing infrastructure</li>
                <li>• Enhanced global market reach and localization</li>
                <li>• Accelerated innovation through diverse talent pool</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-india/10 border border-green-india/30 rounded-lg">
              <h4 className="font-orbitron font-bold text-green-india mb-2">🇮🇳 India Gains</h4>
              <ul className="text-xs text-gray-300 space-y-1 font-roboto-mono">
                <li>• 60% improvement in quality standards through Japanese precision</li>
                <li>• Advanced manufacturing technology transfer</li>
                <li>• Enhanced export competitiveness in global markets</li>
                <li>• Accelerated Industry 4.0 transformation</li>
              </ul>
            </div>
            
            <div className="p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
              <h4 className="font-orbitron font-bold text-neon-cyan mb-2">🤝 Mutual Benefits</h4>
              <ul className="text-xs text-gray-300 space-y-1 font-roboto-mono">
                <li>• Combined R&D strength: $2.3B annual investment</li>
                <li>• Complementary manufacturing capabilities</li>
                <li>• Enhanced supply chain resilience and flexibility</li>
                <li>• Joint IP development and technology standardization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          NEMI Collaboration Success Stories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-panel/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Building className="w-8 h-8 text-orange-japan" />
              <div>
                <h4 className="font-orbitron font-bold text-white">Toyota-Tata Motors</h4>
                <p className="text-xs text-gray-400">Automotive Partnership</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Joint implementation of NEMI edge AI systems across 15 manufacturing plants
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-roboto-mono">
              <div>
                <span className="text-gray-400">Quality Improvement:</span>
                <span className="text-neon-green ml-2">+23%</span>
              </div>
              <div>
                <span className="text-gray-400">Cost Reduction:</span>
                <span className="text-neon-green ml-2">-18%</span>
              </div>
              <div>
                <span className="text-gray-400">Defect Detection:</span>
                <span className="text-neon-green ml-2">+89%</span>
              </div>
              <div>
                <span className="text-gray-400">Time to Deploy:</span>
                <span className="text-neon-green ml-2">-45%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-panel/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-8 h-8 text-green-india" />
              <div>
                <h4 className="font-orbitron font-bold text-white">Panasonic-Wipro</h4>
                <p className="text-xs text-gray-400">Electronics Integration</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Federated learning network for precision component manufacturing
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-roboto-mono">
              <div>
                <span className="text-gray-400">Accuracy Gain:</span>
                <span className="text-neon-cyan ml-2">+15%</span>
              </div>
              <div>
                <span className="text-gray-400">Scale Efficiency:</span>
                <span className="text-neon-cyan ml-2">+67%</span>
              </div>
              <div>
                <span className="text-gray-400">Privacy Score:</span>
                <span className="text-neon-green ml-2">100%</span>
              </div>
              <div>
                <span className="text-gray-400">ROI Achievement:</span>
                <span className="text-neon-green ml-2">8 months</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-panel/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-8 h-8 text-neon-cyan" />
              <div>
                <h4 className="font-orbitron font-bold text-white">Joint R&D Initiative</h4>
                <p className="text-xs text-gray-400">Future Technologies</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Collaborative development of next-generation edge AI architectures
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-roboto-mono">
              <div>
                <span className="text-gray-400">Joint Patents:</span>
                <span className="text-bright-yellow ml-2">24 filed</span>
              </div>
              <div>
                <span className="text-gray-400">Research Investment:</span>
                <span className="text-bright-yellow ml-2">$127M</span>
              </div>
              <div>
                <span className="text-gray-400">Engineer Exchange:</span>
                <span className="text-bright-yellow ml-2">156 people</span>
              </div>
              <div>
                <span className="text-gray-400">Timeline:</span>
                <span className="text-bright-yellow ml-2">2025-2027</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Roadmap */}
      <div className="glass-panel p-6 rounded-lg">
        <h3 className="text-xl font-orbitron font-bold text-neon-cyan mb-4">
          Collaboration Roadmap 2024-2028
        </h3>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-orange-japan via-neon-cyan to-green-india"></div>
          
          <div className="space-y-8">
            {[
              { year: '2024', title: 'Foundation Phase', desc: 'Establish bilateral framework and initial pilot projects', side: 'left', color: 'orange-japan' },
              { year: '2025', title: 'Scale-Up Phase', desc: 'Deploy NEMI across 50+ factories, technology transfers', side: 'right', color: 'neon-cyan' },
              { year: '2026', title: 'Innovation Phase', desc: 'Joint R&D initiatives, next-gen AI development', side: 'left', color: 'green-india' },
              { year: '2027', title: 'Global Expansion', desc: 'International rollout, standardization efforts', side: 'right', color: 'bright-yellow' },
              { year: '2028', title: 'Leadership Phase', desc: 'Global leader in collaborative manufacturing intelligence', side: 'left', color: 'neon-pink' },
            ].map((milestone, index) => (
              <div key={index} className={`flex items-center ${milestone.side === 'left' ? '' : 'flex-row-reverse'}`}>
                <div className={`w-1/2 ${milestone.side === 'left' ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="p-4 bg-gray-panel/50 rounded-lg">
                    <h4 className={`font-orbitron font-bold text-${milestone.color} mb-2`}>
                      {milestone.year} - {milestone.title}
                    </h4>
                    <p className="text-sm text-gray-300">{milestone.desc}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full bg-${milestone.color} border-4 border-github-dark relative z-10`}></div>
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JapanIndiaCollab;
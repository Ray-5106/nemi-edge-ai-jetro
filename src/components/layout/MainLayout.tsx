import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Network, 
  Cpu, 
  Clock, 
  Microscope, 
  Globe2,
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import { useNEMI } from '../../context/NEMIContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { path: '/', name: 'Dashboard', icon: Activity },
  { path: '/edge-processing', name: 'Edge Processing', icon: Cpu },
  { path: '/federated-learning', name: 'Federated Learning', icon: Network },
  { path: '/temporal-analysis', name: 'Temporal Analysis', icon: Clock },
  { path: '/micro-detection', name: 'Micro Detection', icon: Microscope },
];

function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { state, startSystem, stopSystem, simulateFederatedLearning } = useNEMI();

  return (
    <div className="min-h-screen main-content">
      {/* Header */}
      <header className="lunar-nav sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4 slide-in-left">
              <div className="flex items-center space-x-3">
                <Brain className="w-10 h-10 text-fire-orange animate-float" />
                <div>
                  <h1 className="text-3xl font-orbitron font-black hero-title">
                    NEMI
                  </h1>
                  <p className="text-xs text-secondary font-inter font-medium">
                    Neural Edge Micro-Inspection
                  </p>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center space-x-6 slide-in-right">
              <div className="flex items-center space-x-3">
                <div className={`status-indicator ${state.isSystemActive ? 'active' : 'warning'}`}>
                  {state.isSystemActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm font-inter font-medium">
                <div className="flex items-center space-x-2 tooltip">
                  <span className="tooltiptext">Average edge processing latency</span>
                  <Zap className="w-5 h-5 text-fire-orange" />
                  <span className="text-primary">{state.averageProcessingTime.toFixed(1)}ms</span>
                </div>
                <div className="flex items-center space-x-2 tooltip">
                  <span className="tooltiptext">Data privacy protection level</span>
                  <Shield className="w-5 h-5 text-deep-orange" />
                  <span className="text-primary">{state.privacyScore}%</span>
                </div>
                <div className="text-fire-orange font-semibold">
                  Accuracy: {state.globalAccuracy.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="lunar-sidebar min-h-screen">
          <div className="p-6">
            <ul className="space-y-3">
              {navigationItems.map(({ path, name, icon: Icon }, index) => {
                const isActive = location.pathname === path;
                return (
                  <li key={path} className={`fade-in-up stagger-${index + 1}`}>
                    <Link
                      to={path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-inter font-medium text-sm">{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* System Metrics Sidebar */}
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-orbitron font-bold text-fire-orange uppercase tracking-wider">
                Live Metrics
              </h3>
              
              <div className="space-y-4">
                <div className="lunar-metric-card p-4">
                  <div className="text-xs text-muted mb-2 font-inter">Edge Nodes</div>
                  <div className="text-xl font-bold text-fire-orange">
                    {state.edgeNodes.filter(node => node.status === 'active').length}/{state.edgeNodes.length}
                  </div>
                </div>
                
                <div className="lunar-metric-card p-4">
                  <div className="text-xs text-muted mb-2 font-inter">Defects Detected</div>
                  <div className="text-xl font-bold text-deep-orange">
                    {state.totalDefectsDetected}
                  </div>
                </div>
                
                <div className="lunar-metric-card p-4">
                  <div className="text-xs text-muted mb-2 font-inter">FL Rounds</div>
                  <div className="text-xl font-bold text-accent-orange">
                    {state.federatedLearningRounds}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-sm font-orbitron font-bold text-fire-orange uppercase tracking-wider mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={state.isSystemActive ? stopSystem : startSystem}
                    className="w-full bruno-button text-sm py-3"
                  >
                    {state.isSystemActive ? '⏹ STOP SYSTEM' : '▶ START SYSTEM'}
                  </button>
                  
                  <button
                    onClick={simulateFederatedLearning}
                    disabled={!state.isSystemActive}
                    className="w-full bruno-button text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔄 FL ROUND
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="lunar-nav border-t border-fire-orange/20 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between text-sm text-secondary">
            <div className="flex items-center space-x-4 font-inter">
              <span className="font-semibold">© 2024 NEMI - Neural Edge Micro-Inspection</span>
              <span>•</span>
              <span>JETRO Hackathon 2025</span>
            </div>
            <div className="flex items-center space-x-4 font-inter">
              <span>🇯🇵 Japan-India Collaboration</span>
              <span>•</span>
              <span className="text-fire-orange font-semibold">Edge AI Privacy-First</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
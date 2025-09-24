import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NEMIProvider } from './context/NEMIContext';
import IntroLoader from './components/intro/IntroLoader';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import EdgeProcessing from './components/edge/EdgeProcessing';
import FederatedLearning from './components/federated/FederatedLearning';
import TemporalAnalysis from './components/temporal/TemporalAnalysis';
import MicroDefectDetection from './components/micro/MicroDefectDetection';
import './index.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload critical resources
    const preloadResources = async () => {
      // Simulate resource loading
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoaded(true);
    };
    
    preloadResources();
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (!isLoaded || showIntro) {
    return (
      <div className="min-h-screen bg-lunar-cream">
        <IntroLoader onComplete={handleIntroComplete} />
      </div>
    );
  }

  return (
    <NEMIProvider>
      <Router>
        <div className="min-h-screen bg-lunar-cream">
          {/* Particle background effect */}
          <div className="particle-bg">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 12}s`,
                  animationDuration: `${8 + Math.random() * 8}s`
                }}
              />
            ))}
          </div>
          
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/edge-processing" element={<EdgeProcessing />} />
              <Route path="/federated-learning" element={<FederatedLearning />} />
              <Route path="/temporal-analysis" element={<TemporalAnalysis />} />
              <Route path="/micro-detection" element={<MicroDefectDetection />} />
            </Routes>
          </MainLayout>
        </div>
      </Router>
    </NEMIProvider>
  );
}

export default App;

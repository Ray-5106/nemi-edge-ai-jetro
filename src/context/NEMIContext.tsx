import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

// Types for NEMI system state
interface EdgeNode {
  id: string;
  status: 'active' | 'inactive' | 'learning';
  location: 'japan' | 'india' | 'global';
  processingTime: number;
  accuracy: number;
  defectsDetected: number;
  lastUpdate: Date;
}

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  status: 'compliant' | 'warning' | 'violation';
  trend: 'up' | 'down' | 'stable';
  timestamp: Date;
}

interface NEMIState {
  isSystemActive: boolean;
  edgeNodes: EdgeNode[];
  globalAccuracy: number;
  totalDefectsDetected: number;
  averageProcessingTime: number;
  privacyScore: number;
  federatedLearningRounds: number;
  complianceMetrics: ComplianceMetric[];
  temporalAnalysis: {
    microsecond: any;
    second: any;
    minute: any;
    hour: any;
    day: any;
  };
  aiModel: tf.LayersModel | null;
  isModelLoading: boolean;
}

type NEMIAction =
  | { type: 'START_SYSTEM' }
  | { type: 'STOP_SYSTEM' }
  | { type: 'UPDATE_NODE'; payload: { nodeId: string; updates: Partial<EdgeNode> } }
  | { type: 'ADD_DEFECT_DETECTION'; payload: { nodeId: string; count: number } }
  | { type: 'UPDATE_COMPLIANCE_METRIC'; payload: ComplianceMetric }
  | { type: 'SET_MODEL'; payload: tf.LayersModel }
  | { type: 'SET_MODEL_LOADING'; payload: boolean }
  | { type: 'FEDERATED_LEARNING_ROUND' }
  | { type: 'UPDATE_TEMPORAL_DATA'; payload: { scale: string; data: any } };

const initialState: NEMIState = {
  isSystemActive: false,
  edgeNodes: [
    {
      id: 'node-japan-01',
      status: 'inactive',
      location: 'japan',
      processingTime: 8.3,
      accuracy: 99.7,
      defectsDetected: 0,
      lastUpdate: new Date(),
    },
    {
      id: 'node-japan-02',
      status: 'inactive',
      location: 'japan',
      processingTime: 7.9,
      accuracy: 99.8,
      defectsDetected: 0,
      lastUpdate: new Date(),
    },
    {
      id: 'node-india-01',
      status: 'inactive',
      location: 'india',
      processingTime: 9.1,
      accuracy: 99.5,
      defectsDetected: 0,
      lastUpdate: new Date(),
    },
    {
      id: 'node-india-02',
      status: 'inactive',
      location: 'india',
      processingTime: 8.7,
      accuracy: 99.6,
      defectsDetected: 0,
      lastUpdate: new Date(),
    },
  ],
  globalAccuracy: 99.7,
  totalDefectsDetected: 0,
  averageProcessingTime: 8.5,
  privacyScore: 100,
  federatedLearningRounds: 0,
  complianceMetrics: [
    {
      id: 'safety-compliance',
      name: 'Safety Compliance',
      value: 98.5,
      status: 'compliant',
      trend: 'up',
      timestamp: new Date(),
    },
    {
      id: 'quality-control',
      name: 'Quality Control',
      value: 97.2,
      status: 'compliant',
      trend: 'stable',
      timestamp: new Date(),
    },
    {
      id: 'environmental',
      name: 'Environmental',
      value: 95.8,
      status: 'warning',
      trend: 'down',
      timestamp: new Date(),
    },
  ],
  temporalAnalysis: {
    microsecond: null,
    second: null,
    minute: null,
    hour: null,
    day: null,
  },
  aiModel: null,
  isModelLoading: false,
};

function nemiReducer(state: NEMIState, action: NEMIAction): NEMIState {
  switch (action.type) {
    case 'START_SYSTEM':
      return {
        ...state,
        isSystemActive: true,
        edgeNodes: state.edgeNodes.map(node => ({
          ...node,
          status: 'active',
          lastUpdate: new Date(),
        })),
      };
    
    case 'STOP_SYSTEM':
      return {
        ...state,
        isSystemActive: false,
        edgeNodes: state.edgeNodes.map(node => ({
          ...node,
          status: 'inactive',
        })),
      };
    
    case 'UPDATE_NODE':
      return {
        ...state,
        edgeNodes: state.edgeNodes.map(node =>
          node.id === action.payload.nodeId
            ? { ...node, ...action.payload.updates, lastUpdate: new Date() }
            : node
        ),
      };
    
    case 'ADD_DEFECT_DETECTION':
      return {
        ...state,
        totalDefectsDetected: state.totalDefectsDetected + action.payload.count,
        edgeNodes: state.edgeNodes.map(node =>
          node.id === action.payload.nodeId
            ? { ...node, defectsDetected: node.defectsDetected + action.payload.count }
            : node
        ),
      };
    
    case 'UPDATE_COMPLIANCE_METRIC':
      return {
        ...state,
        complianceMetrics: state.complianceMetrics.map(metric =>
          metric.id === action.payload.id ? action.payload : metric
        ),
      };
    
    case 'SET_MODEL':
      return {
        ...state,
        aiModel: action.payload,
        isModelLoading: false,
      };
    
    case 'SET_MODEL_LOADING':
      return {
        ...state,
        isModelLoading: action.payload,
      };
    
    case 'FEDERATED_LEARNING_ROUND':
      return {
        ...state,
        federatedLearningRounds: state.federatedLearningRounds + 1,
        globalAccuracy: Math.min(99.9, state.globalAccuracy + 0.1),
      };
    
    case 'UPDATE_TEMPORAL_DATA':
      return {
        ...state,
        temporalAnalysis: {
          ...state.temporalAnalysis,
          [action.payload.scale]: action.payload.data,
        },
      };
    
    default:
      return state;
  }
}

// Context
const NEMIContext = createContext<{
  state: NEMIState;
  dispatch: React.Dispatch<NEMIAction>;
  startSystem: () => void;
  stopSystem: () => void;
  simulateDefectDetection: () => void;
  simulateFederatedLearning: () => void;
} | null>(null);

// Provider component
export function NEMIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(nemiReducer, initialState);

  // Initialize TensorFlow.js model (simplified for demo)
  useEffect(() => {
    const initModel = async () => {
      try {
        dispatch({ type: 'SET_MODEL_LOADING', payload: true });
        
        // Create a simple sequential model for demo purposes
        const model = tf.sequential({
          layers: [
            tf.layers.conv2d({
              inputShape: [224, 224, 3],
              filters: 32,
              kernelSize: 3,
              activation: 'relu',
            }),
            tf.layers.maxPooling2d({ poolSize: 2 }),
            tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
            tf.layers.maxPooling2d({ poolSize: 2 }),
            tf.layers.flatten(),
            tf.layers.dense({ units: 64, activation: 'relu' }),
            tf.layers.dense({ units: 10, activation: 'softmax' }),
          ],
        });
        
        dispatch({ type: 'SET_MODEL', payload: model });
      } catch (error) {
        console.error('Failed to initialize AI model:', error);
        dispatch({ type: 'SET_MODEL_LOADING', payload: false });
      }
    };

    initModel();
  }, []);

  // Simulation functions
  const startSystem = () => {
    dispatch({ type: 'START_SYSTEM' });
    
    // Start continuous simulation
    const interval = setInterval(() => {
      if (state.isSystemActive) {
        simulateDefectDetection();
        updateNodeMetrics();
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const stopSystem = () => {
    dispatch({ type: 'STOP_SYSTEM' });
  };

  const simulateDefectDetection = () => {
    const randomNode = state.edgeNodes[Math.floor(Math.random() * state.edgeNodes.length)];
    if (randomNode.status === 'active' && Math.random() > 0.7) {
      dispatch({
        type: 'ADD_DEFECT_DETECTION',
        payload: { nodeId: randomNode.id, count: Math.floor(Math.random() * 3) + 1 },
      });
    }
  };

  const simulateFederatedLearning = () => {
    // Simulate federated learning round
    dispatch({ type: 'FEDERATED_LEARNING_ROUND' });
    
    // Update node statuses to learning
    state.edgeNodes.forEach(node => {
      if (node.status === 'active') {
        dispatch({
          type: 'UPDATE_NODE',
          payload: {
            nodeId: node.id,
            updates: { status: 'learning' },
          },
        });
        
        // After 3 seconds, return to active
        setTimeout(() => {
          dispatch({
            type: 'UPDATE_NODE',
            payload: {
              nodeId: node.id,
              updates: { status: 'active' },
            },
          });
        }, 3000);
      }
    });
  };

  const updateNodeMetrics = () => {
    state.edgeNodes.forEach(node => {
      if (node.status === 'active') {
        const processingTimeVariation = (Math.random() - 0.5) * 2; // ±1ms variation
        const accuracyVariation = (Math.random() - 0.5) * 0.2; // ±0.1% variation
        
        dispatch({
          type: 'UPDATE_NODE',
          payload: {
            nodeId: node.id,
            updates: {
              processingTime: Math.max(5, node.processingTime + processingTimeVariation),
              accuracy: Math.min(99.9, Math.max(95, node.accuracy + accuracyVariation)),
            },
          },
        });
      }
    });
  };

  const contextValue = {
    state,
    dispatch,
    startSystem,
    stopSystem,
    simulateDefectDetection,
    simulateFederatedLearning,
  };

  return (
    <NEMIContext.Provider value={contextValue}>
      {children}
    </NEMIContext.Provider>
  );
}

// Hook to use NEMI context
export function useNEMI() {
  const context = useContext(NEMIContext);
  if (!context) {
    throw new Error('useNEMI must be used within a NEMIProvider');
  }
  return context;
}

export default NEMIContext;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Zap, Battery, ThermometerSun } from 'lucide-react';
import StatCard from './components/StatCard';
import EnergyChart from './components/EnergyChart';
import AlertsPanel from './components/AlertsPanel';
import Chatbot from './components/Chatbot';
import SimulationPage from './components/SimulationPage';
import './index.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    current_state: null,
    status_message: '',
    alerts: [],
    historical: []
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dataRes, predRes] = await Promise.all([
        axios.get(`${API_URL}/data`),
        axios.get(`${API_URL}/predict`).catch(() => ({ data: { predicted_generation: null } }))
      ]);
      
      setData(dataRes.data);
      if (predRes.data.predicted_generation !== null) {
        setPrediction(predRes.data.predicted_generation);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback for UI visualization if backend is offline
      if (loading) {
         setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  const state = data.current_state || {
    Temperature: 0, Generated_Energy: 0, Usage: 0, Battery_Level: 0, Cloud_Percentage: 0
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1><Sun size={40} className="color-yellow" style={{background: 'none'}} /> Smart Solar System</h1>
          <p>Real-time Energy Generation & Monitoring</p>
        </div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'simulation' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulation')}
          >
            ML Simulation Lab
          </button>
        </div>
      </header>

      {activeTab === 'dashboard' ? (
        <>
          <div className="grid-stats">
        <StatCard 
          title="Generated Energy" 
          value={state.Generated_Energy} 
          unit="W"
          icon={<Sun size={28} />} 
          colorClass="color-yellow"
          trend={{ text: 'Based on sunlight & weather', positive: true }}
        />
        <StatCard 
          title="Energy Usage" 
          value={state.Usage} 
          unit="W"
          icon={<Zap size={28} />} 
          colorClass="color-cyan"
        />
        <StatCard 
          title="Battery Level" 
          value={state.Battery_Level} 
          unit="%"
          icon={<Battery size={28} />} 
          colorClass={state.Battery_Level > 20 ? "color-green" : "color-red"}
        />
        <StatCard 
          title="Panel Temperature" 
          value={state.Temperature} 
          unit="°C"
          icon={<ThermometerSun size={28} />} 
          colorClass={state.Temperature > 35 ? "color-red" : "color-blue"}
        />
      </div>

      <div className="grid-main">
        <EnergyChart data={data.historical.length > 0 ? data.historical : [state]} />
        <AlertsPanel 
          alerts={data.alerts} 
          decisionMsg={data.status_message}
          predictionMsg={prediction !== null ? `Expected next hour generation: ${prediction} W` : null}
        />
      </div>
      </>
      ) : (
        <SimulationPage />
      )}

      <Chatbot />
    </div>
  );
}

export default App;

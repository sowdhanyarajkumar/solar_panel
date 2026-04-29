import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ThermometerSun, CloudRain, Zap, Battery, Settings2 } from 'lucide-react';

const SimulationPage = () => {
  const [params, setParams] = useState({
    Temperature: 28,
    Cloud_Percentage: 20,
    Battery_Level: 80,
    Usage: 1000
  });
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSimulation = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/simulate', params);
      setData(response.data);
    } catch (error) {
      console.error("Simulation error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
    // eslint-disable-next-line
  }, [params]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="simulation-container">
      <div className="simulation-sidebar">
        <div className="sidebar-header">
          <Settings2 size={24} className="color-cyan" />
          <h2>Simulation Constraints</h2>
        </div>
        
        <div className="slider-group">
          <label><ThermometerSun size={18} /> Base Temperature: {params.Temperature}°C</label>
          <input 
            type="range" 
            name="Temperature" 
            min="10" 
            max="50" 
            value={params.Temperature} 
            onChange={handleChange} 
            className="slider temp-slider"
          />
        </div>

        <div className="slider-group">
          <label><CloudRain size={18} /> Cloud Coverage: {params.Cloud_Percentage}%</label>
          <input 
            type="range" 
            name="Cloud_Percentage" 
            min="0" 
            max="100" 
            value={params.Cloud_Percentage} 
            onChange={handleChange} 
            className="slider cloud-slider"
          />
        </div>

        <div className="slider-group">
          <label><Battery size={18} /> Starting Battery: {params.Battery_Level}%</label>
          <input 
            type="range" 
            name="Battery_Level" 
            min="0" 
            max="100" 
            value={params.Battery_Level} 
            onChange={handleChange} 
            className="slider battery-slider"
          />
        </div>

        <div className="slider-group">
          <label><Zap size={18} /> Constant Usage: {params.Usage}W</label>
          <input 
            type="range" 
            name="Usage" 
            min="100" 
            max="5000" 
            step="100"
            value={params.Usage} 
            onChange={handleChange} 
            className="slider usage-slider"
          />
        </div>
        
        <div className="sidebar-info">
          <p>These parameters act as the base constraints for a 24-hour cycle. The ML model uses them to simulate rising/falling sunlight and temperature.</p>
        </div>
      </div>

      <div className="simulation-main">
        <div className="chart-wrapper" style={{ height: '500px', width: '100%', padding: '2rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
          <h2 style={{marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
             24-Hour Energy Generation Forecast (ML Simulated)
             {loading && <span className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></span>}
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="Generated_Energy" name="Generated (W)" stroke="#F59E0B" fillOpacity={1} fill="url(#colorGen)" strokeWidth={3} />
              <Area type="monotone" dataKey="Usage" name="Usage (W)" stroke="#06B6D4" fillOpacity={1} fill="url(#colorUsage)" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EnergyChart = ({ data }) => {
  // Format data for recharts
  const chartData = data.map((d, index) => ({
    time: `T-${data.length - index}`,
    generated: d.Generated_Energy,
    usage: d.Usage,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
            Generated: {payload[0].value} W
          </p>
          <p style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>
            Usage: {payload[1].value} W
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ height: '400px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>Energy Flow History</h2>
      <div style={{ width: '100%', height: 'calc(100% - 3rem)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
            <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="generated" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorGen)" />
            <Area type="monotone" dataKey="usage" stroke="var(--accent-purple)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyChart;

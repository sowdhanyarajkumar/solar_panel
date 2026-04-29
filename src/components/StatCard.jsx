import React from 'react';

const StatCard = ({ title, value, icon, colorClass, trend, unit }) => {
  return (
    <div className="glass-card stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{title}</span>
        <div className={`stat-icon ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="stat-value">
        {value} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{unit}</span>
      </div>
      {trend && (
        <div className={`stat-trend ${trend.positive ? 'color-cyan' : 'color-red'}`} style={{ background: 'none' }}>
          {trend.text}
        </div>
      )}
    </div>
  );
};

export default StatCard;

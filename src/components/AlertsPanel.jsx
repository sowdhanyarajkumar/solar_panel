import React from 'react';
import { AlertTriangle, Info, CheckCircle2, XOctagon } from 'lucide-react';

const AlertsPanel = ({ alerts, predictionMsg, decisionMsg }) => {
  
  const getIcon = (type) => {
    switch(type) {
      case 'danger': return <XOctagon size={24} />;
      case 'warning': return <AlertTriangle size={24} />;
      case 'success': return <CheckCircle2 size={24} />;
      default: return <Info size={24} />;
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>System Alerts & Decisions</h2>
      
      <div className="alerts-container">
        {/* Main Decision Status */}
        <div className="alert-item alert-info">
          <div className="alert-icon">{getIcon('info')}</div>
          <div>
            <strong>System Action</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{decisionMsg || 'Optimizing power distribution...'}</p>
          </div>
        </div>

        {/* Prediction Info */}
        {predictionMsg && (
          <div className="alert-item alert-success">
            <div className="alert-icon">{getIcon('success')}</div>
            <div>
              <strong>AI Prediction</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{predictionMsg}</p>
            </div>
          </div>
        )}

        {/* Dynamic Alerts */}
        {alerts.length === 0 ? (
          <div className="alert-item alert-success">
            <div className="alert-icon">{getIcon('success')}</div>
            <div>
              <strong>All Systems Normal</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>No active warnings or overheating detected.</p>
            </div>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div key={idx} className={`alert-item alert-${alert.type}`}>
              <div className="alert-icon">
                {getIcon(alert.type)}
              </div>
              <div>
                <strong style={{ textTransform: 'capitalize' }}>{alert.type} Alert</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{alert.msg}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;

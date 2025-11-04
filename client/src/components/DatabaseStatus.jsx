import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DatabaseStatus.css';

/**
 * Component to display database connection status
 * Can be used in admin panels or during development to monitor connection status
 */
const DatabaseStatus = ({ showDetails = false }) => {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    stateDescription: 'unknown',
    error: null
  });

  const fetchStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const response = await axios.get('/api/db-status');
      setStatus({
        loading: false,
        connected: response.data.connected,
        stateDescription: response.data.stateDescription,
        host: response.data.host,
        database: response.data.database,
        tips: response.data.tips,
        error: null
      });
    } catch (error) {
      setStatus({
        loading: false,
        connected: false,
        stateDescription: 'error',
        error: error.message || 'Failed to fetch database status'
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll for status updates every 30 seconds
    const intervalId = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = () => {
    if (status.loading) return '#ccc';
    if (status.connected) return '#4CAF50';
    return '#F44336';
  };

  const getStatusText = () => {
    if (status.loading) return 'Checking connection...';
    if (status.connected) return 'Connected';
    return 'Disconnected';
  };

  return (
    <div className="database-status">
      <div className="status-indicator">
        <div 
          className="status-dot" 
          style={{ backgroundColor: getStatusColor() }}
          title={status.stateDescription}
        />
        <span className="status-text">{getStatusText()}</span>
        <button 
          className="refresh-button" 
          onClick={fetchStatus} 
          title="Refresh status"
          disabled={status.loading}
        >
          ↻
        </button>
      </div>

      {showDetails && !status.loading && (
        <div className="status-details">
          {status.connected ? (
            <>
              <p><strong>State:</strong> {status.stateDescription}</p>
              <p><strong>Host:</strong> {status.host}</p>
              <p><strong>Database:</strong> {status.database}</p>
            </>
          ) : (
            <>
              <p><strong>State:</strong> {status.stateDescription}</p>
              {status.error && <p><strong>Error:</strong> {status.error}</p>}
              
              {status.tips && status.tips.length > 0 && (
                <div className="troubleshooting-tips">
                  <h4>Troubleshooting Tips:</h4>
                  <ul>
                    {status.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;
import React from 'react';
import DatabaseStatus from './DatabaseStatus';

/**
 * Example component showing how to use the DatabaseStatus component
 * This can be included in admin panels, settings pages, or during development
 */
const DatabaseStatusExample = () => {
  return (
    <div className="database-status-example">
      <h2>Database Connection Status</h2>
      
      {/* Basic usage - just shows connection status */}
      <div>
        <h3>Basic Status Indicator</h3>
        <p>Simple indicator showing if the database is connected:</p>
        <DatabaseStatus />
      </div>
      
      {/* Advanced usage with details */}
      <div style={{ marginTop: '30px' }}>
        <h3>Detailed Status Information</h3>
        <p>Full connection details with troubleshooting tips:</p>
        <DatabaseStatus showDetails={true} />
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>How to Use This Component</h3>
        <p>Import and add the DatabaseStatus component to your React components:</p>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
          {`import DatabaseStatus from './components/DatabaseStatus';

// Basic usage
<DatabaseStatus />

// With detailed information
<DatabaseStatus showDetails={true} />`}
        </pre>
        <p>
          <strong>Note:</strong> This component automatically refreshes the connection status every 30 seconds,
          but users can also manually refresh by clicking the refresh button.
        </p>
      </div>
    </div>
  );
};

export default DatabaseStatusExample;
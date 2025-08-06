import React from 'react';

const VoiceIndicator = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div className="voice-indicator">
      <div className="voice-indicator-content">
        <div className="voice-indicator-icon">🎤</div>
        <div className="voice-indicator-text">Listening...</div>
        <div className="voice-indicator-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default VoiceIndicator; 
import React, { useState, useEffect } from 'react';

const VoiceSearch = ({ onVoiceInput, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      onVoiceInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, setIsListening, onVoiceInput]);

  const handleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
    }
  };

  if (error) {
    return (
      <button 
        className="voice-search-btn error" 
        title="Voice search not supported"
        disabled
      >
        🎤
      </button>
    );
  }

  return (
    <button
      className={`voice-search-btn ${isListening ? 'listening' : ''}`}
      onClick={handleVoiceSearch}
      title={isListening ? 'Click to stop listening' : 'Click to start voice search'}
    >
      {isListening ? '🔴' : '🎤'}
    </button>
  );
};

export default VoiceSearch; 
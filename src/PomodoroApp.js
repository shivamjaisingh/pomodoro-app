import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RefreshCw, RotateCcw, Settings } from 'lucide-react';

const PomodoroApp = () => {
  const configurations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  // Create a ref for the audio element
  const audioRef = useRef(null);

  // Load initial state from localStorage or use default values
  const [mode, setMode] = useState(() => 
    localStorage.getItem('pomodoroMode') || 'pomodoro'
  );
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTimeLeft = localStorage.getItem('pomodoroTimeLeft');
    return savedTimeLeft ? parseInt(savedTimeLeft) : configurations[mode];
  });
  const [isRunning, setIsRunning] = useState(() => 
    localStorage.getItem('pomodoroIsRunning') === 'true'
  );
  const [completedSessions, setCompletedSessions] = useState(() => {
    const savedSessions = localStorage.getItem('pomodoroCompletedSessions');
    return savedSessions ? parseInt(savedSessions) : 0;
  });
  
  // Store the original time for each mode
  const [modeTimers, setModeTimers] = useState(() => {
    const saved = localStorage.getItem('pomodoroModeTimers');
    return saved ? JSON.parse(saved) : {
      pomodoro: configurations.pomodoro,
      shortBreak: configurations.shortBreak,
      longBreak: configurations.longBreak
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pomodoroMode', mode);
    localStorage.setItem('pomodoroTimeLeft', timeLeft.toString());
    localStorage.setItem('pomodoroIsRunning', isRunning.toString());
    localStorage.setItem('pomodoroCompletedSessions', completedSessions.toString());
    localStorage.setItem('pomodoroModeTimers', JSON.stringify(modeTimers));
  }, [mode, timeLeft, isRunning, completedSessions, modeTimers]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    // Play chime sound
    if (audioRef.current) {
      audioRef.current.play();
    }

    setIsRunning(false);
    if (mode === 'pomodoro') {
      setCompletedSessions(prev => prev + 1);
      // Determine next mode based on completed sessions
      setMode(completedSessions % 4 === 3 ? 'longBreak' : 'shortBreak');
    } else {
      // If in break mode (short or long), return to pomodoro
      setMode('pomodoro');
    }
    
    // Set time left based on the new mode
    setTimeLeft(configurations[mode === 'pomodoro' ? (completedSessions % 4 === 3 ? 'longBreak' : 'shortBreak') : 'pomodoro']);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(configurations[mode]);
  };

  const resetApp = () => {
    // Clear all localStorage items
    localStorage.removeItem('pomodoroMode');
    localStorage.removeItem('pomodoroTimeLeft');
    localStorage.removeItem('pomodoroIsRunning');
    localStorage.removeItem('pomodoroCompletedSessions');
    localStorage.removeItem('pomodoroModeTimers');

    // Reset all states to initial values
    setMode('pomodoro');
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setCompletedSessions(0);
    setModeTimers({
      pomodoro: configurations.pomodoro,
      shortBreak: configurations.shortBreak,
      longBreak: configurations.longBreak
    });
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const changeMode = (newMode) => {
    // Save the current mode's time before switching
    setModeTimers(prev => ({
      ...prev,
      [mode]: timeLeft
    }));

    // Switch to the new mode and use its saved time
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(modeTimers[newMode] || configurations[newMode]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      {/* Audio element for chime */}
      <audio ref={audioRef} src="/chime.mp3" preload="auto" />

      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-xl">
        <div className="flex justify-between mb-8 space-x-4">
          {Object.keys(configurations).map((timerMode) => (
            <button 
              key={timerMode}
              onClick={() => changeMode(timerMode)}
              title={`Switch to ${timerMode.charAt(0).toUpperCase() + timerMode.slice(1)} mode`}
              className={`px-7 py-4 text-lg sm:text-xl rounded-2xl transition-all duration-300 group relative font-bold ${
                mode === timerMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {timerMode.charAt(0).toUpperCase() + timerMode.slice(1)}
            </button>
          ))}
        </div>

        <div className="text-center mb-10">
          <div className="text-8xl sm:text-9xl font-bold text-blue-700 mb-4">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center mb-4">
            <button 
              className="bg-blue-100 text-blue-600 px-6 py-3 rounded-full shadow-md hover:bg-blue-200 transition-colors flex items-center space-x-2"
              title="Completed Pomodoro Sessions"
            >
              <Timer size={24} className="mr-2" />
              <span className="font-semibold">Sessions: {completedSessions}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center space-x-10">
          <button 
            onClick={toggleTimer} 
            title={isRunning ? "Pause Timer" : "Start Timer"}
            className="bg-blue-500 text-white p-7 rounded-full hover:bg-blue-600 transition-colors group relative shadow-xl"
          >
            {isRunning ? <Pause size={48} /> : <Play size={48} />}
          </button>
          
          <button 
            onClick={resetTimer} 
            title="Reset Current Timer"
            className="bg-blue-100 text-blue-600 p-7 rounded-full hover:bg-blue-200 transition-colors group relative shadow-xl"
          >
            <RefreshCw size={48} />
          </button>

          <button 
            onClick={resetApp} 
            title="Reset Entire App and Session"
            className="bg-red-100 text-red-600 p-7 rounded-full hover:bg-red-200 transition-colors group relative shadow-xl"
          >
            <RotateCcw size={48} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroApp;
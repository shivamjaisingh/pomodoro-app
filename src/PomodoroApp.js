import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RefreshCw, RotateCcw } from 'lucide-react';

const PomodoroApp = () => {
  const configurations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const audioRef = useRef(null);

  // Initialize states from localStorage or defaults
  const [mode, setMode] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('pomodoroMode') || 'pomodoro' : 'pomodoro'
  );
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTimeLeft = localStorage.getItem('pomodoroTimeLeft');
      return savedTimeLeft ? parseInt(savedTimeLeft, 10) : configurations[mode];
    }
    return configurations[mode];
  });
  const [isRunning, setIsRunning] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('pomodoroIsRunning') === 'true' : false
  );
  const [completedSessions, setCompletedSessions] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedSessions = localStorage.getItem('pomodoroCompletedSessions');
      return savedSessions ? parseInt(savedSessions, 10) : 0;
    }
    return 0;
  });
  
  const [modeTimers, setModeTimers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroModeTimers');
      return saved ? JSON.parse(saved) : {
        pomodoro: configurations.pomodoro,
        shortBreak: configurations.shortBreak,
        longBreak: configurations.longBreak
      };
    }
    return {
      pomodoro: configurations.pomodoro,
      shortBreak: configurations.shortBreak,
      longBreak: configurations.longBreak
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroMode', mode);
      localStorage.setItem('pomodoroTimeLeft', timeLeft.toString());
      localStorage.setItem('pomodoroIsRunning', isRunning.toString());
      localStorage.setItem('pomodoroCompletedSessions', completedSessions.toString());
      localStorage.setItem('pomodoroModeTimers', JSON.stringify(modeTimers));
    }
  }, [mode, timeLeft, isRunning, completedSessions, modeTimers]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }

    if (mode === 'pomodoro') {
      setCompletedSessions((prev) => {
        const newCount = prev + 1;
        const nextMode = (newCount % 4 === 3) ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(configurations[nextMode]);
        setIsRunning(true);
        return newCount;
      });
    } else {
      setMode('pomodoro');
      setTimeLeft(configurations.pomodoro);
      setIsRunning(true);
    }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pomodoroMode');
      localStorage.removeItem('pomodoroTimeLeft');
      localStorage.removeItem('pomodoroIsRunning');
      localStorage.removeItem('pomodoroCompletedSessions');
      localStorage.removeItem('pomodoroModeTimers');
    }

    setMode('pomodoro');
    setTimeLeft(configurations.pomodoro);
    setIsRunning(false);
    setCompletedSessions(0);
    setModeTimers({
      pomodoro: configurations.pomodoro,
      shortBreak: configurations.shortBreak,
      longBreak: configurations.longBreak
    });
  };

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const changeMode = (newMode) => {
    setModeTimers(prev => ({
      ...prev,
      [mode]: timeLeft
    }));

    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(modeTimers[newMode] || configurations[newMode]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <audio ref={audioRef} src="/chime.mp3" preload="auto" />

      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-xl">
        <div className="flex justify-between mb-8 space-x-4">
          {Object.keys(configurations).map((timerMode) => {
            let displayName;
            if (timerMode === 'longBreak') {
              displayName = 'Long Break';
            } else if (timerMode === 'shortBreak') {
              displayName = 'Short Break';
            } else {
              displayName = timerMode.charAt(0).toUpperCase() + timerMode.slice(1);
            }

            return (
              <button 
                key={timerMode}
                onClick={() => changeMode(timerMode)}
                title={`Switch to ${displayName} mode`}
                className={`px-7 py-4 text-lg sm:text-xl rounded-2xl transition-all duration-300 font-bold ${
                  mode === timerMode
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {displayName}
              </button>
            );
          })}
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
            className="bg-blue-500 text-white p-7 rounded-full hover:bg-blue-600 transition-colors relative shadow-xl"
          >
            {isRunning ? <Pause size={48} /> : <Play size={48} />}
          </button>

          <button
            onClick={pauseSession}
            title="Pause Session"
            className="bg-red-100 text-red-600 p-7 rounded-full hover:bg-red-200 transition-colors relative shadow-xl font-semibold"
          >
            Pause Session
          </button>
          
          <button 
            onClick={resetTimer} 
            title="Reset Current Timer"
            className="bg-blue-100 text-blue-600 p-7 rounded-full hover:bg-blue-200 transition-colors relative shadow-xl"
          >
            <RefreshCw size={48} />
          </button>

          <button 
            onClick={resetApp} 
            title="Reset Entire App and Session"
            className="bg-red-100 text-red-600 p-7 rounded-full hover:bg-red-200 transition-colors relative shadow-xl"
          >
            <RotateCcw size={48} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroApp;

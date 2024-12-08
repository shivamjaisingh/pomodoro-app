import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RefreshCw, RotateCcw } from 'lucide-react';

const PomodoroApp = () => {
  const configurations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const audioRef = useRef(null);

  const [mode, setMode] = useState(() => localStorage.getItem('pomodoroMode') || 'pomodoro');
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTimeLeft = localStorage.getItem('pomodoroTimeLeft');
    return savedTimeLeft ? parseInt(savedTimeLeft) : configurations[mode];
  });
  const [isRunning, setIsRunning] = useState(() => localStorage.getItem('pomodoroIsRunning') === 'true');
  const [completedSessions, setCompletedSessions] = useState(() => {
    const savedSessions = localStorage.getItem('pomodoroCompletedSessions');
    return savedSessions ? parseInt(savedSessions) : 0;
  });

  useEffect(() => {
    localStorage.setItem('pomodoroMode', mode);
    localStorage.setItem('pomodoroTimeLeft', timeLeft.toString());
    localStorage.setItem('pomodoroIsRunning', isRunning.toString());
    localStorage.setItem('pomodoroCompletedSessions', completedSessions.toString());
  }, [mode, timeLeft, isRunning, completedSessions]);

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
    if (audioRef.current) {
      audioRef.current.play();
    }
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setCompletedSessions(prev => prev + 1);
      setMode(completedSessions % 4 === 3 ? 'longBreak' : 'shortBreak');
    } else {
      setMode('pomodoro');
    }
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
    localStorage.removeItem('pomodoroMode');
    localStorage.removeItem('pomodoroTimeLeft');
    localStorage.removeItem('pomodoroIsRunning');
    localStorage.removeItem('pomodoroCompletedSessions');

    setMode('pomodoro');
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setCompletedSessions(0);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(configurations[newMode]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <audio ref={audioRef} src="/chime.mp3" preload="auto" />
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-xl">
        <div className="flex justify-between mb-8 space-x-4">
          {Object.keys(configurations).map((timerMode) => (
            <button 
              key={timerMode}
              onClick={() => changeMode(timerMode)}
              className={`px-7 py-4 text-lg sm:text-xl rounded-2xl font-bold transition-all duration-300 ${
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
            >
              <Timer size={24} className="mr-2" />
              <span className="font-semibold">Sessions: {completedSessions}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center space-x-10">
          <button 
            onClick={toggleTimer} 
            className="bg-blue-500 text-white p-7 rounded-full hover:bg-blue-600 transition-colors shadow-xl"
          >
            {isRunning ? <Pause size={48} /> : <Play size={48} />}
          </button>
          
          <button 
            onClick={resetTimer} 
            className="bg-blue-100 text-blue-600 p-7 rounded-full hover:bg-blue-200 transition-colors shadow-xl"
          >
            <RefreshCw size={48} />
          </button>

          <button 
            onClick={resetApp} 
            className="bg-red-100 text-red-600 p-7 rounded-full hover:bg-red-200 transition-colors shadow-xl"
          >
            <RotateCcw size={48} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroApp;

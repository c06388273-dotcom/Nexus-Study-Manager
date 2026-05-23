import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Play, Pause, RotateCcw, BrainCircuit } from 'lucide-react';

export default function StudyPage({ user }: { user: User }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound or notify
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] py-8">
      <div className="text-center space-y-2 mb-4 md:mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase">Study <span className="text-primary">Lab</span></h1>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mt-2 md:mt-4 px-4">Boost your productivity with Pomodoro.</p>
      </div>

      <div className="relative scale-90 md:scale-100">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-[6px] md:border-[8px] border-black bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center">
          <div className="flex gap-2 md:gap-4 mb-2 md:mb-4">
            <button 
              onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
              className={`text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest transition-colors ${mode === 'focus' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Focus
            </button>
            <button 
              onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
              className={`text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest transition-colors ${mode === 'break' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Break
            </button>
          </div>
          
          <div className="text-6xl md:text-7xl font-black tracking-tighter tabular-nums mb-4 md:mb-6 text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={toggleTimer}
              className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] md:rounded-[20px] bg-primary text-black flex items-center justify-center hover:bg-white transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            >
              {isActive ? <Pause className="w-7 h-7 md:w-8 md:h-8 fill-black" /> : <Play className="w-7 h-7 md:w-8 md:h-8 fill-black ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-10 h-10 md:w-12 md:h-12 rounded-[12px] md:rounded-[16px] border border-zinc-700 text-zinc-400 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 md:mt-12 p-6 md:p-8 border border-zinc-800 rounded-[24px] md:rounded-[40px] bg-zinc-900 max-w-md w-full text-center hover:border-primary transition-colors">
        <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4 opacity-80" />
        <p className="text-white font-black italic text-lg md:text-xl uppercase tracking-tight">Session Goal</p>
        <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2 px-4 md:px-8">Set a clear task before starting your timer.</p>
      </div>
    </div>
  );
}

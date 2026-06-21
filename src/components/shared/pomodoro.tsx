'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface PomodoroTimerProps {
  open: boolean;
  onClose: () => void;
}

export function PomodoroTimer({ open, onClose }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(25);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            new Audio('/notification.mp3').play().catch(() => {});
            return 0;
          }
          setMinutes((m) => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, minutes]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(totalMinutes);
    setSeconds(0);
  };

  const handleDurationChange = useCallback((value: number | readonly number[]) => {
    const m = Array.isArray(value) ? value[0] : value;
    setTotalMinutes(m);
    setMinutes(m);
    setSeconds(0);
    setIsRunning(false);
  }, []);

  if (!open) return null;

  const progress = ((totalMinutes * 60 - (minutes * 60 + seconds)) / (totalMinutes * 60)) * 100;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border bg-card shadow-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Timer className="h-4 w-4 text-teal-600" />
          <span>Pomodoro Timer</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mb-4 flex items-center justify-center">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
            strokeLinecap="round"
            className="text-teal-600"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
          />
        </svg>
        <span className="absolute text-3xl font-mono font-bold tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Button size="icon" variant="outline" onClick={resetTimer} className="h-9 w-9 rounded-full">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="lg" onClick={toggleTimer} className="h-12 w-12 rounded-full bg-teal-600 hover:bg-teal-700">
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Duration: {totalMinutes} min</span>
        </div>
        <Slider
          value={[totalMinutes]}
          onValueChange={handleDurationChange}
          min={5}
          max={60}
          step={5}
          className="[&_[role=slider]]:bg-teal-600"
        />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserData, TaskData } from '../types';
import { Trophy, Target, Zap, Clock, Brain, CheckSquare, Flame } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const mockChartData = Array.from({ length: 15 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (14 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    studyTime: Math.floor(Math.random() * 3) + 1.5,
    xp: Math.floor(Math.random() * 150) + 50,
  };
});

export default function DashboardPage({ user, userData }: { user: User, userData: UserData | null }) {
  const [habits, setHabits] = useState<TaskData[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, `users/${user.uid}/tasks`),
      where('type', '==', 'habit')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TaskData[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as TaskData);
      });
      // Limit to 3 habits for the goals preview
      setHabits(data.slice(0, 3));
    });
    return () => unsubscribe();
  }, [user]);

  const completedHabitsCount = habits.filter(h => h.status === 'completed').length;
  const habitProgress = habits.length > 0 ? `${completedHabitsCount}/${habits.length}` : '0/0';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out h-full flex flex-col pt-0 md:pt-4">
      <header className="mb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight md:leading-none mb-2 uppercase break-words">Welcome, <br/><span className="text-primary">{userData?.displayName || 'Student'}</span></h1>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Daily Life and Study Overview</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Productivity', value: '85', icon: Zap, color: 'text-primary' },
          { label: 'Streak', value: `${userData?.streak || 0}`, icon: Trophy, color: 'text-white' },
          { label: 'Study Time', value: '4.5H', icon: Clock, color: 'text-white' },
          { label: 'Daily Habits', value: habitProgress, icon: Target, color: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className="rounded-[24px] md:rounded-[40px] border border-zinc-800 bg-zinc-900/40 p-4 md:p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <p className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color} shrink-0`} />
            </div>
            <p className="text-3xl md:text-5xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-1 md:pb-4 pb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col lg:col-span-2">
          <h2 className="text-lg md:text-xl font-black italic tracking-tight mb-6 md:mb-8">PERFORMANCE HISTORY</h2>
          <div className="flex-1 min-h-[250px] w-full" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height={250} minWidth={1}>
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} 
                  dy={10} 
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #27272a', borderRadius: '16px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '12px', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="studyTime" name="Study Time (h)" stroke="#CCFF00" strokeWidth={3} fillOpacity={1} fill="url(#colorStudy)" />
                <Area yAxisId="right" type="monotone" dataKey="xp" name="XP Earned" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col flex-1">
            <h2 className="text-lg md:text-xl font-black italic tracking-tight mb-6 md:mb-8">DAILY HABITS GOALS</h2>
            <div className="space-y-6 flex-1">
              {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                   <Target className="w-8 h-8 mb-2 text-zinc-500" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No habits set yet</p>
                </div>
              ) : (
                habits.map((habit) => (
                  <div key={habit.id} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className={`w-1.5 h-6 ${habit.status === 'completed' ? 'bg-primary' : 'bg-transparent border border-zinc-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm uppercase tracking-wide truncate ${habit.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'}`}>{habit.title}</p>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Daily Habit</p>
                    </div>
                    {habit.status === 'completed' && <CheckSquare className="w-5 h-5 text-primary shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-primary text-black rounded-[32px] md:rounded-[40px] p-6 md:p-8 relative overflow-hidden flex flex-col min-h-[200px]">
            <h2 className="text-lg md:text-xl font-black italic tracking-tight mb-4">CURRENT STREAK</h2>
            <div className="flex-1 flex flex-col justify-center relative z-10 text-center items-center">
               <Flame className="w-8 h-8 md:w-10 md:h-10 text-black/20 mb-3 md:mb-4" />
               <p className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-2">
                 {userData?.streak || 0}
               </p>
               <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black/60">Days Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

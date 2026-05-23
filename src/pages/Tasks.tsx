import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { TaskData } from '../types';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export default function TasksPage({ user }: { user: User }) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [newTask, setNewTask] = useState('');
  const [taskType, setTaskType] = useState<'study'|'habit'|'todo'>('todo');

  useEffect(() => {
    const q = query(
      collection(db, `users/${user.uid}/tasks`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TaskData[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as TaskData);
      });
      setTasks(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/tasks`), {
        userId: user.uid,
        title: newTask.trim(),
        type: taskType,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewTask('');
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTaskStatus = async (task: TaskData) => {
    try {
      const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
      await updateDoc(taskRef, {
        status: task.status === 'completed' ? 'pending' : 'completed',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, taskId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pt-0 md:pt-4 pb-12 md:pb-4">
      <header className="mb-6 md:mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight md:leading-none mb-2 uppercase break-words">Tasks & <span className="text-primary">Habits</span></h1>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Manage your daily life and study goals.</p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] md:rounded-[40px] p-6 md:p-8">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="ADD A NEW TASK OR HABIT..."
            className="flex-1 bg-black border border-zinc-800 rounded-[16px] md:rounded-2xl px-4 md:px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary placeholder:text-zinc-700 transition-colors"
          />
          <div className="flex gap-4">
            <select 
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="flex-1 sm:flex-none bg-black border border-zinc-800 rounded-[16px] md:rounded-2xl px-4 md:px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="todo">To-Do</option>
              <option value="study">Study</option>
              <option value="habit">Habit</option>
            </select>
            <button type="submit" className="bg-primary text-black hover:bg-white px-6 md:px-8 py-4 rounded-[16px] md:rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shrink-0">
              <Plus className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] border flex items-center gap-4 md:gap-6 transition-colors ${task.status === 'completed' ? 'bg-zinc-900/20 border-zinc-900 opacity-50' : 'bg-black border-zinc-800 hover:border-primary'}`}>
            <button onClick={() => toggleTaskStatus(task)} className="text-zinc-600 hover:text-primary transition-colors outline-none shrink-0">
              {task.status === 'completed' ? <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-primary" /> : <Circle className="w-7 h-7 md:w-8 md:h-8" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-black tracking-tight text-lg md:text-xl truncate ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'}`}>{task.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                  task.type === 'study' ? 'bg-black text-white border-white' : 
                  task.type === 'habit' ? 'bg-primary/10 text-primary border-primary/20' : 
                  'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}>
                  {task.type}
                </span>
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} className="p-3 text-zinc-600 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors shrink-0 outline-none">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
}

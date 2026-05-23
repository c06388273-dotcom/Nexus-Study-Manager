import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Brain, LayoutDashboard, CheckSquare, MessageSquare, Flame, Trophy, PlayCircle } from 'lucide-react';
import DashboardPage from './pages/Dashboard';
import TasksPage from './pages/Tasks';
import StudyPage from './pages/Study';
import ChatPage from './pages/Chat';
import { UserData } from './types';

// Use a neon dark theme
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // Create user
            const newUserData = {
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Student',
              xp: 0,
              level: 1,
              streak: 1,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userRef, newUserData);
            setUserData({ id: currentUser.uid, ...newUserData } as UserData);
          } else {
            setUserData({ id: userSnap.id, ...userSnap.data() } as UserData);
          }
        } catch (error) {
          console.error("Error fetching user Data:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-primary font-black uppercase tracking-widest text-2xl">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter leading-none">CORE<span className="text-primary">.AI</span></h1>
        <p className="text-zinc-500 mb-12 max-w-sm text-center font-bold uppercase tracking-widest text-xs">AI-powered Study & Life</p>
        <button 
          onClick={handleLogin}
          className="px-8 py-4 rounded-full bg-primary text-black border-2 border-primary hover:bg-black hover:text-primary transition-all font-black uppercase tracking-widest text-sm"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col md:flex-row h-[100dvh] bg-[#050505] text-white overflow-hidden font-sans border-4 md:border-[12px] border-black selection:bg-primary/30">
        <Sidebar userData={userData} />
        <main className="flex-1 overflow-y-auto bg-[#050505] relative">
          
          <div className="p-6 md:p-8 relative z-10 h-full">
            <Routes>
              <Route path="/" element={<DashboardPage user={user} userData={userData} />} />
              <Route path="/tasks" element={<TasksPage user={user} />} />
              <Route path="/study" element={<StudyPage user={user} />} />
              <Route path="/chat" element={<ChatPage user={user} />} />
            </Routes>
          </div>
        </main>
        {/* Mobile Bottom Nav */}
        <div className="md:hidden flex border-t border-zinc-900 bg-[#050505] justify-around items-center pb-safe shrink-0">
          <MobileNav />
        </div>
      </div>
    </BrowserRouter>
  );
}

function MobileNav() {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Study', icon: PlayCircle, path: '/study' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
  ];
  return (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center gap-1 p-4 flex-1 transition-colors ${
              isActive ? 'text-primary' : 'text-zinc-600 hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6 shrink-0" />
            <span className="text-[10px] font-black uppercase">{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}

function Sidebar({ userData }: { userData: UserData | null }) {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Tasks & Habits', icon: CheckSquare, path: '/tasks' },
    { name: 'Study Focus', icon: PlayCircle, path: '/study' },
    { name: 'AI Tutor', icon: MessageSquare, path: '/chat' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-1/4 max-w-[280px] flex-col py-8 px-8 bg-[#050505] relative z-20 border-r border-zinc-900">
        <div className="mb-12 w-full">
          <h1 className="text-5xl font-black tracking-tighter leading-none">CORE<span className="text-primary">.AI</span></h1>
        </div>

        <nav className="w-full flex-1 space-y-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 text-xs uppercase tracking-widest font-bold transition-colors ${
                  isActive 
                  ? 'text-primary' 
                  : 'text-zinc-600 hover:text-white'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-primary' : 'bg-transparent border border-zinc-600'}`}></div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="w-full mt-auto pt-8 border-t border-zinc-900">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Current Status</p>
          <div className="text-7xl font-black leading-none mb-2 italic tracking-tighter">{userData?.streak || 0}</div>
          <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Day Streak 🔥</div>
          <div className="flex justify-between mt-6 items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">LVL {userData?.level || 1}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">{userData?.xp || 0} XP</span>
          </div>
          <div className="h-1 w-full bg-zinc-900 mt-2">
            <div className="h-full bg-primary" style={{ width: `${((userData?.xp || 0) % 1000) / 10}%` }} />
          </div>
        </div>
      </div>
      
      {/* Mobile Header Sidebar alternative */}
      <div className="md:hidden flex items-center justify-between p-4 px-6 border-b border-zinc-900 shrink-0">
        <h1 className="text-3xl font-black tracking-tighter leading-none">CORE<span className="text-primary">.AI</span></h1>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">LVL {userData?.level || 1}</span>
          <div className="flex items-center gap-1 font-bold text-white">
            <span className="text-primary">{userData?.streak || 0}</span><Flame className="w-4 h-4 text-orange-400" />
          </div>
        </div>
      </div>
    </>
  );
}


import React, { useState, useEffect } from 'react';
import { Sun, Moon, Calendar, Trophy, Flame, CheckCircle2, History, Trash2, Sunrise, CloudMoon, Coffee, Clock, Sunset, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notiflix from 'notiflix';

export default function App() {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [hasDoneToday, setHasDoneToday] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('sedekah_logs')) || [];
    setHistory(savedData);
    calculateStreak(savedData);
    checkToday(savedData);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const isSubuhTime = currentHour >= 4 && currentHour <= 6;

  const formatIndoDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getSkyTheme = () => {
    if (isSubuhTime) return "bg-[#0F172A] text-slate-100";
    if (currentHour >= 6 && currentHour < 11) return "bg-[#F0F9FF] text-sky-900";
    if (currentHour >= 11 && currentHour < 15) return "bg-[#FFFFFF] text-slate-800";
    if (currentHour >= 15 && currentHour < 18) return "bg-[#FFF7ED] text-orange-900";
    return "bg-[#0F172A] text-slate-100";
  };

  const getGreeting = () => {
    if (isSubuhTime) return { text: "Saatnya Subuh", icon: <Sunrise className="text-emerald-400" /> };
    if (currentHour >= 6 && currentHour < 11) return { text: "Selamat Pagi", icon: <Coffee className="text-sky-500" /> };
    if (currentHour >= 11 && currentHour < 15) return { text: "Selamat Siang", icon: <Sun className="text-yellow-500" /> };
    if (currentHour >= 15 && currentHour < 18) return { text: "Selamat Sore", icon: <Sunset className="text-orange-500" /> };
    return { text: "Selamat Malam", icon: <CloudMoon className="text-indigo-400" /> };
  };

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  const calculateStreak = (logs) => {
    if (logs.length === 0) { setStreak(0); return; }
    const uniqueDates = [...new Set(logs.map(l => l.date))].sort((a, b) => new Date(b) - new Date(a));
    let count = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    for (let dateStr of uniqueDates) {
      const d = new Date(dateStr); d.setHours(0,0,0,0);
      const diff = Math.floor((checkDate - d) / 86400000);
      if (diff <= 1) { count++; checkDate = d; } else break;
    }
    setStreak(count);
  };

  const checkToday = (logs) => {
    const today = new Date().toLocaleDateString();
    setHasDoneToday(logs.some(log => log.date === today));
  };

  const logSedekah = () => {
    if (hasDoneToday) return;
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGolden: isSubuhTime
    };
    const updated = [newLog, ...history];
    setHistory(updated);
    localStorage.setItem('sedekah_logs', JSON.stringify(updated));
    setHasDoneToday(true);
    calculateStreak(updated);
    Notiflix.Notify.success('Kebaikanmu hari ini telah dicatat..');
  };

  const deleteLog = (id) => {
    const updated = history.filter(log => log.id !== id);
    setHistory(updated);
    localStorage.setItem('sedekah_logs', JSON.stringify(updated));
    checkToday(updated);
    calculateStreak(updated);
  };

  const isDark = currentHour >= 18 || currentHour < 6;

  return (
    <div className={`min-h-screen transition-all duration-[2000ms] font-sans p-6 md:p-8 ${getSkyTheme()}`}>
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl transition-all duration-700 ${isDark ? 'bg-white/10' : 'bg-white shadow-sm border border-slate-100'}`}>
                {getGreeting().icon}
             </div>
             <div>
                <h2 className="text-lg font-bold tracking-tight">{getGreeting().text}</h2>
                <div className={`flex items-center gap-2 mt-0.5 font-mono text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  <Clock size={14} /> {formattedTime}
                </div>
             </div>
          </div>
        </header>

        <motion.div className={`relative rounded-[3rem] p-10 mb-10 text-center overflow-hidden transition-all duration-1000 shadow-2xl shadow-emerald-900/10 ${
            isSubuhTime ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white' : 
            isDark ? 'bg-[#1E293B] border border-white/5 text-white' : 
            currentHour >= 15 && currentHour < 18 ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-orange-200/50' : 
            'bg-white text-slate-900 border border-slate-50'}`}>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="p-4 bg-emerald-500/10 rounded-full mb-2">
                 <Heart className={isSubuhTime || (currentHour >= 15 && currentHour < 18) ? "text-white animate-pulse" : "text-emerald-500"} size={48} fill="currentColor" />
              </div>
              <h2 className="text-8xl font-black italic tracking-tighter leading-none">{streak}</h2>
              <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-60 mt-3">HARI ISTIQOMAH</p>
            </div>

            <button 
              onClick={logSedekah} 
              disabled={hasDoneToday} 
              className={`w-full py-5 rounded-[1.5rem] font-bold text-sm transition-all active:scale-95 shadow-xl ${
                hasDoneToday 
                ? 'bg-slate-500/10 text-slate-400 cursor-not-allowed border border-white/5' 
                : isDark || isSubuhTime || (currentHour >= 15 && currentHour < 18)
                  ? 'bg-white text-slate-900 hover:bg-slate-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {hasDoneToday ? 'Kebaikan Hari Ini Tuntas' : '✨ KLIK BERKAH HARI INI'}
            </button>
          </div>
        </motion.div>

        <div className="space-y-5">
           <div className="flex items-center justify-between px-2">
              <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                 <History size={16} /> Jejak Kebaikan
              </h3>
           </div>

           <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence mode='popLayout'>
                {history.map(log => (
                  <motion.div key={log.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-5 rounded-[1.5rem] flex items-center justify-between border transition-all ${
                      isDark 
                      ? 'bg-white/5 border-white/5 text-white' 
                      : 'bg-white border-slate-100 text-slate-800 shadow-sm shadow-slate-100'
                    }`}>
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-full ${log.isGolden ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          <CheckCircle2 size={18} />
                       </div>
                       <div>
                         <p className="text-sm font-bold">{formatIndoDate(log.date)}</p>
                         <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{log.time} WIB</p>
                       </div>
                    </div>
                    <button onClick={() => deleteLog(log.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        body { -webkit-tap-highlight-color: transparent; }
      ` }} />
    </div>
  );
}
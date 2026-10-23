import React, { useState, useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { PageTab } from '../components/Sidebar';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Circle,
  Flame, 
  ArrowRight, 
  Mic, 
  FileEdit, 
  BookOpen, 
  Headphones, 
  Crown,
  Calendar,
  Sparkles,
  Award,
  Check,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: PageTab) => void;
}

interface DailyTask {
  id: string;
  title: string;
  skill: 'Listening' | 'Reading' | 'Speaking' | 'Writing';
  targetSection: PageTab;
  duration: string;
  description: string;
  completed: boolean;
  tag: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { mode } = useExam();
  const { user, setUser } = useUser();
  const { user: authUser } = useAuth();

  const candidateName = authUser?.name || user?.name || 'Nomzod';
  const firstName = candidateName.split(' ')[0];

  // Reja sozlamalari (IELTS.gg style Customizer)
  const [targetScore, setTargetScore] = useState<string>(() => {
    return localStorage.getItem('mocklife_target_band') || user.targetBand || '7.5 Academic';
  });
  const [daysRemaining, setDaysRemaining] = useState<number>(() => {
    const saved = localStorage.getItem('mocklife_days_remaining');
    return saved ? parseInt(saved, 10) : (user.daysLeft || 30);
  });
  const [dailyHours, setDailyHours] = useState<string>(() => {
    return localStorage.getItem('mocklife_daily_hours') || '1.5 soat';
  });
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Daily Tasks state with local persistence
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('mocklife_daily_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'task-1',
        title: 'Listening: Section 3 Academic Discussion',
        skill: 'Listening',
        targetSection: 'listening',
        duration: '15 daqiqa',
        description: 'Tashkent University loyiha muhokamasi bo\'yicha 10 ta test va audio tahlil',
        completed: true,
        tag: 'Section 3',
      },
      {
        id: 'task-2',
        title: 'Reading: Passage 2 Matching Headings & TFNG',
        skill: 'Reading',
        targetSection: 'reading',
        duration: '20 daqiqa',
        description: '"The Evolution of Modern Architecture" matni, 13 ta savol va yangi C1 lug\'at',
        completed: false,
        tag: 'Passage 2',
      },
      {
        id: 'task-3',
        title: '3D Foxy Speaking: Part 2 & Part 3 Topic',
        skill: 'Speaking',
        targetSection: 'speaking',
        duration: '12 daqiqa',
        description: '"Describe a technology that influenced your education" kartasi va 3 ta follow-up savol',
        completed: false,
        tag: 'Part 2 & 3',
      },
      {
        id: 'task-4',
        title: 'Writing Task 2: Agree / Disagree Structure',
        skill: 'Writing',
        targetSection: 'writing',
        duration: '25 daqiqa',
        description: 'AI ta\'limdagi o\'rni haqida insho skeletoni, tezis va 2 ta mustahkam argument',
        completed: false,
        tag: 'Task 2 Essay',
      },
    ];
  });

  const toggleTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      localStorage.setItem('mocklife_daily_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSavePlan = () => {
    localStorage.setItem('mocklife_target_band', targetScore);
    localStorage.setItem('mocklife_days_remaining', daysRemaining.toString());
    localStorage.setItem('mocklife_daily_hours', dailyHours);
    setUser(prev => ({
      ...prev,
      targetBand: targetScore,
      daysLeft: daysRemaining,
    }));
    setIsPlanModalOpen(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="flex flex-col w-full gap-8 pb-16 font-nunito">
      
      {/* 1. Hero Candidate & Roadmap Status (IELTS.gg Style) */}
      <section className="bg-white rounded-[28px] border border-[#eadfc9] p-6 sm:p-8 shadow-[0_4px_25px_rgba(80,60,20,0.05)] transition-all">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Avatar & Candidate Greeting */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center font-unbounded font-black text-xl sm:text-2xl border-2 border-[#fbd0c4] shadow-sm">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-unbounded font-black text-xl sm:text-2xl text-[#10152b] tracking-tight">
                  Salom, {firstName}! 👋
                </h1>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Shaxsiy Reja Faol
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4a5068] font-bold mt-1">
                Imtihongacha: <strong className="text-[#ef3b2d] font-black">{daysRemaining} kun</strong> • Maqsad: <strong className="text-[#10152b]">{targetScore}</strong> • Kunlik: <strong className="text-[#10152b]">{dailyHours}</strong>
              </p>
            </div>
          </div>

          {/* Right: Actions & Plan Customizer trigger */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-start lg:justify-end">
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#fdf6e9] border border-[#eadfc9] text-[#10152b] text-xs font-black shadow-xs transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#ef3b2d]" />
              <span>Rejani Sozlash</span>
            </button>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#ecfdf5] border border-emerald-200 text-emerald-800 text-xs font-black shadow-xs">
              <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>7 Kunlik VIP Sinov (Faol)</span>
            </div>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#eadfc9]">
          <div className="bg-[#fdf6e9] p-3.5 rounded-2xl border border-[#eadfc9]/70">
            <span className="text-[11px] font-bold text-[#7a7f95] block">Joriy Overall</span>
            <span className="font-unbounded font-black text-xl sm:text-2xl text-[#10152b]">
              {user.stats?.overallBand || 7.0}
            </span>
          </div>

          <div className="bg-[#fdf6e9] p-3.5 rounded-2xl border border-[#eadfc9]/70">
            <span className="text-[11px] font-bold text-[#7a7f95] block">Yechilgan Testlar</span>
            <span className="font-unbounded font-black text-xl sm:text-2xl text-[#10152b]">
              {user.stats?.testsCompleted || 14} <span className="text-xs font-bold text-[#7a7f95]">ta</span>
            </span>
          </div>

          <div className="bg-[#fdf6e9] p-3.5 rounded-2xl border border-[#eadfc9]/70">
            <span className="text-[11px] font-bold text-[#7a7f95] block">Tayyorgarlik Intizomi</span>
            <span className="font-unbounded font-black text-xl sm:text-2xl text-[#ff7a00] flex items-center gap-1">
              <Flame className="w-5 h-5 fill-[#ff7a00]" />
              {user.stats?.studyStreakDays || 9} <span className="text-xs font-bold text-[#7a7f95]">kun</span>
            </span>
          </div>

          <div className="bg-[#fdf6e9] p-3.5 rounded-2xl border border-[#eadfc9]/70">
            <span className="text-[11px] font-bold text-[#7a7f95] block">Maqsadgacha Farq</span>
            <span className="font-unbounded font-black text-xl sm:text-2xl text-[#ef3b2d]">
              +0.5 <span className="text-xs font-bold text-[#7a7f95]">ball</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. CORE: Bugungi Shaxsiy Tayyorlanish Rejasi (ielts.gg style daily curriculum) */}
      <section className="bg-white rounded-[28px] border border-[#eadfc9] p-6 sm:p-8 shadow-[0_4px_25px_rgba(80,60,20,0.05)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#eadfc9]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ef3b2d]/10 text-[#ef3b2d] font-black text-[10px] uppercase tracking-wider">
                Bugungi Reja • 14-kun
              </span>
              <span className="text-xs text-[#7a7f95] font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#ef3b2d]" />
                IELTS.gg Moslashtirilgan O'quv Dasturi
              </span>
            </div>
            <h2 className="font-unbounded font-black text-lg sm:text-xl text-[#10152b] mt-1">
              Bugungi Tayyorlanish Vazifalari
            </h2>
          </div>

          {/* Progress Pill */}
          <div className="flex items-center gap-3 bg-[#fdf6e9] px-4 py-2 rounded-2xl border border-[#eadfc9]">
            <div className="text-right">
              <span className="text-[11px] font-bold text-[#7a7f95] block">Bajarildi:</span>
              <span className="font-unbounded font-black text-sm text-[#10152b]">
                {completedCount} / {tasks.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-16 bg-[#eadfc9] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 gap-3.5 mt-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                task.completed 
                  ? 'bg-[#f8faf8] border-emerald-200/80 opacity-80' 
                  : 'bg-white border-[#eadfc9] hover:border-[#ef3b2d]/50 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 cursor-pointer text-emerald-600 hover:scale-110 transition shrink-0"
                  title={task.completed ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#eadfc9] hover:text-[#ef3b2d]" />
                  )}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      task.skill === 'Listening' ? 'bg-sky-100 text-sky-800' :
                      task.skill === 'Reading' ? 'bg-emerald-100 text-emerald-800' :
                      task.skill === 'Speaking' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {task.skill}
                    </span>
                    <span className="text-xs font-bold text-[#7a7f95] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.duration}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#10152b] bg-[#fdf6e9] px-2 py-0.5 rounded border border-[#eadfc9]">
                      {task.tag}
                    </span>
                  </div>

                  <h3 className={`font-unbounded font-bold text-sm sm:text-base ${
                    task.completed ? 'text-gray-500 line-through' : 'text-[#10152b]'
                  }`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#4a5068] font-bold mt-0.5">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => onNavigate(task.targetSection)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs ${
                    task.completed 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-[#10152b] hover:bg-[#2a3048] text-white'
                  }`}
                >
                  <span>{task.completed ? 'Qayta Ishlash' : 'Mashqni Boshlash'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ef3b2d]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 4-Haftalik IELTS Yo'l Xaritasi (Roadmap) */}
      <section className="bg-white rounded-[28px] border border-[#eadfc9] p-6 sm:p-8 shadow-[0_4px_25px_rgba(80,60,20,0.05)]">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d]" />
            <h2 className="font-unbounded font-black text-lg sm:text-xl text-[#10152b]">
              4 Haftalik IELTS Yo'l Xaritasi (Roadmap)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4a5068] font-bold mt-1">
            Maqsadli {targetScore} natijaga bosqichma-bosqich erishish uchun belgilangan o'quv traektoriyasi:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Week 1 */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-[#f8faf8] relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">1-Hafta</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                Bajarildi ✓
              </span>
            </div>
            <h3 className="font-unbounded font-bold text-sm text-[#10152b]">Asosiy Texnikalar</h3>
            <p className="text-xs text-[#4a5068] font-bold mt-1">
              Barcha 4 modul formatini to'liq tushunish, zaif tomonlarni aniqlash va vaqtni boshqarish.
            </p>
            <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Natija:</span>
              <span className="font-unbounded font-black">Band 6.5</span>
            </div>
          </div>

          {/* Week 2 */}
          <div className="p-5 rounded-2xl border-2 border-[#ef3b2d] bg-[#fffaf8] relative shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#ef3b2d]">2-Hafta</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ef3b2d] text-white text-[10px] font-black animate-pulse">
                Hozirgi Bosqich
              </span>
            </div>
            <h3 className="font-unbounded font-bold text-sm text-[#10152b]">Tezlik & Xatolar Tahlili</h3>
            <p className="text-xs text-[#4a5068] font-bold mt-1">
              Reading TFNG, Listening Section 3-4 va Writing Task 2 murakkab grammatikasini avtomatlashtirish.
            </p>
            <div className="mt-4 pt-3 border-t border-[#fbd0c4] flex items-center justify-between text-xs font-bold text-[#ef3b2d]">
              <span>Jarayon:</span>
              <span className="font-unbounded font-black">70% bajarildi</span>
            </div>
          </div>

          {/* Week 3 */}
          <div className="p-5 rounded-2xl border border-[#eadfc9] bg-[#fdf6e9]/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#7a7f95]">3-Hafta</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black">
                Navbatdagi
              </span>
            </div>
            <h3 className="font-unbounded font-bold text-sm text-[#10152b]">Band 7.5+ Strategiyasi</h3>
            <p className="text-xs text-[#4a5068] font-bold mt-1">
              Speaking Part 3 chuqur mulohaza, C1/C2 so'z boyligi va Writing Task 1 grafik analizini mukammallashtirish.
            </p>
            <div className="mt-4 pt-3 border-t border-[#eadfc9] flex items-center justify-between text-xs font-bold text-[#7a7f95]">
              <span>Rejalashtirilgan:</span>
              <span className="font-unbounded font-black">Band 7.5</span>
            </div>
          </div>

          {/* Week 4 */}
          <div className="p-5 rounded-2xl border border-[#eadfc9] bg-[#fdf6e9]/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#7a7f95]">4-Hafta</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black">
                Yakuniy
              </span>
            </div>
            <h3 className="font-unbounded font-bold text-sm text-[#10152b]">Full Mock Simulyatsiyasi</h3>
            <p className="text-xs text-[#4a5068] font-bold mt-1">
              Real imtihon muhitida 2 soat 45 daqiqalik to'liq testlar va psixologik tayyorgarlik.
            </p>
            <div className="mt-4 pt-3 border-t border-[#eadfc9] flex items-center justify-between text-xs font-bold text-[#7a7f95]">
              <span>Kutilayotgan:</span>
              <span className="font-unbounded font-black">Band 7.5–8.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Kundalik Mashg'ulotlar (Practice Labs — 4 ta Ko'nikma) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-unbounded font-black text-lg sm:text-xl text-[#10152b] flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d]" />
            Tayyorlanish Laboratoriyalari (Practice Hub)
          </h2>
          <p className="text-xs sm:text-sm text-[#4a5068] font-bold mt-0.5">
            Har bir bo'lim bo'yicha alohida ko'nikmalar ustida mustaqil ishlang:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Speaking Practice */}
          <div className="p-6 rounded-[24px] bg-white border border-[#eadfc9] hover:border-[#ff7a00] hover:shadow-md transition-all flex flex-col justify-between shadow-xs group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fff3e6] text-[#ff7a00] flex items-center justify-center border border-[#ffd5a8]">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="font-unbounded font-black text-2xl text-[#10152b]">
                    {user.stats?.speakingBand || 7.0}
                  </span>
                  <span className="text-[10px] text-[#7a7f95] block font-bold">Joriy Band</span>
                </div>
              </div>

              <h3 className="font-unbounded font-extrabold text-base text-[#10152b] group-hover:text-[#ff7a00] transition-colors">
                Speaking Lab
              </h3>
              <p className="text-xs text-[#4a5068] font-bold mt-1.5 leading-relaxed">
                3D Foxy bilan jonli ovozli suhbat, talaffuz va IELTS Part 1–3 mashqlari.
              </p>

              <div className="w-full bg-[#fdf6e9] h-2 rounded-full mt-4 overflow-hidden border border-[#eadfc9]">
                <div className="bg-[#ff7a00] h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('speaking')}
              className="mt-6 w-full py-3 rounded-full bg-[#ff7a00] hover:bg-[#e56d00] text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Speaking Mashqi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Writing Practice */}
          <div className="p-6 rounded-[24px] bg-white border border-[#eadfc9] hover:border-[#ef3b2d] hover:shadow-md transition-all flex flex-col justify-between shadow-xs group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center border border-[#fbd0c4]">
                  <FileEdit className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="font-unbounded font-black text-2xl text-[#10152b]">
                    {user.stats?.writingBand || 6.5}
                  </span>
                  <span className="text-[10px] text-[#7a7f95] block font-bold">Joriy Band</span>
                </div>
              </div>

              <h3 className="font-unbounded font-extrabold text-base text-[#10152b] group-hover:text-[#ef3b2d] transition-colors">
                Writing Lab
              </h3>
              <p className="text-xs text-[#4a5068] font-bold mt-1.5 leading-relaxed">
                Task 1 va Task 2 insholarini yozish, jonli so'z sanagich va tezkor AI baholash.
              </p>

              <div className="w-full bg-[#fdf6e9] h-2 rounded-full mt-4 overflow-hidden border border-[#eadfc9]">
                <div className="bg-[#ef3b2d] h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('writing')}
              className="mt-6 w-full py-3 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Writing Mashqi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reading Practice */}
          <div className="p-6 rounded-[24px] bg-white border border-[#eadfc9] hover:border-[#10b981] hover:shadow-md transition-all flex flex-col justify-between shadow-xs group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center border border-[#a7f3d0]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="font-unbounded font-black text-2xl text-[#10152b]">
                    {user.stats?.readingBand || 7.0}
                  </span>
                  <span className="text-[10px] text-[#7a7f95] block font-bold">Joriy Band</span>
                </div>
              </div>

              <h3 className="font-unbounded font-extrabold text-base text-[#10152b] group-hover:text-[#10b981] transition-colors">
                Reading Lab
              </h3>
              <p className="text-xs text-[#4a5068] font-bold mt-1.5 leading-relaxed">
                Ilmiy matnlarni tahlil qilish, so'zlarni belgilab Vocab Vault'ga saqlash.
              </p>

              <div className="w-full bg-[#fdf6e9] h-2 rounded-full mt-4 overflow-hidden border border-[#eadfc9]">
                <div className="bg-[#10b981] h-full rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('reading')}
              className="mt-6 w-full py-3 rounded-full bg-[#10b981] hover:bg-[#059669] text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Reading Mashqi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Listening Practice */}
          <div className="p-6 rounded-[24px] bg-white border border-[#eadfc9] hover:border-[#0284c7] hover:shadow-md transition-all flex flex-col justify-between shadow-xs group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center border border-[#bae6fd]">
                  <Headphones className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="font-unbounded font-black text-2xl text-[#10152b]">
                    {user.stats?.listeningBand || 7.5}
                  </span>
                  <span className="text-[10px] text-[#7a7f95] block font-bold">Joriy Band</span>
                </div>
              </div>

              <h3 className="font-unbounded font-extrabold text-base text-[#10152b] group-hover:text-[#0284c7] transition-colors">
                Listening Lab
              </h3>
              <p className="text-xs text-[#4a5068] font-bold mt-1.5 leading-relaxed">
                IELTS audiosini eshitish, Section 1–4 savollarini bajarish va tekshirish.
              </p>

              <div className="w-full bg-[#fdf6e9] h-2 rounded-full mt-4 overflow-hidden border border-[#eadfc9]">
                <div className="bg-[#0284c7] h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('listening')}
              className="mt-6 w-full py-3 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Listening Mashqi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Official Full Mock Exam Simulator (No fake TRF claims) */}
      <section className="bg-[#10152b] text-white rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#ef3b2d] text-white px-2.5 py-0.5 rounded-full">
              Rasmiy Imtihon Simulyatori
            </span>
            <span className="text-xs text-slate-400 font-bold">2 soat 45 daqiqa • Cambridge Standarti</span>
          </div>
          <h3 className="font-unbounded font-black text-lg sm:text-2xl tracking-tight text-white">
            Cambridge 19 Academic • To'liq Mock Imtihoni
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed">
            Listening, Reading, Writing va Speaking bo'limlarini haqiqiy vaqt me'yorida topshiring. Imtihondan so'ng har bir xatoingizga tahliliy izoh va aniq ball olasiz.
          </p>
        </div>

        <button
          onClick={() => onNavigate('mock-arena')}
          className="relative z-10 shrink-0 px-8 py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <span>Imtihonni Boshlash</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 6. Interactive Plan Customizer Modal (IELTS.gg style) */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[28px] border border-[#eadfc9] shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-unbounded font-black text-lg text-[#10152b]">
                  Shaxsiy Rejani Tuzish
                </h3>
                <p className="text-xs text-[#7a7f95] font-bold">
                  Maqsadingizga moslashtirilgan o'quv dasturi
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Target Band */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#10152b] block mb-2">
                  Maqsadli IELTS Ballingiz:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['6.5', '7.0', '7.5', '8.0+'].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setTargetScore(`${score} Academic`)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        targetScore.startsWith(score)
                          ? 'bg-[#ef3b2d] text-white border-[#ef3b2d]'
                          : 'bg-white text-[#10152b] border-[#eadfc9] hover:bg-[#fdf6e9]'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days Remaining */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#10152b] block mb-2">
                  Imtihongacha qolgan vaqt:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[14, 30, 60, 90].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysRemaining(days)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        daysRemaining === days
                          ? 'bg-[#10152b] text-white border-[#10152b]'
                          : 'bg-white text-[#10152b] border-[#eadfc9] hover:bg-[#fdf6e9]'
                      }`}
                    >
                      {days} kun
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Hours */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#10152b] block mb-2">
                  Kunlik ajratiladigan vaqt:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['45 daqiqa', '1.5 soat', '2.5 soat'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDailyHours(h)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        dailyHours === h
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-[#10152b] border-[#eadfc9] hover:bg-[#fdf6e9]'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#eadfc9] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSavePlan}
                className="px-6 py-2.5 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Yangi Rejani Saqlash</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default DashboardPage;

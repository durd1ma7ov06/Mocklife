import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { PageTab } from '../components/Sidebar';
import { 
  FileEdit, 
  BookOpen, 
  Mic, 
  Headphones, 
  Flame, 
  ArrowRight, 
  Check, 
  Award,
  Sparkles,
  Layers,
  Clock,
  Target,
  Play,
  CheckCircle2,
  Circle,
  Zap,
  BarChart3,
  Volume2,
  RotateCcw,
  BookCheck,
  X,
  ChevronRight,
  TrendingUp,
  Brain,
  HelpCircle
} from 'lucide-react';

interface PracticeHubPageProps {
  onNavigate: (tab: PageTab) => void;
}

type SkillTab = 'all' | 'writing' | 'reading' | 'speaking' | 'listening';

interface DailyRoutineItem {
  id: string;
  skill: 'writing' | 'reading' | 'speaking' | 'listening';
  title: string;
  duration: string;
  description: string;
  targetSection: PageTab;
  completed: boolean;
}

export const PracticeHubPage: React.FC<PracticeHubPageProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const [activeSkillTab, setActiveSkillTab] = useState<SkillTab>('all');
  const [quickPracticeSkill, setQuickPracticeSkill] = useState<'writing' | 'reading' | 'speaking' | 'listening' | null>(null);

  // Daily Routine Checklist with localStorage persistence
  const [routineTasks, setRoutineTasks] = useState<DailyRoutineItem[]>(() => {
    const saved = localStorage.getItem('mocklife_practice_routine');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'routine-writing',
        skill: 'writing',
        title: 'Writing Task 2: Agree / Disagree Structure',
        duration: '20 daqiqa',
        description: 'Argumentatsiya skeleti, tezis bayonoti va 2 ta akademik dalil yozish',
        targetSection: 'writing',
        completed: false,
      },
      {
        id: 'routine-reading',
        skill: 'reading',
        title: 'Reading Passage 1: Factual & TFNG Analizi',
        duration: '20 daqiqa',
        description: 'Urban Biodiversity matni, 13 ta True/False/Not Given savoli va yangi C1 lug\'at',
        targetSection: 'reading',
        completed: true,
      },
      {
        id: 'routine-speaking',
        skill: 'speaking',
        title: '3D Foxy Speaking: Part 2 Cue Card Mashqi',
        duration: '15 daqiqa',
        description: '1 daqiqalik tayyorgarlik taymeri, 2 daqiqa uzluksiz gapirish va AI talaffuz tahlili',
        targetSection: 'speaking',
        completed: false,
      },
      {
        id: 'routine-listening',
        skill: 'listening',
        title: 'Listening Section 1: Social Dialogue & Forms',
        duration: '15 daqiqa',
        description: 'Telefon orqali ro\'yxatdan o\'tish audio yozuvi, raqamlar va imlo tuzoqlarini aniqlash',
        targetSection: 'listening',
        completed: true,
      },
    ];
  });

  const toggleRoutineTask = (id: string) => {
    setRoutineTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      localStorage.setItem('mocklife_practice_routine', JSON.stringify(updated));
      return updated;
    });
  };

  const completedCount = routineTasks.filter(t => t.completed).length;
  const routineProgressPercent = Math.round((completedCount / routineTasks.length) * 100);

  // Quick Practice Modal Interactive States
  // 1. Writing quick state
  const [quickWritingText, setQuickWritingText] = useState('');
  const [quickWritingSubmitted, setQuickWritingSubmitted] = useState(false);

  // 2. Reading quick state
  const [quickReadingAnswers, setQuickReadingAnswers] = useState<Record<number, string>>({});
  const [quickReadingChecked, setQuickReadingChecked] = useState(false);

  // 3. Speaking quick state
  const [quickSpeakingTimer, setQuickSpeakingTimer] = useState<number>(60);
  const [quickSpeakingTimerActive, setQuickSpeakingTimerActive] = useState<boolean>(false);
  const [quickSpeakingRecording, setQuickSpeakingRecording] = useState<boolean>(false);
  const [quickSpeakingTranscript, setQuickSpeakingTranscript] = useState<string>('');

  // 4. Listening quick state
  const [quickListeningAnswers, setQuickListeningAnswers] = useState<Record<number, string>>({});
  const [quickListeningChecked, setQuickListeningChecked] = useState(false);
  const [quickAudioPlaying, setQuickAudioPlaying] = useState(false);
  const [quickAudioSpeed, setQuickAudioSpeed] = useState<'0.8x' | '1.0x' | '1.2x'>('1.0x');

  // Speaking countdown timer
  useEffect(() => {
    let interval: any = null;
    if (quickSpeakingTimerActive && quickSpeakingTimer > 0) {
      interval = setInterval(() => {
        setQuickSpeakingTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (quickSpeakingTimer === 0) {
      setQuickSpeakingTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [quickSpeakingTimerActive, quickSpeakingTimer]);

  // Main 4 Practice Modules Definition (ordered: Writing, Reading, Speaking, Listening)
  const practiceModules = [
    {
      id: 'writing' as PageTab,
      key: 'writing' as SkillTab,
      title: 'AI Writing Skills Evaluator',
      subtitle: 'Task 1 grafik & Task 2 akademik insho simulyatori',
      icon: FileEdit,
      color: 'text-[#ef3b2d]',
      iconBg: 'bg-[#fde3dc] border border-[#fbd0c4]',
      currentBand: user.stats?.writingBand || 6.5,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 72,
      exerciseCount: '10 ta insho turi • 40+ mavzu',
      desc: "Split-screen imtihon interfeysi, jonli so'z sanagich (150/250 so'z chegarasi), parafraza maslahatlari va CEFR/IELTS mezonlari bo'yicha tezkor AI ball.",
      features: ["Jonli So'z Sanagich", '40 daqiqalik Rasmiy Taymer', 'Task Achievement & Cohesion AI'],
      btnText: 'Writing Mashqini Boshlash',
      btnColor: 'bg-[#ef3b2d] hover:bg-[#d62f22] text-white',
    },
    {
      id: 'reading' as PageTab,
      key: 'reading' as SkillTab,
      title: 'Reading Lab & Smart Vocab Vault',
      subtitle: 'Passage 1, 2, 3 akademik matnlar & TFNG',
      icon: BookOpen,
      color: 'text-[#10b981]',
      iconBg: 'bg-[#ecfdf5] border border-[#a7f3d0]',
      currentBand: user.stats?.readingBand || 7.0,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 84,
      exerciseCount: '15 ta to\'liq passage • 60+ savol',
      desc: "MockLife ilmiy va tarixiy matnlari, 13-14 ta savolnomalar, bir marta bosish bilan so'zlarni Vocab Vault'ga saqlash va kontekstli tarjima.",
      features: ['Split-screen Matn & Savol', 'TFNG & Headings Tahlili', 'Smart Vocab Vault Saqlash'],
      btnText: 'Reading Mashqini Boshlash',
      btnColor: 'bg-[#10b981] hover:bg-[#059669] text-white',
    },
    {
      id: 'speaking' as PageTab,
      key: 'speaking' as SkillTab,
      title: '3D Foxy Speaking Arena',
      subtitle: 'Part 1, 2, 3 interaktiv ovozli AI suhbat',
      icon: Mic,
      color: 'text-[#ff7a00]',
      iconBg: 'bg-[#fff3e6] border border-[#ffd5a8]',
      currentBand: user.stats?.speakingBand || 7.0,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 78,
      exerciseCount: '25 ta dolzarb mavzu • 120+ savol',
      desc: "3D Foxy bilan jonli ovozli suhbat, mikrofon orqali Web Speech talaffuz tahlili, Part 2 taymerli Cue card va 4 ta IELTS mezoni bo'yicha darhol xatolar izohi.",
      features: ['Jonli Ovozli AI Suhbat', 'British RP Talaffuz & Audio', 'Fluency & Lexical Feedback'],
      btnText: 'Speaking Mashqini Boshlash',
      btnColor: 'bg-[#ff7a00] hover:bg-[#e56d00] text-white',
    },
    {
      id: 'listening' as PageTab,
      key: 'listening' as SkillTab,
      title: 'Listening Exam & Audio Lab',
      subtitle: 'Section 1–4 Cambridge formati audio pleyer',
      icon: Headphones,
      color: 'text-[#0284c7]',
      iconBg: 'bg-[#e0f2fe] border border-[#bae6fd]',
      currentBand: user.stats?.listeningBand || 7.5,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 88,
      exerciseCount: '16 ta audio trek • Section 1–4',
      desc: "Haqiqiy IELTS audio treklari, Section 1–4 savolnomalari, tezlik nazorati (0.75x–1.25x), interaktiv transkripsiya va distractor (tuzoq) so'zlar ogohlantirishi.",
      features: ['Audio Tezlik Nazorati', 'Interaktiv Transkript', 'Tuzoq Variantlar (Traps) Tahlili'],
      btnText: 'Listening Mashqini Boshlash',
      btnColor: 'bg-[#0284c7] hover:bg-[#0369a1] text-white',
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-6xl mx-auto font-nunito animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-[#eadfc9] shadow-[0_4px_25px_rgba(80,60,20,0.05)]">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#ef3b2d]">
              Daily Practice Labs • 4 Ta Asosiy Ko'nikma
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#10152b] text-white">
              Writing • Reading • Speaking • Listening
            </span>
          </div>
          <h1 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] tracking-tight">
            IELTS Mashq Qilish Markazi (Practice Hub)
          </h1>
          <p className="text-xs sm:text-sm text-[#4a5068] font-bold mt-1.5 max-w-2xl leading-relaxed">
            IELTS ko'nikmalarini har kuni 15–20 daqiqadan charxlab boring. 
            Writing, Reading, Speaking va Listening laboratoriyalaridan birini tanlab mustaqil mashg'ulotni boshlang.
          </p>
        </div>

        {/* Streak & Today's Metric Pill */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 bg-[#fdf6e9] px-4 py-3 rounded-2xl border border-[#eadfc9] shadow-xs">
            <Flame className="w-6 h-6 text-[#ff7a00] fill-[#ff7a00] animate-bounce" />
            <div>
              <div className="text-xs font-black text-[#10152b]">
                {user.stats?.studyStreakDays || 9} Kunlik Streak
              </div>
              <div className="text-[11px] text-[#7a7f95] font-bold">
                Bugun {completedCount}/4 ta mashq bajarildi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bugungi 4 ta Ko'nikma Mashq Qilish Nazorati (Interactive Daily Checklist) */}
      <div className="p-6 sm:p-7 rounded-[26px] bg-white border border-[#eadfc9] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#eadfc9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-unbounded font-black text-base sm:text-lg text-[#10152b]">
                Bugungi 4 ta Mashq Rejasi (Daily Routine)
              </h2>
              <p className="text-xs text-[#7a7f95] font-bold">
                Har bir ko'nikma bo'yicha mikro-mashq bajaring va band balingizni o'stiring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#fdf6e9] px-4 py-2 rounded-xl border border-[#eadfc9]">
            <span className="text-xs font-black text-[#10152b]">
              {completedCount} / {routineTasks.length} ({routineProgressPercent}%)
            </span>
            <div className="w-24 bg-[#eadfc9] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${routineProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Routine items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-5">
          {routineTasks.map((task) => {
            const skillColorMap = {
              writing: 'border-[#ef3b2d]/30 hover:border-[#ef3b2d]',
              reading: 'border-[#10b981]/30 hover:border-[#10b981]',
              speaking: 'border-[#ff7a00]/30 hover:border-[#ff7a00]',
              listening: 'border-[#0284c7]/30 hover:border-[#0284c7]',
            };

            const skillBadgeMap = {
              writing: 'bg-[#fde3dc] text-[#ef3b2d]',
              reading: 'bg-[#ecfdf5] text-[#10b981]',
              speaking: 'bg-[#fff3e6] text-[#ff7a00]',
              listening: 'bg-[#e0f2fe] text-[#0284c7]',
            };

            const skillIconMap = {
              writing: FileEdit,
              reading: BookOpen,
              speaking: Mic,
              listening: Headphones,
            };

            const Icon = skillIconMap[task.skill];

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  task.completed 
                    ? 'bg-emerald-50/40 border-emerald-200 opacity-90' 
                    : `bg-[#faf6ee] ${skillColorMap[task.skill]}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleRoutineTask(task.id)}
                    className="mt-0.5 text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                    title={task.completed ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-[#ef3b2d]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${skillBadgeMap[task.skill]}`}>
                        {task.skill}
                      </span>
                      <span className="text-[11px] font-bold text-[#7a7f95] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.duration}
                      </span>
                    </div>

                    <h3 className={`text-xs sm:text-sm font-extrabold ${task.completed ? 'line-through text-gray-500' : 'text-[#10152b]'}`}>
                      {task.title}
                    </h3>
                    <p className="text-[11px] text-[#4a5068] font-bold mt-0.5 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => onNavigate(task.targetSection)}
                    className="px-3 py-1.5 rounded-lg bg-[#10152b] hover:bg-[#ef3b2d] text-white text-[11px] font-black transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>O'tish</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setQuickPracticeSkill(task.skill)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#eadfc9] text-[10px] font-bold text-[#10152b] hover:bg-[#fdf6e9] transition"
                  >
                    Tezkor Mashq
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Skill Tabs Filter (Barchasi, Writing, Reading, Speaking, Listening) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'Barcha Mashqlar', icon: Layers },
          { id: 'writing', label: '✍️ Writing Mashqi', icon: FileEdit },
          { id: 'reading', label: '📖 Reading Mashqi', icon: BookOpen },
          { id: 'speaking', label: '🎙️ Speaking Mashqi', icon: Mic },
          { id: 'listening', label: '🎧 Listening Mashqi', icon: Headphones },
        ].map((tab) => {
          const isActive = activeSkillTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSkillTab(tab.id as SkillTab)}
              className={`px-5 py-2.5 rounded-full font-unbounded text-xs font-black tracking-wide flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#10152b] text-white shadow-md scale-102'
                  : 'bg-white hover:bg-[#fdf6e9] text-[#2a3048] border border-[#eadfc9]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Asosiy 4 ta Ko'nikma Kartalari (Writing, Reading, Speaking, Listening) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practiceModules
          .filter(module => activeSkillTab === 'all' || activeSkillTab === module.key)
          .map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className="p-6 sm:p-7 rounded-[26px] bg-white border border-[#eadfc9] hover:border-[#10152b] hover:shadow-xl transition-all duration-300 flex flex-col justify-between shadow-xs group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${module.iconBg} ${module.color} shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#fdf6e9] border border-[#eadfc9] text-[#7a7f95]">
                            {module.exerciseCount}
                          </span>
                        </div>
                        <h2 className="font-unbounded font-black text-lg text-[#10152b] group-hover:text-[#ef3b2d] transition-colors mt-1">
                          {module.title}
                        </h2>
                        <span className="text-xs text-[#7a7f95] font-bold block">
                          {module.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-unbounded font-black text-2xl text-[#10152b]">
                        {module.currentBand}
                      </div>
                      <span className="text-[10px] text-[#ef3b2d] font-extrabold block">
                        Maqsad: {module.targetBand}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#4a5068] font-bold leading-relaxed mb-4">
                    {module.desc}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {module.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fdf6e9] text-[#2a3048] border border-[#eadfc9]"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 mb-6">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#7a7f95]">
                      <span>Tayyorgarlik darajasi</span>
                      <span className="text-[#10152b] font-black">{module.progress}%</span>
                    </div>
                    <div className="w-full bg-[#fdf6e9] h-2 rounded-full overflow-hidden border border-[#eadfc9]">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[#ef3b2d]"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onNavigate(module.id)}
                    className={`flex-1 py-3.5 rounded-full ${module.btnColor} text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <span>{module.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setQuickPracticeSkill(module.key as any)}
                    className="px-4 py-3.5 rounded-full bg-[#fdf6e9] hover:bg-[#eadfc9] text-[#10152b] border border-[#eadfc9] text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    title="Shu sahifada 5 daqiqalik mini mashqni ochish"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#ff7a00]" />
                    <span>Tezkor</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* 5. Detailed Catalogs when specific skill is selected */}
      {activeSkillTab === 'writing' && (
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#eadfc9] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-unbounded font-black text-lg text-[#10152b]">
                ✍️ Writing Mashqlari Ro'yxati (Task 1 & Task 2)
              </h3>
              <p className="text-xs text-[#7a7f95] font-bold mt-1">
                Barcha rasmiy Cambridge formatidagi insho va grafik turlari
              </p>
            </div>
            <button
              onClick={() => onNavigate('writing')}
              className="px-4 py-2 rounded-full bg-[#ef3b2d] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>Writing Labni Ochish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#fde3dc] text-[#ef3b2d]">Task 1 Vizual Tahlil</span>
              <h4 className="font-bold text-sm text-[#10152b]">Grafiklar, Jadvallar & Xaritalar</h4>
              <p className="text-xs text-[#4a5068]">Line Graph, Bar Chart, Pie Chart, Process Diagram va Comparative Map tahlillari. Kamida 150 ta so'z, 20 daqiqa.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Line Graph', 'Bar Chart', 'Pie Chart', 'Process Flow', 'Map'].map(t => (
                  <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#eadfc9]">{t}</span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#fde3dc] text-[#ef3b2d]">Task 2 Akademik Insho</span>
              <h4 className="font-bold text-sm text-[#10152b]">5 Ta Asosiy Insho Turi</h4>
              <p className="text-xs text-[#4a5068]">Opinion (Agree/Disagree), Discussion (Both views), Advantages vs Disadvantages, Causes/Solutions va Direct Questions. Kamida 250 ta so'z, 40 daqiqa.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Opinion', 'Discussion', 'Adv/Disadv', 'Problem/Solution', 'Direct Q'].map(t => (
                  <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#eadfc9]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSkillTab === 'reading' && (
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#eadfc9] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-unbounded font-black text-lg text-[#10152b]">
                📖 Reading Mashqlari Ro'yxati (Passage 1, 2, 3)
              </h3>
              <p className="text-xs text-[#7a7f95] font-bold mt-1">
                Factual, Research va Complex Analytical ilmiy matnlar
              </p>
            </div>
            <button
              onClick={() => onNavigate('reading')}
              className="px-4 py-2 rounded-full bg-[#10b981] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>Reading Labni Ochish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">Passage 1</span>
              <h4 className="font-bold text-sm text-[#10152b]">Factual & Descriptive</h4>
              <p className="text-xs text-[#4a5068]">Urban Biodiversity, Tarixiy sanalar, aniq faktlar. True / False / Not Given savollari.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Passage 2</span>
              <h4 className="font-bold text-sm text-[#10152b]">Applied Research</h4>
              <p className="text-xs text-[#4a5068]">Geothermal Energy, Ijtimoiy tadqiqotlar. Matching Headings va Information savollari.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">Passage 3</span>
              <h4 className="font-bold text-sm text-[#10152b]">Analytical Arguments</h4>
              <p className="text-xs text-[#4a5068]">Linguistics, AI Falsafasi, Neyrobiologiya. Yes / No / Not Given va Multiple Choice savollari.</p>
            </div>
          </div>
        </div>
      )}

      {activeSkillTab === 'speaking' && (
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#eadfc9] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-unbounded font-black text-lg text-[#10152b]">
                🎙️ Speaking Mashqlari Ro'yxati (Part 1, 2, 3)
              </h3>
              <p className="text-xs text-[#7a7f95] font-bold mt-1">
                3D Foxy bilan ovozli suhbat, Cue Card taymeri va real-vaqt baholash
              </p>
            </div>
            <button
              onClick={() => onNavigate('speaking')}
              className="px-4 py-2 rounded-full bg-[#ff7a00] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>Speaking Labni Ochish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#fff3e6] text-[#ff7a00]">Part 1 • 4-5 daqiqa</span>
              <h4 className="font-bold text-sm text-[#10152b]">Shaxsiy Savollar</h4>
              <p className="text-xs text-[#4a5068]">Work & Studies, Hometown, Daily Routine, Digital Technology. 10 ta savol mavzulari.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#fff3e6] text-[#ff7a00]">Part 2 • 3-4 daqiqa</span>
              <h4 className="font-bold text-sm text-[#10152b]">Cue Card Monolog</h4>
              <p className="text-xs text-[#4a5068]">1 daqiqa reja tuzish, 2 daqiqa to'xtovsiz nutq so'zlash. Taymer va asosiy nuqtalar ko'rsatmasi.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#fff3e6] text-[#ff7a00]">Part 3 • 4-5 daqiqa</span>
              <h4 className="font-bold text-sm text-[#10152b]">Analitik Muhokama</h4>
              <p className="text-xs text-[#4a5068]">Jamiyat, kelajak va falsafiy g'oyalar bo'yicha Foxy bilan chuqur munozara.</p>
            </div>
          </div>
        </div>
      )}

      {activeSkillTab === 'listening' && (
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#eadfc9] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-unbounded font-black text-lg text-[#10152b]">
                🎧 Listening Mashqlari Ro'yxati (Section 1–4)
              </h3>
              <p className="text-xs text-[#7a7f95] font-bold mt-1">
                Audio pleyer, transkript tahlili va imtihon savolnomasi
              </p>
            </div>
            <button
              onClick={() => onNavigate('listening')}
              className="px-4 py-2 rounded-full bg-[#0284c7] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>Listening Labni Ochish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">Section 1</span>
              <h4 className="font-bold text-sm text-[#10152b]">Social Dialogue</h4>
              <p className="text-xs text-[#4a5068]">Mehmonxona, sport klubi yoki ijara arizasi. Form completion savollari.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">Section 2</span>
              <h4 className="font-bold text-sm text-[#10152b]">Monologue Guide</h4>
              <p className="text-xs text-[#4a5068]">Shahar parki yoki muzey bo'yicha yo'riqnoma. Map labelling va Multiple Choice.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">Section 3</span>
              <h4 className="font-bold text-sm text-[#10152b]">Academic Discussion</h4>
              <p className="text-xs text-[#4a5068]">Talaba va o'qituvchi o'rtasidagi ilmiy loyiha muhokamasi. Matching features.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">Section 4</span>
              <h4 className="font-bold text-sm text-[#10152b]">University Lecture</h4>
              <p className="text-xs text-[#4a5068]">Akademik ma'ruza (ekologiya, arxitektura). Notes completion to'ldirish.</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bottom Mock Arena Callout */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#10152b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ef3b2d] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-unbounded font-black text-base sm:text-lg text-white">
              To'liq 2h 45m Rasmiy Imtihon kerakmi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-bold mt-0.5">
              Listening, Reading, Writing va Speaking bitta uzluksiz sessiyada. Rasmiy Cambridge standartida sinovdan o'ting.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('mock-arena')}
          className="shrink-0 px-7 py-3.5 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span>Mock Arenaga o'tish</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 7. Interactive Quick Practice Modal (Writing, Reading, Speaking, Listening) */}
      {/* ======================================================== */}
      {quickPracticeSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[28px] border border-[#eadfc9] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-nunito">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#faf6ee] border-b border-[#eadfc9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d] animate-pulse" />
                <div>
                  <h3 className="font-unbounded font-black text-sm sm:text-base text-[#10152b] uppercase">
                    Tezkor Mashq: {quickPracticeSkill}
                  </h3>
                  <span className="text-[11px] text-[#7a7f95] font-bold">
                    5–10 daqiqalik mikro-mashg'ulot
                  </span>
                </div>
              </div>

              {/* Skill Switcher pills inside modal */}
              <div className="flex items-center gap-1.5">
                {(['writing', 'reading', 'speaking', 'listening'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setQuickPracticeSkill(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                      quickPracticeSkill === s ? 'bg-[#10152b] text-white' : 'bg-white border border-[#eadfc9] text-[#7a7f95] hover:text-[#10152b]'
                    }`}
                  >
                    {s.slice(0, 4)}
                  </button>
                ))}
                <button
                  onClick={() => setQuickPracticeSkill(null)}
                  className="p-1 rounded-full text-[#7a7f95] hover:text-[#10152b] ml-1 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-5 max-h-[70vh]">
              
              {/* --- A. WRITING QUICK PRACTICE --- */}
              {quickPracticeSkill === 'writing' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9]">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#fde3dc] text-[#ef3b2d]">Task 2 Argumentation Prompt</span>
                    <h4 className="font-bold text-sm text-[#10152b] mt-1.5 leading-snug">
                      "Some people believe that higher university education should be entirely free for all qualified students, while others argue that individuals should pay for their degrees. Discuss both views and give your opinion."
                    </h4>
                    <p className="text-[11px] text-[#7a7f95] font-bold mt-1">
                      Kirish (Introduction) va asosiy tezis fikringizni yozib mashq qiling.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#7a7f95]">
                      <span>Sizning Javobingiz:</span>
                      <span className={`font-black ${quickWritingText.trim().split(/\s+/).filter(Boolean).length >= 50 ? 'text-emerald-600' : 'text-[#ef3b2d]'}`}>
                        {quickWritingText.trim().split(/\s+/).filter(Boolean).length} so'z (tavsiya: 50+ so'z)
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      value={quickWritingText}
                      onChange={(e) => setQuickWritingText(e.target.value)}
                      placeholder="Masalan: While advocates maintain that free tertiary education ensures egalitarian meritocracy, critics highlight the substantial fiscal strain on public expenditure..."
                      className="w-full p-4 rounded-2xl border border-[#eadfc9] bg-[#fdf6e9]/40 focus:outline-none focus:border-[#ef3b2d] text-xs sm:text-sm font-medium leading-relaxed resize-none"
                    />
                  </div>

                  {quickWritingSubmitted ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5 animate-fadeIn">
                      <div className="font-black text-sm flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        AI Tahlil Natijasi: Band 7.5 Uslub
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Akademik leksika (egalitarian meritocracy, fiscal strain) to'g'ri qo'llangan. Cohesion va sintaksis mustahkam. To'liq 250 so'zlik insho yozish uchun Writing Labga o'tishingiz mumkin.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setQuickWritingSubmitted(true)}
                      disabled={quickWritingText.trim().split(/\s+/).filter(Boolean).length < 5}
                      className="w-full py-3 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      AI Bilan Tekshirish
                    </button>
                  )}
                </div>
              )}

              {/* --- B. READING QUICK PRACTICE --- */}
              {quickPracticeSkill === 'reading' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">Passage Snippet</span>
                    <h4 className="font-bold text-sm text-[#10152b]">The Evolutionary Architecture of Urban Biodiversity</h4>
                    <p className="text-xs text-[#4a5068] leading-relaxed">
                      "As metropolitan zones worldwide expand, urban biologists have uncovered an unforeseen evolutionary phenomenon: high-density concrete environments exert severe selective pressures, accelerating phenotypic adaptations at speeds rarely seen in untouched wilderness. A pivotal study revealed that White-footed mice in city parks exhibit genetic mutations that metabolize heavy metals and carbohydrate-rich food waste without causing lethal inflammation."
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-black text-[#10152b] block">Savol: TRUE, FALSE yoki NOT GIVEN?</span>
                    <p className="text-xs text-[#4a5068] font-bold">
                      1. "Wildlife adapts to urban environments at a slower rate than in untouched wilderness."
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setQuickReadingAnswers({ 1: opt })}
                          className={`py-2 rounded-xl text-xs font-black border transition ${
                            quickReadingAnswers[1] === opt
                              ? 'bg-[#10152b] text-white border-[#10152b]'
                              : 'bg-white border-[#eadfc9] text-[#10152b] hover:bg-[#fdf6e9]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {quickReadingChecked && (
                      <div className={`p-3 rounded-xl text-xs font-bold ${quickReadingAnswers[1] === 'FALSE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {quickReadingAnswers[1] === 'FALSE' ? '✓ To\'g\'ri! Matnda "accelerating adaptations at speeds rarely seen in wilderness" deyilgan (ya\'ni tezroq).' : '✗ Noto\'g\'ri. To\'g\'ri javob FALSE, chunki matnda shahardagi adaptatsiya tezroq ekanligi ko\'rsatilgan.'}
                      </div>
                    )}

                    {!quickReadingChecked && (
                      <button
                        onClick={() => setQuickReadingChecked(true)}
                        disabled={!quickReadingAnswers[1]}
                        className="w-full py-2.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-white text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                      >
                        Javobni Tekshirish
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* --- C. SPEAKING QUICK PRACTICE --- */}
              {quickPracticeSkill === 'speaking' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#fff3e6] border border-[#ffd5a8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#ff7a00] text-white">Part 2 Cue Card</span>
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#ff7a00]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{quickSpeakingTimer}s tayyorgarlik</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-[#10152b]">
                      "Describe a personal goal that you achieved after long preparation."
                    </h4>
                    <ul className="text-xs text-[#4a5068] space-y-1 list-disc list-inside">
                      <li>What the goal was and why it mattered to you</li>
                      <li>How you prepared and what hurdles you faced</li>
                      <li>Explain how you felt once it was accomplished</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuickSpeakingTimerActive(!quickSpeakingTimerActive)}
                      className="px-4 py-2 rounded-xl bg-white border border-[#eadfc9] text-xs font-black text-[#10152b] hover:bg-[#fdf6e9] transition"
                    >
                      {quickSpeakingTimerActive ? 'Pauza' : '1 Minut Taymerni Boshlash'}
                    </button>
                    <button
                      onClick={() => {
                        setQuickSpeakingTimer(60);
                        setQuickSpeakingTimerActive(false);
                      }}
                      className="p-2 rounded-xl bg-white border border-[#eadfc9] text-[#7a7f95] hover:text-[#10152b] transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Speech Simulation */}
                  <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#fff3e6] text-[#ff7a00] flex items-center justify-center mx-auto border border-[#ffd5a8]">
                      <Mic className={`w-6 h-6 ${quickSpeakingRecording ? 'animate-pulse text-[#ef3b2d]' : ''}`} />
                    </div>

                    <button
                      onClick={() => {
                        setQuickSpeakingRecording(!quickSpeakingRecording);
                        if (!quickSpeakingRecording) {
                          setQuickSpeakingTranscript("One of the most defining goals I achieved was scoring an Academic IELTS band 8.0 to secure an international postgraduate scholarship...");
                        }
                      }}
                      className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                        quickSpeakingRecording 
                          ? 'bg-[#ef3b2d] text-white shadow-md animate-pulse' 
                          : 'bg-[#ff7a00] text-white hover:bg-[#e56d00]'
                      }`}
                    >
                      {quickSpeakingRecording ? "Yozishni to'xtatish" : "Gapirishni boshlash (Mikrofon)"}
                    </button>

                    {quickSpeakingTranscript && (
                      <div className="p-3 bg-white rounded-xl border border-[#eadfc9] text-left text-xs text-[#2a3048] font-medium leading-relaxed">
                        <strong className="text-[#ff7a00] block mb-1">Jonli Yozuv:</strong>
                        "{quickSpeakingTranscript}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- D. LISTENING QUICK PRACTICE --- */}
              {quickPracticeSkill === 'listening' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#eadfc9] space-y-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">Section 1 Audio Simulator</span>
                    <h4 className="font-bold text-sm text-[#10152b]">Cambridge IELTS Course Registration</h4>
                    <p className="text-xs text-[#4a5068]">
                      Tinglang va bo'sh joylarni to'ldiring: "Candidate's surname: ______ • Desired course level: Academic ______."
                    </p>
                  </div>

                  {/* Simulated Audio Player */}
                  <div className="p-4 rounded-2xl bg-white border border-[#eadfc9] flex items-center justify-between gap-3 shadow-xs">
                    <button
                      onClick={() => setQuickAudioPlaying(!quickAudioPlaying)}
                      className="w-10 h-10 rounded-full bg-[#0284c7] text-white flex items-center justify-center hover:bg-[#0369a1] transition shadow-xs"
                    >
                      <Play className={`w-4 h-4 ml-0.5 ${quickAudioPlaying ? 'opacity-50' : ''}`} />
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-[#7a7f95] font-bold">
                        <span>{quickAudioPlaying ? '00:14' : '00:00'}</span>
                        <span>01:30</span>
                      </div>
                      <div className="w-full bg-[#eadfc9] h-2 rounded-full overflow-hidden">
                        <div className={`bg-[#0284c7] h-full rounded-full transition-all duration-300 ${quickAudioPlaying ? 'w-1/3' : 'w-0'}`} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {(['0.8x', '1.0x', '1.2x'] as const).map(spd => (
                        <button
                          key={spd}
                          onClick={() => setQuickAudioSpeed(spd)}
                          className={`text-[10px] font-bold px-2 py-1 rounded ${quickAudioSpeed === spd ? 'bg-[#0284c7] text-white' : 'bg-[#faf6ee] text-[#7a7f95]'}`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black text-[#10152b] block">Savol 1: Kurs qaysi oyda boshlanadi?</span>
                    <input
                      type="text"
                      placeholder="Javobni yozing (masalan: September)..."
                      value={quickListeningAnswers[1] || ''}
                      onChange={(e) => setQuickListeningAnswers({ 1: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-[#eadfc9] bg-[#fdf6e9]/40 text-xs font-bold text-[#10152b] focus:outline-none focus:border-[#0284c7]"
                    />

                    {quickListeningChecked && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                        ✓ To'g'ri! Audio transkriptida "The autumn cohort commences in September" aytiladi.
                      </div>
                    )}

                    {!quickListeningChecked && (
                      <button
                        onClick={() => setQuickListeningChecked(true)}
                        disabled={!quickListeningAnswers[1]}
                        className="w-full py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                      >
                        Javobni Tekshirish
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer CTA */}
            <div className="px-6 py-4 bg-[#faf6ee] border-t border-[#eadfc9] flex items-center justify-between">
              <button
                onClick={() => setQuickPracticeSkill(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#7a7f95] hover:text-[#10152b] transition"
              >
                Yopish
              </button>

              <button
                onClick={() => {
                  const targetTab = quickPracticeSkill as PageTab;
                  setQuickPracticeSkill(null);
                  onNavigate(targetTab);
                }}
                className="px-6 py-2.5 rounded-full bg-[#10152b] hover:bg-[#ef3b2d] text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>To'liq {quickPracticeSkill} Labga O'tish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PracticeHubPage;

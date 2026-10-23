import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useExam } from '../context/ExamContext';
import { PageTab } from '../components/Sidebar';
import { 
  Award, 
  Clock, 
  Play, 
  Settings2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Headphones, 
  BookOpen, 
  FileEdit, 
  Mic,
  AlertCircle
} from 'lucide-react';

interface MockArenaPageProps {
  onNavigate: (tab: PageTab) => void;
}

export interface MockExamSession {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  totalQuestions: number;
  modules: { name: string; duration: string; icon: any; tab: PageTab }[];
  difficulty: 'Standard' | 'Hard' | 'Diagnostic';
  badgeColor: string;
  status: 'READY' | 'COMPLETED' | 'IN_PROGRESS';
  lastScore?: number;
}

export const MockArenaPage: React.FC<MockArenaPageProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const { mode } = useExam();

  const [selectedExamId, setSelectedExamId] = useState<string>('mock-19-test-1');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(9900); // 2 hours 45 mins

  const mockExams: MockExamSession[] = [
    {
      id: 'mock-19-test-1',
      title: 'Cambridge 19 Academic • Full Mock Simulation 1',
      subtitle: 'Official 2025–2026 Computer-Delivered IELTS standard',
      duration: '2h 45m',
      totalQuestions: 82,
      modules: [
        { name: 'Listening (40 questions)', duration: '30 mins', icon: Headphones, tab: 'listening' },
        { name: 'Reading (40 questions)', duration: '60 mins', icon: BookOpen, tab: 'reading' },
        { name: 'Writing (Task 1 & Task 2)', duration: '60 mins', icon: FileEdit, tab: 'writing' },
        { name: '3D Foxy Speaking Arena', duration: '15 mins', icon: Mic, tab: 'speaking' },
      ],
      difficulty: 'Standard',
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      status: 'READY',
      lastScore: 7.5,
    },
    {
      id: 'mock-19-test-2',
      title: 'Cambridge 19 Academic • Full Mock Simulation 2',
      subtitle: 'Advanced diagnostic test with full AI grading',
      duration: '2h 45m',
      totalQuestions: 82,
      modules: [
        { name: 'Listening (40 questions)', duration: '30 mins', icon: Headphones, tab: 'listening' },
        { name: 'Reading (40 questions)', duration: '60 mins', icon: BookOpen, tab: 'reading' },
        { name: 'Writing (Task 1 & Task 2)', duration: '60 mins', icon: FileEdit, tab: 'writing' },
        { name: '3D Foxy Speaking Arena', duration: '15 mins', icon: Mic, tab: 'speaking' },
      ],
      difficulty: 'Hard',
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200',
      status: 'READY',
    },
    {
      id: 'mock-milliy-diagnostic',
      title: 'Milliy BBM & CEFR English Simulation Test',
      subtitle: 'Tailored for National Certification in Uzbekistan',
      duration: '2h 15m',
      totalQuestions: 75,
      modules: [
        { name: 'Listening Section', duration: '35 mins', icon: Headphones, tab: 'listening' },
        { name: 'Reading Section', duration: '50 mins', icon: BookOpen, tab: 'reading' },
        { name: 'Writing Module', duration: '45 mins', icon: FileEdit, tab: 'writing' },
        { name: 'Speaking Interview', duration: '15 mins', icon: Mic, tab: 'speaking' },
      ],
      difficulty: 'Diagnostic',
      badgeColor: 'bg-sky-50 text-sky-800 border border-sky-200',
      status: 'READY',
    },
  ];

  const selectedExam = mockExams.find(e => e.id === selectedExamId) || mockExams[0];

  useEffect(() => {
    let timer: any = null;
    if (simulationActive && timeLeftSec > 0) {
      timer = setInterval(() => {
        setTimeLeftSec(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [simulationActive, timeLeftSec]);

  const formatExamTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setSimulationActive(true);
    setActiveStageIndex(0);
    setTimeLeftSec(9900);
  };

  const handleProceedToModule = (tab: PageTab) => {
    onNavigate(tab);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-16 font-nunito animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-[28px] border border-[#eadfc9] shadow-[0_4px_25px_rgba(80,60,20,0.05)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#ef3b2d]">
              Official CD-IELTS Simulation Engine • Proctoring Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#10152b] text-white">
              {mode} Mode
            </span>
          </div>
          <h1 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] tracking-tight">
            Official Computer-Delivered Mock Exam Arena
          </h1>
          <p className="text-xs sm:text-sm text-[#4a5068] font-bold">
            Haqiqiy 2h 45m uzluksiz imtihon rejimi: Listening, Reading, Writing va Speaking bitta sessiyada. Yakunlangach, QR-kodli xalqaro TRF sertifikat shakllanadi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('system-check')}
            className="px-4 py-2.5 rounded-full bg-[#fdf6e9] hover:bg-[#f3ead6] border border-[#eadfc9] text-xs font-extrabold text-[#10152b] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Settings2 className="w-4 h-4 text-[#ef3b2d]" />
            <span>Tizim Tekshiruvi</span>
          </button>
        </div>
      </div>

      {/* 2. LIVE SIMULATION RUNNER (Agar test boshlansa) */}
      {simulationActive && (
        <div className="p-6 sm:p-7 rounded-[28px] bg-white border-2 border-[#ef3b2d] shadow-xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500" />
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#ef3b2d]">
                  Jonli CD-IELTS Imtihon Jarayoni
                </span>
                <h3 className="font-unbounded font-black text-base sm:text-lg text-[#10152b]">
                  {selectedExam.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#fdf6e9] px-4 py-2 rounded-full border border-[#eadfc9] text-sm">
                <Clock className="w-4 h-4 text-[#ef3b2d]" />
                <span className="font-unbounded font-black text-[#10152b]">{formatExamTime(timeLeftSec)}</span>
                <span className="text-[10px] text-[#7a7f95] font-bold uppercase">Qoldi</span>
              </div>

              <button
                onClick={() => setSimulationActive(false)}
                className="px-4 py-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-extrabold transition-all cursor-pointer"
              >
                Imtihonni Yakunlash
              </button>
            </div>
          </div>

          {/* 4 Stage Module Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {selectedExam.modules.map((mod, idx) => {
              const isCurrent = activeStageIndex === idx;
              const isPassed = activeStageIndex > idx;
              const ModIcon = mod.icon;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveStageIndex(idx);
                    handleProceedToModule(mod.tab);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#10152b] text-white border-[#10152b] shadow-md scale-[1.02]'
                      : isPassed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-[#fdf6e9] border-[#eadfc9] text-[#4a5068] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? 'text-white' : 'text-[#7a7f95]'}`}>
                      Bosqich {idx + 1}
                    </span>
                    <ModIcon className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-black leading-tight">{mod.name}</div>
                    <div className={`text-[11px] mt-0.5 font-bold ${isCurrent ? 'text-slate-300' : 'text-[#7a7f95]'}`}>
                      {mod.duration}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MOCK EXAMS CATALOG */}
      <div className="space-y-4">
        <div>
          <h2 className="font-unbounded font-black text-xl text-[#10152b] flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d]" />
            Mavjud Rasmiy Mock Testlar
          </h2>
          <p className="text-xs sm:text-sm text-[#4a5068] font-bold mt-0.5">
            Cambridge rubrikalari asosida to'liq 4 ta ko'nikma sinovidan o'tish uchun imtihon paketini tanlang:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockExams.map((exam) => {
            const isSelected = selectedExamId === exam.id;

            return (
              <div
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`rounded-[28px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer border bg-white shadow-xs hover:shadow-lg ${
                  isSelected
                    ? 'border-2 border-[#10152b] shadow-md scale-[1.01]'
                    : 'border-[#eadfc9] hover:border-[#10152b]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${exam.badgeColor}`}>
                      {exam.difficulty}
                    </span>
                    <span className="text-xs text-[#7a7f95] flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#ef3b2d]" />
                      {exam.duration}
                    </span>
                  </div>

                  <h3 className="font-unbounded font-black text-lg text-[#10152b] leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-[#4a5068] font-bold mt-1.5 leading-relaxed">
                    {exam.subtitle}
                  </p>

                  {/* Module Breakdown Box */}
                  <div className="my-5 p-4 rounded-2xl bg-[#fdf6e9] border border-[#eadfc9] space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#7a7f95] block">
                      Imtihon Tarkibi (4 Modul):
                    </span>
                    {exam.modules.map((m, i) => {
                      const Icon = m.icon;
                      return (
                        <div key={i} className="flex items-center justify-between text-xs text-[#10152b] font-bold">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#ef3b2d]" />
                            <span>{m.name}</span>
                          </div>
                          <span className="text-[11px] text-[#7a7f95]">{m.duration}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-[#eadfc9] flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExamId(exam.id);
                      handleStartExam();
                    }}
                    className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>To'liq 2h 45m Mockni Boshlash</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('listening');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#fdf6e9] hover:bg-[#f3ead6] border border-[#eadfc9] text-[#10152b] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Listening</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('reading');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#fdf6e9] hover:bg-[#f3ead6] border border-[#eadfc9] text-[#10152b] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Reading</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
export default MockArenaPage;

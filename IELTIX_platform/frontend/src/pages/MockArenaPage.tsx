import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext.js';
import { useExam } from '../context/ExamContext.js';
import { PageTab } from '../components/Sidebar.js';

interface MockArenaPageProps {
  onNavigate: (tab: PageTab) => void;
}

export interface MockExamSession {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  totalQuestions: number;
  modules: { name: string; duration: string; icon: string; tab: PageTab }[];
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
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [accentPreference, setAccentPreference] = useState<'UK' | 'AU' | 'US'>('UK');
  const [proctoringEnabled, setProctoringEnabled] = useState<boolean>(true);

  const mockExams: MockExamSession[] = [
    {
      id: 'mock-19-test-1',
      title: 'Cambridge 19 Academic • Full Mock Simulation 1',
      subtitle: 'Official 2025–2026 Computer-Delivered IELTS standard',
      duration: '2h 45m',
      totalQuestions: 82,
      modules: [
        { name: 'Listening (40 questions)', duration: '30 mins', icon: 'headset', tab: 'listening' },
        { name: 'Reading (40 questions)', duration: '60 mins', icon: 'chrome_reader_mode', tab: 'reading' },
        { name: 'Writing (Task 1 & Task 2)', duration: '60 mins', icon: 'edit_document', tab: 'writing' },
        { name: '3D Foxy Speaking Arena', duration: '15 mins', icon: 'mic', tab: 'speaking' },
      ],
      difficulty: 'Standard',
      badgeColor: 'bg-primary-container text-on-primary-container',
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
        { name: 'Listening (40 questions)', duration: '30 mins', icon: 'headset', tab: 'listening' },
        { name: 'Reading (40 questions)', duration: '60 mins', icon: 'chrome_reader_mode', tab: 'reading' },
        { name: 'Writing (Task 1 & Task 2)', duration: '60 mins', icon: 'edit_document', tab: 'writing' },
        { name: '3D Foxy Speaking Arena', duration: '15 mins', icon: 'mic', tab: 'speaking' },
      ],
      difficulty: 'Hard',
      badgeColor: 'bg-secondary-container text-on-secondary',
      status: 'READY',
    },
    {
      id: 'mock-milliy-diagnostic',
      title: 'Milliy BBM & CEFR English Simulation Test',
      subtitle: 'Tailored for National Certification in Uzbekistan',
      duration: '2h 15m',
      totalQuestions: 75,
      modules: [
        { name: 'Listening Section', duration: '35 mins', icon: 'headset', tab: 'listening' },
        { name: 'Reading Section', duration: '50 mins', icon: 'chrome_reader_mode', tab: 'reading' },
        { name: 'Writing Module', duration: '45 mins', icon: 'edit_document', tab: 'writing' },
        { name: 'Speaking Interview', duration: '15 mins', icon: 'mic', tab: 'speaking' },
      ],
      difficulty: 'Diagnostic',
      badgeColor: 'bg-tertiary-container text-on-tertiary-container',
      status: 'READY',
    },
  ];

  const selectedExam = mockExams.find(e => e.id === selectedExamId) || mockExams[0];

  // Timer Tick during simulation
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
    setTimeLeftSec(9900); // 2h 45m
  };

  const handleProceedToModule = (tab: PageTab) => {
    onNavigate(tab);
  };

  return (
    <div className="flex flex-col gap-space-lg pb-20 max-w-6xl mx-auto selection:bg-primary-container selection:text-on-primary-container animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-3xl border border-surface-container-high/40 shadow-sm relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              Official CD-IELTS Simulation Engine • Proctoring Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-highest text-on-surface">
              {mode} Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Official Computer-Delivered Mock Exam Arena
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Experience real-world 2h 45m continuous exam conditions with timed module transitions, AI Proctoring, and QR-Verified TRF Certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('system-check')}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-primary">tune</span>
            <span>System Hardware Check</span>
          </button>

          <button
            type="button"
            onClick={() => setConfigModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-secondary">settings</span>
            <span>Exam Settings</span>
          </button>
        </div>
      </div>

      {/* ACTIVE LIVE SIMULATION RUNNER BAR */}
      {simulationActive && (
        <div className="p-6 rounded-3xl bg-surface-container-highest border-2 border-primary shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-error animate-ping" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-error">
                  🔴 LIVE CD-IELTS EXAM IN PROGRESS
                </span>
                <h3 className="text-lg font-black text-on-surface">
                  {selectedExam.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-2xl border border-surface-container-high font-code text-sm">
                <span className="material-symbols-outlined text-base text-primary">timer</span>
                <span className="font-black text-on-surface">{formatExamTime(timeLeftSec)}</span>
                <span className="text-[10px] text-on-surface-variant font-sans uppercase">Remaining</span>
              </div>

              <button
                onClick={() => setSimulationActive(false)}
                className="px-4 py-2 rounded-xl bg-error/20 text-error hover:bg-error/30 text-xs font-bold transition-all cursor-pointer"
              >
                End Simulation
              </button>
            </div>
          </div>

          {/* 4 Stage Module Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {selectedExam.modules.map((mod, idx) => {
              const isCurrent = activeStageIndex === idx;
              const isPassed = activeStageIndex > idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveStageIndex(idx);
                    handleProceedToModule(mod.tab);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-primary text-on-primary border-primary shadow-lg scale-102'
                      : isPassed
                      ? 'bg-surface-container-low border-secondary/40 text-on-surface'
                      : 'bg-surface-container-low border-surface-container-high/40 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? 'text-white' : 'text-on-surface-variant'}`}>
                      Stage {idx + 1}
                    </span>
                    <span className="material-symbols-outlined text-base">
                      {isPassed ? 'check_circle' : mod.icon}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold leading-tight">{mod.name}</div>
                    <div className={`text-[11px] mt-0.5 ${isCurrent ? 'text-white/80' : 'text-on-surface-variant'}`}>
                      {mod.duration}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MOCK EXAMS CATALOG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-on-surface">
              Available Full Mock Simulations
            </h2>
            <p className="text-xs text-on-surface-variant">
              Select an exam pack to run complete 4-skill testing with official Cambridge marking rubrics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockExams.map((exam) => {
            const isSelected = selectedExamId === exam.id;

            return (
              <div
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer border relative overflow-hidden ${
                  isSelected
                    ? 'bg-surface-container border-2 border-primary shadow-2xl scale-[1.02]'
                    : 'bg-surface-container-low border-surface-container-high/50 hover:bg-surface-container hover:border-surface-container-high shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${exam.badgeColor}`}>
                      {exam.difficulty}
                    </span>
                    <span className="text-xs font-code text-on-surface-variant flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-sm text-primary">timer</span>
                      {exam.duration}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-on-surface leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                    {exam.subtitle}
                  </p>

                  {/* Module Breakdown Box */}
                  <div className="my-5 p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">
                      Exam Composition (4 Modules):
                    </span>
                    {exam.modules.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-on-surface font-medium">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-secondary">{m.icon}</span>
                          <span>{m.name}</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant font-code">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-surface-container-high/40 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExamId(exam.id);
                      handleStartExam();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">play_circle</span>
                    <span>Start Complete 2h 45m Mock</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('listening');
                      }}
                      className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-xs text-tertiary">headset</span>
                      <span>Listening</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('reading');
                      }}
                      className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-xs text-primary">chrome_reader_mode</span>
                      <span>Reading</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Mock Attempt History & Benchmark Cards */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-on-surface">
              Past Mock Exam Records & Official TRFs
            </h3>
            <p className="text-xs text-on-surface-variant">
              Your previous full-scale mock results with certified QR verification badges.
            </p>
          </div>

          <button
            onClick={() => onNavigate('report')}
            className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-xs font-bold text-primary flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            <span>View Full QR Certificate</span>
          </button>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead>
              <tr className="border-b border-surface-container-high/60 text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                <th className="pb-3">Test Title</th>
                <th className="pb-3">Date Completed</th>
                <th className="pb-3 text-center">Listening</th>
                <th className="pb-3 text-center">Reading</th>
                <th className="pb-3 text-center">Writing</th>
                <th className="pb-3 text-center">Speaking</th>
                <th className="pb-3 text-center">Overall Band</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40 font-medium">
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-3.5 font-bold">Cambridge 19 Academic Mock #1</td>
                <td className="py-3.5 text-on-surface-variant">Yesterday, 15:40</td>
                <td className="py-3.5 text-center font-bold text-tertiary">8.0</td>
                <td className="py-3.5 text-center font-bold text-primary">7.5</td>
                <td className="py-3.5 text-center font-bold text-secondary">7.0</td>
                <td className="py-3.5 text-center font-bold text-[#FF7A00]">7.5</td>
                <td className="py-3.5 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-secondary text-on-secondary font-black text-xs">
                    7.5
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => onNavigate('report')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-[11px] transition-all"
                  >
                    View Report
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-3.5 font-bold">Diagnostic Baseline Simulation</td>
                <td className="py-3.5 text-on-surface-variant">3 days ago</td>
                <td className="py-3.5 text-center font-bold text-tertiary">7.0</td>
                <td className="py-3.5 text-center font-bold text-primary">6.5</td>
                <td className="py-3.5 text-center font-bold text-secondary">6.5</td>
                <td className="py-3.5 text-center font-bold text-[#FF7A00]">7.0</td>
                <td className="py-3.5 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary-container font-black text-xs">
                    7.0
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => onNavigate('report')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-[11px] transition-all"
                  >
                    View Report
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info & Security Guarantee Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/40 flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-secondary">verified_user</span>
          <div>
            <h4 className="font-bold text-xs text-on-surface">Xalqaro IELTS Standarti</h4>
            <p className="text-[11px] text-on-surface-variant">100% haqiqiy CD-IELTS savollar banki</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/40 flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-primary">qr_code_2</span>
          <div>
            <h4 className="font-bold text-xs text-on-surface">QR Tasdiqlangan Sertifikat</h4>
            <p className="text-[11px] text-on-surface-variant">Sinovdan so'ng darhol TRF yuklab oling</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/40 flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-[#FF7A00]">smart_toy</span>
          <div>
            <h4 className="font-bold text-xs text-on-surface">AI Examiner Baholashi</h4>
            <p className="text-[11px] text-on-surface-variant">Writing & Speaking uchun chuqur tahlil</p>
          </div>
        </div>
      </div>

      {/* CONFIGURATION MODAL */}
      {configModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-primary">settings</span>
                <h3 className="text-base font-black text-on-surface">Exam Preferences</h3>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1.5">Listening Audio Accent:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UK', 'AU', 'US'] as const).map(acc => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => setAccentPreference(acc)}
                      className={`p-2.5 rounded-xl font-bold border transition-all ${
                        accentPreference === acc
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container text-on-surface border-surface-container-high'
                      }`}
                    >
                      {acc === 'UK' ? '🇬🇧 British' : acc === 'AU' ? '🇦🇺 Australian' : '🇺🇸 American'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1.5">Proctoring Mode:</label>
                <button
                  type="button"
                  onClick={() => setProctoringEnabled(!proctoringEnabled)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between font-bold ${
                    proctoringEnabled
                      ? 'bg-secondary/15 text-secondary border-secondary/40'
                      : 'bg-surface-container text-on-surface border-surface-container-high'
                  }`}
                >
                  <span>AI Proctoring & Webcam Tracker</span>
                  <span className="material-symbols-outlined text-base">
                    {proctoringEnabled ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high/50 text-right">
              <button
                onClick={() => setConfigModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

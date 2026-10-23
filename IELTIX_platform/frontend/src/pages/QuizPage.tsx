import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext.js';
import { useExam } from '../context/ExamContext.js';
import { PageTab } from '../components/Sidebar.js';

interface QuizPageProps {
  onNavigate: (tab: PageTab) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ onNavigate }) => {
  const { setUser } = useUser();
  const { setMode } = useExam();

  // Current stage: 1 to 5 (questions), 6 (mini test), 7 (AI calculating), 8 (results)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalQuestions = 6;

  // Quiz state
  const [targetBand, setTargetBand] = useState<string>('7.5');
  const [currentGap, setCurrentGap] = useState<string>('gapOver1');
  const [worrySkill, setWorrySkill] = useState<string>('writing');
  const [prepMethod, setPrepMethod] = useState<string>('withoutSystem');
  const [examFear, setExamFear] = useState<string>('smallMistakes');

  // Mini-test state
  const [miniQIndex, setMiniQIndex] = useState<number>(0);
  const [selectedMiniAnswer, setSelectedMiniAnswer] = useState<number | null>(null);
  const [miniScore, setMiniScore] = useState<number>(0);

  // AI Loading state
  const [calcProgress, setCalcProgress] = useState<number>(0);
  const [calcPhase, setCalcPhase] = useState<string>("Analyzing your response patterns...");

  const miniQuestions = [
    {
      q: "Despite _____ hard all night, she was unable to complete the research task.",
      options: ["working", "he worked", "of working", "work"],
      correct: 0,
      rule: "Grammar: Preposition 'despite' is followed by a gerund (-ing form)."
    },
    {
      q: "The academic graph illustrates a _____ decline in carbon emissions over the decade.",
      options: ["sharp", "loud", "heavy", "violent"],
      correct: 0,
      rule: "Lexical Resource: 'sharp decline' is a natural academic IELTS collocation."
    },
    {
      q: "Choose the most appropriate transition for an IELTS Task 2 academic essay:",
      options: [
        "Furthermore, empirical studies indicate that...",
        "And another thing is that...",
        "Also they say that...",
        "Plus it is known that..."
      ],
      correct: 0,
      rule: "Coherence & Cohesion: 'Furthermore, empirical studies...' satisfies Band 8.0+ style."
    }
  ];

  // AI Calculating animation
  useEffect(() => {
    if (currentStep === 7) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        if (progress <= 25) {
          setCalcPhase("Analyzing your target goals & skill gaps...");
        } else if (progress <= 55) {
          setCalcPhase("Evaluating grammar, vocabulary & question accuracy...");
        } else if (progress <= 85) {
          setCalcPhase("Calculating predicted baseline band score...");
        } else {
          setCalcPhase("Assembling your personalized 4-week IELTS roadmap...");
        }

        setCalcProgress(Math.min(100, progress));

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentStep(8);
          }, 400);
        }
      }, 70);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleMiniAnswerSelect = (optIndex: number) => {
    setSelectedMiniAnswer(optIndex);
    if (optIndex === miniQuestions[miniQIndex].correct) {
      setMiniScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (miniQIndex < miniQuestions.length - 1) {
        setMiniQIndex(prev => prev + 1);
        setSelectedMiniAnswer(null);
      } else {
        // Go to calculating stage
        setCurrentStep(7);
      }
    }, 600);
  };

  const handleSaveAndStart = () => {
    setMode('IELTS');
    setUser(prev => ({
      ...prev,
      targetBand: `Band ${targetBand} Academic`,
      activeExamMode: 'IELTS',
    }));
    onNavigate('dashboard');
  };

  const calculateProgressPercent = () => {
    if (currentStep <= 5) return Math.round((currentStep / totalQuestions) * 100);
    if (currentStep === 6) return 85;
    if (currentStep === 7) return calcProgress;
    return 100;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-900 font-sans">
      
      {/* Top Navigation & Progress Header (GoPrep Style) */}
      <header className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          {/* Back Button */}
          {currentStep > 1 && currentStep < 7 ? (
            <button
              onClick={() => {
                if (currentStep === 6 && miniQIndex > 0) {
                  setMiniQIndex(prev => prev - 1);
                  setSelectedMiniAnswer(null);
                } else {
                  setCurrentStep(prev => prev - 1);
                }
              }}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-200/60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MockLife" className="w-7 h-7 rounded-lg object-cover shadow-xs" />
              <span className="font-extrabold text-sm tracking-tight text-slate-800">
                Mock<span className="text-sky-600">Life</span> Quiz
              </span>
            </div>
          )}

          {/* Progress Indicator */}
          {currentStep <= 6 && (
            <span className="text-xs font-extrabold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
              {currentStep <= 5 ? `Step ${currentStep} of ${totalQuestions}` : `Skill Diagnostic ${miniQIndex + 1}/${miniQuestions.length}`}
            </span>
          )}

          {currentStep === 8 && (
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Plan Generated</span>
            </div>
          )}
        </div>

        {/* Smooth Top Progress Bar */}
        {currentStep < 8 && (
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${calculateProgressPercent()}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center">
        
        {/* =================================================================== */}
        {/* STEP 1: What band do you need?                                      */}
        {/* =================================================================== */}
        {currentStep === 1 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                What band score do you need?
              </h1>
              <p className="text-sm text-slate-600">
                We'll build your personalized daily study plan around your exact goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { band: '6.5', label: 'Band 6.5 Competent', desc: 'Sufficient for most university bachelors & work visas' },
                { band: '7.0', label: 'Band 7.0 Good User', desc: 'Standard for Masters, healthcare & professional licenses' },
                { band: '7.5', label: 'Band 7.5 Very Good', desc: 'Top tier European, Canadian & Australian institutions' },
                { band: '8.0', label: 'Band 8.0 Expert User', desc: 'Oxford, Cambridge, Ivy League & full scholarships' },
                { band: '8.5', label: 'Band 8.5 Master User', desc: 'Near native proficiency with zero margin for error' },
                { band: '9.0', label: 'Band 9.0 Expert Native', desc: 'Perfect exam mastery across all 4 sections' },
              ].map((item) => (
                <button
                  key={item.band}
                  type="button"
                  onClick={() => {
                    setTargetBand(item.band);
                    setCurrentStep(2);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-sky-500 flex flex-col justify-between group ${
                    targetBand === item.band
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                      Band {item.band}
                    </span>
                    <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs group-hover:border-sky-500 group-hover:text-sky-600">
                      →
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">{item.label}</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: How close are you to that band now?                         */}
        {/* =================================================================== */}
        {currentStep === 2 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                How close are you to Band {targetBand} now?
              </h1>
              <p className="text-sm text-slate-600">
                Be honest — it helps our AI diagnostic pinpoint your real starting point.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { id: 'notTested', title: "Haven't tested myself yet", sub: "Starting fresh or only studied general English so far" },
                { id: 'gapOver1', title: "More than 1 band to go", sub: "Currently around Band 5.5 - 6.0 and need a significant push" },
                { id: 'gettingClose', title: "Getting close (0.5 band away)", sub: "Already hitting Band 6.5 - 7.0 in mock trials" },
                { id: 'barelyReaching', title: "Just about reaching it, but no cushion", sub: "Score fluctuates and need guaranteed exam-day consistency" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentGap(item.id);
                    setCurrentStep(3);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-sky-500 flex items-center justify-between group ${
                    currentGap === item.id
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: Which part of IELTS worries you most?                       */}
        {/* =================================================================== */}
        {currentStep === 3 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Which section worries you most?
              </h1>
              <p className="text-sm text-slate-600">
                We'll prioritize this module in your customized daily schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'writing', icon: 'edit_note', title: 'Writing (Task 1 & 2)', desc: 'Struggling with structure, coherence, and grammar criteria' },
                { id: 'speaking', icon: 'record_voice_over', title: 'Speaking (Parts 1-3)', desc: 'Hesitation, lack of natural collocations, pronunciation' },
                { id: 'reading', icon: 'menu_book', title: 'Reading Academic', desc: 'Running out of time, tricky True/False/Not Given traps' },
                { id: 'listening', icon: 'headphones', title: 'Listening (Audio)', desc: 'Fast accents in Part 3 & 4, spelling mistakes' },
                { id: 'timing', icon: 'schedule', title: 'Exam-day Time Pressure', desc: 'Cannot manage the 2 hours 45 mins without rushing' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setWorrySkill(item.id);
                    setCurrentStep(4);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-sky-500 flex items-start gap-3 group ${
                    worrySkill === item.id
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: How do you usually prepare?                                 */}
        {/* =================================================================== */}
        {currentStep === 4 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                How do you usually study for IELTS?
              </h1>
              <p className="text-sm text-slate-600">
                This helps us diagnose what's missing in your current prep routine.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { id: 'random', title: "I go through random materials I find online", sub: "YouTube videos, Telegram PDFs, scattered mock tests without a roadmap" },
                { id: 'withoutSystem', title: "I practice regularly, but without a clear system", sub: "Doing practice tests over and over without knowing how to fix root errors" },
                { id: 'havePlan', title: "I have a plan, but it's unclear if I am improving", sub: "Self-studying without an examiner's expert evaluation" },
                { id: 'tutored', title: "I take courses, but need unlimited AI practice", sub: "Looking for 24/7 instant writing checks and 3D speaking sessions" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPrepMethod(item.id);
                    setCurrentStep(5);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-sky-500 flex items-center justify-between group ${
                    prepMethod === item.id
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: What worries you most about the exam day?                   */}
        {/* =================================================================== */}
        {currentStep === 5 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                What worries you most about exam day?
              </h1>
              <p className="text-sm text-slate-600">
                We will program your exam-day panic protocols and mock tests for this.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { id: 'notImproving', title: "Studying hard but getting stuck at the same band", sub: "Fear of repeating the exam multiple times without progress" },
                { id: 'unfamiliarTopic', title: "An unexpected or unfamiliar topic appearing", sub: "Getting frozen on abstract Task 2 questions or tricky Speaking Part 3 prompts" },
                { id: 'smallMistakes', title: "Losing points to small grammar or spelling slips", sub: "Minor inaccuracies dropping overall score from Band 7.5 down to 6.5" },
                { id: 'nervousness', title: "Freezing up due to exam-room anxiety", sub: "Knowing the answers but panicking when the timer starts running" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setExamFear(item.id);
                    setCurrentStep(6);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-sky-500 flex items-center justify-between group ${
                    examFear === item.id
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 6: Mini Level Diagnostic Test (3 Interactive Questions)        */}
        {/* =================================================================== */}
        {currentStep === 6 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Quick Level Check • Question {miniQIndex + 1} of 3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
                {miniQuestions[miniQIndex].q}
              </h2>
              <p className="text-xs text-slate-500">
                Choose the best answer to calibrate your grammatical and lexical baseline.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {miniQuestions[miniQIndex].options.map((opt, idx) => {
                const isSelected = selectedMiniAnswer === idx;
                const isCorrect = idx === miniQuestions[miniQIndex].correct;

                let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                if (selectedMiniAnswer !== null) {
                  if (isSelected && isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400";
                  } else if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={selectedMiniAnswer !== null}
                    onClick={() => handleMiniAnswerSelect(idx)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all font-semibold text-sm cursor-pointer shadow-xs flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedMiniAnswer !== null && isCorrect && (
                      <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    )}
                    {selectedMiniAnswer !== null && isSelected && !isCorrect && (
                      <span className="material-symbols-outlined text-rose-600 text-base">cancel</span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedMiniAnswer !== null && (
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 animate-fadeIn">
                <span className="font-bold text-slate-900">Examiner Rule: </span>
                {miniQuestions[miniQIndex].rule}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 7: AI Calculating Animation Screen (GoPrep Engine)             */}
        {/* =================================================================== */}
        {currentStep === 7 && (
          <div className="w-full max-w-md mx-auto text-center space-y-7 py-12 animate-fadeIn">
            
            {/* Circular Progress Ring */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#0284C7"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * calcProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-150 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {calcProgress}%
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">
                  AI Calibrating
                </span>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Building Your IELTS Band {targetBand} Plan
              </h2>
              <p className="text-xs text-slate-500 min-h-[32px] transition-all">
                {calcPhase}
              </p>
            </div>

            {/* Checklist Ticks */}
            <div className="space-y-2 text-left max-w-xs mx-auto text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-sm ${calcProgress > 25 ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {calcProgress > 25 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>Cambridge 4-Criteria Diagnostic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-sm ${calcProgress > 55 ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {calcProgress > 55 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>Band Gap & Error Pattern Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-sm ${calcProgress > 85 ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {calcProgress > 85 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>Personalized 4-Week Schedule Ready</span>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 8: GoPrep Result Dashboard & Custom Roadmap                    */}
        {/* =================================================================== */}
        {currentStep === 8 && (
          <div className="w-full space-y-7 py-4 animate-fadeIn">
            
            {/* Header Result Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">verified</span>
                MockLife AI Diagnostic Complete
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Your Path to <span className="text-sky-600">Band {targetBand}</span> is Ready
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Based on your answers, here is your predicted current score and your exact step-by-step path to your target.
              </p>
            </div>

            {/* Score Comparison Hero Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              
              {/* Left: Score Box */}
              <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Predicted Current</div>
                  <div className="text-3xl font-black text-slate-700 mt-0.5">
                    {Number(targetBand) > 6.5 ? '6.0' : '5.5'}
                  </div>
                  <span className="text-[10px] text-slate-500">Baseline Band</span>
                </div>

                <div className="text-sky-500 font-black text-2xl">→</div>

                <div className="text-center">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">With MockLife AI</div>
                  <div className="text-3xl font-black text-emerald-600 mt-0.5">
                    {targetBand}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">Target Goal</span>
                </div>
              </div>

              {/* Right: Gap Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Key Focus Identified:
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Speaking Lexical & Fluency</span>
                    <span className="font-bold text-slate-900">Band 6.0 → {targetBand}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '70%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span>Writing Task 2 Cohesion</span>
                    <span className="font-bold text-slate-900">Band 5.5 → {targetBand}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison: Without Plan vs With MockLife */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">close</span>
                  Without Structured Plan
                </span>
                <ul className="space-y-1.5 text-xs text-slate-500">
                  <li>• Studying random PDFs with no examiner feedback</li>
                  <li>• Stuck at the same band with repeated exam attempts</li>
                  <li>• High effort, slow and uncertain progress</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2 shadow-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span>
                  With MockLife AI Master Plan
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li>• 15-min daily targeted modules based on your weak spots</li>
                  <li>• Instant AI Writing feedback & 3D Speaking Examiner</li>
                  <li>• Reach Band {targetBand} weeks faster with certainty</li>
                </ul>
              </div>
            </div>

            {/* 4-Week Action Curriculum */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 text-lg">calendar_month</span>
                Your 4-Week Custom Game Plan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { w: 'Week 1', title: 'Error Elimination', desc: 'Fix grammar slips and Task 2 paragraph templates' },
                  { w: 'Week 2', title: 'Smart Vocab Vault', desc: 'Master C1 collocations and Academic topic word maps' },
                  { w: 'Week 3', title: '3D Speaking Lab', desc: 'Live practice with AI Examiner on Part 1, 2 & 3' },
                  { w: 'Week 4', title: 'Full Mock Rehearsal', desc: '2h 45m timed simulation to lock in Band ' + targetBand },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-black uppercase text-sky-600 block">{item.w}</span>
                    <strong className="text-xs text-slate-900 block mt-0.5">{item.title}</strong>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Action Button */}
            <div className="pt-2 text-center space-y-3">
              <button
                type="button"
                onClick={handleSaveAndStart}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl shadow-sky-500/25 transition-all duration-200 active:scale-98 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Save My Plan & Enter Platform</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <p className="text-[11px] text-slate-400">
                Your plan is automatically saved to your MockLife candidate profile.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full max-w-3xl mx-auto px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-200/80">
        <p>© 2026 MockLife • AI Diagnostic Engine based on Cambridge IELTS & CEFR Standards</p>
      </footer>

    </div>
  );
};


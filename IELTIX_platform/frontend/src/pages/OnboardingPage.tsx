import React, { useState, useEffect } from 'react';
import { PageTab } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  BookOpen,
  Award,
  Zap,
  TrendingUp,
  Target,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  Star,
  Lock,
  Phone,
  Mail,
  User,
  Gift,
  Flame,
  Volume2,
  Percent,
} from 'lucide-react';

interface OnboardingPageProps {
  onNavigate: (tab: PageTab) => void;
  onComplete?: () => void;
  onExit?: () => void;
}

interface OnboardingState {
  studyReason: string;
  examType: 'ACADEMIC' | 'GENERAL';
  currentLevel: string;
  targetBand: number;
  targetTimeline: string;
  weakSkills: string[];
  dailyMinutes: number;
  pastExperience: string;
  learningStyle: string;
  studyTimeOfDay: string;
  confidenceLevel: string;
  // User info
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onNavigate,
  onComplete,
  onExit,
}) => {
  const { saveAuthSession } = useAuth();

  // Step 1 to 14 (Questions), 15 (AI Loading), 16 (Spin Wheel), 17 (Paywall / Plan)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalQuestionSteps = 14;

  const [state, setState] = useState<OnboardingState>({
    studyReason: 'BACHELOR',
    examType: 'ACADEMIC',
    currentLevel: 'B1',
    targetBand: 7.0,
    targetTimeline: '1_2_MONTHS',
    weakSkills: ['writing', 'speaking'],
    dailyMinutes: 30,
    pastExperience: 'COURSES',
    learningStyle: 'AI_INTERACTIVE',
    studyTimeOfDay: 'EVENING',
    confidenceLevel: 'MEDIUM',
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Diagnostic scores returned from backend / calculated
  const [sessionId, setSessionId] = useState<string>('');
  const [diagnostic, setDiagnostic] = useState({
    overall: 5.5,
    listening: 6.0,
    reading: 6.0,
    writing: 5.0,
    speaking: 5.5,
  });

  // Loading animation state for Step 15
  const [aiProgress, setAiProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Ingliz tili bazaviy darajangiz tahlil qilinmoqda...');

  // Spin Wheel State for Step 16
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonDiscount, setWonDiscount] = useState<number | null>(null);

  // Paywall Timer for Step 17 (10 minutes countdown)
  const [timeLeft, setTimeLeft] = useState(599);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');

  // Form submission loading / error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (currentStep === 17 && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 15 AI Loading simulation
  useEffect(() => {
    if (currentStep === 15) {
      setAiProgress(10);
      const timer1 = setTimeout(() => {
        setAiProgress(45);
        setLoadingText('Writing va Speaking zaif tomonlaringizga mos mashqlar saralanmoqda...');
      }, 1000);

      const timer2 = setTimeout(() => {
        setAiProgress(85);
        setLoadingText('30 kunlik shaxsiy o\'quv dasturi va Band 7.5+ strategiyasi tuzilmoqda...');
      }, 2000);

      const timer3 = setTimeout(() => {
        setAiProgress(100);
        setCurrentStep(16); // Move to Spin the Wheel
      }, 3200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [currentStep]);

  // Handler for Next / Auto Advance
  const handleNext = () => {
    if (currentStep < totalQuestionSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onExit) {
      onExit();
    }
  };

  // Toggle multi-select weak skills
  const toggleWeakSkill = (skill: string) => {
    setState((prev) => {
      const exists = prev.weakSkills.includes(skill);
      if (exists) {
        return { ...prev, weakSkills: prev.weakSkills.filter((s) => s !== skill) };
      } else {
        return { ...prev, weakSkills: [...prev.weakSkills, skill] };
      }
    });
  };

  // Handle Step 14 Lead Capture & Submit to Backend
  const handleSubmitLeadAndStartPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.email && !state.phone) {
      setFormError('Iltimos, email yoki telefon raqamingizni kiriting');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      // 1. Submit diagnostic answers
      const submitRes = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: {
            studyReason: state.studyReason,
            examType: state.examType,
            currentLevel: state.currentLevel,
            targetBand: state.targetBand,
            targetTimeline: state.targetTimeline,
            weakSkills: state.weakSkills,
            dailyMinutes: state.dailyMinutes,
            pastExperience: state.pastExperience,
            learningStyle: state.learningStyle,
            studyTimeOfDay: state.studyTimeOfDay,
            confidenceLevel: state.confidenceLevel,
          },
        }),
      });

      const submitData = await submitRes.json();
      if (submitData.success) {
        setSessionId(submitData.data.sessionId);
        setDiagnostic(submitData.data.diagnostic);
      }

      // 2. Register account immediately in PostgreSQL
      const regRes = await fetch('/api/onboarding/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: submitData.data?.sessionId || `sess_${Date.now()}`,
          fullName: state.fullName || 'IELTS Aspirant',
          email: state.email,
          phone: state.phone || '+998901234567',
          password: state.password || 'mocklife2026',
        }),
      });

      const regData = await regRes.json();
      if (regData.success && regData.data) {
        const { token, user } = regData.data;
        saveAuthSession(token, {
          id: user.id,
          name: user.fullName || state.fullName,
          phone: user.phone || state.phone,
          email: user.email || state.email,
          isSubscribed: true,
          plan: 'TRIAL_7_DAYS',
        });
      }

      setIsSubmitting(false);
      setCurrentStep(15); // Move to AI loading animation
    } catch (err: any) {
      console.warn('Backend onboarding connection note:', err.message);
      setIsSubmitting(false);
      // Fallback transition
      setCurrentStep(15);
    }
  };

  // Handle Spin the Wheel
  const handleSpinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // 5 full spins (1800 deg) + land on 40% slice (around 240 deg)
    const targetRotation = 1800 + 240;
    setWheelRotation(targetRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      setWonDiscount(40);

      try {
        await fetch('/api/onboarding/spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, discount: 40 }),
        });
      } catch (e) {
        console.warn('Spin api sync:', e);
      }
    }, 3800);
  };

  // Finish and enter personalized study plan dashboard
  const handleEnterPlatform = () => {
    if (onComplete) {
      onComplete();
    } else {
      onNavigate('dashboard');
    }
  };

  // =========================================================================
  // RENDER QUESTION SCREENS
  // =========================================================================

  return (
    <div className="min-h-screen bg-[#fdf6e9] text-[#10152b] font-nunito flex flex-col justify-between selection:bg-[#ef3b2d] selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-[#fdf6e9]/90 backdrop-blur-md border-b border-[#eadfc9]/60 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Back button */}
          {currentStep <= totalQuestionSteps && currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs font-bold text-[#4a5068] hover:text-[#ef3b2d] transition px-3 py-1.5 rounded-full hover:bg-white/80 border border-transparent hover:border-[#eadfc9]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
          ) : (
            <div className="w-16" />
          )}

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#ef3b2d] animate-pulse"></span>
            <span className="font-unbounded font-black text-lg tracking-tight text-[#10152b]">
              Mock<span className="text-[#ef3b2d]">Life</span>
            </span>
          </div>

          {/* Step Indicator */}
          {currentStep <= totalQuestionSteps ? (
            <div className="text-xs font-extrabold text-[#7a7f95] bg-white/70 px-3 py-1 rounded-full border border-[#eadfc9]/50">
              {currentStep} / {totalQuestionSteps}
            </div>
          ) : (
            <div className="w-16" />
          )}
        </div>

        {/* Linear Progress Bar */}
        {currentStep <= totalQuestionSteps && (
          <div className="max-w-3xl mx-auto mt-2 h-1.5 w-full bg-[#eadfc9]/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ef3b2d] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalQuestionSteps) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        {/* ======================================================== */}
        {/* STEP 1: Maqsad (Why IELTS?)                              */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>1-qadam: Asosiy Maqsad</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Nima uchun IELTS topshiryapsiz?
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Sizning rejangiz aynan maqsadli sohangizga moslashtiriladi va kerakli leksika beriladi.
            </p>

            <div className="space-y-3">
              {[
                { id: 'BACHELOR', label: 'Bakalavr bosqichiga kirish', icon: GraduationCap, desc: 'Universitet grantlari va oliy ta\'lim uchun' },
                { id: 'MASTER', label: 'Magistratura yoki PhD darajasi', icon: Award, desc: 'Akademik tadqiqotlar va xalqaro stipendiyalar' },
                { id: 'WORK', label: 'Chet elda ishlash yoki emigratsiya', icon: Briefcase, desc: 'Kanada, Buyuk Britaniya, AQSh yoki Yevropa' },
                { id: 'TEACHING', label: 'O\'qituvchilik / Karyera talabi', icon: Users, desc: 'IELTS instruktori bo\'lish yoki maosh ustamasi' },
                { id: 'PERSONAL', label: 'Shaxsiy rivojlanish & Til darajasi', icon: Star, desc: 'Ingliz tilini erkin mukammal egallash' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = state.studyReason === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setState({ ...state, studyReason: item.id });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                        isSelected ? 'bg-[#ef3b2d] text-white' : 'bg-[#fdf6e9] text-[#10152b] group-hover:bg-[#fde3dc]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[#10152b] text-sm sm:text-base">{item.label}</div>
                        <div className="text-xs text-[#7a7f95]">{item.desc}</div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: Format (Academic vs General)                      */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>2-qadam: Imtihon turi</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Qaysi IELTS formatini topshirasiz?
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Reading va Writing topshiriqlari ushbu tanlovingizga qarab to'liq moslashtiriladi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'ACADEMIC',
                  title: 'IELTS Academic',
                  subtitle: 'Universitet va kollejlar uchun',
                  features: ['Akademik ilmiy matnlar', 'Writing Task 1 da grafik va jadvallar', 'Eng ko\'p talab qilinadigan format'],
                  recommended: true,
                },
                {
                  id: 'GENERAL',
                  title: 'IELTS General',
                  subtitle: 'Ishlash va ko\'chib o\'tish uchun',
                  features: ['Kundalik ijtimoiy matnlar', 'Writing Task 1 da rasmiy xat yozish', 'Emigratsiya dasturlari uchun'],
                  recommended: false,
                },
              ].map((fmt) => {
                const isSelected = state.examType === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      setState({ ...state, examType: fmt.id as any });
                    }}
                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/30 shadow-md ring-2 ring-[#ef3b2d]/20'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/50 hover:bg-[#faf4e7]'
                    }`}
                  >
                    {fmt.recommended && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#ef3b2d] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Ommabop
                      </span>
                    )}
                    <div>
                      <h3 className="font-unbounded font-black text-lg text-[#10152b] mb-1">{fmt.title}</h3>
                      <p className="text-xs text-[#7a7f95] mb-4">{fmt.subtitle}</p>
                      <ul className="space-y-2 text-xs text-[#4a5068]">
                        {fmt.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#ef3b2d] shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="mt-6 w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: Metodika va Ilmiy asos (Immediate Feedback)       */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Ilmiy metodika</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Darhol qayta aloqa (Immediate Feedback) usuli
            </h2>
            <p className="text-sm text-[#4a5068] mb-6 leading-relaxed">
              Garvard va <strong>PLOS ONE</strong> xalqaro ilmiy tadqiqotlariga ko'ra, xatoni yechish paytidayoq tushunish va uni darhol tuzatish o'rganish samaradorligini <strong>3.4 baravarga</strong> oshiradi.
            </p>

            <div className="bg-[#fdf6e9] rounded-2xl p-5 border border-[#eadfc9] mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ef3b2d] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  AI
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#10152b]">Real vaqtda xatolarni tahlil qilish</h4>
                  <p className="text-xs text-[#7a7f95]">
                    MockLife nafaqat noto'g'ri javobni ko'rsatadi, balki audio skriptidan dalil va grammatik tushuntirishni taqdim etadi.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-3 border-t border-[#eadfc9]/70">
                <div className="w-8 h-8 rounded-lg bg-[#12935a] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#10152b]">Band 7.5+ Leksik alternativlar</h4>
                  <p className="text-xs text-[#7a7f95]">
                    Writing va Speaking javobingizdagi oddiy so'zlarni avtomatik tarzda akademik sinonimlarga almashtirib beradi.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Tushundim, Davom etamiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: Hozirgi Daraja                                   */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Target className="w-3.5 h-3.5" />
              <span>4-qadam: Boshlang'ich Nuqta</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Hozirgi ingliz tili darajangiz qanday?
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Taxminiy darajangizni belgilang, bu orqali yuklamalar me'yori hisoblab chiqiladi.
            </p>

            <div className="space-y-3">
              {[
                { id: 'A1_A2', label: 'A1 - A2 (Boshlang\'ich / Elementary)', band: 'Band 4.0 - 4.5', desc: 'Oddiy jumlalar, grammatikada bo\'shliqlar bor' },
                { id: 'B1', label: 'B1 (O\'rta / Intermediate)', band: 'Band 5.0 - 5.5', desc: 'Kundalik mavzularda tushunaman, IELTSga yangi kirdim' },
                { id: 'B2', label: 'B2 (Kuchli o\'rta / Upper-Intermediate)', band: 'Band 6.0 - 6.5', desc: 'Erkin gapiraman, Writing va murakkab matnlar qiyin' },
                { id: 'C1', label: 'C1 (Ilg\'or / Advanced)', band: 'Band 7.0 - 7.5+', desc: 'Faqat imtihon strategiyasi va Band 8.0+ kerak' },
              ].map((lvl) => {
                const isSelected = state.currentLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setState({ ...state, currentLevel: lvl.id });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-[#10152b] text-sm sm:text-base">{lvl.label}</div>
                      <div className="text-xs text-[#7a7f95]">{lvl.desc}</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#fdf6e9] text-[#ef3b2d] border border-[#eadfc9]">
                      {lvl.band}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: Maqsad Band Bali                                 */}
        {/* ======================================================== */}
        {currentStep === 5 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>5-qadam: Maqsad Ball</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Qanday natija olishni maqsad qilgansiz?
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Sizga har kuni aynan shu ball mezoniga yetkazuvchi vazifalar yuklanadi.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((band) => {
                const isSelected = state.targetBand === band;
                return (
                  <button
                    key={band}
                    onClick={() => {
                      setState({ ...state, targetBand: band });
                      handleNext();
                    }}
                    className={`py-5 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc] text-[#ef3b2d] ring-2 ring-[#ef3b2d]/30 shadow-md'
                        : 'border-[#eadfc9] bg-[#fdf6e9]/40 hover:border-[#ef3b2d]/60 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#7a7f95] uppercase">IELTS Band</div>
                    <div className="font-unbounded font-black text-3xl text-[#10152b] my-1">{band.toFixed(1)}</div>
                    {band === 7.0 && (
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#ef3b2d]">
                        ★ Eng Ommabop
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 6: Imtihon muddati                                  */}
        {/* ======================================================== */}
        {currentStep === 6 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>6-qadam: Vaqt va Muddat</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Imtihonni qachon topshirishni rejalashtiryapsiz?
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Kunlik o'quv rejasining zichligi va intensivligi shunga qarab hisoblanadi.
            </p>

            <div className="space-y-3">
              {[
                { id: 'LESS_1_MONTH', label: '1 oydan kamroq vaqt ichida', desc: 'Tezkor intensiv ekspress reja (kuniga 1.5 - 2 soat)' },
                { id: '1_2_MONTHS', label: '1 - 2 oy ichida (Tavsiya etiladi)', desc: 'Tizimli bosqichma-bosqich o\'sish sur\'ati' },
                { id: '3_6_MONTHS', label: '3 - 6 oy ichida', desc: 'Asosli poydevor qurish va barqaror Band 7.5+' },
                { id: 'NOT_SURE', label: 'Hali aniq sanani rejalashtirmadim', desc: 'Avval tayyorgarlik ko\'rib, so\'ng sana tanlayman' },
              ].map((item) => {
                const isSelected = state.targetTimeline === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setState({ ...state, targetTimeline: item.id });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-[#10152b] text-sm sm:text-base">{item.label}</div>
                      <div className="text-xs text-[#7a7f95]">{item.desc}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 7: Ijtimoiy Isbot & AI Ekspertiza                    */}
        {/* ======================================================== */}
        {currentStep === 7 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Xalqaro standart</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              AI imtihonchimiz rasmiy IELTS ekspertlari bilan tekshirilgan
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Bizning Speaking va Writing tekshiruv modelimiz rasmiy IDP va British Council imtihonchilari bergan baholarga <strong>98.4% aniqlikda</strong> to'g'ri keladi.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#fdf6e9] p-4 rounded-2xl border border-[#eadfc9] text-center">
                <div className="font-unbounded font-black text-2xl text-[#ef3b2d]">98.4%</div>
                <div className="text-[11px] font-bold text-[#7a7f95] mt-1">Baholash aniqligi</div>
              </div>
              <div className="bg-[#fdf6e9] p-4 rounded-2xl border border-[#eadfc9] text-center">
                <div className="font-unbounded font-black text-2xl text-[#10152b]">15,000+</div>
                <div className="text-[11px] font-bold text-[#7a7f95] mt-1">Muvaffaqiyatli o'quvchi</div>
              </div>
              <div className="bg-[#fdf6e9] p-4 rounded-2xl border border-[#eadfc9] text-center">
                <div className="font-unbounded font-black text-2xl text-[#12935a]">+1.5</div>
                <div className="text-[11px] font-bold text-[#7a7f95] mt-1">O'rtacha Band o'sishi</div>
              </div>
            </div>

            <div className="flex items-center justify-around py-3 px-4 rounded-2xl bg-[#faf4e7] border border-[#eadfc9] text-xs font-black text-[#7a7f95] mb-6">
              <span>Forbes KZ</span>
              <span>•</span>
              <span>Astana Hub</span>
              <span>•</span>
              <span>Khabar 24</span>
              <span>•</span>
              <span>EdTech Award</span>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 8: Zaif tomonlar (Multi-select)                     */}
        {/* ======================================================== */}
        {currentStep === 8 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Flame className="w-3.5 h-3.5" />
              <span>8-qadam: Zaif Nuqtalar</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Qaysi bo'limlarda eng ko'p qiynalasiz?
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Bir yoki bir nechta bo'limni tanlang. Dastur aynan shu ko'nikmalarni kuchaytiradi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { id: 'writing', label: 'Writing (Task 1 & 2)', desc: 'Vaqt yetmasligi, struktura va grammatika' },
                { id: 'speaking', label: 'Speaking (Part 1, 2, 3)', desc: 'Fluency, talaffuz va g\'oya yo\'qligi' },
                { id: 'reading', label: 'Reading (Akademik matnlar)', desc: 'Matching Headings, True/False/Not Given' },
                { id: 'listening', label: 'Listening (Audio sinovlar)', desc: 'Spikerlar tezligi va raqamlar/harflar' },
              ].map((skill) => {
                const isSelected = state.weakSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleWeakSkill(skill.id)}
                    className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/50 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-[#10152b] text-sm">{skill.label}</div>
                      <div className="text-xs text-[#7a7f95] mt-0.5">{skill.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ml-2 ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 9: Kunlik Vaqt                                      */}
        {/* ======================================================== */}
        {currentStep === 9 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>9-qadam: Kunlik Sur'at</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Kuniga qancha vaqt ajrata olasiz?
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Dastur sizning imkoniyatingizga qarab vazifalarni rejalashtiradi.
            </p>

            <div className="space-y-3">
              {[
                { minutes: 15, label: '15 daqiqa (Mikro o\'rganish)', desc: 'Juda band kunlar uchun tezkor mashqlar' },
                { minutes: 30, label: '30 daqiqa (Tavsiya etiladi)', desc: 'Optimal sur\'at — charchamasdan eng yuqori samara' },
                { minutes: 60, label: '1 soat (Intensiv yuklama)', desc: 'Tez orada imtihon topshiruvchilar uchun' },
                { minutes: 120, label: '2 soat va undan ko\'p (Maksimal)', desc: 'To\'liq diqqatni IELTSga qaratganlar uchun' },
              ].map((time) => {
                const isSelected = state.dailyMinutes === time.minutes;
                return (
                  <button
                    key={time.minutes}
                    onClick={() => {
                      setState({ ...state, dailyMinutes: time.minutes });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-[#10152b] text-sm sm:text-base">{time.label}</div>
                      <div className="text-xs text-[#7a7f95]">{time.desc}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 10: Avvalgi Tajriba                                 */}
        {/* ======================================================== */}
        {currentStep === 10 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>10-qadam: Tayyorgarlik Tajribasi</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Avval qanday tayyorgarlik ko'rgansiz?
            </h2>
            <div className="space-y-3 mt-6">
              {[
                { id: 'COURSES', label: 'O\'quv markazida yoki repetitor bilan' },
                { id: 'ONLINE', label: 'Online kurslar yoki YouTube videodarslari orqali' },
                { id: 'BOOKS', label: 'Faqat kitoblar (Cambridge IELTS) orqali mustaqil' },
                { id: 'FIRST_TIME', label: 'Birinchi marta tayyorgarlikni boshlayapman' },
              ].map((item) => {
                const isSelected = state.pastExperience === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setState({ ...state, pastExperience: item.id });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <span className="font-extrabold text-[#10152b] text-sm sm:text-base">{item.label}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 11: O'rganish uslubi                                */}
        {/* ======================================================== */}
        {currentStep === 11 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>11-qadam: Format Ma'qulligi</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Qaysi o'rganish uslubi sizga qulay?
            </h2>
            <div className="space-y-3 mt-6">
              {[
                { id: 'AI_INTERACTIVE', label: 'AI bilan interaktiv simulyatsiya & darhol tekshirish' },
                { id: 'MOCK_TESTS', label: 'Haqiqiy imtihon muhitidagi to\'liq Mock Testlar' },
                { id: 'ERROR_ANALYSIS', label: 'Xatolar ustida batafsil ishlash va qayta ishlash' },
              ].map((item) => {
                const isSelected = state.learningStyle === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setState({ ...state, learningStyle: item.id });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <span className="font-extrabold text-[#10152b] text-sm sm:text-base">{item.label}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 12: Kun Tartibi                                     */}
        {/* ======================================================== */}
        {currentStep === 12 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>12-qadam: Kun Tartibi</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Qaysi vaqtda dars qilish unumliroq?
            </h2>
            <div className="space-y-3 mt-6">
              {[
                { id: 'MORNING', label: 'Ertalab (06:00 - 10:00) — Yangi ma\'lumotlarni yodlash' },
                { id: 'AFTERNOON', label: 'Kunduzi (11:00 - 17:00) — Tushlik tanaffusida' },
                { id: 'EVENING', label: 'Kechqurun (18:00 - 23:00) — Kun yakunida xotirjam' },
              ].map((item) => {
                const isSelected = state.studyTimeOfDay === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setState({ ...state, studyTimeOfDay: item.id });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <span className="font-extrabold text-[#10152b] text-sm sm:text-base">{item.label}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 13: Ishonch darajasi                                */}
        {/* ======================================================== */}
        {currentStep === 13 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>13-qadam: Ishonch Darajasi</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-3">
              Imtihon topshirishdagi ishonchingiz qanday?
            </h2>
            <div className="space-y-3 mt-6">
              {[
                { id: 'HIGH', label: 'O\'zimga ishonaman, faqat tizimli amaliyot va Mock kerak' },
                { id: 'MEDIUM', label: 'O\'rtacha, xatolarimni aniq ko\'rsatib boruvchi AI ustoz zarur' },
                { id: 'LOW', label: 'Biroz xavotirdaman, noldan qadam-baqadam yo\'l-yo\'riq kerak' },
              ].map((item) => {
                const isSelected = state.confidenceLevel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setState({ ...state, confidenceLevel: item.id });
                      handleNext();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/40 shadow-sm'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/60 hover:bg-[#faf4e7]'
                    }`}
                  >
                    <span className="font-extrabold text-[#10152b] text-sm sm:text-base">{item.label}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#ef3b2d] bg-[#ef3b2d] text-white' : 'border-[#eadfc9]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 14: Rivojlanish Grafigi va Ro'yxatdan O'tish         */}
        {/* ======================================================== */}
        {currentStep === 14 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>14-qadam: Shaxsiy Traektoriya</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-2">
              Sizning Band o'sish traektoriyangiz
            </h2>
            <p className="text-sm text-[#4a5068] mb-6">
              Kuniga {state.dailyMinutes} daqiqalik darslar orqali taxminiy o'sish dinamikasi:
            </p>

            {/* Visual SVG Timeline Chart (Day 1 -> Day 90) */}
            <div className="bg-[#fdf6e9] p-5 rounded-2xl border border-[#eadfc9] mb-6">
              <div className="flex justify-between items-end h-28 relative pt-4 pb-2 px-2">
                {/* Curve Line SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <path
                    d="M 20 85 Q 120 70, 220 50 T 450 20"
                    fill="none"
                    stroke="#ef3b2d"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                </svg>

                {[
                  { day: '1-kun', band: '5.5', height: 'h-8', color: 'bg-[#eadfc9] text-[#7a7f95]' },
                  { day: '7-kun', band: '6.0', height: 'h-12', color: 'bg-[#eadfc9] text-[#7a7f95]' },
                  { day: '14-kun', band: '6.5', height: 'h-16', color: 'bg-[#fde3dc] text-[#ef3b2d]' },
                  { day: '30-kun', band: '7.0', height: 'h-20', color: 'bg-[#ef3b2d] text-white font-black' },
                  { day: '90-kun', band: `${state.targetBand || 7.5}`, height: 'h-24', color: 'bg-[#12935a] text-white font-black' },
                ].map((pt, i) => (
                  <div key={i} className="flex flex-col items-center z-10">
                    <span className="text-[11px] font-extrabold text-[#10152b] mb-1">Band {pt.band}</span>
                    <div className={`w-8 rounded-t-lg flex items-center justify-center text-xs ${pt.height} ${pt.color}`}>
                      •
                    </div>
                    <span className="text-[10px] text-[#7a7f95] font-bold mt-1">{pt.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form (Lead Capture) */}
            <form onSubmit={handleSubmitLeadAndStartPlan} className="space-y-4">
              <h3 className="font-unbounded font-extrabold text-lg text-[#10152b]">
                O'quv rejangizni saqlang va hisob oching
              </h3>

              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#7a7f95] block mb-1">Ismingiz</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7a7f95] absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={state.fullName}
                    onChange={(e) => setState({ ...state, fullName: e.target.value })}
                    placeholder="Ism va Familiya"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#eadfc9] focus:outline-none focus:border-[#ef3b2d] text-sm font-bold text-[#10152b] bg-[#fdf6e9]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#7a7f95] block mb-1">Email manzilingiz</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7a7f95] absolute left-4 top-3.5" />
                  <input
                    type="email"
                    value={state.email}
                    onChange={(e) => setState({ ...state, email: e.target.value })}
                    placeholder="misol@gmail.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#eadfc9] focus:outline-none focus:border-[#ef3b2d] text-sm font-bold text-[#10152b] bg-[#fdf6e9]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#7a7f95] block mb-1">Telefon raqamingiz</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7a7f95] absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    value={state.phone}
                    onChange={(e) => setState({ ...state, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#eadfc9] focus:outline-none focus:border-[#ef3b2d] text-sm font-bold text-[#10152b] bg-[#fdf6e9]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#7a7f95] block mb-1">Parol o'ylab toping</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7a7f95] absolute left-4 top-3.5" />
                  <input
                    type="password"
                    value={state.password}
                    onChange={(e) => setState({ ...state, password: e.target.value })}
                    placeholder="Kamida 6 ta belgi"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#eadfc9] focus:outline-none focus:border-[#ef3b2d] text-sm font-bold text-[#10152b] bg-[#fdf6e9]/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50 mt-4"
              >
                <span>{isSubmitting ? 'Hisoblanmoqda...' : 'REJANI SAQLASH VA DAVOM ETISH'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 15: AI Hisoblash Animatsiyasi                        */}
        {/* ======================================================== */}
        {currentStep === 15 && (
          <div className="w-full max-w-lg bg-white rounded-[28px] p-8 shadow-xl border border-[#eadfc9]/80 text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center mx-auto mb-6 relative">
              <Sparkles className="w-10 h-10 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-[#ef3b2d] border-t-transparent animate-spin"></div>
            </div>

            <h2 className="font-unbounded font-black text-2xl text-[#10152b] mb-3">
              Shaxsiy Rejangiz Generatsiya Qilinmoqda
            </h2>
            <p className="text-sm text-[#4a5068] mb-6 min-h-[40px] transition-all">
              {loadingText}
            </p>

            <div className="w-full h-3 bg-[#eadfc9]/60 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#ef3b2d] to-[#ff6b52] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${aiProgress}%` }}
              />
            </div>
            <div className="text-xs font-extrabold text-[#7a7f95]">{aiProgress}% yakunlandi</div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 16: Spin the Wheel (Gamifikatsiya)                   */}
        {/* ======================================================== */}
        {currentStep === 16 && (
          <div className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] text-xs font-extrabold mb-3">
              <Gift className="w-3.5 h-3.5" />
              <span>Maxsus Bonus</span>
            </div>
            <h2 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] mb-2">
              Aylantiring va Chegirma Yuting!
            </h2>
            <p className="text-xs sm:text-sm text-[#4a5068] mb-6">
              Shaxsiy o'quv rejangiz uchun 50% gacha chegirma yutib olish imkoniyati.
            </p>

            {/* Interactive SVG Wheel */}
            <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
              {/* Pointer Triangle */}
              <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-[#ef3b2d] filter drop-shadow" />

              {/* Rotating Wheel Container */}
              <div
                className="w-64 h-64 rounded-full border-4 border-[#10152b] shadow-2xl relative overflow-hidden transition-transform duration-[3800ms] ease-out"
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* 6 Slices */}
                  <path d="M 50 50 L 50 0 A 50 50 0 0 1 93.3 25 Z" fill="#ef3b2d" />
                  <path d="M 50 50 L 93.3 25 A 50 50 0 0 1 93.3 75 Z" fill="#10152b" />
                  <path d="M 50 50 L 93.3 75 A 50 50 0 0 1 50 100 Z" fill="#ef3b2d" />
                  <path d="M 50 50 L 50 100 A 50 50 0 0 1 6.7 75 Z" fill="#10152b" />
                  <path d="M 50 50 L 6.7 75 A 50 50 0 0 1 6.7 25 Z" fill="#ef3b2d" />
                  <path d="M 50 50 L 6.7 25 A 50 50 0 0 1 50 0 Z" fill="#10152b" />
                </svg>

                {/* Slice Labels */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white font-unbounded font-black text-xs">
                  <span className="absolute top-4 font-black">40%</span>
                  <span className="absolute right-5 font-black">20%</span>
                  <span className="absolute bottom-4 font-black">50%</span>
                  <span className="absolute left-5 font-black">30%</span>
                </div>
              </div>

              {/* Center Pin Button */}
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || wonDiscount !== null}
                className="absolute w-16 h-16 rounded-full bg-white text-[#ef3b2d] font-unbounded font-black text-xs uppercase shadow-xl flex items-center justify-center border-4 border-[#10152b] z-10 cursor-pointer disabled:cursor-not-allowed hover:scale-105 transition"
              >
                {isSpinning ? '...' : wonDiscount ? 'YUTUQ' : 'SPIN'}
              </button>
            </div>

            {wonDiscount ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 mb-4 animate-bounce">
                <div className="font-unbounded font-black text-xl text-[#12935a]">
                  🎉 Tabriklaymiz! {wonDiscount}% Chegirma Yutdingiz!
                </div>
                <p className="text-xs text-emerald-800 font-bold mt-1">
                  Promokod faollashtirildi: <span className="underline">MOCKLIFE40</span>
                </p>
                <button
                  onClick={() => setCurrentStep(17)}
                  className="mt-4 w-full py-4 rounded-full bg-[#12935a] hover:bg-[#0e7748] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <span>REJAMNI KO'RISH VA FAOLLASHTIRISH</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSpinning ? 'Aylanmoqda...' : 'G\'ILDIRAKNI AYLANTIRISH'}</span>
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 17: Yakuniy Shaxsiy Reja va Tariflar (Paywall)       */}
        {/* ======================================================== */}
        {currentStep === 17 && (
          <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#eadfc9]/80 animate-fadeIn">
            {/* Urgency Countdown Banner */}
            <div className="bg-[#fde3dc] p-3 rounded-2xl border border-[#ef3b2d]/30 flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#ef3b2d]">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>40% Maxsus chegirma amal qilish muddati:</span>
              </div>
              <div className="font-unbounded font-black text-sm text-[#ef3b2d] bg-white px-3 py-1 rounded-full shadow-sm">
                {formatTimer(timeLeft)}
              </div>
            </div>

            {/* Diagnostic Score Recap Box */}
            <div className="bg-[#fdf6e9] p-5 rounded-2xl border border-[#eadfc9] mb-6">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#eadfc9]">
                <div>
                  <div className="text-xs text-[#7a7f95] font-bold">Diagnostik Natija</div>
                  <div className="font-unbounded font-black text-2xl text-[#10152b]">
                    Overall Band: {diagnostic.overall}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#7a7f95] font-bold">Maqsad Qilingan</div>
                  <div className="font-unbounded font-black text-2xl text-[#ef3b2d]">
                    Band {state.targetBand || 7.0}
                  </div>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-[#eadfc9]/60">
                  <div className="text-[10px] text-[#7a7f95] font-bold">Listening</div>
                  <div className="font-bold text-sm text-[#10152b]">{diagnostic.listening}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#eadfc9]/60">
                  <div className="text-[10px] text-[#7a7f95] font-bold">Reading</div>
                  <div className="font-bold text-sm text-[#10152b]">{diagnostic.reading}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#eadfc9]/60">
                  <div className="text-[10px] text-[#7a7f95] font-bold">Writing</div>
                  <div className="font-bold text-sm text-[#ef3b2d]">{diagnostic.writing}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#eadfc9]/60">
                  <div className="text-[10px] text-[#7a7f95] font-bold">Speaking</div>
                  <div className="font-bold text-sm text-[#ef3b2d]">{diagnostic.speaking}</div>
                </div>
              </div>
            </div>

            {/* Plan Options */}
            <h3 className="font-unbounded font-black text-lg text-[#10152b] mb-3">
              Tarifni tanlang
            </h3>

            <div className="space-y-3 mb-6">
              {[
                {
                  id: 'monthly',
                  title: '1 Oylik Reja',
                  originalPrice: '275 000',
                  discountPrice: '165 000',
                  period: 'oyiga',
                  badge: null,
                },
                {
                  id: 'quarterly',
                  title: '3 Oylik Reja (Tavsiya etiladi)',
                  originalPrice: '550 000',
                  discountPrice: '330 000',
                  period: '3 oyga (110 000 so\'m/oy)',
                  badge: '★ Eng Samarali',
                },
                {
                  id: 'annual',
                  title: '12 Oylik Premium Reja',
                  originalPrice: '1 050 000',
                  discountPrice: '630 000',
                  period: '1 yilga (52 500 so\'m/oy)',
                  badge: 'Maksimal Tejamkorlik',
                },
              ].map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as any)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer relative ${
                      isSelected
                        ? 'border-[#ef3b2d] bg-[#fde3dc]/30 shadow-md ring-2 ring-[#ef3b2d]/20'
                        : 'border-[#eadfc9] hover:border-[#ef3b2d]/50 hover:bg-[#faf4e7]'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#ef3b2d] text-white text-[10px] font-black uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    )}
                    <div>
                      <div className="font-extrabold text-[#10152b] text-sm sm:text-base">{plan.title}</div>
                      <div className="text-xs text-[#7a7f95]">{plan.period}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#7a7f95] line-through">{plan.originalPrice} so'm</div>
                      <div className="font-unbounded font-black text-lg text-[#ef3b2d]">
                        {plan.discountPrice} so'm
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA Button to start */}
            <button
              onClick={handleEnterPlatform}
              className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition cursor-pointer hover:scale-[1.01]"
            >
              <span>O'QUV REJAMNI BOSHLASH (7 KUN BEPUL)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-[#7a7f95] font-semibold mt-4">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#12935a]" /> 256-bit Xavfsiz to'lov
              </span>
              <span>•</span>
              <span>Uzcard / Humo / Visa</span>
              <span>•</span>
              <span>Istalgan vaqtda bekor qilish</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-4 text-center text-xs text-[#7a7f95]">
        MockLife — Xalqaro IELTS va CEFR AI tayyorgarlik platformasi
      </footer>
    </div>
  );
};

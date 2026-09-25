import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { ExamMode } from '../types/index.js';

export const AuthPage: React.FC = () => {
  const { login, register, loading } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTargetBand, setRegTargetBand] = useState('7.5 Academic');
  const [regExamDate, setRegExamDate] = useState('2025-11-15');
  const [regMode, setRegMode] = useState<ExamMode>('IELTS');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);

  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['hero']));
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    [heroRef, featuresRef, authRef, socialRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);
  const isVisible = (id: string) => visibleSections.has(id);

  const [activeSection, setActiveSection] = useState('hero');
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    [heroRef, featuresRef, authRef, socialRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickDemo = (name: string, email: string) => {
    setLoginEmail(email);
    setLoginPassword('demo12345');
    login(email, 'demo12345').then(() => {
      setSuccessMessage(name + ' sifatida kirildi!');
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!loginEmail.trim()) { setErrorMessage('Email manzilingizni kiriting.'); return; }
    const ok = await login(loginEmail, loginPassword);
    if (ok) setSuccessMessage("Muvaffaqiyatli kirildi!");
    else setErrorMessage("Email yoki parol noto\u2018g\u2018ri.");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!regName.trim()) { setErrorMessage("Ismingizni kiriting."); return; }
    if (!regEmail.trim()) { setErrorMessage('Email kiriting.'); return; }
    if (regPassword.length < 6) { setErrorMessage("Parol kamida 6 belgi."); return; }
    const ok = await register({ name: regName.trim(), email: regEmail.trim(), targetBand: regTargetBand, examDate: regExamDate, activeExamMode: regMode, password: regPassword });
    if (ok) setSuccessMessage("Hisob yaratildi!");
    else setErrorMessage("Xatolik yuz berdi.");
  };

  useEffect(() => {
    if (document.getElementById('ix-v2-style')) return;
    const s = document.createElement('style');
    s.id = 'ix-v2-style';
    s.textContent = `
      @keyframes ixV2FadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
      @keyframes ixV2FadeIn{from{opacity:0}to{opacity:1}}
      @keyframes ixV2ScaleIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
      @keyframes ixV2SlideR{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
      @keyframes ixV2SlideL{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
      @keyframes ixV2Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      @keyframes ixV2Gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes ixV2Pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.35)}50%{box-shadow:0 0 0 10px rgba(16,185,129,0)}}
      @keyframes ixV2DiagMove{0%{background-position:0 0}100%{background-position:60px 60px}}
      .ix2-fade-up{animation:ixV2FadeUp .8s cubic-bezier(.22,1,.36,1) both}
      .ix2-fade-in{animation:ixV2FadeIn .7s ease both}
      .ix2-scale-in{animation:ixV2ScaleIn .6s cubic-bezier(.22,1,.36,1) both}
      .ix2-slide-r{animation:ixV2SlideR .7s cubic-bezier(.22,1,.36,1) both}
      .ix2-slide-l{animation:ixV2SlideL .7s cubic-bezier(.22,1,.36,1) both}
      .ix2-float{animation:ixV2Float 5s ease-in-out infinite}
      .ix2-gradient{background-size:200% 200%;animation:ixV2Gradient 5s ease infinite}
      .ix2-pulse{animation:ixV2Pulse 2.5s ease-in-out infinite}
      .ix2-d1{animation-delay:.1s}.ix2-d2{animation-delay:.2s}.ix2-d3{animation-delay:.3s}
      .ix2-d4{animation-delay:.4s}.ix2-d5{animation-delay:.5s}.ix2-d6{animation-delay:.6s}
      .ix2-d7{animation-delay:.7s}.ix2-d8{animation-delay:.8s}.ix2-d9{animation-delay:.9s}
      .ix2-diag-pattern{background-image:repeating-linear-gradient(45deg,transparent,transparent 28px,rgba(249,115,22,.04) 28px,rgba(249,115,22,.04) 30px);animation:ixV2DiagMove 4s linear infinite}
    `;
    document.head.appendChild(s);
  }, []);

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all duration-200";

  const Alert = ({ type, msg }: { type: 'error' | 'success'; msg: string }) => (
    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ix2-scale-in ${type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
      <span className={`material-symbols-outlined text-sm ${type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{type === 'error' ? 'error' : 'check_circle'}</span>
      <span>{msg}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden scroll-smooth">

      {/* ======= SECTION 1: CINEMATIC HERO (Full Viewport) ======= */}
      <section ref={heroRef} id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 ix2-diag-pattern pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-orange-400/[.07] blur-[100px] ix2-float" />
        <div className="absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-emerald-400/[.07] blur-[100px] ix2-float ix2-d4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-yellow-300/[.05] blur-[80px] ix2-float ix2-d2" />
        <div className="absolute top-20 left-[10%] w-16 h-16 border-2 border-orange-200/30 rounded-2xl rotate-12 ix2-float ix2-d3" />
        <div className="absolute top-32 right-[12%] w-10 h-10 border-2 border-emerald-200/30 rounded-full ix2-float ix2-d5" />
        <div className="absolute bottom-40 left-[15%] w-12 h-12 border-2 border-yellow-200/30 rounded-lg rotate-45 ix2-float ix2-d7" />
        <div className="absolute bottom-28 right-[18%] w-8 h-8 bg-orange-100/40 rounded-full ix2-float ix2-d2" />

        <div className={`relative z-10 text-center max-w-3xl mx-auto space-y-7 transition-all duration-1000 ${isVisible('hero') ? 'ix2-fade-up' : 'opacity-0'}`}>
          <div className="ix2-fade-up ix2-d1 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,.06)] border border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-black">IX</span>
              </div>
              <span className="text-base font-extrabold tracking-wider text-gray-900 uppercase">IELTIX</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ix2-pulse inline-block" />
                LIVE
              </span>
            </div>
          </div>

          <div className="ix2-fade-up ix2-d2 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-semibold text-amber-800">
              <span>&#x1F525;</span>
              <span>Cambridge & Milliy BBM Standartlari</span>
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="text-emerald-700">AI Examiner 2.0</span>
            </div>
          </div>

          <h1 className="ix2-fade-up ix2-d3 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
            <span className="text-gray-900">IELTS imtihoniga</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 ix2-gradient">
              eng aqlli yo&apos;l
            </span>
          </h1>

          <p className="ix2-fade-up ix2-d4 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto font-medium">
            AI Examiner bilan real vaqtda ovozli intervyu o&apos;tkazing. Speaking, Writing, Reading va Listening — barchasi bir platformada.
          </p>

          <div className="ix2-fade-up ix2-d5 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button type="button" onClick={() => { scrollTo(authRef); setAuthMode('register'); }}
              className="group w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.04] active:scale-[.97]">
              <span>Bepul boshlash</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button type="button" onClick={() => handleQuickDemo('Mansur Toshmatov', 'mansur@ieltix.uz')}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-base shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[.98]">
              <span className="material-symbols-outlined text-lg text-emerald-500">play_circle</span>
              <span>Demo sinov</span>
            </button>
          </div>

          <div className="ix2-fade-up ix2-d6 flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-gray-500 font-medium">
            {[
              { icon: 'verified', color: 'text-emerald-500', t: 'Karta talab qilinmaydi' },
              { icon: 'record_voice_over', color: 'text-orange-500', t: '24/7 AI Examiner' },
              { icon: 'speed', color: 'text-amber-500', t: 'Tezkor natija' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-lg ${m.color}`}>{m.icon}</span>
                <span>{m.t}</span>
              </div>
            ))}
          </div>

          <div className="ix2-fade-up ix2-d7 pt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { v: '99.2%', l: 'Cambridge mosligi', color: 'text-orange-600', border: 'border-orange-200', bg: 'bg-orange-50/60' },
              { v: '4 Skills', l: "To\u2018liq imtihon", color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50/60' },
              { v: '8.5+', l: 'Maqsadli band', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50/60' },
            ].map((c, i) => (
              <div key={i} className={`py-5 px-4 rounded-2xl ${c.bg} border ${c.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 cursor-default`}>
                <span className={`block text-2xl font-black ${c.color}`}>{c.v}</span>
                <span className="block text-[11px] text-gray-500 font-semibold mt-1">{c.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 ix2-fade-in ix2-d8">
          <span className="text-[10px] font-semibold uppercase tracking-widest">Pastga suring</span>
          <span className="material-symbols-outlined text-xl animate-bounce">keyboard_arrow_down</span>
        </div>
      </section>

      {/* ======= SECTION 2: FEATURE SHOWCASE (6-Card Grid) ======= */}
      <section ref={featuresRef} id="features" className="relative py-24 sm:py-32 px-6 bg-gradient-to-b from-gray-50/80 to-white">
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isVisible('features') ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16 space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-bold text-emerald-700 ${isVisible('features') ? 'ix2-fade-up ix2-d1' : ''}`}>
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Platformaning imkoniyatlari</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black text-gray-900 tracking-tight ${isVisible('features') ? 'ix2-fade-up ix2-d2' : ''}`}>
              Hamma narsa <span className="text-orange-500">bitta joyda</span>
            </h2>
            <p className={`text-gray-500 text-base max-w-lg mx-auto ${isVisible('features') ? 'ix2-fade-up ix2-d3' : ''}`}>
              IELTS imtihonining har bir bo&apos;limi uchun maxsus AI-powered trening
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: 'record_voice_over', title: 'Speaking AI Mock', desc: "Real vaqtdagi ovozli AI Examiner bilan Part 1-2-3 intervyu o\u2018tkazing", gradient: 'from-orange-500 to-amber-500', bg: 'hover:bg-orange-50/50', borderH: 'hover:border-orange-200' },
              { icon: 'edit_note', title: 'Writing Checker', desc: "Task 1 & Task 2 insholaringizni Cambridge mezonlari bilan tahlil qiling", gradient: 'from-emerald-500 to-green-500', bg: 'hover:bg-emerald-50/50', borderH: 'hover:border-emerald-200' },
              { icon: 'analytics', title: 'Score Report', desc: "QR-kod bilan tasdiqlangan batafsil natija sertifikati oling", gradient: 'from-amber-500 to-yellow-500', bg: 'hover:bg-amber-50/50', borderH: 'hover:border-amber-200' },
              { icon: 'menu_book', title: 'Reading Academic', desc: "Cambridge darajasidagi passages va savollarga javob bering", gradient: 'from-orange-500 to-red-400', bg: 'hover:bg-orange-50/50', borderH: 'hover:border-orange-200' },
              { icon: 'headphones', title: 'Listening Trainer', desc: "Audio player va transkripsiya bilan tinglab tushunish mashqlari", gradient: 'from-emerald-500 to-teal-500', bg: 'hover:bg-emerald-50/50', borderH: 'hover:border-emerald-200' },
              { icon: 'psychology', title: 'GoPrep AI Quiz', desc: "Shaxsiy AI quiz generatori — sizning zaif jihatlaringiz bo\u2018yicha", gradient: 'from-amber-500 to-orange-500', bg: 'hover:bg-amber-50/50', borderH: 'hover:border-amber-200' },
            ].map((f, i) => (
              <div key={i} className={`group p-6 rounded-2xl bg-white border border-gray-100 ${f.bg} ${f.borderH} shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-2 cursor-default ${isVisible('features') ? 'ix2-fade-up ix2-d' + (i + 1) : ''}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-white text-xl">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SECTION 3: SPLIT-PANEL LOGIN / REGISTER ======= */}
      <section ref={authRef} id="auth" className="relative py-20 sm:py-28 px-6 bg-white">
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isVisible('auth') ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50 grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">

            {/* LEFT PANEL: Branding */}
            <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-10 sm:p-14 flex flex-col justify-between overflow-hidden ${isVisible('auth') ? 'ix2-slide-r' : ''}`}>
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(249,115,22,.08) 28px, rgba(249,115,22,.08) 30px)' }} />
              <div className="absolute top-10 right-10 w-24 h-24 rounded-full border border-orange-500/20 ix2-float" />
              <div className="absolute bottom-20 left-10 w-16 h-16 rounded-lg border border-emerald-500/20 rotate-12 ix2-float ix2-d4" />

              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-white text-xl font-black">IX</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  IELTS maqsadingizga <span className="text-orange-400">birga</span> erishamiz
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                  IELTIX — O&apos;zbekistondagi eng zamonaviy AI-asoslangan IELTS tayyorgarlik platformasi.
                </p>
              </div>

              <div className="relative z-10 space-y-4 mt-10">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['\uD83E\uDDD1\u200D\uD83C\uDF93', '\uD83D\uDC69\u200D\uD83D\uDCBC', '\uD83D\uDC68\u200D\uD83C\uDFEB', '\uD83D\uDC69\u200D\uD83C\uDF93'].map((e, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-sm">{e}</div>
                    ))}
                  </div>
                  <div>
                    <span className="text-white text-sm font-bold">1,200+</span>
                    <span className="text-gray-500 text-xs ml-1">faol foydalanuvchilar</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(s => (<span key={s} className="text-amber-400 text-sm">&#x2605;</span>))}
                  <span className="text-gray-400 text-xs font-semibold ml-1">4.9 / 5.0 reyting</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Speaking', 'Writing', 'Reading', 'Listening'].map(sk => (
                    <span key={sk} className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300 text-[11px] font-semibold">{sk}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Auth Form */}
            <div className={`bg-white p-8 sm:p-12 flex flex-col justify-center ${isVisible('auth') ? 'ix2-slide-l' : ''}`}>
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl mb-8 max-w-xs">
                {(['login', 'register'] as const).map(mode => (
                  <button key={mode} type="button" onClick={() => { setAuthMode(mode); setErrorMessage(null); setSuccessMessage(null); }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${authMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {mode === 'login' ? 'Kirish' : "Ro\u2018yxatdan o\u2018tish"}
                  </button>
                ))}
              </div>

              {errorMessage && <div className="mb-4"><Alert type="error" msg={errorMessage} /></div>}
              {successMessage && <div className="mb-4"><Alert type="success" msg={successMessage} /></div>}

              {/* LOGIN FORM */}
              {authMode === 'login' && (
                <div className="space-y-5 ix2-fade-in">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1">Xush kelibsiz! &#x1F44B;</h3>
                    <p className="text-sm text-gray-500">Hisobingizga kiring va mashqlarni davom ettiring</p>
                  </div>

                  <button type="button" onClick={() => handleQuickDemo('Mansur Toshmatov', 'mansur@ieltix.uz')}
                    className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow cursor-pointer">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                    <span>Google orqali kirish</span>
                  </button>

                  <div className="relative flex items-center"><div className="flex-1 border-t border-gray-200"/><span className="bg-white px-4 text-[11px] text-gray-400 uppercase tracking-wider font-bold">yoki</span><div className="flex-1 border-t border-gray-200"/></div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Email</label>
                      <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="nomzod@example.com" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700">Parol</label>
                        <button type="button" onClick={() => alert("Parolni qayta tiklash havolasi emailingizga yuboriladi.")} className="text-[11px] text-orange-500 hover:text-orange-600 font-bold transition-colors cursor-pointer">Unutdingizmi?</button>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className={inputCls + ' pr-11'} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input id="rememberMe" type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer" />
                      <label htmlFor="rememberMe" className="text-xs text-gray-600 font-medium cursor-pointer select-none">Meni eslab qolish</label>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 cursor-pointer disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-[.97]">
                      {loading ? 'Kirilmoqda...' : 'Kirish \u2192'}
                    </button>
                  </form>

                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 block mb-2.5 uppercase tracking-widest">Sinov hisoblari</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { n: 'Mansur T.', e: 'mansur@ieltix.uz', b: 'Band 8.0', tag: 'VIP', tc: 'text-orange-600 bg-orange-50' },
                        { n: 'Sardor A.', e: 'sardor@ieltix.uz', b: 'Band 7.5', tag: 'Pro', tc: 'text-emerald-600 bg-emerald-50' },
                      ].map((d, i) => (
                        <button key={i} type="button" onClick={() => handleQuickDemo(d.n, d.e)}
                          className="p-3 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 text-left transition-all duration-200 cursor-pointer group hover:shadow-md">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-800 font-bold group-hover:text-orange-600 transition-colors">{d.n}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${d.tc}`}>{d.tag}</span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-semibold">{d.b}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* REGISTER FORM */}
              {authMode === 'register' && (
                <div className="space-y-5 ix2-fade-in">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1">Yangi hisob &#x1F680;</h3>
                    <p className="text-sm text-gray-500">IELTIX bilan IELTS tayyorgarligingizni boshlang</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">To&apos;liq ism</label>
                      <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder="Mansur Toshmatov" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Email</label>
                      <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="nomzod@example.com" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Maqsadli Band</label>
                        <select value={regTargetBand} onChange={e => setRegTargetBand(e.target.value)} className={inputCls + ' cursor-pointer'}>
                          <option value="7.0 Academic">Band 7.0</option><option value="7.5 Academic">Band 7.5</option><option value="8.0 Academic">Band 8.0</option><option value="8.5 Academic">Band 8.5</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Imtihon sanasi</label>
                        <input type="date" value={regExamDate} onChange={e => setRegExamDate(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Imtihon turi</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['IELTS', 'MILLIY_BBM'] as ExamMode[]).map(m => (
                          <button key={m} type="button" onClick={() => setRegMode(m)}
                            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border-2 cursor-pointer ${regMode === m ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                            {m === 'IELTS' ? 'IELTS Academic' : 'Milliy BBM'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Parol</label>
                      <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Kamida 6 ta belgi" className={inputCls} />
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 cursor-pointer disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-[.97] mt-1">
                      {loading ? 'Yaratilmoqda...' : "Ro\u2018yxatdan o\u2018tish \u2192"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======= SECTION 4: SOCIAL PROOF + FINAL CTA ======= */}
      <section ref={socialRef} id="social" className="relative py-24 sm:py-32 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible('social') ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
          <div className={`space-y-3 mb-14 ${isVisible('social') ? 'ix2-fade-up' : ''}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-bold text-amber-700">
              <span>&#x2B50;</span>
              <span>Foydalanuvchilar fikrlari</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Ularga <span className="text-emerald-500">ishonch</span> bildiring
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
            {[
              { name: 'Nodira K.', band: 'Band 7.5', text: "IELTIX tufayli Speaking bo\u2018limida 6.0 dan 7.5 ga ko\u2018tarildim. AI Examiner juda real edi!", avatar: '\uD83D\uDC69\u200D\uD83C\uDF93', color: 'border-orange-200 bg-orange-50/30' },
              { name: 'Jasur M.', band: 'Band 8.0', text: "Writing checker menga har bir xatomni aniq ko\u2018rsatdi. Eng yaxshi tayyorgarlik vositasi!", avatar: '\uD83D\uDC68\u200D\uD83D\uDCBC', color: 'border-emerald-200 bg-emerald-50/30' },
              { name: 'Dilnoza R.', band: 'Band 7.0', text: "2 oy ichida maqsadli ballimga erishdim. Platformaning tezkor natija berishi ajoyib.", avatar: '\uD83D\uDC69\u200D\uD83D\uDCBB', color: 'border-amber-200 bg-amber-50/30' },
            ].map((t, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${t.color} text-left space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isVisible('social') ? 'ix2-fade-up ix2-d' + (i + 2) : ''}`}>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">&#x2605;</span>)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">{t.avatar}</div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{t.name}</span>
                    <span className="text-[10px] font-semibold text-emerald-600">{t.band} erishdi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`space-y-5 ${isVisible('social') ? 'ix2-fade-up ix2-d6' : ''}`}>
            <p className="text-gray-500 text-sm font-medium">
              <span className="text-orange-500 font-bold">1,200+</span> IELTS nomzodlari allaqachon IELTIX bilan tayyorlanmoqda
            </p>
            <button type="button" onClick={() => { scrollTo(authRef); setAuthMode('register'); }}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 cursor-pointer transition-all duration-300 hover:scale-[1.04] active:scale-[.97]">
              <span>Hozir boshlash — bepul</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 text-xs text-gray-400 font-medium space-y-1">
            <p>&copy; 2026 IELTIX Platform &middot; Cambridge Diagnostic Standard &middot; AI-Powered</p>
            <p>Developed with &#x2764;&#xFE0F; in Uzbekistan</p>
          </div>
        </div>
      </section>

      {/* ======= iOS FROSTED GLASS BOTTOM DOCK ======= */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-2 py-2 bg-white/70 backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,.1)] flex items-center gap-1">
        {([
          { id: 'hero', ref: heroRef, icon: 'home', label: 'Asosiy' },
          { id: 'features', ref: featuresRef, icon: 'widgets', label: 'Xususiyatlar' },
          { id: 'auth', ref: authRef, icon: 'lock_open', label: 'Kirish' },
          { id: 'social', ref: socialRef, icon: 'groups', label: 'Izohlar' },
        ]).map(tab => (
          <button key={tab.id} type="button" onClick={() => scrollTo(tab.ref)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${activeSection === tab.id ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'}`}>
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200/80 mx-0.5" />
        <button type="button" onClick={() => handleQuickDemo('Mansur Toshmatov', 'mansur@ieltix.uz')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-orange-600 hover:bg-orange-50/60 transition-all duration-200 cursor-pointer" title="Tezkor demo">
          <span className="material-symbols-outlined text-[18px] text-amber-500">bolt</span>
          <span className="hidden sm:inline">Demo</span>
        </button>
        <button type="button" onClick={toggleTheme}
          className="flex items-center px-2.5 py-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100/60 transition-all duration-200 cursor-pointer" title="Tema">
          <span className="material-symbols-outlined text-[18px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </nav>

    </div>
  );
};

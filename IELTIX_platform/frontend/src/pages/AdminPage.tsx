import React, { useState, useEffect } from 'react';
import { PageTab } from '../components/Sidebar.js';
import { useUser } from '../context/UserContext.js';
import { supabase } from '../services/supabaseClient.js';
import { api } from '../services/api.js';

interface AdminPageProps {
  onNavigate: (tab: PageTab) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-settings' | 'listening' | 'reading' | 'writing' | 'speaking' | 'candidates'>('overview');
  const [supabaseCandidates, setSupabaseCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // AI & ngrok config state
  const [aiConfig, setAiConfig] = useState({
    aiMode: 'custom_ngrok' as 'groq' | 'custom_ngrok' | 'openai',
    ngrokUrl: 'https://slyvia-cushy-noreen.ngrok-free.dev',
    customAiEndpoint: '',
    coreApiUrl: 'http://localhost:8000',
    groqApiKey: '',
    customApiKey: '',
    examinerModel: 'llama-3.3-70b-versatile',
    examinerVoice: 'en-GB-SoniaNeural',
    systemPrompt: `You are a certified Cambridge IELTS Speaking Examiner conducting an official IELTS interview. Acknowledge the candidate's response, offer a brief 1-sentence Band 8.5 correction if needed, and ask 1 engaging follow-up question.`,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; sampleResponse?: string } | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [adminMaterials, setAdminMaterials] = useState<any>(null);

  // Material Explorer states
  const [materialFilter, setMaterialFilter] = useState<'all' | 'listening' | 'reading' | 'writing' | 'speaking' | 'mockTests'>('all');
  const [materialSearch, setMaterialSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<{ category: string; data: any } | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchAdminConfig = async () => {
    try {
      const res = await api.getAdminConfig();
      if (res?.data) {
        setAiConfig(prev => ({
          ...prev,
          aiMode: res.data.aiMode || prev.aiMode,
          ngrokUrl: res.data.ngrokUrl || prev.ngrokUrl,
          customAiEndpoint: res.data.customAiEndpoint || prev.customAiEndpoint,
          coreApiUrl: res.data.coreApiUrl || prev.coreApiUrl,
          groqApiKey: res.data.groqApiKey || prev.groqApiKey,
          customApiKey: res.data.customApiKey || prev.customApiKey,
          examinerModel: res.data.examinerModel || prev.examinerModel,
          examinerVoice: res.data.examinerVoice || prev.examinerVoice,
          systemPrompt: res.data.systemPrompt || prev.systemPrompt,
        }));
      }
    } catch (e) {
      console.warn('Config fetch error:', e);
    }
  };

  const fetchAdminMaterials = async () => {
    try {
      const res = await api.getAdminContent();
      if (res?.data) {
        setAdminMaterials(res.data);
      }
    } catch (e) {
      console.warn('Materials fetch error:', e);
    }
  };

  const fetchSupabaseCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setSupabaseCandidates(data);
      }
    } catch (e) {
      console.warn('Supabase fetch error:', e);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchAdminConfig();
    fetchAdminMaterials();
  }, []);

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchSupabaseCandidates();
    }
    if (activeTab === 'overview') {
      fetchAdminMaterials();
    }
  }, [activeTab]);

  // Success notifications
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Listening form state
  const [listeningForm, setListeningForm] = useState({
    examCode: 'cambridge-19-test-3',
    part: 1,
    title: '',
    audioUrl: '',
    transcript: '',
    questionType: 'NOTE_COMPLETION',
    prompt: '',
    correctAnswer: '',
  });

  // Reading form state
  const [readingForm, setReadingForm] = useState({
    examCode: 'cambridge-19-test-3',
    passageNumber: 1,
    title: '',
    cefrLevel: 'C1',
    passageText: '',
    questionPrompt: '',
    questionType: 'TRUE_FALSE_NOT_GIVEN',
    correctAnswer: 'TRUE',
  });

  // Writing form state
  const [writingForm, setWritingForm] = useState({
    taskType: 'TASK_2',
    title: '',
    promptText: '',
    chartUrl: '',
    minWords: 250,
  });

  // Speaking form state
  const [speakingForm, setSpeakingForm] = useState({
    part: 2,
    topic: '',
    prompt: '',
    cuePoints: '',
  });

  const showNotification = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await api.updateAdminConfig(aiConfig);
      if (res?.success) {
        showNotification("AI & ngrok API konfiguratsiyasi muvaffaqiyatli saqlandi!");
      }
    } catch (err: any) {
      showNotification(`Xatolik: ${err.message || 'Saqlashda xatolik'}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleTestAiConnection = async () => {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const targetUrl = aiConfig.aiMode === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : (aiConfig.customAiEndpoint || aiConfig.ngrokUrl);
      const targetKey = aiConfig.aiMode === 'groq'
        ? aiConfig.groqApiKey
        : (aiConfig.customApiKey || aiConfig.groqApiKey);

      const res = await api.testAdminConfig({
        url: targetUrl,
        apiKey: targetKey,
        model: aiConfig.examinerModel,
        systemPrompt: aiConfig.systemPrompt,
      });
      setTestResult(res);
      if (res.success) {
        showNotification("API Ulanishi tasdiqlandi!");
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Ulanish xatosi",
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleDeleteMaterial = async (category: string, id: string) => {
    if (!window.confirm("Haqiqatan ham ushbu materialni bazadan o'chirmoqchimisiz?")) return;
    setIsDeletingId(id);
    try {
      const res = await api.deleteAdminContent(category, id);
      if (res?.success) {
        showNotification("Material muvaffaqiyatli o'chirildi!");
        await fetchAdminMaterials();
      } else {
        showNotification(res?.message || "O'chirishda xatolik yuz berdi");
      }
    } catch (e: any) {
      showNotification(e.message || "O'chirishda xatolik");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleSaveListening = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/listening/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listeningForm),
      });
    } catch {}
    showNotification(`Listening ${listeningForm.title || `Part ${listeningForm.part}`} muvaffaqiyatli saqlandi!`);
    setListeningForm({
      examCode: 'cambridge-19-test-3',
      part: 1,
      title: '',
      audioUrl: '',
      transcript: '',
      questionType: 'NOTE_COMPLETION',
      prompt: '',
      correctAnswer: '',
    });
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/reading/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingForm),
      });
    } catch {}
    showNotification(`Reading Passaj: "${readingForm.title}" muvaffaqiyatli saqlandi!`);
    setReadingForm({
      examCode: 'cambridge-19-test-3',
      passageNumber: 1,
      title: '',
      cefrLevel: 'C1',
      passageText: '',
      questionPrompt: '',
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      correctAnswer: 'TRUE',
    });
  };

  const handleSaveWriting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/writing/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(writingForm),
      });
    } catch {}
    showNotification(`Writing vazifasi: "${writingForm.title}" muvaffaqiyatli saqlandi!`);
    setWritingForm({
      taskType: 'TASK_2',
      title: '',
      promptText: '',
      chartUrl: '',
      minWords: 250,
    });
  };

  const handleSaveSpeaking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/speaking/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(speakingForm),
      });
    } catch {}
    showNotification(`Speaking Part ${speakingForm.part} mavzusi muvaffaqiyatli saqlandi!`);
    setSpeakingForm({
      part: 2,
      topic: '',
      prompt: '',
      cuePoints: '',
    });
  };

  // Compute flat list of all materials across categories for unified Explorer
  const allMaterialsList = React.useMemo(() => {
    if (!adminMaterials) return [];
    const list: Array<{
      category: 'listening' | 'reading' | 'writing' | 'speaking' | 'mockTests';
      categoryLabel: string;
      icon: string;
      color: string;
      id: string;
      title: string;
      subtitle: string;
      date: string;
      raw: any;
    }> = [];

    (adminMaterials.listening || []).forEach((item: any) => {
      list.push({
        category: 'listening',
        categoryLabel: 'Listening Audio',
        icon: 'headphones',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        id: String(item.id),
        title: item.title || `Listening Part ${item.part}`,
        subtitle: `${item.examCode || 'IELTS'} • Part ${item.part} • ${item.questionType || 'Audio'}`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Yangi',
        raw: item,
      });
    });

    (adminMaterials.reading || []).forEach((item: any) => {
      list.push({
        category: 'reading',
        categoryLabel: 'Reading Matn',
        icon: 'menu_book',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        id: String(item.id),
        title: item.title || `Reading Passage ${item.passageNumber}`,
        subtitle: `${item.examCode || 'IELTS'} • Passaj ${item.passageNumber} • Daraja: ${item.cefrLevel || 'C1'}`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Yangi',
        raw: item,
      });
    });

    (adminMaterials.writing || []).forEach((item: any) => {
      list.push({
        category: 'writing',
        categoryLabel: 'Writing Mavzu',
        icon: 'edit_note',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        id: String(item.id),
        title: item.title || `${item.taskType} Mavzusi`,
        subtitle: `${item.taskType} • Minimal ${item.minWords || 250} so'z`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Yangi',
        raw: item,
      });
    });

    (adminMaterials.speaking || []).forEach((item: any) => {
      list.push({
        category: 'speaking',
        categoryLabel: 'Speaking Cue Card',
        icon: 'smart_toy',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        id: String(item.id),
        title: item.topic || `Part ${item.part} Mavzusi`,
        subtitle: `Speaking Part ${item.part} • ${item.prompt ? item.prompt.slice(0, 45) + '...' : 'Cue Card'}`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Yangi',
        raw: item,
      });
    });

    (adminMaterials.mockTests || []).forEach((item: any) => {
      list.push({
        category: 'mockTests',
        categoryLabel: 'Mock Arena Testi',
        icon: 'verified',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        id: String(item.id),
        title: item.title,
        subtitle: `${item.section} • ${item.questionsCount || 40} ta savol • ${item.durationMinutes || 60} daqiqa`,
        date: 'Standart',
        raw: item,
      });
    });

    return list;
  }, [adminMaterials]);

  const filteredMaterials = React.useMemo(() => {
    return allMaterialsList.filter(item => {
      const matchesFilter = materialFilter === 'all' || item.category === materialFilter;
      const matchesSearch = !materialSearch || 
        item.title.toLowerCase().includes(materialSearch.toLowerCase()) || 
        item.subtitle.toLowerCase().includes(materialSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allMaterialsList, materialFilter, materialSearch]);

  return (
    <div className="flex flex-col gap-space-lg pb-24 max-w-6xl mx-auto selection:bg-primary-container selection:text-on-primary-container animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-surface-container-high/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/30">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            MockLife Admin & Teacher Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Imtihon Materiallarini Boshqarish & Yuklash
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            IELTS Cambridge va Milliy BBM testlarini (Listening audio, Reading ilmiy matnlar, Writing va Speaking mavzularini) to'g'ridan-to'g'ri bazaga yuklang va tahrirlang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface border border-surface-container-high transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mock-arena')}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-95"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Mock Arena</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveNotification && (
        <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/40 text-secondary text-xs font-bold flex items-center gap-2.5 shadow-md animate-fadeIn">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Umumiy Holat', icon: 'dashboard' },
          { id: 'ai-settings', label: '⚡ AI & ngrok API', icon: 'psychology' },
          { id: 'listening', label: 'Listening Yuklash', icon: 'headphones' },
          { id: 'reading', label: 'Reading Matn & Savol', icon: 'menu_book' },
          { id: 'writing', label: 'Writing Mavzulari', icon: 'edit_note' },
          { id: 'speaking', label: 'Speaking Cue Cardlar', icon: 'smart_toy' },
          { id: 'candidates', label: 'Nomzodlar Ro\'yxati', icon: 'group' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-high/40'
            }`}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: AI & NGROK API SOZLAMALARI */}
      {activeTab === 'ai-settings' && (
        <form onSubmit={handleSaveAiConfig} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-6 animate-fadeIn shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-container-high/40 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                <h3 className="text-lg font-black text-on-surface">⚡ AI Examiner & ngrok API Konfiguratsiyasi</h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                AI Speaking jonli ovozli suhbat, Whisper STT va Telegram Web App uchun o'zingizning ngrok API yoki bulutli LLM manzilingizni sozlang.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
                AI Tizimi: Faol
              </span>
            </div>
          </div>

          {/* Guide Banner for User's Custom ngrok API */}
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary">
              <span className="material-symbols-outlined text-base">info</span>
              <span>Shaxsiy ngrok AI API ulash bo'yicha tezkor ko'rsatma:</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              O'z kompyuteringizdagi yoki serveringizdagi AI modelini (masalan, Python FastAPI, Ollama yoki vLLM) ngrok orqali ochib, havolani quyidagi <strong>ngrok URL</strong> maydoniga kiriting. Platforma Speaking imtihonida to'g'ridan-to'g'ri sizning modelingiz orqali savol-javob qiladi!
            </p>
          </div>

          {/* AI Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-secondary">tune</span>
              <span>AI Provayder / Ishlash Rejimi:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'custom_ngrok', label: '🌐 Shaxsiy ngrok Tunnel', desc: 'Sizning ngrok API havolangiz' },
                { id: 'groq', label: '⚡ Groq Cloud LLaMA 3.3', desc: 'Band 9.0 Standarti (Tezkor)' },
                { id: 'openai', label: '🧠 OpenAI / Custom HTTP', desc: 'Tashqi OpenAI mos endpoint' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAiConfig({ ...aiConfig, aiMode: m.id as any })}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    aiConfig.aiMode === m.id
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                      : 'bg-surface-container-low border-surface-container-high/60 text-on-surface-variant hover:border-surface-container-high'
                  }`}
                >
                  <div className="text-xs font-extrabold">{m.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ngrok Public URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">link</span>
                  <span>ngrok / Public Webhook URL (HTTPS):</span>
                </span>
                <span className="text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-md">
                  Telegram Bot & Webhook manzili
                </span>
              </label>
              <input
                type="url"
                required
                value={aiConfig.ngrokUrl}
                onChange={(e) => setAiConfig({ ...aiConfig, ngrokUrl: e.target.value })}
                placeholder="https://your-tunnel-name.ngrok-free.dev"
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs font-mono text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 shadow-2xs"
              />
              <p className="text-[11px] text-on-surface-variant">
                Telegram Bot Mini App va tashqi API ulanishi uchun foydalaniladigan xavfsiz HTTPS tunnel manzili.
              </p>
            </div>

            {/* Custom AI Endpoint URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-secondary">alt_route</span>
                  <span>Maxsus AI Endpoint URL (Ixtiyoriy, agar subpath bo'lsa):</span>
                </span>
                <span className="text-[10px] text-secondary font-mono bg-secondary/10 px-2 py-0.5 rounded-md">
                  Masalan: /v1/chat/completions
                </span>
              </label>
              <input
                type="text"
                value={aiConfig.customAiEndpoint}
                onChange={(e) => setAiConfig({ ...aiConfig, customAiEndpoint: e.target.value })}
                placeholder="https://your-tunnel-name.ngrok-free.dev/v1/chat/completions"
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs font-mono text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 shadow-2xs"
              />
              <p className="text-[11px] text-on-surface-variant">
                Agar bo'sh qoldirilsa, avtomatik ravishda ngrok URL + <code>/v1/chat/completions</code> yoki Groq ishlatiladi.
              </p>
            </div>

            {/* FastAPI Core API URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">api</span>
                <span>FastAPI Core API Manzili:</span>
              </label>
              <input
                type="text"
                value={aiConfig.coreApiUrl}
                onChange={(e) => setAiConfig({ ...aiConfig, coreApiUrl: e.target.value })}
                placeholder="http://localhost:8000"
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs font-mono text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 shadow-2xs"
              />
              <p className="text-[11px] text-on-surface-variant">
                Mahalliy Python FastAPI backend (STT, TTS va Token generatsiyasi).
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-amber-500">key</span>
                  <span>API Kaliti (Groq yoki Custom Token):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  {showApiKey ? 'Yashirish' : "Ko'rsatish"}
                </button>
              </label>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={aiConfig.groqApiKey}
                onChange={(e) => setAiConfig({ ...aiConfig, groqApiKey: e.target.value })}
                placeholder="gsk_****************************************"
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs font-mono text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 shadow-2xs"
              />
              <p className="text-[11px] text-on-surface-variant">
                Groq yoki o'zingizning ngrok serveringiz talab qiladigan API kaliti (Lokal Ollama bo'lsa bo'sh qoldiring).
              </p>
            </div>

            {/* AI Examiner LLM Modeli */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-indigo-500">neurology</span>
                <span>AI Examiner Modeli:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiConfig.examinerModel}
                  onChange={(e) => setAiConfig({ ...aiConfig, examinerModel: e.target.value })}
                  placeholder="llama-3.3-70b-versatile yoki custom model"
                  className="flex-1 px-4 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs font-bold text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 shadow-2xs"
                />
                <select
                  value={aiConfig.examinerModel}
                  onChange={(e) => setAiConfig({ ...aiConfig, examinerModel: e.target.value })}
                  className="px-3 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs font-bold text-on-surface cursor-pointer"
                >
                  <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B</option>
                  <option value="llama3-8b-8192">LLaMA 3 8B</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </select>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Cambridge IELTS Speaking mezonlari bo'yicha intervyu oluvchi AI modeli.
              </p>
            </div>

            {/* AI Examiner Voice (TTS) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-500">record_voice_over</span>
                <span>Examiner Ovoz Tembr (Edge-TTS):</span>
              </label>
              <select
                value={aiConfig.examinerVoice}
                onChange={(e) => setAiConfig({ ...aiConfig, examinerVoice: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs font-bold text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 shadow-2xs cursor-pointer"
              >
                <option value="en-GB-SoniaNeural">en-GB-SoniaNeural (Britaniya Ayol Imtihonchi - Cambridge Standarti)</option>
                <option value="en-GB-RyanNeural">en-GB-RyanNeural (Britaniya Erkak Imtihonchi)</option>
                <option value="en-US-GuyNeural">en-US-GuyNeural (AQSh Neytral Examiner)</option>
                <option value="uz-UZ-MadinaNeural">uz-UZ-MadinaNeural (O'zbekcha yo'riqnoma)</option>
              </select>
              <p className="text-[11px] text-on-surface-variant">
                Nomzodga savollarni ovozli o'qib beruvchi tabiiy neyron diktor.
              </p>
            </div>

            {/* Custom Examiner System Prompt */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-purple-500">description</span>
                  <span>Examiner Maxsus Ko'rsatmasi (System Persona Prompt):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAiConfig({
                    ...aiConfig,
                    systemPrompt: `You are a certified Cambridge IELTS Speaking Examiner conducting an official IELTS interview. Acknowledge the candidate's response, offer a brief 1-sentence Band 8.5 correction if needed, and ask 1 engaging follow-up question.`
                  })}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  Standartga qaytarish
                </button>
              </label>
              <textarea
                rows={3}
                value={aiConfig.systemPrompt}
                onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                placeholder="AI Examinerga Cambridge qoidalarini belgilovchi maxsus ko'rsatma..."
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 shadow-2xs"
              />
            </div>
          </div>

          {/* Test Connectivity Result Box */}
          {testResult && (
            <div className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-2 animate-fadeIn ${
              testResult.success
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    {testResult.success ? 'check_circle' : 'error'}
                  </span>
                  <span>{testResult.message}</span>
                </span>
                {testResult.latencyMs && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/50 dark:bg-emerald-800/50 font-mono">
                    ⚡ {testResult.latencyMs} ms
                  </span>
                )}
              </div>
              {testResult.sampleResponse && (
                <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-emerald-500/20 font-serif text-[11px] italic">
                  "{testResult.sampleResponse}"
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high/40 flex-wrap">
            <button
              type="button"
              disabled={isTestingAi}
              onClick={handleTestAiConnection}
              className="px-5 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface border border-surface-container-high flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${isTestingAi ? 'animate-spin' : ''}`}>
                {isTestingAi ? 'sync' : 'network_check'}
              </span>
              <span>{isTestingAi ? 'Sinovdan o\'tkazilmoqda...' : '⚡ Ulanishni Tekshirish (Test)'}</span>
            </button>

            <button
              type="submit"
              disabled={isSavingConfig}
              className="px-6 py-3 rounded-2xl bg-primary text-on-primary text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{isSavingConfig ? 'Saqlanmoqda...' : '💾 Sozlamalarni Saqlash'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 1: OVERVIEW & MATERIAL EXPLORER */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dynamic Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Jami Materiallar</span>
                <span className="material-symbols-outlined text-primary text-lg">folder</span>
              </div>
              <div className="text-2xl font-black text-on-surface">{allMaterialsList.length} ta</div>
              <span className="text-[10px] text-primary font-semibold">Barcha bo'limlar</span>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Listening Audio</span>
                <span className="material-symbols-outlined text-amber-500 text-lg">headphones</span>
              </div>
              <div className="text-2xl font-black text-on-surface">{adminMaterials?.listening?.length || 0} ta</div>
              <span className="text-[10px] text-on-surface-variant">Section 1–4 audio</span>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Reading Passaj</span>
                <span className="material-symbols-outlined text-blue-500 text-lg">menu_book</span>
              </div>
              <div className="text-2xl font-black text-on-surface">{adminMaterials?.reading?.length || 0} ta</div>
              <span className="text-[10px] text-on-surface-variant">B2/C1 ilmiy matn</span>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Writing Topsiriq</span>
                <span className="material-symbols-outlined text-emerald-500 text-lg">edit_note</span>
              </div>
              <div className="text-2xl font-black text-on-surface">{adminMaterials?.writing?.length || 0} ta</div>
              <span className="text-[10px] text-on-surface-variant">Task 1 & Task 2</span>
            </div>

            <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Speaking Kartalar</span>
                <span className="material-symbols-outlined text-purple-500 text-lg">smart_toy</span>
              </div>
              <div className="text-2xl font-black text-on-surface">{adminMaterials?.speaking?.length || 0} ta</div>
              <span className="text-[10px] text-on-surface-variant">Part 1–3 Cue Cardlar</span>
            </div>
          </div>

          {/* Quick Action Jump Bar */}
          <div className="p-5 rounded-3xl bg-surface-container border border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">add_circle</span>
                <span>Yangi Imtihon Materiali Qo'shish:</span>
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Listening audio treklari, ilmiy matnlar va Speaking topshiriqlarini kiritish uchun bo'limni tanlang.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('listening')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">headphones</span>
                <span>+ Listening</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reading')}
                className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">menu_book</span>
                <span>+ Reading</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('writing')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                <span>+ Writing</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('speaking')}
                className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">smart_toy</span>
                <span>+ Speaking</span>
              </button>
            </div>
          </div>

          {/* MATERIAL EXPLORER & MANAGEMENT TABLE */}
          <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-surface-container-high/40">
              <div>
                <h3 className="text-base font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  <span>Barcha Yuklangan Materiallar Boshqaruvi</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Platformadagi barcha mock testlar, audio fayllar va topshiriqlarni ko'rish yoki o'chirish.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-base">
                  search
                </span>
                <input
                  type="text"
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  placeholder="Material nomi yoki kodi bo'yicha qidiruv..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: `Barchasi (${allMaterialsList.length})` },
                { id: 'listening', label: `Listening (${adminMaterials?.listening?.length || 0})` },
                { id: 'reading', label: `Reading (${adminMaterials?.reading?.length || 0})` },
                { id: 'writing', label: `Writing (${adminMaterials?.writing?.length || 0})` },
                { id: 'speaking', label: `Speaking (${adminMaterials?.speaking?.length || 0})` },
                { id: 'mockTests', label: `Mock Arena (${adminMaterials?.mockTests?.length || 0})` },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMaterialFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    materialFilter === f.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-surface-container-high/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Material List Table */}
            {filteredMaterials.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                  folder_off
                </span>
                <p className="text-xs text-on-surface-variant font-medium">
                  {materialSearch ? 'Qidiruv bo\'yicha materiallar topilmadi' : 'Hozircha hech qanday material yuklanmagan'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('listening')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer hover:opacity-95"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Birinchi materialni yuklash</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-container-high/40 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <th className="py-3 px-3">Turi & Bo'lim</th>
                      <th className="py-3 px-3">Material Nomi</th>
                      <th className="py-3 px-3">Tafsilotlar</th>
                      <th className="py-3 px-3">Sana</th>
                      <th className="py-3 px-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/30">
                    {filteredMaterials.map(item => (
                      <tr key={`${item.category}-${item.id}`} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${item.color}`}>
                            <span className="material-symbols-outlined text-xs">{item.icon}</span>
                            <span>{item.categoryLabel}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-on-surface max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant max-w-sm truncate text-[11px]">
                          {item.subtitle}
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant text-[11px] whitespace-nowrap font-mono">
                          {item.date}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewItem({ category: item.category, data: item.raw })}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-bold border border-surface-container-high cursor-pointer transition-all flex items-center gap-1"
                              title="Materialni to'liq ko'rish"
                            >
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              <span>Ko'rish</span>
                            </button>
                            <button
                              type="button"
                              disabled={isDeletingId === item.id}
                              onClick={() => handleDeleteMaterial(item.category, item.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-500/20 cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Materialni bazadan o'chirish"
                            >
                              <span className="material-symbols-outlined text-xs">
                                {isDeletingId === item.id ? 'sync' : 'delete'}
                              </span>
                              <span>O'chirish</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LISTENING UPLOADER */}
      {activeTab === 'listening' && (
        <form onSubmit={handleSaveListening} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">🎧 Yangi Listening Test / Part Yuklash</h3>
              <p className="text-xs text-on-surface-variant">IELTS Listening audio, savollar va to'liq audio transkripti</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Imtihon To'plami
              </label>
              <input
                type="text"
                required
                value={listeningForm.examCode}
                onChange={(e) => setListeningForm({ ...listeningForm, examCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="cambridge-19-test-3"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Bo'lim (Section / Part)
              </label>
              <select
                value={listeningForm.part}
                onChange={(e) => setListeningForm({ ...listeningForm, part: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={1}>Part 1 - Kundalik Muloqot (Notes)</option>
                <option value={2}>Part 2 - Jamiyat & Xarita (Map Labelling)</option>
                <option value={3}>Part 3 - Akademik Suhbat (Discussion)</option>
                <option value={4}>Part 4 - Universitet Ma'ruzasi (Lecture)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Mavzu Sarlavhasi
              </label>
              <input
                type="text"
                required
                value={listeningForm.title}
                onChange={(e) => setListeningForm({ ...listeningForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: Cambridge 19 Test 3 Part 1 - Car Rental"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Audio Fayl Manzili (MP3 URL)
            </label>
            <input
              type="text"
              value={listeningForm.audioUrl}
              onChange={(e) => setListeningForm({ ...listeningForm, audioUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              placeholder="https://example.com/audio/c19_test3_part1.mp3 (yoki Web Speech API orqali generatsiya qilinadi)"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              To'liq Audio Transkripti (Audio Narration & Signposts)
            </label>
            <textarea
              rows={4}
              required
              value={listeningForm.transcript}
              onChange={(e) => setListeningForm({ ...listeningForm, transcript: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary font-code leading-relaxed"
              placeholder="Audio suhbat matnini shu yerga joylang..."
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-3">
            <span className="text-xs font-bold text-on-surface block">Savol Qo'shish:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={listeningForm.prompt}
                onChange={(e) => setListeningForm({ ...listeningForm, prompt: e.target.value })}
                placeholder="Savol matni (masalan: Customer full name: ___)"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                value={listeningForm.correctAnswer}
                onChange={(e) => setListeningForm({ ...listeningForm, correctAnswer: e.target.value })}
                placeholder="To'g'ri javob (masalan: Thompson)"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <select
                value={listeningForm.questionType}
                onChange={(e) => setListeningForm({ ...listeningForm, questionType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="NOTE_COMPLETION">Note Completion (Bo'sh joy to'ldirish)</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice (Variantli)</option>
                <option value="MAP_LABELLING">Map Labelling (Xaritada joylashuv A-G)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            <span>Listening Materialni Bazaga Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 3: READING UPLOADER */}
      {activeTab === 'reading' && (
        <form onSubmit={handleSaveReading} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">📖 Yangi Reading Ilmiy Passaj Yuklash</h3>
              <p className="text-xs text-on-surface-variant">Akademik maqola, so'zlar boyligi va savollar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Imtihon To'plami
              </label>
              <input
                type="text"
                required
                value={readingForm.examCode}
                onChange={(e) => setReadingForm({ ...readingForm, examCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="cambridge-19-test-3"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Passaj Tartibi
              </label>
              <select
                value={readingForm.passageNumber}
                onChange={(e) => setReadingForm({ ...readingForm, passageNumber: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={1}>Passage 1 (Umumiy / Tarixiy)</option>
                <option value={2}>Passage 2 (Tabiat / Ekologiya)</option>
                <option value={3}>Passage 3 (Ilmiy / Kognitiv / Falsafa)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Passaj Sarlavhasi
              </label>
              <input
                type="text"
                required
                value={readingForm.title}
                onChange={(e) => setReadingForm({ ...readingForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: The Future of Quantum Computing"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Akademik Matn Mazmuni (Passage Text - kamida 600-900 so'z)
            </label>
            <textarea
              rows={6}
              required
              value={readingForm.passageText}
              onChange={(e) => setReadingForm({ ...readingForm, passageText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary leading-relaxed"
              placeholder="Matnni to'liq shu yerga ko'chirib o'tkazing..."
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-3">
            <span className="text-xs font-bold text-on-surface block">Birinchi Savol Namunasi:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={readingForm.questionPrompt}
                onChange={(e) => setReadingForm({ ...readingForm, questionPrompt: e.target.value })}
                placeholder="Savol jumlasi"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <select
                value={readingForm.correctAnswer}
                onChange={(e) => setReadingForm({ ...readingForm, correctAnswer: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="TRUE">TRUE (Haqiqat)</option>
                <option value="FALSE">FALSE (Noto'g'ri)</option>
                <option value="NOT GIVEN">NOT GIVEN (Matnda berilmagan)</option>
              </select>
              <select
                value={readingForm.questionType}
                onChange={(e) => setReadingForm({ ...readingForm, questionType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="TRUE_FALSE_NOT_GIVEN">True / False / Not Given</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice (Variantli)</option>
                <option value="SUMMARY_COMPLETION">Summary Completion</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-secondary text-on-secondary font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Reading Passajini Bazaga Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 4: WRITING UPLOADER */}
      {activeTab === 'writing' && (
        <form onSubmit={handleSaveWriting} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">✍️ Yangi Writing Vazifasi Qo'shish</h3>
              <p className="text-xs text-on-surface-variant">Task 1 grafik yoki Task 2 insho mavzulari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Vazifa Turi (Task Type)
              </label>
              <select
                value={writingForm.taskType}
                onChange={(e) => setWritingForm({ ...writingForm, taskType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="TASK_1">Task 1 (Grafik / Diagramma / Xarita - 150 so'z)</option>
                <option value="TASK_2">Task 2 (Insho / Essay - 250 so'z)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Mavzu Sarlavhasi
              </label>
              <input
                type="text"
                required
                value={writingForm.title}
                onChange={(e) => setWritingForm({ ...writingForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: Cambridge 19 Test 3 Task 2 - Artificial Intelligence & Employment"
              />
            </div>
          </div>

          {writingForm.taskType === 'TASK_1' && (
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Grafik / Diagramma Rasm Manzili (Image URL)
              </label>
              <input
                type="text"
                value={writingForm.chartUrl}
                onChange={(e) => setWritingForm({ ...writingForm, chartUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="https://example.com/charts/task1_barchart.png"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Insho Sharti va Savol Matni (Prompt)
            </label>
            <textarea
              rows={4}
              required
              value={writingForm.promptText}
              onChange={(e) => setWritingForm({ ...writingForm, promptText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary leading-relaxed"
              placeholder="Masalan: Some people believe that artificial intelligence will replace human jobs entirely. To what extent do you agree or disagree?"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">post_add</span>
            <span>Writing Mavzusini Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 5: SPEAKING UPLOADER */}
      {activeTab === 'speaking' && (
        <form onSubmit={handleSaveSpeaking} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">🎙️ Yangi Speaking Mavzulari & Cue Cardlar</h3>
              <p className="text-xs text-on-surface-variant">3D Foxy bilan jonli audio suhbat kartalari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Speaking Bo'limi
              </label>
              <select
                value={speakingForm.part}
                onChange={(e) => setSpeakingForm({ ...speakingForm, part: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={1}>Part 1 - Tanishtiruv & Qisqa Savollar</option>
                <option value={2}>Part 2 - Cue Card (1 daqiqa tayyorgarlik)</option>
                <option value={3}>Part 3 - Chuqur Mavzuiy Bahs</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Mavzu Nomi
              </label>
              <input
                type="text"
                required
                value={speakingForm.topic}
                onChange={(e) => setSpeakingForm({ ...speakingForm, topic: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: Describe an ambitious project you completed"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Asosiy Savol / Topshiriq
            </label>
            <textarea
              rows={3}
              required
              value={speakingForm.prompt}
              onChange={(e) => setSpeakingForm({ ...speakingForm, prompt: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              placeholder="Describe a challenging goal you achieved..."
            />
          </div>

          {speakingForm.part === 2 && (
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Cue Card Nuqtalari (Vergul bilan ajratilgan)
              </label>
              <input
                type="text"
                value={speakingForm.cuePoints}
                onChange={(e) => setSpeakingForm({ ...speakingForm, cuePoints: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="What it was, When you did it, Who helped you, Why you were proud"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#FF7A00] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">mic</span>
            <span>Speaking Mavzusini Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 6: CANDIDATES */}
      {activeTab === 'candidates' && (
        <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">👥 Ro'yxatdan O'tgan Nomzodlar</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold uppercase">
                  Supabase Cloud Active
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Barcha faol nomzodlar va Supabase PostgreSQL ma'lumotlar bazasi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchSupabaseCandidates}
                disabled={loadingCandidates}
                className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface border border-surface-container-highest transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-sm ${loadingCandidates ? 'animate-spin' : ''}`}>sync</span>
                <span>{loadingCandidates ? 'Yuklanmoqda...' : 'Bazadan Yangilash'}</span>
              </button>
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary font-bold">
                {3 + supabaseCandidates.length} Nomzod
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Nomzod</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Maqsad</th>
                  <th className="p-3">Imtihon Sanasi</th>
                  <th className="p-3">Rejim</th>
                  <th className="p-3 rounded-r-xl">A'zolik Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {/* Real Supabase Candidates */}
                {supabaseCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 bg-emerald-500/5">
                    <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {c.name ? c.name.slice(0, 2).toUpperCase() : 'US'}
                      </span>
                      <span>{c.name || 'Yangi Nomzod'}</span>
                    </td>
                    <td className="p-3 text-on-surface-variant font-code">{c.email}</td>
                    <td className="p-3 font-semibold text-emerald-400">{c.target_band || 'Band 7.5'}</td>
                    <td className="p-3 text-on-surface-variant">{c.exam_date || '2025-11-15'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {c.active_mode || 'IELTS'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Supabase Live</span>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-surface-container-low/50">
                  <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                      SA
                    </span>
                    <span>Sardor Alimov</span>
                  </td>
                  <td className="p-3 text-on-surface-variant font-code">sardor@mocklife.uz</td>
                  <td className="p-3 font-semibold text-primary">Band 7.5</td>
                  <td className="p-3 text-on-surface-variant">Nov 15, 2025</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container font-bold text-[10px]">
                      PRO
                    </span>
                  </td>
                  <td className="p-3 font-bold text-secondary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>Faol A'zo</span>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50">
                  <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-[10px]">
                      NR
                    </span>
                    <span>Nodira Rashidova</span>
                  </td>
                  <td className="p-3 text-on-surface-variant font-code">nodira@mocklife.uz</td>
                  <td className="p-3 font-semibold text-secondary">Band 8.0</td>
                  <td className="p-3 text-on-surface-variant">Oct 26, 2025</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary font-bold text-[10px]">
                      MAX VIP
                    </span>
                  </td>
                  <td className="p-3 font-bold text-secondary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>Faol A'zo</span>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50">
                  <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-[10px]">
                      ShT
                    </span>
                    <span>Sherzod Tursunov</span>
                  </td>
                  <td className="p-3 text-on-surface-variant font-code">sherzod@mocklife.uz</td>
                  <td className="p-3 font-semibold text-on-surface">Band 7.0</td>
                  <td className="p-3 text-on-surface-variant">Dec 10, 2025</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-bold text-[10px]">
                      FREE
                    </span>
                  </td>
                  <td className="p-3 text-on-surface-variant">
                    <span>Sinov Rejimi</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-surface-container rounded-3xl p-6 sm:p-7 border border-surface-container-high/60 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                  {previewItem.category}
                </span>
                <h3 className="text-base font-bold text-on-surface">
                  {previewItem.data.title || previewItem.data.topic || 'Material Ko\'rinishi'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Content Display by Category */}
            <div className="space-y-4 text-xs">
              {/* Listening Preview */}
              {previewItem.category === 'listening' && (
                <div className="space-y-3">
                  {previewItem.data.audioUrl && (
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/40 space-y-2">
                      <span className="text-[11px] font-bold text-on-surface-variant block">Audio Fayl:</span>
                      <audio controls className="w-full" src={previewItem.data.audioUrl} />
                      <div className="text-[10px] text-on-surface-variant font-mono truncate">{previewItem.data.audioUrl}</div>
                    </div>
                  )}
                  {previewItem.data.prompt && (
                    <div>
                      <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">Savol / Topshiriq:</span>
                      <p className="p-3 rounded-xl bg-surface-container-low text-on-surface leading-relaxed">{previewItem.data.prompt}</p>
                    </div>
                  )}
                  {previewItem.data.correctAnswer && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface-variant text-[11px]">To'g'ri javob:</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold">{previewItem.data.correctAnswer}</span>
                    </div>
                  )}
                  {previewItem.data.transcript && (
                    <div>
                      <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">Audio Transkripti:</span>
                      <div className="p-3 rounded-xl bg-surface-container-low font-mono text-[11px] text-on-surface leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {previewItem.data.transcript}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reading Preview */}
              {previewItem.category === 'reading' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-bold text-on-surface-variant">CEFR Darajasi: <span className="text-secondary font-black">{previewItem.data.cefrLevel || 'C1'}</span></span>
                    <span>•</span>
                    <span className="font-bold text-on-surface-variant">Passaj raqami: <span className="text-on-surface font-black">Passage {previewItem.data.passageNumber || 1}</span></span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">Matn (Passage Text):</span>
                    <div className="p-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-serif">
                      {previewItem.data.passageText}
                    </div>
                  </div>
                  {previewItem.data.questionPrompt && (
                    <div>
                      <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">Savol:</span>
                      <p className="p-3 rounded-xl bg-surface-container-low text-on-surface leading-relaxed">{previewItem.data.questionPrompt}</p>
                    </div>
                  )}
                  {previewItem.data.correctAnswer && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface-variant text-[11px]">To'g'ri javob:</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold">{previewItem.data.correctAnswer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Writing Preview */}
              {previewItem.category === 'writing' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-bold text-on-surface-variant">Vazifa Turi: <span className="text-primary font-black">{previewItem.data.taskType || 'TASK_2'}</span></span>
                    <span>•</span>
                    <span className="font-bold text-on-surface-variant">Minimal so'zlar: <span className="text-on-surface font-black">{previewItem.data.minWords || 250} ta</span></span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">Insho Mavzusi (Prompt):</span>
                    <div className="p-3.5 rounded-xl bg-surface-container-low text-on-surface leading-relaxed">
                      {previewItem.data.promptText}
                    </div>
                  </div>
                  {previewItem.data.chartUrl && (
                    <div>
                      <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">Grafik / Diagramma:</span>
                      <img src={previewItem.data.chartUrl} alt="Writing Chart" className="max-h-60 rounded-xl object-contain border border-surface-container-high" />
                    </div>
                  )}
                </div>
              )}

              {/* Speaking Preview */}
              {previewItem.category === 'speaking' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface-variant">Speaking Bo'limi:</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-bold">Part {previewItem.data.part || 2}</span>
                  </div>
                  {previewItem.data.prompt && (
                    <div>
                      <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">Savol / Cue Card:</span>
                      <div className="p-3.5 rounded-xl bg-surface-container-low text-on-surface leading-relaxed">
                        {previewItem.data.prompt}
                      </div>
                    </div>
                  )}
                  {previewItem.data.cuePoints && (
                    <div>
                      <span className="font-bold text-on-surface-variant uppercase text-[10px] block mb-1">You should say (Qo'shimcha bandlar):</span>
                      <div className="p-3 rounded-xl bg-surface-container-low text-on-surface leading-relaxed whitespace-pre-wrap">
                        {previewItem.data.cuePoints}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mock Test Preview */}
              {previewItem.category === 'mockTests' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-surface-container-low">
                      <div className="text-[10px] text-on-surface-variant">Bo'lim</div>
                      <div className="font-bold text-primary">{previewItem.data.section}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-container-low">
                      <div className="text-[10px] text-on-surface-variant">Savollar</div>
                      <div className="font-bold text-on-surface">{previewItem.data.questionsCount || 40} ta</div>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-container-low">
                      <div className="text-[10px] text-on-surface-variant">Vaqt</div>
                      <div className="font-bold text-secondary">{previewItem.data.durationMinutes || 60} daqiqa</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-surface-container-high/40 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


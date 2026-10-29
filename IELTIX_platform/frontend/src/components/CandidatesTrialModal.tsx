import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  Send,
  Award,
  ChevronRight
} from 'lucide-react';
import { apiClient } from '../config/api';
import { useAuth } from '../context/AuthContext';

export interface CandidateItem {
  id: string;
  name: string;
  telegramId?: number;
  username?: string;
  phone?: string;
  isTelegramLinked?: boolean;
  joinedAt: string;
  lastLoginAt: string;
  trialExpiresAt: string;
  trialDaysRemaining: number;
  trialHoursRemaining: number;
  isTrialActive: boolean;
  targetBand?: string;
  currentBand?: number;
  plan?: string;
}

interface CandidatesTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CandidatesTrialModal: React.FC<CandidatesTrialModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [expiredCount, setExpiredCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'expired'>('all');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getCandidatesOverview();
      if (res && res.candidates) {
        setCandidates(res.candidates);
        setTotalCount(res.totalCandidates || res.candidates.length);
        setActiveCount(res.activeTrials || res.candidates.filter((c: any) => c.isTrialActive).length);
        setExpiredCount(res.expiredTrials || res.candidates.filter((c: any) => !c.isTrialActive).length);
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCandidates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter candidates
  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch = 
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cand.username && cand.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cand.phone && cand.phone.includes(searchQuery)) ||
      (cand.telegramId && cand.telegramId.toString().includes(searchQuery));

    if (!matchesSearch) return false;
    if (filterTab === 'active') return cand.isTrialActive;
    if (filterTab === 'expired') return !cand.isTrialActive;
    return true;
  });

  // Date formatting helpers
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getProgressPercentage = (cand: CandidateItem) => {
    try {
      const start = new Date(cand.joinedAt).getTime();
      const end = new Date(cand.trialExpiresAt).getTime();
      const now = Date.now();
      const total = end - start;
      if (total <= 0) return 100;
      const elapsed = now - start;
      const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
      return pct;
    } catch {
      return cand.isTrialActive ? 40 : 100;
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-nunito">
      <div className="bg-[#fffaf0] border-2 border-[#ef3b2d]/30 rounded-[32px] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#eadfc9] bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ef3b2d] text-white flex items-center justify-center shadow-md shadow-[#ef3b2d]/25 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-unbounded font-black text-lg sm:text-xl text-[#10152b]">
                  Platforma Nomzodlari & 1 Haftalik Limit
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#7a7f95] font-bold mt-0.5">
                Barcha foydalanuvchilar soni, kimlar kirgan va 7 kunlik bepul sinov muddati tahlili
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchCandidates}
              disabled={loading}
              title="Yangilash"
              className="p-2.5 rounded-xl border border-[#eadfc9] hover:bg-[#faf5ea] text-[#10152b] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ef3b2d]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#eadfc9] hover:bg-[#fde3dc] text-[#7a7f95] hover:text-[#ef3b2d] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Stats Overview (Qancha foydalanuvchi) */}
        <div className="p-4 sm:p-6 bg-[#faf5ea] border-b border-[#eadfc9] shrink-0">
          <div className="grid grid-cols-3 gap-3">
            {/* 1. Jami Foydalanuvchilar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eadfc9] shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#7a7f95] mb-1">
                <span>Jami Foydalanuvchilar</span>
                <Users className="w-4 h-4 text-[#10152b]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b]">
                  {totalCount}
                </span>
                <span className="text-xs font-extrabold text-[#7a7f95]">nomzod</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                ● 100% Telegram integratsiya
              </span>
            </div>

            {/* 2. Faol 7 Kunlik Sinov */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-1">
                <span>Faol 7 Kunlik Sinov</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-unbounded font-black text-2xl sm:text-3xl text-emerald-600">
                  {activeCount}
                </span>
                <span className="text-xs font-extrabold text-emerald-700">faol</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                ⏳ Barcha testlar ochiq
              </span>
            </div>

            {/* 3. Limiti Tugaganlar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-amber-700 mb-1">
                <span>Limiti Tugagan</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-unbounded font-black text-2xl sm:text-3xl text-amber-600">
                  {expiredCount}
                </span>
                <span className="text-xs font-extrabold text-amber-700">muddati o'tgan</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold block mt-1">
                ⚡ Obuna yangilash kutilmoqda
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#7a7f95] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nomzod, @username yoki ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-full border border-[#eadfc9] bg-white text-xs font-bold text-[#10152b] focus:outline-none focus:border-[#ef3b2d]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#10152b] text-white shadow-xs'
                    : 'bg-white text-[#7a7f95] border border-[#eadfc9] hover:text-[#10152b]'
                }`}
              >
                Barchasi ({totalCount})
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                  filterTab === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Faol ({activeCount})
              </button>
              <button
                onClick={() => setFilterTab('expired')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                  filterTab === 'expired'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Tugagan ({expiredCount})
              </button>
            </div>
          </div>
        </div>

        {/* Modal Candidate List (Kimlar, Qachon kirgan, 1 haftalik limiti qachon tugaydi) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredCandidates.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#eadfc9]">
              <Users className="w-10 h-10 text-[#7a7f95] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-[#10152b]">Nomzodlar topilmadi</p>
              <p className="text-xs text-[#7a7f95] font-semibold mt-1">Qidiruv so'zini o'zgartirib ko'ring</p>
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const progressPct = getProgressPercentage(cand);
              const isCurrentUser = user && (user.telegramId === cand.telegramId || user.phone === cand.phone);

              return (
                <div
                  key={cand.id}
                  className={`p-4 rounded-2xl bg-white border transition-all ${
                    isCurrentUser 
                      ? 'border-[#ef3b2d] shadow-md ring-2 ring-[#ef3b2d]/20' 
                      : 'border-[#eadfc9] hover:border-[#10152b]/40 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* Left: Kimlar (Name, Telegram, Phone, Target) */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {cand.name ? cand.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-[#10152b]">
                            {cand.name}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full bg-[#ef3b2d] text-white text-[10px] font-black uppercase tracking-wider">
                              Siz
                            </span>
                          )}
                          {cand.isTelegramLinked && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#229ED9]/10 text-[#229ED9] text-[10px] font-bold">
                              <Send className="w-2.5 h-2.5" />
                              {cand.username ? `@${cand.username}` : `tg-${cand.telegramId}`}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#7a7f95] font-semibold mt-1 flex-wrap">
                          {cand.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {cand.phone}
                            </span>
                          )}
                          {cand.targetBand && (
                            <span className="flex items-center gap-1 text-[#10152b] font-bold">
                              <Award className="w-3 h-3 text-amber-500" />
                              Maqsad: {cand.targetBand}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Qachon kirgan (Joined date, Last login) */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 lg:gap-6 text-xs bg-[#fdf6e9] p-2.5 sm:px-4 sm:py-2 rounded-xl border border-[#eadfc9]">
                      <div>
                        <span className="text-[10px] text-[#7a7f95] font-bold uppercase tracking-wider block">
                          Qachon kirgan (Ro'yxat):
                        </span>
                        <span className="font-extrabold text-[#10152b] block mt-0.5">
                          {formatDate(cand.joinedAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7a7f95] font-bold uppercase tracking-wider block">
                          So'nggi kirish:
                        </span>
                        <span className="font-extrabold text-[#10152b] block mt-0.5">
                          {formatDate(cand.lastLoginAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right: 1 haftalik limiti qachon tugaydi (Expiry date, countdown, status) */}
                    <div className="flex flex-col sm:items-end justify-center min-w-[210px]">
                      <div className="flex items-center gap-2 mb-1">
                        {cand.isTrialActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {cand.trialDaysRemaining > 0 
                              ? `${cand.trialDaysRemaining} kun qoldi`
                              : `${cand.trialHoursRemaining} soat qoldi`
                            }
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Muddati tugagan
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-bold text-[#4a5068] text-right">
                        <span>Limit tugash sanasi: </span>
                        <b className="text-[#10152b]">{formatDate(cand.trialExpiresAt)}</b>
                      </div>

                      {/* 7-day progress bar */}
                      <div className="w-full sm:w-44 h-1.5 rounded-full bg-gray-200 mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            cand.isTrialActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${cand.isTrialActive ? 100 - progressPct : 100}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Sticky Notice */}
        <div className="p-4 sm:p-5 border-t border-[#eadfc9] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7a7f95]">
            <Sparkles className="w-4 h-4 text-[#ef3b2d]" />
            <span>Har bir yangi nomzod Telegram bot orqali kirishi bilanoq 7 kunlik to'liq bepul sinov oladi.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#10152b] hover:bg-[#ef3b2d] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
};

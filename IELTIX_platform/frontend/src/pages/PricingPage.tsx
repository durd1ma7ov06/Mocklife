import React, { useState } from 'react';
import { useUser } from '../context/UserContext.js';
import { api } from '../services/api.js';
import { 
  Gift, 
  Zap, 
  Crown, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Star,
  CheckCircle2
} from 'lucide-react';

export interface PricingPlan {
  id: 'gift_trial' | 'weekly' | 'monthly';
  name: string;
  price: string;
  starsAmount: number;
  period: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
}

export const PricingPage: React.FC = () => {
  const { user, setUser } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<'Telegram Stars' | 'Click' | 'Payme' | 'Uzum'>('Telegram Stars');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [activatedGift, setActivatedGift] = useState<boolean>(true);

  const plans: PricingPlan[] = [
    {
      id: 'gift_trial',
      name: '1 Haftalik Bepul Sovg\'a',
      price: '0 Stars (Bepul)',
      starsAmount: 0,
      period: '/ 7 kunlik sovg\'a',
      description: 'Barcha yangi nomzodlar uchun 7 kunlik to\'liq cheksiz kirish sovg\'asi!',
      badge: '🎉 Yangi Foydalanuvchilarga Sovg\'a',
      popular: false,
      features: [
        '7 kun barcha bo\'limlarga 100% bepul to\'liq kirish',
        'Writing Task 1 & 2 AI Evaluator (Insho tahlili)',
        'Reading Lab & Smart Vocab Vault',
        '3D Foxy bilan jonli AI Speaking suhbati',
        'Listening Section 1–4 audio pleyer va savollar',
        'To\'liq 2h 45m Computer-Delivered Mock Arena',
      ],
      ctaText: 'Hozir Faol (7 Kunlik Sovg\'a)',
    },
    {
      id: 'weekly',
      name: 'Haftalik Obuna (Weekly Plus)',
      price: '49 Stars',
      starsAmount: 49,
      period: '/ 7 kun',
      description: '1 haftalik bepul sinovdan so\'ng moslashuvchan, tezkor haftalik obuna.',
      badge: '⚡️ Tezkor Tayyorgarlik',
      popular: false,
      features: [
        '7 kunlik uzluksiz cheksiz kirish',
        'To\'liq 4 ko\'nikmali Mock Arena sinovlari',
        'Writing insholari bo\'yicha tezkor AI baholash',
        '3D Foxy bilan Speaking Part 1, 2, 3 mashqlari',
        'Telegram Stars orqali 1-klikda tezkor to\'lov',
        'Kunlik streak va intizom ko\'rsatkichi',
      ],
      ctaText: '49 Stars Bilan Obuna Bo\'lish',
    },
    {
      id: 'monthly',
      name: 'Oylik VIP Obuna (Monthly VIP)',
      price: '249 Stars',
      starsAmount: 249,
      period: '/ 30 kun',
      description: 'Imtihongacha to\'liq 1 oylik professional IELTS tayyorgarlik kursi.',
      badge: '🔥 Eng Ommabop • Tavsiya Etiladi',
      popular: true,
      features: [
        '30 kun barcha bo\'limlarga 100% cheksiz kirish',
        'Katta ekranda to\'liq 4 ko\'nikmali Mock Arena',
        'Cheksiz 3D Foxy Live AI Speaking va ovoz tahlili',
        'Writing Task 1 & 2 chuqur mezonli AI baholash',
        'QR-tasdiqlangan rasmiy xalqaro Score Certificate',
        'VIP Telegram hamjamiyati va maxsus materiallar',
      ],
      ctaText: '249 Stars Bilan Obuna Bo\'lish',
    },
  ];

  const handleOpenCheckout = (plan: PricingPlan) => {
    if (plan.id === 'gift_trial') {
      // Instant activate gift
      setUser(prev => ({
        ...prev,
        vipTier: 'MAX_VIP',
        daysLeft: 7,
      }));
      setActivatedGift(true);
      alert("🎉 Tabriklaymiz! 1 haftalik bepul VIP sovg'a faollashtirildi!");
      return;
    }
    setSelectedPlan(plan);
    setCheckoutModalOpen(true);
    setPaymentSuccess(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    try {
      await api.checkoutVip(selectedPlan.name, selectedPlan.starsAmount, selectedProvider);
    } catch {}
    
    const addedDays = selectedPlan.id === 'weekly' ? 7 : 30;
    setUser(prev => ({ 
      ...prev, 
      vipTier: 'MAX_VIP',
      daysLeft: (prev.daysLeft || 0) + addedDays,
    }));
    setPaymentSuccess(true);
    setTimeout(() => {
      setCheckoutModalOpen(false);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto font-nunito animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fde3dc] border border-[#ef3b2d]/20 text-[#ef3b2d] text-xs font-black uppercase tracking-wider shadow-sm">
          <Gift className="w-4 h-4" />
          <span>Yangi Foydalanuvchilar Uchron 1 Haftalik Sovg'a</span>
        </div>
        
        <h1 className="font-unbounded font-black text-2xl sm:text-4xl text-[#10152b] tracking-tight">
          Hozir Kirgan Har Bir Nomzod Uchun <span className="text-[#ef3b2d]">1 Haftalik Bepul Sovg'a!</span>
        </h1>
        
        <p className="text-xs sm:text-sm text-[#4a5068] font-bold max-w-2xl mx-auto leading-relaxed">
          Birinchi marta ro'yxatdan o'tganingizda 7 kun davomida barcha 4 ta modul (Writing, Reading, Speaking, Listening) to'liq bepul ochiq bo'ladi. Bir haftadan keyin haftalik 49 Stars yoki oylik 249 Stars orqali davom ettirishingiz mumkin.
        </p>

        {/* Current status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Sizning joriy holatingiz: 7 Kunlik Bepul Sinov Faol ({user.daysLeft || 7} kun qoldi)</span>
        </div>
      </div>

      {/* 2. 3 ta Tarif Kartalari Grid (1 Haftalik Sovg'a, 49 Stars Haftalik, 249 Stars Oylik) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
        {plans.map((plan) => {
          const isGift = plan.id === 'gift_trial';
          const isMonthly = plan.id === 'monthly';
          
          return (
            <div
              key={plan.id}
              className={`rounded-[30px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative shadow-sm ${
                isMonthly
                  ? 'bg-white border-2 border-[#ef3b2d] shadow-xl md:-translate-y-2'
                  : isGift
                  ? 'bg-[#fffaf0] border-2 border-emerald-300 shadow-md'
                  : 'bg-white border border-[#eadfc9] hover:border-[#10152b] hover:shadow-md'
              }`}
            >
              {/* Top Badge */}
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap ${
                  isMonthly
                    ? 'bg-[#ef3b2d] text-white'
                    : isGift
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#10152b] text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {isGift && <Gift className="w-6 h-6 text-emerald-600" />}
                    {plan.id === 'weekly' && <Zap className="w-6 h-6 text-[#ff7a00]" />}
                    {isMonthly && <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />}
                    <h3 className="font-unbounded font-black text-base text-[#10152b]">{plan.name}</h3>
                  </div>
                </div>

                {/* Price Display */}
                <div className="my-4 pb-4 border-b border-[#eadfc9]/60">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-unbounded font-black text-3xl sm:text-4xl text-[#10152b] tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-[#7a7f95] font-bold">{plan.period}</span>
                  </div>
                  {plan.starsAmount > 0 && (
                    <span className="text-[11px] font-bold text-[#ff7a00] flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-[#ff7a00]" />
                      Telegram Stars orqali bir zumda faollashtirish
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#4a5068] font-bold mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* Features Checklist */}
                <div className="space-y-3 pt-2">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs font-bold text-[#2a3048]">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isGift ? 'bg-emerald-100 text-emerald-700' : isMonthly ? 'bg-[#fde3dc] text-[#ef3b2d]' : 'bg-[#fff3e6] text-[#ff7a00]'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-[#eadfc9]/60">
                <button
                  type="button"
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                    isGift
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : isMonthly
                      ? 'bg-[#ef3b2d] hover:bg-[#d62f22] text-white shadow-md'
                      : 'bg-[#10152b] hover:bg-[#2a3048] text-white'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Telegram Stars & To'lov Haqida Ma'lumot */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-[#eadfc9] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#ff7a00] fill-[#ff7a00]" />
            <h3 className="font-unbounded font-black text-base sm:text-lg text-[#10152b]">
              Telegram Stars (⭐️) Orqali To'lov Qanday Ishlaydi?
            </h3>
          </div>
          <p className="text-xs text-[#4a5068] font-bold leading-relaxed max-w-2xl">
            Telegram Stars — bu Telegram messenjeri ichidagi rasmiy va xavfsiz to'lov usuli. Bitta tugmani bosish orqali to'lov qilasiz va profilingiz bir soniyada faollashadi. Bank kartalari (Click / Payme / Uzcard) orqali to'lash ham mavjud.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-[#fdf6e9] border border-[#eadfc9] text-center">
            <span className="text-[10px] text-[#7a7f95] font-bold block">Haftalik</span>
            <span className="font-unbounded font-black text-sm text-[#ff7a00]">49 Stars</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#fde3dc] border border-[#fbd0c4] text-center">
            <span className="text-[10px] text-[#ef3b2d] font-bold block">Oylik VIP</span>
            <span className="font-unbounded font-black text-sm text-[#ef3b2d]">249 Stars</span>
          </div>
        </div>
      </div>

      {/* 4. Checkout Simulation Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-nunito">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 border border-[#eadfc9] shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#eadfc9]">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#ef3b2d]" />
                <h3 className="font-unbounded font-bold text-base text-[#10152b]">{selectedPlan.name}</h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#fdf6e9] flex items-center justify-center text-[#7a7f95] hover:text-[#10152b] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-3 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl shadow-md">
                  ✓
                </div>
                <h4 className="font-unbounded font-black text-lg text-[#10152b]">To'lov Muvaffaqiyatli!</h4>
                <p className="text-xs text-[#4a5068] font-bold">
                  Hisobingizga <strong>{selectedPlan.name}</strong> muvaffaqiyatli ulandi! Barcha bo'limlar ochildi.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-xs text-[#7a7f95] font-bold block">To'lov tizimini tanlang:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Telegram Stars', label: 'Telegram Stars ⭐️', desc: `${selectedPlan.starsAmount} Stars` },
                    { id: 'Click', label: 'Click', desc: `${selectedPlan.starsAmount * 300} so'm` },
                    { id: 'Payme', label: 'Payme', desc: `${selectedPlan.starsAmount * 300} so'm` },
                    { id: 'Uzum', label: 'Uzum Bank', desc: `${selectedPlan.starsAmount * 300} so'm` },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProvider(p.id as any)}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all text-xs font-bold cursor-pointer ${
                        selectedProvider === p.id
                          ? 'border-[#ef3b2d] bg-[#fde3dc] text-[#ef3b2d] ring-2 ring-[#ef3b2d]/30 shadow-sm'
                          : 'border-[#eadfc9] bg-[#faf6ee] text-[#10152b] hover:bg-white'
                      }`}
                    >
                      <span className="font-extrabold">{p.label}</span>
                      <span className="text-[10px] text-[#7a7f95]">{p.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[#fdf6e9] border border-[#eadfc9] text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7a7f95]">Tarif:</span>
                    <strong className="text-[#10152b] font-black">{selectedPlan.name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7a7f95]">To'lov:</span>
                    <strong className="text-base font-black text-[#ef3b2d] font-unbounded">{selectedPlan.price}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#eadfc9]">
                    <span className="text-[#7a7f95]">Faollashish:</span>
                    <strong className="text-emerald-700 font-bold">Darhol (Avtomatik)</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="w-full py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{selectedProvider} orqali to'lash ({selectedPlan.price})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PricingPage;

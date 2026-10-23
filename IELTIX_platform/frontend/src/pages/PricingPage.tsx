import React, { useState } from 'react';
import { useUser } from '../context/UserContext.js';
import { api } from '../services/api.js';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  rawPrice: number;
  period: string;
  description: string;
  features: string[];
  current: boolean;
  popular: boolean;
  badge?: string;
}

export const PricingPage: React.FC = () => {
  const { user, setUser } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<'Click' | 'Payme' | 'Telegram'>('Click');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free Diagnostic',
      price: '0 UZS',
      rawPrice: 0,
      period: 'Cheksiz',
      description: 'Dastlabki diagnostik test va 3D Foxy bilan tanishuv uchun.',
      features: [
        '1 ta to\'liq Mock Exam diagnostikasi',
        'Boshlang\'ich Band baholash',
        'Vocab Vault (10 tagacha so\'z)',
        'Umumiy hamjamiyat yordami',
      ],
      current: user.vipTier === 'FREE',
      popular: false,
    },
    {
      id: 'pro',
      name: 'VIP Candidate Pro',
      price: '15,000 UZS',
      rawPrice: 15000,
      period: '/ oy',
      description: 'Band 7.5+ darajaga tezroq chiqishni maqsad qilgan o\'quvchilar uchun eng mashhur tarif.',
      features: [
        'Cheksiz Full Mock Testlar (IELTS Standart)',
        'Cheksiz 3D Foxy AI Speaking sessiyalari',
        'AI Writing Evaluator (Task 1 & Task 2 tahlili)',
        'Cheksiz Smart Vocab Vault saqlash',
        'Tezkor QR tasdiqlangan sertifikat',
      ],
      current: user.vipTier === 'PRO',
      popular: true,
      badge: 'Eng Ommabop',
    },
    {
      id: 'max',
      name: 'MAX Plan VIP Mastery',
      price: '32,000 UZS',
      rawPrice: 32000,
      period: 'To\'liq paket',
      description: 'Maksimal imkoniyatlar: barcha IELTS test paketlari va ustuvor AI resurslar.',
      features: [
        'VIP Candidate Pro\'dagi barcha imkoniyatlar',
        'Barcha yangi Cambridge test paketlariga to\'liq kirish',
        'Eksklyuziv VIP Telegram yordam guruhi',
        'Rasmiy PDF imtihon materiallarini to\'g\'ridan-to\'g\'ri yuklab olish',
        '1-ga-1 chuqur AI diagnostik tahlili',
      ],
      current: user.vipTier === 'MAX_VIP',
      popular: false,
      badge: 'Maksimal Paket',
    },
  ];

  const handleOpenCheckout = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setCheckoutModalOpen(true);
    setPaymentSuccess(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    try {
      await api.checkoutVip(selectedPlan.name, selectedPlan.rawPrice, selectedProvider);
      setUser(prev => ({ 
        ...prev, 
        vipTier: selectedPlan.id === 'max' ? 'MAX_VIP' : 'PRO',
      }));
      setPaymentSuccess(true);
      setTimeout(() => {
        setCheckoutModalOpen(false);
      }, 2000);
    } catch {
      setUser(prev => ({ 
        ...prev, 
        vipTier: selectedPlan.id === 'max' ? 'MAX_VIP' : 'PRO' 
      }));
      setPaymentSuccess(true);
      setTimeout(() => {
        setCheckoutModalOpen(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-space-xl pb-20 max-w-6xl mx-auto selection:bg-primary-container selection:text-on-primary-container animate-fadeIn">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-bold uppercase tracking-wider border border-tertiary/30">
          <span className="material-symbols-outlined text-sm">diamond</span>
          VIP & A'zolik Tariflari
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-on-surface tracking-tight">
          <span className="text-[#FF7A00]">MockLife VIP</span> Bilan Band 7.5+ Natijaga Tezroq Erishing
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          3D Foxy AI Speaking, batafsil Writing tahlili va barcha rasmiy Cambridge test modullariga cheksiz kirish imkoniyatini oching.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
              plan.popular
                ? 'bg-gradient-to-b from-surface-container-high to-surface-container border-2 border-primary shadow-2xl scale-102 z-10'
                : 'bg-surface-container border border-surface-container-high/60 shadow-lg hover:border-surface-container-highest'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-tertiary text-white text-xs font-black uppercase tracking-wider shadow">
                {plan.badge || 'Eng Ommabop'}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
                {plan.current && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary font-bold">
                    Faol Tarif
                  </span>
                )}
              </div>

              <div className="my-4">
                <span className="text-3xl sm:text-4xl font-black text-on-surface">{plan.price}</span>
                <span className="text-xs text-on-surface-variant ml-1 font-medium">{plan.period}</span>
              </div>

              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                {plan.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-surface-container-high/40">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-on-surface">
                    <span className="material-symbols-outlined text-sm text-secondary flex-shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => handleOpenCheckout(plan)}
                disabled={plan.current}
                className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  plan.current
                    ? 'bg-surface-container-high text-on-surface-variant cursor-default opacity-70'
                    : plan.popular
                    ? 'bg-gradient-to-r from-primary to-tertiary text-white hover:opacity-95 shadow-lg'
                    : 'bg-primary-container text-on-primary-container hover:opacity-90'
                }`}
              >
                <span>{plan.current ? 'Hozirgi Tarifingiz' : `Tanlash (${plan.price})`}</span>
                {!plan.current && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Simulation Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">payments</span>
                <h3 className="font-bold text-lg text-on-surface">{selectedPlan.name}</h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-3 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center mx-auto text-3xl shadow-md">
                  ✓
                </div>
                <h4 className="text-xl font-bold text-on-surface">To'lov Muvaffaqiyatli!</h4>
                <p className="text-xs text-on-surface-variant">
                  Hisobingiz <strong>{selectedPlan.name}</strong> darajasiga ko'tarildi va barcha imkoniyatlar faollashtirildi!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-xs text-on-surface-variant font-medium">To'lov tizimini tanlang:</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Uzcard / Humo', label: 'Uzcard/Humo', icon: 'credit_card', color: 'text-primary' },
                    { id: 'Click', label: 'Click', icon: 'payments', color: 'text-secondary' },
                    { id: 'Payme', label: 'Payme', icon: 'account_balance_wallet', color: 'text-[#10B981]' },
                    { id: 'Visa', label: 'Visa / MC', icon: 'credit_card_gear', color: 'text-[#FF7A00]' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProvider(p.id as any)}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all text-xs font-bold cursor-pointer ${
                        selectedProvider === p.id
                          ? 'border-primary bg-primary/10 text-on-surface ring-2 ring-primary/30 shadow-sm'
                          : 'border-surface-container-high bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${p.color}`}>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/40 text-xs text-on-surface space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Tanlangan tarif:</span>
                    <strong>{selectedPlan.name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">To'lov summasi:</span>
                    <strong className="text-base font-black text-primary">{selectedPlan.price}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-surface-container-high/30">
                    <span className="text-on-surface-variant">Komissiya:</span>
                    <strong className="text-secondary">0 UZS (0%)</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
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


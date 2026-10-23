import React from 'react';
import { Check, ArrowRight, ShieldCheck, Zap, Gift, Crown, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface PricingBlockProps {
  onSubscribeClick?: (planId?: 'gift' | 'weekly' | 'monthly') => void;
}

export const PricingBlock: React.FC<PricingBlockProps> = ({ onSubscribeClick }) => {
  const { t } = useLanguage();

  const pricingCards = [
    {
      id: 'gift' as const,
      name: "1 Haftalik Bepul Sovg'a",
      price: '0 Stars',
      subtitle: 'Bepul / 7 kunlik sovg\'a',
      badge: "🎉 Yangi Foydalanuvchilarga Sovg'a",
      badgeColor: 'bg-emerald-600 text-white',
      border: 'border-2 border-emerald-300',
      bg: 'bg-[#fffaf0]',
      desc: 'Hamma yangi kirgan nomzodlar uchun 7 kun davomida barcha bo\'limlar to\'liq bepul va ochiq!',
      features: [
        '7 kun barcha 4 ta modulga cheksiz kirish',
        'Writing Task 1 & 2 AI Evaluator',
        'Reading Lab & Smart Vocab Vault',
        '3D Foxy bilan Speaking AI suhbati',
        'Listening Section 1–4 audio darslari',
        'To\'liq Computer-Delivered Mock Arena',
      ],
      btnText: "Sovg'ani Qabul Qilish (0 Stars)",
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      id: 'weekly' as const,
      name: 'Haftalik Obuna (Weekly Plus)',
      price: '49 Stars',
      subtitle: '/ 7 kunlik kirish',
      badge: '⚡️ 1 Haftadan Keyin',
      badgeColor: 'bg-[#10152b] text-white',
      border: 'border border-[#eadfc9] hover:border-[#10152b]',
      bg: 'bg-white',
      desc: '1 haftalik sinovdan keyin haftalik moslashuvchan reja bilan davom ettirish uchun.',
      features: [
        '7 kunlik uzluksiz cheksiz kirish',
        'Full Mock Arena va natijalar tahlili',
        'Writing insho skeletlari va AI tahlil',
        'Telegram Stars orqali 1-klikda to\'lov',
        'Kunlik intizom va streak ko\'rsatkichi',
        'Istalgan vaqtda to\'xtatish imkoniyati',
      ],
      btnText: '49 Stars Bilan Obuna Bo\'lish',
      btnColor: 'bg-[#10152b] hover:bg-[#2a3048] text-white',
    },
    {
      id: 'monthly' as const,
      name: 'Oylik VIP Obuna (Monthly VIP)',
      price: '249 Stars',
      subtitle: '/ 30 kunlik to\'liq kurs',
      badge: '🔥 Eng Ommabop • Tavsiya Etiladi',
      badgeColor: 'bg-[#ef3b2d] text-white',
      border: 'border-2 border-[#ef3b2d]',
      bg: 'bg-white',
      desc: 'Imtihongacha to\'liq 1 oylik professional IELTS tayyorgarlik paketi.',
      features: [
        '30 kun barcha bo\'limlarga 100% cheksiz kirish',
        'Katta ekranda to\'liq 4 ko\'nikmali Mock Arena',
        'Cheksiz 3D Foxy Live AI Speaking suhbati',
        'Writing Task 1 & 2 chuqur mezonli AI tahlili',
        'QR-kodli rasmiy xalqaro Score Certificate',
        'VIP Telegram hamjamiyati va yangi testlar',
      ],
      btnText: '249 Stars Bilan Obuna Bo\'lish',
      btnColor: 'bg-[#ef3b2d] hover:bg-[#d62f22] text-white shadow-md',
      isPopular: true,
    },
  ];

  return (
    <section id="narx" className="py-16 md:py-28 font-nunito">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fde3dc] text-[#ef3b2d] font-black text-xs uppercase tracking-widest border border-[#ef3b2d]/20 shadow-xs">
            <Gift className="w-4 h-4" />
            <span>1 Haftalik Bepul Sovg'a & Telegram Stars Obuna</span>
          </div>
          <h2 className="font-unbounded font-black text-2xl sm:text-4xl text-[#10152b] tracking-tight">
            Yangi Kirgan Nomzodlarga <span className="text-[#ef3b2d]">1 Haftalik Bepul Sovg'a!</span>
          </h2>
          <p className="text-[#4a5068] text-xs sm:text-sm font-bold leading-relaxed max-w-2xl mx-auto">
            Hozir kiring va 7 kun davomida barcha bo'limlardan bepul foydalaning. Bir haftadan so'ng haftalik 49 Stars yoki oylik 249 Stars orqali a'zolikni davom ettirishingiz mumkin.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
          {pricingCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-[30px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative shadow-sm ${card.bg} ${card.border} ${
                card.isPopular ? 'md:-translate-y-2 shadow-xl' : ''
              }`}
            >
              {/* Badge */}
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap ${card.badgeColor}`}>
                {card.badge}
              </div>

              <div>
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  {card.id === 'gift' && <Gift className="w-6 h-6 text-emerald-600" />}
                  {card.id === 'weekly' && <Zap className="w-6 h-6 text-[#ff7a00]" />}
                  {card.id === 'monthly' && <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />}
                  <h3 className="font-unbounded font-black text-base text-[#10152b]">
                    {card.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="my-4 pb-4 border-b border-[#eadfc9]/60">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-unbounded font-black text-3xl sm:text-4xl text-[#10152b] tracking-tight">
                      {card.price}
                    </span>
                    <span className="text-xs text-[#7a7f95] font-bold">{card.subtitle}</span>
                  </div>
                  {card.id !== 'gift' && (
                    <span className="text-[11px] font-bold text-[#ff7a00] flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-[#ff7a00]" />
                      Telegram Stars orqali tezkor to'lov
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#4a5068] font-bold mb-6 leading-relaxed">
                  {card.desc}
                </p>

                {/* Features */}
                <ul className="space-y-3 pt-2">
                  {card.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-[#2a3048]">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        card.id === 'gift' ? 'bg-emerald-100 text-emerald-700' : card.isPopular ? 'bg-[#fde3dc] text-[#ef3b2d]' : 'bg-[#fff3e6] text-[#ff7a00]'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="mt-8 pt-5 border-t border-[#eadfc9]/60">
                <button
                  type="button"
                  onClick={() => onSubscribeClick?.(card.id)}
                  className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${card.btnColor}`}
                >
                  <span>{card.btnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#7a7f95] font-bold mt-8 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>7 kunlik bepul sinovda karta ma'lumotlari kiritilishi talab qilinmaydi. Xohlagan vaqtda Telegram orqali boshqarishingiz mumkin.</span>
        </div>

      </div>
    </section>
  );
};

export default PricingBlock;

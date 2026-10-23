import React from 'react';
import { Star, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { MOCK_DATA } from '../config/api';

interface ReviewsBlockProps {
  onStartClick?: () => void;
}

export const ReviewsBlock: React.FC<ReviewsBlockProps> = ({ onStartClick }) => {
  const { t } = useLanguage();
  const { reviews } = MOCK_DATA;

  return (
    <section id="sharhlar" className="py-16 md:py-24 bg-white/40 border-y border-[#eadfc9]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] font-bold text-xs uppercase tracking-widest mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{t.reviews.badge}</span>
          </div>
          <h2 className="font-unbounded font-extrabold text-2xl sm:text-4xl text-[#10152b] tracking-tight mb-4">
            {t.reviews.title}
          </h2>

          {/* Overall Rating Block */}
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-[#eadfc9] shadow-card-soft mt-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-unbounded font-bold text-base text-[#10152b]">[4.8]</span>
            <span className="text-xs font-bold text-[#7a7f95] uppercase tracking-wider">
              [00 000] {t.reviews.ratingSuffix}
            </span>
          </div>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 border border-[#eadfc9] shadow-card-soft hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: User info & Score badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#f3ead6] text-[#10152b] font-unbounded font-bold text-xs flex items-center justify-center border border-[#eadfc9]">
                      [P]
                    </div>
                    <div>
                      <h4 className="font-unbounded font-bold text-sm text-[#10152b]">
                        {review.author}
                      </h4>
                      <p className="text-xs text-[#7a7f95] font-medium">
                        {review.city}
                      </p>
                    </div>
                  </div>
                  <span className="inline-block bg-[#fde3dc] text-[#ef3b2d] font-unbounded font-bold text-xs px-2.5 py-1 rounded-full border border-[#ef3b2d]/20 whitespace-nowrap">
                    {t.reviews.scoreLabel}
                  </span>
                </div>

                {/* Star rating */}
                <div className="flex items-center text-amber-400 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[#4a5068] text-sm leading-relaxed italic">
                  "{t.reviews.placeholderText}"
                </p>
              </div>

              {/* Date Footer */}
              <div className="pt-4 border-t border-[#eadfc9]/60 mt-6 flex items-center justify-between text-xs text-[#7a7f95]">
                <span>Sana:</span>
                <span className="font-medium">{t.reviews.dateLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <a
            href="#narx"
            onClick={onStartClick}
            className="inline-flex items-center gap-3 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer"
          >
            <span>{t.reviews.btnStart}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
